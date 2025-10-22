import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = "http://localhost:4000/api";

const api = axios.create({ baseURL: API_BASE });

// Add JWT token automatically
api.interceptors.request.use(async (config) => {
	const token = await AsyncStorage.getItem("token");
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

export default api;
