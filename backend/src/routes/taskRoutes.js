import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { checkJobPostingPermission } from "../middleware/jobPostingControl.js";
import { detectRiskyJob } from "../middleware/jobRiskDetection.js";
import {
	createTask,
	getTask,
	completeTask,
	getFilteredTasks,
} from "../controllers/taskController.js";

const router = Router();

router
	.route("/")
	.post(protect, checkJobPostingPermission, detectRiskyJob, createTask)
	.get(getFilteredTasks);
router.put(
	"/:id/complete",
	protect,
	requireRole(["VERIFIED_USER", "PRO_USER", "ADMIN"]),
	completeTask
);

router.route("/:id").get(getTask);

export default router;
