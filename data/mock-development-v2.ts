/**
 * Mock data for Development v2 — Full Development OS.
 * Weekly plans, player plans, drill library, evidence queue, transfer metrics.
 */

import type { Position } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

export type ProgressLevel = 'needs-work' | 'progressing' | 'achieved';
export type SessionType = 'practice' | 'lift' | 'film' | 'individual' | 'rest';
export type EvidenceType = 'clip' | 'stat' | 'note';
export type EvidenceStatus = 'pending' | 'reviewed' | 'flagged';
export type TransferLabel = 'positive' | 'neutral' | 'negative' | 'emerging';
export type DrillDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type AlertType = 'regression' | 'injury' | 'breakout' | 'milestone';

export interface NonNegotiable {
  id: string;
  rule: string;
  category: string;
}

export interface TeamPriority {
  id: string;
  rank: number;
  title: string;
  description: string;
  progress: number; // 0-100
  coverageTier: 'strong' | 'adequate' | 'weak';
  cluster: string;
}

export interface PositionGroup {
  id: string;
  name: string;
  positions: string[];
  playerCount: number;
  topFocus: string;
  healthScore: number; // 0-100
}

export interface PlayerAlert {
  id: string;
  playerId: string;
  playerName: string;
  type: AlertType;
  message: string;
  date: string;
}

export interface SessionBlock {
  id: string;
  type: SessionType;
  title: string;
  time: string;
  duration: string;
  focus?: string;
  notes?: string;
}

export interface DayPlan {
  day: string;
  date: string;
  sessions: SessionBlock[];
}

export interface WeeklyPlan {
  weekLabel: string;
  startDate: string;
  endDate: string;
  days: DayPlan[];
}

export interface PlayerPlanBlock {
  id: string;
  title: string;
  cluster: string;
  trait: string;
  status: ProgressLevel;
  targetDate: string;
  drills: string[];
}

export interface PlayerMeasurable {
  name: string;
  current: string;
  target: string;
  delta: string;
}

export interface PlayerPlan {
  playerId: string;
  playerName: string;
  number: string;
  position: string;
  roleTarget: string;
  topGaps: string[];
  planBlocks: PlayerPlanBlock[];
  measurables: PlayerMeasurable[];
  evidenceCount: number;
  progressTimeline: { week: string; score: number }[];
  coachNote: string;
  progress: ProgressLevel;
}

export interface DrillTemplate {
  id: string;
  name: string;
  cluster: string;
  trait: string;
  gameAction: string;
  difficulty: DrillDifficulty;
  repPrescription: string;
  coachingCues: string[];
  duration: string;
}

export interface EvidenceItem {
  id: string;
  playerId: string;
  playerName: string;
  planItemTitle: string;
  type: EvidenceType;
  status: EvidenceStatus;
  date: string;
  description: string;
}

export interface TransferMetric {
  id: string;
  playerId: string;
  playerName: string;
  skillArea: string;
  practiceScore: number;
  gameScore: number;
  transferLabel: TransferLabel;
  delta: number;
}

export interface ProgressSnapshot {
  overallScore: number;
  deltaFromLastWeek: number;
  achievedCount: number;
  progressingCount: number;
  needsWorkCount: number;
  topImprover: string;
  topImproverDelta: number;
}

// =============================================================================
// NON-NEGOTIABLES
// =============================================================================

export const WEEKLY_NON_NEGOTIABLES: NonNegotiable[] = [
  { id: 'nn-1', rule: 'Every player gets 15 min individual skill work daily', category: 'Individual' },
  { id: 'nn-2', rule: 'Film review before every practice — no exceptions', category: 'Film' },
  { id: 'nn-3', rule: 'Defensive closeout drill opens every practice', category: 'Defense' },
  { id: 'nn-4', rule: '200 made free throws per player per week', category: 'Shooting' },
  { id: 'nn-5', rule: 'Recovery day is recovery — no live contact', category: 'Recovery' },
];

// =============================================================================
// TOP 5 TEAM PRIORITIES
// =============================================================================

