import AppNavigator from "./src/AppNavigator.js";
import { AuthProvider } from "./src/context/AuthContext.js";
import React from "react";

export default function App() {
	return;
	<AuthProvider>
		<AppNavigator />
	</AuthProvider>;
}
