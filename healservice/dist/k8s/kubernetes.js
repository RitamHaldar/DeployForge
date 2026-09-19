import * as k8s from "@kubernetes/client-node";
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
export const coreV1Api = kc.makeApiClient(k8s.CoreV1Api);
