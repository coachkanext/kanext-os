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
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { RolePill } from '@/components/ui/role-pill';
import { StoriesRow } from '@/components/social/stories-row';
import { ReelsPage } from '@/components/social/reels-page';
import { LikeAnimation } from '@/components/social/like-animation';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useAppContext } from '@/context/app-context';
import { hideFooter, showFooter, resetFooter } from '@/utils/global-footer-hide';
import { openSidePanel } from '@/utils/global-side-panel';
import { useDemoRole, MODE_ACCENTS } from '@/utils/demo-role-store';
import { useDataMode } from '@/utils/global-demo-mode';
import {
  getFeedPosts, getReels, getStories, getSammyPosts, getSammyTaggedPosts, formatPostTime,
  getTrendingTopics, getExploreTiles, getSuggestedAccounts,
  SAMMY_POSTS, SAMMY_REELS, type FeedPost, type SocialReel,
} from '@/data/mock-social';
import { ExplorePage } from '@/components/social/explore-page';
import type { Mode } from '@/types';
import { KMenuButton } from '@/components/ui/k-menu-button';

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
  ea3: { role: 'President', brand: 'Lincoln Univ.' },
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
                    borderColor: active ? C.activePill : C.separator,
                    backgroundColor: active ? C.activePill + '18' : 'transparent',
                  }}
                  onPress={() => setVisibility(v.key)}
                >
                  <Text style={{ fontSize: 13, fontWeight: active ? '600' : '400', color: active ? C.activePill : C.secondary }}>
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

// ── Sports Social: Team Feed ──────────────────────────────────────────

type SportsPostVisibility = 'Internal' | 'Public';
type SportsPostType = 'regular' | 'game_result' | 'poll';

interface SportsTeamPost {
  id: string;
  author: string;
  initials: string;
  time: string;
  visibility: SportsPostVisibility;
  pinned: boolean;
  type: SportsPostType;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  text: string;
  isCoach: boolean;
  pendingApproval: boolean;
  pollOptions?: { label: string; votes: number }[];
}

const SPORTS_TEAM_FEED: SportsTeamPost[] = [
  {
    id: 'sf1', author: 'StatKeeper', initials: 'SK', time: 'Just now',
    visibility: 'Public', pinned: true, type: 'game_result',
    views: 2841, likes: 143, comments: 28, shares: 67,
    text: 'FINAL: LU Oaklanders 84 — Riverside 71. Laolu drops 28 pts · 9 reb. GAAC record: 15-2. Playoff push continues.',
    isCoach: false, pendingApproval: false,
  },
  {
    id: 'sf2', author: 'Coach Middlebrooks', initials: 'WM', time: '2h',
    visibility: 'Internal', pinned: false, type: 'regular',
    views: 22, likes: 18, comments: 4, shares: 0,
    text: 'Film assignment — all players: Watch the Westview 2nd-half possessions. Pay close attention to the high ball screen coverage rotations. Quiz at practice.',
    isCoach: true, pendingApproval: false,
  },
  {
    id: 'sf3', author: "LU Men's Basketball", initials: 'LU', time: '4h',
    visibility: 'Public', pinned: false, type: 'regular',
    views: 1247, likes: 89, comments: 12, shares: 34,
    text: 'Over $620K in full COA secured for our student-athletes this season. LU Oaklanders is the standard. \uD83C\uDF93 #LincolnU #GAAC',
    isCoach: true, pendingApproval: false,
  },
  {
    id: 'sf4', author: 'Laolu Kalejaiye', initials: 'LK', time: '5h',
    visibility: 'Internal', pinned: false, type: 'regular',
    views: 19, likes: 24, comments: 7, shares: 0,
    text: 'Big W last night fam. That 3rd quarter run was SPECIAL. Everyone played their role. Love this team.',
    isCoach: false, pendingApproval: false,
  },
  {
    id: 'sf5', author: 'Coach Middlebrooks', initials: 'WM', time: '1d',
    visibility: 'Internal', pinned: false, type: 'regular',
    views: 28, likes: 31, comments: 2, shares: 0,
    text: 'Strength numbers are up across the board. Every player PR\'d this week. That is preparation. Final stretch starts now.',
    isCoach: true, pendingApproval: false,
  },
  {
    id: 'sf6', author: 'Brandon Williams', initials: 'BW', time: '1d',
    visibility: 'Public', pinned: false, type: 'regular',
    views: 0, likes: 0, comments: 0, shares: 0,
    text: 'Big announcement coming next week. Stay locked in. @LU_Athletics \uD83D\uDC40 #NIL #GAAC',
    isCoach: false, pendingApproval: true,
  },
  {
    id: 'sf7', author: 'Coach Middlebrooks', initials: 'WM', time: '2d',
    visibility: 'Internal', pinned: false, type: 'poll',
    views: 18, likes: 0, comments: 0, shares: 0,
    text: 'Practice playlist vote — pick your vibe:',
    isCoach: true, pendingApproval: false,
    pollOptions: [
      { label: 'Hip-Hop',   votes: 9 },
      { label: 'Trap',      votes: 5 },
      { label: 'R&B',       votes: 3 },
      { label: 'Vibes Mix', votes: 1 },
    ],
  },
];

// ── Sports Head Coach Social View ─────────────────────────────────────

