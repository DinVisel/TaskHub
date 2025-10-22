import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	// Load token on startup
	useEffect(() => {
		const loadUser = async () => {
			try {
				const token = await AsyncStorage.getItem("token");
				if (token) {
					const res = await api.get("/auth/me");
					setUser(res.data.user);
				}
			} catch (err) {
				console.log("Auth check failed:", err.message);
			} finally {
				setLoading(false);
			}
		};
		loadUser();
	}, []);

	// 🔑 Login
	const login = async (email, password) => {
		const res = await api.post("/auth/login", { email, password });
		await AsyncStorage.setItem("token", res.data.token);
		setUser(res.data.user);
	};

	// Register
	const register = async (name, email, password, phone) => {
		const res = await api.post("/auth/register", {
			name,
			email,
			password,
			phone,
		});
		await AsyncStorage.setItem("token", res.data.token);
		setUser(res.data.user);
	};

	// Logout
	const logout = async () => {
		await AsyncStorage.removeItem("token");
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ user, loading, login, register, logout }}>
			{children}
		</AuthContext.Provider>
	);
};
