import mongoose from "mongoose";

const postingLimitSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	date: {
		type: String, // Format: YYYY-MM-DD
		required: true,
	},
	count: {
		type: Number,
		default: 0,
	},
});

// Unique index: one record per user per day
postingLimitSchema.index({ userId: 1, date: 1 }, { unique: true });

// TTL index: auto-delete after 7 days
postingLimitSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

export default mongoose.model("PostingLimit", postingLimitSchema);
