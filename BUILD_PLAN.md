# KaNeXT OS v1.1 Build Plan — All Modes

**Status**: Planning Complete
**Scope**: Sports, Enterprise, Church, Education (Single Phase)
**Estimated Duration**: 21 days (3 weeks)

---

## 1. Page List (Build Order)

### Phase A: Universal OS Chrome (Days 1-3)
Build the shared infrastructure that all modes depend on.

| # | Page/Component | Priority | Dependencies |
|---|----------------|----------|--------------|
| 1 | App Launch Sequence (cold open → brand reveal → Nexus) | Critical | None |
| 2 | Bottom Navigation (Home \| Search \| Nexus \| Activity \| Organization) | Critical | None |
| 3 | Top Bar (Avatar \| KaNeXT wordmark \| Search icon) | Critical | None |
| 4 | Home Layout (mode/org/role display + program selector) | Critical | 2, 3 |
| 5 | Avatar Drawer (identity, context switching, mode switching, account) | Critical | 3 |
| 6 | Account Settings (read-only account info, notifications, privacy) | Medium | 5 |
| 7 | Search (universal retrieval surface) | Critical | 2 |
| 8 | Nexus Canvas (main reasoning surface) | Critical | 2 |
| 9 | Nexus Left Slide-In Conversations Panel | Critical | 8 |
| 10 | Activity Feed (chronological change log) | Critical | 2 |

### Phase B: Sports Mode — Organization (Days 4-8)
The most complex mode; builds the Organization pattern for reuse.

| # | Page/Component | Priority | Dependencies |
|---|----------------|----------|--------------|
| 11 | Organization → Institution Overview | Critical | 7, 10 |
| 12 | Organization → Program Home (Team Page) | Critical | 11 |
| 13 | Organization → Roster (season-scoped list) | Critical | 12 |
| 14 | Organization → Player Profile (career view) | Critical | 13 |
| 15 | Organization → Staff List | High | 12 |
| 16 | Organization → Staff Profile | High | 15 |
| 17 | Organization → Schedule & Events | Critical | 12 |
| 18 | Event Detail → Game Center (box scores) | Critical | 17 |
| 19 | Event Detail → Tournament Overview | High | 17 |
| 20 | Event Detail → Camp/Showcase Info | Medium | 17 |
| 21 | Organization → Media (external links list) | High | 12, 14 |
| 22 | Organization → National Player Pool | Critical | 14 |
| 23 | National Player Pool → Player Profile (global + program-aware) | Critical | 22 |
| 24 | Organization → Recruiting Board (read-only) | High | 23 |
| 25 | Organization → Donation | Medium | 11, 12 |
| 26 | Organization → Tickets | Medium | 17 |

### Phase C: Sports Mode — Nexus Overlays (Days 9-11)
Intelligence and planning surfaces inside Nexus.

| # | Page/Component | Priority | Dependencies |
|---|----------------|----------|--------------|
| 27 | Program Context Drawer (clipboard icon) | Critical | 8 |
| 28 | Roster Sandbox Overlay (Official/Sandbox toggle) | Critical | 8, 13 |
| 29 | Roster Sandbox → Depth Chart View | High | 28 |
| 30 | Roster Sandbox → Add Player flow | High | 28, 24 |
| 31 | Roster Sandbox → Commit to Official | Critical | 28 |
| 32 | Recruiting Board Overlay (EA-style) | Critical | 8, 24 |
| 33 | Recruiting Board → Prospect Detail Panel | Critical | 32 |
| 34 | Recruiting Board → Filters (intelligence-driven) | High | 32 |
| 35 | Recruiting Board → Add to Roster Sandbox | Critical | 32, 28 |

### Phase D: Sports Mode — Simulation (Days 12-13)
Conversation-first simulation flow.

| # | Page/Component | Priority | Dependencies |
|---|----------------|----------|--------------|
| 36 | Simulation Result Card (inline in Nexus thread) | Critical | 8 |
| 37 | Full Simulation View (overlay/screen) | Critical | 36 |
| 38 | Save Simulation Snapshot (thread artifact) | Critical | 37 |

