/**
 * Sports Organization Resources V2 — 6-view sub-tab hub.
 * Sub-tabs: Overview | Packs | Role Kits | Templates | Knowledge Base | Review Flags
 * RBAC: R1 full 6-tab, R2 (Player) Overview + Packs + Knowledge Base,
 *        R3 (Asst Coach) all except Review Flags, R4/R5 locked.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { SportsRoleLens } from '@/utils/sports-rbac';
import {
  getResourcesOverview,
  getResourcePacks,
  getRoleKits,
  getResourceTemplates,
  getKnowledgeBase,
  getReviewFlags,
  PACK_CATEGORY_LABEL,
  PACK_CATEGORY_COLOR,
  ROLE_KIT_ITEM_TYPE_LABEL,
  ROLE_KIT_ITEM_TYPE_COLOR,
  KB_CATEGORY_LABEL,
  KB_CATEGORY_COLOR,
  REVIEW_FLAG_REASON_LABEL,
  REVIEW_FLAG_REASON_COLOR,
} from '@/data/mock-sports-org-resources-v2';
import type {
  ResourcePack,
  RoleKit,
  ResourceTemplate,
  KnowledgeBaseItem,
  ReviewFlag,
} from '@/data/mock-sports-org-resources-v2';

// =============================================================================
// CONSTANTS
// =============================================================================

const SUB_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'packs', label: 'Packs' },
  { id: 'role-kits', label: 'Role Kits' },
  { id: 'templates', label: 'Templates' },
  { id: 'knowledge-base', label: 'Knowledge Base' },
  { id: 'review-flags', label: 'Review Flags' },
];

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: SportsRoleLens;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatDate(dateStr: string): string {
  if (!dateStr) return '--';
  const parts = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[parseInt(parts[1], 10) - 1] || parts[1];
  const day = parseInt(parts[2], 10);
  return `${month} ${day}`;
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyState({ icon, label, colors }: { icon: string; label: string; colors: typeof Colors.light }) {
  return (
    <View style={s.emptyContainer}>
      <IconSymbol name={icon as any} size={40} color={colors.textTertiary} />
      <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// STATUS BADGE
// =============================================================================

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.badge, { backgroundColor: color + '20' }]}>
      <ThemedText style={[s.badgeText, { color }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// SUB-TAB BAR
// =============================================================================

function SubTabBar({
  tabs,
  activeId,
  onSelect,
  accentColor,
  colors,
}: {
  tabs: typeof SUB_TABS;
  activeId: string;
  onSelect: (id: string) => void;
  accentColor: string;
  colors: typeof Colors.light;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.subTabRow}
      style={{ flexGrow: 0 }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <Pressable
            key={tab.id}
            style={[
              s.subTab,
              {
                borderBottomColor: isActive ? accentColor : 'transparent',
                borderBottomWidth: isActive ? 2 : 0,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(tab.id);
            }}
          >
            <ThemedText
              style={[
                s.subTabText,
                { color: isActive ? colors.text : colors.textSecondary },
              ]}
            >
              {tab.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// OVERVIEW SUB-TAB
// =============================================================================

function OverviewTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const overview = useMemo(() => getResourcesOverview(), []);
  const flags = useMemo(() => getReviewFlags(), []);
  const flaggedCount = flags.length;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* KPI Grid */}
      <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.kpiCardTitle, { color: colors.text }]}>Resources Overview</ThemedText>
        <View style={s.kpiGrid}>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: accentColor }]}>{overview.total}</ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Total Resources</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: '#f59e0b' }]}>{overview.pinned}</ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Pinned / Required</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: '#22c55e' }]}>{overview.updatedRecently}</ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Recently Updated</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: overview.stale > 0 ? '#ef4444' : '#22c55e' }]}>
              {overview.stale}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Stale</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: accentColor }]}>{overview.templates}</ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Templates</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: flaggedCount > 0 ? '#ef4444' : '#22c55e' }]}>
              {flaggedCount}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Flagged Items</ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// PACKS SUB-TAB
