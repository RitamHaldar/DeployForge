import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor,
  Tablet,
  Smartphone,
  RotateCw,
  ExternalLink,
  Lock,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Globe,
  Radio,
} from 'lucide-react';
import type { DeviceMode } from '../types';

interface DeploymentPreviewFrameProps {
  previewUrl: string;
  repoName: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function DeploymentPreviewFrame({
  previewUrl,
  repoName,
  isExpanded = false,
  onToggleExpand,
}: DeploymentPreviewFrameProps) {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(previewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const getWidthClass = () => {
    switch (deviceMode) {
      case 'mobile':
        return 'max-w-[390px] w-full h-full rounded-[28px] border-4 border-neutral-700/60 shadow-[0_0_50px_rgba(0,0,0,0.9)]';
      case 'tablet':
        return 'max-w-[768px] w-full h-full rounded-[20px] border-2 border-neutral-700/50 shadow-[0_0_50px_rgba(0,0,0,0.85)]';
      case 'desktop':
      default:
        return 'w-full h-full rounded-xl border border-white/[0.08]';
    }
  };

  const getDimensionsText = () => {
    switch (deviceMode) {
      case 'mobile':
        return '390 × 844 px (iPhone)';
      case 'tablet':
        return '768 × 1024 px (iPad)';
      case 'desktop':
      default:
        return 'Responsive Viewport (100%)';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center w-full h-full min-h-0 ${
        isFullscreen ? 'fixed inset-0 z-50 bg-[#07090C] p-4 overflow-hidden' : ''
      }`}
    >
      {/* Device Mode Switcher Toolbar */}
      <div className="w-full flex items-center justify-between gap-3 mb-2 shrink-0">
        
        {/* Responsive Device Switcher Tabs */}
        <div className="flex items-center gap-1 p-0.5 bg-white/[0.03] border border-white/[0.08] rounded-lg backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setDeviceMode('desktop')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all select-none ${
              deviceMode === 'desktop'
                ? 'bg-white/[0.1] text-white font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>

          <button
            type="button"
            onClick={() => setDeviceMode('tablet')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all select-none ${
              deviceMode === 'tablet'
                ? 'bg-white/[0.1] text-white font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </button>

          <button
            type="button"
            onClick={() => setDeviceMode('mobile')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all select-none ${
              deviceMode === 'mobile'
                ? 'bg-white/[0.1] text-white font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        {/* Viewport Dimension Indicator & Extra Controls */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-[11px] font-mono text-neutral-400 bg-white/[0.02] border border-white/[0.06] px-2.5 py-1 rounded-md">
            {getDimensionsText()}
          </span>

          {onToggleExpand && (
            <button
              type="button"
              onClick={onToggleExpand}
              className="px-2.5 py-1 rounded-md text-neutral-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-xs font-medium transition-all hidden md:flex items-center gap-1.5"
              title={isExpanded ? 'Restore split layout' : 'Expand preview to full width'}
            >
              {isExpanded ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Split View</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Focus</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 rounded-md text-neutral-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] transition-all"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Viewport'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Browser Window Mockup */}
      <motion.div
        layout
        transition={{ type: 'spring', damping: 28, stiffness: 240 }}
        className={`w-full ${getWidthClass()} bg-[#090B0E] shadow-[0_15px_50px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col flex-1 min-h-0 relative`}
      >
        {/* Browser Chrome Header */}
        <div className="h-9 px-3.5 bg-[#0D0F14] border-b border-white/[0.06] flex items-center justify-between gap-3 select-none shrink-0">
          
          {/* Traffic Light Dots */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80 border border-rose-400/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80 border border-amber-400/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 border border-emerald-400/40" />
          </div>

          {/* Browser Navigation / Refresh */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleRefresh}
              className="p-1 rounded text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              title="Reload Frame"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>

          {/* Address Bar */}
          <div className="flex-1 max-w-xl mx-auto flex items-center justify-between gap-2 px-2.5 py-0.5 rounded-md bg-[#050608] border border-white/[0.06] text-xs text-neutral-300 font-mono shadow-inner group">
            <div className="flex items-center gap-1.5 truncate">
              <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="text-neutral-200 text-xs select-all truncate">{previewUrl}</span>
            </div>

            <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                type="button"
                onClick={handleCopyUrl}
                className="p-0.5 rounded hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-colors"
                title="Copy Address"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* External Window Link */}
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors shrink-0"
            title="Open in new window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Viewport Content / Iframe Area */}
        <div className="relative flex-1 min-h-0 w-full bg-[#050608] flex items-center justify-center overflow-hidden">
          
          {/* Loading Overlay */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#07090C]/90 backdrop-blur-sm pointer-events-none"
              >
                <div className="relative flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-cyan-400 animate-spin" />
                  <Globe className="w-4 h-4 text-cyan-400 absolute" />
                </div>
                <p className="mt-3 text-xs font-medium text-neutral-200">
                  Connecting to container preview...
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5 font-mono">
                  {previewUrl}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Sandbox Iframe */}
          <iframe
            key={iframeKey}
            src={previewUrl}
            title={`Preview of ${repoName}`}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
            className="w-full h-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          />
        </div>

        {/* Bottom Telemetry Bar */}
        <div className="h-6 px-3 bg-[#0A0C10] border-t border-white/[0.06] flex items-center justify-between text-[10px] text-neutral-400 select-none shrink-0">
          <div className="flex items-center gap-2 font-mono">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-400">200 OK</span>
            <span className="text-neutral-600">•</span>
            <span>HTTP/1.1 Ingress Proxy</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono">
            <Radio className="w-2.5 h-2.5 text-emerald-400" />
            <span>Port 3000</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
