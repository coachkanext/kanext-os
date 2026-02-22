/**
 * Organization Operations Tab — universal across all modes.
 * Workstreams (progress bars), Meetings, Rules & Policies, Compliance.
 */
import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { getOrgOperations } from '@/data/mock-org-operations';
import type { Mode } from '@/types';

interface Props {
  mode: Mode;
  colors: typeof Colors.light;
  accentColor: string;
}

function SectionLabel({ title, colors }: { title: string; colors: typeof Colors.light }) {
  return (
    <ThemedText style={[s.sectionLabel, { color: colors.textSecondary }]}>{title}</ThemedText>
  );
}

function StatusBadge({ status, colors }: { status: string; colors: typeof Colors.light }) {
  const map: Record<string, { bg: string; fg: string }> = {
    active: { bg: '#22C55E20', fg: '#22C55E' },
    completed: { bg: '#1D9BF020', fg: '#1D9BF0' },
    blocked: { bg: '#EF444420', fg: '#EF4444' },
    scheduled: { bg: '#F59E0B20', fg: '#F59E0B' },
    compliant: { bg: '#22C55E20', fg: '#22C55E' },
    review: { bg: '#F59E0B20', fg: '#F59E0B' },
    action_required: { bg: '#EF444420', fg: '#EF4444' },
  };
  const c = map[status] ?? { bg: colors.backgroundTertiary, fg: colors.textSecondary };
  return (
    <View style={[s.badge, { backgroundColor: c.bg }]}>
      <ThemedText style={[s.badgeText, { color: c.fg }]}>
        {status.replace('_', ' ')}
      </ThemedText>
    </View>
  );
}

export function OrgOperationsTab({ mode, colors, accentColor }: Props) {
  const data = useMemo(() => getOrgOperations(mode), [mode]);

  return (
    <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Workstreams */}
      {data.workstreams.length > 0 && (
        <>
          <SectionLabel title="Workstreams" colors={colors} />
          <View style={{ gap: Spacing.sm, marginBottom: Spacing.md }}>
            {data.workstreams.map((ws) => (
              <View key={ws.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={s.cardRow}>
                  <ThemedText style={s.cardTitle}>{ws.name}</ThemedText>
                  <StatusBadge status={ws.status} colors={colors} />
                </View>
                <ThemedText style={[s.cardSub, { color: colors.textSecondary }]}>
                  {ws.lead} · {ws.items} items
                </ThemedText>
                <View style={[s.progressTrack, { backgroundColor: colors.backgroundTertiary }]}>
                  <View style={[s.progressFill, { width: `${ws.progress}%`, backgroundColor: accentColor }]} />
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Meetings */}
      {data.meetings.length > 0 && (
        <>
          <SectionLabel title="Meetings" colors={colors} />
          <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.md }]}>
            {data.meetings.map((m, i) => (
              <React.Fragment key={m.id}>
                <View style={s.listRow}>
                  <View style={s.listInfo}>
                    <ThemedText style={s.listTitle}>{m.title}</ThemedText>
                    <ThemedText style={[s.listSub, { color: colors.textSecondary }]}>
                      {m.date} · {m.attendees.length} attendees
                    </ThemedText>
                  </View>
                  <StatusBadge status={m.status} colors={colors} />
                </View>
                {i < data.meetings.length - 1 && <View style={[s.divider, { backgroundColor: colors.divider }]} />}
              </React.Fragment>
            ))}
          </View>
        </>
      )}

      {/* Rules & Policies */}
      {data.rules.length > 0 && (
        <>
          <SectionLabel title="Rules & Policies" colors={colors} />
          <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.md }]}>
            {data.rules.map((r, i) => (
              <React.Fragment key={r.id}>
                <View style={s.listRow}>
                  <View style={s.listInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                      <ThemedText style={s.listTitle}>{r.title}</ThemedText>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: 2 }}>
                      <View style={[s.categoryBadge, { backgroundColor: accentColor + '18' }]}>
                        <ThemedText style={[s.categoryText, { color: accentColor }]}>{r.category}</ThemedText>
                      </View>
                    </View>
                    <ThemedText style={[s.listSub, { color: colors.textTertiary, marginTop: 4 }]} numberOfLines={2}>
                      {r.summary}
                    </ThemedText>
                  </View>
                </View>
                {i < data.rules.length - 1 && <View style={[s.divider, { backgroundColor: colors.divider }]} />}
              </React.Fragment>
            ))}
          </View>
        </>
      )}

      {/* Compliance */}
      {data.compliance.length > 0 && (
        <>
          <SectionLabel title="Compliance" colors={colors} />
          <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.md }]}>
            {data.compliance.map((c, i) => (
              <React.Fragment key={c.id}>
                <View style={s.listRow}>
                  <View style={s.listInfo}>
                    <ThemedText style={s.listTitle}>{c.title}</ThemedText>
                    {c.dueDate && (
                      <ThemedText style={[s.listSub, { color: colors.textTertiary }]}>Due: {c.dueDate}</ThemedText>
                    )}
                  </View>
                  <StatusBadge status={c.status} colors={colors} />
                </View>
                {i < data.compliance.length - 1 && <View style={[s.divider, { backgroundColor: colors.divider }]} />}
              </React.Fragment>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  cardSub: {
    fontSize: 13,
    marginTop: 4,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  listCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  listInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  listSub: {
    fontSize: 13,
    marginTop: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
