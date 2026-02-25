/**
 * Mock data for Sports → Video → Explore 2-column grid.
 * ~30 tiles across multiple levels/teams/types with visibility classes.
 * Pre-sorted recency-first (newest date first).
 */

// =============================================================================
// TYPES
// =============================================================================

export type ExploreLevel = 'NAIA' | 'D1' | 'D2' | 'D3' | 'JUCO';
export type ExploreMediaType = 'Game' | 'Clip' | 'Practice';

export interface ExploreTile {
  id: string;
  title: string;
  team: string;
  opponent?: string;
  level: ExploreLevel;
  type: ExploreMediaType;
  date: Date;
  duration: string;
  thumbnailColor: string;
  /** 0 = public cross-team, 3 = program-private */
  visibilityClass: 0 | 3;
  orgId: string;
  programId: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const EXPLORE_LEVELS: ExploreLevel[] = ['NAIA', 'D1', 'D2', 'D3', 'JUCO'];
export const EXPLORE_TYPES: ExploreMediaType[] = ['Game', 'Clip', 'Practice'];

// =============================================================================
// TILE DATA (~30 tiles, recency-first)
// =============================================================================

export const EXPLORE_TILES: ExploreTile[] = [
  // ── Carroll (org-carroll, NAIA) — mix of V0 public + V3 private ──
  { id: 'et-01', title: 'Carroll vs Rocky Mountain', team: 'Carroll Saints', opponent: 'Rocky Mountain', level: 'NAIA', type: 'Game', date: new Date('2026-02-24T20:00:00'), duration: '1:42:18', thumbnailColor: '#4A1942', visibilityClass: 0, orgId: 'org-carroll', programId: 'prog-carroll-mbb' },
  { id: 'et-02', title: 'Press Break Drill — Feb 24', team: 'Carroll Saints', level: 'NAIA', type: 'Practice', date: new Date('2026-02-24T15:00:00'), duration: '12:30', thumbnailColor: '#2D1B4E', visibilityClass: 3, orgId: 'org-carroll', programId: 'prog-carroll-mbb' },
  { id: 'et-03', title: 'Carter 28-Point Highlights', team: 'Carroll Saints', opponent: 'Rocky Mountain', level: 'NAIA', type: 'Clip', date: new Date('2026-02-24T22:30:00'), duration: '3:45', thumbnailColor: '#5B2C6F', visibilityClass: 0, orgId: 'org-carroll', programId: 'prog-carroll-mbb' },
  { id: 'et-04', title: 'Zone Defense Walkthrough', team: 'Carroll Saints', level: 'NAIA', type: 'Practice', date: new Date('2026-02-22T14:00:00'), duration: '18:15', thumbnailColor: '#1B2631', visibilityClass: 3, orgId: 'org-carroll', programId: 'prog-carroll-mbb' },
  { id: 'et-05', title: 'Carroll vs Providence', team: 'Carroll Saints', opponent: 'Providence', level: 'NAIA', type: 'Game', date: new Date('2026-02-20T19:00:00'), duration: '1:38:42', thumbnailColor: '#1A1A2E', visibilityClass: 0, orgId: 'org-carroll', programId: 'prog-carroll-mbb' },

  // ── Other NAIA teams (public) ──
  { id: 'et-06', title: 'Montana Western vs Carroll', team: 'Montana Western', opponent: 'Carroll Saints', level: 'NAIA', type: 'Game', date: new Date('2026-02-23T19:30:00'), duration: '1:44:10', thumbnailColor: '#0E4D45', visibilityClass: 0, orgId: 'org-mtwestern', programId: 'prog-mtwestern-mbb' },
  { id: 'et-07', title: 'Bulldogs Fast Break Reel', team: 'Montana Western', level: 'NAIA', type: 'Clip', date: new Date('2026-02-23T22:00:00'), duration: '2:12', thumbnailColor: '#1B4332', visibilityClass: 0, orgId: 'org-mtwestern', programId: 'prog-mtwestern-mbb' },
  { id: 'et-08', title: 'Lewis-Clark State vs Evergreen', team: 'Lewis-Clark State', opponent: 'Evergreen', level: 'NAIA', type: 'Game', date: new Date('2026-02-21T18:00:00'), duration: '1:40:05', thumbnailColor: '#2C3E50', visibilityClass: 0, orgId: 'org-lcstate', programId: 'prog-lcstate-mbb' },

  // ── D1 teams (public) ──
  { id: 'et-09', title: 'Duke vs North Carolina', team: 'Duke', opponent: 'North Carolina', level: 'D1', type: 'Game', date: new Date('2026-02-24T21:00:00'), duration: '2:05:30', thumbnailColor: '#003087', visibilityClass: 0, orgId: 'org-duke', programId: 'prog-duke-mbb' },
  { id: 'et-10', title: 'Flagg Dunk Mixtape', team: 'Duke', level: 'D1', type: 'Clip', date: new Date('2026-02-24T23:00:00'), duration: '4:18', thumbnailColor: '#001A4E', visibilityClass: 0, orgId: 'org-duke', programId: 'prog-duke-mbb' },
  { id: 'et-11', title: 'Kansas vs Baylor', team: 'Kansas', opponent: 'Baylor', level: 'D1', type: 'Game', date: new Date('2026-02-23T14:00:00'), duration: '2:01:15', thumbnailColor: '#0051BA', visibilityClass: 0, orgId: 'org-kansas', programId: 'prog-kansas-mbb' },
  { id: 'et-12', title: 'Jayhawks Motion Offense Sets', team: 'Kansas', level: 'D1', type: 'Clip', date: new Date('2026-02-22T10:00:00'), duration: '6:40', thumbnailColor: '#003B73', visibilityClass: 0, orgId: 'org-kansas', programId: 'prog-kansas-mbb' },
  { id: 'et-13', title: 'Gonzaga vs Saint Marys', team: 'Gonzaga', opponent: 'Saint Marys', level: 'D1', type: 'Game', date: new Date('2026-02-21T22:00:00'), duration: '1:58:50', thumbnailColor: '#002967', visibilityClass: 0, orgId: 'org-gonzaga', programId: 'prog-gonzaga-mbb' },

  // ── D2 teams (public) ──
  { id: 'et-14', title: 'Northwest Missouri vs Pittsburg State', team: 'Northwest Missouri', opponent: 'Pittsburg State', level: 'D2', type: 'Game', date: new Date('2026-02-24T18:00:00'), duration: '1:52:20', thumbnailColor: '#006747', visibilityClass: 0, orgId: 'org-nwmissouri', programId: 'prog-nwmissouri-mbb' },
  { id: 'et-15', title: 'Bearcats Defensive Highlights', team: 'Northwest Missouri', level: 'D2', type: 'Clip', date: new Date('2026-02-24T20:30:00'), duration: '3:15', thumbnailColor: '#004D40', visibilityClass: 0, orgId: 'org-nwmissouri', programId: 'prog-nwmissouri-mbb' },
  { id: 'et-16', title: 'West Texas A&M vs Angelo State', team: 'West Texas A&M', opponent: 'Angelo State', level: 'D2', type: 'Game', date: new Date('2026-02-22T19:00:00'), duration: '1:48:00', thumbnailColor: '#5C0000', visibilityClass: 0, orgId: 'org-wtamu', programId: 'prog-wtamu-mbb' },
  { id: 'et-17', title: 'Buffs Transition Drill', team: 'West Texas A&M', level: 'D2', type: 'Practice', date: new Date('2026-02-21T16:00:00'), duration: '14:50', thumbnailColor: '#3E0000', visibilityClass: 0, orgId: 'org-wtamu', programId: 'prog-wtamu-mbb' },

  // ── D3 teams (public) ──
  { id: 'et-18', title: 'Randolph-Macon vs Guilford', team: 'Randolph-Macon', opponent: 'Guilford', level: 'D3', type: 'Game', date: new Date('2026-02-23T17:00:00'), duration: '1:45:30', thumbnailColor: '#FFC72C', visibilityClass: 0, orgId: 'org-rmacon', programId: 'prog-rmacon-mbb' },
  { id: 'et-19', title: 'Yellow Jackets Pick & Roll Film', team: 'Randolph-Macon', level: 'D3', type: 'Clip', date: new Date('2026-02-22T11:00:00'), duration: '5:20', thumbnailColor: '#B8860B', visibilityClass: 0, orgId: 'org-rmacon', programId: 'prog-rmacon-mbb' },
  { id: 'et-20', title: 'Augustana vs Wash U', team: 'Augustana', opponent: 'Wash U', level: 'D3', type: 'Game', date: new Date('2026-02-21T20:00:00'), duration: '1:50:15', thumbnailColor: '#00274C', visibilityClass: 0, orgId: 'org-augustana', programId: 'prog-augustana-mbb' },
  { id: 'et-21', title: 'Vikings Full-Court Press Drill', team: 'Augustana', level: 'D3', type: 'Practice', date: new Date('2026-02-20T15:30:00'), duration: '11:45', thumbnailColor: '#1C2B3A', visibilityClass: 0, orgId: 'org-augustana', programId: 'prog-augustana-mbb' },

  // ── JUCO teams (public) ──
  { id: 'et-22', title: 'Indian Hills vs Southeastern', team: 'Indian Hills', opponent: 'Southeastern', level: 'JUCO', type: 'Game', date: new Date('2026-02-24T19:00:00'), duration: '1:36:48', thumbnailColor: '#8B0000', visibilityClass: 0, orgId: 'org-indianhills', programId: 'prog-indianhills-mbb' },
  { id: 'et-23', title: 'Warriors Dunk Package', team: 'Indian Hills', level: 'JUCO', type: 'Clip', date: new Date('2026-02-24T21:30:00'), duration: '2:55', thumbnailColor: '#660000', visibilityClass: 0, orgId: 'org-indianhills', programId: 'prog-indianhills-mbb' },
  { id: 'et-24', title: 'South Plains vs Odessa', team: 'South Plains', opponent: 'Odessa', level: 'JUCO', type: 'Game', date: new Date('2026-02-22T20:00:00'), duration: '1:35:10', thumbnailColor: '#1A3C34', visibilityClass: 0, orgId: 'org-southplains', programId: 'prog-southplains-mbb' },
  { id: 'et-25', title: 'Texans Shooting Workout', team: 'South Plains', level: 'JUCO', type: 'Practice', date: new Date('2026-02-21T13:00:00'), duration: '16:20', thumbnailColor: '#0D2818', visibilityClass: 0, orgId: 'org-southplains', programId: 'prog-southplains-mbb' },

  // ── More Carroll private content (V3) ──
  { id: 'et-26', title: 'Scouting Report: Rocky Mountain', team: 'Carroll Saints', opponent: 'Rocky Mountain', level: 'NAIA', type: 'Clip', date: new Date('2026-02-23T09:00:00'), duration: '8:30', thumbnailColor: '#1F1147', visibilityClass: 3, orgId: 'org-carroll', programId: 'prog-carroll-mbb' },
  { id: 'et-27', title: 'Inbound Plays — ATO Package', team: 'Carroll Saints', level: 'NAIA', type: 'Practice', date: new Date('2026-02-19T14:00:00'), duration: '22:10', thumbnailColor: '#16213E', visibilityClass: 3, orgId: 'org-carroll', programId: 'prog-carroll-mbb' },

  // ── Cross-level extras ──
  { id: 'et-28', title: 'Auburn vs Tennessee', team: 'Auburn', opponent: 'Tennessee', level: 'D1', type: 'Game', date: new Date('2026-02-20T20:00:00'), duration: '2:08:12', thumbnailColor: '#0C2340', visibilityClass: 0, orgId: 'org-auburn', programId: 'prog-auburn-mbb' },
  { id: 'et-29', title: 'Moberly Area vs State Fair', team: 'Moberly Area', opponent: 'State Fair', level: 'JUCO', type: 'Game', date: new Date('2026-02-19T19:00:00'), duration: '1:34:55', thumbnailColor: '#3C1518', visibilityClass: 0, orgId: 'org-moberly', programId: 'prog-moberly-mbb' },
  { id: 'et-30', title: 'Greyhounds Conditioning Film', team: 'Moberly Area', level: 'JUCO', type: 'Practice', date: new Date('2026-02-18T10:00:00'), duration: '9:40', thumbnailColor: '#2B1016', visibilityClass: 0, orgId: 'org-moberly', programId: 'prog-moberly-mbb' },
].sort((a, b) => b.date.getTime() - a.date.getTime());

// =============================================================================
// HELPERS
// =============================================================================

/** Get unique teams that have tiles for a given level (or all levels if null). */
export function getTeamsForLevel(level: ExploreLevel | null, tiles: ExploreTile[]): string[] {
  const filtered = level ? tiles.filter((t) => t.level === level) : tiles;
  return [...new Set(filtered.map((t) => t.team))].sort();
}
