/**
 * Mock data for Personal Hub — Sammy Kalejaiye's creator backend.
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type ChartMetric  = 'followers' | 'views' | 'earnings';
export type ContentType  = 'post' | 'reel' | 'ktv' | 'story';
export type ContentStatus = 'published' | 'scheduled' | 'draft';

export interface ContentItem {
  id: string;
  type: ContentType;
  status: ContentStatus;
  title: string;
  preview: string;
  destination: string;
  /** Days from today (0=today, 1=tomorrow, -1=yesterday). null = unscheduled draft */
  daysFromToday: number | null;
  time?: string;
  views?: number;
  engagement?: number;
  lastEdited?: string;
}

export interface HubLink {
  id: string;
  icon: string;
  title: string;
  url?: string;
  route?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  thumbHue: number;
  thumbEmoji: string;
  thumbUri?: string;
  year: string;
  description: string;
}

export interface ActivityItem {
  id: string;
  icon: string;
  message: string;
  detail: string;
  timeAgo: string;
  type: 'follow' | 'subscribe' | 'payout' | 'content';
}

export interface Goal {
  id: string;
  label: string;
  current: number;
  target: number;
  unit: string;
}

export interface ChartPoint {
  label: string;
  followers: number;
  views: number;
  earnings: number;
}

export interface MemberTier {
  id: string;
  name: string;
  price: number;
  subscriberCount: number;
  perks: string[];
  description: string;
}

export interface Subscriber {
  id: string;
  name: string;
  initials: string;
  tierId: string;
  joinDate: string;
  lifetimeValue: number;
}

export interface Newsletter {
  id: string;
  subject: string;
  preview: string;
  sentAt: string;
  openRate: number;
  clickRate: number;
  recipients: number;
}

export interface FeaturedContent {
  id: string;
  title: string;
  type: 'social' | 'video';
  thumbHue: number;
  thumbEmoji: string;
  thumbUri?: string;
  viewCount: string;
  timestamp: string;
}

// ── Profile ──────────────────────────────────────────────────────────────────

export const HUB_PROFILE = {
  name: 'Sammy Kalejaiye',
  handle: '@sammykalejaiye',
  bio: 'Coach, creator, and community builder. Sharing insights on sports, personal growth, and entrepreneurship. Building in public.',
  location: 'Atlanta, GA',
  avatarInitials: 'SK',
  avatarUri: 'https://picsum.photos/seed/sammy-k/200/200',
  coverUri: 'https://picsum.photos/seed/sammy-cover/800/300',
  followerCount: 1247,
  postCount: 84,
  coverHue: 22,
};

// ── Links ────────────────────────────────────────────────────────────────────

export const HUB_LINKS: HubLink[] = [
  { id: 'l1', icon: 'globe',            title: 'Official Website',   url: 'https://sammykalejaiye.com' },
  { id: 'l2', icon: 'calendar',         title: 'Book a Session',     url: 'https://cal.com/sammy' },
  { id: 'l3', icon: 'person.crop.circle', title: 'LinkedIn',        url: 'https://linkedin.com/in/sammy' },
  { id: 'l4', icon: 'play.rectangle',   title: 'YouTube Channel',    url: 'https://youtube.com/@sammy' },
  { id: 'l5', icon: 'storefront',        title: 'Shop',               route: '/(tabs)/(main)/store'   },
  { id: 'l6', icon: 'doc.text.fill',    title: 'Free Playbook PDF',  url: 'https://sammyk.com/playbook' },
];

// ── Portfolio ─────────────────────────────────────────────────────────────────

