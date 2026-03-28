/**
 * KayStudios — Interactive Experiences Hub mock data.
 * Games, courses, quizzes, simulations, flashcards.
 * Experiences with real questions/slides/cards are fully playable.
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type ExperienceType =
  | 'trivia'
  | 'quiz'
  | 'course'
  | 'flashcards'
  | 'simulation'
  | 'game'
  | 'training'
  | 'devotional';

export interface TriviaQuestion {
  q: string;
  opts: string[];
  a: number;    // correct index
  e?: string;   // explanation
}

export interface CourseSlide {
  title: string;
  emoji: string;
  body: string;
  points?: string[];
}

export interface FlashCard {
  front: string;
  back: string;
}

export interface Scenario {
  situation: string;
  options: string[];
  best: number;      // correct option index
  outcome: string;   // explanation of best answer
}

export interface Review {
  author: string;
  initials: string;
  rating: number;
  text: string;
  timeAgo: string;
}

export interface StudioContent {
  id: string;
  title: string;
  description: string;
  type: ExperienceType;
  category: string;        // matches pill filter value
  mode: string;
  brand: string;
  brandHandle: string;
  thumbHue: number;
  thumbEmoji: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;        // '10 min', '45 min'
  participants: string;    // '1.2k played'
  rating: number;          // 4.5
  isFeed?: boolean;        // appears in Home feed
  // Experience data
  questions?: TriviaQuestion[];
  slides?: CourseSlide[];
  cards?: FlashCard[];
  scenarios?: Scenario[];
}

// ── Constants ──────────────────────────────────────────────────────────────

// Cross-mode — same pills everywhere regardless of active mode
export const STUDIOS_PILLS = ['All', 'Courses', 'Games', 'Quizzes', 'Trivia', 'Challenges', 'Simulations'];

export const EXPLORE_ROW_LABELS = ['Trending', 'New This Week', 'Popular Courses', 'Quick Games', 'Brain Teasers', 'Faith & Spirituality', 'Sports & Athletics', 'Business & Career'];

export function getLaunchLabel(type: ExperienceType): string {
  switch (type) {
    case 'trivia': case 'game': return 'Play';
    case 'quiz': return 'Begin';
    case 'devotional': return 'Read';
    case 'flashcards': return 'Study';
    default: return 'Start';
  }
}

// ── SPORTS CONTENT ─────────────────────────────────────────────────────────

const SPORTS_TRIVIA: StudioContent = {
  id: 'ks-sp-trivia-1',
  title: 'Sports Trivia Challenge',
  description: 'Test your sports knowledge across basketball, football, HBCU history, and more. 10 questions, 15 seconds each.',
  type: 'trivia', category: 'Trivia', mode: 'sports',
  brand: 'Lincoln Athletics', brandHandle: '@lincolnathletics',
  thumbHue: 8, thumbEmoji: '🏆',
  difficulty: 'Intermediate', duration: '5 min', participants: '3.4k played', rating: 4.8,
  isFeed: true,
  questions: [
    { q: "Which HBCU is nicknamed 'The Mecca'?", opts: ["Howard University", "Spelman College", "Morehouse College", "Lincoln University"], a: 0, e: "Howard University in Washington D.C. is known as 'The Mecca' of Black culture and education." },
    { q: "How many players are on a basketball court per team?", opts: ["4", "5", "6", "7"], a: 1, e: "Each basketball team fields exactly 5 players on the court at a time." },
    { q: "Who holds the NBA record for career points?", opts: ["Michael Jordan", "LeBron James", "Kobe Bryant", "Kareem Abdul-Jabbar"], a: 1, e: "LeBron James surpassed Kareem Abdul-Jabbar's all-time record in February 2023." },
    { q: "What year were the first modern Olympic Games held?", opts: ["1892", "1896", "1900", "1904"], a: 1, e: "The first modern Olympic Games were held in Athens, Greece in 1896." },
    { q: "In American football, how many points is a touchdown worth?", opts: ["3", "5", "6", "7"], a: 2, e: "A touchdown is worth 6 points, with the option to attempt an extra point conversion." },
    { q: "What country invented basketball?", opts: ["USA", "Canada", "UK", "Brazil"], a: 1, e: "Basketball was invented by Canadian Dr. James Naismith in 1891 in Springfield, MA." },
    { q: "How many innings are in a standard baseball game?", opts: ["7", "8", "9", "10"], a: 2, e: "A standard baseball game consists of 9 innings." },
    { q: "What is the highest possible score in a single game of bowling?", opts: ["200", "250", "280", "300"], a: 3, e: "A perfect game in bowling is 300 — 12 consecutive strikes." },
    { q: "The term 'hat trick' (scoring 3 times) is used in which sports?", opts: ["Basketball only", "Soccer and hockey", "Baseball only", "All team sports"], a: 1, e: "A hat trick — three goals by one player — is used in soccer and ice hockey." },
    { q: "Lincoln University was founded in which year?", opts: ["1837", "1854", "1867", "1882"], a: 1, e: "Lincoln University was founded in 1854 in Oxford, Pennsylvania — first HBCU to grant degrees." },
  ],
};

const HBCU_QUIZ: StudioContent = {
  id: 'ks-sp-quiz-1',
  title: 'HBCU Legacy Quiz',
  description: 'How well do you know the history, culture, and impact of Historically Black Colleges and Universities?',
  type: 'quiz', category: 'Trivia', mode: 'sports',
  brand: 'HBCU Sports Network', brandHandle: '@hbcusports',
  thumbHue: 15, thumbEmoji: '🎓',
  difficulty: 'Beginner', duration: '6 min', participants: '2.1k played', rating: 4.9,
  isFeed: true,
  questions: [
    { q: "Which is the oldest HBCU in the United States?", opts: ["Howard University", "Spelman College", "Cheyney University", "Fisk University"], a: 2, e: "Cheyney University, founded in 1837 in Pennsylvania, is the oldest HBCU in the US." },
    { q: "Approximately how many HBCUs exist in the US?", opts: ["50", "75", "101", "150"], a: 2, e: "There are approximately 101 accredited HBCUs in the United States." },
    { q: "Martin Luther King Jr. graduated from which HBCU?", opts: ["Howard University", "Lincoln University", "Morehouse College", "Fisk University"], a: 2, e: "Dr. King earned his B.A. from Morehouse College in Atlanta, graduating in 1948." },
    { q: "Which HBCU did Vice President Kamala Harris attend?", opts: ["Spelman College", "Howard University", "Hampton University", "Clark Atlanta"], a: 1, e: "Kamala Harris attended Howard University, earning her B.A. in Political Science in 1986." },
    { q: "Spelman College is known as a premier...", opts: ["HBCU law school", "HBCU for men", "HBCU women's college", "HBCU technology school"], a: 2, e: "Spelman College in Atlanta is one of the top HBCU women's liberal arts colleges in the nation." },
    { q: "The 'Human Jukebox' refers to which HBCU's marching band?", opts: ["Howard University", "Southern University", "Grambling State", "Florida A&M"], a: 1, e: "Southern University's marching band in Baton Rouge, LA is nicknamed 'The Human Jukebox.'" },
    { q: "Which HBCU has produced the most Rhodes Scholars?", opts: ["Howard University", "Spelman College", "Morehouse College", "Fisk University"], a: 1, e: "Spelman College has produced more Rhodes Scholars than any other HBCU." },
    { q: "Which famous jazz musician attended Fisk University?", opts: ["Miles Davis", "John Coltrane", "Louis Armstrong", "W.E.B. Du Bois"], a: 3, e: "W.E.B. Du Bois — sociologist and civil rights pioneer — attended Fisk University before Harvard." },
  ],
};

const FANTASY_COURSE: StudioContent = {
  id: 'ks-sp-course-1',
  title: 'Fantasy Manager Basics',
  description: 'Learn the fundamentals of fantasy football — drafting, scoring, waiver wire strategy, and in-season management.',
  type: 'course', category: 'Courses', mode: 'sports',
  brand: 'EliteHoops Academy', brandHandle: '@elitehoops',
  thumbHue: 25, thumbEmoji: '🏈',
  difficulty: 'Beginner', duration: '15 min', participants: '1.8k started', rating: 4.7,
  isFeed: true,
  slides: [
    { title: "What is Fantasy Football?", emoji: "🏈", body: "Fantasy football lets you manage a virtual team of real NFL players. Your team earns points based on their real-game statistics each week." },
    { title: "The Draft", emoji: "📋", body: "Your team is built through the draft. In a snake draft (most common), the order reverses each round. Your draft position matters — do your research beforehand.", points: ["Research rankings before draft day", "Balance your roster across positions", "Avoid reaching for players too early", "Target value picks in later rounds"] },
    { title: "Understanding Scoring", emoji: "📊", body: "Standard scoring: 1 pt per 10 rushing/receiving yards, 6 pts per TD. PPR (Points Per Reception) formats add 1 pt per catch, boosting slot receivers and RBs.", points: ["6 pts: Passing TD", "4 pts: QB passing TD (standard)", "1 pt: Per 10 rushing/receiving yards", "+1 pt: Per reception (PPR leagues)"] },
    { title: "The Waiver Wire", emoji: "🔄", body: "The waiver wire is where championships are won. Free agents — players not on any roster — can be claimed weekly. Monitor for breakout players, injuries that create opportunities, and favorable matchups." },
    { title: "In-Season Management", emoji: "⚡", body: "Active managers win. Check matchups weekly, set lineups before kickoff, manage bye weeks early, and never hesitate to trade from strength. The weekly edge compounds all season.", points: ["Set lineups every week — no auto-pilot", "Sell high on hot players", "Stream DST and kickers by matchup", "Trade early before deadlines"] },
  ],
};

const SCORE_PREDICTOR: StudioContent = {
  id: 'ks-sp-game-1',
  title: 'Score Predictor',
  description: 'Predict the outcomes of today\'s biggest matchups. Earn points for accuracy. Coming soon.',
  type: 'game', category: 'Games', mode: 'sports',
  brand: 'Lincoln Athletics', brandHandle: '@lincolnathletics',
  thumbHue: 355, thumbEmoji: '🔮',
  difficulty: 'Beginner', duration: '3 min', participants: '890 played', rating: 4.2,
};

const TRAINING_COURSE: StudioContent = {
  id: 'ks-sp-training-1',
  title: 'Strength & Conditioning Fundamentals',
  description: 'Science-backed training principles used by elite athletes. Build your foundation — strength, speed, recovery.',
  type: 'training', category: 'Courses', mode: 'sports',
  brand: 'The Training Ground', brandHandle: '@trainingground',
  thumbHue: 30, thumbEmoji: '💪',
  difficulty: 'Intermediate', duration: '20 min', participants: '1.1k started', rating: 4.6,
  slides: [
    { title: "The Foundation of Athletic Performance", emoji: "💪", body: "Elite performance is built on four pillars: strength, speed, mobility, and recovery. Neglect any one of them and your ceiling lowers." },
    { title: "Progressive Overload", emoji: "📈", body: "The single most important principle in training: gradually increase the demands on your body to force adaptation. Add weight, reps, or difficulty each week.", points: ["Add 5 lbs/week on major lifts", "Or add 1-2 reps before increasing weight", "Track everything — what gets measured improves", "Deload every 4-6 weeks to recover"] },
    { title: "The Big Three Lifts", emoji: "🏋️", body: "Squat, bench press, and deadlift build the most functional strength. Master these three movements with perfect form before adding variety.", points: ["Squat: builds leg power and stability", "Bench: upper body pressing strength", "Deadlift: posterior chain and total strength"] },
    { title: "Speed & Explosiveness", emoji: "⚡", body: "Speed is trained, not born. Plyometrics (box jumps, broad jumps), sprint intervals, and Olympic lifts develop the fast-twitch muscle fibers that make athletes explosive.", points: ["Box jumps: 3 sets of 5", "Sprint intervals: 10x40 yards", "Power cleans: 3x5 at 60% max"] },
    { title: "Recovery: The Hidden Variable", emoji: "😴", body: "Adaptation happens during recovery, not during training. Elite athletes treat sleep (8-9 hrs), nutrition timing, and active recovery as training sessions themselves.", points: ["8-9 hours sleep is non-negotiable", "Protein within 30 min post-workout", "Cold therapy reduces inflammation", "One full rest day minimum per week"] },
  ],
};

// ── BUSINESS CONTENT ───────────────────────────────────────────────────────

const ENTREPRENEUR_TRIVIA: StudioContent = {
  id: 'ks-biz-trivia-1',
  title: 'Entrepreneur Trivia',
  description: 'Test your business acumen. From startup terminology to founder stories — 10 questions that separate founders from dreamers.',
  type: 'trivia', category: 'Trivia', mode: 'business',
  brand: 'KaNeXT Business', brandHandle: '@kanextbiz',
  thumbHue: 210, thumbEmoji: '💼',
  difficulty: 'Intermediate', duration: '5 min', participants: '2.7k played', rating: 4.7,
  isFeed: true,
  questions: [
    { q: "What does 'IPO' stand for?", opts: ["Internal Price Offering", "Initial Public Offering", "Investment Portfolio Option", "Incremental Profit Operation"], a: 1, e: "IPO (Initial Public Offering) is when a company first sells shares to the public on a stock exchange." },
    { q: "A startup valued at $1 billion or more is called a...", opts: ["Dragon", "Phoenix", "Unicorn", "Griffin"], a: 2, e: "A 'unicorn' startup is one valued at $1 billion or more — coined by VC Aileen Lee in 2013." },
    { q: "Who founded Amazon?", opts: ["Elon Musk", "Steve Jobs", "Jeff Bezos", "Larry Ellison"], a: 2, e: "Jeff Bezos founded Amazon in his Bellevue, WA garage in 1994 as an online bookstore." },
    { q: "What is 'bootstrapping' a business?", opts: ["Crowdfunding from the public", "Funding it with only personal resources", "Seed funding from angels", "Taking a bank loan"], a: 1, e: "Bootstrapping means growing a business using only personal funds and revenue — no outside investors." },
    { q: "What does 'ROI' stand for?", opts: ["Return on Inventory", "Rate of Interest", "Return on Investment", "Revenue Over Income"], a: 2, e: "ROI (Return on Investment) measures the profit earned relative to investment cost. ROI = (Gain - Cost) / Cost." },
    { q: "A startup 'pivot' means...", opts: ["Shutting the company down", "Changing the strategy or direction", "Raising a new funding round", "Hiring a new CEO"], a: 1, e: "A pivot is when a startup fundamentally changes its business model, target market, or core product." },
    { q: "The '80/20 rule' in business is called...", opts: ["The Efficiency Principle", "The Pareto Principle", "The Newton Law", "The Leverage Rule"], a: 1, e: "The Pareto Principle: 80% of results come from 20% of causes — named after economist Vilfredo Pareto." },
    { q: "What does 'B2B' stand for?", opts: ["Business to Brand", "Back to Basics", "Business to Business", "Brand to Buyer"], a: 2, e: "B2B (Business to Business) describes companies that sell to other companies, not individual consumers." },
    { q: "What is 'sweat equity'?", opts: ["Money invested in a gym startup", "Ownership earned through work rather than cash", "Profit from physical labor services", "Investment in health companies"], a: 1, e: "Sweat equity is a non-cash contribution of time and effort that earns an ownership stake in a company." },
    { q: "Which company's original motto was 'Don't be evil'?", opts: ["Apple", "Meta", "Amazon", "Google"], a: 3, e: "Google's unofficial original motto was 'Don't be evil,' later updated to 'Do the right thing' in 2015." },
  ],
};

const BIZ_SIM: StudioContent = {
  id: 'ks-biz-sim-1',
  title: 'Business Strategy Simulation',
  description: 'Five real startup scenarios. Every decision has consequences. How does your business instinct hold up under pressure?',
  type: 'simulation', category: 'Simulations', mode: 'business',
  brand: 'The Strategy Lab', brandHandle: '@stratlab',
  thumbHue: 215, thumbEmoji: '♟️',
  difficulty: 'Advanced', duration: '12 min', participants: '1.4k played', rating: 4.8,
  isFeed: true,
  scenarios: [
    {
      situation: "Your SaaS startup has 100 paying customers but is losing $10k/month. Growth is flat. You have 4 months of runway. What's your immediate priority?",
      options: ["Raise more VC funding immediately", "Cut non-essential costs to extend runway", "Double marketing spend to drive growth", "Pivot to an adjacent market"],
      best: 1,
      outcome: "Cutting costs first is correct. Extending your runway without diluting equity buys you time to find product-market fit or improve metrics before a fundraise. Raising desperate money is expensive."
    },
    {
      situation: "A well-funded competitor announces a product that directly competes with yours at a 30% lower price. You have 6 months of runway. What do you do?",
      options: ["Match their pricing immediately", "Double down on a niche they can't profitably serve", "Seek an acquisition offer from them", "Launch a completely new product line"],
      best: 1,
      outcome: "Niching down is the best move. Large competitors can't profitably serve small, specific customer segments. Becoming the best solution for a niche gives you defensibility and higher margins."
    },
    {
      situation: "Your startup is growing 20% month-over-month. A VC offers $2M at a $10M valuation. Should you accept?",
      options: ["Accept immediately — take what you can get", "Negotiate for a higher valuation or better terms", "Decline and continue bootstrapping", "Accept but ask for convertible note instead"],
      best: 1,
      outcome: "With 20% MoM growth, you have significant leverage. Push for a higher valuation — you're likely underpriced. Investors expect negotiation from strong founders. If they won't budge, you'll find others who will."
    },
    {
      situation: "Your best engineer wants a 40% raise or will leave for a competitor. You can't afford it in cash. What do you offer?",
      options: ["Decline and begin recruiting their replacement", "Offer meaningful equity + a modest salary increase", "Match their salary using credit card debt", "Counter-offer to buy time while recruiting"],
      best: 1,
      outcome: "Equity + a meaningful raise is the right answer. It aligns their long-term incentives with the company's success, preserves cash flow, and signals that you value them as a long-term partner."
    },
    {
      situation: "Your viral coefficient is 0.3 — each user brings in 0.3 new users. Growth is paid-only. What's the highest-leverage move?",
      options: ["Build a referral program with real incentives", "Increase paid acquisition budget by 3x", "Lower price to increase sign-ups", "Focus on retention before acquisition"],
      best: 0,
      outcome: "A referral program that pushes your viral coefficient above 1 creates compounding, free growth. That's the highest-leverage move. Increasing paid spend with low virality just burns money faster."
    },
  ],
};

const FIN_COURSE: StudioContent = {
  id: 'ks-biz-course-1',
  title: 'Financial Literacy 101',
  description: 'The money fundamentals every entrepreneur needs: budgeting, debt, investing, and building long-term wealth.',
  type: 'course', category: 'Courses', mode: 'business',
  brand: 'Founders Academy', brandHandle: '@foundersacademy',
  thumbHue: 220, thumbEmoji: '💰',
  difficulty: 'Beginner', duration: '18 min', participants: '4.2k started', rating: 4.9,
  isFeed: true,
  slides: [
    { title: "Why Financial Literacy Matters", emoji: "💰", body: "Most businesses fail because of cash flow problems, not bad products. Financial literacy isn't just for accountants — it's the operating system of every successful founder.", points: ["82% of business failures are due to poor cash flow", "Understanding your numbers = understanding your business", "Financial literacy compounds like interest over time"] },
    { title: "The 50/30/20 Rule", emoji: "📊", body: "Divide your after-tax income into three buckets: 50% for needs (rent, food, utilities), 30% for wants (lifestyle, entertainment), and 20% for savings and debt repayment. This ratio works at $30k or $300k.", points: ["50% — Needs: housing, food, transport, insurance", "30% — Wants: dining, entertainment, hobbies", "20% — Savings: emergency fund, investments, debt"] },
    { title: "The Emergency Fund", emoji: "🛡️", body: "Before investing, build a 3-6 month emergency fund in a high-yield savings account. This is your financial immune system. Without it, any unexpected expense derails your plan.", points: ["3 months: stable income, low risk", "6 months: variable income or single earner", "Keep in high-yield savings (4-5% APY)", "Never invest this money in equities"] },
    { title: "Good Debt vs. Bad Debt", emoji: "⚖️", body: "Not all debt is equal. Good debt has a low interest rate and builds an asset or income (mortgage, student loan for a high-paying career). Bad debt is high-interest and finances consumption (credit cards at 20-29%).", points: ["Good: mortgage, business loan, student loan (low-rate)", "Bad: credit cards at 20%+, payday loans, car loans", "Rule of thumb: if the ROI exceeds the interest rate, it's good debt"] },
    { title: "Compound Interest", emoji: "📈", body: "Einstein reportedly called compound interest 'the eighth wonder of the world.' $1,000 invested at 7% annual return becomes $7,612 in 30 years — without adding another dollar. Time is the variable no one can buy back." },
    { title: "Building Generational Wealth", emoji: "🏗️", body: "Wealth is built through four levers: income growth, consistent saving, smart investing, and tax efficiency. No single lever is enough — it's the compound effect of all four over time.", points: ["Maximize income through skills and negotiation", "Automate savings before you can spend it", "Invest diversified: index funds + real estate", "Minimize taxes through 401k, Roth IRA, HSA"] },
  ],
};

const MARKETING_QUIZ: StudioContent = {
  id: 'ks-biz-quiz-1',
  title: 'Marketing Fundamentals Quiz',
  description: 'From brand positioning to customer acquisition — how solid is your marketing foundation?',
  type: 'quiz', category: 'Quizzes', mode: 'business',
  brand: 'Capital IQ', brandHandle: '@capitaliq',
  thumbHue: 225, thumbEmoji: '📣',
  difficulty: 'Intermediate', duration: '7 min', participants: '1.9k played', rating: 4.5,
  questions: [
    { q: "What does 'CAC' stand for in marketing?", opts: ["Customer Acquisition Cost", "Campaign Advertising Cost", "Conversion Action Count", "Channel Attribution Credit"], a: 0, e: "CAC (Customer Acquisition Cost) = total sales & marketing spend ÷ number of new customers acquired." },
    { q: "What is 'LTV' in marketing?", opts: ["Live Time Value", "Lifetime Value", "Lead Time Variable", "Long-Term Vision"], a: 1, e: "LTV (Lifetime Value) is the total revenue expected from a customer over their entire relationship with your business." },
    { q: "A healthy LTV:CAC ratio is typically...", opts: ["1:1", "2:1", "3:1 or higher", "5:1 or higher"], a: 2, e: "A 3:1 LTV:CAC ratio is considered healthy — you earn 3x what it costs to acquire each customer." },
    { q: "What is a 'conversion rate'?", opts: ["Revenue per visitor", "Percentage of visitors who take a desired action", "Social media engagement rate", "Email open rate"], a: 1, e: "Conversion rate = (conversions ÷ total visitors) × 100. The desired action could be a purchase, sign-up, or click." },
    { q: "The 'Top of Funnel' (TOFU) refers to...", opts: ["Your best-selling products", "Awareness-stage content reaching new audiences", "Revenue-generating campaigns", "Retargeting existing customers"], a: 1, e: "TOFU is the awareness stage — reaching new potential customers who don't yet know your brand." },
    { q: "What is 'brand positioning'?", opts: ["Where you place ads", "How your brand is perceived relative to competitors", "Your physical store location strategy", "Your pricing tier"], a: 1, e: "Brand positioning is how your brand occupies a distinct place in the minds of your target customers versus competitors." },
    { q: "Net Promoter Score (NPS) measures...", opts: ["Website traffic quality", "Customer loyalty and likelihood to recommend", "Product quality ratings", "Employee satisfaction"], a: 1, e: "NPS measures customer loyalty by asking: 'How likely are you to recommend us?' Score = % promoters - % detractors." },
    { q: "What is A/B testing?", opts: ["Running two different ad campaigns simultaneously", "Comparing two versions of something to see which performs better", "Testing a product in two markets", "Comparing two competitors"], a: 1, e: "A/B testing shows two versions (A and B) to different audiences to determine which achieves better results." },
  ],
};

// ── EDUCATION CONTENT ──────────────────────────────────────────────────────

const HBCU_FLASHCARDS: StudioContent = {
  id: 'ks-edu-flash-1',
  title: 'HBCU History Flashcards',
  description: '10 essential facts about Historically Black Colleges and Universities. Perfect for students, applicants, and anyone building their HBCU knowledge.',
  type: 'flashcards', category: 'Quizzes', mode: 'education',
  brand: 'Scholar\'s Path', brandHandle: '@scholarspath',
  thumbHue: 120, thumbEmoji: '📇',
  difficulty: 'Beginner', duration: '8 min', participants: '3.1k studied', rating: 4.9,
  isFeed: true,
  cards: [
    { front: "First HBCU in the United States?", back: "Cheyney University (1837) in Pennsylvania." },
    { front: "Nickname for Howard University?", back: "'The Mecca' — center of Black intellectual and cultural life." },
    { front: "Which HBCU did MLK Jr. attend?", back: "Morehouse College in Atlanta, GA (B.A. 1948)." },
    { front: "Which HBCU did Kamala Harris attend?", back: "Howard University (B.A. Political Science, 1986)." },
    { front: "What does HBCU stand for?", back: "Historically Black Colleges and Universities." },
    { front: "Spelman College is known as...", back: "A premier HBCU women's liberal arts college in Atlanta." },
    { front: "Lincoln University (PA) was founded in...", back: "1854 — first degree-granting HBCU." },
    { front: "'The Human Jukebox' — which HBCU's band?", back: "Southern University's marching band in Baton Rouge, LA." },
    { front: "How many accredited HBCUs are in the US?", back: "Approximately 101." },
    { front: "HBCU that produced the most Black doctors?", back: "Howard University College of Medicine." },
  ],
};

const PYTHON_QUIZ: StudioContent = {
  id: 'ks-edu-quiz-1',
  title: 'Python Basics Quiz',
  description: 'Test your Python fundamentals — variables, functions, data types, and more. 8 questions for beginners.',
  type: 'quiz', category: 'Quizzes', mode: 'education',
  brand: 'The Learning Lab', brandHandle: '@learninglab',
  thumbHue: 128, thumbEmoji: '🐍',
  difficulty: 'Beginner', duration: '6 min', participants: '2.4k played', rating: 4.7,
  isFeed: true,
  questions: [
    { q: "Which function displays output in Python?", opts: ["display()", "print()", "output()", "show()"], a: 1, e: "print() is Python's built-in function to display output. Example: print('Hello, World!')" },
    { q: "Which keyword defines a function in Python?", opts: ["function", "def", "func", "define"], a: 1, e: "The 'def' keyword defines a function. Example: def my_function(): ..." },
    { q: "What does len([1, 2, 3]) return?", opts: ["2", "3", "4", "Error"], a: 1, e: "len() returns the number of items in a sequence. The list [1, 2, 3] has 3 elements." },
    { q: "How do you write a comment in Python?", opts: ["// comment", "/* comment */", "# comment", "-- comment"], a: 2, e: "Python uses the # symbol for single-line comments. Example: # This is a comment" },
    { q: "Which data type stores True or False?", opts: ["Integer", "String", "Boolean", "Float"], a: 2, e: "Boolean (bool) data type stores True or False values. Example: is_valid = True" },
    { q: "What does list.append() do?", opts: ["Removes the last item", "Adds an item to the end", "Sorts the list", "Reverses the list"], a: 1, e: "append() adds a new element to the end of a list. Example: my_list.append(5)" },
    { q: "Which is a valid Python variable name?", opts: ["2name", "my-name", "my_name", "my name"], a: 2, e: "Python variables use underscores (snake_case), cannot start with numbers, and cannot contain spaces or hyphens." },
    { q: "What does 'if __name__ == \"__main__\":' do?", opts: ["Imports a module", "Runs code only when executed directly", "Defines a class", "Checks the Python version"], a: 1, e: "This pattern ensures code only runs when the file is executed directly — not when imported as a module." },
  ],
};

