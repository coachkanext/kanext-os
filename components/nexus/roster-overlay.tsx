/**
 * Roster Overlay Component
 * Full-height right-side overlay for viewing/editing rosters.
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext } from '@/context/app-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OVERLAY_WIDTH = Math.min(400, SCREEN_WIDTH * 0.92);

// Mock roster data
const MOCK_ROSTER = [
  { id: '1', name: 'Marcus Johnson', position: 'PG', number: '1', year: 'Sr.' },
  { id: '2', name: 'Tyler Williams', position: 'SG', number: '3', year: 'Jr.' },
  { id: '3', name: 'Devon Thompson', position: 'SF', number: '15', year: 'Sr.' },
  { id: '4', name: 'Andre Davis', position: 'PF', number: '22', year: 'So.' },
  { id: '5', name: 'James Mitchell', position: 'C', number: '44', year: 'Jr.' },
  { id: '6', name: 'Chris Brown', position: 'PG', number: '10', year: 'Fr.' },
  { id: '7', name: 'Kevin Lee', position: 'SG', number: '23', year: 'So.' },
  { id: '8', name: 'Ryan Garcia', position: 'SF', number: '5', year: 'Jr.' },
];

interface RosterOverlayProps {
  visible: boolean;
  onClose: () => void;
}

export function RosterOverlay({ visible, onClose }: RosterOverlayProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { state } = useAppContext();

  const slideAnim = useRef(new Animated.Value(OVERLAY_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: OVERLAY_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Scrim / Backdrop */}
      <Animated.View style={[styles.scrim, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Overlay */}
      <Animated.View
        style={[
          styles.overlay,
          {
            width: OVERLAY_WIDTH,
            backgroundColor: colors.background,
            transform: [{ translateX: slideAnim }],
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <ThemedText style={styles.headerTitle}>Roster</ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {state.program?.name ?? 'Varsity'} • {state.cycle?.name ?? '2025-26'}
            </ThemedText>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={onClose}
            accessibilityLabel="Close roster"
            accessibilityRole="button"
          >
            <IconSymbol name="xmark" size={20} color={colors.text} />
          </Pressable>
        </View>

        {/* Roster Summary */}
        <View style={[styles.summaryBar, { backgroundColor: colors.backgroundSecondary }]}>
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Players
            </ThemedText>
            <ThemedText style={styles.summaryValue}>{MOCK_ROSTER.length}</ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Scholarships
            </ThemedText>
            <ThemedText style={styles.summaryValue}>8 / 10</ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              NIL Used
            </ThemedText>
            <ThemedText style={styles.summaryValue}>$180K</ThemedText>
          </View>
        </View>

        {/* Roster List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {MOCK_ROSTER.map((player) => (
            <Pressable
              key={player.id}
              style={({ pressed }) => [
                styles.playerRow,
                {
                  backgroundColor: pressed ? colors.backgroundSecondary : 'transparent',
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View style={styles.playerNumber}>
                <ThemedText style={[styles.numberText, { color: colors.textSecondary }]}>
                  #{player.number}
                </ThemedText>
              </View>
              <View style={styles.playerInfo}>
                <ThemedText style={styles.playerName}>{player.name}</ThemedText>
                <ThemedText style={[styles.playerMeta, { color: colors.textSecondary }]}>
                  {player.position} • {player.year}
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryBar: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Spacing.xs,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  playerNumber: {
    width: 40,
  },
  numberText: {
    fontSize: 14,
    fontWeight: '500',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 15,
    fontWeight: '600',
  },
  playerMeta: {
    fontSize: 13,
    marginTop: 1,
  },
});