### Phase E: Enterprise Mode (Days 14-15)
Investor-facing data room inside KaNeXT OS.

| # | Page/Component | Priority | Dependencies |
|---|----------------|----------|--------------|
| 39 | Enterprise Home | Critical | 4 |
| 40 | Enterprise Avatar Drawer (role-aware) | Critical | 5 |
| 41 | Enterprise Search (routing only) | Critical | 7 |
| 42 | Enterprise Nexus (role-gated: Founder vs Investor/Viewer) | Critical | 8 |
| 43 | Enterprise Nexus → Saved Scenarios sidebar | High | 42 |
| 44 | Enterprise Activity (role-filtered) | Critical | 10 |
| 45 | Enterprise Organization → Overview | Critical | 11 |
| 46 | Enterprise Organization → Documents | Critical | 45 |
| 47 | Enterprise Organization → Governance | High | 45 |
| 48 | Enterprise Organization → Domains (mode labels) | Medium | 45 |

### Phase F: Church Mode (Days 16-17)
ICC (ICCLA / ICCIE) instantiation.

| # | Page/Component | Priority | Dependencies |
|---|----------------|----------|--------------|
| 49 | Church Home | Critical | 4 |
| 50 | Church Avatar Drawer (campus + role switcher) | Critical | 5 |
| 51 | Church Search (routing to ministries, messages, giving) | Critical | 7 |
| 52 | Church Nexus (planning only, no spiritual guidance) | Critical | 8 |
| 53 | Church Activity | Critical | 10 |
| 54 | Church Organization → About | Critical | 11 |
| 55 | Church Organization → Campuses (ICCLA, ICCIE) | Critical | 54 |
| 56 | Church Organization → Ministries | Critical | 54 |
| 57 | Ministries → Children's Church | High | 56 |
| 58 | Ministries → Teens/Youth | High | 56 |
| 59 | Ministries → Singles | Medium | 56 |
| 60 | Ministries → Hotline to Heaven | High | 56 |
| 61 | Ministries → Foundation/Outreach | High | 56 |
| 62 | Church Organization → Messages (sermons) | Critical | 54 |
| 63 | Church Organization → Giving | Critical | 54 |
| 64 | Church Organization → Connect | High | 54 |

### Phase G: Education Mode (Days 18-19)
San Diego Christian College instantiation.

| # | Page/Component | Priority | Dependencies |
|---|----------------|----------|--------------|
| 65 | Education Home | Critical | 4 |
| 66 | Education Avatar Drawer (cycle selector) | Critical | 5 |
| 67 | Education Search | Critical | 7 |
| 68 | Education Nexus (grounded in SDCC context) | Critical | 8 |
| 69 | Education Activity | Critical | 10 |
| 70 | Education Organization → Overview | Critical | 11 |
| 71 | Education Organization → Schedule (academic calendar) | Critical | 70 |
| 72 | Education Organization → Results (completed terms) | High | 70 |
| 73 | Education Organization → Metrics | High | 70 |
| 74 | Education Organization → Archive (past academic years) | Medium | 70 |
| 75 | Education Event Hub (term/event detail) | High | 71 |
| 76 | Education Member Profile (President, Faculty) | High | 70 |

### Phase H: Integration & Polish (Days 20-21)
Cross-mode navigation, state persistence, demo readiness.

| # | Page/Component | Priority | Dependencies |
|---|----------------|----------|--------------|
| 77 | Mode switching persistence (Avatar Drawer → all surfaces update) | Critical | All |
| 78 | First-run prompt ("What brought you here?") | Critical | 1, 8 |
| 79 | Empty states for all surfaces | High | All |
| 80 | Error states | High | All |
| 81 | Demo data seeding (all modes) | Critical | All |

---

## 2. Data Structures

### Universal Types