const STUDY_SKILLS: StudioContent = {
  id: 'ks-edu-course-1',
  title: 'Study Skills Mastery',
  description: 'The science-backed study system used by top students. Active recall, spaced repetition, Pomodoro, and more.',
  type: 'course', category: 'Courses', mode: 'education',
  brand: 'Howard Online', brandHandle: '@howardonline',
  thumbHue: 135, thumbEmoji: '🧠',
  difficulty: 'Beginner', duration: '15 min', participants: '5.8k started', rating: 4.9,
  isFeed: true,
  slides: [
    { title: "How Memory Works", emoji: "🧠", body: "Your brain encodes memories in three stages: sensory memory (milliseconds), short-term/working memory (seconds to minutes), and long-term memory (indefinitely). Learning means moving information from short-term to long-term storage — which requires repetition and meaning.", points: ["Encoding: paying attention to information", "Storage: consolidating it (happens during sleep)", "Retrieval: finding and using stored memories"] },
    { title: "Active Recall: Study Smarter", emoji: "🎯", body: "Re-reading notes is passive — and largely ineffective. Active recall means testing yourself: close the book and try to retrieve what you just learned. Research shows it's 2-3x more effective at building long-term memory than passive review.", points: ["Use flashcards instead of re-reading", "After reading a section, close it and write what you remember", "Use practice tests whenever possible", "The struggle to remember IS the learning"] },
    { title: "Spaced Repetition", emoji: "📅", body: "The forgetting curve shows we lose ~50% of new information within 24 hours. Spaced repetition fights this by reviewing material at increasing intervals — before you fully forget it.", points: ["Day 1: Initial study", "Day 2: First review", "Day 5: Second review", "Day 14: Third review", "Day 30: Final review"] },
    { title: "The Pomodoro Technique", emoji: "⏱️", body: "Your brain can't maintain peak focus for hours. The Pomodoro Technique structures work in intervals: 25 minutes of focused work, then a 5-minute break. After 4 pomodoros, take a 20-30 minute break.", points: ["25 min: Deep focus — no distractions", "5 min: Rest, stretch, hydrate", "4 pomodoros: Take a 20-30 min break", "Track: Most people average 8-12 pomodoros/day"] },
    { title: "Your Study Environment", emoji: "🏠", body: "Environment shapes performance. The same space used for studying and relaxing creates context confusion. Dedicated study space, consistent conditions, and minimal distractions are the foundation.", points: ["Dedicated space: desk, library, coffee shop", "No phone or social media during pomodoros", "White noise or lo-fi music (no lyrics)", "Good lighting — natural light is ideal"] },
  ],
};

