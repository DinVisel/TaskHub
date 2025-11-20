import express from "express";
import {
	createDispute,
	getDisputes,
	resolveDispute,
} from "../controllers/disputeController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(protect);

router.post("/", createDispute);

// Admin only routes
router.get("/", restrictTo("ADMIN"), getDisputes);
router.patch("/:id/resolve", restrictTo("ADMIN"), resolveDispute);

export default router;
