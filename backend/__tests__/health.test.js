import request from "supertest";
import app from "../src/server.js";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";

describe("Health Check", () => {
	beforeAll(async () => {
		await connectDB();
	});

	afterAll(async () => {
		await mongoose.connection.close();
	});

	it("should return 200 OK for the health endpoint", async () => {
		const res = await request(app).get("/api/health");
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ ok: true });
	});
});
