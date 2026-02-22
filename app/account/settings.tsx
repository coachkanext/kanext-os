/**
 * Account Settings Screen
 * Profile, preferences, notifications, and app info.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Switch, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext } from '@/context/app-context';

const PREFS_KEY = '@kanext_user_prefs';

interface UserPrefs {
  defaultTab: string;
  hapticsEnabled: boolean;
  reduceMotion: boolean;
  notificationsEnabled: boolean;
}

const DEFAULT_PREFS: UserPrefs = {
  defaultTab: 'Home',
  hapticsEnabled: true,
  reduceMotion: false,
  notificationsEnabled: true,
};

const TAB_OPTIONS = ['Home', 'Search', 'Nexus', 'Activity', 'Organization'];

export default function AccountSettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state } = useAppContext();

  const [prefs, setPrefs] = useState<UserPrefs>(DEFAULT_PREFS);
  const [showTabPicker, setShowTabPicker] = useState(false);

  useEffect(() => {
    loadPrefs();
  }, []);

  const loadPrefs = async () => {
    try {
      const stored = await AsyncStorage.getItem(PREFS_KEY);
      if (stored) {
        setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(stored) });
      }
    } catch (e) {
      console.error('Failed to load prefs:', e);
    }
  };

  const savePrefs = async (newPrefs: UserPrefs) => {
    try {
      await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(newPrefs));
      setPrefs(newPrefs);
    } catch (e) {
      console.error('Failed to save prefs:', e);
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear cached data?',
      'This clears local cache but keeps your account and context.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            // Clear cache keys but NOT auth or context
            const keysToKeep = ['@kanext_app_state', PREFS_KEY];
            try {
              const allKeys = await AsyncStorage.getAllKeys();
              const keysToRemove = allKeys.filter(k => !keysToKeep.includes(k));
              await AsyncStorage.multiRemove(keysToRemove);
              Alert.alert('Done', 'Cache cleared successfully.');
            } catch (e) {
              console.error('Failed to clear cache:', e);
            }
          },
        },
      ]
    );
  };

  const formatRole = (role: string): string => {
    const labels: Record<string, string> = {
      head_coach: 'Head Coach',
      assistant_coach: 'Assistant Coach',
      founder: 'Founder & CEO',
      member: 'Member',
      faculty: 'Faculty',
    };
    return labels[role] || role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const buildNumber = Constants.expoConfig?.ios?.buildNumber ?? Constants.expoConfig?.android?.versionCode ?? '1';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Account Settings</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PROFILE</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Name</Text>
              <Text style={[styles.rowValue, { color: colors.text }]}>Alex Morgan</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Email</Text>
              <Text style={[styles.rowValue, { color: colors.text }]}>—</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Role</Text>
              <Text style={[styles.rowValue, { color: colors.text }]}>{formatRole(state.operatingRole)}</Text>
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PREFERENCES</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Pressable style={styles.row} onPress={() => setShowTabPicker(true)}>
              <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Default Start Tab</Text>
              <View style={styles.rowRight}>
                <Text style={[styles.rowValue, { color: colors.text }]}>{prefs.defaultTab}</Text>
                <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
              </View>
            </Pressable>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Haptics</Text>
              <Switch
                value={prefs.hapticsEnabled}
                onValueChange={(val) => savePrefs({ ...prefs, hapticsEnabled: val })}
                trackColor={{ false: colors.backgroundTertiary, true: colors.tint }}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Reduce Motion</Text>
              <Switch
                value={prefs.reduceMotion}
                onValueChange={(val) => savePrefs({ ...prefs, reduceMotion: val })}
                trackColor={{ false: colors.backgroundTertiary, true: colors.tint }}
              />
            </View>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>NOTIFICATIONS</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>App Notifications</Text>
              <Switch
                value={prefs.notificationsEnabled}
                onValueChange={(val) => savePrefs({ ...prefs, notificationsEnabled: val })}
                trackColor={{ false: colors.backgroundTertiary, true: colors.tint }}
              />
            </View>
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>DATA / STORAGE</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Pressable style={styles.row} onPress={handleClearCache}>
              <Text style={[styles.rowLabel, { color: colors.error }]}>Clear Cached Data</Text>
              <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
            </Pressable>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ABOUT</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>App Version</Text>
              <Text style={[styles.rowValue, { color: colors.text }]}>{appVersion}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Build</Text>
              <Text style={[styles.rowValue, { color: colors.text }]}>{buildNumber}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Tab Picker Modal */}
      {showTabPicker && (
        <Pressable style={styles.modalOverlay} onPress={() => setShowTabPicker(false)}>
          <View style={[styles.pickerSheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + Spacing.md }]}>
            <Text style={[styles.pickerTitle, { color: colors.text }]}>Select Default Tab</Text>
            {TAB_OPTIONS.map((tab) => (
              <Pressable
                key={tab}
                style={[styles.pickerOption, prefs.defaultTab === tab && { backgroundColor: colors.backgroundSecondary }]}
                onPress={() => {
                  savePrefs({ ...prefs, defaultTab: tab });
                  setShowTabPicker(false);
                }}
              >
                <Text style={[styles.pickerOptionText, { color: colors.text }]}>{tab}</Text>
                {prefs.defaultTab === tab && <IconSymbol name="checkmark" size={18} color={colors.tint} />}
              </Pressable>
            ))}
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  scrollView: { flex: 1 },
  section: { marginTop: Spacing.lg, paddingHorizontal: Spacing.md },
  sectionTitle: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: Spacing.sm, marginLeft: Spacing.sm },
  card: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: Spacing.md },
  rowLabel: { fontSize: 16 },
  rowValue: { fontSize: 16 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: Spacing.md },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  pickerSheet: { borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, paddingTop: Spacing.lg },
  pickerTitle: { fontSize: 17, fontWeight: '600', textAlign: 'center', marginBottom: Spacing.md },
  pickerOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: Spacing.lg, marginHorizontal: Spacing.md, borderRadius: BorderRadius.md },
  pickerOptionText: { fontSize: 16 },
});
