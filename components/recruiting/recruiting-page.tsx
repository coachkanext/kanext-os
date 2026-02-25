/**
 * Recruiting Page — Database sub-tab
 *
 * Route: SportsHome → Recruiting tab (PagerView page)
 *
 * Team-centric player browsing: Level → Conference → Team → Roster.
 * NIL/Scholarship constraints visible at program level only.
 * All intelligence via KR lens pills.
 *
 * RBAC: Assistant Coach / Recruiting Coordinator. Read-only.
 * Player Sheet opens on tap.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  TextInput,
  FlatList,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { nationalPool, toGlobalPlayerCard, type NationalPlayer } from '@/data/national-pool';
import { NIL_BUDGET, TOTAL_SCHOLARSHIPS, ROSTER_MAX } from '@/data/team-needs';
import { openPlayerCard, openTeamCard } from '@/utils/global-entity-sheets';
import { getKRColor, LEVEL_DISPLAY_SHORT, CLUSTER_LABELS } from '@/utils/kr-display';

// =============================================================================
// TYPES & CONSTANTS
// =============================================================================

type SubTab = 'database' | 'portal' | 'board';

type LensKey =
  | 'overall' | 'shooting' | 'finishing' | 'playmaking'
  | 'onBallD' | 'teamD' | 'rebounding' | 'frame';

const LENS_OPTIONS: { key: LensKey; label: string }[] = [
  { key: 'overall', label: 'Overall' },
  { key: 'shooting', label: 'Shooting' },
  { key: 'finishing', label: 'Finishing' },
  { key: 'playmaking', label: 'Playmaking' },
  { key: 'onBallD', label: 'On-Ball D' },
  { key: 'teamD', label: 'Team D' },
  { key: 'rebounding', label: 'Rebounding' },
  { key: 'frame', label: 'Frame' },
];

/** Map lens key to cluster key in NationalPlayer.clusters */
function getLensScore(p: NationalPlayer, lens: LensKey): number | null {
  switch (lens) {
    case 'overall': return p.kr;
    case 'shooting': return p.clusters?.shooting ?? null;
    case 'finishing': return p.clusters?.finishing ?? null;
    case 'playmaking': return p.clusters?.playmaking ?? null;
    case 'onBallD': return p.clusters?.on_ball_defense ?? null;
    case 'teamD': return p.clusters?.team_defense ?? null;
    case 'rebounding': return p.clusters?.rebounding ?? null;
    case 'frame': return p.clusters?.physical ?? null;
  }
}

const LEVEL_OPTIONS: { key: string; label: string }[] = [
  { key: 'ncaa_d1', label: 'NCAA D1' },
  { key: 'ncaa_d2', label: 'NCAA D2' },
  { key: 'ncaa_d3', label: 'NCAA D3' },
  { key: 'naia', label: 'NAIA' },
  { key: 'njcaa_d1', label: 'JUCO D1' },
  { key: 'njcaa_d2', label: 'JUCO D2' },
  { key: 'njcaa_d3', label: 'JUCO D3' },
  { key: 'cccaa', label: 'CCCAA' },
  { key: 'uscaa', label: 'USCAA' },
];

// Exported data uses flat level keys (ncaa_d1, not sub-levels)
function expandLevel(key: string): string[] {
  return [key];
}

type PickerTarget = 'level' | 'conference' | 'team' | null;

// =============================================================================
// COMPONENT
// =============================================================================

interface Props {
  colors: typeof Colors.light;
}

