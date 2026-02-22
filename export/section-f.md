# Section F — Commerce Sheets & Bottom Sheet System

## Bottom Sheet Wrapper (`components/ui/bottom-sheet.tsx`)

```typescript
/**
 * Universal Bottom Sheet — @gorhom/bottom-sheet wrapper
 *
 * iOS Detented Bottom Sheet: two snap points (50% and 100%).
 * All sheets open at 50% first. User drags up to 100% or down to dismiss.
 * Preserves the visible/onClose prop API for all consumers.
 *
 * Non-modal sheets are only mounted while visible (+ close animation),
 * so idle sheets don't steal gestures from underlying views.
 */

import React, { useRef, useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import GorhomBottomSheet, {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
  BottomSheetFooter,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps, BottomSheetFooterProps } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  footer?: React.ReactNode;
  /** @deprecated Ignored — all sheets use 50%+100% detents per spec. */
  snapPercent?: number;
  /** @deprecated Ignored — all sheets open at 50% first. */
  mode?: 'standard' | 'full';
  /** Use portal-based BottomSheetModal for deeply nested components */
  useModal?: boolean;
}

const SNAP_POINTS = ['50%', '100%'];

export function BottomSheet({
  visible,
  onClose,
  children,
  title,
  footer,
  useModal = false,
}: BottomSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const sheetRef = useRef<GorhomBottomSheet>(null);
  const modalRef = useRef<BottomSheetModal>(null);

  // mounted = sheet DOM is in the tree (for non-modal)
  const [mounted, setMounted] = useState(false);
  // opening = we've asked to open but haven't reached index >= 0 yet
  // This prevents the initial onChange(-1) from immediately closing the sheet
  const openingRef = useRef(false);
  // closing = user-initiated close in progress, ignore further onChange
  const closingRef = useRef(false);
  // hasOpened = sheet reached index >= 0 at least once since mount
  const hasOpenedRef = useRef(false);

  // ── Open flow ──
  useEffect(() => {
    if (visible) {
      closingRef.current = false;
      hasOpenedRef.current = false;
      if (useModal) {
        openingRef.current = true;
        // Modal is always mounted, just present it
        requestAnimationFrame(() => {
          modalRef.current?.present();
        });
      } else {
        // Mount the sheet first, then snap on next effect
        openingRef.current = true;
        setMounted(true);
      }
    }
  }, [visible, useModal]);

  // ── After mount, snap to first detent ──
  useEffect(() => {
    if (mounted && visible && !useModal && openingRef.current) {
      // Use setTimeout to ensure the GorhomBottomSheet ref is ready
      const timer = setTimeout(() => {
        sheetRef.current?.snapToIndex(0);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [mounted, visible, useModal]);

  // ── Close flow (parent sets visible=false) ──
  useEffect(() => {
    if (!visible && mounted && !useModal) {
      closingRef.current = true;
      sheetRef.current?.close();
    }
    if (!visible && useModal) {
      closingRef.current = true;
      modalRef.current?.dismiss();
    }
  }, [visible, mounted, useModal]);

  // Sync dismiss back to parent state
  const handleSheetChange = useCallback(
    (index: number) => {
      if (index >= 0) {
        openingRef.current = false;
        hasOpenedRef.current = true;
      }
      if (index === -1) {
        if (openingRef.current) return;
        if (!hasOpenedRef.current && !closingRef.current) return;

        setMounted(false);
        openingRef.current = false;
        hasOpenedRef.current = false;
        closingRef.current = false;
        if (visible) {
          onClose();
        }
      }
    },
    [onClose, visible],
  );

  const handleModalDismiss = useCallback(() => {
    openingRef.current = false;
    if (visible) {
      onClose();
    }
  }, [onClose, visible]);

  const handleClose = useCallback(() => {
    closingRef.current = true;
    if (useModal) {
      modalRef.current?.dismiss();
    } else {
      sheetRef.current?.close();
    }
  }, [useModal]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
        opacity={0.4}
      />
    ),
    [],
  );

  const renderFooter = useMemo(() => {
    if (!footer) return undefined;
    return (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props} bottomInset={insets.bottom}>
        <View style={[styles.footer, { borderTopColor: colors.divider }]}>
          {footer}
        </View>
      </BottomSheetFooter>
    );
  }, [footer, colors.divider, insets.bottom]);

  const sheetContent = (
    <>
      {title && (
        <View style={[styles.header, { borderBottomColor: colors.divider }]}>
          <View style={styles.headerSpacer} />
          <ThemedText style={styles.headerTitle}>{title}</ThemedText>
          <Pressable style={styles.headerClose} onPress={handleClose}>
            <IconSymbol name="xmark" size={16} color={colors.textSecondary} />
          </Pressable>
        </View>
      )}
      <BottomSheetScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </BottomSheetScrollView>
    </>
  );

  const sharedProps = {
    snapPoints: SNAP_POINTS,
    enablePanDownToClose: true,
    backdropComponent: renderBackdrop,
    footerComponent: renderFooter,
    handleIndicatorStyle: { backgroundColor: colors.border, width: 36 },
    backgroundStyle: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    style: styles.sheet,
  };

  if (useModal) {
    return (
      <BottomSheetModal
        ref={modalRef}
        {...sharedProps}
        onDismiss={handleModalDismiss}
      >
        {sheetContent}
      </BottomSheetModal>
    );
  }

  if (!mounted) return null;

  return (
    <GorhomBottomSheet
      ref={sheetRef}
      index={-1}
      {...sharedProps}
      onChange={handleSheetChange}
    >
      {sheetContent}
    </GorhomBottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerSpacer: { width: 32 },
  headerTitle: { fontSize: 16, fontWeight: '600', flex: 1, textAlign: 'center' },
  headerClose: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: Spacing.md,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
```

---

## Business Deck Sheet (`components/commerce/biz-deck-sheet.tsx`)

```typescript
/**
 * Business Deck Bottom Sheet
 *
 * Primary pitch deck card + 3 supporting docs from DECK_DOCUMENTS.
 * Share/Download buttons (placeholders).
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DECK_DOCUMENTS, type DeckDocument } from '@/data/mock-business-home';
import { Spacing, BorderRadius } from '@/constants/theme';

const ACCENT = '#8B5CF6';

const TYPE_ICONS: Record<DeckDocument['type'], string> = {
  deck: 'doc.richtext.fill',
  pdf: 'doc.text.fill',
  video: 'play.rectangle.fill',
  doc: 'doc.fill',
};

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

export function BizDeckSheet({ visible, onClose, colors }: Props) {
  const primary = DECK_DOCUMENTS.find((d) => d.isPrimary);
  const supporting = DECK_DOCUMENTS.filter((d) => !d.isPrimary);

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Deck" useModal>
      <View style={styles.container}>
        {primary && (
          <View style={[styles.primaryCard, { backgroundColor: ACCENT + '15', borderColor: ACCENT + '33' }]}>
            <View style={styles.primaryHeader}>
              <IconSymbol name={TYPE_ICONS[primary.type] as any} size={28} color={ACCENT} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.primaryTitle, { color: colors.text }]}>{primary.title}</Text>
                <Text style={[styles.primaryMeta, { color: colors.textSecondary }]}>
                  {primary.type.toUpperCase()} · {primary.size}
                </Text>
              </View>
            </View>
            <View style={styles.primaryActions}>
              <Pressable style={[styles.actionButton, { backgroundColor: ACCENT }]}>
                <IconSymbol name="eye.fill" size={14} color="#fff" />
                <Text style={styles.actionButtonText}>View</Text>
              </Pressable>
              <Pressable style={[styles.actionButton, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}>
                <IconSymbol name="square.and.arrow.up" size={14} color={colors.text} />
                <Text style={[styles.actionButtonTextAlt, { color: colors.text }]}>Share</Text>
              </Pressable>
              <Pressable style={[styles.actionButton, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}>
                <IconSymbol name="arrow.down.circle" size={14} color={colors.text} />
                <Text style={[styles.actionButtonTextAlt, { color: colors.text }]}>Download</Text>
              </Pressable>
            </View>
          </View>
        )}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>SUPPORTING DOCUMENTS</Text>
        {supporting.map((doc) => (
          <Pressable key={doc.id} style={[styles.docRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <IconSymbol name={TYPE_ICONS[doc.type] as any} size={20} color={ACCENT} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.docTitle, { color: colors.text }]}>{doc.title}</Text>
              <Text style={[styles.docMeta, { color: colors.textSecondary }]}>{doc.type.toUpperCase()} · {doc.size}</Text>
            </View>
            <IconSymbol name="chevron.right" size={14} color={colors.textSecondary} />
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 },
  primaryCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, gap: 14 },
  primaryHeader: { flexDirection: 'row', alignItems: 'center' },
  primaryTitle: { fontSize: 16, fontWeight: '700' },
  primaryMeta: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  primaryActions: { flexDirection: 'row', gap: 8 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: BorderRadius.md },
  actionButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  actionButtonTextAlt: { fontSize: 13, fontWeight: '600' },
  docRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth },
  docTitle: { fontSize: 14, fontWeight: '600' },
  docMeta: { fontSize: 11, fontWeight: '500', marginTop: 2 },
});
```

---

## Business Data Room Sheet (`components/commerce/biz-data-room-sheet.tsx`)

```typescript
/**
 * Business Data Room Bottom Sheet
 *
 * 2-stage: folders → documents.
 * RBAC-filtered via canAccessDoc() from business-rbac.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  VAULT_FOLDERS,
  VAULT_DOCUMENTS,
  type VaultFolder,
  type VaultDocument,
} from '@/data/mock-business-home';
import { canAccessDoc, type BusinessRoleLens, type DocAccessTag } from '@/utils/business-rbac';
import { Spacing, BorderRadius } from '@/constants/theme';

type Stage = 'folders' | 'documents';

const ACCENT = '#3B82F6';

const ACCESS_TO_TAG: Record<VaultFolder['accessLevel'], DocAccessTag> = {
  public: 'public',
  investor: 'retail',
  board: 'board',
  founder_only: 'founder_only',
};

const DOC_ACCESS_TO_TAG: Record<VaultDocument['accessLevel'], DocAccessTag> = {
  public: 'public',
  investor: 'retail',
  board: 'board',
  founder_only: 'founder_only',
};

const TYPE_ICONS: Record<VaultDocument['type'], string> = {
  pdf: 'doc.text.fill',
  doc: 'doc.fill',
  spreadsheet: 'tablecells.fill',
  deck: 'doc.richtext.fill',
};

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
  role: BusinessRoleLens;
}

export function BizDataRoomSheet({ visible, onClose, colors, role }: Props) {
  const [stage, setStage] = useState<Stage>('folders');
  const [selectedFolder, setSelectedFolder] = useState<VaultFolder | null>(null);

  const handleClose = useCallback(() => { setStage('folders'); setSelectedFolder(null); onClose(); }, [onClose]);
  const handleBack = useCallback(() => { setStage('folders'); setSelectedFolder(null); }, []);
  const handleSelectFolder = useCallback((folder: VaultFolder) => { setSelectedFolder(folder); setStage('documents'); }, []);

  const visibleFolders = useMemo(() => VAULT_FOLDERS.filter((f) => canAccessDoc(ACCESS_TO_TAG[f.accessLevel], role)), [role]);
  const visibleDocs = useMemo(() => {
    if (!selectedFolder) return [];
    return VAULT_DOCUMENTS.filter((d) => d.folderId === selectedFolder.id && canAccessDoc(DOC_ACCESS_TO_TAG[d.accessLevel], role));
  }, [selectedFolder, role]);

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Data Room" useModal>
      {stage === 'folders' && (
        <View style={styles.container}>
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>FOLDERS</Text>
          {visibleFolders.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No folders available for your access level.</Text>
          )}
          {visibleFolders.map((folder) => (
            <Pressable key={folder.id} style={[styles.folderRow, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => handleSelectFolder(folder)}>
              <IconSymbol name="folder.fill" size={22} color={ACCENT} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.folderName, { color: colors.text }]}>{folder.name}</Text>
                <Text style={[styles.folderMeta, { color: colors.textSecondary }]}>{folder.documentCount} docs · Updated {folder.lastUpdated}</Text>
              </View>
              <View style={[styles.accessBadge, { backgroundColor: ACCENT + '22' }]}>
                <Text style={[styles.accessText, { color: ACCENT }]}>{folder.accessLevel.replace('_', ' ').toUpperCase()}</Text>
              </View>
              <IconSymbol name="chevron.right" size={14} color={colors.textSecondary} />
            </Pressable>
          ))}
        </View>
      )}
      {stage === 'documents' && selectedFolder && (
        <View style={styles.container}>
          <Pressable style={styles.backBar} onPress={handleBack}>
            <IconSymbol name="chevron.left" size={14} color={ACCENT} />
            <Text style={[styles.backText, { color: ACCENT }]}>Folders</Text>
          </Pressable>
          <Text style={[styles.folderTitle, { color: colors.text }]}>{selectedFolder.name}</Text>
          {visibleDocs.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No documents available in this folder.</Text>
          )}
          {visibleDocs.map((doc) => (
            <Pressable key={doc.id} style={[styles.docRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <IconSymbol name={TYPE_ICONS[doc.type] as any} size={20} color={ACCENT} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.docTitle, { color: colors.text }]}>{doc.name}</Text>
                <Text style={[styles.docMeta, { color: colors.textSecondary }]}>{doc.type.toUpperCase()} · {doc.size} · v{doc.version}</Text>
              </View>
              <IconSymbol name="arrow.down.circle" size={16} color={colors.textSecondary} />
            </Pressable>
          ))}
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  emptyText: { fontSize: 13, fontStyle: 'italic' },
  folderRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth, gap: 6 },
  folderName: { fontSize: 14, fontWeight: '700' },
  folderMeta: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  folderTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  accessBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  accessText: { fontSize: 9, fontWeight: '700' },
  backBar: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 },
  backText: { fontSize: 13, fontWeight: '600' },
  docRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth },
  docTitle: { fontSize: 14, fontWeight: '600' },
  docMeta: { fontSize: 11, fontWeight: '500', marginTop: 2 },
});
```

