import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/User.js";
import Task from "../models/Task.js";
import Review from "../models/Review.js";

// GET /api/admin/users
export const getAllUsers = asyncHandler(async (req, res) => {
	const users = await User.find().select("-password");
	res.json(users);
});

// DELETE /api/admin/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
	await User.findByIdAndDelete(req.params.id);
	res.json({ message: "User deleted" });
});

// GET /api/admin/tasks
export const getAllTasks = asyncHandler(async (req, res) => {
	const tasks = await Task.find().populate("postedBy", "name email");
	res.json(tasks);
});

// DELETE /api/admin/tasks/:id
export const deleteTask = asyncHandler(async (req, res) => {
	await Task.findByIdAndDelete(req.params.id);
	res.json({ message: "Task removed" });
});

// GET /api/admin/reviews
export const getAllReviews = asyncHandler(async (req, res) => {
	const reviews = await Review.find()
		.populate("reviewer", "name")
		.populate("reviewee", "name");
	res.json(reviews);
});

export const getAdminAnalytics = asyncHandler(async (req, res) => {
        const totalUsers = await User.countDocuments();
        const totalStandardUsers = await User.countDocuments({ role: "user" });
        const totalIdentifiedUsers = await User.countDocuments({
                role: "user",
                identification: { $ne: "" },
        });
        const totalTasks = await Task.countDocuments();
        const completedTasks = await Task.countDocuments({ status: "completed" });

	// total commission income
	const commissionTransactions = await User.aggregate([
		{ $unwind: "$transactions" },
		{ $match: { "transactions.type": "commission" } },
		{ $group: { _id: null, total: { $sum: "$transactions.amount" } } },
	]);
	const totalCommission = Math.abs(commissionTransactions[0]?.total || 0);

	// total money in circulation (sum of all user balances)
	const walletBalances = await User.aggregate([
		{ $group: { _id: null, total: { $sum: "$walletBalance" } } },
	]);
	const totalWalletMoney = walletBalances[0]?.total || 0;

	res.json({
		totalUsers,
		totalStandardUsers,
		totalIdentifiedUsers,
		totalTasks,
		completedTasks,
		totalCommission,
		totalWalletMoney,
	});
});

export const updateUserRole = asyncHandler(async (req, res) => {
	const { role } = req.body;
	const validRoles = [
		"USER",
		"VERIFIED_USER",
		"PRO_USER",
		"FLAGGED_USER",
		"ADMIN",
	];

	if (!validRoles.includes(role)) {
		res.status(400);
		throw new Error("Invalid role");
	}

	const user = await User.findByIdAndUpdate(
		req.params.id,
		{ role },
		{ new: true }
	);

	if (!user) {
		res.status(404);
		throw new Error("User not found");
	}

	res.json({
		message: "User role updated",
		user: user.toSafeObject(),
	});
});
