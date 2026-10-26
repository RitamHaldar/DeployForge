import { agent } from "../utils/agent.js";
import { Request, Response } from "express";

export async function FixerrorInCode(req: Request, res: Response) {
    try {
        const { podname, prompt: customPrompt, url, errorLog } = req.body || {};

        let userInstruction = "Inspect the workspace files and cluster pod logs to find and fix any errors.";
        if (podname) {
            userInstruction += `\nTarget Pod Name: "${podname}". Use getLogsTool with podname: "${podname}" to inspect runtime logs and crash errors.`;
        }
        if (errorLog) {
            userInstruction += `\nReported Error Log:\n${errorLog}`;
        }
        if (customPrompt) {
            userInstruction += `\nUser Specific Notes:\n${customPrompt}`;
        }
        if (url) {
            userInstruction += `\nAgent URL context: ${url}`;
        }

        userInstruction += "\nIf everything is working and no errors are found in the pod or workspace, respond with: 'no error'. If you find an error, use updateFileTool to fix it, and describe what was fixed.";

        const result = await agent.invoke({
            messages: [
                {
                    role: "user",
                    content: userInstruction,
                },
            ],
        });

        const messages = result.messages || [];
        const lastMessage = messages[messages.length - 1];

        let contentStr = "";
        if (!lastMessage) {
            contentStr = "No response from agent";
        } else if (typeof lastMessage.content === "string") {
            contentStr = lastMessage.content;
        } else if (Array.isArray(lastMessage.content)) {
            contentStr = lastMessage.content
                .map((part: any) => (typeof part === "string" ? part : part?.text || ""))
                .join("\n");
        } else {
            contentStr = String(lastMessage.content);
        }

        const normalized = contentStr.trim().toLowerCase();
        const isNoError =
            normalized === "no error" ||
            normalized.startsWith("no error") ||
            normalized.includes("'no error'") ||
            normalized.includes('"no error"');

        if (isNoError) {
            return res.status(200).json({
                success: true,
                fixed: false,
                message: "No error found. System is healthy.",
                details: contentStr,
                podname
            });
        } else {
            return res.status(200).json({
                success: true,
                fixed: true,
                message: "Error found and resolved",
                result: contentStr,
                podname
            });
        }
    } catch (error: any) {
        console.error("Error in FixerrorInCode controller:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to run agent diagnostic",
            error: error instanceof Error ? error.message : String(error)
        });
    }
}