---

## Business Invest Sheet (`components/commerce/biz-invest-sheet.tsx`)

> Full 4-stage SAFE investment flow: overview, tier_select, confirm, receipt.

See `services/player-pool/` MEMORY for architecture context. Full source (359 lines):

```typescript
/**
 * Business Invest Bottom Sheet
 *
 * 4-stage: overview → tier_select → confirm → receipt.
 * SAFE investment flow with payment chain.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  CURRENT_ROUND, INVEST_TIERS, SAFE_TERMS, buildInvestChain, type InvestTier,
} from '@/data/mock-business-home';
import { Spacing, BorderRadius } from '@/constants/theme';

type Stage = 'overview' | 'tier_select' | 'confirm' | 'receipt';
const ACCENT = '#10B981';

interface Props { visible: boolean; onClose: () => void; colors: Record<string, string>; }

export function BizInvestSheet({ visible, onClose, colors }: Props) {
  const [stage, setStage] = useState<Stage>('overview');
  const [selectedTier, setSelectedTier] = useState<InvestTier | null>(null);
  const [investorName, setInvestorName] = useState('');
  const [isAccredited, setIsAccredited] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [receipt, setReceipt] = useState<ReturnType<typeof buildInvestChain> | null>(null);

  const handleClose = useCallback(() => {
    setStage('overview'); setSelectedTier(null); setInvestorName('');
    setIsAccredited(false); setTermsAccepted(false); setReceipt(null); onClose();
  }, [onClose]);

  const handleConfirm = useCallback(() => {
    if (!selectedTier) return;
    const chain = buildInvestChain(selectedTier.amount, selectedTier.label);
    setReceipt(chain); setStage('receipt');
  }, [selectedTier]);

  const canConfirm = isAccredited && termsAccepted && investorName.trim().length > 0;
  const progressPct = Math.min(100, (CURRENT_ROUND.raised / CURRENT_ROUND.target) * 100);

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Invest" useModal>
      {stage === 'overview' && (
        <View style={styles.container}>
          <View style={[styles.roundCard, { backgroundColor: ACCENT + '12', borderColor: ACCENT + '33' }]}>
            <Text style={[styles.roundName, { color: colors.text }]}>{CURRENT_ROUND.name}</Text>
            <Text style={[styles.roundInstrument, { color: ACCENT }]}>{CURRENT_ROUND.instrument}</Text>
            <View style={styles.progressRow}>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>${(CURRENT_ROUND.raised / 1_000).toFixed(0)}K raised</Text>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>${(CURRENT_ROUND.target / 1_000_000).toFixed(0)}M target</Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: ACCENT }]} />
            </View>
            <View style={styles.termsGrid}>
              <TermRow label="Valuation Cap" value={SAFE_TERMS.cap} colors={colors} />
              <TermRow label="Discount" value={SAFE_TERMS.discount} colors={colors} />
              <TermRow label="MFN" value={SAFE_TERMS.mfn ? 'Yes' : 'No'} colors={colors} />
              <TermRow label="Pro-Rata" value={SAFE_TERMS.proRata ? 'Yes' : 'No'} colors={colors} />
            </View>
          </View>
          <Pressable style={[styles.ctaButton, { backgroundColor: ACCENT }]} onPress={() => setStage('tier_select')}>
            <Text style={styles.ctaButtonText}>Select Investment Tier</Text>
          </Pressable>
        </View>
      )}

      {stage === 'tier_select' && (
        <View style={styles.container}>
          <Pressable style={styles.backBar} onPress={() => setStage('overview')}>
            <IconSymbol name="chevron.left" size={14} color={ACCENT} />
            <Text style={[styles.backText, { color: ACCENT }]}>Overview</Text>
          </Pressable>
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>SELECT TIER</Text>
          {INVEST_TIERS.map((tier) => (
            <Pressable key={tier.id} style={[styles.tierRow, { backgroundColor: colors.card, borderColor: colors.border }, selectedTier?.id === tier.id && { borderColor: ACCENT, backgroundColor: ACCENT + '12' }]} onPress={() => setSelectedTier(tier)}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tierLabel, { color: colors.text }]}>{tier.label}</Text>
                <Text style={[styles.tierDesc, { color: colors.textSecondary }]}>{tier.description}</Text>
              </View>
              {selectedTier?.id === tier.id && <IconSymbol name="checkmark.circle.fill" size={22} color={ACCENT} />}
            </Pressable>
          ))}
          <Pressable style={[styles.ctaButton, { backgroundColor: selectedTier ? ACCENT : colors.border }]} onPress={() => selectedTier && setStage('confirm')} disabled={!selectedTier}>
            <Text style={[styles.ctaButtonText, { color: selectedTier ? '#fff' : colors.textTertiary }]}>Continue</Text>
          </Pressable>
        </View>
      )}

      {stage === 'confirm' && selectedTier && (
        <View style={styles.container}>
          <Pressable style={styles.backBar} onPress={() => setStage('tier_select')}>
            <IconSymbol name="chevron.left" size={14} color={ACCENT} />
            <Text style={[styles.backText, { color: ACCENT }]}>Tiers</Text>
          </Pressable>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CONFIRM INVESTMENT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Tier</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedTier.label} — {selectedTier.description}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${selectedTier.amount.toLocaleString()}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Instrument</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{SAFE_TERMS.instrument}</Text>
            </View>
          </View>
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>INVESTOR NAME</Text>
          <TextInput style={[styles.input, { borderColor: colors.border, color: colors.text }]} placeholder="Full legal name" placeholderTextColor={colors.textTertiary} value={investorName} onChangeText={setInvestorName} />
          <Pressable style={styles.checkRow} onPress={() => setIsAccredited(!isAccredited)}>
            <View style={[styles.checkbox, { borderColor: colors.border }, isAccredited && { backgroundColor: ACCENT, borderColor: ACCENT }]}>
              {isAccredited && <IconSymbol name="checkmark" size={12} color="#fff" />}
            </View>
            <Text style={[styles.checkLabel, { color: colors.text }]}>I am an accredited investor as defined by SEC Rule 501</Text>
          </Pressable>
          <Pressable style={styles.checkRow} onPress={() => setTermsAccepted(!termsAccepted)}>
            <View style={[styles.checkbox, { borderColor: colors.border }, termsAccepted && { backgroundColor: ACCENT, borderColor: ACCENT }]}>
              {termsAccepted && <IconSymbol name="checkmark" size={12} color="#fff" />}
            </View>
            <Text style={[styles.checkLabel, { color: colors.text }]}>I have read and accept the SAFE terms and conditions</Text>
          </Pressable>
          <View style={[styles.disclaimerBox, { backgroundColor: '#F59E0B15' }]}>
            <Text style={[styles.disclaimerText, { color: '#F59E0B' }]}>{SAFE_TERMS.regDDisclaimer}</Text>
          </View>
          <Pressable style={[styles.ctaButton, { backgroundColor: canConfirm ? ACCENT : colors.border }]} onPress={handleConfirm} disabled={!canConfirm}>
            <Text style={[styles.ctaButtonText, { color: canConfirm ? '#fff' : colors.textTertiary }]}>Invest ${selectedTier.amount.toLocaleString()}</Text>
          </Pressable>
        </View>
      )}

      {stage === 'receipt' && receipt && selectedTier && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECEIPT</Text>
            <View style={styles.confirmRow}><Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Transaction</Text><Text style={[styles.confirmValue, { color: colors.text }]}>{receipt.transactionId}</Text></View>
            <View style={styles.confirmRow}><Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Instrument</Text><Text style={[styles.confirmValue, { color: colors.text }]}>{SAFE_TERMS.instrument}</Text></View>
            <View style={styles.confirmRow}><Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text><Text style={[styles.amountText, { color: colors.text }]}>${receipt.amount.toLocaleString()}</Text></View>
            <View style={styles.confirmRow}><Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Cap</Text><Text style={[styles.confirmValue, { color: colors.text }]}>{SAFE_TERMS.cap}</Text></View>
            <View style={styles.confirmRow}><Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Status</Text><Text style={[styles.statusText, { color: ACCENT }]}>Settled</Text></View>
          </View>
          <View style={[styles.chainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PAYMENT CHAIN</Text>
            {receipt.chain.map((step, i) => (
              <View key={i} style={styles.chainRow}>
                <View style={[styles.chainDot, { backgroundColor: ACCENT }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.chainStage, { color: colors.text }]}>{step.stage}</Text>
                  <Text style={[styles.chainDetail, { color: colors.textSecondary }]}>{step.detail}</Text>
                </View>
              </View>
            ))}
          </View>
          <View style={[styles.disclaimerBox, { backgroundColor: '#F59E0B15' }]}>
            <Text style={[styles.disclaimerText, { color: '#F59E0B' }]}>Securities offered under Regulation D Rule 506(b). Not a public offering.</Text>
          </View>
          <Pressable style={[styles.ctaButton, { backgroundColor: ACCENT }]} onPress={handleClose}>
            <Text style={styles.ctaButtonText}>Done</Text>
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
}

function TermRow({ label, value, colors }: { label: string; value: string; colors: Record<string, string> }) {
  return (
    <View style={styles.termRow}>
      <Text style={[styles.termLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.termValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  roundCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, gap: 10 },
  roundName: { fontSize: 18, fontWeight: '800' },
  roundInstrument: { fontSize: 13, fontWeight: '700' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 11, fontWeight: '600' },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  termsGrid: { gap: 6, marginTop: 4 },
  termRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  termLabel: { fontSize: 12, fontWeight: '500' },
  termValue: { fontSize: 12, fontWeight: '700' },
  backBar: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 },
  backText: { fontSize: 13, fontWeight: '600' },
  tierRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: BorderRadius.md, borderWidth: 1 },
  tierLabel: { fontSize: 16, fontWeight: '800' },
  tierDesc: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  confirmCard: { borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 10 },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confirmLabel: { fontSize: 13, fontWeight: '500' },
  confirmValue: { fontSize: 13, fontWeight: '700' },
  amountText: { fontSize: 24, fontWeight: '800' },
  statusText: { fontSize: 13, fontWeight: '700' },
  input: { borderWidth: 1, borderRadius: BorderRadius.md, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkLabel: { flex: 1, fontSize: 13, fontWeight: '500', lineHeight: 18 },
  disclaimerBox: { borderRadius: BorderRadius.md, padding: Spacing.sm },
  disclaimerText: { fontSize: 11, fontWeight: '600', textAlign: 'center', lineHeight: 16 },
  ctaButton: { paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  ctaButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  chainCard: { borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 8 },
  chainRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  chainDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  chainStage: { fontSize: 12, fontWeight: '700' },
  chainDetail: { fontSize: 11, fontWeight: '500', marginTop: 1 },
});
```

