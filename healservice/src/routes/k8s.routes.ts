import { Router } from "express";
import { getNodesController,getLogsController, DeployDocker} from "../controller/k8s.controller.js";
import { VerifyUser } from "../middleware/user.middleware.js";

const router = Router();

router.get("/nodes", getNodesController);

router.get("/get-logs",getLogsController);

router.post("/deploy",VerifyUser,DeployDocker)
export default router;