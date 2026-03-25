import mongoose from "mongoose";

const securityLogSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: false,
		},
		ipAddress: {
			type: String,
			required: true,
		},
		deviceId: {
			type: String,
			required: false,
		},
		actionType: {
			type: String,
			enum: [
				"ACCOUNT_CREATION",
				"PROFILE_EDIT",
				"JOB_POST",
				"DEVICE_MISMATCH",
			],
			required: true,
		},
		metadata: {
			type: mongoose.Schema.Types.Mixed,
			default: {},
		},
	},
	{ timestamps: true }
);

// Indexes for efficient queries
securityLogSchema.index({ ipAddress: 1, actionType: 1, createdAt: -1 });
securityLogSchema.index({ userId: 1, actionType: 1, createdAt: -1 });

// TTL index: auto-delete logs after 30 days
securityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

export default mongoose.model("SecurityLog", securityLogSchema);
