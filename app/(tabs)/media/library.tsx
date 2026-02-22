/**
 * Library — expandable bucket rows for organized video content.
 * Content tabs (My Team / League / Explore) at top.
 */

import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { VideoHeader } from '@/components/media/video-header';
import { ContentTabRow, type ContentTab, type VideoMode } from '@/components/media/content-tab-row';
import { LibraryBucket } from '@/components/media/library-bucket';
import { ClipCard } from '@/components/media/clip-card';
import { ReelCard } from '@/components/media/reel-card';
import { LinkCard } from '@/components/media/link-card';
import { SaveLinkSheet } from '@/components/media/save-link-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, BorderRadius } from '@/constants/theme';
import {
  MOCK_VIDEO_GAMES,
  MOCK_VIDEO_CLIPS,
  MOCK_REELS,
  MOCK_SCOUT_PACKS,
} from '@/data/mock-video';
import { COACH_COLLECTIONS } from '@/data/mock-coach-library';

// =============================================================================
// MY TEAM LIBRARY
// =============================================================================

function MyTeamLibrary() {
  const gameCount = MOCK_VIDEO_GAMES.length;
  const practiceCount = MOCK_VIDEO_CLIPS.filter((c) => c.type === 'drill').length;
  const reelCount = MOCK_REELS.length;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <LibraryBucket icon="play.rectangle.fill" label="Games" count={gameCount}>
        {MOCK_VIDEO_CLIPS.filter((c) => c.gameId).slice(0, 3).map((clip) => (
          <ClipCard key={clip.id} clip={clip} />
        ))}
      </LibraryBucket>

      <LibraryBucket icon="sportscourt.fill" label="Practice" count={practiceCount}>
        {MOCK_VIDEO_CLIPS.filter((c) => c.type === 'drill').slice(0, 3).map((clip) => (
          <ClipCard key={clip.id} clip={clip} />
        ))}
      </LibraryBucket>

      <LibraryBucket icon="play.circle.fill" label="Reels" count={reelCount}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hScroll}
        >
          {MOCK_REELS.slice(0, 4).map((reel) => (
            <ReelCard key={reel.id} reel={reel} />
          ))}
        </ScrollView>
      </LibraryBucket>
    </ScrollView>
  );
}

// =============================================================================
// LEAGUE LIBRARY
// =============================================================================

function LeagueLibrary() {
  const opponentCount = MOCK_SCOUT_PACKS.length;
  const leagueClipCount = MOCK_VIDEO_CLIPS.filter(
    (c) => c.type === 'highlight' || c.type === 'breakdown',
  ).length;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <LibraryBucket icon="person.3.fill" label="Opponents" count={opponentCount}>
        {MOCK_VIDEO_CLIPS.filter((c) => c.type === 'scout').slice(0, 3).map((clip) => (
          <ClipCard key={clip.id} clip={clip} />
        ))}
      </LibraryBucket>

      <LibraryBucket icon="chart.bar.fill" label="League Clips" count={leagueClipCount}>
        {MOCK_VIDEO_CLIPS.filter((c) => c.type === 'breakdown').slice(0, 3).map((clip) => (
          <ClipCard key={clip.id} clip={clip} />
        ))}
      </LibraryBucket>
    </ScrollView>
  );
}

// =============================================================================
// EXPLORE LIBRARY
// =============================================================================

function ExploreLibrary() {
  const savedCount = 5;
  const sharedCount = 3;
  const downloadCount = 2;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <LibraryBucket icon="bookmark.fill" label="Saved" count={savedCount}>
        {MOCK_VIDEO_CLIPS.slice(0, 3).map((clip) => (
          <ClipCard key={clip.id} clip={clip} />
        ))}
      </LibraryBucket>

      <LibraryBucket icon="square.and.arrow.up" label="Shared With Me" count={sharedCount}>
        {MOCK_VIDEO_CLIPS.slice(3, 6).map((clip) => (
          <ClipCard key={clip.id} clip={clip} />
        ))}
      </LibraryBucket>

      <LibraryBucket icon="folder.fill" label="Downloads" count={downloadCount}>
        <ThemedText style={styles.emptyText}>No downloads yet</ThemedText>
      </LibraryBucket>
    </ScrollView>
  );
}

// =============================================================================
// COACH LIBRARY
// =============================================================================

function CoachLibrary({ onSaveLink }: { onSaveLink: () => void }) {
  return (
    <View style={styles.flex}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {COACH_COLLECTIONS.map((collection) => (
          <LibraryBucket
            key={collection.id}
            icon={collection.icon as any}
            label={collection.label}
            count={collection.items.length}
          >
            {collection.items.map((item) => (
              <LinkCard key={item.id} item={item} />
            ))}
          </LibraryBucket>
        ))}
      </ScrollView>

      {/* FAB — Save Link */}
      <Pressable
        style={styles.fab}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onSaveLink();
        }}
      >
        <IconSymbol name="plus" size={22} color="#000" />
      </Pressable>
    </View>
  );
}

// =============================================================================
// MAIN SCREEN
// =============================================================================

export default function LibraryScreen() {
  const [tab, setTab] = useState<ContentTab>('tab1');
  const [saveLinkVisible, setSaveLinkVisible] = useState(false);
  const mode: VideoMode = 'film'; // Library always uses film-mode labels

  return (
    <ThemedView style={styles.container}>
      <VideoHeader title="Library" />
      <ContentTabRow activeTab={tab} onTabChange={setTab} mode={mode} />

      <View style={styles.flex}>
        {tab === 'tab1' && <MyTeamLibrary />}
        {tab === 'tab2' && <LeagueLibrary />}
        {tab === 'tab3' && <ExploreLibrary />}
        {tab === 'tab4' && <CoachLibrary onSaveLink={() => setSaveLinkVisible(true)} />}
      </View>

      <SaveLinkSheet
        visible={saveLinkVisible}
        onClose={() => setSaveLinkVisible(false)}
      />
    </ThemedView>
  );
}

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
  hScroll: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  emptyText: {
    fontSize: 13,
    color: '#555',
    padding: Spacing.md,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: Spacing.lg,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
