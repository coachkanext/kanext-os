/**
 * Lists Screen — Curated communication channels with filtered feed content.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { ListChannelRow } from '@/components/messages/list-channel-row';
import { FeedCard } from '@/components/messages/feed-card';
import { Spacing } from '@/constants/theme';
import {
  MOCK_FEED,
  COMMS_LIST_CHANNELS,
} from '@/data/mock-messages';
import type { CommsListChannel, FeedPost } from '@/data/mock-messages';

export default function ListsScreen() {
  const [selectedChannel, setSelectedChannel] = useState<CommsListChannel | null>(null);

  const channelPosts = useMemo(() => {
    if (!selectedChannel) return [];
    let posts = MOCK_FEED;

    if (selectedChannel.filterScope && selectedChannel.filterScope !== 'all') {
      const scopeToFilter: Record<string, string[]> = {
        my_team: ['team'],
        staff: ['staff'],
        players: ['players'],
        parents: ['parents'],
        recruiting: ['recruiting'],
        league: ['team', 'system'],
      };
      const allowed = scopeToFilter[selectedChannel.filterScope];
      if (allowed) {
        posts = posts.filter((p) => allowed.includes(p.filter));
      }
    }

    if (selectedChannel.filterType) {
      posts = posts.filter((p) => p.filter === selectedChannel.filterType);
    }

    return posts;
  }, [selectedChannel]);

  const renderChannel = useCallback(
    ({ item }: { item: CommsListChannel }) => (
      <ListChannelRow
        icon={item.icon as any}
        title={item.title}
        description={item.description}
        onPress={() => setSelectedChannel(item)}
      />
    ),
    [],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={COMMS_LIST_CHANNELS}
        keyExtractor={(item) => item.id}
        renderItem={renderChannel}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Channel Detail Sheet */}
      <BottomSheet
        visible={selectedChannel !== null}
        onClose={() => setSelectedChannel(null)}
        title={selectedChannel?.title}
        useModal
      >
        {selectedChannel && (
          <View>
            {channelPosts.length === 0 ? (
              <View style={styles.emptyState}>
                <ThemedText style={styles.emptyText}>No posts in this channel</ThemedText>
              </View>
            ) : (
              channelPosts.map((post) => (
                <FeedCard key={post.id} post={post} />
              ))
            )}
          </View>
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  listContent: {
    paddingBottom: 100,
    paddingTop: Spacing.xs,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
  },
});