const CRITICAL_THINKING: StudioContent = {
  id: 'ks-edu-lab-1',
  title: 'Critical Thinking Lab',
  description: 'Five real-world scenarios that test your logical reasoning. Identify fallacies, evaluate evidence, and think clearly.',
  type: 'simulation', category: 'Challenges', mode: 'education',
  brand: 'Lincoln University', brandHandle: '@lincolnuniv',
  thumbHue: 110, thumbEmoji: '🔬',
  difficulty: 'Advanced', duration: '10 min', participants: '980 played', rating: 4.8,
  scenarios: [
    {
      situation: "A study reports: '95% of students who ate breakfast every morning earned A grades.' A classmate concludes: 'Breakfast causes good grades.' Is this valid reasoning?",
      options: ["Yes — 95% is a strong statistical correlation", "No — correlation does not imply causation", "Yes — if the sample size was large enough", "Maybe — needs more research to be certain"],
      best: 1,
      outcome: "Correlation ≠ causation. Students who consistently eat breakfast likely also have more stable home environments, better sleep, and higher parental involvement — confounding variables that drive grades."
    },
    {
      situation: "An AI generates an essay with 5 cited research papers. You can't find 3 of the papers anywhere. Should you submit the essay?",
      options: ["Yes — the writing quality is excellent", "No — verify all citations before submitting anything", "Yes — the AI wouldn't fabricate academic sources", "Maybe — if the arguments seem logical"],
      best: 1,
      outcome: "AI systems can 'hallucinate' — generate confident-sounding but entirely fabricated citations, statistics, and facts. Always independently verify every source before using AI-generated content academically."
    },
    {
      situation: "A friend argues: 'You either fully support this policy, or you're against progress.' What logical fallacy is this?",
      options: ["Appeal to authority", "False dilemma (black-and-white thinking)", "Ad hominem attack", "Straw man argument"],
      best: 1,
      outcome: "The false dilemma (or false dichotomy) presents only two extreme options when nuanced positions exist. Most real-world policy questions have multiple valid perspectives between extremes."
    },
    {
      situation: "A headline reads: 'New study: coffee drinkers live longer.' The actual study found an association but did not control for exercise habits. What's the right response?",
      options: ["Share it — this is important health news", "Read the full methodology before forming conclusions", "Dismiss it — nutrition headlines are always misleading", "Accept it since it was a published study"],
      best: 1,
      outcome: "Uncontrolled confounding variables (e.g., coffee drinkers may exercise more) can explain associations without establishing causation. Always evaluate study methodology — specifically what variables were and weren't controlled."
    },
    {
      situation: "In a debate, someone says: 'You can't trust what Dr. Smith says about climate — she drives an SUV.' This is an example of...",
      options: ["A valid scientific counter-argument", "Ad hominem — attacking the person instead of the argument", "A legitimate conflict of interest", "A straw man argument"],
      best: 1,
      outcome: "Ad hominem attacks the person making an argument rather than the argument itself. Dr. Smith's driving habits are irrelevant to the validity of her climate research. Evaluate evidence on its merits."
    },
  ],
};

