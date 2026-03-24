/**
 * Community Members — CRM + public directory for community mode.
 * Three tabs via centered dropdown: Directory / Roles / Attendance.
 * RBAC toggle: Admin (CRM view) ↔ Member (public directory).
 * Filter pills hidden by default, toggled by filter icon.
 * Slide-up detail sheet on member tap.
 * Check-in overlay when admin takes attendance.
 * Bulk select via long-press (admin directory only).
 */

import React, {
  useState, useRef, useCallback, useMemo, useEffect,
} from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  TextInput, Animated, Switch,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useAccentColor } from '@/hooks/use-accent-color';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter, hideFooter, showFooter } from '@/utils/global-footer-hide';
import {
  COMMUNITY_MEMBERS, ROLE_DEFINITIONS, ATTENDANCE_CHART,
  ATTENDANCE_EVENTS, ATTENDANCE_STATS, MY_ATTENDANCE_HISTORY,
  getAtRiskMembers, getVisitorMembers, getNewMembers,
  type CommunityMember, type MemberRoleType,
} from '@/data/mock-community-members';

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_BAR_H = 52;
const PILLS_H   = 48;
const DETAIL_H  = 560;
const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const DEPT_PILLS = ['All', 'Leadership', 'Worship', 'Youth', 'Hospitality', 'Outreach', 'Education'];

// ── Types ─────────────────────────────────────────────────────────────────────

type MemberTab = 'Directory' | 'Roles' | 'Attendance';

// ── Helpers ───────────────────────────────────────────────────────────────────

function pillsForTab(tab: MemberTab, isAdmin: boolean): string[] {
  if (tab === 'Directory')
    return isAdmin
      ? ['All', 'Active', 'At-Risk', 'Inactive', 'New', 'Visitors']
      : DEPT_PILLS;
  if (tab === 'Roles')
    return ['All', 'Admin', 'Staff', 'Leader', 'Volunteer', 'Member'];
  if (tab === 'Attendance')
    return isAdmin ? ['All', 'This Week', 'This Month', 'At-Risk', 'Visitors'] : [];
  return [];
}

function statusColor(status: CommunityMember['status']): string {
  switch (status) {
    case 'active':   return '#5A8A6E';
    case 'at_risk':  return '#D97757';
    case 'inactive': return '#B85C5C';
    case 'new':      return '#1D9BF0';
    default:         return 'rgba(45,30,18,0.30)';
  }
}

function statusLabel(status: CommunityMember['status']): string {
  switch (status) {
    case 'active':   return 'Active';
    case 'at_risk':  return 'At-Risk';
    case 'inactive': return 'Inactive';
    case 'new':      return 'New';
    default:         return 'Visitor';
  }
}

function roleColor(role: MemberRoleType): string {
  const map: Record<MemberRoleType, string> = {
    admin: 'hsl(220,55%,32%)',
    staff: 'hsl(200,55%,30%)',
    leader: 'hsl(140,42%,28%)',
    volunteer: 'hsl(50,55%,28%)',
    member: 'rgba(45,30,18,0.40)',
    visitor: 'rgba(45,30,18,0.25)',
  };
  return map[role];
}

function formatShortDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-').map(Number);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[m - 1]} ${d}`;
}

function formatYear(dateStr: string): string {
  return dateStr.split('-')[0];
}

// ── MemberRow (admin view) ────────────────────────────────────────────────────

interface MemberRowProps {
  member: CommunityMember;
  onPress: (m: CommunityMember) => void;
  onLongPress: (m: CommunityMember) => void;
  bulkMode: boolean;
  selected: boolean;
  C: ComponentColors;
  s: ReturnType<typeof makeStyles>;
}

function MemberRow({ member, onPress, onLongPress, bulkMode, selected, C, s }: MemberRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        s.memberRow,
        (pressed || selected) && { backgroundColor: C.surfacePressed },
      ]}
      onPress={() => onPress(member)}
      onLongPress={() => onLongPress(member)}
      delayLongPress={380}
    >
      {bulkMode && (
        <View style={[s.checkbox, selected && { backgroundColor: C.accent, borderColor: C.accent }]}>
          {selected && <IconSymbol name="checkmark" size={12} color="#fff" />}
        </View>
      )}
      {/* Avatar */}
      <View style={[s.memberAvatar, { backgroundColor: `hsl(${member.hue},42%,32%)` }]}>
        <Text style={s.memberAvatarText}>{member.initials}</Text>
      </View>
      {/* Info */}
      <View style={s.memberInfo}>
        <View style={s.memberNameRow}>
          <Text style={[s.memberName, { color: C.label }]} numberOfLines={1}>{member.name}</Text>
          {member.status === 'new' && (
            <View style={[s.newBadge, { backgroundColor: '#1D9BF0' }]}>
              <Text style={s.newBadgeText}>NEW</Text>
            </View>
          )}
        </View>
        <View style={s.memberSubRow}>
          <View style={[s.rolePill, { backgroundColor: roleColor(member.role) }]}>
            <Text style={s.rolePillText}>{member.role.charAt(0).toUpperCase() + member.role.slice(1)}</Text>
          </View>
          {member.departments.slice(0, 2).map(d => (
            <Text key={d} style={[s.deptChip, { color: C.muted }]}>{d}</Text>
          ))}
        </View>
      </View>
      {/* Status */}
      <View style={s.memberRight}>
        <View style={[s.statusDot, { backgroundColor: statusColor(member.status) }]} />
        <Text style={[s.lastAttended, { color: C.muted }]}>{formatShortDate(member.lastAttended)}</Text>
      </View>
    </Pressable>
  );
}

// ── MemberRowSimple (member/public view) ──────────────────────────────────────

