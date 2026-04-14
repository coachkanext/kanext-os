import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { resetFooter } from '@/utils/global-footer-hide';
import { useScrollFooter } from '@/hooks/use-scroll-footer';
import { useScrollHeader } from '@/hooks/use-scroll-header';

// ---------------------------------------------------------------------------
// Types & mock data
// ---------------------------------------------------------------------------

type HealthStatus = 'Active' | 'Limited' | 'Day-To-Day' | 'Out' | 'IR';
type InjuryType = 'Sprain' | 'Strain' | 'Fracture' | 'Concussion' | 'Soreness' | 'Illness' | 'Surgery';

interface InjuryRecord {
  type: InjuryType;
  location: string;
  date: string;
  returnDate?: string;
  notes: string;
}

interface MedicalPlayer {
  id: string;
  name: string;
  initials: string;
  number: string;
  position: string;
  year: string;
  status: HealthStatus;
  currentInjury?: InjuryRecord;
  history: InjuryRecord[];
  hue: string;
  practiceRestrictions?: string;
  gameRestrictions?: string;
}

const PLAYERS: MedicalPlayer[] = [
  {
    id: 'p1', name: 'Marcus Jordan',   initials: 'MJ', number: '3',  position: 'PG', year: 'Jr', status: 'Active',
    history: [], hue: '#8B7355',
  },
  {
    id: 'p2', name: 'Devon Clarke',    initials: 'DC', number: '11', position: 'SG', year: 'So', status: 'Limited',
    currentInjury: { type: 'Sprain', location: 'Right Ankle', date: 'Apr 3', notes: 'Grade 1 lateral sprain. Day-to-day status.' },
    practiceRestrictions: 'No full-court sprints',
    history: [
      { type: 'Strain', location: 'Left Hamstring', date: 'Nov 12', returnDate: 'Nov 19', notes: 'Minor strain, returned in 1 week.' },
    ],
    hue: '#6B8C7A',
  },
  {
    id: 'p3', name: 'Laolu Adeyemi',   initials: 'LA', number: '24', position: 'SF', year: 'Jr', status: 'Out',
    currentInjury: { type: 'Fracture', location: 'Left Hand (4th metacarpal)', date: 'Mar 28', returnDate: 'May 5', notes: 'Non-displaced fracture. Cleared for lower body work. Hand/wrist in splint.' },
    practiceRestrictions: 'Lower body only',
    gameRestrictions: 'Full game restriction through May 5',
    history: [
      { type: 'Sprain', location: 'Left Knee', date: 'Oct 8', returnDate: 'Oct 15', notes: 'Grade 1 MCL. Returned full practice Oct 15.' },
    ],
    hue: '#7A6B8C',
  },
  {
    id: 'p4', name: 'Terrell Washington', initials: 'TW', number: '5', position: 'PF', year: 'Sr', status: 'Active',
    history: [
      { type: 'Surgery', location: 'Right Knee (ACL)', date: 'Apr 2024', returnDate: 'Nov 2024', notes: 'Full ACL reconstruction. Cleared for full activity Nov 2024.' },
    ],
    hue: '#8C6B6B',
  },
  {
    id: 'p5', name: 'Isaiah Brooks',   initials: 'IB', number: '32', position: 'C',  year: 'Fr', status: 'Day-To-Day',
    currentInjury: { type: 'Soreness', location: 'Lower Back', date: 'Apr 8', notes: 'Reported lower back tightness after practice. Monitoring.' },
    practiceRestrictions: 'Limited contact',
    history: [],
    hue: '#6B7A8C',
  },
  {
    id: 'p6', name: 'Darius Reed',     initials: 'DR', number: '2',  position: 'PG', year: 'So', status: 'Active',
    history: [], hue: '#8C7A6B',
  },
  {
    id: 'p7', name: 'Brandon Scott',   initials: 'BS', number: '14', position: 'SG', year: 'Jr', status: 'IR',
    currentInjury: { type: 'Surgery', location: 'Left Shoulder (labrum)', date: 'Feb 10', returnDate: 'Aug 2026', notes: 'Labrum repair surgery Feb 10. Season-ending. Rehab on schedule.' },
    gameRestrictions: 'Season-ending injury. Not available.',
    history: [
      { type: 'Strain', location: 'Left Shoulder', date: 'Jan 22', returnDate: 'Jan 28', notes: 'Initial strain that led to surgery diagnosis.' },
    ],
    hue: '#6B8C8C',
  },
  {
    id: 'p8', name: 'Quincy Miles',    initials: 'QM', number: '21', position: 'SF', year: 'Sr', status: 'Active',
    history: [
      { type: 'Concussion', location: 'Head', date: 'Dec 5', returnDate: 'Dec 19', notes: 'Protocol completed. Full clearance Dec 19.' },
    ],
    hue: '#8C8C6B',
  },
  {
    id: 'p9', name: 'Malik Turner',    initials: 'MT', number: '44', position: 'PF', year: 'Fr', status: 'Active',
    history: [], hue: '#7A8C6B',
  },
  {
    id: 'p10', name: 'Chris Okafor',   initials: 'CO', number: '55', position: 'C',  year: 'So', status: 'Illness',
    currentInjury: { type: 'Illness', location: '', date: 'Apr 9', notes: 'Upper respiratory illness. Missed practice Apr 9. Monitoring.' },
    practiceRestrictions: 'Day off — illness protocol',
    history: [], hue: '#8C6B7A',
  } as any,
];

