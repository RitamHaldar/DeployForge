import { motion } from 'framer-motion';
import { GitBranch, Search, RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';

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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl p-8 sm:p-12 bg-[#0B0D11]/90 border border-white/[0.08] backdrop-blur-xl text-center max-w-md mx-auto my-12 shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
    >
      <div className="w-12 h-12 rounded-2xl mx-auto mb-4 bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-cyan-400">
        {isError ? (
          <AlertCircle className="w-6 h-6 text-rose-400" />
        ) : isNoResults ? (
          <Search className="w-6 h-6 text-cyan-400" />
        ) : (
          <GitBranch className="w-6 h-6 text-cyan-400" />
        )}
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-white mb-1.5">
        {isError
          ? 'Failed to load repositories'
          : isNoResults
          ? `No matches for "${searchQuery}"`
          : 'No repositories found'}
      </h3>

      <p className="text-xs text-neutral-400 mb-5 leading-normal max-w-xs mx-auto">
        {isError
          ? errorMessage || 'Unable to connect to GitHub. Please check your connection and retry.'
          : isNoResults
          ? 'Try adjusting your search terms or clearing visibility filters.'
          : 'Ensure your GitHub account has repositories connected.'}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {isNoResults && onClearSearch && (
          <motion.button
            type="button"
            onClick={onClearSearch}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10 transition-colors"
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
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:bg-neutral-100 flex items-center gap-1.5 transition-all shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </motion.button>
            )}

            <a
              href="/api/auth/github"
              className="px-4 py-2 rounded-xl text-xs font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/25 flex items-center gap-1.5 transition-colors"
            >
              <span>Reconnect GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </>
        )}
      </div>
    </motion.div>
  );
}
