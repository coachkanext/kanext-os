/**
 * SimTypeCards — 9 simulation type selector cards in a grid.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SIM_TYPE_CARDS } from '@/data/mock-simulations';
import type { SimType, SimTypeCard } from '@/components/simulation/simulation-types';

interface SimTypeCardsProps {
  selected: SimType | null;
  onSelect: (type: SimType) => void;
}

export function SimTypeCards({ selected, onSelect }: SimTypeCardsProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={styles.grid}>
      {SIM_TYPE_CARDS.map((card) => {
        const isActive = selected === card.id;
        return (
          <Pressable
            key={card.id}
            style={[
              styles.card,
              {
                backgroundColor: colors.backgroundTertiary,
                borderColor: isActive ? card.color : colors.border,
                borderWidth: isActive ? 2 : 1,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(card.id);
            }}
          >
            <View style={[styles.iconCircle, { backgroundColor: card.color + '15' }]}>
              <IconSymbol name={card.icon as any} size={18} color={card.color} />
            </View>
            <ThemedText style={[styles.cardName, { color: colors.text }]} numberOfLines={1}>{card.name}</ThemedText>
            <ThemedText style={[styles.cardDesc, { color: colors.textTertiary }]} numberOfLines={2}>{card.description}</ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  card: {
    width: '31%' as any,
    flexGrow: 1,
    borderRadius: BorderRadius.md,
    padding: 10,
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardName: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 9,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 12,
  },
});
