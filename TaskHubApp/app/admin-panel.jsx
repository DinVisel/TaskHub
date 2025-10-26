import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import api from "../api/api";
import { colors, spacing, fonts, radii, shadow } from "../theme";

export default function AdminPanel() {
	const [users, setUsers] = useState([]);
	const [tasks, setTasks] = useState([]);
	const [reviews, setReviews] = useState([]);
	const [loading, setLoading] = useState(true);

	const fetchData = async () => {
		try {
			const [u, t, r] = await Promise.all([
				api.get("/admin/users"),
				api.get("/admin/tasks"),
				api.get("/admin/reviews"),
			]);
			setUsers(u.data);
			setTasks(t.data);
			setReviews(r.data);
		} catch (err) {
			Alert.alert("Error", err.response?.data?.message || "Fetch failed");
		} finally {
			setLoading(false);
		}
	};

	const deleteUser = async (id) => {
		await api.delete(`/admin/users/${id}`);
		setUsers((prev) => prev.filter((u) => u._id !== id));
	};

	const deleteTask = async (id) => {
		await api.delete(`/admin/tasks/${id}`);
		setTasks((prev) => prev.filter((t) => t._id !== id));
	};

	useEffect(() => {
		fetchData();
	}, []);

        if (loading)
                return (
                        <View style={styles.center}>
                                <ActivityIndicator size='large' color={colors.primary} />
                                <Text style={styles.loadingText}>Syncing admin data…</Text>
                        </View>
                );

        const renderCard = (title, items, renderItem) => (
                <View style={styles.card}>
                        <Text style={styles.cardTitle}>{title}</Text>
                        {items.length === 0 ? (
                                <Text style={styles.empty}>Nothing to display.</Text>
                        ) : (
                                items.map(renderItem)
                        )}
                </View>
        );

        return (
                <SafeAreaView style={styles.safeArea}>
                        <ScrollView contentContainerStyle={styles.content}>
                                <LinearGradient
                                        colors={[colors.primary, colors.secondary]}
                                        style={styles.header}
                                >
                                        <Text style={styles.headerTitle}>Admin overview</Text>
                                        <Text style={styles.headerSubtitle}>
                                                Moderate users, tasks and reviews to keep TaskHub thriving.
                                        </Text>
                                </LinearGradient>

                                {renderCard(
                                        `Users (${users.length})`,
                                        users,
                                        (u) => (
                                                <View key={u._id} style={styles.item}>
                                                        <View>
                                                                <Text style={styles.itemTitle}>{u.name}</Text>
                                                                <Text style={styles.itemSubtitle}>{u.role}</Text>
                                                        </View>
                                                        <TouchableOpacity
                                                                style={[styles.chip, styles.dangerChip]}
                                                                onPress={() => deleteUser(u._id)}
                                                        >
                                                                <Text style={styles.chipText}>Remove</Text>
                                                        </TouchableOpacity>
                                                </View>
                                        )
                                )}

                                {renderCard(
                                        `Tasks (${tasks.length})`,
                                        tasks,
                                        (t) => (
                                                <View key={t._id} style={styles.item}>
                                                        <View style={{ flex: 1 }}>
                                                                <Text style={styles.itemTitle}>{t.title}</Text>
                                                                <Text style={styles.itemSubtitle} numberOfLines={1}>
                                                                        {t.category || "General"}
                                                                </Text>
                                                        </View>
                                                        <TouchableOpacity
                                                                style={[styles.chip, styles.warningChip]}
                                                                onPress={() => deleteTask(t._id)}
                                                        >
                                                                <Text style={styles.chipText}>Delete</Text>
                                                        </TouchableOpacity>
                                                </View>
                                        )
                                )}

                                {renderCard(
                                        `Reviews (${reviews.length})`,
                                        reviews,
                                        (r) => (
                                                <View key={r._id} style={styles.item}>
                                                        <View style={{ flex: 1 }}>
                                                                <Text style={styles.itemTitle} numberOfLines={1}>
                                                                        {r.reviewer?.name} → {r.reviewee?.name}
                                                                </Text>
                                                                <Text style={styles.itemSubtitle}>
                                                                        {r.rating} ★ — {r.comment || "No comment"}
                                                                </Text>
                                                        </View>
                                                </View>
                                        )
                                )}
                        </ScrollView>
                </SafeAreaView>
        );
}

const styles = StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: colors.background },
        content: {
                padding: spacing.lg,
                gap: spacing.lg,
        },
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
        header: {
                borderRadius: radii.lg,
                padding: spacing.lg,
                ...shadow.card,
        },
        headerTitle: {
                color: colors.surface,
                fontSize: fonts.title,
                fontWeight: "700",
        },
        headerSubtitle: {
                marginTop: spacing.sm,
                color: "rgba(255,255,255,0.85)",
                fontSize: fonts.body,
                lineHeight: 22,
        },
        card: {
                backgroundColor: colors.surface,
                borderRadius: radii.lg,
                padding: spacing.lg,
                ...shadow.card,
                gap: spacing.md,
        },
        cardTitle: {
                fontSize: fonts.subtitle,
                fontWeight: "600",
                color: colors.text,
        },
        empty: {
                color: colors.subtext,
        },
        item: {
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: spacing.sm,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
                gap: spacing.md,
        },
        itemTitle: {
                color: colors.text,
                fontWeight: "600",
        },
        itemSubtitle: {
                color: colors.subtext,
                fontSize: fonts.caption,
                marginTop: spacing.xs / 2,
        },
        chip: {
                borderRadius: radii.pill,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs + 2,
        },
        chipText: {
                color: colors.surface,
                fontWeight: "600",
                fontSize: fonts.caption,
                letterSpacing: 0.3,
        },
        dangerChip: { backgroundColor: colors.danger },
        warningChip: { backgroundColor: colors.accent },
});