export const HUB_PORTFOLIO: PortfolioItem[] = [
  {
    id: 'pf1', title: 'Speed & Agility Program', category: 'Training',
    thumbHue: 200, thumbEmoji: '⚡',
    thumbUri: 'https://picsum.photos/seed/speed-agility/400/300',
    year: '2024',
    description: '12-week speed and agility curriculum designed for high school athletes. Used by 3 regional programs.',
  },
  {
    id: 'pf2', title: 'Mental Edge Podcast', category: 'Media',
    thumbHue: 280, thumbEmoji: '🎙️',
    thumbUri: 'https://picsum.photos/seed/mental-podcast/400/300',
    year: '2023',
    description: '50+ episodes covering sports psychology, mindset, and peak performance with pro athletes.',
  },
  {
    id: 'pf3', title: 'Recruiting Guide 2024', category: 'Education',
    thumbHue: 150, thumbEmoji: '📖',
    thumbUri: 'https://picsum.photos/seed/recruit-guide/400/300',
    year: '2024',
    description: 'Step-by-step guide helping student-athletes navigate the college recruiting process.',
  },
  {
    id: 'pf4', title: 'Community Combine', category: 'Event',
    thumbHue: 30, thumbEmoji: '🏟️',
    thumbUri: 'https://picsum.photos/seed/community-combine/400/300',
    year: '2024',
    description: 'Annual combine event connecting 200+ athletes with college coaches and scouts.',
  },
  {
    id: 'pf5', title: 'Elite Position Clinics', category: 'Training',
    thumbHue: 10, thumbEmoji: '🏈',
    thumbUri: 'https://picsum.photos/seed/elite-clinics/400/300',
    year: '2023',
    description: 'Position-specific skill clinics run quarterly in the Southeast region.',
  },
  {
    id: 'pf6', title: 'Athlete Brand Blueprint', category: 'Education',
    thumbHue: 230, thumbEmoji: '🎯',
    thumbUri: 'https://picsum.photos/seed/brand-blueprint/400/300',
    year: '2023',
    description: 'Online course teaching athletes how to build and monetize their personal brand.',
  },
];

// ── Featured Content ──────────────────────────────────────────────────────────

export const HUB_FEATURED: FeaturedContent[] = [
  {
    id: 'fc1', title: 'How I Built My Brand from Zero',
    type: 'video', thumbHue: 200, thumbEmoji: '🚀',
    thumbUri: 'https://picsum.photos/seed/brand-zero/400/225',
    viewCount: '14.2K', timestamp: '3 days ago',
  },
  {
    id: 'fc2', title: 'Top 5 Recruiting Mistakes (Thread)',
    type: 'social', thumbHue: 150, thumbEmoji: '📋',
    thumbUri: 'https://picsum.photos/seed/recruiting-thread/400/225',
    viewCount: '8.1K', timestamp: '1 week ago',
  },
  {
    id: 'fc3', title: 'Behind the Combine: Full Recap',
    type: 'video', thumbHue: 30, thumbEmoji: '🎬',
    thumbUri: 'https://picsum.photos/seed/combine-recap/400/225',
    viewCount: '22.5K', timestamp: '2 weeks ago',
  },
  {
    id: 'fc4', title: 'Mindset Thread: The 1% Rule',
    type: 'social', thumbHue: 280, thumbEmoji: '🧠',
    thumbUri: 'https://picsum.photos/seed/mindset-1pct/400/225',
    viewCount: '6.8K', timestamp: '3 weeks ago',
  },
];

// ── Analytics ─────────────────────────────────────────────────────────────────

export const HUB_ANALYTICS = {
  followers: 1247,
  followersTrend: +12.4,
  earnings: 3400,
  earningsTrend: +8.2,
  views: 15200,
  viewsTrend: +21.7,
  subscribers: 247,
  subscribersTrend: +5.6,
  engagementRate: 4.2,
  engagementTrend: +0.3,
};

// ── Chart Data ────────────────────────────────────────────────────────────────

