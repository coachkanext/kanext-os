/**
 * Business Hub — Overview / Projects / Reports
 * KaNeXT Operations LLC
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { GlassView } from '@/components/ui/glass-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import {
  PROJECTS, ACTIVITY_FEED, BIZ_DASHBOARD, REVENUE_TREND, RECENT_TRANSACTIONS, EMPLOYEES, DEPARTMENTS,
  getEmployeeById,
  formatCurrency, formatDate,
  type Project, type TaskStatus,
} from '@/data/mock-business-ops';

const TOP_BAR_H = 52;
const PILLS_H   = 48;

type BizHubTab = 'Overview' | 'Projects' | 'Reports';
type BizRole   = 'Admin' | 'Employee';

function pillsForTab(tab: BizHubTab, isAdmin: boolean): string[] {
  if (tab === 'Projects') return ['All', 'Active', 'Planning', 'On Hold', 'Completed', 'My Projects'];
  if (tab === 'Reports' && isAdmin) return ['Financial', 'Sales', 'Team'];
  return [];
}

function taskStatusColor(status: TaskStatus, C: ComponentColors): string {
  switch (status) {
    case 'done':        return C.green;
    case 'in-progress': return C.accent;
    case 'review':      return '#1D9BF0';
    default:            return C.muted as string;
  }
}

function projectStatusColor(status: string, C: ComponentColors): string {
  switch (status) {
    case 'active':    return C.accent;
    case 'planning':  return '#1D9BF0';
    case 'on-hold':   return '#8B6340';
    case 'completed': return C.green;
    default:          return C.muted as string;
  }
}

function activityIconColor(type: string, C: ComponentColors): string {
  switch (type) {
    case 'deal':     return C.accent;
    case 'invoice':  return C.green;
    case 'project':  return '#1D9BF0';
    case 'team':     return '#8B6340';
    case 'campaign': return '#003A63';
    default:         return C.secondary as string;
  }
}

export default function BusinessHubScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);
  const topBarH = insets.top + TOP_BAR_H;

  const [activeTab,    setActiveTab]    = useState<BizHubTab>('Overview');
  const [role,         setRole]         = useState<BizRole>('Admin');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pillsVisible, setPillsVisible] = useState(false);
  const [selectedPill, setSelectedPill] = useState('All');
  const pillsAnim = useRef(new Animated.Value(0)).current;

  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [expandedDeptId,    setExpandedDeptId]    = useState<string | null>(null);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const pills = useMemo(() => pillsForTab(activeTab, role === 'Admin'), [activeTab, role]);

  function togglePills() {
    Haptics.selectionAsync();
    const next = !pillsVisible;
    setPillsVisible(next);
    Animated.timing(pillsAnim, { toValue: next ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }

  function changeTab(tab: BizHubTab) {
    Haptics.selectionAsync();
    setDropdownOpen(false);
    setActiveTab(tab);
    setSelectedPill('All');
    setExpandedProjectId(null);
    const newPills = pillsForTab(tab, role === 'Admin');
    if (!newPills.length) {
      setPillsVisible(false);
      pillsAnim.setValue(0);
    }
  }

  function cycleRole() {
    Haptics.selectionAsync();
    setRole(r => r === 'Admin' ? 'Employee' : 'Admin');
    setPillsVisible(false);
    pillsAnim.setValue(0);
  }

  const contentPaddingTop = topBarH + (pillsVisible ? PILLS_H : 0) + 8;
  const maxRevenue = useMemo(() => Math.max(...REVENUE_TREND.map(r => r.revenue)), []);

  const filteredProjects = useMemo(() => {
    const base = role === 'Employee' ? PROJECTS.filter(p => p.teamIds.includes('e01')) : PROJECTS;
    if (selectedPill === 'All' || selectedPill === 'My Projects') return base;
    const map: Record<string, string> = { Active: 'active', Planning: 'planning', 'On Hold': 'on-hold', Completed: 'completed' };
    return base.filter(p => p.status === map[selectedPill]);
  }, [selectedPill, role]);

  // ── OVERVIEW ─────────────────────────────────────────────────────────────────

  function renderOverview() {
    const isAdmin = role === 'Admin';
    return (
      <View style={{ paddingHorizontal: 16, gap: 16, paddingBottom: 32 }}>
        {isAdmin && (
          <GlassView tier={1} style={[s.card, { backgroundColor: '#1D3D5C', gap: 6 }]}>
            <Text style={[s.sectionTitle, { color: '#fff' }]}>KaNeXT Operations LLC</Text>
            <Text style={[s.bodySmall, { color: 'rgba(255,255,255,0.7)' }]}>Q1 2026 · Revenue {formatCurrency(BIZ_DASHBOARD.thisMonth.revenue, true)} this month</Text>
            <View style={[s.row, { marginTop: 8, gap: 8 }]}>
              {[
                { label: 'Revenue',  value: formatCurrency(BIZ_DASHBOARD.thisMonth.revenue, true), color: '#5A8A6E' },
                { label: 'Profit',   value: formatCurrency(BIZ_DASHBOARD.thisMonth.profit, true),  color: '#7EB8D4' },
                { label: 'Pipeline', value: formatCurrency(BIZ_DASHBOARD.pipeline.totalValue, true), color: C.accent },
              ].map(m => (
                <View key={m.label} style={[s.metricChip, { backgroundColor: 'rgba(255,255,255,0.1)', flex: 1 }]}>
                  <Text style={[s.metricChipNum, { color: m.color }]}>{m.value}</Text>
                  <Text style={[s.metricChipLabel, { color: 'rgba(255,255,255,0.5)' }]}>{m.label}</Text>
                </View>
              ))}
            </View>
          </GlassView>
        )}

        {/* Key metrics */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 4 }}>
          {[
            { label: 'MRR',        value: '$12,285',     icon: 'arrow.up.right',              color: C.green },
            { label: 'Open Deals', value: `${BIZ_DASHBOARD.pipeline.dealCount}`,              icon: 'briefcase.fill', color: C.accent },
            { label: 'Team',       value: `${EMPLOYEES.filter(e=>e.status!=='contractor').length}`, icon: 'person.2.fill', color: '#1D9BF0' },
            { label: 'Projects',   value: `${PROJECTS.filter(p=>p.status==='active').length} active`, icon: 'checkmark.circle.fill', color: '#8B6340' },
            { label: 'Overdue',    value: '2 invoices',  icon: 'exclamationmark.circle.fill', color: C.red },
          ].map(m => (
            <GlassView tier={1} key={m.label} style={[s.metricCard, { gap: 4 }]}>
              <IconSymbol name={m.icon as any} size={18} color={m.color} />
              <Text style={[s.metricCardNum, { color: C.label }]}>{m.value}</Text>
              <Text style={[s.metricCardLabel, { color: C.secondary as string }]}>{m.label}</Text>
            </GlassView>
          ))}
        </ScrollView>

        {/* Revenue mini-chart */}
        {isAdmin && (
          <GlassView tier={1} style={s.card}>
            <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Revenue (12 months)</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 60 }}>
              {REVENUE_TREND.map((r, i) => {
                const h = (r.revenue / maxRevenue) * 60;
                const isLast = i === REVENUE_TREND.length - 1;
                return (
                  <View key={r.month} style={{ flex: 1, alignItems: 'center', gap: 3 }}>
                    <View style={{ width: '100%', height: h, borderRadius: 3, backgroundColor: isLast ? C.accent : C.surfacePressed as string }} />
                    {(i === 0 || i === 5 || i === 11) && (
                      <Text style={[s.chartLabel, { color: C.muted as string }]}>{r.month}</Text>
                    )}
                  </View>
                );
              })}
            </View>
            <View style={[s.row, { marginTop: 8, justifyContent: 'space-between' }]}>
              <Text style={[s.bodySmall, { color: C.secondary as string }]}>YTD: {formatCurrency(REVENUE_TREND.slice(9).reduce((s,r)=>s+r.revenue,0), true)}</Text>
              <Text style={[s.bodySmall, { color: C.muted as string }]}>Expenses: {formatCurrency(BIZ_DASHBOARD.thisMonth.expenses, true)}</Text>
            </View>
          </GlassView>
        )}

        {/* Active Projects snapshot */}
        <GlassView tier={1} style={s.card}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 10 }]}>Active Projects</Text>
          {PROJECTS.filter(p => p.status === 'active').slice(0, 3).map(p => (
            <View key={p.id} style={[s.projectRow, { borderTopColor: C.separator as string }]}>
              <View style={{ flex: 1 }}>
                <Text style={[s.bodyMed, { color: C.label }]} numberOfLines={1}>{p.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <View style={[s.progressBarBg, { flex: 1, backgroundColor: C.surfacePressed as string }]}>
                    <View style={[s.progressBarFill, { width: `${p.progress}%` as any, backgroundColor: C.accent }]} />
                  </View>
                  <Text style={[s.bodySmall, { color: C.secondary as string, width: 32, textAlign: 'right' }]}>{p.progress}%</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', marginLeft: 8 }}>
                {p.teamIds.slice(0, 3).map(tid => {
                  const e = getEmployeeById(tid);
                  if (!e) return null;
                  return (
                    <View key={tid} style={[s.avatar, { backgroundColor: `hsl(${e.hue},45%,28%)`, marginLeft: -6 }]}>
                      <Text style={s.avatarText}>{e.initials}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
          <Pressable onPress={() => changeTab('Projects')} style={{ marginTop: 8 }}>
            <Text style={[s.linkText, { color: C.accent }]}>View all projects →</Text>
          </Pressable>
        </GlassView>

        {/* Team Pulse */}
        <GlassView tier={1} style={s.card}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 10 }]}>Team Pulse</Text>
          <View style={[s.row, { gap: 8 }]}>
            {[
              { label: 'Active',      value: BIZ_DASHBOARD.teamPulse.activeToday, color: C.green },
              { label: 'On PTO',      value: BIZ_DASHBOARD.teamPulse.onPTO,       color: '#8B6340' },
              { label: 'Contractors', value: BIZ_DASHBOARD.teamPulse.contractors, color: '#1D9BF0' },
              { label: 'Openings',    value: BIZ_DASHBOARD.teamPulse.openings,    color: C.red },
            ].map(item => (
              <View key={item.label} style={[s.metricChip, { flex: 1, backgroundColor: C.surfacePressed as string }]}>
                <Text style={[s.metricChipNum, { color: item.color }]}>{item.value}</Text>
                <Text style={[s.metricChipLabel, { color: C.secondary as string }]}>{item.label}</Text>
              </View>
            ))}
          </View>
        </GlassView>

        {/* Activity feed */}
        <GlassView tier={1} style={s.card}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 10 }]}>Activity</Text>
          {ACTIVITY_FEED.slice(0, 6).map((a, i) => (
            <View key={a.id} style={[
              { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
              i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string },
            ]}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: `${activityIconColor(a.type, C)}20`, alignItems: 'center', justifyContent: 'center' }}>
                <IconSymbol name={a.icon as any} size={14} color={activityIconColor(a.type, C)} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.bodyMed, { color: C.label }]} numberOfLines={1}>{a.title}</Text>
                <Text style={[s.bodySmall, { color: C.secondary as string }]} numberOfLines={1}>{a.subtitle}</Text>
              </View>
              <Text style={[s.bodySmall, { color: C.muted as string }]}>{a.time}</Text>
            </View>
          ))}
        </GlassView>

        {isAdmin && (
          <GlassView tier={1} style={[s.card, { flexDirection: 'row', gap: 8 }]}>
            {[
              { label: 'New Deal',   icon: 'plus.circle.fill' },
              { label: 'Invoice',    icon: 'doc.text.fill' },
              { label: 'Add Task',   icon: 'checkmark.circle.fill' },
            ].map(a => (
              <Pressable key={a.label} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                style={[s.quickActionBtn, { flex: 1, borderColor: C.inputBorder as string }]}>
                <IconSymbol name={a.icon as any} size={18} color={C.accent} />
                <Text style={[s.bodySmall, { color: C.label, textAlign: 'center', marginTop: 4 }]}>{a.label}</Text>
              </Pressable>
            ))}
          </GlassView>
        )}
      </View>
    );
  }

  // ── PROJECTS ─────────────────────────────────────────────────────────────────

  function renderProjects() {
    return (
      <View style={{ paddingHorizontal: 16, gap: 12, paddingBottom: 100 }}>
        {filteredProjects.map(p => {
          const isExpanded = expandedProjectId === p.id;
          return (
            <GlassView tier={1} key={p.id} style={s.card}>
              <Pressable onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setExpandedProjectId(isExpanded ? null : p.id);
              }}>
                <View style={[s.row, { marginBottom: 8 }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.bodyMed, { color: C.label, fontSize: 15 }]}>{p.name}</Text>
                    <Text style={[s.bodySmall, { color: C.secondary as string, marginTop: 2 }]} numberOfLines={2}>{p.description}</Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: `${projectStatusColor(p.status, C)}20`, borderColor: projectStatusColor(p.status, C) }]}>
                    <Text style={[s.statusBadgeText, { color: projectStatusColor(p.status, C) }]}>{p.status.replace('-', ' ')}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[s.progressBarBg, { flex: 1, backgroundColor: C.surfacePressed as string }]}>
                    <View style={[s.progressBarFill, { width: `${p.progress}%` as any, backgroundColor: projectStatusColor(p.status, C) }]} />
                  </View>
                  <Text style={[s.bodySmall, { color: C.secondary as string, width: 32 }]}>{p.progress}%</Text>
                </View>
                <View style={[s.row, { marginTop: 8 }]}>
                  <View style={{ flexDirection: 'row' }}>
                    {p.teamIds.slice(0, 4).map(tid => {
                      const e = getEmployeeById(tid);
                      if (!e) return null;
                      return (
                        <View key={tid} style={[s.avatar, { backgroundColor: `hsl(${e.hue},45%,28%)`, marginLeft: -6 }]}>
                          <Text style={s.avatarText}>{e.initials}</Text>
                        </View>
                      );
                    })}
                  </View>
                  <Text style={[s.bodySmall, { color: C.muted as string, marginLeft: 8 }]}>{formatDate(p.endDate)}</Text>
                  <IconSymbol name={isExpanded ? 'chevron.up' : 'chevron.down'} size={12} color={C.muted as string} style={{ marginLeft: 'auto' }} />
                </View>
              </Pressable>

              {isExpanded && (
                <View style={{ marginTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string, paddingTop: 12 }}>
                  <Text style={[s.subHeader, { color: C.secondary as string, marginBottom: 8 }]}>Task Board</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 10, paddingVertical: 4 }}>
                    {(['todo', 'in-progress', 'review', 'done'] as TaskStatus[]).map(col => {
                      const colLabels: Record<TaskStatus, string> = { todo: 'Todo', 'in-progress': 'In Progress', review: 'Review', done: 'Done' };
                      const tasks = p.tasks.filter(t => t.status === col);
                      return (
                        <View key={col} style={[s.kanbanCol, { backgroundColor: C.surfacePressed as string }]}>
                          <View style={[s.row, { marginBottom: 6 }]}>
                            <View style={[s.statusDot, { backgroundColor: taskStatusColor(col, C) }]} />
                            <Text style={[s.subHeader, { color: C.secondary as string }]}>{colLabels[col]}</Text>
                          </View>
                          {tasks.map(task => {
                            const assignee = getEmployeeById(task.assigneeId);
                            return (
                              <View key={task.id} style={[s.taskCard, { backgroundColor: C.surface }]}>
                                <Text style={[s.bodySmall, { color: C.label }]} numberOfLines={2}>{task.title}</Text>
                                <View style={[s.row, { marginTop: 6 }]}>
                                  {assignee && (
                                    <View style={[s.avatarSm, { backgroundColor: `hsl(${assignee.hue},45%,28%)` }]}>
                                      <Text style={s.avatarSmText}>{assignee.initials}</Text>
                                    </View>
                                  )}
                                  <Text style={[s.bodySmall, { color: C.muted as string, marginLeft: 4, fontSize: 10 }]}>{formatDate(task.dueDate)}</Text>
                                </View>
                              </View>
                            );
                          })}
                          {tasks.length === 0 && (
                            <Text style={[s.bodySmall, { color: C.muted as string, textAlign: 'center', paddingVertical: 8, fontSize: 11 }]}>Empty</Text>
                          )}
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </GlassView>
          );
        })}
        {filteredProjects.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <IconSymbol name="folder" size={36} color={C.muted as string} />
            <Text style={[s.bodySmall, { color: C.muted as string, marginTop: 8 }]}>No projects found</Text>
          </View>
        )}
      </View>
    );
  }

  // ── REPORTS ──────────────────────────────────────────────────────────────────

  function renderReports() {
    const pill = selectedPill || 'Financial';
    if (role !== 'Admin') return (
      <View style={{ paddingHorizontal: 16, alignItems: 'center', paddingVertical: 60 }}>
        <IconSymbol name="lock.fill" size={32} color={C.muted as string} />
        <Text style={[s.bodySmall, { color: C.muted as string, marginTop: 8 }]}>Reports are admin-only</Text>
      </View>
    );

    if (pill === 'Financial') {
      const totalRevenue  = REVENUE_TREND.slice(9).reduce((s, r) => s + r.revenue, 0);
      const totalExpenses = REVENUE_TREND.slice(9).reduce((s, r) => s + r.expenses, 0);
      return (
        <View style={{ paddingHorizontal: 16, gap: 16, paddingBottom: 32 }}>
          <GlassView tier={1} style={s.card}>
            <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Revenue Chart</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 80 }}>
              {REVENUE_TREND.map((r, i) => {
                const revH = (r.revenue / maxRevenue) * 80;
                const isLast = i === REVENUE_TREND.length - 1;
                return (
                  <View key={r.month} style={{ flex: 1, alignItems: 'center', gap: 2 }}>
                    <View style={{ width: '100%', height: revH, borderRadius: 3, backgroundColor: isLast ? C.accent : C.surfacePressed as string }} />
                    <Text style={[s.chartLabel, { color: C.muted as string }]}>{r.month.slice(0,1)}</Text>
                  </View>
                );
              })}
            </View>
          </GlassView>
          <GlassView tier={1} style={s.card}>
            <Text style={[s.sectionTitle, { color: C.label, marginBottom: 10 }]}>Breakdown (Q1 2026)</Text>
            {[
              { label: 'Total Revenue',  value: formatCurrency(totalRevenue),  color: C.green },
              { label: 'Total Expenses', value: formatCurrency(totalExpenses), color: C.red },
              { label: 'Net Profit',     value: formatCurrency(totalRevenue - totalExpenses), color: C.accent },
              { label: 'Profit Margin',  value: `${Math.round(((totalRevenue - totalExpenses) / totalRevenue) * 100)}%`, color: '#1D9BF0' },
            ].map((item, i) => (
              <View key={item.label} style={[s.row, { paddingVertical: 10 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string }]}>
                <Text style={[s.bodyMed, { color: C.label, flex: 1 }]}>{item.label}</Text>
                <Text style={[s.bodyMed, { color: item.color }]}>{item.value}</Text>
              </View>
            ))}
          </GlassView>
          <GlassView tier={1} style={s.card}>
            <Text style={[s.sectionTitle, { color: C.label, marginBottom: 10 }]}>Recent Transactions</Text>
            {RECENT_TRANSACTIONS.map((tx, i) => (
              <View key={tx.id} style={[s.row, { paddingVertical: 10 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.bodyMed, { color: C.label }]} numberOfLines={1}>{tx.description}</Text>
                  <Text style={[s.bodySmall, { color: C.muted as string }]}>{formatDate(tx.date)} · {tx.category}</Text>
                </View>
                <Text style={[s.bodyMed, { color: tx.type === 'income' ? C.green : C.red }]}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount), true)}
                </Text>
              </View>
            ))}
          </GlassView>
        </View>
      );
    }

    if (pill === 'Sales') {
      const stageCounts: Record<string, number> = { New: 2, Qualified: 3, Proposal: 3, Negotiation: 3, Won: 2, Lost: 2 };
      const stageColors: Record<string, string> = { New: 'rgba(45,30,18,0.30)', Qualified: '#1D9BF0', Proposal: '#3B82F6', Negotiation: '#8B6340', Won: '#5A8A6E', Lost: '#B85C5C' };
      return (
        <View style={{ paddingHorizontal: 16, gap: 16, paddingBottom: 32 }}>
          <GlassView tier={1} style={s.card}>
            <Text style={[s.sectionTitle, { color: C.label, marginBottom: 10 }]}>Pipeline</Text>
            {[
              { label: 'Total Value',   value: formatCurrency(413000, true), color: C.accent },
              { label: 'Open Deals',    value: '13',                        color: '#1D9BF0' },
              { label: 'Won This Year', value: '2',                         color: C.green },
              { label: 'Avg Deal Size', value: formatCurrency(31769, true), color: '#8B6340' },
            ].map((item, i) => (
              <View key={item.label} style={[s.row, { paddingVertical: 10 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string }]}>
                <Text style={[s.bodyMed, { color: C.label, flex: 1 }]}>{item.label}</Text>
                <Text style={[s.bodyMed, { color: item.color }]}>{item.value}</Text>
              </View>
            ))}
          </GlassView>
          <GlassView tier={1} style={s.card}>
            <Text style={[s.sectionTitle, { color: C.label, marginBottom: 10 }]}>Stage Breakdown</Text>
            {Object.entries(stageCounts).map(([stage, count], i) => (
              <View key={stage} style={[s.row, { paddingVertical: 8 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string }]}>
                <View style={[s.statusDot, { backgroundColor: stageColors[stage] }]} />
                <Text style={[s.bodyMed, { color: C.label, flex: 1 }]}>{stage}</Text>
                <Text style={[s.bodySmall, { color: C.secondary as string }]}>{count} deals</Text>
              </View>
            ))}
          </GlassView>
        </View>
      );
    }

    const totalEmp    = EMPLOYEES.length;
    const fullTime    = EMPLOYEES.filter(e => e.status !== 'contractor').length;
    const contractors = EMPLOYEES.filter(e => e.status === 'contractor').length;
    const remote      = EMPLOYEES.filter(e => e.status === 'remote').length;
    const onPto       = EMPLOYEES.filter(e => e.status === 'pto').length;
    const totalPayroll = EMPLOYEES.reduce((acc, e) => acc + (e.salary ?? 0), 0);

    const headcountHistory = [
      { month: 'Oct', count: 8 }, { month: 'Nov', count: 9 }, { month: 'Dec', count: 10 },
      { month: 'Jan', count: 10 }, { month: 'Feb', count: 11 }, { month: 'Mar', count: totalEmp },
    ];
    const maxHC = Math.max(...headcountHistory.map(h => h.count));

    const openPositions = [
      { title: 'iOS Engineer',         dept: 'Engineering', applicants: 6 },
      { title: 'Growth Marketer',      dept: 'Growth',      applicants: 4 },
      { title: 'Operations Analyst',   dept: 'Operations',  applicants: 2 },
    ];

    const recentChanges = [
      { icon: 'person.badge.plus',      color: C.green,              text: 'Zara Patel joined Engineering', time: '2 days ago' },
      { icon: 'arrow.up.circle.fill',   color: '#1D9BF0',            text: 'Marcus Webb promoted to Head of Product', time: 'last week' },
      { icon: 'person.fill.xmark',      color: C.accent,             text: 'Brianna Fox on PTO until Friday', time: 'this week' },
      { icon: 'person.badge.plus',      color: C.green,              text: 'Miles Grant joined Growth', time: '3 months ago' },
    ];

    const teamActivity = [
      { label: 'Hours logged this week', value: '347 hrs',  icon: 'clock.fill',          color: '#1D9BF0' },
      { label: 'Active projects',        value: `${PROJECTS.filter(p => p.status === 'active').length}`, icon: 'checkmark.circle.fill', color: C.accent },
      { label: 'Meetings this week',     value: '12',       icon: 'calendar.badge.clock', color: '#8B6340' },
      { label: 'Open tasks',             value: '18',       icon: 'square.and.pencil',    color: C.green },
    ];

    const milestones = [
      { name: 'Aisha Brooks',    event: '3-year anniversary', date: 'Mar 20' },
      { name: 'Kofi Mensah',     event: '3-year anniversary', date: 'Feb 1' },
      { name: 'Jordan Lee',      event: '6-month milestone',  date: 'Nov 1' },
    ];

    const deptCompensation = DEPARTMENTS.map(d => {
      const members = EMPLOYEES.filter(e => e.department === d.id && e.salary);
      const total   = members.reduce((a, e) => a + (e.salary ?? 0), 0);
      const avg     = members.length ? Math.round(total / members.length) : 0;
      return { ...d, total, avg };
    });

    return (
      <View style={{ paddingHorizontal: 16, gap: 16, paddingBottom: 32 }}>

        {/* ── Headcount Card ── */}
        <GlassView tier={1} style={s.card}>
          <View style={[s.row, { marginBottom: 12 }]}>
            <View style={{ flex: 1 }}>
              <Text style={[s.sectionTitle, { color: C.label }]}>Headcount</Text>
              <Text style={[s.bodySmall, { color: C.green, marginTop: 2 }]}>+2 this quarter</Text>
            </View>
            <Text style={{ fontSize: 40, fontWeight: '700', color: C.accent, lineHeight: 44 }}>{totalEmp}</Text>
          </View>
          {[
            { label: 'Full-Time',   value: fullTime,    color: C.accent },
            { label: 'Contractors', value: contractors, color: '#8B6340' },
            { label: 'Remote',      value: remote,      color: '#1D9BF0' },
            { label: 'On PTO',      value: onPto,       color: C.red },
          ].map((item, i) => (
            <View key={item.label} style={[s.row, { paddingVertical: 9 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string }]}>
              <Text style={[s.bodyMed, { color: C.label, flex: 1 }]}>{item.label}</Text>
              <View style={{ width: 100, height: 6, backgroundColor: C.surfacePressed as string, borderRadius: 3, marginRight: 10 }}>
                <View style={{ width: `${(item.value / totalEmp) * 100}%` as any, height: 6, borderRadius: 3, backgroundColor: item.color }} />
              </View>
              <Text style={[s.bodyMed, { color: item.color, width: 22, textAlign: 'right' }]}>{item.value}</Text>
            </View>
          ))}
        </GlassView>

        {/* ── Headcount Over Time ── */}
        <GlassView tier={1} style={s.card}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Headcount Over Time</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 64 }}>
            {headcountHistory.map((h, i) => {
              const barH = (h.count / maxHC) * 64;
              const isLast = i === headcountHistory.length - 1;
              return (
                <View key={h.month} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                  <View style={{ width: '100%', height: barH, borderRadius: 4, backgroundColor: isLast ? C.accent : 'rgba(29,155,240,0.25)' }} />
                  <Text style={[s.chartLabel, { color: C.muted as string }]}>{h.month}</Text>
                </View>
              );
            })}
          </View>
          <View style={[s.row, { marginTop: 10, justifyContent: 'space-between' }]}>
            <Text style={[s.bodySmall, { color: C.secondary as string }]}>Retention rate: 94%</Text>
            <Text style={[s.bodySmall, { color: C.muted as string }]}>Avg tenure: 1.8 yrs</Text>
          </View>
        </GlassView>

        {/* ── By Department (expandable) ── */}
        <GlassView tier={1} style={s.card}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 10 }]}>By Department</Text>
          {DEPARTMENTS.map((dept, i) => {
            const members   = EMPLOYEES.filter(e => e.department === dept.id);
            const isExpanded = expandedDeptId === dept.id;
            return (
              <View key={dept.id}>
                <Pressable
                  onPress={() => { Haptics.selectionAsync(); setExpandedDeptId(isExpanded ? null : dept.id); }}
                  style={[s.row, { paddingVertical: 10 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string }]}
                >
                  <View style={[s.statusDot, { backgroundColor: dept.color, width: 10, height: 10, borderRadius: 5 }]} />
                  <Text style={[s.bodyMed, { color: C.label, flex: 1 }]}>{dept.name}</Text>
                  <Text style={[s.bodySmall, { color: C.secondary as string, marginRight: 8 }]}>{members.length}</Text>
                  <View style={{ width: 90, height: 8, backgroundColor: C.surfacePressed as string, borderRadius: 4, marginRight: 8 }}>
                    <View style={{ width: `${(members.length / totalEmp) * 100}%` as any, height: 8, borderRadius: 4, backgroundColor: dept.color }} />
                  </View>
                  <IconSymbol name={isExpanded ? 'chevron.up' : 'chevron.down'} size={12} color={C.muted as string} />
                </Pressable>
                {isExpanded && (
                  <View style={{ paddingLeft: 18, paddingBottom: 8, gap: 8 }}>
                    {members.map(emp => (
                      <View key={emp.id} style={[s.row, { gap: 8 }]}>
                        <View style={[s.avatar, { backgroundColor: `hsl(${emp.hue},50%,55%)`, width: 28, height: 28, borderRadius: 14 }]}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>{emp.initials}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[s.bodyMed, { color: C.label }]}>{emp.name}</Text>
                          <Text style={[s.bodySmall, { color: C.muted as string }]}>{emp.title}</Text>
                        </View>
                        <View style={[s.statusDot, {
                          backgroundColor: emp.status === 'pto' ? C.red : emp.status === 'remote' ? '#1D9BF0' : emp.status === 'contractor' ? '#8B6340' : C.green,
                        }]} />
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </GlassView>

        {/* ── Team Activity ── */}
        <GlassView tier={1} style={s.card}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 10 }]}>Team Activity</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {teamActivity.map(a => (
              <View key={a.label} style={[s.metricCard, { flex: 1, minWidth: '44%', gap: 4, alignItems: 'flex-start' }]}>
                <IconSymbol name={a.icon as any} size={16} color={a.color} />
                <Text style={[s.metricCardNum, { color: C.label, fontSize: 18 }]}>{a.value}</Text>
                <Text style={[s.metricCardLabel, { color: C.secondary as string }]}>{a.label}</Text>
              </View>
            ))}
          </View>
        </GlassView>

        {/* ── Hiring Pipeline ── */}
        <GlassView tier={1} style={s.card}>
          <View style={[s.row, { marginBottom: 10 }]}>
            <Text style={[s.sectionTitle, { color: C.label, flex: 1 }]}>Hiring Pipeline</Text>
            <Text style={[s.bodySmall, { color: C.muted as string }]}>12 applicants this month</Text>
          </View>
          {openPositions.map((pos, i) => (
            <View key={pos.title} style={[s.row, { paddingVertical: 10 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string }]}>
              <View style={{ flex: 1 }}>
                <Text style={[s.bodyMed, { color: C.label }]}>{pos.title}</Text>
                <Text style={[s.bodySmall, { color: C.muted as string }]}>{pos.dept}</Text>
              </View>
              <View style={[s.statusBadge, { backgroundColor: 'rgba(29,155,240,0.12)', borderColor: '#1D9BF0' }]}>
                <Text style={[s.statusBadgeText, { color: '#1D9BF0' }]}>{pos.applicants} applicants</Text>
              </View>
            </View>
          ))}
          <View style={[s.row, { marginTop: 10, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string }]}>
            <Text style={[s.bodySmall, { color: C.accent, fontWeight: '600' }]}>3 open positions</Text>
            <View style={{ flex: 1 }} />
            <Text style={[s.bodySmall, { color: C.muted as string }]}>Avg time-to-hire: 18 days</Text>
          </View>
        </GlassView>

        {/* ── Recent Changes ── */}
        <GlassView tier={1} style={s.card}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 10 }]}>Recent Changes</Text>
          {recentChanges.map((item, i) => (
            <View key={i} style={[s.row, { paddingVertical: 10, gap: 10 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string }]}>
              <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: `${item.color}18`, alignItems: 'center', justifyContent: 'center' }}>
                <IconSymbol name={item.icon as any} size={15} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.bodyMed, { color: C.label }]}>{item.text}</Text>
                <Text style={[s.bodySmall, { color: C.muted as string }]}>{item.time}</Text>
              </View>
            </View>
          ))}
        </GlassView>

        {/* ── Anniversaries & Milestones ── */}
        <GlassView tier={1} style={s.card}>
          <View style={[s.row, { marginBottom: 10 }]}>
            <Text style={[s.sectionTitle, { color: C.label, flex: 1 }]}>Anniversaries & Milestones</Text>
            <IconSymbol name="gift.fill" size={16} color={C.accent} />
          </View>
          {milestones.map((m, i) => (
            <View key={m.name} style={[s.row, { paddingVertical: 10, gap: 10 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string }]}>
              <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: `${C.accent}18`, alignItems: 'center', justifyContent: 'center' }}>
                <IconSymbol name="star.fill" size={14} color={C.accent} />
              </View>
              <Text style={[s.bodyMed, { color: C.label, flex: 1 }]}>{m.name}</Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[s.bodySmall, { color: C.accent, fontWeight: '600' }]}>{m.event}</Text>
                <Text style={[s.bodySmall, { color: C.muted as string }]}>{m.date}</Text>
              </View>
            </View>
          ))}
        </GlassView>

        {/* ── Compensation Summary (admin only) ── */}
        <GlassView tier={1} style={[s.card, { backgroundColor: '#1D3D5C' }]}>
          <Text style={[s.sectionTitle, { color: '#fff', marginBottom: 4 }]}>Compensation Summary</Text>
          <Text style={[s.bodySmall, { color: 'rgba(255,255,255,0.6)', marginBottom: 12 }]}>Total payroll: {formatCurrency(totalPayroll)}/yr · 13 employees</Text>
          {deptCompensation.filter(d => d.avg > 0).map((d, i) => (
            <View key={d.id} style={[s.row, { paddingVertical: 8 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.1)' }]}>
              <View style={[s.statusDot, { backgroundColor: d.color, width: 8, height: 8, borderRadius: 4 }]} />
              <Text style={[s.bodyMed, { color: 'rgba(255,255,255,0.85)', flex: 1 }]}>{d.name}</Text>
              <Text style={[s.bodySmall, { color: 'rgba(255,255,255,0.5)', marginRight: 10 }]}>avg {formatCurrency(d.avg, true)}</Text>
              <View style={{ width: 60, height: 5, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 3 }}>
                <View style={{ width: `${(d.spent / d.budget) * 100}%` as any, height: 5, borderRadius: 3, backgroundColor: d.spent > d.budget * 0.9 ? C.red : C.green }} />
              </View>
            </View>
          ))}
          <View style={[s.row, { marginTop: 10, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.1)' }]}>
            <Text style={[s.bodySmall, { color: 'rgba(255,255,255,0.5)' }]}>Budget utilization</Text>
            <View style={{ flex: 1 }} />
            <Text style={[s.bodySmall, { color: '#5A8A6E' }]}>
              {formatCurrency(DEPARTMENTS.reduce((a, d) => a + d.spent, 0), true)} / {formatCurrency(DEPARTMENTS.reduce((a, d) => a + d.budget, 0), true)}
            </Text>
          </View>
        </GlassView>

        {/* ── Quick Actions ── */}
        <GlassView tier={1} style={s.card}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Quick Actions</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {[
              { label: 'Post a Job',       icon: 'person.badge.plus',         color: '#1D9BF0' },
              { label: 'Run Payroll',      icon: 'dollarsign.circle.fill',    color: C.green },
              { label: 'Schedule Review',  icon: 'calendar.badge.clock',      color: C.accent },
              { label: 'Export Report',    icon: 'square.and.arrow.up',       color: '#8B6340' },
            ].map(action => (
              <Pressable key={action.label}
                style={({ pressed }) => [{ flex: 1, minWidth: '44%', flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: C.inputBorder as string, backgroundColor: pressed ? C.surfacePressed as string : 'transparent' }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name={action.icon as any} size={16} color={action.color} />
                <Text style={[s.bodySmall, { color: C.label, fontWeight: '600' }]}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </GlassView>

      </View>
    );
  }

  // ── RENDER ───────────────────────────────────────────────────────────────────

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <View style={[s.topBarOuter, { backgroundColor: C.bg, borderBottomColor: C.separator as string, paddingTop: insets.top }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={s.iconBtn} hitSlop={8}>
            <IconSymbol name="line.3.horizontal" size={20} color={C.label} />
          </Pressable>
          <Pressable onPress={() => { Haptics.selectionAsync(); setDropdownOpen(v => !v); }}
            style={[s.dropdownPill, { backgroundColor: C.surface, borderColor: C.separator as string }]}>
            <Text style={[s.dropdownPillText, { color: C.label }]}>{activeTab}</Text>
            <IconSymbol name={dropdownOpen ? 'chevron.up' : 'chevron.down'} size={12} color={C.secondary as string} style={{ marginLeft: 4 }} />
          </Pressable>
          <View style={[s.row, { gap: 8 }]}>
            <Pressable onPress={cycleRole} style={[s.rolePill, { backgroundColor: C.surface, borderColor: C.separator as string }]}>
              <Text style={[s.rolePillText, { color: C.accent }]}>{role}</Text>
            </Pressable>
            {pills.length > 0 && (
              <Pressable onPress={togglePills} hitSlop={8} style={s.iconBtn}>
                <IconSymbol name={pillsVisible ? 'line.3.horizontal.decrease.circle.fill' : 'line.3.horizontal.decrease.circle'} size={20} color={pillsVisible ? C.accent : C.label} />
              </Pressable>
            )}
          </View>
        </View>
        {pills.length > 0 && (
          <Animated.View style={[s.pillsRow, {
            height: pillsAnim.interpolate({ inputRange: [0, 1], outputRange: [0, PILLS_H] }),
            opacity: pillsAnim, overflow: 'hidden', borderBottomColor: C.separator as string,
          }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ alignItems: 'center', gap: 8, paddingHorizontal: 16 }}>
              {pills.map(pill => {
                const active = selectedPill === pill;
                return (
                  <Pressable key={pill} onPress={() => { Haptics.selectionAsync(); setSelectedPill(pill); }}
                    style={[s.pill, { borderColor: active ? C.accent : C.inputBorder as string, backgroundColor: active ? C.accent : 'transparent' }]}>
                    <Text style={[s.pillText, { color: active ? '#fff' : C.secondary as string }]}>{pill}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        )}
      </View>

      {dropdownOpen && (
        <>
          <Pressable style={[StyleSheet.absoluteFill, { zIndex: 150 }]} onPress={() => setDropdownOpen(false)} />
          <View style={[s.dropdown, { top: topBarH, backgroundColor: C.surface, borderColor: C.separator as string }]}>
            {(['Overview', 'Projects', 'Reports'] as BizHubTab[]).map(tab => (
              <Pressable key={tab} onPress={() => changeTab(tab)}
                style={({ pressed }) => [s.dropdownItem, pressed && { backgroundColor: C.surfacePressed as string }, activeTab === tab && { backgroundColor: C.surfacePressed as string }]}>
                <Text style={[s.dropdownItemText, { color: activeTab === tab ? C.accent : C.label }]}>{tab}</Text>
                {activeTab === tab && <IconSymbol name="checkmark" size={14} color={C.accent} />}
              </Pressable>
            ))}
          </View>
        </>
      )}

      <ScrollView contentContainerStyle={{ paddingTop: contentPaddingTop }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {activeTab === 'Overview' && renderOverview()}
        {activeTab === 'Projects' && renderProjects()}
        {activeTab === 'Reports'  && renderReports()}
      </ScrollView>

      {activeTab === 'Projects' && role === 'Admin' && (
        <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          style={[s.fab, { backgroundColor: C.accent, bottom: insets.bottom + 88 }]}>
          <IconSymbol name="plus" size={22} color="#fff" />
        </Pressable>
      )}
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar: { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  dropdownPill: { flex: 1, marginHorizontal: 10, height: 34, borderRadius: 17, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  dropdownPillText: { fontSize: 14, fontWeight: '700' },
  rolePill: { paddingHorizontal: 12, height: 28, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  rolePillText: { fontSize: 12, fontWeight: '700' },
  pillsRow: { borderBottomWidth: StyleSheet.hairlineWidth },
  pill: { height: 30, paddingHorizontal: 14, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pillText: { fontSize: 13, fontWeight: '600' },
  dropdown: { position: 'absolute', left: 16, right: 16, zIndex: 200, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  dropdownItemText: { flex: 1, fontSize: 15, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center' },
  card: { padding: 16, borderRadius: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  subHeader: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  bodyMed: { fontSize: 14, fontWeight: '600' },
  bodySmall: { fontSize: 13 },
  linkText: { fontSize: 13, fontWeight: '600' },
  metricCard: { width: 110, padding: 12, borderRadius: 14, alignItems: 'center', gap: 2 },
  metricCardNum: { fontSize: 16, fontWeight: '800' },
  metricCardLabel: { fontSize: 11, fontWeight: '500' },
  metricChip: { alignItems: 'center', borderRadius: 10, paddingVertical: 8 },
  metricChipNum: { fontSize: 16, fontWeight: '800' },
  metricChipLabel: { fontSize: 10, fontWeight: '500', marginTop: 2 },
  progressBarBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: 6, borderRadius: 3 },
  projectRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth },
  avatar: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  avatarText: { fontSize: 9, fontWeight: '700', color: '#fff' },
  avatarSm: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  avatarSmText: { fontSize: 7, fontWeight: '700', color: '#fff' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, marginLeft: 8 },
  statusBadgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  kanbanCol: { width: 160, padding: 10, borderRadius: 12, gap: 6 },
  taskCard: { padding: 10, borderRadius: 10 },
  chartLabel: { fontSize: 9, fontWeight: '500' },
  quickActionBtn: { padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  fab: { position: 'absolute', right: 20, width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
});
