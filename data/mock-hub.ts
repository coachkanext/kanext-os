/**
 * Mock data for Personal Hub — Sammy Kalejaiye's creator backend.
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type ChartMetric = 'followers' | 'views' | 'earnings';

export interface HubLink {
  id: string;
  icon: string;
  title: string;
  url: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  thumbHue: number;
  thumbEmoji: string;
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
  { id: 'l5', icon: 'cart.fill',        title: 'Merch Store',        url: 'https://store.sammyk.com' },
  { id: 'l6', icon: 'doc.text.fill',    title: 'Free Playbook PDF',  url: 'https://sammyk.com/playbook' },
];

// ── Portfolio ─────────────────────────────────────────────────────────────────

export const HUB_PORTFOLIO: PortfolioItem[] = [
  {
    id: 'pf1', title: 'Speed & Agility Program', category: 'Training',
    thumbHue: 200, thumbEmoji: '⚡', year: '2024',
    description: '12-week speed and agility curriculum designed for high school athletes. Used by 3 regional programs.',
  },
  {
    id: 'pf2', title: 'Mental Edge Podcast', category: 'Media',
    thumbHue: 280, thumbEmoji: '🎙️', year: '2023',
    description: '50+ episodes covering sports psychology, mindset, and peak performance with pro athletes.',
  },
  {
    id: 'pf3', title: 'Recruiting Guide 2024', category: 'Education',
    thumbHue: 150, thumbEmoji: '📖', year: '2024',
    description: 'Step-by-step guide helping student-athletes navigate the college recruiting process.',
  },
  {
    id: 'pf4', title: 'Community Combine', category: 'Event',
    thumbHue: 30, thumbEmoji: '🏟️', year: '2024',
    description: 'Annual combine event connecting 200+ athletes with college coaches and scouts.',
  },
  {
    id: 'pf5', title: 'Elite Position Clinics', category: 'Training',
    thumbHue: 10, thumbEmoji: '🏈', year: '2023',
    description: 'Position-specific skill clinics run quarterly in the Southeast region.',
  },
  {
    id: 'pf6', title: 'Athlete Brand Blueprint', category: 'Education',
    thumbHue: 230, thumbEmoji: '🎯', year: '2023',
    description: 'Online course teaching athletes how to build and monetize their personal brand.',
  },
];

// ── Featured Content ──────────────────────────────────────────────────────────

export const HUB_FEATURED: FeaturedContent[] = [
  {
    id: 'fc1', title: 'How I Built My Brand from Zero',
    type: 'video', thumbHue: 200, thumbEmoji: '🚀',
    viewCount: '14.2K', timestamp: '3 days ago',
  },
  {
    id: 'fc2', title: 'Top 5 Recruiting Mistakes (Thread)',
    type: 'social', thumbHue: 150, thumbEmoji: '📋',
    viewCount: '8.1K', timestamp: '1 week ago',
  },
  {
    id: 'fc3', title: 'Behind the Combine: Full Recap',
    type: 'video', thumbHue: 30, thumbEmoji: '🎬',
    viewCount: '22.5K', timestamp: '2 weeks ago',
  },
  {
    id: 'fc4', title: 'Mindset Thread: The 1% Rule',
    type: 'social', thumbHue: 280, thumbEmoji: '🧠',
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
  { label: 'Jan', followers: 820,  views: 7400,  earnings: 1200 },
  { label: 'Feb', followers: 910,  views: 8900,  earnings: 1550 },
  { label: 'Mar', followers: 980,  views: 9200,  earnings: 1800 },
  { label: 'Apr', followers: 1050, views: 10400, earnings: 2100 },
  { label: 'May', followers: 1120, views: 12100, earnings: 2600 },
  { label: 'Jun', followers: 1180, views: 13800, earnings: 3100 },
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
