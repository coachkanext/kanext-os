/**
 * EntitySwitcherSheet — Bottom sheet for switching the active entity scope.
 * Search, recent, pinned, and grouped entity list.
 * Selecting an entity calls setSelectedEntity() → all 10 tabs re-render scoped.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Pressable, TextInput, StyleSheet, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Spacing, BorderRadius, BusinessPalette } from '@/constants/theme';
import { getBizEntitiesData, type BizEntity } from '@/data/mock-biz-org-entities';
import { BIZ_ENTITY_TYPE_LABELS, BIZ_ENTITY_TYPE_COLORS, type BizEntityType } from '@/data/biz-org-shared-types';
import { useBusiness } from '@/context/business-context';
import { isFounder } from '@/utils/business-rbac';

const BP = BusinessPalette;

// =============================================================================
// TYPES
// =============================================================================

interface EntitySwitcherSheetProps {
  visible: boolean;
  onClose: () => void;
}

// =============================================================================
// GROUP ORDER
// =============================================================================

const GROUP_ORDER: { key: string; label: string; types: BizEntityType[] }[] = [
  { key: 'internal', label: 'Internal', types: ['holdco', 'internal'] },
  { key: 'partners', label: 'Partners', types: ['partner'] },
  { key: 'assets', label: 'Assets', types: ['asset', 'project'] },
  { key: 'deals', label: 'Deals / Acquisition Targets', types: ['deal_acquisition'] },
  { key: 'relationships', label: 'Relationships', types: ['relationship'] },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function EntitySwitcherSheet({ visible, onClose }: EntitySwitcherSheetProps) {
  const { selectedEntityId, setSelectedEntity, pinnedEntityIds, setPinnedEntityIds, recentEntityIds, viewAsRole } = useBusiness();
  const [search, setSearch] = useState('');
  const { entities } = getBizEntitiesData();

  const filtered = useMemo(() => {
    if (!search.trim()) return entities;
    const q = search.toLowerCase();
    return entities.filter(
      (e) => e.name.toLowerCase().includes(q) || e.type.toLowerCase().includes(q)
    );
  }, [entities, search]);

  const recentEntities = useMemo(() => {
    return recentEntityIds
      .map((id) => filtered.find((e) => e.id === id))
      .filter(Boolean) as BizEntity[];
  }, [recentEntityIds, filtered]);

  const pinnedEntities = useMemo(() => {
    return pinnedEntityIds
      .map((id) => filtered.find((e) => e.id === id))
      .filter(Boolean) as BizEntity[];
  }, [pinnedEntityIds, filtered]);

  const grouped = useMemo(() => {
    return GROUP_ORDER.map((g) => ({
      ...g,
      items: filtered.filter((e) => g.types.includes(e.type)),
    })).filter((g) => g.items.length > 0);
  }, [filtered]);

  const handleSelect = useCallback((id: string) => {
    setSelectedEntity(id);
    setSearch('');
    onClose();
  }, [setSelectedEntity, onClose]);

  const handleTogglePin = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPinnedEntityIds(
      pinnedEntityIds.includes(id)
        ? pinnedEntityIds.filter((p) => p !== id)
        : [...pinnedEntityIds, id]
    );
  }, [pinnedEntityIds, setPinnedEntityIds]);

  const renderRow = (entity: BizEntity, showPin = false) => {
    const isSelected = entity.id === selectedEntityId;
    const isPinned = pinnedEntityIds.includes(entity.id);
    const typeColor = BIZ_ENTITY_TYPE_COLORS[entity.type];

    return (
      <Pressable
        key={entity.id}
        style={({ pressed }) => [
          s.entityRow,
          isSelected && s.entityRowSelected,
          pressed && { opacity: 0.7 },
        ]}
        onPress={() => handleSelect(entity.id)}
      >
        <View style={[s.statusDot, { backgroundColor: entity.status === 'active' ? '#22C55E' : entity.status === 'pending' ? '#F59E0B' : '#9CA3AF' }]} />
        <View style={{ flex: 1 }}>
          <ThemedText style={[s.entityName, { color: BP.smoke }]} numberOfLines={1}>
            {entity.name}
          </ThemedText>
          <View style={s.entityMeta}>
            <View style={[s.typeBadge, { backgroundColor: typeColor + '20' }]}>
              <ThemedText style={[s.typeBadgeText, { color: typeColor }]}>
                {BIZ_ENTITY_TYPE_LABELS[entity.type].toUpperCase()}
              </ThemedText>
            </View>
          </View>
        </View>
        {showPin && isFounder(viewAsRole) && (
          <Pressable
            style={({ pressed }) => [s.pinBtn, pressed && { opacity: 0.5 }]}
            onPress={() => handleTogglePin(entity.id)}
            hitSlop={8}
          >
            <IconSymbol
              name={isPinned ? 'pin.fill' : 'pin'}
              size={14}
              color={isPinned ? BP.champagneGold : BP.ash}
            />
          </Pressable>
        )}
        {isSelected && (
          <IconSymbol name="checkmark.circle.fill" size={18} color={BP.champagneGold} />
        )}
      </Pressable>
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal>
      <View style={s.container}>
        {/* Header */}
        <View style={s.header}>
          <ThemedText style={[s.title, { color: BP.smoke }]}>Switch Entity</ThemedText>
          <Pressable onPress={onClose} hitSlop={12}>
            <IconSymbol name="xmark.circle.fill" size={24} color={BP.ash} />
          </Pressable>
        </View>

        {/* Search */}
        <View style={s.searchWrap}>
          <IconSymbol name="magnifyingglass" size={16} color={BP.ash} />
          <TextInput
            style={s.searchInput}
            placeholder="Search entities..."
            placeholderTextColor={BP.ash}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <IconSymbol name="xmark.circle.fill" size={16} color={BP.ash} />
            </Pressable>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
          {/* Recent */}
          {!search && recentEntities.length > 0 && (
            <View style={s.section}>
              <ThemedText style={s.sectionLabel}>RECENT</ThemedText>
              {recentEntities.map((e) => renderRow(e))}
            </View>
          )}

          {/* Pinned */}
          {!search && pinnedEntities.length > 0 && (
            <View style={s.section}>
              <ThemedText style={s.sectionLabel}>PINNED</ThemedText>
              {pinnedEntities.map((e) => renderRow(e, true))}
            </View>
          )}

          {/* Grouped list */}
          {grouped.map((g) => (
            <View key={g.key} style={s.section}>
              <ThemedText style={s.sectionLabel}>{g.label.toUpperCase()}</ThemedText>
              {g.items.map((e) => renderRow(e, true))}
            </View>
          ))}

          {filtered.length === 0 && (
            <View style={s.emptyState}>
              <IconSymbol name="magnifyingglass" size={32} color={BP.ash} />
              <ThemedText style={[s.emptyText, { color: BP.ash }]}>No entities found</ThemedText>
            </View>
          )}
        </ScrollView>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: BP.carbon,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: BP.graphite,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: BP.smoke,
    padding: 0,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: BP.ash,
    marginBottom: Spacing.sm,
  },
  entityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: 2,
  },
  entityRowSelected: {
    backgroundColor: BP.champagneGold + '10',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  entityName: {
    fontSize: 14,
    fontWeight: '600',
  },
  entityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 2,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.sm,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  pinBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: 14,
  },
});
