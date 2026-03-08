/**
 * LibrarySection — Library page section for Media screen.
 * Shows a section header and horizontal scroll of content.
 * Types: history, saved, downloads, uploads → small video cards.
 * Type: playlists → 2x2 color grid covers.
 */

import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { formatViewCount } from '@/data/mock-media';
import type { BrowseVideo, PlaylistItem } from '@/data/mock-media';
import type { WatchHistoryItem } from '@/data/mock-video';
import { formatDuration } from '@/data/mock-video';

type SectionType = 'history' | 'saved' | 'playlists' | 'downloads' | 'uploads';

interface LibrarySectionProps {
  icon: string;
  label: string;
  type: SectionType;
  videos?: BrowseVideo[];
  historyItems?: WatchHistoryItem[];
  playlists?: PlaylistItem[];
}

/** Small video card for history/saved/downloads/uploads */
function SmallVideoCard({ title, thumbnailColor, duration, creator, meta }: {
  title: string;
  thumbnailColor: string;
  duration: number;
  creator: string;
  meta?: string;
}) {
  return (
    <Pressable style={styles.smallCard}>
      <View style={[styles.smallThumb, { backgroundColor: thumbnailColor }]}>
        <View style={styles.smallPlayOverlay}>
          <IconSymbol name="play.fill" size={14} color="#FFFFFF" />
        </View>
        <View style={styles.smallDurationBadge}>
          <Text style={styles.smallDurationText}>{formatDuration(duration)}</Text>
        </View>
      </View>
      <Text style={styles.smallTitle} numberOfLines={2}>{title}</Text>
      <Text style={styles.smallCreator} numberOfLines={1}>{creator}</Text>
      {meta ? <Text style={styles.smallMeta} numberOfLines={1}>{meta}</Text> : null}
    </Pressable>
  );
}

/** Playlist cover: 2x2 color grid */
function PlaylistCover({ playlist }: { playlist: PlaylistItem }) {
  const colors = playlist.thumbnailColors;
  return (
    <Pressable style={styles.playlistCard}>
      <View style={styles.playlistGrid}>
        {colors.map((c, i) => (
          <View key={i} style={[styles.playlistSwatch, { backgroundColor: c }]} />
        ))}
      </View>
      <Text style={styles.playlistName} numberOfLines={1}>{playlist.name}</Text>
      <Text style={styles.playlistCount}>{playlist.videoCount} videos</Text>
    </Pressable>
  );
}

export function LibrarySection({ icon, label, type, videos, historyItems, playlists }: LibrarySectionProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <IconSymbol name={icon as any} size={18} color="#A1A1AA" />
          <Text style={styles.label}>{label}</Text>
        </View>
        <Pressable hitSlop={8}>
          <Text style={styles.seeAll}>See All</Text>
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {type === 'playlists' && playlists?.map((pl) => (
          <PlaylistCover key={pl.id} playlist={pl} />
        ))}

        {type === 'history' && historyItems?.map((item) => (
          <SmallVideoCard
            key={item.id}
            title={item.title}
            thumbnailColor={item.thumbnailColor}
            duration={item.duration}
            creator={item.contentType}
            meta={`${item.progress}% watched`}
          />
        ))}

        {(type === 'saved' || type === 'downloads' || type === 'uploads') && videos?.map((v) => (
          <SmallVideoCard
            key={v.id}
            title={v.title}
            thumbnailColor={v.thumbnailColor}
            duration={v.duration}
            creator={v.creator}
            meta={formatViewCount(v.viewCount)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  seeAll: {
    color: '#A1A1AA',
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  // Small video card
  smallCard: {
    width: 120,
  },
  smallThumb: {
    width: 120,
    height: 68, // ~16:9
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  smallPlayOverlay: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallDurationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  smallDurationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  smallTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 15,
  },
  smallCreator: {
    color: '#A1A1AA',
    fontSize: 11,
    marginTop: 1,
  },
  smallMeta: {
    color: '#A1A1AA',
    fontSize: 11,
  },
  // Playlist cover
  playlistCard: {
    width: 120,
  },
  playlistGrid: {
    width: 120,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  playlistSwatch: {
    width: 60,
    height: 60,
  },
  playlistName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  playlistCount: {
    color: '#A1A1AA',
    fontSize: 11,
  },
});
