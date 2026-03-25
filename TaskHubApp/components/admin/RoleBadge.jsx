import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, fonts, radii } from "../../theme";

const ROLE_COLORS = {
    ADMIN: "#9333EA", // Purple
    PRO_USER: "#F59E0B", // Gold
    VERIFIED_USER: "#3B82F6", // Blue
    USER: "#6B7280", // Gray
    FLAGGED_USER: "#EF4444", // Red
};

export default function RoleBadge({ role }) {
    const backgroundColor = ROLE_COLORS[role] || ROLE_COLORS.USER;

    return (
        <View style={[styles.badge, { backgroundColor }]}>
            <Text style={styles.text}>{role.replace("_", " ")}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs / 2,
        borderRadius: radii.sm,
        alignSelf: "flex-start",
    },
    text: {
        color: colors.surface,
        fontSize: fonts.caption,
        fontWeight: "700",
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },
});