export const TEAM_PRIORITIES: TeamPriority[] = [
  { id: 'tp-1', rank: 1, title: 'Perimeter Shooting Consistency', description: 'Team 3PT% dropped 4% in last 5 games. Need catch-and-shoot reps.', progress: 42, coverageTier: 'weak', cluster: 'Shooting' },
  { id: 'tp-2', rank: 2, title: 'Transition Defense', description: 'Giving up 14.2 fast break points/game (conference avg: 10.8).', progress: 55, coverageTier: 'adequate', cluster: 'Team Defense' },
  { id: 'tp-3', rank: 3, title: 'Free Throw Improvement', description: 'Team FT% at 68.4% — below conference average of 72%.', progress: 60, coverageTier: 'adequate', cluster: 'Shooting' },
  { id: 'tp-4', rank: 4, title: 'Ball Security in Half Court', description: 'Turnover rate in half-court sets: 16.2% (target: <13%).', progress: 48, coverageTier: 'weak', cluster: 'Playmaking' },
  { id: 'tp-5', rank: 5, title: 'Post Entry Passing', description: 'Developing guard-to-post entry packages for Kalejaiye/Diomande.', progress: 72, coverageTier: 'strong', cluster: 'Playmaking' },
];

// =============================================================================
// POSITION GROUPS
// =============================================================================

export const POSITION_GROUPS: PositionGroup[] = [
  { id: 'pg-guards', name: 'Guards', positions: ['PG', 'SG'], playerCount: 4, topFocus: 'Ball screen decision-making', healthScore: 78 },
  { id: 'pg-wings', name: 'Wings', positions: ['SF', 'SG/SF'], playerCount: 3, topFocus: 'Off-screen movement', healthScore: 65 },
  { id: 'pg-forwards', name: 'Forwards', positions: ['PF', 'SF/PF'], playerCount: 3, topFocus: '3PT shooting & post footwork', healthScore: 55 },
  { id: 'pg-centers', name: 'Centers', positions: ['C'], playerCount: 2, topFocus: 'Rim protection & pick-and-pop', healthScore: 82 },
];

// =============================================================================
// PLAYER ALERTS
// =============================================================================

export const PLAYER_ALERTS: PlayerAlert[] = [
  { id: 'pa-1', playerId: '7', playerName: 'Marcus Collins', type: 'regression', message: '3PT% dropped from 38% to 29% over last 3 games.', date: 'Feb 14' },
  { id: 'pa-2', playerId: '3', playerName: 'Paul Diomande', type: 'breakout', message: 'Post moves improvement: +12% FG on post-ups this month.', date: 'Feb 13' },
  { id: 'pa-3', playerId: '10', playerName: 'Jalen Washington', type: 'milestone', message: 'Completed all 5 conditioning benchmarks for rotation eligibility.', date: 'Feb 12' },
  { id: 'pa-4', playerId: '6', playerName: 'David Blake', type: 'injury', message: 'Left ankle soreness — limited practice participation.', date: 'Feb 11' },
];

// =============================================================================
// WEEKLY PLAN
// =============================================================================

export const CURRENT_WEEKLY_PLAN: WeeklyPlan = {
  weekLabel: 'Week 22',
  startDate: 'Feb 17',
  endDate: 'Feb 23',
  days: [
    {
      day: 'Monday',
      date: 'Feb 17',
      sessions: [
        { id: 'w22-m1', type: 'film', title: 'Film Review: Thomas Game', time: '9:00 AM', duration: '45 min', focus: 'Transition defense breakdowns' },
        { id: 'w22-m2', type: 'practice', title: 'Full Practice', time: '2:00 PM', duration: '2 hr', focus: 'Defensive closeouts, half-court offense' },
        { id: 'w22-m3', type: 'individual', title: 'Individual Skill Work', time: '4:30 PM', duration: '30 min', focus: 'Shooting, ball handling' },
      ],
    },
    {
      day: 'Tuesday',
      date: 'Feb 18',
      sessions: [
        { id: 'w22-t1', type: 'lift', title: 'Strength Training', time: '8:00 AM', duration: '1 hr', focus: 'Lower body, explosiveness' },
        { id: 'w22-t2', type: 'practice', title: 'Practice — Offensive Focus', time: '2:00 PM', duration: '1.5 hr', focus: 'Post entry, PnR reads' },
        { id: 'w22-t3', type: 'film', title: 'Scouting Report: Webber', time: '5:00 PM', duration: '30 min', focus: 'Webber defensive tendencies' },
      ],
    },
    {
      day: 'Wednesday',
      date: 'Feb 19',
      sessions: [
        { id: 'w22-w1', type: 'individual', title: 'Shooting Lab', time: '9:00 AM', duration: '45 min', focus: '200 makes, catch-and-shoot focus' },
        { id: 'w22-w2', type: 'practice', title: 'Walk-Through + Scrimmage', time: '2:00 PM', duration: '2 hr', focus: 'Game plan install: Webber' },
      ],
    },
    {
      day: 'Thursday',
      date: 'Feb 20',
      sessions: [
        { id: 'w22-th1', type: 'lift', title: 'Strength Training', time: '8:00 AM', duration: '45 min', focus: 'Upper body, core' },
        { id: 'w22-th2', type: 'practice', title: 'Shootaround — Game Prep', time: '11:00 AM', duration: '1 hr', focus: 'Final game plan review' },
        { id: 'w22-th3', type: 'film', title: 'Pre-Game Film', time: '3:00 PM', duration: '30 min', focus: 'Webber key actions' },
      ],
    },
    {
      day: 'Friday',
      date: 'Feb 21',
      sessions: [
        { id: 'w22-f1', type: 'rest', title: 'Game Day — Recovery', time: '10:00 AM', duration: '1 hr', notes: 'Light shooting, stretching only' },
        { id: 'w22-f2', type: 'practice', title: 'Game vs Webber International', time: '7:00 PM', duration: '2 hr', focus: 'GAME DAY' },
      ],
    },
    {
      day: 'Saturday',
      date: 'Feb 22',
      sessions: [
        { id: 'w22-s1', type: 'rest', title: 'Recovery Day', time: '—', duration: '—', notes: 'Active recovery, no live contact' },
      ],
    },
    {
      day: 'Sunday',
      date: 'Feb 23',
      sessions: [
        { id: 'w22-su1', type: 'film', title: 'Post-Game Film Review', time: '4:00 PM', duration: '45 min', focus: 'Webber game review' },
        { id: 'w22-su2', type: 'individual', title: 'Optional Skill Work', time: '5:00 PM', duration: '45 min', notes: 'Open gym for voluntary work' },
      ],
    },
  ],
};

