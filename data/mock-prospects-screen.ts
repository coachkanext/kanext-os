/**
 * Mock data for Prospects screen — sports mode.
 * 3 pages: Rankings, Discover, Schools.
 * Pattern follows data/mock-team.ts.
 */

// ── Shared Types ──

export type Position = 'PG' | 'CG' | 'W' | 'F' | 'B';
export type ClassYear = 'Fr.' | 'So.' | 'Jr.' | 'Sr.';
export type Trend = 'rising' | 'falling' | 'stable';
export type Level = 'D1-HM' | 'D1-MM' | 'D1-LM' | 'D2' | 'D3' | 'NAIA' | 'NJCAA-D1' | 'NJCAA-D2' | 'NJCAA-D3' | 'CCCAA';

// ── Page 0: Rankings ──

export type RankingScopeFilter = 'national' | 'state' | 'conference' | 'level';
export type PositionFilter = 'all' | 'PG' | 'CG' | 'W' | 'F' | 'B';

export interface RankingsSummary {
  totalRanked: number;
  topKR: number;
  levelsCovered: number;
}

export interface RankedPlayerItem {
  id: string;
  name: string;
  initials: string;
  username: string;
  position: Position;
  krRating: number;
  krTier: string;
  school: string;
  level: Level;
  classYear: ClassYear;
  height: string;
  weight: number;
  trend: Trend;
  inPortal: boolean;
  state: string;
  conference: string;
}

// ── Page 1: Discover ──

export type DiscoverSortKey = 'kr' | 'trending' | 'recent' | 'name' | 'height' | 'classYear';

export interface DiscoverFilter {
  level?: Level;
  position?: Position;
  krMin?: number;
  krMax?: number;
  classYear?: ClassYear;
  state?: string;
  portal?: boolean;
  archetype?: string;
}

export interface DiscoverPlayerItem extends RankedPlayerItem {
  archetype: string;
  topTraits: string[];
}

// ── Page 2: Schools ──

export type SchoolLevelFilter = 'all' | 'D1-HM' | 'D1-MM' | 'D1-LM' | 'D2' | 'D3' | 'NAIA' | 'NJCAA' | 'CCCAA';

export interface SchoolItem {
  id: string;
  name: string;
  initials: string;
  level: Level;
  conference: string;
  state: string;
  city: string;
  krTeamRating: number;
  rosterSize: number;
  logoUri: string | null;
}

// ── Mock Data ──

export const RANKINGS_SUMMARY: RankingsSummary = {
  totalRanked: 21654,
  topKR: 79.2,
  levelsCovered: 9,
};

