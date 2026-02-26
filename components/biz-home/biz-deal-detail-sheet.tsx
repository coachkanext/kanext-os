/**
 * Biz Deal Detail Sheet — Structured View of a Single Deal
 *
 * 6 Sections: Header, Terms Summary, Capital Overview, Documents, Milestones, Authority & Actions
 *
 * Rendering Context: Founder / CEO (B1)
 * All actions require: Propose → Validate → Confirm → Commit
 * Deals do not execute money. Deals do not store documents.
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, MODE_ACCENT } from '@/constants/theme';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import {
  DEAL_TYPE_COLORS,
  STAGE_COLORS,
  formatDealValue,
  type Deal,
} from '@/data/mock-deals';

const ACCENT = MODE_ACCENT.business;

const STATUS_COLORS: Record<string, string> = {
  Active: '#22C55E',
  'Pending Close': '#F59E0B',
  Closed: '#A1A1AA',
  Cancelled: '#EF4444',
};

const DOC_TYPE_ICONS: Record<string, string> = {
  'Term Sheet': 'doc.text.fill',
  SAFE: 'signature',
  'Purchase Agreement': 'doc.richtext.fill',
  'Board Resolution': 'building.columns.fill',
  'Side Letter': 'envelope.fill',
};

// =============================================================================
// MAIN EXPORT
// =============================================================================

interface Props {
  deal: Deal | null;
  visible: boolean;
  onClose: () => void;
  colors: typeof Colors.light;
}

export function BizDealDetailSheet({ deal, visible, onClose, colors }: Props) {
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

  if (!deal) return null;

  const typeColor = DEAL_TYPE_COLORS[deal.type];
  const stageColor = STAGE_COLORS[deal.stage];
  const statusColor = STATUS_COLORS[deal.status] ?? '#A1A1AA';
  const isReadOnly = deal.lifecycle === 'closed' || deal.lifecycle === 'archive';
  const hasCapital = deal.capitalOverview != null;
  const hasDocs = deal.linkedDocs.length > 0;

  return (
    <BottomSheet visible={visible} onClose={handleCloseSheet}>
      <View style={s.content}>
        {/* ── SECTION 1 — Deal Header ─────────────────────────────────── */}
        <View style={s.section}>
          <ThemedText style={[s.title, { color: colors.text }]}>{deal.name}</ThemedText>

          <View style={s.pillRow}>
            <View style={[s.typePill, { backgroundColor: typeColor + '15' }]}>
              <ThemedText style={[s.typePillText, { color: typeColor }]}>{deal.type}</ThemedText>
            </View>
            <View style={[s.stagePill, { backgroundColor: stageColor + '15' }]}>
              <ThemedText style={[s.stagePillText, { color: stageColor }]}>{deal.stage}</ThemedText>
            </View>
            <View style={[s.statusPill, { backgroundColor: statusColor + '15' }]}>
              <View style={[s.statusDot, { backgroundColor: statusColor }]} />
              <ThemedText style={[s.statusPillText, { color: statusColor }]}>{deal.status}</ThemedText>
            </View>
          </View>

          <View style={s.metaBlock}>
            <View style={s.metaRow}>
              <ThemedText style={[s.metaLabel, { color: colors.textTertiary }]}>Counterparty</ThemedText>
              <ThemedText style={[s.metaValue, { color: colors.text }]}>{deal.counterparty}</ThemedText>
            </View>
            <View style={s.metaRow}>
              <ThemedText style={[s.metaLabel, { color: colors.textTertiary }]}>Structure</ThemedText>
              <ThemedText style={[s.metaValue, { color: colors.text }]}>{deal.structureType}</ThemedText>
            </View>
            <View style={s.metaRow}>
              <ThemedText style={[s.metaLabel, { color: colors.textTertiary }]}>Target Value</ThemedText>
              <ThemedText style={[s.metaValue, { color: colors.text }]}>{formatDealValue(deal.targetValue)}</ThemedText>
            </View>
            <View style={s.metaRow}>
              <ThemedText style={[s.metaLabel, { color: colors.textTertiary }]}>
                {deal.lifecycle === 'closed' ? 'Close Date' : 'Expected Close'}
              </ThemedText>
              <ThemedText style={[s.metaValue, { color: colors.text }]}>
                {deal.closeDate ?? deal.expectedCloseDate}
              </ThemedText>
            </View>
            {deal.finalValue != null && deal.finalValue > 0 && (
              <View style={s.metaRow}>
                <ThemedText style={[s.metaLabel, { color: colors.textTertiary }]}>Final Value</ThemedText>
                <ThemedText style={[s.metaValue, { color: colors.text }]}>{formatDealValue(deal.finalValue)}</ThemedText>
              </View>
            )}
          </View>
        </View>

        <View style={[s.divider, { backgroundColor: colors.border }]} />

        {/* ── SECTION 2 — Terms Summary ───────────────────────────────── */}
        <View style={s.section}>
          <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>TERMS SUMMARY</ThemedText>
          {renderTerms(deal.terms, colors)}
        </View>

        {/* ── SECTION 3 — Capital Overview (if financial) ─────────────── */}
        {hasCapital && (
          <>
            <View style={[s.divider, { backgroundColor: colors.border }]} />
            <View style={s.section}>
              <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>CAPITAL OVERVIEW</ThemedText>
              <View style={s.capitalGrid}>
                <View style={[s.capitalCell, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <ThemedText style={[s.capitalAmount, { color: colors.text }]}>{deal.capitalOverview!.targetAmount}</ThemedText>
                  <ThemedText style={[s.capitalLabel, { color: colors.textTertiary }]}>Target</ThemedText>
                </View>
                <View style={[s.capitalCell, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <ThemedText style={[s.capitalAmount, { color: '#2563EB' }]}>{deal.capitalOverview!.committedAmount}</ThemedText>
                  <ThemedText style={[s.capitalLabel, { color: colors.textTertiary }]}>Committed</ThemedText>
                </View>
                <View style={[s.capitalCell, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <ThemedText style={[s.capitalAmount, { color: '#22C55E' }]}>{deal.capitalOverview!.receivedAmount}</ThemedText>
                  <ThemedText style={[s.capitalLabel, { color: colors.textTertiary }]}>Received</ThemedText>
                </View>
                <View style={[s.capitalCell, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <ThemedText style={[s.capitalAmount, { color: '#F59E0B' }]}>{deal.capitalOverview!.remaining}</ThemedText>
                  <ThemedText style={[s.capitalLabel, { color: colors.textTertiary }]}>Remaining</ThemedText>
                </View>
              </View>
              {deal.capitalOverview!.linkedFinanceObject && (
                <Pressable
                  style={[s.financeLink, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => Haptics.selectionAsync()}
                >
                  <IconSymbol name="banknote" size={13} color={colors.textSecondary} />
                  <ThemedText style={[s.financeLinkText, { color: colors.textSecondary }]}>
                    Linked Finance: {deal.capitalOverview!.linkedFinanceObject}
                  </ThemedText>
                  <IconSymbol name="chevron.right" size={10} color={colors.textTertiary} />
                </Pressable>
              )}
            </View>
          </>
        )}

        {/* ── SECTION 4 — Documents ───────────────────────────────────── */}
        {hasDocs && (
          <>
            <View style={[s.divider, { backgroundColor: colors.border }]} />
            <View style={s.section}>
              <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>DOCUMENTS</ThemedText>
              <ThemedText style={[s.docsNote, { color: colors.textTertiary }]}>
                Linked Vault documents — tap to open
              </ThemedText>
              {deal.linkedDocs.map((doc, i) => {
                const icon = DOC_TYPE_ICONS[doc.type] ?? 'doc.fill';
                return (
                  <Pressable
                    key={i}
                    style={[s.docRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => Haptics.selectionAsync()}
                  >
                    <IconSymbol name={icon as any} size={14} color={colors.textSecondary} />
                    <View style={{ flex: 1 }}>
                      <ThemedText style={[s.docType, { color: colors.textTertiary }]}>{doc.type}</ThemedText>
                      <ThemedText style={[s.docLabel, { color: colors.text }]}>{doc.label}</ThemedText>
                    </View>
                    {doc.vaultDocId && (
                      <ThemedText style={[s.docVaultId, { color: colors.textTertiary }]}>{doc.vaultDocId}</ThemedText>
                    )}
                    <IconSymbol name="chevron.right" size={10} color={colors.textTertiary} />
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        <View style={[s.divider, { backgroundColor: colors.border }]} />

        {/* ── SECTION 5 — Milestones ──────────────────────────────────── */}
        <View style={s.section}>
          <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>MILESTONES</ThemedText>
          {deal.milestones.map((ms, i) => {
            const isComplete = ms.status === 'Completed';
            return (
              <View key={i} style={s.milestoneRow}>
                <View style={[s.milestoneIcon, { backgroundColor: isComplete ? '#22C55E' + '20' : colors.card }]}>
                  {isComplete ? (
                    <IconSymbol name="checkmark" size={10} color="#22C55E" />
                  ) : (
                    <View style={[s.milestoneDot, { backgroundColor: colors.textTertiary }]} />
                  )}
                </View>
                <View style={s.milestoneContent}>
                  <ThemedText style={[s.milestoneLabel, { color: isComplete ? colors.text : colors.textSecondary }]}>
                    {ms.label}
                  </ThemedText>
                  {ms.date && (
                    <ThemedText style={[s.milestoneDate, { color: colors.textTertiary }]}>{ms.date}</ThemedText>
                  )}
                </View>
                <ThemedText style={[s.milestoneStatus, { color: isComplete ? '#22C55E' : colors.textTertiary }]}>
                  {ms.status}
                </ThemedText>
              </View>
            );
          })}
        </View>

        {/* ── SECTION 6 — Authority & Actions ─────────────────────────── */}
        {!isReadOnly && (
          <>
            <View style={[s.divider, { backgroundColor: colors.border }]} />
            <View style={s.section}>
              <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>AUTHORITY & ACTIONS</ThemedText>

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
                    onPress={() => handleAction('Advance Stage')}
                  >
                    <IconSymbol name="arrow.right" size={13} color={colors.textSecondary} />
                    <ThemedText style={[s.actionBtnText, { color: colors.textSecondary }]}>Advance Stage</ThemedText>
                  </Pressable>
                  <Pressable
                    style={[s.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => handleAction('Amend Terms')}
                  >
                    <IconSymbol name="pencil" size={13} color={colors.textSecondary} />
                    <ThemedText style={[s.actionBtnText, { color: colors.textSecondary }]}>Amend Terms</ThemedText>
                  </Pressable>
                  <Pressable
                    style={[s.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => handleAction('Cancel Deal')}
                  >
                    <IconSymbol name="xmark" size={13} color="#EF4444" />
                    <ThemedText style={[s.actionBtnText, { color: '#EF4444' }]}>Cancel Deal</ThemedText>
                  </Pressable>
                  {deal.status !== 'Closed' && (
                    <Pressable
                      style={[s.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                      onPress={() => handleAction('Mark Closed')}
                    >
                      <IconSymbol name="checkmark" size={13} color="#22C55E" />
                      <ThemedText style={[s.actionBtnText, { color: '#22C55E' }]}>Mark Closed</ThemedText>
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          </>
        )}

        {/* Read-only badge for closed/archive */}
        {isReadOnly && deal.lifecycle === 'closed' && (
          <>
            <View style={[s.divider, { backgroundColor: colors.border }]} />
            <View style={s.section}>
              <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>ACTIONS</ThemedText>
              <Pressable
                style={[s.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleAction('Propose Amendment')}
              >
                <IconSymbol name="pencil" size={13} color={colors.textSecondary} />
                <ThemedText style={[s.actionBtnText, { color: colors.textSecondary }]}>Propose Amendment</ThemedText>
              </Pressable>
              {confirmAction && (
                <View style={[s.confirmBlock, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 10 }]}>
                  <ThemedText style={[s.confirmText, { color: colors.text }]}>
                    Confirm: {confirmAction}?
                  </ThemedText>
                  <ThemedText style={[s.confirmSubtext, { color: colors.textTertiary }]}>
                    Propose → Validate → Confirm → Commit
                  </ThemedText>
                  <View style={s.confirmActions}>
                    <Pressable style={[s.confirmBtn, { borderColor: colors.border }]} onPress={() => setConfirmAction(null)}>
                      <ThemedText style={[s.confirmBtnText, { color: colors.textSecondary }]}>Cancel</ThemedText>
                    </Pressable>
                    <Pressable style={[s.confirmBtn, { backgroundColor: ACCENT }]} onPress={handleConfirm}>
                      <ThemedText style={s.confirmBtnCommit}>Commit</ThemedText>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          </>
        )}

        {isReadOnly && deal.lifecycle === 'archive' && (
          <>
            <View style={[s.divider, { backgroundColor: colors.border }]} />
            <View style={s.section}>
              <View style={[s.readOnlyBadge, { backgroundColor: '#EF4444' + '12' }]}>
                <ThemedText style={[s.readOnlyText, { color: '#EF4444' }]}>
                  Read-Only — Deal {deal.status === 'Cancelled' ? 'Cancelled' : 'Archived'}
                </ThemedText>
              </View>
            </View>
          </>
        )}

        <View style={{ height: 20 }} />
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// TERMS RENDERER (type-dependent)
// =============================================================================

function renderTerms(terms: Deal['terms'], colors: typeof Colors.light) {
  const rows: { label: string; value: string }[] = [];

  switch (terms.kind) {
    case 'EQUITY':
      rows.push(
        { label: 'Valuation', value: terms.data.valuation },
        { label: 'Equity %', value: terms.data.equityPercent },
        { label: 'Board Rights', value: terms.data.boardRights ? 'Yes' : 'No' },
        { label: 'Liquidation Preference', value: terms.data.liquidationPreference },
      );
      break;
    case 'DEBT':
      rows.push(
        { label: 'Principal', value: terms.data.principal },
        { label: 'Interest Rate', value: terms.data.interestRate },
        { label: 'Maturity Date', value: terms.data.maturityDate },
      );
      break;
    case 'ACQUISITION':
      rows.push(
        { label: 'Purchase Price', value: terms.data.purchasePrice },
        { label: 'Purchase Type', value: terms.data.purchaseType },
        { label: 'Closing Conditions', value: terms.data.closingConditions },
      );
      break;
    case 'PARTNERSHIP':
      rows.push({ label: 'Term Length', value: terms.data.termLength });
      if (terms.data.revenueShare) rows.push({ label: 'Revenue Share', value: terms.data.revenueShare });
      break;
    case 'GRANT':
      rows.push(
        { label: 'Grant Amount', value: terms.data.grantAmount },
        { label: 'Granting Body', value: terms.data.grantingBody },
        { label: 'Reporting', value: terms.data.reportingRequirements },
      );
      break;
    case 'SPONSORSHIP':
      rows.push(
        { label: 'Sponsorship Value', value: terms.data.sponsorshipValue },
        { label: 'Term Length', value: terms.data.termLength },
        { label: 'Deliverables', value: terms.data.deliverables },
      );
      break;
  }

  return (
    <View style={s.termsBlock}>
      {rows.map((r, i) => (
        <View key={i} style={s.termsRow}>
          <ThemedText style={[s.termsLabel, { color: colors.textTertiary }]}>{r.label}</ThemedText>
          <ThemedText style={[s.termsValue, { color: colors.text }]}>{r.value}</ThemedText>
        </View>
      ))}
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  content: { padding: Spacing.md, paddingBottom: 40 },

  section: { paddingVertical: 8 },
  sectionLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.6, marginBottom: 10 },
  divider: { height: StyleSheet.hairlineWidth },

  // Section 1: Header
  title: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3, marginBottom: 8 },
  pillRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  typePill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: BorderRadius.full },
  typePillText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  stagePill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: BorderRadius.full },
  stagePillText: { fontSize: 10, fontWeight: '700' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 3, borderRadius: BorderRadius.full },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusPillText: { fontSize: 10, fontWeight: '700' },
  metaBlock: { gap: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 2 },
  metaLabel: { fontSize: 12 },
  metaValue: { fontSize: 12, fontWeight: '600' },

  // Section 2: Terms
  termsBlock: { gap: 6 },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingVertical: 4 },
  termsLabel: { fontSize: 12, flex: 1 },
  termsValue: { fontSize: 12, fontWeight: '600', flex: 1, textAlign: 'right' },

  // Section 3: Capital
  capitalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  capitalCell: { flex: 1, minWidth: '45%', padding: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  capitalAmount: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  capitalLabel: { fontSize: 10 },
  financeLink: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 8, borderWidth: 1 },
  financeLinkText: { flex: 1, fontSize: 12 },

  // Section 4: Documents
  docsNote: { fontSize: 11, marginBottom: 8 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  docType: { fontSize: 9, fontWeight: '600', letterSpacing: 0.3 },
  docLabel: { fontSize: 13, fontWeight: '600' },
  docVaultId: { fontSize: 10 },

  // Section 5: Milestones
  milestoneRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  milestoneIcon: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  milestoneDot: { width: 6, height: 6, borderRadius: 3 },
  milestoneContent: { flex: 1 },
  milestoneLabel: { fontSize: 13, fontWeight: '600' },
  milestoneDate: { fontSize: 11, marginTop: 1 },
  milestoneStatus: { fontSize: 10, fontWeight: '700' },

  // Section 6: Actions
  actionRow: { gap: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1 },
  actionBtnText: { fontSize: 13, fontWeight: '600' },

  // Confirm Block
  confirmBlock: { borderRadius: 12, borderWidth: 1, padding: 16 },
  confirmText: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  confirmSubtext: { fontSize: 11, marginBottom: 14 },
  confirmActions: { flexDirection: 'row', gap: 10 },
  confirmBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
  confirmBtnText: { fontSize: 13, fontWeight: '600' },
  confirmBtnCommit: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // Read-only
  readOnlyBadge: { padding: 14, borderRadius: 10, alignItems: 'center' },
  readOnlyText: { fontSize: 12, fontWeight: '700' },
});
