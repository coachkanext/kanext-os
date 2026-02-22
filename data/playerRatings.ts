/**
 * Player KR Ratings — Placeholder data for National Pool display.
 * Overall KR (0–99) and 7 cluster KRs per player.
 * These are placeholder values until real KLVN pipeline is active.
 */

import type { ClusterType } from '@/types';
import { CLUSTER_SUBCLUSTERS, type ClusterRatings } from '@/data/roster-data';

export interface PlayerRatings {
  playerId: string;
  overall: number;
  clusters: Record<ClusterType, number>;
}

export const PLAYER_RATINGS: PlayerRatings[] = [
  // ── High School ──
  { playerId: 'pp-01', overall: 88, clusters: { shooting: 82, finishing: 79, playmaking: 92, on_ball_defense: 85, team_defense: 72, rebounding: 68, physical: 80 } },
  { playerId: 'pp-03', overall: 91, clusters: { shooting: 84, finishing: 90, playmaking: 78, on_ball_defense: 82, team_defense: 76, rebounding: 80, physical: 89 } },
  { playerId: 'pp-05', overall: 83, clusters: { shooting: 78, finishing: 72, playmaking: 90, on_ball_defense: 80, team_defense: 65, rebounding: 60, physical: 76 } },
  { playerId: 'pp-07', overall: 90, clusters: { shooting: 65, finishing: 88, playmaking: 70, on_ball_defense: 78, team_defense: 92, rebounding: 91, physical: 93 } },
  { playerId: 'pp-09', overall: 87, clusters: { shooting: 85, finishing: 86, playmaking: 76, on_ball_defense: 84, team_defense: 74, rebounding: 78, physical: 85 } },
  { playerId: 'pp-11', overall: 86, clusters: { shooting: 91, finishing: 78, playmaking: 80, on_ball_defense: 76, team_defense: 68, rebounding: 65, physical: 82 } },
  { playerId: 'pp-15', overall: 80, clusters: { shooting: 84, finishing: 74, playmaking: 72, on_ball_defense: 78, team_defense: 66, rebounding: 62, physical: 77 } },
  { playerId: 'pp-17', overall: 85, clusters: { shooting: 72, finishing: 84, playmaking: 68, on_ball_defense: 80, team_defense: 82, rebounding: 86, physical: 88 } },
  { playerId: 'pp-19', overall: 82, clusters: { shooting: 74, finishing: 70, playmaking: 91, on_ball_defense: 82, team_defense: 64, rebounding: 58, physical: 75 } },
  { playerId: 'pp-22', overall: 89, clusters: { shooting: 76, finishing: 87, playmaking: 74, on_ball_defense: 82, team_defense: 86, rebounding: 88, physical: 91 } },

  // ── JUCO ──
  { playerId: 'pp-02', overall: 84, clusters: { shooting: 88, finishing: 82, playmaking: 74, on_ball_defense: 72, team_defense: 65, rebounding: 70, physical: 78 } },
  { playerId: 'pp-06', overall: 86, clusters: { shooting: 68, finishing: 85, playmaking: 66, on_ball_defense: 74, team_defense: 80, rebounding: 88, physical: 87 } },
  { playerId: 'pp-08', overall: 83, clusters: { shooting: 87, finishing: 80, playmaking: 78, on_ball_defense: 76, team_defense: 68, rebounding: 65, physical: 79 } },
  { playerId: 'pp-12', overall: 81, clusters: { shooting: 70, finishing: 82, playmaking: 64, on_ball_defense: 76, team_defense: 78, rebounding: 84, physical: 83 } },
  { playerId: 'pp-14', overall: 85, clusters: { shooting: 82, finishing: 76, playmaking: 86, on_ball_defense: 84, team_defense: 70, rebounding: 66, physical: 80 } },
  { playerId: 'pp-16', overall: 82, clusters: { shooting: 52, finishing: 80, playmaking: 56, on_ball_defense: 68, team_defense: 90, rebounding: 92, physical: 88 } },
  { playerId: 'pp-18', overall: 83, clusters: { shooting: 78, finishing: 84, playmaking: 72, on_ball_defense: 78, team_defense: 74, rebounding: 80, physical: 82 } },
  { playerId: 'pp-21', overall: 87, clusters: { shooting: 90, finishing: 86, playmaking: 76, on_ball_defense: 74, team_defense: 66, rebounding: 68, physical: 84 } },
  { playerId: 'pp-23', overall: 80, clusters: { shooting: 76, finishing: 82, playmaking: 70, on_ball_defense: 78, team_defense: 72, rebounding: 76, physical: 80 } },

  // ── NCAA D2 ──
  { playerId: 'pp-10', overall: 79, clusters: { shooting: 76, finishing: 70, playmaking: 86, on_ball_defense: 82, team_defense: 64, rebounding: 60, physical: 74 } },
  { playerId: 'pp-24', overall: 76, clusters: { shooting: 80, finishing: 68, playmaking: 82, on_ball_defense: 74, team_defense: 62, rebounding: 58, physical: 72 } },

  // ── International ──
  { playerId: 'pp-04', overall: 84, clusters: { shooting: 62, finishing: 82, playmaking: 68, on_ball_defense: 72, team_defense: 88, rebounding: 90, physical: 92 } },
  { playerId: 'pp-13', overall: 82, clusters: { shooting: 80, finishing: 78, playmaking: 82, on_ball_defense: 76, team_defense: 74, rebounding: 72, physical: 80 } },
  { playerId: 'pp-20', overall: 81, clusters: { shooting: 58, finishing: 78, playmaking: 72, on_ball_defense: 70, team_defense: 86, rebounding: 84, physical: 88 } },

  // ── HS (additional) ──
  { playerId: 'pp-25', overall: 78, clusters: { shooting: 74, finishing: 76, playmaking: 70, on_ball_defense: 78, team_defense: 72, rebounding: 74, physical: 80 } },

  // ── Teammates ──
  { playerId: 'pp-26', overall: 79, clusters: { shooting: 76, finishing: 72, playmaking: 85, on_ball_defense: 80, team_defense: 66, rebounding: 62, physical: 74 } },
  { playerId: 'pp-27', overall: 75, clusters: { shooting: 72, finishing: 78, playmaking: 68, on_ball_defense: 76, team_defense: 70, rebounding: 74, physical: 78 } },
  { playerId: 'pp-28', overall: 72, clusters: { shooting: 58, finishing: 74, playmaking: 60, on_ball_defense: 70, team_defense: 76, rebounding: 82, physical: 80 } },
  { playerId: 'pp-29', overall: 78, clusters: { shooting: 84, finishing: 74, playmaking: 72, on_ball_defense: 70, team_defense: 62, rebounding: 64, physical: 76 } },
  { playerId: 'pp-30', overall: 77, clusters: { shooting: 68, finishing: 78, playmaking: 62, on_ball_defense: 72, team_defense: 80, rebounding: 84, physical: 82 } },
  { playerId: 'pp-31', overall: 76, clusters: { shooting: 74, finishing: 70, playmaking: 82, on_ball_defense: 78, team_defense: 64, rebounding: 60, physical: 73 } },
  { playerId: 'pp-32', overall: 74, clusters: { shooting: 50, finishing: 76, playmaking: 54, on_ball_defense: 66, team_defense: 84, rebounding: 86, physical: 85 } },
  { playerId: 'pp-33', overall: 77, clusters: { shooting: 80, finishing: 74, playmaking: 68, on_ball_defense: 82, team_defense: 70, rebounding: 66, physical: 78 } },
  { playerId: 'pp-34', overall: 80, clusters: { shooting: 86, finishing: 76, playmaking: 74, on_ball_defense: 74, team_defense: 66, rebounding: 62, physical: 78 } },
  { playerId: 'pp-35', overall: 75, clusters: { shooting: 66, finishing: 76, playmaking: 64, on_ball_defense: 74, team_defense: 78, rebounding: 80, physical: 82 } },

  // ── pp-36 through pp-200: Extended National Pool ──

  // NCAA D1 (pp-36 to pp-48) — Overall 78–92
  { playerId: 'pp-36', overall: 88, clusters: { shooting: 90, finishing: 82, playmaking: 86, on_ball_defense: 84, team_defense: 74, rebounding: 72, physical: 83 } },
  { playerId: 'pp-37', overall: 85, clusters: { shooting: 72, finishing: 86, playmaking: 70, on_ball_defense: 80, team_defense: 88, rebounding: 90, physical: 92 } },
  { playerId: 'pp-38', overall: 90, clusters: { shooting: 92, finishing: 84, playmaking: 88, on_ball_defense: 86, team_defense: 78, rebounding: 74, physical: 82 } },
  { playerId: 'pp-39', overall: 82, clusters: { shooting: 80, finishing: 78, playmaking: 84, on_ball_defense: 82, team_defense: 76, rebounding: 74, physical: 80 } },
  { playerId: 'pp-40', overall: 86, clusters: { shooting: 68, finishing: 88, playmaking: 72, on_ball_defense: 82, team_defense: 90, rebounding: 92, physical: 94 } },
  { playerId: 'pp-41', overall: 89, clusters: { shooting: 94, finishing: 80, playmaking: 86, on_ball_defense: 82, team_defense: 76, rebounding: 70, physical: 78 } },
  { playerId: 'pp-42', overall: 84, clusters: { shooting: 82, finishing: 86, playmaking: 78, on_ball_defense: 84, team_defense: 80, rebounding: 82, physical: 84 } },
  { playerId: 'pp-43', overall: 87, clusters: { shooting: 88, finishing: 82, playmaking: 90, on_ball_defense: 80, team_defense: 72, rebounding: 68, physical: 80 } },
  { playerId: 'pp-44', overall: 80, clusters: { shooting: 76, finishing: 82, playmaking: 74, on_ball_defense: 78, team_defense: 84, rebounding: 80, physical: 86 } },
  { playerId: 'pp-45', overall: 92, clusters: { shooting: 70, finishing: 90, playmaking: 78, on_ball_defense: 86, team_defense: 94, rebounding: 96, physical: 97 } },
  { playerId: 'pp-46', overall: 83, clusters: { shooting: 86, finishing: 78, playmaking: 80, on_ball_defense: 76, team_defense: 74, rebounding: 72, physical: 79 } },
  { playerId: 'pp-47', overall: 79, clusters: { shooting: 82, finishing: 74, playmaking: 76, on_ball_defense: 78, team_defense: 70, rebounding: 68, physical: 76 } },
  { playerId: 'pp-48', overall: 91, clusters: { shooting: 88, finishing: 92, playmaking: 84, on_ball_defense: 86, team_defense: 82, rebounding: 80, physical: 88 } },

  // NCAA D2 (pp-49 to pp-58) — Overall 70–82
  { playerId: 'pp-49', overall: 78, clusters: { shooting: 82, finishing: 72, playmaking: 80, on_ball_defense: 76, team_defense: 66, rebounding: 64, physical: 74 } },
  { playerId: 'pp-50', overall: 74, clusters: { shooting: 60, finishing: 76, playmaking: 62, on_ball_defense: 70, team_defense: 80, rebounding: 84, physical: 82 } },
  { playerId: 'pp-51', overall: 80, clusters: { shooting: 84, finishing: 76, playmaking: 78, on_ball_defense: 74, team_defense: 68, rebounding: 66, physical: 76 } },
  { playerId: 'pp-52', overall: 72, clusters: { shooting: 68, finishing: 74, playmaking: 66, on_ball_defense: 72, team_defense: 76, rebounding: 78, physical: 74 } },
  { playerId: 'pp-53', overall: 76, clusters: { shooting: 74, finishing: 72, playmaking: 82, on_ball_defense: 78, team_defense: 64, rebounding: 60, physical: 72 } },
  { playerId: 'pp-54', overall: 81, clusters: { shooting: 78, finishing: 84, playmaking: 76, on_ball_defense: 80, team_defense: 78, rebounding: 82, physical: 84 } },
  { playerId: 'pp-55', overall: 75, clusters: { shooting: 62, finishing: 78, playmaking: 64, on_ball_defense: 72, team_defense: 82, rebounding: 86, physical: 80 } },
  { playerId: 'pp-56', overall: 77, clusters: { shooting: 80, finishing: 70, playmaking: 84, on_ball_defense: 74, team_defense: 66, rebounding: 62, physical: 73 } },
  { playerId: 'pp-57', overall: 73, clusters: { shooting: 76, finishing: 68, playmaking: 70, on_ball_defense: 74, team_defense: 72, rebounding: 70, physical: 72 } },
  { playerId: 'pp-58', overall: 79, clusters: { shooting: 82, finishing: 76, playmaking: 74, on_ball_defense: 78, team_defense: 70, rebounding: 68, physical: 78 } },

  // NCAA D3 (pp-59 to pp-68) — Overall 62–76
  { playerId: 'pp-59', overall: 72, clusters: { shooting: 76, finishing: 66, playmaking: 74, on_ball_defense: 70, team_defense: 60, rebounding: 58, physical: 68 } },
  { playerId: 'pp-60', overall: 68, clusters: { shooting: 54, finishing: 72, playmaking: 56, on_ball_defense: 64, team_defense: 74, rebounding: 78, physical: 76 } },
  { playerId: 'pp-61', overall: 74, clusters: { shooting: 78, finishing: 70, playmaking: 72, on_ball_defense: 74, team_defense: 66, rebounding: 64, physical: 70 } },
  { playerId: 'pp-62', overall: 66, clusters: { shooting: 60, finishing: 68, playmaking: 62, on_ball_defense: 66, team_defense: 72, rebounding: 74, physical: 70 } },
  { playerId: 'pp-63', overall: 70, clusters: { shooting: 72, finishing: 64, playmaking: 78, on_ball_defense: 68, team_defense: 58, rebounding: 56, physical: 66 } },
  { playerId: 'pp-64', overall: 76, clusters: { shooting: 74, finishing: 78, playmaking: 72, on_ball_defense: 76, team_defense: 74, rebounding: 76, physical: 78 } },
  { playerId: 'pp-65', overall: 64, clusters: { shooting: 52, finishing: 66, playmaking: 54, on_ball_defense: 62, team_defense: 72, rebounding: 76, physical: 74 } },
  { playerId: 'pp-66', overall: 71, clusters: { shooting: 68, finishing: 72, playmaking: 74, on_ball_defense: 72, team_defense: 64, rebounding: 60, physical: 68 } },
  { playerId: 'pp-67', overall: 69, clusters: { shooting: 74, finishing: 64, playmaking: 66, on_ball_defense: 68, team_defense: 62, rebounding: 64, physical: 70 } },
  { playerId: 'pp-68', overall: 73, clusters: { shooting: 70, finishing: 76, playmaking: 68, on_ball_defense: 74, team_defense: 70, rebounding: 72, physical: 76 } },

  // NAIA (pp-69 to pp-80) — Overall 68–80
  { playerId: 'pp-69', overall: 76, clusters: { shooting: 80, finishing: 70, playmaking: 78, on_ball_defense: 74, team_defense: 64, rebounding: 62, physical: 72 } },
  { playerId: 'pp-70', overall: 72, clusters: { shooting: 58, finishing: 74, playmaking: 60, on_ball_defense: 68, team_defense: 78, rebounding: 82, physical: 80 } },
  { playerId: 'pp-71', overall: 78, clusters: { shooting: 82, finishing: 74, playmaking: 76, on_ball_defense: 72, team_defense: 66, rebounding: 64, physical: 74 } },
  { playerId: 'pp-72', overall: 70, clusters: { shooting: 66, finishing: 72, playmaking: 64, on_ball_defense: 70, team_defense: 74, rebounding: 76, physical: 72 } },
  { playerId: 'pp-73', overall: 74, clusters: { shooting: 76, finishing: 68, playmaking: 80, on_ball_defense: 72, team_defense: 62, rebounding: 60, physical: 70 } },
  { playerId: 'pp-74', overall: 80, clusters: { shooting: 74, finishing: 82, playmaking: 72, on_ball_defense: 78, team_defense: 80, rebounding: 84, physical: 86 } },
  { playerId: 'pp-75', overall: 69, clusters: { shooting: 72, finishing: 64, playmaking: 66, on_ball_defense: 70, team_defense: 68, rebounding: 66, physical: 68 } },
  { playerId: 'pp-76', overall: 77, clusters: { shooting: 80, finishing: 72, playmaking: 74, on_ball_defense: 76, team_defense: 70, rebounding: 68, physical: 76 } },
  { playerId: 'pp-77', overall: 73, clusters: { shooting: 70, finishing: 76, playmaking: 68, on_ball_defense: 72, team_defense: 72, rebounding: 74, physical: 74 } },
  { playerId: 'pp-78', overall: 75, clusters: { shooting: 62, finishing: 78, playmaking: 64, on_ball_defense: 74, team_defense: 82, rebounding: 80, physical: 82 } },
  { playerId: 'pp-79', overall: 71, clusters: { shooting: 74, finishing: 66, playmaking: 72, on_ball_defense: 68, team_defense: 60, rebounding: 58, physical: 68 } },
  { playerId: 'pp-80', overall: 68, clusters: { shooting: 64, finishing: 70, playmaking: 62, on_ball_defense: 66, team_defense: 72, rebounding: 74, physical: 70 } },

  // USCAA (pp-81 to pp-90) — Overall 58–72
  { playerId: 'pp-81', overall: 68, clusters: { shooting: 72, finishing: 62, playmaking: 70, on_ball_defense: 66, team_defense: 56, rebounding: 54, physical: 64 } },
  { playerId: 'pp-82', overall: 64, clusters: { shooting: 50, finishing: 66, playmaking: 52, on_ball_defense: 60, team_defense: 70, rebounding: 74, physical: 72 } },
  { playerId: 'pp-83', overall: 70, clusters: { shooting: 74, finishing: 66, playmaking: 68, on_ball_defense: 68, team_defense: 62, rebounding: 60, physical: 66 } },
  { playerId: 'pp-84', overall: 62, clusters: { shooting: 58, finishing: 64, playmaking: 56, on_ball_defense: 62, team_defense: 68, rebounding: 70, physical: 66 } },
  { playerId: 'pp-85', overall: 66, clusters: { shooting: 68, finishing: 60, playmaking: 72, on_ball_defense: 64, team_defense: 54, rebounding: 52, physical: 62 } },
  { playerId: 'pp-86', overall: 72, clusters: { shooting: 66, finishing: 74, playmaking: 64, on_ball_defense: 70, team_defense: 76, rebounding: 78, physical: 78 } },
  { playerId: 'pp-87', overall: 60, clusters: { shooting: 56, finishing: 62, playmaking: 54, on_ball_defense: 58, team_defense: 64, rebounding: 68, physical: 66 } },
  { playerId: 'pp-88', overall: 65, clusters: { shooting: 70, finishing: 60, playmaking: 64, on_ball_defense: 62, team_defense: 56, rebounding: 54, physical: 62 } },
  { playerId: 'pp-89', overall: 58, clusters: { shooting: 52, finishing: 60, playmaking: 50, on_ball_defense: 56, team_defense: 64, rebounding: 66, physical: 62 } },
  { playerId: 'pp-90', overall: 71, clusters: { shooting: 74, finishing: 68, playmaking: 66, on_ball_defense: 70, team_defense: 64, rebounding: 62, physical: 70 } },

  // NCCAA D1 (pp-91 to pp-100) — Overall 64–76
  { playerId: 'pp-91', overall: 74, clusters: { shooting: 78, finishing: 68, playmaking: 76, on_ball_defense: 72, team_defense: 62, rebounding: 60, physical: 70 } },
  { playerId: 'pp-92', overall: 70, clusters: { shooting: 56, finishing: 72, playmaking: 58, on_ball_defense: 66, team_defense: 76, rebounding: 80, physical: 78 } },
  { playerId: 'pp-93', overall: 76, clusters: { shooting: 80, finishing: 72, playmaking: 74, on_ball_defense: 74, team_defense: 66, rebounding: 64, physical: 72 } },
  { playerId: 'pp-94', overall: 68, clusters: { shooting: 64, finishing: 70, playmaking: 62, on_ball_defense: 66, team_defense: 72, rebounding: 74, physical: 70 } },
  { playerId: 'pp-95', overall: 72, clusters: { shooting: 74, finishing: 66, playmaking: 78, on_ball_defense: 70, team_defense: 60, rebounding: 58, physical: 68 } },
  { playerId: 'pp-96', overall: 66, clusters: { shooting: 60, finishing: 68, playmaking: 58, on_ball_defense: 64, team_defense: 74, rebounding: 76, physical: 72 } },
  { playerId: 'pp-97', overall: 75, clusters: { shooting: 78, finishing: 72, playmaking: 70, on_ball_defense: 76, team_defense: 68, rebounding: 66, physical: 74 } },
  { playerId: 'pp-98', overall: 64, clusters: { shooting: 62, finishing: 66, playmaking: 60, on_ball_defense: 64, team_defense: 70, rebounding: 72, physical: 68 } },
  { playerId: 'pp-99', overall: 71, clusters: { shooting: 68, finishing: 74, playmaking: 66, on_ball_defense: 72, team_defense: 66, rebounding: 68, physical: 72 } },
  { playerId: 'pp-100', overall: 73, clusters: { shooting: 76, finishing: 70, playmaking: 74, on_ball_defense: 70, team_defense: 64, rebounding: 62, physical: 70 } },

  // NCCAA D2 (pp-101 to pp-110) — Overall 58–70
  { playerId: 'pp-101', overall: 66, clusters: { shooting: 70, finishing: 60, playmaking: 68, on_ball_defense: 64, team_defense: 54, rebounding: 52, physical: 62 } },
  { playerId: 'pp-102', overall: 62, clusters: { shooting: 48, finishing: 64, playmaking: 50, on_ball_defense: 58, team_defense: 68, rebounding: 72, physical: 70 } },
  { playerId: 'pp-103', overall: 68, clusters: { shooting: 72, finishing: 64, playmaking: 66, on_ball_defense: 66, team_defense: 60, rebounding: 58, physical: 64 } },
  { playerId: 'pp-104', overall: 60, clusters: { shooting: 56, finishing: 62, playmaking: 54, on_ball_defense: 58, team_defense: 66, rebounding: 68, physical: 64 } },
  { playerId: 'pp-105', overall: 64, clusters: { shooting: 66, finishing: 58, playmaking: 70, on_ball_defense: 62, team_defense: 52, rebounding: 50, physical: 60 } },
  { playerId: 'pp-106', overall: 70, clusters: { shooting: 64, finishing: 72, playmaking: 62, on_ball_defense: 68, team_defense: 74, rebounding: 76, physical: 76 } },
  { playerId: 'pp-107', overall: 58, clusters: { shooting: 54, finishing: 60, playmaking: 52, on_ball_defense: 56, team_defense: 62, rebounding: 66, physical: 64 } },
  { playerId: 'pp-108', overall: 67, clusters: { shooting: 70, finishing: 62, playmaking: 64, on_ball_defense: 66, team_defense: 60, rebounding: 58, physical: 66 } },
  { playerId: 'pp-109', overall: 63, clusters: { shooting: 60, finishing: 66, playmaking: 58, on_ball_defense: 62, team_defense: 68, rebounding: 70, physical: 66 } },
  { playerId: 'pp-110', overall: 69, clusters: { shooting: 72, finishing: 66, playmaking: 68, on_ball_defense: 68, team_defense: 62, rebounding: 60, physical: 66 } },

  // JUCO D1 (pp-111 to pp-122) — Overall 75–88
  { playerId: 'pp-111', overall: 84, clusters: { shooting: 88, finishing: 78, playmaking: 82, on_ball_defense: 80, team_defense: 72, rebounding: 68, physical: 78 } },
  { playerId: 'pp-112', overall: 80, clusters: { shooting: 66, finishing: 82, playmaking: 64, on_ball_defense: 74, team_defense: 84, rebounding: 88, physical: 86 } },
  { playerId: 'pp-113', overall: 86, clusters: { shooting: 90, finishing: 82, playmaking: 84, on_ball_defense: 78, team_defense: 74, rebounding: 70, physical: 80 } },
  { playerId: 'pp-114', overall: 78, clusters: { shooting: 74, finishing: 80, playmaking: 72, on_ball_defense: 76, team_defense: 78, rebounding: 80, physical: 80 } },
  { playerId: 'pp-115', overall: 82, clusters: { shooting: 84, finishing: 76, playmaking: 86, on_ball_defense: 80, team_defense: 70, rebounding: 66, physical: 78 } },
  { playerId: 'pp-116', overall: 88, clusters: { shooting: 72, finishing: 90, playmaking: 74, on_ball_defense: 82, team_defense: 92, rebounding: 94, physical: 96 } },
  { playerId: 'pp-117', overall: 76, clusters: { shooting: 78, finishing: 72, playmaking: 74, on_ball_defense: 76, team_defense: 68, rebounding: 66, physical: 74 } },
  { playerId: 'pp-118', overall: 85, clusters: { shooting: 88, finishing: 80, playmaking: 82, on_ball_defense: 82, team_defense: 76, rebounding: 72, physical: 80 } },
  { playerId: 'pp-119', overall: 79, clusters: { shooting: 76, finishing: 82, playmaking: 74, on_ball_defense: 78, team_defense: 74, rebounding: 76, physical: 78 } },
  { playerId: 'pp-120', overall: 75, clusters: { shooting: 60, finishing: 78, playmaking: 62, on_ball_defense: 72, team_defense: 82, rebounding: 84, physical: 82 } },
  { playerId: 'pp-121', overall: 83, clusters: { shooting: 86, finishing: 78, playmaking: 80, on_ball_defense: 78, team_defense: 74, rebounding: 70, physical: 80 } },
  { playerId: 'pp-122', overall: 77, clusters: { shooting: 74, finishing: 80, playmaking: 70, on_ball_defense: 76, team_defense: 72, rebounding: 74, physical: 78 } },

  // JUCO D2 (pp-123 to pp-132) — Overall 68–80
  { playerId: 'pp-123', overall: 76, clusters: { shooting: 80, finishing: 70, playmaking: 78, on_ball_defense: 74, team_defense: 64, rebounding: 62, physical: 72 } },
  { playerId: 'pp-124', overall: 72, clusters: { shooting: 58, finishing: 74, playmaking: 60, on_ball_defense: 68, team_defense: 78, rebounding: 82, physical: 80 } },
  { playerId: 'pp-125', overall: 78, clusters: { shooting: 82, finishing: 74, playmaking: 76, on_ball_defense: 76, team_defense: 68, rebounding: 66, physical: 74 } },
  { playerId: 'pp-126', overall: 70, clusters: { shooting: 66, finishing: 72, playmaking: 64, on_ball_defense: 68, team_defense: 74, rebounding: 76, physical: 72 } },
  { playerId: 'pp-127', overall: 74, clusters: { shooting: 76, finishing: 68, playmaking: 80, on_ball_defense: 72, team_defense: 62, rebounding: 60, physical: 70 } },
  { playerId: 'pp-128', overall: 80, clusters: { shooting: 74, finishing: 82, playmaking: 72, on_ball_defense: 78, team_defense: 84, rebounding: 86, physical: 86 } },
  { playerId: 'pp-129', overall: 69, clusters: { shooting: 72, finishing: 64, playmaking: 66, on_ball_defense: 68, team_defense: 66, rebounding: 64, physical: 68 } },
  { playerId: 'pp-130', overall: 77, clusters: { shooting: 80, finishing: 72, playmaking: 76, on_ball_defense: 74, team_defense: 70, rebounding: 68, physical: 76 } },
  { playerId: 'pp-131', overall: 73, clusters: { shooting: 70, finishing: 76, playmaking: 68, on_ball_defense: 72, team_defense: 72, rebounding: 74, physical: 74 } },
  { playerId: 'pp-132', overall: 68, clusters: { shooting: 64, finishing: 70, playmaking: 62, on_ball_defense: 66, team_defense: 72, rebounding: 74, physical: 70 } },

  // JUCO D3 (pp-133 to pp-140) — Overall 62–74
  { playerId: 'pp-133', overall: 70, clusters: { shooting: 74, finishing: 64, playmaking: 72, on_ball_defense: 68, team_defense: 58, rebounding: 56, physical: 66 } },
  { playerId: 'pp-134', overall: 66, clusters: { shooting: 52, finishing: 68, playmaking: 54, on_ball_defense: 62, team_defense: 72, rebounding: 76, physical: 74 } },
  { playerId: 'pp-135', overall: 72, clusters: { shooting: 76, finishing: 68, playmaking: 70, on_ball_defense: 70, team_defense: 64, rebounding: 62, physical: 68 } },
  { playerId: 'pp-136', overall: 64, clusters: { shooting: 60, finishing: 66, playmaking: 58, on_ball_defense: 62, team_defense: 70, rebounding: 72, physical: 68 } },
  { playerId: 'pp-137', overall: 68, clusters: { shooting: 70, finishing: 62, playmaking: 74, on_ball_defense: 66, team_defense: 56, rebounding: 54, physical: 64 } },
  { playerId: 'pp-138', overall: 74, clusters: { shooting: 68, finishing: 76, playmaking: 66, on_ball_defense: 72, team_defense: 78, rebounding: 80, physical: 80 } },
  { playerId: 'pp-139', overall: 63, clusters: { shooting: 66, finishing: 58, playmaking: 60, on_ball_defense: 62, team_defense: 66, rebounding: 68, physical: 64 } },
  { playerId: 'pp-140', overall: 71, clusters: { shooting: 74, finishing: 68, playmaking: 68, on_ball_defense: 70, team_defense: 64, rebounding: 62, physical: 70 } },

  // 3C2A (pp-141 to pp-148) — Overall 70–82
  { playerId: 'pp-141', overall: 78, clusters: { shooting: 82, finishing: 72, playmaking: 80, on_ball_defense: 76, team_defense: 66, rebounding: 64, physical: 74 } },
  { playerId: 'pp-142', overall: 74, clusters: { shooting: 60, finishing: 76, playmaking: 62, on_ball_defense: 70, team_defense: 80, rebounding: 84, physical: 82 } },
  { playerId: 'pp-143', overall: 80, clusters: { shooting: 84, finishing: 76, playmaking: 78, on_ball_defense: 78, team_defense: 70, rebounding: 68, physical: 76 } },
  { playerId: 'pp-144', overall: 72, clusters: { shooting: 68, finishing: 74, playmaking: 66, on_ball_defense: 70, team_defense: 76, rebounding: 78, physical: 74 } },
  { playerId: 'pp-145', overall: 76, clusters: { shooting: 78, finishing: 70, playmaking: 82, on_ball_defense: 74, team_defense: 64, rebounding: 62, physical: 72 } },
  { playerId: 'pp-146', overall: 82, clusters: { shooting: 76, finishing: 84, playmaking: 74, on_ball_defense: 80, team_defense: 82, rebounding: 86, physical: 88 } },
  { playerId: 'pp-147', overall: 71, clusters: { shooting: 74, finishing: 66, playmaking: 68, on_ball_defense: 70, team_defense: 68, rebounding: 66, physical: 70 } },
  { playerId: 'pp-148', overall: 79, clusters: { shooting: 82, finishing: 74, playmaking: 76, on_ball_defense: 78, team_defense: 72, rebounding: 70, physical: 78 } },

  // High School (pp-149 to pp-165) — Overall 72–92
  { playerId: 'pp-149', overall: 86, clusters: { shooting: 90, finishing: 80, playmaking: 88, on_ball_defense: 82, team_defense: 72, rebounding: 68, physical: 80 } },
  { playerId: 'pp-150', overall: 80, clusters: { shooting: 66, finishing: 82, playmaking: 68, on_ball_defense: 76, team_defense: 86, rebounding: 88, physical: 90 } },
  { playerId: 'pp-151', overall: 88, clusters: { shooting: 92, finishing: 84, playmaking: 86, on_ball_defense: 84, team_defense: 76, rebounding: 72, physical: 82 } },
  { playerId: 'pp-152', overall: 76, clusters: { shooting: 72, finishing: 78, playmaking: 70, on_ball_defense: 76, team_defense: 74, rebounding: 76, physical: 78 } },
  { playerId: 'pp-153', overall: 82, clusters: { shooting: 84, finishing: 76, playmaking: 86, on_ball_defense: 78, team_defense: 68, rebounding: 64, physical: 76 } },
  { playerId: 'pp-154', overall: 90, clusters: { shooting: 74, finishing: 92, playmaking: 76, on_ball_defense: 84, team_defense: 94, rebounding: 92, physical: 96 } },
  { playerId: 'pp-155', overall: 74, clusters: { shooting: 78, finishing: 68, playmaking: 72, on_ball_defense: 72, team_defense: 66, rebounding: 64, physical: 72 } },
  { playerId: 'pp-156', overall: 84, clusters: { shooting: 88, finishing: 78, playmaking: 82, on_ball_defense: 80, team_defense: 74, rebounding: 70, physical: 80 } },
  { playerId: 'pp-157', overall: 78, clusters: { shooting: 80, finishing: 74, playmaking: 76, on_ball_defense: 76, team_defense: 70, rebounding: 68, physical: 76 } },
  { playerId: 'pp-158', overall: 92, clusters: { shooting: 94, finishing: 88, playmaking: 90, on_ball_defense: 86, team_defense: 82, rebounding: 78, physical: 86 } },
  { playerId: 'pp-159', overall: 73, clusters: { shooting: 58, finishing: 76, playmaking: 60, on_ball_defense: 70, team_defense: 80, rebounding: 82, physical: 80 } },
  { playerId: 'pp-160', overall: 85, clusters: { shooting: 88, finishing: 80, playmaking: 84, on_ball_defense: 82, team_defense: 76, rebounding: 72, physical: 80 } },
  { playerId: 'pp-161', overall: 79, clusters: { shooting: 76, finishing: 82, playmaking: 74, on_ball_defense: 78, team_defense: 74, rebounding: 76, physical: 80 } },
  { playerId: 'pp-162', overall: 87, clusters: { shooting: 72, finishing: 88, playmaking: 74, on_ball_defense: 82, team_defense: 90, rebounding: 92, physical: 94 } },
  { playerId: 'pp-163', overall: 75, clusters: { shooting: 80, finishing: 70, playmaking: 74, on_ball_defense: 72, team_defense: 64, rebounding: 62, physical: 72 } },
  { playerId: 'pp-164', overall: 81, clusters: { shooting: 78, finishing: 84, playmaking: 76, on_ball_defense: 80, team_defense: 78, rebounding: 80, physical: 82 } },
  { playerId: 'pp-165', overall: 72, clusters: { shooting: 68, finishing: 74, playmaking: 66, on_ball_defense: 72, team_defense: 70, rebounding: 72, physical: 74 } },

  // International (pp-166 to pp-180) — Overall 74–88
  { playerId: 'pp-166', overall: 82, clusters: { shooting: 86, finishing: 76, playmaking: 80, on_ball_defense: 78, team_defense: 72, rebounding: 68, physical: 78 } },
  { playerId: 'pp-167', overall: 78, clusters: { shooting: 64, finishing: 80, playmaking: 66, on_ball_defense: 74, team_defense: 84, rebounding: 86, physical: 86 } },
  { playerId: 'pp-168', overall: 85, clusters: { shooting: 88, finishing: 82, playmaking: 84, on_ball_defense: 80, team_defense: 74, rebounding: 70, physical: 80 } },
  { playerId: 'pp-169', overall: 76, clusters: { shooting: 72, finishing: 78, playmaking: 70, on_ball_defense: 76, team_defense: 74, rebounding: 76, physical: 78 } },
  { playerId: 'pp-170', overall: 80, clusters: { shooting: 82, finishing: 74, playmaking: 84, on_ball_defense: 78, team_defense: 68, rebounding: 66, physical: 76 } },
  { playerId: 'pp-171', overall: 88, clusters: { shooting: 74, finishing: 90, playmaking: 76, on_ball_defense: 82, team_defense: 92, rebounding: 94, physical: 96 } },
  { playerId: 'pp-172', overall: 74, clusters: { shooting: 76, finishing: 70, playmaking: 72, on_ball_defense: 72, team_defense: 68, rebounding: 66, physical: 72 } },
  { playerId: 'pp-173', overall: 84, clusters: { shooting: 86, finishing: 80, playmaking: 82, on_ball_defense: 82, team_defense: 76, rebounding: 74, physical: 80 } },
  { playerId: 'pp-174', overall: 77, clusters: { shooting: 74, finishing: 80, playmaking: 72, on_ball_defense: 76, team_defense: 74, rebounding: 76, physical: 78 } },
  { playerId: 'pp-175', overall: 86, clusters: { shooting: 70, finishing: 88, playmaking: 72, on_ball_defense: 80, team_defense: 90, rebounding: 92, physical: 94 } },
  { playerId: 'pp-176', overall: 75, clusters: { shooting: 78, finishing: 70, playmaking: 74, on_ball_defense: 74, team_defense: 66, rebounding: 64, physical: 72 } },
  { playerId: 'pp-177', overall: 83, clusters: { shooting: 86, finishing: 78, playmaking: 80, on_ball_defense: 80, team_defense: 76, rebounding: 72, physical: 80 } },
  { playerId: 'pp-178', overall: 79, clusters: { shooting: 76, finishing: 82, playmaking: 74, on_ball_defense: 78, team_defense: 74, rebounding: 76, physical: 80 } },
  { playerId: 'pp-179', overall: 87, clusters: { shooting: 90, finishing: 84, playmaking: 86, on_ball_defense: 82, team_defense: 78, rebounding: 74, physical: 82 } },
  { playerId: 'pp-180', overall: 81, clusters: { shooting: 78, finishing: 84, playmaking: 76, on_ball_defense: 80, team_defense: 78, rebounding: 80, physical: 82 } },

  // Mixed levels — remaining pool (pp-181 to pp-200)
  // NCAA D1 guards
  { playerId: 'pp-181', overall: 86, clusters: { shooting: 90, finishing: 80, playmaking: 88, on_ball_defense: 82, team_defense: 72, rebounding: 68, physical: 78 } },
  { playerId: 'pp-182', overall: 83, clusters: { shooting: 86, finishing: 78, playmaking: 84, on_ball_defense: 80, team_defense: 70, rebounding: 66, physical: 76 } },
  // NCAA D2 wing
  { playerId: 'pp-183', overall: 76, clusters: { shooting: 74, finishing: 78, playmaking: 72, on_ball_defense: 76, team_defense: 72, rebounding: 74, physical: 78 } },
  // NAIA big
  { playerId: 'pp-184', overall: 74, clusters: { shooting: 60, finishing: 76, playmaking: 62, on_ball_defense: 70, team_defense: 82, rebounding: 84, physical: 82 } },
  // JUCO D1 guard
  { playerId: 'pp-185', overall: 82, clusters: { shooting: 86, finishing: 76, playmaking: 84, on_ball_defense: 78, team_defense: 68, rebounding: 64, physical: 76 } },
  // HS wing
  { playerId: 'pp-186', overall: 84, clusters: { shooting: 82, finishing: 86, playmaking: 78, on_ball_defense: 82, team_defense: 78, rebounding: 80, physical: 84 } },
  // International guard
  { playerId: 'pp-187', overall: 80, clusters: { shooting: 84, finishing: 74, playmaking: 82, on_ball_defense: 76, team_defense: 66, rebounding: 64, physical: 74 } },
  // NCAA D3 big
  { playerId: 'pp-188', overall: 70, clusters: { shooting: 56, finishing: 72, playmaking: 58, on_ball_defense: 66, team_defense: 78, rebounding: 82, physical: 80 } },
  // USCAA guard
  { playerId: 'pp-189', overall: 66, clusters: { shooting: 72, finishing: 60, playmaking: 68, on_ball_defense: 64, team_defense: 54, rebounding: 52, physical: 62 } },
  // NCCAA D1 wing
  { playerId: 'pp-190', overall: 72, clusters: { shooting: 70, finishing: 74, playmaking: 68, on_ball_defense: 72, team_defense: 68, rebounding: 70, physical: 72 } },
  // 3C2A guard
  { playerId: 'pp-191', overall: 76, clusters: { shooting: 80, finishing: 70, playmaking: 78, on_ball_defense: 74, team_defense: 64, rebounding: 60, physical: 72 } },
  // JUCO D2 big
  { playerId: 'pp-192', overall: 74, clusters: { shooting: 60, finishing: 76, playmaking: 58, on_ball_defense: 70, team_defense: 82, rebounding: 84, physical: 84 } },
  // HS guard
  { playerId: 'pp-193', overall: 80, clusters: { shooting: 84, finishing: 74, playmaking: 82, on_ball_defense: 78, team_defense: 66, rebounding: 62, physical: 74 } },
  // NAIA wing
  { playerId: 'pp-194', overall: 72, clusters: { shooting: 70, finishing: 74, playmaking: 68, on_ball_defense: 72, team_defense: 68, rebounding: 70, physical: 74 } },
  // NCAA D1 big
  { playerId: 'pp-195', overall: 84, clusters: { shooting: 70, finishing: 86, playmaking: 72, on_ball_defense: 80, team_defense: 90, rebounding: 92, physical: 94 } },
  // International wing
  { playerId: 'pp-196', overall: 80, clusters: { shooting: 78, finishing: 82, playmaking: 76, on_ball_defense: 80, team_defense: 76, rebounding: 78, physical: 80 } },
  // JUCO D3 guard
  { playerId: 'pp-197', overall: 68, clusters: { shooting: 72, finishing: 62, playmaking: 70, on_ball_defense: 66, team_defense: 56, rebounding: 54, physical: 64 } },
  // NCCAA D2 big
  { playerId: 'pp-198', overall: 64, clusters: { shooting: 50, finishing: 66, playmaking: 52, on_ball_defense: 60, team_defense: 72, rebounding: 76, physical: 74 } },
  // NCAA D2 guard
  { playerId: 'pp-199', overall: 78, clusters: { shooting: 82, finishing: 72, playmaking: 80, on_ball_defense: 76, team_defense: 66, rebounding: 62, physical: 74 } },
  // HS big
  { playerId: 'pp-200', overall: 86, clusters: { shooting: 72, finishing: 88, playmaking: 70, on_ball_defense: 80, team_defense: 90, rebounding: 92, physical: 94 } },
];

