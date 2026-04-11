/**
 * Roster Screen — Sports Mode · LU Men's Basketball
 * NBA 2K-style roster — no tabs in the screen (navigation via side panel)
 * Roles: Coach (full data) / Player (public bio + basic stats only)
 */

import React, { useState, useMemo, useCallback, useRef, Alert } from 'react';
import {
  View, Text, Pressable, ScrollView, TextInput,
  StyleSheet, Alert as RNAlert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol }  from '@/components/ui/icon-symbol';
import { RolePill }    from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useDemoRole } from '@/utils/demo-role-store';
import { resetFooter, hideFooter, showFooter } from '@/utils/global-footer-hide';
import { openSidePanel } from '@/utils/global-side-panel';
import { KMenuButton } from '@/components/ui/k-menu-button';
import {
  PLAYERS, TEAM_INFO, TEAM_KR, rosterHealthSummary, krTierColor,
  type Player,
} from '@/data/mock-sports-hub';

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_BAR_H = 52;
const DARK_CARD = '#1A1714';
const GAIN      = '#5A8A6E';
const HEAT      = '#B85C5C';
const CAUTION   = '#B8943E';

const MY_PLAYER_ID = 'p01'; // Marcus Reed — the "logged in" player

type SortKey  = 'KR' | '#' | 'Pos' | 'Name';
type PosFilter = 'All' | 'PG' | 'SG' | 'SF' | 'PF' | 'C';

const POS_FILTERS: PosFilter[] = ['All', 'PG', 'SG', 'SF', 'PF', 'C'];
const SORT_KEYS: SortKey[]     = ['KR', '#', 'Pos', 'Name'];

// ── KR color helper ───────────────────────────────────────────────────────────

function krColor(kr: number): string {
  if (kr >= 80) return CAUTION; // gold
  if (kr >= 75) return GAIN;    // green
  if (kr >= 65) return '#9C9790'; // neutral
  return HEAT;                  // red
}

function krBorderColor(kr: number): string {
  return krColor(kr);
}

// ── Medical / eligibility helpers ─────────────────────────────────────────────

function medDotColor(status: Player['medical']): string {
  if (status === 'available') return GAIN;
  if (status === 'limited')   return CAUTION;
  return HEAT;
}

function eligDotColor(status: Player['eligibility']): string {
  if (status === 'eligible')   return GAIN;
  if (status === 'warning')    return CAUTION;
  return HEAT;
}

// ── Position Badge ─────────────────────────────────────────────────────────────

function PosBadge({ pos, C }: { pos: string; C: ComponentColors }) {
  return (
    <View style={[pb.wrap, { backgroundColor: DARK_CARD + '18' }]}>
      <Text style={[pb.text, { color: C.label }]}>{pos}</Text>
    </View>
  );
}
const pb = StyleSheet.create({
  wrap: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  text: { fontSize: 11, fontWeight: '700' },
});

// ── Avatar ────────────────────────────────────────────────────────────────────

function PlayerAvatar({ p, size = 44 }: { p: Player; size?: number }) {
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: `hsl(${p.hue},45%,35%)`,
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ color: '#fff', fontSize: size * 0.32, fontWeight: '700' }}>
        {p.initials}
      </Text>
    </View>
  );
}

// ── Coach Player Card ──────────────────────────────────────────────────────────