const STATUS_FILTERS: Array<HealthStatus | 'All'> = ['All', 'Active', 'Limited', 'Day-To-Day', 'Out', 'IR'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function statusColor(status: HealthStatus): string {
  switch (status) {
    case 'Active':    return '#5A8A6E';
    case 'Limited':   return '#B8943E';
    case 'Day-To-Day':return '#B8943E';
    case 'Out':       return '#B85C5C';
    case 'IR':        return '#B85C5C';
    default:          return '#B8943E';
  }
}

function statusIcon(status: HealthStatus): string {
  switch (status) {
    case 'Active':    return 'checkmark.circle.fill';
    case 'Limited':   return 'exclamationmark.circle.fill';
    case 'Day-To-Day':return 'clock.fill';
    case 'Out':       return 'xmark.circle.fill';
    case 'IR':        return 'bandage.fill';
    default:          return 'questionmark.circle.fill';
  }
}

// ---------------------------------------------------------------------------
// MedicalCard
// ---------------------------------------------------------------------------

function MedicalCard({
  player, C, s,
}: {
  player: MedicalPlayer; C: ComponentColors; s: ReturnType<typeof makeStyles>;
}) {
  const sColor = statusColor(player.status);
  const sIcon = statusIcon(player.status);
  const hasInjury = !!player.currentInjury;

  return (
    <Pressable
      onPress={() => Haptics.selectionAsync()}
      style={({ pressed }) => [
        s.card,
        { backgroundColor: pressed ? C.surfacePressed : C.surface, borderColor: C.separator },
        hasInjury && { borderColor: sColor + '55' },
      ]}
    >
      {/* Status stripe */}
      <View style={[s.stripe, { backgroundColor: sColor }]} />

      {/* Avatar */}
      <View style={[s.avatar, { backgroundColor: player.hue }]}>
        <Text style={s.avatarText}>{player.initials}</Text>
      </View>

      {/* Body */}
      <View style={s.body}>
        <View style={s.bodyTop}>
          <Text style={[s.playerName, { color: C.label }]} numberOfLines={1}>{player.name}</Text>
          <View style={[s.statusChip, { backgroundColor: sColor + '22' }]}>
            <IconSymbol name={sIcon} size={11} color={sColor} />
            <Text style={[s.statusText, { color: sColor }]}>{player.status}</Text>
          </View>
        </View>

        <Text style={[s.metaLine, { color: C.secondary }]}>#{player.number} · {player.position} · {player.year}</Text>

        {hasInjury && player.currentInjury && (
          <View style={[s.injuryBlock, { backgroundColor: C.bg }]}>
            <Text style={[s.injuryType, { color: C.label }]}>
              {player.currentInjury.type}{player.currentInjury.location ? ` — ${player.currentInjury.location}` : ''}
            </Text>
            <Text style={[s.injuryDate, { color: C.secondary }]}>
              Onset: {player.currentInjury.date}
              {player.currentInjury.returnDate ? `  ·  Est. return: ${player.currentInjury.returnDate}` : ''}
            </Text>
            <Text style={[s.injuryNotes, { color: C.secondary }]} numberOfLines={2}>{player.currentInjury.notes}</Text>
          </View>
        )}

        {(player.practiceRestrictions || player.gameRestrictions) && (
          <View style={s.restrictionsRow}>
            {player.practiceRestrictions && (
              <View style={[s.restrictionChip, { backgroundColor: '#B8943E22' }]}>
                <Text style={[s.restrictionText, { color: '#B8943E' }]}>P: {player.practiceRestrictions}</Text>
              </View>
            )}
            {player.gameRestrictions && (
              <View style={[s.restrictionChip, { backgroundColor: '#B85C5C22' }]}>
                <Text style={[s.restrictionText, { color: '#B85C5C' }]}>G: {player.gameRestrictions}</Text>
              </View>
            )}
          </View>
        )}

        {!hasInjury && player.history.length > 0 && (
          <Text style={[s.historyNote, { color: C.secondary }]}>
            {player.history.length} prior {player.history.length === 1 ? 'injury' : 'injuries'} on record
          </Text>
        )}
      </View>

      <IconSymbol name="chevron.right" size={13} color={C.muted} />
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function MedicalScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = React.useState<HealthStatus | 'All'>('All');
  const s = useMemo(() => makeStyles(C), [C]);
  const scrollFooter = useScrollFooter();
  const TOP_BAR_H = 52;
  const topBarH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(topBarH);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const filtered = useMemo(() => {
    if (activeFilter === 'All') return PLAYERS;
    return PLAYERS.filter(p => p.status === activeFilter);
  }, [activeFilter]);

  const activeCount     = PLAYERS.filter(p => p.status === 'Active').length;
  const limitedCount    = PLAYERS.filter(p => p.status === 'Limited' || p.status === 'Day-To-Day').length;
  const outCount        = PLAYERS.filter(p => p.status === 'Out' || p.status === 'IR').length;

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top bar */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, opacity }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => openSidePanel()} hitSlop={8} style={s.topBarSide}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Medical</Text>
            </View>
          </View>
          <View style={{ width: 44 }} />
        </View>
      </Animated.View>

      {/* Health status strip */}
      <View style={[s.statsStrip, { backgroundColor: C.surface, borderColor: C.separator, marginTop: topBarH }]}>
        <View style={s.statCell}>
          <Text style={[s.statVal, { color: '#5A8A6E' }]}>{activeCount}</Text>
          <Text style={[s.statLabel, { color: C.secondary }]}>Active</Text>
        </View>
        <View style={[s.statDivider, { backgroundColor: C.separator }]} />
        <View style={s.statCell}>
          <Text style={[s.statVal, { color: '#B8943E' }]}>{limitedCount}</Text>
          <Text style={[s.statLabel, { color: C.secondary }]}>Limited</Text>
        </View>
        <View style={[s.statDivider, { backgroundColor: C.separator }]} />
        <View style={s.statCell}>
          <Text style={[s.statVal, { color: '#B85C5C' }]}>{outCount}</Text>
          <Text style={[s.statLabel, { color: C.secondary }]}>Out / IR</Text>
        </View>
        <View style={[s.statDivider, { backgroundColor: C.separator }]} />
        <View style={s.statCell}>
          <Text style={[s.statVal, { color: C.label }]}>{PLAYERS.length}</Text>
          <Text style={[s.statLabel, { color: C.secondary }]}>Total</Text>
        </View>
      </View>

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterRow}
        style={s.filterBar}
      >
        {STATUS_FILTERS.map(f => {
          const active = activeFilter === f;
          const fColor = f === 'All' ? undefined : statusColor(f as HealthStatus);
          return (
            <Pressable
              key={f}
              onPress={() => { Haptics.selectionAsync(); setActiveFilter(f as any); }}
              style={[
                s.filterPill,
                active
                  ? { backgroundColor: C.activePill }
                  : { backgroundColor: C.surface, borderColor: C.separator },
              ]}
            >
              {f !== 'All' && !active && fColor && (
                <View style={[s.filterDot, { backgroundColor: fColor }]} />
              )}
              <Text style={[s.filterPillText, { color: active ? C.activePillText : C.secondary }]}>{f}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Confidential notice */}
      <View style={[s.confidentialBanner, { backgroundColor: C.surface, borderColor: C.separator }]}>
        <IconSymbol name="lock.fill" size={11} color={C.secondary} />
        <Text style={[s.confidentialText, { color: C.secondary }]}>
          Medical records are confidential — visible to coaching staff only
        </Text>
      </View>

      {/* Player list */}
      <ScrollView
        {...scrollFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.listContent, { paddingBottom: insets.bottom + 24 }]}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {filtered.length === 0 ? (
          <View style={s.emptyState}>
            <IconSymbol name="checkmark.shield.fill" size={32} color={C.secondary} />
            <Text style={[s.emptyText, { color: C.secondary }]}>No players with {activeFilter} status</Text>
          </View>
        ) : (
          filtered.map(player => (
            <MedicalCard key={player.id} player={player} C={C} s={s} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 10 },
  topBarSide: { width: 44, alignItems: 'center', justifyContent: 'center' },
  titlePill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },

  statsStrip: { flexDirection: 'row', alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 12 },
  statCell: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 10, fontWeight: '500', marginTop: 2 },
  statDivider: { width: StyleSheet.hairlineWidth, height: 28 },

  filterBar: { maxHeight: 44 },
  filterRow: { paddingHorizontal: 16, gap: 8, paddingVertical: 8, alignItems: 'center' },
  filterPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  filterDot: { width: 7, height: 7, borderRadius: 3.5 },
  filterPillText: { fontSize: 13, fontWeight: '500' },

  confidentialBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 16, marginBottom: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth },
  confidentialText: { fontSize: 11 },

  listContent: { paddingTop: 8, paddingHorizontal: 16 },

  card: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: 12, marginBottom: 8, gap: 10, overflow: 'hidden' },
  stripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginLeft: 4, marginTop: 2 },
  avatarText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  body: { flex: 1, gap: 3 },
  bodyTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  playerName: { flex: 1, fontSize: 14, fontWeight: '600' },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '700' },
  metaLine: { fontSize: 11 },

  injuryBlock: { borderRadius: 8, padding: 8, marginTop: 4, gap: 2 },
  injuryType: { fontSize: 12, fontWeight: '600' },
  injuryDate: { fontSize: 11 },
  injuryNotes: { fontSize: 11, fontStyle: 'italic' },

  restrictionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  restrictionChip: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  restrictionText: { fontSize: 10, fontWeight: '500' },

  historyNote: { fontSize: 11, fontStyle: 'italic', marginTop: 2 },

  emptyState: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyText: { fontSize: 14 },
});
