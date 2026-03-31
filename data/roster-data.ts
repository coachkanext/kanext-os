/**
 * Shared roster data used across roster-content, depth-chart, and other components.
 * Extracted to break circular dependencies.
 */

// KaNeXT colors
export const TEAM_COLORS = {
  primary: '#1A1714',    // KaNeXT Royal Blue
  secondary: '#B8943E',  // KaNeXT Gold
  accent: '#ffffff',
  background: '#000000',
  cardBg: '#0B0F14',
  white: '#FFFFFF',
  gray: '#9C9790',
};

// ── Per-player cluster ratings (keyed by jersey number) ──
export type ClusterRatings = {
  shooting: number;
  finishing: number;
  playmaking: number;
  on_ball_defense: number;
  team_defense: number;
  rebounding: number;
  physical: number;
};

export const PLAYER_CLUSTERS: Record<string, ClusterRatings> = {
  '0':  { shooting: 58, finishing: 62, playmaking: 55, on_ball_defense: 72, team_defense: 64, rebounding: 70, physical: 74 },   // Thomas
  '1':  { shooting: 48, finishing: 65, playmaking: 42, on_ball_defense: 60, team_defense: 78, rebounding: 80, physical: 76 },   // Asceric
  '2':  { shooting: 50, finishing: 52, playmaking: 44, on_ball_defense: 58, team_defense: 52, rebounding: 56, physical: 62 },   // Lewis
  '3':  { shooting: 52, finishing: 48, playmaking: 54, on_ball_defense: 56, team_defense: 50, rebounding: 48, physical: 60 },   // Thompson
  '4':  { shooting: 82, finishing: 90, playmaking: 84, on_ball_defense: 78, team_defense: 72, rebounding: 76, physical: 86 },   // Carter
  '5':  { shooting: 66, finishing: 80, playmaking: 78, on_ball_defense: 76, team_defense: 88, rebounding: 86, physical: 84 },   // Selden
  '7':  { shooting: 56, finishing: 72, playmaking: 50, on_ball_defense: 66, team_defense: 76, rebounding: 74, physical: 78 },   // Moratinos
  '9':  { shooting: 54, finishing: 50, playmaking: 62, on_ball_defense: 58, team_defense: 48, rebounding: 52, physical: 56 },   // Benbo
  '10': { shooting: 48, finishing: 56, playmaking: 46, on_ball_defense: 54, team_defense: 58, rebounding: 60, physical: 64 },   // Morris
  '11': { shooting: 74, finishing: 70, playmaking: 86, on_ball_defense: 78, team_defense: 68, rebounding: 72, physical: 76 },   // Mentor
  '12': { shooting: 46, finishing: 50, playmaking: 42, on_ball_defense: 54, team_defense: 50, rebounding: 52, physical: 60 },   // Turner
  '13': { shooting: 86, finishing: 76, playmaking: 74, on_ball_defense: 72, team_defense: 64, rebounding: 68, physical: 70 },   // Noel
  '15': { shooting: 60, finishing: 58, playmaking: 68, on_ball_defense: 64, team_defense: 56, rebounding: 62, physical: 66 },   // Morgan
  '20': { shooting: 42, finishing: 52, playmaking: 40, on_ball_defense: 48, team_defense: 54, rebounding: 56, physical: 58 },   // Dues
  '22': { shooting: 50, finishing: 46, playmaking: 52, on_ball_defense: 54, team_defense: 48, rebounding: 50, physical: 56 },   // Laird
  '41': { shooting: 78, finishing: 80, playmaking: 66, on_ball_defense: 72, team_defense: 76, rebounding: 82, physical: 80 },   // Brewer
  '55': { shooting: 66, finishing: 72, playmaking: 64, on_ball_defense: 70, team_defense: 66, rebounding: 74, physical: 72 },   // Munir-Jones
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
  return Math.round((c.on_ball_defense + c.team_defense + c.rebounding + c.physical) / 4);
}

// ── Canonical subclusters per cluster ──

export interface SubclusterRating {
  name: string;
  rating: number;
}

export const CLUSTER_SUBCLUSTERS: Record<keyof ClusterRatings, string[]> = {
  shooting: [
    '3PT — Spot-Up (Catch-and-Shoot)',
    '3PT — Movement',
    '3PT — Off-the-Dribble',
    '3PT — Deep Range',
    '2PT Jumper — Catch-and-Shoot',
    '2PT Jumper — Off-the-Dribble',
    'Free Throw',
  ],
  finishing: [
    'Layup Finishing',
    'Floater / Runner Finishing',
    'Dunk Finishing',
    'Close Finishing',
    'Foul Draw Rate (Paint)',
  ],
  playmaking: [
    'Passing Accuracy',
    'Passing Vision',
    'Drive-and-Kick Passing',
    'Transition Playmaking',
    'Ball Security',
    'Screen Assist Creation',
    'Hockey Assist Creation',
  ],
  on_ball_defense: [
    'On-Ball Containment',
    'Ball Pressure',
    'Screen Navigation',
    'Perimeter Shot Contest',
    'Steal',
    'Off-Ball Denial',
    'Perimeter Disruption',
    'Perimeter Foul Discipline',
  ],
  team_defense: [
    'Block',
    'Rim Deterrence',
    'Vertical Contest Effectiveness',
    'Post Defense',
    'Help Defense (Interior)',
    'Roll Man Defense',
    'Interior Disruption',
    'Interior Foul Discipline',
    'Interior Positioning',
  ],
  rebounding: [
    'Defensive Rebounding',
    'Offensive Rebounding',
    'Box-Out Effectiveness',
    'Rebound Conversion (Secure vs Tip)',
    'Rebound Range & Tracking',
    'Rebound-to-Playmaking (Outlet Impact)',
  ],
  physical: [
    'Speed — With Ball',
    'Speed — Without Ball',
    'Acceleration (Burst)',
    'Deceleration (Stop Control)',
    'Change of Direction (Agility)',
    'Lateral Quickness',
    'Vertical Pop (Live-Play)',
    'Strength (Functional)',
    'Power Through Contact',
    'Endurance',
    'Motor',
    'Body Control',
  ],
};

