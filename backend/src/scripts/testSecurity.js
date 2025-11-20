/**
 * Verification script for suspicious behavior detection middleware
 * Tests all four detection scenarios:
 * 1. Multiple account creations from same IP
 * 2. Excessive profile edits
 * 3. Rapid job posting
 * 4. Device ID mismatch
 */

const BASE_URL = "http://localhost:3000/api";

// Helper function to make requests
async function makeRequest(method, endpoint, body = null, headers = {}) {
	const options = {
		method,
		headers: {
			"Content-Type": "application/json",
			...headers,
		},
	};

	if (body) {
		options.body = JSON.stringify(body);
	}

	const response = await fetch(`${BASE_URL}${endpoint}`, options);
	const data = await response.json();
	return { status: response.status, data };
}

async function testSuspiciousAccountCreation() {
	console.log("\n🧪 Test 1: Suspicious Account Creation (>3 from same IP)");
	console.log("Creating 4 accounts...");

	const results = [];
	for (let i = 1; i <= 4; i++) {
		const result = await makeRequest("POST", "/auth/register", {
			name: `Test User ${i}`,
			email: `testuser${i}@test.com`,
			password: "TestPass123!",
		});
		results.push(result);
		console.log(`Account ${i}: Status ${result.status}, Role: ${result.data.user?.role}`);
	}

	const flaggedUser = results[3];
	if (flaggedUser.data.user?.role === "FLAGGED_USER") {
		console.log("✅ PASSED: 4th account was flagged");
	} else {
		console.log("❌ FAILED: 4th account should be FLAGGED_USER");
	}
}

async function testExcessiveProfileEdits() {
	console.log("\n🧪 Test 2: Excessive Profile Edits (>20 in 10 min)");

	// First, create and log in a user
	const registerResult = await makeRequest("POST", "/auth/register", {
		name: "Profile Edit Test User",
		email: `profiletest${Date.now()}@test.com`,
		password: "TestPass123!",
	});

	const token = registerResult.data.token;
	console.log("Created test user, making 21 profile edits...");

	let blockedCount = 0;
	for (let i = 1; i <= 21; i++) {
		const result = await makeRequest(
			"PATCH",
			"/users/me",
			{ bio: `Bio update ${i}` },
			{ Authorization: `Bearer ${token}` }
		);

		if (result.status === 429) {
			blockedCount++;
			console.log(`Edit ${i}: ⛔ BLOCKED (429)`);
		} else {
			console.log(`Edit ${i}: ✓ Allowed`);
		}
	}

	if (blockedCount > 0) {
		console.log(`✅ PASSED: ${blockedCount} edits were blocked`);
	} else {
		console.log("❌ FAILED: Should have blocked edits after 20");
	}
}

async function testRapidJobPosting() {
	console.log("\n🧪 Test 3: Rapid Job Posting (>10 in 1 hour)");

	// Create a VERIFIED_USER (needed to post jobs)
	const registerResult = await makeRequest("POST", "/auth/register", {
		name: "Job Post Test User",
		email: `jobtest${Date.now()}@test.com`,
		password: "TestPass123!",
	});

	console.log("⚠️  Note: User needs VERIFIED_USER role to post jobs");
	console.log("Manual verification required: Promote user to VERIFIED_USER, then test 11 job posts");
}

async function testDeviceMismatch() {
	console.log("\n🧪 Test 4: Device ID Mismatch Detection");

	const registerResult = await makeRequest("POST", "/auth/register", {
		name: "Device Test User",
		email: `devicetest${Date.now()}@test.com`,
		password: "TestPass123!",
	});

	const token = registerResult.data.token;

	// Make a request with a device ID
	const result1 = await makeRequest(
		"GET",
		"/users/me",
		null,
		{
			Authorization: `Bearer ${token}`,
			"x-device-id": "device-12345",
		}
	);
	console.log("First request with device-12345:", result1.status);

	// Make another request with different device ID
	const result2 = await makeRequest(
		"GET",
		"/users/me",
		null,
		{
			Authorization: `Bearer ${token}`,
			"x-device-id": "device-67890",
		}
	);
	console.log("Second request with device-67890:", result2.status);

	console.log("✅ Check SecurityLog collection for DEVICE_MISMATCH entries");
}

async function runAllTests() {
	console.log("🚀 Starting Suspicious Behavior Detection Tests\n");
	console.log("=" .repeat(60));

	try {
		await testSuspiciousAccountCreation();
		await testExcessiveProfileEdits();
		await testRapidJobPosting();
		await testDeviceMismatch();

		console.log("\n" + "=".repeat(60));
		console.log("✅ Tests completed!");
		console.log("\nManual checks required:");
		console.log("1. Check MongoDB SecurityLog collection for logged events");
		console.log("2. Verify trustScore reduction for rapid job posting");
		console.log("3. Check DEVICE_MISMATCH alerts in SecurityLog");
	} catch (error) {
		console.error("❌ Test error:", error.message);
	}
}

// Run tests
runAllTests();
