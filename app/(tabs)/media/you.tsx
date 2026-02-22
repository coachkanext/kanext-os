/**
 * You — personal media hub with Film Room toggle.
 * Toggle between "You" (uploads, reels, saved, history) and "Film Room" (Film/Recruiting content tabs).
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  FlatList,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { VideoHeader } from '@/components/media/video-header';
import { ReelCard } from '@/components/media/reel-card';
import { ClipCard } from '@/components/media/clip-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ContentTabRow, type ContentTab, type VideoMode } from '@/components/media/content-tab-row';
import { FilmRecruitingToggle } from '@/components/media/film-recruiting-toggle';
import { TeamHeader } from '@/components/media/team-header';
import { GameCard } from '@/components/media/game-card';
import { ContinueWatchingRow } from '@/components/media/continue-watching-row';
import { RecruitClipCard } from '@/components/media/recruit-clip-card';
import { OpponentScoutRow } from '@/components/media/opponent-scout-row';
import { ShareSheet } from '@/components/media/share-sheet';
import { Spacing, BorderRadius } from '@/constants/theme';
import { KaNeXT_RECORD, KaNeXT_STANDINGS } from '@/data/fmu';
import {
  MOCK_REELS,
  MOCK_VIDEO_CLIPS,
  MOCK_WATCH_HISTORY,
  MOCK_VIDEO_GAMES,
  MOCK_RECRUIT_CLIPS,
  MOCK_SCOUT_PACKS,
} from '@/data/mock-video';
import type { VideoClip } from '@/data/mock-video';

type YouTab = 'you' | 'film_room';

// KaNeXT identity data for TeamHeader
const KaNeXT_SEAL = require('@/assets/images/fmu-seal.png');
const fmuStreak = KaNeXT_STANDINGS.find((r) => r.team === 'KaNeXT Sports')?.streak ?? '—';

// =============================================================================
// YOU CONTENT
// =============================================================================

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
        <ThemedText style={styles.seeAll}>See All</ThemedText>
      </Pressable>
    </View>
  );
}

function YouContent() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {/* Action buttons */}
      <View style={styles.actionRow}>
        <Pressable
          style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.8 }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="plus.app.fill" size={20} color="#f5f5f5" />
          <ThemedText style={styles.actionBtnText}>Create</ThemedText>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.8 }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="books.vertical.fill" size={20} color="#f5f5f5" />
          <ThemedText style={styles.actionBtnText}>Library</ThemedText>
        </Pressable>
      </View>

      {/* My Uploads */}
      <SectionHeader title="My Uploads" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hScroll}
        style={styles.hScrollWrap}
      >
        {MOCK_VIDEO_CLIPS.filter((c) => c.source === 'Hudl').slice(0, 4).map((clip) => (
          <View key={clip.id} style={styles.clipWrap}>
            <ClipCard clip={clip} variant="grid" />
          </View>
        ))}
      </ScrollView>

      {/* My Reels */}
      <SectionHeader title="My Reels" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hScroll}
        style={styles.hScrollWrap}
      >
        {MOCK_REELS.slice(0, 5).map((reel) => (
          <ReelCard key={reel.id} reel={reel} />
        ))}
      </ScrollView>

      {/* Saved */}
      <SectionHeader title="Saved" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hScroll}
        style={styles.hScrollWrap}
      >
        {MOCK_VIDEO_CLIPS.slice(0, 4).map((clip) => (
          <View key={clip.id} style={styles.clipWrap}>
            <ClipCard clip={clip} variant="grid" />
          </View>
        ))}
      </ScrollView>

      {/* Watch History */}
      <SectionHeader title="Watch History" />
      {MOCK_WATCH_HISTORY.slice(0, 5).map((item) => (
        <Pressable
          key={item.id}
          style={({ pressed }) => [
            styles.historyRow,
            { backgroundColor: pressed ? '#191919' : 'transparent' },
          ]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <View style={[styles.historyThumb, { backgroundColor: item.thumbnailColor }]}>
            <IconSymbol name="play.fill" size={10} color="#fff" />
          </View>
          <View style={styles.historyInfo}>
            <ThemedText style={styles.historyTitle} numberOfLines={1}>{item.title}</ThemedText>
            <ThemedText style={styles.historyMeta}>
              {item.contentType} · {item.progress}% watched
            </ThemedText>
          </View>
          <View style={styles.historyProgress}>
            <View style={styles.historyProgressBar}>
              <View style={[styles.historyProgressFill, { width: `${item.progress}%` }]} />
            </View>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// FILM ROOM CONTENT (from old Home)
// =============================================================================

function MyTeamContent({ onShare }: { onShare: (title: string) => void }) {
  const router = useRouter();

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <TeamHeader
        teamName="KaNeXT Sports"
        teamLogo={FMU_SEAL}
        level="NAIA"
        conference="KaNeXT Conference"
        teamKR={74}
        offKR={74}
        defKR={73}
        record={FMU_RECORD.overall}
        confRecord={FMU_RECORD.conference}
        streak={fmuStreak}
        tier="Regional Power"
        onShare={() => onShare('KaNeXT Team Channel')}
      />

      <ThemedText style={styles.filmSectionTitle}>Recent Games</ThemedText>
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

      <ThemedText style={styles.filmSectionTitle}>Reels</ThemedText>
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

      <ContinueWatchingRow items={MOCK_WATCH_HISTORY} />
    </ScrollView>
  );
}

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
      contentContainerStyle={styles.filmListContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

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

function MyTargetsContent() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <ThemedText style={styles.filmSectionTitle}>Saved Recruits</ThemedText>
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

function OpponentsContent() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <ThemedText style={styles.filmSectionTitle}>Upcoming Opponents</ThemedText>
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
        contentContainerStyle={styles.filmListContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function FilmRoomContent() {
  const [mode, setMode] = useState<VideoMode>('film');
  const [tab, setTab] = useState<ContentTab>('tab1');
  const [shareVisible, setShareVisible] = useState(false);
  const [shareTitle, setShareTitle] = useState('');

  const handleShare = useCallback((title: string) => {
    setShareTitle(title);
    setShareVisible(true);
  }, []);

  return (
    <View style={styles.flex}>
      {/* Film / Recruiting Toggle */}
      <View style={styles.modeRow}>
        <FilmRecruitingToggle mode={mode} onModeChange={setMode} />
      </View>

      <ContentTabRow activeTab={tab} onTabChange={setTab} mode={mode} />

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
    </View>
  );
}

// =============================================================================
// MAIN SCREEN
// =============================================================================

export default function YouScreen() {
  const [activeTab, setActiveTab] = useState<YouTab>('you');

  return (
    <ThemedView style={styles.container}>
      <VideoHeader title={activeTab === 'you' ? 'You' : 'Film Room'} />

      {/* You / Film Room Toggle */}
      <View style={styles.toggleRow}>
        <View style={styles.capsule}>
          {([
            { key: 'you' as YouTab, label: 'You' },
            { key: 'film_room' as YouTab, label: 'Film Room' },
          ]).map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={[styles.toggleTab, { backgroundColor: isActive ? '#2a2a2a' : 'transparent' }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveTab(tab.key);
                }}
              >
                <ThemedText style={[styles.toggleText, { color: isActive ? '#f5f5f5' : '#6e6e6e' }]}>
                  {tab.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {activeTab === 'you' ? <YouContent /> : <FilmRoomContent />}
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
  scrollContent: {
    paddingBottom: 120,
  },

  // Toggle
  toggleRow: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  capsule: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 3,
  },
  toggleTab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 18,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // You — Action buttons
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#191919',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f5f5f5',
  },

  // You — Sections
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f5f5f5',
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6e6e6e',
  },

  // Horizontal scrolls
  hScrollWrap: {
    flexGrow: 0,
    marginBottom: Spacing.xs,
  },
  hScroll: {
    paddingHorizontal: Spacing.md,
  },
  clipWrap: {
    width: 160,
  },

  // Watch history
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1a1a1a',
  },
  historyThumb: {
    width: 40,
    height: 40,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  historyInfo: {
    flex: 1,
    marginRight: 10,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#f5f5f5',
    marginBottom: 2,
  },
  historyMeta: {
    fontSize: 12,
    color: '#6e6e6e',
    textTransform: 'capitalize',
  },
  historyProgress: {
    width: 48,
  },
  historyProgressBar: {
    height: 3,
    backgroundColor: '#2a2a2a',
    borderRadius: 2,
  },
  historyProgressFill: {
    height: 3,
    backgroundColor: '#f5f5f5',
    borderRadius: 2,
  },

  // Film Room
  modeRow: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  filmSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f5f5f5',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
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
  filmListContent: {
    paddingBottom: 120,
    paddingTop: Spacing.xs,
  },
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
