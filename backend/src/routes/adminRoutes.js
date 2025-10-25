import express from "express";
import {
	getAllUsers,
	deleteUser,
	getAllTasks,
	deleteTask,
	getAllReviews,
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, adminOnly);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.get("/tasks", getAllTasks);
router.delete("/tasks/:id", deleteTask);
router.get("/reviews", getAllReviews);

export default router;
