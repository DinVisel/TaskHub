import React, { useState, useContext } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function RegisterScreen({ navigation }) {
	const { register } = useContext(AuthContext);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleRegister = async () => {
		try {
			await register(name, email, password, phone);
			navigation.navigate("Home"); // Redirect after success
		} catch (err) {
			setError(err.response?.data?.message || "Registration failed");
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Create Account</Text>

			<TextInput
				style={styles.input}
				placeholder='Full Name'
				value={name}
				onChangeText={setName}
			/>

			<TextInput
				style={styles.input}
				placeholder='Email'
				value={email}
				onChangeText={setEmail}
				autoCapitalize='none'
			/>

			<TextInput
				style={styles.input}
				placeholder='Phone Number (optional)'
				value={phone}
				onChangeText={setPhone}
			/>

			<TextInput
				style={styles.input}
				placeholder='Password'
				value={password}
				onChangeText={setPassword}
				secureTextEntry
			/>

			{error ? <Text style={styles.error}>{error}</Text> : null}

			<Button title='Register' onPress={handleRegister} />
			<Button
				title='Already have an account? Login'
				onPress={() => navigation.navigate("Login")}
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
