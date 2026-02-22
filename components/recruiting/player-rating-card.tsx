/**
 * PlayerRatingCard — compact recruit card used across all board views.
 * Extracted from recruiting.tsx for reuse in Needs Board, Database, etc.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { getPlayerRatings } from '@/data/playerRatings';
import { TRADITIONAL_TO_HELIO } from '@/data/position-mapping';
import {
  BOARD_COLUMN_COLORS,
  type BoardEntry,
} from '@/data/recruitingBoard';
import { computeFitKR } from '@/utils/fit-kr';
import {
  getPlayerAvailability,
  getPlayerRegion,
  computeConfidence,
  computeMomentum,
  getMomentumLabel,
  getMomentumColor,
  getLastTouch,
} from '@/utils/recruiting-helpers';
import { getRecruitComms } from '@/data/mock-comms';
import type { PoolPlayer } from '@/data/playerPool';
import type { OffensiveStyle, DefensiveStyle } from '@/types';

const CARD_BG = '#0B0F14';
const WHITE = '#FFFFFF';
const GRAY = '#A1A1AA';
const DIVIDER = '#0B0F14';

const metricColor = (val: number) => val >= 75 ? '#22C55E' : val >= 60 ? '#F59E0B' : val >= 45 ? '#A1A1AA' : '#EF4444';
const confColor = (val: number) => val >= 75 ? '#22C55E' : val >= 55 ? '#F59E0B' : '#EF4444';

export function PlayerRatingCard({
  player,
  onPress,
  onLongPress,
  boardEntry,
  offStyle,
  defStyle,
}: {
  player: PoolPlayer;
  onPress: () => void;
  onLongPress?: () => void;
  boardEntry?: BoardEntry;
  offStyle?: OffensiveStyle;
  defStyle?: DefensiveStyle;
}) {
  const ratings = useMemo(() => getPlayerRatings(player.id), [player.id]);
  const helioPos = TRADITIONAL_TO_HELIO[player.position] ?? player.position;
  const region = getPlayerRegion(player.state);

  const kr = ratings?.overall ?? 0;
  const fit = useMemo(() => {
    if (!ratings) return 0;
    return computeFitKR(
      ratings.clusters,
      offStyle ?? 'motion_read_react',
      defStyle ?? 'pack_line',
    );
  }, [ratings, offStyle, defStyle]);
  const confidence = useMemo(() => computeConfidence(player), [player]);

  const comms = useMemo(() => boardEntry ? getRecruitComms(boardEntry.playerId) : [], [boardEntry]);
  const momentum = useMemo(() => boardEntry ? computeMomentum(boardEntry, comms) : null, [boardEntry, comms]);
  const lastTouch = useMemo(() => boardEntry ? getLastTouch(comms) : '', [boardEntry, comms]);

  return (
    <Pressable
      style={styles.ratingCard}
      onPress={onPress}
      onLongPress={onLongPress ? () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onLongPress(); } : undefined}
      delayLongPress={400}
    >
      {/* Row 1: Avatar + Name + tag badges */}
      <View style={styles.ratingCardTop}>
        <View style={styles.ratingAvatar}>
          <IconSymbol name="person.fill" size={22} color={GRAY} />
        </View>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.ratingName} numberOfLines={1}>
            {player.firstName} {player.lastName}
          </Text>
        </View>
        <View style={styles.ratingBadges}>
          <View style={styles.ratingLevelBadge}>
            <Text style={styles.ratingLevelText}>{getPlayerAvailability(player)}</Text>
          </View>
          <View style={styles.ratingPosBadge}>
            <Text style={styles.ratingPosText}>{helioPos}</Text>
          </View>
          <View style={styles.ratingLevelBadge}>
            <Text style={styles.ratingLevelText}>{player.classYear}</Text>
          </View>
        </View>
      </View>

      {/* Row 2: Meta line */}
      <Text style={styles.ratingIdentity} numberOfLines={1}>
        {player.currentSchool} {'\u00B7'} {player.height}{player.weight ? `/${player.weight}` : ''} {'\u00B7'} {region}
      </Text>

      {/* Row 3: 3-metric bar */}
      <View style={styles.metricBar}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>KR</Text>
          <Text style={[styles.metricValue, { color: metricColor(kr) }]}>{ratings ? kr : '\u2014'}</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>FIT</Text>
          <Text style={[styles.metricValue, { color: metricColor(fit) }]}>{ratings ? fit : '\u2014'}</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>CONF</Text>
          <Text style={[styles.metricValue, { color: confColor(confidence) }]}>{confidence}</Text>
        </View>
      </View>

      {/* Row 4: Pipeline pill + Momentum (board entries only) */}
      {boardEntry && (
        <View style={styles.pipelineMomentumRow}>
          <View style={[styles.pipelinePill, { backgroundColor: `${BOARD_COLUMN_COLORS[boardEntry.status]}20` }]}>
            <View style={[styles.qaDot, { backgroundColor: BOARD_COLUMN_COLORS[boardEntry.status] }]} />
            <Text style={[styles.pipelinePillText, { color: BOARD_COLUMN_COLORS[boardEntry.status] }]}>
              {boardEntry.status}
            </Text>
          </View>
          {momentum && (
            <Text style={[styles.momentumText, { color: getMomentumColor(momentum) }]}>
              {getMomentumLabel(momentum)}
            </Text>
          )}
        </View>
      )}

      {/* Row 5: Last Touch + Next Step (board entries only) */}
      {boardEntry && (
        <View style={styles.crmRow}>
          <View style={styles.crmField}>
            <Text style={styles.crmFieldLabel}>Last Touch</Text>
            <Text style={styles.crmFieldValue} numberOfLines={1}>{lastTouch}</Text>
          </View>
          <View style={styles.crmField}>
            <Text style={styles.crmFieldLabel}>Next Step</Text>
            <Text style={styles.crmFieldValue} numberOfLines={1}>{boardEntry.nextStep || 'Not set'}</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ratingCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DIVIDER,
  },
  ratingCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0B0F14',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  ratingName: {
    fontSize: 15,
    fontWeight: '600',
    color: WHITE,
  },
  ratingIdentity: {
    fontSize: 11,
    color: GRAY,
    marginTop: 2,
  },
  ratingBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingLevelBadge: {
    backgroundColor: '#0B0F14',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingLevelText: {
    fontSize: 9,
    fontWeight: '700',
    color: GRAY,
    letterSpacing: 0.3,
  },
  ratingPosBadge: {
    backgroundColor: '#2F3336',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingPosText: {
    fontSize: 10,
    fontWeight: '700',
    color: WHITE,
  },
  metricBar: {
    flexDirection: 'row',
    backgroundColor: '#0B0F14',
    borderRadius: 10,
    marginTop: 10,
    overflow: 'hidden',
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: GRAY,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  metricDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#52525B',
    marginVertical: 8,
  },
  pipelineMomentumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  pipelinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pipelinePillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  qaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  momentumText: {
    fontSize: 12,
    fontWeight: '600',
  },
  crmRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: DIVIDER,
  },
  crmField: {
    flex: 1,
  },
  crmFieldLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: GRAY,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  crmFieldValue: {
    fontSize: 12,
    fontWeight: '500',
    color: WHITE,
  },
});
