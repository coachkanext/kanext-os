/**
 * Player Bio Screen
 * ESPN/NCAA-style player profile with headshot, vitals,
 * current season averages, last 3 games, and career timeline.
 * Data: KaNeXT
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
  KaNeXT_LEADERS,
  KaNeXT_PLAYER_BIOS,
  KaNeXT_PLAYER_ABOUT,
  getFmuSeasonGames,
  getFmuCareer,
  getFmuHighlights,
  getFmuAwards,
  getFmuTS,
  getPGISColor,
  ROSTER_KR,
} from '@/data/fmu';
import { PLAYER_CLUSTERS, getPlayerSubclusters } from '@/data/roster-data';
import type { ClusterRatings } from '@/data/roster-data';
import { CLUSTER_LABELS } from '@/data/mock-program-context';
import type { ClusterType } from '@/types';

const CLUSTER_KEYS: (keyof ClusterRatings)[] = [
  'shooting', 'finishing', 'playmaking',
  'perimeter_defense', 'interior_defense', 'rebounding', 'frame',
];

// ─── Design tokens ───────────────────────────────────────────────────────────

const TEAL = '#ffffff';
const BG = '#0B0F14';
const CARD_BG = '#0B0F14';
const WHITE = '#FFFFFF';
const GRAY = '#A1A1AA';
const DIVIDER = '#0B0F14';

// ─── Headshots (same map as roster-content) ──────────────────────────────────

const KaNeXT_SEAL = require('@/assets/images/fmu-seal.png');
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
const leadersLookup: Record<string, typeof KaNeXT_LEADERS[number]> = {};
for (const l of KaNeXT_LEADERS) {
  leadersLookup[normalizeJersey(l.number)] = l;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function PlayerBioScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { number } = useLocalSearchParams<{ number: string }>();
  const [expandedYear, setExpandedYear] = useState<string | null>(null);
  const [gameLogFilter, setGameLogFilter] = useState<'recent' | 'season' | 'conference' | null>(null);
  const [careerTab, setCareerTab] = useState<'stats' | 'clusters'>('stats');
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(new Set());

  const jersey = normalizeJersey(number ?? '');
  const bio = KaNeXT_PLAYER_BIOS[jersey];
  const leader = leadersLookup[jersey];

  if (!bio) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Player not found</Text>
      </View>
    );
  }

  const headshot = HEADSHOTS[jersey] ?? KaNeXT_SEAL;
  const allGames = getFmuSeasonGames(jersey);
  const career = getFmuCareer(jersey);
  const highlights = getFmuHighlights(jersey);
  const awards = getFmuAwards(jersey);
  const about = KaNeXT_PLAYER_ABOUT[jersey];

  // Current season stats
  const ppg = leader?.ppg ?? 0;
  const rpg = leader?.rpg ?? 0;
  const apg = leader?.apg ?? 0;
  const tsPct = getFmuTS(jersey);

  const toggleYear = (year: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedYear((prev) => (prev === year ? null : year));
    setCareerTab('stats');
    setExpandedClusters(new Set());
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
          <IconSymbol name="chevron.left" size={14} color="#FFFFFF" />
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
            <Text style={styles.teamLink}>KaNeXT Sports</Text>
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

        {/* ── 3. Current Season (tap to reveal game log) ── */}
        {leader && (
          <>
            <Text style={styles.sectionLabel}>CURRENT SEASON</Text>
            <Pressable
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setGameLogFilter((v) => (v ? null : 'recent'));
              }}
            >
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
            </Pressable>
          </>
        )}

        {/* ── 4. Game Log (revealed by tapping Current Season) ── */}
        {gameLogFilter && allGames.length > 0 && (() => {
          const filtered =
            gameLogFilter === 'conference' ? allGames.filter((g) => g.isConf) :
            gameLogFilter === 'recent' ? allGames.slice(0, 3) :
            allGames;
          return (
            <View style={[styles.card, { marginTop: -8 }]}>
              {/* Filter pills */}
              <View style={styles.filterPillRow}>
                {(['season', 'conference', 'recent'] as const).map((key) => {
                  const active = gameLogFilter === key;
                  const label = key === 'season' ? 'Season' : key === 'conference' ? 'Conference' : 'Recent';
                  return (
                    <Pressable
                      key={key}
                      style={[styles.filterPill, active && styles.filterPillActive]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setGameLogFilter(key);
                      }}
                    >
                      <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {/* Header */}
              <View style={styles.last3Header}>
                <Text style={[styles.last3HeaderCell, { flex: 1 }]}>OPP</Text>
                <Text style={styles.last3HeaderCellNarrow}>PTS</Text>
                <Text style={styles.last3HeaderCellNarrow}>REB</Text>
                <Text style={styles.last3HeaderCellNarrow}>AST</Text>
                <Text style={styles.last3HeaderCellNarrow}>TS%</Text>
                <Text style={styles.last3HeaderCellNarrow}>PGIS</Text>
              </View>
              {/* Rows */}
              {filtered.map((g, idx) => (
                <View key={idx}>
                  <View style={[styles.rowDivider, { backgroundColor: DIVIDER }]} />
                  <View style={styles.last3Row}>
                    <Text style={[styles.last3Opp, { flex: 1 }]} numberOfLines={1}>
                      {g.opponent} ({g.oppKR})
                    </Text>
                    <Text style={styles.last3StatNarrow}>{g.pts}</Text>
                    <Text style={styles.last3StatNarrow}>{g.reb}</Text>
                    <Text style={styles.last3StatNarrow}>{g.ast}</Text>
                    <Text style={styles.last3StatNarrow}>{g.tsPct.toFixed(0)}%</Text>
                    <Text style={[styles.last3StatNarrow, { color: getPGISColor(g.pgis) }]}>
                      {g.pgis > 0 ? '+' : ''}{g.pgis}
                    </Text>
                  </View>
                </View>
              ))}
              {filtered.length === 0 && (
                <Text style={styles.emptyText}>No games</Text>
              )}
            </View>
          );
        })()}

        {/* ── 5. Season Highlights ── */}
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

        {/* ── 6. Awards ── */}
        {awards.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>AWARDS</Text>
            <View style={styles.card}>
              {awards.map((award, idx) => (
                <View key={idx}>
                  {idx > 0 && <View style={[styles.rowDivider, { backgroundColor: DIVIDER }]} />}
                  <View style={styles.awardRow}>
                    <View style={styles.awardIcon}>
                      <Text style={styles.awardIconText}>{'\uD83C\uDFC6'}</Text>
                    </View>
                    <View style={styles.awardInfo}>
                      <Text style={styles.awardTitle}>{award.title}</Text>
                      <Text style={styles.awardYear}>{award.year}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── 7. Career Timeline ── */}
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
                        </View>
                        <Text style={styles.yearSchool} numberOfLines={1}>
                          {season.school} · {season.division}
                        </Text>
                      </View>
                      <View style={styles.yearRight}>
                        <View style={styles.yearPpgBlock}>
                          <Text style={styles.yearPpgValue}>{season.kr ?? '—'}</Text>
                          <Text style={styles.yearPpgLabel}>KR</Text>
                        </View>
                      </View>
                    </Pressable>

                    {isExpanded && (
                      <View style={styles.expandedDetail}>
                        {/* Inline Stats / Clusters pills */}
                        <View style={styles.inlinePillRow}>
                          {(['stats', 'clusters'] as const).map((tab) => {
                            const active = careerTab === tab;
                            return (
                              <Pressable
                                key={tab}
                                style={[styles.filterPill, active && styles.filterPillActive]}
                                onPress={() => {
                                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                  setCareerTab(tab);
                                  setExpandedClusters(new Set());
                                }}
                              >
                                <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                                  {tab === 'stats' ? 'Stats' : 'Clusters'}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>

                        {careerTab === 'stats' ? (
                          <>
                            {/* Hero row — PPG / RPG / APG */}
                            <View style={styles.heroStatRow}>
                              <View style={styles.heroStatItem}>
                                <Text style={styles.heroStatValue}>{season.ppg.toFixed(1)}</Text>
                                <Text style={styles.heroStatLabel}>PPG</Text>
                              </View>
                              <View style={[styles.heroStatDivider, { backgroundColor: DIVIDER }]} />
                              <View style={styles.heroStatItem}>
                                <Text style={styles.heroStatValue}>{season.rpg.toFixed(1)}</Text>
                                <Text style={styles.heroStatLabel}>RPG</Text>
                              </View>
                              <View style={[styles.heroStatDivider, { backgroundColor: DIVIDER }]} />
                              <View style={styles.heroStatItem}>
                                <Text style={styles.heroStatValue}>{season.apg.toFixed(1)}</Text>
                                <Text style={styles.heroStatLabel}>APG</Text>
                              </View>
                            </View>
                            {/* Secondary stats — two-column rows */}
                            <View style={styles.statRowsWrap}>
                              <View style={styles.statRow2Col}>
                                <View style={styles.statRow2Item}>
                                  <Text style={styles.statRow2Label}>GP</Text>
                                  <Text style={styles.statRow2Value}>{season.gp}</Text>
                                </View>
                                <View style={styles.statRow2Item}>
                                  <Text style={styles.statRow2Label}>GS</Text>
                                  <Text style={styles.statRow2Value}>{season.gs}</Text>
                                </View>
                              </View>
                              <View style={styles.statRow2Col}>
                                <View style={styles.statRow2Item}>
                                  <Text style={styles.statRow2Label}>MPG</Text>
                                  <Text style={styles.statRow2Value}>{season.mpg.toFixed(1)}</Text>
                                </View>
                                <View style={styles.statRow2Item}>
                                  <Text style={styles.statRow2Label}>SPG</Text>
                                  <Text style={styles.statRow2Value}>{season.spg.toFixed(1)}</Text>
                                </View>
                              </View>
                              <View style={styles.statRow2Col}>
                                <View style={styles.statRow2Item}>
                                  <Text style={styles.statRow2Label}>BPG</Text>
                                  <Text style={styles.statRow2Value}>{season.bpg.toFixed(1)}</Text>
                                </View>
                                <View style={styles.statRow2Item}>
                                  <Text style={styles.statRow2Label}>FG%</Text>
                                  <Text style={styles.statRow2Value}>{season.fgPct.toFixed(1)}%</Text>
                                </View>
                              </View>
                              <View style={styles.statRow2Col}>
                                <View style={styles.statRow2Item}>
                                  <Text style={styles.statRow2Label}>3P%</Text>
                                  <Text style={styles.statRow2Value}>{season.threePct.toFixed(1)}%</Text>
                                </View>
                                <View style={styles.statRow2Item}>
                                  <Text style={styles.statRow2Label}>FT%</Text>
                                  <Text style={styles.statRow2Value}>{season.ftPct.toFixed(1)}%</Text>
                                </View>
                              </View>
                            </View>
                          </>
                        ) : (
                          <View style={styles.clusterContent}>
                            {CLUSTER_KEYS.map((key) => {
                              const clusters = PLAYER_CLUSTERS[jersey];
                              const value = clusters?.[key] ?? 0;
                              const label = CLUSTER_LABELS[key as ClusterType]?.label ?? key;
                              const barColor = value >= 70 ? '#22C55E' : value >= 55 ? '#F59E0B' : '#EF4444';
                              const pct = Math.min(value, 100);
                              const clusterExpanded = expandedClusters.has(key);
                              const subclusters = clusterExpanded ? getPlayerSubclusters(jersey, key as keyof ClusterRatings) : [];

                              return (
                                <View key={key}>
                                  <Pressable
                                    style={styles.clusterRow}
                                    onPress={() => {
                                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                      setExpandedClusters((prev) => {
                                        const next = new Set(prev);
                                        if (next.has(key)) next.delete(key);
                                        else next.add(key);
                                        return next;
                                      });
                                    }}
                                  >
                                    <Text style={styles.clusterLabel}>{label}</Text>
                                    <View style={styles.clusterBarTrack}>
                                      <View style={[styles.clusterBarFill, { width: `${pct}%`, backgroundColor: barColor }]} />
                                    </View>
                                    <Text style={[styles.clusterValue, { color: barColor }]}>{value}</Text>
                                    <Text style={styles.clusterChevron}>{clusterExpanded ? '▾' : '›'}</Text>
                                  </Pressable>
                                  {clusterExpanded && subclusters.map((sc) => {
                                    const scColor = sc.rating >= 70 ? '#22C55E' : sc.rating >= 55 ? '#F59E0B' : '#EF4444';
                                    const scPct = Math.min(sc.rating, 100);
                                    return (
                                      <View key={sc.name} style={styles.subclusterRow}>
                                        <Text style={styles.subclusterLabel}>{sc.name}</Text>
                                        <View style={styles.subclusterBarTrack}>
                                          <View style={[styles.clusterBarFill, { width: `${scPct}%`, backgroundColor: scColor }]} />
                                        </View>
                                        <Text style={[styles.subclusterValue, { color: scColor }]}>{sc.rating}</Text>
                                      </View>
                                    );
                                  })}
                                </View>
                              );
                            })}
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
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
            <Text style={styles.socialHandle}>KaNeXT</Text>
          </View>
          <View style={styles.socialPill}>
            <Text style={styles.socialIcon}>{'\uD83D\uDCF7'}</Text>
            <Text style={styles.socialHandle}>@faborlions</Text>
          </View>
          <View style={styles.socialPill}>
            <Text style={styles.socialIcon}>{'\uD83C\uDFC0'}</Text>
            <Text style={styles.socialHandle}>KaNeXT Athletics</Text>
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
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#0B0F14',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  backLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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

  // Game log filter pills
  filterPillRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingTop: 12,
    paddingBottom: 4,
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#0B0F14',
  },
  filterPillActive: {
    backgroundColor: WHITE,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: GRAY,
  },
  filterPillTextActive: {
    color: '#0B0F14',
  },
  emptyText: {
    fontSize: 13,
    color: GRAY,
    textAlign: 'center',
    paddingVertical: 16,
  },

  // Game log table
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
  last3HeaderCellNarrow: {
    fontSize: 10,
    fontWeight: '700',
    color: GRAY,
    letterSpacing: 0.3,
    width: 36,
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
  last3StatNarrow: {
    fontSize: 13,
    fontWeight: '600',
    color: WHITE,
    width: 36,
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
  heroStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B0F14',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
  },
  heroStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: 22,
    fontWeight: '700',
    color: WHITE,
  },
  heroStatLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: GRAY,
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 28,
  },
  statRowsWrap: {
    gap: 2,
  },
  statRow2Col: {
    flexDirection: 'row',
    gap: 8,
  },
  statRow2Item: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0B0F14',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  statRow2Label: {
    fontSize: 12,
    fontWeight: '500',
    color: GRAY,
  },
  statRow2Value: {
    fontSize: 14,
    fontWeight: '700',
    color: WHITE,
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

  // Awards
  awardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    gap: 12,
  },
  awardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0B0F14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  awardIconText: {
    fontSize: 16,
  },
  awardInfo: {
    flex: 1,
  },
  awardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: WHITE,
    lineHeight: 18,
  },
  awardYear: {
    fontSize: 12,
    color: GRAY,
    marginTop: 2,
  },

  // Inline pill row (inside expanded blocks)
  inlinePillRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },

  // Cluster view
  clusterContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: 12,
    paddingBottom: Spacing.md,
  },
  clusterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 2,
  },
  clusterLabel: {
    width: 72,
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  clusterBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#0B0F14',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  clusterBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  clusterValue: {
    fontSize: 13,
    fontWeight: '700',
    width: 28,
    textAlign: 'right',
  },
  clusterChevron: {
    fontSize: 11,
    color: '#A1A1AA',
    width: 16,
    textAlign: 'center',
    marginLeft: 2,
  },
  subclusterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    marginBottom: 6,
  },
  subclusterLabel: {
    fontSize: 10,
    color: '#999',
    width: 100,
  },
  subclusterBarTrack: {
    flex: 1,
    height: 5,
    backgroundColor: '#222',
    borderRadius: 3,
    overflow: 'hidden',
    marginHorizontal: 6,
  },
  subclusterValue: {
    fontSize: 11,
    fontWeight: '600',
    width: 24,
    textAlign: 'right',
  },
});
