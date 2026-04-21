/**
 * Mock data — Personal Mode KPlay.
 * Games, Courses, Quizzes, Collections, Reviews.
 */

export type KPType    = 'Game' | 'Simulation' | 'Challenge' | 'Course' | 'Quiz' | 'Flashcards';
export type KPAccess  = 'Free' | 'Paid' | 'Subscribers Only';

export interface KPGame {
  id: string;
  type: 'Game' | 'Simulation' | 'Challenge';
  title: string;
  subtitle: string;
  plays: number;
  rating: number;
  ratingCount: number;
  price: number;
  access: KPAccess;
  coverBg: string;
  coverText: string;
  description: string;
  features: string[];
}

export interface KPLesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'read' | 'quiz';
}

export interface KPModule {
  id: string;
  title: string;
  lessons: KPLesson[];
}

export interface KPCourse {
  id: string;
  title: string;
  subtitle: string;
  enrolled: number;
  rating: number;
  ratingCount: number;
  price: number;
  access: KPAccess;
  coverBg: string;
  coverText: string;
  description: string;
  modules: KPModule[];
}

export interface KPQuiz {
  id: string;
  title: string;
  subtitle: string;
  questionCount: number;
  plays: number;
  avgScore: number;
  access: KPAccess;
  coverBg: string;
  coverText: string;
  description: string;
  questions: { q: string; choices: string[]; correct: number }[];
}

export interface KPCollection {
  id: string;
  title: string;
  itemSummary: string;
  coverColors: [string, string, string, string];
}

export interface KPReview {
  id: string;
  contentId: string;
  author: string;
  initials: string;
  rating: number;
  text: string;
  date: string;
}

// ── Games ─────────────────────────────────────────────────────────────────────

export const KPGAMES: KPGame[] = [
  {
    id: 'g1', type: 'Game', title: 'College Basketball GM', subtitle: 'Build a dynasty from scratch',
    plays: 2400, rating: 4.8, ratingCount: 312, price: 9.99, access: 'Paid',
    coverBg: '#132639', coverText: '#F0E8DC',
    description: 'Take over a struggling program and build it into a national contender. Recruit players, design plays, manage budgets, and make every game-day decision.',
    features: ['Dynasty mode (10 seasons)', 'Real recruiting system', 'Play design studio', 'Budget & staff management', 'Tournament bracket mode'],
  },
  {
    id: 'g2', type: 'Simulation', title: 'Brand Deal Simulator', subtitle: 'Negotiate like a pro creator',
    plays: 1200, rating: 4.6, ratingCount: 189, price: 0, access: 'Free',
    coverBg: '#1A1714', coverText: '#E8C97A',
    description: 'Practice negotiating brand deals in realistic scenarios. Face different brand personalities, understand usage rights, and build your rate card strategy.',
    features: ['12 brand scenarios', 'Rate card builder', 'Usage rights trainer', 'Counter-offer practice', 'Deal breakdown analysis'],
  },
  {
    id: 'g3', type: 'Challenge', title: 'Content Calendar Challenge', subtitle: '30 days of consistent posting',
    plays: 890, rating: 4.7, ratingCount: 134, price: 0, access: 'Subscribers Only',
    coverBg: '#1C2E24', coverText: '#A8D4BE',
    description: 'A 30-day challenge to build your content creation habit. Daily prompts, streak tracking, and community accountability. Subscribers only.',
    features: ['30 daily prompts', 'Streak tracking', 'Content bank builder', 'Weekly check-ins', 'Completion badge'],
  },
];

// ── Courses ───────────────────────────────────────────────────────────────────

