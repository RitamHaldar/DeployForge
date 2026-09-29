import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Globe, Terminal, ExternalLink } from 'lucide-react';
import type { DeploymentRecord } from '../types';

interface DeploymentShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  deployment: DeploymentRecord;
}

export function DeploymentShareModal({
  isOpen,
  onClose,
  deployment,
}: DeploymentShareModalProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  if (!isOpen) return null;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(deployment.previewurl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const curlCommand = `curl -I ${deployment.previewurl}`;

  const handleCopyCurl = async () => {
    try {
      await navigator.clipboard.writeText(curlCommand);
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg rounded-2xl bg-[#090C10] border border-white/[0.12] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_50px_rgba(0,240,255,0.06)] z-10 space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Share Deployment</h3>
                <p className="text-xs text-neutral-400">Share or test your live container sandbox</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* URL Box */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-300">Preview Endpoint</label>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/50 border border-white/[0.08]">
              <span className="text-xs font-mono text-cyan-300 truncate select-all flex-1">
                {deployment.previewurl}
              </span>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.08] hover:bg-white/[0.14] text-white flex items-center gap-1.5 transition-colors shrink-0"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* cURL Snippet */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Verify with cURL</span>
            </label>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/50 border border-white/[0.08] font-mono text-xs text-neutral-300">
              <span className="truncate flex-1 select-all">{curlCommand}</span>
              <button
                type="button"
                onClick={handleCopyCurl}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                title="Copy command"
              >
                {copiedCurl ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-white/[0.06]">
            <a
              href={deployment.previewurl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-medium"
            >
              Open direct link <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-xs font-semibold text-white transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
