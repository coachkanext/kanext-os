/**
 * Roster Mutation Hooks — Supabase write operations with optimistic updates
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, USE_SUPABASE } from '@/lib/supabase';
import type { RosterPlayer } from '@/data/roster-data-bridge';
import type { PlayerStatus } from '@/data/roster-data';

// ── Update player status ──

interface UpdateStatusInput {
  rosterEntryId: string;
  status: PlayerStatus;
  statusNote?: string;
  programId: string;
  seasonId: string;
}

export function useUpdatePlayerStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateStatusInput) => {
      if (!USE_SUPABASE) {
        // Mock mode: no-op, optimistic update handles UI
        return;
      }

      const { error } = await supabase
        .from('roster_entries')
        .update({ status: input.status, notes: input.statusNote ?? null })
        .eq('id', input.rosterEntryId);

      if (error) throw error;
    },
    onMutate: async (input) => {
      const key = ['roster', input.programId, input.seasonId];
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<RosterPlayer[]>(key);

      queryClient.setQueryData<RosterPlayer[]>(key, (old) =>
        old?.map(p =>
          p.playerId === input.rosterEntryId
            ? { ...p, status: input.status }
            : p
        ) ?? []
      );

      return { previous, key };
    },
    onError: (_err, _input, context) => {
      if (context) {
        queryClient.setQueryData(context.key, context.previous);
      }
    },
    onSettled: (_data, _err, input) => {
      queryClient.invalidateQueries({ queryKey: ['roster', input.programId, input.seasonId] });
    },
  });
}

// ── Update roster notes ──

interface UpdateNotesInput {
  rosterEntryId: string;
  notes: string;
  programId: string;
  seasonId: string;
}

export function useUpdateRosterNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateNotesInput) => {
      if (!USE_SUPABASE) return;

      const { error } = await supabase
        .from('roster_entries')
        .update({ notes: input.notes })
        .eq('id', input.rosterEntryId);

      if (error) throw error;
    },
    onMutate: async (input) => {
      const key = ['roster', input.programId, input.seasonId];
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<RosterPlayer[]>(key);

      queryClient.setQueryData<RosterPlayer[]>(key, (old) =>
        old?.map(p =>
          p.playerId === input.rosterEntryId
            ? { ...p, notes: input.notes }
            : p
        ) ?? []
      );

      return { previous, key };
    },
    onError: (_err, _input, context) => {
      if (context) {
        queryClient.setQueryData(context.key, context.previous);
      }
    },
    onSettled: (_data, _err, input) => {
      queryClient.invalidateQueries({ queryKey: ['roster', input.programId, input.seasonId] });
    },
  });
}

// ── Add player ──

interface AddPlayerInput {
  fullName: string;
  programId: string;
  seasonId: string;
  jerseyNumber?: string;
  position?: string;
  height?: string;
  weight?: number;
  classYear?: string;
}

export function useAddPlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddPlayerInput) => {
      if (!USE_SUPABASE) {
        throw new Error('Cannot add players in mock mode');
      }

      // 1. Create player record
      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert({ full_name: input.fullName })
        .select()
        .single();

      if (playerError || !player) throw playerError ?? new Error('Failed to create player');

      // 2. Create roster entry
      const { data: entry, error: entryError } = await supabase
        .from('roster_entries')
        .insert({
          player_id: player.id,
          program_id: input.programId,
          season_id: input.seasonId,
          jersey_number: input.jerseyNumber ?? null,
          position: input.position ?? null,
          height: input.height ?? null,
          weight: input.weight ?? null,
          class_year: input.classYear ?? null,
        })
        .select()
        .single();

      if (entryError || !entry) throw entryError ?? new Error('Failed to create roster entry');

      return { player, entry };
    },
    onSettled: (_data, _err, input) => {
      queryClient.invalidateQueries({ queryKey: ['roster', input.programId, input.seasonId] });
    },
  });
}