function SportsHeadCoachSocialView({
  C, insets, role, cycleRole, accent,
}: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  role: string;
  cycleRole: () => void;
  accent: string;
}) {
  const [filter, setFilter]             = useState<'All' | SportsPostVisibility>('All');
  const [composerVis, setComposerVis]   = useState<SportsPostVisibility>('Internal');
  const [liked, setLiked]               = useState<Set<string>>(new Set());
  const [pinned, setPinned]             = useState<Set<string>>(new Set(['sf1']));
  const [approved, setApproved]         = useState<Set<string>>(new Set());
  const TOP_BAR_H = 52;
  const GAIN = '#5A8A6E';
  const CAUTION = '#B8943E';

  const filtered = useMemo(() => {
    const base = filter === 'All' ? SPORTS_TEAM_FEED : SPORTS_TEAM_FEED.filter(p => p.visibility === filter);
    return [...base].sort((a, b) => {
      const ap = pinned.has(a.id) ? 1 : 0;
      const bp = pinned.has(b.id) ? 1 : 0;
      return bp - ap;
    });
  }, [filter, pinned]);

  function toggleLike(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLiked(s => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }

  function togglePin(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPinned(s => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }

  function approvePost(id: string) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setApproved(s => { const n = new Set(s); n.add(id); return n; });
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top bar */}
      <View style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        height: insets.top + TOP_BAR_H, paddingTop: insets.top,
        flexDirection: 'row', alignItems: 'flex-end',
        paddingHorizontal: 16, paddingBottom: 8,
        backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
      }}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
          style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <KMenuButton />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ backgroundColor: C.surface, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, paddingHorizontal: 14, paddingVertical: 5 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>LU Men's Basketball</Text>
          </View>
        </View>
        <RolePill role={role} onPress={cycleRole} accentColor={accent} isPrimary />
      </View>

      {/* Filter pills */}
      <View style={{
        position: 'absolute', top: insets.top + TOP_BAR_H, left: 0, right: 0, zIndex: 15,
        flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10,
        backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
      }}>
        {(['All', 'Internal', 'Public'] as const).map(f => {
          const active = filter === f;
          return (
            <Pressable key={f} onPress={() => { Haptics.selectionAsync(); setFilter(f); }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, borderWidth: 1,
                backgroundColor: active ? C.activePill : C.surface,
                borderColor: active ? C.activePill : C.separator }}>
              {f === 'Internal' && <IconSymbol name="lock.fill" size={10} color={active ? C.activePillText : C.secondary} />}
              {f === 'Public'   && <IconSymbol name="globe"     size={10} color={active ? C.activePillText : C.secondary} />}
              <Text style={{ fontSize: 12, fontWeight: '600', color: active ? C.activePillText : C.secondary }}>{f}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 48, paddingBottom: 120 }}
      >
        {/* Post composer */}
        <View style={{ marginHorizontal: 14, marginTop: 12, marginBottom: 14, backgroundColor: C.surface, borderRadius: 16, padding: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: C.bg, fontWeight: '800', fontSize: 12 }}>LU</Text>
            </View>
            <View style={{ flex: 1, height: 38, borderRadius: 19, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, backgroundColor: C.bg, alignItems: 'flex-start', justifyContent: 'center', paddingHorizontal: 14 }}>
              <Text style={{ fontSize: 14, color: C.muted }}>Post as LU Men's Basketball...</Text>
            </View>
          </View>
          {/* Visibility toggle */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
            {(['Internal', 'Public'] as const).map(v => {
              const active = composerVis === v;
              return (
                <Pressable key={v} onPress={() => { Haptics.selectionAsync(); setComposerVis(v); }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1,
                    backgroundColor: active ? C.activePill : 'transparent',
                    borderColor: active ? C.activePill : C.separator }}>
                  <IconSymbol name={v === 'Internal' ? 'lock.fill' : 'globe'} size={11} color={active ? C.activePillText : C.secondary} />
                  <Text style={{ fontSize: 12, fontWeight: '600', color: active ? C.activePillText : C.secondary }}>{v}</Text>
                </Pressable>
              );
            })}
          </View>
          {/* Attach row */}
          <View style={{ flexDirection: 'row', gap: 14, paddingTop: 2 }}>
            {[
              { icon: 'photo', label: 'Photo' },
              { icon: 'video', label: 'Video' },
              { icon: 'chart.bar.fill', label: 'Poll' },
              { icon: 'calendar', label: 'Game Day' },
            ].map(a => (
              <Pressable key={a.icon} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <IconSymbol name={a.icon as any} size={14} color={C.secondary} />
                <Text style={{ fontSize: 11, color: C.secondary, fontWeight: '500' }}>{a.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Posts */}
        {filtered.map(post => {
          const isLiked = liked.has(post.id);
          const isPinned = pinned.has(post.id);
          const isApproved = approved.has(post.id);
          const showPending = post.pendingApproval && !isApproved;

          return (
            <View key={post.id} style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
              {/* Pending approval banner */}
              {showPending && (
                <View style={{ marginHorizontal: 14, marginTop: 10, backgroundColor: `${CAUTION}22`, borderRadius: 10, padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                    <IconSymbol name="clock.fill" size={13} color={CAUTION} />
                    <Text style={{ fontSize: 12, color: CAUTION, fontWeight: '600' }}>Pending approval — public post by {post.author}</Text>
                  </View>
                  <Pressable onPress={() => approvePost(post.id)}
                    style={{ backgroundColor: GAIN, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, marginLeft: 8 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#FFFFFF' }}>Approve</Text>
                  </Pressable>
                </View>
              )}

              {/* Game result card */}
              {post.type === 'game_result' ? (
                <View style={{ marginHorizontal: 14, marginVertical: 10, backgroundColor: '#1A1714', borderRadius: 16, padding: 16 }}>
                  {isPinned && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                      <IconSymbol name="pin.fill" size={10} color="#8A837C" />
                      <Text style={{ fontSize: 10, fontWeight: '700', color: '#8A837C', textTransform: 'uppercase', letterSpacing: 0.5 }}>Pinned</Text>
                    </View>
                  )}
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#8A837C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Game Result · Public</Text>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#F0E8DC', lineHeight: 24 }}>{post.text}</Text>
                  <Text style={{ fontSize: 11, color: '#8A837C', marginTop: 8 }}>{post.time} · via StatKeeper</Text>
                  <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
                    {[
                      { icon: 'eye',         val: `${(post.views / 1000).toFixed(1)}K` },
                      { icon: 'heart',       val: String(post.likes + (isLiked ? 1 : 0)) },
                      { icon: 'bubble.right', val: String(post.comments) },
                      { icon: 'paperplane',  val: String(post.shares) },
                    ].map(s => (
                      <View key={s.icon} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <IconSymbol name={s.icon as any} size={12} color="#8A837C" />
                        <Text style={{ fontSize: 11, color: '#8A837C' }}>{s.val}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                <>
                  {/* Post header */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6, gap: 10 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: C.bg, fontWeight: '700', fontSize: 13 }}>{post.initials}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{post.author}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
                        <Text style={{ fontSize: 12, color: C.secondary }}>{post.time}</Text>
                        {post.isCoach && (
                          <View style={{ backgroundColor: C.surfacePressed, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}>
                            <Text style={{ fontSize: 10, fontWeight: '700', color: C.secondary }}>Coach</Text>
                          </View>
                        )}
                        {/* Visibility badge */}
                        <View style={{
                          flexDirection: 'row', alignItems: 'center', gap: 3,
                          backgroundColor: post.visibility === 'Internal' ? C.surfacePressed : `${GAIN}22`,
                          borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1,
                        }}>
                          <IconSymbol name={post.visibility === 'Internal' ? 'lock.fill' : 'globe'} size={9}
                            color={post.visibility === 'Internal' ? C.secondary : GAIN} />
                          <Text style={{ fontSize: 10, fontWeight: '700', color: post.visibility === 'Internal' ? C.secondary : GAIN }}>
                            {post.visibility}
                          </Text>
                        </View>
                        {isPinned && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                            <IconSymbol name="pin.fill" size={9} color={C.secondary} />
                            <Text style={{ fontSize: 10, fontWeight: '600', color: C.secondary }}>Pinned</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                      <IconSymbol name="ellipsis" size={18} color={C.secondary} />
                    </Pressable>
                  </View>

                  {/* Poll */}
                  {post.type === 'poll' && post.pollOptions ? (
                    <View style={{ paddingHorizontal: 14, paddingBottom: 8 }}>
                      <Text style={{ fontSize: 15, color: C.label, lineHeight: 22, marginBottom: 10 }}>{post.text}</Text>
                      {(() => {
                        const total = post.pollOptions.reduce((s, o) => s + o.votes, 0);
                        return post.pollOptions.map(opt => {
                          const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
                          return (
                            <View key={opt.label} style={{ marginBottom: 8 }}>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                <Text style={{ fontSize: 13, fontWeight: '500', color: C.label }}>{opt.label}</Text>
                                <Text style={{ fontSize: 12, color: C.secondary }}>{pct}%</Text>
                              </View>
                              <View style={{ height: 6, borderRadius: 3, backgroundColor: C.separator }}>
                                <View style={{ height: 6, borderRadius: 3, width: `${pct}%`, backgroundColor: C.label }} />
                              </View>
                            </View>
                          );
                        });
                      })()}
                      <Text style={{ fontSize: 11, color: C.secondary, marginTop: 4 }}>{post.views} responses</Text>
                    </View>
                  ) : (
                    <Text style={{ fontSize: 15, color: C.label, paddingHorizontal: 14, paddingBottom: 10, lineHeight: 22 }}>{post.text}</Text>
                  )}

                  {/* Engagement stats (for non-polls) */}
                  {post.type !== 'poll' && (
                    <View style={{ flexDirection: 'row', gap: 16, paddingHorizontal: 14, paddingBottom: 8 }}>
                      {post.visibility === 'Public' && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <IconSymbol name="eye" size={12} color={C.muted} />
                          <Text style={{ fontSize: 12, color: C.muted }}>{post.views >= 1000 ? `${(post.views / 1000).toFixed(1)}K` : String(post.views)}</Text>
                        </View>
                      )}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <IconSymbol name="heart" size={12} color={C.muted} />
                        <Text style={{ fontSize: 12, color: C.muted }}>{post.likes + (isLiked ? 1 : 0)}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <IconSymbol name="bubble.right" size={12} color={C.muted} />
                        <Text style={{ fontSize: 12, color: C.muted }}>{post.comments}</Text>
                      </View>
                    </View>
                  )}

                  {/* Action row — coach controls */}
                  <View style={{ flexDirection: 'row', gap: 20, paddingHorizontal: 14, paddingBottom: 12, flexWrap: 'wrap' }}>
                    <Pressable onPress={() => toggleLike(post.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <IconSymbol name={isLiked ? 'heart.fill' : 'heart'} size={18} color={isLiked ? '#B85C5C' : C.secondary} />
                    </Pressable>
                    <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <IconSymbol name="bubble.right" size={18} color={C.secondary} />
                    </Pressable>
                    <Pressable onPress={() => togglePin(post.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <IconSymbol name={isPinned ? 'pin.fill' : 'pin'} size={16} color={isPinned ? C.label : C.secondary} />
                      <Text style={{ fontSize: 12, color: isPinned ? C.label : C.secondary, fontWeight: isPinned ? '600' : '400' }}>
                        {isPinned ? 'Pinned' : 'Pin'}
                      </Text>
                    </Pressable>
                    <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <IconSymbol name="trash" size={15} color={C.secondary} />
                      <Text style={{ fontSize: 12, color: C.secondary }}>Delete</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ── Sports Player: Team Feed ──────────────────────────────────────────

function SportsPlayerTeamFeedView({
  C, insets, role, cycleRole, accent,
}: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  role: string;
  cycleRole: () => void;
  accent: string;
}) {
  const [liked, setLiked]             = useState<Set<string>>(new Set());
  const [composerVis, setComposerVis] = useState<SportsPostVisibility>('Internal');
  const TOP_BAR_H = 52;
  const GAIN    = '#5A8A6E';
  const CAUTION = '#B8943E';
  // Posting policy: public posts require approval (default)
  const POSTING_POLICY_PUBLIC: 'off' | 'free' | 'approval' = 'approval';

  function toggleLike(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLiked(s => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top bar */}
      <View style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        height: insets.top + TOP_BAR_H, paddingTop: insets.top,
        flexDirection: 'row', alignItems: 'flex-end',
        paddingHorizontal: 16, paddingBottom: 8,
        backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
      }}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
          style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <KMenuButton />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ backgroundColor: C.surface, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, paddingHorizontal: 14, paddingVertical: 5 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>Team Feed</Text>
          </View>
        </View>
        <RolePill role={role} onPress={cycleRole} accentColor={accent} isPrimary={false} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 12, paddingBottom: 120 }}
      >
        {/* Post composer */}
        <View style={{ marginHorizontal: 14, marginBottom: 14, backgroundColor: C.surface, borderRadius: 16, padding: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: C.bg, fontWeight: '700', fontSize: 13 }}>LK</Text>
            </View>
            <View style={{ flex: 1, height: 38, borderRadius: 19, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, backgroundColor: C.bg, alignItems: 'flex-start', justifyContent: 'center', paddingHorizontal: 14 }}>
              <Text style={{ fontSize: 14, color: C.muted }}>Post to the team...</Text>
            </View>
          </View>
          {/* Visibility options */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable onPress={() => { Haptics.selectionAsync(); setComposerVis('Internal'); }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1,
                backgroundColor: composerVis === 'Internal' ? C.activePill : 'transparent',
                borderColor: composerVis === 'Internal' ? C.activePill : C.separator }}>
              <IconSymbol name="lock.fill" size={11} color={composerVis === 'Internal' ? C.activePillText : C.secondary} />
              <Text style={{ fontSize: 12, fontWeight: '600', color: composerVis === 'Internal' ? C.activePillText : C.secondary }}>Internal</Text>
            </Pressable>
            {POSTING_POLICY_PUBLIC !== 'off' && (
              <Pressable onPress={() => { Haptics.selectionAsync(); setComposerVis('Public'); }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1,
                  backgroundColor: composerVis === 'Public' ? C.activePill : 'transparent',
                  borderColor: composerVis === 'Public' ? C.activePill : C.separator }}>
                <IconSymbol name="globe" size={11} color={composerVis === 'Public' ? C.activePillText : C.secondary} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: composerVis === 'Public' ? C.activePillText : C.secondary }}>Public</Text>
              </Pressable>
            )}
            {composerVis === 'Public' && POSTING_POLICY_PUBLIC === 'approval' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <IconSymbol name="clock.fill" size={11} color={CAUTION} />
                <Text style={{ fontSize: 11, color: CAUTION, fontWeight: '600' }}>Requires approval</Text>
              </View>
            )}
          </View>
        </View>

        {/* Posts */}
        {SPORTS_TEAM_FEED.map(post => {
          const isLiked = liked.has(post.id);
          const HEAT = '#B85C5C';

          if (post.type === 'game_result') {
            return (
              <View key={post.id} style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
                <View style={{ marginHorizontal: 14, marginVertical: 10, backgroundColor: '#1A1714', borderRadius: 16, padding: 16 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#8A837C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Game Result</Text>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#F0E8DC', lineHeight: 24 }}>{post.text}</Text>
                  <Text style={{ fontSize: 11, color: '#8A837C', marginTop: 8 }}>{post.time} · via StatKeeper</Text>
                </View>
              </View>
            );
          }

          if (post.type === 'poll' && post.pollOptions) {
            const total = post.pollOptions.reduce((s, o) => s + o.votes, 0);
            return (
              <View key={post.id} style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: C.bg, fontWeight: '700', fontSize: 12 }}>{post.initials}</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{post.author}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={{ fontSize: 11, color: C.secondary }}>{post.time}</Text>
                      <View style={{ backgroundColor: C.surfacePressed, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}>
                        <Text style={{ fontSize: 9, fontWeight: '700', color: C.secondary }}>Coach</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: C.surfacePressed, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}>
                        <IconSymbol name="lock.fill" size={9} color={C.secondary} />
                        <Text style={{ fontSize: 9, fontWeight: '700', color: C.secondary }}>Internal</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <Text style={{ fontSize: 14, color: C.label, marginBottom: 10 }}>{post.text}</Text>
                {post.pollOptions.map(opt => {
                  const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
                  return (
                    <Pressable key={opt.label} onPress={() => Haptics.selectionAsync()}
                      style={{ marginBottom: 8, backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.separator, padding: 10 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ fontSize: 13, fontWeight: '500', color: C.label }}>{opt.label}</Text>
                        <Text style={{ fontSize: 12, color: C.secondary }}>{pct}%</Text>
                      </View>
                      <View style={{ height: 4, borderRadius: 2, backgroundColor: C.separator }}>
                        <View style={{ height: 4, borderRadius: 2, width: `${pct}%`, backgroundColor: C.label }} />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            );
          }

          return (
            <View key={post.id} style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
              {/* Pending indicator (own post) */}
              {post.pendingApproval && post.author === 'Laolu Kalejaiye' && (
                <View style={{ marginHorizontal: 14, marginTop: 8, backgroundColor: `${CAUTION}22`, borderRadius: 8, padding: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <IconSymbol name="clock.fill" size={12} color={CAUTION} />
                  <Text style={{ fontSize: 11, color: CAUTION, fontWeight: '600' }}>Awaiting coach approval before publishing publicly</Text>
                </View>
              )}
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6, gap: 10 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: C.bg, fontWeight: '700', fontSize: 13 }}>{post.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{post.author}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2, flexWrap: 'wrap' }}>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{post.time}</Text>
                    {post.isCoach && (
                      <View style={{ backgroundColor: C.surfacePressed, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}>
                        <Text style={{ fontSize: 9, fontWeight: '700', color: C.secondary }}>Coach</Text>
                      </View>
                    )}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: post.visibility === 'Internal' ? C.surfacePressed : `${GAIN}22`, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}>
                      <IconSymbol name={post.visibility === 'Internal' ? 'lock.fill' : 'globe'} size={9} color={post.visibility === 'Internal' ? C.secondary : GAIN} />
                      <Text style={{ fontSize: 9, fontWeight: '700', color: post.visibility === 'Internal' ? C.secondary : GAIN }}>{post.visibility}</Text>
                    </View>
                  </View>
                </View>
              </View>
              <Text style={{ fontSize: 15, color: C.label, paddingHorizontal: 14, paddingBottom: 10, lineHeight: 22 }}>{post.text}</Text>
              <View style={{ flexDirection: 'row', gap: 20, paddingHorizontal: 14, paddingBottom: 12 }}>
                <Pressable onPress={() => toggleLike(post.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <IconSymbol name={isLiked ? 'heart.fill' : 'heart'} size={18} color={isLiked ? HEAT : C.secondary} />
                </Pressable>
                <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <IconSymbol name="bubble.right" size={18} color={C.secondary} />
                </Pressable>
                <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <IconSymbol name="paperplane" size={18} color={C.secondary} />
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ── Business CEO: Feed / Announcements / Internal ─────────────────────

type BizCEOTab = 'Feed' | 'Announcements' | 'Internal';

const BIZ_CEO_FEED_POSTS = [
  { id: 'bc1', author: 'Sammy Kalejaiye', initials: 'SK', time: '1h', visibility: 'Public', pinned: true, views: 3241, likes: 187, comments: 43, shares: 62, text: 'KaNeXT OS V2 just shipped 3 new intelligence features — read the full release notes. The team has been cooking for months and this is just the beginning.' },
  { id: 'bc2', author: 'KaNeXT LLC', initials: 'KN', time: '3h', visibility: 'Public', pinned: false, views: 1847, likes: 94, comments: 21, shares: 38, text: 'Partnership signed with Lincoln University Oakland for Education Mode pilot. Proud to support historically Black institutions with next-gen technology.' },
  { id: 'bc3', author: 'KaNeXT LLC', initials: 'KN', time: '1d', visibility: 'Team Only', pinned: false, views: 312, likes: 48, comments: 9, shares: 0, text: 'Team hit $49K MRR this month. That is a 34% jump from February. Execution is everything.' },
  { id: 'bc4', author: 'Press Coverage', initials: 'PC', time: '2d', visibility: 'Public', pinned: false, views: 2108, likes: 113, comments: 17, shares: 54, text: 'TechCrunch covered KaNeXT in their Top 10 Startup Tools of Q1 2026 roundup. Great visibility for the brand — sharing with the team.' },
];

const BIZ_ANNOUNCEMENTS = [
  { id: 'ba1', title: 'Q1 Product Update', body: 'Intelligence features v2 live: real-time corpus updates, prompt caching, and eval protocol v1.1. See release notes in the portal.', date: 'Apr 1', distribution: 'Public', pushSent: true, readCount: 2847 },
  { id: 'ba2', title: 'NAIA Mandate Outreach Campaign Launched', body: 'We are reaching out to all 258 NAIA institutions to introduce KaNeXT Sports Mode. Email sequence live. BD team leading.', date: 'Mar 28', distribution: 'Team', pushSent: true, readCount: 18 },
  { id: 'ba3', title: 'Investor Demo Day — April 15', body: 'Demo Day is confirmed for April 15 at 2 PM EST. Pitch deck v7 shared in Notion. All team members should be available on standby.', date: 'Mar 25', distribution: 'Investors', pushSent: false, readCount: 7 },
];

const BIZ_INTERNAL_POSTS = [
  { id: 'bi1', author: 'Sammy Kalejaiye', initials: 'SK', time: '2h', likes: 14, comments: 3, text: 'Welcome our new engineer David Chen! First day today — he is diving straight into the corpus pipeline.' },
  { id: 'bi2', author: 'Operations', initials: 'OP', time: '5h', likes: 9, comments: 2, text: 'Q1 retro this Friday at 3 PM EST. Link in the calendar invite. Come with your wins and blockers.' },
  { id: 'bi3', author: 'Sammy Kalejaiye', initials: 'SK', time: '1d', likes: 22, comments: 6, text: 'Shoutout to the BD team for closing 3 deals this week. That is what we are talking about. Keep the momentum going.' },
  { id: 'bi4', author: 'Design', initials: 'DS', time: '2d', likes: 11, comments: 1, text: 'New dark mode refinements are in TestFlight build #14. Please QA before Monday. Especially the Nexus screen edge cases.' },
];

function BusinessCEOSocialView({
  C, insets, role, cycleRole, accent,
}: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  role: string;
  cycleRole: () => void;
  accent: string;
}) {
  const [bizTab, setBizTab] = useState("Feed" as BizCEOTab);
  const [bizDrop, setBizDrop] = useState(false);
  const [feedVisibility, setFeedVisibility] = useState("Public" as string);
  const [ceoLiked, setCeoLiked] = useState(new Set() as Set<string>);
  const TOP_BAR_H = 52;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top bar */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, height: insets.top + TOP_BAR_H, paddingTop: insets.top, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <IconSymbol name='line.3.horizontal' size={22} color={C.label} />
        </Pressable>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setBizDrop(v => !v); }} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>{bizTab as string}</Text>
          <IconSymbol name={bizDrop ? 'chevron.up' : 'chevron.down'} size={12} color={C.secondary} />
        </Pressable>
        <RolePill role={role} onPress={cycleRole} accentColor={accent} isPrimary />
      </View>
      {/* Tab dropdown */}
      {bizDrop && (
        <View style={{ position: 'absolute', top: insets.top + TOP_BAR_H + 4, left: '18%', right: '18%', backgroundColor: C.surface, borderRadius: 14, zIndex: 100, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8, overflow: 'hidden' }}>
          {(['Feed', 'Announcements', 'Internal'] as BizCEOTab[]).map((tab, i, arr) => (
            <Pressable key={tab} onPress={() => { Haptics.selectionAsync(); setBizTab(tab as BizCEOTab); setBizDrop(false); }} style={{ paddingVertical: 13, paddingHorizontal: 16, borderBottomWidth: i < arr.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }}>
              <Text style={{ fontSize: 15, color: tab === bizTab ? C.label : C.secondary, fontWeight: tab === bizTab ? '600' : '400' }}>{tab}</Text>
            </Pressable>
          ))}
        </View>
      )}
      {/* FEED */}
      {bizTab === "Feed" && (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 12, paddingBottom: 120 }}>
          {/* Post composer */}
          <View style={{ marginHorizontal: 14, marginBottom: 14, backgroundColor: C.surface, borderRadius: 16, padding: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: C.bg, fontWeight: '700', fontSize: 13 }}>SK</Text>
              </View>
              <View style={{ flex: 1, height: 36, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, alignItems: 'flex-start', justifyContent: 'center', paddingHorizontal: 14 }}>
                <Text style={{ fontSize: 14, color: C.muted }}>Post as KaNeXT...</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Text style={{ fontSize: 12, color: C.secondary }}>Visibility:</Text>
              {(['Public', 'Team Only', 'Clients Only'] as const).map(v => (
                <Pressable key={v} onPress={() => { Haptics.selectionAsync(); setFeedVisibility(v); }} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: feedVisibility === v ? C.label : C.surfacePressed }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: feedVisibility === v ? C.bg : C.secondary }}>{v}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          {BIZ_CEO_FEED_POSTS.map(post => (
            <View key={post.id} style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6, gap: 10 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: C.bg, fontWeight: '700', fontSize: 13 }}>{post.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{post.author}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 1, flexWrap: 'wrap' }}>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{post.time}</Text>
                    <View style={{ backgroundColor: post.visibility === 'Public' ? '#5A8A6E22' : C.surfacePressed, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 1 }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: post.visibility === 'Public' ? '#5A8A6E' : C.secondary }}>{post.visibility}</Text>
                    </View>
                    {post.pinned && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                        <IconSymbol name='pin.fill' size={10} color={C.secondary} />
                        <Text style={{ fontSize: 10, fontWeight: '700', color: C.secondary }}>Pinned</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                  <IconSymbol name='ellipsis' size={18} color={C.secondary} />
                </Pressable>
              </View>
              <Text style={{ fontSize: 15, color: C.label, paddingHorizontal: 14, paddingBottom: 10, lineHeight: 22 }}>{post.text}</Text>
              {/* Engagement stats */}
              <View style={{ flexDirection: 'row', gap: 16, paddingHorizontal: 14, paddingBottom: 8 }}>
                {[
                  { icon: 'eye', value: post.views >= 1000 ? (post.views / 1000).toFixed(1) + 'K' : String(post.views) },
                  { icon: 'heart', value: String(post.likes + (ceoLiked.has(post.id) ? 1 : 0)) },
                  { icon: 'bubble.right', value: String(post.comments) },
                  { icon: 'paperplane', value: String(post.shares) },
                ].map(stat => (
                  <View key={stat.icon} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <IconSymbol name={stat.icon as any} size={13} color={C.muted} />
                    <Text style={{ fontSize: 12, color: C.muted }}>{stat.value}</Text>
                  </View>
                ))}
              </View>
              {/* Action row */}
              <View style={{ flexDirection: 'row', gap: 20, paddingHorizontal: 14, paddingBottom: 12 }}>
                <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCeoLiked(s => { const n = new Set(s); if (n.has(post.id)) n.delete(post.id); else n.add(post.id); return n; }); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <IconSymbol name={ceoLiked.has(post.id) ? 'heart.fill' : 'heart'} size={18} color={ceoLiked.has(post.id) ? C.red : C.secondary} />
                  <Text style={{ fontSize: 13, color: C.secondary }}>{post.likes + (ceoLiked.has(post.id) ? 1 : 0)}</Text>
                </Pressable>
                <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <IconSymbol name='bubble.right' size={18} color={C.secondary} />
                  <Text style={{ fontSize: 13, color: C.secondary }}>{post.comments}</Text>
                </Pressable>
                {post.pinned ? (
                  <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <IconSymbol name='pin.fill' size={15} color={C.label} />
                    <Text style={{ fontSize: 13, color: C.label, fontWeight: '600' }}>Pinned</Text>
                  </Pressable>
) : (
                  <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <IconSymbol name='pin' size={15} color={C.secondary} />
                    <Text style={{ fontSize: 13, color: C.secondary }}>Pin</Text>
                  </Pressable>
)  }
                <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <IconSymbol name='pencil' size={15} color={C.secondary} />
                  <Text style={{ fontSize: 13, color: C.secondary }}>Edit</Text>
                </Pressable>
                <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <IconSymbol name='trash' size={15} color={C.secondary} />
                  <Text style={{ fontSize: 13, color: C.secondary }}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
      {/* ANNOUNCEMENTS */}
      {bizTab === "Announcements" && (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 12, paddingBottom: 120 }}>
          <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} style={({ pressed }) => ({ marginHorizontal: 14, marginBottom: 20, backgroundColor: C.label, borderRadius: 14, paddingVertical: 14, alignItems: 'center', opacity: pressed ? 0.8 : 1 })}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.bg }}>+ Schedule Announcement</Text>
          </Pressable>
          {BIZ_ANNOUNCEMENTS.map(ann => (
            <View key={ann.id} style={{ marginHorizontal: 14, marginBottom: 12, backgroundColor: C.surface, borderRadius: 16, padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, flex: 1, marginRight: 8 }}>{ann.title}</Text>
                <View style={{ backgroundColor: C.surfacePressed, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: C.secondary }}>{ann.distribution}</Text>
                </View>
              </View>
              <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 10, lineHeight: 18 }}>{ann.body}</Text>
              <Text style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Published {ann.date} · {ann.readCount.toLocaleString()} reads</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {ann.pushSent ? (
                  <View style={{ backgroundColor: C.surfacePressed, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary }}>Push Sent</Text>
                  </View>
) : (
                  <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} style={({ pressed }) => ({ backgroundColor: pressed ? C.surfacePressed : C.label, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 })}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: C.bg }}>Send Push</Text>
                  </Pressable>
)  }
                <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={({ pressed }) => ({ backgroundColor: pressed ? C.surfacePressed : 'transparent', borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 })}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary }}>Edit</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
      {/* INTERNAL */}
      {bizTab === "Internal" && (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 12, paddingBottom: 120 }}>
          <View style={{ marginHorizontal: 14, marginBottom: 12, backgroundColor: C.surfacePressed, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <IconSymbol name='lock.fill' size={13} color={C.secondary} />
            <Text style={{ fontSize: 13, color: C.secondary }}>Visible to team members only</Text>
          </View>
          <View style={{ marginHorizontal: 14, marginBottom: 14, backgroundColor: C.surface, borderRadius: 16, padding: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: C.bg, fontWeight: '700', fontSize: 13 }}>SK</Text>
              </View>
              <View style={{ flex: 1, height: 36, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, alignItems: 'flex-start', justifyContent: 'center', paddingHorizontal: 14 }}>
                <Text style={{ fontSize: 14, color: C.muted }}>Share with the team...</Text>
              </View>
            </View>
          </View>
          {BIZ_INTERNAL_POSTS.map(post => (
            <View key={post.id} style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6, gap: 10 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: C.bg, fontWeight: '700', fontSize: 13 }}>{post.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{post.author}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{post.time}</Text>
                </View>
              </View>
              <Text style={{ fontSize: 15, color: C.label, paddingHorizontal: 14, paddingBottom: 10, lineHeight: 22 }}>{post.text}</Text>
              <View style={{ flexDirection: 'row', gap: 20, paddingHorizontal: 14, paddingBottom: 12 }}>
                <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <IconSymbol name='heart' size={18} color={C.secondary} />
                  <Text style={{ fontSize: 13, color: C.secondary }}>{post.likes}</Text>
                </Pressable>
                <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <IconSymbol name='bubble.right' size={18} color={C.secondary} />
                  <Text style={{ fontSize: 13, color: C.secondary }}>{post.comments}</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

// ── Business Customer: Company updates feed ────────────────────────────

const BIZ_CUSTOMER_POSTS = [
  { id: 'bcu1', author: 'KaNeXT LLC', initials: 'KN', time: '1h', tag: 'Product Update', tagColor: '#5A8A6E', text: 'KaNeXT OS V2 is live. New intelligence features include real-time corpus updates, prompt caching, and a redesigned Nexus evaluation protocol. Upgrade available now.', likes: 187, comments: 43 },
  { id: 'bcu2', author: 'KaNeXT LLC', initials: 'KN', time: '3h', tag: 'Partnership', tagColor: '#B8943E', text: 'We have officially partnered with Lincoln University Oakland to pilot KaNeXT Education Mode. Building technology that serves HBCUs is a priority for us.', likes: 94, comments: 21 },
  { id: 'bcu3', author: 'David Mensah', initials: 'DM', time: '6h', tag: 'Client Story', tagColor: '#9C9790', text: 'KaNeXT completely changed how we manage our athletic program. The intelligence features alone saved us 10 hours a week. — David Mensah, AD at Westfield College', likes: 312, comments: 58 },
  { id: 'bcu4', author: 'KaNeXT LLC', initials: 'KN', time: '2d', tag: 'Clients Only', tagColor: '#9C9790', text: 'Client exclusive: Early access to Sports Mode v2.1 now open for current subscribers. Request access from your account dashboard.', likes: 67, comments: 14 },
];

const BIZ_BLOG_CARDS = [
  { id: 'bb1', title: 'How KaNeXT Builds Intelligence Into Every Mode', date: 'Mar 30', readTime: '4 min' },
  { id: 'bb2', title: 'NAIA vs NCAA: What Athletic Directors Need to Know in 2026', date: 'Mar 22', readTime: '6 min' },
  { id: 'bb3', title: 'The Case for Unified OS Platforms in Modern Organizations', date: 'Mar 15', readTime: '5 min' },
];

function BusinessCustomerSocialView({
  C, insets, role, cycleRole, accent,
}: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  role: string;
  cycleRole: () => void;
  accent: string;
}) {
  const [custLiked, setCustLiked] = useState(new Set() as Set<string>);
  const TOP_BAR_H = 52;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top bar */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, height: insets.top + TOP_BAR_H, paddingTop: insets.top, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <IconSymbol name='line.3.horizontal' size={22} color={C.label} />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>Updates</Text>
        </View>
        <RolePill role={role} onPress={cycleRole} accentColor={accent} isPrimary={false} />
      </View>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 12, paddingBottom: 120 }}>
        {BIZ_CUSTOMER_POSTS.map(post => (
          <View key={post.id} style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6, gap: 10 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: C.bg, fontWeight: '700', fontSize: 13 }}>{post.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{post.author}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 1 }}>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{post.time}</Text>
                  <View style={{ backgroundColor: post.tagColor + "22", borderRadius: 5, paddingHorizontal: 6, paddingVertical: 1 }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: post.tagColor }}>{post.tag}</Text>
                  </View>
                </View>
              </View>
            </View>
            <Text style={{ fontSize: 15, color: C.label, paddingHorizontal: 14, paddingBottom: 10, lineHeight: 22 }}>{post.text}</Text>
            <View style={{ flexDirection: 'row', gap: 20, paddingHorizontal: 14, paddingBottom: 12 }}>
              <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCustLiked(s => { const n = new Set(s); if (n.has(post.id)) n.delete(post.id); else n.add(post.id); return n; }); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <IconSymbol name={custLiked.has(post.id) ? 'heart.fill' : 'heart'} size={18} color={custLiked.has(post.id) ? C.red : C.secondary} />
                <Text style={{ fontSize: 13, color: C.secondary }}>{post.likes + (custLiked.has(post.id) ? 1 : 0)}</Text>
              </Pressable>
              <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <IconSymbol name='bubble.right' size={18} color={C.secondary} />
                <Text style={{ fontSize: 13, color: C.secondary }}>{post.comments}</Text>
              </Pressable>
            </View>
          </View>
        ))}
        <Text style={{ fontSize: 11, color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 14, marginTop: 20, marginBottom: 10 }}>FROM THE BLOG</Text>
        {BIZ_BLOG_CARDS.map(card => (
          <Pressable key={card.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={({ pressed }) => ({ marginHorizontal: 14, marginBottom: 8, backgroundColor: pressed ? C.surfacePressed : C.surface, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 })}>
            <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: C.surfacePressed, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IconSymbol name='doc.text' size={20} color={C.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, lineHeight: 19 }}>{card.title}</Text>
              <Text style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{card.date} · {card.readTime} read</Text>
            </View>
            <IconSymbol name='chevron.right' size={14} color={C.muted} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

// ── Social Screen (main) ──────────────────────────────────────────────────────

// ── Personal Owner: Creator Feed View ────────────────────────────────────────

type OwnerSocialTab = 'Grid' | 'Reels' | 'KTV';

// ── Unified feed posts for Personal Owner/Subscriber ─────────────────────────

type UnifiedPost = FeedPost & { visibility?: string; isScheduled?: boolean; scheduledTime?: string };

const _NOW = new Date('2026-04-06T18:00:00');

const UNIFIED_FEED_POSTS: UnifiedPost[] = [
  {
    id: 'uf1',
    author: { id: 'sammyk', name: 'Sammy Kalejaiye', username: '@sammyk', initials: 'SK' },
    media: [{ type: 'image', uri: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=600&fit=crop&q=80', aspectRatio: 1 }],
    caption: 'Just shipped a new feature in KaNeXT. The grind never stops.',
    likeCount: 1234, commentCount: 84, isLiked: false, isBookmarked: false,
    timestamp: new Date(_NOW.getTime() - 2 * 3600000),
    visibility: 'Public',
  },
  {
    id: 'uf2',
    author: { id: 'marcust', name: 'Marcus Thompson', username: '@marcust', initials: 'MT' },
    media: [{ type: 'image', uri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop&q=80', aspectRatio: 1 }],
    caption: '5 AM club hits different. New training program dropping next week.',
    likeCount: 892, commentCount: 42, isLiked: true, isBookmarked: false,
    timestamp: new Date(_NOW.getTime() - 5 * 3600000),
  },
  {
    id: 'uf3',
    author: { id: 'sammyk', name: 'Sammy Kalejaiye', username: '@sammyk', initials: 'SK' },
    media: [{ type: 'image', uri: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=600&fit=crop&q=80', aspectRatio: 0.667 }],
    caption: 'Behind the scenes from the content shoot today. Studio life.',
    likeCount: 892, commentCount: 61, isLiked: false, isBookmarked: true,
    timestamp: new Date(_NOW.getTime() - 24 * 3600000),
    visibility: 'Subscribers Only',
  },
  {
    id: 'uf4',
    author: { id: 'nikebball', name: 'Nike Basketball', username: '@nikebball', initials: 'NB' },
    media: [
      { type: 'image', uri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&q=80', aspectRatio: 1 },
      { type: 'image', uri: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=600&h=600&fit=crop&q=80', aspectRatio: 1 },
      { type: 'image', uri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=600&fit=crop&q=80', aspectRatio: 1 },
    ],
    caption: 'Summer collection just dropped. Built for the court, designed for the culture.',
    likeCount: 45200, commentCount: 1203, isLiked: false, isBookmarked: false,
    timestamp: new Date(_NOW.getTime() - 26 * 3600000),
  },
  {
    id: 'uf5',
    author: { id: 'lincolnu', name: 'Lincoln University', username: '@lincolnu', initials: 'LU' },
    media: [{ type: 'image', uri: 'https://images.unsplash.com/photo-1562774053-701939374585?w=600&h=600&fit=crop&q=80', aspectRatio: 1 }],
    caption: 'Spring enrollment is open. Join the Oaklander family.',
    likeCount: 234, commentCount: 18, isLiked: false, isBookmarked: false,
    timestamp: new Date(_NOW.getTime() - 48 * 3600000),
  },
  {
    id: 'uf6',
    author: { id: 'jordanw', name: 'Jordan Williams', username: '@jordanw', initials: 'JW' },
    media: [
      { type: 'image', uri: 'https://images.unsplash.com/photo-1546519638405-a9f61f93ab97?w=600&h=600&fit=crop&q=80', aspectRatio: 1 },
      { type: 'image', uri: 'https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=600&h=600&fit=crop&q=80', aspectRatio: 1 },
    ],
    caption: 'Community combine was incredible. 200+ athletes showed up.',
    likeCount: 2103, commentCount: 147, isLiked: true, isBookmarked: false,
    timestamp: new Date(_NOW.getTime() - 72 * 3600000),
  },
  {
    id: 'uf7',
    author: { id: 'sammyk', name: 'Sammy Kalejaiye', username: '@sammyk', initials: 'SK' },
    media: [{ type: 'image', uri: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&h=600&fit=crop&q=80', aspectRatio: 1 }],
    caption: 'My morning routine that changed everything — full breakdown',
    likeCount: 0, commentCount: 0, isLiked: false, isBookmarked: false,
    timestamp: new Date('2026-04-07T09:00:00'),
    isScheduled: true,
    scheduledTime: 'Apr 7 · 9:00 AM',
  },
];

// ── Scheduled post card ───────────────────────────────────────────────────────

function ScheduledPostCard({ post, C }: { post: UnifiedPost; C: ComponentColors }) {
  const { width: screenWidth } = useWindowDimensions();
  return (
    <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8, gap: 10 }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: C.bg, fontWeight: '700', fontSize: 13 }}>SK</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{post.author.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <Text style={{ fontSize: 12, color: C.secondary }}>{post.scheduledTime}</Text>
            <View style={{ backgroundColor: '#B8943E22', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#B8943E' }}>Scheduled</Text>
            </View>
          </View>
        </View>
      </View>
      {post.media.length > 0 && (
        <View>
          <Image source={{ uri: post.media[0].uri }} style={{ width: screenWidth, height: screenWidth * (post.media[0].aspectRatio ?? 1) }} resizeMode="cover" />
          <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ backgroundColor: '#B8943E', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>Scheduled · {post.scheduledTime}</Text>
            </View>
          </View>
        </View>
      )}
      <Text style={{ fontSize: 15, color: C.label, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 14, lineHeight: 22 }}>{post.caption}</Text>
    </View>
  );
}

function PersonalOwnerSocialView({
  C, insets, role, cycleRole, accent, router,
}: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  role: string;
  cycleRole: () => void;
  accent: string;
  router: ReturnType<typeof useRouter>;
}) {
  const { view: viewParam } = useLocalSearchParams<{ view?: string }>();
  const [ownerTab, setOwnerTab] = useState<OwnerSocialTab>('Grid');
  const [ownerReelsLiked, setOwnerReelsLiked] = useState<Set<string>>(new Set());
  const [ownerReelsBookmarked, setOwnerReelsBookmarked] = useState<Set<string>>(new Set());
  const { width: SCREEN_W } = useWindowDimensions();
  const GRID_CELL = Math.floor((SCREEN_W - 2) / 3);
  const TOP_BAR_H = 52;
  const topBarH = insets.top + TOP_BAR_H;

  const [fullscreenReelIdx, setFullscreenReelIdx] = useState<number | null>(null);
  const [fullscreenPostIdx, setFullscreenPostIdx] = useState<number | null>(null);
  const [ktvPlayerIdx, setKtvPlayerIdx] = useState<number | null>(null);
  const [highlightViewerIdx, setHighlightViewerIdx] = useState<number | null>(null);
  const [viewedHighlights, setViewedHighlights]     = useState<Set<string>>(new Set());
  const [storySlideIdx, setStorySlideIdx]           = useState(0);
  const storyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ownerReels = useMemo(() => getReels('personal'), []);

  const KTV_VIDEOS = [
    { id: 'ktv1', seed: 'ktv-v01', title: 'Building KaNeXT: The Origin Story', desc: 'From idea to product — how we built the operating system for institutions.', duration: '18:42', views: '12.4K' },
    { id: 'ktv2', seed: 'ktv-v02', title: 'RBAC Deep Dive: Role-Based Access Control', desc: 'How the permission system works across all 5 modes and 7 universal roles.', duration: '24:15', views: '8.7K' },
    { id: 'ktv3', seed: 'ktv-v03', title: 'Day in the Life: Founder Edition', desc: 'Early mornings, product decisions, and the grind nobody sees.', duration: '12:08', views: '21.3K' },
    { id: 'ktv4', seed: 'ktv-v04', title: 'Sports Tech & Player Analytics', desc: 'How top programs use data to evaluate and recruit talent.', duration: '31:50', views: '6.2K' },
    { id: 'ktv5', seed: 'ktv-v05', title: 'Monetize Your Brand in 2026', desc: 'Subscriptions, live events, digital products — what actually works.', duration: '19:33', views: '15.9K' },
    { id: 'ktv6', seed: 'ktv-v06', title: 'Community-Led Growth Explained', desc: 'Why the future of institutions is community-first, not product-first.', duration: '14:22', views: '4.8K' },
    { id: 'ktv7', seed: 'ktv-v07', title: 'Nexus AI: Building With Claude', desc: 'How we integrated Claude into KaNeXT Nexus and what we learned.', duration: '27:44', views: '9.1K' },
    { id: 'ktv8', seed: 'ktv-v08', title: 'Education Mode Walkthrough', desc: 'Full demo of President, Dean, Faculty, and Student experiences.', duration: '22:17', views: '3.5K' },
    { id: 'ktv9', seed: 'ktv-v09', title: 'How to Build in Public the Right Way', desc: 'Transparency, trust, and traction — lessons from shipping in the open.', duration: '16:55', views: '18.2K' },
  ];

  const SOCIAL_GRID_TABS = [
    { key: 'Grid'  as const, icon: 'square.grid.3x3.fill' },
    { key: 'Reels' as const, icon: 'play.square.fill'      },
    { key: 'KTV'   as const, icon: 'tv.fill'               },
  ];
  const HIGHLIGHTS_DATA = [
    { id: 'culture',  label: 'Culture',  seed: 'hl-culture'  },
    { id: 'coaching', label: 'Coaching', seed: 'hl-coaching' },
    { id: 'clips',    label: 'Clips',    seed: 'hl-clips'    },
    { id: 'bts',      label: 'BTS',      seed: 'hl-bts'      },
  ];
  const GRID_SEEDS = ['gp01','gp02','gp03','gp04','gp05','gp06','gp07','gp08','gp09'];
  const REEL_SEEDS = ['rs01','rs02','rs03','rs04','rs05','rs06','rs07','rs08','rs09'];

  const HIGHLIGHTS_STORIES: Record<string, string[]> = {
    culture:  ['hs-c1', 'hs-c2', 'hs-c3'],
    coaching: ['hs-co1', 'hs-co2', 'hs-co3', 'hs-co4'],
    clips:    ['hs-cl1', 'hs-cl2', 'hs-cl3'],
    bts:      ['hs-b1', 'hs-b2', 'hs-b3', 'hs-b4', 'hs-b5'],
  };

  React.useEffect(() => {
    if (viewParam && ['Grid', 'Reels', 'KTV'].includes(viewParam)) {
      setOwnerTab(viewParam as OwnerSocialTab);
    }
  }, [viewParam]);

  React.useEffect(() => {
    if (highlightViewerIdx === null) {
      if (storyTimerRef.current) clearTimeout(storyTimerRef.current);
      return;
    }
    const h = HIGHLIGHTS_DATA[highlightViewerIdx];
    const slides = HIGHLIGHTS_STORIES[h.id] ?? [];
    if (storyTimerRef.current) clearTimeout(storyTimerRef.current);
    storyTimerRef.current = setTimeout(() => {
      if (storySlideIdx < slides.length - 1) {
        setStorySlideIdx(s => s + 1);
      } else {
        setViewedHighlights(prev => new Set([...prev, h.id]));
        setHighlightViewerIdx(null);
        setStorySlideIdx(0);
      }
    }, 5000);
    return () => { if (storyTimerRef.current) clearTimeout(storyTimerRef.current); };
  }, [highlightViewerIdx, storySlideIdx]);

  const profileHeader = (
    <>
      {/* Avatar + Stats + Bio */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 14 }}>
          <Pressable>
            <Image
              source={{ uri: 'https://picsum.photos/seed/kanext-avatar/200/200' }}
              style={{ width: 86, height: 86, borderRadius: 43, borderWidth: 2.5, borderColor: C.separator }}
              resizeMode="cover"
            />
            <View style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.bg }}>
              <IconSymbol name="plus" size={11} color={C.bg} />
            </View>
          </Pressable>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around' }}>
            {[
              { value: '13',    label: 'posts'       },
              { value: '1,247', label: 'followers'   },
              { value: '247',   label: 'subscribers' },
            ].map(stat => (
              <Pressable key={stat.label} style={{ alignItems: 'center' }} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                <Text style={{ fontSize: 17, fontWeight: '700', color: C.label }}>{stat.value}</Text>
                <Text style={{ fontSize: 12, color: C.label, marginTop: 1 }}>{stat.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, marginBottom: 2 }}>Sammy Kalejaiye</Text>
        <Text style={{ fontSize: 13, fontWeight: '600', color: C.label, marginBottom: 3, opacity: 0.75 }}>Creator · Coach</Text>
        <Text style={{ fontSize: 13, color: C.label, lineHeight: 18, marginBottom: 4 }}>
          {"Building the operating system for institutions.\nSports · Education · Business · Community."}
        </Text>
        <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 5 }}>#KaNeXT #BuildInPublic #EarnEverything</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <IconSymbol name="link" size={12} color={C.secondary} />
          <Text style={{ fontSize: 13, fontWeight: '500', color: C.label }}>kanext.io/@sammyk</Text>
        </View>
      </View>

      {/* Analytics Dashboard card */}
      <Pressable
        style={({ pressed }) => [{ marginHorizontal: 16, marginBottom: 10, backgroundColor: C.surface, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, pressed && { opacity: 0.75 }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/(main)/social/analytics' as any); }}
      >
        <View>
          <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, marginBottom: 2 }}>Analytics Dashboard</Text>
          <Text style={{ fontSize: 12, color: C.secondary }}>135 profile views in the last 30 days.</Text>
        </View>
        <IconSymbol name="chevron.right" size={14} color={C.secondary} />
      </Pressable>

      {/* CTA Buttons */}
      <View style={{ flexDirection: 'row', gap: 8, marginHorizontal: 16, marginBottom: 16 }}>
        <Pressable style={({ pressed }) => [{ flex: 1, height: 34, borderRadius: 10, backgroundColor: C.surface, borderWidth: 1, borderColor: C.separator, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.7 }]}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Edit profile</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [{ flex: 1, height: 34, borderRadius: 10, backgroundColor: C.surface, borderWidth: 1, borderColor: C.separator, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.7 }]}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Share profile</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [{ width: 34, height: 34, borderRadius: 10, backgroundColor: C.surface, borderWidth: 1, borderColor: C.separator, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.7 }]}>
          <IconSymbol name="person.badge.plus" size={16} color={C.label} />
        </Pressable>
      </View>

      {/* Highlights */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 14, paddingBottom: 4 }} style={{ marginBottom: 0 }}>
        {/* New story button */}
        <Pressable
          style={{ alignItems: 'center', gap: 6 }}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <View style={{ width: 62, height: 62, borderRadius: 31, borderWidth: 1.5, borderColor: C.separator, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' }}>
            <IconSymbol name="plus" size={22} color={C.label} />
          </View>
          <Text style={{ fontSize: 11, color: C.label }}>New</Text>
        </Pressable>

        {HIGHLIGHTS_DATA.map((h, hIdx) => {
          const viewed = viewedHighlights.has(h.id);
          return (
            <Pressable
              key={h.id}
              style={{ alignItems: 'center', gap: 6 }}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setHighlightViewerIdx(hIdx);
                setStorySlideIdx(0);
              }}
            >
              <View style={{ width: 62, height: 62, borderRadius: 31, borderWidth: 2.5, borderColor: viewed ? C.separator : C.label, overflow: 'hidden' }}>
                <Image source={{ uri: `https://picsum.photos/seed/${h.seed}/200/200` }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              </View>
              <Text style={{ fontSize: 11, color: C.label }} numberOfLines={1}>{h.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Content type tabs */}
      <View style={{ flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator, marginTop: 16 }}>
        {SOCIAL_GRID_TABS.map(({ key, icon }) => {
          const active = ownerTab === key;
          return (
            <Pressable
              key={key}
              onPress={() => { Haptics.selectionAsync(); setOwnerTab(key); }}
              style={[{ flex: 1, alignItems: 'center', paddingVertical: 11 }, active ? { borderBottomWidth: 1.5, borderBottomColor: C.label } : {}]}
            >
              <IconSymbol name={icon as any} size={22} color={active ? C.label : C.muted} />
            </Pressable>
          );
        })}
      </View>
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* Top bar */}
      <View style={{ height: topBarH, paddingTop: insets.top, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <KMenuButton />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>@sammyk</Text>
        </View>
        <View style={{ minWidth: 40, height: 36, alignItems: 'flex-end', justifyContent: 'center' }}>
          <RolePill role={role} onPress={cycleRole} accentColor={accent} isPrimary />
        </View>
      </View>

      {/* ── Grid / Reels / KTV scroll ── */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {profileHeader}

        {/* Photo grid */}
        {ownerTab === 'Grid' && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}>
            {GRID_SEEDS.map((seed, i) => (
              <Pressable key={seed} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFullscreenPostIdx(i); }}>
                <Image source={{ uri: `https://picsum.photos/seed/${seed}/400/400` }} style={{ width: GRID_CELL, height: GRID_CELL }} resizeMode="cover" />
                {i < 2 && (
                  <View style={{ position: 'absolute', top: 6, right: 6 }}>
                    <IconSymbol name="pin.fill" size={12} color="#fff" />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        )}

        {/* Reels thumbnail grid */}
        {ownerTab === 'Reels' && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}>
            {REEL_SEEDS.map((seed, i) => (
              <Pressable key={seed} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFullscreenReelIdx(i); }}>
                <Image source={{ uri: `https://picsum.photos/seed/${seed}/400/400` }} style={{ width: GRID_CELL, height: GRID_CELL }} resizeMode="cover" />
                <Text style={{ position: 'absolute', bottom: 6, left: 6, fontSize: 11, fontWeight: '600', color: '#fff' }}>0:{String(15 + i * 7).padStart(2, '0')}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* KTV thumbnail grid */}
        {ownerTab === 'KTV' && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}>
            {KTV_VIDEOS.map((vid, i) => (
              <Pressable key={vid.id} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setKtvPlayerIdx(i); }} style={{ position: 'relative' }}>
                <Image source={{ uri: `https://picsum.photos/seed/${vid.seed}/400/300` }} style={{ width: GRID_CELL, height: Math.floor(GRID_CELL * 0.75) }} resizeMode="cover" />
                {/* Bottom gradient overlay */}
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 32, backgroundColor: 'rgba(0,0,0,0.45)' }} />
                {/* Views — bottom left */}
                <View style={{ position: 'absolute', bottom: 5, left: 5, flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <IconSymbol name="eye.fill" size={9} color="#fff" />
                  <Text style={{ fontSize: 10, fontWeight: '600', color: '#fff' }}>{vid.views}</Text>
                </View>
                {/* Duration — bottom right */}
                <Text style={{ position: 'absolute', bottom: 5, right: 5, fontSize: 10, fontWeight: '600', color: '#fff' }}>{vid.duration}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── Fullscreen Reel overlay ── */}
      {fullscreenReelIdx !== null && (
        <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 100, backgroundColor: '#000' }}>
          <ReelsPage
            reels={ownerReels}
            likedReels={ownerReelsLiked}
            bookmarkedReels={ownerReelsBookmarked}
            onLikeToggle={(id) => setOwnerReelsLiked(s => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; })}
            onBookmarkToggle={(id) => setOwnerReelsBookmarked(s => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; })}
          />
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFullscreenReelIdx(null); }}
            style={{ position: 'absolute', top: insets.top + 12, left: 16, zIndex: 101, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' }}
          >
            <IconSymbol name="xmark" size={16} color="#fff" />
          </Pressable>
        </View>
      )}

      {/* ── Story / Highlight Viewer overlay ── */}
      {highlightViewerIdx !== null && (() => {
        const h = HIGHLIGHTS_DATA[highlightViewerIdx];
        const slides = HIGHLIGHTS_STORIES[h.id] ?? [];
        const totalSlides = slides.length;
        const SCREEN_H = SCREEN_W * 2.16; // approx full-screen story ratio

        return (
          <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 200, backgroundColor: '#000' }}>
            {/* Story image */}
            <Image
              source={{ uri: `https://picsum.photos/seed/${slides[storySlideIdx]}/600/1067` }}
              style={{ width: SCREEN_W, height: '100%', position: 'absolute' }}
              resizeMode="cover"
            />
            {/* Dark gradient at top */}
            <LinearGradient
              colors={['rgba(0,0,0,0.55)', 'transparent']}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120 }}
            />
            {/* Progress bars */}
            <View style={{ position: 'absolute', top: insets.top + 10, left: 10, right: 10, flexDirection: 'row', gap: 4 }}>
              {slides.map((_, i) => (
                <View key={i} style={{ flex: 1, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.35)', overflow: 'hidden' }}>
                  {i < storySlideIdx && (
                    <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: '#fff' }} />
                  )}
                  {i === storySlideIdx && (
                    <View
                      style={{ position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: '#fff', width: '100%' }}
                    />
                  )}
                </View>
              ))}
            </View>
            {/* Tap zones: left = prev, right = next */}
            <View style={{ ...StyleSheet.absoluteFillObject, flexDirection: 'row', marginTop: 80 }}>
              <Pressable
                style={{ flex: 1 }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (storySlideIdx > 0) {
                    setStorySlideIdx(s => s - 1);
                  } else {
                    // Go to previous highlight
                    if (highlightViewerIdx > 0) {
                      setHighlightViewerIdx(i => (i ?? 1) - 1);
                      setStorySlideIdx(0);
                    } else {
                      setViewedHighlights(prev => new Set([...prev, h.id]));
                      setHighlightViewerIdx(null);
                      setStorySlideIdx(0);
                    }
                  }
                }}
              />
              <Pressable
                style={{ flex: 1 }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (storySlideIdx < totalSlides - 1) {
                    setStorySlideIdx(s => s + 1);
                  } else {
                    setViewedHighlights(prev => new Set([...prev, h.id]));
                    // Go to next highlight
                    if (highlightViewerIdx < HIGHLIGHTS_DATA.length - 1) {
                      setHighlightViewerIdx(i => (i ?? 0) + 1);
                      setStorySlideIdx(0);
                    } else {
                      setHighlightViewerIdx(null);
                      setStorySlideIdx(0);
                    }
                  }
                }}
              />
            </View>
            {/* Top bar — rendered after tap zones so it receives touch events */}
            <View style={{ position: 'absolute', top: insets.top + 24, left: 14, right: 14, flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: '#fff', overflow: 'hidden', marginRight: 10 }}>
                <Image source={{ uri: 'https://picsum.photos/seed/kanext-avatar/200/200' }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              </View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff', flex: 1 }}>{h.label}</Text>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (storyTimerRef.current) clearTimeout(storyTimerRef.current);
                  setViewedHighlights(prev => new Set([...prev, h.id]));
                  setHighlightViewerIdx(null);
                  setStorySlideIdx(0);
                }}
                style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
              >
                <IconSymbol name="xmark" size={18} color="#fff" />
              </Pressable>
            </View>
          </View>
        );
      })()}

      {/* ── KTV Player overlay ── */}
      {ktvPlayerIdx !== null && (() => {
        const vid = KTV_VIDEOS[ktvPlayerIdx];
        return (
          <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 100, backgroundColor: C.bg }}>
            {/* Top bar */}
            <View style={{ height: topBarH, paddingTop: insets.top, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
              <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setKtvPlayerIdx(null); }} style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
                <IconSymbol name="chevron.left" size={22} color={C.label} />
              </Pressable>
              <Text style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: C.label }} numberOfLines={1}>KTV</Text>
              <View style={{ width: 40 }} />
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
              {/* Video player */}
              <View style={{ position: 'relative', backgroundColor: '#000', width: SCREEN_W, height: Math.floor(SCREEN_W * 9 / 16) }}>
                <Image source={{ uri: `https://picsum.photos/seed/${vid.seed}/800/450` }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                <View style={{ ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' }}>
                    <IconSymbol name="play.fill" size={22} color="#fff" />
                  </View>
                </View>
                <Text style={{ position: 'absolute', bottom: 8, right: 10, fontSize: 12, fontWeight: '600', color: '#fff', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 }}>{vid.duration}</Text>
              </View>
              {/* Title + meta */}
              <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: C.label, marginBottom: 6, lineHeight: 22 }}>{vid.title}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <IconSymbol name="eye.fill" size={12} color={C.secondary} />
                    <Text style={{ fontSize: 12, color: C.secondary }}>{vid.views} views</Text>
                  </View>
                  <Text style={{ fontSize: 12, color: C.secondary }}>2 days ago</Text>
                </View>
                <Text style={{ fontSize: 13, color: C.label, lineHeight: 19, opacity: 0.8 }}>{vid.desc}</Text>
              </View>
              {/* Divider */}
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginHorizontal: 16, marginVertical: 4 }} />
              {/* Like / Comment / Share */}
              <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14 }}>
                {[
                  { icon: 'heart',       label: '1.2K' },
                  { icon: 'bubble.right', label: '84'   },
                  { icon: 'paperplane',  label: 'Share' },
                ].map(({ icon, label }) => (
                  <Pressable
                    key={icon}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    style={{ flex: 1, alignItems: 'center', gap: 4 }}
                  >
                    <IconSymbol name={icon as any} size={22} color={C.label} />
                    <Text style={{ fontSize: 11, color: C.secondary }}>{label}</Text>
                  </Pressable>
                ))}
              </View>
              {/* Divider */}
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator }} />
              {/* More from @sammyk */}
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10 }}>More from @sammyk</Text>
              {KTV_VIDEOS.filter((_, i) => i !== ktvPlayerIdx).map((other, i) => (
                <Pressable
                  key={other.id}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setKtvPlayerIdx(KTV_VIDEOS.indexOf(other)); }}
                  style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 14, alignItems: 'flex-start' }}
                >
                  <View style={{ position: 'relative' }}>
                    <Image source={{ uri: `https://picsum.photos/seed/${other.seed}/300/200` }} style={{ width: 120, height: 68, borderRadius: 6 }} resizeMode="cover" />
                    <Text style={{ position: 'absolute', bottom: 4, right: 4, fontSize: 10, fontWeight: '600', color: '#fff', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3 }}>{other.duration}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: C.label, lineHeight: 18, marginBottom: 4 }} numberOfLines={2}>{other.title}</Text>
                    <Text style={{ fontSize: 11, color: C.secondary }}>{other.views} views</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        );
      })()}

      {/* ── Post detail overlay ── */}
      {fullscreenPostIdx !== null && (
        <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 100, backgroundColor: C.bg }}>
          {/* Back bar */}
          <View style={{ height: topBarH, paddingTop: insets.top, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFullscreenPostIdx(null); }} style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
              <IconSymbol name="chevron.left" size={22} color={C.label} />
            </Pressable>
            <Text style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: C.label }}>Posts</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
            {[...GRID_SEEDS.slice(fullscreenPostIdx), ...GRID_SEEDS.slice(0, fullscreenPostIdx)].map((seed, i) => (
              <View key={seed} style={{ marginBottom: 4 }}>
                {/* Post header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 10 }}>
                  <Image source={{ uri: 'https://picsum.photos/seed/kanext-avatar/200/200' }} style={{ width: 32, height: 32, borderRadius: 16 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>sammyk</Text>
                    <Text style={{ fontSize: 11, color: C.secondary }}>{i === 0 ? 'Just now' : `${i + 1}d ago`}</Text>
                  </View>
                  <IconSymbol name="ellipsis" size={18} color={C.label} />
                </View>
                {/* Post image */}
                <Image source={{ uri: `https://picsum.photos/seed/${seed}/600/600` }} style={{ width: '100%', aspectRatio: 1 }} resizeMode="cover" />
                {/* Actions */}
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 12, gap: 18 }}>
                  <IconSymbol name="heart" size={26} color={C.label} />
                  <IconSymbol name="bubble.right" size={24} color={C.label} />
                  <IconSymbol name="paperplane" size={24} color={C.label} />
                  <View style={{ flex: 1 }} />
                  <IconSymbol name="bookmark" size={24} color={C.label} />
                </View>
                {/* Caption */}
                <View style={{ paddingHorizontal: 14, paddingTop: 8, paddingBottom: 12 }}>
                  <Text style={{ fontSize: 13, color: C.label }}><Text style={{ fontWeight: '700' }}>sammyk </Text>Building the operating system for institutions. 🏆 #KaNeXT</Text>
                </View>
                <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator }} />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

    </View>
  );
}

