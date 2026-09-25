import { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGit } from '../hooks/useGit';
import { GithubHeader } from '../components/GithubHeader';
import { RepoCard } from '../components/RepoCard';
import { RepoStatsBar } from '../components/RepoStatsBar';
import {
  RepoSearchBar,
  type FilterVisibility,
  type SortOption,
} from '../components/RepoSearchBar';
import { RepoSkeleton } from '../components/RepoSkeleton';
import { RepoEmptyState } from '../components/RepoEmptyState';
import type { GitResponse } from '../../auth/types';
import type { DeployPayload } from '../types';
import {
  Rocket,
  X,
  CheckCircle2,
  GitBranch,
  AlertCircle,
  Copy,
  Check,
  Plus,
  Folder,
} from 'lucide-react';

export function ReposPage() {
  const {
    repos,
    loading,
    error,
    fetchRepos,
    deployRepo,
    deployLoading,
    deployError,
    clearDeployError,
  } = useGit();

  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<FilterVisibility>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Deployment modal state
  const [selectedRepo, setSelectedRepo] = useState<GitResponse | null>(null);
  const [deployResult, setDeployResult] = useState<{
    success?: boolean;
    containerId?: string;
    status?: any;
    message?: string;
  } | null>(null);
  const [copiedCloneUrl, setCopiedCloneUrl] = useState(false);
  const [folderPath, setFolderPath] = useState('');

  // Fetch repositories on mount
  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  // Ambient cursor glow tracking
  const glowRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const glowEl = glowRef.current;
    if (!glowEl) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const updateGlow = () => {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      glowEl.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(updateGlow);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    rafId = requestAnimationFrame(updateGlow);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Filtered & sorted repository list
  const filteredRepos = useMemo(() => {
    let list = Array.isArray(repos) ? [...repos] : [];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (repo) =>
          repo.name?.toLowerCase().includes(q) ||
          repo.fullName?.toLowerCase().includes(q) ||
          repo.defaultBranch?.toLowerCase().includes(q)
      );
    }

    // Filter by visibility
    if (visibilityFilter === 'public') {
      list = list.filter(
        (repo) =>
          repo.private === false ||
          repo.private === 'false' ||
          String(repo.private).toLowerCase() === 'public'
      );
    } else if (visibilityFilter === 'private') {
      list = list.filter(
        (repo) =>
          repo.private === true ||
          repo.private === 'true' ||
          String(repo.private).toLowerCase() === 'private'
      );
    }

    // Sort list
    if (sortBy === 'name') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return list;
  }, [repos, searchQuery, visibilityFilter, sortBy]);

  // Aggregate counters
  const totalCount = Array.isArray(repos) ? repos.length : 0;
  const publicCount = useMemo(() => {
    if (!Array.isArray(repos)) return 0;
    return repos.filter(
      (r) =>
        r.private === false ||
        r.private === 'false' ||
        String(r.private).toLowerCase() === 'public'
    ).length;
  }, [repos]);

  const privateCount = useMemo(() => {
    if (!Array.isArray(repos)) return 0;
    return repos.filter(
      (r) =>
        r.private === true ||
        r.private === 'true' ||
        String(r.private).toLowerCase() === 'private'
    ).length;
  }, [repos]);

  const handleDeploy = (repo: GitResponse) => {
    setSelectedRepo(repo);
    setDeployResult(null);
    clearDeployError();
  };

  const handleCloseModal = () => {
    if (!deployLoading) {
      setSelectedRepo(null);
      setDeployResult(null);
      setFolderPath('');
      clearDeployError();
    }
  };

  const handleConfirmDeploy = async () => {
    if (!selectedRepo) return;

    const payload: DeployPayload = {
      repoUrl:
        selectedRepo.cloneUrl ||
        `https://github.com/${selectedRepo.fullName || selectedRepo.name}.git`,
      repoName: selectedRepo.name,
      folderpath: folderPath.trim() || undefined,
    };

    try {
      const result = await deployRepo(payload);
      setDeployResult(result);
    } catch (err) {
      console.error('Deployment execution error:', err);
    }
  };

  return (
    <div className="relative min-h-screen bg-brand-bg text-brand-text overflow-x-hidden selection:bg-cyan-500/20 selection:text-cyan-400 font-sans">
      
      {/* Interactive Ambient Cursor Glow */}
      <div
        ref={glowRef}
        className="pointer-events-none fixed top-0 left-0 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-blue-500/[0.04] via-cyan-500/[0.03] to-transparent blur-3xl opacity-60 z-0 will-change-transform"
        aria-hidden="true"
      />

      {/* Atmospheric Tech Grid Pattern */}
      <div className="fixed inset-0 bg-tech-grid opacity-35 pointer-events-none z-0" aria-hidden="true" />
      <div className="fixed inset-0 bg-noise pointer-events-none z-0 opacity-80" aria-hidden="true" />

      {/* Top Header */}
      <GithubHeader
        onRefresh={fetchRepos}
        isRefreshing={loading}
        repoCount={totalCount}
      />

      {/* Main Content Viewport */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        
        {/* Page Hero Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Repositories
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
                Deploy and manage continuous delivery pipelines from your connected GitHub account.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <a
                href="https://github.com/new"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New on GitHub</span>
              </a>
            </div>
          </div>
        </div>

        {/* Telemetry Stats Strip */}
        <RepoStatsBar
          totalCount={totalCount}
          publicCount={publicCount}
          privateCount={privateCount}
          loading={loading}
        />

        {/* Search, Filter & Controls */}
        <RepoSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          visibilityFilter={visibilityFilter}
          onVisibilityChange={setVisibilityFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filteredCount={filteredRepos.length}
          totalCount={totalCount}
        />

        {/* Repository Grid or Loading Skeletons */}
        {loading && !repos ? (
          <RepoSkeleton count={6} viewMode={viewMode} />
        ) : error && !repos ? (
          <RepoEmptyState
            type="error"
            errorMessage={error}
            onRetry={fetchRepos}
          />
        ) : totalCount === 0 ? (
          <RepoEmptyState type="no-repos" onRetry={fetchRepos} />
        ) : filteredRepos.length === 0 ? (
          <RepoEmptyState
            type="no-results"
            searchQuery={searchQuery}
            onClearSearch={() => {
              setSearchQuery('');
              setVisibilityFilter('all');
            }}
          />
        ) : (
          <motion.div
            layout
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.03,
                },
              },
            }}
            initial="hidden"
            animate="visible"
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'flex flex-col gap-2.5'
            }
          >
            {filteredRepos.map((repo) => (
              <RepoCard
                key={repo.id || repo.name}
                repo={repo}
                onDeploy={handleDeploy}
                viewMode={viewMode}
              />
            ))}
          </motion.div>
        )}

      </main>

      {/* Interactive Deployment Launch Modal */}
      <AnimatePresence>
        {selectedRepo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              className="relative w-full max-w-lg rounded-2xl bg-[#0B0D11]/95 border border-white/[0.08] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl z-10"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 mb-5 pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-cyan-400">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
                      Deploy Application
                    </h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Deploy {selectedRepo.name} to the edge cluster.
                    </p>
                  </div>
                </div>

                {!deployLoading && (
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Deployment Settings & Repo Details */}
              <div className="space-y-2.5 mb-5 text-xs">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Source Branch</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-white font-medium">
                    {selectedRepo.defaultBranch || 'main'}
                  </span>
                </div>

                {selectedRepo.cloneUrl && (
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-2">
                    <span className="text-neutral-400 shrink-0">Clone URL</span>
                    <div className="flex items-center gap-1.5 min-w-0 max-w-[70%]">
                      <span className="truncate text-neutral-300 text-[11px]" title={selectedRepo.cloneUrl}>
                        {selectedRepo.cloneUrl}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedRepo.cloneUrl) {
                            navigator.clipboard.writeText(selectedRepo.cloneUrl);
                            setCopiedCloneUrl(true);
                            setTimeout(() => setCopiedCloneUrl(false), 2000);
                          }
                        }}
                        className="shrink-0 p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                        title="Copy URL"
                      >
                        {copiedCloneUrl ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Target Subfolder / Root Directory */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 flex items-center gap-1.5">
                      <Folder className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Root Directory / Subfolder</span>
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">Optional</span>
                  </div>
                  <input
                    type="text"
                    value={folderPath}
                    onChange={(e) => setFolderPath(e.target.value)}
                    disabled={deployLoading}
                    placeholder="e.g. /Backend, backend, or empty for root"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-cyan-500/50 transition-colors font-mono"
                  />
                  <p className="text-[10px] text-neutral-500">
                    If your repository contains multiple folders (e.g. frontend & backend), specify the target directory where the Dockerfile will be created.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                  <span className="text-neutral-400">Environment</span>
                  <span className="text-neutral-200 font-medium">Production</span>
                </div>
              </div>

              {/* Error State Banner */}
              {deployError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-start gap-2 text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold text-rose-300">Deployment Failed</div>
                    <div className="text-[11px] text-rose-200/80 mt-0.5">{deployError}</div>
                  </div>
                </div>
              )}

              {/* Success State Banner */}
              {deployResult?.success ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Deployment Successfully Initiated</span>
                    </div>
                    <div className="pl-6 space-y-1 text-neutral-300 text-[11px]">
                      <div>
                        Container ID:{' '}
                        <span className="text-white font-medium">{deployResult.containerId}</span>
                      </div>
                      <div>
                        Status:{' '}
                        <span className="text-emerald-400 font-medium">
                          {deployResult.status?.phase ||
                            (typeof deployResult.status === 'string'
                              ? deployResult.status
                              : 'Active')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:bg-neutral-100 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                /* Modal Action Buttons */
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={deployLoading}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>

                  <motion.button
                    type="button"
                    onClick={handleConfirmDeploy}
                    disabled={deployLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:bg-neutral-100 flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] ${
                      deployLoading ? 'opacity-80 cursor-wait' : ''
                    }`}
                  >
                    {deployLoading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Deploying...</span>
                      </>
                    ) : (
                      <>
                        <Rocket className="w-3.5 h-3.5" />
                        <span>Deploy Application</span>
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
