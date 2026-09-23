import { motion } from 'framer-motion';
import { GitBranch, ShieldCheck, Zap, Globe, CheckCircle2, ArrowUpRight } from 'lucide-react';

export function AuthShowcase() {
  return (
    <div className="hidden lg:flex flex-col justify-center max-w-[480px] xl:max-w-[520px] pr-4 select-none space-y-6 shrink-0">
      {/* Platform Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md w-fit">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
        <span className="text-xs font-medium text-neutral-300">
          DeployForge Cloud Platform
        </span>
        <span className="text-neutral-600">·</span>
        <span className="text-xs text-cyan-400 font-medium">v2.4</span>
      </div>

      {/* Hero Headline & Description */}
      <div className="space-y-2.5">
        <h2 className="text-3xl xl:text-4xl font-bold tracking-tight text-white leading-[1.15]">
          Continuous deployment,{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            elevated.
          </span>
        </h2>
        <p className="text-sm text-neutral-400 leading-relaxed font-normal">
          Connect your GitHub repository and ship production applications with zero configuration, instant previews, and automated failover.
        </p>
      </div>

      {/* Modern Deployment Activity Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-2xl bg-[#0D0F14]/90 border border-white/[0.08] p-4 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-3"
      >
        <div className="flex items-center justify-between text-xs pb-2.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 text-neutral-200 font-medium">
            <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
            <span>production · main</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Deployed in 14s</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.04]">
          <div className="flex items-center gap-2 text-neutral-300 font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>deployforge.io/preview</span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500" />
        </div>

        {/* Minimal Metrics Row */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
            <div className="text-[10px] text-neutral-500 font-medium">Availability</div>
            <div className="text-xs font-semibold text-neutral-200 mt-0.5">99.99%</div>
          </div>
          <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
            <div className="text-[10px] text-neutral-500 font-medium">Edge Latency</div>
            <div className="text-xs font-semibold text-cyan-400 mt-0.5">&lt; 18ms</div>
          </div>
          <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
            <div className="text-[10px] text-neutral-500 font-medium">Rollback</div>
            <div className="text-xs font-semibold text-emerald-400 mt-0.5">Instant</div>
          </div>
        </div>
      </motion.div>

      {/* Feature Value Props */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="space-y-1">
          <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-cyan-400 mb-2">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-xs font-semibold text-neutral-200">Zero Config</h4>
          <p className="text-[11px] text-neutral-400 leading-normal">
            Automatic builds & edge deployments from any Git branch.
          </p>
        </div>

        <div className="space-y-1">
          <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-emerald-400 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-xs font-semibold text-neutral-200">Self-Healing</h4>
          <p className="text-[11px] text-neutral-400 leading-normal">
            Autonomous failover recovers unhealthy nodes in milliseconds.
          </p>
        </div>

        <div className="space-y-1">
          <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-indigo-400 mb-2">
            <Globe className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-xs font-semibold text-neutral-200">Global Edge</h4>
          <p className="text-[11px] text-neutral-400 leading-normal">
            Ultra-fast routing distributed across 35+ edge regions.
          </p>
        </div>
      </div>
    </div>
  );
}