---

## Tickets Sheet (`components/commerce/tickets-sheet.tsx`)

```typescript
/**
 * Tickets Bottom Sheet
 *
 * Browse upcoming home games → select seat tier → confirm → receipt.
 * State machine: browse | confirm | receipt
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { FMU_GAMES, type FMUGame } from '@/data/fmu';
import { SEAT_TIERS, buildCommerceChain, type SeatTier, type PaymentChain } from '@/data/commerce-data';
import { Spacing, BorderRadius } from '@/constants/theme';

type Stage = 'browse' | 'confirm' | 'receipt';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

export function TicketsSheet({ visible, onClose, colors }: Props) {
  const [stage, setStage] = useState<Stage>('browse');
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<FMUGame | null>(null);
  const [selectedTier, setSelectedTier] = useState<SeatTier | null>(null);
  const [chain, setChain] = useState<PaymentChain | null>(null);

  const upcomingHomeGames = FMU_GAMES.filter(g => g.location === 'Home' && g.status === 'upcoming');

  const handleClose = useCallback(() => {
    setStage('browse');
    setExpandedGameId(null);
    setSelectedGame(null);
    setSelectedTier(null);
    setChain(null);
    onClose();
  }, [onClose]);

  const handleSelectTier = useCallback((game: FMUGame, tier: SeatTier) => {
    setSelectedGame(game);
    setSelectedTier(tier);
    setStage('confirm');
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedGame || !selectedTier) return;
    const result = buildCommerceChain(
      'Ticket Purchase',
      selectedTier.price,
      `${selectedTier.label} — vs ${selectedGame.opponent}`,
      'TKT',
    );
    setChain(result);
    setStage('receipt');
  }, [selectedGame, selectedTier]);

  const handleBack = useCallback(() => {
    setStage('browse');
    setSelectedGame(null);
    setSelectedTier(null);
  }, []);

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Tickets" useModal>
      {stage === 'browse' && (
        <View style={styles.container}>
          {upcomingHomeGames.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No upcoming home games.</Text>
          )}
          {upcomingHomeGames.map(game => {
            const expanded = expandedGameId === game.id;
            return (
              <View key={game.id} style={[styles.gameCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Pressable onPress={() => setExpandedGameId(expanded ? null : game.id)}>
                  <Text style={[styles.gameOpponent, { color: colors.text }]}>vs {game.opponent}</Text>
                  <Text style={[styles.gameMeta, { color: colors.textSecondary }]}>
                    {game.date}{game.gameTime ? ` · ${game.gameTime}` : ''} · {game.venue ?? 'Home'}
                  </Text>
                </Pressable>

                {expanded && (
                  <View style={styles.tierList}>
                    {SEAT_TIERS.map(tier => (
                      <Pressable
                        key={tier.id}
                        style={[styles.tierRow, { borderColor: colors.border }]}
                        onPress={() => handleSelectTier(game, tier)}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.tierLabel, { color: colors.text }]}>{tier.label}</Text>
                          <Text style={[styles.tierPrice, { color: colors.textSecondary }]}>${tier.price}</Text>
                        </View>
                        <View style={styles.selectBtn}>
                          <Text style={styles.selectBtnText}>Select</Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {stage === 'confirm' && selectedGame && selectedTier && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CONFIRM PURCHASE</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Game</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>vs {selectedGame.opponent}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Date</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedGame.date}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Seat Tier</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedTier.label}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${selectedTier.price.toFixed(2)}</Text>
            </View>
          </View>

          <Pressable style={styles.ctaButton} onPress={handleConfirm}>
            <Text style={styles.ctaButtonText}>Confirm Purchase</Text>
          </Pressable>
          <Pressable style={[styles.cancelButton, { borderColor: colors.border }]} onPress={handleBack}>
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {stage === 'receipt' && chain && selectedGame && selectedTier && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECEIPT</Text>

            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Transaction</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{chain.transactionId}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Game</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>vs {selectedGame.opponent}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Seat Tier</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedTier.label}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${chain.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Status</Text>
              <Text style={[styles.statusText, { color: '#22C55E' }]}>Settled</Text>
            </View>
          </View>

          <View style={[styles.chainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PAYMENT CHAIN</Text>
            {chain.chain.map((step, i) => (
              <View key={i} style={styles.chainRow}>
                <View style={[styles.chainDot, { backgroundColor: '#22C55E' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.chainStage, { color: colors.text }]}>{step.stage}</Text>
                  <Text style={[styles.chainDetail, { color: colors.textSecondary }]}>{step.detail}</Text>
                </View>
              </View>
            ))}
          </View>

          <Pressable style={styles.ctaButton} onPress={handleClose}>
            <Text style={styles.ctaButtonText}>Done</Text>
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },

  // Game cards
  gameCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
  },
  gameOpponent: {
    fontSize: 15,
    fontWeight: '700',
  },
  gameMeta: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },

  // Tier selection
  tierList: {
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  tierLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  tierPrice: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  selectBtn: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  selectBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Confirm / Receipt
  confirmCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  confirmValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  amountText: {
    fontSize: 24,
    fontWeight: '800',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // CTA
  ctaButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelButton: {
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Payment chain
  chainCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 8,
  },
  chainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  chainDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  chainStage: {
    fontSize: 12,
    fontWeight: '700',
  },
  chainDetail: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
});

```

---

## Store Sheet (`components/commerce/store-sheet.tsx`)

```typescript
/**
 * Store Bottom Sheet
 *
 * 2×2 product grid → add to cart → checkout → receipt.
 * State machine: browse | confirm | receipt
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { STORE_PRODUCTS, buildCommerceChain, type CartItem, type PaymentChain } from '@/data/commerce-data';
import { Spacing, BorderRadius } from '@/constants/theme';

type Stage = 'browse' | 'confirm' | 'receipt';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

export function StoreSheet({ visible, onClose, colors }: Props) {
  const [stage, setStage] = useState<Stage>('browse');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [chain, setChain] = useState<PaymentChain | null>(null);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleClose = useCallback(() => {
    setStage('browse');
    setCart([]);
    setSelectedSizes({});
    setChain(null);
    onClose();
  }, [onClose]);

  const handleSizeSelect = useCallback((productId: string, size: string) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  }, []);

  const handleAddToCart = useCallback((productId: string) => {
    const product = STORE_PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    const size = product.sizes ? (selectedSizes[productId] || product.sizes[0]) : 'One Size';

    setCart(prev => {
      const existing = prev.find(c => c.productId === productId && c.size === size);
      if (existing) {
        return prev.map(c =>
          c.productId === productId && c.size === size
            ? { ...c, qty: c.qty + 1 }
            : c,
        );
      }
      return [...prev, { productId, name: product.name, price: product.price, size, qty: 1 }];
    });
  }, [selectedSizes]);

  const handleCheckout = useCallback(() => {
    setStage('confirm');
  }, []);

  const handleConfirm = useCallback(() => {
    const desc = cart.map(c => `${c.name} (${c.size})${c.qty > 1 ? ` ×${c.qty}` : ''}`).join(', ');
    const result = buildCommerceChain('Merchandise Purchase', cartTotal, desc, 'MRC');
    setChain(result);
    setStage('receipt');
  }, [cart, cartTotal]);

  const handleBack = useCallback(() => {
    setStage('browse');
  }, []);

  const cartFooter = stage === 'browse' && cartCount > 0 ? (
    <Pressable style={styles.cartFooterBtn} onPress={handleCheckout}>
      <Text style={styles.cartFooterText}>
        Checkout · {cartCount} item{cartCount > 1 ? 's' : ''} · ${cartTotal.toFixed(2)}
      </Text>
    </Pressable>
  ) : undefined;

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Team Store" footer={cartFooter} useModal>
      {stage === 'browse' && (
        <View style={styles.grid}>
          {STORE_PRODUCTS.map(product => {
            const activeSize = product.sizes
              ? (selectedSizes[product.id] || product.sizes[0])
              : 'One Size';
            return (
              <View key={product.id} style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
                <Text style={[styles.productPrice, { color: colors.textSecondary }]}>${product.price.toFixed(2)}</Text>

                {/* Size selector */}
                <View style={styles.sizeRow}>
                  {product.sizes ? product.sizes.map(size => (
                    <Pressable
                      key={size}
                      style={[
                        styles.sizePill,
                        { borderColor: colors.border },
                        activeSize === size && styles.sizePillActive,
                      ]}
                      onPress={() => handleSizeSelect(product.id, size)}
                    >
                      <Text style={[
                        styles.sizePillText,
                        { color: colors.textSecondary },
                        activeSize === size && styles.sizePillTextActive,
                      ]}>
                        {size}
                      </Text>
                    </Pressable>
                  )) : (
                    <Text style={[styles.oneSizeText, { color: colors.textTertiary }]}>One Size</Text>
                  )}
                </View>

                <Pressable
                  style={styles.addBtn}
                  onPress={() => handleAddToCart(product.id)}
                >
                  <Text style={styles.addBtnText}>Add to Cart</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}

      {stage === 'confirm' && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>ORDER SUMMARY</Text>
            {cart.map((item, i) => (
              <View key={i} style={styles.confirmRow}>
                <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>
                  {item.name} · {item.size}{item.qty > 1 ? ` ×${item.qty}` : ''}
                </Text>
                <Text style={[styles.confirmValue, { color: colors.text }]}>${(item.price * item.qty).toFixed(2)}</Text>
              </View>
            ))}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Total</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${cartTotal.toFixed(2)}</Text>
            </View>
          </View>

          <Pressable style={styles.ctaButton} onPress={handleConfirm}>
            <Text style={styles.ctaButtonText}>Confirm Purchase</Text>
          </Pressable>
          <Pressable style={[styles.cancelButton, { borderColor: colors.border }]} onPress={handleBack}>
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {stage === 'receipt' && chain && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECEIPT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Transaction</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{chain.transactionId}</Text>
            </View>
            {cart.map((item, i) => (
              <View key={i} style={styles.confirmRow}>
                <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>
                  {item.name} · {item.size}{item.qty > 1 ? ` ×${item.qty}` : ''}
                </Text>
                <Text style={[styles.confirmValue, { color: colors.text }]}>${(item.price * item.qty).toFixed(2)}</Text>
              </View>
            ))}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Total</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${chain.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Status</Text>
              <Text style={[styles.statusText, { color: '#22C55E' }]}>Settled</Text>
            </View>
          </View>

          <View style={[styles.chainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PAYMENT CHAIN</Text>
            {chain.chain.map((step, i) => (
              <View key={i} style={styles.chainRow}>
                <View style={[styles.chainDot, { backgroundColor: '#22C55E' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.chainStage, { color: colors.text }]}>{step.stage}</Text>
                  <Text style={[styles.chainDetail, { color: colors.textSecondary }]}>{step.detail}</Text>
                </View>
              </View>
            ))}
          </View>

          <Pressable style={styles.ctaButton} onPress={handleClose}>
            <Text style={styles.ctaButtonText}>Done</Text>
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },

  // Product grid (2×2)
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  productCard: {
    width: '48%',
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.sm,
    gap: 6,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Size selector
  sizeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  sizePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  sizePillActive: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  sizePillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sizePillTextActive: {
    color: '#fff',
  },
  oneSizeText: {
    fontSize: 11,
    fontWeight: '500',
  },

  // Add to cart
  addBtn: {
    backgroundColor: '#1E40AF',
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: 4,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Cart footer
  cartFooterBtn: {
    flex: 1,
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  cartFooterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // Confirm / Receipt shared
  confirmCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmLabel: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  confirmValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  amountText: {
    fontSize: 24,
    fontWeight: '800',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },

  // CTA / Cancel
  ctaButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelButton: {
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Payment chain
  chainCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 8,
  },
  chainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  chainDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  chainStage: {
    fontSize: 12,
    fontWeight: '700',
  },
  chainDetail: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
});

```

---

## Support Sheet (`components/commerce/support-sheet.tsx`)

