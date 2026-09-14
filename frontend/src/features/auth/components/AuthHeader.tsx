import { ArrowLeft } from 'lucide-react';

interface AuthHeaderProps {
  onBackToHome: () => void;
}

export function AuthHeader({ onBackToHome }: AuthHeaderProps) {
  return (
    <header className="relative z-20 w-full pt-8 pb-4 px-6 max-w-6xl mx-auto flex items-center justify-between">
      {/* DeployForge Brand Logo with Spark Mark */}
      <button
        type="button"
        onClick={onBackToHome}
        className="group inline-flex items-center gap-2.5 text-sm tracking-tight text-neutral-200 hover:text-white transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan rounded-lg"
        title="Return to DeployForge homepage"
      >
        <div className="relative w-7 h-7 rounded-lg bg-surface-200 border border-white/10 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-accent-cyan/50 group-hover:shadow-[0_0_12px_rgba(0,240,255,0.25)]">
          {/* SVG Forge Spark Mark */}
          <svg
            className="w-4 h-4 text-accent-cyan transition-transform duration-300 group-hover:scale-105"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          <div className="absolute inset-0 bg-accent-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-tight text-white text-base">
            DeployForge
          </span>
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-400 group-hover:border-accent-cyan/30 group-hover:text-accent-cyan transition-colors">
            v2.4
          </span>
        </div>
      </button>

      {/* Return to Site & System Status */}
      <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
          <span className="text-neutral-300 text-[11px]">Secure authentication</span>
        </div>

        <button
          type="button"
          onClick={onBackToHome}
          className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan rounded px-2 py-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Back to platform</span>
          <span className="sm:hidden">Home</span>
        </button>
      </div>
    </header>
  );
}
