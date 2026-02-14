/**
 * Feed Card — unified card rendering all 10 feed post types.
 * Types: update, clip, game, practice, recruiting, player_dev, culture, compliance, system, poll
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, BorderRadius } from '@/constants/theme';
import { formatMessageTime } from '@/data/mock-messages';
import type { FeedPost } from '@/data/mock-messages';

interface FeedCardProps {
  post: FeedPost;
}

export function FeedCard({ post }: FeedCardProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: pressed ? '#191919' : '#111' },
      ]}
      onPress={handlePress}
    >
      {/* Pinned Banner */}
      {post.pinned && (
        <View style={styles.pinnedBanner}>
          <IconSymbol name="pin.fill" size={11} color="#6e6e6e" />
          <ThemedText style={styles.pinnedText}>Pinned</ThemedText>
        </View>
      )}

      {/* Header Row */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: post.author.roleBadgeColor }]}>
          <ThemedText style={styles.avatarText}>{post.author.initials}</ThemedText>
        </View>
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <ThemedText style={styles.authorName}>{post.author.name}</ThemedText>
            <View style={[styles.roleBadge, { backgroundColor: '#191919' }]}>
              <ThemedText style={styles.roleText}>{post.author.role}</ThemedText>
            </View>
          </View>
        </View>
        <ThemedText style={styles.timestamp}>{formatMessageTime(post.timestamp)}</ThemedText>
      </View>

      {/* Body — conditional by type */}
      <View style={styles.body}>
        {post.type === 'update' && post.body && (
          <ThemedText style={styles.bodyText} numberOfLines={3}>
            {post.body}
          </ThemedText>
        )}

        {post.type === 'clip' && (
          <View>
            <View style={styles.clipContainer}>
              <IconSymbol name="play.rectangle.fill" size={20} color="#6e6e6e" />
              <ThemedText style={styles.clipTitle} numberOfLines={2}>
                {post.clipTitle}
              </ThemedText>
            </View>
            {post.clipSource && (
              <View style={styles.sourceBadge}>
                <ThemedText style={styles.sourceText}>{post.clipSource}</ThemedText>
              </View>
            )}
          </View>
        )}

        {post.type === 'game' && (
          <View>
            <ThemedText style={styles.gameTitle}>{post.gameTitle}</ThemedText>
            {post.gameMetrics && (
              <View style={styles.metricsRow}>
                {post.gameMetrics.map((metric, i) => (
                  <ThemedText key={i} style={styles.metricText}>
                    {metric}
                  </ThemedText>
                ))}
              </View>
            )}
          </View>
        )}

        {post.type === 'practice' && (
          <View>
            <ThemedText style={styles.practiceTitle}>{post.practiceTitle}</ThemedText>
            {post.practiceSub && (
              <ThemedText style={styles.practiceSub}>{post.practiceSub}</ThemedText>
            )}
          </View>
        )}

        {post.type === 'recruiting' && (
          <View style={styles.recruitRow}>
            <ThemedText style={styles.recruitName}>{post.recruitName}</ThemedText>
            {post.recruitStatus && (
              <View style={[styles.recruitChip, { backgroundColor: `${post.recruitStatusColor}20` }]}>
                <ThemedText style={[styles.recruitChipText, { color: post.recruitStatusColor }]}>
                  {post.recruitStatus}
                </ThemedText>
              </View>
            )}
          </View>
        )}

        {post.type === 'player_dev' && (
          <View>
            <View style={styles.playerDevHeader}>
              <IconSymbol name="chart.line.uptrend.xyaxis" size={16} color="#6e6e6e" />
              <ThemedText style={styles.playerDevMetric}>{post.playerDevMetric}</ThemedText>
              {post.playerDevDelta && (
                <View style={[styles.deltaBadge, { backgroundColor: `${post.playerDevDeltaColor}20` }]}>
                  <ThemedText style={[styles.deltaText, { color: post.playerDevDeltaColor }]}>
                    {post.playerDevDelta}
                  </ThemedText>
                </View>
              )}
            </View>
            {post.body && (
              <ThemedText style={styles.bodyText} numberOfLines={3}>
                {post.body}
              </ThemedText>
            )}
          </View>
        )}

        {post.type === 'culture' && (
          <View>
            <View style={styles.cultureHeader}>
              <IconSymbol name="heart.fill" size={14} color="#6e6e6e" />
              <ThemedText style={styles.cultureTitle}>{post.cultureTitle}</ThemedText>
            </View>
            {post.cultureBody && (
              <ThemedText style={styles.bodyText} numberOfLines={4}>
                {post.cultureBody}
              </ThemedText>
            )}
          </View>
        )}

        {post.type === 'compliance' && (
          <View>
            <ThemedText style={styles.complianceTitle}>{post.complianceTitle}</ThemedText>
            <View style={styles.complianceRow}>
              <ThemedText style={styles.complianceDue}>Due: {post.complianceDue}</ThemedText>
              {post.complianceUrgent && (
                <View style={styles.urgentBadge}>
                  <ThemedText style={styles.urgentText}>Urgent</ThemedText>
                </View>
              )}
            </View>
          </View>
        )}

        {post.type === 'system' && (
          <View>
            <View style={styles.systemHeader}>
              <IconSymbol name="cpu" size={14} color="#6e6e6e" />
              <ThemedText style={styles.systemTitle}>{post.systemTitle}</ThemedText>
            </View>
            {post.systemBody && (
              <ThemedText style={styles.bodyText} numberOfLines={4}>
                {post.systemBody}
              </ThemedText>
            )}
          </View>
        )}

        {post.type === 'poll' && (
          <View>
            <ThemedText style={styles.pollQuestion}>{post.pollQuestion}</ThemedText>
            {post.pollOptions?.map((opt, i) => (
              <View key={i} style={styles.pollOptionRow}>
                <View style={styles.pollBarBg}>
                  <View style={[styles.pollBarFill, { width: `${opt.pct}%` }]} />
                </View>
                <View style={styles.pollLabelRow}>
                  <ThemedText style={styles.pollLabel}>{opt.label}</ThemedText>
                  <ThemedText style={styles.pollPct}>{opt.pct}%</ThemedText>
                </View>
              </View>
            ))}
            {post.pollVoted && (
              <ThemedText style={styles.pollVoted}>You voted</ThemedText>
            )}
          </View>
        )}
      </View>

      {/* V2 Footer — Reply / Repost / Save / Share / More */}
      <View style={styles.footer}>
        <View style={styles.footerActions}>
          {/* Reply */}
          <Pressable style={styles.footerBtn} onPress={handlePress}>
            <IconSymbol name="bubble.left" size={14} color="#6e6e6e" />
            {(post.commentCount ?? 0) > 0 && (
              <ThemedText style={styles.footerBtnText}>{post.commentCount}</ThemedText>
            )}
          </Pressable>
          {/* Repost (staff+) */}
          <Pressable style={styles.footerBtn} onPress={handlePress}>
            <IconSymbol name="arrow.2.squarepath" size={14} color="#6e6e6e" />
          </Pressable>
          {/* Save */}
          <Pressable style={styles.footerBtn} onPress={handlePress}>
            <IconSymbol name="bookmark" size={14} color={post.saved ? '#f5f5f5' : '#6e6e6e'} />
          </Pressable>
          {/* Share */}
          <Pressable style={styles.footerBtn} onPress={handlePress}>
            <IconSymbol name="square.and.arrow.up" size={14} color="#6e6e6e" />
          </Pressable>
          {/* More */}
          <Pressable style={styles.footerBtn} onPress={handlePress}>
            <IconSymbol name="ellipsis" size={14} color="#6e6e6e" />
          </Pressable>
        </View>
        {(post.type === 'game' || post.type === 'practice' || post.type === 'recruiting') && (
          <Pressable
            style={({ pressed }) => [
              styles.ctaPill,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={handlePress}
          >
            <ThemedText style={styles.ctaText}>View ▸</ThemedText>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  pinnedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
    marginLeft: 44,
  },
  pinnedText: {
    fontSize: 11,
    color: '#6e6e6e',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f5f5f5',
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  roleText: {
    fontSize: 11,
    color: '#6e6e6e',
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
    color: '#6e6e6e',
  },
  body: {
    marginLeft: 44,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 21,
    color: '#f5f5f5',
  },

  // Clip
  clipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clipTitle: {
    fontSize: 14,
    color: '#f5f5f5',
    flex: 1,
  },
  sourceBadge: {
    backgroundColor: '#191919',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  sourceText: {
    fontSize: 11,
    color: '#6e6e6e',
    fontWeight: '500',
  },

  // Game
  gameTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f5f5f5',
    marginBottom: 6,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  metricText: {
    fontSize: 13,
    color: '#6e6e6e',
  },

  // Practice
  practiceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f5f5f5',
    marginBottom: 4,
  },
  practiceSub: {
    fontSize: 13,
    color: '#6e6e6e',
    lineHeight: 18,
  },

  // Recruiting
  recruitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  recruitName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f5f5f5',
  },
  recruitChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
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
    color: '#f5f5f5',
  },
  deltaBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
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
    color: '#f5f5f5',
  },

  // Compliance
  complianceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f5f5f5',
    marginBottom: 6,
  },
  complianceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  complianceDue: {
    fontSize: 13,
    color: '#6e6e6e',
  },
  urgentBadge: {
    backgroundColor: '#EF444420',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  urgentText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },

  // System
  systemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  systemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f5f5f5',
  },

  // Poll
  pollQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f5f5f5',
    marginBottom: 10,
  },
  pollOptionRow: {
    marginBottom: 8,
  },
  pollBarBg: {
    height: 28,
    backgroundColor: '#191919',
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  pollBarFill: {
    height: '100%',
    backgroundColor: '#2a2a2a',
    borderRadius: BorderRadius.sm,
  },
  pollLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    left: 8,
    right: 8,
    top: 6,
  },
  pollLabel: {
    fontSize: 13,
    color: '#f5f5f5',
  },
  pollPct: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6e6e6e',
  },
  pollVoted: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    marginTop: 4,
  },

  // Footer
  footer: {
    marginLeft: 44,
    marginTop: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerBtnText: {
    fontSize: 12,
    color: '#6e6e6e',
  },
  ctaPill: {
    backgroundColor: '#191919',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f5f5f5',
  },
});
