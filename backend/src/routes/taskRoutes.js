import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
	createTask,
	getTasks,
	getTask,
} from "../controllers/taskController.js";

const router = Router();

router.route("/").post(protect, createTask).get(getTasks);

router.route("/:id").get(getTask);

export default router;
