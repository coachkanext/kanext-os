/**
 * QR Code — shareable profile link as a scannable code.
 */

import React, { useMemo, useCallback, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Image, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';

const TOP_H       = 44;
const PROFILE_URL = 'kanext.io%2F%40sammyk';
const QR_SIZE     = 220;
const QR_URI      = `https://api.qrserver.com/v1/create-qr-code/?size=${QR_SIZE * 2}x${QR_SIZE * 2}&margin=16&data=${PROFILE_URL}&color=1A1714&bgcolor=F5F0EA`;

export default function QRCodeScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [role, cycleRole, roleCycles] = useDemoRole('personal:hub');
  const isOwner = role === roleCycles[0];

  // Kick back to hub profile when role switches to Follower
  useEffect(() => {
    if (!isOwner) router.replace('/(tabs)/(main)/hub' as any);
  }, [isOwner]);

  const topBarH       = insets.top + TOP_H;
  const contentPadTop = topBarH + 8;

  useFocusEffect(useCallback(() => { resetFooter(); }, []));
  const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: contentPadTop, paddingBottom: 60, alignItems: 'center' }}
      >
        {/* ── QR Card ── */}
        <View style={[s.qrCard, { backgroundColor: C.surface }]}>
          <Image
            source={{ uri: QR_URI }}
            style={{ width: QR_SIZE, height: QR_SIZE, borderRadius: 8 }}
            resizeMode="contain"
          />
        </View>

        {/* ── Identity ── */}
        <Text style={[s.name, { color: C.label }]}>Sammy Kalejaiye</Text>
        <Text style={[s.handle, { color: C.secondary }]}>kanext.io/@sammyk</Text>

        {/* ── Actions ── */}
        <View style={s.actionsRow}>
          <Pressable
            style={({ pressed }) => [s.actionBtn, { backgroundColor: C.label }, pressed && { opacity: 0.8 }]}
            onPress={haptic}
          >
            <IconSymbol name="square.and.arrow.down" size={16} color={C.bg} />
            <Text style={[s.actionLabel, { color: C.bg }]}>Save</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [s.actionBtn, { backgroundColor: C.surface, borderWidth: 1, borderColor: C.separator }, pressed && { opacity: 0.7 }]}
            onPress={haptic}
          >
            <IconSymbol name="square.and.arrow.up" size={16} color={C.label} />
            <Text style={[s.actionLabel, { color: C.label }]}>Share</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [s.actionBtn, { backgroundColor: C.surface, borderWidth: 1, borderColor: C.separator }, pressed && { opacity: 0.7 }]}
            onPress={haptic}
          >
            <IconSymbol name="link" size={16} color={C.label} />
            <Text style={[s.actionLabel, { color: C.label }]}>Copy Link</Text>
          </Pressable>
        </View>

        {/* ── Info ── */}
        <Text style={[s.hint, { color: C.muted }]}>
          Anyone who scans this code will be taken to your public profile.
        </Text>
      </ScrollView>

      {/* ── Fixed Top Bar ── */}
      <View style={[s.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { haptic(); openSidePanel(); }} hitSlop={12} style={s.topBarSide}>
            <KMenuButton />
          </Pressable>
          <Text style={[s.topBarTitle, { color: C.label }]}>QR Code</Text>
          <View style={[s.topBarSide, { alignItems: 'flex-end' }]}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </View>

    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:     { flex: 1 },

  topBarWrap: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
  topBar:     { height: TOP_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide: { minWidth: 44 },
  topBarTitle:{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700' },

  qrCard: {
    width: QR_SIZE + 32, height: QR_SIZE + 32,
    borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 24, marginBottom: 24,
  },

  name:   { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  handle: { fontSize: 14, marginBottom: 28 },

  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 24, paddingHorizontal: 24 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: 12,
  },
  actionLabel: { fontSize: 13, fontWeight: '600' },

  hint: { fontSize: 13, textAlign: 'center', lineHeight: 18, paddingHorizontal: 40 },
});