export const HUB_CHART_DATA: ChartPoint[] = [
  { label: 'Jan', followers: 820,  views: 8200,  earnings: 1800 },
  { label: 'Feb', followers: 890,  views: 9100,  earnings: 2100 },
  { label: 'Mar', followers: 1050, views: 14800, earnings: 2400 },
  { label: 'Apr', followers: 980,  views: 10200, earnings: 2200 },
  { label: 'May', followers: 1020, views: 11500, earnings: 2900 },
  { label: 'Jun', followers: 1140, views: 13800, earnings: 3100 },
  { label: 'Jul', followers: 1247, views: 15200, earnings: 3400 },
];

export function getChartMax(metric: ChartMetric): number {
  return Math.max(...HUB_CHART_DATA.map(d => d[metric]));
}

// ── Activity ──────────────────────────────────────────────────────────────────

export const HUB_ACTIVITY: ActivityItem[] = [
  { id: 'a1', icon: 'person.fill.badge.plus', message: 'Marcus T. started following you',     detail: '+1 follower',    timeAgo: '2m ago',   type: 'follow' },
  { id: 'a2', icon: 'star.fill',              message: 'Jordan W. subscribed to Supporter',   detail: '+$10/mo',        timeAgo: '18m ago',  type: 'subscribe' },
  { id: 'a3', icon: 'chart.line.uptrend.xyaxis', message: '"How I Built My Brand" trending', detail: '14.2K views',   timeAgo: '1h ago',   type: 'content' },
  { id: 'a4', icon: 'dollarsign.circle.fill', message: 'Monthly payout processed',            detail: '$1,240.00',      timeAgo: '2h ago',   type: 'payout' },
  { id: 'a5', icon: 'person.fill.badge.plus', message: 'Nia S. started following you',        detail: '+1 follower',    timeAgo: '3h ago',   type: 'follow' },
  { id: 'a6', icon: 'star.fill',              message: 'Alex K. subscribed to VIP',            detail: '+$25/mo',        timeAgo: '5h ago',   type: 'subscribe' },
  { id: 'a7', icon: 'chart.line.uptrend.xyaxis', message: 'Combine Recap hit 22K views',     detail: 'Top content',    timeAgo: '8h ago',   type: 'content' },
  { id: 'a8', icon: 'person.fill.badge.plus', message: '3 new followers today',               detail: '+3 followers',   timeAgo: '12h ago',  type: 'follow' },
];

// ── Goals ─────────────────────────────────────────────────────────────────────

export const HUB_GOALS: Goal[] = [
  { id: 'g1', label: 'Reach 2K Followers',    current: 1247, target: 2000,  unit: 'followers' },
  { id: 'g2', label: 'Earn $5K/month',         current: 3400, target: 5000,  unit: 'dollars' },
  { id: 'g3', label: '250 Paid Subscribers',   current: 247,  target: 250,   unit: 'subscribers' },
  { id: 'g4', label: 'Reach 25K Views',        current: 15200, target: 25000, unit: 'views' },
];

// ── Membership Tiers ──────────────────────────────────────────────────────────

export const HUB_TIERS: MemberTier[] = [
  {
    id: 'free', name: 'Free', price: 0, subscriberCount: 1000,
    perks: ['Access to public posts', 'Weekly newsletter', 'Community feed'],
    description: 'Follow along and get free content.',
  },
  {
    id: 'supporter', name: 'Supporter', price: 10, subscriberCount: 197,
    perks: ['All Free perks', 'Exclusive monthly Q&A', 'Private community channel', 'Early content access'],
    description: 'Support the work and get exclusive access.',
  },
  {
    id: 'vip', name: 'VIP', price: 25, subscriberCount: 50,
    perks: ['All Supporter perks', 'Monthly 1:1 voice note', 'VIP-only newsletters', 'Priority booking discount'],
    description: 'Deep access to my best work and direct connection.',
  },
  {
    id: 'inner-circle', name: 'Inner Circle', price: 50, subscriberCount: 0,
    perks: ['All VIP perks', 'Monthly group call', 'Direct DM access', 'Co-creation opportunities', 'First access to programs'],
    description: 'The closest you can get — build with me directly.',
  },
];

