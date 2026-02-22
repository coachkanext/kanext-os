/**
 * Coach Film Screen
 * Film library and video content.
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
  { id: 'recruiting', label: 'Recruiting', route: '/coach/recruiting' },
  { id: 'roster', label: 'Roster' },
  { id: 'games', label: 'Games', route: '/coach/games' },
  { id: 'injuries', label: 'Injuries', route: '/coach/injuries' },
  { id: 'program-context', label: 'Team System', route: '/coach/program-context' },
  { id: 'film', label: 'Film' },
];

// Demo film data
const DEMO_FILMS = [
  {
    id: '1',
    title: 'vs. Cal Miramar',
    date: 'Jan 25, 2026',
    type: 'game',
    duration: '1:45:22',
  },
  {
    id: '2',
    title: 'vs. Westlake College',
    date: 'Jan 22, 2026',
    type: 'game',
    duration: '1:38:15',
  },
  {
    id: '3',
    title: 'Practice - Offensive Sets',
    date: 'Jan 20, 2026',
    type: 'practice',
    duration: '0:45:10',
  },
  {
    id: '4',
    title: 'vs. Crestview',
    date: 'Jan 18, 2026',
    type: 'game',
    duration: '1:42:08',
  },
  {
    id: '5',
    title: 'Practice - Defensive Rotations',
    date: 'Jan 16, 2026',
    type: 'practice',
    duration: '0:52:30',
  },
  {
    id: '6',
    title: 'vs. Eastridge Tech',
    date: 'Jan 15, 2026',
    type: 'game',
    duration: '1:40:55',
  },
];

const TYPE_ICONS: Record<string, string> = {
  game: 'sportscourt.fill',
  practice: 'figure.run',
  scout: 'eye.fill',
};

export default function CoachFilmScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const gameFilms = DEMO_FILMS.filter((f) => f.type === 'game');
  const practiceFilms = DEMO_FILMS.filter((f) => f.type === 'practice');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hub Tabs */}
      <View style={[styles.hubTabsContainer, { borderBottomColor: colors.divider, backgroundColor: colors.background }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hubTabsContent}>
          {HUB_TABS.map((tab) => {
            const isActive = tab.id === 'film';
            return (
              <Pressable
                key={tab.id}
                style={[styles.hubTab, isActive && [styles.hubTabActive, { borderBottomColor: colors.text }]]}
                onPress={() => {
                  if (tab.id === 'film') return;
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
            <Text style={[styles.summaryValue, { color: colors.text }]}>{DEMO_FILMS.length}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Films</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{gameFilms.length}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Games</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {practiceFilms.length}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Practice</Text>
          </View>
        </View>

        {/* Film Library */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>RECENT FILMS</Text>
        <View style={[styles.filmCard, { backgroundColor: colors.backgroundSecondary }]}>
          {DEMO_FILMS.map((film, index) => (
            <View key={film.id}>
              {index > 0 && (
                <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              )}
              <Pressable
                style={({ pressed }) => [
                  styles.filmRow,
                  pressed && { backgroundColor: colors.backgroundTertiary },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  // Would navigate to video player
                }}
              >
                <View
                  style={[styles.filmIcon, { backgroundColor: colors.backgroundTertiary }]}
                >
                  <IconSymbol
                    name={TYPE_ICONS[film.type] as any}
                    size={18}
                    color={colors.textSecondary}
                  />
                </View>
                <View style={styles.filmInfo}>
                  <Text style={[styles.filmTitle, { color: colors.text }]}>{film.title}</Text>
                  <Text style={[styles.filmMeta, { color: colors.textTertiary }]}>
                    {film.date} · {film.duration}
                  </Text>
                </View>
                <IconSymbol name="play.circle.fill" size={24} color={colors.textTertiary} />
              </Pressable>
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
    fontSize: 28,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 12,
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
  filmCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  filmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  filmIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  filmInfo: {
    flex: 1,
  },
  filmTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  filmMeta: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md + 48,
  },
});
