/**
 * Search Screen
 * Universal retrieval surface - routing only.
 * Per spec: Search answers "What exists?" - read-only retrieval, no work performed.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  Pressable,
  SectionList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMode } from '@/context/app-context';
import {
  searchInMode,
  groupResultsByCategory,
  getCategoryLabel,
} from '@/data/mock-search';
import type { SearchResult } from '@/types';

interface SearchResultRowProps {
  result: SearchResult;
  onPress: () => void;
  colors: typeof Colors.light;
}

function SearchResultRow({ result, onPress, colors }: SearchResultRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.resultRow,
        {
          backgroundColor: pressed ? colors.backgroundTertiary : 'transparent',
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.resultContent}>
        <ThemedText style={styles.resultTitle}>{result.title}</ThemedText>
        {result.subtitle && (
          <ThemedText style={[styles.resultSubtitle, { color: colors.textSecondary }]}>
            {result.subtitle}
          </ThemedText>
        )}
      </View>
      <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
    </Pressable>
  );
}

interface SectionHeaderProps {
  title: string;
  colors: typeof Colors.light;
}

function SectionHeader({ title, colors }: SectionHeaderProps) {
  return (
    <View style={[styles.sectionHeader, { backgroundColor: colors.backgroundSecondary }]}>
      <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        {title}
      </ThemedText>
    </View>
  );
}

export default function SearchScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const mode = useMode();

  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    return searchInMode(query, mode);
  }, [query, mode]);

  const sections = useMemo(() => {
    if (results.length === 0) return [];

    const grouped = groupResultsByCategory(results);
    const sectionData: { title: string; data: SearchResult[] }[] = [];

    grouped.forEach((items, category) => {
      sectionData.push({
        title: getCategoryLabel(category),
        data: items,
      });
    });

    return sectionData;
  }, [results]);

  const handleResultPress = (result: SearchResult) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(result.route as any);
  };

  const renderItem = ({ item }: { item: SearchResult }) => (
    <SearchResultRow
      result={item}
      onPress={() => handleResultPress(item)}
      colors={colors}
    />
  );

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <SectionHeader title={section.title} colors={colors} />
  );

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Search Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Search
        </ThemedText>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchInputContainer,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          <IconSymbol
            name="magnifyingglass"
            size={18}
            color={colors.textTertiary}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Organizations, members, events, records..."
            placeholderTextColor={colors.textTertiary}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* Results Area */}
      <View style={styles.resultsContainer}>
        {query.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              name="magnifyingglass"
              size={48}
              color={colors.textTertiary}
              style={styles.emptyIcon}
            />
            <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
              Search for organizations, members, events, records, or media.
            </ThemedText>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              name="magnifyingglass"
              size={48}
              color={colors.textTertiary}
              style={styles.emptyIcon}
            />
            <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
              No results for "{query}"
            </ThemedText>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            stickySectionHeadersEnabled={false}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => (
              <View style={[styles.separator, { backgroundColor: colors.divider }]} />
            )}
            SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
          />
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  resultsContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  resultSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md,
  },
  sectionSeparator: {
    height: Spacing.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    marginBottom: Spacing.md,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
