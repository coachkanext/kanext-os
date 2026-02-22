/**
 * Competition People V3 — 3-pill ViewBar (Officials | Teams | Broadcast)
 * K-1 Speed League · Commissioner perspective
 * League officials, grid teams, and broadcast crew.
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

type ViewId = 'officials' | 'teams' | 'broadcast';

const VIEWS: { id: ViewId; label: string }[] = [
  { id: 'officials', label: 'Officials' },
  { id: 'teams', label: 'Teams' },
  { id: 'broadcast', label: 'Broadcast' },
];

type GridCategory = 'OEM Works' | 'Premier Tuner' | 'League-Owned' | 'KaNeXT Works';

const CATEGORY_COLOR: Record<GridCategory, string> = {
  'OEM Works': '#1D9BF0',
  'Premier Tuner': '#F59E0B',
  'League-Owned': '#A1A1AA',
  'KaNeXT Works': '#1D9BF0',
};

const OFFICIALS = [
  { id: 'o1', name: 'Carter', title: 'Commissioner', icon: 'crown.fill' as const },
  { id: 'o2', name: 'Jean-Pierre Moreau', title: 'Race Director', icon: 'flag.fill' as const },
  { id: 'o3', name: 'Dr. Lisa Grant', title: 'Technical Director', icon: 'gearshape.fill' as const },
  { id: 'o4', name: 'Hans Mueller', title: 'Chief Steward', icon: 'shield.fill' as const },
  { id: 'o5', name: 'Dr. Amara Obi', title: 'Medical Delegate', icon: 'heart.fill' as const },
  { id: 'o6', name: 'Carlos Mendez', title: 'Safety Delegate', icon: 'exclamationmark.triangle.fill' as const },
  { id: 'o7', name: 'Yuki Tanaka', title: 'Chief Marshal', icon: 'flag.checkered' as const },
  { id: 'o8', name: 'Marcus Webb', title: 'Chief Timekeeper', icon: 'timer' as const },
];

const NEXT_RACE_ASSIGNMENTS = [
  { id: 'na1', official: 'Jean-Pierre Moreau', role: 'Race Director', venue: 'R4 Suzuka' },
  { id: 'na2', official: 'Hans Mueller', role: 'Chief Steward', venue: 'R4 Suzuka' },
  { id: 'na3', official: 'Carlos Mendez', role: 'Safety Delegate', venue: 'R4 Suzuka' },
  { id: 'na4', official: 'Yuki Tanaka', role: 'Chief Marshal', venue: 'R4 Suzuka' },
  { id: 'na5', official: 'Marcus Webb', role: 'Chief Timekeeper', venue: 'R4 Suzuka' },
];

interface TeamEntry {
  id: string;
  name: string;
  category: GridCategory;
  constructor: string;
  drivers: string[];
  crewChief: string;
  capStatus: 'Compliant' | 'Under Review';
  homologation: 'Approved' | 'Pending';
}

const TEAMS: TeamEntry[] = [
  {
    id: 't1',
    name: 'KaNeXT Works Alpha',
    category: 'KaNeXT Works',
    constructor: 'KaNeXT Works',
    drivers: ['Carter', 'Oluwadara'],
    crewChief: 'Marco Rossi',
    capStatus: 'Compliant',
    homologation: 'Approved',
  },
  {
    id: 't2',
    name: 'Porsche Motorsport',
    category: 'OEM Works',
    constructor: 'Porsche AG',
    drivers: ['Verstappen', 'Leclerc'],
    crewChief: 'Andreas Seidl',
    capStatus: 'Compliant',
    homologation: 'Approved',
  },
  {
    id: 't3',
    name: 'McLaren Racing',
    category: 'OEM Works',
    constructor: 'McLaren Automotive',
    drivers: ['Hamilton', 'Norris'],
    crewChief: 'James Key',
    capStatus: 'Compliant',
    homologation: 'Approved',
  },
  {
    id: 't4',
    name: 'RUF Performance',
    category: 'Premier Tuner',
    constructor: 'RUF Automobile',
    drivers: ['Alonso', 'Piastri'],
    crewChief: 'Stefan Ruf',
    capStatus: 'Compliant',
    homologation: 'Approved',
  },
  {
    id: 't5',
    name: 'HKS Japan',
    category: 'Premier Tuner',
    constructor: 'HKS Co. Ltd.',
    drivers: ['Tsunoda', 'Kobayashi'],
    crewChief: 'Hiroshi Yamada',
    capStatus: 'Compliant',
    homologation: 'Approved',
  },
  {
    id: 't6',
    name: 'Grid One Racing',
    category: 'League-Owned',
    constructor: 'K-1 Speed League',
    drivers: ['Russell', 'Bearman'],
    crewChief: 'David Sanchez',
    capStatus: 'Compliant',
    homologation: 'Approved',
  },
];

const BROADCAST_CREW = [
  { id: 'b1', name: 'David Chen', title: 'Lead Commentator', icon: 'mic.fill' as const },
  { id: 'b2', name: 'Martin Brundle Jr.', title: 'Color Analyst', icon: 'bubble.left.fill' as const },
  { id: 'b3', name: 'Sofia Rodriguez', title: 'Pit Lane Reporter', icon: 'person.fill' as const },
  { id: 'b4', name: 'Alex Yamamoto', title: 'Director of Production', icon: 'video.fill' as const },
];

const MEDIA_PARTNERS = [
  { id: 'mp1', name: 'ESPN', type: 'Broadcast Network', territories: 'Americas' },
  { id: 'mp2', name: 'Sky Sports F1 Channel', type: 'Broadcast Network', territories: 'UK & Europe' },
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

function CategoryTag({ category }: { category: GridCategory }) {
  const color = CATEGORY_COLOR[category];
  return (
    <View style={[s.categoryTag, { backgroundColor: color + '20' }]}>
      <ThemedText style={[s.categoryTagText, { color }]}>{category}</ThemedText>
    </View>
  );
}

// =============================================================================
// VIEW: OFFICIALS
// =============================================================================

function OfficialsView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>LEAGUE OFFICIALS ({OFFICIALS.length})</ThemedText>
      {OFFICIALS.map((official) => (
        <Pressable
          key={official.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => Haptics.selectionAsync()}
        >
          <View style={s.officialRow}>
            <View style={[s.officialIcon, { backgroundColor: accentColor + '15' }]}>
              <IconSymbol name={official.icon} size={16} color={accentColor} />
            </View>
            <View style={s.officialInfo}>
              <ThemedText style={[s.officialName, { color: colors.text }]}>{official.name}</ThemedText>
              <ThemedText style={[s.officialTitle, { color: colors.textSecondary }]}>{official.title}</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
          </View>
        </Pressable>
      ))}

      {/* Next Race Assignments */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: 20 }]}>
        R4 SUZUKA — ASSIGNMENTS
      </ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {NEXT_RACE_ASSIGNMENTS.map((assign, idx) => (
          <View
            key={assign.id}
            style={[
              s.assignRow,
              idx < NEXT_RACE_ASSIGNMENTS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={s.assignInfo}>
              <ThemedText style={[s.assignName, { color: colors.text }]}>{assign.official}</ThemedText>
              <ThemedText style={[s.assignRole, { color: colors.textSecondary }]}>{assign.role}</ThemedText>
            </View>
            <StatusBadge label="CONFIRMED" color="#22C55E" />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// VIEW: TEAMS
// =============================================================================

function TeamsView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>PERMANENT GRID ({TEAMS.length} TEAMS)</ThemedText>
      {TEAMS.map((team) => (
        <Pressable
          key={team.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => Haptics.selectionAsync()}
        >
          <View style={s.teamHeader}>
            <ThemedText style={[s.teamName, { color: colors.text }]}>{team.name}</ThemedText>
            <CategoryTag category={team.category} />
          </View>

          <View style={[s.teamMeta, { borderTopColor: colors.border }]}>
            <View style={s.teamMetaRow}>
              <ThemedText style={[s.teamMetaLabel, { color: colors.textSecondary }]}>Constructor</ThemedText>
              <ThemedText style={[s.teamMetaValue, { color: colors.text }]}>{team.constructor}</ThemedText>
            </View>
            <View style={s.teamMetaRow}>
              <ThemedText style={[s.teamMetaLabel, { color: colors.textSecondary }]}>Drivers</ThemedText>
              <ThemedText style={[s.teamMetaValue, { color: colors.text }]}>{team.drivers.join(' · ')}</ThemedText>
            </View>
            <View style={s.teamMetaRow}>
              <ThemedText style={[s.teamMetaLabel, { color: colors.textSecondary }]}>Crew Chief</ThemedText>
              <ThemedText style={[s.teamMetaValue, { color: colors.text }]}>{team.crewChief}</ThemedText>
            </View>
          </View>

          <View style={s.teamStatusRow}>
            <StatusBadge label={team.capStatus === 'Compliant' ? 'CAP: COMPLIANT' : 'CAP: REVIEW'} color={team.capStatus === 'Compliant' ? '#22C55E' : '#F59E0B'} />
            <StatusBadge label={team.homologation === 'Approved' ? 'HOMOLOGATED' : 'PENDING'} color={team.homologation === 'Approved' ? '#22C55E' : '#F59E0B'} />
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// VIEW: BROADCAST
// =============================================================================

function BroadcastView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Broadcast Crew */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>BROADCAST CREW</ThemedText>
      {BROADCAST_CREW.map((person) => (
        <Pressable
          key={person.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => Haptics.selectionAsync()}
        >
          <View style={s.officialRow}>
            <View style={[s.officialIcon, { backgroundColor: accentColor + '15' }]}>
              <IconSymbol name={person.icon} size={16} color={accentColor} />
            </View>
            <View style={s.officialInfo}>
              <ThemedText style={[s.officialName, { color: colors.text }]}>{person.name}</ThemedText>
              <ThemedText style={[s.officialTitle, { color: colors.textSecondary }]}>{person.title}</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
          </View>
        </Pressable>
      ))}

      {/* Media Partners */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: 20 }]}>MEDIA PARTNERS</ThemedText>
      {MEDIA_PARTNERS.map((partner) => (
        <View key={partner.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.partnerHeader}>
            <IconSymbol name="play.rectangle.fill" size={18} color={accentColor} />
            <View style={s.partnerInfo}>
              <ThemedText style={[s.partnerName, { color: colors.text }]}>{partner.name}</ThemedText>
              <ThemedText style={[s.partnerType, { color: colors.textSecondary }]}>{partner.type}</ThemedText>
            </View>
          </View>
          <View style={s.partnerTerritories}>
            <ThemedText style={[s.territoriesLabel, { color: colors.textSecondary }]}>Territories</ThemedText>
            <ThemedText style={[s.territoriesValue, { color: colors.text }]}>{partner.territories}</ThemedText>
          </View>
        </View>
      ))}

      {/* Press Pool */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: 20 }]}>PRESS POOL</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.pressPoolRow}>
          <IconSymbol name="person.3.fill" size={18} color={accentColor} />
          <View style={s.pressPoolInfo}>
            <ThemedText style={[s.pressPoolCount, { color: colors.text }]}>24</ThemedText>
            <ThemedText style={[s.pressPoolLabel, { color: colors.textSecondary }]}>Credentialed journalists</ThemedText>
          </View>
        </View>
        <View style={[s.pressPoolDetail, { borderTopColor: colors.border }]}>
          <ThemedText style={[s.pressDetailText, { color: colors.textSecondary }]}>
            Full press credentials issued for the 2024-25 K-1 Speed League season. Includes trackside access, paddock entry, and post-race conference attendance.
          </ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function CompPeople({ colors, accentColor, role }: Props) {
  const [activeView, setActiveView] = useState<ViewId>('officials');

  const handlePillPress = useCallback((id: ViewId) => {
    Haptics.selectionAsync();
    setActiveView(id);
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'officials':
        return <OfficialsView colors={colors} accentColor={accentColor} />;
      case 'teams':
        return <TeamsView colors={colors} accentColor={accentColor} />;
      case 'broadcast':
        return <BroadcastView colors={colors} accentColor={accentColor} />;
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

  // -- Category Tag --
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // -- Officials --
  officialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  officialIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  officialInfo: {
    flex: 1,
  },
  officialName: {
    fontSize: 15,
    fontWeight: '700',
  },
  officialTitle: {
    fontSize: 12,
    marginTop: 2,
  },

  // -- Assignments --
  assignRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  assignInfo: {
    flex: 1,
  },
  assignName: {
    fontSize: 14,
    fontWeight: '600',
  },
  assignRole: {
    fontSize: 12,
    marginTop: 2,
  },

  // -- Teams --
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  teamName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  teamMeta: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  teamMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamMetaLabel: {
    fontSize: 12,
  },
  teamMetaValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  teamStatusRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },

  // -- Broadcast Partners --
  partnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: 15,
    fontWeight: '700',
  },
  partnerType: {
    fontSize: 12,
    marginTop: 2,
  },
  partnerTerritories: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2F3336',
  },
  territoriesLabel: {
    fontSize: 12,
  },
  territoriesValue: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Press Pool --
  pressPoolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pressPoolInfo: {
    flex: 1,
  },
  pressPoolCount: {
    fontSize: 28,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  pressPoolLabel: {
    fontSize: 13,
    marginTop: 2,
  },
  pressPoolDetail: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  pressDetailText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