export const RANKED_PLAYERS: RankedPlayerItem[] = [
  { id: 'rp1',  name: 'Jaylen Cross',      initials: 'JC', username: 'jcross',     position: 'PG', krRating: 79.2, krTier: 'Elite',       school: 'Duke',              level: 'D1-HM', classYear: 'Jr.', height: '6\'2"',  weight: 185, trend: 'rising',  inPortal: false, state: 'NC', conference: 'ACC' },
  { id: 'rp2',  name: 'Marcus Thompson',    initials: 'MT', username: 'mthompson',  position: 'CG', krRating: 77.8, krTier: 'Elite',       school: 'Kentucky',          level: 'D1-HM', classYear: 'So.', height: '6\'5"',  weight: 200, trend: 'stable',  inPortal: false, state: 'KY', conference: 'SEC' },
  { id: 'rp3',  name: 'DeShawn Williams',   initials: 'DW', username: 'dwilliams',  position: 'W',  krRating: 76.5, krTier: 'Elite',       school: 'Gonzaga',           level: 'D1-HM', classYear: 'Sr.', height: '6\'7"',  weight: 215, trend: 'stable',  inPortal: true,  state: 'WA', conference: 'WCC' },
  { id: 'rp4',  name: 'Andre Mitchell',     initials: 'AM', username: 'amitchell',  position: 'F',  krRating: 74.1, krTier: 'Star',        school: 'UConn',             level: 'D1-HM', classYear: 'Jr.', height: '6\'9"',  weight: 225, trend: 'rising',  inPortal: false, state: 'CT', conference: 'Big East' },
  { id: 'rp5',  name: 'Tyrese Robinson',    initials: 'TR', username: 'trobinson',  position: 'B',  krRating: 73.6, krTier: 'Star',        school: 'Kansas',            level: 'D1-HM', classYear: 'So.', height: '6\'11"', weight: 240, trend: 'rising',  inPortal: false, state: 'KS', conference: 'Big 12' },
  { id: 'rp6',  name: 'Isaiah Carter',      initials: 'IC', username: 'icarter',    position: 'PG', krRating: 71.9, krTier: 'Star',        school: 'Houston',           level: 'D1-HM', classYear: 'Sr.', height: '6\'1"',  weight: 178, trend: 'stable',  inPortal: true,  state: 'TX', conference: 'Big 12' },
  { id: 'rp7',  name: 'Brandon Harris',     initials: 'BH', username: 'bharris',    position: 'CG', krRating: 69.4, krTier: 'Above Avg',   school: 'Creighton',         level: 'D1-HM', classYear: 'Jr.', height: '6\'4"',  weight: 195, trend: 'rising',  inPortal: false, state: 'NE', conference: 'Big East' },
  { id: 'rp8',  name: 'Chris Jackson',      initials: 'CJ', username: 'cjackson',   position: 'W',  krRating: 67.2, krTier: 'Above Avg',   school: 'Purdue',            level: 'D1-HM', classYear: 'Fr.', height: '6\'6"',  weight: 205, trend: 'rising',  inPortal: false, state: 'IN', conference: 'Big Ten' },
  { id: 'rp9',  name: 'Malik Johnson',      initials: 'MJ', username: 'mjohnson',   position: 'F',  krRating: 65.8, krTier: 'Above Avg',   school: 'Virginia',          level: 'D1-MM', classYear: 'Sr.', height: '6\'8"',  weight: 220, trend: 'falling', inPortal: true,  state: 'VA', conference: 'ACC' },
  { id: 'rp10', name: 'Devon Price',        initials: 'DP', username: 'dprice',     position: 'PG', krRating: 63.5, krTier: 'Above Avg',   school: 'Marquette',         level: 'D1-HM', classYear: 'So.', height: '6\'0"',  weight: 175, trend: 'stable',  inPortal: false, state: 'WI', conference: 'Big East' },
  { id: 'rp11', name: 'Jordan Wright',      initials: 'JW', username: 'jwright',    position: 'B',  krRating: 61.2, krTier: 'Solid',       school: 'Xavier',            level: 'D1-MM', classYear: 'Jr.', height: '6\'10"', weight: 235, trend: 'stable',  inPortal: false, state: 'OH', conference: 'Big East' },
  { id: 'rp12', name: 'Terrence Lee',       initials: 'TL', username: 'tlee',       position: 'CG', krRating: 59.7, krTier: 'Solid',       school: 'VCU',               level: 'D1-MM', classYear: 'Sr.', height: '6\'3"',  weight: 190, trend: 'rising',  inPortal: true,  state: 'VA', conference: 'A-10' },
  { id: 'rp13', name: 'Nathan Brooks',      initials: 'NB', username: 'nbrooks',    position: 'W',  krRating: 57.4, krTier: 'Solid',       school: 'Belmont',           level: 'D1-LM', classYear: 'Jr.', height: '6\'5"',  weight: 198, trend: 'stable',  inPortal: false, state: 'TN', conference: 'MVC' },
  { id: 'rp14', name: 'Kyle Patterson',     initials: 'KP', username: 'kpatterson', position: 'F',  krRating: 55.1, krTier: 'Avg',         school: 'Drexel',            level: 'D1-LM', classYear: 'So.', height: '6\'7"',  weight: 210, trend: 'stable',  inPortal: false, state: 'PA', conference: 'CAA' },
  { id: 'rp15', name: 'Darius Green',       initials: 'DG', username: 'dgreen',     position: 'PG', krRating: 53.8, krTier: 'Avg',         school: 'Northwest Missouri', level: 'D2',    classYear: 'Sr.', height: '5\'11"', weight: 170, trend: 'rising',  inPortal: true,  state: 'MO', conference: 'MIAA' },
  { id: 'rp16', name: 'Trevor Adams',       initials: 'TA', username: 'tadams',     position: 'B',  krRating: 52.3, krTier: 'Avg',         school: 'Life University',   level: 'NAIA',  classYear: 'Jr.', height: '6\'9"',  weight: 230, trend: 'stable',  inPortal: false, state: 'GA', conference: 'AAC' },
  { id: 'rp17', name: 'Xavier Morales',     initials: 'XM', username: 'xmorales',   position: 'CG', krRating: 51.6, krTier: 'Avg',         school: 'Indian Hills CC',   level: 'NJCAA-D1', classYear: 'So.', height: '6\'3"', weight: 188, trend: 'rising', inPortal: false, state: 'IA', conference: 'ICCAC' },
  { id: 'rp18', name: 'Cameron Scott',      initials: 'CS', username: 'cscott',     position: 'W',  krRating: 49.8, krTier: 'Below Avg',   school: 'Barton CC',         level: 'NJCAA-D1', classYear: 'Fr.', height: '6\'6"', weight: 202, trend: 'stable', inPortal: false, state: 'KS', conference: 'KJCCC' },
  { id: 'rp19', name: 'Jamal Foster',       initials: 'JF', username: 'jfoster',    position: 'F',  krRating: 48.2, krTier: 'Below Avg',   school: 'West LA College',   level: 'CCCAA', classYear: 'Fr.', height: '6\'7"',  weight: 212, trend: 'rising',  inPortal: false, state: 'CA', conference: 'WSC' },
  { id: 'rp20', name: 'Ryan Cooper',        initials: 'RC', username: 'rcooper',    position: 'PG', krRating: 46.5, krTier: 'Below Avg',   school: 'Mott CC',           level: 'NJCAA-D2', classYear: 'So.', height: '6\'0"', weight: 172, trend: 'stable', inPortal: false, state: 'MI', conference: 'MCCAA' },
  { id: 'rp21', name: 'Elijah Simmons',     initials: 'ES', username: 'esimmons',   position: 'B',  krRating: 44.9, krTier: 'Below Avg',   school: 'Randolph College',  level: 'D3',    classYear: 'Sr.', height: '6\'8"',  weight: 228, trend: 'falling', inPortal: true,  state: 'VA', conference: 'ODAC' },
  { id: 'rp22', name: 'Avery Coleman',      initials: 'AC', username: 'acoleman',   position: 'CG', krRating: 43.1, krTier: 'Developing',  school: 'Penn State Wilkes', level: 'NJCAA-D3', classYear: 'Fr.', height: '6\'2"', weight: 180, trend: 'stable', inPortal: false, state: 'PA', conference: 'EPAC' },
  { id: 'rp23', name: 'Derek Martin',       initials: 'DM', username: 'dmartin',    position: 'W',  krRating: 41.7, krTier: 'Developing',  school: 'Maryville',         level: 'NAIA',  classYear: 'So.', height: '6\'5"',  weight: 195, trend: 'rising',  inPortal: false, state: 'TN', conference: 'AAC' },
  { id: 'rp24', name: 'Noah Bennett',       initials: 'NB', username: 'nbennett2',  position: 'F',  krRating: 39.8, krTier: 'Developing',  school: 'Calumet College',   level: 'NAIA',  classYear: 'Fr.', height: '6\'8"',  weight: 218, trend: 'stable',  inPortal: false, state: 'IN', conference: 'CCAC' },
  { id: 'rp25', name: 'Ethan Ward',         initials: 'EW', username: 'eward',      position: 'PG', krRating: 37.5, krTier: 'Raw',         school: 'Presentation College', level: 'NAIA', classYear: 'Fr.', height: '5\'10"', weight: 165, trend: 'rising', inPortal: false, state: 'SD', conference: 'Independent' },
];

