import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Network, Server, Layers, Database, ShieldCheck } from 'lucide-react';
import type { TelemetryService } from '../types';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
};

const cardVariants: Variants = {
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

export function InfrastructureSection() {
  const services: TelemetryService[] = [
    {
      id: 'edge-ingress',
      name: 'Global Edge Ingress',
      role: 'Anycast DNS & TLS 1.3',
      cpu: '18%',
      mem: '32%',
      uptime: '99.999%',
      rpsOrIops: 'RPS: 48,200',
      latencyOrLag: 'p50: 4ms',
      status: 'healthy'
    },
    {
      id: 'api-production',
      name: 'API Gateway Cluster',
      role: 'Node / Go / Rust Workers',
      cpu: '42%',
      mem: '61%',
      uptime: '99.99%',
      rpsOrIops: 'Replicas: 16',
      latencyOrLag: 'CPU: 42%',
      status: 'healthy'
    },
    {
      id: 'worker-fleet',
      name: 'Async Worker Fleet',
      role: 'Queue & Cron Workloads',
      cpu: '64%',
      mem: '58%',
      uptime: '99.98%',
      rpsOrIops: 'Jobs/sec: 1,840',
      latencyOrLag: 'Lag: 0.0s',
      status: 'healthy'
    },
    {
      id: 'db-mesh',
      name: 'Data Storage Mesh',
      role: 'Postgres Multi-Region',
      cpu: '29%',
      mem: '74%',
      uptime: '99.999%',
      rpsOrIops: 'IOPS: 12,000',
      latencyOrLag: 'Sync: Active',
      status: 'healthy'
    }
  ];

  const [selectedService, setSelectedService] = useState<TelemetryService>(services[1]);

  const getIcon = (id: string) => {
    switch (id) {
      case 'edge-ingress':
        return Network;
      case 'api-production':
        return Server;
      case 'worker-fleet':
        return Layers;
      case 'db-mesh':
      default:
        return Database;
    }
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <section id="infrastructure" className="py-28 border-t border-brand-border relative z-10">
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
            Continuous Observability &amp; Mesh Telemetry
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            Your infrastructure, always watched.
          </h2>
          <p className="text-base text-brand-muted leading-relaxed">
            DeployForge continuously checks the health of your services, probes network thresholds, and reacts autonomously the instant anomalies emerge.
          </p>
        </motion.div>

        {/* Interactive Topography Box */}
        <motion.div
          onMouseMove={handleCardMouseMove}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -40px 0px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="spotlight-card rounded-2xl bg-brand-surface border border-brand-border p-6 sm:p-10 relative overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
        >
          {/* Topology Interconnect Breadcrumb */}
          <div className="mb-6 pb-4 border-b border-brand-border flex items-center justify-between text-xs font-mono text-brand-muted">
            <div className="flex items-center gap-2">
              <span className="text-brand-cyan font-medium">Topology Mesh</span>
              <span className="text-white/20">•</span>
              <span>4 interconnected autonomous micro-services</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-brand-emerald">
              <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse"></span>
              <span>Mesh Consensus: 100% Synced</span>
            </div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px 0px -30px 0px" }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 relative z-10"
          >
            {services.map((service, idx) => {
              const Icon = getIcon(service.id);
              const isSelected = selectedService.id === service.id;

              return (
                <motion.div
                  key={service.id}
                  variants={cardVariants}
                  onClick={() => setSelectedService(service)}
                  onMouseEnter={() => setSelectedService(service)}
                  onMouseMove={handleCardMouseMove}
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={`spotlight-card p-5 rounded-xl cursor-pointer border flex flex-col justify-between transition-colors duration-200 ${
                    isSelected
                      ? 'bg-brand-card border-brand-cyan/70 shadow-[0_0_28px_rgba(0,240,255,0.14)]'
                      : 'bg-brand-card/60 border-brand-border hover:border-brand-border-hover hover:bg-brand-card hover:shadow-[0_0_16px_rgba(255,255,255,0.04)]'
                  }`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${service.name} telemetry`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                          isSelected
                            ? 'bg-brand-cyan-dim text-brand-cyan scale-105'
                            : 'bg-white/[0.04] text-brand-muted'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-emerald-dim text-brand-emerald border border-brand-emerald/20 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse"></span>
                        <span>Node 0{idx + 1}</span>
                      </span>
                    </div>

                    <div className={`font-semibold text-base transition-colors ${isSelected ? 'text-white' : 'text-white/90'}`}>
                      {service.name}
                    </div>
                    <div className="text-xs font-mono text-brand-muted mt-1">
                      {service.role}
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-brand-border flex items-center justify-between text-[11px] font-mono text-brand-muted">
                    <span>{service.rpsOrIops}</span>
                    <span className="text-brand-cyan font-semibold">{service.latencyOrLag}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Floating Inspect Popover Panel with Live Telemetry Oscillations */}
          <div className="mt-8 p-4 sm:p-5 bg-brand-elevated border border-brand-border rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-xs shadow-inner">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-emerald opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-emerald"></span>
              </span>
              <div>
                <span className="text-brand-muted">Active Inspector: </span>
                <span className="text-white font-semibold text-sm">{selectedService.name}</span>
                <span className="text-brand-muted text-[11px] ml-2 hidden sm:inline">[{selectedService.id}]</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedService.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs w-full md:w-auto"
              >
                <div>
                  <span className="text-brand-muted block text-[10px] uppercase">Status</span>
                  <span className="text-brand-emerald font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Healthy</span>
                  </span>
                </div>
                <div>
                  <span className="text-brand-muted block text-[10px] uppercase">CPU Load</span>
                  <span className="text-white font-medium">{selectedService.cpu}</span>
                </div>
                <div>
                  <span className="text-brand-muted block text-[10px] uppercase">Memory</span>
                  <span className="text-white font-medium">{selectedService.mem}</span>
                </div>
                <div>
                  <span className="text-brand-muted block text-[10px] uppercase">SLA Target</span>
                  <span className="text-brand-cyan font-medium">{selectedService.uptime}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </motion.div>

      </div>
    </section>
  );
}
