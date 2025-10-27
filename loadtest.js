import http from "k6/http";
import { check, sleep } from "k6";

// Configuration: how long the test runs and how many users
export const options = {
	stages: [
		{ duration: "10s", target: 10 }, // ramp up to 10 virtual users
		{ duration: "30s", target: 10 }, // stay at 10 users
		{ duration: "10s", target: 0 }, // ramp down to 0 users
	],
};

export default function () {
	// Replace this with a real route if you want (like /api/tasks)
	const res = http.get("http://localhost:4000/api/health");

	// Verify server responds correctly
	check(res, {
		"status is 200": (r) => r.status === 200,
		"response time < 500ms": (r) => r.timings.duration < 500,
	});

	// Each virtual user waits 1 second between requests
	sleep(1);
}
