import Task from "../models/Task.js";
import Offer from "../models/Offer.js";
import Review from "../models/Review.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import AppError from "../utils/appError.js";

export const getMyTasks = asyncHandler(async (req, res) => {
        if (req.user.role !== "user")
                throw new AppError("Only standard users can view their tasks", 403);

        const tasks = await Task.find({ postedBy: req.user.id });
        res.json({ tasks });
});

export const getMyOffers = asyncHandler(async (req, res) => {
        if (req.user.role !== "user")
                throw new AppError("Only standard users can view their offers", 403);

        const offers = await Offer.find({ applicantId: req.user.id });
        res.json({ offers });
});

export const getMyJobs = asyncHandler(async (req, res) => {
        if (req.user.role !== "user")
                throw new AppError("Only standard users can view assigned jobs", 403);

        const tasks = await Task.find({
                assignedTo: req.user.id,
                status: "in_progress",
        });
        res.json({ tasks });
});

export const getUserStats = asyncHandler(async (req, res) => {
        const userId = req.user._id;
        const role = req.user.role;

        if (role !== "user")
                throw new AppError("Statistics are available for standard users only", 403);

        const postedTasks = await Task.countDocuments({ postedBy: userId });
        const completedAsPoster = await Task.countDocuments({
                postedBy: userId,
                status: "completed",
        });
        const offersMade = await Offer.countDocuments({ applicantId: userId });
        const completedAsWorker = await Task.countDocuments({
                assignedTo: userId,
                status: "completed",
        });

        const completedTask = completedAsWorker;
        let averageRating = 0;
        let totalEarnings = 0;

	const reviews = await Review.find({ reviewee: userId });
	if (reviews.length > 0) {
		const total = reviews.reduce((sum, r) => sum + r.rating, 0);
		averageRating = (total / reviews.length).toFixed(1);
	}

	const doneTasks = await Task.find({
		assignedTo: userId,
		status: "completed",
	});
        totalEarnings = doneTasks.reduce((sum, t) => sum + (t.budget || 0), 0);

        res.json({
                role,
                postedTasks,
                completedTask,
                offersMade,
                averageRating,
                totalEarnings,
                completedAsPoster,
        });
});

export const getProfile = asyncHandler(async (req, res) => {
        const user = await User.findById(req.user.id);
        if (!user) throw new AppError("User not found", 404);

        res.json({ user: user.toSafeObject() });
});

export const updateProfile = asyncHandler(async (req, res) => {
        const { name, phone, bio, avatar, location, identification } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) throw new AppError("User not found", 404);

        if (name !== undefined) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (bio !== undefined) user.bio = bio;
        if (avatar !== undefined) user.avatar = avatar;
        if (identification !== undefined) {
                if (typeof identification !== "string")
                        throw new AppError("Identification must be a string", 400);

                user.identification = identification.trim();
        }

        if (location && typeof location === "object") {
                user.location = user.location || {};

                if (Object.prototype.hasOwnProperty.call(location, "city")) {
                        user.location.city = location.city;
                }

                if (location.coordinates && typeof location.coordinates === "object") {
                        user.location.coordinates = {
                                ...(user.location.coordinates || {}),
                                ...location.coordinates,
                        };
                }
        }

        await user.save();

        res.json({ user: user.toSafeObject() });
});

export const getPreferences = asyncHandler(async (req, res) => {
        const user = await User.findById(req.user.id);
        if (!user) throw new AppError("User not found", 404);

        const preferences = user.preferences || { categories: [], radiusKm: 25 };

        res.json(preferences);
});

export const updatePreferences = asyncHandler(async (req, res) => {
        const { categories, radiusKm } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) throw new AppError("User not found", 404);

        if (!user.preferences) {
                user.preferences = { categories: [], radiusKm: 25 };
        }

        if (categories !== undefined) {
                if (Array.isArray(categories)) {
                        user.preferences.categories = categories;
                } else if (typeof categories === "string") {
                        user.preferences.categories = categories
                                .split(",")
                                .map((c) => c.trim())
                                .filter(Boolean);
                }
        }

        if (radiusKm !== undefined) {
                user.preferences.radiusKm = radiusKm;
        }

        await user.save();

        res.json(user.preferences);
});