// ── Personal Subscriber: Follower Profile View ────────────────────────────────

type SubSocialTab = 'Grid' | 'Reels' | 'KTV';

function PersonalSubscriberSocialView({
  C, insets, role, cycleRole, accent,
}: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  role: string;
  cycleRole: () => void;
  accent: string;
}) {
  const router = useRouter();
  const { width: SCREEN_W } = useWindowDimensions();
  const GRID_CELL = Math.floor((SCREEN_W - 2) / 3);
  const TOP_BAR_H = 52;
  const topBarH = insets.top + TOP_BAR_H;

  const [subTab, setSubTab] = useState<SubSocialTab>('Grid');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Reel / Post / KTV overlay states
  const [fullscreenReelIdx, setFullscreenReelIdx] = useState<number | null>(null);
  const [fullscreenPostIdx, setFullscreenPostIdx] = useState<number | null>(null);
  const [ktvPlayerIdx, setKtvPlayerIdx] = useState<number | null>(null);

  // Story viewer states
  const [highlightViewerIdx, setHighlightViewerIdx] = useState<number | null>(null);
  const [viewedHighlights, setViewedHighlights] = useState<Set<string>>(new Set());
  const [storySlideIdx, setStorySlideIdx] = useState(0);
  const storyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const subReels = useMemo(() => getReels('personal'), []);

  // Subscriber-only content seeds (every 3rd grid item is locked unless subscribed)
  const GRID_SEEDS_SUB = ['gp01','gp02','gp03','gp04','gp05','gp06','gp07','gp08','gp09'];
  const LOCKED_INDICES = new Set([2, 5, 8]);

  const KTV_VIDEOS_SUB = [
    { id: 'ktv1', seed: 'ktv-v01', title: 'Building KaNeXT: The Origin Story',      desc: 'From idea to product.',                              duration: '18:42', views: '12.4K', locked: false },
    { id: 'ktv2', seed: 'ktv-v02', title: 'RBAC Deep Dive',                          desc: 'Role-based access control explained.',               duration: '24:15', views: '8.7K',  locked: true  },
    { id: 'ktv3', seed: 'ktv-v03', title: 'Day in the Life: Founder Edition',        desc: 'Early mornings and the grind nobody sees.',          duration: '12:08', views: '21.3K', locked: false },
    { id: 'ktv4', seed: 'ktv-v04', title: 'Sports Tech & Player Analytics',          desc: 'How top programs use data to recruit.',              duration: '31:50', views: '6.2K',  locked: true  },
    { id: 'ktv5', seed: 'ktv-v05', title: 'Monetize Your Brand in 2026',             desc: 'What actually works: subs, events, products.',       duration: '19:33', views: '15.9K', locked: false },
    { id: 'ktv6', seed: 'ktv-v06', title: 'Community-Led Growth Explained',          desc: 'Why the future of institutions is community-first.', duration: '14:22', views: '4.8K',  locked: true  },
    { id: 'ktv7', seed: 'ktv-v07', title: 'Nexus AI: Building With Claude',          desc: 'How we integrated Claude into KaNeXT Nexus.',        duration: '27:44', views: '9.1K',  locked: false },
    { id: 'ktv8', seed: 'ktv-v08', title: 'Education Mode Walkthrough',              desc: 'Full demo of President, Dean, Faculty, Student.',    duration: '22:17', views: '3.5K',  locked: true  },
    { id: 'ktv9', seed: 'ktv-v09', title: 'How to Build in Public the Right Way',   desc: 'Transparency, trust, and traction.',                 duration: '16:55', views: '18.2K', locked: false },
  ];

  const HIGHLIGHTS_DATA_SUB = [
    { id: 'culture',  label: 'Culture',  seed: 'hl-culture'  },
    { id: 'coaching', label: 'Coaching', seed: 'hl-coaching' },
    { id: 'clips',    label: 'Clips',    seed: 'hl-clips'    },
    { id: 'bts',      label: 'BTS',      seed: 'hl-bts'      },
  ];

  const HIGHLIGHTS_STORIES_SUB: Record<string, string[]> = {
    culture:  ['hs-c1', 'hs-c2', 'hs-c3'],
    coaching: ['hs-co1', 'hs-co2', 'hs-co3', 'hs-co4'],
    clips:    ['hs-cl1', 'hs-cl2', 'hs-cl3'],
    bts:      ['hs-b1', 'hs-b2', 'hs-b3', 'hs-b4', 'hs-b5'],
  };

  const REEL_SEEDS_SUB = ['rs01','rs02','rs03','rs04','rs05','rs06','rs07','rs08','rs09'];

  const SOCIAL_GRID_TABS_SUB = [
    { key: 'Grid'  as const, icon: 'square.grid.3x3.fill' },
    { key: 'Reels' as const, icon: 'play.square.fill'      },
    { key: 'KTV'   as const, icon: 'tv.fill'               },
  ];

  // Story auto-advance
  React.useEffect(() => {
    if (highlightViewerIdx === null) {
      if (storyTimerRef.current) clearTimeout(storyTimerRef.current);
      return;
    }
    const h = HIGHLIGHTS_DATA_SUB[highlightViewerIdx];
    const slides = HIGHLIGHTS_STORIES_SUB[h.id] ?? [];
    if (storyTimerRef.current) clearTimeout(storyTimerRef.current);
    storyTimerRef.current = setTimeout(() => {
      if (storySlideIdx < slides.length - 1) {
        setStorySlideIdx(s => s + 1);
      } else {
        setViewedHighlights(prev => new Set([...prev, h.id]));
        if (highlightViewerIdx < HIGHLIGHTS_DATA_SUB.length - 1) {
          setHighlightViewerIdx(i => (i ?? 0) + 1);
          setStorySlideIdx(0);
        } else {
          setHighlightViewerIdx(null);
          setStorySlideIdx(0);
        }
      }
    }, 5000);
    return () => { if (storyTimerRef.current) clearTimeout(storyTimerRef.current); };
  }, [highlightViewerIdx, storySlideIdx]);

  const profileHeader = (
    <>
      {/* Avatar + Stats + Bio */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 14 }}>
          <Image
            source={{ uri: 'https://picsum.photos/seed/kanext-avatar/200/200' }}
            style={{ width: 86, height: 86, borderRadius: 43, borderWidth: 2.5, borderColor: C.separator }}
            resizeMode="cover"
          />
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around' }}>
            {[
              { value: '13',    label: 'posts'       },
              { value: '1,247', label: 'followers'   },
              { value: '247',   label: 'subscribers' },
            ].map(stat => (
              <Pressable key={stat.label} style={{ alignItems: 'center' }} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                <Text style={{ fontSize: 17, fontWeight: '700', color: C.label }}>{stat.value}</Text>
                <Text style={{ fontSize: 12, color: C.label, marginTop: 1 }}>{stat.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, marginBottom: 2 }}>Sammy Kalejaiye</Text>
        <Text style={{ fontSize: 13, fontWeight: '600', color: C.label, marginBottom: 3, opacity: 0.75 }}>Creator · Coach</Text>
        <Text style={{ fontSize: 13, color: C.label, lineHeight: 18, marginBottom: 4 }}>
          {"Building the operating system for institutions.\nSports · Education · Business · Community."}
        </Text>
        <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 5 }}>#KaNeXT #BuildInPublic #EarnEverything</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <IconSymbol name="link" size={12} color={C.secondary} />
          <Text style={{ fontSize: 13, fontWeight: '500', color: C.label }}>kanext.io/@sammyk</Text>
        </View>
      </View>

      {/* Follow + Subscribe buttons */}
      <View style={{ flexDirection: 'row', gap: 8, marginHorizontal: 16, marginBottom: 16 }}>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setIsFollowing(f => !f); }}
          style={({ pressed }) => [{ flex: 1, height: 34, borderRadius: 10, backgroundColor: isFollowing ? 'transparent' : C.label, borderWidth: isFollowing ? 1 : 0, borderColor: C.separator, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.7 }]}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: isFollowing ? C.secondary : C.bg }}>{isFollowing ? 'Following' : 'Follow'}</Text>
        </Pressable>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setIsSubscribed(s => !s); }}
          style={({ pressed }) => [{ flex: 1, height: 34, borderRadius: 10, backgroundColor: isSubscribed ? 'transparent' : C.surface, borderWidth: 1, borderColor: C.separator, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.7 }]}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: isSubscribed ? C.secondary : C.label }}>{isSubscribed ? 'Subscribed' : 'Subscribe'}</Text>
        </Pressable>
        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          style={({ pressed }) => [{ width: 34, height: 34, borderRadius: 10, backgroundColor: C.surface, borderWidth: 1, borderColor: C.separator, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.7 }]}
        >
          <IconSymbol name="ellipsis" size={16} color={C.label} />
        </Pressable>
      </View>

      {/* Highlights — no "New" circle for followers */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 14, paddingBottom: 4 }} style={{ marginBottom: 0 }}>
        {HIGHLIGHTS_DATA_SUB.map((h, hIdx) => {
          const viewed = viewedHighlights.has(h.id);
          return (
            <Pressable
              key={h.id}
              style={{ alignItems: 'center', gap: 6 }}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setHighlightViewerIdx(hIdx);
                setStorySlideIdx(0);
              }}
            >
              <View style={{ width: 62, height: 62, borderRadius: 31, borderWidth: 2.5, borderColor: viewed ? C.separator : C.label, overflow: 'hidden' }}>
                <Image source={{ uri: `https://picsum.photos/seed/${h.seed}/200/200` }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              </View>
              <Text style={{ fontSize: 11, color: C.label }} numberOfLines={1}>{h.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Content type tabs */}
      <View style={{ flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator, marginTop: 16 }}>
        {SOCIAL_GRID_TABS_SUB.map(({ key, icon }) => {
          const active = subTab === key;
          return (
            <Pressable
              key={key}
              onPress={() => { Haptics.selectionAsync(); setSubTab(key); }}
              style={[{ flex: 1, alignItems: 'center', paddingVertical: 11 }, active ? { borderBottomWidth: 1.5, borderBottomColor: C.label } : {}]}
            >
              <IconSymbol name={icon as any} size={22} color={active ? C.label : C.muted} />
            </Pressable>
          );
        })}
      </View>
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top bar — K visible but not interactive for follower */}
      <View style={{ height: topBarH, paddingTop: insets.top, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
        <View style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <KMenuButton />
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>@sammyk</Text>
        </View>
        <View style={{ minWidth: 40, height: 36, alignItems: 'flex-end', justifyContent: 'center' }}>
          <RolePill role={role} onPress={cycleRole} accentColor={accent} isPrimary={false} />
        </View>
      </View>

      {/* Profile + Grid scroll */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {profileHeader}

        {/* Photo grid */}
        {subTab === 'Grid' && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}>
            {GRID_SEEDS_SUB.map((seed, i) => {
              const locked = LOCKED_INDICES.has(i) && !isSubscribed;
              return (
                <Pressable key={seed} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); if (!locked) setFullscreenPostIdx(i); }} style={{ position: 'relative' }}>
                  <Image source={{ uri: `https://picsum.photos/seed/${seed}/400/400` }} style={{ width: GRID_CELL, height: GRID_CELL }} resizeMode="cover" />
                  {locked && (
                    <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' }}>
                      <IconSymbol name="lock.fill" size={20} color="#fff" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Reels thumbnail grid */}
        {subTab === 'Reels' && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}>
            {REEL_SEEDS_SUB.map((seed, i) => (
              <Pressable key={seed} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFullscreenReelIdx(i); }}>
                <Image source={{ uri: `https://picsum.photos/seed/${seed}/400/400` }} style={{ width: GRID_CELL, height: GRID_CELL }} resizeMode="cover" />
                <Text style={{ position: 'absolute', bottom: 6, left: 6, fontSize: 11, fontWeight: '600', color: '#fff' }}>0:{String(15 + i * 7).padStart(2, '0')}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* KTV thumbnail grid */}
        {subTab === 'KTV' && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}>
            {KTV_VIDEOS_SUB.map((vid, i) => {
              const locked = vid.locked && !isSubscribed;
              return (
                <Pressable key={vid.id} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); if (!locked) setKtvPlayerIdx(i); }} style={{ position: 'relative' }}>
                  <Image source={{ uri: `https://picsum.photos/seed/${vid.seed}/400/300` }} style={{ width: GRID_CELL, height: Math.floor(GRID_CELL * 0.75) }} resizeMode="cover" />
                  {locked ? (
                    <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' }}>
                      <IconSymbol name="lock.fill" size={18} color="#fff" />
                    </View>
                  ) : (
                    <>
                      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 32, backgroundColor: 'rgba(0,0,0,0.45)' }} />
                      <View style={{ position: 'absolute', bottom: 5, left: 5, flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                        <IconSymbol name="eye.fill" size={9} color="#fff" />
                        <Text style={{ fontSize: 10, fontWeight: '600', color: '#fff' }}>{vid.views}</Text>
                      </View>
                      <Text style={{ position: 'absolute', bottom: 5, right: 5, fontSize: 10, fontWeight: '600', color: '#fff' }}>{vid.duration}</Text>
                    </>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ── Fullscreen Reel overlay ── */}
      {fullscreenReelIdx !== null && (
        <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 100, backgroundColor: '#000' }}>
          <ReelsPage
            reels={subReels}
            likedReels={new Set()}
            bookmarkedReels={new Set()}
            onLikeToggle={() => {}}
            onBookmarkToggle={() => {}}
          />
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFullscreenReelIdx(null); }}
            style={{ position: 'absolute', top: insets.top + 12, left: 16, zIndex: 101, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' }}
          >
            <IconSymbol name="xmark" size={16} color="#fff" />
          </Pressable>
        </View>
      )}

      {/* ── KTV Player overlay ── */}
      {ktvPlayerIdx !== null && (() => {
        const vid = KTV_VIDEOS_SUB[ktvPlayerIdx];
        return (
          <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 100, backgroundColor: C.bg }}>
            <View style={{ height: topBarH, paddingTop: insets.top, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
              <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setKtvPlayerIdx(null); }} style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
                <IconSymbol name="chevron.left" size={22} color={C.label} />
              </Pressable>
              <Text style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: C.label }} numberOfLines={1}>KTV</Text>
              <View style={{ width: 40 }} />
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
              <View style={{ position: 'relative', backgroundColor: '#000', width: SCREEN_W, height: Math.floor(SCREEN_W * 9 / 16) }}>
                <Image source={{ uri: `https://picsum.photos/seed/${vid.seed}/800/450` }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                <View style={{ ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' }}>
                    <IconSymbol name="play.fill" size={22} color="#fff" />
                  </View>
                </View>
                <Text style={{ position: 'absolute', bottom: 8, right: 10, fontSize: 12, fontWeight: '600', color: '#fff', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 }}>{vid.duration}</Text>
              </View>
              <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: C.label, marginBottom: 6, lineHeight: 22 }}>{vid.title}</Text>
                <Text style={{ fontSize: 13, color: C.label, lineHeight: 19, opacity: 0.8 }}>{vid.desc}</Text>
              </View>
              <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14 }}>
                {[{ icon: 'heart', label: '1.2K' }, { icon: 'bubble.right', label: '84' }, { icon: 'paperplane', label: 'Share' }].map(({ icon, label }) => (
                  <Pressable key={icon} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                    <IconSymbol name={icon as any} size={22} color={C.label} />
                    <Text style={{ fontSize: 11, color: C.secondary }}>{label}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        );
      })()}

      {/* ── Post detail overlay ── */}
      {fullscreenPostIdx !== null && (
        <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 100, backgroundColor: C.bg }}>
          <View style={{ height: topBarH, paddingTop: insets.top, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFullscreenPostIdx(null); }} style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
              <IconSymbol name="chevron.left" size={22} color={C.label} />
            </Pressable>
            <Text style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: C.label }}>Posts</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
            {[...GRID_SEEDS_SUB.slice(fullscreenPostIdx), ...GRID_SEEDS_SUB.slice(0, fullscreenPostIdx)].map((seed, i) => (
              <View key={seed} style={{ marginBottom: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 10 }}>
                  <Image source={{ uri: 'https://picsum.photos/seed/kanext-avatar/200/200' }} style={{ width: 32, height: 32, borderRadius: 16 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>sammyk</Text>
                    <Text style={{ fontSize: 11, color: C.secondary }}>{i === 0 ? 'Just now' : `${i + 1}d ago`}</Text>
                  </View>
                  <IconSymbol name="ellipsis" size={18} color={C.label} />
                </View>
                <Image source={{ uri: `https://picsum.photos/seed/${seed}/600/600` }} style={{ width: '100%', aspectRatio: 1 }} resizeMode="cover" />
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 12, gap: 18 }}>
                  <IconSymbol name="heart" size={26} color={C.label} />
                  <IconSymbol name="bubble.right" size={24} color={C.label} />
                  <IconSymbol name="paperplane" size={24} color={C.label} />
                  <View style={{ flex: 1 }} />
                  <IconSymbol name="bookmark" size={24} color={C.label} />
                </View>
                <View style={{ paddingHorizontal: 14, paddingTop: 8, paddingBottom: 12 }}>
                  <Text style={{ fontSize: 13, color: C.label }}><Text style={{ fontWeight: '700' }}>sammyk </Text>Building the operating system for institutions. #KaNeXT</Text>
                </View>
                <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator }} />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── Story / Highlight Viewer overlay ── */}
      {highlightViewerIdx !== null && (() => {
        const h = HIGHLIGHTS_DATA_SUB[highlightViewerIdx];
        const slides = HIGHLIGHTS_STORIES_SUB[h.id] ?? [];
        const totalSlides = slides.length;
        return (
          <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 200, backgroundColor: '#000' }}>
            <Image source={{ uri: `https://picsum.photos/seed/${slides[storySlideIdx]}/600/1067` }} style={{ width: SCREEN_W, height: '100%', position: 'absolute' }} resizeMode="cover" />
            <LinearGradient colors={['rgba(0,0,0,0.55)', 'transparent']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120 }} />
            <View style={{ position: 'absolute', top: insets.top + 10, left: 10, right: 10, flexDirection: 'row', gap: 4 }}>
              {slides.map((_, i) => (
                <View key={i} style={{ flex: 1, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.35)', overflow: 'hidden' }}>
                  {i < storySlideIdx && <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: '#fff' }} />}
                  {i === storySlideIdx && <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: '#fff', width: '100%' }} />}
                </View>
              ))}
            </View>
            {/* Tap zones */}
            <View style={{ ...StyleSheet.absoluteFillObject, flexDirection: 'row', marginTop: 80 }}>
              <Pressable style={{ flex: 1 }} onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (storySlideIdx > 0) { setStorySlideIdx(s => s - 1); }
                else if (highlightViewerIdx > 0) { setHighlightViewerIdx(i => (i ?? 1) - 1); setStorySlideIdx(0); }
                else { setViewedHighlights(prev => new Set([...prev, h.id])); setHighlightViewerIdx(null); setStorySlideIdx(0); }
              }} />
              <Pressable style={{ flex: 1 }} onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (storySlideIdx < totalSlides - 1) { setStorySlideIdx(s => s + 1); }
                else {
                  setViewedHighlights(prev => new Set([...prev, h.id]));
                  if (highlightViewerIdx < HIGHLIGHTS_DATA_SUB.length - 1) { setHighlightViewerIdx(i => (i ?? 0) + 1); setStorySlideIdx(0); }
                  else { setHighlightViewerIdx(null); setStorySlideIdx(0); }
                }
              }} />
            </View>
            {/* Top bar — rendered last for touch priority */}
            <View style={{ position: 'absolute', top: insets.top + 24, left: 14, right: 14, flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: '#fff', overflow: 'hidden', marginRight: 10 }}>
                <Image source={{ uri: 'https://picsum.photos/seed/kanext-avatar/200/200' }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              </View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff', flex: 1 }}>{h.label}</Text>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); if (storyTimerRef.current) clearTimeout(storyTimerRef.current); setViewedHighlights(prev => new Set([...prev, h.id])); setHighlightViewerIdx(null); setStorySlideIdx(0); }}
                style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
              >
                <IconSymbol name="xmark" size={18} color="#fff" />
              </Pressable>
            </View>
          </View>
        );
      })()}

    </View>
  );
}

