import { coreV1Api } from "./kubernetes.js";


export async function createPod(id: string, imageName: string) {
    const pod = {
        "metadata": {
            "name": `deployforge-pod-${id}`,
            "labels": {
                "kubehealId": id
            }
        },
        "spec": {
            "containers": [
                {
                    "name": `${imageName}`,
                    "image": `${imageName}`,
                    "imagePullPolicy": "IfNotPresent",
                    "resources": {
                        "limits": {
                            "memory": "512Mi",
                            "cpu": "500m"
                        },
                        "requests": {
                            "memory": "256Mi",
                            "cpu": "250m"
                        }
                    }


                }
            ]
        }
    }
    const res = await coreV1Api.createNamespacedPod({
        namespace: "default",
        body: pod
    })
    return res;
}

export async function getPod(): Promise<object> {
    try {
        const res = await coreV1Api.listPodForAllNamespaces();

        const items = (res as any)?.items ?? (res as any)?.body?.items ?? [];

        const systemNamespaces = new Set([
            'kube-system',
            'kube-public',
            'kube-node-lease',
            'ingress-nginx',
        ]);

        const pods = items
            .filter((pod: any) => !systemNamespaces.has(pod.metadata?.namespace))
            .map((pod: any) => ({
                name: pod.metadata?.name,
                namespace: pod.metadata?.namespace,
                status: pod.status?.phase ?? 'Unknown',
            }));

        return pods;
    } catch (err) {
        return { msg: "error in listing nodes", err: err };
    }
}

export async function GetLogs(pod: string): Promise<object> {
    try {
        const response = await coreV1Api.readNamespacedPodLog({
            name: pod,
            namespace: 'default',
            tailLines: 100
        });

        return { response };
    }
    catch (err) {
        return { msg: "error in getting logs", err: err }
    }
}

export async function DeletePod(id: string):Promise<object> {
    const res = await coreV1Api.deleteNamespacedPod({
        name: `kubeheal-${id}`,
        namespace: "default",
        gracePeriodSeconds:0
    })
    return res;
}