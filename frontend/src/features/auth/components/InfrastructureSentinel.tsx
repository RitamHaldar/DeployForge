import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Cpu, Terminal, Server, Globe2 } from 'lucide-react';

const LIVE_EVENTS = [
  { id: '1', time: '17:04:12', tag: 'HEAL', text: 'pod/ingress-edge-4 recovered in 38ms', status: 'success' },
  { id: '2', time: '17:04:08', tag: 'SCALE', text: 'worker-pool: auto-scaled 12 → 16 replicas', status: 'info' },
  { id: '3', time: '17:03:59', tag: 'CANARY', text: 'zero-downtime canary rollback verified', status: 'success' },
  { id: '4', time: '17:03:45', tag: 'PING', text: 'global edge healthcheck passed (12.4ms)', status: 'info' },
  { id: '5', time: '17:03:31', tag: 'TLS', text: 'automated mTLS certificate re-issued', status: 'success' },
];

export function InfrastructureSentinel() {
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const [latency, setLatency] = useState(13);

  // Periodic subtle latency fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(12 + Math.random() * 4));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Event ticker rotation
  useEffect(() => {
    const ticker = setInterval(() => {
      setActiveEventIndex(prev => (prev + 1) % LIVE_EVENTS.length);
    }, 3500);
    return () => clearInterval(ticker);
  }, []);

  return (
    <div className="hidden lg:flex flex-col justify-center max-w-[460px] xl:max-w-[490px] pr-2 select-none space-y-3.5 shrink-0">
      {/* Live Control Plane Status Pill */}
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md w-fit">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-cyan shadow-[0_0_8px_#00F0FF]" />
        </span>
        <span className="text-[11px] font-mono font-medium tracking-wide text-neutral-300">
          Autonomous Engine Sentinel
        </span>
        <span className="text-neutral-600">/</span>
        <span className="text-[10px] font-mono text-accent-emerald font-semibold">
          Operational
        </span>
      </div>

      {/* Hero Value Headline */}
      <div className="space-y-1.5">
        <h2 className="text-2xl xl:text-3xl font-bold tracking-tight text-white leading-tight font-sans">
          Cloud infrastructure that{' '}
          <span className="bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-emerald bg-clip-text text-transparent">
            repairs itself
          </span>{' '}
          before downtime strikes.
        </h2>
        <p className="text-xs text-neutral-400 font-mono leading-relaxed">
          Sub-millisecond edge failover, autonomous cluster remediation, and continuous zero-trust verification.
        </p>
      </div>

      {/* Live Node Topology Visualization Card */}
      <div className="relative rounded-2xl bg-[#0B0D10]/90 border border-white/[0.08] p-3.5 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] overflow-hidden group">
        <div className="absolute inset-0 bg-tech-grid opacity-25 pointer-events-none" />

        {/* Topology Header */}
        <div className="relative z-10 flex items-center justify-between pb-2.5 border-b border-white/[0.06] text-[11px] font-mono text-neutral-400">
          <div className="flex items-center gap-2 text-neutral-200">
            <Server className="w-3.5 h-3.5 text-accent-cyan" />
            <span className="font-semibold">EDGE MESH TOPOLOGY</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="text-neutral-500">Latency:</span>
            <span className="text-accent-cyan font-mono font-semibold">{latency}ms</span>
          </div>
        </div>

        {/* Animated SVG Data Graph */}
        <div className="relative z-10 py-3">
          <div className="flex items-center justify-between">
            {/* Origin Client Node */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-neutral-300 shadow-inner group-hover:border-accent-cyan/40 transition-colors">
                <Globe2 className="w-4 h-4 text-accent-cyan" />
              </div>
              <span className="text-[9px] font-mono text-neutral-400">Anycast</span>
            </div>

            {/* Connecting Data Line 1 */}
            <div className="flex-1 px-2 relative">
              <div className="h-[1px] w-full bg-gradient-to-r from-accent-cyan/20 via-accent-cyan/60 to-accent-cyan/20 relative">
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-1.5 rounded-full bg-accent-cyan shadow-[0_0_6px_#00F0FF]"
                  animate={{ left: ['0%', '100%'] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            </div>

            {/* Central DeployForge Hub */}
            <div className="flex flex-col items-center gap-1">
              <div className="relative w-10 h-10 rounded-xl bg-[#101216] border border-accent-cyan/50 flex items-center justify-center shadow-[0_0_16px_rgba(0,240,255,0.25)]">
                <svg
                  className="w-5 h-5 text-accent-cyan animate-forge"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" />
                  <circle cx="12" cy="12" r="2" fill="#00F0FF" />
                </svg>
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent-emerald shadow-[0_0_6px_#10B981] animate-pulse" />
              </div>
              <span className="text-[9px] font-mono text-white font-medium">Sentinel Core</span>
            </div>

            {/* Connecting Data Line 2 */}
            <div className="flex-1 px-2 relative">
              <div className="h-[1px] w-full bg-gradient-to-r from-accent-cyan/20 via-accent-emerald/60 to-accent-emerald/20 relative">
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-1.5 rounded-full bg-accent-emerald shadow-[0_0_6px_#10B981]"
                  animate={{ left: ['0%', '100%'] }}
                  transition={{ duration: 2.1, repeat: Infinity, ease: 'linear', delay: 0.6 }}
                />
              </div>
            </div>

            {/* Destination Cluster Nodes */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-neutral-300 shadow-inner group-hover:border-accent-emerald/40 transition-colors">
                <Cpu className="w-4 h-4 text-accent-emerald" />
              </div>
              <span className="text-[9px] font-mono text-neutral-400">Kubernetes</span>
            </div>
          </div>
        </div>

        {/* Live Telemetry Metric Badges */}
        <div className="relative z-10 grid grid-cols-3 gap-1.5 pt-2 border-t border-white/[0.06] text-center">
          <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[9px] font-mono text-neutral-500 uppercase">Detection</div>
            <div className="text-xs font-mono font-bold text-accent-cyan">&lt; 15ms</div>
          </div>
          <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[9px] font-mono text-neutral-500 uppercase">Remediation</div>
            <div className="text-xs font-mono font-bold text-accent-emerald">Auto-healed</div>
          </div>
          <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[9px] font-mono text-neutral-500 uppercase">SLA Target</div>
            <div className="text-xs font-mono font-bold text-white">99.999%</div>
          </div>
        </div>
      </div>

      {/* Live Sentinel Event Stream Ticker (Single Line Compact) */}
      <div className="rounded-xl bg-[#090B0E]/85 border border-white/[0.06] p-2.5 backdrop-blur-md">
        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pb-1.5 border-b border-white/[0.04]">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3 h-3 text-accent-cyan" />
            <span>LIVE EVENT STREAM</span>
          </div>
          <span className="text-[9px] text-accent-emerald animate-pulse font-semibold">STREAMING</span>
        </div>

        <div className="h-6 overflow-hidden relative pt-1">
          {LIVE_EVENTS.map((ev, idx) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{
                opacity: idx === activeEventIndex ? 1 : 0,
                y: idx === activeEventIndex ? 0 : -8,
                display: idx === activeEventIndex ? 'flex' : 'none'
              }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="items-center gap-2 text-[11px] font-mono"
            >
              <span className="text-[9px] text-neutral-500">{ev.time}</span>
              <span
                className={`text-[8px] px-1 py-0.2 rounded font-bold ${
                  ev.status === 'success'
                    ? 'bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30'
                    : 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30'
                }`}
              >
                {ev.tag}
              </span>
              <span className="text-neutral-300 truncate text-[10px]">{ev.text}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Verified Security Trust Signals */}
      <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-neutral-500">
        <div className="flex items-center gap-1.5 text-neutral-400">
          <ShieldCheck className="w-3.5 h-3.5 text-accent-cyan" />
          <span>Zero-trust cryptographic isolation</span>
        </div>
        <span className="text-[9px] text-neutral-600">v2.4 Kernel</span>
      </div>
    </div>
  );
}
