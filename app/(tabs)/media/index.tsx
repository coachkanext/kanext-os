/**
 * Video Home — main landing screen for the Media tab.
 * Film/Recruiting toggle + 3 content tabs.
 * Film: My Team / League / Explore
 * Recruiting: My Targets / Opponents (Auto) / Recruit Discovery
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ContentTabRow, type ContentTab, type VideoMode } from '@/components/media/content-tab-row';
import { FilmRecruitingToggle } from '@/components/media/film-recruiting-toggle';
import { TeamHeader } from '@/components/media/team-header';
import { GameCard } from '@/components/media/game-card';
import { ClipCard } from '@/components/media/clip-card';
import { ReelCard } from '@/components/media/reel-card';
import { ContinueWatchingRow } from '@/components/media/continue-watching-row';
import { RecruitClipCard } from '@/components/media/recruit-clip-card';
import { OpponentScoutRow } from '@/components/media/opponent-scout-row';
import { ShareSheet } from '@/components/media/share-sheet';
import { Spacing, BorderRadius } from '@/constants/theme';
import {
  MOCK_VIDEO_GAMES,
  MOCK_VIDEO_CLIPS,
  MOCK_REELS,
  MOCK_WATCH_HISTORY,
  MOCK_RECRUIT_CLIPS,
  MOCK_SCOUT_PACKS,
} from '@/data/mock-video';
import type { VideoGame, VideoClip, Reel, RecruitClip } from '@/data/mock-video';

// =============================================================================
// MY TEAM TAB (Film Mode)
// =============================================================================

function MyTeamContent({ onShare }: { onShare: (title: string) => void }) {
  const router = useRouter();

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <TeamHeader
        teamName="FMU Lions"
        teamInitials="FMU"
        teamColor="#1a472a"
        onShare={() => onShare('FMU Lions Team Channel')}
      />

      {/* Recent Games */}
      <ThemedText style={styles.sectionTitle}>Recent Games</ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hScroll}
        style={styles.hScrollWrap}
      >
        {MOCK_VIDEO_GAMES.slice(0, 5).map((game) => (
          <View key={game.id} style={styles.gameCardWrap}>
            <GameCard
              game={game}
              onPress={() => router.push(`/coach/video-game?id=${game.id}` as any)}
            />
            <Pressable
              style={styles.shareOverlay}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onShare(`vs ${game.opponent} — ${game.score}`);
              }}
            >
              <IconSymbol name="square.and.arrow.up" size={14} color="#fff" />
            </Pressable>
          </View>
        ))}
      </ScrollView>

      {/* Reels */}
      <ThemedText style={styles.sectionTitle}>Reels</ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hScroll}
        style={styles.hScrollWrap}
      >
        {MOCK_REELS.slice(0, 6).map((reel) => (
          <ReelCard
            key={reel.id}
            reel={reel}
            onPress={() => router.push(`/coach/reel-viewer?reelId=${reel.id}` as any)}
          />
        ))}
      </ScrollView>

      {/* Continue Watching */}
      <ContinueWatchingRow items={MOCK_WATCH_HISTORY} />
    </ScrollView>
  );
}

// =============================================================================
// LEAGUE TAB (Film Mode)
// =============================================================================

