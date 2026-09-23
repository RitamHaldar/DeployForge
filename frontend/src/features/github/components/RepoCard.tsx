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
  FolderGit2,
  ArrowUpRight,
} from 'lucide-react';
import type { GitResponse } from '../../auth/types';

interface RepoCardProps {
  repo: GitResponse;
  onDeploy: (repo: GitResponse) => void;
  viewMode?: 'grid' | 'list';
}

export function RepoCard({ repo, onDeploy, viewMode = 'grid' }: RepoCardProps) {
  const [copied, setCopied] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  const isPrivate =
    repo.private === true ||
    repo.private === 'true' ||
    String(repo.private).toLowerCase() === 'private';

  const defaultBranch = repo.defaultBranch || 'main';
  const githubUrl =
    repo.cloneUrl?.replace(/\.git$/, '') ||
    `https://github.com/${repo.fullName || repo.name}`;

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

  // Instantaneous spring config for zero-lag gesture response
  const springTransition = {
    type: 'spring' as const,
    stiffness: 500,
    damping: 30,
    mass: 0.5,
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        variants={{
          hidden: { opacity: 0, y: 8 },
          visible: { opacity: 1, y: 0 },
        }}
        whileHover={{
          y: -2,
          x: 2,
        }}
        transition={springTransition}
        onMouseMove={handleCardMouseMove}
        className="spotlight-card group relative rounded-xl p-3.5 sm:px-5 sm:py-3.5 bg-[#0B0D11]/90 hover:bg-[#0E1117] border border-white/[0.08] hover:border-cyan-400/30 hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.8),0_0_20px_-4px_rgba(0,240,255,0.08)] flex items-center justify-between gap-4 transition-colors duration-150 ease-out select-none"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center shrink-0 text-neutral-400 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 group-hover:border-cyan-400/30 transition-colors duration-150">
            <FolderGit2 className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white tracking-tight truncate group-hover:text-cyan-300 transition-colors duration-150">
                {repo.name}
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-medium transition-colors duration-150 ${
                  isPrivate
                    ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                    : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                }`}
              >
                {isPrivate ? <Lock className="w-2.5 h-2.5" /> : <Globe className="w-2.5 h-2.5" />}
                <span>{isPrivate ? 'Private' : 'Public'}</span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
              <span className="flex items-center gap-1 text-[11px] text-neutral-300">
                <GitBranch className="w-3 h-3 text-cyan-400" />
                <span>{defaultBranch}</span>
              </span>
              <span className="text-neutral-600">·</span>
              <span className="text-[11px] truncate text-neutral-500">{repo.fullName || repo.name}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyClone}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors duration-150 active:scale-90"
            title="Copy Clone URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors duration-150 group/ext active:scale-90"
            title="View on GitHub"
          >
            <ExternalLink className="w-3.5 h-3.5 transition-transform duration-150 group-hover/ext:scale-110" />
          </a>

          <motion.button
            type="button"
            onClick={handleDeployClick}
            disabled={isDeploying}
            whileHover={{ scale: 1.04, y: -0.5 }}
            whileTap={{ scale: 0.96 }}
            transition={springTransition}
            className="group/btn relative px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-black hover:bg-neutral-100 flex items-center gap-1.5 shadow-sm hover:shadow-[0_0_16px_rgba(255,255,255,0.25)] transition-all duration-150"
          >
            <Rocket className="w-3 h-3 text-black transition-transform duration-150 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
            <span>Deploy</span>
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: {
          opacity: 1,
          y: 0,
        },
      }}
      whileHover={{
        y: -4,
        scale: 1.008,
      }}
      transition={springTransition}
      onMouseMove={handleCardMouseMove}
      className="spotlight-card group relative rounded-2xl p-5 sm:p-5.5 flex flex-col justify-between border border-white/[0.08] hover:border-cyan-400/35 backdrop-blur-xl bg-[#0B0D11]/90 hover:bg-[#0E1117]/95 shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.85),0_0_30px_-5px_rgba(0,240,255,0.12)] transition-colors duration-150 ease-out will-change-transform select-none"
    >
      {/* Top Header: Identity & Visibility */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center shrink-0 text-neutral-400 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 group-hover:border-cyan-400/35 transition-colors duration-150 shadow-inner">
              <FolderGit2 className="w-5 h-5 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-3" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3
                  className="text-sm sm:text-base font-semibold text-white tracking-tight truncate group-hover:text-cyan-300 transition-colors duration-150"
                  title={repo.name}
                >
                  {repo.name}
                </h3>
                <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-cyan-400 transition-all duration-200 shrink-0" />
              </div>
              <p
                className="text-xs text-neutral-400 truncate mt-0.5 group-hover:text-neutral-300 transition-colors duration-150"
                title={repo.fullName || repo.name}
              >
                {repo.fullName || repo.name}
              </p>
            </div>
          </div>

          {/* Visibility Badge */}
          <div className="shrink-0 flex items-center gap-1">
            {isPrivate ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 group-hover:border-amber-500/35 transition-colors duration-150">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Private</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 group-hover:border-emerald-500/35 transition-colors duration-150">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Public</span>
              </span>
            )}
          </div>
        </div>

        {/* Branch Info Pill */}
        <div className="flex items-center gap-2 mb-4 text-xs">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.07] text-neutral-300 group-hover:border-white/[0.14] group-hover:bg-white/[0.06] transition-colors duration-150">
            <GitBranch className="w-3.5 h-3.5 text-cyan-400 transition-transform duration-200 group-hover:scale-110" />
            <span className="font-medium text-neutral-200">{defaultBranch}</span>
          </div>
        </div>

        {/* Clone URL Command Bar */}
        {repo.cloneUrl && (
          <div className="relative mb-4">
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/40 group-hover:bg-black/60 border border-white/[0.06] group-hover:border-white/[0.12] text-xs text-neutral-400 transition-colors duration-150">
              <span className="truncate select-all text-neutral-300 text-[11px] font-mono pl-1">
                {repo.cloneUrl}
              </span>
              <motion.button
                type="button"
                onClick={handleCopyClone}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                className="shrink-0 p-1.5 rounded-lg hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-colors duration-150"
                title="Copy clone URL"
              >
                {copied ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-medium text-[10px]">
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied</span>
                  </span>
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Action Buttons */}
      <div className="pt-3 border-t border-white/[0.06] group-hover:border-white/[0.1] flex items-center justify-between gap-2 transition-colors duration-150">
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white py-1 px-2 rounded-lg hover:bg-white/[0.05] transition-colors duration-150 group/link"
        >
          <span>GitHub</span>
          <ExternalLink className="w-3 h-3 transition-transform duration-150 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
        </a>

        {/* Primary Deploy Button with Zero-Lag Spring */}
        <motion.button
          type="button"
          onClick={handleDeployClick}
          disabled={isDeploying}
          whileHover={{ scale: 1.04, y: -0.5 }}
          whileTap={{ scale: 0.96 }}
          transition={springTransition}
          className="group/btn relative px-4 py-1.5 rounded-xl text-xs font-semibold bg-white text-black hover:bg-neutral-100 flex items-center gap-1.5 shadow-[0_0_20px_rgba(255,255,255,0.12)] hover:shadow-[0_0_28px_rgba(255,255,255,0.3)] transition-colors duration-150 select-none overflow-hidden"
        >
          {isDeploying ? (
            <>
              <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>Deploying...</span>
            </>
          ) : (
            <>
              <Rocket className="w-3 h-3 text-black transition-transform duration-150 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
              <span>Deploy</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
