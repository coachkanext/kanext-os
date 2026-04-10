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

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  View, Text, Pressable, ScrollView, TextInput, FlatList,
  StyleSheet, Animated, useWindowDimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { resetFooter, hideFooter, showFooter } from '@/utils/global-footer-hide';
import { openSidePanel } from '@/utils/global-side-panel';
import { useDemoRole } from '@/utils/demo-role-store';
import { useAppContext } from '@/context/app-context';
import { useDataMode } from '@/utils/global-demo-mode';
import { KMenuButton } from '@/components/ui/k-menu-button';
import {
  COMMUNITY_TIERS, COMMUNITY_SPACES, COMMUNITY_MEMBERS,
  LOOKING_FOR_POSTS, ICEBREAKER_PROMPT, COMMUNITY_EVENTS, COMMUNITY_STATS,
  getMembersByTier, getMemberById, getTierById, searchMembers,
  isNewThisWeek, formatJoinDate, formatLastActive, formatEventDate, formatPostAge,
  type CommunityMember, type CommunitySpace, type CommunityEvent,
} from '@/data/mock-creator-community';

// ── Constants ──────────────────────────────────────────────────────────────────

type Tab  = 'Feed' | 'Community' | 'Spaces' | 'Connect';
type Role = 'owner' | 'member' | 'visitor';

const TOP_BAR_H  = 52;
const PILL_ROW_H = 48;

const PILLS: Record<Tab, string[]> = {
  Feed:      [],
  Community: ['All', 'Free Community', 'Supporters', 'Inner Circle', 'Online Now', 'New This Week'],
  Spaces:    ['All', 'My Spaces', 'Public', 'Tier-Locked'],
  Connect:   ['All', 'Entrepreneurship', 'Fitness', 'Coding', 'Looking For'],
};

// ── Activity feed mock data ────────────────────────────────────────────────────

type FeedItemType = 'post' | 'discussion' | 'announcement' | 'win' | 'intro';

interface FeedItem {
  id: string;
  type: FeedItemType;
  author: { name: string; initials: string; hue: number; handle: string };
  content: string;
  timestamp: string;
  likes: number;
  replies: number;
  tier?: string;
}

const COMMUNITY_FEED: FeedItem[] = [
  {
    id: 'cf1', type: 'announcement',
    author: { name: 'Sammy Kalejaiye', initials: 'SK', hue: 220, handle: '@sammyk' },
    content: '🎉 Big news — we just crossed 1,200 community members! Thank you all for being part of this. Our Inner Circle coaching call is this Thursday at 7 PM ET.',
    timestamp: '2h ago', likes: 47, replies: 12,
  },
  {
    id: 'cf2', type: 'win',
    author: { name: 'Marcus Thompson', initials: 'MT', hue: 40, handle: '@marcust' },
    content: "Just closed my first $5K consulting deal using the framework Sammy shared in last month's coaching call. Community support made it real. 🙏",
    timestamp: '4h ago', likes: 89, replies: 23,
  },
  {
    id: 'cf3', type: 'discussion',
    author: { name: 'Aisha Andrews', initials: 'AA', hue: 160, handle: '@aishaa' },
    content: "What's everyone's go-to tool for managing content calendars? I've been toggling between Notion and a custom spreadsheet and can't decide.",
    timestamp: '6h ago', likes: 34, replies: 18, tier: 'supporters',
  },
  {
    id: 'cf4', type: 'intro',
    author: { name: 'Devon Williams', initials: 'DW', hue: 280, handle: '@devonw' },
    content: "New here! I'm Devon — product designer by day, aspiring content creator by night. Based in Atlanta. Looking to connect with others building personal brands in tech.",
    timestamp: '8h ago', likes: 21, replies: 8,
  },
  {
    id: 'cf5', type: 'post',
    author: { name: 'Riley Spencer', initials: 'RS', hue: 100, handle: '@rileys' },
    content: "Finished reading \"Building a Story Brand\" for the third time. Every re-read hits different. Who else has books they return to every year?",
    timestamp: '12h ago', likes: 56, replies: 31,
  },
  {
    id: 'cf6', type: 'announcement',
    author: { name: 'Sammy Kalejaiye', initials: 'SK', hue: 220, handle: '@sammyk' },
    content: "The new \"Creator Finance\" space is now live. It's open to all Supporters and above. Drop your biggest money question in there and I'll answer them all in a voice note this weekend.",
    timestamp: '1d ago', likes: 62, replies: 7, tier: 'supporters',
  },
  {
    id: 'cf7', type: 'discussion',
    author: { name: 'Jordan Taylor', initials: 'JT', hue: 60, handle: '@jordant' },
    content: 'Anyone else using KaNeXT KPay for client invoicing? Curious if others have integrated it with their existing workflows.',
    timestamp: '1d ago', likes: 18, replies: 14,
  },
  {
    id: 'cf8', type: 'win',
    author: { name: 'Noah Okafor', initials: 'NO', hue: 200, handle: '@noaho' },
    content: '100 newsletter subscribers! Small number, but this time last year I had zero. Building in public is the move. 💪',
    timestamp: '2d ago', likes: 104, replies: 42,
  },
];

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
  space, C, role, memberTierId, onPress,
}: {
  space: CommunitySpace;
  C: ComponentColors;
  role: Role;
  memberTierId?: string;
  onPress: (s: CommunitySpace) => void;
}) {
  const RANK: Record<string, number> = { free: 0, supporters: 1, inner_circle: 2 };
  const tier = space.tierId ? getTierById(space.tierId) : null;
  const isLocked =
    (role === 'visitor' && space.tierId !== 'free' && space.tierId !== null) ||
    (role === 'member' && space.tierId !== null &&
      (RANK[space.tierId] ?? 0) > (RANK[memberTierId ?? 'free'] ?? 0));
  const isMySpace = role === 'member' && !isLocked;

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
      ) : null}
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

function EventCard({ event, C, rsvped, onRsvp, canAccess = true }: {
  event: CommunityEvent; C: ComponentColors; rsvped: boolean; onRsvp: () => void; canAccess?: boolean;
}) {
  const tier = event.tierId ? getTierById(event.tierId) : null;
  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8, opacity: canAccess ? 1 : 0.7 }}>
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
        {canAccess ? (
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
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <IconSymbol name="lock.fill" size={12} color={C.secondary} />
            <Text style={{ fontSize: 12, color: C.secondary }}>Upgrade to access</Text>
          </View>
        )}
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

// ── Education Mode Data ────────────────────────────────────────────────────────

type CampusTab = 'Students' | 'Faculty' | 'Staff' | 'Applicants';
type DirTab = 'Faculty' | 'Students' | 'My Profile';

const EDU_STUDENTS = [
  { id: 's1', name: 'Marcus Reid',    initials: 'MR', hue: 200, program: 'MBA',            year: 'Year 2', gpa: '3.82', status: 'Active', flag: null },
  { id: 's2', name: 'Priya Nair',     initials: 'PN', hue: 140, program: 'BA Business',    year: 'Year 3', gpa: '3.45', status: 'Active', flag: null },
  { id: 's3', name: 'James Okafor',   initials: 'JO', hue: 40,  program: 'DBA',            year: 'Year 1', gpa: '3.91', status: 'Active', flag: null },
  { id: 's4', name: 'Sofia Chen',     initials: 'SC', hue: 300, program: 'BS DiagImaging', year: 'Year 2', gpa: '3.20', status: 'Active', flag: 'at-risk' },
  { id: 's5', name: 'Andre Williams', initials: 'AW', hue: 20,  program: 'MS IBFM',        year: 'Year 1', gpa: '2.87', status: 'Active', flag: 'probation' },
  { id: 's6', name: 'Leila Hassan',   initials: 'LH', hue: 160, program: 'MBA',            year: 'Year 1', gpa: '3.67', status: 'Leave',  flag: null },
  { id: 's7', name: 'Tyler Brooks',   initials: 'TB', hue: 260, program: 'BA Business',    year: 'Year 4', gpa: '3.55', status: 'Active', flag: null },
];

const EDU_FACULTY = [
  { id: 'f1', name: 'Dr. Angela Ross',    initials: 'AR', hue: 180, dept: 'Business',          title: 'Associate Professor', courses: 3, officeHours: 'Mon/Wed 3–5 PM', tenure: true },
  { id: 'f2', name: 'Prof. James Okafor', initials: 'JO', hue: 40,  dept: 'Finance',           title: 'Adjunct Professor',   courses: 2, officeHours: 'Tue/Thu 4–6 PM', tenure: false },
  { id: 'f3', name: 'Dr. Maria Santos',   initials: 'MS', hue: 320, dept: 'International Biz', title: 'Full Professor',      courses: 2, officeHours: 'Wed/Fri 2–4 PM', tenure: true },
  { id: 'f4', name: 'Dr. Kevin Lin',      initials: 'KL', hue: 80,  dept: 'Diagnostic Imaging',title: 'Associate Professor', courses: 3, officeHours: 'Mon/Thu 1–3 PM', tenure: false },
  { id: 'f5', name: 'Prof. Diane Carter', initials: 'DC', hue: 220, dept: 'Business',          title: 'Adjunct Professor',   courses: 2, officeHours: 'By appointment', tenure: false },
];

const EDU_STAFF = [
  { id: 'st1', name: 'Carmen Flores', initials: 'CF', hue: 60,  role: 'Registrar',          dept: 'Academic Affairs' },
  { id: 'st2', name: 'David Kim',     initials: 'DK', hue: 200, role: 'Financial Aid Dir.',  dept: 'Student Services' },
  { id: 'st3', name: 'Tamara Jones',  initials: 'TJ', hue: 340, role: 'IT Director',         dept: 'Information Technology' },
  { id: 'st4', name: 'Robert Perez',  initials: 'RP', hue: 120, role: 'Facilities Manager',  dept: 'Facilities' },
  { id: 'st5', name: 'Nina Obi',      initials: 'NO', hue: 280, role: 'Admissions Coord.',   dept: 'Admissions' },
];

// ── EducationPresidentCampusView ───────────────────────────────────────────────

