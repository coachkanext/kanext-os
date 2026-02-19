/**
 * Universal Company Sheet -- Business Mode
 * Company "truth page" with 8 RBAC-gated tabs.
 * This is the CONTENT component -- the parent handles the bottom sheet wrapper.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import {
  type CompanyObject,
  type KPIItem,
  type RiskItem,
  type BudgetCategory,
  type TeamMember,
  type InvestorUpdate,
  type PipelineItem,
  type DecisionLogEntry,
  KANEXT_COMPANY,
  KPI_ITEMS,
  RISK_ITEMS,
  BUDGET_CATEGORIES,
  FUNDING_PLAN,
  TEAM_MEMBERS,
  INVESTOR_UPDATES,
  PIPELINE_ITEMS,
  DECISION_LOG,
  BOARD_PACK_ITEMS,
} from '@/data/mock-business-v2';

import {
  type BusinessRoleLens,
  type CompanyTab,
  getCompanySheetTabs,
  getMetricVisibility,
  isFounder,
  isBoardLevel,
  isInvestor,
} from '@/utils/business-rbac';

// =============================================================================
// PROPS
// =============================================================================

interface UniversalCompanySheetProps {
  company: CompanyObject;
  roleLens: BusinessRoleLens;
  onClose: () => void;
  onOpenDataRoom?: () => void;
}

// =============================================================================
// STATUS HELPERS
// =============================================================================

const STATUS_COLORS: Record<string, string> = {
  private: '#8F8F8F',
  public: '#22C55E',
  in_discussion: '#F59E0B',
};

const STATUS_LABELS: Record<string, string> = {
  private: 'Private',
  public: 'Public',
  in_discussion: 'In Discussion',
};

const KPI_STATUS_COLORS: Record<string, string> = {
  on_track: '#22C55E',
  at_risk: '#F59E0B',
  behind: '#EF4444',
};

const RISK_SEVERITY_COLORS: Record<string, string> = {
  critical: '#EF4444',
  high: '#F59E0B',
  medium: '#6AA9FF',
  low: '#8F8F8F',
};

const BUDGET_STATUS_COLORS: Record<string, string> = {
  on_track: '#22C55E',
  over: '#EF4444',
  under: '#6AA9FF',
  at_risk: '#F59E0B',
};

const FUNDING_STATUS_COLORS: Record<string, string> = {
  closed: '#22C55E',
  active: '#F59E0B',
  open: '#F59E0B',
  closing: '#6AA9FF',
  planned: '#8F8F8F',
};

const DECISION_OUTCOME_COLORS: Record<string, string> = {
  approved: '#22C55E',
  rejected: '#EF4444',
  deferred: '#F59E0B',
  tabled: '#F59E0B',
  pending: '#6AA9FF',
};

const PIPELINE_STAGE_COLORS: Record<string, string> = {
  lead: '#8F8F8F',
  'Initial Contact': '#8F8F8F',
  contacted: '#6AA9FF',
  'Proposal Sent': '#6AA9FF',
  meeting: '#F59E0B',
  Diligence: '#F59E0B',
  diligence: '#F59E0B',
  Exploring: '#F59E0B',
  term_sheet: '#22C55E',
  closed: '#22C55E',
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function UniversalCompanySheet({
  company,
  roleLens,
  onClose,
  onOpenDataRoom,
}: UniversalCompanySheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const tabs = useMemo(() => getCompanySheetTabs(roleLens), [roleLens]);
  const [activeTab, setActiveTab] = useState<CompanyTab>(tabs[0]?.id ?? 'overview');

  const metricVis = getMetricVisibility(roleLens);
  const founder = isFounder(roleLens);
  const board = isBoardLevel(roleLens);
  const investor = isInvestor(roleLens);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}
      <CompanyHeader
        company={company}
        roleLens={roleLens}
        colors={colors}
        metricVis={metricVis}
        founder={founder}
        board={board}
        investor={investor}
        onClose={onClose}
        onOpenDataRoom={onOpenDataRoom}
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
        {activeTab === 'overview' && <OverviewTab colors={colors} roleLens={roleLens} />}
        {activeTab === 'product' && <ProductTab colors={colors} />}
        {activeTab === 'traction' && <TractionTab colors={colors} roleLens={roleLens} board={board} investor={investor} />}
        {activeTab === 'roadmap' && <RoadmapTab colors={colors} board={board} />}
        {activeTab === 'finance' && <FinanceTab colors={colors} metricVis={metricVis} founder={founder} board={board} investor={investor} />}
        {activeTab === 'governance' && <GovernanceTab colors={colors} founder={founder} board={board} />}
        {activeTab === 'people' && <PeopleTab colors={colors} board={board} />}
        {activeTab === 'comms' && <CommsTab colors={colors} roleLens={roleLens} board={board} investor={investor} />}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// HEADER
// =============================================================================

function CompanyHeader({
  company,
  roleLens,
  colors,
  metricVis,
  founder,
  board,
  investor,
  onClose,
  onOpenDataRoom,
}: {
  company: CompanyObject;
  roleLens: BusinessRoleLens;
  colors: typeof Colors.light;
  metricVis: string;
  founder: boolean;
  board: boolean;
  investor: boolean;
  onClose: () => void;
  onOpenDataRoom?: () => void;
}) {
  return (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      {/* Top row: name + close */}
      <View style={styles.headerTopRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.logoRow}>
            <View style={[styles.logoPlaceholder, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[styles.logoText, { color: colors.text }]}>K</ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.companyName, { color: colors.text }]}>
                {company.name}
              </ThemedText>
              <ThemedText style={[styles.tagline, { color: colors.textSecondary }]} numberOfLines={1}>
                {company.tagline}
              </ThemedText>
            </View>
          </View>
        </View>
        <Pressable onPress={onClose} hitSlop={12}>
          <IconSymbol name="xmark" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Status pill */}
      <View style={styles.pillRow}>
        <View
          style={[
            styles.statusPill,
            { backgroundColor: (STATUS_COLORS[company.status] ?? '#8F8F8F') + '1A' },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: STATUS_COLORS[company.status] ?? '#8F8F8F' },
            ]}
          />
          <ThemedText
            style={[
              styles.statusPillText,
              { color: STATUS_COLORS[company.status] ?? '#8F8F8F' },
            ]}
          >
            {STATUS_LABELS[company.status] ?? company.status}
          </ThemedText>
        </View>
      </View>

      {/* Quick chips: RBAC-gated */}
      {(founder || board || investor) && (
        <View style={styles.quickChipRow}>
          {/* Runway: founder + board exact, retail banded */}
          {(founder || board) && company.runway != null && (
            <View style={[styles.quickChip, { backgroundColor: '#6AA9FF22' }]}>
              <IconSymbol name="clock.fill" size={12} color="#6AA9FF" />
              <ThemedText style={[styles.quickChipText, { color: '#6AA9FF' }]}>
                {company.runway} mo runway
              </ThemedText>
            </View>
          )}
          {investor && company.runway != null && (
            <View style={[styles.quickChip, { backgroundColor: '#6AA9FF22' }]}>
              <IconSymbol name="clock.fill" size={12} color="#6AA9FF" />
              <ThemedText style={[styles.quickChipText, { color: '#6AA9FF' }]}>
                6-12 mo runway
              </ThemedText>
            </View>
          )}

          {/* MRR/ARR: founder + board exact, retail banded */}
          {(founder || board) && company.mrr != null && (
            <View style={[styles.quickChip, { backgroundColor: '#22C55E22' }]}>
              <IconSymbol name="dollarsign.circle.fill" size={12} color="#22C55E" />
              <ThemedText style={[styles.quickChipText, { color: '#22C55E' }]}>
                MRR ${(company.mrr / 1000).toFixed(1)}K
              </ThemedText>
            </View>
          )}
          {investor && (
            <View style={[styles.quickChip, { backgroundColor: '#22C55E22' }]}>
              <IconSymbol name="dollarsign.circle.fill" size={12} color="#22C55E" />
              <ThemedText style={[styles.quickChipText, { color: '#22C55E' }]}>
                MRR $0-$10K
              </ThemedText>
            </View>
          )}

          {/* Key Deal: founder + board only */}
          {(founder || board) && company.keyDeal && (
            <View style={[styles.quickChip, { backgroundColor: '#F59E0B22' }]}>
              <IconSymbol name="briefcase.fill" size={12} color="#F59E0B" />
              <ThemedText style={[styles.quickChipText, { color: '#F59E0B' }]}>
                {company.keyDeal}
              </ThemedText>
            </View>
          )}
        </View>
      )}

      {/* Action icons */}
      <View style={styles.actionRow}>
        <ActionIcon icon="square.and.arrow.up" label="Share" colors={colors} />
        {(roleLens === 'B1' || roleLens === 'B2a' || roleLens === 'B2b') && onOpenDataRoom && (
          <Pressable style={styles.actionIconWrap} onPress={onOpenDataRoom}>
            <View style={[styles.actionIconCircle, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <IconSymbol name="folder.fill" size={16} color={colors.textSecondary} />
            </View>
            <ThemedText style={[styles.actionIconLabel, { color: colors.textSecondary }]}>
              Data Room
            </ThemedText>
          </Pressable>
        )}
        {(roleLens === 'B1' || roleLens === 'B2b') && (
          <ActionIcon icon="bubble.left.fill" label="Message" colors={colors} />
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
// OVERVIEW TAB
// =============================================================================

function OverviewTab({ colors, roleLens }: { colors: typeof Colors.light; roleLens: BusinessRoleLens }) {
  const showLinks = roleLens === 'B1' || roleLens === 'B2a' || roleLens === 'B2b' || roleLens === 'B3';

  return (
    <View>
      <SectionCard title="What We Are" colors={colors}>
        <BulletItem text="The operating system for institutions that move culture -- sports programs, churches, leagues, schools, and businesses." colors={colors} />
        <BulletItem text="One platform, five modes: Sports, Church, Competition, Business, Education. Each mode adapts intelligence to the domain." colors={colors} />
        <BulletItem text="AI-powered Nexus engine provides conversational intelligence across every mode -- voice and text." colors={colors} />
      </SectionCard>

      <SectionCard title="Why Now" colors={colors}>
        <BulletItem text="Sub-NCAA institutions (1,050+ schools) have zero modern infrastructure. No analytics, no video, no unified platform." colors={colors} />
        <BulletItem text="NIL and transfer portal have created chaos -- institutions need governed intelligence, not more spreadsheets." colors={colors} />
        <BulletItem text="Video mandate strategy creates a regulatory moat: governing bodies require video, KaNeXT provides it free." colors={colors} />
      </SectionCard>

      <SectionCard title="Current Wedge" colors={colors}>
        <ThemedText style={[styles.bodyText, { color: colors.text }]}>
          Phase 1: Proof Wedge Deployment -- FMU Athletics (13 sports), ICCLA Church (giving + ministries), K-1 Speed Motorsport League (race ops + standings). Three real institutions, three modes, live data.
        </ThemedText>
      </SectionCard>

      <SectionCard title="This Month Priorities" colors={colors}>
        <BulletItem text="Close PBD Co-Founder SAFE Tranche 1 -- wire target Mar 1, 2026" colors={colors} />
        <BulletItem text="Ship video mandate camera specs to NAIA HQ for Feb 25 meeting" colors={colors} />
        <BulletItem text="Finalize KaNeXT Classic selection committee and broadcast plan" colors={colors} />
      </SectionCard>

      {showLinks && (
        <SectionCard title="Links" colors={colors}>
          <LinkRow icon="play.rectangle.fill" label="Demo Environment" subtitle="Interactive product walkthrough" colors={colors} />
          <LinkRow icon="doc.richtext.fill" label="Investor Pitch Deck" subtitle="Feb 2026 -- v3.1" colors={colors} />
          <LinkRow icon="doc.text.fill" label="Two-Page Memo" subtitle="Investment thesis summary" colors={colors} />
        </SectionCard>
      )}
    </View>
  );
}

// =============================================================================
// PRODUCT TAB
// =============================================================================

function ProductTab({ colors }: { colors: typeof Colors.light }) {
  const modes = [
    { name: 'Sports', icon: 'sportscourt.fill', desc: 'Athletics intelligence -- roster, film, recruiting, game ops, analytics' },
    { name: 'Church', icon: 'heart.fill', desc: 'Ministry operations -- giving, connect groups, pastoral care, events' },
    { name: 'Competition', icon: 'flag.checkered', desc: 'League/tournament ops -- standings, race control, compliance, payouts' },
    { name: 'Business', icon: 'briefcase.fill', desc: 'Founder OS -- data room, governance, deal workspaces, investor comms' },
    { name: 'Education', icon: 'graduationcap.fill', desc: 'Academic operations -- curriculum, student tracking, compliance' },
  ];

  const builtNow = [
    { label: 'Multi-mode shell with 5 domain modes', done: true },
    { label: 'Nexus AI -- voice + text conversational intelligence', done: true },
    { label: 'Canonical Engine Library (7 engines)', done: true },
    { label: 'Luxury Control Room UI palette', done: true },
    { label: 'FMU Sports Mode deployment (13 sports)', done: true },
    { label: 'ICCLA Church Mode deployment', done: true },
    { label: 'K-1 Competition Mode deployment', done: true },
    { label: 'Business Mode data room + governance', done: true },
    { label: 'Settlement rails v1 (Stripe integration)', done: false },
    { label: 'KX-C1 camera hardware deployment', done: false },
    { label: 'NAIA video mandate integration', done: false },
  ];

  const principles = [
    'Every institution gets the same quality -- no feature gates by tier',
    'Intelligence is domain-native: sports thinks in KR, church thinks in giving cycles',
    'All governance decisions have audit trails -- no decisions without objects',
    'The OS earns trust by being better than what they have, not by locking them in',
  ];

  return (
    <View>
      <SectionCard title="Modes" colors={colors}>
        {modes.map((mode) => (
          <View key={mode.name} style={[styles.listRow, { borderBottomColor: colors.border }]}>
            <IconSymbol name={mode.icon as any} size={18} color={colors.textSecondary} />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {mode.name}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {mode.desc}
              </ThemedText>
            </View>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="What's Built Now" colors={colors}>
        {builtNow.map((item) => (
          <View key={item.label} style={styles.checklistRow}>
            <ThemedText style={{ fontSize: 14, color: item.done ? '#22C55E' : '#8F8F8F' }}>
              {item.done ? '\u2713' : '\u25CB'}
            </ThemedText>
            <ThemedText
              style={[
                styles.checklistLabel,
                { color: item.done ? colors.text : colors.textTertiary },
              ]}
            >
              {item.label}
            </ThemedText>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="OS Principles" colors={colors}>
        {principles.map((principle, idx) => (
          <BulletItem key={idx} text={principle} colors={colors} />
        ))}
      </SectionCard>

      <SectionCard title="Demo Navigation" colors={colors}>
        <ThemedText style={[styles.bodyText, { color: colors.text }]}>
          21 views across 5 modes. Start with Sports Mode (FMU) for the deepest proof-of-concept. Switch modes via the mode selector in the top bar. Each mode has its own dashboard, detail sheets, and Nexus context.
        </ThemedText>
        <LinkRow icon="play.rectangle.fill" label="Launch Demo" subtitle="Interactive walkthrough" colors={colors} />
      </SectionCard>
    </View>
  );
}

// =============================================================================
// TRACTION TAB
// =============================================================================

function TractionTab({
  colors,
  roleLens,
  board,
  investor,
}: {
  colors: typeof Colors.light;
  roleLens: BusinessRoleLens;
  board: boolean;
  investor: boolean;
}) {
  const pipelineCounts = {
    lead: PIPELINE_ITEMS.filter((p) => p.stage === 'lead' || p.stage === 'Initial Contact' || p.stage === 'Exploring').length,
    contacted: PIPELINE_ITEMS.filter((p) => p.stage === 'contacted' || p.stage === 'Proposal Sent').length,
    meeting: PIPELINE_ITEMS.filter((p) => p.stage === 'meeting' || p.stage === 'Diligence').length,
    advanced: PIPELINE_ITEMS.filter((p) => p.stage === 'diligence' || p.stage === 'term_sheet' || p.stage === 'closed').length,
  };

  const proofPoints = [
    'FMU Athletics OS: 13 sports programs actively using KaNeXT',
    '7 proof events scheduled for Q1-Q2 2026',
    'ESPN+ broadcast partnerships at $0 cost to institutions',
    '$53M-$157M projected free media value for FMU Year 1',
    '14 institutional prospects in active pipeline',
    '18.2M media impressions with 42% MoM growth',
  ];

  return (
    <View>
      {/* Pipeline snapshot */}
      <SectionCard title="Pipeline Snapshot" colors={colors}>
        {investor ? (
          <View>
            <View style={styles.statRow}>
              <StatBlock label="Leads" value={String(pipelineCounts.lead)} color="#8F8F8F" colors={colors} />
              <StatBlock label="Active" value={String(pipelineCounts.contacted)} color="#6AA9FF" colors={colors} />
              <StatBlock label="Advanced" value={String(pipelineCounts.meeting + pipelineCounts.advanced)} color="#22C55E" colors={colors} />
            </View>
            <ThemedText style={[styles.captionText, { color: colors.textTertiary, marginTop: Spacing.sm, textAlign: 'center' }]}>
              Pipeline details available at Board tier
            </ThemedText>
          </View>
        ) : (
          PIPELINE_ITEMS.map((item) => (
            <View key={item.id} style={[styles.listRow, { borderBottomColor: colors.border }]}>
              <View
                style={[
                  styles.pipelineStageBadge,
                  { backgroundColor: (PIPELINE_STAGE_COLORS[item.stage] ?? '#8F8F8F') + '22' },
                ]}
              >
                <ThemedText
                  style={[
                    styles.pipelineStageText,
                    { color: PIPELINE_STAGE_COLORS[item.stage] ?? '#8F8F8F' },
                  ]}
                >
                  {item.stage.toUpperCase()}
                </ThemedText>
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {item.name}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  {item.type} {item.status === 'active' ? '' : '(' + item.status + ')'}
                </ThemedText>
              </View>
            </View>
          ))
        )}
      </SectionCard>

      {/* Proof Points */}
      <SectionCard title="Proof Points" colors={colors}>
        {proofPoints.map((point, idx) => (
          <BulletItem key={idx} text={point} colors={colors} />
        ))}
      </SectionCard>

      {/* Usage Metrics */}
      <SectionCard title="Usage Metrics" colors={colors}>
        {board ? (
          <View>
            <View style={styles.statRow}>
              <StatBlock label="App Installs" value="2,340" color="#6AA9FF" colors={colors} />
              <StatBlock label="Avg Session" value="8.2 min" color="#22C55E" colors={colors} />
              <StatBlock label="Uptime" value="99.7%" color="#DDDDDD" colors={colors} />
            </View>
            <View style={[styles.statRow, { marginTop: Spacing.md }]}>
              <StatBlock label="Media Reach" value="18.2M" color="#F59E0B" colors={colors} />
              <StatBlock label="Proof Sites" value="3" color="#22C55E" colors={colors} />
              <StatBlock label="Events" value="7" color="#6AA9FF" colors={colors} />
            </View>
          </View>
        ) : investor ? (
          <View>
            <View style={styles.statRow}>
              <StatBlock label="App Installs" value="1K-5K" color="#6AA9FF" colors={colors} />
              <StatBlock label="Avg Session" value="5-10 min" color="#22C55E" colors={colors} />
              <StatBlock label="Uptime" value=">99%" color="#DDDDDD" colors={colors} />
            </View>
            <ThemedText style={[styles.captionText, { color: colors.textTertiary, marginTop: Spacing.sm, textAlign: 'center' }]}>
              Banded metrics -- exact figures at Board tier
            </ThemedText>
          </View>
        ) : (
          <View style={styles.statRow}>
            <StatBlock label="Proof Sites" value="3" color="#22C55E" colors={colors} />
            <StatBlock label="Events" value="7" color="#6AA9FF" colors={colors} />
            <StatBlock label="Modes" value="5" color="#DDDDDD" colors={colors} />
          </View>
        )}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// ROADMAP TAB
// =============================================================================

function RoadmapTab({ colors, board }: { colors: typeof Colors.light; board: boolean }) {
  const milestones90 = [
    'Close PBD Co-Founder SAFE Tranche 1 ($100K)',
    'Complete NAIA video mandate partnership meeting',
    'Ship BTW Memorial Classic (Nov 2025 event)',
    'Deploy KX-C1 cameras at 3 proof sites',
    'Launch settlement rails v1 (Stripe integration)',
  ];

  const milestones6mo = [
    'Execute KaNeXT Classic (32-team postseason)',
    'Complete all 5 PBD SAFE tranches ($500K total)',
    'Onboard 10+ HBCU institutions via mandate',
    'Hire senior engineer + designer',
    'Launch MLK Truth Classic (16-team tournament)',
  ];

  const milestones12mo = [
    'Reach 500+ institutions on platform',
    'Achieve $5M ARR from subscription + events',
    'Close institutional pre-seed ($2M-$5M)',
    'Expand to NJCAA and CCCAA mandates',
    'Begin EU expansion (Malta / UK pilot)',
  ];

  const risks = [
    { risk: 'Single-developer bottleneck', mitigation: 'Phase 1 hiring: 1 engineer + 1 designer by May 2026' },
    { risk: 'PBD tranche timeline slippage', mitigation: 'Bridge financing plan ready. Weekly sync cadence.' },
    { risk: 'NAIA mandate scope uncertainty', mitigation: 'Parallel NJCAA/CCCAA conversations as alternatives' },
    { risk: 'Camera supply chain delays', mitigation: '2 backup NDAA-compliant vendors identified. 6-week lead time.' },
  ];

  const hiringPlan = [
    { role: 'Senior Engineer', timeline: 'May 2026', priority: 'Critical' },
    { role: 'Product Designer', timeline: 'Jun 2026', priority: 'High' },
    { role: 'Business Development Lead', timeline: 'Q3 2026', priority: 'Medium' },
    { role: 'Customer Success Manager', timeline: 'Q4 2026', priority: 'Medium' },
  ];

  return (
    <View>
      <SectionCard title="90-Day Milestones" colors={colors}>
        {milestones90.map((item, idx) => (
          <BulletItem key={idx} text={item} colors={colors} />
        ))}
      </SectionCard>

      <SectionCard title="6-Month Milestones" colors={colors}>
        {milestones6mo.map((item, idx) => (
          <BulletItem key={idx} text={item} colors={colors} />
        ))}
      </SectionCard>

      <SectionCard title="12-Month Milestones" colors={colors}>
        {milestones12mo.map((item, idx) => (
          <BulletItem key={idx} text={item} colors={colors} />
        ))}
      </SectionCard>

      {board && (
        <SectionCard title="Risks + Mitigations" colors={colors}>
          {risks.map((item, idx) => (
            <View key={idx} style={[styles.listRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.riskDot, { backgroundColor: '#F59E0B' }]} />
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {item.risk}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  Mitigation: {item.mitigation}
                </ThemedText>
              </View>
            </View>
          ))}
        </SectionCard>
      )}

      {board && (
        <SectionCard title="Hiring Plan" colors={colors}>
          {hiringPlan.map((item, idx) => (
            <View key={idx} style={[styles.listRow, { borderBottomColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {item.role}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  Target: {item.timeline}
                </ThemedText>
              </View>
              <View
                style={[
                  styles.priorityBadge,
                  {
                    backgroundColor:
                      item.priority === 'Critical' ? '#EF444422' :
                      item.priority === 'High' ? '#F59E0B22' : '#8F8F8F22',
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.priorityText,
                    {
                      color:
                        item.priority === 'Critical' ? '#EF4444' :
                        item.priority === 'High' ? '#F59E0B' : '#8F8F8F',
                    },
                  ]}
                >
                  {item.priority.toUpperCase()}
                </ThemedText>
              </View>
            </View>
          ))}
        </SectionCard>
      )}
    </View>
  );
}

// =============================================================================
// FINANCE TAB
// =============================================================================

function FinanceTab({
  colors,
  metricVis,
  founder,
  board,
  investor,
}: {
  colors: typeof Colors.light;
  metricVis: string;
  founder: boolean;
  board: boolean;
  investor: boolean;
}) {
  return (
    <View>
      {/* Revenue Model */}
      <SectionCard title="Revenue Model" colors={colors}>
        <BulletItem text="Institutional SaaS subscriptions ($18K-$36K ARR per institution)" colors={colors} />
        <BulletItem text="Event settlement fees (1.5-3% transaction fee on tickets, payouts, donations)" colors={colors} />
        <BulletItem text="Video mandate hardware-as-a-service (KX-C1 cameras deployed free, monetized via platform)" colors={colors} />
        <BulletItem text="Media distribution revenue share (ESPN+ broadcast partnerships)" colors={colors} />
      </SectionCard>

      {/* Burn + Runway */}
      <SectionCard title="Burn + Runway" colors={colors}>
        {metricVis === 'exact' ? (
          <View style={styles.statRow}>
            <StatBlock label="Monthly Burn" value="$35K" color="#EF4444" colors={colors} />
            <StatBlock label="Runway" value="14 mo" color="#6AA9FF" colors={colors} />
            <StatBlock label="Cash" value="$490K" color="#22C55E" colors={colors} />
          </View>
        ) : (
          <View style={styles.statRow}>
            <StatBlock label="Monthly Burn" value="$25-$50K" color="#EF4444" colors={colors} />
            <StatBlock label="Runway" value="12-18 mo" color="#6AA9FF" colors={colors} />
            <StatBlock label="Cash" value="$300-$600K" color="#22C55E" colors={colors} />
          </View>
        )}
      </SectionCard>

      {/* Budget Categories */}
      <SectionCard title="Budget Categories" colors={colors}>
        {BUDGET_CATEGORIES.map((cat) => (
          <View key={cat.id} style={[styles.listRow, { borderBottomColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {cat.name}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {metricVis === 'exact'
                  ? `Allocated: $${cat.allocated.toLocaleString()} | Spent: $${cat.spent.toLocaleString()} | Remaining: $${cat.remaining.toLocaleString()}`
                  : `Allocated: $${Math.round(cat.allocated / 5000) * 5}K-$${Math.round(cat.allocated / 5000) * 5 + 10}K range`
                }
              </ThemedText>
            </View>
            {metricVis === 'exact' && (
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
            )}
          </View>
        ))}
      </SectionCard>

      {/* Funding Plan */}
      <SectionCard title="Funding Plan" colors={colors}>
        <View style={[styles.listRow, { borderBottomColor: colors.border }]}>
          <View
            style={[
              styles.fundingStatusBadge,
              { backgroundColor: (FUNDING_STATUS_COLORS[FUNDING_PLAN.status] ?? '#8F8F8F') + '22' },
            ]}
          >
            <ThemedText
              style={[
                styles.fundingStatusText,
                { color: FUNDING_STATUS_COLORS[FUNDING_PLAN.status] ?? '#8F8F8F' },
              ]}
            >
              {FUNDING_PLAN.status.toUpperCase()}
            </ThemedText>
          </View>
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
              {FUNDING_PLAN.round}
            </ThemedText>
            <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
              {metricVis === 'exact'
                ? `Target: $${(FUNDING_PLAN.target / 1000000).toFixed(1)}M | Raised: $${FUNDING_PLAN.raised.toLocaleString()}`
                : `Target: $1M-$2M range | Status: ${FUNDING_PLAN.status}`
              }
            </ThemedText>
          </View>
        </View>
      </SectionCard>
    </View>
  );
}

// =============================================================================
// GOVERNANCE TAB
// =============================================================================

function GovernanceTab({
  colors,
  founder,
  board,
}: {
  colors: typeof Colors.light;
  founder: boolean;
  board: boolean;
}) {
  return (
    <View>
      {/* Board Cadence */}
      <SectionCard title="Board Cadence" colors={colors}>
        <ThemedText style={[styles.bodyText, { color: colors.text }]}>
          Monthly board meetings (2nd Friday). Quarterly deep-dives with full financial review. Emergency sessions within 48 hours for critical decisions.
        </ThemedText>
        <ThemedText style={[styles.captionText, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
          Next scheduled: Mar 14, 2026 at 2:00 PM EST
        </ThemedText>
      </SectionCard>

      {/* Decision Log (read-only for board) */}
      <SectionCard title="Decision Log" colors={colors}>
        {DECISION_LOG.map((entry) => (
          <View key={entry.id} style={[styles.listRow, { borderBottomColor: colors.border }]}>
            <View
              style={[
                styles.decisionOutcomeBadge,
                { backgroundColor: (DECISION_OUTCOME_COLORS[entry.outcome] ?? '#8F8F8F') + '22' },
              ]}
            >
              <ThemedText
                style={[
                  styles.decisionOutcomeText,
                  { color: DECISION_OUTCOME_COLORS[entry.outcome] ?? '#8F8F8F' },
                ]}
              >
                {entry.outcome.toUpperCase()}
              </ThemedText>
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {entry.motion}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {entry.date} | Owner: {entry.owner}
                {entry.attachments && Array.isArray(entry.attachments) && entry.attachments.length > 0
                  ? ` | ${entry.attachments.length} attachment${entry.attachments.length > 1 ? 's' : ''}`
                  : ''}
              </ThemedText>
            </View>
          </View>
        ))}
      </SectionCard>

      {/* KPI Scoreboard */}
      <SectionCard title="KPI Scoreboard" colors={colors}>
        {KPI_ITEMS.map((kpi) => (
          <View key={kpi.id} style={[styles.listRow, { borderBottomColor: colors.border }]}>
            <View
              style={[
                styles.kpiStatusDot,
                { backgroundColor: KPI_STATUS_COLORS[kpi.status] ?? '#8F8F8F' },
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
                { color: KPI_STATUS_COLORS[kpi.status] ?? '#8F8F8F' },
              ]}
            >
              {kpi.status.replace('_', ' ').toUpperCase()}
            </ThemedText>
          </View>
        ))}
      </SectionCard>

      {/* Risk Register (board only) */}
      {board && (
        <SectionCard title="Risk Register" colors={colors}>
          {RISK_ITEMS.map((risk) => (
            <View key={risk.id} style={[styles.listRow, { borderBottomColor: colors.border }]}>
              <View
                style={[
                  styles.severityBadge,
                  { backgroundColor: (RISK_SEVERITY_COLORS[risk.severity] ?? '#8F8F8F') + '22' },
                ]}
              >
                <ThemedText
                  style={[
                    styles.severityText,
                    { color: RISK_SEVERITY_COLORS[risk.severity] ?? '#8F8F8F' },
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
      )}

      {/* Cap Table Summary */}
      <SectionCard title="Cap Table Summary" colors={colors}>
        {founder ? (
          <View>
            <CapTableRow label="Founder (Sammy Kalejaiye)" value="100%" note="Pre-dilution" colors={colors} />
            <CapTableRow label="PBD Co-Founder SAFE" value="Up to 10%" note="5-tranche, pending" colors={colors} />
            <CapTableRow label="Family SAFE" value="TBD" note="Active round" colors={colors} />
            <CapTableRow label="Option Pool (Reserved)" value="10%" note="For future hires" colors={colors} />
          </View>
        ) : (
          <View>
            <ThemedText style={[styles.bodyText, { color: colors.text }]}>
              Single founder structure with strategic co-founder SAFE in progress.
            </ThemedText>
            <ThemedText style={[styles.captionText, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
              Founder majority control maintained through all planned rounds. Option pool reserved for key hires. Board seat activates at co-founder tranche threshold.
            </ThemedText>
          </View>
        )}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// PEOPLE TAB
// =============================================================================

function PeopleTab({ colors, board }: { colors: typeof Colors.light; board: boolean }) {
  const leadership = TEAM_MEMBERS.filter((m) => m.type === 'leadership');
  const advisors = TEAM_MEMBERS.filter((m) => m.type === 'advisor');
  const team = TEAM_MEMBERS.filter((m) => m.type === 'team');

  const publicAdvisors = advisors.filter((a) => a.public);
  const publicTeam = team.filter((t) => t.public);

  return (
    <View>
      {/* Leadership */}
      <SectionCard title="Leadership" colors={colors}>
        {leadership.map((member) => (
          <View key={member.id} style={[styles.listRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.personAvatar, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[styles.personInitial, { color: colors.textSecondary }]}>
                {member.name.charAt(0)}
              </ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {member.name}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {member.role} | {member.department}
              </ThemedText>
              {member.bio && (
                <ThemedText style={[styles.captionText, { color: colors.textTertiary, marginTop: 2 }]}>
                  {member.bio}
                </ThemedText>
              )}
            </View>
          </View>
        ))}
      </SectionCard>

      {/* Advisors */}
      <SectionCard title="Advisors" colors={colors}>
        {(board ? advisors : publicAdvisors).map((member) => (
          <View key={member.id} style={[styles.listRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.personAvatar, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[styles.personInitial, { color: colors.textSecondary }]}>
                {member.name.charAt(0)}
              </ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {member.name}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {member.role}
              </ThemedText>
              {member.bio && (
                <ThemedText style={[styles.captionText, { color: colors.textTertiary, marginTop: 2 }]}>
                  {member.bio}
                </ThemedText>
              )}
            </View>
          </View>
        ))}
      </SectionCard>

      {/* Org Chart (board only) */}
      {board && (
        <SectionCard title="Team" colors={colors}>
          {team.map((member) => (
            <View key={member.id} style={[styles.listRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.personAvatar, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <ThemedText style={[styles.personInitial, { color: colors.textSecondary }]}>
                  {member.name.charAt(0)}
                </ThemedText>
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {member.name}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  {member.role} | {member.department}
                </ThemedText>
                {member.bio && (
                  <ThemedText style={[styles.captionText, { color: colors.textTertiary, marginTop: 2 }]}>
                    {member.bio}
                  </ThemedText>
                )}
              </View>
            </View>
          ))}
        </SectionCard>
      )}

      {!board && publicTeam.length > 0 && (
        <SectionCard title="Team" colors={colors}>
          {publicTeam.map((member) => (
            <View key={member.id} style={[styles.listRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.personAvatar, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <ThemedText style={[styles.personInitial, { color: colors.textSecondary }]}>
                  {member.name.charAt(0)}
                </ThemedText>
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {member.name}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  {member.role}
                </ThemedText>
              </View>
            </View>
          ))}
        </SectionCard>
      )}
    </View>
  );
}

// =============================================================================
// COMMS TAB
// =============================================================================

function CommsTab({
  colors,
  roleLens,
  board,
  investor,
}: {
  colors: typeof Colors.light;
  roleLens: BusinessRoleLens;
  board: boolean;
  investor: boolean;
}) {
  const pressReleases = [
    { id: 'pr-1', title: 'KaNeXT Announces Mission to Build Institutional OS', date: 'Jan 15, 2026', status: 'published' },
    { id: 'pr-2', title: 'FMU Athletics Partners with KaNeXT for 13-Sport Deployment', date: 'Feb 1, 2026', status: 'published' },
    { id: 'pr-3', title: 'KaNeXT Launches Free Camera Program for Sub-NCAA Schools', date: 'Feb 10, 2026', status: 'draft' },
  ];

  const brandAssets = [
    { id: 'ba-1', title: 'KaNeXT Logo Pack (SVG + PNG)', type: 'Logo', access: 'public' },
    { id: 'ba-2', title: 'Brand Guidelines v2', type: 'Guide', access: 'public' },
    { id: 'ba-3', title: 'Pitch Deck Template', type: 'Template', access: 'retail' },
    { id: 'ba-4', title: 'Press Kit', type: 'Kit', access: 'public' },
  ];

  return (
    <View>
      {/* Press Releases */}
      <SectionCard title="Press Releases" colors={colors}>
        {pressReleases.map((pr) => (
          <View key={pr.id} style={[styles.listRow, { borderBottomColor: colors.border }]}>
            <IconSymbol name="newspaper.fill" size={16} color={colors.textSecondary} />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {pr.title}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {pr.date}
              </ThemedText>
            </View>
            <ThemedText
              style={[
                styles.statusLabel,
                { color: pr.status === 'published' ? '#22C55E' : '#8F8F8F' },
              ]}
            >
              {pr.status.toUpperCase()}
            </ThemedText>
          </View>
        ))}
      </SectionCard>

      {/* Investor Updates */}
      <SectionCard title="Investor Updates" colors={colors}>
        {INVESTOR_UPDATES.map((update) => {
          const canSee =
            roleLens === 'B1' ||
            (update.tier === 'public') ||
            (update.tier === 'retail' && (roleLens === 'B2a' || roleLens === 'B2b' || roleLens === 'B3')) ||
            (update.tier === 'board' && (roleLens === 'B2b'));

          if (!canSee) return null;

          const isSanitized = investor && update.tier === 'retail';

          return (
            <View key={update.id} style={[styles.listRow, { borderBottomColor: colors.border }]}>
              <IconSymbol name="envelope.fill" size={16} color={colors.textSecondary} />
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {update.title}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  {update.date} | {update.tier.charAt(0).toUpperCase() + update.tier.slice(1)} tier
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textTertiary, marginTop: 2 }]} numberOfLines={2}>
                  {isSanitized ? update.summary.split('.')[0] + '.' : update.summary}
                </ThemedText>
              </View>
            </View>
          );
        })}
      </SectionCard>

      {/* Brand Assets */}
      <SectionCard title="Brand Assets" colors={colors}>
        {brandAssets
          .filter((asset) => asset.access === 'public' || roleLens !== 'B3')
          .map((asset) => (
            <View key={asset.id} style={[styles.listRow, { borderBottomColor: colors.border }]}>
              <IconSymbol name="doc.fill" size={16} color={colors.textSecondary} />
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {asset.title}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  {asset.type}
                </ThemedText>
              </View>
              <IconSymbol name="arrow.down.circle" size={16} color={colors.textTertiary} />
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

function LinkRow({
  icon,
  label,
  subtitle,
  colors,
}: {
  icon: string;
  label: string;
  subtitle: string;
  colors: typeof Colors.light;
}) {
  return (
    <Pressable style={[styles.listRow, { borderBottomColor: colors.border }]}>
      <IconSymbol name={icon as any} size={18} color="#6AA9FF" />
      <View style={{ flex: 1, marginLeft: Spacing.sm }}>
        <ThemedText style={[styles.listRowTitle, { color: '#6AA9FF' }]}>
          {label}
        </ThemedText>
        <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
          {subtitle}
        </ThemedText>
      </View>
      <IconSymbol name="arrow.up.right" size={14} color="#6AA9FF" />
    </Pressable>
  );
}

function CapTableRow({
  label,
  value,
  note,
  colors,
}: {
  label: string;
  value: string;
  note: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={[styles.listRow, { borderBottomColor: colors.border }]}>
      <View style={{ flex: 1 }}>
        <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
          {label}
        </ThemedText>
        <ThemedText style={[styles.captionText, { color: colors.textTertiary }]}>
          {note}
        </ThemedText>
      </View>
      <ThemedText style={[styles.capTableValue, { color: colors.text }]}>
        {value}
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
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
  },
  companyName: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
  tagline: {
    fontSize: 12,
    marginTop: 1,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  quickChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  quickChipText: {
    fontSize: 11,
    fontWeight: '600',
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

  // Pipeline
  pipelineStageBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    minWidth: 70,
    alignItems: 'center',
  },
  pipelineStageText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Risk
  riskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Priority
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  priorityText: {
    fontSize: 9,
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

  // Funding
  fundingStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    minWidth: 60,
    alignItems: 'center',
  },
  fundingStatusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Governance
  decisionOutcomeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    minWidth: 70,
    alignItems: 'center',
  },
  decisionOutcomeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  kpiStatusDot: {
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
  capTableValue: {
    fontSize: 14,
    fontWeight: '700',
  },

  // People
  personAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personInitial: {
    fontSize: 14,
    fontWeight: '600',
  },
});
