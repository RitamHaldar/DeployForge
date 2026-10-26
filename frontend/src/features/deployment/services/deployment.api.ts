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

export async function runAgentAutoFix(params: {
  agentUrl?: string;
  podName?: string;
  customPrompt?: string;
  errorLog?: string;
}) {
  try {
    const base = params.agentUrl ? params.agentUrl.replace(/\/$/, '') : '';
    const endpoint = base ? `${base}/api/agent/fix-error` : '/api/agent/fix-error';

    const res = await axios.post(
      endpoint,
      {
        podname: params.podName,
        prompt: params.customPrompt,
        errorLog: params.errorLog,
        url: params.agentUrl,
      },
      {
        timeout: 90000,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return res.data;
  } catch (err: any) {
    const msg =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      'Failed to connect to AI debugging agent';
    throw new Error(msg);
  }
}

