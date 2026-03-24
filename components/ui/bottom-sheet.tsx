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
import { View, StyleSheet, Pressable, type StyleProp, type ViewStyle } from 'react-native';
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
  /** Custom snap points. Defaults to ['50%', '100%']. */
  snapPoints?: string[];
  /** Override sheet background color. Defaults to theme background. */
  backgroundColor?: string;
  /** Override the ScrollView's contentContainerStyle. */
  contentContainerStyle?: StyleProp<ViewStyle>;
}

const SNAP_POINTS = ['50%', '100%'];

export function BottomSheet({
  visible,
  onClose,
  children,
  title,
  footer,
  useModal = false,
  snapPoints: snapPointsProp,
  backgroundColor,
  contentContainerStyle: contentContainerStyleProp,
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
        // Sheet reached a valid snap point — it's fully open
        openingRef.current = false;
        hasOpenedRef.current = true;
      }
      if (index === -1) {
        // Ignore the initial -1 during opening (sheet mounts at -1)
        if (openingRef.current) return;
        // Ignore if we never actually opened
        if (!hasOpenedRef.current && !closingRef.current) return;

        // Sheet is fully closed — unmount and notify parent
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

  // Backdrop
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

  // Footer
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

  // Shared content
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
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }, contentContainerStyleProp]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </BottomSheetScrollView>
    </>
  );

  const sharedProps = {
    snapPoints: snapPointsProp ?? SNAP_POINTS,
    enablePanDownToClose: true,
    enableDynamicSizing: false,
    animationConfigs: {
      damping: 80,
      stiffness: 400,
      mass: 0.8,
      overshootClamping: false,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    },
    backdropComponent: renderBackdrop,
    footerComponent: renderFooter,
    handleIndicatorStyle: { backgroundColor: colors.border, width: 36 },
    backgroundStyle: {
      backgroundColor: backgroundColor ?? colors.background,
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

  // Don't mount the sheet at all when not needed — prevents idle gesture handlers
  // from stealing touches on underlying views (PagerView, ScrollView, etc.)
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
  headerSpacer: {
    width: 32,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerClose: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: Spacing.md,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
