import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthHeaderProps {
  onBackToHome: () => void;
}

export function AuthHeader({ onBackToHome }: AuthHeaderProps) {
  return (
    <header className="relative z-30 w-full py-4 sm:py-5 px-6 max-w-6xl mx-auto flex items-center justify-between shrink-0">
      {/* Brand Logo & Name */}
      <button
        type="button"
        onClick={onBackToHome}
        className="group inline-flex items-center gap-2.5 text-sm font-medium text-neutral-200 hover:text-white transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 rounded-lg"
        title="DeployForge"
      >
        <div className="relative w-8 h-8 rounded-xl bg-gradient-to-b from-white/10 to-white/[0.03] border border-white/10 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-cyan-400/40 group-hover:shadow-[0_0_16px_rgba(0,240,255,0.25)]">
          <svg
            className="w-4 h-4 text-cyan-400 transition-transform duration-300 group-hover:scale-105"
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
        </div>

        <span className="font-semibold tracking-tight text-white text-base">
          DeployForge
        </span>
      </button>

      {/* Return to Site Action */}
      <motion.button
        type="button"
        onClick={onBackToHome}
        whileHover={{ x: -2 }}
        whileTap={{ scale: 0.98 }}
        className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 rounded-lg px-3 py-1.5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.15] text-xs font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
        <span>Back to home</span>
      </motion.button>
    </header>
  );
}
