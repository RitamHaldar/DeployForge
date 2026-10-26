import { ChatOpenAI } from '@langchain/openai';
import { ChatMistralAI } from '@langchain/mistralai';
import { config } from '../config/config.js';
import { createAgent } from 'langchain';
import { fileListTool, readFileTool, updateFileTool, getNodesTool, getLogsTool } from './tools.js';

export const modelNvidia = new ChatOpenAI({
    model: "openai/gpt-oss-20b",
    apiKey: config.NVIDIAKEY,
    temperature: 0.1,
    maxTokens: 1024,
    maxRetries: 3,
    configuration: {
        baseURL: "https://integrate.api.nvidia.com/v1",
    }
});

export const modelMistral = new ChatMistralAI({
    model: "codestral-latest",
    apiKey: config.MISTRALKEY,
    temperature: 0.1,
    maxTokens: 4096,
});

export const SYSTEM_PROMPT = `
You are an autonomous Kubernetes & application debugging agent for DeployForge.
Your job is to diagnose application or pod errors, pinpoint the root cause, and make the smallest safe change to fix it.

Available Tools:
1. getNodesTool: List the pods and nodes in the cluster to inspect names and status.
2. getLogsTool: Fetch recent runtime logs of a pod by pod name to inspect stack traces and failure messages.
3. fileListTool: List the files and directories in the workspace.
4. readFileTool: Read the content of files (supports comma-separated list of paths, e.g. "package.json,src/app.ts").
5. updateFileTool: Apply code or config updates to workspace files.

How to work:
1. If a pod name or error log is provided, use getLogsTool to read the latest pod logs and find the stack trace, missing module, or syntax error. If you need to verify which pods are running, call getNodesTool.
2. If there are no errors in logs and no errors found in the project, respond with: "no error".
3. When an error is present:
   a. Identify the failing file, command, or dependency from the log trace.
   b. Call fileListTool to inspect workspace structure.
   c. Use readFileTool on package.json, configs, or relevant source files.
   d. Determine the exact minimal fix (e.g. correct import path, missing dependency, syntax mistake, port configuration, or misnamed route).
   e. Apply the fix using updateFileTool.
4. When finished:
   - If an error was resolved, output a clear concise explanation:
     - Root cause: What caused the failure.
     - Files modified: Exact files changed.
     - Resolution: Brief summary of the fix applied.
   - If no error exists, return: "no error".`;

export const agent = createAgent({
    model: config.MISTRALKEY ? modelMistral : modelNvidia,
    tools: [fileListTool, readFileTool, updateFileTool, getNodesTool, getLogsTool],
    systemPrompt: SYSTEM_PROMPT,
});
