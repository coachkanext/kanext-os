/**
 * Shared roster data used across roster-content, depth-chart, and other components.
 * Extracted to break circular dependencies.
 */

// Florida Memorial University Lions colors
export const TEAM_COLORS = {
  primary: '#003DA5',    // FMU Royal Blue
  secondary: '#FFD100',  // FMU Gold
  accent: '#ffffff',
  background: '#000000',
  cardBg: '#0a0a0a',
  white: '#f5f5f5',
  gray: '#6e6e6e',
};

// ── Per-player cluster ratings (keyed by jersey number) ──
export type ClusterRatings = {
  shooting: number;
  finishing: number;
  playmaking: number;
  perimeter_defense: number;
  interior_defense: number;
  rebounding: number;
  frame: number;
};

export const PLAYER_CLUSTERS: Record<string, ClusterRatings> = {
  '0':  { shooting: 58, finishing: 62, playmaking: 55, perimeter_defense: 72, interior_defense: 64, rebounding: 70, frame: 74 },   // Thomas
  '1':  { shooting: 48, finishing: 65, playmaking: 42, perimeter_defense: 60, interior_defense: 78, rebounding: 80, frame: 76 },   // Asceric
  '2':  { shooting: 50, finishing: 52, playmaking: 44, perimeter_defense: 58, interior_defense: 52, rebounding: 56, frame: 62 },   // Lewis
  '3':  { shooting: 52, finishing: 48, playmaking: 54, perimeter_defense: 56, interior_defense: 50, rebounding: 48, frame: 60 },   // Thompson
  '4':  { shooting: 78, finishing: 85, playmaking: 80, perimeter_defense: 74, interior_defense: 68, rebounding: 76, frame: 82 },   // Carter
  '5':  { shooting: 62, finishing: 78, playmaking: 76, perimeter_defense: 72, interior_defense: 84, rebounding: 82, frame: 80 },   // Selden
  '7':  { shooting: 56, finishing: 72, playmaking: 50, perimeter_defense: 66, interior_defense: 76, rebounding: 74, frame: 78 },   // Moratinos
  '9':  { shooting: 54, finishing: 50, playmaking: 62, perimeter_defense: 58, interior_defense: 48, rebounding: 52, frame: 56 },   // Benbo
  '10': { shooting: 48, finishing: 56, playmaking: 46, perimeter_defense: 54, interior_defense: 58, rebounding: 60, frame: 64 },   // Morris
  '11': { shooting: 70, finishing: 68, playmaking: 82, perimeter_defense: 76, interior_defense: 66, rebounding: 72, frame: 74 },   // Mentor
  '12': { shooting: 46, finishing: 50, playmaking: 42, perimeter_defense: 54, interior_defense: 50, rebounding: 52, frame: 60 },   // Turner
  '13': { shooting: 82, finishing: 74, playmaking: 72, perimeter_defense: 70, interior_defense: 62, rebounding: 66, frame: 68 },   // Noel
  '15': { shooting: 60, finishing: 58, playmaking: 68, perimeter_defense: 64, interior_defense: 56, rebounding: 62, frame: 66 },   // Morgan
  '20': { shooting: 42, finishing: 52, playmaking: 40, perimeter_defense: 48, interior_defense: 54, rebounding: 56, frame: 58 },   // Dues
  '22': { shooting: 50, finishing: 46, playmaking: 52, perimeter_defense: 54, interior_defense: 48, rebounding: 50, frame: 56 },   // Laird
  '41': { shooting: 74, finishing: 76, playmaking: 62, perimeter_defense: 68, interior_defense: 72, rebounding: 78, frame: 76 },   // Brewer
  '55': { shooting: 66, finishing: 72, playmaking: 64, perimeter_defense: 70, interior_defense: 66, rebounding: 74, frame: 72 },   // Munir-Jones
};

// Per-player height + weight (keyed by jersey number, 2025-26 roster)
export const PLAYER_PHYSICALS: Record<string, { height: string; weight: number }> = {
  '0':  { height: '6-4', weight: 190 },   // Thomas (jersey 00 → normalized 0)
  '1':  { height: '6-10', weight: 215 },  // Asceric (jersey 01)
  '2':  { height: '6-4', weight: 180 },   // Lewis
  '3':  { height: '6-5', weight: 200 },   // Thompson
  '4':  { height: '6-0', weight: 175 },   // Carter
  '5':  { height: '6-6', weight: 200 },   // Selden
  '7':  { height: '6-8', weight: 205 },   // Moratinos
  '9':  { height: '6-0', weight: 175 },   // Benbo
  '10': { height: '6-4', weight: 185 },   // Morris
  '11': { height: '6-2', weight: 165 },   // Mentor
  '12': { height: '6-5', weight: 200 },   // Turner
  '13': { height: '6-2', weight: 185 },   // Noel
  '15': { height: '6-2', weight: 185 },   // Morgan
  '20': { height: '6-9', weight: 205 },   // Dues
  '22': { height: '6-3', weight: 185 },   // Laird
  '41': { height: '6-5', weight: 200 },   // Brewer
  '55': { height: '6-4', weight: 190 },   // Munir-Jones
};

// Compute off/def KR from clusters
export function computeOffKR(c: ClusterRatings): number {
  return Math.round((c.shooting + c.finishing + c.playmaking) / 3);
}

export function computeDefKR(c: ClusterRatings): number {
  return Math.round((c.perimeter_defense + c.interior_defense + c.rebounding + c.frame) / 4);
}

// ── Canonical subclusters per cluster ──

export interface SubclusterRating {
  name: string;
  rating: number;
}

export const CLUSTER_SUBCLUSTERS: Record<keyof ClusterRatings, string[]> = {
  shooting: ['Spot-Up', 'Off-Screen', 'Pull-Up', 'Catch & Shoot', 'Free Throw'],
  finishing: ['Rim Finishing', 'Floater', 'Mid-Range', 'Post-Up'],
  playmaking: ['Ball Handling', 'Passing', 'PnR Creation', 'Transition'],
  perimeter_defense: ['Perimeter Containment', 'On-Ball Pressure', 'Isolation D'],
  interior_defense: ['Help & Rotate', 'Rim Protection', 'Closeout'],
  rebounding: ['Offensive Glass', 'Defensive Glass', 'Box Out'],
  frame: ['Physical', 'Athleticism', 'Endurance'],
};

// Deterministic hash for stable subcluster generation
function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// Generate subcluster ratings for a player's cluster
export function getPlayerSubclusters(
  playerNumber: string,
  clusterKey: keyof ClusterRatings,
): SubclusterRating[] {
  const clusters = PLAYER_CLUSTERS[playerNumber];
  if (!clusters) return [];
  const baseRating = clusters[clusterKey];
  const subs = CLUSTER_SUBCLUSTERS[clusterKey];

  return subs.map((name, i) => {
    const seed = simpleHash(`${playerNumber}-${clusterKey}-${i}`);
    const variation = (seed % 17) - 8; // -8 to +8
    const rating = Math.max(15, Math.min(98, baseRating + variation));
    return { name, rating };
  });
}
