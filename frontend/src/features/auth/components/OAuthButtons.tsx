import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import type { OAuthProvider, OAuthState } from '../types';

interface OAuthButtonsProps {
  mode: 'login' | 'register' | 'forgot-password';
  providerStates: Record<OAuthProvider, OAuthState>;
  oauthError: string | null;
  onConnect: (provider: OAuthProvider) => void;
  disabled?: boolean;
}

function GitHubMark({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function GoogleMark({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#EA4335"
        d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
      />
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
      />
      <path
        fill="#FBBC05"
        d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
      />
      <path
        fill="#34A853"
        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.4 7.5 23 12 23z"
      />
    </svg>
  );
}

export function OAuthButtons({
  mode,
  providerStates,
  oauthError,
  onConnect,
  disabled = false
}: OAuthButtonsProps) {
  const isGithubLoading =
    providerStates.github === 'connecting' || providerStates.github === 'redirecting';
  const isGoogleLoading =
    providerStates.google === 'connecting' || providerStates.google === 'redirecting';

  const actionText = mode === 'register' ? 'Sign up' : 'Continue';

  return (
    <div className="space-y-2.5">
      {/* Dual OAuth Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* GitHub OAuth Button */}
        <motion.button
          type="button"
          onClick={() => onConnect('github')}
          disabled={disabled || isGithubLoading || isGoogleLoading}
          whileHover={{ y: -1, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`btn-sweep group w-full py-2.5 px-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-neutral-200 hover:text-white flex items-center justify-center gap-2.5 font-medium text-xs sm:text-sm shadow-sm transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan disabled:opacity-50 disabled:cursor-not-allowed ${
            providerStates.github === 'error' ? 'border-accent-rose/40' : ''
          }`}
          aria-label={`${actionText} with GitHub`}
        >
          {isGithubLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-accent-cyan shrink-0" />
              <span className="text-xs truncate">
                {providerStates.github === 'redirecting' ? 'Redirecting...' : 'Connecting...'}
              </span>
            </>
          ) : (
            <>
              <GitHubMark className="w-4 h-4 text-white shrink-0 group-hover:scale-105 transition-transform duration-200" />
              <span className="truncate">{actionText} with GitHub</span>
            </>
          )}
        </motion.button>

        {/* Google OAuth Button */}
        <motion.button
          type="button"
          onClick={() => onConnect('google')}
          disabled={disabled || isGithubLoading || isGoogleLoading}
          whileHover={{ y: -1, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`btn-sweep group w-full py-2.5 px-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-neutral-200 hover:text-white flex items-center justify-center gap-2.5 font-medium text-xs sm:text-sm shadow-sm transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan disabled:opacity-50 disabled:cursor-not-allowed ${
            providerStates.google === 'error' ? 'border-accent-rose/40' : ''
          }`}
          aria-label={`${actionText} with Google`}
        >
          {isGoogleLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-accent-cyan shrink-0" />
              <span className="text-xs truncate">
                {providerStates.google === 'redirecting' ? 'Redirecting...' : 'Connecting...'}
              </span>
            </>
          ) : (
            <>
              <GoogleMark className="w-4 h-4 shrink-0 group-hover:scale-105 transition-transform duration-200" />
              <span className="truncate">{actionText} with Google</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Inline OAuth Error with AnimatePresence */}
      <AnimatePresence>
        {oauthError && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.2 }}
            className="text-[11px] font-mono text-accent-rose flex items-start gap-1.5 p-2 rounded-lg bg-accent-rose/[0.06] border border-accent-rose/20"
            role="alert"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{oauthError}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
