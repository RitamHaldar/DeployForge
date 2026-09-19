import { GetLogs, getPod } from "../k8s/pod.js";
import path from 'path';
import fs from 'fs';
import tar from 'tar-fs';
import { simpleGit } from 'simple-git';
import { docker, ensureDockerfile } from '../github/clone.js';
import { createPod } from '../k8s/pod.js';
import { userModel } from "../models/user.model.js";
const BUILD_DIR = path.resolve('/tmp/builds');
export async function getNodesController(req, res) {
    try {
        const nodes = await getPod();
        return res.status(200).json({ message: "nodes fetched successfully", nodes });
    }
    catch (err) {
        console.log(" error in fetching nodes ", err);
        return res.status(500).json({ message: "error in fetching nodes", err: err });
    }
}
export async function getLogsController(req, res) {
    try {
        const { podname } = req.query;
        if (!podname || typeof podname !== "string") {
            return res.status(400).json({ message: "podname query parameter is required and must be a string" });
        }
        const logs = await GetLogs(podname);
        return res.status(200).json({ message: "logs fetched successfully", logs });
    }
    catch (e) {
        console.log("error in fetching logs", e);
        return res.status(500).json({ message: "error in fetching logs", err: e });
    }
}
export async function DeployDocker(req, res) {
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
        .slice(0, 30) || 'repo';
    const buildId = `${sanitizedRepoName}-${Date.now()}`;
    const workspacePath = path.join(BUILD_DIR, buildId);
    try {
        const authenticatedUrl = repoUrl.replace('https://', `https://${token.GitHubAccessToken}@`);
        const git = simpleGit();
        await git.clone(authenticatedUrl, workspacePath, ['--depth', '1']);
        ensureDockerfile(workspacePath);
        const tarStream = tar.pack(workspacePath);
        const imageName = `sandbox-${buildId}`;
        const buildStream = await docker.buildImage(tarStream, {
            t: imageName,
        });
        await new Promise((resolve, reject) => {
            docker.modem.followProgress(buildStream, (err, output) => {
                if (err)
                    return reject(err);
                resolve(output);
            });
        });
        const pod = await createPod(buildId, imageName);
        const containerId = pod?.metadata?.name ?? pod?.body?.metadata?.name ?? `kubeheal-${buildId}`;
        const status = pod?.status ?? pod?.body?.status ?? 'Pending';
        return res.status(200).json({
            success: true,
            containerId,
            status,
            message: `Deployment pod ${containerId} provisioned successfully`,
        });
    }
    catch (error) {
        console.error("Error in DeployDocker:", error);
        if (fs.existsSync(workspacePath)) {
            try {
                fs.rmSync(workspacePath, { recursive: true, force: true });
            }
            catch (cleanupErr) {
                console.error("Failed to clean up build directory:", cleanupErr);
            }
        }
        return res.status(500).json({ error: error.message || "Internal server error during deployment" });
    }
}
