/**
 * OmniTask - Settings Screen
 * Theme switcher, floating widget controls, and app preferences
 */
import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../../../theme/ThemeContext';
import {useAppStore} from '../../../core/store/useAppStore';
import FloatingWidget from '../../FloatingWidget/FloatingWidget';

const THEME_OPTIONS = [
  {key: 'light', label: 'Light', icon: 'white-balance-sunny', desc: 'Clean & Bright'},
  {key: 'dark', label: 'Dark', icon: 'weather-night', desc: 'Easy on the eyes'},
  {key: 'neon', label: 'Neon', icon: 'lightning-bolt', desc: 'Cyberpunk vibes'},
];

const SettingsScreen = () => {
  const {colors, shadows, themeName} = useTheme();
  const {
    theme,
    setTheme,
    floatingWidgetEnabled,
    showOnUnlock,
    toggleFloatingWidget,
    toggleShowOnUnlock,
    taskStats,
  } = useAppStore();

  const handleWidgetToggle = async (enabled) => {
    if (enabled) {
      const hasPermission = await FloatingWidget.checkPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'OmniTask needs "Display over other apps" permission for the floating widget.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Open Settings', onPress: () => FloatingWidget.requestPermission()},
          ],
        );
        return;
      }
      await FloatingWidget.start();
    } else {
      await FloatingWidget.stop();
    }
    toggleFloatingWidget(enabled);
  };

  return (
    <ScrollView style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Theme Section */}
      <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>🎨 Theme</Text>
      <View style={styles.themeGrid}>
        {THEME_OPTIONS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[
              styles.themeCard,
              {
                backgroundColor: theme === t.key ? colors.primary + '18' : colors.card,
                borderColor: theme === t.key ? colors.primary : colors.border,
                ...shadows.small,
              },
            ]}
            onPress={() => setTheme(t.key)}>
            <Icon
              name={t.icon}
              size={28}
              color={theme === t.key ? colors.primary : colors.textMuted}
            />
            <Text style={[
              styles.themeName,
              {color: theme === t.key ? colors.primary : colors.textPrimary},
            ]}>
              {t.label}
            </Text>
            <Text style={[styles.themeDesc, {color: colors.textMuted}]}>{t.desc}</Text>
            {theme === t.key && (
              <View style={[styles.activeIndicator, {backgroundColor: colors.primary}]}>
                <Icon name="check" size={14} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Floating Widget Section */}
      <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>🔲 Floating Widget</Text>
      <View style={[styles.settingsCard, {backgroundColor: colors.card, ...shadows.small}]}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Icon name="picture-in-picture-top-right" size={20} color={colors.primary} />
            <View style={{marginLeft: 12}}>
              <Text style={[styles.settingLabel, {color: colors.textPrimary}]}>
                Enable Floating Widget
              </Text>
              <Text style={[styles.settingDesc, {color: colors.textMuted}]}>
                Show task overlay on home screen
              </Text>
            </View>
          </View>
          <Switch
            value={floatingWidgetEnabled}
            onValueChange={handleWidgetToggle}
            trackColor={{false: colors.border, true: colors.primary + '50'}}
            thumbColor={floatingWidgetEnabled ? colors.primary : colors.textMuted}
          />
        </View>

        <View style={[styles.divider, {backgroundColor: colors.divider}]} />

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Icon name="lock-open-outline" size={20} color={colors.primary} />
            <View style={{marginLeft: 12}}>
              <Text style={[styles.settingLabel, {color: colors.textPrimary}]}>
                Show on Unlock
              </Text>
              <Text style={[styles.settingDesc, {color: colors.textMuted}]}>
                Display widget when phone is unlocked
              </Text>
            </View>
          </View>
          <Switch
            value={showOnUnlock}
            onValueChange={toggleShowOnUnlock}
            trackColor={{false: colors.border, true: colors.primary + '50'}}
            thumbColor={showOnUnlock ? colors.primary : colors.textMuted}
          />
        </View>
      </View>

      {/* App Info */}
      <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>📊 App Stats</Text>
      <View style={[styles.settingsCard, {backgroundColor: colors.card, ...shadows.small}]}>
        <View style={styles.statRow}>
          <Text style={[styles.settingLabel, {color: colors.textSecondary}]}>Total Tasks</Text>
          <Text style={[styles.statValue, {color: colors.textPrimary}]}>{taskStats.total}</Text>
        </View>
        <View style={[styles.divider, {backgroundColor: colors.divider}]} />
        <View style={styles.statRow}>
          <Text style={[styles.settingLabel, {color: colors.textSecondary}]}>Completed</Text>
          <Text style={[styles.statValue, {color: colors.success}]}>{taskStats.done}</Text>
        </View>
        <View style={[styles.divider, {backgroundColor: colors.divider}]} />
        <View style={styles.statRow}>
          <Text style={[styles.settingLabel, {color: colors.textSecondary}]}>Pending</Text>
          <Text style={[styles.statValue, {color: colors.warning}]}>{taskStats.pending}</Text>
        </View>
      </View>

      {/* About */}
      <View style={[styles.aboutCard, {backgroundColor: colors.card, ...shadows.small}]}>
        <Text style={[styles.appName, {color: colors.primary}]}>⚡ OmniTask</Text>
        <Text style={[styles.version, {color: colors.textMuted}]}>Version 1.0.0</Text>
        <Text style={[styles.tagline, {color: colors.textSecondary}]}>
          Your All-in-One Productivity Hub
        </Text>
      </View>

      <View style={{height: 40}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, paddingHorizontal: 20, paddingTop: 16},
  sectionTitle: {fontSize: 16, fontWeight: '700', marginBottom: 12, marginTop: 8},
  themeGrid: {flexDirection: 'row', gap: 10, marginBottom: 24},
  themeCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    position: 'relative',
  },
  themeName: {fontSize: 14, fontWeight: '700', marginTop: 8},
  themeDesc: {fontSize: 11, marginTop: 2},
  activeIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsCard: {borderRadius: 14, padding: 4, marginBottom: 20},
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  settingInfo: {flexDirection: 'row', alignItems: 'center', flex: 1},
  settingLabel: {fontSize: 14, fontWeight: '600'},
  settingDesc: {fontSize: 11, marginTop: 1},
  divider: {height: 1, marginHorizontal: 14},
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statValue: {fontSize: 20, fontWeight: '800'},
  aboutCard: {
    alignItems: 'center',
    padding: 28,
    borderRadius: 14,
    marginTop: 8,
  },
  appName: {fontSize: 22, fontWeight: '900'},
  version: {fontSize: 12, marginTop: 4},
  tagline: {fontSize: 13, marginTop: 4},
});

export default SettingsScreen;
