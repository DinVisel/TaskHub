import Offer from "../models/Offer.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import AppError from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import { createNotification } from "../services/notificationService.js";

// ... existing imports

export const createOffer = asyncHandler(async (req, res) => {
	const { taskId, message, amount } = req.body;

	if (req.user.role !== "user") {
		throw new AppError("Only standard users can apply to tasks", 403);
	}

	if (!req.user.hasIdentification) {
		throw new AppError(
			"Identification is required before applying to tasks",
			403
		);
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

	// Notify task owner
	await createNotification(
		task.postedBy,
		"OFFER_RECEIVED",
		"New Offer Received",
		`${req.user.name} offered $${amount} for "${task.title}"`,
		{ taskId, offerId: offer._id }
	);

	res.status(201).json({ offer });
});

export const getOffersForTask = asyncHandler(async (req, res) => {
	const { taskId } = req.params;

	if (!req.user.hasIdentification) {
		throw new AppError("Identification is required to review offers", 403);
	}

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

	if (!req.user.hasIdentification) {
		throw new AppError("Identification is required to manage offers", 403);
	}
	const offer = await Offer.findById(offerId);
	if (!offer) throw new AppError("Offer not found", 404);

	const task = await Task.findById(offer.taskId);
	if (!task) throw new AppError("Task not found", 404);

	const client = await User.findById(task.postedBy);

	if (client.walletBalance < task.budget) {
		throw new AppError("Insufficent funds in wallet", 400);
	}

	if (task.postedBy.toString() !== req.user.id) {
		throw new AppError("Not authorized to accept offer for this task", 403);
	}

	client.walletBalance -= task.budget;
	client.transactions.push({
		type: "spend",
		amount: -task.budget,
		description: `Payment for task: ${task.title}`,
	});

	task.paid = true;
	await client.save();
	await task.save();

	offer.status = "accepted";
	await offer.save();

	task.status = "in_progress";
	task.assignedTo = offer.applicantId;
	await task.save();

	// Notify applicant
	await createNotification(
		offer.applicantId,
		"OFFER_ACCEPTED",
		"Offer Accepted!",
		`Your offer for "${task.title}" has been accepted. You can now start working.`,
		{ taskId: task._id, offerId: offer._id }
	);

	res.json({ message: "Offer accepted", offer });
});

export const rejectOffer = asyncHandler(async (req, res) => {
	const { offerId } = req.params;

	if (!req.user.hasIdentification) {
		throw new AppError("Identification is required to manage offers", 403);
	}
	const offer = await Offer.findById(offerId);
	if (!offer) throw new AppError("Offer not found", 404);

	const task = await Task.findById(offer.taskId);
	if (!task) throw new AppError("Task not found", 404);

	if (task.postedBy.toString() !== req.user.id) {
		throw new AppError("Not authorized", 403);
	}

	offer.status = "rejected";
	await offer.save();

	// Notify applicant (optional, but good UX)
	// await createNotification(offer.applicantId, "SYSTEM", "Offer Update", `Your offer for "${task.title}" was declined.`, { taskId: task._id });

	res.json({ message: "Offer rejected", offer });
});
