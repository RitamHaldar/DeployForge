import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  Share2,
  RefreshCw,
  GitBranch,
  Layers,
} from 'lucide-react';
import type { DeploymentRecord } from '../types';

interface DeploymentHeaderProps {
  deployment: DeploymentRecord;
  onRefresh?: () => void;
  onOpenShare: () => void;
  isRefreshing?: boolean;
}

export function DeploymentHeader({
  deployment,
  onRefresh,
  onOpenShare,
  isRefreshing = false,
}: DeploymentHeaderProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!deployment.previewurl) return;
    try {
      await navigator.clipboard.writeText(deployment.previewurl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  }, [deployment.previewurl]);

  // Keyboard shortcut listener: 'c' to copy, 'v' to visit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if ((e.key === 'c' || e.key === 'C') && !e.metaKey && !e.ctrlKey) {
        handleCopy();
      }
      if ((e.key === 'v' || e.key === 'V') && !e.metaKey && !e.ctrlKey) {
        if (deployment.previewurl) {
          window.open(deployment.previewurl, '_blank', 'noopener,noreferrer');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deployment.previewurl, handleCopy]);

  const shortId = deployment.id ? deployment.id.slice(0, 8) : 'active';
  const repoTitle = deployment.repoName || 'Deployment';

  return (
    <header className="shrink-0 w-full bg-[#08090B]/95 border-b border-white/[0.08] z-40">
      <div className="max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-6">
        <div className="h-12 sm:h-13 flex items-center justify-between gap-3">
          
          {/* Left: Breadcrumbs & Repository Identity */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <motion.button
              type="button"
              onClick={() => navigate('/repos')}
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.96 }}
              className="p-1.5 sm:p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-400 hover:text-white transition-colors shrink-0"
              title="Return to Repositories"
            >
              <ArrowLeft className="w-4 h-4" />
            </motion.button>

            <div className="flex items-center gap-2.5 min-w-0">
              <div
                onClick={() => navigate('/repos')}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 cursor-pointer group hover:border-cyan-500/40 transition-colors"
              >
                <Layers className="w-4 h-4 text-cyan-400 transition-transform group-hover:scale-110" />
              </div>

              <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium truncate">
                <span
                  onClick={() => navigate('/repos')}
                  className="hover:text-white cursor-pointer transition-colors"
                >
                  DeployForge
                </span>
                <span className="text-neutral-600">/</span>
                <span
                  onClick={() => navigate('/repos')}
                  className="text-neutral-200 font-semibold hover:text-white cursor-pointer transition-colors truncate max-w-[140px] sm:max-w-xs"
                >
                  {repoTitle}
                </span>
                <span className="text-neutral-600">/</span>
                <span className="text-neutral-300 font-mono text-[11px] bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08] flex items-center gap-1">
                  <GitBranch className="w-3 h-3 text-cyan-400" />
                  {shortId}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Live Status Indicator & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Status Pill */}
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Ready</span>
              <span className="text-neutral-600">•</span>
              <span className="text-neutral-400 text-[11px]">Preview</span>
            </div>

            {/* Copy Link Button */}
            <motion.button
              type="button"
              onClick={handleCopy}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
              title="Copy Preview URL (Press 'C')"
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div
                    key="copied"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-1.5 text-emerald-400"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-medium">Copied</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="hidden sm:inline">Copy URL</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Share Trigger */}
            <motion.button
              type="button"
              onClick={onOpenShare}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all"
              title="Share Deployment"
            >
              <Share2 className="w-3.5 h-3.5 text-neutral-400" />
              <span className="hidden sm:inline">Share</span>
            </motion.button>

            {/* Refresh / Check status */}
            <motion.button
              type="button"
              onClick={onRefresh}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-300 hover:text-white transition-all"
              title="Refresh status"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-neutral-400 ${
                  isRefreshing ? 'animate-spin text-cyan-400' : ''
                }`}
              />
            </motion.button>

            {/* Primary Action: Visit Site */}
            <motion.a
              href={deployment.previewurl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="relative px-3.5 py-1.5 sm:px-4 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 shadow-[0_0_18px_rgba(0,240,255,0.35)] hover:shadow-[0_0_24px_rgba(0,240,255,0.55)] group shrink-0"
              style={{
                backgroundColor: '#00F0FF',
                color: '#07090C',
              }}
              title="Open Live Deployment in new tab (Press 'V')"
            >
              <span className="font-semibold tracking-tight text-[#07090C]">Visit</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#07090C] opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
            </motion.a>
          </div>

        </div>
      </div>
    </header>
  );
}
