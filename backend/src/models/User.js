import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		role: {
			type: String,
			enum: ["client", "worker", "admin"],
			default: "worker",
		},
		phone: { type: String, trim: true },
		passwordHash: { type: String, required: true, select: false },
		bio: { type: String, default: "" },
		location: {
			city: { type: String, trim: true },
			coordinates: {
				lat: { type: Number },
				lng: { type: Number },
			},
		},
		rating: { type: Number, default: 0 },
		completedTasks: { type: Number, default: 0 },
	},
	{ timestamps: true }
);

// optional: expose a safe version for responses
userSchema.methods.toSafeObject = function () {
	const {
		_id,
		name,
		email,
		phone,
		bio,
		location,
		rating,
		completedTasks,
		createdAt,
	} = this;
	return {
		_id,
		name,
		email,
		phone,
		bio,
		location,
		rating,
		completedTasks,
		createdAt,
	};
};

export default mongoose.model("User", userSchema);
