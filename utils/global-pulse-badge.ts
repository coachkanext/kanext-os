/**
 * Global Pulse badge state — single source of truth for unread counts.
 * Used by: UniversalFooter (total count), OrgDrawer (per-org counts).
 *
 * Keyed by V2_ORGANIZATIONS org_id. Pulse brandId → org_id mapping lives here.
 */

type TotalListener = (count: number) => void;
type OrgListener   = (counts: Record<string, number>) => void;

// Map: Pulse brandId → V2_ORGANIZATIONS org_id
export const PULSE_BRAND_TO_ORG: Record<string, string> = {
  kanext:     'pb_kx',
  lincoln:    'edu_kx',
  basketball: 'sports_kx',
  iccla:      'church_kx',
  sammy:      'pb_kx',
};

let _total = 0;
let _orgCounts: Record<string, number> = {};

const _totalListeners = new Set<TotalListener>();
const _orgListeners   = new Set<OrgListener>();

/** Call whenever Pulse items array changes. */
export function updatePulseBadge(items: { isRead: boolean; brandId: string }[]) {
  const unread = items.filter(i => !i.isRead);
  _total = unread.length;

  const counts: Record<string, number> = {};
  for (const item of unread) {
    const orgId = PULSE_BRAND_TO_ORG[item.brandId];
    if (orgId) counts[orgId] = (counts[orgId] ?? 0) + 1;
  }
  _orgCounts = counts;

  _totalListeners.forEach(l => l(_total));
  _orgListeners.forEach(l => l({ ..._orgCounts }));
}

/** Subscribe to total unread count. Immediately fires with current value. */
export function subscribePulseBadge(listener: TotalListener): () => void {
  _totalListeners.add(listener);
  listener(_total);
  return () => _totalListeners.delete(listener);
}

/** Subscribe to per-org unread counts. Immediately fires with current value. */
export function subscribePulseOrgBadges(listener: OrgListener): () => void {
  _orgListeners.add(listener);
  listener({ ..._orgCounts });
  return () => _orgListeners.delete(listener);
}
