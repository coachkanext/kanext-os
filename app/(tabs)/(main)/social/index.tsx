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
import { RolePill } from '@/components/ui/role-pill';
import { StoriesRow } from '@/components/social/stories-row';
import { ReelsPage } from '@/components/social/reels-page';
import { LikeAnimation } from '@/components/social/like-animation';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useAppContext } from '@/context/app-context';
import { hideFooter, showFooter, resetFooter } from '@/utils/global-footer-hide';
import { openSidePanel } from '@/utils/global-side-panel';
import { useDemoRole, MODE_ACCENTS } from '@/utils/demo-role-store';
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

// ── Social Screen (main) ──────────────────────────────────────────────────────

// ── Personal Owner: Creator Feed View ────────────────────────────────────────

type OwnerSocialTab = 'Feed' | 'Reels' | 'Profile';

const OWNER_FEED_POSTS = [
  { id: 'op1', text: 'Just shipped a new feature in KaNeXT. The grind never stops. 🚀', likes: 1234, comments: 84, views: 18400, saves: 203, time: '2h',  visibility: 'Public',           scheduled: false },
  { id: 'op2', text: 'Behind the scenes from the content shoot today. Studio life 🎬', likes: 892,  comments: 61, views: 12100, saves: 178, time: '1d',  visibility: 'Subscribers Only', scheduled: false },
  { id: 'op3', text: 'My morning routine that changed everything — full breakdown ↓', likes: 2103, comments: 147, views: 31500, saves: 892, time: '3d',  visibility: 'Public',           scheduled: false },
  { id: 'op4', text: 'Nike partnership announcement drops tomorrow. Stay tuned. 👀',  likes: 0,    comments: 0,   views: 0,     saves: 0,   time: 'Apr 7 · 9:00 AM', visibility: 'Public', scheduled: true  },
  { id: 'op5', text: 'Q1 brand recap — deals, revenue, lessons learned.',             likes: 1501, comments: 93, views: 22800, saves: 441, time: '5d',  visibility: 'Subscribers Only', scheduled: false },
];

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
  const [ownerTab, setOwnerTab] = useState<OwnerSocialTab>('Feed');
  const [ownerDrop, setOwnerDrop] = useState(false);
  const [ownerLiked, setOwnerLiked] = useState<Set<string>>(new Set());
  const [visibility, setVisibility] = useState<'Public' | 'Subscribers Only'>('Public');
  const TOP_BAR_H = 52;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top bar */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, height: insets.top + TOP_BAR_H, paddingTop: insets.top, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <IconSymbol name="plus" size={22} color={C.label} />
        </Pressable>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setOwnerDrop(v => !v); }} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>{ownerTab}</Text>
          <IconSymbol name={ownerDrop ? 'chevron.up' : 'chevron.down'} size={12} color={C.secondary} />
        </Pressable>
        <View style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <RolePill role={role} onPress={cycleRole} accentColor={accent} isPrimary />
        </View>
      </View>

      {/* Tab dropdown */}
      {ownerDrop && (
        <View style={{ position: 'absolute', top: insets.top + TOP_BAR_H + 4, left: '22%', right: '22%', backgroundColor: C.surface, borderRadius: 14, zIndex: 100, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8, overflow: 'hidden' }}>
          {(['Feed', 'Reels', 'Profile'] as OwnerSocialTab[]).map((tab, i, arr) => (
            <Pressable key={tab} onPress={() => { Haptics.selectionAsync(); setOwnerTab(tab); setOwnerDrop(false); }} style={{ paddingVertical: 13, paddingHorizontal: 16, borderBottomWidth: i < arr.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }}>
              <Text style={{ fontSize: 15, color: tab === ownerTab ? C.label : C.secondary, fontWeight: tab === ownerTab ? '600' : '400' }}>{tab}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* ── FEED ── */}
      {ownerTab === 'Feed' && (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 12, paddingBottom: 120 }}>
          {/* Composer */}
          <View style={{ marginHorizontal: 14, marginBottom: 14, backgroundColor: C.surface, borderRadius: 16, padding: 14 }}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/(main)/social/create' as any); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: C.bg, fontWeight: '700', fontSize: 13 }}>SK</Text>
              </View>
              <View style={{ flex: 1, height: 36, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, alignItems: 'flex-start', justifyContent: 'center', paddingHorizontal: 14 }}>
                <Text style={{ fontSize: 14, color: C.muted }}>{"What's on your mind?"}</Text>
              </View>
            </Pressable>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 12, color: C.secondary }}>Visibility:</Text>
              {(['Public', 'Subscribers Only'] as const).map(v => (
                <Pressable key={v} onPress={() => { Haptics.selectionAsync(); setVisibility(v); }} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: visibility === v ? C.label : C.surfacePressed }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: visibility === v ? C.bg : C.secondary }}>{v}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Posts with analytics */}
          {OWNER_FEED_POSTS.map(post => (
            <View key={post.id} style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6, gap: 10 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: C.bg, fontWeight: '700', fontSize: 13 }}>SK</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>Sammy Kalejaiye</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 1 }}>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{post.time}</Text>
                    {post.scheduled ? (
                      <View style={{ backgroundColor: '#B8943E22', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 1 }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: '#B8943E' }}>Scheduled</Text>
                      </View>
                    ) : (
                      <View style={{ backgroundColor: post.visibility === 'Public' ? '#5A8A6E22' : C.surfacePressed, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 1 }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: post.visibility === 'Public' ? '#5A8A6E' : C.secondary }}>{post.visibility}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                  <IconSymbol name="ellipsis" size={18} color={C.secondary} />
                </Pressable>
              </View>
              <Text style={{ fontSize: 15, color: C.label, paddingHorizontal: 14, paddingBottom: 10, lineHeight: 22 }}>{post.text}</Text>
              {!post.scheduled && (
                <View style={{ flexDirection: 'row', gap: 16, paddingHorizontal: 14, paddingBottom: 8 }}>
                  {[
                    { icon: 'eye', value: post.views >= 1000 ? `${(post.views / 1000).toFixed(1)}K` : `${post.views}` },
                    { icon: 'heart', value: post.likes >= 1000 ? `${(post.likes / 1000).toFixed(1)}K` : `${post.likes}` },
                    { icon: 'bubble.right', value: `${post.comments}` },
                    { icon: 'bookmark', value: `${post.saves}` },
                  ].map(stat => (
                    <View key={stat.icon} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <IconSymbol name={stat.icon as any} size={13} color={C.muted} />
                      <Text style={{ fontSize: 12, color: C.muted }}>{stat.value}</Text>
                    </View>
                  ))}
                </View>
              )}
              <View style={{ flexDirection: 'row', gap: 20, paddingHorizontal: 14, paddingBottom: 12 }}>
                <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setOwnerLiked(s => { const n = new Set(s); if (n.has(post.id)) n.delete(post.id); else n.add(post.id); return n; }); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <IconSymbol name={ownerLiked.has(post.id) ? 'heart.fill' : 'heart'} size={18} color={ownerLiked.has(post.id) ? C.red : C.secondary} />
                  <Text style={{ fontSize: 13, color: C.secondary }}>{post.likes + (ownerLiked.has(post.id) ? 1 : 0)}</Text>
                </Pressable>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <IconSymbol name="bubble.right" size={18} color={C.secondary} />
                  <Text style={{ fontSize: 13, color: C.secondary }}>{post.comments}</Text>
                </View>
                <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <IconSymbol name="pencil" size={16} color={C.secondary} />
                  <Text style={{ fontSize: 13, color: C.secondary }}>Edit</Text>
                </Pressable>
                <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <IconSymbol name="trash" size={16} color={C.secondary} />
                  <Text style={{ fontSize: 13, color: C.secondary }}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* ── REELS ── */}
      {ownerTab === 'Reels' && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: insets.top + TOP_BAR_H }}>
          <View style={{ marginHorizontal: 20, backgroundColor: C.surface, borderRadius: 16, padding: 24, alignItems: 'center' }}>
            <IconSymbol name="video.badge.plus" size={40} color={C.secondary} />
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.label, marginTop: 14, marginBottom: 6, textAlign: 'center' }}>Upload Your Reels</Text>
            <Text style={{ fontSize: 13, color: C.secondary, textAlign: 'center', lineHeight: 20, marginBottom: 20 }}>Short-form vertical videos. Reach your audience and grow your subscriber base.</Text>
            <View style={{ gap: 8, width: '100%' }}>
              {[
                { icon: 'video.fill', label: 'Record', sub: 'Shoot directly in app' },
                { icon: 'photo.on.rectangle', label: 'Upload from Library', sub: 'Select from camera roll' },
              ].map(opt => (
                <Pressable key={opt.label} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: pressed ? C.surfacePressed : C.bg, borderRadius: 12, padding: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator })}>
                  <IconSymbol name={opt.icon as any} size={20} color={C.label} />
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{opt.label}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{opt.sub}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 24, marginTop: 24 }}>
            {[{ label: 'Total Views', value: '48.2K' }, { label: 'Total Likes', value: '12.1K' }, { label: 'Reels', value: '23' }].map(s => (
              <View key={s.label} style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: C.label }}>{s.value}</Text>
                <Text style={{ fontSize: 12, color: C.secondary }}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ── PROFILE ── */}
      {ownerTab === 'Profile' && (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 16, paddingBottom: 120 }}>
          <View style={{ alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Text style={{ color: C.bg, fontWeight: '700', fontSize: 24 }}>SK</Text>
            </View>
            <Text style={{ fontSize: 20, fontWeight: '700', color: C.label, marginBottom: 4 }}>Sammy Kalejaiye</Text>
            <Text style={{ fontSize: 14, color: C.secondary, textAlign: 'center', marginBottom: 12 }}>Creator · Entrepreneur · Coach</Text>
            <View style={{ flexDirection: 'row', gap: 32, marginBottom: 16 }}>
              {[{ label: 'Posts', value: '247' }, { label: 'Followers', value: '12.4K' }, { label: 'Following', value: '847' }].map(s => (
                <View key={s.label} style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 17, fontWeight: '700', color: C.label }}>{s.value}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{s.label}</Text>
                </View>
              ))}
            </View>
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12, backgroundColor: C.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
              <IconSymbol name="pencil" size={14} color={C.label} />
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>Edit Profile</Text>
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 2 }}>
            {[...Array(9)].map((_, i) => (
              <Pressable key={i} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ width: '33.33%', aspectRatio: 1, padding: 1 }}>
                <View style={{ flex: 1, backgroundColor: `hsl(${i * 25 + 10}, 20%, ${C.bg === '#FFFFFF' ? 90 : 15}%)`, borderRadius: 2, alignItems: 'center', justifyContent: 'center' }}>
                  <IconSymbol name="photo" size={20} color={C.separator} />
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
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
          <IconSymbol name="line.3.horizontal" size={22} color={C.label} />
        </Pressable>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setEduDrop(v => !v); }} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>{eduTab}</Text>
          <IconSymbol name={eduDrop ? 'chevron.up' : 'chevron.down'} size={12} color={C.secondary} />
        </Pressable>
        <View style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <RolePill role={role} onPress={cycleRole} accentColor={accent} isPrimary />
        </View>
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
const SOCIAL_ROLE_KEYS: Record<string, string> = {
  sports:    'sports',
  education: 'education',
  community: 'community',
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
  type CommunityMemberTab = 'Feed' | 'Prayer Wall';
  type CommunityPastorTab = 'Feed' | 'Prayer Wall' | 'Announcements';
  const [cmTab,   setCmTab]   = useState<CommunityMemberTab>('Feed');
  const [cmDrop,  setCmDrop]  = useState(false);
  const [cpTab,   setCpTab]   = useState<CommunityPastorTab>('Feed');
  const [cpDrop,  setCpDrop]  = useState(false);
  const [cmLiked,    setCmLiked]    = useState<Set<string>>(new Set());
  const [cmPrayed,   setCmPrayed]   = useState<Set<string>>(new Set());
  const [cpLiked,    setCpLiked]    = useState<Set<string>>(new Set());
  const [cpPrayed,   setCpPrayed]   = useState<Set<string>>(new Set());
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

  const isPostLiked = (post: FeedPost) =>
    post.isLiked !== likedPostFlips.has(post.id);

  const isPostBookmarked = (post: FeedPost) =>
    post.isBookmarked !== bookmarkedPostFlips.has(post.id);


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
    const SUBSCRIBER_POSTS = [
      {
        id: 'sp1',
        text: 'Just shipped a new feature in KaNeXT. The grind never stops. 🚀',
        likes: '1.2K',
        comments: '84',
        time: '2h',
        locked: false,
      },
      {
        id: 'sp2',
        text: '5 things I learned building a startup from scratch:',
        likes: '1.2K',
        comments: '84',
        time: '1d',
        locked: false,
      },
      {
        id: 'sp3',
        text: 'Morning run done. Mindset right. Let\'s get it.',
        likes: '1.2K',
        comments: '84',
        time: '3d',
        locked: false,
      },
      {
        id: 'sp4',
        text: '🔒 Exclusive content for subscribers only',
        likes: '1.2K',
        comments: '84',
        time: '5d',
        locked: true,
      },
    ];

    return (
      <View style={[styles.screen, { backgroundColor: C.bg }]}>
        {/* Top bar */}
        <View style={[
          styles.topBarWrap,
          { paddingTop: insets.top, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
        ]}>
          <View style={styles.topBar}>
            {/* Left: menu icon */}
            <Pressable
              style={styles.topBarSide}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name="line.3.horizontal" size={22} color={C.label} />
            </Pressable>

            {/* Center: plain "Feed" title */}
            <View style={styles.viewPill}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: C.label }}>Feed</Text>
            </View>

            {/* Right: RolePill */}
            <View style={[styles.topBarSide, { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }]}>
              <RolePill
                role={role}
                onPress={cycleRole}
                accentColor={accent}
                isPrimary={false}
              />
            </View>
          </View>
        </View>

        {/* Feed */}
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_HEIGHT + 8, paddingBottom: 120 }}
        >
          {SUBSCRIBER_POSTS.map((post) => (
            <View key={post.id} style={{ backgroundColor: C.bg, marginBottom: 1 }}>
              {/* Post header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 10 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>SK</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>Sammy Kalejaiye</Text>
                  <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{post.time}</Text>
                </View>
              </View>

              {/* Post body */}
              <View style={{ position: 'relative' }}>
                <Text style={{ fontSize: 15, color: C.label, paddingHorizontal: 14, paddingBottom: 12, lineHeight: 22 }}>
                  {post.text}
                </Text>
                {post.locked && (
                  <View style={{
                    ...StyleSheet.absoluteFillObject,
                    backgroundColor: C.bg + 'CC',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 20,
                  }}>
                    <IconSymbol name="lock.fill" size={24} color={C.secondary} />
                    <Text style={{ fontSize: 13, color: C.secondary, marginTop: 6, marginBottom: 14 }}>
                      Subscribe to unlock
                    </Text>
                    <Pressable
                      style={({ pressed }) => ({
                        backgroundColor: C.label,
                        paddingHorizontal: 24,
                        paddingVertical: 10,
                        borderRadius: 12,
                        opacity: pressed ? 0.8 : 1,
                      })}
                      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '600', color: C.bg }}>Subscribe</Text>
                    </Pressable>
                  </View>
                )}
              </View>

              {/* Engagement row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, paddingHorizontal: 14, paddingBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <IconSymbol name="heart" size={18} color={C.secondary} />
                  <Text style={{ fontSize: 13, color: C.secondary }}>{post.likes}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <IconSymbol name="bubble.right" size={18} color={C.secondary} />
                  <Text style={{ fontSize: 13, color: C.secondary }}>{post.comments}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <IconSymbol name="square.and.arrow.up" size={18} color={C.secondary} />
                  <Text style={{ fontSize: 13, color: C.secondary }}>Share</Text>
                </View>
              </View>

              {/* Separator */}
              <View style={styles.postSeparator} />
            </View>
          ))}

          {/* Subscribe CTA card */}
          <View style={{
            backgroundColor: C.surface,
            borderRadius: 16,
            margin: 16,
            padding: 20,
          }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.label, marginBottom: 6 }}>
              Unlock exclusive content from Sammy
            </Text>
            <Text style={{ fontSize: 13, color: C.secondary, lineHeight: 19, marginBottom: 16 }}>
              Get access to subscriber-only posts, behind-the-scenes updates, and more.
            </Text>
            <Pressable
              style={({ pressed }) => ({
                backgroundColor: C.label,
                borderRadius: 12,
                paddingVertical: 13,
                alignItems: 'center',
                opacity: pressed ? 0.8 : 1,
              })}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: C.bg }}>Subscribe</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
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
              <Text style={{ fontSize: 17, fontWeight: '700', color: C.label }}>Campus Feed</Text>
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

  // ── Community Member: Feed + Prayer Wall ─────────────────────────────────
  if (mode === 'community' && !isAdmin) {
    const COMMUNITY_POSTS = [
      { id: 'cm1', initials: 'IC', author: 'ICCLA',          time: '2h', likes: 47,  comments: 12, text: 'Sunday service was incredible this week. Thank you to everyone who came and worshipped with us. We are ICCLA — family.' },
      { id: 'cm2', initials: 'WT', author: 'Worship Team',   time: '5h', likes: 23,  comments: 4,  text: 'Rehearsal this Saturday at 9 AM. New song introduction — come prepared. See you there!' },
      { id: 'cm3', initials: 'BA', author: 'Blessing A.',    time: '1d', likes: 61,  comments: 18, text: 'Romans 8:28 has been on my heart all week. All things work together for good to those who love God. 🙏' },
      { id: 'cm4', initials: 'IC', author: 'ICCLA',          time: '2d', likes: 89,  comments: 22, text: 'Our Building Fund received its largest single-month total this year. God is faithful! Thank you for your generosity.' },
      { id: 'cm5', initials: 'YM', author: 'Youth Ministry', time: '3d', likes: 104, comments: 31, text: 'Our teens raised $840 for the Community Outreach Food Drive. Proud of these young leaders!' },
    ];
    const PRAYER_REQUESTS = [
      { id: 'pr1', author: 'Grace O.',    date: 'Apr 2', prayerCount: 34, answered: false, text: "Please pray for my mother's surgery scheduled for next week. Believing for a smooth recovery and divine healing." },
      { id: 'pr2', author: 'Anonymous',  date: 'Apr 1', prayerCount: 27, answered: false, text: 'Going through a difficult season at work. Praying for wisdom and clarity in my next steps.' },
      { id: 'pr3', author: 'David K.',   date: 'Mar 30', prayerCount: 52, answered: true,  text: "Grateful for answered prayer — my son's scholarship came through! God is so good and faithful." },
      { id: 'pr4', author: 'Miriam T.',  date: 'Mar 29', prayerCount: 41, answered: false, text: "Please pray for reconciliation in my family. We haven't spoken in years and my heart is heavy." },
      { id: 'pr5', author: 'Anonymous',  date: 'Mar 28', prayerCount: 19, answered: false, text: 'Battling anxiety and some health concerns. Just asking for prayer and peace that surpasses understanding.' },
    ];
    return (
      <View style={[styles.screen, { backgroundColor: C.bg }]}>
        <View style={[styles.topBarWrap, { paddingTop: insets.top, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
          <View style={styles.topBar}>
            <Pressable style={styles.topBarSide} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
              <IconSymbol name="line.3.horizontal" size={22} color={C.label} />
            </Pressable>
            <Pressable style={styles.viewPill} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCmDrop(v => !v); }}>
              <Text style={[styles.viewPillText, { color: C.label }]}>{cmTab}</Text>
              <IconSymbol name={cmDrop ? 'chevron.up' : 'chevron.down'} size={12} color={C.secondary} style={{ marginLeft: 4 }} />
            </Pressable>
            <View style={[styles.topBarSide, { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }]}>
              <RolePill role={role} onPress={cycleRole} accentColor={accent} isPrimary={false} />
            </View>
          </View>
        </View>
        {cmDrop && (
          <View style={{ position: 'absolute', top: insets.top + TOP_BAR_HEIGHT + 4, left: '22%', right: '22%', backgroundColor: C.surface, borderRadius: 14, zIndex: 100, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8, overflow: 'hidden' }}>
            {(['Feed', 'Prayer Wall'] as CommunityMemberTab[]).map(tab => (
              <Pressable key={tab} style={{ paddingVertical: 14, paddingHorizontal: 18, borderBottomWidth: tab !== 'Prayer Wall' ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }} onPress={() => { Haptics.selectionAsync(); setCmTab(tab); setCmDrop(false); }}>
                <Text style={{ fontSize: 15, color: tab === cmTab ? C.label : C.secondary, fontWeight: tab === cmTab ? '600' : '400' }}>{tab}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {cmTab === 'Feed' && (
          <ScrollView contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_HEIGHT + 8, paddingBottom: 120 }} showsVerticalScrollIndicator={false} onScroll={handleFeedScroll} scrollEventThrottle={16}>
            {/* Composer */}
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/(main)/social/create' as any); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 14, marginBottom: 12, backgroundColor: C.surface, borderRadius: 14, padding: 12 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: C.bg, fontWeight: '700', fontSize: 13 }}>ME</Text>
              </View>
              <View style={{ flex: 1, height: 36, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, alignItems: 'flex-start', justifyContent: 'center', paddingHorizontal: 14 }}>
                <Text style={{ fontSize: 14, color: C.muted }}>Share with the community...</Text>
              </View>
            </Pressable>
            {COMMUNITY_POSTS.map(post => (
              <View key={post.id} style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6, gap: 10 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: C.bg, fontWeight: '700', fontSize: 13 }}>{post.initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{post.author}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{post.time}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 15, color: C.label, paddingHorizontal: 14, paddingBottom: 10, lineHeight: 22 }}>{post.text}</Text>
                <View style={{ flexDirection: 'row', gap: 20, paddingHorizontal: 14, paddingBottom: 12 }}>
                  <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCmLiked(s => { const n = new Set(s); if (n.has(post.id)) n.delete(post.id); else n.add(post.id); return n; }); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <IconSymbol name={cmLiked.has(post.id) ? 'heart.fill' : 'heart'} size={18} color={cmLiked.has(post.id) ? C.red : C.secondary} />
                    <Text style={{ fontSize: 13, color: C.secondary }}>{post.likes + (cmLiked.has(post.id) ? 1 : 0)}</Text>
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
              </View>
            ))}
          </ScrollView>
        )}
        {cmTab === 'Prayer Wall' && (
          <ScrollView contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_HEIGHT + 12, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} style={{ marginHorizontal: 14, marginBottom: 16, backgroundColor: C.label, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}>
              <Text style={{ color: C.bg, fontSize: 15, fontWeight: '700' }}>Submit a Prayer Request</Text>
            </Pressable>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 14, marginBottom: 10 }}>ACTIVE REQUESTS</Text>
            {PRAYER_REQUESTS.map(req => (
              <View key={req.id} style={{ marginHorizontal: 14, marginBottom: 10, backgroundColor: C.surface, borderRadius: 14, padding: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{req.author}</Text>
                    {req.answered && (
                      <View style={{ backgroundColor: '#5A8A6E22', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#5A8A6E' }}>Answered</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontSize: 11, color: C.muted }}>{req.date}</Text>
                </View>
                <Text style={{ fontSize: 14, color: C.label, lineHeight: 21, marginBottom: 12 }}>{req.text}</Text>
                <Pressable
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCmPrayed(s => { const n = new Set(s); if (n.has(req.id)) n.delete(req.id); else n.add(req.id); return n; }); }}
                  style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: cmPrayed.has(req.id) ? C.label : 'transparent', borderWidth: 1, borderColor: cmPrayed.has(req.id) ? C.label : C.separator }}
                >
                  <IconSymbol name="hands.and.sparkles.fill" size={14} color={cmPrayed.has(req.id) ? C.bg : C.secondary} />
                  <Text style={{ fontSize: 12, fontWeight: '600', color: cmPrayed.has(req.id) ? C.bg : C.secondary }}>
                    Praying · {req.prayerCount + (cmPrayed.has(req.id) ? 1 : 0)}
                  </Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    );
  }

  // ── Community Pastor: Feed + Prayer Wall + Announcements ──────────────────
  if (mode === 'community' && isAdmin) {
    const PASTOR_POSTS = [
      { id: 'pp1', initials: 'IC', author: 'ICCLA', time: '2h', likes: 47, comments: 12, visibility: 'Public',     text: 'Sunday service was incredible this week. Thank you to everyone who came and worshipped with us.' },
      { id: 'pp2', initials: 'WT', author: 'Worship Team', time: '5h', likes: 23, comments: 4, visibility: 'Community', text: 'Rehearsal this Saturday at 9 AM. New song introduction — come prepared.' },
      { id: 'pp3', initials: 'BA', author: 'Blessing A.', time: '1d', likes: 61, comments: 18, visibility: 'Community', text: 'Romans 8:28 has been on my heart all week. All things work together for good. 🙏' },
      { id: 'pp4', initials: 'OK', author: 'Dr. Oladipo K.', time: '2d', likes: 14, comments: 6, visibility: 'Leadership', text: 'Deacon and Elder board meeting next Tuesday at 6:30 PM. Please review the agenda beforehand.' },
      { id: 'pp5', initials: 'IC', author: 'ICCLA', time: '3d', likes: 89, comments: 22, visibility: 'Public', text: 'Our Building Fund received its largest single-month total this year. God is faithful!' },
    ];
    const VIS_COLORS: Record<string, string> = { Public: '#5A8A6E', Community: C.secondary, Leadership: '#B8943E' };
    const PRAYER_REQUESTS_PASTOR = [
      { id: 'pr1', author: 'Grace O.',   date: 'Apr 2', prayerCount: 34, answered: false, text: "Please pray for my mother's surgery next week. Believing for a smooth recovery." },
      { id: 'pr2', author: 'Anonymous', date: 'Apr 1', prayerCount: 27, answered: false, text: 'Difficult season at work. Praying for wisdom and clarity in my next steps.' },
      { id: 'pr3', author: 'David K.',  date: 'Mar 30', prayerCount: 52, answered: true,  text: "Grateful for answered prayer — my son's scholarship came through! God is faithful." },
      { id: 'pr4', author: 'Miriam T.', date: 'Mar 29', prayerCount: 41, answered: false, text: "Please pray for reconciliation in my family. We haven't spoken in years." },
      { id: 'pr5', author: 'Anonymous', date: 'Mar 28', prayerCount: 19, answered: false, text: 'Battling anxiety and some health concerns. Asking for prayer and peace.' },
    ];
    const ANNOUNCEMENTS_LIST = [
      { id: 'an1', title: 'Easter Sunday Service — Apr 5', body: 'Special Resurrection Sunday celebration at 9 AM and 11 AM. Invite family and friends. Childcare available.', date: 'Apr 2', reads: 312, ack: 189, scheduled: false },
      { id: 'an2', title: 'New Member Class — Apr 12', body: 'Starting April 12 after Sunday service. Required for all who wish to become official members of ICCLA.', date: 'Apr 1', reads: 147, ack: 82, scheduled: false },
      { id: 'an3', title: 'Building Fund Update', body: 'We have reached 68% of our construction goal. Praise God! Continue to give generously toward completing His house.', date: 'Mar 30', reads: 278, ack: 204, scheduled: false },
    ];
    return (
      <View style={[styles.screen, { backgroundColor: C.bg }]}>
        <View style={[styles.topBarWrap, { paddingTop: insets.top, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
          <View style={styles.topBar}>
            <Pressable style={styles.topBarSide} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
              <IconSymbol name="line.3.horizontal" size={22} color={C.label} />
            </Pressable>
            <Pressable style={styles.viewPill} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCpDrop(v => !v); }}>
              <Text style={[styles.viewPillText, { color: C.label }]}>{cpTab}</Text>
              <IconSymbol name={cpDrop ? 'chevron.up' : 'chevron.down'} size={12} color={C.secondary} style={{ marginLeft: 4 }} />
            </Pressable>
            <View style={[styles.topBarSide, { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }]}>
              <RolePill role={role} onPress={cycleRole} accentColor={accent} isPrimary />
            </View>
          </View>
        </View>
        {cpDrop && (
          <View style={{ position: 'absolute', top: insets.top + TOP_BAR_HEIGHT + 4, left: '18%', right: '18%', backgroundColor: C.surface, borderRadius: 14, zIndex: 100, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8, overflow: 'hidden' }}>
            {(['Feed', 'Prayer Wall', 'Announcements'] as CommunityPastorTab[]).map((tab, i, arr) => (
              <Pressable key={tab} style={{ paddingVertical: 14, paddingHorizontal: 18, borderBottomWidth: i < arr.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }} onPress={() => { Haptics.selectionAsync(); setCpTab(tab); setCpDrop(false); }}>
                <Text style={{ fontSize: 15, color: tab === cpTab ? C.label : C.secondary, fontWeight: tab === cpTab ? '600' : '400' }}>{tab}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {cpTab === 'Feed' && (
          <ScrollView contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_HEIGHT + 8, paddingBottom: 120 }} showsVerticalScrollIndicator={false} onScroll={handleFeedScroll} scrollEventThrottle={16}>
            {/* Composer */}
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/(main)/social/create' as any); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 14, marginBottom: 12, backgroundColor: C.surface, borderRadius: 14, padding: 12 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: C.bg, fontWeight: '700', fontSize: 13 }}>IC</Text>
              </View>
              <View style={{ flex: 1, height: 36, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, alignItems: 'flex-start', justifyContent: 'center', paddingHorizontal: 14 }}>
                <Text style={{ fontSize: 14, color: C.muted }}>Post as ICCLA...</Text>
              </View>
              <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: C.surfacePressed }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary }}>Public</Text>
              </Pressable>
            </Pressable>
            {PASTOR_POSTS.map(post => (
              <View key={post.id} style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6, gap: 10 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: C.bg, fontWeight: '700', fontSize: 13 }}>{post.initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{post.author}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <Text style={{ fontSize: 12, color: C.secondary }}>{post.time}</Text>
                      <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: C.separator }} />
                      <Text style={{ fontSize: 11, fontWeight: '700', color: VIS_COLORS[post.visibility] ?? C.secondary }}>{post.visibility}</Text>
                    </View>
                  </View>
                  <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                    <IconSymbol name="ellipsis" size={18} color={C.secondary} />
                  </Pressable>
                </View>
                <Text style={{ fontSize: 15, color: C.label, paddingHorizontal: 14, paddingBottom: 10, lineHeight: 22 }}>{post.text}</Text>
                <View style={{ flexDirection: 'row', gap: 20, paddingHorizontal: 14, paddingBottom: 12 }}>
                  <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCpLiked(s => { const n = new Set(s); if (n.has(post.id)) n.delete(post.id); else n.add(post.id); return n; }); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <IconSymbol name={cpLiked.has(post.id) ? 'heart.fill' : 'heart'} size={18} color={cpLiked.has(post.id) ? C.red : C.secondary} />
                    <Text style={{ fontSize: 13, color: C.secondary }}>{post.likes + (cpLiked.has(post.id) ? 1 : 0)}</Text>
                  </Pressable>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <IconSymbol name="bubble.right" size={18} color={C.secondary} />
                    <Text style={{ fontSize: 13, color: C.secondary }}>{post.comments}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <IconSymbol name="pin" size={18} color={C.secondary} />
                    <Text style={{ fontSize: 13, color: C.secondary }}>Pin</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
        {cpTab === 'Prayer Wall' && (
          <ScrollView contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_HEIGHT + 12, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 14, marginBottom: 10 }}>ACTIVE REQUESTS</Text>
            {PRAYER_REQUESTS_PASTOR.map(req => (
              <View key={req.id} style={{ marginHorizontal: 14, marginBottom: 10, backgroundColor: C.surface, borderRadius: 14, padding: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{req.author}</Text>
                    {req.answered && (
                      <View style={{ backgroundColor: '#5A8A6E22', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#5A8A6E' }}>Answered</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontSize: 11, color: C.muted }}>{req.date}</Text>
                </View>
                <Text style={{ fontSize: 14, color: C.label, lineHeight: 21, marginBottom: 12 }}>{req.text}</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCpPrayed(s => { const n = new Set(s); if (n.has(req.id)) n.delete(req.id); else n.add(req.id); return n; }); }}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: cpPrayed.has(req.id) ? C.label : 'transparent', borderWidth: 1, borderColor: cpPrayed.has(req.id) ? C.label : C.separator }}
                  >
                    <IconSymbol name="hands.and.sparkles.fill" size={14} color={cpPrayed.has(req.id) ? C.bg : C.secondary} />
                    <Text style={{ fontSize: 12, fontWeight: '600', color: cpPrayed.has(req.id) ? C.bg : C.secondary }}>Praying · {req.prayerCount + (cpPrayed.has(req.id) ? 1 : 0)}</Text>
                  </Pressable>
                  {!req.answered && (
                    <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: C.separator }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary }}>Respond</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        )}
        {cpTab === 'Announcements' && (
          <ScrollView contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_HEIGHT + 12, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} style={{ marginHorizontal: 14, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.label, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18 }}>
              <IconSymbol name="megaphone.fill" size={16} color={C.bg} />
              <Text style={{ color: C.bg, fontSize: 15, fontWeight: '700' }}>Create Announcement</Text>
            </Pressable>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 14, marginBottom: 10 }}>PUBLISHED</Text>
            {ANNOUNCEMENTS_LIST.map(ann => (
              <View key={ann.id} style={{ marginHorizontal: 14, marginBottom: 10, backgroundColor: C.surface, borderRadius: 14, padding: 14, borderLeftWidth: 3, borderLeftColor: C.label }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, flex: 1 }}>{ann.title}</Text>
                  <Text style={{ fontSize: 11, color: C.muted, marginLeft: 8 }}>{ann.date}</Text>
                </View>
                <Text style={{ fontSize: 13, color: C.secondary, lineHeight: 20, marginBottom: 10 }}>{ann.body}</Text>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <IconSymbol name="eye" size={13} color={C.muted} />
                    <Text style={{ fontSize: 12, color: C.muted }}>{ann.reads} reads</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <IconSymbol name="checkmark.circle" size={13} color={C.muted} />
                    <Text style={{ fontSize: 12, color: C.muted }}>{ann.ack} acknowledged</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
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
