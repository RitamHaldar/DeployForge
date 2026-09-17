import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  AlertTriangle,
  Terminal,
  Zap,
  ShieldAlert,
  CheckCircle2,
  Server,
  Activity
} from 'lucide-react';
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
    <div className="mt-8 pt-7 border-t border-white/[0.08]">
      
      {/* Simulation Header & Interactive Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-accent-cyan bg-accent-cyan/10 px-2.5 py-0.5 rounded-full border border-accent-cyan/25 flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-accent-cyan" />
              <span>Autonomous Resiliency Loop</span>
            </span>
            <span className="text-xs font-mono text-neutral-400 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-rose-500 animate-ping' : 'bg-accent-emerald'}`} />
              <span>{isRunning ? 'Remediation In-Flight' : 'Standby Observer Armed'}</span>
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white font-sans tracking-tight">
            Live Resiliency Loop: Zero-Downtime Instance Replacement
          </h3>
          <p className="text-xs font-mono text-neutral-400 mt-0.5">
            Trigger a simulated kernel crash to observe instant eBPF socket isolation and warm-standby promotion.
          </p>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 self-start lg:self-center">
          {/* Traffic Volume Switcher */}
          <div className="flex items-center gap-1 bg-[#090B0E] p-1 rounded-xl border border-white/[0.08] text-xs font-mono shadow-inner">
            <span className="text-neutral-400 px-2 flex items-center gap-1 hidden sm:flex text-[11px]">
              <Zap className="w-3 h-3 text-accent-cyan" />
              <span>Load:</span>
            </span>
            {(['nominal', 'elevated', 'surge'] as TrafficLoad[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTrafficLoad(t)}
                className={`relative px-2.5 py-1 rounded-lg text-xs capitalize transition-colors duration-200 active:scale-95 cursor-pointer ${
                  trafficLoad === t
                    ? 'text-white font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {trafficLoad === t && (
                  <motion.div
                    layoutId="traffic-load-pill"
                    className="absolute inset-0 rounded-lg bg-white/[0.1] border border-white/15 shadow-sm backdrop-blur-md"
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{t}</span>
              </button>
            ))}
          </div>

          {/* Trigger Crash Action Button */}
          <motion.button
            type="button"
            onClick={onTriggerCrash}
            disabled={isRunning}
            whileHover={!isRunning ? { scale: 1.02, y: -1 } : {}}
            whileTap={!isRunning ? { scale: 0.97 } : {}}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            className={`text-xs font-mono px-3.5 py-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan ${
              isRunning
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 cursor-not-allowed shadow-[0_0_20px_rgba(244,63,94,0.18)]'
                : 'bg-white/[0.04] hover:bg-rose-500/10 border-white/[0.1] hover:border-rose-500/35 text-white shadow-sm'
            }`}
          >
            {isRunning ? (
              <RefreshCw className="w-3.5 h-3.5 text-rose-400 animate-spin" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span>{isRunning ? 'Remediating Node...' : 'Simulate Node Crash'}</span>
          </motion.button>

          {/* Recovery Metric Pill */}
          <div className="text-xs font-mono text-neutral-400 bg-[#090B0E] px-3 py-2 rounded-xl border border-white/[0.08] hidden xl:flex items-center gap-1.5 shadow-inner">
            <span>Recovery Metric:</span>
            <span
              className={`font-semibold tabular-nums ${
                phase === 'degraded'
                  ? 'text-rose-400 animate-pulse'
                  : phase === 'isolating' || phase === 'verifying'
                  ? 'text-amber-400'
                  : 'text-accent-emerald'
              }`}
            >
              {recoveryMetric}
            </span>
          </div>
        </div>
      </div>

      {/* 3 Replicas Grid with Spotlight Cards & Dynamic Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 font-mono text-xs">
        {replicas.map((rep) => {
          const isTarget = rep.id === 'rep-b';
          
          let borderStyle = 'border-white/[0.08] bg-[#090B0E]/90 hover:border-white/20';
          let badgeClass = 'text-accent-emerald bg-accent-emerald/10 border-accent-emerald/30';
          let dotClass = 'bg-accent-emerald';
          let barColor = '#10B981';
          let loadNumber = parseInt(rep.load.replace('%', ''), 10) + currentTraffic.loadAdd;
          loadNumber = Math.min(96, Math.max(12, loadNumber));

          if (isTarget) {
            if (phase === 'degraded') {
              borderStyle = 'border-rose-500/60 bg-[#12080A] shadow-[0_0_24px_rgba(244,63,94,0.18)]';
              badgeClass = 'text-rose-400 bg-rose-500/15 border-rose-500/35';
              dotClass = 'bg-rose-500';
              barColor = '#F43F5E';
              loadNumber = 98;
            } else if (phase === 'isolating') {
              borderStyle = 'border-amber-500/50 bg-[#120D08] shadow-[0_0_20px_rgba(245,158,11,0.14)]';
              badgeClass = 'text-amber-400 bg-amber-500/15 border-amber-500/35';
              dotClass = 'bg-amber-400 animate-pulse';
              barColor = '#F59E0B';
              loadNumber = 8;
            } else if (phase === 'verifying') {
              borderStyle = 'border-accent-cyan/50 bg-[#080E14] shadow-[0_0_20px_rgba(0,240,255,0.14)]';
              badgeClass = 'text-accent-cyan bg-accent-cyan/15 border-accent-cyan/35';
              dotClass = 'bg-accent-cyan';
              barColor = '#00F0FF';
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
                scale: isTarget && phase === 'isolating' ? 0.985 : 1,
                opacity: isTarget && phase === 'isolating' ? 0.8 : 1
              }}
              transition={{ duration: 0.25 }}
              className={`spotlight-card relative rounded-2xl p-4 transition-all duration-300 border ${borderStyle} overflow-hidden backdrop-blur-xl cursor-default`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-400">
                    <Server className="w-3 h-3" />
                  </div>
                  <span className="text-white font-medium font-sans text-sm">{rep.name}</span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.span
                    key={rep.status}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className={`flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 rounded-full border font-semibold ${badgeClass}`}
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      {rep.status === 'healthy' && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-emerald opacity-75" />
                      )}
                      {isTarget && phase === 'degraded' && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
                      )}
                      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotClass}`} />
                    </span>
                    <span className="capitalize">{rep.status}</span>
                  </motion.span>
                </AnimatePresence>
              </div>

              {/* Replica Telemetry Specs */}
              <div className="text-[11px] text-neutral-400 space-y-2">
                <div className="flex justify-between items-center">
                  <span>Region &amp; Zone:</span>
                  <span className="text-white font-semibold">{rep.region}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Response p99:</span>
                  <span
                    className={`tabular-nums ${
                      isTarget && phase === 'degraded'
                        ? 'text-rose-400 font-bold'
                        : 'text-white font-semibold'
                    }`}
                  >
                    {displayPing}
                  </span>
                </div>

                {/* Micro Load Bar Meter */}
                <div>
                  <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                    <span>CPU Allocation</span>
                    <span className="text-white font-semibold tabular-nums">{loadNumber}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: barColor }}
                      initial={false}
                      animate={{ width: `${loadNumber}%` }}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-white/[0.04]">
                  <span>Action State:</span>
                  <span
                    className={`font-semibold ${
                      isTarget && phase === 'degraded'
                        ? 'text-rose-400'
                        : isTarget && (phase === 'isolating' || phase === 'verifying')
                        ? 'text-amber-400'
                        : 'text-accent-cyan'
                    }`}
                  >
                    {rep.actionState}
                  </span>
                </div>
              </div>

              {/* Status accent bar along bottom */}
              <div
                className="absolute bottom-0 left-0 right-0 h-1 transition-colors duration-300"
                style={{ backgroundColor: barColor }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Real-Time Kernel Audit Event Stream (Fixed-Height Zero-Jitter Console) */}
      <div className="mt-4 min-h-[46px] px-3.5 py-2.5 bg-[#050608]/95 rounded-xl border border-white/[0.08] flex items-center justify-between font-mono text-xs shadow-inner backdrop-blur-xl">
        <div className="flex items-center gap-2 truncate pr-2">
          <Terminal className="w-3.5 h-3.5 text-accent-cyan shrink-0" />
          <span className="text-neutral-500 shrink-0 select-none">$ kernel.audit &gt;</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={currentLog.message}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className={`truncate font-medium flex items-center gap-1.5 ${
                currentLog.type === 'alert'
                  ? 'text-rose-400'
                  : currentLog.type === 'healing'
                  ? 'text-amber-400'
                  : currentLog.type === 'verify'
                  ? 'text-accent-cyan'
                  : currentLog.type === 'resolved'
                  ? 'text-accent-emerald'
                  : 'text-neutral-200'
              }`}
            >
              {currentLog.type === 'alert' && <AlertTriangle className="w-3 h-3 text-rose-400 inline shrink-0" />}
              {currentLog.type === 'healing' && <ShieldAlert className="w-3 h-3 text-amber-400 inline shrink-0" />}
              {currentLog.type === 'resolved' && <CheckCircle2 className="w-3 h-3 text-accent-emerald inline shrink-0" />}
              <span className="truncate">{currentLog.message}</span>
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-2 hidden sm:flex text-[11px] tabular-nums">
          <span className="text-accent-cyan font-semibold">{currentTraffic.rps}</span>
          <span className="text-neutral-500">{currentLog.timestamp}</span>
        </div>
      </div>

      {/* Credibility statement */}
      <p className="mt-2.5 text-[10px] font-mono text-neutral-500 text-right">
        * Interactive real-time simulation of DeployForge autonomous hot-standby microVM failover loop.
      </p>

    </div>
  );
}
