import React, { useEffect, useState } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import api from "../api/api";
import { colors, spacing, fonts, radii, shadow } from "../theme";

export default function Wallet() {
	const [balance, setBalance] = useState(0);
	const [amount, setAmount] = useState("");
	const [transactions, setTransactions] = useState([]);

        const fetchWallet = async () => {
                const res = await api.get("/wallet");
                setBalance(res.data.walletBalance);
                const history = Array.isArray(res.data.transactions)
                        ? [...res.data.transactions].reverse()
                        : [];
                setTransactions(history);
        };

	const addFunds = async () => {
		await api.post("/wallet/add", { amount: parseFloat(amount) });
		setAmount("");
		fetchWallet();
	};

	useEffect(() => {
		fetchWallet();
	}, []);

        return (
                <SafeAreaView style={styles.safeArea}>
                        <ScrollView contentContainerStyle={styles.content}>
                                <LinearGradient
                                        colors={[colors.primary, colors.secondary]}
                                        style={styles.balanceCard}
                                >
                                        <Text style={styles.balanceLabel}>Current balance</Text>
                                        <Text style={styles.balanceValue}>{balance.toFixed(2)} ₺</Text>
                                        <Text style={styles.balanceHint}>
                                                Add funds to book talent instantly and keep projects moving.
                                        </Text>
                                </LinearGradient>

                                <View style={styles.card}>
                                        <Text style={styles.sectionTitle}>Top up wallet</Text>
                                        <TextInput
                                                placeholder='Enter amount (₺)'
                                                placeholderTextColor={colors.subtext}
                                                keyboardType='numeric'
                                                value={amount}
                                                onChangeText={setAmount}
                                                style={styles.input}
                                        />
                                        <TouchableOpacity style={styles.button} onPress={addFunds}>
                                                <Text style={styles.buttonText}>Add funds</Text>
                                        </TouchableOpacity>
                                </View>

                                <View style={styles.card}>
                                        <Text style={styles.sectionTitle}>Recent activity</Text>
                                        {transactions.length === 0 ? (
                                                <Text style={styles.empty}>No transactions yet.</Text>
                                        ) : (
                                                transactions.map((t, i) => (
                                                        <View key={i} style={styles.item}>
                                                                <View>
                                                                        <Text style={styles.itemTitle}>
                                                                                {t.description}
                                                                        </Text>
                                                                        <Text style={styles.itemDate}>
                                                                                {t.createdAt
                                                                                        ? new Date(
                                                                                                t.createdAt
                                                                                        ).toLocaleDateString()
                                                                                        : "Just now"}
                                                                        </Text>
                                                                </View>
                                                                <Text
                                                                        style={[
                                                                                styles.amount,
                                                                                t.amount > 0
                                                                                        ? styles.amountPositive
                                                                                        : styles.amountNegative,
                                                                        ]}
                                                                >
                                                                        {t.amount > 0 ? "+" : ""}
                                                                        {t.amount} ₺
                                                                </Text>
                                                        </View>
                                                ))
                                        )}
                                </View>
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
        balanceCard: {
                borderRadius: radii.lg,
                padding: spacing.lg,
                ...shadow.card,
        },
        balanceLabel: {
                color: "rgba(255,255,255,0.85)",
                fontSize: fonts.caption,
                textTransform: "uppercase",
                letterSpacing: 1,
        },
        balanceValue: {
                marginTop: spacing.sm,
                color: colors.surface,
                fontSize: 40,
                fontWeight: "700",
        },
        balanceHint: {
                marginTop: spacing.md,
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
        sectionTitle: {
                fontSize: fonts.subtitle,
                fontWeight: "600",
                color: colors.text,
        },
        input: {
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radii.sm,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                color: colors.text,
                backgroundColor: "rgba(255,255,255,0.95)",
        },
        button: {
                backgroundColor: colors.accent,
                borderRadius: radii.pill,
                paddingVertical: spacing.sm + 4,
                alignItems: "center",
        },
        buttonText: {
                color: colors.surface,
                fontWeight: "700",
                fontSize: fonts.body,
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
        },
        itemTitle: {
                color: colors.text,
                fontWeight: "600",
        },
        itemDate: {
                marginTop: spacing.xs / 2,
                color: colors.subtext,
                fontSize: fonts.caption,
        },
        amount: {
                fontWeight: "700",
                fontSize: fonts.body,
        },
        amountPositive: {
                color: colors.success,
        },
        amountNegative: {
                color: colors.danger,
        },
});
