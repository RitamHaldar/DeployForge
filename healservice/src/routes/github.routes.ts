import { Router } from "express";
import { ListRepos } from "../controller/github.controller.js";
import { VerifyUser } from "../middleware/user.middleware.js";

export const GitRouter=Router();

GitRouter.get("/repos",VerifyUser,ListRepos);