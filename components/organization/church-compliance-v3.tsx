/**
 * Church Compliance V3 — 2819 Church · Senior Pastor
 * ViewBar: Governance | Legal | Safety
 * Self-contained with inline mock data.
 */
import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';

// =============================================================================
// TYPES
// =============================================================================


const ACCENT = MODE_ACCENT.church;
type ViewId = 'governance' | 'legal' | 'safety';

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
}

// =============================================================================
// VIEWS
// =============================================================================

const VIEWS: { id: ViewId; label: string }[] = [
  { id: 'governance', label: 'Governance' },
  { id: 'legal', label: 'Legal' },
  { id: 'safety', label: 'Safety' },
];

// =============================================================================
// MOCK DATA
// =============================================================================

interface BoardMinutes {
  id: string;
  title: string;
  date: string;
  attendees: number;
  status: 'Approved' | 'Draft';
}

const BOARD_MINUTES: BoardMinutes[] = [
  { id: 'bm1', title: 'Q4 2024 Board Meeting', date: 'Dec 15, 2024', attendees: 7, status: 'Approved' },
  { id: 'bm2', title: 'Q3 2024 Board Meeting', date: 'Sep 22, 2024', attendees: 8, status: 'Approved' },
  { id: 'bm3', title: 'Q2 2024 Board Meeting', date: 'Jun 18, 2024', attendees: 6, status: 'Approved' },
  { id: 'bm4', title: 'Q1 2024 Board Meeting', date: 'Mar 20, 2024', attendees: 7, status: 'Approved' },
];

interface LeadershipTerm {
  id: string;
  name: string;
  position: string;
  termStart: string;
  termEnd: string;
  renewable: boolean;
}

const LEADERSHIP_TERMS: LeadershipTerm[] = [
  { id: 'lt1', name: 'Deacon Robert Davis', position: 'Deacon Board Chair', termStart: 'Jan 2023', termEnd: 'Dec 2025', renewable: true },
  { id: 'lt2', name: 'Elder Mary Thompson', position: 'Elder', termStart: 'Jun 2022', termEnd: 'Jun 2025', renewable: true },
  { id: 'lt3', name: 'Bro. Michael Scott', position: 'Catalyst Leader', termStart: 'Sep 2024', termEnd: 'Aug 2026', renewable: false },
];

interface ChecklistItem {
  id: string;
  item: string;
  completed: boolean;
}

const DENOMINATIONAL_CHECKLIST: ChecklistItem[] = [
  { id: 'dc1', item: 'Annual financial audit completed', completed: true },
  { id: 'dc2', item: 'Background checks for all youth workers', completed: true },
  { id: 'dc3', item: 'Bylaws reviewed within 2 years', completed: true },
  { id: 'dc4', item: 'Annual business meeting held', completed: false },
  { id: 'dc5', item: 'Ministry reports submitted', completed: true },
];

interface InsurancePolicy {
  id: string;
  type: string;
  provider: string;
  coverage: string;
  expiration: string;
  status: 'Active' | 'Expiring Soon';
}

const INSURANCE_POLICIES: InsurancePolicy[] = [
  { id: 'ip1', type: 'General Liability', provider: 'Brotherhood Mutual', coverage: '$2,000,000', expiration: 'Sep 30, 2025', status: 'Active' },
  { id: 'ip2', type: 'Property Insurance', provider: 'Brotherhood Mutual', coverage: '$1,500,000', expiration: 'Sep 30, 2025', status: 'Active' },
  { id: 'ip3', type: 'Workers Compensation', provider: 'State Fund', coverage: 'Statutory', expiration: 'Mar 31, 2025', status: 'Expiring Soon' },
];

interface EmploymentAgreement {
  id: string;
  name: string;
  position: string;
  startDate: string;
  status: 'Active';
}

const EMPLOYMENT_AGREEMENTS: EmploymentAgreement[] = [
  { id: 'ea1', name: 'Pastor Philip Anthony Mitchell', position: 'Senior Pastor', startDate: 'Jan 2015', status: 'Active' },
  { id: 'ea2', name: 'Pastor Ryan Mitchell', position: 'Youth Pastor', startDate: 'Aug 2020', status: 'Active' },
];

