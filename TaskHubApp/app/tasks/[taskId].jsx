import React, {
        useCallback,
        useEffect,
        useMemo,
        useState,
} from "react";
import {
        ActivityIndicator,
        Image,
        RefreshControl,
        ScrollView,
        StatusBar,
        StyleSheet,
        Text,
        TouchableOpacity,
        View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../../api/api";
import { colors, fonts, radii, spacing } from "../../theme.js";

const FALLBACK_CARD_IMAGE_URL =
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=60";
const FALLBACK_AVATAR_URL = "https://i.pravatar.cc/120";

const formatCurrency = (amount, currency = "USD") => {
        if (!Number.isFinite(amount)) return null;
        try {
                return new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency,
                        maximumFractionDigits: 0,
                }).format(amount);
        } catch (e) {
                return `${amount} ${currency}`;
        }
};

export default function TaskDetail() {
        const { taskId } = useLocalSearchParams();
        const [task, setTask] = useState(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState("");
        const [refreshing, setRefreshing] = useState(false);

        const fetchTask = useCallback(async () => {
                if (!taskId) return null;

                const res = await api.get(`/tasks/${taskId}`);
                return res.data.task;
        }, [taskId]);

        const loadTask = useCallback(async () => {
                if (!taskId) return;

                try {
                        setLoading(true);
                        setError("");
                        const data = await fetchTask();
                        setTask(data);
                } catch (err) {
                        setError(err.response?.data?.message || "Unable to load this task.");
                } finally {
                        setLoading(false);
                }
        }, [fetchTask, taskId]);

        useEffect(() => {
                loadTask();
        }, [loadTask]);

        const handleRefresh = useCallback(async () => {
                if (!taskId) return;

                try {
                        setRefreshing(true);
                        const data = await fetchTask();
                        setTask(data);
                        setError("");
                } catch (err) {
                        setError(err.response?.data?.message || "Unable to refresh this task.");
                } finally {
                        setRefreshing(false);
                }
        }, [fetchTask, taskId]);

        const handleMessage = useCallback(() => {
                if (!taskId) return;
                router.push(`/chat/${taskId}`);
        }, [taskId]);

        const handleBack = useCallback(() => {
                router.back();
        }, []);

        const budgetLabel = useMemo(() => {
                if (!task) return null;

                const budgetAmount =
                        typeof task?.budget === "number"
                                ? task.budget
                                : Number(task?.budget?.amount);

                const priceAmount = typeof task?.price === "number" ? task.price : Number(task?.price);

                const amount = Number.isFinite(budgetAmount)
                        ? budgetAmount
                        : Number.isFinite(priceAmount)
                        ? priceAmount
                        : null;

                const currency =
                        task?.budget?.currency ||
                        (task?.currency && typeof task.currency === "string" ? task.currency : "USD");

                return amount !== null ? formatCurrency(amount, currency) : null;
        }, [task]);

        const locationLabel = useMemo(() => {
                if (!task?.location) return "Not specified";
                const { address, city } = task.location;
                if (address && city) return `${address}, ${city}`;
                return address || city || "Not specified";
        }, [task?.location]);

        const postedByName = task?.postedBy?.name || "Unknown client";
        const postedByRole = task?.postedBy?.role
                ? task.postedBy.role.charAt(0).toUpperCase() + task.postedBy.role.slice(1)
                : "Client";

        const createdAtLabel = useMemo(() => {
                if (!task?.createdAt) return null;
                try {
                        return new Date(task.createdAt).toLocaleString();
                } catch (e) {
                        return null;
                }
        }, [task?.createdAt]);

        const coverSource = useMemo(() => {
                if (task?.image && task.image.startsWith("http")) {
                        return { uri: task.image };
                }
                return { uri: FALLBACK_CARD_IMAGE_URL };
        }, [task?.image]);

        const avatarSource = useMemo(() => {
                if (task?.ownerAvatar && task.ownerAvatar.startsWith("http")) {
                        return { uri: task.ownerAvatar };
                }
                if (task?.postedBy?.avatar && task.postedBy.avatar.startsWith("http")) {
                        return { uri: task.postedBy.avatar };
                }
                const initials = encodeURIComponent(postedByName);
                return { uri: `${FALLBACK_AVATAR_URL}?u=${initials}` };
        }, [postedByName, task?.ownerAvatar, task?.postedBy?.avatar]);

        return (
                <SafeAreaView style={styles.safeArea}>
                        <StatusBar barStyle='light-content' />
                        <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.header}>
                                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                                        <Ionicons name='chevron-back' size={24} color='#fff' />
                                </TouchableOpacity>
                                <Text style={styles.headerTitle} numberOfLines={1}>
                                        Task details
                                </Text>
                        </LinearGradient>

                        {loading ? (
                                <View style={styles.centerContent}>
                                        <ActivityIndicator size='large' color={colors.primary} />
                                </View>
                        ) : error ? (
                                <View style={styles.centerContent}>
                                        <Text style={styles.errorText}>{error}</Text>
                                        <TouchableOpacity style={styles.retryButton} onPress={loadTask}>
                                                <Text style={styles.retryText}>Try again</Text>
                                        </TouchableOpacity>
                                </View>
                        ) : (
                                <ScrollView
                                        style={styles.container}
                                        refreshControl={
                                                <RefreshControl
                                                        refreshing={refreshing}
                                                        onRefresh={handleRefresh}
                                                        tintColor={colors.primary}
                                                />
                                        }
                                >
                                        <View style={styles.coverWrapper}>
                                                <Image source={coverSource} style={styles.coverImage} />
                                        </View>

                                        <View style={styles.content}>
                                                <View style={styles.chipRow}>
                                                        <View style={styles.categoryChip}>
                                                                <Ionicons name='pricetag' size={14} color={colors.accent} />
                                                                <Text style={styles.categoryText}>
                                                                        {task?.category || "General"}
                                                                </Text>
                                                        </View>
                                                        {budgetLabel ? (
                                                                <View style={styles.budgetChip}>
                                                                        <Ionicons name='wallet' size={14} color={colors.primary} />
                                                                        <Text style={styles.budgetText}>{budgetLabel}</Text>
                                                                </View>
                                                        ) : null}
                                                </View>

                                                <Text style={styles.title}>{task?.title}</Text>

                                                {createdAtLabel ? (
                                                        <Text style={styles.timestamp}>Posted {createdAtLabel}</Text>
                                                ) : null}

                                                <View style={styles.section}>
                                                        <Text style={styles.sectionHeading}>Description</Text>
                                                        <Text style={styles.sectionBody}>{task?.description}</Text>
                                                </View>

                                                <View style={styles.section}>
                                                        <Text style={styles.sectionHeading}>Location</Text>
                                                        <View style={styles.inlineRow}>
                                                                <Ionicons
                                                                        name='location-outline'
                                                                        size={18}
                                                                        color={colors.subtext}
                                                                />
                                                                <Text style={styles.sectionBody}>{locationLabel}</Text>
                                                        </View>
                                                </View>

                                                <View style={styles.section}>
                                                        <Text style={styles.sectionHeading}>Created by</Text>
                                                        <View style={styles.posterCard}>
                                                                <Image source={avatarSource} style={styles.avatar} />
                                                                <View style={{ flex: 1 }}>
                                                                        <Text style={styles.posterName}>{postedByName}</Text>
                                                                        <Text style={styles.posterRole}>{postedByRole}</Text>
                                                                </View>
                                                        </View>
                                                </View>
                                        </View>
                                </ScrollView>
                        )}

                        {!loading && !error ? (
                                <View style={styles.footer}>
                                        <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
                                                <Ionicons name='chatbubble-ellipses' size={20} color='#fff' />
                                                <Text style={styles.messageText}>Message about this task</Text>
                                        </TouchableOpacity>
                                </View>
                        ) : null}
                </SafeAreaView>
        );
}

