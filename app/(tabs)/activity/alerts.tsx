/**
 * Activity Screen — Notifications only (category tabs + alerts list + detail sheet).
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { AlertRow } from '@/components/messages/alert-row';
import { AlertDetail } from '@/components/messages/alert-detail';
import { NotificationCategoryTabs } from '@/components/messages/notification-category-tabs';
import { Spacing } from '@/constants/theme';
import { MOCK_ALERTS } from '@/data/mock-messages';
import type { AlertItem, NotificationCategory } from '@/data/mock-messages';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [category, setCategory] = useState<NotificationCategory>('all');
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);

  const filteredAlerts = useMemo(() => {
    if (category === 'all') return alerts;
    switch (category) {
      case 'mentions':
        return alerts.filter((a) => a.sourceTag === 'Mention');
      case 'tasks':
        return alerts.filter((a) => a.cta === 'Resolve');
      case 'recruiting':
        return alerts.filter((a) => a.sourceTag === 'Recruiting');
      case 'game_ops':
        return alerts.filter((a) => a.sourceTag === 'Game Ops' || a.sourceTag === 'Film');
      case 'system':
        return alerts.filter((a) => a.sourceTag === 'System');
      default:
        return alerts;
    }
  }, [alerts, category]);

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
      {/* Category Tabs */}
      <NotificationCategoryTabs
        activeCategory={category}
        onCategoryChange={setCategory}
      />

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
  listContent: {
    paddingBottom: 100,
    paddingTop: Spacing.xs,
  },
});