```typescript
// Core identity
interface User {
  id: string;
  name: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  primaryRole: Role;
  organizations: OrganizationMembership[];
}

interface OrganizationMembership {
  organizationId: string;
  roles: Role[];
  isActive: boolean;
}

type Role =
  | 'admin' | 'founder' | 'investor' | 'viewer'  // Enterprise
  | 'head_coach' | 'assistant_coach' | 'gm' | 'student_athlete' | 'fan' | 'agent' | 'scout' | 'donor' | 'media'  // Sports
  | 'member' | 'staff' | 'leadership'  // Church
  | 'faculty' | 'student' | 'staff';  // Education

// Context state (global)
interface AppContext {
  mode: Mode;
  organization: Organization;
  operatingRole: Role;
  cycle?: Cycle;  // Season (Sports), Academic Year (Education), etc.
  program?: Program;  // Sports only
}

type Mode = 'sports' | 'enterprise' | 'church' | 'education';

// Organization (base)
interface Organization {
  id: string;
  name: string;
  mode: Mode;
  type: string;  // e.g., 'college_basketball', 'llc', 'church', 'college'
  location?: Location;
  description?: string;
}

// Cycle (temporal context)
interface Cycle {
  id: string;
  name: string;  // e.g., "2025-26", "Fall 2025"
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
}
```

### Sports Mode Types

```typescript
interface SportsOrganization extends Organization {
  programs: Program[];
  leadership: Staff[];
}

interface Program {
  id: string;
  name: string;  // "Varsity", "Development I", etc.
  level: 'varsity' | 'development_1' | 'development_2' | 'postgrad';
  currentSeason: Season;
  seasons: Season[];
}

interface Season extends Cycle {
  roster: RosterEntry[];
  schedule: Event[];
  record?: { wins: number; losses: number };
}

interface RosterEntry {
  playerId: string;
  player: Player;
  jerseyNumber?: string;
  role: 'starter' | 'rotation' | 'development';
  scholarshipPercent: number;
  nilAmount: number;
  fitPercent?: number;
}

interface Player {
  id: string;
  name: string;
  position: Position;
  height: string;
  weight: string;
  hometown?: string;
  classYear: string;
  currentTeam?: string;
  currentLevel?: Level;
  careerTimeline: CareerSeason[];
  mediaLinks: MediaLink[];
  externalLinks: ExternalLink[];
}

type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C';
type Level = 'NCAA_D1' | 'NCAA_D2' | 'NCAA_D3' | 'NAIA' | 'NJCAA' | 'CCCAA' | 'NCCAA' | 'USCAA';

interface CareerSeason {
  seasonYear: string;
  team: string;
  level: Level;
  stats: SeasonStats;
  gameLog?: GameStats[];
}

interface SeasonStats {
  gp: number;
  mpg?: number;
  ppg: number;
  rpg: number;
  apg: number;
  bpg?: number;
  spg?: number;
  fgPct?: number;
  threePct?: number;
  ftPct?: number;
}

interface Staff {
  id: string;
  name: string;
  title: string;
  programId?: string;
  bio?: string;
  headshot?: string;
  externalLinks: ExternalLink[];
}

interface Event {
  id: string;
  type: 'game' | 'tournament' | 'camp' | 'showcase' | 'scrimmage';
  name: string;
  date: Date;
  endDate?: Date;
  location: string;
  venue: 'home' | 'away' | 'neutral';
  status: 'upcoming' | 'live' | 'final';
  opponent?: string;
  result?: GameResult;
  games?: Event[];  // For tournaments
  mediaLinks: MediaLink[];
}

interface GameResult {
  homeScore: number;
  awayScore: number;
  isWin: boolean;
  boxScore: BoxScore;
}

interface BoxScore {
  teamStats: TeamStats;
  playerStats: PlayerGameStats[];
}

// Recruiting
interface RecruitingTarget {
  playerId: string;
  player: Player;
  programId: string;
  seasonId: string;
  status: 'watching' | 'priority' | 'contacted' | 'offered' | 'committed' | 'archived';
  priority: 'A' | 'B' | 'C';
  evaluationBand?: string;
  fitPercent?: number;
  notes?: string;
  tags: string[];
  nextStep?: string;
  nextStepDate?: Date;
  assignedCoach?: string;
  plannedScholarship?: number;
  plannedNil?: number;
  lastUpdated: Date;
  evaluationSnapshots: EvaluationSnapshot[];
}

interface EvaluationSnapshot {
  id: string;
  timestamp: Date;
  summary: string;
  nexusThreadId: string;
}

// Program Context (Nexus configuration)
interface ProgramContext {
  programId: string;
  scholarships: number;
  nilBudget: number;
  systemPreset: SystemPreset;
  offensiveStyle: string;
  defensiveStyle: string;
  tempo: number;
  clusterWeights: ClusterWeight[];
  positionImportance: PositionWeight[];
  biases: Bias[];
}

interface ClusterWeight {
  cluster: 'shooting' | 'finishing' | 'playmaking' | 'on_ball_defense' | 'team_defense' | 'rebounding' | 'physical';
  weight: number;  // 0-100, sum to 100
}

// Simulation
interface SimulationResult {
  id: string;
  type: 'single_game' | 'tournament' | 'season';
  matchupText: string;
  rosterUsed: 'official' | 'sandbox';
  timestamp: Date;
  winProbability: number;
  projectedScore: { home: number; away: number };
  projectedMargin: number;
  projectedTotal: number;
  confidence: 'high' | 'medium' | 'low';
  volatility: 'low' | 'medium' | 'high';
  drivers?: string;
  playerImpact?: PlayerImpact[];
  boxScoreProjection?: BoxScore;
}

interface SavedSimulation extends SimulationResult {
  threadId: string;
  savedAt: Date;
}
```