// ── Education President: Feed / Announcements / Alumni ───────────────────────

type EduPresTab = 'Feed' | 'Announcements' | 'Alumni';

const EDU_PRES_POSTS = [
  { id: 'ep1', author: 'Dr. Mikhail Brodsky', initials: 'MB', time: '2h',  visibility: 'Public',      pinned: true,  views: 1247, likes: 89, text: 'Spring 2026 Commencement — Saturday, June 20. We are proud of every graduate who has persevered through this journey. More details coming soon.' },
  { id: 'ep2', author: 'Office of the President', initials: 'OP', time: '1d', visibility: 'Campus',   pinned: false, views: 432,  likes: 0,  text: 'Accreditation Prep: WSCUC Site Visit May 2–4. All faculty and staff are encouraged to review the self-study document shared in the portal.' },
  { id: 'ep3', author: 'Academic Affairs', initials: 'AA', time: '1d',      visibility: 'Campus',      pinned: false, views: 618,  likes: 47, text: "Dean's List: Spring 2026 Honorees have been posted in the Student Portal. Congratulations to all honorees — excellence recognized." },
  { id: 'ep4', author: 'Admissions', initials: 'AD', time: '2d',             visibility: 'Public',      pinned: false, views: 891,  likes: 0,  text: 'New MBA Cohort Orientation — April 12 at 9 AM in the Main Hall. Welcome to the Lincoln University family, Class of 2028!' },
  { id: 'ep5', author: 'Faculty Senate', initials: 'FS', time: '5d',         visibility: 'Campus',      pinned: false, views: 203,  likes: 0,  text: 'Faculty Research Symposium — May 15. Abstract submissions due April 25. All faculty are encouraged to present their current work.' },
];

