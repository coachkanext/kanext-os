/**
 * Business Hub Side Panel — Overview / Projects / Reports nav.
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { closeSidePanel } from '@/utils/global-side-panel';
import {
  PROJECTS, ACTIVITY_FEED, BIZ_DASHBOARD, DEALS,
  formatCurrency,
} from '@/data/mock-business-ops';

export function BusinessHubPanel() {
  const router = useRouter();
  const C = useColors();
  const [role, setRole] = useState<'Admin' | 'Employee'>('Admin');
  const isAdmin = role === 'Admin';

  const activeProjects = PROJECTS.filter(p => p.status === 'active');
  const myProjects     = PROJECTS.filter(p => p.teamIds.includes('e01')).slice(0, 3);
  const pipelineVal    = BIZ_DASHBOARD.pipeline.totalValue;
  const revenueMonth   = BIZ_DASHBOARD.thisMonth.revenue;

  const myTasks = PROJECTS.flatMap(p =>
    p.tasks.filter(t => t.assigneeId === 'e01' && t.status !== 'done'),
  ).slice(0, 3);

  const navRow = (icon: string, label: string, detail?: string) => (
    <Pressable
      key={label}
      style={({ pressed }) => [s.navRow, pressed && { backgroundColor: C.surfacePressed }]}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}
    >
      <IconSymbol name={icon as any} size={16} color={C.secondary} />
      <Text style={[s.navLabel, { color: C.label }]}>{label}</Text>
      {detail && <Text style={[s.navDetail, { color: C.muted }]}>{detail}</Text>}
      <IconSymbol name="chevron.right" size={12} color={C.muted} />
    </Pressable>
  );

  return (
    <View style={{ gap: 8 }}>

      {/* Role toggle */}
      <View style={[s.roleRow, { backgroundColor: C.surfacePressed as string }]}>
        {(['Admin', 'Employee'] as const).map(r => (
          <Pressable key={r} onPress={() => { Haptics.selectionAsync(); setRole(r); }}
            style={[s.roleBtn, r === role && { backgroundColor: C.accent }]}>
            <Text style={[s.roleBtnText, { color: r === role ? '#fff' : C.secondary }]}>{r}</Text>
          </Pressable>
        ))}
      </View>

      {isAdmin ? (
        <>
          {/* ── Home ── */}
          <Pressable
            style={({ pressed }) => [s.navRow, pressed && { backgroundColor: C.surfacePressed }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              closeSidePanel();
              router.setParams({ manage: undefined });
            }}
          >
            <IconSymbol name="house.fill" size={18} color={C.secondary} />
            <Text style={[s.navLabel, { color: C.label }]}>Home</Text>
          </Pressable>

          {/* Revenue banner */}
          <View style={{ backgroundColor: '#1A1714', borderRadius: 12, padding: 14, gap: 4 }}>
            <Text style={{ fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: 0.5 }}>This Month</Text>
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#fff', lineHeight: 32 }}>{formatCurrency(revenueMonth, true)}</Text>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>Pipeline: {formatCurrency(pipelineVal, true)} · {BIZ_DASHBOARD.pipeline.dealCount} deals</Text>
          </View>

          {/* Today's tasks */}
          <Text style={[s.sectionHeader, { color: C.secondary }]}>Today's Tasks</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
            {myTasks.length === 0 && (
              <Text style={[s.navLabel, { color: C.muted, padding: 14 }]}>All clear!</Text>
            )}
            {myTasks.map((task, i) => (
              <Pressable key={task.id} style={({ pressed }) => [
                s.navRow,
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                pressed && { backgroundColor: C.surfacePressed },
              ]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: task.priority === 'high' ? C.red : task.priority === 'medium' ? C.accent : C.muted }} />
                <Text style={[s.navLabel, { color: C.label }]} numberOfLines={1}>{task.title}</Text>
              </Pressable>
            ))}
          </View>

          {/* Activity */}
          <Text style={[s.sectionHeader, { color: C.secondary }]}>Activity</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
            {ACTIVITY_FEED.slice(0, 4).map((a, i) => (
              <Pressable key={a.id} style={({ pressed }) => [
                s.navRow,
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                pressed && { backgroundColor: C.surfacePressed },
              ]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}>
                <Text style={[s.navLabel, { color: C.label }]} numberOfLines={1}>{a.title}</Text>
                <Text style={[s.navDetail, { color: C.muted }]}>{a.time}</Text>
              </Pressable>
            ))}
          </View>

          {/* Quick actions */}
          <Text style={[s.sectionHeader, { color: C.secondary }]}>Actions</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
            {navRow('plus.circle.fill',         'New Project')}
            {navRow('chart.bar.fill',           'View Reports')}
            {navRow('square.and.arrow.up.fill', 'Export Data')}
          </View>
        </>
      ) : (
        <>
          {/* My tasks */}
          <Text style={[s.sectionHeader, { color: C.secondary }]}>My Tasks</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
            {myTasks.map((task, i) => (
              <Pressable key={task.id} style={({ pressed }) => [
                s.navRow,
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                pressed && { backgroundColor: C.surfacePressed },
              ]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: task.priority === 'high' ? C.red : task.priority === 'medium' ? C.accent : C.muted }} />
                <Text style={[s.navLabel, { color: C.label }]} numberOfLines={1}>{task.title}</Text>
              </Pressable>
            ))}
          </View>

          {/* My projects */}
          <Text style={[s.sectionHeader, { color: C.secondary }]}>My Projects</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
            {myProjects.map((p, i) => (
              <Pressable key={p.id} style={({ pressed }) => [
                s.navRow,
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                pressed && { backgroundColor: C.surfacePressed },
              ]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}>
                <Text style={[s.navLabel, { color: C.label }]} numberOfLines={1}>{p.name}</Text>
                <Text style={[s.navDetail, { color: C.muted }]}>{p.progress}%</Text>
                <IconSymbol name="chevron.right" size={12} color={C.muted} />
              </Pressable>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  sectionHeader: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', paddingVertical: 6 },
  navRow:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, gap: 10 },
  navLabel:      { flex: 1, fontSize: 14, fontWeight: '500' },
  navDetail:     { fontSize: 12 },
  roleRow:       { flexDirection: 'row', borderRadius: 10, padding: 3, gap: 2 },
  roleBtn:       { flex: 1, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  roleBtnText:   { fontSize: 13, fontWeight: '700' },
});
