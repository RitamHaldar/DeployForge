export type DeploymentTab = 'preview' | 'infrastructure' | 'logs' | 'health';

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export type ViewLayout = 'split' | 'preview-focus' | 'console-focus';

export type InspectorTab = 'infrastructure' | 'logs' | 'health';

export interface DeploymentRecord {
  id: string;
  previewurl: string;
  agenturl?: string;
  containerId: string;
  status: string | { phase?: string; [key: string]: any };
  message?: string;
  repoName: string;
  repoUrl: string;
  folderpath?: string;
  branch?: string;
  commitHash?: string;
  deployedAt: string;
  clusterIp?: string;
  port?: number;
  node?: string;
}

export interface DeploymentLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'build' | 'k8s';
  message: string;
}

export interface ProbeEvent {
  id: string;
  timestamp: string;
  type: 'Normal' | 'Warning';
  reason: string;
  message: string;
}
