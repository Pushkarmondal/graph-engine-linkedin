import { Router } from "express"
import { createUsers } from "../controllers/users.controller"
import { createCompany } from "../controllers/companies.controller"
import { createSkill } from "../controllers/skills.controller"
import { attachCompanyToUser } from "../controllers/attachCompaniesTousers.controller"
import { attachSkillsToUser } from "../controllers/attachSkillsTousers.controller"
import { connectUsers } from "../controllers/connection.controller"

const router = Router()
router.post("/create-users", createUsers)
router.post("/create-company", createCompany)
router.post("/create-skill", createSkill)
router.post("/users/:userId/company", attachCompanyToUser)
router.post("/users/:userId/skill", attachSkillsToUser)
router.post("/users/connection", connectUsers)

export default router