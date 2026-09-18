import { motion } from 'framer-motion';

interface RepoSkeletonProps {
  count?: number;
  viewMode?: 'grid' | 'list';
}

export function RepoSkeleton({ count = 6, viewMode = 'grid' }: RepoSkeletonProps) {
  return (
    <div
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'flex flex-col gap-3'
      }
    >
      {Array.from({ length: count }).map((_, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: idx * 0.04 }}
          className="relative rounded-2xl p-5 bg-[#0B0D10]/60 border border-white/[0.06] overflow-hidden shadow-sm"
        >
          {/* Subtle animated shimmer beam */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-beam pointer-events-none" />

          {/* Top row skeleton */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/[0.05] animate-pulse" />
              <div className="space-y-1.5">
                <div className="w-32 h-4 rounded-md bg-white/[0.08] animate-pulse" />
                <div className="w-24 h-3 rounded-md bg-white/[0.04] animate-pulse" />
              </div>
            </div>
            <div className="w-14 h-5 rounded-full bg-white/[0.05] animate-pulse" />
          </div>

          {/* Middle badges */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-16 h-5 rounded-lg bg-white/[0.04] animate-pulse" />
            <div className="w-36 h-5 rounded-lg bg-white/[0.03] animate-pulse" />
          </div>

          {/* Clone row */}
          <div className="w-full h-8 rounded-xl bg-white/[0.03] mb-4 animate-pulse" />

          {/* Footer actions */}
          <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between">
            <div className="w-16 h-4 rounded-md bg-white/[0.04] animate-pulse" />
            <div className="w-28 h-7 rounded-xl bg-white/[0.08] animate-pulse" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
