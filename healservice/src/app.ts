import express from "express";
import k8sRoutes from "./routs/k8s.routes.js";
export const app = express();
app.use(express.json());


app.use("/api/k8s", k8sRoutes);
