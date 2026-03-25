import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import api from "../api/api";
import { colors, spacing, fonts, radii, shadow } from "../theme";

export default function Preferences() {
        const [categories, setCategories] = useState("");
        const [radius, setRadius] = useState("");
        const [saving, setSaving] = useState(false);

        useEffect(() => {
                const loadPreferences = async () => {
                        try {
                                const res = await api.get("/users/preferences");
                                const prefCategories = res.data?.categories || [];
                                setCategories(prefCategories.join(", "));

                                if (typeof res.data?.radiusKm === "number") {
                                        setRadius(String(res.data.radiusKm));
                                } else {
                                        setRadius("");
                                }
                        } catch (err) {
                                console.log("Failed to load preferences", err.message);
                        }
                };

                loadPreferences();
        }, []);

        const save = async () => {
                const trimmedCategories = categories
                        .split(",")
                        .map((c) => c.trim())
                        .filter(Boolean);
                const radiusValue = Number.parseInt(radius, 10);

                const payload = {
                        categories: trimmedCategories,
                        ...(Number.isNaN(radiusValue) ? {} : { radiusKm: radiusValue }),
                };

                try {
                        setSaving(true);
                        await api.patch("/users/preferences", payload);
                        alert("Preferences saved!");
                } catch (err) {
                        console.log("Failed to save preferences", err.message);
                        alert("We couldn't save your preferences. Please try again.");
                } finally {
                        setSaving(false);
                }
        };

	return (
		<SafeAreaView style={styles.safeArea}>
			<LinearGradient
				colors={[colors.primary, colors.secondary]}
				style={styles.header}
			>
				<Text style={styles.headerTitle}>Match Preferences</Text>
				<Text style={styles.headerSubtitle}>
					Choose the jobs you love and how far you&apos;re willing to travel.
				</Text>
			</LinearGradient>

			<ScrollView contentContainerStyle={styles.content}>
				<View style={styles.card}>
					<Text style={styles.label}>Preferred categories</Text>
					<TextInput
						placeholder='Cleaning, Repair, Tutoring'
						placeholderTextColor={colors.subtext}
						value={categories}
						onChangeText={setCategories}
						style={styles.input}
					/>

					<Text style={styles.label}>Search radius (km)</Text>
					<TextInput
						placeholder='25'
						placeholderTextColor={colors.subtext}
						keyboardType='numeric'
						value={radius}
						onChangeText={setRadius}
						style={styles.input}
					/>

					<Text style={styles.helper}>
						Separate categories with commas. We&apos;ll prioritise matches in these areas
						first.
					</Text>

                                        <TouchableOpacity
                                                style={[styles.button, saving && styles.buttonDisabled]}
                                                onPress={save}
                                                disabled={saving}
                                        >
                                                <Text style={styles.buttonText}>
                                                        {saving ? "Saving..." : "Save preferences"}
                                                </Text>
                                        </TouchableOpacity>
                                </View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: colors.background },
	header: {
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.xl,
		paddingBottom: spacing.lg,
		borderBottomLeftRadius: radii.lg,
		borderBottomRightRadius: radii.lg,
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
	content: {
		padding: spacing.lg,
	},
	card: {
		backgroundColor: colors.surface,
		borderRadius: radii.lg,
		padding: spacing.lg,
		gap: spacing.sm,
		...shadow.card,
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
		backgroundColor: "rgba(255,255,255,0.9)",
	},
	helper: {
		color: colors.subtext,
		fontSize: fonts.caption,
		lineHeight: 18,
		marginTop: spacing.xs,
	},
        button: {
                marginTop: spacing.lg,
                backgroundColor: colors.primary,
                paddingVertical: spacing.sm + 4,
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
});