interface BackgroundCheck {
  id: string;
  name: string;
  role: string;
  status: 'Cleared' | 'Pending' | 'Expired';
  lastChecked: string;
}

const BACKGROUND_CHECKS: BackgroundCheck[] = [
  { id: 'bg1', name: 'Pastor Ryan Mitchell', role: 'Youth Pastor', status: 'Cleared', lastChecked: 'Oct 2024' },
  { id: 'bg2', name: 'Sister Angela Davis', role: '2819 Kids Director', status: 'Cleared', lastChecked: 'Nov 2024' },
  { id: 'bg3', name: 'Bro. Michael Scott', role: 'Catalyst Leader', status: 'Cleared', lastChecked: 'Sep 2024' },
  { id: 'bg4', name: 'Chioma Eze', role: 'Children\'s Volunteer', status: 'Cleared', lastChecked: 'Oct 2024' },
  { id: 'bg5', name: 'Henry Okafor', role: 'Youth Volunteer', status: 'Cleared', lastChecked: 'Nov 2024' },
  { id: 'bg6', name: 'Esther Nwankwo', role: 'Connect Group Leader', status: 'Cleared', lastChecked: 'Aug 2024' },
  { id: 'bg7', name: 'Nnamdi Ugochukwu', role: 'Youth Mentor', status: 'Cleared', lastChecked: 'Oct 2024' },
  { id: 'bg8', name: 'Grace Amponsah', role: 'Children\'s Helper', status: 'Cleared', lastChecked: 'Nov 2024' },
  { id: 'bg9', name: 'Francis Adjei', role: 'Youth Volunteer', status: 'Cleared', lastChecked: 'Sep 2024' },
  { id: 'bg10', name: 'Kezia Boateng', role: 'Children\'s Volunteer', status: 'Cleared', lastChecked: 'Oct 2024' },
  { id: 'bg11', name: 'Joseph Davis', role: 'Media/Youth', status: 'Cleared', lastChecked: 'Nov 2024' },
  { id: 'bg12', name: 'Adebayo Oluwaseun', role: 'Youth Volunteer', status: 'Cleared', lastChecked: 'Oct 2024' },
];

interface SecurityMember {
  id: string;
  name: string;
  role: string;
}

const SECURITY_TEAM: SecurityMember[] = [
  { id: 'st1', name: 'Deacon Robert Davis', role: 'Security Lead' },
  { id: 'st2', name: 'Henry Okafor', role: 'Entrance Monitor' },
  { id: 'st3', name: 'Nnamdi Ugochukwu', role: 'Parking Lot' },
  { id: 'st4', name: 'Francis Adjei', role: 'Interior Patrol' },
  { id: 'st5', name: 'Daniel Kwame', role: 'Camera Monitor' },
  { id: 'st6', name: 'Adebayo Oluwaseun', role: 'Emergency Response' },
];

// =============================================================================
// HELPERS
// =============================================================================

const STATUS_COLORS: Record<string, string> = {
  Active: '#22C55E',
  Approved: '#22C55E',
  Draft: '#F59E0B',
  Cleared: '#22C55E',
  Pending: '#F59E0B',
  Expired: '#EF4444',
  'Expiring Soon': '#F59E0B',
  Updated: '#22C55E',
};

// =============================================================================
// VIEW BAR
// =============================================================================

