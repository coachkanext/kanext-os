/**
 * Social Channels — Card-based channel list.
 * Mode-aware: Personal / Community / Sports / Business / Education
 * Role-aware: adminOnly groups hidden entirely from lower roles.
 */

import React, { useMemo, useCallback } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet,
  Animated, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { useMode } from '@/context/app-context';

// ── Types ─────────────────────────────────────────────────────────────────────

type Channel = {
  id:          string;
  name:        string;
  type:        'text' | 'voice' | 'live';
  lastMessage: string;
  unreadCount: number;
  memberCount: number;
};

type ChannelGroup = {
  label:      string;
  adminOnly?: boolean;
  channels:   Channel[];
};

// ── Role key map ──────────────────────────────────────────────────────────────

const ROLE_KEY_BY_MODE: Record<string, string> = {
  personal:  'personal:social',
  community: 'community:social',
  sports:    'sports:social',
  business:  'business:social',
  education: 'education:social',
};

// ── Mode-specific channel data ────────────────────────────────────────────────

const CHANNELS_BY_MODE: Record<string, ChannelGroup[]> = {
  personal: [
    {
      label: 'Open',
      channels: [
        { id: 'general',       name: 'general',       type: 'text', lastMessage: "Marcus: Just hit 10K followers! Thanks for the strategy tips 🎉",           unreadCount: 3,  memberCount: 1247 },
        { id: 'introductions', name: 'introductions', type: 'text', lastMessage: "Taylor: Hey everyone! I'm a lifestyle creator from Austin...",               unreadCount: 0,  memberCount: 1247 },
      ],
    },
    {
      label: 'Subscribers',
      channels: [
        { id: 'content-strategy', name: 'content-strategy', type: 'text', lastMessage: 'Jordan: The B-roll technique you showed works insane for retention',  unreadCount: 7,  memberCount: 634 },
        { id: 'coaching-qa',      name: 'coaching-qa',      type: 'text', lastMessage: 'Sammy: Q&A thread drops tomorrow at 2pm ET — submit questions now',    unreadCount: 12, memberCount: 634 },
        { id: 'wins',             name: 'wins',             type: 'text', lastMessage: 'Alex: First brand deal signed! $2K for a 60-second integration',       unreadCount: 0,  memberCount: 634 },
        { id: 'resources',        name: 'resources',        type: 'text', lastMessage: 'Sammy: Content audit template added to pinned messages',               unreadCount: 2,  memberCount: 634 },
      ],
    },
    {
      label: 'Inner Circle',
      adminOnly: true,
      channels: [
        { id: 'vip-lounge',        name: 'vip-lounge',        type: 'text', lastMessage: "Sammy: Sharing the brand deal breakdown only IC sees...",            unreadCount: 1, memberCount: 47 },
        { id: 'behind-the-scenes', name: 'behind-the-scenes', type: 'text', lastMessage: "Sammy: Here's the raw P&L from last month — $18.4K revenue...",      unreadCount: 0, memberCount: 47 },
      ],
    },
  ],

  community: [
    {
      label: 'Announcements',
      channels: [
        { id: 'c-general', name: 'general', type: 'text', lastMessage: 'Pastor Davis: Sunday service recap is up on our channel now',             unreadCount: 7, memberCount: 847 },
        { id: 'c-events',  name: 'events',  type: 'text', lastMessage: 'Rachel: Easter Sunday registration closes in 2 days',                     unreadCount: 2, memberCount: 847 },
      ],
    },
    {
      label: 'Community',
      channels: [
        { id: 'c-prayer',     name: 'prayer-requests', type: 'text', lastMessage: 'Sister Joy: Lifting up the Thompson family — please keep them in prayer', unreadCount: 5, memberCount: 847 },
        { id: 'c-fellowship', name: 'fellowship',      type: 'text', lastMessage: 'David: Bible study tonight at 7PM, Room 204',                             unreadCount: 0, memberCount: 847 },
        { id: 'c-youth',      name: 'youth',           type: 'text', lastMessage: 'Elder James: Youth retreat spots are filling fast — 12 left',             unreadCount: 0, memberCount: 312 },
      ],
    },
    {
      label: 'Worship',
      channels: [
        { id: 'c-worship',  name: 'worship-team', type: 'text', lastMessage: 'Grace: Full run-through for Easter Sunday tonight at 6PM',    unreadCount: 1, memberCount: 24 },
        { id: 'c-setlists', name: 'setlists',     type: 'text', lastMessage: 'Grace: Updated setlist for Sunday morning — check pinned',    unreadCount: 0, memberCount: 24 },
      ],
    },
    {
      label: 'Leadership',
      adminOnly: true,
      channels: [
        { id: 'c-elders',   name: 'elders',        type: 'text', lastMessage: 'Pastor Davis: Debrief from the board meeting — please review',    unreadCount: 0, memberCount: 8  },
        { id: 'c-pastoral', name: 'pastoral-team', type: 'text', lastMessage: 'Pastor Davis: Three new families joining this Sunday',             unreadCount: 3, memberCount: 12 },
        { id: 'c-finances', name: 'finances',      type: 'text', lastMessage: 'ICCLA: March giving report posted — $31.4K total',                unreadCount: 0, memberCount: 8  },
      ],
    },
  ],

  sports: [
    {
      label: 'Team',
      channels: [
        { id: 's-general', name: 'general',   type: 'text', lastMessage: 'Coach Marcus: Practice moved to 3PM tomorrow — bring your film cards', unreadCount: 4, memberCount: 18 },
        { id: 's-gameday',  name: 'game-day', type: 'text', lastMessage: "Team: LET'S GO LIONS — home opener Friday night! 🦁",                  unreadCount: 0, memberCount: 18 },
        { id: 's-news',     name: 'team-news',type: 'text', lastMessage: 'Lincoln MBB: Officially ranked #3 in the CCAA conference',             unreadCount: 1, memberCount: 18 },
      ],
    },
    {
      label: 'Players',
      channels: [
        { id: 's-lounge',   name: 'player-lounge',         type: 'text', lastMessage: "Isaiah: Who's getting to the gym early tomorrow? 5:30 crew 🏀", unreadCount: 8, memberCount: 14 },
        { id: 's-strength', name: 'strength-conditioning', type: 'text', lastMessage: 'Darius: New lift numbers posted — check the board',              unreadCount: 0, memberCount: 14 },
        { id: 's-film',     name: 'film-review',           type: 'text', lastMessage: 'Laolu: Second half film from Tuesday — help-side rotation',      unreadCount: 0, memberCount: 14 },
      ],
    },
    {
      label: 'Coaching Staff',
      adminOnly: true,
      channels: [
        { id: 's-coaches',    name: 'coaching-staff', type: 'text', lastMessage: 'Coach Marcus: Recruiting call with the DeSoto kid at 4PM',     unreadCount: 0, memberCount: 4 },
        { id: 's-recruiting', name: 'recruiting',     type: 'text', lastMessage: 'Coach: Film package sent to all three prospects',               unreadCount: 2, memberCount: 4 },
        { id: 's-gameplan',   name: 'game-planning',  type: 'text', lastMessage: 'Coach: Friday game plan — press sets and defensive rotations',  unreadCount: 0, memberCount: 4 },
      ],
    },
  ],

  business: [
    {
      label: 'Company',
      channels: [
        { id: 'b-general',     name: 'general',      type: 'text', lastMessage: 'Product Team: Spaces 2.0 just shipped to beta — check it out',  unreadCount: 6,  memberCount: 94 },
        { id: 'b-announce',    name: 'announcements',type: 'text', lastMessage: 'KaNeXT: All-hands this Thursday at 2PM — calendar invites sent', unreadCount: 0,  memberCount: 94 },
        { id: 'b-watercooler', name: 'water-cooler', type: 'text', lastMessage: 'Marcus: Anyone watching the game tonight? 🏀',                   unreadCount: 14, memberCount: 94 },
      ],
    },
    {
      label: 'Departments',
      channels: [
        { id: 'b-product',   name: 'product',    type: 'text', lastMessage: 'Sarah: Sprint demo tomorrow 10AM — link in calendar',             unreadCount: 3, memberCount: 18 },
        { id: 'b-eng',       name: 'engineering',type: 'text', lastMessage: 'Team: Backend deploy complete — all green on monitors',            unreadCount: 0, memberCount: 12 },
        { id: 'b-marketing', name: 'marketing',  type: 'text', lastMessage: 'Vanessa: Q2 campaign performance is up — strong numbers',         unreadCount: 1, memberCount: 8  },
        { id: 'b-design',    name: 'design',     type: 'text', lastMessage: 'Alex: Design system v2 components are in Figma — please review',  unreadCount: 0, memberCount: 6  },
      ],
    },
    {
      label: 'Leadership',
      adminOnly: true,
      channels: [
        { id: 'b-exec',     name: 'executive',      type: 'text', lastMessage: 'CEO: Series A terms sheet signed — NDAs still in effect',    unreadCount: 0, memberCount: 5 },
        { id: 'b-okrs',     name: 'okrs-strategy',  type: 'text', lastMessage: 'CEO: Q2 OKRs doc updated — please review before Thursday',   unreadCount: 2, memberCount: 5 },
        { id: 'b-allhands', name: 'all-hands-prep', type: 'text', lastMessage: 'CEO: Draft agenda for Thursday all-hands in shared doc',      unreadCount: 0, memberCount: 5 },
      ],
    },
  ],

  education: [
    {
      label: 'Campus',
      channels: [
        { id: 'e-general',     name: 'general',      type: 'text', lastMessage: 'Student Life: Spring Showcase registration open until April 21',          unreadCount: 9, memberCount: 3200 },
        { id: 'e-announce',    name: 'announcements',type: 'text', lastMessage: "President Evans: Berkeley partnership announcement tomorrow at 8AM",       unreadCount: 2, memberCount: 3200 },
        { id: 'e-studentlife', name: 'student-life', type: 'text', lastMessage: 'Student Life: Spring Showcase April 28 — register by Monday',              unreadCount: 5, memberCount: 3200 },
      ],
    },
    {
      label: 'Academic',
      channels: [
        { id: 'e-courses',  name: 'courses',           type: 'text', lastMessage: 'Prof. Williams: Midterm extensions must be requested by today 5PM', unreadCount: 3, memberCount: 3200 },
        { id: 'e-research', name: 'research',          type: 'text', lastMessage: 'Dean: UC Berkeley lab access available starting Fall 2026',          unreadCount: 0, memberCount: 842  },
        { id: 'e-library',  name: 'library-resources', type: 'text', lastMessage: 'Library: Extended hours through finals week — closing at midnight',  unreadCount: 0, memberCount: 3200 },
      ],
    },
    {
      label: 'Administration',
      adminOnly: true,
      channels: [
        { id: 'e-faculty', name: 'faculty-lounge',     type: 'text', lastMessage: 'Dean: Grading window closes Friday — please submit on time',       unreadCount: 1, memberCount: 112 },
        { id: 'e-admin',   name: 'administration',     type: 'text', lastMessage: 'President Evans: Board meeting minutes from April 10 posted',       unreadCount: 0, memberCount: 38  },
        { id: 'e-finaid',  name: 'financial-aid-dept', type: 'text', lastMessage: 'Financial Aid: Fall 2026 award letters ready for review',           unreadCount: 0, memberCount: 22  },
      ],
    },
  ],
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ChannelsScreen() {
  const C       = useColors();
  const insets  = useSafeAreaInsets();
  const router  = useRouter();
  const s       = useMemo(() => makeStyles(C), [C]);
  const mode    = useMode();
  const modeKey = mode ?? 'personal';
  const roleKey = ROLE_KEY_BY_MODE[modeKey] ?? 'personal:social';

  const [role, cycleRole, roleCycles] = useDemoRole(roleKey as any);
  const isAdmin = role === roleCycles[0];

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  // Members only see groups that aren't admin-only
  const allGroups  = CHANNELS_BY_MODE[modeKey] ?? CHANNELS_BY_MODE.personal;
  const groups     = allGroups.filter(g => !g.adminOnly || isAdmin);

  const handleChannelPress = (channel: Channel) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/(tabs)/(main)/social/channel' as any,
      params: { channelId: channel.id, channelName: channel.name, memberCount: String(channel.memberCount) },
    });
  };

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* ── Top Bar ── */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable hitSlop={8} style={s.kBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
            <KMenuButton />
          </Pressable>
          <View style={s.centerPill}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Channels</Text>
            </View>
          </View>
          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isAdmin} />
          </View>
        </View>
      </Animated.View>

      {/* ── Channel list ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + 52 + 12, paddingBottom: insets.bottom + 80, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {groups.map(group => (
          <View key={group.label} style={s.section}>

            {/* Section header */}
            <View style={s.sectionHeader}>
              <Text style={[s.sectionLabel, { color: C.secondary }]}>{group.label}</Text>
              {isAdmin && (
                <Pressable hitSlop={10} onPress={() => Alert.alert('Add channel coming soon')}>
                  <IconSymbol name="plus" size={13} color={C.secondary} />
                </Pressable>
              )}
            </View>

            {/* Card */}
            <View style={[s.card, { backgroundColor: C.surface, borderColor: C.separator }]}>
              {group.channels.map((ch, idx) => {
                const hasUnread = ch.unreadCount > 0;
                const isLast    = idx === group.channels.length - 1;

                return (
                  <Pressable
                    key={ch.id}
                    style={({ pressed }) => [
                      s.row,
                      !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
                      pressed && { backgroundColor: C.bg },
                    ]}
                    onPress={() => handleChannelPress(ch)}
                  >
                    {/* Icon box */}
                    <View style={[s.iconBox, { backgroundColor: C.bg, borderColor: C.separator }]}>
                      <Text style={[s.hashText, { color: hasUnread ? C.label : C.secondary }]}>#</Text>
                    </View>

                    {/* Text */}
                    <View style={s.rowText}>
                      <Text style={[s.channelName, { color: C.label, fontWeight: hasUnread ? '600' : '500' }]} numberOfLines={1}>
                        {ch.name}
                      </Text>
                      <Text style={[s.lastMsg, { color: C.secondary }]} numberOfLines={1}>
                        {ch.lastMessage}
                      </Text>
                    </View>

                    {/* Unread badge */}
                    {hasUnread ? (
                      <View style={[s.badge, { backgroundColor: C.label }]}>
                        <Text style={[s.badgeText, { color: C.bg }]}>
                          {ch.unreadCount > 99 ? '99+' : ch.unreadCount}
                        </Text>
                      </View>
                    ) : (
                      <IconSymbol name="chevron.right" size={12} color={C.separator} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        {isAdmin && (
          <Pressable
            style={({ pressed }) => [s.addRow, pressed && { opacity: 0.6 }]}
            onPress={() => Alert.alert('Channel creation coming soon')}
          >
            <View style={[s.addIcon, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <IconSymbol name="plus" size={15} color={C.secondary} />
            </View>
            <Text style={[s.addLabel, { color: C.secondary }]}>New channel</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1 },

  topBarOuter:   { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:        { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  kBtn:          { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  centerPill:    { flex: 1, alignItems: 'center' },
  titlePill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  rolePillWrap:  { alignItems: 'flex-end', flexShrink: 0 },

  section:       { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingHorizontal: 2 },
  sectionLabel:  { fontSize: 13, fontWeight: '600', letterSpacing: 0.2 },

  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },

  iconBox: {
    width: 36, height: 36, borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  hashText:    { fontSize: 17, fontWeight: '600' },

  rowText:     { flex: 1, minWidth: 0, gap: 2 },
  channelName: { fontSize: 15 },
  lastMsg:     { fontSize: 12, lineHeight: 17 },

  badge:     { minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeText: { fontSize: 11, fontWeight: '700' },

  addRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  addIcon: { width: 36, height: 36, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  addLabel:{ fontSize: 15, color: '#9C9790' },
});
