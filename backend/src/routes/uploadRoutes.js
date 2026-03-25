import express from "express";
import { upload, uploadImage } from "../controllers/uploadController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect upload route
router.post("/", protect, upload.single("file"), uploadImage);

export default router;
