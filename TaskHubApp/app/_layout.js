import React, { useContext, useEffect } from "react";
import { Stack, Slot, Redirect } from "expo-router";
import { AuthProvider, AuthContext } from "../context/AuthContext";

function AuthGuard() {
	const { user, loading } = useContext(AuthContext);

	if (loading) return null; // show splash later

	// If not logged in → send to login
	if (!user) return <Redirect href='/login' />;

	// Otherwise → show main tabs
	return <Slot />;
}

export default function RootLayout() {
	return (
		<AuthProvider>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name='(tabs)' options={{ headerShown: false }} />
				<Stack.Screen name='login' />
				<Stack.Screen name='register' />
			</Stack>
			<AuthGuard />
		</AuthProvider>
	);
}
