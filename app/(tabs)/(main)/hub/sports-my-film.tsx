/**
 * Sports Hub — My Film. Player only.
 * Coach-assigned playlists, highlights reel, recent clips.
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { openDipsonSheet } from '@/utils/global-dipson-sheet';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';

const TOP_BAR_H = 52;
const GAIN = '#5A8A6E';
const CAUTION = '#B8943E';

type ClipTag = 'OFFENSE' | 'DEFENSE' | 'HIGHLIGHT' | 'REVIEW';
const TAG_COLORS: Record<ClipTag, string> = {
  OFFENSE:   GAIN,
  DEFENSE:   '#B85C5C',
  HIGHLIGHT: CAUTION,
  REVIEW:    '#9C9790',
};

interface Playlist {
  title: string;
  clipCount: number;
  gameDate: string;
  assignedBy: string;
  watched: boolean;
  focus: string;
}

interface Clip {
  title: string;
  game: string;
  time: string;
  tag: ClipTag;
  note?: string;
  isHighlight: boolean;
}

const ASSIGNED_PLAYLISTS: Playlist[] = [
  { title: 'PnR Defense — Duke Prep',    clipCount: 14, gameDate: 'Apr 14',  assignedBy: 'Coach Williams', watched: false, focus: 'Study how to defend hedge coverage on ball screens.' },
  { title: 'Your FT Mechanics',          clipCount: 6,  gameDate: 'Apr 10',  assignedBy: 'Coach Williams', watched: true,  focus: 'Film from last 3 games. Compare to baseline mechanics.' },
  { title: 'Offensive Execution Review', clipCount: 11, gameDate: 'Apr 7',   assignedBy: 'Coach Williams', watched: true,  focus: 'Horns + Floppy sets. Identify missed reads.' },
];

const MY_CLIPS: Clip[] = [
  { title: 'Crossover Midrange — Q2',   game: 'vs Morehouse Apr 10',   time: '0:23', tag: 'HIGHLIGHT', isHighlight: true,  note: 'Clean separation. Good form.'        },
  { title: 'PnR Read — Kick to Corner', game: 'vs Morehouse Apr 10',   time: '0:18', tag: 'OFFENSE',   isHighlight: true,  note: 'Correct decision. Corner knocked it down.' },
  { title: 'Defensive Close-Out',        game: 'vs Clark Atlanta Apr 7', time: '0:12', tag: 'REVIEW',    isHighlight: false, note: 'Coach note: Too upright. Work on positioning.' },
  { title: 'Pull-Up 3 off PnR',          game: 'vs Clark Atlanta Apr 7', time: '0:21', tag: 'HIGHLIGHT', isHighlight: true  },
  { title: 'Late-Clock Iso — Miss',      game: 'vs Fisk Mar 28',        time: '0:14', tag: 'REVIEW',    isHighlight: false, note: 'Coach note: Should kick. Forced shot.' },
  { title: 'Fast Break Finish',          game: 'vs Fisk Mar 28',        time: '0:08', tag: 'HIGHLIGHT', isHighlight: true  },
];

const HIGHLIGHT_CLIPS = MY_CLIPS.filter(c => c.isHighlight);

export default function SportsMyFilm() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s = useMemo(() => makeStyles(C), [C]);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [role, cycleRole, roleCycles] = useDemoRole('sports:hub');
  const isCoach = role === roleCycles[0];
  const [expandedPlaylist, setExpandedPlaylist] = useState<number | null>(null);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  useEffect(() => {
    if (isCoach) router.replace('/(tabs)/(main)/hub/sports-program-overview' as any);
  }, [isCoach]);

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable style={s.kBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={8}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>My Film</Text>
            </View>
          </View>
          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={!isCoach} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 16, paddingBottom: insets.bottom + 80, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* ASSIGNED PLAYLISTS */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>ASSIGNED BY COACH</Text>
        {ASSIGNED_PLAYLISTS.map((pl, i) => (
          <Pressable
            key={i}
            style={[s.playlistCard, { backgroundColor: C.surface }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setExpandedPlaylist(expandedPlaylist === i ? null : i); }}
          >
            <View style={s.playlistTopRow}>
              <View style={[s.filmThumb, { backgroundColor: C.separator }]}>
                <IconSymbol name="play.fill" size={16} color={C.label} />
              </View>
              <View style={s.playlistInfo}>
                <View style={s.playlistTitleRow}>
                  <Text style={[s.playlistTitle, { color: C.label }]}>{pl.title}</Text>
                  {!pl.watched && <View style={[s.newDot, { backgroundColor: C.label }]} />}
                </View>
                <Text style={[s.playlistMeta, { color: C.secondary }]}>{pl.clipCount} clips · {pl.assignedBy} · {pl.gameDate}</Text>
                <View style={[s.statusBadge, { backgroundColor: pl.watched ? C.separator : GAIN + '22' }]}>
                  <Text style={[s.statusBadgeText, { color: pl.watched ? C.secondary : GAIN }]}>{pl.watched ? 'Watched' : 'New'}</Text>
                </View>
              </View>
              <IconSymbol name={expandedPlaylist === i ? 'chevron.up' : 'chevron.down'} size={14} color={C.secondary} />
            </View>

            {expandedPlaylist === i && (
              <>
                <View style={[s.playlistDivider, { backgroundColor: C.separator }]} />
                <Text style={[s.playlistFocus, { color: C.secondary }]}>{pl.focus}</Text>
                <Pressable
                  style={[s.watchBtn, { backgroundColor: C.label }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); openDipsonSheet('Athletics'); }}
                >
                  <IconSymbol name="play.fill" size={14} color={C.bg} />
                  <Text style={[s.watchBtnText, { color: C.bg }]}>Watch Playlist</Text>
                </Pressable>
              </>
            )}
          </Pressable>
        ))}

        {/* MY HIGHLIGHTS */}
        <Text style={[s.sectionHeader, { color: C.secondary, marginTop: 24 }]}>MY HIGHLIGHTS</Text>
        <View style={[s.highlightsCard, { backgroundColor: C.surface }]}>
          <View style={s.highlightsSummaryRow}>
            <Text style={[s.highlightsCount, { color: C.label }]}>{HIGHLIGHT_CLIPS.length} clips</Text>
            <Text style={[s.highlightsLabel, { color: C.secondary }]}>in your recruiting reel</Text>
            <Pressable style={[s.shareBtn, { borderColor: C.separator }]} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
              <IconSymbol name="square.and.arrow.up" size={14} color={C.label} />
              <Text style={[s.shareBtnText, { color: C.label }]}>Share Reel</Text>
            </Pressable>
          </View>
          <View style={[s.highlightsDivider, { backgroundColor: C.separator }]} />
          {HIGHLIGHT_CLIPS.map((clip, i) => (
            <Pressable
              key={i}
              style={[
                s.clipRow,
                i < HIGHLIGHT_CLIPS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              ]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={[s.clipThumb, { backgroundColor: C.separator }]}>
                <IconSymbol name="play.fill" size={12} color={C.label} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.clipTitle, { color: C.label }]}>{clip.title}</Text>
                <Text style={[s.clipGame, { color: C.secondary }]}>{clip.game}</Text>
              </View>
              <View style={[s.tagBadge, { backgroundColor: TAG_COLORS[clip.tag] + '22' }]}>
                <Text style={[s.tagBadgeText, { color: TAG_COLORS[clip.tag] }]}>{clip.tag}</Text>
              </View>
              <Text style={[s.clipTime, { color: C.secondary }]}>{clip.time}</Text>
            </Pressable>
          ))}
        </View>

        {/* ALL RECENT CLIPS */}
        <Text style={[s.sectionHeader, { color: C.secondary, marginTop: 24 }]}>RECENT CLIPS</Text>
        <View style={[s.clipsCard, { backgroundColor: C.surface }]}>
          {MY_CLIPS.map((clip, i) => (
            <Pressable
              key={i}
              style={[
                s.clipRow,
                i < MY_CLIPS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              ]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={[s.clipThumb, { backgroundColor: C.separator }]}>
                <IconSymbol name={clip.isHighlight ? 'star.fill' : 'play.fill'} size={12} color={clip.isHighlight ? CAUTION : C.label} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.clipTitle, { color: C.label }]}>{clip.title}</Text>
                <Text style={[s.clipGame, { color: C.secondary }]}>{clip.game}</Text>
                {clip.note && <Text style={[s.clipNote, { color: C.secondary }]}>{clip.note}</Text>}
              </View>
              <View style={[s.tagBadge, { backgroundColor: TAG_COLORS[clip.tag] + '22' }]}>
                <Text style={[s.tagBadgeText, { color: TAG_COLORS[clip.tag] }]}>{clip.tag}</Text>
              </View>
              <Text style={[s.clipTime, { color: C.secondary }]}>{clip.time}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root:          { flex: 1 },
  topBarOuter:   { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:        { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  kBtn:          { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  titlePill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  rolePillWrap:  { alignItems: 'flex-end' },
  sectionHeader: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8 },

  playlistCard:     { borderRadius: 14, padding: 14, marginBottom: 10 },
  playlistTopRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  filmThumb:        { width: 52, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  playlistInfo:     { flex: 1, gap: 4 },
  playlistTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  playlistTitle:    { fontSize: 14, fontWeight: '700', flex: 1 },
  newDot:           { width: 7, height: 7, borderRadius: 4 },
  playlistMeta:     { fontSize: 12 },
  statusBadge:      { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, alignSelf: 'flex-start' },
  statusBadgeText:  { fontSize: 11, fontWeight: '700' },
  playlistDivider:  { height: StyleSheet.hairlineWidth, marginVertical: 12 },
  playlistFocus:    { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  watchBtn:         { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, alignSelf: 'flex-start' },
  watchBtnText:     { fontSize: 14, fontWeight: '600' },

  highlightsCard:       { borderRadius: 14, padding: 14 },
  highlightsSummaryRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  highlightsCount:      { fontSize: 20, fontWeight: '800' },
  highlightsLabel:      { flex: 1, fontSize: 13 },
  shareBtn:             { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 7 },
  shareBtnText:         { fontSize: 13, fontWeight: '600' },
  highlightsDivider:    { height: StyleSheet.hairlineWidth, marginVertical: 12 },

  clipsCard:  { borderRadius: 14, paddingHorizontal: 14 },
  clipRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 },
  clipThumb:  { width: 36, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  clipTitle:  { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  clipGame:   { fontSize: 12 },
  clipNote:   { fontSize: 11, marginTop: 2, fontStyle: 'italic' },
  tagBadge:   { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 3 },
  tagBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  clipTime:   { fontSize: 11 },
});
