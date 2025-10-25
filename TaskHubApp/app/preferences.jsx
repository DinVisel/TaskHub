import React, { useState } from "react";
import { View, Text, Button, TextInput } from "react-native";
import api from "../api/api";

export default function Preferences() {
	const [categories, setCategories] = useState("Cleaning,Repair");
	const [radius, setRadius] = useState("25");

	const save = async () => {
		await api.patch("/users/preferences", {
			categories: categories.split(",").map((c) => c.trim()),
			radiusKm: parseInt(radius),
		});
		alert("Preferences saved!");
	};

	return (
		<View style={{ padding: 20 }}>
			<Text style={{ fontSize: 18, fontWeight: "bold" }}>Preferences</Text>
			<TextInput
				placeholder='Categories (comma separated)'
				value={categories}
				onChangeText={setCategories}
				style={{ borderWidth: 1, marginVertical: 10, padding: 8 }}
			/>
			<TextInput
				placeholder='Radius (km)'
				keyboardType='numeric'
				value={radius}
				onChangeText={setRadius}
				style={{ borderWidth: 1, marginVertical: 10, padding: 8 }}
			/>
			<Button title='Save' onPress={save} />
		</View>
	);
}
