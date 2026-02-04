/**
 * Leadership Screen
 * Faculty and staff directory for Education mode.
 */

import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable, SectionList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FACULTY_LEADERSHIP, DEPARTMENTS, getFacultyRoleLabel } from '@/data/mock-education';
import type { FacultyMember } from '@/types';

// =============================================================================
// COMPONENTS
// =============================================================================

interface FacultyCardProps {
  faculty: FacultyMember;
  colors: typeof Colors.light;
  accentColor: string;
}

function FacultyCard({ faculty, colors, accentColor }: FacultyCardProps) {
  const department = faculty.departmentId
    ? DEPARTMENTS.find((d) => d.id === faculty.departmentId)
    : null;

  return (
    <View style={[styles.facultyCard, { backgroundColor: colors.card }]}>
      <View style={[styles.facultyAvatar, { backgroundColor: accentColor + '15' }]}>
        <IconSymbol name="person.fill" size={24} color={accentColor} />
      </View>
      <View style={styles.facultyInfo}>
        <ThemedText style={styles.facultyName}>{faculty.name}</ThemedText>
        <ThemedText style={[styles.facultyTitle, { color: colors.textSecondary }]}>
          {faculty.title}
        </ThemedText>
        {department && (
          <ThemedText style={[styles.facultyDept, { color: colors.textTertiary }]}>
            {department.name}
          </ThemedText>
        )}
        {faculty.bio && (
          <ThemedText
            style={[styles.facultyBio, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {faculty.bio}
          </ThemedText>
        )}
      </View>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function LeadershipScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const modeColors = ModeColors.education;

  // Group faculty by role
  const sections = useMemo(() => {
    const groups: Record<string, FacultyMember[]> = {
      'Executive Leadership': [],
      Deans: [],
      'Department Chairs': [],
    };

    FACULTY_LEADERSHIP.forEach((faculty) => {
      if (faculty.role === 'president' || faculty.role === 'provost') {
        groups['Executive Leadership'].push(faculty);
      } else if (faculty.role === 'dean') {
        groups['Deans'].push(faculty);
      } else if (faculty.role === 'chair') {
        groups['Department Chairs'].push(faculty);
      }
    });

    return Object.entries(groups)
      .filter(([, data]) => data.length > 0)
      .map(([title, data]) => ({ title, data }));
  }, []);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={20} color={colors.text} />
        </Pressable>
        <View style={styles.headerContent}>
          <ThemedText type="title" style={styles.headerTitle}>
            Leadership
          </ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {FACULTY_LEADERSHIP.length} faculty & staff
          </ThemedText>
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FacultyCard faculty={item} colors={colors} accentColor={modeColors.primary} />
        )}
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
            <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {section.title.toUpperCase()}
            </ThemedText>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: colors.divider }]} />
        )}
        SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
      />
    </ThemedView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },

  // Section Header
  sectionHeader: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Faculty Card
  facultyCard: {
    flexDirection: 'row',
    padding: Spacing.md,
  },
  facultyAvatar: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  facultyInfo: {
    flex: 1,
  },
  facultyName: {
    fontSize: 16,
    fontWeight: '600',
  },
  facultyTitle: {
    fontSize: 14,
    marginTop: 2,
  },
  facultyDept: {
    fontSize: 13,
    marginTop: 2,
  },
  facultyBio: {
    fontSize: 13,
    marginTop: Spacing.xs,
    lineHeight: 18,
  },

  // Separators
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md + 56 + Spacing.md,
  },
  sectionSeparator: {
    height: Spacing.sm,
  },
});
