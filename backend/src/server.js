import "dotenv/config.js";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import { connectDB } from "./config/db.js";
import { notFound, globalErrorHandler } from "./middleware/errorMiddleware.js";

import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import offerRoutes from "./routes/offerRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

import { verifyToken } from "./utils/jwt.js";
import Task from "./models/Task.js";
import Offer from "./models/Offer.js";
import Message from "./models/Message.js";

const app = express();
app.use(cors());
app.use(express.json());

// REST routes
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reviews", reviewRoutes);

app.use(notFound);
app.use(globalErrorHandler);

// Create HTTP server + Socket.io
const server = http.createServer(app);
const io = new Server(server, {
	cors: { origin: "*", methods: ["GET", "POST"] },
});

// helper: permission check for sockets
const canChat = async (userId, taskId) => {
	const task = await Task.findById(taskId);
	if (!task) return { ok: false, reason: "Task not found" };

	if (task.postedBy.toString() === userId) return { ok: true, task };
	if (task.assignedTo?.toString() === userId) return { ok: true, task };

	const offer = await Offer.findOne({ taskId, applicantId: userId });
	if (offer) return { ok: true, task };

	return { ok: false, reason: "Not allowed" };
};

// Socket auth middleware (JWT from query or header)
io.use((socket, next) => {
	try {
		const token =
			socket.handshake.auth?.token ||
			(socket.handshake.headers.authorization || "").replace("Bearer ", "");

		if (!token) return next(new Error("No token"));
		const decoded = verifyToken(token);
		socket.user = { id: decoded.id };
		next();
	} catch {
		next(new Error("Invalid token"));
	}
});

io.on("connection", (socket) => {
	// join a task room
	socket.on("join-task", async ({ taskId }) => {
		try {
			const { ok, reason } = await canChat(socket.user.id, taskId);
			if (!ok) return socket.emit("error", reason);

			const room = `task:${taskId}`;
			socket.join(room);
			socket.emit("joined", { room });
		} catch (e) {
			socket.emit("error", "Failed to join room");
		}
	});

	// send a message (persist + broadcast)
	socket.on("send-message", async ({ taskId, receiverId, content }) => {
		try {
			if (!taskId || !receiverId || !content) {
				return socket.emit("error", "taskId, receiverId, content required");
			}

			const { ok, reason } = await canChat(socket.user.id, taskId);
			if (!ok) return socket.emit("error", reason);

			const msg = await Message.create({
				taskId,
				senderId: socket.user.id,
				receiverId,
				content,
			});

			const payload = {
				_id: msg._id,
				taskId,
				senderId: socket.user.id,
				receiverId,
				content,
				createdAt: msg.createdAt,
			};

			io.to(`task:${taskId}`).emit("new-message", payload);
		} catch (e) {
			socket.emit("error", "Failed to send message");
		}
	});
});

const PORT = process.env.PORT || 4000;
connectDB().then(() => {
	server.listen(PORT, () => console.log(`API + WS on http://localhost:${PORT}`));
});
