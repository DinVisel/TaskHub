import { Router } from "express";
import { login, register, me } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { detectSuspiciousAccountCreation } from "../middleware/suspiciousBehavior.js";

const router = Router();

router.post("/register", detectSuspiciousAccountCreation, register);
router.post("/login", login);
router.get("/me", protect, me);

export default router;
