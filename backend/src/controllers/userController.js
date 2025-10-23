import Task from "../models/Task.js";
import Offer from "../models/Offer.js";
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
