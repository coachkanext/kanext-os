/**
 * Church Ministries — Leaders View
 * Leader list cards with initials circle, ministry badges, and entity sheet tap.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { CHURCH_LEADERS } from '@/data/mock-church-home';
import { openLeaderCard } from '@/utils/global-entity-sheets';

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter((p) => !['Pastor', 'Elder', 'Minister', 'Deacon', 'Mother', 'Sister', 'Lady'].includes(p))
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function nameHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

export function ChurchMinistriesLeadersView({ colors, accent }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {CHURCH_LEADERS.map((leader) => {
        const hue = nameHue(leader.name);
        const initials = getInitials(leader.name);
        return (
          <Pressable
            key={leader.id}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() =>
              openLeaderCard({
                name: leader.name,
                title: leader.title,
                ministries: leader.ministries,
                bio: leader.bio,
              })
            }
          >
            <View style={[styles.avatar, { backgroundColor: `hsl(${hue}, 50%, 35%)` }]}>
              <ThemedText style={styles.avatarText}>{initials}</ThemedText>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.nameRow}>
                <ThemedText style={[styles.leaderName, { color: colors.text }]}>
                  {leader.name}
                </ThemedText>
                <ThemedText style={[styles.yearsText, { color: colors.textTertiary }]}>
                  {leader.yearsServing}y
                </ThemedText>
              </View>
              <ThemedText style={[styles.titleText, { color: colors.textSecondary }]}>
                {leader.title}
              </ThemedText>
              <View style={styles.badgeRow}>
                {leader.ministries.map((ministry) => {
                  const mHue = nameHue(ministry);
                  const bgColor = `hsl(${mHue}, 60%, 25%)`;
                  const textColor = `hsl(${mHue}, 70%, 70%)`;
                  return (
                    <View key={ministry} style={[styles.ministryBadge, { backgroundColor: bgColor }]}>
                      <ThemedText style={[styles.ministryBadgeText, { color: textColor }]}>
                        {ministry}
                      </ThemedText>
                    </View>
                  );
                })}
              </View>
              <ThemedText
                style={[styles.bioText, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                {leader.bio}
              </ThemedText>
            </View>
          </Pressable>
        );
      })}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingTop: 4 },
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cardBody: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  leaderName: { fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
  yearsText: { fontSize: 11, fontWeight: '600' },
  titleText: { fontSize: 12, marginBottom: 6 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  ministryBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  ministryBadgeText: { fontSize: 10, fontWeight: '600' },
  bioText: { fontSize: 12, lineHeight: 17 },
});
