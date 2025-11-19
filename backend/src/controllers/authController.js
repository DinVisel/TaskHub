import bcrypt from "bcryptjs";
import User from "../models/User.js";
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

        const userRole = role === "admin" ? "admin" : "user";

        const user = await User.create({
                name,
                email,
                phone,
                passwordHash,
                role: userRole,
		lastIp: req.ip,
        });

	// Check for multiple accounts from same IP
	const ipCount = await User.countDocuments({ lastIp: req.ip });
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

	const user = await User.findOne({ email }).select("+passwordHash");
	if (!user) throw new AppError("Invalid credentials", 401);

	const ok = await bcrypt.compare(password, user.passwordHash);
	if (!ok) throw new AppError("Invalid credentials", 401);

	const token = signToken({ id: user._id });
	res.json({ token, user: user.toSafeObject() });
});

export const me = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user.id);
	res.json({ user: user.toSafeObject() });
});
