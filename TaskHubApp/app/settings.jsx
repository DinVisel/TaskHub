import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { colors as defaultColors, spacing, fonts, radii, shadow } from '../theme';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme, colors } = useTheme();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.header}
      >
        <Text style={[styles.headerTitle, { color: defaultColors.surface }]}>{t('settings')}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Language Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('language')}</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.optionButton, i18n.language === 'en' && styles.activeOption, { borderColor: colors.border }]}
              onPress={() => changeLanguage('en')}
            >
              <Text style={[styles.optionText, i18n.language === 'en' && styles.activeOptionText, { color: colors.text }]}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, i18n.language === 'tr' && styles.activeOption, { borderColor: colors.border }]}
              onPress={() => changeLanguage('tr')}
            >
              <Text style={[styles.optionText, i18n.language === 'tr' && styles.activeOptionText, { color: colors.text }]}>Türkçe</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Theme Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('theme')}</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.optionButton, theme === 'light' && styles.activeOption, { borderColor: colors.border }]}
              onPress={() => toggleTheme('light')}
            >
              <Text style={[styles.optionText, theme === 'light' && styles.activeOptionText, { color: colors.text }]}>{t('light_mode')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, theme === 'dark' && styles.activeOption, { borderColor: colors.border }]}
              onPress={() => toggleTheme('dark')}
            >
              <Text style={[styles.optionText, theme === 'dark' && styles.activeOptionText, { color: colors.text }]}>{t('dark_mode')}</Text>
            </TouchableOpacity>
             <TouchableOpacity
              style={[styles.optionButton, theme === 'system' && styles.activeOption, { borderColor: colors.border }]}
              onPress={() => toggleTheme('system')}
            >
              <Text style={[styles.optionText, theme === 'system' && styles.activeOptionText, { color: colors.text }]}>{t('system_default')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications Section (Mock) */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.switchRow}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>{t('enable_notifications')}</Text>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: "#767577", true: colors.primary }}
              thumbColor={defaultColors.surface}
            />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: radii.lg,
    borderBottomRightRadius: radii.lg,
    ...shadow.card,
  },
  headerTitle: {
    fontSize: fonts.title,
    fontWeight: "700",
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  section: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  sectionTitle: {
    fontSize: fonts.subtitle,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  activeOption: {
    backgroundColor: defaultColors.primary,
    borderColor: defaultColors.primary,
  },
  optionText: {
    fontWeight: "600",
  },
  activeOptionText: {
    color: defaultColors.surface,
  },
});
