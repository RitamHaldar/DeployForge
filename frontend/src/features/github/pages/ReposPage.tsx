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
import {
  Rocket,
  X,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  GitBranch,
} from 'lucide-react';

export function ReposPage() {
  const { repos, loading, error, fetchRepos } = useGit();

  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<FilterVisibility>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Interactive Deployment Modal State
  const [deployModalRepo, setDeployModalRepo] = useState<GitResponse | null>(null);
  const [isLaunchingDeploy, setIsLaunchingDeploy] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);

  // Fetch repositories on mount
  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  // Ambient cursor glow tracking (silky smooth, 60fps, RAF lerp)
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
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.fullName?.toLowerCase().includes(q) ||
          r.defaultBranch?.toLowerCase().includes(q)
      );
    }

    // Filter by visibility
    if (visibilityFilter === 'public') {
      list = list.filter(
        (r) =>
          r.private === false ||
          r.private === 'false' ||
          String(r.private).toLowerCase() === 'public'
      );
    } else if (visibilityFilter === 'private') {
      list = list.filter(
        (r) =>
          r.private === true ||
          r.private === 'true' ||
          String(r.private).toLowerCase() === 'private'
      );
    }

    // Sort
    if (sortBy === 'name') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return list;
  }, [repos, searchQuery, visibilityFilter, sortBy]);

  // Statistics
  const totalCount = Array.isArray(repos) ? repos.length : 0;
  const publicCount = Array.isArray(repos)
    ? repos.filter(
        (r) =>
          r.private === false ||
          r.private === 'false' ||
          String(r.private).toLowerCase() === 'public'
      ).length
    : 0;
  const privateCount = totalCount - publicCount;

  // Handle Deploy Initiation
  const handleDeploy = (repo: GitResponse) => {
    setDeployModalRepo(repo);
    setDeploySuccess(false);
  };

  const handleConfirmDeploy = () => {
    setIsLaunchingDeploy(true);
    setTimeout(() => {
      setIsLaunchingDeploy(false);
      setDeploySuccess(true);
      setTimeout(() => {
        setDeployModalRepo(null);
        setDeploySuccess(false);
      }, 2000);
    }, 1800);
  };

  return (
    <div className="relative min-h-screen bg-brand-bg text-brand-text overflow-x-hidden selection:bg-accent-cyan/20 selection:text-accent-cyan font-sans">
      
      {/* Interactive Ambient Cursor Glow */}
      <div
        ref={glowRef}
        className="pointer-events-none fixed top-0 left-0 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-accent-blue/10 via-accent-cyan/[0.05] to-transparent blur-3xl opacity-60 z-0 will-change-transform"
        aria-hidden="true"
      />

      {/* Atmospheric Tech Grid & Vignette */}
      <div className="fixed inset-0 bg-tech-grid opacity-60 pointer-events-none z-0" aria-hidden="true" />
      <div className="fixed inset-0 radial-vignette pointer-events-none z-0" aria-hidden="true" />

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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-xs font-mono mb-3">
                <Sparkles className="w-3 h-3 animate-pulse" />
                <span>Autonomous GitOps Sync</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
                GitHub Repositories
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 font-mono mt-1 max-w-xl">
                Select any repository to connect autonomous self-healing microservices, live health sentinels, and zero-downtime pipelines.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <a
                href="https://github.com/new"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl text-xs font-mono font-medium text-neutral-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors flex items-center gap-1.5"
              >
                <span>+ New on GitHub</span>
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

        {/* Repository Grid / List Display */}
        {loading && totalCount === 0 ? (
          <RepoSkeleton count={6} viewMode={viewMode} />
        ) : error && totalCount === 0 ? (
          <RepoEmptyState
            type="error"
            errorMessage={error}
            onRetry={fetchRepos}
          />
        ) : filteredRepos.length === 0 ? (
          <RepoEmptyState
            type={searchQuery ? 'no-results' : 'no-repos'}
            searchQuery={searchQuery}
            onClearSearch={() => setSearchQuery('')}
            onRetry={fetchRepos}
          />
        ) : (
          <motion.div
            layout
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.04,
                },
              },
            }}
            initial="hidden"
            animate="visible"
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'flex flex-col gap-3'
            }
          >
            {filteredRepos.map((repo) => (
              <RepoCard
                key={repo.id || repo.name}
                repo={repo}
                onDeploy={handleDeploy}
              />
            ))}
          </motion.div>
        )}

      </main>

      {/* Interactive Deployment Launch Modal */}
      <AnimatePresence>
        {deployModalRepo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isLaunchingDeploy && setDeployModalRepo(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className="relative w-full max-w-lg rounded-3xl bg-[#090B0E] border border-white/[0.12] p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_50px_rgba(0,240,255,0.08)] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/25 flex items-center justify-center text-accent-cyan">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white font-sans">
                      Deploy to Cloud Cluster
                    </h3>
                    <p className="text-xs font-mono text-neutral-400">
                      Target repository:{' '}
                      <span className="text-accent-cyan font-semibold">
                        {deployModalRepo.name}
                      </span>
                    </p>
                  </div>
                </div>

                {!isLaunchingDeploy && (
                  <button
                    type="button"
                    onClick={() => setDeployModalRepo(null)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Deployment Settings Preview */}
              <div className="space-y-3 mb-6 font-mono text-xs">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-accent-cyan" />
                    <span>Source Branch</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-white font-semibold">
                    {deployModalRepo.defaultBranch || 'main'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-accent-emerald" />
                    <span>Autonomous Self-Healing</span>
                  </span>
                  <span className="text-accent-emerald font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
                    <span>Active (3.8s recovery)</span>
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-accent-cyan" />
                    <span>Target Kubernetes Cluster</span>
                  </span>
                  <span className="text-neutral-200">us-east-1-forge-cluster</span>
                </div>
              </div>

              {/* Launch Status / Actions */}
              {deploySuccess ? (
                <div className="p-4 rounded-2xl bg-accent-emerald/10 border border-accent-emerald/25 flex items-center justify-center gap-2 text-accent-emerald font-mono text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pipeline provisioned! Redirecting to Sentinel...</span>
                </div>
              ) : (
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={isLaunchingDeploy}
                    onClick={() => setDeployModalRepo(null)}
                    className="px-4 py-2 rounded-xl text-xs font-mono text-neutral-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>

                  <motion.button
                    type="button"
                    disabled={isLaunchingDeploy}
                    onClick={handleConfirmDeploy}
                    whileHover={{ scale: isLaunchingDeploy ? 1 : 1.02 }}
                    whileTap={{ scale: isLaunchingDeploy ? 1 : 0.98 }}
                    className="btn-sweep px-5 py-2.5 rounded-xl text-xs font-semibold font-sans tracking-wide bg-white text-black hover:bg-neutral-100 flex items-center gap-2 shadow-[0_0_25px_rgba(255,255,255,0.18)]"
                  >
                    {isLaunchingDeploy ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Provisioning Cluster Replicas...</span>
                      </>
                    ) : (
                      <>
                        <Rocket className="w-3.5 h-3.5 text-black fill-black" />
                        <span>Confirm & Launch Pipeline</span>
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
