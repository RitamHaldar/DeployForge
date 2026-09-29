import { useState } from 'react';
import {
  Globe,
  Copy,
  Check,
  ExternalLink,
  Columns,
  Monitor,
  Terminal,
} from 'lucide-react';
import type { DeploymentRecord, ViewLayout } from '../types';

interface DeploymentSummaryBarProps {
  deployment: DeploymentRecord;
  layout: ViewLayout;
  onLayoutChange: (layout: ViewLayout) => void;
}

export function DeploymentSummaryBar({
  deployment,
  layout,
  onLayoutChange,
}: DeploymentSummaryBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(deployment.previewurl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full h-11 shrink-0 bg-[#0B0D11] border border-white/[0.08] rounded-xl px-3 sm:px-4 flex items-center justify-between gap-3 mb-2.5 shadow-sm text-xs select-none">
      
      {/* Left: Status & Preview Domain */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
          <span className="font-semibold text-white">Ready</span>
          <span className="text-neutral-600 hidden sm:inline">•</span>
          <span className="text-neutral-400 text-[11px] font-mono hidden sm:inline">2/2 Ready</span>
        </div>

        <span className="text-neutral-700 hidden sm:inline">|</span>

        <div className="flex items-center gap-1.5 min-w-0">
          <Globe className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <a
            href={deployment.previewurl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-cyan-300 hover:underline truncate max-w-[180px] sm:max-w-xs md:max-w-sm text-xs"
            title={deployment.previewurl}
          >
            {deployment.previewurl.replace(/^https?:\/\//, '')}
          </a>

          <button
            type="button"
            onClick={handleCopyUrl}
            className="text-neutral-400 hover:text-white p-1 rounded hover:bg-white/[0.06] transition-colors shrink-0"
            title="Copy URL"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>

          <a
            href={deployment.previewurl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-white p-1 rounded hover:bg-white/[0.06] transition-colors shrink-0 hidden sm:inline-block"
            title="Open in new tab"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Right: Repository Specs & Workspace Layout Modes */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="hidden xl:flex items-center gap-2 text-neutral-400 font-mono text-[11px]">
          <span>{deployment.repoName}</span>
          <span className="text-neutral-700">•</span>
          <span className="text-neutral-500">docker-desktop</span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-0.5 p-0.5 bg-black/40 border border-white/[0.06] rounded-lg">
          <button
            type="button"
            onClick={() => onLayoutChange('split')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all ${
              layout === 'split'
                ? 'bg-white/[0.1] text-white font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            }`}
            title="Split View (Preview + Console)"
          >
            <Columns className="w-3 h-3" />
            <span className="hidden sm:inline">Split</span>
          </button>

          <button
            type="button"
            onClick={() => onLayoutChange('preview-focus')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all ${
              layout === 'preview-focus'
                ? 'bg-white/[0.1] text-white font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            }`}
            title="Preview Focus"
          >
            <Monitor className="w-3 h-3" />
            <span className="hidden sm:inline">Preview</span>
          </button>

          <button
            type="button"
            onClick={() => onLayoutChange('console-focus')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all ${
              layout === 'console-focus'
                ? 'bg-white/[0.1] text-white font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            }`}
            title="Inspector Focus"
          >
            <Terminal className="w-3 h-3" />
            <span className="hidden sm:inline">Console</span>
          </button>
        </div>
      </div>

    </div>
  );
}
