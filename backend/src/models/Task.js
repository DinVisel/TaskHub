import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		description: { type: String, required: true },
		category: {
			type: String,
			enum: ["Cleaning", "Repair", "Programming", "Tutoring", "Delivery", "Other"],
			default: "Other",
		},
		image: { type: String },
		price: { type: Number, default: 0 },
		budget: Number,
		status: {
			type: String,
			enum: ["open", "in_progress", "completed", "cancelled"],
			default: "open",
		},
		postedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		location: {
			address: { type: String, trim: true },
			coordinates: {
				lat: Number,
				lng: Number,
			},
		},
		assignedTo: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			default: null,
		},
		completedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			default: null,
		},
		completedAt: {
			type: Date,
		},
		requiresAdminApproval: {
			type: Boolean,
			default: false,
		},
		paid: { type: Boolean, default: false },
		commissionRate: { type: Number, default: 0.1 },
		isDisputed: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

export default mongoose.model("Task", taskSchema);
