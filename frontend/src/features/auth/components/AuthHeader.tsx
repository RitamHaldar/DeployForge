import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthHeaderProps {
  onBackToHome: () => void;
}

export function AuthHeader({ onBackToHome }: AuthHeaderProps) {
  return (
    <header className="relative z-30 w-full py-2 sm:py-3 px-6 max-w-7xl mx-auto flex items-center justify-between shrink-0">
      {/* DeployForge Brand Hallmark */}
      <button
        type="button"
        onClick={onBackToHome}
        className="group inline-flex items-center gap-3 text-sm tracking-tight text-neutral-200 hover:text-white transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan rounded-lg"
        title="Return to DeployForge homepage"
      >
        <div className="relative w-8 h-8 rounded-xl bg-[#101216] border border-white/10 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-accent-cyan/50 group-hover:shadow-[0_0_18px_rgba(0,240,255,0.3)] shadow-inner">
          {/* SVG Forge Diamond Spark Mark */}
          <svg
            className="w-4 h-4 text-accent-cyan transition-transform duration-300 group-hover:scale-110 animate-forge"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" />
            <circle cx="12" cy="12" r="2.5" fill="#00F0FF" />
          </svg>
          <div className="absolute inset-0 bg-accent-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-tight text-white text-base font-sans">
            DeployForge
          </span>
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-neutral-400 group-hover:border-accent-cyan/30 group-hover:text-accent-cyan transition-colors">
            v2.4
          </span>
        </div>
      </button>

      {/* Return to Site & Global Edge Status Readout */}
      <div className="flex items-center gap-3 text-xs font-mono">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-neutral-300 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-emerald opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-emerald" />
          </span>
          <span className="text-[11px] text-neutral-400">All Systems Nominal</span>
          <span className="text-neutral-600">·</span>
          <span className="text-[10px] text-accent-cyan font-semibold">14ms</span>
        </div>

        <motion.button
          type="button"
          onClick={onBackToHome}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.97 }}
          className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan rounded-lg px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/15 text-xs font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span className="hidden sm:inline">Back to platform</span>
          <span className="sm:hidden">Home</span>
        </motion.button>
      </div>
    </header>
  );
}