const EDU_ANNOUNCEMENTS = [
  { id: 'ea1', title: 'Spring Registration Now Open', date: 'Apr 1',  read: 312, total: 436, pushSent: true },
  { id: 'ea2', title: 'WSCUC Accreditation Visit — May 2–4', date: 'Mar 28', read: 387, total: 436, pushSent: true },
  { id: 'ea3', title: 'Tuition Payment Deadline — May 15', date: 'Mar 20', read: 401, total: 436, pushSent: true },
];

const EDU_ALUMNI = [
  { id: 'al1', initials: 'MC', name: 'Marcus Chen',   degree: "MBA '21", title: 'VP Finance',  company: 'Wells Fargo' },
  { id: 'al2', initials: 'AO', name: 'Dr. Adaeze Okoye', degree: "BS DiagImaging '18", title: 'Radiologist', company: 'UCSF Medical' },
  { id: 'al3', initials: 'JL', name: 'James Liu',     degree: "DBA '22", title: 'Professor',   company: 'San Jose State' },
];

function EducationPresidentSocialView({
  C, insets, role, cycleRole, accent,
}: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  role: string;
  cycleRole: () => void;
  accent: string;
}) {
  const [eduTab, setEduTab] = useState<EduPresTab>('Feed');
  const [eduDrop, setEduDrop] = useState(false);
  const [feedVisibility, setFeedVisibility] = useState<'Public' | 'Campus' | 'Faculty Only'>('Public');
  const TOP_BAR_H = 52;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top bar */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, height: insets.top + TOP_BAR_H, paddingTop: insets.top, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <KMenuButton />
        </Pressable>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setEduDrop(v => !v); }} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>{eduTab}</Text>
          <IconSymbol name={eduDrop ? 'chevron.up' : 'chevron.down'} size={12} color={C.secondary} />
        </Pressable>
        <RolePill role={role} onPress={cycleRole} accentColor={accent} isPrimary />
      </View>

      {/* Tab dropdown */}
      {eduDrop && (
        <View style={{ position: 'absolute', top: insets.top + TOP_BAR_H + 4, left: '22%', right: '22%', backgroundColor: C.surface, borderRadius: 14, zIndex: 100, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8, overflow: 'hidden' }}>
          {(['Feed', 'Announcements', 'Alumni'] as EduPresTab[]).map((tab, i, arr) => (
            <Pressable key={tab} onPress={() => { Haptics.selectionAsync(); setEduTab(tab); setEduDrop(false); }} style={{ paddingVertical: 13, paddingHorizontal: 16, borderBottomWidth: i < arr.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }}>
              <Text style={{ fontSize: 15, color: tab === eduTab ? C.label : C.secondary, fontWeight: tab === eduTab ? '600' : '400' }}>{tab}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* ── FEED ── */}
      {eduTab === 'Feed' && (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 12, paddingBottom: 120 }}>
          {/* Post composer */}
          <View style={{ marginHorizontal: 14, marginBottom: 14, backgroundColor: C.surface, borderRadius: 16, padding: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: C.bg, fontWeight: '700', fontSize: 13 }}>MB</Text>
              </View>
              <View style={{ flex: 1, height: 36, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, alignItems: 'flex-start', justifyContent: 'center', paddingHorizontal: 14 }}>
                <Text style={{ fontSize: 14, color: C.muted }}>Share with Lincoln University...</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Text style={{ fontSize: 12, color: C.secondary }}>Visibility:</Text>
              {(['Public', 'Campus', 'Faculty Only'] as const).map(v => (
                <Pressable key={v} onPress={() => { Haptics.selectionAsync(); setFeedVisibility(v); }} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: feedVisibility === v ? C.label : C.surfacePressed }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: feedVisibility === v ? C.bg : C.secondary }}>{v}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Posts */}
          {EDU_PRES_POSTS.map(post => (
            <View key={post.id} style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6, gap: 10 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: C.bg, fontWeight: '700', fontSize: 13 }}>{post.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{post.author}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 1 }}>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{post.time}</Text>
                    <View style={{ backgroundColor: C.surfacePressed, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 1 }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: C.secondary }}>{post.visibility}</Text>
                    </View>
                    {post.pinned && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                        <IconSymbol name="pin.fill" size={10} color={C.secondary} />
                        <Text style={{ fontSize: 10, fontWeight: '700', color: C.secondary }}>Pinned</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              <Text style={{ fontSize: 15, color: C.label, paddingHorizontal: 14, paddingBottom: 10, lineHeight: 22 }}>{post.text}</Text>
              {/* Stats row */}
              <View style={{ flexDirection: 'row', gap: 16, paddingHorizontal: 14, paddingBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <IconSymbol name="eye" size={13} color={C.muted} />
                  <Text style={{ fontSize: 12, color: C.muted }}>{post.views >= 1000 ? `${(post.views / 1000).toFixed(1)}K` : `${post.views}`}</Text>
                </View>
                {post.likes > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <IconSymbol name="heart" size={13} color={C.muted} />
                    <Text style={{ fontSize: 12, color: C.muted }}>{post.likes}</Text>
                  </View>
                )}
              </View>
              {/* Actions row */}
              <View style={{ flexDirection: 'row', gap: 20, paddingHorizontal: 14, paddingBottom: 12 }}>
                {post.pinned && (
                  <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <IconSymbol name="pin.fill" size={15} color={C.label} />
                    <Text style={{ fontSize: 13, color: C.label, fontWeight: '600' }}>Pinned</Text>
                  </Pressable>
                )}
                <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <IconSymbol name="pencil" size={15} color={C.secondary} />
                  <Text style={{ fontSize: 13, color: C.secondary }}>Edit</Text>
                </Pressable>
                <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <IconSymbol name="trash" size={15} color={C.secondary} />
                  <Text style={{ fontSize: 13, color: C.secondary }}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* ── ANNOUNCEMENTS ── */}
      {eduTab === 'Announcements' && (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 12, paddingBottom: 120 }}>
          <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} style={({ pressed }) => ({ marginHorizontal: 14, marginBottom: 20, backgroundColor: C.label, borderRadius: 14, paddingVertical: 14, alignItems: 'center', opacity: pressed ? 0.8 : 1 })}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.bg }}>+ Create Announcement</Text>
          </Pressable>

          {EDU_ANNOUNCEMENTS.map(ann => {
            const progress = ann.read / ann.total;
            return (
              <View key={ann.id} style={{ marginHorizontal: 14, marginBottom: 12, backgroundColor: C.surface, borderRadius: 16, padding: 16 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 4 }}>{ann.title}</Text>
                <Text style={{ fontSize: 12, color: C.secondary, marginBottom: 12 }}>Published {ann.date}</Text>
                {/* Read progress */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontSize: 12, color: C.secondary }}>Read by {ann.read} of {ann.total} students</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: C.label }}>{Math.round(progress * 100)}%</Text>
                </View>
                <View style={{ height: 4, backgroundColor: C.separator, borderRadius: 2, marginBottom: 12, overflow: 'hidden' }}>
                  <View style={{ width: `${progress * 100}%`, height: 4, backgroundColor: C.label, borderRadius: 2 }} />
                </View>
                {/* Push badge / button */}
                {ann.pushSent ? (
                  <View style={{ alignSelf: 'flex-start', backgroundColor: C.surfacePressed, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary }}>Push Sent</Text>
                  </View>
                ) : (
                  <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} style={({ pressed }) => ({ alignSelf: 'flex-start', backgroundColor: pressed ? C.surfacePressed : C.label, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 })}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: C.bg }}>Send Push</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* ── ALUMNI ── */}
      {eduTab === 'Alumni' && (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 12, paddingBottom: 120 }}>
          {/* Network header */}
          <View style={{ marginHorizontal: 14, marginBottom: 16, backgroundColor: C.surface, borderRadius: 16, padding: 16, alignItems: 'center' }}>
            <IconSymbol name="person.3.fill" size={28} color={C.label} />
            <Text style={{ fontSize: 22, fontWeight: '800', color: C.label, marginTop: 8 }}>3,247</Text>
            <Text style={{ fontSize: 14, color: C.secondary, marginTop: 2 }}>Lincoln University Alumni</Text>
          </View>

          {/* Recent alumni highlights */}
          <Text style={{ fontSize: 11, color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 14, marginBottom: 8 }}>ALUMNI HIGHLIGHTS</Text>
          {EDU_ALUMNI.map(alum => (
            <View key={alum.id} style={{ marginHorizontal: 14, marginBottom: 8, backgroundColor: C.surface, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>{alum.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{alum.name} · <Text style={{ fontWeight: '400', color: C.secondary }}>{alum.degree}</Text></Text>
                <Text style={{ fontSize: 13, color: C.secondary, marginTop: 2 }}>{alum.title} · {alum.company}</Text>
              </View>
            </View>
          ))}

          {/* Annual Giving Campaign */}
          <Text style={{ fontSize: 11, color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 14, marginTop: 16, marginBottom: 8 }}>ANNUAL GIVING CAMPAIGN</Text>
          <View style={{ marginHorizontal: 14, marginBottom: 16, backgroundColor: C.surface, borderRadius: 16, padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <View>
                <Text style={{ fontSize: 13, color: C.secondary }}>Goal</Text>
                <Text style={{ fontSize: 18, fontWeight: '800', color: C.label }}>$500K</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 13, color: C.secondary }}>Raised</Text>
                <Text style={{ fontSize: 18, fontWeight: '800', color: C.label }}>$187K</Text>
              </View>
            </View>
            <View style={{ height: 6, backgroundColor: C.separator, borderRadius: 3, marginBottom: 8, overflow: 'hidden' }}>
              <View style={{ width: '37.4%', height: 6, backgroundColor: C.label, borderRadius: 3 }} />
            </View>
            <Text style={{ fontSize: 12, color: C.secondary }}>37% of goal · 89 days remaining</Text>
          </View>

          {/* Alumni Reunions */}
          <Text style={{ fontSize: 11, color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 14, marginBottom: 8 }}>ALUMNI REUNIONS</Text>
          {[
            { id: 'ar1', title: 'Class of 2020 Reunion', date: 'June 28, 2026', location: 'Lincoln University Main Campus' },
            { id: 'ar2', title: 'MBA Alumni Gala',       date: 'July 12, 2026', location: 'San Francisco Marriott' },
          ].map(event => (
            <View key={event.id} style={{ marginHorizontal: 14, marginBottom: 8, backgroundColor: C.surface, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{event.title}</Text>
                <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{event.date}</Text>
                <Text style={{ fontSize: 12, color: C.secondary }}>{event.location}</Text>
              </View>
              <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} style={({ pressed }) => ({ backgroundColor: pressed ? C.surfacePressed : C.label, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 })}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.bg }}>RSVP</Text>
              </Pressable>
            </View>
          ))}

          {/* Share Alumni Story */}
          <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} style={({ pressed }) => ({ marginHorizontal: 14, marginTop: 12, backgroundColor: C.label, borderRadius: 14, paddingVertical: 15, alignItems: 'center', opacity: pressed ? 0.8 : 1 })}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.bg }}>Share Alumni Story</Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}