export const KPCOURSES: KPCourse[] = [
  {
    id: 'c1', title: 'Creator Masterclass: Zero to 10K', subtitle: '8 modules · 4.2 hours',
    enrolled: 312, rating: 4.9, ratingCount: 189, price: 149, access: 'Paid',
    coverBg: '#0D0B09', coverText: '#E08B6A',
    description: '8-week curriculum covering audience building, monetization, brand deals, and scaling your creator business from zero to your first 10,000 followers.',
    modules: [
      { id: 'm1', title: 'Foundations', lessons: [
        { id: 'l1', title: 'The Creator OS Mindset', duration: '12:34', type: 'video' },
        { id: 'l2', title: 'Niche Selection Framework', duration: '18:22', type: 'video' },
        { id: 'l3', title: 'Foundations Quiz', duration: '10 q', type: 'quiz' },
      ]},
      { id: 'm2', title: 'Content Strategy', lessons: [
        { id: 'l4', title: '90-Day Content Calendar', duration: '22:15', type: 'video' },
        { id: 'l5', title: 'Repurposing Framework', duration: '14:40', type: 'video' },
        { id: 'l6', title: 'Content Strategy Workbook', duration: '15 min', type: 'read' },
      ]},
      { id: 'm3', title: 'Audience Growth', lessons: [
        { id: 'l7', title: 'Algorithm Playbook', duration: '19:08', type: 'video' },
        { id: 'l8', title: 'Collab Strategy', duration: '11:55', type: 'video' },
      ]},
      { id: 'm4', title: 'Monetization', lessons: [
        { id: 'l9', title: 'Revenue Streams Overview', duration: '16:30', type: 'video' },
        { id: 'l10', title: 'Brand Deal System', duration: '24:12', type: 'video' },
        { id: 'l11', title: 'Monetization Quiz', duration: '15 q', type: 'quiz' },
      ]},
    ],
  },
  {
    id: 'c2', title: 'Brand Deal Negotiation', subtitle: '5 modules · 2.1 hours',
    enrolled: 189, rating: 4.8, ratingCount: 134, price: 0, access: 'Subscribers Only',
    coverBg: '#261D17', coverText: '#D4C4B0',
    description: 'The complete guide to negotiating brand deals without an agent. Covers rate cards, usage rights, deliverables, and the key clauses to always push back on.',
    modules: [
      { id: 'm5', title: 'Rate Card Basics', lessons: [
        { id: 'l12', title: 'How to Price Your Audience', duration: '15:22', type: 'video' },
        { id: 'l13', title: 'Rate Card Template', duration: '10 min', type: 'read' },
      ]},
      { id: 'm6', title: 'The Negotiation', lessons: [
        { id: 'l14', title: 'Counter-Offer Scripts', duration: '18:45', type: 'video' },
        { id: 'l15', title: 'Usage Rights Explained', duration: '12:30', type: 'video' },
        { id: 'l16', title: 'Negotiation Quiz', duration: '10 q', type: 'quiz' },
      ]},
    ],
  },
  {
    id: 'c3', title: 'Content Strategy Deep Dive', subtitle: '4 modules · 1.8 hours',
    enrolled: 540, rating: 4.7, ratingCount: 302, price: 0, access: 'Free',
    coverBg: '#1E2A20', coverText: '#A8C4A8',
    description: 'The exact content framework I use to plan, create, and distribute content across every platform. Includes the 90-day calendar template.',
    modules: [
      { id: 'm7', title: 'Planning', lessons: [
        { id: 'l17', title: 'The Content Audit', duration: '10:15', type: 'video' },
        { id: 'l18', title: 'Pillar Content System', duration: '14:22', type: 'video' },
      ]},
      { id: 'm8', title: 'Creation', lessons: [
        { id: 'l19', title: 'Batching Workflow', duration: '12:44', type: 'video' },
        { id: 'l20', title: 'Strategy Quiz', duration: '8 q', type: 'quiz' },
      ]},
    ],
  },
];

// ── Quizzes ───────────────────────────────────────────────────────────────────

