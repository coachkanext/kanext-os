/**
 * useCurrentProgram — Resolves the active program + season from Supabase
 *
 * Queries the first program in the user's org membership, then finds
 * the current season (is_current = true).
 *
 * Returns null values when Supabase isn't configured.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase, USE_SUPABASE } from '@/lib/supabase';

interface CurrentProgram {
  orgId: string;
  programId: string;
  seasonId: string;
  programName: string;
  seasonLabel: string;
}

export function useCurrentProgram() {
  return useQuery<CurrentProgram | null>({
    queryKey: ['current-program'],
    queryFn: async () => {
      if (!USE_SUPABASE) return null;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get user's first membership
      const { data: membership } = await supabase
        .from('memberships')
        .select('org_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (!membership) return null;

      // Get first program in that org
      const { data: program } = await supabase
        .from('programs')
        .select('id, name')
        .eq('org_id', membership.org_id)
        .limit(1)
        .single();

      if (!program) return null;

      // Get current season for that program
      const { data: season } = await supabase
        .from('seasons')
        .select('id, label')
        .eq('program_id', program.id)
        .eq('is_current', true)
        .limit(1)
        .single();

      if (!season) return null;

      return {
        orgId: membership.org_id,
        programId: program.id,
        seasonId: season.id,
        programName: program.name,
        seasonLabel: season.label,
      };
    },
    staleTime: 30 * 60 * 1000, // 30 min — doesn't change often
  });
}
