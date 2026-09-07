import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface ClusterMeshTopologyProps {
  onNavigate?: (path: string) => void;
}

interface LogEntry {
  id: string;
  time: string;
  type: 'sys' | 'info' | 'warn' | 'error' | 'fatal' | 'agent' | 'success';
  text: string;
}

const nodeDetails: Record<string, { title: string; subtitle: string; ns: string; node: string }> = {
  'payment-quarantined': {
    title: 'payment-service-75b4f85d4f-xk92',
    subtitle: 'Container Crashing (CrashLoopBackOff)',
    ns: 'default',
    node: 'worker-02',
  },
  'ingress': {
    title: 'ingress-nginx-controller',
    subtitle: 'Ingress Gateway (Healthy)',
    ns: 'ingress-nginx',
    node: 'master-01',
  },
  'auth-service': {
    title: 'auth-service',
    subtitle: 'ClusterIP Service (2/2 Pods)',
    ns: 'default',
    node: 'worker-01',
  },
  'payment-service': {
    title: 'payment-service',
    subtitle: 'ClusterIP Service (Degraded)',
    ns: 'default',
    node: 'worker-02',
  },
  'agent': {
    title: 'kubeheal-agent-ds-9x0a',
    subtitle: 'Autonomous DaemonSet Agent',
    ns: 'kube-system',
    node: 'worker-02',
  },
};

