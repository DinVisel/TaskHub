import React, { useState, useContext } from "react";
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	TouchableOpacity,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "../context/AuthContext";
import { router } from "expo-router";
import { colors, spacing, fonts, radii, shadow } from "../theme";

export default function RegisterScreen({ navigation }) {
	const { register } = useContext(AuthContext);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleRegister = async () => {
		try {
			await register(name, email, password, phone);
			router.replace("/"); // Redirect after success
		} catch (err) {
			setError(err.response?.data?.message || "Registration failed");
		}
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<LinearGradient
				colors={[colors.secondary, colors.primary]}
				style={styles.hero}
			>
				<Text style={styles.heroTitle}>Join TaskHub</Text>
				<Text style={styles.heroSubtitle}>
					Create an account to hire trusted professionals or offer your expertise.
				</Text>
			</LinearGradient>

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				style={styles.flex}
			>
				<ScrollView
					contentContainerStyle={styles.content}
					keyboardShouldPersistTaps='handled'
				>
					<View style={styles.card}>
						<Text style={styles.title}>Tell us about you</Text>

						<TextInput
							style={styles.input}
							placeholder='Full name'
							placeholderTextColor={colors.subtext}
							value={name}
							onChangeText={setName}
						/>

						<TextInput
							style={styles.input}
							placeholder='Email address'
							placeholderTextColor={colors.subtext}
							value={email}
							onChangeText={setEmail}
							autoCapitalize='none'
							keyboardType='email-address'
						/>

						<TextInput
							style={styles.input}
							placeholder='Phone number (optional)'
							placeholderTextColor={colors.subtext}
							value={phone}
							keyboardType='phone-pad'
							onChangeText={setPhone}
						/>

						<TextInput
							style={styles.input}
							placeholder='Create a password'
							placeholderTextColor={colors.subtext}
							value={password}
							onChangeText={setPassword}
							secureTextEntry
						/>

						{error ? <Text style={styles.error}>{error}</Text> : null}

						<TouchableOpacity
							style={[styles.button, styles.primaryButton]}
							onPress={handleRegister}
						>
							<Text style={styles.primaryButtonText}>Create account</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[styles.button, styles.secondaryButton]}
							onPress={() => router.push("/login")}
						>
							<Text style={styles.secondaryButtonText}>
								Already have an account? Log in
							</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: colors.background,
	},
	flex: { flex: 1 },
	hero: {
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.xl,
		paddingBottom: spacing.lg,
		borderBottomLeftRadius: radii.lg,
		borderBottomRightRadius: radii.lg,
	},
	heroTitle: {
		color: colors.surface,
		fontSize: fonts.title,
		fontWeight: "700",
	},
	heroSubtitle: {
		marginTop: spacing.sm,
		color: "rgba(255,255,255,0.8)",
		fontSize: fonts.body,
		lineHeight: 22,
	},
	content: {
		padding: spacing.lg,
	},
	card: {
		backgroundColor: colors.surface,
		borderRadius: radii.lg,
		padding: spacing.lg,
		...shadow.card,
	},
	title: {
		fontSize: fonts.subtitle,
		fontWeight: "700",
		color: colors.text,
		marginBottom: spacing.lg,
		textAlign: "left",
	},
	input: {
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: radii.sm,
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.sm,
		marginBottom: spacing.md,
		backgroundColor: "rgba(255,255,255,0.7)",
		color: colors.text,
	},
	error: {
		color: colors.danger,
		marginBottom: spacing.md,
		textAlign: "center",
	},
	button: {
		borderRadius: radii.pill,
		paddingVertical: spacing.sm + 4,
		alignItems: "center",
		marginTop: spacing.sm,
	},
	primaryButton: {
		backgroundColor: colors.primary,
	},
	primaryButtonText: {
		color: colors.surface,
		fontWeight: "700",
		fontSize: fonts.body,
	},
	secondaryButton: {
		backgroundColor: "transparent",
		borderWidth: 1,
		borderColor: colors.border,
	},
	secondaryButtonText: {
		color: colors.text,
		fontWeight: "600",
	},
});
