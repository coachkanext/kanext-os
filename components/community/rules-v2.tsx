/**
 * Rules V2 — 5-tab rules hub for K-1 Competition mode (CEO/Commissioner level).
 * Tabs: Rulebook | Penalties | Directives | Case Law | Points
 */

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import {
  TECHNICAL_DIRECTIVES, ENHANCED_PENALTY_CATALOG, TD_CATEGORY_COLOR,
} from '@/data/mock-ceo-competition';
import type {
  TechnicalDirective, EnhancedPenaltyCatalog, PenaltyFactor,
} from '@/data/mock-ceo-competition';
import {
  RULE_ARTICLES, RULING_CASES, POINTS_TABLE,
} from '@/data/mock-competition-v2';
import type {
  RuleArticle, RulingCase, PointsTableEntry,
} from '@/data/mock-competition-v2';

// =============================================================================
// CONSTANTS
// =============================================================================

type RulesTab = 'rulebook' | 'penalties' | 'directives' | 'caselaw' | 'points';

const TAB_PILLS: { key: RulesTab; label: string }[] = [
  { key: 'rulebook', label: 'Rulebook' },
  { key: 'penalties', label: 'Penalties' },
  { key: 'directives', label: 'Directives' },
  { key: 'caselaw', label: 'Case Law' },
  { key: 'points', label: 'Points' },
];

const CATEGORY_COLORS: Record<RuleArticle['category'], string> = {
  race: '#3B82F6',
  technical: '#8B5CF6',
  safety: '#EF4444',
  sporting: '#22C55E',
};

const MEDAL_COLORS: Record<number, string> = {
  1: '#F59E0B', // Gold
  2: '#94A3B8', // Silver
  3: '#B45309', // Bronze
};

const FACTOR_COLORS: Record<PenaltyFactor['type'], string> = {
  aggravating: '#EF4444',
  mitigating: '#22C55E',
};

// =============================================================================
// HELPERS
// =============================================================================

/** Group articles by section, preserving insertion order. */
function groupBySection(articles: RuleArticle[]): Map<string, RuleArticle[]> {
  const map = new Map<string, RuleArticle[]>();
  for (const article of articles) {
    const existing = map.get(article.section);
    if (existing) {
      existing.push(article);
    } else {
      map.set(article.section, [article]);
    }
  }
  return map;
}

// =============================================================================
// TAB 1: SEARCHABLE RULEBOOK
// =============================================================================

function RulebookTab({
  colors,
  searchQuery,
  expandedSections,
  toggleSection,
}: {
  colors: typeof Colors.light;
  searchQuery: string;
  expandedSections: Set<string>;
  toggleSection: (section: string) => void;
}) {
  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return RULE_ARTICLES;
    const q = searchQuery.toLowerCase();
    return RULE_ARTICLES.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const sections = useMemo(() => groupBySection(filteredArticles), [filteredArticles]);

  if (filteredArticles.length === 0) {
    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
          No articles match "{searchQuery}"
        </ThemedText>
      </View>
    );
  }

  return (
    <>
      {Array.from(sections.entries()).map(([section, articles]) => {
        const isExpanded = expandedSections.has(section);
        return (
          <View
            key={section}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Pressable
              style={styles.sectionHeader}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                toggleSection(section);
              }}
            >
              <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
                {section}
              </ThemedText>
              <IconSymbol
                name={isExpanded ? 'chevron.up' : 'chevron.down'}
                size={16}
                color={colors.textTertiary}
              />
            </Pressable>

            {isExpanded &&
              articles.map((article) => {
                const catColor = CATEGORY_COLORS[article.category];
                return (
                  <View
                    key={article.id}
                    style={[styles.articleRow, { borderTopColor: colors.border }]}
                  >
                    <View style={styles.articleTopRow}>
                      <View
                        style={[
                          styles.articleNumberBadge,
                          { backgroundColor: colors.backgroundSecondary },
                        ]}
                      >
                        <ThemedText style={[styles.articleNumberText, { color: colors.text }]}>
                          {article.articleNumber}
                        </ThemedText>
                      </View>
                      <ThemedText
                        style={[styles.articleTitle, { color: colors.text }]}
                        numberOfLines={2}
                      >
                        {article.title}
                      </ThemedText>
                      <View style={[styles.categoryBadge, { backgroundColor: catColor + '20' }]}>
                        <ThemedText style={[styles.categoryBadgeText, { color: catColor }]}>
                          {article.category.toUpperCase()}
                        </ThemedText>
                      </View>
                    </View>
                    <ThemedText style={[styles.articleSummary, { color: colors.textSecondary }]}>
                      {article.summary}
                    </ThemedText>
                  </View>
                );
              })}
          </View>
        );
      })}
    </>
  );
}

