import Offer from "../models/Offer.js";
import Task from "../models/Task.js";
import AppError from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createOffer = asyncHandler(async (req, res) => {
	const { taskId, message, amount } = req.body;

	if (!taskId) throw new AppError("Task ID is required", 400);

	const task = await Task.findById(taskId);
	if (!task) throw new AppError("Task not found", 404);

	if (task.postedBy.toString() === req.user.id) {
		throw new AppError("You cannot apply to your own task", 403);
	}

	const offer = await Offer.create({
		taskId,
		applicantId: req.user.id,
		message,
		amount,
	});

	res.status(201).json({ offer });
});

export const getOffersForTask = asyncHandler(async (req, res) => {
	const { taskId } = req.params;

	const task = await Task.findById(taskId);
	if (!task) throw new AppError("Task not found", 404);

	if (task.postedBy.toString() !== req.user.id) {
		throw new AppError(
			"You are not authorized to view offers for this task",
			403
		);
	}

	const offers = await Offer.find({ taskId }).populate(
		"applicantId",
		"name email"
	);

	res.json({ offers });
});
