import { motion } from 'framer-motion';
import { GitFork, Globe, Lock, ShieldCheck } from 'lucide-react';

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
      label: 'Connected Repos',
      value: loading ? '—' : totalCount,
      icon: GitFork,
      color: 'text-accent-cyan',
      badgeBg: 'bg-accent-cyan/10 border-accent-cyan/25',
    },
    {
      label: 'Public Repositories',
      value: loading ? '—' : publicCount,
      icon: Globe,
      color: 'text-accent-emerald',
      badgeBg: 'bg-accent-emerald/10 border-accent-emerald/25',
    },
    {
      label: 'Private Repositories',
      value: loading ? '—' : privateCount,
      icon: Lock,
      color: 'text-accent-amber',
      badgeBg: 'bg-accent-amber/10 border-accent-amber/25',
    },
    {
      label: 'Auto-Healing Engine',
      value: 'Armed & Active',
      icon: ShieldCheck,
      color: 'text-accent-cyan',
      badgeBg: 'bg-white/[0.04] border-white/[0.08]',
      isPill: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
      {stats.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-2xl p-3.5 sm:p-4 bg-[#0B0D10]/80 border border-white/[0.08] backdrop-blur-xl shadow-[0_8px_25px_rgba(0,0,0,0.5)] flex items-center justify-between overflow-hidden group hover:border-white/[0.16] transition-all"
          >
            <div>
              <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                {item.label}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-bold font-sans text-white tracking-tight">
                  {item.value}
                </span>
                {item.isPill && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-emerald opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-emerald shadow-[0_0_6px_#10B981]" />
                  </span>
                )}
              </div>
            </div>

            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border ${item.badgeBg} ${item.color} shrink-0 transition-transform group-hover:scale-105`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
