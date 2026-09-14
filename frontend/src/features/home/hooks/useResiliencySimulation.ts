import { useState, useEffect, useCallback, useRef } from 'react';
import type { SimulationPhase, ReplicaState, SimulationLog } from '../types';

export function useResiliencySimulation() {
  const [phase, setPhase] = useState<SimulationPhase>('healthy');
  const [isRunning, setIsRunning] = useState(false);
  const [recoveryMetric, setRecoveryMetric] = useState('Recovered in 3.8s');
  
  const getTimestamp = () => {
    const d = new Date();
    return d.toTimeString().split(' ')[0] + ' UTC';
  };

  const [currentLog, setCurrentLog] = useState<SimulationLog>({
    timestamp: getTimestamp(),
    type: 'info',
    message: 'Autonomous observer verified all 3/3 worker health tokens intact.'
  });

  const [replicas, setReplicas] = useState<ReplicaState[]>([
    {
      id: 'rep-a',
      name: 'instance-worker-01',
      region: 'us-east-1a',
      ping: '12ms (p99)',
      load: '34%',
      status: 'healthy',
      actionState: 'Active Ingress'
    },
    {
      id: 'rep-b',
      name: 'instance-worker-02',
      region: 'us-east-1b',
      ping: '14ms',
      load: '38%',
      status: 'healthy',
      actionState: 'Active Ingress'
    },
    {
      id: 'rep-c',
      name: 'instance-worker-03',
      region: 'us-east-1c',
      ping: '11ms (p99)',
      load: '41%',
      status: 'healthy',
      actionState: 'Active Ingress'
    }
  ]);

  const timersRef = useRef<number[]>([]);

  const clearAllTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const runSimulation = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    clearAllTimers();

    // Phase 1: Failure Detected (<150ms)
    setPhase('degraded');
    setRecoveryMetric('Remediating...');
    setCurrentLog({
      timestamp: getTimestamp(),
      type: 'alert',
      message: 'ALERT: Anomaly detected on instance-worker-02 [OOM kill event / 502 Bad Gateway]'
    });
    setReplicas(prev => [
      prev[0],
      {
        ...prev[1],
        status: 'degraded',
        ping: 'TIMEOUT (504)',
        actionState: 'Draining ingress...'
      },
      prev[2]
    ]);

    // Phase 2: Autonomous Isolation & Warm Provisioning (1.4s)
    const t1 = window.setTimeout(() => {
      setPhase('isolating');
      setCurrentLog({
        timestamp: getTimestamp(),
        type: 'healing',
        message: 'HEALING: Isolated node #02. Warm standby microVM initialized (sha256:clone-98b)'
      });
      setReplicas(prev => [
        prev[0],
        {
          ...prev[1],
          status: 'provisioning',
          ping: 'PROVISIONING',
          actionState: 'Spawning replacement replica...'
        },
        prev[2]
      ]);
    }, 1400);
    timersRef.current.push(t1);

    // Phase 3: Replacement Promoted & Verified (3.0s)
    const t2 = window.setTimeout(() => {
      setPhase('verifying');
      setCurrentLog({
        timestamp: getTimestamp(),
        type: 'verify',
        message: 'VERIFY: Health probes passed (200 OK). Traffic safely switched.'
      });
      setReplicas(prev => [
        prev[0],
        {
          ...prev[1],
          name: 'instance-worker-02 (recovered)',
          status: 'verifying',
          ping: '18ms',
          actionState: 'Promoting to pool...'
        },
        prev[2]
      ]);
    }, 3000);
    timersRef.current.push(t2);

    // Phase 4: Fully Healthy Restored (4.2s)
    const t3 = window.setTimeout(() => {
      setPhase('recovered');
      setRecoveryMetric('Recovered in 3.8s');
      setCurrentLog({
        timestamp: getTimestamp(),
        type: 'resolved',
        message: 'RESOLVED: Service recovered in 3.8s. All instances reporting healthy.'
      });
      setReplicas(prev => [
        prev[0],
        {
          ...prev[1],
          name: 'instance-worker-02',
          status: 'healthy',
          ping: '13ms',
          actionState: 'Active Ingress'
        },
        prev[2]
      ]);

      const tReset = window.setTimeout(() => {
        setPhase('healthy');
        setIsRunning(false);
      }, 1200);
      timersRef.current.push(tReset);
    }, 4200);
    timersRef.current.push(t3);
  }, [isRunning]);

  useEffect(() => {
    // Ambient periodic run every 20 seconds
    const interval = window.setInterval(() => {
      if (!isRunning) {
        runSimulation();
      }
    }, 20000);

    return () => {
      window.clearInterval(interval);
      clearAllTimers();
    };
  }, [isRunning, runSimulation]);

  return {
    phase,
    isRunning,
    recoveryMetric,
    currentLog,
    replicas,
    triggerCrash: runSimulation
  };
}
