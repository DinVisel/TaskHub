import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../../../api/api";
import { colors, spacing, radii, fonts } from "../../../theme";

const DISPUTE_REASONS = [
    "Incomplete work",
    "Poor quality",
    "No show",
    "Unresponsive",
    "Other",
];

export default function DisputeForm() {
    const { taskId } = useLocalSearchParams();
    const router = useRouter();
    const [reason, setReason] = useState(DISPUTE_REASONS[0]);
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!description.trim()) {
            Alert.alert("Error", "Please provide a description of the problem.");
            return;
        }

        try {
            setLoading(true);
            await api.post("/disputes", {
                taskId,
                reason,
                description,
            });
            Alert.alert(
                "Dispute Submitted",
                "Your dispute has been submitted. An admin will review it shortly.",
                [
                    {
                        text: "OK",
                        onPress: () => router.replace(`/tasks/${taskId}`),
                    },
                ]
            );
        } catch (error) {
            Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to submit dispute."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name='close' size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Report a Problem</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.subtitle}>
                    We're sorry things aren't going as planned. Please tell us what's
                    wrong so we can help.
                </Text>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Reason</Text>
                    <View style={styles.reasonsContainer}>
                        {DISPUTE_REASONS.map((r) => (
                            <TouchableOpacity
                                key={r}
                                style={[
                                    styles.reasonChip,
                                    reason === r && styles.reasonChipSelected,
                                ]}
                                onPress={() => setReason(r)}
                            >
                                <Text
                                    style={[
                                        styles.reasonText,
                                        reason === r && styles.reasonTextSelected,
                                    ]}
                                >
                                    {r}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder='Please describe the issue in detail...'
                        multiline
                        numberOfLines={6}
                        value={description}
                        onChangeText={setDescription}
                        textAlignVertical='top'
                    />
                </View>

                <View style={styles.warningBox}>
                    <Ionicons name='alert-circle' size={20} color='#d97706' />
                    <Text style={styles.warningText}>
                        Submitting a dispute will freeze this task. No further actions (like
                        completion or payment) can be taken until an admin resolves it.
                    </Text>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color='#fff' />
                    ) : (
                        <Text style={styles.submitButtonText}>Submit Dispute</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        padding: spacing.sm,
    },
    headerTitle: {
        fontSize: fonts.title,
        fontWeight: "600",
        marginLeft: spacing.sm,
        color: colors.text,
    },
    content: {
        padding: spacing.lg,
    },
    subtitle: {
        fontSize: fonts.body,
        color: colors.subtext,
        marginBottom: spacing.xl,
        lineHeight: 22,
    },
    formGroup: {
        marginBottom: spacing.xl,
    },
    label: {
        fontSize: fonts.subtitle,
        fontWeight: "600",
        color: colors.text,
        marginBottom: spacing.md,
    },
    reasonsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
    },
    reasonChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radii.pill,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    reasonChipSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    reasonText: {
        color: colors.text,
        fontSize: 14,
    },
    reasonTextSelected: {
        color: "#fff",
        fontWeight: "600",
    },
    textArea: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.md,
        padding: spacing.md,
        fontSize: fonts.body,
        minHeight: 120,
    },
    warningBox: {
        flexDirection: "row",
        backgroundColor: "#fffbeb",
        padding: spacing.md,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: "#fcd34d",
        gap: spacing.sm,
    },
    warningText: {
        flex: 1,
        color: "#92400e",
        fontSize: 13,
        lineHeight: 18,
    },
    footer: {
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.background,
    },
    submitButton: {
        backgroundColor: colors.danger,
        paddingVertical: spacing.md,
        borderRadius: radii.md,
        alignItems: "center",
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: "#fff",
        fontSize: fonts.subtitle,
        fontWeight: "600",
    },
});
