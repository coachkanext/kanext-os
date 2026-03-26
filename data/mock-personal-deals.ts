/**
 * Mock data for Personal Deals — creator/freelancer CRM.
 * Pipedrive-style pipeline: Lead → Contacted → Proposal → Negotiation → Won / Lost.
 * Brand deals, sponsorships, speaking engagements, freelance gigs.
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type CRMStage = 'Lead' | 'Contacted' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
export type Priority = 'Hot' | 'Warm' | 'Cold';
export type Source = 'Inbound DM' | 'Email' | 'Referral' | 'Event' | 'Social' | 'Other';
export type ActivityType = 'message' | 'call' | 'email' | 'note' | 'meeting';

export interface CRMContact {
  id: string;
  name: string;
  company: string;
  handle: string;
  phone: string;
  email: string;
  initials: string;
  avatarHue: number;
  isOnKaNeXT?: boolean;
  addedDate?: Date;
}

export interface CRMActivity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: Date;
}

export interface CRMTask {
  id: string;
  title: string;
  dueDate: Date;
  completed: boolean;
}

export interface PersonalDeal {
  id: string;
  title: string;
  contactId: string;
  value: number;
  stage: CRMStage;
  priority: Priority;
  source: Source;
  expectedClose: Date;
  lastActivity: Date;
  notes: string;
  activities: CRMActivity[];
  tasks: CRMTask[];
}

export interface MonthlyRevenue {
  month: string;
  value: number;
}

export interface InsightStats {
  totalPipelineValue: number;
  wonThisMonth: number;
  wonValueThisMonth: number;
  winRate: number;
  avgDealSize: number;
  avgTimeToClose: number;
}

// ── Stages ────────────────────────────────────────────────────────────────────

export const CRM_STAGES: CRMStage[] = ['Lead', 'Contacted', 'Proposal', 'Negotiation', 'Won', 'Lost'];

export const STAGE_PROBABILITIES: Record<CRMStage, number> = {
  Lead: 0.1,
  Contacted: 0.25,
  Proposal: 0.5,
  Negotiation: 0.75,
  Won: 1.0,
  Lost: 0.0,
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  Hot:  '#B85C5C',
  Warm: '#D97757',
  Cold: 'rgba(45,30,18,0.30)',
};

// ── Contacts ──────────────────────────────────────────────────────────────────

export const CRM_CONTACTS: CRMContact[] = [
  { id: 'cc1', name: 'Jordan Williams', company: 'Nike',            handle: '@jwilliams_nike',   phone: '+1 503-555-0142', email: 'j.williams@nike.com',        initials: 'JW', avatarHue: 20,  isOnKaNeXT: true,  addedDate: new Date('2026-02-01') },
  { id: 'cc2', name: 'Maya Patel',      company: 'TechConf 2026',  handle: '@mpatel_tc',        phone: '+1 415-555-0187', email: 'maya@techconf.io',           initials: 'MP', avatarHue: 200, isOnKaNeXT: true,  addedDate: new Date('2026-03-10') },
  { id: 'cc3', name: 'Alex Kim',        company: 'TechBrand Inc',  handle: '@alexkim_tb',       phone: '+1 628-555-0193', email: 'alex@techbrand.com',         initials: 'AK', avatarHue: 160, isOnKaNeXT: false, addedDate: new Date('2026-02-15') },
  { id: 'cc4', name: 'Marcus Johnson',  company: 'The Founders Pod', handle: '@marcusjpod',     phone: '+1 212-555-0156', email: 'marcus@founderspot.fm',      initials: 'MJ', avatarHue: 280, isOnKaNeXT: true,  addedDate: new Date('2025-12-01') },
  { id: 'cc5', name: 'Sarah Lee',       company: 'FitLife Co',     handle: '@slee_fitlife',     phone: '+1 310-555-0178', email: 's.lee@fitlifeco.com',        initials: 'SL', avatarHue: 120, isOnKaNeXT: true,  addedDate: new Date('2026-03-18') },
  { id: 'cc6', name: 'David Chen',      company: 'Summit 2026',    handle: '@dchen_summit',     phone: '+1 312-555-0134', email: 'd.chen@summit26.com',        initials: 'DC', avatarHue: 60,  isOnKaNeXT: false, addedDate: new Date('2026-03-05') },
  { id: 'cc7', name: 'Tara Brooks',     company: 'Creator Fund',   handle: '@tbrooks_cf',       phone: '+1 646-555-0121', email: 'tara@creatorfund.co',        initials: 'TB', avatarHue: 320, isOnKaNeXT: true,  addedDate: new Date('2026-02-20') },
  { id: 'cc8', name: 'James Okonkwo',   company: 'Adidas Sports',  handle: '@jokonkwo_adidas',  phone: '+1 503-555-0199', email: 'j.okonkwo@adidas.com',       initials: 'JO', avatarHue: 240, isOnKaNeXT: false, addedDate: new Date('2026-01-15') },
];

// ── Deals ─────────────────────────────────────────────────────────────────────

export const PERSONAL_DEALS: PersonalDeal[] = [
  {
    id: 'pd1',
    title: 'Nike Content Partnership',
    contactId: 'cc1',
    value: 15000,
    stage: 'Proposal',
    priority: 'Hot',
    source: 'Inbound DM',
    expectedClose: new Date('2026-04-15'),
    lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    notes: 'Nike wants 4 pieces of content per month. Rate is negotiable. They love the KaNeXT brand angle.',
    activities: [
      { id: 'a1a', type: 'message',  description: 'Jordan reached out via DM about content collaboration',          timestamp: new Date('2026-03-01T10:30:00') },
      { id: 'a1b', type: 'call',     description: '30-min discovery call. Confirmed $15K budget, 4 posts/month.',  timestamp: new Date('2026-03-08T14:00:00') },
      { id: 'a1c', type: 'email',    description: 'Sent proposal deck + rate card',                                timestamp: new Date('2026-03-22T09:00:00') },
    ],
    tasks: [
      { id: 't1a', title: 'Follow up on proposal — no response in 3 days', dueDate: new Date('2026-03-27'), completed: false },
    ],
  },
  {
    id: 'pd2',
    title: 'KaNeXT Speaking Engagement',
    contactId: 'cc2',
    value: 5000,
    stage: 'Won',
    priority: 'Warm',
    source: 'Referral',
    expectedClose: new Date('2026-03-10'),
    lastActivity: new Date('2026-03-10T16:00:00'),
    notes: 'Confirmed. Keynote at TechConf 2026 on March 29. 45-minute slot. Flight and hotel covered.',
    activities: [
      { id: 'a2a', type: 'email',    description: 'Maya emailed about keynote opportunity',                  timestamp: new Date('2026-02-15T11:00:00') },
      { id: 'a2b', type: 'call',     description: 'Call to discuss topic and logistics',                     timestamp: new Date('2026-02-20T15:30:00') },
      { id: 'a2c', type: 'note',     description: 'Contract signed. Speaking fee $5K + travel',             timestamp: new Date('2026-03-10T16:00:00') },
    ],
    tasks: [
      { id: 't2a', title: 'Prepare keynote slides', dueDate: new Date('2026-03-26'), completed: false },
    ],
  },
  {
    id: 'pd3',
    title: 'TechBrand Sponsorship',
    contactId: 'cc3',
    value: 8000,
    stage: 'Negotiation',
    priority: 'Warm',
    source: 'Email',
    expectedClose: new Date('2026-04-01'),
    lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    notes: 'They want logo placement in videos + newsletter mention. I want to push rate from $6K to $8K.',
    activities: [
      { id: 'a3a', type: 'email',    description: 'Alex sent cold email about sponsorship',        timestamp: new Date('2026-03-05T09:00:00') },
      { id: 'a3b', type: 'meeting',  description: 'Video call. Discussed deliverables and rates',  timestamp: new Date('2026-03-15T11:00:00') },
      { id: 'a3c', type: 'email',    description: 'Counter-proposed $8K with revised deliverables', timestamp: new Date('2026-03-23T08:30:00') },
    ],
    tasks: [
      { id: 't3a', title: 'Review redlined contract from Alex', dueDate: new Date('2026-03-25'), completed: false },
    ],
  },
  {
    id: 'pd4',
    title: 'Podcast Appearance',
    contactId: 'cc4',
    value: 2000,
    stage: 'Lead',
    priority: 'Cold',
    source: 'Social',
    expectedClose: new Date('2026-05-01'),
    lastActivity: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    notes: 'Marcus commented on a LinkedIn post. Reached out about appearing on The Founders Pod.',
    activities: [
      { id: 'a4a', type: 'message',  description: 'Marcus DMed after seeing LinkedIn post', timestamp: new Date('2026-03-16T14:00:00') },
    ],
    tasks: [
      { id: 't4a', title: 'Reply to Marcus with availability', dueDate: new Date('2026-03-26'), completed: false },
    ],
  },
  {
    id: 'pd5',
    title: 'Brand Ambassador — FitLife',
    contactId: 'cc5',
    value: 12000,
    stage: 'Contacted',
    priority: 'Hot',
    source: 'Inbound DM',
    expectedClose: new Date('2026-04-20'),
    lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    notes: '$1K/month for 12 months. Want me to post once a week about fitness routines + FitLife gear.',
    activities: [
      { id: 'a5a', type: 'message',  description: 'Sarah DMed about 12-month ambassador program',              timestamp: new Date('2026-03-12T10:00:00') },
      { id: 'a5b', type: 'call',     description: 'Intro call. Program details: $1K/mo × 12. Very interested.', timestamp: new Date('2026-03-21T14:00:00') },
    ],
    tasks: [
      { id: 't5a', title: 'Send over media kit + rate sheet',  dueDate: new Date('2026-03-24'), completed: false },
      { id: 't5b', title: 'Research FitLife product line',     dueDate: new Date('2026-03-25'), completed: false },
    ],
  },
  {
    id: 'pd6',
    title: 'Conference Keynote — Summit 2026',
    contactId: 'cc6',
    value: 10000,
    stage: 'Lead',
    priority: 'Warm',
    source: 'Referral',
    expectedClose: new Date('2026-05-15'),
    lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    notes: 'David was referred by Maya. Summit 2026 in Chicago. Large audience — great visibility even beyond the fee.',
    activities: [
      { id: 'a6a', type: 'email',    description: 'David emailed (referred by Maya Patel at TechConf)', timestamp: new Date('2026-03-19T09:30:00') },
    ],
    tasks: [
      { id: 't6a', title: 'Research Summit 2026 audience + past speakers', dueDate: new Date('2026-03-27'), completed: false },
    ],
  },
  {
    id: 'pd7',
    title: 'YouTube Integration Deal',
    contactId: 'cc7',
    value: 6000,
    stage: 'Proposal',
    priority: 'Warm',
    source: 'Email',
    expectedClose: new Date('2026-04-10'),
    lastActivity: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    notes: 'Creator Fund wants a 60-second integration in 3 YouTube videos. Offering $2K/video.',
    activities: [
      { id: 'a7a', type: 'email',    description: 'Tara emailed about YouTube integration opportunity',  timestamp: new Date('2026-03-10T11:00:00') },
      { id: 'a7b', type: 'meeting',  description: 'Zoom call — discussed content alignment and format',  timestamp: new Date('2026-03-18T15:00:00') },
      { id: 'a7c', type: 'email',    description: 'Sent proposal: $6K for 3 integrations (60s each)',   timestamp: new Date('2026-03-20T10:30:00') },
    ],
    tasks: [],
  },
  {
    id: 'pd8',
    title: 'Adidas x Sammy Collaboration',
    contactId: 'cc8',
    value: 20000,
    stage: 'Negotiation',
    priority: 'Hot',
    source: 'Event',
    expectedClose: new Date('2026-04-30'),
    lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    notes: 'Met James at the creator summit. They want a co-branded product + 6 months of content. $20K + product allocation.',
    activities: [
      { id: 'a8a', type: 'meeting',  description: 'Met James at Creator Summit NYC',                    timestamp: new Date('2026-03-05T18:00:00') },
      { id: 'a8b', type: 'email',    description: 'James sent formal intro + collaboration brief',      timestamp: new Date('2026-03-10T09:00:00') },
      { id: 'a8c', type: 'call',     description: 'Deep dive on deliverables. Discussing co-branded product line.', timestamp: new Date('2026-03-20T16:00:00') },
      { id: 'a8d', type: 'email',    description: 'Sent counter-proposal: $20K + $3K product credit',  timestamp: new Date('2026-03-23T11:00:00') },
    ],
    tasks: [
      { id: 't8a', title: 'Review Adidas brand guidelines for co-branded content', dueDate: new Date('2026-03-26'), completed: false },
      { id: 't8b', title: 'Consult lawyer on collab agreement terms',              dueDate: new Date('2026-03-28'), completed: false },
    ],
  },
  {
    id: 'pd9',
    title: 'App Feature Article',
    contactId: 'cc4',
    value: 1500,
    stage: 'Won',
    priority: 'Cold',
    source: 'Inbound DM',
    expectedClose: new Date('2026-02-28'),
    lastActivity: new Date('2026-02-28T14:00:00'),
    notes: 'Paid article feature in The Founders Pod newsletter. 3000 subscribers. Good for backlinks.',
    activities: [
      { id: 'a9a', type: 'message', description: 'Marcus reached out for a sponsored article slot', timestamp: new Date('2026-02-20T10:00:00') },
      { id: 'a9b', type: 'note',    description: 'Article published. Payment received.',            timestamp: new Date('2026-02-28T14:00:00') },
    ],
    tasks: [],
  },
  {
    id: 'pd10',
    title: 'Mentorship Program Partnership',
    contactId: 'cc6',
    value: 4000,
    stage: 'Contacted',
    priority: 'Warm',
    source: 'Referral',
    expectedClose: new Date('2026-05-30'),
    lastActivity: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    notes: 'David also wants to explore a mentorship program partnership — separate from the keynote.',
    activities: [
      { id: 'a10a', type: 'email', description: 'David mentioned interest in mentorship program collab', timestamp: new Date('2026-03-19T10:00:00') },
    ],
    tasks: [],
  },
  {
    id: 'pd11',
    title: 'App Integration Campaign',
    contactId: 'cc7',
    value: 7500,
    stage: 'Lead',
    priority: 'Warm',
    source: 'Social',
    expectedClose: new Date('2026-06-15'),
    lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    notes: 'Startup reached out via DMs. Wants to discuss an integration campaign for their fitness app.',
    activities: [
      { id: 'a11a', type: 'message', description: 'Initial DM from FitFlow about integration campaign', timestamp: new Date('2026-03-22T11:00:00') },
    ],
    tasks: [
      { id: 't11a', title: 'Research FitFlow app + competitors', dueDate: new Date('2026-03-27'), completed: false },
    ],
  },
  {
    id: 'pd12',
    title: 'Podcast Ad Series — Lost',
    contactId: 'cc4',
    value: 3500,
    stage: 'Lost',
    priority: 'Cold',
    source: 'Email',
    expectedClose: new Date('2026-02-28'),
    lastActivity: new Date('2026-02-25T10:00:00'),
    notes: 'Brand went with a larger podcast instead. Budget constraints cited. May revisit in Q3.',
    activities: [
      { id: 'a12a', type: 'email',   description: 'Sent proposal for 4-episode ad series',    timestamp: new Date('2026-02-10T10:00:00') },
      { id: 'a12b', type: 'call',    description: 'Follow-up call — they are evaluating options', timestamp: new Date('2026-02-18T14:00:00') },
      { id: 'a12c', type: 'email',   description: 'Passed — went with higher-reach creator',  timestamp: new Date('2026-02-25T10:00:00') },
    ],
    tasks: [],
  },
];

// ── Insights data ─────────────────────────────────────────────────────────────

export const MONTHLY_REVENUE: MonthlyRevenue[] = [
  { month: 'Oct', value: 3000  },
  { month: 'Nov', value: 0     },
  { month: 'Dec', value: 7500  },
  { month: 'Jan', value: 5000  },
  { month: 'Feb', value: 1500  },
  { month: 'Mar', value: 5000  },
];

export const INSIGHT_STATS: InsightStats = {
  totalPipelineValue: 61000,
  wonThisMonth: 1,
  wonValueThisMonth: 5000,
  winRate: 60,
  avgDealSize: 8375,
  avgTimeToClose: 28,
};

export const SOURCE_BREAKDOWN = [
  { label: 'Inbound DM', value: 3, pct: 33 },
  { label: 'Referral',   value: 3, pct: 33 },
  { label: 'Email',      value: 2, pct: 22 },
  { label: 'Event',      value: 1, pct: 7  },
  { label: 'Social',     value: 1, pct: 5  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

export function getContactById(id: string): CRMContact | undefined {
  return CRM_CONTACTS.find(c => c.id === id);
}

export function getDealsByContact(contactId: string): PersonalDeal[] {
  return PERSONAL_DEALS.filter(d => d.contactId === contactId);
}

export function getDealsByStage(deals: PersonalDeal[], stage: CRMStage): PersonalDeal[] {
  return deals.filter(d => d.stage === stage);
}

export function formatDealValue(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
  return `$${value.toLocaleString()}`;
}

export function formatDealValueFull(value: number): string {
  return `$${value.toLocaleString()}`;
}

export function getStageTotal(deals: PersonalDeal[], stage: CRMStage): number {
  return getDealsByStage(deals, stage).reduce((sum, d) => sum + d.value, 0);
}

export function formatActivityType(type: string): string {
  const map: Record<string, string> = { message: '💬', call: '📞', email: '✉️', note: '📝', meeting: '🤝' };
  return map[type] ?? '•';
}

export function formatRelativeDate(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

export function formatCloseDate(date: Date): string {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function getContactTotalValue(contactId: string): number {
  return PERSONAL_DEALS.filter(d => d.contactId === contactId).reduce((s, d) => s + d.value, 0);
}

export function isClosingSoon(deal: PersonalDeal): boolean {
  const diff = deal.expectedClose.getTime() - Date.now();
  return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
}

export function getWeightedPipelineValue(deals: PersonalDeal[]): number {
  return deals.reduce((sum, d) => sum + d.value * STAGE_PROBABILITIES[d.stage], 0);
}
