import { Router } from "express";
import { protect,requireRole } from "../middleware/authMiddleware.js";
import { checkJobPostingPermission } from "../middleware/jobPostingControl.js";
import { detectRiskyJob } from "../middleware/jobRiskDetection.js";
import { requireCompleteProfile } from "../middleware/profileCompleteness.js";
import {
	createTask,
	getTask,
	completeTask,
	getFilteredTasks,
	updateTask,
} from "../controllers/taskController.js";

const router = Router();

router
	.route("/")
	.post(protect, requireCompleteProfile, checkJobPostingPermission, detectRiskyJob, createTask)
	.get(getFilteredTasks);
router.put(
	"/:id/complete",
	protect,
	requireRole(["VERIFIED_USER", "PRO_USER", "ADMIN"]),
	completeTask
);

router.route("/:id").get(getTask).patch(protect, updateTask);

export default router;
