import { motion } from 'framer-motion';
import { GitFork, Globe, Lock, GitPullRequest } from 'lucide-react';

interface RepoStatsBarProps {
  totalCount: number;
  publicCount: number;
  privateCount: number;
  loading: boolean;
}

export function RepoStatsBar({
  totalCount,
  publicCount,
  privateCount,
  loading,
}: RepoStatsBarProps) {
  const stats = [
    {
      label: 'Total Repositories',
      value: loading ? '—' : totalCount,
      icon: GitFork,
      color: 'text-cyan-400',
      badgeBg: 'bg-cyan-500/10 border-cyan-500/20',
    },
    {
      label: 'Public',
      value: loading ? '—' : publicCount,
      icon: Globe,
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Private',
      value: loading ? '—' : privateCount,
      icon: Lock,
      color: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'GitHub Integration',
      value: 'Connected',
      icon: GitPullRequest,
      color: 'text-cyan-400',
      badgeBg: 'bg-white/[0.03] border-white/[0.08]',
      isStatus: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {stats.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-2xl p-4 bg-[#0B0D11]/90 border border-white/[0.08] backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.4)] flex items-center justify-between overflow-hidden group hover:border-white/[0.16] transition-all duration-200"
          >
            <div>
              <p className="text-xs text-neutral-400 font-medium mb-1">
                {item.label}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-bold font-sans text-white tracking-tight">
                  {item.value}
                </span>
                {item.isStatus && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                )}
              </div>
            </div>

            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${item.badgeBg} ${item.color} shrink-0 transition-transform group-hover:scale-105 duration-200`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
