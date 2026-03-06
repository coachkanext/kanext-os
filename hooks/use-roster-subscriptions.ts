/**
 * useRosterRealtime — Postgres changes → React Query invalidation
 *
 * Subscribes to roster_entries + player_ratings + coaches + depth_chart.
 * On any INSERT/UPDATE/DELETE, invalidates the relevant React Query cache
 * so components automatically refetch.
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase, USE_SUPABASE } from '@/lib/supabase';

export function useRosterRealtime(programId?: string, seasonId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!USE_SUPABASE || !programId || !seasonId) return;

    const channel = supabase
      .channel(`roster:${programId}:${seasonId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'roster_entries',
          filter: `program_id=eq.${programId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['roster', programId, seasonId] });
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'player_ratings',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['roster', programId, seasonId] });
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'coaches',
          filter: `program_id=eq.${programId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['coaches', programId] });
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'depth_chart',
          filter: `program_id=eq.${programId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['depth-chart', programId, seasonId] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [programId, seasonId, queryClient]);
}
