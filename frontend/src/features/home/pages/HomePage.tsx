import { useRef, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { PipelineVisualization } from '../components/PipelineVisualization';
import { SelfHealingSimulator } from '../components/SelfHealingSimulator';
import { InfrastructureSection } from '../components/InfrastructureSection';
import { DeploymentLifecycleSection } from '../components/DeploymentLifecycleSection';
import { RemediationSection } from '../components/RemediationSection';
import { CliTerminalSection } from '../components/CliTerminalSection';
import { ObservabilitySection } from '../components/ObservabilitySection';
import { CallToActionSection } from '../components/CallToActionSection';
import { Footer } from '../components/Footer';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import { useResiliencySimulation } from '../hooks/useResiliencySimulation';

interface HomePageProps {
  onNavigate?: (path: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps = {}) {
  // Ultra-fluid Lenis smooth scroll engine
  useSmoothScroll();

  // State machine for the live self-healing loop
  const {
    phase,
    isRunning,
    recoveryMetric,
    currentLog,
    replicas,
    triggerCrash
  } = useResiliencySimulation();

  const mainContainerRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  // High-performance ambient cursor follower (hardware accelerated)
  useEffect(() => {
    const glowEl = glowRef.current;
    if (!glowEl) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const updateGlow = () => {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      glowEl.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(updateGlow);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    rafId = requestAnimationFrame(updateGlow);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div ref={mainContainerRef} className="relative min-h-screen bg-brand-bg text-brand-text overflow-x-hidden selection:bg-brand-cyan/20 selection:text-brand-cyan">
      
      {/* Interactive Dynamic Ambient Mouse Glow (Silky Smooth, Zero WebGL Overhead) */}
      <div
        ref={glowRef}
        className="pointer-events-none fixed top-0 left-0 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-brand-blue/8 via-brand-cyan/[0.04] to-transparent blur-3xl opacity-60 z-0 will-change-transform"
        aria-hidden="true"
      />

      {/* Ambient Grid and Restrained Radial Aurora Backgrounds */}
      <div className="fixed inset-0 bg-tech-grid opacity-70 pointer-events-none z-0" aria-hidden="true" />
      <div className="fixed inset-0 radial-vignette pointer-events-none z-0" aria-hidden="true" />

      {/* Subtle Upper Atmospheric Glow */}
      <div
        className="pointer-events-none fixed top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-brand-cyan/[0.04] via-brand-blue/[0.02] to-transparent blur-[120px] z-0"
        aria-hidden="true"
      />

      {/* Navigation */}
      <Navbar onNavigate={onNavigate} />

      {/* Hero Content & Live Pipeline Visualization */}
      <main className="relative z-10 max-w-7xl mx-auto px-6">
        <HeroSection />

        {/* Hero Interactive Console Container */}
        <div className="w-full relative mt-2 mb-28">
          <div className="relative rounded-2xl bg-brand-surface/95 border border-brand-border shadow-[0_32px_100px_rgba(0,0,0,0.85)] overflow-hidden backdrop-blur-md p-6 sm:p-8 transition-all duration-300 hover:border-brand-border-hover">
            <PipelineVisualization />
            <SelfHealingSimulator
              phase={phase}
              isRunning={isRunning}
              recoveryMetric={recoveryMetric}
              currentLog={currentLog}
              replicas={replicas}
              onTriggerCrash={triggerCrash}
            />
          </div>
        </div>
      </main>

      {/* Deep Dive Sections with Fluid Staggered Reveals */}
      <InfrastructureSection />
      <DeploymentLifecycleSection />
      <RemediationSection />
      <CliTerminalSection />
      <ObservabilitySection />
      <CallToActionSection />

      {/* Footer */}
      <Footer />

    </div>
  );
}
