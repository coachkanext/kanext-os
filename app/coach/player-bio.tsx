/**
 * Player Bio Screen
 * ESPN/NCAA-style player profile with headshot, vitals,
 * current season averages, last 3 games, and career timeline.
 * Data: Florida Memorial University Lions
 */

import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, BorderRadius } from '@/constants/theme';
import { TabFooter } from '@/components/tab-footer';
import {
  FMU_LEADERS,
  FMU_PLAYER_BIOS,
  FMU_PLAYER_ABOUT,
  getFmuLast3,
  getFmuCareer,
  getFmuHighlights,
  getFmuTS,
} from '@/data/fmu';

// ─── Design tokens ───────────────────────────────────────────────────────────

const TEAL = '#ffffff';
const BG = '#0F1115';
const CARD_BG = '#1A1D23';
const WHITE = '#FFFFFF';
const GRAY = '#8A8F98';
const DIVIDER = '#2A2D35';

// ─── Headshots (same map as roster-content) ──────────────────────────────────

const FMU_SEAL = require('@/assets/images/fmu-seal.png');
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Normalize jersey: strip leading zeros, '00'→'0', '04'→'4' */
function normalizeJersey(j: string): string {
  const n = parseInt(j, 10);
  return isNaN(n) ? j : String(n);
}

