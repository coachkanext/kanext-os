/**
 * Mock data for KayStudios — 3-page layout (Play, Library, Compete).
 * Gaming and interactive learning platform across sports, education, faith, business.
 */

// ── Helpers ──

const img = (id: string, w = 600, h = 400) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&q=80`;

// =============================================================================
// 1. TYPES
// =============================================================================

export type GameCategory = 'sports' | 'education' | 'faith' | 'business' | 'course';

export interface ActiveGame {
  id: string;
  title: string;
  imageUri: string;
  category: GameCategory;
  progress: string;
  lastPlayed: string;
}

export interface QuickPlayOption {
  id: string;
  icon: string;
  label: string;
  subtitle: string;
}

export interface CatalogGame {
  id: string;
  title: string;
  imageUri: string;
  category: GameCategory;
  rating: number;
  price: string;
  installed: boolean;
  description: string;
  featured?: boolean;
}

export interface GamerProfile {
  name: string;
  initials: string;
  level: number;
  xp: number;
  xpNext: number;
  achievements: number;
  wins: number;
  losses: number;
  streak: number;
  streakType: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  initials: string;
  score: string;
  isYou?: boolean;
}

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  dateEarned?: string;
  game: string;
  rarity: number;
  earned: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  game: string;
  type: 'daily' | 'weekly' | 'friend' | 'community';
  progress: number;
  target: number;
  reward: string;
  deadline: string;
}

export interface GamingFriend {
  id: string;
  name: string;
  initials: string;
  favoriteGame: string;
  lastPlayed: string;
  online: boolean;
}

export type LibraryFilterKey = 'all' | 'sports' | 'education' | 'faith' | 'business' | 'new' | 'free';
export type CompeteFilterKey = 'leaderboards' | 'achievements' | 'challenges' | 'friends';

// =============================================================================
// 2. DATA
// =============================================================================

export const ACTIVE_GAMES: ActiveGame[] = [
  {
    id: 'ag-1', title: 'Basketball Manager', imageUri: img('photo-1546519638-68e109498ffc'),
    category: 'sports', progress: 'Season 3 · Career Mode', lastPlayed: '2 hours ago',
  },
  {
    id: 'ag-2', title: 'Bible Trivia', imageUri: img('photo-1504052434569-70ad5836ab65'),
    category: 'faith', progress: 'Level 24 · Scholar Mode', lastPlayed: 'Today',
  },
  {
    id: 'ag-3', title: 'Campus Builder', imageUri: img('photo-1562774053-701939374585'),
    category: 'education', progress: 'Year 8 · 12K Students', lastPlayed: 'Yesterday',
  },
  {
    id: 'ag-4', title: 'Startup Tycoon', imageUri: img('photo-1553877522-43269d4ea984'),
    category: 'business', progress: 'Series B · $4.2M ARR', lastPlayed: '3 days ago',
  },
];

export const QUICK_PLAY_OPTIONS: QuickPlayOption[] = [
  { id: 'qp-1', icon: 'bolt.fill', label: 'Quick Match', subtitle: 'Sim one game' },
  { id: 'qp-2', icon: 'star.fill', label: 'Daily Challenge', subtitle: 'Win prizes' },
  { id: 'qp-3', icon: 'person.2.fill', label: 'Play with Friends', subtitle: 'Multiplayer' },
];

export const RECENTLY_PLAYED: ActiveGame[] = [
  {
    id: 'rp-1', title: 'Basketball Manager', imageUri: img('photo-1546519638-68e109498ffc'),
    category: 'sports', progress: 'Season 3 · 42-18 Record', lastPlayed: '2 hours ago',
  },
  {
    id: 'rp-2', title: 'Bible Trivia', imageUri: img('photo-1504052434569-70ad5836ab65'),
    category: 'faith', progress: 'Level 24 · 1,840 pts', lastPlayed: 'Today',
  },
  {
    id: 'rp-3', title: 'Discipleship Journey', imageUri: img('photo-1529070538774-1f31dbe70428'),
    category: 'faith', progress: '42-day streak', lastPlayed: 'Today',
  },
  {
    id: 'rp-4', title: 'Campus Builder', imageUri: img('photo-1562774053-701939374585'),
    category: 'education', progress: 'Year 8 · A-Rated', lastPlayed: 'Yesterday',
  },
  {
    id: 'rp-5', title: 'Learning Games', imageUri: img('photo-1503676260728-1c00da094a0b'),
    category: 'education', progress: 'Math Level 15', lastPlayed: '2 days ago',
  },
  {
    id: 'rp-6', title: 'Startup Tycoon', imageUri: img('photo-1553877522-43269d4ea984'),
    category: 'business', progress: 'Series B · $4.2M ARR', lastPlayed: '3 days ago',
  },
  {
    id: 'rp-7', title: 'Investment Challenge', imageUri: img('photo-1611974789855-9c2a0a7236a3'),
    category: 'business', progress: '+18.4% YTD', lastPlayed: '5 days ago',
  },
];

export const CATALOG_GAMES: CatalogGame[] = [
  // Sports
  {
    id: 'cat-1', title: 'Basketball Manager', imageUri: img('photo-1546519638-68e109498ffc'),
    category: 'sports', rating: 4.8, price: '$9.99/mo', installed: true,
    description: 'Full career mode from high school to the pros. Powered by real KR intelligence.',
    featured: true,
  },
  {
    id: 'cat-2', title: 'Football Manager', imageUri: img('photo-1566577739112-5180d4bf9390'),
    category: 'sports', rating: 0, price: '$9.99/mo', installed: false,
    description: 'Build your football dynasty. Same intelligence engine, new sport. Coming soon.',
  },
  {
    id: 'cat-3', title: 'Soccer Manager', imageUri: img('photo-1574629810360-7efbbe195018'),
    category: 'sports', rating: 0, price: '$9.99/mo', installed: false,
    description: 'Compete across global leagues. Tactics, transfers, and trophies.',
  },
  // Education
  {
    id: 'cat-4', title: 'Campus Builder', imageUri: img('photo-1562774053-701939374585'),
    category: 'education', rating: 4.6, price: 'Included', installed: true,
    description: 'Build and manage a university from scratch. Enrollment, faculty, athletics, budget.',
  },
  {
    id: 'cat-5', title: 'Learning Games', imageUri: img('photo-1503676260728-1c00da094a0b'),
    category: 'education', rating: 4.7, price: '$4.99/mo family', installed: true,
    description: 'Math, science, reading, history. Progressive difficulty with rewards and streaks.',
  },
  {
    id: 'cat-6', title: 'Study Tools', imageUri: img('photo-1456513080510-7bf3a84b82f8'),
    category: 'education', rating: 4.4, price: 'Included', installed: false,
    description: 'Gamified SAT, ACT, and AP test prep. Vocabulary builders and formula practice.',
  },
  // Faith
  {
    id: 'cat-7', title: 'Bible Adventure', imageUri: img('photo-1504052434569-70ad5836ab65'),
    category: 'faith', rating: 4.9, price: 'Included', installed: true,
    description: 'Interactive story-based games through Old and New Testament narratives.',
  },
  {
    id: 'cat-8', title: 'Bible Trivia', imageUri: img('photo-1507842217343-583bb7270b66'),
    category: 'faith', rating: 4.7, price: 'Included', installed: true,
    description: 'Quiz games across OT, NT, church history, theology. Solo and multiplayer modes.',
  },
  {
    id: 'cat-9', title: 'Ministry Builder', imageUri: img('photo-1438232992991-995b7058bbb3'),
    category: 'faith', rating: 4.5, price: 'Included', installed: false,
    description: 'Grow a church from a small group to a thriving community. Leadership sim.',
  },
  {
    id: 'cat-10', title: "Children's Church Interactive", imageUri: img('photo-1544776193-352d25ca82cd'),
    category: 'faith', rating: 4.8, price: '$4.99/mo family', installed: false,
    description: 'Games and activities for children\'s ministry. Lesson-based with real video content.',
  },
  {
    id: 'cat-11', title: 'Discipleship Journey', imageUri: img('photo-1529070538774-1f31dbe70428'),
    category: 'faith', rating: 4.6, price: 'Included', installed: true,
    description: 'Gamified discipleship pathway. Daily Scripture, prayer journaling, growth tracking.',
  },
  // Business
  {
    id: 'cat-12', title: 'Startup Tycoon', imageUri: img('photo-1553877522-43269d4ea984'),
    category: 'business', rating: 4.5, price: '$4.99/mo', installed: true,
    description: 'Build a company from zero. Product, hiring, fundraising, marketing decisions.',
  },
  {
    id: 'cat-13', title: 'Investment Challenge', imageUri: img('photo-1611974789855-9c2a0a7236a3'),
    category: 'business', rating: 4.3, price: 'Included', installed: true,
    description: 'Pick startups or stocks with a portfolio budget. Learn investment principles.',
  },
  // Courses
  {
    id: 'cat-14', title: 'Sports Business & Management', imageUri: img('photo-1521737711867-e3b97375f902'),
    category: 'course', rating: 4.7, price: '$49.99', installed: false,
    description: 'Video lessons, interactive exercises, quizzes. Certification on completion.',
  },
  {
    id: 'cat-15', title: 'Entrepreneurship 101', imageUri: img('photo-1559136555-9303baea8ebd'),
    category: 'course', rating: 4.6, price: '$29.99', installed: false,
    description: 'From idea to launch. Real-world frameworks for building a startup.',
  },
];

export const FEATURED_GAME = CATALOG_GAMES.find((g) => g.featured) ?? CATALOG_GAMES[0];

export const GAMER_PROFILE: GamerProfile = {
  name: 'Sammy W.',
  initials: 'SW',
  level: 28,
  xp: 14_200,
  xpNext: 16_000,
  achievements: 47,
  wins: 186,
  losses: 94,
  streak: 12,
  streakType: 'Daily Login',
};

export const LEADERBOARD_ENTRIES: LeaderboardEntry[] = [
  { rank: 1, name: 'CoachMike42', initials: 'CM', score: '94.2% Win Rate' },
  { rank: 2, name: 'HoopsDynasty', initials: 'HD', score: '91.8% Win Rate' },
  { rank: 3, name: 'TripleDoubleKing', initials: 'TK', score: '89.5% Win Rate' },
  { rank: 4, name: 'FastBreakGM', initials: 'FG', score: '87.1% Win Rate' },
  { rank: 5, name: 'Sammy W.', initials: 'SW', score: '85.4% Win Rate', isYou: true },
  { rank: 6, name: 'ChampionCoach', initials: 'CC', score: '84.9% Win Rate' },
  { rank: 7, name: 'BenchMobGM', initials: 'BM', score: '82.3% Win Rate' },
  { rank: 8, name: 'RecruitPro', initials: 'RP', score: '80.7% Win Rate' },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'ach-1', icon: 'trophy.fill', title: 'First Championship', description: 'Win your first league championship', dateEarned: 'Mar 2, 2026', game: 'Basketball Manager', rarity: 24, earned: true },
  { id: 'ach-2', icon: 'star.fill', title: 'Perfect Season', description: 'Go undefeated in a full season', dateEarned: 'Feb 18, 2026', game: 'Basketball Manager', rarity: 8, earned: true },
  { id: 'ach-3', icon: 'flame.fill', title: '30-Day Streak', description: 'Log in and play 30 consecutive days', dateEarned: 'Feb 10, 2026', game: 'All Games', rarity: 15, earned: true },
  { id: 'ach-4', icon: 'book.fill', title: 'Scripture Scholar', description: 'Score 100% on all Old Testament quizzes', dateEarned: 'Jan 28, 2026', game: 'Bible Trivia', rarity: 12, earned: true },
  { id: 'ach-5', icon: 'building.2.fill', title: 'Campus Legend', description: 'Reach 20,000 enrolled students', game: 'Campus Builder', rarity: 6, earned: false },
  { id: 'ach-6', icon: 'dollarsign.circle.fill', title: 'Unicorn Status', description: 'Reach $1B valuation', game: 'Startup Tycoon', rarity: 3, earned: false },
  { id: 'ach-7', icon: 'person.3.fill', title: 'Dynasty Builder', description: 'Win 5 championships in a row', game: 'Basketball Manager', rarity: 2, earned: false },
  { id: 'ach-8', icon: 'heart.fill', title: 'Faithful Servant', description: 'Complete 365-day devotional streak', game: 'Discipleship Journey', rarity: 5, earned: false },
];

export const CHALLENGES: Challenge[] = [
  { id: 'ch-1', title: 'Win 3 Games Today', description: 'Win 3 games in any mode', game: 'Basketball Manager', type: 'daily', progress: 1, target: 3, reward: '500 XP', deadline: 'Today' },
  { id: 'ch-2', title: 'Trivia Master', description: 'Score 90%+ on 5 quizzes', game: 'Bible Trivia', type: 'weekly', progress: 3, target: 5, reward: '2,000 XP + Badge', deadline: '4 days' },
  { id: 'ch-3', title: 'Beat Marcus', description: 'Score higher than Marcus in Bible Trivia', game: 'Bible Trivia', type: 'friend', progress: 0, target: 1, reward: 'Bragging Rights', deadline: '2 days' },
  { id: 'ch-4', title: 'Church Challenge', description: 'Most scripture memorized this month', game: 'Discipleship Journey', type: 'community', progress: 12, target: 30, reward: 'Community Trophy', deadline: '21 days' },
  { id: 'ch-5', title: 'Recruit 5-Star Prospect', description: 'Successfully recruit a 5-star player', game: 'Basketball Manager', type: 'daily', progress: 0, target: 1, reward: '300 XP', deadline: 'Today' },
];

export const GAMING_FRIENDS: GamingFriend[] = [
  { id: 'gf-1', name: 'Marcus Johnson', initials: 'MJ', favoriteGame: 'Basketball Manager', lastPlayed: 'Now', online: true },
  { id: 'gf-2', name: 'Aisha Williams', initials: 'AW', favoriteGame: 'Bible Trivia', lastPlayed: '1 hour ago', online: true },
  { id: 'gf-3', name: 'Devon Carter', initials: 'DC', favoriteGame: 'Startup Tycoon', lastPlayed: '3 hours ago', online: false },
  { id: 'gf-4', name: 'Tanya Robinson', initials: 'TR', favoriteGame: 'Campus Builder', lastPlayed: 'Yesterday', online: false },
  { id: 'gf-5', name: 'Chris Lee', initials: 'CL', favoriteGame: 'Basketball Manager', lastPlayed: '2 days ago', online: false },
];

export const LIBRARY_FILTERS: readonly { key: LibraryFilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'sports', label: 'Sports' },
  { key: 'education', label: 'Education' },
  { key: 'faith', label: 'Faith' },
  { key: 'business', label: 'Business' },
  { key: 'new', label: 'New' },
  { key: 'free', label: 'Free' },
] as const;

export const COMPETE_FILTERS: readonly { key: CompeteFilterKey; label: string }[] = [
  { key: 'leaderboards', label: 'Leaderboards' },
  { key: 'achievements', label: 'Achievements' },
  { key: 'challenges', label: 'Challenges' },
  { key: 'friends', label: 'Friends' },
] as const;

// =============================================================================
// 3. GETTERS
// =============================================================================

export function getActiveGames(): ActiveGame[] {
  return ACTIVE_GAMES;
}

export function getQuickPlayOptions(): QuickPlayOption[] {
  return QUICK_PLAY_OPTIONS;
}

export function getRecentlyPlayed(): ActiveGame[] {
  return RECENTLY_PLAYED;
}

export function getCatalogGames(filter: LibraryFilterKey = 'all'): CatalogGame[] {
  if (filter === 'all') return CATALOG_GAMES;
  if (filter === 'new') return CATALOG_GAMES.filter((g) => g.rating === 0);
  if (filter === 'free') return CATALOG_GAMES.filter((g) => g.price === 'Included');
  return CATALOG_GAMES.filter((g) => g.category === filter);
}

export function getFeaturedGame(): CatalogGame {
  return FEATURED_GAME;
}

export function getGamerProfile(): GamerProfile {
  return GAMER_PROFILE;
}

export function getLeaderboard(): LeaderboardEntry[] {
  return LEADERBOARD_ENTRIES;
}

export function getAchievements(showEarned?: boolean): Achievement[] {
  if (showEarned === undefined) return ACHIEVEMENTS;
  return ACHIEVEMENTS.filter((a) => a.earned === showEarned);
}

export function getChallenges(type?: Challenge['type']): Challenge[] {
  if (!type) return CHALLENGES;
  return CHALLENGES.filter((c) => c.type === type);
}

export function getGamingFriends(): GamingFriend[] {
  return GAMING_FRIENDS;
}

// =============================================================================
// 4. CATEGORY COLORS
// =============================================================================

export const CATEGORY_COLORS: Record<GameCategory, string> = {
  sports: '#1A1714',
  education: '#5A8A6E',
  faith: '#A855F7',
  business: '#B8943E',
  course: '#06B6D4',
};

export const CATEGORY_LABELS: Record<GameCategory, string> = {
  sports: 'Sports',
  education: 'Education',
  faith: 'Faith',
  business: 'Business',
  course: 'Course',
};
