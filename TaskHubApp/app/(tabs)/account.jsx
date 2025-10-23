import React, { useContext, useState, useEffect } from "react";
import {
	View,
	Text,
	Button,
	StyleSheet,
	Image,
	TouchableOpacity,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing } from "@/theme";
import api from "@/api/api";

export default function Account() {
	const { user, logout } = useContext(AuthContext);
	const [reviews, setReviews] = useState([]);
	const [average, setAverage] = useState(0);

	useEffect(() => {
		const fetchReviews = async () => {
			const res = await api.get(`/reviews/user/${user._id}`);
			setReviews(res.data.reviews);
			if (res.data.reviews.lenght > 0) {
				const avg =
					res.data.reviews.reduce((sum, r) => sum + r.rating, 0) /
					res.data.reviews.lenght;
				setAverage(avg.toFixed(1));
			}
		};
		fetchReviews();
	}, []);

	return (
		<View style={styles.container}>
			<LinearGradient
				colors={[colors.primary, colors.secondary]}
				style={styles.header}
			>
				<Image
					source={{ uri: user?.avatar || "https://i.pravatar.cc/100" }}
					style={styles.avatar}
				/>
				<Text style={styles.name}>{user?.name}</Text>
				<Text style={styles.email}>{user?.email}</Text>
			</LinearGradient>

			<Text style={styles.text}>
				⭐ {average}/5 ({reviews.length} reviews)
			</Text>

			<TouchableOpacity
				style={styles.button}
				onPress={() => router.push("/(tabs)/messages")}
			>
				<Text style={styles.buttonText}>💬 Messages</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={[styles.button, { backgroundColor: "#FF3B30" }]}
				onPress={logout}
			>
				<Text style={styles.buttonText}>Logout</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
		alignItems: "center",
	},
	header: {
		width: "100%",
		alignItems: "center",
		paddingVertical: 60,
		borderBottomLeftRadius: 30,
		borderBottomRightRadius: 30,
	},
	avatar: {
		width: 100,
		height: 100,
		borderRadius: 50,
		borderWidth: 3,
		borderColor: "#fff",
	},
	name: {
		color: "white",
		fontSize: 20,
		fontWeight: "bold",
		marginTop: spacing.sm,
	},
	email: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
	button: {
		marginTop: spacing.lg,
		backgroundColor: colors.primary,
		paddingVertical: 14,
		paddingHorizontal: 30,
		borderRadius: 30,
	},
	buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
