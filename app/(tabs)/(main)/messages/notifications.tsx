/**
 * Message Notification Settings — Mute All, Mentions Only, DND.
 * Messages-specific, separate from global notification settings.
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Switch,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const TOP_BAR_H = 52;

export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const accent = useAccentColor();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(TOP_BAR_H);

  const [muteAll, setMuteAll] = useState(false);
  const [mentionsOnly, setMentionsOnly] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [previewEnabled, setPreviewEnabled] = useState(true);

  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaytv');
  const isOwner = role === roleCycles[0];
  const router = useRouter();
  const isOwnerRef = useRef(isOwner);
  useEffect(() => {
    if (isOwnerRef.current === isOwner) return;
    isOwnerRef.current = isOwner;
    router.navigate('/(tabs)/(main)/messages' as any);
  }, [isOwner]);
  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.topBar, { paddingTop: insets.top, opacity }]}>
        <View style={{ height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={8}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.separator, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 5 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Notifications</Text>
            </View>
          </View>
          <View style={{ width: 80, alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      <ScrollView style={styles.list} contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}>
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
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, backgroundColor: C.bg },
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
