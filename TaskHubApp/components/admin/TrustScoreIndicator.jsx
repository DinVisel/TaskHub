import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, fonts, radii } from "../../theme";

export default function TrustScoreIndicator({ score }) {
    const getColor = (score) => {
        if (score >= 80) return "#10B981"; // Green
        if (score >= 50) return "#F59E0B"; // Yellow
        return "#EF4444"; // Red
    };

    const color = getColor(score);
    const percentage = Math.max(0, Math.min(100, score));

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.label}>Trust Score</Text>
                <Text style={[styles.score, { color }]}>{score}</Text>
            </View>
            <View style={styles.barBackground}>
                <View
                    style={[
                        styles.barFill,
                        { width: `${percentage}%`, backgroundColor: color },
                    ]}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: spacing.xs,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    label: {
        fontSize: fonts.caption,
        color: colors.subtext,
        fontWeight: "600",
    },
    score: {
        fontSize: fonts.body,
        fontWeight: "700",
    },
    barBackground: {
        height: 6,
        backgroundColor: colors.border,
        borderRadius: radii.pill,
        overflow: "hidden",
    },
    barFill: {
        height: "100%",
        borderRadius: radii.pill,
    },
});
