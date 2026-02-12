/**
 * Coach Injuries Screen
 * Injuries and availability status.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { TabFooter } from '@/components/tab-footer';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const HUB_TABS = [
  { id: 'home', label: 'Home' },
  { id: 'roster', label: 'Roster' },
  { id: 'games', label: 'Games', route: '/coach/games' },
  { id: 'injuries', label: 'Injuries' },
  { id: 'program-context', label: 'Team System', route: '/coach/program-context' },
  { id: 'recruiting', label: 'Recruiting', route: '/coach/recruiting' },
  { id: 'film', label: 'Film', route: '/coach/film' },
];

// Demo injury data
const DEMO_INJURIES = [
  {
    id: '1',
    name: 'Devon Harris',
    injury: 'Ankle Sprain',
    status: 'out',
    expectedReturn: 'Feb 10',
  },
  {
    id: '2',
    name: 'Malik Robinson',
    injury: 'Knee Soreness',
    status: 'questionable',
    expectedReturn: 'Day-to-day',
  },
];

const HEALTHY_PLAYERS = [
  'Brandon Williams',
  'Laolu Kalejaiye',
  'Jaylen Carter',
  'Terrance Brooks',
  'Andre Mitchell',
  'Chris Thomas',
];

const STATUS_COLORS: Record<string, string> = {
  out: '#EF4444',
  questionable: '#6e6e6e',
  probable: '#f5f5f5',
};

const STATUS_LABELS: Record<string, string> = {
  out: 'OUT',
  questionable: 'QUESTIONABLE',
  probable: 'PROBABLE',
};

export default function CoachInjuriesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hub Tabs */}
      <View style={[styles.hubTabsContainer, { borderBottomColor: colors.divider, backgroundColor: colors.background }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hubTabsContent}>
          {HUB_TABS.map((tab) => {
            const isActive = tab.id === 'injuries';
            return (
              <Pressable
                key={tab.id}
                style={[styles.hubTab, isActive && [styles.hubTabActive, { borderBottomColor: colors.text }]]}
                onPress={() => {
                  if (tab.id === 'injuries') return;
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (tab.id === 'home' || tab.id === 'roster') {
                    router.navigate({ pathname: '/(tabs)/index', params: { hubTab: '2' } } as any);
                  } else if (tab.route) {
                    router.replace(tab.route as any);
                  }
                }}
              >
                <ThemedText style={[styles.hubTabLabel, { color: isActive ? colors.text : colors.textTertiary }, isActive && styles.hubTabLabelActive]}>
                  {tab.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.backgroundSecondary }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: '#f5f5f5' }]}>
              {HEALTHY_PLAYERS.length}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Healthy</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: '#EF4444' }]}>
              {DEMO_INJURIES.length}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Injured</Text>
          </View>
        </View>

        {/* Injury Report */}
        {DEMO_INJURIES.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              INJURY REPORT
            </Text>
            <View style={[styles.injuryCard, { backgroundColor: colors.backgroundSecondary }]}>
              {DEMO_INJURIES.map((injury, index) => (
                <View key={injury.id}>
                  {index > 0 && (
                    <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                  )}
                  <View style={styles.injuryRow}>
                    <View style={styles.injuryInfo}>
                      <Text style={[styles.playerName, { color: colors.text }]}>{injury.name}</Text>
                      <Text style={[styles.injuryType, { color: colors.textSecondary }]}>
                        {injury.injury}
                      </Text>
                      <Text style={[styles.returnDate, { color: colors.textTertiary }]}>
                        Return: {injury.expectedReturn}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: STATUS_COLORS[injury.status] + '20' },
                      ]}
                    >
                      <Text
                        style={[styles.statusText, { color: STATUS_COLORS[injury.status] }]}
                      >
                        {STATUS_LABELS[injury.status]}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Healthy Players */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>AVAILABLE</Text>
        <View style={[styles.healthyCard, { backgroundColor: colors.backgroundSecondary }]}>
          {HEALTHY_PLAYERS.map((name, index) => (
            <View key={name}>
              {index > 0 && (
                <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              )}
              <View style={styles.healthyRow}>
                <Text style={[styles.healthyName, { color: colors.text }]}>{name}</Text>
                <View style={styles.healthyBadge}>
                  <IconSymbol name="checkmark.circle.fill" size={18} color="#f5f5f5" />
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <TabFooter activeTab="Home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hubTabsContainer: { borderBottomWidth: StyleSheet.hairlineWidth },
  hubTabsContent: { paddingHorizontal: Spacing.lg, gap: Spacing.lg },
  hubTab: { paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  hubTabActive: { borderBottomWidth: 2 },
  hubTabLabel: { fontSize: 14, fontWeight: '500' },
  hubTabLabelActive: { fontWeight: '600' },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 13,
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  injuryCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  injuryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  injuryInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  injuryType: {
    fontSize: 14,
    marginTop: 2,
  },
  returnDate: {
    fontSize: 13,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  healthyCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  healthyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  healthyName: {
    fontSize: 15,
    fontWeight: '500',
  },
  healthyBadge: {},
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md,
  },
});