// =============================================================================

function PacksTab({
  colors,
  accentColor,
  packs,
  onSelectPack,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  packs: ResourcePack[];
  onSelectPack: (pack: ResourcePack) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: ResourcePack }) => {
      const catColor = PACK_CATEGORY_COLOR[item.category];
      const catLabel = PACK_CATEGORY_LABEL[item.category];
      return (
        <Pressable
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectPack(item);
          }}
        >
          <View style={s.cardHeader}>
            <ThemedText style={[s.cardTitle, { color: colors.text, flex: 1 }]} numberOfLines={2}>
              {item.name}
            </ThemedText>
            {item.requiredRead && (
              <StatusBadge label="PINNED" color="#f59e0b" />
            )}
          </View>
          <View style={s.badgeRow}>
            <StatusBadge label={catLabel.toUpperCase()} color={catColor} />
            <StatusBadge label={`${item.documentCount} DOCS`} color={colors.textSecondary} />
          </View>
          <View style={s.metaRow}>
            <View style={s.metaItem}>
              <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>{item.owner}</ThemedText>
            </View>
            <View style={s.metaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>Updated {formatDate(item.lastUpdated)}</ThemedText>
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectPack],
  );

  return (
    <FlatList
      data={packs}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="archivebox.fill" label="No resource packs available" colors={colors} />
      }
    />
  );
}

// =============================================================================
// ROLE KITS SUB-TAB
// =============================================================================

function RoleKitsTab({
  colors,
  accentColor,
  roleKits,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  roleKits: RoleKit[];
}) {
  const renderItem = useCallback(
    ({ item }: { item: RoleKit }) => {
      return (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.cardHeader}>
            <ThemedText style={[s.cardTitle, { color: colors.text, flex: 1 }]} numberOfLines={2}>
              {item.seatTitle}
            </ThemedText>
            <StatusBadge label={`${item.items.length} ITEMS`} color={accentColor} />
          </View>
          <View style={s.roleKitItemsList}>
            {item.items.map((kitItem, index) => {
              const typeColor = ROLE_KIT_ITEM_TYPE_COLOR[kitItem.type];
              const typeLabel = ROLE_KIT_ITEM_TYPE_LABEL[kitItem.type];
              return (
                <View key={`${item.id}-item-${index}`} style={s.roleKitItemRow}>
                  <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
                  <ThemedText style={[s.roleKitItemName, { color: colors.textSecondary }]} numberOfLines={1}>
                    {kitItem.name}
                  </ThemedText>
                </View>
              );
            })}
          </View>
          <View style={[s.metaRow, { marginTop: Spacing.sm }]}>
            <View style={s.metaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>Updated {formatDate(item.lastUpdated)}</ThemedText>
            </View>
          </View>
        </View>
      );
    },
    [colors, accentColor],
  );

  return (
    <FlatList
      data={roleKits}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="person.crop.rectangle.stack.fill" label="No role kits available" colors={colors} />
      }
    />
  );
}

// =============================================================================
// TEMPLATES SUB-TAB
// =============================================================================

function TemplatesTab({
  colors,
  accentColor,
  templates,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  templates: ResourceTemplate[];
}) {
  const renderItem = useCallback(
    ({ item }: { item: ResourceTemplate }) => {
      return (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.cardTitle, { color: colors.text }]} numberOfLines={2}>
            {item.name}
          </ThemedText>
          <View style={s.badgeRow}>
            <StatusBadge label={item.category.toUpperCase()} color={accentColor} />
            <StatusBadge label={`${item.usageCount} USES`} color={colors.textSecondary} />
          </View>
          <View style={s.metaRow}>
            <View style={s.metaItem}>
              <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>{item.owner}</ThemedText>
            </View>
            <View style={s.metaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>Last used {formatDate(item.lastUsed)}</ThemedText>
            </View>
          </View>
        </View>
      );
    },
    [colors, accentColor],
  );

  return (
    <FlatList
      data={templates}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="doc.text.fill" label="No templates available" colors={colors} />
      }
    />
  );
}