### Enterprise Mode Types

```typescript
interface EnterpriseOrganization extends Organization {
  legalStructure: string;
  stateOfFormation: string;
  status: string;
  operationalScope: string[];
  documents: Document[];
}

interface Document {
  id: string;
  title: string;
  category: 'investor_materials' | 'governance' | 'institutional_brief' | 'roadmap';
  url?: string;
  visibility: 'founder' | 'investor' | 'public';
  createdAt: Date;
  updatedAt: Date;
}

interface EnterpriseScenario {
  id: string;
  title: string;
  prompt: string;
  output: string;
  context: AppContext;
  timestamp: Date;
  isPinned: boolean;
}
```

### Church Mode Types

```typescript
interface ChurchOrganization extends Organization {
  denomination: string;
  campuses: Campus[];
  ministries: Ministry[];
  serviceTimes: ServiceTime[];
}

interface Campus {
  id: string;
  name: string;  // "ICCLA", "ICCIE"
  location: string;
  serviceTimes: ServiceTime[];
}

interface ServiceTime {
  day: string;
  time: string;
  campusId?: string;
}

interface Ministry {
  id: string;
  name: string;  // "Children's Church", "Teens/Youth", etc.
  description?: string;
  type: 'childrens' | 'youth' | 'singles' | 'prayer' | 'outreach';
  accessMethods?: string[];  // For Hotline to Heaven
}

interface Message {
  id: string;
  title: string;
  speaker?: string;
  date: Date;
  mediaType: 'video' | 'audio';
  externalUrl: string;
  seriesId?: string;
}

interface GivingOption {
  id: string;
  type: 'tithe' | 'offering' | 'donation' | 'fundraiser';
  name: string;
  description?: string;
  externalUrl: string;
}
```

### Education Mode Types

```typescript
interface EducationOrganization extends Organization {
  institutionType: string;
  academicYear: AcademicYear;
  programFormats: string[];
  doctrinalStatement?: string;
  history?: string;
}

interface AcademicYear extends Cycle {
  terms: Term[];
}

interface Term {
  id: string;
  name: string;  // "Fall 2025", "Spring 2026"
  startDate: Date;
  endDate: Date;
  events: AcademicEvent[];
}

interface AcademicEvent {
  id: string;
  name: string;
  date: Date;
  type: 'term_start' | 'term_end' | 'add_drop' | 'midterm' | 'commencement' | 'break';
  department?: string;
}

interface Faculty extends Staff {
  department?: string;
  credentials?: string[];
}
```

