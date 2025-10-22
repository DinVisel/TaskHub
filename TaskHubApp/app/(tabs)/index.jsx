import React, { useEffect, useRef, useState } from "react";
import {
	Animated,
	View,
	Text,
	StyleSheet,
	StatusBar,
	TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import api from "../../api/api";
import { colors, spacing, fonts } from "../../theme.js";

export default function Home() {
	const [tasks, setTasks] = useState([]);

	const scrollY = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		const fetchTasks = async () => {
			try {
				const res = await api.get("/tasks");
				setTasks(res.data.tasks);
			} catch (err) {
				console.log("Error fetching tasks:", err.message);
			}
		};
		fetchTasks();
	}, []);

	const headerHeight = scrollY.interpolate({
		inputRange: [0, 80],
		outputRange: [120, 60],
		extrapolate: "clamp",
	});

	const headerFontSize = scrollY.interpolate({
		inputRange: [0, 80],
		outputRange: [28, 20],
		extrapolate: "clamp",
	});

	return (
		<SafeAreaView style={styles.container}>
			<LinearGradient
				colors={[colors.secondary, colors.primary]}
				style={styles.header}
			>
				<Text style={styles.headerTitle}>Find Help Nearby</Text>
				<Text style={styles.headerSubtitle}>Exchange skills in your community</Text>
			</LinearGradient>

			<StatusBar barStyle='dark-content' />
			{/* Animated Header */}
			<Animated.View style={[styles.header, { height: headerHeight }]}>
				<Animated.Text style={[styles.headerTitle, { fontSize: headerFontSize }]}>
					TaskHub
				</Animated.Text>
				<Text style={styles.subHeader}>Find local help or offer your skills</Text>
			</Animated.View>

			{/* Scrollable Content */}
			<Animated.FlatList
				style={{ flex: 1 }}
				data={tasks}
				keyExtractor={(item) => item._id}
				contentContainerStyle={{ padding: spacing.md }}
				renderItem={({ item }) => (
					<TouchableOpacity
						onPress={() => router.push(`/chat/${item._id}`)}
						style={styles.card}
					>
						<View style={styles.row}>
							<Image
								source={{ uri: item.ownerAvatar || "https://i.pravatar.cc/80" }}
								style={styles.avatar}
							/>
							<View style={{ flex: 1 }}>
								<Text style={styles.title}>{item.title}</Text>
								<Text style={styles.subtitle}>{item.category || "General"}</Text>
							</View>
						</View>
						<Text style={styles.desc} numberOfLines={2}>
							{item.description}
						</Text>
					</TouchableOpacity>
				)}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.background },
	header: {
		paddingTop: 60,
		paddingBottom: 30,
		alignItems: "center",
		borderBottomLeftRadius: 25,
		borderBottomRightRadius: 25,
	},
	headerTitle: {
		color: "white",
		fontWeight: "bold",
		fontSize: 26,
	},
	headerSubtitle: {
		color: "rgba(255,255,255,0.8)",
		marginTop: 6,
		fontSize: 14,
	},
	card: {
		backgroundColor: colors.card,
		borderRadius: 16,
		padding: spacing.md,
		marginBottom: spacing.md,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 4 },
		shadowRadius: 6,
		elevation: 3,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: spacing.sm,
	},
	avatar: {
		width: 48,
		height: 48,
		borderRadius: 24,
		marginRight: spacing.md,
	},
	title: {
		fontSize: fonts.subtitle,
		fontWeight: "bold",
		color: colors.text,
	},
	subtitle: {
		color: colors.subtext,
		marginTop: 2,
	},
	desc: {
		color: colors.subtext,
		marginTop: spacing.xs,
	},
});
