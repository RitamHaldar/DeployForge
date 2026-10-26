import { Router } from "express";
import { FixerrorInCode } from "../controllers/agent.controller.js";

const router = Router();

router.post("/fix-error", FixerrorInCode);

export default router;