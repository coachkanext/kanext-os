/**
 * Mock data for Personal Network — Community / Spaces / Connect.
 * Represents Sammy Kalejaiye's personal creator community.
 * 3 tiers: Free (40 members), Supporters ($10/mo, 15), Inner Circle ($25/mo, 5).
 * 4 spaces, 25 detailed members, Looking For posts, ice-breaker prompt, events.
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CommunityTier {
  id: string;
  name: string;
  price: number;
  color: string;
  memberCount: number;
  spaceId: string;
  perks: string[];
}

export interface CommunityMember {
  id: string;
  name: string;
  handle: string;
  initials: string;
  avatarHue: number;
  tierId: string;
  joinDate: Date;
  isOnline: boolean;
  bio: string;
  interests: string[];
  location: string;
  mutualCount: number;
}

export interface CommunitySpace {
  id: string;
  name: string;
  tierId: string | null;
  memberCount: number;
  lastActive: Date;
  unreadCount: number;
  description: string;
  isCustom: boolean;
  icon: string;
}

export interface LookingForPost {
  id: string;
  authorId: string;
  text: string;
  tags: string[];
  postedAt: Date;
  responseCount: number;
}

export interface IceBreakerPrompt {
  id: string;
  text: string;
  postedAt: Date;
  responseCount: number;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  tierId: string | null;
  rsvpCount: number;
  isRsvped: boolean;
  emoji: string;
}

export interface CommunityStats {
  totalMembers: number;
  activeThisWeek: number;
  newThisWeek: number;
  spacesCount: number;
  introductionsMade: number;
}

// ── Tiers ─────────────────────────────────────────────────────────────────────

export const COMMUNITY_TIERS: CommunityTier[] = [
  {
    id: 'free',
    name: 'Free Community',
    price: 0,
    color: 'rgba(45,30,18,0.50)',
    memberCount: 40,
    spaceId: 'sp1',
    perks: ['General Community room access', 'Weekly community digest', 'Community directory browsing'],
  },
  {
    id: 'supporters',
    name: 'Supporters',
    price: 10,
    color: '#5A8A6E',
    memberCount: 15,
    spaceId: 'sp2',
    perks: ['All Free perks', 'Supporters Lounge room', 'Monthly live Q&A', 'Early announcements', 'Priority DMs'],
  },
  {
    id: 'inner_circle',
    name: 'Inner Circle',
    price: 25,
    color: '#D97757',
    memberCount: 5,
    spaceId: 'sp3',
    perks: ['All Supporter perks', 'Private Inner Circle room', 'Monthly 1:1 call', 'Direct line to Sammy', 'Co-creation opportunities'],
  },
];

// ── Spaces ────────────────────────────────────────────────────────────────────

export const COMMUNITY_SPACES: CommunitySpace[] = [
  {
    id: 'sp1',
    name: 'General Community',
    tierId: 'free',
    memberCount: 60,
    lastActive: new Date(Date.now() - 5 * 60 * 1000),
    unreadCount: 12,
    description: 'Open to everyone. Introductions, general chat, and community updates.',
    isCustom: false,
    icon: 'person.3',
  },
  {
    id: 'sp2',
    name: 'Supporters Lounge',
    tierId: 'supporters',
    memberCount: 15,
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    unreadCount: 3,
    description: 'Deeper conversations for Supporters. Early access and exclusive drops.',
    isCustom: false,
    icon: 'star',
  },
  {
    id: 'sp3',
    name: 'Inner Circle Room',
    tierId: 'inner_circle',
    memberCount: 5,
    lastActive: new Date(Date.now() - 30 * 60 * 1000),
    unreadCount: 1,
    description: 'Private high-trust room. Real conversations, co-creation, direct access.',
    isCustom: false,
    icon: 'sparkles',
  },
  {
    id: 'sp4',
    name: 'Side Hustle Talk',
    tierId: null,
    memberCount: 28,
    lastActive: new Date(Date.now() - 15 * 60 * 1000),
    unreadCount: 7,
    description: 'Business ideas, entrepreneurship, and accountability. All members welcome.',
    isCustom: true,
    icon: 'briefcase',
  },
];

// ── Members ───────────────────────────────────────────────────────────────────

export const COMMUNITY_MEMBERS: CommunityMember[] = [
  // Inner Circle (5)
  {
    id: 'cm1',
    name: 'Deondre Banks',
    handle: '@dbanks',
    initials: 'DB',
    avatarHue: 210,
    tierId: 'inner_circle',
    joinDate: new Date('2025-11-12'),
    isOnline: true,
    bio: 'Founder @NovaTech. Angel investor. Building tools that empower creators.',
    interests: ['entrepreneurship', 'investing', 'coding', 'community-building'],
    location: 'Atlanta, GA',
    mutualCount: 4,
  },
  {
    id: 'cm2',
    name: 'Zara Hassan',
    handle: '@zarahassan',
    initials: 'ZH',
    avatarHue: 280,
    tierId: 'inner_circle',
    joinDate: new Date('2025-12-03'),
    isOnline: true,
    bio: 'Creative director & brand strategist. Helping founders tell better stories.',
    interests: ['design', 'marketing', 'photography', 'travel'],
    location: 'New York, NY',
    mutualCount: 6,
  },
  {
    id: 'cm3',
    name: 'Jaylen Cross',
    handle: '@jcross',
    initials: 'JC',
    avatarHue: 160,
    tierId: 'inner_circle',
    joinDate: new Date('2026-01-08'),
    isOnline: false,
    bio: 'Real estate investor. 12 properties. Building generational wealth one door at a time.',
    interests: ['real-estate', 'investing', 'fitness', 'entrepreneurship'],
    location: 'Houston, TX',
    mutualCount: 3,
  },
  {
    id: 'cm4',
    name: 'Aisha Nwosu',
    handle: '@aishanwosu',
    initials: 'AN',
    avatarHue: 30,
    tierId: 'inner_circle',
    joinDate: new Date('2026-01-20'),
    isOnline: true,
    bio: 'Music producer & sound engineer. Credits: 3 platinum albums.',
    interests: ['music-production', 'podcasting', 'entrepreneurship', 'community-building'],
    location: 'Los Angeles, CA',
    mutualCount: 7,
  },
  {
    id: 'cm5',
    name: 'Omar Osei',
    handle: '@omarosei',
    initials: 'OO',
    avatarHue: 190,
    tierId: 'inner_circle',
    joinDate: new Date('2026-02-01'),
    isOnline: false,
    bio: 'Software engineer @ Meta. Building side projects at night. Obsessed with craft.',
    interests: ['coding', 'design', 'community-building', 'entrepreneurship'],
    location: 'San Francisco, CA',
    mutualCount: 5,
  },
  // Supporters (8)
  {
    id: 'cm6',
    name: 'Keisha Brown',
    handle: '@keishabrown',
    initials: 'KB',
    avatarHue: 350,
    tierId: 'supporters',
    joinDate: new Date('2025-10-15'),
    isOnline: true,
    bio: 'Fitness coach. Helping women build strength inside and out.',
    interests: ['fitness', 'community-building', 'writing', 'podcasting'],
    location: 'Chicago, IL',
    mutualCount: 2,
  },
  {
    id: 'cm7',
    name: 'Tobi Adeleke',
    handle: '@tobiadel',
    initials: 'TA',
    avatarHue: 60,
    tierId: 'supporters',
    joinDate: new Date('2025-10-28'),
    isOnline: true,
    bio: 'Digital nomad & content creator. Traveled to 40+ countries.',
    interests: ['travel', 'photography', 'writing', 'marketing'],
    location: 'Remote 🌍',
    mutualCount: 8,
  },
  {
    id: 'cm8',
    name: 'Simone Fields',
    handle: '@sfields',
    initials: 'SF',
    avatarHue: 120,
    tierId: 'supporters',
    joinDate: new Date('2025-11-05'),
    isOnline: false,
    bio: 'UX designer @ Figma. Making complex products feel simple.',
    interests: ['design', 'coding', 'photography', 'community-building'],
    location: 'Austin, TX',
    mutualCount: 3,
  },
  {
    id: 'cm9',
    name: 'Malik Okonkwo',
    handle: '@malikok',
    initials: 'MO',
    avatarHue: 240,
    tierId: 'supporters',
    joinDate: new Date('2025-11-19'),
    isOnline: true,
    bio: 'Chef & food entrepreneur. Cooking African diaspora cuisine for the next gen.',
    interests: ['cooking', 'entrepreneurship', 'community-building', 'marketing'],
    location: 'Washington, D.C.',
    mutualCount: 1,
  },
  {
    id: 'cm10',
    name: 'Alexis Porter',
    handle: '@alexisp',
    initials: 'AP',
    avatarHue: 310,
    tierId: 'supporters',
    joinDate: new Date('2025-12-10'),
    isOnline: false,
    bio: 'Podcast host. "The Build" — entrepreneurship stories for underdogs.',
    interests: ['podcasting', 'entrepreneurship', 'writing', 'marketing'],
    location: 'Brooklyn, NY',
    mutualCount: 4,
  },
  {
    id: 'cm11',
    name: 'Kwame Asante',
    handle: '@kwameasante',
    initials: 'KA',
    avatarHue: 80,
    tierId: 'supporters',
    joinDate: new Date('2026-01-03'),
    isOnline: true,
    bio: 'Blockchain developer. Building DeFi products that serve the underbanked.',
    interests: ['coding', 'investing', 'entrepreneurship', 'real-estate'],
    location: 'Accra / London',
    mutualCount: 2,
  },
  {
    id: 'cm12',
    name: 'Nadia Reeves',
    handle: '@nadiareeves',
    initials: 'NR',
    avatarHue: 170,
    tierId: 'supporters',
    joinDate: new Date('2026-01-14'),
    isOnline: false,
    bio: 'High school principal & education advocate. Kids deserve better systems.',
    interests: ['community-building', 'writing', 'education', 'sports'],
    location: 'Detroit, MI',
    mutualCount: 0,
  },
  {
    id: 'cm13',
    name: 'Rashid Elamin',
    handle: '@rashidel',
    initials: 'RE',
    avatarHue: 20,
    tierId: 'supporters',
    joinDate: new Date('2026-02-20'),
    isOnline: true,
    bio: 'Sports analyst & data scientist. Turning numbers into stories.',
    interests: ['sports', 'coding', 'investing', 'community-building'],
    location: 'Charlotte, NC',
    mutualCount: 3,
  },
  // Free Community (12)
  {
    id: 'cm14',
    name: 'Tanya Williams',
    handle: '@tanyaw',
    initials: 'TW',
    avatarHue: 50,
    tierId: 'free',
    joinDate: new Date('2025-09-08'),
    isOnline: true,
    bio: 'Marketing assistant by day, creator by night.',
    interests: ['marketing', 'photography', 'writing', 'travel'],
    location: 'Nashville, TN',
    mutualCount: 1,
  },
  {
    id: 'cm15',
    name: 'David Osei',
    handle: '@davido',
    initials: 'DO',
    avatarHue: 200,
    tierId: 'free',
    joinDate: new Date('2025-09-22'),
    isOnline: false,
    bio: 'Recent grad interested in real estate and entrepreneurship.',
    interests: ['real-estate', 'entrepreneurship', 'fitness', 'investing'],
    location: 'Columbus, OH',
    mutualCount: 0,
  },
  {
    id: 'cm16',
    name: 'Fatima Al-Rashid',
    handle: '@fatimaa',
    initials: 'FA',
    avatarHue: 260,
    tierId: 'free',
    joinDate: new Date('2025-10-01'),
    isOnline: false,
    bio: 'Graphic designer. Freelance. Always looking for interesting projects.',
    interests: ['design', 'photography', 'marketing', 'community-building'],
    location: 'Toronto, Canada',
    mutualCount: 2,
  },
  {
    id: 'cm17',
    name: 'Isaiah Grant',
    handle: '@isaiahg',
    initials: 'IG',
    avatarHue: 140,
    tierId: 'free',
    joinDate: new Date('2025-10-14'),
    isOnline: true,
    bio: 'Aspiring music producer. Learning the craft from scratch.',
    interests: ['music-production', 'entrepreneurship', 'coding', 'podcasting'],
    location: 'Miami, FL',
    mutualCount: 1,
  },
  {
    id: 'cm18',
    name: 'Chioma Obi',
    handle: '@chiomaob',
    initials: 'CO',
    avatarHue: 320,
    tierId: 'free',
    joinDate: new Date('2025-11-02'),
    isOnline: true,
    bio: 'Nurse practitioner dreaming of building a wellness brand.',
    interests: ['fitness', 'community-building', 'entrepreneurship', 'writing'],
    location: 'Dallas, TX',
    mutualCount: 0,
  },
  {
    id: 'cm19',
    name: 'Jordan Mensah',
    handle: '@jordanm',
    initials: 'JM',
    avatarHue: 100,
    tierId: 'free',
    joinDate: new Date('2025-11-15'),
    isOnline: false,
    bio: 'Finance grad. Learning to invest. Real estate curious.',
    interests: ['investing', 'real-estate', 'coding', 'sports'],
    location: 'Philadelphia, PA',
    mutualCount: 1,
  },
  {
    id: 'cm20',
    name: 'Blessing Eze',
    handle: '@blessingeze',
    initials: 'BE',
    avatarHue: 40,
    tierId: 'free',
    joinDate: new Date('2025-12-01'),
    isOnline: false,
    bio: 'Travel blogger. Stories from 30 countries. Obsessed with local food.',
    interests: ['travel', 'writing', 'photography', 'cooking'],
    location: 'London, UK',
    mutualCount: 3,
  },
  {
    id: 'cm21',
    name: 'Marcus Nkosi',
    handle: '@marcusnk',
    initials: 'MN',
    avatarHue: 180,
    tierId: 'free',
    joinDate: new Date('2026-01-05'),
    isOnline: true,
    bio: 'Self-taught developer. Building my first SaaS.',
    interests: ['coding', 'entrepreneurship', 'design', 'community-building'],
    location: 'Cape Town, SA',
    mutualCount: 2,
  },
  {
    id: 'cm22',
    name: 'Amara Diallo',
    handle: '@amaradl',
    initials: 'AD',
    avatarHue: 220,
    tierId: 'free',
    joinDate: new Date('2026-01-22'),
    isOnline: false,
    bio: 'Social media manager. Learning what makes content actually work.',
    interests: ['marketing', 'photography', 'community-building', 'design'],
    location: 'Birmingham, UK',
    mutualCount: 0,
  },
  {
    id: 'cm23',
    name: 'Leo Adjei',
    handle: '@leoadj',
    initials: 'LA',
    avatarHue: 290,
    tierId: 'free',
    joinDate: new Date('2026-03-19'),
    isOnline: true,
    bio: 'College student. Pre-law. Here for the motivation and the network.',
    interests: ['entrepreneurship', 'writing', 'community-building', 'sports'],
    location: 'Baltimore, MD',
    mutualCount: 1,
  },
  {
    id: 'cm24',
    name: 'Yemi Fadipe',
    handle: '@yemifad',
    initials: 'YF',
    avatarHue: 75,
    tierId: 'free',
    joinDate: new Date('2026-03-21'),
    isOnline: false,
    bio: 'Software engineer & weekend woodworker. Building with hands and code.',
    interests: ['coding', 'entrepreneurship', 'fitness', 'real-estate'],
    location: 'Seattle, WA',
    mutualCount: 0,
  },
  {
    id: 'cm25',
    name: 'Priya Mehta',
    handle: '@priyamehta',
    initials: 'PM',
    avatarHue: 340,
    tierId: 'free',
    joinDate: new Date('2026-03-22'),
    isOnline: true,
    bio: 'Startup founder (stealth mode). First-time builder, long-time dreamer.',
    interests: ['entrepreneurship', 'community-building', 'design', 'podcasting'],
    location: 'Austin, TX',
    mutualCount: 2,
  },
];

// ── Looking For Posts ──────────────────────────────────────────────────────────

export const LOOKING_FOR_POSTS: LookingForPost[] = [
  {
    id: 'lf1',
    authorId: 'cm25',
    text: "Looking for a technical co-founder for a B2B SaaS in the talent space. I have the domain expertise covered — need someone who can build. Early stage, big vision.",
    tags: ['entrepreneurship', 'coding'],
    postedAt: new Date('2026-03-22T10:00:00'),
    responseCount: 4,
  },
  {
    id: 'lf2',
    authorId: 'cm6',
    text: "Looking for 3-4 accountability partners for a 90-day fitness challenge. Daily check-ins, Sunday calls. Serious only.",
    tags: ['fitness', 'community-building'],
    postedAt: new Date('2026-03-20T14:30:00'),
    responseCount: 9,
  },
  {
    id: 'lf3',
    authorId: 'cm10',
    text: "Seeking podcast guests for 'The Build' — if you've started something from nothing, I want your story. Especially underrepresented founders.",
    tags: ['podcasting', 'entrepreneurship'],
    postedAt: new Date('2026-03-18T09:00:00'),
    responseCount: 12,
  },
  {
    id: 'lf4',
    authorId: 'cm17',
    text: "Looking for a music production mentor. 6 months into Ableton. Happy to offer video editing / social media skills in exchange.",
    tags: ['music-production', 'design'],
    postedAt: new Date('2026-03-15T16:00:00'),
    responseCount: 6,
  },
];

// ── Ice-breaker Prompt ────────────────────────────────────────────────────────

export const ICEBREAKER_PROMPT: IceBreakerPrompt = {
  id: 'ib1',
  text: "What's one thing you're building right now — and what's the hardest part about it?",
  postedAt: new Date('2026-03-24T08:00:00'),
  responseCount: 18,
};

// ── Events ────────────────────────────────────────────────────────────────────

export const COMMUNITY_EVENTS: CommunityEvent[] = [
  {
    id: 'ce1',
    title: 'Weekly AMA with Sammy',
    description: 'Open Q&A — ask about KaNeXT, community, or life. Supporters & Inner Circle.',
    date: new Date('2026-03-26T19:00:00'),
    tierId: 'supporters',
    rsvpCount: 12,
    isRsvped: false,
    emoji: '🎙️',
  },
  {
    id: 'ce2',
    title: 'Community Game Night',
    description: 'Casual Jackbox gaming for the whole community. Come to unwind and meet people.',
    date: new Date('2026-03-29T20:00:00'),
    tierId: null,
    rsvpCount: 28,
    isRsvped: true,
    emoji: '🎮',
  },
  {
    id: 'ce3',
    title: 'Accountability Check-In',
    description: 'Monthly call. Share goals, wins, and blockers. Inner Circle only.',
    date: new Date('2026-03-31T18:00:00'),
    tierId: 'inner_circle',
    rsvpCount: 5,
    isRsvped: false,
    emoji: '📋',
  },
];

// ── Stats ──────────────────────────────────────────────────────────────────────

export const COMMUNITY_STATS: CommunityStats = {
  totalMembers: 60,
  activeThisWeek: 34,
  newThisWeek: 7,
  spacesCount: 4,
  introductionsMade: 23,
};

// ── Interest tags ──────────────────────────────────────────────────────────────

export const ALL_INTEREST_TAGS = [
  'fitness', 'entrepreneurship', 'music-production', 'coding', 'real-estate',
  'design', 'travel', 'cooking', 'photography', 'writing', 'podcasting',
  'investing', 'sports', 'community-building', 'marketing', 'education',
] as const;

// ── Helpers ────────────────────────────────────────────────────────────────────

export function getMembersByTier(tierId: string): CommunityMember[] {
  return COMMUNITY_MEMBERS.filter(m => m.tierId === tierId);
}

export function getMemberById(id: string): CommunityMember | undefined {
  return COMMUNITY_MEMBERS.find(m => m.id === id);
}

export function getTierById(id: string): CommunityTier | undefined {
  return COMMUNITY_TIERS.find(t => t.id === id);
}

export function searchMembers(query: string): CommunityMember[] {
  const q = query.toLowerCase();
  return COMMUNITY_MEMBERS.filter(m =>
    m.name.toLowerCase().includes(q) ||
    m.handle.toLowerCase().includes(q) ||
    m.interests.some(i => i.toLowerCase().includes(q)) ||
    m.location.toLowerCase().includes(q)
  );
}

export function isNewThisWeek(date: Date): boolean {
  return Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000;
}

export function formatJoinDate(date: Date): string {
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (diffDays < 1) return 'Today';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

export function formatLastActive(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export function formatEventDate(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const h = date.getHours();
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()} · ${h % 12 || 12}:${String(date.getMinutes()).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

export function formatPostAge(date: Date): string {
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (diffDays < 1) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 7)}w ago`;
}
