import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  GitBranch,
  Cpu,
  Box,
  Send,
  HeartPulse,
  Globe,
  ShieldCheck,
  Play,
  Pause
} from 'lucide-react';

function GithubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
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

interface StepDetail {
  id: string;
  stepNumber: string;
  badge: string;
  title: string;
  meta: string;
  metaColor: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  isLive?: boolean;
  inspectData: {
    protocol: string;
    detail: string;
    subtext: string;
    timing: string;
    metric: string;
    securitySeal: string;
  };
}

const PIPELINE_STEPS: StepDetail[] = [
  {
    id: 'git-push',
    stepNumber: '01',
    badge: 'Ingress Source',
    title: 'Git Push',
    meta: 'commit #8f72a1c',
    metaColor: 'text-neutral-400',
    icon: GithubIcon,
    accentColor: '#00F0FF',
    accentBg: 'rgba(0, 240, 255, 0.1)',
    accentBorder: 'rgba(0, 240, 255, 0.25)',
    inspectData: {
      protocol: 'Ed25519 Webhook',
      detail: 'SHA256 signature verified via Ed25519 webhook handshake',
      subtext: 'Branch: main • Author: @alex • 4 files committed',
      timing: '120ms',
      metric: 'Zero-Trust Authenticated',
      securitySeal: 'GPG Key #4F92 Verified'
    }
  },
  {
    id: 'build',
    stepNumber: '02',
    badge: 'Parallel Compiler',
    title: 'Incremental Build',
    meta: 'Cached 1.4s',
    metaColor: 'text-accent-cyan',
    icon: Cpu,
    accentColor: '#38BDF8',
    accentBg: 'rgba(56, 189, 248, 0.1)',
    accentBorder: 'rgba(56, 189, 248, 0.25)',
    inspectData: {
      protocol: 'Turbopack Remote Cache',
      detail: 'Layer cache hit ratio 94.2% across 8 parallel Rust build workers',
      subtext: 'Next.js 15 SSR bundle • Size: 42.1MB distroless payload',
      timing: '1.4s',
      metric: '94% Cache Hit Rate',
      securitySeal: 'Hermetic Sandbox Execution'
    }
  },
  {
    id: 'container',
    stepNumber: '03',
    badge: 'Sealed Artifact',
    title: 'MicroVM Rootfs',
    meta: 'sha256:49c8...',
    metaColor: 'text-neutral-400',
    icon: Box,
    accentColor: '#A855F7',
    accentBg: 'rgba(168, 85, 247, 0.1)',
    accentBorder: 'rgba(168, 85, 247, 0.25)',
    inspectData: {
      protocol: 'Cosign ECDSA Sealed',
      detail: 'Deterministic microVM rootfs frozen & cryptographically signed',
      subtext: 'Cosign envelope • 0 vulnerabilities • Distroless Alpine kernel',
      timing: '0.8s',
      metric: 'Signed by Sigstore Cosign',
      securitySeal: 'SLSA Level 3 Certified'
    }
  },
  {
    id: 'deploy',
    stepNumber: '04',
    badge: 'eBPF Routing',
    title: 'Mesh Dispatch',
    meta: 'Kernel atomic swap',
    metaColor: 'text-neutral-400',
    icon: Send,
    accentColor: '#00F0FF',
    accentBg: 'rgba(0, 240, 255, 0.1)',
    accentBorder: 'rgba(0, 240, 255, 0.25)',
    inspectData: {
      protocol: 'BGP Anycast Socket Switch',
      detail: 'Atomic pointer swap executed directly in eBPF L4 socket table',
      subtext: 'Zero TCP resets • 100% keep-alive connections preserved intact',
      timing: '0.4s',
      metric: 'eBPF Zero-Drop Route',
      securitySeal: 'BGP Path Validation OK'
    }
  },
  {
    id: 'health-check',
    stepNumber: '05',
    badge: 'Synthetic Sentinel',
    title: 'Health Check',
    meta: '200 OK /healthz',
    metaColor: 'text-accent-emerald',
    icon: HeartPulse,
    accentColor: '#10B981',
    accentBg: 'rgba(16, 185, 129, 0.1)',
    accentBorder: 'rgba(16, 185, 129, 0.25)',
    inspectData: {
      protocol: 'Multi-Region HTTP/2 Probes',
      detail: 'Synthetic health probes asserted across 24 edge consensus nodes',
      subtext: 'HTTP /healthz 200 OK • TLS certificate valid • Edge p99: 7.8ms',
      timing: '280ms',
      metric: '24/24 Edge Nodes Passing',
      securitySeal: 'TLS 1.3 Mutual Auth Verified'
    }
  },
  {
    id: 'production',
    stepNumber: '06',
    badge: 'Live Ingress',
    title: 'Global Edge',
    meta: '100% Anycast Traffic',
    metaColor: 'text-white/90',
    icon: Globe,
    accentColor: '#10B981',
    accentBg: 'rgba(16, 185, 129, 0.12)',
    accentBorder: 'rgba(16, 185, 129, 0.3)',
    isLive: true,
    inspectData: {
      protocol: 'Global Anycast BGP Fabric',
      detail: 'Global Anycast DNS serving 100% customer ingress traffic live',
      subtext: 'Autonomous watchdog monitoring CPU, heap, and socket errors',
      timing: 'Ongoing',
      metric: '99.999% SLA Guaranteed',
      securitySeal: 'Autonomous Failover Armed'
    }
  }
];

