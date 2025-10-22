import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import AccountScreen from "./screens/AccountScreen";
import PostTaskScreen from "./screens/PostTaskScreen";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import React, { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
	const { user, loading } = useContext(AuthContext);

	if (loading) return null; // later: show splash

	return (
		<NavigationContainer>
			{user ? (
				<Stack.Navigator>
					<Stack.Screen name='Home' component={HomeScreen} />
					<Stack.Screen name='Post Task' component={PostTaskScreen} />
					<Stack.Screen name='Account' component={AccountScreen} />
				</Stack.Navigator>
			) : (
				<Stack.Navigator>
					<Stack.Screen name='Login' component={LoginScreen} />
					<Stack.Screen name='Register' component={RegisterScreen} />
				</Stack.Navigator>
			)}
		</NavigationContainer>
	);
}
