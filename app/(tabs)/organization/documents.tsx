/**
 * Documents Screen
 * Business data room documents for investors and founders.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable, SectionList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext } from '@/context/app-context';
import {
  DOCUMENTS,
  getDocumentsByVisibility,
  getCategoryLabel,
  getFileTypeIcon,
} from '@/data/mock-business-investor';
import type { Document, DocumentCategory, Role } from '@/types';

// =============================================================================
// COMPONENTS
// =============================================================================

interface DocumentRowProps {
  document: Document;
  colors: typeof Colors.light;
  accentColor: string;
  onPress: () => void;
}

function DocumentRow({ document, colors, accentColor, onPress }: DocumentRowProps) {
  const iconName = getFileTypeIcon(document.fileType) as IconSymbolName;
  const isRestricted = document.visibility === 'founder';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.documentRow,
        { backgroundColor: colors.card },
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
    >
      <View style={[styles.documentIcon, { backgroundColor: accentColor + '15' }]}>
        <IconSymbol name={iconName} size={20} color={accentColor} />
      </View>
      <View style={styles.documentInfo}>
        <ThemedText style={styles.documentTitle} numberOfLines={1}>
          {document.title}
        </ThemedText>
        {document.description && (
          <ThemedText style={[styles.documentDesc, { color: colors.textSecondary }]} numberOfLines={1}>
            {document.description}
          </ThemedText>
        )}
        <ThemedText style={[styles.documentMeta, { color: colors.textTertiary }]}>
          Updated {formatDate(document.updatedAt)}
        </ThemedText>
      </View>
      <View style={styles.documentBadges}>
        {isRestricted && (
          <View style={[styles.restrictedBadge, { backgroundColor: colors.backgroundTertiary }]}>
            <IconSymbol name="lock.fill" size={10} color={colors.textTertiary} />
          </View>
        )}
        <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
      </View>
    </Pressable>
  );
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// =============================================================================
// FILTER TABS
// =============================================================================

type FilterTab = 'all' | 'investor_materials' | 'governance' | 'institutional_brief' | 'roadmap';

interface FilterTabsProps {
  active: FilterTab;
  onChange: (tab: FilterTab) => void;
  colors: typeof Colors.light;
  accentColor: string;
  counts: Record<FilterTab, number>;
}

function FilterTabs({ active, onChange, colors, accentColor, counts }: FilterTabsProps) {
  const tabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'investor_materials', label: 'Investor' },
    { id: 'governance', label: 'Governance' },
    { id: 'institutional_brief', label: 'Brief' },
    { id: 'roadmap', label: 'Roadmap' },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterTabs}
    >
      {tabs.map((tab) => (
        <Pressable
          key={tab.id}
          style={[
            styles.filterTab,
            {
              backgroundColor: active === tab.id ? accentColor : colors.backgroundSecondary,
            },
          ]}
          onPress={() => onChange(tab.id)}
        >
          <ThemedText
            style={[
              styles.filterTabText,
              { color: active === tab.id ? '#FFFFFF' : colors.textSecondary },
            ]}
          >
            {tab.label} ({counts[tab.id]})
          </ThemedText>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function DocumentsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state } = useAppContext();
  const modeColors = ModeColors.business;

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  // Get user role for filtering - default to investor for demo
  const userRole = (state.operatingRole as 'founder' | 'investor' | 'viewer') || 'investor';

  // Filter documents based on user role
  const visibleDocuments = useMemo(() => {
    return getDocumentsByVisibility('public', userRole);
  }, [userRole]);

  // Calculate counts for each category
  const counts = useMemo(() => {
    const result: Record<FilterTab, number> = {
      all: visibleDocuments.length,
      investor_materials: 0,
      governance: 0,
      institutional_brief: 0,
      roadmap: 0,
    };

    visibleDocuments.forEach((doc) => {
      if (doc.category in result) {
        (result as Record<string, number>)[doc.category]++;
      }
    });

    return result;
  }, [visibleDocuments]);

  // Filter by category
  const filteredDocuments = useMemo(() => {
    if (activeFilter === 'all') return visibleDocuments;
    return visibleDocuments.filter((doc) => doc.category === activeFilter);
  }, [visibleDocuments, activeFilter]);

  // Group by category for section list
  const sections = useMemo(() => {
    const grouped = filteredDocuments.reduce(
      (acc, doc) => {
        const category = doc.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(doc);
        return acc;
      },
      {} as Record<DocumentCategory, Document[]>
    );

    return Object.entries(grouped).map(([category, docs]) => ({
      title: getCategoryLabel(category as DocumentCategory),
      data: docs,
    }));
  }, [filteredDocuments]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleDocumentPress = (document: Document) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // In production, would open document viewer or external link
    console.log('Open document:', document.title);
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
            Documents
          </ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {visibleDocuments.length} files available
          </ThemedText>
        </View>
      </View>

      {/* Filter Tabs */}
      <FilterTabs
        active={activeFilter}
        onChange={setActiveFilter}
        colors={colors}
        accentColor={modeColors.primary}
        counts={counts}
      />

      {/* Documents List */}
      {sections.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol name="doc.fill" size={48} color={colors.textTertiary} />
          <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
            No documents in this category
          </ThemedText>
          <ThemedText style={[styles.emptySubtext, { color: colors.textTertiary }]}>
            Try selecting a different category or check back later.
          </ThemedText>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DocumentRow
              document={item}
              colors={colors}
              accentColor={modeColors.primary}
              onPress={() => handleDocumentPress(item)}
            />
          )}
          renderSectionHeader={({ section }) => (
            <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
              <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                {section.title}
              </ThemedText>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, { backgroundColor: colors.divider }]} />
          )}
        />
      )}

      {/* Role Info */}
      <View style={[styles.roleInfo, { backgroundColor: colors.backgroundSecondary, borderTopColor: colors.border }]}>
        <IconSymbol name="eye.fill" size={14} color={colors.textTertiary} />
        <ThemedText style={[styles.roleInfoText, { color: colors.textTertiary }]}>
          Viewing as {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
        </ThemedText>
      </View>
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

  // Filter Tabs
  filterTabs: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  filterTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Section Header
  sectionHeader: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Document Row
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  documentDesc: {
    fontSize: 13,
    marginTop: 1,
  },
  documentMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  documentBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  restrictedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // List
  listContent: {
    paddingBottom: 80,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md + 40 + Spacing.sm,
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontSize: 15,
    marginTop: Spacing.sm,
  },
  emptySubtext: {
    fontSize: 13,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },

  // Role Info
  roleInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingBottom: Spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  roleInfoText: {
    fontSize: 12,
  },
});
