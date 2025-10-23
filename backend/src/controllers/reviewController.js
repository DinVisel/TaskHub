import Review from "../models/Review.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import AppError from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createReview = asyncHandler(async (req, res) => {
	const { taskId, reviewedUserId, rating, comment } = req.body;
	if (!taskId || !reviewedUserId || !rating)
		throw new AppError("taskId,reviewUserId,rating required", 404);

	const task = await Task.findById(taskId);
	if (!task) throw new AppError("Task not found", 404);
	if (task.status !== "completed")
		throw new AppError("Task not completed yet", 400);

	//ensure review is owner or worker
	if (
		task.postedBy.toString() !== req.user.id &&
		task.assignedTo?.toString() !== req.user.id
	) {
		throw new AppError("You are not allowed to review this task", 403);
	}

        const review = await Review.create({
                taskId,
                reviewerId: req.user.id,
                reviewedUserId,
                rating,
                comment,
        });

        const stats = await Review.aggregate([
                { $match: { reviewedUserId: review.reviewedUserId } },
                { $group: { _id: "$reviewedUserId", avgRating: { $avg: "$rating" } } },
        ]);
        if (stats.length > 0) {
                await User.findByIdAndUpdate(review.reviewedUserId, {
                        rating: Number(stats[0].avgRating.toFixed(1)),
                });
        }

	res.status(201).json({ review });
});

// get reviews of user
export const getUserReviews = asyncHandler(async (req, res) => {
	const { userId } = req.params;
	const reviews = await Review.find({ reviewedUserId: userId })
		.populate("reviewerId", "name")
		.populate("taskId", "title");
	res.json({ reviews });
});
