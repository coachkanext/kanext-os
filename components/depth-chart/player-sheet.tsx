/**
 * Player Detail Bottom Sheet
 * Shows Base KR vs Fit KR, fit reasons, and 7-cluster horizontal bars.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  Modal,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { Spacing, BorderRadius } from '@/constants/theme';
import { TEAM_COLORS, PLAYER_CLUSTERS, getPlayerSubclusters } from '@/data/roster-data';
import type { ClusterRatings } from '@/data/roster-data';
import { ARCHETYPE_LABELS } from '@/data/system-demand-profiles';
import type { Archetype } from '@/data/system-demand-profiles';
import { CLUSTER_LABELS } from '@/data/mock-program-context';
import type { OffensiveStyle, DefensiveStyle, ClusterType } from '@/types';
import { computeFitKR, getFitReasons } from '@/utils/fit-kr';

const { height: WINDOW_H, width: WINDOW_W } = Dimensions.get('window');
const SHEET_H = WINDOW_H * 0.60;

type SheetTab = 'fit' | 'clusters';

interface DepthSlot {
  positionGroup: string;
  playerNumber: string;
  playerName: string;
  baseKR: number;
  minutes: number;
  archetypes: Archetype[];
  roleDefinition: string;
  coachNote: string;
  systemAmplifier?: string;
}

const ALL_CLUSTER_KEYS: (keyof ClusterRatings)[] = [
  'shooting', 'finishing', 'playmaking',
  'perimeter_defense', 'interior_defense', 'rebounding', 'frame',
];

// ── Cluster Bar (tappable → expands subclusters) ──

function ClusterBar({
  clusterKey,
  value,
  systemWeight,
  playerNumber,
  expanded,
  onToggle,
}: {
  clusterKey: keyof ClusterRatings;
  value: number;
  playerNumber: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const label = CLUSTER_LABELS[clusterKey as ClusterType]?.label ?? clusterKey;
  const barColor = value >= 70 ? '#4CAF50' : value >= 55 ? '#FF9800' : '#EF4444';
  const pct = Math.min(value, 100);
  const subclusters = expanded ? getPlayerSubclusters(playerNumber, clusterKey) : [];

  return (
    <View>
      <Pressable style={barStyles.row} onPress={onToggle}>
        <View style={barStyles.labelCol}>
          <Text style={barStyles.label}>{label}</Text>
        </View>
        <View style={barStyles.barTrack}>
          <View style={[barStyles.barFill, { width: `${pct}%`, backgroundColor: barColor }]} />
        </View>
        <Text style={[barStyles.value, { color: barColor }]}>{value}</Text>
        <Text style={barStyles.chevron}>{expanded ? '▾' : '›'}</Text>
      </Pressable>

      {expanded && subclusters.map((sc) => {
        const scColor = sc.rating >= 70 ? '#4CAF50' : sc.rating >= 55 ? '#FF9800' : '#EF4444';
        const scPct = Math.min(sc.rating, 100);
        return (
          <View key={sc.name} style={barStyles.subRow}>
            <Text style={barStyles.subLabel}>{sc.name}</Text>
            <View style={barStyles.subBarTrack}>
              <View style={[barStyles.barFill, { width: `${scPct}%`, backgroundColor: scColor }]} />
            </View>
            <Text style={[barStyles.subValue, { color: scColor }]}>{sc.rating}</Text>
          </View>
        );
      })}
    </View>
  );
}

const barStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 2,
  },
  labelCol: {
    width: 72,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#f5f5f5',
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
    width: 28,
    textAlign: 'right',
  },
  chevron: {
    fontSize: 11,
    color: '#6e6e6e',
    width: 16,
    textAlign: 'center',
    marginLeft: 2,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    marginBottom: 6,
  },
  subLabel: {
    fontSize: 10,
    color: '#999',
    width: 100,
  },
  subBarTrack: {
    flex: 1,
    height: 5,
    backgroundColor: '#222',
    borderRadius: 3,
    overflow: 'hidden',
    marginHorizontal: 6,
  },
  subValue: {
    fontSize: 11,
    fontWeight: '600',
    width: 24,
    textAlign: 'right',
  },
});

// ── Main Sheet ──

export function PlayerSheet({
  visible,
  onClose,
  slot,
  fitKR,
  offStyle,
  defStyle,
}: {
  visible: boolean;
  onClose: () => void;
  slot: DepthSlot | null;
  fitKR: number;
  offStyle: OffensiveStyle;
  defStyle: DefensiveStyle;
}) {
  const sheetAnim = useRef(new Animated.Value(SHEET_H)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<SheetTab>('fit');
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(new Set());
  const touchStartY = useRef(0);

  const toggleCluster = (key: string) => {
    setExpandedClusters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  useEffect(() => {
    if (visible && slot) {
      setMounted(true);
      setActiveTab('fit');
      setExpandedClusters(new Set());
      Animated.parallel([
        Animated.spring(sheetAnim, { toValue: 0, useNativeDriver: true, damping: 25, stiffness: 300 }),
        Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else if (!visible && mounted) {
      Animated.parallel([
        Animated.spring(sheetAnim, { toValue: SHEET_H, useNativeDriver: true, damping: 28, stiffness: 180 }),
        Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => setMounted(false));
    }
  }, [visible, slot]);

  if (!mounted || !slot) return null;

  const clusters = PLAYER_CLUSTERS[slot.playerNumber];
  const delta = fitKR - slot.baseKR;
  const deltaColor = delta > 0 ? '#4CAF50' : delta < 0 ? '#EF4444' : '#6e6e6e';
  const deltaText = delta > 0 ? `+${delta}` : `${delta}`;

  const reasons = clusters
    ? getFitReasons(clusters, slot.archetypes, offStyle, defStyle)
    : [];

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          { opacity: backdropAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }) },
        ]}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { height: SHEET_H, transform: [{ translateY: sheetAnim }] },
        ]}
      >
        {/* Handle */}
        <View
          style={styles.handleArea}
          onTouchStart={(e) => { touchStartY.current = e.nativeEvent.pageY; }}
          onTouchEnd={(e) => {
            if (e.nativeEvent.pageY - touchStartY.current > 30) onClose();
          }}
        >
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerName}>#{slot.playerNumber} {slot.playerName}</Text>
            <Text style={styles.headerPos}>{slot.positionGroup}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.krBlock}>
              <Text style={styles.krLabel}>Base</Text>
              <Text style={styles.krNum}>{slot.baseKR}</Text>
            </View>
            <View style={styles.krBlock}>
              <Text style={styles.krLabel}>Fit</Text>
              <Text style={[styles.krNum, { color: deltaColor }]}>{fitKR}</Text>
            </View>
            <View style={[styles.deltaBadge, { backgroundColor: `${deltaColor}20` }]}>
              <Text style={[styles.deltaText, { color: deltaColor }]}>{deltaText}</Text>
            </View>
          </View>
        </View>

        {/* Tab pills */}
        <View style={styles.tabRow}>
          {(['fit', 'clusters'] as SheetTab[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <Pressable
                key={tab}
                style={[styles.tabPill, isActive && styles.tabPillActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveTab(tab);
                }}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab === 'fit' ? 'Fit' : 'Clusters'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Tab content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'fit' && (
            <View style={styles.fitContent}>
              {/* Fit reasons */}
              {reasons.length > 0 ? (
                reasons.map((r, i) => (
                  <View key={i} style={styles.reasonRow}>
                    <Text style={styles.reasonBullet}>{'\u2022'}</Text>
                    <Text style={styles.reasonText}>{r}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.reasonText}>No cluster data available for this player.</Text>
              )}

              {/* System amplifier */}
              {slot.systemAmplifier && (
                <View style={styles.ampBox}>
                  <Text style={styles.ampLabel}>SYSTEM AMPLIFIER</Text>
                  <Text style={styles.ampText}>{slot.systemAmplifier}</Text>
                </View>
              )}

              {/* Role definition */}
              <View style={styles.roleBox}>
                <Text style={styles.roleLabel}>ROLE</Text>
                <Text style={styles.roleText}>{slot.roleDefinition}</Text>
              </View>

              {/* Coach note */}
              {slot.coachNote && (
                <View style={styles.roleBox}>
                  <Text style={styles.roleLabel}>COACH NOTE</Text>
                  <Text style={styles.roleText}>{slot.coachNote}</Text>
                </View>
              )}

              {/* Archetypes */}
              {slot.archetypes.length > 0 && (
                <View style={styles.archRow}>
                  {slot.archetypes.map((a) => (
                    <View key={a} style={styles.archPill}>
                      <Text style={styles.archText}>{ARCHETYPE_LABELS[a] ?? a}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {activeTab === 'clusters' && clusters && (
            <View style={styles.clusterContent}>
              {ALL_CLUSTER_KEYS.map((key) => (
                <ClusterBar
                  key={key}
                  clusterKey={key}
                  value={clusters[key]}
                  playerNumber={slot.playerNumber}
                  expanded={expandedClusters.has(key)}
                  onToggle={() => toggleCluster(key)}
                />
              ))}
            </View>
          )}

          {activeTab === 'clusters' && !clusters && (
            <Text style={styles.reasonText}>No cluster data available for this player.</Text>
          )}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 90,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#111',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    zIndex: 91,
  },

  // Handle
  handleArea: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#444',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  headerLeft: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f5f5f5',
  },
  headerPos: {
    fontSize: 13,
    color: '#6e6e6e',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  krBlock: {
    alignItems: 'center',
  },
  krLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6e6e6e',
    letterSpacing: 0.5,
  },
  krNum: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f5f5f5',
  },
  deltaBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  deltaText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  tabPill: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#2a2a2a',
  },
  tabPillActive: {
    backgroundColor: '#f5f5f5',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6e6e6e',
  },
  tabTextActive: {
    color: '#111',
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },

  // Fit tab
  fitContent: {
    paddingBottom: 40,
  },
  reasonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  reasonBullet: {
    fontSize: 14,
    color: '#6e6e6e',
    lineHeight: 18,
  },
  reasonText: {
    fontSize: 13,
    color: '#ccc',
    flex: 1,
    lineHeight: 18,
  },
  ampBox: {
    marginTop: 14,
    padding: Spacing.sm,
    backgroundColor: '#1a1a1a',
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: '#FFD100',
  },
  ampLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFD100',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  ampText: {
    fontSize: 12,
    color: '#ccc',
    lineHeight: 16,
  },
  roleBox: {
    marginTop: 12,
    padding: Spacing.sm,
    backgroundColor: '#1a1a1a',
    borderRadius: BorderRadius.md,
  },
  roleLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6e6e6e',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  roleText: {
    fontSize: 12,
    color: '#ccc',
    lineHeight: 16,
  },
  archRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 14,
  },
  archPill: {
    backgroundColor: '#2a2a2a',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  archText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ccc',
  },

  // Clusters tab
  clusterContent: {
    paddingTop: 4,
    paddingBottom: 40,
  },
});
