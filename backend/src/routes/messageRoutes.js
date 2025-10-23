import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
	getTaskMessages,
	sendMessageREST,
	getUserThreads,
} from "../controllers/messageController.js";

const router = Router();

router.get("/overview", protect, getUserThreads);
router.get("/:taskId", protect, getTaskMessages);
router.post("/", protect, sendMessageREST);

export default router;
