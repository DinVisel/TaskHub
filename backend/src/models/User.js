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
                        enum: ["USER", "VERIFIED_USER", "PRO_USER", "FLAGGED_USER", "ADMIN"],
                        default: "USER",
                },
                avatar: { type: String, default: "" },
                trustScore: { type: Number, default: 50 },
                lastIp: { type: String, select: false },
                deviceId: { type: String, select: false },
                phone: { type: String, trim: true },
                passwordHash: { type: String, required: true, select: false },
                bio: { type: String, default: "" },
                identification: { type: String, trim: true, default: "" },
		trustedDevices: [{ type: String }],
		location: {
			city: { type: String, trim: true },
			coordinates: {
				lat: { type: Number },
				lng: { type: Number },
			},
		},
		rating: { type: Number, default: 0 },
		completedTasks: { type: Number, default: 0 },
		preferences: {
			categories: [String],
			radiusKm: { type: Number, default: 50 },
			notifications: { type: Boolean, default: true },
		},
		pushToken: {
			type: String,
			default: null,
		},
		trustScore: {
			type: Number,
			default: 100,
		},
		walletBalance: {
			type: Number,
			default: 0,
		},
		transactions: [
			{
				type: {
					type: String, // "add", "spend", "receive", "refund"
				},
				amount: Number,
				description: String,
				createdAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
		profileCompleted: { type: Boolean, default: false },
		isVerified: { type: Boolean, default: false },
		verificationToken: { type: String, select: false },
		resetPasswordToken: { type: String, select: false },
		resetPasswordExpires: { type: Date, select: false },
	},
	{ timestamps: true }
);

// Pre-save hook to auto-calculate profile completeness
userSchema.pre("save", function (next) {
	// Check mandatory fields: name, avatar, city, bio
	const hasName = Boolean(this.name && this.name.trim());
	const hasAvatar = Boolean(this.avatar && this.avatar.trim());
	const hasCity = Boolean(this.location?.city && this.location.city.trim());
	const hasBio = Boolean(this.bio && this.bio.trim());

	this.profileCompleted = hasName && hasAvatar && hasCity && hasBio;
	next();
});

// optional: expose a safe version for responses
userSchema.methods.toSafeObject = function () {
        const {
                _id,
                name,
                email,
                phone,
                avatar,
                bio,
                location,
                rating,
                completedTasks,
                createdAt,
                preferences,
                role,
                trustScore,
                identification,
        } = this;
        return {
                _id,
                name,
                email,
                phone,
                avatar,
                bio,
                location,
                rating,
                completedTasks,
                createdAt,
                preferences,
                role,
                trustScore,
		profileCompleted: this.profileCompleted,
		hasIdentification: Boolean(identification),
        };
};

export default mongoose.model("User", userSchema);
