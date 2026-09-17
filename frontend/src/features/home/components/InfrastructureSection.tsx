import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Network, Server, Layers, Database, ShieldCheck, Activity, Cpu, HardDrive } from 'lucide-react';
import type { TelemetryService } from '../types';

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
  hidden: { opacity: 0, y: 20, scale: 0.96 },
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

interface ServiceItem extends TelemetryService {
  region: string;
  cpuNum: number;
  memNum: number;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}

const SERVICES: ServiceItem[] = [
  {
    id: 'edge-ingress',
    name: 'Global Edge Ingress',
    role: 'Anycast BGP & TLS 1.3 Termination',
    cpu: '18%',
    cpuNum: 18,
    mem: '32%',
    memNum: 32,
    uptime: '99.999%',
    rpsOrIops: 'RPS: 48,200',
    latencyOrLag: 'p50: 3.8ms',
    status: 'healthy',
    region: '34 Global PoPs',
    icon: Network,
    accent: '#00F0FF'
  },
  {
    id: 'api-production',
    name: 'API Gateway Cluster',
    role: 'Rust & Go eBPF MicroVM Fleet',
    cpu: '42%',
    cpuNum: 42,
    mem: '61%',
    memNum: 61,
    uptime: '99.99%',
    rpsOrIops: 'Replicas: 16 Pods',
    latencyOrLag: 'p99: 11.2ms',
    status: 'healthy',
    region: 'Multi-AZ Active',
    icon: Server,
    accent: '#0EA5E9'
  },
  {
    id: 'worker-fleet',
    name: 'Async Worker Fleet',
    role: 'Event Queues & Background Crons',
    cpu: '64%',
    cpuNum: 64,
    mem: '58%',
    memNum: 58,
    uptime: '99.98%',
    rpsOrIops: 'Throughput: 1,840 j/s',
    latencyOrLag: 'Queue Lag: 0.0s',
    status: 'healthy',
    region: 'Autonomous Scale',
    icon: Layers,
    accent: '#F59E0B'
  },
  {
    id: 'db-mesh',
    name: 'Data Storage Mesh',
    role: 'Distributed Read-Replica Consensus',
    cpu: '29%',
    cpuNum: 29,
    mem: '74%',
    memNum: 74,
    uptime: '99.999%',
    rpsOrIops: 'IOPS: 12,000',
    latencyOrLag: 'Replication: 0.8ms',
    status: 'healthy',
    region: 'Geo-Replicated',
    icon: Database,
    accent: '#10B981'
  }
];