export const KPQUIZZES: KPQuiz[] = [
  {
    id: 'q1', title: 'Content Strategy IQ Test', subtitle: 'Test your content knowledge',
    questionCount: 20, plays: 890, avgScore: 72, access: 'Free',
    coverBg: '#1C3828', coverText: '#A8D4BE',
    description: '20 questions to test your content strategy knowledge. See how you score against other creators.',
    questions: [
      { q: 'What is the ideal posting frequency for building an audience on short-form video?', choices: ['1x per week', '1x per day', '3–5x per week', '2x per month'], correct: 2 },
      { q: 'What does "pillar content" mean?', choices: ['Long-form content you repurpose', 'Content only for top platforms', 'Paid promotional posts', 'Content posted weekly'], correct: 0 },
      { q: 'Which metric matters most in the first 6 months?', choices: ['Follower count', 'Engagement rate', 'Revenue', 'View count'], correct: 1 },
      { q: 'What is the "90-day rule" in content strategy?', choices: ['Post for 90 days before quitting', 'Batch 90 days of content', 'Evaluate after 90 days', 'All of the above'], correct: 3 },
      { q: 'What is the best way to repurpose a long-form video?', choices: ['Delete the original', 'Create shorts/clips', 'Post it twice', 'Add captions only'], correct: 1 },
    ],
  },
  {
    id: 'q2', title: 'Creator Business Quiz', subtitle: 'Revenue & brand deal knowledge',
    questionCount: 15, plays: 1200, avgScore: 68, access: 'Free',
    coverBg: '#2C1818', coverText: '#E8B8B8',
    description: 'How well do you know the business side of being a creator? Test your knowledge on revenue, brand deals, and pricing.',
    questions: [
      { q: 'What is CPM in influencer marketing?', choices: ['Cost Per Message', 'Cost Per Mille (thousand)', 'Content Per Month', 'Creator Pay Metric'], correct: 1 },
      { q: 'What is "usage rights" in a brand deal?', choices: ['Right to post again', 'Permission to use your content in ads', 'Ownership of the brand', 'None of the above'], correct: 1 },
      { q: 'What is a "flat fee" deal?', choices: ['Free product only', 'One-time payment regardless of performance', 'Pay per click', 'Monthly retainer'], correct: 1 },
      { q: 'When should you NOT accept a brand deal?', choices: ['When the pay is low', 'When it conflicts with your brand', 'When the deadline is tight', 'All of the above'], correct: 3 },
      { q: 'What is the best leverage for negotiating higher rates?', choices: ['Follower count', 'Engagement rate + previous brand results', 'Being verified', 'Having an agent'], correct: 1 },
    ],
  },
  {
    id: 'q3', title: 'Basketball IQ Test', subtitle: 'Scheme knowledge for coaches & players',
    questionCount: 25, plays: 3400, avgScore: 65, access: 'Free',
    coverBg: '#142236', coverText: '#9BB8D4',
    description: '25 questions from Coach Sammy on basketball schemes, player development, and game management.',
    questions: [
      { q: 'What is a "pick and roll" offense designed to create?', choices: ['Three-point shots', 'Mismatches and layups', 'Turnover opportunities', 'Post-up scenarios'], correct: 1 },
      { q: 'What does "system fit" mean in recruiting?', choices: ['Academic fit', 'Player style matching team scheme', 'Uniform size', 'Budget fit'], correct: 1 },
      { q: 'In a 2-3 zone, where is the weak spot?', choices: ['High post', 'Corner three', 'Short corners/wings', 'Both B and C'], correct: 3 },
      { q: 'What is the "pace factor" in basketball?', choices: ['Minutes per player', 'Possessions per 40 minutes', 'Speed of play-calling', 'Fast break %'], correct: 1 },
      { q: 'What is the most important stat for a point guard?', choices: ['Points', 'Assists', 'Assist-to-turnover ratio', 'Plus/minus'], correct: 2 },
    ],
  },
  {
    id: 'q4', title: 'Social Media Trends', subtitle: 'Stay ahead of the algorithm',
    questionCount: 10, plays: 2100, avgScore: 79, access: 'Subscribers Only',
    coverBg: '#1E1530', coverText: '#C4B0E0',
    description: 'Test your knowledge on current social media trends, algorithms, and platform-specific best practices.',
    questions: [
      { q: 'Which format currently has the highest organic reach on most platforms?', choices: ['Static images', 'Short-form video', 'Text posts', 'Carousels'], correct: 1 },
      { q: 'What is "social proof" in marketing?', choices: ['Platform verification', 'Reviews and follower counts showing trustworthiness', 'Ad placements', 'Sponsored posts'], correct: 1 },
      { q: 'What does "hook rate" measure?', choices: ['Click-through rate', '% watching past 3 seconds', 'Comment velocity', 'Share rate'], correct: 1 },
      { q: 'What is the best time to post for most creators?', choices: ['Midnight', 'When your audience is most active', 'Exactly at 9am', 'It does not matter'], correct: 1 },
      { q: 'What is "dead followers" and why does it matter?', choices: ['Inactive accounts hurting engagement rate', 'Bots only', 'Ex-fans', 'Old posts'], correct: 0 },
    ],
  },
];

// ── Collections ───────────────────────────────────────────────────────────────

