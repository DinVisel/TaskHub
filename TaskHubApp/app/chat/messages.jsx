import React, { useCallback, useEffect, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	FlatList,
	StyleSheet,
	ActivityIndicator,
	Image,
	StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import api from "../../api/api";
import { colors, spacing, fonts, radii, shadow } from "../../theme";

const FALLBACK_AVATAR_URL = "https://i.pravatar.cc/100";

export default function Messages() {
	const [threads, setThreads] = useState([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	const fetchThreads = useCallback(async () => {
		try {
			const res = await api.get("/messages/overview");
			setThreads(res.data.threads || []);
		} catch (err) {
			console.log("Error loading messages:", err.message);
		}
	}, []);

	useEffect(() => {
		const loadThreads = async () => {
			setLoading(true);
			await fetchThreads();
			setLoading(false);
		};

		loadThreads();
	}, [fetchThreads]);

	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		await fetchThreads();
		setRefreshing(false);
	}, [fetchThreads]);

	const renderItem = ({ item }) => {
		const avatarUrl = item.otherUserAvatar?.startsWith("http")
			? item.otherUserAvatar
			: `${FALLBACK_AVATAR_URL}?u=${encodeURIComponent(item.otherUserName || "User")}`;

		return (
			<TouchableOpacity
				style={styles.threadCard}
				onPress={() => router.push(`/chat/${item.taskId}`)}
				activeOpacity={0.7}
			>
				<Image source={{ uri: avatarUrl }} style={styles.avatar} />
				<View style={styles.threadContent}>
					<View style={styles.threadHeader}>
						<Text style={styles.userName} numberOfLines={1}>
							{item.otherUserName || "Unknown User"}
						</Text>
						{item.lastMessageAt && (
							<Text style={styles.timestamp}>
								{new Date(item.lastMessageAt).toLocaleDateString(undefined, {
									month: "short",
									day: "numeric",
								})}
							</Text>
						)}
					</View>
					<Text style={styles.taskTitle} numberOfLines={1}>
						{item.taskTitle}
					</Text>
					<Text style={styles.preview} numberOfLines={2}>
						{item.lastMessage || "No messages yet"}
					</Text>
				</View>
				<Ionicons name='chevron-forward' size={20} color={colors.subtext} />
			</TouchableOpacity>
		);
	};

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle='light-content' />
			<LinearGradient
				colors={[colors.primary, colors.secondary]}
				style={styles.header}
			>
				<Text style={styles.headerTitle}>Messages</Text>
				<Text style={styles.headerSubtitle}>Your conversations</Text>
			</LinearGradient>

			{loading ? (
				<View style={styles.center}>
					<ActivityIndicator size='large' color={colors.primary} />
				</View>
			) : (
				<FlatList
					data={threads}
					keyExtractor={(item) => item.taskId}
					refreshing={refreshing}
					onRefresh={handleRefresh}
					contentContainerStyle={styles.listContent}
					renderItem={renderItem}
					ListEmptyComponent={
						<View style={styles.emptyState}>
							<View style={styles.emptyIconBg}>
								<Ionicons
									name='chatbubbles-outline'
									size={48}
									color={colors.primary}
								/>
							</View>
							<Text style={styles.emptyTitle}>No messages yet</Text>
							<Text style={styles.emptySubtitle}>
								When you contact a tasker or someone contacts you, your chats will
								appear here.
							</Text>
						</View>
					}
				/>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
	},
	header: {
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.lg,
		paddingBottom: spacing.xl,
		borderBottomLeftRadius: radii.xl,
		borderBottomRightRadius: radii.xl,
	},
	headerTitle: {
		color: colors.surface,
		fontSize: fonts.title,
		fontWeight: "700",
	},
	headerSubtitle: {
		color: "rgba(255,255,255,0.8)",
		fontSize: fonts.body,
		marginTop: spacing.xs,
	},
	center: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	listContent: {
		padding: spacing.md,
		paddingTop: spacing.lg,
		gap: spacing.md,
	},
	threadCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: colors.surface,
		padding: spacing.md,
		borderRadius: radii.lg,
		...shadow.card,
	},
	avatar: {
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: colors.border,
	},
	threadContent: {
		flex: 1,
		marginLeft: spacing.md,
		marginRight: spacing.sm,
	},
	threadHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 2,
	},
	userName: {
		fontSize: fonts.body,
		fontWeight: "700",
		color: colors.text,
		flex: 1,
	},
	timestamp: {
		fontSize: fonts.caption,
		color: colors.subtext,
	},
	taskTitle: {
		fontSize: fonts.caption,
		color: colors.primary,
		fontWeight: "600",
		marginBottom: 2,
	},
	preview: {
		fontSize: fonts.body,
		color: colors.subtext,
		lineHeight: 20,
	},
	emptyState: {
		alignItems: "center",
		justifyContent: "center",
		padding: spacing.xl,
		marginTop: spacing.xl * 2,
	},
	emptyIconBg: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: "rgba(37, 99, 235, 0.1)",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: spacing.lg,
	},
	emptyTitle: {
		fontSize: fonts.subtitle,
		fontWeight: "700",
		color: colors.text,
		marginBottom: spacing.sm,
	},
	emptySubtitle: {
		textAlign: "center",
		color: colors.subtext,
		lineHeight: 22,
		paddingHorizontal: spacing.lg,
	},
});