// =============================================================================
// KNOWLEDGE BASE SUB-TAB
// =============================================================================

function KnowledgeBaseTab({
  colors,
  accentColor,
  kbItems,
  onSelectKBItem,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  kbItems: KnowledgeBaseItem[];
  onSelectKBItem: (item: KnowledgeBaseItem) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: KnowledgeBaseItem }) => {
      const catColor = KB_CATEGORY_COLOR[item.category];
      const catLabel = KB_CATEGORY_LABEL[item.category];
      return (
        <Pressable
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectKBItem(item);
          }}
        >
          <View style={s.cardHeader}>
            <ThemedText style={[s.cardTitle, { color: colors.text, flex: 1 }]} numberOfLines={2}>
              {item.title}
            </ThemedText>
            {item.requiredRead && (
              <StatusBadge label="REQUIRED" color="#ef4444" />
            )}
          </View>
          <View style={s.badgeRow}>
            <StatusBadge label={catLabel.toUpperCase()} color={catColor} />
            <StatusBadge label={`${item.viewCount} VIEWS`} color={colors.textSecondary} />
          </View>
          <View style={s.metaRow}>
            <View style={s.metaItem}>
              <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>{item.owner}</ThemedText>
            </View>
            <View style={s.metaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>Updated {formatDate(item.lastUpdated)}</ThemedText>
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectKBItem],
  );

  return (
    <FlatList
      data={kbItems}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="book.fill" label="No knowledge base items" colors={colors} />
      }
    />
  );
}

// =============================================================================
// REVIEW FLAGS SUB-TAB
// =============================================================================

function ReviewFlagsTab({
  colors,
  accentColor,
  flags,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  flags: ReviewFlag[];
}) {
  const renderItem = useCallback(
    ({ item }: { item: ReviewFlag }) => {
      const reasonColor = REVIEW_FLAG_REASON_COLOR[item.reason];
      const reasonLabel = REVIEW_FLAG_REASON_LABEL[item.reason];
      return (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.cardTitle, { color: colors.text }]} numberOfLines={2}>
            {item.resourceName}
          </ThemedText>
          <View style={s.badgeRow}>
            <StatusBadge label={reasonLabel.toUpperCase()} color={reasonColor} />
            {item.daysStale !== null && (
              <StatusBadge label={`${item.daysStale}D STALE`} color="#f59e0b" />
            )}
          </View>
          <View style={s.metaRow}>
            <View style={s.metaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>Flagged {formatDate(item.flagDate)}</ThemedText>
            </View>
          </View>
        </View>
      );
    },
    [colors, accentColor],
  );

  return (
    <FlatList
      data={flags}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="flag.fill" label="No review flags" colors={colors} />
      }
    />
  );
}

// =============================================================================
// PACK DETAIL BOTTOM SHEET
// =============================================================================

