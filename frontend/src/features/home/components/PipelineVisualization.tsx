import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { GitBranch, Cpu, Box, Send, HeartPulse, Globe, ShieldCheck } from 'lucide-react';

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
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
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const
    }
  }
};

interface StepDetail {
  id: string;
  badge: string;
  title: string;
  meta: string;
  metaColor: string;
  icon: React.ComponentType<{ className?: string }>;
  status: string;
  isLive?: boolean;
  inspectData: {
    detail: string;
    subtext: string;
    timing: string;
    metric: string;
  };
}

export function PipelineVisualization() {
  const steps: StepDetail[] = [
    {
      id: 'git-push',
      badge: 'Source',
      title: 'Git Push',
      meta: 'commit #8f72a1c',
      metaColor: 'text-white/50',
      icon: GithubIcon,
      status: 'healthy',
      inspectData: {
        detail: 'SHA256 signature verified via Ed25519 webhook handshake',
        subtext: 'Branch: main • Author: @alex • 4 files modified',
        timing: '120ms',
        metric: 'Zero-trust verified'
      }
    },
    {
      id: 'build',
      badge: 'Compile',
      title: 'Build',
      meta: 'Cached 1.4s',
      metaColor: 'text-brand-cyan',
      icon: Cpu,
      status: 'healthy',
      inspectData: {
        detail: 'Turbopack layer cache hit 94% across 8 parallel build workers',
        subtext: 'Next.js 15 SSR bundle • Output: 42.1MB distroless',
        timing: '1.4s',
        metric: 'Cached layer hit'
      }
    },
    {
      id: 'container',
      badge: 'Artifact',
      title: 'Container',
      meta: 'sha256:49c8...',
      metaColor: 'text-white/50',
      icon: Box,
      status: 'healthy',
      inspectData: {
        detail: 'Deterministic microVM rootfs frozen & cryptographically sealed',
        subtext: 'Cosign envelope • 0 vulnerabilities • Distroless runtime',
        timing: '0.8s',
        metric: 'Signed by Cosign'
      }
    },
    {
      id: 'deploy',
      badge: 'Orchestrate',
      title: 'Deploy',
      meta: 'Mesh routing',
      metaColor: 'text-white/50',
      icon: Send,
      status: 'healthy',
      inspectData: {
        detail: 'Atomic pointer swap executed across eBPF global mesh table',
        subtext: 'Zero socket resets • Keep-alive connections preserved intact',
        timing: '0.4s',
        metric: 'eBPF atomic shift'
      }
    },
    {
      id: 'health-check',
      badge: 'Autonomous',
      title: 'Health Check',
      meta: '200 OK /healthz',
      metaColor: 'text-brand-emerald',
      icon: HeartPulse,
      status: 'healthy',
      inspectData: {
        detail: 'Synthetic health probes asserted across 24 edge nodes',
        subtext: 'HTTP /healthz 200 OK • TLS certificate verified • p99: 8ms',
        timing: '280ms',
        metric: '24/24 nodes passing'
      }
    },
    {
      id: 'production',
      badge: 'Live Traffic',
      title: 'Production',
      meta: '100% Ingress',
      metaColor: 'text-white/70',
      icon: Globe,
      status: 'healthy',
      isLive: true,
      inspectData: {
        detail: 'Global Anycast DNS serving 100% customer ingress traffic',
        subtext: 'Autonomous watchdog monitoring CPU, heap, and socket errors',
        timing: 'Ongoing',
        metric: '99.999% SLA uptime'
      }
    }
  ];

  const [selectedStepId, setSelectedStepId] = useState<string>('production');

  const selectedStep = steps.find((s) => s.id === selectedStepId) || steps[5];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <div className="w-full relative">
      {/* Top Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-brand-border mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-white/20"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-white/20"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-white/20"></span>
          </div>
          <div className="h-3.5 w-[1px] bg-brand-border mx-1"></div>
          <span className="font-mono text-xs text-brand-muted flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-brand-cyan animate-pulse" />
            <span>cluster-us-east-1 // pipeline-session-882f</span>
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="bg-brand-card px-2.5 py-1 rounded border border-brand-border flex items-center gap-2 shadow-sm">
            <span className="text-brand-muted">Health Poll:</span>
            <span className="text-brand-cyan font-semibold">100ms interval</span>
          </div>
          <div className="bg-brand-card px-2.5 py-1 rounded border border-brand-border flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse"></span>
            <span className="text-white">Active Replicas: 24/24</span>
          </div>
        </div>
      </div>

      {/* Animated Data Beam Track with continuous packet particles */}
      <div className="relative w-full h-[2px] bg-brand-border mb-4 overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 bottom-0 w-36 bg-gradient-to-r from-transparent via-brand-cyan to-transparent animate-beam"></div>
        {/* Subtle secondary packet traveling in tandem */}
        <div className="absolute top-0 bottom-0 w-16 bg-gradient-to-r from-transparent via-brand-emerald to-transparent animate-beam" style={{ animationDelay: '1.2s' }}></div>
      </div>

      {/* 6-Node Grid with Staggered Scroll Entrance & Spotlight */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "0px 0px -30px 0px" }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 relative z-10"
      >
        {steps.map((step) => {
          const Icon = step.icon;
          const isSelected = selectedStepId === step.id;

          return (
            <motion.div
              key={step.id}
              variants={itemVariants}
              onClick={() => setSelectedStepId(step.id)}
              onMouseMove={handleMouseMove}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`spotlight-card group relative rounded-xl bg-brand-card border p-4 transition-colors duration-200 flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'border-brand-cyan/70 shadow-[0_0_24px_rgba(0,240,255,0.14)] bg-brand-elevated'
                  : step.isLive
                  ? 'border-brand-emerald/40 shadow-[0_0_20px_rgba(16,185,129,0.12)] hover:border-brand-emerald hover:shadow-[0_0_28px_rgba(16,185,129,0.22)]'
                  : 'border-brand-border hover:border-brand-cyan/50 hover:bg-brand-elevated hover:shadow-[0_0_20px_rgba(0,240,255,0.1)]'
              }`}
              role="button"
              tabIndex={0}
              aria-label={`Inspect ${step.title} pipeline stage`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                    isSelected
                      ? 'bg-brand-cyan-dim text-brand-cyan scale-110'
                      : step.isLive
                      ? 'bg-brand-emerald-dim text-brand-emerald'
                      : 'bg-white/[0.04] text-brand-muted group-hover:text-brand-cyan group-hover:bg-brand-cyan-dim'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {step.isLive ? (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-emerald opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-emerald"></span>
                  </span>
                ) : (
                  <span className={`w-1.5 h-1.5 rounded-full transition-colors ${isSelected ? 'bg-brand-cyan' : 'bg-brand-emerald/80 group-hover:bg-brand-cyan'}`}></span>
                )}
              </div>

              <div>
                <div
                  className={`text-[10px] font-mono uppercase tracking-wider transition-colors ${
                    isSelected ? 'text-brand-cyan font-semibold' : step.isLive ? 'text-brand-emerald font-semibold' : 'text-brand-muted group-hover:text-brand-cyan'
                  }`}
                >
                  {step.badge}
                </div>
                <div className="text-sm font-semibold text-white mt-0.5 group-hover:text-white/95">
                  {step.title}
                </div>
                <div className={`mt-2 text-[10px] font-mono truncate ${step.metaColor}`}>
                  {step.meta}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Interactive Micro-Detail Inspector Drawer for Selected Step */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedStep.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="mt-4 p-4 rounded-xl bg-brand-elevated/90 border border-brand-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs shadow-inner"
        >
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-card border border-brand-border flex items-center justify-center text-brand-cyan shrink-0">
              <selectedStep.icon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-white font-medium flex items-center gap-2">
                <span>Stage: {selectedStep.title}</span>
                <span className="text-[10px] text-brand-cyan bg-brand-cyan-dim px-2 py-0.5 rounded border border-brand-cyan/20">
                  {selectedStep.inspectData.metric}
                </span>
              </div>
              <p className="text-brand-muted text-[11px] mt-0.5">
                {selectedStep.inspectData.detail} • <span className="text-white/70">{selectedStep.inspectData.subtext}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center text-[11px]">
            <span className="text-brand-muted">Latency:</span>
            <span className="text-brand-emerald font-semibold">{selectedStep.inspectData.timing}</span>
            <span className="text-brand-cyan flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified</span>
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
