import Dispute from "../models/Dispute.js";
import Task from "../models/Task.js";
import AppError from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createDispute = asyncHandler(async (req, res) => {
	const { taskId, reason, description } = req.body;
	const userId = req.user.id;

	if (!taskId || !reason || !description) {
		throw new AppError("All fields are required", 400);
	}

	const task = await Task.findById(taskId);
	if (!task) throw new AppError("Task not found", 404);

	// Verify user is involved in the task
	if (
		task.postedBy.toString() !== userId &&
		task.assignedTo?.toString() !== userId
	) {
		throw new AppError("You are not authorized to dispute this task", 403);
	}

	// Check if dispute already exists
	const existingDispute = await Dispute.findOne({
		taskId,
		status: "OPEN",
	});
	if (existingDispute) {
		throw new AppError("An open dispute already exists for this task", 400);
	}

	const dispute = await Dispute.create({
		taskId,
		initiatorId: userId,
		reason,
		description,
	});

	// Flag task as disputed
	task.isDisputed = true;
	await task.save();

	res.status(201).json({
		status: "success",
		data: { dispute },
	});
});

export const getDisputes = asyncHandler(async (req, res) => {
	// Admin only (protected by route middleware)
	const disputes = await Dispute.find()
		.populate("taskId", "title status price")
		.populate("initiatorId", "name email role")
		.sort("-createdAt");

	res.json({
		status: "success",
		results: disputes.length,
		data: { disputes },
	});
});

export const resolveDispute = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const { resolution, notes } = req.body; // resolution: "REFUND", "PAY", "DISMISS"

	if (!["REFUND", "PAY", "DISMISS"].includes(resolution)) {
		throw new AppError("Invalid resolution type", 400);
	}

	const dispute = await Dispute.findById(id);
	if (!dispute) throw new AppError("Dispute not found", 404);

	if (dispute.status !== "OPEN") {
		throw new AppError("Dispute is already resolved", 400);
	}

	const task = await Task.findById(dispute.taskId);
	if (!task) throw new AppError("Associated task not found", 404);

	// Apply resolution logic
	if (resolution === "REFUND") {
		// Cancel task, refund client (logic for refund would go here if payment gateway existed)
		task.status = "cancelled";
		task.isDisputed = false;
		dispute.status = "RESOLVED_REFUND";
	} else if (resolution === "PAY") {
		// Complete task, pay worker
		task.status = "completed";
		task.paid = true;
		task.completedAt = Date.now();
		task.isDisputed = false;
		dispute.status = "RESOLVED_PAY";
	} else if (resolution === "DISMISS") {
		// Just remove the disputed flag, keep task status as is
		task.isDisputed = false;
		dispute.status = "DISMISSED";
	}

	dispute.resolutionNotes = notes || "";

	await task.save();
	await dispute.save();

	res.json({
		status: "success",
		data: { dispute, task },
	});
});
