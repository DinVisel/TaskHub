import Task from "../models/Task.js";
import Offer from "../models/Offer.js";
import Review from "../models/Review.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import AppError from "../utils/appError.js";

export const getMyTasks = asyncHandler(async (req, res) => {
	if (req.user.role !== "client")
		throw new AppError("Only clients can view their posted tasks", 403);

	const tasks = await Task.find({ postedBy: req.user.id });
	res.json({ tasks });
});

export const getMyOffers = asyncHandler(async (req, res) => {
	if (req.user.role !== "worker")
		throw new AppError("Only workers can view their offers", 403);

	const offers = await Offer.find({ applicantId: req.user.id });
	res.json({ offers });
});

export const getMyJobs = asyncHandler(async (req, res) => {
	if (req.user.role !== "worker")
		throw new AppError("Only workers can view assigned jobs", 403);

	const tasks = await Task.find({
		assignedTo: req.user.id,
		status: "in_progress",
	});
	res.json({ tasks });
});

export const getUserStats = asyncHandler(async (req, res) => {
	const userId = req.user._id;
	const role = req.user.role;

	let postedTasks = 0;
	let completedTask = 0;
	let offersMade = 0;
	let averageRating = 0;
	let totalEarnings = 0;

	if (role === "client") {
		postedTasks = await Task.countDocuments({ postedBy: userId });
		completedTask = await Task.countDocuments({
			postedBy: userId,
			status: "completed",
		});
	} else {
		offersMade = await Offer.countDocuments({ postedBy: userId });
		completedTask = await Task.countDocuments({
			assignedTo: userId,
			status: "completed",
		});
	}

	const reviews = await Review.find({ reviewee: userId });
	if (reviews.length > 0) {
		const total = reviews.reduce((sum, r) => sum + r.rating, 0);
		averageRating = (total / reviews.length).toFixed(1);
	}

	const doneTasks = await Task.find({
		assignedTo: userId,
		status: "completed",
	});
	totalEarnings = doneTasks.reduce((sum, t) => sum + (t.budget || 0), 0);

	res.json({
		role,
		postedTasks,
		completedTask,
		offersMade,
		averageRating,
		totalEarnings,
	});
});

export const updatePreferences = asyncHandler(async (req, res) => {
	const { categories, radiusKm } = req.body;
	req.user.preferences.categories =
		categories || req.user.preferences.categories;
	req.user.preferences.radiusKm = radiusKm || req.user.preferences.radiusKm;
	await req.user.save();
	res.json(req.user.preferences);
});
