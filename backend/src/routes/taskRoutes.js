import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
        createTask,
        getTask,
        completeTask,
        getFilteredTasks,
} from "../controllers/taskController.js";

const router = Router();

router.route("/").post(protect, createTask).get(getFilteredTasks);
router.put("/:id/complete", protect, completeTask);

router.route("/:id").get(getTask);

export default router;