function EducationPresidentCampusView({
  C, insets, role, cycleRole,
}: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  role: string;
  cycleRole: () => void;
}) {
  const topBarH = insets.top + TOP_BAR_H;
  const [campusTab, setCampusTab] = useState<CampusTab>('Students');
  const [campusDrop, setCampusDrop] = useState(false);
  const [campusSearch, setCampusSearch] = useState('');

  const CAMPUS_TABS: CampusTab[] = ['Students', 'Faculty', 'Staff', 'Applicants'];

  function renderStudents() {
    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topBarH + 8, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Search bar */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 10,
          marginHorizontal: 16, marginBottom: 8,
          paddingHorizontal: 12, paddingVertical: 10,
          backgroundColor: C.surface, borderRadius: 12,
          borderWidth: 1.5, borderColor: C.separator,
        }}>
          <IconSymbol name="magnifyingglass" size={16} color={C.muted} />
          <TextInput
            style={{ flex: 1, fontSize: 14, color: C.label }}
            placeholder="Search students..."
            placeholderTextColor={C.muted}
            value={campusSearch}
            onChangeText={setCampusSearch}
            returnKeyType="search"
          />
          {campusSearch.length > 0 && (
            <Pressable onPress={() => setCampusSearch('')}>
              <IconSymbol name="xmark.circle.fill" size={16} color={C.muted} />
            </Pressable>
          )}
        </View>

        {/* Summary */}
        <Text style={{ fontSize: 13, color: C.secondary, paddingHorizontal: 16, marginBottom: 12 }}>
          436 students enrolled
        </Text>

        {/* Student rows */}
        {EDU_STUDENTS.map((s, i) => (
          <Pressable
            key={s.id}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center', gap: 12,
              paddingHorizontal: 16, paddingVertical: 12,
              backgroundColor: pressed ? C.surfacePressed : 'transparent',
              borderTopWidth: i > 0 ? StyleSheet.hairlineWidth : 0,
              borderTopColor: C.separator,
            })}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Avatar initials={s.initials} hue={s.hue} size={42} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{s.name}</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{s.program} · {s.year}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{s.gpa}</Text>
              <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                <View style={{
                  paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8,
                  backgroundColor: s.status === 'Leave' ? '#B8943E18' : C.surface,
                }}>
                  <Text style={{
                    fontSize: 10, fontWeight: '600',
                    color: s.status === 'Leave' ? '#B8943E' : C.secondary,
                  }}>{s.status}</Text>
                </View>
                {s.flag != null && (
                  <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, backgroundColor: '#B85C5C18' }}>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: '#B85C5C' }}>
                      {s.flag === 'at-risk' ? 'At-Risk' : 'Probation'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        ))}

        {/* Export button */}
        <Pressable
          style={({ pressed }) => ({
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginHorizontal: 16, marginTop: 20, paddingVertical: 13,
            borderRadius: 12, borderWidth: 1.5, borderColor: C.separator,
            backgroundColor: pressed ? C.surfacePressed : C.surface,
          })}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="square.and.arrow.up" size={16} color={C.label} />
          <Text style={{ fontSize: 14, fontWeight: '500', color: C.label }}>Export Student Data</Text>
        </Pressable>
      </ScrollView>
    );
  }

  function renderFaculty() {
    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topBarH + 8, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {EDU_FACULTY.map((f, i) => (
          <Pressable
            key={f.id}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center', gap: 12,
              paddingHorizontal: 16, paddingVertical: 14,
              backgroundColor: pressed ? C.surfacePressed : 'transparent',
              borderTopWidth: i > 0 ? StyleSheet.hairlineWidth : 0,
              borderTopColor: C.separator,
            })}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Avatar initials={f.initials} hue={f.hue} size={42} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }} numberOfLines={1}>{f.name}</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{f.dept} · {f.title}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <Text style={{ fontSize: 11, color: C.muted }}>{f.courses} courses</Text>
                <Text style={{ fontSize: 11, color: C.muted }}>· {f.officeHours}</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              {f.tenure && (
                <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, backgroundColor: '#5A8A6E18' }}>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: '#5A8A6E' }}>Tenured</Text>
                </View>
              )}
              <IconSymbol name="chevron.right" size={14} color={C.muted} />
            </View>
          </Pressable>
        ))}
      </ScrollView>
    );
  }

  function renderStaff() {
    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topBarH + 8, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {EDU_STAFF.map((st, i) => (
          <Pressable
            key={st.id}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center', gap: 12,
              paddingHorizontal: 16, paddingVertical: 14,
              backgroundColor: pressed ? C.surfacePressed : 'transparent',
              borderTopWidth: i > 0 ? StyleSheet.hairlineWidth : 0,
              borderTopColor: C.separator,
            })}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Avatar initials={st.initials} hue={st.hue} size={42} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{st.name}</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{st.role}</Text>
              <Text style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{st.dept}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    );
  }

  function renderApplicants() {
    const RECENT_APPS = [
      { name: 'Kenji Tanaka',   program: 'MBA',            date: 'Applied Mar 28', status: 'Applied' },
      { name: 'Amara Osei',     program: 'BS DiagImaging', date: 'Applied Mar 25', status: 'Applied' },
      { name: 'Lucas Martins',  program: 'DBA',            date: 'Applied Mar 20', status: 'Applied' },
    ];
    const PIPELINE = [
      { stage: 'Inquiry',  count: 312 },
      { stage: 'Applied',  count: 187 },
      { stage: 'Admitted', count: 89 },
      { stage: 'Deposited',count: 42 },
      { stage: 'Enrolled', count: 18 },
    ];

    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topBarH + 8, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary card */}
        <View style={{
          marginHorizontal: 16, marginBottom: 16, padding: 16,
          backgroundColor: C.surface, borderRadius: 14,
          borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator,
        }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, marginBottom: 12 }}>
            Current Admissions Cycle
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            {[
              { label: 'Applicants', value: '312' },
              { label: 'Complete',   value: '187' },
              { label: 'Admitted',   value: '89'  },
              { label: 'Deposited',  value: '42'  },
            ].map(s => (
              <View key={s.label} style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: C.label }}>{s.value}</Text>
                <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pipeline stages */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 1, textTransform: 'uppercase', paddingHorizontal: 16, marginBottom: 8 }}>
          Pipeline
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 4 }}>
          {PIPELINE.map((p, i) => (
            <View key={p.stage} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{
                paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
                backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.separator,
                alignItems: 'center',
              }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{p.count}</Text>
                <Text style={{ fontSize: 10, color: C.secondary, marginTop: 1 }}>{p.stage}</Text>
              </View>
              {i < PIPELINE.length - 1 && (
                <IconSymbol name="chevron.right" size={12} color={C.muted} />
              )}
            </View>
          ))}
        </ScrollView>

        {/* View Full Pipeline button */}
        <Pressable
          style={({ pressed }) => ({
            marginHorizontal: 16, marginTop: 12, marginBottom: 20, paddingVertical: 12,
            borderRadius: 12, borderWidth: 1.5, borderColor: C.separator,
            backgroundColor: pressed ? C.surfacePressed : C.surface,
            alignItems: 'center',
          })}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Text style={{ fontSize: 14, fontWeight: '500', color: C.label }}>View Full Pipeline</Text>
        </Pressable>

        {/* Recent applicants */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 1, textTransform: 'uppercase', paddingHorizontal: 16, marginBottom: 8 }}>
          Recent Applicants
        </Text>
        {RECENT_APPS.map((a, i) => (
          <View
            key={a.name}
            style={{
              flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
              borderTopWidth: i > 0 ? StyleSheet.hairlineWidth : 0, borderTopColor: C.separator,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{a.name}</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{a.program} · {a.date}</Text>
            </View>
            <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: C.surface }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary }}>{a.status}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top bar */}
      <View style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
        flexDirection: 'row', alignItems: 'flex-end',
        paddingTop: insets.top, height: topBarH,
        paddingHorizontal: 16, paddingBottom: 10,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
        backgroundColor: C.bg,
      }}>
        {/* Left: hamburger */}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
            <KMenuButton />
          </Pressable>
        </View>

        {/* Center: campus tab dropdown pill */}
        <Pressable
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 4,
            backgroundColor: C.surfacePressed, borderRadius: 18,
            paddingHorizontal: 14, paddingVertical: 6,
            borderWidth: 1.5, borderColor: C.separator,
          }}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCampusDrop(v => !v); }}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{campusTab}</Text>
          <IconSymbol name={campusDrop ? 'chevron.up' : 'chevron.down'} size={12} color={C.label} />
        </Pressable>

        {/* Right: RolePill */}
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
          <RolePill role={role} onPress={cycleRole} accentColor={C.label} isPrimary />
        </View>
      </View>

      {/* Dropdown */}
      {campusDrop && (
        <View style={{
          position: 'absolute', top: topBarH, left: 16, right: 16, zIndex: 99,
          backgroundColor: C.bg, borderRadius: 14, borderWidth: 1, borderColor: C.separator,
          shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08, shadowRadius: 12, elevation: 8,
        }}>
          {CAMPUS_TABS.map(t => (
            <Pressable
              key={t}
              style={[{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                paddingHorizontal: 16, paddingVertical: 14,
                borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
              }, t === campusTab && { backgroundColor: C.surfacePressed }]}
              onPress={() => { setCampusTab(t); setCampusDrop(false); }}
            >
              <Text style={{ fontSize: 15, color: t === campusTab ? C.label : C.secondary, fontWeight: t === campusTab ? '700' : '400' }}>{t}</Text>
              {t === campusTab && <IconSymbol name="checkmark" size={14} color={C.label} />}
            </Pressable>
          ))}
        </View>
      )}

      {/* Tab content */}
      {campusTab === 'Students'   ? renderStudents()
        : campusTab === 'Faculty'   ? renderFaculty()
        : campusTab === 'Staff'     ? renderStaff()
        : renderApplicants()}
    </View>
  );
}

// ── EducationStudentDirectoryView ──────────────────────────────────────────────

