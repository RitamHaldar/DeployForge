import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { AnimatedCounter } from './AnimatedCounter';
import {
  Activity,
  Gauge,
  Cpu,
  ShieldCheck,
  Radio,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Globe,
  RefreshCw,
  SlidersHorizontal,
  ArrowUpRight
} from 'lucide-react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05
    }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1] as const
    }
  }
};

type MetricLensId = 'latency' | 'throughput' | 'budget' | 'ebpf';
type RangeOption = '15m' | '1h' | '6h' | '24h' | '7d';

interface MetricLensConfig {
  id: MetricLensId;
  label: string;
  subLabel: string;
  badge: string;
  value: number;
  decimals: number;
  suffix: string;
  delta: string;
  deltaPositive: boolean;
  deltaText: string;
  color: string;
  accentBg: string;
  accentBorder: string;
  pathD: string;
  areaD: string;
  baselineD: string;
  incidentPoint: { x: number; y: number; title: string; desc: string } | null;
  unit: string;
  bars: number[];
}

const LENS_CONFIGS: Record<MetricLensId, MetricLensConfig> = {
  latency: {
    id: 'latency',
    label: 'Edge P99 Latency',
    subLabel: 'Global TLS termination & DNS',
    badge: 'SLO TARGET < 20MS',
    value: 11.4,
    decimals: 1,
    suffix: 'ms',
    delta: '-2.4ms',
    deltaPositive: true,
    deltaText: 'improved vs 24h ago',
    color: '#00F0FF',
    accentBg: 'rgba(0, 240, 255, 0.1)',
    accentBorder: 'rgba(0, 240, 255, 0.3)',
    pathD: 'M0,160 C150,145 220,130 350,150 C480,170 540,110 650,135 C700,70 730,70 770,120 C840,110 920,80 1000,75',
    areaD: 'M0,160 C150,145 220,130 350,150 C480,170 540,110 650,135 C700,70 730,70 770,120 C840,110 920,80 1000,75 L1000,240 L0,240 Z',
    baselineD: 'M0,185 C200,180 400,182 600,178 C800,175 900,172 1000,170',
    incidentPoint: {
      x: 700,
      y: 70,
      title: 'Auto-Reroute Activated',
      desc: 'US-East traffic shift (3.8s MTTR)'
    },
    unit: 'ms',
    bars: [62, 54, 78, 45, 36, 28, 32, 24]
  },
  throughput: {
    id: 'throughput',
    label: 'Ingress Volume',
    subLabel: 'Distributed Anycast requests',
    badge: '14 EDGE REGIONS',
    value: 4.8,
    decimals: 1,
    suffix: 'M',
    delta: '+16.2%',
    deltaPositive: true,
    deltaText: 'sustained peak load',
    color: '#38BDF8',
    accentBg: 'rgba(56, 189, 248, 0.1)',
    accentBorder: 'rgba(56, 189, 248, 0.3)',
    pathD: 'M0,190 C120,175 220,140 340,125 C460,110 520,130 640,85 C730,55 820,70 910,45 C950,40 980,38 1000,35',
    areaD: 'M0,190 C120,175 220,140 340,125 C460,110 520,130 640,85 C730,55 820,70 910,45 C950,40 980,38 1000,35 L1000,240 L0,240 Z',
    baselineD: 'M0,210 C250,195 500,160 750,130 C880,110 950,95 1000,90',
    incidentPoint: {
      x: 640,
      y: 85,
      title: 'Autoscale Triggered',
      desc: '+24 microVMs provisioned in 620ms'
    },
    unit: 'req/s',
    bars: [35, 48, 62, 75, 88, 92, 98, 95]
  },
  budget: {
    id: 'budget',
    label: 'Error Budget & SLA',
    subLabel: 'Autonomous zero-downtime health',
    badge: 'FOUR NINES PLUS',
    value: 99.998,
    decimals: 3,
    suffix: '%',
    delta: '+0.004%',
    deltaPositive: true,
    deltaText: '99.999% SLA compliant',
    color: '#10B981',
    accentBg: 'rgba(168, 85, 247, 0.1)',
    accentBorder: 'rgba(16, 185, 129, 0.3)',
    pathD: 'M0,50 C180,48 300,52 460,50 C580,49 680,85 710,50 C760,48 880,47 1000,46',
    areaD: 'M0,50 C180,48 300,52 460,50 C580,49 680,85 710,50 C760,48 880,47 1000,46 L1000,240 L0,240 Z',
    baselineD: 'M0,70 C300,70 600,70 1000,70',
    incidentPoint: {
      x: 680,
      y: 85,
      title: 'Isolate Recycled',
      desc: 'Memory pressure resolved with 0 5xx'
    },
    unit: '% SLA',
    bars: [99, 99, 98, 92, 99, 100, 100, 100]
  },
  ebpf: {
    id: 'ebpf',
    label: 'Kernel eBPF Overhead',
    subLabel: 'Zero sidecar daemon footprint',
    badge: 'NANOSECOND PROBES',
    value: 0.06,
    decimals: 2,
    suffix: '%',
    delta: '-0.02%',
    deltaPositive: true,
    deltaText: 'negligible CPU impact',
    color: '#A855F7',
    accentBg: 'rgba(168, 85, 247, 0.1)',
    accentBorder: 'rgba(168, 85, 247, 0.3)',
    pathD: 'M0,205 C140,210 240,195 380,200 C500,205 600,190 720,205 C810,195 910,210 1000,202',
    areaD: 'M0,205 C140,210 240,195 380,200 C500,205 600,190 720,205 C810,195 910,210 1000,202 L1000,240 L0,240 Z',
    baselineD: 'M0,225 C300,225 600,225 1000,225',
    incidentPoint: {
      x: 720,
      y: 205,
      title: 'Syscall Sampling Peak',
      desc: '2.8M packet hooks/sec executed'
    },
    unit: '% CPU',
    bars: [12, 16, 14, 22, 18, 15, 14, 12]
  }
};

