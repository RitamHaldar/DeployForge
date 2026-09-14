import Docker from 'dockerode';
import path from 'path';
import fs from 'fs';
import tar from 'tar-fs';

export const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const BUILD_DIR = path.resolve('/tmp/builds');

if (!fs.existsSync(BUILD_DIR)) {
  fs.mkdirSync(BUILD_DIR, { recursive: true });
}

export function ensureDockerfile(targetPath: string) {
  const dockerfilePath = path.join(targetPath, 'Dockerfile');
  if (!fs.existsSync(dockerfilePath)) {
    const defaultDockerfile = `
      FROM node:20-alpine
      WORKDIR /app
      COPY package*.json ./
      RUN npm install
      COPY . .
      EXPOSE 3000
      CMD ["npm", "start"]
    `;
    fs.writeFileSync(dockerfilePath, defaultDockerfile.trim());
  }
}

