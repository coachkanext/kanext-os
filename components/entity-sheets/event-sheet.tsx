/**
 * Event Sheet — Universal 2-tab event profile bottom sheet.
 * Tabs: Details | Related
 * Header (event title, type chip) always visible above tabs.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing } from '@/constants/theme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { EventCardData } from '@/utils/global-entity-sheets';

type Tab = 'details' | 'related';

const TABS: { key: Tab; label: string }[] = [
  { key: 'details', label: 'Details' },
  { key: 'related', label: 'Related' },
];

const EVENT_TYPE_COLORS: Record<string, string> = {
  game: '#EF4444',
  practice: '#22C55E',
  meeting: '#1D9BF0',
  other: '#A1A1AA',
};

interface Props {
  visible: boolean;
  onClose: () => void;
  data: EventCardData | null;
}

export function EventSheet({ visible, onClose, data }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const [activeTab, setActiveTab] = useState<Tab>('details');

  React.useEffect(() => {
    if (visible) setActiveTab('details');
  }, [visible]);

  if (!data) return null;

  const typeColor = EVENT_TYPE_COLORS[data.type ?? 'other'] ?? '#A1A1AA';

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal>
      <View style={styles.headerSection}>
        {/* ── HEADER ── */}
        <View style={styles.identityRow}>
          <View style={[styles.typeCircle, { backgroundColor: typeColor + '20' }]}>
            <Text style={[styles.typeIcon, { color: typeColor }]}>
              {data.type === 'game' ? '\u{1F3C0}' : data.type === 'practice' ? '\u{1F3CB}' : data.type === 'meeting' ? '\u{1F91D}' : '\u{1F4C5}'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.eventTitle, { color: colors.text }]}>{data.title}</Text>
            {data.type && (
              <View style={[styles.typeChip, { backgroundColor: typeColor + '20' }]}>
                <Text style={[styles.typeChipText, { color: typeColor }]}>
                  {data.type.charAt(0).toUpperCase() + data.type.slice(1)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── TAB PILLS ── */}
        <View style={[styles.tabRow, { backgroundColor: colors.card }]}>
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={[styles.tabPill, active && [styles.tabPillActive, { backgroundColor: accent + '30' }]]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveTab(tab.key);
                }}
              >
                <Text style={[styles.tabText, { color: active ? accent : colors.textSecondary }]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.tabContent}>

          {/* ════════════════════════════════════════════
              TAB 1 — DETAILS
              ════════════════════════════════════════════ */}
          {activeTab === 'details' && (
            <>
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>EVENT INFO</Text>
                {data.date && <InfoRow label="Date" value={data.date} colors={colors} />}
                {data.time && <InfoRow label="Time" value={data.time} colors={colors} />}
                {data.location && <InfoRow label="Location" value={data.location} colors={colors} />}
              </View>

              {data.notes ? (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>NOTES</Text>
                  <Text style={[styles.notesText, { color: colors.textSecondary }]}>{data.notes}</Text>
                </View>
              ) : (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>NOTES</Text>
                  <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
                    No notes for this event.
                  </Text>
                </View>
              )}
            </>
          )}

          {/* ════════════════════════════════════════════
              TAB 2 — RELATED
              ════════════════════════════════════════════ */}
          {activeTab === 'related' && (
            <>
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>LINKED RESOURCES</Text>
                {data.linkedGamePlan ? (
                  <Pressable
                    style={[styles.linkRow, { borderColor: colors.border }]}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  >
                    <Text style={[styles.linkLabel, { color: colors.textTertiary }]}>Game Plan</Text>
                    <Text style={[styles.linkValue, { color: accent }]}>{data.linkedGamePlan}</Text>
                  </Pressable>
                ) : null}
                {data.linkedSimulation ? (
                  <Pressable
                    style={[styles.linkRow, { borderColor: colors.border }]}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  >
                    <Text style={[styles.linkLabel, { color: colors.textTertiary }]}>Simulation</Text>
                    <Text style={[styles.linkValue, { color: accent }]}>{data.linkedSimulation}</Text>
                  </Pressable>
                ) : null}
                {data.linkedVideo ? (
                  <Pressable
                    style={[styles.linkRow, { borderColor: colors.border }]}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  >
                    <Text style={[styles.linkLabel, { color: colors.textTertiary }]}>Video</Text>
                    <Text style={[styles.linkValue, { color: accent }]}>{data.linkedVideo}</Text>
                  </Pressable>
                ) : null}
                {!data.linkedGamePlan && !data.linkedSimulation && !data.linkedVideo && (
                  <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
                    No linked resources for this event.
                  </Text>
                )}
              </View>
            </>
          )}

        </View>
      </ScrollView>
    </BottomSheet>
  );
}

function InfoRow({ label, value, colors }: { label: string; value: string; colors: typeof Colors.light }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerSection: { padding: Spacing.md, paddingBottom: 0, gap: Spacing.sm },
  scroll: { maxHeight: '100%' },
  tabContent: { padding: Spacing.md, paddingTop: Spacing.sm, gap: Spacing.sm, paddingBottom: 30 },

  // Identity
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  typeCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  typeIcon: { fontSize: 24 },
  eventTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  typeChip: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 4 },
  typeChipText: { fontSize: 11, fontWeight: '700' },

  // Tab pills
  tabRow: { flexDirection: 'row', borderRadius: 10, padding: 3, gap: 4 },
  tabPill: { flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: 'center' },
  tabPillActive: {},
  tabText: { fontSize: 13, fontWeight: '700' },

  // Cards
  card: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 8 },
  sectionTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  notesText: { fontSize: 13, fontWeight: '500', lineHeight: 19 },

  // Info rows
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  infoValue: { fontSize: 13, fontWeight: '700' },

  // Links
  linkRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4, borderBottomWidth: StyleSheet.hairlineWidth },
  linkLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  linkValue: { fontSize: 13, fontWeight: '700' },

  placeholderText: { fontSize: 13, fontWeight: '500', fontStyle: 'italic' },
});