```typescript
/**
 * Support Bottom Sheet
 *
 * Three giving tiers + custom amount + one-time/recurring toggle → confirm → receipt.
 * State machine: browse | confirm | receipt
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { SUPPORT_TIERS, buildCommerceChain, type SupportTier, type PaymentChain } from '@/data/commerce-data';
import { Spacing, BorderRadius } from '@/constants/theme';

type Stage = 'browse' | 'confirm' | 'receipt';
type Frequency = 'one-time' | 'recurring';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

export function SupportSheet({ visible, onClose, colors }: Props) {
  const [stage, setStage] = useState<Stage>('browse');
  const [selectedTier, setSelectedTier] = useState<SupportTier | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('one-time');
  const [chain, setChain] = useState<PaymentChain | null>(null);

  const effectiveAmount = selectedTier
    ? selectedTier.amount
    : parseFloat(customAmount) || 0;

  const effectiveLabel = selectedTier
    ? `${selectedTier.label} — ${selectedTier.description}`
    : 'Custom Donation';

  const handleClose = useCallback(() => {
    setStage('browse');
    setSelectedTier(null);
    setCustomAmount('');
    setFrequency('one-time');
    setChain(null);
    onClose();
  }, [onClose]);

  const handleSelectTier = useCallback((tier: SupportTier) => {
    setSelectedTier(tier);
    setCustomAmount('');
  }, []);

  const handleCustomFocus = useCallback(() => {
    setSelectedTier(null);
  }, []);

  const handleGive = useCallback(() => {
    if (effectiveAmount <= 0) return;
    setStage('confirm');
  }, [effectiveAmount]);

  const handleConfirm = useCallback(() => {
    const desc = `${effectiveLabel} (${frequency})`;
    const result = buildCommerceChain('Donation', effectiveAmount, desc, 'DON');
    setChain(result);
    setStage('receipt');
  }, [effectiveAmount, effectiveLabel, frequency]);

  const handleBack = useCallback(() => {
    setStage('browse');
  }, []);

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Support FMU Lions" useModal>
      {stage === 'browse' && (
        <View style={styles.container}>
          {/* Tiers */}
          {SUPPORT_TIERS.map(tier => {
            const isActive = selectedTier?.id === tier.id;
            return (
              <Pressable
                key={tier.id}
                style={[
                  styles.tierCard,
                  { backgroundColor: colors.card, borderColor: isActive ? '#1E40AF' : colors.border },
                  isActive && styles.tierCardActive,
                ]}
                onPress={() => handleSelectTier(tier)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.tierLabel, { color: colors.text }]}>{tier.label}</Text>
                  <Text style={[styles.tierDesc, { color: colors.textSecondary }]}>{tier.description}</Text>
                </View>
                <Text style={[styles.tierAmount, { color: colors.text }]}>${tier.amount}</Text>
              </Pressable>
            );
          })}

          {/* Custom amount */}
          <View style={[styles.customRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.dollarSign, { color: colors.textSecondary }]}>$</Text>
            <TextInput
              style={[styles.customInput, { color: colors.text }]}
              placeholder="Custom amount"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
              value={customAmount}
              onChangeText={setCustomAmount}
              onFocus={handleCustomFocus}
            />
          </View>

          {/* Frequency toggle */}
          <View style={[styles.freqRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Pressable
              style={[
                styles.freqPill,
                frequency === 'one-time' && styles.freqPillActive,
              ]}
              onPress={() => setFrequency('one-time')}
            >
              <Text style={[
                styles.freqPillText,
                { color: frequency === 'one-time' ? '#fff' : colors.textSecondary },
              ]}>
                One-Time
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.freqPill,
                frequency === 'recurring' && styles.freqPillActive,
              ]}
              onPress={() => setFrequency('recurring')}
            >
              <Text style={[
                styles.freqPillText,
                { color: frequency === 'recurring' ? '#fff' : colors.textSecondary },
              ]}>
                Recurring
              </Text>
            </Pressable>
          </View>

          {/* Give button */}
          <Pressable
            style={[styles.ctaButton, effectiveAmount <= 0 && styles.ctaDisabled]}
            onPress={handleGive}
            disabled={effectiveAmount <= 0}
          >
            <Text style={styles.ctaButtonText}>
              {effectiveAmount > 0 ? `Give $${effectiveAmount.toFixed(2)}` : 'Give Now'}
            </Text>
          </Pressable>
        </View>
      )}

      {stage === 'confirm' && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CONFIRM DONATION</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Tier</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{effectiveLabel}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Frequency</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>
                {frequency === 'one-time' ? 'One-Time' : 'Monthly Recurring'}
              </Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${effectiveAmount.toFixed(2)}</Text>
            </View>
          </View>

          <Pressable style={styles.ctaButton} onPress={handleConfirm}>
            <Text style={styles.ctaButtonText}>Confirm Donation</Text>
          </Pressable>
          <Pressable style={[styles.cancelButton, { borderColor: colors.border }]} onPress={handleBack}>
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {stage === 'receipt' && chain && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECEIPT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Transaction</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{chain.transactionId}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Tier</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{effectiveLabel}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Frequency</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>
                {frequency === 'one-time' ? 'One-Time' : 'Monthly Recurring'}
              </Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${chain.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Status</Text>
              <Text style={[styles.statusText, { color: '#22C55E' }]}>Settled</Text>
            </View>
          </View>

          <Text style={[styles.donorNote, { color: colors.textTertiary }]}>
            Donor linked to Booster/NIL Collective
          </Text>

          <View style={[styles.chainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PAYMENT CHAIN</Text>
            {chain.chain.map((step, i) => (
              <View key={i} style={styles.chainRow}>
                <View style={[styles.chainDot, { backgroundColor: '#22C55E' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.chainStage, { color: colors.text }]}>{step.stage}</Text>
                  <Text style={[styles.chainDetail, { color: colors.textSecondary }]}>{step.detail}</Text>
                </View>
              </View>
            ))}
          </View>

          <Pressable style={styles.ctaButton} onPress={handleClose}>
            <Text style={styles.ctaButtonText}>Done</Text>
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },

  // Tier cards
  tierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
  },
  tierCardActive: {
    borderWidth: 2,
  },
  tierLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  tierDesc: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  tierAmount: {
    fontSize: 20,
    fontWeight: '800',
  },

  // Custom amount
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  dollarSign: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 6,
  },
  customInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: 4,
  },

  // Frequency toggle
  freqRow: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  freqPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  freqPillActive: {
    backgroundColor: '#1E40AF',
  },
  freqPillText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // CTA
  ctaButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  ctaDisabled: {
    opacity: 0.4,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelButton: {
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Confirm / Receipt
  confirmCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  confirmValue: {
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
  },
  amountText: {
    fontSize: 24,
    fontWeight: '800',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  donorNote: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Payment chain
  chainCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 8,
  },
  chainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  chainDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  chainStage: {
    fontSize: 12,
    fontWeight: '700',
  },
  chainDetail: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
});

```

---

## Competition Tickets Sheet (`components/commerce/comp-tickets-sheet.tsx`)

```typescript
/**
 * Competition Tickets Bottom Sheet
 *
 * Browse upcoming races -> select seat tier -> confirm -> receipt.
 * State machine: browse | confirm | receipt
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { RACE_ROUNDS, type RaceRound } from '@/data/mock-competition-home';
import { COMP_SEAT_TIERS, buildCompCommerceChain, type CompSeatTier } from '@/data/comp-commerce-data';
import type { PaymentChain } from '@/data/commerce-data';
import { Spacing, BorderRadius } from '@/constants/theme';

type Stage = 'browse' | 'confirm' | 'receipt';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

export function CompTicketsSheet({ visible, onClose, colors }: Props) {
  const [stage, setStage] = useState<Stage>('browse');
  const [expandedRaceId, setExpandedRaceId] = useState<string | null>(null);
  const [selectedRace, setSelectedRace] = useState<RaceRound | null>(null);
  const [selectedTier, setSelectedTier] = useState<CompSeatTier | null>(null);
  const [chain, setChain] = useState<PaymentChain | null>(null);

  const upcomingRaces = RACE_ROUNDS.filter((r) => r.status !== 'completed');

  const handleClose = useCallback(() => {
    setStage('browse');
    setExpandedRaceId(null);
    setSelectedRace(null);
    setSelectedTier(null);
    setChain(null);
    onClose();
  }, [onClose]);

  const handleSelectTier = useCallback((race: RaceRound, tier: CompSeatTier) => {
    setSelectedRace(race);
    setSelectedTier(tier);
    setStage('confirm');
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedRace || !selectedTier) return;
    const result = buildCompCommerceChain(
      'Race Ticket',
      selectedTier.price,
      `${selectedTier.label} — ${selectedRace.name}`,
      'RTK',
    );
    setChain(result);
    setStage('receipt');
  }, [selectedRace, selectedTier]);

  const handleBack = useCallback(() => {
    setStage('browse');
    setSelectedRace(null);
    setSelectedTier(null);
  }, []);

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Tickets" useModal>
      {stage === 'browse' && (
        <View style={styles.container}>
          {upcomingRaces.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No upcoming races.</Text>
          )}
          {upcomingRaces.map((race) => {
            const expanded = expandedRaceId === race.id;
            return (
              <View key={race.id} style={[styles.raceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Pressable onPress={() => setExpandedRaceId(expanded ? null : race.id)}>
                  <Text style={[styles.raceName, { color: colors.text }]}>{race.name}</Text>
                  <Text style={[styles.raceMeta, { color: colors.textSecondary }]}>
                    {race.venue}, {race.city} {'\u00B7'} {race.date}
                  </Text>
                </Pressable>

                {expanded && (
                  <View style={styles.tierList}>
                    {COMP_SEAT_TIERS.map((tier) => (
                      <Pressable
                        key={tier.id}
                        style={[styles.tierRow, { borderColor: colors.border }]}
                        onPress={() => handleSelectTier(race, tier)}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.tierLabel, { color: colors.text }]}>{tier.label}</Text>
                          <Text style={[styles.tierPrice, { color: colors.textSecondary }]}>${tier.price.toLocaleString()}</Text>
                        </View>
                        <View style={styles.selectBtn}>
                          <Text style={styles.selectBtnText}>Select</Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {stage === 'confirm' && selectedRace && selectedTier && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CONFIRM PURCHASE</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Race</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedRace.name}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Venue</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedRace.city}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Date</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedRace.date}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Seat Tier</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedTier.label}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${selectedTier.price.toLocaleString()}.00</Text>
            </View>
          </View>

          <Pressable style={styles.ctaButton} onPress={handleConfirm}>
            <Text style={styles.ctaButtonText}>Confirm Purchase</Text>
          </Pressable>
          <Pressable style={[styles.cancelButton, { borderColor: colors.border }]} onPress={handleBack}>
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {stage === 'receipt' && chain && selectedRace && selectedTier && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECEIPT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Transaction</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{chain.transactionId}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Race</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedRace.name}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Seat Tier</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedTier.label}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${chain.amount.toLocaleString()}.00</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Status</Text>
              <Text style={[styles.statusText, { color: '#22C55E' }]}>Settled</Text>
            </View>
          </View>

          <View style={[styles.chainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PAYMENT CHAIN</Text>
            {chain.chain.map((step, i) => (
              <View key={i} style={styles.chainRow}>
                <View style={[styles.chainDot, { backgroundColor: '#22C55E' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.chainStage, { color: colors.text }]}>{step.stage}</Text>
                  <Text style={[styles.chainDetail, { color: colors.textSecondary }]}>{step.detail}</Text>
                </View>
              </View>
            ))}
          </View>

          <Pressable style={styles.ctaButton} onPress={handleClose}>
            <Text style={styles.ctaButtonText}>Done</Text>
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },
  emptyText: { fontSize: 14, textAlign: 'center', paddingVertical: Spacing.xl },

  raceCard: { borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md },
  raceName: { fontSize: 15, fontWeight: '700' },
  raceMeta: { fontSize: 12, fontWeight: '500', marginTop: 4 },

  tierList: { marginTop: Spacing.sm, gap: Spacing.sm },
  tierRow: { flexDirection: 'row', alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, borderRadius: BorderRadius.md, padding: Spacing.sm },
  tierLabel: { fontSize: 14, fontWeight: '600' },
  tierPrice: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  selectBtn: { backgroundColor: '#FF5555', paddingHorizontal: 14, paddingVertical: 6, borderRadius: BorderRadius.md },
  selectBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  confirmCard: { borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 10 },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confirmLabel: { fontSize: 13, fontWeight: '500' },
  confirmValue: { fontSize: 13, fontWeight: '700' },
  amountText: { fontSize: 24, fontWeight: '800' },
  statusText: { fontSize: 13, fontWeight: '700' },

  ctaButton: { backgroundColor: '#22C55E', paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  ctaButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cancelButton: { borderWidth: 1, paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  cancelButtonText: { fontSize: 15, fontWeight: '600' },

  chainCard: { borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 8 },
  chainRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  chainDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  chainStage: { fontSize: 12, fontWeight: '700' },
  chainDetail: { fontSize: 11, fontWeight: '500', marginTop: 1 },
});

```

