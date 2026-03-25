import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
	{
		recipientId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		type: {
			type: String,
			enum: [
				"MESSAGE",
				"OFFER_RECEIVED",
				"OFFER_ACCEPTED",
				"TASK_COMPLETED",
				"PAYMENT_RECEIVED",
				"SYSTEM",
			],
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		message: {
			type: String,
			required: true,
		},
		data: {
			type: Object,
			default: {},
		},
		isRead: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

// Index for fast retrieval of user's notifications
notificationSchema.index({ recipientId: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
