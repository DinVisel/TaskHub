import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
	createOffer,
	getOffersForTask,
	acceptOffer,
	rejectOffer,
} from "../controllers/offerController.js";

const router = Router();

router.post("/", protect, createOffer);
router.get("/:taskId", protect, getOffersForTask);
router.put("/:offerId/accept", protect, acceptOffer);
router.put("/:offerId/reject", protect, rejectOffer);

export default router;