export function InfrastructureSection() {
  const [selectedServiceId, setSelectedServiceId] = useState<string>('api-production');
  const [livePing, setLivePing] = useState(12);

  // Subtle live ping oscillation
  useEffect(() => {
    const timer = setInterval(() => {
      setLivePing(Math.floor(11 + Math.random() * 3));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const selectedService = SERVICES.find(s => s.id === selectedServiceId) || SERVICES[1];

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <section id="infrastructure" className="py-24 sm:py-28 border-t border-white/[0.08] relative z-10 bg-[#070809]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[450px] bg-accent-blue/[0.02] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -40px 0px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mb-12 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-accent-cyan mb-3">
            <Activity className="w-3.5 h-3.5" />
            <span>CONTINUOUS OBSERVABILITY &amp; MESH TELEMETRY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3 font-sans">
            Your infrastructure, always watched.
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 font-mono leading-relaxed">
            DeployForge continuously inspects service health, network jitter, and memory saturation — reacting autonomously the millisecond an anomaly surfaces.
          </p>
        </motion.div>

        {/* Interactive Topography Showcase Box */}
        <motion.div
          onMouseMove={handleCardMouseMove}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -40px 0px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="spotlight-card rounded-2xl bg-[#090B0E]/95 border border-white/[0.1] p-5 sm:p-8 relative overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-all duration-300 hover:border-white/20"
        >
          {/* Subtle Grid Accent */}
          <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none" />

          {/* Topology Header Breadcrumb & Live Mesh Consensus */}
          <div className="relative z-10 mb-6 pb-4 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="text-accent-cyan font-semibold">Active Topology Matrix</span>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-300">4 Interconnected Autonomous Microservices</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-accent-emerald text-[11px]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-emerald opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-emerald" />
                </span>
                <span>Consensus: 100% Synced</span>
              </div>
              <span className="text-neutral-700 hidden sm:inline">·</span>
              <span className="text-[11px] text-neutral-400 hidden sm:inline font-mono">
                p99 Latency: <span className="text-accent-cyan font-semibold">{livePing}ms</span>
              </span>
            </div>
          </div>

          {/* 4 Interactive Service Telemetry Cards Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px 0px -30px 0px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10"
          >
            {SERVICES.map((service, idx) => {
              const Icon = service.icon;
              const isSelected = selectedServiceId === service.id;

              return (
                <motion.div
                  key={service.id}
                  variants={cardVariants}
                  onClick={() => setSelectedServiceId(service.id)}
                  onMouseMove={handleCardMouseMove}
                  whileHover={{ y: -3, scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  className={`spotlight-card relative p-4 sm:p-5 rounded-2xl cursor-pointer border flex flex-col justify-between transition-all duration-200 select-none ${
                    isSelected
                      ? 'bg-[#101318] border-accent-cyan/70 shadow-[0_0_30px_rgba(0,240,255,0.16)] ring-1 ring-accent-cyan/30'
                      : 'bg-[#0B0D10]/80 border-white/[0.08] hover:border-white/20 hover:bg-[#101216]'
                  }`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Inspect ${service.name} telemetry`}
                >
                  {/* Top Glowing Active Bar */}
                  {isSelected && (
                    <motion.div
                      layoutId="active-infrastructure-bar"
                      className="absolute -top-[1px] left-4 right-4 h-[2px] bg-accent-cyan shadow-[0_0_8px_#00F0FF]"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}

                  <div>
                    {/* Header: Icon & Node Pill */}
                    <div className="flex items-center justify-between mb-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                          isSelected
                            ? 'bg-accent-cyan/15 text-accent-cyan shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                            : 'bg-white/[0.04] text-neutral-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/25 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
                        <span>Node 0{idx + 1}</span>
                      </span>
                    </div>

                    {/* Title & Role */}
                    <div className="font-semibold text-sm sm:text-base tracking-tight text-white font-sans mb-1">
                      {service.name}
                    </div>
                    <div className="text-[11px] font-mono text-neutral-400 truncate mb-4">
                      {service.role}
                    </div>

                    {/* Mini Dynamic CPU & Memory Meters */}
                    <div className="space-y-2 py-2 px-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <div>
                        <div className="flex justify-between text-[10px] font-mono text-neutral-500 mb-1">
                          <span>CPU</span>
                          <span className="text-neutral-300 font-semibold">{service.cpu}</span>
                        </div>
                        <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-accent-cyan"
                            initial={{ width: 0 }}
                            whileInView={{ width: service.cpu }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-mono text-neutral-500 mb-1">
                          <span>MEM</span>
                          <span className="text-neutral-300 font-semibold">{service.mem}</span>
                        </div>
                        <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-accent-emerald"
                            initial={{ width: 0 }}
                            whileInView={{ width: service.mem }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Readout */}
                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-neutral-400">
                    <span className="truncate">{service.rpsOrIops}</span>
                    <span className="text-accent-cyan font-semibold shrink-0 ml-1">{service.latencyOrLag}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Floating Inspect Popover Panel with Live Telemetry */}
          <div className="relative z-10 mt-6 p-4 sm:p-5 bg-[#101318]/95 border border-white/[0.1] rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-xs shadow-inner backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-emerald opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-emerald shadow-[0_0_8px_#10B981]" />
              </span>
              <div>
                <span className="text-neutral-500 text-[11px]">ACTIVE TELEMETRY PROBE: </span>
                <span className="text-white font-semibold text-sm font-sans">{selectedService.name}</span>
                <span className="text-neutral-500 text-[10px] ml-2 hidden sm:inline font-mono">[{selectedService.id}]</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedService.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 text-xs w-full md:w-auto"
              >
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase font-mono">Status</span>
                  <span className="text-accent-emerald font-semibold flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Healthy · Verified</span>
                  </span>
                </div>

                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase font-mono">Region Scope</span>
                  <span className="text-white font-medium flex items-center gap-1 mt-0.5">
                    <Cpu className="w-3.5 h-3.5 text-accent-cyan" />
                    <span>{selectedService.region}</span>
                  </span>
                </div>

                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase font-mono">IOPS / Memory</span>
                  <span className="text-white font-medium flex items-center gap-1 mt-0.5">
                    <HardDrive className="w-3.5 h-3.5 text-accent-amber" />
                    <span>{selectedService.mem} Allocation</span>
                  </span>
                </div>

                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase font-mono">SLA Guarantee</span>
                  <span className="text-accent-cyan font-semibold block mt-0.5">
                    {selectedService.uptime} Available
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </motion.div>

      </div>
    </section>
  );
}
