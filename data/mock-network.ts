/**
 * Mock data for Personal Network screen.
 * Followers / Following / Subscribers for Sammy Kalejaiye.
 */

export type Follower = {
  id: string;
  name: string;
  handle: string;
  initials: string;
  avatarHue: number;
  followDate: string; // ISO date string
  isSubscriber: boolean;
  subscriberTierId?: string;
};

export type FollowingEntry = {
  id: string;
  name: string;
  handle: string;
  type: 'person' | 'brand';
  modeTag: string; // e.g. 'Sports', 'Business', 'Personal'
  initials: string;
  avatarHue: number;
};

export type Subscriber = {
  id: string;
  name: string;
  handle: string;
  initials: string;
  avatarHue: number;
  tierId: string;
  tierName: string;
  tierPrice: number; // monthly USD
  memberSince: string; // ISO date
  lifetimeValue: number; // USD
  churnRisk: 'low' | 'medium' | 'high';
};

// ── Followers (52 entries) ─────────────────────────────────────────────────────

export const MOCK_FOLLOWERS: Follower[] = [
  { id: 'f1',  name: 'Jordan Miles',    handle: '@jordanmiles',    initials: 'JM', avatarHue: 210, followDate: '2024-01-12', isSubscriber: true,  subscriberTierId: 'supporter' },
  { id: 'f2',  name: 'Aaliyah Brooks',  handle: '@aaliyahb',       initials: 'AB', avatarHue: 340, followDate: '2024-02-03', isSubscriber: true,  subscriberTierId: 'vip' },
  { id: 'f3',  name: 'Marcus Webb',     handle: '@marcuswebb',     initials: 'MW', avatarHue: 120, followDate: '2024-02-18', isSubscriber: false },
  { id: 'f4',  name: 'Priya Nair',      handle: '@priyanair',      initials: 'PN', avatarHue: 260, followDate: '2024-03-05', isSubscriber: true,  subscriberTierId: 'free' },
  { id: 'f5',  name: 'Devon Carter',    handle: '@devoncarter',    initials: 'DC', avatarHue: 30,  followDate: '2024-03-21', isSubscriber: false },
  { id: 'f6',  name: 'Simone Baptiste', handle: '@simoneb',        initials: 'SB', avatarHue: 160, followDate: '2024-04-08', isSubscriber: true,  subscriberTierId: 'supporter' },
  { id: 'f7',  name: 'Tyler Rhodes',    handle: '@tylerrhodes',    initials: 'TR', avatarHue: 50,  followDate: '2024-04-15', isSubscriber: false },
  { id: 'f8',  name: 'Naomi Osei',      handle: '@naomiosei',      initials: 'NO', avatarHue: 200, followDate: '2024-05-02', isSubscriber: true,  subscriberTierId: 'vip' },
  { id: 'f9',  name: 'Caleb Torres',    handle: '@calebt',         initials: 'CT', avatarHue: 290, followDate: '2024-05-17', isSubscriber: false },
  { id: 'f10', name: 'Zara Mensah',     handle: '@zaramsn',        initials: 'ZM', avatarHue: 15,  followDate: '2024-05-28', isSubscriber: true,  subscriberTierId: 'supporter' },
  { id: 'f11', name: 'Elijah Grant',    handle: '@elijahgrant',    initials: 'EG', avatarHue: 175, followDate: '2024-06-03', isSubscriber: false },
  { id: 'f12', name: 'Maya Patel',      handle: '@mayapatel',      initials: 'MP', avatarHue: 230, followDate: '2024-06-14', isSubscriber: false },
  { id: 'f13', name: 'Isaiah Stone',    handle: '@isaiahstone',    initials: 'IS', avatarHue: 80,  followDate: '2024-06-22', isSubscriber: false },
  { id: 'f14', name: 'Jasmine Liu',     handle: '@jasmineliu',     initials: 'JL', avatarHue: 310, followDate: '2024-07-01', isSubscriber: true,  subscriberTierId: 'free' },
  { id: 'f15', name: 'Darius Young',    handle: '@dariusy',        initials: 'DY', avatarHue: 140, followDate: '2024-07-09', isSubscriber: false },
  { id: 'f16', name: 'Keiko Tanaka',    handle: '@keikot',         initials: 'KT', avatarHue: 190, followDate: '2024-07-18', isSubscriber: false },
  { id: 'f17', name: 'Omar Hassan',     handle: '@omarhassan',     initials: 'OH', avatarHue: 60,  followDate: '2024-07-25', isSubscriber: true,  subscriberTierId: 'supporter' },
  { id: 'f18', name: 'Tanya Moore',     handle: '@tanyamoore',     initials: 'TM', avatarHue: 250, followDate: '2024-08-04', isSubscriber: false },
  { id: 'f19', name: 'Kwame Asante',    handle: '@kwameasante',    initials: 'KA', avatarHue: 100, followDate: '2024-08-11', isSubscriber: false },
  { id: 'f20', name: 'Leila Farouk',    handle: '@leilaf',         initials: 'LF', avatarHue: 355, followDate: '2024-08-19', isSubscriber: true,  subscriberTierId: 'vip' },
  { id: 'f21', name: 'Nathan Bell',     handle: '@nathanbell',     initials: 'NB', avatarHue: 220, followDate: '2024-08-27', isSubscriber: false },
  { id: 'f22', name: 'Amara Diallo',    handle: '@amaradiallo',    initials: 'AD', avatarHue: 45,  followDate: '2024-09-05', isSubscriber: false },
  { id: 'f23', name: 'Chris Evans',     handle: '@chrisevans',     initials: 'CE', avatarHue: 180, followDate: '2024-09-12', isSubscriber: true,  subscriberTierId: 'supporter' },
  { id: 'f24', name: 'Fatima Al-Amin',  handle: '@fatimaaa',       initials: 'FA', avatarHue: 270, followDate: '2024-09-20', isSubscriber: false },
  { id: 'f25', name: 'Jaden Powell',    handle: '@jadenpowell',    initials: 'JP', avatarHue: 130, followDate: '2024-09-28', isSubscriber: false },
  { id: 'f26', name: 'Sofia Reyes',     handle: '@sofiareyes',     initials: 'SR', avatarHue: 20,  followDate: '2024-10-07', isSubscriber: false },
  { id: 'f27', name: 'Kofi Mensah',     handle: '@kofimensah',     initials: 'KM', avatarHue: 155, followDate: '2024-10-15', isSubscriber: true,  subscriberTierId: 'free' },
  { id: 'f28', name: 'Bria Watson',     handle: '@briawatson',     initials: 'BW', avatarHue: 320, followDate: '2024-10-23', isSubscriber: false },
  { id: 'f29', name: 'Andre Dupont',    handle: '@andred',         initials: 'AD', avatarHue: 70,  followDate: '2024-11-02', isSubscriber: false },
  { id: 'f30', name: 'Ingrid Larson',   handle: '@ingridl',        initials: 'IL', avatarHue: 200, followDate: '2024-11-10', isSubscriber: true,  subscriberTierId: 'supporter' },
  { id: 'f31', name: 'Marcus Reid',     handle: '@marcusreid',     initials: 'MR', avatarHue: 240, followDate: '2024-11-18', isSubscriber: false },
  { id: 'f32', name: 'Yuki Sato',       handle: '@yukisato',       initials: 'YS', avatarHue: 95,  followDate: '2024-11-26', isSubscriber: false },
  { id: 'f33', name: 'Blessing Okafor', handle: '@blessingokafor', initials: 'BO', avatarHue: 165, followDate: '2024-12-04', isSubscriber: true,  subscriberTierId: 'vip' },
  { id: 'f34', name: 'Carlos Vega',     handle: '@carlosvega',     initials: 'CV', avatarHue: 350, followDate: '2024-12-12', isSubscriber: false },
  { id: 'f35', name: 'Nadia Okon',      handle: '@nadiaokon',      initials: 'NO', avatarHue: 280, followDate: '2024-12-20', isSubscriber: false },
  { id: 'f36', name: 'Ethan Clarke',    handle: '@ethanclarke',    initials: 'EC', avatarHue: 110, followDate: '2025-01-05', isSubscriber: false },
  { id: 'f37', name: 'Rania Khalil',    handle: '@raniakhalil',    initials: 'RK', avatarHue: 35,  followDate: '2025-01-13', isSubscriber: true,  subscriberTierId: 'supporter' },
  { id: 'f38', name: 'DeShawn King',    handle: '@deshawnking',    initials: 'DK', avatarHue: 170, followDate: '2025-01-21', isSubscriber: false },
  { id: 'f39', name: 'Mei Chen',        handle: '@meichen',        initials: 'MC', avatarHue: 215, followDate: '2025-02-01', isSubscriber: false },
  { id: 'f40', name: 'Tobias Mwangi',   handle: '@tobiasmw',       initials: 'TM', avatarHue: 75,  followDate: '2025-02-08', isSubscriber: true,  subscriberTierId: 'free' },
  { id: 'f41', name: 'Alicia Ford',     handle: '@aliciaford',     initials: 'AF', avatarHue: 300, followDate: '2025-02-15', isSubscriber: false },
  { id: 'f42', name: 'Prince Owusu',    handle: '@princeowusu',    initials: 'PO', avatarHue: 145, followDate: '2025-02-22', isSubscriber: false },
  { id: 'f43', name: 'Layla Ahmed',     handle: '@laylaahmed',     initials: 'LA', avatarHue: 255, followDate: '2025-03-02', isSubscriber: true,  subscriberTierId: 'supporter' },
  { id: 'f44', name: 'Finn McCarthy',   handle: '@finnmc',         initials: 'FM', avatarHue: 10,  followDate: '2025-03-08', isSubscriber: false },
  { id: 'f45', name: 'Adaeze Nwosu',    handle: '@adaezenwosu',    initials: 'AN', avatarHue: 185, followDate: '2025-03-12', isSubscriber: false },
  { id: 'f46', name: 'Eli Goldstein',   handle: '@eligoldstein',   initials: 'EG', avatarHue: 230, followDate: '2025-03-15', isSubscriber: true,  subscriberTierId: 'vip' },
  { id: 'f47', name: 'Kim Nakamura',    handle: '@kimnakamura',    initials: 'KN', avatarHue: 125, followDate: '2025-03-17', isSubscriber: false },
  { id: 'f48', name: 'Tyrese Brown',    handle: '@tyreseb',        initials: 'TB', avatarHue: 50,  followDate: '2025-03-18', isSubscriber: false },
  { id: 'f49', name: 'Grace Abara',     handle: '@graceabara',     initials: 'GA', avatarHue: 195, followDate: '2025-03-19', isSubscriber: true,  subscriberTierId: 'supporter' },
  { id: 'f50', name: 'Leo Fischer',     handle: '@leofischer',     initials: 'LF', avatarHue: 270, followDate: '2025-03-20', isSubscriber: false },
  { id: 'f51', name: 'Zoe Abbot',       handle: '@zoeabbot',       initials: 'ZA', avatarHue: 330, followDate: '2025-03-21', isSubscriber: false },
  { id: 'f52', name: 'Sam Oduya',       handle: '@samoduya',       initials: 'SO', avatarHue: 90,  followDate: '2025-03-22', isSubscriber: true,  subscriberTierId: 'free' },
];

