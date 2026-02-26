/**
 * Biz Vault Versions View — Global document list sorted by most recently updated
 *
 * Shows all documents sorted by:
 *  - Most Recently Updated
 *  - Recently Archived
 * Filter options: Category, Status, Author
 *
 * No productivity metrics. No edit frequency ranking.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, MODE_ACCENT, BorderRadius } from '@/constants/theme';
import {
  VAULT_DOCS,
  VAULT_CATEGORIES,
  STATUS_COLORS,
  FILE_TYPE_LABELS,
  type VaultDoc,
  type VaultDocCategory,
  type VaultDocStatus,
} from '@/data/mock-vault';
import { BizDocumentDetailSheet } from '@/components/biz-home/biz-document-detail-sheet';

const ACCENT = MODE_ACCENT.business;

const STATUS_PILLS: VaultDocStatus[] = ['Active', 'Draft', 'Archived', 'Superseded'];

// Unique authors from all documents
const AUTHORS = [...new Set(VAULT_DOCS.flatMap((d) => d.versions.map((v) => v.createdBy)))];

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

export function BizVaultVersionsView({ colors, accent }: Props) {
  const [categoryFilter, setCategoryFilter] = useState<VaultDocCategory | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<VaultDocStatus | 'All'>('All');
  const [authorFilter, setAuthorFilter] = useState<string | 'All'>('All');
  const [selectedDoc, setSelectedDoc] = useState<VaultDoc | null>(null);

  // Sort: most recently updated first, archived grouped after active
  const sortedDocs = useMemo(() => {
    let docs = [...VAULT_DOCS];

    // Apply filters
    if (categoryFilter !== 'All') {
      docs = docs.filter((d) => d.category === categoryFilter);
    }
    if (statusFilter !== 'All') {
      docs = docs.filter((d) => d.status === statusFilter);
    }
    if (authorFilter !== 'All') {
      docs = docs.filter((d) => d.versions.some((v) => v.createdBy === authorFilter));
    }

    // Sort: Archived at bottom, then by lastModified descending
    docs.sort((a, b) => {
      if (a.status === 'Archived' && b.status !== 'Archived') return 1;
      if (a.status !== 'Archived' && b.status === 'Archived') return -1;
      return b.lastModified.localeCompare(a.lastModified);
    });

    return docs;
  }, [categoryFilter, statusFilter, authorFilter]);

  const handleOpenDoc = useCallback((doc: VaultDoc) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDoc(doc);
  }, []);

  return (
    <View style={s.container}>
      {/* ── Filter row ─────────────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterBar}
      >
        {/* Category filter */}
        <Pressable
          style={[s.filterPill, categoryFilter !== 'All' && { backgroundColor: ACCENT }]}
          onPress={() => {
            Haptics.selectionAsync();
            // Cycle through: All → each category
            const cats = ['All', ...VAULT_CATEGORIES] as const;
            const idx = cats.indexOf(categoryFilter as any);
            setCategoryFilter(cats[(idx + 1) % cats.length] as any);
          }}
        >
          <ThemedText style={[s.filterText, { color: categoryFilter !== 'All' ? '#000' : colors.textSecondary }]}>
            {categoryFilter === 'All' ? 'Category' : categoryFilter}
          </ThemedText>
          <IconSymbol name="chevron.down" size={9} color={categoryFilter !== 'All' ? '#000' : colors.textTertiary} />
        </Pressable>

        {/* Status filter */}
        {STATUS_PILLS.map((st) => {
          const isActive = statusFilter === st;
          return (
            <Pressable
              key={st}
              style={[s.filterPill, isActive && { backgroundColor: ACCENT }]}
              onPress={() => {
                Haptics.selectionAsync();
                setStatusFilter(isActive ? 'All' : st);
              }}
            >
              <ThemedText style={[s.filterText, { color: isActive ? '#000' : colors.textSecondary }]}>
                {st}
              </ThemedText>
            </Pressable>
          );
        })}

        {/* Author filter */}
        <Pressable
          style={[s.filterPill, authorFilter !== 'All' && { backgroundColor: ACCENT }]}
          onPress={() => {
            Haptics.selectionAsync();
            const options = ['All', ...AUTHORS];
            const idx = options.indexOf(authorFilter);
            setAuthorFilter(options[(idx + 1) % options.length]);
          }}
        >
          <ThemedText style={[s.filterText, { color: authorFilter !== 'All' ? '#000' : colors.textSecondary }]}>
            {authorFilter === 'All' ? 'Author' : authorFilter}
          </ThemedText>
          <IconSymbol name="chevron.down" size={9} color={authorFilter !== 'All' ? '#000' : colors.textTertiary} />
        </Pressable>
      </ScrollView>

      {/* ── Document list ───────────────────────────────────────────── */}
      <ScrollView contentContainerStyle={s.docList} showsVerticalScrollIndicator={false}>
        {sortedDocs.length === 0 ? (
          <View style={s.emptyState}>
            <ThemedText style={[s.emptyText, { color: colors.textTertiary }]}>
              No documents match filters.
            </ThemedText>
          </View>
        ) : (
          sortedDocs.map((doc) => {
            const statusColor = STATUS_COLORS[doc.status];
            const latestVersion = doc.versions[doc.versions.length - 1];
            return (
              <Pressable
                key={doc.id}
                style={[s.docCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleOpenDoc(doc)}
              >
                <View style={s.docTop}>
                  <View style={[s.fileTypeBadge, { backgroundColor: ACCENT + '15' }]}>
                    <ThemedText style={[s.fileTypeText, { color: ACCENT }]}>
                      {FILE_TYPE_LABELS[doc.fileType]}
                    </ThemedText>
                  </View>
                  <View style={s.docInfo}>
                    <ThemedText style={[s.docTitle, { color: colors.text }]} numberOfLines={1}>
                      {doc.title}
                    </ThemedText>
                    <ThemedText style={[s.docCategory, { color: colors.textTertiary }]}>
                      {doc.category}
                    </ThemedText>
                  </View>
                  <View style={[s.statusPill, { backgroundColor: statusColor + '15' }]}>
                    <View style={[s.statusDot, { backgroundColor: statusColor }]} />
                    <ThemedText style={[s.statusPillText, { color: statusColor }]}>{doc.status}</ThemedText>
                  </View>
                </View>

                {/* Latest version info */}
                <View style={s.versionRow}>
                  <ThemedText style={[s.versionLabel, { color: colors.textSecondary }]}>
                    v{doc.currentVersion}
                  </ThemedText>
                  <ThemedText style={[s.versionSep, { color: colors.textTertiary }]}>·</ThemedText>
                  <ThemedText style={[s.versionAuthor, { color: colors.textTertiary }]}>
                    {latestVersion?.createdBy}
                  </ThemedText>
                  <ThemedText style={[s.versionSep, { color: colors.textTertiary }]}>·</ThemedText>
                  <ThemedText style={[s.versionDate, { color: colors.textTertiary }]}>
                    {doc.lastModified}
                  </ThemedText>
                  {doc.versions.length > 1 && (
                    <>
                      <ThemedText style={[s.versionSep, { color: colors.textTertiary }]}>·</ThemedText>
                      <ThemedText style={[s.versionTotal, { color: colors.textSecondary }]}>
                        {doc.versions.length} versions
                      </ThemedText>
                    </>
                  )}
                </View>
              </Pressable>
            );
          })
        )}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Document Detail Sheet ──────────────────────────────────── */}
      <BizDocumentDetailSheet
        document={selectedDoc}
        visible={selectedDoc !== null}
        onClose={() => setSelectedDoc(null)}
        colors={colors}
      />
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: { flex: 1 },

  // Filter bar
  filterBar: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#2F3336',
  },
  filterText: { fontSize: 12, fontWeight: '600' },

  // Document list
  docList: { paddingHorizontal: 16 },
  docCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  docTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  fileTypeBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileTypeText: { fontSize: 10, fontWeight: '800' },
  docInfo: { flex: 1 },
  docTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  docCategory: { fontSize: 11 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusPillText: { fontSize: 10, fontWeight: '700' },

  // Version info row
  versionRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  versionLabel: { fontSize: 11, fontWeight: '600' },
  versionSep: { fontSize: 11 },
  versionAuthor: { fontSize: 11 },
  versionDate: { fontSize: 11 },
  versionTotal: { fontSize: 11, fontWeight: '600' },

  // Empty state
  emptyState: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 14 },
});
