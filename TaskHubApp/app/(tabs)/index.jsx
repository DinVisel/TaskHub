import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import api from "../../api/api";

export default function Home() {
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

	return (
		<View style={styles.container}>
			<Text style={styles.header}>Available Tasks</Text>
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
	container: { flex: 1, padding: 20, backgroundColor: "#fff" },
	header: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
	taskCard: {
		backgroundColor: "#f9f9f9",
		padding: 12,
		borderRadius: 10,
		marginBottom: 10,
	},
	taskTitle: { fontWeight: "bold", fontSize: 16 },
});