export const ClusterMeshTopology: React.FC<ClusterMeshTopologyProps> = ({ onNavigate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Zoom & Pan state
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Filters
  const [selectedNamespace, setSelectedNamespace] = useState<string>('all');
  const [quarantinedOnly, setQuarantinedOnly] = useState<boolean>(false);

  // Drawer state & selected node
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const [selectedNode, setSelectedNode] = useState<string>('payment-quarantined');
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'metadata' | 'remediation'>('logs');
  const [copied, setCopied] = useState<boolean>(false);

  const activeDetails = nodeDetails[selectedNode] || nodeDetails['payment-quarantined'];

  // Remediation / Rollback State
  const [rollbackState, setRollbackState] = useState<'idle' | 'rolling-back' | 'dispatched'>('idle');
  const [isQuarantined, setIsQuarantined] = useState<boolean>(true);
  const [memoryUsage, setMemoryUsage] = useState<number>(98);

  // Live Terminal Logs
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', time: '14:27:56.002', type: 'sys', text: 'sys: Initializing V8 engine v11.3.244.8' },
    { id: '2', time: '14:27:58.102', type: 'info', text: 'info: Starting worker process thread pool (workers=4)...' },
    { id: '3', time: '14:27:59.231', type: 'info', text: 'info: Connected to PostgreSQL pool checkout_db [ready]' },
    { id: '4', time: '14:28:00.419', type: 'warn', text: 'warn: [HeapDump] Node memory pressure threshold exceeded (92% used)' },
    { id: '5', time: '14:28:01.112', type: 'warn', text: 'warn: Latency spike detected on POST /v1/checkout/process: 4120ms' },
    { id: '6', time: '14:28:01.890', type: 'error', text: 'error: [Runtime] GC overhead limit exceeded during payload deserialization' },
    { id: '7', time: '14:28:02.014', type: 'fatal', text: 'FATAL: exit code 137 (SIGKILL) - Out of memory allocation failure in V8 heap!' },
    { id: '8', time: '14:28:02.120', type: 'agent', text: 'kubeheal-agent: Intercepted SIGKILL event. Pod isolated from service ingress mesh.' },
  ]);

  // Terminal auto-scroll
  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // GSAP Entrance Animations for Mesh Nodes
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.mesh-node', {
        scale: 0.88,
        opacity: 0,
        y: 20,
        duration: 0.65,
        stagger: 0.08,
      })
      .from('.mesh-cable', {
        strokeDashoffset: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.05,
      }, '-=0.4')
      .from('.mesh-hud', {
        opacity: 0,
        y: 15,
        duration: 0.5,
      }, '-=0.3');

      // Subtle ambient floating motion for agent node
      gsap.to('.agent-floating-node', {
        y: '-=6',
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    },
    { scope: containerRef }
  );

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag when clicking background or canvas
    if ((e.target as HTMLElement).closest('.mesh-node, button, input, label, #triage-drawer')) {
      return;
    }
    setIsPanning(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Zoom handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(1.7, +(prev + 0.15).toFixed(2)));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.65, +(prev - 0.15).toFixed(2)));
  const handleZoomFit = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Copy pod name
  const handleCopyPod = () => {
    navigator.clipboard.writeText('payment-service-75b4f85d4f-xk92');
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Rollback Action
  const handleRollback = () => {
    if (rollbackState !== 'idle') return;
    setRollbackState('rolling-back');

    setTimeout(() => {
      setRollbackState('dispatched');
      setIsQuarantined(false);
      setMemoryUsage(34);

      setLogs((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          time: new Date().toTimeString().split(' ')[0] + '.841',
          type: 'info',
          text: 'kubeheal-agent: Pulling image payment-service:v2.4.18 (sha:e81fa4)...',
        },
        {
          id: String(Date.now() + 1),
          time: new Date().toTimeString().split(' ')[0] + '.992',
          type: 'success',
          text: 'kubeheal-agent: Canary pod healthy. Isolation lock released. Ingress mesh routes restored [RESOLVED].',
        },
      ]);
    }, 1200);
  };

  // Release lock action
  const handleReleaseLock = () => {
    setIsQuarantined(false);
    setMemoryUsage(42);
    setLogs((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        time: new Date().toTimeString().split(' ')[0] + '.104',
        type: 'warn',
        text: 'sys: Operator manually unlocked pod isolation. Ingress routing re-enabled.',
      },
    ]);
  };

  // Clear logs
  const handleClearLogs = () => {
    setLogs([]);
  };

  // Namespace filtering check
  const isNodeDimmed = (ns: string, isQuarantineItem?: boolean) => {
    if (quarantinedOnly && !isQuarantineItem) return true;
    if (selectedNamespace === 'all') return false;
    return selectedNamespace !== ns;
  };

  return (
    <div ref={containerRef} className="relative w-full h-[calc(100vh-3.5rem)] overflow-hidden bg-surface select-none">
      {/* Background Graph Infinite Grid Canvas Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#464554_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Ambient Radial Glows for Active Incidents */}
      <div className="absolute top-[320px] left-[680px] w-96 h-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-error/10 blur-3xl pointer-events-none" />
      <div className="absolute top-[160px] left-[520px] w-80 h-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-container/15 blur-3xl pointer-events-none" />

      {/* Floating Top Toolbar Pill */}
      <header className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2 rounded-full bg-surface-container-high/90 backdrop-blur-xl shadow-2xl border border-surface-container/60">
        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomIn}
            className="w-7 h-7 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition active:scale-95"
            id="zoom-in"
            title="Zoom In (+)"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
          <button
            onClick={handleZoomOut}
            className="w-7 h-7 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition active:scale-95"
            id="zoom-out"
            title="Zoom Out (-)"
          >
            <span className="material-symbols-outlined text-[18px]">remove</span>
          </button>
          <button
            onClick={handleZoomFit}
            className="w-7 h-7 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition active:scale-95"
            id="zoom-fit"
            title="Fit to Canvas"
          >
            <span className="material-symbols-outlined text-[18px]">filter_center_focus</span>
          </button>
          <span className="text-[11px] font-mono-code text-outline pl-1">{Math.round(zoom * 100)}%</span>
        </div>

        <div className="w-px h-4 bg-outline-variant" />

        {/* Back to Overview Link */}
        {onNavigate && (
          <button
            onClick={() => onNavigate('overview')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition font-mono-code text-body-sm border border-surface-container/40"
            title="Return to Cluster Overview"
          >
            <span className="material-symbols-outlined text-sm">dashboard</span>
            <span>Overview</span>
          </button>
        )}

        {onNavigate && <div className="hidden md:block w-px h-4 bg-outline-variant" />}

        {/* Namespaces */}
        <div className="flex items-center gap-1.5">
          <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider pl-1">NS</span>
          {(['all', 'default', 'ingress-nginx', 'monitoring'] as const).map((ns) => (
            <button
              key={ns}
              onClick={() => setSelectedNamespace(ns)}
              className={`px-2.5 py-0.5 rounded-full font-mono-code text-body-sm transition ${
                selectedNamespace === ns
                  ? 'bg-primary text-on-primary font-semibold shadow-[0_0_12px_rgba(192,193,255,0.4)]'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              {ns}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-outline-variant" />

        {/* Quarantined Filter Toggle */}
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className="relative">
            <input
              checked={quarantinedOnly}
              onChange={(e) => setQuarantinedOnly(e.target.checked)}
              className="sr-only peer"
              id="filter-quarantine"
              type="checkbox"
            />
            <div className="w-8 h-4.5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-error" />
          </div>
          <span className="font-label-caps text-label-caps text-error tracking-wider uppercase flex items-center gap-1 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />
            Quarantined Only
          </span>
        </label>

        <div className="w-px h-4 bg-outline-variant" />

        {/* Legend */}
        <div className="hidden xl:flex items-center gap-3 pr-1 text-on-surface-variant font-mono-code text-body-sm">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            Healthy
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-error shadow-[0_0_8px_rgba(255,180,171,0.8)]" />
            Quarantined
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary-container" />
            Mesh Agent
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-5 h-2" fill="none">
              <line stroke="#4cd7f6" strokeDasharray="3 3" strokeWidth="2" x1="0" x2="20" y1="4" y2="4" />
            </svg>
            Traffic
          </span>
        </div>
      </header>

      {/* Main Dynamic Interactive Graph Space */}
      <div
        ref={viewportRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative w-full h-full ${isPanning ? 'cursor-grabbing' : 'cursor-grab'} overflow-hidden`}
        id="graph-viewport"
      >
        {/* Transform container for Pan & Zoom */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '50% 50%',
            transition: isPanning ? 'none' : 'transform 0.15s ease-out',
            width: '100%',
            height: '100%',
            position: 'absolute',
            inset: 0,
          }}
        >
          {/* Flow Vector SVG Layer (Cables & Beziers) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: 'drop-shadow(0 0 6px rgba(76,215,246,0.3))' }}>
            <defs>
              <linearGradient id="grad-active" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" stopColor="#4cd7f6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#c0c1ff" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="grad-severed" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" stopColor="#ffb4ab" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#ffb4ab" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="grad-agent" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#8083ff" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#ffb4ab" stopOpacity="0.9" />
              </linearGradient>
              <filter height="140%" id="glow-rose" width="140%" x="-20%" y="-20%">
                <feGaussianBlur result="blur" stdDeviation="3" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Ingress -> Auth Service Bezier */}
            <path
              className="mesh-cable animate-[dash_1.5s_linear_infinite]"
              d="M 230 290 C 290 290, 290 190, 360 190"
              fill="none"
              stroke="url(#grad-active)"
              strokeDasharray="6 4"
              strokeWidth="2.5"
              opacity={isNodeDimmed('default') ? 0.15 : 1}
            />

            {/* Ingress -> Payment Service Bezier */}
            <path
              className="mesh-cable animate-[dash_1.5s_linear_infinite]"
              d="M 230 300 C 290 300, 290 410, 360 410"
              fill="none"
              stroke="url(#grad-active)"
              strokeDasharray="6 4"
              strokeWidth="2.5"
            />

            {/* Auth Service -> Pod 1 */}
            <path
              className="mesh-cable"
              d="M 520 180 C 560 180, 560 130, 600 130"
              fill="none"
              stroke="#4edea3"
              strokeOpacity={isNodeDimmed('default') ? 0.1 : 0.6}
              strokeWidth="2"
            />

            {/* Auth Service -> Pod 2 */}
            <path
              className="mesh-cable"
              d="M 520 200 C 560 200, 560 240, 600 240"
              fill="none"
              stroke="#4edea3"
              strokeOpacity={isNodeDimmed('default') ? 0.1 : 0.6}
              strokeWidth="2"
            />

            {/* Payment Service -> Pod 1 (Healthy) */}
            <path
              className="mesh-cable"
              d="M 520 400 C 560 400, 560 350, 600 350"
              fill="none"
              stroke="#4edea3"
              strokeOpacity={quarantinedOnly ? 0.1 : 0.6}
              strokeWidth="2"
            />

            {/* Payment Service -> Pod 2 (Healthy) */}
            <path
              className="mesh-cable"
              d="M 520 420 C 560 420, 560 460, 600 460"
              fill="none"
              stroke="#4edea3"
              strokeOpacity={quarantinedOnly ? 0.1 : 0.6}
              strokeWidth="2"
            />

            {/* Payment Service -> Severed/Quarantined Pod Route */}
            {isQuarantined ? (
              <path
                className="mesh-cable"
                d="M 520 440 C 580 440, 580 570, 640 570"
                fill="none"
                filter="url(#glow-rose)"
                stroke="url(#grad-severed)"
                strokeDasharray="8 6"
                strokeWidth="3"
              />
            ) : (
              <path
                className="mesh-cable animate-[dash_1.5s_linear_infinite]"
                d="M 520 440 C 580 440, 580 570, 640 570"
                fill="none"
                stroke="#4edea3"
                strokeDasharray="4 4"
                strokeWidth="2.5"
                strokeOpacity="0.8"
              />
            )}

            {/* KubeHeal Mesh Agent -> Quarantined Pod Isolation Beam */}
            {isQuarantined && (
              <path
                className="mesh-cable animate-[dash_0.8s_linear_infinite]"
                d="M 760 380 C 760 450, 770 480, 770 510"
                fill="none"
                stroke="url(#grad-agent)"
                strokeDasharray="4 4"
                strokeWidth="2"
              />
            )}
          </svg>

          {/* NODE 1: Ingress Gateway Card */}
          <div
            onClick={() => {
              setSelectedNode('ingress');
              setIsDrawerOpen(true);
            }}
            style={{ opacity: isNodeDimmed('ingress-nginx') ? 0.25 : 1 }}
            className="mesh-node absolute top-[230px] left-[50px] w-48 rounded-xl bg-surface-container-high/90 backdrop-blur-md p-3.5 shadow-xl transition-all duration-200 hover:scale-105 border border-surface-container/60 cursor-pointer"
          >
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-tertiary text-sm">lan</span>
                <span className="font-label-caps text-label-caps text-tertiary uppercase">Ingress Gateway</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(78,222,163,0.8)]" />
            </div>
            <p className="font-mono-code text-body-md text-on-surface font-semibold truncate">ingress-nginx-controller</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Host: api.kubeheal.mesh</p>
            <div className="mt-3 pt-2.5 bg-surface-container-lowest/50 rounded-lg p-2 flex items-center justify-between">
              <div>
                <span className="font-label-caps text-label-caps text-outline block">INGRESS RATE</span>
                <span className="font-mono-metric-md text-mono-metric-md text-tertiary">
                  1.42k <span className="text-body-sm text-outline font-normal">req/s</span>
                </span>
              </div>
              <div className="text-right">
                <span className="font-label-caps text-label-caps text-outline block">TLS CERT</span>
                <span className="font-mono-code text-body-sm text-secondary font-medium">Valid (284d)</span>
              </div>
            </div>
          </div>

          {/* NODE 2: Service Node A (Auth Service) */}
          <div
            onClick={() => {
              setSelectedNode('auth-service');
              setIsDrawerOpen(true);
            }}
            style={{ opacity: isNodeDimmed('default') ? 0.25 : 1 }}
            className="mesh-node absolute top-[140px] left-[360px] w-44 rounded-xl bg-surface-container-high/85 backdrop-blur-md p-3 shadow-lg hover:bg-surface-container-highest transition-all duration-200 border border-surface-container/50 cursor-pointer"
          >
            <div className="flex items-center justify-between pb-1.5">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-secondary text-sm">dns</span>
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">ClusterIP</span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-secondary/15 text-secondary font-mono-code text-[10px]">2/2 PODS</span>
            </div>
            <p className="font-mono-code text-body-md text-on-surface font-semibold">auth-service</p>
            <span className="font-mono-code text-body-sm text-outline">10.96.0.42:8080</span>
            <div className="mt-2 text-on-surface-variant flex items-center justify-between text-body-sm">
              <span>Latency p99:</span>
              <span className="text-secondary font-mono-code">14ms</span>
            </div>
          </div>

          {/* Pods for Auth Service */}
          <div
            style={{ opacity: isNodeDimmed('default') ? 0.25 : 1 }}
            className="mesh-node absolute top-[105px] left-[600px] w-36 rounded-lg bg-surface-container-low/90 backdrop-blur-md p-2 shadow transition hover:bg-surface-container border border-surface-container/40"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono-code text-body-sm text-on-surface font-medium truncate">auth-pod-1</span>
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            </div>
            <div className="mt-1 flex items-center justify-between text-body-sm font-mono-code text-on-surface-variant">
              <span>14% CPU</span>
              <span>42MB</span>
            </div>
          </div>

          <div
            style={{ opacity: isNodeDimmed('default') ? 0.25 : 1 }}
            className="mesh-node absolute top-[215px] left-[600px] w-36 rounded-lg bg-surface-container-low/90 backdrop-blur-md p-2 shadow transition hover:bg-surface-container border border-surface-container/40"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono-code text-body-sm text-on-surface font-medium truncate">auth-pod-2</span>
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            </div>
            <div className="mt-1 flex items-center justify-between text-body-sm font-mono-code text-on-surface-variant">
              <span>18% CPU</span>
              <span>46MB</span>
            </div>
          </div>

          {/* NODE 3: Service Node B (Payment Service - Degraded / Recovered) */}
          <div
            onClick={() => {
              setSelectedNode('payment-service');
              setIsDrawerOpen(true);
            }}
            className={`mesh-node absolute top-[370px] left-[360px] w-48 rounded-xl bg-surface-container-high/90 backdrop-blur-md p-3.5 shadow-xl transition hover:bg-surface-container-highest cursor-pointer ${
              isQuarantined
                ? 'shadow-error-container/20 ring-1 ring-error/40'
                : 'shadow-secondary/20 ring-1 ring-secondary/40'
            }`}
          >
            <div className="flex items-center justify-between pb-1.5">
              <div className="flex items-center gap-1.5">
                <span className={`material-symbols-outlined text-sm ${isQuarantined ? 'text-error animate-pulse' : 'text-secondary'}`}>
                  {isQuarantined ? 'warning' : 'check_circle'}
                </span>
                <span className={`font-label-caps text-label-caps uppercase font-bold ${isQuarantined ? 'text-error' : 'text-secondary'}`}>
                  {isQuarantined ? 'DEGRADED (2/3)' : 'HEALTHY (3/3)'}
                </span>
              </div>
              <span className={`px-1.5 py-0.5 rounded font-mono-code text-[10px] ${isQuarantined ? 'bg-error/20 text-error' : 'bg-secondary/20 text-secondary'}`}>
                {isQuarantined ? 'RESTART x4' : 'ACTIVE'}
              </span>
            </div>
            <p className="font-mono-code text-body-md text-on-surface font-semibold">payment-service</p>
            <span className="font-mono-code text-body-sm text-outline">10.96.12.88:443</span>
            <div className="mt-2.5 pt-2 bg-surface-container-lowest/60 rounded p-1.5 space-y-1">
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-on-surface-variant">Failure Rate:</span>
                <span className={`font-mono-code font-semibold ${isQuarantined ? 'text-error' : 'text-secondary'}`}>
                  {isQuarantined ? '31.4%' : '0.0%'}
                </span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-1">
                <div
                  className={`h-1 rounded-full transition-all duration-700 ${isQuarantined ? 'bg-error' : 'bg-secondary'}`}
                  style={{ width: isQuarantined ? '31.4%' : '0%' }}
                />
              </div>
            </div>
          </div>

          {/* Healthy Pods for Payment Service */}
          <div
            style={{ opacity: quarantinedOnly ? 0.25 : 1 }}
            className="mesh-node absolute top-[325px] left-[600px] w-36 rounded-lg bg-surface-container-low/90 backdrop-blur-md p-2 shadow transition hover:bg-surface-container border border-surface-container/40"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono-code text-body-sm text-on-surface font-medium truncate">payment-pod-1</span>
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            </div>
            <div className="mt-1 flex items-center justify-between text-body-sm font-mono-code text-on-surface-variant">
              <span>38% CPU</span>
              <span>118MB</span>
            </div>
          </div>

          <div
            style={{ opacity: quarantinedOnly ? 0.25 : 1 }}
            className="mesh-node absolute top-[435px] left-[600px] w-36 rounded-lg bg-surface-container-low/90 backdrop-blur-md p-2 shadow transition hover:bg-surface-container border border-surface-container/40"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono-code text-body-sm text-on-surface font-medium truncate">payment-pod-2</span>
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            </div>
            <div className="mt-1 flex items-center justify-between text-body-sm font-mono-code text-on-surface-variant">
              <span>44% CPU</span>
              <span>124MB</span>
            </div>
          </div>

          {/* NODE 4: Quarantined Pod Node (SELECTED POD) */}
          <div
            onClick={() => {
              setSelectedNode('payment-quarantined');
              setIsDrawerOpen(true);
            }}
            className={`mesh-node absolute top-[515px] left-[640px] w-64 rounded-xl bg-surface-container-high/95 backdrop-blur-xl p-4 cursor-pointer transform hover:scale-[1.02] transition-all duration-300 border ${
              isQuarantined
                ? 'shadow-[0_0_30px_rgba(255,180,171,0.35)] ring-2 ring-error border-error/50'
                : 'shadow-[0_0_20px_rgba(78,222,163,0.35)] ring-2 ring-secondary border-secondary/50'
            }`}
            id="quarantined-pod-card"
          >
            {/* Floating Red Lock Badge */}
            {isQuarantined ? (
              <div className="absolute -top-3 -right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-error text-on-error shadow-lg">
                <span className="material-symbols-outlined text-xs">gavel</span>
                <span className="font-label-caps text-label-caps uppercase font-bold tracking-wider">Quarantined</span>
              </div>
            ) : (
              <div className="absolute -top-3 -right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-on-secondary shadow-lg">
                <span className="material-symbols-outlined text-xs">verified</span>
                <span className="font-label-caps text-label-caps uppercase font-bold tracking-wider">Restored</span>
              </div>
            )}

            <div className="flex items-center gap-2 pb-2">
              <span className={`material-symbols-outlined text-base ${isQuarantined ? 'text-error animate-spin' : 'text-secondary'}`}>
                {isQuarantined ? 'sync_problem' : 'check_circle'}
              </span>
              <span className={`font-label-caps text-label-caps font-semibold ${isQuarantined ? 'text-error' : 'text-secondary'}`}>
                {isQuarantined ? 'CONTAINER CRASHING' : 'RUNNING (v2.4.18)'}
              </span>
            </div>

            <p className="font-mono-code text-body-md text-on-surface font-semibold truncate" title="payment-service-75b4f85d4f-xk92">
              payment-service-75b4f85d4f-xk92
            </p>
            <span className="font-mono-code text-body-sm text-outline">Node: worker-node-us-east-02</span>

            {/* Memory Gauge */}
            <div className="mt-3 p-2 rounded bg-surface-container-lowest/80 space-y-1">
              <div className="flex items-center justify-between text-body-sm font-mono-code">
                <span className="text-on-surface-variant">Memory Usage:</span>
                <span className={`font-bold ${isQuarantined ? 'text-error' : 'text-secondary'}`}>
                  {isQuarantined ? '502Mi / 512Mi (98%)' : '174Mi / 512Mi (34%)'}
                </span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${isQuarantined ? 'bg-error animate-pulse' : 'bg-secondary'}`}
                  style={{ width: `${memoryUsage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-outline pt-0.5 font-mono-code">
                <span>{isQuarantined ? 'OOMKill: imminent' : 'OOMKill: cleared'}</span>
                <span>Restarts: {isQuarantined ? 4 : 0}</span>
              </div>
            </div>

            {/* Severed Banner / Restored Banner */}
            {isQuarantined ? (
              <div className="mt-2.5 py-1 px-2 rounded bg-error-container/40 text-on-error-container flex items-center justify-center gap-1.5 font-label-caps text-[9px] uppercase tracking-wider">
                <span className="material-symbols-outlined text-xs">link_off</span>
                Traffic Severed By KubeHeal
              </div>
            ) : (
              <div className="mt-2.5 py-1 px-2 rounded bg-secondary-container/30 text-secondary flex items-center justify-center gap-1.5 font-label-caps text-[9px] uppercase tracking-wider">
                <span className="material-symbols-outlined text-xs">link</span>
                Traffic Restored To Ingress Mesh
              </div>
            )}
          </div>

          {/* Floating Controller Mesh Node */}
          <div
            onClick={() => {
              setSelectedNode('agent');
              setIsDrawerOpen(true);
            }}
            className="mesh-node agent-floating-node absolute top-[290px] left-[710px] w-52 rounded-xl bg-surface-container-high/90 backdrop-blur-xl p-3 shadow-2xl ring-1 ring-primary/50 cursor-pointer border border-primary/20 hover:scale-105 transition"
          >
            <div className="flex items-center justify-between pb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-sm animate-pulse">auto_fix</span>
                <span className="font-label-caps text-label-caps text-primary uppercase font-bold">Autonomous Agent</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            </div>
            <p className="font-mono-code text-body-sm text-on-surface font-medium">kubeheal-agent-ds-9x0a</p>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono-code text-tertiary">
              <span className="material-symbols-outlined text-xs">shield</span>
              <span>{isQuarantined ? 'Sandboxed: payment-pod' : 'Monitoring: cluster mesh'}</span>
            </div>
          </div>
        </div>

        {/* HUD Minimap Overlay (Bottom-Left) */}
        <div className="mesh-hud absolute bottom-4 left-4 w-48 h-36 rounded-lg bg-surface-container-high/90 backdrop-blur-md p-2.5 shadow-2xl flex flex-col justify-between border border-surface-container/60 select-none pointer-events-none">
          <div className="flex items-center justify-between text-body-sm">
            <span className="font-label-caps text-[9px] text-outline uppercase tracking-wider">Mesh Radar</span>
            <span className="font-mono-code text-[10px] text-secondary">LIVE 1:10</span>
          </div>

          {/* Minimap Layout Mock */}
          <div className="relative flex-1 my-1.5 rounded bg-surface-container-lowest/90 overflow-hidden border border-surface-container/50">
            {/* Rotating Radar Sweep Beam */}
            <div
              className="absolute inset-0 origin-center pointer-events-none opacity-20"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, #4edea3 360deg)',
                animation: 'radar-sweep 4s linear infinite',
              }}
            />

            {/* Dot representation of nodes */}
            <div className="absolute top-5 left-4 w-1.5 h-1.5 rounded-full bg-tertiary shadow-[0_0_6px_#4cd7f6]" />
            <div className="absolute top-3 left-10 w-1.5 h-1.5 rounded-full bg-secondary" />
            <div className="absolute top-9 left-10 w-1.5 h-1.5 rounded-full bg-secondary" />
            <div
              className={`absolute top-12 left-16 rounded-full transition-colors ${
                isQuarantined ? 'w-2 h-2 bg-error ring-1 ring-error animate-ping' : 'w-1.5 h-1.5 bg-secondary'
              }`}
            />
            <div className="absolute top-7 left-20 w-1.5 h-1.5 rounded-full bg-primary" />

            {/* Viewport Box indicator */}
            <div
              className="absolute rounded ring-1 ring-primary/60 bg-primary/10 transition-all duration-75"
              style={{
                inset: `${Math.max(2, 6 - (zoom - 1) * 8)}px`,
                transform: `translate(${(-pan.x / 40).toFixed(1)}px, ${(-pan.y / 40).toFixed(1)}px)`,
              }}
            />
          </div>

          <span className="font-mono-code text-[9px] text-outline text-right">kind-kubeheal: cluster-01</span>
        </div>

        {/* Collapsed Drawer Reopen Handle Button */}
        {!isDrawerOpen && (
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="absolute top-4 right-4 z-30 flex items-center gap-2 px-3 py-2 rounded-full bg-surface-container-high/90 backdrop-blur-md shadow-2xl border border-surface-container/80 text-on-surface hover:bg-surface-container-highest transition active:scale-95"
          >
            <span className="material-symbols-outlined text-primary text-sm">crisis_alert</span>
            <span className="font-mono-code text-body-sm">Open Triage Drawer</span>
            <span className="material-symbols-outlined text-sm text-outline">chevron_left</span>
          </button>
        )}
      </div>

      {/* Right Flyout Triage Drawer Panel (Fixed 480px) */}
      <aside
        id="triage-drawer"
        className={`absolute top-0 right-0 bottom-0 w-[480px] bg-surface-container-low/95 backdrop-blur-2xl shadow-[-12px_0_30px_rgba(0,0,0,0.7)] z-40 flex flex-col border-l border-surface-container-high/40 transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header Bar */}
        <div className="p-4 bg-surface-container/60 flex flex-col gap-2 border-b border-surface-container/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isQuarantined && selectedNode === 'payment-quarantined'
                    ? 'bg-error-container/50 text-error'
                    : 'bg-secondary-container/50 text-secondary'
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {isQuarantined && selectedNode === 'payment-quarantined' ? 'crisis_alert' : 'verified'}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-mono-code text-body-md text-on-surface font-semibold truncate max-w-[240px]">
                    {activeDetails.title}
                  </h2>
                  <button
                    onClick={handleCopyPod}
                    className="text-outline hover:text-on-surface transition relative"
                    title="Copy name"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {copied ? 'check' : 'content_copy'}
                    </span>
                    {copied && (
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-surface-container-highest text-[10px] text-secondary font-mono-code whitespace-nowrap">
                        Copied!
                      </span>
                    )}
                  </button>
                </div>
                <p className="font-body-sm text-body-sm text-outline">
                  Namespace: <span className="font-mono-code text-on-surface-variant">{activeDetails.ns}</span> • Node:{' '}
                  <span className="font-mono-code text-on-surface-variant">{activeDetails.node}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition"
                id="toggle-drawer"
                title="Close drawer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>

          {/* Badges Bar */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {isQuarantined ? (
              <span className="px-2 py-0.5 rounded-full bg-error/20 text-error font-label-caps text-[10px] uppercase font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
                CrashLoopBackOff
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-secondary/20 text-secondary font-label-caps text-[10px] uppercase font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                Self-Healed (v2.4.18)
              </span>
            )}
            <span
              className={`px-2 py-0.5 rounded-full font-label-caps text-[10px] uppercase font-semibold ${
                isQuarantined
                  ? 'bg-primary-container/20 text-primary-fixed-dim'
                  : 'bg-surface-container-high text-on-surface-variant'
              }`}
            >
              {isQuarantined ? 'Controller Quarantined' : 'Routing Restored'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-caps text-[10px] uppercase font-mono-code">
              Restarts: {isQuarantined ? '4 (Last: 34s ago)' : '0 (Stable)'}
            </span>
          </div>
        </div>

        {/* Remediation Quick Actions Bar */}
        <div className="p-3 bg-surface-container-lowest/80 flex items-center justify-between gap-2 border-b border-surface-container/50">
          <button
            onClick={handleRollback}
            disabled={rollbackState !== 'idle'}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded font-headline-md text-body-md font-semibold transition shadow-[0_0_12px_rgba(128,131,255,0.4)] ${
              rollbackState === 'dispatched'
                ? 'bg-secondary-container text-on-secondary'
                : 'bg-primary-container text-on-primary-container hover:bg-primary'
            }`}
            id="btn-rollback"
          >
            {rollbackState === 'rolling-back' ? (
              <>
                <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                Rolling back...
              </>
            ) : rollbackState === 'dispatched' ? (
              <>
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Rollback Dispatched
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">history</span>
                Rollback (v2.4.18)
              </>
            )}
          </button>

          <button
            onClick={handleReleaseLock}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-surface-container-high text-on-surface font-body-md hover:bg-surface-container-highest transition border border-surface-container/60"
            id="btn-release"
            title="Unlock routing immediately"
          >
            <span className="material-symbols-outlined text-sm text-outline">shield_with_heart</span>
            Release Lock
          </button>

          <button
            onClick={() => {
              setLogs((prev) => [
                ...prev,
                {
                  id: String(Date.now()),
                  time: new Date().toTimeString().split(' ')[0] + '.042',
                  type: 'info',
                  text: 'sys: V8 Heap Snapshot generated at /var/log/heap-checkout-75b4.heapsnapshot (182MB)',
                },
              ]);
            }}
            className="w-9 h-9 flex items-center justify-center rounded bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition border border-surface-container/60"
            title="Inspect V8 Memory Core Dump"
          >
            <span className="material-symbols-outlined text-sm">memory</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center px-4 bg-surface-container-low text-body-sm font-medium border-b border-surface-container/60">
          {(['overview', 'logs', 'metadata', 'remediation'] as const).map((tab) => {
            const labels: Record<string, string> = {
              overview: 'Overview',
              logs: 'Live Logs',
              metadata: 'Metadata',
              remediation: 'Remediation Log',
            };
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2.5 px-3 transition flex items-center gap-1.5 relative ${
                  isActive ? 'text-primary border-b-2 border-primary font-semibold' : 'text-outline hover:text-on-surface'
                }`}
              >
                {tab === 'logs' && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                {labels[tab]}
                {tab === 'remediation' && (
                  <span className="px-1 py-0.2 rounded bg-surface-container text-[10px] font-mono-code text-on-surface-variant">
                    {rollbackState === 'dispatched' ? '4' : '3'}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Tab Body */}
        <div className="flex-1 flex flex-col p-3 overflow-y-auto space-y-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col space-y-3"
            >
              {activeTab === 'logs' && (
                <>
                  {/* Live Terminal Box */}
              <div className="flex-1 flex flex-col rounded-lg bg-[#05070B] overflow-hidden shadow-inner min-h-[280px] border border-surface-container/60">
                {/* Terminal Header Bar */}
                <div className="px-3 py-1.5 bg-[#0D1017] flex items-center justify-between text-body-sm font-mono-code text-on-surface-variant border-b border-surface-container/40">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E06C75]/60 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5C07B]/60 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#98C379]/60 inline-block" />
                    <span className="text-outline pl-1 text-[11px]">stream: payment-worker (stderr)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-[11px] cursor-pointer text-outline hover:text-on-surface select-none">
                      <input
                        checked={autoScroll}
                        onChange={(e) => setAutoScroll(e.target.checked)}
                        className="rounded w-3 h-3 bg-surface-container accent-primary"
                        type="checkbox"
                      />
                      Auto-scroll
                    </label>
                    <button
                      onClick={handleClearLogs}
                      className="text-outline hover:text-on-surface transition"
                      title="Clear console"
                    >
                      <span className="material-symbols-outlined text-[14px]">block</span>
                    </button>
                  </div>
                </div>

                {/* Log Content Feed */}
                <div className="p-3 font-mono-code text-[11px] leading-5 text-[#ABB2BF] overflow-y-auto flex-1 space-y-1 select-text">
                  {logs.map((item) => {
                    if (item.type === 'fatal') {
                      return (
                        <div
                          key={item.id}
                          className="p-1 rounded bg-error-container/30 text-on-error-container font-semibold border-l-2 border-error"
                        >
                          [{item.time}] {item.text.replace(/^.*FATAL:\s*/, 'FATAL: ')}
                        </div>
                      );
                    }
                    if (item.type === 'agent') {
                      return (
                        <div key={item.id} className="text-primary flex items-center gap-1.5 pt-1 font-medium">
                          <span className="material-symbols-outlined text-xs">offline_bolt</span>
                          [{item.time}] {item.text}
                        </div>
                      );
                    }
                    if (item.type === 'success') {
                      return (
                        <div key={item.id} className="text-secondary flex items-center gap-1.5 pt-1 font-medium">
                          <span className="material-symbols-outlined text-xs">check_circle</span>
                          [{item.time}] {item.text}
                        </div>
                      );
                    }
                    if (item.type === 'warn') {
                      return (
                        <div key={item.id} className="text-[#E5C07B]">
                          [{item.time}] {item.text}
                        </div>
                      );
                    }
                    if (item.type === 'error') {
                      return (
                        <div key={item.id} className="text-error font-medium">
                          [{item.time}] {item.text}
                        </div>
                      );
                    }
                    if (item.type === 'info') {
                      return (
                        <div key={item.id} className="text-[#61AFEF]">
                          [{item.time}] {item.text}
                        </div>
                      );
                    }
                    return (
                      <div key={item.id} className="text-outline">
                        [{item.time}] {item.text}
                      </div>
                    );
                  })}
                  <div ref={terminalEndRef} />
                  <div className="text-outline animate-pulse font-bold pl-2">&gt; _</div>
                </div>
              </div>

              {/* Heuristic Root Cause Diagnosis Card */}
              <div className="p-3.5 rounded-xl bg-surface-container-high/90 backdrop-blur-md shadow-lg space-y-2.5 border border-surface-container/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-base">psychology</span>
                    <span className="font-headline-md text-body-md text-on-surface font-semibold">Autonomous RCA Insight</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary font-mono-code text-[10px] font-bold">
                    98.4% Confidence
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Deterministic heap exhaustion detected. Memory elevated monotonically until sudden crash on large payload in{' '}
                  <code className="px-1 py-0.5 rounded bg-surface-container-lowest text-primary font-mono-code text-[11px]">
                    /v1/checkout/process
                  </code>
                  .
                </p>
                <div className="pt-1.5 flex items-center justify-between text-body-sm">
                  <span className="text-outline font-label-caps text-[10px] uppercase">Recommended Action</span>
                  <button
                    onClick={handleRollback}
                    className="font-mono-code text-secondary hover:text-primary transition font-medium flex items-center gap-1 group cursor-pointer"
                  >
                    Rollback to sha: <span className="underline group-hover:no-underline">e81fa4</span>
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </button>
                </div>

                {onNavigate && (
                  <div className="pt-2 border-t border-surface-container/60 flex items-center justify-between">
                    <button
                      onClick={() => onNavigate('incidents')}
                      className="text-[11px] font-mono-code text-tertiary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">manage_search</span>
                      <span>Open Incident Forensics (INC-8492)</span>
                    </button>
                    <span className="text-[10px] font-mono-code text-outline">MTTR: 1.86s</span>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'overview' && (
            <div className="p-3.5 rounded-xl bg-surface-container-high/90 backdrop-blur-md shadow-lg space-y-3 font-mono-code text-body-sm border border-surface-container/60">
              <div className="flex items-center justify-between pb-2 border-b border-surface-container/60">
                <span className="text-outline font-label-caps uppercase">Container Image</span>
                <span className="text-primary font-medium">payment-service:v2.4.19-rc3</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-surface-container/60">
                <span className="text-outline font-label-caps uppercase">Node IP</span>
                <span className="text-on-surface">10.244.2.48 (worker-02)</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-surface-container/60">
                <span className="text-outline font-label-caps uppercase">Memory Limit</span>
                <span className="text-error font-medium">512Mi (Strict cgroup ceiling)</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-surface-container/60">
                <span className="text-outline font-label-caps uppercase">CPU Request / Limit</span>
                <span className="text-on-surface">250m / 1000m</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-outline font-label-caps uppercase">eBPF Sensor Probe</span>
                <span className="text-secondary font-medium">Attached (tcp_drop, oom_kill)</span>
              </div>
            </div>
          )}

          {activeTab === 'metadata' && (
            <div className="p-3.5 rounded-xl bg-surface-container-high/90 backdrop-blur-md shadow-lg space-y-2 font-mono-code text-[11px] border border-surface-container/60">
              <div className="text-outline font-label-caps uppercase pb-1 border-b border-surface-container/60">Labels</div>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface-variant">app=payment-service</span>
                <span className="px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface-variant">tier=backend</span>
                <span className="px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface-variant">env=production</span>
                <span className="px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface-variant">kubeheal.mesh/quarantine=active</span>
              </div>

              <div className="text-outline font-label-caps uppercase pt-3 pb-1 border-b border-surface-container/60">Annotations</div>
              <div className="text-on-surface-variant space-y-1">
                <div>kubeheal.io/last-quarantined: 2026-09-07T14:28:02.120Z</div>
                <div>kubeheal.io/rca-rule: HEAP_EXHAUSTION_SIGKILL_137</div>
                <div>prometheus.io/scrape: true</div>
              </div>
            </div>
          )}

          {activeTab === 'remediation' && (
            <div className="p-3.5 rounded-xl bg-surface-container-high/90 backdrop-blur-md shadow-lg space-y-3 font-mono-code text-body-sm border border-surface-container/60">
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-highest">
                <div className="relative">
                  <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-error ring-4 ring-surface-container" />
                  <div className="text-error font-medium">14:28:02 - SIGKILL 137 Detected</div>
                  <p className="text-on-surface-variant text-[11px]">V8 Heap allocation failure intercepted by eBPF sensor.</p>
                </div>
                <div className="relative">
                  <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-surface-container" />
                  <div className="text-primary font-medium">14:28:02 - Autonomous Quarantine Enforced</div>
                  <p className="text-on-surface-variant text-[11px]">Ingress traffic severed to preserve cluster SLO and prevent cascaded failures.</p>
                </div>
                <div className="relative">
                  <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-secondary ring-4 ring-surface-container" />
                  <div className="text-secondary font-medium">
                    {rollbackState === 'dispatched' ? '14:28:05 - Rollback Executed' : '14:28:03 - RCA Recommendation Ready'}
                  </div>
                  <p className="text-on-surface-variant text-[11px]">
                    {rollbackState === 'dispatched'
                      ? 'Reverted deployment image to v2.4.18. Pod healthy.'
                      : 'Rollback to sha:e81fa4 identified with 98.4% confidence.'}
                  </p>
                </div>
              </div>
            </div>
          )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Drawer Footer Telemetry Strip */}
        <div className="p-3 bg-surface-container text-outline font-mono-code text-[11px] flex items-center justify-between border-t border-surface-container/60">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            KubeHeal eBPF Sensor Active
          </span>
          <span>Mesh latency: 0.4ms</span>
        </div>
      </aside>
    </div>
  );
};
