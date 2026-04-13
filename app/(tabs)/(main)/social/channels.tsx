/**
 * Social Channels — Discord-style channel list.
 * Grouped by access tier: Open / Subscribers / Inner Circle.
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

// ── Types ─────────────────────────────────────────────────────────────────────

type ChannelAccess = 'Open' | 'Subscribers' | 'Inner Circle';

type Channel = {
  id:          string;
  name:        string;
  type:        'text' | 'voice' | 'live';
  access:      ChannelAccess;
  lastMessage: string;
  unreadCount: number;
  memberCount: number;
};

// ── Data ──────────────────────────────────────────────────────────────────────

const CHANNELS: Channel[] = [
  { id: 'general',           name: 'general',           type: 'text', access: 'Open',         lastMessage: 'Marcus: Just hit 10K followers! Thanks for the strategy tips 🎉',           unreadCount: 3,  memberCount: 1247 },
  { id: 'introductions',     name: 'introductions',     type: 'text', access: 'Open',         lastMessage: "Taylor: Hey everyone! I'm a lifestyle creator from Austin...",                 unreadCount: 0,  memberCount: 1247 },
  { id: 'content-strategy',  name: 'content-strategy',  type: 'text', access: 'Subscribers',  lastMessage: 'Jordan: The B-roll technique you showed works insane for retention',           unreadCount: 7,  memberCount: 634  },
  { id: 'coaching-qa',       name: 'coaching-qa',       type: 'text', access: 'Subscribers',  lastMessage: 'Sammy: Q&A thread drops tomorrow at 2pm ET — submit questions now',            unreadCount: 12, memberCount: 634  },
  { id: 'wins',              name: 'wins',               type: 'text', access: 'Subscribers',  lastMessage: 'Alex: First brand deal signed! $2K for a 60-second integration',              unreadCount: 0,  memberCount: 634  },
  { id: 'resources',         name: 'resources',         type: 'text', access: 'Subscribers',  lastMessage: 'Sammy: Content audit template added to pinned messages',                      unreadCount: 2,  memberCount: 634  },
  { id: 'vip-lounge',        name: 'vip-lounge',        type: 'text', access: 'Inner Circle', lastMessage: 'Sammy: Sharing the brand deal breakdown only IC sees...',                     unreadCount: 1,  memberCount: 47   },
  { id: 'behind-the-scenes', name: 'behind-the-scenes', type: 'text', access: 'Inner Circle', lastMessage: "Sammy: Here's the raw P&L from last month — $18.4K revenue...",               unreadCount: 0,  memberCount: 47   },
];

const GROUPS: { label: string; access: ChannelAccess }[] = [
  { label: 'OPEN',           access: 'Open'         },
  { label: 'SUBSCRIBERS',    access: 'Subscribers'  },
  { label: '★ INNER CIRCLE', access: 'Inner Circle' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function ChannelsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const [role, cycleRole, roleCycles] = useDemoRole('personal:social');
  const isOwner = role === roleCycles[0];

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const handleChannelPress = (channel: Channel) => {
    const isLocked = !isOwner && channel.access === 'Inner Circle';
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isLocked) {
      Alert.alert('Inner Circle Required', `Upgrade to Inner Circle ($25/mo) to access #${channel.name}`, [{ text: 'OK' }]);
      return;
    }
    router.push({
      pathname: '/(tabs)/(main)/social/channel' as any,
      params: {
        channelId:   channel.id,
        channelName: channel.name,
        access:      channel.access,
        memberCount: String(channel.memberCount),
      },
    });
  };

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* ── Fixed top bar ── */}
      <Animated.View
        style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}
      >
        <View style={s.topBar}>
          <Pressable
            hitSlop={8}
            style={s.kBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              openSidePanel();
            }}
          >
            <KMenuButton />
          </Pressable>

          <View style={s.centerPill}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Channels</Text>
            </View>
          </View>

          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      {/* ── Scrollable channel list ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          s.scrollContent,
          { paddingTop: insets.top + 52 + 8, paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {GROUPS.map(group => {
          const channels = CHANNELS.filter(c => c.access === group.access);
          const isIC     = group.access === 'Inner Circle';

          return (
            <View key={group.access} style={s.group}>
              {/* Category header */}
              <View style={s.groupHeader}>
                <Text style={[s.groupLabel, { color: C.secondary }]}>{group.label}</Text>
                {isOwner && (
                  <Pressable hitSlop={10} onPress={() => Alert.alert(`Add ${group.access} channel`)}>
                    <IconSymbol name="plus" size={14} color={C.secondary} />
                  </Pressable>
                )}
              </View>

              {/* Channel rows */}
              {channels.map(ch => {
                const isLocked  = !isOwner && isIC;
                const hasUnread = ch.unreadCount > 0;
                const nameColor = isLocked ? C.secondary : hasUnread ? C.label : C.secondary;

                return (
                  <Pressable
                    key={ch.id}
                    style={({ pressed }) => [
                      s.channelRow,
                      pressed && { backgroundColor: C.surface },
                    ]}
                    onPress={() => handleChannelPress(ch)}
                  >
                    <Text style={[s.hash, { color: nameColor, opacity: isLocked ? 0.35 : hasUnread ? 1 : 0.55 }]}>
                      {ch.type === 'voice' ? '🔊' : ch.type === 'live' ? '📹' : '#'}
                    </Text>

                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        style={[s.channelName, { color: nameColor, fontWeight: hasUnread ? '600' : '400', opacity: isLocked ? 0.35 : 1 }]}
                        numberOfLines={1}
                      >
                        {ch.name}
                      </Text>
                      {!isLocked && (
                        <Text style={[s.lastMsg, { color: C.secondary }]} numberOfLines={1}>
                          {ch.lastMessage}
                        </Text>
                      )}
                    </View>

                    {isLocked ? (
                      <IconSymbol name="lock.fill" size={13} color={C.secondary} style={{ opacity: 0.35 }} />
                    ) : hasUnread ? (
                      <View style={[s.badge, { backgroundColor: C.label }]}>
                        <Text style={[s.badgeText, { color: C.bg }]}>{ch.unreadCount}</Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          );
        })}

        {/* Add channel (owner only) */}
        {isOwner && (
          <Pressable
            style={({ pressed }) => [s.addRow, pressed && { opacity: 0.6 }]}
            onPress={() => Alert.alert('Channel creation coming soon')}
          >
            <View style={[s.addIcon, { backgroundColor: C.separator }]}>
              <IconSymbol name="plus" size={16} color={C.secondary} />
            </View>
            <Text style={[s.addLabel, { color: C.secondary }]}>Add a channel</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1 },

  // Top bar
  topBarOuter: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topBar: {
    height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12,
  },
  kBtn:         { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  centerPill:   { flex: 1, alignItems: 'center' },
  titlePill:    { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  titlePillText:{ fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  rolePillWrap: { width: 80, alignItems: 'flex-end' },

  scrollContent: { paddingHorizontal: 16 },

  // Channel groups
  group: { marginBottom: 8 },

  groupHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 4, paddingTop: 20, paddingBottom: 4,
  },
  groupLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.9 },

  channelRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 11, paddingHorizontal: 8, borderRadius: 10,
  },
  hash:        { fontSize: 18, fontWeight: '500', width: 22, textAlign: 'center' },
  channelName: { fontSize: 15, letterSpacing: -0.1 },
  lastMsg:     { fontSize: 12, marginTop: 2 },

  badge: {
    minWidth: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },

  // Add channel row
  addRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 8, marginTop: 8 },
  addIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  addLabel:{ fontSize: 15 },
});
