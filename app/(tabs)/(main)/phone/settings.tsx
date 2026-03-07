/**
 * Phone Settings — Ringtone per mode, vibration, DND, call forwarding,
 * voicemail greeting, Wi-Fi calling, caller ID.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Switch,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAccentColor } from '@/hooks/use-accent-color';
import { MODE_BADGE_COLORS, MY_KANEXT_NUMBERS } from '@/data/mock-phone';

const C = {
  bg: '#000000',
  surface: '#0B0F14',
  label: '#FFFFFF',
  secondary: '#A1A1AA',
  muted: '#52525B',
  separator: 'rgba(255,255,255,0.08)',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ToggleRow({ label, value, onToggle, accent }: { label: string; value: boolean; onToggle: () => void; accent: string }) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch value={value} onValueChange={onToggle} trackColor={{ false: '#39393D', true: accent }} thumbColor="#FFFFFF" />
    </View>
  );
}

function NavRow({ icon, label }: { icon: string; label: string }) {
  return (
    <Pressable style={({ pressed }) => [styles.navRow, pressed && { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
      <IconSymbol name={icon as any} size={18} color={C.secondary} />
      <Text style={styles.navLabel}>{label}</Text>
      <IconSymbol name="chevron.right" size={14} color="rgba(255,255,255,0.25)" />
    </Pressable>
  );
}

export default function PhoneSettingsScreen() {
  const insets = useSafeAreaInsets();
  const accent = useAccentColor();

  const [wifiCalling, setWifiCalling] = useState(true);
  const [vibration, setVibration] = useState(true);

  // Per-mode DND + Caller ID
  const [dndModes, setDndModes] = useState<Record<string, boolean>>({});
  const [callerIdModes, setCallerIdModes] = useState<Record<string, boolean>>(
    Object.fromEntries(MY_KANEXT_NUMBERS.map((n) => [n.mode, true])),
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <Section title="Ringtone">
          {MY_KANEXT_NUMBERS.map((num) => {
            const color = MODE_BADGE_COLORS[num.mode];
            return (
              <Pressable key={num.mode} style={({ pressed }) => [styles.navRow, pressed && { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                <View style={[styles.dot, { backgroundColor: color }]} />
                <Text style={styles.navLabel}>{num.label}</Text>
                <Text style={styles.navValue}>Default</Text>
                <IconSymbol name="chevron.right" size={14} color="rgba(255,255,255,0.25)" />
              </Pressable>
            );
          })}
        </Section>

        <View style={styles.divider} />

        <Section title="General">
          <ToggleRow label="Vibration" value={vibration} onToggle={() => setVibration((v) => !v)} accent={accent} />
          <ToggleRow label="Wi-Fi Calling" value={wifiCalling} onToggle={() => setWifiCalling((v) => !v)} accent={accent} />
        </Section>

        <View style={styles.divider} />

        <Section title="Do Not Disturb">
          {MY_KANEXT_NUMBERS.map((num) => {
            const color = MODE_BADGE_COLORS[num.mode];
            return (
              <View key={num.mode} style={styles.toggleRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <View style={[styles.dot, { backgroundColor: color }]} />
                  <Text style={styles.toggleLabel}>{num.label}</Text>
                </View>
                <Switch
                  value={!!dndModes[num.mode]}
                  onValueChange={() => setDndModes((prev) => ({ ...prev, [num.mode]: !prev[num.mode] }))}
                  trackColor={{ false: '#39393D', true: accent }}
                  thumbColor="#FFFFFF"
                />
              </View>
            );
          })}
          <NavRow icon="clock.fill" label="DND Schedule" />
        </Section>

        <View style={styles.divider} />

        <Section title="Call Forwarding">
          {MY_KANEXT_NUMBERS.map((num) => {
            const color = MODE_BADGE_COLORS[num.mode];
            return (
              <Pressable key={num.mode} style={({ pressed }) => [styles.navRow, pressed && { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                <View style={[styles.dot, { backgroundColor: color }]} />
                <Text style={styles.navLabel}>{num.label}</Text>
                <Text style={styles.navValue}>Off</Text>
                <IconSymbol name="chevron.right" size={14} color="rgba(255,255,255,0.25)" />
              </Pressable>
            );
          })}
        </Section>

        <View style={styles.divider} />

        <Section title="Voicemail Greeting">
          {MY_KANEXT_NUMBERS.map((num) => {
            const color = MODE_BADGE_COLORS[num.mode];
            return (
              <Pressable key={num.mode} style={({ pressed }) => [styles.navRow, pressed && { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                <View style={[styles.dot, { backgroundColor: color }]} />
                <Text style={styles.navLabel}>{num.label}</Text>
                <Text style={styles.navValue}>Default</Text>
                <IconSymbol name="chevron.right" size={14} color="rgba(255,255,255,0.25)" />
              </Pressable>
            );
          })}
        </Section>

        <View style={styles.divider} />

        <Section title="Caller ID">
          {MY_KANEXT_NUMBERS.map((num) => {
            const color = MODE_BADGE_COLORS[num.mode];
            return (
              <View key={num.mode} style={styles.toggleRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <View style={[styles.dot, { backgroundColor: color }]} />
                  <Text style={styles.toggleLabel}>{num.label}</Text>
                </View>
                <Switch
                  value={!!callerIdModes[num.mode]}
                  onValueChange={() => setCallerIdModes((prev) => ({ ...prev, [num.mode]: !prev[num.mode] }))}
                  trackColor={{ false: '#39393D', true: accent }}
                  thumbColor="#FFFFFF"
                />
              </View>
            );
          })}
        </Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '700', color: C.label },
  list: { flex: 1 },
  section: { marginBottom: 4 },
  sectionTitle: {
    fontSize: 12, fontWeight: '600', color: C.secondary, textTransform: 'uppercase',
    letterSpacing: 0.5, paddingHorizontal: 20, marginBottom: 8, marginTop: 8,
  },
  divider: { height: 1, backgroundColor: C.separator, marginHorizontal: 20, marginVertical: 4 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  toggleLabel: { fontSize: 15, color: C.label },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 14 },
  navLabel: { flex: 1, fontSize: 15, color: C.label },
  navValue: { fontSize: 14, color: C.muted, marginRight: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