const SCIENCE_TRIVIA: StudioContent = {
  id: 'ks-edu-trivia-1',
  title: 'Science Trivia',
  description: 'Biology, chemistry, physics, and Earth science. 10 questions that test your STEM knowledge.',
  type: 'trivia', category: 'Trivia', mode: 'education',
  brand: 'The Learning Lab', brandHandle: '@learninglab',
  thumbHue: 160, thumbEmoji: '⚗️',
  difficulty: 'Intermediate', duration: '5 min', participants: '2.2k played', rating: 4.6,
  questions: [
    { q: "What is the chemical formula for water?", opts: ["W", "H2O", "HO2", "O2H"], a: 1, e: "Water is H2O — two hydrogen atoms covalently bonded to one oxygen atom." },
    { q: "How many chromosomes do humans have?", opts: ["23", "44", "46", "48"], a: 2, e: "Humans have 46 chromosomes, arranged in 23 pairs (one from each parent)." },
    { q: "What is the 'powerhouse of the cell'?", opts: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"], a: 2, e: "The mitochondria produces ATP — the cell's energy currency — through cellular respiration." },
    { q: "What is the speed of light (approximately)?", opts: ["30,000 km/s", "300,000 km/s", "3,000,000 km/s", "3,000 km/s"], a: 1, e: "Light travels at approximately 299,792 km/s (~300,000 km/s) in a vacuum." },
    { q: "What gas do plants absorb during photosynthesis?", opts: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], a: 2, e: "Plants absorb CO₂ and release O₂ during photosynthesis — the reverse of respiration." },
    { q: "What is the most abundant gas in Earth's atmosphere?", opts: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"], a: 2, e: "Nitrogen (N₂) makes up about 78% of Earth's atmosphere. Oxygen is approximately 21%." },
    { q: "What does DNA stand for?", opts: ["Digital Nucleic Acid", "Deoxyribonucleic Acid", "Divided Nitrogen Array", "Dynamic Nucleotide Assembly"], a: 1, e: "DNA (Deoxyribonucleic Acid) carries the genetic instructions for the development of all known living organisms." },
    { q: "Newton's First Law states that objects in motion...", opts: ["Always slow down due to gravity", "Stay in motion unless acted on by an external force", "Accelerate proportional to applied force", "Have equal and opposite reactions"], a: 1, e: "Newton's First Law (Law of Inertia): an object in motion stays in motion at the same speed and direction unless acted upon by a net external force." },
    { q: "What is the periodic symbol for gold?", opts: ["Go", "Gl", "Au", "Gd"], a: 2, e: "Gold's symbol is Au, from the Latin word 'Aurum.'" },
    { q: "How many planets are in our solar system?", opts: ["7", "8", "9", "10"], a: 1, e: "There are 8 planets since Pluto was reclassified as a dwarf planet by the IAU in 2006." },
  ],
};

// ── COMMUNITY CONTENT ──────────────────────────────────────────────────────

const BIBLE_TRIVIA: StudioContent = {
  id: 'ks-com-trivia-1',
  title: 'Bible Trivia Challenge',
  description: 'Old Testament, New Testament, key verses, and scripture knowledge. 10 questions for believers of all levels.',
  type: 'trivia', category: 'Trivia', mode: 'community',
  brand: 'Faith First Ministry', brandHandle: '@faithfirst',
  thumbHue: 280, thumbEmoji: '✝️',
  difficulty: 'Intermediate', duration: '5 min', participants: '4.8k played', rating: 4.9,
  isFeed: true,
  questions: [
    { q: "How many books are in the Bible?", opts: ["52", "60", "66", "72"], a: 2, e: "The Protestant Bible contains 66 books — 39 in the Old Testament and 27 in the New Testament." },
    { q: "Who built the ark?", opts: ["Moses", "Noah", "Abraham", "David"], a: 1, e: "God commanded Noah to build the ark to survive the great flood (Genesis 6-9)." },
    { q: "What was Jesus' first miracle according to the Gospel of John?", opts: ["Feeding 5,000", "Healing the blind", "Walking on water", "Turning water into wine"], a: 3, e: "Jesus turned water into wine at a wedding in Cana — His first recorded miracle (John 2:1-11)." },
    { q: "How many disciples did Jesus have?", opts: ["10", "11", "12", "13"], a: 2, e: "Jesus had 12 disciples (also called apostles), including Peter, John, and Matthew." },
    { q: "What is the shortest verse in the Bible?", opts: ["Mark 5:8", "John 11:35", "Acts 2:1", "Luke 1:1"], a: 1, e: "John 11:35 — 'Jesus wept' — is the shortest verse in the Bible." },
    { q: "Who was thrown into the lion's den?", opts: ["Elijah", "Jonah", "Daniel", "Joseph"], a: 2, e: "Daniel was thrown into the lion's den but was protected by God (Daniel 6). He emerged unharmed." },
    { q: "In what city was Jesus born?", opts: ["Nazareth", "Jerusalem", "Bethlehem", "Hebron"], a: 2, e: "Jesus was born in Bethlehem of Judea, fulfilling the prophecy in Micah 5:2." },
    { q: "Who denied Jesus three times before the rooster crowed?", opts: ["Judas", "Thomas", "John", "Peter"], a: 3, e: "Peter denied knowing Jesus three times that night, just as Jesus had foretold (Luke 22:54-62)." },
    { q: "Philippians 4:13 says: 'I can do all things through...'", opts: ["...God who made me", "...Christ who strengthens me", "...faith that guides me", "...prayer that sustains me"], a: 1, e: "Philippians 4:13: 'I can do all things through Christ who strengthens me.' — Paul's declaration of strength through faith." },
    { q: "How many days and nights did Jesus fast in the wilderness?", opts: ["20", "30", "40", "50"], a: 2, e: "Jesus fasted for 40 days and 40 nights in the wilderness before His temptation by Satan (Matthew 4:1-2)." },
  ],
};

const SCRIPTURE_FLASH: StudioContent = {
  id: 'ks-com-flash-1',
  title: 'Scripture Flashcards',
  description: 'Key Bible verses every believer should know. Study, memorize, and carry the Word with you.',
  type: 'flashcards', category: 'Quizzes', mode: 'community',
  brand: 'The Kingdom App', brandHandle: '@kingdomapp',
  thumbHue: 288, thumbEmoji: '📖',
  difficulty: 'Beginner', duration: '10 min', participants: '6.2k studied', rating: 4.9,
  isFeed: true,
  cards: [
    { front: "John 3:16", back: "For God so loved the world that He gave His only Son, that whoever believes in Him shall not perish but have eternal life." },
    { front: "Philippians 4:13", back: "I can do all things through Christ who strengthens me." },
    { front: "Psalm 23:1", back: "The LORD is my shepherd; I shall not want." },
    { front: "Proverbs 3:5-6", back: "Trust in the LORD with all your heart, and do not lean on your own understanding. In all your ways acknowledge Him, and He will direct your paths." },
    { front: "Romans 8:28", back: "And we know that in all things God works for the good of those who love Him, who have been called according to His purpose." },
    { front: "Jeremiah 29:11", back: "'For I know the plans I have for you,' declares the LORD, 'plans to prosper you and not to harm you, plans to give you hope and a future.'" },
    { front: "Isaiah 40:31", back: "But those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint." },
    { front: "Matthew 5:3", back: "Blessed are the poor in spirit, for theirs is the kingdom of heaven." },
  ],
};

const FAITH_COURSE: StudioContent = {
  id: 'ks-com-course-1',
  title: 'Faith & Purpose',
  description: 'Five principles for living with intention. Discover how faith, community, and service connect to your God-given purpose.',
  type: 'devotional', category: 'Courses', mode: 'community',
  brand: 'Community Bible Church', brandHandle: '@communitybible',
  thumbHue: 275, thumbEmoji: '🕊️',
  difficulty: 'Beginner', duration: '12 min', participants: '3.4k started', rating: 4.9,
  isFeed: true,
  slides: [
    { title: "Your God-Given Purpose", emoji: "✝️", body: "Purpose isn't something you find — it's something you grow into. It's revealed through your gifts, your wounds, and your willingness to serve others. Proverbs 19:21: 'Many are the plans in a person's heart, but it is the LORD's purpose that prevails.'" },
    { title: "Faith in Daily Life", emoji: "🙏", body: "Faith isn't only for Sundays. It's how you respond to adversity at work, how you treat the person who can do nothing for you, how you make decisions when no one's watching. Matthew 5:16: 'Let your light shine before others, that they may see your good deeds.'" },
    { title: "The Power of Community", emoji: "🤝", body: "We were not designed to walk alone. Ecclesiastes 4:9-10: 'Two are better than one, because they have a good return for their labor: If either of them falls down, one can help the other up.'", points: ["Find your people intentionally", "Be the community member you want others to be", "Serve before you ask for anything", "Vulnerability builds real trust"] },
    { title: "Prayer as Practice", emoji: "🕊️", body: "Prayer is not a rescue call for emergencies — it's a daily practice of alignment. 1 Thessalonians 5:17: 'Pray continually.' A morning intention, an evening gratitude, a midday moment of stillness. Build the muscle." },
    { title: "Growing Through Challenges", emoji: "🌱", body: "James 1:2-4: 'Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance. Let perseverance finish its work so that you may be mature and complete.'", points: ["Every challenge holds a lesson", "Perseverance is built, not born", "Your testimony is being written right now", "Growth and comfort cannot coexist"] },
  ],
};

const COMMUNITY_QUIZ: StudioContent = {
  id: 'ks-com-quiz-1',
  title: 'Community Values Quiz',
  description: 'Test your knowledge of faith foundations, service principles, and what it means to live in community.',
  type: 'quiz', category: 'Trivia', mode: 'community',
  brand: 'The Living Word', brandHandle: '@livingword',
  thumbHue: 265, thumbEmoji: '❤️',
  difficulty: 'Beginner', duration: '5 min', participants: '1.6k played', rating: 4.7,
  questions: [
    { q: "The Golden Rule is found in which book of the Bible?", opts: ["Proverbs", "Matthew", "Romans", "James"], a: 1, e: "Matthew 7:12: 'So in everything, do to others what you would have them do to you.'" },
    { q: "Which Old Testament figure is known for extraordinary patience?", opts: ["Solomon", "Job", "Elijah", "Isaiah"], a: 1, e: "Job's endurance through severe suffering is the biblical archetype of patience and trust in God." },
    { q: "The Fruit of the Spirit (Galatians 5:22) includes which of these?", opts: ["Courage and strength", "Love, joy, and peace", "Wisdom and knowledge", "Power and authority"], a: 1, e: "The Fruit of the Spirit: love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, and self-control." },
    { q: "What is the Great Commission (Matthew 28:19)?", opts: ["Love your neighbor as yourself", "Go and make disciples of all nations", "Feed the hungry, clothe the poor", "Pray for those who persecute you"], a: 1, e: "The Great Commission: 'Go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit.'" },
    { q: "Which verse is often called 'the Bible in miniature'?", opts: ["Psalm 23:1", "John 3:16", "Romans 8:28", "Philippians 4:13"], a: 1, e: "John 3:16 is often called 'the Bible in miniature' because it encapsulates the entire gospel message." },
    { q: "What does 'shalom' mean in Hebrew?", opts: ["Praise", "Peace and wholeness", "Blessing", "Strength"], a: 1, e: "Shalom (שָׁלוֹם) means peace, wholeness, completeness, and prosperity — a comprehensive flourishing." },
    { q: "What is the meaning of 'agape' love?", opts: ["Romantic love", "Family love", "Unconditional, self-giving love", "Friendship love"], a: 2, e: "Agape (ἀγάπη) is the Greek word for unconditional, sacrificial love — the kind God has for us and commands us to have for others." },
    { q: "Micah 6:8 says we should 'walk humbly with your...'", opts: ["...community", "...God", "...neighbor", "...conscience"], a: 1, e: "Micah 6:8: 'He has shown you, O mortal, what is good. And what does the LORD require of you? To act justly and to love mercy and to walk humbly with your God.'" },
  ],
};

// ── CONTENT REGISTRY ───────────────────────────────────────────────────────

const ALL_CONTENT: StudioContent[] = [
  SPORTS_TRIVIA, HBCU_QUIZ, FANTASY_COURSE, SCORE_PREDICTOR, TRAINING_COURSE,
  ENTREPRENEUR_TRIVIA, BIZ_SIM, FIN_COURSE, MARKETING_QUIZ,
  HBCU_FLASHCARDS, PYTHON_QUIZ, STUDY_SKILLS, CRITICAL_THINKING, SCIENCE_TRIVIA,
  BIBLE_TRIVIA, SCRIPTURE_FLASH, FAITH_COURSE, COMMUNITY_QUIZ,
];

// ── Mock Reviews ───────────────────────────────────────────────────────────

const DEFAULT_REVIEWS: Review[] = [
  { author: 'Marcus J.', initials: 'MJ', rating: 5, text: 'This is exactly what I needed. Genuinely learned something new.', timeAgo: '2d ago' },
  { author: 'Aaliyah T.', initials: 'AT', rating: 5, text: 'Finally — content that actually makes you think. 10/10.', timeAgo: '4d ago' },
  { author: 'Devon R.', initials: 'DR', rating: 4, text: 'Solid content. Would love more questions on this topic.', timeAgo: '1w ago' },
  { author: 'Simone K.', initials: 'SK', rating: 5, text: 'Shared this with my study group. We all competed for the high score.', timeAgo: '1w ago' },
];

// ── Public API ─────────────────────────────────────────────────────────────

// Cross-mode feed — all isFeed content interleaved from every mode
export function getFeedContent(): StudioContent[] {
  return ALL_CONTENT.filter(c => c.isFeed);
}

// Cross-mode explore rows — category rows pull from the full library regardless of mode
export function getExploreRows(): { label: string; items: StudioContent[] }[] {
  return [
    { label: 'Trending',             items: [...ALL_CONTENT].sort((a, b) => b.rating - a.rating).slice(0, 8) },
    { label: 'New This Week',        items: ALL_CONTENT.filter(c => c.isFeed).slice(0, 6) },
    { label: 'Popular Courses',      items: ALL_CONTENT.filter(c => c.type === 'course' || c.type === 'training' || c.type === 'devotional') },
    { label: 'Quick Games',          items: ALL_CONTENT.filter(c => c.type === 'trivia' || c.type === 'game').slice(0, 6) },
    { label: 'Brain Teasers',        items: ALL_CONTENT.filter(c => c.type === 'quiz' || c.type === 'flashcards' || c.type === 'simulation').slice(0, 6) },
    { label: 'Faith & Spirituality', items: ALL_CONTENT.filter(c => c.mode === 'community') },
    { label: 'Sports & Athletics',   items: ALL_CONTENT.filter(c => c.mode === 'sports') },
    { label: 'Business & Career',    items: ALL_CONTENT.filter(c => c.mode === 'business') },
  ].filter(row => row.items.length > 0);
}

// Cross-mode library — all content regardless of active mode
export function getAllContent(): StudioContent[] {
  return ALL_CONTENT;
}

/** @deprecated Keep for any external callers that still need mode-scoped lists. */
export function getModeContent(mode: string): StudioContent[] {
  return ALL_CONTENT.filter(c => c.mode === mode);
}

export function getContentById(id: string): StudioContent | undefined {
  return ALL_CONTENT.find(c => c.id === id);
}

export function filterByPill(items: StudioContent[], pill: string): StudioContent[] {
  if (pill === 'All') return items;
  return items.filter(c => c.category === pill);
}

// Cross-mode related content
export function getRelatedContent(id: string): StudioContent[] {
  const item = getContentById(id);
  const pool = ALL_CONTENT.filter(c => c.id !== id);
  const same = pool.filter(c => c.category === item?.category);
  return (same.length >= 3 ? same : pool).slice(0, 6);
}

// Cross-mode search — searches entire library
export function searchContent(query: string): StudioContent[] {
  if (!query) return [];
  const q = query.toLowerCase();
  return ALL_CONTENT.filter(c =>
    c.title.toLowerCase().includes(q) ||
    c.description.toLowerCase().includes(q) ||
    c.category.toLowerCase().includes(q) ||
    c.type.toLowerCase().includes(q)
  ).slice(0, 12);
}

export function getReviews(): Review[] {
  return DEFAULT_REVIEWS;
}
