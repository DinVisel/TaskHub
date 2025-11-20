import express from "express";
import {
	register,
	login,
	me,
	verifyEmail,
	forgotPassword,
	resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Apply rate limiting to auth endpoints
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/me", protect, me);

export default router;
