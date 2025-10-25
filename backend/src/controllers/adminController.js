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
