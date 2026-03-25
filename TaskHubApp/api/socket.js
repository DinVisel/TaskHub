import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SOCKET_URL = "http://localhost:4000";

let socket;

export const connectSocket = async () => {
	const token = await AsyncStorage.getItem("token");
	socket = io(SOCKET_URL, {
		auth: { token },
		transports: ["websocket"],
	});

	socket.on("connect", () => {
		console.log("✅ Socket connected:", socket.id);
	});

	socket.on("disconnect", () => {
		console.log("❌ Socket disconnected");
	});

	return socket;
};

export const getSocket = () => socket;
