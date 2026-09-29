import axios from 'axios';

const api = axios.create({
  baseURL: '/api/k8s',
  withCredentials: true,
});

export async function fetchPodLogs(podName: string): Promise<string> {
  try {
    const res = await api.get('/get-logs', {
      params: { podname: podName },
    });
    return res.data?.logs || '';
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || 'Failed to fetch logs';
    throw new Error(msg);
  }
}

export async function fetchClusterNodes() {
  try {
    const res = await api.get('/nodes');
    return res.data;
  } catch (err: any) {
    console.error('Failed to fetch cluster nodes:', err);
    return null;
  }
}
