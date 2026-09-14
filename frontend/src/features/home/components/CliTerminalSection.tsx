import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Copy, Check, RotateCw, Play, CheckCircle2 } from 'lucide-react';

interface CommandScenario {
  id: string;
  label: string;
  command: string;
  description: string;
  badge: string;
  lines: { text: string; color?: string; delayMs: number }[];
  endpoint?: string;
}

const scenarios: CommandScenario[] = [
  {
    id: 'deploy',
    label: 'deploy --prod',
    command: 'deployforge deploy --prod --auto-recover',
    description: 'Zero-downtime production deployment with autonomous hot-standby',
    badge: 'Production Rollout',
    lines: [
      { text: '$ deployforge deploy --prod --auto-recover', color: 'text-white font-semibold', delayMs: 0 },
      { text: '→ Inspecting repository [github.com/acme/forge-app]...', color: 'text-brand-muted', delayMs: 120 },
      { text: '✓ Next.js 15 & Rust microservices detected', color: 'text-brand-cyan', delayMs: 250 },
      { text: '✓ Deterministic OCI image built in 18.2s [sha256:88fa290e]', color: 'text-white', delayMs: 400 },
      { text: '✓ Watchdog assigned [heartbeat: 100ms, consensus: 24/24]', color: 'text-brand-emerald', delayMs: 580 },
      { text: '✓ 24/24 Global edge nodes verified healthy', color: 'text-brand-emerald font-semibold', delayMs: 750 },
      { text: '✓ Production routing shifted: 10% → 50% → 100% [zero packet drop]', color: 'text-brand-cyan', delayMs: 920 },
    ],
    endpoint: 'https://acme-app.deployforge.app'
  },
  {
    id: 'status',
    label: 'status --watch',
    command: 'deployforge status --watch --topology',
    description: 'Real-time telemetry stream and edge cluster consensus matrix',
    badge: 'Live Mesh Status',
    lines: [
      { text: '$ deployforge status --watch --topology', color: 'text-white font-semibold', delayMs: 0 },
      { text: '→ Querying eBPF ingress nodes across 14 regions...', color: 'text-brand-muted', delayMs: 120 },
      { text: '● [us-east-1]  3/3 pods healthy | p99: 11.2ms | ingress: 14.8k req/s', color: 'text-brand-emerald', delayMs: 260 },
      { text: '● [eu-west-1]  3/3 pods healthy | p99: 14.5ms | ingress: 12.1k req/s', color: 'text-brand-emerald', delayMs: 420 },
      { text: '● [ap-northeast-1] 2/2 pods healthy | p99: 18.1ms | ingress: 8.4k req/s', color: 'text-brand-emerald', delayMs: 580 },
      { text: '✓ Global health score: 100% [consensus epoch: #984210]', color: 'text-brand-cyan font-semibold', delayMs: 740 },
    ]
  },
  {
    id: 'heal',
    label: 'heal --simulate',
    command: 'deployforge heal --simulate --target=worker-02',
    description: 'Chaos injection: trigger memory spike and observe autonomous hot swap',
    badge: 'Chaos Simulation',
    lines: [
      { text: '$ deployforge heal --simulate --target=worker-02', color: 'text-white font-semibold', delayMs: 0 },
      { text: '⚠ Injecting SIGSEGV memory fault into worker-02...', color: 'text-brand-rose', delayMs: 140 },
      { text: '→ Watchdog triggered: HTTP 502 detected in 118ms', color: 'text-brand-amber', delayMs: 280 },
      { text: '→ Isolating worker-02 from BGP ingress mesh...', color: 'text-brand-amber', delayMs: 440 },
      { text: '✓ Warm standby microVM initialized (snapshot: sha256:clone-98b)', color: 'text-brand-cyan', delayMs: 620 },
      { text: '✓ Probes passed [200 OK]. Hot-swap complete in 3.8s', color: 'text-brand-emerald font-semibold', delayMs: 820 },
    ]
  },
  {
    id: 'rollback',
    label: 'rollback --instant',
    command: 'deployforge rollback --instant --safe',
    description: 'Instant atomic pointer reversion without microVM recreation',
    badge: 'Atomic Reversion',
    lines: [
      { text: '$ deployforge rollback --instant --safe', color: 'text-white font-semibold', delayMs: 0 },
      { text: '→ Fetching previous verified snapshot [rev #8f72a1c]...', color: 'text-brand-muted', delayMs: 120 },
      { text: '✓ Hash match verified [sha256:49c8230b]', color: 'text-brand-cyan', delayMs: 260 },
      { text: '✓ Ingress routes swapped atomically via eBPF mesh (0.4ms)', color: 'text-brand-emerald', delayMs: 440 },
      { text: '✓ Traffic restored to target deployment without dropped sockets', color: 'text-brand-emerald font-semibold', delayMs: 620 },
    ]
  }
];

