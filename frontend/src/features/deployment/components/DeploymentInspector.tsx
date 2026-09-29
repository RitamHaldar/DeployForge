import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server,
  Terminal,
  Activity,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import type { DeploymentRecord, InspectorTab } from '../types';
import { DeploymentInfrastructure } from './DeploymentInfrastructure';
import { DeploymentLogs } from './DeploymentLogs';
import { DeploymentHealth } from './DeploymentHealth';

interface DeploymentInspectorProps {
  deployment: DeploymentRecord;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  defaultTab?: InspectorTab;
}

export function DeploymentInspector({
  deployment,
  isExpanded = false,
  onToggleExpand,
  defaultTab = 'infrastructure',
}: DeploymentInspectorProps) {
  const [activeTab, setActiveTab] = useState<InspectorTab>(defaultTab);

  const tabs: { id: InspectorTab; label: string; icon: typeof Server }[] = [
    { id: 'infrastructure', label: 'Infrastructure', icon: Server },
    { id: 'logs', label: 'Runtime Logs', icon: Terminal },
    { id: 'health', label: 'Health & Probes', icon: Activity },
  ];

  return (
    <div className="w-full h-full flex flex-col rounded-xl bg-[#090B0E] border border-white/[0.08] shadow-[0_15px_50px_rgba(0,0,0,0.7)] overflow-hidden">
      
      {/* Inspector Header & Tab Navigation */}
      <div className="h-11 px-3 bg-[#0D0F14] border-b border-white/[0.06] flex items-center justify-between gap-2 select-none shrink-0">
        
        {/* Segmented Tab Controls */}
        <div className="flex items-center gap-1 p-0.5 bg-black/40 border border-white/[0.06] rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all select-none ${
                  isActive
                    ? 'text-white'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeInspectorTab"
                    className="absolute inset-0 rounded-md bg-white/[0.08] border border-white/[0.12] shadow-sm"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.3 }}
                  />
                )}
                <Icon
                  className={`w-3.5 h-3.5 relative z-10 ${
                    isActive ? 'text-cyan-400' : 'text-neutral-400'
                  }`}
                />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action: Expand/Collapse */}
        <div className="flex items-center gap-1.5">
          {onToggleExpand && (
            <button
              type="button"
              onClick={onToggleExpand}
              className="p-1 rounded-md text-neutral-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] transition-all"
              title={isExpanded ? 'Restore split layout' : 'Focus inspector'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Tab Viewport */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {activeTab === 'infrastructure' && (
            <motion.div
              key="infrastructure"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4 space-y-3"
            >
              <DeploymentInfrastructure
                deployment={deployment}
                onViewLogs={() => setActiveTab('logs')}
                onViewHealth={() => setActiveTab('health')}
              />
            </motion.div>
          )}

          {activeTab === 'logs' && (
            <motion.div
              key="logs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 min-h-0 flex flex-col overflow-hidden"
            >
              <DeploymentLogs deployment={deployment} />
            </motion.div>
          )}

          {activeTab === 'health' && (
            <motion.div
              key="health"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4 space-y-3"
            >
              <DeploymentHealth deployment={deployment} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="h-7 px-4 bg-[#0A0C10] border-t border-white/[0.06] flex items-center justify-between text-[11px] text-neutral-500 font-mono select-none shrink-0">
        <span>Workload: {deployment.containerId || 'deployforge-pod'}</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-emerald-400 font-sans">Healthy</span>
        </div>
      </div>
    </div>
  );
}
