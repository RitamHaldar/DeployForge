import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ShieldCheck, Zap, TrendingUp, RefreshCw } from 'lucide-react';

interface MetricCardsProps {
  activeIncidents: number;
  mttrSeconds: number;
  autonomousActions: number;
  podHealth: number;
  podsHealthy: number;
  podsTotal: number;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  activeIncidents,
  mttrSeconds,
  autonomousActions,
  podHealth,
  podsHealthy,
  podsTotal,
}) => {
  const incidentsRef = useRef<HTMLSpanElement>(null);
  const mttrRef = useRef<HTMLSpanElement>(null);
  const actionsRef = useRef<HTMLSpanElement>(null);
  const healthRef = useRef<HTMLSpanElement>(null);

  // GSAP animated count-up on load & updates
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Incidents
      if (incidentsRef.current) {
        gsap.fromTo(
          incidentsRef.current,
          { innerText: 3 },
          {
            innerText: activeIncidents,
            duration: 1.2,
            snap: { innerText: 1 },
            ease: 'power2.out',
          }
        );
      }

      // 2. MTTR
      if (mttrRef.current) {
        const obj = { val: 3.5 };
        gsap.to(obj, {
          val: mttrSeconds,
          duration: 1.6,
          ease: 'power3.out',
          onUpdate: () => {
            if (mttrRef.current) {
              mttrRef.current.innerText = `${obj.val.toFixed(1)}s`;
            }
          },
        });
      }

      // 3. Autonomous Actions
      if (actionsRef.current) {
        gsap.fromTo(
          actionsRef.current,
          { innerText: 10 },
          {
            innerText: autonomousActions,
            duration: 1.8,
            snap: { innerText: 1 },
            ease: 'power2.out',
          }
        );
      }

      // 4. Pod Health
      if (healthRef.current) {
        const obj = { val: 85.0 };
        gsap.to(obj, {
          val: podHealth,
          duration: 1.8,
          ease: 'power3.out',
          onUpdate: () => {
            if (healthRef.current) {
              healthRef.current.innerText = `${obj.val.toFixed(1)}%`;
            }
          },
        });
      }
    });

    return () => ctx.revert();
  }, [activeIncidents, mttrSeconds, autonomousActions, podHealth]);

  // Histogram heights for Card 2
  const histogramHeights = [28, 48, 32, 60, 42, 85, 96, 52, 38, 22];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
      {/* CARD 1: ACTIVE INCIDENTS */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className="kpi-card relative overflow-hidden flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="kpi-title tracking-wider text-xs font-semibold text-slate-400 uppercase">
              ACTIVE INCIDENTS
            </span>
            <span className={`kpi-badge ${activeIncidents === 0 ? 'badge-green' : 'badge-red'}`}>
              <span className={`status-dot ${activeIncidents === 0 ? 'dot-green' : 'dot-red animate-ping'}`} />
              {activeIncidents === 0 ? 'STABLE' : `${activeIncidents} ELEVATED`}
            </span>
          </div>

          <div className="flex items-baseline gap-3 mb-1">
            <span ref={incidentsRef} className="text-4xl font-bold text-white tracking-tight">
              {activeIncidents}
            </span>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
              <span>100% Mesh Health</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-1">
            Cluster 100% operational across nodes
          </p>
        </div>

        {/* Sparkline Visual */}
        <div className="mt-4 pt-2">
          <svg className="w-full h-8 overflow-visible" viewBox="0 0 240 30" preserveAspectRatio="none">
            <defs>
              <linearGradient id="greenGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 0,22 Q 30,23 60,20 T 120,21 T 180,19 T 240,20"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              className="drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
            />
            <path
              d="M 0,22 Q 30,23 60,20 T 120,21 T 180,19 T 240,20 L 240,30 L 0,30 Z"
              fill="url(#greenGlow)"
            />
          </svg>
        </div>
      </motion.div>

      {/* CARD 2: MEAN TIME TO RECOVER (MTTR) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className="kpi-card relative overflow-hidden flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="kpi-title tracking-wider text-xs font-semibold text-slate-400 uppercase">
              MEAN TIME TO RECOVER (MTTR)
            </span>
            <span className="kpi-badge badge-cyan flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" />
              Autonomous
            </span>
          </div>

          <div className="flex items-baseline gap-3 mb-1">
            <span
              ref={mttrRef}
              className="text-4xl font-bold tracking-tight text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]"
            >
              1.8s
            </span>
            <span className="text-xs bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded text-slate-300 font-medium">
              -350ms vs manual
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-1">
            99.8th percentile autonomous self-healing
          </p>
        </div>

        {/* Dynamic Histogram Bars */}
        <div className="mt-4 pt-2 flex items-end justify-between h-8 gap-1.5 px-0.5">
          {histogramHeights.map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.04, ease: 'backOut' }}
              className="flex-1 bg-cyan-400/80 rounded-t-sm hover:bg-cyan-300 transition-colors cursor-pointer group relative"
            >
              <div className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-cyan-500/40 text-[10px] text-cyan-300 px-1 rounded pointer-events-none transition-opacity z-10">
                {(h * 0.025).toFixed(1)}s
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CARD 3: AUTONOMOUS ACTIONS (24H) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className="kpi-card relative overflow-hidden flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="kpi-title tracking-wider text-xs font-semibold text-slate-400 uppercase">
              AUTONOMOUS ACTIONS (24H)
            </span>
            <span className="kpi-badge badge-purple flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-purple-400" />
              +12%
            </span>
          </div>

          <div className="flex items-baseline gap-3 mb-1">
            <span ref={actionsRef} className="text-4xl font-bold text-white tracking-tight">
              {autonomousActions}
            </span>
            <span className="text-xs text-slate-400 font-medium">0 escalations</span>
          </div>

          <p className="text-xs text-slate-400 mt-1">
            38 rollouts, 4 dynamic quarantines
          </p>
        </div>

        {/* Purple Glowing Area Wave */}
        <div className="mt-4 pt-2">
          <svg className="w-full h-8 overflow-visible" viewBox="0 0 240 30" preserveAspectRatio="none">
            <defs>
              <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 0,26 C 40,26 60,20 100,18 C 140,16 170,8 200,8 C 220,8 230,12 240,14"
              fill="none"
              stroke="#a855f7"
              strokeWidth="2.5"
              className="drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]"
            />
            <path
              d="M 0,26 C 40,26 60,20 100,18 C 140,16 170,8 200,8 C 220,8 230,12 240,14 L 240,30 L 0,30 Z"
              fill="url(#purpleGlow)"
            />
          </svg>
        </div>
      </motion.div>

      {/* CARD 4: POD HEALTH INDEX */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className="kpi-card relative overflow-hidden flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="kpi-title tracking-wider text-xs font-semibold text-slate-400 uppercase">
              POD HEALTH INDEX
            </span>
            <span className="kpi-badge badge-green flex items-center gap-1">
              <span className="status-dot dot-green" />
              Mesh Ready
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span ref={healthRef} className="text-4xl font-bold text-white tracking-tight">
                  {podHealth.toFixed(1)}%
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium block">
                {podsHealthy} / {podsTotal} pods healthy
              </span>
            </div>

            {/* Circular Gauge Graphic */}
            <div className="relative w-11 h-11 flex items-center justify-center">
              <svg className="w-11 h-11 -rotate-90" viewBox="0 0 44 44">
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="3.5"
                />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeDasharray={113}
                  strokeDashoffset={113 * (1 - podHealth / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]"
                />
              </svg>
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400 absolute animate-[spin_8s_linear_infinite]" />
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-2">
            Self-healing mesh active & probing
          </p>
        </div>

        {/* Bottom Emerald Progress Bar */}
        <div className="mt-4 pt-2">
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${podHealth}%` }}
              transition={{ duration: 1.2, delay: 0.3 }}
              className="h-full bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.9)]"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