export function CliTerminalSection() {
  const [activeScenarioId, setActiveScenarioId] = useState<string>('deploy');
  const [visibleLineCount, setVisibleLineCount] = useState<number>(1);
  const [copied, setCopied] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const activeScenario = scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];

  // Animated line streaming effect
  const runStreaming = (scenario: CommandScenario) => {
    setVisibleLineCount(1);
    setIsExecuting(true);

    scenario.lines.slice(1).forEach((line, idx) => {
      window.setTimeout(() => {
        setVisibleLineCount(idx + 2);
        if (idx === scenario.lines.length - 2) {
          setIsExecuting(false);
        }
      }, line.delayMs);
    });
  };

  const handleSelectScenario = (id: string) => {
    const sc = scenarios.find((s) => s.id === id) || scenarios[0];
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
    <section id="developer-experience" className="py-28 border-t border-brand-border relative z-10 bg-brand-bg/60">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -40px 0px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <div className="text-xs font-mono uppercase tracking-widest text-brand-cyan mb-2">
            Command Line Interface
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            From repository to production.
          </h2>
          <p className="text-base text-brand-muted">
            One deterministic command handles environment inspection, cryptographic signing, microVM allocation, and autonomous health registration.
          </p>
        </motion.div>

        {/* Interactive Scenario Tabs */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-xl bg-brand-surface border border-brand-border shadow-lg">
            {scenarios.map((sc) => {
              const isActive = sc.id === activeScenarioId;
              return (
                <button
                  key={sc.id}
                  onClick={() => handleSelectScenario(sc.id)}
                  className={`relative px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-cyan ${
                    isActive ? 'text-white font-medium' : 'text-brand-muted hover:text-white/90 hover:bg-white/[0.03]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-cli-pill"
                      className="absolute inset-0 rounded-lg bg-brand-card border border-brand-border-hover shadow-sm"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Terminal className="w-3 h-3 text-brand-cyan" />
                    <span>{sc.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Realistic Terminal Window with Spotlight */}
        <motion.div
          onMouseMove={handleMouseMove}
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "0px 0px -40px 0px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="spotlight-card max-w-3xl mx-auto rounded-2xl bg-brand-surface border border-brand-border shadow-[0_24px_70px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300 hover:border-brand-border-hover hover:shadow-[0_28px_80px_rgba(0,240,255,0.08)]"
        >
          {/* Terminal Header */}
          <div className="bg-brand-card px-4 py-3 border-b border-brand-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-brand-rose/70"></span>
              <span className="w-3 h-3 rounded-full bg-brand-amber/70"></span>
              <span className="w-3 h-3 rounded-full bg-brand-emerald/70"></span>
              <span className="text-xs font-mono text-brand-muted ml-3 hidden sm:inline">
                deployforge-cli v2.4.1 (zsh)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-cyan-dim text-brand-cyan border border-brand-cyan/20 ml-1">
                {activeScenario.badge}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Re-run button */}
              <motion.button
                onClick={() => runStreaming(activeScenario)}
                disabled={isExecuting}
                whileTap={{ scale: 0.92 }}
                className="text-[11px] font-mono text-brand-muted hover:text-white px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-brand-border flex items-center gap-1.5 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-cyan disabled:opacity-50"
                title="Re-run command"
              >
                <RotateCw className={`w-3 h-3 ${isExecuting ? 'animate-spin text-brand-cyan' : ''}`} />
                <span className="hidden sm:inline">Re-run</span>
              </motion.button>

              {/* Copy button */}
              <motion.button
                onClick={copyCommand}
                whileTap={{ scale: 0.92 }}
                className="text-[11px] font-mono text-brand-muted hover:text-white px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-brand-border flex items-center gap-1.5 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-cyan"
                aria-label="Copy command"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-brand-emerald" />
                    <span className="text-brand-emerald">Copied</span>
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

          {/* Terminal Output Stream */}
          <div className="p-6 font-mono text-xs leading-relaxed overflow-x-auto min-h-[260px] bg-brand-bg/40">
            <div className="space-y-2">
              {activeScenario.lines.slice(0, visibleLineCount).map((line, idx) => (
                <motion.div
                  key={`${activeScenario.id}-${idx}`}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-start gap-2 ${line.color || 'text-white/80'}`}
                >
                  <span>{line.text}</span>
                  {idx === 0 && isExecuting && (
                    <span className="inline-block w-2 h-3.5 bg-brand-cyan animate-pulse" aria-hidden="true" />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Completion card if all lines rendered */}
            <AnimatePresence>
              {visibleLineCount >= activeScenario.lines.length && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="mt-5 pt-4 border-t border-brand-border"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-brand-emerald font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Command completed successfully [exit code 0]</span>
                    </div>
                    <span className="text-[10px] text-brand-muted">latency: 18ms</span>
                  </div>

                  {activeScenario.endpoint && (
                    <div className="text-xs text-brand-muted mt-2 flex items-center gap-2">
                      <span>Endpoint:</span>
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="text-brand-cyan underline hover:text-brand-cyan/80 cursor-pointer"
                      >
                        {activeScenario.endpoint}
                      </a>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Terminal Footnote */}
          <div className="px-4 py-2.5 bg-brand-card/80 border-t border-brand-border flex items-center justify-between text-[11px] font-mono text-brand-muted">
            <span className="flex items-center gap-1.5">
              <Play className="w-3 h-3 text-brand-cyan" />
              <span>Interactive preview — click any command preset above to inspect execution</span>
            </span>
            <span className="hidden sm:inline">Press Copy to paste in terminal</span>
          </div>

        </motion.div>

      </div>
    </section>
  );
}