// ── Per-player roster management metadata ──

export type PlayerStatus = 'available' | 'injured' | 'out' | 'redshirt';

export interface RosterMeta {
  status: PlayerStatus;
  statusNote?: string;
  aidPct: number;
  nilAmount: number;
  gpa: number;
  rosterNotes: string;
  flagged?: boolean;
}

export const ROSTER_META: Record<string, RosterMeta> = {
  '4':  { status: 'available', aidPct: 100, nilAmount: 8500,  gpa: 3.4, rosterNotes: 'Go-to guy. Feed him early.' },
  '5':  { status: 'available', aidPct: 100, nilAmount: 6000,  gpa: 3.1, rosterNotes: 'Most versatile big. Can pass out of the post.' },
  '11': { status: 'available', aidPct: 75,  nilAmount: 5000,  gpa: 2.8, rosterNotes: 'Veteran leader, strong mid-range game.', flagged: true },
  '13': { status: 'available', aidPct: 75,  nilAmount: 0,     gpa: 3.2, rosterNotes: 'Consistent shooter, can get hot.' },
  '41': { status: 'available', aidPct: 50,  nilAmount: 0,     gpa: 2.6, rosterNotes: 'Reliable scorer, good positional rebounder.' },
  '55': { status: 'available', aidPct: 50,  nilAmount: 3500,  gpa: 2.9, rosterNotes: 'Athletic, strong rebounder for his position.' },
  '0':  { status: 'available', aidPct: 25,  nilAmount: 0,     gpa: 3.0, rosterNotes: 'Good defender, offense still developing.' },
  '7':  { status: 'available', aidPct: 50,  nilAmount: 0,     gpa: 2.5, rosterNotes: 'Long, athletic. Good rim protection.' },
  '1':  { status: 'available', aidPct: 40,  nilAmount: 0,     gpa: 2.7, rosterNotes: 'Tallest player on roster. Stay out of foul trouble.' },
  '15': { status: 'available', aidPct: 25,  nilAmount: 0,     gpa: 2.4, rosterNotes: 'Developing — needs more reps.', flagged: true },
  '9':  { status: 'available', aidPct: 0,   nilAmount: 0,     gpa: 3.5, rosterNotes: 'Young — learning the system.' },
  '3':  { status: 'available', aidPct: 0,   nilAmount: 0,     gpa: 2.3, rosterNotes: 'Needs confidence.' },
  '10': { status: 'injured',   aidPct: 25,  nilAmount: 0,     gpa: 2.1, rosterNotes: 'Working on his frame.', statusNote: 'Ankle sprain — day-to-day', flagged: true },
  '12': { status: 'redshirt',  aidPct: 0,   nilAmount: 0,     gpa: 3.6, rosterNotes: 'Physical, needs polish. RS year.' },
  '20': { status: 'out',       aidPct: 0,   nilAmount: 0,     gpa: 2.0, rosterNotes: 'Personal leave.', statusNote: 'Excused absence' },
  '2':  { status: 'available', aidPct: 0,   nilAmount: 0,     gpa: 2.8, rosterNotes: 'Physical, needs polish.' },
  '22': { status: 'available', aidPct: 0,   nilAmount: 0,     gpa: 3.3, rosterNotes: '' },
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

// ── Portal Risk computation ──

import type { PortalRiskLevel } from '@/types';

/**
 * Compute portal risk for a player based on KR, minutes, role, and NIL.
 * KR badge color: green 80+, yellow 70-79, orange 60-69, red <60
 */
export function getKRBadgeColor(kr: number): string {
  if (kr >= 80) return '#22c55e';
  if (kr >= 70) return '#f59e0b';
  if (kr >= 60) return '#B8943E';
  return '#ef4444';
}

export function computePortalRisk(jersey: string, kr: number, minutes: number, nilAmount: number): PortalRiskLevel {
  let risk = 0;
  // Low minutes + decent KR = higher risk (underused talent)
  if (kr >= 70 && minutes < 15) risk += 2;
  if (kr >= 60 && minutes < 10) risk += 1;
  // No NIL = slightly higher risk
  if (nilAmount === 0 && kr >= 65) risk += 1;
  // Injured/redshirt players have elevated risk
  const meta = ROSTER_META[jersey];
  if (meta?.status === 'injured' || meta?.status === 'redshirt') risk += 1;

  if (risk >= 3) return 'red';
  if (risk >= 2) return 'yellow';
  if (risk >= 1) return 'yellow';
  return 'green';
}

export function getPortalRiskColor(risk: PortalRiskLevel): string {
  const map: Record<PortalRiskLevel, string> = {
    green: '#22c55e',
    yellow: '#f59e0b',
    orange: '#B8943E',
    red: '#ef4444',
  };
  return map[risk];
}
