/**
 * Church Connect — Visitors View
 * Filterable visitor cards with status dots, how-heard badges, and entity sheet tap.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, MODE_ACCENT } from '@/constants/theme';
import { RECENT_VISITORS, type RecentVisitor } from '@/data/mock-church-home';
import { openPersonCard, openLeaderCard } from '@/utils/global-entity-sheets';

const ACCENT = MODE_ACCENT.church;

const FILTERS = ['All', 'Pending', 'Contacted', 'Scheduled', 'Completed'] as const;
type Filter = (typeof FILTERS)[number];

const STATUS_COLORS: Record<RecentVisitor['followUpStatus'], string> = {
  pending: '#B8943E', contacted: ACCENT, scheduled: ACCENT, completed: '#5A8A6E',
};

const HOW_HEARD_LABELS: Record<RecentVisitor['howHeard'], string> = {
  social_media: 'Social Media', friend: 'Friend', website: 'Website',
  walk_in: 'Walk-in', event: 'Event', other: 'Other',
};

interface Props { colors: typeof Colors.light; accent: string }

function getInitials(name: string): string {
  return name.split(' ').filter((p) => p !== '&').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

function nameHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h) % 360;
}

export function ChurchConnectVisitorsView({ colors, accent }: Props) {
  const [filter, setFilter] = useState<Filter>('All');

  const filtered = useMemo(() => {
    if (filter === 'All') return RECENT_VISITORS;
    return RECENT_VISITORS.filter((v) => v.followUpStatus === filter.toLowerCase());
  }, [filter]);

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* Filter Pills */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = f === filter;
          return (
            <Pressable
              key={f}
              style={[styles.filterPill, { backgroundColor: active ? accent + '22' : colors.card, borderColor: active ? accent : colors.border }]}
              onPress={() => setFilter(f)}
            >
              <ThemedText style={[styles.filterText, { color: active ? accent : colors.textSecondary }]}>{f}</ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Visitor Cards */}
      {filtered.map((visitor) => {
        const hue = nameHue(visitor.name);
        const statusColor = STATUS_COLORS[visitor.followUpStatus];
        return (
          <Pressable
            key={visitor.id}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => openPersonCard({ name: visitor.name, role: 'Visitor', status: visitor.followUpStatus })}
          >
            <View style={[styles.avatar, { backgroundColor: `hsl(${hue}, 50%, 35%)` }]}>
              <ThemedText style={styles.avatarText}>{getInitials(visitor.name)}</ThemedText>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardHeader}>
                <ThemedText style={[styles.visitorName, { color: colors.text }]}>{visitor.name}</ThemedText>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                  <ThemedText style={[styles.statusLabel, { color: statusColor }]}>
                    {visitor.followUpStatus.charAt(0).toUpperCase() + visitor.followUpStatus.slice(1)}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.metaRow}>
                <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>{visitor.visitDate}</ThemedText>
                <View style={[styles.howHeardBadge, { backgroundColor: colors.backgroundTertiary }]}>
                  <ThemedText style={[styles.howHeardText, { color: colors.textSecondary }]}>{HOW_HEARD_LABELS[visitor.howHeard]}</ThemedText>
                </View>
              </View>
              {visitor.assignedTo && (
                <Pressable
                  onPress={() => openLeaderCard({ name: visitor.assignedTo!, title: '' })}
                  hitSlop={6}
                >
                  <ThemedText style={[styles.assignedLink, { color: accent }]}>
                    Assigned to {visitor.assignedTo}
                  </ThemedText>
                </Pressable>
              )}
              {(visitor.interests ?? []).length > 0 && (
                <View style={styles.interestsRow}>
                  {visitor.interests!.map((interest) => (
                    <View key={interest} style={[styles.interestPill, { backgroundColor: accent + '15' }]}>
                      <ThemedText style={[styles.interestText, { color: accent }]}>{interest}</ThemedText>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </Pressable>
        );
      })}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingTop: 4 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  filterPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  filterText: { fontSize: 12, fontWeight: '600' },
  card: { flexDirection: 'row', borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  cardBody: { flex: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
  visitorName: { fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { fontSize: 10, fontWeight: '600' },
  assignedLink: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  metaText: { fontSize: 11 },
  howHeardBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  howHeardText: { fontSize: 10, fontWeight: '600' },
  interestsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  interestPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  interestText: { fontSize: 10, fontWeight: '600' },
});