---

## Competition Store Sheet (`components/commerce/comp-store-sheet.tsx`)

```typescript
/**
 * Competition Store Bottom Sheet
 *
 * 2x2 product grid -> cart -> confirm -> receipt.
 * State machine: browse | confirm | receipt
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { COMP_STORE_PRODUCTS, buildCompCommerceChain } from '@/data/comp-commerce-data';
import type { PaymentChain } from '@/data/commerce-data';
import { Spacing, BorderRadius } from '@/constants/theme';

type Stage = 'browse' | 'confirm' | 'receipt';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

export function CompStoreSheet({ visible, onClose, colors }: Props) {
  const [stage, setStage] = useState<Stage>('browse');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [chain, setChain] = useState<PaymentChain | null>(null);

  const cartCount = useMemo(() => cart.reduce((sum, c) => sum + c.qty, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, c) => sum + c.price * c.qty, 0), [cart]);

  const handleClose = useCallback(() => {
    setStage('browse');
    setCart([]);
    setChain(null);
    onClose();
  }, [onClose]);

  const addToCart = useCallback((product: typeof COMP_STORE_PRODUCTS[number]) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === product.id);
      if (existing) {
        return prev.map((c) => (c.productId === product.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, qty: 1 }];
    });
  }, []);

  const handleCheckout = useCallback(() => {
    if (cartCount === 0) return;
    setStage('confirm');
  }, [cartCount]);

  const handleConfirm = useCallback(() => {
    const desc = cart.map((c) => `${c.name} x${c.qty}`).join(', ');
    const result = buildCompCommerceChain('Merchandise Purchase', cartTotal, desc, 'RMS');
    setChain(result);
    setStage('receipt');
  }, [cart, cartTotal]);

  const handleBack = useCallback(() => {
    setStage('browse');
  }, []);

  const cartFooter = cartCount > 0 ? (
    <View style={styles.footerContainer}>
      <Pressable style={styles.checkoutButton} onPress={handleCheckout}>
        <Text style={styles.checkoutButtonText}>
          Checkout {'\u00B7'} {cartCount} item{cartCount > 1 ? 's' : ''} {'\u00B7'} ${cartTotal.toFixed(2)}
        </Text>
      </Pressable>
    </View>
  ) : undefined;

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="K-1 Racing Store" footer={cartFooter} useModal>
      {stage === 'browse' && (
        <View style={styles.container}>
          <View style={styles.productGrid}>
            {COMP_STORE_PRODUCTS.map((product) => (
              <View key={product.id} style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
                <Text style={[styles.productPrice, { color: colors.textSecondary }]}>${product.price.toFixed(2)}</Text>
                <Pressable style={styles.addButton} onPress={() => addToCart(product)}>
                  <Text style={styles.addButtonText}>Add to Cart</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      )}

      {stage === 'confirm' && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>ORDER SUMMARY</Text>
            {cart.map((item) => (
              <View key={item.productId} style={styles.confirmRow}>
                <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>{item.name} x{item.qty}</Text>
                <Text style={[styles.confirmValue, { color: colors.text }]}>${(item.price * item.qty).toFixed(2)}</Text>
              </View>
            ))}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Total</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${cartTotal.toFixed(2)}</Text>
            </View>
          </View>

          <Pressable style={styles.ctaButton} onPress={handleConfirm}>
            <Text style={styles.ctaButtonText}>Confirm Purchase</Text>
          </Pressable>
          <Pressable style={[styles.cancelButton, { borderColor: colors.border }]} onPress={handleBack}>
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {stage === 'receipt' && chain && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECEIPT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Transaction</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{chain.transactionId}</Text>
            </View>
            {cart.map((item) => (
              <View key={item.productId} style={styles.confirmRow}>
                <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>{item.name} x{item.qty}</Text>
                <Text style={[styles.confirmValue, { color: colors.text }]}>${(item.price * item.qty).toFixed(2)}</Text>
              </View>
            ))}
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${chain.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Status</Text>
              <Text style={[styles.statusText, { color: '#22C55E' }]}>Settled</Text>
            </View>
          </View>

          <View style={[styles.chainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PAYMENT CHAIN</Text>
            {chain.chain.map((step, i) => (
              <View key={i} style={styles.chainRow}>
                <View style={[styles.chainDot, { backgroundColor: '#22C55E' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.chainStage, { color: colors.text }]}>{step.stage}</Text>
                  <Text style={[styles.chainDetail, { color: colors.textSecondary }]}>{step.detail}</Text>
                </View>
              </View>
            ))}
          </View>

          <Pressable style={styles.ctaButton} onPress={handleClose}>
            <Text style={styles.ctaButtonText}>Done</Text>
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },

  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  productCard: {
    width: '48%',
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 6,
  },
  productName: { fontSize: 14, fontWeight: '700' },
  productPrice: { fontSize: 13, fontWeight: '600' },
  addButton: { backgroundColor: '#FF5555', paddingVertical: 8, borderRadius: BorderRadius.md, alignItems: 'center', marginTop: 4 },
  addButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  footerContainer: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  checkoutButton: { backgroundColor: '#22C55E', paddingVertical: 14, borderRadius: BorderRadius.md, alignItems: 'center' },
  checkoutButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  confirmCard: { borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 10 },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confirmLabel: { fontSize: 13, fontWeight: '500' },
  confirmValue: { fontSize: 13, fontWeight: '700' },
  amountText: { fontSize: 24, fontWeight: '800' },
  statusText: { fontSize: 13, fontWeight: '700' },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 4 },

  ctaButton: { backgroundColor: '#22C55E', paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  ctaButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cancelButton: { borderWidth: 1, paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  cancelButtonText: { fontSize: 15, fontWeight: '600' },

  chainCard: { borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 8 },
  chainRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  chainDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  chainStage: { fontSize: 12, fontWeight: '700' },
  chainDetail: { fontSize: 11, fontWeight: '500', marginTop: 1 },
});

```

---

## Competition Paddock Sheet (`components/commerce/comp-paddock-sheet.tsx`)

```typescript
/**
 * Competition Paddock / VIP Hospitality Bottom Sheet
 *
 * Per-race / season toggle -> 3 tier cards -> confirm -> receipt.
 * State machine: browse | confirm | receipt
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { PADDOCK_TIERS, buildCompCommerceChain, type PaddockTier } from '@/data/comp-commerce-data';
import type { PaymentChain } from '@/data/commerce-data';
import { Spacing, BorderRadius } from '@/constants/theme';

type Stage = 'browse' | 'confirm' | 'receipt';
type PricingMode = 'per_race' | 'season';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

export function CompPaddockSheet({ visible, onClose, colors }: Props) {
  const [stage, setStage] = useState<Stage>('browse');
  const [pricingMode, setPricingMode] = useState<PricingMode>('per_race');
  const [selectedTier, setSelectedTier] = useState<PaddockTier | null>(null);
  const [chain, setChain] = useState<PaymentChain | null>(null);

  const getPrice = (tier: PaddockTier) =>
    pricingMode === 'per_race' ? tier.perRacePrice : tier.seasonPrice;

  const handleClose = useCallback(() => {
    setStage('browse');
    setPricingMode('per_race');
    setSelectedTier(null);
    setChain(null);
    onClose();
  }, [onClose]);

  const handleSelect = useCallback((tier: PaddockTier) => {
    setSelectedTier(tier);
    setStage('confirm');
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedTier) return;
    const price = getPrice(selectedTier);
    const typeLabel = pricingMode === 'per_race' ? 'Per Race' : 'Season Pass';
    const result = buildCompCommerceChain(
      'Paddock Pass',
      price,
      `${selectedTier.label} — ${typeLabel}`,
      'RPD',
    );
    setChain(result);
    setStage('receipt');
  }, [selectedTier, pricingMode]);

  const handleBack = useCallback(() => {
    setStage('browse');
    setSelectedTier(null);
  }, []);

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="VIP & Hospitality" useModal>
      {stage === 'browse' && (
        <View style={styles.container}>
          {/* Per-Race / Season Toggle */}
          <View style={[styles.toggleBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Pressable
              style={[styles.togglePill, pricingMode === 'per_race' && styles.togglePillActive]}
              onPress={() => setPricingMode('per_race')}
            >
              <Text style={[styles.toggleText, pricingMode === 'per_race' && styles.toggleTextActive]}>Per Race</Text>
            </Pressable>
            <Pressable
              style={[styles.togglePill, pricingMode === 'season' && styles.togglePillActive]}
              onPress={() => setPricingMode('season')}
            >
              <Text style={[styles.toggleText, pricingMode === 'season' && styles.toggleTextActive]}>Season Pass</Text>
            </Pressable>
          </View>

          {/* Tier Cards */}
          {PADDOCK_TIERS.map((tier) => (
            <Pressable
              key={tier.id}
              style={[styles.tierCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleSelect(tier)}
            >
              <Text style={[styles.tierLabel, { color: colors.text }]}>{tier.label}</Text>
              <Text style={[styles.tierDescription, { color: colors.textSecondary }]}>{tier.description}</Text>
              <Text style={[styles.tierPrice, { color: '#FF5555' }]}>
                ${getPrice(tier).toLocaleString()}
                {pricingMode === 'per_race' ? ' / race' : ' / season'}
              </Text>
            </Pressable>
          ))}

          <Text style={[styles.footerNote, { color: colors.textTertiary }]}>
            Pass holders are linked to their organization role for exclusive access.
          </Text>
        </View>
      )}

      {stage === 'confirm' && selectedTier && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CONFIRM PURCHASE</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Tier</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedTier.label}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Type</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>
                {pricingMode === 'per_race' ? 'Per Race' : 'Season Pass'}
              </Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${getPrice(selectedTier).toLocaleString()}.00</Text>
            </View>
          </View>

          <Pressable style={styles.ctaButton} onPress={handleConfirm}>
            <Text style={styles.ctaButtonText}>Confirm Purchase</Text>
          </Pressable>
          <Pressable style={[styles.cancelButton, { borderColor: colors.border }]} onPress={handleBack}>
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {stage === 'receipt' && chain && selectedTier && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECEIPT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Transaction</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{chain.transactionId}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Tier</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedTier.label}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Type</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>
                {pricingMode === 'per_race' ? 'Per Race' : 'Season Pass'}
              </Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${chain.amount.toLocaleString()}.00</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Status</Text>
              <Text style={[styles.statusText, { color: '#22C55E' }]}>Settled</Text>
            </View>
          </View>

          <Text style={[styles.linkedNote, { color: colors.textTertiary }]}>
            Pass holder linked to organization role for paddock access.
          </Text>

          <View style={[styles.chainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PAYMENT CHAIN</Text>
            {chain.chain.map((step, i) => (
              <View key={i} style={styles.chainRow}>
                <View style={[styles.chainDot, { backgroundColor: '#22C55E' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.chainStage, { color: colors.text }]}>{step.stage}</Text>
                  <Text style={[styles.chainDetail, { color: colors.textSecondary }]}>{step.detail}</Text>
                </View>
              </View>
            ))}
          </View>

          <Pressable style={styles.ctaButton} onPress={handleClose}>
            <Text style={styles.ctaButtonText}>Done</Text>
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },

  toggleBar: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 4,
  },
  togglePill: { flex: 1, paddingVertical: 8, borderRadius: BorderRadius.md, alignItems: 'center' },
  togglePillActive: { backgroundColor: '#FF5555' },
  toggleText: { fontSize: 13, fontWeight: '600', color: '#9CA3AF' },
  toggleTextActive: { color: '#fff' },

  tierCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 4,
  },
  tierLabel: { fontSize: 16, fontWeight: '700' },
  tierDescription: { fontSize: 12, fontWeight: '500' },
  tierPrice: { fontSize: 18, fontWeight: '800', marginTop: 4 },

  footerNote: { fontSize: 11, fontStyle: 'italic', textAlign: 'center', paddingHorizontal: Spacing.md },
  linkedNote: { fontSize: 11, fontStyle: 'italic', textAlign: 'center' },

  confirmCard: { borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 10 },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confirmLabel: { fontSize: 13, fontWeight: '500' },
  confirmValue: { fontSize: 13, fontWeight: '700' },
  amountText: { fontSize: 24, fontWeight: '800' },
  statusText: { fontSize: 13, fontWeight: '700' },

  ctaButton: { backgroundColor: '#22C55E', paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  ctaButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cancelButton: { borderWidth: 1, paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  cancelButtonText: { fontSize: 15, fontWeight: '600' },

  chainCard: { borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 8 },
  chainRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  chainDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  chainStage: { fontSize: 12, fontWeight: '700' },
  chainDetail: { fontSize: 11, fontWeight: '500', marginTop: 1 },
});

```

