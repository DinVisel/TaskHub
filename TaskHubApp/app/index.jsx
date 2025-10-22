import React, { useContext, useEffect, useState } from "react";
import { View, Text, Button, FlatList, StyleSheet } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { router } from "expo-router";
import api from "../api/api";

export default function Home() {
	const { user, logout } = useContext(AuthContext);
	const [tasks, setTasks] = useState([]);

	useEffect(() => {
		const fetchTasks = async () => {
			try {
				const res = await api.get("/tasks");
				setTasks(res.data.tasks);
			} catch (err) {
				console.log("Error fetching tasks:", err.message);
			}
		};
		fetchTasks();
	}, []);

	if (!user) return router.replace("/login");

	return (
		<View style={styles.container}>
			<Text style={styles.header}>Welcome, {user.name}</Text>
			<Button title='Logout' onPress={logout} />
			<FlatList
				data={tasks}
				keyExtractor={(item) => item._id}
				renderItem={({ item }) => (
					<View style={styles.taskCard}>
						<Text style={styles.taskTitle}>{item.title}</Text>
						<Text>{item.description}</Text>
					</View>
				)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 20 },
	header: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
	taskCard: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ddd" },
	taskTitle: { fontSize: 16, fontWeight: "bold" },
});
