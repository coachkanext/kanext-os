/**
 * Player Bio Screen
 * ESPN/NCAA-style player profile with identity block, physical stats,
 * current season averages, and expandable career timeline.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, BorderRadius } from '@/constants/theme';
import { TabFooter } from '@/components/tab-footer';
import { FIREBASE_LEADERS, FIREBASE_GAMES } from '@/data/firebase-lincoln';

// ─── Design tokens ───────────────────────────────────────────────────────────

const TEAL = '#ffffff';
const BG = '#0F1115';
const CARD_BG = '#1A1D23';
const WHITE = '#FFFFFF';
const GRAY = '#8A8F98';
const DIVIDER = '#2A2D35';

// ─── Per-player bio data keyed by jersey number ──────────────────────────────

interface CareerSeason {
  year: string;
  school: string;
  division: string;
  current?: boolean;
  gp: number;
  gs: number;
  mpg: number;
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  fgPct: number;
  threePct: number;
  ftPct: number;
}

interface PlayerBio {
  firstName: string;
  lastName: string;
  number: string;
  position: string;
  classYear: string;
  height: string;
  weight: string;
  hometown: string;
  highSchool: string;
  about: string;
  highlights: string[];
  socials: { instagram?: string; x?: string; linkedin?: string };
  season: { ppg: number; rpg: number; apg: number; fgPct: number };
  career: CareerSeason[];
}

// Build season stats lookup from Firebase canonical data
const fbLookup = Object.fromEntries(FIREBASE_LEADERS.map((l) => [l.number, l]));

// Last 3 final games (most recent first)
interface Last3Game { opponent: string; pts: number; reb: number; ast: number }
const LAST_3_GAMES_RAW = FIREBASE_GAMES
  .filter((g) => g.status === 'final' && g.boxScore)
  .slice(-3)
  .reverse();

function getLast3(playerNumber: string): Last3Game[] {
  return LAST_3_GAMES_RAW.map((g) => {
    const ps = g.boxScore!.playerStats.find((p) => p.playerNumber === playerNumber);
    if (!ps) return null;
    return { opponent: g.opponent, pts: ps.points, reb: ps.rebounds, ast: ps.assists };
  }).filter(Boolean) as Last3Game[];
}

const PLAYER_BIOS: Record<string, PlayerBio> = {
  '1': {
    firstName: 'Brandon', lastName: 'Williams', number: '1',
    position: 'Guard', classYear: 'Sophomore',
    height: '6\'4"', weight: '185 lbs', hometown: 'Oakland, CA',
    highSchool: 'Oakland Tech HS',
    about: 'A dynamic two-way guard, Brandon has quickly established himself as one of Lincoln\'s most versatile players. His combination of size and athleticism makes him a matchup nightmare on both ends of the floor. He leads the team in rebounds and steals while being the second-leading scorer.',
    highlights: ['34-point, 20-rebound game vs Cal Miramar (Game 10)', 'Team leader in steals (2.7 SPG) and rebounds (7.6 RPG)', 'Shooting 59.4% from the field — best on the team'],
    socials: { instagram: 'bwilliams_1', x: 'BWilliams1Hoops' },
    season: { ppg: fbLookup['1'].ppg, rpg: fbLookup['1'].rpg, apg: fbLookup['1'].apg, fgPct: fbLookup['1'].fgPct },
    career: [
      { year: '2025-26', school: 'Lincoln University', division: 'NAIA', current: true, gp: fbLookup['1'].gamesPlayed, gs: 12, mpg: 0, ppg: fbLookup['1'].ppg, rpg: fbLookup['1'].rpg, apg: fbLookup['1'].apg, spg: fbLookup['1'].spg, bpg: fbLookup['1'].bpg, fgPct: fbLookup['1'].fgPct, threePct: fbLookup['1'].threePct, ftPct: fbLookup['1'].ftPct },
    ],
  },
  '2': {
    firstName: 'Chris', lastName: 'Plantey', number: '2',
    position: 'Guard', classYear: 'Freshman',
    height: 'N/A', weight: 'N/A', hometown: 'N/A',
    highSchool: 'N/A',
    about: 'Chris is a steady floor general who controls the tempo and finds open teammates. He leads the team in assist-to-turnover ratio and provides reliable ball handling off the bench.',
    highlights: ['8 points and 3 assists vs Cal Miramar (Game 9)', '6 points on 2-2 shooting vs Cal Maritime (Game 5)'],
    socials: {},
    season: { ppg: fbLookup['2'].ppg, rpg: fbLookup['2'].rpg, apg: fbLookup['2'].apg, fgPct: fbLookup['2'].fgPct },
    career: [
      { year: '2025-26', school: 'Lincoln University', division: 'NAIA', current: true, gp: fbLookup['2'].gamesPlayed, gs: 0, mpg: 0, ppg: fbLookup['2'].ppg, rpg: fbLookup['2'].rpg, apg: fbLookup['2'].apg, spg: fbLookup['2'].spg, bpg: fbLookup['2'].bpg, fgPct: fbLookup['2'].fgPct, threePct: fbLookup['2'].threePct, ftPct: fbLookup['2'].ftPct },
    ],
  },
  '3': {
    firstName: 'Claude', lastName: 'McKesey', number: '3',
    position: 'Guard', classYear: 'N/A',
    height: 'N/A', weight: 'N/A', hometown: 'N/A',
    highSchool: 'N/A',
    about: 'Claude is the team\'s primary facilitator, leading Lincoln in assists at 5.0 per game. A scrappy, competitive guard who rebounds well above his size and makes winning plays on both ends of the floor.',
    highlights: ['23 points and 6 assists vs Cal Miramar (Game 9)', '14 points and 10 assists (double-double) vs Cal Maritime (Game 5)', 'Team leader in assists (5.0 APG)'],
    socials: {},
    season: { ppg: fbLookup['3'].ppg, rpg: fbLookup['3'].rpg, apg: fbLookup['3'].apg, fgPct: fbLookup['3'].fgPct },
    career: [
      { year: '2025-26', school: 'Lincoln University', division: 'NAIA', current: true, gp: fbLookup['3'].gamesPlayed, gs: 12, mpg: 0, ppg: fbLookup['3'].ppg, rpg: fbLookup['3'].rpg, apg: fbLookup['3'].apg, spg: fbLookup['3'].spg, bpg: fbLookup['3'].bpg, fgPct: fbLookup['3'].fgPct, threePct: fbLookup['3'].threePct, ftPct: fbLookup['3'].ftPct },
    ],
  },
  '5': {
    firstName: 'Samuel', lastName: 'Manzo', number: '5',
    position: 'Guard', classYear: 'N/A',
    height: 'N/A', weight: 'N/A', hometown: 'N/A',
    highSchool: 'N/A',
    about: 'N/A',
    highlights: [],
    socials: {},
    season: { ppg: fbLookup['5'].ppg, rpg: fbLookup['5'].rpg, apg: fbLookup['5'].apg, fgPct: fbLookup['5'].fgPct },
    career: [
      { year: '2025-26', school: 'Lincoln University', division: 'NAIA', current: true, gp: fbLookup['5'].gamesPlayed, gs: 0, mpg: 0, ppg: fbLookup['5'].ppg, rpg: fbLookup['5'].rpg, apg: fbLookup['5'].apg, spg: fbLookup['5'].spg, bpg: fbLookup['5'].bpg, fgPct: fbLookup['5'].fgPct, threePct: fbLookup['5'].threePct, ftPct: fbLookup['5'].ftPct },
    ],
  },
  '6': {
    firstName: 'Samuel', lastName: 'Wall', number: '6',
    position: 'Guard', classYear: 'N/A',
    height: 'N/A', weight: 'N/A', hometown: 'N/A',
    highSchool: 'N/A',
    about: 'Samuel is a reliable guard who contributes across the stat sheet. He shoots over 85% from the free throw line and 41.7% from three, making him one of the team\'s most efficient perimeter shooters.',
    highlights: ['11 points on 3-6 from three vs Cal Maritime (Game 5)', '9 points, 2 rebounds, 1 assist vs Cal Miramar (Game 10)', 'Team-best 85.7% FT shooter'],
    socials: {},
    season: { ppg: fbLookup['6'].ppg, rpg: fbLookup['6'].rpg, apg: fbLookup['6'].apg, fgPct: fbLookup['6'].fgPct },
    career: [
      { year: '2025-26', school: 'Lincoln University', division: 'NAIA', current: true, gp: fbLookup['6'].gamesPlayed, gs: 0, mpg: 0, ppg: fbLookup['6'].ppg, rpg: fbLookup['6'].rpg, apg: fbLookup['6'].apg, spg: fbLookup['6'].spg, bpg: fbLookup['6'].bpg, fgPct: fbLookup['6'].fgPct, threePct: fbLookup['6'].threePct, ftPct: fbLookup['6'].ftPct },
    ],
  },
  '10': {
    firstName: 'Adrian', lastName: 'Hernandez', number: '10',
    position: 'Guard', classYear: 'N/A',
    height: 'N/A', weight: 'N/A', hometown: 'N/A',
    highSchool: 'N/A',
    about: 'Adrian is a perimeter shooter who can get hot from three. He provides scoring punch off the bench and has quick hands on defense with 1.5 steals per game.',
    highlights: ['13 points on 4-9 from three vs Cal Miramar (Game 9)', '13 points and 4 three-pointers vs Cal Maritime (Game 8)', '10 points, 5 rebounds, 4 assists vs Simpson University'],
    socials: {},
    season: { ppg: fbLookup['10'].ppg, rpg: fbLookup['10'].rpg, apg: fbLookup['10'].apg, fgPct: fbLookup['10'].fgPct },
    career: [
      { year: '2025-26', school: 'Lincoln University', division: 'NAIA', current: true, gp: fbLookup['10'].gamesPlayed, gs: 0, mpg: 0, ppg: fbLookup['10'].ppg, rpg: fbLookup['10'].rpg, apg: fbLookup['10'].apg, spg: fbLookup['10'].spg, bpg: fbLookup['10'].bpg, fgPct: fbLookup['10'].fgPct, threePct: fbLookup['10'].threePct, ftPct: fbLookup['10'].ftPct },
    ],
  },
  '11': {
    firstName: 'Laolu', lastName: 'Kalejaiye', number: '11',
    position: 'Guard', classYear: 'N/A',
    height: 'N/A', weight: 'N/A', hometown: 'N/A',
    highSchool: 'N/A',
    about: 'Laolu is Lincoln\'s leading scorer at 24.8 points per game. An elite shot creator who can score from all three levels, he combines deep three-point range with the ability to get to the free throw line. He shot 12-19 from three against Pepperdine for 38 points.',
    highlights: ['38 points on 12 three-pointers vs Pepperdine', '35 points and 17-17 FT vs Cal Maritime (Game 8)', '33 points, 8 assists, 15-19 FT vs Ohlone', 'Team leader in scoring (24.8 PPG)'],
    socials: {},
    season: { ppg: fbLookup['11'].ppg, rpg: fbLookup['11'].rpg, apg: fbLookup['11'].apg, fgPct: fbLookup['11'].fgPct },
    career: [
      { year: '2025-26', school: 'Lincoln University', division: 'NAIA', current: true, gp: fbLookup['11'].gamesPlayed, gs: 12, mpg: 0, ppg: fbLookup['11'].ppg, rpg: fbLookup['11'].rpg, apg: fbLookup['11'].apg, spg: fbLookup['11'].spg, bpg: fbLookup['11'].bpg, fgPct: fbLookup['11'].fgPct, threePct: fbLookup['11'].threePct, ftPct: fbLookup['11'].ftPct },
    ],
  },
  '15': {
    firstName: 'Nathan', lastName: 'Chtelan', number: '15',
    position: 'Forward', classYear: 'N/A',
    height: 'N/A', weight: 'N/A', hometown: 'N/A',
    highSchool: 'N/A',
    about: 'Nathan is Lincoln\'s anchor in the paint — the team\'s leading rebounder and shot blocker. He shoots nearly 59% from the field and finishes around the rim at an elite rate. His defensive presence changes the game for opponents driving the lane.',
    highlights: ['28 points, 8 rebounds on 11-13 shooting vs Cal Miramar (Game 9)', '16 points and 5 rebounds vs UC Irvine', 'Team leader in blocks (1.1 BPG) and FG% (58.9%)'],
    socials: {},
    season: { ppg: fbLookup['15'].ppg, rpg: fbLookup['15'].rpg, apg: fbLookup['15'].apg, fgPct: fbLookup['15'].fgPct },
    career: [
      { year: '2025-26', school: 'Lincoln University', division: 'NAIA', current: true, gp: fbLookup['15'].gamesPlayed, gs: 12, mpg: 0, ppg: fbLookup['15'].ppg, rpg: fbLookup['15'].rpg, apg: fbLookup['15'].apg, spg: fbLookup['15'].spg, bpg: fbLookup['15'].bpg, fgPct: fbLookup['15'].fgPct, threePct: fbLookup['15'].threePct, ftPct: fbLookup['15'].ftPct },
    ],
  },
  '20': {
    firstName: 'Nicholas', lastName: 'Bansraj', number: '20',
    position: 'Guard', classYear: 'N/A',
    height: 'N/A', weight: 'N/A', hometown: 'N/A',
    highSchool: 'N/A',
    about: 'N/A',
    highlights: [],
    socials: {},
    season: { ppg: fbLookup['20'].ppg, rpg: fbLookup['20'].rpg, apg: fbLookup['20'].apg, fgPct: fbLookup['20'].fgPct },
    career: [
      { year: '2025-26', school: 'Lincoln University', division: 'NAIA', current: true, gp: fbLookup['20'].gamesPlayed, gs: 0, mpg: 0, ppg: fbLookup['20'].ppg, rpg: fbLookup['20'].rpg, apg: fbLookup['20'].apg, spg: fbLookup['20'].spg, bpg: fbLookup['20'].bpg, fgPct: fbLookup['20'].fgPct, threePct: fbLookup['20'].threePct, ftPct: fbLookup['20'].ftPct },
    ],
  },
  '21': {
    firstName: 'Paul', lastName: 'Diomande', number: '21',
    position: 'Forward', classYear: 'N/A',
    height: 'N/A', weight: 'N/A', hometown: 'N/A',
    highSchool: 'N/A',
    about: 'Paul is a physical forward who brings energy and toughness in the frontcourt. He shoots 44.4% from the field and contributes on the boards with 3.2 rebounds per game. He appeared in 11 of 12 games this season.',
    highlights: ['8 points and 5 rebounds vs Cal Miramar (Game 9)', '6 points, 3 rebounds, 2-2 FG vs Cal Miramar (Game 10)', '6 points and 3 rebounds vs UC Irvine'],
    socials: {},
    season: { ppg: fbLookup['21'].ppg, rpg: fbLookup['21'].rpg, apg: fbLookup['21'].apg, fgPct: fbLookup['21'].fgPct },
    career: [
      { year: '2025-26', school: 'Lincoln University', division: 'NAIA', current: true, gp: fbLookup['21'].gamesPlayed, gs: 0, mpg: 0, ppg: fbLookup['21'].ppg, rpg: fbLookup['21'].rpg, apg: fbLookup['21'].apg, spg: fbLookup['21'].spg, bpg: fbLookup['21'].bpg, fgPct: fbLookup['21'].fgPct, threePct: fbLookup['21'].threePct, ftPct: fbLookup['21'].ftPct },
    ],
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function PlayerBioScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { number } = useLocalSearchParams<{ number: string }>();
  const [expandedYear, setExpandedYear] = useState<string | null>(null);

  const player = PLAYER_BIOS[number ?? ''];

  if (!player) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Player not found</Text>
      </View>
    );
  }

  const toggleYear = (year: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedYear((prev) => (prev === year ? null : year));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <IconSymbol name="chevron.left" size={18} color={TEAL} />
          <Text style={styles.backLabel}>Roster</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Player Identity ── */}
        <View style={styles.identityRow}>
          <View style={styles.jerseyBox}>
            <Text style={styles.jerseyHash}>#</Text>
            <Text style={styles.jerseyNumber}>{player.number}</Text>
          </View>
          <View style={styles.identityText}>
            <Text style={styles.playerName}>
              {player.firstName} {player.lastName}
            </Text>
            <Text style={styles.playerMeta}>
              {player.position} · {player.classYear}
            </Text>
            <Text style={styles.teamLink}>Lincoln University Oakland</Text>
          </View>
        </View>

        {/* ── Physical Stats ── */}
        <View style={styles.card}>
          <View style={styles.threeCol}>
            <View style={styles.colItem}>
              <Text style={styles.colValue}>{player.height}</Text>
              <Text style={styles.colLabel}>Height</Text>
            </View>
            <View style={[styles.colDivider, { backgroundColor: DIVIDER }]} />
            <View style={styles.colItem}>
              <Text style={styles.colValue}>{player.weight}</Text>
              <Text style={styles.colLabel}>Weight</Text>
            </View>
            <View style={[styles.colDivider, { backgroundColor: DIVIDER }]} />
            <View style={styles.colItem}>
              <Text style={styles.colValue}>{player.hometown}</Text>
              <Text style={styles.colLabel}>Hometown</Text>
            </View>
          </View>
        </View>

        {/* ── Current Season ── */}
        <Text style={styles.sectionLabel}>CURRENT SEASON</Text>
        <View style={styles.card}>
          <View style={styles.fourCol}>
            <View style={styles.statCol}>
              <Text style={styles.statValue}>{player.season.ppg.toFixed(1)}</Text>
              <Text style={styles.statLabel}>PPG</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statValue}>{player.season.rpg.toFixed(1)}</Text>
              <Text style={styles.statLabel}>RPG</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statValue}>{player.season.apg.toFixed(1)}</Text>
              <Text style={styles.statLabel}>APG</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={[styles.statValue, styles.statValueDark]}>{player.season.fgPct.toFixed(1)}%</Text>
              <Text style={styles.statLabel}>FG%</Text>
            </View>
          </View>
        </View>

        {/* ── Last 3 Games ── */}
        {(() => {
          const last3 = getLast3(player.number);
          if (last3.length === 0) return null;
          return (
            <>
              <Text style={styles.sectionLabel}>LAST 3 GAMES</Text>
              <View style={styles.card}>
                {/* Header */}
                <View style={styles.last3Header}>
                  <Text style={[styles.last3HeaderCell, { flex: 1 }]}>OPP</Text>
                  <Text style={styles.last3HeaderCell}>PTS</Text>
                  <Text style={styles.last3HeaderCell}>REB</Text>
                  <Text style={styles.last3HeaderCell}>AST</Text>
                </View>
                {last3.map((g, idx) => (
                  <View key={idx}>
                    <View style={[styles.rowDivider, { backgroundColor: DIVIDER }]} />
                    <View style={styles.last3Row}>
                      <Text style={[styles.last3Opp, { flex: 1 }]} numberOfLines={1}>{g.opponent}</Text>
                      <Text style={styles.last3Stat}>{g.pts}</Text>
                      <Text style={styles.last3Stat}>{g.reb}</Text>
                      <Text style={styles.last3Stat}>{g.ast}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          );
        })()}

        {/* ── Career Timeline ── */}
        <Text style={styles.sectionLabel}>CAREER TIMELINE</Text>
        <View style={styles.card}>
          {player.career.map((season, idx) => {
            const isExpanded = expandedYear === season.year;
            const isLast = idx === player.career.length - 1;

            return (
              <View key={season.year}>
                {idx > 0 && <View style={[styles.rowDivider, { backgroundColor: DIVIDER }]} />}

                {/* Year row */}
                <Pressable
                  style={({ pressed }) => [
                    styles.yearRow,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => toggleYear(season.year)}
                >
                  <View style={styles.yearLeft}>
                    <View style={styles.yearTitleRow}>
                      <Text style={[styles.yearText, !season.current && styles.yearTextPast]}>
                        {season.year}
                      </Text>
                      {season.current && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>Current</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.yearSchool} numberOfLines={1}>
                      {season.school} · {season.division}
                    </Text>
                  </View>
                  <View style={styles.yearRight}>
                    <View style={styles.yearPpgBlock}>
                      <Text style={styles.yearPpgValue}>{season.ppg.toFixed(1)}</Text>
                      <Text style={styles.yearPpgLabel}>PPG</Text>
                    </View>
                    <IconSymbol
                      name={isExpanded ? 'chevron.up' : 'chevron.down'}
                      size={14}
                      color={GRAY}
                    />
                  </View>
                </Pressable>

                {/* Expanded detail */}
                {isExpanded && (
                  <View style={styles.expandedDetail}>
                    {/* Row 1: main stats */}
                    <View style={styles.detailGrid}>
                      <StatCell label="GP" value={String(season.gp)} />
                      <StatCell label="GS" value={String(season.gs)} />
                      <StatCell label="MPG" value={season.mpg.toFixed(1)} />
                      <StatCell label="PPG" value={season.ppg.toFixed(1)} accent />
                      <StatCell label="RPG" value={season.rpg.toFixed(1)} accent />
                      <StatCell label="APG" value={season.apg.toFixed(1)} accent />
                      <StatCell label="SPG" value={season.spg.toFixed(1)} />
                    </View>
                    {/* Row 2: BPG */}
                    <View style={styles.detailGrid}>
                      <StatCell label="BPG" value={season.bpg.toFixed(1)} />
                    </View>
                    {/* Divider */}
                    <View style={[styles.expandedDivider, { backgroundColor: DIVIDER }]} />
                    {/* Shooting row */}
                    <View style={styles.detailGrid}>
                      <StatCell label="FG%" value={`${season.fgPct.toFixed(1)}%`} />
                      <StatCell label="3P%" value={`${season.threePct.toFixed(1)}%`} />
                      <StatCell label="FT%" value={`${season.ftPct.toFixed(1)}%`} />
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* ── Highlights ── */}
        <Text style={styles.sectionLabel}>HIGHLIGHTS</Text>
        <View style={styles.card}>
          {player.highlights.map((item, idx) => (
            <View key={idx}>
              {idx > 0 && <View style={[styles.bgDivider, { backgroundColor: DIVIDER }]} />}
              <View style={styles.highlightRow}>
                <Text style={styles.highlightBullet}>{'\u2022'}</Text>
                <Text style={styles.highlightText}>{item}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── About ── */}
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={styles.card}>
          <Text style={styles.aboutText}>{player.about}</Text>
        </View>

        {/* ── Background ── */}
        <Text style={styles.sectionLabel}>BACKGROUND</Text>
        <View style={styles.card}>
          <View style={styles.bgRow}>
            <Text style={styles.bgLabel}>High School</Text>
            <Text style={styles.bgValue}>{player.highSchool}</Text>
          </View>
          <View style={[styles.bgDivider, { backgroundColor: DIVIDER }]} />
          <View style={styles.bgRow}>
            <Text style={styles.bgLabel}>Hometown</Text>
            <Text style={styles.bgValue}>{player.hometown}</Text>
          </View>
        </View>

        {/* ── Social Links ── */}
        {(player.socials.instagram || player.socials.x || player.socials.linkedin) && (
          <View style={styles.socialsRow}>
            {player.socials.instagram && (
              <View style={styles.socialPill}>
                <Text style={styles.socialEmoji}>{'\uD83D\uDCF7'}</Text>
                <Text style={styles.socialHandle}>@{player.socials.instagram}</Text>
              </View>
            )}
            {player.socials.x && (
              <View style={styles.socialPill}>
                <Text style={styles.socialEmoji}>{'\uD835\uDD4F'}</Text>
                <Text style={styles.socialHandle}>@{player.socials.x}</Text>
              </View>
            )}
            {player.socials.linkedin && (
              <View style={styles.socialPill}>
                <Text style={styles.socialEmoji}>{'\uD83D\uDCBC'}</Text>
                <Text style={styles.socialHandle}>{player.socials.linkedin}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
      <TabFooter activeTab="Home" />
    </View>
  );
}

// ─── Stat cell helper ────────────────────────────────────────────────────────

function StatCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={styles.detailCell}>
      <Text style={[styles.detailValue, accent && { color: TEAL }]}>{value}</Text>
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  errorText: {
    color: WHITE,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },

  // Header
  header: {
    backgroundColor: BG,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DIVIDER,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: 4,
  },
  backLabel: {
    fontSize: 17,
    color: TEAL,
  },

  scrollView: {
    flex: 1,
  },

  // Identity block
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: 14,
  },
  jerseyBox: {
    width: 64,
    height: 64,
    backgroundColor: TEAL,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  jerseyHash: {
    fontSize: 18,
    fontWeight: '600',
    color: WHITE,
    marginRight: 1,
    marginTop: -2,
  },
  jerseyNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: WHITE,
  },
  identityText: {
    flex: 1,
  },
  playerName: {
    fontSize: 22,
    fontWeight: '700',
    color: WHITE,
  },
  playerMeta: {
    fontSize: 14,
    color: GRAY,
    marginTop: 2,
  },
  teamLink: {
    fontSize: 14,
    fontWeight: '600',
    color: TEAL,
    marginTop: 2,
  },

  // Cards
  card: {
    backgroundColor: CARD_BG,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: GRAY,
    letterSpacing: 0.5,
    marginLeft: Spacing.md + 4,
    marginBottom: 10,
    marginTop: 8,
  },

  // 3-column (physical)
  threeCol: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  colItem: {
    flex: 1,
    alignItems: 'center',
  },
  colValue: {
    fontSize: 15,
    fontWeight: '600',
    color: WHITE,
    textAlign: 'center',
  },
  colLabel: {
    fontSize: 12,
    color: GRAY,
    marginTop: 4,
  },
  colDivider: {
    width: 1,
    height: 32,
  },

  // 4-column (current season)
  fourCol: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: TEAL,
  },
  statValueDark: {
    color: WHITE,
  },
  statLabel: {
    fontSize: 12,
    color: GRAY,
    marginTop: 4,
  },

  // Last 3 Games
  last3Header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
  },
  last3HeaderCell: {
    fontSize: 11,
    fontWeight: '700',
    color: GRAY,
    letterSpacing: 0.5,
    width: 48,
    textAlign: 'center',
  },
  last3Row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
  },
  last3Opp: {
    fontSize: 14,
    fontWeight: '500',
    color: WHITE,
  },
  last3Stat: {
    fontSize: 15,
    fontWeight: '600',
    color: WHITE,
    width: 48,
    textAlign: 'center',
  },

  // Career timeline
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.md,
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
  },
  yearLeft: {
    flex: 1,
    marginRight: 12,
  },
  yearTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  yearText: {
    fontSize: 17,
    fontWeight: '700',
    color: TEAL,
  },
  yearTextPast: {
    color: WHITE,
  },
  currentBadge: {
    backgroundColor: TEAL,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: WHITE,
  },
  yearRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  yearSchool: {
    fontSize: 13,
    color: GRAY,
  },
  yearPpgBlock: {
    alignItems: 'center',
  },
  yearPpgValue: {
    fontSize: 17,
    fontWeight: '700',
    color: TEAL,
  },
  yearPpgLabel: {
    fontSize: 11,
    color: GRAY,
    marginTop: 1,
  },

  // Expanded detail
  expandedDetail: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  detailCell: {
    width: 56,
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: WHITE,
  },
  detailLabel: {
    fontSize: 10,
    color: GRAY,
    marginTop: 2,
  },
  expandedDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 8,
  },

  // About
  aboutText: {
    fontSize: 15,
    lineHeight: 22,
    color: GRAY,
    padding: Spacing.md,
  },

  // Background
  bgRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
  },
  bgLabel: {
    fontSize: 15,
    color: GRAY,
  },
  bgValue: {
    fontSize: 15,
    fontWeight: '600',
    color: WHITE,
  },
  bgDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md,
  },

  // Highlights
  highlightRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
  },
  highlightBullet: {
    fontSize: 15,
    color: TEAL,
    marginRight: 10,
    lineHeight: 22,
  },
  highlightText: {
    fontSize: 15,
    color: WHITE,
    flex: 1,
    lineHeight: 22,
  },

  // Social links
  socialsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
    marginHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  socialPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: BorderRadius.full,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 6,
  },
  socialEmoji: {
    fontSize: 16,
  },
  socialHandle: {
    fontSize: 13,
    color: GRAY,
  },
});
