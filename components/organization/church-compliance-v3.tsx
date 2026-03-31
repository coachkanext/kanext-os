/**
 * Church Compliance V3 — Governance + Risk (Single-Scroll)
 * 6 blocks: Header, Campus Compliance Snapshot, Volunteer Clearance,
 *           At-Risk Items, Required Documents, Reporting / Safety
 *
 * Campus-scoped, RBAC-aware. A2 sees own clearance + ministry safety.
 * A1 sees high-level posture only. No other volunteers' private data,
 * no legal cases, no insurance docs, no staff HR records.
 */
import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, MODE_ACCENT } from '@/constants/theme';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { isStaffLevel, type ChurchRoleLens } from '@/utils/rbac/church-registry';

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
}

const ACCENT = MODE_ACCENT.church;

// =============================================================================
// HELPERS
// =============================================================================

function SectionLabel({ label, colors }: { label: string; colors: typeof Colors.light }) {
  return (
    <ThemedText style={[s.sectionLabel, { color: colors.textSecondary }]}>
      {label}
    </ThemedText>
  );
}

function Card({ colors, children }: { colors: typeof Colors.light; children: React.ReactNode }) {
  return (
    <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {children}
    </View>
  );
}

type CompStatus = 'Good' | 'Review' | 'Action Needed' | 'Active' | 'Current' | 'Cleared' | 'Pending' | 'Expired';
const STATUS_COLOR: Record<CompStatus, string> = {
  Good: '#5A8A6E',
  Active: '#5A8A6E',
  Current: '#5A8A6E',
  Cleared: '#5A8A6E',
  Review: '#B8943E',
  Pending: '#B8943E',
  'Action Needed': '#B85C5C',
  Expired: '#B85C5C',
};

// =============================================================================
// MOCK DATA — ICCLA
// =============================================================================

const CAMPUS_STATUS: CompStatus = 'Good';

const COMPLIANCE_SNAPSHOT = [
  { id: 'cs-1', label: 'Child Safety', status: 'Good' as CompStatus, icon: 'shield.checkmark.fill' },
  { id: 'cs-2', label: 'Insurance', status: 'Active' as CompStatus, icon: 'doc.text.fill' },
  { id: 'cs-3', label: 'Facility Inspection', status: 'Current' as CompStatus, icon: 'building.2.fill' },
  { id: 'cs-4', label: 'Legal', status: 'Good' as CompStatus, icon: 'building.columns.fill' },
];

// A2 (Children's Teacher) personal clearance
const MY_CLEARANCE = {
  backgroundCheck: 'Cleared' as CompStatus,
  trainingCompleted: true,
  expirationDate: 'Oct 2025',
  nextAction: 'Renewal due Oct 2025',
};

const AT_RISK = {
  pendingClearances: 2,
  expiringBackgroundChecks: 1,
  openRiskReports: 0,
};

const DOCUMENTS = {
  required: 14,
  submitted: 12,
  verified: 11,
};

// =============================================================================
// BLOCK 0 — HEADER
// =============================================================================

function HeaderBlock({ colors }: { colors: typeof Colors.light }) {
  const statusColor = STATUS_COLOR[CAMPUS_STATUS];
  return (
    <View style={s.headerBlock}>
      <View style={{ flex: 1 }}>
        <ThemedText style={[s.headerTitle, { color: colors.text }]}>Compliance</ThemedText>
        <ThemedText style={[s.headerCampus, { color: colors.textTertiary }]}>ICC Los Angeles</ThemedText>
      </View>
      <View style={[s.statusChip, { backgroundColor: statusColor + '20' }]}>
        <View style={[s.statusDot, { backgroundColor: statusColor }]} />
        <ThemedText style={[s.statusChipText, { color: statusColor }]}>{CAMPUS_STATUS}</ThemedText>
      </View>
    </View>
  );
}

// =============================================================================
// BLOCK 1 — CAMPUS COMPLIANCE SNAPSHOT
// =============================================================================

