import request from "supertest";
import app from "../src/server.js";
import mongoose from "mongoose";
import User from "../src/models/User.js";
import Task from "../src/models/Task.js";
import { connectDB } from "../src/config/db.js";
import jwt from "jsonwebtoken";

describe("Trust Score System Verification", () => {
	let userToken, adminToken;
	let userId, adminId;

	beforeAll(async () => {
		await connectDB();
		await User.deleteMany({ email: { $regex: /@trusttest.com$/ } });
		await Task.deleteMany({ title: { $regex: /Trust Test Task/ } });

		// Create test user
		const user = await User.create({
			name: "Trust User",
			email: "trust@trusttest.com",
			passwordHash: "hash",
			role: "USER",
			trustScore: 50,
		});
		userId = user._id;
		userToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

		// Create admin
		const admin = await User.create({
			name: "Admin User",
			email: "admin@trusttest.com",
			passwordHash: "hash",
			role: "ADMIN",
		});
		adminId = admin._id;
		adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);
	});

	afterAll(async () => {
		await User.deleteMany({ email: { $regex: /@trusttest.com$/ } });
		await Task.deleteMany({ title: { $regex: /Trust Test Task/ } });
		await mongoose.connection.close();
	});

	it("should initialize trust score to 50", async () => {
		const user = await User.findById(userId);
		expect(user.trustScore).toBe(50);
	});

	it("should decrease trust score on report", async () => {
		const res = await request(app)
			.post("/api/reports")
			.set("Authorization", `Bearer ${adminToken}`)
			.send({
				reportedUserId: userId,
				reason: "Spam",
				description: "Spamming messages",
			});

		expect(res.statusCode).toBe(201);

		const user = await User.findById(userId);
		expect(user.trustScore).toBe(30); // 50 - 20
	});

	it("should increase trust score on task completion", async () => {
		// Create a task first (need to be verified to post, so manually update role first)
		await User.findByIdAndUpdate(userId, { role: "VERIFIED_USER" });

		const task = await Task.create({
			title: "Trust Test Task",
			description: "Desc",
			category: "Other",
			price: 100,
			postedBy: userId,
			assignedTo: adminId,
			status: "in_progress",
			paid: true,
		});

		// Complete task
		const res = await request(app)
			.put(`/api/tasks/${task._id}/complete`)
			.set("Authorization", `Bearer ${userToken}`);

		expect(res.statusCode).toBe(200);

		const user = await User.findById(userId);
		// 30 + 10 = 40
		expect(user.trustScore).toBe(40);
	});

	it("should promote to PRO_USER when score > 85", async () => {
		// Manually boost score close to threshold and ensure role is VERIFIED_USER (to allow completion)
		await User.findByIdAndUpdate(userId, { trustScore: 80, role: "VERIFIED_USER" });

		// Trigger another update (e.g. report +10 logic via direct service call or another task)
		// Let's use another task completion for simplicity
		const task = await Task.create({
			title: "Trust Test Task 2",
			description: "Desc",
			category: "Other",
			price: 100,
			postedBy: userId,
			assignedTo: adminId,
			status: "in_progress",
			paid: true,
		});

		const res = await request(app)
			.put(`/api/tasks/${task._id}/complete`)
			.set("Authorization", `Bearer ${userToken}`);

		expect(res.statusCode).toBe(200);

		const user = await User.findById(userId);
		// 80 + 10 = 90
		expect(user.trustScore).toBe(90);
		expect(user.role).toBe("PRO_USER");
	});
});
