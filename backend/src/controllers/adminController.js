import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/User.js";
import Task from "../models/Task.js";
import Review from "../models/Review.js";
import SecurityLog from "../models/SecurityLog.js";
import { updateTrustScore } from "../services/trustScoreService.js";

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

// GET /api/admin/security/flagged-users
export const getFlaggedUsers = asyncHandler(async (req, res) => {
	const flaggedUsers = await User.find({ role: "FLAGGED_USER" })
		.select("name email role trustScore createdAt lastIp deviceId")
		.sort({ createdAt: -1 });

	res.json({
		count: flaggedUsers.length,
		users: flaggedUsers,
	});
});

// GET /api/admin/security/risky-jobs
export const getRiskyJobs = asyncHandler(async (req, res) => {
	const riskyJobs = await Task.find({ requiresAdminApproval: true })
		.populate("postedBy", "name email role trustScore")
		.sort({ createdAt: -1 });

	res.json({
		count: riskyJobs.length,
		jobs: riskyJobs,
	});
});

// GET /api/admin/security/logs
export const getSecurityLogs = asyncHandler(async (req, res) => {
	const { type, userId, limit = 50, skip = 0 } = req.query;

	const query = {};
	if (type) query.actionType = type;
	if (userId) query.userId = userId;

	const logs = await SecurityLog.find(query)
		.populate("userId", "name email role")
		.sort({ createdAt: -1 })
		.limit(parseInt(limit))
		.skip(parseInt(skip));

	const total = await SecurityLog.countDocuments(query);

	res.json({
		logs,
		total,
		count: logs.length,
		limit: parseInt(limit),
		skip: parseInt(skip),
	});
});

// PATCH /api/admin/users/:id/trust-score
export const adjustTrustScore = asyncHandler(async (req, res) => {
	const { adjustment, reason } = req.body;

	if (typeof adjustment !== "number") {
		res.status(400);
		throw new Error("Adjustment must be a number");
	}

	const user = await User.findById(req.params.id);
	if (!user) {
		res.status(404);
		throw new Error("User not found");
	}

	await updateTrustScore(
		user._id,
		adjustment,
		reason || "Admin manual adjustment"
	);

	const updatedUser = await User.findById(user._id);

	res.json({
		message: "Trust score adjusted",
		user: {
			id: updatedUser._id,
			name: updatedUser.name,
			email: updatedUser.email,
			trustScore: updatedUser.trustScore,
		},
		adjustment,
		reason,
	});
});

// PATCH /api/admin/tasks/:id/approve
export const approveJob = asyncHandler(async (req, res) => {
	const task = await Task.findByIdAndUpdate(
		req.params.id,
		{ requiresAdminApproval: false },
		{ new: true }
	).populate("postedBy", "name email");

	if (!task) {
		res.status(404);
		throw new Error("Task not found");
	}

	res.json({
		message: "Job approved",
		task,
	});
});
