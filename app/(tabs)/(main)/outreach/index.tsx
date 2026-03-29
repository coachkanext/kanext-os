/**
 * Community Outreach — Pipeline CRM, Campaigns, and Volunteer Serve.
 * Three tabs via centered dropdown pill.
 * RBAC: Admin (full management) ↔ Member (invite + volunteer tools).
 */

import React, {
  useState, useRef, useCallback, useMemo,
} from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  TextInput, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useAccentColor } from '@/hooks/use-accent-color';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter, hideFooter, showFooter } from '@/utils/global-footer-hide';
import {
  PROSPECTS, CAMPAIGNS, VOLUNTEER_TEAMS, OUTREACH_OPPORTUNITIES,
  MY_OUTREACH_STATS, INVITE_LEADERBOARD, PIPELINE_STAGES,
  MY_VOLUNTEER_TEAM_IDS,
  getStageCounts, getCampaignsByStatus, getCampaignTypeLabel,
  type Prospect, type ProspectStage, type CampaignStatus,
} from '@/data/mock-community-outreach';

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_BAR_H = 52;
const PILLS_H   = 48;
const DETAIL_H  = 560;

// ── Types ─────────────────────────────────────────────────────────────────────

type OutreachTab = 'Pipeline' | 'Campaigns' | 'Serve';

// ── Helpers ───────────────────────────────────────────────────────────────────

function pillsForTab(tab: OutreachTab, isAdmin: boolean): string[] {
  if (tab === 'Pipeline')
    return isAdmin ? ['All', 'Explorer', 'First Visit', 'Follow-Up Sent', 'Returned', 'Connected', 'Joined Group', 'Member', 'Inactive'] : [];
  if (tab === 'Campaigns')
    return isAdmin ? ['All', 'Active', 'Planning', 'Completed'] : ['Invite', 'Available', 'Leaderboard'];
  return isAdmin ? ['All', 'Teams', 'Opportunities'] : ['My Teams', 'Available', 'Impact'];
}

function stageColor(stage: ProspectStage): string {
  return PIPELINE_STAGES.find(s => s.stage === stage)?.color ?? '#999';
}

function sourceLabel(source: string): string {
  const map: Record<string, string> = {
    'walked-in': 'Walked in',
    invited: 'Invited by a member',
    online: 'Found us online',
    event: 'Community event',
    outreach: 'Outreach program',
    social: 'Social media',
    radio: 'Hotline to Heaven radio',
  };
  return map[source] ?? source;
}