// ── Discover Players (extends ranked with archetype + traits) ──

export const DISCOVER_PLAYERS: DiscoverPlayerItem[] = RANKED_PLAYERS.map((p) => ({
  ...p,
  archetype: getArchetypeForPosition(p.position, p.krRating),
  topTraits: getTopTraitsForPosition(p.position),
})).concat([
  { id: 'dp26', name: 'Marcus Allen',      initials: 'MA', username: 'mallen',     position: 'PG', krRating: 62.1, krTier: 'Above Avg',  school: 'St. Louis',      level: 'D1-MM',    classYear: 'Jr.', height: '6\'1"',  weight: 180, trend: 'rising',  inPortal: true,  state: 'MO', conference: 'A-10',     archetype: 'Floor General',      topTraits: ['Playmaking', 'Court Vision'] },
  { id: 'dp27', name: 'Zion Peters',       initials: 'ZP', username: 'zpeters',    position: 'F',  krRating: 58.3, krTier: 'Solid',      school: 'Middle Tennessee', level: 'D1-LM',  classYear: 'Sr.', height: '6\'8"',  weight: 225, trend: 'stable',  inPortal: true,  state: 'TN', conference: 'CUSA',     archetype: 'Stretch Four',       topTraits: ['3PT Shooting', 'Rebounding'] },
  { id: 'dp28', name: 'Tyler Washington',  initials: 'TW', username: 'twash',      position: 'B',  krRating: 54.6, krTier: 'Avg',        school: 'Tuskegee',         level: 'D2',     classYear: 'So.', height: '6\'10"', weight: 238, trend: 'rising',  inPortal: false, state: 'AL', conference: 'SIAC',     archetype: 'Rim Protector',      topTraits: ['Shot Blocking', 'Rebounding'] },
  { id: 'dp29', name: 'Kevin Okafor',      initials: 'KO', username: 'kokafor',    position: 'CG', krRating: 50.2, krTier: 'Avg',        school: 'Vincennes',        level: 'NJCAA-D1', classYear: 'Fr.', height: '6\'4"', weight: 192, trend: 'rising', inPortal: false, state: 'IN', conference: 'Region 24', archetype: 'Two-Way Guard',      topTraits: ['Finishing', 'On-Ball Defense'] },
  { id: 'dp30', name: 'Jaiden Brown',      initials: 'JB', username: 'jbrown',     position: 'W',  krRating: 47.9, krTier: 'Below Avg',  school: 'East LA College',  level: 'CCCAA',    classYear: 'So.', height: '6\'6"', weight: 200, trend: 'stable', inPortal: false, state: 'CA', conference: 'SCC',       archetype: '3-and-D Wing',       topTraits: ['3PT Shooting', 'Perimeter D'] },
]);

