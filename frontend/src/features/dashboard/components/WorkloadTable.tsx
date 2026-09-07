import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WorkloadItem, WorkloadType } from '../types';
import { ChevronDown, AlertTriangle, CheckCircle2, Radio, Wrench } from 'lucide-react';

interface WorkloadTableProps {
  workloads: WorkloadItem[];
  onTriggerRemediate: (workloadId: string) => void;
}

export const WorkloadTable: React.FC<WorkloadTableProps> = ({
  workloads,
  onTriggerRemediate,
}) => {
  const [activeTab, setActiveTab] = useState<WorkloadType>('Deployments');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Healthy' | 'Remediating'>('All');
  const [selectedNamespace, setSelectedNamespace] = useState<string>('default');
  const [showNamespaceDropdown, setShowNamespaceDropdown] = useState(false);

  const tabs: WorkloadType[] = ['Deployments', 'DaemonSets', 'StatefulSets'];
  const namespaces = ['default', 'kube-system', 'ingress-nginx', 'all'];

  // Filtering
  const filteredWorkloads = workloads.filter((item) => {
    // Type tab
    if (activeTab === 'Deployments' && item.type !== 'Deployments') return false;
    if (activeTab === 'DaemonSets' && item.type !== 'DaemonSets') return false;
    if (activeTab === 'StatefulSets' && item.type !== 'StatefulSets') return false;

    // Namespace
    if (selectedNamespace !== 'all' && item.namespace !== selectedNamespace) return false;

    // Status filter
    if (statusFilter === 'Healthy' && (item.status === 'CrashLoopBackOff' || item.isRemediating)) return false;
    if (statusFilter === 'Remediating' && item.status !== 'CrashLoopBackOff' && !item.isRemediating) return false;

    return true;
  });

  const healthyCount = workloads.filter(w => w.status === 'Running' || w.status === 'Self-Healed').length;
  const remediatingCount = workloads.filter(w => w.status === 'CrashLoopBackOff' || w.isRemediating).length;

  return (
    <div className="section-card flex-1 flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-semibold text-white tracking-tight">
            Live Cluster Workload Health
          </h2>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-950/60 text-cyan-300 border border-cyan-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Streaming (12ms)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-slate-900/90 text-cyan-400 border border-slate-800 hover:border-cyan-700/60 cursor-pointer transition-colors">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            ws://mesh.telemetry/live
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Type Tabs */}
        <div className="flex items-center p-0.5 bg-slate-900/80 rounded-lg border border-slate-800">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all relative ${
                activeTab === tab
                  ? 'text-white bg-indigo-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-indigo-600 rounded-md -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Namespace & Status Badges */}
        <div className="flex items-center gap-2">
          {/* Namespace Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNamespaceDropdown(!showNamespaceDropdown)}
              className="flex items-center gap-1.5 text-xs bg-slate-900/90 border border-slate-800 hover:border-slate-700 px-2.5 py-1 rounded-md text-slate-300 transition-colors"
            >
              <span className="text-slate-500">ns:</span> {selectedNamespace} ({selectedNamespace === 'default' ? '18' : selectedNamespace === 'all' ? '24' : '6'})
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showNamespaceDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 z-20 w-36">
                {namespaces.map((ns) => (
                  <button
                    key={ns}
                    onClick={() => {
                      setSelectedNamespace(ns);
                      setShowNamespaceDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center justify-between ${
                      selectedNamespace === ns ? 'text-cyan-400 bg-cyan-950/40' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{ns}</span>
                    {selectedNamespace === ns && <CheckCircle2 className="w-3 h-3 text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* All count */}
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-2 py-0.5 rounded text-xs transition-colors ${
              statusFilter === 'All'
                ? 'bg-slate-700 text-white font-medium'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-300'
            }`}
          >
            All (24)
          </button>

          {/* Healthy count */}
          <button
            onClick={() => setStatusFilter('Healthy')}
            className={`px-2 py-0.5 rounded text-xs transition-colors ${
              statusFilter === 'Healthy'
                ? 'bg-emerald-950 border border-emerald-700/60 text-emerald-300 font-medium'
                : 'bg-slate-900/80 text-emerald-400 hover:text-emerald-300'
            }`}
          >
            Healthy ({healthyCount})
          </button>

          {/* Remediating count */}
          <button
            onClick={() => setStatusFilter('Remediating')}
            className={`px-2 py-0.5 rounded text-xs transition-colors ${
              statusFilter === 'Remediating'
                ? 'bg-red-950 border border-red-700/60 text-red-300 font-medium'
                : 'bg-slate-900/80 text-red-400 hover:text-red-300'
            }`}
          >
            Remediating ({remediatingCount})
          </button>
        </div>
      </div>

      {/* Workload Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800/80 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
              <th className="pb-2.5 pl-2 font-medium">STATUS</th>
              <th className="pb-2.5 font-medium">WORKLOAD NAME</th>
              <th className="pb-2.5 font-medium">NAMESPACE</th>
              <th className="pb-2.5 font-medium">REPLICAS</th>
              <th className="pb-2.5 font-medium">RESTARTS</th>
              <th className="pb-2.5 font-medium min-w-[110px]">CPU USAGE</th>
              <th className="pb-2.5 font-medium min-w-[110px]">MEMORY USAGE</th>
              <th className="pb-2.5 pr-2 font-medium text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            <AnimatePresence>
              {filteredWorkloads.map((item) => {
                const isAlert = item.status === 'CrashLoopBackOff';
                const isHealing = item.isRemediating;
                const isSelfHealed = item.status === 'Self-Healed';

                return (
                  <motion.tr
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`transition-colors group ${
                      isAlert
                        ? 'bg-red-950/20 hover:bg-red-950/30'
                        : isHealing
                        ? 'bg-purple-950/20 hover:bg-purple-950/30'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* STATUS */}
                    <td className="py-3 pl-2 whitespace-nowrap">
                      {isAlert ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-red-900/60 text-red-300 border border-red-700/60 shadow-[0_0_8px_rgba(239,68,68,0.3)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                          CrashLoopBackOff
                        </span>
                      ) : isHealing ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-purple-900/60 text-purple-300 border border-purple-700/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                          Rolling Back (2/3)
                        </span>
                      ) : isSelfHealed ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-cyan-950/60 text-cyan-300 border border-cyan-800/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          Self-Healed (2m ago)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-950/50 text-emerald-400 border border-emerald-800/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Running
                        </span>
                      )}
                    </td>

                    {/* WORKLOAD NAME */}
                    <td className="py-3 whitespace-nowrap pr-2">
                      <div className="font-mono font-medium text-slate-100 group-hover:text-cyan-300 transition-colors">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {item.subname}
                      </div>
                    </td>

                    {/* NAMESPACE */}
                    <td className="py-3 whitespace-nowrap text-slate-400 font-mono">
                      {item.namespace}
                    </td>

                    {/* REPLICAS */}
                    <td className="py-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                          item.replicasCurrent < item.replicasTarget
                            ? 'bg-slate-800 text-amber-300 border border-amber-800/40'
                            : 'text-emerald-400'
                        }`}
                      >
                        {item.replicasCurrent} / {item.replicasTarget}
                      </span>
                    </td>

                    {/* RESTARTS */}
                    <td className="py-3 whitespace-nowrap font-mono">
                      {item.restarts > 0 && isAlert ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-red-900/60 text-red-200 border border-red-700/60">
                          <AlertTriangle className="w-3 h-3 text-red-400 inline" />
                          {item.restarts}
                        </span>
                      ) : item.restartDetail ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-teal-950/60 text-teal-300 border border-teal-800/40">
                          <CheckCircle2 className="w-3 h-3 text-teal-400 inline" />
                          {item.restartDetail}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>

                    {/* CPU USAGE */}
                    <td className="py-3 whitespace-nowrap pr-3">
                      <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1 font-mono">
                        <span>{item.cpuPercent}%</span>
                        <span className="text-slate-500">{item.cpuCores}</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.cpuPercent > 75
                              ? 'bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.8)]'
                              : 'bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.6)]'
                          }`}
                          style={{ width: `${item.cpuPercent}%` }}
                        />
                      </div>
                    </td>

                    {/* MEMORY USAGE */}
                    <td className="py-3 whitespace-nowrap pr-3">
                      <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1 font-mono">
                        <span>{item.memoryPercent}%</span>
                        <span className="text-slate-500">{item.memoryAmount}</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.memoryPercent > 70
                              ? 'bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.8)]'
                              : 'bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.6)]'
                          }`}
                          style={{ width: `${item.memoryPercent}%` }}
                        />
                      </div>
                    </td>

                    {/* ACTION */}
                    <td className="py-3 pr-2 whitespace-nowrap text-right">
                      {isAlert ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onTriggerRemediate(item.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-[11px] font-medium shadow-md shadow-red-900/40 transition-all cursor-pointer"
                        >
                          <Wrench className="w-3 h-3" />
                          Auto-Heal
                        </motion.button>
                      ) : isHealing ? (
                        <span className="text-purple-400 text-[11px] animate-pulse">
                          Healing...
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[11px]">
                          Nominal
                        </span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};
