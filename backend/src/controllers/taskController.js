import Task from "../models/Task.js";
import AppError from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createTask = asyncHandler(async (req, res) => {
	const { title, description, category, price, location } = req.body;
	if (!title || !description)
		throw new AppError("Title and description are required", 400);

	const task = Task.create({
		title,
		description,
		category,
		price,
		location,
		postedBy: req.user.id,
	});

	res.status(201).json({ task });
});

export const getTasks = asyncHandler(async (req, res) => {
	const tasks = await Task.find({ status: "open" }).populate("postedBy", "name");
	res.json({ tasks });
});

export const getTask = asyncHandler(async (req, res) => {
	const task = await Task.findById(req.params.id).populate(
		"postedBy",
		"name email"
	);
	if (!task) throw new AppError("Task not found", 404);

	res.json({ task });
});