### Nexus Types

```typescript
interface NexusThread {
  id: string;
  title?: string;
  participants: string[];  // User IDs
  messages: NexusMessage[];
  context: AppContext;
  createdAt: Date;
  updatedAt: Date;
}

interface NexusMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  artifacts?: NexusArtifact[];
}

type NexusArtifact =
  | { type: 'simulation_result'; data: SimulationResult }
  | { type: 'saved_simulation'; data: SavedSimulation }
  | { type: 'evaluation_snapshot'; data: EvaluationSnapshot }
  | { type: 'enterprise_scenario'; data: EnterpriseScenario };
```

### Activity Types

```typescript
interface ActivityItem {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: Date;
  sourceType: 'organization' | 'event' | 'record' | 'media' | 'system';
  sourceId: string;
  sourcePath: string;  // Route to navigate to
  organizationId: string;
  mode: Mode;
  visibility: Role[];  // Which roles can see this
}

type ActivityType =
  | 'game_final' | 'score_updated' | 'schedule_updated' | 'media_added' | 'roster_published'
  | 'document_added' | 'document_updated' | 'scenario_saved' | 'config_changed'
  | 'message_posted' | 'event_updated' | 'ministry_updated' | 'giving_updated'
  | 'calendar_published' | 'term_confirmed' | 'leadership_updated';
```

---

## 3. Navigation + Routing Map

### Global Routes (All Modes)
```
/                           → Redirects to /nexus (first run) or /home (returning)
/home                       → Home (context display)
/search                     → Search (universal retrieval)
/nexus                      → Nexus Canvas
/nexus/conversations        → Conversations panel (slide-in)
/nexus/thread/:id           → Specific thread
/activity                   → Activity Feed
/organization               → Organization (mode-specific)
/account                    → Account Settings (read-only)
```

### Sports Mode Routes
```
/organization                               → Institution Overview
/organization/programs/:programId           → Program Home
/organization/programs/:programId/roster    → Roster (season-scoped)
/organization/programs/:programId/roster/:seasonId
/organization/players/:playerId             → Player Profile (career view)
/organization/staff                         → Staff List
/organization/staff/:staffId                → Staff Profile
/organization/schedule                      → Schedule & Events
/organization/events/:eventId               → Event Detail
/organization/events/:eventId/game          → Game Center
/organization/events/:eventId/tournament    → Tournament Overview
/organization/media                         → Media List
/organization/recruiting                    → Recruiting Board (read-only)
/organization/players/pool                  → National Player Pool
/organization/donation                      → Donation
/organization/tickets                       → Tickets

# Nexus Overlays (not routes, but state)
/nexus?overlay=roster&program=:id&season=:id
/nexus?overlay=recruiting&program=:id&season=:id
/nexus?drawer=program-context
/nexus?simulation=:id
```

### Enterprise Mode Routes
```
/organization                   → Enterprise Overview (KaNeXT)
/organization/documents         → Documents List
/organization/documents/:id     → Document Detail
/organization/governance        → Governance
/organization/domains           → Domains/Modes Overview
```

### Church Mode Routes
```
/organization                       → Church About (ICC)
/organization/campuses              → Campuses List
/organization/campuses/:id          → Campus Detail
/organization/ministries            → Ministries List
/organization/ministries/:id        → Ministry Detail
/organization/messages              → Messages/Sermons
/organization/messages/:id          → Message Detail (external)
/organization/giving                → Giving
/organization/connect               → Connect
```

### Education Mode Routes
```
/organization                       → Institution Overview (SDCC)
/organization/schedule              → Academic Calendar
/organization/results               → Completed Terms
/organization/metrics               → Metrics
/organization/archive               → Archive (past years)
/organization/events/:id            → Event Hub (term details)
/organization/members/:id           → Member Profile (President, Faculty)
```

