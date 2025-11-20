const API_URL = "http://localhost:4000/api/auth";

const runTest = async () => {
	try {
		console.log("🚀 Starting Auth Security Verification...");

		// 1. Register User
		const email = `test.auth.${Date.now()}@example.com`;
		console.log(`\n1. Registering user: ${email}`);
		
		const registerRes = await fetch(`${API_URL}/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: "Test Auth User",
				email,
				password: "Password123!",
				phone: "+15550000000",
			}),
		});
		
		const registerData = await registerRes.json();
		
		if (!registerRes.ok) {
			throw new Error(registerData.message || "Registration failed");
		}

		console.log("✅ Registration successful:", registerData.message);
		console.log(
			"⚠️  CHECK SERVER CONSOLE FOR ETHEREAL EMAIL LINK TO VERIFY TOKEN"
		);

		// 2. Forgot Password
		console.log(`\n2. Requesting password reset for: ${email}`);
		const forgotRes = await fetch(`${API_URL}/forgot-password`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email }),
		});
		
		const forgotData = await forgotRes.json();

		if (!forgotRes.ok) {
			throw new Error(forgotData.message || "Forgot password failed");
		}

		console.log("✅ Forgot password request successful:", forgotData.message);
		console.log(
			"⚠️  CHECK SERVER CONSOLE FOR ETHEREAL EMAIL LINK TO GET RESET TOKEN"
		);

		// 3. Rate Limiting Test (Login)
		console.log("\n3. Testing Rate Limiting (Login - 6 attempts)");
		for (let i = 1; i <= 6; i++) {
			const res = await fetch(`${API_URL}/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email,
					password: "WrongPassword",
				}),
			});

			if (res.status === 429) {
				console.log(`✅ Attempt ${i}: Blocked (Rate Limit Hit!)`);
			} else {
				console.log(`Attempt ${i}: Allowed (Status: ${res.status})`);
			}
		}
	} catch (error) {
		console.error("❌ Test Failed:", error.message);
	}
};

runTest();
