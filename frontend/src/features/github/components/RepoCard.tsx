import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GitBranch,
  Lock,
  Globe,
  Copy,
  Check,
  ExternalLink,
  Rocket,
  Sparkles,
  FolderGit2
} from 'lucide-react';
import type { GitResponse } from '../../auth/types';

interface RepoCardProps {
  repo: GitResponse;
  onDeploy: (repo: GitResponse) => void;
}

export function RepoCard({ repo, onDeploy }: RepoCardProps) {
  const [copied, setCopied] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  const isPrivate =
    repo.private === true ||
    repo.private === 'true' ||
    String(repo.private).toLowerCase() === 'private';

  const defaultBranch = repo.defaultBranch || 'main';
  const githubUrl = repo.cloneUrl?.replace(/\.git$/, '') || `https://github.com/${repo.fullName || repo.name}`;

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  const handleCopyClone = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!repo.cloneUrl) return;
    navigator.clipboard.writeText(repo.cloneUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeployClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeploying(true);
    onDeploy(repo);
    setTimeout(() => setIsDeploying(false), 1500);
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16, scale: 0.98 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: 'spring',
            stiffness: 380,
            damping: 28,
          },
        },
      }}
      whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
      onMouseMove={handleCardMouseMove}
      className="spotlight-card auth-glass-card group relative rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 border border-white/[0.08] hover:border-accent-cyan/35 hover:shadow-[0_16px_40px_-15px_rgba(0,0,0,0.8),0_0_30px_rgba(0,240,255,0.08)] backdrop-blur-xl bg-[#0B0D10]/85 will-change-transform"
    >
      {/* Top Header: Identity & Visibility */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 text-accent-cyan group-hover:border-accent-cyan/40 group-hover:bg-accent-cyan/10 transition-all duration-300">
              <FolderGit2 className="w-4 h-4 transition-transform group-hover:scale-110" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3
                  className="text-sm sm:text-base font-semibold text-white tracking-tight truncate group-hover:text-accent-cyan transition-colors"
                  title={repo.name}
                >
                  {repo.name}
                </h3>
              </div>
              <p
                className="text-[11px] text-neutral-400 font-mono truncate"
                title={repo.fullName || repo.name}
              >
                {repo.fullName || repo.name}
              </p>
            </div>
          </div>

          {/* Visibility Badge */}
          <div className="shrink-0 flex items-center gap-1">
            {isPrivate ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium text-accent-amber bg-accent-amber/10 border border-accent-amber/25 shadow-sm">
                <Lock className="w-2.5 h-2.5" />
                <span>Private</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/25 shadow-sm">
                <Globe className="w-2.5 h-2.5" />
                <span>Public</span>
              </span>
            )}
          </div>
        </div>

        {/* Branch & Autonomous CI/CD Pill Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-[11px] font-mono">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/[0.03] border border-white/[0.07] text-neutral-300">
            <GitBranch className="w-3 h-3 text-accent-cyan" />
            <span className="font-semibold text-white/90">{defaultBranch}</span>
          </div>

          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-accent-cyan/[0.06] border border-accent-cyan/20 text-[10px] text-accent-cyan">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Autonomous CI/CD Ready</span>
          </div>
        </div>

        {/* Clone URL Command Container */}
        {repo.cloneUrl && (
          <div className="relative mb-4">
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#06080B] border border-white/[0.06] font-mono text-[11px] text-neutral-400 group-hover:border-white/[0.12] transition-colors">
              <span className="truncate select-all text-neutral-300 font-normal">
                {repo.cloneUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyClone}
                className="shrink-0 p-1.5 rounded-lg hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan"
                title="Copy clone URL"
              >
                {copied ? (
                  <span className="flex items-center gap-1 text-accent-emerald font-semibold text-[10px]">
                    <Check className="w-3 h-3" />
                    <span>Copied</span>
                  </span>
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Action Buttons */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white py-1.5 px-2.5 rounded-lg hover:bg-white/[0.04] transition-colors group/link"
        >
          <span>GitHub</span>
          <ExternalLink className="w-3 h-3 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
        </a>

        {/* Primary Deploy Button */}
        <motion.button
          type="button"
          onClick={handleDeployClick}
          disabled={isDeploying}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-sweep relative px-3.5 py-1.5 rounded-xl text-xs font-semibold font-sans tracking-wide bg-white text-black hover:bg-neutral-100 flex items-center gap-1.5 shadow-[0_0_20px_rgba(255,255,255,0.12)] hover:shadow-[0_0_25px_rgba(255,255,255,0.22)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan transition-all select-none"
        >
          {isDeploying ? (
            <>
              <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>Initializing...</span>
            </>
          ) : (
            <>
              <Rocket className="w-3 h-3 text-black fill-black" />
              <span>Deploy to Forge</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
