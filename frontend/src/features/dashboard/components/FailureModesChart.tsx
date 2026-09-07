import React from 'react';
import { motion } from 'framer-motion';
import type { AnomalyFailureMode } from '../types';
import { CheckCircle2 } from 'lucide-react';

interface FailureModesChartProps {
  failureModes?: AnomalyFailureMode[];
}

export const FailureModesChart: React.FC<FailureModesChartProps> = ({
  failureModes = [
    {
      id: 'crashloop',
      label: 'CrashLoopBackOff',
      eventsCount: 86,
      avgFixTime: '1.9s',
      percentage: 58,
      color: 'from-rose-500 to-red-400',
      glowColor: 'rgba(244,63,94,0.7)',
    },
    {
      id: 'oom',
      label: 'OOMKilled (RAM Exhaustion)',
      eventsCount: 36,
      avgFixTime: '2.4s',
      percentage: 24,
      color: 'from-cyan-500 to-blue-400',
      glowColor: 'rgba(6,182,212,0.7)',
    },
    {
      id: 'restarts',
      label: 'HighRestartCount / Liveness Failure',
      eventsCount: 26,
      avgFixTime: '1.1s',
      percentage: 18,
      color: 'from-purple-500 to-indigo-400',
      glowColor: 'rgba(168,85,247,0.7)',
    },
  ],
}) => {
  return (
    <div className="section-card flex-1 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-3">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">
            Anomalies by Failure Mode
          </h2>
          <p className="text-xs text-slate-400">
            Last 7 Days · Total 148 automated remediations
          </p>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          100% Resolved
        </span>
      </div>

      {/* Progress Breakdown Bars */}
      <div className="space-y-4 my-auto py-1">
        {failureModes.map((item, idx) => (
          <div key={item.id} className="group">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    idx === 0 ? 'bg-rose-400' : idx === 1 ? 'bg-cyan-400' : 'bg-purple-400'
                  }`}
                />
                <span className="font-medium text-slate-200 group-hover:text-white transition-colors">
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-400 font-mono">
                  {item.eventsCount} events (Avg fix: {item.avgFixTime})
                </span>
                <span className="font-mono font-bold text-slate-200 min-w-[28px] text-right">
                  {item.percentage}%
                </span>
              </div>
            </div>

            {/* Progress Bar with Gradient & Glow */}
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800/60">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ duration: 1, delay: 0.2 + idx * 0.15, ease: 'easeOut' }}
                className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                style={{
                  boxShadow: `0 0 8px ${item.glowColor}`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footer SLA Strip */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Zero Human Engineer Paging Events Triggered</span>
        </div>

        <div className="text-emerald-400 font-semibold tracking-wide">
          Autonomous SLA: 99.999%
        </div>
      </div>
    </div>
  );
};
