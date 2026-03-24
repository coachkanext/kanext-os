/**
 * Grid Feed — full-page feed starting at a tapped profile-grid post.
 * Shows Sammy's posts from the tapped one downward (older below).
 * Back: rounded-circle button top-left.
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View, Text, Image, Pressable, FlatList,
  StyleSheet, useWindowDimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { LikeAnimation } from '@/components/social/like-animation';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import {
  getSammyPosts, getSammyTaggedPosts, formatPostTime, type FeedPost,
} from '@/data/mock-social';

// ── Mock comments ─────────────────────────────────────────────────────────────

const MOCK_COMMENTS = [
  { id: 'c1', name: 'Alex R',    initials: 'AR', text: 'This is awesome! 🔥',                     likes: 12 },
  { id: 'c2', name: 'Maya C',    initials: 'MC', text: 'Love seeing this content 🙌',             likes: 5  },
  { id: 'c3', name: 'Jordan H',  initials: 'JH', text: 'Keep it up! 💪',                          likes: 3  },
  { id: 'c4', name: 'Riley T',   initials: 'RT', text: "That\'s the moment we\'ve been waiting for 🏆", likes: 8  },
  { id: 'c5', name: 'Sam D',     initials: 'SD', text: "Unreal. Can\'t believe I was there!",     likes: 15 },
];

// ── PostCard ──────────────────────────────────────────────────────────────────

const LIKED_NAMES = ['Alex R', 'Maya C', 'Jordan H', 'Riley T', 'Sam D'];

function PostCard({
  post,
  isLiked,
  isBookmarked,
  onLikeToggle,
  onBookmarkToggle,
  C,
}: {
  post: FeedPost;
  isLiked: boolean;
  isBookmarked: boolean;
  onLikeToggle: () => void;
  onBookmarkToggle: () => void;
  C: ComponentColors;
}) {
  const { width } = useWindowDimensions();
  const lastTapRef = useRef(0);
  const [showLikeAnim, setShowLikeAnim] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [following, setFollowing] = useState(false);

  const nameA = LIKED_NAMES[post.likeCount % 5];

  const likeCount = isLiked && !post.isLiked
    ? post.likeCount + 1
    : !isLiked && post.isLiked ? post.likeCount - 1 : post.likeCount;

  const imgH = post.media[0] ? width * post.media[0].aspectRatio : 0;

  const handleImageTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!isLiked) onLikeToggle();
      setShowLikeAnim(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    lastTapRef.current = now;
  }, [isLiked, onLikeToggle]);

  return (
    <View style={[styles.card, { borderBottomColor: C.separator }]}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, { backgroundColor: C.accent }]}>
          <Text style={styles.avatarText}>{post.author.initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.authorName, { color: C.label }]}>{post.author.name}</Text>
          <Text style={[styles.authorMeta, { color: C.secondary }]}>
            {post.author.username} · {formatPostTime(post.timestamp)}
          </Text>
        </View>
        <Pressable
          hitSlop={8}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFollowing(v => !v); }}
        >
          <Text style={{ color: following ? C.secondary : C.accent, fontWeight: '600', fontSize: 13 }}>
            {following ? 'Following' : 'Follow'}
          </Text>
        </Pressable>
        <Pressable hitSlop={8} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
          <IconSymbol name="ellipsis" size={18} color={C.secondary} />
        </Pressable>
      </View>

      {/* Image */}
      {post.media[0] ? (
        <View>
          <Pressable onPress={handleImageTap}>
            <Image
              source={{ uri: post.media[0].uri }}
              style={{ width, height: imgH }}
              resizeMode="cover"
            />
          </Pressable>
          <LikeAnimation visible={showLikeAnim} onComplete={() => setShowLikeAnim(false)} />
        </View>
      ) : null}

      {/* Actions */}
      <View style={styles.actionBar}>
        <View style={styles.actionLeft}>
          <Pressable
            hitSlop={8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onLikeToggle();
            }}
          >
            <IconSymbol
              name={isLiked ? 'heart.fill' : 'heart'}
              size={26}
              color={isLiked ? '#FF3B30' : C.label}
            />
          </Pressable>
          <Pressable
            hitSlop={8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setCommentsOpen(v => !v);
            }}
          >
            <IconSymbol name="bubble.right" size={26} color={C.label} />
          </Pressable>
          <Pressable hitSlop={8} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <IconSymbol name="paperplane" size={24} color={C.label} />
          </Pressable>
        </View>
        <Pressable
          hitSlop={8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onBookmarkToggle();
          }}
        >
          <IconSymbol
            name={isBookmarked ? 'bookmark.fill' : 'bookmark'}
            size={26}
            color={C.label}
          />
        </Pressable>
      </View>

      {/* Caption + comments */}
      <View style={styles.captionArea}>
        <Text style={[styles.likeCount, { color: C.label }]}>
          {'Liked by '}
          <Text style={{ fontWeight: '700', color: C.label }}>{nameA}</Text>
          {' and '}
          <Text style={{ fontWeight: '700', color: C.label }}>{(likeCount - 1).toLocaleString()} others</Text>
        </Text>
        <Text style={[styles.caption, { color: C.label }]} numberOfLines={captionExpanded ? undefined : 3}>
          <Text style={styles.captionHandle}>{post.author.username} </Text>
          {post.caption}
        </Text>
        {!captionExpanded && post.caption.length > 120 ? (
          <Pressable onPress={() => setCaptionExpanded(true)}>
            <Text style={[styles.viewComments, { color: C.secondary }]}>more</Text>
          </Pressable>
        ) : null}

        {post.commentCount > 0 ? (
          <View style={styles.inlineComments}>
            {MOCK_COMMENTS.slice(0, 2).map(c => (
              <View key={c.id} style={styles.commentRow}>
                <Text style={[styles.commentText, { color: C.label }]} numberOfLines={2}>
                  <Text style={styles.commentName}>{c.name} </Text>
                  {c.text}
                </Text>
              </View>
            ))}
            {post.commentCount > 2 ? (
              <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                <Text style={[styles.viewComments, { color: C.secondary }]}>
                  View all {post.commentCount} comments
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function GridFeedScreen() {
  const { startPostId, type } = useLocalSearchParams<{ startPostId: string; type?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const C = useColors();

  const isTagged = type === 'tagged';
  const allPosts = useMemo(
    () => isTagged ? getSammyTaggedPosts() : getSammyPosts(),
    [isTagged],
  );

  // Start from the tapped post; show it + everything older below
  const startIdx = allPosts.findIndex(p => p.id === startPostId);
  const posts = startIdx >= 0 ? allPosts.slice(startIdx) : allPosts;

  const [likedPosts, setLikedPosts] = useState<Set<string>>(
    () => new Set(allPosts.filter(p => p.isLiked).map(p => p.id))
  );
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(
    () => new Set(allPosts.filter(p => p.isBookmarked).map(p => p.id))
  );

  const toggleLike = useCallback((id: string) => {
    setLikedPosts(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }, []);

  const toggleBookmark = useCallback((id: string) => {
    setBookmarkedPosts(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }, []);

  return (
    <View style={[styles.screen, { backgroundColor: C.bg }]}>
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 56, paddingBottom: 120 }}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            isLiked={likedPosts.has(item.id)}
            isBookmarked={bookmarkedPosts.has(item.id)}
            onLikeToggle={() => toggleLike(item.id)}
            onBookmarkToggle={() => toggleBookmark(item.id)}
            C={C}
          />
        )}
      />

      {/* Floating back button */}
      <Pressable
        style={[styles.backBtn, { top: insets.top + 10, backgroundColor: C.bg }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.back();
        }}
        hitSlop={8}
      >
        <IconSymbol name="chevron.left" size={18} color={C.label} />
      </Pressable>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  // Back button
  backBtn: {
    position: 'absolute',
    left: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },

  // Post card
  card: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  authorMeta: {
    fontSize: 12,
    marginTop: 1,
  },

  // Actions
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  // Caption
  captionArea: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 4,
  },
  likeCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
  captionHandle: {
    fontWeight: '600',
  },
  viewComments: {
    fontSize: 13,
    marginTop: 2,
  },

  // Inline comments
  inlineComments: {
    marginTop: 6,
    gap: 8,
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  commentAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  commentAvatarText: {
    fontSize: 9,
    fontWeight: '600',
  },
  commentText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  commentName: {
    fontWeight: '600',
  },
  addCommentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  commentInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 4,
  },
  postBtn: {
    fontSize: 13,
    fontWeight: '600',
  },
});
