/**
 * Universal Team Bio Sheet — 4-tab team profile bottom sheet
 * Opened by HOLD on any team logo. Tap = no-op.
 * Tabs: Team | Coaches | System | History
 */

import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KaNeXT_GAMES, KaNeXT_RECORD, KaNeXT_STANDINGS } from '@/data/fmu';
import { coachingStaff } from '@/data/kx-conference/coaching-staff';
import { PLAYER_CLUSTERS } from '@/data/roster-data';
import type { ClusterRatings } from '@/data/roster-data';

// KaNeXT seal
const KaNeXT_SEAL = require('@/assets/images/fmu-seal.png');

// ── Staff data ──
const fmuStaff = coachingStaff.find((s) => s.program_id === 'kx-sports');

function nameToHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

interface CoachProfile {
  name: string;
  initials: string;
  role: string;
  hue: number;
  isHC: boolean;
  yearsWithProgram: number;
  bio: string;
  priorStops: string[];
  highlights: string[];
}

// Build coach profiles with placeholder data for bios/stops
const KaNeXT_COACHES: CoachProfile[] = [
  {
    name: fmuStaff?.head_coach_name ?? 'TBD',
    initials: (fmuStaff?.head_coach_name ?? 'TB').split(' ').map((w) => w[0]).join(''),
    role: 'Head Coach',
    hue: nameToHue(fmuStaff?.head_coach_name ?? 'TBD'),
    isHC: true,
    yearsWithProgram: 4,
    bio: 'Veteran head coach who has rebuilt the KaNeXT program into a competitive KaNeXT Conference contender. Known for developing JUCO transfers into impact players and running a high-tempo, guard-driven system.',
    priorStops: ['Miami Dade College (Asst)', 'Broward College (Asst)', 'Stranahan HS (HC)'],
    highlights: [
      'Led KaNeXT to first winning conference record in 5 years',
      '2x KaNeXT Conference Coach of the Month',
      'Developed 3 All-Conference selections',
    ],
  },
  ...(fmuStaff?.assistant_coaches ?? []).map((a, idx) => ({
    name: a.name,
    initials: a.name.split(' ').map((w) => w[0]).join(''),
    role: a.role ?? 'Assistant Coach',
    hue: nameToHue(a.name),
    isHC: false,
    yearsWithProgram: 3 - idx,
    bio: `Assistant coach contributing to player development and ${idx === 0 ? 'offensive game planning' : 'defensive scouting and recruiting'}.`,
    priorStops: idx === 0
      ? ['Indian River State (Asst)', 'Palm Beach State (GA)']
      : ['Dillard HS (Asst)', 'Boyd Anderson HS (HC)'],
    highlights: [
      idx === 0 ? 'Coached 2 NJCAA All-Americans' : 'Recruited 4 current starters',
      'Former collegiate player',
    ],
  })),
];

// ── Conference position / streak ──
const KaNeXT_CONF_POSITION = KaNeXT_STANDINGS.findIndex((r) => r.team === 'KaNeXT Sports') + 1;
const fmuStreak = KaNeXT_STANDINGS.find((r) => r.team === 'KaNeXT Sports')?.streak ?? '—';

// ── Team cluster averages for DNA ──
const clusterKeys: (keyof ClusterRatings)[] = ['shooting', 'finishing', 'playmaking', 'perimeter_defense', 'interior_defense', 'rebounding', 'frame'];
const playerEntries = Object.values(PLAYER_CLUSTERS);
const teamClusterAvg: Record<keyof ClusterRatings, number> = {} as any;
for (const key of clusterKeys) {
  const sum = playerEntries.reduce((acc, p) => acc + p[key], 0);
  teamClusterAvg[key] = Math.round(sum / playerEntries.length);
}

