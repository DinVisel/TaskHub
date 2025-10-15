import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
	createOffer,
	getOffersForTask,
} from "../controllers/offerController.js";

const router = Router();

router.post("/", protect, createOffer); // Create Offer
router.get("/:taskId", protect, getOffersForTask); // View offers for a task

export default router;
