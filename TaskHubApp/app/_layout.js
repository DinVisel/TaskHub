import React, { useContext } from "react";
import { Stack } from "expo-router";
import { AuthProvider, AuthContext } from "../context/AuthContext";
// import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

function AuthenticatedStack() {
	const { user, loading } = useContext(AuthContext);

	if (loading) return null; // TODO: add splash screen

	if (!user) {
		return (
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name='login' />
				<Stack.Screen name='register' />
			</Stack>
		);
	}

        return (
                <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
                        <Stack.Screen name='edit-profile' options={{ headerShown: false }} />
                        <Stack.Screen name='tasks/[taskId]' options={{ headerShown: false }} />
                </Stack>
        );
}

import { NotificationProvider } from "../context/NotificationContext";

export default function RootLayout() {
	return (
		<NotificationProvider>
			<AuthProvider>
				<AuthenticatedStack />
			</AuthProvider>
		</NotificationProvider>
	);
}
