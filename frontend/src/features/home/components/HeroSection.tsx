import { motion } from 'framer-motion';
import { Zap, ShieldCheck, ChevronRight, Timer } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

export function HeroSection() {
  return (
    <div className="relative pt-32 pb-16 md:pt-40 md:pb-20 max-w-4xl mx-auto px-6 text-center z-10 flex flex-col items-center">
      
      {/* Eyebrow Badge with Spring Hover */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="hero-eyebrow inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-brand-card/90 border border-brand-border text-xs font-mono text-brand-muted mb-8 shadow-sm hover:border-brand-cyan/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] group cursor-pointer"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-cyan"></span>
        </span>
        <span className="tracking-wider uppercase text-[11px] font-semibold text-white/90">
          Autonomous Deployment Infrastructure
        </span>
        <span className="text-white/20">|</span>
        <a
          href="#self-healing"
          className="text-brand-cyan group-hover:text-white transition-colors flex items-center gap-0.5"
        >
          Zero-Downtime Engine <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </motion.div>

      {/* Main Headline */}
      <h1
        className="hero-headline text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08] mb-6"
      >
        Deploy. Detect. Recover. <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-brand-muted">
          Automatically.
        </span>
      </h1>

      {/* Supporting Subheading */}
      <p
        className="hero-subheading text-base sm:text-lg text-brand-muted font-normal leading-relaxed max-w-2xl mb-10"
      >
        DeployForge continuously inspects your services, flags anomalies in milliseconds, and restores hot standby replicas before customer traffic experiences downtime.
      </p>

      {/* Action Buttons with Spring Physics */}
      <div
        className="hero-ctas flex flex-wrap items-center justify-center gap-3.5 mb-10"
      >
        <motion.a
          href="#developer-experience"
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="light-sweep-btn bg-white text-black hover:bg-neutral-100 font-semibold text-sm px-6 py-3 rounded-lg shadow-[0_0_28px_rgba(255,255,255,0.16)] flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
        >
          <Zap className="w-4 h-4 text-black fill-black" />
          <span>Deploy a Project</span>
        </motion.a>

        <motion.a
          href="#self-healing"
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-brand-card hover:bg-brand-elevated text-white border border-brand-border hover:border-brand-border-hover font-medium text-sm px-5 py-3 rounded-lg flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan shadow-sm"
        >
          <ShieldCheck className="w-4 h-4 text-brand-cyan" />
          <span>Explore Architecture</span>
        </motion.a>
      </div>

      {/* Operational Status Pill */}
      <div
        className="hero-status flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-brand-muted"
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-brand-surface border border-brand-border shadow-sm hover:border-brand-border-hover transition-colors">
          <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse"></span>
          <span className="text-white/90">All 14 regions operational</span>
        </div>
        <span className="text-white/20 hidden sm:inline">•</span>
        <div className="flex items-center gap-1.5 text-brand-muted">
          <Timer className="w-3.5 h-3.5 text-brand-cyan" />
          <span>
            Avg. self-heal latency:{' '}
            <strong className="text-white font-medium">
              <AnimatedCounter value={3.8} decimals={1} suffix="s" />
            </strong>
          </span>
        </div>
      </div>

    </div>
  );
}
