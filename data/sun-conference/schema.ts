/**
 * KaNeXT Conference — Men's Basketball
 * Normalized Database Schema
 * Per: Claude Global Database Ingest Contract v1
 *
 * Scope: KaNeXT Conference → Men's Basketball only
 * Historical depth: 4 seasons (2021-22 through 2024-25)
 */

// ── STEP 1: Program (Team) Identification ──

export interface Program {
  program_id: string;
  program_name: string;           // e.g. "Westfield University Men's Basketball"
  school_name: string;            // e.g. "Westfield University"
  conference: 'The KaNeXT Conference';
  governing_body: 'NAA';
  division: 'NAA';
  athletics_website_url: string;
  mens_basketball_home_url: string;
}

// ── STEP 2: Coaching Staff ──

export interface CoachingStaff {
  program_id: string;
  head_coach_name: string;
  head_coach_title: string;
  assistant_coaches: { name: string; role: string | null }[];
  staff_page_url: string;
}

// ── STEP 3: Player Roster (Per Season) ──

export interface Player {
  player_id: string;
  full_name: string;
}

export interface RosterEntry {
  player_id: string;
  program_id: string;
  season: string;                  // e.g. "2024-25"
  jersey_number: string | null;
  position: string | null;
  height: string | null;
  weight: number | null;
  class_year: string | null;
  hometown: string | null;
  previous_school: string | null;
  player_profile_url: string | null;
}

// ── STEP 4A: Team Stats (Per Season) ──

export interface TeamStats {
  program_id: string;
  season: string;
  games: number | null;
  points: number | null;
  fg: number | null;
  fga: number | null;
  fg_pct: number | null;
  three_pt: number | null;
  three_pa: number | null;
  three_pt_pct: number | null;
  ft: number | null;
  fta: number | null;
  ft_pct: number | null;
  offensive_rebounds: number | null;
  defensive_rebounds: number | null;
  total_rebounds: number | null;
  assists: number | null;
  turnovers: number | null;
  steals: number | null;
  blocks: number | null;
  fouls: number | null;
  minutes: number | null;
}

// ── STEP 4B: Individual Season Stats ──

export interface IndividualSeasonStats {
  player_id: string;
  program_id: string;
  season: string;
  games_played: number | null;
  games_started: number | null;
  minutes_total: number | null;
  minutes_avg: number | null;
  fg: number | null;
  fga: number | null;
  fg_pct: number | null;
  three_pt: number | null;
  three_pa: number | null;
  three_pt_pct: number | null;
  ft: number | null;
  fta: number | null;
  ft_pct: number | null;
  points_total: number | null;
  points_avg: number | null;
  offensive_rebounds: number | null;
  defensive_rebounds: number | null;
  total_rebounds: number | null;
  assists: number | null;
  turnovers: number | null;
  steals: number | null;
  blocks: number | null;
  fouls: number | null;
}

// ── STEP 4C: Game-by-Game Logs ──

export interface GameLog {
  player_id: string;
  game_id: string;
  season: string;
  game_date: string | null;
  opponent: string;
  home_away: 'H' | 'A' | null;
  result: 'W' | 'L' | null;
  minutes: number | null;
  fg: number | null;
  fga: number | null;
  three_pt: number | null;
  three_pa: number | null;
  ft: number | null;
  fta: number | null;
  offensive_rebounds: number | null;
  defensive_rebounds: number | null;
  total_rebounds: number | null;
  assists: number | null;
  turnovers: number | null;
  steals: number | null;
  blocks: number | null;
  fouls: number | null;
  points: number | null;
}

// ── STEP 4D: Game Highs ──

export interface GameHigh {
  player_id: string;
  season: string;
  stat_category: string;          // PTS, REB, AST, etc.
  value: number;
  opponent: string | null;
  date: string | null;
}

// ── STEP 4E: Category Leaders ──

export interface CategoryLeader {
  program_id: string;
  season: string;
  stat_category: string;
  player_name: string;
  value: number;
  rank: number | null;
}

// ── Composite Database ──

export interface SunConferenceDatabase {
  programs: Program[];
  coaching_staff: CoachingStaff[];
  players: Player[];
  roster_entries: RosterEntry[];
  team_stats: TeamStats[];
  individual_season_stats: IndividualSeasonStats[];
  game_logs: GameLog[];
  game_highs: GameHigh[];
  category_leaders: CategoryLeader[];
}
