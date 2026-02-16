/**
 * Company Switcher — horizontal pill row for selecting active company.
 */

import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEnterprise } from '@/context/enterprise-context';

const ACCENT_GOLD = '#FFFFFF';

export function CompanySwitcher() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { companies, activeCompanyId, setActiveCompany } = useEnterprise();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {companies.map((company) => {
          const isActive = company.id === activeCompanyId;
          return (
            <Pressable
              key={company.id}
              style={[
                styles.pill,
                {
                  backgroundColor: isActive ? ACCENT_GOLD : colors.backgroundSecondary,
                },
              ]}
              onPress={() => setActiveCompany(company.id)}
            >
              <ThemedText
                style={[
                  styles.pillText,
                  { color: isActive ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {company.displayName}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  content: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
