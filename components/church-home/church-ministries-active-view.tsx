/**
 * Church Ministries — Active View
 * Filterable ministry cards with status badges and entity sheet tap.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, MODE_ACCENT } from '@/constants/theme';
import { CHURCH_MINISTRIES, MINISTRY_CATEGORY_LABELS, type Ministry, type MinistryCategory } from '@/data/mock-church-home';
import { openMinistryCard } from '@/utils/global-entity-sheets';

const ACCENT = MODE_ACCENT.church;

const CATEGORY_FILTERS: { key: 'all' | MinistryCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'worship', label: 'Worship' },
  { key: 'youth', label: 'Youth' },
  { key: 'fellowship', label: 'Fellowship' },
  { key: 'outreach', label: 'Outreach' },
  { key: 'service', label: 'Service' },
];

const CATEGORY_BADGE_COLORS: Record<MinistryCategory, string> = {
  worship: ACCENT,
  youth: '#B8943E',
  fellowship: ACCENT,
  outreach: ACCENT,
  service: ACCENT,
};

const STATUS_COLORS: Record<Ministry['status'], string> = {
  active: '#5A8A6E',
  seasonal: '#B8943E',
  launching: ACCENT,
};

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

export function ChurchMinistriesActiveView({ colors, accent }: Props) {
  const [catFilter, setCatFilter] = useState<'all' | MinistryCategory>('all');

  const filtered = useMemo(() => {
    if (catFilter === 'all') return CHURCH_MINISTRIES;
    return CHURCH_MINISTRIES.filter((m) => m.category === catFilter);
  }, [catFilter]);

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* Category Filter Pills */}
      <View style={styles.filterRow}>
        {CATEGORY_FILTERS.map((cf) => {
          const active = cf.key === catFilter;
          return (
            <Pressable
              key={cf.key}
              style={[
                styles.filterPill,
                { backgroundColor: active ? accent + '22' : colors.card, borderColor: active ? accent : colors.border },
              ]}
              onPress={() => setCatFilter(cf.key)}
            >
              <ThemedText style={[styles.filterText, { color: active ? accent : colors.textSecondary }]}>
                {cf.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Ministry Cards */}
      {filtered.map((m) => (
        <Pressable
          key={m.id}
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() =>
            openMinistryCard({
              name: m.name,
              icon: m.icon,
              mission: m.mission,
              volunteers: m.volunteers,
              leader: m.leader,
            })
          }
        >
          <View style={[styles.colorBar, { backgroundColor: m.color }]} />
          <View style={styles.cardBody}>
            <View style={styles.cardHeader}>
              <ThemedText style={[styles.ministryName, { color: colors.text }]} numberOfLines={1}>
                {m.name}
              </ThemedText>
              <View style={styles.badgeRow}>
                {/* Category Badge */}
                <View style={[styles.categoryBadge, { backgroundColor: (CATEGORY_BADGE_COLORS[m.category] ?? '#9C9790') + '22' }]}>
                  <ThemedText style={[styles.categoryBadgeText, { color: CATEGORY_BADGE_COLORS[m.category] ?? '#9C9790' }]}>
                    {MINISTRY_CATEGORY_LABELS[m.category]}
                  </ThemedText>
                </View>
                {/* Status Badge — only for non-active */}
                {m.status !== 'active' && (
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[m.status] + '22' }]}>
                    <ThemedText style={[styles.statusText, { color: STATUS_COLORS[m.status] }]}>
                      {m.status.toUpperCase()}
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>
            <ThemedText style={[styles.mission, { color: colors.textSecondary }]} numberOfLines={1}>
              {m.mission}
            </ThemedText>
            <View style={styles.metaRow}>
              <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
                {m.leader}
              </ThemedText>
              <ThemedText style={[styles.metaDot, { color: colors.textTertiary }]}>·</ThemedText>
              <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
                {m.volunteers} volunteers
              </ThemedText>
              <ThemedText style={[styles.metaDot, { color: colors.textTertiary }]}>·</ThemedText>
              <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
                {m.meetingDay} {m.meetingTime}
              </ThemedText>
            </View>
          </View>
        </Pressable>
      ))}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingTop: 4 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterText: { fontSize: 12, fontWeight: '600' },
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    overflow: 'hidden',
  },
  colorBar: { width: 4 },
  cardBody: { flex: 1, padding: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  ministryName: { fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  categoryBadgeText: { fontSize: 10, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },
  mission: { fontSize: 12, marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  metaText: { fontSize: 11 },
  metaDot: { fontSize: 11, marginHorizontal: 4 },
});
