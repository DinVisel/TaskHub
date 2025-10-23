import { Router } from "express";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import {
	createOffer,
	getOffersForTask,
	acceptOffer,
	rejectOffer,
} from "../controllers/offerController.js";

const router = Router();

router.post("/", protect, restrictTo("worker"), createOffer);
router.get("/:taskId", protect, restrictTo("client"), getOffersForTask);
router.put("/:offerId/accept", protect, restrictTo("client"), acceptOffer);
router.put("/:offerId/reject", protect, restrictTo("client"), rejectOffer);

export default router;
