import { getPod } from "../k8s/pod.js";
import {Request,Response} from "express"
export async function getNodesController(req:Request,res:Response){
    try{
        const nodes=await getPod();
        return res.status(200).json({message:"nodes fetched successfully",nodes});
    }catch(err){
        console.log(" error in fetching nodes ",err);
        return res.status(500).json({message:"error in fetching nodes",err:err});
    }
}