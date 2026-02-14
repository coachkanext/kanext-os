/**
 * BoardFilters — expandable filter chip row for the recruiting board.
 * Tap a chip to expand it inline, showing selectable sub-pills beneath.
 * Division has two levels: tap a governing body with children (NCAA, JUCO, NCCAA)
 * to reveal its sub-divisions (D1, D2, D3).
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BOARD_COLUMNS, type BoardStatus } from '@/data/recruitingBoard';
import { CLUSTER_ORDER, SORT_CLUSTER_LABELS, TRAIT_LIBRARY } from '@/data/trait-library';
import type { ClusterType } from '@/types';

const WHITE = '#FFFFFF';
const GRAY = '#8A8F98';
const DIVIDER = '#2A2D35';
const BG = '#0F1115';

export interface BoardFilterState {
  year: string | null;
  division: string | null;
  status: BoardStatus | null;
  position: string | null;
  cluster: string | null;
}

export const DEFAULT_BOARD_FILTERS: BoardFilterState = {
  year: null,
  division: null,
  status: null,
  position: null,
  cluster: null,
};

// ─── Division hierarchy (canonical) ───
interface DivisionGroup {
  label: string;
  /** If children exist, tapping the parent expands to show them. */
  children?: { label: string; value: string }[];
  /** Direct filter value when no children (e.g. NAIA → 'NAIA') */
  value?: string;
}

const DIVISION_HIERARCHY: DivisionGroup[] = [
  { label: 'NCAA', children: [
    { label: 'D1', value: 'NCAA D1' },
    { label: 'D2', value: 'NCAA D2' },
    { label: 'D3', value: 'NCAA D3' },
  ]},
  { label: 'NAIA', value: 'NAIA' },
  { label: 'JUCO', children: [
    { label: 'D1', value: 'JUCO D1' },
    { label: 'D2', value: 'JUCO D2' },
    { label: 'D3', value: 'JUCO D3' },
  ]},
  { label: 'USCAA', value: 'USCAA' },
  { label: 'NCCAA', children: [
    { label: 'D1', value: 'NCCAA D1' },
    { label: 'D2', value: 'NCCAA D2' },
  ]},
  { label: '3C2A', value: '3C2A' },
  { label: 'High School', value: 'HS' },
  { label: 'International', value: 'International' },
];

// ─── Cluster hierarchy (canonical) ───
interface ClusterGroup {
  label: string;
  key: ClusterType;
  children: { label: string; value: string }[];
}

const CLUSTER_HIERARCHY: ClusterGroup[] = CLUSTER_ORDER.map((key) => ({
  label: SORT_CLUSTER_LABELS[key],
  key,
  children: TRAIT_LIBRARY[key].map((sub) => ({ label: sub.label, value: sub.id })),
}));

// Display label for the cluster chip when a value is selected
function clusterDisplayLabel(val: string): string {
  // Check if it's a cluster key
  if (CLUSTER_ORDER.includes(val as ClusterType)) {
    return SORT_CLUSTER_LABELS[val as ClusterType];
  }
  // Check subclusters
  for (const group of CLUSTER_HIERARCHY) {
    const sub = group.children.find((c) => c.value === val);
    if (sub) return sub.label;
  }
  return val;
}

// ─── Other filter options ───
const YEAR_OPTIONS = ['2026', '2027', '2028'];
const POSITION_OPTIONS = ['PG', 'SG', 'SF', 'PF', 'C'];

interface FilterChipDef {
  key: keyof BoardFilterState;
  label: string;
  options: string[];
}

const SIMPLE_CHIPS: FilterChipDef[] = [
  { key: 'year', label: 'Year', options: YEAR_OPTIONS },
  { key: 'status', label: 'Status', options: BOARD_COLUMNS as unknown as string[] },
  { key: 'position', label: 'Position', options: POSITION_OPTIONS },
];

// Display label for the division chip when a value is selected
function divisionDisplayLabel(val: string): string {
  for (const group of DIVISION_HIERARCHY) {
    if (group.value === val) return group.label;
    if (group.children) {
      const child = group.children.find((c) => c.value === val);
      if (child) return `${group.label} ${child.label}`;
    }
  }
  return val;
}

export interface BoardFiltersProps {
  filters: BoardFilterState;
  onFiltersChange: (filters: BoardFilterState) => void;
}

