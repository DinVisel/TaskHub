import mongoose from "mongoose";
import Message from "../models/Message.js";
import Task from "../models/Task.js";
import Offer from "../models/Offer.js";
import AppError from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// permission check: can user chat in this task?
const canChat = async (userId, taskId) => {
	const task = await Task.findById(taskId);
	if (!task) return { ok: false, reason: "Task not found" };

	// poster can always view
	if (task.postedBy.toString() === userId) return { ok: true, task };

	// assigned worker can view
	if (task.assignedTo?.toString() === userId) return { ok: true, task };

	// any applicant (with an offer) can view to negotiate
	const offer = await Offer.findOne({ taskId, applicantId: userId });
	if (offer) return { ok: true, task };

	return { ok: false, reason: "Not allowed" };
};

// GET /api/messages/:taskId  -> history for a task
export const getTaskMessages = asyncHandler(async (req, res) => {
	const { taskId } = req.params;
	const { ok, reason } = await canChat(req.user.id, taskId);
	if (!ok) throw new AppError(reason, 403);

        const messages = await Message.find({ taskId })
                .sort({ createdAt: 1 })
                .populate("senderId", "name")
                .populate("receiverId", "name");

	res.json({ messages });
});

// POST /api/messages  -> send via REST (fallback/testing)
export const sendMessageREST = asyncHandler(async (req, res) => {
	const { taskId, receiverId, content } = req.body;
	if (!taskId || !receiverId || !content) {
		throw new AppError("taskId, receiverId, content are required", 400);
	}

	const { ok, reason } = await canChat(req.user.id, taskId);
	if (!ok) throw new AppError(reason, 403);

	const msg = await Message.create({
		taskId,
		senderId: req.user.id,
		receiverId,
		content,
	});

	res.status(201).json({ message: msg });
});

export const getUserThreads = asyncHandler(async (req, res) => {
        const userId = req.user.id;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new AppError("Invalid user id", 400);
        }
        const userObjectId = new mongoose.Types.ObjectId(userId);

        const threads = await Message.aggregate([
                {
                        $match: {
                                $or: [
                                        { senderId: userObjectId },
                                        { receiverId: userObjectId },
                                ],
                        },
                },
                { $sort: { createdAt: -1 } },
                {
                        $group: {
                                _id: "$taskId",
                                lastMessage: { $first: "$content" },
                                lastSenderId: { $first: "$senderId" },
                                lastCreatedAt: { $first: "$createdAt" },
                        },
                },
        ]);

        const populated = await Promise.all(
                threads.map(async (t) => {
                        const task = await Task.findById(t._id).select("title");
                        const taskId = t._id?.toString();
                        const lastSenderId =
                                t.lastSenderId instanceof mongoose.Types.ObjectId
                                        ? t.lastSenderId.toString()
                                        : t.lastSenderId;

                        return {
                                taskId,
                                taskTitle: task?.title || "Unknown Task",
                                lastMessage: t.lastMessage,
                                lastSenderId,
                                lastMessageAt: t.lastCreatedAt,
                        };
                })
        );

        res.json({ threads: populated });
});
