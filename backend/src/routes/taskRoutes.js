import { Router } from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { detectRapidJobPosting } from "../middleware/suspiciousBehavior.js";
import {
	createTask,
	getTask,
	completeTask,
	getFilteredTasks,
} from "../controllers/taskController.js";

const router = Router();

router
	.route("/")
	.post(protect, requireRole(["VERIFIED_USER", "PRO_USER", "ADMIN"]), detectRapidJobPosting, createTask)
	.get(getFilteredTasks);
router.put(
	"/:id/complete",
	protect,
	requireRole(["VERIFIED_USER", "PRO_USER", "ADMIN"]),
	completeTask
);

router.route("/:id").get(getTask);

export default router;
