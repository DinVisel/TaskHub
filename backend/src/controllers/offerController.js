import Offer from "../models/Offer.js";
import Task from "../models/Task.js";
import AppError from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createOffer = asyncHandler(async (req, res) => {
	const { taskId, message, amount } = req.body;

	if (req.user.role !== "worker") {
		throw new AppError("Only workers can apply to tasks", 403);
	}

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

export const acceptOffer = asyncHandler(async (req, res) => {
	const { offerId } = req.params;
	const offer = await Offer.findById(offerId);
	if (!offer) throw new AppError("Offer not found", 404);

	const task = await Task.findById(offer.taskId);
	if (!task) throw new AppError("Task not found", 404);

	if (task.postedBy.toString() !== req.user.id) {
		throw new AppError("Not authorized to accept offer for this task", 403);
	}

	offer.status = "accepted";
	await offer.save();

	task.status = "in_progress";
	task.assignedTo = offer.applicantId;
	await task.save();

	res.json({ message: "Offer accepted", offer });
});

export const rejectOffer = asyncHandler(async (req, res) => {
	const { offerId } = req.params;
	const offer = await Offer.findById(offerId);
	if (!offer) throw new AppError("Offer not found", 404);

	const task = await Task.findById(offer.taskId);
	if (!task) throw new AppError("Task not found", 404);

	if (task.postedBy.toString() !== req.user.id) {
		throw new AppError("Not authorized", 403);
	}

	offer.status = "rejected";
	await offer.save();

	res.json({ message: "Offer rejected", offer });
});
