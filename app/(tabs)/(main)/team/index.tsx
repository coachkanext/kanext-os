/**
 * Business Team — Directory / Departments / Org Chart
 * KaNeXT Operations LLC
 * RBAC demo: CEO sees org chart + hiring pipeline + HR; Employee sees their profile + directory + PTO.
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { GlassView } from '@/components/ui/glass-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { KMenuButton } from '@/components/ui/k-menu-button';
import {
  EMPLOYEES, DEPARTMENTS, PROJECTS,
  getDeptEmployees, getEmployeeById,
  type Employee,
} from '@/data/mock-business-ops';

const TOP_BAR_H = 52;
const PILLS_H   = 48;

const ACCENT_TEAM = '#1A1714';

type TeamTab  = 'Directory' | 'Departments' | 'Org Chart';
type TeamRole = 'CEO' | 'Employee';

function pillsForTab(tab: TeamTab): string[] {
  if (tab === 'Directory') return ['All', 'Active', 'Remote', 'Contractors', 'On Leave'];
  return [];
}

function statusColor(status: string, C: ComponentColors): string {
  switch (status) {
    case 'active':     return C.green;
    case 'remote':     return '#1A1714';
    case 'pto':        return '#1A1714';
    case 'contractor': return C.muted as string;
    default:           return C.muted as string;
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case 'active':     return 'Active';
    case 'remote':     return 'Remote';
    case 'pto':        return 'On Leave';
    case 'contractor': return 'Contractor';
    default:           return status;
  }
}

export default function TeamScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);
  const topBarH = insets.top + TOP_BAR_H;

  const [activeTab,    setActiveTab]    = useState<TeamTab>('Directory');
  const [role,         setRole]         = useState<TeamRole>('CEO');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pillsVisible, setPillsVisible] = useState(false);
  const [selectedPill, setSelectedPill] = useState('All');
  const pillsAnim = useRef(new Animated.Value(0)).current;

  const [searchQuery,        setSearchQuery]        = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [expandedDeptId,     setExpandedDeptId]     = useState<string | null>(null);
  const [selectedOrgNodeId,  setSelectedOrgNodeId]  = useState<string | null>(null);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const pills = useMemo(() => pillsForTab(activeTab), [activeTab]);

  function togglePills() {
    Haptics.selectionAsync();
    const next = !pillsVisible;
    setPillsVisible(next);
    Animated.timing(pillsAnim, { toValue: next ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }

  function changeTab(tab: TeamTab) {
    Haptics.selectionAsync();
    setDropdownOpen(false);
    setActiveTab(tab);
    setSelectedPill('All');
    setSelectedEmployeeId(null);
    setExpandedDeptId(null);
    setSelectedOrgNodeId(null);
    if (!pillsForTab(tab).length) {
      setPillsVisible(false);
      pillsAnim.setValue(0);
    }
  }

  const contentPaddingTop = topBarH + (pillsVisible ? PILLS_H : 0) + 8;

  const filteredEmployees = useMemo(() => {
    let list = EMPLOYEES;
    if (selectedPill === 'Active')      list = list.filter(e => e.status === 'active');
    if (selectedPill === 'Remote')      list = list.filter(e => e.status === 'remote');
    if (selectedPill === 'Contractors') list = list.filter(e => e.status === 'contractor');
    if (selectedPill === 'On Leave')    list = list.filter(e => e.status === 'pto');
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(q) || e.title.toLowerCase().includes(q));
    }
    return list;
  }, [selectedPill, searchQuery]);

  // ── EMPLOYEE PORTAL ──────────────────────────────────────────────────────────

  function renderEmployeePortal() {
    const me = EMPLOYEES.find(e => e.id === 'e05') ?? EMPLOYEES[0];
    const myDept = DEPARTMENTS.find(d => d.id === me.department);
    const myManager = me.manager ? EMPLOYEES.find(e => e.id === me.manager) : null;
    const teammates = EMPLOYEES.filter(e => e.department === me.department && e.id !== me.id);
    const isCEORole = role === 'CEO';

    const announcements = [
      { title: 'Q1 All-Hands Recording Available', detail: 'Watch the full Q1 all-hands recording in the shared drive.', time: '2d ago' },
      { title: 'Spring Social — Apr 18', detail: 'Team lunch and activities at Riverside Park. RSVP by Apr 10.', time: '3d ago' },
      { title: 'Benefits Open Enrollment', detail: 'Open enrollment closes Apr 30. Update your selections now.', time: '5d ago' },
    ];

    const ptoBalance = me.ptoBalance ?? 12;
    const upcomingPTO = [
      { label: 'Spring Break', dates: 'Mar 22–26', status: 'Approved' },
    ];

    return (
      <View style={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 32, gap: 16 }}>
        {/* My Profile Card */}
        <GlassView tier={1} style={[s.card, { flexDirection: 'row', gap: 14, alignItems: 'flex-start' }]}>
          <View style={[s.avatarLg, { backgroundColor: `hsl(${me.hue},45%,28%)` }]}>
            <Text style={s.avatarLgText}>{me.initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.sectionTitle, { color: C.label }]}>{me.name}</Text>
            <Text style={[s.bodySmall, { color: C.secondary as string }]}>{me.title}</Text>
            <Text style={[s.bodySmall, { color: C.muted as string }]}>{myDept?.name ?? '—'}</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
              <View style={{ backgroundColor: `${ACCENT_TEAM}20`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: ACCENT_TEAM }}>
                  Since {new Date(me.startDate).getFullYear()}
                </Text>
              </View>
              {myManager && (
                <View style={{ backgroundColor: C.surfacePressed as string, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                  <Text style={{ fontSize: 11, color: C.secondary as string }}>Reports to {myManager.name.split(' ')[0]}</Text>
                </View>
              )}
            </View>
          </View>
        </GlassView>

        {/* My PTO */}
        <GlassView tier={1} style={s.card}>
          <View style={[s.row, { marginBottom: 12 }]}>
            <Text style={[s.sectionTitle, { color: C.label, flex: 1 }]}>My PTO</Text>
            <View style={{ backgroundColor: `${C.green}20`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.green }}>{ptoBalance} days left</Text>
            </View>
          </View>
          {upcomingPTO.map((p, i) => (
            <View key={p.label} style={[s.row, { paddingVertical: 9 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string }]}>
              <View style={{ flex: 1 }}>
                <Text style={[s.bodyMed, { color: C.label }]}>{p.label}</Text>
                <Text style={[s.bodySmall, { color: C.muted as string }]}>{p.dates}</Text>
              </View>
              <View style={{ backgroundColor: `${C.green}18`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: C.green }}>{p.status}</Text>
              </View>
            </View>
          ))}
          <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            style={{ marginTop: 12, backgroundColor: ACCENT_TEAM, paddingVertical: 10, borderRadius: 10, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>Request PTO</Text>
          </Pressable>
        </GlassView>

        {/* Team Directory */}
        <GlassView tier={1} style={s.card}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 10 }]}>My Team — {myDept?.name}</Text>
          {teammates.slice(0, 5).map((emp, i) => (
            <Pressable key={emp.id}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              style={({ pressed }) => [
                s.row, { paddingVertical: 10, gap: 12 },
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string },
                pressed && { backgroundColor: C.surfacePressed as string },
              ]}>
              <View style={[s.avatar, { backgroundColor: `hsl(${emp.hue},45%,28%)`, width: 36, height: 36, borderRadius: 18 }]}>
                <Text style={[s.avatarText, { fontSize: 12 }]}>{emp.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.bodyMed, { color: C.label }]}>{emp.name}</Text>
                <Text style={[s.bodySmall, { color: C.secondary as string }]}>{emp.title}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 3 }}>
                <View style={[s.statusDot, { backgroundColor: statusColor(emp.status, C), width: 8, height: 8, borderRadius: 4 }]} />
                <Text style={{ fontSize: 10, color: C.muted as string }}>{emp.email.split('@')[0]}</Text>
              </View>
            </Pressable>
          ))}
        </GlassView>

        {/* My Reviews */}
        <GlassView tier={1} style={s.card}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 10 }]}>My Reviews</Text>
          {[
            { label: 'Last Review',       value: 'Sep 2025 · "Exceeds expectations"', color: C.green },
            { label: 'Next Review',       value: 'Jun 2026 (scheduled)',              color: ACCENT_TEAM },
            { label: 'Goal Completion',   value: '4 / 5 goals met',                  color: C.label },
          ].map((item, i) => (
            <View key={item.label} style={[s.row, { paddingVertical: 9 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string }]}>
              <Text style={[s.bodySmall, { color: C.muted as string, width: 120 }]}>{item.label}</Text>
              <Text style={[s.bodyMed, { color: item.color, flex: 1 }]}>{item.value}</Text>
            </View>
          ))}
        </GlassView>

        {/* Company Announcements */}
        <GlassView tier={1} style={s.card}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 10 }]}>Company Announcements</Text>
          {announcements.map((ann, i) => (
            <View key={ann.title} style={[{ paddingVertical: 10 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string }]}>
              <Text style={[s.bodyMed, { color: C.label }]}>{ann.title}</Text>
              <Text style={[s.bodySmall, { color: C.secondary as string, marginTop: 2 }]}>{ann.detail}</Text>
              <Text style={[s.bodySmall, { color: C.muted as string, marginTop: 2 }]}>{ann.time}</Text>
            </View>
          ))}
        </GlassView>
      </View>
    );
  }

  // ── DIRECTORY ────────────────────────────────────────────────────────────────

  function renderEmployeeProfile(emp: Employee) {
    const isAdmin    = role === 'CEO';
    const myProjects = emp.projectIds.map(pid => PROJECTS.find(p => p.id === pid)).filter(Boolean);
    const manager    = emp.manager ? getEmployeeById(emp.manager) : null;
    return (
      <GlassView tier={1} style={[s.card, { marginHorizontal: 16, marginBottom: 12 }]}>
        <Pressable onPress={() => setSelectedEmployeeId(null)} style={[s.row, { marginBottom: 12 }]}>
          <IconSymbol name="chevron.left" size={14} color={C.secondary as string} />
          <Text style={[s.bodySmall, { color: C.secondary as string, marginLeft: 4 }]}>Back</Text>
        </Pressable>
        <View style={[s.row, { gap: 14, marginBottom: 14 }]}>
          <View style={[s.avatarLg, { backgroundColor: `hsl(${emp.hue},45%,28%)` }]}>
            <Text style={s.avatarLgText}>{emp.initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.sectionTitle, { color: C.label }]}>{emp.name}</Text>
            <Text style={[s.bodySmall, { color: C.secondary as string }]}>{emp.title}</Text>
            <Text style={[s.bodySmall, { color: C.muted as string }]}>{DEPARTMENTS.find(d => d.id === emp.department)?.name}</Text>
          </View>
          <View style={[s.statusDot, { backgroundColor: statusColor(emp.status, C), width: 10, height: 10, borderRadius: 5 }]} />
        </View>
        <View style={[s.row, { gap: 8, marginBottom: 14 }]}>
          {[{ icon: 'phone.fill', label: 'Call' }, { icon: 'envelope.fill', label: 'Email' }, { icon: 'message.fill', label: 'Message' }].map(a => (
            <Pressable key={a.label} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              style={[s.actionBtn, { flex: 1, backgroundColor: C.surfacePressed as string }]}>
              <IconSymbol name={a.icon as any} size={16} color={C.accent} />
              <Text style={[s.bodySmall, { color: C.secondary as string, marginTop: 3, fontSize: 11 }]}>{a.label}</Text>
            </Pressable>
          ))}
        </View>
        {[
          { label: 'Email',      value: emp.email },
          { label: 'Phone',      value: emp.phone },
          { label: 'Location',   value: emp.location },
          { label: 'Start Date', value: new Date(emp.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
          { label: 'PTO Balance',value: `${emp.ptoBalance} days` },
          ...(manager ? [{ label: 'Manager', value: manager.name }] : []),
          ...(isAdmin && emp.salary ? [{ label: 'Salary', value: `$${emp.salary.toLocaleString()} / yr` }] : []),
        ].map((item, i) => (
          <View key={item.label} style={[s.row, { paddingVertical: 9 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string }]}>
            <Text style={[s.bodySmall, { color: C.muted as string, width: 90 }]}>{item.label}</Text>
            <Text style={[s.bodyMed, { color: item.label === 'Salary' ? C.accent : C.label, flex: 1 }]} numberOfLines={1}>{item.value}</Text>
          </View>
        ))}
        {myProjects.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={[s.subHeader, { color: C.secondary as string, marginBottom: 8 }]}>Projects</Text>
            {myProjects.map(p => p && (
              <View key={p.id} style={[s.row, { paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string }]}>
                <Text style={[s.bodyMed, { color: C.label, flex: 1 }]} numberOfLines={1}>{p.name}</Text>
                <Text style={[s.bodySmall, { color: C.secondary as string }]}>{p.progress}%</Text>
              </View>
            ))}
          </View>
        )}
      </GlassView>
    );
  }

  function renderDirectory() {
    if (selectedEmployeeId) {
      const emp = getEmployeeById(selectedEmployeeId);
      if (emp) return (
        <View style={{ paddingTop: contentPaddingTop }}>
          {renderEmployeeProfile(emp)}
        </View>
      );
    }
    return (
      <View style={{ paddingTop: contentPaddingTop }}>
        <View style={[s.searchBar, { backgroundColor: C.surface, borderColor: C.inputBorder as string, marginHorizontal: 16, marginBottom: 12 }]}>
          <IconSymbol name="magnifyingglass" size={16} color={C.muted as string} />
          <TextInput style={[s.searchInput, { color: C.label }]} placeholder="Search people..." placeholderTextColor={C.muted as string} value={searchQuery} onChangeText={setSearchQuery} />
        </View>
        <View style={[s.row, { gap: 8, paddingHorizontal: 16, marginBottom: 12 }]}>
          {[
            { label: 'Total',       value: EMPLOYEES.length,                                  color: C.label },
            { label: 'Depts',       value: DEPARTMENTS.length,                                color: '#1A1714' },
            { label: 'Contractors', value: EMPLOYEES.filter(e => e.status === 'contractor').length, color: C.muted as string },
            { label: 'New',         value: EMPLOYEES.filter(e => e.isNew).length,             color: C.green },
          ].map(m => (
            <GlassView tier={1} key={m.label} style={[s.statChip, { flex: 1 }]}>
              <Text style={[s.statChipNum, { color: m.color }]}>{m.value}</Text>
              <Text style={[s.statChipLabel, { color: C.secondary as string }]}>{m.label}</Text>
            </GlassView>
          ))}
        </View>
        <GlassView tier={1} style={[s.card, { marginHorizontal: 16, marginBottom: 32 }]}>
          {filteredEmployees.map((emp, i) => (
            <Pressable key={emp.id}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedEmployeeId(emp.id); }}
              style={({ pressed }) => [
                s.row, { paddingVertical: 12, gap: 12 },
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string },
                pressed && { backgroundColor: C.surfacePressed as string },
              ]}>
              <View style={[s.avatar, { backgroundColor: `hsl(${emp.hue},45%,28%)`, width: 38, height: 38, borderRadius: 19 }]}>
                <Text style={[s.avatarText, { fontSize: 13 }]}>{emp.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={[s.row, { gap: 6 }]}>
                  <Text style={[s.bodyMed, { color: C.label }]}>{emp.name}</Text>
                  {emp.isNew && <View style={{ backgroundColor: `${C.accent}20`, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5 }}><Text style={{ fontSize: 9, fontWeight: '700', color: C.accent }}>NEW</Text></View>}
                </View>
                <Text style={[s.bodySmall, { color: C.secondary as string }]} numberOfLines={1}>{emp.title}</Text>
                <Text style={{ fontSize: 11, color: C.muted as string }}>{DEPARTMENTS.find(d => d.id === emp.department)?.name}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <View style={[s.row, { gap: 4 }]}>
                  <View style={[s.statusDot, { backgroundColor: statusColor(emp.status, C) }]} />
                  <Text style={{ fontSize: 11, color: C.secondary as string }}>{statusLabel(emp.status)}</Text>
                </View>
                <IconSymbol name="chevron.right" size={12} color={C.muted as string} />
              </View>
            </Pressable>
          ))}
        </GlassView>
      </View>
    );
  }

  // ── DEPARTMENTS ──────────────────────────────────────────────────────────────

  function renderDepartments() {
    return (
      <View style={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, gap: 10, paddingBottom: 32 }}>
        {DEPARTMENTS.map(dept => {
          const members    = getDeptEmployees(dept.id);
          const head       = getEmployeeById(dept.headId);
          const isExpanded = expandedDeptId === dept.id;
          const budgetPct  = Math.round((dept.spent / dept.budget) * 100);
          return (
            <GlassView tier={1} key={dept.id} style={s.card}>
              <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setExpandedDeptId(isExpanded ? null : dept.id); }}>
                <View style={[s.row, { gap: 12 }]}>
                  <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${dept.color}20`, alignItems: 'center', justifyContent: 'center' }}>
                    <IconSymbol name={dept.icon as any} size={20} color={dept.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.bodyMed, { color: C.label, fontSize: 15 }]}>{dept.name}</Text>
                    <Text style={[s.bodySmall, { color: C.secondary as string }]}>{members.length} members · {head?.name ?? '—'}</Text>
                  </View>
                  <IconSymbol name={isExpanded ? 'chevron.up' : 'chevron.down'} size={14} color={C.muted as string} />
                </View>
                <View style={{ marginTop: 10 }}>
                  <View style={[s.row, { justifyContent: 'space-between', marginBottom: 4 }]}>
                    <Text style={[s.bodySmall, { color: C.muted as string }]}>Budget</Text>
                    <Text style={[s.bodySmall, { color: C.secondary as string }]}>{budgetPct}% used</Text>
                  </View>
                  <View style={[s.progressBarBg, { backgroundColor: C.surfacePressed as string }]}>
                    <View style={[s.progressBarFill, { width: `${budgetPct}%` as any, backgroundColor: budgetPct > 85 ? C.red : dept.color }]} />
                  </View>
                </View>
              </Pressable>
              {isExpanded && (
                <View style={{ marginTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string, paddingTop: 12, gap: 2 }}>
                  {members.map((emp, i) => (
                    <Pressable key={emp.id}
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedEmployeeId(emp.id); setActiveTab('Directory'); }}
                      style={({ pressed }) => [
                        s.row, { paddingVertical: 8, gap: 10 },
                        i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string },
                        pressed && { backgroundColor: C.surfacePressed as string },
                      ]}>
                      <View style={[s.avatarSm, { backgroundColor: `hsl(${emp.hue},45%,28%)`, width: 28, height: 28, borderRadius: 14 }]}>
                        <Text style={s.avatarSmText}>{emp.initials}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.bodyMed, { color: C.label }]}>{emp.name}</Text>
                        <Text style={{ fontSize: 12, color: C.secondary as string }}>{emp.title}</Text>
                      </View>
                      <View style={[s.statusDot, { backgroundColor: statusColor(emp.status, C) }]} />
                    </Pressable>
                  ))}
                </View>
              )}
            </GlassView>
          );
        })}
        <GlassView tier={1} style={[s.card, { marginTop: 4 }]}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 10 }]}>Cross-Dept Activity</Text>
          {[
            { text: 'Engineering & Product aligned on V2 scope',    time: '1d ago' },
            { text: 'Growth + Ops planning NAIA conf outreach',     time: '2d ago' },
            { text: 'Leadership reviewed Q1 financial projections', time: '3d ago' },
          ].map((a, i) => (
            <View key={i} style={[s.row, { paddingVertical: 8 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string }]}>
              <Text style={[s.bodySmall, { color: C.label, flex: 1 }]}>{a.text}</Text>
              <Text style={[s.bodySmall, { color: C.muted as string, marginLeft: 8 }]}>{a.time}</Text>
            </View>
          ))}
        </GlassView>
      </View>
    );
  }

  // ── ORG CHART ────────────────────────────────────────────────────────────────

  /** Compact circle node for level-3 reports */
  function renderReportNode(emp: Employee) {
    const isSelected = selectedOrgNodeId === emp.id;
    return (
      <Pressable
        key={emp.id}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedOrgNodeId(isSelected ? null : emp.id); }}
        style={{ flex: 1, alignItems: 'center', gap: 3 }}
      >
        <View style={{
          width: 32, height: 32, borderRadius: 16,
          backgroundColor: `hsl(${emp.hue},50%,48%)`,
          alignItems: 'center', justifyContent: 'center',
          borderWidth: 2, borderColor: isSelected ? C.accent : C.bg,
        }}>
          <Text style={{ fontSize: 9, fontWeight: '800', color: '#fff' }}>{emp.initials}</Text>
        </View>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: statusColor(emp.status, C) }} />
        <Text style={{ fontSize: 9, color: C.secondary as string, textAlign: 'center' }} numberOfLines={1}>
          {emp.name.split(' ')[0]}
        </Text>
      </Pressable>
    );
  }

  /** Dept-head square card */
  function renderHeadNode(emp: Employee) {
    const isSelected = selectedOrgNodeId === emp.id;
    const dept = DEPARTMENTS.find(d => d.id === emp.department);
    return (
      <Pressable
        key={emp.id}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedOrgNodeId(isSelected ? null : emp.id); }}
        style={{
          width: 68, padding: 8, borderRadius: 14, borderWidth: 1.5,
          alignItems: 'center', gap: 3,
          borderColor: isSelected ? C.accent : (dept?.color ?? C.accent),
          backgroundColor: isSelected ? `${C.accent}15` : C.surface,
        }}
      >
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: `hsl(${emp.hue},45%,32%)`, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 12, fontWeight: '800', color: '#fff' }}>{emp.initials}</Text>
        </View>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: statusColor(emp.status, C) }} />
        <Text style={{ fontSize: 10, fontWeight: '700', color: C.label, textAlign: 'center' }} numberOfLines={1}>{emp.name.split(' ')[0]}</Text>
        <Text style={{ fontSize: 8, color: C.secondary as string, textAlign: 'center' }} numberOfLines={1}>{dept?.name ?? ''}</Text>
      </Pressable>
    );
  }

  function renderOrgChart() {
    const ceo       = EMPLOYEES.find(e => e.id === 'e01')!;
    const HEAD_IDS  = ['e02', 'e03', 'e04', 'e08'];
    const deptHeads = HEAD_IDS.map(id => EMPLOYEES.find(e => e.id === id)!);
    const getReports = (managerId: string) =>
      EMPLOYEES.filter(e => e.manager === managerId && !HEAD_IDS.includes(e.id));

    const totalEmp    = EMPLOYEES.length;
    const openPos     = [
      { title: 'Senior Engineer',  dept: 'Engineering', applicants: 6 },
      { title: 'Growth Lead',      dept: 'Growth',      applicants: 4 },
      { title: 'Designer',         dept: 'Product',     applicants: 2 },
    ];
    const recentAct   = [
      { text: 'Zara Patel joined Engineering',       time: '2 weeks ago' },
      { text: 'Chris Duval contract renewed',         time: 'Mar 15' },
      { text: 'Nadia Russo onboarded as consultant',  time: 'Feb 15' },
      { text: 'Miles Grant joined Growth',            time: '4 months ago' },
    ];

    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: contentPaddingTop, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* ── Tree ── */}
        <View style={{ alignItems: 'center', paddingHorizontal: 12 }}>

          {/* CEO — wide horizontal card */}
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedOrgNodeId(selectedOrgNodeId === ceo.id ? null : ceo.id); }}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 12,
              paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16,
              borderWidth: 1.5, width: '80%', maxWidth: 280,
              borderColor: selectedOrgNodeId === ceo.id ? C.accent : C.separator as string,
              backgroundColor: selectedOrgNodeId === ceo.id ? `${C.accent}10` : C.surface,
            }}
          >
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: `hsl(${ceo.hue},45%,32%)`, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#fff' }}>{ceo.initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{ceo.name}</Text>
              <Text style={{ fontSize: 11, color: C.secondary as string }}>{ceo.title}</Text>
            </View>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: statusColor(ceo.status, C) }} />
          </Pressable>

          {/* CEO → bus vertical */}
          <View style={{ width: 2, height: 16, backgroundColor: C.separator as string }} />

          {/* Horizontal bus (75% for 4 equal columns) */}
          <View style={{ width: '100%', alignItems: 'stretch' }}>
            <View style={{ marginHorizontal: '12.5%', height: 2, backgroundColor: C.separator as string }} />
          </View>

          {/* Dept heads row — 4 equal columns */}
          <View style={{ flexDirection: 'row', width: '100%' }}>
            {deptHeads.map((head) => {
              const reports = getReports(head.id);
              const nR = reports.length;
              return (
                <View key={head.id} style={{ flex: 1, alignItems: 'center' }}>
                  {/* Bus → dept head */}
                  <View style={{ width: 2, height: 16, backgroundColor: C.separator as string }} />
                  {renderHeadNode(head)}

                  {nR > 0 && (
                    <>
                      {/* Dept head → sub-bus */}
                      <View style={{ width: 2, height: 12, backgroundColor: C.separator as string }} />

                      {/* Sub-bus horizontal line */}
                      {nR > 1 && (
                        <View style={{ width: '100%' }}>
                          <View style={{
                            marginHorizontal: `${(1 / (2 * nR)) * 100}%` as any,
                            height: 2, backgroundColor: C.separator as string,
                          }} />
                        </View>
                      )}

                      {/* Reports row */}
                      <View style={{ flexDirection: 'row', width: '100%', marginTop: nR > 1 ? 0 : 0 }}>
                        {reports.map((r) => (
                          <View key={r.id} style={{ flex: 1, alignItems: 'center' }}>
                            <View style={{ width: 2, height: 10, backgroundColor: C.separator as string }} />
                            {renderReportNode(r)}
                          </View>
                        ))}
                      </View>
                    </>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Below-tree content ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 24, gap: 12 }}>

          {/* Quick Stats */}
          <GlassView tier={1} style={s.card}>
            <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Team Overview</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {[
                { label: 'Total',       value: totalEmp,                                                            color: C.accent },
                { label: 'Full-time',   value: EMPLOYEES.filter(e => e.status !== 'contractor').length,             color: C.green },
                { label: 'Contractors', value: EMPLOYEES.filter(e => e.status === 'contractor').length,             color: '#1A1714' },
                { label: 'Remote',      value: EMPLOYEES.filter(e => e.status === 'remote').length,                 color: '#1A1714' },
                { label: 'On PTO',      value: EMPLOYEES.filter(e => e.status === 'pto').length,                    color: C.red },
              ].map(stat => (
                <View key={stat.label} style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 22, fontWeight: '800', color: stat.color, lineHeight: 26 }}>{stat.value}</Text>
                  <Text style={{ fontSize: 10, color: C.secondary as string, marginTop: 2, textAlign: 'center' }}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </GlassView>

          {/* Recent Activity */}
          <GlassView tier={1} style={s.card}>
            <Text style={[s.sectionTitle, { color: C.label, marginBottom: 10 }]}>Recent Activity</Text>
            {recentAct.map((a, i) => (
              <View key={i} style={[{ flexDirection: 'row', paddingVertical: 9 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string }]}>
                <Text style={[s.bodySmall, { color: C.label, flex: 1 }]}>{a.text}</Text>
                <Text style={[s.bodySmall, { color: C.muted as string, marginLeft: 8 }]}>{a.time}</Text>
              </View>
            ))}
          </GlassView>

          {/* Open Positions */}
          <GlassView tier={1} style={s.card}>
            <View style={[s.row, { marginBottom: 10 }]}>
              <Text style={[s.sectionTitle, { color: C.label, flex: 1 }]}>Open Positions</Text>
              <Text style={[s.bodySmall, { color: C.accent, fontWeight: '700' }]}>{openPos.length} open</Text>
            </View>
            {openPos.map((pos, i) => (
              <View key={pos.title} style={[s.row, { paddingVertical: 10 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.bodyMed, { color: C.label }]}>{pos.title}</Text>
                  <Text style={[s.bodySmall, { color: C.muted as string }]}>{pos.dept}</Text>
                </View>
                <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: '#1A1714', backgroundColor: 'rgba(29,155,240,0.08)' }}>
                  <Text style={{ fontSize: 11, color: '#1A1714', fontWeight: '600' }}>{pos.applicants} applicants</Text>
                </View>
              </View>
            ))}
          </GlassView>

        </View>
      </ScrollView>
    );
  }

  // ── RENDER ───────────────────────────────────────────────────────────────────

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <View style={[s.topBarOuter, { backgroundColor: C.bg, borderBottomColor: C.separator as string, paddingTop: insets.top }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={s.iconBtn} hitSlop={8}>
            <KMenuButton />
          </Pressable>
          <Pressable onPress={() => { Haptics.selectionAsync(); setDropdownOpen(v => !v); }}
            style={[s.dropdownPill, { backgroundColor: C.surface, borderColor: C.separator as string }]}>
            <Text style={[s.dropdownPillText, { color: C.label }]}>{activeTab}</Text>
            <IconSymbol name={dropdownOpen ? 'chevron.up' : 'chevron.down'} size={12} color={C.secondary as string} style={{ marginLeft: 4 }} />
          </Pressable>
          <View style={[s.row, { gap: 8 }]}>
            <Pressable onPress={() => { Haptics.selectionAsync(); setRole(r => r === 'CEO' ? 'Employee' : 'CEO'); setActiveTab('Directory'); }}
              style={[s.rolePill, { backgroundColor: role === 'CEO' ? ACCENT_TEAM : C.surfacePressed, borderColor: role === 'CEO' ? ACCENT_TEAM : C.separator as string }]}>
              <Text style={[s.rolePillText, { color: role === 'CEO' ? '#fff' : C.secondary as string }]}>{role}</Text>
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
            {(['Directory', 'Departments', 'Org Chart'] as TeamTab[]).map(tab => (
              <Pressable key={tab} onPress={() => changeTab(tab)}
                style={({ pressed }) => [s.dropdownItem, pressed && { backgroundColor: C.surfacePressed as string }, activeTab === tab && { backgroundColor: C.surfacePressed as string }]}>
                <Text style={[s.dropdownItemText, { color: activeTab === tab ? C.accent : C.label }]}>{tab}</Text>
                {activeTab === tab && <IconSymbol name="checkmark" size={14} color={C.accent} />}
              </Pressable>
            ))}
          </View>
        </>
      )}

      {role === 'Employee' ? (
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {renderEmployeePortal()}
        </ScrollView>
      ) : (
        <>
          {activeTab === 'Directory' && (
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {renderDirectory()}
            </ScrollView>
          )}
          {activeTab === 'Departments' && (
            <ScrollView showsVerticalScrollIndicator={false}>
              {renderDepartments()}
            </ScrollView>
          )}
          {activeTab === 'Org Chart' && renderOrgChart()}
        </>
      )}

      {/* ── Org node profile overlay ── */}
      {activeTab === 'Org Chart' && selectedOrgNodeId && (() => {
        const emp  = EMPLOYEES.find(e => e.id === selectedOrgNodeId);
        if (!emp) return null;
        const dept = DEPARTMENTS.find(d => d.id === emp.department);
        return (
          <>
            <Pressable style={[StyleSheet.absoluteFill, { zIndex: 300 }]} onPress={() => setSelectedOrgNodeId(null)} />
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 301, backgroundColor: C.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: insets.bottom + 20, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, shadowOffset: { width: 0, height: -4 } }}>
              {/* Handle */}
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: C.separator as string, alignSelf: 'center', marginBottom: 16 }} />
              {/* Header */}
              <View style={[s.row, { gap: 14, marginBottom: 16 }]}>
                <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: `hsl(${emp.hue},45%,32%)`, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 17, fontWeight: '800', color: '#fff' }}>{emp.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>{emp.name}</Text>
                  <Text style={{ fontSize: 13, color: C.secondary as string, marginTop: 2 }}>{emp.title}</Text>
                  <View style={[s.row, { gap: 6, marginTop: 4 }]}>
                    {dept && <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: `${dept.color}20` }}><Text style={{ fontSize: 11, color: dept.color, fontWeight: '600' }}>{dept.name}</Text></View>}
                    <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: `${statusColor(emp.status, C)}20` }}><Text style={{ fontSize: 11, color: statusColor(emp.status, C), fontWeight: '600' }}>{statusLabel(emp.status)}</Text></View>
                  </View>
                </View>
              </View>
              {/* Details */}
              {[
                { label: 'Started', value: emp.startDate },
                { label: 'Location', value: emp.location },
                ...(role === 'CEO' && emp.salary ? [{ label: 'Salary', value: `$${emp.salary.toLocaleString()}/yr` }] : []),
              ].map((item, i) => (
                <View key={item.label} style={[s.row, { paddingVertical: 8 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string }]}>
                  <Text style={[s.bodySmall, { color: C.secondary as string, flex: 1 }]}>{item.label}</Text>
                  <Text style={[s.bodySmall, { color: C.label, fontWeight: '600' }]}>{item.value}</Text>
                </View>
              ))}
              {/* Actions */}
              <View style={[s.row, { gap: 10, marginTop: 14 }]}>
                {[
                  { icon: 'phone.fill',   label: 'Call',    color: C.green },
                  { icon: 'envelope.fill', label: 'Email',  color: '#1A1714' },
                  { icon: 'message.fill', label: 'Message', color: C.accent },
                ].map(a => (
                  <Pressable key={a.label} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    style={[s.actionBtn, { flex: 1, gap: 4, backgroundColor: C.surfacePressed as string }]}>
                    <IconSymbol name={a.icon as any} size={16} color={a.color} />
                    <Text style={{ fontSize: 11, color: C.secondary as string, fontWeight: '600' }}>{a.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        );
      })()}

      {activeTab === 'Directory' && role === 'CEO' && !selectedEmployeeId && (
        <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          style={[s.fab, { backgroundColor: C.accent, bottom: insets.bottom + 88 }]}>
          <IconSymbol name="person.fill.badge.plus" size={20} color="#fff" />
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
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, height: 40 },
  searchInput: { flex: 1, fontSize: 14 },
  statChip: { alignItems: 'center', padding: 10, borderRadius: 12 },
  statChipNum: { fontSize: 18, fontWeight: '800' },
  statChipLabel: { fontSize: 10, fontWeight: '500', marginTop: 2 },
  avatar: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  avatarText: { fontSize: 9, fontWeight: '700', color: '#fff' },
  avatarSm: { alignItems: 'center', justifyContent: 'center' },
  avatarSmText: { fontSize: 8, fontWeight: '700', color: '#fff' },
  avatarLg: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarLgText: { fontSize: 18, fontWeight: '800', color: '#fff' },
  actionBtn: { padding: 10, borderRadius: 10, alignItems: 'center' },
  progressBarBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: 6, borderRadius: 3 },
  orgNode: { width: 76, padding: 8, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', gap: 3 },
  orgAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  orgAvatarText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  orgPopup: { position: 'absolute', top: 92, left: -42, width: 168, padding: 12, borderRadius: 12, borderWidth: 1, zIndex: 50 },
  fab: { position: 'absolute', right: 20, width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
});
