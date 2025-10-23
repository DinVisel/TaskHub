import AppError from "../utils/appError.js";
import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
        const auth = req.headers.authorization || "";
        const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
        if (!token) return next(new AppError("Not authorized, token missing", 401));
        try {
                const decoded = verifyToken(token);
                const user = await User.findById(decoded.id).select("role");
                if (!user)
                        return next(
                                new AppError("Not authorized, user no longer exists", 401)
                        );

                req.user = { id: user._id.toString(), role: user.role };
                next();
        } catch (error) {
                next(new AppError("Not authorized, token invalid", 401));
        }
};

export const restrictTo = (...allowedRoles) => (req, res, next) => {
        if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
                return next(new AppError("Not authorized for this action", 403));
        }
        next();
};