/** Build leaders lookup keyed by normalized jersey */
const leadersLookup: Record<string, typeof FMU_LEADERS[number]> = {};
for (const l of FMU_LEADERS) {
  leadersLookup[normalizeJersey(l.number)] = l;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function PlayerBioScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { number } = useLocalSearchParams<{ number: string }>();
  const [expandedYear, setExpandedYear] = useState<string | null>(null);

  const jersey = normalizeJersey(number ?? '');
  const bio = FMU_PLAYER_BIOS[jersey];
  const leader = leadersLookup[jersey];

  if (!bio) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Player not found</Text>
      </View>
    );
  }

  const headshot = HEADSHOTS[jersey] ?? FMU_SEAL;
  const last3 = getFmuLast3(jersey);
  const career = getFmuCareer(jersey);
  const highlights = getFmuHighlights(jersey);
  const about = FMU_PLAYER_ABOUT[jersey];

  // Current season stats
  const ppg = leader?.ppg ?? 0;
  const rpg = leader?.rpg ?? 0;
  const apg = leader?.apg ?? 0;
  const tsPct = getFmuTS(jersey);

  const toggleYear = (year: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedYear((prev) => (prev === year ? null : year));
  };

  return (
    <View style={styles.container}>
      {/* Back row — sits below the global header */}
      <View style={styles.backRow}>
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
        {/* ── 1. Player Header (Photo + Identity) ── */}
        <View style={styles.identityRow}>
          <View style={styles.headshotWrap}>
            <Image source={headshot} style={styles.headshot} />
          </View>
          <View style={styles.identityText}>
            <View style={styles.nameRow}>
              <Text style={styles.playerName}>
                {bio.firstName} {bio.lastName}
              </Text>
              <Pressable
                style={({ pressed }) => [styles.tvButton, pressed && { opacity: 0.6 }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(tabs)/media');
                }}
              >
                <IconSymbol name="play.tv" size={18} color={WHITE} />
              </Pressable>
            </View>
            <Text style={styles.playerMeta}>
              #{bio.number} · {bio.position} · {bio.classYear}
            </Text>
            <Text style={styles.teamLink}>Florida Memorial University</Text>
          </View>
        </View>

        {/* ── 2. Vitals ── */}
        <View style={styles.card}>
          <View style={styles.threeCol}>
            <View style={styles.colItem}>
              <Text style={styles.colValue}>{bio.height}</Text>
              <Text style={styles.colLabel}>Height</Text>
            </View>
            <View style={[styles.colDivider, { backgroundColor: DIVIDER }]} />
            <View style={styles.colItem}>
              <Text style={styles.colValue}>{bio.weight}</Text>
              <Text style={styles.colLabel}>Weight</Text>
            </View>
            <View style={[styles.colDivider, { backgroundColor: DIVIDER }]} />
            <View style={styles.colItem}>
              <Text style={styles.colValue}>{bio.hometown}</Text>
              <Text style={styles.colLabel}>Hometown</Text>
            </View>
          </View>
        </View>

        {/* ── 3. Current Season ── */}
        {leader && (
          <>
            <Text style={styles.sectionLabel}>CURRENT SEASON</Text>
            <View style={styles.card}>
              <View style={styles.fourCol}>
                <View style={styles.statCol}>
                  <Text style={styles.statValue}>{ppg.toFixed(1)}</Text>
                  <Text style={styles.statLabel}>PPG</Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={styles.statValue}>{rpg.toFixed(1)}</Text>
                  <Text style={styles.statLabel}>RPG</Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={styles.statValue}>{apg.toFixed(1)}</Text>
                  <Text style={styles.statLabel}>APG</Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={[styles.statValue, styles.statValueDark]}>
                    {tsPct.toFixed(1)}%
                  </Text>
                  <Text style={styles.statLabel}>TS%</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* ── 4. Last 3 Games ── */}
        {last3.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>LAST 3 GAMES</Text>
            <View style={styles.card}>
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
                    <Text style={[styles.last3Opp, { flex: 1 }]} numberOfLines={1}>
                      {g.opponent}
                    </Text>
                    <Text style={styles.last3Stat}>{g.pts}</Text>
                    <Text style={styles.last3Stat}>{g.reb}</Text>
                    <Text style={styles.last3Stat}>{g.ast}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── 5. Career Timeline ── */}
        {career.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>CAREER TIMELINE</Text>
            <View style={styles.card}>
              {career.map((season, idx) => {
                const isExpanded = expandedYear === season.year;

                return (
                  <View key={season.year}>
                    {idx > 0 && (
                      <View style={[styles.rowDivider, { backgroundColor: DIVIDER }]} />
                    )}

                    <Pressable
                      style={({ pressed }) => [
                        styles.yearRow,
                        pressed && { opacity: 0.7 },
                      ]}
                      onPress={() => toggleYear(season.year)}
                    >
                      <View style={styles.yearLeft}>
                        <View style={styles.yearTitleRow}>
                          <Text
                            style={[styles.yearText, !season.current && styles.yearTextPast]}
                          >
                            {season.year}
                          </Text>
                          {season.current && career.length > 1 && (
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

                    {isExpanded && (
                      <View style={styles.expandedDetail}>
                        <View style={styles.detailGrid}>
                          <StatCell label="GP" value={String(season.gp)} />
                          <StatCell label="GS" value={String(season.gs)} />
                          <StatCell label="MPG" value={season.mpg.toFixed(1)} />
                          <StatCell label="PPG" value={season.ppg.toFixed(1)} accent />
                          <StatCell label="RPG" value={season.rpg.toFixed(1)} accent />
                          <StatCell label="APG" value={season.apg.toFixed(1)} accent />
                          <StatCell label="SPG" value={season.spg.toFixed(1)} />
                        </View>
                        <View style={styles.detailGrid}>
                          <StatCell label="BPG" value={season.bpg.toFixed(1)} />
                        </View>
                        <View style={[styles.expandedDivider, { backgroundColor: DIVIDER }]} />
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
          </>
        )}

        {/* ── 6. Season Highlights ── */}
        {highlights.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>SEASON HIGHLIGHTS</Text>
            <View style={styles.card}>
              {highlights.map((item, idx) => (
                <View key={idx}>
                  {idx > 0 && <View style={[styles.bgDivider, { backgroundColor: DIVIDER }]} />}
                  <View style={styles.highlightRow}>
                    <Text style={styles.highlightBullet}>{'\u2022'}</Text>
                    <Text style={styles.highlightText}>{item}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── 7. About ── */}
        {about && (
          <>
            <Text style={styles.sectionLabel}>ABOUT</Text>
            <View style={styles.card}>
              <Text style={styles.aboutText}>{about}</Text>
            </View>
          </>
        )}

        {/* ── 8. Background ── */}
        <Text style={styles.sectionLabel}>BACKGROUND</Text>
        <View style={styles.card}>
          <View style={styles.bgRow}>
            <Text style={styles.bgLabel}>High School</Text>
            <Text style={styles.bgValue}>{bio.highSchool}</Text>
          </View>
          {bio.previousSchool && (
            <>
              <View style={[styles.bgDivider, { backgroundColor: DIVIDER }]} />
              <View style={styles.bgRow}>
                <Text style={styles.bgLabel}>Previous School</Text>
                <Text style={styles.bgValue}>{bio.previousSchool}</Text>
              </View>
            </>
          )}
        </View>

        {/* ── 9. Socials ── */}
        <View style={styles.socialsRow}>
          <View style={styles.socialPill}>
            <Text style={styles.socialIcon}>{'\uD835\uDD4F'}</Text>
            <Text style={styles.socialHandle}>FMU Lions</Text>
          </View>
          <View style={styles.socialPill}>
            <Text style={styles.socialIcon}>{'\uD83D\uDCF7'}</Text>
            <Text style={styles.socialHandle}>@faborlions</Text>
          </View>
          <View style={styles.socialPill}>
            <Text style={styles.socialIcon}>{'\uD83C\uDFC0'}</Text>
            <Text style={styles.socialHandle}>FMU Athletics</Text>
          </View>
        </View>
      </ScrollView>
      <TabFooter activeTab="Home" />
    </View>
  );
}

// ─── Stat cell helper ────────────────────────────────────────────────────────

function StatCell({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
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

  // Back row
  backRow: {
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

  // Identity block (with headshot)
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: 14,
  },
  headshotWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: CARD_BG,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headshot: {
    width: 56,
    height: 56,
    resizeMode: 'contain',
  },
  identityText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playerName: {
    fontSize: 22,
    fontWeight: '700',
    color: WHITE,
  },
  tvButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
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

  // 3-column (vitals)
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
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
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

  // About
  aboutText: {
    fontSize: 15,
    lineHeight: 22,
    color: GRAY,
    padding: Spacing.md,
  },

  // Socials
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
  socialIcon: {
    fontSize: 16,
  },
  socialHandle: {
    fontSize: 13,
    color: GRAY,
  },
});
