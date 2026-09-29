import { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import type { RootState, AppDispatch } from '../../../App/app.store';
import { setCurrentDeployment } from '../deployment.slice';
import type { DeploymentRecord, ViewLayout } from '../types';
import { DeploymentHeader } from '../components/DeploymentHeader';
import { DeploymentSummaryBar } from '../components/DeploymentSummaryBar';
import { DeploymentPreviewFrame } from '../components/DeploymentPreviewFrame';
import { DeploymentInspector } from '../components/DeploymentInspector';
import { DeploymentShareModal } from '../components/DeploymentShareModal';

export function DeploymentPage() {
  const { deploymentId } = useParams<{ deploymentId?: string }>();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const { currentDeployment, history } = useSelector(
    (state: RootState) => state.deployment
  );

  const [layout, setLayout] = useState<ViewLayout>('split');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const glowRef = useRef<HTMLDivElement>(null);
  const syncedRef = useRef<string | null>(null);

  // Synchronize incoming router location state or URL params with Redux store safely
  useEffect(() => {
    const stateData = location.state as any;
    const targetId =
      deploymentId ||
      stateData?.previewurl?.match(/https?:\/\/([^.]+)\.preview/)?.[1] ||
      stateData?.containerId?.replace('deployforge-pod-', '') ||
      'active-deployment';

    // Prevent repeated re-dispatch if already synchronized
    if (syncedRef.current === targetId && currentDeployment?.id === targetId) {
      return;
    }

    if (stateData && (stateData.previewurl || stateData.containerId)) {
      syncedRef.current = targetId;

      const fullRecord: DeploymentRecord = {
        id: targetId,
        previewurl:
          stateData.previewurl || `http://${targetId}.preview.localhost`,
        agenturl:
          stateData.agenturl || `http://${targetId}.agent.localhost`,
        containerId:
          stateData.containerId || `deployforge-pod-${targetId}`,
        status: stateData.status || 'Running',
        message: stateData.message || 'Deployment provisioned successfully',
        repoName: stateData.repoName || stateData.repo?.name || 'Application',
        repoUrl: stateData.repoUrl || stateData.repo?.cloneUrl || '',
        folderpath: stateData.folderpath || '',
        deployedAt: stateData.deployedAt || new Date().toISOString(),
      };

      dispatch(setCurrentDeployment(fullRecord));
    } else if (deploymentId) {
      syncedRef.current = targetId;

      const match = history.find((h) => h.id === deploymentId);
      if (match) {
        dispatch(setCurrentDeployment(match));
      } else if (!currentDeployment || currentDeployment.id !== deploymentId) {
        const fallbackRecord: DeploymentRecord = {
          id: deploymentId,
          previewurl: `http://${deploymentId}.preview.localhost`,
          agenturl: `http://${deploymentId}.agent.localhost`,
          containerId: `deployforge-pod-${deploymentId}`,
          status: 'Running',
          message: 'Deployment active',
          repoName: 'Deployed Repository',
          repoUrl: '',
          deployedAt: new Date().toISOString(),
        };
        dispatch(setCurrentDeployment(fallbackRecord));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally omitting history and currentDeployment to prevent infinite re-dispatch loops
  }, [deploymentId, location.state, dispatch, currentDeployment?.id]);

  // Ambient cursor glow tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${e.clientX - 275}px, ${
          e.clientY - 275
        }px, 0)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const activeRecord: DeploymentRecord = currentDeployment || {
    id: deploymentId || 'preview-demo',
    previewurl: `http://${deploymentId || 'demo'}.preview.localhost`,
    agenturl: `http://${deploymentId || 'demo'}.agent.localhost`,
    containerId: `deployforge-pod-${deploymentId || 'demo'}`,
    status: 'Running',
    repoName: 'Deployed Application',
    repoUrl: 'https://github.com',
    deployedAt: new Date().toISOString(),
  };

  return (
    <div className="relative h-screen max-h-screen w-full bg-[#070809] text-[#F5F5F5] overflow-hidden flex flex-col selection:bg-cyan-500/20 selection:text-cyan-400 font-sans">
      
      {/* Interactive Ambient Cursor Glow */}
      <div
        ref={glowRef}
        className="pointer-events-none fixed top-0 left-0 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-cyan-500/[0.04] via-blue-500/[0.03] to-transparent blur-3xl opacity-60 z-0 will-change-transform"
        aria-hidden="true"
      />

      {/* Atmospheric Tech Grid Background */}
      <div className="fixed inset-0 bg-tech-grid opacity-35 pointer-events-none z-0" aria-hidden="true" />
      <div className="fixed inset-0 bg-noise pointer-events-none z-0 opacity-80" aria-hidden="true" />

      {/* Navigation Header */}
      <DeploymentHeader
        deployment={activeRecord}
        onOpenShare={() => setIsShareModalOpen(true)}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Main Single-Window Workspace */}
      <main className="relative z-10 flex-1 min-h-0 w-full max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-6 py-2 flex flex-col overflow-hidden">
        
        {/* Compact Single-Row Summary & Layout Control Toolbar */}
        <DeploymentSummaryBar
          deployment={activeRecord}
          layout={layout}
          onLayoutChange={setLayout}
        />

        {/* Master Viewport Container */}
        <div className="flex-1 min-h-0 w-full overflow-hidden">
          <AnimatePresence mode="wait">
            {layout === 'split' && (
              <motion.div
                key="split"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-full min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3"
              >
                {/* Left Column: Interactive Live Preview */}
                <div className="lg:col-span-7 xl:col-span-7 h-full min-h-0 flex flex-col overflow-hidden">
                  <DeploymentPreviewFrame
                    previewUrl={activeRecord.previewurl}
                    repoName={activeRecord.repoName}
                    isExpanded={false}
                    onToggleExpand={() => setLayout('preview-focus')}
                  />
                </div>

                {/* Right Column: Unified Tabbed Inspector */}
                <div className="lg:col-span-5 xl:col-span-5 h-full min-h-0 flex flex-col overflow-hidden">
                  <DeploymentInspector
                    deployment={activeRecord}
                    isExpanded={false}
                    onToggleExpand={() => setLayout('console-focus')}
                  />
                </div>
              </motion.div>
            )}

            {layout === 'preview-focus' && (
              <motion.div
                key="preview-focus"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.15 }}
                className="w-full h-full min-h-0 flex flex-col overflow-hidden"
              >
                <DeploymentPreviewFrame
                  previewUrl={activeRecord.previewurl}
                  repoName={activeRecord.repoName}
                  isExpanded={true}
                  onToggleExpand={() => setLayout('split')}
                />
              </motion.div>
            )}

            {layout === 'console-focus' && (
              <motion.div
                key="console-focus"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.15 }}
                className="w-full h-full min-h-0 flex flex-col overflow-hidden"
              >
                <DeploymentInspector
                  deployment={activeRecord}
                  isExpanded={true}
                  onToggleExpand={() => setLayout('split')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Share Modal */}
      <DeploymentShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        deployment={activeRecord}
      />
    </div>
  );
}
