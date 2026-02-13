/**
 * Universal Bottom Sheet — @gorhom/bottom-sheet wrapper
 *
 * iOS Detented Bottom Sheet: two snap points (50% and 100%).
 * All sheets open at 50% first. User drags up to 100% or down to dismiss.
 * Preserves the visible/onClose prop API for all consumers.
 */

import React, { useRef, useCallback, useEffect, useMemo } from 'react';
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
  const isPresented = useRef(false);

  // Bridge visible boolean → ref-based API
  useEffect(() => {
    if (visible && !isPresented.current) {
      isPresented.current = true;
      if (useModal) {
        modalRef.current?.present();
      } else {
        sheetRef.current?.snapToIndex(0);
      }
    } else if (!visible && isPresented.current) {
      isPresented.current = false;
      if (useModal) {
        modalRef.current?.dismiss();
      } else {
        sheetRef.current?.close();
      }
    }
  }, [visible, useModal]);

  // Sync dismiss back to parent state
  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1 && isPresented.current) {
        isPresented.current = false;
        onClose();
      }
    },
    [onClose],
  );

  const handleModalDismiss = useCallback(() => {
    if (isPresented.current) {
      isPresented.current = false;
      onClose();
    }
  }, [onClose]);

  const handleClose = useCallback(() => {
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
