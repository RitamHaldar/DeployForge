import { tool } from "langchain/tools";
import * as z from "zod";
import path from 'path';
import fs from "node:fs/promises";

const BUILD_DIR = path.resolve('/tmp/builds');

const listFiles = async (dir: string, basedir: string): Promise<string[]> => {
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        const fileList: string[] = [];
        for (const entry of entries) {
            const fullpath = path.join(dir, entry.name);
            const relativepath = path.relative(basedir, fullpath);

            const excludedir = ["node_modules", ".git", ".vscode", "dist", "build", "coverage", ""];

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
    } catch {
        return [];
    }
};

const readfile = async (basedir: string, filepath: string): Promise<string> => {
    const fullpath = path.resolve(basedir, filepath);
    if (!fullpath.startsWith(path.resolve(basedir))) {
        throw new Error("Access denied: path traversal");
    }
    const stat = await fs.stat(fullpath);
    // If file is large (e.g. package-lock.json), read only first 8KB to avoid context overflow
    if (stat.size > 8000) {
        const fileHandle = await fs.open(fullpath, 'r');
        try {
            const buffer = Buffer.alloc(4096);
            const { bytesRead } = await fileHandle.read(buffer, 0, 4096, 0);
            return buffer.toString('utf-8', 0, bytesRead) + '\n... [truncated remaining content for brevity]';
        } finally {
            await fileHandle.close();
        }
    }
    return fs.readFile(fullpath, "utf-8");
};

export const createRepoTools = (repoDir: string) => {
    const fileListTool = tool(
        async () => {
            const fileList = await listFiles(repoDir, repoDir);
            return JSON.stringify(fileList);
        },
        {
            name: "fileListTool",
            description: "List all the files in the project repository",
            schema: z.object({})
        }
    );

    const readfileTool = tool(
        async ({ filepath }: { filepath: string }) => {
            try {
                const fileContent = await readfile(repoDir, filepath);
                return JSON.stringify(fileContent);
            } catch (err: any) {
                return JSON.stringify({ error: err?.message || `Failed to read ${filepath}` });
            }
        },
        {
            name: "readFileTool",
            description: "Read the content of a file in the project repository",
            schema: z.object({
                filepath: z.string().describe("The relative path to the file to read obtained from fileListTool")
            })
        }
    );

    return [fileListTool, readfileTool];
};

export const [fileListTool, readfileTool] = createRepoTools(BUILD_DIR);