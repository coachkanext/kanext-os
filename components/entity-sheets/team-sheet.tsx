/**
 * Team Sheet — Full 3-tab team profile bottom sheet.
 * Tabs: Identity | Intelligence | People
 * All data-driven from TeamCardData props — placeholders when missing.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing } from '@/constants/theme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getKRColor } from '@/utils/kr-display';
import type { TeamCardData } from '@/utils/global-entity-sheets';

function nameToHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

type Tab = 'identity' | 'intelligence' | 'people';

const TABS: { key: Tab; label: string }[] = [
  { key: 'identity', label: 'Identity' },
  { key: 'intelligence', label: 'Intelligence' },
  { key: 'people', label: 'People' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  data: TeamCardData | null;
}

export function TeamSheet({ visible, onClose, data }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const [activeTab, setActiveTab] = useState<Tab>('identity');

  // Reset tab when sheet reopens
  React.useEffect(() => {
    if (visible) setActiveTab('identity');
  }, [visible]);

  if (!data) return null;

  const hue = nameToHue(data.name);
  const initials = data.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const krColor = getKRColor(data.teamKR);

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.identityRow}>
          <View style={[styles.initialsCircle, { backgroundColor: `hsl(${hue}, 50%, 35%)` }]}>
            <Text style={styles.initialsText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.teamName, { color: colors.text }]}>{data.name}</Text>
            <Text style={[styles.subline, { color: colors.textSecondary }]}>
              {[data.level, data.conference].filter(Boolean).join(' · ') || '—'}
            </Text>
          </View>
          {data.teamKR != null && (
            <View style={[styles.krChip, { backgroundColor: krColor + '20' }]}>
              <Text style={[styles.krChipVal, { color: krColor }]}>{Math.round(data.teamKR)}</Text>
            </View>
          )}
        </View>

        {/* Tab pills */}
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

        {/* ── IDENTITY TAB ── */}
        {activeTab === 'identity' && (
          <View style={styles.tabContent}>
            {/* System labels */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>SYSTEM</Text>
              <View style={styles.systemPair}>
                <View style={styles.systemHalf}>
                  <Text style={[styles.systemLabel, { color: colors.textTertiary }]}>OFFENSE</Text>
                  <Text style={[styles.systemValue, { color: colors.text }]}>{data.osie || '—'}</Text>
                  {data.osieScore != null && (
                    <Text style={[styles.systemScore, { color: getKRColor(data.osieScore) }]}>{Math.round(data.osieScore)}</Text>
                  )}
                </View>
                <View style={styles.systemHalf}>
                  <Text style={[styles.systemLabel, { color: colors.textTertiary }]}>DEFENSE</Text>
                  <Text style={[styles.systemValue, { color: colors.text }]}>{data.dsie || '—'}</Text>
                  {data.dsieScore != null && (
                    <Text style={[styles.systemScore, { color: getKRColor(data.dsieScore) }]}>{Math.round(data.dsieScore)}</Text>
                  )}
                </View>
              </View>
            </View>

            {/* Record */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>RECORD</Text>
              <View style={styles.recordRow}>
                <View style={styles.recordItem}>
                  <Text style={[styles.recordLabel, { color: colors.textTertiary }]}>OVERALL</Text>
                  <Text style={[styles.recordValue, { color: colors.text }]}>{data.record || '—'}</Text>
                </View>
                {data.confRecord && (
                  <View style={styles.recordItem}>
                    <Text style={[styles.recordLabel, { color: colors.textTertiary }]}>CONF</Text>
                    <Text style={[styles.recordValue, { color: colors.text }]}>{data.confRecord}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Coverage tag */}
            {data.coverageTag && (
              <View style={[styles.tagChip, { backgroundColor: accent + '15', borderColor: accent + '40' }]}>
                <Text style={[styles.tagText, { color: accent }]}>{data.coverageTag}</Text>
              </View>
            )}
          </View>
        )}

        {/* ── INTELLIGENCE TAB ── */}
        {activeTab === 'intelligence' && (
          <View style={styles.tabContent}>
            {/* Off / Def KR breakdown */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>KR BREAKDOWN</Text>
              <View style={styles.krBreakdownRow}>
                <View style={styles.krBreakdownItem}>
                  <Text style={[styles.krBreakdownLabel, { color: colors.textTertiary }]}>OFF KR</Text>
                  <Text style={[styles.krBreakdownValue, { color: getKRColor(data.offKR) }]}>
                    {data.offKR != null ? Math.round(data.offKR) : '—'}
                  </Text>
                </View>
                <View style={styles.krBreakdownItem}>
                  <Text style={[styles.krBreakdownLabel, { color: colors.textTertiary }]}>DEF KR</Text>
                  <Text style={[styles.krBreakdownValue, { color: getKRColor(data.defKR) }]}>
                    {data.defKR != null ? Math.round(data.defKR) : '—'}
                  </Text>
                </View>
                <View style={styles.krBreakdownItem}>
                  <Text style={[styles.krBreakdownLabel, { color: colors.textTertiary }]}>TEAM KR</Text>
                  <Text style={[styles.krBreakdownValue, { color: krColor }]}>
                    {data.teamKR != null ? Math.round(data.teamKR) : '—'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Strengths */}
            {data.strengths && data.strengths.length > 0 && (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>STRENGTHS</Text>
                {data.strengths.map((s, i) => (
                  <View key={i} style={styles.listRow}>
                    <Text style={[styles.bullet, { color: '#22C55E' }]}>{'\u2022'}</Text>
                    <Text style={[styles.listText, { color: colors.text }]}>{s}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Risks */}
            {data.risks && data.risks.length > 0 && (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>RISKS</Text>
                {data.risks.map((r, i) => (
                  <View key={i} style={styles.listRow}>
                    <Text style={[styles.bullet, { color: '#EF4444' }]}>{'\u2022'}</Text>
                    <Text style={[styles.listText, { color: colors.text }]}>{r}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Placeholder if no intelligence data */}
            {data.offKR == null && data.defKR == null && (!data.strengths || data.strengths.length === 0) && (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
                  Intelligence data not yet available for this team.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── PEOPLE TAB ── */}
        {activeTab === 'people' && (
          <View style={styles.tabContent}>
            {/* Coaching staff */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>COACHING STAFF</Text>
              {data.coaches && data.coaches.length > 0 ? (
                data.coaches.map((coach, i) => (
                  <View key={i} style={styles.personRow}>
                    <View style={[styles.personAvatar, { backgroundColor: `hsl(${nameToHue(coach.name)}, 40%, 30%)` }]}>
                      <Text style={styles.personInitials}>
                        {coach.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.personName, { color: colors.text }]}>{coach.name}</Text>
                      <Text style={[styles.personRole, { color: colors.textSecondary }]}>{coach.title}</Text>
                      {coach.tendencies && (
                        <Text style={[styles.personDetail, { color: colors.textTertiary }]}>{coach.tendencies}</Text>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>No coaching data available.</Text>
              )}
            </View>

            {/* Top contributors */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>TOP CONTRIBUTORS</Text>
              {data.topContributors && data.topContributors.length > 0 ? (
                data.topContributors.map((p, i) => (
                  <View key={i} style={styles.contributorRow}>
                    <Text style={[styles.contributorName, { color: colors.text }]}>{p.name}</Text>
                    <Text style={[styles.contributorPos, { color: colors.textSecondary }]}>{p.position}</Text>
                    {p.kr != null && (
                      <Text style={[styles.contributorKR, { color: getKRColor(p.kr) }]}>{Math.round(p.kr)}</Text>
                    )}
                  </View>
                ))
              ) : (
                <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>No contributor data available.</Text>
              )}
            </View>
          </View>
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: 30 },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  initialsCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  initialsText: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  teamName: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  subline: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5, marginTop: 2 },
  krChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, alignItems: 'center' },
  krChipVal: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },

  // Tab pills
  tabRow: { flexDirection: 'row', borderRadius: 10, padding: 3, gap: 4 },
  tabPill: { flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: 'center' },
  tabPillActive: {},
  tabText: { fontSize: 13, fontWeight: '700' },

  // Tab content
  tabContent: { gap: Spacing.sm },

  // Cards
  card: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 8 },
  sectionTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },

  // System
  systemPair: { flexDirection: 'row', justifyContent: 'space-around' },
  systemHalf: { alignItems: 'center', gap: 3 },
  systemLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  systemValue: { fontSize: 14, fontWeight: '800', letterSpacing: -0.3 },
  systemScore: { fontSize: 12, fontWeight: '700' },

  // Record
  recordRow: { flexDirection: 'row', justifyContent: 'space-around' },
  recordItem: { alignItems: 'center', gap: 4 },
  recordLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  recordValue: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },

  // KR breakdown
  krBreakdownRow: { flexDirection: 'row', justifyContent: 'space-around' },
  krBreakdownItem: { alignItems: 'center', gap: 2 },
  krBreakdownLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  krBreakdownValue: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },

  // Lists
  listRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  bullet: { fontSize: 13, lineHeight: 18 },
  listText: { fontSize: 13, fontWeight: '600', lineHeight: 18, flex: 1 },

  // Tag
  tagChip: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth },
  tagText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },

  // People
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  personAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  personInitials: { fontSize: 14, fontWeight: '800', color: '#fff' },
  personName: { fontSize: 14, fontWeight: '700' },
  personRole: { fontSize: 12, fontWeight: '600', marginTop: 1 },
  personDetail: { fontSize: 11, fontWeight: '500', marginTop: 2 },

  // Contributors
  contributorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contributorName: { fontSize: 13, fontWeight: '700', flex: 1 },
  contributorPos: { fontSize: 12, fontWeight: '600' },
  contributorKR: { fontSize: 14, fontWeight: '800', width: 30, textAlign: 'right' },

  placeholderText: { fontSize: 13, fontWeight: '500', fontStyle: 'italic' },
});
