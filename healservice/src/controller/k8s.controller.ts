import { GetLogs, getPod } from "../k8s/pod.js";
import {Request,Response} from "express"
export async function getNodesController(req:Request,res:Response):Promise<object>{
    try{
        const nodes=await getPod();
        return res.status(200).json({message:"nodes fetched successfully",nodes});
    }catch(err){
        console.log(" error in fetching nodes ",err);
        return res.status(500).json({message:"error in fetching nodes",err:err});
    }
}

export async function getLogsController(req: Request, res: Response):Promise<object> {
    try {
        const { podname } = req.query;

        if (!podname || typeof podname !== "string") {
            return res.status(400).json({ message: "podname query parameter is required and must be a string" });
        }

        const logs = await GetLogs(podname);
        return res.status(200).json({ message: "logs fetched successfully", logs });
    } catch (e) {
        console.log("error in fetching logs", e);
        return res.status(500).json({ message: "error in fetching logs", err: e });
    }
}
