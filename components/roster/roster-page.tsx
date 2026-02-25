/**
 * Roster Page — Cards / List / Depth Chart views
 *
 * Route: SportsHome → Roster tab (PagerView page)
 *
 * Views: Cards (default) | List | Depth Chart
 * Cards = intelligence surface. List = roster administration. Depth = competitive deployment.
 *
 * RBAC: Assistant Coach / Recruiting Coordinator (execution-level).
 * Full roster visibility (program-scoped).
 * No cross-program access, no editing of NIL or scholarship.
 * No inline rating editing. Roster page is view + routing only.
 * All structural changes occur via Nexus or Program Admin surfaces.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  TextInput,
  FlatList,
  Image,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { ROSTER_KR, KaNeXT_LEADERS, jerseyArchetypeMap } from '@/data/fmu';
import {
  PLAYER_CLUSTERS,
  PLAYER_PHYSICALS,
  ROSTER_META,
  computeOffKR,
  computeDefKR,
} from '@/data/roster-data';
import type { PlayerStatus } from '@/data/roster-data';
import { getKRColor } from '@/utils/kr-display';
import { openPlayerCard } from '@/utils/global-entity-sheets';
import type { PlayerCardData } from '@/utils/global-entity-sheets';
import {
  players,
  rosterEntries,
} from '@/data/sun-conference/florida-memorial';

// =============================================================================
// HEADSHOTS
// =============================================================================

const HEADSHOTS: Record<string, any> = {
  '0':  require('@/assets/images/headshots/thomas.png'),
  '1':  require('@/assets/images/headshots/asceric.png'),
  '2':  require('@/assets/images/headshots/lewis.png'),
  '3':  require('@/assets/images/headshots/thompson.png'),
  '4':  require('@/assets/images/headshots/carter.png'),
  '5':  require('@/assets/images/headshots/selden.png'),
  '7':  require('@/assets/images/headshots/moratinos.png'),
  '9':  require('@/assets/images/headshots/benbo.png'),
  '10': require('@/assets/images/headshots/morris.png'),
  '11': require('@/assets/images/headshots/mentor.png'),
  '12': require('@/assets/images/headshots/turner.png'),
  '13': require('@/assets/images/headshots/noel.png'),
  '15': require('@/assets/images/headshots/morgan.png'),
  '20': require('@/assets/images/headshots/dues.png'),
  '22': require('@/assets/images/headshots/laird.png'),
  '41': require('@/assets/images/headshots/brewer.png'),
  '55': require('@/assets/images/headshots/munir-jones.png'),
};

// =============================================================================
// TYPES & CONSTANTS
// =============================================================================

type RosterView = 'cards' | 'list' | 'depth';

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

type StatusFilter = 'all' | PlayerStatus;
type ListSortKey = 'jersey' | 'name' | 'position' | 'class' | 'height' | 'weight' | 'status' | 'aid';

const STATUS_FILTER_OPTIONS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'available', label: 'Available' },
  { key: 'injured', label: 'Injured' },
  { key: 'out', label: 'Out' },
  { key: 'redshirt', label: 'Redshirt' },
];

const LIST_SORT_OPTIONS: { key: ListSortKey; label: string }[] = [
  { key: 'jersey', label: '#' },
  { key: 'name', label: 'Name' },
  { key: 'position', label: 'Pos' },
  { key: 'class', label: 'Class' },
  { key: 'height', label: 'Ht' },
  { key: 'weight', label: 'Wt' },
  { key: 'status', label: 'Status' },
  { key: 'aid', label: 'Aid' },
];

interface RosterPlayer {
  playerId: string;
  jerseyNumber: string;
  displayJersey: string;
  firstName: string;
  lastName: string;
  position: string;
  height: string;
  weight: number;
  classYear: string;
  status: PlayerStatus;
  nil: number;
  aidPct: number;
  notes: string;
  scores: {
    overallKR: number;
    shooting: number;
    finishing: number;
    playmaking: number;
    onBallDefense: number;
    teamDefense: number;
    rebounding: number;
    frame: number;
  };
}

const STATUS_LABELS: Record<PlayerStatus, string> = {
  available: 'Available',
  injured: 'Injured',
  out: 'Out',
  redshirt: 'RS',
};

const STATUS_COLORS: Record<PlayerStatus, string> = {
  available: '#22C55E',
  injured: '#F59E0B',
  out: '#EF4444',
  redshirt: '#A1A1AA',
};

// Status sort priority: injured/out first
const STATUS_SORT_ORDER: Record<PlayerStatus, number> = {
  injured: 0,
  out: 1,
  redshirt: 2,
  available: 3,
};

// Class sort order
const CLASS_SORT_ORDER: Record<string, number> = {
  'Fr.': 0, 'So.': 1, 'Jr.': 2, 'Sr.': 3,
  'R-Fr.': 0.5, 'R-So.': 1.5, 'R-Jr.': 2.5, 'R-Sr.': 3.5,
};

// =============================================================================
// DATA BRIDGE
// =============================================================================

function normClass(c: string | null): string {
  if (!c) return '—';
  const low = c.toLowerCase().replace(/\./g, '').trim();
  if (low === 'freshman' || low === 'fr') return 'Fr.';
  if (low === 'sophomore' || low === 'so') return 'So.';
  if (low === 'junior' || low === 'jr') return 'Jr.';
  if (low === 'senior' || low === 'sr') return 'Sr.';
  if (low === 'graduate student' || low === 'gr' || low === 'graduate') return 'Gr.';
  if (low.startsWith('r-')) return 'R-' + normClass(low.slice(2));
  return c;
}

function normJersey(j: string | null): string {
  if (!j) return '0';
  const n = parseInt(j, 10);
  return isNaN(n) ? j : String(n);
}

const playerNameMap = new Map(players.map(p => [p.player_id, p.full_name]));

function buildRosterPlayers(): RosterPlayer[] {
  return rosterEntries
    .filter(r => r.season === '2025-26' && r.jersey_number != null && r.class_year != null)
    .map(r => {
      const jersey = normJersey(r.jersey_number);
      const fullName = playerNameMap.get(r.player_id) ?? 'Unknown';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] ?? '';
      const lastName = nameParts.slice(1).join(' ') || firstName;

      const clusters = PLAYER_CLUSTERS[jersey];
      const physicals = PLAYER_PHYSICALS[jersey];
      const meta = ROSTER_META[jersey];
      const kr = ROSTER_KR[jersey];

      return {
        playerId: r.player_id,
        jerseyNumber: jersey,
        displayJersey: r.jersey_number ?? '0',
        firstName,
        lastName,
        position: r.position ?? '—',
        height: physicals?.height ?? r.height ?? '—',
        weight: physicals?.weight ?? r.weight ?? 0,
        classYear: normClass(r.class_year),
        status: meta?.status ?? 'available',
        nil: meta?.nilAmount ?? 0,
        aidPct: meta?.aidPct ?? 0,
        notes: meta?.rosterNotes ?? '',
        scores: {
          overallKR: kr ?? 0,
          shooting: clusters?.shooting ?? 0,
          finishing: clusters?.finishing ?? 0,
          playmaking: clusters?.playmaking ?? 0,
          onBallDefense: clusters?.on_ball_defense ?? 0,
          teamDefense: clusters?.team_defense ?? 0,
          rebounding: clusters?.rebounding ?? 0,
          frame: clusters?.physical ?? 0,
        },
      };
    });
}

const ROSTER_PLAYERS = buildRosterPlayers();

// Stats lookup by jersey number
const leadersByJersey = new Map(KaNeXT_LEADERS.map(l => [l.number, l]));

function toPlayerCardData(p: RosterPlayer): PlayerCardData {
  const stats = leadersByJersey.get(p.jerseyNumber);
  const clusters = PLAYER_CLUSTERS[p.jerseyNumber];
  const offKR = clusters ? computeOffKR(clusters) : undefined;
  const defKR = clusters ? computeDefKR(clusters) : undefined;
  return {
    name: `${p.firstName} ${p.lastName}`,
    number: p.displayJersey,
    position: p.position,
    height: p.height,
    weight: p.weight,
    classYear: p.classYear,
    playerId: p.playerId,
    kr: p.scores.overallKR || undefined,
    offKR,
    defKR,
    archetype: jerseyArchetypeMap.get(p.jerseyNumber),
    nilAmount: p.nil || undefined,
    clusters: clusters ? {
      shooting: clusters.shooting,
      finishing: clusters.finishing,
      playmaking: clusters.playmaking,
      onBallDefense: clusters.on_ball_defense,
      teamDefense: clusters.team_defense,
      rebounding: clusters.rebounding,
      frame: clusters.physical,
    } : undefined,
    ppg: stats?.ppg,
    rpg: stats?.rpg,
    apg: stats?.apg,
    spg: stats?.spg,
    bpg: stats?.bpg,
    fgPct: stats?.fgPct,
    threePct: stats?.threePct,
    ftPct: stats?.ftPct,
    gp: stats?.gamesPlayed,
  };
}

// =============================================================================
// HELPERS
// =============================================================================

function getScoreForLens(p: RosterPlayer, lens: LensKey): number {
  switch (lens) {
    case 'overall': return p.scores.overallKR;
    case 'shooting': return p.scores.shooting;
    case 'finishing': return p.scores.finishing;
    case 'playmaking': return p.scores.playmaking;
    case 'onBallD': return p.scores.onBallDefense;
    case 'teamD': return p.scores.teamDefense;
    case 'rebounding': return p.scores.rebounding;
    case 'frame': return p.scores.frame;
    default: return p.scores.overallKR;
  }
}

function getLensLabel(lens: LensKey): string {
  if (lens === 'overall') return 'KR';
  return LENS_OPTIONS.find(l => l.key === lens)?.label ?? 'KR';
}

function parseHeight(h: string): number {
  // "6'2" → 74 inches
  const m = h.match(/(\d+)'(\d+)/);
  if (!m) return 0;
  return parseInt(m[1], 10) * 12 + parseInt(m[2], 10);
}

function sortListPlayers(list: RosterPlayer[], sortKey: ListSortKey): RosterPlayer[] {
  const sorted = [...list];
  switch (sortKey) {
    case 'jersey':
      return sorted.sort((a, b) => parseInt(a.jerseyNumber, 10) - parseInt(b.jerseyNumber, 10));
    case 'name':
      return sorted.sort((a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName));
    case 'position':
      return sorted.sort((a, b) => a.position.localeCompare(b.position));
    case 'class':
      return sorted.sort((a, b) => (CLASS_SORT_ORDER[a.classYear] ?? 9) - (CLASS_SORT_ORDER[b.classYear] ?? 9));
    case 'height':
      return sorted.sort((a, b) => parseHeight(b.height) - parseHeight(a.height));
    case 'weight':
      return sorted.sort((a, b) => b.weight - a.weight);
    case 'status':
      return sorted.sort((a, b) => STATUS_SORT_ORDER[a.status] - STATUS_SORT_ORDER[b.status]);
    case 'aid':
      return sorted.sort((a, b) => b.aidPct - a.aidPct);
    default:
      return sorted;
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

interface RosterPageProps {
  colors: typeof Colors.light;
}

export function RosterPage({ colors: propColors }: RosterPageProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = propColors ?? Colors[colorScheme];
  const accent = useAccentColor();
  const insets = useSafeAreaInsets();

  const [view, setView] = useState<RosterView>('cards');
  const [lens, setLens] = useState<LensKey>('overall');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [listSort, setListSort] = useState<ListSortKey>('jersey');

  // Cards view: filter by search, sort by lens
  const cardPlayers = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = ROSTER_PLAYERS;
    if (q) {
      list = list.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.jerseyNumber.includes(q) ||
        p.displayJersey.includes(q) ||
        p.position.toLowerCase().includes(q) ||
        p.classYear.toLowerCase().includes(q) ||
        STATUS_LABELS[p.status].toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => getScoreForLens(b, lens) - getScoreForLens(a, lens));
  }, [search, lens]);

  // List view: filter by search + status, sort by listSort
  const listPlayers = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = ROSTER_PLAYERS;
    if (statusFilter !== 'all') {
      list = list.filter(p => p.status === statusFilter);
    }
    if (q) {
      list = list.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.jerseyNumber.includes(q) ||
        p.displayJersey.includes(q) ||
        p.position.toLowerCase().includes(q) ||
        p.classYear.toLowerCase().includes(q) ||
        STATUS_LABELS[p.status].toLowerCase().includes(q),
      );
    }
    return sortListPlayers(list, listSort);
  }, [search, statusFilter, listSort]);

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      {/* ═══════ ROW 1 — Season + Search + View Toggle ═══════ */}
      <View style={[s.controlRow, { borderBottomColor: colors.border }]}>
        <View style={[s.seasonPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[s.seasonText, { color: colors.text }]}>2025-26</Text>
          <IconSymbol name="chevron.down" size={10} color={colors.textTertiary} />
        </View>

        <View style={[s.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={13} color={colors.textTertiary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search"
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            autoCorrect={false}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <IconSymbol name="xmark.circle.fill" size={14} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>

        <View style={s.viewToggle}>
          {(['cards', 'list', 'depth'] as RosterView[]).map(v => {
            const isActive = view === v;
            const icon =
              v === 'cards' ? 'square.grid.2x2.fill' :
              v === 'list' ? 'list.bullet' :
              'rectangle.3.group.fill';
            return (
              <Pressable
                key={v}
                style={[
                  s.viewBtn,
                  {
                    backgroundColor: isActive ? accent + '20' : 'transparent',
                    borderColor: isActive ? accent : 'transparent',
                  },
                ]}
                onPress={() => {
                  setView(v);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <IconSymbol name={icon as any} size={14} color={isActive ? accent : colors.textTertiary} />
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* ═══════ ROW 2 — Lens Pills (Cards) / Status Filters (List) ═══════ */}
      {view === 'cards' && (
        <View style={[s.lensWrap, { borderBottomColor: colors.border }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.lensRow}
          >
            {LENS_OPTIONS.map(l => {
              const isActive = lens === l.key;
              return (
                <Pressable
                  key={l.key}
                  style={[
                    s.lensPill,
                    {
                      backgroundColor: isActive ? accent + '20' : colors.card,
                      borderColor: isActive ? accent : colors.border,
                    },
                  ]}
                  onPress={() => {
                    setLens(l.key);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={[s.lensPillText, { color: isActive ? accent : colors.textSecondary }]}>
                    {l.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {view === 'list' && (
        <View style={[s.lensWrap, { borderBottomColor: colors.border }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.lensRow}
          >
            {STATUS_FILTER_OPTIONS.map(f => {
              const isActive = statusFilter === f.key;
              return (
                <Pressable
                  key={f.key}
                  style={[
                    s.lensPill,
                    {
                      backgroundColor: isActive ? accent + '20' : colors.card,
                      borderColor: isActive ? accent : colors.border,
                    },
                  ]}
                  onPress={() => {
                    setStatusFilter(f.key);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={[s.lensPillText, { color: isActive ? accent : colors.textSecondary }]}>
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* ═══════ CONTENT ═══════ */}
      {view === 'cards' ? (
        <FlatList
          data={cardPlayers}
          keyExtractor={p => p.playerId}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40, paddingTop: 8 }}
          renderItem={({ item }) => (
            <PlayerCard
              player={item}
              lens={lens}
              colors={colors}
              accent={accent}
              onSelect={() => openPlayerCard(toPlayerCardData(item))}
            />
          )}
        />
      ) : view === 'list' ? (
        <RosterList
          players={listPlayers}
          colors={colors}
          accent={accent}
          sortKey={listSort}
          onSort={setListSort}
          bottomInset={insets.bottom}
        />
      ) : (
        <View style={s.placeholder}>
          <Text style={[s.placeholderTitle, { color: colors.text }]}>Coming Soon</Text>
          <Text style={[s.placeholderSub, { color: colors.textSecondary }]}>
            Depth chart is under development.
          </Text>
        </View>
      )}
    </View>
  );
}

// =============================================================================
// ROSTER LIST VIEW — Horizontally scrollable table with fixed-width columns
// =============================================================================

// Column definitions with fixed widths
const COLUMNS: { key: ListSortKey | 'nil' | 'notes'; label: string; width: number }[] = [
  { key: 'jersey', label: '#',      width: 40 },
  { key: 'name',   label: 'Name',   width: 140 },
  { key: 'position', label: 'Pos',  width: 44 },
  { key: 'height', label: 'Ht',     width: 48 },
  { key: 'weight', label: 'Wt',     width: 44 },
  { key: 'class',  label: 'Class',  width: 48 },
  { key: 'status', label: 'Status', width: 80 },
  { key: 'aid',    label: 'Aid',    width: 48 },
  { key: 'nil',    label: 'NIL',    width: 60 },
  { key: 'notes',  label: 'Notes',  width: 180 },
];

const TABLE_ROW_WIDTH = COLUMNS.reduce((sum, c) => sum + c.width, 0) + 24; // + padding

function RosterList({
  players: data,
  colors,
  accent,
  sortKey,
  onSort,
  bottomInset,
}: {
  players: RosterPlayer[];
  colors: typeof Colors.light;
  accent: string;
  sortKey: ListSortKey;
  onSort: (key: ListSortKey) => void;
  bottomInset: number;
}) {
  if (data.length === 0) {
    return (
      <View style={s.placeholder}>
        <Text style={[s.placeholderTitle, { color: colors.text }]}>No Players</Text>
        <Text style={[s.placeholderSub, { color: colors.textSecondary }]}>
          No players in roster for selected season.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={true} style={{ flex: 1 }}>
      <View style={{ width: TABLE_ROW_WIDTH }}>
        {/* Sticky header */}
        <View style={[ls.headerRow, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          {COLUMNS.map(col => {
            const sortable = col.key !== 'nil' && col.key !== 'notes';
            const isActive = sortable && sortKey === col.key;
            return (
              <Pressable
                key={col.key}
                style={[ls.headerCell, { width: col.width }]}
                onPress={() => {
                  if (!sortable) return;
                  onSort(col.key as ListSortKey);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                disabled={!sortable}
              >
                <Text style={[ls.headerText, { color: isActive ? accent : colors.textTertiary }]}>
                  {col.label}
                </Text>
                {isActive && (
                  <IconSymbol name="chevron.down" size={8} color={accent} />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Rows — vertical scroll */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: bottomInset + 40 }}
        >
          {data.map((player, index) => (
            <ListRow
              key={player.playerId}
              player={player}
              colors={colors}
              isOdd={index % 2 === 1}
              onSelect={() => openPlayerCard(toPlayerCardData(player))}
            />
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

function ListRow({
  player,
  colors,
  isOdd,
  onSelect,
}: {
  player: RosterPlayer;
  colors: typeof Colors.light;
  isOdd: boolean;
  onSelect: () => void;
}) {
  const statusColor = STATUS_COLORS[player.status];
  const statusLabel = STATUS_LABELS[player.status];

  return (
    <Pressable
      style={[
        ls.row,
        { backgroundColor: isOdd ? colors.card + '60' : 'transparent', borderBottomColor: colors.border },
      ]}
      onPress={() => {
        onSelect();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
    >
      {/* # */}
      <View style={[ls.cell, { width: 40 }]}>
        <Text style={[ls.cellText, { color: colors.textSecondary }]}>#{player.displayJersey}</Text>
      </View>
      {/* Name */}
      <View style={[ls.cell, { width: 140 }]}>
        <Text style={[ls.nameText, { color: colors.text }]} numberOfLines={1}>
          {player.lastName}, {player.firstName}
        </Text>
      </View>
      {/* Pos */}
      <View style={[ls.cell, { width: 44 }]}>
        <Text style={[ls.cellText, { color: colors.textSecondary }]}>{player.position}</Text>
      </View>
      {/* Ht */}
      <View style={[ls.cell, { width: 48 }]}>
        <Text style={[ls.cellText, { color: colors.textSecondary }]}>{player.height}</Text>
      </View>
      {/* Wt */}
      <View style={[ls.cell, { width: 44 }]}>
        <Text style={[ls.cellText, { color: colors.textSecondary }]}>
          {player.weight > 0 ? player.weight : '—'}
        </Text>
      </View>
      {/* Class */}
      <View style={[ls.cell, { width: 48 }]}>
        <Text style={[ls.cellText, { color: colors.textSecondary }]}>{player.classYear}</Text>
      </View>
      {/* Status */}
      <View style={[ls.cell, { width: 80 }]}>
        <View style={[ls.statusChip, { backgroundColor: statusColor + '18' }]}>
          <View style={[ls.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[ls.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>
      {/* Aid */}
      <View style={[ls.cell, { width: 48 }]}>
        <Text style={[ls.cellText, { color: colors.textSecondary }]}>
          {player.aidPct > 0 ? `${player.aidPct}%` : '—'}
        </Text>
      </View>
      {/* NIL */}
      <View style={[ls.cell, { width: 60 }]}>
        <Text style={[ls.cellText, { color: colors.textSecondary }]}>
          {player.nil > 0 ? `$${(player.nil / 1000).toFixed(1)}K` : '—'}
        </Text>
      </View>
      {/* Notes */}
      <View style={[ls.cell, { width: 180 }]}>
        <Text style={[ls.notesText, { color: player.notes ? colors.textSecondary : colors.textTertiary }]} numberOfLines={2}>
          {player.notes || '—'}
        </Text>
      </View>
    </Pressable>
  );
}

// =============================================================================
// PLAYER CARD (Cards View)
// =============================================================================

const CARD_IMAGE_HEIGHT = 300;

function PlayerCard({
  player, lens, colors, accent, onSelect,
}: {
  player: RosterPlayer;
  lens: LensKey;
  colors: typeof Colors.light;
  accent: string;
  onSelect: () => void;
}) {
  const score = getScoreForLens(player, lens);
  const scoreLabel = getLensLabel(lens);
  const scoreColor = lens === 'overall' ? getKRColor(score) : accent;
  const headshot = HEADSHOTS[player.jerseyNumber];
  const statusColor = STATUS_COLORS[player.status];
  const statusLabel = STATUS_LABELS[player.status];

  return (
    <Pressable
      style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => {
        onSelect();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
    >
      {/* ── Image area ── */}
      <View style={s.cardImageArea}>
        <LinearGradient
          colors={[accent + '12', accent + '06', 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />

        {/* Headshot — centered bottom */}
        <View style={s.headshotWrap}>
          {headshot ? (
            <Image source={headshot} style={s.headshot} resizeMode="contain" />
          ) : (
            <View style={[s.headshotFallback, { backgroundColor: colors.border }]}>
              <Text style={[s.headshotInitials, { color: colors.textTertiary }]}>
                {player.firstName.charAt(0)}{player.lastName.charAt(0)}
              </Text>
            </View>
          )}
        </View>

        {/* Identity — top-left */}
        <View style={s.identityBlock}>
          <Text style={[s.jerseyNum, { color: colors.text }]}>#{player.displayJersey}</Text>
          <Text style={[s.firstName, { color: colors.textSecondary }]}>{player.firstName}</Text>
          <Text style={[s.lastName, { color: colors.text }]}>{player.lastName}</Text>
          <Text style={[s.posLabel, { color: colors.textTertiary }]}>{player.position}</Text>
        </View>

        {/* Score rail — top-right */}
        <View style={s.scoreRail}>
          <Text style={[s.scoreNum, { color: score > 0 ? scoreColor : colors.textTertiary }]}>
            {score > 0 ? score : '—'}
          </Text>
          <Text style={[s.scoreLbl, { color: colors.textTertiary }]}>{scoreLabel}</Text>
        </View>
      </View>

      {/* ── Bottom meta row ── */}
      <View style={[s.metaRow, { borderTopColor: colors.border }]}>
        <Text style={[s.metaText, { color: colors.textSecondary }]}>
          {player.height} · {player.weight > 0 ? `${player.weight} lbs` : '—'} · {player.classYear}
        </Text>
        <View style={s.metaChips}>
          <View style={[s.statusChip, { backgroundColor: statusColor + '18' }]}>
            <View style={[s.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[s.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
          <View style={[s.nilChip, { backgroundColor: colors.background }]}>
            <Text style={[s.nilText, { color: colors.textSecondary }]}>
              {player.nil > 0 ? `$${(player.nil / 1000).toFixed(1)}K` : '—'}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  root: { flex: 1 },

  // ── Row 1 — Controls ──
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  seasonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  seasonText: { fontSize: 12, fontWeight: '700' },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 13, fontWeight: '500', padding: 0 },
  viewToggle: { flexDirection: 'row', gap: 2 },
  viewBtn: { padding: 7, borderRadius: 8, borderWidth: 1 },

  // ── Row 2 — Lens / Filter Pills ──
  lensWrap: { borderBottomWidth: StyleSheet.hairlineWidth },
  lensRow: { paddingHorizontal: Spacing.md, paddingVertical: 10, gap: 8 },
  lensPill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  lensPillText: { fontSize: 13, fontWeight: '600' },

  // ── Card ──
  card: {
    marginHorizontal: Spacing.md,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardImageArea: {
    height: CARD_IMAGE_HEIGHT,
    position: 'relative',
  },

  // ── Headshot ──
  headshotWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  headshot: {
    width: 200,
    height: CARD_IMAGE_HEIGHT - 10,
  },
  headshotFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  headshotInitials: { fontSize: 28, fontWeight: '800' },

  // ── Identity Block ──
  identityBlock: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 2,
  },
  jerseyNum: { fontSize: 28, fontWeight: '900', letterSpacing: -1 },
  firstName: { fontSize: 12, fontWeight: '500', marginTop: 4 },
  lastName: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  posLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ── Score Rail ──
  scoreRail: {
    position: 'absolute',
    top: 20,
    right: 20,
    alignItems: 'flex-end',
    zIndex: 2,
  },
  scoreNum: { fontSize: 36, fontWeight: '900', letterSpacing: -1 },
  scoreLbl: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },

  // ── Meta Row ──
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  metaText: { fontSize: 12, fontWeight: '600' },
  metaChips: { flexDirection: 'row', gap: 8 },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '700' },
  nilChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm },
  nilText: { fontSize: 10, fontWeight: '700' },

  // ── Placeholder ──
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  placeholderSub: { fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
});

// ── List View Styles ──
const ls = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerCell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  headerText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cell: { alignItems: 'center', justifyContent: 'center' },
  cellText: { fontSize: 12, fontWeight: '600' },
  nameText: { fontSize: 12, fontWeight: '700' },
  notesText: { fontSize: 11, fontWeight: '500', lineHeight: 15 },

  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusLabel: { fontSize: 10, fontWeight: '700' },
});