function CoachPlayerCard({
  p, onPress, C,
}: { p: Player; onPress: () => void; C: ComponentColors }) {
  const krc    = krColor(p.kr.overall);
  const fitAvg = Math.round((p.systemFitOff + p.systemFitDef) / 2);

  return (
    <Pressable
      style={({ pressed }) => [
        cc.card,
        {
          backgroundColor:  C.surface,
          borderLeftColor:  krBorderColor(p.kr.overall),
          opacity:          pressed ? 0.82 : 1,
        },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <View style={cc.row}>
        {/* LEFT COLUMN */}
        <View style={cc.left}>
          {/* Number + Name */}
          <View style={cc.nameRow}>
            <Text style={[cc.number, { color: C.secondary }]}>#{p.number}</Text>
            <Text style={[cc.name, { color: C.label }]} numberOfLines={1}>
              {p.name}
            </Text>
          </View>

          {/* Position + Class + Height + Weight */}
          <View style={cc.metaRow}>
            <PosBadge pos={p.position} C={C} />
            <View style={[cc.classBadge, { backgroundColor: C.surfacePressed }]}>
              <Text style={[cc.classTxt, { color: C.secondary }]}>{p.classYear}</Text>
            </View>
            <Text style={[cc.metaTxt, { color: C.secondary }]}>{p.heightFt}</Text>
            <Text style={[cc.metaTxt, { color: C.muted }]}>·</Text>
            <Text style={[cc.metaTxt, { color: C.secondary }]}>{p.weight} lbs</Text>
          </View>

          {/* Hometown */}
          <Text style={[cc.hometown, { color: C.muted }]} numberOfLines={1}>
            {p.hometown}
          </Text>

          {/* Archetype */}
          <View style={[cc.archetypeBadge, { backgroundColor: C.surfacePressed }]}>
            <Text style={[cc.archetypeTxt, { color: C.label }]}>{p.archetype}</Text>
          </View>

          {/* Stats row: PPG / RPG / APG */}
          <View style={cc.statsRow}>
            <View style={cc.statItem}>
              <Text style={[cc.statVal, { color: C.label }]}>{p.stats.ppg.toFixed(1)}</Text>
              <Text style={[cc.statLbl, { color: C.muted }]}>PPG</Text>
            </View>
            <Text style={[cc.statSep, { color: C.separator }]}>/</Text>
            <View style={cc.statItem}>
              <Text style={[cc.statVal, { color: C.label }]}>{p.stats.rpg.toFixed(1)}</Text>
              <Text style={[cc.statLbl, { color: C.muted }]}>RPG</Text>
            </View>
            <Text style={[cc.statSep, { color: C.separator }]}>/</Text>
            <View style={cc.statItem}>
              <Text style={[cc.statVal, { color: C.label }]}>{p.stats.apg.toFixed(1)}</Text>
              <Text style={[cc.statLbl, { color: C.muted }]}>APG</Text>
            </View>
          </View>
        </View>

        {/* RIGHT COLUMN */}
        <View style={cc.right}>
          {/* KR circle */}
          <View style={[cc.krCircle, { backgroundColor: krc + '26', borderColor: krc }]}>
            <Text style={[cc.krNum, { color: krc }]}>{Math.round(p.kr.overall)}</Text>
          </View>
          <Text style={[cc.krLabel, { color: C.muted }]}>KR</Text>

          {/* System fit */}
          <Text style={[cc.fitTxt, { color: C.secondary }]}>{fitAvg}% fit</Text>

          {/* Status dots row */}
          <View style={cc.dotsRow}>
            <View style={[cc.dot, { backgroundColor: eligDotColor(p.eligibility) }]} />
            <View style={[cc.dot, { backgroundColor: medDotColor(p.medical) }]} />
            {p.isScholarship && (
              <Text style={[cc.scholTxt, { color: C.muted }]}>S</Text>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const cc = StyleSheet.create({
  card:          { borderRadius: 16, marginHorizontal: 14, marginBottom: 10, padding: 14, borderLeftWidth: 4 },
  row:           { flexDirection: 'row', gap: 12 },
  left:          { flex: 1, gap: 5 },
  right:         { width: 80, alignItems: 'center', gap: 4 },
  nameRow:       { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  number:        { fontSize: 11, fontWeight: '700' },
  name:          { fontSize: 16, fontWeight: '800', flexShrink: 1 },
  metaRow:       { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' },
  classBadge:    { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  classTxt:      { fontSize: 11, fontWeight: '600' },
  metaTxt:       { fontSize: 12 },
  hometown:      { fontSize: 11, marginTop: 1 },
  archetypeBadge:{ alignSelf: 'flex-start', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, marginTop: 2 },
  archetypeTxt:  { fontSize: 11, fontWeight: '500' },
  statsRow:      { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  statItem:      { alignItems: 'center' },
  statVal:       { fontSize: 14, fontWeight: '800' },
  statLbl:       { fontSize: 9, fontWeight: '600', marginTop: 1 },
  statSep:       { fontSize: 12, marginHorizontal: 2 },
  krCircle:      { width: 64, height: 64, borderRadius: 32, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  krNum:         { fontSize: 22, fontWeight: '900' },
  krLabel:       { fontSize: 9, fontWeight: '700' },
  fitTxt:        { fontSize: 10 },
  dotsRow:       { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  dot:           { width: 6, height: 6, borderRadius: 3 },
  scholTxt:      { fontSize: 9, fontWeight: '700' },
});

// ── Player Public Card (Player role view) ─────────────────────────────────────

function PublicPlayerCard({
  p, onPress, C, isMe,
}: { p: Player; onPress: () => void; C: ComponentColors; isMe?: boolean }) {
  return (
    <Pressable
      style={({ pressed }) => [
        pc.card,
        { backgroundColor: C.surface, opacity: pressed ? 0.82 : 1 },
        isMe && { borderColor: C.separator, borderWidth: 1.5 },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <View style={pc.row}>
        <PlayerAvatar p={p} size={44} />
        <View style={pc.info}>
          <View style={pc.nameRow}>
            <Text style={[pc.num, { color: C.secondary }]}>#{p.number}</Text>
            <Text style={[pc.name, { color: C.label }]} numberOfLines={1}>{p.name}</Text>
            {isMe && (
              <View style={[pc.meBadge, { backgroundColor: C.activePill }]}>
                <Text style={[pc.meTxt, { color: C.activePillText }]}>Me</Text>
              </View>
            )}
          </View>
          <View style={pc.metaRow}>
            <PosBadge pos={p.position} C={C} />
            <Text style={[pc.meta, { color: C.secondary }]}>{p.classYear}</Text>
            <Text style={[pc.meta, { color: C.muted }]}>·</Text>
            <Text style={[pc.meta, { color: C.secondary }]}>{p.heightFt}</Text>
            <Text style={[pc.meta, { color: C.muted }]}>·</Text>
            <Text style={[pc.meta, { color: C.secondary }]}>{p.weight} lbs</Text>
          </View>
          <Text style={[pc.hometown, { color: C.muted }]} numberOfLines={1}>{p.hometown}</Text>
        </View>
        <IconSymbol name="chevron.right" size={14} color={C.muted} />
      </View>
    </Pressable>
  );
}

const pc = StyleSheet.create({
  card:    { borderRadius: 16, marginHorizontal: 14, marginBottom: 8, padding: 14 },
  row:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  info:    { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  num:     { fontSize: 11, fontWeight: '700' },
  name:    { fontSize: 15, fontWeight: '700', flexShrink: 1 },
  meBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  meTxt:   { fontSize: 10, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  meta:    { fontSize: 12 },
  hometown:{ fontSize: 11 },
});

// ── Main Screen ────────────────────────────────────────────────────────────────

export default function RosterScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [role, cycleRole, roleCycles] = useDemoRole('sports:roster');
  const isCoach = role === roleCycles[0]; // 'Coach'

  // ── State ──
  const [search,    setSearch]    = useState('');
  const [sort,      setSort]      = useState<SortKey>('KR');
  const [posFilter, setPosFilter] = useState<PosFilter>('All');
  const [sortDD,    setSortDD]    = useState(false);

  // ── Scroll footer control ──
  const lastScrollY = useRef(0);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10)      hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  // ── Sorted & filtered players ──
  const sorted = useMemo(() => {
    let list = PLAYERS.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (posFilter === 'All' || p.position === posFilter)
    );
    if (sort === 'KR')   list = [...list].sort((a, b) => b.kr.overall - a.kr.overall);
    if (sort === '#')    list = [...list].sort((a, b) => a.number - b.number);
    if (sort === 'Pos')  list = [...list].sort((a, b) => a.position.localeCompare(b.position));
    if (sort === 'Name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [search, sort, posFilter]);

  // ── Roster stats ──
  const scholarship  = PLAYERS.filter(p => p.isScholarship).length;
  const walkOn       = PLAYERS.filter(p => !p.isScholarship && !p.isRedshirt).length;
  const redshirts    = PLAYERS.filter(p => p.isRedshirt).length;
  const health       = rosterHealthSummary();

  // ── Layout ──
  const topBarH  = insets.top + TOP_BAR_H;
  const scrollPB = insets.bottom + 80; // extra clearance above universal footer

  // ── Navigate to player profile ──
  const goToPlayer = useCallback((playerId: string, publicView?: boolean) => {
    router.push({
      pathname: '/(tabs)/(main)/roster/player-profile' as any,
      params: { playerId, ...(publicView ? { publicView: 'true' } : {}) },
    });
  }, [router]);

  const goToMyProfile = useCallback(() => {
    router.push({ pathname: '/(tabs)/(main)/roster/my-profile' as any });
  }, [router]);

  // ── Render: Coach View ─────────────────────────────────────────────────────

  const renderCoachView = () => (
    <ScrollView
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingTop: topBarH, paddingBottom: scrollPB }}
    >
      {/* Team Header Card */}
      <View style={[th.card, { backgroundColor: DARK_CARD }]}>
        {/* Row 1: Team name + GAAC badge */}
        <View style={th.row1}>
          <Text style={th.teamName} numberOfLines={1}>LU Oaklanders Basketball</Text>
          <View style={th.confBadge}>
            <Text style={th.confText}>{TEAM_INFO.conference}</Text>
          </View>
        </View>

        {/* Row 2: Record + conf record + standing */}
        <View style={th.row2}>
          <Text style={th.record}>{TEAM_INFO.record}</Text>
          <View style={th.sep} />
          <Text style={[th.confRec, { color: '#F0E8DC99' }]}>{TEAM_INFO.conferenceRec} {TEAM_INFO.conference}</Text>
          <View style={th.sep} />
          <Text style={[th.standing, { color: GAIN }]}>{TEAM_INFO.confStanding}</Text>
        </View>

        {/* Row 3: Team KR + System Fit */}
        <View style={th.row3}>
          <View style={th.statBlock}>
            <Text style={[th.statBig, { color: CAUTION }]}>{Math.round(TEAM_KR.overall)}</Text>
            <Text style={th.statLbl}>TEAM KR</Text>
          </View>
          <View style={th.statDivider} />
          <View style={th.statBlock}>
            <Text style={[th.statBig, { color: GAIN }]}>94%</Text>
            <Text style={th.statLbl}>SYS FIT</Text>
          </View>
        </View>
      </View>

      {/* Roster Stats Strip */}
      <View style={[rs.strip, { backgroundColor: C.surface }]}>
        {/* Scholarship pills */}
        <View style={rs.pillRow}>
          <View style={[rs.pill, { backgroundColor: C.surfacePressed }]}>
            <Text style={[rs.pillTxt, { color: C.label }]}>{scholarship} Scholarship</Text>
          </View>
          <View style={[rs.pill, { backgroundColor: C.surfacePressed }]}>
            <Text style={[rs.pillTxt, { color: C.label }]}>{walkOn} Walk-On</Text>
          </View>
          <View style={[rs.pill, { backgroundColor: C.surfacePressed }]}>
            <Text style={[rs.pillTxt, { color: C.label }]}>{redshirts} Redshirt</Text>
          </View>
        </View>

        {/* Health row */}
        <View style={rs.healthRow}>
          <View style={rs.healthItem}>
            <View style={[rs.healthDot, { backgroundColor: GAIN }]} />
            <Text style={[rs.healthTxt, { color: GAIN }]}>Available {health.available}</Text>
          </View>
          <View style={rs.healthItem}>
            <View style={[rs.healthDot, { backgroundColor: CAUTION }]} />
            <Text style={[rs.healthTxt, { color: CAUTION }]}>Limited {health.limited}</Text>
          </View>
          <View style={rs.healthItem}>
            <View style={[rs.healthDot, { backgroundColor: HEAT }]} />
            <Text style={[rs.healthTxt, { color: HEAT }]}>Out {health.out}</Text>
          </View>
        </View>
      </View>

      {/* Search + Sort row */}
      <View style={ss.row}>
        {/* Search bar */}
        <View style={[ss.searchBar, { backgroundColor: C.surface }]}>
          <IconSymbol name="magnifyingglass" size={15} color={C.muted} />
          <TextInput
            style={[ss.input, { color: C.label }]}
            placeholder="Search players..."
            placeholderTextColor={C.muted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={10}>
              <IconSymbol name="xmark.circle.fill" size={15} color={C.muted} />
            </Pressable>
          )}
        </View>

        {/* Sort dropdown pill */}
        <Pressable
          style={[ss.sortPill, { backgroundColor: C.surface }]}
          onPress={() => {
            Haptics.selectionAsync();
            // Cycle through sort keys on each tap
            const idx  = SORT_KEYS.indexOf(sort);
            const next = SORT_KEYS[(idx + 1) % SORT_KEYS.length];
            setSort(next);
          }}
        >
          <Text style={[ss.sortTxt, { color: C.label }]}>{sort}</Text>
          <IconSymbol name="chevron.down" size={11} color={C.secondary} />
        </Pressable>
      </View>

      {/* Position filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={pf.content}
        style={pf.scroll}
      >
        {POS_FILTERS.map(pos => {
          const active = pos === posFilter;
          return (
            <Pressable
              key={pos}
              style={[
                pf.pill,
                active
                  ? { backgroundColor: C.activePill }
                  : { backgroundColor: C.surface },
              ]}
              onPress={() => { Haptics.selectionAsync(); setPosFilter(pos); }}
            >
              <Text style={[pf.txt, { color: active ? C.activePillText : C.secondary }]}>
                {pos}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Player cards */}
      <View style={{ marginTop: 4 }}>
        {sorted.map(p => (
          <CoachPlayerCard
            key={p.id}
            p={p}
            C={C}
            onPress={() => goToPlayer(p.id)}
          />
        ))}
        {sorted.length === 0 && (
          <View style={empty.wrap}>
            <IconSymbol name="person.slash" size={32} color={C.muted} />
            <Text style={[empty.txt, { color: C.muted }]}>No players found</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  // ── Render: Player View ────────────────────────────────────────────────────

  const renderPlayerView = () => (
    <ScrollView
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: topBarH, paddingBottom: scrollPB }}
    >
      {/* My Profile button */}
      <Pressable
        style={({ pressed }) => [
          mp.card,
          { backgroundColor: DARK_CARD, opacity: pressed ? 0.82 : 1 },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          goToMyProfile();
        }}
      >
        <Text style={mp.txt}>View My Profile</Text>
        <IconSymbol name="arrow.right" size={14} color="#F0E8DC" />
      </Pressable>

      {/* Teammates list */}
      <Text style={[pl.sectionTitle, { color: C.secondary }]}>TEAMMATES</Text>

      {PLAYERS.map(p => (
        <PublicPlayerCard
          key={p.id}
          p={p}
          C={C}
          isMe={p.id === MY_PLAYER_ID}
          onPress={() => {
            if (p.id === MY_PLAYER_ID) {
              goToMyProfile();
            } else {
              goToPlayer(p.id, true);
            }
          }}
        />
      ))}
    </ScrollView>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      {/* Content */}
      {isCoach ? renderCoachView() : renderPlayerView()}

      {/* Fixed Top Bar */}
      <View style={[s.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg }]}>
        <View style={s.topBar}>
          {/* Left: KMenuButton */}
          <View style={s.topBarSide}>
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
              hitSlop={12}
            >
              <KMenuButton />
            </Pressable>
          </View>

          {/* Center: static "Players" pill (Coach) or "Roster" pill (Player) */}
          <View style={s.centerWrap}>
            <View style={[s.centerPill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.centerPillTxt, { color: C.label }]}>
                {isCoach ? 'Players' : 'Roster'}
              </Text>
            </View>
          </View>

          {/* Right: RolePill */}
          <View style={[s.topBarSide, s.topBarRight]}>
            <RolePill
              role={role}
              onPress={cycleRole}
              accentColor={DARK_CARD}
              isPrimary={isCoach}
            />
          </View>
        </View>
      </View>

      {/* FAB — Coach only */}
      {isCoach && (
        <Pressable
          style={[
            fab.btn,
            {
              backgroundColor: C.label,
              bottom: insets.bottom + 64,
            },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            RNAlert.alert('Add Player', 'Add Player coming soon');
          }}
        >
          <Text style={[fab.icon, { color: C.bg }]}>+</Text>
        </Pressable>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

// Screen shell
const s = StyleSheet.create({
  screen:      { flex: 1 },
  topBarWrap:  { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topBar:      { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide:  { width: 80, justifyContent: 'center' },
  topBarRight: { alignItems: 'flex-end' },
  centerWrap:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centerPill:  { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  centerPillTxt: { fontSize: 14, fontWeight: '700' },
});

// Team header card
const th = StyleSheet.create({
  card:       { backgroundColor: DARK_CARD, borderRadius: 16, marginHorizontal: 14, marginTop: 12, padding: 16, gap: 10 },
  row1:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  teamName:   { fontSize: 16, fontWeight: '800', color: '#F0E8DC', flex: 1, marginRight: 8 },
  confBadge:  { backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7 },
  confText:   { fontSize: 11, fontWeight: '700', color: '#F0E8DC' },
  row2:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  record:     { fontSize: 22, fontWeight: '900', color: '#F0E8DC' },
  sep:        { width: 1, height: 16, backgroundColor: 'rgba(240,232,220,0.25)' },
  confRec:    { fontSize: 13, fontWeight: '600' },
  standing:   { fontSize: 13, fontWeight: '700' },
  row3:       { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statBlock:  { flex: 1, alignItems: 'center', gap: 2 },
  statBig:    { fontSize: 26, fontWeight: '900' },
  statLbl:    { fontSize: 10, fontWeight: '700', color: 'rgba(240,232,220,0.55)', letterSpacing: 0.5 },
  statDivider:{ width: 1, height: 36, backgroundColor: 'rgba(240,232,220,0.18)', marginHorizontal: 12 },
});

// Roster stats strip
const rs = StyleSheet.create({
  strip:      { borderRadius: 12, marginHorizontal: 14, marginTop: 8, padding: 12, gap: 8 },
  pillRow:    { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  pill:       { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  pillTxt:    { fontSize: 12, fontWeight: '600' },
  healthRow:  { flexDirection: 'row', gap: 14, marginTop: 4 },
  healthItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  healthDot:  { width: 6, height: 6, borderRadius: 3 },
  healthTxt:  { fontSize: 12, fontWeight: '600' },
});

// Search + sort row
const ss = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 14, marginTop: 8 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, height: 36, borderRadius: 20 },
  input:     { flex: 1, fontSize: 13 },
  sortPill:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, height: 36, borderRadius: 20 },
  sortTxt:   { fontSize: 13, fontWeight: '700' },
});

// Position filter pills
const pf = StyleSheet.create({
  scroll:   { marginTop: 8 },
  content:  { paddingHorizontal: 14, gap: 8, paddingVertical: 2 },
  pill:     { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  txt:      { fontSize: 13, fontWeight: '600' },
});

// Empty state
const empty = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  txt:  { fontSize: 15 },
});

// My profile banner (Player view)
const mp = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: DARK_CARD, borderRadius: 16, marginHorizontal: 14, marginTop: 12, marginBottom: 4, paddingHorizontal: 16, paddingVertical: 14 },
  txt:  { fontSize: 15, fontWeight: '700', color: '#F0E8DC' },
});

// Player view section label
const pl = StyleSheet.create({
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginHorizontal: 14, marginTop: 16, marginBottom: 8 },
});

// FAB
const fab = StyleSheet.create({
  btn:  { position: 'absolute', right: 20, width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.18, shadowRadius: 6, elevation: 6 },
  icon: { fontSize: 26, fontWeight: '300', lineHeight: 30 },
});
