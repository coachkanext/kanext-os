/**
 * Universal Deal Sheet -- Business Mode
 * Deal workspace "truth page" with 8 RBAC-gated tabs.
 * This is the CONTENT component -- the parent handles the bottom sheet wrapper.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import {
  type DealWorkspace,
  type RiskItem,
  RISK_ITEMS,
} from '@/data/mock-business-v2';

import {
  type BusinessRoleLens,
  type DealTab,
  getDealSheetTabs,
  isFounder,
  isBoardLevel,
} from '@/utils/business-rbac';

// =============================================================================
// PROPS
// =============================================================================

interface UniversalDealSheetProps {
  deal: DealWorkspace;
  roleLens: BusinessRoleLens;
  onClose: () => void;
}

// =============================================================================
// STATUS / FORMAT HELPERS
// =============================================================================

const DEAL_STATUS_COLORS: Record<string, string> = {
  exploring: '#1D9BF0',
  diligence: '#F59E0B',
  offer: '#22C55E',
  closed: '#A1A1AA',
};

const DEAL_STATUS_LABELS: Record<string, string> = {
  exploring: 'Exploring',
  diligence: 'Diligence',
  offer: 'Offer',
  closed: 'Closed',
};

const DILIGENCE_STATUS_COLORS: Record<string, string> = {
  complete: '#22C55E',
  in_progress: '#F59E0B',
  pending: '#1D9BF0',
  blocked: '#EF4444',
};

const RISK_SEVERITY_COLORS: Record<string, string> = {
  critical: '#EF4444',
  high: '#F59E0B',
  medium: '#1D9BF0',
  low: '#A1A1AA',
};

const APPROVAL_STATUS_COLORS: Record<string, string> = {
  approved: '#22C55E',
  pending: '#F59E0B',
  rejected: '#EF4444',
  in_review: '#1D9BF0',
};

const PIPELINE_GATE_COLORS: Record<string, string> = {
  passed: '#22C55E',
  active: '#F59E0B',
  upcoming: '#A1A1AA',
};

// =============================================================================
// MOCK DATA — DEAL-SPECIFIC (inline, no external dependency)
// =============================================================================

interface DiligenceCategory {
  id: string;
  category: string;
  items: DiligenceItem[];
}

interface DiligenceItem {
  id: string;
  title: string;
  status: 'complete' | 'in_progress' | 'pending' | 'blocked';
  assignee: string;
  notes: string;
}

interface ApprovalItem {
  id: string;
  title: string;
  status: 'approved' | 'pending' | 'rejected' | 'in_review';
  approver: string;
  date: string;
  notes: string;
}

interface AuditLogItem {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  detail: string;
  type: 'access' | 'action' | 'document';
}

const SLIEMA_DILIGENCE: DiligenceCategory[] = [
  {
    id: 'dc-fin',
    category: 'Financial',
    items: [
      { id: 'di-1', title: 'Club financial statements (3 years)', status: 'pending', assignee: 'Alex M', notes: 'Requested from club president Feb 18' },
      { id: 'di-2', title: 'Revenue breakdown by source', status: 'pending', assignee: 'Alex M', notes: 'Match day, sponsorship, media rights, merchandise' },
      { id: 'di-3', title: 'Player wage bill analysis', status: 'pending', assignee: 'Alex M', notes: 'Squad size: 25 players' },
      { id: 'di-4', title: 'Stadium lease terms', status: 'pending', assignee: 'Alex M', notes: 'Ta\' Qali National Stadium arrangement' },
    ],
  },
  {
    id: 'dc-legal',
    category: 'Legal',
    items: [
      { id: 'di-5', title: 'Club constitution and bylaws', status: 'pending', assignee: 'Legal Counsel', notes: 'Maltese company law requirements' },
      { id: 'di-6', title: 'League Association licensing', status: 'in_progress', assignee: 'Alex M', notes: 'Taylor Reed facilitating introduction' },
      { id: 'di-7', title: 'UEFA club licensing compliance', status: 'pending', assignee: 'Legal Counsel', notes: 'Financial fair play requirements' },
      { id: 'di-8', title: 'Existing contracts and obligations', status: 'pending', assignee: 'Legal Counsel', notes: 'Player contracts, sponsor agreements, supplier contracts' },
    ],
  },
  {
    id: 'dc-ops',
    category: 'Operational',
    items: [
      { id: 'di-9', title: 'Youth academy assessment', status: 'pending', assignee: 'Alex M', notes: 'Current infrastructure and player pipeline' },
      { id: 'di-10', title: 'Staff and personnel review', status: 'pending', assignee: 'Alex M', notes: 'Coaching, admin, medical, grounds staff' },
      { id: 'di-11', title: 'Facility condition report', status: 'pending', assignee: 'Alex M', notes: 'Training ground, equipment, medical facilities' },
      { id: 'di-12', title: 'Technology infrastructure audit', status: 'pending', assignee: 'Alex M', notes: 'Opportunity to deploy KaNeXT Sports Mode' },
    ],
  },
  {
    id: 'dc-reg',
    category: 'Regulatory',
    items: [
      { id: 'di-13', title: 'MFA ownership approval process', status: 'in_progress', assignee: 'Legal Counsel', notes: 'Fit and proper person test required' },
      { id: 'di-14', title: 'EU foreign ownership regulations', status: 'pending', assignee: 'Legal Counsel', notes: 'Malta EU member state -- standard process' },
      { id: 'di-15', title: 'Anti-money laundering (AML) compliance', status: 'pending', assignee: 'Legal Counsel', notes: 'Source of funds documentation required' },
    ],
  },
];

const DEAL_RISKS: Record<string, { id: string; title: string; severity: 'critical' | 'high' | 'medium' | 'low'; mitigation: string; owner: string }[]> = {
  'deal-1': [],
  'deal-2': [
    { id: 'dr-1', title: 'Club financial instability', severity: 'high', mitigation: 'Full financial audit before LOI. Escrow structure for acquisition funds.', owner: 'Alex M' },
    { id: 'dr-2', title: 'MFA ownership approval delay', severity: 'medium', mitigation: 'Early engagement with MFA via Taylor Reed. Parallel documentation preparation.', owner: 'Legal Counsel' },
    { id: 'dr-3', title: 'EU regulatory complexity', severity: 'medium', mitigation: 'Engage Malta-based corporate counsel. Standard EU foreign ownership process.', owner: 'Legal Counsel' },
    { id: 'dr-4', title: 'Stadium lease renegotiation risk', severity: 'low', mitigation: 'Review existing lease terms. Budget for potential renegotiation costs.', owner: 'Alex M' },
    { id: 'dr-5', title: 'Player retention during transition', severity: 'medium', mitigation: 'Communicate stability plan to squad. Honor existing contracts.', owner: 'Alex M' },
  ],
};

const DEAL_APPROVALS: Record<string, ApprovalItem[]> = {
  'deal-1': [
    { id: 'ap-1', title: 'KaNeXT Athletics Department Sign-Off', status: 'approved', approver: 'KaNeXT AD', date: 'Jan 25, 2026', notes: 'Full athletics deployment approved for 13 sports' },
    { id: 'ap-2', title: 'KaNeXT Board Approval', status: 'approved', approver: 'Alex M', date: 'Jan 30, 2026', notes: 'Partnership terms approved under $50K threshold' },
  ],
  'deal-2': [
    { id: 'ap-3', title: 'Acquisition Exploration Authorization', status: 'approved', approver: 'Alex M', date: 'Jan 15, 2026', notes: 'Authorized initial outreach and exploration budget ($5K)' },
    { id: 'ap-4', title: 'Legal Counsel Engagement', status: 'approved', approver: 'Alex M', date: 'Feb 5, 2026', notes: 'Engaged Malta-based counsel Dr. Anne Vassallo' },
    { id: 'ap-5', title: 'Site Visit Budget Approval', status: 'pending', approver: 'Board', date: 'Pending', notes: 'Request: $3K travel budget for Malta site visit Q1 2026' },
    { id: 'ap-6', title: 'LOI Authorization', status: 'pending', approver: 'Board', date: 'Pending', notes: 'Requires board approval before LOI submission. Target Q2 2026.' },
  ],
};

const AUDIT_LOGS: Record<string, AuditLogItem[]> = {
  'deal-1': [
    { id: 'al-1', timestamp: 'Feb 14, 2026 2:15 PM', action: 'Deal status updated', actor: 'Alex M', detail: 'Status changed from Exploring to Diligence', type: 'action' },
    { id: 'al-2', timestamp: 'Feb 12, 2026 10:30 AM', action: 'Document uploaded', actor: 'Alex M', detail: 'KaNeXT Athletics Partnership Agreement v2.pdf', type: 'document' },
    { id: 'al-3', timestamp: 'Feb 5, 2026 3:45 PM', action: 'Contact added', actor: 'Alex M', detail: 'Added KaNeXT Athletic Director as key contact', type: 'action' },
    { id: 'al-4', timestamp: 'Jan 25, 2026 11:00 AM', action: 'Approval granted', actor: 'KaNeXT AD', detail: 'KaNeXT Athletics Department sign-off approved', type: 'action' },
    { id: 'al-5', timestamp: 'Jan 20, 2026 9:15 AM', action: 'Workspace created', actor: 'Alex M', detail: 'Deal workspace initialized: KaNeXT Partnership Track', type: 'action' },
  ],
  'deal-2': [
    { id: 'al-6', timestamp: 'Feb 18, 2026 4:00 PM', action: 'Financial package requested', actor: 'Alex M', detail: 'Sent formal request for club financial statements to Mario Camilleri', type: 'action' },
    { id: 'al-7', timestamp: 'Feb 5, 2026 2:30 PM', action: 'Introductory call completed', actor: 'Alex M', detail: 'Call with club president Mario Camilleri. Positive reception.', type: 'action' },
    { id: 'al-8', timestamp: 'Feb 5, 2026 2:00 PM', action: 'Contact added', actor: 'Alex M', detail: 'Added Dr. Anne Vassallo (Legal Counsel, Malta)', type: 'action' },
    { id: 'al-9', timestamp: 'Jan 20, 2026 10:00 AM', action: 'Initial outreach sent', actor: 'Alex M', detail: 'Outreach via Maltese FA connection (Taylor Reed)', type: 'action' },
    { id: 'al-10', timestamp: 'Jan 15, 2026 3:30 PM', action: 'Workspace created', actor: 'Alex M', detail: 'Deal workspace initialized: Sliema Wanderers FC Acquisition', type: 'action' },
    { id: 'al-11', timestamp: 'Jan 15, 2026 3:30 PM', action: 'Workspace accessed', actor: 'Alex M', detail: 'First access to deal workspace', type: 'access' },
  ],
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function UniversalDealSheet({
  deal,
  roleLens,
  onClose,
}: UniversalDealSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const tabs = useMemo(() => getDealSheetTabs(roleLens), [roleLens]);
  const [activeTab, setActiveTab] = useState<DealTab>(tabs[0]?.id ?? 'overview');

  const founder = isFounder(roleLens);
  const board = isBoardLevel(roleLens);

  const diligenceData = SLIEMA_DILIGENCE;
  const dealRisks = DEAL_RISKS[deal.id] ?? [];
  const dealApprovals = DEAL_APPROVALS[deal.id] ?? [];
  const auditLog = AUDIT_LOGS[deal.id] ?? [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}
      <DealHeader
        deal={deal}
        colors={colors}
        founder={founder}
        onClose={onClose}
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
        {activeTab === 'overview' && <OverviewTab deal={deal} colors={colors} />}
        {activeTab === 'pipeline' && <PipelineTab deal={deal} colors={colors} />}
        {activeTab === 'diligence' && <DiligenceTab diligenceData={diligenceData} colors={colors} />}
        {activeTab === 'financial_model' && <FinancialModelTab deal={deal} colors={colors} />}
        {activeTab === 'risks' && <RisksTab dealRisks={dealRisks} colors={colors} />}
        {activeTab === 'offer_terms' && <OfferTermsTab deal={deal} colors={colors} />}
        {activeTab === 'approvals' && <ApprovalsTab dealApprovals={dealApprovals} colors={colors} />}
        {activeTab === 'audit_log' && <AuditLogTab auditLog={auditLog} colors={colors} />}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// HEADER
// =============================================================================

function DealHeader({
  deal,
  colors,
  founder,
  onClose,
}: {
  deal: DealWorkspace;
  colors: typeof Colors.light;
  founder: boolean;
  onClose: () => void;
}) {
  return (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      {/* Top row: name + close */}
      <View style={styles.headerTopRow}>
        <View style={{ flex: 1 }}>
          <ThemedText style={[styles.dealName, { color: colors.text }]}>
            {deal.name}
          </ThemedText>
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
            { backgroundColor: (DEAL_STATUS_COLORS[deal.status] ?? '#A1A1AA') + '1A' },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: DEAL_STATUS_COLORS[deal.status] ?? '#A1A1AA' },
            ]}
          />
          <ThemedText
            style={[
              styles.statusPillText,
              { color: DEAL_STATUS_COLORS[deal.status] ?? '#A1A1AA' },
            ]}
          >
            {DEAL_STATUS_LABELS[deal.status] ?? deal.status}
          </ThemedText>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <ActionIcon icon="plus.circle.fill" label="Add Task" colors={colors} />
        <ActionIcon icon="arrow.up.doc.fill" label="Upload" colors={colors} />
        <ActionIcon icon="checkmark.seal.fill" label="Approval" colors={colors} />
        <ActionIcon icon="square.and.arrow.up" label="Export" colors={colors} />
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

