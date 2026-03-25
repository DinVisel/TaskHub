import { asyncHandler } from "../utils/asyncHandler.js";
import { updateTrustScore } from "../services/trustScoreService.js";
import AppError from "../utils/appError.js";

export const createReport = asyncHandler(async (req, res) => {
	const { reportedUserId, reason, description } = req.body;
	const reporterId = req.user.id;

	if (!reportedUserId || !reason) {
		throw new AppError("Reported user and reason are required", 400);
	}

	if (reportedUserId === reporterId) {
		throw new AppError("You cannot report yourself", 400);
	}

	// In a real app, we would save the report to a Report model here
	// const report = await Report.create({ ... });

	// Trust Score Update: -20 for receiving a complaint
	// Note: In a production system, this should probably happen after admin review
	// But for this requirement, we apply it immediately or assume it's verified
	await updateTrustScore(
		reportedUserId,
		-20,
		`Reported by user ${reporterId}: ${reason}`
	);

	res.status(201).json({ message: "Report submitted successfully" });
});
