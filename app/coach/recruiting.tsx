/**
 * Coach Recruiting Screen — National Pool
 * Single "Filter" pill opens an iOS bottom sheet with accordion sections:
 * Division, Conference & Teams, Position, Sort By (clusters + sub-traits).
 * Uses draft-based filtering — changes commit only on "Apply Filters".
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { TabFooter } from '@/components/tab-footer';
import { Spacing, BorderRadius } from '@/constants/theme';
import { PLAYER_POOL, type PoolLevel, type PoolPlayer } from '@/data/playerPool';
import { getLatestSeason } from '@/data/playerSeasons';
import { getPlayerRatings } from '@/data/playerRatings';
import { HELIO_TO_TRADITIONAL, HELIO_POSITIONS, HELIO_POSITION_LABELS } from '@/data/position-mapping';
import { SORT_CLUSTER_LABELS, CLUSTER_ORDER, TRAIT_LIBRARY } from '@/data/trait-library';
import {
  FilterSheet,
  SectionHeader,
  RadioRow,
  CheckboxRow,
  ConferenceRow,
  DEFAULT_FILTERS,
  type NationalPoolFilters,
} from '@/components/recruiting/filter-sort-panel';
import type { ClusterType } from '@/types';

// ─── Constants ───
const SCREEN_HEIGHT = Dimensions.get('window').height;
const PEEK_SHEET_HEIGHT = Math.round(SCREEN_HEIGHT * 0.6);

const BG = '#0F1115';
const CARD_BG = '#1A1D23';
const WHITE = '#FFFFFF';
const GRAY = '#8A8F98';
const DIVIDER = '#2A2D35';

const HUB_TABS = [
  { id: 'home', label: 'Home' },
  { id: 'roster', label: 'Roster' },
  { id: 'games', label: 'Games', route: '/coach/games' },
  { id: 'injuries', label: 'Injuries', route: '/coach/injuries' },
  { id: 'program-context', label: 'Team System', route: '/coach/program-context' },
  { id: 'recruiting', label: 'Recruiting' },
  { id: 'film', label: 'Film', route: '/coach/film' },
];


// ─── Division hierarchy for filter panel ───
interface DivisionItem {
  label: string;
  value?: PoolLevel;
  children?: { value: PoolLevel; label: string }[];
}

const DIVISION_HIERARCHY: DivisionItem[] = [
  { label: 'NCAA', value: 'NCAA', children: [
    { value: 'NCAA D1', label: 'D1' },
    { value: 'NCAA D2', label: 'D2' },
    { value: 'NCAA D3', label: 'D3' },
  ]},
  { label: 'NAIA', value: 'NAIA' },
  { label: 'JUCO', value: 'JUCO', children: [
    { value: 'JUCO D1', label: 'D1' },
    { value: 'JUCO D2', label: 'D2' },
    { value: 'JUCO D3', label: 'D3' },
  ]},
  { label: 'USCAA', value: 'USCAA' },
  { label: 'NCCAA', value: 'NCCAA', children: [
    { value: 'NCCAA D1', label: 'D1' },
    { value: 'NCCAA D2', label: 'D2' },
  ]},
  { label: '3C2A', value: '3C2A' },
  { label: 'International', value: 'International' },
];

// Parent division values that match all sub-levels (e.g. 'JUCO' matches 'JUCO', 'JUCO D1', 'JUCO D2', 'JUCO D3')
const PARENT_DIVISIONS = new Set(
  DIVISION_HIERARCHY.filter((d) => d.children && d.value).map((d) => d.value!),
);

function matchesDivision(playerLevel: PoolLevel, filterDiv: PoolLevel): boolean {
  if (filterDiv === playerLevel) return true;
  if (PARENT_DIVISIONS.has(filterDiv)) return playerLevel.startsWith(filterDiv);
  return false;
}

// ─── Reusable core content (used in home PagerView AND standalone screen) ───
export function PlayerPoolContent() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // State
  const [filters, setFilters] = useState<NationalPoolFilters>({ ...DEFAULT_FILTERS });
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [draft, setDraft] = useState<NationalPoolFilters>({ ...DEFAULT_FILTERS });
  const [peekPlayer, setPeekPlayer] = useState<PoolPlayer | null>(null);

  // Accordion state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [expandedDivisionGroups, setExpandedDivisionGroups] = useState<Set<string>>(new Set());
  const [expandedConferences, setExpandedConferences] = useState<Set<string>>(new Set());
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(new Set());

  // Check if any filters active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.division !== null ||
      filters.conference !== null ||
      filters.teams.length > 0 ||
      filters.positions.length > 0 ||
      filters.sortCluster !== null
    );
  }, [filters]);

  // Filtering + sorting logic
  const filteredPlayers = useMemo(() => {
    let list = PLAYER_POOL;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.firstName.toLowerCase().includes(q) ||
          p.lastName.toLowerCase().includes(q) ||
          p.currentSchool.toLowerCase().includes(q)
      );
    }

    if (filters.division) {
      list = list.filter((p) => matchesDivision(p.level, filters.division!));
    }

    if (filters.conference) {
      list = list.filter((p) => p.conference === filters.conference);
    }

    if (filters.teams.length > 0) {
      list = list.filter((p) => filters.teams.includes(p.currentSchool));
    }

    if (filters.positions.length > 0) {
      const traditionalPositions = filters.positions.map((hp) => HELIO_TO_TRADITIONAL[hp]);
      list = list.filter((p) => traditionalPositions.includes(p.position));
    }

    // Sort by cluster KR or default Overall KR
    if (filters.sortCluster) {
      const cluster = filters.sortCluster;
      list = [...list].sort((a, b) => {
        const aR = getPlayerRatings(a.id);
        const bR = getPlayerRatings(b.id);
        const aVal = aR ? aR.clusters[cluster] : -1;
        const bVal = bR ? bR.clusters[cluster] : -1;
        return bVal - aVal;
      });
    } else {
      // Default: sort by Overall KR descending
      list = [...list].sort((a, b) => {
        const aR = getPlayerRatings(a.id);
        const bR = getPlayerRatings(b.id);
        const aVal = aR ? aR.overall : -1;
        const bVal = bR ? bR.overall : -1;
        return bVal - aVal;
      });
    }

    return list;
  }, [filters]);

  // Derive conferences + teams for the filter panel (based on draft.division)
  const draftConferences = useMemo(() => {
    let pool = PLAYER_POOL;
    if (draft.division) {
      pool = pool.filter((p) => matchesDivision(p.level, draft.division!));
    }
    const confMap = new Map<string, string[]>();
    pool.forEach((p) => {
      if (!confMap.has(p.conference)) confMap.set(p.conference, []);
      const teams = confMap.get(p.conference)!;
      if (!teams.includes(p.currentSchool)) teams.push(p.currentSchool);
    });
    return [...confMap.entries()]
      .map(([conf, teams]) => ({ conference: conf, teams: teams.sort() }))
      .sort((a, b) => a.conference.localeCompare(b.conference));
  }, [draft.division]);

  // Panel handlers
  const openPanel = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDraft({ ...filters });
    setExpandedSections({});
    setExpandedDivisionGroups(new Set());
    setExpandedConferences(new Set());
    setExpandedClusters(new Set());
    setFilterPanelOpen(true);
  }, [filters]);

  const closePanel = useCallback(() => {
    setFilterPanelOpen(false);
  }, []);

  const applyFilters = useCallback(() => {
    setFilters((prev) => ({ ...draft, search: prev.search }));
    setFilterPanelOpen(false);
  }, [draft]);

  const resetDraft = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDraft({ ...DEFAULT_FILTERS });
  }, []);

  const handleResetAll = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilters({ ...DEFAULT_FILTERS });
  }, []);

  const toggleSection = useCallback((key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const toggleDivisionGroup = useCallback((group: string) => {
    setExpandedDivisionGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group); else next.add(group);
      return next;
    });
  }, []);

  const toggleConference = useCallback((conf: string) => {
    setExpandedConferences((prev) => {
      const next = new Set(prev);
      if (next.has(conf)) next.delete(conf); else next.add(conf);
      return next;
    });
  }, []);

  const toggleCluster = useCallback((cluster: string) => {
    setExpandedClusters((prev) => {
      const next = new Set(prev);
      if (next.has(cluster)) next.delete(cluster); else next.add(cluster);
      return next;
    });
  }, []);

  const resultCount = filteredPlayers.length;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {/* ─── Hero Card ─── */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>NATIONAL POOL</Text>
          <Text style={styles.heroSubtitle}>
            Explore every player in the KaNeXT National Player Pool.
          </Text>

          {/* Search bar (pill) */}
          <View style={styles.heroSearchBar}>
            <TextInput
              style={styles.heroSearchInput}
              placeholder="Search Player"
              placeholderTextColor="#6B7080"
              value={filters.search}
              onChangeText={(text) => setFilters((prev) => ({ ...prev, search: text }))}
            />
            {filters.search.length > 0 ? (
              <Pressable onPress={() => setFilters((prev) => ({ ...prev, search: '' }))}>
                <IconSymbol name="xmark.circle.fill" size={18} color="#6B7080" />
              </Pressable>
            ) : (
              <IconSymbol name="magnifyingglass" size={18} color="#6B7080" />
            )}
          </View>

          {/* Filter pill */}
          <Pressable
            style={[styles.heroFilterPill, hasActiveFilters && styles.heroFilterPillActive]}
            onPress={openPanel}
          >
            <Text style={[styles.heroFilterText, hasActiveFilters && styles.heroFilterTextActive]}>
              FILTER
            </Text>
            <IconSymbol name="line.3.horizontal.decrease" size={14} color={hasActiveFilters ? BG : WHITE} />
            {hasActiveFilters && <View style={styles.filterDot} />}
          </Pressable>
        </View>

        {/* Meta row below hero */}
        <View style={styles.metaRow}>
          <Text style={styles.resultCountText}>
            {resultCount} players
          </Text>
          {hasActiveFilters && (
            <Pressable onPress={handleResetAll}>
              <Text style={styles.resetLink}>Reset all</Text>
            </Pressable>
          )}
          <View style={{ flex: 1 }} />
        </View>

        {/* Player list */}
        <View style={styles.ratingCardList}>
          <Text style={styles.ratingListHeader}>PLAYER</Text>
          {filteredPlayers.map((player) => (
            <PlayerRatingCard
              key={player.id}
              player={player}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setPeekPlayer(player);
              }}
            />
          ))}
          {filteredPlayers.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No players match your filters</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Quick Peek Sheet */}
      {peekPlayer && (
        <PlayerQuickPeek
          player={peekPlayer}
          onClose={() => setPeekPlayer(null)}
        />
      )}

      {/* ─── Filter Panel ─── */}
      <FilterSheet
        visible={filterPanelOpen}
        onClose={closePanel}
        title="Filters"
        footer={
          <>
            <Pressable style={styles.footerResetBtn} onPress={resetDraft}>
              <Text style={styles.footerResetText}>Reset Filters</Text>
            </Pressable>
            <Pressable style={styles.footerApplyBtn} onPress={applyFilters}>
              <Text style={styles.footerApplyText}>Apply Filters</Text>
            </Pressable>
          </>
        }
      >
        {/* Division */}
        <SectionHeader
          label="Division"
          expanded={!!expandedSections.division}
          onToggle={() => toggleSection('division')}
          summary={draft.division ?? 'All'}
        />
        {expandedSections.division && (
          <View>
            <View style={styles.pillGrid}>
              {/* All pill */}
              <Pressable
                style={[styles.divPill, draft.division === null && styles.divPillSelected]}
                onPress={() => {
                  setDraft((prev) => ({ ...prev, division: null, conference: null, teams: [] }));
                  setExpandedDivisionGroups(new Set());
                }}
              >
                <Text style={[styles.divPillText, draft.division === null && styles.divPillTextSelected]}>All</Text>
              </Pressable>

              {DIVISION_HIERARCHY.map((item) =>
                item.children ? (
                  <Pressable
                    key={item.label}
                    style={[
                      styles.divPill,
                      (draft.division === item.value || item.children.some((c) => c.value === draft.division)) && styles.divPillSelected,
                      expandedDivisionGroups.has(item.label) && draft.division !== item.value && !item.children.some((c) => c.value === draft.division) && styles.divPillOpen,
                    ]}
                    onPress={() => {
                      // Select parent division directly; expand sub-options for optional narrowing
                      setDraft((prev) => ({ ...prev, division: item.value!, conference: null, teams: [] }));
                      setExpandedDivisionGroups(new Set([item.label]));
                    }}
                  >
                    <Text style={[
                      styles.divPillText,
                      (draft.division === item.value || item.children.some((c) => c.value === draft.division) || expandedDivisionGroups.has(item.label)) && styles.divPillTextSelected,
                    ]}>
                      {item.children.find((c) => c.value === draft.division)?.value ?? item.label}
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable
                    key={item.value}
                    style={[styles.divPill, draft.division === item.value && styles.divPillSelected]}
                    onPress={() => setDraft((prev) => ({ ...prev, division: item.value!, conference: null, teams: [] }))}
                  >
                    <Text style={[styles.divPillText, draft.division === item.value && styles.divPillTextSelected]}>{item.label}</Text>
                  </Pressable>
                )
              )}
            </View>

            {/* Inline sub-options for expanded group */}
            {DIVISION_HIERARCHY.map((item) =>
              item.children && expandedDivisionGroups.has(item.label) ? (
                <View key={`${item.label}-sub`} style={styles.pillSubGrid}>
                  {/* "All" sub-pill to select the parent division */}
                  <Pressable
                    style={[styles.divSubPill, draft.division === item.value && styles.divSubPillSelected]}
                    onPress={() => {
                      setDraft((prev) => ({ ...prev, division: item.value!, conference: null, teams: [] }));
                    }}
                  >
                    <Text style={[styles.divSubPillText, draft.division === item.value && styles.divSubPillTextSelected]}>
                      All
                    </Text>
                  </Pressable>
                  {item.children.map((child) => (
                    <Pressable
                      key={child.value}
                      style={[styles.divSubPill, draft.division === child.value && styles.divSubPillSelected]}
                      onPress={() => {
                        setDraft((prev) => ({ ...prev, division: child.value, conference: null, teams: [] }));
                      }}
                    >
                      <Text style={[styles.divSubPillText, draft.division === child.value && styles.divSubPillTextSelected]}>
                        {child.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : null
            )}
          </View>
        )}

        {/* Conference */}
        <SectionHeader
          label="Conference"
          expanded={!!expandedSections.conference}
          onToggle={() => toggleSection('conference')}
          summary={draft.conference ?? 'All'}
        />
        {expandedSections.conference && (
          <View>
            <RadioRow
              label="All"
              selected={draft.conference === null}
              onPress={() => setDraft((prev) => ({ ...prev, conference: null }))}
              indent
            />
            {draftConferences.map(({ conference }) => (
              <RadioRow
                key={conference}
                label={conference}
                selected={draft.conference === conference}
                onPress={() => setDraft((prev) => ({ ...prev, conference }))}
                indent
              />
            ))}
          </View>
        )}

        {/* Position */}
        <SectionHeader
          label="Position"
          expanded={!!expandedSections.position}
          onToggle={() => toggleSection('position')}
        />
        {expandedSections.position && (
          <View>
            {HELIO_POSITIONS.map((pos) => (
              <CheckboxRow
                key={pos}
                label={`${pos} — ${HELIO_POSITION_LABELS[pos]}`}
                checked={draft.positions.includes(pos)}
                indent
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setDraft((prev) => {
                    const next = prev.positions.includes(pos)
                      ? prev.positions.filter((p) => p !== pos)
                      : [...prev.positions, pos];
                    return { ...prev, positions: next };
                  });
                }}
              />
            ))}
            <Text style={[styles.sheetHelper, { marginTop: 6, paddingLeft: 16 }]}>
              None selected = all positions
            </Text>
          </View>
        )}

        {/* Sort By */}
        <SectionHeader
          label="Sort By"
          expanded={!!expandedSections.sort}
          onToggle={() => toggleSection('sort')}
        />
        {expandedSections.sort && (
          <View>
            <RadioRow
              label="Overall (KR)"
              selected={draft.sortCluster === null}
              onPress={() => setDraft((prev) => ({ ...prev, sortCluster: null, sortSubTrait: null }))}
              indent
            />
            {CLUSTER_ORDER.map((cluster) => (
              <View key={cluster}>
                <RadioRow
                  label={SORT_CLUSTER_LABELS[cluster]}
                  selected={draft.sortCluster === cluster && !draft.sortSubTrait}
                  hasChevron
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setDraft((prev) => ({ ...prev, sortCluster: cluster, sortSubTrait: null }));
                    toggleCluster(cluster);
                  }}
                  indent
                />
                {expandedClusters.has(cluster) && (
                  <View>
                    {(TRAIT_LIBRARY[cluster] ?? []).map((sub) => (
                      <RadioRow
                        key={sub.id}
                        label={sub.label}
                        selected={draft.sortCluster === cluster && draft.sortSubTrait === sub.id}
                        onPress={() => {
                          setDraft((prev) => ({
                            ...prev,
                            sortCluster: cluster,
                            sortSubTrait: sub.id,
                          }));
                        }}
                        indent
                      />
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </FilterSheet>
    </View>
  );
}

// ─── Standalone Screen ───
export default function CoachRecruitingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: BG }]}>
      {/* Hub Tabs */}
      <View style={[styles.hubTabsContainer, { paddingTop: insets.top, borderBottomColor: DIVIDER }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hubTabsContent}>
          {HUB_TABS.map((tab) => {
            const isActive = tab.id === 'recruiting';
            return (
              <Pressable
                key={tab.id}
                style={[styles.hubTab, isActive && [styles.hubTabActive, { borderBottomColor: WHITE }]]}
                onPress={() => {
                  if (tab.id === 'recruiting') return;
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (tab.id === 'home' || tab.id === 'roster') {
                    router.navigate({ pathname: '/(tabs)/index', params: { hubTab: '2' } } as any);
                  } else if (tab.route) {
                    router.replace(tab.route as any);
                  }
                }}
              >
                <ThemedText style={[styles.hubTabLabel, { color: isActive ? WHITE : GRAY }, isActive && styles.hubTabLabelActive]}>
                  {tab.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <PlayerPoolContent />
      <TabFooter activeTab="Home" />
    </View>
  );
}

// ─── Cluster abbreviations for rating boxes ───
const CLUSTER_ABBREVS: { key: string; abbrev: string; full: string }[] = [
  { key: 'shooting', abbrev: 'SHT', full: 'Shooting' },
  { key: 'finishing', abbrev: 'FIN', full: 'Finishing' },
  { key: 'playmaking', abbrev: 'PLY', full: 'Playmaking' },
  { key: 'perimeter_defense', abbrev: 'PER', full: 'Perimeter Defense' },
  { key: 'interior_defense', abbrev: 'INT', full: 'Interior Defense' },
  { key: 'rebounding', abbrev: 'REB', full: 'Rebounding' },
  { key: 'frame', abbrev: 'PHY', full: 'Physical' },
];

// ─── EA-Style Player Rating Card ───
function PlayerRatingCard({
  player,
  onPress,
}: {
  player: PoolPlayer;
  onPress: () => void;
}) {
  const ratings = useMemo(() => getPlayerRatings(player.id), [player.id]);
  const [tooltip, setTooltip] = useState<string | null>(null);

  const showTooltip = useCallback((full: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTooltip(full);
    setTimeout(() => setTooltip(null), 1500);
  }, []);

  return (
    <Pressable style={styles.ratingCard} onPress={onPress}>
      {/* Top row: avatar, name, badges */}
      <View style={styles.ratingCardTop}>
        <View style={styles.ratingAvatar}>
          <IconSymbol name="person.fill" size={22} color={GRAY} />
        </View>
        <Text style={styles.ratingName} numberOfLines={1}>
          {player.firstName} {player.lastName}
        </Text>
        <View style={styles.ratingBadges}>
          <View style={styles.ratingLevelBadge}>
            <Text style={styles.ratingLevelText}>{player.level}</Text>
          </View>
          <View style={styles.ratingPosBadge}>
            <Text style={styles.ratingPosText}>{player.position}</Text>
          </View>
        </View>
      </View>

      {/* Tooltip */}
      {tooltip && (
        <View style={styles.tooltipBubble}>
          <Text style={styles.tooltipText}>{tooltip}</Text>
        </View>
      )}

      {/* Rating boxes row */}
      <View style={styles.ratingBoxRow}>
        {/* OVR box (highlighted) */}
        <Pressable
          style={styles.ratingBoxOvr}
          onLongPress={() => showTooltip('Overall KR')}
          onPress={() => {}}
        >
          <Text style={styles.ratingBoxLabel}>OVR</Text>
          <Text style={styles.ratingBoxValueOvr}>
            {ratings ? ratings.overall : '—'}
          </Text>
        </Pressable>
        {/* 7 cluster boxes */}
        {CLUSTER_ABBREVS.map((c) => {
          const val = ratings ? ratings.clusters[c.key as ClusterType] : null;
          return (
            <Pressable
              key={c.key}
              style={styles.ratingBox}
              onLongPress={() => showTooltip(c.full)}
              onPress={() => {}}
            >
              <Text style={styles.ratingBoxLabel}>{c.abbrev}</Text>
              <Text style={styles.ratingBoxValue}>{val ?? '—'}</Text>
            </Pressable>
          );
        })}
      </View>
    </Pressable>
  );
}

// ─── Player Quick Peek ───
function PlayerQuickPeek({
  player,
  onClose,
}: {
  player: PoolPlayer;
  onClose: () => void;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(PEEK_SHEET_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const season = useMemo(() => getLatestSeason(player.id), [player.id]);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, damping: 20, stiffness: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [slideAnim, fadeAnim]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: PEEK_SHEET_HEIGHT, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.scrim, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} />
      </Animated.View>

      <Animated.View
        style={[
          styles.peekSheet,
          { height: PEEK_SHEET_HEIGHT, paddingBottom: insets.bottom + Spacing.md, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.peekContent}>
          <Text style={styles.peekName}>{player.firstName} {player.lastName}</Text>
          <Text style={styles.peekMeta}>{player.position} · Class {player.classYear} · {player.currentSchool}</Text>
          <Text style={styles.peekLevel}>
            {player.level}{player.conference !== player.level ? ` · ${player.conference}` : ''} · {player.state}
          </Text>

          <View style={styles.peekStatHero}>
            <Text style={styles.peekStatHeroText}>{player.keyStatLine}</Text>
          </View>

          {season && (
            <View style={styles.peekSeasonCard}>
              <Text style={styles.peekSeasonTitle}>{season.season} Stats</Text>
              <View style={styles.peekStatsRow}>
                <View style={styles.peekStatItem}>
                  <Text style={styles.peekStatValue}>{season.ppg}</Text>
                  <Text style={styles.peekStatLabel}>PPG</Text>
                </View>
                <View style={styles.peekStatItem}>
                  <Text style={styles.peekStatValue}>{season.rpg}</Text>
                  <Text style={styles.peekStatLabel}>RPG</Text>
                </View>
                <View style={styles.peekStatItem}>
                  <Text style={styles.peekStatValue}>{season.apg}</Text>
                  <Text style={styles.peekStatLabel}>APG</Text>
                </View>
                <View style={styles.peekStatItem}>
                  <Text style={styles.peekStatValue}>{season.fgPct}%</Text>
                  <Text style={styles.peekStatLabel}>FG%</Text>
                </View>
                {season.threePct > 0 && (
                  <View style={styles.peekStatItem}>
                    <Text style={styles.peekStatValue}>{season.threePct}%</Text>
                    <Text style={styles.peekStatLabel}>3P%</Text>
                  </View>
                )}
              </View>
              <Text style={styles.peekSeasonMeta}>{season.gp} GP · {season.mpg} MPG · {season.school}</Text>
            </View>
          )}

          <View style={styles.peekActions}>
            <Pressable
              style={styles.peekActionPrimary}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                dismiss();
                router.push({ pathname: '/coach/player-detail', params: { id: player.id } });
              }}
            >
              <Text style={styles.peekActionPrimaryText}>Full Profile</Text>
            </Pressable>
            <Pressable
              style={styles.peekActionSecondary}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text style={styles.peekActionSecondaryText}>Ask Nexus</Text>
            </Pressable>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

// ─── Styles ───
const styles = StyleSheet.create({
  container: { flex: 1 },

  hubTabsContainer: { borderBottomWidth: StyleSheet.hairlineWidth, backgroundColor: BG },
  hubTabsContent: { paddingHorizontal: Spacing.lg, gap: Spacing.lg },
  hubTab: { paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  hubTabActive: { borderBottomWidth: 2 },
  hubTabLabel: { fontSize: 14, fontWeight: '500' },
  hubTabLabelActive: { fontWeight: '600' },

  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md },

  // Hero card
  heroCard: {
    backgroundColor: '#000000',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 22,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1A1D23',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: WHITE,
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#B0B4BC',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  heroSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1D23',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 44,
    width: '100%',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#2A2D35',
  },
  heroSearchInput: {
    flex: 1,
    fontSize: 15,
    color: WHITE,
    paddingVertical: 0,
  },
  heroFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#4A4D55',
  },
  heroFilterPillActive: {
    backgroundColor: WHITE,
    borderColor: WHITE,
  },
  heroFilterText: {
    fontSize: 13,
    fontWeight: '700',
    color: WHITE,
    letterSpacing: 1.2,
  },
  heroFilterTextActive: {
    color: BG,
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginLeft: 2,
  },

  // Meta row
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: Spacing.sm,
  },
  resultCountText: { fontSize: 13, fontWeight: '500', color: GRAY },
  resetLink: { fontSize: 12, fontWeight: '500', color: WHITE, textDecorationLine: 'underline' },

  // Rating card list
  ratingCardList: {
    gap: 0,
  },
  ratingListHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4CAF50',
    letterSpacing: 1,
    marginBottom: 10,
  },
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
    backgroundColor: '#2A2D35',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  ratingName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: WHITE,
  },
  ratingBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingLevelBadge: {
    backgroundColor: '#2A2D35',
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
    backgroundColor: '#3A3D45',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingPosText: {
    fontSize: 10,
    fontWeight: '700',
    color: WHITE,
  },
  ratingBoxRow: {
    flexDirection: 'row',
    gap: 4,
  },
  ratingBoxOvr: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2D35',
    borderRadius: 8,
    paddingVertical: 6,
    minWidth: 42,
    borderWidth: 1,
    borderColor: '#4A4D55',
  },
  ratingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  ratingBoxLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: GRAY,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  ratingBoxValueOvr: {
    fontSize: 18,
    fontWeight: '800',
    color: WHITE,
  },
  ratingBoxValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7080',
  },
  tooltipBubble: {
    position: 'absolute',
    top: 42,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  tooltipText: {
    backgroundColor: '#000000',
    color: WHITE,
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    overflow: 'hidden',
  },

  // Division group rows
  // Division pill grid
  pillGrid: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8, paddingVertical: 10, paddingHorizontal: 4 },
  divPill: { backgroundColor: '#2A2D35', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
  divPillSelected: { backgroundColor: WHITE },
  divPillOpen: { backgroundColor: '#3A3D45' },
  divPillText: { fontSize: 13, fontWeight: '600' as const, color: GRAY },
  divPillTextSelected: { color: BG },
  pillSubGrid: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8, paddingHorizontal: 4, paddingBottom: 10 },
  divSubPill: { backgroundColor: '#2A2D35', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 14, borderWidth: 1, borderColor: '#3A3D45' },
  divSubPillSelected: { backgroundColor: WHITE, borderColor: WHITE },
  divSubPillText: { fontSize: 12, fontWeight: '600' as const, color: GRAY },
  divSubPillTextSelected: { color: BG },

  // Panel helper
  sheetHelper: { fontSize: 12, color: GRAY, marginBottom: Spacing.sm },

  // Footer buttons
  footerResetBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#4A4D55', alignItems: 'center' as const },
  footerResetText: { fontSize: 14, fontWeight: '600' as const, color: GRAY },
  footerApplyBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: WHITE, alignItems: 'center' as const },
  footerApplyText: { fontSize: 14, fontWeight: '600' as const, color: BG },

  // Quick Peek
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  peekSheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: CARD_BG, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, paddingHorizontal: Spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 10 },
  handleContainer: { alignItems: 'center', paddingVertical: Spacing.sm },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: DIVIDER },
  peekContent: { flex: 1 },
  peekName: { fontSize: 22, fontWeight: '700', color: WHITE, marginBottom: 2 },
  peekMeta: { fontSize: 14, color: GRAY, marginBottom: 2 },
  peekLevel: { fontSize: 13, color: GRAY, marginBottom: 12 },
  peekStatHero: { backgroundColor: BG, borderRadius: BorderRadius.lg, paddingVertical: 14, paddingHorizontal: Spacing.md, alignItems: 'center', marginBottom: 14 },
  peekStatHeroText: { fontSize: 20, fontWeight: '700', color: WHITE },
  peekSeasonCard: { backgroundColor: BG, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: 16 },
  peekSeasonTitle: { fontSize: 12, fontWeight: '700', color: GRAY, letterSpacing: 0.5, marginBottom: 10 },
  peekStatsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  peekStatItem: { alignItems: 'center' },
  peekStatValue: { fontSize: 18, fontWeight: '700', color: WHITE },
  peekStatLabel: { fontSize: 10, fontWeight: '600', color: GRAY, marginTop: 2 },
  peekSeasonMeta: { fontSize: 12, color: GRAY, textAlign: 'center' },
  peekActions: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  peekActionPrimary: { flex: 1, backgroundColor: WHITE, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  peekActionPrimaryText: { fontSize: 15, fontWeight: '600', color: BG },
  peekActionSecondary: { flex: 1, backgroundColor: DIVIDER, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  peekActionSecondaryText: { fontSize: 15, fontWeight: '600', color: WHITE },

  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: GRAY },
});
