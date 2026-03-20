/**
 * Social Screen — Feed / Reels with scope filtering.
 *
 * Top bar: Edit dropdown (left) | Feed·Reels pill (center) | Filter icon (right)
 * Scope bar (toggleable): Brand · Mode · All
 * Feed: StoriesRow + PostCard list (footer hides on scroll down)
 * Reels: full-screen (overlaid top bar)
 * FAB: + button → CreatePostSheet / camera
 */

import React, {
  useState, useCallback, useMemo, useRef,
} from 'react';
import {
  View, Text, Pressable, ScrollView, FlatList, TextInput, Image,
  StyleSheet, useWindowDimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { StoriesRow } from '@/components/social/stories-row';
import { ReelsPage } from '@/components/social/reels-page';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useAppContext } from '@/context/app-context';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';
import {
  getFeedPosts, getReels, getStories, formatPostTime,
  type FeedPost, type SocialReel,
} from '@/data/mock-social';
import type { Mode } from '@/types';

// ── Author metadata enrichment ──────────────────────────────────────────────

const AUTHOR_META: Record<string, { role: string; brand: string }> = {
  sa1: { role: 'Head Coach', brand: 'Varsity FC' },
  sa2: { role: 'Forward', brand: 'Varsity FC' },
  sa3: { role: 'Midfielder', brand: 'Varsity FC' },
  sa4: { role: 'Defender', brand: 'Varsity FC' },
  sa5: { role: 'Analyst', brand: 'Varsity FC' },
  sa6: { role: 'Captain', brand: 'Varsity FC' },
  ca1: { role: 'Lead Pastor', brand: 'Grace Church' },
  ca2: { role: 'Worship Leader', brand: 'Grace Church' },
  ca3: { role: 'Tech Director', brand: 'Grace Church' },
  ca4: { role: 'Ministry Lead', brand: 'Grace Church' },
  ca5: { role: 'Volunteer', brand: 'Grace Church' },
  ca6: { role: 'Elder', brand: 'Grace Church' },
  ea1: { role: 'Professor', brand: 'Lincoln Univ.' },
  ea2: { role: 'Student', brand: 'Lincoln Univ.' },
  ea3: { role: 'Dean', brand: 'Lincoln Univ.' },
  ea4: { role: 'Student', brand: 'Lincoln Univ.' },
  ea5: { role: 'Professor', brand: 'Lincoln Univ.' },
  ea6: { role: 'Student Council', brand: 'Lincoln Univ.' },
  ba1: { role: 'CEO', brand: 'NovaTech Inc.' },
  ba2: { role: 'Product Lead', brand: 'NovaTech Inc.' },
  ba3: { role: 'Operations', brand: 'NovaTech Inc.' },
  ba4: { role: 'Marketing', brand: 'NovaTech Inc.' },
  ba5: { role: 'Data Lead', brand: 'NovaTech Inc.' },
  ba6: { role: 'Designer', brand: 'NovaTech Inc.' },
};

// ── Mock comments ────────────────────────────────────────────────────────────

const MOCK_COMMENTS = [
  { id: 'c1', authorName: 'Alex R', authorInitials: 'AR', text: 'This is awesome! 🔥', likeCount: 12, timestamp: new Date(Date.now() - 3600000) },
  { id: 'c2', authorName: 'Maya C', authorInitials: 'MC', text: 'Love seeing this content 🙌', likeCount: 5, timestamp: new Date(Date.now() - 7200000) },
  { id: 'c3', authorName: 'Jordan H', authorInitials: 'JH', text: 'Keep it up! 💪', likeCount: 3, timestamp: new Date(Date.now() - 10800000) },
  { id: 'c4', authorName: 'Riley T', authorInitials: 'RT', text: "That's the moment we've been waiting for 🏆", likeCount: 8, timestamp: new Date(Date.now() - 14400000) },
  { id: 'c5', authorName: 'Sam D', authorInitials: 'SD', text: "Unreal. Can't believe I was there for this!", likeCount: 15, timestamp: new Date(Date.now() - 18000000) },
];

