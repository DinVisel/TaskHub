import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	ScrollView,
	Button,
	Alert,
	ActivityIndicator,
} from "react-native";
import api from "../api/api";

export default function AdminPanel() {
	const [users, setUsers] = useState([]);
	const [tasks, setTasks] = useState([]);
	const [reviews, setReviews] = useState([]);
	const [loading, setLoading] = useState(true);

	const fetchData = async () => {
		try {
			const [u, t, r] = await Promise.all([
				api.get("/admin/users"),
				api.get("/admin/tasks"),
				api.get("/admin/reviews"),
			]);
			setUsers(u.data);
			setTasks(t.data);
			setReviews(r.data);
		} catch (err) {
			Alert.alert("Error", err.response?.data?.message || "Fetch failed");
		} finally {
			setLoading(false);
		}
	};

	const deleteUser = async (id) => {
		await api.delete(`/admin/users/${id}`);
		setUsers((prev) => prev.filter((u) => u._id !== id));
	};

	const deleteTask = async (id) => {
		await api.delete(`/admin/tasks/${id}`);
		setTasks((prev) => prev.filter((t) => t._id !== id));
	};

	useEffect(() => {
		fetchData();
	}, []);

	if (loading)
		return <ActivityIndicator style={{ marginTop: 40 }} size='large' />;

	return (
		<ScrollView style={{ padding: 16 }}>
			<Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
				Admin Panel
			</Text>

			<Text style={{ fontWeight: "bold", marginTop: 20 }}>
				Users ({users.length})
			</Text>
			{users.map((u) => (
				<View key={u._id} style={{ padding: 8, borderBottomWidth: 0.5 }}>
					<Text>
						{u.name} ({u.role})
					</Text>
					<Button title='Delete' onPress={() => deleteUser(u._id)} />
				</View>
			))}

			<Text style={{ fontWeight: "bold", marginTop: 20 }}>
				Tasks ({tasks.length})
			</Text>
			{tasks.map((t) => (
				<View key={t._id} style={{ padding: 8, borderBottomWidth: 0.5 }}>
					<Text>{t.title}</Text>
					<Button title='Remove' onPress={() => deleteTask(t._id)} />
				</View>
			))}

			<Text style={{ fontWeight: "bold", marginTop: 20 }}>
				Reviews ({reviews.length})
			</Text>
			{reviews.map((r) => (
				<View key={r._id} style={{ padding: 8, borderBottomWidth: 0.5 }}>
					<Text>
						{r.reviewer?.name} → {r.reviewee?.name}: {r.rating}⭐
					</Text>
				</View>
			))}
		</ScrollView>
	);
}