function EducationStudentDirectoryView({
  C, insets, role, cycleRole,
}: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  role: string;
  cycleRole: () => void;
}) {
  const topBarH = insets.top + TOP_BAR_H;
  const [dirTab, setDirTab] = useState<DirTab>('Faculty');

  const DIR_TABS: DirTab[] = ['Faculty', 'Students', 'My Profile'];

  function renderFacultyDir() {
    return (
      <>
        {EDU_FACULTY.map((f, i) => (
          <View
            key={f.id}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 12,
              paddingHorizontal: 16, paddingVertical: 14,
              borderTopWidth: i > 0 ? StyleSheet.hairlineWidth : 0, borderTopColor: C.separator,
            }}
          >
            <Avatar initials={f.initials} hue={f.hue} size={42} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }} numberOfLines={1}>{f.name}</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{f.dept}</Text>
              <Text style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{f.officeHours}</Text>
            </View>
            <Pressable
              style={({ pressed }) => ({
                padding: 8, borderRadius: 10,
                backgroundColor: pressed ? C.surfacePressed : C.surface,
              })}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name="envelope" size={16} color={C.label} />
            </Pressable>
          </View>
        ))}
      </>
    );
  }

  function renderStudentsDir() {
    return (
      <>
        {EDU_STUDENTS.slice(0, 4).map((s, i) => (
          <View
            key={s.id}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 12,
              paddingHorizontal: 16, paddingVertical: 12,
              borderTopWidth: i > 0 ? StyleSheet.hairlineWidth : 0, borderTopColor: C.separator,
            }}
          >
            <Avatar initials={s.initials} hue={s.hue} size={42} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{s.name}</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{s.program} · {s.year}</Text>
            </View>
            <Pressable
              style={({ pressed }) => ({
                paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
                backgroundColor: pressed ? C.surfacePressed : C.surface,
                borderWidth: 1, borderColor: C.separator,
              })}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text style={{ fontSize: 12, fontWeight: '500', color: C.label }}>Study Group</Text>
            </Pressable>
          </View>
        ))}
      </>
    );
  }

  function renderMyProfile() {
    const COURSES = ['BUS 401', 'MKT 350', 'MBA 520', 'MBA 510'];
    return (
      <View style={{ paddingHorizontal: 16, gap: 16 }}>
        {/* Profile card */}
        <View style={{
          backgroundColor: C.surface, borderRadius: 14, padding: 16,
          borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator,
          alignItems: 'center', gap: 8,
        }}>
          <Avatar initials="MR" hue={200} size={56} />
          <Text style={{ fontSize: 17, fontWeight: '700', color: C.label }}>Marcus Reid</Text>
          <Text style={{ fontSize: 13, color: C.secondary }}>MBA · Year 2</Text>
          <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: C.surfacePressed }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>GPA: 3.82</Text>
          </View>
        </View>

        {/* Enrolled courses */}
        <View>
          <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
            Enrolled Courses
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {COURSES.map(c => (
              <View key={c} style={{
                paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
                backgroundColor: C.surface, borderWidth: 1, borderColor: C.separator,
              }}>
                <Text style={{ fontSize: 13, fontWeight: '500', color: C.label }}>{c}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Academic advisor */}
        <View style={{
          backgroundColor: C.surface, borderRadius: 12, padding: 14,
          borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator,
          gap: 4,
        }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 1, textTransform: 'uppercase' }}>
            Academic Advisor
          </Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginTop: 4 }}>Dr. Angela Ross</Text>
          <Text style={{ fontSize: 12, color: C.secondary }}>angelar@lincoln.edu</Text>
        </View>

        {/* Edit Profile button */}
        <Pressable
          style={({ pressed }) => ({
            paddingVertical: 13, borderRadius: 12, alignItems: 'center',
            backgroundColor: pressed ? C.surfacePressed : C.surface,
            borderWidth: 1.5, borderColor: C.separator,
          })}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Text style={{ fontSize: 14, fontWeight: '500', color: C.label }}>Edit Profile</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top bar */}
      <View style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
        flexDirection: 'row', alignItems: 'flex-end',
        paddingTop: insets.top, height: topBarH,
        paddingHorizontal: 16, paddingBottom: 10,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
        backgroundColor: C.bg,
      }}>
        {/* Left: hamburger */}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
            <KMenuButton />
          </Pressable>
        </View>

        {/* Center: static title */}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: C.label }}>Directory</Text>
        </View>

        {/* Right: RolePill */}
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
          <RolePill role={role} onPress={cycleRole} accentColor={C.label} isPrimary={false} />
        </View>
      </View>

      {/* Tab pills row */}
      <View style={{
        position: 'absolute', top: topBarH, left: 0, right: 0, zIndex: 29,
        backgroundColor: C.bg, paddingVertical: 8,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
        flexDirection: 'row', paddingHorizontal: 16, gap: 8,
      }}>
        {DIR_TABS.map(t => (
          <Pressable
            key={t}
            style={{
              paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16,
              borderWidth: 1.5,
              backgroundColor: t === dirTab ? C.label : 'transparent',
              borderColor: t === dirTab ? C.label : C.separator,
            }}
            onPress={() => { Haptics.selectionAsync(); setDirTab(t); }}
          >
            <Text style={{
              fontSize: 13, fontWeight: '500',
              color: t === dirTab ? C.bg : C.secondary,
            }}>{t}</Text>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topBarH + 56, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {dirTab === 'Faculty'    ? renderFacultyDir()
          : dirTab === 'Students' ? renderStudentsDir()
          : renderMyProfile()}
      </ScrollView>
    </View>
  );
}

// ── Business Mode Data ────────────────────────────────────────────────────────

type BizPeopleTab = 'Directory' | 'Org Chart' | 'HR' | 'Hiring';

const BIZ_TEAM = [
  { id: 'b1',  initials: 'SK', hue: 30,  name: 'Sammy Kalejaiye', title: 'CEO',               dept: 'Leadership',    status: 'Active' },
  { id: 'b2',  initials: 'MW', hue: 200, name: 'Marcus Williams',  title: 'CTO',               dept: 'Engineering',   status: 'Active' },
  { id: 'b3',  initials: 'DC', hue: 300, name: 'Diana Chen',       title: 'Head of Product',   dept: 'Product',       status: 'Active' },
  { id: 'b4',  initials: 'KM', hue: 80,  name: 'Kevin Moore',      title: 'Lead Engineer',     dept: 'Engineering',   status: 'Active' },
  { id: 'b5',  initials: 'TO', hue: 160, name: 'Tara Osei',        title: 'Sales Lead',        dept: 'Sales',         status: 'Active' },
  { id: 'b6',  initials: 'BF', hue: 40,  name: 'Ben Foster',       title: 'Marketing Manager', dept: 'Marketing',     status: 'Active' },
  { id: 'b7',  initials: 'MG', hue: 260, name: 'Mia Grant',        title: 'Operations Manager',dept: 'Operations',    status: 'Active' },
  { id: 'b8',  initials: 'AD', hue: 140, name: 'Aisha Diallo',     title: 'Finance Manager',   dept: 'Finance',       status: 'Active' },
  { id: 'b9',  initials: 'TR', hue: 0,   name: 'Tom Reyes',        title: 'General Counsel',   dept: 'Legal',         status: 'Active' },
  { id: 'b10', initials: 'CN', hue: 220, name: 'Carlos Ng',        title: 'Support Lead',      dept: 'Support',       status: 'Active' },
  { id: 'b11', initials: 'PS', hue: 340, name: 'Priya Shah',       title: 'Senior Engineer',   dept: 'Engineering',   status: 'On Leave' },
];

const BIZ_ORG_CHART = [
  { id: 'o0', name: 'Sammy Kalejaiye', title: 'CEO',               level: 0, parentTitle: '' },
  { id: 'o1', name: 'Marcus Williams', title: 'CTO',               level: 1, parentTitle: 'CEO' },
  { id: 'o2', name: 'Diana Chen',      title: 'Head of Product',   level: 1, parentTitle: 'CEO' },
  { id: 'o3', name: 'Tara Osei',       title: 'Sales Lead',        level: 1, parentTitle: 'CEO' },
  { id: 'o4', name: 'Ben Foster',      title: 'Marketing Manager', level: 1, parentTitle: 'CEO' },
  { id: 'o5', name: 'Mia Grant',       title: 'Operations Manager',level: 1, parentTitle: 'CEO' },
  { id: 'o6', name: 'Aisha Diallo',    title: 'Finance Manager',   level: 1, parentTitle: 'CEO' },
  { id: 'o7', name: 'Tom Reyes',       title: 'General Counsel',   level: 1, parentTitle: 'CEO' },
  { id: 'o8', name: 'Kevin Moore',     title: 'Lead Engineer',     level: 2, parentTitle: 'CTO' },
  { id: 'o9', name: 'Priya Shah',      title: 'Senior Engineer',   level: 2, parentTitle: 'CTO' },
  { id: 'o10',name: 'Carlos Ng',       title: 'Support Lead',      level: 2, parentTitle: 'Head of Product' },
];

const BIZ_ONBOARDING = [
  { name: 'Jordan Lee',  role: 'Data Analyst',    startDate: 'Apr 7, 2026',  progress: 0.6 },
  { name: 'Nadia Osei',  role: 'Growth Engineer', startDate: 'Apr 14, 2026', progress: 0.2 },
];

const BIZ_PTO = [
  { name: 'Priya Shah', dates: 'Apr 1–11, 2026',  status: 'Approved' },
  { name: 'Carlos Ng',  dates: 'Apr 22–25, 2026', status: 'Pending' },
  { name: 'Ben Foster', dates: 'May 5–9, 2026',   status: 'Pending' },
];

const BIZ_OPEN_ROLES = [
  { id: 'r1', title: 'Senior Engineer',   dept: 'Engineering', posted: 'Mar 15, 2026', applicants: 24, pipeline: [14, 6, 3, 1] },
  { id: 'r2', title: 'Growth Marketer',   dept: 'Marketing',   posted: 'Mar 22, 2026', applicants: 18, pipeline: [10, 5, 2, 1] },
  { id: 'r3', title: 'Account Executive', dept: 'Sales',       posted: 'Apr 1, 2026',  applicants: 11, pipeline: [8, 2, 1, 0] },
];

const BIZ_CANDIDATES = [
  { name: 'Keanu Reeves', role: 'Senior Engineer',   stars: 5, status: 'Interview' },
  { name: 'Amara Bello',  role: 'Growth Marketer',   stars: 4, status: 'Screened'  },
  { name: 'Diego Vargas', role: 'Account Executive', stars: 4, status: 'Applied'   },
  { name: 'Lena Üller',  role: 'Senior Engineer',   stars: 3, status: 'Offer'     },
];

const BIZ_PIPELINE_LABELS = ['Applied', 'Screened', 'Interview', 'Offer'];

// ── BusinessCEOTeamView ────────────────────────────────────────────────────────

function BusinessCEOTeamView({
  C, insets, role, cycleRole,
}: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  role: string;
  cycleRole: () => void;
}) {
  const topBarH = insets.top + TOP_BAR_H;
  const [peopleTab, setPeopleTab] = useState<BizPeopleTab>('Directory');
  const [peopleDrop, setPeopleDrop] = useState(false);
  const [dirSearch, setDirSearch] = useState('');

  const PEOPLE_TABS: BizPeopleTab[] = ['Directory', 'Org Chart', 'HR', 'Hiring'];

  const filteredTeam = dirSearch.trim()
    ? BIZ_TEAM.filter(m =>
        m.name.toLowerCase().includes(dirSearch.toLowerCase()) ||
        m.title.toLowerCase().includes(dirSearch.toLowerCase()) ||
        m.dept.toLowerCase().includes(dirSearch.toLowerCase())
      )
    : BIZ_TEAM;

  function renderDirectory() {
    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topBarH + 8, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Search bar */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 10,
          marginHorizontal: 16, marginBottom: 12,
          paddingHorizontal: 12, paddingVertical: 10,
          backgroundColor: C.surface, borderRadius: 12,
          borderWidth: 1.5, borderColor: C.separator,
        }}>
          <IconSymbol name="magnifyingglass" size={16} color={C.muted} />
          <TextInput
            style={{ flex: 1, fontSize: 14, color: C.label }}
            placeholder="Search team..."
            placeholderTextColor={C.muted}
            value={dirSearch}
            onChangeText={setDirSearch}
            returnKeyType="search"
          />
          {dirSearch.length > 0 && (
            <Pressable onPress={() => setDirSearch('')}>
              <IconSymbol name="xmark.circle.fill" size={16} color={C.muted} />
            </Pressable>
          )}
        </View>

        <Text style={{ fontSize: 13, color: C.secondary, paddingHorizontal: 16, marginBottom: 12 }}>
          {filteredTeam.length} team members
        </Text>

        {filteredTeam.map(member => (
          <Pressable
            key={member.id}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center', gap: 12,
              paddingHorizontal: 16, paddingVertical: 13,
              backgroundColor: pressed ? C.surfacePressed : C.surface,
              marginHorizontal: 16, marginBottom: 8, borderRadius: 12,
              borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator,
            })}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={{
              width: 44, height: 44, borderRadius: 22,
              backgroundColor: C.label, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.bg }}>{member.initials}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }} numberOfLines={1}>{member.name}</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{member.title}</Text>
              <Text style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{member.dept}</Text>
            </View>
            <View style={{
              paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
              backgroundColor: member.status === 'Active' ? '#5A8A6E18' : '#B8943E18',
            }}>
              <Text style={{
                fontSize: 11, fontWeight: '600',
                color: member.status === 'Active' ? '#5A8A6E' : '#B8943E',
              }}>{member.status}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    );
  }

  function renderOrgChart() {
    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topBarH + 8, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 13, color: C.secondary, paddingHorizontal: 16, marginBottom: 16 }}>
          Organizational structure
        </Text>
        {BIZ_ORG_CHART.map((node, i) => (
          <View
            key={node.id}
            style={{
              flexDirection: 'row', alignItems: 'center',
              paddingHorizontal: 16 + node.level * 20,
              paddingVertical: 10,
              borderTopWidth: i > 0 ? StyleSheet.hairlineWidth : 0,
              borderTopColor: C.separator,
            }}
          >
            <View style={{
              width: 8, height: 8, borderRadius: 4,
              backgroundColor: node.level === 0 ? C.label : C.secondary,
              marginRight: 12, flexShrink: 0,
            }} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{
                fontSize: node.level === 0 ? 15 : 14,
                fontWeight: node.level === 0 ? '700' : '500',
                color: C.label,
              }} numberOfLines={1}>{node.name}</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{node.title}</Text>
            </View>
            {node.level === 0 && (
              <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: C.surfacePressed }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: C.label }}>CEO</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    );
  }

  function renderHR() {
    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topBarH + 8, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Onboarding */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 1, textTransform: 'uppercase', paddingHorizontal: 16, marginBottom: 10 }}>
          Onboarding
        </Text>
        {BIZ_ONBOARDING.map(hire => (
          <View key={hire.name} style={{
            marginHorizontal: 16, marginBottom: 10, padding: 14,
            backgroundColor: C.surface, borderRadius: 12,
            borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{hire.name}</Text>
                <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{hire.role} · Starts {hire.startDate}</Text>
              </View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{Math.round(hire.progress * 100)}%</Text>
            </View>
            <View style={{ height: 6, backgroundColor: C.separator, borderRadius: 3, overflow: 'hidden' }}>
              <View style={{ height: 6, width: `${hire.progress * 100}%` as any, backgroundColor: '#5A8A6E', borderRadius: 3 }} />
            </View>
          </View>
        ))}

        {/* Performance */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 1, textTransform: 'uppercase', paddingHorizontal: 16, marginTop: 16, marginBottom: 10 }}>
          Performance
        </Text>
        <View style={{
          marginHorizontal: 16, marginBottom: 10, padding: 14,
          backgroundColor: C.surface, borderRadius: 12,
          borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>Q1 Reviews: 8/11 completed</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#5A8A6E' }}>73%</Text>
          </View>
          <View style={{ height: 6, backgroundColor: C.separator, borderRadius: 3, overflow: 'hidden' }}>
            <View style={{ height: 6, width: '73%', backgroundColor: '#5A8A6E', borderRadius: 3 }} />
          </View>
          <Text style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>3 reviews pending — deadline Apr 15, 2026</Text>
        </View>

        {/* PTO */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 1, textTransform: 'uppercase', paddingHorizontal: 16, marginTop: 16, marginBottom: 10 }}>
          PTO Requests
        </Text>
        {BIZ_PTO.map((req, i) => (
          <View
            key={req.name}
            style={{
              flexDirection: 'row', alignItems: 'center',
              paddingHorizontal: 16, paddingVertical: 12,
              borderTopWidth: i > 0 ? StyleSheet.hairlineWidth : 0, borderTopColor: C.separator,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{req.name}</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{req.dates}</Text>
            </View>
            <View style={{
              paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
              backgroundColor: req.status === 'Approved' ? '#5A8A6E18' : '#B8943E18',
            }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: req.status === 'Approved' ? '#5A8A6E' : '#B8943E' }}>
                {req.status}
              </Text>
            </View>
          </View>
        ))}

        {/* Compliance */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 1, textTransform: 'uppercase', paddingHorizontal: 16, marginTop: 16, marginBottom: 10 }}>
          Compliance
        </Text>
        <View style={{ marginHorizontal: 16, padding: 14, backgroundColor: C.surface, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <IconSymbol name="checkmark.shield" size={20} color={'#5A8A6E'} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>Employee Handbook updated</Text>
            <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>Last revision: Mar 2026</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  function renderHiring() {
    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topBarH + 8, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Open roles */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 1, textTransform: 'uppercase', paddingHorizontal: 16, marginBottom: 10 }}>
          Open Positions
        </Text>
        {BIZ_OPEN_ROLES.map(job => (
          <View key={job.id} style={{
            marginHorizontal: 16, marginBottom: 12, padding: 14,
            backgroundColor: C.surface, borderRadius: 12,
            borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, gap: 10,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{job.title}</Text>
                <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{job.dept} · Posted {job.posted}</Text>
              </View>
              <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: C.surfacePressed }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: C.label }}>{job.applicants} applicants</Text>
              </View>
            </View>
            {/* Pipeline pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {BIZ_PIPELINE_LABELS.map((label, idx) => (
                <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{
                    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16,
                    backgroundColor: C.surfacePressed, borderWidth: 1, borderColor: C.separator,
                  }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: C.label }}>{label} ({job.pipeline[idx]})</Text>
                  </View>
                  {idx < BIZ_PIPELINE_LABELS.length - 1 && (
                    <IconSymbol name="chevron.right" size={10} color={C.muted} />
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        ))}

        {/* Candidates */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 1, textTransform: 'uppercase', paddingHorizontal: 16, marginTop: 8, marginBottom: 10 }}>
          Recent Candidates
        </Text>
        {BIZ_CANDIDATES.map((cand, i) => (
          <Pressable
            key={cand.name}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center', gap: 12,
              paddingHorizontal: 16, paddingVertical: 12,
              backgroundColor: pressed ? C.surfacePressed : 'transparent',
              borderTopWidth: i > 0 ? StyleSheet.hairlineWidth : 0, borderTopColor: C.separator,
            })}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: C.label, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.bg }}>
                {cand.name.split(' ').map((n: string) => n[0]).join('')}
              </Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }} numberOfLines={1}>{cand.name}</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{cand.role}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Text style={{ fontSize: 12, color: C.label }}>
                {'★'.repeat(cand.stars)}{'☆'.repeat(5 - cand.stars)}
              </Text>
              <View style={{
                paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8,
                backgroundColor: cand.status === 'Offer' ? '#5A8A6E18' : C.surfacePressed,
              }}>
                <Text style={{ fontSize: 10, fontWeight: '600', color: cand.status === 'Offer' ? '#5A8A6E' : C.secondary }}>
                  {cand.status}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top bar */}
      <View style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
        flexDirection: 'row', alignItems: 'flex-end',
        paddingTop: insets.top, height: topBarH,
        paddingHorizontal: 16, paddingBottom: 10,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
        backgroundColor: C.bg,
      }}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
            <KMenuButton />
          </Pressable>
        </View>
        <Pressable
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 4,
            backgroundColor: C.surfacePressed, borderRadius: 18,
            paddingHorizontal: 14, paddingVertical: 6,
            borderWidth: 1.5, borderColor: C.separator,
          }}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPeopleDrop(v => !v); }}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{peopleTab}</Text>
          <IconSymbol name={peopleDrop ? 'chevron.up' : 'chevron.down'} size={12} color={C.label} />
        </Pressable>
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
          <RolePill role={role} onPress={cycleRole} accentColor={C.label} isPrimary />
        </View>
      </View>

      {/* Dropdown */}
      {peopleDrop && (
        <View style={{
          position: 'absolute', top: topBarH, left: 16, right: 16, zIndex: 99,
          backgroundColor: C.bg, borderRadius: 14, borderWidth: 1, borderColor: C.separator,
          shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08, shadowRadius: 12, elevation: 8,
        }}>
          {PEOPLE_TABS.map(t => (
            <Pressable
              key={t}
              style={[{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                paddingHorizontal: 16, paddingVertical: 14,
                borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
              }, t === peopleTab && { backgroundColor: C.surfacePressed }]}
              onPress={() => { setPeopleTab(t); setPeopleDrop(false); }}
            >
              <Text style={{ fontSize: 15, color: t === peopleTab ? C.label : C.secondary, fontWeight: t === peopleTab ? '700' : '400' }}>{t}</Text>
              {t === peopleTab && <IconSymbol name="checkmark" size={14} color={C.label} />}
            </Pressable>
          ))}
        </View>
      )}

      {/* Tab content */}
      {peopleTab === 'Directory'  ? renderDirectory()
        : peopleTab === 'Org Chart' ? renderOrgChart()
        : peopleTab === 'HR'        ? renderHR()
        : renderHiring()}
    </View>
  );
}

