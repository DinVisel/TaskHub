import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, View, Text } from "react-native";
import { useNotifications } from "../../context/NotificationContext";

const NotificationBadge = () => {
	const { unreadCount } = useNotifications();
	if (unreadCount === 0) return null;
	return (
		<View
			style={{
				position: "absolute",
				right: -6,
				top: -3,
				backgroundColor: "red",
				borderRadius: 10,
				width: 20,
				height: 20,
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<Text style={{ color: "white", fontSize: 12, fontWeight: "bold" }}>
				{unreadCount > 99 ? "99+" : unreadCount}
			</Text>
		</View>
	);
};

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
					paddingTop: 10,
					paddingHorizontal: 10,
					marginHorizontal: 40,
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
							size={30}
							color={focused ? "#007bff" : "#999"}
						/>
					),
				}}
			/>

			{/* Add Task Screen */}
			<Tabs.Screen
				name='post-task'
				options={{
					tabBarIcon: ({ focused }) => (
						<Ionicons
							name={focused ? "add-circle" : "add-circle-outline"}
							size={30}
							color={focused ? "#007bff" : "#999"}
						/>
					),
				}}
			/>

			<Tabs.Screen
				name='notifications'
				options={{
					tabBarIcon: ({ focused }) => (
						<View>
							<Ionicons
								name={focused ? "notifications" : "notifications-outline"}
								size={30}
								color={focused ? "#007bff" : "#999"}
							/>
							<NotificationBadge />
						</View>
					),
				}}
			/>

			{/* Profile Screen */}
			<Tabs.Screen
				name='account'
				options={{
					tabBarIcon: ({ focused }) => (
						<Ionicons
							name={focused ? "person" : "person-outline"}
							size={30}
							color={focused ? "#007bff" : "#999"}
						/>
					),
				}}
			/>
		</Tabs>
	);
}
