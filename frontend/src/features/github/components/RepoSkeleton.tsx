import { motion } from 'framer-motion';

interface RepoSkeletonProps {
  count?: number;
  viewMode?: 'grid' | 'list';
}

export function RepoSkeleton({ count = 6, viewMode = 'grid' }: RepoSkeletonProps) {
  if (viewMode === 'list') {
    return (
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-xl p-3.5 bg-[#0B0D11]/60 border border-white/[0.06] flex items-center justify-between gap-4 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.05]" />
              <div className="space-y-1.5">
                <div className="w-36 h-4 rounded bg-white/[0.08]" />
                <div className="w-24 h-3 rounded bg-white/[0.04]" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-7 rounded-lg bg-white/[0.06]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: idx * 0.03 }}
          className="rounded-2xl p-5 bg-[#0B0D11]/60 border border-white/[0.06] shadow-sm animate-pulse space-y-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/[0.05]" />
              <div className="space-y-1.5">
                <div className="w-32 h-4 rounded-md bg-white/[0.08]" />
                <div className="w-24 h-3 rounded-md bg-white/[0.04]" />
              </div>
            </div>
            <div className="w-14 h-5 rounded-full bg-white/[0.05]" />
          </div>

          <div className="w-20 h-6 rounded-lg bg-white/[0.04]" />
          <div className="w-full h-8 rounded-xl bg-white/[0.03]" />

          <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between">
            <div className="w-14 h-4 rounded bg-white/[0.04]" />
            <div className="w-20 h-7 rounded-xl bg-white/[0.08]" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
