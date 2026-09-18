import { app } from "./src/app.js";
import { coreV1Api } from "./src/k8s/kubernetes.js";
import { connectTODb } from "./src/config/db.js"


const PORT = process.env.PORT || 3000;
connectTODb()

app.listen(PORT, async () => {
  console.log(`[KubeHeal Controller] Running on http://localhost:${PORT}`);
  try {
    const response = await coreV1Api.listPodForAllNamespaces();

    const items = (response as any)?.items ?? (response as any)?.body?.items ?? [];

    const systemNamespaces = new Set([
      'kube-system',
      'kube-public',
      'kube-node-lease',
      'ingress-nginx',
    ]);

    const pods = items.filter(
      (pod: any) => !systemNamespaces.has(pod.metadata?.namespace)
    );

    console.log(
      `[KubeHeal Controller] Connected to Kubernetes. Detected ${pods.length} application pods:`
    );

    pods.forEach((pod: any) =>
      console.log(`  • ${pod.metadata?.namespace}/${pod.metadata?.name}`)
    );
  } catch (err: any) {
    console.error('[KubeHeal Controller] Failed to query Kubernetes API:', err.message);
  }
});
