/**
 * SportsRequests — Governed action queue with 7 request types.
 * RBAC-gated via getMessagesSectionVisibility.
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, SectionList } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SportsRequestCard } from '@/components/messages/sports-request-card';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getMessagesSectionVisibility, type SportsRoleLens } from '@/utils/sports-rbac';
import {
  SPORTS_REQUESTS,
  getRequestTypeLabel,
  type SportsRequest,
  type RequestType,
} from '@/data/mock-sports-messages';

const DEFAULT_ROLE: SportsRoleLens = 'R1';

const REQUEST_TYPE_ORDER: RequestType[] = [
  'approval', 'roster', 'schedule', 'recruiting', 'eligibility', 'finance', 'incident',
];

export function SportsRequests() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const role = DEFAULT_ROLE;

  const sections = useMemo(() => {
    const filtered = SPORTS_REQUESTS.filter(
      (r) => getMessagesSectionVisibility(r.rbacSection, role) !== 'hidden',
    );

    return REQUEST_TYPE_ORDER
      .map((type) => ({
        title: getRequestTypeLabel(type),
        data: filtered.filter((r) => r.type === type),
      }))
      .filter((s) => s.data.length > 0);
  }, [role]);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <SportsRequestCard request={item} />}
      renderSectionHeader={({ section }) => (
        <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textTertiary }]}>
            {section.title}
          </ThemedText>
        </View>
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <IconSymbol name="doc.text" size={28} color={colors.textTertiary} />
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No pending requests
          </ThemedText>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 100,
  },
  sectionHeader: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing.xxl * 2,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
  },
});