---

## Education Apply Sheet (`components/commerce/edu-apply-sheet.tsx`)

```typescript
/**
 * Education Apply Bottom Sheet
 *
 * 3-stage: browse application types → confirm → receipt with payment chain.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import {
  APPLICATION_TYPES,
  buildEduCommerceChain,
  type ApplicationType,
} from '@/data/edu-commerce-data';
import type { PaymentChain } from '@/data/commerce-data';
import { Spacing, BorderRadius } from '@/constants/theme';

type Stage = 'browse' | 'confirm' | 'receipt';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

const ACCENT = '#14B8A6';

export function EduApplySheet({ visible, onClose, colors }: Props) {
  const [stage, setStage] = useState<Stage>('browse');
  const [selected, setSelected] = useState<ApplicationType | null>(null);
  const [chain, setChain] = useState<PaymentChain | null>(null);

  const handleClose = useCallback(() => {
    setStage('browse');
    setSelected(null);
    setChain(null);
    onClose();
  }, [onClose]);

  const handleSelect = useCallback((app: ApplicationType) => {
    setSelected(app);
    setStage('confirm');
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selected) return;
    const result = buildEduCommerceChain(
      'Application Fee',
      selected.fee,
      `${selected.label} Application`,
      'APP',
    );
    setChain(result);
    setStage('receipt');
  }, [selected]);

  const handleBack = useCallback(() => {
    setStage('browse');
    setSelected(null);
  }, []);

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Apply to FMU" useModal>
      {stage === 'browse' && (
        <View style={styles.container}>
          {APPLICATION_TYPES.map((app) => (
            <View key={app.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardLabel, { color: colors.text }]}>{app.label}</Text>
                <Text style={[styles.cardFee, { color: ACCENT }]}>${app.fee}</Text>
              </View>
              <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{app.description}</Text>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Deadline: {app.deadline}</Text>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Requirements: {app.requirements}</Text>
              <Pressable style={[styles.selectBtn, { backgroundColor: ACCENT }]} onPress={() => handleSelect(app)}>
                <Text style={styles.selectBtnText}>Select</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {stage === 'confirm' && selected && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CONFIRM APPLICATION</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Type</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selected.label}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Deadline</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selected.deadline}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Application Fee</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${selected.fee.toFixed(2)}</Text>
            </View>
          </View>

          <Pressable style={[styles.ctaButton, { backgroundColor: ACCENT }]} onPress={handleConfirm}>
            <Text style={styles.ctaButtonText}>Submit & Pay</Text>
          </Pressable>
          <Pressable style={[styles.cancelButton, { borderColor: colors.border }]} onPress={handleBack}>
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Back</Text>
          </Pressable>
        </View>
      )}

      {stage === 'receipt' && chain && selected && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECEIPT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Transaction</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{chain.transactionId}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Type</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selected.label} Application</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${chain.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Status</Text>
              <Text style={[styles.statusText, { color: '#22C55E' }]}>Settled</Text>
            </View>
          </View>

          <View style={[styles.chainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PAYMENT CHAIN</Text>
            {chain.chain.map((step, i) => (
              <View key={i} style={styles.chainRow}>
                <View style={[styles.chainDot, { backgroundColor: '#22C55E' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.chainStage, { color: colors.text }]}>{step.stage}</Text>
                  <Text style={[styles.chainDetail, { color: colors.textSecondary }]}>{step.detail}</Text>
                </View>
              </View>
            ))}
          </View>

          <Pressable style={[styles.ctaButton, { backgroundColor: ACCENT }]} onPress={handleClose}>
            <Text style={styles.ctaButtonText}>Done</Text>
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },

  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: { fontSize: 15, fontWeight: '700' },
  cardFee: { fontSize: 15, fontWeight: '800' },
  cardDesc: { fontSize: 12, fontWeight: '500' },
  cardMeta: { fontSize: 11, fontWeight: '500' },
  selectBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    marginTop: 4,
  },
  selectBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  confirmCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 10,
  },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confirmLabel: { fontSize: 13, fontWeight: '500' },
  confirmValue: { fontSize: 13, fontWeight: '700' },
  amountText: { fontSize: 24, fontWeight: '800' },
  statusText: { fontSize: 13, fontWeight: '700' },

  ctaButton: { paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  ctaButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cancelButton: { borderWidth: 1, paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  cancelButtonText: { fontSize: 15, fontWeight: '600' },

  chainCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 8,
  },
  chainRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  chainDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  chainStage: { fontSize: 12, fontWeight: '700' },
  chainDetail: { fontSize: 11, fontWeight: '500', marginTop: 1 },
});

```

---

## Education Catalog Sheet (`components/commerce/edu-catalog-sheet.tsx`)

```typescript
/**
 * Education Catalog Bottom Sheet
 *
 * Browse-only: school pills → programs list → expandable program detail.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { CATALOG_SCHOOLS, type CatalogSchool } from '@/data/edu-commerce-data';
import { ACADEMIC_PROGRAMS, type AcademicProgram } from '@/data/mock-education-home';
import { Spacing, BorderRadius } from '@/constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

const ACCENT = '#14B8A6';

const STATUS_COLORS: Record<string, string> = {
  open: '#22C55E',
  waitlisted: '#F59E0B',
  closed: '#EF4444',
};

export function EduCatalogSheet({ visible, onClose, colors }: Props) {
  const [selectedSchool, setSelectedSchool] = useState<CatalogSchool>(CATALOG_SCHOOLS[0]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const handleClose = useCallback(() => {
    setExpandedId(null);
    setSearch('');
    setSelectedSchool(CATALOG_SCHOOLS[0]);
    onClose();
  }, [onClose]);

  const filteredPrograms = useMemo(() => {
    const depts = selectedSchool.departments;
    let programs = ACADEMIC_PROGRAMS.filter((p) => depts.includes(p.department));
    if (search.trim()) {
      const q = search.toLowerCase();
      programs = programs.filter(
        (p) => p.name.toLowerCase().includes(q) || p.department.toLowerCase().includes(q),
      );
    }
    return programs;
  }, [selectedSchool, search]);

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Course Catalog" useModal>
      <View style={styles.container}>
        {/* School pills */}
        <View style={styles.pillRow}>
          {CATALOG_SCHOOLS.map((school) => {
            const active = school.id === selectedSchool.id;
            return (
              <Pressable
                key={school.id}
                style={[
                  styles.pill,
                  active
                    ? { backgroundColor: ACCENT }
                    : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth },
                ]}
                onPress={() => { setSelectedSchool(school); setExpandedId(null); }}
              >
                <Text style={[styles.pillText, { color: active ? '#fff' : colors.text }]} numberOfLines={1}>
                  {school.name.replace('School of ', '')}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Search */}
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Search programs..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />

        {/* Programs */}
        {filteredPrograms.length === 0 && (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No programs found.</Text>
        )}
        {filteredPrograms.map((prog) => {
          const expanded = expandedId === prog.id;
          return (
            <Pressable
              key={prog.id}
              style={[styles.programCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setExpandedId(expanded ? null : prog.id)}
            >
              <View style={styles.programHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.programName, { color: colors.text }]}>{prog.name}</Text>
                  <View style={styles.badgeRow}>
                    <View style={[styles.degreeBadge, { backgroundColor: ACCENT + '22' }]}>
                      <Text style={[styles.degreeBadgeText, { color: ACCENT }]}>{prog.degreeType}</Text>
                    </View>
                    <Text style={[styles.programEnrollment, { color: colors.textSecondary }]}>
                      {prog.enrollment} enrolled
                    </Text>
                  </View>
                </View>
                <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[prog.status] ?? '#6B7280' }]} />
              </View>

              {expanded && (
                <View style={styles.detailSection}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Department</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{prog.department}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Acceptance Rate</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{prog.acceptanceRate}%</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Avg Incoming GPA</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{prog.avgIncomingGPA.toFixed(2)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Status</Text>
                    <Text style={[styles.detailValue, { color: STATUS_COLORS[prog.status] ?? colors.text }]}>
                      {prog.status.charAt(0).toUpperCase() + prog.status.slice(1)}
                    </Text>
                  </View>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full },
  pillText: { fontSize: 12, fontWeight: '600' },

  searchInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },

  emptyText: { fontSize: 14, textAlign: 'center', paddingVertical: Spacing.xl },

  programCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
  },
  programHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  programName: { fontSize: 14, fontWeight: '700' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  degreeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  degreeBadgeText: { fontSize: 10, fontWeight: '700' },
  programEnrollment: { fontSize: 11, fontWeight: '500' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },

  detailSection: { marginTop: 10, gap: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: 12, fontWeight: '500' },
  detailValue: { fontSize: 12, fontWeight: '700' },
});

```

---

## Education Financial Aid Sheet (`components/commerce/edu-financial-aid-sheet.tsx`)

