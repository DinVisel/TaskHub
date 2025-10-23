import { Router } from "express";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import {
	getMyJobs,
	getMyOffers,
	getMyTasks,
	getUserStats,
} from "../controllers/userController.js";

const router = Router();

router.get("/my-tasks", protect, restrictTo("client"), getMyTasks);
router.get("/my-offers", protect, restrictTo("worker"), getMyOffers);
router.get("/my-jobs", protect, restrictTo("worker"), getMyJobs);
router.get("/stats", protect, getUserStats);

export default router;
