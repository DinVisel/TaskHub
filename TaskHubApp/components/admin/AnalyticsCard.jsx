import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, fonts, radii, shadow } from "../../theme";

export default function AnalyticsCard({ icon, label, value, trend, color = colors.primary }) {
    return (
        <View style={[styles.card, shadow.card]}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                <Text style={[styles.icon, { color }]}>{icon}</Text>
            </View>
            <View style={styles.content}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{value}</Text>
                {trend && (
                    <Text style={[styles.trend, trend.up ? styles.trendUp : styles.trendDown]}>
                        {trend.up ? "↑" : "↓"} {trend.text}
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        padding: spacing.md,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: radii.md,
        justifyContent: "center",
        alignItems: "center",
    },
    icon: {
        fontSize: 24,
    },
    content: {
        flex: 1,
    },
    label: {
        fontSize: fonts.caption,
        color: colors.subtext,
        marginBottom: spacing.xs / 2,
    },
    value: {
        fontSize: fonts.title,
        fontWeight: "700",
        color: colors.text,
    },
    trend: {
        fontSize: fonts.caption,
        marginTop: spacing.xs / 2,
        fontWeight: "600",
    },
    trendUp: {
        color: "#10B981",
    },
    trendDown: {
        color: "#EF4444",
    },
});
