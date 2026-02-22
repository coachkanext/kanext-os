/**
 * Trait Library — Sub-traits per cluster (54 total)
 * Canonical definitions from the KaNeXT Trait Library spec.
 * Used by sort drill-down and player detail accordion.
 */

import type { ClusterType } from '@/types';

export interface SubTrait {
  id: string;
  label: string;
}

export const TRAIT_LIBRARY: Record<ClusterType, SubTrait[]> = {
  shooting: [
    { id: '3pt_spot_up', label: '3PT Spot-Up' },
    { id: '3pt_movement', label: '3PT Movement' },
    { id: '3pt_off_dribble', label: '3PT Off-Dribble' },
    { id: '3pt_deep_range', label: '3PT Deep Range' },
    { id: '2pt_catch_and_shoot', label: '2PT C&S' },
    { id: '2pt_off_dribble', label: '2PT Off-Dribble' },
    { id: 'free_throw', label: 'Free Throw' },
  ],
  finishing: [
    { id: 'layup', label: 'Layup' },
    { id: 'floater_runner', label: 'Floater/Runner' },
    { id: 'dunk', label: 'Dunk' },
    { id: 'close', label: 'Close' },
    { id: 'foul_draw_rate', label: 'Foul Draw Rate' },
  ],
  playmaking: [
    { id: 'passing_accuracy', label: 'Passing Accuracy' },
    { id: 'passing_vision', label: 'Passing Vision' },
    { id: 'drive_and_kick', label: 'Drive-and-Kick' },
    { id: 'transition', label: 'Transition' },
    { id: 'ball_security', label: 'Ball Security' },
    { id: 'screen_assist', label: 'Screen Assist' },
    { id: 'hockey_assist', label: 'Hockey Assist' },
  ],
  on_ball_defense: [
    { id: 'containment', label: 'Containment' },
    { id: 'ball_pressure', label: 'Ball Pressure' },
    { id: 'screen_nav', label: 'Screen Nav' },
    { id: 'shot_contest', label: 'Shot Contest' },
    { id: 'steal', label: 'Steal' },
    { id: 'off_ball_denial', label: 'Off-Ball Denial' },
    { id: 'disruption_obd', label: 'Disruption' },
    { id: 'foul_discipline_obd', label: 'Foul Discipline' },
  ],
  team_defense: [
    { id: 'block', label: 'Block' },
    { id: 'rim_deterrence', label: 'Rim Deterrence' },
    { id: 'vertical_contest', label: 'Vertical Contest' },
    { id: 'post_defense', label: 'Post Defense' },
    { id: 'help_defense', label: 'Help Defense' },
    { id: 'roll_man_defense', label: 'Roll Man Defense' },
    { id: 'disruption_td', label: 'Disruption' },
    { id: 'foul_discipline_td', label: 'Foul Discipline' },
    { id: 'positioning', label: 'Positioning' },
  ],
  rebounding: [
    { id: 'defensive_reb', label: 'Defensive' },
    { id: 'offensive_reb', label: 'Offensive' },
    { id: 'box_out', label: 'Box-Out' },
    { id: 'conversion', label: 'Conversion' },
    { id: 'range_tracking', label: 'Range & Tracking' },
    { id: 'outlet', label: 'Outlet' },
  ],
  physical: [
    { id: 'speed_w_ball', label: 'Speed w/ Ball' },
    { id: 'speed_wo_ball', label: 'Speed w/o Ball' },
    { id: 'acceleration', label: 'Acceleration' },
    { id: 'deceleration', label: 'Deceleration' },
    { id: 'cod', label: 'COD' },
    { id: 'lateral_quickness', label: 'Lateral Quickness' },
    { id: 'vertical_pop', label: 'Vertical Pop' },
    { id: 'strength', label: 'Strength' },
    { id: 'power_through_contact', label: 'Power Through Contact' },
    { id: 'endurance', label: 'Endurance' },
    { id: 'motor', label: 'Motor' },
    { id: 'body_control', label: 'Body Control' },
  ],
};

/** Display labels for clusters in the sort panel */
export const SORT_CLUSTER_LABELS: Record<ClusterType, string> = {
  shooting: 'Shooting',
  finishing: 'Finishing',
  playmaking: 'Playmaking',
  on_ball_defense: 'OB Defense',
  team_defense: 'Team Defense',
  rebounding: 'Rebounding',
  physical: 'Physical',
};

/** All cluster types in display order */
export const CLUSTER_ORDER: ClusterType[] = [
  'shooting',
  'finishing',
  'playmaking',
  'on_ball_defense',
  'team_defense',
  'rebounding',
  'physical',
];
