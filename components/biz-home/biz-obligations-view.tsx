/**
 * Biz Obligations View — Enterprise Liability Register
 *
 * Grouped by time horizon: Overdue → Due Within 30 Days → Upcoming → Long-Term
 * Tracks legally binding commitments and regulatory exposure.
 * Not a meeting calendar. Not a reminder system. Not workflow management.
 *
 * Rendering Context: Founder / CEO (B1)
 * Heavier than Agenda. Minimal color. Red only for overdue.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, MODE_ACCENT } from '@/constants/theme';
import { BottomSheet } from '@/components/ui/bottom-sheet';

const ACCENT = MODE_ACCENT.business;

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

// =============================================================================
// TYPES
// =============================================================================

type ObligationType = 'COMPLIANCE' | 'CONTRACT' | 'DEBT' | 'LEASE' | 'INSURANCE' | 'TAX' | 'CAPITAL';
type ObligationStatus = 'Active' | 'Overdue' | 'Fulfilled';
type TimeHorizon = 'overdue' | 'due_30' | 'upcoming' | 'long_term';

interface Obligation {
  id: string;
  title: string;
  type: ObligationType;
  dueDate: string;
  status: ObligationStatus;
  horizon: TimeHorizon;
  exposure?: string;
  meta: { label: string; value: string }[];
}

// =============================================================================
// MOCK DATA
// =============================================================================

const OBLIGATIONS: Obligation[] = [
  // Overdue
  {
    id: 'ob1', title: 'Annual Report Filing — Delaware', type: 'COMPLIANCE',
    dueDate: 'Feb 15, 2026', status: 'Overdue', horizon: 'overdue',
    exposure: '$500',
    meta: [
      { label: 'Filing Name', value: 'Annual Report' },
      { label: 'Jurisdiction', value: 'Delaware' },
      { label: 'Linked Compliance ID', value: 'CMP-2026-001' },
    ],
  },
  {
    id: 'ob2', title: 'D&O Insurance Renewal', type: 'INSURANCE',
    dueDate: 'Feb 20, 2026', status: 'Overdue', horizon: 'overdue',
    meta: [
      { label: 'Policy Type', value: 'Directors & Officers' },
      { label: 'Coverage Period', value: 'Mar 2026 – Mar 2027' },
    ],
  },

  // Due Within 30 Days
  {
    id: 'ob3', title: 'Quarterly Tax Filing — Q4 2025', type: 'TAX',
    dueDate: 'Mar 15, 2026', status: 'Active', horizon: 'due_30',
    exposure: '$42,000',
    meta: [
      { label: 'Tax Type', value: 'Federal Corporate Income' },
      { label: 'Jurisdiction', value: 'Federal — IRS' },
      { label: 'Filing Date', value: 'Mar 15, 2026' },
    ],
  },
  {
    id: 'ob4', title: 'AWS Vendor Contract Renewal', type: 'CONTRACT',
    dueDate: 'Mar 15, 2026', status: 'Active', horizon: 'due_30',
    exposure: '$86,400',
    meta: [
      { label: 'Counterparty', value: 'Amazon Web Services' },
      { label: 'Expiration Date', value: 'Mar 15, 2026' },
      { label: 'Auto-Renew', value: 'Yes' },
    ],
  },
  {
    id: 'ob5', title: 'Seed Round Close — SAFE Note', type: 'CAPITAL',
    dueDate: 'Mar 20, 2026', status: 'Active', horizon: 'due_30',
    exposure: '$2,000,000',
    meta: [
      { label: 'Commitment Type', value: 'SAFE — Post-Money' },
      { label: 'Linked Deal', value: 'Apex Capital — Seed' },
    ],
  },

  // Upcoming (31-120 Days)
  {
    id: 'ob6', title: 'General Liability Insurance', type: 'INSURANCE',
    dueDate: 'Apr 30, 2026', status: 'Active', horizon: 'upcoming',
    meta: [
      { label: 'Policy Type', value: 'General Liability' },
      { label: 'Coverage Period', value: 'May 2026 – May 2027' },
    ],
  },
  {
    id: 'ob7', title: 'Office Lease — WeWork DTLA', type: 'LEASE',
    dueDate: 'May 1, 2026', status: 'Active', horizon: 'upcoming',
    exposure: '$144,000',
    meta: [
      { label: 'Property', value: 'WeWork — Downtown LA, Suite 400' },
      { label: 'Expiration Date', value: 'May 1, 2026' },
      { label: 'Renewal Structure', value: '12-month auto-renew' },
    ],
  },
  {
    id: 'ob8', title: 'Convertible Note Maturity', type: 'DEBT',
    dueDate: 'May 15, 2026', status: 'Active', horizon: 'upcoming',
    exposure: '$250,000',
    meta: [
      { label: 'Principal', value: '$250,000' },
      { label: 'Interest Rate', value: '5.0%' },
      { label: 'Maturity Date', value: 'May 15, 2026' },
    ],
  },
  {
    id: 'ob9', title: 'Delaware Franchise Tax', type: 'TAX',
    dueDate: 'Jun 1, 2026', status: 'Active', horizon: 'upcoming',
    exposure: '$400',
    meta: [
      { label: 'Tax Type', value: 'Franchise Tax' },
      { label: 'Jurisdiction', value: 'Delaware' },
      { label: 'Filing Date', value: 'Jun 1, 2026' },
    ],
  },

  // Long-Term
  {
    id: 'ob10', title: 'SOC 2 Type II Audit', type: 'COMPLIANCE',
    dueDate: 'Aug 31, 2026', status: 'Active', horizon: 'long_term',
    meta: [
      { label: 'Filing Name', value: 'SOC 2 Type II Examination' },
      { label: 'Jurisdiction', value: 'United States' },
      { label: 'Linked Compliance ID', value: 'CMP-2026-008' },
    ],
  },
  {
    id: 'ob11', title: 'Equipment Lease — Server Rack', type: 'LEASE',
    dueDate: 'Sep 1, 2026', status: 'Active', horizon: 'long_term',
    exposure: '$36,000',
    meta: [
      { label: 'Property', value: 'Equinix LA1 — Rack 14B' },
      { label: 'Expiration Date', value: 'Sep 1, 2026' },
      { label: 'Renewal Structure', value: 'Month-to-month after expiry' },
    ],
  },
  {
    id: 'ob12', title: 'Series A Preferred Stock Agreement', type: 'CAPITAL',
    dueDate: 'Dec 31, 2026', status: 'Active', horizon: 'long_term',
    exposure: '$8,000,000',
    meta: [
      { label: 'Commitment Type', value: 'Preferred Equity — Series A' },
      { label: 'Linked Deal', value: 'TBD — Fundraise Target' },
    ],
  },
];

// =============================================================================
// CONSTANTS
// =============================================================================

const TYPE_COLORS: Record<ObligationType, string> = {
  COMPLIANCE: '#78716C',
  CONTRACT: '#78716C',
  DEBT: '#78716C',
  LEASE: '#78716C',
  INSURANCE: '#78716C',
  TAX: '#78716C',
  CAPITAL: '#78716C',
};

const STATUS_COLORS: Record<ObligationStatus, string> = {
  Active: '#A1A1AA',
  Overdue: '#EF4444',
  Fulfilled: '#6B7280',
};

const HORIZON_LABELS: Record<TimeHorizon, string> = {
  overdue: 'Overdue',
  due_30: 'Due Within 30 Days',
  upcoming: 'Upcoming (31–120 Days)',
  long_term: 'Long-Term',
};

const HORIZON_ORDER: TimeHorizon[] = ['overdue', 'due_30', 'upcoming', 'long_term'];

type TypeFilter = 'All' | ObligationType;
const TYPE_OPTIONS: TypeFilter[] = ['All', 'COMPLIANCE', 'CONTRACT', 'DEBT', 'LEASE', 'INSURANCE', 'TAX', 'CAPITAL'];

// =============================================================================
// OBLIGATION DETAIL — ENRICHMENT DATA
// =============================================================================

interface LinkedObject {
  type: string;
  id: string;
  label: string;
}

interface ObligationEnrichment {
  effectiveDate?: string;
  linkedEntity?: string;
  responsibleRole: string;
  remainingExposure?: string;
  linkedObjects: LinkedObject[];
}

const OBLIGATION_ENRICHMENT: Record<string, ObligationEnrichment> = {
  ob1: {
    effectiveDate: 'Jan 1, 2026', linkedEntity: 'State of Delaware',
    responsibleRole: 'Compliance Officer',
    linkedObjects: [{ type: 'Compliance Filing', id: 'CMP-2026-001', label: 'Annual Report — Delaware' }],
  },
  ob2: {
    linkedEntity: 'Hartford Financial',
    responsibleRole: 'CFO',
    linkedObjects: [{ type: 'Contract', id: 'CTR-008', label: 'D&O Policy — Hartford' }],
  },
  ob3: {
    effectiveDate: 'Jan 1, 2026',
    responsibleRole: 'CFO',
    remainingExposure: '$42,000',
    linkedObjects: [{ type: 'Finance Bucket', id: 'FIN-TAX-Q4', label: 'Q4 2025 Tax Reserve' }],
  },
  ob4: {
    effectiveDate: 'Mar 15, 2025', linkedEntity: 'Amazon Web Services',
    responsibleRole: 'CTO',
    remainingExposure: '$86,400',
    linkedObjects: [{ type: 'Contract', id: 'CTR-002', label: 'AWS Service Agreement' }],
  },
  ob5: {
    linkedEntity: 'Apex Capital',
    responsibleRole: 'Founder',
    remainingExposure: '$2,000,000',
    linkedObjects: [
      { type: 'Deal', id: 'DEAL-001', label: 'Apex Capital — Seed Round' },
      { type: 'Contract', id: 'CTR-004', label: 'SAFE Note Agreement' },
    ],
  },
  ob6: {
    linkedEntity: 'Hartford Financial',
    responsibleRole: 'CFO',
    linkedObjects: [],
  },
  ob7: {
    effectiveDate: 'May 1, 2024', linkedEntity: 'WeWork',
    responsibleRole: 'COO',
    remainingExposure: '$144,000',
    linkedObjects: [
      { type: 'Contract', id: 'CTR-005', label: 'WeWork Lease — DTLA' },
      { type: 'Facility', id: 'FAC-001', label: 'WeWork Downtown LA, Suite 400' },
    ],
  },
  ob8: {
    effectiveDate: 'Nov 15, 2024',
    responsibleRole: 'CFO',
    remainingExposure: '$250,000',
    linkedObjects: [{ type: 'Deal', id: 'DEAL-002', label: 'Angel Bridge Note' }],
  },
  ob9: {
    effectiveDate: 'Jan 1, 2026', linkedEntity: 'State of Delaware',
    responsibleRole: 'Compliance Officer',
    remainingExposure: '$400',
    linkedObjects: [{ type: 'Compliance Filing', id: 'CMP-2026-005', label: 'Franchise Tax — Delaware' }],
  },
  ob10: {
    effectiveDate: 'Aug 1, 2025',
    responsibleRole: 'Compliance Officer',
    linkedObjects: [{ type: 'Compliance Filing', id: 'CMP-2026-008', label: 'SOC 2 Type II Audit' }],
  },
  ob11: {
    effectiveDate: 'Sep 1, 2024', linkedEntity: 'Equinix',
    responsibleRole: 'CTO',
    remainingExposure: '$36,000',
    linkedObjects: [
      { type: 'Contract', id: 'CTR-009', label: 'Equinix Rack Lease' },
      { type: 'Facility', id: 'FAC-002', label: 'Equinix LA1 — Rack 14B' },
    ],
  },
  ob12: {
    responsibleRole: 'Founder',
    remainingExposure: '$8,000,000',
    linkedObjects: [{ type: 'Deal', id: 'DEAL-003', label: 'Series A Target' }],
  },
};

const LINKED_OBJ_ICONS: Record<string, string> = {
  Deal: 'briefcase.fill',
  'Compliance Filing': 'doc.text.fill',
  Contract: 'signature',
  'Finance Bucket': 'dollarsign.circle.fill',
  Facility: 'building.fill',
  Program: 'building.2.fill',
};

// =============================================================================
// OBLIGATION DETAIL SHEET (5-Section)
// =============================================================================

function ObligationDetailSheet({
  obligation,
  onClose,
  colors,
}: {
  obligation: Obligation | null;
  onClose: () => void;
  colors: typeof Colors.light;
}) {
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const handleAction = useCallback((action: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setConfirmAction(action);
  }, []);

  const handleConfirm = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setConfirmAction(null);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setConfirmAction(null);
    onClose();
  }, [onClose]);

  if (!obligation) return null;

  const isOverdue = obligation.status === 'Overdue';
  const statusColor = STATUS_COLORS[obligation.status];
  const enrichment = OBLIGATION_ENRICHMENT[obligation.id];
  const hasLinkedObjects = (enrichment?.linkedObjects.length ?? 0) > 0;

  return (
    <BottomSheet visible={!!obligation} onClose={handleCloseSheet}>
      <View style={s.sheetContent}>
        {/* ── SECTION 1 — Obligation Header ──────────────────────── */}
        {isOverdue && <View style={s.overdueBar} />}
        <View style={s.detailSection}>
          <View style={s.detailHeader}>
            <ThemedText style={[s.detailTitle, { color: colors.text }]}>{obligation.title}</ThemedText>
          </View>
          <View style={s.detailPillRow}>
            <View style={[s.typePill, { backgroundColor: '#78716C15' }]}>
              <ThemedText style={[s.typePillText, { color: '#78716C' }]}>{obligation.type}</ThemedText>
            </View>
            <View style={[s.detailStatusPill, { backgroundColor: statusColor + '15' }]}>
              <View style={[s.statusDot, { backgroundColor: statusColor }]} />
              <ThemedText style={[s.detailStatusText, { color: statusColor }]}>{obligation.status}</ThemedText>
            </View>
          </View>

          <View style={s.detailDateBlock}>
            <View style={s.detailDateRow}>
              <ThemedText style={[s.detailDateLabel, { color: colors.textTertiary }]}>Due Date</ThemedText>
              <View style={s.detailDateValueRow}>
                {isOverdue && <View style={s.overdueIndicator} />}
                <ThemedText style={[s.detailDateValue, { color: isOverdue ? '#EF4444' : colors.text }]}>
                  {obligation.dueDate}
                </ThemedText>
              </View>
            </View>
            {enrichment?.effectiveDate && (
              <View style={s.detailDateRow}>
                <ThemedText style={[s.detailDateLabel, { color: colors.textTertiary }]}>Effective Date</ThemedText>
                <ThemedText style={[s.detailDateValue, { color: colors.textSecondary }]}>
                  {enrichment.effectiveDate}
                </ThemedText>
              </View>
            )}
            {enrichment?.linkedEntity && (
              <View style={s.detailDateRow}>
                <ThemedText style={[s.detailDateLabel, { color: colors.textTertiary }]}>Linked Entity</ThemedText>
                <ThemedText style={[s.detailDateValue, { color: colors.text }]}>
                  {enrichment.linkedEntity}
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        <View style={[s.detailDivider, { backgroundColor: colors.border }]} />

        {/* ── SECTION 2 — Core Terms ─────────────────────────────── */}
        <View style={s.detailSection}>
          <ThemedText style={[s.detailSectionLabel, { color: colors.textTertiary }]}>CORE TERMS</ThemedText>
          {obligation.meta.slice(0, 6).map((m, i) => (
            <View key={i} style={s.detailTermRow}>
              <ThemedText style={[s.detailTermLabel, { color: colors.textTertiary }]}>{m.label}</ThemedText>
              <ThemedText style={[s.detailTermValue, { color: colors.text }]}>{m.value}</ThemedText>
            </View>
          ))}
        </View>

        {/* ── SECTION 3 — Financial Exposure ─────────────────────── */}
        {obligation.exposure && (
          <>
            <View style={[s.detailDivider, { backgroundColor: colors.border }]} />
            <View style={s.detailSection}>
              <ThemedText style={[s.detailSectionLabel, { color: colors.textTertiary }]}>FINANCIAL EXPOSURE</ThemedText>
              <View style={s.detailTermRow}>
                <ThemedText style={[s.detailTermLabel, { color: colors.textTertiary }]}>Total Exposure</ThemedText>
                <ThemedText style={[s.detailExposureValue, { color: colors.text }]}>{obligation.exposure}</ThemedText>
              </View>
              {enrichment?.remainingExposure && (
                <View style={s.detailTermRow}>
                  <ThemedText style={[s.detailTermLabel, { color: colors.textTertiary }]}>Remaining Exposure</ThemedText>
                  <ThemedText style={[s.detailExposureValue, { color: colors.text }]}>{enrichment.remainingExposure}</ThemedText>
                </View>
              )}
            </View>
          </>
        )}

        {/* ── SECTION 4 — Linked Objects ─────────────────────────── */}
        {hasLinkedObjects && (
          <>
            <View style={[s.detailDivider, { backgroundColor: colors.border }]} />
            <View style={s.detailSection}>
              <ThemedText style={[s.detailSectionLabel, { color: colors.textTertiary }]}>LINKED OBJECTS</ThemedText>
              {enrichment!.linkedObjects.map((obj, i) => {
                const icon = LINKED_OBJ_ICONS[obj.type] ?? 'link';
                return (
                  <Pressable
                    key={i}
                    style={[s.linkedRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => Haptics.selectionAsync()}
                  >
                    <IconSymbol name={icon as any} size={14} color={colors.textSecondary} />
                    <View style={{ flex: 1 }}>
                      <ThemedText style={[s.linkedType, { color: colors.textTertiary }]}>{obj.type}</ThemedText>
                      <ThemedText style={[s.linkedLabel, { color: colors.text }]}>{obj.label}</ThemedText>
                    </View>
                    <ThemedText style={[s.linkedId, { color: colors.textTertiary }]}>{obj.id}</ThemedText>
                    <IconSymbol name="chevron.right" size={10} color={colors.textTertiary} />
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        <View style={[s.detailDivider, { backgroundColor: colors.border }]} />

        {/* ── SECTION 5 — Authority & Controls ───────────────────── */}
        <View style={s.detailSection}>
          <ThemedText style={[s.detailSectionLabel, { color: colors.textTertiary }]}>AUTHORITY & CONTROLS</ThemedText>

          {enrichment?.responsibleRole && (
            <View style={[s.detailTermRow, { marginBottom: 12 }]}>
              <ThemedText style={[s.detailTermLabel, { color: colors.textTertiary }]}>Responsible Role</ThemedText>
              <ThemedText style={[s.detailTermValue, { color: colors.text }]}>{enrichment.responsibleRole}</ThemedText>
            </View>
          )}

          {confirmAction ? (
            <View style={[s.confirmBlock, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[s.confirmText, { color: colors.text }]}>
                Confirm: {confirmAction}?
              </ThemedText>
              <ThemedText style={[s.confirmSubtext, { color: colors.textTertiary }]}>
                Propose → Validate → Confirm → Commit
              </ThemedText>
              <View style={s.confirmActions}>
                <Pressable
                  style={[s.confirmBtn, { borderColor: colors.border }]}
                  onPress={() => setConfirmAction(null)}
                >
                  <ThemedText style={[s.confirmBtnText, { color: colors.textSecondary }]}>Cancel</ThemedText>
                </Pressable>
                <Pressable
                  style={[s.confirmBtn, { backgroundColor: ACCENT }]}
                  onPress={handleConfirm}
                >
                  <ThemedText style={s.confirmBtnCommit}>Commit</ThemedText>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={s.actionRow}>
              <Pressable
                style={[s.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleAction('Propose Amendment')}
              >
                <IconSymbol name="pencil" size={13} color={colors.textSecondary} />
                <ThemedText style={[s.actionBtnText, { color: colors.textSecondary }]}>Propose Amendment</ThemedText>
              </Pressable>
              {obligation.status !== 'Fulfilled' && (
                <Pressable
                  style={[s.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => handleAction('Mark Fulfilled')}
                >
                  <IconSymbol name="checkmark" size={13} color="#22C55E" />
                  <ThemedText style={[s.actionBtnText, { color: '#22C55E' }]}>Mark Fulfilled</ThemedText>
                </Pressable>
              )}
              <Pressable
                style={[s.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleAction('Initiate Termination')}
              >
                <IconSymbol name="xmark" size={13} color="#EF4444" />
                <ThemedText style={[s.actionBtnText, { color: '#EF4444' }]}>Initiate Termination</ThemedText>
              </Pressable>
              <Pressable
                style={[s.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleAction('Escalate Review')}
              >
                <IconSymbol name="arrow.up.right" size={13} color={colors.textSecondary} />
                <ThemedText style={[s.actionBtnText, { color: colors.textSecondary }]}>Escalate Review</ThemedText>
              </Pressable>
            </View>
          )}
        </View>

        <View style={{ height: 20 }} />
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// ADD OBLIGATION SHEET
// =============================================================================

function AddObligationSheet({
  visible,
  onClose,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  colors: typeof Colors.light;
}) {
  const [title, setTitle] = useState('');
  const [oblType, setOblType] = useState<ObligationType>('COMPLIANCE');
  const [dueDate, setDueDate] = useState('');
  const [domain, setDomain] = useState('');
  const [exposure, setExposure] = useState('');
  const [counterparty, setCounterparty] = useState('');
  const [responsibleRole, setResponsibleRole] = useState('');

  const types: ObligationType[] = ['COMPLIANCE', 'CONTRACT', 'DEBT', 'LEASE', 'INSURANCE', 'TAX', 'CAPITAL'];
  const domains = ['Finance', 'Compliance', 'Deal', 'Operations', 'People'];

  const handleSubmit = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTitle('');
    setOblType('COMPLIANCE');
    setDueDate('');
    setDomain('');
    setExposure('');
    setCounterparty('');
    setResponsibleRole('');
    onClose();
  }, [onClose]);

  const canSubmit = title.trim() && dueDate.trim();

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <ScrollView style={s.sheetContent} showsVerticalScrollIndicator={false}>
        <ThemedText style={[s.sheetTitle, { color: colors.text }]}>Add Obligation</ThemedText>
        <ThemedText style={[s.sheetSubtitle, { color: colors.textSecondary }]}>
          Propose → Validate → Confirm → Commit
        </ThemedText>

        {/* Type */}
        <ThemedText style={[s.fieldLabel, { color: colors.textSecondary }]}>Type</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.pillRow}>
          {types.map((t) => {
            const sel = oblType === t;
            return (
              <Pressable
                key={t}
                style={[s.selectPill, { backgroundColor: sel ? ACCENT + '20' : colors.card, borderColor: sel ? ACCENT : colors.border }]}
                onPress={() => { Haptics.selectionAsync(); setOblType(t); }}
              >
                <ThemedText style={[s.selectPillText, { color: sel ? ACCENT : colors.textSecondary }]}>{t}</ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Title */}
        <ThemedText style={[s.fieldLabel, { color: colors.textSecondary }]}>Title</ThemedText>
        <TextInput
          style={[s.textInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Obligation title"
          placeholderTextColor={colors.textTertiary}
          value={title}
          onChangeText={setTitle}
        />

        {/* Due Date */}
        <ThemedText style={[s.fieldLabel, { color: colors.textSecondary }]}>Due Date</ThemedText>
        <TextInput
          style={[s.textInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="e.g. Mar 15, 2026"
          placeholderTextColor={colors.textTertiary}
          value={dueDate}
          onChangeText={setDueDate}
        />

        {/* Linked Domain */}
        <ThemedText style={[s.fieldLabel, { color: colors.textSecondary }]}>Linked Domain</ThemedText>
        <View style={s.domainRow}>
          {domains.map((d) => {
            const sel = domain === d;
            return (
              <Pressable
                key={d}
                style={[s.selectPill, { backgroundColor: sel ? ACCENT + '20' : colors.card, borderColor: sel ? ACCENT : colors.border }]}
                onPress={() => { Haptics.selectionAsync(); setDomain(d); }}
              >
                <ThemedText style={[s.selectPillText, { color: sel ? ACCENT : colors.textSecondary }]}>{d}</ThemedText>
              </Pressable>
            );
          })}
        </View>

        {/* Exposure Amount */}
        <ThemedText style={[s.fieldLabel, { color: colors.textSecondary }]}>Exposure Amount (if applicable)</ThemedText>
        <TextInput
          style={[s.textInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="e.g. $250,000"
          placeholderTextColor={colors.textTertiary}
          value={exposure}
          onChangeText={setExposure}
        />

        {/* Counterparty */}
        <ThemedText style={[s.fieldLabel, { color: colors.textSecondary }]}>Counterparty (if applicable)</ThemedText>
        <TextInput
          style={[s.textInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="e.g. Amazon Web Services"
          placeholderTextColor={colors.textTertiary}
          value={counterparty}
          onChangeText={setCounterparty}
        />

        {/* Responsible Role */}
        <ThemedText style={[s.fieldLabel, { color: colors.textSecondary }]}>Responsible Role</ThemedText>
        <TextInput
          style={[s.textInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="e.g. CFO, General Counsel"
          placeholderTextColor={colors.textTertiary}
          value={responsibleRole}
          onChangeText={setResponsibleRole}
        />

        {/* Submit */}
        <Pressable
          style={[s.submitBtn, { backgroundColor: ACCENT, opacity: canSubmit ? 1 : 0.4 }]}
          onPress={canSubmit ? handleSubmit : undefined}
        >
          <ThemedText style={s.submitText}>Propose Obligation</ThemedText>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </BottomSheet>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function BizObligationsView({ colors, accent }: Props) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [selectedObligation, setSelectedObligation] = useState<Obligation | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Filter pipeline
  const filtered = useMemo(() => {
    if (typeFilter === 'All') return OBLIGATIONS;
    return OBLIGATIONS.filter((o) => o.type === typeFilter);
  }, [typeFilter]);

  // Group by time horizon
  const grouped = useMemo(() => {
    const groups: { key: TimeHorizon; label: string; obligations: Obligation[] }[] = [];
    for (const key of HORIZON_ORDER) {
      const items = filtered.filter((o) => o.horizon === key);
      if (items.length > 0) {
        groups.push({ key, label: HORIZON_LABELS[key], obligations: items });
      }
    }
    return groups;
  }, [filtered]);

  const toggleCollapse = useCallback((key: string) => {
    Haptics.selectionAsync();
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* ── Header ─────────────────────────────────────────────────── */}
        <View style={s.headerRow}>
          <View style={{ flex: 1 }} />
          <View style={s.headerActions}>
            <Pressable
              style={[s.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => { Haptics.selectionAsync(); setShowFilters(!showFilters); }}
            >
              <IconSymbol name="line.3.horizontal.decrease" size={14} color={colors.textSecondary} />
            </Pressable>
            <Pressable
              style={[s.iconBtn, { backgroundColor: ACCENT }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAddVisible(true); }}
            >
              <IconSymbol name="plus" size={14} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* ── Filters (toggle) ───────────────────────────────────────── */}
        {showFilters && (
          <View style={s.filtersBlock}>
            <ThemedText style={[s.filterGroupLabel, { color: colors.textTertiary }]}>TYPE</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll}>
              {TYPE_OPTIONS.map((t) => {
                const active = typeFilter === t;
                return (
                  <Pressable
                    key={t}
                    style={[s.filterPill, { backgroundColor: active ? ACCENT + '18' : colors.card, borderColor: active ? ACCENT : colors.border }]}
                    onPress={() => { Haptics.selectionAsync(); setTypeFilter(t); }}
                  >
                    <ThemedText style={[s.filterPillText, { color: active ? ACCENT : colors.textSecondary }]}>{t}</ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* ── Horizon Sections ───────────────────────────────────────── */}
        {grouped.length === 0 ? (
          <View style={[s.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>No obligations match your filter.</ThemedText>
          </View>
        ) : (
          grouped.map((group) => {
            const isCollapsed = collapsed[group.key] ?? false;
            const isOverdueSection = group.key === 'overdue';
            return (
              <View key={group.key} style={s.horizonSection}>
                <Pressable style={s.horizonHeader} onPress={() => toggleCollapse(group.key)}>
                  <View style={s.horizonLabelRow}>
                    {isOverdueSection && <View style={s.overdueHeaderDot} />}
                    <ThemedText style={[
                      s.horizonLabel,
                      { color: isOverdueSection ? '#EF4444' : colors.textSecondary },
                    ]}>
                      {group.label}
                    </ThemedText>
                  </View>
                  <View style={s.horizonRight}>
                    <ThemedText style={[s.horizonCount, { color: colors.textTertiary }]}>{group.obligations.length}</ThemedText>
                    <IconSymbol name={isCollapsed ? 'chevron.right' : 'chevron.down'} size={10} color={colors.textTertiary} />
                  </View>
                </Pressable>

                {!isCollapsed && group.obligations.map((obl) => {
                  const isOverdue = obl.status === 'Overdue';
                  const statusColor = STATUS_COLORS[obl.status];
                  return (
                    <Pressable
                      key={obl.id}
                      style={[
                        s.oblCard,
                        { backgroundColor: colors.card, borderColor: isOverdue ? '#EF444440' : colors.border },
                      ]}
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedObligation(obl); }}
                    >
                      {/* Top Row: Title + Type + Due */}
                      <View style={s.oblTopRow}>
                        <View style={{ flex: 1, gap: 4 }}>
                          <View style={s.oblTitleRow}>
                            {isOverdue && <View style={s.overdueIndicator} />}
                            <ThemedText style={[s.oblTitle, { color: colors.text }]} numberOfLines={1}>{obl.title}</ThemedText>
                          </View>
                          <View style={s.oblSubRow}>
                            <View style={[s.typePill, { backgroundColor: '#78716C15' }]}>
                              <ThemedText style={[s.typePillText, { color: '#78716C' }]}>{obl.type}</ThemedText>
                            </View>
                            <ThemedText style={[s.oblDueDate, { color: isOverdue ? '#EF4444' : colors.textTertiary }]}>
                              Due {obl.dueDate}
                            </ThemedText>
                          </View>
                        </View>
                      </View>

                      {/* Meta Lines (max 4) */}
                      {obl.meta.slice(0, 4).map((m, i) => (
                        <View key={i} style={s.metaRow}>
                          <ThemedText style={[s.metaLabel, { color: colors.textTertiary }]}>{m.label}</ThemedText>
                          <ThemedText style={[s.metaValue, { color: colors.textSecondary }]}>{m.value}</ThemedText>
                        </View>
                      ))}

                      {/* Exposure (if applicable) */}
                      {obl.exposure && (
                        <View style={s.metaRow}>
                          <ThemedText style={[s.metaLabel, { color: colors.textTertiary }]}>Exposure Amount</ThemedText>
                          <ThemedText style={[s.metaValue, { color: colors.text, fontWeight: '700' }]}>{obl.exposure}</ThemedText>
                        </View>
                      )}

                      {/* Bottom Row: Status + Chevron */}
                      <View style={[s.oblBottomRow, { borderColor: colors.border }]}>
                        <View style={[s.statusChip, { backgroundColor: statusColor + '15' }]}>
                          <View style={[s.statusDot, { backgroundColor: statusColor }]} />
                          <ThemedText style={[s.statusText, { color: statusColor }]}>{obl.status}</ThemedText>
                        </View>
                        <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ── Detail Sheet ────────────────────────────────────────────── */}
      <ObligationDetailSheet
        obligation={selectedObligation}
        onClose={() => setSelectedObligation(null)}
        colors={colors}
      />

      {/* ── Add Obligation Sheet ────────────────────────────────────── */}
      <AddObligationSheet visible={addVisible} onClose={() => setAddVisible(false)} colors={colors} />
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.md, paddingBottom: 120 },

  // -- Header --
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800' },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },

  // -- Filters --
  filtersBlock: { marginBottom: 16 },
  filterGroupLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.6, marginBottom: 6 },
  filterScroll: { flexGrow: 0, marginBottom: 4 },
  filterPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.full, borderWidth: 1, marginRight: 6 },
  filterPillText: { fontSize: 10, fontWeight: '600' },

  // -- Horizon Sections --
  horizonSection: { marginBottom: 18 },
  horizonHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingVertical: 4 },
  horizonLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  horizonLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  horizonRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  horizonCount: { fontSize: 11, fontWeight: '600' },
  overdueHeaderDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444' },

  // -- Obligation Card --
  oblCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 8 },
  oblTopRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  oblTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  oblTitle: { fontSize: 14, fontWeight: '700', flex: 1 },
  oblSubRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  oblDueDate: { fontSize: 11 },
  overdueIndicator: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444' },

  // -- Type Pill --
  typePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  typePillText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },

  // -- Meta --
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 3 },
  metaLabel: { fontSize: 11 },
  metaValue: { fontSize: 11, fontWeight: '600' },

  // -- Bottom Row --
  oblBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, marginTop: 6, borderTopWidth: StyleSheet.hairlineWidth },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { fontSize: 10, fontWeight: '700' },

  // -- Empty --
  emptyCard: { borderRadius: 12, borderWidth: 1, padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 13 },

  // -- Detail Sheet --
  sheetContent: { padding: Spacing.md, paddingBottom: 40 },
  overdueBar: { height: 3, backgroundColor: '#EF4444', borderRadius: 2, marginBottom: 12 },
  detailSection: { paddingVertical: 8 },
  detailSectionLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.6, marginBottom: 10 },
  detailDivider: { height: StyleSheet.hairlineWidth },
  detailHeader: { marginBottom: 8 },
  detailTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  detailPillRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  detailStatusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 3, borderRadius: BorderRadius.full },
  detailStatusText: { fontSize: 10, fontWeight: '700' },
  detailDateBlock: { gap: 6 },
  detailDateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  detailDateLabel: { fontSize: 12 },
  detailDateValueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailDateValue: { fontSize: 13, fontWeight: '600' },
  detailTermRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  detailTermLabel: { fontSize: 12 },
  detailTermValue: { fontSize: 12, fontWeight: '600' },
  detailExposureValue: { fontSize: 14, fontWeight: '800', fontVariant: ['tabular-nums'] as any },
  linkedRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  linkedType: { fontSize: 9, fontWeight: '600', letterSpacing: 0.3 },
  linkedLabel: { fontSize: 13, fontWeight: '600' },
  linkedId: { fontSize: 10 },
  actionRow: { gap: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1 },
  actionBtnText: { fontSize: 13, fontWeight: '600' },
  confirmBlock: { borderRadius: 12, borderWidth: 1, padding: 16 },
  confirmText: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  confirmSubtext: { fontSize: 11, marginBottom: 14 },
  confirmActions: { flexDirection: 'row', gap: 10 },
  confirmBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
  confirmBtnText: { fontSize: 13, fontWeight: '600' },
  confirmBtnCommit: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // -- Add Sheet --
  sheetTitle: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  sheetSubtitle: { fontSize: 12, marginBottom: 16 },
  fieldLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3, marginBottom: 6, marginTop: 12 },
  textInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  pillRow: { flexGrow: 0, marginBottom: 4 },
  selectPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.full, borderWidth: 1, marginRight: 6 },
  selectPillText: { fontSize: 10, fontWeight: '600' },
  domainRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  submitBtn: { alignItems: 'center', paddingVertical: 14, borderRadius: 12, marginTop: 20 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
