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
  StyleSheet, useWindowDimensions, PanResponder,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { StoriesRow } from '@/components/social/stories-row';
import { ReelsPage } from '@/components/social/reels-page';
import { LikeAnimation } from '@/components/social/like-animation';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useAppContext } from '@/context/app-context';
import { hideFooter, showFooter, resetFooter } from '@/utils/global-footer-hide';
import {
  getFeedPosts, getReels, getStories, getSammyPosts, getSammyTaggedPosts, formatPostTime,
  SAMMY_POSTS, SAMMY_REELS, type FeedPost, type SocialReel,
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

type SocialView = 'feed' | 'reels' | 'profile';
type SocialScope = 'brand' | 'mode' | 'all';
type ProfileGridTab = 'posts' | 'reels' | 'tagged';

const ALL_MODES: Mode[] = ['sports', 'business', 'community', 'education'];
const VIEW_ORDER: SocialView[] = ['feed', 'reels', 'profile'];

// ── Profile mock data per mode ────────────────────────────────────────────────

interface MockProfile {
  name: string;
  handle: string;
  role: string;
  brand: string;
  bio: string;
  postCount: number;
  followerCount: number;
  followingCount: number;
  initials: string;
}

const MY_PROFILE: MockProfile = {
  name: 'Sammy Kalejaiye',
  handle: '@sammyk',
  role: 'Owner',
  brand: 'KaNeXT',
  bio: "Building the operating system for communities. Let's get to work.",
  postCount: 47,
  followerCount: 312,
  followingCount: 89,
  initials: 'SK',
};

// ── RBAC ──────────────────────────────────────────────────────────────────────
// Logged-in user is Sammy Kalejaiye (@sammyk) — not present in mock feed authors.
// isOwnPost is always false for mock content; admin = brand owner in any work mode.
const MY_SOCIAL_AUTHOR_ID = 'sammyk'; // no mock post uses this ID

function authorStats(id: string) {
  const seed = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return {
    postCount:      ((seed * 7)  % 140) + 8,
    followerCount:  ((seed * 13) % 2800) + 50,
    followingCount: ((seed * 11) % 380) + 30,
  };
}

function fmtStat(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
}

const TOP_BAR_HEIGHT = 52;
const SCOPE_BAR_HEIGHT = 44;

// ── PostCard ─────────────────────────────────────────────────────────────────

const LIKED_NAMES = ['Alex R', 'Maya C', 'Jordan H', 'Riley T', 'Sam D'];

interface PostCardProps {
  post: FeedPost;
  isLiked: boolean;
  isBookmarked: boolean;
  showScope: boolean;
  onLikeToggle: () => void;
  onBookmarkToggle: () => void;
  onCommentPress: () => void;
  onSharePress: () => void;
  onAuthorPress: () => void;
  onBrandPress: () => void;
  onMenuPress: () => void;
}

function PostCard({
  post, isLiked, isBookmarked, showScope,
  onLikeToggle, onBookmarkToggle, onCommentPress, onSharePress,
  onAuthorPress, onBrandPress, onMenuPress,
}: PostCardProps) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const { width: screenWidth } = useWindowDimensions();
  const lastTapRef = useRef(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLikeAnim, setShowLikeAnim] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [following, setFollowing] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const meta = AUTHOR_META[post.author.id];
  const nameA = LIKED_NAMES[post.likeCount % 5];

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
      setShowLikeAnim(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    lastTapRef.current = now;
  }, [isLiked, onLikeToggle]);

  const firstMediaAspect = post.media[0]?.aspectRatio ?? 1;
  const mediaHeight = screenWidth * firstMediaAspect;

  return (
    <View style={styles.postContainer}>

      {/* Header */}
      <View style={styles.postHeader}>
        <Pressable style={styles.postHeaderLeft} onPress={onAuthorPress}>
          <View style={styles.postAvatar}>
            <Text style={styles.postAvatarText}>{post.author.initials}</Text>
          </View>
          <View style={styles.postHeaderText}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Text style={styles.postAuthorName}>{post.author.name}</Text>
              {meta && (
                <Pressable style={styles.brandChip} onPress={onBrandPress}>
                  <Text style={styles.brandChipText}>{meta.brand}</Text>
                </Pressable>
              )}
            </View>
            <Text style={styles.postAuthorMeta} numberOfLines={1}>
              {post.author.username}
              {meta ? ` · ${meta.role}` : ''}
              {` · ${formatPostTime(post.timestamp)}`}
            </Text>
          </View>
        </Pressable>
        <Pressable
          hitSlop={8}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFollowing(v => !v); }}
        >
          <Text style={{ color: following ? C.secondary : C.accent, fontWeight: '600', fontSize: 13 }}>
            {following ? 'Following' : 'Follow'}
          </Text>
        </Pressable>
        <Pressable hitSlop={8} style={{ padding: 4 }} onPress={onMenuPress}>
          <IconSymbol name="ellipsis" size={18} color={C.secondary} />
        </Pressable>
      </View>

      {/* Text-only caption (above media) */}
      {postType === 'text' ? (
        <Text style={styles.textOnlyCaption}>{post.caption}</Text>
      ) : null}

      {/* Single image */}
      {postType === 'image' ? (
        <View>
          <Pressable onPress={handleMediaTap} delayLongPress={400}>
            <Image
              source={{ uri: post.media[0].uri }}
              style={{ width: screenWidth, height: mediaHeight }}
              resizeMode="cover"
            />
          </Pressable>
          <LikeAnimation visible={showLikeAnim} onComplete={() => setShowLikeAnim(false)} />
        </View>
      ) : null}

      {/* Multi-image carousel */}
      {postType === 'multi-image' ? (
        <View>
          <LikeAnimation visible={showLikeAnim} onComplete={() => setShowLikeAnim(false)} />
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
      ) : null}

      {/* Action Row */}
      <View style={styles.actionRow}>
        <View style={styles.actionLeft}>
          {/* Like with emoji picker */}
          <View>
            {showEmojiPicker ? (
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
            ) : null}
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
        <Text style={styles.likeCountText}>
          {'Liked by '}
          <Text style={styles.likeCountBold}>{nameA}</Text>
          {' and '}
          <Text style={styles.likeCountBold}>{(likeCount - 1).toLocaleString()} others</Text>
        </Text>

        {postType !== 'text' ? (
          <>
            <Text style={styles.captionText} numberOfLines={captionExpanded ? undefined : 3}>
              <Text style={styles.captionAuthorText}>{post.author.username} </Text>
              {post.caption}
            </Text>
            {!captionExpanded && post.caption.length > 120 ? (
              <Pressable onPress={() => setCaptionExpanded(true)}>
                <Text style={styles.viewCommentsText}>more</Text>
              </Pressable>
            ) : null}
          </>
        ) : null}

        {/* Always-visible 2 preview comments */}
        {post.commentCount > 0 ? (
          <View style={styles.inlineComments}>
            {MOCK_COMMENTS.slice(0, 2).map(c => (
              <Text key={c.id} style={styles.commentText} numberOfLines={2}>
                <Text style={styles.commentAuthorText}>{c.authorName} </Text>
                {c.text}
              </Text>
            ))}
            {post.commentCount > 2 ? (
              <Pressable onPress={() => onCommentPress()}>
                <Text style={styles.viewCommentsText}>
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
        {input.length > 0 ? (
          <Pressable onPress={() => setInput('')}>
            <Text style={{ color: C.accent, fontWeight: '600', fontSize: 14 }}>Post</Text>
          </Pressable>
        ) : null}
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

// ── PostMenuSheet ─────────────────────────────────────────────────────────────

interface MenuAction {
  icon: string;
  label: string;
  destructive?: boolean;
  onPress?: () => void;
}

function PostMenuSheet({
  post, isOwnPost, isAdmin, isSaved, onSaveToggle, visible, onClose, C,
}: {
  post: FeedPost | null;
  isOwnPost: boolean;
  isAdmin: boolean;
  isSaved: boolean;
  onSaveToggle: () => void;
  visible: boolean;
  onClose: () => void;
  C: ComponentColors;
}) {
  if (!post) return null;

  const ownActions: MenuAction[] = [
    { icon: 'pencil',       label: 'Edit Caption' },
    { icon: 'pin',          label: 'Pin to Profile' },
    { icon: 'archivebox',   label: 'Archive' },
    { icon: 'paperplane',   label: 'Share' },
    { icon: 'link',         label: 'Copy Link' },
    { icon: 'trash',        label: 'Delete', destructive: true },
  ];

  const othersActions: MenuAction[] = [
    { icon: isSaved ? 'bookmark.fill' : 'bookmark', label: isSaved ? 'Unsave' : 'Save', onPress: onSaveToggle },
    { icon: 'paperplane',    label: 'Share' },
    { icon: 'link',          label: 'Copy Link' },
    { icon: 'flag',          label: 'Report' },
    { icon: 'speaker.slash', label: 'Mute' },
    { icon: 'nosign',        label: 'Block', destructive: true },
  ];

  const adminActions: MenuAction[] = [
    { icon: 'pin.fill',   label: 'Pin to Brand Page' },
    { icon: 'eye.slash',  label: 'Hide from Feed' },
    { icon: 'trash.fill', label: 'Remove Post', destructive: true },
  ];

  const actions = [
    ...(isOwnPost ? ownActions : othersActions),
    ...(!isOwnPost && isAdmin ? adminActions : []),
  ];

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal>
      <View style={{ paddingBottom: 24 }}>
        {/* Mini post preview */}
        <View style={[pmStyles.preview, { borderBottomColor: C.separator }]}>
          <View style={[pmStyles.previewAvatar, { backgroundColor: C.accent }]}>
            <Text style={[pmStyles.previewAvatarText, { color: '#fff' }]}>{post.author.initials}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[pmStyles.previewName, { color: C.label }]} numberOfLines={1}>{post.author.name}</Text>
            <Text style={[pmStyles.previewCaption, { color: C.muted }]} numberOfLines={1}>{post.caption}</Text>
          </View>
        </View>

        {/* Action rows */}
        {actions.map((action, i) => (
          <Pressable
            key={action.label}
            style={({ pressed }) => [
              pmStyles.actionRow,
              { backgroundColor: pressed ? C.surfacePressed : 'transparent' },
              i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              action.onPress?.();
              onClose();
            }}
          >
            <IconSymbol
              name={action.icon as any}
              size={20}
              color={action.destructive ? C.red : C.label}
            />
            <Text style={[pmStyles.actionLabel, {
              color: action.destructive ? C.red : C.label,
              fontWeight: action.destructive ? '500' : '400',
            }]}>
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}

const pmStyles = StyleSheet.create({
  preview:           { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  previewAvatar:     { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  previewAvatarText: { fontSize: 12, fontWeight: '700' },
  previewName:       { fontSize: 13, fontWeight: '600' },
  previewCaption:    { fontSize: 12, marginTop: 1 },
  actionRow:         { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 15 },
  actionLabel:       { fontSize: 16 },
});

// ── ProfileView ───────────────────────────────────────────────────────────────

function ProfileView({ C }: { C: ComponentColors }) {
  const styles = useMemo(() => makeStyles(C), [C]);
  const { width } = useWindowDimensions();
  const router = useRouter();
  const [gridTab, setGridTab] = useState<ProfileGridTab>('posts');

  const profile = MY_PROFILE;
  const ownPosts = useMemo(() => getSammyPosts(), []);
  const taggedPosts = useMemo(() => getSammyTaggedPosts(), []);
  const cellSize = (width - 2) / 3;

  function formatStat(n: number) {
    return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {/* Avatar + stats row */}
      <View style={styles.profileHeader}>
        <LinearGradient
          colors={['#f09433', '#e6683c', '#dc2743', '#cc2366', '#bc1888']}
          start={{ x: 0.0, y: 1.0 }}
          end={{ x: 1.0, y: 0.0 }}
          style={styles.profileAvatarRing}
        >
          <View style={[styles.profileAvatarInner, { backgroundColor: C.bg }]}>
            <View style={styles.profileAvatarWrap}>
              <Text style={styles.profileAvatarText}>{profile.initials}</Text>
            </View>
          </View>
        </LinearGradient>
        <View style={styles.profileStats}>
          {[
            { label: 'Posts',     value: formatStat(profile.postCount) },
            { label: 'Followers', value: formatStat(profile.followerCount) },
            { label: 'Following', value: formatStat(profile.followingCount) },
          ].map(s => (
            <View key={s.label} style={styles.profileStatItem}>
              <Text style={[styles.profileStatValue, { color: C.label }]}>{s.value}</Text>
              <Text style={[styles.profileStatLabel, { color: C.secondary }]}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Name / handle / role */}
      <View style={styles.profileInfo}>
        <Text style={[styles.profileName, { color: C.label }]}>{profile.name}</Text>
        <Text style={[styles.profileHandle, { color: C.secondary }]}>{profile.handle}</Text>
        <Text style={[styles.profileRole, { color: C.muted }]}>{profile.role} · {profile.brand}</Text>
        <Text style={[styles.profileBio, { color: C.label }]}>{profile.bio}</Text>
      </View>

      {/* Edit Profile + Share Profile buttons */}
      <View style={[styles.profileActions, { flexDirection: 'row', gap: 8 }]}>
        <Pressable
          style={[styles.editProfileBtn, { flex: 1, borderColor: C.inputBorder }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(tabs)/(main)/social/edit-profile' as any);
          }}
        >
          <Text style={[styles.editProfileLabel, { color: C.label }]}>Edit Profile</Text>
        </Pressable>
        <Pressable
          style={[styles.editProfileBtn, { flex: 1, borderColor: C.inputBorder }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Text style={[styles.editProfileLabel, { color: C.label }]}>Share Profile</Text>
        </Pressable>
      </View>

      {/* Highlights row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 14, gap: 20 }}
      >
        {[
          { id: 'h1', label: 'Training', emoji: '⚽' },
          { id: 'h2', label: 'Matchday', emoji: '🏆' },
          { id: 'h3', label: 'KaNeXT',   emoji: '💡' },
          { id: 'h4', label: 'Travel',   emoji: '✈️' },
        ].map(h => (
          <Pressable
            key={h.id}
            style={{ alignItems: 'center', gap: 5 }}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[styles.highlightCircle, { borderColor: C.inputBorder }]}>
              <Text style={{ fontSize: 28 }}>{h.emoji}</Text>
            </View>
            <Text style={{ fontSize: 11, color: C.secondary }}>{h.label}</Text>
          </Pressable>
        ))}
        <Pressable style={{ alignItems: 'center', gap: 5 }}>
          <View style={[styles.highlightCircle, { borderColor: C.inputBorder }]}>
            <IconSymbol name="plus" size={22} color={C.secondary} />
          </View>
          <Text style={{ fontSize: 11, color: C.secondary }}>New</Text>
        </Pressable>
      </ScrollView>

      {/* Grid sub-tabs */}
      <View style={[styles.gridTabBar, { borderBottomColor: C.separator }]}>
        {(['posts', 'reels', 'tagged'] as ProfileGridTab[]).map(t => (
          <Pressable
            key={t}
            style={[styles.gridTab, gridTab === t && { borderBottomColor: C.label }]}
            onPress={() => { Haptics.selectionAsync(); setGridTab(t); }}
          >
            <IconSymbol
              name={t === 'posts' ? 'squareshape.split.2x2' : t === 'reels' ? 'play.square' : 'person.crop.rectangle'}
              size={20}
              color={gridTab === t ? C.label : C.muted}
            />
          </Pressable>
        ))}
      </View>

      {/* 3-column photo grid */}
      {gridTab === 'posts' ? (
        <View style={styles.photoGrid}>
          {ownPosts.map((post, i) => (
            <Pressable
              key={post.id}
              style={[styles.gridCell, { width: cellSize, height: cellSize }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({
                  pathname: '/(tabs)/(main)/social/grid-feed' as any,
                  params: { startPostId: post.id },
                });
              }}
            >
              {post.media[0] ? (
                <Image source={{ uri: post.media[0].uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: `hsl(${(i * 37 + 200) % 360},18%,82%)` }]} />
              )}
              {post.media.length > 1 ? (
                <View style={styles.gridMultiIcon}>
                  <IconSymbol name="square.on.square" size={12} color="#fff" />
                </View>
              ) : null}
              {post.isLiked ? (
                <View style={{ position: 'absolute', bottom: 6, left: 6 }}>
                  <IconSymbol name="heart.fill" size={13} color="#FF3B30" />
                </View>
              ) : null}
            </Pressable>
          ))}
        </View>
      ) : gridTab === 'reels' ? (
        <View style={styles.photoGrid}>
          {SAMMY_REELS.map((reel, i) => (
            <Pressable
              key={reel.id}
              style={[styles.gridCell, { width: cellSize, height: cellSize }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({
                  pathname: '/(tabs)/(main)/social/profile-reels' as any,
                  params: { startIndex: String(i) },
                });
              }}
            >
              {reel.posterUri ? (
                <Image source={{ uri: reel.posterUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: `hsl(${(i * 53 + 180) % 360},20%,18%)` }]} />
              )}
              {/* Play overlay */}
              <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
                <View style={{ backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 20, padding: 6 }}>
                  <IconSymbol name="play.fill" size={18} color="#fff" />
                </View>
              </View>
              {/* View count bottom-left */}
              <View style={{ position: 'absolute', bottom: 5, left: 6, flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <IconSymbol name="play.fill" size={9} color="rgba(255,255,255,0.85)" />
                <Text style={{ fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>
                  {reel.likeCount >= 1000 ? `${(reel.likeCount / 1000).toFixed(1)}K` : String(reel.likeCount)}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        /* Tagged */
        <View style={styles.photoGrid}>
          {taggedPosts.map((post, i) => (
            <Pressable
              key={post.id}
              style={[styles.gridCell, { width: cellSize, height: cellSize }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({
                  pathname: '/(tabs)/(main)/social/grid-feed' as any,
                  params: { startPostId: post.id, type: 'tagged' },
                });
              }}
            >
              {post.media[0] ? (
                <Image source={{ uri: post.media[0].uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: `hsl(${(i * 37 + 200) % 360},18%,82%)` }]} />
              )}
              {/* Tagged badge */}
              <View style={{ position: 'absolute', top: 5, right: 5 }}>
                <View style={{ backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 8, padding: 3 }}>
                  <IconSymbol name="person.fill" size={10} color="#fff" />
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// ── Social Screen (main) ──────────────────────────────────────────────────────

export default function SocialScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useMemo(() => makeStyles(C), [C]);
  const { state } = useAppContext();
  const mode = state.activeContext.mode;

  const [view, setView] = useState<SocialView>('feed');
  const [feedScope, setFeedScope] = useState<SocialScope>('brand');
  const [reelsScope, setReelsScope] = useState<SocialScope>('all');
  const [showScopeBar, setShowScopeBar] = useState(false);

  // Like/bookmark — tracks XOR flips from initial post.isLiked / post.isBookmarked
  const [likedPostFlips, setLikedPostFlips] = useState<Set<string>>(new Set());
  const [bookmarkedPostFlips, setBookmarkedPostFlips] = useState<Set<string>>(new Set());
  const [likedReels, setLikedReels] = useState<Set<string>>(new Set());
  const [bookmarkedReels, setBookmarkedReels] = useState<Set<string>>(new Set());

  const [commentPostId, setCommentPostId]   = useState<string | null>(null);
  const [shareVisible, setShareVisible]     = useState(false);
  const [commentReelId, setCommentReelId]   = useState<string | null>(null);
  const [savedPostIds, setSavedPostIds]     = useState<Set<string>>(new Set());
  const [menuTarget, setMenuTarget]         = useState<FeedPost | null>(null);

  const [role, setRole] = useState<'admin' | 'member' | 'visitor'>('admin');
  const isAdmin = role === 'admin';
  const cycleRole = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRole(r => r === 'admin' ? 'member' : r === 'member' ? 'visitor' : 'admin');
  }, []);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const lastScrollY = useRef(0);

  // Swipe left/right through Feed → Reels → Profile
  const swipeResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_evt, gs) =>
      Math.abs(gs.dx) > 12 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5,
    onPanResponderRelease: (_evt, gs) => {
      const idx = VIEW_ORDER.indexOf(view);
      if (gs.dx < -60 && idx < VIEW_ORDER.length - 1) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        handleSwitchView(VIEW_ORDER[idx + 1]);
      } else if (gs.dx > 60 && idx > 0) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        handleSwitchView(VIEW_ORDER[idx - 1]);
      }
    },
  }), [view, handleSwitchView]);

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

  const handleSaveToggle = useCallback((postId: string) => {
    setSavedPostIds(prev => {
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
    <View style={[styles.screen, { backgroundColor: view === 'reels' ? '#000' : C.bg }]} {...swipeResponder.panHandlers}>

      {/* Full-screen Reels layer (behind top bar) */}
      {view === 'reels' ? (
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
      ) : null}

      {/* Top bar — always visible, overlaid on reels */}
      <View style={[
        styles.topBarWrap,
        { paddingTop: insets.top },
        view === 'reels' && styles.topBarWrapOverlay,
      ]}>
        <View style={styles.topBar}>
          {/* Left: Create "+" */}
          <Pressable
            style={styles.topBarSide}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/(tabs)/(main)/social/create' as any);
            }}
          >
            <IconSymbol name="plus" size={22} color={view === 'reels' ? '#fff' : C.label} />
          </Pressable>

          {/* Center: Feed · Reels · Profile pill */}
          <View style={styles.viewPill}>
            <View style={styles.viewPillInner}>
              {VIEW_ORDER.map(v => (
                <Pressable
                  key={v}
                  style={[styles.pillOption, view === v && styles.pillOptionActive]}
                  onPress={() => handleSwitchView(v)}
                >
                  <Text style={[styles.pillOptionText, view === v && styles.pillOptionTextActive]}>
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Right: RBAC pill + filter icon */}
          <View style={[styles.topBarSide, { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8, width: 'auto' as any }]}>
            <Pressable
              style={[styles.rbacPill, { backgroundColor: view === 'reels' ? 'rgba(255,255,255,0.15)' : C.surfacePressed }]}
              onPress={cycleRole}
            >
              <Text style={[styles.rbacPillText, { color: view === 'reels' ? 'rgba(255,255,255,0.85)' : C.secondary }]}>
                {role === 'admin' ? 'Admin' : role === 'member' ? 'Member' : 'Visitor'}
              </Text>
            </Pressable>
            {view === 'feed' && (
              <Pressable onPress={() => setShowScopeBar(v => !v)}>
                <IconSymbol
                  name="line.3.horizontal.decrease"
                  size={20}
                  color={showScopeBar ? C.accent : C.label}
                />
              </Pressable>
            )}
          </View>
        </View>

        {/* Scope pills */}
        {showScopeBar ? (
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
        ) : null}
      </View>

      {/* Feed content */}
      {view === 'feed' ? (
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
              onLikeToggle={() => handleLikeToggle(item.id)}
              onBookmarkToggle={() => handleBookmarkToggle(item.id)}
              onCommentPress={() => setCommentPostId(item.id)}
              onSharePress={() => setShareVisible(true)}
              onAuthorPress={() => router.push({ pathname: '/(tabs)/(main)/social/person', params: { authorId: item.author.id } } as any)}
              onBrandPress={() => { const m = AUTHOR_META[item.author.id]; if (m?.brand) router.push({ pathname: '/(tabs)/(main)/social/brand', params: { brand: m.brand } } as any); }}
              onMenuPress={() => setMenuTarget(item)}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.postSeparator} />}
        />
      ) : null}

      {/* Profile tab */}
      {view === 'profile' ? (
        <ProfileView C={C} />
      ) : null}

      {/* Sheets */}
      <CommentsSheet
        visible={commentPostId != null || commentReelId != null}
        onClose={() => { setCommentPostId(null); setCommentReelId(null); }}
        C={C}
      />
      <ShareSheet visible={shareVisible} onClose={() => setShareVisible(false)} C={C} />
      <PostMenuSheet
        post={menuTarget}
        isOwnPost={menuTarget?.author.id === MY_SOCIAL_AUTHOR_ID}
        isAdmin={isAdmin}
        isSaved={menuTarget != null && savedPostIds.has(menuTarget.id)}
        onSaveToggle={() => menuTarget && handleSaveToggle(menuTarget.id)}
        visible={menuTarget != null}
        onClose={() => setMenuTarget(null)}
        C={C}
      />
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
  rbacPill:    { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  rbacPillText: { fontSize: 11, fontWeight: '600' },
  viewPill: {
    flex: 1,
    alignItems: 'center',
  },
  viewPillInner: {
    flexDirection: 'row',
    backgroundColor: C.surfacePressed,
    borderRadius: 22,
    padding: 3,
    borderWidth: 1.5,
    borderColor: C.inputBorder,
    gap: 2,
  },
  pillOption: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 18,
  },
  pillOptionActive: {
    backgroundColor: C.label,
  },
  pillOptionText: {
    fontSize: 13,
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
  postHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
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
  likeCountBold: {
    fontWeight: '700',
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

  // Profile
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 16,
  },
  profileAvatarRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  profileAvatarInner: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarWrap: {
    width: 80, height: 80,
    borderRadius: 40,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  profileStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  profileStatItem: {
    alignItems: 'center',
    gap: 2,
  },
  profileStatValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  profileStatLabel: {
    fontSize: 12,
  },
  profileInfo: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 2,
  },
  profileName: {
    fontSize: 15,
    fontWeight: '700',
  },
  profileHandle: {
    fontSize: 13,
  },
  profileRole: {
    fontSize: 12,
    marginTop: 1,
  },
  profileBio: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  profileActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  editProfileBtn: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
  },
  editProfileLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  gridTabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  gridTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 1,
  },
  gridCell: {
    overflow: 'hidden',
    position: 'relative',
  },
  gridMultiIcon: {
    position: 'absolute',
    top: 6, right: 6,
  },
  highlightCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyGrid: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyGridText: {
    fontSize: 14,
  },
});
