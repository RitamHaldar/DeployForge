import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../App/app.store';
import { GetRepos } from '../services/github.api';
import { setLoading, setRepos, setError } from '../github.slice';

export function useGit() {
  const dispatch = useDispatch<AppDispatch>();

  const { repos, loading, error } = useSelector((state: RootState) => state.git);

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

  return {
    repos,
    loading,
    error,
    fetchRepos,
  };
}