function SnapshotBlock({ colors }: { colors: typeof Colors.light }) {
  return (
    <>
      <SectionLabel label="CAMPUS COMPLIANCE SNAPSHOT" colors={colors} />
      <Card colors={colors}>
        {COMPLIANCE_SNAPSHOT.map((item, idx) => {
          const color = STATUS_COLOR[item.status];
          return (
            <View
              key={item.id}
              style={[
                s.snapshotRow,
                idx < COMPLIANCE_SNAPSHOT.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <IconSymbol name={item.icon as any} size={16} color={color} />
              <ThemedText style={[s.snapshotLabel, { color: colors.text }]}>{item.label}</ThemedText>
              <View style={[s.snapshotChip, { backgroundColor: color + '20' }]}>
                <ThemedText style={[s.snapshotChipText, { color }]}>{item.status}</ThemedText>
              </View>
            </View>
          );
        })}
      </Card>
    </>
  );
}

// =============================================================================
// BLOCK 2 — VOLUNTEER CLEARANCE (Role-Aware)
// =============================================================================

function VolunteerClearanceBlock({ colors, isA2 }: { colors: typeof Colors.light; isA2: boolean }) {
  if (!isA2) return null;

  const bgColor = STATUS_COLOR[MY_CLEARANCE.backgroundCheck];

  return (
    <>
      <SectionLabel label="YOUR VOLUNTEER CLEARANCE" colors={colors} />
      <Card colors={colors}>
        <View style={s.clearanceGrid}>
          <View style={s.clearanceItem}>
            <ThemedText style={[s.clearanceLabel, { color: colors.textTertiary }]}>Background Check</ThemedText>
            <View style={[s.clearanceBadge, { backgroundColor: bgColor + '20' }]}>
              <ThemedText style={[s.clearanceBadgeText, { color: bgColor }]}>{MY_CLEARANCE.backgroundCheck}</ThemedText>
            </View>
          </View>
          <View style={s.clearanceItem}>
            <ThemedText style={[s.clearanceLabel, { color: colors.textTertiary }]}>Training Completed</ThemedText>
            <View style={[s.clearanceBadge, { backgroundColor: MY_CLEARANCE.trainingCompleted ? '#5A8A6E20' : '#B8943E20' }]}>
              <ThemedText style={[s.clearanceBadgeText, { color: MY_CLEARANCE.trainingCompleted ? '#5A8A6E' : '#B8943E' }]}>
                {MY_CLEARANCE.trainingCompleted ? 'Yes' : 'No'}
              </ThemedText>
            </View>
          </View>
          <View style={s.clearanceItem}>
            <ThemedText style={[s.clearanceLabel, { color: colors.textTertiary }]}>Expiration Date</ThemedText>
            <ThemedText style={[s.clearanceValue, { color: colors.text }]}>{MY_CLEARANCE.expirationDate}</ThemedText>
          </View>
          <View style={s.clearanceItem}>
            <ThemedText style={[s.clearanceLabel, { color: colors.textTertiary }]}>Next Required Action</ThemedText>
            <ThemedText style={[s.clearanceValue, { color: colors.text }]}>{MY_CLEARANCE.nextAction}</ThemedText>
          </View>
        </View>
        <View style={s.clearanceNote}>
          <IconSymbol name="info.circle" size={12} color={colors.textTertiary} />
          <ThemedText style={[s.clearanceNoteText, { color: colors.textTertiary }]}>
            Updates managed by admin or via Nexus.
          </ThemedText>
        </View>
      </Card>
    </>
  );
}

// =============================================================================
// BLOCK 3 — AT-RISK ITEMS (Aggregate Only)
// =============================================================================

function AtRiskBlock({ colors }: { colors: typeof Colors.light }) {
  const items = [
    { label: 'Pending Clearances', count: AT_RISK.pendingClearances, color: AT_RISK.pendingClearances > 0 ? '#B8943E' : '#5A8A6E' },
    { label: 'Expiring Background Checks', count: AT_RISK.expiringBackgroundChecks, color: AT_RISK.expiringBackgroundChecks > 0 ? '#B8943E' : '#5A8A6E' },
    { label: 'Open Risk Reports', count: AT_RISK.openRiskReports, color: AT_RISK.openRiskReports > 0 ? '#B85C5C' : '#5A8A6E' },
  ];

  return (
    <>
      <SectionLabel label="AT-RISK ITEMS" colors={colors} />
      <Card colors={colors}>
        {items.map((item, idx) => (
          <View
            key={item.label}
            style={[
              s.riskRow,
              idx < items.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <ThemedText style={[s.riskLabel, { color: colors.text }]}>{item.label}</ThemedText>
            <View style={[s.riskBadge, { backgroundColor: item.color + '20' }]}>
              <ThemedText style={[s.riskBadgeText, { color: item.color }]}>{item.count}</ThemedText>
            </View>
          </View>
        ))}
        <View style={s.restrictedNote}>
          <IconSymbol name="lock.fill" size={11} color={colors.textTertiary} />
          <ThemedText style={[s.restrictedNoteText, { color: colors.textTertiary }]}>
            Names not visible at your access level.
          </ThemedText>
        </View>
      </Card>
    </>
  );
}

// =============================================================================
// BLOCK 4 — REQUIRED DOCUMENTS (Tracker Only)
// =============================================================================

function DocumentsBlock({ colors }: { colors: typeof Colors.light }) {
  return (
    <>
      <SectionLabel label="REQUIRED DOCUMENTS" colors={colors} />
      <Card colors={colors}>
        <View style={s.docGrid}>
          <View style={s.docCell}>
            <ThemedText style={[s.docValue, { color: colors.text }]}>{DOCUMENTS.required}</ThemedText>
            <ThemedText style={[s.docLabel, { color: colors.textTertiary }]}>Required</ThemedText>
          </View>
          <View style={[s.docDivider, { backgroundColor: colors.border }]} />
          <View style={s.docCell}>
            <ThemedText style={[s.docValue, { color: '#B8943E' }]}>{DOCUMENTS.submitted}</ThemedText>
            <ThemedText style={[s.docLabel, { color: colors.textTertiary }]}>Submitted</ThemedText>
          </View>
          <View style={[s.docDivider, { backgroundColor: colors.border }]} />
          <View style={s.docCell}>
            <ThemedText style={[s.docValue, { color: '#5A8A6E' }]}>{DOCUMENTS.verified}</ThemedText>
            <ThemedText style={[s.docLabel, { color: colors.textTertiary }]}>Verified</ThemedText>
          </View>
        </View>
        <View style={s.restrictedNote}>
          <IconSymbol name="lock.fill" size={11} color={colors.textTertiary} />
          <ThemedText style={[s.restrictedNoteText, { color: colors.textTertiary }]}>
            No file download links at your access level.
          </ThemedText>
        </View>
      </Card>
    </>
  );
}

// =============================================================================
// BLOCK 5 — REPORTING / SAFETY
// =============================================================================

function ReportingBlock({ colors, onReport }: { colors: typeof Colors.light; onReport: () => void }) {
  return (
    <>
      <SectionLabel label="REPORTING / SAFETY" colors={colors} />
      <Card colors={colors}>
        <ThemedText style={[s.reportDesc, { color: colors.textSecondary }]}>
          Submit an incident report confidentially. Routed to campus leadership via escalation. Not visible in feed.
        </ThemedText>
        <Pressable
          style={({ pressed }) => [s.reportBtn, { backgroundColor: ACCENT }, pressed && { opacity: 0.8 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onReport();
          }}
        >
          <IconSymbol name="exclamationmark.bubble.fill" size={16} color="#fff" />
          <ThemedText style={s.reportBtnText}>Report Incident</ThemedText>
        </Pressable>
      </Card>
    </>
  );
}

// =============================================================================
// INCIDENT REPORT SHEET
// =============================================================================

function IncidentReportSheet({ visible, onClose, colors }: { visible: boolean; onClose: () => void; colors: typeof Colors.light }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  const handleSubmit = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTitle('');
    setDescription('');
    setLocation('');
    setAnonymous(false);
    onClose();
  }, [onClose]);

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={s.sheetContent}>
        <ThemedText style={[s.sheetTitle, { color: colors.text }]}>Report Incident</ThemedText>
        <ThemedText style={[s.sheetSubtitle, { color: colors.textTertiary }]}>
          Routed to leadership via Messages escalation. Not public.
        </ThemedText>

        <ThemedText style={[s.fieldLabel, { color: colors.textSecondary }]}>Title</ThemedText>
        <TextInput
          style={[s.textInput, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
          value={title}
          onChangeText={setTitle}
          placeholder="Brief summary"
          placeholderTextColor={colors.textTertiary}
        />

        <ThemedText style={[s.fieldLabel, { color: colors.textSecondary }]}>Description</ThemedText>
        <TextInput
          style={[s.textArea, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
          value={description}
          onChangeText={setDescription}
          placeholder="What happened?"
          placeholderTextColor={colors.textTertiary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <ThemedText style={[s.fieldLabel, { color: colors.textSecondary }]}>Location</ThemedText>
        <TextInput
          style={[s.textInput, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
          value={location}
          onChangeText={setLocation}
          placeholder="Where did it happen?"
          placeholderTextColor={colors.textTertiary}
        />

        <Pressable
          style={s.anonRow}
          onPress={() => {
            Haptics.selectionAsync();
            setAnonymous(!anonymous);
          }}
        >
          <IconSymbol
            name={anonymous ? 'checkmark.square.fill' : 'square'}
            size={20}
            color={anonymous ? ACCENT : colors.textTertiary}
          />
          <ThemedText style={[s.anonLabel, { color: colors.text }]}>Submit anonymously</ThemedText>
        </Pressable>

        <Pressable
          style={({ pressed }) => [s.submitBtn, { backgroundColor: ACCENT }, pressed && { opacity: 0.8 }]}
          onPress={handleSubmit}
        >
          <ThemedText style={s.submitBtnText}>Submit Report</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function ChurchCompliance({ colors, accentColor, role }: Props) {
  const churchRole = (role ?? 'C8') as ChurchRoleLens;
  const isA2 = isStaffLevel(churchRole);
  const [reportVisible, setReportVisible] = useState(false);

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <HeaderBlock colors={colors} />
        <SnapshotBlock colors={colors} />
        <VolunteerClearanceBlock colors={colors} isA2={isA2} />
        <AtRiskBlock colors={colors} />
        <DocumentsBlock colors={colors} />
        <ReportingBlock colors={colors} onReport={() => setReportVisible(true)} />
      </ScrollView>
      <IncidentReportSheet visible={reportVisible} onClose={() => setReportVisible(false)} colors={colors} />
    </>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  scroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  // -- Section Label --
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: Spacing.lg,
    marginBottom: 8,
  },

  // -- Card --
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },

  // -- Block 0: Header --
  headerBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerCampus: {
    fontSize: 13,
    marginTop: 2,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // -- Block 1: Snapshot --
  snapshotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  snapshotLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  snapshotChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  snapshotChipText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // -- Block 2: Volunteer Clearance --
  clearanceGrid: {
    gap: 12,
  },
  clearanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clearanceLabel: {
    fontSize: 13,
  },
  clearanceValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  clearanceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  clearanceBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  clearanceNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
  },
  clearanceNoteText: {
    fontSize: 11,
  },

  // -- Block 3: At-Risk --
  riskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  riskLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  riskBadge: {
    minWidth: 28,
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  riskBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  restrictedNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
  },
  restrictedNoteText: {
    fontSize: 11,
  },

  // -- Block 4: Documents --
  docGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  docCell: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  docValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  docLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  docDivider: {
    width: 1,
    height: 28,
  },

  // -- Block 5: Reporting --
  reportDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  reportBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },

  // -- Incident Report Sheet --
  sheetContent: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 13,
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  textInput: {
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  textArea: {
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 80,
  },
  anonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  anonLabel: {
    fontSize: 14,
  },
  submitBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
