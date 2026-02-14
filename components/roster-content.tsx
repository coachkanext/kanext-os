/**
 * Roster Content Component
 * NBA.com-style roster view for Florida Memorial University Lions
 * Full-bleed hero-image layout — each player is an immersive section.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Dimensions,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { Spacing, BorderRadius } from '@/constants/theme';
import { FMU_RECORD, FMU_STANDINGS, ROSTER_KR } from '@/data/fmu';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ARCHETYPE_LABELS, type Archetype } from '@/data/system-demand-profiles';
import { UnitsView } from '@/components/depth-chart/depth-chart-units';
import { PlayerSheet } from '@/components/player-sheet';
import type { OffensiveStyle, DefensiveStyle } from '@/types';
import { HELIO_TO_TRADITIONAL } from '@/data/position-mapping';
import type { PoolPlayer, PoolPosition } from '@/data/playerPool';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// FMU seal used as fallback when no headshot available
const FMU_SEAL = require('@/assets/images/fmu-seal.png');

// Player headshots (keyed by jersey number)
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

// Shared data from @/data/roster-data (avoids circular deps with depth-chart components)
import { TEAM_COLORS, PLAYER_CLUSTERS, PLAYER_PHYSICALS, computeOffKR, computeDefKR } from '@/data/roster-data';
import type { ClusterRatings } from '@/data/roster-data';

// ── Season Constants ──
const SEASONS = ['2024-25', '2025-26', '2026-27'] as const;
type Season = typeof SEASONS[number];
export const CURRENT_SEASON: Season = '2025-26';

// FMU placeholder last-3-games (no Firebase dependency)
const LAST_3_GAMES: Record<string, { opponent: string; pts: number; reb: number; ast: number }[]> = {};

// PLAYER_CLUSTERS, ClusterRatings, computeOffKR, computeDefKR now live in @/data/roster-data

// KR sort options
type KrSortKey = 'kr' | 'offKR' | 'defKR' | 'shooting' | 'finishing' | 'playmaking' | 'perimeter_defense' | 'interior_defense' | 'rebounding' | 'frame';
const KR_SORT_OPTIONS: { key: KrSortKey; label: string }[] = [
  { key: 'kr', label: 'KR' },
  { key: 'offKR', label: 'O KR' },
  { key: 'defKR', label: 'D KR' },
  { key: 'shooting', label: 'SHT' },
  { key: 'finishing', label: 'FIN' },
  { key: 'playmaking', label: 'PLY' },
  { key: 'perimeter_defense', label: 'OBD' },
  { key: 'interior_defense', label: 'TMD' },
  { key: 'rebounding', label: 'REB' },
  { key: 'frame', label: 'PHY' },
];

function getPlayerKrSortValue(player: { number: string; kr: number }, key: KrSortKey): number {
  if (key === 'kr') return player.kr;
  const c = PLAYER_CLUSTERS[player.number];
  if (!c) return 0;
  if (key === 'offKR') return computeOffKR(c);
  if (key === 'defKR') return computeDefKR(c);
  return c[key as keyof ClusterRatings] ?? 0;
}

type PlayerRole = 'starter' | 'rotation' | 'bench' | 'redshirt' | 'injured' | 'out';

// Florida Memorial University Lions — 2025-26 Roster
export const ROSTER = [
  { id: '1',  number: '0',  firstName: 'Tristan',   lastName: 'Thomas',        position: 'Wing', listPos: 'W', height: '6\'4"',  weight: 175, classYear: 'Junior',    scholarship: 0, nil: '—', notes: 'Tampa, FL', formerSchool: 'Hillsborough CC', ppg: 3.4, rpg: 3.1, apg: 0, kr: 66, usage: 12.5, minutes: 16, role: 'rotation' as PlayerRole },
  { id: '2',  number: '1',  firstName: 'Petar',      lastName: 'Asceric',       position: 'Big',           listPos: 'B',  height: '6\'10"', weight: 230, classYear: 'Sophomore', scholarship: 0, nil: '—', notes: 'Belgrade, Serbia', formerSchool: 'KK Zemun (Serbia)', ppg: 6.1, rpg: 2.4, apg: 0, kr: 68, usage: 14.8, minutes: 16, role: 'rotation' as PlayerRole },
  { id: '3',  number: '2',  firstName: 'Braxton',    lastName: 'Lewis',         position: 'Wing', listPos: 'W', height: '6\'3"',  weight: 185, classYear: 'Junior',    scholarship: 0, nil: '—', notes: 'West Palm Beach, FL', formerSchool: 'Palm Beach State', ppg: 0, rpg: 0, apg: 0, kr: 54, usage: 0, minutes: 4, role: 'bench' as PlayerRole },
  { id: '4',  number: '3',  firstName: 'Rico',        lastName: 'Thompson',     position: 'Combo Guard', listPos: 'CG', height: '6\'1"', weight: 180, classYear: 'Sophomore', scholarship: 0, nil: '—', notes: 'Fort Lauderdale, FL', formerSchool: 'Stranahan HS', ppg: 0, rpg: 0, apg: 0, kr: 55, usage: 0, minutes: 4, role: 'bench' as PlayerRole },
  { id: '5',  number: '4',  firstName: 'Devin',      lastName: 'Carter',        position: 'Wing', listPos: 'W', height: '6\'0"',  weight: 175, classYear: 'Junior',    scholarship: 0, nil: '—', notes: 'Jackson, MS', formerSchool: 'Hinds CC', ppg: 18.3, rpg: 6.1, apg: 3.4, kr: 82, usage: 28.4, minutes: 32, role: 'starter' as PlayerRole },
  { id: '6',  number: '5',  firstName: 'Jeffrey',    lastName: 'Selden',        position: 'Big',           listPos: 'B',  height: '6\'6"',  weight: 210, classYear: 'Senior',    scholarship: 0, nil: '—', notes: 'Pembroke Pines, FL', formerSchool: 'Broward College', ppg: 11.2, rpg: 5.9, apg: 3.0, kr: 80, usage: 22.1, minutes: 28, role: 'starter' as PlayerRole },
  { id: '7',  number: '7',  firstName: 'Maximo',     lastName: 'Moratinos',     position: 'Forward', listPos: 'F', height: '6\'8"',  weight: 205, classYear: 'Sophomore', scholarship: 0, nil: '—', notes: 'Marbella, Spain', formerSchool: 'CB Marbella (Spain)', ppg: 6.6, rpg: 2.6, apg: 0, kr: 70, usage: 15.2, minutes: 18, role: 'rotation' as PlayerRole },
  { id: '8',  number: '9',  firstName: "Ka'Mar",     lastName: 'Benbo',         position: 'Point Guard',   listPos: 'PG', height: '6\'0"',  weight: 170, classYear: 'Freshman',  scholarship: 0, nil: '—', notes: 'Miami Gardens, FL', formerSchool: 'Carol City HS', ppg: 0, rpg: 0, apg: 0, kr: 58, usage: 0, minutes: 4, role: 'bench' as PlayerRole },
  { id: '9',  number: '10', firstName: 'Jason',      lastName: 'Morris',        position: 'Forward', listPos: 'F', height: '6\'4"',  weight: 200, classYear: 'Sophomore', scholarship: 0, nil: '—', notes: 'Miami, FL', formerSchool: 'Northwestern HS', ppg: 0, rpg: 0, apg: 0, kr: 56, usage: 0, minutes: 4, role: 'bench' as PlayerRole },
  { id: '10', number: '11', firstName: 'Sehmaj',     lastName: 'Mentor',        position: 'Point Guard',   listPos: 'PG', height: '6\'2"',  weight: 185, classYear: 'Junior',    scholarship: 0, nil: '—', notes: 'Orlando, FL', formerSchool: 'Indian River State', ppg: 9.2, rpg: 3.5, apg: 2.4, kr: 78, usage: 20.3, minutes: 30, role: 'starter' as PlayerRole },
  { id: '11', number: '12', firstName: 'Gavin',      lastName: 'Turner',        position: 'Wing', listPos: 'W', height: '6\'5"',  weight: 195, classYear: 'Freshman',  scholarship: 0, nil: '—', notes: 'Fort Lauderdale, FL', formerSchool: 'Dillard HS', ppg: 0, rpg: 0, apg: 0, kr: 52, usage: 0, minutes: 2, role: 'bench' as PlayerRole },
  { id: '12', number: '13', firstName: 'Cameron',    lastName: 'Noel',          position: 'Combo Guard', listPos: 'CG', height: '6\'2"', weight: 180, classYear: 'Junior',    scholarship: 0, nil: '—', notes: 'Opa-locka, FL', formerSchool: 'Miami Dade College', ppg: 11.0, rpg: 2.8, apg: 1.6, kr: 79, usage: 21.6, minutes: 28, role: 'starter' as PlayerRole },
  { id: '13', number: '15', firstName: 'Micah',      lastName: 'Morgan',        position: 'Point Guard',   listPos: 'PG', height: '6\'2"',  weight: 175, classYear: 'Junior',    scholarship: 0, nil: '—', notes: 'Houston, TX', formerSchool: 'Blinn College', ppg: 2.9, rpg: 2.7, apg: 0, kr: 65, usage: 10.1, minutes: 14, role: 'rotation' as PlayerRole },
  { id: '14', number: '20', firstName: "D'Andre",    lastName: 'Dues',          position: 'Forward', listPos: 'F', height: '6\'7"',  weight: 188, classYear: 'Freshman',  scholarship: 0, nil: '—', notes: 'Lauderdale Lakes, FL', formerSchool: 'Boyd Anderson HS', ppg: 0, rpg: 0, apg: 0, kr: 50, usage: 0, minutes: 2, role: 'bench' as PlayerRole },
  { id: '15', number: '22', firstName: 'Elijah',     lastName: 'Laird',         position: 'Combo Guard', listPos: 'CG', height: '6\'3"', weight: 185, classYear: 'Sophomore', scholarship: 0, nil: '—', notes: 'Deltona, FL', formerSchool: 'Deltona HS', ppg: 0, rpg: 0, apg: 0, kr: 52, usage: 0, minutes: 2, role: 'bench' as PlayerRole },
  { id: '16', number: '41', firstName: 'Morgan',     lastName: 'Brewer',        position: 'Forward', listPos: 'F', height: '6\'5"',  weight: 200, classYear: 'Sophomore', scholarship: 0, nil: '—', notes: 'Sunrise, FL', formerSchool: 'Piper HS', ppg: 9.0, rpg: 3.6, apg: 0, kr: 76, usage: 18.7, minutes: 26, role: 'starter' as PlayerRole },
  { id: '17', number: '55', firstName: "Aa'Reyon",   lastName: 'Munir-Jones',   position: 'Combo Guard', listPos: 'CG', height: '6\'4"', weight: 185, classYear: 'Sophomore', scholarship: 0, nil: '—', notes: 'Miramar, FL', formerSchool: 'Miramar HS', ppg: 7.2, rpg: 4.2, apg: 1.4, kr: 72, usage: 16.9, minutes: 20, role: 'rotation' as PlayerRole },
];

// FMU Depth Chart — 5 position groups
const DEPTH_CHART = [
  {
    position: 'Point Guard',
    players: [
      { name: 'Sehmaj Mentor', number: '11', kr: 78, minutes: 30, archetypes: ['pick_and_roll_operator', 'connector_guard_wing'] as Archetype[], roleDefinition: 'Primary ball-handler who initiates offense and controls tempo.', coachNote: 'Veteran leader, strong mid-range game.' },
      { name: 'Micah Morgan', number: '15', kr: 65, minutes: 14, archetypes: ['connector_guard_wing'] as Archetype[], roleDefinition: 'Secondary handler who relieves pressure and pushes pace.', coachNote: 'Developing — needs more reps.' },
      { name: "Ka'Mar Benbo", number: '9', kr: 58, minutes: 4, archetypes: [] as Archetype[], roleDefinition: 'Third-string guard getting development minutes.' as string, coachNote: 'Young — learning the system.' },
    ],
  },
  {
    position: 'Combo Guard',
    players: [
      { name: 'Cameron Noel', number: '13', kr: 79, minutes: 28, archetypes: ['spot_up_specialist', 'three_and_d_wing'] as Archetype[], roleDefinition: 'Primary perimeter scorer who creates off the dribble.', coachNote: 'Consistent shooter, can get hot.' },
      { name: "Aa'Reyon Munir-Jones", number: '55', kr: 72, minutes: 20, archetypes: ['two_way_wing', 'slasher_rim_pressure_wing'] as Archetype[], roleDefinition: 'Versatile guard who contributes on both ends.', coachNote: 'Athletic, strong rebounder for his position.' },
      { name: 'Rico Thompson', number: '3', kr: 55, minutes: 4, archetypes: [] as Archetype[], roleDefinition: 'Developmental guard working into the rotation.' as string, coachNote: 'Needs confidence.' },
    ],
  },
  {
    position: 'Wing',
    players: [
      { name: 'Devin Carter', number: '4', kr: 82, minutes: 32, archetypes: ['primary_ball_handler', 'slasher_rim_pressure_wing', 'secondary_creator_wing'] as Archetype[], roleDefinition: 'Primary scoring option — creates in isolation and transition.', systemAmplifier: 'Transition finisher — his speed in the open court generates easy looks.', coachNote: 'Go-to guy. Feed him early.' },
      { name: 'Tristan Thomas', number: '0', kr: 66, minutes: 16, archetypes: ['switchable_defender_wing'] as Archetype[], roleDefinition: 'Versatile wing who provides length and rebounding.', coachNote: 'Good defender, offense still developing.' },
      { name: 'Braxton Lewis', number: '2', kr: 54, minutes: 4, archetypes: [] as Archetype[], roleDefinition: 'Depth wing available for spot minutes.' as string, coachNote: 'Physical, needs polish.' },
    ],
  },
  {
    position: 'Forward',
    players: [
      { name: 'Morgan Brewer', number: '41', kr: 76, minutes: 26, archetypes: ['stretch_big', 'spot_up_specialist'] as Archetype[], roleDefinition: 'Floor-spacing big who operates from mid-range and the post.', coachNote: 'Reliable scorer, good positional rebounder.' },
      { name: 'Maximo Moratinos', number: '7', kr: 70, minutes: 18, archetypes: ['rim_protector_anchor', 'rebounding_interior_enforcer'] as Archetype[], roleDefinition: 'Physical big who protects the paint and finishes inside.', coachNote: 'Long, athletic. Good rim protection.' },
      { name: 'Jason Morris', number: '10', kr: 56, minutes: 4, archetypes: [] as Archetype[], roleDefinition: 'Developmental forward getting spot minutes.' as string, coachNote: 'Working on his frame.' },
    ],
  },
  {
    position: 'Big',
    players: [
      { name: 'Jeffrey Selden', number: '5', kr: 80, minutes: 28, archetypes: ['post_hub_facilitator_big', 'rim_protector_anchor'] as Archetype[], roleDefinition: 'Primary post presence — rim protection, rebounding, inside scoring.', systemAmplifier: 'Drop coverage anchor — funnels drivers into his contest zone.', coachNote: 'Most versatile big. Can pass out of the post.' },
      { name: 'Petar Asceric', number: '1', kr: 68, minutes: 16, archetypes: ['rim_protector_anchor'] as Archetype[], roleDefinition: 'Size and length off the bench for interior presence.', coachNote: 'Tallest player on roster. Needs to stay out of foul trouble.' },
    ],
  },
];

// FMU Team Info (for thin header)
const FMU_TEAM = {
  name: 'Florida Memorial',
  conference: 'Sun Conference',
  division: 'NAIA',
  record: FMU_RECORD.overall,
  confRecord: FMU_RECORD.conference,
  streak: FMU_STANDINGS.find((r) => r.team === 'Florida Memorial')?.streak ?? '—',
  tier: 'Regional Power',
};

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

export const DEPTH_CHART_BY_SEASON: Record<Season, DepthChartPosition[]> = {
  '2024-25': DEPTH_CHART,
  '2025-26': advanceDepthChart(DEPTH_CHART, SENIORS_2024),
  '2026-27': advanceDepthChart(DEPTH_CHART, new Set([...SENIORS_2024, ...SENIORS_2025])),
};

const LAST_3_GAMES_BY_SEASON: Record<Season, Record<string, GameLog[]>> = {
  '2024-25': LAST_3_GAMES,
  '2025-26': LAST_3_GAMES,
  '2026-27': {},
};

type ViewType = 'cards' | 'list' | 'depth';

// ── Filter / Sort types ──
type FilterOption = 'all' | 'starter' | 'rotation' | 'bench' | 'redshirt' | 'injured' | 'out';
type SortOption = 'kr' | 'number' | 'usage' | 'minutes' | 'ppg' | 'rpg' | 'apg' | 'position' | 'class' | 'az';

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'kr', label: 'KR' },
  { key: 'number', label: '#' },
  { key: 'usage', label: 'Usage' },
  { key: 'minutes', label: 'Minutes' },
  { key: 'ppg', label: 'PPG' },
  { key: 'rpg', label: 'RPG' },
  { key: 'apg', label: 'APG' },
  { key: 'position', label: 'Position' },
  { key: 'class', label: 'Class' },
  { key: 'az', label: 'A–Z' },
];

// ── Full-bleed Player Section (NBA.com style) ──
function PlayerSection({
  player,
  krSortKey,
  onBioPress,
}: {
  player: RosterPlayer;
  krSortKey: KrSortKey | null;
  onBioPress: () => void;
}) {
  const hasHeadshot = !!HEADSHOTS[player.number];

  return (
    <View style={styles.playerSection}>
      {/* ── Player Identity (number + name + KR + position + last 3) ── */}
      <View style={styles.identityBlock}>
        <View style={styles.numberNameRow}>
          <Text style={styles.playerNumber}>{player.number}</Text>
          <View style={styles.verticalDivider} />
          <View style={{ flex: 1 }}>
            <Text style={styles.firstName}>{player.firstName}</Text>
            <Text style={styles.lastName}>{player.lastName}</Text>
          </View>
          <View style={styles.cardBadgesCol}>
            <View style={styles.cardBadges}>
              <View style={styles.cardLevelBadge}>
                <Text style={styles.cardLevelText}>{player.classYear === 'Freshman' ? 'Fr' : player.classYear === 'Sophomore' ? 'So' : player.classYear === 'Junior' ? 'Jr' : 'Sr'}</Text>
              </View>
              <View style={styles.cardPosBadge}>
                <Text style={styles.cardPosText}>{player.listPos}</Text>
              </View>
            </View>
            <Text style={styles.cardKrText}>{player.kr}</Text>
          </View>
        </View>
        <Text style={styles.position}>{player.height} · {player.weight} lbs</Text>
        {(player.ppg > 0 || player.rpg > 0 || player.apg > 0) && (
          <Text style={styles.last3Stats}>
            {player.ppg} PPG · {player.rpg} RPG · {player.apg} APG
          </Text>
        )}
      </View>

      {/* ── Hero Photo (headshot or FMU Seal fallback) — tappable → bio ── */}
      <Pressable
        style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onBioPress();
        }}
      >
        <View style={styles.photoArea}>
          <View style={hasHeadshot ? styles.headshotWrapper : styles.photoWrapper}>
            <Image
              source={HEADSHOTS[player.number] ?? FMU_SEAL}
              style={hasHeadshot ? styles.headshot : styles.sealImage}
              resizeMode="contain"
            />
            {hasHeadshot && (
              <>
                <LinearGradient
                  colors={[TEAM_COLORS.cardBg, 'transparent']}
                  locations={[0, 0.4]}
                  style={styles.photoGradientTop}
                />
                <LinearGradient
                  colors={[TEAM_COLORS.cardBg, 'transparent']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 0.3, y: 0.5 }}
                  style={styles.photoGradientLeft}
                />
                <LinearGradient
                  colors={['transparent', TEAM_COLORS.cardBg]}
                  start={{ x: 0.7, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.photoGradientRight}
                />
              </>
            )}
            <LinearGradient
              colors={['transparent', TEAM_COLORS.cardBg]}
              style={styles.photoGradientBottom}
            />
          </View>
        </View>
      </Pressable>
    </View>
  );
}

