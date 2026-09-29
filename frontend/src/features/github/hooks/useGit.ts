import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../App/app.store';
import { GetRepos, Deploy } from '../services/github.api';
import { setLoading, setRepos, setError } from '../github.slice';
import type { DeployPayload } from '../types';

import { setCurrentDeployment } from '../../deployment/deployment.slice';

export function useGit() {
  const dispatch = useDispatch<AppDispatch>();

  const { repos, loading, error } = useSelector((state: RootState) => state.git);
  const [deployLoading, setDeployLoading] = useState<boolean>(false);
  const [deployError, setDeployError] = useState<string | null>(null);

  const fetchRepos = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const data = await GetRepos();
      dispatch(setRepos(data));
      return data;
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to fetch repositories';
      dispatch(setError(message));
      return null;
    }
  }, [dispatch]);

  const deployRepo = useCallback(async (payload: DeployPayload) => {
    setDeployLoading(true);
    setDeployError(null);
    try {
      const response = await Deploy(payload);
      setDeployLoading(false);

      if (response && (response.previewurl || response.containerId)) {
        const buildIdMatch = response.previewurl?.match(/https?:\/\/([^.]+)\.preview/);
        const deploymentId =
          buildIdMatch?.[1] ||
          response.containerId?.replace('deployforge-pod-', '') ||
          'active-deployment';

        dispatch(
          setCurrentDeployment({
            id: deploymentId,
            previewurl: response.previewurl || `http://${deploymentId}.preview.localhost`,
            agenturl: response.agenturl || `http://${deploymentId}.agent.localhost`,
            containerId: response.containerId || `deployforge-pod-${deploymentId}`,
            status: response.status || 'Running',
            message: response.message || 'Deployment provisioned successfully',
            repoName: payload.repoName,
            repoUrl: payload.repoUrl,
            folderpath: payload.folderpath,
            deployedAt: new Date().toISOString(),
          })
        );
      }

      return response;
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to deploy repository';
      setDeployError(message);
      setDeployLoading(false);
      throw err;
    }
  }, [dispatch]);

  return {
    repos,
    loading,
    error,
    fetchRepos,
    deployRepo,
    deployLoading,
    deployError,
    clearDeployError: () => setDeployError(null),
  };
}

