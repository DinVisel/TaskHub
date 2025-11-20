import { asyncHandler } from "../utils/asyncHandler.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

// GET /api/notifications
export const getNotifications = asyncHandler(async (req, res) => {
	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 20;
	const skip = (page - 1) * limit;

	const notifications = await Notification.find({ recipientId: req.user._id })
		.sort({ createdAt: -1 })
		.skip(skip)
		.limit(limit);

	const total = await Notification.countDocuments({ recipientId: req.user._id });
	const unreadCount = await Notification.countDocuments({
		recipientId: req.user._id,
		isRead: false,
	});

	res.json({
		notifications,
		page,
		pages: Math.ceil(total / limit),
		total,
		unreadCount,
	});
});

// PATCH /api/notifications/:id/read
export const markAsRead = asyncHandler(async (req, res) => {
	const notification = await Notification.findOneAndUpdate(
		{ _id: req.params.id, recipientId: req.user._id },
		{ isRead: true },
		{ new: true }
	);

	if (!notification) {
		res.status(404);
		throw new Error("Notification not found");
	}

	res.json(notification);
});

// PATCH /api/notifications/read-all
export const markAllAsRead = asyncHandler(async (req, res) => {
	await Notification.updateMany(
		{ recipientId: req.user._id, isRead: false },
		{ isRead: true }
	);

	res.json({ message: "All notifications marked as read" });
});

// POST /api/users/push-token
export const registerPushToken = asyncHandler(async (req, res) => {
	const { pushToken } = req.body;

	if (!pushToken) {
		res.status(400);
		throw new Error("Push token is required");
	}

	const user = await User.findByIdAndUpdate(
		req.user._id,
		{ pushToken },
		{ new: true }
	);

	res.json({ message: "Push token registered", pushToken: user.pushToken });
});
