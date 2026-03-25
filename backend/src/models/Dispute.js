import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema(
	{
		taskId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Task",
			required: true,
		},
		initiatorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		reason: {
			type: String,
			required: true,
			enum: [
				"Incomplete work",
				"Poor quality",
				"No show",
				"Unresponsive",
				"Other",
			],
		},
		description: {
			type: String,
			required: true,
			trim: true,
		},
		status: {
			type: String,
			enum: ["OPEN", "RESOLVED_REFUND", "RESOLVED_PAY", "DISMISSED"],
			default: "OPEN",
		},
		resolutionNotes: {
			type: String,
			default: "",
		},
	},
	{ timestamps: true }
);

export default mongoose.model("Dispute", disputeSchema);
