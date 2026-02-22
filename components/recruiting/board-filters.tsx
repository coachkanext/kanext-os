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
  BADGE_LEVELS,
  BADGE_LEVEL_COLORS,
  OFFENSIVE_BADGE_NAMES,
  DEFENSIVE_BADGE_NAMES,
  type BadgeLevel,
} from '@/utils/player-badges';
import {
  HEIGHT_RANGES,
  WEIGHT_RANGES,
  WINGSPAN_RANGES,
  VERTICAL_RANGES,
  REGION_OPTIONS,
  getPlayerRegion,
} from '@/utils/recruiting-helpers';
import { ROSTER } from '@/components/roster-content';
import type { ClusterType, HeliocentricPosition } from '@/types';
import { useAccentColor } from '@/hooks/use-accent-color';

const WHITE = '#FFFFFF';
const GRAY = '#A1A1AA';
const DIVIDER = '#0B0F14';
const BG = '#0B0F14';

// ── Filter state ──
// Multi-select fields use string[]; single-select sort fields use string | null.

export interface BoardFilterState {
  tier: string[];                 // KR tier labels (multi-select)
  year: string[];
  division: string[];
  status: string[];
  position: string[];             // Helio positions (PG, CG, W, F, B)
  archetype: string | null;       // Single-select (sub-level of position)
  cluster: string | null;         // Single-select sort
  stat: StatKey | null;           // Single-select sort
  region: string[];               // Southeast, Northeast, Midwest, etc.
  heightRange: [number, number] | null; // [minInches, maxInches]
  weightRange: [number, number] | null; // [minLbs, maxLbs]
  wingspanRange: [number, number] | null; // [minInches, maxInches]
  verticalRange: [number, number] | null; // [minInches, maxInches]
  badge: string[];                        // Badge names (multi-select)
  badgeLevel: string[];                   // Badge levels: Gold, Silver, Bronze (multi-select)
}

export const DEFAULT_BOARD_FILTERS: BoardFilterState = {
  tier: [],
  year: [],
  division: [],
  status: [],
  position: [],
  archetype: null,
  cluster: null,
  stat: null,
  region: [],
  heightRange: null,
  weightRange: null,
  wingspanRange: null,
  verticalRange: null,
  badge: [],
  badgeLevel: [],
};

// ── NAIA KR Tiers (canonical spec) ──
export interface KRTier {
  label: string;
  short: string;
  min: number;
  max: number;
  color: string;
}

/**
 * Division-contextual KR tier legends.
 * Same KR ranges everywhere — labels describe what that output means at each level.
 * The program's division determines which legend is active.
 */
export type DivisionAnchor = 'high_major' | 'mid_major' | 'low_major' | 'naia' | 'juco';

const TIER_RANGES: { short: string; min: number; max: number; color: string }[] = [
  { short: 'Elite', min: 86, max: 100, color: '#1D9BF0' },
  { short: 'Franchise', min: 82, max: 85, color: '#22C55E' },
  { short: 'Impact', min: 78, max: 81, color: '#1D9BF0' },
  { short: 'Starter', min: 74, max: 77, color: '#1D9BF0' },
  { short: 'Rotation', min: 71, max: 73, color: '#1D9BF0' },
  { short: 'Bench', min: 68, max: 70, color: '#F59E0B' },
  { short: 'Depth', min: 65, max: 67, color: '#A1A1AA' },
  { short: 'Project', min: 0, max: 64, color: '#A1A1AA' },
];

const TIER_LABELS: Record<DivisionAnchor, string[]> = {
  high_major: [
    'National POY Lock / Transcendent',
    'Franchise Anchor / Elite All-American',
    'High-Impact Starter / Core Winner',
    'Solid Starter / Top-5 Rotation Lock',
    'Trusted Rotation / Big-Minute Glue',
    'Reliable Bench / Rotation Contributor',
    'Situational Specialist / Depth Piece',
    'Limited / Project',
  ],
  mid_major: [
    'Conference POY / All-American',
    'Franchise Player / First-Team All-Conf',
    'High-Impact Starter / All-Conf Caliber',
    'Solid Starter / Key Contributor',
    'Trusted Rotation / Reliable Starter',
    'Reliable Bench / Spot Starter',
    'Specialist / Depth Piece',
    'Developmental / Project',
  ],
  low_major: [
    'Elite / Conference Best Player',
    'Franchise Anchor / All-Conference',
    'High-Impact Starter / Go-To Scorer',
    'Solid Starter / Core Rotation',
    'Trusted Rotation / Starter Caliber',
    'Reliable Bench / Key Reserve',
    'Depth / Situational',
    'Developmental / Walk-On Level',
  ],
  naia: [
    'Elite / National POY Candidate',
    'Franchise Anchor / All-American',
    'High-Impact Starter / All-Conference',
    'Solid Starter / Key Contributor',
    'Trusted Rotation / Reliable Starter',
    'Reliable Bench / Spot Starter',
    'Depth / Specialist',
    'Developmental / Project',
  ],
  juco: [
    'Elite / NJCAA All-American',
    'Franchise / First-Team All-Conference',
    'High-Impact / D1 Transfer Ready',
    'Solid Starter / 4-Year Ready',
    'Rotation / Transfer Candidate',
    'Bench / Developing',
    'Depth / Needs Time',
    'Project / Freshman',
  ],
};

