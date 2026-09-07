import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface AutonomousRunbooksPageProps {
  onNavigate?: (path: string) => void;
}

type FilterType = 'all' | 'active' | 'draft' | 'audit';

interface RunbookItem {
  id: string;
  code: string;
  name: string;
  status: 'active' | 'draft' | 'audit';
  enabled: boolean;
  triggerCondition: string;
  windowText: string;
  thresholdType: 'restarts' | 'memory' | 'latency';
  thresholdVal: number;
  thresholdUnit?: string;
  actionStrategy: string;
  strategyDesc: string;
  strategyOptions: string[];
  cooldownSec: number;
  cooldownMax: number;
  cooldownMin: number;
  cooldownStep: number;
  executions30d: number;
  successRate: number;
  gradient: string;
}

export const AutonomousRunbooksPage: React.FC<AutonomousRunbooksPageProps> = ({ onNavigate }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Active filter tab
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Killswitch state
  const [killswitchEngaged, setKillswitchEngaged] = useState<boolean>(false);

  // Concurrency slider
  const [concurrency, setConcurrency] = useState<number>(3);

  // Webhook state
  const [webhookUrl] = useState<string>('https://hooks.slack.com/services/T01/B02/kubeheal-alerts');
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'dispatching' | 'sent'>('idle');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'yaml' | 'helm' | 'json'>('yaml');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRunbookName, setNewRunbookName] = useState('');
  const [newTriggerCondition, setNewTriggerCondition] = useState('');

  // Toast notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Runbook rules data
  const [runbooks, setRunbooks] = useState<RunbookItem[]>([
    {
      id: 'rb-001',
      code: 'RB-001',
      name: 'CrashLoopBackOff Engine',
      status: 'active',
      enabled: true,
      triggerCondition: "pod.status.waiting.reason == 'CrashLoopBackOff'",
      windowText: '(within 5m window)',
      thresholdType: 'restarts',
      thresholdVal: 3,
      thresholdUnit: 'restarts',
      actionStrategy: 'QUARANTINE_AND_ROLLOUT',
      strategyDesc: 'Isolates service mesh ingress endpoint + rollbacks replica set revision',
      strategyOptions: [
        'QUARANTINE_AND_ROLLOUT',
        'QUARANTINE_ONLY',
        'ROLLOUT_REVISION_ONLY',
        'DRAIN_AND_REBOOT_NODE',
      ],
      cooldownSec: 60,
      cooldownMin: 15,
      cooldownMax: 300,
      cooldownStep: 15,
      executions30d: 124,
      successRate: 100,
      gradient: 'from-primary via-primary-container to-tertiary',
    },
    {
      id: 'rb-002',
      code: 'RB-002',
      name: 'OOMKilled Recovery',
      status: 'active',
      enabled: true,
      triggerCondition: "container.terminated.reason == 'OOMKilled'",
      windowText: '+25% step step-up',
      thresholdType: 'memory',
      thresholdVal: 512,
      thresholdUnit: 'MiB',
      actionStrategy: 'DYNAMIC_RESOURCE_EXPANSION',
      strategyDesc: 'Auto-increments memory request/limit by +25% up to ceiling threshold',
      strategyOptions: [
        'DYNAMIC_RESOURCE_EXPANSION',
        'RESTART_WITH_SAME_LIMITS',
        'SCALE_OUT_HORIZONTAL_POD',
      ],
      cooldownSec: 120,
      cooldownMin: 30,
      cooldownMax: 600,
      cooldownStep: 30,
      executions30d: 38,
      successRate: 97.4,
      gradient: 'from-tertiary via-secondary to-tertiary-container',
    },
    {
      id: 'rb-003',
      code: 'RB-003',
      name: 'HTTP 5xx Ingress Cascade',
      status: 'active',
      enabled: true,
      triggerCondition: 'rate(http_5xx)[1m] > 0.05',
      windowText: 'Verified Rollback',
      thresholdType: 'latency',
      thresholdVal: 0,
      thresholdUnit: 'ms delay',
      actionStrategy: 'CANARY_TRAFFIC_CIRCUIT_BREAKER',
      strategyDesc: 'Instantly diverts 100% ingress traffic back to stable v1 revision',
      strategyOptions: [
        'CANARY_TRAFFIC_CIRCUIT_BREAKER',
        'DRAIN_CANARY_DEPLOYMENT',
        'TRIGGER_PAGERDUTY_SEV1',
      ],
      cooldownSec: 300,
      cooldownMin: 60,
      cooldownMax: 900,
      cooldownStep: 60,
      executions30d: 6,
      successRate: 100,
      gradient: 'from-error via-primary to-tertiary',
    },
  ]);

  // GSAP Entrance Animations
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.runbook-header', { y: -20, opacity: 0, duration: 0.6 })
        .from('.runbook-filter-bar', { y: 15, opacity: 0, duration: 0.5 }, '-=0.3')
        .from('.runbook-card', {
          y: 30,
          opacity: 0,
          stagger: 0.12,
          duration: 0.7,
        }, '-=0.3')
        .from('.guardrail-section', { y: 25, opacity: 0, duration: 0.6 }, '-=0.4')
        .from('.mini-stream-log', { y: 15, opacity: 0, duration: 0.5 }, '-=0.3');
    },
    { scope: containerRef }
  );

  // Stepper handlers
  const handleThresholdChange = (id: string, delta: number) => {
    setRunbooks((prev) =>
      prev.map((rb) => {
        if (rb.id === id) {
          if (rb.thresholdType === 'restarts') {
            const next = Math.max(1, Math.min(20, rb.thresholdVal + delta));
            return { ...rb, thresholdVal: next };
          }
          if (rb.thresholdType === 'memory') {
            const next = Math.max(256, Math.min(4096, rb.thresholdVal + delta * 128));
            return { ...rb, thresholdVal: next };
          }
        }
        return rb;
      })
    );
  };

  // Cooldown slider handler
  const handleCooldownChange = (id: string, val: number) => {
    setRunbooks((prev) =>
      prev.map((rb) => (rb.id === id ? { ...rb, cooldownSec: val } : rb))
    );
  };

  // Toggle runbook active state
  const handleToggleRunbook = (id: string) => {
    setRunbooks((prev) =>
      prev.map((rb) =>
        rb.id === id ? { ...rb, enabled: !rb.enabled, status: !rb.enabled ? 'active' : 'draft' } : rb
      )
    );
  };

  // Select action strategy
  const handleStrategyChange = (id: string, val: string) => {
    setRunbooks((prev) =>
      prev.map((rb) => (rb.id === id ? { ...rb, actionStrategy: val } : rb))
    );
  };

  // Copy query handler
  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Toggle killswitch
  const handleToggleKillswitch = () => {
    const next = !killswitchEngaged;
    setKillswitchEngaged(next);
    if (next) {
      setToastMsg('CRITICAL: Autonomous Controller FROZEN in Read-Only Mode.');
    } else {
      setToastMsg('Autonomous Healing Engine Resumed Normal Operations.');
    }
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Test webhook
  const handleTestWebhook = () => {
    if (webhookStatus !== 'idle') return;
    setWebhookStatus('dispatching');
    setTimeout(() => {
      setWebhookStatus('sent');
      setToastMsg('Test Webhook dispatched successfully to Slack #kubeheal-alerts [HTTP 200]');
      setTimeout(() => {
        setWebhookStatus('idle');
        setToastMsg(null);
      }, 2500);
    }, 700);
  };

  // Add custom runbook
  const handleAddRunbook = () => {
    if (!newRunbookName) return;
    const newId = `rb-00${runbooks.length + 1}`;
    const newRb: RunbookItem = {
      id: newId,
      code: `RB-00${runbooks.length + 1}`,
      name: newRunbookName,
      status: 'active',
      enabled: true,
      triggerCondition: newTriggerCondition || "pod.spec.containers[0].ready == 'false'",
      windowText: '(custom rule)',
      thresholdType: 'restarts',
      thresholdVal: 2,
      thresholdUnit: 'restarts',
      actionStrategy: 'QUARANTINE_AND_ROLLOUT',
      strategyDesc: 'Custom self-healing automation strategy',
      strategyOptions: ['QUARANTINE_AND_ROLLOUT', 'ROLLOUT_REVISION_ONLY', 'SCALE_OUT_HORIZONTAL_POD'],
      cooldownSec: 60,
      cooldownMin: 15,
      cooldownMax: 300,
      cooldownStep: 15,
      executions30d: 0,
      successRate: 100,
      gradient: 'from-secondary via-tertiary to-primary',
    };
    setRunbooks((prev) => [...prev, newRb]);
    setIsAddModalOpen(false);
    setNewRunbookName('');
    setNewTriggerCondition('');
    setToastMsg(`Runbook ${newRb.code} created and armed!`);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Filtered runbooks
  const filteredRunbooks = runbooks.filter((rb) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return rb.enabled && rb.status === 'active';
    if (activeFilter === 'draft') return !rb.enabled || rb.status === 'draft';
    if (activeFilter === 'audit') return true;
    return true;
  });

  return (
    <div ref={containerRef} className="relative w-full min-h-screen bg-surface-container-lowest pb-16 select-none">
      {/* Subtle cybernetic backdrop glow */}
      <div className="pointer-events-none absolute top-12 left-1/4 w-[600px] h-[350px] bg-primary/5 rounded-full blur-[140px] -z-10" />

      {/* Global Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-16 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono-code text-body-sm shadow-2xl border ${
              killswitchEngaged
                ? 'bg-error-container text-on-error-container border-error'
                : 'bg-surface-container-high text-on-surface border-primary/50'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {killswitchEngaged ? 'warning' : 'info'}
            </span>
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 max-w-[1440px] mx-auto w-full flex flex-col gap-6">
        {/* PAGE HEADER */}
        <div className="runbook-header flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-semibold">
                Self-Healing Runbooks & Automation Rules
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high font-label-caps text-label-caps text-primary border border-outline-variant/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                POLICY ENGINE v2.4
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Configure autonomous remediation triggers, cooldown limits, and deployment rollback strategies.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="group px-3.5 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container transition-all flex items-center gap-2 shadow-sm border border-surface-container/60 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-outline group-hover:text-on-surface text-lg transition-colors">
                code
              </span>
              <span className="font-mono-code text-mono-code text-on-surface-variant group-hover:text-on-surface">
                Export Rules (YAML / Helm)
              </span>
              <span className="material-symbols-outlined text-outline group-hover:text-on-surface text-sm transition-colors">
                download
              </span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-primary-container hover:bg-primary-container/90 text-on-primary-container font-headline-md text-body-md font-semibold shadow-[0_0_16px_rgba(99,102,241,0.35)] flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              id="btn-add-runbook"
              type="button"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              <span>Add Custom Runbook</span>
            </button>
          </div>
        </div>

        {/* FILTER & STATUS MICRO-BAR */}
        <div className="runbook-filter-bar flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 rounded-xl bg-surface-container-low backdrop-blur-md border border-surface-container/60">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0" id="filter-pill-container">
            <button
              onClick={() => setActiveFilter('all')}
              className={`filter-pill px-3 py-1 rounded-lg font-mono-code text-mono-code transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-primary text-on-primary font-semibold shadow-[0_0_12px_rgba(192,193,255,0.4)]'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span>All Runbooks</span>
              <span className="px-1.5 py-0.2 rounded-full bg-on-primary/20 text-on-primary text-label-caps font-mono-code">
                {runbooks.length}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('active')}
              className={`filter-pill px-3 py-1 rounded-lg font-mono-code text-mono-code transition-all flex items-center gap-1.5 cursor-pointer ${
                activeFilter === 'active'
                  ? 'bg-primary text-on-primary font-semibold shadow-[0_0_12px_rgba(192,193,255,0.4)]'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span>Active</span>
              <span className="px-1.5 py-0.2 rounded-full bg-surface-container-high text-secondary text-label-caps font-mono-code">
                {runbooks.filter((r) => r.enabled).length}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('draft')}
              className={`filter-pill px-3 py-1 rounded-lg font-mono-code text-mono-code transition-all flex items-center gap-1.5 cursor-pointer ${
                activeFilter === 'draft'
                  ? 'bg-primary text-on-primary font-semibold shadow-[0_0_12px_rgba(192,193,255,0.4)]'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span>Draft</span>
              <span className="px-1.5 py-0.2 rounded-full bg-surface-container-high text-outline text-label-caps font-mono-code">
                {runbooks.filter((r) => !r.enabled).length}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('audit')}
              className={`filter-pill px-3 py-1 rounded-lg font-mono-code text-mono-code transition-all flex items-center gap-1.5 cursor-pointer ${
                activeFilter === 'audit'
                  ? 'bg-primary text-on-primary font-semibold shadow-[0_0_12px_rgba(192,193,255,0.4)]'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
              <span>Audit Mode</span>
            </button>
          </div>

          {/* Live Guardrail Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-surface-container-high text-on-surface-variant shrink-0 border border-surface-container-highest/40">
            <span className="material-symbols-outlined text-secondary text-sm animate-pulse">bolt</span>
            <span className="font-mono-code text-label-caps text-on-surface tracking-wider uppercase font-semibold">
              Safety Guardrails Active
            </span>
            <span className="text-outline">•</span>
            <span className="font-mono-code text-mono-code text-outline">Max {concurrency} concurrent</span>
            <span className="text-outline">•</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
              <span className="font-mono-code text-label-caps text-secondary uppercase font-semibold">Webhook Live</span>
            </div>
          </div>
        </div>

        {/* MAIN GRID: 3-COLUMN RUNBOOK CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredRunbooks.map((rb) => (
              <motion.div
                key={rb.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className={`runbook-card group relative rounded-xl bg-surface-container/70 backdrop-blur-md p-5 flex flex-col justify-between transition-all hover:bg-surface-container shadow-xl overflow-hidden border ${
                  rb.enabled ? 'border-surface-container/60' : 'border-outline-variant/30 opacity-75'
                }`}
              >
                {/* Top Accent Line */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${rb.gradient}`} />

                <div className="flex flex-col gap-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          rb.enabled
                            ? 'bg-secondary shadow-[0_0_8px_rgba(78,222,163,0.7)] animate-pulse'
                            : 'bg-outline'
                        }`}
                      />
                      <div>
                        <h2 className="font-headline-md text-headline-md text-on-surface font-semibold flex items-center gap-2">
                          {rb.name}
                        </h2>
                        <span className="font-mono-code text-label-caps text-primary bg-primary/10 px-2 py-0.5 rounded tracking-widest mt-0.5 inline-block border border-primary/20">
                          {rb.code}
                        </span>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        checked={rb.enabled}
                        onChange={() => handleToggleRunbook(rb.id)}
                        className="sr-only peer"
                        type="checkbox"
                      />
                      <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary shadow-[0_0_12px_rgba(78,222,163,0.3)]" />
                    </label>
                  </div>

                  {/* Trigger Condition */}
                  <div className="flex flex-col gap-1.5">
                    <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                      Trigger Condition
                    </span>
                    <div className="p-2.5 rounded-lg bg-surface-container-lowest flex items-center justify-between group/code hover:bg-surface-container-low transition-colors border border-surface-container/50">
                      <span className="font-mono-code text-mono-code text-primary-fixed truncate">
                        {rb.triggerCondition}
                      </span>
                      <button
                        onClick={() => handleCopy(rb.id, rb.triggerCondition)}
                        className="text-outline hover:text-on-surface transition-colors shrink-0 pl-2 cursor-pointer"
                        title="Copy query"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {copiedKey === rb.id ? 'check' : 'content_copy'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Trigger Threshold / Memory Ceiling / Shift Pace */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                        {rb.thresholdType === 'restarts'
                          ? 'Trigger Threshold'
                          : rb.thresholdType === 'memory'
                          ? 'Memory Ceiling Cap'
                          : 'Traffic Shift Pace'}
                      </span>
                      <span className="font-mono-code text-body-sm text-outline">{rb.windowText}</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low border border-surface-container/40">
                      {rb.thresholdType === 'restarts' && (
                        <>
                          <span className="font-body-md text-body-md text-on-surface">
                            Trigger after{' '}
                            <span className="font-mono-metric-md text-mono-metric-md text-primary font-bold">
                              {rb.thresholdVal}
                            </span>{' '}
                            container restarts
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleThresholdChange(rb.id, -1)}
                              className="w-7 h-7 rounded bg-surface-container-high hover:bg-surface-variant flex items-center justify-center text-on-surface text-sm transition-all active:scale-95 cursor-pointer"
                              type="button"
                            >
                              −
                            </button>
                            <button
                              onClick={() => handleThresholdChange(rb.id, 1)}
                              className="w-7 h-7 rounded bg-surface-container-high hover:bg-surface-variant flex items-center justify-center text-on-surface text-sm transition-all active:scale-95 cursor-pointer"
                              type="button"
                            >
                              +
                            </button>
                          </div>
                        </>
                      )}

                      {rb.thresholdType === 'memory' && (
                        <>
                          <span className="font-body-md text-body-md text-on-surface">
                            Ceiling:{' '}
                            <span className="font-mono-metric-md text-mono-metric-md text-tertiary font-bold">
                              {rb.thresholdVal} MiB
                            </span>
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleThresholdChange(rb.id, -1)}
                              className="w-7 h-7 rounded bg-surface-container-high hover:bg-surface-variant flex items-center justify-center text-on-surface text-sm transition-all active:scale-95 cursor-pointer"
                              type="button"
                            >
                              −
                            </button>
                            <button
                              onClick={() => handleThresholdChange(rb.id, 1)}
                              className="w-7 h-7 rounded bg-surface-container-high hover:bg-surface-variant flex items-center justify-center text-on-surface text-sm transition-all active:scale-95 cursor-pointer"
                              type="button"
                            >
                              +
                            </button>
                          </div>
                        </>
                      )}

                      {rb.thresholdType === 'latency' && (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary text-sm">offline_bolt</span>
                            <span className="font-body-md text-body-md text-on-surface">Immediate Cutover</span>
                          </div>
                          <span className="font-mono-code text-mono-code text-primary bg-surface-container-high px-2 py-0.5 rounded border border-primary/20">
                            0ms delay
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Execution Strategy */}
                  <div className="flex flex-col gap-1.5">
                    <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                      Remediation Action
                    </span>
                    <div className="relative">
                      <select
                        value={rb.actionStrategy}
                        onChange={(e) => handleStrategyChange(rb.id, e.target.value)}
                        className="w-full bg-surface-container-low text-on-surface font-mono-code text-mono-code rounded-lg p-2.5 appearance-none pr-8 cursor-pointer focus:bg-surface-container-high focus:outline-none border border-surface-container/50"
                      >
                        {rb.strategyOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-2.5 top-2.5 pointer-events-none text-outline text-sm">
                        expand_more
                      </span>
                    </div>
                    <span className="font-body-sm text-body-sm text-outline px-1">{rb.strategyDesc}</span>
                  </div>

                  {/* Safety Cooldown Slider */}
                  <div className="flex flex-col gap-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                        Safety Cooldown {rb.thresholdType === 'restarts' && '(Storm Guard)'}
                      </span>
                      <span className="font-mono-code text-mono-code text-tertiary font-semibold">
                        {rb.cooldownSec >= 60 ? `${rb.cooldownSec}s (${Math.floor(rb.cooldownSec / 60)}m)` : `${rb.cooldownSec}s`}
                      </span>
                    </div>
                    <input
                      className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-tertiary"
                      max={rb.cooldownMax}
                      min={rb.cooldownMin}
                      step={rb.cooldownStep}
                      type="range"
                      value={rb.cooldownSec}
                      onChange={(e) => handleCooldownChange(rb.id, parseInt(e.target.value, 10))}
                    />
                    <div className="flex justify-between text-outline font-mono-code text-label-caps px-0.5">
                      <span>{rb.cooldownMin}s</span>
                      <span>{Math.floor((rb.cooldownMin + rb.cooldownMax) / 4)}s</span>
                      <span className="text-tertiary font-bold">{Math.floor((rb.cooldownMin + rb.cooldownMax) / 2)}s</span>
                      <span>{rb.cooldownMax}s</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-4 mt-6 flex items-center justify-between bg-surface-container-lowest/50 -mx-5 -mb-5 px-5 py-3 border-t border-surface-container/50">
                  <div className="font-body-sm text-body-sm text-on-surface-variant">
                    Automated Executions (30d):{' '}
                    <span className="text-on-surface font-mono-code font-bold">{rb.executions30d}</span>
                  </div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5">
                    <span>Success:</span>
                    <span className="font-mono-code text-secondary font-bold">{rb.successRate}%</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* BOTTOM SECTION: GLOBAL SAFETY GUARDRAILS & EMERGENCY CONTROLS */}
        <div className="guardrail-section rounded-xl bg-surface-container/60 backdrop-blur-md p-6 shadow-2xl flex flex-col gap-5 border border-surface-container/70">
          {/* Banner Header */}
          <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-surface-container-high/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shadow-[0_0_12px_rgba(99,102,241,0.2)] border border-primary/30">
                <span className="material-symbols-outlined text-xl">shield</span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface font-semibold flex items-center gap-2">
                  Global Safety Guardrails & Emergency Controls
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Protects entire cluster against cascading automated remediation loops & thundering herds
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-surface-container-high font-mono-code text-mono-code text-secondary flex items-center gap-1.5 border border-secondary/20">
                <span className={`w-1.5 h-1.5 rounded-full ${killswitchEngaged ? 'bg-error' : 'bg-secondary animate-pulse'}`} />
                Controller Status: {killswitchEngaged ? 'FROZEN / READ-ONLY' : 'ONLINE'}
              </span>
            </div>
          </div>

          {/* 3-Column Internal Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Emergency Killswitch */}
            <div className="p-4 rounded-xl bg-surface-container-lowest/80 flex flex-col justify-between gap-4 border border-surface-container/50">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                    Emergency Killswitch
                  </span>
                  <span className={`material-symbols-outlined text-lg ${killswitchEngaged ? 'text-error animate-spin' : 'text-error animate-pulse'}`}>
                    warning
                  </span>
                </div>
                <h4 className="font-headline-md text-body-lg text-on-surface font-semibold mb-1">
                  Autonomous Circuit Breaker
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  When triggered, the autonomous controller freezes all mutating actions across the cluster. Swaps into read-only
                  surveillance immediately.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${killswitchEngaged ? 'bg-error animate-ping' : 'bg-secondary'}`} />
                  <span
                    className={`font-mono-code text-mono-code font-semibold ${
                      killswitchEngaged ? 'text-error' : 'text-on-surface'
                    }`}
                    id="killswitch-status"
                  >
                    {killswitchEngaged ? 'HALTED (SURVEILLANCE)' : 'STANDBY (ACTIVE ENGINE)'}
                  </span>
                </div>

                <button
                  onClick={handleToggleKillswitch}
                  className={`px-3 py-1.5 rounded-lg font-mono-code text-mono-code transition-all flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95 ${
                    killswitchEngaged
                      ? 'bg-secondary text-on-secondary font-bold shadow-[0_0_12px_rgba(78,222,163,0.4)]'
                      : 'bg-error-container/40 hover:bg-error-container text-error hover:text-on-error'
                  }`}
                  id="killswitch-btn"
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">
                    {killswitchEngaged ? 'play_arrow' : 'power_settings_new'}
                  </span>
                  <span>{killswitchEngaged ? 'Resume Engine' : 'Engage Stop'}</span>
                </button>
              </div>
            </div>

            {/* Column 2: Max Concurrent Remediations */}
            <div className="p-4 rounded-xl bg-surface-container-lowest/80 flex flex-col justify-between gap-4 border border-surface-container/50">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                    Concurrency Throttle
                  </span>
                  <span className="material-symbols-outlined text-primary text-lg">tune</span>
                </div>
                <h4 className="font-headline-md text-body-lg text-on-surface font-semibold mb-1">
                  Max Concurrent Workloads
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Limits concurrent pod restarts and scale modifications to safeguard available worker node pool resources.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-body-sm text-body-sm text-on-surface">Limit:</span>
                  <span className="font-mono-metric-md text-mono-metric-md text-primary font-bold">
                    <span id="concurrency-val">{concurrency}</span> workloads
                  </span>
                </div>
                <input
                  className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
                  max="10"
                  min="1"
                  step="1"
                  type="range"
                  value={concurrency}
                  onChange={(e) => setConcurrency(parseInt(e.target.value, 10))}
                />
                <div className="flex justify-between text-outline font-mono-code text-label-caps">
                  <span>1</span>
                  <span>2</span>
                  <span className="text-primary font-bold">3</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>
            </div>

            {/* Column 3: SRE Notification Integrations */}
            <div className="p-4 rounded-xl bg-surface-container-lowest/80 flex flex-col justify-between gap-4 border border-surface-container/50">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                    Alerting Pipeline
                  </span>
                  <span className="material-symbols-outlined text-tertiary text-lg">notifications_active</span>
                </div>
                <h4 className="font-headline-md text-body-lg text-on-surface font-semibold mb-1">
                  Incident Webhook Dispatch
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Broadcasts millisecond audit payloads whenever an automated action executes or fails validation.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-low border border-surface-container/40">
                  <span className="material-symbols-outlined text-outline text-sm">lock</span>
                  <input
                    className="w-full bg-transparent font-mono-code text-body-sm text-on-surface-variant focus:outline-none truncate"
                    readOnly
                    type="text"
                    value={webhookUrl}
                  />
                  <button
                    onClick={() => handleCopy('webhook', webhookUrl)}
                    className="text-outline hover:text-on-surface transition-colors shrink-0 cursor-pointer"
                    title="Copy Webhook URL"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {copiedKey === 'webhook' ? 'check' : 'content_copy'}
                    </span>
                  </button>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    onClick={handleTestWebhook}
                    disabled={webhookStatus !== 'idle'}
                    className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface font-mono-code text-label-caps transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    id="btn-test-webhook"
                    type="button"
                  >
                    <span className={`material-symbols-outlined text-sm ${webhookStatus === 'dispatching' ? 'animate-spin' : ''}`}>
                      {webhookStatus === 'sent' ? 'check_circle' : 'send'}
                    </span>
                    <span id="webhook-btn-text">
                      {webhookStatus === 'dispatching'
                        ? 'Dispatching...'
                        : webhookStatus === 'sent'
                        ? 'Payload Sent (HTTP 200)'
                        : 'Send Test Notification'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AUDIT & ACTIVITY PREVIEW MINI-STREAM */}
        <div className="mini-stream-log flex flex-col gap-2 p-4 rounded-xl bg-surface-container-low/50 border border-surface-container/50">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              Live Policy Evaluation Log
            </span>
            <span className="font-mono-code text-body-sm text-outline">Cluster mesh eval latency: 4.8ms</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div
              onClick={() => onNavigate?.('incidents')}
              className="p-2.5 rounded-lg bg-surface-container-lowest flex items-center justify-between text-body-sm border border-surface-container/40 hover:border-secondary/40 cursor-pointer transition-colors group"
              title="Click to view Incident Forensics"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono-code text-label-caps text-secondary font-bold">[14:28:10]</span>
                <span className="font-mono-code text-on-surface truncate group-hover:text-secondary transition-colors">
                  RB-001 executed on auth-service-78f9c
                </span>
              </div>
              <span className="font-mono-code text-label-caps text-secondary shrink-0 pl-2">RESOLVED</span>
            </div>

            <div
              onClick={() => onNavigate?.('incidents')}
              className="p-2.5 rounded-lg bg-surface-container-lowest flex items-center justify-between text-body-sm border border-surface-container/40 hover:border-primary/40 cursor-pointer transition-colors group"
              title="Click to view Incident Forensics"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono-code text-label-caps text-primary font-bold">[14:25:44]</span>
                <span className="font-mono-code text-on-surface truncate group-hover:text-primary transition-colors">
                  RB-002 memory stepped to 384MiB
                </span>
              </div>
              <span className="font-mono-code text-label-caps text-primary shrink-0 pl-2">STABILIZED</span>
            </div>

            <div
              onClick={() => onNavigate?.('incidents')}
              className="p-2.5 rounded-lg bg-surface-container-lowest flex items-center justify-between text-body-sm border border-surface-container/40 hover:border-outline/40 cursor-pointer transition-colors group"
              title="Click to view Incident Forensics"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono-code text-label-caps text-outline font-bold">[14:19:02]</span>
                <span className="font-mono-code text-on-surface truncate group-hover:text-outline transition-colors">
                  RB-003 threshold probe evaluated normal
                </span>
              </div>
              <span className="font-mono-code text-label-caps text-outline shrink-0 pl-2">PASS</span>
            </div>
          </div>
        </div>
      </div>

      {/* EXPORT RULES (YAML / HELM) MODAL */}
      <AnimatePresence>
        {isExportModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl bg-surface-container-high rounded-xl border border-surface-container-highest shadow-2xl p-6 flex flex-col gap-4 font-mono-code"
            >
              <div className="flex items-center justify-between border-b border-surface-container pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">code</span>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
                    Export Policy Engine Rules
                  </h3>
                </div>
                <button
                  onClick={() => setIsExportModalOpen(false)}
                  className="text-outline hover:text-on-surface transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-outline text-xs uppercase font-label-caps">Format:</span>
                {(['yaml', 'helm', 'json'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setExportFormat(fmt)}
                    className={`px-3 py-1 rounded text-xs uppercase transition cursor-pointer ${
                      exportFormat === fmt
                        ? 'bg-primary text-on-primary font-bold shadow'
                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>

              <pre className="p-4 rounded-lg bg-[#05070B] text-[#98C379] text-xs leading-5 max-h-72 overflow-y-auto border border-surface-container/60 select-text">
{exportFormat === 'yaml' ? `apiVersion: kubeheal.io/v1alpha1
kind: SelfHealingPolicy
metadata:
  name: cluster-remediation-rules
  namespace: kubeheal-system
spec:
  concurrencyLimit: ${concurrency}
  killswitch: ${killswitchEngaged}
  runbooks:
${runbooks
  .map(
    (rb) => `    - id: "${rb.code}"
      name: "${rb.name}"
      enabled: ${rb.enabled}
      trigger: "${rb.triggerCondition}"
      strategy: "${rb.actionStrategy}"
      cooldownSeconds: ${rb.cooldownSec}`
  )
  .join('\n')}` : exportFormat === 'helm' ? `# values.yaml (KubeHeal Helm Chart)
policyEngine:
  enabled: true
  concurrency: ${concurrency}
  rules:
${runbooks
  .map(
    (rb) => `    ${rb.code.toLowerCase()}:
      enabled: ${rb.enabled}
      strategy: ${rb.actionStrategy}
      cooldown: ${rb.cooldownSec}s`
  )
  .join('\n')}` : JSON.stringify({ concurrency, killswitchEngaged, runbooks }, null, 2)}
              </pre>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-outline">KubeHeal CRD v1alpha1 compliant</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('policy rules exported');
                      setToastMsg('Rules copied to clipboard!');
                      setTimeout(() => setToastMsg(null), 2000);
                    }}
                    className="px-3 py-1.5 rounded bg-surface-container text-on-surface hover:bg-surface-container-highest transition text-xs font-semibold cursor-pointer"
                  >
                    Copy to Clipboard
                  </button>
                  <button
                    onClick={() => setIsExportModalOpen(false)}
                    className="px-4 py-1.5 rounded bg-primary-container text-on-primary font-semibold hover:bg-primary transition text-xs shadow cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD CUSTOM RUNBOOK MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-surface-container-high rounded-xl border border-surface-container-highest shadow-2xl p-6 flex flex-col gap-4 font-body-md"
            >
              <div className="flex items-center justify-between border-b border-surface-container pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">post_add</span>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
                    Add Custom Self-Healing Runbook
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-outline hover:text-on-surface transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <div className="flex flex-col gap-3 font-mono-code text-body-sm">
                <div>
                  <label className="text-outline text-xs uppercase font-label-caps block mb-1">
                    Runbook Name
                  </label>
                  <input
                    type="text"
                    value={newRunbookName}
                    onChange={(e) => setNewRunbookName(e.target.value)}
                    placeholder="e.g. Node DiskPressure Eviction Guard"
                    className="w-full p-2.5 rounded-lg bg-surface-container-lowest text-on-surface border border-surface-container focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-outline text-xs uppercase font-label-caps block mb-1">
                    Trigger CEL Condition
                  </label>
                  <input
                    type="text"
                    value={newTriggerCondition}
                    onChange={(e) => setNewTriggerCondition(e.target.value)}
                    placeholder="e.g. node.status.conditions.DiskPressure == 'True'"
                    className="w-full p-2.5 rounded-lg bg-surface-container-lowest text-primary-fixed border border-surface-container focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-highest transition text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddRunbook}
                  disabled={!newRunbookName}
                  className="px-4 py-1.5 rounded-lg bg-primary-container text-on-primary-container font-semibold hover:bg-primary transition text-xs shadow cursor-pointer disabled:opacity-50"
                >
                  Arm Runbook Policy
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
