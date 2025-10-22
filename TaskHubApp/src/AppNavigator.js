import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./screens/HomeScreen";
import AccountScreen from "./screens/AccountScreen";
import PostTaskScreen from "./screens/PostTaskScreen";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
	return (
		<NavigationContainer>
			<Tab.Navigator>
				<Tab.Screen name='Home' component={HomeScreen} />
				<Tab.Screen name='Post Task' component={PostTaskScreen} />
				<Tab.Screen name='Account' component={AccountScreen} />
			</Tab.Navigator>
		</NavigationContainer>
	);
}