/** Map institution division strings to tier anchors */
export function getDivisionAnchor(division: string): DivisionAnchor {
  const d = division.toUpperCase();
  if (d.includes('D1') || d === 'NCAA_D1') return 'high_major';
  if (d.includes('D2') || d === 'NCAA_D2') return 'mid_major';
  if (d.includes('D3') || d === 'NCAA_D3') return 'low_major';
  if (d === 'NAIA') return 'naia';
  if (d.includes('JUCO') || d === 'NJCAA' || d.includes('CCCAA') || d === '3C2A') return 'juco';
  return 'naia'; // default
}

/** Get tier legend for a specific division anchor */
export function getKRTiersForDivision(anchor: DivisionAnchor): KRTier[] {
  const labels = TIER_LABELS[anchor];
  return TIER_RANGES.map((t, i) => ({ ...t, label: labels[i] }));
}

/** Default: NAIA tiers (program level) — used for filters where ranges matter more than labels */
export const KR_TIERS: KRTier[] = getKRTiersForDivision('naia');

// ─── Division hierarchy (canonical) ───
interface DivisionGroup {
  label: string;
  children?: { label: string; value: string }[];
  value?: string;
}

const DIVISION_HIERARCHY: DivisionGroup[] = [
  { label: 'College', children: [
    { label: 'Portal', value: 'Portal' },
    { label: 'NCAA D1', value: 'NCAA D1' },
    { label: 'NCAA D2', value: 'NCAA D2' },
    { label: 'NCAA D3', value: 'NCAA D3' },
    { label: 'NAIA', value: 'NAIA' },
    { label: 'USCAA', value: 'USCAA' },
    { label: 'NCCAA D1', value: 'NCCAA D1' },
    { label: 'NCCAA D2', value: 'NCCAA D2' },
    { label: '3C2A', value: '3C2A' },
  ]},
  { label: 'JUCO', children: [
    { label: 'D1', value: 'JUCO D1' },
    { label: 'D2', value: 'JUCO D2' },
    { label: 'D3', value: 'JUCO D3' },
  ]},
  { label: 'High School', value: 'HS' },
  { label: 'International', value: 'International' },
];

// ─── Pipeline: roster players grouped by region ───
interface PipelineConnection {
  name: string;
  school: string;
  classYear: string;
  jerseyNumber: string;
  region: string;
}

function buildPipelineMap(): Record<string, PipelineConnection[]> {
  const map: Record<string, PipelineConnection[]> = {};
  for (const r of REGION_OPTIONS) map[r] = [];
  for (const p of ROSTER) {
    const parts = (p.notes ?? '').split(',').map((s) => s.trim());
    const stateOrCountry = parts[parts.length - 1] ?? '';
    const region = stateOrCountry.length === 2
      ? getPlayerRegion(stateOrCountry)
      : 'International';
    if (!map[region]) map[region] = [];
    map[region].push({
      name: `${p.firstName} ${p.lastName}`,
      school: p.formerSchool,
      classYear: p.classYear,
      jerseyNumber: p.number,
      region,
    });
  }
  return map;
}

const PIPELINE_MAP = buildPipelineMap();

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
  { key: 'defense', label: 'Defensive KR', clusters: ['on_ball_defense', 'team_defense', 'rebounding', 'physical'] },
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
  onPipelinePlayerPress?: (jerseyNumber: string) => void;
}

type ExpandableKey = keyof BoardFilterState | 'physical';

