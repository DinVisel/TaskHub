import AppError from "../utils/appError.js";

/**
 * Middleware to require complete profile
 * Blocks users with incomplete profiles from certain actions
 */
export const requireCompleteProfile = async (req, res, next) => {
	try {
		if (!req.user) {
			return res.status(401).json({ message: "Authentication required" });
		}

		if (!req.user.profileCompleted) {
			return res.status(403).json({
				message: "Please complete your profile to continue",
				requiredFields: ["name", "avatar", "city", "bio"],
			});
		}

		next();
	} catch (error) {
		console.error("Error in requireCompleteProfile:", error);
		next(error);
	}
};