```typescript
/**
 * Education Financial Aid Bottom Sheet
 *
 * 3-section tabbed: Scholarships | FAFSA | Tuition & Fees
 * Tuition section has "Make Payment" → confirm → receipt flow.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import {
  SCHOLARSHIPS,
  FMU_FAFSA,
  TUITION_RATES,
  buildEduCommerceChain,
} from '@/data/edu-commerce-data';
import type { PaymentChain } from '@/data/commerce-data';
import { Spacing, BorderRadius } from '@/constants/theme';

type Section = 'scholarships' | 'fafsa' | 'tuition';
type TuitionStage = 'browse' | 'confirm' | 'receipt';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

const ACCENT = '#14B8A6';
const SECTIONS: { id: Section; label: string }[] = [
  { id: 'scholarships', label: 'Scholarships' },
  { id: 'fafsa', label: 'FAFSA' },
  { id: 'tuition', label: 'Tuition & Fees' },
];

export function EduFinancialAidSheet({ visible, onClose, colors }: Props) {
  const [section, setSection] = useState<Section>('scholarships');
  const [tuitionStage, setTuitionStage] = useState<TuitionStage>('browse');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [chain, setChain] = useState<PaymentChain | null>(null);

  const handleClose = useCallback(() => {
    setSection('scholarships');
    setTuitionStage('browse');
    setSelectedPlan(null);
    setChain(null);
    onClose();
  }, [onClose]);

  const handleMakePayment = useCallback(() => {
    setTuitionStage('confirm');
  }, []);

  const handleConfirmPayment = useCallback(() => {
    const result = buildEduCommerceChain(
      'Tuition Payment',
      TUITION_RATES.perSemester,
      'Spring 2026 Semester Tuition',
      'TUI',
    );
    setChain(result);
    setTuitionStage('receipt');
  }, []);

  const totalFees = TUITION_RATES.fees.technology + TUITION_RATES.fees.activity + TUITION_RATES.fees.lab;

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Financial Aid" useModal>
      {/* Section toggle pills */}
      <View style={styles.pillRow}>
        {SECTIONS.map((s) => {
          const active = s.id === section;
          return (
            <Pressable
              key={s.id}
              style={[
                styles.pill,
                active
                  ? { backgroundColor: ACCENT }
                  : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth },
              ]}
              onPress={() => { setSection(s.id); setTuitionStage('browse'); setChain(null); }}
            >
              <Text style={[styles.pillText, { color: active ? '#fff' : colors.text }]}>{s.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Scholarships */}
      {section === 'scholarships' && (
        <View style={styles.container}>
          {SCHOLARSHIPS.map((sch) => (
            <View key={sch.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardName, { color: colors.text }]}>{sch.name}</Text>
                <Text style={[styles.cardAmount, { color: ACCENT }]}>${sch.amount.toLocaleString()}</Text>
              </View>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>{sch.eligibility}</Text>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Deadline: {sch.deadline}</Text>
            </View>
          ))}
        </View>
      )}

      {/* FAFSA */}
      {section === 'fafsa' && (
        <View style={styles.container}>
          <View style={[styles.codeCard, { backgroundColor: ACCENT + '15' }]}>
            <Text style={[styles.codeLabel, { color: ACCENT }]}>FMU School Code</Text>
            <Text style={[styles.codeValue, { color: colors.text }]}>{FMU_FAFSA.schoolCode}</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>DEADLINES</Text>
            <View style={styles.deadlineRow}>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Priority</Text>
              <Text style={[styles.cardMetaBold, { color: colors.text }]}>{FMU_FAFSA.priority}</Text>
            </View>
            <View style={styles.deadlineRow}>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Final</Text>
              <Text style={[styles.cardMetaBold, { color: colors.text }]}>{FMU_FAFSA.final}</Text>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>STEPS TO COMPLETE</Text>
            {FMU_FAFSA.steps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={[styles.stepNumber, { backgroundColor: ACCENT }]}>
                  <Text style={styles.stepNumberText}>{i + 1}</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.text }]}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Tuition & Fees */}
      {section === 'tuition' && tuitionStage === 'browse' && (
        <View style={styles.container}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>TUITION RATES</Text>
            <View style={styles.rateRow}>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Per Credit Hour</Text>
              <Text style={[styles.cardMetaBold, { color: colors.text }]}>${TUITION_RATES.perCreditHour}</Text>
            </View>
            <View style={styles.rateRow}>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Per Semester (15 credits)</Text>
              <Text style={[styles.cardMetaBold, { color: colors.text }]}>${TUITION_RATES.perSemester.toLocaleString()}</Text>
            </View>
            <View style={styles.rateRow}>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Annual</Text>
              <Text style={[styles.cardMetaBold, { color: colors.text }]}>${TUITION_RATES.annual.toLocaleString()}</Text>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>FEES (PER SEMESTER)</Text>
            <View style={styles.rateRow}>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Technology Fee</Text>
              <Text style={[styles.cardMetaBold, { color: colors.text }]}>${TUITION_RATES.fees.technology}</Text>
            </View>
            <View style={styles.rateRow}>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Activity Fee</Text>
              <Text style={[styles.cardMetaBold, { color: colors.text }]}>${TUITION_RATES.fees.activity}</Text>
            </View>
            <View style={styles.rateRow}>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Lab Fee</Text>
              <Text style={[styles.cardMetaBold, { color: colors.text }]}>${TUITION_RATES.fees.lab}</Text>
            </View>
            <View style={[styles.rateRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: 8, marginTop: 4 }]}>
              <Text style={[styles.cardMetaBold, { color: colors.textSecondary }]}>Total Fees</Text>
              <Text style={[styles.cardMetaBold, { color: colors.text }]}>${totalFees}</Text>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>ROOM & BOARD</Text>
            <View style={styles.rateRow}>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Annual</Text>
              <Text style={[styles.cardMetaBold, { color: colors.text }]}>${TUITION_RATES.roomAndBoard.toLocaleString()}</Text>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PAYMENT PLANS</Text>
            {TUITION_RATES.paymentPlans.map((plan) => (
              <Pressable
                key={plan.id}
                style={[
                  styles.planRow,
                  { borderColor: selectedPlan === plan.id ? ACCENT : colors.border },
                ]}
                onPress={() => setSelectedPlan(plan.id)}
              >
                <View style={[styles.radioOuter, { borderColor: selectedPlan === plan.id ? ACCENT : colors.border }]}>
                  {selectedPlan === plan.id && <View style={[styles.radioInner, { backgroundColor: ACCENT }]} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.planLabel, { color: colors.text }]}>{plan.label}</Text>
                  <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>{plan.description}</Text>
                </View>
              </Pressable>
            ))}
          </View>

          <Pressable style={[styles.ctaButton, { backgroundColor: ACCENT }]} onPress={handleMakePayment}>
            <Text style={styles.ctaButtonText}>Make Payment</Text>
          </Pressable>
        </View>
      )}

      {section === 'tuition' && tuitionStage === 'confirm' && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CONFIRM PAYMENT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Description</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>Spring 2026 Tuition</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Plan</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>
                {TUITION_RATES.paymentPlans.find((p) => p.id === selectedPlan)?.label ?? 'Full Pay'}
              </Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${TUITION_RATES.perSemester.toLocaleString()}.00</Text>
            </View>
          </View>

          <Pressable style={[styles.ctaButton, { backgroundColor: ACCENT }]} onPress={handleConfirmPayment}>
            <Text style={styles.ctaButtonText}>Confirm Payment</Text>
          </Pressable>
          <Pressable
            style={[styles.cancelButton, { borderColor: colors.border }]}
            onPress={() => setTuitionStage('browse')}
          >
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Back</Text>
          </Pressable>
        </View>
      )}

      {section === 'tuition' && tuitionStage === 'receipt' && chain && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECEIPT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Transaction</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{chain.transactionId}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${chain.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Status</Text>
              <Text style={[styles.statusText, { color: '#22C55E' }]}>Settled</Text>
            </View>
          </View>

          <View style={[styles.chainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PAYMENT CHAIN</Text>
            {chain.chain.map((step, i) => (
              <View key={i} style={styles.chainRow}>
                <View style={[styles.chainDot, { backgroundColor: '#22C55E' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.chainStage, { color: colors.text }]}>{step.stage}</Text>
                  <Text style={[styles.chainDetail, { color: colors.textSecondary }]}>{step.detail}</Text>
                </View>
              </View>
            ))}
          </View>

          <Pressable style={[styles.ctaButton, { backgroundColor: ACCENT }]} onPress={handleClose}>
            <Text style={styles.ctaButtonText}>Done</Text>
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  pillRow: { flexDirection: 'row', gap: 6, marginBottom: Spacing.sm },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full },
  pillText: { fontSize: 12, fontWeight: '600' },

  container: { gap: Spacing.md },

  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 6,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { fontSize: 14, fontWeight: '700', flex: 1 },
  cardAmount: { fontSize: 15, fontWeight: '800' },
  cardMeta: { fontSize: 12, fontWeight: '500' },
  cardMetaBold: { fontSize: 12, fontWeight: '700' },

  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },

  deadlineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  codeCard: { borderRadius: BorderRadius.lg, padding: Spacing.md, alignItems: 'center', gap: 4 },
  codeLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  codeValue: { fontSize: 28, fontWeight: '800', letterSpacing: 2 },

  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 4 },
  stepNumber: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  stepText: { fontSize: 13, fontWeight: '500', flex: 1 },

  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginTop: 4,
  },
  radioOuter: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  planLabel: { fontSize: 13, fontWeight: '700' },

  confirmCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 10,
  },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confirmLabel: { fontSize: 13, fontWeight: '500' },
  confirmValue: { fontSize: 13, fontWeight: '700' },
  amountText: { fontSize: 24, fontWeight: '800' },
  statusText: { fontSize: 13, fontWeight: '700' },

  ctaButton: { paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  ctaButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cancelButton: { borderWidth: 1, paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  cancelButtonText: { fontSize: 15, fontWeight: '600' },

  chainCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 8,
  },
  chainRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  chainDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  chainStage: { fontSize: 12, fontWeight: '700' },
  chainDetail: { fontSize: 11, fontWeight: '500', marginTop: 1 },
});

```

---

## Church Give Sheet (`components/commerce/church-give-sheet.tsx`)

```typescript
/**
 * Church Give Bottom Sheet
 *
 * 3-stage: browse (category + amount + frequency) → confirm → receipt with payment chain + EIN.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import {
  GIVING_CATEGORIES,
  GIVING_AMOUNTS,
  RECURRING_OPTIONS,
  CHURCH_EIN,
  buildChurchCommerceChain,
  type GivingCategory,
  type RecurringOption,
} from '@/data/church-commerce-data';
import type { PaymentChain } from '@/data/commerce-data';
import { Spacing, BorderRadius } from '@/constants/theme';

type Stage = 'browse' | 'confirm' | 'receipt';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

const ACCENT = '#FBBF24';

export function ChurchGiveSheet({ visible, onClose, colors }: Props) {
  const [stage, setStage] = useState<Stage>('browse');
  const [selectedCategory, setSelectedCategory] = useState<GivingCategory | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [frequency, setFrequency] = useState<RecurringOption>(RECURRING_OPTIONS[0]);
  const [chain, setChain] = useState<PaymentChain | null>(null);

  const handleClose = useCallback(() => {
    setStage('browse');
    setSelectedCategory(null);
    setAmount(null);
    setCustomAmount('');
    setFrequency(RECURRING_OPTIONS[0]);
    setChain(null);
    onClose();
  }, [onClose]);

  const resolvedAmount = amount ?? (customAmount ? parseFloat(customAmount) : 0);
  const canProceed = selectedCategory && resolvedAmount > 0;

  const handleConfirmStage = useCallback(() => {
    if (!canProceed) return;
    setStage('confirm');
  }, [canProceed]);

  const handleConfirm = useCallback(() => {
    if (!selectedCategory) return;
    const result = buildChurchCommerceChain(
      'Giving',
      resolvedAmount,
      `${selectedCategory.label} — ${frequency.label}`,
      'GIV',
    );
    setChain(result);
    setStage('receipt');
  }, [selectedCategory, resolvedAmount, frequency]);

  const handleBack = useCallback(() => {
    setStage('browse');
  }, []);

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Give" useModal>
      {stage === 'browse' && (
        <View style={styles.container}>
          {/* Category */}
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CATEGORY</Text>
          <View style={styles.pillRow}>
            {GIVING_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                style={[
                  styles.pill,
                  { borderColor: colors.border },
                  selectedCategory?.id === cat.id && { backgroundColor: ACCENT, borderColor: ACCENT },
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[
                  styles.pillText,
                  { color: colors.text },
                  selectedCategory?.id === cat.id && { color: '#000' },
                ]}>
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Amount */}
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>AMOUNT</Text>
          <View style={styles.pillRow}>
            {GIVING_AMOUNTS.map((a) => (
              <Pressable
                key={a}
                style={[
                  styles.pill,
                  { borderColor: colors.border },
                  amount === a && { backgroundColor: ACCENT, borderColor: ACCENT },
                ]}
                onPress={() => { setAmount(a); setCustomAmount(''); }}
              >
                <Text style={[
                  styles.pillText,
                  { color: colors.text },
                  amount === a && { color: '#000' },
                ]}>
                  ${a}
                </Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            style={[styles.customInput, { borderColor: colors.border, color: colors.text }]}
            placeholder="Custom amount"
            placeholderTextColor={colors.textTertiary}
            keyboardType="decimal-pad"
            value={customAmount}
            onChangeText={(v) => { setCustomAmount(v); setAmount(null); }}
          />

          {/* Frequency */}
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>FREQUENCY</Text>
          <View style={styles.pillRow}>
            {RECURRING_OPTIONS.map((opt) => (
              <Pressable
                key={opt.id}
                style={[
                  styles.pill,
                  { borderColor: colors.border },
                  frequency.id === opt.id && { backgroundColor: ACCENT, borderColor: ACCENT },
                ]}
                onPress={() => setFrequency(opt)}
              >
                <Text style={[
                  styles.pillText,
                  { color: colors.text },
                  frequency.id === opt.id && { color: '#000' },
                ]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={[styles.ctaButton, { backgroundColor: canProceed ? ACCENT : colors.border }]}
            onPress={handleConfirmStage}
            disabled={!canProceed}
          >
            <Text style={[styles.ctaButtonText, { color: canProceed ? '#000' : colors.textTertiary }]}>
              Continue
            </Text>
          </Pressable>
        </View>
      )}

      {stage === 'confirm' && selectedCategory && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CONFIRM GIFT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Category</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedCategory.label}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${resolvedAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Frequency</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{frequency.label}</Text>
            </View>
          </View>

          <Pressable style={[styles.ctaButton, { backgroundColor: ACCENT }]} onPress={handleConfirm}>
            <Text style={[styles.ctaButtonText, { color: '#000' }]}>Give ${resolvedAmount.toFixed(2)}</Text>
          </Pressable>
          <Pressable style={[styles.cancelButton, { borderColor: colors.border }]} onPress={handleBack}>
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Back</Text>
          </Pressable>
        </View>
      )}

      {stage === 'receipt' && chain && selectedCategory && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECEIPT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Transaction</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{chain.transactionId}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Category</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedCategory.label}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${chain.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Frequency</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{frequency.label}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Status</Text>
              <Text style={[styles.statusText, { color: '#22C55E' }]}>Settled</Text>
            </View>
          </View>

          {/* Payment Chain */}
          <View style={[styles.chainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PAYMENT CHAIN</Text>
            {chain.chain.map((step, i) => (
              <View key={i} style={styles.chainRow}>
                <View style={[styles.chainDot, { backgroundColor: '#22C55E' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.chainStage, { color: colors.text }]}>{step.stage}</Text>
                  <Text style={[styles.chainDetail, { color: colors.textSecondary }]}>{step.detail}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Tax Note */}
          <View style={[styles.taxNote, { backgroundColor: ACCENT + '15' }]}>
            <Text style={[styles.taxNoteText, { color: ACCENT }]}>
              Tax-deductible contribution. ICCLA EIN: {CHURCH_EIN}
            </Text>
          </View>

          <Pressable style={[styles.ctaButton, { backgroundColor: ACCENT }]} onPress={handleClose}>
            <Text style={[styles.ctaButtonText, { color: '#000' }]}>Done</Text>
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },

  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  pill: {
    borderWidth: 1, borderRadius: BorderRadius.md,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  pillText: { fontSize: 13, fontWeight: '600' },

  customInput: {
    borderWidth: 1, borderRadius: BorderRadius.md,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 15, marginBottom: 14,
  },

  confirmCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 10,
  },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confirmLabel: { fontSize: 13, fontWeight: '500' },
  confirmValue: { fontSize: 13, fontWeight: '700' },
  amountText: { fontSize: 24, fontWeight: '800' },
  statusText: { fontSize: 13, fontWeight: '700' },

  ctaButton: { paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  ctaButtonText: { fontSize: 15, fontWeight: '700' },
  cancelButton: { borderWidth: 1, paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  cancelButtonText: { fontSize: 15, fontWeight: '600' },

  chainCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 8,
  },
  chainRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  chainDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  chainStage: { fontSize: 12, fontWeight: '700' },
  chainDetail: { fontSize: 11, fontWeight: '500', marginTop: 1 },

  taxNote: {
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  taxNoteText: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
});

```

