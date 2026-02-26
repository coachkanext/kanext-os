/**
 * Biz Vault Activity View — Chronological enterprise document feed
 *
 * Displays:
 *  - Document Created
 *  - Version Uploaded
 *  - Document Archived
 *  - Access Changed
 *  - Lock / Unlock
 *
 * No comments. No chat threads. No reactions.
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, MODE_ACCENT } from '@/constants/theme';
import { VAULT_ACTIVITY, type VaultActivityType } from '@/data/mock-vault';

const ACCENT = MODE_ACCENT.business;

// =============================================================================
// ACTIVITY TYPE CONFIG
// =============================================================================

const ACTIVITY_CONFIG: Record<VaultActivityType, { icon: string; color: string; label: string }> = {
  created: { icon: 'plus.circle.fill', color: '#22C55E', label: 'Document Created' },
  version_uploaded: { icon: 'arrow.up.circle.fill', color: '#2563EB', label: 'Version Uploaded' },
  archived: { icon: 'archivebox.fill', color: '#A1A1AA', label: 'Document Archived' },
  access_changed: { icon: 'person.crop.circle.badge.checkmark', color: '#F59E0B', label: 'Access Changed' },
  locked: { icon: 'lock.fill', color: '#EF4444', label: 'Locked' },
  unlocked: { icon: 'lock.open.fill', color: '#22C55E', label: 'Unlocked' },
};

// =============================================================================
// DATE GROUPING
// =============================================================================

function groupByDate(events: typeof VAULT_ACTIVITY): Map<string, typeof VAULT_ACTIVITY> {
  const groups = new Map<string, typeof VAULT_ACTIVITY>();
  for (const event of events) {
    const key = event.date;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(event);
  }
  return groups;
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

export function BizVaultActivityView({ colors, accent }: Props) {
  const grouped = groupByDate(VAULT_ACTIVITY);

  return (
    <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
      {[...grouped.entries()].map(([date, events]) => (
        <View key={date} style={s.dateGroup}>
          <ThemedText style={[s.dateHeader, { color: colors.textTertiary }]}>{date}</ThemedText>
          {events.map((event) => {
            const config = ACTIVITY_CONFIG[event.type];
            return (
              <View key={event.id} style={s.eventRow}>
                {/* Timeline indicator */}
                <View style={s.timeline}>
                  <IconSymbol name={config.icon as any} size={16} color={config.color} />
                  <View style={[s.timelineLine, { backgroundColor: colors.border }]} />
                </View>

                {/* Event content */}
                <View style={[s.eventCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={s.eventHeader}>
                    <ThemedText style={[s.eventLabel, { color: config.color }]}>{config.label}</ThemedText>
                  </View>
                  <ThemedText style={[s.eventTitle, { color: colors.text }]} numberOfLines={1}>
                    {event.documentTitle}
                  </ThemedText>
                  {event.detail && (
                    <ThemedText style={[s.eventDetail, { color: colors.textSecondary }]} numberOfLines={2}>
                      {event.detail}
                    </ThemedText>
                  )}
                  <ThemedText style={[s.eventActor, { color: colors.textTertiary }]}>
                    {event.actor}
                  </ThemedText>
                </View>
              </View>
            );
          })}
        </View>
      ))}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },

  // Date groups
  dateGroup: { marginBottom: 4 },
  dateHeader: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3, marginBottom: 8, marginTop: 8 },

  // Event row
  eventRow: { flexDirection: 'row', marginBottom: 6 },

  // Timeline
  timeline: { width: 24, alignItems: 'center', paddingTop: 10 },
  timelineLine: { width: 1, flex: 1, marginTop: 4 },

  // Event card
  eventCard: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginLeft: 8,
  },
  eventHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  eventLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  eventTitle: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  eventDetail: { fontSize: 12, lineHeight: 17, marginBottom: 4 },
  eventActor: { fontSize: 11 },
});
