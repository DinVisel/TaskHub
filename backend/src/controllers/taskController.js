import Task from "../models/Task.js";
import User from "../models/User.js";
import AppError from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { updateTrustScore } from "../services/trustScoreService.js";

export const createTask = asyncHandler(async (req, res) => {
	const { title, description, category, price, location, budget } = req.body;
	if (!title || !description)
		throw new AppError("Title and description are required", 400);

	const numericPrice = price !== undefined ? Number(price) : undefined;
	const numericBudget = budget !== undefined ? Number(budget) : undefined;

	if (
		(numericPrice !== undefined && !Number.isFinite(numericPrice)) ||
		(numericBudget !== undefined && !Number.isFinite(numericBudget))
	) {
		throw new AppError("Price and budget must be valid numbers", 400);
	}

	const task = await Task.create({
		title,
		description,
		category,
		price: numericPrice ?? numericBudget ?? 0,
		budget: numericBudget ?? numericPrice ?? 0,
		location,
		postedBy: req.user.id,
		requiresAdminApproval: req.flaggedUserPost || req.riskyJob || false,
	});

	res.status(201).json({ task });
});

export const getTask = asyncHandler(async (req, res) => {
        const { id } = req.params;

        const task = await Task.findById(id)
                .populate("postedBy", "name role")
                .populate("assignedTo", "name role")
                .populate("completedBy", "name role");

        if (!task) throw new AppError("Task not found", 404);

        res.json({ task });
});

export const completeTask = asyncHandler(async (req, res) => {
	const { id } = req.params; // task id
	const userId = req.user.id;

	const task = await Task.findById(id);
	if (!task) throw new AppError("Task not found", 404);

	if (task.paid && task.assignedTo) {
		const client = await User.findById(task.postedBy);
		const worker = await User.findById(task.assignedTo);

		if (!client || !worker)
			throw new AppError("Task participants not found", 400);

		const effectiveBudget =
			typeof task.budget === "number" && Number.isFinite(task.budget)
				? task.budget
				: task.price;

		if (!Number.isFinite(effectiveBudget) || effectiveBudget <= 0)
			throw new AppError("Task budget not set", 400);

		const payout = effectiveBudget * (1 - task.commissionRate);
		const commission = effectiveBudget * task.commissionRate;

		worker.walletBalance += payout;
		worker.transactions.push({
			type: "receive",
			amount: payout,
			description: `Payment received for task: ${task.title}`,
		});

		// record platform commission (for admin analytics)
		if (commission > 0) {
			client.transactions.push({
				type: "commission",
				amount: -commission,
				description: `Commission charged for task: ${task.title}`,
			});
		}

		await worker.save();
		await client.save();
	}

	// must be owner or assigned worker
	const isOwner = task.postedBy.toString() === userId;
	const isWorker = task.assignedTo?.toString() === userId;

	if (!isOwner && !isWorker)
		throw new AppError("Not authorized to complete this task", 403);

	if (task.status === "completed")
		throw new AppError("Task already completed", 400);

	// mark complete
	task.status = "completed";
	task.completedBy = userId;
	task.completedAt = new Date();
	await task.save();

	// Trust Score Updates: +10 for completing a task
	await updateTrustScore(
		task.postedBy,
		10,
		`Task completed: ${task.title}`
	);
	await updateTrustScore(
		task.assignedTo,
		10,
		`Task completed: ${task.title}`
	);

	res.json({ message: "Task marked as completed", task });
});

export const getFilteredTasks = asyncHandler(async (req, res) => {
	const { search, category, city } = req.query;
	const query = { status: "open" };

	// Hide tasks requiring admin approval unless user is admin
	if (!req.user || req.user.role !== "ADMIN") {
		query.requiresAdminApproval = { $ne: true };
	}

	if (search) {
		query.$or = [
			{ title: { $regex: search, $options: "i" } },
			{ description: { $regex: search, $options: "i" } },
		];
	}

	if (category && category !== "All") {
		query.category = category;
	}

	if (city) {
		query["location.address"] = { $regex: city, $options: "i" };
	}

	const tasks = await Task.find(query)
		.sort({ createdAt: -1 })
		.populate("postedBy", "name");

	res.status(200).json({ tasks });
});
