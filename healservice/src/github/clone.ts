import Docker from 'dockerode';
import path from 'path';
import fs from 'fs';
import { createDockerAgent } from '../utils/agent.js';

export const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const BUILD_DIR = path.resolve('/tmp/builds');

if (!fs.existsSync(BUILD_DIR)) {
  fs.mkdirSync(BUILD_DIR, { recursive: true });
}

function cleanDockerfile(rawContent: string): string {
  // 1. Try to extract between ```dockerfile and ``` (or unclosed at end of text)
  const match = rawContent.match(/```(?:dockerfile)?\s*([\s\S]*?)(?:```|$)/i);
  let content = match && match[1] ? match[1] : rawContent;

  // 2. Strip any remaining markdown fence tags (```dockerfile or ```)
  content = content
    .replace(/^```[a-zA-Z]*\r?\n?/gm, '')
    .replace(/^```\s*$/gm, '')
    .trim();

  // 3. Ensure it starts from the first valid instruction or comment
  const fromIndex = content.search(/^\s*(FROM|ARG|#)/im);
  if (fromIndex !== -1) {
    content = content.slice(fromIndex).trim();
  }

  return content;
}

export async function ensureDockerfile(targetPath: string) {
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }
  const dockerfilePath = path.join(targetPath, 'Dockerfile');
  if (fs.existsSync(dockerfilePath)) {
    return;
  }

  const fallbackDockerfile = [
    'FROM node:20-alpine',
    'WORKDIR /app',
    'COPY package*.json ./',
    'RUN npm install',
    'COPY . .',
    'EXPOSE 3000',
    'CMD ["npm", "start"]'
  ].join('\n');

  try {
    const repoAgent = createDockerAgent(targetPath);
    const dockerfile = await repoAgent.invoke({
      messages: [
        {
          role: "user",
          content: "Inspect the repository and generate a production-ready Dockerfile."
        }
      ]
    }, { recursionLimit: 25 });

    const messages = dockerfile?.messages;
    const lastMessage = messages?.[messages.length - 1];
    let rawContent = "";
    if (typeof lastMessage?.content === "string") {
      rawContent = lastMessage.content;
    } else if (Array.isArray(lastMessage?.content)) {
      rawContent = lastMessage.content
        .map((part: any) => (typeof part === "string" ? part : part?.text || ""))
        .join("\n");
    }

    let extracted = cleanDockerfile(rawContent);

    // Sanity check: If package.json exists, verify if "build" script is present.
    // If not present, remove any hallucinatory "RUN npm run build" to prevent non-zero exit code 1.
    const pkgPath = path.join(targetPath, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        const hasBuildScript = Boolean(pkg.scripts && pkg.scripts.build);
        if (!hasBuildScript && extracted.includes('npm run build')) {
          console.warn("[DeployForge] Repository package.json lacks a 'build' script. Removing 'RUN npm run build' from Dockerfile.");
          extracted = extracted.replace(/^\s*RUN\s+npm\s+run\s+build\s*$/gm, '# No build script defined in package.json');
        }
      } catch (pkgErr) {
        console.warn("[DeployForge] Could not parse package.json for build script validation:", pkgErr);
      }
    }

    if (extracted && /^\s*FROM\s+/im.test(extracted)) {
      console.log(`[DeployForge] Generated Dockerfile for ${targetPath}:\n${extracted}`);
      fs.writeFileSync(dockerfilePath, extracted);
    } else {
      console.warn("Agent response did not contain a valid Dockerfile (missing FROM), using fallback.");
      console.log(`[DeployForge] Using fallback Dockerfile:\n${fallbackDockerfile}`);
      fs.writeFileSync(dockerfilePath, fallbackDockerfile);
    }
  } catch (error) {
    console.error("Failed to generate Dockerfile using agent, falling back to default:", error);
    fs.writeFileSync(dockerfilePath, fallbackDockerfile);
  }
}
