import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../App/app.store';
import { GetRepos, Deploy } from '../services/github.api';
import { setLoading, setRepos, setError } from '../github.slice';
import type { DeployPayload } from '../types';

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
  }, []);

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

