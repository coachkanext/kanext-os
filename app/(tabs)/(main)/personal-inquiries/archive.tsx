/**
 * Personal Inquiries — Archive screen.
 * Shows closed/resolved inquiries (Accepted + Declined).
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated, Image } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { PERSONAL_INQUIRIES } from '@/data/mock-personal-inquiries';

const GAIN    = '#5A8A6E';
const TOP_BAR_H = 52;

function statusColor(status: string): { bg: string; text: string } {
  if (status === 'Accepted') return { bg: GAIN, text: '#FFFFFF' };
  return { bg: 'rgba(0,0,0,0.08)', text: '#9C9790' };
}

export default function InquiriesArchiveScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const archived = useMemo(
    () => PERSONAL_INQUIRIES.filter(i => i.status === 'Accepted' || i.status === 'Declined'),
    [],
  );

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>

      {/* Top bar */}
      <Animated.View style={[
        styles.topBarOuter,
        { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity },
      ]}>
        <View style={styles.topBar}>
          <Pressable
            style={styles.backBtn}
            hitSlop={8}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
          >
            <IconSymbol name="chevron.left" size={16} color={C.secondary} />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[styles.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[styles.titlePillText, { color: C.label }]}>Archive</Text>
            </View>
          </View>
          <View style={styles.rightSpacer} />
        </View>
      </Animated.View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + TOP_BAR_H + 8,
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {archived.length === 0 ? (
          <View style={styles.emptyWrap}>
            <IconSymbol name="archivebox" size={36} color={C.secondary} />
            <Text style={[styles.emptyTitle, { color: C.label }]}>No Archived Inquiries</Text>
            <Text style={[styles.emptySub, { color: C.secondary }]}>
              Accepted and declined inquiries will appear here.
            </Text>
          </View>
        ) : (
          archived.map(inq => {
            const sc = statusColor(inq.status);
            return (
              <View
                key={inq.id}
                style={[styles.card, { backgroundColor: C.surface, borderColor: C.separator }]}
              >
                <View style={[styles.avatar, { backgroundColor: C.label }]}>
                  {inq.avatarUri ? (
                    <Image source={{ uri: inq.avatarUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                  ) : (
                    <Text style={[styles.avatarText, { color: C.bg }]}>{inq.initials}</Text>
                  )}
                </View>

                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={styles.topRow}>
                    <Text style={[styles.sender, { color: C.secondary }]} numberOfLines={1}>
                      {inq.senderName}, {inq.senderCompany}
                    </Text>
                    <View style={[styles.statusPill, { backgroundColor: sc.bg }]}>
                      <Text style={[styles.statusText, { color: sc.text }]}>{inq.status}</Text>
                    </View>
                  </View>
                  <Text style={[styles.title, { color: C.label }]} numberOfLines={2}>{inq.title}</Text>
                  <View style={styles.metaRow}>
                    <View style={[styles.typeBadge, { backgroundColor: C.separator }]}>
                      <Text style={[styles.typeText, { color: C.label }]}>{inq.type}</Text>
                    </View>
                    <Text style={[styles.date, { color: C.secondary }]}>{inq.dateReceived}</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBarOuter: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topBar: { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  backBtn: { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  titlePill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  rightSpacer: { width: 44 },

  emptyWrap: { alignItems: 'center', paddingVertical: 56, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptySub: { fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },

  card: {
    flexDirection: 'row', alignItems: 'flex-start',
    borderRadius: 14, borderWidth: StyleSheet.hairlineWidth,
    padding: 14, gap: 12, marginBottom: 10,
  },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' },
  avatarText: { fontSize: 14, fontWeight: '700' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  sender: { flex: 1, fontSize: 12, fontWeight: '400' },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, flexShrink: 0 },
  statusText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.1 },
  title: { fontSize: 14, fontWeight: '700', lineHeight: 20, marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  typeText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.1 },
  date: { fontSize: 11, marginLeft: 'auto' },
});
