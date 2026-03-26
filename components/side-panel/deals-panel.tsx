/**
 * Deals Side Panel — personal CRM pipeline tools.
 * Quick nav, deals closing soon, overdue follow-ups, pipeline settings.
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import {
  PERSONAL_DEALS, INSIGHT_STATS,
  formatDealValue, formatRelativeDate, isClosingSoon, getContactById,
  PRIORITY_COLORS,
} from '@/data/mock-personal-deals';

const CLOSING_SOON  = PERSONAL_DEALS.filter(d => isClosingSoon(d) && d.stage !== 'Won' && d.stage !== 'Lost');
const OVERDUE_TASKS = PERSONAL_DEALS.flatMap(d =>
  d.tasks.filter(t => !t.completed && t.dueDate.getTime() < Date.now())
    .map(t => ({ task: t, deal: d }))
);

export function DealsPanel() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);

  const close = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeSidePanel();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: C.accent + '20' }]}>
          <IconSymbol name="bag.fill" size={18} color={C.accent} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[styles.headerName, { color: C.label }]}>My Deals</Text>
          <Text style={[styles.headerSub, { color: C.secondary }]}>
            ${(INSIGHT_STATS.totalPipelineValue / 1000).toFixed(0)}K pipeline
          </Text>
        </View>
      </View>

      {/* Navigate */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: C.secondary }]}>NAVIGATE</Text>
        {[
          { icon: 'arrow.trianglehead.2.clockwise.rotate.90', label: 'Pipeline'  },
          { icon: 'person.2',                                 label: 'Contacts'  },
          { icon: 'chart.bar',                                label: 'Insights'  },
        ].map(item => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [styles.navRow, { backgroundColor: pressed ? C.surfacePressed : 'transparent' }]}
            onPress={close}
          >
            <View style={[styles.navIcon, { backgroundColor: C.surfacePressed }]}>
              <IconSymbol name={item.icon as any} size={15} color={C.label} />
            </View>
            <Text style={[styles.navLabel, { color: C.label }]}>{item.label}</Text>
            <IconSymbol name="chevron.right" size={14} color={C.muted} />
          </Pressable>
        ))}
      </View>

      {/* Closing soon */}
      {CLOSING_SOON.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.secondary }]}>CLOSING THIS WEEK</Text>
          {CLOSING_SOON.map(deal => {
            const contact = getContactById(deal.contactId);
            return (
              <Pressable
                key={deal.id}
                style={({ pressed }) => [styles.navRow, { backgroundColor: pressed ? C.surfacePressed : 'transparent' }]}
                onPress={close}
              >
                <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[deal.priority] }]} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.navLabel, { color: C.label }]} numberOfLines={1}>{deal.title}</Text>
                  <Text style={[styles.navSub, { color: C.muted }]}>{contact?.company ?? ''}</Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: '600', color: C.accent }}>{formatDealValue(deal.value)}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Overdue follow-ups */}
      {OVERDUE_TASKS.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.secondary }]}>OVERDUE FOLLOW-UPS</Text>
          {OVERDUE_TASKS.slice(0, 3).map(({ task, deal }) => (
            <Pressable
              key={task.id}
              style={({ pressed }) => [styles.navRow, { backgroundColor: pressed ? C.surfacePressed : 'transparent' }]}
              onPress={close}
            >
              <View style={[styles.navIcon, { backgroundColor: '#B85C5C' + '20' }]}>
                <IconSymbol name="exclamationmark" size={14} color="#B85C5C" />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.navLabel, { color: C.label }]} numberOfLines={1}>{task.title}</Text>
                <Text style={[styles.navSub, { color: '#B85C5C' }]}>{deal.title}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {/* Quick add */}
      <View style={styles.section}>
        <Pressable
          style={({ pressed }) => [styles.addBtn, { backgroundColor: C.accent, opacity: pressed ? 0.85 : 1 }]}
          onPress={close}
        >
          <IconSymbol name="plus" size={16} color="#fff" />
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>Add New Deal</Text>
        </Pressable>
      </View>

      {/* Pipeline settings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: C.secondary }]}>SETTINGS</Text>
        {[
          { icon: 'slider.horizontal.3', label: 'Customize Stages' },
          { icon: 'percent',             label: 'Win Probabilities' },
          { icon: 'doc.text',            label: 'Message Templates' },
          { icon: 'square.and.arrow.up', label: 'Export CSV' },
        ].map(item => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [styles.navRow, { backgroundColor: pressed ? C.surfacePressed : 'transparent' }]}
            onPress={close}
          >
            <View style={[styles.navIcon, { backgroundColor: C.surfacePressed }]}>
              <IconSymbol name={item.icon as any} size={15} color={C.label} />
            </View>
            <Text style={[styles.navLabel, { color: C.label }]}>{item.label}</Text>
            <IconSymbol name="chevron.right" size={14} color={C.muted} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingBottom: 20, marginBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
  },
  iconBadge: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  headerName:  { fontSize: 15, fontWeight: '700' },
  headerSub:   { fontSize: 12, marginTop: 1 },
  section:     { marginTop: 20 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, marginBottom: 8 },
  navRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 8, borderRadius: 10, paddingHorizontal: 2,
  },
  navIcon:  { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  navLabel: { flex: 1, fontSize: 14, fontWeight: '500' },
  navSub:   { fontSize: 11, marginTop: 1 },
  priorityDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 12, paddingVertical: 12,
  },
});
