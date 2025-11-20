import React, { createContext, useState, useEffect, useContext } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants from "expo-constants";
import api from "../api/api.js";
import { AuthContext } from "./AuthContext.js";

const NotificationContext = createContext();

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: true,
	}),
});

export const NotificationProvider = ({ children }) => {
	const { user } = useContext(AuthContext);
	const [notifications, setNotifications] = useState([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [expoPushToken, setExpoPushToken] = useState("");

	useEffect(() => {
		if (user) {
			registerForPushNotificationsAsync().then((token) => {
				setExpoPushToken(token);
				if (token) {
					// Send token to backend
					api.post("/notifications/push-token", { pushToken: token }).catch(
						(err) => console.log("Failed to sync push token", err)
					);
				}
			});

			fetchNotifications();
			// Poll for notifications every minute (simple alternative to sockets for now)
			const interval = setInterval(fetchNotifications, 60000);
			return () => clearInterval(interval);
		}
	}, [user]);

	const fetchNotifications = async () => {
		try {
			const res = await api.get("/notifications?limit=20");
			setNotifications(res.data.notifications);
			setUnreadCount(res.data.unreadCount);
		} catch (error) {
			console.log("Error fetching notifications:", error);
		}
	};

	const markAsRead = async (id) => {
		try {
			await api.patch(`/notifications/${id}/read`);
			setNotifications((prev) =>
				prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
			);
			setUnreadCount((prev) => Math.max(0, prev - 1));
		} catch (error) {
			console.log("Error marking as read:", error);
		}
	};

	const markAllAsRead = async () => {
		try {
			await api.patch("/notifications/read-all");
			setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
			setUnreadCount(0);
		} catch (error) {
			console.log("Error marking all as read:", error);
		}
	};

	return (
		<NotificationContext.Provider
			value={{
				notifications,
				unreadCount,
				fetchNotifications,
				markAsRead,
				markAllAsRead,
				expoPushToken,
			}}
		>
			{children}
		</NotificationContext.Provider>
	);
};

export const useNotifications = () => useContext(NotificationContext);

async function registerForPushNotificationsAsync() {
	let token;

	if (Platform.OS === "android") {
		await Notifications.setNotificationChannelAsync("default", {
			name: "default",
			importance: Notifications.AndroidImportance.MAX,
			vibrationPattern: [0, 250, 250, 250],
			lightColor: "#FF231F7C",
		});
	}

	if (Constants.isDevice) {
		const { status: existingStatus } =
			await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;
		if (existingStatus !== "granted") {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}
		if (finalStatus !== "granted") {
			console.log("Failed to get push token for push notification!");
			return;
		}
		token = (
			await Notifications.getExpoPushTokenAsync({
				projectId: Constants.expoConfig.extra.eas.projectId,
			})
		).data;
	} else {
		console.log("Must use physical device for Push Notifications");
	}

	return token;
}
