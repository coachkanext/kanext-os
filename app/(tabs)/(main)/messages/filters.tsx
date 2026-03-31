/**
 * Messages Filters — Full page with filter toggles.
 * Active filters show indicator on Messages landing.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Switch,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAccentColor } from '@/hooks/use-accent-color';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import {
  setMessageFilter,
  getMessageFilters,
  type MessageFilterKey,
} from '@/utils/global-message-filters';

const FILTER_OPTIONS: { key: MessageFilterKey; label: string; description: string }[] = [
  { key: 'unread', label: 'Unread Only', description: 'Show only rooms and DMs with unread messages' },
  { key: 'mentions', label: 'Mentions Only', description: 'Show only conversations where you were mentioned' },
  { key: 'pinned', label: 'Pinned Only', description: 'Show only pinned rooms and DMs' },
  { key: 'dms_only', label: 'DMs Only', description: 'Hide rooms, show only direct messages' },
  { key: 'channels_only', label: 'Rooms Only', description: 'Hide DMs, show only rooms' },
];

export default function FiltersScreen() {
  const insets = useSafeAreaInsets();
  const accent = useAccentColor();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const [filters, setFilters] = useState(getMessageFilters);

  const toggleFilter = useCallback((key: MessageFilterKey) => {
    setFilters((prev) => {
      const newVal = !prev[key];
      const next = { ...prev, [key]: newVal };
      // Mutually exclusive
      if (key === 'dms_only' && newVal) {
        next.channels_only = false;
        setMessageFilter('channels_only', false);
      } else if (key === 'channels_only' && newVal) {
        next.dms_only = false;
        setMessageFilter('dms_only', false);
      }
      setMessageFilter(key, newVal);
      return next;
    });
  }, []);

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Filters</Text>
        {activeCount > 0 && (
          <View style={[styles.countBadge, { backgroundColor: accent }]}>
            <Text style={styles.countText}>{activeCount}</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {FILTER_OPTIONS.map((opt) => (
          <View key={opt.key} style={styles.filterRow}>
            <View style={styles.filterInfo}>
              <Text style={styles.filterLabel}>{opt.label}</Text>
              <Text style={styles.filterDesc}>{opt.description}</Text>
            </View>
            <Switch
              value={filters[opt.key]}
              onValueChange={() => toggleFilter(opt.key)}
              trackColor={{ false: '#3D352E', true: accent }}
              thumbColor="#FFFFFF"
            />
          </View>
        ))}

        <View style={styles.divider} />

        <Text style={styles.note}>
          Active filters apply to the Messages landing screen. They persist until turned off.
        </Text>
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, gap: 10 },
  title: { fontSize: 28, fontWeight: '700', color: C.label },
  countBadge: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  countText: { fontSize: 13, fontWeight: '700', color: C.label },
  list: { flex: 1 },
  filterRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  filterInfo: { flex: 1, marginRight: 16 },
  filterLabel: { fontSize: 16, fontWeight: '600', color: C.label },
  filterDesc: { fontSize: 13, color: C.muted, marginTop: 4, lineHeight: 18 },
  divider: { height: 1, backgroundColor: C.separator, marginHorizontal: 20, marginVertical: 8 },
  note: { fontSize: 13, color: C.muted, paddingHorizontal: 20, lineHeight: 18 },
});
