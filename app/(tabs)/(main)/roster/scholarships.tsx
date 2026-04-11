import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { resetFooter } from '@/utils/global-footer-hide';
import { useScrollFooter } from '@/hooks/use-scroll-footer';

// ---------------------------------------------------------------------------
// Types & mock data
// ---------------------------------------------------------------------------

type ScholarshipType = 'Full' | 'Partial' | 'Walk-On';
type RenewalStatus = 'Renewed' | 'Pending' | 'At Risk' | 'Expired';
type AcademicStanding = 'Good' | 'Probation' | 'Warning';

interface ScholarshipPlayer {
  id: string;
  name: string;
  initials: string;
  number: string;
  position: string;
  year: string;
  scholarshipType: ScholarshipType;
  amount: number; // per year
  renewalStatus: RenewalStatus;
  gpa: number;
  academicStanding: AcademicStanding;
  creditsCompleted: number;
  creditsRequired: number;
  hue: string;
}

const PLAYERS: ScholarshipPlayer[] = [
  { id: 'p1',  name: 'Marcus Jordan',   initials: 'MJ', number: '3',  position: 'PG', year: 'Jr', scholarshipType: 'Full',    amount: 52000, renewalStatus: 'Renewed',  gpa: 3.4, academicStanding: 'Good',      creditsCompleted: 72,  creditsRequired: 120, hue: '#8B7355' },
  { id: 'p2',  name: 'Devon Clarke',    initials: 'DC', number: '11', position: 'SG', year: 'So', scholarshipType: 'Full',    amount: 52000, renewalStatus: 'Renewed',  gpa: 2.9, academicStanding: 'Good',      creditsCompleted: 34,  creditsRequired: 120, hue: '#6B8C7A' },
  { id: 'p3',  name: 'Laolu Adeyemi',   initials: 'LA', number: '24', position: 'SF', year: 'Jr', scholarshipType: 'Full',    amount: 52000, renewalStatus: 'Pending',  gpa: 2.1, academicStanding: 'Warning',   creditsCompleted: 58,  creditsRequired: 120, hue: '#7A6B8C' },
  { id: 'p4',  name: 'Terrell Washington', initials: 'TW', number: '5', position: 'PF', year: 'Sr', scholarshipType: 'Full', amount: 52000, renewalStatus: 'Renewed',  gpa: 3.7, academicStanding: 'Good',      creditsCompleted: 98,  creditsRequired: 120, hue: '#8C6B6B' },
  { id: 'p5',  name: 'Isaiah Brooks',   initials: 'IB', number: '32', position: 'C',  year: 'Fr', scholarshipType: 'Full',    amount: 52000, renewalStatus: 'Renewed',  gpa: 3.1, academicStanding: 'Good',      creditsCompleted: 15,  creditsRequired: 120, hue: '#6B7A8C' },
  { id: 'p6',  name: 'Darius Reed',     initials: 'DR', number: '2',  position: 'PG', year: 'So', scholarshipType: 'Partial', amount: 26000, renewalStatus: 'Renewed',  gpa: 3.6, academicStanding: 'Good',      creditsCompleted: 42,  creditsRequired: 120, hue: '#8C7A6B' },
  { id: 'p7',  name: 'Brandon Scott',   initials: 'BS', number: '14', position: 'SG', year: 'Jr', scholarshipType: 'Partial', amount: 26000, renewalStatus: 'At Risk',  gpa: 1.8, academicStanding: 'Probation', creditsCompleted: 55,  creditsRequired: 120, hue: '#6B8C8C' },
  { id: 'p8',  name: 'Quincy Miles',    initials: 'QM', number: '21', position: 'SF', year: 'Sr', scholarshipType: 'Full',    amount: 52000, renewalStatus: 'Expired',  gpa: 2.4, academicStanding: 'Warning',   creditsCompleted: 103, creditsRequired: 120, hue: '#8C8C6B' },
  { id: 'p9',  name: 'Malik Turner',    initials: 'MT', number: '44', position: 'PF', year: 'Fr', scholarshipType: 'Walk-On', amount: 0,     renewalStatus: 'Renewed',  gpa: 3.9, academicStanding: 'Good',      creditsCompleted: 12,  creditsRequired: 120, hue: '#7A8C6B' },
  { id: 'p10', name: 'Chris Okafor',    initials: 'CO', number: '55', position: 'C',  year: 'So', scholarshipType: 'Full',    amount: 52000, renewalStatus: 'Pending',  gpa: 2.6, academicStanding: 'Good',      creditsCompleted: 30,  creditsRequired: 120, hue: '#8C6B7A' },
];

