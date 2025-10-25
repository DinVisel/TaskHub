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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import api from "../../api/api";
import { colors, spacing, fonts } from "../../theme.js";
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
				<Text style={styles.headerTitle}>Find a Job</Text>
				<TextInput
					placeholder='Search tasks...'
					value={search}
					onChangeText={setSearch}
					onSubmitEditing={handleSearch}
					style={styles.searchBar}
				/>
			</LinearGradient>

			<StatusBar barStyle='dark-content' />
			{/* Animated Header */}
			<Animated.View style={[styles.header, { height: headerHeight }]}>
				<Animated.Text style={[styles.headerTitle, { fontSize: headerFontSize }]}>
					TaskHub
				</Animated.Text>
				<Text style={styles.greeting}>
					{user?.name
						? `Welcome back, ${user.name.split(" ")[0]}!`
						: "Welcome back!"}
				</Text>
				<Text style={styles.subHeader}>
					{radiusKm
						? `Showing jobs within ${radiusKm} km of your preferred location`
						: "Find local help or offer your skills"}
				</Text>
			</Animated.View>

			{/* Categories */}
			<Animated.View style={styles.categories}>
				{availableCategories.map((cat) => (
					<TouchableOpacity
						key={cat}
						style={[
							styles.category,
							selectedCategory === cat && styles.categoryActive,
						]}
						onPress={() => setSelectedCategory(cat)}
					>
						<Text
							style={{
								color: selectedCategory === cat ? "#fff" : colors.text,
								fontWeight: "600",
							}}
						>
							{cat}
						</Text>
					</TouchableOpacity>
				))}
			</Animated.View>

			{/* Scrollable Content */}
			{error ? (
				<View style={styles.messageContainer}>
					<Text style={styles.errorText}>{error}</Text>
				</View>
			) : (
				<Animated.FlatList
					style={{ flex: 1 }}
					data={tasks}
					keyExtractor={(item) => item._id}
					contentContainerStyle={{ padding: spacing.md }}
					ListEmptyComponent={
						!loadingTasks ? (
							<View style={styles.messageContainer}>
								<Text style={styles.emptyText}>
									{loadingPreferences
										? "Loading your preferences..."
										: "No tasks match your preferences yet."}
								</Text>
							</View>
						) : null
					}
					renderItem={({ item }) => {
						const cityName =
							item?.location?.address?.trim() ||
							item?.location?.city?.trim() ||
							"Unknown";

						return (
							<TouchableOpacity
								onPress={() => router.push(`/chat/${item._id}`)}
								style={styles.card}
							>
								<View style={styles.row}>
									<Image
										source={{
											uri: item.ownerAvatar || "https://i.pravatar.cc/80",
										}}
										style={styles.avatar}
									/>
									<View style={{ flex: 1 }}>
										<Text style={styles.title}>{item.title}</Text>
										<Text style={styles.subtitle}>{item.category || "General"}</Text>
										<Image
											source={{ uri: item.image }}
											style={{
												width: "100%",
												height: 180,
												borderRadius: 12,
												marginBottom: 8,
											}}
										/>
									</View>
								</View>
								<Text style={styles.desc} numberOfLines={2}>
									{item.description}
								</Text>
								<Text style={styles.city}>{cityName}</Text>
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
	greeting: {
		color: "rgba(255,255,255,0.95)",
		marginTop: 4,
		fontSize: 16,
	},
	searchBar: {
		backgroundColor: "rgba(255,255,255,0.9)",
		width: "90%",
		borderRadius: 12,
		marginTop: spacing.md,
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.xs,
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
	categories: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		marginVertical: 10,
	},
	category: {
		borderRadius: 20,
		borderWidth: 1,
		borderColor: colors.primary,
		paddingHorizontal: 14,
		paddingVertical: 6,
		margin: 4,
	},
	categoryActive: {
		backgroundColor: colors.primary,
	},
	categoryTag: { color: colors.primary, marginBottom: 4 },
	city: { color: "#666", fontSize: 12 },
	messageContainer: {
		padding: spacing.lg,
		alignItems: "center",
	},
	emptyText: {
		color: colors.subtext,
		textAlign: "center",
	},
	errorText: {
		color: "#ff6b6b",
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
