import type { SortConfig, SortOption } from "@/types/filters";

/* Traditional → PER GAME (counting stats per game) */
export const PER_GAME_SORT_OPTIONS: SortOption[] = [
  { key: "mpg", label: "MPG", defaultDirection: "desc" },
  { key: "ppg", label: "PPG", defaultDirection: "desc" },
  { key: "rpg", label: "RPG", defaultDirection: "desc" },
  { key: "apg", label: "APG", defaultDirection: "desc" },
  { key: "spg", label: "SPG", defaultDirection: "desc" },
  { key: "bpg", label: "BPG", defaultDirection: "desc" },
  { key: "topg", label: "TOPG", defaultDirection: "asc" },
];

/* Traditional → TOTALS (raw season sums) */
export const TOTALS_SORT_OPTIONS: SortOption[] = [
  { key: "gp", label: "GP", defaultDirection: "desc" },
  { key: "gs", label: "GS", defaultDirection: "desc" },
  { key: "total_min", label: "MIN", defaultDirection: "desc" },
  { key: "total_pts", label: "PTS", defaultDirection: "desc" },
  { key: "total_trb", label: "TRB", defaultDirection: "desc" },
  { key: "total_ast", label: "AST", defaultDirection: "desc" },
  { key: "total_fgm", label: "FGM", defaultDirection: "desc" },
];

/* Traditional → SHOOTING (pure shooting efficiency + shot profile) */
export const SHOOTING_SORT_OPTIONS: SortOption[] = [
  { key: "fg_pct", label: "FG%", defaultDirection: "desc" },
  { key: "three_pct", label: "3P%", defaultDirection: "desc" },
  { key: "ft_pct", label: "FT%", defaultDirection: "desc" },
  { key: "ts_pct", label: "TS%", defaultDirection: "desc" },
  { key: "efg_pct", label: "eFG%", defaultDirection: "desc" },
  { key: "two_pct", label: "2P%", defaultDirection: "desc" },
  { key: "three_par", label: "3PAr", defaultDirection: "desc" },
];

/* Traditional → ADVANCED (possession-based rates) */
export const ADVANCED_SORT_OPTIONS: SortOption[] = [
  { key: "ast_pct", label: "AST%", defaultDirection: "desc" },
  { key: "usg_pct", label: "USG%", defaultDirection: "desc" },
  { key: "tov_pct", label: "TOV%", defaultDirection: "asc" },
  { key: "stl_pct", label: "STL%", defaultDirection: "desc" },
  { key: "blk_pct", label: "BLK%", defaultDirection: "desc" },
  { key: "reb_pct", label: "REB%", defaultDirection: "desc" },
  { key: "per", label: "PER", defaultDirection: "desc" },
];

/* Traditional → SCORING (scoring profile / breakdown) */
export const SCORING_SORT_OPTIONS: SortOption[] = [
  { key: "pct_2pt", label: "%2PT", defaultDirection: "desc" },
  { key: "pct_3pt", label: "%3PT", defaultDirection: "desc" },
  { key: "pct_ft", label: "%FT", defaultDirection: "desc" },
  { key: "ft_rate", label: "FTr", defaultDirection: "desc" },
  { key: "pts_fga", label: "PTS/FGA", defaultDirection: "desc" },
  { key: "ppp", label: "PPP", defaultDirection: "desc" },
];

/* Traditional → PER 40 (pace-adjusted counting stats) */
export const PER40_SORT_OPTIONS: SortOption[] = [
  { key: "pts_40", label: "PTS/40", defaultDirection: "desc" },
  { key: "reb_40", label: "REB/40", defaultDirection: "desc" },
  { key: "ast_40", label: "AST/40", defaultDirection: "desc" },
  { key: "stl_40", label: "STL/40", defaultDirection: "desc" },
  { key: "blk_40", label: "BLK/40", defaultDirection: "desc" },
  { key: "to_40", label: "TO/40", defaultDirection: "asc" },
];

/* Traditional: 6 expandable categories */
export interface TraditionalCategory {
  key: "per_game" | "totals" | "shooting" | "advanced" | "scoring" | "per40";
  label: string;
  options: SortOption[];
}

export const TRADITIONAL_CATEGORIES: TraditionalCategory[] = [
  { key: "per_game", label: "Per Game", options: PER_GAME_SORT_OPTIONS },
  { key: "totals", label: "Totals", options: TOTALS_SORT_OPTIONS },
  { key: "shooting", label: "Shooting", options: SHOOTING_SORT_OPTIONS },
  { key: "advanced", label: "Advanced", options: ADVANCED_SORT_OPTIONS },
  { key: "scoring", label: "Scoring", options: SCORING_SORT_OPTIONS },
  { key: "per40", label: "Per 40", options: PER40_SORT_OPTIONS },
];

/* KaNeXT: top-level KR option */
export const KANEXT_TOP_OPTIONS: SortOption[] = [
  { key: "kr", label: "KR", defaultDirection: "desc" },
];

