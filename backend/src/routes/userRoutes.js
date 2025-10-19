import {Router}from "express"
import {protect}from "../middleware/authMiddleware.js"
import { getMyJobs,getMyOffers,getMyTasks } from "../controllers/userController.js"

const router = Router()

router.get("my-tasks",protect,getMyTasks)
router.get("my-offers",protect,getMyOffers)
router.get("my-jobs",protect,getMyJobs)

export default router