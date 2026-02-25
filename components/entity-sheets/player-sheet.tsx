/**
 * Player Sheet — Universal 5-tab player profile bottom sheet.
 * Tabs: Bio | Ratings | Stats | Recruiting | Notes/Dev
 * Header (name, #, position, status, team chip) + Sticky Rating Strip always visible.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing } from '@/constants/theme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { PlayerCardData } from '@/utils/global-entity-sheets';
import { openTeamSheet } from '@/utils/global-entity-sheets';
import {
  getKRColor,
  getKRTierLabel,
  getKRBandLabel,
  getArchetypeDisplay,
  CLUSTER_ORDER,
  CLUSTER_LABELS,
  BADGE_COLORS,
  BADGE_BG_COLORS,
  LEVEL_DISPLAY_SHORT,
} from '@/utils/kr-display';
import { computePlayerBadges, type PlayerBadge } from '@/utils/player-badges';
import { RECRUITING_BOARD, LOG_TYPE_META, TEMPERATURE_COLORS, type BoardEntry } from '@/data/recruitingBoard';

function nameToHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

type Tab = 'bio' | 'ratings' | 'stats' | 'recruiting' | 'notes';

const TABS: { key: Tab; label: string }[] = [
  { key: 'bio', label: 'Bio' },
  { key: 'ratings', label: 'Ratings' },
  { key: 'stats', label: 'Stats' },
  { key: 'recruiting', label: 'Recruiting' },
  { key: 'notes', label: 'Notes' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  data: PlayerCardData | null;
}

export function PlayerSheet({ visible, onClose, data }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const [activeTab, setActiveTab] = useState<Tab>('bio');
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);

  // Reset tab when sheet reopens
  React.useEffect(() => {
    if (visible) {
      setActiveTab('bio');
      setExpandedCluster(null);
    }
  }, [visible]);

  // Find board entry for this player
  const boardEntry: BoardEntry | undefined = useMemo(() => {
    if (!data?.playerId) return undefined;
    return RECRUITING_BOARD.find(e => e.playerId === data.playerId);
  }, [data?.playerId]);

  if (!data) return null;

  const hue = data.teamColor ? nameToHue(data.teamColor) : nameToHue(data.name);
  const initials = data.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const kr = data.kr;
  const krColor = getKRColor(kr);
  const tierLabel = data.levelKey ? getKRTierLabel(kr!, data.levelKey) : getKRBandLabel(kr);
  const archDisplay = getArchetypeDisplay(data.archetype);
  const levelTag = data.levelKey ? (LEVEL_DISPLAY_SHORT[data.levelKey] || data.levelDisplay || '') : '';

  // Compute badges
  const badges: PlayerBadge[] = data.clusters
    ? computePlayerBadges(
        data.clusters as any,
        (clusterKey: string) => {
          const score = (data.clusters as Record<string, number>)?.[clusterKey] ?? 50;
          return [{ name: clusterKey, rating: score }];
        },
      )
    : [];

  // Derive strengths/risks from clusters
  const clusterEntries = data.clusters
    ? CLUSTER_ORDER.map(k => ({ key: k, score: (data.clusters as Record<string, number>)[k] ?? 50, label: CLUSTER_LABELS[k]?.label ?? k }))
        .sort((a, b) => b.score - a.score)
    : [];
  const topStrengths = clusterEntries.slice(0, 2).filter(c => c.score >= 55);
  const topRisk = [...clusterEntries].sort((a, b) => a.score - b.score).slice(0, 1).filter(c => c.score < 50);

  // Status chip color
  const statusColor = data.status === 'Injured' ? '#EF4444' : data.status === 'Out' ? '#A1A1AA' : data.status === 'RS' ? '#F59E0B' : '#22C55E';

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal>
      <View style={styles.headerSection}>
        {/* ── HEADER — always visible ── */}
        <View style={styles.identityRow}>
          <View style={[styles.avatarCircle, { backgroundColor: `hsl(${hue}, 50%, 35%)` }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[styles.playerName, { color: colors.text }]}>{data.name}</Text>
              {data.number ? (
                <Text style={[styles.jerseyBadge, { color: colors.textSecondary }]}>#{data.number}</Text>
              ) : null}
            </View>
            <Text style={[styles.playerMeta, { color: colors.textSecondary }]}>
              {data.position} · {data.height}{data.weight ? ` · ${data.weight} lbs` : ''} · {data.classYear}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
              {data.status ? (
                <View style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                  <Text style={[styles.statusChipText, { color: statusColor }]}>{data.status}</Text>
                </View>
              ) : null}
              {data.school ? (
                <Pressable
                  style={[styles.teamChip, { backgroundColor: accent + '15', borderColor: accent + '40' }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    openTeamSheet({ name: data.school!, level: levelTag, conference: data.conference });
                  }}
                >
                  <Text style={[styles.teamChipText, { color: accent }]}>{data.school}</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>

        {/* ── STICKY RATING STRIP ── */}
        <View style={[styles.ratingStrip, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.ratingStripMain}>
            {kr != null && (
              <View style={[styles.ratingBadge, { backgroundColor: krColor + '20' }]}>
                <Text style={[styles.ratingBadgeVal, { color: krColor }]}>{Math.round(kr)}</Text>
                <Text style={[styles.ratingBadgeLabel, { color: colors.textTertiary }]}>KR</Text>
              </View>
            )}
            {data.offKR != null && (
              <View style={styles.ratingMini}>
                <Text style={[styles.ratingMiniVal, { color: getKRColor(data.offKR) }]}>{Math.round(data.offKR)}</Text>
                <Text style={[styles.ratingMiniLabel, { color: colors.textTertiary }]}>OFF</Text>
              </View>
            )}
            {data.defKR != null && (
              <View style={styles.ratingMini}>
                <Text style={[styles.ratingMiniVal, { color: getKRColor(data.defKR) }]}>{Math.round(data.defKR)}</Text>
                <Text style={[styles.ratingMiniLabel, { color: colors.textTertiary }]}>DEF</Text>
              </View>
            )}
            {data.confidence != null && (
              <View style={styles.ratingMini}>
                <Text style={[styles.ratingMiniVal, { color: colors.text }]}>{Math.round(data.confidence)}%</Text>
                <Text style={[styles.ratingMiniLabel, { color: colors.textTertiary }]}>CONF</Text>
              </View>
            )}
          </View>
          {(topStrengths.length > 0 || topRisk.length > 0) && (
            <View style={styles.ratingTagRow}>
              {topStrengths.map(s => (
                <View key={s.key} style={[styles.ratingTag, { backgroundColor: '#22C55E20' }]}>
                  <Text style={[styles.ratingTagText, { color: '#22C55E' }]}>{s.label}</Text>
                </View>
              ))}
              {topRisk.map(r => (
                <View key={r.key} style={[styles.ratingTag, { backgroundColor: '#EF444420' }]}>
                  <Text style={[styles.ratingTagText, { color: '#EF4444' }]}>{r.label}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── TAB PILLS ── */}
        <View style={[styles.tabRow, { backgroundColor: colors.card }]}>
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={[styles.tabPill, active && [styles.tabPillActive, { backgroundColor: accent + '30' }]]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveTab(tab.key);
                }}
              >
                <Text style={[styles.tabText, { color: active ? accent : colors.textSecondary }]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.tabContent}>

          {/* ════════════════════════════════════════════
              TAB 1 — BIO
              ════════════════════════════════════════════ */}
          {activeTab === 'bio' && (
            <>
              {/* Background */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>BACKGROUND</Text>
                <InfoRow label="Hometown" value={data.hometown || '—'} colors={colors} />
                <InfoRow label="Previous School" value={data.previousSchool || '—'} colors={colors} />
                {data.portalEntryDate && (
                  <InfoRow label="Portal Entry" value={data.portalEntryDate} colors={colors} />
                )}
                <InfoRow label="Class" value={data.classYear} colors={colors} />
                <InfoRow label="Height" value={data.height} colors={colors} />
                {data.weight ? <InfoRow label="Weight" value={`${data.weight} lbs`} colors={colors} /> : null}
              </View>

              {/* Conference / Level */}
              {(data.conference || levelTag) && (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>AFFILIATION</Text>
                  {data.conference && <InfoRow label="Conference" value={data.conference} colors={colors} />}
                  {levelTag && <InfoRow label="Level" value={levelTag} colors={colors} />}
                </View>
              )}

              {/* Awards & Honors */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>AWARDS & HONORS</Text>
                {badges.length > 0 ? (
                  <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                    {badges.filter(b => b.level === 'Gold').length > 0 ? `${badges.filter(b => b.level === 'Gold').length} Gold Badge` : ''}
                    {badges.filter(b => b.level === 'Silver').length > 0 ? `${badges.filter(b => b.level === 'Gold').length > 0 ? ' · ' : ''}${badges.filter(b => b.level === 'Silver').length} Silver Badge${badges.filter(b => b.level === 'Silver').length > 1 ? 's' : ''}` : ''}
                    {badges.filter(b => b.level === 'Bronze').length > 0 ? ` · ${badges.filter(b => b.level === 'Bronze').length} Bronze` : ''}
                  </Text>
                ) : (
                  <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
                    No awards data available yet.
                  </Text>
                )}
              </View>

              {/* Notes preview */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>NOTES PREVIEW</Text>
                {boardEntry && boardEntry.log.length > 0 ? (
                  boardEntry.log.slice(-2).map(entry => (
                    <View key={entry.id} style={styles.notePreviewRow}>
                      <Text style={[styles.notePreviewType, { color: colors.textTertiary }]}>{entry.type}</Text>
                      <Text style={[styles.notePreviewText, { color: colors.textSecondary }]} numberOfLines={1}>
                        {entry.summary}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
                    No notes available.
                  </Text>
                )}
              </View>
            </>
          )}

          {/* ════════════════════════════════════════════
              TAB 2 — RATINGS
              ════════════════════════════════════════════ */}
          {activeTab === 'ratings' && (
            <>
              {/* Archetype */}
              {data.archetype ? (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>ARCHETYPE</Text>
                  <Text style={[styles.archetypeText, { color: colors.text }]}>{archDisplay}</Text>
                  {data.confidence != null && (
                    <Text style={[styles.archetypeConf, { color: colors.textSecondary }]}>
                      {Math.round(data.confidence)}% confidence
                    </Text>
                  )}
                </View>
              ) : null}

              {/* Skill Clusters (7) with accordion subclusters */}
              {data.clusters && (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>CLUSTERS</Text>
                  {CLUSTER_ORDER.map(key => {
                    const score = (data.clusters as Record<string, number>)[key] ?? 50;
                    const clusterColor = getKRColor(score);
                    const label = CLUSTER_LABELS[key]?.label ?? key;
                    const pct = Math.min(100, Math.max(0, score));
                    const isExpanded = expandedCluster === key;

                    return (
                      <View key={key}>
                        <Pressable
                          style={styles.clusterRow}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setExpandedCluster(isExpanded ? null : key);
                          }}
                        >
                          <Text style={[styles.clusterLabel, { color: colors.textSecondary }]}>{label}</Text>
                          <View style={styles.clusterBarContainer}>
                            <View style={[styles.clusterBarBg, { backgroundColor: colors.border }]}>
                              <View style={[styles.clusterBarFill, { width: `${pct}%`, backgroundColor: clusterColor }]} />
                            </View>
                          </View>
                          <Text style={[styles.clusterScore, { color: clusterColor }]}>{Math.round(score)}</Text>
                          <Text style={[styles.chevron, { color: colors.textTertiary }]}>{isExpanded ? '\u25B2' : '\u25BC'}</Text>
                        </Pressable>

                        {/* Expanded subclusters — show badges relevant to this cluster */}
                        {isExpanded && (
                          <View style={[styles.subclusterContainer, { backgroundColor: colors.border + '30' }]}>
                            {badges.filter(b => b.component === key).length > 0 ? (
                              badges.filter(b => b.component === key).map((badge, i) => (
                                <View key={`${badge.name}-${i}`} style={styles.subclusterRow}>
                                  <View style={[styles.badgeDot, { backgroundColor: BADGE_COLORS[badge.level] }]} />
                                  <Text style={[styles.subclusterName, { color: colors.text }]}>{badge.name}</Text>
                                  <Text style={[styles.subclusterLevel, { color: BADGE_COLORS[badge.level] }]}>{badge.level}</Text>
                                </View>
                              ))
                            ) : (
                              <Text style={[styles.subclusterEmpty, { color: colors.textTertiary }]}>
                                No badges earned in this cluster.
                              </Text>
                            )}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Badge summary */}
              {badges.length > 0 && (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>ALL BADGES</Text>
                  <View style={styles.badgeGrid}>
                    {badges.map((badge, i) => (
                      <View
                        key={`${badge.name}-${i}`}
                        style={[styles.badgeChip, { backgroundColor: BADGE_BG_COLORS[badge.level], borderColor: BADGE_COLORS[badge.level] + '60' }]}
                      >
                        <View style={[styles.badgeDot, { backgroundColor: BADGE_COLORS[badge.level] }]} />
                        <Text style={[styles.badgeName, { color: colors.text }]}>{badge.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}

          {/* ════════════════════════════════════════════
              TAB 3 — STATS
              ════════════════════════════════════════════ */}
          {activeTab === 'stats' && (
            <>
              {/* Season selector chip */}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={[styles.seasonChip, { backgroundColor: accent + '20', borderColor: accent + '40' }]}>
                  <Text style={[styles.seasonChipText, { color: accent }]}>2025-26</Text>
                </View>
              </View>

              {/* Season averages */}
              {data.ppg != null ? (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>PER-GAME AVERAGES</Text>
                  <View style={styles.statsGrid}>
                    <StatCell label="PPG" value={data.ppg?.toFixed(1)} colors={colors} />
                    <StatCell label="RPG" value={data.rpg?.toFixed(1)} colors={colors} />
                    <StatCell label="APG" value={data.apg?.toFixed(1)} colors={colors} />
                    <StatCell label="SPG" value={data.spg?.toFixed(1)} colors={colors} />
                    <StatCell label="BPG" value={data.bpg?.toFixed(1)} colors={colors} />
                    <StatCell label="MPG" value={data.mpg?.toFixed(1)} colors={colors} />
                    <StatCell label="TO" value={data.topg?.toFixed(1)} colors={colors} />
                  </View>
                  {data.gp != null && (
                    <Text style={[styles.gpNote, { color: colors.textTertiary }]}>{data.gp} games played</Text>
                  )}
                </View>
              ) : (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
                    No season stats available.
                  </Text>
                </View>
              )}

              {/* Shooting splits */}
              {data.fgPct != null && (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>SHOOTING SPLITS</Text>
                  <View style={styles.splitsRow}>
                    <SplitBar label="FG" pct={data.fgPct} colors={colors} accent={accent} />
                    {data.threePct != null && <SplitBar label="3PT" pct={data.threePct} colors={colors} accent={accent} />}
                    {data.ftPct != null && <SplitBar label="FT" pct={data.ftPct} colors={colors} accent={accent} />}
                  </View>
                </View>
              )}
            </>
          )}

          {/* ════════════════════════════════════════════
              TAB 4 — RECRUITING
              ════════════════════════════════════════════ */}
          {activeTab === 'recruiting' && (
            <>
              {boardEntry ? (
                <>
                  {/* Board Stage + Owner + Temperature */}
                  <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>BOARD STATUS</Text>
                    <View style={styles.recruitingStatusRow}>
                      <View style={[styles.stageChip, { backgroundColor: accent + '20' }]}>
                        <Text style={[styles.stageChipText, { color: accent }]}>{boardEntry.status}</Text>
                      </View>
                      <View style={[styles.tempChip, { backgroundColor: (TEMPERATURE_COLORS[boardEntry.temperature] || '#A1A1AA') + '20' }]}>
                        <Text style={[styles.tempChipText, { color: TEMPERATURE_COLORS[boardEntry.temperature] || '#A1A1AA' }]}>
                          {boardEntry.temperature}
                        </Text>
                      </View>
                    </View>
                    <InfoRow label="Owner" value={boardEntry.recruiter} colors={colors} />
                    {boardEntry.priority && <InfoRow label="Priority" value={boardEntry.priority} colors={colors} />}
                    {boardEntry.nextStep ? <InfoRow label="Next Step" value={boardEntry.nextStep} colors={colors} /> : null}
                  </View>

                  {/* Your Offer (internal) */}
                  {(boardEntry.offer || boardEntry.nil) && (
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>YOUR OFFER (INTERNAL)</Text>
                      {boardEntry.offer && (
                        <>
                          <InfoRow label="Scholarship" value={`${boardEntry.offer.scholarshipPct}%`} colors={colors} />
                          <InfoRow label="Offer Type" value={boardEntry.offer.offerType} colors={colors} />
                          {boardEntry.offer.conditions ? <InfoRow label="Conditions" value={boardEntry.offer.conditions} colors={colors} /> : null}
                        </>
                      )}
                      {boardEntry.nil && (
                        <>
                          <InfoRow label="NIL Amount" value={boardEntry.nil.amount} colors={colors} />
                          <InfoRow label="NIL Structure" value={boardEntry.nil.structure} colors={colors} />
                          <InfoRow label="NIL Status" value={boardEntry.nil.status} colors={colors} />
                        </>
                      )}
                    </View>
                  )}

                  {/* Recruiting Log Timeline */}
                  <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>RECRUITING LOG</Text>
                    {boardEntry.log.length > 0 ? (
                      [...boardEntry.log].reverse().map(entry => {
                        const meta = LOG_TYPE_META[entry.type];
                        return (
                          <View key={entry.id} style={styles.logEntry}>
                            <View style={styles.logEntryHeader}>
                              <Text style={[styles.logIcon, { color: meta?.color || colors.textTertiary }]}>{meta?.icon || '\u2022'}</Text>
                              <Text style={[styles.logType, { color: meta?.color || colors.textTertiary }]}>{entry.type}</Text>
                              <Text style={[styles.logDate, { color: colors.textTertiary }]}>
                                {entry.timestamp instanceof Date ? entry.timestamp.toLocaleDateString() : ''}
                              </Text>
                              {entry.isPinned && <Text style={styles.logPin}>{'\u{1F4CC}'}</Text>}
                            </View>
                            <Text style={[styles.logSummary, { color: colors.textSecondary }]}>{entry.summary}</Text>
                            {entry.who && (
                              <Text style={[styles.logMeta, { color: colors.textTertiary }]}>with {entry.who}</Text>
                            )}
                          </View>
                        );
                      })
                    ) : (
                      <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>No log entries yet.</Text>
                    )}
                  </View>
                </>
              ) : (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
                    Not on your recruiting board yet.
                  </Text>
                  <Pressable
                    style={[styles.addBoardBtn, { backgroundColor: accent + '20', borderColor: accent + '40' }]}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                  >
                    <Text style={[styles.addBoardBtnText, { color: accent }]}>Add to Board</Text>
                  </Pressable>
                </View>
              )}
            </>
          )}

          {/* ════════════════════════════════════════════
              TAB 5 — NOTES / DEVELOPMENT
              ════════════════════════════════════════════ */}
          {activeTab === 'notes' && (
            <>
              {/* Coach notes */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>COACH NOTES</Text>
                {boardEntry && boardEntry.log.filter(e => e.type === 'Note').length > 0 ? (
                  boardEntry.log.filter(e => e.type === 'Note').slice(-5).map(entry => (
                    <View key={entry.id} style={styles.noteRow}>
                      <Text style={[styles.noteAuthor, { color: colors.textTertiary }]}>{entry.author}</Text>
                      <Text style={[styles.noteText, { color: colors.textSecondary }]}>{entry.summary}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
                    No coach notes yet.
                  </Text>
                )}
              </View>

              {/* Development focus */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>DEVELOPMENT FOCUS</Text>
                <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
                  Development plan not yet generated. Open in Nexus to create one.
                </Text>
              </View>

              {/* Evidence log */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>EVIDENCE LOG</Text>
                <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
                  No scouting notes yet. Attach film clips, game notes, or evaluation tags here.
                </Text>
              </View>

              {/* Link to Development */}
              <Pressable
                style={[styles.linkCard, { backgroundColor: accent + '10', borderColor: accent + '30' }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <Text style={[styles.linkCardText, { color: accent }]}>Open Development filtered to player</Text>
              </Pressable>
            </>
          )}

        </View>
      </ScrollView>
    </BottomSheet>
  );
}

// ── Helper Components ──

function StatCell({ label, value, colors }: { label: string; value?: string; colors: typeof Colors.light }) {
  if (value == null) return null;
  return (
    <View style={styles.statCell}>
      <Text style={[styles.statCellLabel, { color: colors.textTertiary }]}>{label}</Text>
      <Text style={[styles.statCellValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function InfoRow({ label, value, colors }: { label: string; value: string; colors: typeof Colors.light }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function SplitBar({ label, pct, colors, accent }: { label: string; pct: number; colors: typeof Colors.light; accent: string }) {
  const width = Math.min(100, Math.max(0, pct * 100));
  return (
    <View style={styles.splitBarItem}>
      <Text style={[styles.splitBarLabel, { color: colors.textTertiary }]}>{label}</Text>
      <View style={[styles.splitBarBg, { backgroundColor: colors.border }]}>
        <View style={[styles.splitBarFill, { width: `${width}%`, backgroundColor: accent }]} />
      </View>
      <Text style={[styles.splitBarPct, { color: colors.text }]}>{(pct * 100).toFixed(0)}%</Text>
    </View>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  headerSection: { padding: Spacing.md, paddingBottom: 0, gap: Spacing.sm },
  scroll: { maxHeight: '100%' },
  tabContent: { padding: Spacing.md, paddingTop: Spacing.sm, gap: Spacing.sm, paddingBottom: 30 },

  // Identity
  identityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  avatarCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  playerName: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  jerseyBadge: { fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
  playerMeta: { fontSize: 13, fontWeight: '600', marginTop: 2, letterSpacing: 0.3 },

  // Chips
  teamChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth },
  teamChipText: { fontSize: 11, fontWeight: '700' },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusChipText: { fontSize: 11, fontWeight: '700' },

  // Sticky Rating Strip
  ratingStrip: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.sm, gap: 8 },
  ratingStripMain: { flexDirection: 'row', alignItems: 'center', gap: 16, justifyContent: 'center' },
  ratingBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, alignItems: 'center' },
  ratingBadgeVal: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  ratingBadgeLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  ratingMini: { alignItems: 'center' },
  ratingMiniVal: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  ratingMiniLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  ratingTagRow: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  ratingTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  ratingTagText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },

  // Tab pills
  tabRow: { flexDirection: 'row', borderRadius: 10, padding: 3, gap: 2 },
  tabPill: { flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: 'center' },
  tabPillActive: {},
  tabText: { fontSize: 12, fontWeight: '700' },

  // Cards
  card: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 8 },
  sectionTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },

  // Archetype
  archetypeText: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  archetypeConf: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },

  // Clusters (accordion)
  clusterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 28, paddingVertical: 2 },
  clusterLabel: { width: 72, fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  clusterBarContainer: { flex: 1 },
  clusterBarBg: { height: 6, borderRadius: 6, overflow: 'hidden' },
  clusterBarFill: { height: 6, borderRadius: 6 },
  clusterScore: { width: 26, fontSize: 12, fontWeight: '800', textAlign: 'right', letterSpacing: -0.3 },
  chevron: { fontSize: 8, width: 14, textAlign: 'center' },

  // Subclusters (expanded)
  subclusterContainer: { borderRadius: 8, padding: 8, marginTop: 2, marginBottom: 4, gap: 6 },
  subclusterRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  subclusterName: { fontSize: 12, fontWeight: '600', flex: 1 },
  subclusterLevel: { fontSize: 11, fontWeight: '700' },
  subclusterEmpty: { fontSize: 11, fontWeight: '500', fontStyle: 'italic' },

  // Badges
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badgeChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeName: { fontSize: 11, fontWeight: '700' },

  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  statCell: { width: '18%', alignItems: 'center', paddingVertical: 6 },
  statCellLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  statCellValue: { fontSize: 14, fontWeight: '800', marginTop: 2, letterSpacing: -0.3 },
  gpNote: { fontSize: 11, fontWeight: '500', textAlign: 'center', marginTop: 4 },

  // Season chip
  seasonChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth },
  seasonChipText: { fontSize: 12, fontWeight: '700' },

  // Shooting splits
  splitsRow: { gap: 10 },
  splitBarItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  splitBarLabel: { width: 28, fontSize: 11, fontWeight: '700', letterSpacing: 0.3, textAlign: 'right' },
  splitBarBg: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  splitBarFill: { height: 8, borderRadius: 4 },
  splitBarPct: { width: 36, fontSize: 12, fontWeight: '800', textAlign: 'right' },

  // Recruiting
  recruitingStatusRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  stageChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  stageChipText: { fontSize: 12, fontWeight: '700' },
  tempChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tempChipText: { fontSize: 12, fontWeight: '700' },
  addBoardBtn: { marginTop: 8, paddingVertical: 10, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center' },
  addBoardBtnText: { fontSize: 14, fontWeight: '700' },

  // Log
  logEntry: { paddingVertical: 6, gap: 2, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.05)' },
  logEntryHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logIcon: { fontSize: 14 },
  logType: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  logDate: { fontSize: 10, fontWeight: '600', marginLeft: 'auto' },
  logPin: { fontSize: 12 },
  logSummary: { fontSize: 12, fontWeight: '500', lineHeight: 17, marginLeft: 20 },
  logMeta: { fontSize: 11, fontWeight: '500', marginLeft: 20, fontStyle: 'italic' },

  // Notes
  notePreviewRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  notePreviewType: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, width: 40 },
  notePreviewText: { fontSize: 12, fontWeight: '500', flex: 1 },
  noteRow: { gap: 2, paddingVertical: 4 },
  noteAuthor: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  noteText: { fontSize: 12, fontWeight: '500', lineHeight: 17 },

  // Info rows
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  infoValue: { fontSize: 13, fontWeight: '700' },

  // General
  bodyText: { fontSize: 13, fontWeight: '600' },
  placeholderText: { fontSize: 13, fontWeight: '500', fontStyle: 'italic' },
  linkCard: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, alignItems: 'center' },
  linkCardText: { fontSize: 14, fontWeight: '700' },
});
