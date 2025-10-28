import React, { useContext, useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	Image,
	TouchableOpacity,
	ScrollView,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, fonts, radii, shadow } from "@/theme";
import api from "@/api/api";

export default function Account() {
	const { user, logout } = useContext(AuthContext);
	const [reviews, setReviews] = useState([]);
	const [average, setAverage] = useState(0);
	const [balance, setBalance] = useState(null);

	useEffect(() => {
		if (!user?._id) return;

		const fetchReviews = async () => {
			try {
				const res = await api.get(`/reviews/user/${user._id}`);
				const fetchedReviews = res.data.reviews || [];
				setReviews(fetchedReviews);

				if (fetchedReviews.length > 0) {
					const total = fetchedReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
					const avg = total / fetchedReviews.length;
					setAverage(avg.toFixed(1));
				} else {
					setAverage("0.0");
				}
			} catch (err) {
				console.log("Failed to load reviews:", err.message);
			}
		};

		fetchReviews();
	}, [user?._id]);

	useEffect(() => {
		if (!user?._id) return;

		const fetchWallet = async () => {
			try {
				const res = await api.get("/wallet");
				setBalance(res.data?.walletBalance ?? 0);
			} catch (err) {
				console.log("Failed to load wallet:", err.message);
			}
		};

		fetchWallet();
	}, [user?._id]);

	return (
		<SafeAreaView style={styles.safeArea}>
			<ScrollView contentContainerStyle={styles.content}>
				<LinearGradient
					colors={[colors.primary, colors.secondary]}
					style={styles.header}
				>
					<Image
						source={{ uri: user?.avatar || "https://i.pravatar.cc/150" }}
						style={styles.avatar}
					/>
					<Text style={styles.name}>{user?.name}</Text>
					<Text style={styles.email}>{user?.email}</Text>
				</LinearGradient>

				<View style={styles.main}>
					<TouchableOpacity
						activeOpacity={0.85}
						onPress={() => router.push("/wallet")}
						style={styles.balanceWrapper}
					>
						<LinearGradient
							colors={[colors.primary, colors.secondary]}
							style={styles.balanceCard}
						>
							<Text style={styles.balanceLabel}>Wallet balance</Text>
							<Text style={styles.balanceValue}>
								{balance !== null ? `${balance.toFixed(2)} ₺` : "Tap to view"}
							</Text>
							<Text style={styles.balanceHint}>
								Tap to open your wallet and manage funds.
							</Text>
						</LinearGradient>
					</TouchableOpacity>

					<View style={styles.card}>
						<Text style={styles.cardLabel}>Reputation</Text>
						<Text style={styles.cardValue}>⭐ {average}/5</Text>
						<Text style={styles.cardCaption}>
							{reviews.length} review{reviews.length === 1 ? "" : "s"}
						</Text>
					</View>

					<View style={styles.actions}>
						<TouchableOpacity
							style={styles.actionButton}
							onPress={() => router.push("/edit-profile")}
						>
							<Text style={styles.actionText}>✏️ Edit profile</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.actionButton}
							onPress={() => router.push("/chat/messages")}
						>
							<Text style={styles.actionText}>💬 Messages</Text>
						</TouchableOpacity>

						{user?.role === "admin" && (
							<TouchableOpacity
								style={[styles.actionButton, styles.adminButton]}
								onPress={() => router.push("/admin-panel")}
							>
								<Text style={styles.actionText}>🛠️ Admin panel</Text>
							</TouchableOpacity>
						)}

						<TouchableOpacity
							style={[styles.actionButton, styles.logoutButton]}
							onPress={() => {
								logout();
								router.replace("/login");
							}}
						>
							<Text style={styles.actionText}>Logout</Text>
						</TouchableOpacity>
					</View>
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
		flexGrow: 1,
		backgroundColor: colors.background,
		alignItems: "center",
		paddingBottom: spacing.xl,
	},
	header: {
		width: "100%",
		alignItems: "center",
		paddingVertical: spacing.xl + spacing.sm,
		paddingHorizontal: spacing.lg,
		borderBottomLeftRadius: radii.lg,
		borderBottomRightRadius: radii.lg,
	},
	avatar: {
		width: 110,
		height: 110,
		borderRadius: 55,
		borderWidth: 3,
		borderColor: "#fff",
	},
	name: {
		color: "white",
		fontSize: fonts.title,
		fontWeight: "bold",
		marginTop: spacing.sm,
	},
	email: {
		color: "rgba(255,255,255,0.85)",
		fontSize: fonts.body,
		marginTop: spacing.xs,
	},
	main: {
		width: "100%",
		paddingHorizontal: spacing.lg,
		gap: spacing.lg,
		marginTop: -spacing.lg,
	},
	balanceWrapper: {
		borderRadius: radii.lg,
		overflow: "hidden",
		...shadow.card,
	},
	balanceCard: {
		padding: spacing.lg,
	},
	balanceLabel: {
		color: "rgba(255,255,255,0.9)",
		fontSize: fonts.caption,
		textTransform: "uppercase",
		letterSpacing: 1,
	},
	balanceValue: {
		marginTop: spacing.sm,
		color: colors.surface,
		fontSize: 36,
		fontWeight: "700",
	},
	balanceHint: {
		marginTop: spacing.md,
		color: "rgba(255,255,255,0.85)",
		fontSize: fonts.body,
		lineHeight: 22,
	},
	card: {
		backgroundColor: colors.surface,
		borderRadius: radii.lg,
		padding: spacing.lg,
		...shadow.card,
		gap: spacing.sm,
	},
	cardLabel: {
		color: colors.subtext,
		fontSize: fonts.caption,
		textTransform: "uppercase",
		letterSpacing: 1,
	},
	cardValue: {
		color: colors.text,
		fontSize: fonts.title,
		fontWeight: "700",
	},
	cardCaption: {
		color: colors.subtext,
		fontSize: fonts.body,
	},
	actions: {
		gap: spacing.md,
	},
	actionButton: {
		backgroundColor: colors.primary,
		borderRadius: radii.pill,
		paddingVertical: spacing.md / 1.25,
		alignItems: "center",
	},
	adminButton: {
		backgroundColor: colors.secondary,
	},
	logoutButton: {
		backgroundColor: colors.danger,
	},
	actionText: {
		color: colors.surface,
		fontWeight: "700",
		fontSize: fonts.body,
	},
});
