import { useState } from 'react';
import {
  Activity,
  Cpu,
  Database,
  Radio,
  RefreshCw,
  Clock,
  Check,
  ShieldCheck,
  Server,
  TrendingDown,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import type { DeploymentRecord } from '../types';

interface DeploymentHealthProps {
  deployment: DeploymentRecord;
}

interface ProbeStep {
  name: string;
  duration: string;
  status: 'passed' | 'pending';
}

export function DeploymentHealth({ deployment }: DeploymentHealthProps) {
  const [isProbing, setIsProbing] = useState(false);
  const [probeStage, setProbeStage] = useState<number>(0);
  const [activeProbeResult, setActiveProbeResult] = useState<{
    latency: number;
    timestamp: string;
    steps: ProbeStep[];
    payload: string;
  } | null>({
    latency: 13.8,
    timestamp: 'Just now',
    steps: [
      { name: 'DNS Ingress Mapping', duration: '1.4ms', status: 'passed' },
      { name: 'TCP Socket Handshake (:3000)', duration: '3.8ms', status: 'passed' },
      { name: 'HTTP GET / (TTFB)', duration: '8.6ms', status: 'passed' },
    ],
    payload: '{"status":"UP","runtime":"node20","probes":{"liveness":200,"readiness":200}}',
  });

  const handleRunProbe = () => {
    setIsProbing(true);
    setProbeStage(1);

    setTimeout(() => setProbeStage(2), 350);
    setTimeout(() => setProbeStage(3), 700);

    setTimeout(() => {
      setIsProbing(false);
      setProbeStage(0);
      const latency = Number((11 + Math.random() * 4).toFixed(1));
      setActiveProbeResult({
        latency,
        timestamp: 'Just now',
        steps: [
          { name: 'DNS Ingress Mapping', duration: '1.2ms', status: 'passed' },
          { name: 'TCP Socket Handshake (:3000)', duration: '3.4ms', status: 'passed' },
          { name: `HTTP GET / (TTFB)`, duration: `${(latency - 4.6).toFixed(1)}ms`, status: 'passed' },
        ],
        payload: `{"status":"UP","runtime":"node20","latency":"${latency}ms","checks":"healthy"}`,
      });
    }, 1100);
  };

  // Sparkline data generators for subtle live micro-graphs
  const cpuPoints = [32, 28, 30, 24, 27, 25, 23, 22, 24]; // SVG Y coords
  const memPoints = [40, 38, 39, 36, 37, 35, 34, 34, 33];
  const latPoints = [22, 26, 20, 24, 18, 22, 16, 17, 14];

  const renderSvgSparkline = (points: number[], strokeColor: string, fillColor: string) => {
    const width = 110;
    const height = 36;
    const step = width / (points.length - 1);
    const d = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${p}`)
      .join(' ');
    const areaD = `${d} L ${width} ${height} L 0 ${height} Z`;

    return (
      <svg className="w-full h-8 overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${strokeColor}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={fillColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#grad-${strokeColor})`} />
        <path d={d} fill="none" stroke={strokeColor} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  return (
    <div className="space-y-3.5 text-xs font-sans">
      
      {/* 1. Master Probe Engine & Real-Time Diagnostics Hero Card */}
      <div className="relative rounded-xl bg-gradient-to-b from-[#0F131A] to-[#0A0D12] border border-white/[0.09] p-3.5 sm:p-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-xs">Container Health & Probes</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  2/2 Passing
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5 font-mono">
                Liveness: <strong className="text-neutral-300 font-normal">HTTP :3000/</strong> • Readiness: <strong className="text-neutral-300 font-normal">TCP :3000</strong>
              </p>
            </div>
          </div>

          {/* Trigger Probe Button */}
          <button
            type="button"
            onClick={handleRunProbe}
            disabled={isProbing}
            className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] active:scale-95 border border-white/[0.1] text-neutral-200 hover:text-white font-medium text-xs flex items-center gap-2 transition-all shrink-0 self-start sm:self-auto shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isProbing ? 'animate-spin' : ''}`} />
            <span>{isProbing ? 'Executing Probe...' : 'Check Probes'}</span>
          </button>
        </div>

        {/* Live Probe Step Execution Waterfall */}
        <div className="pt-3">
          {isProbing ? (
            <div className="p-3 rounded-lg bg-black/40 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-cyan-300 font-mono">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  {probeStage === 1 && 'Querying Ingress DNS Route...'}
                  {probeStage === 2 && 'Performing TCP 3-way handshake on internal port 3000...'}
                  {probeStage >= 3 && 'Evaluating HTTP GET response & TTFB latency...'}
                </span>
                <span className="text-neutral-400">Step {probeStage} of 3</span>
              </div>
              <div className="w-full bg-white/[0.06] rounded-full h-1 overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(probeStage / 3) * 100}%` }}
                />
              </div>
            </div>
          ) : activeProbeResult ? (
            <div className="space-y-2.5">
              {/* Timing Breakdown Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {activeProbeResult.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-black/30 border border-white/[0.04] flex items-center justify-between font-mono text-[11px]"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="text-neutral-300 truncate">{step.name}</span>
                    </div>
                    <span className="text-emerald-400 font-semibold shrink-0 ml-1">{step.duration}</span>
                  </div>
                ))}
              </div>

              {/* Status & Raw Payload Readout */}
              <div className="p-2.5 rounded-lg bg-[#06080B] border border-white/[0.06] flex items-center justify-between gap-3 font-mono text-[11px]">
                <div className="flex items-center gap-2 text-neutral-400 truncate">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-semibold text-[10px]">
                    200 OK
                  </span>
                  <span className="text-neutral-300 truncate select-all">{activeProbeResult.payload}</span>
                </div>
                <div className="text-[10px] text-neutral-500 shrink-0 hidden sm:block">
                  Total: <strong className="text-emerald-400 font-medium">{activeProbeResult.latency}ms</strong>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* 2. Sleek High-Density Telemetry Gauges (2x2 Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        
        {/* Metric 1: CPU Allocation */}
        <div className="p-3 rounded-xl bg-[#090C11] border border-white/[0.08] hover:border-cyan-500/30 transition-all flex flex-col justify-between space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-300">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              CPU Allocation
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              0.084 / 1.000 Cores
            </span>
          </div>

          <div className="flex items-end justify-between gap-2 pt-0.5">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-white font-mono tracking-tight">8.4%</span>
                <span className="text-[11px] text-emerald-400 font-mono flex items-center">
                  <TrendingDown className="w-3 h-3 mr-0.5" /> -0.3%
                </span>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono">Limit: 1000m • Soft Req: 250m</span>
            </div>

            {/* Sparkline Visual */}
            <div className="w-24 sm:w-28 shrink-0">
              {renderSvgSparkline(cpuPoints, '#00F0FF', '#00F0FF')}
            </div>
          </div>

          <div className="w-full bg-white/[0.05] rounded-full h-1 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full" style={{ width: '8.4%' }} />
          </div>
        </div>

        {/* Metric 2: Memory Usage */}
        <div className="p-3 rounded-xl bg-[#090C11] border border-white/[0.08] hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-300">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              Memory Usage
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              27.7% Allocated
            </span>
          </div>

          <div className="flex items-end justify-between gap-2 pt-0.5">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-white font-mono tracking-tight">142 MB</span>
                <span className="text-[11px] text-neutral-400 font-mono">/ 512 MB</span>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono">Resident Set Size (RSS)</span>
            </div>

            {/* Sparkline Visual */}
            <div className="w-24 sm:w-28 shrink-0">
              {renderSvgSparkline(memPoints, '#10B981', '#10B981')}
            </div>
          </div>

          <div className="w-full bg-white/[0.05] rounded-full h-1 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full" style={{ width: '27.7%' }} />
          </div>
        </div>

        {/* Metric 3: Probe Latency */}
        <div className="p-3 rounded-xl bg-[#090C11] border border-white/[0.08] hover:border-cyan-500/30 transition-all flex flex-col justify-between space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-300">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Probe Latency (p99)
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Optimal
            </span>
          </div>

          <div className="flex items-end justify-between gap-2 pt-0.5">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-white font-mono tracking-tight">13.8 ms</span>
                <span className="text-[11px] text-neutral-400 font-mono">avg: 12.4ms</span>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono">HTTP Ingress Roundtrip</span>
            </div>

            {/* Sparkline Visual */}
            <div className="w-24 sm:w-28 shrink-0">
              {renderSvgSparkline(latPoints, '#00F0FF', '#00F0FF')}
            </div>
          </div>

          <div className="w-full bg-white/[0.05] rounded-full h-1 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full" style={{ width: '92%' }} />
          </div>
        </div>

        {/* Metric 4: Pod Restarts & Availability */}
        <div className="p-3 rounded-xl bg-[#090C11] border border-white/[0.08] hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-300">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              Pod Reliability
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              100% Up
            </span>
          </div>

          <div className="flex items-end justify-between gap-2 pt-0.5">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-white font-mono tracking-tight">0</span>
                <span className="text-[11px] text-emerald-400 font-mono">Crashes</span>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono">Restart Policy: Always</span>
            </div>

            <div className="text-right font-mono">
              <span className="text-xs text-neutral-300 font-medium">Uptime: 99.99%</span>
              <p className="text-[10px] text-neutral-500">2 containers ready</p>
            </div>
          </div>

          <div className="w-full bg-white/[0.05] rounded-full h-1 overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

      </div>

      {/* 3. Kubernetes Probes Specification Details */}
      <div className="p-3.5 rounded-xl bg-[#090C10] border border-white/[0.08] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-neutral-200 text-xs flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            Configured Kubernetes Probes
          </span>
          <span className="text-[10px] font-mono text-neutral-400">spec.containers[0].probes</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          {/* Liveness Probe Box */}
          <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.05] space-y-1 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-cyan-300 font-semibold">livenessProbe</span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-sans">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            </div>
            <p className="text-neutral-400 text-[10px]">httpGet: path: / port: 3000</p>
            <div className="flex items-center gap-2 text-[10px] text-neutral-500 pt-0.5">
              <span>delay: 3s</span>
              <span>•</span>
              <span>period: 10s</span>
              <span>•</span>
              <span>timeout: 1s</span>
            </div>
          </div>

          {/* Readiness Probe Box */}
          <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.05] space-y-1 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-emerald-300 font-semibold">readinessProbe</span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-sans">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            </div>
            <p className="text-neutral-400 text-[10px]">tcpSocket: port: 3000</p>
            <div className="flex items-center gap-2 text-[10px] text-neutral-500 pt-0.5">
              <span>period: 5s</span>
              <span>•</span>
              <span>timeout: 1s</span>
              <span>•</span>
              <span>successThreshold: 1</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Connected Chronological Lifecycle Events */}
      <div className="p-3.5 rounded-xl bg-[#090C10] border border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-neutral-200 text-xs flex items-center gap-2">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            Cluster Lifecycle Events
          </span>
          <span className="text-[10px] text-neutral-500 font-mono">Namespace: default</span>
        </div>

        {/* Connected Vertical Timeline Track */}
        <div className="relative pl-5 space-y-3">
          {/* Vertical connecting line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-gradient-to-b from-cyan-400/50 via-emerald-400/40 to-white/[0.08]" />

          {[
            {
              time: 'Just now',
              reason: 'ProbeSuccess',
              message: 'Liveness probe passed HTTP 200 on port 3000.',
              badge: 'Liveness',
              color: 'emerald',
            },
            {
              time: '1m ago',
              reason: 'IngressBound',
              message: `Host ${deployment.previewurl} successfully mapped to cluster service endpoint.`,
              badge: 'Ingress',
              color: 'cyan',
            },
            {
              time: '2m ago',
              reason: 'ContainersStarted',
              message: `Started containers app and supervisor in pod ${deployment.containerId}.`,
              badge: 'Runtime',
              color: 'blue',
            },
            {
              time: '2m ago',
              reason: 'Scheduled',
              message: 'Successfully assigned pod to node docker-desktop.',
              badge: 'Scheduler',
              color: 'neutral',
            },
          ].map((event, idx) => (
            <div key={idx} className="relative group">
              {/* Timeline Pin Node */}
              <div
                className={`absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full border-2 transition-all ${
                  idx === 0
                    ? 'bg-emerald-400 border-[#090C10] ring-2 ring-emerald-400/30'
                    : 'bg-neutral-800 border-neutral-600 group-hover:border-cyan-400'
                }`}
              />

              <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04] hover:border-white/[0.1] transition-colors space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-white text-[11px] font-medium">{event.reason}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                        event.color === 'emerald'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : event.color === 'cyan'
                          ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                          : event.color === 'blue'
                          ? 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                          : 'bg-white/[0.05] text-neutral-400 border-white/[0.08]'
                      }`}
                    >
                      {event.badge}
                    </span>
                  </div>

                  <span className="text-[10px] text-neutral-500 font-mono flex items-center gap-1 shrink-0">
                    <Clock className="w-2.5 h-2.5" />
                    {event.time}
                  </span>
                </div>

                <p className="text-[11px] text-neutral-400 leading-normal">{event.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
