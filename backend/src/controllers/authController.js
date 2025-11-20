import bcrypt from "bcryptjs";
import User from "../models/User.js";
import SecurityLog from "../models/SecurityLog.js";
import AppError from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken } from "../utils/jwt.js";
import { updateTrustScore } from "../services/trustScoreService.js";

import crypto from "crypto";
import {
	sendVerificationEmail,
	sendPasswordResetEmail,
} from "../services/emailService.js";

// ... existing imports

export const register = asyncHandler(async (req, res) => {
	const { name, email, password, phone, role } = req.body;

	if (!name || !email || !password)
		throw new AppError("name, email, password are required", 400);

	const exists = await User.findOne({ email });
	if (exists) throw new AppError("Email already in use", 409);

	const salt = await bcrypt.genSalt(10);
	const passwordHash = await bcrypt.hash(password, salt);

	const currentDeviceId = req.headers["x-device-id"];
	const currentIp = req.ip;

	let userRole = role === "ADMIN" ? "ADMIN" : "USER";

	// Check for multi-account device detection
	if (currentDeviceId) {
		const deviceCount = await User.countDocuments({ deviceId: currentDeviceId });
		if (deviceCount > 0) {
			userRole = "FLAGGED_USER";
		}
	}

	// Generate verification token
	const verificationToken = crypto.randomBytes(32).toString("hex");

	const user = await User.create({
		name,
		email,
		phone,
		passwordHash,
		role: userRole,
		lastIp: currentIp,
		deviceId: currentDeviceId,
		verificationToken,
		isVerified: false, // Default to false
	});

	// Check for multiple accounts from same IP
	const ipCount = await User.countDocuments({ lastIp: currentIp });
	if (ipCount > 3) {
		await updateTrustScore(
			user._id,
			-15,
			"Multiple accounts from same IP"
		);
	}

	// Send verification email
	try {
		await sendVerificationEmail(user.email, verificationToken);
	} catch (error) {
		console.error("Failed to send verification email:", error);
		// Don't fail registration, just log error
	}

	const token = signToken({ id: user._id });
	res.status(201).json({
		token,
		user: user.toSafeObject(),
		message: "Registration successful. Please check your email to verify account.",
	});
});

export const verifyEmail = asyncHandler(async (req, res) => {
	const { token } = req.params;

	const user = await User.findOne({ verificationToken: token });
	if (!user) throw new AppError("Invalid or expired verification token", 400);

	user.isVerified = true;
	user.verificationToken = undefined;
	await user.save();

	res.json({ message: "Email verified successfully" });
});

export const forgotPassword = asyncHandler(async (req, res) => {
	const { email } = req.body;
	if (!email) throw new AppError("Email is required", 400);

	const user = await User.findOne({ email });
	if (!user) throw new AppError("User not found", 404);

	// Generate reset token
	const resetToken = crypto.randomBytes(32).toString("hex");
	user.resetPasswordToken = resetToken;
	user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
	await user.save();

	try {
		await sendPasswordResetEmail(user.email, resetToken);
		res.json({ message: "Password reset email sent" });
	} catch (error) {
		user.resetPasswordToken = undefined;
		user.resetPasswordExpires = undefined;
		await user.save();
		throw new AppError("Failed to send email", 500);
	}
});

export const resetPassword = asyncHandler(async (req, res) => {
	const { token, newPassword } = req.body;
	if (!token || !newPassword)
		throw new AppError("Token and new password are required", 400);

	const user = await User.findOne({
		resetPasswordToken: token,
		resetPasswordExpires: { $gt: Date.now() },
	});

	if (!user) throw new AppError("Invalid or expired reset token", 400);

	const salt = await bcrypt.genSalt(10);
	user.passwordHash = await bcrypt.hash(newPassword, salt);
	user.resetPasswordToken = undefined;
	user.resetPasswordExpires = undefined;
	await user.save();

	res.json({ message: "Password reset successful" });
});

export const login = asyncHandler(async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password)
		throw new AppError("email and password are required", 400);

	const user = await User.findOne({ email }).select(
		"+passwordHash +deviceId +lastIp"
	);
	if (!user) throw new AppError("Invalid credentials", 401);

	const ok = await bcrypt.compare(password, user.passwordHash);
	if (!ok) throw new AppError("Invalid credentials", 401);

	// Optional: Enforce verification before login
	// if (!user.isVerified) throw new AppError("Please verify your email first", 403);

	const currentDeviceId = req.headers["x-device-id"];
	const currentIp = req.ip;

	// Device change detection
	if (user.deviceId && currentDeviceId && user.deviceId !== currentDeviceId) {
		await SecurityLog.create({
			userId: user._id,
			ipAddress: currentIp,
			deviceId: currentDeviceId,
			actionType: "DEVICE_MISMATCH",
			metadata: {
				oldDeviceId: user.deviceId,
				newDeviceId: currentDeviceId,
			},
		});
	}

	// IP change detection
	if (user.lastIp && currentIp && user.lastIp !== currentIp) {
		await updateTrustScore(user._id, -2, "IP address changed");
	}

	// Update device and IP
	if (currentDeviceId) user.deviceId = currentDeviceId;
	if (currentIp) user.lastIp = currentIp;
	await user.save();

	const token = signToken({ id: user._id });
	res.json({ token, user: user.toSafeObject() });
});

export const me = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user.id);
	res.json({ user: user.toSafeObject() });
});
