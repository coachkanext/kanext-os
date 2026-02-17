/**
 * Organization People Tab v2 — universal across all 5 modes.
 * Scope chips + Quick filter chips + Rich person rows + Filter sheet + Detail sheet.
 */
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  TextInput,
  Pressable,
  Switch,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { PersonDetailHub } from '@/components/people/person-detail-hub';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import {
  PEOPLE_DIRECTORY,
  PEOPLE_SCOPE_CHIPS,
  QUICK_FILTERS,
  ROLE_TEMPLATES,
  SORT_OPTIONS,
  UNIT_OPTIONS,
  sortPeople,
  type Person,
  type QuickFilterKey,
  type SortOption,
} from '@/data/mock-people-v2';
import type { Mode } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  mode: Mode;
  colors: typeof Colors.light;
  accentColor: string;
}

// =============================================================================
// STATUS HELPERS
// =============================================================================

const STATUS_COLORS: Record<string, string> = {
  active: '#22C55E',
  inactive: '#8F8F8F',
  pending: '#F59E0B',
  away: '#3B82F6',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  away: 'Away',
};

// =============================================================================
// PERSON ROW
// =============================================================================

function PersonRow({
  person,
  colors,
  accentColor,
  onPress,
}: {
  person: Person;
  colors: typeof Colors.light;
  accentColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        s.personRow,
        pressed && { opacity: 0.7 },
      ]}
      onPress={onPress}
    >
      {/* Avatar */}
      <View style={[s.avatar, { backgroundColor: person.avatarColor }]}>
        <ThemedText style={s.avatarText}>{person.initials}</ThemedText>
      </View>

      {/* Info */}
      <View style={s.personInfo}>
        <View style={s.personNameRow}>
          <ThemedText style={[s.personName, { color: colors.text }]} numberOfLines={1}>
            {person.name}
          </ThemedText>
          {/* Status dot */}
          <View style={[s.statusDot, { backgroundColor: STATUS_COLORS[person.status] }]} />
        </View>

        <View style={s.personMeta}>
          {/* Role badge */}
          <View style={[s.roleBadge, { backgroundColor: accentColor + '18' }]}>
            <ThemedText style={[s.roleBadgeText, { color: accentColor }]} numberOfLines={1}>
              {person.role}
            </ThemedText>
          </View>
          {/* Unit context */}
          <ThemedText style={[s.unitText, { color: colors.textTertiary }]} numberOfLines={1}>
            {person.unit}
          </ThemedText>
        </View>
      </View>

      {/* Message action */}
      <Pressable
        style={[s.messageBtn, { backgroundColor: colors.backgroundTertiary }]}
        onPress={(e) => {
          e.stopPropagation();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        hitSlop={8}
      >
        <IconSymbol name="text.bubble" size={14} color={colors.textSecondary} />
      </Pressable>

      <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
    </Pressable>
  );
}

// =============================================================================
// SCOPE CHIP BAR
// =============================================================================