interface TraceSpan {
  service: string;
  operation: string;
  durationMs: number;
  offsetPct: number;
  widthPct: number;
  color: string;
  status: string;
}

interface DistributedTrace {
  id: string;
  endpoint: string;
  totalDurationMs: number;
  statusCode: number;
  spans: TraceSpan[];
}

const SAMPLE_TRACES: DistributedTrace[] = [
  {
    id: 'tr-894f2',
    endpoint: 'GET /v2/deployments/sync',
    totalDurationMs: 12.4,
    statusCode: 200,
    spans: [
      { service: 'edge-gateway', operation: 'TLS Handshake & Geo Routing', durationMs: 1.8, offsetPct: 0, widthPct: 15, color: '#00F0FF', status: '200 OK' },
      { service: 'auth-sentinel', operation: 'Ed25519 Token Verify', durationMs: 1.1, offsetPct: 15, widthPct: 9, color: '#10B981', status: '200 OK' },
      { service: 'mesh-router', operation: 'eBPF L4 Socket Redirect', durationMs: 2.3, offsetPct: 24, widthPct: 18, color: '#38BDF8', status: '200 OK' },
      { service: 'state-store', operation: 'Distributed Raft Consensus', durationMs: 3.4, offsetPct: 42, widthPct: 28, color: '#A855F7', status: '200 OK' },
      { service: 'isolate-runner', operation: 'Firecracker VM Execution', durationMs: 3.8, offsetPct: 70, widthPct: 30, color: '#F59E0B', status: '200 OK' }
    ]
  },
  {
    id: 'tr-67c10',
    endpoint: 'POST /v1/telemetry/ingest',
    totalDurationMs: 6.8,
    statusCode: 202,
    spans: [
      { service: 'edge-gateway', operation: 'Header Validation & Rate Limit', durationMs: 0.9, offsetPct: 0, widthPct: 13, color: '#00F0FF', status: '200 OK' },
      { service: 'stream-buffer', operation: 'Ring Buffer Lockless Push', durationMs: 1.6, offsetPct: 13, widthPct: 24, color: '#10B981', status: '200 OK' },
      { service: 'ebpf-filter', operation: 'Kernel Packet Decompression', durationMs: 2.2, offsetPct: 37, widthPct: 32, color: '#38BDF8', status: '200 OK' },
      { service: 'collector-node', operation: 'Batch Append to Parquet Lake', durationMs: 2.1, offsetPct: 69, widthPct: 31, color: '#A855F7', status: '202 Queued' }
    ]
  },
  {
    id: 'tr-91a04',
    endpoint: 'GET /healthz/readiness',
    totalDurationMs: 2.1,
    statusCode: 200,
    spans: [
      { service: 'edge-gateway', operation: 'Health Probe Ingress', durationMs: 0.4, offsetPct: 0, widthPct: 19, color: '#00F0FF', status: '200 OK' },
      { service: 'node-sentinel', operation: 'Memory & Thread Count Check', durationMs: 0.8, offsetPct: 19, widthPct: 38, color: '#10B981', status: '200 OK' },
      { service: 'mesh-router', operation: 'Direct Socket Return', durationMs: 0.9, offsetPct: 57, widthPct: 43, color: '#38BDF8', status: '200 OK' }
    ]
  }
];

const EDGE_ZONES = [
  { code: 'SFO-1', region: 'US West', ping: '6.8ms', jitter: '0.2ms', status: 'online' },
  { code: 'IAD-2', region: 'US East', ping: '11.2ms', jitter: '0.4ms', status: 'online' },
  { code: 'FRA-1', region: 'EU Central', ping: '13.9ms', jitter: '0.3ms', status: 'online' },
  { code: 'NRT-1', region: 'Asia East', ping: '22.4ms', jitter: '0.5ms', status: 'online' },
  { code: 'SIN-1', region: 'SE Asia', ping: '27.1ms', jitter: '0.6ms', status: 'online' },
  { code: 'SYD-1', region: 'Oceania', ping: '34.8ms', jitter: '0.8ms', status: 'online' }
];

