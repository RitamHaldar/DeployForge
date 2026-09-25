import { coreV1Api } from "./kubernetes.js";

export async function CreateService(id: string):Promise<object>{
    const serviceManifest = {
        "metadata": {
            "name": `deployforge-service-${id}`,
            "labels": {
                "app": "kubeheal-service",
                "kubehealId": id
            }
        },
        "spec": {
            "selector": {
                "kubehealId": id
            },
            "ports": [
                {
                    "name": "http",
                    "port": 80,
                    "targetPort": 5173,
                    "protocol": "TCP"
                },
                {
                    "name": "agent-http",
                    "port": 4000,
                    "targetPort": 4000,
                    "protocol": "TCP"
                }
            ],
            "type": "ClusterIP"
        }
    }
    const res=await coreV1Api.createNamespacedService({
        namespace:"default",
        body: serviceManifest
    })
    return res;
}

export async function DeleteService(id:string):Promise<object>{
    const res=await coreV1Api.deleteNamespacedService({
        namespace:"default",
        name: `deployforge-service-${id}`,
        gracePeriodSeconds:0
    })
    return res;
}