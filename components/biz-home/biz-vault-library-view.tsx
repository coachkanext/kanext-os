/**
 * Biz Vault Library View — Default Vault view
 *
 * Left sidebar = horizontal category pills (mobile adaptation)
 * Main panel = document list filtered by selected category
 * Tap document → Document Detail Sheet
 *
 * Rendering Context: Founder / CEO (B1)
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
} from '@/data/mock-vault';
import { BizDocumentDetailSheet } from '@/components/biz-home/biz-document-detail-sheet';

const ACCENT = MODE_ACCENT.business;

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

export function BizVaultLibraryView({ colors, accent }: Props) {
  const [activeCategory, setActiveCategory] = useState<VaultDocCategory | 'All'>('All');
  const [selectedDoc, setSelectedDoc] = useState<VaultDoc | null>(null);

  const filteredDocs = useMemo(() => {
    if (activeCategory === 'All') return VAULT_DOCS;
    return VAULT_DOCS.filter((d) => d.category === activeCategory);
  }, [activeCategory]);

  const handleOpenDoc = useCallback((doc: VaultDoc) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDoc(doc);
  }, []);

  const handleCloseDoc = useCallback(() => {
    setSelectedDoc(null);
  }, []);

  // Count docs per category for badge
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: VAULT_DOCS.length };
    for (const doc of VAULT_DOCS) {
      counts[doc.category] = (counts[doc.category] ?? 0) + 1;
    }
    return counts;
  }, []);

  return (
    <View style={s.container}>
      {/* ── Category pills (horizontal scroll) ──────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.categoryBar}
      >
        <Pressable
          style={[s.categoryPill, activeCategory === 'All' && { backgroundColor: ACCENT }]}
          onPress={() => { Haptics.selectionAsync(); setActiveCategory('All'); }}
        >
          <ThemedText style={[s.categoryText, { color: activeCategory === 'All' ? '#000' : colors.textSecondary }]}>
            All ({categoryCounts.All})
          </ThemedText>
        </Pressable>
        {VAULT_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          const count = categoryCounts[cat] ?? 0;
          if (count === 0) return null;
          return (
            <Pressable
              key={cat}
              style={[s.categoryPill, isActive && { backgroundColor: ACCENT }]}
              onPress={() => { Haptics.selectionAsync(); setActiveCategory(cat); }}
            >
              <ThemedText style={[s.categoryText, { color: isActive ? '#000' : colors.textSecondary }]}>
                {cat} ({count})
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ── Document list ───────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={s.docList}
        showsVerticalScrollIndicator={false}
      >
        {filteredDocs.length === 0 ? (
          <View style={s.emptyState}>
            <ThemedText style={[s.emptyText, { color: colors.textTertiary }]}>
              No documents in this category.
            </ThemedText>
          </View>
        ) : (
          filteredDocs.map((doc) => {
            const statusColor = STATUS_COLORS[doc.status];
            return (
              <Pressable
                key={doc.id}
                style={[s.docCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleOpenDoc(doc)}
              >
                {/* File type badge */}
                <View style={[s.fileTypeBadge, { backgroundColor: ACCENT + '15' }]}>
                  <ThemedText style={[s.fileTypeText, { color: ACCENT }]}>
                    {FILE_TYPE_LABELS[doc.fileType]}
                  </ThemedText>
                </View>

                {/* Document info */}
                <View style={s.docInfo}>
                  <ThemedText style={[s.docTitle, { color: colors.text }]} numberOfLines={1}>
                    {doc.title}
                  </ThemedText>
                  <View style={s.docMeta}>
                    <ThemedText style={[s.docCategory, { color: colors.textTertiary }]}>
                      {doc.category}
                    </ThemedText>
                    <ThemedText style={[s.docSeparator, { color: colors.textTertiary }]}>·</ThemedText>
                    <ThemedText style={[s.docDate, { color: colors.textTertiary }]}>
                      {doc.lastModified}
                    </ThemedText>
                    <ThemedText style={[s.docSeparator, { color: colors.textTertiary }]}>·</ThemedText>
                    <ThemedText style={[s.docVersion, { color: colors.textSecondary }]}>
                      v{doc.currentVersion}
                    </ThemedText>
                  </View>
                </View>

                {/* Status pill */}
                <View style={[s.statusPill, { backgroundColor: statusColor + '15' }]}>
                  <View style={[s.statusDot, { backgroundColor: statusColor }]} />
                  <ThemedText style={[s.statusText, { color: statusColor }]}>{doc.status}</ThemedText>
                </View>

                {/* Lock indicator */}
                {doc.locked && (
                  <IconSymbol name="lock.fill" size={11} color={colors.textTertiary} style={s.lockIcon} />
                )}

                <IconSymbol name="chevron.right" size={10} color={colors.textTertiary} />
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
        onClose={handleCloseDoc}
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

  // Category bar
  categoryBar: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  categoryPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18, backgroundColor: '#2F3336' },
  categoryText: { fontSize: 12, fontWeight: '600' },

  // Document list
  docList: { paddingHorizontal: 16 },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  fileTypeBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileTypeText: { fontSize: 10, fontWeight: '800' },
  docInfo: { flex: 1 },
  docTitle: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  docMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  docCategory: { fontSize: 11 },
  docSeparator: { fontSize: 11 },
  docDate: { fontSize: 11 },
  docVersion: { fontSize: 11, fontWeight: '600' },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { fontSize: 10, fontWeight: '700' },
  lockIcon: { marginRight: 2 },

  // Empty state
  emptyState: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 14 },
});
