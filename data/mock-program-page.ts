/**
 * Sports Program Page — Mock Data (A2 View)
 * 8-block single-scroll layout for Assistant Coach perspective.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface TeamRatingData {
  teamKR: number;
  offKR: number;
  defKR: number;
  fitPct: number;
  confidencePct: number;
  rankings: {
    conference: { rank: number; total: number };
    division: { rank: number; total: number };
    universal: { rank: number; total: number };
  };
}

export interface TeamSystemData {
  offense: string;
  defense: string;
  tempo: string;
  status: 'PROVISIONAL' | 'LOCKED';
}

export interface RecruitingConstraints {
  scholarshipsUsed: number;
  scholarshipsTotal: number;
  nilSpent: number;
  nilBudget: number;
}

export interface RotationPlayer {
  id: string;
  number: string;
  name: string;
  position: string;
  kr: number;
  status: 'available' | 'injured' | 'out' | 'redshirt';
}

export interface AvailabilitySnapshot {
  available: number;
  injured: number;
  out: number;
  redshirt: number;
  rotation: RotationPlayer[];
}

export interface UpcomingEvent {
  id: string;
  title: string;
  time: string;
  type: 'practice' | 'lift' | 'travel' | 'meeting' | 'game';
}

export interface CoachOpsShortcut {
  id: string;
  label: string;
  icon: string;
}

export interface DataCoverage {
  tier: string;
  timestamps: { label: string; date: string }[];
  missingNotes: string[];
}

// =============================================================================
// MOCK DATA
// =============================================================================

export const TEAM_RATING: TeamRatingData = {
  teamKR: 74,
  offKR: 72,
  defKR: 76,
  fitPct: 88,
  confidencePct: 84,
  rankings: {
    conference: { rank: 2, total: 12 },
    division: { rank: 18, total: 250 },
    universal: { rank: 342, total: 1800 },
  },
};

export const TEAM_SYSTEM: TeamSystemData = {
  offense: 'Motion Read & React',
  defense: 'Pack Line',
  tempo: 'Moderate (71.4 pace)',
  status: 'PROVISIONAL',
};

export const RECRUITING_CONSTRAINTS: RecruitingConstraints = {
  scholarshipsUsed: 12,
  scholarshipsTotal: 13,
  nilSpent: 32500,
  nilBudget: 45000,
};

export const AVAILABILITY: AvailabilitySnapshot = {
  available: 12,
  injured: 2,
  out: 1,
  redshirt: 1,
  rotation: [
    { id: 'rp1', number: '3', name: 'Marcus Johnson', position: 'PG', kr: 78, status: 'available' },
    { id: 'rp2', number: '11', name: 'DeShawn Carter', position: 'SG', kr: 75, status: 'available' },
    { id: 'rp3', number: '24', name: 'Jamal Williams', position: 'SF', kr: 74, status: 'available' },
    { id: 'rp4', number: '32', name: 'Tyler Brooks', position: 'PF', kr: 72, status: 'available' },
    { id: 'rp5', number: '50', name: 'Andre Mitchell', position: 'C', kr: 76, status: 'available' },
    { id: 'rp6', number: '5', name: 'Chris Davis', position: 'SG', kr: 71, status: 'injured' },
    { id: 'rp7', number: '15', name: 'Jordan Taylor', position: 'PF', kr: 69, status: 'injured' },
    { id: 'rp8', number: '22', name: 'Malik Robinson', position: 'SF', kr: 73, status: 'available' },
  ],
};

export const UPCOMING_EVENTS: UpcomingEvent[] = [
  { id: 'ev1', title: 'Team Practice — Half-Court Sets', time: 'Today, 3:00 PM', type: 'practice' },
  { id: 'ev2', title: 'Strength & Conditioning', time: 'Tomorrow, 7:00 AM', type: 'lift' },
  { id: 'ev3', title: 'Travel to Bellevue', time: 'Thu, 10:00 AM', type: 'travel' },
];

export const COACH_OPS_SHORTCUTS: CoachOpsShortcut[] = [
  { id: 'co1', label: 'Statistics', icon: 'chart.bar.fill' },
  { id: 'co2', label: 'Game Plan', icon: 'doc.text.fill' },
  { id: 'co3', label: 'Simulation', icon: 'play.circle.fill' },
  { id: 'co4', label: 'Development', icon: 'figure.run' },
  { id: 'co5', label: 'Recruiting', icon: 'person.badge.plus' },
  { id: 'co6', label: 'KaNeXTCast', icon: 'antenna.radiowaves.left.and.right' },
];

export const DATA_COVERAGE: DataCoverage = {
  tier: 'Synergy',
  timestamps: [
    { label: 'Box Scores', date: 'Feb 24, 2026' },
    { label: 'Film Tags', date: 'Feb 23, 2026' },
    { label: 'KR Engine', date: 'Feb 24, 2026' },
  ],
  missingNotes: [
    'Shot tracking data unavailable for 3 away games',
    'Opponent tendencies incomplete for 2 conference rivals',
  ],
};

// =============================================================================
// STATUS COLORS
// =============================================================================

export const AVAILABILITY_STATUS_COLORS: Record<RotationPlayer['status'], string> = {
  available: '#5A8A6E',
  injured: '#B85C5C',
  out: '#B8943E',
  redshirt: '#9C9790',
};

export const EVENT_TYPE_ICONS: Record<UpcomingEvent['type'], string> = {
  practice: 'sportscourt.fill',
  lift: 'dumbbell.fill',
  travel: 'airplane',
  meeting: 'person.3.fill',
  game: 'trophy.fill',
};
