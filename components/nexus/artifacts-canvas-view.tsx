/**
 * Artifacts Canvas View
 * Horizontal filter chips + artifact rows.
 * Data and chip IDs from spec sampleData.js.
 */

import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

type ArtifactTypeId = 'all' | 'report' | 'doc' | 'sim' | 'code';

interface Artifact {
  id: string;
  type: Exclude<ArtifactTypeId, 'all'>;
  title: string;
  meta: string;
  icon: string;
}

const MOCK_ARTIFACTS: Artifact[] = [
  { id: 'a1', type: 'report', title: 'Recruit Evaluation — J. Williams',  meta: 'Report · Today',        icon: '📊' },
  { id: 'a2', type: 'doc',    title: 'Practice Plan — Week 12',           meta: 'Document · Yesterday',  icon: '📄' },
  { id: 'a3', type: 'sim',    title: 'Lineup Simulation — vs Howard',     meta: 'Simulation · Mar 12',   icon: '🎮' },
  { id: 'a4', type: 'code',   title: 'Auto-scheduling script',            meta: 'Code · Mar 11',         icon: '💻' },
  { id: 'a5', type: 'report', title: 'Donor Activity Summary — Q1',       meta: 'Report · Mar 10',       icon: '📈' },
  { id: 'a6', type: 'code',   title: 'Roster import automation',          meta: 'Code · Mar 7',          icon: '💻' },
];

const CHIPS: Array<{ id: ArtifactTypeId; label: string }> = [
  { id: 'all',    label: 'All'         },
  { id: 'report', label: 'Reports'     },
  { id: 'doc',    label: 'Documents'   },
  { id: 'sim',    label: 'Simulations' },
  { id: 'code',   label: 'Code'        },
];

export function ArtifactsCanvasView() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const [activeFilter, setActiveFilter] = useState<ArtifactTypeId>('all');

  const filtered =
    activeFilter === 'all' ? MOCK_ARTIFACTS : MOCK_ARTIFACTS.filter((a) => a.type === activeFilter);

  return (
    <View style={styles.container}>
      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        style={styles.chipsScroll}
      >
        {CHIPS.map((chip) => {
          const isActive = chip.id === activeFilter;
          return (
            <Pressable
              key={chip.id}
              style={[
                styles.chip,
                { backgroundColor: isActive ? C.label : C.separator },
              ]}
              onPress={() => setActiveFilter(chip.id)}
            >
              <Text style={[styles.chipText, { color: isActive ? C.bg : C.secondary }]}>
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Artifact list */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((artifact) => (
          <Pressable
            key={artifact.id}
            style={({ pressed }) => [
              styles.row,
              { backgroundColor: pressed ? C.separator : 'transparent' },
            ]}
          >
            <Text style={styles.rowIcon}>{artifact.icon}</Text>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle} numberOfLines={1}>{artifact.title}</Text>
              <Text style={styles.rowMeta}>{artifact.meta}</Text>
            </View>
            <IconSymbol name="chevron.right" size={14} color={C.secondary} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    chipsScroll: { flexGrow: 0, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.divider },
    chipsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 999,
    },
    chipText: { fontSize: 13, fontWeight: '600' },
    list: { flex: 1 },
    listContent: { paddingHorizontal: 16, paddingBottom: 40 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.divider,
      gap: 12,
    },
    rowIcon: { fontSize: 22, width: 32, textAlign: 'center' },
    rowContent: { flex: 1, gap: 3 },
    rowTitle: { fontSize: 15, fontWeight: '500', color: C.label },
    rowMeta: { fontSize: 12, color: C.secondary },
  });
