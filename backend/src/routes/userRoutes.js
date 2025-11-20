import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { detectExcessiveProfileEdits } from "../middleware/suspiciousBehavior.js";
import {
	getProfile,
	getMyJobs,
	getMyOffers,
	getMyTasks,
	getUserStats,
	getPreferences,
	updatePreferences,
	updateProfile,
} from "../controllers/userController.js";

const router = Router();

router.get("/my-tasks", protect, getMyTasks);
router.get("/my-offers", protect, getMyOffers);
router.get("/my-jobs", protect, getMyJobs);
router.get("/stats", protect, getUserStats);
router.get("/preferences", protect, getPreferences);
router.patch("/preferences", protect, updatePreferences);
router.get("/me", protect, getProfile);
router.patch("/me", protect, detectExcessiveProfileEdits, updateProfile);

export default router;