const BUDGET = {
  totalAllotted: 13,   // NCAA D-I men's basketball: 13 scholarships
  fullUsed: 8,
  partialUsed: 2,
  walkOnCount: 1,
  annualCostFull: 52000,
  annualCostPartial: 26000,
};

const STATUS_FILTERS = ['All', 'Full', 'Partial', 'Walk-On', 'At Risk'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renewalColor(status: RenewalStatus, C: ComponentColors): string {
  switch (status) {
    case 'Renewed':  return '#5A8A6E';
    case 'Pending':  return '#B8943E';
    case 'At Risk':  return '#B85C5C';
    case 'Expired':  return C.secondary as string;
  }
}

function gpaColor(gpa: number, C: ComponentColors): string {
  if (gpa >= 3.0) return '#5A8A6E';
  if (gpa >= 2.0) return '#B8943E';
  return '#B85C5C';
}

function typeColor(type: ScholarshipType): string {
  switch (type) {
    case 'Full':    return '#5A8A6E';
    case 'Partial': return '#B8943E';
    case 'Walk-On': return '#9C9790';
  }
}

function fmt(n: number): string {
  return '$' + n.toLocaleString();
}

// ---------------------------------------------------------------------------
// PlayerScholarshipCard
// ---------------------------------------------------------------------------

function PlayerScholarshipCard({
  player, C, s,
}: {
  player: ScholarshipPlayer; C: ComponentColors; s: ReturnType<typeof makeStyles>;
}) {
  const rColor = renewalColor(player.renewalStatus, C);
  const tColor = typeColor(player.scholarshipType);
  const gColor = gpaColor(player.gpa, C);
  const creditPct = Math.min(player.creditsCompleted / player.creditsRequired, 1);

  return (
    <Pressable
      onPress={() => Haptics.selectionAsync()}
      style={({ pressed }) => [
        s.card,
        { backgroundColor: pressed ? C.surfacePressed : C.surface, borderColor: C.separator },
      ]}
    >
      {/* Tier stripe */}
      <View style={[s.stripe, { backgroundColor: tColor }]} />

      {/* Avatar */}
      <View style={[s.avatar, { backgroundColor: player.hue }]}>
        <Text style={s.avatarText}>{player.initials}</Text>
      </View>

      {/* Body */}
      <View style={s.body}>
        <View style={s.bodyTop}>
          <Text style={[s.playerName, { color: C.label }]} numberOfLines={1}>{player.name}</Text>
          <View style={[s.renewalChip, { backgroundColor: rColor + '22', borderColor: rColor + '55' }]}>
            <Text style={[s.renewalText, { color: rColor }]}>{player.renewalStatus}</Text>
          </View>
        </View>
        <Text style={[s.metaLine, { color: C.secondary }]}>#{player.number} · {player.position} · {player.year}</Text>

        <View style={s.dataRow}>
          {/* Scholarship type */}
          <View style={[s.typeChip, { backgroundColor: tColor + '22' }]}>
            <Text style={[s.typeText, { color: tColor }]}>{player.scholarshipType}</Text>
          </View>
          {/* Amount */}
          <Text style={[s.amountText, { color: C.label }]}>
            {player.amount > 0 ? fmt(player.amount) + '/yr' : 'No grant'}
          </Text>
          {/* GPA */}
          <Text style={[s.gpaText, { color: gColor }]}>GPA {player.gpa.toFixed(1)}</Text>
        </View>

        {/* Credit progress */}
        <View style={s.creditRow}>
          <View style={[s.creditTrack, { backgroundColor: C.separator }]}>
            <View style={[s.creditFill, { width: `${creditPct * 100}%` as any, backgroundColor: C.secondary }]} />
          </View>
          <Text style={[s.creditLabel, { color: C.secondary }]}>{player.creditsCompleted}/{player.creditsRequired} cr</Text>
        </View>

        {player.academicStanding !== 'Good' && (
          <View style={[s.standingRow, { backgroundColor: '#B85C5C22' }]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={11} color="#B85C5C" />
            <Text style={[s.standingText, { color: '#B85C5C' }]}>{player.academicStanding}</Text>
          </View>
        )}
      </View>

      <IconSymbol name="chevron.right" size={13} color={C.muted} />
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function ScholarshipsScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = React.useState('All');
  const s = useMemo(() => makeStyles(C), [C]);
  const scrollFooter = useScrollFooter();

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const filtered = useMemo(() => {
    if (activeFilter === 'All') return PLAYERS;
    if (activeFilter === 'At Risk') return PLAYERS.filter(p => p.renewalStatus === 'At Risk' || p.renewalStatus === 'Expired' || p.academicStanding !== 'Good');
    return PLAYERS.filter(p => p.scholarshipType === activeFilter);
  }, [activeFilter]);

  const totalCost = PLAYERS.reduce((sum, p) => sum + p.amount, 0);
  const atRiskCount = PLAYERS.filter(p => p.renewalStatus === 'At Risk' || p.academicStanding !== 'Good').length;

  return (
    <View style={[s.root, { paddingTop: insets.top, backgroundColor: C.bg }]}>
      {/* Top bar */}
      <View style={s.topBar}>
        <Pressable onPress={() => openSidePanel()} hitSlop={8} style={s.topBarSide}>
          <KMenuButton />
        </Pressable>
        <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <Text style={[s.titlePillText, { color: C.label }]}>Scholarships</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Budget overview card */}
      <View style={[s.budgetCard, { backgroundColor: C.label, marginHorizontal: 16 }]}>
        <View style={s.budgetTop}>
          <Text style={s.budgetTitle}>Scholarship Budget</Text>
          <Text style={s.budgetTotal}>{fmt(totalCost)}/yr</Text>
        </View>
        <View style={s.budgetRow}>
          <View style={s.budgetCell}>
            <Text style={s.budgetVal}>{BUDGET.fullUsed}</Text>
            <Text style={s.budgetLbl}>Full ({BUDGET.totalAllotted} max)</Text>
          </View>
          <View style={s.budgetSep} />
          <View style={s.budgetCell}>
            <Text style={s.budgetVal}>{BUDGET.partialUsed}</Text>
            <Text style={s.budgetLbl}>Partial</Text>
          </View>
          <View style={s.budgetSep} />
          <View style={s.budgetCell}>
            <Text style={[s.budgetVal, { color: atRiskCount > 0 ? '#B85C5C' : '#5A8A6E' }]}>{atRiskCount}</Text>
            <Text style={s.budgetLbl}>At Risk</Text>
          </View>
          <View style={s.budgetSep} />
          <View style={s.budgetCell}>
            <Text style={s.budgetVal}>{BUDGET.totalAllotted - BUDGET.fullUsed}</Text>
            <Text style={s.budgetLbl}>Available</Text>
          </View>
        </View>
        {/* Usage bar */}
        <View style={s.usageBarTrack}>
          <View style={[s.usageBarFull, { width: `${(BUDGET.fullUsed / BUDGET.totalAllotted) * 100}%` as any }]} />
          <View style={[s.usageBarPartial, { width: `${(BUDGET.partialUsed / BUDGET.totalAllotted) * 100}%` as any }]} />
        </View>
        <View style={s.usageLegend}>
          <View style={s.legendItem}>
            <View style={[s.legendDot, { backgroundColor: '#F0E8DC' }]} />
            <Text style={s.legendText}>Full</Text>
          </View>
          <View style={s.legendItem}>
            <View style={[s.legendDot, { backgroundColor: '#8A837C' }]} />
            <Text style={s.legendText}>Partial</Text>
          </View>
          <View style={s.legendItem}>
            <View style={[s.legendDot, { backgroundColor: '#3D352E' }]} />
            <Text style={s.legendText}>Open</Text>
          </View>
        </View>
      </View>

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterRow}
        style={[s.filterBar, { marginTop: 12 }]}
      >
        {STATUS_FILTERS.map(f => {
          const active = activeFilter === f;
          return (
            <Pressable
              key={f}
              onPress={() => { Haptics.selectionAsync(); setActiveFilter(f); }}
              style={[s.filterPill, active ? { backgroundColor: C.activePill } : { backgroundColor: C.surface, borderColor: C.separator }]}
            >
              <Text style={[s.filterPillText, { color: active ? C.activePillText : C.secondary }]}>{f}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Player list */}
      <ScrollView
        {...scrollFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.listContent, { paddingBottom: insets.bottom + 24 }]}
      >
        {filtered.map(player => (
          <PlayerScholarshipCard key={player.id} player={player} C={C} s={s} />
        ))}
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  topBarSide: { width: 44, alignItems: 'center', justifyContent: 'center' },
  titlePill: { flex: 1, marginHorizontal: 10, height: 32, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  titlePillText: { fontSize: 14, fontWeight: '700', letterSpacing: 0.1 },

  budgetCard: { borderRadius: 14, padding: 14, marginBottom: 4 },
  budgetTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  budgetTitle: { fontSize: 11, fontWeight: '600', color: '#9C9790', letterSpacing: 0.8, textTransform: 'uppercase' },
  budgetTotal: { fontSize: 18, fontWeight: '700', color: '#F0E8DC' },
  budgetRow: { flexDirection: 'row', marginBottom: 10 },
  budgetCell: { flex: 1, alignItems: 'center' },
  budgetVal: { fontSize: 20, fontWeight: '700', color: '#F0E8DC' },
  budgetLbl: { fontSize: 9, fontWeight: '500', color: '#8A837C', marginTop: 2, textAlign: 'center' },
  budgetSep: { width: StyleSheet.hairlineWidth, backgroundColor: '#3D352E', marginVertical: 4 },

  usageBarTrack: { height: 6, borderRadius: 3, backgroundColor: '#3D352E', flexDirection: 'row', overflow: 'hidden', marginBottom: 6 },
  usageBarFull: { height: 6, backgroundColor: '#F0E8DC' },
  usageBarPartial: { height: 6, backgroundColor: '#8A837C' },
  usageLegend: { flexDirection: 'row', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: '#8A837C' },

  filterBar: { maxHeight: 44 },
  filterRow: { paddingHorizontal: 16, gap: 8, paddingVertical: 8, alignItems: 'center' },
  filterPill: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  filterPillText: { fontSize: 13, fontWeight: '500' },

  listContent: { paddingTop: 8, paddingHorizontal: 16 },

  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: 12, marginBottom: 8, gap: 10, overflow: 'hidden' },
  stripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginLeft: 4 },
  avatarText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  body: { flex: 1, gap: 3 },
  bodyTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  playerName: { flex: 1, fontSize: 14, fontWeight: '600' },
  renewalChip: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  renewalText: { fontSize: 10, fontWeight: '600' },
  metaLine: { fontSize: 11 },
  dataRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  typeChip: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  typeText: { fontSize: 10, fontWeight: '600' },
  amountText: { fontSize: 12, fontWeight: '600' },
  gpaText: { fontSize: 12, fontWeight: '600' },
  creditRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  creditTrack: { flex: 1, height: 3, borderRadius: 2, overflow: 'hidden' },
  creditFill: { height: 3, borderRadius: 2 },
  creditLabel: { fontSize: 10 },
  standingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start', marginTop: 2 },
  standingText: { fontSize: 10, fontWeight: '600' },
});
