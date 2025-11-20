import AppError from "../utils/appError.js";
import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
	const auth = req.headers.authorization || "";
	const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
	if (!token) return next(new AppError("Not authorized, token missing", 401));
	try {
		const decoded = verifyToken(token);
                const user = await User.findById(decoded.id).select(
                        "role identification"
                );
		if (!user)
			return next(new AppError("Not authorized, user no longer exists", 401));

                req.user = {
                        id: user._id.toString(),
                        _id: user._id,
                        role: user.role,
                        hasIdentification: Boolean(user.identification),
                };
		next();
	} catch (error) {
		next(new AppError("Not authorized, token invalid", 401));
	}
};

export const requireRole = (allowedRoles) => (req, res, next) => {
	if (!req.user || !allowedRoles.includes(req.user.role)) {
		return next(new AppError("Not authorized for this action", 403));
	}
	next();
};

export const restrictTo = (...allowedRoles) => {
	return (req, res, next) => {
		if (!allowedRoles.includes(req.user.role)) {
			return next(
				new AppError("You do not have permission to perform this action", 403)
			);
		}
		next();
	};
};
