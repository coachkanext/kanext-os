/**
 * sports-film-room.tsx
 * Head Coach only — professional video analysis (Hudl Pro level).
 */
import React, { useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
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
import { useScrollHeader } from '@/hooks/use-scroll-header';

const TOP_BAR_H = 44;
const GAIN = '#5A8A6E';
const HEAT = '#B85C5C';
const CAUTION = '#B8943E';
const BLUE_TAGGED = '#1A5C8E';
const DARK_PREMIUM = '#1A1714';
const DARKEST = '#0A0806';

type FilmStatus = 'Analyzed' | 'Tagged' | 'Raw';

interface GameFilm {
  id: string;
  opponent: string;
  initial: string;
  date: string;
  result: string;
  status: FilmStatus;
}

const GAME_FILMS: GameFilm[] = [
  { id: '1', opponent: 'vs Menlo College',  initial: 'MC', date: 'Mar 15', result: 'W 78-65', status: 'Analyzed' },
  { id: '2', opponent: 'vs Dominican',       initial: 'DO', date: 'Mar 8',  result: 'W 84-71', status: 'Tagged'   },
  { id: '3', opponent: "vs St. Mary's",      initial: 'SM', date: 'Mar 1',  result: 'W 91-75', status: 'Analyzed' },
  { id: '4', opponent: 'vs Simpson Univ.',   initial: 'SU', date: 'Feb 22', result: 'L 68-74', status: 'Raw'      },
  { id: '5', opponent: 'vs LMU',             initial: 'LM', date: 'Feb 15', result: 'L 58-82', status: 'Raw'      },
  { id: '6', opponent: 'vs Cal Maritime',    initial: 'CM', date: 'Feb 8',  result: 'W 82-60', status: 'Analyzed' },
];

const PLAYLISTS = [
  { id: 'p1', title: 'Laolu 3-Point Attempts',  clips: 12 },
  { id: 'p2', title: 'Opponent PnR Defense',     clips: 8  },
  { id: 'p3', title: 'Our Transition Offense',   clips: 15 },
];

const TELESTRATION_TOOLS = [
  { icon: 'arrow.up.left',  label: 'Arrow'     },
  { icon: 'circle',         label: 'Circle'    },
  { icon: 'scribble',       label: 'Draw'      },
  { icon: 'textformat',     label: 'Text'      },
  { icon: 'highlighter',    label: 'Highlight' },
];

const SPEED_OPTIONS = ['0.25x', '0.5x', '1x', '1.5x', '2x'];

const TIMELINE_MARKERS = [
  { label: 'HalfCourt',  color: GAIN        },
  { label: 'Transition', color: CAUTION     },
  { label: 'BLOB',       color: HEAT        },
  { label: 'ATO',        color: BLUE_TAGGED },
];

function filmStatusStyle(status: FilmStatus): { bg: string; text: string } {
  switch (status) {
    case 'Analyzed': return { bg: GAIN,        text: '#FFFFFF' };
    case 'Tagged':   return { bg: BLUE_TAGGED, text: '#FFFFFF' };
    case 'Raw':      return { bg: CAUTION,     text: '#FFFFFF' };
  }
}

export default function SportsFilmRoom() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [role, cycleRole, roleCycles] = useDemoRole('sports:hub');
  const isHeadCoach = role === roleCycles[0];

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [selectedFilm, setSelectedFilm] = useState<GameFilm | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSpeed, setActiveSpeed] = useState('1x');
  const [togglePlayTags, setTogglePlayTags] = useState(false);
  const [toggleShotChart, setToggleShotChart] = useState(false);
  const [togglePlayerHighlights, setTogglePlayerHighlights] = useState(false);

  useFocusEffect(
    useCallback(() => {
      resetFooter();
      if (!isHeadCoach) {
        router.replace('/(tabs)/(main)/hub/sports-player-film' as any);
      }
    }, [isHeadCoach])
  );

  const styles = useMemo(() => makeStyles(C, insets), [C, insets]);

  const handleFilmPress = useCallback((film: GameFilm) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedFilm(film);
    setIsPlaying(false);
    setActiveSpeed('1x');
    setTogglePlayTags(false);
    setToggleShotChart(false);
    setTogglePlayerHighlights(false);
  }, []);

  const handlePlaylistPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Playlist', 'Opening playlist viewer…');
  }, []);

  const handlePracticeFilm = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Practice Film', 'Loading practice session recordings…');
  }, []);

  const handleOpponentFilm = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Opponent Film', 'Loading opponent scouting film…');
  }, []);

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={styles.topBar}>
          <Pressable style={styles.kBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={8}>
            <KMenuButton />
          </Pressable>
          <View style={[styles.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
            <Text style={[styles.titlePillText, { color: C.label }]}>Film Room</Text>
          </View>
          <RolePill role={role} onPress={cycleRole} />
        </View>
      </Animated.View>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + TOP_BAR_H + 8 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* GAME FILM LIBRARY */}
        <Text style={[styles.sectionHeader, { color: C.secondary }]}>GAME FILM LIBRARY</Text>
        {GAME_FILMS.map((film) => {
          const statusStyle = filmStatusStyle(film.status);
          return (
            <Pressable
              key={film.id}
              style={[styles.filmCard, { backgroundColor: C.surface }]}
              onPress={() => handleFilmPress(film)}
            >
              <View style={styles.opponentBadge}>
                <Text style={styles.opponentBadgeText}>{film.initial}</Text>
              </View>
              <View style={styles.filmInfo}>
                <Text style={[styles.filmTitle, { color: C.label }]}>{film.opponent}</Text>
                <Text style={[styles.filmMeta, { color: C.secondary }]}>
                  {film.date} · {film.result}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
                  {film.status}
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={14} color={C.secondary} />
            </Pressable>
          );
        })}

        {/* FILM VIEWER */}
        {selectedFilm && (
          <View style={styles.viewerCard}>
            <View style={styles.viewerHeader}>
              <Text style={styles.viewerNowPlaying}>NOW PLAYING</Text>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedFilm(null);
                }}
              >
                <IconSymbol name="xmark" size={18} color="#F0E8DC" />
              </Pressable>
            </View>

            <View style={styles.videoArea}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setIsPlaying(!isPlaying);
                }}
                style={styles.playButton}
              >
                <IconSymbol
                  name={isPlaying ? 'pause.fill' : 'play.fill'}
                  size={60}
                  color="#F0E8DC"
                />
              </Pressable>
              <Text style={styles.videoTitle}>{selectedFilm.opponent}</Text>
              <Text style={styles.videoDate}>{selectedFilm.date} · {selectedFilm.result}</Text>
            </View>

            <View style={styles.controlsRow}>
              {[
                { icon: 'backward.end.fill', label: '0.5x' },
                { icon: 'backward.fill',     label: 'Prev'  },
                { icon: isPlaying ? 'pause.fill' : 'play.fill', label: isPlaying ? 'Pause' : 'Play' },
                { icon: 'forward.fill',      label: 'Next'  },
                { icon: 'forward.end.fill',  label: '2x'    },
              ].map((ctrl, idx) => (
                <Pressable
                  key={idx}
                  style={styles.controlBtn}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    if (idx === 2) setIsPlaying(!isPlaying);
                  }}
                >
                  <IconSymbol name={ctrl.icon as any} size={20} color="#F0E8DC" />
                  <Text style={styles.controlBtnLabel}>{ctrl.label}</Text>
                </Pressable>
              ))}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.speedScroll}>
              <View style={styles.speedRow}>
                {SPEED_OPTIONS.map((sp) => (
                  <Pressable
                    key={sp}
                    style={[
                      styles.speedPill,
                      activeSpeed === sp && styles.speedPillActive,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setActiveSpeed(sp);
                    }}
                  >
                    <Text
                      style={[
                        styles.speedPillText,
                        activeSpeed === sp && styles.speedPillTextActive,
                      ]}
                    >
                      {sp}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.viewerSubHeader}>INTELLIGENCE OVERLAYS</Text>
            <View style={styles.toggleRow}>
              {[
                { label: 'Play Tags',         value: togglePlayTags,         setter: setTogglePlayTags         },
                { label: 'Shot Chart',         value: toggleShotChart,        setter: setToggleShotChart        },
                { label: 'Player Highlights',  value: togglePlayerHighlights, setter: setTogglePlayerHighlights },
              ].map((tog) => (
                <Pressable
                  key={tog.label}
                  style={[
                    styles.togglePill,
                    { backgroundColor: tog.value ? '#F0E8DC' : '#3D352E' },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    tog.setter(!tog.value);
                  }}
                >
                  <Text
                    style={[
                      styles.togglePillText,
                      { color: tog.value ? DARK_PREMIUM : '#8A837C' },
                    ]}
                  >
                    {tog.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.viewerSubHeader}>TIMELINE</Text>
            <View style={styles.timelineBar}>
              {TIMELINE_MARKERS.map((marker, idx) => (
                <View key={idx} style={styles.timelineSegment}>
                  <View style={[styles.timelineDot, { backgroundColor: marker.color }]} />
                  <Text style={styles.timelineLabel}>{marker.label}</Text>
                </View>
              ))}
            </View>
            <View style={styles.timelineTrack}>
              {TIMELINE_MARKERS.map((marker, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.timelineMarker,
                    { left: `${15 + idx * 20}%` as any, backgroundColor: marker.color },
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {/* TELESTRATION toolbar teaser */}
        <View style={styles.telestrationCard}>
          <Text style={styles.telestrationHeader}>TELESTRATION</Text>
          <View style={styles.telestrationTools}>
            {TELESTRATION_TOOLS.map((tool) => (
              <Pressable
                key={tool.label}
                style={styles.telestrationTool}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('Telestration', `${tool.label} tool selected. Tap on film to annotate.`);
                }}
              >
                <View style={styles.telestrationIconWrap}>
                  <IconSymbol name={tool.icon as any} size={22} color="#8A837C" />
                </View>
                <Text style={styles.telestrationLabel}>{tool.label}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.telestrationHint}>Tap to annotate film</Text>
        </View>

        {/* PLAYLISTS */}
        <Text style={[styles.sectionHeader, { color: C.secondary }]}>PLAYLISTS</Text>
        {PLAYLISTS.map((pl) => (
          <Pressable
            key={pl.id}
            style={[styles.playlistCard, { backgroundColor: C.surface }]}
            onPress={handlePlaylistPress}
          >
            <IconSymbol name="film.stack.fill" size={22} color={C.secondary} style={{ marginRight: 12 }} />
            <View style={styles.playlistInfo}>
              <Text style={[styles.playlistTitle, { color: C.label }]}>{pl.title}</Text>
              <Text style={[styles.playlistMeta, { color: C.secondary }]}>{pl.clips} clips</Text>
            </View>
            <IconSymbol name="chevron.right" size={14} color={C.secondary} />
          </Pressable>
        ))}

        {/* PRACTICE FILM & OPPONENT FILM */}
        <View style={styles.filmButtonsRow}>
          <Pressable style={styles.filmBtn} onPress={handlePracticeFilm}>
            <IconSymbol name="sportscourt" size={22} color="#F0E8DC" />
            <Text style={styles.filmBtnText}>{'PRACTICE\nFILM'}</Text>
          </Pressable>
          <Pressable style={styles.filmBtn} onPress={handleOpponentFilm}>
            <IconSymbol name="doc.text.magnifyingglass" size={22} color="#F0E8DC" />
            <Text style={styles.filmBtnText}>{'OPPONENT\nFILM'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(C: ComponentColors, insets: ReturnType<typeof useSafeAreaInsets>) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: C.bg,
    },
    topBarOuter: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBar: {
      height: TOP_BAR_H,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 4,
    },
    kBtn: {
      width: 44,
      height: 44,
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingLeft: 8,
    },
    titlePill: {
      borderRadius: 18,
      borderWidth: 1,
      paddingHorizontal: 16,
      paddingVertical: 6,
    },
    titlePillText: {
      fontSize: 13,
      fontWeight: '700',
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: insets.bottom + 80,
    },
    sectionHeader: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.2,
      marginHorizontal: 16,
      marginTop: 24,
      marginBottom: 10,
    },

    /* Film cards */
    filmCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      marginHorizontal: 16,
      marginBottom: 8,
      padding: 14,
    },
    opponentBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: DARK_PREMIUM,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    opponentBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    filmInfo: {
      flex: 1,
    },
    filmTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 2,
    },
    filmMeta: {
      fontSize: 12,
    },
    statusBadge: {
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
      marginRight: 8,
    },
    statusBadgeText: {
      fontSize: 11,
      fontWeight: '700',
    },

    /* Film viewer */
    viewerCard: {
      backgroundColor: DARK_PREMIUM,
      borderRadius: 16,
      marginHorizontal: 16,
      marginTop: 16,
      overflow: 'hidden',
      paddingBottom: 16,
    },
    viewerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#3D352E',
    },
    viewerNowPlaying: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.2,
      color: GAIN,
    },
    videoArea: {
      height: 200,
      backgroundColor: DARKEST,
      alignItems: 'center',
      justifyContent: 'center',
    },
    playButton: {
      marginBottom: 8,
    },
    videoTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#F0E8DC',
      marginTop: 4,
    },
    videoDate: {
      fontSize: 12,
      color: '#8A837C',
      marginTop: 2,
    },
    controlsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    controlBtn: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    },
    controlBtnLabel: {
      fontSize: 9,
      color: '#8A837C',
    },
    speedScroll: {
      paddingHorizontal: 12,
    },
    speedRow: {
      flexDirection: 'row',
      gap: 8,
      paddingVertical: 4,
      paddingHorizontal: 4,
    },
    speedPill: {
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 5,
      backgroundColor: '#3D352E',
    },
    speedPillActive: {
      backgroundColor: '#F0E8DC',
    },
    speedPillText: {
      fontSize: 12,
      fontWeight: '500',
      color: '#8A837C',
    },
    speedPillTextActive: {
      color: DARK_PREMIUM,
      fontWeight: '700',
    },
    viewerSubHeader: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.2,
      color: '#8A837C',
      marginHorizontal: 16,
      marginTop: 14,
      marginBottom: 8,
    },
    toggleRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      paddingHorizontal: 16,
    },
    togglePill: {
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    togglePillText: {
      fontSize: 12,
      fontWeight: '600',
    },
    timelineBar: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    timelineSegment: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    timelineDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    timelineLabel: {
      fontSize: 10,
      color: '#8A837C',
    },
    timelineTrack: {
      height: 6,
      backgroundColor: '#3D352E',
      borderRadius: 3,
      marginHorizontal: 16,
      marginTop: 4,
      position: 'relative',
    },
    timelineMarker: {
      position: 'absolute',
      width: 6,
      height: 6,
      borderRadius: 3,
      top: 0,
    },

    /* Telestration */
    telestrationCard: {
      backgroundColor: DARK_PREMIUM,
      borderRadius: 12,
      marginHorizontal: 16,
      marginTop: 24,
      padding: 12,
    },
    telestrationHeader: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.2,
      color: '#F0E8DC',
      marginBottom: 12,
    },
    telestrationTools: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 10,
    },
    telestrationTool: {
      alignItems: 'center',
      gap: 4,
    },
    telestrationIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 10,
      backgroundColor: '#261D17',
      alignItems: 'center',
      justifyContent: 'center',
    },
    telestrationLabel: {
      fontSize: 10,
      color: '#8A837C',
    },
    telestrationHint: {
      fontSize: 12,
      color: '#8A837C',
      textAlign: 'center',
      marginTop: 2,
    },

    /* Playlists */
    playlistCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      marginHorizontal: 16,
      marginBottom: 8,
      padding: 14,
    },
    playlistInfo: {
      flex: 1,
    },
    playlistTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 2,
    },
    playlistMeta: {
      fontSize: 12,
    },

    /* Film buttons row */
    filmButtonsRow: {
      flexDirection: 'row',
      gap: 10,
      marginHorizontal: 16,
      marginTop: 24,
    },
    filmBtn: {
      flex: 1,
      height: 72,
      backgroundColor: DARK_PREMIUM,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    filmBtnText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#F0E8DC',
      textAlign: 'center',
      letterSpacing: 0.5,
    },
  });
}