const EMOJI_REACTIONS = ['❤️', '😂', '😮', '😢', '👏'];

type SocialView = 'feed' | 'reels';
type SocialScope = 'brand' | 'mode' | 'all';

const ALL_MODES: Mode[] = ['sports', 'business', 'community', 'education'];

const TOP_BAR_HEIGHT = 52;
const SCOPE_BAR_HEIGHT = 44;

// ── PostCard ─────────────────────────────────────────────────────────────────

interface PostCardProps {
  post: FeedPost;
  isLiked: boolean;
  isBookmarked: boolean;
  showScope: boolean;
  selectMode: boolean;
  isSelected: boolean;
  onLikeToggle: () => void;
  onBookmarkToggle: () => void;
  onCommentPress: () => void;
  onSharePress: () => void;
  onSelectToggle: () => void;
}

function PostCard({
  post, isLiked, isBookmarked, showScope, selectMode, isSelected,
  onLikeToggle, onBookmarkToggle, onCommentPress, onSharePress, onSelectToggle,
}: PostCardProps) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const { width: screenWidth } = useWindowDimensions();
  const lastTapRef = useRef(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);

  const meta = AUTHOR_META[post.author.id];

  const likeCount = isLiked && !post.isLiked
    ? post.likeCount + 1
    : !isLiked && post.isLiked
      ? post.likeCount - 1
      : post.likeCount;

  const postType = post.media.length === 0 ? 'text'
    : post.media.length > 1 ? 'multi-image'
      : post.media[0].type === 'video' ? 'video'
        : 'image';

  const handleMediaTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!isLiked) onLikeToggle();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    lastTapRef.current = now;
  }, [isLiked, onLikeToggle]);

  const firstMediaAspect = post.media[0]?.aspectRatio ?? 1;
  const mediaHeight = screenWidth * firstMediaAspect;

  return (
    <View style={[styles.postContainer, isSelected && { backgroundColor: C.surfacePressed }]}>

      {/* Select overlay */}
      {selectMode && (
        <Pressable style={StyleSheet.absoluteFill} onPress={onSelectToggle}>
          <View style={styles.selectCircleWrap}>
            <View style={[styles.selectCircle, isSelected && styles.selectCircleActive]}>
              {isSelected && <IconSymbol name="checkmark" size={10} color={C.bg} />}
            </View>
          </View>
        </Pressable>
      )}

      {/* Header */}
      <View style={styles.postHeader}>
        <View style={styles.postAvatar}>
          <Text style={styles.postAvatarText}>{post.author.initials}</Text>
        </View>
        <View style={styles.postHeaderText}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <Text style={styles.postAuthorName}>{post.author.name}</Text>
            {showScope && meta && (
              <View style={styles.brandChip}>
                <Text style={styles.brandChipText}>{meta.brand}</Text>
              </View>
            )}
          </View>
          <Text style={styles.postAuthorMeta} numberOfLines={1}>
            {post.author.username}
            {meta ? ` · ${meta.role}` : ''}
            {` · ${formatPostTime(post.timestamp)}`}
          </Text>
        </View>
        <Pressable hitSlop={8} style={{ padding: 4 }}>
          <IconSymbol name="ellipsis" size={18} color={C.secondary} />
        </Pressable>
      </View>

      {/* Text-only caption (above media) */}
      {postType === 'text' && (
        <Text style={styles.textOnlyCaption}>{post.caption}</Text>
      )}

      {/* Single image */}
      {postType === 'image' && (
        <Pressable onPress={handleMediaTap} delayLongPress={400}>
          <Image
            source={{ uri: post.media[0].uri }}
            style={{ width: screenWidth, height: mediaHeight }}
            resizeMode="cover"
          />
        </Pressable>
      )}

      {/* Multi-image carousel */}
      {postType === 'multi-image' && (
        <View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
              setCarouselIndex(idx);
            }}
            scrollEventThrottle={16}
          >
            {post.media.map((m, i) => (
              <Pressable key={i} onPress={handleMediaTap}>
                <Image
                  source={{ uri: m.uri }}
                  style={{ width: screenWidth, height: screenWidth * (m.aspectRatio || 1) }}
                  resizeMode="cover"
                />
              </Pressable>
            ))}
          </ScrollView>
          {/* Dot indicators */}
          <View style={styles.carouselDots}>
            {post.media.map((_, i) => (
              <View key={i} style={[styles.carouselDot, i === carouselIndex && styles.carouselDotActive]} />
            ))}
          </View>
          {/* Slide counter chip */}
          <View style={styles.slideCounter}>
            <Text style={styles.slideCounterText}>{carouselIndex + 1}/{post.media.length}</Text>
          </View>
        </View>
      )}

      {/* Action Row */}
      <View style={styles.actionRow}>
        <View style={styles.actionLeft}>
          {/* Like with emoji picker */}
          <View>
            {showEmojiPicker && (
              <View style={styles.emojiPicker}>
                {EMOJI_REACTIONS.map((emoji) => (
                  <Pressable
                    key={emoji}
                    style={({ pressed }) => [styles.emojiBtn, { opacity: pressed ? 0.7 : 1 }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowEmojiPicker(false);
                      if (!isLiked) onLikeToggle();
                    }}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            <Pressable
              hitSlop={8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onLikeToggle();
                setShowEmojiPicker(false);
              }}
              onLongPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setShowEmojiPicker(v => !v);
              }}
              delayLongPress={400}
            >
              <IconSymbol
                name={isLiked ? 'heart.fill' : 'heart'}
                size={24}
                color={isLiked ? '#FF3B30' : C.label}
              />
            </Pressable>
          </View>

          <Pressable
            hitSlop={8}
            onPress={() => {
              onCommentPress();
              setCommentsExpanded(true);
            }}
          >
            <IconSymbol name="bubble.right" size={24} color={C.label} />
          </Pressable>

          <Pressable hitSlop={8} onPress={onSharePress}>
            <IconSymbol name="paperplane" size={22} color={C.label} />
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
            size={24}
            color={C.label}
          />
        </Pressable>
      </View>

      {/* Likes + Caption + Comments */}
      <View style={styles.captionArea}>
        <Text style={styles.likeCountText}>{likeCount.toLocaleString()} likes</Text>

        {postType !== 'text' && (
          <Text style={styles.captionText} numberOfLines={commentsExpanded ? undefined : 3}>
            <Text style={styles.captionAuthorText}>{post.author.username} </Text>
            {post.caption}
          </Text>
        )}

        {/* Comments toggle */}
        {post.commentCount > 0 && (
          <>
            {!commentsExpanded ? (
              <Pressable onPress={() => setCommentsExpanded(true)}>
                <Text style={styles.viewCommentsText}>
                  View all {post.commentCount} comments
                </Text>
              </Pressable>
            ) : (
              <View style={styles.inlineComments}>
                {MOCK_COMMENTS.slice(0, 3).map(c => (
                  <View key={c.id} style={styles.commentRow}>
                    <Text style={styles.commentText}>
                      <Text style={styles.commentAuthorText}>{c.authorName} </Text>
                      {c.text}
                    </Text>
                  </View>
                ))}
                <View style={styles.commentInputRow}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Add a comment..."
                    placeholderTextColor={C.muted}
                    value={commentInput}
                    onChangeText={setCommentInput}
                    returnKeyType="send"
                    onSubmitEditing={() => setCommentInput('')}
                  />
                  {commentInput.length > 0 && (
                    <Pressable onPress={() => setCommentInput('')}>
                      <Text style={{ color: C.accent, fontWeight: '600', fontSize: 14 }}>Post</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

// ── CommentsSheet ─────────────────────────────────────────────────────────────

function CommentsSheet({
  visible, onClose, C,
}: { visible: boolean; onClose: () => void; C: ComponentColors }) {
  const [input, setInput] = useState('');
  return (
    <BottomSheet visible={visible} onClose={onClose} useModal title="Comments">
      {MOCK_COMMENTS.map(c => (
        <View key={c.id} style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 10 }}>
          <View style={{
            width: 34, height: 34, borderRadius: 17,
            backgroundColor: C.surfacePressed, alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.label }}>{c.authorInitials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, color: C.label, lineHeight: 20 }}>
              <Text style={{ fontWeight: '600' }}>{c.authorName} </Text>
              {c.text}
            </Text>
            <Text style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{formatPostTime(c.timestamp)}</Text>
          </View>
          <View style={{ alignItems: 'center', gap: 2, paddingTop: 2 }}>
            <IconSymbol name="heart" size={14} color={C.muted} />
            <Text style={{ fontSize: 10, color: C.muted }}>{c.likeCount}</Text>
          </View>
        </View>
      ))}
      {/* Comment input */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingHorizontal: 16, paddingVertical: 12,
        borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator,
      }}>
        <TextInput
          style={{ flex: 1, fontSize: 14, color: C.label, paddingVertical: 8 }}
          placeholder="Add a comment..."
          placeholderTextColor={C.muted}
          value={input}
          onChangeText={setInput}
          returnKeyType="send"
          onSubmitEditing={() => setInput('')}
        />
        {input.length > 0 && (
          <Pressable onPress={() => setInput('')}>
            <Text style={{ color: C.accent, fontWeight: '600', fontSize: 14 }}>Post</Text>
          </Pressable>
        )}
      </View>
    </BottomSheet>
  );
}

// ── ShareSheet ────────────────────────────────────────────────────────────────

function ShareSheet({
  visible, onClose, C,
}: { visible: boolean; onClose: () => void; C: ComponentColors }) {
  const options = [
    { icon: 'message.fill' as const, label: 'Send in Chat' },
    { icon: 'person.2.fill' as const, label: 'Share to Room' },
    { icon: 'link' as const, label: 'Copy Link' },
  ];
  return (
    <BottomSheet visible={visible} onClose={onClose} useModal title="Share">
      {options.map(o => (
        <Pressable
          key={o.label}
          onPress={onClose}
          style={({ pressed }) => ({
            flexDirection: 'row', alignItems: 'center', gap: 14,
            paddingVertical: 15, paddingHorizontal: 20,
            backgroundColor: pressed ? C.surfacePressed : 'transparent',
          })}
        >
          <View style={{
            width: 40, height: 40, borderRadius: 12,
            backgroundColor: C.surfacePressed, alignItems: 'center', justifyContent: 'center',
          }}>
            <IconSymbol name={o.icon} size={20} color={C.label} />
          </View>
          <Text style={{ fontSize: 15, color: C.label }}>{o.label}</Text>
        </Pressable>
      ))}
    </BottomSheet>
  );
}

// ── CreatePostSheet ───────────────────────────────────────────────────────────

function CreatePostSheet({
  visible, onClose, C,
}: { visible: boolean; onClose: () => void; C: ComponentColors }) {
  const [text, setText] = useState('');
  const [visibility, setVisibility] = useState<SocialScope>('brand');

  const VISIBILITY_OPTIONS: { key: SocialScope; label: string }[] = [
    { key: 'brand', label: 'Brand' },
    { key: 'mode', label: 'Mode' },
    { key: 'all', label: 'Everyone' },
  ];

  const ATTACH_OPTIONS = [
    { icon: 'photo' as const, label: 'Photo' },
    { icon: 'video' as const, label: 'Video' },
    { icon: 'link' as const, label: 'Link' },
    { icon: 'tag' as const, label: 'Tag' },
  ];

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal title="New Post">
      <View style={{ padding: 16, paddingBottom: 32 }}>
        <TextInput
          style={{ fontSize: 15, color: C.label, minHeight: 100, textAlignVertical: 'top', lineHeight: 22 }}
          placeholder="What's on your mind? Use @ to mention someone..."
          placeholderTextColor={C.muted}
          multiline
          value={text}
          onChangeText={setText}
          autoFocus
        />
        <Text style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
          Tip: @mention opens Nexus context in this post
        </Text>

        {/* Attach row */}
        <View style={{ flexDirection: 'row', gap: 14, marginTop: 20 }}>
          {ATTACH_OPTIONS.map(a => (
            <Pressable
              key={a.icon}
              style={({ pressed }) => ({ alignItems: 'center', gap: 5, opacity: pressed ? 0.6 : 1 })}
            >
              <View style={{
                width: 44, height: 44, borderRadius: 12,
                backgroundColor: C.surfacePressed, alignItems: 'center', justifyContent: 'center',
              }}>
                <IconSymbol name={a.icon} size={20} color={C.secondary} />
              </View>
              <Text style={{ fontSize: 11, color: C.muted }}>{a.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Visibility */}
        <View style={{ marginTop: 22 }}>
          <Text style={{ fontSize: 12, color: C.secondary, marginBottom: 10 }}>Visible to</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {VISIBILITY_OPTIONS.map(v => {
              const active = v.key === visibility;
              return (
                <Pressable
                  key={v.key}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 7,
                    borderRadius: 12, borderWidth: 1.5,
                    borderColor: active ? C.accent : C.separator,
                    backgroundColor: active ? C.accent + '18' : 'transparent',
                  }}
                  onPress={() => setVisibility(v.key)}
                >
                  <Text style={{ fontSize: 13, fontWeight: active ? '600' : '400', color: active ? C.accent : C.secondary }}>
                    {v.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Post button */}
        <Pressable
          style={({ pressed }) => ({
            marginTop: 24, backgroundColor: C.accent, borderRadius: 14,
            paddingVertical: 13, alignItems: 'center', opacity: pressed ? 0.8 : 1,
          })}
          onPress={() => { if (text.trim()) { setText(''); onClose(); } }}
        >
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>Post</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// ── Social Screen (main) ──────────────────────────────────────────────────────

export default function SocialScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(C), [C]);
  const { state } = useAppContext();
  const mode = state.activeContext.mode;

  const [view, setView] = useState<SocialView>('feed');
  const [feedScope, setFeedScope] = useState<SocialScope>('brand');
  const [reelsScope, setReelsScope] = useState<SocialScope>('all');
  const [showScopeBar, setShowScopeBar] = useState(false);
  const [showEditDD, setShowEditDD] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set());

  // Like/bookmark — tracks XOR flips from initial post.isLiked / post.isBookmarked
  const [likedPostFlips, setLikedPostFlips] = useState<Set<string>>(new Set());
  const [bookmarkedPostFlips, setBookmarkedPostFlips] = useState<Set<string>>(new Set());
  const [likedReels, setLikedReels] = useState<Set<string>>(new Set());
  const [bookmarkedReels, setBookmarkedReels] = useState<Set<string>>(new Set());

  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [shareVisible, setShareVisible] = useState(false);
  const [commentReelId, setCommentReelId] = useState<string | null>(null);
  const [createPostVisible, setCreatePostVisible] = useState(false);

  const lastScrollY = useRef(0);

  const scope = view === 'feed' ? feedScope : reelsScope;
  const setScope = view === 'feed' ? setFeedScope : setReelsScope;

  const feedPosts = useMemo(() => {
    if (scope === 'brand' || scope === 'mode') return getFeedPosts(mode);
    return ALL_MODES.flatMap(m => getFeedPosts(m));
  }, [scope, mode]);

  const reels = useMemo(() => {
    if (scope === 'brand' || scope === 'mode') return getReels(mode);
    return ALL_MODES.flatMap(m => getReels(m));
  }, [scope, mode]);

  const stories = useMemo(() => getStories(mode), [mode]);

  const handleFeedScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  const handleSwitchView = useCallback((newView: SocialView) => {
    setView(newView);
    setShowScopeBar(false);
    setShowEditDD(false);
    setSelectMode(false);
  }, []);

  const handleLikeToggle = useCallback((postId: string) => {
    setLikedPostFlips(prev => {
      const s = new Set(prev);
      if (s.has(postId)) s.delete(postId); else s.add(postId);
      return s;
    });
  }, []);

  const handleBookmarkToggle = useCallback((postId: string) => {
    setBookmarkedPostFlips(prev => {
      const s = new Set(prev);
      if (s.has(postId)) s.delete(postId); else s.add(postId);
      return s;
    });
  }, []);

  const handleReelLikeToggle = useCallback((id: string) => {
    setLikedReels(prev => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });
  }, []);

  const handleReelBookmarkToggle = useCallback((id: string) => {
    setBookmarkedReels(prev => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });
  }, []);

  const handleSelectToggle = useCallback((postId: string) => {
    setSelectedPostIds(prev => {
      const s = new Set(prev);
      if (s.has(postId)) s.delete(postId); else s.add(postId);
      return s;
    });
  }, []);

  const isPostLiked = (post: FeedPost) =>
    post.isLiked !== likedPostFlips.has(post.id);

  const isPostBookmarked = (post: FeedPost) =>
    post.isBookmarked !== bookmarkedPostFlips.has(post.id);

  // ── Render ──

  return (
    <View style={[styles.screen, { backgroundColor: view === 'reels' ? '#000' : C.bg }]}>

      {/* Full-screen Reels layer (behind top bar) */}
      {view === 'reels' && (
        <View style={StyleSheet.absoluteFill}>
          <ReelsPage
            reels={reels}
            likedReels={likedReels}
            bookmarkedReels={bookmarkedReels}
            onLikeToggle={handleReelLikeToggle}
            onBookmarkToggle={handleReelBookmarkToggle}
            onCommentPress={(reel) => setCommentReelId(reel.id)}
            onSharePress={() => setShareVisible(true)}
          />
        </View>
      )}

      {/* Top bar — always visible, overlaid on reels */}
      <View style={[
        styles.topBarWrap,
        { paddingTop: insets.top },
        view === 'reels' && styles.topBarWrapOverlay,
      ]}>
        <View style={styles.topBar}>
          {/* Left: Edit / Cancel */}
          <View style={{ position: 'relative' }}>
            {selectMode ? (
              <Pressable
                style={styles.topBarSide}
                onPress={() => { setSelectMode(false); setSelectedPostIds(new Set()); }}
              >
                <Text style={[styles.topBarBtn, { color: C.secondary }]}>Cancel</Text>
              </Pressable>
            ) : (
              <Pressable
                style={styles.topBarSide}
                onPress={() => { setShowEditDD(v => !v); setShowScopeBar(false); }}
              >
                <Text style={[styles.topBarBtn, view === 'reels' && { color: '#fff' }]}>Edit</Text>
              </Pressable>
            )}

            {/* Edit dropdown */}
            {showEditDD && (
              <View style={styles.editDD}>
                <Pressable
                  style={({ pressed }) => [styles.ddItem, pressed && { backgroundColor: C.surfacePressed }]}
                  onPress={() => { setShowEditDD(false); setSelectMode(true); setSelectedPostIds(new Set()); }}
                >
                  <IconSymbol name="checkmark.circle" size={16} color={C.label} />
                  <Text style={styles.ddText}>Select Posts</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.ddItem, { borderBottomWidth: 0 }, pressed && { backgroundColor: C.surfacePressed }]}
                  onPress={() => setShowEditDD(false)}
                >
                  <IconSymbol name="tag" size={16} color={C.label} />
                  <Text style={styles.ddText}>Manage Tags</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Center: Feed·Reels pill or X Selected */}
          {selectMode ? (
            <View style={styles.viewPill}>
              <Text style={styles.viewPillText}>{selectedPostIds.size} Selected</Text>
            </View>
          ) : (
            <View style={styles.viewPill}>
              <View style={styles.viewPillInner}>
                <Pressable
                  style={[styles.pillOption, view === 'feed' && styles.pillOptionActive]}
                  onPress={() => handleSwitchView('feed')}
                >
                  <Text style={[styles.pillOptionText, view === 'feed' && styles.pillOptionTextActive]}>Feed</Text>
                </Pressable>
                <Pressable
                  style={[styles.pillOption, view === 'reels' && styles.pillOptionActive]}
                  onPress={() => handleSwitchView('reels')}
                >
                  <Text style={[styles.pillOptionText, view === 'reels' && styles.pillOptionTextActive]}>Reels</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Right: Filter icon */}
          <Pressable
            style={[styles.topBarSide, { alignItems: 'flex-end' }]}
            onPress={() => { setShowScopeBar(v => !v); setShowEditDD(false); }}
          >
            <IconSymbol
              name="line.3.horizontal.decrease"
              size={20}
              color={showScopeBar ? C.accent : view === 'reels' ? '#fff' : C.label}
            />
          </Pressable>
        </View>

        {/* Scope pills */}
        {showScopeBar && (
          <View style={[styles.scopeBar, view === 'reels' && { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
            {(['brand', 'mode', 'all'] as SocialScope[]).map(s => {
              const active = s === scope;
              return (
                <Pressable
                  key={s}
                  style={[styles.scopePill, active && styles.scopePillActive]}
                  onPress={() => setScope(s)}
                >
                  <Text style={[styles.scopePillText, active && styles.scopePillTextActive]}>
                    {s === 'brand' ? 'Brand' : s === 'mode' ? 'Mode' : 'All'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      {/* Feed content */}
      {view === 'feed' && (
        <FlatList
          data={feedPosts}
          keyExtractor={item => item.id}
          onScroll={handleFeedScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListHeaderComponent={
            <StoriesRow stories={stories} onStoryPress={() => {}} />
          }
          renderItem={({ item }) => (
            <PostCard
              post={item}
              isLiked={isPostLiked(item)}
              isBookmarked={isPostBookmarked(item)}
              showScope={scope !== 'brand'}
              selectMode={selectMode}
              isSelected={selectedPostIds.has(item.id)}
              onLikeToggle={() => handleLikeToggle(item.id)}
              onBookmarkToggle={() => handleBookmarkToggle(item.id)}
              onCommentPress={() => setCommentPostId(item.id)}
              onSharePress={() => setShareVisible(true)}
              onSelectToggle={() => handleSelectToggle(item.id)}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.postSeparator} />}
        />
      )}

      {/* FAB — create post (feed) or camera (reels) */}
      {!selectMode && (
        <Pressable
          style={[styles.fab, { bottom: insets.bottom + 74 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            if (view === 'feed') {
              setCreatePostVisible(true);
            }
            // reels → camera (mock no-op for now)
          }}
        >
          <IconSymbol name="plus" size={22} color="#fff" />
        </Pressable>
      )}

      {/* Sheets */}
      <CommentsSheet
        visible={commentPostId != null || commentReelId != null}
        onClose={() => { setCommentPostId(null); setCommentReelId(null); }}
        C={C}
      />
      <ShareSheet visible={shareVisible} onClose={() => setShareVisible(false)} C={C} />
      <CreatePostSheet visible={createPostVisible} onClose={() => setCreatePostVisible(false)} C={C} />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen: {
    flex: 1,
  },

  // Top bar
  topBarWrap: {
    zIndex: 20,
  },
  topBarWrapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  topBar: {
    height: TOP_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 0,
  },
  topBarSide: {
    width: 60,
    justifyContent: 'center',
  },
  topBarBtn: {
    fontSize: 15,
    fontWeight: '500',
    color: C.label,
  },
  viewPill: {
    flex: 1,
    alignItems: 'center',
  },
  viewPillInner: {
    flexDirection: 'row',
    backgroundColor: C.surfacePressed,
    borderRadius: 20,
    padding: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.separator,
  },
  pillOption: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pillOptionActive: {
    backgroundColor: C.label,
  },
  pillOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: C.secondary,
  },
  pillOptionTextActive: {
    color: C.bg,
    fontWeight: '600',
  },
  viewPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.label,
  },

  // Scope bar
  scopeBar: {
    height: SCOPE_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  scopePill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.separator,
  },
  scopePillActive: {
    backgroundColor: C.label,
    borderColor: C.label,
  },
  scopePillText: {
    fontSize: 13,
    fontWeight: '500',
    color: C.secondary,
  },
  scopePillTextActive: {
    color: C.bg,
    fontWeight: '600',
  },

  // Edit dropdown
  editDD: {
    position: 'absolute',
    top: 44,
    left: 0,
    zIndex: 100,
    backgroundColor: C.bg,
    borderRadius: 14,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.separator,
  },
  ddItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.separator,
  },
  ddText: {
    fontSize: 14,
    fontWeight: '500',
    color: C.label,
  },

  // Feed separator
  postSeparator: {
    height: 8,
    backgroundColor: C.surface,
  },

  // PostCard
  postContainer: {
    backgroundColor: C.bg,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  postAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.surfacePressed,
    borderWidth: 1,
    borderColor: C.separator,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  postAvatarText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.label,
  },
  postHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  postAuthorName: {
    fontSize: 14,
    fontWeight: '600',
    color: C.label,
  },
  postAuthorMeta: {
    fontSize: 12,
    color: C.secondary,
    marginTop: 1,
  },
  brandChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: C.surfacePressed,
    borderWidth: 1,
    borderColor: C.separator,
  },
  brandChipText: {
    fontSize: 11,
    fontWeight: '500',
    color: C.secondary,
  },

  // Text-only
  textOnlyCaption: {
    fontSize: 16,
    lineHeight: 24,
    color: C.label,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },

  // Carousel
  carouselDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
  },
  carouselDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.muted,
  },
  carouselDotActive: {
    backgroundColor: C.accent,
    width: 18,
  },
  slideCounter: {
    position: 'absolute',
    top: 10,
    right: 14,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  slideCounterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },

  // Actions
  actionRow: {
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
  emojiPicker: {
    position: 'absolute',
    bottom: 36,
    left: -8,
    flexDirection: 'row',
    backgroundColor: C.bg,
    borderRadius: 24,
    paddingHorizontal: 6,
    paddingVertical: 6,
    gap: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.separator,
    zIndex: 10,
  },
  emojiBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 22,
  },

  // Caption area
  captionArea: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    gap: 4,
  },
  likeCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.label,
  },
  captionText: {
    fontSize: 14,
    color: C.label,
    lineHeight: 20,
  },
  captionAuthorText: {
    fontWeight: '600',
  },
  viewCommentsText: {
    fontSize: 14,
    color: C.secondary,
    marginTop: 2,
  },

  // Inline comments
  inlineComments: {
    marginTop: 4,
    gap: 4,
  },
  commentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  commentText: {
    fontSize: 14,
    color: C.label,
    lineHeight: 20,
  },
  commentAuthorText: {
    fontWeight: '600',
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingVertical: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.separator,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    color: C.label,
    paddingVertical: 4,
  },

  // Select overlay
  selectCircleWrap: {
    position: 'absolute',
    top: 10,
    right: 14,
    zIndex: 5,
  },
  selectCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: C.separator,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectCircleActive: {
    backgroundColor: C.accent,
    borderColor: C.accent,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 15,
  },
});
