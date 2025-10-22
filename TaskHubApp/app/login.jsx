import React, { useState, useContext } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { router } from "expo-router";

export default function Login() {
	const { login } = useContext(AuthContext);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleLogin = async () => {
		try {
			await login(email, password);
			router.replace("/"); // go to home
		} catch (err) {
			setError(err.response?.data?.message || "Login failed");
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Login</Text>
			<TextInput
				style={styles.input}
				placeholder='Email'
				value={email}
				onChangeText={setEmail}
			/>
			<TextInput
				style={styles.input}
				placeholder='Password'
				value={password}
				secureTextEntry
				onChangeText={setPassword}
			/>
			{error ? <Text style={styles.error}>{error}</Text> : null}
			<Button title='Login' onPress={handleLogin} />
			<Button title='Create Account' onPress={() => router.push("/register")} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: "center", padding: 20 },
	title: {
		fontSize: 22,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "center",
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 6,
		padding: 10,
		marginBottom: 10,
	},
	error: { color: "red", textAlign: "center", marginBottom: 10 },
});
