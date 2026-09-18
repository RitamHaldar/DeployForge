import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, GitBranch, RefreshCw, LogOut, User } from 'lucide-react';
import type { RootState, AppDispatch } from '../../../App/app.store';
import { logout } from '../../auth/auth.slice';

interface GithubHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  repoCount: number;
}

export function GithubHeader({ onRefresh, isRefreshing, repoCount }: GithubHeaderProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-[#07090C]/80 border-b border-white/[0.08] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand Hallmark & Navigation */}
        <div className="flex items-center gap-3 sm:gap-4">
          <motion.button
            type="button"
            onClick={() => navigate('/')}
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.96 }}
            className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-400 hover:text-white transition-all duration-200 group focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan"
            title="Return to Home"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          </motion.button>

          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="relative w-8 h-8 rounded-xl bg-[#0E1116] border border-white/10 flex items-center justify-center p-1.5 shadow-inner transition-all duration-300 group-hover:border-accent-cyan/50 group-hover:shadow-[0_0_16px_rgba(0,240,255,0.3)]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-4 h-4 text-accent-cyan transition-transform group-hover:scale-105"
              >
                <path
                  d="M12 2L3 7V17L12 22L21 17V7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 6L7.5 8.5V13.5L12 16L16.5 13.5V8.5L12 6Z"
                  fill="currentColor"
                  fillOpacity="0.25"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <circle cx="12" cy="11" r="1.5" fill="#00F0FF" />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-accent-cyan shadow-[0_0_6px_#00F0FF] animate-pulse" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm tracking-tight text-white font-sans">
                  DeployForge
                </span>
                <span className="text-[9px] font-mono uppercase tracking-wider text-accent-cyan px-1.5 py-0.2 rounded-full bg-accent-cyan/10 border border-accent-cyan/25">
                  Cluster
                </span>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono flex items-center gap-1">
                <GitBranch className="w-2.5 h-2.5 text-neutral-400" />
                <span>GitHub Repositories {repoCount > 0 ? `(${repoCount})` : ''}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center/Right Actions & Telemetry */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Synced Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-emerald/10 border border-accent-emerald/20 text-[10px] font-mono text-accent-emerald">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald shadow-[0_0_4px_#10B981] animate-pulse" />
            <span>TLS 1.3 Synced</span>
          </div>

          {/* Refresh Button */}
          <motion.button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            whileHover={{ scale: isRefreshing ? 1 : 1.05 }}
            whileTap={{ scale: isRefreshing ? 1 : 0.95 }}
            className={`p-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-neutral-300 hover:text-white transition-colors duration-200 flex items-center gap-1.5 text-xs font-mono focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan ${
              isRefreshing ? 'opacity-70 cursor-wait' : ''
            }`}
            title="Refresh repository list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-accent-cyan' : ''}`} />
            <span className="hidden sm:inline text-[11px]">{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
          </motion.button>

          {/* User Profile / Status Chip */}
          <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-white/[0.08]">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs font-mono text-neutral-300">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-accent-cyan/20 to-accent-blue/30 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-medium text-white max-w-[120px] truncate hidden sm:inline">
                {user?.username || user?.email?.split('@')[0] || 'Authenticated'}
              </span>
            </div>

            {/* Logout Button */}
            <motion.button
              type="button"
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl text-neutral-400 hover:text-accent-rose hover:bg-accent-rose/10 border border-transparent hover:border-accent-rose/25 transition-all duration-200"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

      </div>
    </header>
  );
}
