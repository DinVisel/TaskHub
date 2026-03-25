import PostingLimit from "../models/PostingLimit.js";

/**
 * Role-based job posting control middleware
 * Enforces daily posting limits based on user role:
 * - USER: Forbidden (403)
 * - VERIFIED_USER: Max 5 posts/day
 * - PRO_USER: Max 10 posts/day
 * - FLAGGED_USER: Allowed but flagged for admin approval
 * - ADMIN: Unlimited
 */
export const checkJobPostingPermission = async (req, res, next) => {
	try {
		if (!req.user) {
			return res.status(401).json({ message: "Authentication required" });
		}

		const userRole = req.user.role;

		// USER role: Forbidden
		if (userRole === "USER") {
			return res.status(403).json({
				message: "You must be verified to post jobs",
			});
		}

		// ADMIN: Always allowed
		if (userRole === "ADMIN") {
			return next();
		}

		// FLAGGED_USER: Allow but flag for approval
		if (userRole === "FLAGGED_USER") {
			req.flaggedUserPost = true;
			await incrementPostingCount(req.user._id);
			return next();
		}

		// VERIFIED_USER and PRO_USER: Check daily limits
		const limits = {
			VERIFIED_USER: 5,
			PRO_USER: 10,
		};

		const dailyLimit = limits[userRole];
		if (!dailyLimit) {
			// Unknown role, deny by default
			return res.status(403).json({
				message: "Invalid user role for job posting",
			});
		}

		// Get today's date in YYYY-MM-DD format (UTC)
		const today = new Date().toISOString().split("T")[0];

		// Find or create posting limit record
		let postingRecord = await PostingLimit.findOne({
			userId: req.user._id,
			date: today,
		});

		const currentCount = postingRecord ? postingRecord.count : 0;

		// Check if limit exceeded
		if (currentCount >= dailyLimit) {
			return res.status(429).json({
				message: `Daily posting limit reached (${dailyLimit} posts/day for ${userRole})`,
				limit: dailyLimit,
				currentCount: currentCount,
			});
		}

		// Increment count
		await incrementPostingCount(req.user._id);

		next();
	} catch (error) {
		console.error("Error in checkJobPostingPermission:", error);
		// Fail closed for posting limits (deny on error)
		return res.status(500).json({
			message: "Error checking posting permissions",
		});
	}
};

/**
 * Helper function to increment daily posting count
 */
async function incrementPostingCount(userId) {
	const today = new Date().toISOString().split("T")[0];

	await PostingLimit.findOneAndUpdate(
		{ userId, date: today },
		{ $inc: { count: 1 } },
		{ upsert: true, new: true }
	);
}
