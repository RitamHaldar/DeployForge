import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  GitCommit,
  Cpu,
  Package,
  Rocket,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Check
} from 'lucide-react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
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

interface StageDetail {
  num: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  rows: { label: string; val: string; color: string }[];
  command: string;
  output: string[];
}

const STAGES: StageDetail[] = [
  {
    num: '01',
    title: 'Git Push',
    subtitle: 'Webhook verification',
    badge: 'VERIFIED',
    badgeColor: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/25',
    icon: GitCommit,
    accentColor: '#00F0FF',
    rows: [
      { label: 'commit', val: '8f72a1c', color: 'text-white' },
      { label: 'author', val: '@alex', color: 'text-neutral-400' },
      { label: 'branch', val: 'main', color: 'text-accent-emerald' }
    ],
    command: 'git push origin main',
    output: [
      '→ Webhook received at edge gateway (0.8ms)',
      '→ Signature validated via GitHub HMAC SHA-256',
      '→ Ephemeral runner provisioned: runner-us-east-98'
    ]
  },
  {
    num: '02',
    title: 'Build',
    subtitle: 'Turbopack compilation',
    badge: 'OPTIMAL',
    badgeColor: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/25',
    icon: Cpu,
    accentColor: '#00F0FF',
    rows: [
      { label: 'duration', val: '28.4s', color: 'text-white' },
      { label: 'cache hit', val: '96.2%', color: 'text-neutral-400' },
      { label: 'status', val: 'exit code 0', color: 'text-accent-emerald' }
    ],
    command: 'forge build --turbopack --reproducible',
    output: [
      '→ Remote cache warm: 42/44 chunks re-used',
      '→ Incremental tree-shaking completed in 1.4s',
      '→ Static bundle minified & verified: zero leaks'
    ]
  },
  {
    num: '03',
    title: 'Container',
    subtitle: 'OCI distroless image',
    badge: 'SIGNED',
    badgeColor: 'text-accent-blue bg-accent-blue/10 border-accent-blue/25',
    icon: Package,
    accentColor: '#0EA5E9',
    rows: [
      { label: 'size', val: '38.4 MB', color: 'text-white' },
      { label: 'cves', val: '0 found', color: 'text-neutral-400' },
      { label: 'security', val: 'Cosign v2', color: 'text-accent-emerald' }
    ],
    command: 'cosign verify --key=kms://forge/signing-key',
    output: [
      '→ Distroless base layer mounted: gcr.io/distroless/static',
      '→ Trivy security audit: 0 critical, 0 high, 0 medium',
      '→ Cryptographically signed with Sigstore Cosign'
    ]
  },
  {
    num: '04',
    title: 'Deploy',
    subtitle: 'Canary rolling traffic',
    badge: 'ROUTED',
    badgeColor: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/25',
    icon: Rocket,
    accentColor: '#00F0FF',
    rows: [
      { label: 'deploy-id', val: 'dep_982b14', color: 'text-white' },
      { label: 'traffic', val: '10% → 100%', color: 'text-neutral-400' },
      { label: 'routing', val: 'eBPF mesh', color: 'text-accent-emerald' }
    ],
    command: 'ebpf-mesh route --canary=10% --step=20%/m',
    output: [
      '→ eBPF filter dynamically programmed in Linux kernel',
      '→ Canary fleet handling 10% live user traffic',
      '→ Error budget: 0.0000% error rate observed'
    ]
  },
  {
    num: '05',
    title: 'Health Check',
    subtitle: 'Synthetic assertions',
    badge: 'PASSED',
    badgeColor: 'text-accent-emerald bg-accent-emerald/10 border-accent-emerald/25',
    icon: Activity,
    accentColor: '#10B981',
    rows: [
      { label: 'probe', val: 'HTTP 200 OK', color: 'text-white' },
      { label: 'p99 latency', val: '6.8ms', color: 'text-neutral-400' },
      { label: 'consensus', val: '32/32 nodes', color: 'text-accent-emerald' }
    ],
    command: 'forge synthetic-probe --consensus=100%',
    output: [
      '→ 32 global edge nodes executed synthetic health probes',
      '→ P99 response time: 6.8ms · TLS handshake: 3.2ms',
      '→ Zero packet anomalies detected across all probes'
    ]
  },
  {
    num: '06',
    title: 'Live',
    subtitle: 'Global edge promotion',
    badge: 'ACTIVE 100%',
    badgeColor: 'text-accent-emerald bg-accent-emerald/15 border-accent-emerald/40',
    icon: ShieldCheck,
    accentColor: '#10B981',
    rows: [
      { label: 'security', val: 'TLS 1.3 Certified', color: 'text-white' },
      { label: 'availability', val: '99.999% SLA', color: 'text-neutral-400' },
      { label: 'watchdog', val: 'Armed & Active', color: 'text-accent-emerald' }
    ],
    command: 'forge promote --global --lock-state=stable',
    output: [
      '→ Anycast BGP routes promoted across 34 global PoPs',
      '→ Autonomous self-healing watchdogs armed on fleet',
      '→ Release 8f72a1c is now LIVE with zero downtime'
    ]
  }
];

