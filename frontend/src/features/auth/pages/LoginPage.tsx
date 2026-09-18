import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, Loader2, Check, AlertCircle } from 'lucide-react';
import { useAuthForm } from '../hooks/useAuthForm';
import { OAuthButtons } from '../components/OAuthButtons';
import { AuthInput } from '../components/AuthInput';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    formData,
    errors,
    submitStatus,
    statusMessage,
    showPassword,
    providerStates,
    oauthError,
    connectOAuth,
    isConnecting,
    setFieldValue,
    setFieldTouched,
    togglePasswordVisibility,
    handleSubmit,
  } = useAuthForm('login');

  // Read email from location state if passed during navigation
  useEffect(() => {
    const emailParam = (location.state as any)?.email;
    if (emailParam && !formData.email) {
      setFieldValue('email', emailParam);
    }
  }, [location.state, setFieldValue, formData.email]);

  const isSubmitting = submitStatus === 'loading' || submitStatus === 'redirecting' || isConnecting;
  const isSuccess = submitStatus === 'success';

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  const handleSwitchToRegister = () => {
    navigate('/register', {
      state: { email: formData.email },
    });
  };

  return (
    <motion.div
      layout="position"
      onMouseMove={handleCardMouseMove}
      className="spotlight-card auth-glass-card w-full rounded-2xl p-4 sm:p-5 transition-colors duration-200"
    >
      {/* Tab Switcher */}
      <div className="relative mb-3">
        <div className="relative flex p-1 rounded-xl bg-[#090B0E]/90 border border-white/[0.08] font-mono text-xs w-full select-none shadow-inner">
          <button
            type="button"
            className="relative flex-1 py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 text-white transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan"
          >
            <motion.div
              layoutId="auth-tab-indicator"
              className="absolute inset-0 rounded-lg bg-white/[0.09] border border-white/15 shadow-[0_2px_10px_rgba(0,0,0,0.5)] backdrop-blur-md"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
            <span className="relative z-10 flex items-center gap-1.5">
              <LogIn className="w-3.5 h-3.5 text-accent-cyan" />
              <span>Sign In</span>
            </span>
          </button>

          <button
            type="button"
            onClick={handleSwitchToRegister}
            disabled={isSubmitting}
            className="relative flex-1 py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 text-neutral-400 hover:text-neutral-200 transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-neutral-500" />
              <span>Create Account</span>
            </span>
          </button>
        </div>
      </div>

      {/* Card Header */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans">
            Welcome back
          </h1>
          <p className="text-[11px] text-neutral-400 mt-0.5 font-mono">
            Authenticate to access your DeployForge cloud console.
          </p>
        </div>
        <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent-emerald/10 border border-accent-emerald/20 text-[10px] font-mono text-accent-emerald shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
          <span>TLS 1.3</span>
        </div>
      </div>

      {/* OAuth Handshake Buttons */}
      <OAuthButtons
        mode="login"
        providerStates={providerStates}
        oauthError={oauthError}
        onConnect={connectOAuth}
        disabled={isSubmitting}
      />

      {/* Divider */}
      <div className="relative my-2.5 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/[0.08]" />
        </div>
        <div className="relative px-2.5 bg-[#0B0D10] flex items-center gap-1.5 text-[9px] font-mono tracking-wider text-neutral-500 uppercase select-none rounded-full border border-white/[0.08] py-0.5 shadow-sm">
          <span className="w-1 h-1 rounded-full bg-accent-cyan shadow-[0_0_4px_#00F0FF]" />
          <span>or email</span>
        </div>
      </div>

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

      {/* Primary Login Form */}
      <form
        onSubmit={(e) =>
          handleSubmit(e, (url) => {
            navigate(url);
          })
        }
        noValidate
        className="space-y-2.5"
      >
        {/* Email Field */}
        <AuthInput
          label="Work Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={(val) => setFieldValue('email', val)}
          onBlur={() => setFieldTouched('email')}
          placeholder="developer@company.io"
          autoComplete="email"
          error={errors.email}
          required
          disabled={isSubmitting}
        />

        {/* Password Field */}
        <AuthInput
          label="Master Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={(val) => setFieldValue('password', val)}
          onBlur={() => setFieldTouched('password')}
          placeholder="••••••••••••"
          autoComplete="current-password"
          error={errors.password}
          showPasswordToggle
          isPasswordVisible={showPassword}
          onTogglePasswordVisibility={togglePasswordVisibility}
          required
          disabled={isSubmitting}
        />

        {/* Status Feedback Notice */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-2 rounded-xl text-xs font-mono flex items-center gap-2 ${
                isSuccess
                  ? 'bg-accent-emerald/[0.1] text-accent-emerald border border-accent-emerald/25'
                  : 'bg-white/[0.04] text-neutral-300 border border-white/[0.08]'
              }`}
            >
              {isSuccess ? (
                <Check className="w-3.5 h-3.5 text-accent-emerald" />
              ) : (
                <Loader2 className="w-3.5 h-3.5 text-accent-cyan animate-spin" />
              )}
              <span className="text-[11px]">{statusMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.985 }}
          className={`btn-sweep relative w-full py-2.5 rounded-xl text-xs font-semibold tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all duration-200 select-none overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan ${
            isSuccess
              ? 'bg-accent-emerald text-black shadow-accent-emerald/25'
              : 'bg-white text-black hover:bg-neutral-100 shadow-[0_0_25px_rgba(255,255,255,0.15)]'
          } ${isSubmitting ? 'opacity-80 cursor-wait' : ''}`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
              <span>Authenticating Session...</span>
            </>
          ) : isSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-black" />
              <span>Authenticated</span>
            </>
          ) : (
            <>
              <LogIn className="w-3.5 h-3.5" />
              <span>Authenticate Session</span>
            </>
          )}
        </motion.button>
      </form>

      {/* Bottom Switcher */}
      <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
        <span className="text-neutral-500">Need a developer account?</span>
        <button
          type="button"
          onClick={handleSwitchToRegister}
          className="text-accent-cyan hover:underline underline-offset-2 flex items-center gap-1 transition-colors"
        >
          <span>Create account</span>
          <UserPlus className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}
