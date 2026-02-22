/**
 * Edu Compliance V3 — 3-pill ViewBar (Accreditation | Regulatory | Governance)
 * KaNeXT Sports · President perspective
 * Private University · Founded 2020 · Nashville, TN · Regionally Accredited
 */
import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

// =============================================================================
// TYPES & MOCK DATA
// =============================================================================

type ViewId = 'accreditation' | 'regulatory' | 'governance';

const VIEWS: { id: ViewId; label: string }[] = [
  { id: 'accreditation', label: 'Accreditation' },
  { id: 'regulatory', label: 'Regulatory' },
  { id: 'governance', label: 'Governance' },
];

type ComplianceStatus = 'Met' | 'Partially Met' | 'Not Met';

const SACSCOC = {
  status: 'Accredited',
  lastReview: 2022,
  nextReview: 2032,
  yearsRemaining: 6,
};

const STANDARDS: { id: string; name: string; status: ComplianceStatus }[] = [
  { id: 'st1', name: 'Institutional Mission', status: 'Met' },
  { id: 'st2', name: 'Governance & Administration', status: 'Met' },
  { id: 'st3', name: 'Educational Programs', status: 'Met' },
  { id: 'st4', name: 'Faculty Qualifications', status: 'Met' },
  { id: 'st5', name: 'Student Support Services', status: 'Met' },
  { id: 'st6', name: 'Financial Resources', status: 'Met' },
];

const QEP = {
  title: 'Student Success Initiative',
  description: 'Enhancing first-year experience through mentorship, academic support, and career readiness programs to improve retention and graduation rates.',
  completePct: 65,
};

const SELF_STUDY_DOCS = [
  { id: 'ss1', title: 'Institutional Narrative', status: 'Complete', date: 'Sep 2024' },
  { id: 'ss2', title: 'Compliance Certification', status: 'In Progress', date: 'Mar 2025' },
  { id: 'ss3', title: 'QEP Documentation', status: 'In Progress', date: 'Jun 2025' },
];

interface RegulatoryItem {
  id: string;
  regulation: string;
  status: 'Compliant' | 'Current' | 'Under Review';
}

const REGULATORY_ITEMS: RegulatoryItem[] = [
  { id: 'r1', regulation: 'Title IV (Federal Student Aid)', status: 'Compliant' },
  { id: 'r2', regulation: 'FERPA (Student Privacy)', status: 'Compliant' },
  { id: 'r3', regulation: 'Title IX (Gender Equity)', status: 'Compliant' },
  { id: 'r4', regulation: 'Clery Act (Campus Safety)', status: 'Current' },
  { id: 'r5', regulation: 'ADA (Accessibility)', status: 'Compliant' },
];

const REPORTING_DEADLINES = [
  { id: 'rd1', report: 'IPEDS Fall Enrollment', deadline: 'Oct 15', status: 'Submitted' },
  { id: 'rd2', report: 'IPEDS Financial Data', deadline: 'Apr 15', status: 'Upcoming' },
  { id: 'rd3', report: 'Annual Security Report (Clery)', deadline: 'Oct 1', status: 'Submitted' },
  { id: 'rd4', report: 'Title III Performance Report', deadline: 'Dec 31', status: 'Submitted' },
];

interface BoardMember {
  id: string;
  name: string;
  term: string;
}

const BOARD_MEMBERS: BoardMember[] = [
  { id: 'bm1', name: 'Dr. Harold Richards', term: '2021-2027' },
  { id: 'bm2', name: 'Ms. Sandra Lee', term: '2023-2029' },
  { id: 'bm3', name: 'Mr. Thomas Jackson', term: '2020-2026' },
  { id: 'bm4', name: 'Rev. Gloria Anderson', term: '2022-2028' },
];

const BOARD_MINUTES = [
  { id: 'bmin1', meeting: 'Regular Board Meeting', date: 'Dec 15, 2024' },
  { id: 'bmin2', meeting: 'Special Session — Budget Review', date: 'Nov 3, 2024' },
  { id: 'bmin3', meeting: 'Regular Board Meeting', date: 'Sep 20, 2024' },
];

const GOVERNANCE = {
  boardSize: 12,
  strategicPlanComplete: 70,
  bylawsUpdated: 2021,
};

