/**
 * Sports Compliance V3 — A2 (Assistant Coach) Risk Dashboard
 * 6 blocks: Eligibility Snapshot, At-Risk Queue, Player Directory,
 *           Documents Tracker, Rules/Standards
 *
 * Compliance = Status + Risk Surface (read-only).
 * No edits. No case management. No medical/legal records.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

// =============================================================================
// TYPES
// =============================================================================

type EligibilityStatus = 'Eligible' | 'At Risk' | 'Ineligible' | 'Pending';
type RiskTag = 'GPA' | 'Credits' | 'Test' | 'Amateurism' | 'Immigration' | 'Medical Clearance' | 'Documents' | 'Other';
type ActionStatus = 'Needs Action' | 'In Review' | 'Cleared';
type DocBucket = 'Required' | 'Submitted' | 'Verified';

interface PlayerCompliance {
  id: string;
  name: string;
  eligibility: EligibilityStatus;
  riskTag: RiskTag | null;
  actionStatus: ActionStatus;
  dueDate: string | null;
  lastUpdated: string;
  // Detail fields
  gpa?: number;
  creditsEarned?: number;
  testStatus?: 'Complete' | 'Pending';
  amateurismStatus?: 'Cleared' | 'Pending';
  immigrationStatus?: 'Valid' | 'Expiring' | 'Needs Update' | null;
  documents?: { item: string; status: 'Complete' | 'Pending' | 'Missing'; dueDate?: string }[];
}

// =============================================================================
// MOCK DATA
// =============================================================================

const PLAYERS: PlayerCompliance[] = [
  {
    id: 'pc1', name: 'Marcus Johnson', eligibility: 'Eligible', riskTag: null, actionStatus: 'Cleared',
    dueDate: null, lastUpdated: 'Feb 20, 2026',
    gpa: 3.2, creditsEarned: 68, testStatus: 'Complete', amateurismStatus: 'Cleared', immigrationStatus: null,
    documents: [
      { item: 'Enrollment Verification', status: 'Complete' },
      { item: 'Medical Clearance', status: 'Complete' },
      { item: 'Insurance', status: 'Complete' },
      { item: 'Transcript', status: 'Complete' },
    ],
  },
  {
    id: 'pc2', name: 'DeShawn Carter', eligibility: 'Eligible', riskTag: null, actionStatus: 'Cleared',
    dueDate: null, lastUpdated: 'Feb 18, 2026',
    gpa: 3.1, creditsEarned: 60, testStatus: 'Complete', amateurismStatus: 'Cleared', immigrationStatus: null,
    documents: [
      { item: 'Enrollment Verification', status: 'Complete' },
      { item: 'Medical Clearance', status: 'Complete' },
      { item: 'Insurance', status: 'Complete' },
      { item: 'Transcript', status: 'Complete' },
    ],
  },
  {
    id: 'pc3', name: 'Chris Davis', eligibility: 'At Risk', riskTag: 'Medical Clearance', actionStatus: 'In Review',
    dueDate: 'Mar 1, 2026', lastUpdated: 'Feb 22, 2026',
    gpa: 2.8, creditsEarned: 45, testStatus: 'Complete', amateurismStatus: 'Cleared', immigrationStatus: null,
    documents: [
      { item: 'Enrollment Verification', status: 'Complete' },
      { item: 'Medical Clearance', status: 'Pending', dueDate: 'Mar 1, 2026' },
      { item: 'Insurance', status: 'Complete' },
      { item: 'Transcript', status: 'Complete' },
    ],
  },
  {
    id: 'pc4', name: 'Jordan Taylor', eligibility: 'At Risk', riskTag: 'Medical Clearance', actionStatus: 'Needs Action',
    dueDate: 'Feb 28, 2026', lastUpdated: 'Feb 21, 2026',
    gpa: 2.9, creditsEarned: 52, testStatus: 'Complete', amateurismStatus: 'Cleared', immigrationStatus: null,
    documents: [
      { item: 'Enrollment Verification', status: 'Complete' },
      { item: 'Medical Clearance', status: 'Missing', dueDate: 'Feb 28, 2026' },
      { item: 'Insurance', status: 'Complete' },
      { item: 'Transcript', status: 'Complete' },
    ],
  },
  {
    id: 'pc5', name: 'Jamal Williams', eligibility: 'Eligible', riskTag: null, actionStatus: 'Cleared',
    dueDate: null, lastUpdated: 'Feb 19, 2026',
    gpa: 3.4, creditsEarned: 72, testStatus: 'Complete', amateurismStatus: 'Cleared', immigrationStatus: null,
    documents: [
      { item: 'Enrollment Verification', status: 'Complete' },
      { item: 'Medical Clearance', status: 'Complete' },
      { item: 'Insurance', status: 'Complete' },
      { item: 'Transcript', status: 'Complete' },
    ],
  },
  {
    id: 'pc6', name: 'Tyler Brooks', eligibility: 'Eligible', riskTag: null, actionStatus: 'Cleared',
    dueDate: null, lastUpdated: 'Feb 17, 2026',
    gpa: 2.6, creditsEarned: 48, testStatus: 'Complete', amateurismStatus: 'Cleared', immigrationStatus: null,
    documents: [
      { item: 'Enrollment Verification', status: 'Complete' },
      { item: 'Medical Clearance', status: 'Complete' },
      { item: 'Insurance', status: 'Complete' },
      { item: 'Transcript', status: 'Complete' },
    ],
  },
  {
    id: 'pc7', name: 'Isaiah Owens', eligibility: 'Pending', riskTag: 'Documents', actionStatus: 'Needs Action',
    dueDate: 'Mar 5, 2026', lastUpdated: 'Feb 23, 2026',
    gpa: 2.4, creditsEarned: 15, testStatus: 'Pending', amateurismStatus: 'Pending', immigrationStatus: null,
    documents: [
      { item: 'Enrollment Verification', status: 'Complete' },
      { item: 'Medical Clearance', status: 'Pending', dueDate: 'Mar 5, 2026' },
      { item: 'Insurance', status: 'Missing', dueDate: 'Mar 5, 2026' },
      { item: 'Transcript', status: 'Missing', dueDate: 'Mar 5, 2026' },
    ],
  },
  {
    id: 'pc8', name: 'Malik Robinson', eligibility: 'Eligible', riskTag: null, actionStatus: 'Cleared',
    dueDate: null, lastUpdated: 'Feb 16, 2026',
    gpa: 3.0, creditsEarned: 30, testStatus: 'Complete', amateurismStatus: 'Cleared', immigrationStatus: null,
    documents: [
      { item: 'Enrollment Verification', status: 'Complete' },
      { item: 'Medical Clearance', status: 'Complete' },
      { item: 'Insurance', status: 'Complete' },
      { item: 'Transcript', status: 'Complete' },
    ],
  },
  {
    id: 'pc9', name: 'Robert Jenkins Jr.', eligibility: 'At Risk', riskTag: 'GPA', actionStatus: 'In Review',
    dueDate: 'Mar 10, 2026', lastUpdated: 'Feb 24, 2026',
    gpa: 1.9, creditsEarned: 12, testStatus: 'Complete', amateurismStatus: 'Cleared', immigrationStatus: null,
    documents: [
      { item: 'Enrollment Verification', status: 'Complete' },
      { item: 'Medical Clearance', status: 'Complete' },
      { item: 'Insurance', status: 'Complete' },
      { item: 'Transcript', status: 'Pending', dueDate: 'Mar 10, 2026' },
    ],
  },
  {
    id: 'pc10', name: 'DeMarcus Hall', eligibility: 'Eligible', riskTag: null, actionStatus: 'Cleared',
    dueDate: null, lastUpdated: 'Feb 15, 2026',
    gpa: 2.7, creditsEarned: 28, testStatus: 'Complete', amateurismStatus: 'Cleared', immigrationStatus: null,
    documents: [
      { item: 'Enrollment Verification', status: 'Complete' },
      { item: 'Medical Clearance', status: 'Complete' },
      { item: 'Insurance', status: 'Complete' },
      { item: 'Transcript', status: 'Complete' },
    ],
  },
  {
    id: 'pc11', name: 'Andre Mitchell Jr.', eligibility: 'Eligible', riskTag: null, actionStatus: 'Cleared',
    dueDate: null, lastUpdated: 'Feb 20, 2026',
    gpa: 3.5, creditsEarned: 85, testStatus: 'Complete', amateurismStatus: 'Cleared', immigrationStatus: null,
    documents: [
      { item: 'Enrollment Verification', status: 'Complete' },
      { item: 'Medical Clearance', status: 'Complete' },
      { item: 'Insurance', status: 'Complete' },
      { item: 'Transcript', status: 'Complete' },
    ],
  },
  {
    id: 'pc12', name: 'Terrell Davis', eligibility: 'At Risk', riskTag: 'Credits', actionStatus: 'Needs Action',
    dueDate: 'Mar 3, 2026', lastUpdated: 'Feb 24, 2026',
    gpa: 2.5, creditsEarned: 40, testStatus: 'Complete', amateurismStatus: 'Cleared', immigrationStatus: null,
    documents: [
      { item: 'Enrollment Verification', status: 'Complete' },
      { item: 'Medical Clearance', status: 'Complete' },
      { item: 'Insurance', status: 'Complete' },
      { item: 'Transcript', status: 'Pending', dueDate: 'Mar 3, 2026' },
    ],
  },
  {
    id: 'pc13', name: 'Jaylen Moore', eligibility: 'Pending', riskTag: 'Amateurism', actionStatus: 'In Review',
    dueDate: 'Mar 8, 2026', lastUpdated: 'Feb 23, 2026',
    gpa: 2.3, creditsEarned: 0, testStatus: 'Complete', amateurismStatus: 'Pending', immigrationStatus: null,
    documents: [
      { item: 'Enrollment Verification', status: 'Complete' },
      { item: 'Medical Clearance', status: 'Pending', dueDate: 'Mar 8, 2026' },
      { item: 'Insurance', status: 'Complete' },
      { item: 'Transcript', status: 'Complete' },
    ],
  },
  {
    id: 'pc14', name: 'Kyle Henderson', eligibility: 'Ineligible', riskTag: 'Medical Clearance', actionStatus: 'Needs Action',
    dueDate: 'Feb 26, 2026', lastUpdated: 'Feb 25, 2026',
    gpa: 2.8, creditsEarned: 55, testStatus: 'Complete', amateurismStatus: 'Cleared', immigrationStatus: null,
    documents: [
      { item: 'Enrollment Verification', status: 'Complete' },
      { item: 'Medical Clearance', status: 'Missing', dueDate: 'Feb 26, 2026' },
      { item: 'Insurance', status: 'Complete' },
      { item: 'Transcript', status: 'Complete' },
    ],
  },
  {
    id: 'pc15', name: 'Samuel Brooks', eligibility: 'Eligible', riskTag: 'Immigration', actionStatus: 'In Review',
    dueDate: 'Aug 15, 2026', lastUpdated: 'Feb 20, 2026',
    gpa: 3.0, creditsEarned: 42, testStatus: 'Complete', amateurismStatus: 'Cleared', immigrationStatus: 'Valid',
    documents: [
      { item: 'Enrollment Verification', status: 'Complete' },
      { item: 'Medical Clearance', status: 'Complete' },
      { item: 'Insurance', status: 'Complete' },
      { item: 'Transcript', status: 'Complete' },
      { item: 'I-20', status: 'Complete' },
      { item: 'Passport', status: 'Complete' },
    ],
  },
  {
    id: 'pc16', name: 'DeAndre White', eligibility: 'Eligible', riskTag: null, actionStatus: 'Cleared',
    dueDate: null, lastUpdated: 'Feb 18, 2026',
    gpa: 2.9, creditsEarned: 25, testStatus: 'Complete', amateurismStatus: 'Cleared', immigrationStatus: null,
    documents: [
      { item: 'Enrollment Verification', status: 'Complete' },
      { item: 'Medical Clearance', status: 'Complete' },
      { item: 'Insurance', status: 'Complete' },
      { item: 'Transcript', status: 'Complete' },
    ],
  },
];

const NEXT_DEADLINE = { label: 'NAIA Certification', date: 'Feb 28, 2026' };

const GOVERNING_BODY = 'NAIA';
const INTERNAL_STANDARDS = [
  { label: 'Team Academic Policy', icon: 'book.fill' },
  { label: 'Eligibility Handbook', icon: 'doc.text.fill' },
];

// =============================================================================
// COLOR MAPS
// =============================================================================

const ELIGIBILITY_COLOR: Record<EligibilityStatus, string> = {
  'Eligible': '#5A8A6E',
  'At Risk': '#B8943E',
  'Ineligible': '#B85C5C',
  'Pending': '#9C9790',
};

const ACTION_COLOR: Record<ActionStatus, string> = {
  'Needs Action': '#B85C5C',
  'In Review': '#B8943E',
  'Cleared': '#5A8A6E',
};

const DOC_STATUS_COLOR: Record<string, string> = {
  'Complete': '#5A8A6E',
  'Pending': '#B8943E',
  'Missing': '#B85C5C',
};

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function SectionHeader({ label, colors }: { label: string; colors: typeof Colors.light }) {
  return (
    <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>
      {label}
    </ThemedText>
  );
}

function Card({ colors, children, style }: { colors: typeof Colors.light; children: React.ReactNode; style?: object }) {
  return (
    <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
}

function StatusChip({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.chip, { backgroundColor: color + '18' }]}>
      <ThemedText style={[s.chipText, { color }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// BLOCK 1 — TEAM ELIGIBILITY SNAPSHOT
// =============================================================================

function EligibilitySnapshot({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const eligible = PLAYERS.filter((p) => p.eligibility === 'Eligible').length;
  const atRisk = PLAYERS.filter((p) => p.eligibility === 'At Risk').length;
  const ineligible = PLAYERS.filter((p) => p.eligibility === 'Ineligible').length;
  const pending = PLAYERS.filter((p) => p.eligibility === 'Pending').length;
  const pendingDocs = PLAYERS.filter((p) => p.documents?.some((d) => d.status !== 'Complete')).length;

  const counts = [
    { label: 'Eligible', value: eligible, color: '#5A8A6E' },
    { label: 'At Risk', value: atRisk, color: '#B8943E' },
    { label: 'Ineligible', value: ineligible, color: '#B85C5C' },
    { label: 'Pending', value: pending, color: '#9C9790' },
  ];

  return (
    <>
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: 0 }]}>
        TEAM ELIGIBILITY
      </ThemedText>
      <Card colors={colors}>
        <View style={s.countRow}>
          {counts.map((c) => (
            <View key={c.label} style={s.countItem}>
              <ThemedText style={[s.countValue, { color: c.color }]}>{c.value}</ThemedText>
              <ThemedText style={[s.countLabel, { color: colors.textSecondary }]}>{c.label}</ThemedText>
            </View>
          ))}
        </View>

        {/* Pending docs count */}
        <View style={[s.docsCountRow, { borderTopColor: colors.border }]}>
          <IconSymbol name="doc.text.fill" size={14} color={colors.textTertiary} />
          <ThemedText style={[s.docsCountText, { color: colors.textSecondary }]}>
            {pendingDocs} player{pendingDocs !== 1 ? 's' : ''} with pending documents
          </ThemedText>
        </View>

        {/* Next deadline */}
        <Pressable
          style={({ pressed }) => [s.deadlineRow, { backgroundColor: accentColor + '10' }, pressed && { opacity: 0.7 }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="calendar.badge.exclamationmark" size={14} color={accentColor} />
          <ThemedText style={[s.deadlineText, { color: accentColor }]}>
            Next Deadline: {NEXT_DEADLINE.label} — {NEXT_DEADLINE.date}
          </ThemedText>
        </Pressable>
      </Card>
    </>
  );
}

