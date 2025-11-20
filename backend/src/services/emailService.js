import nodemailer from "nodemailer";

// Create a test account on Ethereal (or use env vars for production)
let transporter;

const createTransporter = async () => {
	if (transporter) return transporter;

	if (process.env.NODE_ENV === "production") {
		// Use real SMTP in production
		transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: process.env.SMTP_PORT,
			secure: process.env.SMTP_SECURE === "true",
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS,
			},
		});
	} else {
		// Use Ethereal for dev
		const testAccount = await nodemailer.createTestAccount();
		transporter = nodemailer.createTransport({
			host: "smtp.ethereal.email",
			port: 587,
			secure: false,
			auth: {
				user: testAccount.user,
				pass: testAccount.pass,
			},
		});
		console.log("📧 Ethereal Email Configured");
		console.log("User:", testAccount.user);
		console.log("Pass:", testAccount.pass);
	}
	return transporter;
};

export const sendVerificationEmail = async (email, token) => {
	const transporter = await createTransporter();
	const verificationUrl = `http://localhost:4000/api/auth/verify-email/${token}`;

	const info = await transporter.sendMail({
		from: '"TaskHub" <noreply@taskhub.com>',
		to: email,
		subject: "Verify your email",
		html: `
      <h1>Welcome to TaskHub!</h1>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
    `,
	});

	console.log("📨 Verification email sent: %s", info.messageId);
	console.log("🔗 Preview URL: %s", nodemailer.getTestMessageUrl(info));
};

export const sendPasswordResetEmail = async (email, token) => {
	const transporter = await createTransporter();
	// In a real app, this would link to a frontend page, but for now we'll link to API or just show token
	// Ideally: http://localhost:8081/reset-password?token=${token}
	const resetUrl = `http://localhost:4000/api/auth/reset-password-test/${token}`; // Just for testing

	const info = await transporter.sendMail({
		from: '"TaskHub" <noreply@taskhub.com>',
		to: email,
		subject: "Reset your password",
		html: `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Use the token below or click the link:</p>
      <p><b>Token:</b> ${token}</p>
      <a href="${resetUrl}">Reset Password Link (Dev)</a>
      <p>This link expires in 1 hour.</p>
    `,
	});

	console.log("📨 Password reset email sent: %s", info.messageId);
	console.log("🔗 Preview URL: %s", nodemailer.getTestMessageUrl(info));
};
