export type SimulationPhase = 'healthy' | 'degraded' | 'isolating' | 'verifying' | 'recovered';

export interface ReplicaState {
  id: string;
  name: string;
  region: string;
  ping: string;
  load: string;
  status: 'healthy' | 'degraded' | 'provisioning' | 'verifying';
  actionState: string;
}

export interface TelemetryService {
  id: string;
  name: string;
  role: string;
  cpu: string;
  mem: string;
  uptime: string;
  rpsOrIops: string;
  latencyOrLag: string;
  status: 'healthy' | 'degraded' | 'recovering';
}

export interface SimulationLog {
  timestamp: string;
  type: 'info' | 'alert' | 'healing' | 'verify' | 'resolved';
  message: string;
}
