/**
 * Opponent Scout Row — opponent row with Roster + Film + "Mark Prospects" CTA.
 * Used in Recruiting mode's Opponents tab.
 */

import React from 'react';
import { View, Pressable, StyleSheet, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing } from '@/constants/theme';

interface OpponentScoutRowProps {
  opponent: string;
  date: string;
  color: string;
}

export function OpponentScoutRow({ opponent, date, color }: OpponentScoutRowProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: color }]}>
        <ThemedText style={styles.avatarText}>
          {opponent.split(' ').map((w) => w[0]).join('').slice(0, 2)}
        </ThemedText>
      </View>
      <View style={styles.info}>
        <ThemedText style={styles.name}>{opponent}</ThemedText>
        <ThemedText style={styles.date}>{date}</ThemedText>
      </View>
      <View style={styles.actions}>
        <Pressable
          style={styles.btn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert('Roster', `${opponent} roster — Coming Soon`);
          }}
        >
          <ThemedText style={styles.btnText}>Roster</ThemedText>
        </Pressable>
        <Pressable
          style={styles.btn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert('Film', `${opponent} film — Coming Soon`);
          }}
        >
          <ThemedText style={styles.btnText}>Film</ThemedText>
        </Pressable>
        <Pressable
          style={styles.ctaBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert('Mark Prospects', `Tag prospects from ${opponent}`);
          }}
        >
          <IconSymbol name="person.badge.plus" size={12} color="#000" />
          <ThemedText style={styles.ctaText}>Prospects</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#0B0F14',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#9C9790',
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#0B0F14',
    borderRadius: 6,
  },
  btnText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9C9790',
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
  },
  ctaText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000',
  },
});
