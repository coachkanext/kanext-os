/**
 * Biz Deals Activity View — Timeline feed with type filter pills
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors , MODE_ACCENT } from '@/constants/theme';
import { RECENT_ACTIVITY, type ActivityEntry } from '@/data/mock-business-home';
import { openPersonCard } from '@/utils/global-entity-sheets';


const ACCENT = MODE_ACCENT.business;
interface Props {
  colors: typeof Colors.light;
  accent: string;
}

const TYPE_FILTER_PILLS = ['All', 'Call', 'Email', 'Meeting', 'Document', 'Stage', 'Note'] as const;
type TypeFilter = (typeof TYPE_FILTER_PILLS)[number];

const FILTER_MAP: Record<string, string> = {
  Call: 'call',
  Email: 'email',
  Meeting: 'meeting',
  Document: 'document',
  Stage: 'stage_change',
  Note: 'note',
};

const TYPE_COLORS: Record<string, string> = {
  call: '#5A8A6E',
  email: ACCENT,
  meeting: ACCENT,
  document: '#B8943E',
  stage_change: '#B85C5C',
  note: '#9C9790',
};

const TYPE_ICONS: Record<string, string> = {
  call: '\u260E',       // phone
  email: '\u2709',      // envelope
  meeting: '\u{1F465}', // busts in silhouette
  document: '\u{1F4C4}', // page
  stage_change: '\u2B06', // up arrow
  note: '\u{1F4DD}',   // memo
};

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function BizDealsActivityView({ colors, accent }: Props) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All');

  const filteredActivity = useMemo(() => {
    let list = [...RECENT_ACTIVITY].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    if (typeFilter !== 'All') {
      const mapped = FILTER_MAP[typeFilter];
      if (mapped) list = list.filter((e: ActivityEntry) => e.type === mapped);
    }
    return list;
  }, [typeFilter]);

  return (
    <View style={{ flex: 1 }}>
      {/* Type filter pills */}
      <View style={styles.filterBar}>
        {TYPE_FILTER_PILLS.map((pill) => {
          const isActive = typeFilter === pill;
          return (
            <Pressable
              key={pill}
              style={[styles.filterPill, isActive && { backgroundColor: accent }]}
              onPress={() => setTypeFilter(pill)}
            >
              <ThemedText
                style={[styles.filterPillText, { color: isActive ? '#000' : colors.textSecondary }]}
              >
                {pill}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Timeline feed */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredActivity.map((entry: ActivityEntry) => {
          const typeColor = TYPE_COLORS[entry.type] ?? '#9C9790';
          const icon = TYPE_ICONS[entry.type] ?? '\u25CF';

          return (
            <View key={entry.id} style={styles.timelineRow}>
              {/* Timeline line */}
              <View style={styles.timelineCol}>
                <View style={[styles.iconCircle, { backgroundColor: typeColor + '22' }]}>
                  <ThemedText style={[styles.iconText, { color: typeColor }]}>{icon}</ThemedText>
                </View>
                <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
              </View>

              {/* Content */}
              <View style={[styles.entryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.entryHeader}>
                  <ThemedText style={[styles.timestamp, { color: typeColor }]}>
                    {formatRelativeTime(entry.timestamp)}
                  </ThemedText>
                  <View style={[styles.typeBadge, { backgroundColor: typeColor + '22' }]}>
                    <ThemedText style={[styles.typeBadgeText, { color: typeColor }]}>
                      {entry.type === 'stage_change' ? 'STAGE' : entry.type.toUpperCase()}
                    </ThemedText>
                  </View>
                </View>

                <ThemedText style={[styles.description, { color: colors.text }]}>
                  {entry.description}
                </ThemedText>

                <View style={styles.entryFooter}>
                  {entry.contactName && (
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        openPersonCard({ name: entry.contactName!, role: '' });
                      }}
                    >
                      <ThemedText style={[styles.contactLink, { color: accent }]}>
                        {entry.contactName}
                      </ThemedText>
                    </Pressable>
                  )}
                  {entry.dealId && (
                    <ThemedText style={[styles.dealRef, { color: colors.textSecondary }]}>
                      Deal #{entry.dealId}
                    </ThemedText>
                  )}
                </View>
              </View>
            </View>
          );
        })}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 10,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#2F3336',
  },
  filterPillText: { fontSize: 11, fontWeight: '600' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },
  timelineRow: { flexDirection: 'row', marginBottom: 4 },
  timelineCol: { width: 40, alignItems: 'center' },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 14 },
  timelineLine: { width: 2, flex: 1, marginTop: 4, marginBottom: -4 },
  entryCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginLeft: 8,
    marginBottom: 8,
  },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  timestamp: { fontSize: 11, fontWeight: '700' },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  typeBadgeText: { fontSize: 9, fontWeight: '700' },
  description: { fontSize: 13, lineHeight: 18, marginBottom: 6 },
  entryFooter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  contactLink: { fontSize: 12, fontWeight: '700' },
  dealRef: { fontSize: 10 },
});
