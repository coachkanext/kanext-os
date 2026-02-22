/**
 * Video Game Detail Screen
 * 5 sub-tabs: Watch, Scout, Clips, Notes, Details.
 * Accessed via router.push('/coach/video-game?id=...').
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
  TextInput,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ClipCard } from '@/components/media/clip-card';
import { VideoThumbnail } from '@/components/media/video-thumbnail';
import { Spacing, BorderRadius } from '@/constants/theme';
import { MOCK_VIDEO_GAMES, MOCK_VIDEO_CLIPS, getResultColor } from '@/data/mock-video';
import type { VideoClip } from '@/data/mock-video';

// =============================================================================
// TYPES
// =============================================================================

type DetailTab = 'watch' | 'scout' | 'clips' | 'notes' | 'details';

const DETAIL_TABS: { key: DetailTab; label: string }[] = [
  { key: 'watch', label: 'Watch' },
  { key: 'scout', label: 'Scout' },
  { key: 'clips', label: 'Clips' },
  { key: 'notes', label: 'Notes' },
  { key: 'details', label: 'Details' },
];

// =============================================================================
// MAIN SCREEN
// =============================================================================

export default function VideoGameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<DetailTab>('watch');

  const game = useMemo(
    () => MOCK_VIDEO_GAMES.find((g) => g.id === id),
    [id],
  );

  const gameClips = useMemo(
    () => MOCK_VIDEO_CLIPS.filter((c) => c.gameId === id),
    [id],
  );

  if (!game) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <IconSymbol name="chevron.left" size={20} color="#FFFFFF" />
          </Pressable>
          <ThemedText style={styles.headerTitle}>Game Not Found</ThemedText>
          <View style={styles.backBtn} />
        </View>
      </ThemedView>
    );
  }

  const resultColor = getResultColor(game.result);

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={styles.backBtn}
        >
          <IconSymbol name="chevron.left" size={20} color="#FFFFFF" />
        </Pressable>
        <View style={styles.headerCenter}>
          <ThemedText style={styles.headerTitle}>vs {game.opponent}</ThemedText>
          <View style={styles.scoreRow}>
            <ThemedText style={[styles.resultText, { color: resultColor }]}>{game.result}</ThemedText>
            <ThemedText style={styles.scoreText}>{game.score}</ThemedText>
          </View>
        </View>
        <View style={styles.backBtn} />
      </View>

      {/* Sub-Tab Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabRowContent}
        style={styles.tabRow}
      >
        {DETAIL_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[
                styles.tabPill,
                { backgroundColor: isActive ? '#FFFFFF' : '#111' },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab.key);
              }}
            >
              <ThemedText
                style={[
                  styles.tabPillText,
                  { color: isActive ? '#000' : '#A1A1AA' },
                ]}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Tab Content */}
      {activeTab === 'watch' && <WatchTab game={game} />}
      {activeTab === 'scout' && <ScoutTab />}
      {activeTab === 'clips' && <ClipsTab clips={gameClips} />}
      {activeTab === 'notes' && <NotesTab />}
      {activeTab === 'details' && <DetailsTab game={game} />}
    </ThemedView>
  );
}

// =============================================================================
// WATCH TAB
// =============================================================================

function WatchTab({ game }: { game: typeof MOCK_VIDEO_GAMES[0] }) {
  return (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.scrollPad}>
      {/* Video Placeholder */}
      <View style={styles.videoContainer}>
        <VideoThumbnail color={game.thumbnailColor} duration={game.duration} />
      </View>

      {/* Game Summary Stats */}
      <View style={styles.statsGrid}>
        <StatBlock label="Clips" value={String(game.clipCount)} />
        <StatBlock label="Score" value={game.score} />
        <StatBlock label="Result" value={game.result} color={getResultColor(game.result)} />
        <StatBlock label="Date" value={game.date.split(',')[0]} />
      </View>
    </ScrollView>
  );
}

function StatBlock({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.statBlock}>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
      <ThemedText style={[styles.statValue, color ? { color } : undefined]}>{value}</ThemedText>
    </View>
  );
}

// =============================================================================
// SCOUT TAB
// =============================================================================

const SCOUT_PLAYS = [
  { id: 'sp1', title: 'Key Play: Fast Break Conversion', time: 'Q1 6:42', note: 'Guard pushed pace after rebound, found wing for open 3.' },
  { id: 'sp2', title: 'Key Play: Zone Press Break', time: 'Q2 3:15', note: 'Quick reversal through the high post broke the press cleanly.' },
  { id: 'sp3', title: 'Key Play: Pick & Roll Defense', time: 'Q3 8:20', note: 'Dropped too far on hedge, gave up midrange pull-up.' },
  { id: 'sp4', title: 'Key Play: End of Half Set', time: 'Q2 0:08', note: 'ISO for MJ at the elbow. Hit the contested midrange at the buzzer.' },
];

