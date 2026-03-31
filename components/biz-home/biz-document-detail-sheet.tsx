/**
 * Biz Document Detail Sheet — Structured View of a Single Enterprise Document
 *
 * 5 Sections: Header, Document Viewer, Version History, Linked Objects, Access & Authority
 * Institutional memory layer. Immutable version history.
 *
 * Rendering Context: Founder / CEO (B1)
 * All edits require: Propose → Validate → Confirm → Commit
 * No overwriting. No version deletion. No silent mutation.
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, MODE_ACCENT } from '@/constants/theme';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import {
  STATUS_COLORS,
  FILE_TYPE_LABELS,
  type VaultDoc,
  type VaultLinkedObject,
} from '@/data/mock-vault';

const ACCENT = MODE_ACCENT.business;

// =============================================================================
// LINKED OBJECT ICONS
// =============================================================================

const LINKED_OBJ_ICONS: Record<string, string> = {
  Deal: 'briefcase.fill',
  Obligation: 'exclamationmark.shield.fill',
  'Compliance Filing': 'doc.text.fill',
  Program: 'building.2.fill',
  Entity: 'person.crop.rectangle.fill',
};

// =============================================================================
// MAIN EXPORT
// =============================================================================

interface Props {
  document: VaultDoc | null;
  visible: boolean;
  onClose: () => void;
  colors: typeof Colors.light;
}

export function BizDocumentDetailSheet({ document: doc, visible, onClose, colors }: Props) {
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

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
    setSelectedVersion(null);
    onClose();
  }, [onClose]);

  if (!doc) return null;

  const statusColor = STATUS_COLORS[doc.status];
  const hasLinkedObjects = doc.linkedObjects.length > 0;

  return (
    <BottomSheet visible={visible} onClose={handleCloseSheet}>
      <View style={s.content}>
        {/* ── SECTION 1 — Header ──────────────────────────────────────── */}
        <View style={s.section}>
          <ThemedText style={[s.title, { color: colors.text }]}>{doc.title}</ThemedText>

          <View style={s.pillRow}>
            <View style={[s.categoryPill, { backgroundColor: ACCENT + '15' }]}>
              <ThemedText style={[s.categoryPillText, { color: ACCENT }]}>{doc.category}</ThemedText>
            </View>
            <View style={[s.statusPill, { backgroundColor: statusColor + '15' }]}>
              <View style={[s.statusDot, { backgroundColor: statusColor }]} />
              <ThemedText style={[s.statusPillText, { color: statusColor }]}>{doc.status}</ThemedText>
            </View>
            {doc.locked && (
              <View style={[s.lockPill, { backgroundColor: '#B85C5C' + '15' }]}>
                <IconSymbol name="lock.fill" size={10} color="#B85C5C" />
                <ThemedText style={[s.lockPillText, { color: '#B85C5C' }]}>Locked</ThemedText>
              </View>
            )}
          </View>

          <View style={s.metaBlock}>
            <View style={s.metaRow}>
              <ThemedText style={[s.metaLabel, { color: colors.textTertiary }]}>Version</ThemedText>
              <ThemedText style={[s.metaValue, { color: colors.text }]}>v{doc.currentVersion}</ThemedText>
            </View>
            <View style={s.metaRow}>
              <ThemedText style={[s.metaLabel, { color: colors.textTertiary }]}>Last Modified</ThemedText>
              <ThemedText style={[s.metaValue, { color: colors.text }]}>{doc.lastModified}</ThemedText>
            </View>
            <View style={s.metaRow}>
              <ThemedText style={[s.metaLabel, { color: colors.textTertiary }]}>Created</ThemedText>
              <ThemedText style={[s.metaValue, { color: colors.text }]}>{doc.createdDate}</ThemedText>
            </View>
            <View style={s.metaRow}>
              <ThemedText style={[s.metaLabel, { color: colors.textTertiary }]}>File Type</ThemedText>
              <ThemedText style={[s.metaValue, { color: colors.text }]}>{FILE_TYPE_LABELS[doc.fileType]}</ThemedText>
            </View>
          </View>

          {/* Header controls */}
          {!doc.locked && (
            <View style={s.headerControls}>
              <Pressable
                style={[s.headerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleAction('Edit')}
              >
                <IconSymbol name="pencil" size={12} color={colors.textSecondary} />
                <ThemedText style={[s.headerBtnText, { color: colors.textSecondary }]}>Edit</ThemedText>
              </Pressable>
              <Pressable
                style={[s.headerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleAction('Upload New Version')}
              >
                <IconSymbol name="arrow.up.doc" size={12} color={colors.textSecondary} />
                <ThemedText style={[s.headerBtnText, { color: colors.textSecondary }]}>Upload Version</ThemedText>
              </Pressable>
              <Pressable
                style={[s.headerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleAction('Archive')}
              >
                <IconSymbol name="archivebox" size={12} color={colors.textSecondary} />
                <ThemedText style={[s.headerBtnText, { color: colors.textSecondary }]}>Archive</ThemedText>
              </Pressable>
              <Pressable
                style={[s.headerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleAction('Lock')}
              >
                <IconSymbol name="lock" size={12} color={colors.textSecondary} />
                <ThemedText style={[s.headerBtnText, { color: colors.textSecondary }]}>Lock</ThemedText>
              </Pressable>
            </View>
          )}
          {doc.locked && (
            <View style={s.headerControls}>
              <Pressable
                style={[s.headerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleAction('Unlock')}
              >
                <IconSymbol name="lock.open" size={12} color={colors.textSecondary} />
                <ThemedText style={[s.headerBtnText, { color: colors.textSecondary }]}>Unlock</ThemedText>
              </Pressable>
            </View>
          )}
        </View>

        <View style={[s.divider, { backgroundColor: colors.border }]} />

        {/* ── SECTION 2 — Document Viewer (Placeholder) ───────────────── */}
        <View style={s.section}>
          <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>DOCUMENT VIEWER</ThemedText>
          <View style={[s.viewerPlaceholder, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <IconSymbol name="doc.text.fill" size={28} color={colors.textTertiary} />
            <ThemedText style={[s.viewerText, { color: colors.textTertiary }]}>
              {FILE_TYPE_LABELS[doc.fileType]} Document
            </ThemedText>
            <ThemedText style={[s.viewerSubtext, { color: colors.textTertiary }]}>
              Tap to open in viewer
            </ThemedText>
          </View>
        </View>

        <View style={[s.divider, { backgroundColor: colors.border }]} />

        {/* ── SECTION 3 — Version History ──────────────────────────────── */}
        <View style={s.section}>
          <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>VERSION HISTORY</ThemedText>
          <ThemedText style={[s.versionCount, { color: colors.text }]}>
            {doc.versions.length} version{doc.versions.length !== 1 ? 's' : ''}
          </ThemedText>
          {[...doc.versions].reverse().map((v, i) => {
            const isLatest = i === 0;
            const isSelected = selectedVersion === v.version;
            return (
              <Pressable
                key={v.version}
                style={[
                  s.versionRow,
                  { backgroundColor: colors.card, borderColor: isSelected ? ACCENT : colors.border },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedVersion(isSelected ? null : v.version);
                }}
              >
                <View style={s.versionLeft}>
                  <View style={s.versionHeader}>
                    <ThemedText style={[s.versionNumber, { color: colors.text }]}>
                      v{v.version}
                    </ThemedText>
                    {isLatest && (
                      <View style={[s.latestBadge, { backgroundColor: '#5A8A6E' + '15' }]}>
                        <ThemedText style={[s.latestBadgeText, { color: '#5A8A6E' }]}>CURRENT</ThemedText>
                      </View>
                    )}
                  </View>
                  <ThemedText style={[s.versionMeta, { color: colors.textTertiary }]}>
                    {v.createdBy} · {v.date}
                  </ThemedText>
                  <ThemedText style={[s.versionSummary, { color: colors.textSecondary }]}>
                    {v.changeSummary}
                  </ThemedText>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* ── SECTION 4 — Linked Objects ───────────────────────────────── */}
        {hasLinkedObjects && (
          <>
            <View style={[s.divider, { backgroundColor: colors.border }]} />
            <View style={s.section}>
              <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>LINKED OBJECTS</ThemedText>
              {doc.linkedObjects.map((obj, i) => {
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

        {/* ── SECTION 5 — Access & Authority ───────────────────────────── */}
        <View style={s.section}>
          <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>ACCESS & AUTHORITY</ThemedText>
          <View style={s.accessBlock}>
            <View style={s.accessRow}>
              <ThemedText style={[s.accessLabel, { color: colors.textTertiary }]}>Access Level</ThemedText>
              <ThemedText style={[s.accessValue, { color: colors.text }]}>{doc.accessLevel}</ThemedText>
            </View>
            {doc.lastApprovedBy && (
              <View style={s.accessRow}>
                <ThemedText style={[s.accessLabel, { color: colors.textTertiary }]}>Last Approved By</ThemedText>
                <ThemedText style={[s.accessValue, { color: colors.text }]}>{doc.lastApprovedBy}</ThemedText>
              </View>
            )}
            {doc.lastApprovedDate && (
              <View style={s.accessRow}>
                <ThemedText style={[s.accessLabel, { color: colors.textTertiary }]}>Last Approved Date</ThemedText>
                <ThemedText style={[s.accessValue, { color: colors.text }]}>{doc.lastApprovedDate}</ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* ── Confirmation Block ───────────────────────────────────────── */}
        {confirmAction && (
          <>
            <View style={[s.divider, { backgroundColor: colors.border }]} />
            <View style={s.section}>
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
            </View>
          </>
        )}

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

  // Section
  section: { paddingVertical: 8 },
  sectionLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.6, marginBottom: 10 },
  divider: { height: StyleSheet.hairlineWidth },

  // Section 1: Header
  title: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3, marginBottom: 8 },
  pillRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  categoryPill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: BorderRadius.full },
  categoryPillText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 3, borderRadius: BorderRadius.full },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusPillText: { fontSize: 10, fontWeight: '700' },
  lockPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 3, borderRadius: BorderRadius.full },
  lockPillText: { fontSize: 10, fontWeight: '700' },
  metaBlock: { gap: 6, marginBottom: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 2 },
  metaLabel: { fontSize: 12 },
  metaValue: { fontSize: 12, fontWeight: '600' },
  headerControls: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  headerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1 },
  headerBtnText: { fontSize: 12, fontWeight: '600' },

  // Section 2: Viewer
  viewerPlaceholder: { alignItems: 'center', justifyContent: 'center', paddingVertical: 30, borderRadius: 12, borderWidth: 1, gap: 6 },
  viewerText: { fontSize: 14, fontWeight: '700' },
  viewerSubtext: { fontSize: 11 },

  // Section 3: Version History
  versionCount: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  versionRow: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  versionLeft: { flex: 1 },
  versionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  versionNumber: { fontSize: 14, fontWeight: '800' },
  latestBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  latestBadgeText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.4 },
  versionMeta: { fontSize: 11, marginBottom: 4 },
  versionSummary: { fontSize: 12, lineHeight: 17 },

  // Section 4: Linked Objects
  linkedRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  linkedType: { fontSize: 9, fontWeight: '600', letterSpacing: 0.3 },
  linkedLabel: { fontSize: 13, fontWeight: '600' },
  linkedId: { fontSize: 10 },

  // Section 5: Access & Authority
  accessBlock: { gap: 6 },
  accessRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  accessLabel: { fontSize: 12 },
  accessValue: { fontSize: 12, fontWeight: '600' },

  // Confirm Block
  confirmBlock: { borderRadius: 12, borderWidth: 1, padding: 16 },
  confirmText: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  confirmSubtext: { fontSize: 11, marginBottom: 14 },
  confirmActions: { flexDirection: 'row', gap: 10 },
  confirmBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
  confirmBtnText: { fontSize: 13, fontWeight: '600' },
  confirmBtnCommit: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
