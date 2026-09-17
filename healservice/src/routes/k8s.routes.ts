import { Router } from "express";
import { getNodesController,getLogsController} from "../controller/k8s.controller.js";

const router = Router();

router.get("/nodes", getNodesController);

router.get("/get-logs",getLogsController);
export default router;