// =============================================================================
// PLAYER PLANS
// =============================================================================

export const PLAYER_PLANS: PlayerPlan[] = [
  {
    playerId: '1', playerName: 'Brandon Williams', number: '1', position: 'PG',
    roleTarget: 'Primary Ball Handler / Floor General',
    topGaps: ['Late-clock turnover rate', 'Transition D effort', 'Free throw consistency'],
    planBlocks: [
      { id: 'pb-1-1', title: 'PnR Decision-Making', cluster: 'Playmaking', trait: 'Ball Screen Mastery', status: 'progressing', targetDate: 'Mar 1', drills: ['2-on-1 PnR Reads', 'Decision Speed Drill'] },
      { id: 'pb-1-2', title: 'Transition Defense', cluster: 'Team Defense', trait: 'Sprint-Back Habits', status: 'needs-work', targetDate: 'Mar 15', drills: ['3-on-2 Transition D', 'Sprint-to-Paint'] },
      { id: 'pb-1-3', title: 'Free Throw Routine', cluster: 'Shooting', trait: 'FT Mechanics', status: 'progressing', targetDate: 'Feb 28', drills: ['100 Makes Daily', 'Pressure FT Drill'] },
    ],
    measurables: [
      { name: 'Assist/TO Ratio', current: '2.8', target: '3.5', delta: '+0.3' },
      { name: 'FT%', current: '74%', target: '82%', delta: '+4%' },
      { name: 'Transition D Rating', current: 'C+', target: 'B+', delta: '—' },
    ],
    evidenceCount: 8,
    progressTimeline: [
      { week: 'W18', score: 62 }, { week: 'W19', score: 65 }, { week: 'W20', score: 68 },
      { week: 'W21', score: 71 }, { week: 'W22', score: 74 },
    ],
    coachNote: 'Elite court vision, tightening turnover rate in late-clock situations.',
    progress: 'progressing',
  },
  {
    playerId: '2', playerName: 'Chris Plantey', number: '2', position: 'SG',
    roleTarget: '3-and-D Wing / Spot-Up Specialist',
    topGaps: ['Off-screen movement timing', 'Ball screen D switches', 'Help-side rotation'],
    planBlocks: [
      { id: 'pb-2-1', title: 'Off-Screen Movement', cluster: 'Shooting', trait: 'Catch-and-Shoot', status: 'progressing', targetDate: 'Mar 1', drills: ['Curl-to-Corner', 'Pin-Down Reads'] },
      { id: 'pb-2-2', title: 'Ball Screen Defense', cluster: 'On-Ball Defense', trait: 'Switch Mechanics', status: 'needs-work', targetDate: 'Mar 15', drills: ['Switch Drill', 'Hedge & Recover'] },
    ],
    measurables: [
      { name: '3PT%', current: '36.2%', target: '40%', delta: '+1.8%' },
      { name: 'Def Rating', current: '104.2', target: '100', delta: '-1.5' },
    ],
    evidenceCount: 5,
    progressTimeline: [
      { week: 'W18', score: 58 }, { week: 'W19', score: 60 }, { week: 'W20', score: 63 },
      { week: 'W21', score: 62 }, { week: 'W22', score: 66 },
    ],
    coachNote: 'Improved catch-and-shoot consistency. Needs lateral quickness on switches.',
    progress: 'progressing',
  },
  {
    playerId: '3', playerName: 'Paul Diomande', number: '3', position: 'PF',
    roleTarget: 'Stretch 4 / Double-Double Threat',
    topGaps: ['3PT shooting mechanics', 'Post footwork variety', 'Defensive rebounding boxing out'],
    planBlocks: [
      { id: 'pb-3-1', title: '3PT Shooting Mechanics', cluster: 'Shooting', trait: 'Catch-and-Shoot 3s', status: 'needs-work', targetDate: 'Mar 15', drills: ['Spot-Up 3s (200 reps)', 'Elbow Catch-Shoot'] },
      { id: 'pb-3-2', title: 'Post Footwork', cluster: 'Finishing', trait: 'Post Moves', status: 'progressing', targetDate: 'Mar 1', drills: ['Drop Step Series', 'Up-and-Under'] },
      { id: 'pb-3-3', title: 'Box-Out Discipline', cluster: 'Rebounding', trait: 'Defensive Rebounds', status: 'progressing', targetDate: 'Feb 28', drills: ['Box-Out to Outlet', '1-on-1 Rebounding'] },
    ],
    measurables: [
      { name: '3PT%', current: '28.5%', target: '34%', delta: '+2.1%' },
      { name: 'DRB%', current: '18.4%', target: '22%', delta: '+1.2%' },
    ],
    evidenceCount: 6,
    progressTimeline: [
      { week: 'W18', score: 48 }, { week: 'W19', score: 50 }, { week: 'W20', score: 54 },
      { week: 'W21', score: 58 }, { week: 'W22', score: 62 },
    ],
    coachNote: 'Athletic upside is there, but perimeter shot needs mechanical work. Post moves improving.',
    progress: 'needs-work',
  },
  {
    playerId: '5', playerName: 'Laolu Kalejaiye', number: '5', position: 'C',
    roleTarget: 'Defensive Anchor / Rim Protector',
    topGaps: ['FT shooting', 'Passing out of doubles', 'Perimeter closeouts'],
    planBlocks: [
      { id: 'pb-5-1', title: 'Rim Finishing Touch', cluster: 'Finishing', trait: 'Rim Finishing', status: 'achieved', targetDate: 'Feb 15', drills: ['Mikan Drill', 'Off-Hand Hooks'] },
      { id: 'pb-5-2', title: 'FT Improvement', cluster: 'Shooting', trait: 'Free Throws', status: 'progressing', targetDate: 'Mar 1', drills: ['200 Makes Daily', 'Game-Sim FTs'] },
      { id: 'pb-5-3', title: 'Passing Out of Post', cluster: 'Playmaking', trait: 'Post Passing', status: 'progressing', targetDate: 'Mar 15', drills: ['4-on-3 Post Passing', 'Read & React'] },
    ],
    measurables: [
      { name: 'FT%', current: '72.1%', target: '78%', delta: '+3.5%' },
      { name: 'Blocks/Game', current: '2.1', target: '2.5', delta: '+0.2' },
      { name: 'Post AST%', current: '8.4%', target: '12%', delta: '+1.8%' },
    ],
    evidenceCount: 10,
    progressTimeline: [
      { week: 'W18', score: 72 }, { week: 'W19', score: 74 }, { week: 'W20', score: 76 },
      { week: 'W21', score: 78 }, { week: 'W22', score: 80 },
    ],
    coachNote: 'Anchor of the defense. FT% up 12 points from last year.',
    progress: 'achieved',
  },
  {
    playerId: '4', playerName: 'Nathan Chtelan', number: '4', position: 'SF',
    roleTarget: 'Versatile Wing / Defensive Stopper',
    topGaps: ['Rim protection positioning', 'Pick-and-pop 3s', 'Weakside help'],
    planBlocks: [
      { id: 'pb-4-1', title: 'Rim Protection Timing', cluster: 'Team Defense', trait: 'Help Defense', status: 'progressing', targetDate: 'Mar 1', drills: ['Shell Drill', 'Closeout-to-Contest'] },
      { id: 'pb-4-2', title: 'Pick & Pop Shooting', cluster: 'Shooting', trait: 'Catch-and-Shoot', status: 'needs-work', targetDate: 'Mar 15', drills: ['PnP Spot-Up', 'Short Roll to Pop'] },
    ],
    measurables: [
      { name: 'Def Win Shares', current: '1.2', target: '1.8', delta: '+0.2' },
      { name: '3PT% (PnP)', current: '31%', target: '36%', delta: '+2%' },
    ],
    evidenceCount: 4,
    progressTimeline: [
      { week: 'W18', score: 55 }, { week: 'W19', score: 56 }, { week: 'W20', score: 58 },
      { week: 'W21', score: 60 }, { week: 'W22', score: 62 },
    ],
    coachNote: 'Stretching the floor effectively. Block timing improving steadily.',
    progress: 'progressing',
  },
  {
    playerId: '6', playerName: 'David Blake', number: '6', position: 'PG',
    roleTarget: 'Backup PG / Vocal Leader',
    topGaps: ['Ball handling under pressure', 'Defensive consistency', 'Shot selection'],
    planBlocks: [
      { id: 'pb-6-1', title: 'Ball Handling', cluster: 'Playmaking', trait: 'Handle', status: 'progressing', targetDate: 'Mar 1', drills: ['Pressure Dribbling', 'Full-Court Handle'] },
      { id: 'pb-6-2', title: 'Leadership Reps', cluster: 'Physical', trait: 'Communication', status: 'achieved', targetDate: 'Feb 15', drills: ['Lead Practice Segment', 'Huddle Ownership'] },
    ],
    measurables: [
      { name: 'TO/Game', current: '2.8', target: '1.8', delta: '-0.4' },
    ],
    evidenceCount: 3,
    progressTimeline: [
      { week: 'W18', score: 60 }, { week: 'W19', score: 63 }, { week: 'W20', score: 64 },
      { week: 'W21', score: 67 }, { week: 'W22', score: 68 },
    ],
    coachNote: 'Vocal leader. Working on tighter handle in full-court pressure.',
    progress: 'progressing',
  },
  {
    playerId: '7', playerName: 'Marcus Collins', number: '7', position: 'SG',
    roleTarget: 'Sharpshooter / Spot-Up Threat',
    topGaps: ['Defensive awareness', 'Off-dribble 3s', 'Physical conditioning'],
    planBlocks: [
      { id: 'pb-7-1', title: 'Defensive Awareness', cluster: 'Team Defense', trait: 'Off-Ball D', status: 'needs-work', targetDate: 'Mar 15', drills: ['Shell Drill', 'Closeout Sprint'] },
      { id: 'pb-7-2', title: 'Pull-Up 3s', cluster: 'Shooting', trait: 'Off-Dribble 3s', status: 'needs-work', targetDate: 'Mar 15', drills: ['Pull-Up Series', 'Step-Back Reps'] },
    ],
    measurables: [
      { name: '3PT% (pull-up)', current: '24%', target: '32%', delta: '+3%' },
      { name: 'Def Rating', current: '112', target: '105', delta: '-2' },
    ],
    evidenceCount: 2,
    progressTimeline: [
      { week: 'W18', score: 50 }, { week: 'W19', score: 48 }, { week: 'W20', score: 52 },
      { week: 'W21', score: 49 }, { week: 'W22', score: 46 },
    ],
    coachNote: 'Pure shooter. Adding off-dribble dimension but recent 3PT regression concerning.',
    progress: 'needs-work',
  },
  {
    playerId: '8', playerName: 'Adrian Hernandez', number: '8', position: 'SF',
    roleTarget: 'Defensive Stopper / Transition Spark',
    topGaps: ['On-ball D technique', 'Rebounding positioning', 'Transition finishing'],
    planBlocks: [
      { id: 'pb-8-1', title: 'On-Ball Defense', cluster: 'On-Ball Defense', trait: 'Perimeter D', status: 'achieved', targetDate: 'Feb 10', drills: ['1-on-1 D Drill', 'Lateral Speed'] },
      { id: 'pb-8-2', title: 'Rebounding', cluster: 'Rebounding', trait: 'Offensive Rebounding', status: 'achieved', targetDate: 'Feb 15', drills: ['Tip Drill', 'Crash Board'] },
      { id: 'pb-8-3', title: 'Transition Finishing', cluster: 'Finishing', trait: 'Rim Finishing', status: 'progressing', targetDate: 'Mar 1', drills: ['Fast Break Layups', '2-on-1 Finishing'] },
    ],
    measurables: [
      { name: 'Steals/Game', current: '2.1', target: '2.5', delta: '+0.2' },
      { name: 'ORB/Game', current: '1.8', target: '2.2', delta: '+0.3' },
    ],
    evidenceCount: 7,
    progressTimeline: [
      { week: 'W18', score: 74 }, { week: 'W19', score: 76 }, { week: 'W20', score: 78 },
      { week: 'W21', score: 80 }, { week: 'W22', score: 82 },
    ],
    coachNote: 'Defensive stopper. Versatile enough to guard 1-through-4.',
    progress: 'achieved',
  },
  {
    playerId: '9', playerName: 'Jaylen Moore', number: '9', position: 'PF',
    roleTarget: 'Energy Big / Double-Double Machine',
    topGaps: ['Post moves variety', 'Conditioning for late games', 'FT shooting'],
    planBlocks: [
      { id: 'pb-9-1', title: 'Post Move Expansion', cluster: 'Finishing', trait: 'Post Moves', status: 'progressing', targetDate: 'Mar 1', drills: ['Face-Up Series', 'Spin Move'] },
      { id: 'pb-9-2', title: 'Conditioning', cluster: 'Physical', trait: 'Stamina', status: 'progressing', targetDate: 'Mar 15', drills: ['Gassers', '4th Quarter Sim'] },
      { id: 'pb-9-3', title: 'FT Shooting', cluster: 'Shooting', trait: 'Free Throws', status: 'needs-work', targetDate: 'Mar 15', drills: ['200 Makes Daily', 'Pressure FT Sim'] },
    ],
    measurables: [
      { name: 'PPG', current: '10.2', target: '13', delta: '+1.4' },
      { name: 'FT%', current: '62%', target: '72%', delta: '+4%' },
      { name: '4Q MPG', current: '6.2', target: '8', delta: '+0.8' },
    ],
    evidenceCount: 4,
    progressTimeline: [
      { week: 'W18', score: 55 }, { week: 'W19', score: 57 }, { week: 'W20', score: 60 },
      { week: 'W21', score: 62 }, { week: 'W22', score: 64 },
    ],
    coachNote: 'Double-double machine. Needs to stay on the floor late in games.',
    progress: 'progressing',
  },
  {
    playerId: '10', playerName: 'Jalen Washington', number: '10', position: 'C',
    roleTarget: 'Developmental Big / Future Starter',
    topGaps: ['Defensive positioning', 'Conditioning baseline', 'Offensive awareness'],
    planBlocks: [
      { id: 'pb-10-1', title: 'Defensive Positioning', cluster: 'Team Defense', trait: 'Help Defense', status: 'needs-work', targetDate: 'Mar 15', drills: ['Shell Drill', 'Stance Work'] },
      { id: 'pb-10-2', title: 'Conditioning', cluster: 'Physical', trait: 'Stamina', status: 'progressing', targetDate: 'Mar 1', drills: ['Court Sprints', 'Live 5-on-5 Reps'] },
    ],
    measurables: [
      { name: 'Conditioning Score', current: '78', target: '85', delta: '+5' },
      { name: 'Def Awareness', current: 'D+', target: 'C+', delta: '—' },
    ],
    evidenceCount: 2,
    progressTimeline: [
      { week: 'W18', score: 35 }, { week: 'W19', score: 38 }, { week: 'W20', score: 42 },
      { week: 'W21', score: 45 }, { week: 'W22', score: 50 },
    ],
    coachNote: 'Showing promise in practice reps. Just completed conditioning benchmarks.',
    progress: 'needs-work',
  },
];

