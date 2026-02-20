/**
 * Competition Dashboard V2
 * - Video Hero with LinearGradient + LIVE badge + play button
 * - Next Event Card (next round from RACE_ROUNDS)
 * - Commerce Row (3 text-stack cards: Tickets, Store, Paddock)
 * - Driver Standings (top 5, team color bars, last race badge)
 * - Team Standings (top 5, color bars, driver count, best position)
 * - Domain Cards (Race Ops, Technical, Entries) — RBAC-gated
 * - 3 commerce bottom sheets
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import {
  COMP_HERO,
  RACE_ROUNDS,
  DRIVER_STANDINGS,
  CONSTRUCTOR_STANDINGS,
  GRID_TEAMS,
  ENTRIES_CONFIRMED,
  COMPLIANCE_DATA,
  MAX_GRID_SIZE,
  STEWARD_PENDING_DECISIONS,
  HOMOLOGATION_DEADLINE,
} from '@/data/mock-competition-home';
import { openDriverCard, openTeamCard } from '@/utils/global-entity-sheets';
import {
  canSeeDashboardSection,
  type CompetitionRoleLens,
} from '@/utils/competition-rbac';
import { CompTicketsSheet } from '@/components/commerce/comp-tickets-sheet';
import { CompStoreSheet } from '@/components/commerce/comp-store-sheet';
import { CompPaddockSheet } from '@/components/commerce/comp-paddock-sheet';

interface Props {
  colors: typeof Colors.light;
  accent: string;
  role?: CompetitionRoleLens;
}

export function CompDashboardV2({ colors, accent, role = 'CO10' }: Props) {
  const nextRound = RACE_ROUNDS.find((r) => r.status === 'next');
  const topDrivers = DRIVER_STANDINGS.slice(0, 5);
  const topTeams = CONSTRUCTOR_STANDINGS.slice(0, 5);
  const upcomingRounds = RACE_ROUNDS.filter((r) => r.status !== 'completed');

  const [ticketsVisible, setTicketsVisible] = useState(false);
  const [storeVisible, setStoreVisible] = useState(false);
  const [paddockVisible, setPaddockVisible] = useState(false);

  // Domain card preview data
  const confirmedEntries = ENTRIES_CONFIRMED.filter((e) => e.status === 'confirmed').length;
  const pendingWildcards = ENTRIES_CONFIRMED.filter(
    (e) => e.type === 'wildcard' && e.status === 'pending',
  ).length;
  const compliancePassed = COMPLIANCE_DATA.filter((c) => c.scrutineering === 'passed').length;
  const complianceTotal = COMPLIANCE_DATA.length;

  const leaderPoints = topDrivers[0]?.points ?? 0;

  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ─── Video Hero ──────────────────────────────────────────── */}
        <View style={styles.heroWrapper}>
          <LinearGradient
            colors={['#1a0a0a', '#0d0d0d', '#000']}
            style={styles.heroGradient}
          >
            <Pressable style={styles.playButton}>
              <IconSymbol name="play.fill" size={28} color="#fff" />
            </Pressable>
            <View style={styles.heroOverlay}>
              {COMP_HERO.isLive && (
                <View style={styles.liveBadge}>
                  <ThemedText style={styles.liveText}>LIVE</ThemedText>
                </View>
              )}
              <ThemedText style={styles.heroTitle}>{COMP_HERO.title}</ThemedText>
              <ThemedText style={styles.heroSubtitle}>{COMP_HERO.subtitle}</ThemedText>
            </View>
          </LinearGradient>
        </View>

        {/* ─── Next Event Card ─────────────────────────────────────── */}
        {nextRound && (
          <View style={[styles.nextEventCard, { backgroundColor: colors.card, borderColor: accent }]}>
            <View style={styles.nextEventHeader}>
              <View style={[styles.roundBadge, { backgroundColor: accent }]}>
                <ThemedText style={styles.roundBadgeText}>R{nextRound.round}</ThemedText>
              </View>
              <View style={[styles.nextLabel, { backgroundColor: accent + '22' }]}>
                <ThemedText style={[styles.nextLabelText, { color: accent }]}>NEXT RACE</ThemedText>
              </View>
            </View>
            <ThemedText style={[styles.nextEventName, { color: colors.text }]}>{nextRound.name}</ThemedText>
            <ThemedText style={[styles.nextEventMeta, { color: colors.textSecondary }]}>
              {nextRound.venue}, {nextRound.city} {'\u00B7'} {nextRound.date}
            </ThemedText>

            <View style={styles.weekendSchedule}>
              <ThemedText style={[styles.weekendRow, { color: colors.textSecondary }]}>
                Fri {nextRound.weekendDates.fri} {'\u00B7'} Practice + Qualifying
              </ThemedText>
              <ThemedText style={[styles.weekendRow, { color: colors.textSecondary }]}>
                Sat {nextRound.weekendDates.sat} {'\u00B7'} Wildcard Heats + Finals
              </ThemedText>
              <ThemedText style={[styles.weekendRow, { color: colors.textSecondary }]}>
                Sun {nextRound.weekendDates.sun} {'\u00B7'} K-1 Grand Prix
              </ThemedText>
            </View>

            {nextRound.defendingWinner && (
              <Pressable
                style={styles.defendingRow}
                onPress={() =>
                  openDriverCard({ name: nextRound.defendingWinner!, number: '', team: '' })
                }
              >
                <ThemedText style={[styles.defendingLabel, { color: colors.textSecondary }]}>
                  Defending Winner
                </ThemedText>
                <ThemedText style={[styles.defendingName, { color: accent }]}>
                  {nextRound.defendingWinner}
                </ThemedText>
              </Pressable>
            )}
          </View>
        )}

        {/* ─── Commerce Row (Text-Stack Cards) ─────────────────────── */}
        <View style={styles.commerceRow}>
          <Pressable
            style={[styles.commerceCard, { backgroundColor: colors.card, borderTopColor: accent }]}
            onPress={() => setTicketsVisible(true)}
          >
            <ThemedText style={[styles.commerceCardTitle, { color: colors.text }]}>Tickets</ThemedText>
            <ThemedText style={[styles.commerceCardSub, { color: colors.textSecondary }]} numberOfLines={1}>
              {nextRound ? nextRound.name : 'Next race'} {'\u00B7'} {nextRound?.date ?? ''}
            </ThemedText>
            <ThemedText style={[styles.commerceCardMeta, { color: colors.textTertiary }]}>
              {upcomingRounds.length} round{upcomingRounds.length !== 1 ? 's' : ''} remaining
            </ThemedText>
          </Pressable>

          <Pressable
            style={[styles.commerceCard, { backgroundColor: colors.card, borderTopColor: accent }]}
            onPress={() => setStoreVisible(true)}
          >
            <ThemedText style={[styles.commerceCardTitle, { color: colors.text }]}>Store</ThemedText>
            <ThemedText style={[styles.commerceCardSub, { color: colors.textSecondary }]} numberOfLines={1}>
              Official K-1 Racing Gear
            </ThemedText>
          </Pressable>

          <Pressable
            style={[styles.commerceCard, { backgroundColor: colors.card, borderTopColor: accent }]}
            onPress={() => setPaddockVisible(true)}
          >
            <ThemedText style={[styles.commerceCardTitle, { color: colors.text }]}>Paddock</ThemedText>
            <ThemedText style={[styles.commerceCardSub, { color: colors.textSecondary }]} numberOfLines={1}>
              VIP & Hospitality
            </ThemedText>
          </Pressable>
        </View>

        {/* ─── Driver Standings (Top 5) ────────────────────────────── */}
        <ThemedText style={[styles.sectionHeader, { color: accent }]}>DRIVER STANDINGS</ThemedText>
        <View style={[styles.standingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {topDrivers.map((d, i) => {
            const teamColor = getTeamColor(d.team);
            const gap = d.points - leaderPoints;
            return (
              <Pressable
                key={d.position}
                style={[
                  styles.standingsRow,
                  i < topDrivers.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                ]}
                onPress={() =>
                  openDriverCard({ name: d.name, number: '', team: d.team, points: d.points, wins: d.wins, podiums: d.podiums })
                }
              >
                <ThemedText style={[styles.standingsPos, { color: i === 0 ? accent : colors.textSecondary }]}>
                  {d.position}
                </ThemedText>
                <View style={[styles.teamColorBar, { backgroundColor: teamColor }]} />
                <View style={{ flex: 1 }}>
                  <ThemedText
                    style={[styles.standingsName, { color: i === 0 ? accent : colors.text, fontWeight: i === 0 ? '700' : '400' }]}
                  >
                    {d.name}
                  </ThemedText>
                  <ThemedText style={[styles.standingsTeam, { color: colors.textSecondary }]}>
                    {d.team}{gap < 0 ? ` \u00B7 ${gap} pts` : ''}
                  </ThemedText>
                </View>
                <ThemedText style={[styles.standingsPoints, { color: colors.text }]}>{d.points} pts</ThemedText>
                {d.lastRaceResult != null && <LastRaceBadge result={d.lastRaceResult} />}
                <DeltaIndicator delta={d.delta} colors={colors} />
              </Pressable>
            );
          })}
        </View>
        <Pressable style={styles.seeAllLink}>
          <ThemedText style={[styles.seeAllText, { color: accent }]}>See Full Standings</ThemedText>
        </Pressable>

        {/* ─── Team Standings (Top 5) ──────────────────────────────── */}
        <ThemedText style={[styles.sectionHeader, { color: accent, marginTop: 8 }]}>TEAM STANDINGS</ThemedText>
        <View style={[styles.standingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {topTeams.map((t, i) => {
            const teamColor = getTeamColor(t.name);
            const bestDriverPos = Math.min(
              ...DRIVER_STANDINGS.filter((d) => t.drivers.includes(d.name)).map((d) => d.position),
            );
            return (
              <Pressable
                key={t.position}
                style={[
                  styles.standingsRow,
                  i < topTeams.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                ]}
                onPress={() => openTeamCard({ name: t.name, category: t.category })}
              >
                <ThemedText style={[styles.standingsPos, { color: i === 0 ? accent : colors.textSecondary }]}>
                  {t.position}
                </ThemedText>
                <View style={[styles.teamColorBar, { backgroundColor: teamColor }]} />
                <View style={{ flex: 1 }}>
                  <ThemedText
                    style={[styles.standingsName, { color: i === 0 ? accent : colors.text, fontWeight: i === 0 ? '700' : '400' }]}
                  >
                    {t.name}
                  </ThemedText>
                  <ThemedText style={[styles.standingsTeam, { color: colors.textSecondary }]}>
                    {t.drivers.length} drivers {'\u00B7'} best P{bestDriverPos}
                  </ThemedText>
                </View>
                <ThemedText style={[styles.standingsPoints, { color: colors.text }]}>{t.points} pts</ThemedText>
              </Pressable>
            );
          })}
        </View>
        <Pressable style={styles.seeAllLink}>
          <ThemedText style={[styles.seeAllText, { color: accent }]}>See Full Standings</ThemedText>
        </Pressable>

        {/* ─── Domain Cards (RBAC-gated) ───────────────────────────── */}
        {canSeeDashboardSection('race_ops', role) && (
          <Pressable style={[styles.domainCard, { borderTopColor: accent }]}>
            <View style={styles.domainHeader}>
              <IconSymbol name="flag.2.crossed.fill" size={16} color={accent} />
              <ThemedText style={[styles.domainTitle, { color: colors.text }]}>Race Ops</ThemedText>
              <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
            </View>
            <ThemedText style={[styles.domainPreview, { color: colors.textSecondary }]}>
              {nextRound ? `Weekend schedule: ${nextRound.weekendDates.fri} - ${nextRound.weekendDates.sun}` : 'No upcoming races'}
            </ThemedText>
            <ThemedText style={[styles.domainPreview, { color: colors.textSecondary }]}>
              {STEWARD_PENDING_DECISIONS} steward decision{STEWARD_PENDING_DECISIONS !== 1 ? 's' : ''} pending
            </ThemedText>
          </Pressable>
        )}

        {canSeeDashboardSection('technical', role) && (
          <Pressable style={[styles.domainCard, { borderTopColor: accent }]}>
            <View style={styles.domainHeader}>
              <IconSymbol name="wrench.and.screwdriver.fill" size={16} color={accent} />
              <ThemedText style={[styles.domainTitle, { color: colors.text }]}>Technical</ThemedText>
              <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
            </View>
            <ThemedText style={[styles.domainPreview, { color: colors.textSecondary }]}>
              Scrutineering: {compliancePassed}/{complianceTotal} passed
            </ThemedText>
            <ThemedText style={[styles.domainPreview, { color: colors.textSecondary }]}>
              Homologation deadline: {HOMOLOGATION_DEADLINE}
            </ThemedText>
          </Pressable>
        )}

        {canSeeDashboardSection('entries', role) && (
          <Pressable style={[styles.domainCard, { borderTopColor: accent }]}>
            <View style={styles.domainHeader}>
              <IconSymbol name="person.crop.rectangle.stack.fill" size={16} color={accent} />
              <ThemedText style={[styles.domainTitle, { color: colors.text }]}>Entries</ThemedText>
              <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
            </View>
            <ThemedText style={[styles.domainPreview, { color: colors.textSecondary }]}>
              {confirmedEntries}/{MAX_GRID_SIZE} entries confirmed
            </ThemedText>
            <ThemedText style={[styles.domainPreview, { color: colors.textSecondary }]}>
              {pendingWildcards} pending wildcard{pendingWildcards !== 1 ? 's' : ''}
            </ThemedText>
          </Pressable>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ─── Bottom Sheets ──────────────────────────────────────── */}
      <CompTicketsSheet
        visible={ticketsVisible}
        onClose={() => setTicketsVisible(false)}
        colors={colors as any}
      />
      <CompStoreSheet
        visible={storeVisible}
        onClose={() => setStoreVisible(false)}
        colors={colors as any}
      />
      <CompPaddockSheet
        visible={paddockVisible}
        onClose={() => setPaddockVisible(false)}
        colors={colors as any}
      />
    </>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function getTeamColor(teamName: string): string {
  const team = GRID_TEAMS.find((t) => t.name === teamName);
  return team?.color ?? '#6B7280';
}

function LastRaceBadge({ result }: { result: number | 'DNF' | 'DNS' }) {
  let bg: string;
  let label: string;
  if (result === 'DNF') {
    bg = '#EF4444';
    label = 'DNF';
  } else if (result === 'DNS') {
    bg = '#6B7280';
    label = 'DNS';
  } else if (result === 1) {
    bg = '#FFD700';
    label = 'P1';
  } else if (result === 2) {
    bg = '#C0C0C0';
    label = 'P2';
  } else if (result === 3) {
    bg = '#CD7F32';
    label = 'P3';
  } else {
    bg = 'rgba(255,255,255,0.08)';
    label = `P${result}`;
  }
  return (
    <View style={[badgeStyles.badge, { backgroundColor: bg }]}>
      <ThemedText style={badgeStyles.badgeText}>{label}</ThemedText>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 2,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 0.5,
  },
});

function DeltaIndicator({ delta, colors }: { delta: number; colors: typeof Colors.light }) {
  if (delta > 0) {
    return <ThemedText style={[styles.delta, { color: '#22C55E' }]}>{'\u25B2'}{delta}</ThemedText>;
  }
  if (delta < 0) {
    return <ThemedText style={[styles.delta, { color: '#EF4444' }]}>{'\u25BC'}{Math.abs(delta)}</ThemedText>;
  }
  return <ThemedText style={[styles.delta, { color: colors.textTertiary }]}>{'\u2014'}</ThemedText>;
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },

  // Hero
  heroWrapper: { borderRadius: 16, overflow: 'hidden', marginBottom: 14 },
  heroGradient: {
    aspectRatio: 16 / 9,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  liveBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  liveText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  heroTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  heroSubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },

  // Next Event
  nextEventCard: { borderRadius: 12, borderWidth: 2, padding: 14, marginBottom: 14 },
  nextEventHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  roundBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundBadgeText: { color: '#000', fontSize: 12, fontWeight: '800' },
  nextLabel: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  nextLabelText: { fontSize: 10, fontWeight: '700' },
  nextEventName: { fontSize: 17, fontWeight: '700' },
  nextEventMeta: { fontSize: 12, marginTop: 3 },
  weekendSchedule: { marginTop: 10, gap: 4 },
  weekendRow: { fontSize: 11 },
  defendingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  defendingLabel: { fontSize: 11 },
  defendingName: { fontSize: 12, fontWeight: '700' },

  // Commerce Row (text-stack cards)
  commerceRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  commerceCard: {
    flex: 1,
    borderTopWidth: 2,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 3,
  },
  commerceCardTitle: { fontSize: 13, fontWeight: '700' },
  commerceCardSub: { fontSize: 11, fontWeight: '500' },
  commerceCardMeta: { fontSize: 10, fontWeight: '500' },

  // Standings
  sectionHeader: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  standingsCard: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  standingsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  standingsPos: { width: 24, fontSize: 14, fontWeight: '700' },
  teamColorBar: { width: 3, height: 28, borderRadius: 1.5 },
  standingsName: { fontSize: 14 },
  standingsTeam: { fontSize: 10, marginTop: 1 },
  standingsPoints: { fontSize: 13, fontWeight: '700', marginRight: 4 },
  delta: { fontSize: 10, fontWeight: '600', width: 28, textAlign: 'right' },

  seeAllLink: { alignSelf: 'center', paddingVertical: 8, marginBottom: 4 },
  seeAllText: { fontSize: 12, fontWeight: '700' },

  // Domain Cards
  domainCard: {
    backgroundColor: '#181616',
    borderTopWidth: 2,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 4,
  },
  domainHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  domainTitle: { fontSize: 14, fontWeight: '700', flex: 1 },
  domainPreview: { fontSize: 11 },
});
