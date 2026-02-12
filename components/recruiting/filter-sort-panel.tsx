/**
 * Filter Sheet — iOS-style bottom sheet shell + reusable row components.
 * Used by recruiting page for the Global Player Graph filter panel (v1.1).
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing } from '@/constants/theme';
import type { HeliocentricPosition, ClusterType } from '@/types';
import type { PoolLevel } from '@/data/playerPool';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const BG = '#0F1115';
const CARD_BG = '#1A1D23';
const WHITE = '#FFFFFF';
const GRAY = '#8A8F98';
const DIVIDER = '#2A2D35';

// ─── Filter State ───

export interface NationalPoolFilters {
  division: PoolLevel[];
  conference: string | null;
  teams: string[];
  positions: HeliocentricPosition[];
  sortCluster: ClusterType | null;
  sortSubTrait: string | null;
  search: string;
}

export const DEFAULT_FILTERS: NationalPoolFilters = {
  division: [],
  conference: null,
  teams: [],
  positions: [],
  sortCluster: null,
  sortSubTrait: null,
  search: '',
};

// ─── Generic Filter Sheet ───

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  height?: number;
  footer?: React.ReactNode;
}

export function FilterSheet({ visible, onClose, title, children, height, footer }: FilterSheetProps) {
  const insets = useSafeAreaInsets();
  const sheetHeight = height ?? Math.round(SCREEN_HEIGHT * 0.60);
  const slideAnim = useRef(new Animated.Value(sheetHeight)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(sheetHeight);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 22,
          stiffness: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: sheetHeight,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim, sheetHeight]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.scrim, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          {
            height: sheetHeight,
            paddingBottom: insets.bottom,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        <View style={styles.header}>
          <View style={styles.headerBtn} />
          <ThemedText style={styles.headerTitle}>{title}</ThemedText>
          <Pressable style={styles.headerBtn} onPress={onClose}>
            <IconSymbol name="xmark" size={16} color={GRAY} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>

        {footer && (
          <View style={[styles.footer, { paddingBottom: insets.bottom + 8 }]}>
            {footer}
          </View>
        )}
      </Animated.View>
    </View>
  );
}

// ─── Reusable Row Components ───

export function SectionHeader({
  label,
  expanded,
  onToggle,
  summary,
}: {
  label: string;
  expanded: boolean;
  onToggle: () => void;
  summary?: string;
}) {
  return (
    <Pressable style={styles.sectionHeader} onPress={onToggle}>
      <ThemedText style={styles.sectionLabel}>{label}</ThemedText>
      {summary && (
        <View style={styles.summaryPill}>
          <ThemedText style={styles.summaryPillText}>{summary}</ThemedText>
        </View>
      )}
    </Pressable>
  );
}

export function RadioRow({
  label,
  selected,
  hasChevron,
  subtitle,
  onPress,
  indent,
}: {
  label: string;
  selected: boolean;
  hasChevron?: boolean;
  subtitle?: string;
  onPress: () => void;
  indent?: boolean;
}) {
  return (
    <Pressable style={[styles.radioRow, indent && styles.indentedRow]} onPress={onPress}>
      <View style={styles.radioRowLeft}>
        <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
          {selected && <View style={styles.radioDot} />}
        </View>
        <View>
          <ThemedText style={[styles.radioLabel, selected && styles.radioLabelSelected]}>
            {label}
          </ThemedText>
          {subtitle && (
            <ThemedText style={styles.radioSubtitle}>{subtitle}</ThemedText>
          )}
        </View>
      </View>
      {hasChevron && (
        <IconSymbol name="chevron.down" size={14} color={GRAY} />
      )}
    </Pressable>
  );
}

export function CheckboxRow({
  label,
  checked,
  onPress,
  indent,
}: {
  label: string;
  checked: boolean;
  onPress: () => void;
  indent?: boolean;
}) {
  return (
    <Pressable style={[styles.checkboxRow, indent && styles.indentedRow]} onPress={onPress}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <IconSymbol name="checkmark" size={12} color={BG} />}
      </View>
      <ThemedText style={[styles.checkboxLabel, checked && styles.checkboxLabelChecked]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

export function ConferenceRow({
  label,
  teamCount,
  expanded,
  onToggle,
}: {
  label: string;
  teamCount: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable style={styles.conferenceRow} onPress={onToggle}>
      <ThemedText style={styles.conferenceLabel}>{label}</ThemedText>
      <View style={styles.conferenceRight}>
        <ThemedText style={styles.conferenceCount}>{teamCount} Teams</ThemedText>
        <IconSymbol
          name={expanded ? 'chevron.up' : 'chevron.down'}
          size={12}
          color={GRAY}
        />
      </View>
    </Pressable>
  );
}

// ─── Styles ───

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: CARD_BG,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: DIVIDER,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DIVIDER,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: WHITE,
    flex: 1,
    textAlign: 'center',
  },
  headerBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: Spacing.md,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: DIVIDER,
  },

  // Section header (accordion)
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DIVIDER,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: WHITE,
  },
  summaryPill: {
    backgroundColor: '#2A2D35',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  summaryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: GRAY,
  },

  // Radio rows
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DIVIDER,
  },
  radioRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: GRAY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: WHITE,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: WHITE,
  },
  radioLabel: {
    fontSize: 14,
    color: WHITE,
  },
  radioLabelSelected: {
    fontWeight: '600',
  },
  radioSubtitle: {
    fontSize: 11,
    color: GRAY,
    marginTop: 2,
  },

  // Checkbox rows
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DIVIDER,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: GRAY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: WHITE,
    borderColor: WHITE,
  },
  checkboxLabel: {
    fontSize: 14,
    color: WHITE,
  },
  checkboxLabelChecked: {
    fontWeight: '600',
  },

  // Indented rows (nested content)
  indentedRow: {
    paddingLeft: 16,
  },

  // Conference rows
  conferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DIVIDER,
  },
  conferenceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: WHITE,
  },
  conferenceRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  conferenceCount: {
    fontSize: 12,
    color: GRAY,
  },
});
