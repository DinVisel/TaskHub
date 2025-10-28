import React, { useContext, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import api from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { colors, spacing, fonts, radii, shadow } from "../theme";

const PLACEHOLDER_AVATAR = "https://i.pravatar.cc/200";

export default function EditProfile() {
	const { user, updateUser } = useContext(AuthContext);

	const [name, setName] = useState("");
	const [phone, setPhone] = useState("");
	const [bio, setBio] = useState("");
	const [city, setCity] = useState("");
	const [avatar, setAvatar] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	useEffect(() => {
		if (!user) return;
		setName(user.name || "");
		setPhone(user.phone || "");
		setBio(user.bio || "");
		setCity(user.location?.city || "");
		setAvatar(user.avatar || "");
	}, [user]);

	const handleSave = async () => {
		setSaving(true);
		setError("");
		setSuccess("");

		try {
			const payload = {
				name: name.trim(),
				phone: phone.trim(),
				bio: bio.trim(),
				avatar: avatar.trim(),
				location: { city: city.trim() },
			};

			const res = await api.patch("/users/me", payload);
			updateUser(res.data.user);
			setSuccess("Profile updated successfully");
			setTimeout(() => router.back(), 600);
		} catch (err) {
			const message =
				err.response?.data?.message || "Unable to update your profile right now.";
			setError(message);
		} finally {
			setSaving(false);
		}
	};

	const previewSource = avatar?.trim()?.length
		? avatar
		: user?.avatar || PLACEHOLDER_AVATAR;
	const canSubmit = name.trim().length > 0 && !saving;

	return (
		<SafeAreaView style={styles.safeArea}>
			<ScrollView contentContainerStyle={styles.content}>
				<LinearGradient
					colors={[colors.primary, colors.secondary]}
					style={styles.header}
				>
					<TouchableOpacity
						style={styles.backButton}
						accessibilityRole='button'
						accessibilityLabel='Go back'
						onPress={() => router.back()}
					>
						<Text style={styles.backText}>‹ Back</Text>
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Edit your profile</Text>
					<Text style={styles.headerSubtitle}>
						Refresh your details so clients know exactly who they&apos;re hiring.
					</Text>
				</LinearGradient>

				<View style={styles.card}>
					<View style={styles.avatarPreview}>
						<Image source={{ uri: previewSource }} style={styles.avatarImage} />
						<Text style={styles.label}>Profile photo URL</Text>
						<TextInput
							placeholder='https://example.com/you.jpg'
							placeholderTextColor={colors.subtext}
							style={styles.input}
							autoCapitalize='none'
							value={avatar}
							onChangeText={setAvatar}
						/>
						<Text style={styles.helper}>
							Paste a link to a square image. Leave blank to use the default avatar.
						</Text>
					</View>

					<View style={styles.fieldGroup}>
						<Text style={styles.label}>Display name</Text>
						<TextInput
							placeholder='Your name'
							placeholderTextColor={colors.subtext}
							style={styles.input}
							value={name}
							onChangeText={setName}
						/>
					</View>

					<View style={styles.fieldGroup}>
						<Text style={styles.label}>Phone number</Text>
						<TextInput
							placeholder='+90 555 000 00 00'
							placeholderTextColor={colors.subtext}
							style={styles.input}
							keyboardType='phone-pad'
							value={phone}
							onChangeText={setPhone}
						/>
					</View>

					<View style={styles.fieldGroup}>
						<Text style={styles.label}>Bio</Text>
						<TextInput
							placeholder='Tell people about your skills and experience'
							placeholderTextColor={colors.subtext}
							style={[styles.input, styles.textArea]}
							multiline
							value={bio}
							onChangeText={setBio}
						/>
					</View>

					<View style={styles.fieldGroup}>
						<Text style={styles.label}>City</Text>
						<TextInput
							placeholder='Istanbul'
							placeholderTextColor={colors.subtext}
							style={styles.input}
							value={city}
							onChangeText={setCity}
						/>
					</View>

					{error ? <Text style={styles.errorText}>{error}</Text> : null}
					{success ? <Text style={styles.successText}>{success}</Text> : null}

					<TouchableOpacity
						style={[styles.button, (!canSubmit || saving) && styles.buttonDisabled]}
						onPress={handleSave}
						disabled={!canSubmit}
					>
						{saving ? (
							<ActivityIndicator color={colors.surface} />
						) : (
							<Text style={styles.buttonText}>Save changes</Text>
						)}
					</TouchableOpacity>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: colors.background,
	},
	content: {
		paddingBottom: spacing.xl,
	},
	header: {
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.xl,
		paddingBottom: spacing.lg,
		borderBottomLeftRadius: radii.lg,
		borderBottomRightRadius: radii.lg,
	},
	backButton: {
		alignSelf: "flex-start",
		paddingVertical: spacing.xs,
		paddingHorizontal: spacing.sm,
		borderRadius: radii.sm,
		backgroundColor: "rgba(255,255,255,0.12)",
		marginBottom: spacing.sm,
	},
	backText: {
		color: colors.surface,
		fontSize: fonts.caption,
		fontWeight: "600",
		letterSpacing: 0.4,
	},
	headerTitle: {
		color: colors.surface,
		fontSize: fonts.title,
		fontWeight: "700",
	},
	headerSubtitle: {
		marginTop: spacing.sm,
		color: "rgba(255,255,255,0.85)",
		fontSize: fonts.body,
		lineHeight: 22,
	},
	card: {
		marginHorizontal: spacing.lg,
		marginTop: -spacing.lg,
		backgroundColor: colors.surface,
		borderRadius: radii.lg,
		padding: spacing.lg,
		gap: spacing.lg,
		...shadow.card,
	},
	avatarPreview: {
		alignItems: "center",
		gap: spacing.sm,
	},
	avatarImage: {
		width: 96,
		height: 96,
		borderRadius: 48,
		borderWidth: 3,
		borderColor: colors.surface,
		backgroundColor: colors.border,
	},
	fieldGroup: {
		gap: spacing.xs,
	},
	label: {
		fontSize: fonts.subtitle,
		fontWeight: "600",
		color: colors.text,
	},
	input: {
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: radii.sm,
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.sm,
		color: colors.text,
		backgroundColor: "rgba(255,255,255,0.95)",
	},
	textArea: {
		minHeight: 90,
		textAlignVertical: "top",
	},
	helper: {
		color: colors.subtext,
		fontSize: fonts.caption,
		textAlign: "center",
	},
	button: {
		backgroundColor: colors.primary,
		paddingVertical: spacing.md / 1.25,
		borderRadius: radii.pill,
		alignItems: "center",
	},
	buttonDisabled: {
		opacity: 0.7,
	},
	buttonText: {
		color: colors.surface,
		fontWeight: "700",
		fontSize: fonts.body,
	},
	errorText: {
		color: colors.danger,
		textAlign: "center",
		fontSize: fonts.caption,
	},
	successText: {
		color: colors.success,
		textAlign: "center",
		fontSize: fonts.caption,
	},
});
