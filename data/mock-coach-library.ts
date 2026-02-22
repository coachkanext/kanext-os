/**
 * Mock data for Coach Library — external link teaching database.
 * Collections of curated coaching resources (YouTube, Hudl, articles).
 */

export type LinkSource = 'YouTube' | 'Hudl' | 'Synergy' | 'Article' | 'X' | 'Other';
export type TargetRole = 'Guards' | 'Wings' | 'Bigs' | 'All';
export type LinkVisibility = 'Staff' | 'Team' | 'Player' | '1:1';

export interface LinkCardItem {
  id: string;
  title: string;
  url: string;
  source: LinkSource;
  creator?: string;
  timestampStart?: string;
  notes?: string;
  tags: string[];
  targetRoles: TargetRole[];
  visibility: LinkVisibility;
}

export interface CoachCollection {
  id: string;
  label: string;
  icon: string;
  items: LinkCardItem[];
}

// ── Source colors ──

export const SOURCE_COLORS: Record<LinkSource, string> = {
  YouTube: '#EF4444',
  Hudl: '#1D9BF0',
  Synergy: '#FFFFFF',
  Article: '#A1A1AA',
  X: '#FFFFFF',
  Other: '#A1A1AA',
};

// ── Mock Collections ──

export const COACH_COLLECTIONS: CoachCollection[] = [
  {
    id: 'col-identity',
    label: 'This Is How We Play',
    icon: 'star.fill',
    items: [
      {
        id: 'lk-1',
        title: 'Our DHO Motion — Full System Breakdown',
        url: 'https://youtube.com/watch?v=example1',
        source: 'YouTube',
        creator: 'Coach Smith',
        notes: 'Core system video. Every player watches before first practice.',
        tags: ['system', 'DHO', 'offense'],
        targetRoles: ['All'],
        visibility: 'Team',
      },
      {
        id: 'lk-2',
        title: 'Defensive Identity — Switch Everything Principles',
        url: 'https://youtube.com/watch?v=example2',
        source: 'YouTube',
        creator: 'Coach Williams',
        notes: 'How we defend ball screens and actions.',
        tags: ['system', 'defense', 'switching'],
        targetRoles: ['All'],
        visibility: 'Team',
      },
      {
        id: 'lk-3',
        title: 'Transition Principles — 3 Rules',
        url: 'https://hudl.com/video/example3',
        source: 'Hudl',
        creator: 'Coach Smith',
        tags: ['transition', 'system'],
        targetRoles: ['All'],
        visibility: 'Team',
      },
    ],
  },
  {
    id: 'col-guards',
    label: 'Guards',
    icon: 'figure.basketball',
    items: [
      {
        id: 'lk-4',
        title: 'PnR Reads — When to Turn the Corner vs Reject',
        url: 'https://youtube.com/watch?v=example4',
        source: 'YouTube',
        creator: 'Chris Oliver',
        notes: 'Great teaching on PnR decision making.',
        tags: ['PnR', 'reads', 'guard-skill'],
        targetRoles: ['Guards'],
        visibility: 'Team',
      },
      {
        id: 'lk-5',
        title: 'Floater Package — Developing Touch',
        url: 'https://youtube.com/watch?v=example5',
        source: 'YouTube',
        creator: 'Drew Hanlen',
        tags: ['finishing', 'floater'],
        targetRoles: ['Guards'],
        visibility: 'Team',
      },
      {
        id: 'lk-6',
        title: 'Ball Screen Offense — Reading the Defense',
        url: 'https://synergy.com/video/example6',
        source: 'Synergy',
        creator: 'Synergy Sports',
        tags: ['PnR', 'offense'],
        targetRoles: ['Guards'],
        visibility: 'Staff',
      },
    ],
  },
  {
    id: 'col-wings',
    label: 'Wings',
    icon: 'figure.run',
    items: [
      {
        id: 'lk-7',
        title: 'Off-Ball Movement — Cutting & Spacing',
        url: 'https://youtube.com/watch?v=example7',
        source: 'YouTube',
        creator: 'Basketball Immersion',
        tags: ['off-ball', 'cutting', 'spacing'],
        targetRoles: ['Wings'],
        visibility: 'Team',
      },
      {
        id: 'lk-8',
        title: 'Closeout Technique — Contest Without Fouling',
        url: 'https://hudl.com/video/example8',
        source: 'Hudl',
        creator: 'Coach Davis',
        notes: 'Film from last week showing correct closeout angles.',
        tags: ['defense', 'closeout'],
        targetRoles: ['Wings'],
        visibility: 'Team',
      },
      {
        id: 'lk-9',
        title: 'Wing Isolation Scoring — Triple Threat to Finish',
        url: 'https://youtube.com/watch?v=example9',
        source: 'YouTube',
        creator: 'Jordan Lawley',
        tags: ['iso', 'scoring'],
        targetRoles: ['Wings'],
        visibility: 'Team',
      },
    ],
  },
  {
    id: 'col-bigs',
    label: 'Bigs',
    icon: 'figure.strengthtraining.traditional',
    items: [
      {
        id: 'lk-10',
        title: 'Rim Protection — Shot Blocking Timing & Positioning',
        url: 'https://youtube.com/watch?v=example10',
        source: 'YouTube',
        creator: 'PJ Carlesimo',
        tags: ['defense', 'rim-protection'],
        targetRoles: ['Bigs'],
        visibility: 'Team',
      },
      {
        id: 'lk-11',
        title: 'Roll vs Pop Decision Making',
        url: 'https://hudl.com/video/example11',
        source: 'Hudl',
        creator: 'Coach Williams',
        notes: 'When to roll hard vs pop — read the help defender.',
        tags: ['PnR', 'roll', 'pop'],
        targetRoles: ['Bigs'],
        visibility: 'Team',
      },
      {
        id: 'lk-12',
        title: 'Post Sealing & Positioning',
        url: 'https://youtube.com/watch?v=example12',
        source: 'YouTube',
        creator: 'Ganon Baker',
        tags: ['post', 'positioning'],
        targetRoles: ['Bigs'],
        visibility: 'Team',
      },
    ],
  },
  {
    id: 'col-finishing',
    label: 'Finishing',
    icon: 'flame.fill',
    items: [
      {
        id: 'lk-13',
        title: 'Finishing Through Contact — Body Control at the Rim',
        url: 'https://youtube.com/watch?v=example13',
        source: 'YouTube',
        creator: 'Drew Hanlen',
        tags: ['finishing', 'contact'],
        targetRoles: ['All'],
        visibility: 'Team',
      },
      {
        id: 'lk-14',
        title: 'Euro Step Progression — 3 Levels',
        url: 'https://youtube.com/watch?v=example14',
        source: 'YouTube',
        creator: 'By Any Means Basketball',
        tags: ['finishing', 'euro-step'],
        targetRoles: ['Guards', 'Wings'],
        visibility: 'Team',
      },
      {
        id: 'lk-15',
        title: 'Reverse Layup Package',
        url: 'https://youtube.com/watch?v=example15',
        source: 'YouTube',
        creator: 'Coach Smith',
        tags: ['finishing', 'reverse'],
        targetRoles: ['All'],
        visibility: 'Team',
      },
    ],
  },
  {
    id: 'col-shooting',
    label: 'Shooting',
    icon: 'scope',
    items: [
      {
        id: 'lk-16',
        title: 'Shot Mechanics — Form Shooting Routine',
        url: 'https://youtube.com/watch?v=example16',
        source: 'YouTube',
        creator: 'Chip Engelland',
        notes: 'Use this for pre-practice shooting warmup.',
        tags: ['shooting', 'mechanics'],
        targetRoles: ['All'],
        visibility: 'Team',
      },
      {
        id: 'lk-17',
        title: 'Off-Screen Shooting — Footwork & Balance',
        url: 'https://youtube.com/watch?v=example17',
        source: 'YouTube',
        creator: 'Pro Shot System',
        tags: ['shooting', 'footwork'],
        targetRoles: ['Guards', 'Wings'],
        visibility: 'Team',
      },
      {
        id: 'lk-18',
        title: 'Catch-and-Shoot Reps — Game Speed',
        url: 'https://hudl.com/video/example18',
        source: 'Hudl',
        creator: 'Coach Davis',
        tags: ['shooting', 'catch-and-shoot'],
        targetRoles: ['All'],
        visibility: 'Team',
      },
    ],
  },
  {
    id: 'col-pnr',
    label: 'P&R Reads',
    icon: 'arrow.triangle.branch',
    items: [
      {
        id: 'lk-19',
        title: 'PnR Coverage — Drop vs Hedge vs Switch',
        url: 'https://youtube.com/watch?v=example19',
        source: 'YouTube',
        creator: 'Half Court Hoops',
        tags: ['PnR', 'defense', 'coverage'],
        targetRoles: ['All'],
        visibility: 'Staff',
      },
      {
        id: 'lk-20',
        title: 'Attacking Drop Coverage — Short Roll Reads',
        url: 'https://youtube.com/watch?v=example20',
        source: 'YouTube',
        creator: 'Basketball Immersion',
        tags: ['PnR', 'offense', 'short-roll'],
        targetRoles: ['Guards', 'Bigs'],
        visibility: 'Team',
      },
      {
        id: 'lk-21',
        title: 'Spain PnR — Set Ups & Counters',
        url: 'https://youtube.com/watch?v=example21',
        source: 'YouTube',
        creator: 'Coach Daniel',
        tags: ['PnR', 'spain', 'actions'],
        targetRoles: ['All'],
        visibility: 'Team',
      },
    ],
  },
  {
    id: 'col-transition',
    label: 'Transition',
    icon: 'arrow.right.circle.fill',
    items: [
      {
        id: 'lk-22',
        title: 'Secondary Break — 4 Options',
        url: 'https://youtube.com/watch?v=example22',
        source: 'YouTube',
        creator: 'Coach Smith',
        tags: ['transition', 'secondary-break'],
        targetRoles: ['All'],
        visibility: 'Team',
      },
      {
        id: 'lk-23',
        title: 'Transition Defense — Getting Back & Matching',
        url: 'https://youtube.com/watch?v=example23',
        source: 'YouTube',
        creator: 'Jimmy Dykes',
        tags: ['transition', 'defense'],
        targetRoles: ['All'],
        visibility: 'Team',
      },
      {
        id: 'lk-24',
        title: 'Push Pace — Decision Making in the Open Court',
        url: 'https://hudl.com/video/example24',
        source: 'Hudl',
        creator: 'Coach Williams',
        tags: ['transition', 'pace'],
        targetRoles: ['Guards'],
        visibility: 'Team',
      },
    ],
  },
  {
    id: 'col-team-defense',
    label: 'Team Defense',
    icon: 'shield.fill',
    items: [
      {
        id: 'lk-25',
        title: 'Shell Drill — Building Defensive Habits',
        url: 'https://youtube.com/watch?v=example25',
        source: 'YouTube',
        creator: 'Tony Bennett',
        tags: ['defense', 'shell', 'habits'],
        targetRoles: ['All'],
        visibility: 'Team',
      },
      {
        id: 'lk-26',
        title: 'Help & Recover — Rotation Principles',
        url: 'https://youtube.com/watch?v=example26',
        source: 'YouTube',
        creator: 'Coach Williams',
        notes: 'Our rotation rules visualized.',
        tags: ['defense', 'help', 'rotation'],
        targetRoles: ['All'],
        visibility: 'Team',
      },
      {
        id: 'lk-27',
        title: 'Defending Off-Ball Screens',
        url: 'https://youtube.com/watch?v=example27',
        source: 'YouTube',
        creator: 'Basketball Immersion',
        tags: ['defense', 'off-ball', 'screens'],
        targetRoles: ['All'],
        visibility: 'Team',
      },
    ],
  },
  {
    id: 'col-rebounding',
    label: 'Rebounding',
    icon: 'arrow.up.circle.fill',
    items: [
      {
        id: 'lk-28',
        title: 'Box Out Technique — Contact & Pursue',
        url: 'https://youtube.com/watch?v=example28',
        source: 'YouTube',
        creator: 'Coach Smith',
        notes: 'Foundational rebounding technique for all positions.',
        tags: ['rebounding', 'box-out'],
        targetRoles: ['All'],
        visibility: 'Team',
      },
      {
        id: 'lk-29',
        title: 'Offensive Rebounding — Pursuit Angles',
        url: 'https://hudl.com/video/example29',
        source: 'Hudl',
        creator: 'Coach Davis',
        tags: ['rebounding', 'offensive'],
        targetRoles: ['Bigs', 'Wings'],
        visibility: 'Team',
      },
      {
        id: 'lk-30',
        title: 'Guard Rebounding — Crashing & Outlets',
        url: 'https://youtube.com/watch?v=example30',
        source: 'YouTube',
        creator: 'Half Court Hoops',
        tags: ['rebounding', 'guards', 'outlet'],
        targetRoles: ['Guards'],
        visibility: 'Team',
      },
    ],
  },
];

// ── Curriculum Group (top-level grouping) ──

export const CURRICULUM_GROUP = {
  label: 'Curriculum',
  description: 'Core teaching library organized by skill and role.',
  collectionIds: COACH_COLLECTIONS.map((c) => c.id),
};
