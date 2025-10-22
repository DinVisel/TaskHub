import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	FlatList,
	StyleSheet,
} from "react-native";
import api from "../../api/api";
import { router } from "expo-router";

export default function Messages() {
	const [threads, setThreads] = useState([]);

	useEffect(() => {
		const fetchThreads = async () => {
			try {
				const res = await api.get("/messages/overview");
				setThreads(res.data.threads);
			} catch (err) {
				console.log("Error loading messages:", err.message);
			}
		};
		fetchThreads();
	}, []);

	if (threads.length === 0)
		return (
			<View style={styles.center}>
				<Text>No messages yet</Text>
			</View>
		);

	return (
		<View style={styles.container}>
			<FlatList
				data={threads}
				keyExtractor={(item) => item.taskId}
				renderItem={({ item }) => (
					<TouchableOpacity
						style={styles.thread}
						onPress={() => router.push(`/chat/${item.taskId}`)}
					>
						<Text style={styles.taskTitle}>{item.taskTitle}</Text>
						<Text style={styles.preview}>
							{item.lastMessage || "No messages yet"}
						</Text>
					</TouchableOpacity>
				)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 20 },
	center: { flex: 1, justifyContent: "center", alignItems: "center" },
	thread: {
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	taskTitle: { fontWeight: "bold", fontSize: 16 },
	preview: { color: "#777", marginTop: 4 },
});
