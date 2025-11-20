import bcrypt from "bcryptjs";
import User from "../models/User.js";
import SecurityLog from "../models/SecurityLog.js";
import AppError from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken } from "../utils/jwt.js";
import { updateTrustScore } from "../services/trustScoreService.js";

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

	let userRole = role === "admin" ? "admin" : "user";

	// Check for multi-account device detection
	if (currentDeviceId) {
		const deviceCount = await User.countDocuments({ deviceId: currentDeviceId });
		if (deviceCount > 0) {
			userRole = "FLAGGED_USER";
		}
	}

        const user = await User.create({
                name,
                email,
                phone,
                passwordHash,
                role: userRole,
		lastIp: currentIp,
		deviceId: currentDeviceId,
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

	const token = signToken({ id: user._id });
	res.status(201).json({ token, user: user.toSafeObject() });
});

export const login = asyncHandler(async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password)
		throw new AppError("email and password are required", 400);

	const user = await User.findOne({ email }).select("+passwordHash +deviceId +lastIp");
	if (!user) throw new AppError("Invalid credentials", 401);

	const ok = await bcrypt.compare(password, user.passwordHash);
	if (!ok) throw new AppError("Invalid credentials", 401);

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