---

## Church Sermons Sheet (`components/commerce/church-sermons-sheet.tsx`)

```typescript
/**
 * Church Sermons Bottom Sheet
 *
 * Browse-only: current series card + recent sermon list with play/share.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CURRENT_SERIES, RECENT_SERMONS } from '@/data/mock-church-home';
import { Spacing, BorderRadius } from '@/constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

const ACCENT = '#FBBF24';

export function ChurchSermonsSheet({ visible, onClose, colors }: Props) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Sermons" useModal>
      <View style={styles.container}>
        {/* Current Series Card */}
        <View style={styles.seriesCard}>
          <View style={[styles.seriesAccent, { backgroundColor: CURRENT_SERIES.color }]} />
          <View style={styles.seriesContent}>
            <Text style={[styles.seriesLabel, { color: ACCENT }]}>CURRENT SERIES</Text>
            <Text style={styles.seriesName}>{CURRENT_SERIES.name}</Text>
            <Text style={styles.seriesProgress}>
              Part {CURRENT_SERIES.currentPart} of {CURRENT_SERIES.totalParts}
            </Text>
          </View>
        </View>

        {/* Recent Sermons */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECENT SERMONS</Text>
        {RECENT_SERMONS.map((sermon) => (
          <View
            key={sermon.id}
            style={[styles.sermonRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.sermonTitle, { color: colors.text }]}>{sermon.title}</Text>
              <Text style={[styles.sermonMeta, { color: colors.textSecondary }]}>
                {sermon.speaker} · {sermon.date} · {sermon.duration}
              </Text>
              {sermon.seriesName && (
                <View style={[styles.seriesBadge, { backgroundColor: ACCENT + '22' }]}>
                  <Text style={[styles.seriesBadgeText, { color: ACCENT }]}>{sermon.seriesName}</Text>
                </View>
              )}
            </View>
            <View style={styles.sermonActions}>
              <Pressable style={styles.actionBtn}>
                <IconSymbol name="play.circle.fill" size={28} color={ACCENT} />
              </Pressable>
              <Pressable style={styles.actionBtn}>
                <IconSymbol name="square.and.arrow.up" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },

  seriesCard: {
    backgroundColor: '#181616',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: 8,
  },
  seriesAccent: { height: 3 },
  seriesContent: { padding: Spacing.md },
  seriesLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  seriesName: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  seriesProgress: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },

  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },

  sermonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.sm,
    gap: 10,
  },
  sermonTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  sermonMeta: { fontSize: 11, marginBottom: 4 },
  seriesBadge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  seriesBadgeText: { fontSize: 9, fontWeight: '700' },

  sermonActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionBtn: { padding: 4 },
});

```

---

## Church Prayer Sheet (`components/commerce/church-prayer-sheet.tsx`)

```typescript
/**
 * Church Prayer Bottom Sheet
 *
 * 2-section tabbed: Submit Request + Active Requests feed.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import {
  PRAYER_REQUESTS,
  PRAYER_CATEGORY_LABELS,
  PRAYER_CATEGORY_COLORS,
  type PrayerCategory,
} from '@/data/mock-church-home';
import { Spacing, BorderRadius } from '@/constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

type TabId = 'submit' | 'requests';

const ACCENT = '#FBBF24';
const CATEGORIES = Object.keys(PRAYER_CATEGORY_LABELS) as PrayerCategory[];
const PRIVACY_OPTIONS = [
  { id: 'public' as const, label: 'Share with Church' },
  { id: 'leaders_only' as const, label: 'Leaders Only' },
  { id: 'private' as const, label: 'Private' },
];

export function ChurchPrayerSheet({ visible, onClose, colors }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('submit');
  const [requestText, setRequestText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PrayerCategory | null>(null);
  const [privacy, setPrivacy] = useState<'public' | 'leaders_only' | 'private'>('public');
  const [submitted, setSubmitted] = useState(false);
  const [prayedIds, setPrayedIds] = useState<Set<string>>(new Set());

  const handleClose = useCallback(() => {
    setActiveTab('submit');
    setRequestText('');
    setSelectedCategory(null);
    setPrivacy('public');
    setSubmitted(false);
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    setTimeout(() => {
      setRequestText('');
      setSelectedCategory(null);
      setPrivacy('public');
      setSubmitted(false);
    }, 2000);
  }, []);

  const handlePray = useCallback((id: string) => {
    setPrayedIds((prev) => new Set(prev).add(id));
  }, []);

  const canSubmit = requestText.trim().length > 0 && selectedCategory;

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Prayer" useModal>
      <View style={styles.container}>
        {/* Tab Pills */}
        <View style={styles.tabRow}>
          {(['submit', 'requests'] as TabId[]).map((tab) => (
            <Pressable
              key={tab}
              style={[
                styles.tabPill,
                { borderColor: colors.border },
                activeTab === tab && { backgroundColor: ACCENT, borderColor: ACCENT },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                styles.tabPillText,
                { color: colors.text },
                activeTab === tab && { color: '#000' },
              ]}>
                {tab === 'submit' ? 'Submit' : 'Requests'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Submit Tab */}
        {activeTab === 'submit' && (
          <View style={styles.section}>
            {submitted ? (
              <View style={styles.successBlock}>
                <Text style={styles.successText}>Prayer request submitted. We are standing with you.</Text>
              </View>
            ) : (
              <>
                <TextInput
                  style={[styles.textArea, { borderColor: colors.border, color: colors.text }]}
                  placeholder="Share your prayer request..."
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={4}
                  value={requestText}
                  onChangeText={setRequestText}
                  textAlignVertical="top"
                />

                <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CATEGORY</Text>
                <View style={styles.pillRow}>
                  {CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat}
                      style={[
                        styles.catPill,
                        { borderColor: colors.border },
                        selectedCategory === cat && {
                          backgroundColor: PRAYER_CATEGORY_COLORS[cat] + '22',
                          borderColor: PRAYER_CATEGORY_COLORS[cat],
                        },
                      ]}
                      onPress={() => setSelectedCategory(cat)}
                    >
                      <Text style={[
                        styles.catPillText,
                        { color: colors.text },
                        selectedCategory === cat && { color: PRAYER_CATEGORY_COLORS[cat] },
                      ]}>
                        {PRAYER_CATEGORY_LABELS[cat]}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PRIVACY</Text>
                <View style={styles.pillRow}>
                  {PRIVACY_OPTIONS.map((opt) => (
                    <Pressable
                      key={opt.id}
                      style={[
                        styles.catPill,
                        { borderColor: colors.border },
                        privacy === opt.id && { backgroundColor: ACCENT + '22', borderColor: ACCENT },
                      ]}
                      onPress={() => setPrivacy(opt.id)}
                    >
                      <Text style={[
                        styles.catPillText,
                        { color: colors.text },
                        privacy === opt.id && { color: ACCENT },
                      ]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Pressable
                  style={[styles.ctaButton, { backgroundColor: canSubmit ? ACCENT : colors.border }]}
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                >
                  <Text style={[styles.ctaText, { color: canSubmit ? '#000' : colors.textTertiary }]}>
                    Submit Prayer Request
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <View style={styles.section}>
            {PRAYER_REQUESTS.filter((p) => p.privacy === 'public').map((req) => (
              <View
                key={req.id}
                style={[
                  styles.requestCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  req.isPraise && { borderColor: ACCENT, borderWidth: 1.5 },
                ]}
              >
                <View style={styles.requestHeader}>
                  <Text style={[styles.requestName, { color: colors.text }]}>
                    {req.anonymous ? 'Anonymous' : req.name}
                  </Text>
                  <View style={[styles.categoryBadge, { backgroundColor: PRAYER_CATEGORY_COLORS[req.category] + '22' }]}>
                    <Text style={[styles.categoryBadgeText, { color: PRAYER_CATEGORY_COLORS[req.category] }]}>
                      {PRAYER_CATEGORY_LABELS[req.category]}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.requestText, { color: colors.textSecondary }]}>{req.text}</Text>
                <View style={styles.requestFooter}>
                  <Text style={[styles.requestDate, { color: colors.textTertiary }]}>{req.date}</Text>
                  <Pressable
                    style={[
                      styles.prayButton,
                      prayedIds.has(req.id)
                        ? { backgroundColor: ACCENT + '22' }
                        : { backgroundColor: colors.border + '44' },
                    ]}
                    onPress={() => handlePray(req.id)}
                  >
                    <Text style={[
                      styles.prayButtonText,
                      { color: prayedIds.has(req.id) ? ACCENT : colors.textSecondary },
                    ]}>
                      {prayedIds.has(req.id)
                        ? `Prayed (${req.prayerCount + 1})`
                        : `I Prayed (${req.prayerCount})`}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },

  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  tabPill: { flex: 1, borderWidth: 1, borderRadius: BorderRadius.md, paddingVertical: 8, alignItems: 'center' },
  tabPillText: { fontSize: 13, fontWeight: '700' },

  section: { gap: Spacing.sm },

  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },

  textArea: {
    borderWidth: 1, borderRadius: BorderRadius.md,
    padding: Spacing.sm, fontSize: 14,
    minHeight: 80,
  },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  catPill: { borderWidth: 1, borderRadius: BorderRadius.md, paddingHorizontal: 12, paddingVertical: 6 },
  catPillText: { fontSize: 12, fontWeight: '600' },

  ctaButton: { paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  ctaText: { fontSize: 15, fontWeight: '700' },

  successBlock: {
    backgroundColor: '#22C55E22',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  successText: { color: '#22C55E', fontSize: 14, fontWeight: '700', textAlign: 'center' },

  requestCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.sm,
    gap: 6,
  },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  requestName: { fontSize: 13, fontWeight: '700' },
  categoryBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  categoryBadgeText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  requestText: { fontSize: 13, lineHeight: 18 },
  requestFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  requestDate: { fontSize: 10 },
  prayButton: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.md },
  prayButtonText: { fontSize: 11, fontWeight: '700' },
});

```
