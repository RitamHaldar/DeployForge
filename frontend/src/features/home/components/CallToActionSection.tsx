import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  BookOpen,
  Copy,
  Check,
  ShieldCheck,
  Globe,
  Clock,
  Sparkles,
  ArrowRight,
  Terminal,
  Server
} from 'lucide-react';

interface CallToActionSectionProps {
  onNavigate?: (path: string) => void;
}

const TRUST_METRICS = [
  {
    icon: Clock,
    title: 'Autonomous MTTR',
    value: '3.8s',
    sub: 'Zero human paging required',
    color: '#10B981',
    accentBg: 'rgba(16, 185, 129, 0.1)',
    accentBorder: 'rgba(16, 185, 129, 0.25)'
  },
  {
    icon: Globe,
    title: 'Global Edge Fleet',
    value: '14 PoPs',
    sub: 'BGP Anycast < 10ms TLS',
    color: '#00F0FF',
    accentBg: 'rgba(0, 240, 255, 0.1)',
    accentBorder: 'rgba(0, 240, 255, 0.25)'
  },
  {
    icon: Zap,
    title: 'Instant Free Tier',
    value: '$0 / mo',
    sub: 'No credit card to spin up',
    color: '#38BDF8',
    accentBg: 'rgba(56, 189, 248, 0.1)',
    accentBorder: 'rgba(56, 189, 248, 0.25)'
  },
  {
    icon: ShieldCheck,
    title: 'Zero-Trust Kernel',
    value: 'SOC 2',
    sub: 'eBPF automated isolation',
    color: '#A855F7',
    accentBg: 'rgba(168, 85, 247, 0.1)',
    accentBorder: 'rgba(168, 85, 247, 0.25)'
  }
];

export function CallToActionSection({ onNavigate }: CallToActionSectionProps) {
  const [copied, setCopied] = useState(false);
  const installCmd = 'curl -fsSL https://deployforge.dev/install.sh | bash';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(installCmd);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleDeployClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('/register');
    } else {
      window.location.href = '/register';
    }
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <section className="py-24 sm:py-32 border-t border-white/[0.08] relative z-10 bg-[#070809] overflow-hidden">
      {/* Background Volumetric Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[450px] bg-accent-cyan/[0.035] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute -bottom-24 left-1/4 w-[500px] h-[300px] bg-accent-emerald/[0.025] rounded-full blur-[140px] pointer-events-none" />

      {/* Subtle Tech Grid */}
      <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        
        {/* Main Command Center Card */}
        <motion.div
          onMouseMove={handleCardMouseMove}
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '0px 0px -40px 0px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="spotlight-card relative rounded-3xl bg-[#090B0E]/95 border border-white/[0.1] p-8 sm:p-12 lg:p-16 shadow-[0_32px_100px_rgba(0,0,0,0.9)] backdrop-blur-2xl text-center overflow-hidden"
        >
          {/* Subtle Cyber Corner Accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-accent-cyan/40 rounded-tl-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-cyan/40 rounded-tr-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-accent-emerald/40 rounded-bl-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent-emerald/40 rounded-br-3xl pointer-events-none" />

          {/* Top Eyebrow Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-neutral-300 mb-6 shadow-inner backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-emerald opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-emerald" />
            </span>
            <span className="text-white font-semibold">PRODUCTION-READY</span>
            <span className="text-neutral-500">•</span>
            <span className="text-accent-cyan">ZERO-DOWNTIME AUTONOMOUS FABRIC</span>
          </motion.div>

          {/* Main Title */}
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 font-sans leading-[1.1]"
          >
            Ship with confidence. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan via-white to-accent-emerald">
              Sleep through incidents.
            </span>
          </motion.h2>

          {/* Subtitle Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto mb-8 font-mono leading-relaxed"
          >
            Deploy your services on high-velocity microVM infrastructure that diagnoses memory leaks,
            isolates faulty nodes, and promotes hot-standbys in under 4 seconds.
          </motion.p>

          {/* Interactive 1-Click Fast CLI Install Snippet */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="max-w-xl mx-auto mb-9"
          >
            <div className="flex items-center justify-between gap-3 p-2 pl-4 rounded-xl bg-[#050608]/90 border border-white/[0.1] hover:border-accent-cyan/40 transition-colors shadow-inner font-mono text-xs text-left group">
              <div className="flex items-center gap-2 overflow-hidden">
                <Terminal className="w-3.5 h-3.5 text-accent-cyan shrink-0" />
                <span className="text-accent-emerald select-none font-bold">$</span>
                <span className="text-neutral-200 truncate select-all">{installCmd}</span>
              </div>

              <motion.button
                type="button"
                onClick={handleCopy}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-accent-cyan/15 hover:text-accent-cyan text-neutral-300 border border-white/[0.08] hover:border-accent-cyan/30 text-xs font-mono transition-all shrink-0 active:scale-95"
                title="Copy command"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {copied ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex items-center gap-1 text-accent-emerald font-semibold"
                    >
                      <Check className="w-3.5 h-3.5 text-accent-emerald" />
                      <span>Copied!</span>
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
            <div className="text-[11px] font-mono text-neutral-500 mt-2 flex items-center justify-center gap-2">
              <Sparkles className="w-3 h-3 text-accent-cyan" />
              <span>Full setup in &lt; 90 seconds • Native macOS, Linux, and Windows WSL</span>
            </div>
          </motion.div>

          {/* Elevated Call To Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-12"
          >
            <motion.a
              href="/register"
              onClick={handleDeployClick}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              className="btn-sweep relative px-8 py-4 rounded-xl bg-white text-black font-semibold text-sm shadow-[0_0_35px_rgba(255,255,255,0.22)] flex items-center gap-2.5 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan overflow-hidden"
            >
              <Zap className="w-4 h-4 text-black fill-black" />
              <span className="font-sans tracking-tight">Deploy Free Project</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </motion.a>

            <motion.a
              href="#observability"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              className="px-7 py-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.1] hover:border-white/[0.2] font-medium text-sm flex items-center gap-2.5 transition-all shadow-sm backdrop-blur-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan"
            >
              <BookOpen className="w-4 h-4 text-neutral-400" />
              <span className="font-sans">Explore Telemetry Engine</span>
            </motion.a>
          </motion.div>

          {/* 4 Trust & Resiliency Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-8 border-t border-white/[0.08] text-left"
          >
            {TRUST_METRICS.map((metric, idx) => {
              const Icon = metric.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 sm:p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center"
                      style={{
                        backgroundColor: metric.accentBg,
                        border: `1px solid ${metric.accentBorder}`,
                        color: metric.color
                      }}
                    >
                      <Icon className="w-3 h-3" />
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400 truncate">
                      {metric.title}
                    </span>
                  </div>

                  <div className="text-lg sm:text-xl font-bold text-white font-sans tabular-nums">
                    {metric.value}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-500 mt-0.5 truncate">
                    {metric.sub}
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Bottom Live Beacon Bar */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs font-mono text-neutral-400">
            <Server className="w-3.5 h-3.5 text-accent-emerald" />
            <span>All systems nominal:</span>
            <span className="text-white font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald shadow-[0_0_8px_#10B981] animate-pulse" />
              <span>100% Core Availability</span>
            </span>
          </div>

        </motion.div>

      </div>
    </section>
  );
}