// ── Schools ──

export const SCHOOLS: SchoolItem[] = [
  { id: 'sc1',  name: 'Duke',                initials: 'DK', level: 'D1-HM', conference: 'ACC',       state: 'NC', city: 'Durham',         krTeamRating: 74.2, rosterSize: 13, logoUri: null },
  { id: 'sc2',  name: 'Kansas',              initials: 'KU', level: 'D1-HM', conference: 'Big 12',    state: 'KS', city: 'Lawrence',        krTeamRating: 72.8, rosterSize: 14, logoUri: null },
  { id: 'sc3',  name: 'Gonzaga',             initials: 'GU', level: 'D1-HM', conference: 'WCC',       state: 'WA', city: 'Spokane',         krTeamRating: 71.5, rosterSize: 13, logoUri: null },
  { id: 'sc4',  name: 'UConn',               initials: 'UC', level: 'D1-HM', conference: 'Big East',  state: 'CT', city: 'Storrs',          krTeamRating: 70.9, rosterSize: 14, logoUri: null },
  { id: 'sc5',  name: 'Purdue',              initials: 'PU', level: 'D1-HM', conference: 'Big Ten',   state: 'IN', city: 'West Lafayette',  krTeamRating: 69.1, rosterSize: 15, logoUri: null },
  { id: 'sc6',  name: 'Marquette',           initials: 'MQ', level: 'D1-HM', conference: 'Big East',  state: 'WI', city: 'Milwaukee',       krTeamRating: 66.4, rosterSize: 13, logoUri: null },
  { id: 'sc7',  name: 'Virginia',            initials: 'VA', level: 'D1-MM', conference: 'ACC',       state: 'VA', city: 'Charlottesville',  krTeamRating: 61.7, rosterSize: 14, logoUri: null },
  { id: 'sc8',  name: 'VCU',                 initials: 'VC', level: 'D1-MM', conference: 'A-10',      state: 'VA', city: 'Richmond',        krTeamRating: 58.9, rosterSize: 13, logoUri: null },
  { id: 'sc9',  name: 'Belmont',             initials: 'BL', level: 'D1-LM', conference: 'MVC',       state: 'TN', city: 'Nashville',       krTeamRating: 55.3, rosterSize: 14, logoUri: null },
  { id: 'sc10', name: 'Drexel',              initials: 'DX', level: 'D1-LM', conference: 'CAA',       state: 'PA', city: 'Philadelphia',    krTeamRating: 53.1, rosterSize: 13, logoUri: null },
  { id: 'sc11', name: 'Northwest Missouri',  initials: 'NW', level: 'D2',    conference: 'MIAA',      state: 'MO', city: 'Maryville',       krTeamRating: 51.8, rosterSize: 16, logoUri: null },
  { id: 'sc12', name: 'Tuskegee',            initials: 'TU', level: 'D2',    conference: 'SIAC',      state: 'AL', city: 'Tuskegee',        krTeamRating: 50.4, rosterSize: 15, logoUri: null },
  { id: 'sc13', name: 'Life University',     initials: 'LU', level: 'NAIA',  conference: 'AAC',       state: 'GA', city: 'Marietta',        krTeamRating: 49.2, rosterSize: 18, logoUri: null },
  { id: 'sc14', name: 'Maryville',           initials: 'MV', level: 'NAIA',  conference: 'AAC',       state: 'TN', city: 'Maryville',       krTeamRating: 46.8, rosterSize: 17, logoUri: null },
  { id: 'sc15', name: 'Indian Hills CC',     initials: 'IH', level: 'NJCAA-D1', conference: 'ICCAC', state: 'IA', city: 'Ottumwa',         krTeamRating: 52.1, rosterSize: 16, logoUri: null },
  { id: 'sc16', name: 'Barton CC',           initials: 'BC', level: 'NJCAA-D1', conference: 'KJCCC', state: 'KS', city: 'Great Bend',      krTeamRating: 49.7, rosterSize: 15, logoUri: null },
  { id: 'sc17', name: 'West LA College',     initials: 'WL', level: 'CCCAA', conference: 'WSC',       state: 'CA', city: 'Culver City',     krTeamRating: 47.3, rosterSize: 14, logoUri: null },
  { id: 'sc18', name: 'East LA College',     initials: 'EL', level: 'CCCAA', conference: 'SCC',       state: 'CA', city: 'Monterey Park',   krTeamRating: 45.9, rosterSize: 15, logoUri: null },
  { id: 'sc19', name: 'Randolph College',    initials: 'RC', level: 'D3',    conference: 'ODAC',      state: 'VA', city: 'Lynchburg',       krTeamRating: 42.6, rosterSize: 14, logoUri: null },
  { id: 'sc20', name: 'Mott CC',             initials: 'MC', level: 'NJCAA-D2', conference: 'MCCAA', state: 'MI', city: 'Flint',            krTeamRating: 44.1, rosterSize: 13, logoUri: null },
];

