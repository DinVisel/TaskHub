import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarShowLabel: true,
				tabBarActiveTintColor: "#007AFF",
				tabBarStyle: { backgroundColor: "#fff", borderTopWidth: 0, height: 60 },
			}}
		>
			<Tabs.Screen
				name='index'
				options={{
					title: "Home",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name='home-outline' color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name='post-task'
				options={{
					title: "Post Task",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name='add-circle-outline' color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name='account'
				options={{
					title: "Account",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name='person-outline' color={color} size={size} />
					),
				}}
			/>
		</Tabs>
	);
}
