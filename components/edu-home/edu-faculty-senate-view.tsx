/**
 * Education Faculty Senate View
 * Committee cards with status badge, recent actions, sorted by next meeting.
 */

import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { SENATE_COMMITTEES, type SenateCommittee } from '@/data/mock-education-home';

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: '#22C55E',
  inactive: '#A1A1AA',
  ad_hoc: '#F59E0B',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  ad_hoc: 'Ad Hoc',
};

function formatMeetingDate(dateStr: string): string {
  if (!dateStr) return 'TBD';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function EduFacultySenateView({ colors, accent }: Props) {
  const sorted = useMemo(() => {
    return [...SENATE_COMMITTEES].sort((a, b) => {
      // Committees with no next meeting go to the end
      if (!a.nextMeeting && !b.nextMeeting) return 0;
      if (!a.nextMeeting) return 1;
      if (!b.nextMeeting) return -1;
      return a.nextMeeting.localeCompare(b.nextMeeting);
    });
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {sorted.map((committee) => {
        const statusColor = STATUS_COLORS[committee.status] ?? '#A1A1AA';
        const statusLabel = STATUS_LABELS[committee.status] ?? committee.status;

        return (
          <View
            key={committee.id}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            {/* Header */}
            <View style={styles.cardHeader}>
              <ThemedText style={[styles.committeeName, { color: colors.text }]}>
                {committee.name}
              </ThemedText>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
                <ThemedText style={[styles.statusText, { color: statusColor }]}>
                  {statusLabel}
                </ThemedText>
              </View>
            </View>

            {/* Meta */}
            <ThemedText style={[styles.meta, { color: colors.textSecondary }]}>
              Chair: {committee.chair} · {committee.memberCount} members
            </ThemedText>
            <ThemedText style={[styles.meta, { color: colors.textSecondary }]}>
              Next Meeting: {formatMeetingDate(committee.nextMeeting)}
            </ThemedText>

            {/* Recent Actions (first 2) */}
            {committee.recentActions.length > 0 && (
              <View style={styles.actionsSection}>
                <ThemedText style={[styles.actionsHeader, { color: accent }]}>
                  RECENT ACTIONS
                </ThemedText>
                {committee.recentActions.slice(0, 2).map((action, idx) => (
                  <View key={idx} style={styles.actionRow}>
                    <ThemedText style={[styles.bullet, { color: colors.textSecondary }]}>·</ThemedText>
                    <ThemedText style={[styles.actionText, { color: colors.textSecondary }]}>
                      {action}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  committeeName: { fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },
  meta: { fontSize: 12 },
  actionsSection: { marginTop: 6, gap: 3 },
  actionsHeader: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 2 },
  actionRow: { flexDirection: 'row', gap: 6, paddingRight: 8 },
  bullet: { fontSize: 12, lineHeight: 18 },
  actionText: { fontSize: 11, lineHeight: 18, flex: 1 },
});
