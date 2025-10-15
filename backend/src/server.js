import "dotenv/config.js";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { notFound, globalErrorHandler } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import offerRoutes from "./routes/offerRoutes.js";

const app = express();

// core middleware
app.use(cors());
app.use(express.json());

// health check
app.get("/api/health", (req, res) => res.json({ ok: true }));

// (routes will go here)
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/offers", offerRoutes);

// 404 + error handlers
app.use(notFound);
app.use(globalErrorHandler);

// start server
const PORT = process.env.PORT || 4000;
connectDB().then(() => {
	app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
});
