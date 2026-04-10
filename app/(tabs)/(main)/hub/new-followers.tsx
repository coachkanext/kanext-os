/**
 * New Followers — Hub sidebar notification screen.
 * Shows the 12 most recent followers with name, avatar, follow date,
 * and Follow Back / Message actions per person.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassView } from '@/components/ui/glass-view';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { KMenuButton } from '@/components/ui/k-menu-button';

const TOP_BAR_H = 44;

type Follower = {
  id: string; name: string; initials: string; handle: string;
  followDate: string; mutuallyFollowing: boolean;
};

const NEW_FOLLOWERS: Follower[] = [
  { id: 'f1',  name: 'Marcus Thompson',  initials: 'MT', handle: '@marcust',     followDate: '2h ago',  mutuallyFollowing: false },
  { id: 'f2',  name: 'Aaliyah Brooks',   initials: 'AB', handle: '@aaliyahb',    followDate: '3h ago',  mutuallyFollowing: true  },
  { id: 'f3',  name: 'DeShawn Miller',   initials: 'DM', handle: '@deshawn_m',   followDate: '5h ago',  mutuallyFollowing: false },
  { id: 'f4',  name: 'Priya Sharma',     initials: 'PS', handle: '@priyasfit',   followDate: '6h ago',  mutuallyFollowing: false },
  { id: 'f5',  name: 'Jordan Hayes',     initials: 'JH', handle: '@j_hayes23',   followDate: '8h ago',  mutuallyFollowing: true  },
  { id: 'f6',  name: 'Chris Nwosu',      initials: 'CN', handle: '@chrisnwosu',  followDate: '10h ago', mutuallyFollowing: false },
  { id: 'f7',  name: 'Simone Davis',     initials: 'SD', handle: '@simonedavis', followDate: '14h ago', mutuallyFollowing: false },
  { id: 'f8',  name: 'Tyler Okafor',     initials: 'TO', handle: '@tylerokafor', followDate: '18h ago', mutuallyFollowing: false },
  { id: 'f9',  name: 'Nadia Clarke',     initials: 'NC', handle: '@nadiac',      followDate: '1d ago',  mutuallyFollowing: true  },
  { id: 'f10', name: 'Brandon West',     initials: 'BW', handle: '@bwest_atl',   followDate: '1d ago',  mutuallyFollowing: false },
  { id: 'f11', name: 'Imani Foster',     initials: 'IF', handle: '@imanifoster', followDate: '2d ago',  mutuallyFollowing: false },
  { id: 'f12', name: 'Darius King',      initials: 'DK', handle: '@dariusking',  followDate: '2d ago',  mutuallyFollowing: false },
];

export default function NewFollowersScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);

  const topBarH           = insets.top + TOP_BAR_H;
  const contentPaddingTop = topBarH + 8;

  const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  const [followed, setFollowed] = useState<Set<string>>(
    () => new Set(NEW_FOLLOWERS.filter(f => f.mutuallyFollowing).map(f => f.id))
  );

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const toggleFollow = (id: string) => {
    haptic();
    setFollowed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <View style={[s.topBar, { height: topBarH, paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator }]}>
        <Pressable onPress={() => { haptic(); openSidePanel(); }} hitSlop={8} style={s.topBarBtn}>
          <KMenuButton />
        </Pressable>
        <View style={[s.pill, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <Text style={[s.pillText, { color: C.label }]}>New Followers</Text>
        </View>
        <View style={s.topBarBtn} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
          <Text style={[s.countLabel, { color: C.secondary }]}>
            12 people followed you recently
          </Text>

          <GlassView tier={1} style={{ overflow: 'hidden', borderRadius: 12 }}>
            {NEW_FOLLOWERS.map((follower, idx) => {
              const isFollowing = followed.has(follower.id);
              return (
                <View
                  key={follower.id}
                  style={[
                    s.row,
                    { backgroundColor: C.surface },
                    idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                  ]}
                >
                  {/* Avatar */}
                  <View style={[s.avatar, { backgroundColor: C.bg, borderColor: C.separator }]}>
                    <Text style={[s.avatarText, { color: C.label }]}>{follower.initials}</Text>
                  </View>

                  {/* Name + handle + date */}
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={[s.name, { color: C.label }]} numberOfLines={1}>{follower.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 }}>
                      <Text style={[s.handle, { color: C.secondary }]} numberOfLines={1}>{follower.handle}</Text>
                      <Text style={[{ fontSize: 11, color: C.muted }]}>·</Text>
                      <Text style={[s.date, { color: C.secondary }]}>{follower.followDate}</Text>
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={{ flexDirection: 'row', gap: 7, alignItems: 'center', flexShrink: 0 }}>
                    <Pressable
                      style={[
                        s.followBtn,
                        isFollowing
                          ? { backgroundColor: C.surface, borderColor: C.separator }
                          : { backgroundColor: C.label, borderColor: C.label },
                      ]}
                      onPress={() => toggleFollow(follower.id)}
                    >
                      <Text style={[s.followBtnText, { color: isFollowing ? C.secondary : C.bg }]}>
                        {isFollowing ? 'Following' : 'Follow Back'}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[s.msgBtn, { backgroundColor: C.bg, borderColor: C.separator }]}
                      onPress={() => haptic()}
                    >
                      <IconSymbol name="paperplane" size={13} color={C.label} />
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </GlassView>
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    topBar: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
      flexDirection: 'row', alignItems: 'flex-end',
      paddingHorizontal: 12, paddingBottom: 6,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBarBtn:    { width: 40, height: 32, alignItems: 'center', justifyContent: 'center' },
    pill:         { flex: 1, alignItems: 'center', justifyContent: 'center', height: 32, borderRadius: 16, borderWidth: 1, marginHorizontal: 10 },
    pillText:     { fontSize: 14, fontWeight: '700' },
    countLabel:   { fontSize: 13, marginBottom: 10 },
    row:          { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
    avatar:       { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, flexShrink: 0 },
    avatarText:   { fontSize: 13, fontWeight: '700' },
    name:         { fontSize: 14, fontWeight: '600' },
    handle:       { fontSize: 12 },
    date:         { fontSize: 12 },
    followBtn:    { height: 30, paddingHorizontal: 11, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    followBtnText: { fontSize: 12, fontWeight: '700' },
    msgBtn:       { width: 30, height: 30, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  });
}
