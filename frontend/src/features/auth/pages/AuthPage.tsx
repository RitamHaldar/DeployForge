import { useEffect, useRef, useState, useCallback } from 'react';
import type { AuthMode } from '../types';
import { useAuthForm } from '../hooks/useAuthForm';
import { useOAuth } from '../hooks/useOAuth';
import { AuthCard } from '../components/AuthCard';
import { AuthHeader } from '../components/AuthHeader';
import { AuthFooter } from '../components/AuthFooter';
import { AmbientParticleCanvas } from '../components/AmbientParticleCanvas';
import { InfrastructureSentinel } from '../components/InfrastructureSentinel';

interface AuthPageProps {
  initialMode?: AuthMode;
  onNavigateHome?: () => void;
  onNavigate?: (path: string) => void;
}

export function AuthPage({
  initialMode = 'login',
  onNavigateHome,
  onNavigate
}: AuthPageProps) {
  // Determine mode from query parameter or prop
  const getUrlMode = useCallback((): AuthMode => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const m = params.get('mode');
      if (m === 'register') return 'register';
      if (m === 'forgot-password') return 'forgot-password';
      if (window.location.pathname.includes('forgot-password')) return 'forgot-password';
    }
    return initialMode;
  }, [initialMode]);

  const [currentMode, setCurrentMode] = useState<AuthMode>(getUrlMode);

  const {
    formData,
    errors,
    submitStatus,
    statusMessage,
    showPassword,
    isEmailValid,
    passwordStrength,
    setFieldValue,
    setFieldTouched,
    togglePasswordVisibility,
    switchMode: internalSwitchMode,
    handleSubmit
  } = useAuthForm(currentMode);

  const {
    providerStates,
    oauthError,
    connectOAuth
  } = useOAuth();

  // Mode switcher that synchronizes URL cleanly
  const handleSwitchMode = useCallback((newMode: AuthMode) => {
    setCurrentMode(newMode);
    internalSwitchMode(newMode);

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (newMode === 'login') {
        url.searchParams.set('mode', 'login');
      } else if (newMode === 'register') {
        url.searchParams.set('mode', 'register');
      } else {
        url.searchParams.set('mode', 'forgot-password');
      }
      window.history.pushState(null, '', url.pathname + url.search);
    }
  }, [internalSwitchMode]);

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
      // Primary cyan orb
      currentX += (targetX - currentX) * 0.07;
      currentY += (targetY - currentY) * 0.07;
      lightEl.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;

      // Secondary deep indigo/blue orb with softer lag
      if (secondaryLightEl) {
        secX += (targetX - secX) * 0.04;
        secY += (targetY - secY) * 0.04;
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
    if (onNavigateHome) {
      onNavigateHome();
    } else if (onNavigate) {
      onNavigate('/');
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="relative h-screen h-[100dvh] max-h-screen bg-[#070809] text-[#F5F5F5] flex flex-col justify-between overflow-hidden select-none selection:bg-accent-cyan/25 selection:text-accent-cyan">
      {/* Primary Cyan Ambient Follower Light */}
      <div
        ref={lightRef}
        className="pointer-events-none fixed top-0 left-0 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-accent-blue/[0.045] via-accent-cyan/[0.035] to-transparent blur-[80px] opacity-80 z-0 will-change-transform"
        aria-hidden="true"
      />

      {/* Secondary Indigo Ambient Follower Light */}
      <div
        ref={secondaryLightRef}
        className="pointer-events-none fixed top-0 left-0 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-indigo-500/[0.03] to-transparent blur-[100px] opacity-60 z-0 will-change-transform"
        aria-hidden="true"
      />

      {/* Subtle Architectural Grid Pattern */}
      <div className="fixed inset-0 bg-tech-grid opacity-50 pointer-events-none z-0" aria-hidden="true" />

      {/* Ambient background noise overlay */}
      <div className="fixed inset-0 bg-noise pointer-events-none z-0" aria-hidden="true" />

      {/* Lightweight, battery-friendly ambient particles & filament mesh */}
      <AmbientParticleCanvas />

      {/* Top Header */}
      <AuthHeader onBackToHome={handleReturnHome} />

      {/* Main Panoramic Auth Hub */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-1 min-h-0 overflow-hidden">
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 xl:gap-12 min-h-0">
          
          {/* Left Wing (Desktop Only): Live Infrastructure Sentinel Dashboard */}
          <InfrastructureSentinel />

          {/* Right Wing: Master Auth Card */}
          <div className="w-full max-w-[420px] mx-auto lg:mx-0 shrink-0">
            {/* Mobile Top Status Pill (<lg screens) */}
            <div className="lg:hidden flex items-center justify-center mb-2.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
                <span className="text-[10px] font-mono text-neutral-300">
                  DeployForge Cloud Sentinel · Nominal
                </span>
              </div>
            </div>

            <AuthCard
              mode={currentMode}
              formData={formData}
              errors={errors}
              submitStatus={submitStatus}
              statusMessage={statusMessage}
              showPassword={showPassword}
              isEmailValid={isEmailValid}
              passwordStrength={passwordStrength}
              providerStates={providerStates}
              oauthError={oauthError}
              onFieldChange={setFieldValue}
              onFieldBlur={setFieldTouched}
              onTogglePasswordVisibility={togglePasswordVisibility}
              onSwitchMode={handleSwitchMode}
              onSubmit={(e) =>
                handleSubmit(e, (url) => {
                  if (onNavigate) onNavigate(url);
                  else window.location.href = url;
                })
              }
              onOAuthConnect={connectOAuth}
            />

            {/* Legal and Privacy Disclaimer */}
            <div className="mt-2 text-center px-4">
              <p className="text-[10px] text-neutral-500 font-mono leading-tight">
                By accessing DeployForge, you accept our{' '}
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="text-neutral-400 hover:text-white underline underline-offset-2 transition-colors"
                >
                  Terms
                </a>{' '}
                and{' '}
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="text-neutral-400 hover:text-white underline underline-offset-2 transition-colors"
                >
                  Privacy
                </a>.
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* Bottom Footer */}
      <AuthFooter />
    </div>
  );
}
