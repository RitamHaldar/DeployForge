import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import tar from 'tar-fs';
import { simpleGit } from 'simple-git';
import { docker, ensureDockerfile } from '../github/clone.js';
const BUILD_DIR = path.resolve('/tmp/builds');
export async function DeployDocker(req: Request, res: Response){
    const { repoUrl, token, repoName } = req.body;
    const buildId = `${repoName.toLowerCase()}-${Date.now()}`;
    const workspacePath = path.join(BUILD_DIR, buildId);
    try {
    const authenticatedUrl = repoUrl.replace('https://', `https://${token}@`);
    const git = simpleGit();
    await git.clone(authenticatedUrl, workspacePath, ['--depth', '1']);
    ensureDockerfile(workspacePath);
    const tarStream = tar.pack(workspacePath);
    const imageName = `sandbox-${buildId}`;
    const buildStream = await docker.buildImage(tarStream as unknown as NodeJS.ReadableStream, {
      t: imageName,
    });
    await new Promise((resolve, reject) => {
      docker.modem.followProgress(buildStream, (err, output) => {
        if (err) return reject(err);
        resolve(output);
      });
    });
    const container = await docker.createContainer({
      Image: imageName,
      name: buildId,
      Tty: true,
      ExposedPorts: { '3000/tcp': {} },
      HostConfig: {
        PortBindings: {
          '3000/tcp': [{ HostPort: '0' }],
        },
        Memory: 512 * 1024 * 1024,
        NanoCpus: 1000000000,
      },
    });

    await container.start();
    const data = await container.inspect();
    const assignedPort = data.NetworkSettings.Ports['3000/tcp']?.[0]?.HostPort;
    fs.rmSync(workspacePath, { recursive: true, force: true });
    return res.status(200).json({
      success: true,
      containerId: container.id,
      assignedPort,
      status: 'running',
    });
  } catch (error: any) {
    if (fs.existsSync(workspacePath)) {
      fs.rmSync(workspacePath, { recursive: true, force: true });
    }
    res.status(500).json({ error: error.message });
  }
}