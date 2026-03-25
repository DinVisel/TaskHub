import React, { useEffect, useState } from "react";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import api from "../api/api.js";
import { colors, spacing, fonts, radii } from "../theme";

export default function MapScreen() {
	const [tasks, setTasks] = useState([]);
	const [region, setRegion] = useState(null);

	useEffect(() => {
		const loadData = async () => {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") return alert("Permission denied");

			const userLoc = await Location.getCurrentPositionAsync({});
			setRegion({
				latitude: userLoc.coords.latitude,
				longitude: userLoc.coords.longitude,
				latitudeDelta: 0.05,
				longitudeDelta: 0.05,
			});

			const res = await api.get("/tasks");
			setTasks(res.data.tasks);
		};
		loadData();
	}, []);

	if (!region)
		return (
			<View style={styles.center}>
				<ActivityIndicator size='large' color={colors.primary} />
				<Text style={styles.loadingText}>Locating nearby jobs...</Text>
			</View>
		);

	return (
		<SafeAreaView style={styles.safeArea}>
			<LinearGradient
				colors={[colors.background, "rgba(255,255,255,0)"]}
				style={styles.topOverlay}
			>
				<Text style={styles.title}>Nearby opportunities</Text>
				<Text style={styles.subtitle}>
					Tap a marker to open the conversation about a task.
				</Text>
			</LinearGradient>

			<MapView style={styles.map} initialRegion={region} showsUserLocation>
				{tasks.map((t) => {
					const latitude = t?.location?.coordinates?.lat;
					const longitude = t?.location?.coordinates?.lng;

					if (latitude == null || longitude == null) return null;

					const preview = t.description ? `${t.description.slice(0, 60)}…` : "";

					return (
						<Marker
							key={t._id}
							coordinate={{ latitude, longitude }}
							title={t.title}
							pinColor={colors.primary}
						>
							<Callout onPress={() => router.push(`/chat/${t._id}`)}>
								<View style={styles.callout}>
									<Text style={styles.calloutTitle}>{t.title}</Text>
									<Text style={styles.calloutLocation}>
										{t?.location?.address || t?.location?.city || "Unknown"}
									</Text>
									<Text style={styles.calloutDescription}>{preview}</Text>
									<Text style={styles.calloutCta}>Open chat →</Text>
								</View>
							</Callout>
						</Marker>
					);
				})}
			</MapView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: colors.background },
	map: { flex: 1 },
	center: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: colors.background,
	},
	loadingText: {
		marginTop: spacing.sm,
		color: colors.subtext,
	},
	topOverlay: {
		position: "absolute",
		zIndex: 2,
		width: "100%",
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.lg,
		paddingBottom: spacing.md,
	},
	title: {
		fontSize: fonts.subtitle,
		fontWeight: "700",
		color: colors.text,
	},
	subtitle: {
		color: colors.subtext,
		marginTop: spacing.xs,
	},
	callout: {
		width: 220,
		backgroundColor: colors.surface,
		borderRadius: radii.md,
		padding: spacing.md,
		gap: spacing.xs,
	},
	calloutTitle: {
		fontWeight: "700",
		color: colors.text,
		fontSize: fonts.body,
	},
	calloutLocation: {
		color: colors.subtext,
		fontSize: fonts.caption,
	},
	calloutDescription: {
		color: colors.text,
		fontSize: fonts.caption,
	},
	calloutCta: {
		marginTop: spacing.xs,
		color: colors.primary,
		fontWeight: "600",
	},
});