export const KPCOLLECTIONS: KPCollection[] = [
  { id: 'col1', title: 'Beginner Creator Bundle',    itemSummary: '2 courses · 1 quiz',         coverColors: ['#0D0B09', '#1E2A20', '#1C3828', '#2C1818'] },
  { id: 'col2', title: 'Advanced Monetization Pack', itemSummary: '1 course · 2 games · 1 quiz', coverColors: ['#261D17', '#132639', '#1A1714', '#2C1818'] },
  { id: 'col3', title: 'Sports Intelligence Suite',  itemSummary: '1 game · 2 quizzes',          coverColors: ['#132639', '#1C3828', '#142236', '#1E1530'] },
];

// ── Feed (multi-creator discovery) ───────────────────────────────────────────

export type FeedCreator = {
  name: string;
  handle: string;
  initials: string;
  isMe: boolean;
};

export type FeedItem = {
  id: string;
  type: KPType;
  title: string;
  subtitle: string;
  creator: FeedCreator;
  coverBg: string;
  coverText: string;
  plays: number;
  rating: number;
  ratingCount: number;
  price: number;
  access: KPAccess;
  featured?: boolean;
};

const ME: FeedCreator       = { name: 'Laolu Kalejaiye', handle: '@sammyk', initials: 'LK', isMe: true };
const MAYA: FeedCreator     = { name: 'Maya Thompson',   handle: '@mayat',   initials: 'MT', isMe: false };
const COACH: FeedCreator    = { name: 'Coach D. Williams', handle: '@coachdw', initials: 'DW', isMe: false };
const PRIYA: FeedCreator    = { name: 'Priya Shah',      handle: '@priyas',  initials: 'PS', isMe: false };

export const FEED_ITEMS: FeedItem[] = [
  { id: 'f1', type: 'Game',       title: 'College Basketball GM',           subtitle: 'Build a dynasty from scratch',           creator: ME,    coverBg: '#132639', coverText: '#F0E8DC', plays: 2400, rating: 4.8, ratingCount: 312, price: 9.99,  access: 'Paid',             featured: true  },
  { id: 'f2', type: 'Course',     title: 'Creator Masterclass: Zero to 10K', subtitle: '8 modules · 4.2 hours',                creator: ME,    coverBg: '#0D0B09', coverText: '#E08B6A', plays: 312,  rating: 4.9, ratingCount: 189, price: 149,   access: 'Paid',             featured: true  },
  { id: 'f3', type: 'Quiz',       title: 'Basketball IQ Test',              subtitle: 'Scheme knowledge for coaches',           creator: ME,    coverBg: '#142236', coverText: '#9BB8D4', plays: 3400, rating: 4.7, ratingCount: 289, price: 0,     access: 'Free',             featured: true  },
  { id: 'f4', type: 'Course',     title: 'NIL for Athletes: The Full Playbook', subtitle: '6 modules · 3 hours',              creator: MAYA,  coverBg: '#2C1E3A', coverText: '#C4B0E0', plays: 890,  rating: 4.8, ratingCount: 201, price: 79,    access: 'Paid'                              },
  { id: 'f5', type: 'Simulation', title: 'Athlete Finance Sim',             subtitle: 'Contract and investment decisions',      creator: COACH, coverBg: '#1C2E24', coverText: '#A8D4BE', plays: 1580, rating: 4.6, ratingCount: 143, price: 0,     access: 'Free'                              },
  { id: 'f6', type: 'Quiz',       title: 'Social Media Trends',             subtitle: 'Stay ahead of the algorithm',            creator: ME,    coverBg: '#1E1530', coverText: '#C4B0E0', plays: 2100, rating: 4.9, ratingCount: 312, price: 0,     access: 'Subscribers Only'                  },
  { id: 'f7', type: 'Game',       title: 'Startup Pitch Wars',              subtitle: 'Compete to win funding',                 creator: PRIYA, coverBg: '#2A1A0E', coverText: '#E8C97A', plays: 4200, rating: 4.7, ratingCount: 567, price: 14.99, access: 'Paid'                              },
  { id: 'f8', type: 'Challenge',  title: 'Content Calendar Challenge',      subtitle: '30 days of consistent posting',          creator: ME,    coverBg: '#1C2E24', coverText: '#A8D4BE', plays: 890,  rating: 4.7, ratingCount: 134, price: 0,     access: 'Subscribers Only'                  },
  { id: 'f9', type: 'Course',     title: 'Brand Deals for Athletes',        subtitle: '5 modules · 2.5 hours',                  creator: MAYA,  coverBg: '#1A1714', coverText: '#E8C97A', plays: 445,  rating: 4.5, ratingCount: 78,  price: 0,     access: 'Free'                              },
  { id: 'f10', type: 'Quiz',      title: 'Creator Business Quiz',           subtitle: 'Revenue & brand deal knowledge',         creator: ME,    coverBg: '#2C1818', coverText: '#E8B8B8', plays: 1200, rating: 4.8, ratingCount: 167, price: 0,     access: 'Free'                              },
];

