/**
 * Universal Data Room Sheet -- Business Mode
 * Investor data room with 7 RBAC-gated tabs.
 * This is the CONTENT component -- the parent handles the bottom sheet wrapper.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import {

  type DataRoomDoc,
  type BoardPackItem,
  type DecisionLogEntry,
  type KPIItem,
  type RiskItem,
  type BudgetCategory,
  DATA_ROOM_DOCS,
  BOARD_PACK_ITEMS,
  DECISION_LOG,
  KPI_ITEMS,
  RISK_ITEMS,
  BUDGET_CATEGORIES,
  getDocsByAccessLevel,
} from '@/data/mock-business-v2';

import {
  type BusinessRoleLens,
  type InvestorTier,
  type DataRoomTab,
  getDataRoomTabs,
  getMetricVisibility,
  canAccessDoc,
  isFounder,
  isBoardLevel,
  isInvestor,
} from '@/utils/business-rbac';

const ACCENT = MODE_ACCENT.business;

// =============================================================================
// PROPS
// =============================================================================

interface UniversalDataRoomSheetProps {
  roleLens: BusinessRoleLens;
  investorTier?: InvestorTier;
  onClose: () => void;
  onRequestUpgrade?: () => void;
}

// =============================================================================
// STATUS HELPERS
// =============================================================================

const DOC_TYPE_ICONS: Record<string, string> = {
  deck: 'rectangle.stack.fill',
  memo: 'doc.text.fill',
  demo: 'play.rectangle.fill',
  financial: 'dollarsign.circle.fill',
  legal: 'doc.badge.gearshape.fill',
  board_deck: 'doc.richtext.fill',
  kpi: 'chart.bar.fill',
  risk: 'exclamationmark.triangle.fill',
  decision_log: 'list.bullet.clipboard.fill',
  budget: 'dollarsign.circle.fill',
  agreement: 'signature',
};

const ACCESS_TAG_COLORS: Record<string, string> = {
  public: '#22C55E',
  retail: ACCENT,
  board: '#F59E0B',
  founder_only: '#EF4444',
  workspace_only: '#A1A1AA',
};

const ACCESS_TAG_LABELS: Record<string, string> = {
  public: 'PUBLIC',
  retail: 'RETAIL',
  board: 'BOARD',
  founder_only: 'FOUNDER',
  workspace_only: 'WORKSPACE',
};

const BOARD_PACK_TYPE_ICONS: Record<string, string> = {
  board_deck: 'doc.richtext.fill',
  kpi: 'chart.bar.fill',
  risk: 'exclamationmark.triangle.fill',
  decision_log: 'list.bullet.clipboard.fill',
  deck: 'doc.richtext.fill',
  minutes: 'doc.text.fill',
  decision: 'list.bullet.clipboard.fill',
};

const BOARD_PACK_STATUS_COLORS: Record<string, string> = {
  draft: '#F59E0B',
  final: '#22C55E',
  current: '#22C55E',
  archived: '#A1A1AA',
};

const DECISION_OUTCOME_COLORS: Record<string, string> = {
  approved: '#22C55E',
  rejected: '#EF4444',
  deferred: '#F59E0B',
  tabled: '#F59E0B',
  pending: ACCENT,
};

const KPI_STATUS_COLORS: Record<string, string> = {
  on_track: '#22C55E',
  at_risk: '#F59E0B',
  behind: '#EF4444',
};

const RISK_SEVERITY_COLORS: Record<string, string> = {
  critical: '#EF4444',
  high: '#F59E0B',
  medium: ACCENT,
  low: '#A1A1AA',
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function UniversalDataRoomSheet({
  roleLens,
  investorTier,
  onClose,
  onRequestUpgrade,
}: UniversalDataRoomSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const tabs = useMemo(() => getDataRoomTabs(roleLens), [roleLens]);
  const [activeTab, setActiveTab] = useState<DataRoomTab>(tabs[0]?.id ?? 'start_here');

  const founder = isFounder(roleLens);
  const board = isBoardLevel(roleLens);
  const investor = isInvestor(roleLens);
  const metricVis = getMetricVisibility(roleLens);

  const accessibleDocs = useMemo(
    () => getDocsByAccessLevel(roleLens, investorTier),
    [roleLens, investorTier],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}
      <DataRoomHeader
        roleLens={roleLens}
        investorTier={investorTier}
        colors={colors}
        founder={founder}
        investor={investor}
        onClose={onClose}
        onRequestUpgrade={onRequestUpgrade}
      />

      {/* ================================================================== */}
      {/* TAB BAR */}
      {/* ================================================================== */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBar}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <Pressable
              key={tab.id}
              style={[
                styles.tabPill,
                {
                  backgroundColor: isActive ? '#FFFFFF' : colors.card,
                  borderColor: isActive ? '#FFFFFF' : colors.border,
                },
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <ThemedText
                style={[
                  styles.tabPillText,
                  { color: isActive ? '#000000' : colors.textSecondary },
                ]}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ================================================================== */}
      {/* TAB CONTENT */}
      {/* ================================================================== */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'start_here' && <StartHereTab colors={colors} />}
        {activeTab === 'pitch_pack' && <PitchPackTab colors={colors} roleLens={roleLens} investorTier={investorTier} accessibleDocs={accessibleDocs} />}
        {activeTab === 'product_demo' && <ProductDemoTab colors={colors} />}
        {activeTab === 'financials' && <FinancialsTab colors={colors} roleLens={roleLens} investorTier={investorTier} metricVis={metricVis} board={board} accessibleDocs={accessibleDocs} />}
        {activeTab === 'legal' && <LegalTab colors={colors} roleLens={roleLens} investorTier={investorTier} board={board} accessibleDocs={accessibleDocs} />}
        {activeTab === 'board_pack' && <BoardPackTab colors={colors} />}
        {activeTab === 'decision_log' && <DecisionLogTab colors={colors} />}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// HEADER
// =============================================================================

function DataRoomHeader({
  roleLens,
  investorTier,
  colors,
  founder,
  investor,
  onClose,
  onRequestUpgrade,
}: {
  roleLens: BusinessRoleLens;
  investorTier?: InvestorTier;
  colors: typeof Colors.light;
  founder: boolean;
  investor: boolean;
  onClose: () => void;
  onRequestUpgrade?: () => void;
}) {
  const tierLabel = investorTier === 'board' ? 'Board' : investor ? 'Retail' : founder ? 'Founder' : 'Viewer';
  const tierColor = investorTier === 'board' ? '#F59E0B' : investor ? ACCENT : founder ? '#EF4444' : '#A1A1AA';

  return (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      {/* Top row: title + close */}
      <View style={styles.headerTopRow}>
        <View style={{ flex: 1 }}>
          <ThemedText style={[styles.roomTitle, { color: colors.text }]}>
            Valuetainment Data Room
          </ThemedText>
        </View>
        <Pressable onPress={onClose} hitSlop={12}>
          <IconSymbol name="xmark" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Tier pill + access info */}
      <View style={styles.pillRow}>
        <View style={[styles.tierPill, { backgroundColor: tierColor + '1A' }]}>
          <ThemedText style={[styles.tierPillText, { color: tierColor }]}>
            {tierLabel.toUpperCase()} ACCESS
          </ThemedText>
        </View>
        <View style={[styles.watermarkIndicator, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="lock.shield.fill" size={10} color={colors.textTertiary} />
          <ThemedText style={[styles.watermarkText, { color: colors.textTertiary }]}>
            Watermarked
          </ThemedText>
        </View>
      </View>

      {/* Access expiry */}
      <ThemedText style={[styles.expiryText, { color: colors.textTertiary }]}>
        Access expires: 90 days from first view | Session tracked
      </ThemedText>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        {investor && !investorTier && onRequestUpgrade && (
          <Pressable style={styles.actionIconWrap} onPress={onRequestUpgrade}>
            <View style={[styles.actionIconCircle, { backgroundColor: `${ACCENT}22`, borderColor: `${ACCENT}44` }]}>
              <IconSymbol name="arrow.up.circle.fill" size={16} color={ACCENT} />
            </View>
            <ThemedText style={[styles.actionIconLabel, { color: ACCENT }]}>
              Upgrade
            </ThemedText>
          </Pressable>
        )}
        {(founder || (roleLens === 'B2b')) && (
          <ActionIcon icon="arrow.down.doc.fill" label="Download" colors={colors} />
        )}
        {founder && (
          <ActionIcon icon="list.bullet.rectangle.fill" label="Audit Log" colors={colors} />
        )}
      </View>
    </View>
  );
}

function ActionIcon({
  icon,
  label,
  colors,
}: {
  icon: string;
  label: string;
  colors: typeof Colors.light;
}) {
  return (
    <Pressable style={styles.actionIconWrap}>
      <View style={[styles.actionIconCircle, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <IconSymbol name={icon as any} size={16} color={colors.textSecondary} />
      </View>
      <ThemedText style={[styles.actionIconLabel, { color: colors.textSecondary }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

// =============================================================================
// START HERE TAB
// =============================================================================

function StartHereTab({ colors }: { colors: typeof Colors.light }) {
  const evaluationBullets = [
    'Start with the Pitch Deck for a 10-minute overview of the Valuetainment thesis.',
    'Read the Two-Page Memo for a concise investment thesis summary.',
    'Walk through the Product Demo to experience the 5-mode OS firsthand.',
    'Review Financials for revenue model, burn, and runway (access level dependent).',
    'Check the Legal tab for entity structure, IP, and key agreements.',
    'Board-tier investors: review Board Pack for KPIs, risks, and decision log.',
  ];

  const links = [
    { icon: 'play.rectangle.fill', label: 'Demo Path', subtitle: 'Interactive product walkthrough across 5 modes' },
    { icon: 'doc.richtext.fill', label: 'Pitch Deck', subtitle: 'Feb 2026 investor deck -- v3.1' },
    { icon: 'doc.text.fill', label: 'Two-Page Memo', subtitle: 'Concise investment thesis' },
    { icon: 'questionmark.circle.fill', label: 'FAQ', subtitle: 'Common investor questions and answers' },
  ];

  const faqs = [
    { q: 'What is Valuetainment?', a: 'An operating system for institutions that move culture -- sports programs, churches, leagues, schools, and businesses. Five domain modes, one platform.' },
    { q: 'What stage is the company?', a: 'Pre-seed. Phase 1 (Proof Wedge Deployment) is active with 3 institutional partners generating real operational data.' },
    { q: 'How does the video mandate strategy work?', a: 'Governing bodies (NAIA, NJCAA) require schools to provide game video. Valuetainment provides free cameras (KX-C1) and becomes the default platform -- 1,050+ schools at $0 CAC.' },
    { q: 'What is the revenue model?', a: 'Institutional SaaS ($18K-$36K ARR per school), event settlement fees (1.5-3%), and media distribution revenue share.' },
    { q: 'Who is the target customer?', a: 'Sub-NCAA institutions (NAIA, NJCAA, CCCAA, USCAA, NCCAA) -- 1,050+ schools currently underserved by existing platforms.' },
  ];

  return (
    <View>
      <SectionCard title="How to Evaluate Valuetainment" colors={colors}>
        {evaluationBullets.map((bullet, idx) => (
          <View key={idx} style={styles.numberRow}>
            <ThemedText style={[styles.numberBadge, { color: ACCENT }]}>{idx + 1}</ThemedText>
            <ThemedText style={[styles.bulletText, { color: colors.text }]}>{bullet}</ThemedText>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="Quick Links" colors={colors}>
        {links.map((link) => (
          <Pressable key={link.label} style={[styles.listRow, { borderBottomColor: colors.border }]}>
            <IconSymbol name={link.icon as any} size={18} color={ACCENT} />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: ACCENT }]}>
                {link.label}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {link.subtitle}
              </ThemedText>
            </View>
            <IconSymbol name="arrow.up.right" size={14} color={ACCENT} />
          </Pressable>
        ))}
      </SectionCard>

      <SectionCard title="FAQ" colors={colors}>
        {faqs.map((faq, idx) => (
          <View key={idx} style={[styles.faqItem, { borderBottomColor: colors.border }]}>
            <ThemedText style={[styles.faqQuestion, { color: colors.text }]}>
              {faq.q}
            </ThemedText>
            <ThemedText style={[styles.faqAnswer, { color: colors.textSecondary }]}>
              {faq.a}
            </ThemedText>
          </View>
        ))}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// PITCH PACK TAB
// =============================================================================

function PitchPackTab({
  colors,
  roleLens,
  investorTier,
  accessibleDocs,
}: {
  colors: typeof Colors.light;
  roleLens: BusinessRoleLens;
  investorTier?: InvestorTier;
  accessibleDocs: DataRoomDoc[];
}) {
  const decks = accessibleDocs.filter((d) => d.type === 'deck' || d.type === 'board_deck');
  const memos = accessibleDocs.filter((d) => d.type === 'memo');
  const demos = accessibleDocs.filter((d) => d.type === 'demo');

  const marketMap = [
    { segment: 'NAIA', schools: '250+', status: 'Primary target' },
    { segment: 'NJCAA', schools: '500+', status: 'Secondary target' },
    { segment: 'CCCAA', schools: '110+', status: 'Tertiary target' },
    { segment: 'USCAA', schools: '80+', status: 'Expansion' },
    { segment: 'NCCAA', schools: '100+', status: 'Expansion' },
  ];

  const caseStudies = [
    { name: 'Carroll Athletics', mode: 'Sports', status: 'Active deployment', detail: '13 sports programs, 2,340 app installs, ESPN+ broadcasts' },
    { name: '2819 Church', mode: 'Church', status: 'Active deployment', detail: 'Giving rails, connect groups, pastoral care intelligence' },
    { name: 'Valuetainment Media', mode: 'Competition', status: 'Active deployment', detail: 'Race ops, standings, cap enforcement, broadcast integration' },
  ];

  return (
    <View>
      <SectionCard title="Deck Versions" colors={colors}>
        {decks.length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No deck documents available at your access level
          </ThemedText>
        ) : (
          decks.map((doc) => (
            <DocRow key={doc.id} doc={doc} roleLens={roleLens} investorTier={investorTier} colors={colors} />
          ))
        )}
      </SectionCard>

      <SectionCard title="One-Pager / Memo" colors={colors}>
        {memos.length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No memos available at your access level
          </ThemedText>
        ) : (
          memos.map((doc) => (
            <DocRow key={doc.id} doc={doc} roleLens={roleLens} investorTier={investorTier} colors={colors} />
          ))
        )}
      </SectionCard>

      <SectionCard title="Market Map" colors={colors}>
        {/* Table header */}
        <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
          <ThemedText style={[styles.tableHeaderCell, styles.segmentCol, { color: colors.textTertiary }]}>
            Segment
          </ThemedText>
          <ThemedText style={[styles.tableHeaderCell, styles.schoolsCol, { color: colors.textTertiary }]}>
            Schools
          </ThemedText>
          <ThemedText style={[styles.tableHeaderCell, styles.statusCol, { color: colors.textTertiary }]}>
            Status
          </ThemedText>
        </View>
        {marketMap.map((row) => (
          <View key={row.segment} style={[styles.tableRow, { borderBottomColor: colors.border }]}>
            <ThemedText style={[styles.tableCell, styles.segmentCol, { color: colors.text, fontWeight: '600' }]}>
              {row.segment}
            </ThemedText>
            <ThemedText style={[styles.tableCell, styles.schoolsCol, { color: colors.textSecondary }]}>
              {row.schools}
            </ThemedText>
            <ThemedText style={[styles.tableCell, styles.statusCol, { color: colors.textSecondary }]}>
              {row.status}
            </ThemedText>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="Case Studies" colors={colors}>
        {caseStudies.map((cs) => (
          <View key={cs.name} style={[styles.listRow, { borderBottomColor: colors.border }]}>
            <View
              style={[
                styles.caseStudyBadge,
                { backgroundColor: '#22C55E22' },
              ]}
            >
              <ThemedText style={[styles.caseStudyBadgeText, { color: '#22C55E' }]}>
                {cs.mode.toUpperCase()}
              </ThemedText>
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {cs.name}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {cs.status}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textTertiary }]}>
                {cs.detail}
              </ThemedText>
            </View>
          </View>
        ))}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// PRODUCT DEMO TAB
// =============================================================================

function ProductDemoTab({ colors }: { colors: typeof Colors.light }) {
  const demoScript = [
    { step: 1, title: 'Mode Selector', desc: 'Tap the mode icon in the top bar to switch between Sports, Church, Competition, Business, and Education modes.' },
    { step: 2, title: 'Sports Mode (Valuetainment)', desc: 'Explore the dashboard, roster builder, film room, and game-day operations for Carroll College athletics.' },
    { step: 3, title: 'Nexus AI', desc: 'Long-press the Nexus tab or tap the microphone to activate voice/text AI. Ask about roster, schedule, or strategy.' },
    { step: 4, title: 'Church Mode (2819 Church)', desc: 'View giving dashboards, connect groups, ministry operations, and the "Morning Prayer Line" pastoral care interface.' },
    { step: 5, title: 'Competition Mode (Valuetainment)', desc: 'Explore race operations, team standings, driver rosters, and the steward decision audit trail.' },
    { step: 6, title: 'Business Mode', desc: 'Navigate the founder OS: company overview, data room, deal workspaces, and governance dashboards.' },
  ];

  const views = [
    { mode: 'Sports', count: 8, examples: 'Dashboard, Roster, Film Room, Game Day, Stats, Calendar, Recruiting, Development' },
    { mode: 'Church', count: 4, examples: 'Dashboard, Giving, Ministries, Connect Groups' },
    { mode: 'Competition', count: 4, examples: 'Dashboard, Series, Events, Standings' },
    { mode: 'Business', count: 3, examples: 'Dashboard, Data Room, Deal Workspaces' },
    { mode: 'Education', count: 2, examples: 'Dashboard, Curriculum' },
  ];

  return (
    <View>
      <SectionCard title="Demo Script" colors={colors}>
        {demoScript.map((item) => (
          <View key={item.step} style={styles.demoStepRow}>
            <View style={[styles.demoStepBadge, { backgroundColor: `${ACCENT}22` }]}>
              <ThemedText style={[styles.demoStepNumber, { color: ACCENT }]}>
                {item.step}
              </ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {item.title}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {item.desc}
              </ThemedText>
            </View>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="Screenshots" colors={colors}>
        <View style={[styles.screenshotPlaceholder, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="photo.on.rectangle" size={32} color={colors.textTertiary} />
          <ThemedText style={[styles.captionText, { color: colors.textTertiary, marginTop: Spacing.sm }]}>
            Interactive screenshots available in full demo environment
          </ThemedText>
        </View>
      </SectionCard>

      <SectionCard title="21 Views / 5 Modes" colors={colors}>
        {views.map((view) => (
          <View key={view.mode} style={[styles.listRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.viewCountBadge, { backgroundColor: '#FFFFFF1A' }]}>
              <ThemedText style={[styles.viewCountText, { color: '#FFFFFF' }]}>
                {view.count}
              </ThemedText>
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {view.mode} Mode
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {view.examples}
              </ThemedText>
            </View>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="App Build Notes" colors={colors}>
        <BulletItem text="Built with Expo + React Native (iOS, Android, Web)" colors={colors} />
        <BulletItem text="File-based routing with Expo Router" colors={colors} />
        <BulletItem text="React Native New Architecture enabled" colors={colors} />
        <BulletItem text="Nexus AI: conversational intelligence layer (voice + text)" colors={colors} />
        <BulletItem text="Luxury Control Room UI palette -- dark-first, monochrome authority" colors={colors} />
        <BulletItem text="7 canonical engines powering domain intelligence" colors={colors} />
      </SectionCard>
    </View>
  );
}

// =============================================================================
// FINANCIALS TAB
// =============================================================================

function FinancialsTab({
  colors,
  roleLens,
  investorTier,
  metricVis,
  board,
  accessibleDocs,
}: {
  colors: typeof Colors.light;
  roleLens: BusinessRoleLens;
  investorTier?: InvestorTier;
  metricVis: string;
  board: boolean;
  accessibleDocs: DataRoomDoc[];
}) {
  const financialDocs = accessibleDocs.filter((d) => d.type === 'financial' || d.type === 'budget');

  return (
    <View>
      {/* Retail: high-level bands */}
      {metricVis === 'banded' && (
        <View>
          <SectionCard title="Financial Summary (Banded)" colors={colors}>
            <ThemedText style={[styles.bodyText, { color: colors.textSecondary, marginBottom: Spacing.sm }]}>
              Exact figures available at Board access tier. Request an upgrade for detailed financials.
            </ThemedText>
            <View style={styles.statRow}>
              <StatBlock label="Monthly Burn" value="$25-$50K" color="#EF4444" colors={colors} />
              <StatBlock label="Runway" value="12-18 mo" color={ACCENT} colors={colors} />
              <StatBlock label="Cash" value="$300-$600K" color="#22C55E" colors={colors} />
            </View>
          </SectionCard>

          <SectionCard title="Use of Funds (Ranges)" colors={colors}>
            <BulletItem text="Engineering & Product: 40-50% of deployed capital" colors={colors} />
            <BulletItem text="Event Operations: 20-30% of deployed capital" colors={colors} />
            <BulletItem text="Hardware (Cameras): 10-20% of deployed capital" colors={colors} />
            <BulletItem text="Business Development: 5-15% of deployed capital" colors={colors} />
            <BulletItem text="Legal & Compliance: 5-10% of deployed capital" colors={colors} />
          </SectionCard>
        </View>
      )}

      {/* Board: exact figures */}
      {metricVis === 'exact' && (
        <View>
          <SectionCard title="Budget Line Items" colors={colors}>
            {BUDGET_CATEGORIES.map((cat) => (
              <View key={cat.id} style={[styles.listRow, { borderBottomColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                    {cat.name}
                  </ThemedText>
                  <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                    Allocated: ${cat.allocated.toLocaleString()} | Spent: ${cat.spent.toLocaleString()} | Remaining: ${cat.remaining.toLocaleString()}
                  </ThemedText>
                </View>
                <View style={styles.progressBarWrap}>
                  <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.min((cat.spent / cat.allocated) * 100, 100)}%`,
                          backgroundColor: cat.spent / cat.allocated > 0.9 ? '#EF4444' : cat.spent / cat.allocated > 0.7 ? '#F59E0B' : '#22C55E',
                        },
                      ]}
                    />
                  </View>
                  <ThemedText style={[styles.progressPct, { color: colors.textTertiary }]}>
                    {Math.round((cat.spent / cat.allocated) * 100)}%
                  </ThemedText>
                </View>
              </View>
            ))}
          </SectionCard>

          <SectionCard title="Runway" colors={colors}>
            <View style={styles.statRow}>
              <StatBlock label="Monthly Burn" value="$35K" color="#EF4444" colors={colors} />
              <StatBlock label="Runway" value="14 mo" color={ACCENT} colors={colors} />
              <StatBlock label="Cash Position" value="$490K" color="#22C55E" colors={colors} />
            </View>
          </SectionCard>

          <SectionCard title="KPI Scoreboard" colors={colors}>
            {KPI_ITEMS.map((kpi) => (
              <View key={kpi.id} style={[styles.listRow, { borderBottomColor: colors.border }]}>
                <View
                  style={[
                    styles.kpiDot,
                    { backgroundColor: KPI_STATUS_COLORS[kpi.status] ?? '#A1A1AA' },
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                    {kpi.name}
                  </ThemedText>
                  <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                    Current: {kpi.value} | Target: {kpi.target}
                  </ThemedText>
                </View>
                <ThemedText
                  style={[
                    styles.statusLabel,
                    { color: KPI_STATUS_COLORS[kpi.status] ?? '#A1A1AA' },
                  ]}
                >
                  {kpi.status.replace('_', ' ').toUpperCase()}
                </ThemedText>
              </View>
            ))}
          </SectionCard>

          <SectionCard title="Scenarios" colors={colors}>
            <View style={styles.scenarioGrid}>
              <ScenarioCard
                label="Base Case"
                revenue="$2M Y1"
                burn="$35K/mo"
                runway="14 mo"
                color="#22C55E"
                colors={colors}
              />
              <ScenarioCard
                label="Downside"
                revenue="$800K Y1"
                burn="$40K/mo"
                runway="10 mo"
                color="#EF4444"
                colors={colors}
              />
              <ScenarioCard
                label="Upside"
                revenue="$5M Y1"
                burn="$30K/mo"
                runway="18+ mo"
                color={ACCENT}
                colors={colors}
              />
            </View>
          </SectionCard>
        </View>
      )}

      {/* Financial Documents */}
      <SectionCard title="Financial Documents" colors={colors}>
        {financialDocs.length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No financial documents available at your access level
          </ThemedText>
        ) : (
          financialDocs.map((doc) => (
            <DocRow key={doc.id} doc={doc} roleLens={roleLens} investorTier={investorTier} colors={colors} />
          ))
        )}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// LEGAL TAB
// =============================================================================

function LegalTab({
  colors,
  roleLens,
  investorTier,
  board,
  accessibleDocs,
}: {
  colors: typeof Colors.light;
  roleLens: BusinessRoleLens;
  investorTier?: InvestorTier;
  board: boolean;
  accessibleDocs: DataRoomDoc[];
}) {
  const legalDocs = accessibleDocs.filter((d) => d.type === 'legal' || d.type === 'agreement');

  const entityStructure = [
    { entity: 'OSK Group LLC', type: 'Holding Company', jurisdiction: 'Delaware', status: 'Active' },
    { entity: 'Valuetainment Operations LLC', type: 'Operating Subsidiary', jurisdiction: 'Delaware', status: 'Active' },
  ];

  const ipChecklist = [
    { item: 'IP Assignment -- Founder to Entity', status: 'complete' },
    { item: 'Trademark Filing -- Valuetainment', status: 'complete' },
    { item: 'Trademark Filing -- Nexus', status: 'in_progress' },
    { item: 'Patent -- Canonical Engine Architecture', status: 'planned' },
    { item: 'Patent -- Video Mandate Camera System', status: 'planned' },
  ];

  const keyAgreements = [
    { name: 'Valuetainment Partnership Agreement', type: 'Partnership', status: 'Active', detail: 'Athletics OS deployment for 13 sports programs' },
    { name: 'PBD Co-Founder Distribution LOI', type: 'Letter of Intent', status: 'Signed', detail: 'Media distribution and co-branded event rights' },
    { name: 'SAFE Agreement -- Family Round', type: 'Investment', status: 'Template Ready', detail: 'Standard SAFE for friends and family investors' },
    { name: 'SAFE Agreement -- PBD Co-Founder', type: 'Investment', status: 'Board Approved', detail: '5-tranche SAFE with board seat activation' },
  ];

  return (
    <View>
      {/* Entity Structure */}
      <SectionCard title="Entity Structure" colors={colors}>
        {entityStructure.map((entity) => (
          <View key={entity.entity} style={[styles.listRow, { borderBottomColor: colors.border }]}>
            <IconSymbol name="building.2.fill" size={16} color={colors.textSecondary} />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {entity.entity}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {entity.type} | {entity.jurisdiction}
              </ThemedText>
            </View>
            <ThemedText style={[styles.statusLabel, { color: '#22C55E' }]}>
              {entity.status.toUpperCase()}
            </ThemedText>
          </View>
        ))}
      </SectionCard>

      {/* IP Assignment Checklist */}
      <SectionCard title="IP Assignment Checklist" colors={colors}>
        {ipChecklist.map((item) => (
          <View key={item.item} style={styles.checklistRow}>
            <ThemedText
              style={{
                fontSize: 14,
                color: item.status === 'complete' ? '#22C55E' : item.status === 'in_progress' ? '#F59E0B' : '#A1A1AA',
              }}
            >
              {item.status === 'complete' ? '\u2713' : item.status === 'in_progress' ? '\u25D4' : '\u25CB'}
            </ThemedText>
            <ThemedText
              style={[
                styles.checklistLabel,
                { color: item.status === 'complete' ? colors.text : colors.textSecondary },
              ]}
            >
              {item.item}
            </ThemedText>
          </View>
        ))}
      </SectionCard>

      {/* Trademarks / Patents */}
      <SectionCard title="Trademarks + Patents" colors={colors}>
        <ThemedText style={[styles.bodyText, { color: colors.text }]}>
          {board
            ? 'Valuetainment trademark filed (USPTO). Nexus trademark in progress. Patent applications planned for Canonical Engine Architecture and Video Mandate Camera System. Full IP portfolio review scheduled Q2 2026.'
            : 'Valuetainment trademark filed. Additional IP filings in progress. Summaries available at current access level.'
          }
        </ThemedText>
      </SectionCard>

      {/* Key Agreements */}
      <SectionCard title="Key Agreements" colors={colors}>
        {keyAgreements.map((agreement) => (
          <View key={agreement.name} style={[styles.listRow, { borderBottomColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {agreement.name}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {agreement.type} | {board ? agreement.detail : 'Summary available'}
              </ThemedText>
            </View>
            <ThemedText
              style={[
                styles.statusLabel,
                {
                  color:
                    agreement.status === 'Active' || agreement.status === 'Signed' ? '#22C55E' :
                    agreement.status === 'Board Approved' ? ACCENT : '#F59E0B',
                },
              ]}
            >
              {agreement.status.toUpperCase()}
            </ThemedText>
          </View>
        ))}
      </SectionCard>

      {/* Legal Documents */}
      {legalDocs.length > 0 && (
        <SectionCard title="Legal Documents" colors={colors}>
          {legalDocs.map((doc) => (
            <DocRow key={doc.id} doc={doc} roleLens={roleLens} investorTier={investorTier} colors={colors} />
          ))}
        </SectionCard>
      )}
    </View>
  );
}

// =============================================================================
// BOARD PACK TAB (Board Only)
// =============================================================================

function BoardPackTab({ colors }: { colors: typeof Colors.light }) {
  const currentItems = BOARD_PACK_ITEMS.filter((item) => item.status === 'final' || item.status === 'draft');

  return (
    <View>
      <SectionCard title="Latest Board Deck" colors={colors}>
        <View style={[styles.listRow, { borderBottomColor: colors.border }]}>
          <IconSymbol name="doc.richtext.fill" size={20} color={ACCENT} />
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
              Board Deck -- Q1 2026
            </ThemedText>
            <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
              Full quarterly update: product milestones, proof wedge deployment, capital progress, 90-day outlook. Includes KPI dashboard, risk register, and strategic decision queue.
            </ThemedText>
            <ThemedText style={[styles.captionText, { color: colors.textTertiary }]}>
              Updated: Feb 12, 2026 | Final
            </ThemedText>
          </View>
        </View>
      </SectionCard>

      <SectionCard title="KPI Scoreboard" colors={colors}>
        {KPI_ITEMS.map((kpi) => (
          <View key={kpi.id} style={[styles.listRow, { borderBottomColor: colors.border }]}>
            <View
              style={[
                styles.kpiDot,
                { backgroundColor: KPI_STATUS_COLORS[kpi.status] ?? '#A1A1AA' },
              ]}
            />
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {kpi.name}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                Current: {kpi.value} | Target: {kpi.target}
              </ThemedText>
            </View>
            <ThemedText
              style={[
                styles.statusLabel,
                { color: KPI_STATUS_COLORS[kpi.status] ?? '#A1A1AA' },
              ]}
            >
              {kpi.status.replace('_', ' ').toUpperCase()}
            </ThemedText>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="Risk Register" colors={colors}>
        {RISK_ITEMS.map((risk) => (
          <View key={risk.id} style={[styles.listRow, { borderBottomColor: colors.border }]}>
            <View
              style={[
                styles.severityBadge,
                { backgroundColor: (RISK_SEVERITY_COLORS[risk.severity] ?? '#A1A1AA') + '22' },
              ]}
            >
              <ThemedText
                style={[
                  styles.severityText,
                  { color: RISK_SEVERITY_COLORS[risk.severity] ?? '#A1A1AA' },
                ]}
              >
                {risk.severity.toUpperCase()}
              </ThemedText>
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {risk.title}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {risk.mitigation}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textTertiary }]}>
                Owner: {risk.owner}
              </ThemedText>
            </View>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="Strategic Decisions Pending" colors={colors}>
        <BulletItem text="PBD Tranche 1 wire timing -- target Mar 1, confirm readiness" colors={colors} />
        <BulletItem text="NAIA mandate scope -- full mandate vs pilot program" colors={colors} />
        <BulletItem text="Camera procurement vendor selection -- 2 NDAA-compliant candidates" colors={colors} />
        <BulletItem text="Phase 1 hiring budget allocation -- engineer vs designer priority" colors={colors} />
      </SectionCard>

      <SectionCard title="Meeting Minutes Archive" colors={colors}>
        {BOARD_PACK_ITEMS.filter((item) => item.type === 'kpi' || item.type === 'risk' || item.status === 'final' || item.status === 'draft').map((item) => (
          <View key={item.id} style={[styles.listRow, { borderBottomColor: colors.border }]}>
            <IconSymbol
              name={(BOARD_PACK_TYPE_ICONS[item.type] ?? 'doc.fill') as any}
              size={16}
              color={colors.textSecondary}
            />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {item.title}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {item.quarter} | Updated: {item.updatedAt}
              </ThemedText>
            </View>
            <ThemedText
              style={[
                styles.statusLabel,
                { color: BOARD_PACK_STATUS_COLORS[item.status] ?? '#A1A1AA' },
              ]}
            >
              {item.status.toUpperCase()}
            </ThemedText>
          </View>
        ))}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// DECISION LOG TAB (Board Only)
// =============================================================================

function DecisionLogTab({ colors }: { colors: typeof Colors.light }) {
  return (
    <View>
      <SectionCard title="Decision Log" colors={colors}>
        {DECISION_LOG.map((entry) => (
          <View key={entry.id} style={[styles.decisionItem, { borderBottomColor: colors.border }]}>
            <View style={styles.decisionHeaderRow}>
              <View
                style={[
                  styles.decisionOutcomeBadge,
                  { backgroundColor: (DECISION_OUTCOME_COLORS[entry.outcome] ?? '#A1A1AA') + '22' },
                ]}
              >
                <ThemedText
                  style={[
                    styles.decisionOutcomeText,
                    { color: DECISION_OUTCOME_COLORS[entry.outcome] ?? '#A1A1AA' },
                  ]}
                >
                  {entry.outcome.toUpperCase()}
                </ThemedText>
              </View>
              <ThemedText style={[styles.decisionDate, { color: colors.textTertiary }]}>
                {entry.date}
              </ThemedText>
            </View>
            <ThemedText style={[styles.decisionMotion, { color: colors.text }]}>
              {entry.motion}
            </ThemedText>
            <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
              Owner: {entry.owner}
              {entry.attachments && Array.isArray(entry.attachments) && entry.attachments.length > 0
                ? ` | ${entry.attachments.length} attachment${entry.attachments.length > 1 ? 's' : ''}`
                : ''}
            </ThemedText>
            {entry.attachments && Array.isArray(entry.attachments) && entry.attachments.length > 0 && (
              <View style={styles.attachmentRow}>
                {entry.attachments.map((att, idx) => (
                  <View key={idx} style={[styles.attachmentChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <IconSymbol name="paperclip" size={10} color={colors.textTertiary} />
                    <ThemedText style={[styles.attachmentText, { color: colors.textSecondary }]}>
                      {att}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// SHARED UI COMPONENTS
// =============================================================================

function SectionCard({
  title,
  colors,
  children,
}: {
  title: string;
  colors: typeof Colors.light;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>{title}</ThemedText>
      {children}
    </View>
  );
}

function StatBlock({
  label,
  value,
  color,
  colors,
}: {
  label: string;
  value: string;
  color: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={styles.statBlock}>
      <ThemedText style={[styles.statValue, { color }]}>{value}</ThemedText>
      <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

function BulletItem({ text, colors }: { text: string; colors: typeof Colors.light }) {
  return (
    <View style={styles.bulletRow}>
      <ThemedText style={[styles.bulletDot, { color: colors.textTertiary }]}>{'\u2022'}</ThemedText>
      <ThemedText style={[styles.bulletText, { color: colors.text }]}>{text}</ThemedText>
    </View>
  );
}

function DocRow({
  doc,
  roleLens,
  investorTier,
  colors,
}: {
  doc: DataRoomDoc;
  roleLens: BusinessRoleLens;
  investorTier?: InvestorTier;
  colors: typeof Colors.light;
}) {
  const hasAccess = canAccessDoc(doc.accessTag, roleLens, investorTier);
  const accessColor = ACCESS_TAG_COLORS[doc.accessTag] ?? '#A1A1AA';

  return (
    <View style={[styles.listRow, { borderBottomColor: colors.border }]}>
      <IconSymbol
        name={(DOC_TYPE_ICONS[doc.type] ?? 'doc.fill') as any}
        size={16}
        color={hasAccess ? colors.textSecondary : colors.textTertiary}
      />
      <View style={{ flex: 1, marginLeft: Spacing.sm }}>
        <ThemedText
          style={[
            styles.listRowTitle,
            { color: hasAccess ? colors.text : colors.textTertiary },
          ]}
        >
          {doc.title}
        </ThemedText>
        <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
          {doc.updatedAt} {doc.version ? `| v${doc.version}` : ''} {doc.watermarked ? '| Watermarked' : ''}
        </ThemedText>
      </View>
      <View style={styles.docAccessRow}>
        {!hasAccess && (
          <IconSymbol name="lock.fill" size={12} color={colors.textTertiary} />
        )}
        <View style={[styles.accessTagBadge, { backgroundColor: accessColor + '22' }]}>
          <ThemedText style={[styles.accessTagText, { color: accessColor }]}>
            {ACCESS_TAG_LABELS[doc.accessTag] ?? doc.accessTag.toUpperCase()}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

function ScenarioCard({
  label,
  revenue,
  burn,
  runway,
  color,
  colors,
}: {
  label: string;
  revenue: string;
  burn: string;
  runway: string;
  color: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={[styles.scenarioCard, { backgroundColor: colors.card, borderColor: color + '44' }]}>
      <ThemedText style={[styles.scenarioLabel, { color }]}>{label}</ThemedText>
      <ThemedText style={[styles.scenarioValue, { color: colors.text }]}>{revenue}</ThemedText>
      <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
        Burn: {burn}
      </ThemedText>
      <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
        Runway: {runway}
      </ThemedText>
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

  // Header
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  roomTitle: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  tierPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  tierPillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  watermarkIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  watermarkText: {
    fontSize: 10,
    fontWeight: '500',
  },
  expiryText: {
    fontSize: 11,
    marginTop: Spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: Spacing.lg,
    marginTop: Spacing.md,
  },
  actionIconWrap: {
    alignItems: 'center',
    gap: 4,
  },
  actionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconLabel: {
    fontSize: 10,
  },

  // Tab bar
  tabBar: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  tabPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Scroll content
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  // Section card
  sectionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },

  // Text styles
  bodyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  captionText: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 13,
    fontStyle: 'italic',
  },

  // Stat row
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBlock: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // List row
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  listRowTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Bullets
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: 3,
  },
  bulletDot: {
    fontSize: 14,
    lineHeight: 20,
  },
  bulletText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },

  // Number row
  numberRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  numberBadge: {
    fontSize: 14,
    fontWeight: '700',
    width: 20,
    textAlign: 'center',
  },

  // FAQ
  faqItem: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
  },
  faqAnswer: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },

  // Table
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    marginBottom: Spacing.xs,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tableCell: {
    fontSize: 13,
  },
  segmentCol: {
    width: 70,
  },
  schoolsCol: {
    width: 60,
    textAlign: 'right',
  },
  statusCol: {
    flex: 1,
    textAlign: 'right',
  },

  // Case study
  caseStudyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    minWidth: 60,
    alignItems: 'center',
  },
  caseStudyBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Demo
  demoStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  demoStepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoStepNumber: {
    fontSize: 12,
    fontWeight: '700',
  },
  screenshotPlaceholder: {
    height: 120,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewCountBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewCountText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Checklist
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 3,
  },
  checklistLabel: {
    fontSize: 13,
    flex: 1,
  },

  // Doc access
  docAccessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  accessTagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  accessTagText: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Finance
  progressBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 80,
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 4,
    borderRadius: 2,
  },
  progressPct: {
    fontSize: 10,
    fontWeight: '600',
    width: 28,
    textAlign: 'right',
  },
  kpiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    minWidth: 60,
    alignItems: 'center',
  },
  severityText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scenarioGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  scenarioCard: {
    flex: 1,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 2,
  },
  scenarioLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scenarioValue: {
    fontSize: 16,
    fontWeight: '700',
  },

  // Decision log
  decisionItem: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  decisionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  decisionOutcomeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  decisionOutcomeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  decisionDate: {
    fontSize: 11,
  },
  decisionMotion: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  attachmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  attachmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  attachmentText: {
    fontSize: 10,
  },
});
