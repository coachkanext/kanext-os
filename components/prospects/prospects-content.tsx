/**
 * Prospects — 3-page swipeable layout for sports mode.
 * Page 0: Rankings — top players by KR, scope & position filters.
 * Page 1: Discover — filterable player search with archetypes.
 * Page 2: Schools — school browser by level/state.
 * Identical SwipeablePages / LongPressContextMenu patterns as Roster.
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { SwipeablePages } from '@/components/ui/swipeable-two-page';
import { LongPressContextMenu, type ContextMenuData } from '@/components/ui/long-press-context-menu';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import {
  RANKINGS_SUMMARY,
  RANKED_PLAYERS,
  SCHOOLS,
  getRankedPlayers,
  searchPlayers,
  getSchools,
  type RankedPlayerItem,
  type DiscoverPlayerItem,
  type SchoolItem,
  type PositionFilter,
  type RankingScopeFilter,
  type DiscoverFilter,
  type DiscoverSortKey,
  type SchoolLevelFilter,
} from '@/data/mock-prospects-screen';
import { openSidePanel } from '@/utils/global-side-panel';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';

// ── Trend colors/icons ──

const TREND_ICON: Record<string, string> = {
  rising: 'arrow.up.right',
  falling: 'arrow.down.right',
  stable: 'minus',
};
const TREND_COLOR: Record<string, string> = {
  rising: '#22C55E',
  falling: '#EF4444',
  stable: '#52525B',
};

// ─── Page Top Bar ───────────────────────────────────────────────────────────

function PageTopBar({ title }: { title: string }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <View style={s.topBar}>
      <Text style={s.topBarTitle}>{title}</Text>
    </View>
  );
}

// ─── Filter Pills (generic) ────────────────────────────────────────────────

function FilterPills<T extends string>({
  items,
  active,
  onSelect,
}: {
  items: { key: T; label: string }[];
  active: T;
  onSelect: (key: T) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.filterRow}
    >
      {items.map((item) => {
        const isActive = active === item.key;
        return (
          <Pressable
            key={item.key}
            style={[s.filterPill, isActive && s.filterPillActive]}
            onPress={() => onSelect(item.key)}
          >
            <Text style={[s.filterText, isActive && s.filterTextActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ─── Toggle Filter Pills (multi-select with X) ─────────────────────────────

function ToggleFilterPills({
  items,
  active,
  onToggle,
}: {
  items: { key: string; label: string }[];
  active: Set<string>;
  onToggle: (key: string) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.filterRow}
    >
      {items.map((item) => {
        const isActive = active.has(item.key);
        return (
          <Pressable
            key={item.key}
            style={[s.filterPill, isActive && s.filterPillFilled]}
            onPress={() => onToggle(item.key)}
          >
            <Text style={[s.filterText, isActive && s.filterTextActive]}>
              {isActive ? `${item.label} \u00D7` : item.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ─── Rankings Summary Card ──────────────────────────────────────────────────

function RankingsSummaryCard() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <View style={s.summaryCard}>
      <View style={s.summaryHeader}>
        <Text style={s.summaryLabel}>RANKINGS</Text>
        <View style={s.summaryBadge}>
          <Text style={s.summaryBadgeText}>{RANKINGS_SUMMARY.totalRanked.toLocaleString()} ranked</Text>
        </View>
      </View>
      <View style={s.summaryPositions}>
        <View style={s.summaryPosItem}>
          <Text style={s.summaryPosCount}>{RANKINGS_SUMMARY.topKR}</Text>
          <Text style={s.summaryPosLabel}>Top KR</Text>
        </View>
        <View style={s.summaryPosItem}>
          <Text style={s.summaryPosCount}>{RANKINGS_SUMMARY.levelsCovered}</Text>
          <Text style={s.summaryPosLabel}>Levels</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Featured Player Card (horizontal scroll) ──────────────────────────────

function FeaturedPlayerCard({ player, rank }: { player: RankedPlayerItem; rank: number }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <Pressable style={s.featuredCard}>
      <View style={s.featuredAvatar}>
        <Text style={s.featuredInitials}>{player.initials}</Text>
      </View>
      <Text style={s.featuredKR}>{player.krRating}</Text>
      <Text style={s.featuredName} numberOfLines={1}>{player.name}</Text>
      <View style={s.featuredMeta}>
        <View style={[s.positionPill, { backgroundColor: C.blue + '22' }]}>
          <Text style={[s.positionPillText, { color: C.blue }]}>{player.position}</Text>
        </View>
      </View>
      <Text style={s.featuredSchool} numberOfLines={1}>{player.school}</Text>
    </Pressable>
  );
}

// ─── Ranked Player Row ──────────────────────────────────────────────────────

function RankedPlayerRow({
  player,
  rank,
  onLongPress,
}: {
  player: RankedPlayerItem;
  rank: number;
  onLongPress: (pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const trendColor = TREND_COLOR[player.trend];
  const trendIcon = TREND_ICON[player.trend];

  return (
    <Pressable
      style={({ pressed }) => [s.row, pressed && s.rowPressed]}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      <Text style={s.rankNumber}>{rank}</Text>
      <View style={s.playerAvatar}>
        <Text style={s.playerInitials}>{player.initials}</Text>
      </View>
      <View style={s.rowContent}>
        <View style={s.playerNameRow}>
          <Text style={s.rowName} numberOfLines={1}>{player.name}</Text>
          <Text style={s.username}>@{player.username}</Text>
        </View>
        <View style={s.playerMetaRow}>
          <View style={[s.positionPill, { backgroundColor: C.blue + '22' }]}>
            <Text style={[s.positionPillText, { color: C.blue }]}>{player.position}</Text>
          </View>
          <Text style={s.playerMeta}>{player.classYear}</Text>
          <Text style={s.playerDot}>&middot;</Text>
          <Text style={s.playerMeta}>{player.height} &middot; {player.weight}lb</Text>
        </View>
        <View style={s.playerMetaRow}>
          <Text style={s.playerMeta}>{player.school}</Text>
          <View style={[s.levelBadge, { backgroundColor: C.surface }]}>
            <Text style={s.levelBadgeText}>{player.level}</Text>
          </View>
          {player.inPortal && (
            <View style={[s.microBadge, { backgroundColor: C.purple + '22' }]}>
              <Text style={[s.microBadgeText, { color: C.purple }]}>Portal</Text>
            </View>
          )}
          <IconSymbol name={trendIcon as any} size={10} color={trendColor} />
        </View>
      </View>
      <View style={s.krContainer}>
        <Text style={s.krValue}>{player.krRating}</Text>
        <Text style={s.krTierText}>{player.krTier}</Text>
      </View>
    </Pressable>
  );
}

// ─── Discover Player Row ────────────────────────────────────────────────────

function DiscoverPlayerRow({
  player,
  onLongPress,
}: {
  player: DiscoverPlayerItem;
  onLongPress: (pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <Pressable
      style={({ pressed }) => [s.row, pressed && s.rowPressed]}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      <View style={s.playerAvatar}>
        <Text style={s.playerInitials}>{player.initials}</Text>
      </View>
      <View style={s.rowContent}>
        <View style={s.playerNameRow}>
          <Text style={s.rowName} numberOfLines={1}>{player.name}</Text>
          <Text style={s.username}>@{player.username}</Text>
        </View>
        <View style={s.playerMetaRow}>
          <View style={[s.positionPill, { backgroundColor: C.blue + '22' }]}>
            <Text style={[s.positionPillText, { color: C.blue }]}>{player.position}</Text>
          </View>
          <View style={[s.levelBadge, { backgroundColor: C.surface }]}>
            <Text style={s.levelBadgeText}>{player.level}</Text>
          </View>
          <Text style={s.playerMeta}>{player.school}</Text>
        </View>
        <View style={s.playerMetaRow}>
          <View style={[s.microBadge, { backgroundColor: C.amber + '22' }]}>
            <Text style={[s.microBadgeText, { color: C.amber }]}>{player.archetype}</Text>
          </View>
          {player.inPortal && (
            <View style={[s.microBadge, { backgroundColor: C.purple + '22' }]}>
              <Text style={[s.microBadgeText, { color: C.purple }]}>Portal</Text>
            </View>
          )}
        </View>
        <View style={s.playerMetaRow}>
          {player.topTraits.map((trait) => (
            <View key={trait} style={[s.traitPill, { backgroundColor: C.surface }]}>
              <Text style={s.traitPillText}>{trait}</Text>
            </View>
          ))}
          <Text style={s.playerMeta}>{player.height} &middot; {player.weight}lb &middot; {player.classYear}</Text>
        </View>
      </View>
      <View style={s.krContainer}>
        <Text style={s.krValue}>{player.krRating}</Text>
        <Text style={s.krLabel}>KR</Text>
      </View>
    </Pressable>
  );
}

// ─── School Row ─────────────────────────────────────────────────────────────

function SchoolRow({
  school,
  onLongPress,
}: {
  school: SchoolItem;
  onLongPress: (pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <Pressable
      style={({ pressed }) => [s.row, pressed && s.rowPressed]}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      <View style={s.schoolAvatar}>
        <Text style={s.schoolInitials}>{school.initials}</Text>
      </View>
      <View style={s.rowContent}>
        <Text style={s.rowName} numberOfLines={1}>{school.name}</Text>
        <View style={s.playerMetaRow}>
          <View style={[s.levelBadge, { backgroundColor: C.surface }]}>
            <Text style={s.levelBadgeText}>{school.level}</Text>
          </View>
          <Text style={s.playerMeta}>{school.conference}</Text>
        </View>
        <View style={s.playerMetaRow}>
          <Text style={s.playerMeta}>{school.city}, {school.state}</Text>
          <Text style={s.playerDot}>&middot;</Text>
          <Text style={s.playerMeta}>{school.rosterSize} players</Text>
        </View>
      </View>
      <View style={s.krContainer}>
        <Text style={s.krValue}>{school.krTeamRating}</Text>
        <Text style={s.krLabel}>KR</Text>
      </View>
    </Pressable>
  );
}

// ─── Sort Row ───────────────────────────────────────────────────────────────

function SortRow({
  sort,
  onSort,
}: {
  sort: DiscoverSortKey;
  onSort: (key: DiscoverSortKey) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const sortOptions: { key: DiscoverSortKey; label: string }[] = [
    { key: 'kr', label: 'KR Rating' },
    { key: 'trending', label: 'Trending' },
    { key: 'name', label: 'Name' },
  ];

  return (
    <View style={s.sortRow}>
      <Text style={s.sortLabel}>Sort by:</Text>
      {sortOptions.map((opt) => (
        <Pressable
          key={opt.key}
          onPress={() => onSort(opt.key)}
          style={[s.sortOption, sort === opt.key && s.sortOptionActive]}
        >
          <Text style={[s.sortOptionText, sort === opt.key && s.sortOptionTextActive]}>{opt.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// ─── FAB ────────────────────────────────────────────────────────────────────

function FAB({ onPress }: { onPress: () => void }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <Pressable
      style={({ pressed }) => [s.fab, pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
    >
      <IconSymbol name="plus" size={24} color={C.label} />
    </Pressable>
  );
}

// ─── Filter Data ────────────────────────────────────────────────────────────

const SCOPE_FILTERS: { key: RankingScopeFilter; label: string }[] = [
  { key: 'national',   label: 'National' },
  { key: 'state',      label: 'State' },
  { key: 'conference', label: 'Conference' },
  { key: 'level',      label: 'Level' },
];

const POSITION_FILTERS: { key: PositionFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'PG',  label: 'PG' },
  { key: 'CG',  label: 'CG' },
  { key: 'W',   label: 'W' },
  { key: 'F',   label: 'F' },
  { key: 'B',   label: 'B' },
];

const DISCOVER_FILTER_PILLS = [
  { key: 'level',     label: 'Level' },
  { key: 'position',  label: 'Position' },
  { key: 'kr',        label: 'KR Rating' },
  { key: 'classYear', label: 'Class Year' },
  { key: 'state',     label: 'State' },
  { key: 'portal',    label: 'Portal' },
  { key: 'archetype', label: 'Archetype' },
];

const SCHOOL_LEVEL_FILTERS: { key: SchoolLevelFilter; label: string }[] = [
  { key: 'all',     label: 'All Levels' },
  { key: 'D1-HM',  label: 'HM' },
  { key: 'D1-MM',  label: 'MM' },
  { key: 'D1-LM',  label: 'LM' },
  { key: 'D2',     label: 'D2' },
  { key: 'NAIA',   label: 'NAIA' },
  { key: 'NJCAA',  label: 'NJCAA' },
  { key: 'CCCAA',  label: 'CCCAA' },
];

// ─── Main Component ────────────────────────────────────────────────────────

export function ProspectsContent() {
  const insets = useSafeAreaInsets();
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  const [pageIndex, setPageIndex] = useState(0);
  const [menuData, setMenuData] = useState<ContextMenuData | null>(null);

  // Rankings state
  const [rankScope, setRankScope] = useState<RankingScopeFilter>('national');
  const [posFilter, setPosFilter] = useState<PositionFilter>('all');

  // Discover state
  const [discoverFilters, setDiscoverFilters] = useState<Set<string>>(new Set());
  const [discoverSort, setDiscoverSort] = useState<DiscoverSortKey>('kr');

  // Schools state
  const [schoolLevel, setSchoolLevel] = useState<SchoolLevelFilter>('all');

  // ── Data ──
  const rankedPlayers = useMemo(
    () => getRankedPlayers(rankScope, posFilter),
    [rankScope, posFilter],
  );
  const top5 = useMemo(() => rankedPlayers.slice(0, 5), [rankedPlayers]);

  const discoverResults = useMemo(() => {
    const filters: DiscoverFilter = {};
    if (discoverFilters.has('portal')) filters.portal = true;
    return searchPlayers(filters, discoverSort);
  }, [discoverFilters, discoverSort]);

  const filteredSchools = useMemo(
    () => getSchools(schoolLevel),
    [schoolLevel],
  );

  // ── Scroll footer hide ──
  const lastScrollY = useRef(0);
  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  // ── Long press: Ranked/Discover Player ──
  const longPressPlayer = useCallback((player: RankedPlayerItem, pageY: number) => {
    setMenuData({
      title: player.name,
      subtitle: `${player.position} · ${player.school} · ${player.level}`,
      initials: player.initials,
      pageY,
      actions: [
        { key: 'watchlist', label: 'Add to Watchlist', icon: 'eye.fill' },
        { key: 'board', label: 'Add to Board', icon: 'rectangle.stack.badge.plus' },
        { key: 'compare', label: 'Compare', icon: 'arrow.left.arrow.right' },
        { key: 'message', label: 'Message', icon: 'bubble.left.fill' },
        { key: 'share', label: 'Share Profile', icon: 'square.and.arrow.up' },
      ],
      onAction: () => {},
    });
  }, []);

  // ── Long press: School ──
  const longPressSchool = useCallback((school: SchoolItem, pageY: number) => {
    setMenuData({
      title: school.name,
      subtitle: `${school.level} · ${school.conference} · ${school.city}, ${school.state}`,
      initials: school.initials,
      pageY,
      actions: [
        { key: 'save', label: 'Save', icon: 'bookmark.fill' },
        { key: 'compare', label: 'Compare Schools', icon: 'arrow.left.arrow.right' },
        { key: 'share', label: 'Share', icon: 'square.and.arrow.up' },
      ],
      onAction: () => {},
    });
  }, []);

  // ── Discover filter toggle ──
  const toggleDiscoverFilter = useCallback((key: string) => {
    setDiscoverFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <SwipeablePages
        activeIndex={pageIndex}
        onPageChange={setPageIndex}
        onEdgeRight={openSidePanel}
      >
        {/* ── PAGE 0: RANKINGS ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Rankings" />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {/* Featured top 5 */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.featuredRow}
            >
              {top5.map((player, idx) => (
                <FeaturedPlayerCard key={player.id} player={player} rank={idx + 1} />
              ))}
            </ScrollView>

            {/* Scope filter */}
            <FilterPills items={SCOPE_FILTERS} active={rankScope} onSelect={setRankScope} />

            {/* Position filter */}
            <View style={{ marginTop: 4 }}>
              <FilterPills items={POSITION_FILTERS} active={posFilter} onSelect={setPosFilter} />
            </View>

            {/* Ranked list */}
            {rankedPlayers.map((player, idx) => (
              <View key={player.id}>
                {idx > 0 && <View style={s.separator} />}
                <RankedPlayerRow
                  player={player}
                  rank={idx + 1}
                  onLongPress={(pageY) => longPressPlayer(player, pageY)}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── PAGE 1: DISCOVER ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Discover" />
            <ToggleFilterPills
              items={DISCOVER_FILTER_PILLS}
              active={discoverFilters}
              onToggle={toggleDiscoverFilter}
            />
            <SortRow sort={discoverSort} onSort={setDiscoverSort} />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            <View style={s.resultCount}>
              <Text style={s.resultCountText}>{discoverResults.count} players match your filters</Text>
            </View>
            {discoverResults.players.map((player, idx) => (
              <View key={player.id}>
                {idx > 0 && <View style={s.separator} />}
                <DiscoverPlayerRow
                  player={player}
                  onLongPress={(pageY) => longPressPlayer(player, pageY)}
                />
              </View>
            ))}
          </ScrollView>
          <FAB onPress={() => {}} />
        </View>

        {/* ── PAGE 2: SCHOOLS ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Schools" />
            <FilterPills items={SCHOOL_LEVEL_FILTERS} active={schoolLevel} onSelect={setSchoolLevel} />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {filteredSchools.map((school, idx) => (
              <View key={school.id}>
                {idx > 0 && <View style={s.separator} />}
                <SchoolRow
                  school={school}
                  onLongPress={(pageY) => longPressSchool(school, pageY)}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </SwipeablePages>

      {/* Long-press context menu */}
      <LongPressContextMenu data={menuData} onClose={() => setMenuData(null)} />
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  pageScroll: { flex: 1 },

  // Top bar
  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  topBarTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: C.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Filter pills
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 4,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: C.surface,
  },
  filterPillActive: {
    backgroundColor: C.label,
  },
  filterPillFilled: {
    backgroundColor: C.blue,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.label,
  },
  filterTextActive: {
    color: '#000000',
  },

  // Summary card
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.secondary,
    letterSpacing: 0.5,
  },
  summaryBadge: {
    backgroundColor: C.blue + '22',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  summaryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.blue,
  },
  summaryPositions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryPosItem: {
    alignItems: 'center',
    gap: 2,
  },
  summaryPosCount: {
    fontSize: 20,
    fontWeight: '700',
    color: C.label,
  },
  summaryPosLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.secondary,
  },

  // Featured cards
  featuredRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  featuredCard: {
    width: 100,
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 12,
  },
  featuredAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  featuredInitials: {
    fontSize: 14,
    fontWeight: '700',
    color: C.label,
  },
  featuredKR: {
    fontSize: 22,
    fontWeight: '800',
    color: C.label,
    marginBottom: 2,
  },
  featuredName: {
    fontSize: 12,
    fontWeight: '600',
    color: C.label,
    textAlign: 'center',
    marginBottom: 4,
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  featuredSchool: {
    fontSize: 10,
    color: C.muted,
    textAlign: 'center',
  },

  // Shared row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 16,
    paddingRight: 12,
    backgroundColor: C.bg,
  },
  rowPressed: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  rowContent: { flex: 1, marginLeft: 12, marginRight: 8 },
  rowName: { fontSize: 16, fontWeight: '500', color: C.label },

  // Player row
  rankNumber: {
    width: 24,
    fontSize: 14,
    fontWeight: '700',
    color: C.muted,
    textAlign: 'center',
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerInitials: { fontSize: 12, fontWeight: '700', color: C.secondary },
  playerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  username: { fontSize: 12, color: C.muted },
  playerMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  playerMeta: { fontSize: 12, color: C.muted },
  playerDot: { fontSize: 12, color: C.muted },
  positionPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  positionPillText: { fontSize: 10, fontWeight: '700' },
  microBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 },
  microBadgeText: { fontSize: 9, fontWeight: '700' },
  levelBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 },
  levelBadgeText: { fontSize: 9, fontWeight: '600', color: C.secondary },
  krContainer: { alignItems: 'center', minWidth: 36 },
  krValue: { fontSize: 18, fontWeight: '700', color: C.label },
  krLabel: { fontSize: 9, fontWeight: '600', color: C.muted },
  krTierText: { fontSize: 9, fontWeight: '600', color: C.muted },

  // Trait pills
  traitPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  traitPillText: { fontSize: 9, fontWeight: '600', color: C.secondary },

  // School row
  schoolAvatar: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  schoolInitials: { fontSize: 12, fontWeight: '700', color: C.secondary },

  // Sort row
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  sortLabel: {
    fontSize: 12,
    color: C.muted,
  },
  sortOption: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sortOptionActive: {
    backgroundColor: C.surface,
  },
  sortOptionText: {
    fontSize: 12,
    color: C.muted,
  },
  sortOptionTextActive: {
    color: C.label,
    fontWeight: '600',
  },

  // Result count
  resultCount: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultCountText: {
    fontSize: 13,
    color: C.secondary,
  },

  // Separator
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginLeft: 68 },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
