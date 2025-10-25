import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
	getWallet,
	addFunds,
	transferFunds,
} from "../controllers/walletController.js";

const router = express.Router();

router.use(protect);
router.get("/", getWallet);
router.post("/add", addFunds);
router.post("/transfer", transferFunds);

export default router;
