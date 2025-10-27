import React, {
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	ActivityIndicator,
	Animated,
	View,
	Text,
	StyleSheet,
	StatusBar,
	TouchableOpacity,
	TextInput,
	Image,
	ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "../../api/api";
import { colors, spacing, fonts, radii } from "../../theme.js";
import { AuthContext } from "../../context/AuthContext";

const FALLBACK_CATEGORIES = [
	"Cleaning",
	"Repair",
	"Programming",
	"Tutoring",
	"Delivery",
];

export default function Home() {
	const [tasks, setTasks] = useState([]);
	const [search, setSearch] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [availableCategories, setAvailableCategories] = useState([
		"All",
		...FALLBACK_CATEGORIES,
	]);
	const [radiusKm, setRadiusKm] = useState(null);
	const [loadingPreferences, setLoadingPreferences] = useState(true);
	const [loadingTasks, setLoadingTasks] = useState(false);
	const [error, setError] = useState(null);

	const { user } = useContext(AuthContext);

	const scrollY = useRef(new Animated.Value(0)).current;

	const fetchCategoryTasks = useCallback(
		async (categoryOverride = selectedCategory, searchOverride = search) => {
			setLoadingTasks(true);
			setError(null);
			try {
				const params = {};
				if (searchOverride) params.search = searchOverride;
				if (categoryOverride && categoryOverride !== "All") {
					params.category = categoryOverride;
				}

				const res = await api.get("/tasks", { params });
				setTasks(res.data.tasks);
			} catch (err) {
				console.log("Error fetching category tasks:", err.message);
				setError("We couldn't load tasks right now. Please try again later.");
			} finally {
				setLoadingTasks(false);
			}
		},
		[search, selectedCategory]
	);

	const fetchRecommendedTasks = useCallback(async () => {
		setLoadingTasks(true);
		setError(null);
		try {
			const res = await api.get("/match");
			if (Array.isArray(res.data?.tasks) && res.data.tasks.length) {
				setTasks(res.data.tasks);
				return;
			}
			await fetchCategoryTasks("All");
		} catch (err) {
			console.log("Error fetching recommended tasks:", err.message);
			await fetchCategoryTasks("All");
		} finally {
			setLoadingTasks(false);
		}
	}, [fetchCategoryTasks]);

	const loadPreferences = useCallback(async () => {
		setLoadingPreferences(true);
		try {
			const res = await api.get("/users/preferences");
			const prefCategories = res.data?.categories || [];
			const uniquePrefCategories = prefCategories.filter(Boolean);

			if (uniquePrefCategories.length) {
				setAvailableCategories(["All", ...uniquePrefCategories]);
				setSelectedCategory(uniquePrefCategories[0]);
			} else {
				setAvailableCategories(["All", ...FALLBACK_CATEGORIES]);
				setSelectedCategory("All");
			}

			if (typeof res.data?.radiusKm === "number") {
				setRadiusKm(res.data.radiusKm);
			} else {
				setRadiusKm(null);
			}

			await fetchRecommendedTasks();
		} catch (err) {
			console.log("Error loading preferences:", err.message);
			setAvailableCategories(["All", ...FALLBACK_CATEGORIES]);
			setSelectedCategory("All");
			await fetchCategoryTasks("All");
		} finally {
			setLoadingPreferences(false);
		}
	}, [fetchCategoryTasks, fetchRecommendedTasks]);

	useEffect(() => {
		loadPreferences();
	}, [loadPreferences]);

	useEffect(() => {
		if (!loadingPreferences && selectedCategory !== "All") {
			fetchCategoryTasks(selectedCategory);
		}
	}, [selectedCategory, loadingPreferences, fetchCategoryTasks]);

	const handleSearch = () => {
		if (selectedCategory === "All") {
			fetchCategoryTasks("All", search);
		} else {
			fetchCategoryTasks(selectedCategory, search);
		}
	};

	const condensedHeaderOpacity = scrollY.interpolate({
		inputRange: [80, 140],
		outputRange: [0, 1],
		extrapolate: "clamp",
	});

	const handlePostTask = () => {
		router.push("/(tabs)/post-task");
	};

	const handlePreferences = () => {
		router.push("/preferences");
	};

	const handleAccount = () => {
		router.push("/(tabs)/account");
	};

	const onScroll = Animated.event(
		[{ nativeEvent: { contentOffset: { y: scrollY } } }],
		{ useNativeDriver: false }
	);

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle='light-content' />
			<Animated.View
				pointerEvents='none'
				style={[styles.condensedHeader, { opacity: condensedHeaderOpacity }]}
			>
				<Text style={styles.condensedTitle}>TaskHub</Text>
				<Text style={styles.condensedSubtitle}>Curated gigs near you</Text>
			</Animated.View>

			{error ? (
				<View style={styles.messageContainer}>
					<Text style={styles.errorText}>{error}</Text>
				</View>
			) : (
				<Animated.FlatList
					data={tasks}
					keyExtractor={(item) => item._id}
					onScroll={onScroll}
					scrollEventThrottle={16}
					contentContainerStyle={styles.listContent}
					ListHeaderComponent={
						<View>
							<LinearGradient
								colors={[colors.primary, colors.secondary]}
								style={styles.hero}
							>
								<View style={styles.heroTopRow}>
									<View style={{ flex: 1 }}>
										<Text style={styles.heroEyebrow}>TaskHub</Text>
										<Text style={styles.heroTitle}>
											{user?.name
												? `Welcome back, ${user.name.split(" ")[0]}`
												: "Discover new gigs"}
										</Text>
										<Text style={styles.heroSubtitle}>
											{radiusKm
												? `Matching tasks within ${radiusKm} km of you`
												: "Curated jobs that fit your skills"}
										</Text>
									</View>
									<TouchableOpacity style={styles.avatarButton} onPress={handleAccount}>
										<Ionicons name='person-circle-outline' size={36} color='#fff' />
									</TouchableOpacity>
								</View>

								<View style={styles.searchContainer}>
									<Ionicons
										name='search'
										size={18}
										color={colors.subtext}
										style={{ marginRight: spacing.sm }}
									/>
									<TextInput
										placeholder='Search jobs, services or skills'
										placeholderTextColor={"rgba(15, 23, 42, 0.4)"}
										value={search}
										onChangeText={setSearch}
										onSubmitEditing={handleSearch}
										style={styles.searchBar}
									/>
									<TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
										<Ionicons name='arrow-forward' size={20} color='#fff' />
									</TouchableOpacity>
								</View>

								<View style={styles.heroStatsRow}>
									<View style={styles.statCard}>
										<Text style={styles.statLabel}>Matches</Text>
										<Text style={styles.statValue}>{tasks.length || "--"}</Text>
										<Text style={styles.statHint}>active opportunities</Text>
									</View>
									<View style={styles.statCard}>
										<Text style={styles.statLabel}>Radius</Text>
										<Text style={styles.statValue}>
											{radiusKm ? `${radiusKm} km` : "Worldwide"}
										</Text>
										<Text style={styles.statHint}>preference range</Text>
									</View>
								</View>
							</LinearGradient>

							<View style={styles.quickActionsWrapper}>
								<TouchableOpacity style={styles.quickAction} onPress={handlePostTask}>
									<View style={styles.quickIconWrap}>
										<Ionicons name='flash' size={18} color={colors.primary} />
									</View>
									<View style={{ flex: 1 }}>
										<Text style={styles.quickTitle}>Post a task</Text>
										<Text style={styles.quickSubtitle}>
											Reach top-rated helpers instantly
										</Text>
									</View>
									<Ionicons name='chevron-forward' size={18} color={colors.subtext} />
								</TouchableOpacity>

								<TouchableOpacity
									style={styles.quickAction}
									onPress={handlePreferences}
								>
									<View style={styles.quickIconWrap}>
										<Ionicons name='options' size={18} color={colors.primary} />
									</View>
									<View style={{ flex: 1 }}>
										<Text style={styles.quickTitle}>Tune your matches</Text>
										<Text style={styles.quickSubtitle}>Update categories & radius</Text>
									</View>
									<Ionicons name='chevron-forward' size={18} color={colors.subtext} />
								</TouchableOpacity>
							</View>

							<View style={styles.categoriesSection}>
								<View style={styles.sectionHeader}>
									<Text style={styles.sectionTitle}>Browse by category</Text>
									<Text style={styles.sectionHint}>Tailored for what you do best</Text>
								</View>
								<ScrollView
									horizontal
									showsHorizontalScrollIndicator={false}
									contentContainerStyle={styles.categoryPills}
								>
									{availableCategories.map((cat) => {
										const isActive = selectedCategory === cat;
										return (
											<TouchableOpacity
												key={cat}
												style={[styles.categoryPill, isActive && styles.categoryPillActive]}
												onPress={() => setSelectedCategory(cat)}
											>
												<Text
													style={[
														styles.categoryPillText,
														isActive && styles.categoryPillTextActive,
													]}
												>
													{cat}
												</Text>
											</TouchableOpacity>
										);
									})}
								</ScrollView>
							</View>

							<View style={styles.sectionHeader}>
								<Text style={styles.sectionTitle}>Recommended for you</Text>
								<Text style={styles.sectionHint}>
									{selectedCategory === "All"
										? "Smart suggestions based on your activity"
										: `Fresh opportunities in ${selectedCategory}`}
								</Text>
							</View>
						</View>
					}
					ListEmptyComponent={
						!loadingTasks ? (
							<View style={styles.emptyState}>
								<Ionicons name='sparkles-outline' size={42} color={colors.primary} />
								<Text style={styles.emptyTitle}>No matches just yet</Text>
								<Text style={styles.emptySubtitle}>
									{loadingPreferences
										? "Loading your personalised feed..."
										: "Try exploring a different category or widening your radius."}
								</Text>
							</View>
						) : null
					}
					renderItem={({ item }) => {
						const cityName =
							item?.location?.address?.trim() ||
							item?.location?.city?.trim() ||
							"Unknown";
						const coverImage =
							item?.image && item.image.startsWith("http")
								? { uri: item.image }
								: {
										uri: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=60",
								  };

						return (
							<TouchableOpacity
								onPress={() => router.push(`/chat/${item._id}`)}
								style={styles.card}
								activeOpacity={0.9}
							>
								<Image source={coverImage} style={styles.cardImage} />
								<View style={styles.cardBody}>
									<View style={styles.cardHeader}>
										<View>
											<Text style={styles.title}>{item.title}</Text>
											<View style={styles.badge}>
												<Ionicons name='pricetag' size={12} color={colors.accent} />
												<Text style={styles.badgeText}>{item.category || "General"}</Text>
											</View>
										</View>
										<View style={styles.avatarWrapper}>
											<Image
												source={{
													uri:
														item.ownerAvatar && item.ownerAvatar.startsWith("http")
															? item.ownerAvatar
															: "https://i.pravatar.cc/100",
												}}
												style={styles.avatar}
											/>
										</View>
									</View>
									<Text style={styles.desc} numberOfLines={2}>
										{item.description ||
											"Tap to see more details about this opportunity."}
									</Text>
									<View style={styles.cardFooter}>
										<View style={styles.footerLeft}>
											<Ionicons name='location-outline' size={16} color={colors.subtext} />
											<Text style={styles.city}>{cityName}</Text>
										</View>
										{item?.budget?.amount ? (
											<View style={styles.priceTag}>
												<Text style={styles.priceText}>
													{`${item.budget.amount} ${item.budget.currency || "USD"}`}
												</Text>
											</View>
										) : null}
									</View>
								</View>
							</TouchableOpacity>
						);
					}}
				/>
			)}

			{(loadingPreferences || loadingTasks) && (
				<View style={styles.loadingOverlay}>
					<ActivityIndicator size='large' color={colors.primary} />
				</View>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
		position: "relative",
	},
	listContent: {
		paddingBottom: spacing.xl * 2,
		paddingHorizontal: spacing.md,
	},
	condensedHeader: {
		position: "absolute",
		top: spacing.lg,
		left: spacing.lg,
		right: spacing.lg,
		paddingVertical: spacing.sm,
		paddingHorizontal: spacing.md,
		borderRadius: 16,
		backgroundColor: "rgba(15, 23, 42, 0.92)",
		zIndex: 10,
	},
	condensedTitle: {
		color: "#fff",
		fontSize: fonts.subtitle,
		fontWeight: "600",
	},
	condensedSubtitle: {
		color: "rgba(255,255,255,0.7)",
		fontSize: fonts.caption,
		marginTop: 2,
	},
	hero: {
		borderRadius: 24,
		padding: spacing.lg,
		marginTop: spacing.lg,
		shadowColor: "rgba(15, 23, 42, 0.25)",
		shadowOffset: { width: 0, height: 16 },
		shadowOpacity: 0.25,
		shadowRadius: 40,
		elevation: 12,
	},
	heroTopRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: spacing.lg,
	},
	heroEyebrow: {
		color: "rgba(255,255,255,0.7)",
		fontSize: fonts.caption,
		fontWeight: "600",
		textTransform: "uppercase",
		letterSpacing: 1,
	},
	heroTitle: {
		color: "#fff",
		fontSize: 28,
		fontWeight: "700",
		marginTop: spacing.xs,
	},
	heroSubtitle: {
		color: "rgba(255,255,255,0.85)",
		fontSize: fonts.body,
		marginTop: spacing.sm,
	},
	avatarButton: {
		width: 44,
		height: 44,
		borderRadius: 22,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "rgba(255,255,255,0.18)",
	},
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "rgba(255,255,255,0.95)",
		borderRadius: radii.lg,
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.sm,
	},
	searchBar: {
		flex: 1,
		color: colors.text,
		fontSize: fonts.body,
	},
	searchButton: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: colors.accent,
		alignItems: "center",
		justifyContent: "center",
		marginLeft: spacing.sm,
	},
	heroStatsRow: {
		flexDirection: "row",
		marginTop: spacing.lg,
		gap: spacing.md,
	},
	statCard: {
		flex: 1,
		backgroundColor: "rgba(255,255,255,0.14)",
		borderRadius: 18,
		padding: spacing.md,
	},
	statLabel: {
		color: "rgba(255,255,255,0.9)",
		fontSize: fonts.caption,
		textTransform: "uppercase",
		letterSpacing: 1,
	},
	statValue: {
		color: "#fff",
		fontSize: 24,
		fontWeight: "700",
		marginTop: spacing.xs,
	},
	statHint: {
		color: "rgba(255,255,255,0.75)",
		marginTop: spacing.xs,
	},
	quickActionsWrapper: {
		marginTop: spacing.lg,
		gap: spacing.sm,
	},
	quickAction: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: colors.surface,
		borderRadius: radii.lg,
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.md,
		shadowColor: "rgba(15, 23, 42, 0.08)",
		shadowOffset: { width: 0, height: 12 },
		shadowOpacity: 1,
		shadowRadius: 24,
		elevation: 6,
	},
	quickIconWrap: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: "rgba(37, 99, 235, 0.08)",
		alignItems: "center",
		justifyContent: "center",
		marginRight: spacing.md,
	},
	quickTitle: {
		fontSize: fonts.subtitle,
		fontWeight: "600",
		color: colors.text,
	},
	quickSubtitle: {
		fontSize: fonts.caption,
		color: colors.subtext,
		marginTop: 2,
	},
	categoriesSection: {
		marginTop: spacing.lg,
	},
	sectionHeader: {
		marginBottom: spacing.sm,
	},
	sectionTitle: {
		fontSize: fonts.subtitle,
		fontWeight: "700",
		color: colors.text,
	},
	sectionHint: {
		fontSize: fonts.caption,
		color: colors.subtext,
		marginTop: 4,
	},
	categoryPills: {
		paddingVertical: spacing.xs,
		gap: spacing.sm,
	},
	categoryPill: {
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.sm,
		borderRadius: 999,
		backgroundColor: "rgba(15, 23, 42, 0.05)",
	},
	categoryPillActive: {
		backgroundColor: colors.primary,
	},
	categoryPillText: {
		color: colors.subtext,
		fontWeight: "600",
	},
	categoryPillTextActive: {
		color: "#fff",
	},
	card: {
		backgroundColor: colors.surface,
		borderRadius: 24,
		marginBottom: spacing.lg,
		overflow: "hidden",
		shadowColor: "rgba(15, 23, 42, 0.12)",
		shadowOffset: { width: 0, height: 16 },
		shadowOpacity: 1,
		shadowRadius: 32,
		elevation: 10,
	},
	cardImage: {
		width: "100%",
		height: 180,
	},
	cardBody: {
		padding: spacing.md,
		gap: spacing.sm,
	},
	cardHeader: {
		flexDirection: "row",
		alignItems: "flex-start",
		justifyContent: "space-between",
	},
	title: {
		fontSize: fonts.subtitle + 2,
		fontWeight: "700",
		color: colors.text,
	},
	badge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		marginTop: spacing.xs,
	},
	badgeText: {
		color: colors.accent,
		fontWeight: "600",
	},
	avatarWrapper: {
		marginLeft: spacing.md,
		padding: 3,
		borderRadius: 28,
		backgroundColor: "rgba(15, 23, 42, 0.06)",
		borderWidth: 1,
		borderColor: "rgba(15, 23, 42, 0.08)",
	},
	avatar: {
		width: 42,
		height: 42,
		borderRadius: 21,
	},
	desc: {
		color: colors.subtext,
		lineHeight: 20,
	},
	cardFooter: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	footerLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	city: {
		color: colors.subtext,
		fontSize: fonts.caption,
	},
	priceTag: {
		backgroundColor: "rgba(37, 99, 235, 0.12)",
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.xs,
		borderRadius: 999,
	},
	priceText: {
		color: colors.primary,
		fontWeight: "700",
	},
	emptyState: {
		marginTop: spacing.lg,
		padding: spacing.lg,
		alignItems: "center",
		gap: spacing.md,
	},
	emptyTitle: {
		fontSize: fonts.subtitle,
		fontWeight: "600",
		color: colors.text,
	},
	emptySubtitle: {
		textAlign: "center",
		color: colors.subtext,
		lineHeight: 20,
	},
	messageContainer: {
		padding: spacing.lg,
		alignItems: "center",
	},
	errorText: {
		color: colors.danger,
		textAlign: "center",
	},
	loadingOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(255,255,255,0.6)",
	},
});