### Bottom Tab Navigation
```
┌─────────┬─────────┬─────────┬──────────┬──────────────┐
│  Home   │ Search  │  Nexus  │ Activity │ Organization │
└─────────┴─────────┴─────────┴──────────┴──────────────┘
```

### Avatar Drawer Navigation
```
┌────────────────────────────┐
│ [Avatar]                   │
│ Name                       │
│ Primary Role               │
│ Organization               │
├────────────────────────────┤
│ ACTIVE CONTEXT             │
│ Mode: [Dropdown]           │
│   ○ Sports                 │
│   ○ Enterprise             │
│   ○ Church                 │
│   ○ Education              │
│                            │
│ Organization: [Display]    │
│ Role: [Dropdown if multi]  │
│ Cycle: [Display]           │
├────────────────────────────┤
│ Program: [Display only]    │
├────────────────────────────┤
│ Account                    │
│ Support                    │
│ Legal                      │
│ Log Out                    │
└────────────────────────────┘
```

---

## 4. Day-by-Day Build Checklist

### Week 1: Foundation + Sports Organization

#### Day 1 — App Shell & Navigation
- [ ] Set up Expo Router file structure
- [ ] Create bottom tab navigation (Home | Search | Nexus | Activity | Organization)
- [ ] Create top bar component (Avatar | KaNeXT wordmark | Search icon)
- [ ] Implement app launch sequence (black → brand reveal → Nexus)
- [ ] Set up global context state (mode, organization, role, cycle)
- [ ] Create color theme for light/dark modes

#### Day 2 — Home & Avatar Drawer
- [ ] Build Home layout (context display only)
- [ ] Implement Program selector dropdown on Home (Sports-specific)
- [ ] Build Avatar Drawer slide-in (X-style)
- [ ] Implement Identity Header section (read-only)
- [ ] Implement Active Context section (mode switching)
- [ ] Implement Viewing As / Role switching
- [ ] Build Account & System section (read-only, routes to Account Settings)

#### Day 3 — Search & Activity
- [ ] Build universal Search surface
- [ ] Implement search input with instant results
- [ ] Create result row component (title, category, chevron)
- [ ] Implement result grouping by entity type
- [ ] Build Activity feed layout
- [ ] Implement activity item structure (type, description, timestamp)
- [ ] Add time grouping (Today, This Week, Earlier)
- [ ] Implement tap → route to source behavior

#### Day 4 — Sports: Institution & Program
- [ ] Create Organization shell (mode-contextual)
- [ ] Build Institution Overview page
- [ ] Create Programs section (cards for Varsity, Dev I, Dev II, Postgrad)
- [ ] Build Institution Leadership section
- [ ] Create Institutional Snapshot section
- [ ] Build Program Home (team page)
- [ ] Implement Program Header
- [ ] Add Program-level Leadership section
- [ ] Create Program Snapshot (record, last game, next game)
- [ ] Add primary navigation sections (Roster, Schedule, Staff, Media)

#### Day 5 — Sports: Roster & Player Profile
- [ ] Build Roster list page (season-scoped)
- [ ] Implement season selector dropdown
- [ ] Create player row component (name, number, position, height/weight, class)
- [ ] Build Player Profile (career view)
- [ ] Create Player Header (identity, physicals, current team)
- [ ] Implement Career Timeline section
- [ ] Add Season Detail expandable sections
- [ ] Create Bio and Media sections
- [ ] Link roster rows to Player Profile

#### Day 6 — Sports: Staff & Schedule
- [ ] Build Staff List page
- [ ] Create staff card component (name, title, headshot)
- [ ] Implement Staff Profile (bio page)
- [ ] Build Schedule & Events page
- [ ] Create event row component (name, type badge, date, status)
- [ ] Implement event grouping (by season, tournament)
- [ ] Build Event Detail base layout

#### Day 7 — Sports: Game Center & Events
- [ ] Build Game Center (Event Detail for games)
- [ ] Implement score display and status strip
- [ ] Create Box Score component
- [ ] Add player stat lines table
- [ ] Build recap section
- [ ] Create Tournament Overview page
- [ ] Build Camp/Showcase info page
- [ ] Link all events properly
- [ ] Build Media list page (external links)

