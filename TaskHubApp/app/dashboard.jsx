import React, { useCallback, useEffect, useState, useContext } from "react";
import {
	View,
	Text,
	ActivityIndicator,
	StyleSheet,
	ScrollView,
	RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
	const { user } = useContext(AuthContext);
	const [stats, setStats] = useState(null);
	const [refreshing, setRefreshing] = useState(false);

	const fetchStats = useCallback(async () => {
		try {
			const res = await api.get("/users/stats");
			setStats(res.data);
		} catch (error) {
			console.error("Failed to fetch stats", error);
		}
	}, []);

	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		await fetchStats();
		setRefreshing(false);
	}, [fetchStats]);

	useEffect(() => {
		fetchStats();
	}, [fetchStats]);

	if (!stats)
		return (
			<View style={styles.center}>
				<ActivityIndicator size='large' color='#007AFF' />
			</View>
		);

	return (
		<ScrollView
			style={styles.container}
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
			}
		>
			<LinearGradient colors={["#00C6FF", "#007AFF"]} style={styles.header}>
				<Text style={styles.headerTitle}>
					{user.role === "client" ? "Client Dashboard" : "Worker Dashboard"}
				</Text>
			</LinearGradient>

			<View style={styles.statCard}>
				<Text style={styles.value}>{stats.postedTasks ?? stats.offersMade}</Text>
				<Text style={styles.label}>
					{user.role === "client" ? "Tasks Posted" : "Offers Made"}
				</Text>
			</View>

			<View style={styles.statCard}>
				<Text style={styles.value}>{stats.completedTasks}</Text>
				<Text style={styles.label}>Tasks Completed</Text>
			</View>

			<View style={styles.statCard}>
				<Text style={styles.value}>{stats.averageRating}</Text>
				<Text style={styles.label}>Average Rating ⭐</Text>
			</View>

			<View style={styles.statCard}>
				<Text style={styles.value}>${stats.totalEarnings}</Text>
				<Text style={styles.label}>Earnings</Text>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#F9FAFB" },
	header: {
		padding: 30,
		alignItems: "center",
		borderBottomLeftRadius: 25,
		borderBottomRightRadius: 25,
	},
	headerTitle: { color: "#fff", fontWeight: "bold", fontSize: 22 },
	statCard: {
		backgroundColor: "#fff",
		margin: 16,
		borderRadius: 16,
		padding: 24,
		shadowColor: "#000",
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 3,
		alignItems: "center",
	},
	value: { fontSize: 28, fontWeight: "bold", color: "#007AFF" },
	label: { color: "#6B7280", marginTop: 6, fontSize: 14 },
	center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
