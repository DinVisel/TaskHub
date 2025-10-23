import Task from "../models/Task.js";
import AppError from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createTask = asyncHandler(async (req, res) => {
        const { title, description, category, price, location } = req.body;
        if (!title || !description)
                throw new AppError("Title and description are required", 400);

        const task = await Task.create({
                title,
                description,
                category,
                price,
                location,
                postedBy: req.user.id,
        });

        res.status(201).json({ task });
});

export const getTask = asyncHandler(async (req, res) => {
	const task = await Task.findById(req.params.id).populate(
		"postedBy",
		"name email"
	);
	if (!task) throw new AppError("Task not found", 404);

	res.json({ task });
});

export const completeTask = asyncHandler(async (req, res) => {
	const { id } = req.params; // task id
	const userId = req.user.id;

	const task = await Task.findById(id);
	if (!task) throw new AppError("Task not found", 404);

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

	res.json({ message: "Task marked as completed", task });
});

export const getFilteredTasks = asyncHandler(async (req, res) => {
        const { search, category, city } = req.query;
        const query = { status: "open" };

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