export function getTierById(id: string): MemberTier | undefined {
  return HUB_TIERS.find(t => t.id === id);
}

export function getTierName(tierId: string): string {
  return getTierById(tierId)?.name ?? 'Free';
}

// ── Subscribers ───────────────────────────────────────────────────────────────

export const HUB_SUBSCRIBERS: Subscriber[] = [
  { id: 's1', name: 'Jordan Williams',  initials: 'JW', tierId: 'supporter', joinDate: 'Jan 2024', lifetimeValue: 120 },
  { id: 's2', name: 'Alex Kim',         initials: 'AK', tierId: 'vip',       joinDate: 'Feb 2024', lifetimeValue: 250 },
  { id: 's3', name: 'Nia Sanders',      initials: 'NS', tierId: 'supporter', joinDate: 'Mar 2024', lifetimeValue: 80 },
  { id: 's4', name: 'Devon Clarke',     initials: 'DC', tierId: 'vip',       joinDate: 'Mar 2024', lifetimeValue: 225 },
  { id: 's5', name: 'Priya Mehta',      initials: 'PM', tierId: 'supporter', joinDate: 'Apr 2024', lifetimeValue: 60 },
  { id: 's6', name: 'Marcus Thompson',  initials: 'MT', tierId: 'inner-circle', joinDate: 'May 2024', lifetimeValue: 250 },
  { id: 's7', name: 'Keisha Brown',     initials: 'KB', tierId: 'supporter', joinDate: 'Jun 2024', lifetimeValue: 40 },
  { id: 's8', name: 'Ravi Patel',       initials: 'RP', tierId: 'vip',       joinDate: 'Jul 2024', lifetimeValue: 50 },
];

// ── Newsletters ───────────────────────────────────────────────────────────────

export const HUB_NEWSLETTERS: Newsletter[] = [
  { id: 'n1', subject: 'The Combine Recap + What I Learned',  preview: 'This past weekend was something else…', sentAt: 'Jul 12, 2024', openRate: 64, clickRate: 18, recipients: 1180 },
  { id: 'n2', subject: '5 Recruiting Mistakes I See Every Year', preview: 'After working with 200+ athletes…',   sentAt: 'Jun 28, 2024', openRate: 71, clickRate: 22, recipients: 1110 },
  { id: 'n3', subject: 'Mid-Year Check-In + Goals Update',    preview: "Six months in, here's where we stand\u2026", sentAt: 'Jun 15, 2024', openRate: 58, clickRate: 14, recipients: 1040 },
  { id: 'n4', subject: 'How to Build Speed (Not Just Train)',  preview: 'Most athletes confuse training with…',   sentAt: 'May 30, 2024', openRate: 67, clickRate: 19, recipients: 990 },
  { id: 'n5', subject: 'Welcome to the Community \u2014 Start Here', preview: "If you're reading this for the first time\u2026", sentAt: 'May 10, 2024', openRate: 82, clickRate: 31, recipients: 940 },
];

// ── Content Items ─────────────────────────────────────────────────────────────

