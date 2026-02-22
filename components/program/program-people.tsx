/**
 * Program People — Staff + Athletes directory with tabs.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme'
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { STAFF_MEMBERS, ATHLETE_MEMBERS } from '@/data/mock-program-v2';
import type { PermissionTier, TeamLevel, AthleteMember } from '@/data/mock-program-v2';

type PeopleTab = 'staff' | 'athletes';

const TIER_COLORS: Record<PermissionTier, string> = {
  admin: '#FFFFFF',
  coach: accent,
  staff: '#F59E0B',
  viewer: '#52525B',
};

const STATUS_COLORS: Record<AthleteMember['status'], string> = {
  active: '#22C55E',
  injured: '#EF4444',
  redshirt: '#F59E0B',
  transfer: accent,
};

const TEAM_LABELS: Record<TeamLevel, string> = {
  varsity: 'Varsity',
  jv: 'JV',
  prep: 'Prep',
  dev: 'Development',
};

export function ProgramPeople() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const [activeTab, setActiveTab] = useState<PeopleTab>('staff');

  const groupedAthletes = useMemo(() => {
    const groups: Record<string, AthleteMember[]> = {};
    for (const a of ATHLETE_MEMBERS) {
      const key = a.team;
      if (!groups[key]) groups[key] = [];
      groups[key].push(a);
    }
    // Varsity first, then JV, then others
    const order: TeamLevel[] = ['varsity', 'jv', 'prep', 'dev'];
    return order
      .filter((level) => groups[level])
      .map((level) => ({ level, athletes: groups[level] }));
  }, []);

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {/* Tab Switcher */}
      <View style={[styles.tabRow, { backgroundColor: colors.backgroundTertiary }]}>
        {(['staff', 'athletes'] as PeopleTab[]).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <Pressable
              key={tab}
              style={[
                styles.tabBtn,
                isActive && { backgroundColor: '#FFFFFF' },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab);
              }}
            >
              <ThemedText
                style={[
                  styles.tabLabel,
                  { color: isActive ? '#000000' : colors.textSecondary },
                ]}
              >
                {tab === 'staff' ? 'Staff' : 'Athletes'}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Staff Tab */}
      {activeTab === 'staff' && (
        <View style={styles.listContainer}>
          {STAFF_MEMBERS.map((member, index) => (
            <Pressable
              key={member.id}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={styles.staffRow}>
                <View style={[styles.avatar, { backgroundColor: colors.backgroundTertiary }]}>
                  <ThemedText style={[styles.avatarText, { color: colors.textSecondary }]}>
                    {member.initials}
                  </ThemedText>
                </View>
                <View style={styles.staffInfo}>
                  <ThemedText style={styles.staffName}>{member.name}</ThemedText>
                  <View style={styles.staffMeta}>
                    <View
                      style={[
                        styles.roleBadge,
                        { backgroundColor: TIER_COLORS[member.permissionTier] + '20' },
                      ]}
                    >
                      <ThemedText
                        style={[styles.roleText, { color: TIER_COLORS[member.permissionTier] }]}
                      >
                        {member.role}
                      </ThemedText>
                    </View>
                    <ThemedText style={[styles.staffTeam, { color: colors.textTertiary }]}>
                      {member.teamAssignment}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.staffEmail, { color: colors.textTertiary }]}>
                    {member.email}
                  </ThemedText>
                </View>
              </View>
              {index < STAFF_MEMBERS.length - 1 && (
                <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              )}
            </Pressable>
          ))}
        </View>
      )}

      {/* Athletes Tab */}
      {activeTab === 'athletes' && (
        <View style={styles.listContainer}>
          {groupedAthletes.map((group) => (
            <View key={group.level}>
              <ThemedText style={[styles.groupHeader, { color: colors.textSecondary }]}>
                {TEAM_LABELS[group.level]}
              </ThemedText>
              {group.athletes.map((athlete, index) => (
                <Pressable
                  key={athlete.id}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <View style={styles.athleteRow}>
                    <View style={[styles.numberCircle, { backgroundColor: colors.backgroundTertiary }]}>
                      <ThemedText style={[styles.numberText, { color: colors.text }]}>
                        {athlete.number}
                      </ThemedText>
                    </View>
                    <View style={styles.athleteInfo}>
                      <ThemedText style={styles.athleteName}>{athlete.name}</ThemedText>
                      <View style={styles.athleteMeta}>
                        <ThemedText style={[styles.athletePos, { color: colors.textSecondary }]}>
                          {athlete.position}
                        </ThemedText>
                        <View style={[styles.classBadge, { backgroundColor: colors.backgroundTertiary }]}>
                          <ThemedText style={[styles.classText, { color: colors.textSecondary }]}>
                            {athlete.classYear}
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                    <View style={styles.statusContainer}>
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: STATUS_COLORS[athlete.status] },
                        ]}
                      />
                      <ThemedText
                        style={[styles.statusLabel, { color: STATUS_COLORS[athlete.status] }]}
                      >
                        {athlete.status.charAt(0).toUpperCase() + athlete.status.slice(1)}
                      </ThemedText>
                    </View>
                  </View>
                  {index < group.athletes.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                  )}
                </Pressable>
              ))}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    padding: 3,
    marginBottom: Spacing.md,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
  },

  listContainer: {
    gap: 0,
  },

  // Staff
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
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
    fontWeight: '600',
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 15,
    fontWeight: '500',
  },
  staffMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  staffTeam: {
    fontSize: 12,
  },
  staffEmail: {
    fontSize: 12,
    marginTop: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 40 + Spacing.sm,
  },

  // Athletes
  groupHeader: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  athleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  numberCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 14,
    fontWeight: '700',
  },
  athleteInfo: {
    flex: 1,
  },
  athleteName: {
    fontSize: 15,
    fontWeight: '500',
  },
  athleteMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 2,
  },
  athletePos: {
    fontSize: 13,
    fontWeight: '500',
  },
  classBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.sm,
  },
  classText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