// =============================================================================
// BLOCK 2 — AT-RISK QUEUE
// =============================================================================

function AtRiskQueue({ colors, accentColor, onSelectPlayer }: { colors: typeof Colors.light; accentColor: string; onSelectPlayer: (p: PlayerCompliance) => void }) {
  const atRiskPlayers = useMemo(() =>
    PLAYERS
      .filter((p) => p.eligibility !== 'Eligible' || (p.riskTag && p.actionStatus !== 'Cleared'))
      .sort((a, b) => {
        // Sort by urgency: Needs Action first, then by due date
        const actionOrder: Record<ActionStatus, number> = { 'Needs Action': 0, 'In Review': 1, 'Cleared': 2 };
        const diff = actionOrder[a.actionStatus] - actionOrder[b.actionStatus];
        if (diff !== 0) return diff;
        if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        if (a.dueDate) return -1;
        return 1;
      }),
    []
  );

  if (atRiskPlayers.length === 0) return null;

  return (
    <>
      <SectionHeader label="AT-RISK QUEUE" colors={colors} />
      <Card colors={colors}>
        {atRiskPlayers.map((player, idx) => (
          <Pressable
            key={player.id}
            style={({ pressed }) => [
              s.riskRow,
              idx < atRiskPlayers.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectPlayer(player);
            }}
          >
            <View style={s.riskInfo}>
              <ThemedText style={[s.riskName, { color: colors.text }]}>{player.name}</ThemedText>
              <View style={s.riskTags}>
                {player.riskTag && <StatusChip label={player.riskTag} color={ELIGIBILITY_COLOR[player.eligibility]} />}
                <StatusChip label={player.actionStatus} color={ACTION_COLOR[player.actionStatus]} />
              </View>
            </View>
            {player.dueDate && (
              <ThemedText style={[s.riskDue, { color: player.actionStatus === 'Needs Action' ? '#B85C5C' : colors.textSecondary }]}>
                {player.dueDate}
              </ThemedText>
            )}
            <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
          </Pressable>
        ))}
      </Card>
    </>
  );
}

