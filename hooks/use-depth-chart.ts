/**
 * useDepthChart — Supabase-backed depth chart hook
 *
 * Feature flag: if EXPO_PUBLIC_SUPABASE_URL is not set, returns mock depth chart.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase, USE_SUPABASE } from '@/lib/supabase';
import { buildMockDepthChart } from '@/data/roster-data-bridge';
import type { DepthChartData, DepthEntry, RotationEntry, UnitEntry } from '@/data/roster-data-bridge';
import type { DepthChartRow } from '@/types/supabase';

type DepthChartWithEntry = DepthChartRow & {
  roster_entries: {
    jersey_number: string | null;
  } | null;
};

export function useDepthChart(programId?: string, seasonId?: string) {
  return useQuery<DepthChartData>({
    queryKey: ['depth-chart', programId, seasonId],
    queryFn: async () => {
      if (!USE_SUPABASE || !programId || !seasonId) {
        return buildMockDepthChart();
      }

      const { data, error } = await supabase
        .from('depth_chart')
        .select(`
          *,
          roster_entries ( jersey_number )
        `)
        .eq('program_id', programId)
        .eq('season_id', seasonId)
        .order('sort_order');

      if (error || !data || data.length === 0) {
        return buildMockDepthChart();
      }

      const rows = data as unknown as DepthChartWithEntry[];

      const starters: DepthEntry[] = [];
      const rotation: RotationEntry[] = [];
      const unitMap = new Map<string, string[]>();
      let status: 'PROVISIONAL' | 'LOCKED' = 'PROVISIONAL';

      for (const row of rows) {
        const jersey = row.roster_entries?.jersey_number ?? '0';
        if (row.status === 'LOCKED') status = 'LOCKED';

        if (row.group_type === 'starter') {
          starters.push({
            jersey,
            slot: (row.slot ?? 'Wing') as DepthEntry['slot'],
          });
        } else if (row.group_type === 'rotation') {
          rotation.push({
            jersey,
            group: row.group_name as RotationEntry['group'],
          });
        } else if (row.group_type === 'unit') {
          const existing = unitMap.get(row.group_name) ?? [];
          existing.push(jersey);
          unitMap.set(row.group_name, existing);
        }
      }

      const units: UnitEntry[] = [];
      for (const [name, jerseys] of unitMap) {
        units.push({ name: name as UnitEntry['name'], jerseys });
      }

      return { starters, rotation, units, status };
    },
  });
}
