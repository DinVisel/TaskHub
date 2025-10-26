import React, { useState, useContext } from "react";
import {
        View,
        Text,
        TextInput,
        StyleSheet,
        TouchableOpacity,
        KeyboardAvoidingView,
        Platform,
        ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";
import { router } from "expo-router";
import { colors, spacing, fonts, radii, shadow } from "../theme";

export default function Login() {
	const { login } = useContext(AuthContext);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleLogin = async () => {
		try {
			await login(email, password);
			router.replace("/"); // go to home
		} catch (err) {
			setError(err.response?.data?.message || "Login failed");
		}
	};

        return (
                <SafeAreaView style={styles.safeArea}>
                        <LinearGradient
                                colors={[colors.primary, colors.secondary]}
                                style={styles.hero}
                        >
                                <Text style={styles.heroTitle}>Welcome back</Text>
                                <Text style={styles.heroSubtitle}>
                                        Sign in to continue finding and posting jobs with TaskHub.
                                </Text>
                        </LinearGradient>

                        <KeyboardAvoidingView
                                behavior={Platform.OS === "ios" ? "padding" : undefined}
                                style={styles.flex}
                        >
                                <ScrollView
                                        contentContainerStyle={styles.content}
                                        keyboardShouldPersistTaps='handled'
                                >
                                        <View style={styles.card}>
                                                <Text style={styles.title}>Log in to your account</Text>
                                                <TextInput
                                                        style={styles.input}
                                                        placeholder='Email address'
                                                        placeholderTextColor={colors.subtext}
                                                        value={email}
                                                        autoCapitalize='none'
                                                        keyboardType='email-address'
                                                        onChangeText={setEmail}
                                                />
                                                <TextInput
                                                        style={styles.input}
                                                        placeholder='Password'
                                                        placeholderTextColor={colors.subtext}
                                                        value={password}
                                                        secureTextEntry
                                                        onChangeText={setPassword}
                                                />
                                                {error ? <Text style={styles.error}>{error}</Text> : null}

                                                <TouchableOpacity
                                                        style={[styles.button, styles.primaryButton]}
                                                        onPress={handleLogin}
                                                >
                                                        <Text style={styles.primaryButtonText}>Sign in</Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                        style={[styles.button, styles.secondaryButton]}
                                                        onPress={() => router.push("/register")}
                                                >
                                                        <Text style={styles.secondaryButtonText}>
                                                                Create a new account
                                                        </Text>
                                                </TouchableOpacity>
                                        </View>
                                </ScrollView>
                        </KeyboardAvoidingView>
                </SafeAreaView>
        );
}

const styles = StyleSheet.create({
        safeArea: {
                flex: 1,
                backgroundColor: colors.background,
        },
        flex: { flex: 1 },
        hero: {
                paddingHorizontal: spacing.lg,
                paddingTop: spacing.xl,
                paddingBottom: spacing.lg,
                borderBottomLeftRadius: radii.lg,
                borderBottomRightRadius: radii.lg,
        },
        heroTitle: {
                color: colors.surface,
                fontSize: fonts.title,
                fontWeight: "700",
        },
        heroSubtitle: {
                marginTop: spacing.sm,
                color: "rgba(255,255,255,0.8)",
                fontSize: fonts.body,
                lineHeight: 22,
        },
        content: {
                padding: spacing.lg,
        },
        card: {
                backgroundColor: colors.surface,
                borderRadius: radii.lg,
                padding: spacing.lg,
                ...shadow.card,
        },
        title: {
                fontSize: fonts.subtitle,
                fontWeight: "700",
                color: colors.text,
                marginBottom: spacing.lg,
        },
        input: {
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radii.sm,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                marginBottom: spacing.md,
                backgroundColor: "rgba(255,255,255,0.7)",
                color: colors.text,
        },
        error: {
                color: colors.danger,
                textAlign: "center",
                marginBottom: spacing.md,
        },
        button: {
                borderRadius: radii.pill,
                paddingVertical: spacing.sm + 4,
                alignItems: "center",
                marginTop: spacing.sm,
        },
        primaryButton: {
                backgroundColor: colors.primary,
        },
        primaryButtonText: {
                color: colors.surface,
                fontWeight: "700",
                fontSize: fonts.body,
        },
        secondaryButton: {
                backgroundColor: "transparent",
                borderWidth: 1,
                borderColor: colors.border,
        },
        secondaryButtonText: {
                color: colors.text,
                fontWeight: "600",
        },
});
