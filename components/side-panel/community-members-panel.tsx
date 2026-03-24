/**
 * Community Members Side Panel — admin view.
 * Quick nav, new member queue, at-risk alerts, visitor follow-up, actions, settings.
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { COMMUNITY_MEMBERS, getAtRiskMembers, getVisitorMembers, getNewMembers } from '@/data/mock-community-members';

const NAV_ITEMS = [
  { icon: 'person.3',         label: 'Directory',  tab: 'Directory'  },
  { icon: 'shield.lefthalf.filled', label: 'Roles', tab: 'Roles'    },
  { icon: 'chart.bar',        label: 'Attendance', tab: 'Attendance' },
] as const;

const ACTION_ITEMS = [
  { icon: 'message',          label: 'Bulk Message'    },
  { icon: 'square.and.arrow.down', label: 'Import Members' },
  { icon: 'square.and.arrow.up',   label: 'Export'        },
] as const;

const SETTINGS_ITEMS = [
  { icon: 'shield',           label: 'Role Definitions'      },
  { icon: 'calendar.badge.checkmark', label: 'Attendance Policies' },
  { icon: 'lock.shield',      label: 'Privacy Settings'      },
] as const;

function formatShortDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-').map(Number);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[m - 1]} ${d}`;
}

export function CommunityMembersPanel() {
  const C      = useColors();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const totalMembers = COMMUNITY_MEMBERS.filter(m => m.role !== 'visitor').length;
  const activeCount  = COMMUNITY_MEMBERS.filter(m => m.status === 'active').length;
  const atRisk       = getAtRiskMembers();
  const visitors     = getVisitorMembers();
  const newMembers   = getNewMembers();

  const navigate = (tab: string) => {
    closeSidePanel();
    setTimeout(() => router.push({ pathname: '/(tabs)/(main)/members' as any, params: { tab } }), 80);
  };

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={[s.avatar, { backgroundColor: 'hsl(220,55%,30%)' }]}>
          <Text style={s.avatarText}>IC</Text>
        </View>
        <View style={s.headerInfo}>
          <Text style={[s.headerName, { color: C.label }]}>ICCLA Members</Text>
          <Text style={[s.headerSub, { color: C.secondary }]}>Community Directory</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={[s.statsRow, { backgroundColor: C.surfacePressed, borderRadius: 12 }]}>
        <View style={s.statItem}>
          <Text style={[s.statNum, { color: C.label }]}>{totalMembers}</Text>
          <Text style={[s.statLabel, { color: C.secondary }]}>Total</Text>
        </View>
        <View style={[s.statDivider, { backgroundColor: C.separator }]} />
        <View style={s.statItem}>
          <Text style={[s.statNum, { color: '#5A8A6E' }]}>{activeCount}</Text>
          <Text style={[s.statLabel, { color: C.secondary }]}>Active</Text>
        </View>
        <View style={[s.statDivider, { backgroundColor: C.separator }]} />
        <View style={s.statItem}>
          <Text style={[s.statNum, { color: '#D97757' }]}>{atRisk.length}</Text>
          <Text style={[s.statLabel, { color: C.secondary }]}>At-Risk</Text>
        </View>
      </View>

      {/* Navigate */}
      <Text style={[s.sectionLabel, { color: C.secondary }]}>Navigate</Text>
      {NAV_ITEMS.map((item, idx) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [
            s.navRow,
            pressed && { backgroundColor: C.surfacePressed },
            idx < NAV_ITEMS.length - 1 && [s.navRowBorder, { borderBottomColor: C.separator }],
          ]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigate(item.tab); }}
        >
          <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
          <Text style={[s.navLabel, { color: C.label }]}>{item.label}</Text>
          <IconSymbol name="chevron.right" size={14} color={C.muted} />
        </Pressable>
      ))}

      <View style={[s.divider, { backgroundColor: C.separator }]} />

      {/* New Members */}
      {newMembers.length > 0 && (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, marginBottom: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#1D9BF0' }} />
            <Text style={[s.sectionLabel, { color: C.secondary, marginBottom: 0 }]}>
              {newMembers.length} New {newMembers.length === 1 ? 'Member' : 'Members'}
            </Text>
          </View>
          {newMembers.map((m, idx) => (
            <Pressable
              key={m.id}
              style={({ pressed }) => [
                s.alertRow,
                pressed && { backgroundColor: C.surfacePressed },
                idx < newMembers.length - 1 && [s.navRowBorder, { borderBottomColor: C.separator }],
              ]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}
            >
              <View style={[s.smallAvatar, { backgroundColor: `hsl(${m.hue},42%,32%)` }]}>
                <Text style={s.smallAvatarText}>{m.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.alertName, { color: C.label }]}>{m.name}</Text>
                <Text style={[s.alertSub, { color: C.secondary }]}>Joined {formatShortDate(m.joinDate)}</Text>
              </View>
              <Pressable
                style={[s.alertBtn, { backgroundColor: '#1D9BF0' }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); setTimeout(() => router.push('/(tabs)/(main)/messages'), 80); }}
              >
                <Text style={s.alertBtnText}>Welcome</Text>
              </Pressable>
            </Pressable>
          ))}
          <View style={[s.divider, { backgroundColor: C.separator }]} />
        </>
      )}

      {/* At-risk */}
      {atRisk.length > 0 && (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, marginBottom: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#D97757' }} />
            <Text style={[s.sectionLabel, { color: C.secondary, marginBottom: 0 }]}>
              {atRisk.length} At-Risk
            </Text>
          </View>
          {atRisk.map((m, idx) => (
            <Pressable
              key={m.id}
              style={({ pressed }) => [
                s.alertRow,
                pressed && { backgroundColor: C.surfacePressed },
                idx < atRisk.length - 1 && [s.navRowBorder, { borderBottomColor: C.separator }],
              ]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}
            >
              <View style={[s.smallAvatar, { backgroundColor: `hsl(${m.hue},42%,32%)` }]}>
                <Text style={s.smallAvatarText}>{m.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.alertName, { color: C.label }]}>{m.name}</Text>
                <Text style={[s.alertSub, { color: C.secondary }]}>Last: {formatShortDate(m.lastAttended)}</Text>
              </View>
              <Pressable
                style={[s.alertBtn, { backgroundColor: '#D97757' }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); setTimeout(() => router.push('/(tabs)/(main)/messages'), 80); }}
              >
                <Text style={s.alertBtnText}>Reach Out</Text>
              </Pressable>
            </Pressable>
          ))}
          <View style={[s.divider, { backgroundColor: C.separator }]} />
        </>
      )}

      {/* Visitor follow-up */}
      {visitors.length > 0 && (
        <>
          <Text style={[s.sectionLabel, { color: C.secondary }]}>Visitor Follow-Up</Text>
          {visitors.map((v, idx) => (
            <Pressable
              key={v.id}
              style={({ pressed }) => [
                s.alertRow,
                pressed && { backgroundColor: C.surfacePressed },
                idx < visitors.length - 1 && [s.navRowBorder, { borderBottomColor: C.separator }],
              ]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}
            >
              <View style={[s.smallAvatar, { backgroundColor: `hsl(${v.hue},42%,32%)` }]}>
                <Text style={s.smallAvatarText}>{v.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.alertName, { color: C.label }]}>{v.name}</Text>
                <Text style={[s.alertSub, { color: C.secondary }]}>Visited {formatShortDate(v.lastAttended)}</Text>
              </View>
              <Pressable
                style={[s.alertBtn, { backgroundColor: C.accent }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); setTimeout(() => router.push('/(tabs)/(main)/messages'), 80); }}
              >
                <Text style={s.alertBtnText}>Invite</Text>
              </Pressable>
            </Pressable>
          ))}
          <View style={[s.divider, { backgroundColor: C.separator }]} />
        </>
      )}

      {/* Actions */}
      <Text style={[s.sectionLabel, { color: C.secondary }]}>Actions</Text>
      {ACTION_ITEMS.map((item, idx) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [
            s.navRow,
            pressed && { backgroundColor: C.surfacePressed },
            idx < ACTION_ITEMS.length - 1 && [s.navRowBorder, { borderBottomColor: C.separator }],
          ]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}
        >
          <IconSymbol name={item.icon as any} size={18} color={C.accent} />
          <Text style={[s.navLabel, { color: C.label }]}>{item.label}</Text>
        </Pressable>
      ))}

      <View style={[s.divider, { backgroundColor: C.separator }]} />

      {/* Settings */}
      {SETTINGS_ITEMS.map((item, idx) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [
            s.navRow,
            pressed && { backgroundColor: C.surfacePressed },
            idx < SETTINGS_ITEMS.length - 1 && [s.navRowBorder, { borderBottomColor: C.separator }],
          ]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}
        >
          <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
          <Text style={[s.navLabel, { color: C.label }]}>{item.label}</Text>
          <IconSymbol name="chevron.right" size={14} color={C.muted} />
        </Pressable>
      ))}

      <View style={{ height: 24 }} />
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: {},
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, marginBottom: 16 },
  avatar: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: '700', lineHeight: 21 },
  headerSub:  { fontSize: 12 },

  statsRow:    { flexDirection: 'row', marginBottom: 20, padding: 12 },
  statItem:    { flex: 1, alignItems: 'center' },
  statNum:     { fontSize: 16, fontWeight: '800' },
  statLabel:   { fontSize: 10, marginTop: 2 },
  statDivider: { width: StyleSheet.hairlineWidth, height: 28, alignSelf: 'center' },

  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', paddingHorizontal: 16, marginBottom: 4, marginTop: 4 },
  divider:      { height: StyleSheet.hairlineWidth, marginVertical: 16 },
  navRow:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 13, borderRadius: 8 },
  navRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth },
  navLabel:     { flex: 1, fontSize: 15 },

  alertRow:       { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 10 },
  smallAvatar:    { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  smallAvatarText:{ fontSize: 11, fontWeight: '800', color: '#fff' },
  alertName:      { fontSize: 13, fontWeight: '600' },
  alertSub:       { fontSize: 11 },
  alertBtn:       { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  alertBtnText:   { fontSize: 11, fontWeight: '700', color: '#fff' },
});
