import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import { getTaskMessages,sendMessageREST } from "../controllers/messageController";

const router = Router()

router.get("/:taskId",protect,getTaskMessages)
router.post("/",protect, sendMessageREST)

export default router