/**
 * Game Plan Page — Pregame Scout Packet (Blocks 0–5, Sections A–I)
 *
 * RBAC: Assistant Coach / Recruiting Coordinator (execution-level).
 * Read-only. No Lock button. All regeneration routes to Nexus.
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Text, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { KaNeXT_NEXT_GAME_ID, KaNeXT_LAST_GAME_ID, KaNeXT_GAMES } from '@/data/fmu';
import { getGamePlanV2 } from '@/data/game-plan-v2';
import type { GamePlanV2Packet, ScoutConfidenceGate } from './game-plan-types';

// Section components (reuse existing)
import { S02OppOffense } from './sections/s02-opp-offense';
import { S04ShotProfile } from './sections/s04-shot-profile';
import { S05ActionsTriggers } from './sections/s05-actions-triggers';
import { S03OppDefense } from './sections/s03-opp-defense';
import { S06SituationsPackage } from './sections/s06-situations-package';
import { S01DecisionSummary } from './sections/s01-decision-summary';
import { S07RotationBoard } from './sections/s07-rotation-board';
import { S08PlayerCards } from './sections/s08-player-cards';
import { S10ScoutConfidence } from './sections/s10-scout-confidence';

// ── Helpers ──

function getConfidenceColor(pct: number): string {
  if (pct >= 85) return Brand.success;
  if (pct >= 70) return Brand.primary;
  if (pct >= 55) return Brand.warning;
  return Brand.error;
}

type PacketStatus = 'draft' | 'in_review' | 'locked' | 'archived';

const STATUS_COLORS: Record<PacketStatus, string> = {
  draft: '#A1A1AA',
  in_review: '#F59E0B',
  locked: '#22C55E',
  archived: '#52525B',
};

const STATUS_LABELS: Record<PacketStatus, string> = {
  draft: 'DRAFT',
  in_review: 'IN REVIEW',
  locked: 'LOCKED',
  archived: 'ARCHIVED',
};

// Derive mock packet status from scout confidence
function deriveStatus(conf: ScoutConfidenceGate): PacketStatus {
  if (conf.pct >= 85) return 'locked';
  if (conf.pct >= 70) return 'in_review';
  return 'draft';
}

// Section metadata for A–I ordering
const SECTION_DEFS = [
  { letter: 'A', title: 'Opp Offensive Identity' },
  { letter: 'B', title: 'Shot Profile' },
  { letter: 'C', title: 'Actions & Triggers' },
  { letter: 'D', title: 'Opp Defensive Identity' },
  { letter: 'E', title: 'Required Situations' },
  { letter: 'F', title: 'Leverage Plan' },
  { letter: 'G', title: 'Rotation Board' },
  { letter: 'H', title: 'Player Cards' },
  { letter: 'I', title: 'Scout Confidence Gate' },
] as const;

// Mock snapshot history
const MOCK_HISTORY = [
  { id: '1', timestamp: 'Feb 24, 2026 — 9:42 PM', status: 'locked' as PacketStatus, confidence: 91, dataVersion: 'v3.1' },
  { id: '2', timestamp: 'Feb 23, 2026 — 3:15 PM', status: 'in_review' as PacketStatus, confidence: 78, dataVersion: 'v2.4' },
  { id: '3', timestamp: 'Feb 22, 2026 — 11:00 AM', status: 'draft' as PacketStatus, confidence: 62, dataVersion: 'v1.0' },
];

// ── Props ──

interface GamePlanPageProps {
  onBack: () => void;
  gameId?: string;
}

// ── Component ──

export function GamePlanPage({ onBack, gameId: gameIdProp }: GamePlanPageProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  // Game selector state — fall back through: prop → next game → last game → any game
  const upcomingGames = useMemo(
    () => KaNeXT_GAMES.filter(g => g.status === 'upcoming').slice(0, 8),
    [],
  );
  const fallbackGameId = KaNeXT_NEXT_GAME_ID || KaNeXT_LAST_GAME_ID || KaNeXT_GAMES[KaNeXT_GAMES.length - 1]?.id || '';
  const [selectedGameId, setSelectedGameId] = useState(gameIdProp || fallbackGameId);
  const selectorGames = useMemo(
    () => upcomingGames.length > 0
      ? upcomingGames
      : KaNeXT_GAMES.filter(g => g.status === 'final').slice(-8).reverse(),
    [upcomingGames],
  );
  const [selectorOpen, setSelectorOpen] = useState(false);

  // Inputs Used collapse state
  const [inputsExpanded, setInputsExpanded] = useState(false);

  // Load packet
  const packet = useMemo(
    () => (selectedGameId ? getGamePlanV2(selectedGameId) : null),
    [selectedGameId],
  );

  const status = packet ? deriveStatus(packet.scoutConfidence) : 'draft';
  const confColor = packet ? getConfidenceColor(packet.scoutConfidence.pct) : '#A1A1AA';

  const handleShare = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!packet) return;
    try {
      await Share.share({
        message: `Game Plan: ${packet.homeAway === 'Home' ? 'vs' : '@'} ${packet.opponent} — ${packet.date}`,
      });
    } catch {}
  }, [packet]);

  // ── Empty state ──
  if (!packet) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Block 0 — Header (empty) */}
        <View style={[styles.stickyHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
            <IconSymbol name="chevron.left" size={20} color={accent} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Game Plan</Text>
          <View style={{ width: 72 }} />
        </View>
        <View style={styles.emptyState}>
          <IconSymbol name="sportscourt.fill" size={48} color={colors.textTertiary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No scout packet generated yet.</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Generate in Nexus to create your pregame packet.
          </Text>
          <Pressable style={[styles.nexusBtn, { backgroundColor: accent }]} onPress={() => {}}>
            <Text style={styles.nexusBtnText}>Generate in Nexus</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* ===== BLOCK 0 — STICKY HEADER ===== */}
      <View style={[styles.stickyHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        {/* Left: Back */}
        <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={20} color={accent} />
        </Pressable>

        {/* Center: Opponent info */}
        <View style={styles.headerCenter}>
          <Text style={[styles.headerOpponent, { color: colors.text }]} numberOfLines={1}>
            {packet.homeAway === 'Home' ? 'vs' : '@'} {packet.opponent}
          </Text>
          <Text style={[styles.headerMeta, { color: colors.textSecondary }]}>
            {packet.date} · {packet.homeAway}
          </Text>
        </View>

        {/* Right: Actions */}
        <View style={styles.headerRight}>
          <Pressable onPress={() => {}} hitSlop={8}>
            <IconSymbol name="brain" size={18} color={colors.textTertiary} />
          </Pressable>
          <Pressable onPress={handleShare} hitSlop={8}>
            <IconSymbol name="square.and.arrow.up" size={18} color={colors.textTertiary} />
          </Pressable>
        </View>
      </View>

      {/* Status + Confidence chips */}
      <View style={[styles.chipRow, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        {status === 'locked' && (
          <View style={[styles.chip, { backgroundColor: STATUS_COLORS.locked + '20' }]}>
            <Text style={[styles.chipText, { color: STATUS_COLORS.locked }]}>LOCKED</Text>
          </View>
        )}
        <View style={[styles.chip, { backgroundColor: colors.card }]}>
          <Text style={[styles.chipText, { color: colors.textSecondary }]}>v1.0-boxscore</Text>
        </View>
        <View style={[styles.chip, { backgroundColor: confColor + '20' }]}>
          <Text style={[styles.chipText, { color: confColor }]}>{packet.scoutConfidence.pct}%</Text>
        </View>
        {packet.scoutConfidence.traceNotes.length > 0 && (
          <View style={[styles.chip, { backgroundColor: colors.card }]}>
            <View style={[styles.traceDot, { backgroundColor: Brand.warning }]} />
            <Text style={[styles.chipText, { color: colors.textSecondary }]}>{packet.scoutConfidence.traceNotes.length} notes</Text>
          </View>
        )}
      </View>

      {/* ===== SCROLLABLE CONTENT ===== */}
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== BLOCK 1 — GAME SELECTOR ===== */}
        {!gameIdProp && selectorGames.length > 1 && (
          <View style={styles.block}>
            <Pressable
              style={[styles.selectorBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setSelectorOpen(!selectorOpen)}
            >
              <Text style={[styles.selectorText, { color: colors.text }]}>
                {selectedGameId === fallbackGameId
                  ? (upcomingGames.length > 0 ? 'Next Game' : 'Most Recent')
                  : `vs ${packet.opponent}`}
              </Text>
              <IconSymbol name={selectorOpen ? 'chevron.up' : 'chevron.down'} size={12} color={colors.textSecondary} />
            </Pressable>
            {selectorOpen && (
              <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {selectorGames.map((g) => (
                  <Pressable
                    key={g.id}
                    style={[styles.dropdownItem, g.id === selectedGameId && { backgroundColor: accent + '18' }]}
                    onPress={() => { setSelectedGameId(g.id); setSelectorOpen(false); }}
                  >
                    <Text style={[styles.dropdownText, { color: colors.text }]}>vs {g.opponent}</Text>
                    <Text style={[styles.dropdownMeta, { color: colors.textSecondary }]}>{g.date} · {g.location}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ===== BLOCK 2 — SNAPSHOT STATUS CARD ===== */}
        <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.statusRow}>
            <View style={[styles.statusPill, { backgroundColor: STATUS_COLORS[status] + '20' }]}>
              <Text style={[styles.statusPillText, { color: STATUS_COLORS[status] }]}>{STATUS_LABELS[status]}</Text>
            </View>
            <Text style={[styles.statusTimestamp, { color: colors.textTertiary }]}>
              Generated Feb 24, 2026 · 9:42 PM
            </Text>
          </View>
          <Text style={[styles.statusGenBy, { color: colors.textSecondary }]}>Generated by Nexus AI</Text>
          <View style={styles.statusBtnRow}>
            <Pressable style={[styles.statusBtn, { backgroundColor: accent }]} onPress={() => {}}>
              <Text style={styles.statusBtnTextPrimary}>Open in Nexus</Text>
            </Pressable>
            <Pressable style={[styles.statusBtn, { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 }]} onPress={() => {}}>
              <Text style={[styles.statusBtnTextSecondary, { color: colors.textSecondary }]}>Regenerate</Text>
            </Pressable>
            <Pressable style={[styles.statusBtn, { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 }]} onPress={() => {}}>
              <Text style={[styles.statusBtnTextSecondary, { color: colors.textSecondary }]}>History</Text>
            </Pressable>
          </View>
        </View>

        {/* ===== BLOCK 3 — INPUTS USED (collapsed by default) ===== */}
        <Pressable
          style={[styles.inputsHeader, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setInputsExpanded(!inputsExpanded)}
        >
          <View style={styles.inputsHeaderLeft}>
            <Text style={[styles.inputsTitle, { color: colors.text }]}>Inputs Used</Text>
            <View style={[styles.chip, { backgroundColor: colors.background }]}>
              <Text style={[styles.chipText, { color: colors.textSecondary }]}>v1.0-boxscore</Text>
            </View>
            <View style={[styles.chip, { backgroundColor: colors.background }]}>
              <Text style={[styles.chipText, { color: colors.textSecondary }]}>{packet.scoutConfidence.traceNotes.length} trace</Text>
            </View>
          </View>
          <IconSymbol name={inputsExpanded ? 'chevron.up' : 'chevron.down'} size={14} color={colors.textSecondary} />
        </Pressable>
        {inputsExpanded && (
          <View style={[styles.inputsBody, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Opponent rotation */}
            <Text style={[styles.inputsLabel, { color: colors.textSecondary }]}>OPPONENT ROTATION</Text>
            {packet.playerCards.slice(0, 5).map((pc, i) => (
              <Text key={i} style={[styles.inputsItem, { color: colors.text }]}>#{pc.jersey} {pc.name} — {pc.threatType}</Text>
            ))}

            {/* Team Truth KR */}
            <Text style={[styles.inputsLabel, { color: colors.textSecondary, marginTop: 12 }]}>TEAM TRUTH KR</Text>
            <Text style={[styles.inputsItem, { color: colors.text }]}>
              Offense: {packet.oppOffense.osie.system} · Defense: {packet.oppDefense.dsie.system}
            </Text>

            {/* OSIE / DSIE */}
            <Text style={[styles.inputsLabel, { color: colors.textSecondary, marginTop: 12 }]}>SYSTEM IDENTITY</Text>
            <Text style={[styles.inputsItem, { color: colors.text }]}>
              OSIE: {packet.oppOffense.osie.system} ({packet.oppOffense.osie.pace})
            </Text>
            <Text style={[styles.inputsItem, { color: colors.text }]}>
              DSIE: {packet.oppDefense.dsie.system} ({packet.oppDefense.dsie.pressure} pressure)
            </Text>

            {/* Trace Notes */}
            <Text style={[styles.inputsLabel, { color: colors.textSecondary, marginTop: 12 }]}>TRACE NOTES</Text>
            {packet.scoutConfidence.traceNotes.map((note, i) => (
              <Text key={i} style={[styles.inputsItem, { color: colors.textTertiary }]}>{note}</Text>
            ))}
          </View>
        )}

        {/* ===== BLOCK 4 — THE PACKET (Sections A → I) ===== */}
        <View style={styles.packetHeader}>
          <Text style={[styles.packetTitle, { color: colors.text }]}>Scout Packet</Text>
          <Text style={[styles.packetSubtitle, { color: colors.textSecondary }]}>9 sections · {packet.scoutConfidence.dataTier}</Text>
        </View>

        {/* Section A — Opp Offensive Identity */}
        <SectionBadge letter="A" title="Opp Offensive Identity" colors={colors} accent={accent} />
        <S02OppOffense data={packet.oppOffense} />

        {/* Section B — Shot Profile */}
        <SectionBadge letter="B" title="Shot Profile" colors={colors} accent={accent} />
        <S04ShotProfile data={packet.shotProfile} />

        {/* Section C — Actions & Triggers */}
        <SectionBadge letter="C" title="Actions & Triggers" colors={colors} accent={accent} />
        <S05ActionsTriggers actions={packet.actionsLibrary} />

        {/* Section D — Opp Defensive Identity */}
        <SectionBadge letter="D" title="Opp Defensive Identity" colors={colors} accent={accent} />
        <S03OppDefense data={packet.oppDefense} />

        {/* Section E — Required Situations */}
        <SectionBadge letter="E" title="Required Situations" colors={colors} accent={accent} />
        <S06SituationsPackage plays={packet.situationsPackage} />

        {/* Section F — Leverage Plan */}
        <SectionBadge letter="F" title="Leverage Plan" colors={colors} accent={accent} />
        <S01DecisionSummary
          bullets={packet.decisionSummary.bullets}
          doNotBreak={packet.decisionSummary.doNotBreak}
        />

        {/* Section G — Rotation Board */}
        <SectionBadge letter="G" title="Rotation Board" colors={colors} accent={accent} />
        <S07RotationBoard players={packet.rotationBoard} />

        {/* Section H — Player Cards */}
        <SectionBadge letter="H" title="Player Cards" colors={colors} accent={accent} />
        <S08PlayerCards cards={packet.playerCards} />

        {/* Section I — Scout Confidence Gate */}
        <SectionBadge letter="I" title="Scout Confidence Gate" colors={colors} accent={accent} />
        <S10ScoutConfidence data={packet.scoutConfidence} />

        {/* ===== BLOCK 5 — SNAPSHOT HISTORY ===== */}
        <View style={styles.historyBlock}>
          <Text style={[styles.historyTitle, { color: colors.text }]}>Snapshot History</Text>
          {MOCK_HISTORY.map((snap) => (
            <Pressable
              key={snap.id}
              style={[styles.historyRow, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {}}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.historyTimestamp, { color: colors.text }]}>{snap.timestamp}</Text>
                <View style={styles.historyMeta}>
                  <View style={[styles.historyStatusPill, { backgroundColor: STATUS_COLORS[snap.status] + '20' }]}>
                    <Text style={[styles.historyStatusText, { color: STATUS_COLORS[snap.status] }]}>
                      {STATUS_LABELS[snap.status]}
                    </Text>
                  </View>
                  <Text style={[styles.historyConf, { color: getConfidenceColor(snap.confidence) }]}>
                    {snap.confidence}%
                  </Text>
                  <Text style={[styles.historyVersion, { color: colors.textTertiary }]}>{snap.dataVersion}</Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ── Section Badge ──

function SectionBadge({ letter, title, colors, accent }: { letter: string; title: string; colors: typeof Colors.light; accent: string }) {
  return (
    <View style={styles.sectionBadgeRow}>
      <View style={[styles.sectionBadge, { backgroundColor: accent + '20' }]}>
        <Text style={[styles.sectionBadgeLetter, { color: accent }]}>{letter}</Text>
      </View>
      <Text style={[styles.sectionBadgeTitle, { color: colors.text }]}>{title}</Text>
    </View>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Block 0 — Sticky Header
  stickyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 56,
  },
  backBtn: { width: 36, alignItems: 'flex-start', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerOpponent: { fontSize: 16, fontWeight: '700' },
  headerMeta: { fontSize: 12, marginTop: 2 },
  headerTitle: { fontSize: 16, fontWeight: '700', flex: 1, textAlign: 'center' },
  headerRight: { flexDirection: 'row', gap: 14, width: 72, justifyContent: 'flex-end' },

  // Chip row
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
  traceDot: { width: 6, height: 6, borderRadius: 3 },

  // Scroll
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },

  // Block 1 — Game Selector
  block: { marginBottom: Spacing.sm },
  selectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  selectorText: { fontSize: 14, fontWeight: '700' },
  dropdown: { marginTop: 4, borderRadius: 10, borderWidth: 1, overflow: 'hidden' },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 10 },
  dropdownText: { fontSize: 13, fontWeight: '600' },
  dropdownMeta: { fontSize: 11, marginTop: 2 },

  // Block 2 — Snapshot Status Card
  statusCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: Spacing.sm },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm },
  statusPillText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  statusTimestamp: { fontSize: 11 },
  statusGenBy: { fontSize: 11, marginTop: 4 },
  statusBtnRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  statusBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  statusBtnTextPrimary: { fontSize: 12, fontWeight: '700', color: '#fff' },
  statusBtnTextSecondary: { fontSize: 12, fontWeight: '600' },

  // Block 3 — Inputs Used
  inputsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 1,
  },
  inputsHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  inputsTitle: { fontSize: 14, fontWeight: '700' },
  inputsBody: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  inputsLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 },
  inputsItem: { fontSize: 12, lineHeight: 18, marginBottom: 2 },

  // Block 4 — Packet
  packetHeader: { marginTop: Spacing.lg, marginBottom: Spacing.sm },
  packetTitle: { fontSize: 18, fontWeight: '800' },
  packetSubtitle: { fontSize: 12, marginTop: 2 },

  // Section badge
  sectionBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionBadgeLetter: { fontSize: 14, fontWeight: '800' },
  sectionBadgeTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Block 5 — History
  historyBlock: { marginTop: Spacing.xl },
  historyTitle: { fontSize: 16, fontWeight: '700', marginBottom: Spacing.sm },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  historyTimestamp: { fontSize: 13, fontWeight: '600' },
  historyMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  historyStatusPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  historyStatusText: { fontSize: 9, fontWeight: '700' },
  historyConf: { fontSize: 12, fontWeight: '700' },
  historyVersion: { fontSize: 11 },

  // Empty state
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.lg },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginTop: Spacing.md, textAlign: 'center' },
  emptySubtitle: { fontSize: 13, marginTop: Spacing.xs, textAlign: 'center' },
  nexusBtn: { marginTop: Spacing.md, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  nexusBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
