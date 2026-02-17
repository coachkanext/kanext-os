/**
 * Organization Switcher — orgs available per mode.
 * V2: delegates to mock-memberships for multi-org support.
 */
import type { Mode } from '@/types';
import { getOrgsForModeV2 } from '@/data/mock-memberships';

export interface SwitcherOrg {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
}

const MODE_ICONS: Record<Mode, string> = {
  sports: 'sportscourt.fill',
  competition: 'flag.checkered',
  church: 'building.columns.fill',
  education: 'graduationcap.fill',
  enterprise: 'building.2.fill',
  business: 'briefcase.fill',
};

export function getOrgsForMode(mode: Mode): SwitcherOrg[] {
  const icon = MODE_ICONS[mode] ?? 'square.grid.2x2';
  return getOrgsForModeV2(mode).map((org) => ({
    id: org.org_id,
    name: org.org_name,
    subtitle: org.view_variant
      ? `${org.view_variant} View`
      : org.location ?? '',
    icon,
  }));
}
