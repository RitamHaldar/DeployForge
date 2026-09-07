import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RemediationEvent } from '../types';
import { RotateCcw, Shield, ArrowUpCircle, CheckCircle2, Clock } from 'lucide-react';

interface SelfHealingStreamProps {
  events: RemediationEvent[];
}

export const SelfHealingStream: React.FC<SelfHealingStreamProps> = ({ events }) => {
  return (
    <div className="section-card w-full xl:w-[380px] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-indigo-950/80 border border-indigo-700/60 flex items-center justify-center text-indigo-400">
            <RotateCcw className="w-3.5 h-3.5 animate-[spin_10s_linear_infinite]" />
          </div>
          <h2 className="text-base font-semibold text-white tracking-tight">
            Self-Healing Stream
          </h2>
        </div>
        <span className="text-[11px] font-medium bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-md">
          Last 60m
        </span>
      </div>

      {/* Stream List */}
      <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1 scrollbar-thin">
        <AnimatePresence initial={false}>
          {events.map((evt) => {
            const isProgress = evt.statusType === 'in-progress';

            return (
              <motion.div
                key={evt.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className={`p-3 rounded-lg border transition-all ${
                  isProgress
                    ? 'bg-indigo-950/20 border-indigo-700/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Event Header */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center ${
                        evt.iconType === 'rollback'
                          ? 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                          : evt.iconType === 'shield'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                      }`}
                    >
                      {evt.iconType === 'rollback' && <RotateCcw className="w-3 h-3" />}
                      {evt.iconType === 'shield' && <Shield className="w-3 h-3" />}
                      {evt.iconType === 'scale' && <ArrowUpCircle className="w-3 h-3" />}
                    </div>
                    <span className="text-xs font-semibold text-white">
                      {evt.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-slate-500" />
                    {evt.timeAgo}
                  </span>
                </div>

                {/* Target Pod Identifier */}
                <div className="text-[11px] font-mono text-slate-400 bg-slate-950/60 px-2 py-1 rounded border border-slate-800/60 mb-1.5 truncate">
                  {evt.targetPod}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed mb-2.5">
                  {evt.description}
                </p>

                {/* Footer Badges */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                  {isProgress ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-900/60 text-indigo-300 border border-indigo-700/60 shadow-[0_0_8px_rgba(99,102,241,0.4)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                      {evt.statusBadge}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {evt.statusBadge}
                    </span>
                  )}

                  <span className="text-[11px] text-slate-500 font-mono">
                    {evt.secondaryTag}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