export function DeploymentLifecycleSection() {
  const [selectedStageIndex, setSelectedStageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-advance through stages when auto-play is enabled
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setSelectedStageIndex((prev) => (prev + 1) % STAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  const activeStage = STAGES[selectedStageIndex];
  const ActiveIcon = activeStage.icon;

  return (
    <section id="pipeline" className="py-24 sm:py-28 border-t border-white/[0.08] relative z-10 bg-[#070809]">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-accent-cyan/[0.02] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -40px 0px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-accent-cyan mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
              <span>CONTINUOUS DEPLOYMENT PIPELINE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3 font-sans">
              From git push to verified global edge.
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 font-mono">
              Every commit triggers continuous isolation, reproducible layer caching, and automated sanity assertions.
            </p>
          </motion.div>

          {/* Interactive Simulation Stepper Controls */}
          <div className="flex items-center gap-2 self-start md:self-auto font-mono text-xs">
            <button
              type="button"
              onClick={() => setIsPlaying(prev => !prev)}
              className="px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-neutral-300 hover:text-white transition-colors flex items-center gap-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan"
              title={isPlaying ? 'Pause auto progression' : 'Resume auto progression'}
            >
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-accent-emerald animate-pulse' : 'bg-neutral-500'}`} />
              <span>{isPlaying ? 'Live Auto-Cycle' : 'Cycle Paused'}</span>
            </button>
          </div>
        </div>

        {/* Global Progress Bar Connecting All 6 Stages */}
        <div className="relative mb-6 hidden md:block">
          <div className="h-[2px] w-full bg-white/[0.06] rounded-full overflow-hidden relative">
            <motion.div
              className="h-full bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-emerald rounded-full relative"
              animate={{ width: `${((selectedStageIndex + 1) / STAGES.length) * 100}%` }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
          </div>
        </div>

        {/* Pipeline 6 Stages Cards Grid with Interactive Selection */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px 0px -30px 0px" }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5 font-mono text-xs mb-8"
        >
          {STAGES.map((stage, idx) => {
            const isSelected = selectedStageIndex === idx;
            const Icon = stage.icon;

            return (
              <motion.div
                key={stage.num}
                variants={itemVariants}
                onMouseMove={handleMouseMove}
                onClick={() => {
                  setSelectedStageIndex(idx);
                  setIsPlaying(false);
                }}
                whileHover={{ y: -3, scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                className={`spotlight-card relative rounded-2xl p-4 border flex flex-col justify-between transition-all duration-200 cursor-pointer select-none ${
                  isSelected
                    ? 'bg-[#101318] border-accent-cyan/60 shadow-[0_0_28px_rgba(0,240,255,0.15)] ring-1 ring-accent-cyan/30'
                    : 'bg-[#0B0D10]/90 border-white/[0.08] hover:border-white/20 hover:bg-[#101216]'
                }`}
              >
                {/* Active Indicator Top Glow Bar */}
                {isSelected && (
                  <motion.div
                    layoutId="active-stage-bar"
                    className="absolute -top-[1px] left-4 right-4 h-[2px] bg-accent-cyan shadow-[0_0_8px_#00F0FF]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}

                <div>
                  {/* Top Header: Num, Icon & Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-accent-cyan/15 text-accent-cyan'
                            : 'bg-white/[0.04] text-neutral-400'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-mono text-xs text-neutral-500 font-bold">
                        {stage.num}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-md border font-semibold ${stage.badgeColor}`}
                    >
                      {stage.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3
                    className={`font-semibold text-sm font-sans tracking-tight mb-0.5 transition-colors ${
                      isSelected ? 'text-white' : 'text-neutral-200'
                    }`}
                  >
                    {stage.title}
                  </h3>
                  <p className="text-neutral-400 text-[10px] mb-3 truncate">
                    {stage.subtitle}
                  </p>
                </div>

                {/* Micro Details Data Rows */}
                <div className="space-y-1 pt-2.5 border-t border-white/[0.06] text-[10px]">
                  {stage.rows.map((row, rIdx) => (
                    <div key={rIdx} className="flex justify-between items-center truncate">
                      <span className="text-neutral-500">{row.label}:</span>
                      <span className={`font-mono ${row.color}`}>{row.val}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Interactive Live Inspection Console for the Active Stage */}
        <motion.div
          layout
          className="relative rounded-2xl bg-[#090B0E]/95 border border-white/[0.1] p-4 sm:p-5 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          {/* Subtle Grid Pattern in Console */}
          <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none" />

          {/* Console Header Bar */}
          <div className="relative z-10 flex flex-wrap items-center justify-between pb-3 border-b border-white/[0.08] gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-rose/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-accent-amber/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-accent-emerald/80" />
              </div>
              <span className="text-neutral-600 font-mono text-xs">|</span>
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                <ActiveIcon className="w-3.5 h-3.5 text-accent-cyan" />
                <span className="font-semibold text-white">Stage {activeStage.num} Inspection:</span>
                <span className="text-accent-cyan">{activeStage.title}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-neutral-500" />
                <span>Deterministic Execution</span>
              </div>
              <span className="text-neutral-700 hidden sm:inline">·</span>
              <div className="hidden sm:flex items-center gap-1.5 text-accent-emerald">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Clean</span>
              </div>
            </div>
          </div>

          {/* Terminal Content with AnimatePresence */}
          <div className="relative z-10 pt-4 font-mono text-xs">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStage.num}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-3"
              >
                {/* Command Prompt */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-neutral-200">
                  <span className="text-accent-cyan font-bold select-none">$</span>
                  <span className="font-medium text-white">{activeStage.command}</span>
                </div>

                {/* Output Stream */}
                <div className="space-y-1.5 pl-2 text-neutral-400 text-[11px]">
                  {activeStage.output.map((line, lIdx) => (
                    <div key={lIdx} className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-accent-emerald shrink-0" />
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
