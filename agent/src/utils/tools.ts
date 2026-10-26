import * as z from "zod";
import axios from "axios";
import { tool } from "langchain";

const getDefaultAgentUrl = (url?: string) => {
    return (url && url.trim().length > 0)
        ? url.replace(/\/$/, '')
        : (process.env.AGENT_URL || "http://localhost:4000");
};

const getHealServiceUrl = () => {
    return process.env.HEAL_SERVICE_URL || (process.env.NODE_ENV === "production" ? "http://heal-service" : "http://localhost");
};

export const fileListTool = tool(
    async ({ url }: { url?: string }) => {
        try {
            const baseUrl = getDefaultAgentUrl(url);
            const { data } = await axios.get(`${baseUrl}/api/agent/listFiles`);
            return data;
        } catch (error: any) {
            return {
                error: error?.response?.data?.message || error.message || "Failed to list workspace files"
            };
        }
    },
    {
        name: "fileListTool",
        description: "List the files and directories in the workspace directory path.",
        schema: z.object({
            url: z.string().optional().describe("Optional base url to the agent (defaults to local agent).")
        })
    }
);

export const readFileTool = tool(
    async ({ files, url }: { files: string; url?: string }) => {
        try {
            const baseUrl = getDefaultAgentUrl(url);
            const { data } = await axios.post(`${baseUrl}/api/agent/readfile`, {
                files
            });
            return data;
        } catch (error: any) {
            return {
                error: error?.response?.data?.message || error.message || "Failed to read files"
            };
        }
    },
    {
        name: "readFileTool",
        description: "Read the content of one or more files in the workspace (comma-separated list, e.g. 'package.json,src/app.ts').",
        schema: z.object({
            files: z.string().describe("Comma-separated list of relative file paths to read."),
            url: z.string().optional().describe("Optional base url to the agent.")
        })
    }
);

// Backward compatibility alias
export const readfileTool = readFileTool;

export const updateFileTool = tool(
    async ({ updates, url }: { updates: Array<{ file: string; content: string }>; url?: string }) => {
        try {
            const baseUrl = getDefaultAgentUrl(url);
            const { data } = await axios.patch(`${baseUrl}/api/agent/updateFile`, {
                updates
            });
            return data;
        } catch (error: any) {
            return {
                error: error?.response?.data?.message || error.message || "Failed to update files"
            };
        }
    },
    {
        name: "updateFileTool",
        description: "Update the content of files in the workspace. Provide file paths and full updated content.",
        schema: z.object({
            updates: z.array(z.object({
                file: z.string().describe("The relative path to the file to update."),
                content: z.string().describe("The new content of the file.")
            })).describe("The updates to be made to the files."),
            url: z.string().optional().describe("Optional base url to the agent.")
        })
    }
);

export const getNodesTool = tool(
    async () => {
        try {
            const healBase = getHealServiceUrl();
            const { data } = await axios.get(`${healBase}/api/k8s/nodes`);
            return data;
        } catch (error: any) {
            return {
                error: error?.response?.data?.message || error.message || "Failed to fetch cluster nodes/pods"
            };
        }
    },
    {
        name: "getNodesTool",
        description: "List the pods and nodes in the cluster. Use this to discover available pods, their status, and names.",
    }
);

export const getLogsTool = tool(
    async ({ podname }: { podname: string }) => {
        try {
            const healBase = getHealServiceUrl();
            // In healservice, route is /get-logs with query parameter 'podname'
            const { data } = await axios.get(`${healBase}/api/k8s/get-logs`, {
                params: { podname }
            });
            return data;
        } catch (error: any) {
            return {
                error: error?.response?.data?.message || error.message || `Failed to fetch logs for pod ${podname}`
            };
        }
    },
    {
        name: "getLogsTool",
        description: "Get the recent logs of the given pod name. Use this to inspect errors, crash stack traces, and failure messages in the pod.",
        schema: z.object({
            podname: z.string().describe("The name of the pod to fetch logs from.")
        })
    }
);