// ── Following (32 entries) ─────────────────────────────────────────────────────

export const MOCK_FOLLOWING: FollowingEntry[] = [
  { id: 'w1',  name: 'LeBron James',       handle: '@kingjames',       type: 'person', modeTag: 'Athletics',   initials: 'LJ', avatarHue: 30  },
  { id: 'w2',  name: 'Nike',               handle: '@nike',             type: 'brand',  modeTag: 'Athletics',   initials: 'NK', avatarHue: 0   },
  { id: 'w3',  name: 'Elon Musk',          handle: '@elonmusk',         type: 'person', modeTag: 'Business', initials: 'EM', avatarHue: 200 },
  { id: 'w4',  name: 'Google',             handle: '@google',           type: 'brand',  modeTag: 'Business', initials: 'GO', avatarHue: 210 },
  { id: 'w5',  name: 'Serena Williams',    handle: '@serenawilliams',   type: 'person', modeTag: 'Athletics',   initials: 'SW', avatarHue: 150 },
  { id: 'w6',  name: 'Adidas',             handle: '@adidas',           type: 'brand',  modeTag: 'Athletics',   initials: 'AD', avatarHue: 220 },
  { id: 'w7',  name: 'Obama Foundation',   handle: '@obamafoundation',  type: 'brand',  modeTag: 'Community',initials: 'OF', avatarHue: 260 },
  { id: 'w8',  name: 'Steph Curry',        handle: '@stephcurry30',     type: 'person', modeTag: 'Athletics',   initials: 'SC', avatarHue: 240 },
  { id: 'w9',  name: 'Harvard Business',   handle: '@harvardbiz',       type: 'brand',  modeTag: 'Education',initials: 'HB', avatarHue: 180 },
  { id: 'w10', name: 'Oprah Winfrey',      handle: '@oprah',            type: 'person', modeTag: 'Personal', initials: 'OW', avatarHue: 330 },
  { id: 'w11', name: 'Apple',              handle: '@apple',            type: 'brand',  modeTag: 'Business', initials: 'AP', avatarHue: 190 },
  { id: 'w12', name: 'Kevin Durant',       handle: '@easymoneysniper',  type: 'person', modeTag: 'Athletics',   initials: 'KD', avatarHue: 120 },
  { id: 'w13', name: 'TED',                handle: '@ted',              type: 'brand',  modeTag: 'Education',initials: 'TD', avatarHue: 350 },
  { id: 'w14', name: 'Michelle Obama',     handle: '@michelleobama',    type: 'person', modeTag: 'Community',initials: 'MO', avatarHue: 280 },
  { id: 'w15', name: 'ESPN',               handle: '@espn',             type: 'brand',  modeTag: 'Athletics',   initials: 'ES', avatarHue: 10  },
  { id: 'w16', name: 'Ryan Reynolds',      handle: '@vancityreynolds',  type: 'person', modeTag: 'Personal', initials: 'RR', avatarHue: 160 },
  { id: 'w17', name: 'Peloton',            handle: '@peloton',          type: 'brand',  modeTag: 'Athletics',   initials: 'PL', avatarHue: 110 },
  { id: 'w18', name: 'Tim Cook',           handle: '@tim_cook',         type: 'person', modeTag: 'Business', initials: 'TC', avatarHue: 40  },
  { id: 'w19', name: 'Khan Academy',       handle: '@khanacademy',      type: 'brand',  modeTag: 'Education',initials: 'KA', avatarHue: 80  },
  { id: 'w20', name: 'Simone Biles',       handle: '@simonebiles',      type: 'person', modeTag: 'Athletics',   initials: 'SB', avatarHue: 55  },
  { id: 'w21', name: 'Red Bull',           handle: '@redbull',          type: 'brand',  modeTag: 'Athletics',   initials: 'RB', avatarHue: 0   },
  { id: 'w22', name: 'Naval Ravikant',     handle: '@naval',            type: 'person', modeTag: 'Business', initials: 'NR', avatarHue: 210 },
  { id: 'w23', name: 'HBCU Buzz',          handle: '@hbcubuzz',         type: 'brand',  modeTag: 'Education',initials: 'HB', avatarHue: 290 },
  { id: 'w24', name: 'Kobe Bryant Est.',   handle: '@kobebryant',       type: 'person', modeTag: 'Athletics',   initials: 'KB', avatarHue: 230 },
  { id: 'w25', name: 'Gates Foundation',   handle: '@gatesfoundation',  type: 'brand',  modeTag: 'Community',initials: 'GF', avatarHue: 170 },
  { id: 'w26', name: 'Dwyane Wade',        handle: '@dwyanewade',       type: 'person', modeTag: 'Athletics',   initials: 'DW', avatarHue: 360 },
  { id: 'w27', name: 'Duolingo',           handle: '@duolingo',         type: 'brand',  modeTag: 'Education',initials: 'DL', avatarHue: 130 },
  { id: 'w28', name: 'Jay-Z',              handle: '@sc',               type: 'person', modeTag: 'Business', initials: 'JZ', avatarHue: 270 },
  { id: 'w29', name: 'World Central Kitchen', handle: '@wck',           type: 'brand',  modeTag: 'Community',initials: 'WC', avatarHue: 60  },
  { id: 'w30', name: 'Naomi Osaka',        handle: '@naomiosaka',       type: 'person', modeTag: 'Athletics',   initials: 'NO', avatarHue: 300 },
  { id: 'w31', name: 'Anthropic',          handle: '@anthropic',        type: 'brand',  modeTag: 'Business', initials: 'AN', avatarHue: 245 },
  { id: 'w32', name: 'Marcus Rashford',    handle: '@MarcusRashford',   type: 'person', modeTag: 'Athletics',   initials: 'MR', avatarHue: 100 },
];

