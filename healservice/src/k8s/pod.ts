import { coreV1Api } from "./kubernetes.js"; 


export async function createPod(id:string){
    const pod = {
        "metadata":{
            "name":`kubeheal-${id}`},
        "spec":{
            "containers":[
                {
                    "name":"template",
                    "image":"template-:latest",
                    "imagePullPolicy":"IfNotPresent",
                    "resources":{
                        "limits":{
                            "memory":"128Mi",
                            "cpu":"256m"
                        },
                        "requests":{
                            "memory":"64Mi",
                            "cpu":"128m"
                        }
                    }
                

                }
            ]
        }
    }
    const res = await coreV1Api.createNamespacedPod({
        namespace:"default",
        body:pod
    })
    return res;
}

export async function getPod(){
    try{
        const res = await coreV1Api.listNode();
        const items = (res as any)?.items ?? (res as any)?.body?.items ?? [];
        const nodes = items.map((node: any) => ({
        name: node.metadata?.name,
        status: node.status?.conditions?.slice(-1)[0]?.type ?? 'Unknown',
        roles: Object.keys(node.metadata?.labels || {})
            .filter(l => l.startsWith('node-role.kubernetes.io/'))
            .map(l => l.replace('node-role.kubernetes.io/', ''))
        }));
        return nodes;
    }catch(err){
        console.log(" error in listing nodes ",err);
        return {msg:"error in listing nodes",err:err};
    }
}