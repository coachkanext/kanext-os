/**
 * Organization Switcher — orgs available per mode.
 * Sports has 3 orgs; all other modes have 1.
 */
import type { Mode } from '@/types';
import { SPORTS_ORGANIZATIONS } from '@/context/app-context';

export interface SwitcherOrg {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
}

const SINGLE_MODE_ORGS: Record<Exclude<Mode, 'sports'>, SwitcherOrg[]> = {
  enterprise: [{ id: 'kanext', name: 'KaNeXT', subtitle: 'Institutional OS Platform', icon: 'building.2.fill' }],
  church: [{ id: 'icc', name: 'International Christian Center', subtitle: 'Los Angeles, CA', icon: 'heart.fill' }],
  education: [{ id: 'sdcc', name: 'San Diego Christian College', subtitle: 'San Diego County, CA', icon: 'graduationcap.fill' }],
  community: [{ id: 'k1-league', name: 'K-1 Competition', subtitle: 'Season 1 · 2026', icon: 'flag.checkered' }],
};

export function getOrgsForMode(mode: Mode): SwitcherOrg[] {
  if (mode === 'sports') {
    return Object.values(SPORTS_ORGANIZATIONS).map((org) => ({
      id: org.id,
      name: org.name,
      subtitle: org.location ?? '',
      icon: 'sportscourt.fill',
    }));
  }
  return SINGLE_MODE_ORGS[mode] ?? [];
}
