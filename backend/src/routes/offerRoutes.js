import { Router } from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { requireCompleteProfile } from "../middleware/profileCompleteness.js";
import {
	createOffer,
	getOffersForTask,
	acceptOffer,
	rejectOffer,
} from "../controllers/offerController.js";

const router = Router();

router.post(
	"/",
	protect,
	requireRole(["VERIFIED_USER", "PRO_USER", "ADMIN"]),
	createOffer
);
router.get("/:taskId", protect, getOffersForTask);
router.put(
	"/:offerId/accept",
	protect,
	requireCompleteProfile,
	requireRole(["VERIFIED_USER", "PRO_USER", "ADMIN"]),
	acceptOffer
);
router.put(
	"/:offerId/reject",
	protect,
	requireRole(["VERIFIED_USER", "PRO_USER", "ADMIN"]),
	rejectOffer
);

export default router;
