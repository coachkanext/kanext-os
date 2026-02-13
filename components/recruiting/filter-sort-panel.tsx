/**
 * Filter Sheet — iOS-style bottom sheet shell + reusable row components.
 * Used by recruiting page for the Global Player Graph filter panel (v1.1).
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import type { HeliocentricPosition, ClusterType } from '@/types';
import type { PoolLevel } from '@/data/playerPool';

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
  footer?: React.ReactNode;
}

export function FilterSheet({ visible, onClose, title, children, footer }: FilterSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title} footer={footer}>
      {children}
    </BottomSheet>
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
