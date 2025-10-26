import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii } from "../../theme";

export default function TabsLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarShowLabel: true,
				tabBarActiveTintColor: colors.primary,
				tabBarInactiveTintColor: colors.subtext,
				tabBarLabelStyle: { fontWeight: "600" },
				tabBarStyle: {
					backgroundColor: colors.surface,
					borderTopWidth: 0,
					height: 60,
					elevation: 12,
					shadowColor: "rgba(15,23,42,0.08)",
					borderTopLeftRadius: radii.lg,
					borderTopRightRadius: radii.lg,
					position: "absolute",
					left: 16,
					right: 16,
					bottom: 12,
				},
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