const COMPLIANCE_STATUS_COLOR: Record<string, string> = {
  Met: '#22C55E',
  'Partially Met': '#F59E0B',
  'Not Met': '#EF4444',
  Compliant: '#22C55E',
  Current: '#22C55E',
  'Under Review': '#F59E0B',
  Complete: '#22C55E',
  'In Progress': '#1D9BF0',
  Submitted: '#22C55E',
  Upcoming: '#F59E0B',
};

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.badge, { backgroundColor: color + '20' }]}>
      <ThemedText style={[s.badgeText, { color }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// VIEW: ACCREDITATION
// =============================================================================

function AccreditationView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* SACSCOC Status */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>SACSCOC STATUS</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.accredHeader}>
          <IconSymbol name="checkmark.seal.fill" size={24} color="#22C55E" />
          <View style={{ flex: 1 }}>
            <ThemedText style={[s.accredTitle, { color: colors.text }]}>Accredited</ThemedText>
            <ThemedText style={[s.accredSub, { color: colors.textSecondary }]}>
              Southern Association of Colleges and Schools Commission on Colleges
            </ThemedText>
          </View>
        </View>
        <View style={[s.accredDetails, { borderTopColor: colors.border }]}>
          <View style={s.detailRow}>
            <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Last Review</ThemedText>
            <ThemedText style={[s.detailValue, { color: colors.text }]}>{SACSCOC.lastReview}</ThemedText>
          </View>
          <View style={s.detailRow}>
            <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Next Review</ThemedText>
            <ThemedText style={[s.detailValue, { color: colors.text }]}>{SACSCOC.nextReview}</ThemedText>
          </View>
          <View style={[s.detailRow, { borderBottomWidth: 0 }]}>
            <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Years Remaining</ThemedText>
            <ThemedText style={[s.detailValue, { color: accentColor }]}>{SACSCOC.yearsRemaining}</ThemedText>
          </View>
        </View>
      </View>

      {/* Standards */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>STANDARDS COMPLIANCE</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {STANDARDS.map((std, idx) => (
          <View
            key={std.id}
            style={[
              s.standardRow,
              { borderBottomColor: colors.border },
              idx === STANDARDS.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <ThemedText style={[s.standardName, { color: colors.text }]}>{std.name}</ThemedText>
            <StatusBadge label={std.status.toUpperCase()} color={COMPLIANCE_STATUS_COLOR[std.status]} />
          </View>
        ))}
      </View>

      {/* QEP */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>QUALITY ENHANCEMENT PLAN</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.qepTitle, { color: colors.text }]}>{QEP.title}</ThemedText>
        <ThemedText style={[s.qepDesc, { color: colors.textSecondary }]}>{QEP.description}</ThemedText>
        <View style={[s.progressContainer, { marginTop: 10 }]}>
          <View style={[s.progressTrack, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
            <View style={[s.progressFill, { width: `${QEP.completePct}%`, backgroundColor: accentColor + '60' }]} />
          </View>
          <ThemedText style={[s.pctLabel, { color: colors.textSecondary }]}>{QEP.completePct}%</ThemedText>
        </View>
      </View>

      {/* Self-Study Documents */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>SELF-STUDY DOCUMENTS</ThemedText>
      {SELF_STUDY_DOCS.map((doc) => (
        <View key={doc.id} style={[s.listRow, { borderBottomColor: colors.border }]}>
          <View style={s.listRowContent}>
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.listRowTitle, { color: colors.text }]}>{doc.title}</ThemedText>
              <ThemedText style={[s.listRowSub, { color: colors.textTertiary }]}>{doc.date}</ThemedText>
            </View>
            <StatusBadge
              label={doc.status.toUpperCase()}
              color={COMPLIANCE_STATUS_COLOR[doc.status]}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// VIEW: REGULATORY
// =============================================================================

function RegulatoryView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Compliance Status */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>REGULATORY COMPLIANCE</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {REGULATORY_ITEMS.map((item, idx) => (
          <View
            key={item.id}
            style={[
              s.standardRow,
              { borderBottomColor: colors.border },
              idx === REGULATORY_ITEMS.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <ThemedText style={[s.standardName, { color: colors.text }]}>{item.regulation}</ThemedText>
            <StatusBadge
              label={item.status.toUpperCase()}
              color={COMPLIANCE_STATUS_COLOR[item.status]}
            />
          </View>
        ))}
      </View>

      {/* Audit Findings */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>AUDIT FINDINGS</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.auditRow}>
          <IconSymbol name="checkmark.circle.fill" size={20} color="#22C55E" />
          <View style={{ flex: 1 }}>
            <ThemedText style={[s.auditTitle, { color: colors.text }]}>0 Findings</ThemedText>
            <ThemedText style={[s.auditSub, { color: colors.textSecondary }]}>
              Last audit: FY2024 — Clean opinion issued
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Reporting Deadlines */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>ANNUAL REPORTING DEADLINES</ThemedText>
      {REPORTING_DEADLINES.map((rd) => (
        <View key={rd.id} style={[s.listRow, { borderBottomColor: colors.border }]}>
          <View style={s.listRowContent}>
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.listRowTitle, { color: colors.text }]}>{rd.report}</ThemedText>
              <ThemedText style={[s.listRowSub, { color: colors.textTertiary }]}>Deadline: {rd.deadline}</ThemedText>
            </View>
            <StatusBadge
              label={rd.status.toUpperCase()}
              color={COMPLIANCE_STATUS_COLOR[rd.status]}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// VIEW: GOVERNANCE
// =============================================================================

function GovernanceView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Board of Trustees */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>
        BOARD OF TRUSTEES ({GOVERNANCE.boardSize} MEMBERS)
      </ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {BOARD_MEMBERS.map((member, idx) => (
          <View
            key={member.id}
            style={[
              s.boardRow,
              { borderBottomColor: colors.border },
              idx === BOARD_MEMBERS.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <IconSymbol name="person.fill" size={14} color={colors.textTertiary} />
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.boardName, { color: colors.text }]}>{member.name}</ThemedText>
              <ThemedText style={[s.boardTerm, { color: colors.textSecondary }]}>Term: {member.term}</ThemedText>
            </View>
          </View>
        ))}
        <ThemedText style={[s.moreText, { color: colors.textTertiary }]}>
          + {GOVERNANCE.boardSize - BOARD_MEMBERS.length} additional members
        </ThemedText>
      </View>

      {/* Board Minutes */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>RECENT BOARD MINUTES</ThemedText>
      {BOARD_MINUTES.map((m) => (
        <Pressable
          key={m.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => Haptics.selectionAsync()}
        >
          <View style={s.minuteRow}>
            <IconSymbol name="doc.text.fill" size={16} color={accentColor} />
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.minuteTitle, { color: colors.text }]}>{m.meeting}</ThemedText>
              <ThemedText style={[s.minuteDate, { color: colors.textSecondary }]}>{m.date}</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
          </View>
        </Pressable>
      ))}

      {/* Faculty Senate */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>FACULTY SENATE</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.detailRow}>
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Last Meeting</ThemedText>
          <ThemedText style={[s.detailValue, { color: colors.text }]}>Jan 28, 2025</ThemedText>
        </View>
        <View style={[s.detailRow, { borderBottomWidth: 0 }]}>
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Active Resolutions</ThemedText>
          <ThemedText style={[s.detailValue, { color: colors.text }]}>3</ThemedText>
        </View>
      </View>

      {/* Strategic Plan */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>STRATEGIC PLAN</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.qepTitle, { color: colors.text }]}>KaNeXT 2030: Elevating Excellence</ThemedText>
        <View style={[s.progressContainer, { marginTop: 10 }]}>
          <View style={[s.progressTrack, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
            <View
              style={[
                s.progressFill,
                { width: `${GOVERNANCE.strategicPlanComplete}%`, backgroundColor: accentColor + '60' },
              ]}
            />
          </View>
          <ThemedText style={[s.pctLabel, { color: colors.textSecondary }]}>{GOVERNANCE.strategicPlanComplete}%</ThemedText>
        </View>
      </View>

      {/* Bylaws */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>BYLAWS</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.detailRow}>
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Last Updated</ThemedText>
          <ThemedText style={[s.detailValue, { color: colors.text }]}>{GOVERNANCE.bylawsUpdated}</ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function EduCompliance({ colors, accentColor, role }: Props) {
  const [activeView, setActiveView] = useState<ViewId>('accreditation');

  const handlePillPress = useCallback((id: ViewId) => {
    Haptics.selectionAsync();
    setActiveView(id);
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'accreditation':
        return <AccreditationView colors={colors} accentColor={accentColor} />;
      case 'regulatory':
        return <RegulatoryView colors={colors} accentColor={accentColor} />;
      case 'governance':
        return <GovernanceView colors={colors} accentColor={accentColor} />;
    }
  };

  return (
    <View style={s.container}>
      {/* ViewBar */}
      <View style={s.viewBar}>
        {VIEWS.map((v) => {
          const isActive = v.id === activeView;
          return (
            <Pressable
              key={v.id}
              style={[
                s.pill,
                { backgroundColor: isActive ? accentColor : '#2F3336' },
              ]}
              onPress={() => handlePillPress(v.id)}
            >
              <ThemedText
                style={[
                  s.pillText,
                  { color: isActive ? '#000' : colors.textSecondary },
                ]}
              >
                {v.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Content */}
      {renderContent()}
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

  // -- ViewBar --
  viewBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Scroll --
  scroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  // -- Section Header --
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },

  // -- Card --
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },

  // -- Accreditation header --
  accredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accredTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  accredSub: {
    fontSize: 11,
    marginTop: 2,
  },
  accredDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },

  // -- Detail rows --
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2F3336',
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Standards --
  standardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  standardName: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },

  // -- QEP --
  qepTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  qepDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },

  // -- Progress --
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  pctLabel: {
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    width: 32,
    textAlign: 'right',
  },

  // -- List rows --
  listRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  listRowTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  listRowSub: {
    fontSize: 11,
    marginTop: 2,
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

  // -- Audit --
  auditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  auditTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  auditSub: {
    fontSize: 12,
    marginTop: 2,
  },

  // -- Board --
  boardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  boardName: {
    fontSize: 14,
    fontWeight: '600',
  },
  boardTerm: {
    fontSize: 11,
    marginTop: 2,
  },
  moreText: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },

  // -- Minutes --
  minuteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  minuteTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  minuteDate: {
    fontSize: 12,
    marginTop: 2,
  },
});
