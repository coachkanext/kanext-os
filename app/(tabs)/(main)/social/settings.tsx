/**
 * Social Settings — account and privacy settings for Social.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';

const SETTINGS_ROWS = [
  { icon: 'lock',         label: 'Privacy',              sub: 'Who can see your posts' },
  { icon: 'bell',         label: 'Notifications',        sub: 'Likes, comments, follows' },
  { icon: 'person.badge.minus', label: 'Blocked Accounts', sub: 'Manage blocked users' },
  { icon: 'link',         label: 'Linked Accounts',      sub: 'Connect external platforms' },
  { icon: 'arrow.down.circle', label: 'Data & Downloads', sub: 'Export your content' },
] as const;

export default function SocialSettingsScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      <View style={[s.header, { paddingTop: insets.top + 8, borderBottomColor: C.separator }]}>
        <Pressable
          style={s.backBtn}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
        >
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <Text style={[s.title, { color: C.label }]}>Settings</Text>
        <View style={s.backBtn} />
      </View>

      <View style={[s.section, { borderColor: C.separator }]}>
        {SETTINGS_ROWS.map((row, i) => (
          <Pressable
            key={row.label}
            style={[
              s.row,
              { borderBottomColor: C.separator },
              i < SETTINGS_ROWS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[s.iconWrap, { backgroundColor: C.surfacePressed }]}>
              <IconSymbol name={row.icon as any} size={16} color={C.secondary} />
            </View>
            <View style={s.rowText}>
              <Text style={[s.rowLabel, { color: C.label }]}>{row.label}</Text>
              <Text style={[s.rowSub, { color: C.secondary }]}>{row.sub}</Text>
            </View>
            <IconSymbol name="chevron.right" size={14} color={C.muted} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen:   { flex: 1 },
  header:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  backBtn:  { width: 40, alignItems: 'flex-start', justifyContent: 'center' },
  title:    { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  section:  { marginTop: 20, marginHorizontal: 16, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  row:      { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  iconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowText:  { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '500' },
  rowSub:   { fontSize: 12, marginTop: 1 },
});
