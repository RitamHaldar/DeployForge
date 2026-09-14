import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

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

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
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

export function DeploymentLifecycleSection() {
  const stages = [
    {
      num: '01',
      title: 'Git Push',
      subtitle: 'Webhook verification',
      rows: [
        { label: 'commit', val: '8f72a1c', color: 'text-white' },
        { label: 'author', val: '@alex', color: 'text-brand-muted' },
        { label: 'branch', val: 'main', color: 'text-brand-emerald' }
      ]
    },
    {
      num: '02',
      title: 'Build',
      subtitle: 'Turbopack compilation',
      rows: [
        { label: 'Duration', val: '31s', color: 'text-white' },
        { label: 'Cache hit', val: '94%', color: 'text-brand-muted' },
        { label: 'Status', val: 'exit code 0', color: 'text-brand-emerald' }
      ]
    },
    {
      num: '03',
      title: 'Container',
      subtitle: 'OCI distroless image',
      rows: [
        { label: 'Size', val: '42.1 MB', color: 'text-white' },
        { label: 'Vulnerabilities', val: '0', color: 'text-brand-muted' },
        { label: 'Signature', val: 'Signed by Cosign', color: 'text-brand-emerald' }
      ]
    },
    {
      num: '04',
      title: 'Deploy',
      subtitle: 'Canary rolling traffic',
      rows: [
        { label: 'Deployment', val: 'dep_982b14', color: 'text-white' },
        { label: 'Shift', val: '10% → 100%', color: 'text-brand-muted' },
        { label: 'Routing', val: 'eBPF routed', color: 'text-brand-emerald' }
      ]
    },
    {
      num: '05',
      title: 'Health Check',
      subtitle: 'Synthetic assertions',
      rows: [
        { label: 'Probe', val: 'HTTP /health 200', color: 'text-white' },
        { label: 'Latency', val: '8ms', color: 'text-brand-muted' },
        { label: 'Consensus', val: 'Passed 24/24 nodes', color: 'text-brand-emerald' }
      ]
    },
    {
      num: '06',
      title: 'Live',
      subtitle: 'Global edge promotion',
      isAccent: true,
      rows: [
        { label: 'Security', val: 'TLS 1.3 Certified', color: 'text-white' },
        { label: 'Availability', val: 'Zero downtime', color: 'text-brand-muted' },
        { label: 'Watchdog', val: 'Protected by Forge', color: 'text-brand-emerald' }
      ]
    }
  ];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <section id="pipeline" className="py-28 border-t border-brand-border relative z-10 bg-brand-bg/40">
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
            Automated Lifecycle
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            From git push to verified global edge.
          </h2>
          <p className="text-base text-brand-muted">
            Every commit triggers continuous isolation, reproducible layer caching, and automated sanity benchmarks.
          </p>
        </motion.div>

        {/* Pipeline Stages Timeline with Stagger Hooks & Spotlight */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px 0px -30px 0px" }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 font-mono text-xs"
        >
          {stages.map((stage) => (
            <motion.div
              key={stage.num}
              variants={itemVariants}
              onMouseMove={handleMouseMove}
              whileHover={{ y: -3, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`spotlight-card p-5 rounded-xl border flex flex-col justify-between transition-colors duration-200 cursor-pointer ${
                stage.isAccent
                  ? 'bg-brand-surface border-brand-emerald/40 shadow-[0_0_24px_rgba(16,185,129,0.08)] hover:border-brand-emerald hover:shadow-[0_0_32px_rgba(16,185,129,0.18)]'
                  : 'bg-brand-surface border-brand-border hover:border-brand-cyan/40 hover:bg-brand-card hover:shadow-[0_0_20px_rgba(0,240,255,0.08)]'
              }`}
            >
              <div>
                <div
                  className={`font-semibold text-sm mb-1 ${
                    stage.isAccent ? 'text-brand-emerald' : 'text-brand-cyan'
                  }`}
                >
                  {stage.num}. {stage.title}
                </div>
                <div className="text-brand-muted mb-4 text-[11px]">{stage.subtitle}</div>
              </div>

              <div className="space-y-1.5 text-[11px] pt-3 border-t border-brand-border">
                {stage.rows.map((row, rIdx) => (
                  <div key={rIdx} className="flex justify-between items-center truncate">
                    <span className="text-brand-muted text-[10px]">{row.label}:</span>
                    <span className={row.color}>{row.val}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
