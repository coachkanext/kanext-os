/**
 * KayTV Player — Video player with mini-player PiP, brand tag, comment input.
 * Swipe down on video area → mini-player bar. Tap bar → restore. X → dismiss.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, Pressable, ScrollView,
  StyleSheet, useWindowDimensions, PanResponder,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';
import {
  getKayTVFeedItem, getRelatedFeedItems, MOCK_VIDEO_COMMENTS,
  formatViewCount, formatVideoTimestamp,
  type KayTVFeedItem,
} from '@/data/mock-kaytv';

// Fallback brand labels for videos that pre-date the brandName field
const BRAND_LABELS: Record<string, string> = {
  sports: 'Varsity FC',
  business: 'NovaTech',
  education: 'Lincoln Univ.',
  community: 'Grace Church',
  personal: 'Personal',
};

// ── RelatedCard ────────────────────────────────────────────────────────────

function RelatedCard({
  video, C, onPress,
}: { video: KayTVFeedItem; C: ComponentColors; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.relCard, { opacity: pressed ? 0.88 : 1 }]}
    >
      <View style={[styles.relThumb, { backgroundColor: `hsl(${video.thumbHue},38%,32%)` }]}>
        <Text style={styles.relEmoji}>{video.thumbEmoji}</Text>
        <View style={styles.relDuration}><Text style={styles.relDurationText}>{video.duration}</Text></View>
      </View>
      <View style={styles.relMeta}>
        <Text style={[styles.relTitle, { color: C.label }]} numberOfLines={2}>{video.title}</Text>
        <Text style={[styles.relSub, { color: C.secondary }]} numberOfLines={1}>
          {video.uploaderName} · {formatViewCount(video.viewCount)}
        </Text>
        <Text style={[styles.relSub, { color: C.secondary }]}>{formatVideoTimestamp(video.timestamp)}</Text>
      </View>
      <Pressable
        hitSlop={10}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        style={styles.relOptions}
      >
        <IconSymbol name="ellipsis" size={14} color={C.secondary} />
      </Pressable>
    </Pressable>
  );
}

// ── Player Screen ──────────────────────────────────────────────────────────

export default function KayTVPlayerScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { videoId } = useLocalSearchParams<{ videoId: string }>();

  const video = getKayTVFeedItem(videoId);
  const related = video ? getRelatedFeedItems(video) : [];

  const player = useVideoPlayer((video?.videoUri ?? null) as any, p => {
    p.loop = false;
    p.play();
  });

  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [playing, setPlaying] = useState(!!video?.videoUri);
  const [minimized, setMinimized] = useState(false);

  const lastScrollY = useRef(0);
  const playerH = Math.round(width * (9 / 16));

  // PanResponder for swipe-down to minimize
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 10 && gs.dy > Math.abs(gs.dx) * 1.5,
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 80) setMinimized(true);
      },
    })
  ).current;

  const likeCount = video
    ? (liked && !video.likeCount ? 1 : liked ? video.likeCount + 1 : video.likeCount)
    : 0;

  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  if (!video) {
    return (
      <View style={[styles.notFound, { backgroundColor: C.bg, paddingTop: insets.top + 60 }]}>
        <IconSymbol name="play.rectangle" size={44} color={C.muted} />
        <Text style={[styles.notFoundText, { color: C.secondary }]}>Video not found</Text>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { borderColor: C.inputBorder }]}>
          <Text style={[styles.backBtnText, { color: C.label }]}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: C.bg }]}>

      {/* ── Player area (outside ScrollView, above content) ── */}
      {!minimized ? (
        <View
          style={[styles.player, { height: playerH + insets.top, paddingTop: insets.top }]}
          {...panResponder.panHandlers}
        >
          {video.videoUri ? (
            /* Real video playback */
            <VideoView
              player={player}
              style={[StyleSheet.absoluteFill, { top: insets.top }]}
              contentFit="contain"
              nativeControls={false}
            />
          ) : null}

          {/* Play/pause tap overlay */}
          <Pressable
            style={styles.playerTap}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const next = !playing;
              setPlaying(next);
              if (video.videoUri) {
                if (next) player.play();
                else player.pause();
              }
            }}
          >
            <View style={[styles.playIconWrap, playing && video.videoUri ? { opacity: 0 } : {}]}>
              <IconSymbol
                name={playing ? 'pause.fill' : 'play.fill'}
                size={42}
                color="rgba(255,255,255,0.88)"
              />
            </View>
          </Pressable>

          {/* Back arrow */}
          <Pressable
            style={[styles.playerBack, { top: insets.top + 10 }]}
            onPress={() => router.back()}
            hitSlop={10}
          >
            <IconSymbol name="chevron.left" size={20} color="#fff" />
          </Pressable>

          {/* More options */}
          <Pressable
            style={[styles.playerMore, { top: insets.top + 10 }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            hitSlop={10}
          >
            <IconSymbol name="ellipsis" size={18} color="#fff" />
          </Pressable>

          {/* Progress bar (shown when no native video controls) */}
          {!video.videoUri && (
            <View style={styles.progressBg}>
              <View style={styles.progressFill} />
            </View>
          )}
        </View>
      ) : null}

      {/* ── Scrollable content ── */}
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        style={{ flex: 1 }}
      >
        {/* Video title */}
        <View style={[styles.section, { paddingTop: 14 }]}>
          <Text style={[styles.videoTitle, { color: C.label }]}>{video.title}</Text>
          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { color: C.secondary }]}>
              {formatViewCount(video.viewCount)} · {formatVideoTimestamp(video.timestamp)}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.actionsRow}
        >
          {/* Like */}
          <Pressable
            style={[styles.actionBtn, { backgroundColor: liked ? C.label : C.surface }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setLiked(v => !v);
              if (disliked) setDisliked(false);
            }}
          >
            <IconSymbol
              name={liked ? 'hand.thumbsup.fill' : 'hand.thumbsup'}
              size={17}
              color={liked ? C.bg : C.label}
            />
            <Text style={[styles.actionLabel, { color: liked ? C.bg : C.label }]}>
              {likeCount.toLocaleString()}
            </Text>
          </Pressable>

          <View style={[styles.actionDivider, { backgroundColor: C.separator }]} />

          {/* Dislike */}
          <Pressable
            style={[styles.actionBtn, { backgroundColor: disliked ? C.label : C.surface }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setDisliked(v => !v);
              if (liked) setLiked(false);
            }}
          >
            <IconSymbol
              name={disliked ? 'hand.thumbsdown.fill' : 'hand.thumbsdown'}
              size={17}
              color={disliked ? C.bg : C.label}
            />
          </Pressable>

          <View style={{ width: 8 }} />

          {/* Share */}
          <Pressable
            style={[styles.actionPill, { backgroundColor: C.surface }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="arrowshape.turn.up.right" size={16} color={C.label} />
            <Text style={[styles.actionLabel, { color: C.label }]}>Share</Text>
          </Pressable>

          {/* Save */}
          <Pressable
            style={[styles.actionPill, { backgroundColor: saved ? C.label : C.surface }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSaved(v => !v);
            }}
          >
            <IconSymbol
              name={saved ? 'bookmark.fill' : 'bookmark'}
              size={16}
              color={saved ? C.bg : C.label}
            />
            <Text style={[styles.actionLabel, { color: saved ? C.bg : C.label }]}>Save</Text>
          </Pressable>

          {/* Download */}
          <Pressable
            style={[styles.actionPill, { backgroundColor: C.surface }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="arrow.down.circle" size={16} color={C.label} />
            <Text style={[styles.actionLabel, { color: C.label }]}>Download</Text>
          </Pressable>
        </ScrollView>

        <View style={[styles.divider, { backgroundColor: C.separator }]} />

        {/* Channel row + brand tag */}
        <View style={styles.channelRow}>
          <View style={[styles.channelAvatar, { backgroundColor: C.surfacePressed }]}>
            <Text style={[styles.channelAvatarText, { color: C.label }]}>{video.uploaderInitials}</Text>
          </View>

          <View style={styles.channelInfo}>
            <Text style={[styles.channelName, { color: C.label }]}>{video.uploaderName}</Text>
            <View style={styles.channelHandleRow}>
              <Text style={[styles.channelHandle, { color: C.secondary }]}>{video.uploaderHandle}</Text>
              <View style={[styles.brandTag, { backgroundColor: C.surface }]}>
                <Text style={[styles.brandTagText, { color: C.secondary }]}>
                  {video.brandName ?? BRAND_LABELS[video.mode] ?? video.mode}
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            style={[styles.subscribeBtn, { backgroundColor: subscribed ? C.surface : C.label }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSubscribed(v => !v);
            }}
          >
            <Text style={[styles.subscribeBtnText, { color: subscribed ? C.label : C.bg }]}>
              {subscribed ? 'Subscribed' : 'Subscribe'}
            </Text>
          </Pressable>
        </View>

        <View style={[styles.divider, { backgroundColor: C.separator }]} />

        {/* Description */}
        <Pressable
          style={[styles.section, styles.descBlock, { backgroundColor: C.surface }]}
          onPress={() => setDescExpanded(v => !v)}
        >
          <Text style={[styles.descText, { color: C.label }]} numberOfLines={descExpanded ? undefined : 2}>
            {video.description}
          </Text>
          <View style={styles.descFooter}>
            <Text style={[styles.descMore, { color: C.secondary }]}>
              {descExpanded ? 'Show less' : 'more'}
            </Text>
          </View>
        </Pressable>

        <View style={[styles.divider, { backgroundColor: C.separator }]} />

        {/* Comments */}
        <View style={styles.section}>
          <View style={styles.commentsHeader}>
            <Text style={[styles.commentsTitle, { color: C.label }]}>
              Comments <Text style={{ color: C.secondary }}>{video.commentCount.toLocaleString()}</Text>
            </Text>
            <Pressable
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              style={styles.sortBtn}
              hitSlop={8}
            >
              <IconSymbol name="arrow.up.arrow.down" size={15} color={C.secondary} />
              <Text style={[styles.sortLabel, { color: C.secondary }]}>Top</Text>
            </Pressable>
          </View>

          {/* Comment input row */}
          <View style={styles.commentInputRow}>
            <View style={[styles.ciAvatar, { backgroundColor: C.surfacePressed }]}>
              <Text style={[styles.ciAvatarText, { color: C.label }]}>SK</Text>
            </View>
            <Pressable
              style={[styles.ciInput, { backgroundColor: C.surface, borderColor: C.inputBorder }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text style={{ color: C.muted, fontSize: 13 }}>Add a comment…</Text>
            </Pressable>
          </View>

          {MOCK_VIDEO_COMMENTS.slice(0, 3).map(c => (
            <View key={c.id} style={styles.commentRow}>
              <View style={[styles.commentAvatar, { backgroundColor: C.surfacePressed }]}>
                <Text style={[styles.commentAvatarText, { color: C.label }]}>{c.authorInitials}</Text>
              </View>
              <View style={styles.commentBody}>
                <Text style={[styles.commentAuthor, { color: C.label }]}>{c.authorName}</Text>
                <Text style={[styles.commentText, { color: C.label }]}>{c.text}</Text>
                <View style={styles.commentMeta}>
                  <IconSymbol name="hand.thumbsup" size={12} color={C.secondary} />
                  <Text style={[styles.commentLikes, { color: C.secondary }]}>{c.likeCount}</Text>
                  <Text style={[styles.commentTime, { color: C.muted }]}>{formatVideoTimestamp(c.timestamp)}</Text>
                </View>
              </View>
            </View>
          ))}

          {video.commentCount > 3 ? (
            <Pressable
              style={styles.viewAllComments}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text style={[styles.viewAllText, { color: C.accent }]}>
                View all {video.commentCount} comments
              </Text>
            </Pressable>
          ) : null}
        </View>

        <View style={[styles.divider, { backgroundColor: C.separator }]} />

        {/* Related */}
        {related.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.relatedTitle, { color: C.label }]}>Up next</Text>
            {related.map(v => (
              <RelatedCard
                key={v.id}
                video={v}
                C={C}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.replace({
                    pathname: '/(tabs)/(main)/kaytv/player' as any,
                    params: { videoId: v.id },
                  });
                }}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>

      {/* ── Mini Player (PiP) ── */}
      {minimized ? (
        <View style={[styles.miniPlayer, { bottom: insets.bottom + 49 + 8 }]}>
          <Pressable
            style={styles.miniPlayerBody}
            onPress={() => setMinimized(false)}
          >
            <View style={[styles.miniThumb, { backgroundColor: `hsl(${video.thumbHue},38%,32%)` }]}>
              <Text style={styles.miniEmoji}>{video.thumbEmoji}</Text>
            </View>
            <View style={styles.miniInfo}>
              <Text style={styles.miniTitle} numberOfLines={1}>{video.title}</Text>
              <Text style={styles.miniChannel} numberOfLines={1}>{video.uploaderName}</Text>
            </View>
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setPlaying(v => !v);
            }}
            hitSlop={10}
            style={styles.miniAction}
          >
            <IconSymbol name={playing ? 'pause.fill' : 'play.fill'} size={18} color="#fff" />
          </Pressable>
          <Pressable
            onPress={() => {
              if (video.videoUri) player.pause();
              router.back();
            }}
            hitSlop={10}
            style={styles.miniClose}
          >
            <IconSymbol name="xmark" size={14} color="rgba(255,255,255,0.8)" />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },

  // Player
  player: {
    width: '100%',
    backgroundColor: '#000',
    justifyContent: 'flex-end',
  },
  playerTap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  playerBack: {
    position: 'absolute', left: 14,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.32)',
    alignItems: 'center', justifyContent: 'center',
  },
  playerMore: {
    position: 'absolute', right: 14,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.32)',
    alignItems: 'center', justifyContent: 'center',
  },
  progressBg: { height: 3, backgroundColor: 'rgba(255,255,255,0.25)' },
  progressFill: { height: 3, backgroundColor: '#fff', width: '0%' },

  // Info
  section: { paddingHorizontal: 16 },
  videoTitle: { fontSize: 16, fontWeight: '600', lineHeight: 22 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 12 },
  metaText: { fontSize: 13 },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16, paddingBottom: 14,
    alignItems: 'center', gap: 0,
  },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 20, gap: 6,
  },
  actionDivider: { width: 1, height: 28, borderRadius: 1 },
  actionPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 20, gap: 6, marginLeft: 8,
  },
  actionLabel: { fontSize: 13, fontWeight: '500' },

  divider: { height: StyleSheet.hairlineWidth },

  // Channel
  channelRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  channelAvatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  channelAvatarText: { fontSize: 14, fontWeight: '600' },
  channelInfo: { flex: 1, minWidth: 0 },
  channelName: { fontSize: 14, fontWeight: '600' },
  channelHandleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  channelHandle: { fontSize: 12 },
  brandTag: {
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 6,
  },
  brandTagText: { fontSize: 11, fontWeight: '500' },
  subscribeBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  subscribeBtnText: { fontSize: 13, fontWeight: '600' },

  // Description
  descBlock: {
    paddingVertical: 12, borderRadius: 12,
    marginHorizontal: 16, paddingHorizontal: 14, marginVertical: 12,
  },
  descText: { fontSize: 13, lineHeight: 19 },
  descFooter: { marginTop: 4 },
  descMore: { fontSize: 13, fontWeight: '600' },

  // Comments
  commentsHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14, paddingBottom: 12,
  },
  commentsTitle: { fontSize: 15, fontWeight: '600' },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortLabel: { fontSize: 13 },

  // Comment input row
  commentInputRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 16,
  },
  ciAvatar: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  ciAvatarText: { fontSize: 11, fontWeight: '600' },
  ciInput: {
    flex: 1, height: 36, borderRadius: 18,
    borderWidth: 1, paddingHorizontal: 14,
    justifyContent: 'center',
  },

  commentRow: { flexDirection: 'row', gap: 10, paddingBottom: 14 },
  commentAvatar: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, marginTop: 1,
  },
  commentAvatarText: { fontSize: 11, fontWeight: '600' },
  commentBody: { flex: 1, minWidth: 0 },
  commentAuthor: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  commentText: { fontSize: 13, lineHeight: 18 },
  commentMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  commentLikes: { fontSize: 12 },
  commentTime: { fontSize: 12 },
  viewAllComments: { paddingBottom: 14 },
  viewAllText: { fontSize: 13, fontWeight: '600' },

  // Related
  relatedTitle: { fontSize: 15, fontWeight: '600', paddingTop: 14, paddingBottom: 10 },
  relCard: {
    flexDirection: 'row', gap: 10,
    paddingBottom: 14, alignItems: 'flex-start',
  },
  relThumb: {
    width: 160, height: 90, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, position: 'relative',
  },
  relEmoji: { fontSize: 28 },
  relDuration: {
    position: 'absolute', bottom: 5, right: 5,
    paddingHorizontal: 5, paddingVertical: 1,
    borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.78)',
  },
  relDurationText: { fontSize: 11, fontWeight: '600', color: '#fff' },
  relMeta: { flex: 1, minWidth: 0 },
  relTitle: { fontSize: 13, fontWeight: '500', lineHeight: 18, marginBottom: 3 },
  relSub: { fontSize: 12, lineHeight: 17 },
  relOptions: { padding: 4 },

  // Mini Player
  miniPlayer: {
    position: 'absolute',
    left: 0, right: 0,
    height: 62,
    backgroundColor: 'rgba(0,0,0,0.92)',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 4,
  },
  miniPlayerBody: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  miniThumb: {
    width: 52, height: 32, borderRadius: 4,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  miniEmoji: { fontSize: 14 },
  miniInfo: { flex: 1, minWidth: 0 },
  miniTitle: { color: '#fff', fontSize: 13, fontWeight: '500' },
  miniChannel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 },
  miniAction: { paddingHorizontal: 12, paddingVertical: 8 },
  miniClose: { paddingHorizontal: 12, paddingVertical: 8 },

  // Not found
  notFound: { flex: 1, alignItems: 'center', gap: 12, paddingHorizontal: 32 },
  notFoundText: { fontSize: 15 },
  backBtn: {
    marginTop: 8, paddingHorizontal: 24,
    paddingVertical: 10, borderRadius: 20, borderWidth: 1,
  },
  backBtnText: { fontSize: 14, fontWeight: '600' },
});