export function RecruitingPage({ colors }: Props) {
  const insets = useSafeAreaInsets();
  const accent = useAccentColor();

  // Sub-tab state
  const [activeTab, setActiveTab] = useState<SubTab>('database');

  // Filter state
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedConference, setSelectedConference] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [activePicker, setActivePicker] = useState<PickerTarget>(null);

  // Lens state
  const [lens, setLens] = useState<LensKey>('overall');

  // ── Derived: all players at selected level ──
  const allPlayers = useMemo(() => nationalPool.getAll(), []);

  const expandedLevels = useMemo(
    () => selectedLevel ? expandLevel(selectedLevel) : null,
    [selectedLevel],
  );

  const playersAtLevel = useMemo(() => {
    if (!expandedLevels) return allPlayers;
    return allPlayers.filter(p => expandedLevels.includes(p.levelKey));
  }, [allPlayers, expandedLevels]);

  // ── Derived: conferences at level ──
  const conferences = useMemo(() => {
    const set = new Set<string>();
    for (const p of playersAtLevel) {
      if (p.conference) set.add(p.conference);
    }
    return Array.from(set).sort();
  }, [playersAtLevel]);

  // ── Derived: teams at level + conference ──
  const teams = useMemo(() => {
    let pool = playersAtLevel;
    if (selectedConference) {
      pool = pool.filter(p => p.conference === selectedConference);
    }
    const set = new Set<string>();
    for (const p of pool) {
      if (p.school) set.add(p.school);
    }
    return Array.from(set).sort();
  }, [playersAtLevel, selectedConference]);

  // ── Derived: team roster ──
  const teamRoster = useMemo(() => {
    if (!selectedTeam) return [];
    const roster = nationalPool.getTeamRoster(selectedTeam);
    // Sort by active lens score descending
    return [...roster].sort((a, b) => {
      const sa = getLensScore(a, lens) ?? -1;
      const sb = getLensScore(b, lens) ?? -1;
      return sb - sa;
    });
  }, [selectedTeam, lens]);

  // ── Derived: search results ──
  const searchResults = useMemo(() => {
    if (!search || search.length < 2) return null;
    return nationalPool.search({ query: search, limit: 50, sortBy: 'kr', sortDir: 'desc' });
  }, [search]);

  // ── Derived: team system ──
  const teamSystem = useMemo(
    () => selectedTeam ? nationalPool.getTeamSystem(selectedTeam) : undefined,
    [selectedTeam],
  );

  // ── Handlers ──
  const handleLevelSelect = useCallback((key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedLevel(key);
    setSelectedConference(null);
    setSelectedTeam(null);
    setActivePicker(null);
  }, []);

  const handleConferenceSelect = useCallback((conf: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedConference(conf);
    setSelectedTeam(null);
    setActivePicker(null);
  }, []);

  const handleTeamSelect = useCallback((team: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTeam(team);
    setActivePicker(null);
  }, []);

  const handlePlayerTap = useCallback((player: NationalPlayer) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    openPlayerCard(toGlobalPlayerCard(player));
  }, []);

  const handleTeamSheetTap = useCallback(() => {
    if (!selectedTeam) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const sys = nationalPool.getTeamSystem(selectedTeam);
    const roster = nationalPool.getTeamRoster(selectedTeam);
    const first = roster[0];
    openTeamCard({
      name: selectedTeam,
      conference: first?.conference,
      level: first?.levelDisplay,
      teamKR: sys ? Math.round(((sys.offSystemScore ?? 0) + (sys.defSystemScore ?? 0)) / 2) || undefined : undefined,
      osie: sys?.offSystem ?? undefined,
      osieScore: sys?.offSystemScore ?? undefined,
      dsie: sys?.defSystem ?? undefined,
      dsieScore: sys?.defSystemScore ?? undefined,
    });
  }, [selectedTeam]);

  const clearFilters = useCallback(() => {
    setSelectedLevel(null);
    setSelectedConference(null);
    setSelectedTeam(null);
    setSearch('');
    setActivePicker(null);
  }, []);

  const togglePicker = useCallback((target: PickerTarget) => {
    setActivePicker(prev => prev === target ? null : target);
  }, []);

  // ── Render helpers ──
  const isSearchMode = searchResults !== null;
  const displayPlayers = isSearchMode ? searchResults : teamRoster;
  const levelLabel = selectedLevel
    ? LEVEL_OPTIONS.find(l => l.key === selectedLevel)?.label ?? selectedLevel
    : 'Level';

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        {/* Sub-tab pills */}
        <View style={styles.subTabRow}>
          {(['database', 'portal', 'board'] as SubTab[]).map(tab => {
            const isActive = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveTab(tab);
                }}
                style={[
                  styles.subTabPill,
                  { backgroundColor: isActive ? accent : colors.card, borderColor: isActive ? accent : colors.border },
                ]}
              >
                <Text style={[styles.subTabLabel, { color: isActive ? '#fff' : colors.textSecondary }]}>
                  {tab === 'database' ? 'Database' : tab === 'portal' ? 'Portal' : 'Board'}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* ── Portal / Board placeholders ── */}
      {activeTab !== 'database' && (
        <View style={styles.comingSoon}>
          <Text style={[styles.comingSoonTitle, { color: colors.text }]}>Coming Soon</Text>
          <Text style={[styles.comingSoonSub, { color: colors.textSecondary }]}>
            {activeTab === 'portal' ? 'Transfer Portal tracking' : 'Recruiting Board'} is under development.
          </Text>
        </View>
      )}

      {/* ── Database Tab ── */}
      {activeTab === 'database' && (
        <FlatList
          data={displayPlayers}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <>
              {/* Search bar */}
              <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <IconSymbol name="magnifyingglass" size={16} color={colors.textSecondary} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Search player / team"
                  placeholderTextColor={colors.textTertiary}
                  value={search}
                  onChangeText={setSearch}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                {search.length > 0 && (
                  <Pressable onPress={() => setSearch('')} hitSlop={8}>
                    <IconSymbol name="xmark.circle.fill" size={18} color={colors.textTertiary} />
                  </Pressable>
                )}
              </View>

              {/* Filter row — 3 cascading pills */}
              {!isSearchMode && (
                <View style={styles.filterSection}>
                  <View style={styles.filterRow}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always" contentContainerStyle={styles.filterScrollContent}>
                      {/* Level */}
                      <Pressable
                        onPress={() => togglePicker('level')}
                        style={[
                          styles.filterPill,
                          {
                            backgroundColor: selectedLevel ? accent + '20' : colors.card,
                            borderColor: selectedLevel ? accent : colors.border,
                          },
                        ]}
                      >
                        <Text style={[styles.filterPillText, { color: selectedLevel ? accent : colors.textSecondary }]}>
                          {levelLabel}
                        </Text>
                        <IconSymbol name="chevron.down" size={10} color={selectedLevel ? accent : colors.textTertiary} />
                      </Pressable>

                      {/* Conference */}
                      <Pressable
                        onPress={() => { if (selectedLevel) togglePicker('conference'); }}
                        style={[
                          styles.filterPill,
                          {
                            backgroundColor: selectedConference ? accent + '20' : colors.card,
                            borderColor: selectedConference ? accent : colors.border,
                            opacity: selectedLevel ? 1 : 0.4,
                          },
                        ]}
                      >
                        <Text
                          style={[styles.filterPillText, { color: selectedConference ? accent : colors.textSecondary }]}
                          numberOfLines={1}
                        >
                          {selectedConference ?? 'Conference'}
                        </Text>
                        <IconSymbol name="chevron.down" size={10} color={selectedConference ? accent : colors.textTertiary} />
                      </Pressable>

                      {/* Team */}
                      <Pressable
                        onPress={() => { if (selectedLevel) togglePicker('team'); }}
                        style={[
                          styles.filterPill,
                          {
                            backgroundColor: selectedTeam ? accent + '20' : colors.card,
                            borderColor: selectedTeam ? accent : colors.border,
                            opacity: selectedLevel ? 1 : 0.4,
                          },
                        ]}
                      >
                        <Text
                          style={[styles.filterPillText, { color: selectedTeam ? accent : colors.textSecondary }]}
                          numberOfLines={1}
                        >
                          {selectedTeam ?? 'Team'}
                        </Text>
                        <IconSymbol name="chevron.down" size={10} color={selectedTeam ? accent : colors.textTertiary} />
                      </Pressable>
                    </ScrollView>

                    {/* Clear — outside ScrollView so touch always works */}
                    {(selectedLevel || selectedConference || selectedTeam) && (
                      <Pressable onPress={clearFilters} hitSlop={8} style={[styles.filterPill, { borderColor: colors.border, backgroundColor: colors.card, marginLeft: 8 }]}>
                        <Text style={[styles.filterPillText, { color: '#EF4444' }]}>Clear</Text>
                      </Pressable>
                    )}
                  </View>

                  {/* Inline picker dropdown */}
                  {activePicker === 'level' && (
                    <PickerDropdown
                      items={LEVEL_OPTIONS.map(l => ({ key: l.key, label: l.label }))}
                      selected={selectedLevel}
                      onSelect={handleLevelSelect}
                      colors={colors}
                      accent={accent}
                    />
                  )}
                  {activePicker === 'conference' && (
                    <PickerDropdown
                      items={conferences.map(c => ({ key: c, label: c }))}
                      selected={selectedConference}
                      onSelect={handleConferenceSelect}
                      colors={colors}
                      accent={accent}
                    />
                  )}
                  {activePicker === 'team' && (
                    <PickerDropdown
                      items={teams.map(t => ({ key: t, label: t }))}
                      selected={selectedTeam}
                      onSelect={handleTeamSelect}
                      colors={colors}
                      accent={accent}
                    />
                  )}
                </View>
              )}

              {/* Recruiting Constraints */}
              <View style={[styles.constraintsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.constraintsRow}>
                  <View style={styles.constraintCol}>
                    <Text style={[styles.constraintLabel, { color: colors.textSecondary }]}>NIL Budget</Text>
                    <Text style={[styles.constraintValue, { color: colors.text }]}>
                      ${NIL_BUDGET.toLocaleString()}
                    </Text>
                  </View>
                  <View style={[styles.constraintDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.constraintCol}>
                    <Text style={[styles.constraintLabel, { color: colors.textSecondary }]}>Scholarships</Text>
                    <Text style={[styles.constraintValue, { color: colors.text }]}>
                      {TOTAL_SCHOLARSHIPS} / {ROSTER_MAX}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Team Header (when team selected) */}
              {selectedTeam && !isSearchMode && (
                <View style={[styles.teamHeader, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.teamHeaderTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.teamName, { color: colors.text }]}>{selectedTeam}</Text>
                      <View style={styles.teamMeta}>
                        <View style={[styles.levelBadge, { backgroundColor: accent + '20' }]}>
                          <Text style={[styles.levelBadgeText, { color: accent }]}>{levelLabel}</Text>
                        </View>
                        {teamRoster[0]?.conference && (
                          <Text style={[styles.teamConf, { color: colors.textSecondary }]}>
                            {teamRoster[0].conference}
                          </Text>
                        )}
                      </View>
                    </View>
                    {teamSystem && (teamSystem.offSystemScore || teamSystem.defSystemScore) && (
                      <View style={styles.teamKRBadge}>
                        <Text style={[styles.teamKRLabel, { color: colors.textSecondary }]}>Team KR</Text>
                        <Text style={[styles.teamKRValue, { color: getKRColor(Math.round(((teamSystem.offSystemScore ?? 0) + (teamSystem.defSystemScore ?? 0)) / 2)) }]}>
                          {Math.round(((teamSystem.offSystemScore ?? 0) + (teamSystem.defSystemScore ?? 0)) / 2)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Pressable
                    onPress={handleTeamSheetTap}
                    style={[styles.teamSheetChip, { backgroundColor: accent + '15', borderColor: accent + '40' }]}
                  >
                    <Text style={[styles.teamSheetChipText, { color: accent }]}>Open Team Sheet</Text>
                    <IconSymbol name="chevron.right" size={11} color={accent} />
                  </Pressable>
                </View>
              )}

              {/* Lens toggle */}
              {(selectedTeam || isSearchMode) && displayPlayers.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.lensRow}
                >
                  {LENS_OPTIONS.map(opt => {
                    const isActive = lens === opt.key;
                    return (
                      <Pressable
                        key={opt.key}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setLens(opt.key);
                        }}
                        style={[
                          styles.lensPill,
                          {
                            backgroundColor: isActive ? accent : colors.card,
                            borderColor: isActive ? accent : colors.border,
                          },
                        ]}
                      >
                        <Text style={[styles.lensPillText, { color: isActive ? '#fff' : colors.textSecondary }]}>
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}

              {/* Section header for search results */}
              {isSearchMode && (
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionHeaderText, { color: colors.textSecondary }]}>
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  </Text>
                  <Pressable onPress={() => setSearch('')} hitSlop={8}>
                    <Text style={{ fontSize: 13, color: accent }}>Clear</Text>
                  </Pressable>
                </View>
              )}

              {/* Roster count when team selected */}
              {selectedTeam && !isSearchMode && teamRoster.length > 0 && (
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionHeaderText, { color: colors.textSecondary }]}>
                    Roster ({teamRoster.length})
                  </Text>
                </View>
              )}

              {/* Empty states */}
              {!isSearchMode && !selectedTeam && (
                <View style={styles.emptyState}>
                  <IconSymbol name="line.3.horizontal.decrease.circle" size={32} color={colors.textTertiary} />
                  <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                    Select Level → Conference → Team to view roster.
                  </Text>
                </View>
              )}
              {isSearchMode && searchResults.length === 0 && (
                <View style={styles.emptyState}>
                  <IconSymbol name="magnifyingglass" size={32} color={colors.textTertiary} />
                  <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                    No matches found.
                  </Text>
                  <Pressable onPress={() => setSearch('')} style={[styles.clearBtn, { borderColor: colors.border }]}>
                    <Text style={{ fontSize: 13, color: accent }}>Clear Search</Text>
                  </Pressable>
                </View>
              )}
              {selectedTeam && !isSearchMode && teamRoster.length === 0 && (
                <View style={styles.emptyState}>
                  <IconSymbol name="person.2.slash" size={32} color={colors.textTertiary} />
                  <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                    No player data available for this team.
                  </Text>
                </View>
              )}
            </>
          }
          renderItem={({ item }) => (
            <PlayerRow
              player={item}
              lens={lens}
              colors={colors}
              onPress={() => handlePlayerTap(item)}
              showSchool={isSearchMode}
            />
          )}
        />
      )}
    </View>
  );
}

