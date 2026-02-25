/**
 * Coach Sheet — Universal 3-tab coach profile bottom sheet.
 * Tabs: Overview | History | Notes
 * Header (name, title, avatar) always visible above tabs.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing } from '@/constants/theme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { CoachCardData } from '@/utils/global-entity-sheets';

function nameToHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

type Tab = 'overview' | 'history' | 'notes';

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'history', label: 'History' },
  { key: 'notes', label: 'Notes' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  data: CoachCardData | null;
}

export function CoachSheet({ visible, onClose, data }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Reset tab when sheet reopens
  React.useEffect(() => {
    if (visible) setActiveTab('overview');
  }, [visible]);

  if (!data) return null;

  const hue = nameToHue(data.name);
  const initials = data.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal>
      <View style={styles.headerSection}>
        {/* ── HEADER — always visible ── */}
        <View style={styles.identityRow}>
          <View style={[styles.avatarCircle, { backgroundColor: `hsl(${hue}, 40%, 30%)` }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.coachName, { color: colors.text }]}>{data.name}</Text>
            <Text style={[styles.coachTitle, { color: colors.textSecondary }]}>{data.title}</Text>
            {data.tenure && (
              <Text style={[styles.tenure, { color: colors.textTertiary }]}>{data.tenure}</Text>
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
              TAB 1 — OVERVIEW
              ════════════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <>
              {/* Bio */}
              {data.bio && (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>BIO</Text>
                  <Text style={[styles.bioText, { color: colors.textSecondary }]}>{data.bio}</Text>
                </View>
              )}

              {/* System profile */}
              {(data.offSystem || data.defSystem) && (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>SYSTEM PROFILE</Text>
                  {data.offSystem && (
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Offensive System</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{data.offSystem}</Text>
                    </View>
                  )}
                  {data.defSystem && (
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Defensive System</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{data.defSystem}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Tendencies */}
              {data.tendencies && (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>TENDENCIES</Text>
                  <Text style={[styles.bioText, { color: colors.textSecondary }]}>{data.tendencies}</Text>
                </View>
              )}

              {/* Known levers */}
              {data.knownLevers && data.knownLevers.length > 0 && (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>KNOWN LEVERS</Text>
                  {data.knownLevers.map((lever, i) => (
                    <View key={i} style={styles.leverRow}>
                      <Text style={[styles.bullet, { color: colors.textSecondary }]}>{'\u2022'}</Text>
                      <Text style={[styles.leverText, { color: colors.text }]}>{lever}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Empty state */}
              {!data.bio && !data.offSystem && !data.defSystem && !data.tendencies && (!data.knownLevers || data.knownLevers.length === 0) && (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
                    Full coaching profile not yet available.
                  </Text>
                </View>
              )}
            </>
          )}

          {/* ════════════════════════════════════════════
              TAB 2 — HISTORY
              ════════════════════════════════════════════ */}
          {activeTab === 'history' && (
            <>
              {/* Record at institution */}
              {data.recordAtInstitution ? (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>RECORD AT INSTITUTION</Text>
                  <Text style={[styles.recordValue, { color: colors.text }]}>{data.recordAtInstitution}</Text>
                </View>
              ) : (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>RECORD AT INSTITUTION</Text>
                  <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
                    Coaching record not yet available.
                  </Text>
                </View>
              )}

              {/* Tenure */}
              {data.tenure && (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Tenure</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>{data.tenure}</Text>
                  </View>
                </View>
              )}

              {/* Previous stops placeholder */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>PREVIOUS STOPS</Text>
                <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
                  Coaching history not yet available.
                </Text>
              </View>
            </>
          )}

          {/* ════════════════════════════════════════════
              TAB 3 — NOTES
              ════════════════════════════════════════════ */}
          {activeTab === 'notes' && (
            <>
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>SCOUTING NOTES</Text>
                <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
                  No scouting notes yet. Coaching intel and game prep notes will appear here.
                </Text>
              </View>
            </>
          )}

        </View>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  headerSection: { padding: Spacing.md, paddingBottom: 0, gap: Spacing.sm },
  scroll: { maxHeight: '100%' },
  tabContent: { padding: Spacing.md, paddingTop: Spacing.sm, gap: Spacing.sm, paddingBottom: 30 },

  // Identity
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  coachName: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  coachTitle: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5, marginTop: 2 },
  tenure: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3, marginTop: 2 },

  // Tab pills
  tabRow: { flexDirection: 'row', borderRadius: 10, padding: 3, gap: 4 },
  tabPill: { flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: 'center' },
  tabPillActive: {},
  tabText: { fontSize: 13, fontWeight: '700' },

  // Cards
  card: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 8 },
  sectionTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  bioText: { fontSize: 13, fontWeight: '500', lineHeight: 19 },

  // Info rows
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  infoValue: { fontSize: 13, fontWeight: '700' },

  // Record
  recordValue: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },

  // Levers
  leverRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  bullet: { fontSize: 13, lineHeight: 18 },
  leverText: { fontSize: 13, fontWeight: '600', lineHeight: 18, flex: 1 },

  placeholderText: { fontSize: 13, fontWeight: '500', fontStyle: 'italic' },
});
