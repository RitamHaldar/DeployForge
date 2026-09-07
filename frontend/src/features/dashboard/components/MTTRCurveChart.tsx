import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const MTTRCurveChart: React.FC = () => {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: string; time: string } | null>({
    x: 240,
    y: 84,
    val: '1.62s fix',
    time: '12:00',
  });

  // Points along the 24h timeline
  const dataPoints = [
    { time: '00:00', x: 20, y: 88, val: '1.78s fix' },
    { time: '03:00', x: 75, y: 86, val: '1.85s fix' },
    { time: '06:00', x: 130, y: 83, val: '1.70s fix' },
    { time: '09:00', x: 185, y: 82, val: '1.65s fix' },
    { time: '12:00', x: 240, y: 84, val: '1.62s fix' },
    { time: '15:00', x: 295, y: 89, val: '1.92s fix' },
    { time: '18:00', x: 350, y: 92, val: '2.05s fix' },
    { time: '21:00', x: 405, y: 88, val: '1.80s fix' },
    { time: '24:00', x: 460, y: 86, val: '1.74s fix' },
  ];

  return (
    <div className="section-card flex-1 flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">
            MTTR Distribution Curve
          </h2>
          <p className="text-xs text-slate-400">
            Autonomous machine execution vs human engineer response
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
            <span className="font-medium text-slate-200">KubeHeal (1.8s)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-3 h-0.5 border-t border-dashed border-slate-500" />
            <span>Manual (42m)</span>
          </div>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative w-full h-44 mt-2">
        <svg
          className="w-full h-full overflow-visible"
          viewBox="0 0 480 140"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="mttrGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
              <stop offset="40%" stopColor="#3b82f6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="curveStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y labels */}
          <line x1="40" y1="20" x2="480" y2="20" stroke="#1e293b" strokeDasharray="3 3" />
          <text x="5" y="24" fill="#64748b" fontSize="10" fontFamily="monospace">4.0s</text>

          <line x1="40" y1="55" x2="480" y2="55" stroke="#1e293b" strokeDasharray="3 3" />
          <text x="5" y="59" fill="#64748b" fontSize="10" fontFamily="monospace">3.0s</text>

          <line x1="40" y1="90" x2="480" y2="90" stroke="#1e293b" strokeDasharray="3 3" />
          <text x="5" y="94" fill="#64748b" fontSize="10" fontFamily="monospace">2.0s</text>

          <line x1="40" y1="125" x2="480" y2="125" stroke="#1e293b" />
          <text x="5" y="129" fill="#64748b" fontSize="10" fontFamily="monospace">0.0s</text>

          {/* Human Paging Threshold Dotted Guideline */}
          <line
            x1="40"
            y1="32"
            x2="480"
            y2="32"
            stroke="#475569"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />
          <text
            x="365"
            y="28"
            fill="#94a3b8"
            fontSize="9"
            fontFamily="monospace"
            className="select-none"
          >
            Human Paging Threshold (avg 42m)
          </text>

          {/* Glowing Area Fill */}
          <path
            d="M 40,88 C 100,84 150,82 240,84 C 330,86 400,92 480,86 L 480,125 L 40,125 Z"
            fill="url(#mttrGradient)"
          />

          {/* Glowing MTTR Line */}
          <path
            d="M 40,88 C 100,84 150,82 240,84 C 330,86 400,92 480,86"
            fill="none"
            stroke="url(#curveStroke)"
            strokeWidth="3"
            className="drop-shadow-[0_0_10px_rgba(56,189,248,0.7)]"
          />

          {/* Target Vertical Guideline for Hovered/Active point */}
          {hoveredPoint && (
            <line
              x1={hoveredPoint.x}
              y1="25"
              x2={hoveredPoint.x}
              y2="125"
              stroke="#06b6d4"
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />
          )}

          {/* Interactive Data Points along curve */}
          {dataPoints.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="10"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(pt)}
              />
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredPoint?.x === pt.x ? '4.5' : '2'}
                fill={hoveredPoint?.x === pt.x ? '#ffffff' : '#38bdf8'}
                stroke="#06b6d4"
                strokeWidth="2"
                className="transition-all pointer-events-none drop-shadow-[0_0_6px_rgba(6,182,212,1)]"
              />
            </g>
          ))}
        </svg>

        {/* Floating Tooltip Pinpoint Badge */}
        {hoveredPoint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-1 pointer-events-none transform -translate-x-1/2"
            style={{ left: `${(hoveredPoint.x / 480) * 100}%` }}
          >
            <div className="bg-slate-900/95 border border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.4)] px-2.5 py-1 rounded-md text-xs font-mono font-bold text-white flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              {hoveredPoint.val}
            </div>
          </motion.div>
        )}

        {/* X Axis Timestamps */}
        <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1 pl-7 pr-1">
          <span>00:00</span>
          <span>06:00</span>
          <span className="text-cyan-400 font-semibold">12:00</span>
          <span>18:00</span>
          <span>24:00</span>
        </div>
      </div>
    </div>
  );
};
