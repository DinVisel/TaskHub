import React, { useEffect, useRef, useState } from "react";
import { Animated, View, Text, StyleSheet, StatusBar, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import api from "../../api/api";

export default function Home() {
	const [tasks, setTasks] = useState([]);

	const scrollY = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		const fetchTasks = async () => {
			try {
				const res = await api.get("/tasks");
				setTasks(res.data.tasks);
			} catch (err) {
				console.log("Error fetching tasks:", err.message);
			}
		};
		fetchTasks();
	}, []);

	const headerHeight = scrollY.interpolate({
		inputRange: [0, 80],
		outputRange: [120, 60],
		extrapolate: "clamp",
	});

	const headerFontSize = scrollY.interpolate({
		inputRange: [0, 80],
		outputRange: [28, 20],
		extrapolate: "clamp",
	});

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: "#fdfdfd" }}>
			<StatusBar barStyle='dark-content' />
			{/* Animated Header */}
			<Animated.View style={[styles.header, { height: headerHeight }]}>
				<Animated.Text style={[styles.headerTitle, { fontSize: headerFontSize }]}>
					TaskHub
				</Animated.Text>
				<Text style={styles.subHeader}>Find local help or offer your skills</Text>
			</Animated.View>

                        {/* Scrollable Content */}
                        <Animated.FlatList
                                style={{ flex: 1 }}
                                data={tasks}
                                keyExtractor={(item) => item._id}
                                renderItem={({ item }) => (
                                        <TouchableOpacity
                                                style={styles.thread}
                                                onPress={() => router.push(`/chat/${item._id}`)}
                                        >
                                                <View style={styles.taskCard}>
                                                        <Text style={styles.taskTitle}>{item.title}</Text>
                                                        <Text style={styles.taskDesc}>{item.description}</Text>
                                                </View>
                                        </TouchableOpacity>
                                )}
                                onScroll={Animated.event(
                                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                                        { useNativeDriver: false }
                                )}
                                contentContainerStyle={styles.listContent}
                                showsVerticalScrollIndicator={false}
                                ListEmptyComponent={() => (
                                        <View style={styles.emptyState}>
                                                <Text style={styles.emptyText}>No tasks available yet</Text>
                                        </View>
                                )}
                        />
                </SafeAreaView>
        );
}

const styles = StyleSheet.create({
	header: {
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#007AFF",
		borderBottomLeftRadius: 20,
		borderBottomRightRadius: 20,
		elevation: 4,
		shadowColor: "#000",
		shadowOpacity: 0.2,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 3,
	},
	headerTitle: {
		color: "white",
		fontWeight: "bold",
		letterSpacing: 0.5,
	},
	subHeader: {
		color: "rgba(255,255,255,0.85)",
		marginTop: 4,
		fontSize: 13,
	},
        listContent: {
                paddingHorizontal: 20,
                paddingTop: 140,
                paddingBottom: 20,
        },
        taskCard: {
                backgroundColor: "#fff",
                padding: 14,
                borderRadius: 10,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 3,
        },
        taskTitle: {
                fontWeight: "bold",
                fontSize: 16,
                marginBottom: 4,
        },
        taskDesc: {
                color: "#555",
        },
        thread: {
                marginBottom: 16,
        },
        emptyState: {
                marginTop: 100,
                alignItems: "center",
        },
        emptyText: {
                color: "#888",
        },
});
