import { coreV1Api } from "./kubernetes.js";
export async function createPod(id, imageName) {
    const pod = {
        "metadata": {
            "name": `kubeheal-${id}`
        },
        "spec": {
            "containers": [
                {
                    "name": `${imageName}`,
                    "image": `${imageName}`,
                    "imagePullPolicy": "IfNotPresent",
                    "resources": {
                        "limits": {
                            "memory": "128Mi",
                            "cpu": "256m"
                        },
                        "requests": {
                            "memory": "64Mi",
                            "cpu": "128m"
                        }
                    }
                }
            ]
        }
    };
    const res = await coreV1Api.createNamespacedPod({
        namespace: "default",
        body: pod
    });
    return res;
}
export async function getPod() {
    try {
        const res = await coreV1Api.listPodForAllNamespaces();
        const items = res?.items ?? res?.body?.items ?? [];
        const systemNamespaces = new Set([
            'kube-system',
            'kube-public',
            'kube-node-lease',
            'ingress-nginx',
        ]);
        const pods = items
            .filter((pod) => !systemNamespaces.has(pod.metadata?.namespace))
            .map((pod) => ({
            name: pod.metadata?.name,
            namespace: pod.metadata?.namespace,
            status: pod.status?.phase ?? 'Unknown',
        }));
        return pods;
    }
    catch (err) {
        return { msg: "error in listing nodes", err: err };
    }
}
export async function GetLogs(pod) {
    try {
        const response = await coreV1Api.readNamespacedPodLog({
            name: pod,
            namespace: 'default',
            tailLines: 100
        });
        return { response };
    }
    catch (err) {
        return { msg: "error in getting logs", err: err };
    }
}
