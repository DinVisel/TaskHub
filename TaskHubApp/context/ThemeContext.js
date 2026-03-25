import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";
import { lightColors, darkColors } from "../theme";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
	const systemScheme = useColorScheme();
	const [theme, setTheme] = useState("light"); // 'light' | 'dark' | 'system'
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadTheme = async () => {
			try {
				const savedTheme = await AsyncStorage.getItem("user_theme");
				if (savedTheme) {
					setTheme(savedTheme);
				} else {
					setTheme("system");
				}
			} catch (e) {
				console.log("Failed to load theme", e);
			} finally {
				setLoading(false);
			}
		};
		loadTheme();
	}, []);

	const toggleTheme = async (newTheme) => {
		setTheme(newTheme);
		try {
			await AsyncStorage.setItem("user_theme", newTheme);
		} catch (e) {
			console.log("Failed to save theme", e);
		}
	};

	const activeTheme = theme === "system" ? systemScheme || "light" : theme;
	const colors = activeTheme === "dark" ? darkColors : lightColors;

	return (
		<ThemeContext.Provider
			value={{ theme, activeTheme, toggleTheme, colors, loading }}
		>
			{children}
		</ThemeContext.Provider>
	);
};

export const useTheme = () => useContext(ThemeContext);
