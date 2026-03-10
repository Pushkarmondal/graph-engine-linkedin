import { Router } from "express"
import { createUsers } from "../controllers/users.controller"
import { createCompany } from "../controllers/companies.controller"

const router = Router()
router.post("/create-users", createUsers)
router.post("/create-company", createCompany)

export default router