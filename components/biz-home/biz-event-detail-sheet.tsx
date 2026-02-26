/**
 * Biz Event Detail Sheet — Structured View of a Single Enterprise Event
 *
 * 5 Sections: Header, Context, Participants, Linked Objects, Action Controls
 * Time-based coordination object. Not an obligation, transaction, or task board.
 *
 * Rendering Context: Founder / CEO (B1)
 * All edits require: Propose → Validate → Confirm → Commit
 * Event Detail must never mutate Finance or Ledger.
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, MODE_ACCENT } from '@/constants/theme';
import { BottomSheet } from '@/components/ui/bottom-sheet';

const ACCENT = MODE_ACCENT.business;

// =============================================================================
// TYPES
// =============================================================================

export type EventType = 'BOARD' | 'INVESTOR' | 'CAPITAL' | 'COMPLIANCE' | 'CONTRACT' | 'PAYROLL' | 'OPERATIONS';
export type EventStatus = 'Scheduled' | 'Pending' | 'Completed' | 'Overdue';

export interface LinkedObject {
  type: string; // Deal, Obligation, Compliance Filing, Contract, Program
  id: string;
  label: string;
}

export interface Participant {
  role: string;
  external?: boolean;
  counterparty?: string;
}

export interface EventDetailData {
  id: string;
  title: string;
  type: EventType;
  status: EventStatus;
  date: string;
  time: string;
  location?: string;
  domain: string;
  linkedEntity?: string;
  linkedObjects: LinkedObject[];
  participants: Participant[];
}

// =============================================================================
// CONSTANTS
// =============================================================================

const TYPE_COLORS: Record<EventType, string> = {
  BOARD: '#6366F1',
  INVESTOR: '#059669',
  CAPITAL: '#2563EB',
  COMPLIANCE: '#D97706',
  CONTRACT: '#78716C',
  PAYROLL: '#9CA3AF',
  OPERATIONS: '#6B7280',
};

const STATUS_COLORS: Record<EventStatus, string> = {
  Scheduled: '#22C55E',
  Pending: '#F59E0B',
  Completed: '#A1A1AA',
  Overdue: '#EF4444',
};

const LINKED_OBJ_ICONS: Record<string, string> = {
  Deal: 'briefcase.fill',
  Obligation: 'exclamationmark.shield.fill',
  'Compliance Filing': 'doc.text.fill',
  Contract: 'signature',
  Program: 'building.2.fill',
};

// =============================================================================
// MAIN EXPORT
// =============================================================================

interface Props {
  event: EventDetailData | null;
  visible: boolean;
  onClose: () => void;
  colors: typeof Colors.light;
}

export function BizEventDetailSheet({ event, visible, onClose, colors }: Props) {
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

  if (!event) return null;

  const typeColor = TYPE_COLORS[event.type];
  const statusColor = STATUS_COLORS[event.status];
  const hasLinkedObject = event.linkedObjects.length > 0;
  const externalParticipants = event.participants.filter((p) => p.external);
  const internalParticipants = event.participants.filter((p) => !p.external);

  return (
    <BottomSheet visible={visible} onClose={handleCloseSheet}>
      <View style={s.content}>
        {/* ── SECTION 1 — Event Header ───────────────────────────────── */}
        <View style={s.section}>
          <View style={s.headerRow}>
            <ThemedText style={[s.title, { color: colors.text }]}>{event.title}</ThemedText>
          </View>
          <View style={s.pillRow}>
            <View style={[s.typePill, { backgroundColor: typeColor + '15' }]}>
              <ThemedText style={[s.typePillText, { color: typeColor }]}>{event.type}</ThemedText>
            </View>
            <View style={[s.statusPill, { backgroundColor: statusColor + '15' }]}>
              <View style={[s.statusDot, { backgroundColor: statusColor }]} />
              <ThemedText style={[s.statusPillText, { color: statusColor }]}>{event.status}</ThemedText>
            </View>
          </View>

          <View style={s.dateBlock}>
            <View style={s.dateRow}>
              <IconSymbol name="calendar" size={13} color={colors.textTertiary} />
              <ThemedText style={[s.dateText, { color: colors.textSecondary }]}>{event.date}</ThemedText>
            </View>
            <View style={s.dateRow}>
              <IconSymbol name="clock" size={13} color={colors.textTertiary} />
              <ThemedText style={[s.dateText, { color: colors.textSecondary }]}>{event.time}</ThemedText>
            </View>
            {event.location && (
              <View style={s.dateRow}>
                <IconSymbol name="mappin" size={13} color={colors.textTertiary} />
                <ThemedText style={[s.dateText, { color: colors.textSecondary }]}>{event.location}</ThemedText>
              </View>
            )}
          </View>
        </View>

        <View style={[s.divider, { backgroundColor: colors.border }]} />

        {/* ── SECTION 2 — Event Context ──────────────────────────────── */}
        <View style={s.section}>
          <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>CONTEXT</ThemedText>
          <View style={s.contextRow}>
            <ThemedText style={[s.contextLabel, { color: colors.textTertiary }]}>Domain Scope</ThemedText>
            <ThemedText style={[s.contextValue, { color: colors.text }]}>{event.domain}</ThemedText>
          </View>
          {event.linkedEntity && (
            <View style={s.contextRow}>
              <ThemedText style={[s.contextLabel, { color: colors.textTertiary }]}>Linked Entity</ThemedText>
              <ThemedText style={[s.contextValue, { color: colors.text }]}>{event.linkedEntity}</ThemedText>
            </View>
          )}
        </View>

        <View style={[s.divider, { backgroundColor: colors.border }]} />

        {/* ── SECTION 3 — Participants ───────────────────────────────── */}
        <View style={s.section}>
          <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>PARTICIPANTS</ThemedText>
          <View style={s.participantCount}>
            <ThemedText style={[s.participantCountText, { color: colors.text }]}>
              {event.participants.length}
            </ThemedText>
            <ThemedText style={[s.participantCountLabel, { color: colors.textTertiary }]}> total</ThemedText>
          </View>
          {internalParticipants.map((p, i) => (
            <View key={`int-${i}`} style={s.participantRow}>
              <View style={[s.roleDot, { backgroundColor: ACCENT }]} />
              <ThemedText style={[s.participantRole, { color: colors.textSecondary }]}>{p.role}</ThemedText>
            </View>
          ))}
          {externalParticipants.length > 0 && (
            <>
              <ThemedText style={[s.externalLabel, { color: colors.textTertiary }]}>External</ThemedText>
              {externalParticipants.map((p, i) => (
                <View key={`ext-${i}`} style={s.participantRow}>
                  <View style={[s.roleDot, { backgroundColor: '#78716C' }]} />
                  <ThemedText style={[s.participantRole, { color: colors.textSecondary }]}>
                    {p.role}{p.counterparty ? ` — ${p.counterparty}` : ''}
                  </ThemedText>
                </View>
              ))}
            </>
          )}
        </View>

        {/* ── SECTION 4 — Linked Objects ─────────────────────────────── */}
        {hasLinkedObject && (
          <>
            <View style={[s.divider, { backgroundColor: colors.border }]} />
            <View style={s.section}>
              <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>LINKED OBJECTS</ThemedText>
              {event.linkedObjects.map((obj, i) => {
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

        <View style={[s.divider, { backgroundColor: colors.border }]} />

        {/* ── SECTION 5 — Action Controls ────────────────────────────── */}
        <View style={s.section}>
          <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>ACTIONS</ThemedText>

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
                onPress={() => handleAction('Propose Edit')}
              >
                <IconSymbol name="pencil" size={13} color={colors.textSecondary} />
                <ThemedText style={[s.actionBtnText, { color: colors.textSecondary }]}>Propose Edit</ThemedText>
              </Pressable>
              <Pressable
                style={[s.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleAction('Cancel Event')}
              >
                <IconSymbol name="xmark" size={13} color="#EF4444" />
                <ThemedText style={[s.actionBtnText, { color: '#EF4444' }]}>Cancel Event</ThemedText>
              </Pressable>
              {event.status !== 'Completed' && (
                <Pressable
                  style={[s.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => handleAction('Mark Complete')}
                >
                  <IconSymbol name="checkmark" size={13} color="#22C55E" />
                  <ThemedText style={[s.actionBtnText, { color: '#22C55E' }]}>Mark Complete</ThemedText>
                </Pressable>
              )}
              {hasLinkedObject && (
                <Pressable
                  style={[s.actionBtn, { backgroundColor: ACCENT + '12', borderColor: ACCENT + '30' }]}
                  onPress={() => Haptics.selectionAsync()}
                >
                  <IconSymbol name="arrow.up.right" size={13} color={ACCENT} />
                  <ThemedText style={[s.actionBtnText, { color: ACCENT }]}>Open Linked Object</ThemedText>
                </Pressable>
              )}
            </View>
          )}
        </View>

        <View style={{ height: 20 }} />
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  content: { padding: Spacing.md, paddingBottom: 40 },

  // -- Section --
  section: { paddingVertical: 8 },
  sectionLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.6, marginBottom: 10 },
  divider: { height: StyleSheet.hairlineWidth },

  // -- Section 1: Header --
  headerRow: { marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  pillRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  typePill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: BorderRadius.full },
  typePillText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 3, borderRadius: BorderRadius.full },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusPillText: { fontSize: 10, fontWeight: '700' },
  dateBlock: { gap: 6 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateText: { fontSize: 13 },

  // -- Section 2: Context --
  contextRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  contextLabel: { fontSize: 12 },
  contextValue: { fontSize: 12, fontWeight: '600' },

  // -- Section 3: Participants --
  participantCount: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  participantCountText: { fontSize: 18, fontWeight: '800' },
  participantCountLabel: { fontSize: 12 },
  participantRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  roleDot: { width: 5, height: 5, borderRadius: 2.5 },
  participantRole: { fontSize: 13 },
  externalLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.6, color: '#78716C', marginTop: 8, marginBottom: 4 },

  // -- Section 4: Linked Objects --
  linkedRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  linkedType: { fontSize: 9, fontWeight: '600', letterSpacing: 0.3 },
  linkedLabel: { fontSize: 13, fontWeight: '600' },
  linkedId: { fontSize: 10 },

  // -- Section 5: Actions --
  actionRow: { gap: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1 },
  actionBtnText: { fontSize: 13, fontWeight: '600' },

  // -- Confirm Block --
  confirmBlock: { borderRadius: 12, borderWidth: 1, padding: 16 },
  confirmText: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  confirmSubtext: { fontSize: 11, marginBottom: 14 },
  confirmActions: { flexDirection: 'row', gap: 10 },
  confirmBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
  confirmBtnText: { fontSize: 13, fontWeight: '600' },
  confirmBtnCommit: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
