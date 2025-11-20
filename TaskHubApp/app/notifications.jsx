import React, { useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
} from "react-native";
import { useNotifications } from "../context/NotificationContext";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "expo-router";

export default function NotificationsScreen() {
    const {
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
    } = useNotifications();
    const router = useRouter();
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchNotifications();
        setRefreshing(false);
    };

    const handlePress = async (notification) => {
        if (!notification.isRead) {
            await markAsRead(notification._id);
        }

        // Navigate based on type
        if (notification.data?.taskId) {
            router.push(`/tasks/${notification.data.taskId}`);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case "MESSAGE":
                return "chatbubble-ellipses-outline";
            case "OFFER_RECEIVED":
                return "pricetag-outline";
            case "OFFER_ACCEPTED":
                return "checkmark-circle-outline";
            case "TASK_COMPLETED":
                return "trophy-outline";
            case "PAYMENT_RECEIVED":
                return "cash-outline";
            default:
                return "notifications-outline";
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.item, !item.isRead && styles.unreadItem]}
            onPress={() => handlePress(item)}
        >
            <View style={styles.iconContainer}>
                <Ionicons name={getIcon(item.type)} size={24} color="#6C63FF" />
            </View>
            <View style={styles.contentContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.message} numberOfLines={2}>
                    {item.message}
                </Text>
                <Text style={styles.time}>
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </Text>
            </View>
            {!item.isRead && <View style={styles.dot} />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Notifications</Text>
                {unreadCount > 0 && (
                    <TouchableOpacity onPress={markAllAsRead}>
                        <Text style={styles.markAll}>Mark all read</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons
                            name="notifications-off-outline"
                            size={48}
                            color="#ccc"
                        />
                        <Text style={styles.emptyText}>No notifications yet</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    markAll: {
        color: "#6C63FF",
        fontWeight: "600",
    },
    list: {
        padding: 10,
    },
    item: {
        flexDirection: "row",
        backgroundColor: "#fff",
        padding: 15,
        marginBottom: 10,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    unreadItem: {
        backgroundColor: "#f0f0ff",
        borderLeftWidth: 4,
        borderLeftColor: "#6C63FF",
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 4,
    },
    message: {
        fontSize: 14,
        color: "#666",
        marginBottom: 4,
    },
    time: {
        fontSize: 12,
        color: "#999",
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#6C63FF",
        marginLeft: 10,
    },
    empty: {
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 100,
    },
    emptyText: {
        marginTop: 10,
        color: "#999",
        fontSize: 16,
    },
});
