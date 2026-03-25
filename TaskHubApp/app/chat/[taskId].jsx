import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	ActivityIndicator,
	FlatList,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../api/api";
import { AuthContext } from "../../context/AuthContext";
import { colors, spacing } from "../../theme.js";

const normalizeMessages = (messages = []) =>
	messages.map((msg) => ({
		...msg,
		senderId:
			typeof msg.senderId === "string" ? { _id: msg.senderId } : msg.senderId,
		receiverId:
			typeof msg.receiverId === "string"
				? { _id: msg.receiverId }
				: msg.receiverId,
	}));

export default function ChatDetail() {
	const { taskId } = useLocalSearchParams();
	const { user } = useContext(AuthContext);

	const [task, setTask] = useState(null);
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(true);
	const [sending, setSending] = useState(false);
	const [error, setError] = useState("");
	const [refreshing, setRefreshing] = useState(false);

	const fetchThread = useCallback(async () => {
		if (!taskId) return null;

		const [taskRes, messagesRes] = await Promise.all([
			api.get(`/tasks/${taskId}`),
			api.get(`/messages/${taskId}`),
		]);

		return {
			task: taskRes.data.task,
			messages: normalizeMessages(messagesRes.data.messages),
		};
	}, [taskId]);

	useEffect(() => {
		let isMounted = true;

		const loadThread = async () => {
			if (!taskId) return;

			try {
				setLoading(true);
				setError("");
				const data = await fetchThread();

				if (!isMounted || !data) return;

				setTask(data.task);
				setMessages(data.messages);
			} catch (err) {
				if (!isMounted) return;
				setError(err.response?.data?.message || "Failed to load chat");
			} finally {
				if (isMounted) setLoading(false);
			}
		};

		loadThread();

		return () => {
			isMounted = false;
		};
	}, [fetchThread, taskId]);

	const handleRefresh = useCallback(async () => {
		if (!taskId) return;

		try {
			setRefreshing(true);
			const data = await fetchThread();

			if (data) {
				setTask(data.task);
				setMessages(data.messages);
				setError("");
			}
		} catch (err) {
			setError(err.response?.data?.message || "Failed to refresh chat");
		} finally {
			setRefreshing(false);
		}
	}, [fetchThread, taskId]);

	const counterpartId = useMemo(() => {
		if (!user?._id) return null;

		const participants = new Set();
		messages.forEach((msg) => {
			if (msg.senderId?._id) participants.add(msg.senderId._id);
			if (msg.receiverId?._id) participants.add(msg.receiverId._id);
		});

		participants.delete(user._id);

		if (participants.size > 0) {
			return participants.values().next().value;
		}

		if (task?.postedBy?._id && task.postedBy._id !== user._id) {
			return task.postedBy._id;
		}

		if (task?.assignedTo && task.assignedTo !== user._id) {
			return task.assignedTo;
		}

		if (task?.completedBy && task.completedBy !== user._id) {
			return task.completedBy;
		}

		return null;
	}, [messages, task, user?._id]);

	const counterpartName = useMemo(() => {
		if (!counterpartId) return "";

		const fromMessages = messages.find(
			(msg) =>
				msg.senderId?._id === counterpartId || msg.receiverId?._id === counterpartId
		);

		if (fromMessages?.senderId?._id === counterpartId) {
			return fromMessages.senderId?.name || "";
		}

		if (fromMessages?.receiverId?._id === counterpartId) {
			return fromMessages.receiverId?.name || "";
		}

		if (task?.postedBy?._id === counterpartId) {
			return task.postedBy?.name || "";
		}

		return "";
	}, [counterpartId, messages, task]);

	const handleSend = async () => {
		const content = input.trim();
		if (!content || sending) return;

		if (!counterpartId) {
			setError("No recipient available for this conversation.");
			return;
		}

		try {
			setSending(true);
			setError("");
			const res = await api.post("/messages", {
				taskId,
				receiverId: counterpartId,
				content,
			});

			const saved = {
				...res.data.message,
				senderId: { _id: user._id, name: user?.name },
				receiverId: { _id: counterpartId, name: counterpartName },
			};

			setMessages((prev) => [...prev, saved]);
			setInput("");
		} catch (err) {
			setError(err.response?.data?.message || "Failed to send message");
		} finally {
			setSending(false);
		}
	};

	const renderMessage = ({ item }) => {
		const isMine = item.senderId?._id === user?._id;
		return (
			<View
				style={[
					styles.message,
					isMine ? styles.messageOutgoing : styles.messageIncoming,
				]}
			>
				{!isMine && item.senderId?.name ? (
					<Text style={styles.messageAuthor}>{item.senderId.name}</Text>
				) : null}
				<Text style={[styles.messageText, isMine && styles.messageTextOutgoing]}>
					{item.content}
				</Text>
				<Text style={[styles.messageTime, isMine && styles.messageTimeOutgoing]}>
					{new Date(item.createdAt).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					})}
				</Text>
			</View>
		);
	};

	if (loading) {
		return (
			<View style={styles.center}>
				<ActivityIndicator size='large' color={colors.primary} />
			</View>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.taskTitle}>{task?.title || "Conversation"}</Text>
				{counterpartName ? (
					<Text style={styles.counterpart}>with {counterpartName}</Text>
				) : null}
			</View>

			{error ? <Text style={styles.errorText}>{error}</Text> : null}

			<FlatList
				data={messages}
				keyExtractor={(item) => item._id || item.id}
				renderItem={renderMessage}
				contentContainerStyle={styles.list}
				refreshing={refreshing}
				onRefresh={handleRefresh}
			/>

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				keyboardVerticalOffset={80}
			>
				<View style={styles.composer}>
					<TextInput
						value={input}
						onChangeText={setInput}
						placeholder='Type a message'
						style={styles.input}
						editable={!sending}
					/>
					<TouchableOpacity
						style={styles.sendButton}
						onPress={handleSend}
						disabled={sending}
					>
						<Text style={styles.sendLabel}>{sending ? "..." : "Send"}</Text>
					</TouchableOpacity>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.background },
	center: { flex: 1, justifyContent: "center", alignItems: "center" },
	header: {
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.md,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: "rgba(0,0,0,0.05)",
	},
	taskTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
	counterpart: { marginTop: 4, color: colors.subtext },
	errorText: {
		color: "#FF3B30",
		paddingHorizontal: spacing.md,
		marginTop: spacing.xs,
	},
	list: { padding: spacing.md },
	message: {
		padding: spacing.sm,
		borderRadius: 14,
		marginBottom: spacing.sm,
		maxWidth: "80%",
	},
	messageIncoming: {
		alignSelf: "flex-start",
		backgroundColor: "#fff",
	},
	messageOutgoing: {
		alignSelf: "flex-end",
		backgroundColor: colors.primary,
	},
	messageAuthor: { fontWeight: "600", marginBottom: 4, color: colors.subtext },
	messageText: { color: colors.text },
	messageTextOutgoing: { color: "#fff" },
	messageTime: { marginTop: 6, fontSize: 12, color: colors.subtext },
	messageTimeOutgoing: { color: "rgba(255,255,255,0.8)" },
	composer: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.sm,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: "rgba(0,0,0,0.05)",
		backgroundColor: "#fff",
	},
	input: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.03)",
		borderRadius: 20,
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.xs,
		marginRight: spacing.sm,
	},
	sendButton: {
		backgroundColor: colors.primary,
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.xs,
		borderRadius: 20,
	},
	sendLabel: { color: "#fff", fontWeight: "600" },
});
