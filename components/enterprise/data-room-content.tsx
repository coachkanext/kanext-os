/**
 * Data Room Content — Enhanced document browser with search + categories.
 */

import React, { useState, useMemo } from 'react';
import { View, FlatList, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEnterprise } from '@/context/enterprise-context';
import { getDocsByCompany, getCategoryLabelV2 } from '@/data/mock-enterprise-v2';
import { DocumentReaderSheet } from './document-reader-sheet';
import { ViewAsToggle } from './view-as-toggle';
import type { DocumentV2, DocumentCategory } from '@/types';

const ACCENT_GOLD = '#FFFFFF';

const CATEGORY_FILTERS: { label: string; value: DocumentCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Investor', value: 'investor_materials' },
  { label: 'Proof', value: 'proof' },
  { label: 'IP', value: 'ip' },
  { label: 'Financial', value: 'financial' },
  { label: 'Legal', value: 'legal' },
  { label: 'Product', value: 'product' },
  { label: 'Engines', value: 'engines' },
  { label: 'Governance', value: 'governance' },
];

export function DataRoomContent() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { activeCompanyId, viewAsRole } = useEnterprise();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | 'all'>('all');
  const [selectedDoc, setSelectedDoc] = useState<DocumentV2 | null>(null);
  const [readerVisible, setReaderVisible] = useState(false);

  const allDocs = getDocsByCompany(activeCompanyId);

  const filteredDocs = useMemo(() => {
    // RBAC: filter by viewAsRole visibility (B1=founder, B2a/B2b=investor, B3=public)
    const visibleByRole = viewAsRole === 'B1'
      ? allDocs
      : viewAsRole === 'B2a' || viewAsRole === 'B2b'
      ? allDocs.filter((d) => d.visibility === 'investor' || d.visibility === 'public')
      : allDocs.filter((d) => d.visibility === 'public');
    let docs = visibleByRole;
    if (activeCategory !== 'all') {
      docs = docs.filter((d) => d.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      docs = docs.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return docs;
  }, [allDocs, activeCategory, searchQuery]);

  const handleDocPress = (doc: DocumentV2) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDoc(doc);
    setReaderVisible(true);
  };

  const renderDoc = ({ item }: { item: DocumentV2 }) => (
    <Pressable
      style={({ pressed }) => [
        styles.docCard,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.8 },
      ]}
      onPress={() => handleDocPress(item)}
    >
      <View style={styles.docHeader}>
        <ThemedText style={styles.docTitle}>{item.title}</ThemedText>
        <View style={[styles.categoryPill, { backgroundColor: ACCENT_GOLD + '15' }]}>
          <ThemedText style={[styles.categoryPillText, { color: ACCENT_GOLD }]}>
            {getCategoryLabelV2(item.category)}
          </ThemedText>
        </View>
      </View>
      {item.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {item.tags.slice(0, 4).map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: colors.backgroundTertiary }]}>
              <ThemedText style={[styles.tagText, { color: colors.textTertiary }]}>{tag}</ThemedText>
            </View>
          ))}
        </View>
      )}
      {item.summary && (
        <ThemedText style={[styles.docSummary, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.summary}
        </ThemedText>
      )}
      <ThemedText style={[styles.docDate, { color: colors.textTertiary }]}>
        Updated {item.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </ThemedText>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* RBAC toggle */}
      <ViewAsToggle />

      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search documents..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <IconSymbol name="xmark.circle.fill" size={16} color={colors.textTertiary} />
          </Pressable>
        )}
      </View>

      {/* Category filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {CATEGORY_FILTERS.map((cat) => {
          const isActive = cat.value === activeCategory;
          return (
            <Pressable
              key={cat.value}
              style={[
                styles.filterPill,
                { backgroundColor: isActive ? ACCENT_GOLD : colors.backgroundSecondary },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveCategory(cat.value);
              }}
            >
              <ThemedText
                style={[
                  styles.filterPillText,
                  { color: isActive ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {cat.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Document list */}
      <FlatList
        data={filteredDocs}
        keyExtractor={(item) => item.id}
        renderItem={renderDoc}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <IconSymbol name="doc" size={36} color={colors.textTertiary} />
            <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
              No documents found.
            </ThemedText>
          </View>
        }
      />

      {/* Document reader sheet */}
      {selectedDoc && (
        <DocumentReaderSheet
          visible={readerVisible}
          onClose={() => setReaderVisible(false)}
          document={selectedDoc}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  filterRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  docCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  docHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  docTitle: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    marginRight: Spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: Spacing.xs,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  docSummary: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.xs,
  },
  docDate: {
    fontSize: 11,
  },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
  },
  emptyText: {
    fontSize: 15,
    marginTop: Spacing.sm,
  },
});
