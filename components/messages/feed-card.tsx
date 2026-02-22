/**
 * Feed Card — unified card rendering all 10 feed post types.
 * Premium X/Twitter-level design with Luxury Control Room palette.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatMessageTime } from '@/data/mock-messages';
import type { FeedPost } from '@/data/mock-messages';

const ACCENT_GOLD = '#FFFFFF';

interface FeedCardProps {
  post: FeedPost;
}

export function FeedCard({ post }: FeedCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(post.saved ?? false);

  const handlePress = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLiked(!liked);
  };
  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSaved(!saved);
  };

  const isSystem = post.author.role === 'System';
  const timeAgo = formatMessageTime(post.timestamp);

  return (
    <View style={[styles.card, { borderBottomColor: colors.border }]}>
      {/* Pinned Banner */}
      {post.pinned && (
        <View style={styles.pinnedBanner}>
          <IconSymbol name="pin.fill" size={11} color={colors.textTertiary} />
          <ThemedText style={[styles.pinnedText, { color: colors.textTertiary }]}>
            Pinned
          </ThemedText>
        </View>
      )}

      <View style={styles.mainRow}>
        {/* Avatar */}
        <View
          style={[
            styles.avatar,
            { backgroundColor: isSystem ? ACCENT_GOLD + '18' : colors.backgroundTertiary },
            isSystem && { borderWidth: 1.5, borderColor: ACCENT_GOLD + '50' },
          ]}
        >
          <ThemedText
            style={[
              styles.avatarText,
              { color: isSystem ? ACCENT_GOLD : colors.text },
            ]}
          >
            {post.author.initials}
          </ThemedText>
        </View>

        {/* Content Column */}
        <View style={styles.content}>
          {/* Author Row */}
          <View style={styles.authorRow}>
            <View style={styles.nameGroup}>
              <ThemedText style={[styles.authorName, { color: colors.text }]}>
                {post.author.name}
              </ThemedText>
              {isSystem && (
                <View style={[styles.verifiedBadge, { backgroundColor: ACCENT_GOLD }]}>
                  <IconSymbol name="checkmark" size={7} color="#000" />
                </View>
              )}
              <ThemedText style={[styles.roleMeta, { color: colors.textTertiary }]}>
                · {post.author.role} · {timeAgo}
              </ThemedText>
            </View>
            <Pressable hitSlop={8} onPress={handlePress}>
              <IconSymbol name="ellipsis" size={14} color={colors.textTertiary} />
            </Pressable>
          </View>

          {/* === Body (type-specific) === */}

          {/* Update */}
          {post.type === 'update' && post.body && (
            <ThemedText
              style={[styles.bodyText, { color: colors.textSecondary }]}
              numberOfLines={4}
            >
              {post.body}
            </ThemedText>
          )}

          {/* Clip — Rich media preview card */}
          {post.type === 'clip' && (
            <Pressable
              style={[styles.clipCard, { backgroundColor: '#0B0F14' }]}
              onPress={handlePress}
            >
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.clipGradient}
              />
              <View style={styles.clipPlayBtn}>
                <IconSymbol name="play.fill" size={18} color="#fff" />
              </View>
              <View style={styles.clipTypeBadge}>
                <ThemedText style={styles.clipTypeText}>CLIP</ThemedText>
              </View>
              <View style={styles.clipBottom}>
                <ThemedText style={styles.clipTitle} numberOfLines={1}>
                  {post.clipTitle}
                </ThemedText>
                {post.clipSource && (
                  <View style={styles.clipSourcePill}>
                    <ThemedText style={styles.clipSourceText}>
                      {post.clipSource}
                    </ThemedText>
                  </View>
                )}
              </View>
            </Pressable>
          )}

          {/* Game — Score card */}
          {post.type === 'game' && (
            <View
              style={[
                styles.gameCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <ThemedText style={[styles.gameTitle, { color: colors.text }]}>
                {post.gameTitle}
              </ThemedText>
              {post.gameMetrics && (
                <View style={styles.metricsRow}>
                  {post.gameMetrics.map((metric, i) => (
                    <View
                      key={i}
                      style={[
                        styles.metricPill,
                        { backgroundColor: colors.backgroundTertiary },
                      ]}
                    >
                      <ThemedText
                        style={[styles.metricText, { color: colors.textSecondary }]}
                      >
                        {metric}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Practice */}
          {post.type === 'practice' && (
            <View
              style={[
                styles.practiceCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.practiceIconRow}>
                <IconSymbol name="figure.run" size={14} color={colors.textTertiary} />
                <ThemedText style={[styles.practiceTitle, { color: colors.text }]}>
                  {post.practiceTitle}
                </ThemedText>
              </View>
              {post.practiceSub && (
                <ThemedText
                  style={[styles.practiceSub, { color: colors.textTertiary }]}
                >
                  {post.practiceSub}
                </ThemedText>
              )}
            </View>
          )}

          {/* Recruiting */}
          {post.type === 'recruiting' && (
            <View style={styles.recruitRow}>
              <ThemedText style={[styles.recruitName, { color: colors.text }]}>
                {post.recruitName}
              </ThemedText>
              {post.recruitStatus && (
                <View
                  style={[
                    styles.recruitChip,
                    { backgroundColor: `${post.recruitStatusColor}18` },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.recruitChipText,
                      { color: post.recruitStatusColor },
                    ]}
                  >
                    {post.recruitStatus}
                  </ThemedText>
                </View>
              )}
            </View>
          )}

          {/* Player Dev */}
          {post.type === 'player_dev' && (
            <View>
              <View style={styles.playerDevHeader}>
                <IconSymbol
                  name="chart.line.uptrend.xyaxis"
                  size={14}
                  color={ACCENT_GOLD}
                />
                <ThemedText style={[styles.playerDevMetric, { color: colors.text }]}>
                  {post.playerDevMetric}
                </ThemedText>
                {post.playerDevDelta && (
                  <View
                    style={[
                      styles.deltaBadge,
                      { backgroundColor: `${post.playerDevDeltaColor}18` },
                    ]}
                  >
                    <ThemedText
                      style={[styles.deltaText, { color: post.playerDevDeltaColor }]}
                    >
                      {post.playerDevDelta}
                    </ThemedText>
                  </View>
                )}
              </View>
              {post.body && (
                <ThemedText
                  style={[styles.bodyText, { color: colors.textSecondary }]}
                  numberOfLines={3}
                >
                  {post.body}
                </ThemedText>
              )}
            </View>
          )}

          {/* Culture */}
          {post.type === 'culture' && (
            <View>
              <View style={styles.cultureHeader}>
                <IconSymbol name="heart.fill" size={13} color="#1D9BF0" />
                <ThemedText style={[styles.cultureTitle, { color: colors.text }]}>
                  {post.cultureTitle}
                </ThemedText>
              </View>
              {post.cultureBody && (
                <ThemedText
                  style={[styles.bodyText, { color: colors.textSecondary }]}
                  numberOfLines={4}
                >
                  {post.cultureBody}
                </ThemedText>
              )}
            </View>
          )}

          {/* Compliance */}
          {post.type === 'compliance' && (
            <View
              style={[
                styles.complianceCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.complianceHeaderRow}>
                <IconSymbol
                  name="exclamationmark.shield.fill"
                  size={14}
                  color={post.complianceUrgent ? '#EF4444' : colors.textTertiary}
                />
                <ThemedText style={[styles.complianceTitle, { color: colors.text }]}>
                  {post.complianceTitle}
                </ThemedText>
              </View>
              <View style={styles.complianceRow}>
                <ThemedText
                  style={[styles.complianceDue, { color: colors.textTertiary }]}
                >
                  Due: {post.complianceDue}
                </ThemedText>
                {post.complianceUrgent && (
                  <View style={styles.urgentBadge}>
                    <ThemedText style={styles.urgentText}>Urgent</ThemedText>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* System — Gold-tinted card */}
          {post.type === 'system' && (
            <View
              style={[
                styles.systemCard,
                {
                  backgroundColor: ACCENT_GOLD + '08',
                  borderColor: ACCENT_GOLD + '20',
                },
              ]}
            >
              <View style={styles.systemHeader}>
                <IconSymbol name="cpu" size={13} color={ACCENT_GOLD} />
                <ThemedText style={[styles.systemTitle, { color: ACCENT_GOLD }]}>
                  {post.systemTitle}
                </ThemedText>
              </View>
              {post.systemBody && (
                <ThemedText
                  style={[styles.bodyText, { color: colors.textSecondary }]}
                  numberOfLines={4}
                >
                  {post.systemBody}
                </ThemedText>
              )}
            </View>
          )}

          {/* Poll — Gold accent bars */}
          {post.type === 'poll' && (
            <View>
              <ThemedText style={[styles.pollQuestion, { color: colors.text }]}>
                {post.pollQuestion}
              </ThemedText>
              {post.pollOptions?.map((opt, i) => (
                <Pressable key={i} style={styles.pollOptionRow} onPress={handlePress}>
                  <View
                    style={[
                      styles.pollBarBg,
                      { backgroundColor: colors.backgroundTertiary },
                    ]}
                  >
                    <View
                      style={[
                        styles.pollBarFill,
                        {
                          width: `${opt.pct}%`,
                          backgroundColor: ACCENT_GOLD + '25',
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.pollLabelRow}>
                    <ThemedText style={[styles.pollLabel, { color: colors.text }]}>
                      {opt.label}
                    </ThemedText>
                    <ThemedText
                      style={[styles.pollPct, { color: colors.textTertiary }]}
                    >
                      {opt.pct}%
                    </ThemedText>
                  </View>
                </Pressable>
              ))}
              {post.pollVoted && (
                <ThemedText style={[styles.pollVoted, { color: ACCENT_GOLD }]}>
                  You voted
                </ThemedText>
              )}
            </View>
          )}

          {/* === Engagement Row === */}
          <View style={styles.engagementRow}>
            <Pressable style={styles.engageBtn} hitSlop={6} onPress={handlePress}>
              <IconSymbol name="bubble.left" size={15} color={colors.textTertiary} />
              {(post.commentCount ?? 0) > 0 && (
                <ThemedText
                  style={[styles.engageCount, { color: colors.textTertiary }]}
                >
                  {post.commentCount}
                </ThemedText>
              )}
            </Pressable>
            <Pressable style={styles.engageBtn} hitSlop={6} onPress={handlePress}>
              <IconSymbol
                name="arrow.2.squarepath"
                size={15}
                color={colors.textTertiary}
              />
            </Pressable>
            <Pressable style={styles.engageBtn} hitSlop={6} onPress={handleLike}>
              <IconSymbol
                name={liked ? 'heart.fill' : 'heart'}
                size={15}
                color={liked ? '#EF4444' : colors.textTertiary}
              />
            </Pressable>
            <Pressable style={styles.engageBtn} hitSlop={6} onPress={handleSave}>
              <IconSymbol
                name={saved ? 'bookmark.fill' : 'bookmark'}
                size={15}
                color={saved ? ACCENT_GOLD : colors.textTertiary}
              />
            </Pressable>
            <Pressable style={styles.engageBtn} hitSlop={6} onPress={handlePress}>
              <IconSymbol
                name="square.and.arrow.up"
                size={15}
                color={colors.textTertiary}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: Spacing.md,
    paddingTop: 12,
    paddingBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pinnedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
    marginLeft: 52,
  },
  pinnedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
  },
  verifiedBadge: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  roleMeta: {
    fontSize: 13,
    fontWeight: '400',
    marginLeft: 4,
    flexShrink: 1,
  },

  // Body text
  bodyText: {
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 8,
  },

  // Clip — media preview card
  clipCard: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 8,
  },
  clipGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
  },
  clipPlayBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  clipTypeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  clipTypeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  clipBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  clipTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    marginRight: 8,
  },
  clipSourcePill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  clipSourceText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },

  // Game — bordered card
  gameCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  gameTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  metricPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  metricText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Practice — bordered card
  practiceCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  practiceIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  practiceTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  practiceSub: {
    fontSize: 13,
    lineHeight: 18,
  },

  // Recruiting
  recruitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  recruitName: {
    fontSize: 15,
    fontWeight: '600',
  },
  recruitChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  recruitChipText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Player Dev
  playerDevHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  playerDevMetric: {
    fontSize: 14,
    fontWeight: '600',
  },
  deltaBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  deltaText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Culture
  cultureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  cultureTitle: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Compliance — bordered card
  complianceCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  complianceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  complianceTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  complianceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  complianceDue: {
    fontSize: 13,
  },
  urgentBadge: {
    backgroundColor: '#EF444420',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  urgentText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },

  // System — gold-tinted card
  systemCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  systemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  systemTitle: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Poll — gold accent bars
  pollQuestion: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  pollOptionRow: {
    marginBottom: 6,
  },
  pollBarBg: {
    height: 32,
    borderRadius: 6,
    overflow: 'hidden',
  },
  pollBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  pollLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    left: 10,
    right: 10,
    top: 7,
  },
  pollLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  pollPct: {
    fontSize: 13,
    fontWeight: '600',
  },
  pollVoted: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 8,
  },

  // Engagement Row
  engagementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 8,
    paddingRight: 24,
  },
  engageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  engageCount: {
    fontSize: 13,
    fontWeight: '500',
  },
});
