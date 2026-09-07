export type WorkloadStatus = 'CrashLoopBackOff' | 'Running' | 'Self-Healed' | 'Remediating';
export type WorkloadType = 'Deployments' | 'DaemonSets' | 'StatefulSets';

export interface WorkloadItem {
  id: string;
  name: string;
  subname: string;
  type: WorkloadType;
  namespace: string;
  status: WorkloadStatus;
  statusDetail?: string;
  replicasCurrent: number;
  replicasTarget: number;
  restarts: number;
  restartDetail?: string;
  cpuPercent: number;
  cpuCores: string;
  memoryPercent: number;
  memoryAmount: string;
  isRemediating?: boolean;
  lastRemediated?: string;
}

export interface RemediationEvent {
  id: string;
  iconType: 'rollback' | 'shield' | 'scale';
  title: string;
  timeAgo: string;
  targetPod: string;
  description: string;
  statusBadge: string;
  statusType: 'in-progress' | 'resolved';
  secondaryTag: string;
  timestamp: string;
}

export interface AnomalyFailureMode {
  id: string;
  label: string;
  eventsCount: number;
  avgFixTime: string;
  percentage: number;
  color: string;
  glowColor: string;
}

export interface ClusterStats {
  activeIncidents: number;
  meshHealth: number;
  mttrSeconds: number;
  mttrDeltaMs: number;
  autonomousActions24h: number;
  escalationsCount: number;
  podHealthPercent: number;
  podsHealthy: number;
  podsTotal: number;
}
