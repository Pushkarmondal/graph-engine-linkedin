import { Router } from "express";
import { createUsers } from "../controllers/users.controller";
import { createCompany } from "../controllers/companies.controller";
import { createSkill } from "../controllers/skills.controller";
import { attachCompanyToUser } from "../controllers/attachCompaniesTousers.controller";
import { attachSkillsToUser } from "../controllers/attachSkillsTousers.controller";
import { connectUsers } from "../controllers/connection.controller";
import {
  getMutualConnectionsController,
  getRecommendationsController,
  getShortestPathController,
  getNetworkDepthController,
} from "../controllers/graph.controller";

const router = Router();
router.post("/create-users", createUsers);
router.post("/create-company", createCompany);
router.post("/create-skill", createSkill);
router.post("/users/:userId/company", attachCompanyToUser);
router.post("/users/:userId/skill", attachSkillsToUser);
router.post("/users/connection", connectUsers);

// Graph traversal endpoints
router.get("/users/:id/mutual/:targetId", getMutualConnectionsController);
router.get("/users/:id/recommendations", getRecommendationsController);
router.get("/connections/path", getShortestPathController);
router.get("/users/:id/network-depth", getNetworkDepthController);

export default router;