export const CONTENT_ITEMS: ContentItem[] = [
  // Today (0): 1 published + 1 scheduled
  { id: 'c1', type: 'post',  status: 'published', title: 'Building My Morning Routine',      preview: "Here's what 6 AM looks like for a full-time creator...",      destination: 'Social',   daysFromToday: 0,  time: '8:00 AM',  views: 4200,  engagement: 312 },
  { id: 'c2', type: 'story', status: 'scheduled', title: 'Behind the Scenes',               preview: 'Quick BTS from today\'s studio session',                        destination: 'Stories',  daysFromToday: 0,  time: '6:00 PM' },
  // Tomorrow (+1)
  { id: 'c3', type: 'reel',  status: 'scheduled', title: 'Brand Deal Announcement',         preview: 'Excited to share a new partnership...',                         destination: 'Reels',    daysFromToday: 1,  time: '2:00 PM' },
  { id: 'c4', type: 'post',  status: 'scheduled', title: 'Q&A — Your Top Questions',        preview: "Answering everything you've been asking this week",              destination: 'Social',   daysFromToday: 1,  time: '5:00 PM' },
  // +3 days
  { id: 'c5', type: 'ktv',   status: 'scheduled', title: 'Monthly Creator Q&A Live',        preview: 'Live session — subscribers only',                               destination: 'KTV',      daysFromToday: 3,  time: '7:00 PM' },
  // +4 days
  { id: 'c6', type: 'story', status: 'scheduled', title: 'Flash Sale — 24hrs Only',         preview: '30% off my course today only',                                  destination: 'Stories',  daysFromToday: 4,  time: '9:00 AM' },
  // Published (past)
  { id: 'l1', type: 'reel',  status: 'published', title: 'How I Built My Brand',            preview: "The full story from zero to monetization...",                   destination: 'Reels',    daysFromToday: -3, time: '10:00 AM', views: 14200, engagement: 1840 },
  { id: 'l2', type: 'ktv',   status: 'published', title: 'Combine Recap 2026',              preview: "Breaking down every top performer from this year's combine",    destination: 'KTV',      daysFromToday: -5, time: '3:00 PM',  views: 22000, engagement: 3100 },
  { id: 'l3', type: 'post',  status: 'published', title: 'My Gear Setup 2026',              preview: 'Every tool I use to create content professionally',              destination: 'Social',   daysFromToday: -7, time: '11:00 AM', views: 8900,  engagement: 720 },
  { id: 'l4', type: 'post',  status: 'published', title: 'Subscriber Milestone — 247',     preview: 'Thank you all for the support',                                  destination: 'Social',   daysFromToday: -10, time: '9:00 AM', views: 6100, engagement: 890 },
  { id: 'l5', type: 'reel',  status: 'published', title: 'Creator Mindset Shift',           preview: 'The one thing that changed everything for me',                  destination: 'Reels',    daysFromToday: -14, time: '4:00 PM', views: 9800, engagement: 1120 },
  // Drafts (unscheduled — daysFromToday: null)
  { id: 'd1', type: 'post',  status: 'draft',     title: 'My Journey to 1K',               preview: "The real story behind growing to 1,000 followers...",           destination: 'Social',   daysFromToday: null, lastEdited: '2h ago' },
  { id: 'd2', type: 'post',  status: 'draft',     title: 'Sponsor Review Draft',           preview: 'Reviewing the latest partnership proposal...',                   destination: 'Social',   daysFromToday: null, lastEdited: 'Yesterday' },
  { id: 'd3', type: 'ktv',   status: 'draft',     title: 'April Lookbook',                 preview: "Showcasing this month's top content picks",                     destination: 'KTV',      daysFromToday: null, lastEdited: '3 days ago' },
];

// ── Analytics ─────────────────────────────────────────────────────────────────

/** 90 daily engagement-rate values (oldest → newest). Current = last = 6.8% */
export const ANALYTICS_ENGAGEMENT_TREND: number[] = [
  4.5, 4.8, 4.6, 5.0, 5.2, 4.9, 4.7, 4.5, 4.8, 5.1,
  5.3, 5.0, 4.8, 5.5, 6.0, 5.7, 5.2, 4.9, 5.1, 5.4,
  5.6, 5.3, 4.9, 5.2, 5.8, 6.2, 5.9, 5.5, 5.3, 5.6,
  5.8, 5.5, 5.2, 5.7, 6.1, 5.8, 5.4, 5.0, 5.3, 5.7,
  6.0, 5.7, 5.3, 5.6, 6.2, 6.5, 6.1, 5.8, 5.5, 5.9,
  6.2, 5.9, 5.6, 6.0, 6.5, 6.8, 6.4, 6.0, 5.7, 6.1,
  5.1, 5.3, 4.9, 5.5, 6.2, 5.8, 5.4, 4.8, 5.1, 5.7,
  6.8, 7.2, 8.1, 7.4, 6.5, 5.9, 5.5, 6.1, 6.8, 7.1,
  6.4, 5.8, 6.2, 7.0, 7.8, 7.2, 6.5, 6.8, 7.1, 6.8,
];

