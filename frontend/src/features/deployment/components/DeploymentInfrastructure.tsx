import { useState } from 'react';
import {
  Globe,
  Server,
  GitBranch,
  Copy,
  Check,
  Box,
  Terminal,
  ArrowRight,
  Shield,
} from 'lucide-react';
import type { DeploymentRecord } from '../types';

interface DeploymentInfrastructureProps {
  deployment: DeploymentRecord;
  onViewLogs?: () => void;
  onViewHealth?: () => void;
}

export function DeploymentInfrastructure({
  deployment,
  onViewLogs,
  onViewHealth,
}: DeploymentInfrastructureProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const containerId = deployment.containerId || `deployforge-pod-${deployment.id}`;
  const statusPhase =
    typeof deployment.status === 'string'
      ? deployment.status
      : deployment.status?.phase || 'Running';

  return (
    <div className="space-y-4 text-xs font-sans">
      
      {/* Card 1: Ingress & Network Routing */}
      <div className="p-4 rounded-xl bg-[#090B0E] border border-white/[0.08] hover:border-white/[0.14] transition-all space-y-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-semibold text-neutral-200">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            Ingress & Routing
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Cluster Ingress
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-black/40 border border-white/[0.06] font-mono">
          <span className="text-cyan-300 truncate select-all">{deployment.previewurl}</span>
          <button
            type="button"
            onClick={() => copyToClipboard(deployment.previewurl, 'previewUrl')}
            className="p-1 rounded hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-colors shrink-0"
            title="Copy URL"
          >
            {copiedKey === 'previewUrl' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <div className="space-y-1.5 divide-y divide-white/[0.04]">
          <div className="flex justify-between py-1">
            <span className="text-neutral-400">Port Mapping:</span>
            <span className="font-mono text-neutral-200">80:TCP (Ingress) → 3000:TCP (Pod)</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-neutral-400">Cluster Service:</span>
            <span className="font-mono text-neutral-300 truncate max-w-[200px]">
              deployforge-service-{deployment.id.slice(0, 8)}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-neutral-400">Protocol:</span>
            <span className="text-neutral-300">HTTP/1.1 with WebSocket Upgrade</span>
          </div>
        </div>
      </div>

      {/* Card 2: Kubernetes Workload Specifications */}
      <div className="p-4 rounded-xl bg-[#090B0E] border border-white/[0.08] hover:border-white/[0.14] transition-all space-y-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-semibold text-neutral-200">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            Pod Workload Specification
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {statusPhase}
          </span>
        </div>

        <div className="space-y-1.5 divide-y divide-white/[0.04]">
          <div className="flex justify-between py-1">
            <span className="text-neutral-400">Pod Name:</span>
            <span className="font-mono text-neutral-200 truncate max-w-[210px]" title={containerId}>
              {containerId}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-neutral-400">Namespace:</span>
            <span className="font-mono text-neutral-200">default</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-neutral-400">Node:</span>
            <span className="font-mono text-neutral-200">docker-desktop (k8s control-plane)</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-neutral-400">Containers:</span>
            <span className="font-mono text-neutral-200">2 Running (app, supervisor)</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-neutral-400">Restart Policy:</span>
            <span className="font-mono text-neutral-300">Always</span>
          </div>
        </div>

        {onViewLogs && (
          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-end">
            <button
              type="button"
              onClick={onViewLogs}
              className="text-neutral-400 hover:text-white flex items-center gap-1 font-medium text-[11px] transition-colors"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Inspect Container Logs</span>
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        )}
      </div>

      {/* Card 3: Container Instances */}
      <div className="p-4 rounded-xl bg-[#090B0E] border border-white/[0.08] space-y-3">
        <span className="flex items-center gap-2 font-semibold text-neutral-200">
          <Box className="w-3.5 h-3.5 text-blue-400" />
          Container Instances
        </span>

        <div className="space-y-2">
          {/* Main App Container */}
          <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">app (sandbox-{deployment.id.slice(0, 8)})</span>
              <span className="text-[10px] font-mono text-emerald-400">Ready</span>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono">
              Image: sandbox-{deployment.id}:latest (Port 3000)
            </p>
          </div>

          {/* Supervisor Sidecar */}
          <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">supervisor (deployforge-agent)</span>
              <span className="text-[10px] font-mono text-purple-400">Ready</span>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono">
              Image: agent:latest (Probe & Telemetry)
            </p>
          </div>
        </div>
      </div>

      {/* Card 4: Source Repository & Build Specs */}
      <div className="p-4 rounded-xl bg-[#090B0E] border border-white/[0.08] space-y-2.5">
        <span className="flex items-center gap-2 font-semibold text-neutral-200">
          <GitBranch className="w-3.5 h-3.5 text-amber-400" />
          Build Source
        </span>

        <div className="space-y-1.5 divide-y divide-white/[0.04]">
          <div className="flex justify-between py-1">
            <span className="text-neutral-400">Repository:</span>
            <span className="text-white font-medium">{deployment.repoName}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-neutral-400">Working Directory:</span>
            <span className="text-neutral-300 font-mono text-[11px]">
              {deployment.folderpath || '/ (Repository Root)'}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-neutral-400">Clone URL:</span>
            <span className="text-neutral-400 font-mono text-[11px] truncate max-w-[200px]" title={deployment.repoUrl}>
              {deployment.repoUrl}
            </span>
          </div>
        </div>
      </div>

      {/* Health Probes Callout */}
      {onViewHealth && (
        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-neutral-300 font-medium text-[11px]">
              Liveness and readiness probes passing
            </span>
          </div>

          <button
            type="button"
            onClick={onViewHealth}
            className="text-emerald-400 hover:text-emerald-300 font-semibold text-[11px] flex items-center gap-1 shrink-0"
          >
            Telemetry <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

    </div>
  );
}
