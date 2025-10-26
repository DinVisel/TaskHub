import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/User.js";
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
	const parsedAmount = Number(amount);

	if (!Number.isFinite(parsedAmount) || parsedAmount <= 0)
		return next(new AppError("Invalid amount", 400));

	const user = await User.findById(req.user._id);
	user.walletBalance += parsedAmount;
	user.transactions.push({
		type: "add",
		amount: parsedAmount,
		description: "Added funds",
	});
	await user.save();

	res.json({ balance: user.walletBalance });
});

// POST /api/wallet/transfer
export const transferFunds = asyncHandler(async (req, res, next) => {
	const { receiverId, amount, description } = req.body;
	const sender = await User.findById(req.user._id);
	const receiver = await User.findById(receiverId);
	if (!receiver) return next(new AppError("Receiver not found", 404));
	if (receiver._id.toString() === sender._id.toString())
		return next(new AppError("Cannot transfer funds to yourself", 400));

	const parsedAmount = Number(amount);

	if (!Number.isFinite(parsedAmount) || parsedAmount <= 0)
		return next(new AppError("Invalid amount", 400));
	if (sender.walletBalance < parsedAmount)
		return next(new AppError("Insufficient funds", 400));

	sender.walletBalance -= parsedAmount;
	receiver.walletBalance += parsedAmount;

	sender.transactions.push({
		type: "spend",
		amount: -parsedAmount,
		description,
	});
	receiver.transactions.push({
		type: "receive",
		amount: parsedAmount,
		description,
	});

	await Promise.all([sender.save(), receiver.save()]);

	res.json({ senderBalance: sender.walletBalance });
});