// ── Helpers ──

function getArchetypeForPosition(position: Position, kr: number): string {
  const archetypes: Record<Position, string[]> = {
    PG: ['Floor General', 'Scoring PG', 'Combo Guard'],
    CG: ['Two-Way Guard', 'Sharpshooter', 'Microwave Scorer'],
    W:  ['3-and-D Wing', 'Swiss Army Wing', 'Slashing Wing'],
    F:  ['Stretch Four', 'Power Forward', 'Point Forward'],
    B:  ['Rim Protector', 'Stretch Five', 'Two-Way Big'],
  };
  const idx = kr > 65 ? 0 : kr > 50 ? 1 : 2;
  return archetypes[position][idx];
}

function getTopTraitsForPosition(position: Position): string[] {
  const traits: Record<Position, string[]> = {
    PG: ['Playmaking', 'Court Vision'],
    CG: ['Shooting', 'On-Ball Defense'],
    W:  ['3PT Shooting', 'Perimeter D'],
    F:  ['Rebounding', 'Finishing'],
    B:  ['Shot Blocking', 'Rebounding'],
  };
  return traits[position];
}

export function getRankedPlayers(
  scope?: RankingScopeFilter,
  position?: PositionFilter,
  classYear?: ClassYear,
): RankedPlayerItem[] {
  let result = [...RANKED_PLAYERS];
  if (position && position !== 'all') {
    result = result.filter((p) => p.position === position);
  }
  if (classYear) {
    result = result.filter((p) => p.classYear === classYear);
  }
  result.sort((a, b) => b.krRating - a.krRating);
  return result;
}

