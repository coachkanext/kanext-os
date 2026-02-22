/**
 * Competition Compliance V3 — 3-pill ViewBar (Technical | Safety | Regulatory)
 * K-1 Speed League · Commissioner perspective
 * $10M cap compliance, safety inspections, regulatory status.
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

type ViewId = 'technical' | 'safety' | 'regulatory';

const VIEWS: { id: ViewId; label: string }[] = [
  { id: 'technical', label: 'Technical' },
  { id: 'safety', label: 'Safety' },
  { id: 'regulatory', label: 'Regulatory' },
];

type ComplianceStatus = 'Compliant' | 'Approved' | 'Passed' | 'Current' | 'Ready' | 'Active' | 'Pending' | 'Registered' | 'Licensed' | 'Certified';

const STATUS_COLORS: Record<string, string> = {
  Compliant: '#22C55E',
  Approved: '#22C55E',
  Passed: '#22C55E',
  Current: '#22C55E',
  Ready: '#22C55E',
  Active: '#22C55E',
  Registered: '#22C55E',
  Licensed: '#22C55E',
  Certified: '#22C55E',
  Pending: '#F59E0B',
};

const CAP_COMPLIANCE = [
  { id: 'cc1', team: 'KaNeXT Works Alpha', status: 'Compliant' as ComplianceStatus },
  { id: 'cc2', team: 'Porsche Motorsport', status: 'Compliant' as ComplianceStatus },
  { id: 'cc3', team: 'McLaren Racing', status: 'Compliant' as ComplianceStatus },
  { id: 'cc4', team: 'RUF Performance', status: 'Compliant' as ComplianceStatus },
  { id: 'cc5', team: 'HKS Japan', status: 'Compliant' as ComplianceStatus },
  { id: 'cc6', team: 'Grid One Racing', status: 'Compliant' as ComplianceStatus },
];

const HOMOLOGATION = [
  { id: 'h1', team: 'KaNeXT Works Alpha', car: 'KW-X1', status: 'Approved' as ComplianceStatus },
  { id: 'h2', team: 'Porsche Motorsport', car: '911 GT-K', status: 'Approved' as ComplianceStatus },
  { id: 'h3', team: 'McLaren Racing', car: '750S-K', status: 'Approved' as ComplianceStatus },
  { id: 'h4', team: 'RUF Performance', car: 'CTR-K', status: 'Approved' as ComplianceStatus },
  { id: 'h5', team: 'HKS Japan', car: 'GR-K Supra', status: 'Approved' as ComplianceStatus },
  { id: 'h6', team: 'Grid One Racing', car: 'G1-Spec', status: 'Approved' as ComplianceStatus },
];

const TECH_INSPECTIONS = [
  { id: 'ti1', race: 'R1 Miami', result: 'Passed' as ComplianceStatus, issues: 0 },
  { id: 'ti2', race: 'R2 Austin', result: 'Passed' as ComplianceStatus, issues: 0 },
  { id: 'ti3', race: 'R3 Monza', result: 'Passed' as ComplianceStatus, issues: 1 },
];

const TECH_BULLETINS = [
  { id: 'tb1', ref: 'TB-2025-01', title: 'Aero package measurement clarification', date: 'Jan 15' },
  { id: 'tb2', ref: 'TB-2025-02', title: 'Fuel flow sensor calibration standard', date: 'Feb 3' },
  { id: 'tb3', ref: 'TB-2025-03', title: 'Hybrid system power output verification', date: 'Mar 10' },
];

const PENALTY_LOG = [
  { id: 'pl1', team: 'RUF Performance', penalty: '5-second time penalty', race: 'R2 Austin', reason: 'Unsafe pit release' },
  { id: 'pl2', team: 'HKS Japan', penalty: '10,000 fine', race: 'R3 Monza', reason: 'Exceeding pit lane speed limit' },
];

// -- Safety --
const VENUE_INSPECTIONS = [
  { id: 'vi1', venue: 'Miami International Autodrome', status: 'Passed' as ComplianceStatus },
  { id: 'vi2', venue: 'Circuit of the Americas', status: 'Passed' as ComplianceStatus },
  { id: 'vi3', venue: 'Autodromo di Monza', status: 'Passed' as ComplianceStatus },
  { id: 'vi4', venue: 'Suzuka Circuit', status: 'Passed' as ComplianceStatus },
  { id: 'vi5', venue: 'Spa-Francorchamps', status: 'Passed' as ComplianceStatus },
  { id: 'vi6', venue: 'Nurburgring GP', status: 'Passed' as ComplianceStatus },
];

const DRIVER_MEDICALS = [
  { id: 'dm1', name: 'Carter', status: 'Current' as ComplianceStatus },
  { id: 'dm2', name: 'Oluwadara', status: 'Current' as ComplianceStatus },
  { id: 'dm3', name: 'Verstappen', status: 'Current' as ComplianceStatus },
  { id: 'dm4', name: 'Leclerc', status: 'Current' as ComplianceStatus },
  { id: 'dm5', name: 'Hamilton', status: 'Current' as ComplianceStatus },
  { id: 'dm6', name: 'Norris', status: 'Current' as ComplianceStatus },
  { id: 'dm7', name: 'Alonso', status: 'Current' as ComplianceStatus },
  { id: 'dm8', name: 'Piastri', status: 'Current' as ComplianceStatus },
  { id: 'dm9', name: 'Tsunoda', status: 'Current' as ComplianceStatus },
  { id: 'dm10', name: 'Kobayashi', status: 'Current' as ComplianceStatus },
  { id: 'dm11', name: 'Russell', status: 'Current' as ComplianceStatus },
  { id: 'dm12', name: 'Bearman', status: 'Current' as ComplianceStatus },
];

const INCIDENT_REPORTS = [
  { id: 'ir1', race: 'R1 Miami', desc: 'Minor contact between cars 4 and 7 at Turn 3, no injuries', severity: 'Low' },
  { id: 'ir2', race: 'R3 Monza', desc: 'Barrier contact at Parabolica, driver cleared by medical team', severity: 'Medium' },
];

const MARSHAL_TRAINING = { certified: 45, pending: 3 };

// -- Regulatory --
const INSURANCE_POLICIES = [
  { id: 'ip1', race: 'R1 Miami', status: 'Active' as ComplianceStatus },
  { id: 'ip2', race: 'R2 Austin', status: 'Active' as ComplianceStatus },
  { id: 'ip3', race: 'R3 Monza', status: 'Active' as ComplianceStatus },
  { id: 'ip4', race: 'R4 Suzuka', status: 'Active' as ComplianceStatus },
  { id: 'ip5', race: 'R5 Spa', status: 'Active' as ComplianceStatus },
  { id: 'ip6', race: 'R6 Nurburgring', status: 'Active' as ComplianceStatus },
  { id: 'ip7', race: 'R7 Bathurst', status: 'Active' as ComplianceStatus },
  { id: 'ip8', race: 'R8 Dubai', status: 'Active' as ComplianceStatus },
];

const GOV_PERMITS = [
  { id: 'gp1', jurisdiction: 'Miami-Dade County', status: 'Approved' as ComplianceStatus },
  { id: 'gp2', jurisdiction: 'Travis County, TX', status: 'Approved' as ComplianceStatus },
  { id: 'gp3', jurisdiction: 'Monza Municipality', status: 'Approved' as ComplianceStatus },
  { id: 'gp4', jurisdiction: 'Suzuka City', status: 'Pending' as ComplianceStatus },
];

const TRADEMARKS = [
  { id: 'tm1', mark: 'K-1', status: 'Registered' as ComplianceStatus },
  { id: 'tm2', mark: 'K-1 Speed League', status: 'Registered' as ComplianceStatus },
  { id: 'tm3', mark: 'K-1 Grand Prix', status: 'Registered' as ComplianceStatus },
];

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

function ComplianceBadge({ status }: { status: ComplianceStatus }) {
  const color = STATUS_COLORS[status] || '#A1A1AA';
  return <StatusBadge label={status.toUpperCase()} color={color} />;
}

// =============================================================================
// VIEW: TECHNICAL
// =============================================================================

function TechnicalView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* $10M Cap Compliance */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>$10M CAP COMPLIANCE</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {CAP_COMPLIANCE.map((team, idx) => (
          <View
            key={team.id}
            style={[
              s.compRow,
              idx < CAP_COMPLIANCE.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <ThemedText style={[s.compTeam, { color: colors.text }]}>{team.team}</ThemedText>
            <ComplianceBadge status={team.status} />
          </View>
        ))}
      </View>

      {/* Homologation */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>HOMOLOGATION STATUS</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {HOMOLOGATION.map((entry, idx) => (
          <View
            key={entry.id}
            style={[
              s.homoRow,
              idx < HOMOLOGATION.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={s.homoInfo}>
              <ThemedText style={[s.homoTeam, { color: colors.text }]}>{entry.team}</ThemedText>
              <ThemedText style={[s.homoCar, { color: colors.textSecondary }]}>{entry.car}</ThemedText>
            </View>
            <ComplianceBadge status={entry.status} />
          </View>
        ))}
      </View>

      {/* Tech Inspections */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>TECHNICAL INSPECTIONS</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {TECH_INSPECTIONS.map((insp, idx) => (
          <View
            key={insp.id}
            style={[
              s.compRow,
              idx < TECH_INSPECTIONS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={s.inspInfo}>
              <ThemedText style={[s.compTeam, { color: colors.text }]}>{insp.race}</ThemedText>
              {insp.issues > 0 && (
                <ThemedText style={[s.issueCount, { color: '#F59E0B' }]}>{insp.issues} issue noted</ThemedText>
              )}
            </View>
            <ComplianceBadge status={insp.result} />
          </View>
        ))}
      </View>

      {/* Technical Bulletins */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>TECHNICAL BULLETINS</ThemedText>
      {TECH_BULLETINS.map((tb) => (
        <View key={tb.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.bulletinHeader}>
            <View style={[s.bulletinRef, { backgroundColor: accentColor + '15' }]}>
              <ThemedText style={[s.bulletinRefText, { color: accentColor }]}>{tb.ref}</ThemedText>
            </View>
            <ThemedText style={[s.bulletinDate, { color: colors.textSecondary }]}>{tb.date}</ThemedText>
          </View>
          <ThemedText style={[s.bulletinTitle, { color: colors.text }]}>{tb.title}</ThemedText>
        </View>
      ))}

      {/* Penalty Log */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>PENALTY LOG</ThemedText>
      {PENALTY_LOG.map((pen) => (
        <View key={pen.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.penaltyHeader}>
            <ThemedText style={[s.penaltyTeam, { color: colors.text }]}>{pen.team}</ThemedText>
            <StatusBadge label={pen.penalty.toUpperCase()} color="#EF4444" />
          </View>
          <ThemedText style={[s.penaltyDetail, { color: colors.textSecondary }]}>
            {pen.race} · {pen.reason}
          </ThemedText>
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// VIEW: SAFETY
// =============================================================================

function SafetyView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Venue Safety Inspections */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>VENUE SAFETY INSPECTIONS</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {VENUE_INSPECTIONS.map((vi, idx) => (
          <View
            key={vi.id}
            style={[
              s.compRow,
              idx < VENUE_INSPECTIONS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <ThemedText style={[s.compTeam, { color: colors.text }]} numberOfLines={1}>{vi.venue}</ThemedText>
            <ComplianceBadge status={vi.status} />
          </View>
        ))}
      </View>

      {/* Driver Medical Certs */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>DRIVER MEDICAL CERTIFICATES ({DRIVER_MEDICALS.length})</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {DRIVER_MEDICALS.map((dm, idx) => (
          <View
            key={dm.id}
            style={[
              s.compRow,
              idx < DRIVER_MEDICALS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <ThemedText style={[s.compTeam, { color: colors.text }]}>{dm.name}</ThemedText>
            <ComplianceBadge status={dm.status} />
          </View>
        ))}
      </View>

      {/* Car Safety Equipment */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>CAR SAFETY EQUIPMENT</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {CAP_COMPLIANCE.map((team, idx) => (
          <View
            key={team.id}
            style={[
              s.compRow,
              idx < CAP_COMPLIANCE.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <ThemedText style={[s.compTeam, { color: colors.text }]}>{team.team}</ThemedText>
            <ComplianceBadge status="Compliant" />
          </View>
        ))}
      </View>

      {/* Incident Reports */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>INCIDENT REPORTS</ThemedText>
      {INCIDENT_REPORTS.map((ir) => (
        <View key={ir.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.incidentHeader}>
            <ThemedText style={[s.incidentRace, { color: colors.text }]}>{ir.race}</ThemedText>
            <StatusBadge label={ir.severity.toUpperCase()} color={ir.severity === 'Low' ? '#22C55E' : '#F59E0B'} />
          </View>
          <ThemedText style={[s.incidentDesc, { color: colors.textSecondary }]}>{ir.desc}</ThemedText>
        </View>
      ))}

      {/* Marshal Training */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>MARSHAL TRAINING</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.marshalRow}>
          <View style={s.marshalStat}>
            <ThemedText style={[s.marshalCount, { color: '#22C55E' }]}>{MARSHAL_TRAINING.certified}</ThemedText>
            <ThemedText style={[s.marshalLabel, { color: colors.textSecondary }]}>Certified</ThemedText>
          </View>
          <View style={s.marshalStat}>
            <ThemedText style={[s.marshalCount, { color: '#F59E0B' }]}>{MARSHAL_TRAINING.pending}</ThemedText>
            <ThemedText style={[s.marshalLabel, { color: colors.textSecondary }]}>Pending</ThemedText>
          </View>
        </View>
      </View>

      {/* Safety Car & Medical Car */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>SAFETY VEHICLES</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[s.compRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
          <View style={s.vehicleRow}>
            <IconSymbol name="car.fill" size={14} color={accentColor} />
            <ThemedText style={[s.compTeam, { color: colors.text }]}>Safety Car</ThemedText>
          </View>
          <ComplianceBadge status="Ready" />
        </View>
        <View style={s.compRow}>
          <View style={s.vehicleRow}>
            <IconSymbol name="heart.fill" size={14} color={accentColor} />
            <ThemedText style={[s.compTeam, { color: colors.text }]}>Medical Car</ThemedText>
          </View>
          <ComplianceBadge status="Ready" />
        </View>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// VIEW: REGULATORY
// =============================================================================

function RegulatoryView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Insurance Policies */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>RACE-SPECIFIC INSURANCE ({INSURANCE_POLICIES.length})</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {INSURANCE_POLICIES.map((ip, idx) => (
          <View
            key={ip.id}
            style={[
              s.compRow,
              idx < INSURANCE_POLICIES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <ThemedText style={[s.compTeam, { color: colors.text }]}>{ip.race}</ThemedText>
            <ComplianceBadge status={ip.status} />
          </View>
        ))}
      </View>

      {/* Government Permits */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>LOCAL GOVERNMENT PERMITS</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {GOV_PERMITS.map((gp, idx) => (
          <View
            key={gp.id}
            style={[
              s.compRow,
              idx < GOV_PERMITS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <ThemedText style={[s.compTeam, { color: colors.text }]}>{gp.jurisdiction}</ThemedText>
            <ComplianceBadge status={gp.status} />
          </View>
        ))}
      </View>

      {/* Driver Licensing */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>DRIVER LICENSING ({DRIVER_MEDICALS.length})</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {DRIVER_MEDICALS.map((dm, idx) => (
          <View
            key={dm.id}
            style={[
              s.compRow,
              idx < DRIVER_MEDICALS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <ThemedText style={[s.compTeam, { color: colors.text }]}>{dm.name}</ThemedText>
            <ComplianceBadge status="Licensed" />
          </View>
        ))}
      </View>

      {/* Environmental Compliance */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>ENVIRONMENTAL COMPLIANCE</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.envRow}>
          <IconSymbol name="globe" size={16} color={accentColor} />
          <View style={s.envInfo}>
            <ThemedText style={[s.envTitle, { color: colors.text }]}>Carbon Offset Program</ThemedText>
            <ThemedText style={[s.envDesc, { color: colors.textSecondary }]}>
              Active program covering all 8 race weekends including team logistics, broadcast, and fan travel offsets.
            </ThemedText>
          </View>
          <ComplianceBadge status="Active" />
        </View>
      </View>

      {/* IP Protection */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>INTELLECTUAL PROPERTY</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {TRADEMARKS.map((tm, idx) => (
          <View
            key={tm.id}
            style={[
              s.compRow,
              idx < TRADEMARKS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={s.tmInfo}>
              <IconSymbol name="lock.shield.fill" size={14} color={accentColor} />
              <ThemedText style={[s.compTeam, { color: colors.text }]}>{tm.mark}</ThemedText>
            </View>
            <ComplianceBadge status={tm.status} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function CompCompliance({ colors, accentColor, role }: Props) {
  const [activeView, setActiveView] = useState<ViewId>('technical');

  const handlePillPress = useCallback((id: ViewId) => {
    Haptics.selectionAsync();
    setActiveView(id);
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'technical':
        return <TechnicalView colors={colors} accentColor={accentColor} />;
      case 'safety':
        return <SafetyView colors={colors} accentColor={accentColor} />;
      case 'regulatory':
        return <RegulatoryView colors={colors} accentColor={accentColor} />;
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

  // -- Compliance Row --
  compRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  compTeam: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  inspInfo: {
    flex: 1,
  },
  issueCount: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Homologation --
  homoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  homoInfo: {
    flex: 1,
  },
  homoTeam: {
    fontSize: 13,
    fontWeight: '500',
  },
  homoCar: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Bulletins --
  bulletinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  bulletinRef: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  bulletinRefText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bulletinDate: {
    fontSize: 12,
  },
  bulletinTitle: {
    fontSize: 14,
    fontWeight: '600',
  },

  // -- Penalty --
  penaltyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  penaltyTeam: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  penaltyDetail: {
    fontSize: 12,
  },

  // -- Incident --
  incidentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  incidentRace: {
    fontSize: 14,
    fontWeight: '600',
  },
  incidentDesc: {
    fontSize: 12,
    lineHeight: 18,
  },

  // -- Marshal --
  marshalRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  marshalStat: {
    alignItems: 'center',
    gap: 4,
  },
  marshalCount: {
    fontSize: 28,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  marshalLabel: {
    fontSize: 12,
  },

  // -- Vehicle --
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },

  // -- Environmental --
  envRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  envInfo: {
    flex: 1,
  },
  envTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  envDesc: {
    fontSize: 12,
    lineHeight: 18,
  },

  // -- Trademark --
  tmInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
});
