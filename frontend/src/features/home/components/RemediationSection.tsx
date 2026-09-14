import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { AlertTriangle, ShieldAlert, RefreshCw, CheckCircle2 } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.05
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1] as const
    }
  }
};

export function RemediationSection() {
  const steps = [
    {
      num: '01',
      title: 'Failure detected',
      desc: 'Heartbeat or HTTP status code deviation flagged in',
      highlight: '< 150ms',
      color: 'text-brand-rose'
    },
    {
      num: '02',
      title: 'Instance isolated',
      desc: 'Traffic instantly rerouted to healthy sisters at the eBPF routing layer.',
      color: 'text-brand-amber'
    },
    {
      num: '03',
      title: 'Replacement initialized',
      desc: 'New warm microVM started with pre-warmed snapshot image.',
      color: 'text-brand-cyan'
    },
    {
      num: '04',
      title: 'Health verified & Traffic restored',
      desc: 'Zero customer impact. Full telemetry report stored for post-mortem analysis.',
      color: 'text-brand-emerald'
    }
  ];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <section id="self-healing" className="py-28 border-t border-brand-border relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left: Explanatory Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -40px 0px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="text-xs font-mono uppercase tracking-widest text-brand-cyan mb-2">
              Automated Incident Remediation
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
              When something breaks, DeployForge reacts.
            </h2>
            <p className="text-base text-brand-muted leading-relaxed mb-8">
              Memory leaks, unhandled exceptions, and host degradation happen in production. Rather than waking an engineer at 3 AM, DeployForge's autonomy engine isolates bad instances and brings up hot standby replicas immediately.
            </p>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "0px 0px -30px 0px" }}
              className="space-y-3.5 font-mono text-xs"
            >
              {steps.map((step) => (
                <motion.div
                  key={step.num}
                  variants={itemVariants}
                  whileHover={{ x: 3 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="flex items-start gap-3.5 p-3.5 rounded-lg bg-brand-surface border border-brand-border transition-colors hover:border-brand-border-hover hover:bg-brand-card cursor-default"
                >
                  <span className={`${step.color} font-bold text-sm shrink-0`}>
                    {step.num}
                  </span>
                  <div>
                    <div className="text-white font-medium text-xs mb-0.5">{step.title}</div>
                    <div className="text-brand-muted text-[11px] leading-normal">
                      {step.desc}{' '}
                      {step.highlight && (
                        <span className="text-brand-cyan font-semibold">{step.highlight}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Metrics Counters with Fluid Spring Interpolation */}
            <div className="mt-8 flex items-center gap-6">
              <div>
                <div className="text-2xl font-bold text-white font-mono">
                  <AnimatedCounter value={0.0} decimals={1} suffix="s" />
                </div>
                <div className="text-xs text-brand-muted">Human latency required</div>
              </div>
              <div className="w-[1px] h-10 bg-brand-border"></div>
              <div>
                <div className="text-2xl font-bold text-brand-emerald font-mono">
                  <AnimatedCounter value={100} decimals={0} suffix="%" />
                </div>
                <div className="text-xs text-brand-muted">Autonomous remediation</div>
              </div>
            </div>
          </motion.div>

          {/* Right: Animated Visual Lifecycle with Spotlight Cards */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -40px 0px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl bg-brand-surface border border-brand-border p-6 sm:p-8 relative shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
          >
            <div className="flex items-center justify-between pb-4 border-b border-brand-border mb-6">
              <span className="text-xs font-mono text-brand-muted">AUTONOMOUS HEALING LIFECYCLE</span>
              <span className="text-xs font-mono text-brand-emerald flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-emerald opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-emerald"></span>
                </span>
                ACTIVE MONITORING
              </span>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "0px 0px -30px 0px" }}
              className="space-y-3.5"
            >
              
              {/* Step 1: Degraded Pod */}
              <motion.div
                variants={itemVariants}
                onMouseMove={handleMouseMove}
                whileHover={{ x: 3, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="spotlight-card p-4 rounded-xl bg-brand-card border border-brand-border flex items-center justify-between transition-colors hover:border-brand-rose/40 hover:shadow-[0_0_20px_rgba(239,68,68,0.12)] cursor-default"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-rose-dim text-brand-rose flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-white font-medium">Degraded Pod Flagged</div>
                    <div className="text-[11px] font-mono text-brand-muted">HTTP 502 returned on node-us-east-4</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-brand-rose font-semibold">T + 0.12s</span>
              </motion.div>

              {/* Step 2: Isolation */}
              <motion.div
                variants={itemVariants}
                onMouseMove={handleMouseMove}
                whileHover={{ x: 3, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="spotlight-card p-4 rounded-xl bg-brand-card border border-brand-border flex items-center justify-between transition-colors hover:border-brand-amber/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.12)] cursor-default"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-amber-dim text-brand-amber flex items-center justify-center">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-white font-medium">BGP &amp; Ingress Detached</div>
                    <div className="text-[11px] font-mono text-brand-muted">Drained 148 active HTTP keepalives</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-brand-amber font-semibold">T + 0.84s</span>
              </motion.div>

              {/* Step 3: Replacement */}
              <motion.div
                variants={itemVariants}
                onMouseMove={handleMouseMove}
                whileHover={{ x: 3, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="spotlight-card p-4 rounded-xl bg-brand-card border border-brand-cyan/40 shadow-[0_0_20px_rgba(0,240,255,0.08)] flex items-center justify-between transition-colors hover:border-brand-cyan hover:shadow-[0_0_24px_rgba(0,240,255,0.15)] cursor-default"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-cyan-dim text-brand-cyan flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-white font-medium">Replica Pod Bootstrapped</div>
                    <div className="text-[11px] font-mono text-brand-muted">Warm clone promoted: node-us-east-5</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-brand-cyan font-semibold">T + 2.10s</span>
              </motion.div>

              {/* Step 4: Recovered */}
              <motion.div
                variants={itemVariants}
                onMouseMove={handleMouseMove}
                whileHover={{ x: 3, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="spotlight-card p-4 rounded-xl bg-brand-card border border-brand-emerald/40 shadow-[0_0_16px_rgba(16,185,129,0.08)] flex items-center justify-between transition-colors hover:border-brand-emerald hover:shadow-[0_0_24px_rgba(16,185,129,0.18)] cursor-default"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-emerald-dim text-brand-emerald flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-white font-medium">Service Fully Restored</div>
                    <div className="text-[11px] font-mono text-brand-muted">All 100% requests served without packet loss</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-brand-emerald font-semibold">Total: 3.8s</span>
              </motion.div>

            </motion.div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
