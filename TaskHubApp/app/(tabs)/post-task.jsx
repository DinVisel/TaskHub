import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	Image,
	TouchableOpacity,
	ScrollView,
	ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import api from "../../api/api.js";
import { colors, spacing, fonts, radii, shadow } from "../../theme";

export default function PostTask() {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [message, setMessage] = useState("");
	const [city, setCity] = useState("");
	const [coords, setCoords] = useState(null);
	const [category, setCategory] = useState("");
	const [image, setImage] = useState(null);
	const [submitting, setSubmitting] = useState(false);

	const handlePost = async () => {
		try {
			setSubmitting(true);
			setMessage("");

			const trimmedCity = city.trim();
			const locationData = {};

			if (trimmedCity) {
				locationData.address = trimmedCity;
			}

			if (coords?.lat != null && coords?.lng != null) {
				locationData.coordinates = { ...coords };
			}

			// 1. Create Task (without image)
			const payload = {
				title: title.trim(),
				description: description.trim(),
				category: category.trim(),
				// image is optional now
			};

			if (Object.keys(locationData).length > 0) {
				payload.location = locationData;
			}

			// This might throw "Please complete your profile" error
			const taskRes = await api.post("/tasks", payload);
			const taskId = taskRes.data.task._id;

			// 2. Upload Image (if selected)
			if (image) {
				try {
					const formData = new FormData();
					formData.append("file", {
						uri: image,
						name: "task-image.jpg",
						type: "image/jpeg",
					});

					const uploadRes = await api.post("/upload", formData, {
						headers: { "Content-Type": "multipart/form-data" },
					});
					const imageUrl = uploadRes.data.url;

					// 3. Update Task with Image URL
					await api.patch(`/tasks/${taskId}`, { image: imageUrl });
				} catch (uploadErr) {
					console.error("Image upload failed:", uploadErr);
					// Optional: Alert user that task was created but image failed
					setMessage(
						"Task created, but image upload failed. You can add it later."
					);
					// Don't return here, let the success message show (or show partial success)
				}
			}

			setMessage("Task posted successfully!");
			setTitle("");
			setDescription("");
			setCategory("");
			setCity("");
			setImage(null);
		} catch (err) {
			setMessage(err.response?.data?.message || "Failed to post task");
		} finally {
			setSubmitting(false);
		}
	};

	const pickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			quality: 0.8,
		});

		if (!result.canceled && result.assets?.length) {
			setImage(result.assets[0].uri);
		}
	};

	useEffect(() => {
		(async () => {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") return;
			const location = await Location.getCurrentPositionAsync({});
			setCoords({
				lat: location.coords.latitude,
				lng: location.coords.longitude,
			});
		})();
	}, []);

	return (
		<SafeAreaView style={styles.safeArea}>
			<ScrollView contentContainerStyle={styles.content}>
				<LinearGradient
					colors={[colors.primary, colors.secondary]}
					style={styles.hero}
				>
					<Text style={styles.heroTitle}>Share a new opportunity</Text>
					<Text style={styles.heroSubtitle}>
						Fill in the details so the right professionals can respond fast.
					</Text>
				</LinearGradient>

				<View style={styles.card}>
					<Text style={styles.sectionTitle}>Task details</Text>
					<TextInput
						style={styles.input}
						placeholder='Give it a clear title'
						placeholderTextColor={colors.subtext}
						value={title}
						onChangeText={setTitle}
					/>
					<TextInput
						style={styles.input}
						placeholder='Category (e.g. Cleaning)'
						placeholderTextColor={colors.subtext}
						value={category}
						onChangeText={setCategory}
					/>
					<TextInput
						style={styles.input}
						placeholder='City or address'
						placeholderTextColor={colors.subtext}
						value={city}
						onChangeText={setCity}
					/>
					<TextInput
						style={[styles.input, styles.multiline]}
						placeholder='Describe what needs to be done'
						placeholderTextColor={colors.subtext}
						value={description}
						onChangeText={setDescription}
						multiline
						numberOfLines={4}
					/>

					<TouchableOpacity style={styles.outlineButton} onPress={pickImage}>
						<Text style={styles.outlineButtonText}>
							{image ? "Change image" : "Add a reference image"}
						</Text>
					</TouchableOpacity>

					{image ? <Image source={{ uri: image }} style={styles.preview} /> : null}

					<TouchableOpacity
						style={[styles.button, submitting && styles.buttonDisabled]}
						onPress={handlePost}
						disabled={submitting}
					>
						{submitting ? (
							<ActivityIndicator color={colors.surface} />
						) : (
							<Text style={styles.buttonText}>Publish task</Text>
						)}
					</TouchableOpacity>

					{message ? (
						<Text
							style={[
								styles.message,
								message.includes("successfully") ? styles.success : styles.error,
							]}
						>
							{message}
						</Text>
					) : null}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: colors.background },
	content: {
		padding: spacing.lg,
		gap: spacing.lg,
	},
	hero: {
		borderRadius: radii.lg,
		padding: spacing.lg,
		...shadow.card,
	},
	heroTitle: {
		color: colors.surface,
		fontSize: fonts.title,
		fontWeight: "700",
	},
	heroSubtitle: {
		marginTop: spacing.sm,
		color: "rgba(255,255,255,0.85)",
		fontSize: fonts.body,
		lineHeight: 22,
	},
	card: {
		backgroundColor: colors.surface,
		borderRadius: radii.lg,
		padding: spacing.lg,
		...shadow.card,
		gap: spacing.md,
	},
	sectionTitle: {
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
	multiline: {
		height: 120,
		textAlignVertical: "top",
	},
	outlineButton: {
		borderRadius: radii.pill,
		borderWidth: 1,
		borderColor: colors.primary,
		paddingVertical: spacing.sm,
		alignItems: "center",
	},
	outlineButtonText: {
		color: colors.primary,
		fontWeight: "600",
	},
	preview: {
		height: 180,
		borderRadius: radii.md,
		marginTop: spacing.sm,
		width: "100%",
	},
	button: {
		backgroundColor: colors.accent,
		borderRadius: radii.pill,
		paddingVertical: spacing.sm + 4,
		alignItems: "center",
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	buttonText: {
		color: colors.surface,
		fontWeight: "700",
		fontSize: fonts.body,
	},
	message: {
		marginTop: spacing.sm,
		textAlign: "center",
		fontWeight: "600",
	},
	success: { color: colors.success },
	error: { color: colors.danger },
});