// ── BusinessCustomerTeamView ───────────────────────────────────────────────────

function BusinessCustomerTeamView({
  C, insets, role, cycleRole,
}: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  role: string;
  cycleRole: () => void;
}) {
  const topBarH = insets.top + TOP_BAR_H;

  const BIZ_WORKING_WITH = [
    { initials: 'SK', name: 'Sammy Kalejaiye', title: 'Founder & CEO',  email: 'sammy@kanext.io' },
    { initials: 'TO', name: 'Tara Osei',        title: 'Sales Lead',     email: 'tara@kanext.io' },
    { initials: 'MG', name: 'Mia Grant',        title: 'Client Success', email: 'mia@kanext.io' },
  ];

  const BIZ_LEADERSHIP_PUBLIC = [
    { initials: 'SK', name: 'Sammy Kalejaiye', title: 'Founder & CEO',   bio: 'Building the OS that runs institutions' },
    { initials: 'MW', name: 'Marcus Williams',  title: 'CTO',             bio: 'Engineering the platform infrastructure' },
    { initials: 'DC', name: 'Diana Chen',       title: 'Head of Product', bio: 'Designing the user experience' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top bar */}
      <View style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
        flexDirection: 'row', alignItems: 'flex-end',
        paddingTop: insets.top, height: topBarH,
        paddingHorizontal: 16, paddingBottom: 10,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
        backgroundColor: C.bg,
      }}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
            <KMenuButton />
          </Pressable>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: C.label }}>Our Team</Text>
        </View>
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
          <RolePill role={role} onPress={cycleRole} accentColor={C.label} isPrimary={false} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topBarH + 8, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* My Contact card */}
        <View style={{
          marginHorizontal: 16, marginBottom: 20, padding: 16,
          backgroundColor: C.surface, borderRadius: 14,
          borderWidth: 1.5, borderColor: C.separator,
        }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
            My Contact
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{
              width: 52, height: 52, borderRadius: 26,
              backgroundColor: C.label, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: C.bg }}>SK</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>Sammy Kalejaiye</Text>
              <Text style={{ fontSize: 13, color: C.secondary, marginTop: 2 }}>Founder & CEO</Text>
              <Text style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Your account manager</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <IconSymbol name="envelope" size={13} color={C.muted} />
            <Text style={{ fontSize: 12, color: C.secondary }}>sammy@kanext.io</Text>
          </View>
          <Pressable
            style={({ pressed }) => ({
              marginTop: 12, borderRadius: 10, paddingVertical: 10, alignItems: 'center',
              backgroundColor: pressed ? C.surfacePressed : C.label,
            })}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: C.bg }}>Message</Text>
          </Pressable>
        </View>

        {/* Company Leadership */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 1, textTransform: 'uppercase', paddingHorizontal: 16, marginBottom: 10 }}>
          Company Leadership
        </Text>
        {BIZ_LEADERSHIP_PUBLIC.map((person, i) => (
          <View
            key={person.name}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 12,
              paddingHorizontal: 16, paddingVertical: 14,
              borderTopWidth: i > 0 ? StyleSheet.hairlineWidth : 0, borderTopColor: C.separator,
            }}
          >
            <View style={{
              width: 44, height: 44, borderRadius: 22,
              backgroundColor: C.label, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>{person.initials}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }} numberOfLines={1}>{person.name}</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{person.title}</Text>
              <Text style={{ fontSize: 11, color: C.muted, marginTop: 2 }} numberOfLines={1}>{person.bio}</Text>
            </View>
          </View>
        ))}

        {/* Working With You */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 1, textTransform: 'uppercase', paddingHorizontal: 16, marginTop: 24, marginBottom: 10 }}>
          Working With You
        </Text>
        {BIZ_WORKING_WITH.map(person => (
          <View key={person.name} style={{
            flexDirection: 'row', alignItems: 'center', gap: 12,
            marginHorizontal: 16, marginBottom: 8, padding: 14,
            backgroundColor: C.surface, borderRadius: 12,
            borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator,
          }}>
            <View style={{
              width: 44, height: 44, borderRadius: 22,
              backgroundColor: C.label, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>{person.initials}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }} numberOfLines={1}>{person.name}</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{person.title}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <IconSymbol name="envelope" size={11} color={C.muted} />
                <Text style={{ fontSize: 11, color: C.muted }}>{person.email}</Text>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => ({
                paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
                backgroundColor: pressed ? C.surfacePressed : C.label,
              })}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: C.bg }}>Message</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ── Live Mode View ─────────────────────────────────────────────────────────────

