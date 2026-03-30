/**
 * Personal Network — Community fabric for your creator audience.
 * Not a follower list (Social handles that). This is where your audience
 * becomes a community — Discord + Patreon, natively.
 *
 * Three views: Community / Spaces / Connect.
 * Centered dropdown pill. Filter icon top-right toggles pill row.
 * Side panel via menu icon (owner) or swipe right.
 * RBAC: Owner / Member / Visitor.
 */

import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View, Text, Pressable, ScrollView, TextInput, FlatList,
  StyleSheet, Animated, useWindowDimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { resetFooter, hideFooter, showFooter } from '@/utils/global-footer-hide';
import { openSidePanel } from '@/utils/global-side-panel';
import {
  COMMUNITY_TIERS, COMMUNITY_SPACES, COMMUNITY_MEMBERS,
  LOOKING_FOR_POSTS, ICEBREAKER_PROMPT, COMMUNITY_EVENTS, COMMUNITY_STATS,
  getMembersByTier, getMemberById, getTierById, searchMembers,
  isNewThisWeek, formatJoinDate, formatLastActive, formatEventDate, formatPostAge,
  type CommunityMember, type CommunitySpace, type CommunityEvent,
} from '@/data/mock-creator-community';

// ── Constants ──────────────────────────────────────────────────────────────────

type Tab  = 'Community' | 'Spaces' | 'Connect';
type Role = 'owner' | 'member' | 'visitor';

const TOP_BAR_H  = 52;
const PILL_ROW_H = 48;

const PILLS: Record<Tab, string[]> = {
  Community: ['All', 'Free Community', 'Supporters', 'Inner Circle', 'Online Now', 'New This Week'],
  Spaces:    ['All', 'My Spaces', 'Public', 'Tier-Locked'],
  Connect:   ['All', 'Entrepreneurship', 'Fitness', 'Coding', 'Looking For'],
};

// ── Small helpers ──────────────────────────────────────────────────────────────

function Avatar({ initials, hue, size = 40 }: { initials: string; hue: number; size?: number }) {
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: `hsl(${hue},35%,75%)`,
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Text style={{ fontSize: size * 0.35, fontWeight: '700', color: `hsl(${hue},40%,30%)` }}>
        {initials}
      </Text>
    </View>
  );
}

function TierBadge({ tierId, C }: { tierId: string; C: ComponentColors }) {
  const tier = getTierById(tierId);
  if (!tier) return null;
  return (
    <View style={{
      paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8,
      backgroundColor: tier.color + '18',
    }}>
      <Text style={{ fontSize: 10, fontWeight: '600', color: tier.color }}>{tier.name}</Text>
    </View>
  );
}

function OnlineDot({ isOnline }: { isOnline: boolean }) {
  if (!isOnline) return null;
  return (
    <View style={{
      width: 8, height: 8, borderRadius: 4,
      backgroundColor: '#5A8A6E', borderWidth: 1.5, borderColor: '#fff',
    }} />
  );
}

// ── Member Row ─────────────────────────────────────────────────────────────────

function MemberRow({
  member, C, isOwner, introduceMode, isIntroduceSource, onPress, onIntroduce,
}: {
  member: CommunityMember;
  C: ComponentColors;
  isOwner: boolean;
  introduceMode: boolean;
  isIntroduceSource: boolean;
  onPress: (m: CommunityMember) => void;
  onIntroduce?: (m: CommunityMember) => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => ({
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingHorizontal: 16, paddingVertical: 12,
        backgroundColor: pressed ? C.surfacePressed : 'transparent',
        borderLeftWidth: introduceMode && isIntroduceSource ? 3 : 0,
        borderLeftColor: C.accent,
      })}
      onPress={() => onPress(member)}
    >
      <View style={{ position: 'relative' }}>
        <Avatar initials={member.initials} hue={member.avatarHue} size={42} />
        {member.isOnline && (
          <View style={{ position: 'absolute', bottom: 0, right: 0 }}>
            <OnlineDot isOnline />
          </View>
        )}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }} numberOfLines={1}>{member.name}</Text>
          {isNewThisWeek(member.joinDate) && (
            <View style={{ paddingHorizontal: 5, paddingVertical: 1, borderRadius: 6, backgroundColor: '#5A8A6E' + '22' }}>
              <Text style={{ fontSize: 9, fontWeight: '700', color: '#5A8A6E' }}>NEW</Text>
            </View>
          )}
        </View>
        <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }} numberOfLines={1}>
          {member.handle} · {member.location}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Text style={{ fontSize: 11, color: C.muted }}>{formatJoinDate(member.joinDate)}</Text>
        {introduceMode && onIntroduce ? (
          <Pressable
            style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: C.accent }}
            onPress={() => onIntroduce(member)}
          >
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#fff' }}>
              {isIntroduceSource ? 'Selected' : 'Pair'}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

