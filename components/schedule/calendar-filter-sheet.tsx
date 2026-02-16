/**
 * Calendar Filter Sheet
 * Bottom sheet for filtering calendar events by scope and type.
 */

import React from 'react';
import { View, StyleSheet, Pressable, Switch } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from '@/data/calendar-utils';
import type { ProgramCalendarEventType, CalendarVisibilityScope } from '@/types';

interface CalendarFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  colors: typeof Colors.light;
  scopeFilter: CalendarVisibilityScope;
  onScopeChange: (scope: CalendarVisibilityScope) => void;
  typeFilters: Set<ProgramCalendarEventType>;
  onTypeToggle: (type: ProgramCalendarEventType) => void;
}

const SCOPES: { key: CalendarVisibilityScope; label: string }[] = [
  { key: 'all_program', label: 'All Program' },
  { key: 'team_staff', label: 'Team & Staff' },
  { key: 'player', label: 'Player' },
];

const ALL_TYPES: ProgramCalendarEventType[] = [
  'game', 'practice', 'lift', 'travel', 'meeting', 'recruiting', 'academic', 'admin_deadline',
];

export function CalendarFilterSheet({
  visible, onClose, colors, scopeFilter, onScopeChange, typeFilters, onTypeToggle,
}: CalendarFilterSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} useModal>
      <View style={styles.container}>
        <ThemedText style={[styles.title, { color: colors.text }]}>Filters</ThemedText>

        {/* Scope section */}
        <ThemedText style={[styles.sectionTitle, { color: colors.textTertiary }]}>VISIBILITY</ThemedText>
        <View style={styles.scopeRow}>
          {SCOPES.map((scope) => {
            const isActive = scopeFilter === scope.key;
            return (
              <Pressable
                key={scope.key}
                style={[
                  styles.scopePill,
                  { backgroundColor: isActive ? colors.text + 'E0' : colors.backgroundSecondary },
                ]}
                onPress={() => onScopeChange(scope.key)}
              >
                <ThemedText
                  style={[styles.scopeText, { color: isActive ? colors.background : colors.textSecondary }]}
                >
                  {scope.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        {/* Event type section */}
        <ThemedText style={[styles.sectionTitle, { color: colors.textTertiary, marginTop: Spacing.lg }]}>
          EVENT TYPES
        </ThemedText>
        {ALL_TYPES.map((type) => {
          const enabled = typeFilters.has(type);
          const color = EVENT_TYPE_COLORS[type];
          const label = EVENT_TYPE_LABELS[type];
          return (
            <Pressable
              key={type}
              style={[styles.typeRow, { borderBottomColor: colors.divider }]}
              onPress={() => onTypeToggle(type)}
            >
              <View style={[styles.typeDot, { backgroundColor: color }]} />
              <ThemedText style={[styles.typeLabel, { color: colors.text }]}>{label}</ThemedText>
              <Switch
                value={enabled}
                onValueChange={() => onTypeToggle(type)}
                trackColor={{ false: colors.divider, true: color + '80' }}
                thumbColor={enabled ? color : colors.textTertiary}
              />
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  title: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.lg },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8 },
  scopeRow: { flexDirection: 'row', gap: 8 },
  scopePill: { flex: 1, paddingVertical: 8, borderRadius: 14, alignItems: 'center' },
  scopeText: { fontSize: 12, fontWeight: '600' },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  typeDot: { width: 10, height: 10, borderRadius: 5 },
  typeLabel: { fontSize: 15, fontWeight: '500', flex: 1 },
});