function formatDate(d: string): string {
  const [, m, day] = d.split('-').map(Number);
  return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1]} ${day}`;
}

function isOverdue(dateStr: string): boolean {
  return dateStr < '2026-03-25';
}

function statusColor(status: CampaignStatus): string {
  if (status === 'active')    return '#5A8A6E';
  if (status === 'planning')  return '#1D9BF0';
  return 'rgba(45,30,18,0.40)';
}

function statusLabel(status: CampaignStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// ── ProspectRow ───────────────────────────────────────────────────────────────

function ProspectRow({ prospect, onPress, C, s }: {
  prospect: Prospect;
  onPress: (p: Prospect) => void;
  C: ComponentColors;
  s: ReturnType<typeof makeStyles>;
}) {
  const overdue = isOverdue(prospect.nextActionDue);
  return (
    <Pressable
      style={({ pressed }) => [s.prospectRow, pressed && { backgroundColor: C.surfacePressed }]}
      onPress={() => onPress(prospect)}
    >
      <View style={[s.prospectAvatar, { backgroundColor: `hsl(${prospect.hue},42%,32%)` }]}>
        <Text style={s.prospectAvatarText}>{prospect.initials}</Text>
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: C.label, flex: 1 }} numberOfLines={1}>
            {prospect.name}
          </Text>
          <View style={{
            paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
            backgroundColor: stageColor(prospect.stage) + '22',
            borderWidth: 1, borderColor: stageColor(prospect.stage),
          }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: stageColor(prospect.stage) }}>{prospect.stage}</Text>
          </View>
        </View>
        <Text style={{ fontSize: 12, color: overdue ? '#3B82F6' : C.muted }} numberOfLines={1}>
          {overdue ? '⚠ ' : ''}{prospect.nextAction} · {formatDate(prospect.nextActionDue)}
        </Text>
        <Text style={{ fontSize: 11, color: C.muted }} numberOfLines={1}>
          {prospect.visitCount} visit{prospect.visitCount !== 1 ? 's' : ''} · {prospect.assignedTo}
        </Text>
      </View>
    </Pressable>
  );
}

// ── ProspectDetailSheet ────────────────────────────────────────────────────────

function ProspectDetailSheet({ prospect, isAdmin, onClose, onMoveStage, C, insets }: {
  prospect: Prospect;
  isAdmin: boolean;
  onClose: () => void;
  onMoveStage: (stage: ProspectStage) => void;
  C: ComponentColors;
  insets: ReturnType<typeof useSafeAreaInsets>;
}) {
  const router = useRouter();

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

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginTop: 12, marginBottom: 16 }}>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: `hsl(${prospect.hue},42%,32%)`, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff' }}>{prospect.initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: C.label }}>{prospect.name}</Text>
          <Text style={{ fontSize: 13, color: C.secondary }}>
            {sourceLabel(prospect.source)} · {prospect.visitCount} visit{prospect.visitCount !== 1 ? 's' : ''}
          </Text>
          <View style={{
            marginTop: 4, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
            backgroundColor: stageColor(prospect.stage) + '22', borderWidth: 1, borderColor: stageColor(prospect.stage),
          }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: stageColor(prospect.stage) }}>{prospect.stage}</Text>
          </View>
        </View>
        <Pressable onPress={onClose} hitSlop={12}>
          <IconSymbol name="xmark.circle.fill" size={24} color={C.muted} />
        </Pressable>
      </View>

      {/* Quick actions */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        {([
          { icon: 'message.fill', label: 'Text', action: () => { onClose(); setTimeout(() => router.push('/(tabs)/(main)/messages' as any), 80); } },
          { icon: 'phone.fill',   label: 'Call',  action: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) },
          { icon: 'envelope.fill', label: 'Email', action: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) },
        ] as const).map(btn => (
          <Pressable
            key={btn.label}
            style={({ pressed }) => ({
              flex: 1, alignItems: 'center', paddingVertical: 12,
              backgroundColor: pressed ? C.surfacePressed : C.surface,
              borderRadius: 12, gap: 4,
            })}
            onPress={btn.action}
          >
            <IconSymbol name={btn.icon} size={20} color={C.accent} />
            <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary }}>{btn.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Contact */}
      {isAdmin && (
        <View style={{ backgroundColor: C.surface, borderRadius: 12, marginBottom: 14, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
            <IconSymbol name="phone" size={16} color={C.secondary} />
            <Text style={{ flex: 1, fontSize: 14, color: C.label }}>{prospect.phone}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, gap: 12 }}>
            <IconSymbol name="envelope" size={16} color={C.secondary} />
            <Text style={{ flex: 1, fontSize: 14, color: C.label }}>{prospect.email}</Text>
          </View>
        </View>
      )}

      {/* Stats row */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
        {([
          { label: 'First Visit', value: formatDate(prospect.firstVisit) },
          { label: 'Last Contact', value: formatDate(prospect.lastInteraction) },
          { label: 'Visits', value: prospect.visitCount.toString() },
        ] as const).map(stat => (
          <View key={stat.label} style={{ flex: 1, backgroundColor: C.surface, borderRadius: 10, padding: 10, alignItems: 'center' }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{stat.value}</Text>
            <Text style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* How they found ICCLA */}
      <View style={{ backgroundColor: C.surface, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>How They Found ICCLA</Text>
        <Text style={{ fontSize: 14, color: C.label }}>{prospect.heardAboutUs}</Text>
      </View>

      {/* Prayer request */}
      {prospect.prayerRequest && (
        <View style={{ backgroundColor: C.surface, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <IconSymbol name="heart.fill" size={13} color={C.accent} />
            <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Prayer Request</Text>
          </View>
          <Text style={{ fontSize: 14, color: C.label }}>{prospect.prayerRequest}</Text>
        </View>
      )}

      {/* Move stage (admin only) */}
      {isAdmin && (
        <View style={{ marginBottom: 14 }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Move to Stage</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {(PIPELINE_STAGES.map(s => s.stage)).map(stage => {
              const active = prospect.stage === stage;
              return (
                <Pressable
                  key={stage}
                  style={({ pressed }) => ({
                    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
                    backgroundColor: active ? stageColor(stage) : (pressed ? C.surfacePressed : C.surface),
                    borderWidth: 1, borderColor: active ? stageColor(stage) : C.separator,
                  })}
                  onPress={() => { Haptics.selectionAsync(); onMoveStage(stage); }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '600', color: active ? '#fff' : C.label }}>{stage}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* Interaction log */}
      <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
        Interaction Log
      </Text>
      {[...prospect.interactionLog].reverse().map((entry, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.accent, marginTop: 3 }} />
            {i < prospect.interactionLog.length - 1 && (
              <View style={{ width: 1, flex: 1, backgroundColor: C.separator, marginTop: 4 }} />
            )}
          </View>
          <View style={{ flex: 1, paddingBottom: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary }}>{entry.type.toUpperCase()}</Text>
              <Text style={{ fontSize: 11, color: C.muted }}>{formatDate(entry.date)}</Text>
            </View>
            <Text style={{ fontSize: 14, color: C.label, lineHeight: 20 }}>{entry.summary}</Text>
          </View>
        </View>
      ))}

      {/* Assigned to */}
      {isAdmin && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surface, borderRadius: 12, padding: 14, marginTop: 4 }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'hsl(120,42%,32%)', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#fff' }}>{prospect.assignedToInitials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: C.secondary, fontWeight: '600' }}>ASSIGNED TO</Text>
            <Text style={{ fontSize: 14, color: C.label, fontWeight: '600' }}>{prospect.assignedTo}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 11, color: C.secondary, fontWeight: '600' }}>NEXT ACTION</Text>
            <Text style={{ fontSize: 13, color: isOverdue(prospect.nextActionDue) ? '#3B82F6' : C.label }}>
              {formatDate(prospect.nextActionDue)}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// ── ConnectCardOverlay ────────────────────────────────────────────────────────

function ConnectCardOverlay({ onClose, C, insets }: {
  onClose: () => void;
  C: ComponentColors;
  insets: ReturnType<typeof useSafeAreaInsets>;
}) {
  const [name,   setName]   = useState('');
  const [phone,  setPhone]  = useState('');
  const [email,  setEmail]  = useState('');
  const [heard,  setHeard]  = useState('');
  const [prayer, setPrayer] = useState('');

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top bar */}
      <View style={{
        paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 12,
        backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
        flexDirection: 'row', alignItems: 'center', gap: 12,
      }}>
        <Pressable onPress={onClose} hitSlop={12}>
          <IconSymbol name="xmark" size={20} color={C.label} />
        </Pressable>
        <Text style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: C.label }}>Connect Card</Text>
        <Pressable
          style={{ backgroundColor: C.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}
          onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); onClose(); }}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Save</Text>
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Full Name *</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.separator, paddingHorizontal: 14, paddingVertical: 12 }}>
            <TextInput
              style={{ fontSize: 15, color: C.label }}
              placeholder="First and last name"
              placeholderTextColor={C.muted}
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        {/* Phone */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Phone</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.separator, paddingHorizontal: 14, paddingVertical: 12 }}>
            <TextInput
              style={{ fontSize: 15, color: C.label }}
              placeholder="(555) 000-0000"
              placeholderTextColor={C.muted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Email */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Email</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.separator, paddingHorizontal: 14, paddingVertical: 12 }}>
            <TextInput
              style={{ fontSize: 15, color: C.label }}
              placeholder="email@example.com"
              placeholderTextColor={C.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* How they heard */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>How did you hear about us?</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.separator, paddingHorizontal: 14, paddingVertical: 12 }}>
            <TextInput
              style={{ fontSize: 15, color: C.label }}
              placeholder="Invited by a friend, saw us online…"
              placeholderTextColor={C.muted}
              value={heard}
              onChangeText={setHeard}
            />
          </View>
        </View>

        {/* Prayer request */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Prayer Request (optional)</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.separator, paddingHorizontal: 14, paddingVertical: 12 }}>
            <TextInput
              style={{ fontSize: 15, color: C.label, minHeight: 80, textAlignVertical: 'top' }}
              placeholder="Share anything you'd like prayer for…"
              placeholderTextColor={C.muted}
              value={prayer}
              onChangeText={setPrayer}
              multiline
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function CommunityOutreachScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const accent = useAccentColor();

  const topBarH   = insets.top + TOP_BAR_H;
  const pillsAnim  = useRef(new Animated.Value(0)).current;
  const detailAnim = useRef(new Animated.Value(0)).current;

  const [isAdmin,            setIsAdmin]            = useState(true);
  const [activeTab,          setActiveTab]          = useState<OutreachTab>('Pipeline');
  const [dropdownOpen,       setDropdownOpen]       = useState(false);
  const [pillsVisible,       setPillsVisible]       = useState(false);
  const [selectedPill,       setSelectedPill]       = useState('All');
  const [expandedProspectId, setExpandedProspectId] = useState<string | null>(null);
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);
  const [expandedTeamId,     setExpandedTeamId]     = useState<string | null>(null);
  const [showConnectCard,    setShowConnectCard]    = useState(false);
  const [prospectStages,     setProspectStages]     = useState<Record<string, ProspectStage>>(
    () => Object.fromEntries(PROSPECTS.map(p => [p.id, p.stage]))
  );

  // Derived
  const pills = useMemo(() => pillsForTab(activeTab, isAdmin), [activeTab, isAdmin]);

  // Members are shown separately in "Recently Converted" — exclude from main list
  const pipelineProspects = useMemo(() => {
    if (!isAdmin) return [];
    const stage = (p: Prospect) => prospectStages[p.id] ?? p.stage;
    const nonMembers = PROSPECTS.filter(p => stage(p) !== 'Member');
    if (selectedPill === 'All' || selectedPill === 'Member') return nonMembers;
    return nonMembers.filter(p => stage(p) === (selectedPill as ProspectStage));
  }, [selectedPill, isAdmin, prospectStages]);

  const filteredProspects = pipelineProspects;

  const expandedProspect = useMemo(() =>
    expandedProspectId ? PROSPECTS.find(p => p.id === expandedProspectId) ?? null : null,
  [expandedProspectId]);

  // Footer scroll
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

  // Tab change
  const changeTab = useCallback((tab: OutreachTab) => {
    Haptics.selectionAsync();
    const newPills = pillsForTab(tab, isAdmin);
    setActiveTab(tab);
    setDropdownOpen(false);
    setSelectedPill(newPills[0] ?? 'All');
    setPillsVisible(false);
    pillsAnim.setValue(0);
    setExpandedCampaignId(null);
    setExpandedTeamId(null);
  }, [isAdmin, pillsAnim]);

  // Role toggle
  const handleRoleToggle = useCallback(() => {
    Haptics.selectionAsync();
    const newAdmin = !isAdmin;
    const newPills = pillsForTab(activeTab, newAdmin);
    setIsAdmin(newAdmin);
    setSelectedPill(newPills[0] ?? 'All');
    setPillsVisible(false);
    pillsAnim.setValue(0);
    setExpandedCampaignId(null);
    setExpandedTeamId(null);
  }, [isAdmin, activeTab, pillsAnim]);

  // Prospect detail
  const openProspect = useCallback((p: Prospect) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedProspectId(p.id);
    Animated.timing(detailAnim, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  }, [detailAnim]);

  const closeProspect = useCallback(() => {
    Animated.timing(detailAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start(() =>
      setExpandedProspectId(null)
    );
  }, [detailAnim]);

  const moveStage = useCallback((prospectId: string, stage: ProspectStage) => {
    Haptics.selectionAsync();
    setProspectStages(prev => ({ ...prev, [prospectId]: stage }));
  }, []);

  const contentPaddingTop = topBarH + (pillsVisible ? PILLS_H : 0) + 8;

  // ── Render functions ──────────────────────────────────────────────────────

  function renderPipelineAdmin() {
    const overrideCounts: Record<ProspectStage, number> = { 'First Visit': 0, Returned: 0, Connected: 0, Member: 0 };
    PROSPECTS.forEach(p => { overrideCounts[prospectStages[p.id] ?? p.stage]++; });

    return (
      <>
        {/* Funnel row — tap to filter, tap again to deselect */}
        <View style={s.funnelRow}>
          {PIPELINE_STAGES.map(ps => {
            const isActive = selectedPill === ps.stage;
            return (
              <Pressable
                key={ps.stage}
                style={[
                  s.funnelCell,
                  { borderColor: ps.color + (isActive ? 'CC' : '44'), backgroundColor: ps.color + (isActive ? '28' : '11') },
                  isActive && { borderWidth: 2 },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  // Toggle: tap active stage → back to All; tap another → filter to it
                  setSelectedPill(isActive ? 'All' : ps.stage);
                  // Close pills row if open (funnel cards are the filter UI here)
                  if (pillsVisible) {
                    setPillsVisible(false);
                    Animated.timing(pillsAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
                  }
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: '800', color: ps.color }}>{overrideCounts[ps.stage]}</Text>
                <Text style={{ fontSize: 9, fontWeight: '600', color: ps.color, textAlign: 'center' }} numberOfLines={2}>{ps.stage}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Separator */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: C.separator }} />
          <Text style={{ fontSize: 11, color: C.muted }}>
            {selectedPill === 'All' ? `${PROSPECTS.filter(p => (prospectStages[p.id] ?? p.stage) !== 'Member').length} in pipeline` : `${pipelineProspects.length} prospects`}
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: C.separator }} />
        </View>

        {/* Needs Follow-Up section (overdue items sorted to top) */}
        {(() => {
          const overdue  = pipelineProspects.filter(p => isOverdue(p.nextActionDue));
          const current  = pipelineProspects.filter(p => !isOverdue(p.nextActionDue));
          const members  = selectedPill === 'All' || selectedPill === 'Member'
            ? PROSPECTS.filter(p => (prospectStages[p.id] ?? p.stage) === 'Member')
            : [];

          return (
            <>
              {overdue.length > 0 && (
                <>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <IconSymbol name="exclamationmark.triangle.fill" size={13} color="#3B82F6" />
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#3B82F6', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Needs Follow-Up ({overdue.length})
                    </Text>
                  </View>
                  <View style={{ backgroundColor: '#3B82F608', borderRadius: 12, borderWidth: 1, borderColor: '#3B82F622', marginBottom: 16, overflow: 'hidden' }}>
                    {overdue.map(p => (
                      <ProspectRow
                        key={p.id}
                        prospect={{ ...p, stage: prospectStages[p.id] ?? p.stage }}
                        onPress={openProspect}
                        C={C}
                        s={s}
                      />
                    ))}
                  </View>
                </>
              )}

              {current.length === 0 && overdue.length === 0 && (
                <Text style={{ fontSize: 14, color: C.muted, textAlign: 'center', marginTop: 8 }}>No prospects at this stage.</Text>
              )}
              {current.map(p => (
                <ProspectRow
                  key={p.id}
                  prospect={{ ...p, stage: prospectStages[p.id] ?? p.stage }}
                  onPress={openProspect}
                  C={C}
                  s={s}
                />
              ))}

              {/* Recently Converted win board */}
              {members.length > 0 && (
                <>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24, marginBottom: 10 }}>
                    <IconSymbol name="checkmark.seal.fill" size={14} color="#5A8A6E" />
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#5A8A6E', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Recently Converted
                    </Text>
                  </View>
                  {members.map(p => (
                    <View
                      key={p.id}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#5A8A6E11', borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#5A8A6E22' }}
                    >
                      <View style={[s.prospectAvatar, { backgroundColor: `hsl(${p.hue},42%,32%)` }]}>
                        <Text style={s.prospectAvatarText}>{p.initials}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, fontWeight: '600', color: C.label }}>{p.name}</Text>
                        <Text style={{ fontSize: 12, color: '#5A8A6E' }}>
                          {p.visitCount} visits · Joined {formatDate(p.lastInteraction)}
                        </Text>
                      </View>
                      <IconSymbol name="checkmark.circle.fill" size={22} color="#5A8A6E" />
                    </View>
                  ))}
                </>
              )}
            </>
          );
        })()}

        <View style={{ height: 80 }} />
      </>
    );
  }

  function renderPipelineMember() {
    return (
      <>
        <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 20, marginTop: 8, alignItems: 'center', gap: 10 }}>
          <IconSymbol name="lock.fill" size={28} color={C.muted} />
          <Text style={{ fontSize: 15, fontWeight: '600', color: C.label }}>Pipeline is admin-only</Text>
          <Text style={{ fontSize: 13, color: C.secondary, textAlign: 'center', lineHeight: 18 }}>
            Only pastors and designated leaders can view and manage the visitor pipeline.
          </Text>
        </View>

        <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 24, marginBottom: 10 }}>
          My Invite Impact
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {([
            { label: 'Invited',  value: MY_OUTREACH_STATS.invitesSent },
            { label: 'Visited',  value: MY_OUTREACH_STATS.visited },
            { label: 'Joined',   value: MY_OUTREACH_STATS.joined },
          ] as const).map(stat => (
            <View key={stat.label} style={{ flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: C.label }}>{stat.value}</Text>
              <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>{stat.label}</Text>
            </View>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </>
    );
  }

  function renderCampaignsAdmin() {
    const filterStatus = selectedPill === 'All' ? 'all' : selectedPill.toLowerCase() as 'active' | 'planning' | 'completed';
    const visible = getCampaignsByStatus(filterStatus);
    const activeCampaigns  = CAMPAIGNS.filter(c => c.status === 'active');
    const totalReached     = CAMPAIGNS.reduce((sum, c) => sum + c.actualReach, 0);
    const totalConverted   = CAMPAIGNS.reduce((sum, c) => sum + c.actualConvert, 0);
    const totalVolNeeded   = activeCampaigns.reduce((sum, c) => sum + c.volunteersNeeded, 0);
    const totalVolJoined   = activeCampaigns.reduce((sum, c) => sum + c.volunteersJoined, 0);
    const volGapCampaigns  = activeCampaigns.filter(c => c.volunteersJoined < c.volunteersNeeded);
    const showImpact       = selectedPill === 'All' || selectedPill === 'Completed';

    return (
      <>
        {/* Stats summary — horizontal scroll */}
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingBottom: 16 }}
          style={{ marginHorizontal: -16, paddingHorizontal: 16 }}
        >
          {([
            { label: 'Active',        value: activeCampaigns.length.toString(), color: '#5A8A6E' },
            { label: 'Total Reached', value: totalReached.toLocaleString(),     color: '#1D9BF0' },
            { label: 'Conversions',   value: totalConverted.toString(),         color: '#5A8A6E' },
            { label: 'Volunteers',    value: `${totalVolJoined}/${totalVolNeeded}`, color: C.accent },
            { label: 'Campaigns',     value: CAMPAIGNS.length.toString(),       color: C.secondary },
          ] as const).map(stat => (
            <View key={stat.label} style={{ backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center', minWidth: 80, gap: 2 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: stat.color }}>{stat.value}</Text>
              <Text style={{ fontSize: 10, color: C.muted, textAlign: 'center' }}>{stat.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Campaign cards */}
        {visible.map(campaign => {
          const isExpanded = expandedCampaignId === campaign.id;
          const reachPct   = campaign.goalReach   > 0 ? Math.min(100, Math.round(campaign.actualReach   / campaign.goalReach   * 100)) : 0;
          const convertPct = campaign.goalConvert > 0 ? Math.min(100, Math.round(campaign.actualConvert / campaign.goalConvert * 100)) : 0;
          const volGap     = campaign.volunteersNeeded - campaign.volunteersJoined;

          return (
            <View key={campaign.id} style={[s.campaignCard, { backgroundColor: C.surface }]}>
              <Pressable
                style={({ pressed }) => [s.campaignHeader, pressed && { backgroundColor: C.surfacePressed }]}
                onPress={() => { Haptics.selectionAsync(); setExpandedCampaignId(isExpanded ? null : campaign.id); }}
              >
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, flex: 1 }} numberOfLines={1}>{campaign.name}</Text>
                    <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: statusColor(campaign.status) + '22' }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: statusColor(campaign.status) }}>{statusLabel(campaign.status)}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ backgroundColor: C.surfacePressed, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                      <Text style={{ fontSize: 10, color: C.secondary }}>{getCampaignTypeLabel(campaign.type)}</Text>
                    </View>
                    <Text style={{ fontSize: 11, color: C.muted }}>
                      {formatDate(campaign.startDate)} – {formatDate(campaign.endDate)}
                    </Text>
                  </View>
                  {/* Inline metrics */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 2 }}>
                    <Text style={{ fontSize: 11, color: C.secondary }}>
                      <Text style={{ fontWeight: '700', color: '#1D9BF0' }}>{campaign.actualReach}</Text>
                      {'/' + campaign.goalReach + ' reached'}
                    </Text>
                    <Text style={{ fontSize: 11, color: C.secondary }}>
                      <Text style={{ fontWeight: '700', color: '#5A8A6E' }}>{campaign.actualConvert}</Text>
                      {'/' + campaign.goalConvert + ' conv'}
                    </Text>
                    {volGap > 0 && (
                      <View style={{ backgroundColor: '#3B82F622', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: '#3B82F6' }}>{volGap} vol needed</Text>
                      </View>
                    )}
                  </View>
                </View>
                <IconSymbol name={isExpanded ? 'chevron.up' : 'chevron.down'} size={14} color={C.muted} />
              </Pressable>

              {isExpanded && (
                <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator, padding: 16, gap: 12 }}>
                  <Text style={{ fontSize: 13, color: C.secondary, lineHeight: 18 }}>{campaign.description}</Text>

                  {/* Progress bars */}
                  {([
                    { label: `Reach: ${campaign.actualReach} / ${campaign.goalReach}`, pct: reachPct, color: '#1D9BF0' },
                    { label: `Convert: ${campaign.actualConvert} / ${campaign.goalConvert}`, pct: convertPct, color: '#5A8A6E' },
                  ] as const).map(prog => (
                    <View key={prog.label}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ fontSize: 12, color: C.secondary }}>{prog.label}</Text>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: prog.color }}>{prog.pct}%</Text>
                      </View>
                      <View style={{ height: 6, borderRadius: 3, backgroundColor: C.separator }}>
                        <View style={{ height: 6, borderRadius: 3, backgroundColor: prog.color, width: `${prog.pct}%` as any }} />
                      </View>
                    </View>
                  ))}

                  {/* Volunteers */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <IconSymbol name="person.2.fill" size={14} color={C.secondary} />
                    <Text style={{ fontSize: 13, color: C.secondary }}>
                      Volunteers: <Text style={{ fontWeight: '700', color: C.label }}>{campaign.volunteersJoined} / {campaign.volunteersNeeded}</Text>
                    </Text>
                    {volGap > 0 && (
                      <View style={{ backgroundColor: '#3B82F622', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: '#3B82F6' }}>{volGap} needed</Text>
                      </View>
                    )}
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <IconSymbol name="dollarsign.circle.fill" size={14} color={C.secondary} />
                    <Text style={{ fontSize: 13, color: C.secondary }}>
                      Budget: <Text style={{ fontWeight: '700', color: C.label }}>${campaign.budget.toLocaleString()}</Text>
                    </Text>
                  </View>

                  <Text style={{ fontSize: 12, color: C.muted }}>Target: {campaign.targetAudience}</Text>

                  {/* Quick actions */}
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                    {(['Edit', 'Share', 'Duplicate'] as const).map(action => (
                      <Pressable
                        key={action}
                        style={({ pressed }) => ({
                          flex: 1, alignItems: 'center', paddingVertical: 8,
                          backgroundColor: pressed ? C.surfacePressed : C.bg,
                          borderRadius: 8, borderWidth: 1, borderColor: C.separator,
                        })}
                        onPress={() => Haptics.selectionAsync()}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '600', color: C.label }}>{action}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {/* Campaign Impact section */}
        {showImpact && (
          <>
            <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 24, marginBottom: 12 }}>
              Campaign Impact
            </Text>
            <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, gap: 14, marginBottom: 10 }}>
              {/* Totals row */}
              <View style={{ flexDirection: 'row' }}>
                {([
                  { label: 'Reached',    value: totalReached,   color: '#1D9BF0' },
                  { label: 'Converted',  value: totalConverted, color: '#5A8A6E' },
                  { label: 'Campaigns',  value: CAMPAIGNS.length, color: C.accent },
                ] as const).map((item, i) => (
                  <View key={item.label} style={{
                    flex: 1, alignItems: 'center',
                    borderRightWidth: i < 2 ? StyleSheet.hairlineWidth : 0, borderRightColor: C.separator,
                  }}>
                    <Text style={{ fontSize: 22, fontWeight: '800', color: item.color }}>{item.value.toLocaleString()}</Text>
                    <Text style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{item.label}</Text>
                  </View>
                ))}
              </View>
              {/* Conversion rate */}
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 12, color: C.secondary }}>Overall Reach → Conversion</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#5A8A6E' }}>
                    {totalReached > 0 ? Math.round((totalConverted / totalReached) * 100) : 0}%
                  </Text>
                </View>
                <View style={{ height: 6, borderRadius: 3, backgroundColor: C.separator }}>
                  <View style={{
                    height: 6, borderRadius: 3, backgroundColor: '#5A8A6E',
                    width: `${totalReached > 0 ? Math.min(100, Math.round((totalConverted / totalReached) * 100)) : 0}%` as any,
                  }} />
                </View>
              </View>
              {/* Top campaign */}
              {(() => {
                const top = [...CAMPAIGNS].sort((a, b) => b.actualReach - a.actualReach)[0];
                return top ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <IconSymbol name="star.fill" size={14} color={C.accent} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, color: C.secondary }}>Top Campaign by Reach</Text>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{top.name}</Text>
                    </View>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#1D9BF0' }}>{top.actualReach.toLocaleString()}</Text>
                  </View>
                ) : null;
              })()}
            </View>
          </>
        )}

        {/* Volunteer gap prompts */}
        {volGapCampaigns.length > 0 && selectedPill !== 'Completed' && (
          <>
            <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 16, marginBottom: 10 }}>
              Volunteer Gaps
            </Text>
            {volGapCampaigns.map(campaign => (
              <View key={`gap-${campaign.id}`} style={{
                backgroundColor: '#3B82F611', borderRadius: 12,
                borderWidth: 1, borderColor: '#3B82F630',
                padding: 14, marginBottom: 8,
                flexDirection: 'row', alignItems: 'center', gap: 12,
              }}>
                <IconSymbol name="person.badge.plus" size={18} color="#3B82F6" />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }} numberOfLines={1}>{campaign.name}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>
                    Needs {campaign.volunteersNeeded - campaign.volunteersJoined} more volunteer{campaign.volunteersNeeded - campaign.volunteersJoined !== 1 ? 's' : ''}
                  </Text>
                </View>
                <Pressable
                  style={{ backgroundColor: C.accent, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 }}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>Recruit</Text>
                </Pressable>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 80 }} />
      </>
    );
  }

  function renderCampaignsMember() {
    if (selectedPill === 'Invite') {
      return (
        <>
          <View style={[s.inviteCard, { backgroundColor: C.accent }]}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5 }}>YOUR INVITE LINK</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff', marginTop: 6 }}>{MY_OUTREACH_STATS.personalLink}</Text>
            <Pressable
              style={{ marginTop: 14, backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>Copy Link</Text>
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            {([
              { label: 'Sent',    value: MY_OUTREACH_STATS.invitesSent },
              { label: 'Visited', value: MY_OUTREACH_STATS.visited },
              { label: 'Joined',  value: MY_OUTREACH_STATS.joined },
              { label: 'Hours',   value: MY_OUTREACH_STATS.hoursServed },
            ] as const).map(stat => (
              <View key={stat.label} style={{ flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: C.label }}>{stat.value}</Text>
                <Text style={{ fontSize: 10, color: C.secondary, marginTop: 2 }}>{stat.label}</Text>
              </View>
            ))}
          </View>
          <View style={{ height: 40 }} />
        </>
      );
    }

    if (selectedPill === 'Available') {
      return (
        <>
          <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 14, lineHeight: 18 }}>
            Join an active campaign and invite people in your network.
          </Text>
          {getCampaignsByStatus('active').map(campaign => (
            <View key={campaign.id} style={[s.campaignCard, { backgroundColor: C.surface }]}>
              <View style={{ padding: 16, gap: 8 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{campaign.name}</Text>
                <Text style={{ fontSize: 13, color: C.secondary, lineHeight: 18 }}>{campaign.description}</Text>
                <Pressable
                  style={{ backgroundColor: C.accent, borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginTop: 4 }}
                  onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
                >
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Join Campaign</Text>
                </Pressable>
              </View>
            </View>
          ))}
          <View style={{ height: 40 }} />
        </>
      );
    }

    // Leaderboard
    return (
      <>
        <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
          Invite Leaderboard
        </Text>
        {INVITE_LEADERBOARD.map(entry => (
          <View
            key={entry.rank}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 12,
              paddingVertical: 10, paddingHorizontal: 4, borderRadius: 10,
              backgroundColor: entry.isMe ? C.accent + '11' : 'transparent',
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '800', color: entry.rank <= 3 ? C.accent : C.muted, width: 24, textAlign: 'center' }}>
              {entry.rank}
            </Text>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: `hsl(${entry.hue},42%,32%)`, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#fff' }}>{entry.initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: entry.isMe ? '700' : '600', color: C.label }}>
                {entry.name}{entry.isMe ? ' (you)' : ''}
              </Text>
              <Text style={{ fontSize: 12, color: C.secondary }}>{entry.invitesSent} sent · {entry.visited} visited</Text>
            </View>
          </View>
        ))}
        <View style={{ height: 40 }} />
      </>
    );
  }

  function renderServeAdmin() {
    const showTeams = selectedPill === 'All' || selectedPill === 'Teams';
    const showOpps  = selectedPill === 'All' || selectedPill === 'Opportunities';

    return (
      <>
        {showTeams && (
          <>
            <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
              Volunteer Teams
            </Text>
            {VOLUNTEER_TEAMS.map(team => {
              const isExpanded = expandedTeamId === team.id;
              return (
                <View key={team.id} style={[s.teamCard, { backgroundColor: C.surface }]}>
                  <Pressable
                    style={({ pressed }) => [s.teamHeader, pressed && { backgroundColor: C.surfacePressed }]}
                    onPress={() => { Haptics.selectionAsync(); setExpandedTeamId(isExpanded ? null : team.id); }}
                  >
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: accent + '33', alignItems: 'center', justifyContent: 'center' }}>
                      <IconSymbol name="person.2.fill" size={16} color={accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{team.name}</Text>
                      <Text style={{ fontSize: 12, color: C.secondary }}>Led by {team.leadName} · {team.memberCount} members</Text>
                    </View>
                    <Text style={{ fontSize: 12, color: C.muted, marginRight: 6 }}>{team.hoursTotal}h total</Text>
                    <IconSymbol name={isExpanded ? 'chevron.up' : 'chevron.down'} size={14} color={C.muted} />
                  </Pressable>
                  {isExpanded && (
                    <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator, padding: 14, gap: 10 }}>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                        {team.memberNames.map(n => (
                          <View key={n} style={{ backgroundColor: C.surfacePressed, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}>
                            <Text style={{ fontSize: 12, color: C.label }}>{n}</Text>
                          </View>
                        ))}
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <IconSymbol name="calendar" size={13} color={C.secondary} />
                        <Text style={{ fontSize: 12, color: C.secondary }}>
                          Next: {team.nextAssignment} on {formatDate(team.nextAssignmentDate)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}

        {showOpps && (
          <>
            <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: showTeams ? 20 : 0 }}>
              Opportunities
            </Text>
            {OUTREACH_OPPORTUNITIES.map(opp => (
              <View key={opp.id} style={{ backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 10, gap: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{opp.title}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{opp.teamName} · {opp.timeCommitment}</Text>
                  </View>
                  <View style={{
                    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
                    backgroundColor: opp.slotsFilled < opp.slotsTotal ? '#5A8A6E22' : '#B85C5C22',
                  }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: opp.slotsFilled < opp.slotsTotal ? '#5A8A6E' : '#B85C5C' }}>
                      {opp.slotsFilled}/{opp.slotsTotal}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: C.secondary, lineHeight: 18 }}>{opp.description}</Text>
                <Text style={{ fontSize: 12, color: C.muted }}>Date: {formatDate(opp.date)}</Text>
              </View>
            ))}
          </>
        )}
        <View style={{ height: 80 }} />
      </>
    );
  }

  function renderServeMember() {
    if (selectedPill === 'My Teams') {
      const myTeams = VOLUNTEER_TEAMS.filter(t => MY_VOLUNTEER_TEAM_IDS.includes(t.id));
      if (myTeams.length === 0) {
        return (
          <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 20, alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: C.label }}>Not on any teams yet</Text>
            <Text style={{ fontSize: 13, color: C.secondary, textAlign: 'center' }}>Browse Available to join a volunteer team.</Text>
          </View>
        );
      }
      return (
        <>
          {myTeams.map(team => (
            <View key={team.id} style={[s.teamCard, { backgroundColor: C.surface }]}>
              <View style={s.teamHeader}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: accent + '33', alignItems: 'center', justifyContent: 'center' }}>
                  <IconSymbol name="person.2.fill" size={16} color={accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{team.name}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>Led by {team.leadName}</Text>
                </View>
              </View>
              <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator, paddingHorizontal: 14, paddingVertical: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <IconSymbol name="calendar" size={13} color={C.secondary} />
                  <Text style={{ fontSize: 13, color: C.label }}>
                    {team.nextAssignment} · {formatDate(team.nextAssignmentDate)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
          <View style={{ height: 40 }} />
        </>
      );
    }

    if (selectedPill === 'Available') {
      const available = OUTREACH_OPPORTUNITIES.filter(o => o.slotsFilled < o.slotsTotal);
      return (
        <>
          {available.map(opp => (
            <View key={opp.id} style={{ backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 10, gap: 6 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{opp.title}</Text>
              <Text style={{ fontSize: 12, color: C.secondary }}>{opp.teamName} · {opp.timeCommitment}</Text>
              <Text style={{ fontSize: 13, color: C.secondary, lineHeight: 18 }}>{opp.description}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                <Text style={{ fontSize: 12, color: C.muted }}>
                  {formatDate(opp.date)} · {opp.slotsTotal - opp.slotsFilled} spots open
                </Text>
                <Pressable
                  style={{ backgroundColor: accent, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 }}
                  onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>Sign Up</Text>
                </Pressable>
              </View>
            </View>
          ))}
          <View style={{ height: 40 }} />
        </>
      );
    }

    // Impact
    return (
      <>
        <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
          My Impact
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          {([
            { label: 'Invites Sent',   value: MY_OUTREACH_STATS.invitesSent,    icon: 'person.badge.plus' },
            { label: 'People Visited', value: MY_OUTREACH_STATS.visited,        icon: 'figure.walk' },
            { label: 'Joined Church',  value: MY_OUTREACH_STATS.joined,         icon: 'checkmark.seal.fill' },
            { label: 'Hours Served',   value: MY_OUTREACH_STATS.hoursServed,    icon: 'clock.fill' },
            { label: 'Teams',          value: MY_OUTREACH_STATS.teamsJoined,    icon: 'person.2.fill' },
            { label: 'Events',         value: MY_OUTREACH_STATS.eventsAttended, icon: 'star.fill' },
          ] as const).map(stat => (
            <View key={stat.label} style={{ width: '47%', backgroundColor: C.surface, borderRadius: 12, padding: 14, alignItems: 'center', gap: 4 }}>
              <IconSymbol name={stat.icon} size={20} color={accent} />
              <Text style={{ fontSize: 22, fontWeight: '800', color: C.label }}>{stat.value}</Text>
              <Text style={{ fontSize: 11, color: C.secondary, textAlign: 'center' }}>{stat.label}</Text>
            </View>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </>
    );
  }

  function renderContent() {
    if (activeTab === 'Pipeline')  return isAdmin ? renderPipelineAdmin()  : renderPipelineMember();
    if (activeTab === 'Campaigns') return isAdmin ? renderCampaignsAdmin() : renderCampaignsMember();
    return isAdmin ? renderServeAdmin() : renderServeMember();
  }

  // ── Layout ───────────────────────────────────────────────────────────────

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
        {renderContent()}
      </ScrollView>

      {/* Connect card FAB (pipeline admin only) */}
      {isAdmin && activeTab === 'Pipeline' && (
        <Pressable
          style={[s.fab, { bottom: insets.bottom + 80 }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowConnectCard(true); }}
        >
          <IconSymbol name="person.badge.plus" size={20} color="#fff" />
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Connect Card</Text>
        </Pressable>
      )}

      {/* Create Campaign FAB (campaigns admin only) */}
      {isAdmin && activeTab === 'Campaigns' && (
        <Pressable
          style={[s.fab, { bottom: insets.bottom + 80 }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <IconSymbol name="plus" size={20} color="#fff" />
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>New Campaign</Text>
        </Pressable>
      )}

      {/* Absolute top bar */}
      <View style={[s.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg }]}>
        <View style={s.topBar}>
          {/* Left: hamburger (admin) */}
          <View style={s.topBarSide}>
            {isAdmin && (
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
                hitSlop={12}
              >
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

          {/* Right: filter icon */}
          <View style={[s.topBarSide, { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }]}>
            {pills.length > 0 && (
              <Pressable onPress={togglePills} hitSlop={12}>
                <IconSymbol
                  name={pillsVisible || selectedPill !== pills[0] ? 'line.3.horizontal.decrease.circle.fill' : 'line.3.horizontal.decrease.circle'}
                  size={22}
                  color={pillsVisible || selectedPill !== pills[0] ? C.accent : C.label}
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

      {/* Dropdown overlay */}
      {dropdownOpen && (
        <>
          <Pressable
            style={{ ...StyleSheet.absoluteFillObject, zIndex: 98 } as any}
            onPress={() => setDropdownOpen(false)}
          />
          <View style={[s.dropdown, { backgroundColor: C.surface, borderColor: C.separator, top: insets.top + TOP_BAR_H }]}>
            {(['Pipeline', 'Campaigns', 'Serve'] as OutreachTab[]).map(tab => (
              <Pressable
                key={tab}
                style={({ pressed }) => [
                  s.dropdownOpt, { borderBottomColor: C.separator },
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

      {/* Prospect detail sheet */}
      {expandedProspectId && (
        <>
          <Animated.View
            style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 49, opacity: detailAnim } as any}
          >
            <Pressable style={{ flex: 1 }} onPress={closeProspect} />
          </Animated.View>
          <Animated.View
            style={[s.detailSheet, {
              backgroundColor: C.bg, zIndex: 50,
              transform: [{ translateY: detailAnim.interpolate({ inputRange: [0, 1], outputRange: [DETAIL_H, 0] }) }],
            }]}
          >
            {expandedProspect && (
              <ProspectDetailSheet
                prospect={{ ...expandedProspect, stage: prospectStages[expandedProspect.id] ?? expandedProspect.stage }}
                isAdmin={isAdmin}
                onClose={closeProspect}
                onMoveStage={(stage) => moveStage(expandedProspect.id, stage)}
                C={C}
                insets={insets}
              />
            )}
          </Animated.View>
        </>
      )}

      {/* Connect card overlay */}
      {showConnectCard && (
        <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 60 } as any}>
          <ConnectCardOverlay onClose={() => setShowConnectCard(false)} C={C} insets={insets} />
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

  prospectRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 4, borderRadius: 10 },
  prospectAvatar:  { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  prospectAvatarText: { fontSize: 13, fontWeight: '800', color: '#fff' },

  funnelRow:     { flexDirection: 'row', gap: 8, marginBottom: 12 },
  funnelCell:    { flex: 1, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, borderRadius: 12, borderWidth: 1, gap: 4 },

  campaignCard:   { borderRadius: 14, marginBottom: 10, overflow: 'hidden' },
  campaignHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },

  teamCard:   { borderRadius: 14, marginBottom: 10, overflow: 'hidden' },
  teamHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },

  inviteCard: { borderRadius: 14, padding: 20 },

  detailSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: DETAIL_H,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 12,
  },

  fab: {
    position: 'absolute', right: 20,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 18, paddingVertical: 12, borderRadius: 28,
    backgroundColor: C.accent,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18, shadowRadius: 8, elevation: 6,
  },
});