// =============================================================================
// DRILL LIBRARY
// =============================================================================

export const DRILL_LIBRARY: DrillTemplate[] = [
  { id: 'dr-1', name: '2-on-1 PnR Reads', cluster: 'Playmaking', trait: 'Ball Screen Mastery', gameAction: 'Pick-and-Roll', difficulty: 'intermediate', repPrescription: '3 sets × 8 reps', coachingCues: ['Read the drop or hedge', 'Attack downhill on drop', 'Hit roller on hedge'], duration: '12 min' },
  { id: 'dr-2', name: 'Decision Speed Drill', cluster: 'Playmaking', trait: 'Ball Screen Mastery', gameAction: 'Pick-and-Roll', difficulty: 'advanced', repPrescription: '2 sets × 10 reps', coachingCues: ['2-second decision window', 'Score or assist on every rep', 'Punish slow hedge'], duration: '15 min' },
  { id: 'dr-3', name: '3-on-2 Transition D', cluster: 'Team Defense', trait: 'Sprint-Back Habits', gameAction: 'Transition', difficulty: 'beginner', repPrescription: '4 sets × 6 reps', coachingCues: ['Sprint to paint first', 'Communicate matchup', 'No fouls in transition'], duration: '10 min' },
  { id: 'dr-4', name: 'Sprint-to-Paint', cluster: 'Team Defense', trait: 'Sprint-Back Habits', gameAction: 'Transition', difficulty: 'beginner', repPrescription: '5 sets × 4 reps', coachingCues: ['Ball-side sprint', 'Touch paint before matching', 'Build habit'], duration: '8 min' },
  { id: 'dr-5', name: 'Spot-Up 3s (200 reps)', cluster: 'Shooting', trait: 'Catch-and-Shoot 3s', gameAction: 'Catch-and-Shoot', difficulty: 'beginner', repPrescription: '200 makes from 5 spots', coachingCues: ['Feet set before catch', 'Same release point', 'Follow through'], duration: '25 min' },
  { id: 'dr-6', name: 'Curl-to-Corner', cluster: 'Shooting', trait: 'Catch-and-Shoot', gameAction: 'Off-Screen', difficulty: 'intermediate', repPrescription: '3 sets × 10 reps', coachingCues: ['Tight curl', 'Ready hands', 'Quick release'], duration: '12 min' },
  { id: 'dr-7', name: 'Drop Step Series', cluster: 'Finishing', trait: 'Post Moves', gameAction: 'Post-Up', difficulty: 'intermediate', repPrescription: '3 sets × 8 reps (each side)', coachingCues: ['Seal with hip', 'One power dribble', 'Finish through contact'], duration: '15 min' },
  { id: 'dr-8', name: 'Shell Drill', cluster: 'Team Defense', trait: 'Help Defense', gameAction: 'Half-Court D', difficulty: 'beginner', repPrescription: '4 sets × 2 min', coachingCues: ['Ball-you-man triangle', 'Jump to ball on pass', 'Close out under control'], duration: '12 min' },
  { id: 'dr-9', name: 'Box-Out to Outlet', cluster: 'Rebounding', trait: 'Defensive Rebounds', gameAction: 'Rebounding', difficulty: 'beginner', repPrescription: '3 sets × 8 reps', coachingCues: ['Find body first', 'Chin the ball', 'Outlet within 2 seconds'], duration: '10 min' },
  { id: 'dr-10', name: 'Mikan Drill', cluster: 'Finishing', trait: 'Rim Finishing', gameAction: 'Layups', difficulty: 'beginner', repPrescription: '50 makes each side', coachingCues: ['Soft touch off glass', 'Alternate hands', 'Keep ball high'], duration: '8 min' },
  { id: 'dr-11', name: 'Pressure FT Drill', cluster: 'Shooting', trait: 'FT Mechanics', gameAction: 'Free Throws', difficulty: 'intermediate', repPrescription: '100 makes with consequence', coachingCues: ['Same routine every time', 'Deep breath before shot', 'Sprint between makes'], duration: '20 min' },
  { id: 'dr-12', name: '1-on-1 D Drill', cluster: 'On-Ball Defense', trait: 'Perimeter D', gameAction: 'Isolation D', difficulty: 'intermediate', repPrescription: '3 sets × 6 reps', coachingCues: ['Low stance', 'Active hands', 'Force baseline'], duration: '12 min' },
  { id: 'dr-13', name: 'Pressure Dribbling', cluster: 'Playmaking', trait: 'Handle', gameAction: 'Ball Handling', difficulty: 'intermediate', repPrescription: '3 sets × 2 min', coachingCues: ['Eyes up', 'Change pace + direction', 'Protect with body'], duration: '10 min' },
  { id: 'dr-14', name: 'Closeout-to-Contest', cluster: 'On-Ball Defense', trait: 'Closeout Mechanics', gameAction: 'Closeout', difficulty: 'beginner', repPrescription: '4 sets × 8 reps', coachingCues: ['Short choppy steps', 'Hands up, no foul', 'Contest without fouling'], duration: '10 min' },
  { id: 'dr-15', name: 'Fast Break Layups', cluster: 'Finishing', trait: 'Rim Finishing', gameAction: 'Transition', difficulty: 'beginner', repPrescription: '20 makes each type', coachingCues: ['Speed to score', 'Finish through contact', 'Euro + reverse'], duration: '10 min' },
];