// ── Subscribers (17 entries) ───────────────────────────────────────────────────

export const MOCK_SUBSCRIBERS: Subscriber[] = [
  // VIP tier ($25/mo)
  { id: 's1',  name: 'Aaliyah Brooks',  handle: '@aaliyahb',       initials: 'AB', avatarHue: 340, tierId: 'vip',       tierName: 'VIP',       tierPrice: 25, memberSince: '2024-02-03', lifetimeValue: 325,  churnRisk: 'low'    },
  { id: 's2',  name: 'Naomi Osei',      handle: '@naomiosei',      initials: 'NO', avatarHue: 200, tierId: 'vip',       tierName: 'VIP',       tierPrice: 25, memberSince: '2024-05-02', lifetimeValue: 275,  churnRisk: 'low'    },
  { id: 's3',  name: 'Leila Farouk',    handle: '@leilaf',         initials: 'LF', avatarHue: 355, tierId: 'vip',       tierName: 'VIP',       tierPrice: 25, memberSince: '2024-08-19', lifetimeValue: 175,  churnRisk: 'medium' },
  { id: 's4',  name: 'Blessing Okafor', handle: '@blessingokafor', initials: 'BO', avatarHue: 165, tierId: 'vip',       tierName: 'VIP',       tierPrice: 25, memberSince: '2024-12-04', lifetimeValue: 75,   churnRisk: 'low'    },
  { id: 's5',  name: 'Eli Goldstein',   handle: '@eligoldstein',   initials: 'EG', avatarHue: 230, tierId: 'vip',       tierName: 'VIP',       tierPrice: 25, memberSince: '2025-03-15', lifetimeValue: 25,   churnRisk: 'high'   },
  // Supporter tier ($10/mo)
  { id: 's6',  name: 'Jordan Miles',    handle: '@jordanmiles',    initials: 'JM', avatarHue: 210, tierId: 'supporter', tierName: 'Supporter', tierPrice: 10, memberSince: '2024-01-12', lifetimeValue: 270,  churnRisk: 'low'    },
  { id: 's7',  name: 'Simone Baptiste', handle: '@simoneb',        initials: 'SB', avatarHue: 160, tierId: 'supporter', tierName: 'Supporter', tierPrice: 10, memberSince: '2024-04-08', lifetimeValue: 120,  churnRisk: 'low'    },
  { id: 's8',  name: 'Zara Mensah',     handle: '@zaramsn',        initials: 'ZM', avatarHue: 15,  tierId: 'supporter', tierName: 'Supporter', tierPrice: 10, memberSince: '2024-05-28', lifetimeValue: 100,  churnRisk: 'low'    },
  { id: 's9',  name: 'Omar Hassan',     handle: '@omarhassan',     initials: 'OH', avatarHue: 60,  tierId: 'supporter', tierName: 'Supporter', tierPrice: 10, memberSince: '2024-07-25', lifetimeValue: 80,   churnRisk: 'medium' },
  { id: 's10', name: 'Ingrid Larson',   handle: '@ingridl',        initials: 'IL', avatarHue: 200, tierId: 'supporter', tierName: 'Supporter', tierPrice: 10, memberSince: '2024-11-10', lifetimeValue: 40,   churnRisk: 'low'    },
  { id: 's11', name: 'Chris Evans',     handle: '@chrisevans',     initials: 'CE', avatarHue: 180, tierId: 'supporter', tierName: 'Supporter', tierPrice: 10, memberSince: '2024-09-20', lifetimeValue: 60,   churnRisk: 'medium' },
  { id: 's12', name: 'Rania Khalil',    handle: '@raniakhalil',    initials: 'RK', avatarHue: 35,  tierId: 'supporter', tierName: 'Supporter', tierPrice: 10, memberSince: '2025-01-13', lifetimeValue: 20,   churnRisk: 'high'   },
  { id: 's13', name: 'Layla Ahmed',     handle: '@laylaahmed',     initials: 'LA', avatarHue: 255, tierId: 'supporter', tierName: 'Supporter', tierPrice: 10, memberSince: '2025-03-02', lifetimeValue: 10,   churnRisk: 'medium' },
  { id: 's14', name: 'Grace Abara',     handle: '@graceabara',     initials: 'GA', avatarHue: 195, tierId: 'supporter', tierName: 'Supporter', tierPrice: 10, memberSince: '2025-03-19', lifetimeValue: 10,   churnRisk: 'low'    },
  // Free tier
  { id: 's15', name: 'Priya Nair',      handle: '@priyanair',      initials: 'PN', avatarHue: 260, tierId: 'free',      tierName: 'Free',      tierPrice: 0,  memberSince: '2024-03-05', lifetimeValue: 0,    churnRisk: 'low'    },
  { id: 's16', name: 'Jasmine Liu',     handle: '@jasmineliu',     initials: 'JL', avatarHue: 310, tierId: 'free',      tierName: 'Free',      tierPrice: 0,  memberSince: '2024-07-01', lifetimeValue: 0,    churnRisk: 'low'    },
  { id: 's17', name: 'Tobias Mwangi',   handle: '@tobiasmw',       initials: 'TM', avatarHue: 75,  tierId: 'free',      tierName: 'Free',      tierPrice: 0,  memberSince: '2025-02-08', lifetimeValue: 0,    churnRisk: 'low'    },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

const NOW = new Date('2026-03-24');

/** Returns "Jan 12, 2024" style */
export function formatFollowDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** "X days ago" / "X weeks ago" / "X months ago" */
export function timeAgo(iso: string): string {
  const ms = NOW.getTime() - new Date(iso).getTime();
  const days = Math.floor(ms / 86400000);
  if (days === 0) return 'Today';
  if (days < 7)  return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

/** "New This Week" = followed in last 7 days */
export function isNewThisWeek(iso: string): boolean {
  const ms = NOW.getTime() - new Date(iso).getTime();
  return ms < 7 * 86400000;
}

/** Search filter for followers */
export function searchFollowers(q: string): Follower[] {
  const lower = q.toLowerCase();
  return MOCK_FOLLOWERS.filter(f =>
    f.name.toLowerCase().includes(lower) ||
    f.handle.toLowerCase().includes(lower),
  );
}

/** Search filter for following */
export function searchFollowing(q: string): FollowingEntry[] {
  const lower = q.toLowerCase();
  return MOCK_FOLLOWING.filter(f =>
    f.name.toLowerCase().includes(lower) ||
    f.handle.toLowerCase().includes(lower),
  );
}
