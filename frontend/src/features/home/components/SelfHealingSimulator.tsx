import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, AlertTriangle, Terminal, Zap, ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { SimulationPhase, ReplicaState, SimulationLog } from '../types';

interface SelfHealingSimulatorProps {
  phase: SimulationPhase;
  isRunning: boolean;
  recoveryMetric: string;
  currentLog: SimulationLog;
  replicas: ReplicaState[];
  onTriggerCrash: () => void;
}

type TrafficLoad = 'nominal' | 'elevated' | 'surge';

export function SelfHealingSimulator({
  phase,
  isRunning,
  recoveryMetric,
  currentLog,
  replicas,
  onTriggerCrash
}: SelfHealingSimulatorProps) {
  const [trafficLoad, setTrafficLoad] = useState<TrafficLoad>('nominal');

  const trafficMultipliers: Record<TrafficLoad, { label: string; rps: string; latencyAdd: number; loadAdd: number }> = {
    nominal: { label: 'Nominal Ingress', rps: '24.2k req/s', latencyAdd: 0, loadAdd: 0 },
    elevated: { label: 'Peak Load', rps: '68.5k req/s', latencyAdd: 3, loadAdd: 22 },
    surge: { label: 'Surge Spike', rps: '142.8k req/s', latencyAdd: 7, loadAdd: 45 }
  };

  const currentTraffic = trafficMultipliers[trafficLoad];

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <div className="mt-10 pt-8 border-t border-brand-border">
      
      {/* Simulation Header & Interactive Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-brand-cyan bg-brand-cyan-dim px-2.5 py-0.5 rounded border border-brand-cyan/20">
              Autonomous Self-Healing In-Flight
            </span>
            <span className="text-xs font-mono text-brand-muted">
              Cycle: {isRunning ? 'Active Remediation' : 'Standby Monitoring'}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white mt-1.5">
            Live Resiliency Loop: Zero-Downtime Instance Replacement
          </h3>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Traffic Volume Switcher */}
          <div className="flex items-center gap-1 bg-brand-card p-1 rounded-lg border border-brand-border text-xs font-mono">
            <span className="text-brand-muted px-2 flex items-center gap-1 hidden sm:flex">
              <Zap className="w-3 h-3 text-brand-cyan" />
              <span>Traffic:</span>
            </span>
            {(['nominal', 'elevated', 'surge'] as TrafficLoad[]).map((t) => (
              <button
                key={t}
                onClick={() => setTrafficLoad(t)}
                className={`px-2.5 py-1 rounded text-[11px] capitalize transition-all duration-200 active:scale-95 ${
                  trafficLoad === t
                    ? 'bg-brand-elevated text-white border border-brand-border shadow-sm font-semibold'
                    : 'text-brand-muted hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Trigger Crash Button */}
          <motion.button
            onClick={onTriggerCrash}
            disabled={isRunning}
            whileHover={!isRunning ? { scale: 1.02, y: -1 } : {}}
            whileTap={!isRunning ? { scale: 0.97 } : {}}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`text-xs font-mono px-3.5 py-2 rounded-lg border flex items-center gap-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan ${
              isRunning
                ? 'bg-brand-rose-dim border-brand-rose/30 text-brand-rose cursor-not-allowed shadow-[0_0_16px_rgba(239,68,68,0.15)]'
                : 'bg-brand-elevated hover:bg-white/[0.08] border-brand-border hover:border-brand-border-hover text-white shadow-sm'
            }`}
          >
            {isRunning ? (
              <RefreshCw className="w-3.5 h-3.5 text-brand-rose animate-spin" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-brand-cyan" />
            )}
            <span>{isRunning ? 'Remediating Node...' : 'Simulate Node Crash'}</span>
          </motion.button>

          {/* Recovery Metric Pill */}
          <div className="text-xs font-mono text-brand-muted bg-brand-card px-3 py-2 rounded-lg border border-brand-border hidden xl:block">
            Recovery Metric:{' '}
            <span
              className={`font-semibold ${
                phase === 'degraded'
                  ? 'text-brand-rose animate-pulse'
                  : phase === 'isolating' || phase === 'verifying'
                  ? 'text-brand-amber'
                  : 'text-brand-emerald'
              }`}
            >
              {recoveryMetric}
            </span>
          </div>
        </div>
      </div>

      {/* 3 Replicas Grid with Spotlight Cards & Dynamic Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        {replicas.map((rep) => {
          const isTarget = rep.id === 'rep-b';
          
          let borderStyle = 'border-brand-border';
          let badgeClass = 'text-brand-emerald bg-brand-emerald-dim border-brand-emerald/20';
          let dotClass = 'bg-brand-emerald';
          let barColor = 'bg-brand-emerald';
          let loadNumber = parseInt(rep.load.replace('%', ''), 10) + currentTraffic.loadAdd;
          loadNumber = Math.min(96, Math.max(12, loadNumber));

          if (isTarget) {
            if (phase === 'degraded') {
              borderStyle = 'border-brand-rose/60 bg-brand-rose/[0.04] shadow-[0_0_24px_rgba(239,68,68,0.15)]';
              badgeClass = 'text-brand-rose bg-brand-rose-dim border-brand-rose/30';
              dotClass = 'bg-brand-rose';
              barColor = 'bg-brand-rose';
              loadNumber = 98;
            } else if (phase === 'isolating') {
              borderStyle = 'border-brand-amber/50 bg-brand-amber/[0.03] shadow-[0_0_20px_rgba(245,158,11,0.1)]';
              badgeClass = 'text-brand-amber bg-brand-amber-dim border-brand-amber/30';
              dotClass = 'bg-brand-amber animate-pulse';
              barColor = 'bg-brand-amber';
              loadNumber = 8;
            } else if (phase === 'verifying') {
              borderStyle = 'border-brand-cyan/50 bg-brand-cyan/[0.03] shadow-[0_0_20px_rgba(0,240,255,0.1)]';
              badgeClass = 'text-brand-cyan bg-brand-cyan-dim border-brand-cyan/30';
              dotClass = 'bg-brand-cyan';
              barColor = 'bg-brand-cyan';
              loadNumber = 42;
            }
          }

          // Latency with traffic calculation
          let displayPing = rep.ping;
          if (rep.status === 'healthy' && currentTraffic.latencyAdd > 0) {
            const baseMs = parseInt(rep.ping.replace(/[^0-9]/g, ''), 10) || 12;
            displayPing = `${baseMs + currentTraffic.latencyAdd}ms (p99)`;
          }

          return (
            <motion.div
              key={rep.id}
              layout
              onMouseMove={handleCardMouseMove}
              animate={{
                scale: isTarget && phase === 'isolating' ? 0.98 : 1,
                opacity: isTarget && phase === 'isolating' ? 0.75 : 1
              }}
              transition={{ duration: 0.3 }}
              className={`spotlight-card relative bg-brand-card rounded-xl p-4 transition-colors duration-300 border ${borderStyle} overflow-hidden cursor-default`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-white/90 font-medium">{rep.name}</span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.span
                    key={rep.status}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className={`status-badge flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full border ${badgeClass}`}
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      {rep.status === 'healthy' && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-emerald opacity-75"></span>
                      )}
                      {isTarget && phase === 'degraded' && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-rose opacity-75"></span>
                      )}
                      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotClass}`}></span>
                    </span>
                    <span className="capitalize">{rep.status}</span>
                  </motion.span>
                </AnimatePresence>
              </div>

              {/* Replica Specs */}
              <div className="text-[11px] text-brand-muted space-y-2">
                <div className="flex justify-between">
                  <span>Region:</span>
                  <span className="text-white">{rep.region}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Response:</span>
                  <span
                    className={
                      isTarget && phase === 'degraded'
                        ? 'text-brand-rose font-bold'
                        : 'text-white'
                    }
                  >
                    {displayPing}
                  </span>
                </div>

                {/* Micro Load Bar Meter */}
                <div>
                  <div className="flex justify-between text-[10px] text-brand-muted mb-1">
                    <span>CPU Allocation</span>
                    <span className="text-white font-medium">{loadNumber}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${barColor}`}
                      initial={false}
                      animate={{ width: `${loadNumber}%` }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-1">
                  <span>Action State:</span>
                  <span
                    className={
                      isTarget && phase === 'degraded'
                        ? 'text-brand-rose font-semibold'
                        : isTarget && (phase === 'isolating' || phase === 'verifying')
                        ? 'text-brand-cyan font-semibold'
                        : 'text-brand-cyan'
                    }
                  >
                    {rep.actionState}
                  </span>
                </div>
              </div>

              {/* Status accent bar along bottom */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 transition-colors duration-300 ${barColor}`} />
            </motion.div>
          );
        })}
      </div>

      {/* Real-Time Event Audit Log with Smooth Morphing */}
      <div className="mt-4 p-3 bg-brand-bg rounded-lg border border-brand-border flex items-center justify-between font-mono text-xs shadow-inner">
        <div className="flex items-center gap-2 truncate">
          <Terminal className="w-3.5 h-3.5 text-brand-muted shrink-0" />
          <span className="text-brand-muted shrink-0">$ kernel.audit &gt;</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={currentLog.message}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.2 }}
              className={`truncate font-medium flex items-center gap-1.5 ${
                currentLog.type === 'alert'
                  ? 'text-brand-rose'
                  : currentLog.type === 'healing'
                  ? 'text-brand-amber'
                  : currentLog.type === 'verify'
                  ? 'text-brand-cyan'
                  : currentLog.type === 'resolved'
                  ? 'text-brand-emerald'
                  : 'text-white/90'
              }`}
            >
              {currentLog.type === 'alert' && <AlertTriangle className="w-3 h-3 text-brand-rose inline shrink-0" />}
              {currentLog.type === 'healing' && <ShieldAlert className="w-3 h-3 text-brand-amber inline shrink-0" />}
              {currentLog.type === 'resolved' && <CheckCircle2 className="w-3 h-3 text-brand-emerald inline shrink-0" />}
              <span>{currentLog.message}</span>
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-3 hidden sm:flex">
          <span className="text-[10px] text-brand-cyan">Ingress: {currentTraffic.rps}</span>
          <span className="text-[10px] text-brand-muted">{currentLog.timestamp}</span>
        </div>
      </div>

      {/* Credibility statement */}
      <p className="mt-3 text-[11px] font-mono text-brand-muted/70 text-right">
        * Interactive visualization of DeployForge autonomous hot-standby replacement loop.
      </p>

    </div>
  );
}