export function searchPlayers(
  filters: DiscoverFilter,
  sort: DiscoverSortKey = 'kr',
): { players: DiscoverPlayerItem[]; count: number } {
  let result = [...DISCOVER_PLAYERS];
  if (filters.level) result = result.filter((p) => p.level === filters.level);
  if (filters.position) result = result.filter((p) => p.position === filters.position);
  if (filters.classYear) result = result.filter((p) => p.classYear === filters.classYear);
  if (filters.state) result = result.filter((p) => p.state === filters.state);
  if (filters.portal) result = result.filter((p) => p.inPortal);
  if (filters.archetype) result = result.filter((p) => p.archetype === filters.archetype);
  if (filters.krMin != null) result = result.filter((p) => p.krRating >= filters.krMin!);
  if (filters.krMax != null) result = result.filter((p) => p.krRating <= filters.krMax!);

  switch (sort) {
    case 'kr':        result.sort((a, b) => b.krRating - a.krRating); break;
    case 'trending':  result.sort((a, b) => (a.trend === 'rising' ? -1 : 1) - (b.trend === 'rising' ? -1 : 1)); break;
    case 'name':      result.sort((a, b) => a.name.localeCompare(b.name)); break;
    default:          result.sort((a, b) => b.krRating - a.krRating);
  }
  return { players: result, count: result.length };
}

export function getSchools(
  levelFilter?: SchoolLevelFilter,
  stateFilter?: string,
): SchoolItem[] {
  let result = [...SCHOOLS];
  if (levelFilter && levelFilter !== 'all') {
    if (levelFilter === 'NJCAA') {
      result = result.filter((s) => s.level.startsWith('NJCAA'));
    } else {
      result = result.filter((s) => s.level === levelFilter);
    }
  }
  if (stateFilter) {
    result = result.filter((s) => s.state === stateFilter);
  }
  result.sort((a, b) => b.krTeamRating - a.krTeamRating);
  return result;
}
