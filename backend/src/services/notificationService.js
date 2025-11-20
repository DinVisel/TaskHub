import { Expo } from "expo-server-sdk";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

const expo = new Expo();

/**
 * Create a notification and optionally send a push notification
 * @param {string} recipientId - User ID to receive notification
 * @param {string} type - Notification type (MESSAGE, OFFER_RECEIVED, etc.)
 * @param {string} title - Notification title
 * @param {string} message - Notification body
 * @param {object} data - Additional data (taskId, etc.)
 */
export const createNotification = async (
	recipientId,
	type,
	title,
	message,
	data = {}
) => {
	try {
		// 1. Create in-app notification
		const notification = await Notification.create({
			recipientId,
			type,
			title,
			message,
			data,
		});

		// 2. Send push notification if user has a token
		const user = await User.findById(recipientId);
		if (user && user.pushToken && Expo.isExpoPushToken(user.pushToken)) {
			await sendPushNotification(user.pushToken, title, message, data);
		}

		return notification;
	} catch (error) {
		console.error("Error creating notification:", error);
		// Don't throw, just log. Notification failure shouldn't break the main flow.
	}
};

/**
 * Send a push notification via Expo
 */
export const sendPushNotification = async (pushToken, title, body, data) => {
	const messages = [
		{
			to: pushToken,
			sound: "default",
			title,
			body,
			data,
		},
	];

	try {
		const chunks = expo.chunkPushNotifications(messages);
		for (const chunk of chunks) {
			try {
				const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
				// console.log("Push notification ticket:", ticketChunk);
			} catch (error) {
				console.error("Error sending push notification chunk:", error);
			}
		}
	} catch (error) {
		console.error("Error sending push notification:", error);
	}
};
