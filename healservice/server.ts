import { app } from "./src/app.js";
import { coreV1Api } from "./src/k8s/kubernetes.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`[KubeHeal Controller] Running on http://localhost:${PORT}`);
  try {
    const response = await coreV1Api.listNode();
    const items = (response as any)?.items ?? (response as any)?.body?.items ?? [];
    console.log(`[KubeHeal Controller] Connected to Kubernetes. Detected ${items.length} nodes:`);
    items.forEach((n: any) => console.log(`  • ${n.metadata?.name}`));
  } catch (err: any) {
    console.error('[KubeHeal Controller] Failed to query Kubernetes API:', err.message);
  }
});
