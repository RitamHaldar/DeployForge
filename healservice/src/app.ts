import express from "express";
import k8sRoutes from "./routs/k8s.routes.js";
import { GitRouter } from "./routs/github.routes.js";
export const app = express();
app.use(express.json());


app.use("/api/k8s", k8sRoutes);

app.use("/api/github",GitRouter)