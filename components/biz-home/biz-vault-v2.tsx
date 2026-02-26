/**
 * Biz Vault V2 — Institutional Document System
 *
 * Sub-pills: Library | Versions | Activity
 * Library = categories + document list (default)
 * Versions = global sorted by most recently updated
 * Activity = chronological enterprise document feed
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors, MODE_ACCENT } from '@/constants/theme';
import { BizVaultLibraryView } from '@/components/biz-home/biz-vault-library-view';
import { BizVaultVersionsView } from '@/components/biz-home/biz-vault-versions-view';
import { BizVaultActivityView } from '@/components/biz-home/biz-vault-activity-view';

const ACCENT = MODE_ACCENT.business;

type VaultPill = 'Library' | 'Versions' | 'Activity';
const PILLS: VaultPill[] = ['Library', 'Versions', 'Activity'];

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

export function BizVaultV2({ colors, accent }: Props) {
  const [activePill, setActivePill] = useState<VaultPill>('Library');

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

      {activePill === 'Library' && <BizVaultLibraryView colors={colors} accent={accent} />}
      {activePill === 'Versions' && <BizVaultVersionsView colors={colors} accent={accent} />}
      {activePill === 'Activity' && <BizVaultActivityView colors={colors} accent={accent} />}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  pillBar: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 2, paddingBottom: 10, gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#2F3336' },
  pillText: { fontSize: 13, fontWeight: '600' },
});
