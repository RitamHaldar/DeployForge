import { GetLogs, getPod } from "../k8s/pod.js";
import {Request,Response} from "express"
import path from 'path';
import fs from 'fs';
import tar from 'tar-fs';
import { simpleGit } from 'simple-git';
import { docker, ensureDockerfile } from '../github/clone.js';
import { createPod } from '../k8s/pod.js';
import { AuthRequest } from "../middleware/user.middleware.js";
import { userModel } from "../models/user.model.js";
import { v4 as uuidv4 } from 'uuid';
import { CreateService } from "../k8s/service.js";
const BUILD_DIR = path.resolve('/tmp/builds');
export async function getNodesController(req:Request,res:Response):Promise<object>{
    try{
        const nodes=await getPod();
        return res.status(200).json({message:"nodes fetched successfully",nodes});
    }catch(err){
        console.log(" error in fetching nodes ",err);
        return res.status(500).json({message:"error in fetching nodes",err:err});
    }
}

export async function getLogsController(req: Request, res: Response):Promise<object> {
    try {
        const { podname } = req.query;

        if (!podname || typeof podname !== "string") {
            return res.status(400).json({ message: "podname query parameter is required and must be a string" });
        }

        const logs = await GetLogs(podname);
        return res.status(200).json({ message: "logs fetched successfully", logs });
    } catch (e) {
        console.log("error in fetching logs", e);
        return res.status(500).json({ message: "error in fetching logs", err: e });
    }
}

export async function DeployDocker(req: AuthRequest, res: Response) {
    const user = req.user;
    if (!user?.id) {
        return res.status(401).json({ error: "Unauthorized: User not authenticated" });
    }

    const token = await userModel.findById(user.id);
    if (!token?.GitHubAccessToken) {
        return res.status(401).json({ error: "GitHub access token not found for user. Please reconnect your GitHub account." });
    }

    const repoUrl = req.body.repoUrl || req.body.payload?.repoUrl;
    const repoName = req.body.repoName || req.body.payload?.repoName;
    const folderpath = req.body.folderpath || req.body.payload?.folderpath;

    if (!repoUrl || !repoName) {
        return res.status(400).json({ error: "Both repoUrl and repoName are required for deployment" });
    }

    if (!fs.existsSync(BUILD_DIR)) {
        fs.mkdirSync(BUILD_DIR, { recursive: true });
    }

    const sanitizedRepoName = repoName
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 16) || 'repo';
    const buildId = uuidv4();
    const workspacePath = path.join(BUILD_DIR, buildId);

    try {

        const authenticatedUrl = repoUrl.replace('https://', `https://${token.GitHubAccessToken}@`);
        const git = simpleGit();
        await git.clone(authenticatedUrl, workspacePath, ['--depth', '1']);

        const rawFolder = typeof folderpath === 'string' ? folderpath.trim() : '';
        const cleanFolder = rawFolder.replace(/^(\.[\/\\]+|[\/\\]+)/, '').replace(/[\/\\]+$/, '');
        const targetDir = cleanFolder ? path.resolve(workspacePath, cleanFolder) : workspacePath;

        if (!targetDir.startsWith(workspacePath)) {
            return res.status(400).json({ error: "Invalid folder path: path traversal detected" });
        }

        let buildContext = targetDir;
        if (cleanFolder && !fs.existsSync(buildContext)) {
            try {
                const entries = fs.readdirSync(workspacePath);
                const match = entries.find((e) => e.toLowerCase() === cleanFolder.toLowerCase());
                if (match) {
                    buildContext = path.join(workspacePath, match);
                } else {
                    fs.mkdirSync(buildContext, { recursive: true });
                }
            } catch {
                fs.mkdirSync(buildContext, { recursive: true });
            }
        }
        ensureDockerfile(buildContext);
        const tarStream = tar.pack(buildContext);
        const imageName = `sandbox-${buildId}`;
        const buildStream = await docker.buildImage(tarStream as unknown as NodeJS.ReadableStream, {
            t: imageName,
        });

        await new Promise((resolve, reject) => {
            docker.modem.followProgress(buildStream, (err, output) => {
                if (err) return reject(err);
                resolve(output);
            });
        });

        const pod = await createPod(buildId, imageName);
        const service = await CreateService(buildId);
        const containerId = (pod as any)?.metadata?.name ?? (pod as any)?.body?.metadata?.name ?? `kubeheal-${buildId}`;
        const status = (pod as any)?.status ?? (pod as any)?.body?.status ?? 'Pending';

        return res.status(200).json({
            success: true,
            containerId,
            status,
            message: `Deployment pod ${containerId} provisioned successfully`,
            previewurl: `http://${buildId}.preview.localhost`,
            agenturl: `http://${buildId}.agent.localhost`
        });
    } catch (error: any) {
        console.error("Error in DeployDocker:", error);
        if (fs.existsSync(workspacePath)) {
            try {
                fs.rmSync(workspacePath, { recursive: true, force: true });
            } catch (cleanupErr) {
                console.error("Failed to clean up build directory:", cleanupErr);
            }
        }
        return res.status(500).json({ error: error.message || "Internal server error during deployment" });
    }
}