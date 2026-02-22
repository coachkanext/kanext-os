/**
 * Sports Compliance V3 — 3-pill ViewBar (Eligibility | Academics | Immigration)
 * KaNeXT Men's Basketball · NAIA KaNeXT Conference
 * Head Coach / GM perspective. Inline mock data, no DrillMode.
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

type ViewId = 'eligibility' | 'academics' | 'immigration';

const VIEWS: { id: ViewId; label: string }[] = [
  { id: 'eligibility', label: 'Eligibility' },
  { id: 'academics', label: 'Academics' },
  { id: 'immigration', label: 'Immigration' },
];

type EligibilityStatus = 'Cleared' | 'Hold' | 'Pending' | 'Ineligible';

const ELIGIBILITY_STATUS_COLOR: Record<EligibilityStatus, string> = {
  Cleared: '#22C55E',
  Hold: '#F59E0B',
  Pending: '#1D9BF0',
  Ineligible: '#EF4444',
};

interface EligibilityRow {
  id: string;
  name: string;
  team: string;
  status: EligibilityStatus;
  checklist: string[];
  flagged: boolean;
}

const ELIGIBILITY_DATA: EligibilityRow[] = [
  {
    id: 'el1', name: 'Jaylen Thompson', team: 'Varsity', status: 'Cleared',
    checklist: ['Enrollment verified', 'GPA above 2.0', 'Medical clearance', 'Insurance on file'],
    flagged: false,
  },
  {
    id: 'el2', name: 'DeShawn Carter', team: 'Varsity', status: 'Cleared',
    checklist: ['Enrollment verified', 'GPA above 2.0', 'Medical clearance', 'Insurance on file'],
    flagged: false,
  },
  {
    id: 'el3', name: 'Marcus Lane', team: 'Varsity', status: 'Hold',
    checklist: ['Enrollment verified', 'GPA above 2.0', 'Medical clearance pending', 'Insurance on file'],
    flagged: true,
  },
  {
    id: 'el4', name: 'Terrell Davis', team: 'Varsity', status: 'Cleared',
    checklist: ['Enrollment verified', 'GPA above 2.0', 'Medical clearance', 'Insurance on file'],
    flagged: false,
  },
  {
    id: 'el5', name: 'Brandon Ellis', team: 'Dev 1', status: 'Pending',
    checklist: ['Enrollment verified', 'GPA check pending', 'Medical clearance', 'Insurance on file'],
    flagged: false,
  },
  {
    id: 'el6', name: 'Andre Johnson', team: 'Dev 1', status: 'Cleared',
    checklist: ['Enrollment verified', 'GPA above 2.0', 'Medical clearance', 'Insurance on file'],
    flagged: false,
  },
  {
    id: 'el7', name: 'Corey Mitchell', team: 'Dev 2', status: 'Hold',
    checklist: ['Enrollment verified', 'GPA below 2.0 — academic probation', 'Medical clearance', 'Insurance expired'],
    flagged: true,
  },
  {
    id: 'el8', name: 'Damon Wright', team: 'Varsity', status: 'Cleared',
    checklist: ['Enrollment verified', 'GPA above 2.0', 'Medical clearance', 'Insurance on file'],
    flagged: false,
  },
];

type AcademicStanding = 'Good' | 'Probation';

interface AcademicRow {
  id: string;
  name: string;
  team: string;
  gpa: number;
  creditHoursCompleted: number;
  creditHoursEnrolled: number;
  standing: AcademicStanding;
  atRisk: boolean;
}

const ACADEMIC_DATA: AcademicRow[] = [
  { id: 'ac1', name: 'Jaylen Thompson', team: 'Varsity', gpa: 3.4, creditHoursCompleted: 72, creditHoursEnrolled: 15, standing: 'Good', atRisk: false },
  { id: 'ac2', name: 'DeShawn Carter', team: 'Varsity', gpa: 3.1, creditHoursCompleted: 60, creditHoursEnrolled: 15, standing: 'Good', atRisk: false },
  { id: 'ac3', name: 'Marcus Lane', team: 'Varsity', gpa: 2.8, creditHoursCompleted: 45, creditHoursEnrolled: 12, standing: 'Good', atRisk: false },
  { id: 'ac4', name: 'Terrell Davis', team: 'Varsity', gpa: 3.8, creditHoursCompleted: 90, creditHoursEnrolled: 15, standing: 'Good', atRisk: false },
  { id: 'ac5', name: 'Brandon Ellis', team: 'Dev 1', gpa: 2.3, creditHoursCompleted: 30, creditHoursEnrolled: 12, standing: 'Probation', atRisk: true },
  { id: 'ac6', name: 'Andre Johnson', team: 'Dev 1', gpa: 3.2, creditHoursCompleted: 48, creditHoursEnrolled: 15, standing: 'Good', atRisk: false },
  { id: 'ac7', name: 'Corey Mitchell', team: 'Dev 2', gpa: 1.9, creditHoursCompleted: 24, creditHoursEnrolled: 12, standing: 'Probation', atRisk: true },
  { id: 'ac8', name: 'Damon Wright', team: 'Varsity', gpa: 3.0, creditHoursCompleted: 55, creditHoursEnrolled: 15, standing: 'Good', atRisk: false },
];

type VisaStatus = 'Active' | 'Renewal Needed' | 'Expired';

interface ImmigrationRow {
  id: string;
  name: string;
  country: string;
  visaType: 'F-1' | 'J-1';
  visaStatus: VisaStatus;
  eVerifyStatus: 'Verified' | 'Pending';
  expirationDate: string;
  documents: string[];
}

const IMMIGRATION_DATA: ImmigrationRow[] = [
  {
    id: 'im1', name: 'Samuel Okonkwo', country: 'Nigeria',
    visaType: 'F-1', visaStatus: 'Active', eVerifyStatus: 'Verified',
    expirationDate: 'Aug 2026',
    documents: ['I-20 on file', 'Passport valid', 'SEVIS active'],
  },
  {
    id: 'im2', name: 'Pierre Dubois', country: 'France',
    visaType: 'J-1', visaStatus: 'Active', eVerifyStatus: 'Verified',
    expirationDate: 'May 2025',
    documents: ['DS-2019 on file', 'Passport valid', 'SEVIS active'],
  },
  {
    id: 'im3', name: 'Kwame Asante', country: 'Ghana',
    visaType: 'F-1', visaStatus: 'Renewal Needed', eVerifyStatus: 'Pending',
    expirationDate: 'Mar 2025',
    documents: ['I-20 on file', 'Passport expiring', 'SEVIS active'],
  },
  {
    id: 'im4', name: 'Diego Ramirez', country: 'Colombia',
    visaType: 'F-1', visaStatus: 'Active', eVerifyStatus: 'Verified',
    expirationDate: 'Dec 2025',
    documents: ['I-20 on file', 'Passport valid', 'SEVIS active'],
  },
];

const VISA_STATUS_COLOR: Record<VisaStatus, string> = {
  Active: '#22C55E',
  'Renewal Needed': '#F59E0B',
  Expired: '#EF4444',
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
// VIEW: ELIGIBILITY
// =============================================================================

function EligibilityView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>NAIA ELIGIBILITY</ThemedText>
      {ELIGIBILITY_DATA.map((player) => (
        <View
          key={player.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={s.eligHeader}>
            <View style={s.eligInfo}>
              <ThemedText style={[s.eligName, { color: colors.text }]}>{player.name}</ThemedText>
              <ThemedText style={[s.eligTeam, { color: colors.textSecondary }]}>{player.team}</ThemedText>
            </View>
            <StatusBadge
              label={player.status.toUpperCase()}
              color={ELIGIBILITY_STATUS_COLOR[player.status]}
            />
          </View>
          {/* Checklist */}
          <View style={[s.checklist, { borderTopColor: colors.border }]}>
            {player.checklist.map((item, i) => {
              const isIssue = item.toLowerCase().includes('pending') || item.toLowerCase().includes('expired') || item.toLowerCase().includes('below');
              return (
                <View key={`${player.id}-cl-${i}`} style={s.checkItem}>
                  <IconSymbol
                    name={isIssue ? 'exclamationmark.triangle.fill' : 'checkmark.circle.fill'}
                    size={14}
                    color={isIssue ? '#F59E0B' : '#22C55E'}
                  />
                  <ThemedText style={[s.checkText, { color: isIssue ? '#F59E0B' : colors.textSecondary }]}>
                    {item}
                  </ThemedText>
                </View>
              );
            })}
          </View>
          {player.flagged && (
            <View style={[s.flagBanner, { backgroundColor: '#EF444415' }]}>
              <IconSymbol name="exclamationmark.triangle.fill" size={12} color="#EF4444" />
              <ThemedText style={[s.flagText, { color: '#EF4444' }]}>Red flag — requires attention</ThemedText>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// VIEW: ACADEMICS
// =============================================================================

function AcademicsView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>ACADEMIC STANDING</ThemedText>
      {ACADEMIC_DATA.map((student) => (
        <View
          key={student.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={s.acadHeader}>
            <View style={s.acadInfo}>
              <ThemedText style={[s.acadName, { color: colors.text }]}>{student.name}</ThemedText>
              <ThemedText style={[s.acadTeam, { color: colors.textSecondary }]}>{student.team}</ThemedText>
            </View>
            <StatusBadge
              label={student.standing.toUpperCase()}
              color={student.standing === 'Good' ? '#22C55E' : '#EF4444'}
            />
          </View>
          <View style={[s.acadStats, { borderTopColor: colors.border }]}>
            <View style={s.acadStatItem}>
              <ThemedText style={[s.acadStatValue, { color: student.gpa < 2.0 ? '#EF4444' : colors.text }]}>
                {student.gpa.toFixed(1)}
              </ThemedText>
              <ThemedText style={[s.acadStatLabel, { color: colors.textSecondary }]}>GPA</ThemedText>
            </View>
            <View style={s.acadStatItem}>
              <ThemedText style={[s.acadStatValue, { color: colors.text }]}>
                {student.creditHoursCompleted}
              </ThemedText>
              <ThemedText style={[s.acadStatLabel, { color: colors.textSecondary }]}>Completed</ThemedText>
            </View>
            <View style={s.acadStatItem}>
              <ThemedText style={[s.acadStatValue, { color: colors.text }]}>
                {student.creditHoursEnrolled}
              </ThemedText>
              <ThemedText style={[s.acadStatLabel, { color: colors.textSecondary }]}>Enrolled</ThemedText>
            </View>
          </View>
          {student.atRisk && (
            <View style={[s.flagBanner, { backgroundColor: '#EF444415' }]}>
              <IconSymbol name="exclamationmark.triangle.fill" size={12} color="#EF4444" />
              <ThemedText style={[s.flagText, { color: '#EF4444' }]}>At-risk — GPA below threshold</ThemedText>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// VIEW: IMMIGRATION
// =============================================================================

function ImmigrationView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>INTERNATIONAL PLAYERS</ThemedText>
      {IMMIGRATION_DATA.map((player) => (
        <View
          key={player.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={s.immHeader}>
            <View style={s.immInfo}>
              <ThemedText style={[s.immName, { color: colors.text }]}>{player.name}</ThemedText>
              <ThemedText style={[s.immCountry, { color: colors.textSecondary }]}>{player.country}</ThemedText>
            </View>
            <StatusBadge
              label={player.visaStatus.toUpperCase()}
              color={VISA_STATUS_COLOR[player.visaStatus]}
            />
          </View>

          {/* Visa details */}
          <View style={[s.immDetails, { borderTopColor: colors.border }]}>
            <View style={s.immDetailRow}>
              <ThemedText style={[s.immDetailLabel, { color: colors.textSecondary }]}>Visa Type</ThemedText>
              <ThemedText style={[s.immDetailValue, { color: colors.text }]}>{player.visaType}</ThemedText>
            </View>
            <View style={s.immDetailRow}>
              <ThemedText style={[s.immDetailLabel, { color: colors.textSecondary }]}>E-Verify</ThemedText>
              <StatusBadge
                label={player.eVerifyStatus.toUpperCase()}
                color={player.eVerifyStatus === 'Verified' ? '#22C55E' : '#F59E0B'}
              />
            </View>
            <View style={s.immDetailRow}>
              <ThemedText style={[s.immDetailLabel, { color: colors.textSecondary }]}>Expires</ThemedText>
              <ThemedText
                style={[
                  s.immDetailValue,
                  { color: player.visaStatus === 'Renewal Needed' ? '#F59E0B' : colors.text },
                ]}
              >
                {player.expirationDate}
              </ThemedText>
            </View>
          </View>

          {/* Document checklist */}
          <View style={[s.checklist, { borderTopColor: colors.border }]}>
            {player.documents.map((doc, i) => {
              const isIssue = doc.toLowerCase().includes('expiring') || doc.toLowerCase().includes('expired');
              return (
                <View key={`${player.id}-doc-${i}`} style={s.checkItem}>
                  <IconSymbol
                    name={isIssue ? 'exclamationmark.triangle.fill' : 'checkmark.circle.fill'}
                    size={14}
                    color={isIssue ? '#F59E0B' : '#22C55E'}
                  />
                  <ThemedText style={[s.checkText, { color: isIssue ? '#F59E0B' : colors.textSecondary }]}>
                    {doc}
                  </ThemedText>
                </View>
              );
            })}
          </View>

          {player.visaStatus === 'Renewal Needed' && (
            <View style={[s.flagBanner, { backgroundColor: '#F59E0B15' }]}>
              <IconSymbol name="exclamationmark.triangle.fill" size={12} color="#F59E0B" />
              <ThemedText style={[s.flagText, { color: '#F59E0B' }]}>Visa renewal required before expiration</ThemedText>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function SportsCompliance({ colors, accentColor, role }: Props) {
  const [activeView, setActiveView] = useState<ViewId>('eligibility');

  const handlePillPress = useCallback((id: ViewId) => {
    Haptics.selectionAsync();
    setActiveView(id);
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'eligibility':
        return <EligibilityView colors={colors} accentColor={accentColor} />;
      case 'academics':
        return <AcademicsView colors={colors} accentColor={accentColor} />;
      case 'immigration':
        return <ImmigrationView colors={colors} accentColor={accentColor} />;
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

  // -- Eligibility --
  eligHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  eligInfo: {
    flex: 1,
  },
  eligName: {
    fontSize: 14,
    fontWeight: '700',
  },
  eligTeam: {
    fontSize: 12,
    marginTop: 2,
  },

  // -- Checklist --
  checklist: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkText: {
    fontSize: 12,
    flex: 1,
  },

  // -- Flag banner --
  flagBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  flagText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },

  // -- Academics --
  acadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  acadInfo: {
    flex: 1,
  },
  acadName: {
    fontSize: 14,
    fontWeight: '700',
  },
  acadTeam: {
    fontSize: 12,
    marginTop: 2,
  },
  acadStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  acadStatItem: {
    alignItems: 'center',
  },
  acadStatValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  acadStatLabel: {
    fontSize: 10,
    marginTop: 2,
  },

  // -- Immigration --
  immHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  immInfo: {
    flex: 1,
  },
  immName: {
    fontSize: 14,
    fontWeight: '700',
  },
  immCountry: {
    fontSize: 12,
    marginTop: 2,
  },
  immDetails: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  immDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  immDetailLabel: {
    fontSize: 12,
  },
  immDetailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
});
