import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Cluster3DCube } from '../components/Cluster3DCube';
import { ClusterMeshTopology } from './ClusterMeshTopology';
import { AutonomousIncidentForensics } from './AutonomousIncidentForensics';
import { AutonomousRunbooksPage } from './AutonomousRunbooksPage';
import { ChaosResilienceLabPage } from './ChaosResilienceLabPage';
import type { WorkloadItem, RemediationEvent, ClusterStats } from '../types';

// Register GSAP plugins (per gsap-react and gsap-scrolltrigger skills)
gsap.registerPlugin(useGSAP, ScrollTrigger);

export const KubeHealDashboard: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLElement>(null);

  // Navigation active tab
  const [activeNav, setActiveNav] = useState<string>('overview');

  // Workload Type Tab Filter
  const [workloadTab, setWorkloadTab] = useState<'Deployments' | 'DaemonSets' | 'StatefulSets'>('Deployments');
  const [statusFilter, setStatusFilter] = useState<'all' | 'healthy' | 'remediating'>('all');
  const [selectedNamespace, setSelectedNamespace] = useState<string>('default');
  const [isNamespaceOpen, setIsNamespaceOpen] = useState(false);

  // Search query & modal
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Live Stream latency jitter
  const [latencyMs, setLatencyMs] = useState(12);

  // Ticker rotation
  const tickerMessages = [
    '[14:28:02] pod/auth-service-78f9c CrashLoopBackOff detected → Auto-Rollout initiated [ACTIVE]',
    '[14:23:48] pod/inventory-sync-broker-x9 Memory threshold leak > 92% → Evicted pod gracefully [RESOLVED]',
    '[14:09:55] VPA dynamic limits automatically adjusted: memory ceiling bumped from 2Gi to 4Gi [RESOLVED]',
    '[13:45:12] Ingress Socket Clean Reap: Flushed 18 dead TCP sockets [SLO PRESERVED]',
  ];
  const [tickerIndex, setTickerIndex] = useState(0);

  // KPI Stats
  const [stats, setStats] = useState<ClusterStats>({
    activeIncidents: 0,
    meshHealth: 100,
    mttrSeconds: 1.8,
    mttrDeltaMs: -350,
    autonomousActions24h: 42,
    escalationsCount: 0,
    podHealthPercent: 99.4,
    podsHealthy: 487,
    podsTotal: 490,
  });

  // Animated KPI refs for GSAP
  const incidentsRef = useRef<HTMLDivElement>(null);
  const mttrRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const healthRef = useRef<HTMLDivElement>(null);

  // Workload items
  const [workloads, setWorkloads] = useState<WorkloadItem[]>([
    {
      id: 'auth-service',
      name: 'auth-service-api-78f9c',
      subname: 'deployment.apps/auth-service',
      type: 'Deployments',
      namespace: 'default',
      status: 'CrashLoopBackOff',
      replicasCurrent: 2,
      replicasTarget: 3,
      restarts: 4,
      cpuPercent: 88,
      cpuCores: '1.76c',
      memoryPercent: 72,
      memoryAmount: '1.44Gi',
    },
    {
      id: 'checkout-worker',
      name: 'checkout-worker-v2',
      subname: 'deployment.apps/checkout-worker',
      type: 'Deployments',
      namespace: 'default',
      status: 'Running',
      replicasCurrent: 8,
      replicasTarget: 8,
      restarts: 0,
      cpuPercent: 24,
      cpuCores: '0.48c',
      memoryPercent: 41,
      memoryAmount: '820Mi',
    },
    {
      id: 'payment-gateway',
      name: 'payment-gateway-proxy',
      subname: 'deployment.apps/payment-gateway',
      type: 'Deployments',
      namespace: 'default',
      status: 'Running',
      replicasCurrent: 4,
      replicasTarget: 4,
      restarts: 0,
      cpuPercent: 18,
      cpuCores: '0.36c',
      memoryPercent: 33,
      memoryAmount: '660Mi',
    },
    {
      id: 'redis-cache',
      name: 'redis-cluster-cache',
      subname: 'statefulset.apps/redis-cluster',
      type: 'StatefulSets',
      namespace: 'kube-system',
      status: 'Running',
      replicasCurrent: 6,
      replicasTarget: 6,
      restarts: 0,
      cpuPercent: 31,
      cpuCores: '0.62c',
      memoryPercent: 56,
      memoryAmount: '1.12Gi',
    },
    {
      id: 'inventory-sync',
      name: 'inventory-sync-broker',
      subname: 'deployment.apps/inventory-sync',
      type: 'Deployments',
      namespace: 'default',
      status: 'Self-Healed',
      replicasCurrent: 5,
      replicasTarget: 5,
      restarts: 1,
      restartDetail: '1 (Lifted)',
      cpuPercent: 14,
      cpuCores: '0.28c',
      memoryPercent: 28,
      memoryAmount: '560Mi',
      lastRemediated: '2m ago',
    },
  ]);

  // Feed items
  const [events, setEvents] = useState<RemediationEvent[]>([
    {
      id: 'evt-1',
      iconType: 'rollback',
      title: 'Automated Canary Rollback',
      timeAgo: '12s ago',
      targetPod: 'pod/auth-service-api-78f9c',
      description: 'Reverting image tag to v2.4.19 due to unhandled SIGSEGV exit(139).',
      statusBadge: 'In Progress (Phase 2/3)',
      statusType: 'in-progress',
      secondaryTag: 'pod evicted & drained',
      timestamp: '14:28:02',
    },
    {
      id: 'evt-2',
      iconType: 'shield',
      title: 'Pod Quarantined & Drained',
      timeAgo: '4m ago',
      targetPod: 'pod/inventory-sync-broker-x9',
      description: 'Memory threshold leak > 92%. Evicted pod gracefully, spun up fresh clean replica.',
      statusBadge: 'Resolved in 1.4s',
      statusType: 'resolved',
      secondaryTag: '0 dropped requests',
      timestamp: '14:23:48',
    },
    {
      id: 'evt-3',
      iconType: 'scale',
      title: 'OOMKiller Preventative Scale',
      timeAgo: '18m ago',
      targetPod: 'pod/search-indexer-worker',
      description: 'VPA dynamic limits automatically adjusted: memory ceiling bumped from 2Gi to 4Gi.',
      statusBadge: 'Resolved in 2.1s',
      statusType: 'resolved',
      secondaryTag: 'Node #4 capacity ok',
      timestamp: '14:09:55',
    },
    {
      id: 'evt-4',
      iconType: 'scale',
      title: 'Ingress Socket Clean Reap',
      timeAgo: '42m ago',
      targetPod: 'pod/ingress-nginx-controller',
      description: 'Flushed 18 dead TCP sockets causing upstream 504 gateway timeouts.',
      statusBadge: 'Resolved in 820ms',
      statusType: 'resolved',
      secondaryTag: 'SLO preserved',
      timestamp: '13:45:12',
    },
  ]);

  // MTTR Curve interactive hover state
  const [curveHover, setCurveHover] = useState<{ x: number; y: number; val: string } | null>({
    x: 300,
    y: 70,
    val: '1.62s fix',
  });

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Lenis Smooth Scroll Setup with GSAP Ticker Synchronization
  useEffect(() => {
    if (activeNav === 'topology') return;
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const rafUpdate = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(rafUpdate);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(rafUpdate);
      lenis.destroy();
    };
  }, [activeNav]);

  // 2. High-Fidelity Entrance Timeline with useGSAP
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Animate Header and Sidebar
      tl.from('header', { y: -25, opacity: 0, duration: 0.6 })
        .from('aside', { x: -30, opacity: 0, duration: 0.5 }, '-=0.4')
        // Animate KPI Cards with a staggered scale & translate entrance
        .from('.kpi-card', {
          y: 20,
          opacity: 0,
          scale: 0.97,
          stagger: 0.08,
          duration: 0.6,
          clearProps: 'transform,opacity',
        }, '-=0.3')
        // SVG Curves Draw-In
        .fromTo(
          '.sparkline-curve',
          { strokeDashoffset: 400, strokeDasharray: 400 },
          { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' },
          '-=0.4'
        )
        // Middle Sections Entrance
        .from('.dashboard-section', {
          y: 25,
          opacity: 0,
          stagger: 0.1,
          duration: 0.7,
          clearProps: 'transform,opacity',
        }, '-=0.6');
    },
    { scope: containerRef }
  );

  // 3. GSAP Animated Numeric Counters (Dependencies tracked)
  useGSAP(
    () => {
      if (mttrRef.current) {
        const obj = { val: 0.0 };
        gsap.to(obj, {
          val: stats.mttrSeconds,
          duration: 1.6,
          ease: 'power3.out',
          onUpdate: () => {
            if (mttrRef.current) mttrRef.current.innerText = `${obj.val.toFixed(1)}s`;
          },
        });
      }

      if (actionsRef.current) {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: stats.autonomousActions24h,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate: () => {
            if (actionsRef.current) actionsRef.current.innerText = `${Math.round(obj.val)}`;
          },
        });
      }

      if (healthRef.current) {
        const obj = { val: 80.0 };
        gsap.to(obj, {
          val: stats.podHealthPercent,
          duration: 2.0,
          ease: 'power3.out',
          onUpdate: () => {
            if (healthRef.current) healthRef.current.innerText = `${obj.val.toFixed(1)}%`;
          },
        });
      }
    },
    { dependencies: [stats.mttrSeconds, stats.autonomousActions24h, stats.podHealthPercent], scope: containerRef }
  );

  // Live Stream latency jitter
  useEffect(() => {
    const timer = setInterval(() => {
      setLatencyMs(11 + Math.floor(Math.random() * 4));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Ticker rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerMessages.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [tickerMessages.length]);

  // Keyboard shortcut Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Trigger Autonomous Remediation Simulation
  const handleAutoRollout = (workloadId: string) => {
    setToastMessage('Auto-Rollout sequence initiated for pod/auth-service-api-78f9c...');

    // Mark as remediating
    setWorkloads((prev) =>
      prev.map((w) =>
        w.id === workloadId
          ? { ...w, isRemediating: true, status: 'Remediating' }
          : w
      )
    );

    setTimeout(() => {
      setWorkloads((prev) =>
        prev.map((w) =>
          w.id === workloadId
            ? {
                ...w,
                status: 'Self-Healed',
                isRemediating: false,
                replicasCurrent: 3,
                replicasTarget: 3,
                restarts: 0,
                restartDetail: '4 (Lifted)',
                cpuPercent: 19,
                cpuCores: '0.38c',
                memoryPercent: 34,
                memoryAmount: '680Mi',
              }
            : w
        )
      );

      setStats((prev) => ({
        ...prev,
        activeIncidents: 0,
        podHealthPercent: 100.0,
        podsHealthy: 490,
        autonomousActions24h: prev.autonomousActions24h + 1,
        mttrSeconds: 1.6,
      }));

      const newEvt: RemediationEvent = {
        id: `evt-${Date.now()}`,
        iconType: 'rollback',
        title: 'Autonomous Rollback Succeeded',
        timeAgo: 'Just now',
        targetPod: 'pod/auth-service-api-78f9c',
        description: 'Reverted to digest sha256:8f2a4. Liveness & readiness probes healthy.',
        statusBadge: 'Resolved in 1.6s',
        statusType: 'resolved',
        secondaryTag: 'Mesh 100% stable',
        timestamp: new Date().toLocaleTimeString(),
      };

      setEvents((prev) => [newEvt, ...prev]);
      setToastMessage('✓ Autonomous canary rollback succeeded. Zero dropped requests.');
      setTimeout(() => setToastMessage(null), 5000);
    }, 2400);
  };

  // Filtered workloads
  const filteredWorkloads = workloads.filter((w) => {
    if (w.type !== workloadTab) return false;
    if (selectedNamespace !== 'all' && w.namespace !== selectedNamespace) return false;
    if (statusFilter === 'healthy' && (w.status === 'CrashLoopBackOff' || w.isRemediating)) return false;
    if (statusFilter === 'remediating' && w.status !== 'CrashLoopBackOff' && !w.isRemediating) return false;
    return true;
  });

  return (
    <div
      ref={containerRef}
      className="bg-surface-container-lowest font-body-md text-on-surface antialiased min-h-screen relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container"
    >
      {/* 1. FIXED TOP HEADER BAR */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-surface-container-lowest/90 backdrop-blur-md px-4 flex items-center justify-between shadow-[0_1px_8px_rgba(0,0,0,0.5)] border-b border-surface-container-high/40">
        {/* Left: Brand & Cluster Info */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 cursor-pointer">
            {/* Interactive 3D Cube Canvas with Three.js */}
            <Cluster3DCube size={32} activeStatus={stats.activeIncidents > 0 ? 'alert' : 'stable'} />
            <span className="font-headline-md text-headline-md text-on-surface tracking-tight font-semibold">
              KubeHeal
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 pl-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container-high">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              <span className="font-mono-code text-mono-code text-on-surface-variant">kind-kubeheal</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-surface-container font-label-caps text-label-caps text-secondary uppercase tracking-wider">
              2 Nodes | Ready
            </span>
          </div>
        </div>

        {/* Center: Real-Time Marquee Ticker */}
        <div className="hidden lg:flex items-center justify-center flex-1 max-w-2xl mx-4 overflow-hidden">
          <div
            onClick={() => setActiveNav('topology')}
            className="w-full flex items-center gap-2 px-3 py-1 rounded bg-surface-container-low/80 border border-surface-container/60 shadow-inner cursor-pointer hover:border-primary/50 transition-colors group"
            title="Click to view in Cluster Mesh Topology"
          >
            <span className="material-symbols-outlined text-tertiary text-sm animate-spin">sync</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={tickerIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="font-mono-code text-mono-code text-on-surface-variant truncate group-hover:text-on-surface transition-colors"
              >
                <span className="text-outline">{tickerMessages[tickerIndex].slice(0, 10)}</span>{' '}
                {tickerMessages[tickerIndex].slice(11, 41)}{' '}
                <span className="text-error font-semibold">CrashLoopBackOff</span> detected → Auto-Rollout initiated{' '}
                <span className="text-secondary font-semibold">[ACTIVE]</span>
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Quick Search, Live Stream, Profile */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded bg-surface-container-low text-on-surface-variant hover:text-on-surface transition-colors border border-surface-container/40"
          >
            <span className="material-symbols-outlined text-sm">search</span>
            <span className="font-mono-code text-mono-code text-outline">Quick search...</span>
            <kbd className="px-1.5 py-0.5 text-label-caps font-mono-code rounded bg-surface-container-highest text-on-surface">
              ⌘K
            </kbd>
          </button>

          <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded bg-surface-container-low border border-surface-container/40">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
            <span className="font-mono-code text-mono-code text-secondary font-medium">Live Stream</span>
            <span className="font-mono-code text-mono-code text-outline">{latencyMs}ms</span>
          </div>

          <div className="relative cursor-pointer group">
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/30 group-hover:ring-primary transition-all"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4ZcWIUS2b4Wp78NT9PLSPd6xW3hkdJ9hDbsXvFGC5du1xR4Pp9Vp0fGnNk_D10hrnsYlqDihS1tdc8TICUdvchcJyOhx12z-nwtKCNN-xinRffMge9ENQkwU-PZaPrepY8GAzGkEXXjM1zbr-h8aK92XznfHBQs-2L-jnrEBfKrwp8OWm8E_P6gwPNq2fv1k9BcFa-1QRq29MhAjgoL2ZWk36Xtz7g7xnLHOwsb54I96fbHS8Cnq0"
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-secondary ring-2 ring-surface-container-lowest" />
          </div>
        </div>
      </header>

      {/* 2. FIXED SLIM SIDEBAR */}
      <aside className="fixed left-0 top-14 bottom-0 w-16 bg-surface-container-low/90 backdrop-blur-md z-40 flex flex-col justify-between py-4 items-center border-r border-surface-container-high/40 select-none">
        <nav className="w-full flex flex-col items-center gap-2 px-2">
          <button
            onClick={() => setActiveNav('overview')}
            aria-current={activeNav === 'overview' ? 'page' : undefined}
            className={`w-10 h-10 flex items-center justify-center transition-all rounded-lg ${
              activeNav === 'overview'
                ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_12px_rgba(99,102,241,0.35)]'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
            title="Cluster Overview"
          >
            <span className="material-symbols-outlined">dashboard</span>
          </button>

          <button
            onClick={() => setActiveNav('topology')}
            className={`w-10 h-10 flex items-center justify-center transition-all rounded-lg ${
              activeNav === 'topology'
                ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_12px_rgba(99,102,241,0.35)]'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
            title="Cluster Mesh Topology"
          >
            <span className="material-symbols-outlined">hub</span>
          </button>

          <button
            onClick={() => setActiveNav('autonomous')}
            className={`w-10 h-10 flex items-center justify-center transition-all rounded-lg ${
              activeNav === 'autonomous'
                ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_12px_rgba(99,102,241,0.35)]'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
            title="Autonomous Controller"
          >
            <span className="material-symbols-outlined">auto_fix</span>
          </button>

          <button
            onClick={() => setActiveNav('incidents')}
            className={`w-10 h-10 flex items-center justify-center transition-all rounded-lg ${
              activeNav === 'incidents'
                ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_12px_rgba(99,102,241,0.35)]'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
            title="Incident Logs"
          >
            <span className="material-symbols-outlined">crisis_alert</span>
          </button>

          <button
            onClick={() => setActiveNav('telemetry')}
            className={`w-10 h-10 flex items-center justify-center transition-all rounded-lg ${
              activeNav === 'telemetry'
                ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_12px_rgba(99,102,241,0.35)]'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
            title="Telemetry & SLOs"
          >
            <span className="material-symbols-outlined">query_stats</span>
          </button>
        </nav>

        <div className="w-full flex flex-col items-center gap-2 px-2">
          <button
            className="w-10 h-10 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"
            title="Cluster Settings"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"
            title="Documentation & Playbooks"
          >
            <span className="material-symbols-outlined">menu_book</span>
          </button>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"
            title="Platform System Status"
          >
            <span className="material-symbols-outlined">health_and_safety</span>
          </button>
        </div>
      </aside>

      {/* 3. MAIN DASHBOARD CONTENT */}
      <div className="pl-16">
        {activeNav === 'topology' ? (
          <main className="relative w-full pt-14 min-h-screen bg-surface-container-lowest overflow-hidden">
            <ClusterMeshTopology onNavigate={(path) => setActiveNav(path)} />
          </main>
        ) : activeNav === 'autonomous' ? (
          <main className="relative w-full pt-14 min-h-screen bg-surface-container-lowest">
            <AutonomousRunbooksPage onNavigate={(path) => setActiveNav(path)} />
          </main>
        ) : activeNav === 'incidents' ? (
          <main className="relative w-full pt-14 min-h-screen bg-surface-container-lowest">
            <AutonomousIncidentForensics onNavigate={(path) => setActiveNav(path)} />
          </main>
        ) : activeNav === 'telemetry' ? (
          <main className="relative w-full pt-14 min-h-screen bg-surface-container-lowest">
            <ChaosResilienceLabPage onNavigate={(path) => setActiveNav(path)} />
          </main>
        ) : (
          <main ref={scrollContainerRef} className="relative w-full pt-14 min-h-screen bg-surface-container-lowest">
            {/* TOAST POPUP */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="fixed top-16 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-high border border-primary/50 text-on-surface shadow-[0_0_20px_rgba(128,131,255,0.3)] text-body-sm font-mono-code"
              >
                <span className="material-symbols-outlined text-primary text-base animate-spin">autorenew</span>
                <span>{toastMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col w-full p-6 gap-5">
            {/* ROW 1: KPI Metrics Row (4 columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {/* KPI 1: Active Incidents */}
              <div className="kpi-card relative overflow-hidden rounded-xl bg-surface-container-low/80 backdrop-blur-md p-5 shadow-xl transition-all duration-300 hover:bg-surface-container-high/60 group border border-surface-container/50 will-change-transform">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-secondary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-secondary/10 transition-all" />
                <div className="flex items-center justify-between mb-3">
                  <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline">
                    Active Incidents
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-label-caps text-label-caps">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                    STABLE
                  </span>
                </div>
                <div className="flex items-baseline justify-between mb-2">
                  <div ref={incidentsRef} className="font-mono-metric-lg text-mono-metric-lg text-secondary font-bold tracking-tight">
                    0
                  </div>
                  <div className="font-mono-code text-mono-code text-secondary flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">verified_user</span>
                    100% Mesh Health
                  </div>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                  Cluster 100% operational across nodes
                </p>
                <div className="w-full h-10">
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 200 40">
                    <defs>
                      <linearGradient id="emeraldGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#4edea3" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#4edea3" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0,32 Q 25,31 50,32 T 100,31 T 150,32 T 200,32 L 200,40 L 0,40 Z" fill="url(#emeraldGrad)" />
                    <path
                      className="sparkline-curve"
                      d="M 0,32 Q 25,31 50,32 T 100,31 T 150,32 T 200,32"
                      fill="none"
                      stroke="#4edea3"
                      strokeLinecap="round"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>

              {/* KPI 2: MTTR */}
              <div className="kpi-card relative overflow-hidden rounded-xl bg-surface-container-low/80 backdrop-blur-md p-5 shadow-xl transition-all duration-300 hover:bg-surface-container-high/60 group border border-surface-container/50 will-change-transform">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-tertiary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-tertiary/10 transition-all" />
                <div className="flex items-center justify-between mb-3">
                  <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline">
                    Mean Time To Recover (MTTR)
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-label-caps text-label-caps">
                    <span className="material-symbols-outlined text-xs">bolt</span>
                    Autonomous
                  </span>
                </div>
                <div className="flex items-baseline justify-between mb-2">
                  <div ref={mttrRef} className="font-mono-metric-lg text-mono-metric-lg text-tertiary font-bold tracking-tight">
                    1.8s
                  </div>
                  <span className="font-mono-code text-mono-code text-tertiary-fixed font-semibold">
                    -350ms vs manual
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                  99.8th percentile autonomous self-healing
                </p>
                {/* Micro-histogram bar chart */}
                <div className="w-full h-10 flex items-end gap-1.5 pt-2">
                  {[60, 40, 75, 30, 90, 45, 65, 100, 50, 35, 60, 25].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.5, delay: i * 0.03, ease: 'backOut' }}
                      style={{ originY: 1, height: `${h}%` }}
                      className={`flex-1 rounded-t transition-all ${
                        h === 100
                          ? 'bg-tertiary shadow-[0_0_8px_rgba(76,215,246,0.5)]'
                          : 'bg-tertiary/40 hover:bg-tertiary'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* KPI 3: Autonomous Actions */}
              <div className="kpi-card relative overflow-hidden rounded-xl bg-surface-container-low/80 backdrop-blur-md p-5 shadow-xl transition-all duration-300 hover:bg-surface-container-high/60 group border border-surface-container/50 will-change-transform">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/10 transition-all" />
                <div className="flex items-center justify-between mb-3">
                  <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline">
                    Autonomous Actions (24h)
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-container/20 text-primary-fixed-dim font-label-caps text-label-caps">
                    <span className="material-symbols-outlined text-xs">trending_up</span>
                    +12%
                  </span>
                </div>
                <div className="flex items-baseline justify-between mb-2">
                  <div ref={actionsRef} className="font-mono-metric-lg text-mono-metric-lg text-primary-fixed font-bold tracking-tight">
                    42
                  </div>
                  <span className="font-mono-code text-mono-code text-on-surface-variant">0 escalations</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                  38 rollouts, 4 dynamic quarantines
                </p>
                <div className="w-full h-10">
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 200 40">
                    <defs>
                      <linearGradient id="violetGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#c0c1ff" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#c0c1ff" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0,35 Q 35,28 70,30 T 140,15 T 200,8 L 200,40 L 0,40 Z" fill="url(#violetGrad)" />
                    <path
                      className="sparkline-curve"
                      d="M 0,35 Q 35,28 70,30 T 140,15 T 200,8"
                      fill="none"
                      stroke="#c0c1ff"
                      strokeLinecap="round"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>

              {/* KPI 4: Pod Health Index */}
              <div className="kpi-card relative overflow-hidden rounded-xl bg-surface-container-low/80 backdrop-blur-md p-5 shadow-xl transition-all duration-300 hover:bg-surface-container-high/60 group border border-surface-container/50 will-change-transform">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-secondary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-secondary/10 transition-all" />
                <div className="flex items-center justify-between mb-3">
                  <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline">
                    Pod Health Index
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-caps text-label-caps">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    Mesh Ready
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div ref={healthRef} className="font-mono-metric-lg text-mono-metric-lg text-on-surface font-bold tracking-tight">
                      99.4%
                    </div>
                    <div className="font-mono-code text-mono-code text-outline mt-0.5">487 / 490 pods healthy</div>
                  </div>
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-surface-variant"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className="text-secondary transition-all duration-1000 ease-out"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray="99.4, 100"
                        strokeLinecap="round"
                        strokeWidth="3.2"
                      />
                    </svg>
                    <span className="material-symbols-outlined text-secondary text-sm absolute inset-0 m-auto flex items-center justify-center animate-spin">
                      autorenew
                    </span>
                  </div>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Self-healing mesh active & probing</p>
                <div className="mt-3 w-full bg-surface-variant/40 rounded-full h-1 overflow-hidden">
                  <div className="bg-secondary h-full rounded-full shadow-[0_0_8px_#4edea3]" style={{ width: '99.4%' }} />
                </div>
              </div>
            </div>

            {/* ROW 2: Middle Section (Live Workloads + Real-Time Stream) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
              {/* Left 8 Columns: Live Cluster Workload Health Card */}
              <div className="dashboard-section xl:col-span-8 flex flex-col rounded-xl bg-surface-container-low/80 backdrop-blur-md p-5 shadow-xl border border-surface-container/50">
                {/* Header & Controls */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4">
                  <div className="flex items-center gap-3">
                    <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight font-semibold">
                      Live Cluster Workload Health
                    </h2>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-tertiary-container/20 text-tertiary font-label-caps text-label-caps">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-ping" />
                      Streaming (12ms)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-code text-mono-code text-tertiary flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
                      ws://mesh.telemetry/live
                    </span>
                  </div>
                </div>

                {/* Filter Controls Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
                  {/* Workload Type Tabs */}
                  <div className="flex items-center p-1 bg-surface-container rounded-lg gap-1">
                    {(['Deployments', 'DaemonSets', 'StatefulSets'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setWorkloadTab(tab)}
                        className={`px-3 py-1 rounded font-body-sm text-body-sm transition-all relative ${
                          workloadTab === tab
                            ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Filters Right */}
                  <div className="flex items-center gap-2">
                    {/* Namespace Selector */}
                    <div className="relative">
                      <button
                        onClick={() => setIsNamespaceOpen(!isNamespaceOpen)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container text-on-surface text-body-sm font-mono-code hover:bg-surface-container-high transition-colors"
                      >
                        <span className="text-outline">ns:</span>
                        <span className="font-semibold text-primary">{selectedNamespace} (18)</span>
                        <span className="material-symbols-outlined text-sm text-outline">expand_more</span>
                      </button>

                      {isNamespaceOpen && (
                        <div className="absolute right-0 top-full mt-1 bg-surface-container-high border border-surface-container-highest rounded-lg shadow-xl py-1 z-30 w-36 font-mono-code text-xs">
                          {['default', 'kube-system', 'all'].map((ns) => (
                            <button
                              key={ns}
                              onClick={() => {
                                setSelectedNamespace(ns);
                                setIsNamespaceOpen(false);
                              }}
                              className="w-full text-left px-3 py-1.5 text-on-surface hover:bg-surface-container transition-colors"
                            >
                              {ns}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Status Chips */}
                    <div className="hidden sm:flex items-center gap-1">
                      <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-2.5 py-1 rounded font-label-caps text-label-caps transition-colors ${
                          statusFilter === 'all'
                            ? 'bg-surface-container-highest text-on-surface font-semibold'
                            : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                        }`}
                      >
                        All (24)
                      </button>
                      <button
                        onClick={() => setStatusFilter('healthy')}
                        className={`px-2.5 py-1 rounded font-label-caps text-label-caps transition-colors ${
                          statusFilter === 'healthy'
                            ? 'bg-surface-container-highest text-secondary font-semibold'
                            : 'bg-surface-container text-secondary hover:bg-surface-container-high'
                        }`}
                      >
                        Healthy (23)
                      </button>
                      <button
                        onClick={() => setStatusFilter('remediating')}
                        className={`px-2.5 py-1 rounded font-label-caps text-label-caps transition-colors ${
                          statusFilter === 'remediating'
                            ? 'bg-error-container text-on-error-container font-semibold'
                            : 'bg-error-container/40 text-error hover:bg-error-container/60'
                        }`}
                      >
                        Remediating (1)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Interactive Data Table */}
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left text-body-md">
                    <thead>
                      <tr className="bg-surface-container-lowest/60 text-outline font-label-caps text-label-caps uppercase">
                        <th className="py-2.5 px-3 rounded-l">Status</th>
                        <th className="py-2.5 px-3">Workload Name</th>
                        <th className="py-2.5 px-3">Namespace</th>
                        <th className="py-2.5 px-3">Replicas</th>
                        <th className="py-2.5 px-3">Restarts</th>
                        <th className="py-2.5 px-3">CPU Usage</th>
                        <th className="py-2.5 px-3">Memory</th>
                        <th className="py-2.5 px-3 rounded-r text-right">Autonomous Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-0">
                      <AnimatePresence>
                        {filteredWorkloads.map((item) => {
                          const isAlert = item.status === 'CrashLoopBackOff';
                          const isHealing = item.isRemediating;
                          const isSelfHealed = item.status === 'Self-Healed';

                          return (
                            <motion.tr
                              key={item.id}
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className={`transition-all ${
                                isAlert
                                  ? 'bg-error-container/20 hover:bg-error-container/30'
                                  : isHealing
                                  ? 'bg-primary-container/15 hover:bg-primary-container/25'
                                  : 'hover:bg-surface-container-high/40'
                              }`}
                            >
                              {/* Status Badge */}
                              <td className="py-3 px-3 whitespace-nowrap">
                                {isAlert ? (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-caps text-label-caps shadow-[0_0_10px_rgba(244,63,94,0.35)]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />
                                    CrashLoopBackOff
                                  </span>
                                ) : isHealing ? (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                                    Auto-Rolling...
                                  </span>
                                ) : isSelfHealed ? (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-label-caps text-label-caps">
                                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                                    Self-Healed (2m ago)
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-label-caps text-label-caps">
                                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                                    Running
                                  </span>
                                )}
                              </td>

                              {/* Workload Name */}
                              <td className="py-3 px-3 whitespace-nowrap">
                                <div className="font-mono-code text-mono-code font-bold text-on-surface">
                                  {item.name}
                                </div>
                                <div className="font-mono-code text-body-sm text-outline">
                                  {item.subname}
                                </div>
                              </td>

                              {/* Namespace */}
                              <td className="py-3 px-3 font-mono-code text-mono-code text-on-surface-variant whitespace-nowrap">
                                {item.namespace}
                              </td>

                              {/* Replicas */}
                              <td className="py-3 px-3 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-1.5 py-0.5 rounded font-mono-code text-label-caps font-semibold ${
                                    item.replicasCurrent < item.replicasTarget
                                      ? 'bg-surface-variant text-error'
                                      : isSelfHealed
                                      ? 'bg-surface-container text-tertiary'
                                      : 'bg-surface-container text-secondary'
                                  }`}
                                >
                                  {item.replicasCurrent} / {item.replicasTarget}
                                </span>
                              </td>

                              {/* Restarts */}
                              <td className="py-3 px-3 whitespace-nowrap">
                                {item.restarts > 0 && isAlert ? (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-error-container text-on-error-container font-mono-code text-label-caps">
                                    <span className="material-symbols-outlined text-xs">warning</span>
                                    {item.restarts}
                                  </span>
                                ) : item.restartDetail ? (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-tertiary/20 text-tertiary font-mono-code text-label-caps">
                                    <span className="material-symbols-outlined text-xs">done_all</span>
                                    {item.restartDetail}
                                  </span>
                                ) : (
                                  <span className="font-mono-code text-label-caps text-outline">0</span>
                                )}
                              </td>

                              {/* CPU Usage */}
                              <td className="py-3 px-3 min-w-[100px] whitespace-nowrap">
                                <div
                                  className={`flex items-center justify-between font-mono-code text-body-sm mb-1 ${
                                    item.cpuPercent > 70 ? 'text-error' : isSelfHealed ? 'text-tertiary' : 'text-on-surface-variant'
                                  }`}
                                >
                                  <span>{item.cpuPercent}%</span>
                                  <span className="text-outline">{item.cpuCores}</span>
                                </div>
                                <div className="w-full bg-surface-variant rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      item.cpuPercent > 70
                                        ? 'bg-error shadow-[0_0_8px_#ffb4ab]'
                                        : isSelfHealed
                                        ? 'bg-tertiary'
                                        : 'bg-secondary'
                                    }`}
                                    style={{ width: `${item.cpuPercent}%` }}
                                  />
                                </div>
                              </td>

                              {/* Memory */}
                              <td className="py-3 px-3 min-w-[100px] whitespace-nowrap">
                                <div
                                  className={`flex items-center justify-between font-mono-code text-body-sm mb-1 ${
                                    item.memoryPercent > 70 ? 'text-error' : isSelfHealed ? 'text-tertiary' : 'text-on-surface-variant'
                                  }`}
                                >
                                  <span>{item.memoryPercent}%</span>
                                  <span className="text-outline">{item.memoryAmount}</span>
                                </div>
                                <div className="w-full bg-surface-variant rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      item.memoryPercent > 70
                                        ? 'bg-error shadow-[0_0_8px_#ffb4ab]'
                                        : isSelfHealed
                                        ? 'bg-tertiary'
                                        : 'bg-secondary'
                                    }`}
                                    style={{ width: `${item.memoryPercent}%` }}
                                  />
                                </div>
                              </td>

                              {/* Autonomous Action */}
                              <td className="py-3 px-3 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-2">
                                  {isAlert ? (
                                    <button
                                      onClick={() => handleAutoRollout(item.id)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps shadow-[0_0_12px_rgba(99,102,241,0.5)] hover:bg-primary transition-all cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-xs">sync</span>
                                      Auto-Rollout
                                    </button>
                                  ) : isHealing ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps shadow-[0_0_12px_rgba(99,102,241,0.5)] animate-pulse">
                                      <span className="material-symbols-outlined text-xs animate-spin">sync</span>
                                      Auto-Rolling...
                                    </span>
                                  ) : null}
                                  <button className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors">
                                    <span className="material-symbols-outlined text-base">more_vert</span>
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right 4 Columns: Real-Time Self-Healing Stream Card */}
              <div className="dashboard-section xl:col-span-4 flex flex-col rounded-xl bg-surface-container-low/80 backdrop-blur-md p-5 shadow-xl border border-surface-container/50">
                <div className="flex items-center justify-between pb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container text-xl animate-pulse">auto_mode</span>
                    <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight font-semibold">
                      Self-Healing Stream
                    </h2>
                  </div>
                  <span className="font-mono-code text-mono-code px-2 py-0.5 rounded bg-surface-container text-outline">
                    Last 60m
                  </span>
                </div>

                {/* Chronological Feed */}
                <div className="flex flex-col gap-3.5 overflow-y-auto max-h-[380px] pr-1">
                  <AnimatePresence initial={false}>
                    {events.map((evt) => {
                      const isProgress = evt.statusType === 'in-progress';

                      return (
                        <motion.div
                          key={evt.id}
                          layout
                          initial={{ opacity: 0, x: 15 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -15 }}
                          className={`relative p-3.5 rounded-lg border border-transparent transition-all ${
                            isProgress
                              ? 'bg-surface-container/80 border-primary-container/30 shadow-[0_0_12px_rgba(128,131,255,0.15)]'
                              : 'bg-surface-container/40 hover:bg-surface-container'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-6 h-6 rounded flex items-center justify-center ${
                                  evt.iconType === 'rollback'
                                    ? 'bg-primary-container/20 text-primary-fixed shadow-[0_0_8px_rgba(99,102,241,0.4)]'
                                    : evt.iconType === 'shield'
                                    ? 'bg-surface-variant text-secondary-fixed shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                                    : 'bg-secondary/10 text-secondary'
                                }`}
                              >
                                <span className={`material-symbols-outlined text-sm ${isProgress ? 'animate-spin' : ''}`}>
                                  {evt.iconType === 'rollback'
                                    ? 'restart_alt'
                                    : evt.iconType === 'shield'
                                    ? 'shield'
                                    : 'upgrade'}
                                </span>
                              </span>
                              <span className="font-headline-md text-body-lg text-on-surface font-semibold">
                                {evt.title}
                              </span>
                            </div>
                            <span className="font-mono-code text-body-sm text-primary-fixed shrink-0">
                              {evt.timeAgo}
                            </span>
                          </div>
                          <p className="font-mono-code text-mono-code text-primary mb-1 truncate">
                            {evt.targetPod}
                          </p>
                          <p className="font-body-sm text-body-sm text-on-surface-variant mb-2.5">
                            {evt.description}
                          </p>
                          <div className="flex items-center justify-between">
                            {isProgress ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps font-semibold">
                                <span className="material-symbols-outlined text-xs animate-spin">progress_activity</span>
                                {evt.statusBadge}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-label-caps text-label-caps">
                                <span className="material-symbols-outlined text-xs">check_circle</span>
                                {evt.statusBadge}
                              </span>
                            )}
                            <span className="font-mono-code text-body-sm text-outline">
                              {evt.secondaryTag}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* ROW 3: Bottom Section (MTTR Distribution Curve & Anomalies by Mode) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
              {/* Left 6 Columns: MTTR Distribution Curve Card */}
              <div className="dashboard-section xl:col-span-6 flex flex-col rounded-xl bg-surface-container-low/80 backdrop-blur-md p-5 shadow-xl border border-surface-container/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3">
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface tracking-tight font-semibold">
                      MTTR Distribution Curve
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Autonomous machine execution vs human engineer response
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 font-label-caps text-label-caps text-primary-fixed">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-container" />
                      KubeHeal (1.8s)
                    </div>
                    <div className="flex items-center gap-1.5 font-label-caps text-label-caps text-outline">
                      <span className="w-3 h-0.5 bg-outline" />
                      Manual (42m)
                    </div>
                  </div>
                </div>

                {/* High Fidelity MTTR Curve SVG */}
                <div className="relative w-full h-44 mt-1">
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 130">
                    <defs>
                      <linearGradient id="mttrGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#8083ff" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#8083ff" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid Lines */}
                    <line stroke="#464554" strokeDasharray="3 3" strokeOpacity="0.2" x1="40" x2="490" y1="10" y2="10" />
                    <line stroke="#464554" strokeDasharray="3 3" strokeOpacity="0.2" x1="40" x2="490" y1="40" y2="40" />
                    <line stroke="#464554" strokeDasharray="3 3" strokeOpacity="0.2" x1="40" x2="490" y1="70" y2="70" />
                    <line stroke="#464554" strokeOpacity="0.3" x1="40" x2="490" y1="100" y2="100" />

                    {/* Y-axis labels */}
                    <text fill="#908fa0" fontFamily="JetBrains Mono" fontSize="9" textAnchor="end" x="32" y="14">4.0s</text>
                    <text fill="#908fa0" fontFamily="JetBrains Mono" fontSize="9" textAnchor="end" x="32" y="44">3.0s</text>
                    <text fill="#908fa0" fontFamily="JetBrains Mono" fontSize="9" textAnchor="end" x="32" y="74">2.0s</text>
                    <text fill="#908fa0" fontFamily="JetBrains Mono" fontSize="9" textAnchor="end" x="32" y="104">0.0s</text>

                    {/* Human Paging Threshold */}
                    <line stroke="#908fa0" strokeDasharray="4 4" strokeOpacity="0.4" strokeWidth="1.5" x1="40" x2="490" y1="20" y2="20" />
                    <text fill="#908fa0" fontFamily="JetBrains Mono" fontSize="8" textAnchor="end" x="485" y="16">
                      Human Paging Threshold (avg 42m)
                    </text>

                    {/* Autonomous MTTR Area */}
                    <path
                      d="M 40,75 C 90,78 130,68 180,72 C 220,76 260,65 300,70 C 340,75 380,82 420,76 C 450,71 475,74 490,73 L 490,100 L 40,100 Z"
                      fill="url(#mttrGradient)"
                    />

                    {/* Autonomous MTTR Stroke Line */}
                    <path
                      className="sparkline-curve"
                      d="M 40,75 C 90,78 130,68 180,72 C 220,76 260,65 300,70 C 340,75 380,82 420,76 C 450,71 475,74 490,73"
                      fill="none"
                      stroke="#8083ff"
                      strokeLinecap="round"
                      strokeWidth="2.5"
                    />

                    {/* Active Crosshair Point at ~14:00 (X:300) */}
                    {curveHover && (
                      <>
                        <line stroke="#c0c1ff" strokeDasharray="2 2" strokeOpacity="0.7" strokeWidth="1" x1={curveHover.x} x2={curveHover.x} y1="10" y2="100" />
                        <circle className="shadow-[0_0_10px_#8083ff]" cx={curveHover.x} cy={curveHover.y} fill="#8083ff" r="5" stroke="#ffffff" strokeWidth="2" />
                      </>
                    )}

                    {/* Crosshair Tooltip Callout */}
                    {curveHover && (
                      <g transform={`translate(${curveHover.x - 40}, ${curveHover.y - 38})`}>
                        <rect fill="#1e1f26" height="22" rx="4" stroke="#464554" strokeWidth="1" width="80" x="0" y="0" />
                        <text fill="#c0c1ff" fontFamily="JetBrains Mono" fontSize="10" fontWeight="600" textAnchor="middle" x="40" y="15">
                          {curveHover.val}
                        </text>
                      </g>
                    )}

                    {/* Interactive hover targets */}
                    {[
                      { x: 100, y: 76, val: '1.74s fix' },
                      { x: 180, y: 72, val: '1.68s fix' },
                      { x: 300, y: 70, val: '1.62s fix' },
                      { x: 420, y: 76, val: '1.81s fix' },
                    ].map((pt, idx) => (
                      <circle
                        key={idx}
                        cx={pt.x}
                        cy={pt.y}
                        r="12"
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setCurveHover(pt)}
                      />
                    ))}

                    {/* X-Axis Timestamps */}
                    <text fill="#908fa0" fontFamily="JetBrains Mono" fontSize="9" textAnchor="start" x="40" y="118">00:00</text>
                    <text fill="#908fa0" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle" x="152" y="118">06:00</text>
                    <text fill="#908fa0" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle" x="265" y="118">12:00</text>
                    <text fill="#908fa0" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle" x="377" y="118">18:00</text>
                    <text fill="#908fa0" fontFamily="JetBrains Mono" fontSize="9" textAnchor="end" x="490" y="118">24:00</text>
                  </svg>
                </div>
              </div>

              {/* Right 6 Columns: Anomalies by Failure Mode Card */}
              <div className="dashboard-section xl:col-span-6 flex flex-col justify-between rounded-xl bg-surface-container-low/80 backdrop-blur-md p-5 shadow-xl border border-surface-container/50">
                <div>
                  <div className="flex items-center justify-between pb-3">
                    <div>
                      <h3 className="font-headline-md text-headline-md text-on-surface tracking-tight font-semibold">
                        Anomalies by Failure Mode
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Last 7 Days · Total 148 automated remediations
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container text-secondary font-mono-code text-mono-code">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      100% Resolved
                    </span>
                  </div>

                  {/* Failure Mode Progress Telemetry Bars */}
                  <div className="flex flex-col gap-4 mt-2">
                    {/* Item 1: CrashLoopBackOff */}
                    <div>
                      <div className="flex items-center justify-between font-mono-code text-body-sm mb-1.5">
                        <span className="text-on-surface flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-error" />
                          CrashLoopBackOff
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-outline">86 events (Avg fix: 1.9s)</span>
                          <span className="font-bold text-error">58%</span>
                        </div>
                      </div>
                      <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '58%' }}
                          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                          className="bg-error h-full rounded-full shadow-[0_0_10px_rgba(255,180,171,0.5)]"
                        />
                      </div>
                    </div>

                    {/* Item 2: OOMKilled */}
                    <div>
                      <div className="flex items-center justify-between font-mono-code text-body-sm mb-1.5">
                        <span className="text-on-surface flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-tertiary-container" />
                          OOMKilled (RAM Exhaustion)
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-outline">36 events (Avg fix: 2.4s)</span>
                          <span className="font-bold text-tertiary">24%</span>
                        </div>
                      </div>
                      <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '24%' }}
                          transition={{ duration: 1, delay: 0.45, ease: 'easeOut' }}
                          className="bg-tertiary-container h-full rounded-full shadow-[0_0_10px_rgba(0,158,185,0.5)]"
                        />
                      </div>
                    </div>

                    {/* Item 3: HighRestartCount */}
                    <div>
                      <div className="flex items-center justify-between font-mono-code text-body-sm mb-1.5">
                        <span className="text-on-surface flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary-container" />
                          HighRestartCount / Liveness Failure
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-outline">26 events (Avg fix: 1.1s)</span>
                          <span className="font-bold text-primary-fixed">18%</span>
                        </div>
                      </div>
                      <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '18%' }}
                          transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
                          className="bg-primary-container h-full rounded-full shadow-[0_0_10px_rgba(128,131,255,0.5)]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Micro Summary */}
                <div className="mt-4 pt-3 flex items-center justify-between bg-surface-container/50 px-3 py-2 rounded-lg border border-surface-container/40">
                  <div className="flex items-center gap-2 font-mono-code text-body-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-sm">task_alt</span>
                    <span>Zero Human Engineer Paging Events Triggered</span>
                  </div>
                  <div className="font-mono-code text-body-sm text-secondary font-semibold">
                    Autonomous SLA: 99.999%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        )}
      </div>

      {/* QUICK SEARCH MODAL */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-start justify-center pt-24 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="w-full max-w-lg bg-surface-container-high border border-surface-container-highest rounded-xl shadow-2xl overflow-hidden font-body-md"
            >
              <div className="flex items-center px-4 py-3 border-b border-surface-container-highest">
                <span className="material-symbols-outlined text-tertiary text-lg mr-2.5">search</span>
                <input
                  type="text"
                  placeholder="Search pods, namespaces, failure modes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent text-sm text-on-surface placeholder-outline focus:outline-none font-mono-code"
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="text-outline hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>

              <div className="p-3 max-h-72 overflow-y-auto divide-y divide-surface-container-highest/40 font-mono-code text-xs">
                <div className="px-2 py-1.5 text-outline text-[10px] uppercase tracking-wider font-semibold">
                  Workloads
                </div>
                {workloads
                  .filter(
                    (w) =>
                      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      w.namespace.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      w.status.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((w) => (
                    <div
                      key={w.id}
                      onClick={() => setIsSearchOpen(false)}
                      className="px-3 py-2 hover:bg-surface-container rounded cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div>
                        <div className="text-on-surface font-medium">{w.name}</div>
                        <div className="text-outline text-[11px]">{w.namespace}</div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-label-caps ${
                          w.status === 'CrashLoopBackOff'
                            ? 'bg-error-container text-on-error-container'
                            : 'bg-secondary/15 text-secondary'
                        }`}
                      >
                        {w.status}
                      </span>
                    </div>
                  ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
