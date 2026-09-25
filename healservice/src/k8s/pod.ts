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
            "volumes":[
                {
                    "name":"workspace-volume",
                    "emptyDir": {}
                }
            ],
            "initContainers": [
                {
                    "name": "init-container",
                    "image": `${imageName}`,
                    "imagePullPolicy": "IfNotPresent",
                    "command": ["sh", "-c", "if [ -d /app ]; then cp -a /app/. /seed/; elif [ -d /workspace ]; then cp -a /workspace/. /seed/; fi"],
                    "volumeMounts": [
                        {
                            "name": "workspace-volume",
                            "mountPath": "/seed"
                        }
                    ]
                }
            ],
            "containers": [
                {
                    "name": `${imageName}`,
                    "image": `${imageName}`,
                    "imagePullPolicy": "IfNotPresent",
                    "ports": [{ "containerPort": 5173 }],
                    "resources": {
                        "limits": {
                            "memory": "512Mi",
                            "cpu": "500m"
                        },
                        "requests": {
                            "memory": "256Mi",
                            "cpu": "250m"
                        }
                    },
                    "volumeMounts": [
                        {
                            "name": "workspace-volume",
                            "mountPath": "/workspace"
                        }
                    ],

                },{
                    "name":"agent",
                    "image":"agent:latest",
                    "imagePullPolicy":"IfNotPresent",
                    "ports": [{ "containerPort": 4000 }],
                    "resources":{
                        "limits":{
                            "memory":"512Mi",
                            "cpu":"500m"
                        },
                        "requests":{
                            "memory":"256Mi",
                            "cpu":"250m"
                        }
                    },
                    "volumeMounts":[
                        {
                            "name":"workspace-volume",
                            "mountPath":"/workspace"
                        }
                    ]
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
        name: `deployforge-pod-${id}`,
        namespace: "default",
        gracePeriodSeconds:0
    })
    return res;
}