export const ANALYTICS_AUDIENCE = {
  ages: [
    { range: '13–17', pct: 3  },
    { range: '18–24', pct: 28 },
    { range: '25–34', pct: 41 },
    { range: '35–44', pct: 18 },
    { range: '45–54', pct: 7  },
    { range: '55+',   pct: 3  },
  ],
  gender: { male: 65, female: 32, other: 3 },
  locations: [
    { city: 'Los Angeles', pct: 18 },
    { city: 'Oakland',     pct: 12 },
    { city: 'Miami',       pct:  9 },
    { city: 'Lagos',       pct:  7 },
    { city: 'Houston',     pct:  5 },
  ],
};

/** Heatmap: [day 0=Mon..6=Sun][slot 0=6am..7=8pm] — values 0–100 */
export const ANALYTICS_HEATMAP: number[][] = [
  [18, 28, 42, 55, 48, 62, 80, 88],
  [20, 32, 45, 58, 50, 68, 84, 90],
  [22, 35, 48, 60, 52, 70, 85, 92],
  [25, 38, 50, 62, 55, 72, 88, 95],
  [30, 42, 52, 58, 50, 75, 90, 82],
  [35, 50, 60, 68, 70, 78, 80, 70],
  [28, 45, 55, 65, 62, 72, 76, 65],
];
export const HEATMAP_HOURS = ['6am','8am','10am','12pm','2pm','4pm','6pm','8pm'];
export const HEATMAP_DAYS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export const ANALYTICS_TOP_CONTENT = [
  { id: 'tc1', title: 'Combine Recap 2026',           type: 'ktv'  as ContentType, reach: 22000, engRate: 14.1, revenue: 420, date: 'Apr 1'  },
  { id: 'tc2', title: 'How I Built My Brand',          type: 'reel' as ContentType, reach: 14200, engRate: 13.0, revenue: 280, date: 'Apr 3'  },
  { id: 'tc3', title: 'Creator Mindset Shift',         type: 'reel' as ContentType, reach:  9800, engRate: 11.4, revenue: 180, date: 'Mar 23' },
  { id: 'tc4', title: 'My Gear Setup 2026',            type: 'post' as ContentType, reach:  8900, engRate:  8.1, revenue:  90, date: 'Mar 30' },
  { id: 'tc5', title: 'Building My Morning Routine',   type: 'post' as ContentType, reach:  4200, engRate:  7.4, revenue:  60, date: 'Apr 6'  },
];

export const ANALYTICS_GROWTH_SOURCES = [
  { label: 'Social discovery', count: 480, pct: 38 },
  { label: 'External links',   count: 320, pct: 26 },
  { label: 'Direct search',    count: 190, pct: 15 },
  { label: 'Cross-brand',      count: 150, pct: 12 },
  { label: 'Referral',         count: 107, pct:  9 },
];

export const ANALYTICS_REVENUE = [
  { source: 'Subscriptions',    amount: 2470, pct: 43 },
  { source: 'Digital Products', amount: 1100, pct: 19 },
  { source: 'Brand Deals',      amount:  920, pct: 16 },
  { source: 'Services',         amount:  580, pct: 10 },
  { source: 'Courses',          amount:  340, pct:  6 },
  { source: 'Affiliate',        amount:  230, pct:  4 },
  { source: 'Tips',             amount:  120, pct:  2 },
];

