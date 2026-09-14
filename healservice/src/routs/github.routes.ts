import { Router } from "express";
import { ListRepos } from "../controller/github.controller.js";

export const GitRouter=Router();

GitRouter.get("/repos",ListRepos);