// =============================================================================
// TAB 2: ENHANCED PENALTY MATRIX
// =============================================================================

function PenaltiesTab({
  colors,
  expandedPenalty,
  setExpandedPenalty,
}: {
  colors: typeof Colors.light;
  expandedPenalty: string | null;
  setExpandedPenalty: (id: string | null) => void;
}) {
  const togglePenalty = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedPenalty(expandedPenalty === id ? null : id);
  };

  return (
    <>
      {ENHANCED_PENALTY_CATALOG.map((entry) => {
        const isExpanded = expandedPenalty === entry.id;

        return (
          <View
            key={entry.id}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Pressable onPress={() => togglePenalty(entry.id)} style={styles.penaltyHeader}>
              <View style={styles.penaltyMainInfo}>
                <ThemedText style={[styles.penaltyInfraction, { color: colors.text }]}>
                  {entry.infraction}
                </ThemedText>
                <ThemedText style={[styles.penaltyRange, { color: colors.textSecondary }]}>
                  {entry.minPenalty} → {entry.maxPenalty}
                </ThemedText>
                <View style={styles.penaltyMetaRow}>
                  <ThemedText style={[styles.penaltyPoints, { color: colors.textTertiary }]}>
                    {entry.pointsRange}
                  </ThemedText>
                  <View
                    style={[
                      styles.recentBadge,
                      { backgroundColor: colors.backgroundSecondary },
                    ]}
                  >
                    <ThemedText style={[styles.recentBadgeText, { color: colors.textSecondary }]}>
                      Recent: {entry.recentApplications} application{entry.recentApplications !== 1 ? 's' : ''}
                    </ThemedText>
                  </View>
                </View>
              </View>
              <IconSymbol
                name={isExpanded ? 'chevron.up' : 'chevron.down'}
                size={14}
                color={colors.textTertiary}
              />
            </Pressable>

            {isExpanded && (
              <View style={[styles.factorsContainer, { borderTopColor: colors.border }]}>
                {entry.factors.map((factor, idx) => {
                  const fColor = FACTOR_COLORS[factor.type];
                  return (
                    <View key={`${entry.id}-f-${idx}`} style={styles.factorRow}>
                      <View style={[styles.factorDot, { backgroundColor: fColor }]} />
                      <ThemedText
                        style={[styles.factorDescription, { color: colors.textSecondary }]}
                        numberOfLines={2}
                      >
                        {factor.description}
                      </ThemedText>
                      <View
                        style={[
                          styles.impactBadge,
                          { backgroundColor: colors.backgroundSecondary },
                        ]}
                      >
                        <ThemedText style={[styles.impactBadgeText, { color: colors.textSecondary }]}>
                          {factor.impactRange}
                        </ThemedText>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </>
  );
}

// =============================================================================
// TAB 3: TECHNICAL DIRECTIVES
// =============================================================================

function DirectivesTab({ colors }: { colors: typeof Colors.light }) {
  return (
    <>
      {TECHNICAL_DIRECTIVES.map((td) => {
        const catColor = TD_CATEGORY_COLOR[td.category] ?? '#6B7280';
        const allAcknowledged = td.acknowledged >= td.totalTeams;
        const ackPct = td.totalTeams > 0 ? (td.acknowledged / td.totalTeams) * 100 : 0;

        return (
          <View
            key={td.id}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            {/* Number badge */}
            <View style={[styles.tdNumberBadge, { backgroundColor: colors.backgroundSecondary }]}>
              <ThemedText style={[styles.tdNumberText, { color: colors.text }]}>
                {td.number}
              </ThemedText>
            </View>

            {/* Title */}
            <ThemedText style={[styles.tdTitle, { color: colors.text }]}>
              {td.title}
            </ThemedText>

            {/* Category badge */}
            <View style={[styles.categoryBadge, { backgroundColor: catColor + '20', alignSelf: 'flex-start', marginBottom: 10 }]}>
              <ThemedText style={[styles.categoryBadgeText, { color: catColor }]}>
                {td.category.toUpperCase()}
              </ThemedText>
            </View>

            {/* Issued by + dates */}
            <View style={styles.tdMetaRow}>
              <ThemedText style={[styles.tdMetaLabel, { color: colors.textTertiary }]}>
                Issued by:
              </ThemedText>
              <ThemedText style={[styles.tdMetaValue, { color: colors.textSecondary }]}>
                {td.issuedBy}
              </ThemedText>
              <ThemedText style={[styles.tdMetaLabel, { color: colors.textTertiary, marginLeft: 12 }]}>
                Issued:
              </ThemedText>
              <ThemedText style={[styles.tdMetaValue, { color: colors.textSecondary }]}>
                {td.issuedDate}
              </ThemedText>
            </View>
            <View style={styles.tdMetaRow}>
              <ThemedText style={[styles.tdMetaLabel, { color: colors.textTertiary }]}>
                Effective:
              </ThemedText>
              <ThemedText style={[styles.tdMetaValue, { color: colors.textSecondary }]}>
                {td.effectiveDate}
              </ThemedText>
            </View>

            {/* Summary */}
            <ThemedText style={[styles.tdSummary, { color: colors.textSecondary }]}>
              {td.summary}
            </ThemedText>

            {/* Acknowledgement bar */}
            <View style={styles.ackBarContainer}>
              <View style={[styles.ackBarTrack, { backgroundColor: colors.backgroundSecondary }]}>
                <View
                  style={[
                    styles.ackBarFill,
                    {
                      width: `${ackPct}%`,
                      backgroundColor: allAcknowledged ? '#22C55E' : '#F59E0B',
                    },
                  ]}
                />
              </View>
              <ThemedText style={[styles.ackBarText, { color: allAcknowledged ? '#22C55E' : '#F59E0B' }]}>
                {td.acknowledged}/{td.totalTeams} teams acknowledged
              </ThemedText>
            </View>

            {/* Supersedes note */}
            {td.supersedes && (
              <ThemedText style={[styles.supersedesText, { color: colors.textTertiary }]}>
                Supersedes: {td.supersedes}
              </ThemedText>
            )}
          </View>
        );
      })}
    </>
  );
}

// =============================================================================
// TAB 4: CASE LAW (Rulings)
// =============================================================================

function CaseLawTab({ colors }: { colors: typeof Colors.light }) {
  return (
    <>
      <ThemedText style={[styles.tabHeader, { color: colors.text }]}>
        Official Rulings & Decisions
      </ThemedText>

      {RULING_CASES.map((ruling) => (
        <View
          key={ruling.id}
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          {/* Title + Date */}
          <View style={styles.rulingTitleRow}>
            <ThemedText style={[styles.rulingTitle, { color: colors.text }]} numberOfLines={2}>
              {ruling.title}
            </ThemedText>
            <ThemedText style={[styles.rulingDate, { color: colors.textTertiary }]}>
              {ruling.date}
            </ThemedText>
          </View>

          {/* Race badge */}
          <View style={[styles.raceBadge, { backgroundColor: colors.backgroundSecondary }]}>
            <ThemedText style={[styles.raceBadgeText, { color: colors.textSecondary }]}>
              {ruling.race}
            </ThemedText>
          </View>

          {/* Parties */}
          <ThemedText style={[styles.rulingLabel, { color: colors.textTertiary }]}>
            Parties:
          </ThemedText>
          <ThemedText style={[styles.rulingBody, { color: colors.textSecondary }]}>
            {ruling.parties.join(', ')}
          </ThemedText>

          {/* Ruling */}
          <ThemedText style={[styles.rulingLabel, { color: colors.textTertiary, marginTop: 10 }]}>
            Ruling:
          </ThemedText>
          <ThemedText style={[styles.rulingBody, { color: colors.textSecondary }]}>
            {ruling.ruling}
          </ThemedText>

          {/* Penalty */}
          <ThemedText style={[styles.rulingLabel, { color: colors.textTertiary, marginTop: 10 }]}>
            Penalty:
          </ThemedText>
          <ThemedText style={[styles.rulingBody, { color: '#F59E0B' }]}>
            {ruling.penalty}
          </ThemedText>

          {/* Precedent badge */}
          {ruling.precedent && (
            <View style={styles.precedentBadge}>
              <ThemedText style={styles.precedentBadgeText}>PRECEDENT</ThemedText>
            </View>
          )}
        </View>
      ))}
    </>
  );
}

// =============================================================================
// TAB 5: POINTS & STANDINGS RULES
// =============================================================================

function PointsTab({ colors }: { colors: typeof Colors.light }) {
  return (
    <>
      {/* Points Table */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          Championship Points System
        </ThemedText>

        {/* Table header */}
        <View style={[styles.tableHeaderRow, { borderBottomColor: colors.border }]}>
          <ThemedText style={[styles.tableHeaderCell, styles.posCol, { color: colors.textTertiary }]}>
            Pos
          </ThemedText>
          <ThemedText style={[styles.tableHeaderCell, styles.ptsCol, { color: colors.textTertiary }]}>
            Points
          </ThemedText>
          <ThemedText style={[styles.tableHeaderCell, styles.bonusCol, { color: colors.textTertiary }]}>
            Bonus
          </ThemedText>
        </View>

        {/* Table rows */}
        {POINTS_TABLE.map((entry) => {
          const medalColor = MEDAL_COLORS[entry.position];
          const posColor = medalColor ?? colors.textSecondary;

          return (
            <View
              key={entry.position}
              style={[styles.tableRow, { borderBottomColor: colors.border }]}
            >
              <View style={[styles.posCol, styles.posCellContainer]}>
                {medalColor && (
                  <View style={[styles.medalDot, { backgroundColor: medalColor }]} />
                )}
                <ThemedText style={[styles.posText, { color: posColor }]}>
                  P{entry.position}
                </ThemedText>
              </View>
              <ThemedText style={[styles.ptsText, styles.ptsCol, { color: colors.text }]}>
                {entry.points}
              </ThemedText>
              <ThemedText
                style={[
                  styles.bonusText,
                  styles.bonusCol,
                  { color: medalColor ?? colors.textTertiary },
                ]}
              >
                {entry.bonus ?? '\u2014'}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function RulesV2({ colors }: { colors: typeof Colors.light }) {
  const [activeTab, setActiveTab] = useState<RulesTab>('rulebook');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPenalty, setExpandedPenalty] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(Array.from(groupBySection(RULE_ARTICLES).keys())),
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  return (
    <View style={styles.container}>
      {/* Pill Nav */}
      <View style={styles.pillRow}>
        {TAB_PILLS.map((pill) => {
          const isActive = activeTab === pill.key;
          return (
            <Pressable
              key={pill.key}
              style={[
                styles.pill,
                {
                  backgroundColor: isActive
                    ? colors.text + 'E0'
                    : colors.backgroundSecondary,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(pill.key);
              }}
            >
              <ThemedText
                style={[
                  styles.pillText,
                  {
                    color: isActive ? colors.background : colors.textSecondary,
                  },
                ]}
              >
                {pill.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Search bar (Rulebook tab only) */}
      {activeTab === 'rulebook' && (
        <View style={[styles.searchContainer, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search articles..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
      )}

      {/* Tab Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'rulebook' && (
          <RulebookTab
            colors={colors}
            searchQuery={searchQuery}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />
        )}
        {activeTab === 'penalties' && (
          <PenaltiesTab
            colors={colors}
            expandedPenalty={expandedPenalty}
            setExpandedPenalty={setExpandedPenalty}
          />
        )}
        {activeTab === 'directives' && <DirectivesTab colors={colors} />}
        {activeTab === 'caselaw' && <CaseLawTab colors={colors} />}
        {activeTab === 'points' && <PointsTab colors={colors} />}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Pill Nav
  pillRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: 6,
  },
  pill: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 18,
    alignItems: 'center',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Search bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },

  // Scroll Content
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 120,
    gap: 12,
  },

  // Empty state
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },

  // Cards
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },

  // Section Header (collapsible)
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },

  // Tab Header
  tabHeader: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },

  // Article row
  articleRow: {
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  articleTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  articleNumberBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  articleNumberText: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  articleSummary: {
    fontSize: 13,
    lineHeight: 19,
  },

  // Penalty Matrix (Enhanced)
  penaltyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  penaltyMainInfo: {
    flex: 1,
  },
  penaltyInfraction: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
  },
  penaltyRange: {
    fontSize: 13,
    marginBottom: 2,
  },
  penaltyMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  penaltyPoints: {
    fontSize: 12,
  },
  recentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  recentBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  factorsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  factorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  factorDescription: {
    fontSize: 13,
    flex: 1,
  },
  impactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  impactBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Technical Directives
  tdNumberBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  tdNumberText: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  tdTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  tdMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  tdMetaLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  tdMetaValue: {
    fontSize: 12,
  },
  tdSummary: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
    marginBottom: 12,
  },
  ackBarContainer: {
    gap: 4,
  },
  ackBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  ackBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  ackBarText: {
    fontSize: 12,
    fontWeight: '600',
  },
  supersedesText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },

  // Case Law (Rulings)
  rulingTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  rulingTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  rulingDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  raceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 10,
  },
  raceBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rulingLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  rulingBody: {
    fontSize: 13,
    lineHeight: 19,
  },
  precedentBadge: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#F59E0B20',
  },
  precedentBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#F59E0B',
  },

  // Points Table
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    marginTop: 8,
  },
  tableHeaderCell: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  posCol: {
    width: 60,
  },
  ptsCol: {
    width: 60,
  },
  bonusCol: {
    flex: 1,
  },
  posCellContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  medalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  posText: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  ptsText: {
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  bonusText: {
    fontSize: 13,
  },
});