### Week 2: Sports Mode Nexus + Other Modes

#### Day 8 — Sports: National Player Pool & Recruiting Board
- [ ] Build National Player Pool page
- [ ] Implement filter rail (Division, Position, Height, Class, Season)
- [ ] Create EA-style sortable table
- [ ] Build National Player Profile (global + program-aware)
- [ ] Create Context Strip component
- [ ] Implement Action Panel (context-dependent)
- [ ] Build Organization → Recruiting Board (read-only)
- [ ] Create recruiting status badges

#### Day 9 — Nexus: Core Canvas
- [ ] Build Nexus main canvas
- [ ] Implement blank state (NEXUS watermark)
- [ ] Create active chat state (message thread)
- [ ] Build input bar (text, mic, send)
- [ ] Implement Left Slide-In Conversations Panel
- [ ] Add Avatar in panel header
- [ ] Create search bar for conversations
- [ ] Build conversations list
- [ ] Implement new chat creation

#### Day 10 — Nexus: Program Context Drawer
- [ ] Build Program Context Drawer (clipboard icon)
- [ ] Implement Program Selector dropdown
- [ ] Create Program Resources section (Scholarships, NIL Budget)
- [ ] Build System Preset selector
- [ ] Implement Play Style Controls (Offensive, Defensive, Tempo)
- [ ] Create Cluster Weighting sliders
- [ ] Add Sub-Trait Emphasis expandable sections
- [ ] Build Position Importance matrix
- [ ] Implement Program Biases controls
- [ ] Add Save and Save As New Profile buttons

#### Day 11 — Nexus: Roster & Recruiting Overlays
- [ ] Build Roster Sandbox Overlay
- [ ] Implement header with Program/Season selectors
- [ ] Create Resource Bar (scholarships/NIL used)
- [ ] Build Roster View (editable table)
- [ ] Implement Inline Player Panel
- [ ] Build Depth Chart View
- [ ] Create Add Player flow
- [ ] Implement "Apply to Official Roster" commit action
- [ ] Build Recruiting Board Overlay (EA-style)
- [ ] Implement status tabs (All, Priority, Watching, etc.)
- [ ] Create Summary Strip
- [ ] Build Prospect Detail Panel
- [ ] Implement intelligence-driven filters
- [ ] Create Add to Roster Sandbox bridge

#### Day 12 — Nexus: Simulation
- [ ] Implement simulation intent detection (keywords)
- [ ] Build Compact Simulation Result Card
- [ ] Create card header (matchup, roster badge)
- [ ] Implement primary outputs (Win%, Score, Margin, Total)
- [ ] Add risk layer (Confidence, Volatility)
- [ ] Create action buttons (View Full, Re-run)
- [ ] Build Full Simulation View
- [ ] Implement context header
- [ ] Add Drivers section
- [ ] Create Player Impact Summary
- [ ] Build collapsible Box Score section
- [ ] Implement Save Simulation action

#### Day 13 — Simulation Snapshot & Sports Polish
- [ ] Build Saved Simulation Snapshot component
- [ ] Implement snapshot insertion into thread
- [ ] Add "View Full Simulation" link from snapshot
- [ ] Build Donation page
- [ ] Build Tickets page
- [ ] Test all Sports Mode routing
- [ ] Verify Official vs Sandbox roster behavior
- [ ] Polish all empty states
- [ ] Test role-based presentation in Search

#### Day 14 — Enterprise Mode
- [ ] Create Enterprise Home
- [ ] Build Enterprise Avatar Drawer (Founder vs Investor/Viewer display)
- [ ] Implement Enterprise Search (routing only)
- [ ] Build Enterprise Organization Overview
- [ ] Create Documents section
- [ ] Add Governance section
- [ ] Implement Domains display
- [ ] Build Enterprise Nexus (role-gated)
- [ ] Create first-run copy states (Founder vs Investor)
- [ ] Build Saved Scenarios sidebar
- [ ] Implement Save scenario action (append-only, founder-only)
- [ ] Build Enterprise Activity (role-filtered)

