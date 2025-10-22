import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
	createTask,
	getTasks,
	getTask,
	completeTask,
} from "../controllers/taskController.js";

const router = Router();

router.route("/").post(protect, createTask).get(getTasks);
router.put("/:id/complete", protect, completeTask);

router.route("/:id").get(getTask);

export default router;
