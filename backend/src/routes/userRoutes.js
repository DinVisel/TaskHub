import { Router } from "express";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import {
        getMyJobs,
        getMyOffers,
        getMyTasks,
} from "../controllers/userController.js";

const router = Router();

router.get("/my-tasks", protect, restrictTo("client"), getMyTasks);
router.get("/my-offers", protect, restrictTo("worker"), getMyOffers);
router.get("/my-jobs", protect, restrictTo("worker"), getMyJobs);

export default router;
