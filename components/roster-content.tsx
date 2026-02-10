/**
 * Roster Content Component
 * NBA.com-style roster view for Lincoln University Oakland
 * Full-bleed hero-image layout — each player is an immersive section.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Dimensions,
  ScrollView,
  Modal,
  ImageSourcePropType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Spacing, BorderRadius } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FIREBASE_GAMES } from '@/data/firebase-lincoln';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Player headshot images
const HEADSHOTS: Record<string, ImageSourcePropType> = {
  '1': require('@/assets/images/headshots/1-williams.png'),
  '2': require('@/assets/images/headshots/2-plantey.png'),
  '3': require('@/assets/images/headshots/3-mckesey.png'),
  '6': require('@/assets/images/headshots/6-wall.png'),
  '10': require('@/assets/images/headshots/10-hernandez.png'),
  '11': require('@/assets/images/headshots/11-kalejaiye.png'),
  '15': require('@/assets/images/headshots/15-chatelain.png'),
  '20': require('@/assets/images/headshots/20-bansraj.png'),
  '21': require('@/assets/images/headshots/21-diomande.png'),
};

// Lincoln University Oakland colors
const TEAM_COLORS = {
  primary: '#f5f5f5',
  secondary: '#1e1e1e',
  accent: '#ffffff',
  background: '#0f0f0f',
  cardBg: '#181818',
  white: '#f5f5f5',
  gray: '#6e6e6e',
};

// ── Season Constants ──
const SEASONS = ['2024-25', '2025-26', '2026-27'] as const;
type Season = typeof SEASONS[number];
const CURRENT_SEASON: Season = '2025-26';

// Derive last 3 games from Firebase (most recent first)
const FB_LAST_3 = FIREBASE_GAMES
  .filter((g) => g.status === 'final' && g.boxScore)
  .slice(-3)
  .reverse();

const LAST_3_GAMES: Record<string, { opponent: string; pts: number; reb: number; ast: number }[]> = {};
for (const num of ['1', '2', '3', '5', '6', '10', '11', '15', '20', '21']) {
  LAST_3_GAMES[num] = FB_LAST_3.map((g) => {
    const ps = g.boxScore!.playerStats.find((p) => p.playerNumber === num);
    return ps
      ? { opponent: g.opponent, pts: ps.points, reb: ps.rebounds, ast: ps.assists }
      : { opponent: g.opponent, pts: 0, reb: 0, ast: 0 };
  });
}

// Lincoln University Oaklanders roster
const ROSTER = [
  { id: '1', number: '1', firstName: 'Brandon', lastName: 'Williams', position: 'Point Guard', listPos: 'PG', height: '6\'4"', weight: 195, classYear: 'Sophomore', scholarship: 100, nil: '$8K', notes: 'Team captain, floor general' },
  { id: '2', number: '2', firstName: 'Chris', lastName: 'Plantey', position: 'Point Guard', listPos: 'PG', height: '5\'9"', weight: 165, classYear: 'Freshman', scholarship: 0, nil: '—', notes: 'High motor, developing shooter' },
  { id: '3', number: '3', firstName: 'Claude', lastName: 'McKesey', position: 'Wing', listPos: 'W', height: '5\'10"', weight: 170, classYear: 'Sophomore', scholarship: 73, nil: '$3K', notes: 'Elite defender, quick hands' },
  { id: '10', number: '5', firstName: 'Samuel', lastName: 'Manzo', position: 'Guard', listPos: 'G', height: '\u2014', weight: 0, classYear: 'Freshman', scholarship: 0, nil: '\u2014', notes: '' },
  { id: '4', number: '6', firstName: 'Samuel', lastName: 'Wall', position: 'Combo Guard', listPos: 'CG', height: '6\'1"', weight: 185, classYear: 'Senior', scholarship: 100, nil: '$12K', notes: 'Veteran leader, mid-range specialist' },
  { id: '5', number: '10', firstName: 'Adrian', lastName: 'Hernandez', position: 'Combo Guard', listPos: 'CG', height: '6\'1"', weight: 180, classYear: 'Freshman', scholarship: 0, nil: '—', notes: 'Sharpshooter, catch-and-shoot threat' },
  { id: '6', number: '11', firstName: 'Laolu', lastName: 'Kalejaiye', position: 'Combo Guard', listPos: 'CG', height: '6\'0"', weight: 175, classYear: 'Junior', scholarship: 50, nil: '$6K', notes: 'Combo guard, playmaking upside' },
  { id: '7', number: '15', firstName: 'Nathan', lastName: 'Chtelan', position: 'Forward', listPos: 'F', height: '6\'7"', weight: 215, classYear: 'Freshman', scholarship: 75, nil: '$4K', notes: 'Stretch four, developing post game' },
  { id: '8', number: '20', firstName: 'Nicholas', lastName: 'Bansraj', position: 'Wing', listPos: 'W', height: '5\'7"', weight: 155, classYear: 'Freshman', scholarship: 0, nil: '—', notes: 'Energy spark off bench' },
  { id: '9', number: '21', firstName: 'Paul', lastName: 'Diomande', position: 'Big', listPos: 'B', height: '6\'5"', weight: 220, classYear: 'Junior', scholarship: 85, nil: '$10K', notes: 'Rim protector, transition finisher' },
];



// Depth chart data (moved from app/coach/depth-chart.tsx)
const DEPTH_CHART = [
  {
    position: 'Point Guard',
    players: [
      { name: 'Brandon Williams', number: '1', kr: 86, minutes: 32, role: 'Floor General', roleDefinition: 'Primary ball-handler who initiates offense and controls tempo.', systemAmplifier: 'Spread PnR initiator — his pace unlocks early-clock advantages.', coachNote: 'Let him cook in transition; trust his reads.' },
      { name: 'Chris Plantey', number: '2', kr: 68, minutes: 8, role: 'Press Breaker', roleDefinition: 'Secondary handler who relieves pressure and pushes the ball.', coachNote: 'Developing shooter — keep reps coming in practice.' },
    ],
  },
  {
    position: 'Combo Guard',
    players: [
      { name: 'Laolu Kalejaiye', number: '11', kr: 82, minutes: 28, role: 'Playmaking Scorer', roleDefinition: 'Versatile guard who creates for himself and others off the dribble.', systemAmplifier: 'PnR secondary — collapses defenses and finds cutters.', coachNote: 'Best mid-range pull-up on the team.' },
      { name: 'Adrian Hernandez', number: '10', kr: 71, minutes: 12, role: 'Spacer', roleDefinition: 'Catch-and-shoot threat who stretches the floor.', coachNote: 'Keep him in the corners — gravity matters.' },
      { number: '5', name: 'Manzo', role: 'bench' as const },
    ],
  },
  {
    position: 'Wing',
    players: [
      { name: 'Claude McKesey', number: '3', kr: 79, minutes: 26, role: 'Lockdown Defender', roleDefinition: 'Primary perimeter defender who guards the opponent\'s best player.', systemAmplifier: 'Pressure man anchor — his on-ball D sets the defensive tone.', coachNote: 'Elite hands, quick feet. Offensive game still developing.' },
      { name: 'Nicholas Bansraj', number: '20', kr: 64, minutes: 14, role: 'Energy Spark', roleDefinition: 'High-motor wing who provides intensity off the bench.', coachNote: 'Undersized but relentless. Use in short bursts.' },
    ],
  },
  {
    position: 'Forward',
    players: [
      { name: 'Nathan Chtelan', number: '15', kr: 84, minutes: 30, role: 'Stretch Four', roleDefinition: 'Floor-spacing big who can shoot from the perimeter and operate in the post.', systemAmplifier: 'His shooting pulls opposing bigs to the arc, opening driving lanes.', coachNote: 'Post game developing — feed him in the mid-post vs smaller defenders.' },
    ],
  },
  {
    position: 'Big',
    players: [
      { name: 'Paul Diomande', number: '21', kr: 81, minutes: 24, role: 'Rim Protector', roleDefinition: 'Anchor big who protects the paint and finishes inside.', systemAmplifier: 'Drop coverage lynchpin — funnels drivers into his contest zone.', coachNote: 'Best finisher in transition. Foul trouble is the risk.' },
      { name: 'Samuel Wall', number: '6', kr: 77, minutes: 16, role: 'Veteran Glue Guy', roleDefinition: 'Positionally versatile veteran who fills gaps and makes smart plays.', coachNote: 'Steadiest presence on the roster. Trust him in crunch time.' },
    ],
  },
];

// ── Season-keyed data ──
type RosterPlayer = typeof ROSTER[number];
type DepthChartPosition = typeof DEPTH_CHART[number];
type GameLog = { opponent: string; pts: number; reb: number; ast: number };

const CLASS_ADVANCE: Record<string, string> = {
  Freshman: 'Sophomore',
  Sophomore: 'Junior',
  Junior: 'Senior',
};

function advanceRoster(roster: RosterPlayer[]): RosterPlayer[] {
  return roster
    .filter((p) => p.classYear !== 'Senior') // seniors graduate
    .map((p) => ({ ...p, classYear: CLASS_ADVANCE[p.classYear] ?? p.classYear }));
}

function advanceDepthChart(chart: DepthChartPosition[], graduatedNumbers: Set<string>): DepthChartPosition[] {
  return chart
    .map((pos) => ({
      ...pos,
      players: pos.players.filter((p) => !graduatedNumbers.has(p.number)),
    }))
    .filter((pos) => pos.players.length > 0);
}

// Build graduated sets
const SENIORS_2024: Set<string> = new Set(
  ROSTER.filter((p) => p.classYear === 'Senior').map((p) => p.number),
);
const ROSTER_2025 = advanceRoster(ROSTER);
const SENIORS_2025: Set<string> = new Set(
  ROSTER_2025.filter((p) => p.classYear === 'Senior').map((p) => p.number),
);
const ROSTER_2026 = advanceRoster(ROSTER_2025);

const ROSTER_BY_SEASON: Record<Season, RosterPlayer[]> = {
  '2024-25': ROSTER,
  '2025-26': ROSTER_2025,
  '2026-27': ROSTER_2026,
};

const DEPTH_CHART_BY_SEASON: Record<Season, DepthChartPosition[]> = {
  '2024-25': DEPTH_CHART,
  '2025-26': advanceDepthChart(DEPTH_CHART, SENIORS_2024),
  '2026-27': advanceDepthChart(DEPTH_CHART, new Set([...SENIORS_2024, ...SENIORS_2025])),
};

const LAST_3_GAMES_BY_SEASON: Record<Season, Record<string, GameLog[]>> = {
  '2024-25': LAST_3_GAMES,
  '2025-26': LAST_3_GAMES,
  '2026-27': {},
};

type ViewType = 'cards' | 'list' | 'depth-chart';

function PlayerSection({
  player,
  statsOpen,
  onToggleStats,
  onBioPress,
  last3Games,
}: {
  player: RosterPlayer;
  statsOpen: boolean;
  onToggleStats: () => void;
  onBioPress: () => void;
  last3Games: Record<string, GameLog[]>;
}) {
  const headshot = HEADSHOTS[player.number];
  const games = last3Games[player.number] ?? [];

  return (
    <View style={styles.playerSection}>
      {/* ── Player Identity (number | name + position) ── */}
      <View style={styles.identityBlock}>
        <View style={styles.numberNameRow}>
          <Text style={styles.playerNumber}>{player.number}</Text>
          <View style={styles.verticalDivider} />
          <View>
            <Text style={styles.firstName}>{player.firstName}</Text>
            <Text style={styles.lastName}>{player.lastName}</Text>
          </View>
        </View>
        <Text style={styles.position}>{player.height} · {player.position} · {player.classYear}</Text>
      </View>

      {/* ── Hero Photo ── */}
      <View style={styles.photoArea}>
        {headshot ? (
          <View style={styles.photoWrapper}>
            <Image
              source={headshot}
              style={styles.headshot}
              resizeMode="contain"
            />
            <LinearGradient
              colors={['transparent', TEAM_COLORS.cardBg]}
              style={styles.photoGradientBottom}
            />
            <LinearGradient
              colors={[TEAM_COLORS.cardBg, 'transparent']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 0.15, y: 0.5 }}
              style={styles.photoGradientLeft}
            />
            <LinearGradient
              colors={['transparent', TEAM_COLORS.cardBg]}
              start={{ x: 0.85, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.photoGradientRight}
            />
          </View>
        ) : (
          <View style={styles.placeholderPhoto}>
            <Text style={styles.placeholderNumber}>{player.number}</Text>
          </View>
        )}
      </View>

      {/* ── Actions ── */}
      <View style={styles.actionsContainer}>
        {/* BIO pill */}
        <Pressable
          style={({ pressed }) => [
            styles.pillButton,
            pressed && styles.pillButtonPressed,
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onBioPress();
          }}
        >
          <Text style={styles.pillButtonText}>
            {player.firstName.toUpperCase()} {player.lastName.toUpperCase()} BIO
          </Text>
        </Pressable>

        {/* Basketball icon toggle */}
        <Pressable
          style={({ pressed }) => [
            styles.basketballToggle,
            statsOpen && styles.basketballToggleActive,
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onToggleStats();
          }}
        >
          <IconSymbol
            name="basketball.fill"
            size={26}
            color={statsOpen ? TEAM_COLORS.background : TEAM_COLORS.accent}
          />
        </Pressable>
      </View>

      {/* ── Inline Stats Dropdown (last 3 games) ── */}
      {statsOpen && games.length > 0 && (
        <View style={styles.statsDropdown}>
          <Text style={styles.statsHeader}>LAST 3 GAMES</Text>
          {/* Column labels */}
          <View style={styles.statsLabelRow}>
            <Text style={[styles.statsLabel, styles.statsOpponentCol]}>OPP</Text>
            <Text style={[styles.statsLabel, styles.statsStatCol]}>PTS</Text>
            <Text style={[styles.statsLabel, styles.statsStatCol]}>REB</Text>
            <Text style={[styles.statsLabel, styles.statsStatCol]}>AST</Text>
          </View>
          {games.map((game, idx) => (
            <View
              key={idx}
              style={[
                styles.statsRow,
                idx < games.length - 1 && styles.statsRowBorder,
              ]}
            >
              <Text
                style={[styles.statsOpponent, styles.statsOpponentCol]}
                numberOfLines={1}
              >
                {game.opponent}
              </Text>
              <Text style={[styles.statValue, styles.statsStatCol]}>{game.pts}</Text>
              <Text style={[styles.statValue, styles.statsStatCol]}>{game.reb}</Text>
              <Text style={[styles.statValue, styles.statsStatCol]}>{game.ast}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

/* ── Roster Controls: Season dropdown + View segmented control in one row ── */
const VIEW_OPTIONS: { key: ViewType; icon: string }[] = [
  { key: 'cards', icon: 'square.grid.2x2.fill' },
  { key: 'list', icon: 'rectangle.stack' },
  { key: 'depth-chart', icon: 'person.3.fill' },
];

function RosterControls({
  activeSeason,
  onSeasonChange,
  activeView,
  onViewChange,
}: {
  activeSeason: Season;
  onSeasonChange: (season: Season) => void;
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}) {
  const [seasonOpen, setSeasonOpen] = useState(false);
  const [pillY, setPillY] = useState(0);
  const [pillH, setPillH] = useState(0);
  const pillRef = React.useRef<View>(null);
  const seasonLabel = activeSeason.replace('-', '\u2013');

  const handlePillPress = () => {
    pillRef.current?.measureInWindow((_x, y, _w, h) => {
      setPillY(y);
      setPillH(h);
      setSeasonOpen(true);
    });
  };

  return (
    <>
      <View style={styles.controlsRow}>
        {/* Season dropdown pill */}
        <Pressable
          ref={pillRef as any}
          style={({ pressed }) => [
            styles.seasonPill,
            { opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={handlePillPress}
        >
          <Text style={styles.seasonPillText}>{seasonLabel}</Text>
          <IconSymbol name="chevron.down" size={10} color={TEAM_COLORS.gray} />
        </Pressable>

        {/* View toggle icons */}
        <View style={styles.viewToggle}>
          {VIEW_OPTIONS.map((v) => {
            const isActive = activeView === v.key;
            return (
              <Pressable
                key={v.key}
                style={[styles.viewToggleBtn, isActive && styles.viewToggleBtnActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onViewChange(v.key);
                }}
              >
                <IconSymbol
                  name={v.icon as any}
                  size={16}
                  color={isActive ? TEAM_COLORS.white : TEAM_COLORS.gray}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Season dropdown — anchored below pill */}
      {seasonOpen && (
        <Modal visible transparent animationType="none" onRequestClose={() => setSeasonOpen(false)}>
          <Pressable style={styles.seasonDropdownOverlay} onPress={() => setSeasonOpen(false)}>
            <View style={[styles.seasonDropdown, { top: pillY + pillH + 4 }]}>
              {SEASONS.map((s) => {
                const isSelected = s === activeSeason;
                return (
                  <Pressable
                    key={s}
                    style={[
                      styles.seasonDropdownItem,
                      isSelected && { backgroundColor: TEAM_COLORS.accent },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onSeasonChange(s);
                      setSeasonOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.seasonDropdownText,
                        isSelected && { color: TEAM_COLORS.background, fontWeight: '700' },
                      ]}
                    >
                      {s.replace('-', '\u2013')}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

/* ── List View (horizontal-scrollable table) ── */
const TABLE_COLUMNS: { key: string; label: string; width: number; align?: 'left' | 'center' | 'right' }[] = [
  { key: '#', label: '#', width: 40, align: 'center' },
  { key: 'name', label: 'NAME', width: 150 },
  { key: 'pos', label: 'POS', width: 56, align: 'center' },
  { key: 'ht', label: 'HT', width: 56, align: 'center' },
  { key: 'wt', label: 'WT', width: 50, align: 'center' },
  { key: 'class', label: 'CLASS', width: 80, align: 'center' },
  { key: 'schol', label: 'SCHOLARSHIP (%)', width: 120, align: 'center' },
  { key: 'nil', label: 'NIL', width: 56, align: 'center' },
  { key: 'notes', label: 'NOTES', width: 200 },
];

type SortKey = typeof TABLE_COLUMNS[number]['key'];

function getSortValue(player: RosterPlayer, key: SortKey): string | number {
  switch (key) {
    case '#': return parseInt(player.number, 10);
    case 'name': return `${player.lastName} ${player.firstName}`.toLowerCase();
    case 'pos': return player.listPos;
    case 'ht': return parseInt(player.height.replace(/['"]/g, ''), 10);
    case 'wt': return player.weight;
    case 'class': {
      const order: Record<string, number> = { Freshman: 1, Sophomore: 2, Junior: 3, Senior: 4 };
      return order[player.classYear] ?? 0;
    }
    case 'schol': return player.scholarship;
    case 'nil': {
      const raw = player.nil.replace(/[$K,]/g, '');
      return raw === '—' ? -1 : parseFloat(raw);
    }
    case 'notes': return (player.notes ?? '').toLowerCase();
    default: return '';
  }
}

function ListView({ roster }: { roster: RosterPlayer[] }) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>('#');
  const [sortAsc, setSortAsc] = useState(true);

  const handleHeaderPress = (key: SortKey) => {
    if (key === sortKey) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const sorted = [...roster].sort((a, b) => {
    const aVal = getSortValue(a, sortKey);
    const bVal = getSortValue(b, sortKey);
    const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortAsc ? cmp : -cmp;
  });

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableScroll}>
      <View style={styles.tableContainer}>
        {/* Header row */}
        <View style={styles.tableHeaderRow}>
          {TABLE_COLUMNS.map((col) => {
            const isActive = sortKey === col.key;
            return (
              <Pressable
                key={col.key}
                style={{ width: col.width, flexDirection: 'row', alignItems: col.align === 'center' ? 'center' : 'flex-start', justifyContent: col.align === 'center' ? 'center' : 'flex-start' }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  handleHeaderPress(col.key);
                }}
              >
                <Text
                  style={[
                    styles.tableHeaderCell,
                    isActive && styles.tableHeaderCellActive,
                  ]}
                  numberOfLines={1}
                >
                  {col.label}
                </Text>
                {isActive && (
                  <Text style={styles.tableHeaderArrow}>{sortAsc ? ' ▲' : ' ▼'}</Text>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Data rows */}
        {sorted.map((player, idx) => (
          <View
            key={player.id}
            style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}
          >
            <Text style={[styles.tableCell, styles.tableCellNumber, { width: TABLE_COLUMNS[0].width, textAlign: 'center' }]}>
              {player.number}
            </Text>
            <Pressable
              style={{ width: TABLE_COLUMNS[1].width }}
              onLongPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push({ pathname: '/coach/player-bio', params: { number: player.number } });
              }}
            >
              <Text style={[styles.tableCell, styles.tableCellName]} numberOfLines={1}>
                {player.firstName} {player.lastName}
              </Text>
            </Pressable>
            <Text style={[styles.tableCell, { width: TABLE_COLUMNS[2].width, textAlign: 'center' }]}>{player.listPos}</Text>
            <Text style={[styles.tableCell, { width: TABLE_COLUMNS[3].width, textAlign: 'center' }]}>{player.height}</Text>
            <Text style={[styles.tableCell, { width: TABLE_COLUMNS[4].width, textAlign: 'center' }]}>{player.weight}</Text>
            <Text style={[styles.tableCell, { width: TABLE_COLUMNS[5].width, textAlign: 'center' }]}>{player.classYear}</Text>
            <Text style={[styles.tableCell, { width: TABLE_COLUMNS[6].width, textAlign: 'center' }]}>{player.scholarship}%</Text>
            <Text style={[styles.tableCell, styles.tableCellNumber, { width: TABLE_COLUMNS[7].width, textAlign: 'center' }]}>{player.nil}</Text>
            <Text style={[styles.tableCell, styles.tableCellNotes, { width: TABLE_COLUMNS[8].width }]} numberOfLines={2}>
              {player.notes}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}


/* ── Depth Chart View ── */
function DepthChartView({ depthChart }: { depthChart: DepthChartPosition[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <View style={styles.groupedContainer}>
      {depthChart.map((pos) => (
        <View key={pos.position} style={styles.groupedSection}>
          <Text style={styles.groupedSectionLabel}>{pos.position.toUpperCase()}</Text>
          <View style={styles.groupedCard}>
            {pos.players.map((player, index) => {
              const isExpanded = expandedId === player.number;
              return (
                <View key={player.number}>
                  {index > 0 && <View style={styles.groupedDivider} />}
                  <Pressable
                    style={styles.groupedRowInner}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setExpandedId(isExpanded ? null : player.number);
                    }}
                  >
                    <View style={styles.groupedDepthCircle}>
                      <Text style={styles.groupedDepthNumber}>{index + 1}</Text>
                    </View>
                    <View style={styles.groupedPlayerInfo}>
                      <Text style={styles.groupedPlayerName}>{player.name}</Text>
                      <Text style={styles.groupedPlayerNote}>
                        {player.minutes ? `${player.minutes} MPG` : '— MPG'} · {player.role}
                      </Text>
                    </View>
                    <View style={styles.krBadge}>
                      <Text style={styles.krValue}>{player.kr}</Text>
                    </View>
                  </Pressable>
                  {isExpanded && (
                    <View style={styles.dcExpandedContainer}>
                      <View style={styles.dcExpandedRow}>
                        <Text style={styles.dcExpandedLabel}>Role</Text>
                        <Text style={styles.dcExpandedValue}>{player.roleDefinition}</Text>
                      </View>
                      {player.systemAmplifier ? (
                        <View style={styles.dcExpandedRow}>
                          <Text style={styles.dcExpandedLabel}>System Amp</Text>
                          <Text style={styles.dcExpandedValue}>{player.systemAmplifier}</Text>
                        </View>
                      ) : null}
                      <View style={styles.dcExpandedRow}>
                        <Text style={styles.dcExpandedLabel}>Coach Note</Text>
                        <Text style={styles.dcExpandedValue} numberOfLines={1}>{player.coachNote}</Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

/* ── Cards View (original full-bleed hero sections) ── */
function CardsView({ roster, last3Games }: { roster: RosterPlayer[]; last3Games: Record<string, GameLog[]> }) {
  const [openStatsId, setOpenStatsId] = useState<string | null>(null);
  const router = useRouter();

  const handleToggleStats = (playerId: string) => {
    setOpenStatsId((prev) => (prev === playerId ? null : playerId));
  };

  return (
    <>
      {roster.map((player) => (
        <PlayerSection
          key={player.id}
          player={player}
          statsOpen={openStatsId === player.id}
          onToggleStats={() => handleToggleStats(player.id)}
          onBioPress={() => router.push({ pathname: '/coach/player-bio', params: { number: player.number } })}
          last3Games={last3Games}
        />
      ))}
    </>
  );
}

export function RosterContent({ onViewChange }: { onViewChange?: () => void } = {}) {
  const [activeView, setActiveView] = useState<ViewType>('cards');
  const [selectedSeason, setSelectedSeason] = useState<Season>(CURRENT_SEASON);

  const roster = ROSTER_BY_SEASON[selectedSeason];
  const depthChart = DEPTH_CHART_BY_SEASON[selectedSeason];
  const last3Games = LAST_3_GAMES_BY_SEASON[selectedSeason];

  const handleViewChange = (view: ViewType) => {
    setActiveView(view);
    onViewChange?.();
  };

  const handleSeasonChange = (season: Season) => {
    setSelectedSeason(season);
    onViewChange?.(); // scroll to top
  };

  return (
    <View style={styles.container}>
      {/* Hero Banner */}
      <View style={styles.heroBanner}>
        <View style={styles.heroOverlay}>
          <Text style={styles.heroTitle}>Oaklanders Squad</Text>
          <Text style={styles.heroSubtitle}>
            Get to know your Lincoln University team.
          </Text>
        </View>
      </View>

      {/* Controls: Season + View in one row */}
      <RosterControls
        activeSeason={selectedSeason}
        onSeasonChange={handleSeasonChange}
        activeView={activeView}
        onViewChange={handleViewChange}
      />

      {/* Conditional Content */}
      {activeView === 'cards' && <CardsView roster={roster} last3Games={last3Games} />}
      {activeView === 'list' && <ListView roster={roster} />}
      {activeView === 'depth-chart' && <DepthChartView depthChart={depthChart} />}
    </View>
  );
}

const PHOTO_HEIGHT = SCREEN_WIDTH * 1.1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TEAM_COLORS.cardBg,
  },

  // ── Hero Banner ──
  heroBanner: {
    backgroundColor: TEAM_COLORS.cardBg,
  },
  heroOverlay: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: TEAM_COLORS.white,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: TEAM_COLORS.gray,
    marginTop: 4,
  },

  // ── Player Section (one per player, full-bleed) ──
  playerSection: {
    backgroundColor: TEAM_COLORS.cardBg,
    paddingTop: 40,
    paddingBottom: 32,
  },

  // ── Identity Block (number | name + position) ──
  identityBlock: {
    paddingHorizontal: Spacing.lg,
    marginBottom: -10,
    zIndex: 2,
  },
  numberNameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  playerNumber: {
    fontSize: 52,
    fontWeight: '300',
    color: TEAM_COLORS.gray,
    lineHeight: 58,
    marginRight: 14,
  },
  verticalDivider: {
    width: 2,
    height: 50,
    backgroundColor: TEAM_COLORS.gray,
    marginRight: 14,
    marginTop: 6,
  },
  firstName: {
    fontSize: 22,
    fontWeight: '400',
    color: TEAM_COLORS.gray,
    lineHeight: 26,
  },
  lastName: {
    fontSize: 26,
    fontWeight: '700',
    color: TEAM_COLORS.white,
    lineHeight: 30,
  },
  position: {
    fontSize: 14,
    fontWeight: '600',
    color: TEAM_COLORS.primary,
    marginTop: 4,
    letterSpacing: 0.3,
  },

  // ── Photo Area ──
  photoArea: {
    width: SCREEN_WIDTH,
    height: PHOTO_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  photoWrapper: {
    width: SCREEN_WIDTH * 0.75,
    height: PHOTO_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  headshot: {
    width: '100%',
    height: '100%',
  },
  photoGradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  photoGradientLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 60,
  },
  photoGradientRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 60,
  },

  // ── Placeholder (fallback when no headshot) ──
  placeholderPhoto: {
    width: 180,
    height: 220,
    backgroundColor: '#2a2a2a',
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderNumber: {
    fontSize: 56,
    fontWeight: '700',
    color: '#444',
  },

  // ── Actions (BIO pill + basketball icon) ──
  actionsContainer: {
    alignItems: 'center',
    marginTop: 16,
    gap: 14,
    paddingHorizontal: Spacing.lg,
  },
  pillButton: {
    backgroundColor: TEAM_COLORS.white,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    minWidth: 220,
    alignItems: 'center',
  },
  pillButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  pillButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: TEAM_COLORS.background,
    letterSpacing: 0.5,
  },
  basketballToggle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: TEAM_COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  basketballToggleActive: {
    backgroundColor: TEAM_COLORS.accent,
    borderColor: TEAM_COLORS.accent,
  },

  // ── Inline Stats Dropdown ──
  statsDropdown: {
    marginTop: 16,
    marginHorizontal: Spacing.lg,
    backgroundColor: '#222',
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  statsHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: TEAM_COLORS.accent,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  statsLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statsLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: TEAM_COLORS.gray,
    letterSpacing: 0.5,
  },
  statsOpponentCol: {
    flex: 1,
  },
  statsStatCol: {
    width: 44,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statsRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  statsOpponent: {
    fontSize: 13,
    fontWeight: '500',
    color: TEAM_COLORS.white,
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: TEAM_COLORS.white,
    width: 44,
    textAlign: 'center',
  },

  // ── Controls Row (season + view toggle) ──
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 4,
    backgroundColor: TEAM_COLORS.cardBg,
  },
  seasonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#2a2a2a',
  },
  seasonPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: TEAM_COLORS.text,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    height: 36,
    alignItems: 'center',
    padding: 3,
  },
  viewToggleBtn: {
    width: 34,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  viewToggleBtnActive: {
    backgroundColor: '#444',
  },
  seasonDropdownOverlay: {
    flex: 1,
  },
  seasonDropdown: {
    position: 'absolute',
    top: 0,
    left: Spacing.lg,
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    paddingVertical: 2,
  },
  seasonDropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  seasonDropdownText: {
    fontSize: 13,
    fontWeight: '500',
    color: TEAM_COLORS.gray,
  },

  // ── List View (Table) ──
  tableScroll: {
    marginTop: Spacing.sm,
    flexGrow: 0,
  },
  tableContainer: {
    paddingHorizontal: Spacing.lg,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: TEAM_COLORS.accent,
    paddingBottom: 8,
    marginBottom: 2,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: '700',
    color: TEAM_COLORS.accent,
    letterSpacing: 0.5,
    paddingHorizontal: 4,
  },
  tableHeaderCellActive: {
    color: TEAM_COLORS.white,
  },
  tableHeaderArrow: {
    fontSize: 8,
    color: TEAM_COLORS.white,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2a2a2a',
  },
  tableRowAlt: {
    backgroundColor: '#1f1f1f',
  },
  tableCell: {
    fontSize: 13,
    color: TEAM_COLORS.white,
    paddingHorizontal: 4,
  },
  tableCellNumber: {
    fontWeight: '700',
    color: TEAM_COLORS.accent,
  },
  tableCellName: {
    fontWeight: '600',
  },
  tableCellNotes: {
    fontSize: 12,
    color: TEAM_COLORS.gray,
  },

  // ── Grouped List (Rotation + Position) ──
  // Grouped list layout (Depth Chart / Rotation / Position)
  groupedContainer: {
    padding: Spacing.md,
  },
  groupedSection: {
    marginBottom: Spacing.lg,
  },
  groupedSectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: TEAM_COLORS.gray,
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  groupedCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  groupedDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#3a3a3a',
    marginLeft: Spacing.md + 32,
  },
  groupedRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  groupedDepthCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  groupedDepthNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: TEAM_COLORS.gray,
  },
  groupedPlayerInfo: {
    flex: 1,
  },
  groupedPlayerName: {
    fontSize: 15,
    fontWeight: '500',
    color: TEAM_COLORS.white,
  },
  groupedPlayerNote: {
    fontSize: 13,
    color: TEAM_COLORS.gray,
    marginTop: 2,
  },

  // ── Depth Chart Expanded Accordion ──
  dcExpandedContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    paddingLeft: Spacing.md + 32,
    gap: 6,
  },
  dcExpandedRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dcExpandedLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: TEAM_COLORS.accent,
    letterSpacing: 0.3,
    width: 76,
    flexShrink: 0,
  },
  dcExpandedValue: {
    fontSize: 12,
    color: TEAM_COLORS.gray,
    flex: 1,
    lineHeight: 16,
  },

  // ── KR Badge (Depth Chart) ──
  krBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  krValue: {
    fontSize: 14,
    fontWeight: '600',
    color: TEAM_COLORS.white,
  },
});
