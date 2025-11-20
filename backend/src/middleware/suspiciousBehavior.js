import SecurityLog from "../models/SecurityLog.js";
import User from "../models/User.js";

/**
 * Detects suspicious account creation patterns.
 * Flags users from IPs with >3 registrations in 24h.
 */
export const detectSuspiciousAccountCreation = async (req, res, next) => {
	try {
		const ipAddress = req.ip || req.connection.remoteAddress;
		const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

		const count = await SecurityLog.countDocuments({
			ipAddress,
			actionType: "ACCOUNT_CREATION",
			createdAt: { $gte: twentyFourHoursAgo },
		});

		// Log this registration attempt
		await SecurityLog.create({
			ipAddress,
			actionType: "ACCOUNT_CREATION",
			metadata: { email: req.body.email },
		});

		// Flag user if more than 3 accounts from same IP
		if (count >= 3) {
			req.body.role = "FLAGGED_USER";
		}

		next();
	} catch (error) {
		console.error("Error in detectSuspiciousAccountCreation:", error);
		next();
	}
};

/**
 * Detects excessive profile editing.
 * Blocks requests after 20 edits in 10 minutes.
 */
export const detectExcessiveProfileEdits = async (req, res, next) => {
	try {
		if (!req.user) return next();

		const userId = req.user._id;
		const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

		const count = await SecurityLog.countDocuments({
			userId,
			actionType: "PROFILE_EDIT",
			createdAt: { $gte: tenMinutesAgo },
		});

		if (count >= 20) {
			return res.status(429).json({
				message: "Too many profile updates. Please try again later.",
			});
		}

		// Log this edit
		await SecurityLog.create({
			userId,
			ipAddress: req.ip || req.connection.remoteAddress,
			actionType: "PROFILE_EDIT",
		});

		next();
	} catch (error) {
		console.error("Error in detectExcessiveProfileEdits:", error);
		next();
	}
};

/**
 * Detects rapid job posting.
 * Blocks and penalizes trustScore after 10 posts in 1 hour.
 */
export const detectRapidJobPosting = async (req, res, next) => {
	try {
		if (!req.user) return next();

		const userId = req.user._id;
		const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

		const count = await SecurityLog.countDocuments({
			userId,
			actionType: "JOB_POST",
			createdAt: { $gte: oneHourAgo },
		});

		if (count >= 10) {
			// Penalize Trust Score
			await User.findByIdAndUpdate(userId, { $inc: { trustScore: -15 } });

			return res.status(429).json({
				message: "Too many job posts. Your Trust Score has been reduced.",
			});
		}

		// Log this job post
		await SecurityLog.create({
			userId,
			ipAddress: req.ip || req.connection.remoteAddress,
			actionType: "JOB_POST",
		});

		next();
	} catch (error) {
		console.error("Error in detectRapidJobPosting:", error);
		next();
	}
};

/**
 * Detects device ID mismatches.
 * Creates security alert when unknown device is used.
 */
export const detectDeviceMismatch = async (req, res, next) => {
	try {
		if (!req.user) return next();

		const deviceId = req.headers["x-device-id"];
		if (!deviceId) return next();

		const user = await User.findById(req.user._id);
		if (!user) return next();

		// Check if device is trusted
		if (
			user.trustedDevices &&
			user.trustedDevices.length > 0 &&
			!user.trustedDevices.includes(deviceId)
		) {
			// Create security alert
			await SecurityLog.create({
				userId: user._id,
				ipAddress: req.ip || req.connection.remoteAddress,
				deviceId,
				actionType: "DEVICE_MISMATCH",
				metadata: { message: "Unrecognized device detected" },
			});
		}

		next();
	} catch (error) {
		console.error("Error in detectDeviceMismatch:", error);
		next();
	}
};
