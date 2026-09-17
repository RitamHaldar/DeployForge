import { Shield, Lock, Cpu } from 'lucide-react';

export function AuthFooter() {
  return (
    <footer className="relative z-20 w-full max-w-7xl mx-auto px-6 py-1.5 sm:py-2 text-center space-y-1 shrink-0">
      {/* Platform Badges */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-neutral-500 font-mono">
        <span className="inline-flex items-center gap-1.5 text-neutral-400">
          <Lock className="w-2.5 h-2.5 text-neutral-500" />
          <span>TLS 1.3 Encrypted</span>
        </span>
        <span className="text-neutral-700 hidden sm:inline" aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1.5 text-neutral-400">
          <Shield className="w-2.5 h-2.5 text-accent-emerald/80" />
          <span>SOC-2 Type II Certified</span>
        </span>
        <span className="text-neutral-700 hidden sm:inline" aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1.5 text-neutral-400">
          <Cpu className="w-2.5 h-2.5 text-accent-cyan/80" />
          <span>Zero-Trust Architecture</span>
        </span>
      </div>

      <p className="text-[9px] sm:text-[10px] font-mono text-neutral-600">
        © 2026 DeployForge Inc. Autonomous self-healing infrastructure.
      </p>
    </footer>
  );
}
