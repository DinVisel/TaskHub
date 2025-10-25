import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getRecommendedTasks } from "../controllers/matchController.js";

const router = express.Router();

router.get("/", protect, getRecommendedTasks);

export default router;