const styles = StyleSheet.create({
        safeArea: {
                flex: 1,
                backgroundColor: colors.background,
        },
        header: {
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.md,
                flexDirection: "row",
                alignItems: "center",
        },
        backButton: {
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255,255,255,0.15)",
        },
        headerTitle: {
                marginLeft: spacing.sm,
                color: "#fff",
                fontSize: fonts.subtitle,
                fontWeight: "600",
                flex: 1,
        },
        container: {
                flex: 1,
                backgroundColor: colors.background,
        },
        centerContent: {
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                padding: spacing.lg,
        },
        errorText: {
                color: colors.danger,
                textAlign: "center",
                marginBottom: spacing.md,
        },
        retryButton: {
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.sm,
                borderRadius: radii.md,
                backgroundColor: colors.primary,
        },
        retryText: {
                color: "#fff",
                fontWeight: "600",
        },
        coverWrapper: {
                margin: spacing.md,
                borderRadius: radii.lg,
                overflow: "hidden",
                shadowColor: "rgba(15, 23, 42, 0.18)",
                shadowOffset: { width: 0, height: 16 },
                shadowOpacity: 0.25,
                shadowRadius: 32,
                elevation: 10,
        },
        coverImage: {
                width: "100%",
                height: 200,
        },
        content: {
                paddingHorizontal: spacing.md,
                paddingBottom: spacing.xl,
                gap: spacing.lg,
        },
        chipRow: {
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.sm,
        },
        categoryChip: {
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.xs,
                backgroundColor: "rgba(249, 115, 22, 0.12)",
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs,
                borderRadius: radii.pill,
        },
        categoryText: {
                color: colors.accent,
                fontWeight: "600",
        },
        budgetChip: {
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.xs,
                backgroundColor: "rgba(37, 99, 235, 0.12)",
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs,
                borderRadius: radii.pill,
        },
        budgetText: {
                color: colors.primary,
                fontWeight: "600",
        },
        title: {
                fontSize: fonts.title,
                fontWeight: "700",
                color: colors.text,
        },
        timestamp: {
                color: colors.subtext,
        },
        section: {
                gap: spacing.sm,
        },
        sectionHeading: {
                fontSize: fonts.subtitle,
                fontWeight: "600",
                color: colors.text,
        },
        sectionBody: {
                color: colors.subtext,
                lineHeight: 22,
                flex: 1,
        },
        inlineRow: {
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.sm,
        },
        posterCard: {
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.md,
                backgroundColor: colors.surface,
                padding: spacing.md,
                borderRadius: radii.lg,
                borderWidth: 1,
                borderColor: colors.border,
        },
        avatar: {
                width: 56,
                height: 56,
                borderRadius: 28,
        },
        posterName: {
                fontWeight: "700",
                color: colors.text,
                fontSize: fonts.body,
        },
        posterRole: {
                color: colors.subtext,
        },
        footer: {
                padding: spacing.md,
                backgroundColor: colors.surface,
                borderTopWidth: 1,
                borderTopColor: colors.border,
        },
        messageButton: {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: spacing.sm,
                backgroundColor: colors.primary,
                borderRadius: radii.md,
                paddingVertical: spacing.md,
        },
        messageText: {
                color: "#fff",
                fontWeight: "600",
                fontSize: fonts.body,
        },
});
