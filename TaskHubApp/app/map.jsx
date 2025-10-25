import React, { useEffect, useState } from "react";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";
import api from "../api/api.js";

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
				<ActivityIndicator size='large' color='#007AFF' />
			</View>
		);

	return (
		<MapView style={styles.map} initialRegion={region} showsUserLocation>
			{tasks.map((t) => {
				const latitude = t?.location?.coordinates?.lat;
				const longitude = t?.location?.coordinates?.lng;

				if (latitude == null || longitude == null) return null;

				return (
					<Marker key={t._id} coordinate={{ latitude, longitude }} title={t.title}>
						<Callout onPress={() => router.push(`/chat/${t._id}`)}>
							<View style={{ width: 200 }}>
								<Text style={{ fontWeight: "bold" }}>{t.title}</Text>
								<Text>{t?.location?.address || t?.location?.city || "Unknown"}</Text>
								<Text>{t.description.slice(0, 40)}...</Text>
							</View>
						</Callout>
					</Marker>
				);
			})}
		</MapView>
	);
}

const styles = StyleSheet.create({
	map: { flex: 1 },
	center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
