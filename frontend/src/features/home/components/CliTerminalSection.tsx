import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  Copy,
  Check,
  RotateCw,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Activity,
  Sparkles,
  AlertTriangle,
  Send
} from 'lucide-react';

interface CommandScenario {
  id: string;
  label: string;
  command: string;
  description: string;
  badge: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
  lines: { text: string; color?: string; delayMs: number }[];
  endpoint?: string;
  metrics?: { label: string; value: string }[];
}

const SCENARIOS: CommandScenario[] = [
  {
    id: 'deploy',
    label: 'deploy --prod',
    command: 'deployforge deploy --prod --auto-recover',
    description: 'Zero-downtime production deployment with autonomous hot-standby',
    badge: 'Production Rollout',
    badgeColor: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/30',
    icon: Sparkles,
    lines: [
      { text: '$ deployforge deploy --prod --auto-recover', color: 'text-white font-semibold', delayMs: 0 },
      { text: '→ Inspecting repository [github.com/acme/forge-app]...', color: 'text-neutral-400', delayMs: 100 },
      { text: '✓ Next.js 15 & Rust microservices detected', color: 'text-accent-cyan', delayMs: 220 },
      { text: '✓ Deterministic OCI image built in 18.2s [sha256:88fa290e]', color: 'text-white', delayMs: 360 },
      { text: '✓ Watchdog assigned [heartbeat: 100ms, consensus: 24/24]', color: 'text-accent-emerald', delayMs: 500 },
      { text: '✓ 24/24 Global edge nodes verified healthy', color: 'text-accent-emerald font-semibold', delayMs: 640 },
      { text: '✓ Production routing shifted: 10% → 50% → 100% [zero packet drop]', color: 'text-accent-cyan', delayMs: 800 },
    ],
    endpoint: 'https://acme-app.deployforge.app',
    metrics: [
      { label: 'Build Time', value: '18.2s' },
      { label: 'Ingress Nodes', value: '24/24' },
      { label: 'Packet Drop', value: '0.00%' }
    ]
  },
  {
    id: 'status',
    label: 'status --watch',
    command: 'deployforge status --watch --topology',
    description: 'Real-time telemetry stream and edge cluster consensus matrix',
    badge: 'Live Mesh Status',
    badgeColor: 'text-accent-blue bg-accent-blue/10 border-accent-blue/30',
    icon: Activity,
    lines: [
      { text: '$ deployforge status --watch --topology', color: 'text-white font-semibold', delayMs: 0 },
      { text: '→ Querying eBPF ingress nodes across 14 global regions...', color: 'text-neutral-400', delayMs: 100 },
      { text: '● [us-east-1]      3/3 pods healthy | p99: 11.2ms | ingress: 14.8k req/s', color: 'text-accent-emerald', delayMs: 240 },
      { text: '● [eu-west-1]      3/3 pods healthy | p99: 14.5ms | ingress: 12.1k req/s', color: 'text-accent-emerald', delayMs: 380 },
      { text: '● [ap-northeast-1] 2/2 pods healthy | p99: 18.1ms | ingress: 8.4k req/s', color: 'text-accent-emerald', delayMs: 520 },
      { text: '✓ Global health score: 100% [consensus epoch: #984210]', color: 'text-accent-cyan font-semibold', delayMs: 680 },
    ],
    metrics: [
      { label: 'Regions', value: '14 Global' },
      { label: 'Avg Latency', value: '13.4ms' },
      { label: 'Consensus', value: '100%' }
    ]
  },
  {
    id: 'heal',
    label: 'heal --simulate',
    command: 'deployforge heal --simulate --target=worker-02',
    description: 'Chaos injection: trigger memory fault and observe autonomous hot swap',
    badge: 'Chaos Simulation',
    badgeColor: 'text-accent-amber bg-accent-amber/10 border-accent-amber/30',
    icon: AlertTriangle,
    lines: [
      { text: '$ deployforge heal --simulate --target=worker-02', color: 'text-white font-semibold', delayMs: 0 },
      { text: '⚠ Injecting SIGSEGV memory fault into worker-02...', color: 'text-accent-rose', delayMs: 120 },
      { text: '→ Watchdog triggered: HTTP 502 detected in 118ms', color: 'text-accent-amber', delayMs: 250 },
      { text: '→ Isolating worker-02 from BGP ingress mesh...', color: 'text-accent-amber', delayMs: 380 },
      { text: '✓ Warm standby microVM initialized (snapshot: sha256:clone-98b)', color: 'text-accent-cyan', delayMs: 520 },
      { text: '✓ Probes passed [200 OK]. Hot-swap complete in 3.8s', color: 'text-accent-emerald font-semibold', delayMs: 700 },
    ],
    metrics: [
      { label: 'Detection', value: '118ms' },
      { label: 'Remediation', value: '3.8s' },
      { label: 'Downtime', value: '0.0ms' }
    ]
  },
  {
    id: 'rollback',
    label: 'rollback --instant',
    command: 'deployforge rollback --instant --safe',
    description: 'Instant atomic pointer reversion without microVM recreation',
    badge: 'Atomic Reversion',
    badgeColor: 'text-accent-emerald bg-accent-emerald/10 border-accent-emerald/30',
    icon: ShieldCheck,
    lines: [
      { text: '$ deployforge rollback --instant --safe', color: 'text-white font-semibold', delayMs: 0 },
      { text: '→ Fetching previous verified snapshot [rev #8f72a1c]...', color: 'text-neutral-400', delayMs: 100 },
      { text: '✓ Hash match verified [sha256:49c8230b]', color: 'text-accent-cyan', delayMs: 220 },
      { text: '✓ Ingress routes swapped atomically via eBPF mesh (0.4ms)', color: 'text-accent-emerald', delayMs: 360 },
      { text: '✓ Traffic restored to target deployment without dropped sockets', color: 'text-accent-emerald font-semibold', delayMs: 520 },
    ],
    metrics: [
      { label: 'Swap Latency', value: '0.4ms' },
      { label: 'Socket Drops', value: '0' },
      { label: 'Rollback Status', value: 'Clean' }
    ]
  }
];

