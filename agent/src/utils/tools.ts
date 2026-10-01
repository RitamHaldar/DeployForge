import * as z from "zod";
import axios from "axios";
import { tool } from "langchain";

export const fileListTool = tool(
    async({url}: {url:string}) => {
        const { data } = await axios.get(`${url}/api/agent/listFiles`);
        return data;
    },
    {
        name: "fileListTool",
        description: "List the files and directories in the given directory path.",
        schema: z.object({
            url: z.string().describe("The url to the agent conataining .agent in the link.")
        })
    }
)

export const readfileTool = tool(
    async({url}: {url:string}) => {
        const { data } = await axios.get(`${url}/api/agent/readfile`);
        return data;
    },
    {
        name: "readTool",
        description: "Read the content of a file in the given directory path.",
        schema: z.object({
            url: z.string().describe("The url to the agent conataining .agent in the link.")
        })
    }
)

export const updateFileTool = tool(
    async ({ url, updates }: { url: string; updates: Array<{ file: string; content: string }> }) => {
        const { data } = await axios.patch(`${url}/api/agent/updateFile`, {
            updates
        });
        return data;
    },
    {
        name: "updateFileTool",
        description: "Update the content of a file in the given directory path.",
        schema: z.object({
            url: z.string().describe("The url to the agent conataining .agent in the link."),
            updates: z.array(z.object({
                file: z.string().describe("The path to the file to update."),
                content: z.string().describe("The new content of the file.")
            })).describe("The updates to be made to the file.")
        })
    }
)