// =============================================================================
// EVIDENCE QUEUE
// =============================================================================

export const EVIDENCE_QUEUE: EvidenceItem[] = [
  { id: 'ev-1', playerId: '1', playerName: 'Brandon Williams', planItemTitle: 'PnR Decision-Making', type: 'clip', status: 'pending', date: 'Feb 15', description: 'Thomas game: 3 consecutive correct PnR reads in 2nd half' },
  { id: 'ev-2', playerId: '3', playerName: 'Paul Diomande', planItemTitle: 'Post Footwork', type: 'clip', status: 'pending', date: 'Feb 15', description: 'Drop step + up-and-under sequence for bucket' },
  { id: 'ev-3', playerId: '5', playerName: 'Laolu Kalejaiye', planItemTitle: 'FT Improvement', type: 'stat', status: 'reviewed', date: 'Feb 14', description: 'Last 5 games: 78.6% FT (up from 68%)' },
  { id: 'ev-4', playerId: '7', playerName: 'Marcus Collins', planItemTitle: 'Pull-Up 3s', type: 'note', status: 'flagged', date: 'Feb 14', description: 'Mechanics breakdown on pull-up 3s — elbow flying out' },
  { id: 'ev-5', playerId: '8', playerName: 'Adrian Hernandez', planItemTitle: 'On-Ball Defense', type: 'clip', status: 'pending', date: 'Feb 15', description: '4 steals in Thomas game — active hands in passing lanes' },
  { id: 'ev-6', playerId: '2', playerName: 'Chris Plantey', planItemTitle: 'Off-Screen Movement', type: 'clip', status: 'pending', date: 'Feb 13', description: 'Perfect curl-to-corner read for open 3' },
  { id: 'ev-7', playerId: '9', playerName: 'Jaylen Moore', planItemTitle: 'Post Move Expansion', type: 'stat', status: 'pending', date: 'Feb 12', description: 'Post-up efficiency: 1.08 PPP (last 3 games)' },
  { id: 'ev-8', playerId: '10', playerName: 'Jalen Washington', planItemTitle: 'Conditioning', type: 'note', status: 'reviewed', date: 'Feb 12', description: 'Passed all 5 conditioning benchmarks' },
];

