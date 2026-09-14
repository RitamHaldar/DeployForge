import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, ArrowLeft, Loader2, Check, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import type { AuthMode, OAuthProvider, OAuthState, PasswordStrengthInfo, SubmitStatus, ValidationErrors, AuthFormData } from '../types';
import { OAuthButtons } from './OAuthButtons';
import { AuthInput } from './AuthInput';
import { PasswordStrengthBar } from './PasswordStrengthBar';

interface AuthCardProps {
  mode: AuthMode;
  formData: AuthFormData;
  errors: ValidationErrors;
  submitStatus: SubmitStatus;
  statusMessage: string;
  showPassword: boolean;
  isEmailValid: boolean;
  passwordStrength: PasswordStrengthInfo;
  providerStates: Record<OAuthProvider, OAuthState>;
  oauthError: string | null;
  onFieldChange: (field: keyof AuthFormData, value: string) => void;
  onFieldBlur: (field: keyof AuthFormData) => void;
  onTogglePasswordVisibility: () => void;
  onSwitchMode: (mode: AuthMode) => void;
  onSubmit: (e: React.FormEvent) => void;
  onOAuthConnect: (provider: OAuthProvider) => void;
}

export function AuthCard({
  mode,
  formData,
  errors,
  submitStatus,
  statusMessage,
  showPassword,
  isEmailValid,
  passwordStrength,
  providerStates,
  oauthError,
  onFieldChange,
  onFieldBlur,
  onTogglePasswordVisibility,
  onSwitchMode,
  onSubmit,
  onOAuthConnect
}: AuthCardProps) {
  const isSubmitting = submitStatus === 'loading' || submitStatus === 'redirecting';
  const isSuccess = submitStatus === 'success';

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <motion.div
      layout
      onMouseMove={handleCardMouseMove}
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="spotlight-card auth-glass-card w-full rounded-2xl p-6 sm:p-8 transition-colors duration-200"
    >
      {/* Tab Switcher (Visible in Login & Register modes) */}
      {mode !== 'forgot-password' ? (
        <div className="relative mb-6">
          <div className="relative flex p-1 rounded-xl bg-surface-100/90 border border-white/[0.06] font-mono text-xs w-full select-none">
            <button
              type="button"
              onClick={() => onSwitchMode('login')}
              disabled={isSubmitting}
              className={`relative flex-1 py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan ${
                mode === 'login'
                  ? 'text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {mode === 'login' && (
                <motion.div
                  layoutId="active-auth-tab"
                  className="absolute inset-0 rounded-lg bg-surface-200 border border-white/10 shadow-sm"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <LogIn className={`w-3.5 h-3.5 ${mode === 'login' ? 'text-accent-cyan' : ''}`} />
                <span>Sign In</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSwitchMode('register')}
              disabled={isSubmitting}
              className={`relative flex-1 py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan ${
                mode === 'register'
                  ? 'text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {mode === 'register' && (
                <motion.div
                  layoutId="active-auth-tab"
                  className="absolute inset-0 rounded-lg bg-surface-200 border border-white/10 shadow-sm"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <UserPlus className={`w-3.5 h-3.5 ${mode === 'register' ? 'text-accent-cyan' : ''}`} />
                <span>Create Account</span>
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* Dedicated Forgot Password Top Return Control */
        <div className="mb-6">
          <button
            type="button"
            onClick={() => onSwitchMode('login')}
            className="text-xs font-mono text-neutral-400 hover:text-accent-cyan transition-colors inline-flex items-center gap-1.5 group focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan rounded py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to sign in</span>
          </button>
        </div>
      )}

      {/* Card Heading / Subtitle with AnimatePresence */}
      <div className="mb-6">
        <AnimatePresence mode="wait">
          {mode === 'login' && (
            <motion.div
              key="login-heading"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
            >
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
                Welcome back
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Sign in to continue to your DeployForge infrastructure.
              </p>
            </motion.div>
          )}

          {mode === 'register' && (
            <motion.div
              key="register-heading"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
            >
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
                Create developer account
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Start deploying with infrastructure that watches itself.
              </p>
            </motion.div>
          )}

          {mode === 'forgot-password' && (
            <motion.div
              key="forgot-heading"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
            >
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
                Reset your password
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Enter your verified email and we'll dispatch a secure recovery link.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dual GitHub and Google OAuth Buttons (Active in both Login and Register) */}
      {mode !== 'forgot-password' && (
        <>
          <OAuthButtons
            mode={mode}
            providerStates={providerStates}
            oauthError={oauthError}
            onConnect={onOAuthConnect}
            disabled={isSubmitting}
          />

          {/* Infrastructure Hairline Divider */}
          <div className="relative my-5 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]" />
            </div>
            <span className="relative px-3 bg-[#0c0e12] text-[10px] font-mono tracking-wider text-neutral-500 uppercase select-none">
              or continue with email
            </span>
          </div>
        </>
      )}

      {/* Form Error Banner */}
      <AnimatePresence>
        {errors.general && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-4 text-xs font-mono text-accent-rose flex items-start gap-2 p-3 rounded-xl bg-accent-rose/[0.06] border border-accent-rose/20"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errors.general}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Authentication Form */}
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {/* Username Field (Smooth expansion in Register mode) */}
        <AnimatePresence initial={false}>
          {mode === 'register' && (
            <motion.div
              key="username-field-container"
              initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
              animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <AuthInput
                label="Username"
                name="username"
                type="text"
                value={formData.username}
                onChange={(val) => onFieldChange('username', val)}
                onBlur={() => onFieldBlur('username')}
                placeholder="developer_zero"
                autoComplete="username"
                error={errors.username}
                rightStaticBadge="@"
                required
                disabled={isSubmitting}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email Field */}
        <AuthInput
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={(val) => onFieldChange('email', val)}
          onBlur={() => onFieldBlur('email')}
          placeholder="alex@acme-corp.com"
          autoComplete="email"
          error={errors.email}
          isValid={isEmailValid}
          rightLabelAction={
            mode === 'register' ? (
              <span className="font-mono text-[10px] text-neutral-500">work email preferred</span>
            ) : undefined
          }
          required
          disabled={isSubmitting}
        />

        {/* Password Field & Recovery Action */}
        {mode !== 'forgot-password' && (
          <div className="space-y-2">
            <AuthInput
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={(val) => onFieldChange('password', val)}
              onBlur={() => onFieldBlur('password')}
              placeholder="••••••••••••"
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              error={errors.password}
              showPasswordToggle
              isPasswordVisible={showPassword}
              onTogglePasswordVisibility={onTogglePasswordVisibility}
              rightLabelAction={
                mode === 'login' ? (
                  <button
                    type="button"
                    onClick={() => onSwitchMode('forgot-password')}
                    className="text-[11px] text-neutral-400 hover:text-accent-cyan transition-colors underline-offset-4 hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan rounded"
                  >
                    Forgot password?
                  </button>
                ) : undefined
              }
              required
              disabled={isSubmitting}
            />

            {/* Password Strength Meter (Smooth expansion in Register mode) */}
            <AnimatePresence initial={false}>
              {mode === 'register' && formData.password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                  exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <PasswordStrengthBar strength={passwordStrength} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Primary Submit Action Button (Preserves Dimension Across States) */}
        <div className="pt-2">
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={!isSubmitting ? { y: -1, scale: 1.01 } : {}}
            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`btn-sweep w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm tracking-tight transition-all duration-200 flex items-center justify-center gap-2 h-11 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan disabled:cursor-wait ${
              isSuccess
                ? 'bg-emerald-500 text-black shadow-[0_0_24px_rgba(16,185,129,0.3)]'
                : 'bg-white hover:bg-neutral-100 text-black shadow-[0_0_20px_rgba(255,255,255,0.12)] hover:shadow-[0_0_25px_rgba(255,255,255,0.22)]'
            }`}
          >
            {submitStatus === 'loading' && (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black shrink-0" />
                <span>
                  {mode === 'login'
                    ? 'Signing in...'
                    : mode === 'register'
                    ? 'Creating account...'
                    : 'Dispatching link...'}
                </span>
              </>
            )}

            {submitStatus === 'success' && (
              <>
                <Check className="w-4 h-4 text-black stroke-[2.5] shrink-0" />
                <span>{statusMessage || 'Success'}</span>
              </>
            )}

            {submitStatus === 'redirecting' && (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black shrink-0" />
                <span>{statusMessage}</span>
              </>
            )}

            {submitStatus !== 'loading' &&
              submitStatus !== 'success' &&
              submitStatus !== 'redirecting' && (
                <span>
                  {mode === 'login'
                    ? 'Sign in'
                    : mode === 'register'
                    ? 'Create account'
                    : 'Send recovery link'}
                </span>
              )}
          </motion.button>
        </div>
      </form>

      {/* Bottom Mode Switch Prompt */}
      <div className="mt-6 text-center select-none">
        {mode === 'login' && (
          <p className="text-xs text-neutral-400">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => onSwitchMode('register')}
              className="text-white hover:text-accent-cyan font-medium transition-colors ml-0.5 underline-offset-4 hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan rounded"
            >
              Create one
            </button>
          </p>
        )}

        {mode === 'register' && (
          <p className="text-xs text-neutral-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onSwitchMode('login')}
              className="text-white hover:text-accent-cyan font-medium transition-colors ml-0.5 underline-offset-4 hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan rounded"
            >
              Sign in
            </button>
          </p>
        )}

        {mode === 'forgot-password' && (
          <p className="text-xs text-neutral-400">
            Remembered your password?{' '}
            <button
              type="button"
              onClick={() => onSwitchMode('login')}
              className="text-white hover:text-accent-cyan font-medium transition-colors ml-0.5 underline-offset-4 hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan rounded"
            >
              Sign in
            </button>
          </p>
        )}
      </div>

      {/* Honest Infrastructure Security Badge */}
      <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-neutral-500">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-neutral-400" />
          <span>TLS 1.3 · Protected session</span>
        </div>
        <div className="flex items-center gap-1.5 text-neutral-400">
          <ShieldCheck className="w-3.5 h-3.5 text-accent-emerald" />
          <span>Active watchdog</span>
        </div>
      </div>
    </motion.div>
  );
}
