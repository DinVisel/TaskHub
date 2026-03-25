import User from "../models/User.js";

export const updateTrustScore = async (userId, change, reason) => {
	try {
		const user = await User.findById(userId);
		if (!user) return;

		const oldScore = user.trustScore;
		let newScore = oldScore + change;

		// Clamp score between 0 and 100
		if (newScore > 100) newScore = 100;
		if (newScore < 0) newScore = 0;

		user.trustScore = newScore;

		// Role transition logic
		// Only change role if it's not ADMIN
		if (user.role !== "ADMIN") {
			if (newScore < 30) {
				user.role = "FLAGGED_USER";
			} else if (newScore > 85) {
				user.role = "PRO_USER";
			} else if (newScore > 70) {
				user.role = "VERIFIED_USER";
			} else {
				// If falling back from higher roles or recovering from flagged
				// Default to USER if between 30 and 70
				user.role = "USER";
			}
		}

		await user.save();

		console.log(
			`Trust Score Update for ${user.email}: ${oldScore} -> ${newScore} (${change > 0 ? "+" : ""}${change}). Reason: ${reason}. New Role: ${user.role}`
		);
	} catch (error) {
		console.error("Error updating trust score:", error);
	}
};
