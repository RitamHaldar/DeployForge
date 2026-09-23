import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, RefreshCw, LogOut, User } from 'lucide-react';
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
            className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-400 hover:text-white transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40"
            title="Return to Home"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          </motion.button>

          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-b from-white/10 to-white/[0.03] border border-white/10 flex items-center justify-center p-1.5 transition-all duration-300 group-hover:border-cyan-400/40 group-hover:shadow-[0_0_16px_rgba(0,240,255,0.25)]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-4 h-4 text-cyan-400 transition-transform group-hover:scale-105"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" />
                <circle cx="12" cy="12" r="2.5" fill="#00F0FF" />
              </svg>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-tight text-white font-sans">
                  DeployForge
                </span>
                <span className="text-[11px] text-neutral-400 font-normal">
                  / Repositories {repoCount > 0 ? `(${repoCount})` : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Refresh & User Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Refresh Button */}
          <motion.button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            whileHover={isRefreshing ? {} : { scale: 1.02 }}
            whileTap={isRefreshing ? {} : { scale: 0.96 }}
            className={`px-3 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-neutral-300 hover:text-white transition-colors duration-200 flex items-center gap-1.5 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 ${
              isRefreshing ? 'opacity-70 cursor-wait' : ''
            }`}
            title="Refresh repository list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Sync'}</span>
          </motion.button>

          {/* User Profile Chip */}
          <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-white/[0.08]">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-neutral-300">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500/20 to-blue-500/30 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium text-white max-w-[130px] truncate hidden sm:inline">
                {user?.username || user?.email?.split('@')[0] || 'User'}
              </span>
            </div>

            {/* Logout Button */}
            <motion.button
              type="button"
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200"
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