// Derive Team DNA chips from cluster data
function deriveTeamDNA(): { label: string; value: string }[] {
  const offAvg = Math.round((teamClusterAvg.shooting + teamClusterAvg.finishing + teamClusterAvg.playmaking) / 3);
  const defAvg = Math.round((teamClusterAvg.perimeter_defense + teamClusterAvg.interior_defense + teamClusterAvg.rebounding + teamClusterAvg.frame) / 4);

  const dna: { label: string; value: string }[] = [];
  dna.push({ label: 'Pace', value: offAvg >= 70 ? 'Fast' : offAvg >= 60 ? 'Moderate' : 'Slow' });
  dna.push({ label: 'Shot Profile', value: teamClusterAvg.shooting >= 70 ? '3-Heavy' : 'Balanced' });
  dna.push({ label: 'Rebound', value: teamClusterAvg.rebounding >= 70 ? 'Elite' : teamClusterAvg.rebounding >= 60 ? 'Avg' : 'Below Avg' });
  dna.push({ label: 'Defense', value: defAvg >= 70 ? 'Elite' : defAvg >= 60 ? 'Solid' : 'Developing' });
  dna.push({ label: 'Identity', value: offAvg > defAvg ? 'Offense-first' : 'Defense-first' });
  return dna;
}

const TEAM_DNA = deriveTeamDNA();

// ── Signature Wins ──
const signatureWins = KaNeXT_GAMES
  .filter((g) => g.status === 'final' && g.score?.startsWith('W') && (g.opponentKR ?? 0) >= 70)
  .slice(0, 3)
  .map((g) => `W vs ${g.opponent} (${g.score?.replace(/^W\s*/, '')})`);

// ── System History (placeholder data) ──
const SYSTEM_HISTORY = [
  { season: '2025–26', offense: 'Motion / Read & React', defense: 'Containment Man' },
  { season: '2024–25', offense: 'Spread Pick & Roll', defense: 'Pack Line' },
  { season: '2023–24', offense: 'Dribble Drive', defense: 'Pressure Man' },
];

// ── System Tendencies (placeholder) ──
const TENDENCIES = [
  { label: 'ATO Frequency', value: 'High' },
  { label: 'Press Rate', value: 'Moderate' },
  { label: 'Zone Usage', value: 'Low' },
  { label: 'Pace Rank', value: '#4 in Conf' },
];

// ── Program History (placeholder) ──
const PROGRAM_HISTORY = [
  { season: '2024–25', record: '16–8', finish: 'Conf Semis' },
  { season: '2023–24', record: '12–14', finish: '7th in Conference' },
  { season: '2022–23', record: '9–17', finish: '9th in Conference' },
  { season: '2021–22', record: '14–12', finish: 'Conf Quarterfinals' },
];

const RIVALS = ['Ave Maria', 'Keiser', 'Webber International'];

// ── Tab types ──
type BioTab = 'team' | 'coaches' | 'system' | 'history';

const BIO_TABS: { key: BioTab; label: string }[] = [
  { key: 'team', label: 'Team' },
  { key: 'coaches', label: 'Coaches' },
  { key: 'system', label: 'System' },
  { key: 'history', label: 'History' },
];

// ── Props ──
export interface TeamQuickSheetProps {
  visible: boolean;
  onClose: () => void;
  teamKR: number;
  offKR: number;
  defKR: number;
  offSystemName: string;
  defSystemName: string;
}