// ── Social role keys per mode ──────────────────────────────────────────────
// ── Live mode public feed data ────────────────────────────────────────────────

const LIVE_SOCIAL_POSTS: Record<string, Array<{ id: string; author: string; handle: string; time: string; body: string; likes: number; comments: number }>> = {
  personal: [
    { id: '1', author: 'Sammy Kalejaiye', handle: '@sammyk', time: '2h ago', body: 'KaNeXT OS v2 is live. The operating system for every institution.', likes: 312, comments: 47 },
    { id: '2', author: 'Sammy Kalejaiye', handle: '@sammyk', time: '1d ago', body: 'Athletic intelligence is not a spreadsheet. It is a living system that learns, updates, and predicts.', likes: 208, comments: 31 },
    { id: '3', author: 'Sammy Kalejaiye', handle: '@sammyk', time: '3d ago', body: 'We signed our third university this month. Lincoln University x KaNeXT.', likes: 445, comments: 62 },
    { id: '4', author: 'Sammy Kalejaiye', handle: '@sammyk', time: '1w ago', body: 'Investors: the data room is open. DM for access code.', likes: 176, comments: 28 },
  ],
  business: [
    { id: '1', author: 'KaNeXT LLC', handle: '@kanext', time: '1d ago', body: 'KaNeXT OS v2.0 is officially launched. Sports. Education. Business. Community. One OS for every institution.', likes: 528, comments: 74 },
    { id: '2', author: 'KaNeXT LLC', handle: '@kanext', time: '3d ago', body: 'New partnership with Lincoln University bringing AI-powered intelligence to student athletes.', likes: 341, comments: 49 },
    { id: '3', author: 'KaNeXT LLC', handle: '@kanext', time: '1w ago', body: 'The KaNeXT Player Pool now has 37,176 verified players across D1, D2, D3, NAIA, NJCAA, and JUCO.', likes: 287, comments: 38 },
  ],
  education: [
    { id: '1', author: 'Lincoln University', handle: '@lincolnuniv', time: '6h ago', body: 'Applications are open for Fall 2026. BA Business Administration, BS Diagnostic Imaging, MBA, MS IBFM, DBA. Apply at kanext.io/lincoln.', likes: 94, comments: 12 },
    { id: '2', author: 'Lincoln University', handle: '@lincolnuniv', time: '2d ago', body: 'Congratulations to our 2026 graduating class. Commencement is May 10th.', likes: 217, comments: 33 },
    { id: '3', author: 'Lincoln University', handle: '@lincolnuniv', time: '1w ago', body: 'Open House this Saturday April 15th. Come tour campus, meet faculty, and learn about financial aid options.', likes: 143, comments: 19 },
  ],
  community: [
    { id: '1', author: 'ICCLA', handle: '@iccla', time: '3h ago', body: 'Join us this Sunday for our Easter celebration. 9 AM and 6 PM services. All are welcome.', likes: 182, comments: 24 },
    { id: '2', author: 'ICCLA', handle: '@iccla', time: '1d ago', body: '"For I know the plans I have for you," declares the Lord. Jeremiah 29:11. Have a blessed Thursday.', likes: 265, comments: 31 },
    { id: '3', author: 'ICCLA', handle: '@iccla', time: '4d ago', body: 'Community Outreach Day is coming April 19th. Volunteers needed. Sign up in the app.', likes: 98, comments: 14 },
    { id: '4', author: 'ICCLA', handle: '@iccla', time: '1w ago', body: 'Prayer wall is now live in the app. Submit your requests anytime. We pray for every submission.', likes: 311, comments: 42 },
  ],
  sports: [
    { id: '1', author: 'LU Basketball', handle: '@luoaklanders', time: '4h ago', body: 'FINAL: LU 78, Dominican 65. Jarvis with 24 pts 8 ast. Laolu with 18 pts 11 reb. On to the next one. 🏀', likes: 412, comments: 58 },
    { id: '2', author: 'LU Basketball', handle: '@luoaklanders', time: '2d ago', body: '22-8 on the season. 14-2 in the GAAC. Playoffs locked. Eyes on the championship. 🔒', likes: 687, comments: 94 },
    { id: '3', author: 'LU Basketball', handle: '@luoaklanders', time: '5d ago', body: 'Practice film looking sharp. Coach has us dialed in for the stretch run.', likes: 229, comments: 31 },
  ],
};

