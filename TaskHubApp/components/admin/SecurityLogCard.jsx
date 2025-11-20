import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, fonts, radii, shadow } from "../../theme";

const ACTION_TYPE_COLORS = {
    ACCOUNT_CREATION: "#3B82F6", // Blue
    PROFILE_EDIT: "#F59E0B", // Orange
    JOB_POST: "#10B981", // Green
    DEVICE_MISMATCH: "#EF4444", // Red
};

const ACTION_TYPE_LABELS = {
    ACCOUNT_CREATION: "Account Created",
    PROFILE_EDIT: "Profile Edited",
    JOB_POST: "Job Posted",
    DEVICE_MISMATCH: "Device Mismatch",
};

export default function SecurityLogCard({ log }) {
    const color = ACTION_TYPE_COLORS[log.actionType] || colors.subtext;
    const label = ACTION_TYPE_LABELS[log.actionType] || log.actionType;
    const timestamp = new Date(log.createdAt).toLocaleString();

    return (
        <View style={[styles.card, shadow.card]}>
            <View style={styles.header}>
                <View style={[styles.typeBadge, { backgroundColor: `${color}20` }]}>
                    <Text style={[styles.typeText, { color }]}>{label}</Text>
                </View>
                <Text style={styles.timestamp}>{timestamp}</Text>
            </View>
            <View style={styles.details}>
                <Text style={styles.detailText}>
                    <Text style={styles.detailLabel}>User: </Text>
                    {log.userId?.name || "Unknown"}
                </Text>
                <Text style={styles.detailText}>
                    <Text style={styles.detailLabel}>IP: </Text>
                    {log.ipAddress}
                </Text>
                {log.deviceId && (
                    <Text style={styles.detailText}>
                        <Text style={styles.detailLabel}>Device: </Text>
                        {log.deviceId.substring(0, 16)}...
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
        marginBottom: spacing.sm,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.sm,
    },
    typeBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs / 2,
        borderRadius: radii.sm,
    },
    typeText: {
        fontSize: fonts.caption,
        fontWeight: "700",
    },
    timestamp: {
        fontSize: fonts.caption,
        color: colors.subtext,
    },
    details: {
        gap: spacing.xs / 2,
    },
    detailText: {
        fontSize: fonts.caption,
        color: colors.text,
    },
    detailLabel: {
        fontWeight: "600",
        color: colors.subtext,
    },
});
