import express from "express";
import {
	getAllUsers,
	deleteUser,
	getAllTasks,
	deleteTask,
	getAllReviews,
	getAdminAnalytics,
	updateUserRole,
} from "../controllers/adminController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, requireRole(["ADMIN"]));
router.get("/users", getAllUsers);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);
router.get("/tasks", getAllTasks);
router.delete("/tasks/:id", deleteTask);
router.get("/reviews", getAllReviews);
router.get("/analytics", getAdminAnalytics);

export default router;
