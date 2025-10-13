import AppError from "../utils/appError.js";
import { verifyToken } from "../utils/jwt.js";

export const protect = (req, res, next) => {
	const auth = req.headers.authorization || "";
	const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
	if (!token) return next(new AppError("Not authorized, token missing", 401));
	try {
		const decoded = verifyToken(token);
		req.user = { id: decoded.id };
		next();
	} catch {
		next(new AppError("Not authorized, token invalid", 401));
	}
};
