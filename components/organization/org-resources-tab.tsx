/**
 * Organization Resources Tab — 13-tab Resources Hub (Sports-only).
 * Library, Packs, Templates, Drillbook, Playbook, Scouting,
 * Ops, Forms, Saved Nexus, Links, Reports, Audit, Settings.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  TextInput,
  Pressable,
  Switch,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme'
;
import {
  RESOURCES_TABS,
  DRILL_CATEGORY_COLOR,
  PLAY_STATUS_COLOR,
  TEMPLATE_STATUS_COLOR,
  VISIBILITY_COLOR,
  LINK_PLATFORM_COLOR,
  getResourcesData,
} from '@/data/mock-resources-v2';
import type {
  ResourcesTabId,
  LibraryCollection,
  ResourceItem,
  ResourcePack,
  ResourceTemplate,
  ResourceDrill,
  ResourcePlay,
  ResourceScoutingItem,
  ResourceOpsSOP,
  ResourceForm,
  ResourceNexusSnapshot,
  ResourceLink,
  ResourceReport,
  ResourceAuditEntry,
  ResourceSettingToggle,
} from '@/data/mock-resources-v2';

// =============================================================================
// PROPS
// =============================================================================

interface OrgResourcesTabProps {
  colors: typeof Colors.light;
  accentColor: string;
}

// =============================================================================
// REPORT FORMAT COLORS
// =============================================================================

const REPORT_FORMAT_COLOR: Record<ResourceReport['format'], string> = {
  PDF: '#1D9BF0',
  CSV: '#22C55E',
  XLSX: '#F59E0B',
};

// =============================================================================
// AUDIT ICON MAP
// =============================================================================

function auditIcon(action: string): string {
  switch (action) {
    case 'resource_created':
      return 'plus.circle.fill';
    case 'resource_updated':
      return 'pencil.circle.fill';
    case 'pack_created':
      return 'folder.badge.plus';
    case 'template_cloned':
      return 'doc.on.doc.fill';
    case 'form_acknowledged':
      return 'checkmark.seal.fill';
    case 'link_added':
      return 'link.badge.plus';
    case 'snapshot_saved':
      return 'camera.fill';
    case 'setting_changed':
      return 'gearshape.fill';
    default:
      return 'clock.fill';
  }
}

function auditColor(action: string): string {
  switch (action) {
    case 'resource_created':
      return '#22C55E';
    case 'resource_updated':
      return accent;
    case 'pack_created':
      return '#F59E0B';
    case 'template_cloned':
      return accent;
    case 'form_acknowledged':
      return accent;
    case 'link_added':
      return accent;
    case 'snapshot_saved':
      return '#EF4444';
    case 'setting_changed':
      return '#A1A1AA';
    default:
      return '#A1A1AA';
  }
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function OrgResourcesTab({ colors, accentColor }: OrgResourcesTabProps) {
  // === State ===
  const [activeTab, setActiveTab] = useState<ResourcesTabId>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [drillCategoryFilter, setDrillCategoryFilter] = useState<string>('all');
  const [settingToggles, setSettingToggles] = useState<Record<string, boolean>>({});

  // === Data ===
  const data = getResourcesData();

  // === Callbacks ===
  const handleTabPress = useCallback((tabId: ResourcesTabId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tabId);
  }, []);

  const handleDrillCategoryPress = useCallback((cat: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDrillCategoryFilter(cat);
  }, []);

  // ===================================================================
  // RENDER — TAB CONTENT
  // ===================================================================

  const renderTabContent = () => {
    switch (activeTab) {
      case 'library':
        return renderLibrary();
      case 'packs':
        return renderPacks();
      case 'templates':
        return renderTemplates();
      case 'drillbook':
        return renderDrillbook();
      case 'playbook':
        return renderPlaybook();
      case 'scouting':
        return renderScouting();
      case 'ops':
        return renderOps();
      case 'forms':
        return renderForms();
      case 'saved-nexus':
        return renderSavedNexus();
      case 'links':
        return renderLinks();
      case 'reports':
        return renderReports();
      case 'audit':
        return renderAudit();
      case 'settings':
        return renderSettings();
      default:
        return null;
    }
  };

  // === Tab 1: Library ===
  const renderLibrary = () => {
    const filteredItems = searchQuery
      ? data.libraryItems.filter(
          (item) =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())),
        )
      : data.libraryItems;

    return (
      <FlatList<ResourceItem>
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.listContent}
        ListHeaderComponent={
          <View style={s.libraryHeader}>
            {/* Search bar */}
            <View style={[s.searchBar, { backgroundColor: colors.backgroundTertiary }]}>
              <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
              <TextInput
                style={[s.searchInput, { color: colors.text }]}
                placeholder="Search library..."
                placeholderTextColor={colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Collection grid */}
            <View style={s.collectionGrid}>
              {data.collections.map((col: LibraryCollection) => (
                <Pressable
                  key={col.id}
                  style={[s.collectionCard, { backgroundColor: colors.card }]}
                  onPress={() =>
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  }
                >
                  <View style={[s.collectionIconCircle, { backgroundColor: accentColor + '18' }]}>
                    <IconSymbol name={col.icon as any} size={18} color={accentColor} />
                  </View>
                  <ThemedText style={[s.collectionName, { color: colors.text }]} numberOfLines={1}>
                    {col.name}
                  </ThemedText>
                  <ThemedText style={[s.collectionCount, { color: colors.textSecondary }]}>
                    {col.itemCount} items
                  </ThemedText>
                  <ThemedText
                    style={[s.collectionDesc, { color: colors.textTertiary }]}
                    numberOfLines={2}
                  >
                    {col.description}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            {/* Recent items header */}
            <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>
              Recent Items
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => {
          const visColor = VISIBILITY_COLOR[item.visibility];
          return (
            <Pressable
              style={[s.listCard, { backgroundColor: colors.card }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={s.listCardRow}>
                <View style={[s.avatarCircle, { backgroundColor: accentColor + '25' }]}>
                  <ThemedText style={[s.avatarText, { color: accentColor }]}>
                    {item.ownerInitials}
                  </ThemedText>
                </View>
                <View style={s.listCardInfo}>
                  <View style={s.titleRow}>
                    <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
                      {item.title}
                    </ThemedText>
                    {item.pinned && (
                      <IconSymbol name="pin.fill" size={12} color={accentColor} />
                    )}
                  </View>
                  <View style={s.badgeRow}>
                    <View style={[s.badge, { backgroundColor: colors.backgroundTertiary }]}>
                      <ThemedText style={[s.badgeText, { color: colors.textSecondary }]}>
                        {item.type}
                      </ThemedText>
                    </View>
                    <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                      <ThemedText style={[s.badgeText, { color: accentColor }]}>
                        {item.category}
                      </ThemedText>
                    </View>
                    <View style={[s.badge, { backgroundColor: visColor + '33' }]}>
                      <ThemedText style={[s.badgeText, { color: visColor }]}>
                        {item.visibility.replace('-', ' ')}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                    {item.updatedAt}
                  </ThemedText>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    );
  };

  // === Tab 2: Packs ===
  const renderPacks = () => (
    <FlatList<ResourcePack>
      data={data.packs}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListHeaderComponent={
        <Pressable
          style={[s.newButton, { backgroundColor: accentColor }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="plus" size={14} color="#000" />
          <ThemedText style={s.newButtonText}>New Pack</ThemedText>
        </Pressable>
      }
      renderItem={({ item }) => {
        const completionMatch = item.completionStatus?.match(/(\d+)\/(\d+)/);
        const completionRatio =
          completionMatch
            ? parseInt(completionMatch[1], 10) / parseInt(completionMatch[2], 10)
            : 0;
        return (
          <Pressable
            style={[s.listCard, { backgroundColor: colors.card }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={s.listCardInfo}>
              <ThemedText style={[s.listCardTitle, { color: colors.text }]}>
                {item.title}
              </ThemedText>
              <ThemedText
                style={[s.listCardSub, { color: colors.textTertiary }]}
                numberOfLines={2}
              >
                {item.description}
              </ThemedText>
              <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
                {item.itemCount} items
              </ThemedText>
              {item.assignedTo && (
                <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
                  Assigned to: {item.assignedTo}
                </ThemedText>
              )}
              {item.completionStatus && (
                <View style={s.progressRow}>
                  <View style={[s.progressTrack, { backgroundColor: colors.text + '10' }]}>
                    <View
                      style={[
                        s.progressFill,
                        {
                          width: `${completionRatio * 100}%`,
                          backgroundColor: accentColor,
                        },
                      ]}
                    />
                  </View>
                  <ThemedText style={[s.progressLabel, { color: colors.textSecondary }]}>
                    {item.completionStatus}
                  </ThemedText>
                </View>
              )}
              <View style={s.packBottomRow}>
                <View style={[s.avatarCircle, { backgroundColor: accentColor + '25' }]}>
                  <ThemedText style={[s.avatarText, { color: accentColor }]}>
                    {item.ownerInitials}
                  </ThemedText>
                </View>
                <View style={[s.badge, { backgroundColor: colors.backgroundTertiary }]}>
                  <ThemedText style={[s.badgeText, { color: colors.textSecondary }]}>
                    {item.scope}
                  </ThemedText>
                </View>
              </View>
            </View>
          </Pressable>
        );
      }}
    />
  );

  // === Tab 3: Templates ===
  const renderTemplates = () => (
    <FlatList<ResourceTemplate>
      data={data.templates}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      renderItem={({ item }) => {
        const statusColor = TEMPLATE_STATUS_COLOR[item.status];
        const isDraft = item.status === 'draft';
        return (
          <Pressable
            style={[
              s.listCard,
              { backgroundColor: colors.card },
              isDraft && { borderLeftWidth: 3, borderLeftColor: '#F59E0B' },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={s.listCardRow}>
              <View style={[s.avatarCircle, { backgroundColor: accentColor + '25' }]}>
                <ThemedText style={[s.avatarText, { color: accentColor }]}>
                  {item.ownerInitials}
                </ThemedText>
              </View>
              <View style={s.listCardInfo}>
                <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.title}
                </ThemedText>
                <ThemedText
                  style={[s.listCardSub, { color: colors.textTertiary }]}
                  numberOfLines={1}
                >
                  {item.description}
                </ThemedText>
                <View style={s.badgeRow}>
                  <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                    <ThemedText style={[s.badgeText, { color: accentColor }]}>
                      {item.category}
                    </ThemedText>
                  </View>
                  <View style={[s.badge, { backgroundColor: colors.backgroundTertiary }]}>
                    <ThemedText style={[s.badgeText, { color: colors.textSecondary }]}>
                      v{item.version}
                    </ThemedText>
                  </View>
                  <View style={[s.statusDot, { backgroundColor: statusColor }]} />
                </View>
                <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                  Used {item.usageCount} times
                </ThemedText>
              </View>
            </View>
          </Pressable>
        );
      }}
    />
  );

  // === Tab 4: Drillbook ===
  const renderDrillbook = () => {
    const categories = ['all', ...Object.keys(DRILL_CATEGORY_COLOR)] as const;
    const filteredDrills =
      drillCategoryFilter === 'all'
        ? data.drills
        : data.drills.filter((d) => d.category === drillCategoryFilter);

    return (
      <FlatList<ResourceDrill>
        data={filteredDrills}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.listContent}
        ListHeaderComponent={
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.chipRow}
            style={s.chipRowContainer}
          >
            {categories.map((cat) => {
              const isActive = drillCategoryFilter === cat;
              const chipColor =
                cat === 'all'
                  ? accentColor
                  : DRILL_CATEGORY_COLOR[cat as ResourceDrill['category']];
              return (
                <Pressable
                  key={cat}
                  style={[
                    s.chipPill,
                    {
                      backgroundColor: isActive ? chipColor + '30' : colors.backgroundTertiary,
                    },
                  ]}
                  onPress={() => handleDrillCategoryPress(cat)}
                >
                  {cat !== 'all' && (
                    <View
                      style={[
                        s.chipDot,
                        {
                          backgroundColor:
                            DRILL_CATEGORY_COLOR[cat as ResourceDrill['category']],
                        },
                      ]}
                    />
                  )}
                  <ThemedText
                    style={[
                      s.chipText,
                      { color: isActive ? chipColor : colors.textSecondary },
                    ]}
                  >
                    {cat === 'all' ? 'All' : cat.replace('-', ' ')}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
        }
        renderItem={({ item }) => {
          const catColor = DRILL_CATEGORY_COLOR[item.category];
          return (
            <Pressable
              style={[s.listCard, { backgroundColor: colors.card }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={s.listCardInfo}>
                <View style={s.drillTopRow}>
                  <View style={[s.statusDot, { backgroundColor: catColor }]} />
                  <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </ThemedText>
                  <View style={[s.badge, { backgroundColor: colors.backgroundTertiary }]}>
                    <ThemedText style={[s.badgeText, { color: colors.textSecondary }]}>
                      {item.timeMinutes} min
                    </ThemedText>
                  </View>
                </View>
                <ThemedText
                  style={[s.listCardSub, { color: colors.textTertiary }]}
                  numberOfLines={1}
                >
                  {item.goal}
                </ThemedText>
                <View style={s.drillStatsRow}>
                  <ThemedText style={[s.drillStat, { color: colors.textSecondary }]}>
                    {item.teachingPoints} teaching pts
                  </ThemedText>
                  <ThemedText style={[s.drillStat, { color: colors.textSecondary }]}>
                    {item.progressions} progressions
                  </ThemedText>
                  {item.reps != null && (
                    <ThemedText style={[s.drillStat, { color: colors.textSecondary }]}>
                      {item.reps} reps
                    </ThemedText>
                  )}
                </View>
                {item.equipment.length > 0 && (
                  <View style={s.tagRow}>
                    {item.equipment.map((eq) => (
                      <View
                        key={eq}
                        style={[s.badge, { backgroundColor: colors.backgroundTertiary }]}
                      >
                        <ThemedText style={[s.badgeText, { color: colors.textSecondary }]}>
                          {eq}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                )}
                <View style={s.tagRow}>
                  {item.skillTags.map((tag) => (
                    <View
                      key={tag}
                      style={[s.badge, { backgroundColor: accentColor + '18' }]}
                    >
                      <ThemedText style={[s.badgeText, { color: accentColor }]}>{tag}</ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    );
  };

  // === Tab 5: Playbook ===
  const renderPlaybook = () => {
    const offensePlays = data.plays.filter((p) => p.side === 'offense');
    const defensePlays = data.plays.filter((p) => p.side === 'defense');

    const renderPlayRow = ({ item }: { item: ResourcePlay }) => {
      const statusColor = PLAY_STATUS_COLOR[item.status];
      return (
        <Pressable
          style={[s.listCard, { backgroundColor: colors.card }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <View style={s.listCardInfo}>
            <View style={s.playTopRow}>
              <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </ThemedText>
              {item.alias && (
                <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                  <ThemedText style={[s.badgeText, { color: accentColor }]}>
                    {item.alias}
                  </ThemedText>
                </View>
              )}
              <View style={[s.statusDot, { backgroundColor: statusColor }]} />
            </View>
            <View style={s.tagRow}>
              {item.purposeTags.map((tag) => (
                <View
                  key={tag}
                  style={[s.badge, { backgroundColor: colors.backgroundTertiary }]}
                >
                  <ThemedText style={[s.badgeText, { color: colors.textSecondary }]}>
                    {tag}
                  </ThemedText>
                </View>
              ))}
            </View>
            <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
              Personnel: {item.personnel}
            </ThemedText>
            <View style={s.drillStatsRow}>
              <ThemedText style={[s.drillStat, { color: colors.textSecondary }]}>
                {item.teachingPoints} teaching pts
              </ThemedText>
              <ThemedText style={[s.drillStat, { color: colors.textSecondary }]}>
                {item.counters} counters
              </ThemedText>
              <ThemedText style={[s.drillStat, { color: colors.textSecondary }]}>
                {item.filmExamples} film
              </ThemedText>
            </View>
          </View>
        </Pressable>
      );
    };

    return (
      <ScrollView contentContainerStyle={s.listContent}>
        <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>Offense</ThemedText>
        {offensePlays.map((play) => (
          <View key={play.id}>{renderPlayRow({ item: play })}</View>
        ))}
        <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: Spacing.md }]}>
          Defense
        </ThemedText>
        {defensePlays.map((play) => (
          <View key={play.id}>{renderPlayRow({ item: play })}</View>
        ))}
      </ScrollView>
    );
  };

  // === Tab 6: Scouting ===
  const renderScouting = () => (
    <FlatList<ResourceScoutingItem>
      data={data.scoutingItems}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      renderItem={({ item }) => (
        <Pressable
          style={[s.listCard, { backgroundColor: colors.card }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <View style={s.listCardRow}>
            <View style={[s.avatarCircle, { backgroundColor: accentColor + '25' }]}>
              <ThemedText style={[s.avatarText, { color: accentColor }]}>
                {item.ownerInitials}
              </ThemedText>
            </View>
            <View style={s.listCardInfo}>
              <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </ThemedText>
              <View style={[s.badge, { backgroundColor: colors.backgroundTertiary, alignSelf: 'flex-start' }]}>
                <ThemedText style={[s.badgeText, { color: colors.textSecondary }]}>
                  {item.type}
                </ThemedText>
              </View>
              <ThemedText
                style={[s.listCardSub, { color: colors.textTertiary }]}
                numberOfLines={2}
              >
                {item.description}
              </ThemedText>
              <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                Updated: {item.lastUpdated}
              </ThemedText>
            </View>
          </View>
        </Pressable>
      )}
    />
  );

  // === Tab 7: Ops ===
  const renderOps = () => (
    <FlatList<ResourceOpsSOP>
      data={data.opsSops}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      renderItem={({ item }) => (
        <Pressable
          style={[s.listCard, { backgroundColor: colors.card }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <View style={s.listCardRow}>
            <View style={[s.avatarCircle, { backgroundColor: accentColor + '25' }]}>
              <ThemedText style={[s.avatarText, { color: accentColor }]}>
                {item.ownerInitials}
              </ThemedText>
            </View>
            <View style={s.listCardInfo}>
              <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </ThemedText>
              <ThemedText
                style={[s.listCardSub, { color: colors.textTertiary }]}
                numberOfLines={2}
              >
                {item.description}
              </ThemedText>
              <View style={s.badgeRow}>
                <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                  <ThemedText style={[s.badgeText, { color: accentColor }]}>
                    {item.category}
                  </ThemedText>
                </View>
                <View style={[s.badge, { backgroundColor: colors.backgroundTertiary }]}>
                  <ThemedText style={[s.badgeText, { color: colors.textSecondary }]}>
                    v{item.version}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                Last reviewed: {item.lastReviewed}
              </ThemedText>
            </View>
          </View>
        </Pressable>
      )}
    />
  );

  // === Tab 8: Forms ===
  const renderForms = () => (
    <FlatList<ResourceForm>
      data={data.forms}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      renderItem={({ item }) => {
        const ackProgress =
          item.requiresAcknowledgment && item.totalCount && item.totalCount > 0
            ? (item.acknowledgedCount ?? 0) / item.totalCount
            : 0;
        return (
          <Pressable
            style={[s.listCard, { backgroundColor: colors.card }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={s.listCardRow}>
              <View style={[s.avatarCircle, { backgroundColor: accentColor + '25' }]}>
                <ThemedText style={[s.avatarText, { color: accentColor }]}>
                  {item.ownerInitials}
                </ThemedText>
              </View>
              <View style={s.listCardInfo}>
                <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.title}
                </ThemedText>
                <ThemedText
                  style={[s.listCardSub, { color: colors.textTertiary }]}
                  numberOfLines={1}
                >
                  {item.description}
                </ThemedText>
                <View style={[s.badge, { backgroundColor: accentColor + '18', alignSelf: 'flex-start' }]}>
                  <ThemedText style={[s.badgeText, { color: accentColor }]}>
                    {item.category}
                  </ThemedText>
                </View>
                {item.requiresAcknowledgment && item.totalCount != null && (
                  <View style={s.progressRow}>
                    <View style={[s.progressTrack, { backgroundColor: colors.text + '10' }]}>
                      <View
                        style={[
                          s.progressFill,
                          {
                            width: `${ackProgress * 100}%`,
                            backgroundColor: accentColor,
                          },
                        ]}
                      />
                    </View>
                    <ThemedText style={[s.progressLabel, { color: colors.textSecondary }]}>
                      {item.acknowledgedCount}/{item.totalCount}
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        );
      }}
    />
  );

  // === Tab 9: Saved Nexus ===
  const renderSavedNexus = () => (
    <FlatList<ResourceNexusSnapshot>
      data={data.nexusSnapshots}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      renderItem={({ item }) => (
        <Pressable
          style={[s.listCard, { backgroundColor: colors.card }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <View style={s.listCardInfo}>
            <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
              {item.title}
            </ThemedText>
            <View style={[s.badge, { backgroundColor: colors.backgroundTertiary, alignSelf: 'flex-start' }]}>
              <ThemedText style={[s.badgeText, { color: colors.textSecondary }]}>
                {item.snapshotType.replace('-', ' ')}
              </ThemedText>
            </View>
            <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
              {item.context}
            </ThemedText>
            <View style={s.nexusBottomRow}>
              <View style={[s.avatarCircle, { backgroundColor: accentColor + '25' }]}>
                <ThemedText style={[s.avatarText, { color: accentColor }]}>
                  {item.createdByInitials}
                </ThemedText>
              </View>
              <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                {item.createdAt}
              </ThemedText>
            </View>
          </View>
        </Pressable>
      )}
    />
  );

  // === Tab 10: Links ===
  const renderLinks = () => {
    const pinnedLinks = data.links.filter((l) => l.pinned);
    const allLinks = data.links;

    const renderLinkRow = (item: ResourceLink) => {
      const platformColor = LINK_PLATFORM_COLOR[item.platform];
      return (
        <Pressable
          key={item.id}
          style={[s.listCard, { backgroundColor: colors.card }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <View style={s.listCardRow}>
            <View style={[s.avatarCircle, { backgroundColor: accentColor + '25' }]}>
              <ThemedText style={[s.avatarText, { color: accentColor }]}>
                {item.addedByInitials}
              </ThemedText>
            </View>
            <View style={s.listCardInfo}>
              <View style={s.titleRow}>
                <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.title}
                </ThemedText>
                {item.pinned && <IconSymbol name="pin.fill" size={12} color={accentColor} />}
              </View>
              <View style={s.badgeRow}>
                <View style={[s.statusDot, { backgroundColor: platformColor }]} />
                <ThemedText style={[s.platformLabel, { color: colors.textSecondary }]}>
                  {item.platform}
                </ThemedText>
                <View style={[s.badge, { backgroundColor: colors.backgroundTertiary }]}>
                  <ThemedText style={[s.badgeText, { color: colors.textSecondary }]}>
                    {item.scope}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        </Pressable>
      );
    };

    return (
      <ScrollView contentContainerStyle={s.listContent}>
        {pinnedLinks.length > 0 && (
          <>
            <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>
              Pinned
            </ThemedText>
            {pinnedLinks.map(renderLinkRow)}
          </>
        )}
        <ThemedText
          style={[
            s.sectionHeader,
            { color: colors.textSecondary },
            pinnedLinks.length > 0 && { marginTop: Spacing.md },
          ]}
        >
          All Links
        </ThemedText>
        {allLinks.map(renderLinkRow)}
      </ScrollView>
    );
  };

  // === Tab 11: Reports ===
  const renderReports = () => (
    <FlatList<ResourceReport>
      data={data.reports}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      renderItem={({ item }) => {
        const formatColor = REPORT_FORMAT_COLOR[item.format];
        return (
          <Pressable
            style={[s.listCard, { backgroundColor: colors.card }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={s.listCardInfo}>
              <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </ThemedText>
              <View style={s.badgeRow}>
                <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                  <ThemedText style={[s.badgeText, { color: accentColor }]}>{item.type}</ThemedText>
                </View>
                <View style={[s.badge, { backgroundColor: formatColor + '33' }]}>
                  <ThemedText style={[s.badgeText, { color: formatColor }]}>
                    {item.format}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                {item.period}
              </ThemedText>
              <View style={s.reportBottomRow}>
                <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                  {item.generatedAt}
                </ThemedText>
                <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
                  {item.size}
                </ThemedText>
              </View>
            </View>
          </Pressable>
        );
      }}
    />
  );

  // === Tab 12: Audit ===
  const renderAudit = () => (
    <FlatList<ResourceAuditEntry>
      data={data.audit}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      renderItem={({ item }) => {
        const aColor = auditColor(item.action);
        const aIcon = auditIcon(item.action);
        return (
          <View style={s.auditRow}>
            <View style={[s.auditIconCircle, { backgroundColor: aColor + '20' }]}>
              <IconSymbol name={aIcon as any} size={14} color={aColor} />
            </View>
            <View style={[s.avatarCircle, { backgroundColor: accentColor + '25' }]}>
              <ThemedText style={[s.avatarText, { color: accentColor }]}>
                {item.actorInitials}
              </ThemedText>
            </View>
            <View style={s.auditInfo}>
              <ThemedText style={[s.auditAction, { color: colors.text }]}>
                {item.target}
              </ThemedText>
              {item.detail != null && (
                <ThemedText
                  style={[s.listCardSub, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {item.detail}
                </ThemedText>
              )}
              <ThemedText style={[s.auditMeta, { color: colors.textTertiary }]}>
                {item.timestamp}
              </ThemedText>
            </View>
          </View>
        );
      }}
    />
  );

  // === Tab 13: Settings ===
  const renderSettings = () => (
    <View style={s.tabContent}>
      <ThemedText style={[s.settingsHeader, { color: colors.textSecondary }]}>
        Sports Resources Settings
      </ThemedText>
      <View style={[s.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {data.settings.map((setting: ResourceSettingToggle, index: number) => {
          const toggled = settingToggles[setting.id] ?? setting.enabled;
          return (
            <React.Fragment key={setting.id}>
              {index > 0 && (
                <View style={[s.settingsDivider, { backgroundColor: colors.border }]} />
              )}
              <View style={s.settingsRow}>
                <View style={s.settingsLabelGroup}>
                  <ThemedText style={[s.settingsLabel, { color: colors.text }]}>
                    {setting.label}
                  </ThemedText>
                  <ThemedText style={[s.settingsDesc, { color: colors.textTertiary }]}>
                    {setting.description}
                  </ThemedText>
                </View>
                <Switch
                  value={toggled}
                  onValueChange={(val) =>
                    setSettingToggles((prev) => ({ ...prev, [setting.id]: val }))
                  }
                  trackColor={{ false: colors.backgroundTertiary, true: accentColor + '60' }}
                  thumbColor={toggled ? accentColor : colors.textTertiary}
                />
              </View>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );

  // ===================================================================
  // RENDER — MAIN
  // ===================================================================

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      {/* === Pill Nav === */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.tabBar}
        style={s.tabBarContainer}
      >
        {RESOURCES_TABS.map((tab) => (
          <Pressable
            key={tab.id}
            style={[
              s.tabPill,
              activeTab === tab.id
                ? { backgroundColor: accentColor }
                : { backgroundColor: colors.backgroundTertiary },
            ]}
            onPress={() => handleTabPress(tab.id)}
          >
            <ThemedText
              style={[
                s.tabPillText,
                { color: activeTab === tab.id ? '#000' : colors.textSecondary },
              ]}
            >
              {tab.label}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {/* === Tab Content === */}
      <View style={s.contentArea}>{renderTabContent()}</View>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  // === Layout ===
  container: {
    flex: 1,
  },

  // === Tab Bar ===
  tabBarContainer: {
    flexGrow: 0,
  },
  tabBar: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // === Content Area ===
  contentArea: {
    flex: 1,
  },
  tabContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },

  // === Search ===
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: Spacing.sm,
    height: 36,
    gap: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },

  // === Library Collections ===
  libraryHeader: {
    gap: Spacing.sm,
  },
  collectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  collectionCard: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: 12,
    padding: Spacing.md,
    gap: 4,
  },
  collectionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collectionName: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  collectionCount: {
    fontSize: 11,
  },
  collectionDesc: {
    fontSize: 10,
    marginTop: 2,
  },

  // === List Cards ===
  listCard: {
    borderRadius: 12,
    padding: Spacing.md,
  },
  listCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  listCardInfo: {
    flex: 1,
    gap: 4,
  },
  listCardTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  listCardSub: {
    fontSize: 12,
  },

  // === Avatar ===
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 9,
    fontWeight: '700',
  },

  // === Badges ===
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },

  // === Status Dot ===
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
  },

  // === Title Row ===
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  // === Section Header ===
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },

  // === Progress Bar ===
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 4,
  },
  progressFill: {
    height: 4,
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },

  // === New Button ===
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: Spacing.sm,
  },
  newButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },

  // === Packs ===
  packBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },

  // === Drillbook ===
  chipRowContainer: {
    flexGrow: 0,
    marginBottom: Spacing.sm,
  },
  chipRow: {
    gap: Spacing.sm,
  },
  chipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  drillTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  drillStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: 2,
  },
  drillStat: {
    fontSize: 11,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },

  // === Playbook ===
  playTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  // === Platform Label (Links) ===
  platformLabel: {
    fontSize: 11,
    textTransform: 'capitalize',
  },

  // === Saved Nexus ===
  nexusBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },

  // === Reports ===
  reportBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },

  // === Audit ===
  auditRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  auditIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  auditInfo: {
    flex: 1,
    gap: 2,
  },
  auditAction: {
    fontSize: 13,
    fontWeight: '500',
  },
  auditMeta: {
    fontSize: 11,
  },

  // === Settings ===
  settingsHeader: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  settingsCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  settingsLabelGroup: {
    flex: 1,
    marginRight: Spacing.sm,
    gap: 2,
  },
  settingsLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingsDesc: {
    fontSize: 11,
  },
  settingsDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md,
  },
});
