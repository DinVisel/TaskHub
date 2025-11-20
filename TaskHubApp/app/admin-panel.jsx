import React, { useCallback, useEffect, useState } from "react";
import {
	View,
	Text,
	ScrollView,
	Alert,
	ActivityIndicator,
	StyleSheet,
	TouchableOpacity,
	RefreshControl,
	TextInput,
	Modal,
	FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { PieChart } from "react-native-chart-kit";
import api from "../api/api";
import { colors, spacing, fonts, radii, shadow } from "../theme";
import RoleBadge from "../components/admin/RoleBadge";
import TrustScoreIndicator from "../components/admin/TrustScoreIndicator";
import AnalyticsCard from "../components/admin/AnalyticsCard";
import SecurityLogCard from "../components/admin/SecurityLogCard";

const TABS = [
	{ id: "dashboard", label: "Dashboard", icon: "📊" },
	{ id: "users", label: "Users", icon: "👥" },
	{ id: "tasks", label: "Tasks", icon: "📋" },
	{ id: "security", label: "Security", icon: "🔒" },
	{ id: "reviews", label: "Reviews", icon: "⭐" },
];

const ROLE_OPTIONS = ["USER", "VERIFIED_USER", "PRO_USER", "FLAGGED_USER", "ADMIN"];

export default function AdminPanel() {
	const [activeTab, setActiveTab] = useState("dashboard");
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	// Data states
	const [analytics, setAnalytics] = useState(null);
	const [users, setUsers] = useState([]);
	const [tasks, setTasks] = useState([]);
	const [reviews, setReviews] = useState([]);
	const [flaggedUsers, setFlaggedUsers] = useState([]);
	const [riskyJobs, setRiskyJobs] = useState([]);
	const [securityLogs, setSecurityLogs] = useState([]);

	// Filter states
	const [userSearch, setUserSearch] = useState("");
	const [roleFilter, setRoleFilter] = useState("ALL");
	const [taskFilter, setTaskFilter] = useState("ALL");
	const [securitySection, setSecuritySection] = useState("flagged");
	const [logType, setLogType] = useState("ALL");

	// Modal states
	const [roleModalVisible, setRoleModalVisible] = useState(false);
	const [trustModalVisible, setTrustModalVisible] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const [trustAdjustment, setTrustAdjustment] = useState(0);
	const [trustReason, setTrustReason] = useState("");

	const fetchData = useCallback(async () => {
		try {
			const [analyticsRes, usersRes, tasksRes, reviewsRes] = await Promise.all([
				api.get("/admin/analytics"),
				api.get("/admin/users"),
				api.get("/admin/tasks"),
				api.get("/admin/reviews"),
			]);
			setAnalytics(analyticsRes.data);
			setUsers(usersRes.data);
			setTasks(tasksRes.data);
			setReviews(reviewsRes.data);
		} catch (err) {
			Alert.alert("Error", err.response?.data?.message || "Failed to fetch data");
		} finally {
			setLoading(false);
		}
	}, []);

	const fetchSecurityData = useCallback(async () => {
		try {
			const [flaggedRes, riskyRes, logsRes] = await Promise.all([
				api.get("/admin/security/flagged-users"),
				api.get("/admin/security/risky-jobs"),
				api.get("/admin/security/logs?limit=50"),
			]);
			setFlaggedUsers(flaggedRes.data.users || []);
			setRiskyJobs(riskyRes.data.jobs || []);
			setSecurityLogs(logsRes.data.logs || []);
		} catch (err) {
			Alert.alert("Error", err.response?.data?.message || "Failed to fetch security data");
		}
	}, []);

	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		await fetchData();
		if (activeTab === "security") {
			await fetchSecurityData();
		}
		setRefreshing(false);
	}, [fetchData, fetchSecurityData, activeTab]);

	const deleteUser = async (id) => {
		Alert.alert("Delete User", "Are you sure?", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: async () => {
					try {
						await api.delete(`/admin/users/${id}`);
						setUsers((prev) => prev.filter((u) => u._id !== id));
						Alert.alert("Success", "User deleted");
					} catch (err) {
						Alert.alert("Error", err.response?.data?.message || "Delete failed");
					}
				},
			},
		]);
	};

	const deleteTask = async (id) => {
		Alert.alert("Delete Task", "Are you sure?", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: async () => {
					try {
						await api.delete(`/admin/tasks/${id}`);
						setTasks((prev) => prev.filter((t) => t._id !== id));
						Alert.alert("Success", "Task deleted");
					} catch (err) {
						Alert.alert("Error", err.response?.data?.message || "Delete failed");
					}
				},
			},
		]);
	};

	const changeUserRole = async (userId, newRole) => {
		try {
			await api.patch(`/admin/users/${userId}/role`, { role: newRole });
			setUsers((prev) =>
				prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
			);
			setRoleModalVisible(false);
			Alert.alert("Success", "Role updated");
		} catch (err) {
			Alert.alert("Error", err.response?.data?.message || "Failed to update role");
		}
	};

	const adjustTrustScore = async () => {
		if (!selectedUser || trustAdjustment === 0) return;
		try {
			await api.patch(`/admin/users/${selectedUser._id}/trust-score`, {
				adjustment: trustAdjustment,
				reason: trustReason || "Admin manual adjustment",
			});
			setUsers((prev) =>
				prev.map((u) =>
					u._id === selectedUser._id
						? { ...u, trustScore: (u.trustScore || 0) + trustAdjustment }
						: u
				)
			);
			setTrustModalVisible(false);
			setTrustAdjustment(0);
			setTrustReason("");
			Alert.alert("Success", "Trust score adjusted");
		} catch (err) {
			Alert.alert("Error", err.response?.data?.message || "Failed to adjust trust score");
		}
	};

	const approveJob = async (taskId) => {
		try {
			await api.patch(`/admin/tasks/${taskId}/approve`);
			setTasks((prev) =>
				prev.map((t) =>
					t._id === taskId ? { ...t, requiresAdminApproval: false } : t
				)
			);
			setRiskyJobs((prev) => prev.filter((j) => j._id !== taskId));
			Alert.alert("Success", "Job approved");
		} catch (err) {
			Alert.alert("Error", err.response?.data?.message || "Failed to approve job");
		}
	};

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	useEffect(() => {
		if (activeTab === "security") {
			fetchSecurityData();
		}
	}, [activeTab, fetchSecurityData]);

	if (loading)
		return (
			<View style={styles.center}>
				<ActivityIndicator size="large" color={colors.primary} />
				<Text style={styles.loadingText}>Loading admin dashboard…</Text>
			</View>
		);

	// Dashboard Tab
	const renderDashboard = () => {
		if (!analytics) return null;

		const roleData = [
			{ name: "ADMIN", population: users.filter((u) => u.role === "ADMIN").length, color: "#9333EA", legendFontColor: colors.text },
			{ name: "PRO", population: users.filter((u) => u.role === "PRO_USER").length, color: "#F59E0B", legendFontColor: colors.text },
			{ name: "VERIFIED", population: users.filter((u) => u.role === "VERIFIED_USER").length, color: "#3B82F6", legendFontColor: colors.text },
			{ name: "USER", population: users.filter((u) => u.role === "USER").length, color: "#6B7280", legendFontColor: colors.text },
			{ name: "FLAGGED", population: users.filter((u) => u.role === "FLAGGED_USER").length, color: "#EF4444", legendFontColor: colors.text },
		];

		return (
			<ScrollView
				contentContainerStyle={styles.content}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
			>
				<LinearGradient colors={[colors.primary, colors.secondary]} style={styles.header}>
					<Text style={styles.headerTitle}>Analytics Dashboard</Text>
					<Text style={styles.headerSubtitle}>Real-time system overview</Text>
				</LinearGradient>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Key Metrics</Text>
					<View style={styles.grid}>
						<AnalyticsCard icon="👥" label="Total Users" value={analytics.totalUsers} color={colors.primary} />
						<AnalyticsCard icon="📋" label="Total Tasks" value={analytics.totalTasks} color={colors.accent} />
						<AnalyticsCard icon="✅" label="Completed" value={analytics.completedTasks} color="#10B981" />
						<AnalyticsCard icon="💰" label="Commission" value={`$${analytics.totalCommission.toFixed(2)}`} color="#F59E0B" />
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>User Distribution</Text>
					<View style={[styles.card, shadow.card]}>
						<PieChart
							data={roleData}
							width={320}
							height={200}
							chartConfig={{
								color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
							}}
							accessor="population"
							backgroundColor="transparent"
							paddingLeft="15"
							absolute
						/>
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Security Alerts</Text>
					<View style={[styles.card, shadow.card]}>
						<View style={styles.alertRow}>
							<Text style={styles.alertLabel}>🚩 Flagged Users</Text>
							<Text style={styles.alertValue}>{flaggedUsers.length}</Text>
						</View>
						<View style={styles.alertRow}>
							<Text style={styles.alertLabel}>⚠️ Risky Jobs Pending</Text>
							<Text style={styles.alertValue}>{riskyJobs.length}</Text>
						</View>
					</View>
				</View>
			</ScrollView>
		);
	};

	// Users Tab
	const renderUsers = () => {
		const filteredUsers = users.filter((u) => {
			const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase());
			const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
			return matchesSearch && matchesRole;
		});

		return (
			<View style={{ flex: 1 }}>
				<View style={styles.filterContainer}>
					<TextInput
						style={styles.searchInput}
						placeholder="Search users..."
						placeholderTextColor={colors.subtext}
						value={userSearch}
						onChangeText={setUserSearch}
					/>
					<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
						{["ALL", ...ROLE_OPTIONS].map((role) => (
							<TouchableOpacity
								key={role}
								onPress={() => setRoleFilter(role)}
								style={[styles.filterChip, roleFilter === role && styles.filterChipActive]}
							>
								<Text style={[styles.filterChipText, roleFilter === role && styles.filterChipTextActive]}>
									{role}
								</Text>
							</TouchableOpacity>
						))}
					</ScrollView>
				</View>

				<FlatList
					data={filteredUsers}
					keyExtractor={(u) => u._id}
					contentContainerStyle={styles.content}
					refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
					renderItem={({ item: u }) => (
						<View style={[styles.card, shadow.card]}>
							<View style={styles.userHeader}>
								<View style={{ flex: 1 }}>
									<Text style={styles.itemTitle}>{u.name}</Text>
									<Text style={styles.itemSubtitle}>{u.email}</Text>
								</View>
								<RoleBadge role={u.role} />
							</View>
							<TrustScoreIndicator score={u.trustScore || 0} />
							<View style={styles.userMeta}>
								<Text style={styles.metaText}>IP: {u.lastIp || "N/A"}</Text>
								{u.deviceId && <Text style={styles.metaText}>Device: {u.deviceId.substring(0, 12)}...</Text>}
							</View>
							<View style={styles.actionRow}>
								<TouchableOpacity
									style={[styles.button, styles.buttonPrimary]}
									onPress={() => {
										setSelectedUser(u);
										setRoleModalVisible(true);
									}}
								>
									<Text style={styles.buttonText}>Change Role</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={[styles.button, styles.buttonSecondary]}
									onPress={() => {
										setSelectedUser(u);
										setTrustModalVisible(true);
									}}
								>
									<Text style={styles.buttonText}>Adjust Trust</Text>
								</TouchableOpacity>
								<TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={() => deleteUser(u._id)}>
									<Text style={styles.buttonText}>Delete</Text>
								</TouchableOpacity>
							</View>
						</View>
					)}
				/>
			</View>
		);
	};

	// Tasks Tab
	const renderTasks = () => {
		const filteredTasks = tasks.filter((t) => {
			if (taskFilter === "ALL") return true;
			if (taskFilter === "PENDING") return t.requiresAdminApproval;
			return t.status === taskFilter;
		});

		return (
			<View style={{ flex: 1 }}>
				<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
					{["ALL", "PENDING", "active", "completed"].map((filter) => (
						<TouchableOpacity
							key={filter}
							onPress={() => setTaskFilter(filter)}
							style={[styles.filterChip, taskFilter === filter && styles.filterChipActive]}
						>
							<Text style={[styles.filterChipText, taskFilter === filter && styles.filterChipTextActive]}>
								{filter.toUpperCase()}
							</Text>
						</TouchableOpacity>
					))}
				</ScrollView>

				<FlatList
					data={filteredTasks}
					keyExtractor={(t) => t._id}
					contentContainerStyle={styles.content}
					refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
					renderItem={({ item: t }) => (
						<View style={[styles.card, shadow.card]}>
							<View style={styles.taskHeader}>
								<Text style={styles.itemTitle}>{t.title}</Text>
								{t.requiresAdminApproval && (
									<View style={styles.warningBadge}>
										<Text style={styles.warningText}>APPROVAL NEEDED</Text>
									</View>
								)}
							</View>
							<Text style={styles.itemSubtitle}>{t.category || "General"}</Text>
							<Text style={styles.taskPayment}>💰 ${t.payment}</Text>
							<Text style={styles.taskPoster}>Posted by: {t.postedBy?.name || "Unknown"}</Text>
							<View style={styles.actionRow}>
								{t.requiresAdminApproval && (
									<TouchableOpacity
										style={[styles.button, styles.buttonSuccess]}
										onPress={() => approveJob(t._id)}
									>
										<Text style={styles.buttonText}>Approve</Text>
									</TouchableOpacity>
								)}
								<TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={() => deleteTask(t._id)}>
									<Text style={styles.buttonText}>Delete</Text>
								</TouchableOpacity>
							</View>
						</View>
					)}
				/>
			</View>
		);
	};

	// Security Tab
	const renderSecurity = () => {
		return (
			<View style={{ flex: 1 }}>
				<View style={styles.segmentControl}>
					{["flagged", "risky", "logs"].map((section) => (
						<TouchableOpacity
							key={section}
							onPress={() => setSecuritySection(section)}
							style={[styles.segment, securitySection === section && styles.segmentActive]}
						>
							<Text style={[styles.segmentText, securitySection === section && styles.segmentTextActive]}>
								{section.charAt(0).toUpperCase() + section.slice(1)}
							</Text>
						</TouchableOpacity>
					))}
				</View>

				{securitySection === "flagged" && (
					<FlatList
						data={flaggedUsers}
						keyExtractor={(u) => u._id}
						contentContainerStyle={styles.content}
						refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
						renderItem={({ item: u }) => (
							<View style={[styles.card, shadow.card]}>
								<Text style={styles.itemTitle}>{u.name}</Text>
								<Text style={styles.itemSubtitle}>{u.email}</Text>
								<TrustScoreIndicator score={u.trustScore || 0} />
								<View style={styles.userMeta}>
									<Text style={styles.metaText}>IP: {u.lastIp || "N/A"}</Text>
									{u.deviceId && <Text style={styles.metaText}>Device: {u.deviceId.substring(0, 12)}...</Text>}
								</View>
							</View>
						)}
					/>
				)}

				{securitySection === "risky" && (
					<FlatList
						data={riskyJobs}
						keyExtractor={(j) => j._id}
						contentContainerStyle={styles.content}
						refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
						renderItem={({ item: j }) => (
							<View style={[styles.card, shadow.card]}>
								<Text style={styles.itemTitle}>{j.title}</Text>
								<Text style={styles.taskPayment}>💰 ${j.payment}</Text>
								<Text style={styles.taskPoster}>Posted by: {j.postedBy?.name || "Unknown"}</Text>
								<TouchableOpacity style={[styles.button, styles.buttonSuccess]} onPress={() => approveJob(j._id)}>
									<Text style={styles.buttonText}>Approve Job</Text>
								</TouchableOpacity>
							</View>
						)}
					/>
				)}

				{securitySection === "logs" && (
					<View style={{ flex: 1 }}>
						<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
							{["ALL", "ACCOUNT_CREATION", "PROFILE_EDIT", "JOB_POST", "DEVICE_MISMATCH"].map((type) => (
								<TouchableOpacity
									key={type}
									onPress={() => setLogType(type)}
									style={[styles.filterChip, logType === type && styles.filterChipActive]}
								>
									<Text style={[styles.filterChipText, logType === type && styles.filterChipTextActive]}>
										{type}
									</Text>
								</TouchableOpacity>
							))}
						</ScrollView>
						<FlatList
							data={securityLogs.filter((log) => logType === "ALL" || log.actionType === logType)}
							keyExtractor={(log, idx) => log._id || idx}
							contentContainerStyle={styles.content}
							refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
							renderItem={({ item }) => <SecurityLogCard log={item} />}
						/>
					</View>
				)}
			</View>
		);
	};

	// Reviews Tab
	const renderReviews = () => {
		return (
			<FlatList
				data={reviews}
				keyExtractor={(r) => r._id}
				contentContainerStyle={styles.content}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
				renderItem={({ item: r }) => (
					<View style={[styles.card, shadow.card]}>
						<Text style={styles.itemTitle}>
							{r.reviewer?.name} → {r.reviewee?.name}
						</Text>
						<Text style={styles.itemSubtitle}>
							{r.rating} ★ — {r.comment || "No comment"}
						</Text>
					</View>
				)}
			/>
		);
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			{activeTab === "dashboard" && renderDashboard()}
			{activeTab === "users" && renderUsers()}
			{activeTab === "tasks" && renderTasks()}
			{activeTab === "security" && renderSecurity()}
			{activeTab === "reviews" && renderReviews()}

			{/* Tab Bar */}
			<View style={styles.tabBar}>
				{TABS.map((tab) => (
					<TouchableOpacity
						key={tab.id}
						onPress={() => setActiveTab(tab.id)}
						style={[styles.tab, activeTab === tab.id && styles.tabActive]}
					>
						<Text style={styles.tabIcon}>{tab.icon}</Text>
						<Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>
							{tab.label}
						</Text>
					</TouchableOpacity>
				))}
			</View>

			{/* Role Change Modal */}
			<Modal visible={roleModalVisible} transparent animationType="slide">
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Change Role</Text>
						<Text style={styles.modalSubtitle}>{selectedUser?.name}</Text>
						{ROLE_OPTIONS.map((role) => (
							<TouchableOpacity
								key={role}
								style={styles.modalOption}
								onPress={() => changeUserRole(selectedUser?._id, role)}
							>
								<RoleBadge role={role} />
							</TouchableOpacity>
						))}
						<TouchableOpacity style={styles.modalClose} onPress={() => setRoleModalVisible(false)}>
							<Text style={styles.modalCloseText}>Cancel</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>

			{/* Trust Score Modal */}
			<Modal visible={trustModalVisible} transparent animationType="slide">
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Adjust Trust Score</Text>
						<Text style={styles.modalSubtitle}>{selectedUser?.name}</Text>
						<Text style={styles.modalLabel}>Adjustment: {trustAdjustment > 0 ? "+" : ""}{trustAdjustment}</Text>
						<View style={styles.sliderContainer}>
							<TouchableOpacity onPress={() => setTrustAdjustment((prev) => Math.max(-50, prev - 5))}>
								<Text style={styles.sliderButton}>−</Text>
							</TouchableOpacity>
							<Text style={styles.sliderValue}>{trustAdjustment}</Text>
							<TouchableOpacity onPress={() => setTrustAdjustment((prev) => Math.min(50, prev + 5))}>
								<Text style={styles.sliderButton}>+</Text>
							</TouchableOpacity>
						</View>
						<TextInput
							style={styles.modalInput}
							placeholder="Reason (optional)"
							placeholderTextColor={colors.subtext}
							value={trustReason}
							onChangeText={setTrustReason}
						/>
						<TouchableOpacity style={styles.modalSubmit} onPress={adjustTrustScore}>
							<Text style={styles.modalSubmitText}>Submit</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.modalClose} onPress={() => setTrustModalVisible(false)}>
							<Text style={styles.modalCloseText}>Cancel</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: colors.background },
	content: { padding: spacing.lg, gap: spacing.lg },
	center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
	loadingText: { marginTop: spacing.sm, color: colors.subtext },
	header: { borderRadius: radii.lg, padding: spacing.lg, ...shadow.card },
	headerTitle: { color: colors.surface, fontSize: fonts.title, fontWeight: "700" },
	headerSubtitle: { marginTop: spacing.sm, color: "rgba(255,255,255,0.85)", fontSize: fonts.body },
	section: { gap: spacing.md },
	sectionTitle: { fontSize: fonts.subtitle, fontWeight: "600", color: colors.text },
	grid: { gap: spacing.md },
	card: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.md },
	alertRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: spacing.sm },
	alertLabel: { fontSize: fonts.body, color: colors.text },
	alertValue: { fontSize: fonts.subtitle, fontWeight: "700", color: colors.danger },
	filterContainer: { padding: spacing.md, gap: spacing.sm, backgroundColor: colors.surface },
	searchInput: { backgroundColor: colors.background, borderRadius: radii.md, padding: spacing.md, color: colors.text },
	chipScroll: { flexGrow: 0 },
	filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, backgroundColor: colors.background, borderRadius: radii.pill, marginRight: spacing.xs },
	filterChipActive: { backgroundColor: colors.primary },
	filterChipText: { fontSize: fonts.caption, color: colors.subtext, fontWeight: "600" },
	filterChipTextActive: { color: colors.surface },
	userHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
	itemTitle: { fontSize: fonts.body, fontWeight: "600", color: colors.text },
	itemSubtitle: { fontSize: fonts.caption, color: colors.subtext, marginTop: spacing.xs / 2 },
	userMeta: { gap: spacing.xs / 2 },
	metaText: { fontSize: fonts.caption, color: colors.subtext },
	actionRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
	button: { flex: 1, paddingVertical: spacing.sm, borderRadius: radii.md, alignItems: "center" },
	buttonPrimary: { backgroundColor: colors.primary },
	buttonSecondary: { backgroundColor: colors.accent },
	buttonDanger: { backgroundColor: colors.danger },
	buttonSuccess: { backgroundColor: "#10B981" },
	buttonText: { color: colors.surface, fontSize: fonts.caption, fontWeight: "600" },
	taskHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
	warningBadge: { backgroundColor: "#EF444420", paddingHorizontal: spacing.sm, paddingVertical: spacing.xs / 2, borderRadius: radii.sm },
	warningText: { color: "#EF4444", fontSize: fonts.caption, fontWeight: "700" },
	taskPayment: { fontSize: fonts.body, fontWeight: "700", color: colors.primary },
	taskPoster: { fontSize: fonts.caption, color: colors.subtext },
	segmentControl: { flexDirection: "row", padding: spacing.md, gap: spacing.xs },
	segment: { flex: 1, paddingVertical: spacing.sm, alignItems: "center", borderRadius: radii.md, backgroundColor: colors.background },
	segmentActive: { backgroundColor: colors.primary },
	segmentText: { fontSize: fonts.body, color: colors.subtext, fontWeight: "600" },
	segmentTextActive: { color: colors.surface },
	tabBar: { flexDirection: "row", backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingBottom: spacing.xs },
	tab: { flex: 1, alignItems: "center", paddingVertical: spacing.sm },
	tabActive: { borderTopWidth: 2, borderTopColor: colors.primary },
	tabIcon: { fontSize: 20 },
	tabLabel: { fontSize: fonts.caption, color: colors.subtext, marginTop: spacing.xs / 2 },
	tabLabelActive: { color: colors.primary, fontWeight: "600" },
	modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
	modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg, padding: spacing.lg, gap: spacing.md },
	modalTitle: { fontSize: fonts.title, fontWeight: "700", color: colors.text },
	modalSubtitle: { fontSize: fonts.body, color: colors.subtext },
	modalOption: { paddingVertical: spacing.md },
	modalClose: { paddingVertical: spacing.md, alignItems: "center" },
	modalCloseText: { fontSize: fonts.body, color: colors.danger, fontWeight: "600" },
	modalLabel: { fontSize: fonts.body, color: colors.text, fontWeight: "600" },
	sliderContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.lg },
	sliderButton: { fontSize: 32, color: colors.primary, fontWeight: "700" },
	sliderValue: { fontSize: fonts.title, fontWeight: "700", color: colors.text, minWidth: 60, textAlign: "center" },
	modalInput: { backgroundColor: colors.background, borderRadius: radii.md, padding: spacing.md, color: colors.text },
	modalSubmit: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: radii.md, alignItems: "center" },
	modalSubmitText: { color: colors.surface, fontSize: fonts.body, fontWeight: "600" },
});