// ── Library ────────────────────────────────────────────────────────────────────

export type LibraryItem = {
  id: string;
  title: string;
  type: KPType;
  coverBg: string;
  coverText: string;
  progress?: number;       // 0–1 for in-progress
  completedDate?: string;  // for completed
  score?: number;          // for quizzes
};

export const LIBRARY_IN_PROGRESS: LibraryItem[] = [
  { id: 'lp1', title: 'Creator Masterclass',          type: 'Course',     coverBg: '#0D0B09', coverText: '#E08B6A', progress: 0.45 },
  { id: 'lp2', title: 'NIL for Athletes',             type: 'Course',     coverBg: '#2C1E3A', coverText: '#C4B0E0', progress: 0.20 },
  { id: 'lp3', title: 'Brand Deals for Athletes',     type: 'Course',     coverBg: '#1A1714', coverText: '#E8C97A', progress: 0.75 },
];

export const LIBRARY_COMPLETED: LibraryItem[] = [
  { id: 'lc1', title: 'Basketball IQ Test',       type: 'Quiz',       coverBg: '#142236', coverText: '#9BB8D4', completedDate: 'Apr 10', score: 88  },
  { id: 'lc2', title: 'Creator Business Quiz',    type: 'Quiz',       coverBg: '#2C1818', coverText: '#E8B8B8', completedDate: 'Apr 8',  score: 72  },
  { id: 'lc3', title: 'Athlete Finance Sim',      type: 'Simulation', coverBg: '#1C2E24', coverText: '#A8D4BE', completedDate: 'Mar 28'            },
  { id: 'lc4', title: 'Content Strategy Deep Dive', type: 'Course',   coverBg: '#1E2A20', coverText: '#A8C4A8', completedDate: 'Mar 15'            },
];

export const LIBRARY_SAVED: LibraryItem[] = [
  { id: 'ls1', title: 'Startup Pitch Wars',        type: 'Game',   coverBg: '#2A1A0E', coverText: '#E8C97A' },
  { id: 'ls2', title: 'Brand Deal Simulator',      type: 'Simulation', coverBg: '#1A1714', coverText: '#E8C97A' },
  { id: 'ls3', title: 'Social Media Trends',       type: 'Quiz',   coverBg: '#1E1530', coverText: '#C4B0E0' },
];

// ── Reviews ───────────────────────────────────────────────────────────────────

export const KPREVIEWS: KPReview[] = [
  { id: 'r1', contentId: 'c1', author: 'Marcus J.',  initials: 'MJ', rating: 5, text: 'Week 3 alone paid for the whole course. The brand deal module is completely different from anything else out there.', date: 'Apr 8' },
  { id: 'r2', contentId: 'c1', author: 'Aisha M.',   initials: 'AM', rating: 5, text: 'The community makes this — Sammy is super active answering questions daily. Zero fluff.', date: 'Apr 5' },
  { id: 'r3', contentId: 'c1', author: 'Tyler B.',   initials: 'TB', rating: 4, text: 'Dense in places but every module has something actionable. Engagement up 40% after week 2.', date: 'Mar 28' },
  { id: 'r4', contentId: 'g1', author: 'Jordan W.',  initials: 'JW', rating: 5, text: 'Best basketball sim I have played. The recruiting logic is actually realistic — not just random stats.', date: 'Apr 7' },
  { id: 'r5', contentId: 'g2', author: 'Sofia R.',   initials: 'SR', rating: 5, text: 'Used this before a real brand deal call and negotiated 40% above my original ask. Worth every minute.', date: 'Apr 3' },
  { id: 'r6', contentId: 'q1', author: 'Chris L.',   initials: 'CL', rating: 4, text: 'Humbling. Thought I knew more about content strategy than I did. Great reality check.', date: 'Apr 1' },
];
