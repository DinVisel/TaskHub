import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/userModel.js";
import AppError from "../utils/appError.js";

// GET /api/wallet
export const getWallet = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id).select(
		"walletBalance transactions"
	);
	res.json(user);
});

// POST /api/wallet/add
export const addFunds = asyncHandler(async (req, res, next) => {
	const { amount } = req.body;
	if (!amount || amount <= 0) return next(new AppError("Invalid amount", 400));

	const user = await User.findById(req.user._id);
	user.walletBalance += amount;
	user.transactions.push({ type: "add", amount, description: "Added funds" });
	await user.save();

	res.json({ balance: user.walletBalance });
});

// POST /api/wallet/transfer
export const transferFunds = asyncHandler(async (req, res, next) => {
	const { receiverId, amount, description } = req.body;
	const sender = await User.findById(req.user._id);
	const receiver = await User.findById(receiverId);
	if (!receiver) return next(new AppError("Receiver not found", 404));
	if (amount <= 0) return next(new AppError("Invalid amount", 400));
	if (sender.walletBalance < amount)
		return next(new AppError("Insufficient funds", 400));

	sender.walletBalance -= amount;
	receiver.walletBalance += amount;

	sender.transactions.push({ type: "spend", amount: -amount, description });
	receiver.transactions.push({ type: "receive", amount, description });

	await sender.save();
	await receiver.save();

	res.json({ senderBalance: sender.walletBalance });
});