function LiveNetworkView({ mode, C, insets }: { mode: string; C: any; insets: any }) {
  if (mode === 'business') {
    // Business Team public page
    const team = [
      { name: 'Sammy Kalejaiye', title: 'Founder & CEO', bio: 'Builder of KaNeXT OS. 10+ years in sports technology and institutional intelligence.' },
      { name: 'TBD', title: 'CTO', bio: 'Joining the team Q2 2026.' },
      { name: 'TBD', title: 'Head of Product', bio: 'Joining the team Q2 2026.' },
    ];
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <View style={{ height: insets.top + 52, backgroundColor: C.bg }} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, gap: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: C.label, paddingTop: 8 }}>Our Team</Text>
          {team.map(m => (
            <View key={m.name} style={{ backgroundColor: C.surface, borderRadius: 14, padding: 14, gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 18, color: C.secondary }}>{m.name[0]}</Text>
                </View>
                <View style={{ gap: 2 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{m.name}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{m.title}</Text>
                </View>
              </View>
              <Text style={{ fontSize: 13, color: C.secondary, lineHeight: 18 }}>{m.bio}</Text>
              <Pressable style={{ backgroundColor: C.separator, borderRadius: 10, paddingVertical: 8, alignItems: 'center' }}>
                <Text style={{ fontSize: 13, color: C.label }}>Contact</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (mode === 'education') {
    // Education Campus public page — faculty directory + programs
    const faculty = [
      { name: 'Dr. A. Johnson', dept: 'Business Administration', title: 'Dean, School of Business', hours: 'Mon/Wed 2–4 PM' },
      { name: 'Dr. M. Rivera', dept: 'Diagnostic Imaging', title: 'Program Director', hours: 'Tue/Thu 1–3 PM' },
      { name: 'Prof. L. Chen', dept: 'MBA Program', title: 'Associate Professor', hours: 'By appointment' },
    ];
    const programs = ['BA Business Administration', 'BS Diagnostic Imaging', 'MBA', 'MS International Banking & Finance (IBFM)', 'DBA'];
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <View style={{ height: insets.top + 52, backgroundColor: C.bg }} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, gap: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: C.label, paddingTop: 8 }}>Campus</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Faculty Directory</Text>
          {faculty.map(f => (
            <View key={f.name} style={{ backgroundColor: C.surface, borderRadius: 14, padding: 14, gap: 6 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{f.name}</Text>
              <Text style={{ fontSize: 12, color: C.secondary }}>{f.title} · {f.dept}</Text>
              <Text style={{ fontSize: 12, color: C.secondary }}>Office Hours: {f.hours}</Text>
            </View>
          ))}
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>Programs Offered</Text>
          {programs.map(p => (
            <View key={p} style={{ backgroundColor: C.surface, borderRadius: 12, padding: 14 }}>
              <Text style={{ fontSize: 14, color: C.label }}>{p}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (mode === 'community') {
    // Community Connect page — ministries list
    const ministries = [
      { name: 'Youth Ministry', desc: 'For ages 13–25. Meets Fridays 6 PM.' },
      { name: "Women's Ministry", desc: 'Monthly gatherings. Bible study and fellowship.' },
      { name: "Men's Ministry", desc: 'First Saturday of each month.' },
      { name: 'Marriage Ministry', desc: 'For couples at every stage.' },
      { name: 'Prayer Ministry', desc: 'Weekly corporate prayer. Tuesday 6 AM.' },
      { name: "Children's Ministry", desc: 'Sunday School during both services.' },
      { name: 'Choir & Worship', desc: 'Rehearsal Thursdays 7 PM. All voices welcome.' },
      { name: 'Media Ministry', desc: 'Live stream team, audio, photography.' },
    ];
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <View style={{ height: insets.top + 52, backgroundColor: C.bg }} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: C.label, paddingTop: 8 }}>Connect With Us</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 14, gap: 10 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>I Visited</Text>
            <Text style={{ fontSize: 13, color: C.secondary }}>New to ICCLA? Let us know you came. We'd love to connect with you.</Text>
            <Pressable style={{ backgroundColor: C.label, borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.bg }}>Register My Visit</Text>
            </Pressable>
          </View>
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Ministries</Text>
          {ministries.map(m => (
            <View key={m.name} style={{ backgroundColor: C.surface, borderRadius: 12, padding: 14, gap: 4 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{m.name}</Text>
              <Text style={{ fontSize: 13, color: C.secondary }}>{m.desc}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  // Personal (default) — public featured connections
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ height: insets.top + 52, backgroundColor: C.bg }} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, gap: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: C.label, paddingTop: 8 }}>Network</Text>
        <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 14, gap: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>Also followed by...</Text>
          {['Jordan M. · Creator', 'Alexis T. · Sports Agent', 'Marcus D. · Coach', 'TechSports Venture Fund'].map(c => (
            <View key={c} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 14, color: C.secondary }}>{c[0]}</Text>
              </View>
              <Text style={{ fontSize: 14, color: C.label }}>{c}</Text>
            </View>
          ))}
        </View>
        <Text style={{ fontSize: 13, color: C.secondary, textAlign: 'center' }}>Sign in to see your full network.</Text>
      </ScrollView>
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

  const { tab: tabParam } = useLocalSearchParams<{ tab?: Tab }>();
  const [tab, setTab]                 = useState<Tab>('Feed');
  const [selectedPill, setSelectedPill] = useState('All');
  const [searchQuery, setSearchQuery]   = useState('');
  const [demoRole, cycleRoleDemo, demoRoleCycles] = useDemoRole('personal:network');
  const isPersonalOwner = demoRole === demoRoleCycles[0];
  // role derives from demo switch in personal mode
  const role: Role = isPersonalOwner ? 'owner' : 'member';
  // Follower demo tier is 'supporters'
  const FOLLOWER_TIER_ID = 'supporters';
  const TIER_RANK: Record<string, number> = { free: 0, supporters: 1, inner_circle: 2 };

  const { state } = useAppContext();
  const mode = state.activeContext?.mode ?? (state as any).mode ?? 'personal';
  const dataMode = useDataMode();
  const [eduRole, cycleEduRole, eduRoleCycles] = useDemoRole('education');
  const isEduAdmin = eduRole === eduRoleCycles[0];
  const [bizRole, cycleBizRole, bizRoleCycles] = useDemoRole('business');
  const isBusinessAdmin = bizRole === bizRoleCycles[0];


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

  // Locked space upgrade sheet (follower)
  const [lockedSpace, setLockedSpace] = useState<typeof COMMUNITY_SPACES[0] | null>(null);

  // Connect compose (follower "Looking For" post)
  const [showCompose, setShowCompose] = useState(false);
  const [composeText, setComposeText] = useState('');
  const [composeTags, setComposeTags] = useState<string[]>([]);

  // Follower community view state
  const [membersExpanded, setMembersExpanded] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [followerSearch, setFollowerSearch] = useState('');
  const [followerPill, setFollowerPill] = useState('All');

  // Feed tab state
  const [feedFilter, setFeedFilter] = useState<string>('All');
  const [postMenuId, setPostMenuId] = useState<string | null>(null);
  const [composerText, setComposerText] = useState('');

  const lastScrollY = useRef(0);

  const activePills = useMemo((): string[] => {
    if (tab === 'Community') {
      if (isPersonalOwner) return PILLS.Community;
      return []; // pills live inside the expanded Members section
    }
    if (tab === 'Spaces') {
      if (isPersonalOwner) return PILLS.Spaces;
      const rank = TIER_RANK[FOLLOWER_TIER_ID] ?? 0;
      if (rank >= 2) return ['All', 'My Spaces', 'Public', 'Tier-Locked'];
      if (rank >= 1) return ['All', 'My Spaces', 'Public'];
      return ['All', 'Public'];
    }
    if (tab === 'Connect') {
      if (isPersonalOwner) return PILLS.Connect;
      return ['All', 'Entrepreneurship', 'Fitness', 'Coding', 'Design', 'Marketing'];
    }
    return PILLS[tab];
  }, [tab, isPersonalOwner]);

  const scrollPadTop = topBarH + (activePills.length > 0 ? PILL_ROW_H : 0) + 8;

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleSwitchTab = useCallback((newTab: Tab) => {
    setTab(newTab);
    setSelectedPill('All');
    setSearchQuery('');
    setIntroduceMode(false);
    setIntroduceSource(null);
  }, []);

  useEffect(() => {
    if (tabParam && ['Feed', 'Community', 'Spaces', 'Connect'].includes(tabParam)) {
      handleSwitchTab(tabParam as Tab);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabParam]);

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


  // ── Filtered data ──
  const filteredMembers = useMemo(() => {
    const raw = searchQuery ? searchMembers(searchQuery) : COMMUNITY_MEMBERS;
    const base = isPersonalOwner ? raw : raw.filter(m => (TIER_RANK[m.tierId] ?? 0) <= (TIER_RANK[FOLLOWER_TIER_ID] ?? 0));
    if (selectedPill === 'All') return base;
    if (selectedPill === 'Online Now') return base.filter(m => m.isOnline);
    if (selectedPill === 'New This Week') return base.filter(m => isNewThisWeek(m.joinDate));
    const tier = COMMUNITY_TIERS.find(t => t.name === selectedPill);
    if (tier) return base.filter(m => m.tierId === tier.id);
    return base;
  }, [searchQuery, selectedPill, isPersonalOwner]);

  const filteredSpaces = useMemo(() => {
    if (selectedPill === 'All') return COMMUNITY_SPACES;
    if (selectedPill === 'Public') return COMMUNITY_SPACES.filter(s => !s.tierId || s.tierId === 'free');
    if (selectedPill === 'Tier-Locked') return COMMUNITY_SPACES.filter(s => s.tierId && s.tierId !== 'free');
    if (selectedPill === 'My Spaces') return COMMUNITY_SPACES.filter(s => !s.tierId || s.tierId === 'free' || s.tierId === 'supporters');
    return COMMUNITY_SPACES;
  }, [selectedPill]);

  const filteredConnect = useMemo(() => {
    const base = isPersonalOwner
      ? COMMUNITY_MEMBERS
      : COMMUNITY_MEMBERS.filter(m => (TIER_RANK[m.tierId] ?? 0) <= (TIER_RANK[FOLLOWER_TIER_ID] ?? 0));
    if (selectedPill === 'Looking For') return [];
    if (selectedPill === 'All') return base;
    return base.filter(m => m.interests.includes(selectedPill.toLowerCase()));
  }, [selectedPill, isPersonalOwner]);

  if (dataMode === 'live') return <LiveNetworkView mode={mode} C={C} insets={insets} />;

  const isOwner   = role === 'owner';
  const isMember  = role === 'member';
  const isVisitor = role === 'visitor';

  // ── Render tabs ──────────────────────────────────────────────────────────────

  function renderFeedTab() {
    const TYPE_CONFIG: Record<FeedItemType, { icon: string; label: string; color: string }> = {
      announcement: { icon: 'megaphone.fill',                    label: 'Announcement', color: '#B8943E'    },
      win:          { icon: 'trophy.fill',                       label: 'Win',          color: '#5A8A6E'    },
      discussion:   { icon: 'bubble.left.and.bubble.right.fill', label: 'Discussion',   color: C.secondary  },
      intro:        { icon: 'person.badge.plus',                 label: 'New Member',   color: C.secondary  },
      post:         { icon: 'text.bubble.fill',                  label: 'Post',         color: C.secondary  },
    };

    const FILTER_TYPE_MAP: Record<string, FeedItemType> = {
      Announcements: 'announcement',
      Discussions:   'discussion',
      Wins:          'win',
      Introductions: 'intro',
    };

    const filteredFeed = feedFilter === 'All'
      ? COMMUNITY_FEED
      : COMMUNITY_FEED.filter(item => item.type === FILTER_TYPE_MAP[feedFilter]);

    const FEED_FILTERS = ['All', 'Announcements', 'Discussions', 'Wins', 'Introductions'];

    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topBarH + 8, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >

        {/* ── 1. Pinned post ─────────────────────────────────────────── */}
        <View style={{
          marginHorizontal: 16, marginBottom: 12, borderRadius: 14, padding: 14,
          backgroundColor: C.surface,
          borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator,
        }}>
          {/* Pin label row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <IconSymbol name="pin.fill" size={12} color="#B8943E" />
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#B8943E' }}>Pinned</Text>
            </View>
            {isPersonalOwner && (
              <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                <Text style={{ fontSize: 13, color: C.secondary }}>Edit</Text>
              </Pressable>
            )}
          </View>
          {/* Author row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Avatar initials="SK" hue={220} size={32} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Sammy Kalejaiye</Text>
              <Text style={{ fontSize: 11, color: C.secondary }}>30m ago</Text>
            </View>
          </View>
          {/* Content */}
          <Text style={{ fontSize: 14, color: C.label, lineHeight: 20 }}>
            {"Welcome to the community! 🎉 Drop an intro below — tell us who you are, what you do, and what you're building. We're all here to grow together."}
          </Text>
        </View>

        {/* ── 2. Post composer ───────────────────────────────────────── */}
        <View style={{
          marginHorizontal: 16, marginBottom: 12, borderRadius: 14, padding: 12,
          backgroundColor: C.surface,
          borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
            <Avatar initials="SK" hue={220} size={34} />
            <TextInput
              style={{ flex: 1, fontSize: 15, color: C.label, minHeight: 40 }}
              placeholder="Share something with the community..."
              placeholderTextColor={C.secondary}
              value={composerText}
              onChangeText={setComposerText}
              multiline
            />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            {(['photo.fill', 'video.fill', 'chart.bar.fill', 'link'] as const).map(icon => (
              <Pressable
                key={icon}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name={icon} size={18} color={C.secondary} />
              </Pressable>
            ))}
            <View style={{ flex: 1 }} />
            <Pressable
              style={{ backgroundColor: C.label, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 6 }}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.bg }}>Post</Text>
            </Pressable>
          </View>
        </View>

        {/* ── 3. Category filter pills ───────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          style={{ marginBottom: 12 }}
        >
          {FEED_FILTERS.map(f => (
            <Pressable
              key={f}
              style={{
                paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
                backgroundColor: feedFilter === f ? C.label : C.surface,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: feedFilter === f ? C.label : C.separator,
              }}
              onPress={() => { setFeedFilter(f); Haptics.selectionAsync(); }}
            >
              <Text style={{
                fontSize: 13, fontWeight: feedFilter === f ? '600' : '400',
                color: feedFilter === f ? C.bg : C.secondary,
              }}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* ── 4. Activity feed ───────────────────────────────────────── */}
        {filteredFeed.map((item, idx) => {
          const cfg = TYPE_CONFIG[item.type];
          const isGated = !isPersonalOwner && item.tier && item.tier !== 'free';

          return (
            <Pressable
              key={item.id}
              style={({ pressed }) => ({
                paddingHorizontal: 16, paddingVertical: 14,
                borderTopWidth: idx > 0 ? StyleSheet.hairlineWidth : 0,
                borderTopColor: C.separator,
                backgroundColor: pressed ? C.surface : 'transparent',
              })}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (postMenuId === item.id) setPostMenuId(null);
              }}
            >
              {/* Header row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Avatar initials={item.author.initials} hue={item.author.hue} size={38} />
                {/* Center column: name + tier badge + handle · timestamp */}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{item.author.name}</Text>
                    {item.tier ? (
                      <View style={{
                        paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6,
                        backgroundColor: C.surface,
                        borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator,
                        marginLeft: 4,
                      }}>
                        <Text style={{
                          fontSize: 10,
                          color: item.tier === 'inner_circle' ? C.label
                               : item.tier === 'supporters'   ? '#B8943E'
                               : C.secondary,
                        }}>
                          {item.tier === 'inner_circle' ? 'IC'
                           : item.tier === 'supporters' ? 'S+'
                           : 'FC'}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={{ fontSize: 12, color: C.secondary }}>
                    {item.author.handle} · {item.timestamp}
                  </Text>
                </View>
                {/* Type badge */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <IconSymbol name={cfg.icon as any} size={12} color={cfg.color} />
                  <Text style={{ fontSize: 10, fontWeight: '600', color: cfg.color }}>{cfg.label}</Text>
                </View>
                {/* Owner ••• menu button */}
                {isPersonalOwner && (
                  <Pressable
                    style={{ paddingLeft: 8 }}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setPostMenuId(prev => prev === item.id ? null : item.id);
                    }}
                  >
                    <IconSymbol name="ellipsis" size={16} color={C.secondary} />
                  </Pressable>
                )}
              </View>

              {/* Owner inline mini-menu */}
              {isPersonalOwner && postMenuId === item.id && (
                <View style={{
                  flexDirection: 'row', gap: 0, marginBottom: 8,
                  backgroundColor: C.surface, borderRadius: 10,
                  borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator,
                  alignSelf: 'flex-end',
                  overflow: 'hidden',
                }}>
                  {[
                    { label: 'Pin', icon: 'pin.fill' },
                    { label: 'Delete', icon: 'trash.fill' },
                  ].map((action, ai) => (
                    <Pressable
                      key={action.label}
                      style={({ pressed }) => ({
                        flexDirection: 'row', alignItems: 'center', gap: 5,
                        paddingHorizontal: 14, paddingVertical: 8,
                        backgroundColor: pressed ? C.separator : 'transparent',
                        borderLeftWidth: ai > 0 ? StyleSheet.hairlineWidth : 0,
                        borderLeftColor: C.separator,
                      })}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        setPostMenuId(null);
                      }}
                    >
                      <IconSymbol name={action.icon as any} size={12} color={action.label === 'Delete' ? '#B85C5C' : C.label} />
                      <Text style={{ fontSize: 13, fontWeight: '500', color: action.label === 'Delete' ? '#B85C5C' : C.label }}>
                        {action.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}

              {/* Content — gated or full */}
              {isGated ? (
                <View style={{
                  backgroundColor: C.surface, borderRadius: 10, padding: 12,
                  flexDirection: 'row', alignItems: 'center', gap: 10,
                }}>
                  <IconSymbol name="lock.fill" size={16} color={C.secondary} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Supporters+ content</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>Upgrade to view this post</Text>
                  </View>
                  <Pressable
                    style={{ backgroundColor: C.label, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 }}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: C.bg }}>Upgrade</Text>
                  </Pressable>
                </View>
              ) : (
                <Text style={{ fontSize: 14, color: C.label, lineHeight: 20, marginBottom: 10 }}>
                  {item.content}
                </Text>
              )}

              {/* Actions row */}
              {!isGated && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
                  <Pressable
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
                  >
                    <IconSymbol name="heart" size={16} color={C.secondary} />
                    <Text style={{ fontSize: 13, color: C.secondary }}>{item.likes}</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
                  >
                    <IconSymbol name="bubble.right" size={16} color={C.secondary} />
                    <Text style={{ fontSize: 13, color: C.secondary }}>{item.replies}</Text>
                  </Pressable>
                  <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                    <IconSymbol name="paperplane" size={16} color={C.secondary} />
                  </Pressable>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    );
  }

  function renderCommunityTab() {
    // ── Visitor: tier join cards ──────────────────────────────────────────────
    if (isVisitor) {
      return (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: scrollPadTop, paddingBottom: insets.bottom + 80 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
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
              {[{ value: '60', label: 'Members' }, { value: '4', label: 'Spaces' }, { value: '34', label: 'Active' }].map(s => (
                <View key={s.label} style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: C.label }}>{s.value}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>
          <Text style={[styles.sectionHeader, { marginTop: 16 }]}>Choose your tier to join</Text>
          {COMMUNITY_TIERS.map(tier => (
            <View key={tier.id} style={[styles.card, { marginHorizontal: 16, marginBottom: 10, borderColor: tier.color + '44', borderWidth: 1.5 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: tier.color }}>{tier.name}</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{tier.price === 0 ? 'Free' : `$${tier.price}/mo`}</Text>
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
                style={({ pressed }) => ({ marginTop: 14, borderRadius: 10, paddingVertical: 10, alignItems: 'center', backgroundColor: tier.price === 0 ? C.label : tier.color, opacity: pressed ? 0.8 : 1 })}
                onPress={() => showToast(tier.price === 0 ? 'Joined Free Community!' : `Subscribed to ${tier.name}!`)}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>{tier.price === 0 ? 'Join Free' : `Subscribe · $${tier.price}/mo`}</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      );
    }

    // ── Owner: full management view ───────────────────────────────────────────
    if (isOwner) {
      return (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: scrollPadTop, paddingBottom: insets.bottom + 80 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          {/* Stats row */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingBottom: 4 }}>
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

          {/* Introduce mode banner */}
          {introduceMode && (
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
          <View style={[styles.searchBar, { marginTop: 12 }]}>
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

          {/* Tier sections or filtered flat list */}
          {searchQuery === '' && selectedPill === 'All' ? (
            COMMUNITY_TIERS.map(tier => {
              const members = getMembersByTier(tier.id);
              return (
                <View key={tier.id}>
                  <View style={styles.tierHeader}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: tier.color }} />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{tier.name}</Text>
                    <View style={[styles.countBadge, { backgroundColor: tier.color + '20' }]}>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: tier.color }}>{tier.memberCount}</Text>
                    </View>
                  </View>
                  {members.map(m => (
                    <MemberRow
                      key={m.id} member={m} C={C} isOwner={true}
                      introduceMode={introduceMode}
                      isIntroduceSource={introduceSource === m.id}
                      onPress={handleMemberPress}
                      onIntroduce={(mem) => {
                        if (!introduceSource) { setIntroduceSource(mem.id); }
                        else { setIntroduceTarget(mem.id); setIntroduceConfirm(true); }
                      }}
                    />
                  ))}
                  <View style={styles.divider} />
                </View>
              );
            })
          ) : (
            filteredMembers.length === 0 ? (
              <View style={styles.emptyState}>
                <IconSymbol name="person.slash" size={32} color={C.muted} />
                <Text style={{ fontSize: 14, color: C.muted, marginTop: 8 }}>No members found</Text>
              </View>
            ) : (
              filteredMembers.map(m => (
                <MemberRow
                  key={m.id} member={m} C={C} isOwner={true}
                  introduceMode={introduceMode}
                  isIntroduceSource={introduceSource === m.id}
                  onPress={handleMemberPress}
                  onIntroduce={(mem) => {
                    if (!introduceSource) { setIntroduceSource(mem.id); }
                    else { setIntroduceTarget(mem.id); setIntroduceConfirm(true); }
                  }}
                />
              ))
            )
          )}

          {/* Introduce members button */}
          {!introduceMode && (
            <Pressable
              style={({ pressed }) => [styles.introduceBtn, { backgroundColor: pressed ? C.surfacePressed : C.surface, borderColor: C.inputBorder }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIntroduceMode(true); }}
            >
              <IconSymbol name="arrow.left.arrow.right" size={16} color={C.accent} />
              <Text style={{ fontSize: 14, fontWeight: '500', color: C.accent }}>Introduce Members</Text>
            </Pressable>
          )}

          {/* Events */}
          <Text style={[styles.sectionHeader, { marginTop: 24 }]}>Upcoming Events</Text>
          {COMMUNITY_EVENTS.map(event => (
            <EventCard
              key={event.id} event={event} C={C}
              rsvped={rsvped.has(event.id)}
              canAccess={true}
              onRsvp={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setRsvped(prev => { const s = new Set(prev); if (s.has(event.id)) s.delete(event.id); else s.add(event.id); return s; });
              }}
            />
          ))}
        </ScrollView>
      );
    }

    // ── Follower (member) view ────────────────────────────────────────────────
    const accessibleMembers = COMMUNITY_MEMBERS.filter(m => (TIER_RANK[m.tierId] ?? 0) <= (TIER_RANK[FOLLOWER_TIER_ID] ?? 0));
    const previewMembers    = accessibleMembers.slice(0, 8);
    const extraCount        = Math.max(0, accessibleMembers.length - 8);
    const accessibleTiers   = COMMUNITY_TIERS.filter(t => (TIER_RANK[t.id] ?? 0) <= (TIER_RANK[FOLLOWER_TIER_ID] ?? 0));
    const followerPills     = accessibleTiers.length > 1 ? ['All', ...accessibleTiers.map(t => t.name)] : [];

    const expandedMembers = (() => {
      let base = accessibleMembers;
      if (followerSearch) {
        const q = followerSearch.toLowerCase();
        base = base.filter(m => m.name.toLowerCase().includes(q) || (m.handle ?? '').toLowerCase().includes(q));
      }
      if (followerPill !== 'All') {
        const tier = accessibleTiers.find(t => t.name === followerPill);
        if (tier) base = base.filter(m => m.tierId === tier.id);
      }
      return base;
    })();

    const leaderboard = accessibleMembers.slice(0, 5).map((m, i) => ({
      member: m,
      rank:   i + 1,
      pts:    [87, 72, 61, 48, 35][i],
      streak: [5, 3, 0, 4, 0][i],
    }));

    const sortedEvents  = [...COMMUNITY_EVENTS].sort((a, b) => a.date.getTime() - b.date.getTime());
    const MAX_EVENTS    = 4;
    const visibleEvents = showAllEvents ? sortedEvents : sortedEvents.slice(0, MAX_EVENTS);

    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topBarH + 8, paddingBottom: insets.bottom + 80 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Upcoming Events ─────────────────────────────────────────── */}
        <Text style={styles.sectionHeader}>Upcoming Events</Text>
        {sortedEvents.length === 0 ? (
          <Text style={{ fontSize: 13, color: C.muted, paddingHorizontal: 16, marginBottom: 16 }}>No upcoming events.</Text>
        ) : (
          <>
            <View style={{ backgroundColor: C.surface, borderRadius: 14, marginHorizontal: 16, marginBottom: 4, overflow: 'hidden' }}>
              {visibleEvents.map((event, idx) => {
                const eventAccessible = event.tierId === null || (TIER_RANK[event.tierId] ?? 0) <= (TIER_RANK[FOLLOWER_TIER_ID] ?? 0);
                return (
                  <React.Fragment key={event.id}>
                    <EventCard
                      event={event} C={C}
                      rsvped={rsvped.has(event.id)}
                      canAccess={eventAccessible}
                      onRsvp={() => {
                        if (!eventAccessible) return;
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setRsvped(prev => { const s = new Set(prev); if (s.has(event.id)) s.delete(event.id); else s.add(event.id); return s; });
                      }}
                    />
                    {idx < visibleEvents.length - 1 && <View style={styles.divider} />}
                  </React.Fragment>
                );
              })}
            </View>
            {sortedEvents.length > MAX_EVENTS && !showAllEvents && (
              <Pressable
                onPress={() => setShowAllEvents(true)}
                style={{ alignItems: 'center', paddingVertical: 10, marginBottom: 4 }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>See All Events ({sortedEvents.length})</Text>
              </Pressable>
            )}
          </>
        )}

        {/* ── 2. Leaderboard ────────────────────────────────────────────── */}
        <Text style={[styles.sectionHeader, { marginTop: 16 }]}>Top Members This Week</Text>
        <View style={{ backgroundColor: C.surface, borderRadius: 14, marginHorizontal: 16, marginBottom: 4, paddingVertical: 4 }}>
          {leaderboard.map((entry, idx) => (
            <View key={entry.member.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 10 }}>
                <Text style={{ width: 18, fontSize: 14, fontWeight: '700', color: idx === 0 ? '#B8943E' : C.secondary, textAlign: 'center' }}>{entry.rank}</Text>
                <Avatar initials={entry.member.initials} hue={entry.member.avatarHue} size={34} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{entry.member.name}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{entry.pts} pts this week</Text>
                </View>
                {entry.streak >= 3 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, backgroundColor: C.surfacePressed }}>
                    <Text style={{ fontSize: 12 }}>🔥</Text>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary }}>{entry.streak}w</Text>
                  </View>
                )}
              </View>
              {idx < leaderboard.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
          <Pressable
            onPress={() => showToast('Full leaderboard coming soon')}
            style={({ pressed }) => ({ alignItems: 'center', paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator, opacity: pressed ? 0.7 : 1 })}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>View Full Leaderboard</Text>
          </Pressable>
        </View>

        {/* ── 3. This Week's Prompt ─────────────────────────────────────── */}
        <Text style={[styles.sectionHeader, { marginTop: 16 }]}>{"This Week's Prompt"}</Text>
        <View style={{ backgroundColor: C.surface, borderRadius: 14, marginHorizontal: 16, marginBottom: 4, padding: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <IconSymbol name="mic.fill" size={15} color={C.secondary} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 0.5 }}>{"THIS WEEK'S PROMPT"}</Text>
          </View>
          <Text style={{ fontSize: 15, fontWeight: '600', color: C.label, lineHeight: 22 }}>
            {`"${ICEBREAKER_PROMPT.text}"`}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <Text style={{ fontSize: 12, color: C.muted }}>{ICEBREAKER_PROMPT.responseCount} responses</Text>
            <Pressable
              style={({ pressed }) => ({ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, backgroundColor: C.label, opacity: pressed ? 0.8 : 1 })}
              onPress={() => { Haptics.selectionAsync(); handleSwitchTab('Connect'); }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.bg }}>Join Conversation</Text>
            </Pressable>
          </View>
        </View>

        {/* ── 4. Members ────────────────────────────────────────────────── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, paddingHorizontal: 16, marginBottom: 8 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>Members</Text>
          <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, backgroundColor: C.surfacePressed }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary }}>{accessibleMembers.length}</Text>
          </View>
        </View>

        {!membersExpanded ? (
          // Collapsed: avatar row preview
          <View style={{ marginHorizontal: 16 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, alignItems: 'center' }}>
              {previewMembers.map(m => (
                <Pressable key={m.id} onPress={() => { setActionTarget(m); setActionSheetOpen(true); }}>
                  <Avatar initials={m.initials} hue={m.avatarHue} size={40} />
                </Pressable>
              ))}
              {extraCount > 0 && (
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.separator }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: C.secondary }}>+{extraCount}</Text>
                </View>
              )}
            </ScrollView>
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMembersExpanded(true); }}
              style={({ pressed }) => ({ marginTop: 10, borderRadius: 10, paddingVertical: 11, alignItems: 'center', borderWidth: 1.5, borderColor: C.label, backgroundColor: pressed ? C.surface : 'transparent' })}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>See All Members</Text>
            </Pressable>
          </View>
        ) : (
          // Expanded: search + tier pills + full list
          <View>
            <View style={[styles.searchBar, { marginHorizontal: 16, marginBottom: 8 }]}>
              <IconSymbol name="magnifyingglass" size={16} color={C.muted} />
              <TextInput
                style={{ flex: 1, fontSize: 14, color: C.label }}
                placeholder="Search members..."
                placeholderTextColor={C.muted}
                value={followerSearch}
                onChangeText={setFollowerSearch}
                returnKeyType="search"
              />
              {followerSearch.length > 0 && (
                <Pressable onPress={() => setFollowerSearch('')}>
                  <IconSymbol name="xmark.circle.fill" size={16} color={C.muted} />
                </Pressable>
              )}
            </View>

            {followerPills.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, marginBottom: 8 }}>
                {followerPills.map(pill => (
                  <Pressable
                    key={pill}
                    onPress={() => { Haptics.selectionAsync(); setFollowerPill(pill); }}
                    style={[styles.pill, followerPill === pill && styles.pillActive]}
                  >
                    <Text style={[styles.pillText, followerPill === pill && styles.pillTextActive]}>{pill}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            {expandedMembers.length === 0 ? (
              <View style={styles.emptyState}>
                <IconSymbol name="person.slash" size={32} color={C.muted} />
                <Text style={{ fontSize: 14, color: C.muted, marginTop: 8 }}>No members found</Text>
              </View>
            ) : followerPill === 'All' && !followerSearch ? (
              accessibleTiers.map(tier => {
                const members = getMembersByTier(tier.id).filter(m => (TIER_RANK[m.tierId] ?? 0) <= (TIER_RANK[FOLLOWER_TIER_ID] ?? 0));
                if (members.length === 0) return null;
                return (
                  <View key={tier.id}>
                    {accessibleTiers.length > 1 && (
                      <View style={styles.tierHeader}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: tier.color }} />
                        <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{tier.name}</Text>
                        <View style={[styles.countBadge, { backgroundColor: tier.color + '20' }]}>
                          <Text style={{ fontSize: 11, fontWeight: '600', color: tier.color }}>{members.length}</Text>
                        </View>
                      </View>
                    )}
                    {members.map(m => (
                      <MemberRow key={m.id} member={m} C={C} isOwner={false} introduceMode={false} isIntroduceSource={false} onPress={handleMemberPress} onIntroduce={undefined} />
                    ))}
                    {accessibleTiers.length > 1 && <View style={styles.divider} />}
                  </View>
                );
              })
            ) : (
              expandedMembers.map(m => (
                <MemberRow key={m.id} member={m} C={C} isOwner={false} introduceMode={false} isIntroduceSource={false} onPress={handleMemberPress} onIntroduce={undefined} />
              ))
            )}

            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMembersExpanded(false); setFollowerSearch(''); setFollowerPill('All'); }}
              style={{ alignItems: 'center', paddingVertical: 14 }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>Collapse</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    );
  }

  function renderSpacesTab() {
    if (isOwner) {
      return (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: scrollPadTop, paddingBottom: 49 + insets.bottom + 24 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.sectionHeader, { marginBottom: 4 }]}>Community Spaces</Text>
          <Text style={{ fontSize: 13, color: C.muted, paddingHorizontal: 16, marginBottom: 12 }}>
            Spaces are Rooms in Messages — tiered access, topic channels, community conversation.
          </Text>
          {filteredSpaces.map((space, idx) => (
            <React.Fragment key={space.id}>
              <SpaceCard
                space={space} C={C} role={role} memberTierId={FOLLOWER_TIER_ID}
                onPress={(s) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); showToast(`Opening ${s.name} in Messages…`); }}
              />
              {idx < filteredSpaces.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
          <Pressable
            style={({ pressed }) => [styles.createBtn, { backgroundColor: pressed ? C.surfacePressed : C.surface, borderColor: C.inputBorder }]}
            onPress={() => showToast('Create Space — coming soon')}
          >
            <IconSymbol name="plus.circle" size={18} color={C.accent} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: C.accent }}>Create Space</Text>
          </Pressable>
        </ScrollView>
      );
    }

    // Follower view — split into accessible vs locked
    const isSpaceLocked = (space: typeof COMMUNITY_SPACES[0]) =>
      (isVisitor && space.tierId !== 'free' && space.tierId !== null) ||
      (isMember && space.tierId !== null && (TIER_RANK[space.tierId] ?? 0) > (TIER_RANK[FOLLOWER_TIER_ID] ?? 0));

    const mySpaces      = filteredSpaces.filter(s => !isSpaceLocked(s));
    const upgradeable   = filteredSpaces.filter(s => isSpaceLocked(s));

    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: scrollPadTop, paddingBottom: 49 + insets.bottom + 24 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {mySpaces.length > 0 && (
          <>
            <Text style={[styles.sectionHeader, { marginBottom: 4 }]}>Your Spaces</Text>
            {mySpaces.map((space, idx) => (
              <React.Fragment key={space.id}>
                <SpaceCard
                  space={space} C={C} role={role} memberTierId={FOLLOWER_TIER_ID}
                  onPress={(s) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); showToast(`Opening ${s.name} in Messages…`); }}
                />
                {idx < mySpaces.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </>
        )}

        {upgradeable.length > 0 && (
          <>
            {mySpaces.length > 0 && <View style={[styles.divider, { marginVertical: 8 }]} />}
            <Text style={[styles.sectionHeader, { marginBottom: 4 }]}>Upgrade to Unlock</Text>
            {upgradeable.map((space, idx) => (
              <React.Fragment key={space.id}>
                <View style={{ opacity: 0.45 }}>
                  <SpaceCard
                    space={space} C={C} role={role} memberTierId={FOLLOWER_TIER_ID}
                    onPress={(s) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setLockedSpace(s); }}
                  />
                </View>
                {idx < upgradeable.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </>
        )}

        {mySpaces.length === 0 && upgradeable.length === 0 && (
          <Text style={{ fontSize: 14, color: C.muted, textAlign: 'center', marginTop: 40, paddingHorizontal: 32 }}>
            No spaces match your current filter.
          </Text>
        )}
      </ScrollView>
    );
  }

  function renderConnectTab() {
    if (isPersonalOwner) {
      const showLookingFor = selectedPill === 'Looking For' || selectedPill === 'All';
      const showDirectory  = selectedPill !== 'Looking For';
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
              <Text style={{ fontSize: 11, fontWeight: '700', color: C.accent }}>{"THIS WEEK'S PROMPT"}</Text>
            </View>
            <Text style={{ fontSize: 15, fontWeight: '600', color: C.label, lineHeight: 22 }}>
              {`"${ICEBREAKER_PROMPT.text}"`}
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
          {showDirectory && filteredConnect.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>
                {selectedPill === 'All' ? 'Explore Members' : `${selectedPill} Members`}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 }}>
                {filteredConnect.map(m => (
                  <View key={m.id} style={{ width: (width - 42) / 2 }}>
                    <ConnectCard member={m} C={C} onPress={() => { setActionTarget(m); setActionSheetOpen(true); }} />
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      );
    }

    // Follower view — both sections always visible, filtered by interest pill
    const interestFilter = (tags: string[]) =>
      selectedPill === 'All' || tags.some(t => t === selectedPill);
    const visiblePosts   = LOOKING_FOR_POSTS.filter(p => interestFilter(p.tags));
    const visibleMembers = filteredConnect.filter(m =>
      selectedPill === 'All' || (m.interests ?? []).some((i: string) => i === selectedPill)
    );

    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: scrollPadTop, paddingBottom: insets.bottom + 80 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Ice-breaker prompt */}
        <View style={[styles.card, { marginHorizontal: 16, marginBottom: 16, borderColor: C.separator, borderWidth: 1 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <IconSymbol name="mic.fill" size={14} color={C.secondary} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary }}>{"THIS WEEK'S PROMPT"}</Text>
          </View>
          <Text style={{ fontSize: 15, fontWeight: '600', color: C.label, lineHeight: 22 }}>
            {`"${ICEBREAKER_PROMPT.text}"`}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <Text style={{ fontSize: 12, color: C.muted }}>{ICEBREAKER_PROMPT.responseCount} responses</Text>
            <Pressable
              style={({ pressed }) => ({
                paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10,
                borderWidth: 1, borderColor: C.label, backgroundColor: 'transparent',
                opacity: pressed ? 0.7 : 1,
              })}
              onPress={() => showToast('Opening prompt thread in General Community…')}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Join Conversation</Text>
            </Pressable>
          </View>
        </View>

        {/* Looking For */}
        <Text style={styles.sectionHeader}>Looking For</Text>
        {visiblePosts.map(post => {
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
                  style={({ pressed }) => ({
                    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8,
                    borderWidth: 1, borderColor: C.label, backgroundColor: 'transparent',
                    opacity: pressed ? 0.7 : 1,
                  })}
                  onPress={() => showToast('Opening conversation…')}
                >
                  <Text style={{ fontSize: 13, fontWeight: '500', color: C.label }}>Respond</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
        {visiblePosts.length === 0 && (
          <Text style={{ fontSize: 13, color: C.muted, paddingHorizontal: 16, marginBottom: 16 }}>
            No posts match this interest yet.
          </Text>
        )}

        {/* Explore Members */}
        {visibleMembers.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>
              {selectedPill === 'All' ? 'Explore Members' : `${selectedPill} Members`}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 }}>
              {visibleMembers.map(m => (
                <View key={m.id} style={{ width: (width - 42) / 2 }}>
                  <ConnectCard member={m} C={C} onPress={() => { setActionTarget(m); setActionSheetOpen(true); }} />
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    );
  }


  // ── Business mode early returns ──────────────────────────────────────────
  if (mode === 'business' && isBusinessAdmin) {
    return (
      <BusinessCEOTeamView
        C={C}
        insets={insets}
        role={bizRole}
        cycleRole={cycleBizRole}
      />
    );
  }

  if (mode === 'business') {
    return (
      <BusinessCustomerTeamView
        C={C}
        insets={insets}
        role={bizRole}
        cycleRole={cycleBizRole}
      />
    );
  }

  // ── Education mode early returns ─────────────────────────────────────────
  if (mode === 'education' && isEduAdmin) {
    return (
      <EducationPresidentCampusView
        C={C}
        insets={insets}
        role={eduRole}
        cycleRole={cycleEduRole}
      />
    );
  }

  if (mode === 'education' && !isEduAdmin) {
    return (
      <EducationStudentDirectoryView
        C={C}
        insets={insets}
        role={eduRole}
        cycleRole={cycleEduRole}
      />
    );
  }

  // ── UI shell ──────────────────────────────────────────────────────────────────

  const roleColor = role === 'owner' ? C.accent : role === 'member' ? '#5A8A6E' : C.secondary;

  return (
    <View style={[styles.screen, { backgroundColor: C.bg }]}>

      {/* Fixed top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top, height: topBarH, borderBottomColor: C.separator }]}>
        {/* Left: K menu button */}
        <View style={styles.topBarSide}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); if (mode !== 'personal' || isPersonalOwner) openSidePanel(); }}>
            <KMenuButton />
          </Pressable>
        </View>

        {/* Center: "Community" title pill */}
        {mode === 'personal' ? (
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ backgroundColor: C.label, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 5 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>Community</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.staticPill, { backgroundColor: C.surface, borderColor: C.separator }]}>
            <Text style={styles.staticPillText}>{tab}</Text>
          </View>
        )}

        {/* Right: RolePill */}
        <View style={[styles.topBarSide, { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }]}>
          <RolePill
            role={demoRole}
            onPress={cycleRoleDemo}
            accentColor={C.label}
            isPrimary={isPersonalOwner}
          />
        </View>
      </View>

      {/* Filter pills — shown only when activePills is non-empty */}
      {activePills.length > 0 && (
        <View style={[styles.pillsRow, { top: topBarH, backgroundColor: C.bg, borderBottomColor: C.separator }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center' }}>
            {activePills.map(pill => (
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
      {tab === 'Feed'      ? renderFeedTab()
        : tab === 'Community' ? renderCommunityTab()
        : tab === 'Spaces'    ? renderSpacesTab()
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

      {/* Connect FAB — follower only */}
      {tab === 'Connect' && isMember && (
        <Pressable
          style={({ pressed }) => ({
            position: 'absolute', bottom: 49 + insets.bottom + 16, right: 16,
            width: 52, height: 52, borderRadius: 26,
            backgroundColor: C.label, alignItems: 'center', justifyContent: 'center',
            opacity: pressed ? 0.8 : 1,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
          })}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowCompose(true); }}
        >
          <IconSymbol name="plus" size={22} color={C.bg} />
        </Pressable>
      )}

      {/* Connect compose sheet (follower) */}
      <BottomSheet visible={showCompose} onClose={() => { setShowCompose(false); setComposeText(''); setComposeTags([]); }} useModal>
        <View style={{ padding: 20, gap: 14, paddingBottom: 32 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: C.label }}>Looking For</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, padding: 12, minHeight: 80 }}>
            <TextInput
              style={{ fontSize: 15, color: C.label, lineHeight: 22 }}
              placeholder="What are you looking for?"
              placeholderTextColor={C.secondary}
              multiline
              value={composeText}
              onChangeText={setComposeText}
              maxLength={280}
              autoFocus
            />
          </View>
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, letterSpacing: 0.5, textTransform: 'uppercase' }}>Interest Tags</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {['Entrepreneurship', 'Fitness', 'Coding', 'Design', 'Marketing', 'Sports', 'Mindset'].map(tag => {
                const active = composeTags.includes(tag);
                return (
                  <Pressable
                    key={tag}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setComposeTags(prev => active ? prev.filter(t => t !== tag) : [...prev, tag]);
                    }}
                    style={{
                      paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14,
                      backgroundColor: active ? C.label : C.surface,
                      borderWidth: StyleSheet.hairlineWidth, borderColor: active ? C.label : C.separator,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '500', color: active ? C.bg : C.label }}>{tag}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <Pressable
            style={({ pressed }) => ({
              paddingVertical: 14, borderRadius: 12,
              backgroundColor: composeText.trim() ? C.label : C.separator,
              alignItems: 'center', opacity: pressed ? 0.8 : 1,
            })}
            onPress={() => {
              if (!composeText.trim()) return;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowCompose(false);
              setComposeText('');
              setComposeTags([]);
              showToast('Your post is live in the community!');
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.bg }}>Post</Text>
          </Pressable>
        </View>
      </BottomSheet>

      {/* Locked space upgrade sheet (follower only) */}
      <BottomSheet visible={lockedSpace !== null} onClose={() => setLockedSpace(null)} useModal>
        {lockedSpace && (
          <View style={{ padding: 24, gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.surfacePressed, alignItems: 'center', justifyContent: 'center' }}>
                <IconSymbol name="lock.fill" size={20} color={C.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>{lockedSpace.name}</Text>
                {lockedSpace.tierId && (() => { const t = getTierById(lockedSpace.tierId!); return t ? (
                  <Text style={{ fontSize: 13, color: C.secondary, marginTop: 2 }}>Requires {t.name} tier or above</Text>
                ) : null; })()}
              </View>
            </View>
            <Text style={{ fontSize: 14, color: C.secondary, lineHeight: 20 }}>
              Upgrade your subscription to unlock access to this space and engage with the community.
            </Text>
            <Pressable
              style={({ pressed }) => ({ marginTop: 8, paddingVertical: 14, borderRadius: 12, backgroundColor: C.label, alignItems: 'center', opacity: pressed ? 0.8 : 1 })}
              onPress={() => { setLockedSpace(null); showToast('Navigating to subscription tiers…'); }}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.bg }}>Upgrade</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => ({ paddingVertical: 10, alignItems: 'center', opacity: pressed ? 0.6 : 1 })}
              onPress={() => setLockedSpace(null)}
            >
              <Text style={{ fontSize: 14, color: C.secondary }}>Not now</Text>
            </Pressable>
          </View>
        )}
      </BottomSheet>
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

  staticPill: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.surface, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  staticPillText: { fontSize: 15, fontWeight: '600', color: C.label },

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
