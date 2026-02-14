/**
 * Mock communication timeline data for the Comms tab.
 * Shared entries for roster + recruit players; recruits unlock extra touch/status/key_date rows.
 */

export type CommsEntryType =
  // Shared (roster + recruit)
  | 'message'        // Coach <-> Player/Recruit message
  | 'note'           // Coach note surfaced
  | 'mention'        // Staff mention/tagged item
  | 'film_share'     // "Coach shared clip"
  | 'meeting'        // Meeting / checkpoint
  // Recruit-only
  | 'touch'          // Call / Text / DM / Visit / Offer / Eval
  | 'status_change'  // Warm -> Hot -> Visit -> Commit
  | 'key_date';      // Visit date, decision date

export type TouchMethod = 'Call' | 'Text' | 'DM' | 'Visit' | 'Offer' | 'Eval';
export type RecruitStatus = 'Cold' | 'Warm' | 'Hot' | 'Visit' | 'Offered' | 'Commit';

export type SourceChipLabel =
  | 'Note' | 'Clip' | 'Practice' | 'Scout' | 'Visit'
  | 'Decision' | 'Call' | 'Text' | 'Game' | 'Meeting' | 'Thread';

export interface CommsEntry {
  id: string;
  type: CommsEntryType;
  timestamp: Date;
  author: string;          // "Coach Smith", "Staff", "System"
  body: string;            // Primary text
  // Touch-specific (recruit only)
  touchMethod?: TouchMethod;
  // Status change (recruit only)
  fromStatus?: RecruitStatus;
  toStatus?: RecruitStatus;
  // Key date (recruit only)
  dateLabel?: string;      // "Campus Visit", "Decision Date"
  dateValue?: Date;
  // Film share
  clipTitle?: string;
  // Deep link source chip (derived)
  sourceChip?: SourceChipLabel;
  deepLinkRoute?: string;
}

// ── Icon + color mapping per entry type ──

export const COMMS_TYPE_META: Record<CommsEntryType, { icon: string; color: string }> = {
  message:       { icon: '\u{1F4AC}', color: '#3B82F6' },  // blue
  note:          { icon: '\u270F\uFE0F', color: '#F59E0B' }, // orange
  mention:       { icon: '@',        color: '#A855F7' },  // purple
  film_share:    { icon: '\u25B6',   color: '#22C55E' },  // green
  meeting:       { icon: '\u{1F4C5}', color: '#14B8A6' },  // teal
  touch:         { icon: '\u{1F4DE}', color: '#EAB308' },  // yellow
  status_change: { icon: '\u2191',   color: '#F97316' },  // gradient-ish orange
  key_date:      { icon: '\u2691',   color: '#EF4444' },  // red
};

// ── Helpers ──

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(10 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60));
  return d;
}