function ViewBar({
  views,
  activeId,
  onSelect,
  accentColor,
  colors,
}: {
  views: typeof VIEWS;
  activeId: ViewId;
  onSelect: (id: ViewId) => void;
  accentColor: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={s.viewBar}>
      {views.map((v) => {
        const isActive = v.id === activeId;
        return (
          <Pressable
            key={v.id}
            style={[
              s.viewPill,
              {
                backgroundColor: isActive ? accentColor : '#2F3336',
              },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              onSelect(v.id);
            }}
          >
            <ThemedText
              style={[
                s.viewPillText,
                { color: isActive ? '#000' : colors.textSecondary },
              ]}
            >
              {v.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

// =============================================================================
// GOVERNANCE VIEW
// =============================================================================

function GovernanceView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const completedCount = DENOMINATIONAL_CHECKLIST.filter((c) => c.completed).length;
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Bylaws */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>BYLAWS</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.bylawsRow}>
          <IconSymbol name="doc.text.fill" size={20} color={accentColor} />
          <View style={{ flex: 1 }}>
            <ThemedText style={[s.bylawsTitle, { color: colors.text }]}>2819 Church Bylaws & Constitution</ThemedText>
            <ThemedText style={[s.bylawsDate, { color: colors.textSecondary }]}>Last updated: 2023</ThemedText>
          </View>
          <View style={[s.statusBadge, { backgroundColor: '#22C55E20' }]}>
            <ThemedText style={[s.statusBadgeText, { color: '#22C55E' }]}>Current</ThemedText>
          </View>
        </View>
      </View>

      {/* Board Meetings */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>BOARD MEETING MINUTES</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {BOARD_MINUTES.map((minutes, idx) => (
          <View
            key={minutes.id}
            style={[
              s.listRow,
              idx < BOARD_MINUTES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.listTitle, { color: colors.text }]}>{minutes.title}</ThemedText>
              <ThemedText style={[s.listSubtitle, { color: colors.textSecondary }]}>
                {minutes.date} · {minutes.attendees} attendees
              </ThemedText>
            </View>
            <View style={[s.statusBadge, { backgroundColor: STATUS_COLORS[minutes.status] + '20' }]}>
              <ThemedText style={[s.statusBadgeText, { color: STATUS_COLORS[minutes.status] }]}>{minutes.status}</ThemedText>
            </View>
          </View>
        ))}
      </View>

      {/* Requirements Checklist */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>REQUIREMENTS CHECKLIST</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.checklistSummary, { color: colors.textSecondary }]}>
          {completedCount}/{DENOMINATIONAL_CHECKLIST.length} completed
        </ThemedText>
        {DENOMINATIONAL_CHECKLIST.map((item, idx) => (
          <View
            key={item.id}
            style={[
              s.checkRow,
              idx < DENOMINATIONAL_CHECKLIST.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <IconSymbol
              name={item.completed ? 'checkmark.circle.fill' : 'circle.fill'}
              size={18}
              color={item.completed ? '#22C55E' : colors.textTertiary}
            />
            <ThemedText style={[s.checkLabel, { color: item.completed ? colors.text : colors.textSecondary }]}>
              {item.item}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Annual Business Meeting */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>ANNUAL BUSINESS MEETING</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.meetingRow}>
          <IconSymbol name="calendar" size={16} color={accentColor} />
          <ThemedText style={[s.meetingText, { color: colors.text }]}>Next: March 2025</ThemedText>
          <View style={[s.statusBadge, { backgroundColor: '#F59E0B20' }]}>
            <ThemedText style={[s.statusBadgeText, { color: '#F59E0B' }]}>Upcoming</ThemedText>
          </View>
        </View>
      </View>

      {/* Leadership Terms */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>LEADERSHIP TERMS</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {LEADERSHIP_TERMS.map((term, idx) => (
          <View
            key={term.id}
            style={[
              s.listRow,
              idx < LEADERSHIP_TERMS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.listTitle, { color: colors.text }]}>{term.name}</ThemedText>
              <ThemedText style={[s.listSubtitle, { color: colors.textSecondary }]}>
                {term.position} · {term.termStart} - {term.termEnd}
              </ThemedText>
            </View>
            {term.renewable && (
              <View style={[s.statusBadge, { backgroundColor: `${ACCENT}20` }]}>
                <ThemedText style={[s.statusBadgeText, { color: ACCENT }]}>Renewable</ThemedText>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// LEGAL VIEW
// =============================================================================

function LegalView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const allCleared = BACKGROUND_CHECKS.every((bg) => bg.status === 'Cleared');
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* 501(c)(3) Status */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>TAX-EXEMPT STATUS</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.taxRow}>
          <IconSymbol name="building.columns.fill" size={20} color={accentColor} />
          <View style={{ flex: 1 }}>
            <ThemedText style={[s.taxTitle, { color: colors.text }]}>501(c)(3) Status</ThemedText>
            <ThemedText style={[s.taxSubtitle, { color: colors.textSecondary }]}>IRS Form 990 due: May 15, 2025</ThemedText>
          </View>
          <View style={[s.statusBadge, { backgroundColor: '#22C55E20' }]}>
            <ThemedText style={[s.statusBadgeText, { color: '#22C55E' }]}>Active</ThemedText>
          </View>
        </View>
      </View>

      {/* Insurance */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>INSURANCE POLICIES</ThemedText>
      {INSURANCE_POLICIES.map((policy) => (
        <View
          key={policy.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={s.policyHeader}>
            <ThemedText style={[s.policyType, { color: colors.text }]}>{policy.type}</ThemedText>
            <View style={[s.statusBadge, { backgroundColor: STATUS_COLORS[policy.status] + '20' }]}>
              <ThemedText style={[s.statusBadgeText, { color: STATUS_COLORS[policy.status] }]}>{policy.status}</ThemedText>
            </View>
          </View>
          <View style={s.policyDetails}>
            <View style={s.policyDetailItem}>
              <ThemedText style={[s.policyDetailLabel, { color: colors.textTertiary }]}>Provider</ThemedText>
              <ThemedText style={[s.policyDetailValue, { color: colors.textSecondary }]}>{policy.provider}</ThemedText>
            </View>
            <View style={s.policyDetailItem}>
              <ThemedText style={[s.policyDetailLabel, { color: colors.textTertiary }]}>Coverage</ThemedText>
              <ThemedText style={[s.policyDetailValue, { color: colors.textSecondary }]}>{policy.coverage}</ThemedText>
            </View>
            <View style={s.policyDetailItem}>
              <ThemedText style={[s.policyDetailLabel, { color: colors.textTertiary }]}>Expires</ThemedText>
              <ThemedText style={[s.policyDetailValue, { color: policy.status === 'Expiring Soon' ? '#F59E0B' : colors.textSecondary }]}>
                {policy.expiration}
              </ThemedText>
            </View>
          </View>
        </View>
      ))}

      {/* Employment Agreements */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>EMPLOYMENT AGREEMENTS</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {EMPLOYMENT_AGREEMENTS.map((ea, idx) => (
          <View
            key={ea.id}
            style={[
              s.listRow,
              idx < EMPLOYMENT_AGREEMENTS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.listTitle, { color: colors.text }]}>{ea.name}</ThemedText>
              <ThemedText style={[s.listSubtitle, { color: colors.textSecondary }]}>{ea.position} · Since {ea.startDate}</ThemedText>
            </View>
            <View style={[s.statusBadge, { backgroundColor: '#22C55E20' }]}>
              <ThemedText style={[s.statusBadgeText, { color: '#22C55E' }]}>{ea.status}</ThemedText>
            </View>
          </View>
        ))}
      </View>

      {/* Background Checks */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>
        BACKGROUND CHECKS — MINORS VOLUNTEERS
      </ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.bgSummary}>
          <IconSymbol name="shield.checkmark.fill" size={16} color={allCleared ? '#22C55E' : '#F59E0B'} />
          <ThemedText style={[s.bgSummaryText, { color: allCleared ? '#22C55E' : '#F59E0B' }]}>
            {allCleared ? 'All 12 volunteers cleared' : 'Action required'}
          </ThemedText>
        </View>
        {BACKGROUND_CHECKS.map((bg, idx) => (
          <View
            key={bg.id}
            style={[
              s.bgRow,
              idx < BACKGROUND_CHECKS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.bgName, { color: colors.text }]}>{bg.name}</ThemedText>
              <ThemedText style={[s.bgRole, { color: colors.textSecondary }]}>{bg.role} · {bg.lastChecked}</ThemedText>
            </View>
            <View style={[s.statusBadge, { backgroundColor: STATUS_COLORS[bg.status] + '20' }]}>
              <ThemedText style={[s.statusBadgeText, { color: STATUS_COLORS[bg.status] }]}>{bg.status}</ThemedText>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// SAFETY VIEW
// =============================================================================

function SafetyView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Child Protection */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>CHILD PROTECTION POLICY</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.policyStatusRow}>
          <IconSymbol name="shield.checkmark.fill" size={20} color="#22C55E" />
          <View style={{ flex: 1 }}>
            <ThemedText style={[s.policyStatusTitle, { color: colors.text }]}>Child Protection Policy</ThemedText>
            <ThemedText style={[s.policyStatusSub, { color: colors.textSecondary }]}>Board approved · Reviewed annually</ThemedText>
          </View>
          <View style={[s.statusBadge, { backgroundColor: '#22C55E20' }]}>
            <ThemedText style={[s.statusBadgeText, { color: '#22C55E' }]}>Approved</ThemedText>
          </View>
        </View>
      </View>

      {/* Security Team */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>SECURITY TEAM</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {SECURITY_TEAM.map((member, idx) => (
          <View
            key={member.id}
            style={[
              s.listRow,
              idx < SECURITY_TEAM.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <IconSymbol name="shield.fill" size={14} color={accentColor} />
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.listTitle, { color: colors.text }]}>{member.name}</ThemedText>
              <ThemedText style={[s.listSubtitle, { color: colors.textSecondary }]}>{member.role}</ThemedText>
            </View>
          </View>
        ))}
      </View>

      {/* Emergency Plan */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>EMERGENCY PREPAREDNESS</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {[
          { label: 'Emergency Action Plan', value: 'Updated 2024', status: 'Updated', icon: 'doc.text.fill' },
          { label: 'Fire Evacuation Plan', value: 'Posted at all exits', status: 'Active', icon: 'exclamationmark.triangle.fill' },
          { label: 'First Aid Kits', value: '3 locations (Sanctuary, Kitchen, Nursery)', status: 'Stocked', icon: 'heart.fill' },
          { label: 'Incident Reports (2025)', value: '0 incidents', status: 'Clear', icon: 'checkmark.seal.fill' },
        ].map((item, idx) => (
          <View
            key={idx}
            style={[
              s.safetyRow,
              idx < 3 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <IconSymbol name={item.icon as any} size={16} color={accentColor} />
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.safetyLabel, { color: colors.text }]}>{item.label}</ThemedText>
              <ThemedText style={[s.safetyValue, { color: colors.textSecondary }]}>{item.value}</ThemedText>
            </View>
            <View style={[s.statusBadge, { backgroundColor: '#22C55E20' }]}>
              <ThemedText style={[s.statusBadgeText, { color: '#22C55E' }]}>{item.status}</ThemedText>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function ChurchCompliance({ colors, accentColor, role }: Props) {
  const [activeView, setActiveView] = useState<ViewId>('governance');

  const handleViewChange = useCallback((id: ViewId) => {
    setActiveView(id);
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'governance':
        return <GovernanceView colors={colors} accentColor={accentColor} />;
      case 'legal':
        return <LegalView colors={colors} accentColor={accentColor} />;
      case 'safety':
        return <SafetyView colors={colors} accentColor={accentColor} />;
      default:
        return null;
    }
  };

  return (
    <View style={s.container}>
      <ViewBar
        views={VIEWS}
        activeId={activeView}
        onSelect={handleViewChange}
        accentColor={accentColor}
        colors={colors}
      />
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

  // -- View Bar --
  viewBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  viewPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  viewPillText: {
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
    marginTop: Spacing.lg,
    textTransform: 'uppercase',
  },

  // -- Card --
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: Spacing.sm,
  },

  // -- Status Badge --
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // -- List Row --
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  listSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  // -- Bylaws --
  bylawsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bylawsTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  bylawsDate: {
    fontSize: 12,
    marginTop: 2,
  },

  // -- Checklist --
  checklistSummary: {
    fontSize: 12,
    marginBottom: Spacing.sm,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 8,
  },
  checkLabel: {
    fontSize: 13,
    flex: 1,
  },

  // -- Meeting --
  meetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  meetingText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },

  // -- Tax Status --
  taxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  taxTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  taxSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  // -- Policy --
  policyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  policyType: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  policyDetails: {
    gap: 6,
  },
  policyDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  policyDetailLabel: {
    fontSize: 12,
  },
  policyDetailValue: {
    fontSize: 12,
    fontWeight: '500',
  },

  // -- Background Check --
  bgSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  bgSummaryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  bgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: Spacing.sm,
  },
  bgName: {
    fontSize: 13,
    fontWeight: '500',
  },
  bgRole: {
    fontSize: 11,
    marginTop: 1,
  },

  // -- Safety --
  policyStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  policyStatusTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  policyStatusSub: {
    fontSize: 12,
    marginTop: 2,
  },
  safetyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
  },
  safetyLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  safetyValue: {
    fontSize: 11,
    marginTop: 2,
  },
});