/* KaNeXT: 8 clusters, each with selectable traits */
export interface TraitOption {
  key: string;
  label: string;
}

export interface ClusterOption {
  key: string;
  label: string;
  defaultDirection: "asc" | "desc";
  traits: TraitOption[];
}

export const KANEXT_CLUSTERS: ClusterOption[] = [
  {
    key: "shooting", label: "Shooting", defaultDirection: "desc",
    traits: [
      { key: "trait_3pt_spot_up", label: "3PT Spot-Up" },
      { key: "trait_3pt_movement", label: "3PT Movement" },
      { key: "trait_3pt_pull_up", label: "3PT Pull-Up" },
      { key: "trait_3pt_deep_range", label: "3PT Deep Range" },
      { key: "trait_midrange_shotmaking", label: "Midrange Shotmaking" },
      { key: "trait_free_throw", label: "Free Throw" },
    ],
  },
  {
    key: "finishing", label: "Finishing", defaultDirection: "desc",
    traits: [
      { key: "trait_rim_pressure", label: "Rim Pressure" },
      { key: "trait_contact_finishing", label: "Contact Finishing" },
      { key: "trait_touch_craft", label: "Touch / Craft" },
      { key: "trait_foul_draw", label: "Foul Draw" },
      { key: "trait_vertical_finishing", label: "Vertical Finishing" },
      { key: "trait_transition_finishing", label: "Transition Finishing" },
    ],
  },
  {
    key: "playmaking", label: "Playmaking", defaultDirection: "desc",
    traits: [
      { key: "trait_advantage_creation", label: "Advantage Creation" },
      { key: "trait_passing_vision", label: "Passing Vision" },
      { key: "trait_passing_execution", label: "Passing Execution" },
      { key: "trait_advantage_passing", label: "Advantage Passing" },
      { key: "trait_transition_playmaking", label: "Transition Playmaking" },
      { key: "trait_ball_security", label: "Ball Security" },
      { key: "trait_connector_creation", label: "Connector Creation" },
    ],
  },
  {
    key: "poa_defense", label: "POA Defense", defaultDirection: "desc",
    traits: [
      { key: "trait_containment", label: "Containment" },
      { key: "trait_screen_navigation", label: "Screen Navigation" },
      { key: "trait_ball_pressure", label: "Ball Pressure" },
      { key: "trait_closeout_recovery", label: "Closeout & Recovery" },
      { key: "trait_deflections", label: "Deflections" },
      { key: "trait_steal_timing", label: "Steal Timing" },
      { key: "trait_foul_discipline", label: "Foul Discipline" },
    ],
  },
  {
    key: "team_defense", label: "Team Defense", defaultDirection: "desc",
    traits: [
      { key: "trait_help_rotation", label: "Help & Rotation" },
      { key: "trait_rim_protection", label: "Rim Protection" },
      { key: "trait_closeout_execution", label: "Closeout Execution" },
      { key: "trait_off_ball_positioning", label: "Off-Ball Positioning" },
      { key: "trait_communication_qb", label: "Communication & QB" },
      { key: "trait_versatility", label: "Versatility" },
      { key: "trait_team_foul_discipline", label: "Team Foul Discipline" },
    ],
  },
  {
    key: "rebounding", label: "Rebounding", defaultDirection: "desc",
    traits: [
      { key: "trait_defensive_rebounding", label: "Defensive Rebounding" },
      { key: "trait_offensive_rebounding", label: "Offensive Rebounding" },
      { key: "trait_box_out", label: "Box-Out" },
      { key: "trait_rebound_range", label: "Rebound Range" },
      { key: "trait_hands", label: "Hands" },
      { key: "trait_second_jump", label: "Second-Jump / Tip Ability" },
    ],
  },
  {
    key: "tools", label: "Tools", defaultDirection: "desc",
    traits: [
      { key: "trait_height", label: "Height" },
      { key: "trait_length", label: "Length" },
      { key: "trait_strength", label: "Strength" },
      { key: "trait_speed", label: "Speed" },
      { key: "trait_lateral_quickness", label: "Lateral Quickness" },
      { key: "trait_vertical_pop", label: "Vertical Pop" },
      { key: "trait_motor", label: "Motor" },
      { key: "trait_endurance", label: "Endurance" },
    ],
  },
  {
    key: "iq", label: "IQ", defaultDirection: "desc",
    traits: [
      { key: "trait_decision_speed", label: "Decision Speed" },
      { key: "trait_read_accuracy", label: "Read Accuracy" },
      { key: "trait_shot_decision", label: "Shot Decision" },
      { key: "trait_play_discipline", label: "Play Discipline" },
      { key: "trait_risk_management", label: "Risk Management" },
      { key: "trait_situation_iq", label: "Situation IQ" },
    ],
  },
];

export const DEFAULT_TRADITIONAL_SORT: SortConfig = { key: "ppg", direction: "desc" };
export const DEFAULT_KANEXT_SORT: SortConfig = { key: "kr", direction: "desc" };
