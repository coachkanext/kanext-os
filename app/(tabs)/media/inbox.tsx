/**
 * Video Inbox Screen — Quick share targets, shared media threads, recent threads.
 */

import React from 'react';
import {
  View,
  ScrollView,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { VideoHeader } from '@/components/media/video-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing } from '@/constants/theme'
import { useAccentColor } from '@/hooks/use-accent-color';
import {
  QUICK_SHARE_TARGETS,
  VIDEO_INBOX_THREADS,
} from '@/data/mock-video-inbox';
import type { QuickShareTarget, VideoInboxThread } from '@/data/mock-video-inbox';
import { formatMessageTime } from '@/data/mock-messages';

function AvatarCircle({ initials }: { initials: string }) {
  return (
    <View style={styles.avatar}>
      <ThemedText style={styles.avatarText}>{initials}</ThemedText>
    </View>
  );
}

function QuickShareRow() {
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Quick Share</ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.shareScroll}
      >
        {QUICK_SHARE_TARGETS.map((target: QuickShareTarget) => (
          <Pressable
            key={target.id}
            style={styles.shareTarget}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <AvatarCircle initials={target.initials} />
            <ThemedText style={styles.shareName} numberOfLines={1}>
              {target.name.split(' ')[0]}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function MediaBadge({ type }: { type: string }) {
  const label = type === 'clip' ? 'Clip' : type === 'game' ? 'Game' : 'Reel';
  return (
    <View style={styles.mediaBadge}>
      <IconSymbol name="play.fill" size={10} color="#FFFFFF" />
      <ThemedText style={styles.mediaBadgeText}>{label}</ThemedText>
    </View>
  );
}

function ThreadRow({ thread }: { thread: VideoInboxThread }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.threadRow, { opacity: pressed ? 0.7 : 1 }]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <AvatarCircle initials={thread.avatarInitials} />
      <View style={styles.threadContent}>
        <View style={styles.threadHeader}>
          <ThemedText
            style={[styles.threadTitle, thread.unread > 0 && styles.threadTitleUnread]}
          >
            {thread.title}
          </ThemedText>
          <ThemedText style={styles.threadTime}>
            {formatMessageTime(thread.timestamp)}
          </ThemedText>
        </View>
        <View style={styles.threadBody}>
          <ThemedText
            style={[styles.threadMessage, thread.unread > 0 && styles.threadMessageUnread]}
            numberOfLines={1}
          >
            {thread.lastMessage}
          </ThemedText>
          {thread.mediaAttachment && <MediaBadge type={thread.mediaAttachment.type} />}
        </View>
      </View>
      {thread.unread > 0 && (
        <View style={styles.unreadDot} />
      )}
    </Pressable>
  );
}

export default function InboxScreen() {
  const accent = useAccentColor();
  return (
    <View style={styles.container}>
      <VideoHeader title="Inbox" />
      <FlatList
        data={VIDEO_INBOX_THREADS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ThreadRow thread={item} />}
        ListHeaderComponent={
          <>
            <QuickShareRow />
            <ThemedText style={[styles.sectionTitle, { paddingHorizontal: Spacing.lg }]}>
              Messages
            </ThemedText>
          </>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A1A1AA',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  shareScroll: {
    paddingHorizontal: Spacing.lg,
    gap: 16,
  },
  shareTarget: {
    alignItems: 'center',
    width: 60,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0B0F14',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2F3336',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shareName: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  threadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    gap: 12,
  },
  threadContent: {
    flex: 1,
  },
  threadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  threadTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ccc',
  },
  threadTitleUnread: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  threadTime: {
    fontSize: 12,
    color: '#555',
  },
  threadBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  threadMessage: {
    fontSize: 13,
    color: '#555',
    flex: 1,
  },
  threadMessageUnread: {
    color: '#999',
  },
  mediaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#0B0F14',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mediaBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: accent,
  },
  listContent: {
    paddingBottom: 100,
  },
});
