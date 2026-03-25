import Task from "../models/Task.js";

/**
 * Detects risky job posts based on multiple criteria.
 * Flags jobs for admin approval if suspicious.
 */
export const detectRiskyJob = async (req, res, next) => {
	try {
		const { title, description, price, budget } = req.body;
		const riskReasons = [];

		// 1. High Payment Detection (> $1000)
		const paymentAmount = budget || price || 0;
		if (paymentAmount > 1000) {
			riskReasons.push(`High payment: $${paymentAmount}`);
		}

		// 2. Short Description Detection (< 20 characters)
		if (description && description.trim().length < 20) {
			riskReasons.push(
				`Short description: ${description.trim().length} chars`
			);
		}

		// 3. External Link Detection
		const urlPattern = /(https?:\/\/|www\.)/i;
		if (description && urlPattern.test(description)) {
			riskReasons.push("Contains external links");
		}

		// 4. Duplicate Title Detection (same title in last 7 days)
		if (title) {
			const sevenDaysAgo = new Date();
			sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

			const duplicateCount = await Task.countDocuments({
				title: { $regex: new RegExp(`^${title.trim()}$`, "i") },
				createdAt: { $gte: sevenDaysAgo },
			});

			if (duplicateCount > 0) {
				riskReasons.push(
					`Duplicate title (${duplicateCount} found in last 7 days)`
				);
			}
		}

		// Flag as risky if any criteria matched
		if (riskReasons.length > 0) {
			req.riskyJob = true;
			req.riskReasons = riskReasons;
			console.log(
				`⚠️  Risky job detected: ${riskReasons.join(", ")}`
			);
		}

		next();
	} catch (error) {
		console.error("Error in detectRiskyJob:", error);
		// Fail open: don't block job creation on detection error
		next();
	}
};