// =============================================================================
// TRANSFER METRICS
// =============================================================================

export const TRANSFER_METRICS: TransferMetric[] = [
  { id: 'tm-1', playerId: '1', playerName: 'Brandon Williams', skillArea: 'PnR Decision-Making', practiceScore: 82, gameScore: 74, transferLabel: 'positive', delta: -8 },
  { id: 'tm-2', playerId: '1', playerName: 'Brandon Williams', skillArea: 'Free Throws', practiceScore: 84, gameScore: 74, transferLabel: 'neutral', delta: -10 },
  { id: 'tm-3', playerId: '2', playerName: 'Chris Plantey', skillArea: 'Catch-and-Shoot', practiceScore: 78, gameScore: 72, transferLabel: 'positive', delta: -6 },
  { id: 'tm-4', playerId: '3', playerName: 'Paul Diomande', skillArea: '3PT Shooting', practiceScore: 68, gameScore: 48, transferLabel: 'negative', delta: -20 },
  { id: 'tm-5', playerId: '5', playerName: 'Laolu Kalejaiye', skillArea: 'Rim Finishing', practiceScore: 88, gameScore: 85, transferLabel: 'positive', delta: -3 },
  { id: 'tm-6', playerId: '7', playerName: 'Marcus Collins', skillArea: 'Pull-Up 3s', practiceScore: 55, gameScore: 38, transferLabel: 'negative', delta: -17 },
  { id: 'tm-7', playerId: '8', playerName: 'Adrian Hernandez', skillArea: 'On-Ball D', practiceScore: 85, gameScore: 88, transferLabel: 'positive', delta: 3 },
  { id: 'tm-8', playerId: '9', playerName: 'Jaylen Moore', skillArea: 'Post Moves', practiceScore: 72, gameScore: 65, transferLabel: 'emerging', delta: -7 },
  { id: 'tm-9', playerId: '10', playerName: 'Jalen Washington', skillArea: 'Defensive Positioning', practiceScore: 60, gameScore: 42, transferLabel: 'negative', delta: -18 },
];

// =============================================================================
// PROGRESS SNAPSHOT
// =============================================================================

export const PROGRESS_SNAPSHOT: ProgressSnapshot = {
  overallScore: 66,
  deltaFromLastWeek: 3,
  achievedCount: 2,
  progressingCount: 6,
  needsWorkCount: 2,
  topImprover: 'Paul Diomande',
  topImproverDelta: 4,
};