/** Get ratings for a specific player, or null if not found */
export function getPlayerRatings(playerId: string): PlayerRatings | null {
  return PLAYER_RATINGS.find((r) => r.playerId === playerId) ?? null;
}

// ─── Shared Helpers ───

// Deterministic hash for stable subcluster generation
function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Generate subclusters for a pool player's cluster */
export function getPoolPlayerSubclusters(
  playerId: string,
  clusterKey: keyof ClusterRatings,
  baseRating: number,
): { name: string; rating: number }[] {
  const subs = CLUSTER_SUBCLUSTERS[clusterKey];
  return subs.map((name, i) => {
    const seed = simpleHash(`${playerId}-${clusterKey}-${i}`);
    const variation = (seed % 17) - 8;
    const rating = Math.max(15, Math.min(98, baseRating + variation));
    return { name, rating };
  });
}

/** Compute team-level cluster averages from a set of player IDs */
export function getTeamClusterAverages(playerIds: string[]): {
  clusters: Record<ClusterType, number>;
  overall: number;
  offKR: number;
  defKR: number;
} {
  const allClusters: ClusterType[] = [
    'shooting', 'finishing', 'playmaking',
    'on_ball_defense', 'team_defense', 'rebounding', 'physical',
  ];
  const sums: Record<string, number> = {};
  allClusters.forEach((c) => { sums[c] = 0; });
  let totalOverall = 0;
  let count = 0;

  playerIds.forEach((id) => {
    const r = getPlayerRatings(id);
    if (!r) return;
    count++;
    totalOverall += r.overall;
    allClusters.forEach((c) => { sums[c] += r.clusters[c]; });
  });

  if (count === 0) {
    const zeros = {} as Record<ClusterType, number>;
    allClusters.forEach((c) => { zeros[c] = 0; });
    return { clusters: zeros, overall: 0, offKR: 0, defKR: 0 };
  }

  const clusters = {} as Record<ClusterType, number>;
  allClusters.forEach((c) => { clusters[c] = Math.round(sums[c] / count); });
  const overall = Math.round(totalOverall / count);
  const offKR = Math.round((clusters.shooting + clusters.finishing + clusters.playmaking) / 3);
  const defKR = Math.round((clusters.on_ball_defense + clusters.team_defense + clusters.rebounding + clusters.physical) / 4);

  return { clusters, overall, offKR, defKR };
}

/** Weekly update period options */
export const WEEKLY_UPDATE_OPTIONS = [
  { value: 'preseason', label: 'Preseason' },
  { value: 'week_1', label: 'Week 1' },
  { value: 'week_2', label: 'Week 2' },
  { value: 'week_3', label: 'Week 3' },
  { value: 'week_4', label: 'Week 4' },
  { value: 'week_5', label: 'Week 5' },
  { value: 'week_6', label: 'Week 6' },
  { value: 'week_7', label: 'Week 7' },
  { value: 'week_8', label: 'Week 8' },
  { value: 'week_9', label: 'Week 9' },
  { value: 'week_10', label: 'Week 10' },
  { value: 'week_11', label: 'Week 11' },
  { value: 'week_12', label: 'Week 12' },
  { value: 'week_13', label: 'Week 13' },
  { value: 'week_14', label: 'Week 14' },
  { value: 'conf_tourney', label: 'Conf Tourney' },
  { value: 'national_tourney', label: 'National Tournament' },
];