#### Day 15 — Enterprise Polish + Church Start
- [ ] Test Enterprise role visibility rules
- [ ] Verify Nexus restrictions for Investor/Viewer
- [ ] Polish Enterprise empty states
- [ ] Create Church Home
- [ ] Build Church Avatar Drawer (campus + role switcher)
- [ ] Implement Church Search
- [ ] Build Church Organization → About
- [ ] Create Campuses section (ICCLA, ICCIE)

### Week 3: Church, Education, Integration

#### Day 16 — Church Mode Complete
- [ ] Build Ministries list page
- [ ] Create ministry detail pages (Children's, Youth, Singles)
- [ ] Build Hotline to Heaven page (access methods)
- [ ] Create Foundation/Outreach page
- [ ] Build Messages (sermons) list
- [ ] Implement message row (title, speaker, date, media type)
- [ ] Create Giving page
- [ ] Build Connect page
- [ ] Implement Church Nexus (planning only guardrails)
- [ ] Build Church Activity
- [ ] Test campus switching behavior

#### Day 17 — Church Polish + Education Start
- [ ] Test all Church Mode routing
- [ ] Verify Nexus spiritual boundary enforcement
- [ ] Polish Church empty states
- [ ] Create Education Home
- [ ] Build Education Avatar Drawer (cycle selector)
- [ ] Implement Education Search
- [ ] Build Education Organization Overview
- [ ] Create institution header and type display

#### Day 18 — Education Mode Complete
- [ ] Build Schedule (academic calendar) page
- [ ] Create term event rows
- [ ] Implement Results (completed terms) page
- [ ] Build Metrics page (Organization + Members tabs)
- [ ] Create Archive page (past academic years)
- [ ] Build Event Hub (term detail)
- [ ] Create Member Profile (President, Faculty)
- [ ] Implement Education Nexus (grounded in SDCC context)
- [ ] Build Education Activity

#### Day 19 — Education Polish + Integration
- [ ] Test all Education Mode routing
- [ ] Verify Nexus context grounding
- [ ] Polish Education empty states
- [ ] Test mode switching (Avatar Drawer → all surfaces update)
- [ ] Verify context persistence across navigation
- [ ] Test first-run flow ("What brought you here?")
- [ ] Verify bottom navigation consistency across modes

#### Day 20 — Data & Demo Readiness
- [ ] Seed Lincoln University basketball demo data
- [ ] Seed KaNeXT Enterprise demo data
- [ ] Seed ICC Church demo data
- [ ] Seed SDCC Education demo data
- [ ] Create mock Airtable connection structure
- [ ] Implement stub simulation JSON outputs
- [ ] Test all Search result routing
- [ ] Verify Activity generates correctly from changes

#### Day 21 — Final Polish & QA
- [ ] Complete error state handling
- [ ] Test all tap → route behaviors
- [ ] Verify role-based visibility across modes
- [ ] Test Nexus overlay open/close state preservation
- [ ] Verify Program Context affects Nexus reasoning (mock)
- [ ] Test Roster Sandbox → Official commit flow
- [ ] Verify Recruiting Board ↔ Roster Sandbox bridge
- [ ] Final UI polish pass
- [ ] Demo walkthrough test

---

## Summary

**Total Pages/Components**: 81
**Estimated Duration**: 21 days (3 weeks)

**Critical Path**:
1. Universal chrome (Days 1-3)
2. Sports Organization surfaces (Days 4-8)
3. Nexus overlays + Simulation (Days 9-13)
4. Enterprise Mode (Days 14-15)
5. Church + Education Modes (Days 16-19)
6. Integration + Demo (Days 20-21)

**Key Dependencies**:
- All modes depend on universal chrome (Home, Avatar Drawer, Search, Nexus, Activity)
- Sports Mode Nexus overlays depend on Organization surfaces
- Simulation depends on Roster Sandbox existing
- Other modes reuse patterns established in Sports Mode