function ScoutTab() {
  return (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.scrollPad}>
      <ThemedText style={styles.sectionTitle}>Key Plays</ThemedText>
      {SCOUT_PLAYS.map((play) => (
        <Pressable
          key={play.id}
          style={({ pressed }) => [
            styles.scoutCard,
            { backgroundColor: pressed ? '#0B0F14' : '#111' },
          ]}
        >
          <View style={styles.scoutHeader}>
            <ThemedText style={styles.scoutPlayTitle}>{play.title}</ThemedText>
            <ThemedText style={styles.scoutTime}>{play.time}</ThemedText>
          </View>
          <ThemedText style={styles.scoutNote}>{play.note}</ThemedText>
        </Pressable>
      ))}

      <ThemedText style={[styles.sectionTitle, { marginTop: Spacing.md }]}>Scouting Notes</ThemedText>
      <View style={styles.scoutCard}>
        <ThemedText style={styles.scoutNote}>
          Opponent struggled with ball pressure in the backcourt. Consider full-court press in Q3.
          Their center is slow in transition — push the pace after defensive rebounds.
        </ThemedText>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// CLIPS TAB
// =============================================================================

function ClipsTab({ clips }: { clips: VideoClip[] }) {
  const renderClip = useCallback(
    ({ item }: { item: VideoClip }) => <ClipCard clip={item} />,
    [],
  );

  return (
    <View style={styles.tabContent}>
      {clips.length > 0 ? (
        <FlatList
          data={clips}
          keyExtractor={(item) => item.id}
          renderItem={renderClip}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>No clips for this game yet</ThemedText>
        </View>
      )}
    </View>
  );
}

// =============================================================================
// NOTES TAB
// =============================================================================

function NotesTab() {
  const [notes, setNotes] = useState('');

  return (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.scrollPad}>
      <ThemedText style={styles.sectionTitle}>Coach Notes</ThemedText>
      <TextInput
        style={styles.notesInput}
        placeholder="Add your notes for this game..."
        placeholderTextColor="#555"
        multiline
        value={notes}
        onChangeText={setNotes}
        textAlignVertical="top"
      />
      <ThemedText style={styles.notesSaved}>
        {notes.length > 0 ? 'Draft (not saved)' : ''}
      </ThemedText>
    </ScrollView>
  );
}

// =============================================================================
// DETAILS TAB
// =============================================================================

function DetailsTab({ game }: { game: typeof MOCK_VIDEO_GAMES[0] }) {
  return (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.scrollPad}>
      <ThemedText style={styles.sectionTitle}>Game Information</ThemedText>
      <View style={styles.detailsCard}>
        <DetailRow label="Date" value={game.date} />
        <DetailRow label="Opponent" value={game.opponent} />
        <DetailRow label="Result" value={`${game.result} ${game.score}`} />
        <DetailRow label="Location" value={game.tags.includes('Home') ? 'Smith Center (Home)' : `${game.opponent} Arena (Away)`} />
        <DetailRow label="Officials" value="Johnson, Williams, Davis" />
        <DetailRow label="Attendance" value="2,847" />
        <DetailRow label="Clips" value={`${game.clipCount} clips available`} />
      </View>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <ThemedText style={styles.detailLabel}>{label}</ThemedText>
      <ThemedText style={styles.detailValue}>{value}</ThemedText>
    </View>
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  resultText: {
    fontSize: 14,
    fontWeight: '700',
  },
  scoreText: {
    fontSize: 14,
    color: '#A1A1AA',
  },

  // Sub-tabs
  tabRow: {
    flexGrow: 0,
    marginBottom: Spacing.md,
  },
  tabRowContent: {
    paddingHorizontal: Spacing.md,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabPillText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Tab content
  tabContent: {
    flex: 1,
  },
  scrollPad: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 100,
  },
  listContent: {
    paddingBottom: 100,
    paddingTop: Spacing.xs,
  },

  // Watch tab
  videoContainer: {
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statBlock: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#111',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#A1A1AA',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Scout tab
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: Spacing.sm,
  },
  scoutCard: {
    backgroundColor: '#111',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  scoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  scoutPlayTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  scoutTime: {
    fontSize: 12,
    color: '#A1A1AA',
  },
  scoutNote: {
    fontSize: 14,
    lineHeight: 20,
    color: '#aaa',
  },

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 15,
    color: '#A1A1AA',
  },

  // Notes tab
  notesInput: {
    backgroundColor: '#111',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: 15,
    color: '#FFFFFF',
    minHeight: 200,
    lineHeight: 22,
  },
  notesSaved: {
    fontSize: 12,
    color: '#555',
    marginTop: Spacing.xs,
  },

  // Details tab
  detailsCard: {
    backgroundColor: '#111',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#A1A1AA',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
