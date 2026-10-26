import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Bot,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Cpu,
  ShieldCheck,
  Wand2,
} from 'lucide-react';
import { runAgentAutoFix } from '../services/deployment.api';
import type { DeploymentRecord, AgentFixResult } from '../types';

interface DeploymentAgentProps {
  deployment: DeploymentRecord;
  onViewLogs?: () => void;
  onViewHealth?: () => void;
}

export function DeploymentAgent({
  deployment,
  onViewLogs,
  onViewHealth,
}: DeploymentAgentProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<AgentFixResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const containerId =
    deployment.containerId || `deployforge-pod-${deployment.id.slice(0, 8)}`;
  const agentUrl =
    deployment.agenturl || `http://${deployment.id}.agent.localhost`;

  const steps = [
    { title: 'Connecting to Pod Sidecar', desc: `Agent port :4000 at ${agentUrl}` },
    { title: 'Inspecting Pod Logs & Nodes', desc: `Target workload: ${containerId}` },
    { title: 'Scanning Workspace Structure', desc: 'Running fileListTool & readFileTool' },
    { title: 'Reasoning & Generating Fix', desc: 'Codestral / GPT engine analyzing root cause' },
    { title: 'Patching Workspace Files', desc: 'Executing updateFileTool safely' },
  ];

  const handleRunFix = async () => {
    setIsRunning(true);
    setErrorMessage(null);
    setResult(null);
    setActiveStep(0);

    // Simulate progressive step transitions for engaging feedback
    const t1 = setTimeout(() => setActiveStep(1), 1200);
    const t2 = setTimeout(() => setActiveStep(2), 3000);
    const t3 = setTimeout(() => setActiveStep(3), 6000);

    try {
      const response = await runAgentAutoFix({
        agentUrl,
        podName: containerId,
        customPrompt: customPrompt.trim() || undefined,
      });

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setActiveStep(4);

      setResult({
        success: response.success ?? true,
        fixed: response.fixed ?? false,
        message: response.message || 'Diagnostic cycle complete',
        result: response.result || response.details || '',
        details: response.details,
        timestamp: new Date().toLocaleTimeString(),
        podname: containerId,
      });
    } catch (err: any) {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setErrorMessage(
        err.message ||
          'Failed to execute agent diagnostic. Check if the sidecar agent container is running.'
      );
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyResult = async () => {
    const textToCopy = result?.result || result?.details || result?.message || '';
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* Banner Card: Autonomous Agent Controller */}
      <div className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-[#0c1017] via-[#090b0e] to-[#0d131f] border border-cyan-500/20 shadow-lg shadow-cyan-950/20 space-y-3">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-100 text-sm">
                  DeployForge AI Healing Agent
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
                  Sidecar Active
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Inspects pod logs, traces root causes, and applies verified fixes to workspace files.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-neutral-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>:4000</span>
          </div>
        </div>

        {/* Target Details Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-lg bg-black/40 border border-white/[0.06] text-[11px]">
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className="text-neutral-500">Target Workload:</span>
            <span className="font-mono text-neutral-200 truncate">{containerId}</span>
          </div>
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className="text-neutral-500">Agent Endpoint:</span>
            <span className="font-mono text-cyan-400 truncate">{agentUrl}</span>
          </div>
        </div>

        {/* Optional Custom Instructions Accordion */}
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            {showAdvanced ? (
              <ChevronUp className="w-3 h-3 text-cyan-400" />
            ) : (
              <ChevronDown className="w-3 h-3 text-cyan-400" />
            )}
            <span>Custom Instructions / Context (Optional)</span>
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g. Inspect the server start script in package.json or fix the missing Express route..."
                  rows={2}
                  className="w-full mt-1 p-2.5 rounded-lg bg-black/50 border border-white/[0.08] text-neutral-200 placeholder-neutral-500 text-xs focus:outline-none focus:border-cyan-500/50 resize-none font-mono"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-3 pt-1">
          <motion.button
            type="button"
            onClick={handleRunFix}
            disabled={isRunning}
            whileHover={!isRunning ? { scale: 1.01 } : {}}
            whileTap={!isRunning ? { scale: 0.99 } : {}}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-lg font-medium text-xs flex items-center justify-center gap-2 transition-all ${
              isRunning
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 cursor-wait'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25 hover:shadow-cyan-500/40 border border-cyan-400/30 cursor-pointer'
            }`}
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                <span>Autonomous Agent Running...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-100" />
                <span>Diagnose & Auto-Fix Errors</span>
              </>
            )}
          </motion.button>

          {onViewLogs && (
            <button
              type="button"
              onClick={onViewLogs}
              className="px-3.5 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Terminal className="w-3.5 h-3.5 text-neutral-400" />
              <span>Live Logs</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Steps Indicator (Visible during execution) */}
      <AnimatePresence>
        {isRunning && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 rounded-xl bg-[#090B0E] border border-cyan-500/30 space-y-3"
          >
            <div className="flex items-center justify-between text-xs text-neutral-300 font-medium">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Agent Workflow in Progress</span>
              </span>
              <span className="font-mono text-cyan-400">Step {activeStep + 1} of 5</span>
            </div>

            <div className="space-y-2">
              {steps.map((s, idx) => {
                const isCurrent = activeStep === idx;
                const isDone = activeStep > idx;

                return (
                  <div
                    key={s.title}
                    className={`flex items-start gap-2.5 p-2 rounded-lg transition-all ${
                      isCurrent
                        ? 'bg-cyan-500/10 border border-cyan-500/20 text-neutral-200'
                        : isDone
                        ? 'text-neutral-400 opacity-80'
                        : 'text-neutral-600 opacity-40'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-neutral-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-[11px] leading-tight">{s.title}</div>
                      <div className="text-[10px] text-neutral-500 font-mono">{s.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Banner */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-2"
          >
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Agent Execution Error</span>
            </div>
            <p className="text-[11px] text-rose-200 font-mono leading-relaxed bg-black/30 p-2.5 rounded-lg border border-rose-500/20">
              {errorMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Diagnostic & Resolution Results View */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-4 rounded-xl bg-[#090B0E] border border-white/[0.08] space-y-3.5"
          >
            {/* Result Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {result.fixed ? (
                  <span className="p-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                    <Wand2 className="w-4 h-4" />
                  </span>
                ) : (
                  <span className="p-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                )}
                <div>
                  <h4 className="font-semibold text-neutral-100 text-xs">
                    {result.fixed
                      ? 'Error Identified & Patch Applied'
                      : 'No Errors Detected'}
                  </h4>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    Completed at {result.timestamp}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyResult}
                  className="p-1.5 rounded-md bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-400 hover:text-white transition-colors"
                  title="Copy Report"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    result.fixed
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                  }`}
                >
                  {result.fixed ? 'Workspace Updated' : 'Clean / Ready'}
                </span>
              </div>
            </div>

            {/* Formatted Output Area */}
            <div className="p-3 rounded-lg bg-black/60 border border-white/[0.06] font-mono text-[11px] text-neutral-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto selection:bg-cyan-500/30">
              {result.result || result.details || result.message}
            </div>

            {/* Quick Action Links */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/[0.04]">
              {onViewLogs && (
                <button
                  type="button"
                  onClick={onViewLogs}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
                >
                  <Terminal className="w-3 h-3" />
                  <span>Verify in Runtime Logs →</span>
                </button>
              )}
              {onViewHealth && (
                <button
                  type="button"
                  onClick={onViewHealth}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors ml-auto"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>Check Health Probes →</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
