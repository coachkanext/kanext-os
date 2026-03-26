/**
 * KayStudios Side Panel — universal, cross-mode.
 * Sections (everyone): Quick Nav · In Progress · My Courses · Saved ·
 *                       Achievements · Recently Played · Following
 * Sections (creator/admin): My Content · Create · Analytics · Drafts ·
 *                            Revenue
 * Settings (collapsible)
 */

import React, { useMemo, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useOperatingRole } from '@/context/app-context';
import { getAllContent, type StudioContent, type ExperienceType } from '@/data/mock-kaystudios';

// ── Role gate ─────────────────────────────────────────────────────────────────

const CREATOR_ROLES = new Set(['founder', 'head_coach', 'athletic_director', 'principal', 'admin', 'owner', 'coach', 'creator']);

// ── Mock helpers (deterministic, no async) ───────────────────────────────────

function seedProgress(id: string): number {
  const n = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return Math.round(((n % 7) / 10 + 0.15) * 10) / 10; // 0.15 – 0.75
}

function fmtViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const TYPE_ICON: Record<ExperienceType, string> = {
  trivia:     'questionmark.circle',
  quiz:       'list.clipboard',
  course:     'book',
  flashcards: 'rectangle.stack',
  simulation: 'globe',
  game:       'gamecontroller',
  training:   'figure.strengthtraining.traditional',
  devotional: 'heart',
};

// Mock achievements
const ACHIEVEMENTS = {
  completed: 8,
  streak: 7,
  xp: 2450,
  rank: 42,
  badges: ['🏆', '🔥', '⚡', '🎯'],
};

// Mock following list
const FOLLOWING = [
  { id: 'f1', name: 'SportsMind Pro', handle: '@sportsmind', hue: 210, initials: 'SM', newContent: 3 },
  { id: 'f2', name: 'Faith Forward',  handle: '@faithfwd',   hue: 45,  initials: 'FF', newContent: 1 },
  { id: 'f3', name: 'BizAcademy',     handle: '@bizacademy', hue: 150, initials: 'BA', newContent: 0 },
  { id: 'f4', name: 'NeXT Learning',  handle: '@nexter',     hue: 280, initials: 'NL', newContent: 2 },
];

// Mock creator stats
const CREATOR_STATS = { published: 6, totalPlays: 14800, avgRating: 4.6, revenue: 312 };
const CREATOR_DRAFTS = [
  { id: 'd1', title: 'Advanced Play Calling', type: 'course' as ExperienceType, updatedAt: 'Mar 20' },
  { id: 'd2', title: 'Market Fundamentals Q2', type: 'quiz' as ExperienceType, updatedAt: 'Mar 18' },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ label, C, styles }: { label: string; C: ComponentColors; styles: any }) {
  return <Text style={[styles.sectionHeader, { color: C.secondary }]}>{label}</Text>;
}

function NavRow({
  icon, label, detail, C, styles, onPress,
}: { icon: string; label: string; detail?: string; C: ComponentColors; styles: any; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.navRow, pressed && { backgroundColor: C.surfacePressed }]}
      onPress={onPress}
    >
      <IconSymbol name={icon as any} size={17} color={C.secondary} />
      <Text style={[styles.navLabel, { color: C.label }]}>{label}</Text>
      {detail ? <Text style={[styles.navDetail, { color: C.muted }]}>{detail}</Text> : null}
      <IconSymbol name="chevron.right" size={13} color={C.muted} />
    </Pressable>
  );
}