function LiveSocialView({ mode, C, insets }: { mode: string; C: any; insets: any }) {
  const posts = LIVE_SOCIAL_POSTS[mode] ?? LIVE_SOCIAL_POSTS.personal;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ height: insets.top + 52, backgroundColor: C.bg }} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, gap: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: C.label, paddingTop: 8, paddingBottom: 4 }}>Feed</Text>
        {posts.map(post => (
          <View key={post.id} style={{ backgroundColor: C.surface, borderRadius: 14, padding: 14, gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ gap: 2 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{post.author}</Text>
                <Text style={{ fontSize: 12, color: C.secondary }}>{post.handle} · {post.time}</Text>
              </View>
            </View>
            <Text style={{ fontSize: 14, color: C.label, lineHeight: 20 }}>{post.body}</Text>
            <View style={{ flexDirection: 'row', gap: 20 }}>
              <Text style={{ fontSize: 12, color: C.secondary }}>♥ {post.likes}</Text>
              <Text style={{ fontSize: 12, color: C.secondary }}>💬 {post.comments}</Text>
            </View>
          </View>
        ))}
        <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 13, color: C.secondary, textAlign: 'center' }}>Sign in to like, comment, and post.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ── Community (ICCLA) Pastor: Church Profile View ──────────────────────────────

type ICCLASocialTab = 'Grid' | 'Reels' | 'Sermons';

