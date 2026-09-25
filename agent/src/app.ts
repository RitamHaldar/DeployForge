import express, { Request, Response } from "express"
import morgan from "morgan"
import fs from "node:fs/promises"
import path from "node:path"
const app=express();

app.use(morgan("combined"));
app.use(express.json());
const WORKSPACE_DIR = "/workspace";
app.get("/api/agent/health",(_req:Request,res:Response)=>{
    res.status(200).json({
        message:"Ai agent Running Healthy"
    });
});

app.get("/api/agent/ready",(_req:Request,res:Response)=>{
    res.status(200).json({
        message:"Ai agent Ready"
    });
})


app.get("/api/agent/listFiles", async (_req: Request, res: Response) => {
    const listFiles = async (dir: string, basedir: string): Promise<string[]> => {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        const fileList: string[] = [];
        for (const entry of entries) {
            const fullpath = path.join(dir, entry.name);
            const relativepath = path.relative(basedir, fullpath);

            const excludedir = ["node_modules", ".git", ".vscode", "dist", ""];

            if (excludedir.includes(entry.name)) continue;

            if (entry.isDirectory()) {
                fileList.push(relativepath + "/");
                const subFiles = await listFiles(fullpath, basedir);
                fileList.push(...subFiles);
            } else {
                fileList.push(relativepath);
            }
        }
        return fileList;
    };
    try {
        const files = await listFiles(WORKSPACE_DIR, WORKSPACE_DIR);
        res.status(200).json({
            message: "Files listed successfully",
            status: "success",
            data: files
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to list files",
            status: "error",
            data: error instanceof Error ? error.message : String(error)
        });
    }
});

export default app;