export const ANALYTICS_CONTENT_TYPES = [
  { label: 'KTV',     type: 'ktv'   as ContentType, count: 2, avgViews: 18100, avgEng: 14.1, revenue: 700 },
  { label: 'Reels',   type: 'reel'  as ContentType, count: 4, avgViews: 12000, avgEng: 12.3, revenue: 460 },
  { label: 'Posts',   type: 'post'  as ContentType, count: 7, avgViews:  5800, avgEng:  7.8, revenue: 150 },
  { label: 'Stories', type: 'story' as ContentType, count: 3, avgViews:  2400, avgEng:  4.2, revenue:  20 },
];

// ── Analytics Detail Data ─────────────────────────────────────────────────────

export const ANALYTICS_AGE_DETAIL: Record<string, { followers: number; engPct: number; topContent: string }> = {
  '13–17': { followers: 37,  engPct: 2.1,  topContent: 'Combine Recap 2026' },
  '18–24': { followers: 349, engPct: 28.4, topContent: 'How I Built My Brand' },
  '25–34': { followers: 511, engPct: 42.1, topContent: 'Combine Recap 2026' },
  '35–44': { followers: 224, engPct: 18.8, topContent: 'Creator Mindset Shift' },
  '45–54': { followers: 87,  engPct: 6.8,  topContent: 'My Gear Setup 2026' },
  '55+':   { followers: 37,  engPct: 1.8,  topContent: 'Building My Morning Routine' },
};

export const ANALYTICS_LOCATION_DETAIL: Record<string, { followers: number; engRate: number }> = {
  'Los Angeles': { followers: 224, engRate: 7.2 },
  'Oakland':     { followers: 150, engRate: 8.1 },
  'Miami':       { followers: 112, engRate: 6.9 },
  'Lagos':       { followers: 87,  engRate: 9.4 },
  'Houston':     { followers: 62,  engRate: 7.8 },
};

export const ANALYTICS_GROWTH_DETAIL: Record<string, {
  topPosts: string[];
  trend: 'up' | 'down' | 'stable';
  recentFollowers: string[];
}> = {
  'Social discovery': {
    topPosts: ['Combine Recap 2026', 'How I Built My Brand', 'Creator Mindset Shift'],
    trend: 'up',
    recentFollowers: ['Marcus T.', 'Nia S.', 'Jordan W.', 'Devon C.', 'Priya M.'],
  },
  'External links': {
    topPosts: ['My Gear Setup 2026', 'How I Built My Brand', 'Building My Morning Routine'],
    trend: 'stable',
    recentFollowers: ['Alex K.', 'Ravi P.', 'Keisha B.', 'Marcus T.', 'Jordan W.'],
  },
  'Direct search': {
    topPosts: ['Speed & Agility Program', 'Recruiting Guide 2024', 'Combine Recap 2026'],
    trend: 'up',
    recentFollowers: ['Devon C.', 'Priya M.', 'Nia S.', 'Alex K.', 'Ravi P.'],
  },
  'Cross-brand': {
    topPosts: ['Mental Edge Podcast Collab', 'Community Combine Event', 'Brand Deal Reel'],
    trend: 'stable',
    recentFollowers: ['Keisha B.', 'Marcus T.', 'Jordan W.', 'Devon C.', 'Nia S.'],
  },
  'Referral': {
    topPosts: ['How I Built My Brand', 'Creator Mindset Shift', 'My Gear Setup 2026'],
    trend: 'down',
    recentFollowers: ['Priya M.', 'Alex K.', 'Ravi P.', 'Keisha B.', 'Marcus T.'],
  },
};

