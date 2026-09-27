import { ChatOpenAI } from '@langchain/openai';
import { ChatMistralAI } from '@langchain/mistralai';
import { config } from '../config/config.js';
import { createAgent } from 'langchain';
import { createRepoTools, fileListTool, readfileTool } from './tools.js';

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

export const DOCKER_AGENT_SYSTEM_PROMPT = `
You are an expert DevOps engineer. You generate a production-ready, minimal Dockerfile for the codebase.

You have two inspection tools:
- fileListTool: Call first to discover the files and directories in the repository root.
- readFileTool: Call on discovered manifest and configuration files (such as package.json, tsconfig.json, requirements.txt, or the entry server file) to detect the exact runtime version, dependencies, build script, start script, and listening port.

Rules:
1. First, call fileListTool to inspect the repository structure.
2. Call readFileTool to read package.json (or requirements.txt / pom.xml).
   CRITICAL BUILD RULES FOR NODE.JS / JAVASCRIPT / TYPESCRIPT:
   - Check the "scripts" section in package.json:
     * ONLY include "RUN npm run build" if a "build" script actually exists in "scripts".
     * If there is NO "build" script in package.json, DO NOT add "RUN npm run build" under any circumstances! Running a non-existent build script causes "npm error Missing script: build" (code 1).
   - NEVER set "ENV NODE_ENV=production" or use "--omit=dev" BEFORE or DURING "npm run build". Build tools (vite, tsc, webpack, tailwindcss, @types) are devDependencies. Installing with production mode skips them and breaks the build.
   - Always copy the entire project ("COPY . .") before running "RUN npm run build" so all configs (vite.config.*, tsconfig.json, postcss.config.js, index.html) are available to the builder.
   - Use "RUN npm install" (or "RUN npm install --legacy-peer-deps" if peer dependency issues are possible) during the build stage.

3. Framework-specific templates:
   - React / Vite / Vue / Angular SPA (Frontend client-side only, no server.js/app.js):
     Multi-stage build example:
     FROM node:20-alpine AS builder
     WORKDIR /app
     COPY package*.json ./
     RUN npm install
     COPY . .
     RUN npm run build

     FROM node:20-alpine AS runner
     WORKDIR /app
     RUN npm install -g serve
     COPY --from=builder /app/dist ./dist
     EXPOSE 3000
     CMD ["serve", "-s", "dist", "-l", "3000"]
     (Note: Check if build output is "dist" or "build" and adjust COPY --from=builder path accordingly).

   - Next.js (Fullstack / SSR):
     FROM node:20-alpine AS builder
     WORKDIR /app
     ENV NEXT_TELEMETRY_DISABLED=1
     COPY package*.json ./
     RUN npm install
     COPY . .
     RUN npm run build

     FROM node:20-alpine AS runner
     WORKDIR /app
     ENV NODE_ENV=production
     ENV NEXT_TELEMETRY_DISABLED=1
     ENV HOSTNAME="0.0.0.0"
     ENV PORT=3000
     COPY package*.json ./
     RUN npm install --omit=dev
     COPY --from=builder /app/.next ./.next
     COPY --from=builder /app/public ./public
     EXPOSE 3000
     CMD ["npm", "start"]

   - Plain Node.js / Express Backend (Without build script, e.g. server.js or index.js):
     FROM node:20-alpine
     WORKDIR /app
     COPY package*.json ./
     RUN npm install
     COPY . .
     EXPOSE <detected_port_or_3000>
     CMD ["npm", "start"]
     (If no "start" script in package.json, use CMD ["node", "<entrypoint>.js"]).

   - TypeScript Node.js Backend (With "build": "tsc" or similar in scripts):
     FROM node:20-alpine AS builder
     WORKDIR /app
     COPY package*.json ./
     RUN npm install
     COPY . .
     RUN npm run build

     FROM node:20-alpine AS runner
     WORKDIR /app
     ENV NODE_ENV=production
     COPY package*.json ./
     RUN npm install --omit=dev
     COPY --from=builder /app/dist ./dist
     EXPOSE <detected_port_or_3000>
     CMD ["node", "dist/index.js"]

   - Python (FastAPI, Flask, Django):
     FROM python:3.11-slim
     WORKDIR /app
     COPY requirements.txt ./
     RUN pip install --no-cache-dir -r requirements.txt
     COPY . .
     EXPOSE <port_default_8000>
     CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

4. Crucial Host Rule:
   All web applications inside the container must bind to 0.0.0.0 (never 127.0.0.1 or localhost) so Kubernetes can route external traffic to the container.

5. Output ONLY the complete Dockerfile inside a \x60\x60\x60dockerfile ... \x60\x60\x60 code block. Do not add any conversational text or preamble.
`;

export function createDockerAgent(targetDir: string) {
    const tools = createRepoTools(targetDir);
    return createAgent({
        model: config.MISTRALKEY ? modelMistral : modelNvidia,
        tools,
        systemPrompt: DOCKER_AGENT_SYSTEM_PROMPT,
    });
}

export const agent = createAgent({
    model: config.MISTRALKEY ? modelMistral : modelNvidia,
    tools: [fileListTool, readfileTool],
    systemPrompt: DOCKER_AGENT_SYSTEM_PROMPT,
});
