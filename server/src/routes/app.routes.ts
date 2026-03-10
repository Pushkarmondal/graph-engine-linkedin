import { Router } from "express"
import { createUsers } from "../controllers/users.controller"

const router = Router()
router.post("/create-users", createUsers)

export default router