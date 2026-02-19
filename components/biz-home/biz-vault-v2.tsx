/**
 * Biz Vault V2 — Orchestrator with 3 sub-pills: Folders | Cap Table | Proof
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { BizVaultFoldersView } from '@/components/biz-home/biz-vault-folders-view';
import { BizVaultCapTableView } from '@/components/biz-home/biz-vault-captable-view';
import { BizVaultProofView } from '@/components/biz-home/biz-vault-proof-view';

const PILLS = ['Folders', 'Cap Table', 'Proof'] as const;
type VaultPill = (typeof PILLS)[number];

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

export function BizVaultV2({ colors, accent }: Props) {
  const [activePill, setActivePill] = useState<VaultPill>('Folders');

  const renderContent = () => {
    switch (activePill) {
      case 'Folders':
        return <BizVaultFoldersView colors={colors} accent={accent} />;
      case 'Cap Table':
        return <BizVaultCapTableView colors={colors} accent={accent} />;
      case 'Proof':
        return <BizVaultProofView colors={colors} accent={accent} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sub-Pill Bar */}
      <View style={styles.pillBar}>
        {PILLS.map((pill) => {
          const isActive = activePill === pill;
          return (
            <Pressable
              key={pill}
              style={[styles.pill, isActive && { backgroundColor: accent }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActivePill(pill);
              }}
            >
              <ThemedText
                style={[styles.pillText, { color: isActive ? '#000' : colors.textSecondary }]}
              >
                {pill}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Content */}
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pillBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 10,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  pillText: { fontSize: 12, fontWeight: '600' },
});
