import { Router } from "express";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
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

router.get("/my-tasks", protect, restrictTo("client"), getMyTasks);
router.get("/my-offers", protect, restrictTo("worker"), getMyOffers);
router.get("/my-jobs", protect, restrictTo("worker"), getMyJobs);
router.get("/stats", protect, getUserStats);
router.get("/preferences", protect, getPreferences);
router.patch("/preferences", protect, updatePreferences);
router.get("/me", protect, getProfile);
router.patch("/me", protect, updateProfile);

export default router;
