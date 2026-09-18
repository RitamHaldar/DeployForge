import { motion } from 'framer-motion';
import { GitBranch, Search, RefreshCw, ExternalLink, ShieldAlert } from 'lucide-react';

interface RepoEmptyStateProps {
  type: 'no-results' | 'no-repos' | 'error';
  searchQuery?: string;
  onClearSearch?: () => void;
  onRetry?: () => void;
  errorMessage?: string | null;
}

export function RepoEmptyState({
  type,
  searchQuery,
  onClearSearch,
  onRetry,
  errorMessage,
}: RepoEmptyStateProps) {
  const isNoResults = type === 'no-results';
  const isError = type === 'error';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-3xl p-8 sm:p-12 bg-[#0B0D10]/80 border border-white/[0.08] backdrop-blur-xl text-center max-w-lg mx-auto my-12 shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
    >
      <div className="w-14 h-14 rounded-2xl mx-auto mb-5 bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-accent-cyan shadow-inner">
        {isError ? (
          <ShieldAlert className="w-7 h-7 text-accent-rose" />
        ) : isNoResults ? (
          <Search className="w-7 h-7 text-accent-cyan" />
        ) : (
          <GitBranch className="w-7 h-7 text-accent-cyan" />
        )}
      </div>

      <h3 className="text-lg sm:text-xl font-bold font-sans text-white mb-2">
        {isError
          ? 'GitHub Synchronization Issue'
          : isNoResults
          ? `No matches for "${searchQuery}"`
          : 'No GitHub Repositories Found'}
      </h3>

      <p className="text-xs sm:text-sm font-mono text-neutral-400 mb-6 leading-relaxed max-w-sm mx-auto">
        {isError
          ? errorMessage || 'Unable to communicate with GitHub API gateway. Your GitHub token may be expired or missing.'
          : isNoResults
          ? 'Try adjusting your search criteria, clearing the query, or switching visibility filters.'
          : 'Make sure your GitHub account is connected with read permissions to your repositories.'}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {isNoResults && onClearSearch && (
          <motion.button
            type="button"
            onClick={onClearSearch}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-xl text-xs font-mono font-medium bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/10 transition-colors"
          >
            Clear Filter
          </motion.button>
        )}

        {isError && (
          <>
            {onRetry && (
              <motion.button
                type="button"
                onClick={onRetry}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-sweep px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-white text-black hover:bg-neutral-100 flex items-center gap-1.5 shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Sync</span>
              </motion.button>
            )}

            <a
              href="/api/auth/github"
              className="px-4 py-2 rounded-xl text-xs font-mono font-medium bg-accent-cyan/10 hover:bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30 flex items-center gap-1.5 transition-colors"
            >
              <span>Re-authenticate GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </>
        )}
      </div>
    </motion.div>
  );
}