export function BoardFilters({ filters, onFiltersChange, onPipelinePlayerPress }: BoardFiltersProps) {
  const [expandedKey, setExpandedKey] = useState<ExpandableKey | null>(null);
  const [expandedDivGroup, setExpandedDivGroup] = useState<string | null>(null);
  const [expandedKRGroup, setExpandedKRGroup] = useState<KRGroupKey | null>(null);
  const [expandedClusterGroup, setExpandedClusterGroup] = useState<string | null>(null);
  const [expandedPosGroup, setExpandedPosGroup] = useState<string | null>(null);
  const [expandedPhysGroup, setExpandedPhysGroup] = useState<'height' | 'weight' | 'wingspan' | 'vertical' | null>(null);
  const [expandedStatGroup, setExpandedStatGroup] = useState<string | null>(null);
  const [expandedBadgeGroup, setExpandedBadgeGroup] = useState<'offense' | 'defense' | null>(null);

  const hasAnyFilter =
    filters.tier.length > 0 ||
    filters.year.length > 0 ||
    filters.division.length > 0 ||
    filters.status.length > 0 ||
    filters.position.length > 0 ||
    filters.archetype !== null ||
    filters.cluster !== null ||
    filters.stat !== null ||
    filters.region.length > 0 ||
    filters.heightRange !== null ||
    filters.weightRange !== null ||
    filters.wingspanRange !== null ||
    filters.verticalRange !== null ||
    filters.badge.length > 0 ||
    filters.badgeLevel.length > 0;

  const collapseAll = () => {
    setExpandedDivGroup(null);
    setExpandedKRGroup(null);
    setExpandedClusterGroup(null);
    setExpandedPosGroup(null);
    setExpandedStatGroup(null);
    setExpandedBadgeGroup(null);
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
  const toggleMulti = (key: 'tier' | 'year' | 'division' | 'status' | 'position' | 'region' | 'badge' | 'badgeLevel', val: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = filters[key];
    const next = current.includes(val)
      ? current.filter((v) => v !== val)
      : [...current, val];
    onFiltersChange({ ...filters, [key]: next });
  };

  // ── Multi-select: clear array, close panel ──
  const clearMulti = (key: 'tier' | 'year' | 'division' | 'status' | 'position' | 'region' | 'badge' | 'badgeLevel') => {
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
      {/* Top row: filter chips — order: Tiers, Class, Available, Position, Physical, KaNeXT, Production, Stage, Pipeline */}
      <View style={styles.chipRow}>

        {/* Tiers chip (multi-select) */}
        {(() => {
          const arr = filters.tier;
          const active = arr.length > 0;
          const expanded = expandedKey === 'tier';
          return (
            <Pressable
              key="tier"
              style={[styles.chip, active && styles.chipActive, expanded && styles.chipExpanded]}
              onPress={() => toggleExpand('tier')}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {multiLabel('Tiers', arr)}
              </Text>
              <IconSymbol
                name={expanded ? 'chevron.up' : 'chevron.down'}
                size={10}
                color={active ? BG : GRAY}
              />
            </Pressable>
          );
        })()}

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
                {multiLabel('Available', arr, divisionDisplayLabel)}
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

        {/* Physical chip (height/weight/wingspan/vertical ranges) */}
        {(() => {
          const physCount = [filters.heightRange, filters.weightRange, filters.wingspanRange, filters.verticalRange].filter(Boolean).length;
          const active = physCount > 0;
          const expanded = expandedKey === 'physical';
          let label = 'Physical';
          if (physCount === 1) {
            if (filters.heightRange) {
              const hr = HEIGHT_RANGES.find((r) => r.min === filters.heightRange![0] && r.max === filters.heightRange![1]);
              label = hr ? `Ht ${hr.label}` : 'Physical';
            } else if (filters.weightRange) {
              const wr = WEIGHT_RANGES.find((r) => r.min === filters.weightRange![0] && r.max === filters.weightRange![1]);
              label = wr ? `Wt ${wr.label}` : 'Physical';
            } else if (filters.wingspanRange) {
              const ws = WINGSPAN_RANGES.find((r) => r.min === filters.wingspanRange![0] && r.max === filters.wingspanRange![1]);
              label = ws ? `WS ${ws.label}` : 'Physical';
            } else if (filters.verticalRange) {
              const vr = VERTICAL_RANGES.find((r) => r.min === filters.verticalRange![0] && r.max === filters.verticalRange![1]);
              label = vr ? `Vert ${vr.label}` : 'Physical';
            }
          } else if (physCount > 1) {
            label = `Physical (${physCount})`;
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
                {active ? clusterDisplayLabel(clusterVal!) : 'Carroll'}
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

        {/* Badges chip (multi-select, two-level: levels + badge names) */}
        {(() => {
          const badgeCount = filters.badge.length + filters.badgeLevel.length;
          const active = badgeCount > 0;
          const expanded = expandedKey === 'badge';
          let label = 'Badges';
          if (filters.badgeLevel.length === 1 && filters.badge.length === 0) label = filters.badgeLevel[0];
          else if (filters.badge.length === 1 && filters.badgeLevel.length === 0) label = filters.badge[0];
          else if (badgeCount > 0) label = `Badges (${badgeCount})`;
          return (
            <Pressable
              key="badge"
              style={[styles.chip, active && styles.chipActive, expanded && styles.chipExpanded]}
              onPress={() => toggleExpand('badge')}
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
                {multiLabel('Stage', arr)}
              </Text>
              <IconSymbol
                name={expanded ? 'chevron.up' : 'chevron.down'}
                size={10}
                color={active ? BG : GRAY}
              />
            </Pressable>
          );
        })()}

        {/* Region chip (multi-select) */}
        {(() => {
          const arr = filters.region;
          const active = arr.length > 0;
          const expanded = expandedKey === 'region';
          return (
            <Pressable
              key="region"
              style={[styles.chip, active && styles.chipActive, expanded && styles.chipExpanded]}
              onPress={() => toggleExpand('region')}
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

        {hasAnyFilter && (
          <Pressable style={styles.resetChip} onPress={resetAll}>
            <IconSymbol name="xmark" size={10} color={GRAY} />
          </Pressable>
        )}
      </View>

      {/* ── Tiers expanded (multi-select) ── */}
      {expandedKey === 'tier' && (
        <View style={styles.subRow}>
          <Pressable
            style={[styles.subPill, filters.tier.length === 0 && styles.subPillActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              clearMulti('tier');
            }}
          >
            <Text style={[styles.subPillText, filters.tier.length === 0 && styles.subPillTextActive]}>All</Text>
          </Pressable>
          {KR_TIERS.map((t) => {
            const selected = filters.tier.includes(t.short);
            return (
              <Pressable
                key={t.short}
                style={[styles.tierPill, selected && { backgroundColor: t.color, borderColor: t.color }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  toggleMulti('tier', t.short);
                }}
              >
                <Text style={[styles.tierPillLabel, selected && { color: '#fff' }]} numberOfLines={1}>
                  {t.label}
                </Text>
                <Text style={[styles.tierPillRange, selected && { color: '#ffffffaa' }]}>
                  {t.min}–{t.max}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

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

      {/* ── Physical expanded: sub-pills for Height/Weight/Wingspan/Vertical ── */}
      {expandedKey === 'physical' && (
        <View>
          {/* Sub-category pills */}
          <View style={styles.subRow}>
            {([
              { key: 'height' as const, label: 'Height', hasValue: filters.heightRange !== null },
              { key: 'weight' as const, label: 'Weight', hasValue: filters.weightRange !== null },
              { key: 'wingspan' as const, label: 'Wingspan', hasValue: filters.wingspanRange !== null },
              { key: 'vertical' as const, label: 'Vertical', hasValue: filters.verticalRange !== null },
            ] as const).map((cat) => {
              const isExpanded = expandedPhysGroup === cat.key;
              return (
                <Pressable
                  key={cat.key}
                  style={[styles.subPill, cat.hasValue && styles.subPillActive, isExpanded && styles.subPillExpanded]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setExpandedPhysGroup(isExpanded ? null : cat.key);
                  }}
                >
                  <Text style={[styles.subPillText, cat.hasValue && styles.subPillTextActive]}>{cat.label}</Text>
                  <IconSymbol
                    name={isExpanded ? 'chevron.up' : 'chevron.down'}
                    size={9}
                    color={cat.hasValue ? BG : GRAY}
                  />
                </Pressable>
              );
            })}
          </View>

          {/* Height options */}
          {expandedPhysGroup === 'height' && (
            <View style={styles.subSubRow}>
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
          )}

          {/* Weight options */}
          {expandedPhysGroup === 'weight' && (
            <View style={styles.subSubRow}>
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
          )}

          {/* Wingspan options */}
          {expandedPhysGroup === 'wingspan' && (
            <View style={styles.subSubRow}>
              <Pressable
                style={[styles.subPill, filters.wingspanRange === null && styles.subPillActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onFiltersChange({ ...filters, wingspanRange: null });
                }}
              >
                <Text style={[styles.subPillText, filters.wingspanRange === null && styles.subPillTextActive]}>All</Text>
              </Pressable>
              {WINGSPAN_RANGES.map((r) => {
                const selected = filters.wingspanRange !== null && filters.wingspanRange[0] === r.min && filters.wingspanRange[1] === r.max;
                return (
                  <Pressable
                    key={r.label}
                    style={[styles.subPill, selected && styles.subPillActive]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onFiltersChange({ ...filters, wingspanRange: selected ? null : [r.min, r.max] });
                    }}
                  >
                    <Text style={[styles.subPillText, selected && styles.subPillTextActive]}>{r.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Vertical options */}
          {expandedPhysGroup === 'vertical' && (
            <View style={styles.subSubRow}>
              <Pressable
                style={[styles.subPill, filters.verticalRange === null && styles.subPillActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onFiltersChange({ ...filters, verticalRange: null });
                }}
              >
                <Text style={[styles.subPillText, filters.verticalRange === null && styles.subPillTextActive]}>All</Text>
              </Pressable>
              {VERTICAL_RANGES.map((r) => {
                const selected = filters.verticalRange !== null && filters.verticalRange[0] === r.min && filters.verticalRange[1] === r.max;
                return (
                  <Pressable
                    key={r.label}
                    style={[styles.subPill, selected && styles.subPillActive]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onFiltersChange({ ...filters, verticalRange: selected ? null : [r.min, r.max] });
                    }}
                  >
                    <Text style={[styles.subPillText, selected && styles.subPillTextActive]}>{r.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* ── Badges expanded: level pills + offense/defense groups ── */}
      {expandedKey === 'badge' && (
        <View>
          {/* Level pills */}
          <View style={styles.subRow}>
            <Pressable
              style={[styles.subPill, filters.badgeLevel.length === 0 && filters.badge.length === 0 && styles.subPillActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onFiltersChange({ ...filters, badge: [], badgeLevel: [] });
                setExpandedKey(null);
                setExpandedBadgeGroup(null);
              }}
            >
              <Text style={[styles.subPillText, filters.badgeLevel.length === 0 && filters.badge.length === 0 && styles.subPillTextActive]}>All</Text>
            </Pressable>
            {BADGE_LEVELS.map((lvl) => {
              const selected = filters.badgeLevel.includes(lvl);
              const color = BADGE_LEVEL_COLORS[lvl];
              return (
                <Pressable
                  key={lvl}
                  style={[styles.badgeLevelPill, selected && { backgroundColor: color, borderColor: color }]}
                  onPress={() => toggleMulti('badgeLevel', lvl)}
                >
                  <View style={[styles.badgeDotSmall, { backgroundColor: selected ? '#fff' : color }]} />
                  <Text style={[styles.subPillText, selected && { color: '#000' }]}>{lvl}</Text>
                </Pressable>
              );
            })}
            {/* Offense / Defense group expanders */}
            {([
              { key: 'offense' as const, label: 'Offense', names: OFFENSIVE_BADGE_NAMES },
              { key: 'defense' as const, label: 'Defense', names: DEFENSIVE_BADGE_NAMES },
            ] as const).map((grp) => {
              const hasActive = grp.names.some((n) => filters.badge.includes(n));
              const isExpanded = expandedBadgeGroup === grp.key;
              return (
                <Pressable
                  key={grp.key}
                  style={[styles.subPill, hasActive && styles.subPillActive, isExpanded && styles.subPillExpanded]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setExpandedBadgeGroup(isExpanded ? null : grp.key);
                  }}
                >
                  <Text style={[styles.subPillText, hasActive && styles.subPillTextActive]}>{grp.label}</Text>
                  <IconSymbol
                    name={isExpanded ? 'chevron.up' : 'chevron.down'}
                    size={9}
                    color={hasActive ? BG : GRAY}
                  />
                </Pressable>
              );
            })}
          </View>

          {/* Badge name pills for expanded group */}
          {expandedBadgeGroup && (() => {
            const names = expandedBadgeGroup === 'offense' ? OFFENSIVE_BADGE_NAMES : DEFENSIVE_BADGE_NAMES;
            const groupLabel = expandedBadgeGroup === 'offense' ? 'Offense' : 'Defense';
            return (
              <View style={styles.subSubRow}>
                <Text style={styles.subSubLabel}>{groupLabel}</Text>
                {names.map((name) => {
                  const selected = filters.badge.includes(name);
                  return (
                    <Pressable
                      key={name}
                      style={[styles.subPill, selected && styles.subPillActive]}
                      onPress={() => toggleMulti('badge', name)}
                    >
                      <Text style={[styles.subPillText, selected && styles.subPillTextActive]} numberOfLines={1}>
                        {name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            );
          })()}
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
                        // Collapse archetype sub-level, keep position selected
                        setExpandedPosGroup(null);
                      } else if (isActive) {
                        // Already selected + not expanded — deselect
                        toggleMulti('position', pos);
                        setExpandedPosGroup(null);
                      } else {
                        // Select position and expand archetypes
                        setExpandedPosGroup(pos);
                        onFiltersChange({ ...filters, position: [...posArr, pos], archetype: null });
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

      {/* ── Pipeline expanded (region filter + roster connections) ── */}
      {expandedKey === 'region' && (
        <View>
          {/* Region filter pills */}
          <View style={styles.subRow}>
            <Pressable
              style={[styles.subPill, filters.region.length === 0 && styles.subPillActive]}
              onPress={() => clearMulti('region')}
            >
              <Text style={[styles.subPillText, filters.region.length === 0 && styles.subPillTextActive]}>All</Text>
            </Pressable>
            {REGION_OPTIONS.map((opt) => {
              const count = PIPELINE_MAP[opt]?.length ?? 0;
              const selected = filters.region.includes(opt);
              return (
                <Pressable
                  key={opt}
                  style={[styles.subPill, selected && styles.subPillActive]}
                  onPress={() => toggleMulti('region', opt)}
                >
                  <Text style={[styles.subPillText, selected && styles.subPillTextActive]}>
                    {opt}{count > 0 ? ` (${count})` : ''}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {/* Roster connections for selected regions */}
          {filters.region.length > 0 && (
            <View style={styles.pipelineConnections}>
              {filters.region.map((reg) => {
                const players = PIPELINE_MAP[reg] ?? [];
                if (players.length === 0) return (
                  <View key={reg} style={styles.pipelineRegionBlock}>
                    <Text style={styles.pipelineRegionLabel}>{reg}</Text>
                    <Text style={styles.pipelineEmpty}>No roster connections</Text>
                  </View>
                );
                return (
                  <View key={reg} style={styles.pipelineRegionBlock}>
                    <Text style={styles.pipelineRegionLabel}>{reg} — {players.length} on roster</Text>
                    {players.map((p, i) => (
                      <Pressable
                        key={i}
                        style={styles.pipelinePlayerRow}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          onPipelinePlayerPress?.(p.jerseyNumber);
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.pipelinePlayerName}>{p.name}</Text>
                          <Text style={styles.pipelinePlayerSchool}>{p.school} · {p.classYear}</Text>
                        </View>
                        <IconSymbol name="chevron.right" size={10} color={GRAY} />
                      </Pressable>
                    ))}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}
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
    backgroundColor: '#0B0F14',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  chipActive: {
    backgroundColor: WHITE,
  },
  chipExpanded: {
    borderWidth: 1.5,
    borderColor: '#52525B',
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
    borderColor: '#52525B',
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
    backgroundColor: '#0B0F14',
    borderWidth: 1,
    borderColor: '#0B0F14',
  },
  subPillActive: {
    backgroundColor: WHITE,
    borderColor: WHITE,
  },
  subPillExpanded: {
    borderColor: '#52525B',
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
  tierPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#0B0F14',
    borderWidth: 1,
    borderColor: '#2F3336',
    minWidth: 140,
  },
  tierPillLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  tierPillRange: {
    fontSize: 10,
    fontWeight: '500',
    color: GRAY,
    marginTop: 1,
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
  badgeLevelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#0B0F14',
    borderWidth: 1,
    borderColor: '#0B0F14',
  },
  badgeDotSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pipelineConnections: {
    marginTop: 6,
    gap: 10,
  },
  pipelineRegionBlock: {
    backgroundColor: '#0B0F14',
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  pipelineRegionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: GRAY,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  pipelineEmpty: {
    fontSize: 11,
    color: '#52525B',
    fontStyle: 'italic',
  },
  pipelinePlayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DIVIDER,
  },
  pipelinePlayerName: {
    fontSize: 12,
    fontWeight: '600',
    color: WHITE,
  },
  pipelinePlayerSchool: {
    fontSize: 11,
    color: GRAY,
  },
});
