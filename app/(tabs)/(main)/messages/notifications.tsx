/**
 * Message Notification Settings — Mute All, Mentions Only, DND.
 * Messages-specific, separate from global notification settings.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Switch,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const accent = useAccentColor();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);

  const [muteAll, setMuteAll] = useState(false);
  const [mentionsOnly, setMentionsOnly] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [previewEnabled, setPreviewEnabled] = useState(true);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Mute / Mentions */}
        <Text style={styles.sectionLabel}>Alerts</Text>
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Mute All</Text>
            <Text style={styles.toggleDesc}>Silence all message notifications</Text>
          </View>
          <Switch value={muteAll} onValueChange={setMuteAll} trackColor={{ false: '#39393D', true: accent }} thumbColor="#FFFFFF" />
        </View>
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Mentions Only</Text>
            <Text style={styles.toggleDesc}>Only notify when you're @mentioned</Text>
          </View>
          <Switch value={mentionsOnly} onValueChange={setMentionsOnly} trackColor={{ false: '#39393D', true: accent }} thumbColor="#FFFFFF" />
        </View>

        <View style={styles.divider} />

        {/* Sound & Vibration */}
        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Sound</Text>
          <Switch value={soundEnabled} onValueChange={setSoundEnabled} trackColor={{ false: '#39393D', true: accent }} thumbColor="#FFFFFF" />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Vibration</Text>
          <Switch value={vibrationEnabled} onValueChange={setVibrationEnabled} trackColor={{ false: '#39393D', true: accent }} thumbColor="#FFFFFF" />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Message Preview</Text>
          <Switch value={previewEnabled} onValueChange={setPreviewEnabled} trackColor={{ false: '#39393D', true: accent }} thumbColor="#FFFFFF" />
        </View>

        <View style={styles.divider} />

        {/* DND */}
        <Text style={styles.sectionLabel}>Do Not Disturb</Text>
        <Pressable style={({ pressed }) => [styles.navRow, pressed && { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
          <IconSymbol name="moon.fill" size={18} color={C.secondary} />
          <Text style={styles.navLabel}>Set Schedule</Text>
          <IconSymbol name="chevron.right" size={14} color="rgba(255,255,255,0.25)" />
        </Pressable>
        <Text style={styles.note}>
          Message-specific DND. Separate from your global Do Not Disturb settings.
        </Text>
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '700', color: C.label },
  list: { flex: 1 },
  sectionLabel: {
    fontSize: 12, fontWeight: '600', color: C.secondary, textTransform: 'uppercase',
    letterSpacing: 0.5, paddingHorizontal: 20, marginBottom: 8, marginTop: 8,
  },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  toggleInfo: { flex: 1, marginRight: 16 },
  toggleLabel: { fontSize: 16, fontWeight: '500', color: C.label },
  toggleDesc: { fontSize: 13, color: C.muted, marginTop: 3 },
  divider: { height: 1, backgroundColor: C.separator, marginHorizontal: 20, marginVertical: 8 },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 14 },
  navLabel: { flex: 1, fontSize: 15, color: C.label },
  note: { fontSize: 13, color: C.muted, paddingHorizontal: 20, marginTop: 8, lineHeight: 18 },
});