function OverviewTab({ deal, colors }: { deal: DealWorkspace; colors: typeof Colors.light }) {
  return (
    <View>
      {/* Deal Summary */}
      <SectionCard title="Deal Summary" colors={colors}>
        <ThemedText style={[styles.bodyText, { color: colors.text }]}>
          {deal.description}
        </ThemedText>
      </SectionCard>

      {/* Target Org */}
      <SectionCard title="Target Organization" colors={colors}>
        <View style={[styles.listRow, { borderBottomColor: colors.border }]}>
          <IconSymbol name="building.2.fill" size={18} color={colors.textSecondary} />
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
              {deal.targetOrg}
            </ThemedText>
            <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
              {deal.type === 'acquisition' ? 'Acquisition Target' : 'Strategic Partner'}
            </ThemedText>
          </View>
        </View>
      </SectionCard>

      {/* Key Contacts */}
      {deal.keyContacts && deal.keyContacts.length > 0 && (
        <SectionCard title="Key Contacts" colors={colors}>
          {deal.keyContacts.map((contact, idx) => (
            <View key={idx} style={[styles.listRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.contactAvatar, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <ThemedText style={[styles.contactInitial, { color: colors.textSecondary }]}>
                  {contact.name.charAt(0)}
                </ThemedText>
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {contact.name}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  {contact.role}
                </ThemedText>
              </View>
            </View>
          ))}
        </SectionCard>
      )}

      {/* Timeline */}
      {deal.timeline && deal.timeline.length > 0 && (
        <SectionCard title="Timeline" colors={colors}>
          {deal.timeline.map((event, idx) => (
            <View key={idx} style={styles.timelineRow}>
              <View style={styles.timelineDotCol}>
                <View style={[styles.timelineDot, { backgroundColor: idx === 0 ? '#1D9BF0' : colors.textTertiary }]} />
                {deal.timeline && idx < deal.timeline.length - 1 && (
                  <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                )}
              </View>
              <View style={{ flex: 1, paddingBottom: Spacing.sm }}>
                <ThemedText style={[styles.timelineDate, { color: colors.textSecondary }]}>
                  {event.date}
                </ThemedText>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {event.event}
                </ThemedText>
              </View>
            </View>
          ))}
        </SectionCard>
      )}

      {/* Strategic Rationale */}
      {deal.rationale && (
        <SectionCard title="Strategic Rationale" colors={colors}>
          <ThemedText style={[styles.bodyText, { color: colors.text }]}>
            {deal.rationale}
          </ThemedText>
        </SectionCard>
      )}
    </View>
  );
}

// =============================================================================
// PIPELINE TAB
// =============================================================================

function PipelineTab({ deal, colors }: { deal: DealWorkspace; colors: typeof Colors.light }) {
  const stages = ['exploring', 'diligence', 'offer', 'closed'];
  const currentIdx = stages.indexOf(deal.status);

  const milestones = deal.timeline ?? [];

  const gates = [
    { id: 'g1', label: 'Initial Contact', status: currentIdx >= 0 ? 'passed' : 'upcoming' },
    { id: 'g2', label: 'Exploratory Meeting', status: currentIdx >= 0 ? 'passed' : 'upcoming' },
    { id: 'g3', label: 'Information Request', status: currentIdx >= 1 ? 'passed' : currentIdx === 0 ? 'active' : 'upcoming' },
    { id: 'g4', label: 'Diligence Complete', status: currentIdx >= 2 ? 'passed' : currentIdx === 1 ? 'active' : 'upcoming' },
    { id: 'g5', label: 'Term Sheet / LOI', status: currentIdx >= 2 ? 'active' : 'upcoming' },
    { id: 'g6', label: 'Board Approval', status: currentIdx >= 3 ? 'passed' : 'upcoming' },
    { id: 'g7', label: 'Close', status: currentIdx >= 3 ? 'passed' : 'upcoming' },
  ];

  return (
    <View>
      {/* Stage Progression */}
      <SectionCard title="Stage Progression" colors={colors}>
        <View style={styles.stageProgressionRow}>
          {stages.map((stage, idx) => {
            const isCurrent = stage === deal.status;
            const isPast = idx < currentIdx;
            const stageColor = isCurrent
              ? DEAL_STATUS_COLORS[stage] ?? '#A1A1AA'
              : isPast ? '#22C55E' : colors.textTertiary;

            return (
              <View key={stage} style={styles.stageItem}>
                <View
                  style={[
                    styles.stageDot,
                    {
                      backgroundColor: isCurrent || isPast ? stageColor : 'transparent',
                      borderColor: stageColor,
                    },
                  ]}
                >
                  {isPast && (
                    <ThemedText style={{ fontSize: 10, color: '#FFFFFF' }}>{'\u2713'}</ThemedText>
                  )}
                </View>
                <ThemedText
                  style={[
                    styles.stageLabel,
                    { color: isCurrent ? stageColor : colors.textSecondary },
                  ]}
                >
                  {DEAL_STATUS_LABELS[stage] ?? stage}
                </ThemedText>
                {idx < stages.length - 1 && (
                  <View style={[styles.stageConnector, { backgroundColor: isPast ? '#22C55E' : colors.border }]} />
                )}
              </View>
            );
          })}
        </View>
      </SectionCard>

      {/* Key Milestones */}
      <SectionCard title="Key Milestones" colors={colors}>
        {milestones.length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No milestones recorded yet
          </ThemedText>
        ) : (
          milestones.map((ms, idx) => (
            <View key={idx} style={[styles.listRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.milestoneDot, { backgroundColor: idx <= currentIdx ? '#22C55E' : colors.textTertiary }]} />
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {ms.event}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  {ms.date}
                </ThemedText>
              </View>
            </View>
          ))
        )}
      </SectionCard>

      {/* Decision Gates */}
      <SectionCard title="Decision Gates" colors={colors}>
        {gates.map((gate) => (
          <View key={gate.id} style={[styles.listRow, { borderBottomColor: colors.border }]}>
            <View
              style={[
                styles.gateDot,
                { backgroundColor: PIPELINE_GATE_COLORS[gate.status] ?? '#A1A1AA' },
              ]}
            />
            <ThemedText
              style={[
                styles.listRowTitle,
                { color: gate.status === 'passed' ? colors.text : gate.status === 'active' ? '#F59E0B' : colors.textTertiary },
              ]}
            >
              {gate.label}
            </ThemedText>
            <ThemedText
              style={[
                styles.statusLabel,
                { color: PIPELINE_GATE_COLORS[gate.status] ?? '#A1A1AA' },
              ]}
            >
              {gate.status.toUpperCase()}
            </ThemedText>
          </View>
        ))}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// DILIGENCE TAB
// =============================================================================

function DiligenceTab({
  diligenceData,
  colors,
}: {
  diligenceData: DiligenceCategory[];
  colors: typeof Colors.light;
}) {
  return (
    <View>
      {diligenceData.map((category) => {
        const complete = category.items.filter((i) => i.status === 'complete').length;
        const total = category.items.length;

        return (
          <SectionCard key={category.id} title={`${category.category} (${complete}/${total})`} colors={colors}>
            {category.items.map((item) => (
              <View key={item.id} style={[styles.listRow, { borderBottomColor: colors.border }]}>
                <View
                  style={[
                    styles.diligenceStatusBadge,
                    { backgroundColor: (DILIGENCE_STATUS_COLORS[item.status] ?? '#A1A1AA') + '22' },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.diligenceStatusText,
                      { color: DILIGENCE_STATUS_COLORS[item.status] ?? '#A1A1AA' },
                    ]}
                  >
                    {item.status === 'in_progress' ? 'IN PROG' : item.status.toUpperCase()}
                  </ThemedText>
                </View>
                <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                  <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                    {item.title}
                  </ThemedText>
                  <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                    {item.assignee} | {item.notes}
                  </ThemedText>
                </View>
              </View>
            ))}
          </SectionCard>
        );
      })}
    </View>
  );
}

// =============================================================================
// FINANCIAL MODEL TAB
// =============================================================================

function FinancialModelTab({ deal, colors }: { deal: DealWorkspace; colors: typeof Colors.light }) {
  return (
    <View>
      {/* Valuation Summary */}
      {deal.valuationSummary && (
        <SectionCard title="Valuation Summary" colors={colors}>
          <ThemedText style={[styles.bodyText, { color: colors.text }]}>
            {deal.valuationSummary}
          </ThemedText>
        </SectionCard>
      )}

      {/* Revenue Projections */}
      {deal.revenueProjections && deal.revenueProjections.length > 0 && (
        <SectionCard title="Revenue Projections" colors={colors}>
          {/* Table header */}
          <View style={[styles.finTableHeader, { borderBottomColor: colors.border }]}>
            <ThemedText style={[styles.finTableHeaderCell, styles.yearCol, { color: colors.textTertiary }]}>
              Year
            </ThemedText>
            <ThemedText style={[styles.finTableHeaderCell, styles.finCol, { color: colors.textTertiary }]}>
              Base
            </ThemedText>
            <ThemedText style={[styles.finTableHeaderCell, styles.finCol, { color: colors.textTertiary }]}>
              Downside
            </ThemedText>
            <ThemedText style={[styles.finTableHeaderCell, styles.finCol, { color: colors.textTertiary }]}>
              Upside
            </ThemedText>
          </View>
          {deal.revenueProjections.map((row) => (
            <View key={row.year} style={[styles.finTableRow, { borderBottomColor: colors.border }]}>
              <ThemedText style={[styles.finTableCell, styles.yearCol, { color: colors.text, fontWeight: '600' }]}>
                {row.year}
              </ThemedText>
              <ThemedText style={[styles.finTableCell, styles.finCol, { color: '#22C55E' }]}>
                {row.base}
              </ThemedText>
              <ThemedText style={[styles.finTableCell, styles.finCol, { color: '#EF4444' }]}>
                {row.downside}
              </ThemedText>
              <ThemedText style={[styles.finTableCell, styles.finCol, { color: '#1D9BF0' }]}>
                {row.upside}
              </ThemedText>
            </View>
          ))}
        </SectionCard>
      )}

      {/* Cost Structure */}
      {deal.costStructure && deal.costStructure.length > 0 && (
        <SectionCard title="Cost Structure" colors={colors}>
          {deal.costStructure.map((item) => (
            <View key={item.category} style={[styles.listRow, { borderBottomColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {item.category}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  {item.amount}
                </ThemedText>
              </View>
              <View style={styles.costPctWrap}>
                <View style={[styles.costPctBarBg, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.costPctBarFill,
                      { width: `${item.pct}%`, backgroundColor: '#1D9BF0' },
                    ]}
                  />
                </View>
                <ThemedText style={[styles.costPctText, { color: colors.textTertiary }]}>
                  {item.pct}%
                </ThemedText>
              </View>
            </View>
          ))}
        </SectionCard>
      )}

      {/* Return Scenarios */}
      <SectionCard title="Return Scenarios" colors={colors}>
        <View style={styles.scenarioGrid}>
          <ScenarioCard label="Base" color="#22C55E" colors={colors}>
            <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
              {deal.revenueProjections && deal.revenueProjections.length > 0
                ? `Revenue reaches ${deal.revenueProjections[deal.revenueProjections.length - 1].base} by ${deal.revenueProjections[deal.revenueProjections.length - 1].year}. Steady operational improvement with KaNeXT platform integration.`
                : 'Moderate growth trajectory with steady platform adoption and operational efficiency gains.'
              }
            </ThemedText>
          </ScenarioCard>
          <ScenarioCard label="Downside" color="#EF4444" colors={colors}>
            <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
              {deal.revenueProjections && deal.revenueProjections.length > 0
                ? `Revenue limited to ${deal.revenueProjections[deal.revenueProjections.length - 1].downside}. Slower adoption, regulatory delays, or competitive headwinds.`
                : 'Below-target performance due to adoption friction or external market conditions.'
              }
            </ThemedText>
          </ScenarioCard>
          <ScenarioCard label="Upside" color="#1D9BF0" colors={colors}>
            <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
              {deal.revenueProjections && deal.revenueProjections.length > 0
                ? `Revenue hits ${deal.revenueProjections[deal.revenueProjections.length - 1].upside}. Strong platform adoption, media partnerships, and talent pipeline activation.`
                : 'Accelerated growth through viral adoption, strategic partnerships, and market expansion.'
              }
            </ThemedText>
          </ScenarioCard>
        </View>
      </SectionCard>
    </View>
  );
}

// =============================================================================
// RISKS TAB
// =============================================================================

function RisksTab({
  dealRisks,
  colors,
}: {
  dealRisks: { id: string; title: string; severity: string; mitigation: string; owner: string }[];
  colors: typeof Colors.light;
}) {
  if (dealRisks.length === 0) {
    return (
      <View>
        <SectionCard title="Risk Items" colors={colors}>
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No deal-specific risks identified yet. Risk assessment begins during diligence phase.
          </ThemedText>
        </SectionCard>

        <SectionCard title="Company-Level Risks" colors={colors}>
          {RISK_ITEMS.slice(0, 3).map((risk) => (
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
      </View>
    );
  }

  return (
    <View>
      <SectionCard title="Risk Items" colors={colors}>
        {dealRisks.map((risk) => (
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
                Mitigation: {risk.mitigation}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textTertiary }]}>
                Owner: {risk.owner}
              </ThemedText>
            </View>
          </View>
        ))}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// OFFER / TERMS TAB
// =============================================================================

function OfferTermsTab({ deal, colors }: { deal: DealWorkspace; colors: typeof Colors.light }) {
  const isSliema = deal.id === 'deal-2';

  return (
    <View>
      <SectionCard title="Term Sheet Summary" colors={colors}>
        {isSliema ? (
          <View>
            <ThemedText style={[styles.bodyText, { color: colors.text }]}>
              No formal term sheet issued yet. Currently in exploration phase. Estimated parameters below are preliminary and subject to diligence findings.
            </ThemedText>
            <View style={[styles.termRow, { borderBottomColor: colors.border }]}>
              <ThemedText style={[styles.termLabel, { color: colors.textSecondary }]}>Structure</ThemedText>
              <ThemedText style={[styles.termValue, { color: colors.text }]}>100% equity acquisition</ThemedText>
            </View>
            <View style={[styles.termRow, { borderBottomColor: colors.border }]}>
              <ThemedText style={[styles.termLabel, { color: colors.textSecondary }]}>Est. Valuation</ThemedText>
              <ThemedText style={[styles.termValue, { color: colors.text }]}>EUR 2M-5M</ThemedText>
            </View>
            <View style={[styles.termRow, { borderBottomColor: colors.border }]}>
              <ThemedText style={[styles.termLabel, { color: colors.textSecondary }]}>Payment</ThemedText>
              <ThemedText style={[styles.termValue, { color: colors.text }]}>Cash + earnout structure (TBD)</ThemedText>
            </View>
            <View style={[styles.termRow, { borderBottomColor: colors.border }]}>
              <ThemedText style={[styles.termLabel, { color: colors.textSecondary }]}>Conditions</ThemedText>
              <ThemedText style={[styles.termValue, { color: colors.text }]}>MFA approval, due diligence, regulatory clearance</ThemedText>
            </View>
          </View>
        ) : (
          <View>
            <View style={[styles.termRow, { borderBottomColor: colors.border }]}>
              <ThemedText style={[styles.termLabel, { color: colors.textSecondary }]}>Structure</ThemedText>
              <ThemedText style={[styles.termValue, { color: colors.text }]}>SAFE + Board Seat (5 tranches)</ThemedText>
            </View>
            <View style={[styles.termRow, { borderBottomColor: colors.border }]}>
              <ThemedText style={[styles.termLabel, { color: colors.textSecondary }]}>Total Commitment</ThemedText>
              <ThemedText style={[styles.termValue, { color: colors.text }]}>$500K</ThemedText>
            </View>
            <View style={[styles.termRow, { borderBottomColor: colors.border }]}>
              <ThemedText style={[styles.termLabel, { color: colors.textSecondary }]}>Equity</ThemedText>
              <ThemedText style={[styles.termValue, { color: colors.text }]}>Up to 10% at full funding</ThemedText>
            </View>
            <View style={[styles.termRow, { borderBottomColor: colors.border }]}>
              <ThemedText style={[styles.termLabel, { color: colors.textSecondary }]}>Board Seat</ThemedText>
              <ThemedText style={[styles.termValue, { color: colors.text }]}>Activates at tranche threshold</ThemedText>
            </View>
            <View style={[styles.termRow, { borderBottomColor: colors.border }]}>
              <ThemedText style={[styles.termLabel, { color: colors.textSecondary }]}>Distribution</ThemedText>
              <ThemedText style={[styles.termValue, { color: colors.text }]}>Valuetainment channel + events co-branding</ThemedText>
            </View>
          </View>
        )}
      </SectionCard>

      <SectionCard title="Key Conditions" colors={colors}>
        {isSliema ? (
          <View>
            <BulletItem text="Satisfactory completion of financial, legal, operational, and regulatory due diligence" colors={colors} />
            <BulletItem text="League Association ownership approval (fit and proper person test)" colors={colors} />
            <BulletItem text="UEFA club licensing compliance confirmation" colors={colors} />
            <BulletItem text="Confirmation of stadium lease transferability" colors={colors} />
            <BulletItem text="KaNeXT board approval of final acquisition terms" colors={colors} />
          </View>
        ) : (
          <View>
            <BulletItem text="Standard accredited investor verification" colors={colors} />
            <BulletItem text="Tranche funding on agreed schedule (Mar-Nov 2026)" colors={colors} />
            <BulletItem text="Valuetainment distribution commitment for co-branded events" colors={colors} />
            <BulletItem text="Board seat activation contingent on tranche threshold" colors={colors} />
          </View>
        )}
      </SectionCard>

      <SectionCard title="Comparables" colors={colors}>
        {isSliema ? (
          <View>
            <BulletItem text="Wrexham AFC (acquired by Reynolds/McElhenney, 2020): Comparable lower-league club acquisition with media-driven growth thesis" colors={colors} />
            <BulletItem text="Venezia FC (acquired by Duncan Niederauer, 2020): European club with US ownership and tech-forward operations" colors={colors} />
            <BulletItem text="Maltese clubs avg. acquisition range: EUR 1M-5M depending on league position and infrastructure" colors={colors} />
          </View>
        ) : (
          <View>
            <BulletItem text="Standard pre-seed SAFE terms for strategic co-founder relationships" colors={colors} />
            <BulletItem text="Tranche structure comparable to milestone-based funding in media-tech partnerships" colors={colors} />
            <BulletItem text="Distribution partnership value: estimated 5-10x the capital commitment in audience reach" colors={colors} />
          </View>
        )}
      </SectionCard>

      <SectionCard title="Negotiation Notes" colors={colors}>
        <ThemedText style={[styles.bodyText, { color: colors.text }]}>
          {isSliema
            ? 'Early-stage exploration. No formal negotiations commenced. Club president receptive to conversation. Key focus areas: valuation methodology, management transition plan, and KaNeXT platform integration timeline. Next step: request financial package and schedule site visit.'
            : 'Terms substantially agreed. SAFE structure finalized and board-approved Feb 14, 2026. Remaining items: final legal review of SAFE document, wire instructions for Tranche 1, and distribution rights agreement scope. Target: Tranche 1 wire by Mar 1, 2026.'
          }
        </ThemedText>
      </SectionCard>
    </View>
  );
}

// =============================================================================
// APPROVALS TAB
// =============================================================================

function ApprovalsTab({
  dealApprovals,
  colors,
}: {
  dealApprovals: ApprovalItem[];
  colors: typeof Colors.light;
}) {
  return (
    <View>
      <SectionCard title="Approval Queue" colors={colors}>
        {dealApprovals.length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No approvals recorded for this deal workspace
          </ThemedText>
        ) : (
          dealApprovals.map((approval) => (
            <View key={approval.id} style={[styles.approvalItem, { borderBottomColor: colors.border }]}>
              <View style={styles.approvalHeaderRow}>
                <View
                  style={[
                    styles.approvalStatusBadge,
                    { backgroundColor: (APPROVAL_STATUS_COLORS[approval.status] ?? '#A1A1AA') + '22' },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.approvalStatusText,
                      { color: APPROVAL_STATUS_COLORS[approval.status] ?? '#A1A1AA' },
                    ]}
                  >
                    {approval.status === 'in_review' ? 'IN REVIEW' : approval.status.toUpperCase()}
                  </ThemedText>
                </View>
                <ThemedText style={[styles.approvalDate, { color: colors.textTertiary }]}>
                  {approval.date}
                </ThemedText>
              </View>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {approval.title}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                Approver: {approval.approver} | {approval.notes}
              </ThemedText>
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard title="Required Approvers" colors={colors}>
        <View style={[styles.listRow, { borderBottomColor: colors.border }]}>
          <View style={[styles.contactAvatar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[styles.contactInitial, { color: colors.textSecondary }]}>S</ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>Alex Morgan</ThemedText>
            <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>Founder / CEO -- All decisions</ThemedText>
          </View>
        </View>
        <View style={[styles.listRow, { borderBottomColor: colors.border }]}>
          <View style={[styles.contactAvatar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[styles.contactInitial, { color: colors.textSecondary }]}>B</ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>Board (when active)</ThemedText>
            <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>Major capital decisions, equity issuance, strategic partnerships</ThemedText>
          </View>
        </View>
        <View style={[styles.listRow, { borderBottomColor: colors.border }]}>
          <View style={[styles.contactAvatar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[styles.contactInitial, { color: colors.textSecondary }]}>L</ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>Legal Counsel</ThemedText>
            <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>Legal review sign-off on agreements and regulatory filings</ThemedText>
          </View>
        </View>
      </SectionCard>

      <SectionCard title="Audit Trail" colors={colors}>
        {dealApprovals.map((approval) => (
          <View key={approval.id} style={[styles.listRow, { borderBottomColor: colors.border }]}>
            <IconSymbol
              name={approval.status === 'approved' ? 'checkmark.seal.fill' : approval.status === 'pending' ? 'clock.fill' : 'xmark.seal.fill'}
              size={16}
              color={APPROVAL_STATUS_COLORS[approval.status] ?? '#A1A1AA'}
            />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {approval.title}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {approval.approver} | {approval.date}
              </ThemedText>
            </View>
          </View>
        ))}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// AUDIT LOG TAB
// =============================================================================

function AuditLogTab({
  auditLog,
  colors,
}: {
  auditLog: AuditLogItem[];
  colors: typeof Colors.light;
}) {
  const accessLogs = auditLog.filter((l) => l.type === 'access');
  const actionLogs = auditLog.filter((l) => l.type === 'action');
  const documentLogs = auditLog.filter((l) => l.type === 'document');

  const typeIcon = (type: string) => {
    switch (type) {
      case 'access': return 'eye.fill';
      case 'action': return 'bolt.fill';
      case 'document': return 'doc.fill';
      default: return 'circle.fill';
    }
  };

  const typeColor = (type: string) => {
    switch (type) {
      case 'access': return '#1D9BF0';
      case 'action': return '#F59E0B';
      case 'document': return '#22C55E';
      default: return '#A1A1AA';
    }
  };

  return (
    <View>
      {/* Access Log */}
      <SectionCard title="Access Log" colors={colors}>
        {accessLogs.length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No access entries recorded
          </ThemedText>
        ) : (
          accessLogs.map((entry) => (
            <AuditEntry key={entry.id} entry={entry} typeIcon={typeIcon} typeColor={typeColor} colors={colors} />
          ))
        )}
      </SectionCard>

      {/* Action Log */}
      <SectionCard title="Action Log" colors={colors}>
        {actionLogs.length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No action entries recorded
          </ThemedText>
        ) : (
          actionLogs.map((entry) => (
            <AuditEntry key={entry.id} entry={entry} typeIcon={typeIcon} typeColor={typeColor} colors={colors} />
          ))
        )}
      </SectionCard>

      {/* Document Access Log */}
      <SectionCard title="Document Access Log" colors={colors}>
        {documentLogs.length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No document access entries recorded
          </ThemedText>
        ) : (
          documentLogs.map((entry) => (
            <AuditEntry key={entry.id} entry={entry} typeIcon={typeIcon} typeColor={typeColor} colors={colors} />
          ))
        )}
      </SectionCard>
    </View>
  );
}

function AuditEntry({
  entry,
  typeIcon,
  typeColor,
  colors,
}: {
  entry: AuditLogItem;
  typeIcon: (type: string) => string;
  typeColor: (type: string) => string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={[styles.auditRow, { borderBottomColor: colors.border }]}>
      <IconSymbol name={typeIcon(entry.type) as any} size={14} color={typeColor(entry.type)} />
      <View style={{ flex: 1, marginLeft: Spacing.sm }}>
        <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
          {entry.action}
        </ThemedText>
        <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
          {entry.detail}
        </ThemedText>
        <ThemedText style={[styles.captionText, { color: colors.textTertiary }]}>
          {entry.actor} | {entry.timestamp}
        </ThemedText>
      </View>
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

function ScenarioCard({
  label,
  color,
  colors,
  children,
}: {
  label: string;
  color: string;
  colors: typeof Colors.light;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.scenarioCard, { backgroundColor: colors.card, borderColor: color + '44' }]}>
      <ThemedText style={[styles.scenarioLabel, { color }]}>{label}</ThemedText>
      {children}
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
  dealName: {
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

  // Contact
  contactAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInitial: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Timeline
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineDotCol: {
    width: 20,
    alignItems: 'center',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 2,
  },
  timelineDate: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Stage progression
  stageProgressionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  stageItem: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  stageDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  stageConnector: {
    position: 'absolute',
    top: 11,
    left: '60%',
    right: '-40%',
    height: 2,
    zIndex: -1,
  },

  // Milestones
  milestoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Decision gates
  gateDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // Diligence
  diligenceStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    minWidth: 60,
    alignItems: 'center',
  },
  diligenceStatusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Finance table
  finTableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    marginBottom: Spacing.xs,
  },
  finTableHeaderCell: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  finTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  finTableCell: {
    fontSize: 13,
  },
  yearCol: {
    width: 55,
  },
  finCol: {
    flex: 1,
    textAlign: 'right',
  },

  // Cost structure
  costPctWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 80,
  },
  costPctBarBg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  costPctBarFill: {
    height: 4,
    borderRadius: 2,
  },
  costPctText: {
    fontSize: 10,
    fontWeight: '600',
    width: 28,
    textAlign: 'right',
  },

  // Scenarios
  scenarioGrid: {
    gap: Spacing.sm,
  },
  scenarioCard: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 4,
  },
  scenarioLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Severity
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

  // Term sheet
  termRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  termLabel: {
    fontSize: 12,
    fontWeight: '600',
    width: 110,
  },
  termValue: {
    fontSize: 13,
    flex: 1,
  },

  // Approvals
  approvalItem: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  approvalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  approvalStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  approvalStatusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  approvalDate: {
    fontSize: 11,
  },

  // Audit log
  auditRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
