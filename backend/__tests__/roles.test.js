import request from "supertest";
import app from "../src/server.js";
import mongoose from "mongoose";
import User from "../src/models/User.js";
import { connectDB } from "../src/config/db.js";
import jwt from "jsonwebtoken";

describe("Role System Verification", () => {
	let userToken, verifiedUserToken, adminToken;
	let userId, verifiedUserId, adminId;

	beforeAll(async () => {
		await connectDB();
		await User.deleteMany({ email: { $regex: /@test.com$/ } });

		// Create users with different roles
		const user = await User.create({
			name: "Basic User",
			email: "basic@test.com",
			passwordHash: "hash",
			role: "USER",
		});
		userId = user._id;
		userToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

		const verifiedUser = await User.create({
			name: "Verified User",
			email: "verified@test.com",
			passwordHash: "hash",
			role: "VERIFIED_USER",
		});
		verifiedUserId = verifiedUser._id;
		verifiedUserToken = jwt.sign({ id: verifiedUser._id }, process.env.JWT_SECRET);

		const admin = await User.create({
			name: "Admin User",
			email: "admin@test.com",
			passwordHash: "hash",
			role: "ADMIN",
		});
		adminId = admin._id;
		adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);
	});

	afterAll(async () => {
		await User.deleteMany({ email: { $regex: /@test.com$/ } });
		await mongoose.connection.close();
	});

	describe("Task Posting Permissions", () => {
		it("should deny USER from posting a task", async () => {
			const res = await request(app)
				.post("/api/tasks")
				.set("Authorization", `Bearer ${userToken}`)
				.send({
					title: "Test Task",
					description: "Desc",
					category: "Other",
					price: 100,
					location: { address: "Test" },
				});
			expect(res.statusCode).toBe(403);
		});

		it("should allow VERIFIED_USER to post a task", async () => {
			const res = await request(app)
				.post("/api/tasks")
				.set("Authorization", `Bearer ${verifiedUserToken}`)
				.send({
					title: "Test Task",
					description: "Desc",
					category: "Other",
					price: 100,
					location: { address: "Test" },
				});
			expect(res.statusCode).toBe(201);
		});
	});

	describe("Admin Role Management", () => {
		it("should deny non-admin from updating roles", async () => {
			const res = await request(app)
				.patch(`/api/admin/users/${userId}/role`)
				.set("Authorization", `Bearer ${verifiedUserToken}`)
				.send({ role: "PRO_USER" });
			expect(res.statusCode).toBe(403);
		});

		it("should allow ADMIN to update user role", async () => {
			const res = await request(app)
				.patch(`/api/admin/users/${userId}/role`)
				.set("Authorization", `Bearer ${adminToken}`)
				.send({ role: "PRO_USER" });
			expect(res.statusCode).toBe(200);
			expect(res.body.user.role).toBe("PRO_USER");

			// Verify change in DB
			const updatedUser = await User.findById(userId);
			expect(updatedUser.role).toBe("PRO_USER");
		});
	});
});