// ── Space Card ─────────────────────────────────────────────────────────────────

function SpaceCard({
  space, C, role, onPress,
}: {
  space: CommunitySpace;
  C: ComponentColors;
  role: Role;
  onPress: (s: CommunitySpace) => void;
}) {
  const tier = space.tierId ? getTierById(space.tierId) : null;
  const isLocked = role === 'visitor' && space.tierId !== 'free' && space.tierId !== null;
  const isMySpace = role === 'member' && space.tierId === 'supporters'; // demo: user is a Supporter

  return (
    <Pressable
      style={({ pressed }) => ({
        flexDirection: 'row', alignItems: 'center', gap: 14,
        paddingHorizontal: 16, paddingVertical: 14,
        backgroundColor: pressed ? C.surfacePressed : 'transparent',
        opacity: isLocked ? 0.55 : 1,
      })}
      onPress={() => onPress(space)}
    >
      {/* Icon squircle */}
      <View style={{
        width: 44, height: 44, borderRadius: 12,
        backgroundColor: tier ? tier.color + '20' : C.surfacePressed,
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <IconSymbol name={space.icon as any} size={20} color={tier?.color ?? C.secondary} />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: C.label }} numberOfLines={1}>{space.name}</Text>
          {isLocked && <IconSymbol name="lock.fill" size={12} color={C.muted} />}
          {space.isCustom && (
            <View style={{ paddingHorizontal: 5, paddingVertical: 1, borderRadius: 6, backgroundColor: C.surfacePressed }}>
              <Text style={{ fontSize: 9, fontWeight: '600', color: C.secondary }}>CUSTOM</Text>
            </View>
          )}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
          {tier && <TierBadge tierId={tier.id} C={C} />}
          <Text style={{ fontSize: 12, color: C.muted }}>{space.memberCount} members</Text>
          <Text style={{ fontSize: 12, color: C.muted }}>· {formatLastActive(space.lastActive)}</Text>
        </View>
      </View>

      {space.unreadCount > 0 && !isLocked ? (
        <View style={{
          minWidth: 20, height: 20, borderRadius: 10,
          backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
        }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>{space.unreadCount}</Text>
        </View>
      ) : (
        <IconSymbol name="chevron.right" size={16} color={C.muted} />
      )}
    </Pressable>
  );
}

// ── Connect Member Card ────────────────────────────────────────────────────────

function ConnectCard({ member, C, onPress }: { member: CommunityMember; C: ComponentColors; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => ({
        flex: 1, backgroundColor: pressed ? C.surfacePressed : C.surface,
        borderRadius: 14, padding: 14, gap: 10, minWidth: 0,
        borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator,
      })}
      onPress={onPress}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ position: 'relative' }}>
          <Avatar initials={member.initials} hue={member.avatarHue} size={36} />
          {member.isOnline && (
            <View style={{ position: 'absolute', bottom: 0, right: 0 }}>
              <OnlineDot isOnline />
            </View>
          )}
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }} numberOfLines={1}>{member.name}</Text>
          <Text style={{ fontSize: 11, color: C.secondary }} numberOfLines={1}>{member.handle}</Text>
        </View>
      </View>
      <Text style={{ fontSize: 12, color: C.secondary, lineHeight: 17 }} numberOfLines={2}>{member.bio}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
        {member.interests.slice(0, 2).map(tag => (
          <View key={tag} style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, backgroundColor: C.surfacePressed }}>
            <Text style={{ fontSize: 10, color: C.secondary }}>{tag}</Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <IconSymbol name="location" size={10} color={C.muted} />
        <Text style={{ fontSize: 11, color: C.muted }} numberOfLines={1}>{member.location}</Text>
      </View>
    </Pressable>
  );
}

// ── Event Card ─────────────────────────────────────────────────────────────────