export function TeamQuickSheet({
  visible,
  onClose,
  teamKR,
  offKR,
  defKR,
  offSystemName,
  defSystemName,
}: TeamQuickSheetProps) {
  const [activeTab, setActiveTab] = useState<BioTab>('team');
  const [expandedCoach, setExpandedCoach] = useState<string | null>(null);

  // Reset state when sheet reopens
  React.useEffect(() => {
    if (visible) {
      setActiveTab('team');
      setExpandedCoach(null);
    }
  }, [visible]);

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      {visible && (
        <>
          {/* ===== HEADER — always visible ===== */}

          {/* 2.1 Identity row */}
          <View style={s.identityRow}>
            <Image source={FMU_SEAL} style={s.logo} resizeMode="contain" />
            <View style={s.identityText}>
              <Text style={s.teamName}>KaNeXT Sports</Text>
              <Text style={s.teamSubline}>NAIA {'\u00B7'} KaNeXT Conference</Text>
            </View>
            <View style={s.krBadge}>
              <Text style={s.krValue}>{teamKR}</Text>
              <Text style={s.krSub}>O {offKR} {'\u00B7'} D {defKR}</Text>
            </View>
          </View>

          {/* 2.3 Season snapshot pills */}
          <View style={s.pillsRow}>
            <View style={s.recordPill}>
              <Text style={s.recordPillText}>{FMU_RECORD.overall}</Text>
            </View>
            <View style={s.recordPill}>
              <Text style={s.recordPillTextMuted}>{FMU_RECORD.conference} conf</Text>
            </View>
            <View style={[s.recordPill, { backgroundColor: fmuStreak.startsWith('W') ? '#4CAF5020' : '#EF444420' }]}>
              <Text style={[s.recordPillText, { color: fmuStreak.startsWith('W') ? '#4ade80' : '#f87171' }]}>{fmuStreak}</Text>
            </View>
            <View style={s.recordPill}>
              <Text style={s.recordPillTextMuted}>#{FMU_CONF_POSITION}</Text>
            </View>
            <View style={[s.recordPill, { backgroundColor: 'rgba(255,209,0,0.12)' }]}>
              <Text style={[s.recordPillText, { color: '#FFD100', fontSize: 11 }]}>Regional Power</Text>
            </View>
          </View>

          {/* ===== TAB PILLS ===== */}
          <View style={s.tabRow}>
            {BIO_TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  style={[s.tabPill, isActive && s.tabPillActive]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setActiveTab(tab.key);
                  }}
                >
                  <Text style={[s.tabPillText, isActive && s.tabPillTextActive]}>{tab.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* ===== TAB CONTENT ===== */}

          {/* ── TEAM TAB ── */}
          {activeTab === 'team' && (
            <View style={s.tabContent}>
              {/* Team DNA chips */}
              <Text style={s.sectionLabel}>TEAM DNA</Text>
              <View style={s.dnaChipRow}>
                {TEAM_DNA.map((d) => (
                  <View key={d.label} style={s.dnaChip}>
                    <Text style={s.dnaChipLabel}>{d.label}:</Text>
                    <Text style={s.dnaChipValue}>{d.value}</Text>
                  </View>
                ))}
              </View>

              {/* Roster / Size summary */}
              <Text style={s.sectionLabel}>ROSTER</Text>
              <View style={s.card}>
                <Text style={s.summaryLine}>
                  Avg Ht: 6{'\u2019'}4{'\u201D'} {'\u00B7'} Avg Wt: 191 {'\u00B7'} Returning Min: 72%
                </Text>
              </View>

              {/* Signature Wins */}
              {signatureWins.length > 0 && (
                <>
                  <Text style={s.sectionLabel}>SIGNATURE WINS</Text>
                  <View style={s.card}>
                    {signatureWins.map((w, i) => (
                      <View key={i} style={s.listItemRow}>
                        <Text style={s.winBullet}>{'\u2022'}</Text>
                        <Text style={s.listItemText}>{w}</Text>
                      </View>
                    ))}
                    {signatureWins.length === 0 && (
                      <Text style={s.placeholderText}>No signature wins yet this season</Text>
                    )}
                  </View>
                </>
              )}
            </View>
          )}

          {/* ── COACHES TAB ── */}
          {activeTab === 'coaches' && (
            <View style={s.tabContent}>
              <Text style={s.sectionLabel}>STAFF</Text>
              {FMU_COACHES.map((coach) => {
                const isExpanded = expandedCoach === coach.name;
                return (
                  <View key={coach.name}>
                    <Pressable
                      style={s.coachRow}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setExpandedCoach(isExpanded ? null : coach.name);
                      }}
                    >
                      <View style={[s.coachAvatar, { backgroundColor: `hsl(${coach.hue}, 45%, 35%)` }]}>
                        <Text style={s.coachAvatarText}>{coach.initials}</Text>
                      </View>
                      <View style={s.coachInfo}>
                        <View style={s.coachNameRow}>
                          <Text style={s.coachName}>{coach.name}</Text>
                          {coach.isHC && (
                            <View style={s.hcBadge}>
                              <Text style={s.hcBadgeText}>Head Coach</Text>
                            </View>
                          )}
                        </View>
                        <Text style={s.coachRole}>{coach.role}</Text>
                        <Text style={s.coachTenure}>{coach.yearsWithProgram} yr{coach.yearsWithProgram !== 1 ? 's' : ''} with program</Text>
                      </View>
                      <IconSymbol name={isExpanded ? 'chevron.down' : 'chevron.right'} size={12} color="#555" />
                    </Pressable>

                    {isExpanded && (
                      <View style={s.coachDetail}>
                        <Text style={s.coachBio}>{coach.bio}</Text>

                        {coach.priorStops.length > 0 && (
                          <>
                            <Text style={s.detailSubhead}>COACHING TREE</Text>
                            {coach.priorStops.map((stop, i) => (
                              <Text key={i} style={s.stopText}>{'\u2022'} {stop}</Text>
                            ))}
                          </>
                        )}

                        {coach.highlights.length > 0 && (
                          <>
                            <Text style={s.detailSubhead}>HIGHLIGHTS</Text>
                            {coach.highlights.map((h, i) => (
                              <Text key={i} style={s.stopText}>{'\u2022'} {h}</Text>
                            ))}
                          </>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* ── SYSTEM TAB ── */}
          {activeTab === 'system' && (
            <View style={s.tabContent}>
              {/* Current System */}
              <Text style={s.sectionLabel}>CURRENT SYSTEM</Text>
              <View style={s.card}>
                <View style={s.systemRow}>
                  <Text style={s.systemLabel}>Offense</Text>
                  <Text style={s.systemValue}>{offSystemName}</Text>
                </View>
                <View style={s.systemRow}>
                  <Text style={s.systemLabel}>Defense</Text>
                  <Text style={s.systemValue}>{defSystemName}</Text>
                </View>
              </View>

              {/* System History */}
              <Text style={s.sectionLabel}>SYSTEM HISTORY</Text>
              <View style={s.card}>
                {SYSTEM_HISTORY.map((entry) => (
                  <View key={entry.season} style={s.historyRow}>
                    <Text style={s.historySeasonText}>{entry.season}</Text>
                    <View style={s.historySystemCol}>
                      <Text style={s.historySystemText}>Off: {entry.offense}</Text>
                      <Text style={s.historySystemText}>Def: {entry.defense}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Tendencies */}
              <Text style={s.sectionLabel}>TENDENCIES</Text>
              <View style={s.tendencyGrid}>
                {TENDENCIES.map((t) => (
                  <View key={t.label} style={s.tendencyCard}>
                    <Text style={s.tendencyValue}>{t.value}</Text>
                    <Text style={s.tendencyLabel}>{t.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── HISTORY TAB ── */}
          {activeTab === 'history' && (
            <View style={s.tabContent}>
              {/* Program Identity */}
              <Text style={s.sectionLabel}>PROGRAM</Text>
              <View style={s.card}>
                <View style={s.progRow}>
                  <Text style={s.progLabel}>Founded</Text>
                  <Text style={s.progValue}>1879</Text>
                </View>
                <View style={s.progRow}>
                  <Text style={s.progLabel}>Location</Text>
                  <Text style={s.progValue}>Nashville, TN</Text>
                </View>
                <View style={s.progRow}>
                  <Text style={s.progLabel}>Nickname</Text>
                  <Text style={s.progValue}>Lions</Text>
                </View>
                <View style={s.progRow}>
                  <Text style={s.progLabel}>Venue</Text>
                  <Text style={s.progValue}>KaNeXT Wellness Center</Text>
                </View>
                <View style={[s.progRow, { borderBottomWidth: 0 }]}>
                  <Text style={s.progLabel}>Colors</Text>
                  <View style={s.colorsRow}>
                    <View style={[s.colorDot, { backgroundColor: '#003DA5' }]} />
                    <View style={[s.colorDot, { backgroundColor: '#FFD100' }]} />
                    <Text style={s.progValue}>Royal Blue {'\u0026'} Gold</Text>
                  </View>
                </View>
              </View>

              {/* Season Progression */}
              <Text style={s.sectionLabel}>SEASON HISTORY</Text>
              <View style={s.card}>
                {PROGRAM_HISTORY.map((entry) => (
                  <View key={entry.season} style={s.seasonHistRow}>
                    <Text style={s.seasonHistYear}>{entry.season}</Text>
                    <Text style={s.seasonHistRecord}>{entry.record}</Text>
                    <Text style={s.seasonHistFinish}>{entry.finish}</Text>
                  </View>
                ))}
              </View>

              {/* Rivalries */}
              <Text style={s.sectionLabel}>CONFERENCE RIVALS</Text>
              <View style={s.card}>
                {RIVALS.map((r) => (
                  <View key={r} style={s.listItemRow}>
                    <Text style={s.winBullet}>{'\u2022'}</Text>
                    <Text style={s.listItemText}>{r}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </>
      )}
    </BottomSheet>
  );
}

// ── Styles ──

const s = StyleSheet.create({
  // Header — Identity
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 44,
    height: 44,
    marginRight: 12,
  },
  identityText: {
    flex: 1,
  },
  teamName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  teamSubline: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  krBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  krValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 26,
  },
  krSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888',
    marginTop: 2,
  },

  // Season pills row
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  recordPill: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  recordPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  recordPillTextMuted: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
  },

  // Tab pills
  tabRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 3,
  },
  tabPill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabPillActive: {
    backgroundColor: '#333',
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  tabPillTextActive: {
    color: '#fff',
  },

  // Tab content
  tabContent: {
    gap: 0,
  },

  // Section labels
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.0,
    color: '#6e6e6e',
    marginBottom: 8,
    marginTop: 4,
  },

  // Card
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 14,
    marginBottom: 14,
  },

  // ── TEAM TAB ──

  // DNA chips
  dnaChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  dnaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1a1a1a',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dnaChipLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#888',
  },
  dnaChipValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },

  // Summary line
  summaryLine: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ccc',
    lineHeight: 18,
  },

  // List items
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingVertical: 3,
  },
  winBullet: {
    fontSize: 13,
    color: '#4ade80',
    lineHeight: 18,
  },
  listItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ccc',
    flex: 1,
    lineHeight: 18,
  },
  placeholderText: {
    fontSize: 13,
    color: '#555',
    fontStyle: 'italic',
  },

  // ── COACHES TAB ──

  coachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 12,
    marginBottom: 2,
    gap: 12,
  },
  coachAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachAvatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
  coachInfo: {
    flex: 1,
  },
  coachNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coachName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  hcBadge: {
    backgroundColor: 'rgba(255,209,0,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hcBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFD100',
  },
  coachRole: {
    fontSize: 12,
    fontWeight: '500',
    color: '#888',
    marginTop: 2,
  },
  coachTenure: {
    fontSize: 11,
    fontWeight: '500',
    color: '#666',
    marginTop: 1,
  },
  coachDetail: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 14,
    marginBottom: 10,
    marginTop: 2,
  },
  coachBio: {
    fontSize: 13,
    fontWeight: '500',
    color: '#ccc',
    lineHeight: 19,
    marginBottom: 12,
  },
  detailSubhead: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#6e6e6e',
    marginBottom: 6,
    marginTop: 8,
  },
  stopText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#aaa',
    lineHeight: 18,
    paddingLeft: 4,
  },

  // ── SYSTEM TAB ──

  systemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  systemLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#888',
  },
  systemValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },

  // System History
  historyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    gap: 12,
  },
  historySeasonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    width: 64,
  },
  historySystemCol: {
    flex: 1,
    gap: 2,
  },
  historySystemText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#aaa',
  },

  // Tendencies
  tendencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  tendencyCard: {
    width: '47%' as any,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 12,
    alignItems: 'center',
  },
  tendencyValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  tendencyLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#888',
    marginTop: 4,
  },

  // ── HISTORY TAB ──

  progRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  progLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#888',
  },
  progValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  colorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  // Season History
  seasonHistRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingVertical: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    gap: 8,
  },
  seasonHistYear: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    width: 64,
  },
  seasonHistRecord: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ccc',
    width: 44,
  },
  seasonHistFinish: {
    fontSize: 12,
    fontWeight: '500',
    color: '#888',
    flex: 1,
  },
});
