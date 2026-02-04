/**
 * Recruiting Board Overlay Component
 * Full-height right-side overlay for viewing recruiting targets.
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
import { Colors, Spacing, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext } from '@/context/app-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OVERLAY_WIDTH = Math.min(400, SCREEN_WIDTH * 0.92);

// Mock recruiting data
const MOCK_RECRUITS = [
  { id: '1', name: 'John Smith', school: 'Oak Hill Academy', position: 'PG', status: 'priority', classYear: '2026' },
  { id: '2', name: 'Michael Chen', school: 'IMG Academy', position: 'SG', status: 'watching', classYear: '2026' },
  { id: '3', name: 'David Martinez', school: 'Montverde Academy', position: 'SF', status: 'offered', classYear: '2026' },
  { id: '4', name: 'James Wilson', school: 'Sierra Canyon', position: 'PF', status: 'contacted', classYear: '2027' },
  { id: '5', name: 'Robert Taylor', school: 'Prolific Prep', position: 'C', status: 'watching', classYear: '2027' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  priority: { label: 'Priority', color: Brand.nexus },
  offered: { label: 'Offered', color: Brand.success },
  contacted: { label: 'Contacted', color: Brand.warning },
  watching: { label: 'Watching', color: '#9BA1A6' },
};

interface RecruitingBoardOverlayProps {
  visible: boolean;
  onClose: () => void;
}

export function RecruitingBoardOverlay({
  visible,
  onClose,
}: RecruitingBoardOverlayProps) {
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
            <ThemedText style={styles.headerTitle}>Recruiting Board</ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {state.program?.name ?? 'Varsity'} • Class of 2026-27
            </ThemedText>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={onClose}
            accessibilityLabel="Close recruiting board"
            accessibilityRole="button"
          >
            <IconSymbol name="xmark" size={20} color={colors.text} />
          </Pressable>
        </View>

        {/* Summary Bar */}
        <View style={[styles.summaryBar, { backgroundColor: colors.backgroundSecondary }]}>
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Targets
            </ThemedText>
            <ThemedText style={styles.summaryValue}>{MOCK_RECRUITS.length}</ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Priority
            </ThemedText>
            <ThemedText style={styles.summaryValue}>
              {MOCK_RECRUITS.filter((r) => r.status === 'priority').length}
            </ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Offered
            </ThemedText>
            <ThemedText style={styles.summaryValue}>
              {MOCK_RECRUITS.filter((r) => r.status === 'offered').length}
            </ThemedText>
          </View>
        </View>

        {/* Status Tabs */}
        <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>
          {['all', 'priority', 'watching', 'contacted', 'offered'].map((tab) => (
            <Pressable
              key={tab}
              style={({ pressed }) => [
                styles.tab,
                tab === 'all' && { borderBottomColor: colors.tint, borderBottomWidth: 2 },
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  tab === 'all' ? { color: colors.text, fontWeight: '600' } : { color: colors.textSecondary },
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {/* Recruits List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {MOCK_RECRUITS.map((recruit) => {
            const statusConfig = STATUS_CONFIG[recruit.status];
            return (
              <Pressable
                key={recruit.id}
                style={({ pressed }) => [
                  styles.recruitRow,
                  {
                    backgroundColor: pressed ? colors.backgroundSecondary : 'transparent',
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={styles.recruitInfo}>
                  <View style={styles.recruitHeader}>
                    <ThemedText style={styles.recruitName}>{recruit.name}</ThemedText>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
                      <ThemedText style={styles.statusText}>{statusConfig.label}</ThemedText>
                    </View>
                  </View>
                  <ThemedText style={[styles.recruitMeta, { color: colors.textSecondary }]}>
                    {recruit.position} • {recruit.school} • {recruit.classYear}
                  </ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
              </Pressable>
            );
          })}
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  tabText: {
    fontSize: 13,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Spacing.xs,
  },
  recruitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  recruitInfo: {
    flex: 1,
  },
  recruitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  recruitName: {
    fontSize: 15,
    fontWeight: '600',
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  recruitMeta: {
    fontSize: 13,
    marginTop: 2,
  },
});
