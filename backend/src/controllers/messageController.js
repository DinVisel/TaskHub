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
    content
  });

  res.status(201).json({ message: msg });
});
