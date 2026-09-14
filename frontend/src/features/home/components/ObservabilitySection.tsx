import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { AnimatedCounter } from './AnimatedCounter';
import { Activity, Gauge, Cpu, ShieldCheck } from 'lucide-react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const
    }
  }
};

// Exact closed-form mathematical evaluation of the SVG curve:
// d="M0,180 Q 200,120 400,140 T 700,70 T 850,110 T 1000,60"
function getCurveY(x: number): number {
  const clampedX = Math.max(0, Math.min(1000, x));

  // Segment 1: x in [0, 400]
  // Start: (0, 180), Control: (200, 120), End: (400, 140)
  // x(t) = 400 * t  =>  t = x / 400
  if (clampedX <= 400) {
    const t = clampedX / 400;
    const inv = 1 - t;
    return inv * inv * 180 + 2 * inv * t * 120 + t * t * 140;
  }

  // Segment 2: x in (400, 700]
  // Start: (400, 140), Control: (600, 160), End: (700, 70)
  // x(t) = 400 + 400*t - 100*t^2  =>  t = 2 - sqrt((800 - x) / 100)
  if (clampedX <= 700) {
    const t = 2 - Math.sqrt(Math.max(0, (800 - clampedX) / 100));
    const inv = 1 - t;
    return inv * inv * 140 + 2 * inv * t * 160 + t * t * 70;
  }

  // Segment 3: x in (700, 850]
  // Start: (700, 70), Control: (800, -20), End: (850, 110)
  // x(t) = 700 + 200*t - 50*t^2  =>  t = 2 - sqrt((900 - x) / 50)
  if (clampedX <= 850) {
    const t = 2 - Math.sqrt(Math.max(0, (900 - clampedX) / 50));
    const inv = 1 - t;
    return inv * inv * 70 + 2 * inv * t * (-20) + t * t * 110;
  }

  // Segment 4: x in (850, 1000]
  // Start: (850, 110), Control: (900, 240), End: (1000, 60)
  // x(t) = 850 + 100*t + 50*t^2  =>  t = -1 + sqrt((x - 800) / 50)
  const t = -1 + Math.sqrt(Math.max(0, (clampedX - 800) / 50));
  const inv = 1 - t;
  return inv * inv * 110 + 2 * inv * t * 240 + t * t * 60;
}

