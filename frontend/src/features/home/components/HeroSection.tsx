import { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, ChevronRight, Timer, Copy, Check, Terminal, Sparkles, GitBranch } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import type { RootState } from '../../../App/app.store';

export function HeroSection() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [copied, setCopied] = useState(false);
  const installCmd = 'curl -fsSL https://deployforge.ai/install.sh | sh';

  const copyInstall = () => {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative pt-32 pb-16 md:pt-40 md:pb-20 max-w-5xl mx-auto px-6 text-center z-10 flex flex-col items-center select-none">
      
      {/* Central Ambient Hero Spotlight */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[380px] rounded-full bg-gradient-to-b from-accent-cyan/[0.07] via-accent-blue/[0.035] to-transparent blur-[120px] z-0"
        aria-hidden="true"
      />

      {/* Eyebrow Badge with Spring Hover & Radial Border Bevel */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -1, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative z-10 inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0B0D10]/90 border border-white/[0.1] text-xs font-mono text-neutral-300 mb-8 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:border-accent-cyan/40 transition-all duration-300 hover:shadow-[0_0_24px_rgba(0,240,255,0.18)] group cursor-pointer backdrop-blur-xl"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-cyan shadow-[0_0_6px_#00F0FF]" />
        </span>
        <span className="tracking-wider uppercase text-[10px] font-semibold text-white/90">
          Autonomous Deployment Engine
        </span>
        <span className="text-white/20">|</span>
        <a
          href="#self-healing"
          className="text-accent-cyan group-hover:text-white transition-colors flex items-center gap-1 font-medium"
        >
          <span>Self-Healing Cloud v2.4</span>
          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </motion.div>

      {/* Main Hero Headline with Staggered Visual Flow */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08] mb-6 font-sans max-w-4xl"
      >
        Deploy. Detect. Recover. <br />
        <span className="bg-gradient-to-r from-accent-cyan via-white to-accent-emerald bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(0,240,255,0.18)]">
          Automatically.
        </span>
      </motion.h1>

      {/* Supporting Subheading */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 text-base sm:text-lg text-neutral-400 font-normal leading-relaxed max-w-2xl mb-8 font-mono"
      >
        DeployForge continuously inspects service health, isolates anomalies in milliseconds, and restores healthy standby replicas before downtime impacts customers.
      </motion.p>

      {/* Action Buttons with Spring Physics */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-wrap items-center justify-center gap-3.5 mb-8"
      >
        {user ? (
          <motion.a
            href="/repos"
            whileHover={{ y: -2, scale: 1.025 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            className="btn-sweep bg-white text-black hover:bg-neutral-100 font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-[0_0_28px_rgba(255,255,255,0.18)] hover:shadow-[0_0_35px_rgba(255,255,255,0.28)] flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan tracking-tight font-sans group"
          >
            <GitBranch className="w-4 h-4 text-black transition-transform group-hover:scale-110" />
            <span>Manage Cloud Repositories</span>
          </motion.a>
        ) : (
          <motion.a
            href="/register"
            whileHover={{ y: -2, scale: 1.025 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            className="btn-sweep bg-white text-black hover:bg-neutral-100 font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-[0_0_28px_rgba(255,255,255,0.18)] hover:shadow-[0_0_35px_rgba(255,255,255,0.28)] flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan tracking-tight font-sans group"
          >
            <Zap className="w-4 h-4 text-black fill-black transition-transform group-hover:scale-110" />
            <span>Launch Autonomous Engine</span>
          </motion.a>
        )}

        <motion.a
          href="#self-healing"
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          className="bg-white/[0.035] hover:bg-white/[0.08] text-white border border-white/[0.1] hover:border-white/20 font-medium text-xs sm:text-sm px-5 py-3 rounded-xl flex items-center gap-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan shadow-sm backdrop-blur-md transition-all duration-200"
        >
          <ShieldCheck className="w-4 h-4 text-accent-cyan" />
          <span>Explore Architecture</span>
        </motion.a>
      </motion.div>

      {/* Instant 1-Click Developer CLI Snippet Pill */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mb-8"
      >
        <button
          type="button"
          onClick={copyInstall}
          className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#090B0E]/90 border border-white/[0.08] hover:border-white/20 font-mono text-xs text-neutral-300 hover:text-white transition-all duration-200 shadow-inner group backdrop-blur-xl"
          title="Click to copy installation script"
        >
          <Terminal className="w-3.5 h-3.5 text-accent-cyan shrink-0" />
          <span className="text-neutral-500 select-none">$</span>
          <span className="text-neutral-200 font-medium">{installCmd}</span>
          <div className="ml-1 pl-2 border-l border-white/[0.08] flex items-center gap-1 text-[10px] text-neutral-400 group-hover:text-accent-cyan transition-colors">
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-accent-emerald stroke-[2.5]" />
                <span className="text-accent-emerald font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </div>
        </button>
      </motion.div>

      {/* Operational Telemetry Dock */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-mono text-neutral-400"
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] shadow-sm hover:border-white/15 transition-colors backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-emerald opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-emerald shadow-[0_0_6px_#10B981]" />
          </span>
          <span className="text-white/90">All 34 Regions Operational</span>
        </div>

        <span className="text-neutral-700 hidden sm:inline">·</span>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] shadow-sm hover:border-white/15 transition-colors backdrop-blur-md">
          <Timer className="w-3.5 h-3.5 text-accent-cyan" />
          <span>
            Self-Heal Latency:{' '}
            <strong className="text-white font-medium">
              <AnimatedCounter value={3.8} decimals={1} suffix="s" />
            </strong>
          </span>
        </div>

        <span className="text-neutral-700 hidden sm:inline">·</span>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-neutral-400 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-accent-emerald" />
          <span>Zero-Downtime Guarantee</span>
        </div>
      </motion.div>

    </div>
  );
}
