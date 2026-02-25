/**
 * Roster Page — Cards / List / Depth Chart views
 *
 * Route: SportsHome → Roster tab (PagerView page)
 *
 * Views: Cards (default) | List | Depth Chart
 * Only Cards is implemented in this spec.
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

// =============================================================================
// DATA BRIDGE
// =============================================================================

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
        classYear: r.class_year ?? '—',
        status: meta?.status ?? 'available',
        nil: meta?.nilAmount ?? 0,
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

  const filteredPlayers = useMemo(() => {
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
    // Sort by active lens score — highest first
    return [...list].sort((a, b) => getScoreForLens(b, lens) - getScoreForLens(a, lens));
  }, [search, lens]);

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

      {/* ═══════ ROW 2 — Lens Pills (Cards only) ═══════ */}
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

      {/* ═══════ CONTENT ═══════ */}
      {view === 'cards' ? (
        <FlatList
          data={filteredPlayers}
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
      ) : (
        <View style={s.placeholder}>
          <Text style={[s.placeholderTitle, { color: colors.text }]}>Coming Soon</Text>
          <Text style={[s.placeholderSub, { color: colors.textSecondary }]}>
            {view === 'list' ? 'List view' : 'Depth chart'} is under development.
          </Text>
        </View>
      )}
    </View>
  );
}

// =============================================================================
// PLAYER CARD
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

  // ── Row 2 — Lens Pills ──
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