export function PipelineVisualization() {
  const [selectedStepId, setSelectedStepId] = useState<string>('production');
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  const selectedIndex = PIPELINE_STEPS.findIndex((s) => s.id === selectedStepId);
  const selectedStep = PIPELINE_STEPS[selectedIndex >= 0 ? selectedIndex : 5];

  // Auto-play through stages smoothly
  const handleNextStep = useCallback(() => {
    setSelectedStepId((prev) => {
      const idx = PIPELINE_STEPS.findIndex((s) => s.id === prev);
      const nextIdx = (idx + 1) % PIPELINE_STEPS.length;
      return PIPELINE_STEPS[nextIdx].id;
    });
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = window.setInterval(handleNextStep, 2800);
    return () => window.clearInterval(timer);
  }, [isAutoPlaying, handleNextStep]);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <div className="w-full relative">
      {/* Top Telemetry Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/[0.08] mb-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <div className="h-3.5 w-[1px] bg-white/[0.08] mx-1" />
          <span className="font-mono text-xs text-neutral-400 flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-accent-cyan animate-pulse" />
            <span className="text-white font-medium">cluster-us-east-1</span>
            <span className="text-neutral-500">//</span>
            <span className="text-neutral-400">pipeline-session-882f</span>
          </span>
        </div>

        {/* Right Controls: Auto-Cycle Toggle + Live Status Pills */}
        <div className="flex items-center gap-2.5 text-xs font-mono">
          <button
            type="button"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95 ${
              isAutoPlaying
                ? 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/40 shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                : 'bg-white/[0.03] text-neutral-400 border-white/[0.08] hover:text-white'
            }`}
            title="Auto-cycle through pipeline stages"
          >
            {isAutoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
            <span>{isAutoPlaying ? 'Auto-Cycle' : 'Play Flow'}</span>
          </button>

          <div className="bg-[#0B0D12] px-2.5 py-1 rounded-lg border border-white/[0.08] hidden sm:flex items-center gap-1.5 text-neutral-300 shadow-sm">
            <span className="text-neutral-500">Poll:</span>
            <span className="text-accent-cyan font-semibold">100ms</span>
          </div>

          <div className="bg-[#0B0D12] px-2.5 py-1 rounded-lg border border-white/[0.08] flex items-center gap-1.5 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-emerald opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-emerald" />
            </span>
            <span className="text-white font-medium">24/24 Replicas</span>
          </div>
        </div>
      </div>

      {/* Cybernetic Progress Conduit Beam */}
      <div className="relative w-full h-1 bg-white/[0.04] rounded-full mb-5 overflow-hidden" aria-hidden="true">
        {/* Active Stage Fill Progress Beam */}
        <motion.div
          className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-accent-cyan via-accent-emerald to-accent-cyan rounded-full"
          animate={{
            width: `${((selectedIndex + 1) / PIPELINE_STEPS.length) * 100}%`
          }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        />
        {/* Animated Flying Light Packet Particle */}
        <div className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-white to-transparent animate-beam" />
      </div>

      {/* 6 Interactive Stage Cards with Spotlight & Magnetic Spring */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '0px 0px -30px 0px' }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5 relative z-10"
      >
        {PIPELINE_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isSelected = selectedStepId === step.id;
          const isPassed = idx <= selectedIndex;

          return (
            <motion.div
              key={step.id}
              variants={itemVariants}
              onClick={() => setSelectedStepId(step.id)}
              onMouseMove={handleCardMouseMove}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              className={`spotlight-card group relative rounded-xl border p-3.5 sm:p-4 transition-all duration-200 flex flex-col justify-between cursor-pointer backdrop-blur-xl ${
                isSelected
                  ? 'bg-[#0E1117] border-accent-cyan shadow-[0_0_24px_rgba(0,240,255,0.18)]'
                  : step.isLive
                  ? 'bg-[#090B0E]/90 border-accent-emerald/35 hover:border-accent-emerald/60 hover:bg-[#0B0D12]'
                  : isPassed
                  ? 'bg-[#090B0E]/90 border-white/[0.12] hover:border-accent-cyan/40 hover:bg-[#0B0D12]'
                  : 'bg-[#07090C]/80 border-white/[0.06] hover:border-white/20 hover:bg-[#090B0E]'
              }`}
              role="button"
              tabIndex={0}
              aria-label={`Inspect ${step.title} pipeline stage`}
            >
              {/* Card Header: Icon + Step Pill */}
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300"
                  style={{
                    backgroundColor: isSelected ? step.accentBg : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${isSelected ? step.accentBorder : 'rgba(255, 255, 255, 0.08)'}`,
                    color: isSelected ? step.accentColor : '#9CA3AF'
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-neutral-500 font-semibold">
                    {step.stepNumber}
                  </span>
                  {step.isLive ? (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-emerald opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-emerald" />
                    </span>
                  ) : (
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        isSelected ? 'bg-accent-cyan shadow-[0_0_6px_#00F0FF]' : isPassed ? 'bg-accent-emerald' : 'bg-neutral-600'
                      }`}
                    />
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div>
                <div
                  className="text-[10px] font-mono uppercase tracking-wider transition-colors truncate"
                  style={{
                    color: isSelected ? step.accentColor : step.isLive ? '#10B981' : '#737373'
                  }}
                >
                  {step.badge}
                </div>
                <div className="text-sm font-semibold text-white mt-0.5 group-hover:text-white/95 font-sans truncate">
                  {step.title}
                </div>
                <div className={`mt-2 text-[10px] font-mono truncate ${step.metaColor}`}>
                  {step.meta}
                </div>
              </div>

              {/* Active Spring Glow Floor */}
              {isSelected && (
                <motion.div
                  layoutId="pipeline-active-indicator"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-accent-cyan rounded-b-xl"
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Interactive Telemetry Inspection Drawer (Fixed height to prevent layout shifts) */}
      <div className="mt-4 min-h-[76px] rounded-xl bg-[#090B0E]/95 border border-white/[0.08] p-3.5 sm:p-4 font-mono text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xl shadow-inner relative overflow-hidden">
        {/* Subtle stage glow background tint */}
        <div
          className="absolute -right-20 -top-20 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none transition-colors duration-300"
          style={{ backgroundColor: selectedStep.accentColor }}
        />

        {/* Left Stage Details with Icon */}
        <div className="flex items-center gap-3 relative z-10 overflow-hidden">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors"
            style={{
              backgroundColor: selectedStep.accentBg,
              border: `1px solid ${selectedStep.accentBorder}`,
              color: selectedStep.accentColor
            }}
          >
            <selectedStep.icon className="w-4 h-4" />
          </div>

          <div className="overflow-hidden">
            <div className="text-white font-medium flex flex-wrap items-center gap-2">
              <span className="font-semibold">{selectedStep.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-neutral-300">
                {selectedStep.inspectData.protocol}
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-md font-semibold border"
                style={{
                  backgroundColor: selectedStep.accentBg,
                  borderColor: selectedStep.accentBorder,
                  color: selectedStep.accentColor
                }}
              >
                {selectedStep.inspectData.metric}
              </span>
            </div>

            <p className="text-neutral-400 text-[11px] mt-1 truncate">
              {selectedStep.inspectData.detail} • <span className="text-neutral-300">{selectedStep.inspectData.subtext}</span>
            </p>
          </div>
        </div>

        {/* Right Stage Telemetry Specs */}
        <div className="flex items-center gap-3.5 shrink-0 self-end sm:self-center text-[11px] relative z-10">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <span>Latency:</span>
            <strong className="text-accent-emerald font-semibold tabular-nums">{selectedStep.inspectData.timing}</strong>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent-emerald/10 border border-accent-emerald/25 text-accent-emerald text-[10px] font-semibold">
            <ShieldCheck className="w-3 h-3" />
            <span>{selectedStep.inspectData.securitySeal}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