export function BoardFilters({ filters, onFiltersChange }: BoardFiltersProps) {
  const [expandedKey, setExpandedKey] = useState<keyof BoardFilterState | null>(null);
  // For division: which parent group is expanded to show children
  const [expandedDivGroup, setExpandedDivGroup] = useState<string | null>(null);
  // For cluster: which cluster is expanded to show subclusters
  const [expandedClusterGroup, setExpandedClusterGroup] = useState<string | null>(null);
  const hasAnyFilter = Object.values(filters).some((v) => v !== null);

  const toggleExpand = (key: keyof BoardFilterState) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedKey((prev) => {
      if (prev === key) return null;
      setExpandedDivGroup(null);
      setExpandedClusterGroup(null);
      return key;
    });
  };

  const selectOption = (key: keyof BoardFilterState, val: string | null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFiltersChange({ ...filters, [key]: val });
    setExpandedKey(null);
    setExpandedDivGroup(null);
    setExpandedClusterGroup(null);
  };

  const resetAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFiltersChange({ ...DEFAULT_BOARD_FILTERS });
    setExpandedKey(null);
    setExpandedDivGroup(null);
    setExpandedClusterGroup(null);
  };

  const divVal = filters.division;

  return (
    <View style={styles.wrapper}>
      {/* Top row: filter chips */}
      <View style={styles.chipRow}>
        {/* Division chip (special — hierarchical) */}
        {(() => {
          const active = divVal !== null;
          const expanded = expandedKey === 'division';
          return (
            <Pressable
              key="division"
              style={[styles.chip, active && styles.chipActive, expanded && styles.chipExpanded]}
              onPress={() => toggleExpand('division')}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
                {active ? divisionDisplayLabel(divVal!) : 'Division'}
              </Text>
              <IconSymbol
                name={expanded ? 'chevron.up' : 'chevron.down'}
                size={10}
                color={active ? BG : GRAY}
              />
            </Pressable>
          );
        })()}

        {/* Cluster chip (special — hierarchical) */}
        {(() => {
          const clusterVal = filters.cluster;
          const active = clusterVal !== null;
          const expanded = expandedKey === 'cluster';
          return (
            <Pressable
              key="cluster"
              style={[styles.chip, active && styles.chipActive, expanded && styles.chipExpanded]}
              onPress={() => toggleExpand('cluster')}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
                {active ? clusterDisplayLabel(clusterVal!) : 'Cluster'}
              </Text>
              <IconSymbol
                name={expanded ? 'chevron.up' : 'chevron.down'}
                size={10}
                color={active ? BG : GRAY}
              />
            </Pressable>
          );
        })()}

        {/* Simple chips */}
        {SIMPLE_CHIPS.map((chip) => {
          const val = filters[chip.key];
          const active = val !== null;
          const expanded = expandedKey === chip.key;
          return (
            <Pressable
              key={chip.key}
              style={[styles.chip, active && styles.chipActive, expanded && styles.chipExpanded]}
              onPress={() => toggleExpand(chip.key)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
                {active ? val : chip.label}
              </Text>
              <IconSymbol
                name={expanded ? 'chevron.up' : 'chevron.down'}
                size={10}
                color={active ? BG : GRAY}
              />
            </Pressable>
          );
        })}

        {hasAnyFilter && (
          <Pressable style={styles.resetChip} onPress={resetAll}>
            <IconSymbol name="xmark" size={10} color={GRAY} />
          </Pressable>
        )}
      </View>

      {/* ── Division expanded: two-level hierarchy ── */}
      {expandedKey === 'division' && (
        <View>
          {/* Level 1: governing body pills */}
          <View style={styles.subRow}>
            <Pressable
              style={[styles.subPill, divVal === null && styles.subPillActive]}
              onPress={() => selectOption('division', null)}
            >
              <Text style={[styles.subPillText, divVal === null && styles.subPillTextActive]}>All</Text>
            </Pressable>
            {DIVISION_HIERARCHY.map((group) => {
              const hasChildren = !!group.children;
              // Active if this group, its "all" value, or one of its children is selected
              const isGroupActive = hasChildren
                ? divVal === group.label || group.children!.some((c) => c.value === divVal)
                : group.value === divVal;
              const isExpanded = expandedDivGroup === group.label;

              return (
                <Pressable
                  key={group.label}
                  style={[styles.subPill, isGroupActive && styles.subPillActive, isExpanded && styles.subPillExpanded]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    if (hasChildren) {
                      // Toggle sub-level expansion
                      setExpandedDivGroup((prev) => (prev === group.label ? null : group.label));
                    } else {
                      // Direct select
                      selectOption('division', isGroupActive ? null : group.value!);
                    }
                  }}
                >
                  <Text style={[styles.subPillText, isGroupActive && styles.subPillTextActive]}>
                    {group.label}
                  </Text>
                  {hasChildren && (
                    <IconSymbol
                      name={isExpanded ? 'chevron.up' : 'chevron.down'}
                      size={9}
                      color={isGroupActive ? BG : GRAY}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Level 2: sub-division pills (e.g. All / D1 / D2 / D3) */}
          {expandedDivGroup && (() => {
            const group = DIVISION_HIERARCHY.find((g) => g.label === expandedDivGroup);
            if (!group?.children) return null;
            const allValue = group.label; // e.g. 'NCAA' matches all NCAA sub-levels
            const isAllSelected = divVal === allValue;
            return (
              <View style={styles.subSubRow}>
                <Text style={styles.subSubLabel}>{group.label}</Text>
                <Pressable
                  style={[styles.subPill, isAllSelected && styles.subPillActive]}
                  onPress={() => selectOption('division', isAllSelected ? null : allValue)}
                >
                  <Text style={[styles.subPillText, isAllSelected && styles.subPillTextActive]}>All</Text>
                </Pressable>
                {group.children.map((child) => {
                  const selected = divVal === child.value;
                  return (
                    <Pressable
                      key={child.value}
                      style={[styles.subPill, selected && styles.subPillActive]}
                      onPress={() => selectOption('division', selected ? null : child.value)}
                    >
                      <Text style={[styles.subPillText, selected && styles.subPillTextActive]}>
                        {child.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            );
          })()}
        </View>
      )}

      {/* ── Cluster expanded: two-level hierarchy ── */}
      {expandedKey === 'cluster' && (() => {
        const clusterVal = filters.cluster;
        return (
          <View>
            {/* Level 1: cluster pills */}
            <View style={styles.subRow}>
              <Pressable
                style={[styles.subPill, clusterVal === null && styles.subPillActive]}
                onPress={() => selectOption('cluster', null)}
              >
                <Text style={[styles.subPillText, clusterVal === null && styles.subPillTextActive]}>All</Text>
              </Pressable>
              {CLUSTER_HIERARCHY.map((group) => {
                const isGroupActive = clusterVal === group.key || group.children.some((c) => c.value === clusterVal);
                const isExpanded = expandedClusterGroup === group.key;

                return (
                  <Pressable
                    key={group.key}
                    style={[styles.subPill, isGroupActive && styles.subPillActive, isExpanded && styles.subPillExpanded]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      if (isExpanded) {
                        // Collapse and select the cluster itself
                        setExpandedClusterGroup(null);
                        selectOption('cluster', isGroupActive ? null : group.key);
                      } else {
                        // Expand to show subclusters
                        setExpandedClusterGroup(group.key);
                      }
                    }}
                  >
                    <Text style={[styles.subPillText, isGroupActive && styles.subPillTextActive]}>
                      {group.label}
                    </Text>
                    <IconSymbol
                      name={isExpanded ? 'chevron.up' : 'chevron.down'}
                      size={9}
                      color={isGroupActive ? BG : GRAY}
                    />
                  </Pressable>
                );
              })}
            </View>

            {/* Level 2: subcluster pills */}
            {expandedClusterGroup && (() => {
              const group = CLUSTER_HIERARCHY.find((g) => g.key === expandedClusterGroup);
              if (!group) return null;
              const isAllSelected = clusterVal === group.key;
              return (
                <View style={styles.subSubRow}>
                  <Text style={styles.subSubLabel}>{group.label}</Text>
                  <Pressable
                    style={[styles.subPill, isAllSelected && styles.subPillActive]}
                    onPress={() => selectOption('cluster', isAllSelected ? null : group.key)}
                  >
                    <Text style={[styles.subPillText, isAllSelected && styles.subPillTextActive]}>All</Text>
                  </Pressable>
                  {group.children.map((child) => {
                    const selected = clusterVal === child.value;
                    return (
                      <Pressable
                        key={child.value}
                        style={[styles.subPill, selected && styles.subPillActive]}
                        onPress={() => selectOption('cluster', selected ? null : child.value)}
                      >
                        <Text style={[styles.subPillText, selected && styles.subPillTextActive]}>
                          {child.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              );
            })()}
          </View>
        );
      })()}

      {/* ── Simple chip expanded sub-pills ── */}
      {expandedKey && expandedKey !== 'division' && expandedKey !== 'cluster' && (() => {
        const chip = SIMPLE_CHIPS.find((c) => c.key === expandedKey)!;
        if (!chip) return null;
        const currentVal = filters[expandedKey];
        return (
          <View style={styles.subRow}>
            <Pressable
              style={[styles.subPill, currentVal === null && styles.subPillActive]}
              onPress={() => selectOption(expandedKey, null)}
            >
              <Text style={[styles.subPillText, currentVal === null && styles.subPillTextActive]}>All</Text>
            </Pressable>
            {chip.options.map((opt) => {
              const selected = currentVal === opt;
              return (
                <Pressable
                  key={opt}
                  style={[styles.subPill, selected && styles.subPillActive]}
                  onPress={() => selectOption(expandedKey, selected ? null : opt)}
                >
                  <Text style={[styles.subPillText, selected && styles.subPillTextActive]}>{opt}</Text>
                </Pressable>
              );
            })}
          </View>
        );
      })()}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#2A2D35',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  chipActive: {
    backgroundColor: WHITE,
  },
  chipExpanded: {
    borderWidth: 1.5,
    borderColor: '#4A4D55',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: GRAY,
  },
  chipTextActive: {
    color: BG,
  },
  resetChip: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#4A4D55',
  },
  subRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: DIVIDER,
  },
  subPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#1A1D23',
    borderWidth: 1,
    borderColor: '#2A2D35',
  },
  subPillActive: {
    backgroundColor: WHITE,
    borderColor: WHITE,
  },
  subPillExpanded: {
    borderColor: '#4A4D55',
    borderWidth: 1.5,
  },
  subPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: GRAY,
  },
  subPillTextActive: {
    color: BG,
  },
  subSubRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  subSubLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: GRAY,
    letterSpacing: 0.5,
    marginRight: 2,
  },
});
