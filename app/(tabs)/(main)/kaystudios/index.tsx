/**
 * KayStudios — Interactive Experiences Hub
 * Home: mode-scoped feed — tap to launch experience.
 * Explore: discovery rows (Trending / New / Popular This Week / Rising Creators).
 * Library: In Progress / Completed / Saved / My Courses.
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View, Text, Pressable, ScrollView, FlatList,
  StyleSheet, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useAppContext } from '@/context/app-context';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';
import {
  getFeedContent, getExploreRows, getModeContent, filterByPill,
  STUDIOS_CONTENT_PILLS,
  type StudioContent, type ExperienceType,
} from '@/data/mock-kaystudios';
import {
  loadAllProgress, getSavedIds, type ProgressEntry,
} from '@/utils/studios-progress';

type KSTab = 'Home' | 'Explore' | 'Library';

const TOP_BAR_H = 52;
const PILL_ROW_H = 48;
const THUMB_W = 86;
const CARD_H = 96;

// ── Type Badge ──────────────────────────────────────────────────────────────

function TypeBadge({ type, C }: { type: ExperienceType; C: ComponentColors }) {
  const labels: Record<ExperienceType, string> = {
    trivia: 'Trivia', quiz: 'Quiz', course: 'Course',
    flashcards: 'Flashcards', simulation: 'Simulation',
    game: 'Game', training: 'Training', devotional: 'Devotional',
  };
  return (
    <View style={[styles.typeBadge, { backgroundColor: C.surfacePressed }]}>
      <Text style={[styles.typeBadgeText, { color: C.secondary }]}>{labels[type]}</Text>
    </View>
  );
}

// ── Content Card ────────────────────────────────────────────────────────────

function ContentCard({
  item, C, onPress, progress,
}: {
  item: StudioContent;
  C: ComponentColors;
  onPress: () => void;
  progress?: ProgressEntry | null;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.88 : 1 }]}
    >
      <View style={[styles.cardThumb, { backgroundColor: `hsl(${item.thumbHue},42%,28%)` }]}>
        <Text style={styles.cardEmoji}>{item.thumbEmoji}</Text>
        {progress && !progress.completed && progress.progress > 0 && (
          <View style={styles.cardProgressBg}>
            <View style={[styles.cardProgressFill, { width: `${progress.progress * 100}%` as any, backgroundColor: C.accent }]} />
          </View>
        )}
        {progress?.completed && (
          <View style={[styles.cardCompletedBadge, { backgroundColor: C.green }]}>
            <IconSymbol name="checkmark" size={9} color="#fff" />
          </View>
        )}
      </View>
      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, { color: C.label }]} numberOfLines={2}>{item.title}</Text>
        <Text style={[styles.cardBrand, { color: C.secondary }]} numberOfLines={1}>
          {item.brand} · @{item.brandHandle}
        </Text>
        <View style={styles.cardMeta}>
          <TypeBadge type={item.type} C={C} />
          <Text style={[styles.cardParticipants, { color: C.muted }]}>{item.participants}</Text>
        </View>
      </View>
      <IconSymbol name="chevron.right" size={14} color={C.muted} />
    </Pressable>
  );
}

// ── Explore Card ────────────────────────────────────────────────────────────

function ExploreCard({
  item, C, onPress,
}: { item: StudioContent; C: ComponentColors; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.exploreCard, { opacity: pressed ? 0.88 : 1 }]}>
      <View style={[styles.exploreThumb, { backgroundColor: `hsl(${item.thumbHue},42%,26%)` }]}>
        <Text style={styles.exploreEmoji}>{item.thumbEmoji}</Text>
      </View>
      <Text style={[styles.exploreTitle, { color: C.label }]} numberOfLines={2}>{item.title}</Text>
      <TypeBadge type={item.type} C={C} />
    </Pressable>
  );
}

// ── Explore Row ─────────────────────────────────────────────────────────────

function ExploreRow({
  label, items, C, onPressItem,
}: { label: string; items: StudioContent[]; C: ComponentColors; onPressItem: (item: StudioContent) => void }) {
  if (items.length === 0) return null;
  return (
    <View style={styles.exploreRowWrap}>
      <Text style={[styles.rowLabel, { color: C.label }]}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 16, paddingRight: 8, gap: 12 }}
      >
        {items.map(item => (
          <ExploreCard key={item.id} item={item} C={C} onPress={() => onPressItem(item)} />
        ))}
      </ScrollView>
    </View>
  );
}

// ── Library Section ─────────────────────────────────────────────────────────

function LibSection({
  title, items, C, onPressItem, progress,
}: {
  title: string; items: StudioContent[]; C: ComponentColors;
  onPressItem: (item: StudioContent) => void; progress?: Record<string, ProgressEntry>;
}) {
  if (items.length === 0) return null;
  return (
    <View style={styles.libSection}>
      <Text style={[styles.rowLabel, { color: C.label, paddingLeft: 16 }]}>{title}</Text>
      {items.map(item => (
        <ContentCard
          key={item.id}
          item={item}
          C={C}
          onPress={() => onPressItem(item)}
          progress={progress?.[item.id]}
        />
      ))}
    </View>
  );
}

// ── KayStudios Screen ───────────────────────────────────────────────────────

export default function KayStudiosScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state } = useAppContext();
  const mode = (state.activeContext?.mode as string) ?? 'sports';

  const [activeTab, setActiveTab] = useState<KSTab>('Home');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filterPillsVisible, setFilterPillsVisible] = useState(false);
  const [selectedPill, setSelectedPill] = useState('All');
  const [allProgress, setAllProgress] = useState<Record<string, ProgressEntry>>({});
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const pillsRevealAnim = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);

  const topBarH = insets.top + TOP_BAR_H;
  const contentTop = topBarH + (filterPillsVisible ? PILL_ROW_H : 0);

  const pills = useMemo(() => STUDIOS_CONTENT_PILLS[mode] ?? ['All'], [mode]);
  const feedContent = useMemo(() => getFeedContent(mode), [mode]);
  const exploreRows = useMemo(() => getExploreRows(mode), [mode]);
  const modeContent = useMemo(() => getModeContent(mode), [mode]);

  const loadLibraryData = useCallback(async () => {
    const [prog, saves] = await Promise.all([loadAllProgress(), getSavedIds()]);
    setAllProgress(prog);
    setSavedIds(saves);
  }, []);

  useEffect(() => { loadLibraryData(); }, [loadLibraryData]);

  useEffect(() => {
    if (activeTab === 'Library') loadLibraryData();
  }, [activeTab, loadLibraryData]);

  useEffect(() => {
    setSelectedPill('All');
    setFilterPillsVisible(false);
    pillsRevealAnim.setValue(0);
    setActiveTab('Home');
    loadLibraryData();
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Library derived lists
  const inProgressItems = useMemo(() =>
    modeContent.filter(c => { const p = allProgress[c.id]; return p && p.progress > 0 && !p.completed; }),
    [modeContent, allProgress]);
  const completedItems = useMemo(() =>
    modeContent.filter(c => allProgress[c.id]?.completed),
    [modeContent, allProgress]);
  const savedItems = useMemo(() =>
    modeContent.filter(c => savedIds.includes(c.id)),
    [modeContent, savedIds]);
  const myCourses = useMemo(() =>
    modeContent.filter(c => c.type === 'course'),
    [modeContent]);

  const filteredFeed = useMemo(() => filterByPill(feedContent, selectedPill), [feedContent, selectedPill]);
  const filteredExploreRows = useMemo(() =>
    exploreRows.map(row => ({ ...row, items: filterByPill(row.items, selectedPill) }))
      .filter(row => row.items.length > 0),
    [exploreRows, selectedPill]);

  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  const toggleFilterPills = useCallback(() => {
    setFilterPillsVisible(prev => {
      const next = !prev;
      Animated.timing(pillsRevealAnim, { toValue: next ? 1 : 0, duration: 200, useNativeDriver: false }).start();
      return next;
    });
  }, [pillsRevealAnim]);

  const handleTabSelect = useCallback((tab: KSTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
    setDropdownOpen(false);
    setFilterPillsVisible(false);
    pillsRevealAnim.setValue(0);
    setSelectedPill('All');
  }, [pillsRevealAnim]);

  const launchExperience = useCallback((item: StudioContent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/(tabs)/(main)/kaystudios/experience' as any,
      params: { contentId: item.id },
    });
  }, [router]);

  const navigateToDetail = useCallback((item: StudioContent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/(tabs)/(main)/kaystudios/detail' as any,
      params: { contentId: item.id },
    });
  }, [router]);

  return (
    <View style={[styles.screen, { backgroundColor: C.bg }]}>

      {/* ── Home View ── */}
      {activeTab === 'Home' && (
        <FlatList
          data={filteredFeed}
          keyExtractor={item => item.id}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: contentTop + 8, paddingBottom: 120 }}
          ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: C.separator }]} />}
          renderItem={({ item }) => (
            <ContentCard
              item={item}
              C={C}
              onPress={() => launchExperience(item)}
              progress={allProgress[item.id]}
            />
          )}
          ListEmptyComponent={
            <View style={[styles.empty, { marginTop: 80 }]}>
              <Text style={styles.emptyIcon}>🎮</Text>
              <Text style={[styles.emptyText, { color: C.secondary }]}>No experiences in this category</Text>
            </View>
          }
        />
      )}

      {/* ── Explore View ── */}
      {activeTab === 'Explore' && (
        <ScrollView
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: contentTop + 8, paddingBottom: 120 }}
        >
          {filteredExploreRows.map(row => (
            <ExploreRow
              key={row.label}
              label={row.label}
              items={row.items}
              C={C}
              onPressItem={navigateToDetail}
            />
          ))}
          {filteredExploreRows.length === 0 && (
            <View style={[styles.empty, { marginTop: 80 }]}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={[styles.emptyText, { color: C.secondary }]}>Nothing in this category</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* ── Library View ── */}
      {activeTab === 'Library' && (
        <ScrollView
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: contentTop + 8, paddingBottom: 120 }}
        >
          <LibSection title="In Progress" items={inProgressItems} C={C} onPressItem={launchExperience} progress={allProgress} />
          <LibSection title="Completed" items={completedItems} C={C} onPressItem={navigateToDetail} progress={allProgress} />
          <LibSection title="Saved" items={savedItems} C={C} onPressItem={navigateToDetail} progress={allProgress} />
          <LibSection title="My Courses" items={myCourses} C={C} onPressItem={launchExperience} progress={allProgress} />
          {!inProgressItems.length && !completedItems.length && !savedItems.length && !myCourses.length && (
            <View style={[styles.empty, { marginTop: 100 }]}>
              <Text style={styles.emptyIcon}>📚</Text>
              <Text style={[styles.emptyTitle, { color: C.secondary }]}>Your library is empty</Text>
              <Text style={[styles.emptySubtitle, { color: C.muted }]}>
                Start an experience to track your progress here
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* ── Fixed Top Bar ── */}
      <View style={[styles.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg }]}>
        <View style={styles.topBar}>
          <View style={styles.topBarSide}>
            <Text style={[styles.wordmark, { color: C.label }]}>KS</Text>
          </View>
          <View style={styles.dropdownPillWrap}>
            <Pressable
              style={[styles.dropdownPill, { backgroundColor: C.surfacePressed }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setDropdownOpen(v => !v); }}
            >
              <Text style={[styles.dropdownPillText, { color: C.label }]}>{activeTab}</Text>
              <IconSymbol name="chevron.down" size={12} color={C.secondary} />
            </Pressable>
          </View>
          <View style={[styles.topBarSide, { alignItems: 'flex-end' }]}>
            <Pressable onPress={toggleFilterPills} hitSlop={12}>
              <IconSymbol
                name={filterPillsVisible || selectedPill !== 'All'
                  ? 'line.3.horizontal.decrease.circle.fill'
                  : 'line.3.horizontal.decrease.circle'}
                size={22}
                color={filterPillsVisible || selectedPill !== 'All' ? C.accent : C.label}
              />
            </Pressable>
          </View>
        </View>

        <Animated.View style={{
          height: pillsRevealAnim.interpolate({ inputRange: [0, 1], outputRange: [0, PILL_ROW_H] }),
          opacity: pillsRevealAnim,
          overflow: 'hidden',
        }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsContent}
            style={[styles.pillsRow, { borderTopColor: C.separator }]}
          >
            {pills.map(pill => {
              const active = pill === selectedPill;
              return (
                <Pressable
                  key={pill}
                  style={[styles.pill, active ? { backgroundColor: C.label } : { borderColor: C.separator }]}
                  onPress={() => { Haptics.selectionAsync(); setSelectedPill(pill); }}
                >
                  <Text style={[styles.pillText, { color: active ? C.bg : C.secondary }, active && { fontWeight: '600' }]}>
                    {pill}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>

      {/* ── Dropdown ── */}
      {dropdownOpen && (
        <>
          <Pressable style={[StyleSheet.absoluteFillObject, { zIndex: 98 }]} onPress={() => setDropdownOpen(false)} />
          <View style={[styles.dropdown, { top: insets.top + 56, backgroundColor: C.bg, borderColor: C.separator, zIndex: 99 }]}>
            {(['Home', 'Explore', 'Library'] as KSTab[]).map(tab => (
              <Pressable key={tab} style={styles.dropdownOption} onPress={() => handleTabSelect(tab)}>
                <Text style={[
                  styles.dropdownOptionText,
                  { color: tab === activeTab ? C.label : C.secondary },
                  tab === activeTab && { fontWeight: '600' },
                ]}>
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* ── Search FAB ── */}
      <Pressable
        style={[styles.fab, { bottom: insets.bottom + 49 + 16, backgroundColor: C.accent }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/(tabs)/(main)/kaystudios/search' as any);
        }}
      >
        <IconSymbol name="magnifyingglass" size={20} color="#fff" />
      </Pressable>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },

  topBarWrap: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topBar: { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide: { width: 48, justifyContent: 'center' },
  wordmark: { fontSize: 18, fontWeight: '900', letterSpacing: 1 },

  dropdownPillWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dropdownPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 6 },
  dropdownPillText: { fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },

  dropdown: {
    position: 'absolute', left: '50%', marginLeft: -110, minWidth: 220,
    borderRadius: 14, borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 12, elevation: 8, overflow: 'hidden',
  },
  dropdownOption: { paddingVertical: 14, paddingHorizontal: 20 },
  dropdownOptionText: { fontSize: 15 },

  pillsRow: { height: PILL_ROW_H, borderTopWidth: StyleSheet.hairlineWidth },
  pillsContent: { paddingHorizontal: 12, alignItems: 'center', gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  pillText: { fontSize: 13 },

  // Content card
  card: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 14,
  },
  separator: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
  cardThumb: {
    width: THUMB_W, height: CARD_H, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', flexShrink: 0, position: 'relative',
  },
  cardEmoji: { fontSize: 32 },
  cardProgressBg: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: 'rgba(255,255,255,0.25)' },
  cardProgressFill: { height: 3, borderRadius: 1.5 },
  cardCompletedBadge: {
    position: 'absolute', top: 6, right: 6, width: 18, height: 18,
    borderRadius: 9, alignItems: 'center', justifyContent: 'center',
  },
  cardInfo: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 15, fontWeight: '700', lineHeight: 20 },
  cardBrand: { fontSize: 12 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeBadgeText: { fontSize: 10, fontWeight: '600' },
  cardParticipants: { fontSize: 11 },

  // Explore card
  exploreCard: { width: 140 },
  exploreThumb: { width: 140, height: 100, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  exploreEmoji: { fontSize: 36 },
  exploreTitle: { fontSize: 13, fontWeight: '600', lineHeight: 18, marginBottom: 6 },

  exploreRowWrap: { marginBottom: 24 },
  rowLabel: { fontSize: 16, fontWeight: '700', paddingBottom: 10 },

  libSection: { marginBottom: 24 },

  fab: {
    position: 'absolute', right: 24, width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4, zIndex: 20,
  },

  empty: { alignItems: 'center', gap: 10 },
  emptyIcon: { fontSize: 44 },
  emptyText: { fontSize: 15 },
  emptyTitle: { fontSize: 16, fontWeight: '600' },
  emptySubtitle: { fontSize: 13, textAlign: 'center', paddingHorizontal: 40, lineHeight: 19 },
});