// =============================================================================
// PICKER DROPDOWN
// =============================================================================

function PickerDropdown({
  items,
  selected,
  onSelect,
  colors,
  accent,
}: {
  items: { key: string; label: string }[];
  selected: string | null;
  onSelect: (key: string) => void;
  colors: typeof Colors.light;
  accent: string;
}) {
  return (
    <View style={[styles.pickerDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
        {items.map(item => {
          const isSelected = item.key === selected;
          return (
            <Pressable
              key={item.key}
              onPress={() => onSelect(item.key)}
              style={[
                styles.pickerItem,
                isSelected && { backgroundColor: accent + '15' },
              ]}
            >
              <Text
                style={[styles.pickerItemText, { color: isSelected ? accent : colors.text }]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
              {isSelected && <IconSymbol name="checkmark" size={14} color={accent} />}
            </Pressable>
          );
        })}
        {items.length === 0 && (
          <Text style={[styles.pickerEmpty, { color: colors.textTertiary }]}>No options available</Text>
        )}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// PLAYER ROW
// =============================================================================

function PlayerRow({
  player,
  lens,
  colors,
  onPress,
  showSchool,
}: {
  player: NationalPlayer;
  lens: LensKey;
  colors: typeof Colors.light;
  onPress: () => void;
  showSchool?: boolean;
}) {
  const score = getLensScore(player, lens);
  const scoreColor = getKRColor(score);

  return (
    <Pressable onPress={onPress} style={[styles.playerRow, { borderBottomColor: colors.border }]}>
      <View style={styles.playerInfo}>
        <Text style={[styles.playerName, { color: colors.text }]}>{player.fullName}</Text>
        <Text style={[styles.playerPos, { color: colors.textSecondary }]}>{player.position}</Text>
        <Text style={[styles.playerSub, { color: colors.textTertiary }]}>
          {player.height}{player.weight ? ` / ${player.weight} lbs` : ''}
          {player.classYear ? ` · ${player.classYear}` : ''}
          {showSchool ? ` · ${player.school}` : ''}
        </Text>
      </View>
      <View style={styles.playerScore}>
        {score != null ? (
          <Text style={[styles.scoreValue, { color: scoreColor }]}>{Math.round(score)}</Text>
        ) : (
          <Text style={[styles.scoreDash, { color: colors.textTertiary }]}>—</Text>
        )}
      </View>
    </Pressable>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: Spacing.sm,
  },
  subTabRow: {
    flexDirection: 'row',
    gap: 8,
  },
  subTabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  subTabLabel: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Coming soon
  comingSoon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  comingSoonSub: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },

  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },

  // Filters
  filterSection: {
    marginBottom: Spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  filterScrollContent: {
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    maxWidth: 160,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
  },

  // Picker dropdown
  pickerDropdown: {
    marginHorizontal: Spacing.lg,
    marginTop: 4,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pickerScroll: {
    maxHeight: 240,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pickerItemText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  pickerEmpty: {
    padding: 14,
    fontSize: 13,
    textAlign: 'center',
  },

  // Constraints
  constraintsCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
  },
  constraintsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  constraintCol: {
    flex: 1,
    alignItems: 'center',
  },
  constraintLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  constraintValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  constraintDivider: {
    width: 1,
    height: 32,
    marginHorizontal: Spacing.md,
  },

  // Team header
  teamHeader: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
  },
  teamHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  teamMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  teamConf: {
    fontSize: 13,
    fontWeight: '500',
  },
  teamKRBadge: {
    alignItems: 'center',
  },
  teamKRLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  teamKRValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  teamSheetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  teamSheetChipText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Lens
  lensRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: 8,
  },
  lensPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  lensPillText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Empty states
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  clearBtn: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },

  // Player row
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  playerInfo: {
    flex: 1,
    marginRight: 12,
  },
  playerName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  playerPos: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  playerSub: {
    fontSize: 12,
  },
  playerScore: {
    width: 48,
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  scoreDash: {
    fontSize: 20,
    fontWeight: '700',
  },
});
