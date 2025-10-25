import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Image } from "react-native";
import api from "../../api/api";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";

export default function PostTask() {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [message, setMessage] = useState("");
	const [city, setCity] = useState("");
	const [coords, setCoords] = useState(null);
	const [category, setCategory] = useState("");
	const [image, setImage] = useState(null);

	const handlePost = async () => {
		try {
			const payload = {
				title,
				description,
				category,
				image: imageUrl,
			};

			const trimmedCity = city.trim();
			const locationData = {};

			if (trimmedCity) {
				locationData.address = trimmedCity;
			}

			if (coords?.lat != null && coords?.lng != null) {
				locationData.coordinates = { ...coords };
			}

			if (Object.keys(locationData).length > 0) {
				payload.location = locationData;
			}

			let imageUrl = null;
			if (!image) {
				const formData = new FormData();
				formData.append("file", {
					uri: image,
					name: "upload.jpg",
					type: "image/jpeg",
				});

				const res = await api.post("/upload", formData, {
					headers: { "Content-Type": "multipart/form-data" },
				});
				imageUrl = res.data.url;
			}

			const res = await api.post("/tasks", payload);
			setMessage("Task posted successfully!");
			setTitle("");
			setDescription("");
			setCategory("");
			setCity("");
			setImage(null);
		} catch (err) {
			setMessage(err.response?.data?.message || "Failed to post task");
		}
	};

	const pickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			quality: 0.8,
		});

		if (!result.canceled) setImage(result.assets[0].url);
	};

	useEffect(() => {
		(async () => {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") return;
			const location = await Location.getCurrentPositionAsync({});
			setCoords({
				lat: location.coords.latitude,
				lng: location.coords.longitude,
			});
		})();
	}, []);

	return (
		<SafeAreaView style={styles.container}>
			<Text style={styles.title}>Post a New Task</Text>
			<TextInput
				style={styles.input}
				placeholder='Title'
				value={title}
				onChangeText={setTitle}
			/>
			<TextInput
				style={styles.input}
				placeholder='Category'
				value={category}
				onChangeText={setCategory}
			/>
			<TextInput
				style={styles.input}
				placeholder='City'
				value={city}
				onChangeText={setCity}
			/>
			<Button title='Pick Image' onPress={pickImage} />
			{image && (
				<Image
					source={{ uri: image }}
					style={{ height: 180, marginVertical: 10 }}
				/>
			)}
			<TextInput
				style={[styles.input, { height: 100 }]}
				placeholder='Description'
				value={description}
				multiline
				onChangeText={setDescription}
			/>
			<Button title='Submit' onPress={handlePost} />
			{message ? <Text style={styles.message}>{message}</Text> : null}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 20 },
	title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		padding: 10,
		borderRadius: 8,
		marginBottom: 12,
	},
	message: { marginTop: 10, color: "green" },
});
