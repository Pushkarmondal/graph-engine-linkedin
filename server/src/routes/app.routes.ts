import { Router } from "express"
import { createUsers } from "../controllers/users.controller"
import { createCompany } from "../controllers/companies.controller"
import { createSkill } from "../controllers/skills.controller"
import { attachCompanyToUser } from "../controllers/attachCompaniesTousers.controller"

const router = Router()
router.post("/create-users", createUsers)
router.post("/create-company", createCompany)
router.post("/create-skill", createSkill)
router.post("/users/:userId/company", attachCompanyToUser)

export default router