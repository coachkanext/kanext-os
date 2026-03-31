/**
 * Development Page — Program Development OS (Blocks 0–9)
 *
 * Route: SportsHomeDashboard → DevelopmentPage(context = roster | playerId)
 *
 * RBAC: Assistant Coach / Recruiting Coordinator (execution-level).
 * Can: View team/player development plans, assign/adjust weekly execution tasks,
 *      write coaching notes (v1.1), open in Nexus, view confidence & history.
 * Cannot: Modify scholarship/NIL, override eligibility/compliance, edit
 *         program-wide constraint defaults, delete/overwrite prior snapshots.
 *
 * Development is execution-focused, not financial.
 * No budget levers, eligibility overrides, or cross-program visibility.
 * Snapshots are immutable and versioned.
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAccentColor } from '@/hooks/use-accent-color';
import {
  TEAM_PRIORITIES,
  PLAYER_PLANS,
  PLAYER_ALERTS,
  CURRENT_WEEKLY_PLAN,
  EVIDENCE_QUEUE,
  PROGRESS_SNAPSHOT,
  WEEKLY_NON_NEGOTIABLES,
  type PlayerPlan,
  type ProgressLevel,
  type EvidenceItem,
  type EvidenceStatus,
  type TeamPriority,
  type SessionBlock,
  type AlertType,
} from '@/data/mock-development-v2';

// =============================================================================
// HELPERS
// =============================================================================

function getStatusColor(status: ProgressLevel): string {
  switch (status) {
    case 'achieved': return Brand.success;
    case 'progressing': return Brand.warning;
    case 'needs-work': return Brand.error;
  }
}

function getStatusLabel(status: ProgressLevel): string {
  switch (status) {
    case 'achieved': return 'On Track';
    case 'progressing': return 'Attention';
    case 'needs-work': return 'Risk';
  }
}

function getPriorityColor(rank: number): string {
  if (rank <= 1) return Brand.error;
  if (rank <= 3) return Brand.warning;
  return '#9C9790';
}

function getPriorityLabel(rank: number): string {
  if (rank <= 1) return 'High';
  if (rank <= 3) return 'Medium';
  return 'Low';
}

function getEvidenceTagColor(type: string): string {
  switch (type) {
    case 'clip': return Brand.primary;
    case 'stat': return Brand.success;
    case 'note': return Brand.warning;
    default: return '#9C9790';
  }
}

function getEvidenceStatusColor(status: EvidenceStatus): string {
  switch (status) {
    case 'pending': return '#9C9790';
    case 'reviewed': return Brand.success;
    case 'flagged': return Brand.error;
  }
}

function getAlertColor(type: AlertType): string {
  switch (type) {
    case 'regression': return Brand.error;
    case 'injury': return Brand.warning;
    case 'breakout': return Brand.success;
    case 'milestone': return Brand.primary;
  }
}

function getSessionIcon(type: string): string {
  switch (type) {
    case 'practice': return 'sportscourt.fill';
    case 'lift': return 'dumbbell.fill';
    case 'film': return 'play.rectangle.fill';
    case 'individual': return 'figure.basketball';
    case 'rest': return 'leaf.fill';
    default: return 'circle.fill';
  }
}

// =============================================================================
// SNAPSHOT MOCK DATA
// =============================================================================

const DEV_SNAPSHOTS = [
  { id: 'ds-1', timestamp: 'Feb 22, 2026 · 3:15 PM', confidencePct: 66, notesCount: 12 },
  { id: 'ds-2', timestamp: 'Feb 15, 2026 · 4:30 PM', confidencePct: 63, notesCount: 8 },
  { id: 'ds-3', timestamp: 'Feb 8, 2026 · 2:00 PM', confidencePct: 58, notesCount: 5 },
];

// =============================================================================
// SORT OPTIONS
// =============================================================================

type SortKey = 'status' | 'position' | 'name';

function sortPlayers(plans: PlayerPlan[], key: SortKey): PlayerPlan[] {
  const copy = [...plans];
  switch (key) {
    case 'status': {
      const order: Record<ProgressLevel, number> = { 'needs-work': 0, 'progressing': 1, 'achieved': 2 };
      return copy.sort((a, b) => order[a.progress] - order[b.progress]);
    }
    case 'position':
      return copy.sort((a, b) => a.position.localeCompare(b.position));
    case 'name':
      return copy.sort((a, b) => a.playerName.localeCompare(b.playerName));
  }
}

// =============================================================================
// PROPS
// =============================================================================

interface DevelopmentPageProps {
  onBack: () => void;
  playerId?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function DevelopmentPage({ onBack, playerId: playerIdProp }: DevelopmentPageProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  // ── View Toggle State ──
  const [activeView, setActiveView] = useState<'roster' | 'player'>(playerIdProp ? 'player' : 'roster');

  // ── Player View State ──
  const [selectedPlayerId, setSelectedPlayerId] = useState(playerIdProp || PLAYER_PLANS[0]?.playerId || '');

  // ── Sort State ──
  const [sortKey, setSortKey] = useState<SortKey>('status');

  // ── Plans Accordion ──
  const [plansSection, setPlansSection] = useState<string | null>(null);

  // ── Derived Data ──
  const sortedPlayers = useMemo(() => sortPlayers(PLAYER_PLANS, sortKey), [sortKey]);
  const selectedPlayer = useMemo(
    () => PLAYER_PLANS.find(p => p.playerId === selectedPlayerId) ?? PLAYER_PLANS[0],
    [selectedPlayerId],
  );
  const playerAlerts = useMemo(
    () => PLAYER_ALERTS.filter(a => a.playerId === selectedPlayerId),
    [selectedPlayerId],
  );
  const playerEvidence = useMemo(
    () => EVIDENCE_QUEUE.filter(e => e.playerId === selectedPlayerId),
    [selectedPlayerId],
  );
  const availability = useMemo(() => {
    const alert = PLAYER_ALERTS.find(a => a.playerId === selectedPlayerId && a.type === 'injury');
    return alert ? 'Injured' : 'Available';
  }, [selectedPlayerId]);

  // ── Navigate to Player View ──
  const openPlayer = useCallback((pid: string) => {
    setSelectedPlayerId(pid);
    setActiveView('player');
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // ══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════════

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>

      {/* ═══════ BLOCK 0 — STICKY HEADER ═══════ */}
      <View style={[styles.stickyHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={20} color={accent} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Development</Text>
          <View style={[styles.chip, { backgroundColor: colors.card }]}>
            <Text style={[styles.chipText, { color: colors.textSecondary }]}>2025–26</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Pressable onPress={() => {}} hitSlop={8} accessibilityLabel="Open in Nexus">
            <IconSymbol name="brain" size={18} color={accent} />
          </Pressable>
          <Pressable onPress={() => {}} hitSlop={8} accessibilityLabel="Add Note">
            <IconSymbol name="plus" size={18} color={colors.textTertiary} />
          </Pressable>
        </View>
      </View>

      {/* Chips: dev_confidence_pct | last_updated */}
      <View style={[styles.chipRow, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={[styles.chip, { backgroundColor: Brand.warning + '20' }]}>
          <Text style={[styles.chipText, { color: Brand.warning }]}>{PROGRESS_SNAPSHOT.overallScore}%</Text>
        </View>
        <View style={[styles.chip, { backgroundColor: colors.card }]}>
          <Text style={[styles.chipText, { color: colors.textSecondary }]}>Updated Feb 22, 2026</Text>
        </View>
      </View>

      {/* ═══════ SCROLLABLE CONTENT ═══════ */}
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >

        {/* ═══════ BLOCK 1 — VIEW TOGGLE ═══════ */}
        <View style={[styles.segmentRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable
            style={[styles.segmentBtn, activeView === 'roster' && { backgroundColor: accent + '20' }]}
            onPress={() => setActiveView('roster')}
          >
            <Text style={[styles.segmentText, { color: activeView === 'roster' ? accent : colors.textSecondary }]}>
              Roster View
            </Text>
          </Pressable>
          <Pressable
            style={[styles.segmentBtn, activeView === 'player' && { backgroundColor: accent + '20' }]}
            onPress={() => setActiveView('player')}
          >
            <Text style={[styles.segmentText, { color: activeView === 'player' ? accent : colors.textSecondary }]}>
              Player View
            </Text>
          </Pressable>
        </View>

        {activeView === 'roster' ? (
          <>
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* ROSTER VIEW (Blocks 2–4)                                      */}
            {/* ═══════════════════════════════════════════════════════════════ */}

            {/* ═══════ BLOCK 2 — TEAM DEVELOPMENT FOCUS (Top 3) ═══════ */}
            <BlockHeader title="Team Development Focus" colors={colors} />
            <View style={[styles.focusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {TEAM_PRIORITIES.slice(0, 3).map((tp, i) => (
                <View key={tp.id} style={[styles.focusItem, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
                  <View style={styles.focusRow}>
                    <Text style={[styles.focusLabel, { color: colors.text }]} numberOfLines={1}>{tp.title}</Text>
                    <View style={[styles.priorityTag, { backgroundColor: getPriorityColor(tp.rank) + '20' }]}>
                      <Text style={[styles.priorityTagText, { color: getPriorityColor(tp.rank) }]}>
                        {getPriorityLabel(tp.rank)}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.focusDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                    {tp.description}
                  </Text>
                </View>
              ))}
            </View>

            {/* ═══════ BLOCK 3 — DEVELOPMENT BOARD (Sortable List) ═══════ */}
            <BlockHeader title="Development Board" colors={colors} />

            {/* Sort pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.sortStrip}
              contentContainerStyle={styles.sortStripContent}
            >
              {([
                { key: 'status' as SortKey, label: 'Status (Risk first)' },
                { key: 'position' as SortKey, label: 'Position' },
                { key: 'name' as SortKey, label: 'Name A–Z' },
              ]).map(opt => {
                const isActive = sortKey === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    style={[
                      styles.sortPill,
                      {
                        backgroundColor: isActive ? accent + '20' : colors.card,
                        borderColor: isActive ? accent : colors.border,
                      },
                    ]}
                    onPress={() => {
                      setSortKey(opt.key);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Text style={[styles.sortPillText, { color: isActive ? accent : colors.textSecondary }]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Player rows */}
            {sortedPlayers.map(player => (
              <Pressable
                key={player.playerId}
                style={[styles.boardRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => openPlayer(player.playerId)}
              >
                <View style={styles.boardRowLeft}>
                  <View style={styles.boardNameRow}>
                    <Text style={[styles.boardName, { color: colors.text }]}>{player.playerName}</Text>
                    <Text style={[styles.boardPos, { color: colors.textTertiary }]}>#{player.number} · {player.position}</Text>
                  </View>
                  {/* Dev Status chip */}
                  <View style={[styles.statusChip, { backgroundColor: getStatusColor(player.progress) + '18' }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(player.progress) }]} />
                    <Text style={[styles.statusChipText, { color: getStatusColor(player.progress) }]}>
                      {getStatusLabel(player.progress)}
                    </Text>
                  </View>
                  {/* Focus tags (max 3) */}
                  <View style={styles.tagRow}>
                    {player.topGaps.slice(0, 3).map((gap, i) => (
                      <View key={i} style={[styles.focusTag, { backgroundColor: colors.background }]}>
                        <Text style={[styles.focusTagText, { color: colors.textSecondary }]} numberOfLines={1}>
                          {gap}
                        </Text>
                      </View>
                    ))}
                  </View>
                  {/* Next action */}
                  {player.planBlocks[0] && (
                    <Text style={[styles.nextAction, { color: colors.textTertiary }]} numberOfLines={1}>
                      Next: {player.planBlocks[0].title}
                    </Text>
                  )}
                </View>
                <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
              </Pressable>
            ))}

            {/* ═══════ BLOCK 4 — PLANS (Team-Level) ═══════ */}
            <BlockHeader title="Plans" colors={colors} />
            {(['Skill Plans', 'Strength & Conditioning', 'Film + Habits'] as const).map(section => {
              const isOpen = plansSection === section;
              return (
                <View key={section}>
                  <Pressable
                    style={[
                      styles.accordionHeader,
                      { backgroundColor: colors.card, borderColor: colors.border },
                      isOpen && styles.accordionHeaderOpen,
                    ]}
                    onPress={() => setPlansSection(isOpen ? null : section)}
                  >
                    <Text style={[styles.accordionTitle, { color: colors.text }]}>{section}</Text>
                    <IconSymbol
                      name={isOpen ? 'chevron.up' : 'chevron.down'}
                      size={14}
                      color={colors.textSecondary}
                    />
                  </Pressable>
                  {isOpen && (
                    <View style={[styles.accordionBody, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      {section === 'Skill Plans' && (
                        <>
                          <PlanItem
                            goal="Improve team 3PT% to conference average (34%+)"
                            cadence="Daily spot-up reps (200 makes) + 2x/week off-screen movement drills"
                            kpi="Weekly 3PT% tracking — target +2% by March"
                            owner="Coach Pearson (Shooting Coach)"
                            colors={colors}
                          />
                          <PlanItem
                            goal="Reduce half-court turnover rate to <13%"
                            cadence="3x/week pressure dribbling + 2x/week film on late-clock reads"
                            kpi="TO% per game — track weekly average"
                            owner="Coach Davis (HC)"
                            colors={colors}
                          />
                          <PlanItem
                            goal="Develop post-entry passing package"
                            cadence="2x/week 4-on-3 post passing drill"
                            kpi="Post entry assist rate — target 12%+ by March"
                            owner="Coach Jackson (Post Coach)"
                            colors={colors}
                          />
                        </>
                      )}
                      {section === 'Strength & Conditioning' && (
                        <>
                          <PlanItem
                            goal="Improve 4th quarter conditioning — reduce late-game fatigue"
                            cadence="3x/week lower body + 2x/week gassers"
                            kpi="4Q +/- differential improvement"
                            owner="Coach Martinez (S&C)"
                            colors={colors}
                          />
                          <PlanItem
                            goal="Upper body strength for post players"
                            cadence="2x/week upper body focus"
                            kpi="Post-up PPP improvement"
                            owner="Coach Martinez (S&C)"
                            colors={colors}
                          />
                        </>
                      )}
                      {section === 'Film + Habits' && (
                        <>
                          <PlanItem
                            goal="Film review before every practice — no exceptions"
                            cadence="Daily — 30–45 min pre-practice"
                            kpi="Attendance + engagement tracking"
                            owner="Coach Davis (HC)"
                            colors={colors}
                          />
                          <PlanItem
                            goal="Defensive closeout drill opens every practice"
                            cadence="Daily — first 10 min of every practice"
                            kpi="Closeout contest rate in games"
                            owner="Coach Williams (Defense)"
                            colors={colors}
                          />
                          <PlanItem
                            goal="200 made free throws per player per week"
                            cadence="Split across practice + individual sessions"
                            kpi="Weekly FT% tracking"
                            owner="All Players"
                            colors={colors}
                          />
                        </>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </>
        ) : (
          <>
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* PLAYER VIEW (Blocks 5–9)                                      */}
            {/* ═══════════════════════════════════════════════════════════════ */}

            {/* ═══════ BLOCK 5 — PLAYER HEADER CARD ═══════ */}
            <View style={[styles.playerHeaderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.playerHeaderTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.playerName, { color: colors.text }]}>{selectedPlayer.playerName}</Text>
                  <Text style={[styles.playerBio, { color: colors.textSecondary }]}>
                    #{selectedPlayer.number} · {selectedPlayer.position} · {selectedPlayer.roleTarget}
                  </Text>
                </View>
              </View>
              {/* Chips row */}
              <View style={styles.playerChips}>
                {/* Availability */}
                <View style={[
                  styles.statusChip,
                  { backgroundColor: (availability === 'Available' ? Brand.success : Brand.warning) + '18' },
                ]}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: availability === 'Available' ? Brand.success : Brand.warning },
                  ]} />
                  <Text style={[
                    styles.statusChipText,
                    { color: availability === 'Available' ? Brand.success : Brand.warning },
                  ]}>
                    {availability}
                  </Text>
                </View>
                {/* Dev Status */}
                <View style={[styles.statusChip, { backgroundColor: getStatusColor(selectedPlayer.progress) + '18' }]}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(selectedPlayer.progress) }]} />
                  <Text style={[styles.statusChipText, { color: getStatusColor(selectedPlayer.progress) }]}>
                    {getStatusLabel(selectedPlayer.progress)}
                  </Text>
                </View>
              </View>
              {/* Open Player in Nexus */}
              <Pressable style={[styles.nexusBtn, { backgroundColor: accent }]} onPress={() => {}}>
                <IconSymbol name="brain" size={14} color="#fff" />
                <Text style={styles.nexusBtnText}>Open Player in Nexus</Text>
              </Pressable>
            </View>

            {/* ═══════ BLOCK 6 — FOCUS AREAS (Top 3) ═══════ */}
            <BlockHeader title="Focus Areas" colors={colors} />
            {selectedPlayer.planBlocks.slice(0, 3).map(block => (
              <View key={block.id} style={[styles.focusAreaCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.focusAreaLabel, { color: colors.text }]}>{block.title}</Text>
                <View style={styles.focusAreaRow}>
                  <Text style={[styles.focusAreaTag, { color: colors.textTertiary }]}>
                    {block.cluster} · {block.trait}
                  </Text>
                  <View style={[styles.statusChip, { backgroundColor: getStatusColor(block.status) + '18' }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(block.status) }]} />
                    <Text style={[styles.statusChipText, { color: getStatusColor(block.status) }]}>
                      {getStatusLabel(block.status)}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.focusAreaWhy, { color: colors.textSecondary }]}>
                  Why: {block.cluster} development — {block.trait}
                </Text>
                {block.drills[0] && (
                  <Text style={[styles.focusAreaDrill, { color: colors.textSecondary }]}>
                    This week: {block.drills[0]}
                  </Text>
                )}
              </View>
            ))}

            {/* ═══════ BLOCK 7 — WEEKLY PLAN (Execution Checklist) ═══════ */}
            <BlockHeader title="Weekly Plan" colors={colors} />
            <Text style={[styles.weekLabel, { color: colors.textTertiary }]}>
              {CURRENT_WEEKLY_PLAN.weekLabel} · {CURRENT_WEEKLY_PLAN.startDate}–{CURRENT_WEEKLY_PLAN.endDate}
            </Text>

            {/* Group sessions by type */}
            {(['practice', 'lift', 'film', 'individual', 'rest'] as const).map(sessionType => {
              const sessions: { day: string; session: SessionBlock }[] = [];
              CURRENT_WEEKLY_PLAN.days.forEach(day => {
                day.sessions.forEach(s => {
                  if (s.type === sessionType) {
                    sessions.push({ day: day.day, session: s });
                  }
                });
              });
              if (sessions.length === 0) return null;
              const groupLabel = sessionType === 'practice' ? 'On-Court' :
                sessionType === 'lift' ? 'Weights' :
                sessionType === 'film' ? 'Film' :
                sessionType === 'individual' ? 'Individual' : 'Recovery';
              return (
                <View key={sessionType} style={styles.weekGroup}>
                  <View style={styles.weekGroupHeader}>
                    <IconSymbol name={getSessionIcon(sessionType) as any} size={14} color={accent} />
                    <Text style={[styles.weekGroupLabel, { color: colors.text }]}>{groupLabel}</Text>
                    <Text style={[styles.weekGroupCount, { color: colors.textTertiary }]}>{sessions.length}</Text>
                  </View>
                  {sessions.map(({ day, session }) => (
                    <View
                      key={session.id}
                      style={[styles.weekItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                    >
                      <View style={styles.weekItemRow}>
                        <Text style={[styles.weekItemDay, { color: colors.textTertiary }]}>{day.slice(0, 3)}</Text>
                        <Text style={[styles.weekItemTitle, { color: colors.text }]} numberOfLines={1}>{session.title}</Text>
                        <Text style={[styles.weekItemFreq, { color: colors.textTertiary }]}>{session.duration}</Text>
                      </View>
                      {session.focus && (
                        <Text style={[styles.weekItemFocus, { color: colors.textSecondary }]} numberOfLines={1}>
                          {session.focus}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              );
            })}

            {/* ═══════ BLOCK 8 — EVIDENCE LOG (Read-Only Timeline) ═══════ */}
            <BlockHeader title="Evidence Log" colors={colors} />
            {playerEvidence.length > 0 ? (
              playerEvidence.map(ev => (
                <View key={ev.id} style={[styles.evidenceRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.evidenceLeft}>
                    <View style={[styles.evidenceLine, { backgroundColor: colors.border }]} />
                    <View style={[styles.evidenceDot, { backgroundColor: getEvidenceTagColor(ev.type) }]} />
                  </View>
                  <View style={styles.evidenceContent}>
                    <View style={styles.evidenceHeader}>
                      <Text style={[styles.evidenceDate, { color: colors.textTertiary }]}>{ev.date}</Text>
                      <View style={[styles.evidenceTag, { backgroundColor: getEvidenceTagColor(ev.type) + '20' }]}>
                        <Text style={[styles.evidenceTagText, { color: getEvidenceTagColor(ev.type) }]}>{ev.type}</Text>
                      </View>
                      <View style={[styles.evidenceStatusBadge, { backgroundColor: getEvidenceStatusColor(ev.status) + '20' }]}>
                        <Text style={[styles.evidenceStatusText, { color: getEvidenceStatusColor(ev.status) }]}>{ev.status}</Text>
                      </View>
                    </View>
                    <Text style={[styles.evidenceDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                      {ev.description}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={[styles.emptyBlock, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.emptyBlockText, { color: colors.textTertiary }]}>
                  No evidence entries for this player yet.
                </Text>
              </View>
            )}

            {/* ═══════ BLOCK 9 — SNAPSHOT HISTORY ═══════ */}
            <BlockHeader title="Snapshot History" colors={colors} />
            <Text style={[styles.snapshotSubtitle, { color: colors.textTertiary }]}>
              Snapshots are immutable and versioned. Tap to view.
            </Text>
            {DEV_SNAPSHOTS.map(snap => (
              <Pressable
                key={snap.id}
                style={[styles.snapshotRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.snapshotTimestamp, { color: colors.text }]}>{snap.timestamp}</Text>
                  <View style={styles.snapshotMeta}>
                    <View style={[styles.chip, { backgroundColor: Brand.warning + '20' }]}>
                      <Text style={[styles.chipText, { color: Brand.warning }]}>{snap.confidencePct}%</Text>
                    </View>
                    <Text style={[styles.snapshotNotes, { color: colors.textTertiary }]}>{snap.notesCount} notes</Text>
                  </View>
                </View>
                <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function BlockHeader({ title, colors }: { title: string; colors: typeof Colors.light }) {
  return (
    <View style={styles.blockHeader}>
      <Text style={[styles.blockTitle, { color: colors.text }]}>{title}</Text>
    </View>
  );
}

function PlanItem({
  goal, cadence, kpi, owner, colors,
}: {
  goal: string;
  cadence: string;
  kpi: string;
  owner: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={[styles.planItem, { borderBottomColor: colors.border }]}>
      <Text style={[styles.planGoal, { color: colors.text }]}>{goal}</Text>
      <View style={styles.planDetailRow}>
        <Text style={[styles.planDetailLabel, { color: colors.textTertiary }]}>Cadence</Text>
        <Text style={[styles.planDetailValue, { color: colors.textSecondary }]}>{cadence}</Text>
      </View>
      <View style={styles.planDetailRow}>
        <Text style={[styles.planDetailLabel, { color: colors.textTertiary }]}>KPI</Text>
        <Text style={[styles.planDetailValue, { color: colors.textSecondary }]}>{kpi}</Text>
      </View>
      <View style={styles.planDetailRow}>
        <Text style={[styles.planDetailLabel, { color: colors.textTertiary }]}>Owner</Text>
        <Text style={[styles.planDetailValue, { color: colors.textSecondary }]}>{owner}</Text>
      </View>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  root: { flex: 1 },

  // ── Block 0 — Sticky Header ──
  stickyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 56,
  },
  backBtn: {
    width: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  headerRight: {
    flexDirection: 'row',
    gap: 14,
    width: 72,
    justifyContent: 'flex-end',
  },

  // ── Chip Row ──
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  chipText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },

  // ── Scroll ──
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },

  // ── Block 1 — View Toggle ──
  segmentRow: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  segmentText: { fontSize: 13, fontWeight: '600' },

  // ── Block Header ──
  blockHeader: { marginTop: Spacing.lg, marginBottom: Spacing.sm },
  blockTitle: { fontSize: 16, fontWeight: '700' },

  // ── Block 2 — Team Development Focus ──
  focusCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  focusItem: {
    padding: 14,
  },
  focusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  focusLabel: { fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  focusDescription: { fontSize: 12, lineHeight: 18 },
  priorityTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  priorityTagText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },

  // ── Block 3 — Development Board ──
  sortStrip: { marginBottom: Spacing.sm },
  sortStripContent: { gap: 8 },
  sortPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  sortPillText: { fontSize: 12, fontWeight: '600' },

  boardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  boardRowLeft: { flex: 1 },
  boardNameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 6,
  },
  boardName: { fontSize: 14, fontWeight: '700' },
  boardPos: { fontSize: 11 },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusChipText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  focusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  focusTagText: { fontSize: 10, fontWeight: '600' },
  nextAction: { fontSize: 11, marginTop: 2 },

  // ── Block 4 — Plans Accordion ──
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 1,
  },
  accordionHeaderOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  accordionTitle: { fontSize: 14, fontWeight: '700' },
  accordionBody: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopWidth: 0,
  },
  planItem: {
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  planGoal: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  planDetailRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  planDetailLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    width: 60,
    marginTop: 1,
  },
  planDetailValue: { fontSize: 12, lineHeight: 18, flex: 1 },

  // ── Block 5 — Player Header Card ──
  playerHeaderCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  playerHeaderTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  playerName: { fontSize: 18, fontWeight: '800' },
  playerBio: { fontSize: 12, marginTop: 2, lineHeight: 18 },
  playerChips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  nexusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
  },
  nexusBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  // ── Block 6 — Focus Areas ──
  focusAreaCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  focusAreaLabel: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  focusAreaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  focusAreaTag: { fontSize: 11 },
  focusAreaWhy: { fontSize: 12, lineHeight: 18, marginBottom: 4 },
  focusAreaDrill: { fontSize: 12, lineHeight: 18 },

  // ── Block 7 — Weekly Plan ──
  weekLabel: { fontSize: 11, marginBottom: Spacing.sm },
  weekGroup: { marginBottom: Spacing.md },
  weekGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  weekGroupLabel: { fontSize: 13, fontWeight: '700' },
  weekGroupCount: { fontSize: 11 },
  weekItem: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  weekItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weekItemDay: { fontSize: 11, fontWeight: '700', width: 28 },
  weekItemTitle: { fontSize: 13, fontWeight: '600', flex: 1 },
  weekItemFreq: { fontSize: 11 },
  weekItemFocus: { fontSize: 11, marginTop: 4, marginLeft: 36 },

  // ── Block 8 — Evidence Log ──
  evidenceRow: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  evidenceLeft: {
    width: 20,
    alignItems: 'center',
    marginRight: 8,
  },
  evidenceLine: {
    position: 'absolute',
    top: 10,
    bottom: -16,
    width: 1,
  },
  evidenceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 2,
  },
  evidenceContent: { flex: 1 },
  evidenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  evidenceDate: { fontSize: 11 },
  evidenceTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  evidenceTagText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  evidenceStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  evidenceStatusText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  evidenceDesc: { fontSize: 12, lineHeight: 18 },

  // ── Block 9 — Snapshot History ──
  snapshotSubtitle: { fontSize: 11, marginBottom: Spacing.sm },
  snapshotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  snapshotTimestamp: { fontSize: 13, fontWeight: '600' },
  snapshotMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  snapshotNotes: { fontSize: 11 },

  // ── Empty state ──
  emptyBlock: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyBlockText: { fontSize: 13 },
});