// =============================================================================
// BLOCK 3 — PLAYER COMPLIANCE DIRECTORY
// =============================================================================

function PlayerDirectory({ colors, accentColor, onSelectPlayer }: { colors: typeof Colors.light; accentColor: string; onSelectPlayer: (p: PlayerCompliance) => void }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return PLAYERS;
    const q = search.toLowerCase();
    return PLAYERS.filter((p) => p.name.toLowerCase().includes(q));
  }, [search]);

  return (
    <>
      <SectionHeader label="PLAYER DIRECTORY" colors={colors} />
      {/* Search */}
      <View style={[s.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
        <TextInput
          style={[s.searchInput, { color: colors.text }]}
          placeholder="Search players..."
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <Card colors={colors}>
        {filtered.map((player, idx) => (
          <Pressable
            key={player.id}
            style={({ pressed }) => [
              s.dirRow,
              idx < filtered.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectPlayer(player);
            }}
          >
            <ThemedText style={[s.dirName, { color: colors.text }]} numberOfLines={1}>{player.name}</ThemedText>
            <StatusChip label={player.eligibility} color={ELIGIBILITY_COLOR[player.eligibility]} />
            {player.riskTag && (
              <ThemedText style={[s.dirRisk, { color: colors.textTertiary }]}>{player.riskTag}</ThemedText>
            )}
            <ThemedText style={[s.dirDate, { color: colors.textTertiary }]}>{player.lastUpdated}</ThemedText>
            <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
          </Pressable>
        ))}
        {filtered.length === 0 && (
          <ThemedText style={[s.emptyText, { color: colors.textTertiary }]}>No players found.</ThemedText>
        )}
      </Card>
    </>
  );
}

// =============================================================================
// BLOCK 4 — DOCUMENTS TRACKER
// =============================================================================

function DocumentsTracker({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const allDocs = PLAYERS.flatMap((p) => p.documents ?? []);
  const verified = allDocs.filter((d) => d.status === 'Complete').length;
  const submitted = allDocs.filter((d) => d.status === 'Pending').length;
  const missing = allDocs.filter((d) => d.status === 'Missing');

  const buckets = [
    { label: 'Verified', count: verified, color: '#5A8A6E', icon: 'checkmark.seal.fill' },
    { label: 'Submitted', count: submitted, color: '#B8943E', icon: 'clock.fill' },
    { label: 'Missing', count: missing.length, color: '#B85C5C', icon: 'xmark.circle.fill' },
  ];

  // Group missing by item name
  const missingGrouped = missing.reduce<Record<string, number>>((acc, d) => {
    acc[d.item] = (acc[d.item] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <SectionHeader label="DOCUMENTS" colors={colors} />
      <Card colors={colors}>
        <View style={s.docBuckets}>
          {buckets.map((b) => (
            <View key={b.label} style={s.docBucket}>
              <IconSymbol name={b.icon as any} size={18} color={b.color} />
              <ThemedText style={[s.docBucketCount, { color: b.color }]}>{b.count}</ThemedText>
              <ThemedText style={[s.docBucketLabel, { color: colors.textSecondary }]}>{b.label}</ThemedText>
            </View>
          ))}
        </View>

        {Object.keys(missingGrouped).length > 0 && (
          <View style={[s.missingSection, { borderTopColor: colors.border }]}>
            <ThemedText style={[s.missingTitle, { color: colors.textSecondary }]}>MISSING</ThemedText>
            {Object.entries(missingGrouped).map(([item, count]) => (
              <View key={item} style={s.missingRow}>
                <IconSymbol name="exclamationmark.triangle.fill" size={12} color="#B85C5C" />
                <ThemedText style={[s.missingText, { color: '#B85C5C' }]}>
                  {count} Missing — {item}
                </ThemedText>
              </View>
            ))}
          </View>
        )}
      </Card>
    </>
  );
}

// =============================================================================
// BLOCK 5 — RULES / STANDARDS
// =============================================================================

function RulesStandards({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <>
      <SectionHeader label="RULES & STANDARDS" colors={colors} />
      <Card colors={colors}>
        <View style={s.govRow}>
          <IconSymbol name="building.columns.fill" size={16} color={accentColor} />
          <View style={s.govInfo}>
            <ThemedText style={[s.govLabel, { color: colors.textSecondary }]}>Governing Body</ThemedText>
            <ThemedText style={[s.govValue, { color: colors.text }]}>{GOVERNING_BODY}</ThemedText>
          </View>
        </View>

        <View style={[s.standardsList, { borderTopColor: colors.border }]}>
          {INTERNAL_STANDARDS.map((std) => (
            <Pressable
              key={std.label}
              style={({ pressed }) => [s.standardRow, pressed && { opacity: 0.7 }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name={std.icon as any} size={14} color={colors.textTertiary} />
              <ThemedText style={[s.standardLabel, { color: colors.text }]}>{std.label}</ThemedText>
              <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
            </Pressable>
          ))}
        </View>
      </Card>
    </>
  );
}

// =============================================================================
// PLAYER COMPLIANCE DETAIL SHEET
// =============================================================================

function PlayerDetailSheet({ visible, onClose, player, colors, accentColor }: {
  visible: boolean;
  onClose: () => void;
  player: PlayerCompliance | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!player) return null;

  return (
    <BottomSheet visible={visible} onClose={onClose} title={player.name} useModal>
      <BottomSheetScrollView contentContainerStyle={s.sheetScroll}>
        {/* Eligibility Status */}
        <View style={s.sheetStatusRow}>
          <ThemedText style={[s.sheetLabel, { color: colors.textSecondary }]}>Eligibility</ThemedText>
          <StatusChip label={player.eligibility} color={ELIGIBILITY_COLOR[player.eligibility]} />
        </View>

        {/* Academic Summary */}
        <ThemedText style={[s.sheetSection, { color: colors.textSecondary }]}>ACADEMIC SUMMARY</ThemedText>
        <View style={[s.sheetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {player.gpa !== undefined && (
            <View style={s.sheetDetailRow}>
              <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>GPA</ThemedText>
              <ThemedText style={[s.sheetDetailValue, { color: (player.gpa ?? 0) < 2.0 ? '#B85C5C' : colors.text }]}>
                {player.gpa?.toFixed(1)}
              </ThemedText>
            </View>
          )}
          {player.creditsEarned !== undefined && (
            <View style={s.sheetDetailRow}>
              <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Credits Earned</ThemedText>
              <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{player.creditsEarned}</ThemedText>
            </View>
          )}
        </View>

        {/* Status indicators */}
        <ThemedText style={[s.sheetSection, { color: colors.textSecondary }]}>STATUS</ThemedText>
        <View style={[s.sheetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {player.testStatus && (
            <View style={s.sheetDetailRow}>
              <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Test</ThemedText>
              <StatusChip label={player.testStatus} color={player.testStatus === 'Complete' ? '#5A8A6E' : '#B8943E'} />
            </View>
          )}
          {player.amateurismStatus && (
            <View style={s.sheetDetailRow}>
              <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Amateurism</ThemedText>
              <StatusChip label={player.amateurismStatus} color={player.amateurismStatus === 'Cleared' ? '#5A8A6E' : '#B8943E'} />
            </View>
          )}
          {player.immigrationStatus && (
            <View style={s.sheetDetailRow}>
              <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Immigration</ThemedText>
              <StatusChip
                label={player.immigrationStatus}
                color={player.immigrationStatus === 'Valid' ? '#5A8A6E' : player.immigrationStatus === 'Expiring' ? '#B8943E' : '#B85C5C'}
              />
            </View>
          )}
        </View>

        {/* Document checklist */}
        {player.documents && player.documents.length > 0 && (
          <>
            <ThemedText style={[s.sheetSection, { color: colors.textSecondary }]}>DOCUMENTS</ThemedText>
            <View style={[s.sheetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {player.documents.map((doc, idx) => (
                <View
                  key={doc.item}
                  style={[
                    s.sheetDocRow,
                    idx < player.documents!.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                  ]}
                >
                  <IconSymbol
                    name={doc.status === 'Complete' ? 'checkmark.circle.fill' : doc.status === 'Pending' ? 'clock.fill' : 'xmark.circle.fill'}
                    size={14}
                    color={DOC_STATUS_COLOR[doc.status]}
                  />
                  <View style={s.sheetDocInfo}>
                    <ThemedText style={[s.sheetDocItem, { color: colors.text }]}>{doc.item}</ThemedText>
                    {doc.dueDate && (
                      <ThemedText style={[s.sheetDocDue, { color: colors.textTertiary }]}>Due: {doc.dueDate}</ThemedText>
                    )}
                  </View>
                  <StatusChip label={doc.status} color={DOC_STATUS_COLOR[doc.status]} />
                </View>
              ))}
            </View>
          </>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function SportsCompliance({ colors, accentColor, role }: Props) {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerCompliance | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const handleSelectPlayer = useCallback((player: PlayerCompliance) => {
    setSelectedPlayer(player);
    setSheetVisible(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSheetVisible(false);
  }, []);

  return (
    <>
      <ScrollView
        style={s.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <EligibilitySnapshot colors={colors} accentColor={accentColor} />
        <AtRiskQueue colors={colors} accentColor={accentColor} onSelectPlayer={handleSelectPlayer} />
        <PlayerDirectory colors={colors} accentColor={accentColor} onSelectPlayer={handleSelectPlayer} />
        <DocumentsTracker colors={colors} accentColor={accentColor} />
        <RulesStandards colors={colors} accentColor={accentColor} />
      </ScrollView>

      <PlayerDetailSheet
        visible={sheetVisible}
        onClose={handleCloseSheet}
        player={selectedPlayer}
        colors={colors}
        accentColor={accentColor}
      />
    </>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.md, paddingTop: 4, paddingBottom: 120 },

  // ── Section Header ──
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 20,
    textTransform: 'uppercase',
  },

  // ── Card ──
  card: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: 14,
    marginBottom: 12,
  },

  // ── Status Chip ──
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // ── Block 1 — Snapshot ──
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  countItem: { alignItems: 'center' },
  countValue: {
    fontSize: 24,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  countLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  docsCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  docsCountText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    padding: 10,
    borderRadius: BorderRadius.md,
  },
  deadlineText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },

  // ── Block 2 — At-Risk Queue ──
  riskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  riskInfo: {
    flex: 1,
  },
  riskName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  riskTags: {
    flexDirection: 'row',
    gap: 6,
  },
  riskDue: {
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  // ── Block 3 — Directory ──
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  dirRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    gap: 8,
  },
  dirName: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  dirRisk: {
    fontSize: 10,
    fontWeight: '500',
  },
  dirDate: {
    fontSize: 10,
    fontVariant: ['tabular-nums'],
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 20,
  },

  // ── Block 4 — Documents ──
  docBuckets: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  docBucket: {
    alignItems: 'center',
    gap: 4,
  },
  docBucketCount: {
    fontSize: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  docBucketLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  missingSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 12,
    paddingTop: 10,
    gap: 6,
  },
  missingTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  missingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  missingText: {
    fontSize: 12,
    flex: 1,
  },

  // ── Block 5 — Rules ──
  govRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  govInfo: {
    flex: 1,
  },
  govLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  govValue: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  standardsList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 12,
    paddingTop: 10,
  },
  standardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  standardLabel: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },

  // ── Detail Sheet ──
  sheetScroll: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  sheetStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  sheetSection: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sheetCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: 12,
    marginBottom: 16,
  },
  sheetDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  sheetDetailLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  sheetDetailValue: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  sheetDocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  sheetDocInfo: {
    flex: 1,
  },
  sheetDocItem: {
    fontSize: 13,
    fontWeight: '500',
  },
  sheetDocDue: {
    fontSize: 10,
    marginTop: 2,
  },
});
