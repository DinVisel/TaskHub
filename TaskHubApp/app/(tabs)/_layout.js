import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme";

const TabIcon = ({ icon, label, focused }) => {
	return (
		<View style={[styles.tabItem, focused && styles.tabItemActive]}>
			<Ionicons
				name={icon}
				size={24}
				color={focused ? colors.surface : colors.subtext}
			/>
			<Text
				style={[styles.tabLabel, focused && styles.tabLabelActive]}
				numberOfLines={1}
				ellipsizeMode='clip'
			>
				{label}
			</Text>
		</View>
	);
};

const buildScreenOptions = (icon, label) => ({
	title: label,
	tabBarIcon: ({ focused }) => (
		<TabIcon icon={icon} label={label} focused={focused} />
	),
});

export default function TabsLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarShowLabel: false,
				tabBarActiveTintColor: colors.primary,
				tabBarInactiveTintColor: colors.subtext,
				tabBarHideOnKeyboard: true,
				tabBarStyle: styles.tabBar,
				tabBarItemStyle: styles.tabBarItem,
				tabBarBackground: () => <View style={styles.tabBackground} />,
			}}
		>
			<Tabs.Screen name='index' options={buildScreenOptions("home", "Home")} />
			<Tabs.Screen
				name='post-task'
				options={buildScreenOptions("add-circle", "Post Task")}
			/>
			<Tabs.Screen
				name='account'
				options={buildScreenOptions("person", "Account")}
			/>
		</Tabs>
	);
}

const styles = StyleSheet.create({
	tabBar: {
		position: "absolute",
		left: 20,
		right: 20,
		bottom: 24,
		height: 80,
		borderTopWidth: 0,
		backgroundColor: "transparent",
		elevation: 0,
	},
	tabBarItem: {
		paddingVertical: 0,
	},
	tabBackground: {
		flex: 1,
		borderRadius: 999,
		marginHorizontal: 4,
		marginVertical: 8,
		backgroundColor: colors.surface,
		shadowColor: "rgba(15, 23, 42, 0.18)",
		shadowOpacity: 1,
		shadowOffset: { width: 0, height: 14 },
		shadowRadius: 24,
		elevation: 20,
	},
	tabItem: {
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderRadius: 20,
	},
	tabItemActive: {
		backgroundColor: colors.primary,
		shadowColor: "rgba(37, 99, 235, 0.3)",
		shadowOpacity: 1,
		shadowOffset: { width: 0, height: 8 },
		shadowRadius: 16,
		elevation: 10,
	},
	tabLabel: {
		fontSize: 13,
		color: colors.subtext,
		fontWeight: "600",
		maxWidth: 70,
		textAlign: "center",
	},
	tabLabelActive: {
		color: colors.surface,
	},
});
