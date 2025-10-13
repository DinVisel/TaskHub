export const notFound = (req, res, next) => {
	res
		.status(404)
		.json({ status: "fail", message: `Not Found - ${req.originalUrl}` });
};

export const globalErrorHandler = (err, req, res, next) => {
	const statusCode = err.statusCode || 500;
	res.status(statusCode).json({
		status: `${statusCode}`.startsWith("4") ? "fail" : "error",
		message: err.message || "Something went wrong",
	});
};