function MemberRowSimple({
  member, onPress, C, s,
}: { member: CommunityMember; onPress: (m: CommunityMember) => void; C: ComponentColors; s: ReturnType<typeof makeStyles> }) {
  return (
    <Pressable
      style={({ pressed }) => [s.memberRow, pressed && { backgroundColor: C.surfacePressed }]}
      onPress={() => onPress(member)}
    >
      <View style={[s.memberAvatar, { backgroundColor: `hsl(${member.hue},42%,32%)` }]}>
        <Text style={s.memberAvatarText}>{member.initials}</Text>
      </View>
      <View style={s.memberInfo}>
        <Text style={[s.memberName, { color: C.label }]} numberOfLines={1}>{member.name}</Text>
        <View style={s.memberSubRow}>
          <View style={[s.rolePill, { backgroundColor: roleColor(member.role) }]}>
            <Text style={s.rolePillText}>{member.role.charAt(0).toUpperCase() + member.role.slice(1)}</Text>
          </View>
          {member.departments.slice(0, 1).map(d => (
            <Text key={d} style={[s.deptChip, { color: C.muted }]}>{d}</Text>
          ))}
        </View>
      </View>
      <IconSymbol name="chevron.right" size={14} color={C.muted} />
    </Pressable>
  );
}

// ── SectionHeader ─────────────────────────────────────────────────────────────

function SectionHeader({ letter, onLayout, C, s }: {
  letter: string;
  onLayout: (letter: string, y: number) => void;
  C: ComponentColors;
  s: ReturnType<typeof makeStyles>;
}) {
  return (
    <View
      style={[s.sectionHeader, { borderBottomColor: C.separator }]}
      onLayout={(e) => onLayout(letter, e.nativeEvent.layout.y)}
    >
      <Text style={[s.sectionHeaderText, { color: C.secondary }]}>{letter}</Text>
    </View>
  );
}

// ── MemberDetailSheet ─────────────────────────────────────────────────────────

