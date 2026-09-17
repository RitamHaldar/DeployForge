import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, ArrowLeft, Loader2, Check, Lock, ShieldCheck, AlertCircle, CornerDownLeft } from 'lucide-react';
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
      layout="position"
      onMouseMove={handleCardMouseMove}
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="spotlight-card auth-glass-card w-full rounded-2xl p-4 sm:p-5 transition-colors duration-200"
    >
      {/* Tab Switcher (Visible in Login & Register modes) */}
      {mode !== 'forgot-password' ? (
        <div className="relative mb-3">
          <div className="relative flex p-1 rounded-xl bg-[#090B0E]/90 border border-white/[0.08] font-mono text-xs w-full select-none shadow-inner">
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
                  className="absolute inset-0 rounded-lg bg-white/[0.09] border border-white/15 shadow-[0_2px_10px_rgba(0,0,0,0.5)] backdrop-blur-md"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <LogIn className={`w-3.5 h-3.5 transition-colors ${mode === 'login' ? 'text-accent-cyan' : 'text-neutral-500'}`} />
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
                  className="absolute inset-0 rounded-lg bg-white/[0.09] border border-white/15 shadow-[0_2px_10px_rgba(0,0,0,0.5)] backdrop-blur-md"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <UserPlus className={`w-3.5 h-3.5 transition-colors ${mode === 'register' ? 'text-accent-cyan' : 'text-neutral-500'}`} />
                <span>Create Account</span>
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* Dedicated Forgot Password Top Return Control */
        <div className="mb-3">
          <motion.button
            type="button"
            onClick={() => onSwitchMode('login')}
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.97 }}
            className="text-[11px] font-mono text-neutral-400 hover:text-accent-cyan transition-colors inline-flex items-center gap-1.5 group focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan rounded px-2 py-0.5 bg-white/[0.02] border border-white/[0.06]"
          >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to sign in</span>
          </motion.button>
        </div>
      )}

      {/* Card Heading / Subtitle with AnimatePresence */}
      <div className="mb-3">
        <AnimatePresence mode="wait">
          {mode === 'login' && (
            <motion.div
              key="login-heading"
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans">
                Welcome back
              </h1>
              <p className="text-[11px] text-neutral-400 mt-0.5 font-mono">
                Authenticate to access your DeployForge cloud console.
              </p>
            </motion.div>
          )}

          {mode === 'register' && (
            <motion.div
              key="register-heading"
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans">
                Deploy with confidence
              </h1>
              <p className="text-[11px] text-neutral-400 mt-0.5 font-mono">
                Spin up autonomous, self-healing infrastructure in seconds.
              </p>
            </motion.div>
          )}

          {mode === 'forgot-password' && (
            <motion.div
              key="forgot-heading"
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans">
                Account Recovery
              </h1>
              <p className="text-[11px] text-neutral-400 mt-0.5 font-mono">
                Enter your verified developer email for a reset token.
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
          <div className="relative my-2.5 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]" />
            </div>
            <div className="relative px-2.5 bg-[#0B0D10] flex items-center gap-1.5 text-[9px] font-mono tracking-wider text-neutral-500 uppercase select-none rounded-full border border-white/[0.08] py-0.5 shadow-sm">
              <span className="w-1 h-1 rounded-full bg-accent-cyan shadow-[0_0_4px_#00F0FF]" />
              <span>or email</span>
            </div>
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
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mb-2 text-xs font-mono text-accent-rose flex items-start gap-1.5 p-2 rounded-xl bg-accent-rose/[0.08] border border-accent-rose/25 overflow-hidden"
            role="alert"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-accent-rose" />
            <span className="leading-tight text-[11px]">{errors.general}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Authentication Form */}
      <form onSubmit={onSubmit} noValidate className="space-y-2.5">
        {/* Username Field (Smooth expansion in Register mode) */}
        <AnimatePresence initial={false}>
          {mode === 'register' && (
            <motion.div
              key="username-field-container"
              initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
              animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <AuthInput
                label="Username"
                name="username"
                type="text"
                value={formData.username}
                onChange={(val) => onFieldChange('username', val)}
                onBlur={() => onFieldBlur('username')}
                placeholder="architect_zero"
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
          label="Work Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={(val) => onFieldChange('email', val)}
          onBlur={() => onFieldBlur('email')}
          placeholder="alex@enterprise.cloud"
          autoComplete="email"
          error={errors.email}
          isValid={isEmailValid}
          required
          disabled={isSubmitting}
        />

        {/* Password Field & Recovery Action */}
        {mode !== 'forgot-password' && (
          <div className="space-y-1.5">
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
                    className="text-[10px] font-mono text-neutral-400 hover:text-accent-cyan transition-colors underline-offset-2 hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan rounded"
                  >
                    Forgot password?
                  </button>
                ) : undefined
              }
              required
              disabled={isSubmitting}
            />

            {/* Interactive Password Strength Meter & Checklist */}
            <AnimatePresence initial={false}>
              {mode === 'register' && formData.password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                  exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <PasswordStrengthBar
                    strength={passwordStrength}
                    password={formData.password}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Primary Submit Action Button */}
        <div className="pt-1">
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={!isSubmitting ? { y: -1, scale: 1.01 } : {}}
            whileTap={!isSubmitting ? { scale: 0.985 } : {}}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`btn-sweep relative w-full py-2 px-3 rounded-xl font-semibold text-xs tracking-tight transition-all duration-200 flex items-center justify-center gap-2 h-9 sm:h-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan disabled:cursor-wait ${
              isSuccess
                ? 'bg-accent-emerald text-black shadow-[0_0_24px_rgba(16,185,129,0.35)]'
                : 'bg-white hover:bg-neutral-100 text-black shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.22)]'
            }`}
          >
            {submitStatus === 'loading' && (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-black shrink-0" />
                <span className="font-mono text-xs">
                  {mode === 'login'
                    ? 'Authenticating...'
                    : mode === 'register'
                    ? 'Provisioning...'
                    : 'Dispatching...'}
                </span>
              </>
            )}

            {submitStatus === 'success' && (
              <>
                <Check className="w-3.5 h-3.5 text-black stroke-[2.8] shrink-0" />
                <span className="font-mono text-xs">{statusMessage || 'Authenticated'}</span>
              </>
            )}

            {submitStatus === 'redirecting' && (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-black shrink-0" />
                <span className="font-mono text-xs">{statusMessage}</span>
              </>
            )}

            {submitStatus !== 'loading' &&
              submitStatus !== 'success' &&
              submitStatus !== 'redirecting' && (
                <span className="flex items-center gap-1.5">
                  <span>
                    {mode === 'login'
                      ? 'Sign in to Console'
                      : mode === 'register'
                      ? 'Create Developer Account'
                      : 'Send Recovery Link'}
                  </span>
                  <CornerDownLeft className="w-3 h-3 text-neutral-500" />
                </span>
              )}
          </motion.button>
        </div>
      </form>

      {/* Bottom Mode Switch Prompt */}
      <div className="mt-3 text-center select-none font-mono text-[11px]">
        {mode === 'login' && (
          <p className="text-neutral-400">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => onSwitchMode('register')}
              className="text-white hover:text-accent-cyan font-medium transition-colors ml-0.5 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan rounded"
            >
              Create one now
            </button>
          </p>
        )}

        {mode === 'register' && (
          <p className="text-neutral-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onSwitchMode('login')}
              className="text-white hover:text-accent-cyan font-medium transition-colors ml-0.5 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan rounded"
            >
              Sign in
            </button>
          </p>
        )}

        {mode === 'forgot-password' && (
          <p className="text-neutral-400">
            Remembered your credentials?{' '}
            <button
              type="button"
              onClick={() => onSwitchMode('login')}
              className="text-white hover:text-accent-cyan font-medium transition-colors ml-0.5 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan rounded"
            >
              Back to sign in
            </button>
          </p>
        )}
      </div>

      {/* Infrastructure Security Badge */}
      <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-neutral-500">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3 h-3 text-neutral-400" />
          <span>TLS 1.3 · End-to-End</span>
        </div>
        <div className="flex items-center gap-1.5 text-neutral-400">
          <ShieldCheck className="w-3 h-3 text-accent-emerald" />
          <span>Watchdog Active</span>
        </div>
      </div>
    </motion.div>
  );
}
