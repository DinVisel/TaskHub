import { asyncHandler } from "../utils/asyncHandler.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import * as geolib from "geolib";
import AppError from "../utils/appError.js";

export const getRecommendedTasks = asyncHandler(async (req, res) => {
	const allowedRoles = ["USER", "user", "VERIFIED_USER", "PRO_USER", "ADMIN"];
	if (!allowedRoles.includes(req.user.role)) {
		return res
			.status(403)
			.json({ message: "Your role is not permitted to view recommendations" });
	}

	const user = await User.findById(req.user.id).select(
		"preferences location identification"
	);
	if (!user) throw new AppError("User not found", 404);

	// if (!user.identification)
	// 	throw new AppError(
	// 		"Identification is required to view task recommendations",
	// 		403
	// 	);

	const categories = user.preferences?.categories || [];
	const radiusKm = user.preferences?.radiusKm ?? 25;
	const userLat = user.location?.coordinates?.lat;
	const userLon = user.location?.coordinates?.lng;

	// 1. base query
	const query = { status: "open" };
	if (categories.length) query.category = { $in: categories };

	const allTasks = await Task.find(query);
	// 2. optional distance filter using stored coordinates
	const filtered =
		typeof userLat === "number" && typeof userLon === "number"
			? allTasks.filter((task) => {
					const taskLat = task.location?.coordinates?.lat;
					const taskLon = task.location?.coordinates?.lng;
					if (typeof taskLat !== "number" || typeof taskLon !== "number") {
						return false;
					}
					const distance =
						geolib.getDistance(
							{
								latitude: userLat,
								longitude: userLon,
							},
							{
								latitude: taskLat,
								longitude: taskLon,
							}
						) / 1000;
					return distance <= radiusKm;
			  })
			: allTasks;

	res.json({ tasks: filtered.slice(0, 20) }); // limit to 20
});
