import rateLimit from "express-rate-limit";

// Global limiter: 100 requests per 15 minutes
export const globalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	message: {
		status: "fail",
		message: "Too many requests from this IP, please try again later.",
	},
	standardHeaders: true,
	legacyHeaders: false,
});

// Auth limiter: 5 requests per 15 minutes (login/register)
export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 5,
	message: {
		status: "fail",
		message: "Too many login attempts, please try again later.",
	},
	standardHeaders: true,
	legacyHeaders: false,
});