function futureDate(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

// ── Roster Player Comms ──

const ROSTER_TEMPLATES: Omit<CommsEntry, 'id'>[] = [
  // Messages
  {
    type: 'message',
    timestamp: daysAgo(1),
    author: 'Coach Smith',
    body: 'Great effort in practice today. Keep pushing on the closeout drills.',
  },
  {
    type: 'message',
    timestamp: daysAgo(3),
    author: 'Coach Williams',
    body: 'Film session scheduled for Thursday 2pm. We\'ll review transition defense from last game.',
  },
  {
    type: 'message',
    timestamp: daysAgo(7),
    author: 'Coach Smith',
    body: 'Your pick-and-roll reads have improved a lot this week. Let\'s keep building on that.',
  },
  {
    type: 'message',
    timestamp: daysAgo(12),
    author: 'Coach Davis',
    body: 'Check in with training staff before morning shootaround tomorrow.',
  },
  // Notes
  {
    type: 'note',
    timestamp: daysAgo(2),
    author: 'Coach Smith',
    body: 'Needs to improve weak-hand finishing. Assign extra left-hand layup drill sets.',
  },
  {
    type: 'note',
    timestamp: daysAgo(9),
    author: 'Coach Williams',
    body: 'Conditioning numbers trending up. On track for target by conference play.',
  },
  // Mention
  {
    type: 'mention',
    timestamp: daysAgo(4),
    author: 'Staff',
    body: 'Tagged in scouting report: primary ball-handler matchup breakdown vs. State.',
  },
  // Film shares
  {
    type: 'film_share',
    timestamp: daysAgo(5),
    author: 'Coach Williams',
    body: 'Shared 3 clips from last game showing defensive rotation assignments.',
    clipTitle: 'Defensive Rotations vs. Tech',
  },
  {
    type: 'film_share',
    timestamp: daysAgo(14),
    author: 'Coach Smith',
    body: 'Good example of spacing in the DHO set — shared for reference.',
    clipTitle: 'DHO Spacing Example',
  },
  // Meeting
  {
    type: 'meeting',
    timestamp: daysAgo(6),
    author: 'Coach Smith',
    body: 'Mid-week check-in: discussed role expectations and minutes allocation going forward.',
  },
];

export function getPlayerComms(jerseyNumber: string): CommsEntry[] {
  // Deterministic seed from jersey number for slight variation
  const seed = parseInt(jerseyNumber, 10) || 0;
  return ROSTER_TEMPLATES.map((t, i) => {
    const entry: CommsEntry = {
      ...t,
      id: `roster-${jerseyNumber}-${i}`,
      // Shift timestamps slightly per player so they don't all look identical
      timestamp: new Date(t.timestamp.getTime() + seed * 3600000),
    };
    const chip = getSourceChip(entry);
    entry.sourceChip = chip.label;
    entry.deepLinkRoute = chip.route;
    return entry;
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// ── Recruit Comms ──

const RECRUIT_SHARED: Omit<CommsEntry, 'id'>[] = [
  // Messages
  {
    type: 'message',
    timestamp: daysAgo(2),
    author: 'Coach Smith',
    body: 'Thanks for the conversation today. Really excited about what you could bring to our program.',
  },
  {
    type: 'message',
    timestamp: daysAgo(8),
    author: 'Coach Williams',
    body: 'Your highlight tape looked great. The pull-up game off screens is exactly what we need.',
  },
  {
    type: 'message',
    timestamp: daysAgo(15),
    author: 'Coach Smith',
    body: 'Following up on our call — want to make sure you got the academic info packet we sent.',
  },
  // Notes
  {
    type: 'note',
    timestamp: daysAgo(3),
    author: 'Coach Davis',
    body: 'Father is primary decision-maker. Mother focused on academics and distance from home.',
  },
  {
    type: 'note',
    timestamp: daysAgo(10),
    author: 'Coach Smith',
    body: 'Considering three other programs. Decision expected by end of month.',
  },
  // Film share
  {
    type: 'film_share',
    timestamp: daysAgo(6),
    author: 'Coach Williams',
    body: 'Shared system film showing how his skillset would be used in our offense.',
    clipTitle: 'Offensive Role Projection',
  },
  // Meeting
  {
    type: 'meeting',
    timestamp: daysAgo(4),
    author: 'Coach Smith',
    body: 'Zoom call with family — covered academic support, facilities, and playing time projection.',
  },
  // Mention
  {
    type: 'mention',
    timestamp: daysAgo(5),
    author: 'Staff',
    body: 'Referenced in recruiting board meeting — prioritized as top wing target.',
  },
];

const RECRUIT_TOUCHES: Omit<CommsEntry, 'id'>[] = [
  {
    type: 'touch',
    timestamp: daysAgo(1),
    author: 'Coach Smith',
    body: 'Called to discuss upcoming official visit logistics.',
    touchMethod: 'Call',
  },
  {
    type: 'touch',
    timestamp: daysAgo(5),
    author: 'Coach Williams',
    body: 'Sent game recap and personal note after Friday night win.',
    touchMethod: 'Text',
  },
  {
    type: 'touch',
    timestamp: daysAgo(11),
    author: 'Coach Smith',
    body: 'Attended Tuesday practice — watched full scrimmage and spoke with HS coach.',
    touchMethod: 'Visit',
  },
];

const RECRUIT_STATUS_CHANGES: Omit<CommsEntry, 'id'>[] = [
  {
    type: 'status_change',
    timestamp: daysAgo(7),
    author: 'System',
    body: 'Recruiting status updated after positive campus visit feedback.',
    fromStatus: 'Warm',
    toStatus: 'Hot',
  },
  {
    type: 'status_change',
    timestamp: daysAgo(20),
    author: 'System',
    body: 'Initial contact made — moved to active pipeline.',
    fromStatus: 'Cold',
    toStatus: 'Warm',
  },
];

const RECRUIT_KEY_DATES: Omit<CommsEntry, 'id'>[] = [
  {
    type: 'key_date',
    timestamp: daysAgo(0),
    author: 'System',
    body: 'Official visit confirmed.',
    dateLabel: 'Campus Visit',
    dateValue: futureDate(14),
  },
  {
    type: 'key_date',
    timestamp: daysAgo(3),
    author: 'System',
    body: 'Decision timeline communicated by family.',
    dateLabel: 'Decision Date',
    dateValue: futureDate(30),
  },
];

export function getRecruitComms(playerId: string): CommsEntry[] {
  const seed = playerId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const all: Omit<CommsEntry, 'id'>[] = [
    ...RECRUIT_SHARED,
    ...RECRUIT_TOUCHES,
    ...RECRUIT_STATUS_CHANGES,
    ...RECRUIT_KEY_DATES,
  ];
  return all
    .map((t, i) => {
      const entry: CommsEntry = {
        ...t,
        id: `recruit-${playerId}-${i}`,
        timestamp: new Date(t.timestamp.getTime() + (seed % 10) * 1800000),
      };
      const chip = getSourceChip(entry);
      entry.sourceChip = chip.label;
      entry.deepLinkRoute = chip.route;
      return entry;
    })
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// ── Source chip derivation ──

export function getSourceChip(entry: CommsEntry): { label: SourceChipLabel; route: string } {
  switch (entry.type) {
    case 'message':
      return { label: 'Thread', route: '/(tabs)/activity' };
    case 'note':
      return { label: 'Note', route: '/(tabs)/activity' };
    case 'mention':
      return { label: 'Thread', route: '/(tabs)/activity' };
    case 'film_share':
      return { label: 'Clip', route: '/(tabs)/media' };
    case 'meeting':
      return { label: 'Meeting', route: '/(tabs)/activity' };
    case 'touch':
      if (entry.touchMethod === 'Call') return { label: 'Call', route: '/(tabs)/activity' };
      if (entry.touchMethod === 'Text') return { label: 'Text', route: '/(tabs)/activity' };
      if (entry.touchMethod === 'Visit') return { label: 'Visit', route: '/coach/recruiting' };
      return { label: 'Scout', route: '/coach/recruiting' };
    case 'status_change':
      return { label: 'Decision', route: '/coach/recruiting' };
    case 'key_date':
      if (entry.dateLabel?.includes('Visit')) return { label: 'Visit', route: '/coach/recruiting' };
      return { label: 'Decision', route: '/coach/recruiting' };
    default:
      return { label: 'Note', route: '/(tabs)/activity' };
  }
}
