import express, { Request, Response } from "express";
import k8sRoutes from "./routes/k8s.routes.js";
import { GitRouter } from "./routes/github.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors"

export const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use("/api/k8s", k8sRoutes);

app.use("/api/github",GitRouter)

app.get("/api/k8s/heath",(req:Request,res:Response)=>{
    res.status(200).json({
        success:true,
        message:"Heal Service is working"
    })
})