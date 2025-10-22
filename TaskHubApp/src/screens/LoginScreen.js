import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import api from "../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation }) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleLogin = async () => {
		try {
			const res = await api.post("/auth/login", { email, password });
			await AsyncStorage.setItem("token", res.data.token);
			navigation.navigate("Home");
		} catch (err) {
			setError(err.response?.data?.message || "Login failed");
		}
	};

	return (
		<View style={styles.container}>
			<Text>Email</Text>
			<TextInput style={styles.input} value={email} onChangeText={setEmail} />
			<Text>Password</Text>
			<TextInput
				style={styles.input}
				secureTextEntry
				value={password}
				onChangeText={setPassword}
			/>
			{error ? <Text style={{ color: "red" }}>{error}</Text> : null}
			<Button title='Login' onPress={handleLogin} />
			<Button title='Register' onPress={() => navigation.navigate("Register")} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 20, justifyContent: "center" },
	input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10 },
});
