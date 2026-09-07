import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface AutonomousIncidentForensicsProps {
  onNavigate?: (path: string) => void;
}

type TimelineFilter = 'all' | 'ebpf' | 'controller' | 'mesh';

interface TimelineEvent {
  id: string;
  time: string;
  delta: string;
  category: 'ebpf' | 'controller' | 'mesh';
  categoryLabel: string;
  badge: string;
  badgeType: 'error' | 'tertiary' | 'primary' | 'secondary';
  title: React.ReactNode;
  detailPayload?: React.ReactNode;
  dotColor: string;
}

export const AutonomousIncidentForensics: React.FC<AutonomousIncidentForensicsProps> = ({ onNavigate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stopclockRef = useRef<HTMLSpanElement>(null);
  const chartPathRef = useRef<SVGPathElement>(null);

  // Filter state
  const [filter, setFilter] = useState<TimelineFilter>('all');

  // Diagnostics re-run state
  const [isRerunning, setIsRerunning] = useState(false);
  const [diagnosticProgress, setDiagnosticProgress] = useState<string | null>(null);

  // Post-mortem export modal
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'md' | 'pdf' | 'json'>('md');
  const [isCopied, setIsCopied] = useState(false);

  // Raw JSON modal
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);

  // Timeline items
  const timelineEvents: TimelineEvent[] = [
    {
      id: 'step-1',
      time: '00:14:22.100',
      delta: '+0ms',
      category: 'ebpf',
      categoryLabel: 'eBPF Kernel',
      badge: 'ExitCode:137',
      badgeType: 'error',
      dotColor: 'bg-error',
      title: (
        <>
          Pod{' '}
          <code className="px-1.5 py-0.5 rounded bg-surface-container-lowest font-mono-code text-mono-code text-tertiary">
            payment-service-75b4f85d4f-xk92
          </code>{' '}
          status flipped to <span className="text-error font-semibold">CrashLoopBackOff</span>.
        </>
      ),
      detailPayload: (
        <div className="mt-2 text-on-surface-variant font-mono-code text-body-sm bg-surface-container-lowest/80 p-2 rounded border border-surface-container/40">
          [sys_out] kernel: [oom_reaper] reaped process 189421 (node-payment), anon-rss:262144kB, file-rss:412kB
        </div>
      ),
    },
    {
      id: 'step-2',
      time: '00:14:22.240',
      delta: '+140ms',
      category: 'controller',
      categoryLabel: 'Controller',
      badge: 'Bus Dispatch',
      badgeType: 'tertiary',
      dotColor: 'bg-tertiary',
      title: 'Dispatched synthetic event WebSocket anomaly broadcast to internal healing bus.',
      detailPayload: (
        <div className="mt-1 flex items-center gap-2">
          <span className="font-label-caps text-label-caps text-outline">PAYLOAD:</span>
          <span className="font-mono-code text-mono-code text-primary-fixed bg-surface-container-high px-2 py-0.5 rounded border border-primary/20">
            ANOMALY_HEAP_EXHAUSTION
          </span>
        </div>
      ),
    },
    {
      id: 'step-3',
      time: '00:14:22.310',
      delta: '+210ms',
      category: 'mesh',
      categoryLabel: 'Mesh Routing',
      badge: 'Quarantine Patch',
      badgeType: 'primary',
      dotColor: 'bg-primary',
      title: 'Applied JSON Strategic Merge Patch to isolate pod labels and detached endpoint from Ingress mesh.',
      detailPayload: (
        <div className="mt-2 text-on-surface-variant font-mono-code text-body-sm bg-surface-container-lowest/80 p-2 rounded border border-surface-container/40">
          patch: [{'{ "op": "add", "path": "/metadata/labels/kubeheal.io~1quarantined", "value": "true" }'}]
        </div>
      ),
    },
    {
      id: 'step-4',
      time: '00:14:22.450',
      delta: '+350ms',
      category: 'controller',
      categoryLabel: 'Controller',
      badge: 'Deployment Rollback',
      badgeType: 'primary',
      dotColor: 'bg-primary',
      title: (
        <>
          Triggered autonomous revision decrement on Deployment{' '}
          <code className="px-1.5 py-0.5 rounded bg-surface-container-lowest font-mono-code text-mono-code text-on-surface">
            payment-service
          </code>{' '}
          to stable revision SHA <span className="text-secondary font-mono-code">e81fa4</span>.
        </>
      ),
    },
    {
      id: 'step-5',
      time: '00:14:23.960',
      delta: '+1,860ms',
      category: 'mesh',
      categoryLabel: 'Health Check',
      badge: '200 OK Readiness',
      badgeType: 'secondary',
      dotColor: 'bg-secondary',
      title: (
        <>
          Replacement pod{' '}
          <code className="px-1.5 py-0.5 rounded bg-surface-container-lowest font-mono-code text-mono-code text-secondary">
            payment-service-59c8d64b7-mn41
          </code>{' '}
          passed HTTP <code className="font-mono-code">/healthz</code> liveness/readiness probes (latency: 4ms). Incident automatically closed.
        </>
      ),
    },
  ];

  // GSAP Entrance & Counting Animation
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Staggered header and sections entrance
      tl.from('.forensic-header', { y: -20, opacity: 0, duration: 0.6 })
        .from('.forensic-banner', { y: 25, opacity: 0, duration: 0.7 }, '-=0.3')
        .from('.timeline-step-card', {
          x: -20,
          opacity: 0,
          stagger: 0.1,
          duration: 0.6,
        }, '-=0.4')
        .from('.forensic-right-col', { x: 25, opacity: 0, duration: 0.7 }, '-=0.6');

      // Stopclock Numeric GSAP interpolation
      if (stopclockRef.current) {
        const obj = { val: 0.0 };
        gsap.to(obj, {
          val: 1.86,
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: () => {
            if (stopclockRef.current) {
              stopclockRef.current.innerText = `${obj.val.toFixed(2)}s`;
            }
          },
        });
      }

      // Animated chart line reveal
      if (chartPathRef.current) {
        const pathLength = chartPathRef.current.getTotalLength();
        gsap.fromTo(
          chartPathRef.current,
          { strokeDasharray: pathLength, strokeDashoffset: pathLength },
          { strokeDashoffset: 0, duration: 2.0, ease: 'power2.inOut', delay: 0.4 }
        );
      }
    },
    { scope: containerRef }
  );

  // Trigger Re-run Diagnostics Simulation
  const handleRerunDiagnostics = () => {
    if (isRerunning) return;
    setIsRerunning(true);
    setDiagnosticProgress('Probing eBPF tracepoints and memory allocation stack...');

    setTimeout(() => {
      setDiagnosticProgress('Analyzing V8 heap serialization profiles in /v1/checkout/process...');
    }, 600);

    setTimeout(() => {
      setDiagnosticProgress('Validation complete: 99.1% Confidence confirmed. No regression detected.');
    }, 1200);

    setTimeout(() => {
      setIsRerunning(false);
      setDiagnosticProgress(null);
    }, 2200);
  };

  const handleCopyPostMortem = () => {
    const postMortemMarkdown = `# Post-Mortem Report: INC-8492
**Incident:** CrashLoopBackOff in payment-service
**Severity:** P1 (Mitigated)
**MTTR:** 1.86s (Autonomous)
**Status:** RESOLVED

## Timeline
- 00:14:22.100 (+0ms): eBPF intercepted ExitCode 137 (SIGKILL) on payment-service-75b4f85d4f-xk92
- 00:14:22.240 (+140ms): KubeHeal Bus Dispatch: ANOMALY_HEAP_EXHAUSTION
- 00:14:22.310 (+210ms): Ingress Mesh Quarantine applied via Strategic Merge Patch
- 00:14:22.450 (+350ms): Rollback dispatched to stable image (sha:e81fa4)
- 00:14:23.960 (+1860ms): Replacement pod payment-service-59c8d64b7-mn41 200 OK /healthz

## Root Cause
Deterministic unbounded buffer leak identified in commit 8d4f82 via unthrottled request stream serialization in /v1/checkout/process.

## Impact
- 0 Dropped User Sessions
- 0.00% Error Budget Depleted
`;
    navigator.clipboard.writeText(postMortemMarkdown);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const filteredEvents = timelineEvents.filter((item) => {
    if (filter === 'all') return true;
    return item.category === filter;
  });

  return (
    <div ref={containerRef} className="relative w-full min-h-screen bg-surface-container-lowest pb-16 select-none">
      {/* Subtle cybernetic focal background elements */}
      <div className="relative w-full px-6 py-6 max-w-[1440px] mx-auto flex flex-col gap-6">
        <div className="pointer-events-none absolute top-10 left-1/3 w-[500px] h-[300px] bg-primary/5 rounded-full blur-[120px] -z-10" />
        <div className="pointer-events-none absolute top-60 right-10 w-[420px] h-[320px] bg-secondary/5 rounded-full blur-[140px] -z-10" />

        {/* TOP INCIDENT HEADER */}
        <header className="forensic-header flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate?.('overview')}
              className="group inline-flex items-center gap-1.5 font-mono-code text-mono-code text-outline hover:text-on-surface transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-0.5">
                arrow_back
              </span>
              <span>Back to Incidents</span>
            </button>
            <span className="text-outline-variant font-mono-code text-mono-code">/</span>
            <span className="font-mono-code text-mono-code text-outline-variant">forensics</span>
            <span className="text-outline-variant font-mono-code text-mono-code">/</span>
            <span className="font-mono-code text-mono-code text-tertiary">payment-engine</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3.5">
              <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-semibold">
                INC-8492: CrashLoopBackOff in payment-service
              </h1>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-secondary/10 shadow-[0_0_16px_-4px_rgba(78,222,163,0.3)] border border-secondary/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
                </span>
                <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider font-semibold">
                  RESOLVED (AUTONOMOUS)
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono-code text-mono-code text-outline">
                <span className="material-symbols-outlined text-sm text-outline">schedule</span>
                <span>Sept 07, 2026 00:14:22 UTC</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRerunDiagnostics}
                disabled={isRerunning}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all shadow-sm border border-surface-container/60 cursor-pointer active:scale-95"
                id="rerun-btn"
              >
                <span className={`material-symbols-outlined text-sm text-tertiary ${isRerunning ? 'animate-spin' : ''}`}>
                  refresh
                </span>
                <span className="font-body-md text-body-md font-medium">
                  {isRerunning ? 'Running Diagnostics...' : 'Re-run Diagnostics'}
                </span>
              </button>

              <button
                onClick={() => setIsExportOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-container text-on-primary font-body-md text-body-md font-semibold hover:bg-primary transition-all shadow-[0_0_16px_rgba(128,131,255,0.4)] active:scale-[0.98] cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Export Post-Mortem (PDF / MD)</span>
              </button>
            </div>
          </div>

          {/* Diagnostic Progress Banner when running */}
          <AnimatePresence>
            {diagnosticProgress && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-lg bg-tertiary/10 border border-tertiary/30 text-tertiary font-mono-code text-body-sm flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                <span>{diagnosticProgress}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* SECTION 1: MTTR PRECISION STOPCLOCK BANNER */}
        <section className="forensic-banner rounded-xl bg-surface-container-low/80 backdrop-blur-md shadow-xl p-5 relative overflow-hidden border border-surface-container/60">
          <div className="absolute inset-0 bg-gradient-to-r from-tertiary/5 via-primary/5 to-secondary/5 pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Stages Stepper (9 Cols) */}
            <div className="lg:col-span-9 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Stage 1 */}
              <div className="flex-1 flex flex-col gap-2 p-3.5 rounded-lg bg-surface-container/60 border border-surface-container/40 hover:border-tertiary/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">STAGE 01</span>
                  <span className="px-2 py-0.5 rounded-full bg-tertiary/15 font-mono-code text-mono-code text-tertiary font-medium">
                    140ms
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary text-lg">radar</span>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">Detection (MTTD)</h3>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  CoreV1 Watch stream intercepted non-zero container exit code{' '}
                  <span className="text-error font-mono-code font-bold">137 SIGKILL</span>.
                </p>
              </div>

              {/* Connector 1 */}
              <div className="hidden md:flex flex-col items-center justify-center px-1">
                <div className="w-10 h-1 bg-gradient-to-r from-tertiary to-primary-container rounded-full shadow-[0_0_8px_rgba(76,215,246,0.5)] animate-pulse" />
              </div>

              {/* Stage 2 */}
              <div className="flex-1 flex flex-col gap-2 p-3.5 rounded-lg bg-surface-container/60 border border-surface-container/40 hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">STAGE 02</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary-container/20 font-mono-code text-mono-code text-primary font-medium">
                    320ms
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">smart_toy</span>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">Autonomous Decision</h3>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Runbook matched: <span className="text-on-surface font-mono-code">CrashLoopBackOff</span> → Mesh Quarantine +
                  Strategic Patch.
                </p>
              </div>

              {/* Connector 2 */}
              <div className="hidden md:flex flex-col items-center justify-center px-1">
                <div className="w-10 h-1 bg-gradient-to-r from-primary-container to-secondary rounded-full shadow-[0_0_8px_rgba(78,222,163,0.5)] animate-pulse" />
              </div>

              {/* Stage 3 */}
              <div className="flex-1 flex flex-col gap-2 p-3.5 rounded-lg bg-surface-container/60 border border-surface-container/40 hover:border-secondary/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">STAGE 03</span>
                  <span className="px-2 py-0.5 rounded-full bg-secondary/15 font-mono-code text-mono-code text-secondary font-medium">
                    1.40s
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-lg">verified</span>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">Cluster Recovery</h3>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Replacement pod passed readiness probe; stale revision unrouted from mesh fabric.
                </p>
              </div>
            </div>

            {/* Metric Highlight Card (3 Cols) */}
            <div className="lg:col-span-3 flex flex-col justify-center items-center lg:items-end p-4 rounded-xl bg-surface-container-high/90 shadow-inner border border-surface-container/80">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest text-right">
                Total Autonomous MTTR
              </span>
              <div className="flex items-baseline gap-1 my-1">
                <span
                  ref={stopclockRef}
                  className="font-mono-metric-lg text-[36px] text-secondary font-bold tracking-tight drop-shadow-[0_0_12px_rgba(78,222,163,0.4)]"
                >
                  1.86s
                </span>
                <span className="font-mono-code text-mono-code text-outline">elapsed</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary/10 border border-secondary/20">
                <span className="material-symbols-outlined text-xs text-secondary">trending_down</span>
                <span className="font-mono-code text-mono-code text-secondary font-semibold">-96% vs Human SLA</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: SPLIT INVESTIGATION PANELS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT COLUMN (7 Cols): AUDIT STREAM */}
          <section className="lg:col-span-7 flex flex-col gap-4 rounded-xl bg-surface-container-low/75 backdrop-blur-md shadow-lg p-5 border border-surface-container/60">
            {/* Sub-header & Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-container/50">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-surface-container-high border border-surface-container/40">
                  <span className="material-symbols-outlined text-tertiary text-base">history_edu</span>
                </div>
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                    Event Telemetry & Audit Stream
                  </h2>
                  <span className="font-body-sm text-body-sm text-outline">5 microsecond stages executed sequentially</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Filter Pills */}
                <div className="flex items-center bg-surface-container-highest/60 rounded-lg p-0.5 border border-surface-container/40" id="filter-group">
                  {(['all', 'ebpf', 'controller', 'mesh'] as const).map((cat) => {
                    const labels: Record<string, string> = {
                      all: 'All (5)',
                      ebpf: 'eBPF',
                      controller: 'Controller',
                      mesh: 'Mesh',
                    };
                    const isActive = filter === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-2.5 py-1 rounded font-mono-code text-mono-code transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-surface-container-high text-on-surface font-medium shadow-sm'
                            : 'text-outline hover:text-on-surface'
                        }`}
                      >
                        {labels[cat]}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setIsJsonModalOpen(true)}
                  className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface transition-all border border-surface-container/60 cursor-pointer"
                  title="Export raw JSON log"
                >
                  <span className="material-symbols-outlined text-sm">terminal</span>
                </button>
              </div>
            </div>

            {/* Chronological Millisecond Stepper */}
            <div className="relative flex flex-col pl-4 mt-2">
              {/* Continuous Vertical Timeline Track */}
              <div className="absolute left-6 top-3 bottom-6 w-0.5 bg-surface-container-highest" />

              <AnimatePresence>
                {filteredEvents.map((ev) => (
                  <motion.div
                    key={ev.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="timeline-step-card relative flex items-start gap-4 pb-6 group"
                  >
                    <div
                      className={`relative z-10 flex items-center justify-center w-5 h-5 rounded-full ${
                        ev.category === 'ebpf'
                          ? 'bg-error/20 ring-4 ring-surface-container-low shadow-[0_0_12px_rgba(255,180,171,0.4)]'
                          : ev.category === 'controller'
                          ? 'bg-tertiary/20 ring-4 ring-surface-container-low shadow-[0_0_10px_rgba(76,215,246,0.3)]'
                          : 'bg-secondary/20 ring-4 ring-surface-container-low shadow-[0_0_14px_rgba(78,222,163,0.4)]'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${ev.dotColor}`} />
                    </div>

                    <div className="flex-1 rounded-lg bg-surface-container/60 p-3.5 hover:bg-surface-container transition-all border border-surface-container/40">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono-code text-mono-code font-semibold ${
                              ev.category === 'ebpf'
                                ? 'text-error'
                                : ev.category === 'controller'
                                ? 'text-tertiary'
                                : 'text-secondary'
                            }`}
                          >
                            {ev.time}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded font-label-caps text-label-caps uppercase ${
                              ev.badgeType === 'error'
                                ? 'bg-error/15 text-error'
                                : ev.badgeType === 'tertiary'
                                ? 'bg-tertiary/15 text-tertiary'
                                : ev.badgeType === 'secondary'
                                ? 'bg-secondary/15 text-secondary'
                                : 'bg-primary/15 text-primary'
                            }`}
                          >
                            {ev.badge}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-surface-variant font-label-caps text-label-caps text-outline uppercase">
                            {ev.categoryLabel}
                          </span>
                        </div>
                        <span className="font-mono-code text-mono-code text-outline">{ev.delta}</span>
                      </div>

                      <p className="font-body-md text-body-md text-on-surface mt-1.5 leading-relaxed">{ev.title}</p>
                      {ev.detailPayload}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* AUTONOMOUS RCA CONFIDENCE BOX */}
            <div className="mt-2 rounded-xl bg-surface-container-high/90 p-4 shadow-md flex flex-col gap-3 relative overflow-hidden border border-surface-container/70">
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-secondary shadow-[0_0_12px_rgba(78,222,163,0.8)]" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-base">psychology</span>
                  <span className="font-headline-md text-headline-md text-on-surface font-semibold">
                    Autonomous RCA Engine
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/15 border border-secondary/20">
                  <span className="font-mono-code text-mono-code text-secondary font-bold">99.1% Confidence Match</span>
                </div>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Deterministic unbounded buffer leak identified in commit{' '}
                <span className="font-mono-code text-tertiary bg-surface-container px-1 py-0.5 rounded border border-tertiary/20">
                  8d4f82
                </span>{' '}
                via unthrottled request stream serialization in{' '}
                <code className="font-mono-code text-on-surface bg-surface-container-lowest px-1 py-0.5 rounded">
                  /v1/checkout/process
                </code>
                . KubeHeal autonomous rollback successfully averted catastrophic cascading failure across order orchestration.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="font-label-caps text-label-caps text-outline uppercase">Impact Assessment:</span>
                <span className="px-2 py-0.5 rounded bg-surface-container font-mono-code text-mono-code text-on-surface border border-surface-container/60">
                  0 Dropped User Sessions
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-container font-mono-code text-mono-code text-secondary border border-secondary/20">
                  0.00% Error Budget Depleted
                </span>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN (5 Cols): WORKLOAD DIFF & METRIC CHART */}
          <div className="forensic-right-col lg:col-span-5 flex flex-col gap-5">
            {/* CARD 1: WORKLOAD SPEC DIFF */}
            <div className="rounded-xl bg-surface-container-low/80 backdrop-blur-md shadow-lg p-5 flex flex-col gap-3 border border-surface-container/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-surface-container-high border border-surface-container/40">
                    <span className="material-symbols-outlined text-primary text-base">difference</span>
                  </div>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Workload Spec Diff</h2>
                </div>
                <span className="font-mono-code text-mono-code text-outline text-[11px]">
                  Rev 4 (Faulty) → Rev 3 (Rollback)
                </span>
              </div>

              {/* Code Diff Viewer */}
              <div className="rounded-lg bg-surface-container-lowest p-3 font-mono-code text-mono-code overflow-x-auto shadow-inner border border-surface-container/60">
                <div className="text-outline-variant font-label-caps text-label-caps pb-2 mb-2 flex justify-between border-b border-surface-container-highest/40">
                  <span>spec.template.spec.containers[0]</span>
                  <span>k8s/payment-deployment.yaml</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="text-outline flex gap-3">
                    <span className="select-none text-outline-variant w-4 text-right">18</span>
                    <span>&nbsp;&nbsp;name: payment-service-core</span>
                  </div>
                  {/* Red Dels */}
                  <div className="bg-error-container/20 text-error flex gap-3 px-1 py-0.5 rounded-sm border-l-2 border-error">
                    <span className="select-none text-error/60 w-4 text-right">19</span>
                    <span>- image: registry.internal/payment:v2.4.1</span>
                  </div>
                  <div className="bg-error-container/20 text-error flex gap-3 px-1 py-0.5 rounded-sm border-l-2 border-error">
                    <span className="select-none text-error/60 w-4 text-right">20</span>
                    <span>- memory: 256Mi (OOM ceiling reached)</span>
                  </div>
                  <div className="bg-error-container/20 text-error flex gap-3 px-1 py-0.5 rounded-sm border-l-2 border-error">
                    <span className="select-none text-error/60 w-4 text-right">21</span>
                    <span>- env: ENABLE_PAYLOAD_BUFFER="true"</span>
                  </div>
                  {/* Green Adds */}
                  <div className="bg-secondary-container/20 text-secondary flex gap-3 px-1 py-0.5 rounded-sm border-l-2 border-secondary">
                    <span className="select-none text-secondary/60 w-4 text-right">19</span>
                    <span>+ image: registry.internal/payment:v2.4.0</span>
                  </div>
                  <div className="bg-secondary-container/20 text-secondary flex gap-3 px-1 py-0.5 rounded-sm border-l-2 border-secondary">
                    <span className="select-none text-secondary/60 w-4 text-right">20</span>
                    <span>+ memory: 512Mi (headroom adjusted)</span>
                  </div>
                  <div className="bg-secondary-container/20 text-secondary flex gap-3 px-1 py-0.5 rounded-sm border-l-2 border-secondary">
                    <span className="select-none text-secondary/60 w-4 text-right">21</span>
                    <span>+ env: ENABLE_PAYLOAD_BUFFER="false"</span>
                  </div>
                  <div className="text-outline flex gap-3">
                    <span className="select-none text-outline-variant w-4 text-right">22</span>
                    <span>&nbsp;&nbsp;readinessProbe: /healthz:8080</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: METRICS TELEMETRY SNAPSHOT */}
            <div className="rounded-xl bg-surface-container-low/80 backdrop-blur-md shadow-lg p-5 flex flex-col gap-4 border border-surface-container/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-surface-container-high border border-surface-container/40">
                    <span className="material-symbols-outlined text-tertiary text-base">show_chart</span>
                  </div>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                    Telemetry Crash Forensics
                  </h2>
                </div>
                <span className="font-label-caps text-label-caps text-error bg-error/10 border border-error/20 px-2 py-0.5 rounded uppercase font-semibold">
                  OOMKill Triggered
                </span>
              </div>

              {/* Chart Description / Meta */}
              <div className="flex items-center justify-between text-body-sm font-mono-code text-outline">
                <span>Metric: container_memory_working_set_bytes</span>
                <span>Sample Rate: 100ms</span>
              </div>

              {/* Telemetry SVG Graph */}
              <div className="w-full bg-surface-container-lowest rounded-lg p-3 relative overflow-hidden border border-surface-container/50">
                <svg className="w-full h-44 text-on-surface" fill="none" viewBox="0 0 460 170" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    {/* Memory Gradient Fill */}
                    <linearGradient id="memGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#ffb4ab" stopOpacity="0.45" />
                      <stop offset="60%" stopColor="#4cd7f6" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#4cd7f6" stopOpacity="0.0" />
                    </linearGradient>
                    {/* Replacement Pod Fill */}
                    <linearGradient id="recoveredGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#4edea3" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#4edea3" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Horizontal Lines */}
                  <line stroke="currentColor" strokeDasharray="3 3" strokeOpacity="0.08" x1="40" x2="450" y1="20" y2="20" />
                  <line stroke="currentColor" strokeDasharray="3 3" strokeOpacity="0.08" x1="40" x2="450" y1="65" y2="65" />
                  <line stroke="currentColor" strokeDasharray="3 3" strokeOpacity="0.08" x1="40" x2="450" y1="110" y2="110" />
                  <line stroke="currentColor" strokeOpacity="0.15" x1="40" x2="450" y1="145" y2="145" />

                  {/* Axis Labels */}
                  <text className="font-mono-code" fill="#ffb4ab" fontSize="9" textAnchor="end" x="32" y="24">
                    256M
                  </text>
                  <text className="font-mono-code" fill="#908fa0" fontSize="9" textAnchor="end" x="32" y="69">
                    180M
                  </text>
                  <text className="font-mono-code" fill="#908fa0" fontSize="9" textAnchor="end" x="32" y="114">
                    90M
                  </text>
                  <text className="font-mono-code" fill="#908fa0" fontSize="9" textAnchor="end" x="32" y="148">
                    0
                  </text>

                  {/* OOM Limit Threshold line (256MB) */}
                  <line stroke="#ffb4ab" strokeDasharray="4 2" strokeWidth="1.5" x1="40" x2="450" y1="20" y2="20" />

                  {/* Memory Ramp-Up Curve Area */}
                  <path
                    d="M 40 120 C 110 115, 160 100, 210 75 C 240 60, 270 35, 290 20 L 290 145 L 40 145 Z"
                    fill="url(#memGradient)"
                  />

                  {/* Memory Stroke Line */}
                  <path
                    ref={chartPathRef}
                    d="M 40 120 C 110 115, 160 100, 210 75 C 240 60, 270 35, 290 20"
                    stroke="#4cd7f6"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                  />

                  {/* SIGKILL Dropdown Line */}
                  <line stroke="#ffb4ab" strokeDasharray="2 2" strokeWidth="2" x1="290" x2="290" y1="20" y2="145" />

                  {/* Incident Marker Point */}
                  <circle className="animate-pulse" cx="290" cy="20" fill="#ffb4ab" r="4.5" />

                  {/* Replacement Pod Curve Area & Line */}
                  <path d="M 305 145 L 305 112 C 330 110, 380 112, 450 110 L 450 145 Z" fill="url(#recoveredGradient)" />
                  <path
                    d="M 305 112 C 330 110, 380 112, 450 110"
                    stroke="#4edea3"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                  />
                  <circle cx="305" cy="112" fill="#4edea3" r="3.5" />

                  {/* Annotations */}
                  <text
                    className="font-mono-code"
                    fill="#ffb4ab"
                    fontSize="9"
                    fontWeight="600"
                    textAnchor="end"
                    x="286"
                    y="14"
                  >
                    OOM SIGKILL (00:14:22.100)
                  </text>
                  <text
                    className="font-mono-code"
                    fill="#4edea3"
                    fontSize="9"
                    fontWeight="600"
                    textAnchor="start"
                    x="315"
                    y="102"
                  >
                    Replacement Baseline: 92MiB
                  </text>
                </svg>
              </div>

              {/* Chart Legends */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-mono-code text-mono-code text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-tertiary" />
                  <span className="text-on-surface-variant">Memory Usage (MiB)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-error" />
                  <span className="text-on-surface-variant">OOM Ceiling (256MiB)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-secondary" />
                  <span className="text-on-surface-variant">Replacement Pod v2.4.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EXPORT POST-MORTEM MODAL */}
      <AnimatePresence>
        {isExportOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-xl bg-surface-container-high rounded-xl border border-surface-container-highest shadow-2xl p-6 flex flex-col gap-4 font-mono-code"
            >
              <div className="flex items-center justify-between border-b border-surface-container pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">description</span>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
                    Export Post-Mortem Report
                  </h3>
                </div>
                <button
                  onClick={() => setIsExportOpen(false)}
                  className="text-outline hover:text-on-surface transition"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-outline text-xs uppercase font-label-caps">Format:</span>
                {(['md', 'pdf', 'json'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setExportFormat(fmt)}
                    className={`px-3 py-1 rounded text-xs uppercase transition ${
                      exportFormat === fmt
                        ? 'bg-primary text-on-primary font-bold shadow'
                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>

              <div className="p-3.5 rounded-lg bg-surface-container-lowest text-[11px] text-[#ABB2BF] leading-relaxed max-h-56 overflow-y-auto border border-surface-container/60">
                <div className="text-secondary font-bold pb-1"># Post-Mortem Report: INC-8492</div>
                <div>Incident: CrashLoopBackOff in payment-service</div>
                <div>MTTR: 1.86s (Autonomous Self-Heal)</div>
                <div>Root Cause: Unbounded buffer leak in commit 8d4f82</div>
                <div>Resolution: Autonomous rollback to sha: e81fa4</div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-outline">Generated by KubeHeal Autonomous Engine</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyPostMortem}
                    className="px-3 py-1.5 rounded bg-surface-container text-on-surface hover:bg-surface-container-highest transition text-xs font-semibold flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-xs">
                      {isCopied ? 'check' : 'content_copy'}
                    </span>
                    <span>{isCopied ? 'Copied!' : 'Copy to Clipboard'}</span>
                  </button>
                  <button
                    onClick={() => {
                      handleCopyPostMortem();
                      setIsExportOpen(false);
                    }}
                    className="px-4 py-1.5 rounded bg-primary-container text-on-primary hover:bg-primary transition text-xs font-semibold shadow"
                  >
                    Download ({exportFormat.toUpperCase()})
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RAW JSON EVENT MODAL */}
      <AnimatePresence>
        {isJsonModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl bg-surface-container-high rounded-xl border border-surface-container-highest shadow-2xl p-6 flex flex-col gap-4 font-mono-code"
            >
              <div className="flex items-center justify-between border-b border-surface-container pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary text-xl">terminal</span>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
                    Raw JSON Event Telemetry
                  </h3>
                </div>
                <button
                  onClick={() => setIsJsonModalOpen(false)}
                  className="text-outline hover:text-on-surface transition"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <pre className="p-4 rounded-lg bg-[#05070B] text-[#98C379] text-xs leading-5 max-h-80 overflow-y-auto border border-surface-container/60 select-text">
{JSON.stringify(
  {
    incident_id: "INC-8492",
    target_workload: "payment-service",
    namespace: "default",
    failure_type: "CrashLoopBackOff",
    kernel_event: {
      timestamp: "2026-09-07T00:14:22.100Z",
      probe: "ebpf/oom_reaper",
      signal: "SIGKILL_137",
      rss_bytes: 268435456
    },
    autonomous_action: {
      action: "QUARANTINE_AND_ROLLBACK",
      target_sha: "e81fa4",
      mttd_ms: 140,
      decision_ms: 320,
      mttr_ms: 1860,
      confidence: 0.991
    }
  },
  null,
  2
)}
              </pre>

              <div className="flex items-center justify-end">
                <button
                  onClick={() => setIsJsonModalOpen(false)}
                  className="px-4 py-1.5 rounded bg-surface-container-highest text-on-surface text-xs font-semibold hover:bg-surface-variant transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
