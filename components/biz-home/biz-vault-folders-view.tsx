/**
 * Biz Vault Folders View — Expandable folder cards with documents list
 * Includes search bar, category filter pills, and document detail display.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors , MODE_ACCENT } from '@/constants/theme';
import {
  VAULT_FOLDERS,
  VAULT_DOCUMENTS,

  type VaultFolder,
  type VaultDocument,
} from '@/data/mock-business-home';

const ACCENT = MODE_ACCENT.business;

const CATEGORY_PILLS = ['All', 'Contracts', 'Invoices', 'Proposals', 'Financial', 'Legal'] as const;
type CategoryFilter = (typeof CATEGORY_PILLS)[number];

/** Maps category pill labels to tags on documents */
const CATEGORY_TAG_MAP: Record<string, string> = {
  Contracts: 'contract',
  Invoices: 'invoice',
  Proposals: 'proposal',
  Financial: 'financial',
  Legal: 'legal',
};

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

const ACCESS_COLORS: Record<string, string> = {
  public: '#5A8A6E',
  investor: ACCENT,
  board: ACCENT,
  founder_only: '#B85C5C',
};

const ACCESS_LABELS: Record<string, string> = {
  public: 'Public',
  investor: 'Investor',
  board: 'Board',
  founder_only: 'Founder',
};

const TYPE_ICONS: Record<string, string> = {
  pdf: 'PDF',
  doc: 'DOC',
  spreadsheet: 'XLS',
  deck: 'PPT',
};

export function BizVaultFoldersView({ colors, accent }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');

  /** Filter documents based on search + category */
  const filteredDocs = useMemo(() => {
    let docs = VAULT_DOCUMENTS;
    if (categoryFilter !== 'All') {
      const tag = CATEGORY_TAG_MAP[categoryFilter];
      if (tag) docs = docs.filter((d) => d.tags?.includes(tag));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      docs = docs.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.tags?.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return docs;
  }, [search, categoryFilter]);

  /** Get folder IDs that have matching docs (for filtering) */
  const activeFolderIds = useMemo(() => new Set(filteredDocs.map((d) => d.folderId)), [filteredDocs]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Search bar */}
      <TextInput
        style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
        placeholder="Search documents..."
        placeholderTextColor={colors.textSecondary}
        value={search}
        onChangeText={setSearch}
        autoCorrect={false}
      />

      {/* Category filter pills */}
      <View style={styles.categoryRow}>
        {CATEGORY_PILLS.map((pill) => {
          const isActive = categoryFilter === pill;
          return (
            <Pressable
              key={pill}
              style={[styles.categoryPill, isActive && { backgroundColor: accent }]}
              onPress={() => setCategoryFilter(pill)}
            >
              <ThemedText style={[styles.categoryPillText, { color: isActive ? '#000' : colors.textSecondary }]}>
                {pill}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {VAULT_FOLDERS.filter((f) => activeFolderIds.has(f.id)).map((folder: VaultFolder) => {
        const isExpanded = expandedId === folder.id;
        const docs = filteredDocs.filter((d: VaultDocument) => d.folderId === folder.id);
        const accessColor = ACCESS_COLORS[folder.accessLevel] ?? '#9C9790';

        return (
          <View key={folder.id}>
            <Pressable
              style={[styles.folderCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setExpandedId(isExpanded ? null : folder.id)}
            >
              <View style={styles.folderHeader}>
                <View style={{ flex: 1 }}>
                  <ThemedText style={[styles.folderName, { color: colors.text }]}>
                    {folder.name}
                  </ThemedText>
                  <ThemedText style={[styles.folderMeta, { color: colors.textSecondary }]}>
                    {docs.length} docs · Updated {folder.lastUpdated}
                  </ThemedText>
                </View>
                <View style={[styles.accessBadge, { backgroundColor: accessColor + '22' }]}>
                  <ThemedText style={[styles.accessBadgeText, { color: accessColor }]}>
                    {ACCESS_LABELS[folder.accessLevel] ?? folder.accessLevel}
                  </ThemedText>
                </View>
                <ThemedText style={[styles.chevron, { color: colors.textSecondary }]}>
                  {isExpanded ? '\u25B2' : '\u25BC'}
                </ThemedText>
              </View>
            </Pressable>

            {/* Expanded document list */}
            {isExpanded && docs.map((doc: VaultDocument) => {
              const docAccessColor = ACCESS_COLORS[doc.accessLevel] ?? '#9C9790';
              return (
                <Pressable
                  key={doc.id}
                  style={[styles.docRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={[styles.typeIcon, { backgroundColor: accent + '22' }]}>
                    <ThemedText style={[styles.typeIconText, { color: accent }]}>
                      {TYPE_ICONS[doc.type] ?? doc.type.toUpperCase()}
                    </ThemedText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[styles.docName, { color: colors.text }]}>{doc.name}</ThemedText>
                    <ThemedText style={[styles.docMeta, { color: colors.textSecondary }]}>
                      {doc.uploadDate} · {doc.size} · v{doc.version}
                    </ThemedText>
                    {doc.tags && doc.tags.length > 0 && (
                      <View style={styles.tagRow}>
                        {doc.tags.map((tag) => (
                          <View key={tag} style={[styles.tagBadge, { backgroundColor: accent + '15' }]}>
                            <ThemedText style={[styles.tagText, { color: accent }]}>{tag}</ThemedText>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                  <View style={[styles.docAccessBadge, { backgroundColor: docAccessColor + '22' }]}>
                    <ThemedText style={[styles.docAccessText, { color: docAccessColor }]}>
                      {ACCESS_LABELS[doc.accessLevel] ?? doc.accessLevel}
                    </ThemedText>
                  </View>
                </Pressable>
              );
            })}
          </View>
        );
      })}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  searchBar: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 10,
  },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  categoryPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#2F3336' },
  categoryPillText: { fontSize: 12, fontWeight: '600' },
  folderCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
  folderHeader: { flexDirection: 'row', alignItems: 'center' },
  folderName: { fontSize: 15, fontWeight: '700' },
  folderMeta: { fontSize: 11, marginTop: 2 },
  accessBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginRight: 8 },
  accessBadgeText: { fontSize: 10, fontWeight: '700' },
  chevron: { fontSize: 10 },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    marginBottom: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  typeIconText: { fontSize: 10, fontWeight: '800' },
  docName: { fontSize: 13, fontWeight: '600' },
  docMeta: { fontSize: 10, marginTop: 2 },
  docAccessBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  docAccessText: { fontSize: 9, fontWeight: '700' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  tagBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tagText: { fontSize: 9, fontWeight: '600' },
});