export function ObservabilitySection() {
  const [activeRange, setActiveRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h');
  const [scrubberPos, setScrubberPos] = useState<{ x: number; y: number; pct: number } | null>(null);

  const ranges: ('1h' | '6h' | '24h' | '7d')[] = ['1h', '6h', '24h', '7d'];

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  const handleChartMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const pct = x / rect.width;
    const svgX = pct * 1000;
    const svgY = getCurveY(svgX);
    setScrubberPos({ x: svgX, y: svgY, pct });
  };

  return (
    <section id="observability" className="py-28 border-t border-brand-border relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -40px 0px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mb-16"
        >
          <div className="text-xs font-mono uppercase tracking-widest text-brand-cyan mb-2">
            Unified Metrics
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            Know what is happening.
          </h2>
          <p className="text-base text-brand-muted">
            High-fidelity metric sampling without agent overhead. Inspect CPU, memory, request volume, and p99 latency without leaving your workflow.
          </p>
        </motion.div>

        {/* 4 Metric Cards with Animated Number Tickers & Spotlight */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px 0px -30px 0px" }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          {/* Card 1: Throughput */}
          <motion.div
            variants={cardVariants}
            onMouseMove={handleCardMouseMove}
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="spotlight-card bg-brand-surface border border-brand-border p-5 rounded-xl transition-colors duration-200 hover:border-brand-border-hover hover:shadow-[0_0_24px_rgba(0,240,255,0.08)] cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-mono text-brand-muted uppercase">
              <span>Throughput</span>
              <Activity className="w-3.5 h-3.5 text-brand-cyan" />
            </div>
            <div className="text-2xl font-bold text-white mt-2 flex items-baseline gap-2">
              <AnimatedCounter value={4.2} decimals={1} suffix="M" />
              <span className="text-xs font-normal text-brand-emerald font-mono">+12.4%</span>
            </div>
            <div className="text-[11px] font-mono text-brand-muted mt-2">Requests / 24h</div>
            <div className="h-8 mt-3 flex items-end gap-1" aria-hidden="true">
              <span className="w-1/6 bg-brand-cyan/30 h-3 rounded-t transition-all duration-300 hover:h-5"></span>
              <span className="w-1/6 bg-brand-cyan/40 h-5 rounded-t transition-all duration-300 hover:h-6"></span>
              <span className="w-1/6 bg-brand-cyan/60 h-4 rounded-t transition-all duration-300 hover:h-6"></span>
              <span className="w-1/6 bg-brand-cyan/70 h-7 rounded-t transition-all duration-300 hover:h-8"></span>
              <span className="w-1/6 bg-brand-cyan/80 h-6 rounded-t transition-all duration-300 hover:h-7"></span>
              <span className="w-1/6 bg-brand-cyan h-8 rounded-t"></span>
            </div>
          </motion.div>

          {/* Card 2: Latency */}
          <motion.div
            variants={cardVariants}
            onMouseMove={handleCardMouseMove}
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="spotlight-card bg-brand-surface border border-brand-border p-5 rounded-xl transition-colors duration-200 hover:border-brand-border-hover hover:shadow-[0_0_24px_rgba(16,185,129,0.08)] cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-mono text-brand-muted uppercase">
              <span>Latency p99</span>
              <Gauge className="w-3.5 h-3.5 text-brand-emerald" />
            </div>
            <div className="text-2xl font-bold text-white mt-2 flex items-baseline gap-2">
              <AnimatedCounter value={11.4} decimals={1} suffix="ms" />
              <span className="text-xs font-normal text-brand-emerald font-mono">-2.1ms</span>
            </div>
            <div className="text-[11px] font-mono text-brand-muted mt-2">Edge TLS termination</div>
            <div className="h-8 mt-3 flex items-end gap-1" aria-hidden="true">
              <span className="w-1/6 bg-brand-emerald/50 h-5 rounded-t"></span>
              <span className="w-1/6 bg-brand-emerald/60 h-4 rounded-t"></span>
              <span className="w-1/6 bg-brand-emerald/40 h-6 rounded-t"></span>
              <span className="w-1/6 bg-brand-emerald/70 h-4 rounded-t"></span>
              <span className="w-1/6 bg-brand-emerald/80 h-3 rounded-t"></span>
              <span className="w-1/6 bg-brand-emerald h-3 rounded-t"></span>
            </div>
          </motion.div>

          {/* Card 3: Avg Compute */}
          <motion.div
            variants={cardVariants}
            onMouseMove={handleCardMouseMove}
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="spotlight-card bg-brand-surface border border-brand-border p-5 rounded-xl transition-colors duration-200 hover:border-brand-border-hover hover:shadow-[0_0_24px_rgba(255,255,255,0.06)] cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-mono text-brand-muted uppercase">
              <span>Avg Compute Load</span>
              <Cpu className="w-3.5 h-3.5 text-brand-cyan" />
            </div>
            <div className="text-2xl font-bold text-white mt-2 flex items-baseline gap-2">
              <AnimatedCounter value={38.2} decimals={1} suffix="%" />
              <span className="text-xs font-normal text-brand-muted font-mono">optimal</span>
            </div>
            <div className="text-[11px] font-mono text-brand-muted mt-2">Dynamic autoscaled</div>
            <div className="h-8 mt-3 flex items-end gap-1" aria-hidden="true">
              <span className="w-1/6 bg-white/20 h-4 rounded-t"></span>
              <span className="w-1/6 bg-white/30 h-5 rounded-t"></span>
              <span className="w-1/6 bg-white/20 h-4 rounded-t"></span>
              <span className="w-1/6 bg-white/40 h-6 rounded-t"></span>
              <span className="w-1/6 bg-white/30 h-4 rounded-t"></span>
              <span className="w-1/6 bg-white/60 h-5 rounded-t"></span>
            </div>
          </motion.div>

          {/* Card 4: MTTR */}
          <motion.div
            variants={cardVariants}
            onMouseMove={handleCardMouseMove}
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="spotlight-card bg-brand-surface border border-brand-border p-5 rounded-xl transition-colors duration-200 hover:border-brand-border-hover hover:shadow-[0_0_24px_rgba(0,240,255,0.08)] cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-mono text-brand-muted uppercase">
              <span>MTTR (Mean Recovery)</span>
              <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" />
            </div>
            <div className="text-2xl font-bold text-brand-emerald mt-2 flex items-baseline gap-2">
              <AnimatedCounter value={4.2} decimals={1} suffix="s" />
              <span className="text-xs font-normal text-white font-mono">autonomous</span>
            </div>
            <div className="text-[11px] font-mono text-brand-muted mt-2">0 humans in loop</div>
            <div className="h-8 mt-3 flex items-end gap-1" aria-hidden="true">
              <span className="w-1/6 bg-brand-cyan/40 h-4 rounded-t"></span>
              <span className="w-1/6 bg-brand-cyan/50 h-5 rounded-t"></span>
              <span className="w-1/6 bg-brand-cyan/60 h-4 rounded-t"></span>
              <span className="w-1/6 bg-brand-cyan/70 h-3 rounded-t"></span>
              <span className="w-1/6 bg-brand-cyan/80 h-3 rounded-t"></span>
              <span className="w-1/6 bg-brand-cyan h-2 rounded-t"></span>
            </div>
          </motion.div>
        </motion.div>

        {/* Large SVG Chart Box with Spotlight */}
        <motion.div
          onMouseMove={handleCardMouseMove}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -40px 0px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="spotlight-card rounded-2xl bg-brand-surface border border-brand-border p-6 sm:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.6)] relative overflow-hidden"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
            <div>
              <h3 className="text-base font-semibold text-white">Continuous Ingress &amp; Auto-Remediation Timeline</h3>
              <p className="text-xs font-mono text-brand-muted">Real-time eBPF packet trace over 14 global edge clusters</p>
            </div>
            
            <div className="flex items-center gap-1.5 font-mono text-xs bg-brand-card p-1 rounded-lg border border-brand-border">
              {ranges.map((r) => (
                <button
                  key={r}
                  onClick={() => setActiveRange(r)}
                  className={`px-3 py-1 rounded transition-all duration-200 active:scale-95 ${
                    activeRange === r
                      ? 'bg-brand-elevated text-white border border-brand-border shadow-sm font-medium'
                      : 'text-brand-muted hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Visual Line Chart with Interactive Scrubber */}
          <div
            className="w-full h-48 sm:h-64 relative cursor-crosshair overflow-hidden select-none"
            onMouseMove={handleChartMouseMove}
            onMouseLeave={() => setScrubberPos(null)}
          >
            <svg viewBox="0 0 1000 240" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              <line x1="0" y1="60" x2="1000" y2="60" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <line x1="0" y1="120" x2="1000" y2="120" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <line x1="0" y1="180" x2="1000" y2="180" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              
              {/* Shaded Area */}
              <path
                d="M0,180 Q 200,120 400,140 T 700,70 T 850,110 T 1000,60 L 1000,240 L 0,240 Z"
                fill="url(#chartGlow)"
              />
              
              {/* Main Stroke Line with Animated Draw-in */}
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                d="M0,180 Q 200,120 400,140 T 700,70 T 850,110 T 1000,60"
                fill="none"
                stroke="#00F0FF"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              
              {/* Permanent Incident Remediation Marker */}
              <circle cx="700" cy="70" r="5" fill="#10B981" stroke="#070809" strokeWidth="2" />
              <line
                x1="700"
                y1="0"
                x2="700"
                y2="240"
                stroke="#10B981"
                strokeDasharray="3 3"
                strokeWidth="1.2"
                opacity="0.6"
              />

              {/* Dynamic Mouse Scrubber Line & Dot (Exactly Tracking the SVG Curve) */}
              {scrubberPos && (
                <>
                  <line
                    x1={scrubberPos.x}
                    y1="0"
                    x2={scrubberPos.x}
                    y2="240"
                    stroke="#00F0FF"
                    strokeDasharray="2 2"
                    strokeWidth="1.5"
                    opacity="0.8"
                  />
                  {/* Outer glowing halo ring on the curve */}
                  <circle
                    cx={scrubberPos.x}
                    cy={scrubberPos.y}
                    r="10"
                    fill="#00F0FF"
                    opacity="0.25"
                  />
                  {/* Exact point centered precisely on the line */}
                  <circle
                    cx={scrubberPos.x}
                    cy={scrubberPos.y}
                    r="4.5"
                    fill="#00F0FF"
                    stroke="#070809"
                    strokeWidth="2"
                  />
                </>
              )}
            </svg>
            
            {/* Dynamic Scrubber Tooltip with Real-time Values from Curve Height */}
            {scrubberPos ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.15 }}
                className="absolute top-3 pointer-events-none bg-brand-elevated border border-brand-cyan/40 px-3 py-1.5 rounded-md text-[11px] font-mono shadow-2xl z-20"
                style={{
                  left: `${Math.min(85, Math.max(15, scrubberPos.pct * 100))}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="text-brand-cyan font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse"></span>
                  <span>
                    p99 Latency: {(8.0 + ((240 - scrubberPos.y) / 240) * 8.5).toFixed(1)}ms
                  </span>
                </div>
                <div className="text-white/70 text-[10px]">
                  Throughput: {(35.0 + ((240 - scrubberPos.y) / 240) * 25.0).toFixed(1)}k RPS
                </div>
              </motion.div>
            ) : (
              <div className="absolute top-4 left-[68%] -translate-x-1/2 bg-brand-elevated border border-brand-emerald/40 px-3 py-1.5 rounded-md text-[11px] font-mono shadow-xl pointer-events-none hidden sm:block">
                <span className="text-brand-emerald">● Self-Heal Triggered:</span>{' '}
                <span className="text-white">Worker recovered in 3.8s</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs font-mono text-brand-muted border-t border-brand-border pt-3">
            <span>00:00 UTC</span>
            <span>04:00 UTC</span>
            <span>08:00 UTC</span>
            <span>12:00 UTC</span>
            <span>16:00 UTC</span>
            <span>Now (Live)</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
