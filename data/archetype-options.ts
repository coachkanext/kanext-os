/**
 * Archetype Options — Flat list for filter multi-select
 * Re-exports from system-demand-profiles for the filter panel.
 */

import { ARCHETYPE_LABELS, type Archetype } from '@/data/system-demand-profiles';

export interface ArchetypeOption {
  value: Archetype;
  label: string;
}

/** All 21 archetypes as a flat list for multi-select UI */
export const ARCHETYPE_OPTIONS: ArchetypeOption[] = (
  Object.entries(ARCHETYPE_LABELS) as [Archetype, string][]
).map(([value, label]) => ({ value, label }));