function ICCLAPastorSocialView({
  C, insets, role, cycleRole, accent, router,
}: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  role: string;
  cycleRole: () => void;
  accent: string;
  router: ReturnType<typeof useRouter>;
}) {
  const { width: SCREEN_W } = useWindowDimensions();
  const GRID_CELL = Math.floor((SCREEN_W - 2) / 3);
  const TOP_BAR_H = 52;
  const topBarH = insets.top + TOP_BAR_H;

  const [activeTab, setActiveTab] = useState<ICCLASocialTab>('Grid');
  const [fullscreenReelIdx, setFullscreenReelIdx] = useState<number | null>(null);
  const [highlightViewerIdx, setHighlightViewerIdx] = useState<number | null>(null);
  const [viewedHighlights, setViewedHighlights] = useState<Set<string>>(new Set());
  const [storySlideIdx, setStorySlideIdx] = useState(0);
  const storyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reels = useMemo(() => getReels('community'), []);

  const GRID_SEEDS = ['ch01','ch02','ch03','ch04','ch05','ch06','ch07','ch08','ch09'];
  const REEL_SEEDS = ['cr01','cr02','cr03','cr04','cr05','cr06','cr07','cr08','cr09'];
  const SERMONS = [
    { id: 's1', seed: 'ser-01', title: 'Walking in Purpose', speaker: 'Pastor Oladipo', duration: '42:18', views: '1.2K' },
    { id: 's2', seed: 'ser-02', title: 'The Power of Community', speaker: 'Pastor Oladipo', duration: '38:44', views: '890' },
    { id: 's3', seed: 'ser-03', title: 'Faith Over Fear', speaker: 'Min. Blessing A.', duration: '29:55', views: '654' },
    { id: 's4', seed: 'ser-04', title: 'Renewal Season', speaker: 'Pastor Oladipo', duration: '45:02', views: '1.4K' },
    { id: 's5', seed: 'ser-05', title: 'Romans 8 Deep Dive', speaker: 'Min. Blessing A.', duration: '51:33', views: '723' },
    { id: 's6', seed: 'ser-06', title: 'The Generous Life', speaker: 'Pastor Oladipo', duration: '36:21', views: '512' },
  ];
  const HIGHLIGHTS_DATA = [
    { id: 'sermons',  label: 'Sermons',  seed: 'hl-sermons'  },
    { id: 'events',   label: 'Events',   seed: 'hl-events'   },
    { id: 'worship',  label: 'Worship',  seed: 'hl-worship'  },
    { id: 'outreach', label: 'Outreach', seed: 'hl-outreach' },
  ];
  const HIGHLIGHTS_STORIES: Record<string, string[]> = {
    sermons:  ['hs-se1', 'hs-se2', 'hs-se3'],
    events:   ['hs-ev1', 'hs-ev2'],
    worship:  ['hs-wo1', 'hs-wo2', 'hs-wo3'],
    outreach: ['hs-ou1', 'hs-ou2', 'hs-ou3', 'hs-ou4'],
  };
  const SOCIAL_TABS = [
    { key: 'Grid'    as const, icon: 'square.grid.3x3.fill' },
    { key: 'Reels'   as const, icon: 'play.square.fill'     },
    { key: 'Sermons' as const, icon: 'tv.fill'              },
  ];

  React.useEffect(() => {
    if (highlightViewerIdx === null) {
      if (storyTimerRef.current) clearTimeout(storyTimerRef.current);
      return;
    }
    const h = HIGHLIGHTS_DATA[highlightViewerIdx];
    const slides = HIGHLIGHTS_STORIES[h.id] ?? [];
    if (storyTimerRef.current) clearTimeout(storyTimerRef.current);
    storyTimerRef.current = setTimeout(() => {
      if (storySlideIdx < slides.length - 1) {
        setStorySlideIdx(s => s + 1);
      } else {
        setViewedHighlights(prev => new Set([...prev, h.id]));
        setHighlightViewerIdx(null);
        setStorySlideIdx(0);
      }
    }, 5000);
    return () => { if (storyTimerRef.current) clearTimeout(storyTimerRef.current); };
  }, [highlightViewerIdx, storySlideIdx]);

  const profileHeader = (
    <>
      {/* Avatar + Stats + Bio */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 14 }}>
          <Pressable>
            <View style={{ width: 86, height: 86, borderRadius: 43, borderWidth: 2.5, borderColor: C.separator, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: C.bg }}>IC</Text>
            </View>
            <View style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.bg }}>
              <IconSymbol name="plus" size={11} color={C.bg} />
            </View>
          </Pressable>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around' }}>
            {[
              { value: '84',    label: 'posts'     },
              { value: '1,240', label: 'followers' },
              { value: '312',   label: 'members'   },
            ].map(stat => (
              <Pressable key={stat.label} style={{ alignItems: 'center' }} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                <Text style={{ fontSize: 17, fontWeight: '700', color: C.label }}>{stat.value}</Text>
                <Text style={{ fontSize: 12, color: C.label, marginTop: 1 }}>{stat.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, marginBottom: 2 }}>ICCLA — International Christian Community</Text>
        <Text style={{ fontSize: 13, fontWeight: '600', color: C.label, marginBottom: 3, opacity: 0.75 }}>Church · Los Angeles, CA</Text>
        <Text style={{ fontSize: 13, color: C.label, lineHeight: 18, marginBottom: 4 }}>
          {"A community of faith, love, and purpose.\nSunday Service · 10 AM · Main Sanctuary"}
        </Text>
        <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 5 }}>#ICCLA #FaithOverFear #Community</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <IconSymbol name="link" size={12} color={C.secondary} />
          <Text style={{ fontSize: 13, fontWeight: '500', color: C.label }}>kanext.io/@iccla</Text>
        </View>
      </View>

      {/* Analytics card */}
      <Pressable
        style={({ pressed }) => [{ marginHorizontal: 16, marginBottom: 10, backgroundColor: C.surface, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, pressed && { opacity: 0.75 }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/(main)/social/analytics' as any); }}
      >
        <View>
          <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, marginBottom: 2 }}>Church Growth Dashboard</Text>
          <Text style={{ fontSize: 12, color: C.secondary }}>+18 new followers this week.</Text>
        </View>
        <IconSymbol name="chevron.right" size={14} color={C.secondary} />
      </Pressable>

      {/* CTA Buttons */}
      <View style={{ flexDirection: 'row', gap: 8, marginHorizontal: 16, marginBottom: 16 }}>
        <Pressable style={({ pressed }) => [{ flex: 1, height: 34, borderRadius: 10, backgroundColor: C.surface, borderWidth: 1, borderColor: C.separator, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.7 }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/(main)/social/edit-profile' as any); }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Edit profile</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [{ flex: 1, height: 34, borderRadius: 10, backgroundColor: C.surface, borderWidth: 1, borderColor: C.separator, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.7 }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Share profile</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [{ width: 34, height: 34, borderRadius: 10, backgroundColor: C.surface, borderWidth: 1, borderColor: C.separator, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.7 }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
          <IconSymbol name="person.badge.plus" size={16} color={C.label} />
        </Pressable>
      </View>

      {/* Highlights */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 14, paddingBottom: 4 }} style={{ marginBottom: 0 }}>
        <Pressable style={{ alignItems: 'center', gap: 6 }} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
          <View style={{ width: 62, height: 62, borderRadius: 31, borderWidth: 1.5, borderColor: C.separator, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' }}>
            <IconSymbol name="plus" size={22} color={C.label} />
          </View>
          <Text style={{ fontSize: 11, color: C.label }}>New</Text>
        </Pressable>
        {HIGHLIGHTS_DATA.map((h, hIdx) => {
          const viewed = viewedHighlights.has(h.id);
          return (
            <Pressable key={h.id} style={{ alignItems: 'center', gap: 6 }} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setHighlightViewerIdx(hIdx); setStorySlideIdx(0); }}>
              <View style={{ width: 62, height: 62, borderRadius: 31, borderWidth: 2.5, borderColor: viewed ? C.separator : C.label, overflow: 'hidden', backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' }}>
                <Image source={{ uri: `https://picsum.photos/seed/${h.seed}/200/200` }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              </View>
              <Text style={{ fontSize: 11, color: C.label }} numberOfLines={1}>{h.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Content type tabs */}
      <View style={{ flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator, marginTop: 16 }}>
        {SOCIAL_TABS.map(({ key, icon }) => {
          const active = activeTab === key;
          return (
            <Pressable key={key} onPress={() => { Haptics.selectionAsync(); setActiveTab(key); }}
              style={[{ flex: 1, alignItems: 'center', paddingVertical: 11 }, active ? { borderBottomWidth: 1.5, borderBottomColor: C.label } : {}]}>
              <IconSymbol name={icon as any} size={22} color={active ? C.label : C.muted} />
            </Pressable>
          );
        })}
      </View>
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top bar */}
      <View style={{ height: topBarH, paddingTop: insets.top, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <KMenuButton />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>ICCLA</Text>
        </View>
        <View style={{ minWidth: 40, height: 36, alignItems: 'flex-end', justifyContent: 'center' }}>
          <RolePill role={role} onPress={cycleRole} accentColor={accent} isPrimary />
        </View>
      </View>

      {/* Profile + Grid scroll */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {profileHeader}

        {activeTab === 'Grid' && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}>
            {GRID_SEEDS.map((seed, i) => (
              <Pressable key={seed} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                <Image source={{ uri: `https://picsum.photos/seed/${seed}/400/400` }} style={{ width: GRID_CELL, height: GRID_CELL }} resizeMode="cover" />
              </Pressable>
            ))}
          </View>
        )}

        {activeTab === 'Reels' && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}>
            {REEL_SEEDS.map((seed, i) => (
              <Pressable key={seed} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFullscreenReelIdx(i); }}>
                <Image source={{ uri: `https://picsum.photos/seed/${seed}/400/400` }} style={{ width: GRID_CELL, height: GRID_CELL }} resizeMode="cover" />
                <Text style={{ position: 'absolute', bottom: 6, left: 6, fontSize: 11, fontWeight: '600', color: '#fff' }}>0:{String(15 + i * 7).padStart(2, '0')}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {activeTab === 'Sermons' && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}>
            {SERMONS.map((vid, i) => (
              <Pressable key={vid.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ position: 'relative' }}>
                <Image source={{ uri: `https://picsum.photos/seed/${vid.seed}/400/300` }} style={{ width: GRID_CELL, height: Math.floor(GRID_CELL * 0.75) }} resizeMode="cover" />
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 32, backgroundColor: 'rgba(0,0,0,0.45)' }} />
                <View style={{ position: 'absolute', bottom: 5, left: 5, flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <IconSymbol name="eye.fill" size={9} color="#fff" />
                  <Text style={{ fontSize: 10, fontWeight: '600', color: '#fff' }}>{vid.views}</Text>
                </View>
                <Text style={{ position: 'absolute', bottom: 5, right: 5, fontSize: 10, fontWeight: '600', color: '#fff' }}>{vid.duration}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {fullscreenReelIdx !== null && (
        <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 100, backgroundColor: '#000' }}>
          <ReelsPage
            reels={reels}
            likedReels={new Set()}
            bookmarkedReels={new Set()}
            onLikeToggle={() => {}}
            onBookmarkToggle={() => {}}
          />
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFullscreenReelIdx(null); }}
            style={{ position: 'absolute', top: insets.top + 12, left: 16, zIndex: 101, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' }}
          >
            <IconSymbol name="xmark" size={16} color="#fff" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ── Community (ICCLA) Member: Church Profile View ──────────────────────────────

function ICCLAMemberSocialView({
  C, insets, role, cycleRole, accent,
}: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  role: string;
  cycleRole: () => void;
  accent: string;
}) {
  const { width: SCREEN_W } = useWindowDimensions();
  const GRID_CELL = Math.floor((SCREEN_W - 2) / 3);
  const TOP_BAR_H = 52;
  const topBarH = insets.top + TOP_BAR_H;

  const [activeTab, setActiveTab] = useState<ICCLASocialTab>('Grid');
  const [isFollowing, setIsFollowing] = useState(true);
  const [fullscreenReelIdx, setFullscreenReelIdx] = useState<number | null>(null);
  const [highlightViewerIdx, setHighlightViewerIdx] = useState<number | null>(null);
  const [viewedHighlights, setViewedHighlights] = useState<Set<string>>(new Set());
  const [storySlideIdx, setStorySlideIdx] = useState(0);
  const storyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reels = useMemo(() => getReels('community'), []);

  const GRID_SEEDS = ['ch01','ch02','ch03','ch04','ch05','ch06','ch07','ch08','ch09'];
  const REEL_SEEDS = ['cr01','cr02','cr03','cr04','cr05','cr06','cr07','cr08','cr09'];
  const SERMONS = [
    { id: 's1', seed: 'ser-01', title: 'Walking in Purpose', speaker: 'Pastor Oladipo', duration: '42:18', views: '1.2K' },
    { id: 's2', seed: 'ser-02', title: 'The Power of Community', speaker: 'Pastor Oladipo', duration: '38:44', views: '890' },
    { id: 's3', seed: 'ser-03', title: 'Faith Over Fear', speaker: 'Min. Blessing A.', duration: '29:55', views: '654' },
    { id: 's4', seed: 'ser-04', title: 'Renewal Season', speaker: 'Pastor Oladipo', duration: '45:02', views: '1.4K' },
    { id: 's5', seed: 'ser-05', title: 'Romans 8 Deep Dive', speaker: 'Min. Blessing A.', duration: '51:33', views: '723' },
    { id: 's6', seed: 'ser-06', title: 'The Generous Life', speaker: 'Pastor Oladipo', duration: '36:21', views: '512' },
  ];
  const HIGHLIGHTS_DATA = [
    { id: 'sermons',  label: 'Sermons',  seed: 'hl-sermons'  },
    { id: 'events',   label: 'Events',   seed: 'hl-events'   },
    { id: 'worship',  label: 'Worship',  seed: 'hl-worship'  },
    { id: 'outreach', label: 'Outreach', seed: 'hl-outreach' },
  ];
  const HIGHLIGHTS_STORIES: Record<string, string[]> = {
    sermons:  ['hs-se1', 'hs-se2', 'hs-se3'],
    events:   ['hs-ev1', 'hs-ev2'],
    worship:  ['hs-wo1', 'hs-wo2', 'hs-wo3'],
    outreach: ['hs-ou1', 'hs-ou2', 'hs-ou3', 'hs-ou4'],
  };
  const SOCIAL_TABS = [
    { key: 'Grid'    as const, icon: 'square.grid.3x3.fill' },
    { key: 'Reels'   as const, icon: 'play.square.fill'     },
    { key: 'Sermons' as const, icon: 'tv.fill'              },
  ];

  React.useEffect(() => {
    if (highlightViewerIdx === null) {
      if (storyTimerRef.current) clearTimeout(storyTimerRef.current);
      return;
    }
    const h = HIGHLIGHTS_DATA[highlightViewerIdx];
    const slides = HIGHLIGHTS_STORIES[h.id] ?? [];
    if (storyTimerRef.current) clearTimeout(storyTimerRef.current);
    storyTimerRef.current = setTimeout(() => {
      if (storySlideIdx < slides.length - 1) {
        setStorySlideIdx(s => s + 1);
      } else {
        setViewedHighlights(prev => new Set([...prev, h.id]));
        setHighlightViewerIdx(null);
        setStorySlideIdx(0);
      }
    }, 5000);
    return () => { if (storyTimerRef.current) clearTimeout(storyTimerRef.current); };
  }, [highlightViewerIdx, storySlideIdx]);

  const profileHeader = (
    <>
      {/* Avatar + Stats + Bio */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 14 }}>
          <View style={{ width: 86, height: 86, borderRadius: 43, borderWidth: 2.5, borderColor: C.separator, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: C.bg }}>IC</Text>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around' }}>
            {[
              { value: '84',    label: 'posts'     },
              { value: '1,240', label: 'followers' },
              { value: '312',   label: 'members'   },
            ].map(stat => (
              <Pressable key={stat.label} style={{ alignItems: 'center' }} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                <Text style={{ fontSize: 17, fontWeight: '700', color: C.label }}>{stat.value}</Text>
                <Text style={{ fontSize: 12, color: C.label, marginTop: 1 }}>{stat.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, marginBottom: 2 }}>ICCLA — International Christian Community</Text>
        <Text style={{ fontSize: 13, fontWeight: '600', color: C.label, marginBottom: 3, opacity: 0.75 }}>Church · Los Angeles, CA</Text>
        <Text style={{ fontSize: 13, color: C.label, lineHeight: 18, marginBottom: 4 }}>
          {"A community of faith, love, and purpose.\nSunday Service · 10 AM · Main Sanctuary"}
        </Text>
        <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 5 }}>#ICCLA #FaithOverFear #Community</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <IconSymbol name="link" size={12} color={C.secondary} />
          <Text style={{ fontSize: 13, fontWeight: '500', color: C.label }}>kanext.io/@iccla</Text>
        </View>
      </View>

      {/* Follow + Message buttons */}
      <View style={{ flexDirection: 'row', gap: 8, marginHorizontal: 16, marginBottom: 16 }}>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setIsFollowing(f => !f); }}
          style={({ pressed }) => [{ flex: 1, height: 34, borderRadius: 10, backgroundColor: isFollowing ? 'transparent' : C.label, borderWidth: isFollowing ? 1 : 0, borderColor: C.separator, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.7 }]}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: isFollowing ? C.secondary : C.bg }}>{isFollowing ? 'Following' : 'Follow'}</Text>
        </Pressable>
        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          style={({ pressed }) => [{ flex: 1, height: 34, borderRadius: 10, backgroundColor: C.surface, borderWidth: 1, borderColor: C.separator, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.7 }]}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Message</Text>
        </Pressable>
        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          style={({ pressed }) => [{ width: 34, height: 34, borderRadius: 10, backgroundColor: C.surface, borderWidth: 1, borderColor: C.separator, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.7 }]}
        >
          <IconSymbol name="ellipsis" size={16} color={C.label} />
        </Pressable>
      </View>

      {/* Highlights */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 14, paddingBottom: 4 }} style={{ marginBottom: 0 }}>
        {HIGHLIGHTS_DATA.map((h, hIdx) => {
          const viewed = viewedHighlights.has(h.id);
          return (
            <Pressable key={h.id} style={{ alignItems: 'center', gap: 6 }} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setHighlightViewerIdx(hIdx); setStorySlideIdx(0); }}>
              <View style={{ width: 62, height: 62, borderRadius: 31, borderWidth: 2.5, borderColor: viewed ? C.separator : C.label, overflow: 'hidden', backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' }}>
                <Image source={{ uri: `https://picsum.photos/seed/${h.seed}/200/200` }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              </View>
              <Text style={{ fontSize: 11, color: C.label }} numberOfLines={1}>{h.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Content type tabs */}
      <View style={{ flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator, marginTop: 16 }}>
        {SOCIAL_TABS.map(({ key, icon }) => {
          const active = activeTab === key;
          return (
            <Pressable key={key} onPress={() => { Haptics.selectionAsync(); setActiveTab(key); }}
              style={[{ flex: 1, alignItems: 'center', paddingVertical: 11 }, active ? { borderBottomWidth: 1.5, borderBottomColor: C.label } : {}]}>
              <IconSymbol name={icon as any} size={22} color={active ? C.label : C.muted} />
            </Pressable>
          );
        })}
      </View>
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ height: topBarH, paddingTop: insets.top, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <KMenuButton />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>ICCLA</Text>
        </View>
        <View style={{ minWidth: 40, height: 36, alignItems: 'flex-end', justifyContent: 'center' }}>
          <RolePill role={role} onPress={cycleRole} accentColor={accent} isPrimary={false} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {profileHeader}

        {activeTab === 'Grid' && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}>
            {GRID_SEEDS.map((seed) => (
              <Pressable key={seed} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                <Image source={{ uri: `https://picsum.photos/seed/${seed}/400/400` }} style={{ width: GRID_CELL, height: GRID_CELL }} resizeMode="cover" />
              </Pressable>
            ))}
          </View>
        )}

        {activeTab === 'Reels' && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}>
            {REEL_SEEDS.map((seed, i) => (
              <Pressable key={seed} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFullscreenReelIdx(i); }}>
                <Image source={{ uri: `https://picsum.photos/seed/${seed}/400/400` }} style={{ width: GRID_CELL, height: GRID_CELL }} resizeMode="cover" />
                <Text style={{ position: 'absolute', bottom: 6, left: 6, fontSize: 11, fontWeight: '600', color: '#fff' }}>0:{String(15 + i * 7).padStart(2, '0')}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {activeTab === 'Sermons' && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}>
            {SERMONS.map((vid) => (
              <Pressable key={vid.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ position: 'relative' }}>
                <Image source={{ uri: `https://picsum.photos/seed/${vid.seed}/400/300` }} style={{ width: GRID_CELL, height: Math.floor(GRID_CELL * 0.75) }} resizeMode="cover" />
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 32, backgroundColor: 'rgba(0,0,0,0.45)' }} />
                <View style={{ position: 'absolute', bottom: 5, left: 5, flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <IconSymbol name="eye.fill" size={9} color="#fff" />
                  <Text style={{ fontSize: 10, fontWeight: '600', color: '#fff' }}>{vid.views}</Text>
                </View>
                <Text style={{ position: 'absolute', bottom: 5, right: 5, fontSize: 10, fontWeight: '600', color: '#fff' }}>{vid.duration}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {fullscreenReelIdx !== null && (
        <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 100, backgroundColor: '#000' }}>
          <ReelsPage
            reels={reels}
            likedReels={new Set()}
            bookmarkedReels={new Set()}
            onLikeToggle={() => {}}
            onBookmarkToggle={() => {}}
          />
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFullscreenReelIdx(null); }}
            style={{ position: 'absolute', top: insets.top + 12, left: 16, zIndex: 101, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' }}
          >
            <IconSymbol name="xmark" size={16} color="#fff" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ── Role keys ─────────────────────────────────────────────────────────────────

const SOCIAL_ROLE_KEYS: Record<string, string> = {
  sports:    'sports',
  education: 'education',
  community: 'community:social',
  business:  'business',
  personal:  'personal:social',
};

export default function SocialScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useMemo(() => makeStyles(C), [C]);
  const { state } = useAppContext();
  const mode = (state.activeContext?.mode ?? state.mode ?? 'business') as Mode;
  const dataMode = useDataMode();

  const roleKey = SOCIAL_ROLE_KEYS[mode] ?? 'business';
  const [role, cycleRole, roleCycles] = useDemoRole(roleKey);
  const isAdmin = role === roleCycles[0];
  const isOwner = isAdmin; // alias: 'Owner' is the primary role in personal:social
  const accent  = MODE_ACCENTS[mode] ?? C.accent;

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

  // ── Community mode state ──
  type CommunitySocialTab = 'Feed' | 'Reels' | 'KTV' | 'Explore';
  const [communityTab, setCommunityTab] = useState<CommunitySocialTab>('Feed');
  const [cmLiked,    setCmLiked]    = useState<Set<string>>(new Set());
  const [cpLiked,    setCpLiked]    = useState<Set<string>>(new Set());
  const [likedCampusPosts, setLikedCampusPosts] = useState<Set<string>>(new Set());

  // isAdmin and cycleRole come from useDemoRole above

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

  if (dataMode === 'live') return <LiveSocialView mode={mode} C={C} insets={insets} />;

  const isPostLiked = (post: FeedPost) =>
    post.isLiked !== likedPostFlips.has(post.id);

  const isPostBookmarked = (post: FeedPost) =>
    post.isBookmarked !== bookmarkedPostFlips.has(post.id);


  // ── Sports Head Coach view (early return) ────────────────────────
  if (mode === 'sports' && isAdmin) return <SportsHeadCoachSocialView C={C} insets={insets} cycleRole={cycleRole} role={role} accent={accent} />;

  // ── Sports Player view (early return) ─────────────────────────────
  if (mode === 'sports' && !isAdmin) return <SportsPlayerTeamFeedView C={C} insets={insets} cycleRole={cycleRole} role={role} accent={accent} />;

  // ── Business CEO view (early return) ────────────────────────────
  if (mode === 'business' && isAdmin) {
    return (
      <BusinessCEOSocialView
        C={C}
        insets={insets}
        role={role}
        cycleRole={cycleRole}
        accent={accent}
      />
    );
  }

  // ── Business Customer view (early return) ─────────────────────────
  if (mode === 'business' && !isAdmin) {
    return (
      <BusinessCustomerSocialView
        C={C}
        insets={insets}
        role={role}
        cycleRole={cycleRole}
        accent={accent}
      />
    );
  }

  // ── Personal Owner view (early return) ───────────────────────────────────
  if (mode === 'personal' && isOwner) {
    return (
      <PersonalOwnerSocialView
        C={C}
        insets={insets}
        role={role}
        cycleRole={cycleRole}
        accent={accent}
        router={router}
      />
    );
  }

  // ── Personal Subscriber view (early return) ──────────────────────────────
  if (mode === 'personal' && !isOwner) {
    return (
      <PersonalSubscriberSocialView
        C={C}
        insets={insets}
        role={role}
        cycleRole={cycleRole}
        accent={accent}
      />
    );
  }

  // ── Education President: Feed / Announcements / Alumni ──────────────────────
  if (mode === 'education' && isAdmin) {
    return (
      <EducationPresidentSocialView
        C={C}
        insets={insets}
        role={role}
        cycleRole={cycleRole}
        accent={accent}
      />
    );
  }

  // ── Education Student: campus feed with pinned announcements ────────────────
  if (mode === 'education' && !isAdmin) {
    const ANNOUNCEMENTS = [
      { id: 'an1', title: 'Spring Registration Open Apr 1–15', body: 'Log in to the Student Portal to register for Summer/Fall 2026 courses. Advising appointments available.', date: 'Apr 1', pinned: true },
      { id: 'an2', title: 'WSCUC Accreditation Visit May 2–4', body: 'Lincoln University welcomes our accreditation review team. Students may be contacted for interviews.', date: 'Apr 2', pinned: true },
    ];
    const CAMPUS_POSTS = [
      { id: 'cp1', author: 'Student Council', initials: 'SC', text: 'The MBA Networking Mixer is this Friday, Apr 11 at 7 PM in Room 400. Come meet alumni and industry guests!', time: '1h', likes: 14, comments: 3 },
      { id: 'cp2', author: 'Career Center', initials: 'CC', text: 'Resume Workshop on Apr 16 at 5 PM. Bring a printed copy of your resume — limited spots available.', time: '3h', likes: 22, comments: 7 },
      { id: 'cp3', author: 'Dr. Angela Ross', initials: 'AR', text: 'BUS 401 reminder: Case Study draft due Apr 10. Office hours moved to Thursday 4–5 PM this week.', time: '5h', likes: 8, comments: 4 },
      { id: 'cp4', author: 'Lincoln University', initials: 'LU', text: 'Congratulations to our DBA cohort on completing their dissertation proposals. Excellence in action.', time: '1d', likes: 41, comments: 12 },
    ];
    return (
      <View style={[styles.screen, { backgroundColor: C.bg }]}>
        {/* Top bar */}
        <View style={[styles.topBarWrap, { paddingTop: insets.top, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
          <View style={styles.topBar}>
            <Pressable
              style={styles.topBarSide}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/(main)/social/create' as any); }}
            >
              <IconSymbol name="plus" size={22} color={C.label} />
            </Pressable>
            <View style={styles.viewPill}>
              <Text style={[styles.viewPillText, { color: C.label }]}>Campus Feed</Text>
            </View>
            <View style={[styles.topBarSide, { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }]}>
              <RolePill role={role} onPress={cycleRole} accentColor={accent} isPrimary={false} />
            </View>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_HEIGHT + 8, paddingBottom: 120 }}
        >
          {/* Pinned Announcements */}
          <Text style={{ fontSize: 11, color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 14, marginBottom: 8 }}>ANNOUNCEMENTS</Text>
          {ANNOUNCEMENTS.map(ann => (
            <View key={ann.id} style={{ marginHorizontal: 14, marginBottom: 8, backgroundColor: C.surface, borderRadius: 14, padding: 14, borderLeftWidth: 3, borderLeftColor: C.label }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <IconSymbol name="pin.fill" size={11} color={C.secondary} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.4 }}>Pinned</Text>
                <Text style={{ fontSize: 11, color: C.muted, marginLeft: 4 }}>{ann.date}</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, marginBottom: 4 }}>{ann.title}</Text>
              <Text style={{ fontSize: 13, color: C.secondary, lineHeight: 19 }}>{ann.body}</Text>
            </View>
          ))}

          {/* Campus Posts */}
          <Text style={{ fontSize: 11, color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 14, marginTop: 8, marginBottom: 8 }}>CAMPUS POSTS</Text>
          {CAMPUS_POSTS.map(post => (
            <View key={post.id} style={{ backgroundColor: C.bg, marginBottom: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 10 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: C.bg }}>{post.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{post.author}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{post.time}</Text>
                </View>
              </View>
              <Text style={{ fontSize: 15, color: C.label, paddingHorizontal: 14, paddingBottom: 12, lineHeight: 22 }}>{post.text}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, paddingHorizontal: 14, paddingBottom: 12 }}>
                <Pressable
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setLikedCampusPosts(prev => { const s = new Set(prev); if (s.has(post.id)) s.delete(post.id); else s.add(post.id); return s; }); }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
                >
                  <IconSymbol name={likedCampusPosts.has(post.id) ? 'heart.fill' : 'heart'} size={18} color={likedCampusPosts.has(post.id) ? C.red : C.secondary} />
                  <Text style={{ fontSize: 13, color: C.secondary }}>{post.likes + (likedCampusPosts.has(post.id) ? 1 : 0)}</Text>
                </Pressable>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <IconSymbol name="bubble.right" size={18} color={C.secondary} />
                  <Text style={{ fontSize: 13, color: C.secondary }}>{post.comments}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <IconSymbol name="square.and.arrow.up" size={18} color={C.secondary} />
                  <Text style={{ fontSize: 13, color: C.secondary }}>Share</Text>
                </View>
              </View>
              <View style={styles.postSeparator} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  // ── Community Pastor: Instagram-style church profile ────────────────────────────
  if (mode === 'community' && isAdmin) {
    return (
      <ICCLAPastorSocialView
        C={C}
        insets={insets}
        role={role}
        cycleRole={cycleRole}
        accent={accent}
        router={router}
      />
    );
  }

  // ── Community Member: Instagram-style church profile ────────────────────────────
  if (mode === 'community' && !isAdmin) {
    return (
      <ICCLAMemberSocialView
        C={C}
        insets={insets}
        role={role}
        cycleRole={cycleRole}
        accent={accent}
      />
    );
  }

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
          <View style={[styles.viewPill, { backgroundColor: 'transparent', borderWidth: 0 }]}>
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

          {/* Right: RolePill + filter icon */}
          <View style={[styles.topBarSide, { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8, width: 'auto' as any }]}>
            <RolePill
              role={role}
              onPress={cycleRole}
              accentColor={accent}
              isPrimary={isAdmin}
            />
            {view === 'feed' && (
              <Pressable onPress={() => setShowScopeBar(v => !v)}>
                <IconSymbol
                  name="line.3.horizontal.decrease.circle"
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
            <>
              {isAdmin && (
                <View style={{ marginHorizontal: 12, marginTop: 8, marginBottom: 4, backgroundColor: accent + '12', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: accent + '30', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: accent, alignItems: 'center', justifyContent: 'center' }}>
                    <IconSymbol name="building.2.fill" size={18} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: accent }}>
                      {mode === 'sports' ? 'Post as LU Oaklanders' :
                       mode === 'education' ? 'Post as Lincoln University' :
                       mode === 'community' ? 'Post as ICCLA' :
                       mode === 'business' ? 'Post as KaNeXT' : 'Post as Brand'}
                    </Text>
                    <Text style={{ fontSize: 11, color: accent + 'CC', marginTop: 1 }}>Internal + public posts · brand management</Text>
                  </View>
                  <Pressable
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: accent, borderWidth: 1, borderColor: accent }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>Post</Text>
                  </Pressable>
                </View>
              )}
              <StoriesRow stories={stories} onStoryPress={() => {}} />
            </>
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
    justifyContent: 'center',
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.separator,
    backgroundColor: C.surface,
    marginHorizontal: 10,
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
    fontWeight: '700',
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
    backgroundColor: C.activePill,
    borderColor: C.activePill,
  },
  scopePillText: {
    fontSize: 13,
    fontWeight: '500',
    color: C.secondary,
  },
  scopePillTextActive: {
    color: C.activePillText,
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
