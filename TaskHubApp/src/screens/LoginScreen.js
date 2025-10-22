import React, { useState, useContext } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function LoginScreen({ navigation }) {
	const { login } = useContext(AuthContext); // 🧠 use global login()
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleLogin = async () => {
		try {
			await login(email, password); // AuthContext handles API + token storage
			navigation.navigate("Home"); // redirect on success
		} catch (err) {
			setError(err.response?.data?.message || "Login failed");
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Welcome Back</Text>

			<TextInput
				style={styles.input}
				placeholder='Email'
				value={email}
				onChangeText={setEmail}
				autoCapitalize='none'
			/>

			<TextInput
				style={styles.input}
				placeholder='Password'
				secureTextEntry
				value={password}
				onChangeText={setPassword}
			/>

			{error ? <Text style={styles.error}>{error}</Text> : null}

			<Button title='Login' onPress={handleLogin} />
			<Button
				title='Create new account'
				onPress={() => navigation.navigate("Register")}
			/>
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
		marginBottom: 12,
	},
	error: { color: "red", marginBottom: 10, textAlign: "center" },
});
