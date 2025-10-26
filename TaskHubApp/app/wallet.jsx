import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	TextInput,
	Button,
	ScrollView,
	StyleSheet,
} from "react-native";
import api from "../api/api";

export default function Wallet() {
	const [balance, setBalance] = useState(0);
	const [amount, setAmount] = useState("");
	const [transactions, setTransactions] = useState([]);

	const fetchWallet = async () => {
		const res = await api.get("/wallet");
		setBalance(res.data.walletBalance);
		setTransactions(res.data.transactions.reverse());
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
		<ScrollView style={styles.container}>
			<Text style={styles.title}>Wallet Balance</Text>
			<Text style={styles.balance}>{balance.toFixed(2)} ₺</Text>

			<TextInput
				placeholder='Add amount (₺)'
				keyboardType='numeric'
				value={amount}
				onChangeText={setAmount}
				style={styles.input}
			/>
			<Button title='Add Funds' onPress={addFunds} />

			<Text style={styles.section}>Transactions</Text>
			{transactions.map((t, i) => (
				<View key={i} style={styles.item}>
					<Text>{t.description}</Text>
					<Text style={{ color: t.amount > 0 ? "green" : "red" }}>
						{t.amount > 0 ? "+" : ""}
						{t.amount} ₺
					</Text>
				</View>
			))}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { padding: 16, backgroundColor: "#fff" },
	title: { fontSize: 18, fontWeight: "bold", marginBottom: 6 },
	balance: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#007AFF",
		marginBottom: 20,
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		padding: 8,
		marginBottom: 10,
	},
	section: { marginTop: 20, fontWeight: "bold" },
	item: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: 8,
		borderBottomWidth: 0.5,
	},
});
