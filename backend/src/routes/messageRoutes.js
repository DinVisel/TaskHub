import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
	getTaskMessages,
	sendMessageREST,
} from "../controllers/messageController.js";

const router = Router();

router.get("/:taskId", protect, getTaskMessages);
router.post("/", protect, sendMessageREST);

export default router;
