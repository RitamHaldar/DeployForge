import express, { Request, Response } from "express"
import morgan from "morgan"
import fs from "node:fs/promises"
import path from "node:path"
const app = express();

app.use(morgan("combined"));
app.use(express.json());
const WORKSPACE_DIR = "/workspace";
app.get("/api/agent/health", (_req: Request, res: Response) => {
    res.status(200).json({
        message: "Ai agent Running Healthy"
    });
});

app.get("/api/agent/ready", (_req: Request, res: Response) => {
    res.status(200).json({
        message: "Ai agent Ready"
    });
})


app.get("/api/agent/listFiles", async (_req: Request, res: Response) => {
    const listFiles = async (dir: string, basedir: string): Promise<string[]> => {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        const fileList: string[] = [];
        for (const entry of entries) {
            const fullpath = path.join(dir, entry.name);
            const relativepath = path.relative(basedir, fullpath);

            const excludedir = [
                "node_modules",
                "bower_components",
                "vendor",
                "packages",
                "Pods",
                ".git",
                ".svn",
                ".hg",
                ".vscode",
                ".idea",
                ".fleet",
                ".vs",
                "dist",
                "build",
                "out",
                "target",
                "bin",
                "obj",
                "release",
                "debug",
                ".next",
                ".nuxt",
                ".output",
                ".vercel",
                ".netlify",
                ".svelte-kit",
                ".angular",
                ".astro",
                ".expo",
                ".turbo",
                ".parcel-cache",
                ".cache",
                ".pytest_cache",
                ".mypy_cache",
                ".ruff_cache",
                ".gradle",
                ".maven",
                "__pycache__",
                ".sass-cache",
                "tmp",
                "temp",
                "coverage",
                ".nyc_output",
                "test-results",
                "playwright-report",
                ".venv",
                "venv",
                "env",
                "virtualenv",
                "logs",
                ".DS_Store",
                "Thumbs.db",
                ".terraform",
                ".serverless",
                ".docusaurus",
                "storybook-static"
            ];

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

app.post("/api/agent/readfile", async (req: Request, res: Response) => {
    const { files } = req.body;
    if (!files || typeof files !== "string") {
        return res.status(400).json({
            message: "Filename is required and must be a comma-separated string",
            status: "error",
            data: null
        });
    }
    const fileslist: string[] = files.split(",");
    const result = await Promise.all(
        fileslist.map(async (file: string) => {
            try {
                const fullpath = path.join(WORKSPACE_DIR, file.trim());
                const content = await fs.readFile(fullpath, "utf8");
                return {
                    [file.trim().replace(WORKSPACE_DIR, "")]: content
                };
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                return {
                    [file.trim().replace(WORKSPACE_DIR, "")]: `Error reading file: ${errorMessage}`
                };
            }
        })
    );
    res.status(200).json({
        message: "Files read successfully",
        status: "success",
        data: result
    });
})


app.patch("/api/agent/updateFile", async (req: Request, res: Response) => {
    const updates = req.body.updates;
    if (!updates || !Array.isArray(updates)) {
        return res.status(400).json({
            message: "Updates is required and must be an array",
            status: "error",
            data: null
        });
    }
    const result = await Promise.all(
        updates.map(async (update: { file: string; content: string }) => {
            const { file, content } = update;
            const filePath = path.join(WORKSPACE_DIR, file || "");
            try {
                await fs.mkdir(path.dirname(filePath), { recursive: true });
                await fs.writeFile(filePath, content, "utf8");
                return {
                    [filePath]: "File updated successfully"
                };
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                return {
                    [filePath]: `Error updating file: ${errorMessage}`
                };
            }
        })
    );
    res.status(200).json({
        message: "Files updated successfully",
        status: "success",
        data: result
    });
});

export default app;