function PackDetailSheet({
  visible,
  onClose,
  pack,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  pack: ResourcePack | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!pack) return null;

  const catColor = PACK_CATEGORY_COLOR[pack.category];
  const catLabel = PACK_CATEGORY_LABEL[pack.category];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={pack.name} useModal>
      {/* Badge Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={catLabel.toUpperCase()} color={catColor} />
        {pack.requiredRead && <StatusBadge label="PINNED" color="#f59e0b" />}
        <StatusBadge label={`${pack.documentCount} DOCS`} color={colors.textSecondary} />
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{catLabel}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Category</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{pack.owner}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Owner</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{pack.documentCount}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Documents</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{formatDate(pack.lastUpdated)}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Last Updated</ThemedText>
          </View>
        </View>
      </View>

      {/* Audience */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Audience</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>
          {pack.requiredRead ? 'Required reading for all applicable staff' : 'Available for all program staff'}
        </ThemedText>
      </View>

      {/* Pinned Status */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Pinned Status</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>
          {pack.requiredRead ? 'This pack is pinned as required reading' : 'This pack is not pinned'}
        </ThemedText>
      </View>

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>Close</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// KB ITEM DETAIL BOTTOM SHEET
// =============================================================================

function KBItemDetailSheet({
  visible,
  onClose,
  kbItem,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  kbItem: KnowledgeBaseItem | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!kbItem) return null;

  const catColor = KB_CATEGORY_COLOR[kbItem.category];
  const catLabel = KB_CATEGORY_LABEL[kbItem.category];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={kbItem.title} useModal>
      {/* Badge Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={catLabel.toUpperCase()} color={catColor} />
        {kbItem.requiredRead && <StatusBadge label="REQUIRED" color="#ef4444" />}
        <StatusBadge label={`${kbItem.viewCount} VIEWS`} color={colors.textSecondary} />
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{catLabel}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Category</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{kbItem.owner}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Owner</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{formatDate(kbItem.lastUpdated)}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Last Updated</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{kbItem.viewCount}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>View Count</ThemedText>
          </View>
        </View>
      </View>

      {/* Audience */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Audience</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>
          {kbItem.requiredRead ? 'Required reading for all applicable staff' : 'Available for all program members'}
        </ThemedText>
      </View>

      {/* Body Preview */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Body Preview</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>
          This knowledge base article covers key information about {kbItem.title.toLowerCase()}.
          Content is maintained by {kbItem.owner} and was last updated on {formatDate(kbItem.lastUpdated)}.
        </ThemedText>
      </View>

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>Close</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function SportsOrgResourcesV2({ colors, accentColor, role = 'R1' }: Props) {
  // === RBAC Gate: R4/R5 locked ===
  if (role === 'R4' || role === 'R5') {
    return (
      <View style={s.lockedContainer}>
        <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
        <ThemedText style={[s.lockedTitle, { color: colors.text }]}>Resources</ThemedText>
        <ThemedText style={[s.lockedMessage, { color: colors.textSecondary }]}>
          Resource information is not available for your role
        </ThemedText>
      </View>
    );
  }

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [drillMode, setDrillMode] = useState(false);
  const [selectedPack, setSelectedPack] = useState<ResourcePack | null>(null);
  const [packSheetVisible, setPackSheetVisible] = useState(false);
  const [selectedKBItem, setSelectedKBItem] = useState<KnowledgeBaseItem | null>(null);
  const [kbItemSheetVisible, setKBItemSheetVisible] = useState(false);

  // === Data ===
  const packs = useMemo(() => getResourcePacks(), []);
  const roleKits = useMemo(() => getRoleKits(), []);
  const templates = useMemo(() => getResourceTemplates(), []);
  const kbItems = useMemo(() => getKnowledgeBase(), []);
  const flags = useMemo(() => getReviewFlags(), []);

  // === Callbacks ===
  const handleSelectPack = useCallback((pack: ResourcePack) => {
    setSelectedPack(pack);
    setPackSheetVisible(true);
  }, []);

  const handleClosePackSheet = useCallback(() => {
    setPackSheetVisible(false);
  }, []);

  const handleSelectKBItem = useCallback((item: KnowledgeBaseItem) => {
    setSelectedKBItem(item);
    setKBItemSheetVisible(true);
  }, []);

  const handleCloseKBItemSheet = useCallback(() => {
    setKBItemSheetVisible(false);
  }, []);

  // === RBAC-aware sub-tabs ===
  const visibleSubTabs = useMemo(() => {
    if (role === 'R1') return SUB_TABS; // R1: full 6 tabs
    if (role === 'R3') {
      // R3 (Asst Coach): all except Review Flags
      return SUB_TABS.filter((t) => t.id !== 'review-flags');
    }
    if (role === 'R2') {
      // R2 (Player): Overview + Packs + Knowledge Base
      return SUB_TABS.filter(
        (t) => t.id === 'overview' || t.id === 'packs' || t.id === 'knowledge-base',
      );
    }
    return SUB_TABS;
  }, [role]);

  // === Sub-tab content ===
  const renderContent = () => {
    switch (activeSubTab) {
      case 'overview':
        return <OverviewTab colors={colors} accentColor={accentColor} />;
      case 'packs':
        return (
          <PacksTab
            colors={colors}
            accentColor={accentColor}
            packs={packs}
            onSelectPack={handleSelectPack}
          />
        );
      case 'role-kits':
        if (role === 'R2') return null;
        return (
          <RoleKitsTab
            colors={colors}
            accentColor={accentColor}
            roleKits={roleKits}
          />
        );
      case 'templates':
        if (role === 'R2') return null;
        return (
          <TemplatesTab
            colors={colors}
            accentColor={accentColor}
            templates={templates}
          />
        );
      case 'knowledge-base':
        return (
          <KnowledgeBaseTab
            colors={colors}
            accentColor={accentColor}
            kbItems={kbItems}
            onSelectKBItem={handleSelectKBItem}
          />
        );
      case 'review-flags':
        if (role !== 'R1') return null;
        return (
          <ReviewFlagsTab
            colors={colors}
            accentColor={accentColor}
            flags={flags}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={s.container}>
      {/* Sub-tab bar — hidden until drill mode */}
      {drillMode ? (
        <>
          <Pressable
            style={[s.overviewBackBar, { borderBottomColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setDrillMode(false);
              setActiveSubTab('overview');
            }}
          >
            <IconSymbol name="chevron.left" size={14} color={accentColor} />
            <ThemedText style={[s.overviewBackText, { color: accentColor }]}>Overview</ThemedText>
          </Pressable>
          <SubTabBar
            tabs={visibleSubTabs}
            activeId={activeSubTab}
            onSelect={setActiveSubTab}
            accentColor={accentColor}
            colors={colors}
          />
        </>
      ) : null}

      {/* Content */}
      <View style={s.contentContainer}>
        {renderContent()}
      </View>

      {/* Explore bar — overview-only mode */}
      {!drillMode && (
        <Pressable
          style={[s.exploreBar, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setDrillMode(true);
          }}
        >
          <IconSymbol name="rectangle.grid.1x2.fill" size={16} color="#FFFFFF" />
          <ThemedText style={s.exploreBarText}>Explore All Sections</ThemedText>
          <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
        </Pressable>
      )}

      {/* Pack Detail Bottom Sheet */}
      <PackDetailSheet
        visible={packSheetVisible}
        onClose={handleClosePackSheet}
        pack={selectedPack}
        colors={colors}
        accentColor={accentColor}
      />

      {/* KB Item Detail Bottom Sheet */}
      <KBItemDetailSheet
        visible={kbItemSheetVisible}
        onClose={handleCloseKBItemSheet}
        kbItem={selectedKBItem}
        colors={colors}
        accentColor={accentColor}
      />
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },

  // -- Locked state --
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  lockedTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  lockedMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  // -- Overview / Drill mode --
  overviewBackBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  overviewBackText: {
    fontSize: 14,
    fontWeight: '600',
  },
  exploreBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  exploreBarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // -- Sub-tab bar --
  subTabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  subTab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  subTabText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Tab scroll containers --
  tabScroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  tabListContent: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  // -- Empty state --
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    fontSize: 14,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },

  // -- Badge --
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // -- KPI Card --
  kpiCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  kpiCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  kpiItem: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  kpiLabel: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },

  // -- Card --
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    marginBottom: Spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
  },

  // -- Role Kit Items --
  roleKitItemsList: {
    gap: 6,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  roleKitItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  roleKitItemName: {
    fontSize: 12,
    flex: 1,
  },

  // -- Bottom Sheet --
  sheetBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  sheetSection: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  sheetBodyText: {
    fontSize: 13,
    lineHeight: 19,
  },
  sheetDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  sheetDetailItem: {
    width: '47%',
    marginBottom: Spacing.sm,
  },
  sheetDetailValue: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  sheetDetailLabel: {
    fontSize: 11,
  },
  sheetActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  sheetGhostButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  sheetGhostButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