/* ── Roster Controls: Season + Filter + Sort + Search + View toggle ── */
const VIEW_OPTIONS: { key: ViewType; icon: string }[] = [
  { key: 'depth', icon: 'list.bullet.indent' },
  { key: 'cards', icon: 'square.grid.2x2.fill' },
  { key: 'list', icon: 'rectangle.stack' },
];

function RosterControls({
  activeView,
  onViewChange,
  selectedSeason,
  onSeasonChange,
  searchQuery,
  onSearchChange,
  krSortKey,
  onKrSortChange,
}: {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  selectedSeason: Season;
  onSeasonChange: (season: Season) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  krSortKey: KrSortKey | null;
  onKrSortChange: (key: KrSortKey | null) => void;
}) {
  const [seasonOpen, setSeasonOpen] = useState(false);
  const [krDropdownOpen, setKrDropdownOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [pillY, setPillY] = useState(0);
  const [pillH, setPillH] = useState(0);
  const [activePillX, setActivePillX] = useState(0);
  const seasonRef = React.useRef<View>(null);
  const krRef = React.useRef<View>(null);

  const openDropdown = (
    ref: React.RefObject<View | null>,
    setter: (v: boolean) => void,
  ) => {
    (ref.current as any)?.measureInWindow((x: number, y: number, _w: number, h: number) => {
      setActivePillX(x);
      setPillY(y);
      setPillH(h);
      setter(true);
    });
  };

  const seasonLabel = selectedSeason.replace('-', '\u2013');
  const krLabel = krSortKey ? (KR_SORT_OPTIONS.find((o) => o.key === krSortKey)?.label ?? 'KR') : 'KR';

  return (
    <>
      <View style={styles.controlsRow}>
        {/* Pills row */}
        <View style={styles.pillsRow}>
          {/* Season pill */}
          <Pressable
            ref={seasonRef as any}
            style={({ pressed }) => [
              styles.controlPill,
              { opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => openDropdown(seasonRef, setSeasonOpen)}
          >
            <Text style={styles.controlPillText}>
              {seasonLabel}
            </Text>
            <IconSymbol name="chevron.down" size={10} color={TEAM_COLORS.gray} />
          </Pressable>

          {/* KR sort dropdown pill (hidden in depth view — lens lives inside UnitsView) */}
          {activeView !== 'depth' && (
          <Pressable
            ref={krRef as any}
            style={({ pressed }) => [
              styles.controlPill,
              krSortKey != null && styles.controlPillActive,
              { opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => openDropdown(krRef, setKrDropdownOpen)}
          >
            <Text style={[styles.controlPillText, krSortKey != null && { color: TEAM_COLORS.white }]}>
              {krLabel}
            </Text>
            <IconSymbol name="chevron.down" size={10} color={krSortKey != null ? TEAM_COLORS.white : TEAM_COLORS.gray} />
          </Pressable>
          )}

          {/* Search icon */}
          <Pressable
            style={({ pressed }) => [
              styles.controlPill,
              searchActive && styles.controlPillActive,
              { opacity: pressed ? 0.8 : 1, paddingHorizontal: 8 },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (searchActive) {
                setSearchActive(false);
                onSearchChange('');
              } else {
                setSearchActive(true);
              }
            }}
          >
            <IconSymbol
              name="magnifyingglass"
              size={14}
              color={searchActive ? TEAM_COLORS.white : TEAM_COLORS.gray}
            />
          </Pressable>
        </View>

        {/* View toggle */}
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

      {/* Search input bar (expanded when active) */}
      {searchActive && (
        <View style={styles.searchBar}>
          <IconSymbol name="magnifyingglass" size={14} color={TEAM_COLORS.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search players..."
            placeholderTextColor={TEAM_COLORS.gray}
            value={searchQuery}
            onChangeText={onSearchChange}
            autoFocus
            returnKeyType="done"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => onSearchChange('')}>
              <IconSymbol name="xmark.circle.fill" size={16} color={TEAM_COLORS.gray} />
            </Pressable>
          )}
        </View>
      )}

      {/* Season dropdown */}
      {seasonOpen && (
        <Modal visible transparent animationType="none" onRequestClose={() => setSeasonOpen(false)}>
          <Pressable style={styles.dropdownOverlay} onPress={() => setSeasonOpen(false)}>
            <View style={[styles.dropdown, { top: pillY + pillH + 4, left: activePillX }]}>
              {SEASONS.map((s) => {
                const isSelected = s === selectedSeason;
                return (
                  <Pressable
                    key={s}
                    style={[styles.dropdownItem, isSelected && { backgroundColor: TEAM_COLORS.accent }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onSeasonChange(s);
                      setSeasonOpen(false);
                    }}
                  >
                    <Text style={[styles.dropdownText, isSelected && { color: TEAM_COLORS.background, fontWeight: '700' }]}>
                      {s.replace('-', '\u2013')}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Modal>
      )}

      {/* KR sort dropdown */}
      {krDropdownOpen && (
        <Modal visible transparent animationType="none" onRequestClose={() => setKrDropdownOpen(false)}>
          <Pressable style={styles.dropdownOverlay} onPress={() => setKrDropdownOpen(false)}>
            <View style={[styles.dropdown, { top: pillY + pillH + 4, left: activePillX, minWidth: 130 }]}>
              {/* Reset option */}
              {krSortKey != null && (
                <Pressable
                  style={styles.dropdownItem}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onKrSortChange(null);
                    setKrDropdownOpen(false);
                  }}
                >
                  <Text style={[styles.dropdownText, { color: '#EF4444' }]}>Clear Sort</Text>
                </Pressable>
              )}
              {KR_SORT_OPTIONS.map((opt) => {
                const isSelected = opt.key === krSortKey;
                return (
                  <Pressable
                    key={opt.key}
                    style={[styles.dropdownItem, isSelected && { backgroundColor: TEAM_COLORS.accent }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onKrSortChange(opt.key);
                      setKrDropdownOpen(false);
                    }}
                  >
                    <Text style={[styles.dropdownText, isSelected && { color: TEAM_COLORS.background, fontWeight: '700' }]}>
                      {opt.label}
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
  { key: 'birthplace', label: 'HOMETOWN', width: 120 },
  { key: 'prep', label: 'PREV', width: 140 },
  { key: 'kr', label: 'KR', width: 46, align: 'center' },
  { key: 'offKR', label: 'O KR', width: 50, align: 'center' },
  { key: 'defKR', label: 'D KR', width: 50, align: 'center' },
  { key: 'shooting', label: 'SHT', width: 46, align: 'center' },
  { key: 'finishing', label: 'FIN', width: 46, align: 'center' },
  { key: 'playmaking', label: 'PLY', width: 46, align: 'center' },
  { key: 'perimeter_defense', label: 'OBD', width: 46, align: 'center' },
  { key: 'interior_defense', label: 'TMD', width: 46, align: 'center' },
  { key: 'rebounding', label: 'REB', width: 46, align: 'center' },
  { key: 'frame', label: 'PHY', width: 46, align: 'center' },
];

type ListSortKey = typeof TABLE_COLUMNS[number]['key'];

const STATUS_DISPLAY: Record<PlayerRole, string> = {
  starter: 'Available',
  rotation: 'Available',
  bench: 'Available',
  redshirt: 'Redshirt',
  injured: 'Injured',
  out: 'Out',
};

const CLASS_ABBREV: Record<string, string> = {
  Freshman: 'Fr', Sophomore: 'So', Junior: 'Jr', Senior: 'Sr',
};

function getListSortValue(player: RosterPlayer, key: ListSortKey): string | number {
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
    case 'status': {
      const statusOrder: Record<string, number> = { injured: 0, out: 1, redshirt: 2, bench: 3, rotation: 4, starter: 5 };
      return statusOrder[player.role] ?? 3;
    }
    case 'birthplace': return (player.notes ?? '').toLowerCase();
    case 'prep': return (player.formerSchool ?? '').toLowerCase();
    case 'kr': return player.kr;
    case 'offKR': { const c = PLAYER_CLUSTERS[player.number]; return c ? computeOffKR(c) : 0; }
    case 'defKR': { const c = PLAYER_CLUSTERS[player.number]; return c ? computeDefKR(c) : 0; }
    case 'shooting':
    case 'finishing':
    case 'playmaking':
    case 'perimeter_defense':
    case 'interior_defense':
    case 'rebounding':
    case 'frame': { const c = PLAYER_CLUSTERS[player.number]; return c ? c[key as keyof ClusterRatings] : 0; }
    default: return '';
  }
}

function ListView({ roster, onPlayerTap }: { roster: RosterPlayer[]; onPlayerTap: (jersey: string) => void }) {
  const [sortKey, setSortKey] = useState<ListSortKey>('#');
  const [sortAsc, setSortAsc] = useState(true);

  const handleHeaderPress = (key: ListSortKey) => {
    if (key === sortKey) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      // Default descending for KR columns
      const descKeys = ['kr', 'offKR', 'defKR', 'shooting', 'finishing', 'playmaking', 'perimeter_defense', 'interior_defense', 'rebounding', 'frame'];
      setSortAsc(!descKeys.includes(key));
    }
  };

  const sorted = [...roster].sort((a, b) => {
    const aVal = getListSortValue(a, sortKey);
    const bVal = getListSortValue(b, sortKey);
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
                  style={[styles.tableHeaderCell, isActive && styles.tableHeaderCellActive]}
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
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPlayerTap(player.number);
              }}
            >
              <Text style={[styles.tableCell, styles.tableCellName]} numberOfLines={1}>
                {player.firstName} {player.lastName}
              </Text>
            </Pressable>
            <Text style={[styles.tableCell, { width: TABLE_COLUMNS[2].width, textAlign: 'center' }]}>{player.listPos}</Text>
            <Text style={[styles.tableCell, { width: TABLE_COLUMNS[3].width, textAlign: 'center' }]}>{player.height}</Text>
            <Text style={[styles.tableCell, { width: TABLE_COLUMNS[4].width, textAlign: 'center' }]}>{player.weight}</Text>
            <Text style={[styles.tableCell, { width: TABLE_COLUMNS[5].width, textAlign: 'center' }]}>{CLASS_ABBREV[player.classYear] ?? player.classYear}</Text>
            <Text style={[styles.tableCell, styles.tableCellNotes, { width: TABLE_COLUMNS[6].width }]} numberOfLines={1}>
              {player.notes || '—'}
            </Text>
            <Text style={[styles.tableCell, styles.tableCellNotes, { width: TABLE_COLUMNS[7].width }]} numberOfLines={1}>
              {player.formerSchool || '—'}
            </Text>
            {/* KR columns */}
            {(() => {
              const c = PLAYER_CLUSTERS[player.number];
              const offKR = c ? computeOffKR(c) : 0;
              const defKR = c ? computeDefKR(c) : 0;
              return (
                <>
                  <Text style={[styles.tableCell, { width: TABLE_COLUMNS[8].width, textAlign: 'center', fontWeight: '600' }]}>{player.kr}</Text>
                  <Text style={[styles.tableCell, { width: TABLE_COLUMNS[9].width, textAlign: 'center' }]}>{offKR}</Text>
                  <Text style={[styles.tableCell, { width: TABLE_COLUMNS[10].width, textAlign: 'center' }]}>{defKR}</Text>
                  <Text style={[styles.tableCell, { width: TABLE_COLUMNS[11].width, textAlign: 'center' }]}>{c?.shooting ?? '—'}</Text>
                  <Text style={[styles.tableCell, { width: TABLE_COLUMNS[12].width, textAlign: 'center' }]}>{c?.finishing ?? '—'}</Text>
                  <Text style={[styles.tableCell, { width: TABLE_COLUMNS[13].width, textAlign: 'center' }]}>{c?.playmaking ?? '—'}</Text>
                  <Text style={[styles.tableCell, { width: TABLE_COLUMNS[14].width, textAlign: 'center' }]}>{c?.perimeter_defense ?? '—'}</Text>
                  <Text style={[styles.tableCell, { width: TABLE_COLUMNS[15].width, textAlign: 'center' }]}>{c?.interior_defense ?? '—'}</Text>
                  <Text style={[styles.tableCell, { width: TABLE_COLUMNS[16].width, textAlign: 'center' }]}>{c?.rebounding ?? '—'}</Text>
                  <Text style={[styles.tableCell, { width: TABLE_COLUMNS[17].width, textAlign: 'center' }]}>{c?.frame ?? '—'}</Text>
                </>
              );
            })()}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}


/* ── Depth Chart View ── */
export function DepthChartView({ depthChart }: { depthChart: DepthChartPosition[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <View style={styles.groupedContainer}>
      {depthChart.map((pos) => (
        <View key={pos.position} style={styles.groupedSection}>
          <Text style={styles.groupedSectionLabel}>{pos.position.toUpperCase()}</Text>
          <View style={styles.groupedCard}>
            {pos.players.map((player, index) => {
              const isExpanded = expandedId === player.number;
              const isStarter = index === 0;
              return (
                <View key={player.number}>
                  {index > 0 && <View style={styles.groupedDivider} />}
                  <Pressable
                    style={[styles.groupedRowInner, isStarter && styles.groupedRowStarter]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setExpandedId(isExpanded ? null : player.number);
                    }}
                  >
                    <View style={styles.groupedPlayerInfo}>
                      <Text style={[styles.groupedPlayerName, isStarter && styles.groupedPlayerNameStarter]}>{player.name}</Text>
                      <Text style={styles.groupedPlayerNote} numberOfLines={1}>
                        {player.minutes ? `${player.minutes} MPG` : '— MPG'}
                        {player.archetypes.length > 0 && ` · ${ARCHETYPE_LABELS[player.archetypes[0]]}`}
                        {player.archetypes.length === 2 && ` · ${ARCHETYPE_LABELS[player.archetypes[1]]}`}
                        {player.archetypes.length > 2 && ` · ${ARCHETYPE_LABELS[player.archetypes[1]]} +${player.archetypes.length - 2}`}
                      </Text>
                    </View>
                    {player.kr != null && (
                      <View style={styles.krBadge}>
                        <Text style={styles.krValue}>{player.kr}</Text>
                      </View>
                    )}
                  </Pressable>
                  {isExpanded && (
                    <View style={styles.dcExpandedContainer}>
                      <View style={styles.dcExpandedRow}>
                        <Text style={styles.dcExpandedLabel}>Role</Text>
                        <Text style={styles.dcExpandedValue}>{player.roleDefinition}</Text>
                      </View>
                      {'systemAmplifier' in player && player.systemAmplifier ? (
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

/* ── Cards View (full-bleed hero sections) ── */
function CardsView({ roster, krSortKey, onPlayerTap }: { roster: RosterPlayer[]; krSortKey: KrSortKey | null; onPlayerTap: (jersey: string) => void }) {
  return (
    <>
      {roster.map((player) => (
        <React.Fragment key={player.id}>
          <PlayerSection
            player={player}
            krSortKey={krSortKey}
            onBioPress={() => onPlayerTap(player.number)}
          />
        </React.Fragment>
      ))}
    </>
  );
}

// ── Helper: apply filter, sort, search to roster ──
function useFilteredRoster(
  roster: RosterPlayer[],
  filter: FilterOption,
  sort: SortOption,
  searchQuery: string,
): RosterPlayer[] {
  return useMemo(() => {
    let result = [...roster];

    // Filter
    if (filter !== 'all') {
      if (filter === 'rotation') {
        result = result.filter((p) => p.role === 'starter' || p.role === 'rotation');
      } else {
        result = result.filter((p) => p.role === filter);
      }
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q),
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sort) {
        case 'kr':
          return b.kr - a.kr;
        case 'number':
          return parseInt(a.number, 10) - parseInt(b.number, 10);
        case 'usage':
          return b.usage - a.usage;
        case 'minutes':
          return b.minutes - a.minutes;
        case 'ppg':
          return b.ppg - a.ppg;
        case 'rpg':
          return b.rpg - a.rpg;
        case 'apg':
          return b.apg - a.apg;
        case 'az':
          return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
        case 'position': {
          const posOrder: Record<string, number> = { PG: 1, CG: 2, W: 3, F: 4, B: 5 };
          return (posOrder[a.listPos] ?? 9) - (posOrder[b.listPos] ?? 9);
        }
        case 'class': {
          const classOrder: Record<string, number> = { Freshman: 1, Sophomore: 2, Junior: 3, Senior: 4 };
          return (classOrder[a.classYear] ?? 0) - (classOrder[b.classYear] ?? 0);
        }
        default:
          return 0;
      }
    });

    return result;
  }, [roster, filter, sort, searchQuery]);
}

// Helio abbreviation → traditional position mapping for PoolPlayer construction
const POS_ABBREV_TO_TRAD: Record<string, PoolPosition> = {
  PG: 'PG', CG: 'SG', W: 'SF', F: 'PF', B: 'C',
};

export function RosterContent({ onViewChange, teamKR, offKR, defKR, onLogoPress, onLogoLongPress }: { onViewChange?: () => void; teamKR?: number; offKR?: number; defKR?: number; onLogoPress?: () => void; onLogoLongPress?: () => void } = {}) {
  const [activeView, setActiveView] = useState<ViewType>('depth');
  const [selectedSeason, setSelectedSeason] = useState<Season>(CURRENT_SEASON);
  const [searchQuery, setSearchQuery] = useState('');
  const [krSortKey, setKrSortKey] = useState<KrSortKey | null>(null);

  // Player sheet state (for cards/list views)
  const [sheetJersey, setSheetJersey] = useState<string | null>(null);
  const [sheetFitNote, setSheetFitNote] = useState('');
  const [sheetCoachNote, setSheetCoachNote] = useState('');
  const [offStyle, setOffStyle] = useState<OffensiveStyle>('motion_read_react');
  const [defStyle, setDefStyle] = useState<DefensiveStyle>('containment_man');

  const roster = ROSTER_BY_SEASON[selectedSeason];
  const filteredRoster = useMemo(() => {
    let result = [...roster];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => `${p.firstName} ${p.lastName}`.toLowerCase().includes(q));
    }
    if (krSortKey) {
      result.sort((a, b) => getPlayerKrSortValue(b, krSortKey) - getPlayerKrSortValue(a, krSortKey));
    } else {
      result.sort((a, b) => parseInt(a.number, 10) - parseInt(b.number, 10));
    }
    return result;
  }, [roster, searchQuery, krSortKey]);

  const handleViewChange = (view: ViewType) => {
    setActiveView(view);
    onViewChange?.();
  };

  const handleSeasonChange = (season: Season) => {
    setSelectedSeason(season);
    onViewChange?.(); // scroll to top
  };

  const handlePlayerTap = (jersey: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSheetJersey(jersey);
  };

  // Build PoolPlayer from roster data for the sheet
  const sheetPoolPlayer: PoolPlayer | null = useMemo(() => {
    if (!sheetJersey) return null;
    const p = roster.find((r) => r.number === sheetJersey);
    if (!p) return null;
    const tradPos = POS_ABBREV_TO_TRAD[p.listPos] ?? 'SF';
    return {
      id: `roster-${p.number}`,
      firstName: p.firstName,
      lastName: p.lastName,
      position: tradPos,
      height: p.height,
      classYear: p.classYear,
      currentSchool: 'Florida Memorial',
      level: 'NAIA' as const,
      conference: '',
      state: 'FL',
      keyStatLine: '',
      hasFilm: false,
      lastUpdated: '',
      archetype: 'two_way_wing' as any,
    };
  }, [sheetJersey, roster]);

  return (
    <View style={styles.container}>
      {/* Team Identity Header */}
      <View style={styles.teamHeader}>
        <View style={styles.teamNameRow}>
          <Pressable
            onPress={() => { if (onLogoPress) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onLogoPress(); } }}
            onLongPress={() => { if (onLogoLongPress) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onLogoLongPress(); } }}
            delayLongPress={300}
          >
            <Image source={FMU_SEAL} style={styles.headerLogo} resizeMode="contain" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.teamName}>{FMU_TEAM.name}</Text>
            <Text style={styles.teamSubline}>
              {FMU_TEAM.division} {'\u00B7'} {FMU_TEAM.conference}
            </Text>
          </View>
          <View style={styles.teamKRBadge}>
            <Text style={styles.teamKRValue}>{teamKR ?? 74}</Text>
            <Text style={styles.teamKRSplit}>O {offKR ?? 74} · D {defKR ?? 73}</Text>
          </View>
        </View>
        <View style={styles.teamStatsRow}>
          <Text style={styles.teamRecord}>{FMU_TEAM.record}</Text>
          <Text style={styles.teamConfRecord}>({FMU_TEAM.confRecord} conf)</Text>
          <View style={{ backgroundColor: FMU_TEAM.streak.startsWith('W') ? '#4CAF5020' : '#EF444420', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: FMU_TEAM.streak.startsWith('W') ? '#4CAF50' : '#EF4444' }}>
              {FMU_TEAM.streak}
            </Text>
          </View>
          <View style={{ backgroundColor: TEAM_COLORS.white + '10', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: TEAM_COLORS.secondary }}>{FMU_TEAM.tier}</Text>
          </View>
        </View>
      </View>

      {/* Controls: Season + Sort + Search + View */}
      <RosterControls
        activeView={activeView}
        onViewChange={handleViewChange}
        selectedSeason={selectedSeason}
        onSeasonChange={handleSeasonChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        krSortKey={krSortKey}
        onKrSortChange={setKrSortKey}
      />

      {/* Conditional Content */}
      {activeView === 'cards' && <CardsView roster={filteredRoster} krSortKey={krSortKey} onPlayerTap={handlePlayerTap} />}
      {activeView === 'list' && <ListView roster={filteredRoster} onPlayerTap={handlePlayerTap} />}
      {activeView === 'depth' && <UnitsView depthChart={DEPTH_CHART_BY_SEASON[selectedSeason]} />}

      {/* Player Sheet for cards/list views (depth view has its own inside UnitsView) */}
      {activeView !== 'depth' && (
        <PlayerSheet
          visible={!!sheetJersey}
          onClose={() => { setSheetJersey(null); setSheetFitNote(''); setSheetCoachNote(''); }}
          player={sheetPoolPlayer}
          jerseyNumber={sheetJersey ?? undefined}
          offStyle={offStyle}
          defStyle={defStyle}
          onOffStyleChange={setOffStyle}
          onDefStyleChange={setDefStyle}
          fitNote={sheetFitNote}
          onFitNoteChange={setSheetFitNote}
          coachNote={sheetCoachNote}
          onCoachNoteChange={setSheetCoachNote}
          clusterOverride={sheetJersey ? PLAYER_CLUSTERS[sheetJersey] : undefined}
          baseKROverride={sheetJersey ? ROSTER_KR[sheetJersey] : undefined}
          physicals={sheetJersey ? PLAYER_PHYSICALS[sheetJersey] : undefined}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TEAM_COLORS.cardBg,
  },

  // ── Team Identity Header ──
  teamHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: TEAM_COLORS.cardBg,
    gap: 12,
  },
  teamNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 64,
    height: 64,
    marginRight: 14,
  },
  teamName: {
    fontSize: 24,
    fontWeight: '800',
    color: TEAM_COLORS.white,
    letterSpacing: -0.5,
  },
  teamSubline: {
    fontSize: 13,
    fontWeight: '500',
    color: TEAM_COLORS.gray,
    marginTop: 2,
  },
  teamKRBadge: {
    alignItems: 'center',
    backgroundColor: TEAM_COLORS.white + '0F',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  teamKRValue: {
    fontSize: 26,
    fontWeight: '800',
    color: TEAM_COLORS.white,
    lineHeight: 30,
  },
  teamKRSplit: {
    fontSize: 11,
    fontWeight: '600',
    color: TEAM_COLORS.gray,
    marginTop: 2,
  },
  teamStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamRecord: {
    fontSize: 16,
    fontWeight: '700',
    color: TEAM_COLORS.white,
  },
  teamConfRecord: {
    fontSize: 14,
    fontWeight: '500',
    color: TEAM_COLORS.gray,
  },
  teamContextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  teamContext: {
    fontSize: 13,
    color: TEAM_COLORS.gray,
    marginTop: 6,
  },
  seasonDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  seasonDropdownText: {
    fontSize: 13,
    color: TEAM_COLORS.gray,
    fontWeight: '600',
  },
  teamTruth: {
    fontSize: 12,
    color: TEAM_COLORS.gray,
    marginTop: 2,
  },

  // ── Controls Row ──
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 4,
    marginTop: 12,
    backgroundColor: TEAM_COLORS.cardBg,
  },
  pillsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  controlPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
  },
  controlPillActive: {
    backgroundColor: TEAM_COLORS.primary,
  },
  controlPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: TEAM_COLORS.gray,
  },
  controlPillTextActive: {
    color: TEAM_COLORS.white,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    height: 32,
    alignItems: 'center',
    padding: 2,
    marginLeft: 6,
  },
  viewToggleBtn: {
    width: 30,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  viewToggleBtnActive: {
    backgroundColor: '#444',
  },

  // ── Search Bar ──
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: 4,
    marginBottom: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    height: 32,
    paddingHorizontal: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: TEAM_COLORS.white,
    paddingVertical: 0,
  },

  // ── Dropdowns ──
  dropdownOverlay: {
    flex: 1,
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    paddingVertical: 2,
    minWidth: 100,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  dropdownText: {
    fontSize: 13,
    fontWeight: '500',
    color: TEAM_COLORS.gray,
  },


  // ── Player Section (one per player, full-bleed) ──
  playerSection: {
    backgroundColor: TEAM_COLORS.cardBg,
    paddingBottom: 48,
  },

  // ── Identity Block (number + name + position) ──
  identityBlock: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    zIndex: 2,
  },
  numberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerNumber: {
    fontSize: 52,
    fontWeight: '300',
    color: TEAM_COLORS.gray,
    lineHeight: 58,
    marginRight: 12,
    minWidth: 60,
    textAlign: 'center',
  },
  verticalDivider: {
    width: 2,
    height: 50,
    backgroundColor: TEAM_COLORS.gray,
    marginRight: 14,
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
    fontWeight: '500',
    color: TEAM_COLORS.secondary,
    marginTop: 4,
  },
  last3Stats: {
    fontSize: 12,
    fontWeight: '500',
    color: TEAM_COLORS.gray,
    marginTop: 2,
  },

  // ── Photo Area ──
  photoArea: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.95,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginTop: -30,
  },
  photoWrapper: {
    width: SCREEN_WIDTH * 0.55,
    height: SCREEN_WIDTH * 0.55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headshotWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.95,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  sealImage: {
    width: '100%',
    height: '100%',
    opacity: 0.2,
  },
  headshot: {
    width: '85%',
    height: '85%',
  },
  photoGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  photoGradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  photoGradientLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 80,
  },
  photoGradientRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 80,
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
  tableCellStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: TEAM_COLORS.gray,
  },
  tableCellNotes: {
    fontSize: 12,
    color: TEAM_COLORS.gray,
  },

  // ── Grouped List (Depth Chart) ──
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
  groupedRowStarter: {
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  groupedPlayerNameStarter: {
    fontWeight: '700',
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

  // ── Card Badges (class + position + KR) ──
  cardBadgesCol: {
    alignItems: 'flex-end',
    marginLeft: 12,
    gap: 4,
  },
  cardBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardLevelBadge: {
    backgroundColor: '#2A2D35',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cardLevelText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6e6e6e',
    letterSpacing: 0.3,
  },
  cardPosBadge: {
    backgroundColor: '#3A3D45',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cardPosText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#f5f5f5',
  },
  cardKrText: {
    fontSize: 12,
    fontWeight: '700',
    color: TEAM_COLORS.gray,
  },
});