function EventCard({ event, C, rsvped, onRsvp }: {
  event: CommunityEvent; C: ComponentColors; rsvped: boolean; onRsvp: () => void;
}) {
  const tier = event.tierId ? getTierById(event.tierId) : null;
  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
        <View style={{
          width: 44, height: 44, borderRadius: 12, backgroundColor: C.surfacePressed,
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Text style={{ fontSize: 22 }}>{event.emoji}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{event.title}</Text>
          <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }} numberOfLines={2}>{event.description}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <Text style={{ fontSize: 11, color: C.muted }}>{formatEventDate(event.date)}</Text>
            {tier && <TierBadge tierId={tier.id} C={C} />}
          </View>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 12, color: C.secondary }}>{event.rsvpCount} going</Text>
        <Pressable
          onPress={onRsvp}
          style={({ pressed }) => ({
            paddingHorizontal: 16, paddingVertical: 7, borderRadius: 10,
            backgroundColor: rsvped ? C.surfacePressed : C.accent,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: rsvped ? C.secondary : '#fff' }}>
            {rsvped ? 'Going ✓' : 'RSVP'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ── Member Action Sheet ────────────────────────────────────────────────────────

function MemberActionSheet({
  member, visible, isOwner, onClose, onIntroduce, C,
}: {
  member: CommunityMember | null;
  visible: boolean;
  isOwner: boolean;
  onClose: () => void;
  onIntroduce: () => void;
  C: ComponentColors;
}) {
  if (!member) return null;
  const ownerActions = [
    { icon: 'message', label: 'Message Directly' },
    { icon: 'person.2.badge.gearshape', label: 'Introduce to Someone', action: onIntroduce },
    { icon: 'arrow.trianglehead.2.clockwise.rotate.90', label: 'Move to Different Tier' },
    { icon: 'star', label: 'Assign Moderator Role' },
    { icon: 'trash', label: 'Remove from Community', destructive: true },
  ];
  const memberActions = [
    { icon: 'message', label: 'Send Message' },
    { icon: 'person.crop.circle', label: 'View Profile' },
  ];
  const actions = isOwner ? ownerActions : memberActions;

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal>
      <View style={{ paddingBottom: 24 }}>
        {/* Preview */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
          <Avatar initials={member.initials} hue={member.avatarHue} size={40} />
          <View>
            <Text style={{ fontSize: 15, fontWeight: '600', color: C.label }}>{member.name}</Text>
            <Text style={{ fontSize: 12, color: C.secondary }}>{member.handle} · {member.location}</Text>
          </View>
        </View>
        {actions.map((a, i) => (
          <Pressable
            key={a.label}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center', gap: 14,
              paddingHorizontal: 20, paddingVertical: 15,
              backgroundColor: pressed ? C.surfacePressed : 'transparent',
              borderTopWidth: i > 0 ? StyleSheet.hairlineWidth : 0,
              borderTopColor: C.separator,
            })}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              (a as any).action?.();
              onClose();
            }}
          >
            <IconSymbol name={a.icon as any} size={20} color={(a as any).destructive ? C.red : C.label} />
            <Text style={{ fontSize: 16, color: (a as any).destructive ? C.red : C.label }}>{a.label}</Text>
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}

// ── Introduce Confirm Sheet ────────────────────────────────────────────────────

function IntroduceConfirmSheet({
  visible, source, target, onConfirm, onClose, C,
}: {
  visible: boolean;
  source: CommunityMember | null;
  target: CommunityMember | null;
  onConfirm: () => void;
  onClose: () => void;
  C: ComponentColors;
}) {
  if (!source || !target) return null;
  return (
    <BottomSheet visible={visible} onClose={onClose} useModal title="Introduce Members">
      <View style={{ padding: 20, gap: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Avatar initials={source.initials} hue={source.avatarHue} size={52} />
            <Text style={{ fontSize: 12, color: C.label, fontWeight: '600' }}>{source.name.split(' ')[0]}</Text>
          </View>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.surfacePressed, alignItems: 'center', justifyContent: 'center' }}>
              <IconSymbol name="arrow.left.arrow.right" size={16} color={C.accent} />
            </View>
          </View>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Avatar initials={target.initials} hue={target.avatarHue} size={52} />
            <Text style={{ fontSize: 12, color: C.label, fontWeight: '600' }}>{target.name.split(' ')[0]}</Text>
          </View>
        </View>
        <Text style={{ fontSize: 14, color: C.secondary, textAlign: 'center', lineHeight: 20 }}>
          {"We'll message both "}
          <Text style={{ fontWeight: '600', color: C.label }}>{source.name.split(' ')[0]}</Text>
          {' and '}
          <Text style={{ fontWeight: '600', color: C.label }}>{target.name.split(' ')[0]}</Text>
          {' introducing them to each other.'}
        </Text>
        <Pressable
          style={({ pressed }) => ({
            backgroundColor: C.accent, borderRadius: 12, paddingVertical: 14,
            alignItems: 'center', opacity: pressed ? 0.8 : 1,
          })}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onConfirm(); onClose(); }}
        >
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>Send Introduction</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────────

function Toast({ msg, C }: { msg: string; C: ComponentColors }) {
  return (
    <View style={{
      position: 'absolute', bottom: 100, left: 24, right: 24,
      backgroundColor: C.label, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
      alignItems: 'center', zIndex: 9999,
    }}>
      <Text style={{ fontSize: 14, fontWeight: '600', color: C.bg }}>{msg}</Text>
    </View>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────────────

export default function NetworkScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => makeStyles(C), [C]);

  const topBarH    = insets.top + TOP_BAR_H;

  const [tab, setTab]                 = useState<Tab>('Community');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showPills, setShowPills]     = useState(false);
  const [selectedPill, setSelectedPill] = useState('All');
  const [searchQuery, setSearchQuery]   = useState('');
  const [role, setRole]               = useState<Role>('owner');

  // Member action sheet
  const [actionTarget, setActionTarget] = useState<CommunityMember | null>(null);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);

  // Introduce feature
  const [introduceMode, setIntroduceMode] = useState(false);
  const [introduceSource, setIntroduceSource] = useState<string | null>(null);
  const [introduceTarget, setIntroduceTarget] = useState<string | null>(null);
  const [introduceConfirm, setIntroduceConfirm] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  // RSVPs
  const [rsvped, setRsvped] = useState<Set<string>>(new Set(['ce2']));

  const lastScrollY = useRef(0);
  const scrollPadTop = topBarH + (showPills ? PILL_ROW_H : 0) + 8;

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleSwitchTab = useCallback((newTab: Tab) => {
    setTab(newTab);
    setDropdownOpen(false);
    setSelectedPill('All');
    setSearchQuery('');
    setIntroduceMode(false);
    setIntroduceSource(null);
  }, []);

  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 12) hideFooter();
    else if (y < lastScrollY.current - 12) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  const handleMemberPress = useCallback((m: CommunityMember) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (introduceMode && introduceSource && introduceSource !== m.id) {
      setIntroduceTarget(m.id);
      setIntroduceConfirm(true);
      return;
    }
    if (introduceMode && !introduceSource) {
      setIntroduceSource(m.id);
      return;
    }
    setActionTarget(m);
    setActionSheetOpen(true);
  }, [introduceMode, introduceSource]);

  const cycleRole = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRole(r => r === 'owner' ? 'member' : r === 'member' ? 'visitor' : 'owner');
    setIntroduceMode(false);
    setIntroduceSource(null);
  }, []);

  // ── Filtered data ──
  const filteredMembers = useMemo(() => {
    const base = searchQuery ? searchMembers(searchQuery) : COMMUNITY_MEMBERS;
    if (selectedPill === 'All') return base;
    if (selectedPill === 'Online Now') return base.filter(m => m.isOnline);
    if (selectedPill === 'New This Week') return base.filter(m => isNewThisWeek(m.joinDate));
    const tier = COMMUNITY_TIERS.find(t => t.name === selectedPill);
    if (tier) return base.filter(m => m.tierId === tier.id);
    return base;
  }, [searchQuery, selectedPill]);

  const filteredSpaces = useMemo(() => {
    if (selectedPill === 'All') return COMMUNITY_SPACES;
    if (selectedPill === 'Public') return COMMUNITY_SPACES.filter(s => !s.tierId || s.tierId === 'free');
    if (selectedPill === 'Tier-Locked') return COMMUNITY_SPACES.filter(s => s.tierId && s.tierId !== 'free');
    if (selectedPill === 'My Spaces') return COMMUNITY_SPACES.filter(s => !s.tierId || s.tierId === 'free' || s.tierId === 'supporters');
    return COMMUNITY_SPACES;
  }, [selectedPill]);

  const filteredConnect = useMemo(() => {
    if (selectedPill === 'Looking For') return [];
    if (selectedPill === 'All') return COMMUNITY_MEMBERS;
    return COMMUNITY_MEMBERS.filter(m => m.interests.includes(selectedPill.toLowerCase()));
  }, [selectedPill]);

  const isOwner = role === 'owner';
  const isMember = role === 'member';
  const isVisitor = role === 'visitor';

  // ── Render tabs ──────────────────────────────────────────────────────────────

  function renderCommunityTab() {
    if (isVisitor) {
      return (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: scrollPadTop, paddingBottom: insets.bottom + 80 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          {/* Community preview card */}
          <View style={[styles.card, { marginHorizontal: 16, marginBottom: 8 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={[styles.ownerAvatar, { backgroundColor: C.accent }]}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff' }}>SK</Text>
              </View>
              <View>
                <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>Sammy Kalejaiye</Text>
                <Text style={{ fontSize: 13, color: C.secondary }}>@sammyk · Personal Community</Text>
              </View>
            </View>
            <View style={[styles.divider, { marginVertical: 12 }]} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              {[
                { value: '60', label: 'Members' },
                { value: '4',  label: 'Spaces' },
                { value: '34', label: 'Active' },
              ].map(s => (
                <View key={s.label} style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: C.label }}>{s.value}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Tier join cards */}
          <Text style={[styles.sectionHeader, { paddingHorizontal: 16, marginTop: 16 }]}>
            Choose your tier to join
          </Text>
          {COMMUNITY_TIERS.map(tier => (
            <View key={tier.id} style={[styles.card, { marginHorizontal: 16, marginBottom: 10, borderColor: tier.color + '44', borderWidth: 1.5 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: tier.color }}>{tier.name}</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>
                  {tier.price === 0 ? 'Free' : `$${tier.price}/mo`}
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{tier.memberCount} members</Text>
              <View style={{ marginTop: 10, gap: 5 }}>
                {tier.perks.map((p, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <IconSymbol name="checkmark.circle.fill" size={13} color={tier.color} />
                    <Text style={{ fontSize: 13, color: C.secondary }}>{p}</Text>
                  </View>
                ))}
              </View>
              <Pressable
                style={({ pressed }) => ({
                  marginTop: 14, borderRadius: 10, paddingVertical: 10, alignItems: 'center',
                  backgroundColor: tier.price === 0 ? C.label : tier.color,
                  opacity: pressed ? 0.8 : 1,
                })}
                onPress={() => showToast(tier.price === 0 ? 'Joined Free Community!' : `Subscribed to ${tier.name}!`)}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>
                  {tier.price === 0 ? 'Join Free' : `Subscribe · $${tier.price}/mo`}
                </Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      );
    }

    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: scrollPadTop, paddingBottom: insets.bottom + 80 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats row (owner only) */}
        {isOwner && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingBottom: 4 }}
          >
            {[
              { icon: 'person.3',    label: 'Total Members',   value: COMMUNITY_STATS.totalMembers,    color: C.label },
              { icon: 'bolt',        label: 'Active This Week', value: COMMUNITY_STATS.activeThisWeek, color: '#5A8A6E' },
              { icon: 'sparkles',    label: 'New This Week',   value: COMMUNITY_STATS.newThisWeek,     color: C.accent },
              { icon: 'bubble.left.and.bubble.right', label: 'Spaces', value: COMMUNITY_STATS.spacesCount, color: C.label },
              { icon: 'arrow.left.arrow.right', label: 'Intros Made', value: COMMUNITY_STATS.introductionsMade, color: '#5A8A6E' },
            ].map(s => (
              <View key={s.label} style={[styles.statCard, { backgroundColor: C.surface }]}>
                <IconSymbol name={s.icon as any} size={18} color={s.color} />
                <Text style={{ fontSize: 22, fontWeight: '700', color: s.color, marginTop: 6 }}>{s.value}</Text>
                <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>{s.label}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Introduce mode banner */}
        {isOwner && introduceMode && (
          <View style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: C.accent + '18', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <IconSymbol name="arrow.left.arrow.right" size={16} color={C.accent} />
            <Text style={{ flex: 1, fontSize: 13, color: C.accent, fontWeight: '500' }}>
              {introduceSource
                ? `Selected ${getMemberById(introduceSource)?.name?.split(' ')[0]} — now tap who to introduce them to`
                : 'Tap a member to start an introduction'}
            </Text>
            <Pressable onPress={() => { setIntroduceMode(false); setIntroduceSource(null); }}>
              <IconSymbol name="xmark" size={16} color={C.accent} />
            </Pressable>
          </View>
        )}

        {/* Search bar */}
        <View style={[styles.searchBar, { marginTop: isOwner ? 12 : 0 }]}>
          <IconSymbol name="magnifyingglass" size={16} color={C.muted} />
          <TextInput
            style={{ flex: 1, fontSize: 14, color: C.label }}
            placeholder="Search members..."
            placeholderTextColor={C.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={16} color={C.muted} />
            </Pressable>
          )}
        </View>

        {/* Tier sections (when no search + no pill filter) */}
        {searchQuery === '' && selectedPill === 'All' ? (
          COMMUNITY_TIERS.map(tier => {
            const members = getMembersByTier(tier.id);
            return (
              <View key={tier.id}>
                {/* Tier header */}
                <View style={[styles.tierHeader]}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: tier.color }} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{tier.name}</Text>
                  <View style={[styles.countBadge, { backgroundColor: tier.color + '20' }]}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: tier.color }}>{tier.memberCount}</Text>
                  </View>
                </View>
                {members.map(m => (
                  <MemberRow
                    key={m.id} member={m} C={C} isOwner={isOwner}
                    introduceMode={introduceMode && isOwner}
                    isIntroduceSource={introduceSource === m.id}
                    onPress={handleMemberPress}
                    onIntroduce={isOwner ? (mem) => {
                      if (!introduceSource) { setIntroduceSource(mem.id); }
                      else { setIntroduceTarget(mem.id); setIntroduceConfirm(true); }
                    } : undefined}
                  />
                ))}
                <View style={styles.divider} />
              </View>
            );
          })
        ) : (
          // Filtered flat list
          filteredMembers.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="person.slash" size={32} color={C.muted} />
              <Text style={{ fontSize: 14, color: C.muted, marginTop: 8 }}>No members found</Text>
            </View>
          ) : (
            filteredMembers.map(m => (
              <MemberRow
                key={m.id} member={m} C={C} isOwner={isOwner}
                introduceMode={introduceMode && isOwner}
                isIntroduceSource={introduceSource === m.id}
                onPress={handleMemberPress}
                onIntroduce={isOwner ? (mem) => {
                  if (!introduceSource) { setIntroduceSource(mem.id); }
                  else { setIntroduceTarget(mem.id); setIntroduceConfirm(true); }
                } : undefined}
              />
            ))
          )
        )}

        {/* Owner introduce button */}
        {isOwner && !introduceMode && (
          <Pressable
            style={({ pressed }) => [styles.introduceBtn, { backgroundColor: pressed ? C.surfacePressed : C.surface, borderColor: C.inputBorder }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIntroduceMode(true); }}
          >
            <IconSymbol name="arrow.left.arrow.right" size={16} color={C.accent} />
            <Text style={{ fontSize: 14, fontWeight: '500', color: C.accent }}>Introduce Members</Text>
          </Pressable>
        )}

        {/* Events section */}
        <Text style={[styles.sectionHeader, { marginTop: 24 }]}>Upcoming Events</Text>
        {COMMUNITY_EVENTS.map(event => (
          <EventCard
            key={event.id} event={event} C={C}
            rsvped={rsvped.has(event.id)}
            onRsvp={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setRsvped(prev => {
                const s = new Set(prev);
                if (s.has(event.id)) s.delete(event.id); else s.add(event.id);
                return s;
              });
            }}
          />
        ))}
      </ScrollView>
    );
  }

  function renderSpacesTab() {
    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: scrollPadTop, paddingBottom: insets.bottom + 80 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionHeader, { marginBottom: 4 }]}>
          {isOwner ? 'Community Spaces' : isMember ? 'Your Spaces' : 'Available Spaces'}
        </Text>
        <Text style={{ fontSize: 13, color: C.muted, paddingHorizontal: 16, marginBottom: 12 }}>
          {isOwner
            ? 'Spaces are Rooms in Messages — tiered access, topic channels, community conversation.'
            : isMember
              ? 'Spaces you have access to based on your tier.'
              : 'Join a tier to unlock exclusive Spaces.'}
        </Text>

        {filteredSpaces.map(space => (
          <React.Fragment key={space.id}>
            <SpaceCard
              space={space} C={C} role={role}
              onPress={(s) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                const isLocked = isVisitor && s.tierId !== 'free' && s.tierId !== null;
                if (isLocked) { showToast('Upgrade your tier to access this space'); return; }
                showToast(`Opening ${s.name} in Messages…`);
              }}
            />
            <View style={styles.divider} />
          </React.Fragment>
        ))}

        {isOwner && (
          <Pressable
            style={({ pressed }) => [styles.createBtn, { backgroundColor: pressed ? C.surfacePressed : C.surface, borderColor: C.inputBorder }]}
            onPress={() => showToast('Create Space — coming soon')}
          >
            <IconSymbol name="plus.circle" size={18} color={C.accent} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: C.accent }}>Create Space</Text>
          </Pressable>
        )}
      </ScrollView>
    );
  }

  function renderConnectTab() {
    const showLookingFor = selectedPill === 'Looking For' || selectedPill === 'All';
    const showDirectory  = selectedPill !== 'Looking For';
    const directoryMembers = filteredConnect;

    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: scrollPadTop, paddingBottom: insets.bottom + 80 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Ice-breaker prompt */}
        <View style={[styles.card, { marginHorizontal: 16, marginBottom: 16, borderColor: C.accent + '33', borderWidth: 1.5 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <IconSymbol name="lightbulb.fill" size={14} color={C.accent} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.accent }}>THIS WEEK'S PROMPT</Text>
          </View>
          <Text style={{ fontSize: 15, fontWeight: '600', color: C.label, lineHeight: 22 }}>
            "{ICEBREAKER_PROMPT.text}"
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <Text style={{ fontSize: 12, color: C.muted }}>{ICEBREAKER_PROMPT.responseCount} responses</Text>
            <Pressable
              style={({ pressed }) => ({ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, backgroundColor: C.accent, opacity: pressed ? 0.8 : 1 })}
              onPress={() => showToast('Opening prompt thread in General Community…')}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#fff' }}>Join Conversation</Text>
            </Pressable>
          </View>
        </View>

        {/* Looking For */}
        {showLookingFor && (
          <>
            <Text style={styles.sectionHeader}>Looking For</Text>
            {LOOKING_FOR_POSTS.map(post => {
              const author = getMemberById(post.authorId);
              if (!author) return null;
              return (
                <View key={post.id} style={[styles.lookingForCard, { borderColor: C.separator }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <Avatar initials={author.initials} hue={author.avatarHue} size={32} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{author.name}</Text>
                      <Text style={{ fontSize: 11, color: C.muted }}>{formatPostAge(post.postedAt)}</Text>
                    </View>
                    <TierBadge tierId={author.tierId} C={C} />
                  </View>
                  <Text style={{ fontSize: 14, color: C.label, lineHeight: 20 }}>{post.text}</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                    {post.tags.map(tag => (
                      <View key={tag} style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: C.surfacePressed }}>
                        <Text style={{ fontSize: 11, color: C.secondary }}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                    <Text style={{ fontSize: 12, color: C.muted }}>{post.responseCount} responses</Text>
                    <Pressable
                      style={({ pressed }) => ({ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, backgroundColor: C.surfacePressed, opacity: pressed ? 0.7 : 1 })}
                      onPress={() => showToast('Opening conversation…')}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '500', color: C.label }}>Respond</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* Member directory */}
        {showDirectory && directoryMembers.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>
              {selectedPill === 'All' ? 'Explore Members' : `${selectedPill} Members`}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 }}>
              {directoryMembers.map(m => (
                <View key={m.id} style={{ width: (width - 42) / 2 }}>
                  <ConnectCard
                    member={m} C={C}
                    onPress={() => { setActionTarget(m); setActionSheetOpen(true); }}
                  />
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    );
  }

  // ── UI shell ──────────────────────────────────────────────────────────────────

  const roleColor = role === 'owner' ? C.accent : role === 'member' ? '#5A8A6E' : C.secondary;

  return (
    <View style={[styles.screen, { backgroundColor: C.bg }]}>

      {/* Fixed top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top, height: topBarH, borderBottomColor: C.separator }]}>
        {/* Left: menu icon (owner) */}
        <View style={styles.topBarSide}>
          {isOwner ? (
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
              <IconSymbol name="line.3.horizontal" size={22} color={C.label} />
            </Pressable>
          ) : null}
        </View>

        {/* Center: dropdown pill */}
        <Pressable
          style={styles.dropdownPill}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setDropdownOpen(v => !v); }}
        >
          <Text style={styles.dropdownPillText}>{tab}</Text>
          <IconSymbol name={dropdownOpen ? 'chevron.up' : 'chevron.down'} size={12} color={C.label} />
        </Pressable>

        {/* Right: role pill + filter */}
        <View style={[styles.topBarSide, { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }]}>
          <Pressable style={[styles.rolePill, { backgroundColor: roleColor + '18' }]} onPress={cycleRole}>
            <Text style={[styles.rolePillText, { color: roleColor }]}>
              {role === 'owner' ? 'Owner' : role === 'member' ? 'Member' : 'Visitor'}
            </Text>
          </Pressable>
          <Pressable onPress={() => setShowPills(v => !v)}>
            <IconSymbol
              name="line.3.horizontal.decrease.circle"
              size={20}
              color={showPills ? C.accent : C.label}
            />
          </Pressable>
        </View>
      </View>

      {/* Dropdown overlay */}
      {dropdownOpen && (
        <View style={[styles.dropdown, { top: topBarH, backgroundColor: C.bg, borderColor: C.separator }]}>
          {(['Community', 'Spaces', 'Connect'] as Tab[]).map(t => (
            <Pressable
              key={t}
              style={[styles.dropdownItem, t === tab && { backgroundColor: C.surfacePressed }]}
              onPress={() => handleSwitchTab(t)}
            >
              <Text style={[styles.dropdownItemText, { color: t === tab ? C.accent : C.label, fontWeight: t === tab ? '700' : '400' }]}>
                {t}
              </Text>
              {t === tab && <IconSymbol name="checkmark" size={14} color={C.accent} />}
            </Pressable>
          ))}
        </View>
      )}

      {/* Filter pills */}
      {showPills && (
        <View style={[styles.pillsRow, { top: topBarH, backgroundColor: C.bg, borderBottomColor: C.separator }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center' }}>
            {PILLS[tab].map(pill => (
              <Pressable
                key={pill}
                style={[styles.pill, selectedPill === pill && styles.pillActive]}
                onPress={() => { Haptics.selectionAsync(); setSelectedPill(pill); }}
              >
                <Text style={[styles.pillText, selectedPill === pill && styles.pillTextActive]}>{pill}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Tab content */}
      {tab === 'Community' ? renderCommunityTab()
        : tab === 'Spaces' ? renderSpacesTab()
        : renderConnectTab()}

      {/* Sheets */}
      <MemberActionSheet
        member={actionTarget}
        visible={actionSheetOpen}
        isOwner={isOwner}
        onClose={() => setActionSheetOpen(false)}
        onIntroduce={() => {
          setActionSheetOpen(false);
          setIntroduceMode(true);
          if (actionTarget) setIntroduceSource(actionTarget.id);
        }}
        C={C}
      />
      <IntroduceConfirmSheet
        visible={introduceConfirm}
        source={getMemberById(introduceSource ?? '') ?? null}
        target={getMemberById(introduceTarget ?? '') ?? null}
        onConfirm={() => {
          setIntroduceMode(false);
          setIntroduceSource(null);
          setIntroduceTarget(null);
          showToast('Introduction sent! Both members have been notified.');
        }}
        onClose={() => setIntroduceConfirm(false)}
        C={C}
      />

      {toast && <Toast msg={toast} C={C} />}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen: { flex: 1 },

  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
    flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, backgroundColor: C.bg,
  },
  topBarSide: { flex: 1, justifyContent: 'center' },

  dropdownPill: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: C.surfacePressed, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1.5, borderColor: C.inputBorder,
  },
  dropdownPillText: { fontSize: 13, fontWeight: '700', color: C.label },

  rolePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  rolePillText: { fontSize: 11, fontWeight: '600' },

  dropdown: {
    position: 'absolute', left: 16, right: 16, zIndex: 99,
    borderRadius: 14, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 8,
  },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
  },
  dropdownItemText: { fontSize: 15 },

  pillsRow: {
    position: 'absolute', left: 0, right: 0, zIndex: 29,
    height: PILL_ROW_H, justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pill: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16,
    borderWidth: 1.5, borderColor: C.separator,
  },
  pillActive: { backgroundColor: C.label, borderColor: C.label },
  pillText: { fontSize: 13, fontWeight: '500', color: C.secondary },
  pillTextActive: { color: C.bg, fontWeight: '600' },

  card: {
    backgroundColor: C.surface, borderRadius: 14, padding: 16,
  },
  statCard: {
    width: 110, borderRadius: 14, padding: 14,
    borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator,
  },
  divider: {
    height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 15, fontWeight: '700', color: C.label,
    paddingHorizontal: 16, marginBottom: 8,
  },
  tierHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12, marginTop: 8,
  },
  countBadge: {
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: C.surface, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.inputBorder,
  },
  introduceBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 16, marginTop: 16, paddingVertical: 12,
    borderRadius: 12, borderWidth: 1.5,
  },
  createBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    marginHorizontal: 16, marginTop: 16, paddingVertical: 14,
    borderRadius: 12, borderWidth: 1.5,
  },
  lookingForCard: {
    marginHorizontal: 16, marginBottom: 12, padding: 14,
    backgroundColor: C.surface, borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  ownerAvatar: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 60,
  },
});