export function CliTerminalSection() {
  const [activeScenarioId, setActiveScenarioId] = useState<string>('deploy');
  const [visibleLineCount, setVisibleLineCount] = useState<number>(1);
  const [copied, setCopied] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const activeScenario = SCENARIOS.find((s) => s.id === activeScenarioId) || SCENARIOS[0];
  const timeoutsRef = useRef<number[]>([]);

  // Clear pending timeouts
  const clearTimeouts = () => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  };

  useEffect(() => {
    return () => clearTimeouts();
  }, []);

  // Animated line streaming effect
  const runStreaming = (scenario: CommandScenario) => {
    clearTimeouts();
    setVisibleLineCount(1);
    setIsExecuting(true);

    scenario.lines.slice(1).forEach((line, idx) => {
      const t = window.setTimeout(() => {
        setVisibleLineCount(idx + 2);
        if (idx === scenario.lines.length - 2) {
          setIsExecuting(false);
        }
      }, line.delayMs);
      timeoutsRef.current.push(t);
    });
  };

  const handleSelectScenario = (id: string) => {
    if (id === activeScenarioId && isExecuting) return;
    const sc = SCENARIOS.find((s) => s.id === id) || SCENARIOS[0];
    setActiveScenarioId(id);
    runStreaming(sc);
  };

  const copyCommand = () => {
    navigator.clipboard.writeText(activeScenario.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <section id="developer-experience" className="py-24 sm:py-28 border-t border-white/[0.08] relative z-10 bg-[#070809]">
      {/* Subtle Upper Ambient Lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-accent-cyan/[0.025] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -40px 0px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-accent-cyan mb-3">
            <Terminal className="w-3.5 h-3.5" />
            <span>COMMAND LINE INTERFACE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3 font-sans">
            From repository to production.
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 font-mono">
            One deterministic command handles environment inspection, cryptographic signing, microVM allocation, and autonomous health registration.
          </p>
        </motion.div>

        {/* Interactive Preset Command Tabs */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-[#0B0D10]/90 border border-white/[0.08] shadow-lg backdrop-blur-xl">
            {SCENARIOS.map((sc) => {
              const isActive = sc.id === activeScenarioId;
              const Icon = sc.icon;

              return (
                <button
                  key={sc.id}
                  onClick={() => handleSelectScenario(sc.id)}
                  className={`relative px-3.5 py-2 rounded-xl text-xs font-mono transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan ${
                    isActive ? 'text-white font-semibold' : 'text-neutral-400 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-cli-pill"
                      className="absolute inset-0 rounded-xl bg-white/[0.09] border border-white/15 shadow-[0_2px_12px_rgba(0,0,0,0.5)] backdrop-blur-md"
                      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-accent-cyan' : 'text-neutral-500'}`} />
                    <span>{sc.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Realistic Terminal Window with Spotlight Glass */}
        <motion.div
          onMouseMove={handleMouseMove}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "0px 0px -40px 0px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="spotlight-card max-w-3xl mx-auto rounded-2xl bg-[#090B0E]/95 border border-white/[0.1] shadow-[0_25px_80px_rgba(0,0,0,0.85)] overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-[0_28px_80px_rgba(0,240,255,0.06)] backdrop-blur-2xl"
        >
          {/* Terminal Header Bar */}
          <div className="bg-[#101216]/90 px-4 py-3 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Traffic Lights */}
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#EF4444]/80 shadow-[0_0_6px_rgba(239,68,68,0.4)]" />
                <span className="w-3 h-3 rounded-full bg-[#F59E0B]/80 shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
                <span className="w-3 h-3 rounded-full bg-[#10B981]/80 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
              </div>

              {/* Path / Host readout */}
              <span className="text-xs font-mono text-neutral-400 ml-3 hidden sm:inline">
                ~/repos/forge-app · <span className="text-neutral-500">zsh</span>
              </span>

              {/* Scenario Badge */}
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-medium ml-1 ${activeScenario.badgeColor}`}
              >
                {activeScenario.badge}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Re-run button */}
              <motion.button
                type="button"
                onClick={() => runStreaming(activeScenario)}
                disabled={isExecuting}
                whileTap={{ scale: 0.94 }}
                className="text-xs font-mono text-neutral-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center gap-1.5 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan disabled:opacity-50"
                title="Re-run simulation"
              >
                <RotateCw className={`w-3 h-3 ${isExecuting ? 'animate-spin text-accent-cyan' : ''}`} />
                <span className="hidden sm:inline">Re-run</span>
              </motion.button>

              {/* Copy command button */}
              <motion.button
                type="button"
                onClick={copyCommand}
                whileTap={{ scale: 0.94 }}
                className="text-xs font-mono text-neutral-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center gap-1.5 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan"
                aria-label="Copy command"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-accent-emerald stroke-[2.5]" />
                    <span className="text-accent-emerald font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Terminal Output Body */}
          <div className="p-5 sm:p-6 font-mono text-xs leading-relaxed overflow-x-auto min-h-[250px] bg-[#070809]/80">
            <div className="space-y-2">
              {activeScenario.lines.slice(0, visibleLineCount).map((line, idx) => (
                <motion.div
                  key={`${activeScenario.id}-${idx}`}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.18 }}
                  className={`flex items-start gap-2 ${line.color || 'text-neutral-300'}`}
                >
                  <span>{line.text}</span>
                  {idx === 0 && isExecuting && (
                    <span className="inline-block w-2 h-3.5 bg-accent-cyan shadow-[0_0_6px_#00F0FF] animate-pulse" aria-hidden="true" />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Execution Completion Card */}
            <AnimatePresence>
              {visibleLineCount >= activeScenario.lines.length && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.08 }}
                  className="mt-6 pt-4 border-t border-white/[0.08] space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-accent-emerald font-semibold flex items-center gap-2 text-xs">
                      <CheckCircle2 className="w-4 h-4 shrink-0 stroke-[2.5]" />
                      <span>Execution verified [exit code 0]</span>
                    </div>

                    {/* Telemetry Metrics Pills */}
                    {activeScenario.metrics && (
                      <div className="flex items-center gap-2">
                        {activeScenario.metrics.map((m) => (
                          <div
                            key={m.label}
                            className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-[10px] text-neutral-400 font-mono"
                          >
                            <span className="text-neutral-500">{m.label}: </span>
                            <span className="text-white font-semibold">{m.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Active Live Endpoint (If Available) */}
                  {activeScenario.endpoint && (
                    <div className="text-xs text-neutral-400 flex items-center gap-2 pt-1">
                      <span>Live Ingress:</span>
                      <a
                        href={activeScenario.endpoint}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent-cyan underline underline-offset-2 hover:text-white transition-colors inline-flex items-center gap-1 font-mono"
                      >
                        <span>{activeScenario.endpoint}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Footnote Bar */}
          <div className="px-4 py-2.5 bg-[#101216]/90 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Send className="w-3 h-3 text-accent-cyan" />
              <span>Click any preset above to execute simulation</span>
            </span>
            <span className="text-neutral-500 hidden sm:inline">eBPF Kernel v2.4</span>
          </div>

        </motion.div>

      </div>
    </section>
  );
}