function MemberDetailSheet({
  member, isAdmin, onClose, C, insets,
}: {
  member: CommunityMember;
  isAdmin: boolean;
  onClose: () => void;
  C: ComponentColors;
  insets: ReturnType<typeof useSafeAreaInsets>;
}) {
  const router = useRouter();
  const [noteText, setNoteText] = useState(member.pastoralNote ?? '');
  const [editingNote, setEditingNote] = useState(false);

  const goToMessages = useCallback(() => {
    onClose();
    setTimeout(() => router.push('/(tabs)/(main)/messages'), 80);
  }, [router, onClose]);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24, paddingHorizontal: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Drag handle */}
      <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 4 }}>
        <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(45,30,18,0.20)' }} />
      </View>

      {/* Header row */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginTop: 12, marginBottom: 16 }}>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: `hsl(${member.hue},42%,32%)`, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff' }}>{member.initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: C.label }}>{member.name}</Text>
          <Text style={{ fontSize: 13, color: C.secondary }}>@{member.handle}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <View style={{ backgroundColor: roleColor(member.role), paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>{member.role.charAt(0).toUpperCase() + member.role.slice(1)}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: statusColor(member.status) }} />
              <Text style={{ fontSize: 12, color: C.secondary }}>{statusLabel(member.status)}</Text>
            </View>
          </View>
        </View>
        <Pressable onPress={onClose} hitSlop={12}>
          <IconSymbol name="xmark.circle.fill" size={24} color={C.muted} />
        </Pressable>
      </View>

      {/* Quick actions */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        {[
          { icon: 'message.fill', label: 'Message', action: goToMessages },
          { icon: 'phone.fill', label: 'Call', action: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) },
          { icon: 'envelope.fill', label: 'Email', action: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) },
        ].map(btn => (
          <Pressable
            key={btn.label}
            style={({ pressed }) => ({
              flex: 1, alignItems: 'center', paddingVertical: 12,
              backgroundColor: pressed ? C.surfacePressed : C.surface,
              borderRadius: 12, gap: 4,
            })}
            onPress={btn.action}
          >
            <IconSymbol name={btn.icon as any} size={20} color={C.accent} />
            <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary }}>{btn.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Contact */}
      {isAdmin && (
        <View style={{ backgroundColor: C.surface, borderRadius: 12, marginBottom: 14, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
            <IconSymbol name="phone" size={16} color={C.secondary} />
            <Text style={{ flex: 1, fontSize: 14, color: C.label }}>{member.phone}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, gap: 12 }}>
            <IconSymbol name="envelope" size={16} color={C.secondary} />
            <Text style={{ flex: 1, fontSize: 14, color: C.label }}>{member.email}</Text>
          </View>
        </View>
      )}

      {/* Stats row (admin only) */}
      {isAdmin && (
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
          {[
            { label: 'Joined', value: formatYear(member.joinDate) },
            { label: 'Last Seen', value: formatShortDate(member.lastAttended) },
            { label: 'Giving YTD', value: `$${member.givingThisYear.toLocaleString()}` },
          ].map(stat => (
            <View key={stat.label} style={{ flex: 1, backgroundColor: C.surface, borderRadius: 10, padding: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{stat.value}</Text>
              <Text style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{stat.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Departments + Groups */}
      {member.departments.length > 0 && (
        <View style={{ marginBottom: 14 }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Departments</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {member.departments.map(d => (
              <View key={d} style={{ backgroundColor: C.surface, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}>
                <Text style={{ fontSize: 13, color: C.label }}>{d}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      {member.groups.length > 0 && (
        <View style={{ marginBottom: 14 }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Groups</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {member.groups.map(g => (
              <View key={g} style={{ backgroundColor: C.surface, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}>
                <Text style={{ fontSize: 13, color: C.label }}>{g}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Pastoral notes (admin only) */}
      {isAdmin && (
        <View style={{ backgroundColor: C.surface, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <IconSymbol name="lock.fill" size={13} color={C.secondary} />
            <Text style={{ flex: 1, fontSize: 12, fontWeight: '600', color: C.secondary, marginLeft: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Pastoral Notes</Text>
            <Pressable onPress={() => setEditingNote(v => !v)} hitSlop={8}>
              <Text style={{ fontSize: 13, color: C.accent, fontWeight: '600' }}>{editingNote ? 'Done' : 'Edit'}</Text>
            </Pressable>
          </View>
          {editingNote ? (
            <TextInput
              style={{ fontSize: 14, color: C.label, minHeight: 80, textAlignVertical: 'top' }}
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Add a private note\u2026"
              placeholderTextColor={C.muted}
              multiline
            />
          ) : (
            <Text style={{ fontSize: 14, color: noteText ? C.label : C.muted, lineHeight: 20 }}>
              {noteText || 'No pastoral notes yet. Tap Edit to add one.'}
            </Text>
          )}
        </View>
      )}

      {/* At-risk / inactive reach-out */}
      {isAdmin && (member.status === 'at_risk' || member.status === 'inactive') && (
        <Pressable
          style={({ pressed }) => ({
            backgroundColor: pressed ? C.surfacePressed : C.accent,
            borderRadius: 12, paddingVertical: 14, alignItems: 'center',
          })}
          onPress={goToMessages}
        >
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Schedule Outreach</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

// ── CheckInOverlay ────────────────────────────────────────────────────────────

function CheckInOverlay({
  event, members, checkedIn, onToggle, onDone, C, insets,
}: {
  event: { id: string; name: string; date: string; attendeeCount: number };
  members: CommunityMember[];
  checkedIn: Set<string>;
  onToggle: (id: string) => void;
  onDone: () => void;
  C: ComponentColors;
  insets: ReturnType<typeof useSafeAreaInsets>;
}) {
  const [search, setSearch] = useState('');
  const [useQR, setUseQR] = useState(false);
  const filtered = members.filter(m =>
    m.role !== 'visitor' &&
    (search === '' || m.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top bar */}
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>{event.name}</Text>
            <Text style={{ fontSize: 12, color: C.secondary }}>{formatShortDate(event.date)} \u00b7 {checkedIn.size} checked in</Text>
          </View>
          <Pressable
            style={{ backgroundColor: C.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}
            onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); onDone(); }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Done</Text>
          </Pressable>
        </View>
        {/* Manual / QR toggle */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          {['Manual', 'QR Code'].map(mode => (
            <Pressable
              key={mode}
              style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: (mode === 'Manual') === !useQR ? C.label : C.surface }}
              onPress={() => { Haptics.selectionAsync(); setUseQR(mode === 'QR Code'); }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: (mode === 'Manual') === !useQR ? '#fff' : C.secondary }}>{mode}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {useQR ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <View style={{ width: 200, height: 200, backgroundColor: C.surface, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.separator }}>
            <IconSymbol name="qrcode" size={80} color={C.label} />
          </View>
          <Text style={{ fontSize: 15, color: C.secondary, textAlign: 'center', paddingHorizontal: 40 }}>Members scan this QR code to check in automatically</Text>
        </View>
      ) : (
        <>
          <View style={{ paddingHorizontal: 16, paddingVertical: 10, backgroundColor: C.bg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 12, gap: 8 }}>
              <IconSymbol name="magnifyingglass" size={16} color={C.muted} />
              <TextInput
                style={{ flex: 1, height: 40, fontSize: 15, color: C.label }}
                placeholder="Search members\u2026"
                placeholderTextColor={C.muted}
                value={search}
                onChangeText={setSearch}
              />
            </View>
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
            {filtered.map(m => (
              <Pressable
                key={m.id}
                style={({ pressed }) => ({
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  paddingHorizontal: 16, paddingVertical: 12,
                  backgroundColor: pressed ? C.surfacePressed : 'transparent',
                })}
                onPress={() => { Haptics.selectionAsync(); onToggle(m.id); }}
              >
                <View style={{
                  width: 24, height: 24, borderRadius: 6, borderWidth: 2,
                  borderColor: checkedIn.has(m.id) ? C.accent : C.separator,
                  backgroundColor: checkedIn.has(m.id) ? C.accent : 'transparent',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {checkedIn.has(m.id) && <IconSymbol name="checkmark" size={13} color="#fff" />}
                </View>
                <View style={[{ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' }, { backgroundColor: `hsl(${m.hue},42%,32%)` }]}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff' }}>{m.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: C.label }}>{m.name}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{m.departments.slice(0, 2).join(' \u00b7 ') || 'No department'}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
}

// ── AlphabetIndex ─────────────────────────────────────────────────────────────

function AlphabetIndex({ letters, onPress, C, topOffset }: { letters: string[]; onPress: (l: string) => void; C: ComponentColors; topOffset: number }) {
  return (
    <View style={{ position: 'absolute', right: 2, top: topOffset, bottom: 0, justifyContent: 'center', zIndex: 5, paddingVertical: 8 }}>
      {ALL_LETTERS.filter(l => letters.includes(l)).map(letter => (
        <Pressable key={letter} onPress={() => onPress(letter)} hitSlop={4}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: C.accent, lineHeight: 15, textAlign: 'center', width: 16 }}>{letter}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function CommunityMembersScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const accent = useAccentColor();

  const topBarH    = insets.top + TOP_BAR_H;
  const scrollRef  = useRef<ScrollView>(null);
  const pillsAnim  = useRef(new Animated.Value(0)).current;
  const detailAnim = useRef(new Animated.Value(0)).current;
  const sectionOffsets = useRef<Record<string, number>>({});

  const [isAdmin,           setIsAdmin]           = useState(true);
  const [activeTab,         setActiveTab]         = useState<MemberTab>('Directory');
  const [dropdownOpen,      setDropdownOpen]      = useState(false);
  const [pillsVisible,      setPillsVisible]      = useState(false);
  const [selectedPill,      setSelectedPill]      = useState('All');
  const [searchText,        setSearchText]        = useState('');
  const [expandedMemberId,  setExpandedMemberId]  = useState<string | null>(null);
  const [expandedRoleId,    setExpandedRoleId]    = useState<string | null>(null);
  const [bulkMode,          setBulkMode]          = useState(false);
  const [bulkSelected,      setBulkSelected]      = useState<Set<string>>(new Set());
  const [checkInEventId,    setCheckInEventId]    = useState<string | null>(null);
  const [checkedIn,         setCheckedIn]         = useState<Set<string>>(new Set());

  // Derived
  const pills      = useMemo(() => pillsForTab(activeTab, isAdmin), [activeTab, isAdmin]);
  const pillsH     = useMemo(() => pills.length > 0 ? PILLS_H : 0, [pills]);

  const filteredMembers = useMemo(() => {
    let list = [...COMMUNITY_MEMBERS];
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(q) || m.handle.toLowerCase().includes(q));
    }
    if (isAdmin) {
      switch (selectedPill) {
        case 'Active':   list = list.filter(m => m.status === 'active'); break;
        case 'At-Risk':  list = list.filter(m => m.status === 'at_risk'); break;
        case 'Inactive': list = list.filter(m => m.status === 'inactive'); break;
        case 'New':      list = list.filter(m => m.status === 'new'); break;
        case 'Visitors': list = list.filter(m => m.status === 'visitor'); break;
      }
    } else {
      // Member view: exclude visitors unless Leadership pill
      if (selectedPill === 'Leadership') {
        list = list.filter(m => ['admin', 'staff', 'leader'].includes(m.role));
      } else if (selectedPill !== 'All') {
        list = list.filter(m => m.departments.includes(selectedPill));
      } else {
        list = list.filter(m => m.status !== 'visitor');
      }
    }
    return list;
  }, [searchText, selectedPill, isAdmin]);

  const leadership = useMemo(() =>
    COMMUNITY_MEMBERS.filter(m => ['admin', 'staff', 'leader'].includes(m.role)),
  []);

  const nonLeadershipMembers = useMemo(() =>
    filteredMembers.filter(m => !['admin', 'staff', 'leader'].includes(m.role)),
  [filteredMembers]);

  const groupedByLetter = useMemo(() => {
    const map: Record<string, CommunityMember[]> = {};
    nonLeadershipMembers.forEach(m => {
      const l = m.name[0].toUpperCase();
      if (!map[l]) map[l] = [];
      map[l].push(m);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [nonLeadershipMembers]);

  const letterSections = useMemo(() => groupedByLetter.map(([l]) => l), [groupedByLetter]);

  const checkInEvent = useMemo(() =>
    checkInEventId ? ATTENDANCE_EVENTS.find(e => e.id === checkInEventId) ?? null : null,
  [checkInEventId]);

  const expandedMember = useMemo(() =>
    expandedMemberId ? COMMUNITY_MEMBERS.find(m => m.id === expandedMemberId) ?? null : null,
  [expandedMemberId]);

  // Footer hide on scroll
  const lastScrollY = useRef(0);
  const onScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y - lastScrollY.current > 10) hideFooter();
    else if (lastScrollY.current - y > 10) showFooter();
    lastScrollY.current = y;
  }, []);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  // Pills toggle
  const togglePills = useCallback(() => {
    if (pills.length === 0) return;
    Haptics.selectionAsync();
    const toValue = pillsVisible ? 0 : 1;
    setPillsVisible(!pillsVisible);
    Animated.timing(pillsAnim, { toValue, duration: 200, useNativeDriver: false }).start();
  }, [pillsVisible, pills, pillsAnim]);

  const pillsHeight = pillsAnim.interpolate({ inputRange: [0, 1], outputRange: [0, PILLS_H] });

  // Tab change
  const changeTab = useCallback((tab: MemberTab) => {
    Haptics.selectionAsync();
    setActiveTab(tab);
    setDropdownOpen(false);
    setSelectedPill('All');
    setPillsVisible(false);
    pillsAnim.setValue(0);
    setSearchText('');
    setBulkMode(false);
    setBulkSelected(new Set());
  }, [pillsAnim]);

  // Role toggle
  const handleRoleToggle = useCallback(() => {
    Haptics.selectionAsync();
    setIsAdmin(v => !v);
    setSelectedPill('All');
    setPillsVisible(false);
    pillsAnim.setValue(0);
    setSearchText('');
    setBulkMode(false);
    setBulkSelected(new Set());
  }, [pillsAnim]);

  // Member detail open/close
  const openDetail = useCallback((member: CommunityMember) => {
    if (bulkMode) {
      setBulkSelected(prev => {
        const next = new Set(prev);
        next.has(member.id) ? next.delete(member.id) : next.add(member.id);
        return next;
      });
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedMemberId(member.id);
    Animated.timing(detailAnim, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  }, [bulkMode, detailAnim]);

  const closeDetail = useCallback(() => {
    Animated.timing(detailAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start(() =>
      setExpandedMemberId(null)
    );
  }, [detailAnim]);

  const onLongPress = useCallback((member: CommunityMember) => {
    if (!isAdmin) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBulkMode(true);
    setBulkSelected(new Set([member.id]));
  }, [isAdmin]);

  // Alphabet scroll
  const onSectionLayout = useCallback((letter: string, y: number) => {
    sectionOffsets.current[letter] = y;
  }, []);
  const scrollToLetter = useCallback((letter: string) => {
    Haptics.selectionAsync();
    const y = sectionOffsets.current[letter];
    if (y != null) scrollRef.current?.scrollTo({ y, animated: true });
  }, []);

  // Check-in
  const startCheckIn = useCallback((eventId: string) => {
    const evt = ATTENDANCE_EVENTS.find(e => e.id === eventId);
    if (evt) {
      setCheckedIn(new Set(evt.checkedInIds));
      setCheckInEventId(eventId);
    }
  }, []);
  const toggleCheckedIn = useCallback((id: string) => {
    setCheckedIn(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // ── Render functions ────────────────────────────────────────────────────────

  function renderAdminDirectory() {
    return (
      <>
        {/* Search */}
        <View style={[s.searchBar, { backgroundColor: C.surface }]}>
          <IconSymbol name="magnifyingglass" size={16} color={C.muted} />
          <TextInput
            style={[s.searchInput, { color: C.label }]}
            placeholder="Search members…"
            placeholderTextColor={C.muted}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')} hitSlop={8}>
              <IconSymbol name="xmark.circle.fill" size={16} color={C.muted} />
            </Pressable>
          )}
        </View>

        {/* Member count */}
        <View style={s.countRow}>
          <Text style={[s.countText, { color: C.secondary }]}>
            {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'}
          </Text>
          {isAdmin && (
            <Pressable
              onPress={() => { Haptics.selectionAsync(); setBulkMode(v => !v); setBulkSelected(new Set()); }}
              hitSlop={8}
            >
              <Text style={[s.countAction, { color: bulkMode ? C.accent : C.secondary }]}>
                {bulkMode ? 'Cancel' : 'Select'}
              </Text>
            </Pressable>
          )}
        </View>

        {/* List */}
        {filteredMembers.map(m => (
          <MemberRow
            key={m.id}
            member={m}
            onPress={openDetail}
            onLongPress={onLongPress}
            bulkMode={bulkMode}
            selected={bulkSelected.has(m.id)}
            C={C}
            s={s}
          />
        ))}
        <View style={{ height: 80 }} />
      </>
    );
  }

  function renderMemberDirectory() {
    // Leadership pinned at top when pill is All or Leadership
    const showLeadership = selectedPill === 'All' || selectedPill === 'Leadership';
    return (
      <>
        {/* Search */}
        <View style={[s.searchBar, { backgroundColor: C.surface }]}>
          <IconSymbol name="magnifyingglass" size={16} color={C.muted} />
          <TextInput
            style={[s.searchInput, { color: C.label }]}
            placeholder="Search directory…"
            placeholderTextColor={C.muted}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {showLeadership && (
          <>
            <View style={[s.sectionHeader, { borderBottomColor: C.separator }]}>
              <Text style={[s.sectionHeaderText, { color: C.secondary }]}>LEADERSHIP</Text>
            </View>
            {leadership.map(m => (
              <MemberRowSimple key={m.id} member={m} onPress={openDetail} C={C} s={s} />
            ))}
          </>
        )}

        {selectedPill !== 'Leadership' && groupedByLetter.map(([letter, members]) => (
          <View key={letter}>
            <SectionHeader letter={letter} onLayout={onSectionLayout} C={C} s={s} />
            {members.map(m => (
              <MemberRowSimple key={m.id} member={m} onPress={openDetail} C={C} s={s} />
            ))}
          </View>
        ))}
        <View style={{ height: 80 }} />
      </>
    );
  }

  function renderAdminRoles() {
    const filterRole = selectedPill !== 'All' ? selectedPill.toLowerCase() : null;
    const visibleRoles = filterRole
      ? ROLE_DEFINITIONS.filter(r => r.id === filterRole)
      : ROLE_DEFINITIONS;

    return (
      <>
        {visibleRoles.map(role => {
          const isExpanded = expandedRoleId === role.id;
          const roleMembers = COMMUNITY_MEMBERS.filter(m => m.role === role.id);
          return (
            <View key={role.id} style={[s.roleCard, { backgroundColor: C.surface }]}>
              <Pressable
                style={({ pressed }) => [s.roleCardHeader, pressed && { backgroundColor: C.surfacePressed }]}
                onPress={() => { Haptics.selectionAsync(); setExpandedRoleId(isExpanded ? null : role.id); }}
              >
                <View style={[s.roleColorDot, { backgroundColor: `hsl(${role.hue},42%,32%)` }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.roleName, { color: C.label }]}>{role.displayName}</Text>
                  <Text style={[s.roleDesc, { color: C.secondary }]}>{role.description}</Text>
                </View>
                <Text style={[s.roleMemberCount, { color: C.muted }]}>{role.memberCount}</Text>
                <IconSymbol name={isExpanded ? 'chevron.up' : 'chevron.down'} size={14} color={C.muted} />
              </Pressable>

              {isExpanded && (
                <View style={[s.roleExpanded, { borderTopColor: C.separator }]}>
                  {/* Permissions */}
                  <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
                    <Text style={[s.sectionHeaderText, { color: C.secondary, marginBottom: 6 }]}>PERMISSIONS</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                      {role.permissions.map(p => (
                        <View key={p} style={{ backgroundColor: C.surfacePressed, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                          <Text style={{ fontSize: 12, color: C.label }}>{p}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  {/* Members with this role */}
                  <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }}>
                    {roleMembers.map(m => (
                      <Pressable
                        key={m.id}
                        style={({ pressed }) => [s.memberRow, pressed && { backgroundColor: C.surfacePressed }]}
                        onPress={() => openDetail(m)}
                      >
                        <View style={[s.memberAvatar, { width: 34, height: 34, borderRadius: 17, backgroundColor: `hsl(${m.hue},42%,32%)` }]}>
                          <Text style={[s.memberAvatarText, { fontSize: 11 }]}>{m.initials}</Text>
                        </View>
                        <Text style={[{ flex: 1, fontSize: 14, color: C.label }]}>{m.name}</Text>
                        <IconSymbol name="chevron.right" size={13} color={C.muted} />
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
            </View>
          );
        })}
        <View style={{ height: 40 }} />
      </>
    );
  }

  function renderMemberRoles() {
    const tiers: { label: string; roles: MemberRoleType[] }[] = [
      { label: 'Pastor / Director', roles: ['admin'] },
      { label: 'Staff & Deacons', roles: ['staff'] },
      { label: 'Ministry Leaders', roles: ['leader'] },
      { label: 'Volunteers', roles: ['volunteer'] },
    ];
    return (
      <>
        <Text style={[s.sectionLabel, { color: C.secondary }]}>Leadership Structure</Text>
        {tiers.map(tier => {
          const tierMembers = COMMUNITY_MEMBERS.filter(m => tier.roles.includes(m.role));
          if (tierMembers.length === 0) return null;
          return (
            <View key={tier.label} style={{ marginBottom: 16 }}>
              <Text style={[s.tierLabel, { color: C.label }]}>{tier.label}</Text>
              {tierMembers.map(m => (
                <MemberRowSimple key={m.id} member={m} onPress={openDetail} C={C} s={s} />
              ))}
            </View>
          );
        })}
        <View style={{ height: 40 }} />
      </>
    );
  }

  function renderAdminAttendance() {
    const { avgWeekly, trend, totalThisMonth, newVisitorsThisMonth } = ATTENDANCE_STATS;
    const chartMax = Math.max(...ATTENDANCE_CHART.map(d => d.count));
    const atRisk = getAtRiskMembers();
    const visitors = getVisitorMembers();

    return (
      <>
        {/* Stats row */}
        <View style={s.statsGrid}>
          {[
            { label: 'Avg Weekly', value: avgWeekly.toString() },
            { label: 'Trend', value: `+${trend}%`, color: '#5A8A6E' },
            { label: 'This Month', value: totalThisMonth.toString() },
            { label: 'New Visitors', value: newVisitorsThisMonth.toString() },
          ].map(stat => (
            <View key={stat.label} style={[s.statCard, { backgroundColor: C.surface }]}>
              <Text style={[s.statCardValue, { color: stat.color ?? C.label }]}>{stat.value}</Text>
              <Text style={[s.statCardLabel, { color: C.secondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Chart */}
        <View style={[s.chartBox, { backgroundColor: C.surface }]}>
          <Text style={[s.sectionLabel, { color: C.secondary, marginBottom: 12 }]}>Weekly Attendance</Text>
          <View style={s.chartBars}>
            {ATTENDANCE_CHART.map((d, i) => (
              <View key={i} style={s.barWrapper}>
                <Text style={[s.barCount, { color: C.muted }]}>{d.count}</Text>
                <View style={[s.bar, { height: (d.count / chartMax) * 90, backgroundColor: accent }]} />
                <Text style={[s.barLabel, { color: C.muted }]}>{d.label.split(' ')[1]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* At-risk alert */}
        {atRisk.length > 0 && (
          <View style={[s.alertCard, { backgroundColor: `hsl(30,80%,97%)`, borderColor: '#D97757' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#D97757" />
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#D97757' }}>{atRisk.length} Members At-Risk</Text>
            </View>
            {atRisk.map(m => (
              <View key={m.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: `hsl(${m.hue},42%,32%)`, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#fff' }}>{m.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{m.name}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>Last seen: {formatShortDate(m.lastAttended)}</Text>
                </View>
                <Pressable
                  style={{ backgroundColor: '#D97757', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/(main)/messages'); }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>Reach Out</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Visitor follow-up */}
        {visitors.length > 0 && (
          <View style={[s.alertCard, { backgroundColor: `hsl(210,80%,97%)`, borderColor: '#1D9BF0', marginTop: 12 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <IconSymbol name="person.badge.plus" size={16} color="#1D9BF0" />
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#1D9BF0' }}>{visitors.length} Visitors — Follow Up</Text>
            </View>
            {visitors.map(v => (
              <View key={v.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: `hsl(${v.hue},42%,32%)`, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#fff' }}>{v.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{v.name}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>Visited: {formatShortDate(v.lastAttended)}</Text>
                </View>
                <Pressable
                  style={{ backgroundColor: '#1D9BF0', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/(main)/messages'); }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>Invite</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Event list */}
        <Text style={[s.sectionLabel, { color: C.secondary, marginTop: 20 }]}>Recent Services</Text>
        {ATTENDANCE_EVENTS.map(evt => (
          <View key={evt.id} style={[s.eventCard, { backgroundColor: C.surface }]}>
            <View style={{ flex: 1 }}>
              <Text style={[s.eventName, { color: C.label }]}>{evt.name}</Text>
              <Text style={[s.eventDate, { color: C.secondary }]}>{formatShortDate(evt.date)} \u00b7 {evt.attendeeCount} attendees</Text>
            </View>
            <Pressable
              style={[s.checkInBtn, { borderColor: C.accent }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); startCheckIn(evt.id); }}
            >
              <Text style={[s.checkInBtnText, { color: C.accent }]}>Check-In</Text>
            </Pressable>
          </View>
        ))}
        <View style={{ height: 80 }} />
      </>
    );
  }

  function renderMemberAttendance() {
    const streak = 5;
    return (
      <>
        {/* Streak */}
        <View style={[s.streakCard, { backgroundColor: C.surface }]}>
          <Text style={{ fontSize: 32 }}>🔥</Text>
          <View>
            <Text style={[{ fontSize: 24, fontWeight: '800', color: C.label }]}>{streak}</Text>
            <Text style={[{ fontSize: 13, color: C.secondary }]}>Week Streak</Text>
          </View>
        </View>

        <Text style={[s.sectionLabel, { color: C.secondary }]}>My Attendance</Text>
        {MY_ATTENDANCE_HISTORY.map((entry, i) => (
          <View
            key={i}
            style={[s.myAttRow, { borderBottomColor: C.separator }]}
          >
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#5A8A6E', alignItems: 'center', justifyContent: 'center' }}>
              <IconSymbol name="checkmark" size={14} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{entry.event}</Text>
              <Text style={{ fontSize: 12, color: C.secondary }}>{formatShortDate(entry.date)}</Text>
            </View>
          </View>
        ))}
        <View style={{ height: 40 }} />
      </>
    );
  }

  function renderContent() {
    if (activeTab === 'Directory') return isAdmin ? renderAdminDirectory() : renderMemberDirectory();
    if (activeTab === 'Roles') return isAdmin ? renderAdminRoles() : renderMemberRoles();
    return isAdmin ? renderAdminAttendance() : renderMemberAttendance();
  }

  // ── Layout ──────────────────────────────────────────────────────────────────

  const contentPaddingTop = topBarH + PILLS_H + 8;
  const showAlphaIndex    = activeTab === 'Directory' && !isAdmin && selectedPill !== 'Leadership';

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      {/* ── Content ScrollView (full-screen, padded under absolute header) ──── */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: contentPaddingTop,
          paddingHorizontal: 16,
          paddingRight: showAlphaIndex ? 28 : 16,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
        {renderContent()}
      </ScrollView>

      {/* Alphabet index (member directory only) */}
      {showAlphaIndex && (
        <AlphabetIndex letters={letterSections} onPress={scrollToLetter} C={C} topOffset={contentPaddingTop} />
      )}

      {/* ── Absolute top bar (renders over content) ───────────────────────── */}
      <View style={[s.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg }]}>
        <View style={s.topBar}>
          {/* Left: hamburger (admin) or empty */}
          <View style={s.topBarSide}>
            {isAdmin && (
              <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={12}>
                <IconSymbol name="line.3.horizontal" size={22} color={C.label} />
              </Pressable>
            )}
          </View>

          {/* Center: dropdown pill */}
          <View style={s.dropdownPillWrap}>
            <Pressable
              style={[s.dropdownPill, { backgroundColor: C.surfacePressed }]}
              onPress={() => { Haptics.selectionAsync(); setDropdownOpen(v => !v); }}
            >
              <Text style={[s.dropdownPillText, { color: C.label }]}>{activeTab}</Text>
              <IconSymbol name="chevron.down" size={12} color={C.secondary} />
            </Pressable>
          </View>

          {/* Right: RBAC toggle + filter icon */}
          <View style={[s.topBarSide, { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }]}>
            <Pressable
              style={[s.rbacToggle, { backgroundColor: isAdmin ? C.accent : C.surfacePressed }]}
              onPress={handleRoleToggle}
            >
              <Text style={[s.rbacToggleText, { color: isAdmin ? '#fff' : C.secondary }]}>
                {isAdmin ? 'Admin' : 'Member'}
              </Text>
            </Pressable>
            {pills.length > 0 && (
              <Pressable onPress={togglePills} hitSlop={12}>
                <IconSymbol
                  name={pillsVisible || selectedPill !== 'All' ? 'line.3.horizontal.decrease.circle.fill' : 'line.3.horizontal.decrease.circle'}
                  size={22} color={pillsVisible || selectedPill !== 'All' ? C.accent : C.label}
                />
              </Pressable>
            )}
          </View>
        </View>

        {/* Pills row */}
        <Animated.View style={{ height: pillsAnim.interpolate({ inputRange: [0, 1], outputRange: [0, PILLS_H] }), opacity: pillsAnim, overflow: 'hidden' }}>
          <ScrollView
            horizontal showsHorizontalScrollIndicator={false}
            style={[s.pillsRow, { borderTopColor: C.separator }]}
            contentContainerStyle={s.pillsContent}
          >
            {pills.map(pill => {
              const active = pill === selectedPill;
              return (
                <Pressable
                  key={pill}
                  style={[s.pill, active ? { backgroundColor: C.label } : { borderColor: C.separator }]}
                  onPress={() => { Haptics.selectionAsync(); setSelectedPill(pill); }}
                >
                  <Text style={[s.pillText, { color: active ? C.bg : C.secondary }, active && { fontWeight: '600' }]}>{pill}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>

      {/* ── Dropdown overlay ─────────────────────────────────────────────────── */}
      {dropdownOpen && (
        <>
          <Pressable
            style={{ ...StyleSheet.absoluteFillObject, zIndex: 98 } as any}
            onPress={() => setDropdownOpen(false)}
          />
          <View style={[s.dropdown, { backgroundColor: C.surface, borderColor: C.separator, top: insets.top + TOP_BAR_H }]}>
            {(['Directory', 'Roles', 'Attendance'] as MemberTab[]).map(tab => (
              <Pressable
                key={tab}
                style={({ pressed }) => [
                  s.dropdownOpt,
                  { borderBottomColor: C.separator },
                  (pressed || tab === activeTab) && { backgroundColor: C.surfacePressed },
                ]}
                onPress={() => changeTab(tab)}
              >
                <Text style={[s.dropdownOptText, { color: tab === activeTab ? C.accent : C.label }]}>{tab}</Text>
                {tab === activeTab && <IconSymbol name="checkmark" size={14} color={C.accent} />}
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* ── Member detail sheet ───────────────────────────────────────────────── */}
      {expandedMemberId && (
        <>
          <Animated.View
            style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 49, opacity: detailAnim } as any}
          >
            <Pressable style={{ flex: 1 }} onPress={closeDetail} />
          </Animated.View>
          <Animated.View
            style={[s.detailSheet, {
              backgroundColor: C.bg,
              zIndex: 50,
              transform: [{ translateY: detailAnim.interpolate({ inputRange: [0, 1], outputRange: [DETAIL_H, 0] }) }],
            }]}
          >
            {expandedMember && (
              <MemberDetailSheet
                member={expandedMember}
                isAdmin={isAdmin}
                onClose={closeDetail}
                C={C}
                insets={insets}
              />
            )}
          </Animated.View>
        </>
      )}

      {/* ── Check-in overlay ─────────────────────────────────────────────────── */}
      {checkInEvent && (
        <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 60 } as any}>
          <CheckInOverlay
            event={checkInEvent}
            members={COMMUNITY_MEMBERS}
            checkedIn={checkedIn}
            onToggle={toggleCheckedIn}
            onDone={() => setCheckInEventId(null)}
            C={C}
            insets={insets}
          />
        </View>
      )}

      {/* ── Bulk action bar ───────────────────────────────────────────────────── */}
      {bulkMode && (
        <View style={[s.bulkBar, { backgroundColor: C.surface, borderTopColor: C.separator, paddingBottom: insets.bottom + 8 }]}>
          <Text style={[s.bulkCount, { color: C.secondary }]}>{bulkSelected.size} selected</Text>
          <Pressable
            style={[s.bulkAction, { backgroundColor: C.accent }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/(tabs)/(main)/messages'); setBulkMode(false); }}
          >
            <IconSymbol name="message.fill" size={14} color="#fff" />
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>Message</Text>
          </Pressable>
          <Pressable onPress={() => { setBulkMode(false); setBulkSelected(new Set()); }} hitSlop={8}>
            <Text style={[{ fontSize: 14, fontWeight: '600', color: C.secondary }]}>Cancel</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:          { flex: 1 },
  topBarWrap:      { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topBar:          { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide:      { width: 86, justifyContent: 'center' },
  dropdownPillWrap:{ flex: 1, alignItems: 'center', justifyContent: 'center' },
  dropdownPill:    { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  dropdownPillText:{ fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
  rbacToggle:      { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  rbacToggleText:  { fontSize: 11, fontWeight: '700' },
  pillsRow:        { height: PILLS_H, borderTopWidth: StyleSheet.hairlineWidth },
  pillsContent:    { paddingHorizontal: 12, alignItems: 'center', gap: 8 },
  pill:            { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  pillText:        { fontSize: 13 },

  dropdown: {
    position: 'absolute', left: '50%' as any, marginLeft: -110, minWidth: 220,
    borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, zIndex: 99, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 12, elevation: 8,
  },
  dropdownOpt:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  dropdownOptText: { flex: 1, fontSize: 15, fontWeight: '600' },

  searchBar:   { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, gap: 8, marginBottom: 8 },
  searchInput: { flex: 1, height: 42, fontSize: 15 },

  countRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6, marginBottom: 4 },
  countText:   { fontSize: 12, fontWeight: '600' },
  countAction: { fontSize: 13, fontWeight: '600' },

  memberRow:        { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 4, borderRadius: 8 },
  memberAvatar:     { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  memberAvatarText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  memberInfo:       { flex: 1, gap: 3 },
  memberNameRow:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  memberName:       { fontSize: 15, fontWeight: '600', flexShrink: 1 },
  memberSubRow:     { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  memberRight:      { alignItems: 'flex-end', gap: 3 },
  statusDot:        { width: 8, height: 8, borderRadius: 4 },
  lastAttended:     { fontSize: 10 },
  rolePill:         { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  rolePillText:     { fontSize: 10, fontWeight: '700', color: '#fff' },
  deptChip:         { fontSize: 11 },
  newBadge:         { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
  newBadgeText:     { fontSize: 9, fontWeight: '800', color: '#fff' },
  checkbox:         { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: C.separator, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

  sectionHeader:     { paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: 2 },
  sectionHeaderText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  sectionLabel:      { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8, marginTop: 4 },
  tierLabel:         { fontSize: 13, fontWeight: '700', color: C.label, marginBottom: 4, paddingHorizontal: 4 },

  roleCard:       { borderRadius: 14, marginBottom: 10, overflow: 'hidden' },
  roleCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  roleColorDot:   { width: 12, height: 12, borderRadius: 6, flexShrink: 0 },
  roleName:       { fontSize: 15, fontWeight: '700' },
  roleDesc:       { fontSize: 12, marginTop: 1 },
  roleMemberCount:{ fontSize: 15, fontWeight: '700' },
  roleExpanded:   { borderTopWidth: StyleSheet.hairlineWidth },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard:  { flex: 1, minWidth: '44%', borderRadius: 12, padding: 12, alignItems: 'center' },
  statCardValue: { fontSize: 20, fontWeight: '800' },
  statCardLabel: { fontSize: 11, marginTop: 2 },

  chartBox:  { borderRadius: 14, padding: 16, marginBottom: 16 },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 120 },
  barWrapper:{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  barCount:  { fontSize: 9 },
  bar:       { width: '100%', borderRadius: 3, minHeight: 4 },
  barLabel:  { fontSize: 8 },

  alertCard: { borderRadius: 14, padding: 14, borderWidth: 1 },
  eventCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface, borderRadius: 12, padding: 14, marginBottom: 8 },
  eventName: { fontSize: 14, fontWeight: '600' },
  eventDate: { fontSize: 12, marginTop: 2 },
  checkInBtn:     { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  checkInBtnText: { fontSize: 13, fontWeight: '600' },

  streakCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 14, padding: 16, marginBottom: 16 },
  myAttRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },

  detailSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: DETAIL_H,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 12,
  },
  bulkBar:    { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  bulkCount:  { flex: 1, fontSize: 14, fontWeight: '600' },
  bulkAction: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
});
