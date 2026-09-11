import { Router } from "express";
import { getNodesController } from "../controller/k8s.controller.js";

const router = Router();

router.get("/nodes", getNodesController);
export default router;