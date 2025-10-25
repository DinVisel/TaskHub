import { asyncHandler } from "../utils/asyncHandler.js";
import Task from "../models/Task.js";
import * as geolib from "geolib";

export const getRecommendedTasks = asyncHandler(async (req, res) => {
	if (req.user.role !== "worker") {
		return res.status(403).json({ message: "Only workers get recommendations" });
	}

	const { categories, radiusKm } = req.user.preferences;
	const userLat = req.user.latitude;
	const userLon = req.user.longitude;

	// 1. base query
	let query = { status: "open" };
	if (categories?.length) query.category = { $in: categories };

	const allTasks = await Task.find(query);
	// 2. optional distance filter
	const filtered = userLat
		? allTasks.filter(
				(t) =>
					t.latitude &&
					geolib.getDistance(
						{ latitude: userLat, longitude: userLon },
						{ latitude: t.latitude, longitude: t.longitude }
					) /
						1000 <=
						(radiusKm || 25)
		  )
		: allTasks;

	res.json({ tasks: filtered.slice(0, 20) }); // limit to 20
});