function MiniContentRow({
  item, progress, C, styles, onPress,
}: { item: StudioContent; progress?: number; C: ComponentColors; styles: any; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.miniRow, pressed && { backgroundColor: C.surfacePressed }]}
      onPress={onPress}
    >
      <View style={[styles.miniThumb, { backgroundColor: `hsl(${item.thumbHue},42%,28%)` }]}>
        <Text style={styles.miniEmoji}>{item.thumbEmoji}</Text>
      </View>
      <View style={styles.miniInfo}>
        <Text style={[styles.miniTitle, { color: C.label }]} numberOfLines={2}>{item.title}</Text>
        <Text style={[styles.miniSub, { color: C.muted }]}>{item.brand} · {item.duration}</Text>
        {progress != null && progress > 0 && (
          <View style={[styles.progressTrack, { backgroundColor: C.separator }]}>
            <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` as any, backgroundColor: C.accent }]} />
          </View>
        )}
      </View>
      {progress != null && progress > 0 && (
        <Text style={[styles.pctLabel, { color: C.muted }]}>{Math.round(progress * 100)}%</Text>
      )}
    </Pressable>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────

export function StudiosPanel() {
  const C = useColors();
  const router = useRouter();
  const role = useOperatingRole();
  const isCreator = CREATOR_ROLES.has(role);
  const styles = useMemo(() => makeStyles(C), [C]);

  const [manageOpen, setManageOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const allContent = useMemo(() => getAllContent(), []);

  // In Progress — first 3 items, seeded progress
  const inProgress = useMemo(() =>
    allContent.slice(0, 3).map(item => ({ item, progress: seedProgress(item.id) })),
  [allContent]);

  // My Courses — filter to courses/training/devotional
  const myCourses = useMemo(() =>
    allContent.filter(c => c.type === 'course' || c.type === 'training' || c.type === 'devotional').slice(0, 4),
  [allContent]);

  // Saved — last 4 items (simulate saved list)
  const saved = useMemo(() => allContent.slice(-4).reverse(), [allContent]);

  // Recently Played — mid section of content, last 5
  const recentlyPlayed = useMemo(() => allContent.slice(3, 8), [allContent]);

  // Creator published content
  const myPublished = useMemo(() => allContent.slice(0, 6), [allContent]);

  const close = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); };

  const navigateTo = (route: string) => {
    closeSidePanel();
    setTimeout(() => router.push(route as any), 80);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* ── Title ── */}
      <Text style={[styles.title, { color: C.label }]}>KayStudios</Text>
      <Text style={[styles.subtitle, { color: C.muted }]}>Universal · All modes</Text>

      {/* ── Quick Nav ── */}
      <SectionHeader label="NAVIGATE" C={C} styles={styles} />
      <View style={styles.section}>
        {([
          { icon: 'house',    label: 'Home'    },
          { icon: 'safari',   label: 'Explore' },
          { icon: 'folder',   label: 'Library' },
          { icon: 'magnifyingglass', label: 'Search' },
        ] as { icon: string; label: string }[]).map(item => (
          <NavRow
            key={item.label}
            icon={item.icon}
            label={item.label}
            C={C}
            styles={styles}
            onPress={() => { close(); }}
          />
        ))}
      </View>

      {/* ── In Progress ── */}
      <SectionHeader label="IN PROGRESS" C={C} styles={styles} />
      <View style={styles.section}>
        {inProgress.map(({ item, progress }) => (
          <MiniContentRow
            key={item.id}
            item={item}
            progress={progress}
            C={C}
            styles={styles}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigateTo('/(tabs)/(main)/kaystudios');
            }}
          />
        ))}
      </View>

      {/* ── My Courses ── */}
      <SectionHeader label="MY COURSES" C={C} styles={styles} />
      <View style={styles.section}>
        {myCourses.length === 0
          ? <Text style={[styles.emptyNote, { color: C.muted }]}>No courses enrolled</Text>
          : myCourses.map(item => (
            <MiniContentRow
              key={item.id}
              item={item}
              C={C}
              styles={styles}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigateTo('/(tabs)/(main)/kaystudios');
              }}
            />
          ))
        }
      </View>

      {/* ── Saved ── */}
      <SectionHeader label="SAVED" C={C} styles={styles} />
      <View style={styles.section}>
        {saved.length === 0
          ? <Text style={[styles.emptyNote, { color: C.muted }]}>Nothing saved yet</Text>
          : saved.map(item => (
            <MiniContentRow
              key={item.id}
              item={item}
              C={C}
              styles={styles}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigateTo('/(tabs)/(main)/kaystudios');
              }}
            />
          ))
        }
      </View>

      {/* ── Achievements ── */}
      <SectionHeader label="ACHIEVEMENTS" C={C} styles={styles} />
      <View style={styles.section}>

        {/* Stats row */}
        <View style={[styles.statsRow, { backgroundColor: C.surface }]}>
          {[
            { label: 'Completed', value: String(ACHIEVEMENTS.completed) },
            { label: 'Day Streak', value: String(ACHIEVEMENTS.streak)   },
            { label: 'XP',        value: fmtViews(ACHIEVEMENTS.xp)      },
            { label: 'Rank',      value: `#${ACHIEVEMENTS.rank}`        },
          ].map(s => (
            <View key={s.label} style={styles.statCell}>
              <Text style={[styles.statValue, { color: C.label }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: C.muted }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Badges */}
        <View style={[styles.badgeRow, { backgroundColor: C.surface }]}>
          {ACHIEVEMENTS.badges.map((b, i) => (
            <View key={i} style={[styles.badge, { backgroundColor: C.surfacePressed }]}>
              <Text style={styles.badgeEmoji}>{b}</Text>
            </View>
          ))}
          <View style={[styles.badge, { backgroundColor: C.surfacePressed }]}>
            <Text style={[styles.badgeMore, { color: C.muted }]}>+12</Text>
          </View>
        </View>

        <NavRow icon="trophy" label="View All Achievements" C={C} styles={styles} onPress={close} />
        <NavRow icon="chart.bar" label="Leaderboard" detail="#42 global" C={C} styles={styles} onPress={close} />
      </View>

      {/* ── Recently Played ── */}
      <SectionHeader label="RECENTLY PLAYED" C={C} styles={styles} />
      <View style={styles.section}>
        {recentlyPlayed.map(item => (
          <MiniContentRow
            key={item.id}
            item={item}
            C={C}
            styles={styles}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigateTo('/(tabs)/(main)/kaystudios');
            }}
          />
        ))}
      </View>

      {/* ── Following ── */}
      <SectionHeader label="FOLLOWING" C={C} styles={styles} />
      <View style={styles.section}>
        {FOLLOWING.map(creator => (
          <Pressable
            key={creator.id}
            style={({ pressed }) => [styles.subRow, pressed && { backgroundColor: C.surfacePressed }]}
            onPress={close}
          >
            <View style={[styles.subAvatar, { backgroundColor: `hsl(${creator.hue},40%,35%)` }]}>
              <Text style={styles.subAvatarText}>{creator.initials}</Text>
            </View>
            <View style={styles.subInfo}>
              <Text style={[styles.subName, { color: C.label }]}>{creator.name}</Text>
              <Text style={[styles.subHandle, { color: C.muted }]}>{creator.handle}</Text>
            </View>
            {creator.newContent > 0 && (
              <View style={[styles.newBadge, { backgroundColor: C.accent }]}>
                <Text style={styles.newBadgeText}>{creator.newContent}</Text>
              </View>
            )}
          </Pressable>
        ))}
        <NavRow icon="person.badge.plus" label="Browse Creators" C={C} styles={styles} onPress={close} />
      </View>

      {/* ── Creator / Admin Section ── */}
      {isCreator && (
        <>
          <SectionHeader label="MY CONTENT" C={C} styles={styles} />
          <View style={styles.section}>

            {/* Creator stats */}
            <View style={[styles.statsRow, { backgroundColor: C.surface }]}>
              {[
                { label: 'Published', value: String(CREATOR_STATS.published) },
                { label: 'Total Plays', value: fmtViews(CREATOR_STATS.totalPlays) },
                { label: 'Avg Rating', value: CREATOR_STATS.avgRating.toFixed(1) },
                { label: 'Revenue', value: `$${CREATOR_STATS.revenue}` },
              ].map(s => (
                <View key={s.label} style={styles.statCell}>
                  <Text style={[styles.statValue, { color: C.label }]}>{s.value}</Text>
                  <Text style={[styles.statLabel, { color: C.muted }]}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Create shortcut chips */}
            <Text style={[styles.subSectionLabel, { color: C.secondary }]}>Create New</Text>
            <View style={styles.chipRow}>
              {(['Course', 'Quiz', 'Challenge', 'Poll'] as string[]).map(type => (
                <Pressable
                  key={type}
                  style={({ pressed }) => [styles.chip, { backgroundColor: pressed ? C.accent : C.surface, borderColor: C.inputBorder }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); close(); }}
                >
                  <IconSymbol
                    name={type === 'Course' ? 'book' : type === 'Quiz' ? 'list.clipboard' : type === 'Challenge' ? 'flag' : 'chart.bar'}
                    size={13}
                    color={C.secondary}
                  />
                  <Text style={[styles.chipText, { color: C.label }]}>{type}</Text>
                </Pressable>
              ))}
            </View>

            {/* Manage Content (expand) */}
            <Pressable
              style={({ pressed }) => [styles.navRow, pressed && { backgroundColor: C.surfacePressed }]}
              onPress={() => { Haptics.selectionAsync(); setManageOpen(v => !v); }}
            >
              <IconSymbol name="film" size={17} color={C.secondary} />
              <Text style={[styles.navLabel, { color: C.label }]}>Manage Content</Text>
              <Text style={[styles.navDetail, { color: C.muted }]}>{CREATOR_STATS.published} items</Text>
              <IconSymbol name={manageOpen ? 'chevron.up' : 'chevron.down'} size={13} color={C.muted} />
            </Pressable>

            {manageOpen && myPublished.map(item => (
              <View key={item.id} style={[styles.manageRow, { borderBottomColor: C.separator }]}>
                <View style={[styles.manageThumb, { backgroundColor: `hsl(${item.thumbHue},42%,28%)` }]}>
                  <Text style={styles.manageEmoji}>{item.thumbEmoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.manageTitle, { color: C.label }]} numberOfLines={1}>{item.title}</Text>
                  <Text style={[styles.manageMeta, { color: C.muted }]}>
                    {fmtViews(Math.floor(Math.random() * 3000 + 200))} plays · {item.difficulty}
                  </Text>
                </View>
                <Pressable hitSlop={8} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                  <IconSymbol name="pencil" size={14} color={C.secondary} />
                </Pressable>
              </View>
            ))}

            {/* Analytics */}
            <NavRow icon="chart.xyaxis.line" label="Analytics" detail="All content" C={C} styles={styles} onPress={close} />

            {/* Drafts */}
            <NavRow
              icon="doc.badge.clock"
              label="Drafts"
              detail={`${CREATOR_DRAFTS.length} items`}
              C={C}
              styles={styles}
              onPress={close}
            />

            {/* Revenue */}
            <NavRow icon="banknote" label="Revenue Summary" detail="→ Earn" C={C} styles={styles}
              onPress={() => { navigateTo('/(tabs)/(main)/earn'); }}
            />
          </View>
        </>
      )}

      {/* ── Settings ── */}
      <Pressable
        style={styles.settingsToggle}
        onPress={() => { Haptics.selectionAsync(); setSettingsOpen(v => !v); }}
      >
        <Text style={[styles.sectionHeader, { color: C.secondary, marginBottom: 0 }]}>SETTINGS</Text>
        <IconSymbol name={settingsOpen ? 'chevron.up' : 'chevron.down'} size={13} color={C.muted} />
      </Pressable>

      {settingsOpen && (
        <View style={styles.section}>
          {([
            { icon: 'play.circle',       label: 'Autoplay Next',          detail: 'On'  },
            { icon: 'speaker.wave.2',    label: 'Sound Effects',          detail: 'On'  },
            { icon: 'dial.medium',       label: 'Default Difficulty',     detail: 'Medium' },
            { icon: 'bell',              label: 'New Content Alerts',     detail: 'On'  },
            { icon: 'flame',             label: 'Streak Reminders',       detail: '8 AM' },
            { icon: 'stopwatch',         label: 'Challenge Reminders',    detail: 'Off' },
            { icon: 'arrow.down.circle', label: 'Offline Downloads',      detail: '2 items' },
          ] as { icon: string; label: string; detail: string }[]).map(item => (
            <NavRow
              key={item.label}
              icon={item.icon}
              label={item.label}
              detail={item.detail}
              C={C}
              styles={styles}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            />
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container:    { flex: 1 },
  title:        { fontSize: 20, fontWeight: '700', paddingHorizontal: 16, marginBottom: 2 },
  subtitle:     { fontSize: 12, paddingHorizontal: 16, marginBottom: 18 },

  sectionHeader: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, paddingHorizontal: 16, marginBottom: 4, marginTop: 16 },
  section:       { marginBottom: 4 },

  navRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
  navLabel:  { flex: 1, fontSize: 14, fontWeight: '500' },
  navDetail: { fontSize: 12, marginRight: 2 },

  // Mini content rows
  miniRow:       { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingHorizontal: 16, paddingVertical: 9 },
  miniThumb:     { width: 52, height: 52, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  miniEmoji:     { fontSize: 22 },
  miniInfo:      { flex: 1, paddingTop: 1 },
  miniTitle:     { fontSize: 13, fontWeight: '600', lineHeight: 17 },
  miniSub:       { fontSize: 11, marginTop: 2 },
  progressTrack: { height: 3, borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  progressFill:  { height: '100%', borderRadius: 2 },
  pctLabel:      { fontSize: 10, alignSelf: 'flex-start', marginTop: 2, minWidth: 30, textAlign: 'right' },

  // Stats row (shared)
  statsRow:  { flexDirection: 'row', marginHorizontal: 16, borderRadius: 10, marginBottom: 8 },
  statCell:  { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statValue: { fontSize: 16, fontWeight: '700' },
  statLabel: { fontSize: 9, marginTop: 2, textAlign: 'center' },

  // Achievements badges
  badgeRow:  { flexDirection: 'row', gap: 8, marginHorizontal: 16, borderRadius: 10, padding: 12, marginBottom: 4 },
  badge:     { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  badgeEmoji:{ fontSize: 20 },
  badgeMore: { fontSize: 12, fontWeight: '600' },

  // Following / subscriptions
  subRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
  subAvatar:    { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  subAvatarText:{ fontSize: 11, fontWeight: '700', color: '#fff' },
  subInfo:      { flex: 1 },
  subName:      { fontSize: 13, fontWeight: '600' },
  subHandle:    { fontSize: 11, marginTop: 1 },
  newBadge:     { minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  newBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },

  // Creator create chips
  subSectionLabel: { fontSize: 11, fontWeight: '600', paddingHorizontal: 16, marginBottom: 8, marginTop: 4 },
  chipRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  chip:      { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  chipText:  { fontSize: 12, fontWeight: '500' },

  // Manage content rows
  manageRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 9, gap: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  manageThumb: { width: 38, height: 38, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  manageEmoji: { fontSize: 16 },
  manageTitle: { fontSize: 12, fontWeight: '500' },
  manageMeta:  { fontSize: 10, marginTop: 2 },

  // Settings
  settingsToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 16, marginBottom: 4 },

  emptyNote: { fontSize: 13, paddingHorizontal: 16, paddingVertical: 10 },
});
