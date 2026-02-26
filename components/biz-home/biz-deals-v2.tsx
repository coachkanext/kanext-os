/**
 * Biz Deals V2 — Structured Lifecycle Surface
 *
 * Sub-pills: Pipeline | Active | Closed | Archive
 * Pipeline = Kanban board (5 canonical stages)
 * Active = Signed but not fully settled
 * Closed = Fully executed and completed
 * Archive = Abandoned or declined (read-only)
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors, MODE_ACCENT } from '@/constants/theme';
import { BizDealsPipelineV2 } from '@/components/biz-home/biz-deals-pipeline-v2';
import {
  BizDealsActiveView,
  BizDealsClosedView,
  BizDealsArchiveView,
} from '@/components/biz-home/biz-deals-list-views';

const ACCENT = MODE_ACCENT.business;

type DealsPill = 'Pipeline' | 'Active' | 'Closed' | 'Archive';
const PILLS: DealsPill[] = ['Pipeline', 'Active', 'Closed', 'Archive'];

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

export function BizDealsV2({ colors, accent }: Props) {
  const [activePill, setActivePill] = useState<DealsPill>('Pipeline');

  return (
    <View style={s.container}>
      <View style={s.pillBar}>
        {PILLS.map((pill) => (
          <Pressable
            key={pill}
            style={[s.pill, activePill === pill && { backgroundColor: ACCENT }]}
            onPress={() => { Haptics.selectionAsync(); setActivePill(pill); }}
          >
            <ThemedText style={[s.pillText, { color: activePill === pill ? '#000' : colors.textSecondary }]}>
              {pill}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {activePill === 'Pipeline' && <BizDealsPipelineV2 colors={colors} accent={accent} />}
      {activePill === 'Active' && <BizDealsActiveView colors={colors} accent={accent} />}
      {activePill === 'Closed' && <BizDealsClosedView colors={colors} accent={accent} />}
      {activePill === 'Archive' && <BizDealsArchiveView colors={colors} accent={accent} />}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  pillBar: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 2, paddingBottom: 10, gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#2F3336' },
  pillText: { fontSize: 13, fontWeight: '600' },
});
