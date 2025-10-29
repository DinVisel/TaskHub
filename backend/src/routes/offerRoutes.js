import { Router } from "express";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import {
	createOffer,
	getOffersForTask,
	acceptOffer,
	rejectOffer,
} from "../controllers/offerController.js";

const router = Router();

router.post("/", protect, restrictTo("user"), createOffer);
router.get("/:taskId", protect, restrictTo("user"), getOffersForTask);
router.put("/:offerId/accept", protect, restrictTo("user"), acceptOffer);
router.put("/:offerId/reject", protect, restrictTo("user"), rejectOffer);

export default router;
