import React, { useMemo, useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const GAIN = '#5A8A6E';
const HEAT = '#B85C5C';
const CAUTION = '#B8943E';

const CLIPS = [
  { title: 'Logo Three vs Pepperdine — Q3', coach: 'Coach Middlebrooks', date: 'Apr 2', tag: 'Highlight', tagColor: GAIN },
  { title: 'Pick-Up Defense Breakdown', coach: 'Coach Kalejaiye', date: 'Mar 28', tag: 'Correction', tagColor: HEAT },
  { title: '3-Point Transition Make', coach: 'Coach Kalejaiye', date: 'Mar 25', tag: 'Highlight', tagColor: GAIN },
  { title: 'Ball Handling Under Pressure', coach: 'Coach Middlebrooks', date: 'Mar 20', tag: 'Review', tagColor: CAUTION },
  { title: '17-17 Free Throw Streak vs Simpson', coach: 'Coach Kalejaiye', date: 'Mar 15', tag: 'Highlight', tagColor: GAIN },
];

const PLAYLISTS = [
  { title: 'Laolu 3-Point Attempts', clips: 12, coach: 'Coach Kalejaiye', date: 'Apr 3' },
  { title: 'Pre-Game Review — vs Menlo', clips: 8, coach: 'Coach Middlebrooks', date: 'Apr 4' },
  { title: 'My Development Clips — Q3 2026', clips: 15, coach: 'Coach Kalejaiye', date: 'Mar 30' },
];

const FILTER_OPTIONS = ['All', 'Highlights', 'Corrections', '3-Pointers', 'Defense'];

export default function SportsPlayerFilm() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [role, cycleRole, roleCycles] = useDemoRole('sports:hub');
  const isHeadCoach = role === roleCycles[0];
  const [activeFilter, setActiveFilter] = useState('All');
  const s = useMemo(() => makeStyles(C), [C]);
  const topBarHeight = insets.top + 56;

  useFocusEffect(
    useCallback(() => {
      resetFooter();
      if (isHeadCoach) {
        router.replace('/(tabs)/(main)/hub/sports-film-room' as any);
      }
    }, [isHeadCoach])
  );

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <View style={[s.topBar, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator }]}>
        <Pressable
          style={s.kBtn}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
          hitSlop={8}
        >
          <KMenuButton />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
            <Text style={[s.titleText, { color: C.label }]}>MY FILM</Text>
          </View>
        </View>
        <View style={s.rolePillWrap}>
          <RolePill role={role} onPress={cycleRole} isPrimary={isHeadCoach} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topBarHeight + 16, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* My Clips */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>MY CLIPS</Text>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterScroll}
          style={{ marginBottom: 12 }}
        >
          {FILTER_OPTIONS.map((f) => (
            <Pressable
              key={f}
              style={[
                s.filterPill,
                {
                  backgroundColor: activeFilter === f ? C.label : C.surface,
                  borderColor: C.separator,
                },
              ]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[s.filterPillText, { color: activeFilter === f ? C.bg : C.secondary }]}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Clip Cards */}
        <View style={s.clipsList}>
          {CLIPS.map((clip, i) => (
            <Pressable
              key={i}
              style={[s.clipCard, { backgroundColor: C.surface }]}
              onPress={() => Alert.alert('Film Clip', 'Opening clip viewer...')}
            >
              <View style={s.clipThumbnail}>
                <View style={s.playTriangle} />
              </View>
              <View style={s.clipInfo}>
                <Text style={[s.clipTitle, { color: C.label }]} numberOfLines={2}>{clip.title}</Text>
                <Text style={[s.clipCoach, { color: C.secondary }]}>{clip.coach} · {clip.date}</Text>
                <View style={[s.clipTagBadge, { backgroundColor: clip.tagColor + '22' }]}>
                  <Text style={[s.clipTagText, { color: clip.tagColor }]}>{clip.tag}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Shared Playlists */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>SHARED BY COACH</Text>
        <View style={s.playlistsList}>
          {PLAYLISTS.map((pl, i) => (
            <Pressable
              key={i}
              style={[s.playlistCard, { backgroundColor: C.surface }]}
              onPress={() => Alert.alert('Playlist', `Opening "${pl.title}"...`)}
            >
              <IconSymbol name="film.stack.fill" size={20} color={C.secondary} />
              <View style={s.playlistInfo}>
                <Text style={[s.playlistTitle, { color: C.label }]}>{pl.title}</Text>
                <Text style={[s.playlistMeta, { color: C.secondary }]}>{pl.coach} · {pl.clips} clips · {pl.date}</Text>
              </View>
              <IconSymbol name="chevron.right" size={14} color={C.secondary} />
            </Pressable>
          ))}
        </View>

        {/* Full Game Film */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>FULL GAME FILM</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <Text style={[s.gameFilmNote, { color: C.secondary }]}>
            Access game film through coach-shared playlists above, or request specific film from coaching staff.
          </Text>
          <Pressable
            style={[s.requestBtn, { backgroundColor: C.surface, borderColor: C.separator }]}
            onPress={() => Alert.alert('Film Request', 'Sending request to coaching staff...')}
          >
            <Text style={[s.requestBtnText, { color: C.label }]}>Request Film</Text>
          </Pressable>
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
      paddingBottom: 10, paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    kBtn: { width: 44, height: 36, justifyContent: 'center' },
    titlePill: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
    titleText: { fontSize: 13, fontWeight: '700' },
    rolePillWrap: { width: 80, alignItems: 'flex-end', justifyContent: 'center' },
    sectionHeader: {
      fontSize: 11, fontWeight: '700', letterSpacing: 0.8,
      marginHorizontal: 16, marginBottom: 8, marginTop: 20,
    },
    card: { borderRadius: 12, marginHorizontal: 16, padding: 14 },
    filterScroll: { paddingHorizontal: 16, gap: 8 },
    filterPill: {
      borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
      borderWidth: StyleSheet.hairlineWidth,
    },
    filterPillText: { fontSize: 12, fontWeight: '600' },
    clipsList: { gap: 10, paddingHorizontal: 16 },
    clipCard: {
      borderRadius: 12, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    },
    clipThumbnail: {
      width: 90, height: 60, borderRadius: 8,
      backgroundColor: '#1A1714', justifyContent: 'center', alignItems: 'center',
    },
    playTriangle: {
      width: 0, height: 0,
      borderLeftWidth: 14, borderTopWidth: 9, borderBottomWidth: 9,
      borderLeftColor: 'rgba(255,255,255,0.6)',
      borderTopColor: 'transparent', borderBottomColor: 'transparent',
    },
    clipInfo: { flex: 1, gap: 4 },
    clipTitle: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
    clipCoach: { fontSize: 11 },
    clipTagBadge: { alignSelf: 'flex-start', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
    clipTagText: { fontSize: 10, fontWeight: '700' },
    playlistsList: { gap: 8, paddingHorizontal: 16 },
    playlistCard: {
      borderRadius: 12, padding: 14,
      flexDirection: 'row', alignItems: 'center', gap: 12,
    },
    playlistInfo: { flex: 1 },
    playlistTitle: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
    playlistMeta: { fontSize: 11 },
    gameFilmNote: { fontSize: 13, lineHeight: 20, marginBottom: 14 },
    requestBtn: {
      borderRadius: 12, padding: 14, alignItems: 'center',
      borderWidth: StyleSheet.hairlineWidth,
    },
    requestBtnText: { fontSize: 14, fontWeight: '600' },
  });
}
