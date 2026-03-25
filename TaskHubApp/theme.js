export const lightColors = {
	primary: "#2563EB",
	secondary: "#60A5FA",
	accent: "#F97316",
	background: "#F8FAFC",
	surface: "#FFFFFF",
	card: "#FFFFFF",
	text: "#0F172A",
	subtext: "#64748B",
	border: "rgba(148, 163, 184, 0.3)",
	success: "#16A34A",
	danger: "#DC2626",
};

export const darkColors = {
	primary: "#3B82F6", // Lighter blue for dark mode
	secondary: "#60A5FA",
	accent: "#FB923C",
	background: "#0F172A", // Dark slate
	surface: "#1E293B", // Lighter slate
	card: "#1E293B",
	text: "#F1F5F9", // Light gray text
	subtext: "#94A3B8",
	border: "rgba(148, 163, 184, 0.2)",
	success: "#22C55E",
	danger: "#EF4444",
};

// Default export for backward compatibility (Light mode)
export const colors = lightColors;

export const spacing = {
	xs: 4,
	sm: 8,
	md: 16,
	lg: 24,
	xl: 32,
};

export const fonts = {
	title: 24,
	subtitle: 18,
	body: 16,
	caption: 13,
};

export const radii = {
	xs: 6,
	sm: 10,
	md: 16,
	lg: 24,
	pill: 999,
};

export const shadow = {
	card: {
		shadowColor: "rgba(15, 23, 42, 0.12)",
		shadowOffset: { width: 0, height: 12 },
		shadowOpacity: 1,
		shadowRadius: 24,
		elevation: 8,
	},
};
