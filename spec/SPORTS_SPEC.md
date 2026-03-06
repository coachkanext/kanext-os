# KaNeXT OS — Sports Mode Specification

**Version:** 1.0.0
**Last Updated:** March 2026

---

## 1. Mode Overview

Sports mode transforms KaNeXT OS into a coaching intelligence platform. The demo organization is **Lincoln University (Men's Basketball)** with accent colors Maroon (#990000) and Gold (#DFA414).

**Mental Model:** Video-game hub for a coach — NOT a SaaS dashboard, NOT a chatbot entry point.

**Demo Context:**
- Organization: Carroll College (NAIA, Frontier Conference)
- Role: Assistant Coach (A2)
- Program: Men's Basketball
- Season: 2025–2026

---

## 2. Sports Home — 4-Pill Tab Layout

**Component:** `SportsHome` in `app/(tabs)/index.tsx`

Four horizontally-swipeable pills via PagerView:

| Position | Pill       | Purpose                                  |
|----------|-----------|------------------------------------------|
| 1        | Dashboard | Coach's at-a-glance state and motion hub |
| 2        | Schedule  | Season calendar and game list            |
| 3        | Roster    | Full roster with KR and archetypes       |
| 4        | Recruiting| Prospect pipeline and national pool      |

**Navigation:** `PagedTabBar` + `EdgeHoldAdvance` (3s edge hold → advance tab) + standard swipe.

---

### 2.1 Dashboard Tab

Single vertical scroll with 5 blocks:

#### Block 1 — Video Hero (Interactive)

Context-driven media presentation with 4 badge states:

| Priority | Badge | Color            | Condition                |
|----------|-------|-----------------|--------------------------|
| 1        | LIVE  | #EF4444 (Red)   | Active game in progress  |
| 2        | NEXT  | Accent (Maroon) | Upcoming game scheduled  |
| 3        | RECAP | #A1A1AA (Gray)  | Most recent past game    |
| 4        | FILM  | Accent          | Fallback — no games      |

- Shows: Hero title, subtitle, badge chip, play button overlay
- Tap → Game video player
- Live game: Real-time score integration when `status='live'`

#### Block 2 — Next Game Card (Dark Themed)

- **Teams Row:** Home logo + record vs. opponent logo (hue-generated) + record
- **Info Line:** Date / Time / Venue / Location
- **Pill Row:** Game type (CONF/NON-CONF), opponent KR, win probability (color-coded)
- **Action Buttons:** Buy Tickets | Watch | Game Plan (primary)
- Tap opponent team → Opens Team Sheet
- Tap "Game Plan" → Drill-down to Game Plan OS

#### Block 3 — Commerce Row (3 Horizontal Cards)

| Card    | Content                              | Action           |
|---------|--------------------------------------|------------------|
| Tickets | Next home game, date, remaining count| Opens modal      |
| Store   | Team apparel/merchandise link        | Opens modal      |
| Support | Fundraising/donation                 | Opens modal      |

#### Block 4 — Team Snapshot Card (Interactive)

- **Left:** TEAM KR (large number, color-banded)
- **Right:** OFF KR pill + DEF KR pill, selected offensive/defensive systems, overall record (W-L, conference)
- Tap → Opens Team Sheet
- System selector: Configurable, affects live KR display

#### Block 5 — Domain Grid (2×3 Card Grid, RBAC-Gated)

6 domain cards in a 2-column grid:

| Card              | Icon                | Drill-Down Target    |
|-------------------|--------------------|-----------------------|
| Statistics        | `chart.bar.fill`   | Statistics Hub        |
| Game Plan         | `doc.text.fill`    | Game Plan OS          |
| Simulation        | `cpu.fill`         | Simulation OS         |
| Development       | `arrow.up.right`   | Development OS        |
| Alerts & Decisions| `bell.badge.fill`  | Alerts page           |
| Recruiting        | `person.badge.plus`| Recruiting page       |

**RBAC Gating:** `DOMAIN_HIDDEN[role]` controls card visibility per role (R0–R13).

- R0–R4: All 6 cards visible
- R5+: Progressively hidden based on role scope

---

### 2.2 Schedule Tab

- Shows: Full season schedule with upcoming and past games
- Game rows: Date, opponent, score/time, location, status
- Tappable games → Game detail or drill-down
- Sorted: Upcoming first, then past

---

### 2.3 Roster Tab

- Shows: Full roster with KR, position, stats, archetypes
- Filter/sort by: Position, cluster rating, archetype, KR
- Player rows tappable → Opens Player Sheet (global entity card)

---

### 2.4 Recruiting Tab

- Shows: Recruiting board grouped by status or priority
- **Status Groups:** Offered → Priority → Contacted → Watching → Committed → Archived
- **Priority Groups:** A → B → C
- Prospect cards: Name, position, height, class, current team, stats (PPG/RPG/APG), fit %, next step
- Tap → Opens prospect detail or pool player card

---

## 3. Media Tab — 4 Universal Panels

Canonical layout shared across all modes:

| Position | Tab     | Sports Implementation        |
|----------|---------|------------------------------|
| 1        | Feed    | Video stories + curated posts|
| 2        | Explore | `SportsExplorePageV2`        |
| 3        | Rooms   | `SportsFilmRoomV2` (Film Room)|
| 4        | Library | `LibraryHub`                 |

---

### 3.1 Feed Tab

**Story Circles Row (Horizontal Scroll):**
- Premium gradient rings (colored for new/unwatched stories)
- Avatar + initials + "Your Story" first
- Tap → Full-screen swipeable story viewer
- Visibility: Filtered by `visibility_class ≤ user.visibility_class`

**Feed Posts (Vertical List):**
- Header: Avatar, author name, role, verified badge (system posts), "more" menu
- Media card: Thumbnail + gradient overlay, play button, media type badge (REEL/CLIP), duration, title, view count
- Caption: Author name (bold) + caption text
- **Actions:** Like (heart toggle), Comment, Share, Save (bookmark)
- Comment → Comments Sheet (50% → 100%) with comment list + input composer
- Visibility filtering by role + authorization class

---

### 3.2 Explore Tab — SportsExplorePageV2

2-column grid discovery within visibility boundaries.

**Filter Controls:**
- **Scope:** My Org | All Accessible
- **Type:** All | Game | Clip | Practice
- **Level Selector:** NCAA D1, NAIA, NJCAA, CCCAA, etc.
- **Team Selector:** Cascading by selected level

**Tile Card:**
- Thumbnail (colored background) with play icon
- Type badge (top-left, color-coded)
- Duration badge (bottom-right)
- Title, team vs. opponent, date
- Tap → Video player or detail sheet
- Long-press → Share menu

---

### 3.3 Rooms Tab — Film Room (Sports-Specific)

5 coaching film rooms with drill-in architecture:

| Room         | Purpose                              | Content Type         |
|-------------|--------------------------------------|----------------------|
| Game Room   | Game film, box scores, scouting      | Full game recordings |
| Scout Room  | Opponent scout clips, comp analysis  | Scouting footage     |
| Practice Room| Drill videos, session footage       | Practice clips       |
| Player Dev  | Individual development clips         | Skill work videos    |
| Recruit Room| Prospect video library               | Recruiting film      |

**Room List View:**
- Room card: Color strip, icon, name, description, last updated, item count
- Tap → Transitions to room feed (state-based drill-in, no navigation)

**Room Feed View:**
- Grid of clips with type/date filters
- Filter: Type (Game/Clip/Practice), Date (All/This Week/This Month)
- Clip cards with search input, share buttons
- Visibility controlled by authority + visibility class

---

### 3.4 Library Tab

Saved/bookmarked content hub.

**Sections:** Saved Videos | Saved Stories | Saved Posts | Followed Creators

- Tap item → View/play content
- Swipe/menu → Remove from library

---

## 4. Organization Tab — 6 Universal Tabs

| Position | Tab        | Sports Implementation     |
|----------|-----------|---------------------------|
| 1        | Program   | `SportsProgram`           |
| 2        | People    | `SportsPeople`            |
| 3        | Finance   | `SportsFinance`           |
| 4        | Compliance| `SportsCompliance`        |
| 5        | Facilities| `SportsFacilities`        |
| 6        | Ledger    | `SportsLedger`            |

---

### 4.1 Program Tab

8-block single-scroll view:

1. **Header:** Team name + level indicator
2. **Team Rating:** Overall KR + color band label
3. **Team System:** Selected offense/defense/tempo systems
4. **Recruiting Constraints:** Scholarship availability, NIL allocation
5. **Availability:** Player availability status (eligible, injured, redshirt, etc.)
6. **Schedule:** Next upcoming game + mini calendar
7. **Coach Ops Shortcuts:** 4 tappable drill-down buttons (Statistics, Game Plan, Simulation, Development)
8. **Data Coverage:** Statistics confidence level + last data refresh

**Interactions:**
- Next Game → Opens Game Plan page
- Coach Ops buttons → Drill-down to domain OS pages
- Player rows → Open Player Sheet

---

### 4.2 People Tab

- Coaches, players, and staff roster
- Filter/sort by role, position, status
- Tap person → Opens Player/Coach/Person Sheet

---

### 4.3 Finance Tab

- Scholarship allocations, NIL tracking
- Budget overview, spending by category
- Read-only for A2 (Assistant Coach)

---

### 4.4 Compliance Tab

- Eligibility status, violations, compliance alerts
- Documentation trail
- Read-only access

---

### 4.5 Facilities Tab

- Venue management, facility availability
- Event scheduling
- Read-only access

---

### 4.6 Ledger Tab

- Financial transaction history
- Scholarship/NIL transactions
- Read-only, append-only audit trail

---

## 5. Messages Tab — 3-Tab Inbox System

| Position | Tab   | Purpose                         |
|----------|------|---------------------------------|
| 1        | Inbox| Unread threads + mentions       |
| 2        | Rooms| Group channels + direct messages|
| 3        | Nexus| Escalation queue for coaching   |

---

### 5.1 Inbox Tab

- **Unread Threads:** Avatar, sender, preview, timestamp, unread badge
- **Mentions:** @-mention notifications
- Tap → Thread detail sheet (50% → 100% bottom sheet)
- Thread detail: Message history grouped by date + input composer
- Search: Filter by person name or message content

---

### 5.2 Rooms Tab

- **Sections:** Pinned Rooms | Program Rooms | Direct Messages
- Room rows: Color strip, icon, room name, description, member count, last message time
- Tap → Room thread sheet (messages, pinned banner, input)
- Room types: Program (group), Direct (1:1)

---

### 5.3 Nexus Tab

- Escalation queue for coaching decisions
- Displays pending Q&A escalations (e.g., "Request permission for lineup change")
- Status: Pending | Answered | Resolved
- Tap → Escalation answer sheet with response options
- Only A2+ roles can view/answer

---

## 6. Domain OS Screens (Drill-Down from Dashboard)

Accessed via Dashboard domain cards. Navigation uses state-based drill-down (no deep linking):
- Domain card press → `setDrillDown('stats' | 'game-plan' | 'simulation' | 'development')`
- Back button → `setDrillDown(null)` (return to dashboard)

---

### 6.1 Statistics Hub (4 Tabs)

**Purpose:** Team + player intelligence surfaces (read-only descriptive analytics)

| Tab       | Content                                                   |
|-----------|----------------------------------------------------------|
| Team      | Team rating, system identity, 7-cluster breakdown, conference comparison |
| Players   | Player leaderboard (sortable by roster/clusters), individual KR breakdown |
| Standings | Conference standings (sortable), top-25 nationwide        |
| Rankings  | Team rankings (conference/division/universal), top-25     |

**RBAC:** A2 can view all surfaces; cannot modify models.

---

### 6.2 Game Plan OS (9 Sections A–I)

**Purpose:** Pregame scout packet for opponent preparation.

| Section | Title                        | Content                                              |
|---------|------------------------------|------------------------------------------------------|
| A       | Opponent Offensive Identity  | System (offense, tempo), key scoring threats, actions |
| B       | Shot Profile                 | FG% by location, 3PT distribution, assisted vs unassisted |
| C       | Actions & Triggers           | Key offensive sets (PnR, post-ups, drive-and-kicks)  |
| D       | Opponent Defensive Identity  | System (defense, switching), coverage, personnel     |
| E       | Required Situations          | Late-game, fouled-out contingencies, zone looks      |
| F       | Leverage Plan                | High-percentage opportunities, weaknesses to exploit |
| G       | Rotation Board               | Opponent depth chart, key bench players              |
| H       | Player Cards                 | Top 3 threats with archetype, stats, KR, tendencies  |
| I       | Scout Confidence Gate        | Confidence % (color-coded), data tier, evidence      |

**Interactions:**
- Game selector (upcoming games dropdown)
- On-ball/off-ball defensive looks
- Situation filters (transition, half-court, etc.)
- Snapshot history (prior versions, timestamps, status: draft/in_review/locked)
- Share button
- Regenerate → Routes to Nexus

**RBAC:** Read-only for A2; cannot lock/override.

---

### 6.3 Simulation OS (7 Blocks)

**Purpose:** Pregame predictive simulation output (read-only execution view).

| Block | Title              | Content                                              |
|-------|--------------------|------------------------------------------------------|
| 1     | Game Header        | vs Opponent, home/away, date/time                    |
| 2     | Confidence Gate    | % (color-coded), data tier label                     |
| 3     | Base Simulation    | Win %, margin, PGIS, TGIS                            |
| 4     | Top Drivers        | 3 key factors affecting outcome                      |
| 5     | Scenario Comparison| Base vs. Foul Trouble vs. Hot/Cold Shooting          |
| 6     | Lineup Lens        | Position-by-position KR matchup breakdown            |
| 7     | Snapshot History   | Prior simulation runs (timestamp, confidence, status)|

**Confidence Tiers:** Stats Only → Low Conf → Med Conf → High Conf → Model Locked

**RBAC:** Read-only; cannot modify constraints or override confidence.

---

### 6.4 Development OS (9 Blocks)

**Purpose:** Player/team development planning (execution-focused).

| Block | Title                  | Content                                          |
|-------|------------------------|--------------------------------------------------|
| 1     | Team Priorities        | High-priority skill areas, confidence status     |
| 2     | Player Plans           | Individual development paths                     |
| 3     | Weekly Non-Negotiables | Mandatory skill/drills for the week              |
| 4     | Current Week's Plan    | Session blocks (date, time, focus, duration, coach)|
| 5     | Position Group Board   | By-position status (achieved/progressing/needs-work)|
| 6     | Evidence Queue         | Submitted evidence pending review                |
| 7     | Alerts & Decisions     | Regression, injury, breakout, milestone alerts   |
| 8     | Progress Snapshot      | Confidence % by player, progress tracker         |
| 9     | Coaching Notes v1.1    | Coach reflection notes (future feature)          |

**RBAC:** Can view plans, assign tasks, submit evidence; cannot modify constraints, delete snapshots.

---

## 7. Entity Sheets (Global Interactive Cards)

Three universal bottom sheets (50% → 100%, `useModal=true`):

---

### 7.1 Player Sheet

**Header:** Name, number, position, team, status badge, archetype

**Sticky Rating Strip:** KR (color-coded), tier label, level tag, clusters preview

**5 Tabs:**

| Tab       | Content                                                    |
|-----------|------------------------------------------------------------|
| Bio       | Physical info (height, weight), birthday, hometown, bio    |
| Ratings   | 7 clusters with sub-scores; badges (Bronze/Silver/Gold)    |
| Stats     | Season stats (PPG, RPG, APG), game log, comparables        |
| Recruiting| Status, priority, fit %, next step, contact log            |
| Notes     | Coach notes, development priorities, flag alerts           |

**7 Rating Clusters:** Shooting | Finishing | Playmaking | On-Ball D | Team D | Rebounding | Physical

---

### 7.2 Team Sheet

**Header:** Team name, record, level/conference, KR

**Sticky Rating Strip:** Team KR, OFF/DEF KR, systems

**4 Tabs:**

| Tab      | Content                                                    |
|----------|------------------------------------------------------------|
| Overview | System identity, key stats (pace, 3PT%, Def Eff), conference standing |
| Roster   | Sortable by lens (KR, shooting, finishing, etc.); rotation + bench |
| Stats    | Team stat leaders (PPG, RPG, APG), season aggregates       |
| Video    | Film highlights, recent game film                          |

---

### 7.3 Coach Sheet

**Header:** Coach name, title, tenure

**3 Tabs:**

| Tab       | Content                                    |
|-----------|--------------------------------------------|
| Bio       | Background, education, bio                 |
| Teams     | Coaching history (schools, years, results) |
| Recruiting| Recruits coached                           |

---

## 8. KR (Kelvin Rating) Display System

Universal 0–100 scale applied across all competition levels.

### 10-Band Color Scale

| Range  | Label               | Color              |
|--------|--------------------|--------------------|
| 97–100 | Elite/Transcendent | #1D9BF0 (Blue)    |
| 94–96  | Franchise Anchor   | #A1A1AA (Silver)   |
| 90–93  | High-Impact        | #1D9BF0 (Blue)    |
| 86–89  | Solid Starter      | #1D9BF0 (Blue)    |
| 82–85  | Trusted Rotation   | #1D9BF0 (Blue)    |
| 78–81  | Reliable Bench     | #22C55E (Green)    |
| 74–77  | Situational        | #F59E0B (Amber)    |
| 70–73  | Limited            | #F59E0B (Amber)    |
| 66–69  | Fringe/Project     | #EF4444 (Red)      |
| 0–65   | Below Viability    | #A1A1AA (Gray)     |

### Level-Aware Tier Labels

Labels adapt per competition level. Example for NCAA D1 High Major:
- NPOY / Transcendent → First Team All-American → All-Conference → Projected Starter → Rotation Player → Situational → Practice Player → Roster Depth → Below Level

### Badge System

| Tier   | Threshold | Boost | Max Count |
|--------|-----------|-------|-----------|
| Gold   | ≥97       | +10   | 1 per player |
| Silver | ≥94       | +6    | 3 per player |
| Bronze | ≥90       | +3    | Unlimited |

Caps: +12 per component, +3.5 overall KR boost.

---

## 9. National Player Pool

Searchable database of all eligible players across 9 competition levels.

**Levels:** NCAA D1 (HM/MM/LM) | NCAA D2 | NCAA D3 | NAIA | NJCAA D1/D2/D3 | CCCAA | USCAA

**Pool Features:**
- Search/filter by level, division, position, KR range
- Columns: Player name, KR, position, height, team, stats (PPG/RPG/APG)
- Add-to-board functionality (A2+ roles)
- Tap player → Player Sheet

---

## 10. Sports RBAC

### Role Hierarchy (R0–R13)

| Level | Role                    | Access Scope                    |
|-------|------------------------|---------------------------------|
| R0    | Head Coach             | Full access                     |
| R1    | Associate Head Coach   | Full access                     |
| R2    | Assistant Coach (A2)   | Program-level execution         |
| R3–R4 | Assistant Coach (A1)  | Limited execution               |
| R5    | Assistant Coach (Ltd)  | No game-plan/simulation/recruiting |
| R6    | Recruiting Coordinator | Recruiting-focused              |
| R7    | Video Coordinator      | Video/film only                 |
| R8    | Strength Coach         | Development-focused             |
| R9    | Sports Science         | No game-plan/simulation         |
| R10   | Medical Staff          | Medical scope only              |
| R11   | Administrative         | Administrative scope            |
| R12   | Player Services        | Player-facing only              |
| R13   | Operations Staff       | Operations scope                |

### Visibility Classes

| Class | Scope              | Example Content                   |
|-------|-------------------|-----------------------------------|
| V0    | Public            | Published game film, public stats |
| V1    | Organization      | Internal communications           |
| V2    | Program           | Practice film, scouting reports   |
| V3    | Program + Recruit | Recruiting-tagged content         |

### Authority Levels

| Level | Capability                                       |
|-------|--------------------------------------------------|
| A0    | View only                                        |
| A1    | View + limited edit                              |
| A2    | Execution-level (assign, update, request)        |
| A3    | Management-level (override, lock, delete old)    |

---

## 11. Key Data Sources

| Data Source          | File                        | Content                          |
|---------------------|-----------------------------|----------------------------------|
| Team/Schedule       | `data/fmu.ts`               | Carroll College roster, games, standings |
| National Pool       | `data/national-pool.ts`     | 20K+ players across 9 levels     |
| Game Plan           | `data/game-plan-v2.ts`      | Scout packets (Sections A–I)     |
| Simulation          | `data/mock-simulation-v2.ts`| Sim outputs, scenarios, drivers  |
| Development         | `data/mock-development-v2.ts`| Plans, evidence, progress        |
| KR Display          | `utils/kr-display.ts`       | 10-band scale, tier labels       |
| Sports RBAC         | `utils/sports-rbac.ts`      | Role matrix, domain gates        |
| Entity Sheets       | `utils/global-entity-sheets.ts`| Sheet openers (player, team, coach)|

---

## 12. File Structure

```
components/
├── sports-explore/
│   └── sports-explore-page-v2.tsx    — Explore grid
├── sports-film-room/
│   └── sports-film-room-v2.tsx       — Film Room (5 rooms)
├── entity-sheets/
│   ├── player-sheet.tsx              — Player card (5 tabs)
│   ├── team-sheet.tsx                — Team card (4 tabs)
│   └── coach-sheet.tsx               — Coach card (3 tabs)
├── organization/
│   ├── sports-program.tsx            — Program tab
│   ├── sports-people.tsx             — People tab
│   ├── sports-finance.tsx            — Finance tab
│   ├── sports-compliance.tsx         — Compliance tab
│   ├── sports-facilities.tsx         — Facilities tab
│   └── sports-ledger.tsx             — Ledger tab
├── video-feed/
│   └── feed-post.tsx                 — Feed post component
data/
├── fmu.ts                            — Carroll College mock data
├── national-pool.ts                  — Player pool adapter
├── game-plan-v2.ts                   — Game plan scout data
├── mock-simulation-v2.ts             — Simulation data
└── mock-development-v2.ts            — Development data
utils/
├── sports-rbac.ts                    — RBAC role matrix
├── kr-display.ts                     — KR color/tier display
└── global-entity-sheets.ts           — Sheet openers
```
