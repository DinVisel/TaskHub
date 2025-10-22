import React, { useContext } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { router } from "expo-router";

export default function Account() {
	const { user, logout } = useContext(AuthContext);

	const handleLogout = async () => {
		await logout();
		router.replace("/login");
	};

	return (
		<View style={styles.container}>
			<Text style={styles.header}>My Account</Text>
			<Text style={styles.text}>Name: {user?.name}</Text>
			<Text style={styles.text}>Email: {user?.email}</Text>
			<Button title='Logout' onPress={handleLogout} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: "center", alignItems: "center" },
	header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
	text: { fontSize: 16, marginBottom: 10 },
});
