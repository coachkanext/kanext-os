/**
 * BoardFilters — expandable filter chip row for the recruiting board.
 *
 * Multi-select filters (Class, Level, Position, Status):
 *   Tap sub-pill → toggle on/off (panel stays open).
 *   Tap "All" → clear selection, close panel.
 *
 * Single-select sorts (KaNeXT, Stats):
 *   Tap sub-pill → select, close panel.
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BOARD_COLUMNS, type BoardStatus } from '@/data/recruitingBoard';
import { CLUSTER_ORDER, SORT_CLUSTER_LABELS, TRAIT_LIBRARY } from '@/data/trait-library';
import { HELIO_POSITIONS, HELIO_POSITION_LABELS } from '@/data/position-mapping';
import { ARCHETYPE_OPTIONS } from '@/data/archetype-options';
import { STAT_GROUPS, STAT_META, type StatKey } from '@/data/player-stats';
import {
  AVAILABILITY_OPTIONS,
  HEIGHT_RANGES,
  WEIGHT_RANGES,
  REGION_OPTIONS,
} from '@/utils/recruiting-helpers';
import type { ClusterType, HeliocentricPosition } from '@/types';

const WHITE = '#FFFFFF';
const GRAY = '#8A8F98';
const DIVIDER = '#2A2D35';
const BG = '#0F1115';

// ── Filter state ──
// Multi-select fields use string[]; single-select sort fields use string | null.

export interface BoardFilterState {
  year: string[];
  division: string[];
  status: string[];
  position: string[];             // Helio positions (PG, CG, W, F, B)
  archetype: string | null;       // Single-select (sub-level of position)
  cluster: string | null;         // Single-select sort
  stat: StatKey | null;           // Single-select sort
  availability: string[];         // Portal, HS, JUCO, International
  region: string[];               // Southeast, Northeast, Midwest, etc.
  heightRange: [number, number] | null; // [minInches, maxInches]
  weightRange: [number, number] | null; // [minLbs, maxLbs]
}

export const DEFAULT_BOARD_FILTERS: BoardFilterState = {
  year: [],
  division: [],
  status: [],
  position: [],
  archetype: null,
  cluster: null,
  stat: null,
  availability: [],
  region: [],
  heightRange: null,
  weightRange: null,
};

// ─── Division hierarchy (canonical) ───
interface DivisionGroup {
  label: string;
  children?: { label: string; value: string }[];
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

// ─── KR group hierarchy (Off / Def → clusters) ───
type KRGroupKey = 'offense' | 'defense';

interface KRGroup {
  key: KRGroupKey;
  label: string;
  clusters: ClusterType[];
}

const KR_GROUPS: KRGroup[] = [
  { key: 'offense', label: 'Offensive KR', clusters: ['shooting', 'finishing', 'playmaking'] },
  { key: 'defense', label: 'Defensive KR', clusters: ['perimeter_defense', 'interior_defense', 'rebounding', 'frame'] },
];

// ─── Display helpers ───

function clusterDisplayLabel(val: string): string {
  if (CLUSTER_ORDER.includes(val as ClusterType)) return SORT_CLUSTER_LABELS[val as ClusterType];
  for (const group of CLUSTER_HIERARCHY) {
    const sub = group.children.find((c) => c.value === val);
    if (sub) return sub.label;
  }
  const krg = KR_GROUPS.find((g) => g.key === val);
  if (krg) return krg.label;
  return val;
}

function statDisplayLabel(val: string): string {
  const meta = STAT_META.find((m) => m.key === val);
  return meta ? meta.short : val;
}

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

function archetypeDisplayLabel(val: string): string {
  const opt = ARCHETYPE_OPTIONS.find((a) => a.value === val);
  return opt ? opt.label : val;
}

// Multi-select chip label: "Label", "value", or "Label (N)"
function multiLabel(base: string, arr: string[], displayFn?: (v: string) => string): string {
  if (arr.length === 0) return base;
  if (arr.length === 1) return displayFn ? displayFn(arr[0]) : arr[0];
  return `${base} (${arr.length})`;
}

// ─── Other filter options ───
const YEAR_OPTIONS = ['2026', '2027', '2028'];

// ─── Component ───

export interface BoardFiltersProps {
  filters: BoardFilterState;
  onFiltersChange: (filters: BoardFilterState) => void;
}

type ExpandableKey = keyof BoardFilterState | 'physical';

export function BoardFilters({ filters, onFiltersChange }: BoardFiltersProps) {
  const [expandedKey, setExpandedKey] = useState<ExpandableKey | null>(null);
  const [expandedDivGroup, setExpandedDivGroup] = useState<string | null>(null);
  const [expandedKRGroup, setExpandedKRGroup] = useState<KRGroupKey | null>(null);
  const [expandedClusterGroup, setExpandedClusterGroup] = useState<string | null>(null);
  const [expandedPosGroup, setExpandedPosGroup] = useState<string | null>(null);
  const [expandedStatGroup, setExpandedStatGroup] = useState<string | null>(null);

  const hasAnyFilter =
    filters.year.length > 0 ||
    filters.division.length > 0 ||
    filters.status.length > 0 ||
    filters.position.length > 0 ||
    filters.archetype !== null ||
    filters.cluster !== null ||
    filters.stat !== null ||
    filters.availability.length > 0 ||
    filters.region.length > 0 ||
    filters.heightRange !== null ||
    filters.weightRange !== null;

  const collapseAll = () => {
    setExpandedDivGroup(null);
    setExpandedKRGroup(null);
    setExpandedClusterGroup(null);
    setExpandedPosGroup(null);
    setExpandedStatGroup(null);
  };

  const toggleExpand = (key: ExpandableKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedKey((prev) => {
      if (prev === key) return null;
      collapseAll();
      return key;
    });
  };

  // ── Multi-select: toggle value in array, panel stays open ──
  const toggleMulti = (key: 'year' | 'division' | 'status' | 'position' | 'availability' | 'region', val: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = filters[key];
    const next = current.includes(val)
      ? current.filter((v) => v !== val)
      : [...current, val];
    onFiltersChange({ ...filters, [key]: next });
  };

  // ── Multi-select: clear array, close panel ──
  const clearMulti = (key: 'year' | 'division' | 'status' | 'position' | 'availability' | 'region') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFiltersChange({ ...filters, [key]: [] });
    setExpandedKey(null);
    collapseAll();
  };

  // ── Single-select: pick value, close panel ──
  // Cluster and stat are mutually exclusive sort chips — selecting one clears the other.
  const selectOption = (key: 'cluster' | 'stat' | 'archetype', val: string | null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updates: Partial<BoardFilterState> = { [key]: val };
    if (key === 'cluster' && val !== null) updates.stat = null;
    if (key === 'stat' && val !== null) updates.cluster = null;
    onFiltersChange({ ...filters, ...updates });
    setExpandedKey(null);
    collapseAll();
  };

  const resetAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFiltersChange({ ...DEFAULT_BOARD_FILTERS });
    setExpandedKey(null);
    collapseAll();
  };

  return (
    <View style={styles.wrapper}>
      {/* Top row: filter chips — order: Class, Level, KaNeXT, Stats, Position, Status */}
      <View style={styles.chipRow}>

        {/* Class chip (multi-select) */}
        {(() => {
          const arr = filters.year;
          const active = arr.length > 0;
          const expanded = expandedKey === 'year';
          return (
            <Pressable
              key="year"
              style={[styles.chip, active && styles.chipActive, expanded && styles.chipExpanded]}
              onPress={() => toggleExpand('year')}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
                {multiLabel('Class', arr)}
              </Text>
              <IconSymbol
                name={expanded ? 'chevron.up' : 'chevron.down'}
                size={10}
                color={active ? BG : GRAY}
              />
            </Pressable>
          );
        })()}

        {/* Level chip (multi-select, hierarchical) */}
        {(() => {
          const arr = filters.division;
          const active = arr.length > 0;
          const expanded = expandedKey === 'division';
          return (
            <Pressable
              key="division"
              style={[styles.chip, active && styles.chipActive, expanded && styles.chipExpanded]}
              onPress={() => toggleExpand('division')}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
                {multiLabel('Level', arr, divisionDisplayLabel)}
              </Text>
              <IconSymbol
                name={expanded ? 'chevron.up' : 'chevron.down'}
                size={10}
                color={active ? BG : GRAY}
              />
            </Pressable>
          );
        })()}

        {/* KaNeXT chip (single-select sort) */}
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
                {active ? clusterDisplayLabel(clusterVal!) : 'KaNeXT'}
              </Text>
              <IconSymbol
                name={expanded ? 'chevron.up' : 'chevron.down'}
                size={10}
                color={active ? BG : GRAY}
              />
            </Pressable>
          );
        })()}

        {/* Production chip (single-select sort, was "Stats") */}
        {(() => {
          const statVal = filters.stat;
          const active = statVal !== null;
          const expanded = expandedKey === 'stat';
          return (
            <Pressable
              key="stat"
              style={[styles.chip, active && styles.chipActive, expanded && styles.chipExpanded]}
              onPress={() => toggleExpand('stat')}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
                {active ? statDisplayLabel(statVal!) : 'Production'}
              </Text>
              <IconSymbol
                name={expanded ? 'chevron.up' : 'chevron.down'}
                size={10}
                color={active ? BG : GRAY}
              />
            </Pressable>
          );
        })()}

        {/* Position chip (multi-select, hierarchical) */}
        {(() => {
          const arr = filters.position;
          const archVal = filters.archetype;
          const active = arr.length > 0 || archVal !== null;
          const expanded = expandedKey === 'position';
          let label = 'Position';
          if (archVal) label = archetypeDisplayLabel(archVal);
          else if (arr.length === 1) label = arr[0];
          else if (arr.length > 1) label = `Position (${arr.length})`;
          return (
            <Pressable
              key="position"
              style={[styles.chip, active && styles.chipActive, expanded && styles.chipExpanded]}
              onPress={() => toggleExpand('position')}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
                {label}
              </Text>
              <IconSymbol
                name={expanded ? 'chevron.up' : 'chevron.down'}
                size={10}
                color={active ? BG : GRAY}
              />
            </Pressable>
          );
        })()}

        {/* Pipeline chip (multi-select, was "Status") */}
        {(() => {
          const arr = filters.status;
          const active = arr.length > 0;
          const expanded = expandedKey === 'status';
          return (
            <Pressable
              key="status"
              style={[styles.chip, active && styles.chipActive, expanded && styles.chipExpanded]}
              onPress={() => toggleExpand('status')}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
                {multiLabel('Pipeline', arr)}
              </Text>
              <IconSymbol
                name={expanded ? 'chevron.up' : 'chevron.down'}
                size={10}
                color={active ? BG : GRAY}
              />
            </Pressable>
          );
        })()}

        {/* Availability chip (multi-select) */}
        {(() => {
          const arr = filters.availability;
          const active = arr.length > 0;
          const expanded = expandedKey === 'availability';
          return (
            <Pressable
              key="availability"
              style={[styles.chip, active && styles.chipActive, expanded && styles.chipExpanded]}
              onPress={() => toggleExpand('availability')}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
                {multiLabel('Availability', arr)}
              </Text>
              <IconSymbol
                name={expanded ? 'chevron.up' : 'chevron.down'}
                size={10}
                color={active ? BG : GRAY}
              />
            </Pressable>
          );
        })()}

        {/* Physical chip (height/weight ranges) */}
        {(() => {
          const active = filters.heightRange !== null || filters.weightRange !== null;
          const expanded = expandedKey === 'physical';
          let label = 'Physical';
          if (filters.heightRange && !filters.weightRange) {
            const hr = HEIGHT_RANGES.find((r) => r.min === filters.heightRange![0] && r.max === filters.heightRange![1]);
            label = hr ? `Ht ${hr.label}` : 'Physical';
          } else if (filters.weightRange && !filters.heightRange) {
            const wr = WEIGHT_RANGES.find((r) => r.min === filters.weightRange![0] && r.max === filters.weightRange![1]);
            label = wr ? `Wt ${wr.label}` : 'Physical';
          } else if (filters.heightRange && filters.weightRange) {
            label = 'Physical (2)';
          }
          return (
            <Pressable
              key="physical"
              style={[styles.chip, active && styles.chipActive, expanded && styles.chipExpanded]}
              onPress={() => toggleExpand('physical')}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
                {label}
              </Text>
              <IconSymbol
                name={expanded ? 'chevron.up' : 'chevron.down'}
                size={10}
                color={active ? BG : GRAY}
              />
            </Pressable>
          );
        })()}

        {hasAnyFilter && (
          <Pressable style={styles.resetChip} onPress={resetAll}>
            <IconSymbol name="xmark" size={10} color={GRAY} />
          </Pressable>
        )}
      </View>

      {/* ── Class expanded (multi-select) ── */}
      {expandedKey === 'year' && (
        <View style={styles.subRow}>
          <Pressable
            style={[styles.subPill, filters.year.length === 0 && styles.subPillActive]}
            onPress={() => clearMulti('year')}
          >
            <Text style={[styles.subPillText, filters.year.length === 0 && styles.subPillTextActive]}>All</Text>
          </Pressable>
          {YEAR_OPTIONS.map((opt) => {
            const selected = filters.year.includes(opt);
            return (
              <Pressable
                key={opt}
                style={[styles.subPill, selected && styles.subPillActive]}
                onPress={() => toggleMulti('year', opt)}
              >
                <Text style={[styles.subPillText, selected && styles.subPillTextActive]}>{opt}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* ── Status expanded (multi-select) ── */}
      {expandedKey === 'status' && (
        <View style={styles.subRow}>
          <Pressable
            style={[styles.subPill, filters.status.length === 0 && styles.subPillActive]}
            onPress={() => clearMulti('status')}
          >
            <Text style={[styles.subPillText, filters.status.length === 0 && styles.subPillTextActive]}>All</Text>
          </Pressable>
          {(BOARD_COLUMNS as readonly string[]).map((opt) => {
            const selected = filters.status.includes(opt);
            return (
              <Pressable
                key={opt}
                style={[styles.subPill, selected && styles.subPillActive]}
                onPress={() => toggleMulti('status', opt)}
              >
                <Text style={[styles.subPillText, selected && styles.subPillTextActive]}>{opt}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* ── Division expanded: multi-select, two-level hierarchy ── */}
      {expandedKey === 'division' && (
        <View>
          <View style={styles.subRow}>
            <Pressable
              style={[styles.subPill, filters.division.length === 0 && styles.subPillActive]}
              onPress={() => clearMulti('division')}
            >
              <Text style={[styles.subPillText, filters.division.length === 0 && styles.subPillTextActive]}>All</Text>
            </Pressable>
            {DIVISION_HIERARCHY.map((group) => {
              const hasChildren = !!group.children;
              const isGroupActive = hasChildren
                ? filters.division.includes(group.label) || group.children!.some((c) => filters.division.includes(c.value))
                : filters.division.includes(group.value!);
              const isExpanded = expandedDivGroup === group.label;

              return (
                <Pressable
                  key={group.label}
                  style={[styles.subPill, isGroupActive && styles.subPillActive, isExpanded && styles.subPillExpanded]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    if (hasChildren) {
                      setExpandedDivGroup((prev) => (prev === group.label ? null : group.label));
                    } else {
                      toggleMulti('division', group.value!);
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

          {/* Level 2: sub-division pills */}
          {expandedDivGroup && (() => {
            const group = DIVISION_HIERARCHY.find((g) => g.label === expandedDivGroup);
            if (!group?.children) return null;
            const allValue = group.label;
            const isAllSelected = filters.division.includes(allValue);
            return (
              <View style={styles.subSubRow}>
                <Text style={styles.subSubLabel}>{group.label}</Text>
                <Pressable
                  style={[styles.subPill, isAllSelected && styles.subPillActive]}
                  onPress={() => toggleMulti('division', allValue)}
                >
                  <Text style={[styles.subPillText, isAllSelected && styles.subPillTextActive]}>All</Text>
                </Pressable>
                {group.children.map((child) => {
                  const selected = filters.division.includes(child.value);
                  return (
                    <Pressable
                      key={child.value}
                      style={[styles.subPill, selected && styles.subPillActive]}
                      onPress={() => toggleMulti('division', child.value)}
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

      {/* ── Cluster expanded: single-select, three-level hierarchy ── */}
      {expandedKey === 'cluster' && (() => {
        const clusterVal = filters.cluster;
        return (
          <View>
            <View style={styles.subRow}>
              <Pressable
                style={[styles.subPill, clusterVal === null && !expandedKRGroup && styles.subPillActive]}
                onPress={() => selectOption('cluster', null)}
              >
                <Text style={[styles.subPillText, clusterVal === null && !expandedKRGroup && styles.subPillTextActive]}>All</Text>
              </Pressable>
              {KR_GROUPS.map((krg) => {
                const isKRActive = krg.clusters.includes(clusterVal as ClusterType) ||
                  CLUSTER_HIERARCHY.filter((g) => krg.clusters.includes(g.key)).some((g) => g.children.some((c) => c.value === clusterVal));
                const isExpanded = expandedKRGroup === krg.key;
                return (
                  <Pressable
                    key={krg.key}
                    style={[styles.subPill, isKRActive && styles.subPillActive, isExpanded && styles.subPillExpanded]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setExpandedClusterGroup(null);
                      setExpandedKRGroup((prev) => (prev === krg.key ? null : krg.key));
                    }}
                  >
                    <Text style={[styles.subPillText, isKRActive && styles.subPillTextActive]}>
                      {krg.label}
                    </Text>
                    <IconSymbol
                      name={isExpanded ? 'chevron.up' : 'chevron.down'}
                      size={9}
                      color={isKRActive ? BG : GRAY}
                    />
                  </Pressable>
                );
              })}
            </View>

            {expandedKRGroup && (() => {
              const krGroup = KR_GROUPS.find((g) => g.key === expandedKRGroup)!;
              const groupClusters = CLUSTER_HIERARCHY.filter((g) => krGroup.clusters.includes(g.key));
              return (
                <View style={styles.subSubRow}>
                  <Text style={styles.subSubLabel}>{krGroup.label}</Text>
                  {groupClusters.map((group) => {
                    const isGroupActive = clusterVal === group.key || group.children.some((c) => c.value === clusterVal);
                    const isExpanded = expandedClusterGroup === group.key;
                    return (
                      <Pressable
                        key={group.key}
                        style={[styles.subPill, isGroupActive && styles.subPillActive, isExpanded && styles.subPillExpanded]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          if (isExpanded) {
                            setExpandedClusterGroup(null);
                            selectOption('cluster', isGroupActive ? null : group.key);
                          } else {
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
              );
            })()}

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

      {/* ── Stats expanded: single-select, two-level hierarchy ── */}
      {expandedKey === 'stat' && (() => {
        const statVal = filters.stat;
        return (
          <View>
            <View style={styles.subRow}>
              <Pressable
                style={[styles.subPill, statVal === null && !expandedStatGroup && styles.subPillActive]}
                onPress={() => selectOption('stat', null)}
              >
                <Text style={[styles.subPillText, statVal === null && !expandedStatGroup && styles.subPillTextActive]}>All</Text>
              </Pressable>
              {STAT_GROUPS.map((sg) => {
                const isGroupActive = sg.stats.includes(statVal as StatKey);
                const isExpanded = expandedStatGroup === sg.key;
                return (
                  <Pressable
                    key={sg.key}
                    style={[styles.subPill, isGroupActive && styles.subPillActive, isExpanded && styles.subPillExpanded]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setExpandedStatGroup((prev) => (prev === sg.key ? null : sg.key));
                    }}
                  >
                    <Text style={[styles.subPillText, isGroupActive && styles.subPillTextActive]}>
                      {sg.label}
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

            {expandedStatGroup && (() => {
              const sg = STAT_GROUPS.find((g) => g.key === expandedStatGroup);
              if (!sg) return null;
              return (
                <View style={styles.subSubRow}>
                  <Text style={styles.subSubLabel}>{sg.label}</Text>
                  {sg.stats.map((sk) => {
                    const meta = STAT_META.find((m) => m.key === sk);
                    if (!meta) return null;
                    const selected = statVal === sk;
                    return (
                      <Pressable
                        key={sk}
                        style={[styles.subPill, selected && styles.subPillActive]}
                        onPress={() => selectOption('stat', selected ? null : sk)}
                      >
                        <Text style={[styles.subPillText, selected && styles.subPillTextActive]}>
                          {meta.short}
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

      {/* ── Availability expanded (multi-select) ── */}
      {expandedKey === 'availability' && (
        <View style={styles.subRow}>
          <Pressable
            style={[styles.subPill, filters.availability.length === 0 && styles.subPillActive]}
            onPress={() => clearMulti('availability')}
          >
            <Text style={[styles.subPillText, filters.availability.length === 0 && styles.subPillTextActive]}>All</Text>
          </Pressable>
          {AVAILABILITY_OPTIONS.map((opt) => {
            const selected = filters.availability.includes(opt);
            return (
              <Pressable
                key={opt}
                style={[styles.subPill, selected && styles.subPillActive]}
                onPress={() => toggleMulti('availability', opt)}
              >
                <Text style={[styles.subPillText, selected && styles.subPillTextActive]}>{opt}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* ── Physical expanded (height + weight pill ranges) ── */}
      {expandedKey === 'physical' && (
        <View>
          <View style={styles.subRow}>
            <Text style={styles.subSubLabel}>Height</Text>
            <Pressable
              style={[styles.subPill, filters.heightRange === null && styles.subPillActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onFiltersChange({ ...filters, heightRange: null });
              }}
            >
              <Text style={[styles.subPillText, filters.heightRange === null && styles.subPillTextActive]}>All</Text>
            </Pressable>
            {HEIGHT_RANGES.map((r) => {
              const selected = filters.heightRange !== null && filters.heightRange[0] === r.min && filters.heightRange[1] === r.max;
              return (
                <Pressable
                  key={r.label}
                  style={[styles.subPill, selected && styles.subPillActive]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onFiltersChange({ ...filters, heightRange: selected ? null : [r.min, r.max] });
                  }}
                >
                  <Text style={[styles.subPillText, selected && styles.subPillTextActive]}>{r.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.subRow}>
            <Text style={styles.subSubLabel}>Weight</Text>
            <Pressable
              style={[styles.subPill, filters.weightRange === null && styles.subPillActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onFiltersChange({ ...filters, weightRange: null });
              }}
            >
              <Text style={[styles.subPillText, filters.weightRange === null && styles.subPillTextActive]}>All</Text>
            </Pressable>
            {WEIGHT_RANGES.map((r) => {
              const selected = filters.weightRange !== null && filters.weightRange[0] === r.min && filters.weightRange[1] === r.max;
              return (
                <Pressable
                  key={r.label}
                  style={[styles.subPill, selected && styles.subPillActive]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onFiltersChange({ ...filters, weightRange: selected ? null : [r.min, r.max] });
                  }}
                >
                  <Text style={[styles.subPillText, selected && styles.subPillTextActive]}>{r.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* ── Position expanded: multi-select, with archetype sub-level ── */}
      {expandedKey === 'position' && (() => {
        const posArr = filters.position;
        const archVal = filters.archetype;
        return (
          <View>
            <View style={styles.subRow}>
              <Pressable
                style={[styles.subPill, posArr.length === 0 && archVal === null && styles.subPillActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onFiltersChange({ ...filters, position: [], archetype: null });
                  setExpandedKey(null);
                  setExpandedPosGroup(null);
                }}
              >
                <Text style={[styles.subPillText, posArr.length === 0 && archVal === null && styles.subPillTextActive]}>All</Text>
              </Pressable>
              {HELIO_POSITIONS.map((pos) => {
                const isActive = posArr.includes(pos);
                const isExpanded = expandedPosGroup === pos;
                return (
                  <Pressable
                    key={pos}
                    style={[styles.subPill, isActive && styles.subPillActive, isExpanded && styles.subPillExpanded]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      if (isExpanded) {
                        // Collapse archetype sub-level, toggle position
                        setExpandedPosGroup(null);
                        toggleMulti('position', pos);
                      } else {
                        // Expand to show archetypes for this position
                        setExpandedPosGroup(pos);
                        // Ensure this position is selected
                        if (!posArr.includes(pos)) {
                          onFiltersChange({ ...filters, position: [...posArr, pos], archetype: null });
                        }
                      }
                    }}
                  >
                    <Text style={[styles.subPillText, isActive && styles.subPillTextActive]}>
                      {pos}
                    </Text>
                    <IconSymbol
                      name={isExpanded ? 'chevron.up' : 'chevron.down'}
                      size={9}
                      color={isActive ? BG : GRAY}
                    />
                  </Pressable>
                );
              })}
            </View>

            {expandedPosGroup && (
              <View style={styles.subSubRow}>
                <Text style={styles.subSubLabel}>{HELIO_POSITION_LABELS[expandedPosGroup as HeliocentricPosition]}</Text>
                <Pressable
                  style={[styles.subPill, archVal === null && styles.subPillActive]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onFiltersChange({ ...filters, archetype: null });
                  }}
                >
                  <Text style={[styles.subPillText, archVal === null && styles.subPillTextActive]}>All</Text>
                </Pressable>
                {ARCHETYPE_OPTIONS.map((arch) => {
                  const selected = archVal === arch.value;
                  return (
                    <Pressable
                      key={arch.value}
                      style={[styles.subPill, selected && styles.subPillActive]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        onFiltersChange({ ...filters, archetype: selected ? null : arch.value });
                      }}
                    >
                      <Text style={[styles.subPillText, selected && styles.subPillTextActive]} numberOfLines={1}>
                        {arch.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
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
