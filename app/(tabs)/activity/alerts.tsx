/**
 * Alerts Screen — filter pills, source tag color coding, deep link actions.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { AlertRow } from '@/components/messages/alert-row';
import { AlertDetail } from '@/components/messages/alert-detail';
import { Spacing, BorderRadius } from '@/constants/theme';
import { MOCK_ALERTS } from '@/data/mock-messages';
import type { AlertItem, AlertSeverity } from '@/data/mock-messages';

type AlertFilter = 'all' | AlertSeverity | 'resolved';

const ALERT_FILTERS: { key: AlertFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'low', label: 'Low' },
  { key: 'resolved', label: 'Resolved' },
];

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [filter, setFilter] = useState<AlertFilter>('all');
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);

  const filteredAlerts = useMemo(() => {
    if (filter === 'all') return alerts;
    if (filter === 'resolved') return alerts.filter((a) => a.resolved);
    return alerts.filter((a) => a.severity === filter && !a.resolved);
  }, [alerts, filter]);

  const handleCta = useCallback((alert: AlertItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (alert.cta === 'Resolve') {
      setAlerts((prev) =>
        prev.map((a) => (a.id === alert.id ? { ...a, resolved: true } : a)),
      );
    }
  }, []);

  const handleResolve = useCallback(() => {
    if (!selectedAlert) return;
    setAlerts((prev) =>
      prev.map((a) => (a.id === selectedAlert.id ? { ...a, resolved: true } : a)),
    );
    setSelectedAlert(null);
  }, [selectedAlert]);

  const handleAssign = useCallback(() => {
    if (!selectedAlert) return;
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === selectedAlert.id
          ? {
              ...a,
              assignedTo: 'Coach Miller',
              history: [...(a.history ?? []), { action: 'Assigned to Coach Miller', timestamp: new Date() }],
            }
          : a,
      ),
    );
    setSelectedAlert(null);
  }, [selectedAlert]);

  const handleSnooze = useCallback(() => {
    if (!selectedAlert) return;
    const snoozeUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === selectedAlert.id
          ? {
              ...a,
              snoozedUntil: snoozeUntil,
              history: [...(a.history ?? []), { action: 'Snoozed for 24h', timestamp: new Date() }],
            }
          : a,
      ),
    );
    setSelectedAlert(null);
  }, [selectedAlert]);

  const handleEscalate = useCallback(() => {
    if (!selectedAlert) return;
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === selectedAlert.id
          ? {
              ...a,
              escalated: true,
              history: [...(a.history ?? []), { action: 'Escalated', timestamp: new Date() }],
            }
          : a,
      ),
    );
    setSelectedAlert(null);
  }, [selectedAlert]);

  const renderAlert = useCallback(
    ({ item }: { item: AlertItem }) => (
      <AlertRow
        alert={item}
        onCta={() => handleCta(item)}
        onPress={() => setSelectedAlert(item)}
      />
    ),
    [handleCta],
  );

  return (
    <View style={styles.container}>
      {/* Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        {ALERT_FILTERS.map((f) => {
          const isActive = filter === f.key;
          return (
            <Pressable
              key={f.key}
              style={[
                styles.filterChip,
                { backgroundColor: isActive ? '#f5f5f5' : '#111' },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFilter(f.key);
              }}
            >
              <ThemedText
                style={[styles.filterChipText, { color: isActive ? '#000' : '#6e6e6e' }]}
              >
                {f.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={filteredAlerts}
        keyExtractor={(item) => item.id}
        renderItem={renderAlert}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Alert Detail Sheet */}
      <BottomSheet
        visible={selectedAlert !== null}
        onClose={() => setSelectedAlert(null)}
        title="Alert Detail"
        useModal
      >
        {selectedAlert && (
          <AlertDetail
            alert={selectedAlert}
            onResolve={handleResolve}
            onAssign={handleAssign}
            onSnooze={handleSnooze}
            onEscalate={handleEscalate}
          />
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  filterScroll: {
    flexGrow: 0,
    marginBottom: Spacing.sm,
  },
  filterRow: {
    paddingHorizontal: Spacing.md,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 100,
    paddingTop: Spacing.xs,
  },
});
