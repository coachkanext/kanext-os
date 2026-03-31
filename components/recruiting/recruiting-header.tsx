/**
 * RecruitingHeader — persistent header for the recruiting workspace.
 * Row 1: Season pill (left) + Search icon + Quick Add (right)
 * Row 2: 4-mode segmented switcher (Needs | Big Board | CRM | Database)
 */

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAccentColor } from '@/hooks/use-accent-color';

export type RecruitingViewMode = 'needs' | 'bigboard' | 'crm' | 'database';

const VIEW_LABELS: { id: RecruitingViewMode; label: string }[] = [
  { id: 'needs', label: 'Needs' },
  { id: 'bigboard', label: 'Big Board' },
  { id: 'crm', label: 'CRM' },
  { id: 'database', label: 'Database' },
];

const BG = '#0B0F14';
const CARD_BG = '#0B0F14';
const WHITE = '#FFFFFF';
const GRAY = '#9C9790';
const DIVIDER = '#0B0F14';

export function RecruitingHeader({
  viewMode,
  onViewModeChange,
  search,
  onSearchChange,
  onAddPress,
}: {
  viewMode: RecruitingViewMode;
  onViewModeChange: (mode: RecruitingViewMode) => void;
  search: string;
  onSearchChange: (text: string) => void;
  onAddPress: () => void;
}) {
  const accent = useAccentColor();
  const [searchVisible, setSearchVisible] = useState(false);
  const searchRef = useRef<TextInput>(null);

  return (
    <View>
      {/* Row 1: Season + Search + Add */}
      <View style={styles.topRow}>
        <View style={styles.seasonPill}>
          <Text style={styles.seasonText}>2025–26</Text>
          <IconSymbol name="chevron.down" size={10} color={GRAY} />
        </View>
        <View style={{ flex: 1 }} />
        <Pressable
          style={styles.iconBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSearchVisible((prev) => {
              if (!prev) {
                setTimeout(() => searchRef.current?.focus(), 100);
              } else {
                onSearchChange('');
              }
              return !prev;
            });
          }}
        >
          <IconSymbol name="magnifyingglass" size={16} color={searchVisible ? WHITE : GRAY} />
        </Pressable>
        <Pressable style={[styles.addBtn, { backgroundColor: accent }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onAddPress(); }}>
          <IconSymbol name="plus" size={14} color={WHITE} />
        </Pressable>
      </View>

      {/* Search bar (conditional) */}
      {searchVisible && (
        <View style={styles.searchBar}>
          <IconSymbol name="magnifyingglass" size={14} color="#9C9790" />
          <TextInput
            ref={searchRef}
            style={styles.searchInput}
            placeholder="Search player, team, tag..."
            placeholderTextColor="#9C9790"
            value={search}
            onChangeText={onSearchChange}
            autoFocus
          />
          {search.length > 0 && (
            <Pressable hitSlop={16} onPress={() => onSearchChange('')} style={{ padding: 8 }}>
              <IconSymbol name="xmark.circle.fill" size={18} color="#9C9790" />
            </Pressable>
          )}
        </View>
      )}

      {/* Row 2: Segmented switcher */}
      <View style={styles.segmentedRow}>
        {VIEW_LABELS.map(({ id, label }) => {
          const active = viewMode === id;
          return (
            <Pressable
              key={id}
              style={[styles.segmentPill, active && styles.segmentPillActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onViewModeChange(id);
              }}
            >
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  seasonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: CARD_BG,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DIVIDER,
  },
  seasonText: {
    fontSize: 13,
    fontWeight: '700',
    color: WHITE,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: DIVIDER,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 38,
    borderWidth: 1,
    borderColor: DIVIDER,
    gap: 8,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: WHITE,
    paddingVertical: 0,
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  segmentPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: CARD_BG,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DIVIDER,
  },
  segmentPillActive: {
    backgroundColor: WHITE,
    borderColor: WHITE,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: GRAY,
  },
  segmentTextActive: {
    color: BG,
  },
});