function ScopeChipBar({
  mode,
  activeScope,
  onSelect,
  colors,
  accentColor,
}: {
  mode: Mode;
  activeScope: string;
  onSelect: (key: string) => void;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const chips = PEOPLE_SCOPE_CHIPS[mode];
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.chipBarContent}
      style={s.chipBar}
    >
      {chips.map((chip) => {
        const isActive = activeScope === chip.key;
        return (
          <Pressable
            key={chip.key}
            style={[
              s.chip,
              {
                backgroundColor: isActive ? accentColor : colors.backgroundTertiary,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(chip.key);
            }}
          >
            <ThemedText
              style={[
                s.chipText,
                { color: isActive ? '#000' : colors.textSecondary },
              ]}
            >
              {chip.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// QUICK FILTER BAR
// =============================================================================

function QuickFilterBar({
  activeFilter,
  onSelect,
  colors,
  accentColor,
  counts,
}: {
  activeFilter: QuickFilterKey;
  onSelect: (key: QuickFilterKey) => void;
  colors: typeof Colors.light;
  accentColor: string;
  counts: Record<QuickFilterKey, number>;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.chipBarContent}
      style={s.chipBar}
    >
      {QUICK_FILTERS.map((f) => {
        const isActive = activeFilter === f.key;
        const count = counts[f.key];
        return (
          <Pressable
            key={f.key}
            style={[
              s.quickChip,
              {
                backgroundColor: isActive ? accentColor : 'transparent',
                borderColor: isActive ? accentColor : colors.border,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(f.key);
            }}
          >
            <ThemedText
              style={[
                s.quickChipText,
                { color: isActive ? '#000' : colors.textSecondary },
              ]}
            >
              {f.label}
            </ThemedText>
            <ThemedText
              style={[
                s.quickChipCount,
                { color: isActive ? '#000' : colors.textTertiary },
              ]}
            >
              {count}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// FILTER BOTTOM SHEET
// =============================================================================

function FilterSheet({
  visible,
  onClose,
  mode,
  colors,
  accentColor,
  selectedUnits,
  onToggleUnit,
  selectedRoles,
  onToggleRole,
  sortBy,
  onSetSort,
}: {
  visible: boolean;
  onClose: () => void;
  mode: Mode;
  colors: typeof Colors.light;
  accentColor: string;
  selectedUnits: Set<string>;
  onToggleUnit: (unit: string) => void;
  selectedRoles: Set<string>;
  onToggleRole: (role: string) => void;
  sortBy: SortOption;
  onSetSort: (s: SortOption) => void;
}) {
  const units = UNIT_OPTIONS[mode];
  const roles = ROLE_TEMPLATES[mode];

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Filter & Sort" useModal>
      {/* Sort */}
      <ThemedText style={[s.filterSectionTitle, { color: colors.textSecondary }]}>
        SORT BY
      </ThemedText>
      <View style={s.filterOptions}>
        {SORT_OPTIONS.map((opt) => {
          const isActive = sortBy === opt.key;
          return (
            <Pressable
              key={opt.key}
              style={[
                s.filterOption,
                {
                  backgroundColor: isActive ? accentColor : colors.backgroundTertiary,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSetSort(opt.key);
              }}
            >
              <ThemedText
                style={[
                  s.filterOptionText,
                  { color: isActive ? '#000' : colors.textSecondary },
                ]}
              >
                {opt.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Unit */}
      <ThemedText style={[s.filterSectionTitle, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
        UNIT
      </ThemedText>
      {units.map((unit) => (
        <Pressable
          key={unit}
          style={s.filterToggleRow}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onToggleUnit(unit);
          }}
        >
          <ThemedText style={[s.filterToggleLabel, { color: colors.text }]}>
            {unit}
          </ThemedText>
          <View
            style={[
              s.filterCheckbox,
              {
                backgroundColor: selectedUnits.has(unit) ? accentColor : 'transparent',
                borderColor: selectedUnits.has(unit) ? accentColor : colors.border,
              },
            ]}
          >
            {selectedUnits.has(unit) && (
              <IconSymbol name="checkmark" size={10} color="#000" />
            )}
          </View>
        </Pressable>
      ))}

      {/* Role */}
      <ThemedText style={[s.filterSectionTitle, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
        ROLE
      </ThemedText>
      {roles.map((role) => (
        <Pressable
          key={role.key}
          style={s.filterToggleRow}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onToggleRole(role.key);
          }}
        >
          <ThemedText style={[s.filterToggleLabel, { color: colors.text }]}>
            {role.label}
          </ThemedText>
          <View
            style={[
              s.filterCheckbox,
              {
                backgroundColor: selectedRoles.has(role.key) ? accentColor : 'transparent',
                borderColor: selectedRoles.has(role.key) ? accentColor : colors.border,
              },
            ]}
          >
            {selectedRoles.has(role.key) && (
              <IconSymbol name="checkmark" size={10} color="#000" />
            )}
          </View>
        </Pressable>
      ))}
    </BottomSheet>
  );
}

// =============================================================================
// PERSON DETAIL SHEET
// =============================================================================

function PersonDetailSheet({
  person,
  visible,
  onClose,
}: {
  person: Person | null;
  visible: boolean;
  onClose: () => void;
}) {
  if (!person) return null;
  return (
    <BottomSheet visible={visible} onClose={onClose} useModal>
      <PersonDetailHub person={person} />
    </BottomSheet>
  );
}

// =============================================================================
// ORG PEOPLE TAB (main export)
// =============================================================================

export function OrgPeopleTab({ mode, colors, accentColor }: Props) {
  // State
  const [query, setQuery] = useState('');
  const [activeScope, setActiveScope] = useState(PEOPLE_SCOPE_CHIPS[mode][0].key);
  const [activeFilter, setActiveFilter] = useState<QuickFilterKey>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name-az');
  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set());
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const allPeople = PEOPLE_DIRECTORY[mode];

  // Counts for quick filter badges
  const counts = useMemo(() => {
    const c: Record<QuickFilterKey, number> = {
      all: allPeople.length,
      leaders: 0,
      staff: 0,
      members: 0,
      pending: 0,
      inactive: 0,
    };
    for (const p of allPeople) {
      if (p.quickFilter !== 'all') c[p.quickFilter]++;
    }
    return c;
  }, [allPeople]);

  // Filtered + sorted list
  const filteredPeople = useMemo(() => {
    let list = [...allPeople];

    // Quick filter
    if (activeFilter !== 'all') {
      list = list.filter((p) => p.quickFilter === activeFilter);
    }

    // Search
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.role.toLowerCase().includes(q) ||
          p.unit.toLowerCase().includes(q),
      );
    }

    // Unit filter
    if (selectedUnits.size > 0) {
      list = list.filter((p) => selectedUnits.has(p.unit));
    }

    // Role filter
    if (selectedRoles.size > 0) {
      const roleLabels = new Set(
        ROLE_TEMPLATES[mode]
          .filter((r) => selectedRoles.has(r.key))
          .map((r) => r.label),
      );
      list = list.filter((p) => roleLabels.has(p.role));
    }

    return sortPeople(list, sortBy);
  }, [allPeople, activeFilter, query, selectedUnits, selectedRoles, sortBy, mode]);

  // Handlers
  const handleToggleUnit = useCallback((unit: string) => {
    setSelectedUnits((prev) => {
      const next = new Set(prev);
      if (next.has(unit)) next.delete(unit);
      else next.add(unit);
      return next;
    });
  }, []);

  const handleToggleRole = useCallback((role: string) => {
    setSelectedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(role)) next.delete(role);
      else next.add(role);
      return next;
    });
  }, []);

  const handlePersonPress = useCallback((person: Person) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPerson(person);
    setDetailVisible(true);
  }, []);

  const activeFilterCount = selectedUnits.size + selectedRoles.size;

  return (
    <View style={s.container}>
      {/* Sticky header area */}
      <View style={s.headerArea}>
        {/* Scope chips */}
        <ScopeChipBar
          mode={mode}
          activeScope={activeScope}
          onSelect={setActiveScope}
          colors={colors}
          accentColor={accentColor}
        />

        {/* Search + Filter + Invite row */}
        <View style={s.searchRow}>
          <View style={[s.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
            <TextInput
              style={[s.searchInput, { color: colors.text }]}
              placeholder="Search people..."
              placeholderTextColor={colors.textTertiary}
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
            />
          </View>

          {/* Filter button */}
          <Pressable
            style={[s.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setFilterVisible(true);
            }}
          >
            <IconSymbol name="line.3.horizontal.decrease" size={16} color={colors.textSecondary} />
            {activeFilterCount > 0 && (
              <View style={[s.filterBadge, { backgroundColor: accentColor }]}>
                <ThemedText style={s.filterBadgeText}>{activeFilterCount}</ThemedText>
              </View>
            )}
          </Pressable>

          {/* Invite button */}
          <Pressable
            style={[s.inviteButton, { backgroundColor: accentColor }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="person.badge.plus" size={16} color="#000" />
          </Pressable>
        </View>

        {/* Quick filter chips */}
        <QuickFilterBar
          activeFilter={activeFilter}
          onSelect={setActiveFilter}
          colors={colors}
          accentColor={accentColor}
          counts={counts}
        />
      </View>

      {/* Person list */}
      <FlatList
        data={filteredPeople}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PersonRow
            person={item}
            colors={colors}
            accentColor={accentColor}
            onPress={() => handlePersonPress(item)}
          />
        )}
        ItemSeparatorComponent={() => (
          <View style={[s.divider, { backgroundColor: colors.divider }]} />
        )}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <IconSymbol name="person.2" size={32} color={colors.textTertiary} />
            <ThemedText style={[s.emptyText, { color: colors.textTertiary }]}>
              No results
            </ThemedText>
          </View>
        }
      />

      {/* Filter sheet */}
      <FilterSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        mode={mode}
        colors={colors}
        accentColor={accentColor}
        selectedUnits={selectedUnits}
        onToggleUnit={handleToggleUnit}
        selectedRoles={selectedRoles}
        onToggleRole={handleToggleRole}
        sortBy={sortBy}
        onSetSort={setSortBy}
      />

      {/* Person detail sheet */}
      <PersonDetailSheet
        person={selectedPerson}
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
      />
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerArea: {
    paddingBottom: Spacing.xs,
  },

  // -- Chip bars --
  chipBar: {
    flexGrow: 0,
    flexShrink: 0,
  },
  chipBarContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  chip: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 6,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  quickChipCount: {
    fontSize: 11,
    fontWeight: '500',
  },

  // -- Search row --
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    gap: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#000',
  },
  inviteButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // -- Person row --
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    gap: Spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  personInfo: {
    flex: 1,
    gap: 3,
  },
  personNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  personName: {
    fontSize: 15,
    fontWeight: '500',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  personMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleBadge: {
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  unitText: {
    fontSize: 12,
    flex: 1,
  },
  messageBtn: {
    width: 30,
    height: 30,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // -- Divider --
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md + 40 + Spacing.sm,
  },

  // -- List --
  listContent: {
    paddingBottom: Spacing.xxl,
  },

  // -- Empty --
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xl * 2,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: 15,
  },

  // -- Filter sheet --
  filterSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  filterOption: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  filterOptionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  filterToggleLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterCheckbox: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