export const ANALYTICS_REVENUE_DETAIL: Record<string, { label: string; count: number | null; revenue: number; detail: string }[]> = {
  'Subscriptions':    [
    { label: 'Free',         count: 1000, revenue: 0,    detail: 'followers' },
    { label: 'Supporter',    count: 197,  revenue: 1970, detail: '$10/mo' },
    { label: 'VIP',          count: 50,   revenue: 1250, detail: '$25/mo' },
    { label: 'Inner Circle', count: 0,    revenue: 0,    detail: '$50/mo' },
  ],
  'Brand Deals':      [
    { label: 'Nike Training Partnership', count: null, revenue: 500, detail: 'Apr 2026' },
    { label: 'Whoop Affiliate Deal',      count: null, revenue: 280, detail: 'Mar 2026' },
    { label: 'Hudl Sponsorship',          count: null, revenue: 140, detail: 'Mar 2026' },
  ],
  'Digital Products': [
    { label: 'Speed & Agility Program', count: 28, revenue: 560, detail: '$20/unit' },
    { label: 'Recruiting Guide 2024',   count: 12, revenue: 360, detail: '$30/unit' },
    { label: 'Athlete Brand Blueprint', count: 7,  revenue: 175, detail: '$25/unit' },
  ],
};

export const ANALYTICS_CONTENT_DETAIL: Record<string, { views: number; likes: number; comments: number; shares: number; saves: number }> = {
  tc1: { views: 22000, likes: 1840, comments: 420, shares: 680, saves: 210 },
  tc2: { views: 14200, likes: 1210, comments: 280, shares: 420, saves: 168 },
  tc3: { views:  9800, likes:  820, comments: 190, shares: 310, saves: 120 },
  tc4: { views:  8900, likes:  520, comments:  98, shares: 180, saves:  82 },
  tc5: { views:  4200, likes:  198, comments:  52, shares:  88, saves:  44 },
};

export const ANALYTICS_TYPE_CONTENT: Record<string, { title: string; views: number; engRate: number; revenue: number }[]> = {
  ktv: [
    { title: 'Combine Recap 2026',       views: 22000, engRate: 14.1, revenue: 420 },
    { title: 'Monthly Creator Q&A Live', views: 14200, engRate: 14.1, revenue: 280 },
  ],
  reel: [
    { title: 'How I Built My Brand',     views: 14200, engRate: 13.0, revenue: 280 },
    { title: 'Creator Mindset Shift',    views:  9800, engRate: 11.4, revenue: 180 },
    { title: 'Brand Deal Announcement',  views:  6400, engRate:  9.2, revenue:   0 },
    { title: 'Q&A — Your Top Questions', views:  4100, engRate:  8.1, revenue:   0 },
  ],
  post: [
    { title: 'My Gear Setup 2026',          views: 8900, engRate: 8.1, revenue:  90 },
    { title: 'Subscriber Milestone — 247',  views: 6100, engRate: 14.6, revenue:  0 },
    { title: 'Building My Morning Routine', views: 4200, engRate:  7.4, revenue:  60 },
    { title: 'Creator Gear Roundup',        views: 2800, engRate:  5.8, revenue:   0 },
    { title: 'Recruiting Thread',           views: 2100, engRate:  9.2, revenue:   0 },
  ],
  story: [
    { title: 'Behind the Scenes',   views: 3800, engRate: 4.8, revenue:  0 },
    { title: 'Flash Sale — 24hrs',  views: 2900, engRate: 5.2, revenue: 20 },
    { title: 'Studio BTS',          views: 1200, engRate: 3.8, revenue:  0 },
  ],
};

// ── Social Links ──────────────────────────────────────────────────────────────

export interface SocialProfile {
  id: string;
  platform: string;
  abbrev: string;
  url: string;
}

export const HUB_SOCIALS: SocialProfile[] = [
  { id: 's1', platform: 'Instagram', abbrev: 'IG', url: 'https://instagram.com/sammykalejaiye' },
  { id: 's2', platform: 'X',         abbrev: 'X',  url: 'https://x.com/sammykalejaiye' },
  { id: 's3', platform: 'TikTok',    abbrev: 'TK', url: 'https://tiktok.com/@sammykalejaiye' },
  { id: 's4', platform: 'YouTube',   abbrev: 'YT', url: 'https://youtube.com/@sammykalejaiye' },
  { id: 's5', platform: 'LinkedIn',  abbrev: 'LI', url: 'https://linkedin.com/in/sammykalejaiye' },
];
