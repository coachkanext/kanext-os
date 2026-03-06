/**
 * useRoster / usePlayer / useCoaches — Supabase-backed roster hooks
 *
 * Feature flag: if EXPO_PUBLIC_SUPABASE_URL is not set, returns mock data.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase, USE_SUPABASE } from '@/lib/supabase';
import { buildMockRosterPlayers, toPlayerCardData } from '@/data/roster-data-bridge';
import type { RosterPlayer } from '@/data/roster-data-bridge';
import type { PlayerCardData, CoachCardData } from '@/utils/global-entity-sheets';
import type { RosterEntryRow, PlayerRatingRow, CoachRow } from '@/types/supabase';

// ── Transform Supabase rows → RosterPlayer ──

function normClass(c: string | null): string {
  if (!c) return '—';
  const low = c.toLowerCase().replace(/\./g, '').trim();
  if (low === 'freshman' || low === 'fr') return 'Fr.';
  if (low === 'sophomore' || low === 'so') return 'So.';
  if (low === 'junior' || low === 'jr') return 'Jr.';
  if (low === 'senior' || low === 'sr') return 'Sr.';
  if (low === 'graduate student' || low === 'gr' || low === 'graduate') return 'Gr.';
  if (low.startsWith('r-')) return 'R-' + normClass(low.slice(2));
  return c;
}

function toListPos(pos: string): string {
  const p = pos.toUpperCase();
  if (p === 'PG') return 'PG';
  if (p === 'SG' || p === 'CG') return 'CG';
  if (p === 'SF' || p === 'G/F' || p === 'W') return 'W';
  if (p === 'PF' || p === 'F') return 'F';
  if (p === 'C' || p === 'F/C') return 'B';
  return 'W';
}

type RosterEntryWithRating = RosterEntryRow & {
  players: { full_name: string } | null;
  player_ratings: PlayerRatingRow[] | null;
};

function transformRow(row: RosterEntryWithRating): RosterPlayer {
  const fullName = row.players?.full_name ?? 'Unknown';
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] ?? '';
  const lastName = nameParts.slice(1).join(' ') || firstName;
  const jersey = row.jersey_number ?? '0';
  const rating = row.player_ratings?.[0];
  const pos = row.position ?? '—';

  return {
    playerId: row.player_id,
    jerseyNumber: jersey,
    displayJersey: jersey,
    firstName,
    lastName,
    position: pos,
    height: row.height ?? '—',
    weight: row.weight ?? 0,
    classYear: normClass(row.class_year),
    status: (row.status as RosterPlayer['status']) ?? 'available',
    nil: row.nil_amount ?? 0,
    aidPct: row.scholarship_pct ?? 0,
    notes: row.notes ?? '',
    flagged: row.flagged,
    scores: {
      overallKR: rating?.kr ?? 0,
      shooting: rating?.shooting ?? 0,
      finishing: rating?.finishing ?? 0,
      playmaking: rating?.playmaking ?? 0,
      onBallDefense: rating?.on_ball_defense ?? 0,
      teamDefense: rating?.team_defense ?? 0,
      rebounding: rating?.rebounding ?? 0,
      frame: rating?.physical ?? 0,
    },
    listPos: toListPos(pos),
    role: 'rotation', // depth chart determines this
    ppg: rating?.ppg ?? 0,
    rpg: rating?.rpg ?? 0,
    apg: rating?.apg ?? 0,
    kr: rating?.kr ?? 0,
    usage: rating?.usage ?? 0,
    minutes: rating?.minutes ?? 0,
  };
}

// ── Hooks ──

export function useRoster(programId?: string, seasonId?: string) {
  return useQuery<RosterPlayer[]>({
    queryKey: ['roster', programId, seasonId],
    queryFn: async () => {
      if (!USE_SUPABASE || !programId || !seasonId) {
        return buildMockRosterPlayers();
      }

      const { data, error } = await supabase
        .from('roster_entries')
        .select(`
          *,
          players ( full_name ),
          player_ratings ( * )
        `)
        .eq('program_id', programId)
        .eq('season_id', seasonId)
        .order('jersey_number');

      if (error) {
        console.error('useRoster error:', error);
        return buildMockRosterPlayers();
      }

      if (!data || data.length === 0) {
        return buildMockRosterPlayers();
      }

      return (data as unknown as RosterEntryWithRating[]).map(transformRow);
    },
  });
}

export function usePlayer(playerId?: string) {
  return useQuery<PlayerCardData | null>({
    queryKey: ['player', playerId],
    enabled: Boolean(playerId),
    queryFn: async () => {
      if (!USE_SUPABASE || !playerId) {
        const roster = buildMockRosterPlayers();
        const player = roster.find(p => p.playerId === playerId);
        return player ? toPlayerCardData(player) : null;
      }

      const { data, error } = await supabase
        .from('roster_entries')
        .select(`
          *,
          players ( full_name ),
          player_ratings ( * )
        `)
        .eq('player_id', playerId)
        .limit(1)
        .single();

      if (error || !data) return null;

      const rosterPlayer = transformRow(data as unknown as RosterEntryWithRating);
      return toPlayerCardData(rosterPlayer);
    },
  });
}

export function useCoaches(programId?: string) {
  return useQuery<CoachCardData[]>({
    queryKey: ['coaches', programId],
    queryFn: async () => {
      if (!USE_SUPABASE || !programId) {
        return []; // no mock coaches for now
      }

      const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .eq('program_id', programId)
        .order('title');

      if (error || !data) return [];

      return data.map((c: CoachRow) => ({
        name: c.full_name,
        title: c.title,
        bio: c.bio ?? undefined,
        offensiveSystem: c.offensive_system ?? undefined,
        defensiveSystem: c.defensive_system ?? undefined,
        tendencies: c.tendencies ?? undefined,
        headshot: c.headshot_url ?? undefined,
      }));
    },
  });
}