export function ObservabilitySection() {
  const [activeLens, setActiveLens] = useState<MetricLensId>('latency');
  const [activeRange, setActiveRange] = useState<RangeOption>('1h');
  const [isLiveStream, setIsLiveStream] = useState(true);
  const [selectedTraceId, setSelectedTraceId] = useState<string>('tr-894f2');

  // Stable active span state to eliminate all layout shifts & glitching on scroll
  const [activeSpanIndex, setActiveSpanIndex] = useState<number>(0);

  // SVG Path Reference for pixel-perfect curve tracking
  const pathRef = useRef<SVGPathElement | null>(null);

  // Graph Scrubber Point (x: 0-1000, y: 0-240)
  const [scrubber, setScrubber] = useState<{ x: number; y: number; pct: number; isHovering: boolean }>({
    x: 960,
    y: 75,
    pct: 0.96,
    isHovering: false
  });

  const [showIncidentModal, setShowIncidentModal] = useState(false);

  const ranges: RangeOption[] = ['15m', '1h', '6h', '24h', '7d'];
  const currentLens = LENS_CONFIGS[activeLens];
  const activeTrace = SAMPLE_TRACES.find((t) => t.id === selectedTraceId) || SAMPLE_TRACES[0];
  const currentActiveSpan = activeTrace.spans[activeSpanIndex] || activeTrace.spans[0];

  // Subtle live stream pulse ticker
  const [pulseCount, setPulseCount] = useState(0);
  useEffect(() => {
    if (!isLiveStream) return;
    const interval = window.setInterval(() => {
      setPulseCount((c) => (c + 1) % 1000);
    }, 2400);
    return () => window.clearInterval(interval);
  }, [isLiveStream]);

  // High-precision binary search on SVG path to find exact (x, y) along curve
  const getPointOnPathAtX = useCallback((targetX: number): { x: number; y: number } => {
    const pathEl = pathRef.current;
    if (!pathEl) {
      // Fallback interpolation
      return { x: targetX, y: 120 };
    }

    try {
      const totalLength = pathEl.getTotalLength();
      let low = 0;
      let high = totalLength;
      let best = { x: targetX, y: 120 };

      // 16 iterations is sub-millisecond fast (< 0.008ms) and accurate to < 0.05px
      for (let i = 0; i < 16; i++) {
        const mid = (low + high) / 2;
        const pt = pathEl.getPointAtLength(mid);
        best = { x: pt.x, y: pt.y };

        if (Math.abs(pt.x - targetX) < 0.25) {
          return best;
        }
        if (pt.x < targetX) {
          low = mid;
        } else {
          high = mid;
        }
      }
      return best;
    } catch {
      return { x: targetX, y: 120 };
    }
  }, []);

  const handleLensSelect = (lensId: MetricLensId) => {
    setActiveLens(lensId);
    const pt = getPointOnPathAtX(960);
    setScrubber({
      x: pt.x,
      y: pt.y,
      pct: 0.96,
      isHovering: false
    });
  };

  // Card mouse-follow spotlight glow
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  // Direct, silky-smooth mouse pointer tracking over chart
  const handleChartMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const pct = clientX / rect.width;
    const targetSvgX = Math.max(10, Math.min(990, pct * 1000));
    const pt = getPointOnPathAtX(targetSvgX);

    setScrubber({
      x: pt.x,
      y: pt.y,
      pct,
      isHovering: true
    });
  };

  const handleChartMouseLeave = () => {
    // When pointer leaves, smoothly return to the live edge point
    const livePt = getPointOnPathAtX(960);
    setScrubber({
      x: livePt.x,
      y: livePt.y,
      pct: 0.96,
      isHovering: false
    });
  };

  return (
    <section id="observability" className="py-24 sm:py-32 border-t border-white/[0.08] relative z-10 bg-[#070809] overflow-hidden">
      {/* Ambient background volumetric radial glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] bg-accent-cyan/[0.03] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[350px] bg-accent-purple/[0.02] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -40px 0px' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-xs font-mono text-accent-cyan mb-3.5 backdrop-blur-md">
              <Radio className="w-3.5 h-3.5 animate-pulse text-accent-cyan" />
              <span>KERNEL eBPF &amp; DISTRIBUTED OBSERVABILITY</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3.5 font-sans leading-tight">
              Instant telemetry. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan via-white to-accent-emerald">
                Zero agent tax.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 font-mono leading-relaxed">
              Nanosecond-granularity kernel probes with zero sidecar overhead. Correlate p99 latency spikes,
              distributed trace waterfalls, and autonomous self-healing rollbacks in real time.
            </p>
          </motion.div>

          {/* Top Live Control Bar */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-3 self-start lg:self-end"
          >
            <button
              type="button"
              onClick={() => setIsLiveStream(!isLiveStream)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all duration-200 active:scale-95 cursor-pointer ${
                isLiveStream
                  ? 'bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald shadow-[0_0_16px_rgba(16,185,129,0.15)]'
                  : 'bg-white/[0.04] border-white/[0.08] text-neutral-400 hover:text-white'
              }`}
            >
              <span className="relative flex h-2 w-2">
                {isLiveStream && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-emerald opacity-75" />
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isLiveStream ? 'bg-accent-emerald' : 'bg-neutral-500'}`} />
              </span>
              <span>{isLiveStream ? 'LIVE STREAM' : 'STREAM PAUSED'}</span>
            </button>

            {/* Time Range Selector */}
            <div className="flex items-center gap-1 font-mono text-xs bg-[#0B0D10] p-1 rounded-xl border border-white/[0.08] shadow-inner">
              {ranges.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setActiveRange(r)}
                  className={`relative px-3 py-1 rounded-lg transition-colors duration-200 active:scale-95 text-xs font-mono cursor-pointer ${
                    activeRange === r ? 'text-white font-semibold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {activeRange === r && (
                    <motion.div
                      layoutId="active-range-pill"
                      className="absolute inset-0 rounded-lg bg-white/[0.1] border border-white/20 shadow-sm backdrop-blur-md"
                      transition={{ type: 'spring', stiffness: 480, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{r}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* 4 Interactive Lens Metric Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '0px 0px -30px 0px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          {/* Card 1: Latency */}
          <motion.div
            variants={cardVariants}
            onMouseMove={handleCardMouseMove}
            onClick={() => handleLensSelect('latency')}
            whileHover={{ y: -3, scale: 1.012 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            className={`spotlight-card rounded-2xl p-5 border cursor-pointer transition-all duration-200 backdrop-blur-xl relative overflow-hidden ${
              activeLens === 'latency'
                ? 'bg-[#0B0E14] border-accent-cyan shadow-[0_0_28px_rgba(0,240,255,0.12)]'
                : 'bg-[#090B0E]/90 border-white/[0.08] hover:border-accent-cyan/40 hover:bg-[#0A0D12]'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider mb-2">
              <span className={activeLens === 'latency' ? 'text-accent-cyan font-semibold' : 'text-neutral-400'}>
                Latency P99
              </span>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: LENS_CONFIGS.latency.accentBg,
                  border: `1px solid ${LENS_CONFIGS.latency.accentBorder}`,
                  color: LENS_CONFIGS.latency.color
                }}
              >
                <Gauge className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="text-2xl sm:text-3xl font-bold text-white flex items-baseline gap-2 font-sans tabular-nums">
              <AnimatedCounter value={LENS_CONFIGS.latency.value} decimals={1} suffix="ms" />
              <span className="text-xs font-normal text-accent-emerald font-mono">
                {LENS_CONFIGS.latency.delta}
              </span>
            </div>

            <div className="text-[11px] font-mono text-neutral-400 mt-1 flex items-center justify-between">
              <span>{LENS_CONFIGS.latency.subLabel}</span>
              <span className="text-[10px] text-accent-cyan/80 font-semibold">{LENS_CONFIGS.latency.badge}</span>
            </div>

            {/* Dynamic Micro Histogram Bars */}
            <div className="h-8 mt-3.5 flex items-end gap-1.5" aria-hidden="true">
              {LENS_CONFIGS.latency.bars.map((h, i) => (
                <div key={i} className="flex-1 bg-white/[0.04] h-full rounded-t flex items-end overflow-hidden">
                  <motion.div
                    className="w-full rounded-t transition-colors"
                    style={{
                      backgroundColor: activeLens === 'latency' ? '#00F0FF' : 'rgba(0, 240, 255, 0.45)'
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.5, delay: i * 0.04, ease: 'easeOut' }}
                  />
                </div>
              ))}
            </div>

            {activeLens === 'latency' && (
              <motion.div
                layoutId="active-lens-indicator"
                className="absolute bottom-0 left-0 right-0 h-1 bg-accent-cyan"
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              />
            )}
          </motion.div>

          {/* Card 2: Throughput */}
          <motion.div
            variants={cardVariants}
            onMouseMove={handleCardMouseMove}
            onClick={() => handleLensSelect('throughput')}
            whileHover={{ y: -3, scale: 1.012 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            className={`spotlight-card rounded-2xl p-5 border cursor-pointer transition-all duration-200 backdrop-blur-xl relative overflow-hidden ${
              activeLens === 'throughput'
                ? 'bg-[#0B0E14] border-sky-400 shadow-[0_0_28px_rgba(56,189,248,0.12)]'
                : 'bg-[#090B0E]/90 border-white/[0.08] hover:border-sky-400/40 hover:bg-[#0A0D12]'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider mb-2">
              <span className={activeLens === 'throughput' ? 'text-sky-400 font-semibold' : 'text-neutral-400'}>
                Ingress Volume
              </span>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: LENS_CONFIGS.throughput.accentBg,
                  border: `1px solid ${LENS_CONFIGS.throughput.accentBorder}`,
                  color: LENS_CONFIGS.throughput.color
                }}
              >
                <Activity className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="text-2xl sm:text-3xl font-bold text-white flex items-baseline gap-2 font-sans tabular-nums">
              <AnimatedCounter value={LENS_CONFIGS.throughput.value} decimals={1} suffix="M" />
              <span className="text-xs font-normal text-accent-emerald font-mono">
                {LENS_CONFIGS.throughput.delta}
              </span>
            </div>

            <div className="text-[11px] font-mono text-neutral-400 mt-1 flex items-center justify-between">
              <span>{LENS_CONFIGS.throughput.subLabel}</span>
              <span className="text-[10px] text-sky-400/80 font-semibold">{LENS_CONFIGS.throughput.badge}</span>
            </div>

            {/* Dynamic Micro Histogram Bars */}
            <div className="h-8 mt-3.5 flex items-end gap-1.5" aria-hidden="true">
              {LENS_CONFIGS.throughput.bars.map((h, i) => (
                <div key={i} className="flex-1 bg-white/[0.04] h-full rounded-t flex items-end overflow-hidden">
                  <motion.div
                    className="w-full rounded-t transition-colors"
                    style={{
                      backgroundColor: activeLens === 'throughput' ? '#38BDF8' : 'rgba(56, 189, 248, 0.45)'
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.5, delay: i * 0.04, ease: 'easeOut' }}
                  />
                </div>
              ))}
            </div>

            {activeLens === 'throughput' && (
              <motion.div
                layoutId="active-lens-indicator"
                className="absolute bottom-0 left-0 right-0 h-1 bg-sky-400"
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              />
            )}
          </motion.div>

          {/* Card 3: Error Budget */}
          <motion.div
            variants={cardVariants}
            onMouseMove={handleCardMouseMove}
            onClick={() => handleLensSelect('budget')}
            whileHover={{ y: -3, scale: 1.012 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            className={`spotlight-card rounded-2xl p-5 border cursor-pointer transition-all duration-200 backdrop-blur-xl relative overflow-hidden ${
              activeLens === 'budget'
                ? 'bg-[#0B0E14] border-accent-emerald shadow-[0_0_28px_rgba(16,185,129,0.12)]'
                : 'bg-[#090B0E]/90 border-white/[0.08] hover:border-accent-emerald/40 hover:bg-[#0A0D12]'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider mb-2">
              <span className={activeLens === 'budget' ? 'text-accent-emerald font-semibold' : 'text-neutral-400'}>
                Error Budget &amp; SLA
              </span>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: LENS_CONFIGS.budget.accentBg,
                  border: `1px solid ${LENS_CONFIGS.budget.accentBorder}`,
                  color: LENS_CONFIGS.budget.color
                }}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="text-2xl sm:text-3xl font-bold text-accent-emerald flex items-baseline gap-2 font-sans tabular-nums">
              <AnimatedCounter value={LENS_CONFIGS.budget.value} decimals={3} suffix="%" />
              <span className="text-xs font-normal text-white/80 font-mono">
                {LENS_CONFIGS.budget.delta}
              </span>
            </div>

            <div className="text-[11px] font-mono text-neutral-400 mt-1 flex items-center justify-between">
              <span>{LENS_CONFIGS.budget.subLabel}</span>
              <span className="text-[10px] text-accent-emerald/80 font-semibold">{LENS_CONFIGS.budget.badge}</span>
            </div>

            {/* Dynamic Micro Histogram Bars */}
            <div className="h-8 mt-3.5 flex items-end gap-1.5" aria-hidden="true">
              {LENS_CONFIGS.budget.bars.map((h, i) => (
                <div key={i} className="flex-1 bg-white/[0.04] h-full rounded-t flex items-end overflow-hidden">
                  <motion.div
                    className="w-full rounded-t transition-colors"
                    style={{
                      backgroundColor: activeLens === 'budget' ? '#10B981' : 'rgba(16, 185, 129, 0.45)'
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.5, delay: i * 0.04, ease: 'easeOut' }}
                  />
                </div>
              ))}
            </div>

            {activeLens === 'budget' && (
              <motion.div
                layoutId="active-lens-indicator"
                className="absolute bottom-0 left-0 right-0 h-1 bg-accent-emerald"
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              />
            )}
          </motion.div>

          {/* Card 4: Kernel eBPF */}
          <motion.div
            variants={cardVariants}
            onMouseMove={handleCardMouseMove}
            onClick={() => handleLensSelect('ebpf')}
            whileHover={{ y: -3, scale: 1.012 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            className={`spotlight-card rounded-2xl p-5 border cursor-pointer transition-all duration-200 backdrop-blur-xl relative overflow-hidden ${
              activeLens === 'ebpf'
                ? 'bg-[#0B0E14] border-accent-purple shadow-[0_0_28px_rgba(168,85,247,0.12)]'
                : 'bg-[#090B0E]/90 border-white/[0.08] hover:border-accent-purple/40 hover:bg-[#0A0D12]'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider mb-2">
              <span className={activeLens === 'ebpf' ? 'text-accent-purple font-semibold' : 'text-neutral-400'}>
                eBPF Kernel Load
              </span>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: LENS_CONFIGS.ebpf.accentBg,
                  border: `1px solid ${LENS_CONFIGS.ebpf.accentBorder}`,
                  color: LENS_CONFIGS.ebpf.color
                }}
              >
                <Cpu className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="text-2xl sm:text-3xl font-bold text-white flex items-baseline gap-2 font-sans tabular-nums">
              <AnimatedCounter value={LENS_CONFIGS.ebpf.value} decimals={2} suffix="%" />
              <span className="text-xs font-normal text-accent-purple font-mono">
                {LENS_CONFIGS.ebpf.delta}
              </span>
            </div>

            <div className="text-[11px] font-mono text-neutral-400 mt-1 flex items-center justify-between">
              <span>{LENS_CONFIGS.ebpf.subLabel}</span>
              <span className="text-[10px] text-accent-purple/80 font-semibold">{LENS_CONFIGS.ebpf.badge}</span>
            </div>

            {/* Dynamic Micro Histogram Bars */}
            <div className="h-8 mt-3.5 flex items-end gap-1.5" aria-hidden="true">
              {LENS_CONFIGS.ebpf.bars.map((h, i) => (
                <div key={i} className="flex-1 bg-white/[0.04] h-full rounded-t flex items-end overflow-hidden">
                  <motion.div
                    className="w-full rounded-t transition-colors"
                    style={{
                      backgroundColor: activeLens === 'ebpf' ? '#A855F7' : 'rgba(168, 85, 247, 0.45)'
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.5, delay: i * 0.04, ease: 'easeOut' }}
                  />
                </div>
              ))}
            </div>

            {activeLens === 'ebpf' && (
              <motion.div
                layoutId="active-lens-indicator"
                className="absolute bottom-0 left-0 right-0 h-1 bg-accent-purple"
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              />
            )}
          </motion.div>
        </motion.div>

        {/* Large Interactive SVG Telemetry Canvas */}
        <motion.div
          onMouseMove={handleCardMouseMove}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -40px 0px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="spotlight-card rounded-2xl bg-[#090B0E]/95 border border-white/[0.1] p-5 sm:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.85)] relative overflow-hidden backdrop-blur-2xl mb-8"
        >
          {/* Tech Grid Underlay */}
          <div className="absolute inset-0 bg-tech-grid opacity-15 pointer-events-none" />

          {/* Chart Header Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10 pb-4 border-b border-white/[0.06]">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: currentLens.color }} />
                <h3 className="text-base sm:text-lg font-semibold text-white font-sans flex items-center gap-2">
                  <span>{currentLens.label} Waveform Analysis</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-neutral-300 font-normal">
                    {activeRange} window
                  </span>
                </h3>
              </div>
              <p className="text-xs font-mono text-neutral-400 mt-0.5">
                Hardware-accelerated eBPF telemetry with p50 baseline and autonomous event correlates
              </p>
            </div>

            {/* Quick Actions & Legend */}
            <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-0.5 rounded-full" style={{ backgroundColor: currentLens.color }} />
                <span className="text-neutral-300">Live Curve</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-0.5 rounded-full bg-neutral-600 stroke-dashed" />
                <span>P50 Baseline</span>
              </div>
              {currentLens.incidentPoint && (
                <div
                  onClick={() => setShowIncidentModal(true)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald cursor-pointer hover:bg-accent-emerald/20 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-ping" />
                  <span>Autonomous Event Pin</span>
                </div>
              )}
            </div>
          </div>

          {/* SVG Waveform Chart with Interactive Laser Scrubber */}
          <div
            className="w-full h-56 sm:h-72 relative cursor-crosshair overflow-hidden select-none"
            onMouseMove={handleChartMouseMove}
            onMouseLeave={handleChartMouseLeave}
          >
            {/* SVG Canvas with absolute pointer-events-none so it doesn't swallow events */}
            <svg viewBox="0 0 1000 240" preserveAspectRatio="none" className="w-full h-full pointer-events-none">
              <defs>
                <linearGradient id={`gradient-${activeLens}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={currentLens.color} stopOpacity="0.28" />
                  <stop offset="50%" stopColor={currentLens.color} stopOpacity="0.08" />
                  <stop offset="100%" stopColor={currentLens.color} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines */}
              <line x1="0" y1="60" x2="1000" y2="60" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="1000" y2="120" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="180" x2="1000" y2="180" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />

              {/* Shaded Area Fill */}
              <motion.path
                key={`area-${activeLens}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                d={currentLens.areaD}
                fill={`url(#gradient-${activeLens})`}
              />

              {/* P50 Baseline Dashed Guide */}
              <motion.path
                key={`base-${activeLens}`}
                d={currentLens.baselineD}
                fill="none"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* Main Waveform Stroke with Animated Draw-in */}
              <motion.path
                ref={pathRef}
                key={`path-${activeLens}`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                d={currentLens.pathD}
                fill="none"
                stroke={currentLens.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{
                  filter: `drop-shadow(0 0 8px ${currentLens.color}66)`
                }}
              />

              {/* Incident Autonomous Remediation Pin */}
              {currentLens.incidentPoint && (
                <g className="cursor-pointer pointer-events-auto" onClick={() => setShowIncidentModal(true)}>
                  <circle
                    cx={currentLens.incidentPoint.x}
                    cy={currentLens.incidentPoint.y}
                    r="12"
                    fill="#10B981"
                    opacity="0.2"
                    className="animate-ping"
                  />
                  <circle
                    cx={currentLens.incidentPoint.x}
                    cy={currentLens.incidentPoint.y}
                    r="5.5"
                    fill="#10B981"
                    stroke="#070809"
                    strokeWidth="2"
                  />
                  <line
                    x1={currentLens.incidentPoint.x}
                    y1="0"
                    x2={currentLens.incidentPoint.x}
                    y2="240"
                    stroke="#10B981"
                    strokeDasharray="3 3"
                    strokeWidth="1.2"
                    opacity="0.5"
                  />
                </g>
              )}

              {/* Dynamic Laser Scrubber Guide & Gliding Dot along curve */}
              <g className="transition-opacity duration-200">
                {/* Vertical Laser Guide Line */}
                <line
                  x1={scrubber.x}
                  y1="0"
                  x2={scrubber.x}
                  y2="240"
                  stroke={currentLens.color}
                  strokeDasharray="2 2"
                  strokeWidth="1.5"
                  opacity={scrubber.isHovering ? 0.85 : 0.4}
                />

                {/* Glowing Aura Ring on curve */}
                <circle
                  cx={scrubber.x}
                  cy={scrubber.y}
                  r="12"
                  fill={currentLens.color}
                  opacity={scrubber.isHovering ? 0.35 : 0.2}
                  className={scrubber.isHovering ? '' : 'animate-ping'}
                />

                {/* Precision center dot exactly locked onto the line */}
                <circle
                  cx={scrubber.x}
                  cy={scrubber.y}
                  r="5"
                  fill={currentLens.color}
                  stroke="#070809"
                  strokeWidth="2.5"
                  style={{
                    filter: `drop-shadow(0 0 8px ${currentLens.color})`
                  }}
                />
              </g>
            </svg>

            {/* Dynamic Precision Floating Telemetry HUD */}
            {scrubber.isHovering ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.1 }}
                className="absolute top-2 pointer-events-none bg-[#0B0D12]/95 border px-3.5 py-2 rounded-xl text-xs font-mono shadow-[0_12px_32px_rgba(0,0,0,0.85)] z-20 backdrop-blur-xl select-none"
                style={{
                  borderColor: `${currentLens.color}66`,
                  left: `${Math.min(84, Math.max(16, scrubber.pct * 100))}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="flex items-center gap-2 font-semibold" style={{ color: currentLens.color }}>
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: currentLens.color }} />
                  <span className="tabular-nums">
                    {currentLens.label}: {(currentLens.value * (0.88 + ((240 - scrubber.y) / 240) * 0.24)).toFixed(currentLens.decimals)} {currentLens.unit}
                  </span>
                </div>
                <div className="text-neutral-400 text-[11px] mt-0.5 flex items-center justify-between gap-4 tabular-nums">
                  <span>Timestamp: -{Math.round((1 - scrubber.pct) * 60)}m {Math.round(((1 - scrubber.pct) * 3600) % 60)}s</span>
                  <span className="text-accent-emerald">Status: Nominal</span>
                </div>
              </motion.div>
            ) : (
              currentLens.incidentPoint && (
                <div className="absolute top-3 left-[70%] -translate-x-1/2 bg-[#0B0D12]/95 border border-accent-emerald/40 px-3.5 py-1.5 rounded-xl text-xs font-mono shadow-xl pointer-events-none hidden sm:flex items-center gap-2 backdrop-blur-xl">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-emerald opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-emerald" />
                  </span>
                  <span className="text-accent-emerald font-semibold">{currentLens.incidentPoint.title}:</span>
                  <span className="text-neutral-300">{currentLens.incidentPoint.desc}</span>
                </div>
              )
            )}
          </div>

          {/* Bottom Timeline Axis */}
          <div className="mt-4 flex items-center justify-between text-xs font-mono text-neutral-400 border-t border-white/[0.06] pt-3">
            <span>-60m 00s</span>
            <span>-45m 00s</span>
            <span>-30m 00s</span>
            <span>-15m 00s</span>
            <span className="flex items-center gap-1.5 text-white font-semibold">
              <span className="w-2 h-2 rounded-full bg-accent-emerald shadow-[0_0_8px_#10B981] animate-pulse" />
              <span>T-0 (Live {pulseCount % 2 === 0 ? '●' : '○'})</span>
            </span>
          </div>
        </motion.div>

        {/* Distributed Trace Waterfall & Edge Zone Matrix (Two-Column Deck) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Left Column (2 Cols): Live Distributed Trace Inspector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-2 rounded-2xl bg-[#090B0E]/95 border border-white/[0.08] p-5 sm:p-6 backdrop-blur-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-accent-cyan" />
                  <h4 className="text-sm font-semibold text-white font-sans">
                    Nanosecond Distributed Trace Waterfall
                  </h4>
                </div>
                
                {/* Trace selector tabs */}
                <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-lg border border-white/[0.06] text-xs font-mono">
                  {SAMPLE_TRACES.map((trace) => (
                    <button
                      key={trace.id}
                      type="button"
                      onClick={() => {
                        setSelectedTraceId(trace.id);
                        setActiveSpanIndex(0);
                      }}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        selectedTraceId === trace.id
                          ? 'bg-accent-cyan/15 text-accent-cyan font-semibold border border-accent-cyan/30'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {trace.endpoint.split(' ')[0]} {trace.endpoint.split(' ')[1]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trace Meta Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-neutral-400 mb-4 bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-accent-emerald/15 border border-accent-emerald/30 text-accent-emerald font-semibold">
                    HTTP {activeTrace.statusCode}
                  </span>
                  <span className="text-white font-semibold">{activeTrace.endpoint}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-neutral-300">
                    <Clock className="w-3.5 h-3.5 text-accent-cyan" />
                    <span>Total Duration: <strong className="text-white tabular-nums">{activeTrace.totalDurationMs}ms</strong></span>
                  </span>
                  <span className="text-neutral-500">ID: {activeTrace.id}</span>
                </div>
              </div>

              {/* Waterfall Spans */}
              <div className="space-y-2.5 font-mono text-xs">
                {activeTrace.spans.map((span, idx) => {
                  const isSelected = activeSpanIndex === idx;
                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setActiveSpanIndex(idx)}
                      onClick={() => setActiveSpanIndex(idx)}
                      className={`group p-2.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-white/[0.06] border-white/20 shadow-sm'
                          : 'bg-white/[0.02] hover:bg-white/[0.04] border-transparent hover:border-white/[0.08]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full transition-transform group-hover:scale-125"
                            style={{ backgroundColor: span.color }}
                          />
                          <span className={`font-semibold ${isSelected ? 'text-white' : 'text-neutral-300'}`}>
                            {span.service}
                          </span>
                          <span className="text-neutral-400 text-[10px]">({span.operation})</span>
                        </div>
                        <span className="text-neutral-300 font-semibold tabular-nums">{span.durationMs}ms</span>
                      </div>

                      {/* Gantt Bar Background & Fill */}
                      <div className="h-2 w-full bg-white/[0.04] rounded-full relative overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${span.widthPct}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.05 }}
                          className="h-full rounded-full transition-all group-hover:brightness-125"
                          style={{
                            marginLeft: `${span.offsetPct}%`,
                            backgroundColor: span.color,
                            boxShadow: isSelected ? `0 0 12px ${span.color}` : `0 0 6px ${span.color}55`
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Permanent Zero-Shift Span Telemetry Dock (Prevents scrolling glitch & layout shifts) */}
            <div className="mt-4 pt-3 border-t border-white/[0.06]">
              <div className="h-11 rounded-xl bg-[#0B0D12] border border-white/[0.08] px-3.5 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-neutral-300 truncate pr-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-emerald shrink-0" />
                  <span className="truncate">
                    Service <strong className="text-white font-semibold">{currentActiveSpan.service}</strong> completed in <strong className="text-white tabular-nums">{currentActiveSpan.durationMs}ms</strong> with zero context switch overhead.
                  </span>
                </div>
                
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`${selectedTraceId}-${activeSpanIndex}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.12 }}
                    className="text-[10px] px-2.5 py-0.5 rounded-full bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30 font-semibold shrink-0"
                  >
                    {currentActiveSpan.status}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Right Column (1 Col): Global Edge Cluster Health Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl bg-[#090B0E]/95 border border-white/[0.08] p-5 sm:p-6 backdrop-blur-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-accent-cyan" />
                  <h4 className="text-sm font-semibold text-white font-sans">
                    Edge PoP Fleet Health
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-accent-emerald font-semibold px-2 py-0.5 rounded bg-accent-emerald/10 border border-accent-emerald/20">
                  ALL 14 HEALTHY
                </span>
              </div>

              <p className="text-xs font-mono text-neutral-400 mb-3.5">
                BGP Anycast routing with real-time health probing and automated regional failover.
              </p>

              {/* Edge Zone Rows */}
              <div className="space-y-2 font-mono text-xs">
                {EDGE_ZONES.map((zone) => (
                  <div
                    key={zone.code}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-accent-cyan/30 hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald shadow-[0_0_6px_#10B981] animate-pulse" />
                      <span className="text-white font-semibold">{zone.code}</span>
                      <span className="text-[10px] text-neutral-500">({zone.region})</span>
                    </div>
                    <div className="flex items-center gap-3 tabular-nums">
                      <span className="text-accent-cyan">{zone.ping}</span>
                      <span className="text-[10px] text-neutral-400">±{zone.jitter}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Autonomous SLA Badge */}
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
              <span className="text-neutral-400">SLA Guarantee</span>
              <span className="text-accent-emerald font-semibold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-accent-emerald" />
                <span>99.999% Autonomous SLA</span>
              </span>
            </div>
          </motion.div>
        </div>

        {/* Bottom Feature Capabilities Showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/[0.06]">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div className="flex items-center gap-2 text-xs font-mono text-accent-cyan mb-1.5 font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Zero Sidecar Footprint</span>
            </div>
            <p className="text-xs font-mono text-neutral-400 leading-relaxed">
              Eliminate memory-hungry tracing agents. Our eBPF probes inspect kernel socket buffers directly with &lt; 0.08% CPU tax.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div className="flex items-center gap-2 text-xs font-mono text-accent-emerald mb-1.5 font-semibold">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Autonomous Incident Pinning</span>
            </div>
            <p className="text-xs font-mono text-neutral-400 leading-relaxed">
              Instant correlation between metric deviations and orchestrator events. Automatic isolate recycling resolves 98% of memory leaks.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div className="flex items-center gap-2 text-xs font-mono text-accent-purple mb-1.5 font-semibold">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>High-Density Sampling</span>
            </div>
            <p className="text-xs font-mono text-neutral-400 leading-relaxed">
              100% trace capture on anomalies while intelligently downsampling steady-state p50 requests to keep storage costs negligible.
            </p>
          </div>
        </div>

      </div>

      {/* Autonomous Remediation Inspection Modal */}
      <AnimatePresence>
        {showIncidentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setShowIncidentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-[#0B0D12] border border-accent-emerald/40 p-6 shadow-[0_24px_80px_rgba(16,185,129,0.15)] font-mono"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
                <div className="flex items-center gap-2 text-accent-emerald">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-semibold">Autonomous Remediation Event Log</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIncidentModal(false)}
                  className="text-neutral-400 hover:text-white text-xs px-2 py-1 rounded bg-white/[0.05] cursor-pointer"
                >
                  ESC / Close
                </button>
              </div>

              <div className="space-y-3 text-xs text-neutral-300">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="text-[11px] text-neutral-400 mb-1">Trigger Event:</div>
                  <div className="text-white font-semibold">P99 Latency exceeded 45ms threshold in region us-east-1</div>
                  <div className="text-neutral-500 text-[10px] mt-0.5">Correlation: Firecracker isolate memory leak in pod-49fa</div>
                </div>

                <div className="p-3 rounded-xl bg-accent-emerald/5 border border-accent-emerald/20 text-accent-emerald">
                  <div className="text-[11px] font-semibold mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Autonomous Action Taken (3.8s MTTR):</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-neutral-200">
                    <li>Drained ingress traffic on us-east-1 pod via BGP Anycast withdrawal (0 dropped requests)</li>
                    <li>Hot-swapped standby isolate in 620ms</li>
                    <li>Restored nominal 11.4ms P99 latency globally</li>
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-2 text-[11px] text-neutral-400">
                  <span>Humans in loop: <strong>0</strong></span>
                  <span className="text-accent-cyan flex items-center gap-1">
                    <span>Export Post-Mortem</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
