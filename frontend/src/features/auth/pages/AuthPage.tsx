import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, Loader2, Check, AlertCircle } from 'lucide-react';
import { AuthHeader } from '../components/AuthHeader';
import { AuthFooter } from '../components/AuthFooter';
import { AuthShowcase } from '../components/AuthShowcase';
import { AmbientParticleCanvas } from '../components/AmbientParticleCanvas';
import { OAuthButtons } from '../components/OAuthButtons';
import { AuthInput } from '../components/AuthInput';
import { PasswordStrengthBar } from '../components/PasswordStrengthBar';
import { useAuthForm } from '../hooks/useAuthForm';
import type { AuthMode } from '../types';

interface AuthPageProps {
  initialMode?: AuthMode;
}

export function AuthPage({ initialMode }: AuthPageProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Derive current mode directly from location without unnecessary effect setState
  const isRegister = location.pathname.includes('/register');
  const mode: AuthMode = isRegister ? 'register' : (initialMode || 'login');
  const [rememberMe, setRememberMe] = useState(false);

  const switchMode = (newMode: AuthMode) => {
    const targetUrl = newMode === 'register' ? '/register' : '/login';
    if (location.pathname !== targetUrl) {
      navigate(targetUrl, { replace: true, state: location.state });
    }
  };

  // Form handling hook
  const {
    formData,
    errors,
    submitStatus,
    statusMessage,
    showPassword,
    passwordStrength,
    providerStates,
    oauthError,
    connectOAuth,
    isConnecting,
    setFieldValue,
    setFieldTouched,
    togglePasswordVisibility,
    handleSubmit,
  } = useAuthForm(mode);

  // Read email from location state if passed during navigation
  useEffect(() => {
    const emailParam = (location.state as any)?.email;
    if (emailParam && !formData.email) {
      setFieldValue('email', emailParam);
    }
  }, [location.state, setFieldValue, formData.email]);

  const isSubmitting = submitStatus === 'loading' || submitStatus === 'redirecting' || isConnecting;
  const isSuccess = submitStatus === 'success';

  // Dual Hardware-Accelerated Lerped Cursor Ambient Follower
  const lightRef = useRef<HTMLDivElement | null>(null);
  const secondaryLightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const lightEl = lightRef.current;
    const secondaryLightEl = secondaryLightRef.current;
    if (!lightEl) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let secX = targetX;
    let secY = targetY;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const updateLights = () => {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      lightEl.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;

      if (secondaryLightEl) {
        secX += (targetX - secX) * 0.035;
        secY += (targetY - secY) * 0.035;
        secondaryLightEl.style.transform = `translate3d(${secX}px, ${secY}px, 0) translate(-50%, -50%)`;
      }

      rafId = requestAnimationFrame(updateLights);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    rafId = requestAnimationFrame(updateLights);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const handleReturnHome = () => {
    navigate('/');
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <div className="relative min-h-screen lg:h-screen lg:max-h-screen bg-[#070809] text-[#F5F5F5] flex flex-col justify-between overflow-x-hidden lg:overflow-hidden selection:bg-cyan-500/20 selection:text-cyan-400">
      {/* Primary Cyan Ambient Follower Light */}
      <div
        ref={lightRef}
        className="pointer-events-none fixed top-0 left-0 w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-cyan-500/[0.04] via-blue-500/[0.03] to-transparent blur-[100px] opacity-70 z-0 will-change-transform"
        aria-hidden="true"
      />

      {/* Secondary Indigo Ambient Follower Light */}
      <div
        ref={secondaryLightRef}
        className="pointer-events-none fixed top-0 left-0 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-indigo-500/[0.025] to-transparent blur-[120px] opacity-50 z-0 will-change-transform"
        aria-hidden="true"
      />

      {/* Subtle Architectural Grid Pattern */}
      <div className="fixed inset-0 bg-tech-grid opacity-35 pointer-events-none z-0" aria-hidden="true" />

      {/* Ambient background noise overlay */}
      <div className="fixed inset-0 bg-noise pointer-events-none z-0 opacity-80" aria-hidden="true" />

      {/* Persistent Ambient Particle Canvas */}
      <AmbientParticleCanvas />

      {/* Top Header */}
      <AuthHeader onBackToHome={handleReturnHome} />

      {/* Main Panoramic Single-Page Hub */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-2 sm:py-4 min-h-0">
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-8 xl:gap-14">
          
          {/* Left Wing: Platform Showcase (Visible on lg+ screens) */}
          <AuthShowcase />

          {/* Right Wing: Master Auth Card with Fluid Mode Transitions */}
          <div className="w-full max-w-[420px] xl:max-w-[440px] shrink-0">
            <motion.div
              layout="size"
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              onMouseMove={handleCardMouseMove}
              className="spotlight-card relative rounded-2xl bg-[#0B0D11]/90 backdrop-blur-2xl border border-white/[0.08] shadow-[0_24px_64px_-12px_rgba(0,0,0,0.85)] p-5 sm:p-6 transition-colors duration-200"
            >
              {/* Persistent Seamless Tab Switcher */}
              <div className="relative mb-4 p-1 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center select-none">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  disabled={isSubmitting}
                  className={`relative flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 disabled:opacity-50 ${
                    !isRegister ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {!isRegister && (
                    <motion.div
                      layoutId="auth-tab-active-indicator"
                      className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/10 shadow-sm"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-1.5">
                    <LogIn className={`w-3.5 h-3.5 transition-colors ${!isRegister ? 'text-cyan-400' : 'text-neutral-500'}`} />
                    <span>Sign In</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  disabled={isSubmitting}
                  className={`relative flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 disabled:opacity-50 ${
                    isRegister ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {isRegister && (
                    <motion.div
                      layoutId="auth-tab-active-indicator"
                      className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/10 shadow-sm"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-1.5">
                    <UserPlus className={`w-3.5 h-3.5 transition-colors ${isRegister ? 'text-cyan-400' : 'text-neutral-500'}`} />
                    <span>Create Account</span>
                  </span>
                </button>
              </div>

              {/* Dynamic Sliding Content View */}
              <div className="relative overflow-hidden w-full">
                <AnimatePresence mode="popLayout" initial={false} custom={isRegister ? 1 : -1}>
                  <motion.div
                    key={isRegister ? 'register' : 'login'}
                    custom={isRegister ? 1 : -1}
                    variants={{
                      enter: (direction: number) => ({
                        x: direction > 0 ? 24 : -24,
                        opacity: 0,
                        filter: 'blur(3px)',
                      }),
                      center: {
                        x: 0,
                        opacity: 1,
                        filter: 'blur(0px)',
                      },
                      exit: (direction: number) => ({
                        x: direction > 0 ? -24 : 24,
                        opacity: 0,
                        filter: 'blur(3px)',
                      }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'spring', stiffness: 400, damping: 34 },
                      opacity: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
                      filter: { duration: 0.18 },
                    }}
                    className="w-full"
                  >
                    {/* Header Text */}
                    <div className="mb-4">
                      <h1 className="text-xl font-semibold tracking-tight text-white">
                        {isRegister ? 'Create an account' : 'Welcome back'}
                      </h1>
                      <p className="text-xs text-neutral-400 mt-1">
                        {isRegister
                          ? 'Get started with DeployForge in seconds.'
                          : 'Enter your credentials to access your account.'}
                      </p>
                    </div>

                    {/* OAuth Handshake Buttons */}
                    <OAuthButtons
                      mode={mode}
                      providerStates={providerStates}
                      oauthError={oauthError}
                      onConnect={connectOAuth}
                      disabled={isSubmitting}
                    />

                    {/* Subtle Divider */}
                    <div className="relative my-3.5 flex items-center justify-center">
                      <div className="w-full border-t border-white/[0.08]" />
                      <span className="absolute px-3 bg-[#0B0D11] text-[11px] text-neutral-500 font-medium">
                        or continue with email
                      </span>
                    </div>

                    {/* Form Error Banner */}
                    <AnimatePresence>
                      {errors.general && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: -6, height: 0 }}
                          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                          className="mb-3 text-xs text-rose-400 flex items-start gap-2 p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/30 overflow-hidden"
                          role="alert"
                        >
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                          <span className="leading-snug">{errors.general}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Unified Form Element */}
                    <form
                      onSubmit={(e) =>
                        handleSubmit(e, (url) => {
                          navigate(url);
                        })
                      }
                      noValidate
                      className="space-y-3"
                    >
                      {/* Register: Username Field */}
                      {isRegister && (
                        <AuthInput
                          label="Username"
                          name="username"
                          type="text"
                          value={formData.username}
                          onChange={(val) => setFieldValue('username', val)}
                          onBlur={() => setFieldTouched('username')}
                          placeholder="johndoe"
                          autoComplete="username"
                          error={errors.username}
                          required
                          disabled={isSubmitting}
                        />
                      )}

                      {/* Email / Username Field */}
                      <AuthInput
                        label={isRegister ? 'Email address' : 'Email or username'}
                        name="email"
                        type={isRegister ? 'email' : 'text'}
                        value={formData.email}
                        onChange={(val) => setFieldValue('email', val)}
                        onBlur={() => setFieldTouched('email')}
                        placeholder={isRegister ? 'name@example.com' : 'name@example.com or username'}
                        autoComplete={isRegister ? 'email' : 'username'}
                        error={errors.email}
                        required
                        disabled={isSubmitting}
                      />

                      {/* Register: Mobile Number Field */}
                      {isRegister && (
                        <AuthInput
                          label="Mobile number"
                          name="mobileNumber"
                          type="tel"
                          value={formData.mobileNumber || ''}
                          onChange={(val) => setFieldValue('mobileNumber', val)}
                          onBlur={() => setFieldTouched('mobileNumber')}
                          countryCode={formData.countryCode || '+1'}
                          onCountryCodeChange={(code) => setFieldValue('countryCode', code)}
                          placeholder="(555) 000-0000"
                          autoComplete="tel"
                          error={errors.mobile}
                          required
                          disabled={isSubmitting}
                        />
                      )}

                      {/* Password Field */}
                      <AuthInput
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={(val) => setFieldValue('password', val)}
                        onBlur={() => setFieldTouched('password')}
                        placeholder={isRegister ? 'Create a password' : 'Enter your password'}
                        autoComplete={isRegister ? 'new-password' : 'current-password'}
                        error={errors.password}
                        showPasswordToggle
                        isPasswordVisible={showPassword}
                        onTogglePasswordVisibility={togglePasswordVisibility}
                        required
                        disabled={isSubmitting}
                        rightLabelAction={
                          !isRegister ? (
                            <a
                              href="#"
                              onClick={(e) => e.preventDefault()}
                              className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
                            >
                              Forgot password?
                            </a>
                          ) : undefined
                        }
                      />

                      {/* Register: Password Strength Indicator */}
                      {isRegister && (
                        <PasswordStrengthBar
                          strength={passwordStrength}
                          password={formData.password}
                        />
                      )}

                      {/* Login: Remember Me */}
                      {!isRegister && (
                        <div className="flex items-center justify-between pt-0.5">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              disabled={isSubmitting}
                              className="w-3.5 h-3.5 rounded border border-white/20 bg-white/5 text-cyan-500 focus:ring-1 focus:ring-cyan-400 focus:ring-offset-0 cursor-pointer accent-cyan-400"
                            />
                            <span className="text-xs text-neutral-400 hover:text-neutral-300 transition-colors">
                              Remember me
                            </span>
                          </label>
                        </div>
                      )}

                      {/* Status Message Notice */}
                      <AnimatePresence>
                        {statusMessage && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                              isSuccess
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                                : 'bg-white/[0.04] text-neutral-300 border border-white/[0.08]'
                            }`}
                          >
                            {isSuccess ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                            )}
                            <span>{statusMessage}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Submit Button */}
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={isSubmitting ? {} : { y: -1 }}
                        whileTap={isSubmitting ? {} : { scale: 0.985 }}
                        transition={{ duration: 0.15 }}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold tracking-normal flex items-center justify-center gap-2 transition-all duration-200 select-none shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 ${
                          isSuccess
                            ? 'bg-emerald-500 text-black shadow-emerald-500/20'
                            : 'bg-white text-black hover:bg-neutral-100 shadow-[0_0_20px_rgba(255,255,255,0.12)]'
                        } ${isSubmitting ? 'opacity-80 cursor-wait' : ''}`}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-black" />
                            <span>{isRegister ? 'Creating account...' : 'Signing in...'}</span>
                          </>
                        ) : isSuccess ? (
                          <>
                            <Check className="w-4 h-4 text-black" />
                            <span>{isRegister ? 'Account Created' : 'Signed In'}</span>
                          </>
                        ) : (
                          <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                        )}
                      </motion.button>
                    </form>

                    {/* Bottom Switcher */}
                    <div className="mt-3.5 pt-3 border-t border-white/[0.06] text-center text-xs">
                      <span className="text-neutral-400">
                        {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                      </span>
                      <button
                        type="button"
                        onClick={() => switchMode(isRegister ? 'login' : 'register')}
                        className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline transition-colors ml-0.5"
                      >
                        {isRegister ? 'Sign in' : 'Sign up'}
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Legal and Privacy Disclaimer */}
            <p className="mt-3 text-center text-[11px] text-neutral-500 leading-normal px-4">
              By continuing, you agree to DeployForge's{' '}
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-neutral-400 hover:text-white underline underline-offset-2 transition-colors"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-neutral-400 hover:text-white underline underline-offset-2 transition-colors"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>

        </div>
      </main>

      {/* Bottom Footer */}
      <AuthFooter />
    </div>
  );
}
