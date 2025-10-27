import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

export default function Layout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarShowLabel: false,
				tabBarStyle: {
					position: "absolute",
					bottom: 25,
					left: 20,
					right: 20,
					elevation: 0,
					backgroundColor: "#ffffff",
					borderRadius: 50,
					height: 70,
					shadowColor: "#000",
					shadowOffset: { width: 0, height: 10 },
					shadowOpacity: 0.1,
					shadowRadius: 10,
					marginBottom: Platform.OS === "ios" ? 20 : 10,
				},
			}}
		>
			{/* Home Screen */}
			<Tabs.Screen
				name='index' // corresponds to app/index.js
				options={{
					tabBarIcon: ({ focused }) => (
						<Ionicons
							name={focused ? "home" : "home-outline"}
							size={26}
							color={focused ? "#007bff" : "#999"}
						/>
					),
				}}
			/>

			{/* Add Task Screen */}
			<Tabs.Screen
				name='post-task' // corresponds to app/add.js
				options={{
					tabBarIcon: ({ focused }) => (
						<Ionicons
							name={focused ? "add-circle" : "add-circle-outline"}
							size={38}
							color={focused ? "#007bff" : "#999"}
						/>
					),
				}}
			/>

			{/* Profile Screen */}
			<Tabs.Screen
				name='account' // corresponds to app/profile.js
				options={{
					tabBarIcon: ({ focused }) => (
						<Ionicons
							name={focused ? "person" : "person-outline"}
							size={26}
							color={focused ? "#007bff" : "#999"}
						/>
					),
				}}
			/>
		</Tabs>
	);
}