function LeagueContent() {
  const leagueClips = useMemo(
    () => MOCK_VIDEO_CLIPS.filter((c) => c.type === 'highlight' || c.type === 'breakdown'),
    [],
  );

  return (
    <FlatList
      data={leagueClips}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ClipCard clip={item} />}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

// =============================================================================
// EXPLORE TAB (Film Mode)
// =============================================================================

function ExploreContent() {
  const [search, setSearch] = useState('');

  const clips = useMemo(() => {
    if (!search.trim()) return MOCK_VIDEO_CLIPS;
    const q = search.toLowerCase();
    return MOCK_VIDEO_CLIPS.filter(
      (c) => c.title.toLowerCase().includes(q) || c.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [search]);

  const rows = useMemo(() => {
    const result: VideoClip[][] = [];
    for (let i = 0; i < clips.length; i += 2) {
      result.push(clips.slice(i, i + 2));
    }
    return result;
  }, [clips]);

  return (
    <View style={styles.flex}>
      <View style={styles.searchBar}>
        <IconSymbol name="magnifyingglass" size={16} color="#555" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search clips..."
          placeholderTextColor="#555"
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <FlatList
        data={rows}
        keyExtractor={(_, i) => `row-${i}`}
        renderItem={({ item: row }) => (
          <View style={styles.gridRow}>
            {row.map((clip) => (
              <ClipCard key={clip.id} clip={clip} variant="grid" />
            ))}
            {row.length === 1 && <View style={styles.gridSpacer} />}
          </View>
        )}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// =============================================================================
// MY TARGETS TAB (Recruiting Mode)
// =============================================================================

function MyTargetsContent() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <ThemedText style={styles.sectionTitle}>Saved Recruits</ThemedText>
      {MOCK_RECRUIT_CLIPS.slice(0, 4).map((clip) => (
        <RecruitClipCard key={clip.id} clip={clip} />
      ))}
      <Pressable
        style={styles.addCta}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
      >
        <IconSymbol name="plus.circle.fill" size={18} color="#f5f5f5" />
        <ThemedText style={styles.addCtaText}>Add Recruit</ThemedText>
      </Pressable>
    </ScrollView>
  );
}

// =============================================================================
// OPPONENTS TAB (Recruiting Mode)
// =============================================================================

function OpponentsContent() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <ThemedText style={styles.sectionTitle}>Upcoming Opponents</ThemedText>
      {MOCK_SCOUT_PACKS.map((pack) => (
        <OpponentScoutRow
          key={pack.id}
          opponent={pack.opponent}
          date={pack.date}
          color={pack.coverColor}
        />
      ))}
    </ScrollView>
  );
}

// =============================================================================
// RECRUIT DISCOVERY TAB (Recruiting Mode)
// =============================================================================

function RecruitDiscoveryContent() {
  const [search, setSearch] = useState('');

  const clips = useMemo(() => {
    if (!search.trim()) return MOCK_RECRUIT_CLIPS;
    const q = search.toLowerCase();
    return MOCK_RECRUIT_CLIPS.filter(
      (c) =>
        c.recruitName.toLowerCase().includes(q) ||
        c.school.toLowerCase().includes(q) ||
        c.position.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <View style={styles.flex}>
      <View style={styles.searchBar}>
        <IconSymbol name="magnifyingglass" size={16} color="#555" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search recruits..."
          placeholderTextColor="#555"
          value={search}
          onChangeText={setSearch}
        />
      </View>
      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        {['Level', 'Region', 'Archetype', 'KR Band', 'Class', 'Source'].map((f) => (
          <Pressable
            key={f}
            style={styles.filterChip}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <ThemedText style={styles.filterChipText}>{f}</ThemedText>
            <IconSymbol name="chevron.down" size={10} color="#6e6e6e" />
          </Pressable>
        ))}
      </ScrollView>
      <FlatList
        data={clips}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RecruitClipCard clip={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// =============================================================================
// MAIN SCREEN
// =============================================================================

export default function VideoHomeScreen() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<VideoMode>('film');
  const [tab, setTab] = useState<ContentTab>('tab1');
  const [shareVisible, setShareVisible] = useState(false);
  const [shareTitle, setShareTitle] = useState('');

  const handleShare = useCallback((title: string) => {
    setShareTitle(title);
    setShareVisible(true);
  }, []);

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>KaNeXT Video</ThemedText>
        <FilmRecruitingToggle mode={mode} onModeChange={setMode} />
      </View>

      {/* Content Tabs */}
      <ContentTabRow activeTab={tab} onTabChange={setTab} mode={mode} />

      {/* Tab Content */}
      <View style={styles.flex}>
        {mode === 'film' && tab === 'tab1' && <MyTeamContent onShare={handleShare} />}
        {mode === 'film' && tab === 'tab2' && <LeagueContent />}
        {mode === 'film' && tab === 'tab3' && <ExploreContent />}
        {mode === 'recruiting' && tab === 'tab1' && <MyTargetsContent />}
        {mode === 'recruiting' && tab === 'tab2' && <OpponentsContent />}
        {mode === 'recruiting' && tab === 'tab3' && <RecruitDiscoveryContent />}
      </View>

      <ShareSheet
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        title={shareTitle}
        showVisibility={mode === 'film' && tab === 'tab1'}
      />
    </ThemedView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f5f5f5',
  },

  // Sections
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f5f5f5',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },

  // Scroll helpers
  scrollContent: {
    paddingBottom: 120,
  },
  hScrollWrap: {
    flexGrow: 0,
    marginBottom: Spacing.sm,
  },
  hScroll: {
    paddingHorizontal: Spacing.md,
  },
  gameCardWrap: {
    width: 280,
    marginRight: 10,
    position: 'relative',
  },
  shareOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Lists
  listContent: {
    paddingBottom: 120,
    paddingTop: Spacing.xs,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#f5f5f5',
  },

  // Grid
  gridContent: {
    paddingHorizontal: Spacing.md - 4,
    paddingBottom: 120,
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridSpacer: {
    flex: 1,
    margin: 4,
  },

  // Filter chips
  filterScroll: {
    flexGrow: 0,
    marginBottom: Spacing.sm,
  },
  filterRow: {
    paddingHorizontal: Spacing.md,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6e6e6e',
  },

  // CTA
  addCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    paddingVertical: 14,
    backgroundColor: '#111',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    borderStyle: 'dashed',
  },
  addCtaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f5f5f5',
  },
});
