import { useEffect, useRef, useState, useCallback } from 'react';
import type { AuthMode } from '../types';
import { useAuthForm } from '../hooks/useAuthForm';
import { useOAuth } from '../hooks/useOAuth';
import { AuthCard } from '../components/AuthCard';
import { AuthHeader } from '../components/AuthHeader';
import { AuthFooter } from '../components/AuthFooter';
import { AmbientParticleCanvas } from '../components/AmbientParticleCanvas';

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

  // Spring-lerped subtle cursor follower light
  const lightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const lightEl = lightRef.current;
    if (!lightEl) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const updateLight = () => {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      lightEl.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(updateLight);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    rafId = requestAnimationFrame(updateLight);

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
    <div className="relative min-h-screen bg-[#070809] text-[#F5F5F5] flex flex-col justify-between overflow-x-hidden select-none">
      {/* Subtle Ambient Cursor Follower Light (Hardware-Accelerated Lerp) */}
      <div
        ref={lightRef}
        className="pointer-events-none fixed top-0 left-0 w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-accent-blue/[0.035] via-accent-cyan/[0.025] to-transparent blur-[60px] opacity-70 z-0 will-change-transform"
        aria-hidden="true"
      />

      {/* Ambient background noise grid */}
      <div className="fixed inset-0 bg-noise pointer-events-none z-0" aria-hidden="true" />

      {/* Lightweight, battery-friendly ambient particles */}
      <AmbientParticleCanvas />

      {/* Minimal Top Header */}
      <AuthHeader onBackToHome={handleReturnHome} />

      {/* Main Centered Authentication Form */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[440px] mx-auto">
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
            onSubmit={(e) => handleSubmit(e, (url) => {
              if (onNavigate) onNavigate(url);
              else window.location.href = url;
            })}
            onOAuthConnect={connectOAuth}
          />

          {/* Legal and Privacy Disclaimer */}
          <div className="mt-5 text-center px-4">
            <p className="text-[11px] text-neutral-500 font-mono leading-relaxed">
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
              </a>.
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <AuthFooter />
    </div>
  );
}
