import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
	{
		taskId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Task",
			required: true,
		},
		applicantId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		message: {
			type: String,
			trim: true,
		},
		amount: {
			type: Number,
			default: 0, // Custom price offered by applicant
		},
		status: {
			type: String,
			enum: ["pending", "accepted", "rejected"],
			default: "pending",
		},
	},
	{ timestamps: true }
);

export default mongoose.model("Offer", offerSchema);
