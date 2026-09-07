import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface ChaosResilienceLabPageProps {
  onNavigate?: (path: string) => void;
}

interface LogEntry {
  id: string;
  time: string;
  text: string;
  type: 'error' | 'tertiary' | 'primary' | 'secondary' | 'outline';
}

export const ChaosResilienceLabPage: React.FC<ChaosResilienceLabPageProps> = ({ onNavigate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const radialRingRef = useRef<SVGCircleElement>(null);
  const faultCurveRef = useRef<SVGPathElement>(null);
  const responseCurveRef = useRef<SVGPathElement>(null);

  // Active cluster selection
  const [selectedCluster] = useState('kind-kubeheal');

  // Emergency halt state
  const [isEmergencyHalt, setIsEmergencyHalt] = useState(false);

  // Memory surge slider
  const [memPressure, setMemPressure] = useState<number>(768);

  // Active drill telemetry state
  const [activeDrill, setActiveDrill] = useState<{
    id: string;
    name: string;
    target: string;
    mttr: string;
    status: 'measuring' | 'resolved';
  }>({
    id: 'CH-409',
    name: 'CrashLoop exit 1',
    target: 'pod/payment-service-58d7c9',
    mttr: '1.48s',
    status: 'resolved',
  });

  // Telemetry logs
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      time: '[14:31:02.102]',
      text: '• SIGTERM sent to pod/payment-service-58d7c9',
      type: 'error',
    },
    {
      id: '2',
      time: '[14:31:02.215]',
      text: '• KubeHeal Operator: Anomaly alert validated',
      type: 'tertiary',
    },
    {
      id: '3',
      time: '[14:31:02.420]',
      text: '• Service route unlinked from crashing instance',
      type: 'primary',
    },
    {
      id: '4',
      time: '[14:31:03.582]',
      text: '• Standby replica promoted & healthcheck PASS',
      type: 'secondary',
    },
  ]);

  // Inject button loading states
  const [injectingVector, setInjectingVector] = useState<string | null>(null);

  // GSAP Entrance and Radial Score Animation
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        '.chaos-header',
        { y: -15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, clearProps: 'all' }
      )
        .fromTo(
          '.resilience-hero',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, clearProps: 'all' },
          '-=0.2'
        )
        .fromTo(
          '.sub-meter-bar',
          { scaleX: 0 },
          { scaleX: 1, transformOrigin: 'left', duration: 0.8, stagger: 0.08, clearProps: 'transform' },
          '-=0.2'
        )
        .fromTo(
          '.fault-card',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.08, duration: 0.5, clearProps: 'all' },
          '-=0.2'
        )
        .fromTo(
          '.telemetry-section',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, clearProps: 'all' },
          '-=0.2'
        );

      // Animate Radial Score Arc
      if (radialRingRef.current) {
        gsap.fromTo(
          radialRingRef.current,
          { strokeDashoffset: 314 },
          { strokeDashoffset: 6.28, duration: 1.6, ease: 'power2.out', delay: 0.1 }
        );
      }

      // Safe SVG Curves Reveal
      try {
        if (faultCurveRef.current) {
          const len = faultCurveRef.current.getTotalLength() || 800;
          gsap.fromTo(
            faultCurveRef.current,
            { strokeDasharray: len, strokeDashoffset: len },
            { strokeDashoffset: 0, duration: 1.4, ease: 'power2.out', delay: 0.3 }
          );
        }
        if (responseCurveRef.current) {
          const len = responseCurveRef.current.getTotalLength() || 800;
          gsap.fromTo(
            responseCurveRef.current,
            { strokeDasharray: len, strokeDashoffset: len },
            { strokeDashoffset: 0, duration: 1.6, ease: 'power2.out', delay: 0.4 }
          );
        }
      } catch {
        // Fallback gracefully
      }
    },
    { scope: containerRef }
  );

  // Chaos Drill Injection Trigger
  const runChaosDrill = (vectorName: string, targetEntity: string, drillCode: string) => {
    if (injectingVector) return;
    setInjectingVector(vectorName);

    const now = new Date();
    const timeStr = `[${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}]`;

    setActiveDrill({
      id: drillCode,
      name: vectorName,
      target: targetEntity,
      mttr: 'MEASURING...',
      status: 'measuring',
    });

    setLogs((prev) => [
      {
        id: String(Date.now()),
        time: timeStr,
        text: `→ Injected ${vectorName} on ${targetEntity}`,
        type: 'tertiary',
      },
      ...prev,
    ]);

    setTimeout(() => {
      const resolvedMttr = (1.4 + Math.random() * 0.35).toFixed(2) + 's';
      setActiveDrill((prev) => ({
        ...prev,
        mttr: resolvedMttr,
        status: 'resolved',
      }));

      setLogs((prev) => [
        {
          id: String(Date.now() + 1),
          time: `[+${resolvedMttr}]`,
          text: `• Autonomous Policy resolved ${vectorName} [100% HEALTHY]`,
          type: 'secondary',
        },
        ...prev,
      ]);
      setInjectingVector(null);
    }, 1500);
  };

  // Emergency Halt
  const triggerEmergencyHalt = () => {
    setIsEmergencyHalt(true);
    setLogs((prev) => [
      {
        id: String(Date.now()),
        time: '[EMERGENCY]',
        text: '⚠ MASTER STOP DISPATCHED: All active chaos vectors terminated.',
        type: 'error',
      },
      ...prev,
    ]);

    setTimeout(() => {
      setIsEmergencyHalt(false);
    }, 3200);
  };

  return (
    <div ref={containerRef} className="relative w-full min-h-screen bg-surface-container-lowest select-none pb-16">
      <div className="flex flex-col w-full p-4 lg:p-6 space-y-6 max-w-[1440px] mx-auto text-on-surface">
        {/* Breadcrumb / Return Link */}
        {onNavigate && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('overview')}
              className="group inline-flex items-center gap-1.5 font-mono-code text-mono-code text-outline hover:text-on-surface transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-0.5">
                arrow_back
              </span>
              <span>Back to Overview</span>
            </button>
            <span className="text-outline-variant font-mono-code text-mono-code">/</span>
            <button
              onClick={() => onNavigate('autonomous')}
              className="font-mono-code text-mono-code text-outline hover:text-on-surface transition-colors cursor-pointer"
            >
              runbooks
            </button>
            <span className="text-outline-variant font-mono-code text-mono-code">/</span>
            <span className="font-mono-code text-mono-code text-tertiary">chaos-lab</span>
          </div>
        )}

        {/* TOP ACTION HEADER */}
        <section className="chaos-header flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-semibold">
                Chaos Engineering & Resilience Lab
              </h1>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high text-tertiary border border-tertiary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
                <span className="font-label-caps text-label-caps tracking-wider uppercase font-semibold">
                  Stress Test Environment v1.8
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-surface-container font-mono-code text-mono-code text-outline border border-surface-container/60">
                NAMESPACE: kubeheal-chaos-sandbox
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Inject real-world container, network, and node-level degradations to benchmark autonomous MTTR & rollback efficiency.
            </p>
          </div>

          {/* Cluster Target & Master Emergency Stop */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low shadow-sm border border-surface-container/60">
              <span className="material-symbols-outlined text-outline text-base">dns</span>
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-outline uppercase leading-tight">Target Cluster</span>
                <span className="font-mono-code text-mono-code text-on-surface flex items-center gap-1.5">
                  {selectedCluster}
                  <span className="px-1.5 py-0.2 rounded bg-secondary/10 text-secondary font-label-caps text-label-caps font-semibold">
                    2 Nodes
                  </span>
                </span>
              </div>
              <span className="material-symbols-outlined text-outline-variant text-sm ml-1">expand_more</span>
            </div>

            <button
              onClick={triggerEmergencyHalt}
              className={`group flex items-center gap-2 px-4 py-2 rounded-lg transition-all active:scale-95 cursor-pointer ${
                isEmergencyHalt
                  ? 'bg-secondary/20 text-secondary border border-secondary/30 shadow-[0_0_16px_rgba(78,222,163,0.3)]'
                  : 'bg-error-container/30 text-error hover:bg-error-container hover:text-on-error shadow-[0_0_16px_rgba(244,63,94,0.25)] hover:shadow-[0_0_24px_rgba(244,63,94,0.5)] border border-error/30'
              }`}
              id="emergency-kill-btn"
            >
              <span className={`material-symbols-outlined text-base ${isEmergencyHalt ? 'text-secondary' : 'group-hover:animate-spin'}`}>
                {isEmergencyHalt ? 'check_circle' : 'emergency_home'}
              </span>
              <span className="font-label-caps text-label-caps tracking-wider uppercase font-semibold">
                {isEmergencyHalt ? 'All Chaos Aborted' : 'Stop All Active Chaos'}
              </span>
              {!isEmergencyHalt && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-error" />
                </span>
              )}
            </button>
          </div>
        </section>

        {/* CLUSTER RESILIENCE RATING (Top Hero Section) */}
        <section className="resilience-hero w-full rounded-xl bg-surface-container-low/80 backdrop-blur-md shadow-xl p-5 lg:p-6 border border-surface-container/60">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Grade & Benchmark Overview */}
            <div className="lg:col-span-5 flex items-center gap-5 sm:gap-7">
              {/* Radial Concentric Score Ring */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  {/* Background track */}
                  <circle
                    className="text-surface-variant/40"
                    cx="60"
                    cy="60"
                    fill="none"
                    r="50"
                    stroke="currentColor"
                    strokeWidth="8"
                  />
                  {/* Inner track */}
                  <circle
                    className="text-surface-variant/20"
                    cx="60"
                    cy="60"
                    fill="none"
                    r="38"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  {/* Active Score Arc 98% */}
                  <circle
                    ref={radialRingRef}
                    className="text-secondary shadow-[0_0_16px_rgba(78,222,163,0.5)]"
                    cx="60"
                    cy="60"
                    fill="none"
                    r="50"
                    stroke="currentColor"
                    strokeDasharray="314"
                    strokeDashoffset="6.28"
                    strokeLinecap="round"
                    strokeWidth="8"
                  />
                  {/* Inner Telemetry Arc */}
                  <circle
                    className="text-tertiary"
                    cx="60"
                    cy="60"
                    fill="none"
                    r="38"
                    stroke="currentColor"
                    strokeDasharray="238"
                    strokeDashoffset="19"
                    strokeLinecap="round"
                    strokeWidth="4"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-headline-xl text-headline-xl text-secondary font-bold tracking-tighter drop-shadow-[0_0_12px_rgba(78,222,163,0.6)] leading-none">
                    A+
                  </span>
                  <span className="font-label-caps text-label-caps text-outline uppercase tracking-widest mt-1 font-semibold">
                    GRADE
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-secondary/15 text-secondary font-label-caps text-label-caps uppercase font-semibold border border-secondary/20">
                    Top 1% Autonomous SLA
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono-metric-lg text-mono-metric-lg text-on-surface font-semibold">
                    98<span className="text-outline font-mono-code text-mono-code">/100</span>
                  </span>
                  <span className="font-label-caps text-label-caps text-secondary uppercase flex items-center font-semibold">
                    <span className="material-symbols-outlined text-xs">trending_up</span> +4.2% drill
                  </span>
                </div>
                <div className="font-mono-code text-mono-code text-on-surface-variant flex items-center gap-2">
                  <span className="text-outline">Recovery Mean:</span>
                  <span className="text-tertiary font-medium">1.60s MTTR</span>
                  <span className="text-outline-variant">•</span>
                  <span className="text-secondary font-medium">42/42 Restored</span>
                </div>
                <span className="font-body-sm text-body-sm text-outline truncate">
                  Automated policy validation certified across 4 fault vectors.
                </span>
              </div>
            </div>

            {/* 4 Micro-meters / Segmented Sub-score Gauges */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Metric 1 */}
              <div className="flex flex-col p-3 rounded-lg bg-surface-container/60 shadow-sm border border-surface-container/40">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps text-outline uppercase">Pod Failover</span>
                  <span className="font-mono-code text-mono-code text-secondary font-semibold">100%</span>
                </div>
                <div className="w-full bg-surface-variant/40 h-1.5 rounded-full overflow-hidden my-2">
                  <div className="sub-meter-bar bg-secondary h-full rounded-full w-full shadow-[0_0_8px_rgba(78,222,163,0.6)]" />
                </div>
                <div className="flex items-center justify-between font-label-caps text-label-caps text-outline">
                  <span>SIGTERM Latency</span>
                  <span className="text-on-surface font-semibold">310ms</span>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="flex flex-col p-3 rounded-lg bg-surface-container/60 shadow-sm border border-surface-container/40">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps text-outline uppercase">OOM Contain</span>
                  <span className="font-mono-code text-mono-code text-secondary font-semibold">95%</span>
                </div>
                <div className="w-full bg-surface-variant/40 h-1.5 rounded-full overflow-hidden my-2">
                  <div className="sub-meter-bar bg-secondary h-full rounded-full w-[95%] shadow-[0_0_8px_rgba(78,222,163,0.5)]" />
                </div>
                <div className="flex items-center justify-between font-label-caps text-label-caps text-outline">
                  <span>Quarantine</span>
                  <span className="text-on-surface font-semibold">&lt;450ms</span>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="flex flex-col p-3 rounded-lg bg-surface-container/60 shadow-sm border border-surface-container/40">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps text-outline uppercase">Partition Mesh</span>
                  <span className="font-mono-code text-mono-code text-tertiary font-semibold">92%</span>
                </div>
                <div className="w-full bg-surface-variant/40 h-1.5 rounded-full overflow-hidden my-2">
                  <div className="sub-meter-bar bg-tertiary h-full rounded-full w-[92%] shadow-[0_0_8px_rgba(76,215,246,0.5)]" />
                </div>
                <div className="flex items-center justify-between font-label-caps text-label-caps text-outline">
                  <span>Route Reroute</span>
                  <span className="text-on-surface font-semibold">1.2s</span>
                </div>
              </div>

              {/* Metric 4 */}
              <div className="flex flex-col p-3 rounded-lg bg-surface-container/60 shadow-sm border border-surface-container/40">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps text-outline uppercase">Data State</span>
                  <span className="font-mono-code text-mono-code text-secondary font-semibold">100%</span>
                </div>
                <div className="w-full bg-surface-variant/40 h-1.5 rounded-full overflow-hidden my-2">
                  <div className="sub-meter-bar bg-secondary h-full rounded-full w-full shadow-[0_0_8px_rgba(78,222,163,0.6)]" />
                </div>
                <div className="flex items-center justify-between font-label-caps text-label-caps text-outline">
                  <span>PVC Integrity</span>
                  <span className="text-on-surface font-semibold">Zero Loss</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CHAOS FAULT INJECTION MATRIX (Grid of 4 Interactive Cards) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-lg">science</span>
              <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Active Fault Vectors</h2>
              <span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-surface-container-high text-outline border border-surface-container/60">
                4 DRILLS READY
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono-code text-mono-code text-outline hidden sm:inline">Execution Safety Lock:</span>
              <span className="px-2 py-0.5 rounded bg-secondary/15 text-secondary font-mono-code text-mono-code flex items-center gap-1 border border-secondary/20">
                <span className="material-symbols-outlined text-xs">lock_open</span> AIR-GAPPED DRY-RUN PERMITTED
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* CARD 1: CrashLoop Injection */}
            <div className="fault-card flex flex-col justify-between p-4 rounded-xl bg-surface-container-low/75 backdrop-blur hover:bg-surface-container-low transition-all shadow-md group relative overflow-hidden border border-surface-container/50">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-tertiary-container via-primary-container to-transparent" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-surface-container-high text-primary tracking-wider uppercase font-semibold">
                    RB-001 VALIDATION
                  </span>
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2 font-semibold">
                    CrashLoop Trouble
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                    Injects deliberate exit code 1 to evaluate watcher backoff response and rollout triggers.
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="font-label-caps text-label-caps text-outline uppercase">Target Deployment</label>
                  <div className="w-full px-2.5 py-1.5 rounded bg-surface-container flex items-center justify-between text-on-surface border border-surface-container-highest/40">
                    <span className="font-mono-code text-mono-code truncate">payment-service</span>
                    <span className="font-label-caps text-label-caps text-outline">3 REPLICAS</span>
                  </div>
                </div>

                <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-surface-container/60 border border-surface-container/40">
                  <span className="font-label-caps text-label-caps text-outline uppercase">Injection Count</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-code text-mono-code text-primary font-bold">1 Pod</span>
                    <span className="font-label-caps text-label-caps text-outline-variant">(Round-Robin)</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-2">
                <button
                  onClick={() => runChaosDrill('CrashLoop exit 1', 'payment-service-58d7c9', 'CH-409')}
                  disabled={injectingVector !== null}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-primary-container text-on-primary-container font-mono-code text-mono-code font-semibold transition-all hover:shadow-[0_0_16px_rgba(128,131,255,0.4)] active:scale-95 cursor-pointer disabled:opacity-50"
                  id="btn-crash-inject"
                >
                  <span className={`material-symbols-outlined text-base ${injectingVector === 'CrashLoop exit 1' ? 'animate-spin' : ''}`}>
                    restart_alt
                  </span>
                  <span>{injectingVector === 'CrashLoop exit 1' ? 'Injecting Drill...' : 'Inject Pod Crash'}</span>
                </button>
              </div>
            </div>

            {/* CARD 2: Memory Pressure Surge */}
            <div className="fault-card flex flex-col justify-between p-4 rounded-xl bg-surface-container-low/75 backdrop-blur hover:bg-surface-container-low transition-all shadow-md group relative overflow-hidden border border-surface-container/50">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-error via-error-container to-transparent" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-error-container/30 text-error tracking-wider uppercase font-semibold">
                    RB-002 VALIDATION
                  </span>
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2 font-semibold">
                    Memory Surge (OOM)
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                    Allocates buffer pages aggressively until cgroup boundary triggers automated pod quarantine.
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between font-label-caps text-label-caps text-outline uppercase">
                    <span>Leak Pressure Cap</span>
                    <span className="font-mono-code text-mono-code text-error font-bold" id="mem-label">
                      {memPressure} MB
                    </span>
                  </div>
                  <input
                    className="w-full accent-error bg-surface-container h-1.5 rounded-lg cursor-pointer"
                    max="1024"
                    min="128"
                    step="64"
                    type="range"
                    value={memPressure}
                    onChange={(e) => setMemPressure(parseInt(e.target.value, 10))}
                  />
                  <div className="flex justify-between font-label-caps text-label-caps text-outline">
                    <span>128MB</span>
                    <span>512MB</span>
                    <span>1024MB</span>
                  </div>
                </div>

                <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-surface-container/60 border border-surface-container/40">
                  <span className="font-label-caps text-label-caps text-outline uppercase">Quarantine SLA</span>
                  <span className="font-mono-code text-mono-code text-on-surface font-semibold">&lt; 500ms</span>
                </div>
              </div>

              <div className="pt-4 mt-2">
                <button
                  onClick={() => runChaosDrill(`OOM Surge (${memPressure}MB)`, 'redis-cache-cluster', 'CH-410')}
                  disabled={injectingVector !== null}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-error/20 text-error hover:bg-error hover:text-on-error font-mono-code text-mono-code font-semibold transition-all shadow-[0_0_12px_rgba(255,180,171,0.2)] hover:shadow-[0_0_16px_rgba(255,180,171,0.4)] active:scale-95 cursor-pointer disabled:opacity-50"
                  id="btn-mem-inject"
                >
                  <span className={`material-symbols-outlined text-base ${injectingVector?.startsWith('OOM') ? 'animate-spin' : ''}`}>
                    memory
                  </span>
                  <span>{injectingVector?.startsWith('OOM') ? 'Pressuring Memory...' : 'Burn Memory Space'}</span>
                </button>
              </div>
            </div>

            {/* CARD 3: Network Packet Drop & Latency */}
            <div className="fault-card flex flex-col justify-between p-4 rounded-xl bg-surface-container-low/75 backdrop-blur hover:bg-surface-container-low transition-all shadow-md group relative overflow-hidden border border-surface-container/50">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-tertiary via-tertiary-container to-transparent" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-tertiary-container/30 text-tertiary tracking-wider uppercase font-semibold">
                    MESH INTEGRITY
                  </span>
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2 font-semibold">
                    Packet Drop & Delay
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                    Injects Linux tc/qdisc 500ms jitter and 20% packet discard on Ingress proxy mesh.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="px-2 py-1.5 rounded bg-surface-container flex flex-col border border-surface-container-highest/40">
                    <span className="font-label-caps text-label-caps text-outline uppercase">Latency</span>
                    <span className="font-mono-code text-mono-code text-tertiary font-bold">+500ms</span>
                  </div>
                  <div className="px-2 py-1.5 rounded bg-surface-container flex flex-col border border-surface-container-highest/40">
                    <span className="font-label-caps text-label-caps text-outline uppercase">Loss Rate</span>
                    <span className="font-mono-code text-mono-code text-tertiary font-bold">20% Drop</span>
                  </div>
                </div>

                <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-surface-container/60 border border-surface-container/40">
                  <span className="font-label-caps text-label-caps text-outline uppercase">Target</span>
                  <span className="font-mono-code text-mono-code text-on-surface">ingress-contour</span>
                </div>
              </div>

              <div className="pt-4 mt-2">
                <button
                  onClick={() => runChaosDrill('Packet Discard (20%)', 'ingress-contour-envoy', 'CH-411')}
                  disabled={injectingVector !== null}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-tertiary-container/40 text-tertiary hover:bg-tertiary-container hover:text-on-tertiary-container font-mono-code text-mono-code font-semibold transition-all shadow-[0_0_12px_rgba(76,215,246,0.2)] hover:shadow-[0_0_16px_rgba(76,215,246,0.4)] active:scale-95 cursor-pointer disabled:opacity-50"
                  id="btn-net-inject"
                >
                  <span className={`material-symbols-outlined text-base ${injectingVector?.includes('Packet') ? 'animate-spin' : ''}`}>
                    wifi_off
                  </span>
                  <span>{injectingVector?.includes('Packet') ? 'Degrading Mesh...' : 'Degrade Network'}</span>
                </button>
              </div>
            </div>

            {/* CARD 4: Node NotReady Simulation */}
            <div className="fault-card flex flex-col justify-between p-4 rounded-xl bg-surface-container-low/75 backdrop-blur hover:bg-surface-container-low transition-all shadow-md group relative overflow-hidden border border-surface-container/50">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-fixed-dim to-transparent" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-surface-container-high text-primary-fixed tracking-wider uppercase font-semibold">
                    KUBELET TEST
                  </span>
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2 font-semibold">
                    Node NotReady Drill
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                    Suspends kubelet heartbeat daemon to trigger automatic pod eviction and reschedule.
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="font-label-caps text-label-caps text-outline uppercase">Physical / Worker Node</label>
                  <div className="w-full px-2.5 py-1.5 rounded bg-surface-container flex items-center justify-between text-on-surface border border-surface-container-highest/40">
                    <span className="font-mono-code text-mono-code">kind-worker-02</span>
                    <span className="w-2 h-2 rounded-full bg-secondary" />
                  </div>
                </div>

                <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-surface-container/60 border border-surface-container/40">
                  <span className="font-label-caps text-label-caps text-outline uppercase">Failover Target</span>
                  <span className="font-mono-code text-mono-code text-on-surface">kind-worker-01</span>
                </div>
              </div>

              <div className="pt-4 mt-2">
                <button
                  onClick={() => runChaosDrill('NodeHalt (worker-02)', 'kind-worker-02', 'CH-412')}
                  disabled={injectingVector !== null}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-primary/20 text-primary hover:bg-primary hover:text-on-primary font-mono-code text-mono-code font-semibold transition-all shadow-[0_0_12px_rgba(192,193,255,0.2)] hover:shadow-[0_0_16px_rgba(192,193,255,0.4)] active:scale-95 cursor-pointer disabled:opacity-50"
                  id="btn-node-inject"
                >
                  <span className={`material-symbols-outlined text-base ${injectingVector?.includes('NodeHalt') ? 'animate-spin' : ''}`}>
                    electrical_services
                  </span>
                  <span>{injectingVector?.includes('NodeHalt') ? 'Halting Node...' : 'Halt Kubelet Node'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* REAL-TIME EXPERIMENT TELEMETRY SECTION */}
        <section className="telemetry-section w-full rounded-xl bg-surface-container-low/90 backdrop-blur-md shadow-2xl p-5 flex flex-col space-y-4 border border-surface-container/60">
          {/* Telemetry Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-surface-container/50">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
                    Real-Time Experiment Telemetry
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-secondary/15 text-secondary font-mono-code text-mono-code font-semibold border border-secondary/20">
                    DRILL #{activeDrill.id} ACTIVE
                  </span>
                </div>
                <span className="font-mono-code text-mono-code text-outline">
                  Target: {activeDrill.target} • Injection Mode: {activeDrill.name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto flex-wrap">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-surface-container font-mono-code text-mono-code border border-surface-container-highest/40">
                <span className="text-outline">MTTR Probe:</span>
                <span
                  className={
                    activeDrill.status === 'measuring'
                      ? 'text-tertiary font-bold animate-pulse'
                      : 'text-secondary font-bold'
                  }
                  id="mttr-readout"
                >
                  {activeDrill.mttr}
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container font-mono-code text-mono-code text-outline border border-surface-container-highest/40">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
                <span>WebSocket 12ms</span>
              </div>
            </div>
          </div>

          {/* Telemetry Visualizer Chart & Action Step Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Graph Viewport (8 Columns) */}
            <div className="lg:col-span-8 rounded-lg bg-surface-container-lowest/80 p-4 relative flex flex-col justify-between overflow-hidden min-h-[220px] border border-surface-container/50">
              {/* Chart Overlays & Legend */}
              <div className="flex items-center justify-between text-xs mb-2 z-10 flex-wrap gap-2">
                <div className="flex items-center gap-4 font-label-caps text-label-caps uppercase">
                  <span className="flex items-center gap-1.5 text-error font-semibold">
                    <span className="w-3 h-0.5 bg-error rounded-full" /> Injected Fault Amplitude
                  </span>
                  <span className="flex items-center gap-1.5 text-secondary font-semibold">
                    <span className="w-3 h-0.5 bg-secondary rounded-full" /> Automated Self-Healing Response
                  </span>
                </div>
                <span className="font-mono-code text-mono-code text-outline">Sample window: T-0.00s to T+3.00s</span>
              </div>

              {/* High-Tech Inline SVG Graph Curve */}
              <div className="relative w-full h-36 flex items-center justify-center">
                <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 800 140">
                  {/* Grid Lines */}
                  <line className="text-surface-variant/20" stroke="currentColor" strokeDasharray="4 4" x1="0" x2="800" y1="20" y2="20" />
                  <line className="text-surface-variant/20" stroke="currentColor" strokeDasharray="4 4" x1="0" x2="800" y1="60" y2="60" />
                  <line className="text-surface-variant/20" stroke="currentColor" strokeDasharray="4 4" x1="0" x2="800" y1="100" y2="100" />

                  {/* Vertical Time Markers */}
                  <line className="text-surface-variant/30" stroke="currentColor" x1="160" x2="160" y1="0" y2="140" />
                  <line className="text-surface-variant/30" stroke="currentColor" x1="380" x2="380" y1="0" y2="140" />
                  <line className="text-secondary/30" stroke="currentColor" strokeDasharray="2 2" x1="600" x2="600" y1="0" y2="140" />

                  {/* Red Injected Fault Pulse (Step function) */}
                  <path
                    ref={faultCurveRef}
                    className="filter drop-shadow-[0_0_8px_rgba(255,180,171,0.6)]"
                    d="M 0 120 L 160 120 L 160 25 L 380 25 L 380 120 L 800 120"
                    fill="none"
                    stroke="#ffb4ab"
                    strokeWidth="2.5"
                  />
                  <polygon fill="url(#fault-gradient)" opacity="0.15" points="160,120 160,25 380,25 380,120" />

                  {/* Green Self-Healing Response Curve */}
                  <path
                    ref={responseCurveRef}
                    className="filter drop-shadow-[0_0_10px_rgba(78,222,163,0.7)]"
                    d="M 0 120 L 180 120 Q 230 115 280 85 T 420 35 Q 520 20 600 120 L 800 120"
                    fill="none"
                    stroke="#4edea3"
                    strokeWidth="3"
                  />

                  {/* Gradients */}
                  <defs>
                    <linearGradient id="fault-gradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#ffb4ab" />
                      <stop offset="100%" stopColor="#ffb4ab" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Annotation pins */}
                  <circle className="fill-error animate-ping" cx="160" cy="25" r="4" />
                  <circle className="fill-error" cx="160" cy="25" r="3" />
                  <circle className="fill-tertiary" cx="280" cy="85" r="3" />
                  <circle className="fill-secondary" cx="600" cy="120" r="4" />
                </svg>

                {/* Floating Pin Badges */}
                <div className="absolute left-[20%] top-2 transform -translate-x-1/2 px-2 py-0.5 rounded bg-surface-container-high text-error font-mono-code text-body-sm shadow border border-error/30">
                  T+0.00s: SIGTERM (Exit 1)
                </div>
                <div className="absolute left-[35%] top-12 transform -translate-x-1/2 px-2 py-0.5 rounded bg-surface-container-high text-tertiary font-mono-code text-body-sm shadow border border-tertiary/30">
                  T+0.32s: Quarantine Active
                </div>
                <div className="absolute left-[75%] bottom-5 transform -translate-x-1/2 px-2 py-0.5 rounded bg-surface-container-high text-secondary font-mono-code text-body-sm shadow border border-secondary/30">
                  T+1.48s: Stabilized (100% Ready)
                </div>
              </div>

              {/* Timeline axis ticks */}
              <div className="flex justify-between font-mono-code text-body-sm text-outline pt-1">
                <span>0.0s (Injection)</span>
                <span>0.5s (Anomaly Detect)</span>
                <span>1.0s (Replica Spin)</span>
                <span>1.5s (Traffic Shift)</span>
                <span>2.0s (Steady-State)</span>
                <span>3.0s</span>
              </div>
            </div>

            {/* Live Execution Log & Metrics Summary (4 Columns) */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-3 rounded-lg bg-surface-container-lowest/80 p-4 border border-surface-container/50">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-surface-container/50">
                  <span className="font-label-caps text-label-caps text-outline uppercase font-semibold">
                    Autonomous Audit Stream
                  </span>
                  <span className="font-mono-code text-mono-code text-secondary font-bold">Zero-Loss</span>
                </div>

                {/* Micro Chronological Steps */}
                <div className="space-y-2 font-mono-code text-mono-code pt-2 max-h-48 overflow-y-auto" id="telemetry-log-stream">
                  <AnimatePresence initial={false}>
                    {logs.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-start gap-2 text-on-surface text-xs leading-5"
                      >
                        <span className="text-outline shrink-0">{item.time}</span>
                        <span
                          className={`truncate ${
                            item.type === 'error'
                              ? 'text-error'
                              : item.type === 'tertiary'
                              ? 'text-tertiary'
                              : item.type === 'secondary'
                              ? 'text-secondary'
                              : item.type === 'primary'
                              ? 'text-primary'
                              : 'text-on-surface'
                          }`}
                        >
                          {item.text}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Final Resolution Badge */}
              <div className="pt-2">
                <div className="p-2.5 rounded bg-surface-container flex items-center justify-between border border-surface-container-highest/40">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-base">verified</span>
                    <span className="font-mono-code text-mono-code text-secondary font-semibold">
                      Autonomous Recovery: SUCCESS
                    </span>
                  </div>
                  <span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-secondary/15 text-secondary font-bold">
                    {activeDrill.mttr} MTTR
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
