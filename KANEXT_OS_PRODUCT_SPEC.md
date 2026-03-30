# KaNeXT OS — Complete Product Specification & System Explanation

**KaNeXT OS v1 — February 19, 2026**
**Author: Claude (Opus 4.6), commissioned by Sammy Kalejaiye**

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [What Is KaNeXT OS?](#2-what-is-kanext-os)
3. [Platform & Technical Architecture](#3-platform--technical-architecture)
4. [The Five Modes](#4-the-five-modes)
5. [Navigation & App Shell](#5-navigation--app-shell)
6. [Tab 1: Home — Per-Mode Dashboard](#6-tab-1-home--per-mode-dashboard)
7. [Tab 2: Media — Content & Film](#7-tab-2-media--content--film)
8. [Tab 3: Nexus — AI Command Surface](#8-tab-3-nexus--ai-command-surface)
9. [Tab 4: Messages — Unified Communications](#9-tab-4-messages--unified-communications)
10. [Tab 5: Organization — Operational Hub](#10-tab-5-organization--operational-hub)
11. [Identity, Auth & Context Switching](#11-identity-auth--context-switching)
12. [Role-Based Access Control (RBAC)](#12-role-based-access-control-rbac)
13. [The KaNeXT Rating (KR) System](#13-the-kanext-rating-kr-system)
14. [National Player Pool & Data Pipeline](#14-national-player-pool--data-pipeline)
15. [Recruiting Intelligence](#15-recruiting-intelligence)
16. [Simulation Engine](#16-simulation-engine)
17. [Game Operations](#17-game-operations)
18. [Entity Sheet System](#18-entity-sheet-system)
19. [Bottom Sheet & UI System](#19-bottom-sheet--ui-system)
20. [Data Layer & Mock Architecture](#20-data-layer--mock-architecture)
21. [Backend Services](#21-backend-services)
22. [Canonical Spec Library](#22-canonical-spec-library)
23. [Current Status & Roadmap](#23-current-status--roadmap)

---

## 1. Executive Summary

KaNeXT OS is a cross-platform mobile operating system for organizations. It is not a single-purpose app — it is a universal institutional shell that adapts to five completely different organizational domains through a single codebase, a shared navigation structure, and a unified AI layer called Nexus.

One person — currently Sammy Kalejaiye — can manage a basketball program, run a startup, oversee a church, administrate a university, and operate a racing league, all from the same app, switching between modes with a single tap.

The system is built on three foundational beliefs:

1. **Every organization is structurally similar.** They all have people, programs, finances, compliance, facilities, and communications. The differences are in vocabulary and domain logic, not in structure.

2. **AI should be embedded, not bolted on.** Nexus is not a chatbot in a sidebar. It is the central command surface — it can evaluate players, simulate games, route messages, manage recruiting boards, execute governed actions, and reason across organizational contexts.

3. **One shell, many lenses.** The same UI primitives, the same bottom sheet system, the same tab bar, the same pager — all of it renders differently based on your mode, your role, and your access tier. There is no separate "coach app" and "fan app." There is one app with role-aware rendering.

**Primary Instantiation (Sports Mode):**
- **Organization:** Florida Memorial University (FMU)
- **Program:** FMU Lions Men's Basketball
- **Conference:** Sun Conference (NAIA)
- **Role:** AD + Head Coach / GM — full control (R1)

**Secondary Instantiations:**
- **Enterprise:** KaNeXT Inc. (Founder/CEO OS)
- **Church:** International Christian Center Los Angeles (ICCLA)
- **Education:** Florida Memorial University (President lens)
- **Competition:** K-1 Hypercar Racing League (Owner/Commissioner)

---

## 2. What Is KaNeXT OS?

### The Problem

Organizations today use dozens of disconnected tools. A college basketball coach might use:
- Hudl for film
- Teamworks for scheduling
- AMS for compliance
- Excel for recruiting boards
- WhatsApp for team communication
- Synergy for analytics
- A separate portal for NIL management

None of these systems talk to each other. None of them have AI. None of them understand the *context* of what you're trying to do. The coach has to be the integration layer — manually moving information between systems, switching between apps, and losing time to friction.

Now multiply that by five: the same person might also be running a business, leading a church ministry, sitting on a university board, and managing a racing team. Each of those domains has its own fragmented tool ecosystem.

### The Solution

KaNeXT OS replaces all of it with a single surface. The key insight is that organizational operations are *structurally isomorphic* — they all decompose into the same primitives:

| Primitive | Sports | Church | Business | Education | Competition |
|-----------|--------|--------|----------|-----------|-------------|
| **People** | Roster, Staff, Recruits | Congregation, Volunteers, Visitors | Team, Investors, Advisors | Faculty, Students, Staff | Drivers, Crew, Officials |
| **Program** | Season, Games, Practice | Service Cycle, Ministries | Fiscal Year, Quarters | Terms, Semesters | Series, Rounds |
| **Finance** | Budget, Scholarships, NIL | Tithes, Donations, Budget | Revenue, Burn Rate, Fundraising | Tuition, Grants, Endowment | Entry Fees, Sponsorships, Purse |
| **Compliance** | NCAA/NAIA Rules, Eligibility | Bylaws, Governance | SEC Filings, Contracts | Accreditation, Title IX | FIA/Series Rules, Safety |
| **Communications** | Team Rooms, Recruit DMs | Ministry Rooms, Prayer Requests | Deal Rooms, Board Updates | Department Channels, Advising | Paddock Chat, Race Director |
| **Content** | Game Film, Practice Tape, Scouting | Sermons, Ministry Media | Pitch Decks, Data Room | Lectures, Research, Campus Media | Race Footage, Onboard Camera |

KaNeXT OS provides a universal shell for these primitives and lets each mode fill them with domain-specific data, vocabulary, and logic.

### What Makes It Different

**1. Nexus — Contextual AI, Not a Chatbot**
Nexus is not ChatGPT in a sidebar. It understands your organizational context — your role, your mode, your active program, your roster, your recruiting board, your game schedule, your financial position. When you ask "Who should I offer next?", Nexus doesn't hallucinate — it queries a real database of 9,000+ players, runs KR computations, evaluates system fit against your offensive/defensive scheme, checks scholarship capacity, and returns actionable intelligence with real data.

**2. The KaNeXT Rating (KR) — A Universal Evaluation Currency**
KR is a proprietary 0-100 rating system that evaluates players across 7 performance clusters (Shooting, Finishing, Playmaking, Perimeter Defense, Interior Defense, Rebounding, Frame), normalizes across 13 competitive levels (from high school to professional), derives positional archetypes, computes badges, and produces team-level system identity scores. It is computed from real box-score data scraped from PrestoSports across NJCAA (D1/D2/D3), NAIA, and CCCAA — currently covering ~694 teams and ~8,238 players.

**3. Five Modes, One Identity**
You are always *you*. Your identity persists across modes. Your access tier (Founder, CoFounder, Investor, Public) is global. Your role within each mode is contextual. Switching from "Head Coach at FMU" to "CEO of KaNeXT" to "Senior Pastor at ICCLA" takes one tap in the Avatar Drawer — the entire app re-renders with the new mode's data, vocabulary, and RBAC lens.

---

## 3. Platform & Technical Architecture

### Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Expo SDK 54 + React Native 0.81 |
| **Language** | TypeScript (strict mode) |
| **Routing** | Expo Router v6 (file-based, typed routes) |
| **Navigation** | React Navigation v7 (Stack + Bottom Tabs) |
| **State** | React Context (7 providers: App, Auth, Nexus, Business, Church, Education, Competition) |
| **Persistence** | AsyncStorage (session, mode, program context, active view, board state) |
| **AI** | OpenAI GPT-4o (via `openai` npm package, 1024 max tokens, 0.7 temperature) |
| **Bottom Sheets** | @gorhom/bottom-sheet v5 (universal wrapper, 2 snap points) |
| **Animation** | react-native-reanimated v4 |
| **Paging** | react-native-pager-view v6.9 (all swipeable tab surfaces) |
| **Video** | expo-av (autoplay/loop hero cards, film room) |
| **Voice** | expo-speech-recognition v3 (Nexus voice mode) |
| **Haptics** | expo-haptics (every interactive element) |
| **Icons** | SF Symbols (iOS native) / MaterialIcons (Android/web fallback) |
| **Gestures** | react-native-gesture-handler v2.28 |
| **Backend DB** | PostgreSQL (player pool: 19 tables, localhost:5432) |
| **Scraper** | Python (httpx, beautifulsoup4, psycopg) |
| **KR Engine** | Python (8-module computation pipeline) |

### Targets
- iOS (primary), Android, Web
- Portrait orientation locked
- Dark theme forced (luxury control room aesthetic)

### Experiments Enabled
- `typedRoutes: true` — compile-time route safety
- `reactCompiler: true` — React Compiler optimizations
- `newArchEnabled: true` — React Native New Architecture (Fabric + TurboModules)

### Project Structure

```
kanext-os/
├── app/                      # Screens & navigation (file-based routing)
│   ├── _layout.tsx           # Root: providers, global overlays, splash
│   ├── (tabs)/               # 5 bottom tabs
│   │   ├── _layout.tsx       # Tab bar config (5 tabs + hidden routes)
│   │   ├── index.tsx         # Home (mode dispatcher → 5 home components)
│   │   ├── media/            # Media tab (4-page PagerView)
│   │   ├── nexus.tsx         # Nexus AI surface
│   │   ├── activity/         # Messages V3 (3-tab PagerView)
│   │   └── organization/     # Organization hub (6-tab universal + deep routes)
│   ├── coach/                # Sports push screens (20+ screens)
│   ├── login.tsx             # Auth screen
│   ├── settings.tsx          # Settings & privacy
│   ├── profile.tsx           # Read-only identity mirror
│   └── video.tsx             # Video player (placeholder)
├── components/               # ~200+ reusable components
│   ├── ui/                   # Primitives (BottomSheet, PagerTabBar, EdgeHold, etc.)
│   ├── entity-sheets/        # 8 entity preview sheets
│   ├── nexus/                # 25+ Nexus sub-components
│   ├── roster/               # Roster CRM components
│   ├── recruiting/           # Recruiting V2 components
│   ├── calendar/             # Calendar V2 components
│   ├── schedule/             # Calendar hub + day/week/month views
│   ├── dashboard/            # Dashboard block renderers
│   ├── messages/             # Messages V3 components
│   ├── media/                # Media cards and headers
│   ├── organization/         # 50+ mode-specific org tab components
│   ├── simulation/           # Simulation engine UI
│   ├── game-plan/            # Game plan OS components
│   ├── stats/                # Statistics hub
│   ├── development/          # Player development OS
│   ├── film-room/            # Film room per mode
│   ├── depth-chart/          # System-aware depth chart
│   ├── sports-explore/       # Sports explore/discovery
│   ├── biz-home/             # Business home sub-views
│   ├── church-home/          # Church home sub-views
│   ├── edu-home/             # Education home sub-views
│   ├── competition/          # Competition mode components
│   └── ...                   # (library, people, finance, operations, rooms, etc.)
├── constants/                # Theme, colors, fonts, copy
│   ├── theme.ts              # Full design system (colors, spacing, borders, fonts)
│   └── nexus-copy.ts         # Governed chat copy (receipts, confirmations, refusals)
├── context/                  # React Context providers
│   ├── app-context.tsx       # Global: mode, org, role, cycle, active view
│   ├── auth-context.tsx      # Auth session, tier, sign-in
│   ├── nexus-context.tsx     # AI: conversations, messages, GPT integration
│   ├── business-context.tsx  # Business: companies, entities, role lens
│   ├── church-context.tsx    # Church: role lens
│   ├── education-context.tsx # Education: role lens
│   └── competition-context.tsx # Competition: series, role lens
├── hooks/                    # Custom React hooks
│   ├── use-color-scheme.ts   # Hardcoded dark mode
│   ├── use-theme-color.ts    # Theme color resolver
│   └── use-speech-recognition.ts # Voice input with audio levels
├── utils/                    # ~30+ utility modules
│   ├── sports-rbac.ts        # Sports R1-R5 visibility matrices
│   ├── church-rbac.ts        # Church C1-C5
│   ├── business-rbac.ts      # Business B1-B5
│   ├── education-rbac.ts     # Education E1-E5
│   ├── competition-rbac.ts   # Competition C1-C4
│   ├── unified-rbac.ts       # Cross-mode RBAC dispatcher
│   ├── kr-display.ts         # Universal KR colors, tiers, labels
│   ├── player-badges.ts      # Badge computation (Gold/Silver/Bronze)
│   ├── fit-kr.ts             # System fit computation, archetypes, lineup ratings
│   ├── nexus-player-query.ts # Natural language → player search
│   ├── nexus-actions.ts      # Intent classification (22 types, local regex)
│   ├── nexus-action-engine.ts # Governed action execution pipeline
│   ├── nexus-rbac.ts         # 9-level capability matrix for AI actions
│   ├── openai.ts             # GPT-4o integration with context-aware prompting
│   ├── global-entity-sheets.ts # Singleton controller for 8 entity types
│   ├── global-*.ts           # 12+ global controllers (drawer, voice, finder, etc.)
│   ├── active-view.ts        # View builder + persistence
│   └── ...
├── data/                     # Mock data + real data adapters
│   ├── national-pool.ts      # Real player pool adapter (9K+ players)
│   ├── national-pool.json    # Exported from PostgreSQL
│   ├── fmu.ts                # FMU Lions seeded data (games, roster, stats, etc.)
│   ├── roster-data.ts        # FMU roster: clusters, physicals, subclusters, meta
│   ├── views.ts              # 5 canonical views (one per mode)
│   ├── mock-memberships.ts   # V2 orgs, memberships, programs, seasons
│   ├── rbca.ts               # RBCA tiers, badges, permissions, fast actions
│   ├── recruitingBoard.ts    # 20 recruits, 8-stage CRM pipeline
│   └── ...                   # 50+ mock data files across all modes
├── services/                 # Backend services
│   └── player-pool/
│       ├── scraper/          # Python PrestoSports scraper (NJCAA/NAIA/CCCAA)
│       ├── engine/           # Python KR computation engine (8 modules)
│       └── export_to_json.py # PostgreSQL → JSON export
├── spec/                     # Product specification documents
│   ├── KaNeXT OS — Complete Product Specification.txt
│   └── canonical/            # 47+ engine spec documents (player eval, team eval,
│                             #   scouting, simulation, development)
└── assets/                   # Images, icons, splash screens
```

### Design System

The visual language is "Luxury Control Room" — jet black backgrounds, monochrome authority, minimal color. Color is used precisely for data, not decoration.

```
Background:      #000000 (pure black)
Card:            #181616 (carbon)
Text Primary:    #DDDDDD (smoke)
Text Secondary:  #8F8F8F (ash)
Text Tertiary:   #424242 (graphite)
Border:          rgba(255,255,255,0.06)
Success:         #22C55E
Warning:         #F59E0B
Error:           #EF4444
Brand Accent:    #6AA9FF (ice blue — "precision")
```

Each mode has a tab bar accent color:
- Sports: `#1E40AF` (royal blue)
- Business: `#7C3AED` (purple)
- Church: `#FBBF24` (amber/gold)
- Education: `#14B8A6` (teal)
- Competition: `#FF5555` (red)

---

## 4. The Five Modes

### Sports Mode — Florida Memorial University Lions

The most developed mode. A complete coaching operating system for NAIA men's basketball.

**Organization:** Florida Memorial University
**Program:** FMU Lions Men's Basketball
**Conference:** Sun Conference (NAIA)
**Season:** 2025-26
**Role:** AD + Head Coach / GM (R1 — full control)

**What's built:**
- Full 17-player roster with real cluster ratings, subclusters, physicals, KR scores, archetypes
- Real game data (schedule, scores, box scores, play-by-play, leaders)
- System-aware depth chart with fit KR computation
- 20-recruit CRM board with 8-stage pipeline
- Real national player pool (9K+ players from NJCAA/NAIA/CCCAA)
- Game plan OS (7-tab: Overview, Offense, Defense, Matchups, Rotation, Scout, Staff)
- Simulation engine (win probability, box score projections, confidence scoring)
- Statistics hub (6-tab: Dashboard, Splits, Lineups, Play Types, Game Log, Players)
- Development OS (6-tab: Overview, Weekly Plan, Players, Drills, Evidence, Transfer)
- Film room (3-view: Game Film, Practice Film, Scouting)
- Calendar (4-view: Agenda, Games, Standings, News)
- Full organization V2/V3 (6 V3 tabs with 7-10 V2 sub-tabs each, RBAC-gated)
- KR computation engine running against real scraped data
- Nexus AI with player data injection and governed actions

### Enterprise Mode — KaNeXT Inc.

A founder/CEO operating system for running a startup.

**Organization:** KaNeXT Inc.
**Role:** Founder/CEO (B1 — full control)

**What's built:**
- Dashboard with video hero, next event, commerce row, traction metrics, pipeline summary
- Deals hub (3-view: Pipeline, Contacts, Activity)
- Vault (3-view: Cap Table, Folders, Proof Events)
- Calendar (3-view: Events, Milestones, News)
- Entity scope bar for switching between business entities (HoldCo, OpsCo, IP, etc.)
- Full organization V2/V3 (6 V3 tabs: Program, People, Finance, Compliance, Facilities, Ledger)
- Business-specific RBAC (B1-B5: Founder → Prospective Acquirer)
- Document gating by access tier and role

### Church Mode — ICCLA

A pastoral operating system for church administration.

**Organization:** International Christian Center Los Angeles
**Role:** Senior Pastor (C1 — full control)

**What's built:**
- Dashboard with sermon video hero, next service, commerce row, growth metrics, active campaigns
- Ministries hub (3-view: Active Ministries, Leaders, Schedule)
- Connect hub (3-view: Groups, Pipeline, Visitors)
- Calendar (3-view: Services, Impact, News)
- Full organization V2/V3 (6 V3 tabs: Program, People, Finance, Compliance, Facilities, Ledger)
- Church-specific RBAC (C1-C5: Senior Pastor → Visitor)
- Person entity sheets with ministry pills and status indicators

### Education Mode — FMU (Academic Lens)

A university president's operating system.

**Organization:** Florida Memorial University
**Role:** President (E1 — full control)

**What's built:**
- Dashboard with campus video hero, next event, commerce row, enrollment data, academic metrics
- Admissions hub (3-view: Pipeline, Programs, Outreach)
- Faculty hub (3-view: Directory, Departments, Senate)
- Calendar (3-view: Events, Metrics, News)
- Full organization V2/V3 (6 V3 tabs: Program, People, Finance, Compliance, Facilities, Ledger)
- Education-specific RBAC (E1-E5: President → Public)

### Competition Mode — K-1 Hypercar Racing League

A league owner/commissioner operating system for a racing series.

**Organization:** K-1 Hypercar Racing League
**Role:** League Owner + Commissioner (C1 — full control)

**What's built:**
- Dashboard with race video hero, next round, commerce row, quick standings (top 3 drivers)
- Calendar (3-view: Races, Standings, News)
- Grid hub (3-view: Teams, Drivers, Crew)
- Entries hub (3-view: Confirmed, Compliance, Wildcards)
- Competition-specific entity sheets (driver cards with points/wins/podiums, crew cards with pit scores)
- Full organization V2/V3 (6 V3 tabs: Program, People, Finance, Compliance, Facilities, Ledger)

---

## 5. Navigation & App Shell

### Bottom Tab Bar

Five tabs, glyph icons only (no text labels). Fixed order across all modes. Dark background (`#000`).

| Position | Tab | Icon | Special Gestures |
|----------|-----|------|-----------------|
| 1 | **Home** | `house.fill` | Long-press → Avatar Drawer; Tap → KX flash + pager reset |
| 2 | **Media** | `play.rectangle.fill` | — |
| 3 | **Nexus** | Custom logo image | Long-press → Search Overlay; Double-tap → Split Nexus |
| 4 | **Messages** | `bubble.left.and.bubble.right.fill` | — |
| 5 | **Organization** | `building.2.fill` | Long-press → Mode Switcher |

Every tab tap triggers a `KXTransition` — a 200ms full-screen branded flash with the KX wordmark, creating a premium feel on every navigation.

### Top Bar

Present on all screens:
- **Left:** Avatar button (opens Avatar Drawer)
- **Center:** "KaNeXT" wordmark
- **Right:** Search icon (opens Universal Finder)

### Avatar Drawer

The left-slide global control plane. Width: min(300px, 82% screen). Contains:

1. **Identity Header** — display name, access tier badge, email
2. **Current Context Block** — active org, role badge, scope line, season chip
3. **Mode Switch Row** — 5 mode chips (Sports, Church, Competition, Business, Education) with icons
4. **My Views** — filtered by current mode, each view shows org name, role, scope
5. **Permissions Panel** — collapsible list of RBCA-tier-derived permissions
6. **Fast Actions** — 4 contextual shortcuts per membership
7. **Global Items** — Settings, Profile, Help, Sign Out

### KX Transition

A micro-interaction that fires on every tab switch. Full-screen overlay with:
- Black background, KX wordmark centered
- Fade in (50ms) → hold (100ms) → fade out (50ms)
- `pointerEvents="none"` — non-blocking
- Spring animation, scale pulse

This creates a "channel change" feeling — you're not navigating between screens, you're switching between operational surfaces.

### Mode Switcher Overlay

Triggered by long-press on the Organization tab. A floating popup showing the 4 other modes as colored icon circles. Tap one to switch modes instantly.

### Universal Finder

A Spotlight-style full-screen search overlay. Searches across players, recruits, games, clips, posts. Results grouped by category with type-colored badges.

---

## 6. Tab 1: Home — Per-Mode Dashboard

The Home tab dispatches to a completely different component per mode. Each mode uses a `PagerView` + `PagedTabBar` layout with swipeable pages.

### Sports Home — 4 Header Pills

| Pill | Component | Description |
|------|-----------|-------------|
| **Dashboard** | Inline renderer | Video hero + Next Game + Commerce Row + 5 domain drill-down cards |
| **Roster** | `RosterContent` | 3-view CRM roster (List, System/Depth Chart, Cards) |
| **Calendar** | `SportsCalendarV2` | 4-sub-pill: Agenda, Games, Standings, News |
| **Recruiting** | `PlayerPoolContentV2` | 3-segment: Board, Database (9K+ real), Portal |

**Dashboard breakdown:**
- **Video Hero Card** — 16:9 aspect ratio, `LinearGradient` overlay, FMU seal watermark, LIVE/NEXT/RECAP/FILM badge, play button. Taps into video player.
- **Next Game Card** — FMU logo vs opponent circle, date, venue, game type (CONF/NON-CONF), action buttons (Buy Tickets, Watch/Live Stats). Opponent logo tappable → `openTeamCard()`.
- **Commerce Row** — 3 cards: Buy Tickets, Team Store, Support
- **Domain Cards** — 5 remaining drill-down tiles:
  - Statistics → Full stats hub (6 tabs)
  - Game Plan → Game Plan OS (7 tabs)
  - Simulation → Simulation engine
  - Development → Development OS (6 tabs)
  - Alerts & Decisions → Action queue

Each domain card tap replaces the PagerView with a full-screen detail view with a back bar at top.

**RBAC gating:** R2/R4/R5 roles hide Game Plan, Simulation, and Development cards. Recruiting pill hidden from R2/R5.

**System KR:** The Dashboard computes live team KR based on the coach's selected offensive and defensive systems. A deterministic hash modifier (±7) is applied per system combination, so changing systems visibly shifts the team's rating.

### Business Home — 4 Pills
Dashboard | Deals | Vault | Calendar

### Church Home — 4 Pills
Dashboard | Ministries | Connect | Calendar

### Education Home — 4 Pills
Dashboard | Admissions | Faculty | Calendar

### Competition Home — 4 Pills
Dashboard | Calendar | Grid | Entries

Each mode's Dashboard follows the same block pattern: Video Hero → Next Event → Commerce Row → Mode-specific KPIs → Domain content.

---

## 7. Tab 2: Media — Content & Film

4-page `PagerView`: **Feed | Explore | Room | Library**

The Room label changes per mode:
- Sports: "Film Room"
- Church: "Ministry Rooms"
- Education: "Classrooms"
- Business: "Workspaces"
- Competition: "Paddock"

### Feed
- Stories row with gradient ring avatars (Instagram-style)
- Vertical `FlatList` of `FeedPost` cards
- Each post: 16:9 media card with type badge (REEL/VIDEO/CLIP), duration, view count, caption, like/comment/share/save actions

### Explore
Sports mode gets `SportsExplorePageV2` — an RBAC-gated shelf-based discovery page with:
- Search bar
- Type/Access filter chips
- Up to 8 horizontal shelves of content (filtered by role visibility)
- Trending section

Other modes get `ModeExplorePageV2` with equivalent mode-specific content.

### Film Room (Sports)
3-tab pill nav: **Game Film | Practice Film | Scouting**
- Game Film: recorded games with result badge, date, duration, clips count
- Practice Film: practice recordings organized by date
- Scouting: opponent film organized by team

### Library
Mode-aware saved content hub. 3 pills: **Saved | Downloads | History**. Sports mode gets additional RBAC-gated sections (film, game tape, scout packs).

---

## 8. Tab 3: Nexus — AI Command Surface

Nexus is the central nervous system of KaNeXT OS. It is a conversational AI interface powered by GPT-4o, but it is far more than a chatbot. It has:

1. **Organizational awareness** — knows your mode, role, org, program, season, roster, schedule, recruiting board, financial position
2. **Real data access** — queries a national pool of 9,000+ real players with KR scores, cluster ratings, archetypes, and statistics
3. **Governed actions** — can execute 22+ action types (create task, approve request, flag player, adjust budget, etc.) with RBAC gating and confirmation gates for high-impact actions
4. **Multiple conversation types** — Chat, Eval (player evaluation), Sim (simulation), Game Ops

### Architecture

```
User Message
    ↓
isPlayerRelatedQuery()? ──yes──→ extractFilters() → nationalPool.search() → formatPlayerForGPT()
    ↓ no                                                                            ↓
classifyIntent() ←──────────────────────────────────────────────────── inject [PLAYER DATA] block
    ↓                                                                              ↓
22 intent types (local regex, no GPT)                            buildSystemPrompt(context)
    ↓                                                                              ↓
processAction() → RBAC check → confirmation gate → execute → receipt         sendToGPT()
                                                                                   ↓
                                                                         parseGPTResponse()
                                                                                   ↓
                                                                    { cleanText, linkChips }
```

### Conversation Types

- **Chat** — General conversation with full organizational context
- **Eval** — Player evaluation mode. Nexus has access to the full KR intelligence pipeline.
- **Sim** — Simulation mode. Nexus can build and analyze game simulations.
- **Game Ops** — Real-time game operations mode. Triggered from the Home tab's Game Ops entry point.

### Panels & Overlays

Nexus has a rich panel system:

- **Conversations Panel** (left slide-in, 70% width) — All conversations, grouped by workspace, filterable by mode. Pinned conversations at top.
- **Program Context Drawer** (right slide-in) — Configure the AI's reasoning: offensive/defensive systems, cluster weights, position importance, bias settings. Persisted to AsyncStorage.
- **Roster Overlay** (right, full-height) — Official vs Sandbox roster, depth chart view, player management
- **Recruiting Overlay** (right, full-height) — Prospect targets, status tabs, position/division filters
- **Simulation Overlay** (right, full-height) — Detailed simulation results with drivers, player impact, box scores

### Voice Mode

Long-press on the Nexus tab activates voice mode. Full-screen overlay with:
- Animated circle responding to audio amplitude
- `expo-speech-recognition` with `interimResults: true`, `continuous: true`, `addsPunctuation: true`
- Audio level normalized from raw (-2 to 10) → 0-1
- Listening → Processing → Response states

### Search Overlay

Long-press on Nexus tab opens a quick query overlay. Auto-focused search + mic. Returns a compact card answer. Ephemeral — not saved as a conversation.

### Split Nexus

Double-tap on Nexus tab opens a bottom-half Nexus chat over the current screen (50% height). Drag-to-dismiss (80px threshold). Also ephemeral — has its own local state independent of the main Nexus context.

### Governed Actions

Nexus can execute organizational actions, not just answer questions. The pipeline:

1. **Intent Classification** (`nexus-actions.ts`) — 22 action types detected via local regex patterns. No GPT needed.
2. **RBAC Check** (`nexus-rbac.ts`) — 9 capability levels (C1_ask through C9_cross_context) mapped to roles via a 9×9 matrix
3. **Confirmation Gate** — 10 high-impact actions require explicit user confirmation before execution
4. **Execution** — Action executed against local state
5. **Receipt** — Rich receipt message inserted into conversation thread

Action types include: `create_task`, `create_request`, `post_room`, `approve`, `deny`, `escalate`, `generate_packet`, `add_to_board`, `remove_from_board`, `change_pipeline_stage`, `flag_player`, `create_calendar_event`, `update_scholarship`, `adjust_budget`, `send_dm`, and more.

### Mode-Specific Prompting

Each mode has a custom system prompt extension with:
- Mode-specific vocabulary
- Capability descriptions
- `[LINK:type:id:label]` token format for tappable links in responses
- Pool awareness prompt (player counts, methodology, data freshness)

---

## 9. Tab 4: Messages — Unified Communications

3-tab universal PagerView: **Inbox | Rooms | Nexus Queue**

Identical structure across all 5 modes; only seeded data changes per mode.

### Inbox
- `InboxListV3` — threaded direct messages
- Sort: pinned first → requests → unread → read → newest
- Each row: avatar, name, role badge, preview text, timestamp, unread count
- Request threads have accept/decline action buttons
- Tap opens thread detail in a bottom sheet

### Rooms
- `RoomsListV3` — group communication channels
- Each room: name, initials circle, member count, last message, timestamp, unread count
- Locked rooms show lock icon
- Announcement rooms have distinct styling

### Nexus Queue
- `NexusQueueV3` — AI escalations that need human response
- Badge count on the tab pill
- Each escalation: asker name, role, question, viewing context, timestamp
- Two statuses: `unanswered` / `answered`
- Tap opens answer sheet

### Thread Detail

Opens in a `BottomSheet` (50%/100%) with bubble-style chat UI. Messages rendered as conversation bubbles. Compose bar at bottom.

---

## 10. Tab 5: Organization — Operational Hub

The Organization tab is the most structurally complex surface. It provides deep operational management through a universal 6-tab layout that adapts per mode.

### Version Architecture

KaNeXT Organization uses two architectural layers:

- **V3 (Universal Shell):** The 6-tab top-level structure shared across all modes. This is the navigation skeleton.
- **V2 (Domain Deep-Dive):** The rich sub-tab components that render inside each V3 tab. These are mode-specific and contain 7-10 sub-tabs each.

V2 components nest inside V3 tabs — V3 is not a replacement for V2, it is the container.

### Universal 6 Tabs (V3 Architecture)

| Tab | Description |
|-----|-------------|
| **Program** | Identity, leadership, context, rules, calendar, assets |
| **People** | Directory, staff, athletes/members, onboarding, roles & access |
| **Finance** | Budget, spend, approvals, vendors, costs, reporting |
| **Compliance** | Controls, holds, deadlines, evidence, exceptions |
| **Facilities** | Venues, maintenance, scheduling, access control |
| **Ledger** | Payment rails, money movement, transactions, audit trail |

Each tab is a `PagerView` page within the universal `PagedTabBar + EdgeHoldAdvance` system. Each tab renders a mode-specific component:

- Sports: `SportsProgram/People/Finance/Compliance/Facilities/Ledger`
- Business: `BizProgram/People/Finance/Compliance/Facilities/Ledger`
- Church: `ChurchProgram/People/Finance/Compliance/Facilities/Ledger`
- Education: `EduProgram/People/Finance/Compliance/Facilities/Ledger`
- Competition: `CompProgram/People/Finance/Compliance/Facilities/Ledger`

### V2 Deep-Dive Architecture (Sports Example)

Under the V3 universal tabs, each mode has rich V2 sub-tab components. For Sports:

**Program V2 — 10 sub-tabs:**
Overview | Identity | Leadership | Context | Rules | Calendar | Decisions | Assets | Partners | Admin

**People V2 — 10 sub-tabs:**
Overview | Directory | Staff | Players | Recruits | Medical | Roles & Access | Onboarding | Contacts | Admin

**Finance V2 — 10 sub-tabs:**
Overview | Budget | Spend | Approvals | Vendors | Travel Spend | Roster Costs | Purchasing | Reporting | Settings

**Compliance V2 — 7 sub-tabs:**
Overview | Controls | Holds | Deadlines | Evidence | Exceptions | Admin

**Facilities V2 — 7 sub-tabs:**
Overview | Venues | Maintenance | Scheduling | Access Control | Equipment | Admin

**Ledger V2 — 7 sub-tabs:**
Now | Streams | Approvals | Exceptions | Audit | Disbursements | Settings

> **Note:** Operations content (tasks, travel, bookings, equipment, vendors, player services) lives inside the Program V3 tab. Payment Rails content lives inside the Ledger V3 tab. This keeps V3 at exactly 6 tabs while preserving full operational depth in V2.

### DrillMode Pattern

V2 components use a "drill mode" interaction:
1. **Default state:** Overview shows first. SubTabBar is hidden. An "Explore All Sections" bar appears at the bottom.
2. **Drill mode:** Tapping "Explore All Sections" reveals the SubTabBar and shows a "← Overview" back bar.
3. This prevents overwhelming new users with 7-10 sub-tabs immediately while giving power users full access.

### Organization Switcher

`OrgSwitcherSheet` — bottom sheet listing available organizations for the current mode. Tap to switch. Shows org name, subtitle, icon, and checkmark for current.

---

## 11. Identity, Auth & Context Switching

### Authentication

- Apple Sign-In, Google Sign-In, Email (placeholder)
- `AuthSession`: userId, displayName, email, provider, token, createdAt, tier
- `AccessTier`: Founder | CoFounder | Investor | Public
- Tier resolved from email + invite code system
- Session persisted to `kx:session` in AsyncStorage

Currently hardcoded as demo user: **Sammy Kalejaiye** (`sammy@kanext.com`, Founder tier).

### Active View System

The `ActiveView` is the core context object that determines what the entire app renders:

```typescript
interface ActiveView {
  view_id: string;           // Unique view identifier
  mode: Mode;                // sports | business | church | education | competition
  org_id: string;            // Organization
  org_name: string;          // Display name
  membership_id: string;     // User's membership in this org
  role_label: string;        // Human-readable role
  rbac_level: number;        // 1-5 tier
  scope_type: string;        // Scope breadth
  scope_id: string;          // Scope identifier
  scope_name: string;        // Scope display name
  season_id: string;         // Active season/cycle
  season_label: string;      // "2025-26", "FY2026", etc.
  derived_role_badge: string; // "AD · Head Coach · GM"
}
```

There are 5 canonical views (one per mode), defined in `data/views.ts`:

| View | Mode | Org | Role |
|------|------|-----|------|
| `v_sports_fmu` | Sports | FMU Lions | AD + Head Coach/GM |
| `v_church_iccla` | Church | ICCLA (LA) | Senior Pastor |
| `v_comp_k1` | Competition | K-1 Hypercar | Owner + Commissioner |
| `v_biz_kanext_founder` | Business | KaNeXT | Founder/CEO |
| `v_edu_fmu_president` | Education | FMU | President |

All views are R1 / full access for the current demo user.

### Context Switching

Switching context (via Avatar Drawer or Mode Switcher) triggers:
1. `SET_ACTIVE_VIEW` action in AppContext
2. AsyncStorage persistence to `kx:activeView`
3. `notifyViewSwitch()` pub-sub notification
4. All mode-dependent components re-render with new data

### RBCA (Role-Based Contextual Access)

6-tier system (0-5): Public → Member → Participant → Staff → Admin → Executive.

Each membership has:
- 4 **Fast Actions** (contextual shortcuts shown in Avatar Drawer)
- 6 **Permission Bullets** (capabilities described in human language)
- A **derived role badge** (composite label like "AD · Head Coach · GM")

---

## 12. Role-Based Access Control (RBAC)

Each mode has its own RBAC lens system that controls visibility at every level — which tabs you see, which sub-tabs, which cards, which data fields, which actions you can take.

### Sports Mode (R1-R13)

| Code | Role |
|------|------|
| R1 | Athletic Director |
| R2 | Head Coach / GM |
| R3 | Assistant Coach / Recruiting Staff |
| R4 | Medical & Performance Health Staff |
| R5 | Academic Support & Compliance |
| R6 | Athlete Environment Ops (Housing & Meals) |
| R7 | Player |
| R8 | Family & Advisors |
| R9 | Student (Non-Athlete) |
| R10 | Fan |
| R11 | Booster / Donor / NIL Collective |
| R12 | Agent / Scout (External Market) |
| R13 | Institution Leadership |

### Church Mode (CH1-CH13)

| Code | Role | Sports Equivalent |
|------|------|---|
| CH1 | Senior Pastor | AD |
| CH2 | Lead / Executive Pastor | Head Coach / GM |
| CH3 | Elder / Board Member | Institution Leadership |
| CH4 | Ministry Leader / Director | Assistant Coach |
| CH5 | Deacon / Staff | Medical & Performance |
| CH6 | Compliance / Finance Admin | Academic & Compliance |
| CH7 | Facilities & Operations | Housing & Meals Ops |
| CH8 | Member | Player |
| CH9 | Family of Member | Family & Advisors |
| CH10 | Regular Attendee (Non-Member) | Student (Non-Athlete) |
| CH11 | Visitor | Fan |
| CH12 | Partner Church / Denomination | Booster / Donor / NIL |
| CH13 | External Vendor / Contractor | Agent / Scout |

### Business Mode (B1-B13)

| Code | Role | Sports Equivalent |
|------|------|---|
| B1 | Founder / CEO | AD |
| B2 | COO / President | Head Coach / GM |
| B3 | VP / Department Head | Assistant Coach |
| B4 | HR / People Ops | Medical & Performance |
| B5 | Legal / Compliance | Academic & Compliance |
| B6 | Facilities / Office Ops | Housing & Meals Ops |
| B7 | Employee | Player |
| B8 | Advisor / Board Member | Family & Advisors |
| B9 | Contractor / Freelancer | Student (Non-Athlete) |
| B10 | Customer / Client | Fan |
| B11 | Investor / Shareholder | Booster / Donor / NIL |
| B12 | Prospective Acquirer / Partner | Agent / Scout |
| B13 | Holding Company / Parent Entity | Institution Leadership |

### Education Mode (E1-E13)

| Code | Role | Sports Equivalent |
|------|------|---|
| E1 | President / Chancellor | AD |
| E2 | Provost / Dean | Head Coach / GM |
| E3 | Department Chair / Faculty | Assistant Coach |
| E4 | Student Services / Counseling | Medical & Performance |
| E5 | Registrar / Compliance | Academic & Compliance |
| E6 | Facilities / Campus Ops | Housing & Meals Ops |
| E7 | Student | Player |
| E8 | Parent / Guardian | Family & Advisors |
| E9 | Alumnus | Student (Non-Athlete) |
| E10 | Prospective Student | Fan |
| E11 | Donor / Endowment | Booster / Donor / NIL |
| E12 | Accreditor / External Evaluator | Agent / Scout |
| E13 | Board of Trustees / Regents | Institution Leadership |

### Competition Mode (CO1-CO13)

| Code | Role | Sports Equivalent |
|------|------|---|
| CO1 | League Owner / Commissioner | AD |
| CO2 | Race Director / Operations Chief | Head Coach / GM |
| CO3 | Team Principal | Assistant Coach |
| CO4 | Driver / Competitor | Player |
| CO5 | Crew / Mechanic | Medical & Performance |
| CO6 | Technical Inspector / Steward | Academic & Compliance |
| CO7 | Venue / Track Ops | Housing & Meals Ops |
| CO8 | Agent / Manager | Family & Advisors |
| CO9 | Marshal / Volunteer | Student (Non-Athlete) |
| CO10 | Fan / Spectator | Fan |
| CO11 | Sponsor / Partner | Booster / Donor / NIL |
| CO12 | Broadcaster / Media | Agent / Scout |
| CO13 | Sanctioning Body (FIA etc.) | Institution Leadership |

Every mode has exactly 13 roles. Every role maps to the same structural position across modes. The sports template is the master — every other mode adapts the vocabulary but keeps the same authority/visibility/action separation.

### Nexus RBAC (9 Capability Levels)

Nexus actions are governed by a separate 9-level capability system:
- C1: Ask questions
- C2: View data
- C3: Create items
- C4: Approve items
- C5: Modify items
- C6: Delete items
- C7: Admin actions
- C8: Cross-program actions
- C9: Cross-context actions

A 9×9 capability matrix maps each role to its permitted capabilities.

---

## 13. The KaNeXT Rating (KR) System

KR is the proprietary evaluation currency of KaNeXT OS. It rates players on a 0-100 scale across 7 performance clusters, normalized across 13 competitive levels.

### The 7 Clusters

| Cluster | Subclusters | Description |
|---------|-------------|-------------|
| **Shooting** | 7 (3PT spot-up, movement, off-dribble, deep; 2PT C&S, off-dribble; FT) | Scoring from range |
| **Finishing** | 5 (Layup, floater, dunk, close, foul draw rate) | Scoring at the rim |
| **Playmaking** | 7 (Passing accuracy/vision, drive-and-kick, transition, ball security, screen assist, hockey assist) | Creating for others |
| **Perimeter Defense** | 8 (On-ball, pressure, screen nav, contest, steal, denial, disruption, foul discipline) | Guarding on the perimeter |
| **Interior Defense** | 9 (Block, rim deterrence, vertical contest, post D, help D, roll D, disruption, foul discipline, positioning) | Protecting the paint |
| **Rebounding** | 6 (Defensive, offensive, box-out, secure vs tip, range & tracking, outlet impact) | Board work |
| **Frame** | 12 (Speed w/ball, speed w/o ball, burst, stop control, agility, lateral quickness, vertical pop, functional strength, contact power, endurance, motor, body control) | Physical tools |

### The 5 Canonical Positions

KaNeXT uses a 5-position system (not traditional 1-5):

| Position | Label | OKR Weight | DKR Weight | TKR Weight |
|----------|-------|-----------|-----------|-----------|
| **PG** | Point Guard | 55% | 40% | 5% |
| **CG** | Combo Guard | 60% | 35% | 5% |
| **W** | Wing | 50% | 40% | 10% |
| **F** | Forward | 45% | 40% | 15% |
| **B** | Big | 35% | 45% | 20% |

OKR (Offensive KR) is weighted from Shooting + Finishing + Playmaking.
DKR (Defensive KR) is weighted from Perimeter Defense + Interior Defense + Rebounding.
TKR (Team KR contribution) is weighted from Frame.

### KR Color Scale (10 Bands)

| Range | Color | Label |
|-------|-------|-------|
| 97-100 | Gold `#FFD700` | Elite |
| 93-96 | Emerald `#22C55E` | Excellent |
| 88-92 | Teal `#14B8A6` | Very Good |
| 83-87 | Sky `#38BDF8` | Good |
| 78-82 | Blue `#3B82F6` | Above Average |
| 73-77 | Indigo `#6366F1` | Average |
| 68-72 | Purple `#A855F7` | Below Average |
| 63-67 | Rose `#F43F5E` | Poor |
| 58-62 | Orange `#F97316` | Very Poor |
| < 58 | Gray `#757575` | Minimal |

### Archetypes (21 Types)

Players are automatically classified into archetypes based on their cluster score profiles:

**Offensive:** Shot Creator, Stretch Shooter, Slasher, Point Forward, Pick-and-Roll Maestro, Lob Threat, Post Scorer, Floor General, Transition Weapon, Three-Level Scorer, Isolation Scorer, Movement Shooter

**Defensive:** Rim Protector, Perimeter Lockdown, Switchable Defender, Help Specialist, Steal Artist, Rebound Machine

**Two-Way:** Two-Way Wing, Two-Way Guard, Two-Way Big

### Badges (Gold / Silver / Bronze)

Badges are earned when a cluster score exceeds thresholds:

| Level | Threshold | KR Bonus | Cap |
|-------|-----------|----------|-----|
| Gold | ≥ 97 | +10 | Max 1 per player |
| Silver | ≥ 94 | +6 | Max 3 per player |
| Bronze | ≥ 90 | +3 | Unlimited |

Per-component KR cap: +12. Overall KR cap: +3.5.

47 total badges defined: 31 offensive + 16 defensive.

### KLVN (Level Normalization)

KR scores are adjusted by competitive level using Bayesian shrinkage:

| Level | Lambda (λ) | Interpretation |
|-------|-----------|----------------|
| HS / Prep / Postgrad | 0.60 | Scores shrunk heavily toward mean |
| NJCAA D3 | 0.65 | |
| CCCAA | 0.68 | |
| NJCAA D2 | 0.70 | |
| NJCAA D1 | 0.75 | |
| NAIA | 0.78 | |
| NCAA D3 | 0.72 | |
| NCAA D2 | 0.82 | |
| NCAA D1 Low Major | 0.88 | |
| NCAA D1 Mid Major | 0.94 | |
| NCAA D1 High Major | 1.00 | Baseline — no shrinkage |
| Professional | 1.05 | Scores inflated (harder competition) |

This means a 75 KR at NAIA is not the same as a 75 KR in the NCAA — the KLVN normalization ensures cross-level comparability.

### Team KR

Team KR is participation-weighted from individual player KRs:

```
Team_Overall_KR = Team_Off_KR × 0.53 + Team_Def_KR × 0.47
```

Minimum participation threshold: 5% of total minutes. Weighted by each player's minutes share.

### System Identity (OSIE / DSIE)

The engine infers each team's offensive and defensive systems from box-score data:

**11 Offensive Systems:** Spread Pick-and-Roll, Five-Out Motion, Motion Read-React, Pace and Space, Dribble Drive, Princeton, Flex, Swing, Post-Centric Inside-Out, Moreyball, Heliocentric

**9 Defensive Systems:** Containment Man, Pack Line, Pressure Man Denial, Switch Everything, ICE No-Middle, Zone Structured, Matchup Zone Hybrid, Press Pressure Defense, Junk/Special

Confidence capped at 65% for box-score-only inference.

---

## 14. National Player Pool & Data Pipeline

### Data Flow

```
PrestoSports websites (NJCAA/NAIA/CCCAA)
    ↓ Python scraper (httpx + BeautifulSoup)
PostgreSQL (kanext_player_pool, 19 tables)
    ↓ KR Computation Engine (8 Python modules)
PostgreSQL (computed tables: player_kr, clusters, traits, etc.)
    ↓ export_to_json.py
data/national-pool.json
    ↓ data/national-pool.ts (TypeScript adapter)
nationalPool.search() — used by Recruiting, Roster, Nexus, Entity Sheets
```

### Scraper

- **Technology:** Python 3.9, httpx, beautifulsoup4, psycopg
- **Target:** PrestoSports stat pages for NJCAA, NAIA, CCCAA
- **Crawl delay:** 10 seconds per robots.txt compliance
- **Pattern:** Upsert-based (resumes on re-run, no duplicates)
- **CLI:** `python3 scraper.py division div1|div2|div3` / `python3 scraper.py naia` / `python3 scraper.py cccaa`

### Current Database Status

| Level | Teams | Players | Game Stats | Player KRs |
|-------|------:|--------:|-----------:|-----------:|
| NJCAA D1 | 136 | 1,596 | 5,299 | 528 |
| NJCAA D2 | 139 | 1,670 | 7,576 | 593 |
| NJCAA D3 | 92 | 1,135 | 6,875 | 518 |
| NAIA | 223 | 2,579 | 11,061 | 1,324 |
| CCCAA | 104 | 1,258 | 6,307 | 683 |
| **Total** | **694** | **8,238** | **37,118** | **3,646** |

Additional: 388 Team KRs, 685 OSIE/DSIE system identity scores.

### KR Computation Engine

8-module Python pipeline:

1. **Season Stats** — Aggregate `player_game_stats` → `player_season_stats` (GROUP BY)
2. **BPR** — Basketball Performance Rating per game (zero-centered, TS-adjusted, per-100-possession)
3. **Clusters** — 7 cluster scores (0-100) from box-score approximation
4. **Player KR** — Position-weighted KR + archetype derivation
5. **Team KR** — Participation-weighted team aggregation (53/47 OFF/DEF split)
6. **OSIE/DSIE** — System identity inference
7. **BPR/TPQ** — Player/Team Performance Qualitys
8. **Scholarship/NIL** — Allocation recommendations

### Frontend Adapter

`data/national-pool.ts` loads the exported JSON and provides a rich search API:

```typescript
nationalPool.search({
  query: 'Carter',
  level: 'naia',
  position: 'CG',
  minKR: 70,
  maxKR: 100,
  conference: 'Sun Conference',
  archetype: 'shot_creator',
  hasPortalEntry: true,
  sortBy: 'kr',
  sortDir: 'desc',
  limit: 50,
  offset: 0,
})
```

Also: `nationalPool.getById()`, `nationalPool.topByKR()`, `nationalPool.getTeamRoster()`, `nationalPool.getTeamSystem()`, `nationalPool.counts`.

---

## 15. Recruiting Intelligence

### Three Segments

The Recruiting pill on Sports Home provides three views:

**1. Board** — CRM-style pipeline of tracked prospects
- 8-stage pipeline: Prospect → Contact Made → Eval Sent → Visit Scheduled → Offer Out → Committed → Signed → Dead
- Filter pills by stage, sort by KR/Position/Stage/LastContact/FitScore
- Team needs capacity indicator
- Each row enhanced with national pool KR data
- Tap → full intelligence player card via `openPlayerCard()`

**2. Database** — Real national player pool (9K+ players)
- Multi-filter: Level, Position, KR range, Conference, Archetype
- Sort: KR, PPG, RPG, Name, Height
- Pagination (50 per page)
- Badge dots (Gold/Silver/Bronze) on qualifying players
- Tap → full intelligence player card

**3. Portal** — Transfer portal view
- Pre-filtered to players with portal entry dates
- Level/position filters
- Shows portal entry date
- Tap → full intelligence player card

### Player Intelligence Card

When you tap any player, the entity sheet shows:

1. **Identity** — Name, position, school, conference, level
2. **KR Card** — Color-coded KR score, tier label, percentile, BPR, OFF/DEF KR, system fit %
3. **Archetype** — Derived archetype with description
4. **Badges** — Gold/Silver/Bronze badge grid
5. **7 Cluster Bars** — Visual 0-100 bars for each cluster
6. **Season Averages** — PPG, RPG, APG, SPG, BPG, MPG, FG%, 3P%, FT%
7. **Background** — Height, weight, hometown, high school
8. **Scholarship & NIL** — Recommended allocation tier, equivalent value, NIL amount

### Fit KR Computation

Beyond raw KR, the system computes **Fit KR** — how well a player fits your specific offensive and defensive system. This uses:
- Position-specific cluster weights (5 positions × 7 clusters)
- System demand profiles (what each offense/defense values)
- Lineup rating computation (combined OFF/DEF/Net for a 5-man unit)
- Fit reasons (7 structured explanations of why a player fits or doesn't)

---

## 16. Simulation Engine

The Simulation domain card provides a complete game simulation OS.

### UI (6 Tabs)
Overview | Box Score | Drivers | Traces | Saved Runs

### Simulation Types
- **Pregame** — Pre-game win probability
- **Halftime** — Mid-game adjustments
- **Endgame** — Late-game scenarios
- **What-If** — Hypothetical roster/system changes

### Output
- Win probability (Low / Base / High)
- Predicted margin
- Confidence score
- Volatility level
- Projected box scores per player
- Key drivers (which players/matchups matter most)
- Comparison view (side-by-side simulation runs)
- Confidence gate (blocks display if below minimum threshold)

### Scenario Builder
Configure: rosters, systems, pace, home/away, minutes distribution, injury adjustments.

---

## 17. Game Operations

Game Ops is a real-time game management surface accessible from:
1. The Home Dashboard (Next Game card → "Open Game Ops")
2. Nexus (conversation type = `'game-ops'`)

### Game Sheet (5 RBAC-Gated Tabs)

| Tab | Available To | Content |
|-----|-------------|---------|
| **Pregame** | All roles | Scouting report, opponent tendencies, game plan summary |
| **Live** | R1/R3 | Live box score, play-by-play, substitution tracking |
| **Postgame** | All roles | Final stats, player grades, key moments |
| **AD Overlay** | R1 only | Administrative view (attendance, revenue, incidents) |
| **Incidents** | R1 only | Injury reports, technical fouls, ejections |

### Live Game Panel

Inline expandable panel in the Home Schedule Hub with 4 sub-tabs:
- **Plays** — Play-by-play feed with category filtering (scoring/foul/sub/timeout/other)
- **Box** — Live box score
- **Team** — Team stats comparison
- **Leaders** — Statistical leaders

---

## 18. Entity Sheet System

Entity sheets are universal preview cards that can be opened from anywhere in the app. They are registered globally in `app/_layout.tsx` and controlled via singleton handlers.

### 8 Entity Types

| Entity | Sheet Component | Opened By | Key Data |
|--------|----------------|-----------|----------|
| **Player** | `player-card-sheet.tsx` | Roster tap, recruiting tap, Nexus mention | KR card, clusters, badges, archetype, stats, scholarship/NIL |
| **Team** | `team-card-sheet.tsx` | Opponent logo tap, standings tap | Team name, conference, record, Team KR |
| **Coach** | `coach-card-sheet.tsx` | Staff tap | Name, title, record, bio |
| **Person** | `person-card-sheet.tsx` | People directory tap (church/edu/biz) | Name, role, status, ministry pills |
| **Leader** | `leader-card-sheet.tsx` | Church leadership tap | Name, role, ministry pills, bio |
| **Ministry** | `ministry-card-sheet.tsx` | Church ministry tap | Name, mission, volunteer count, leader |
| **Driver** | `driver-card-sheet.tsx` | Competition standings tap | Name, team, number, points/wins/podiums |
| **Crew** | `crew-card-sheet.tsx` | Competition grid tap | Name, role, team, pit score |

### Global Controller Pattern

All entity sheets use a singleton controller pattern:

```typescript
// In utils/global-entity-sheets.ts
let handlers: EntitySheetHandlers | null = null;

export function registerEntitySheetHandlers(h: EntitySheetHandlers) {
  handlers = h;
}

export function openPlayerCard(data: PlayerCardData) {
  handlers?.openPlayerCard(data);
}
```

Components call `openPlayerCard(data)` from anywhere — no prop drilling needed. The actual sheet components are mounted once in `app/_layout.tsx`.

---

## 19. Bottom Sheet & UI System

### Bottom Sheet Rules

All modal content uses `@gorhom/bottom-sheet` v5 via `components/ui/bottom-sheet.tsx`.

**Immutable rules:**
- **Two snap points only:** 50% (medium) and 100% (full). No third detent.
- **Always opens at 50%.** User drags up to 100% or down to dismiss.
- **Drag-to-dismiss from anywhere** inside the sheet. `enablePanDownToClose = true`.
- **Backdrop tap dismisses.** Background dimmed at 40% opacity.
- **Spring animation.** No linear easing. Must feel like iOS Maps / Apple Music.
- **`useModal` prop** for deeply nested components — uses `BottomSheetModal` (portal-based).

**Prohibited patterns:**
- Fixed-height modals without drag
- Close-button-only dismissal
- Center modals for primary flows
- More than two snap points
- Custom `Animated.View` / `PanResponder` implementations

### PagedTabBar

Universal swipeable tab bar used across all major surfaces. `screenWidth / 4` per tab (overridable). Two visual modes:
- **Accent mode:** Flat button with colored underline
- **Default mode:** Monochrome with underline

### EdgeHoldAdvance

Auto-advance gesture for tab navigation. 28px edge zones. Hold 300ms to activate, then 550ms interval (accelerates to 450ms after 3 advances). Wraps around if `wrap` prop is set.

### Other UI Primitives

- **EmptyState** — Full-page: icon circle + title + description + optional action
- **ErrorState** — Error display with retry. Variants: NetworkErrorState, NotFoundState
- **LoadingState** — Centered ActivityIndicator + optional message
- **InlineLoader** — Small inline spinner
- **TabPlaceholderPage** — "Coming Soon" placeholder
- **VideoHeroCard** — 16:9 autoplay/loop/muted video with info strip

---

## 20. Data Layer & Mock Architecture

KaNeXT OS uses a dual data strategy:

### Real Data (via PostgreSQL pipeline)
- National player pool (9K+ players with KR scores)
- Team system identities (OSIE/DSIE)
- Box-score statistics
- Scholarship/NIL allocations

### Mock/Seeded Data (via TypeScript files)
Everything else is seeded locally in `/data/` files:

| File | Contents |
|------|----------|
| `fmu.ts` | FMU Lions: games (full schedule), box scores, leaders, standings, news, staff, player bios, team colors, pregame snapshots, game impact data |
| `roster-data.ts` | 17 FMU players: cluster ratings, physicals, subclusters, roster management metadata, portal risk |
| `recruitingBoard.ts` | 20 recruits with 8-stage CRM pipeline, full contact/evaluation history |
| `views.ts` | 5 canonical views (one per mode) |
| `mock-memberships.ts` | 5 organizations, 5 memberships, 21 programs, 6 seasons |
| `rbca.ts` | RBCA tiers, badges, permissions, fast actions per membership |
| `playerPool.ts` | 200 seeded pool players (legacy, pre-national-pool) |
| `system-demand-profiles.ts` | 17 offensive + 8 defensive archetype demand profiles |
| `trait-library.ts` | 54 sub-traits across 7 clusters |
| `team-needs.ts` | Position needs, depth targets, scholarship caps |
| `api.ts` | Mock API layer with 100ms delay simulation |
| `mock-*.ts` | 50+ files: mode-specific data for church, business, education, competition |

### Data Tagging
All seeded FMU data is tagged `data_source: 'demo_seed'` to distinguish from real scraped data.

---

## 21. Backend Services

### Player Pool Scraper (`services/player-pool/scraper/`)

**Purpose:** Scrape basketball roster and statistics data from PrestoSports-powered websites.

**Files:**
- `scraper.py` — Main scraper (discovers teams from leaders pages, scrapes rosters + game stats)
- `config.py` — URLs, constants, crawl delay, DB config
- `db.py` — PostgreSQL helpers (upserts for conferences, teams, players, game stats)

**Supported associations:**
- NJCAA (D1, D2, D3) — `njcaastats.prestosports.com`
- NAIA — `naiastats.prestosports.com`
- CCCAA — `cccaa.prestosports.com`

**Constraints:**
- 10-second crawl delay (robots.txt compliance)
- 60-second HTTP timeout
- Upsert-based (safe to re-run, resumes progress)

### KR Computation Engine (`services/player-pool/engine/`)

**Purpose:** Compute all KR metrics from raw box-score data.

**Pipeline (8 steps):**

| Step | Module | Input | Output |
|------|--------|-------|--------|
| 1 | `compute_engine.py` | `player_game_stats` | `player_season_stats` |
| 2 | `bpr.py` | Game-level box scores | BPR per game + season average |
| 3 | `clusters.py` | Season stats + KLVN params | 7 cluster scores (0-100) |
| 4 | `player_kr.py` | Clusters + position | Overall/OFF/DEF KR + archetype |
| 5 | `team_kr.py` | Player KRs + minutes | Team OFF/DEF/Overall KR |
| 6 | `osie_dsie.py` | Team stats | Offensive/Defensive System IDs |
| 7 | `impact_scores.py` | BPR + box scores | BPR + TPQ |
| 8 | `scholarship_nil.py` | Player KR + Team KR | Allocation recommendations |

**Key algorithms:**
- **BPR:** Modified Hollinger Game Score with TS% adjustment, per-100-possession normalization
- **KLVN:** Bayesian shrinkage toward population mean, parameterized by competitive level
- **Archetypes:** Position-specific cluster threshold matching (first match wins)
- **OSIE/DSIE:** Rule-based system inference from pace, shooting splits, assist rate, etc.

### JSON Export (`services/player-pool/export_to_json.py`)

Exports PostgreSQL data to JSON files consumed by the frontend:
- `data/national-pool-players.json`
- `data/national-pool-ratings.json`
- `data/national-pool-stats.json`
- `data/national-pool-scholarship.json`

Run after scraping or engine updates: `cd services/player-pool && python3 export_to_json.py`

### Database Schema (19 Tables)

**Core Entities:** associations, divisions, competitive_levels, conferences, teams
**Players:** players, player_team_seasons
**Game Data:** team_seasons, games, team_game_stats, player_game_stats
**Computed Metrics:** player_season_stats, player_kr, player_kr_traits, player_kr_clusters
**System Identity:** team_system_identity
**Financial:** scholarship_nil_allocations, team_allocation_summary
**Audit:** season_snapshots, scrape_log, computation_log

---

## 22. Canonical Spec Library

The `/spec/canonical/` directory contains 47+ authoritative specification documents organized into 7 groups:

### 00 — Coach Master Input
- Coach Input Master List

### 01 — Player Evaluation Engine (15 documents)
- Archetype Library, Badge Cap & Effect Spec, College/Pro Player KR Legends
- How Nexus Runs Player Eval (Locked UX + Logic)
- Impact Modifiers, BPR Spec, KLVN Spec, Overrides
- Player Confidence Gate, Player Profile, Position Trait Weighting
- System Fit, System Risks, Trait Library

### 02 — Team Evaluation Engine (8 documents)
- Player System Fit, Scholarship & NIL Allocation Engine
- System Demand Profiles, Team Confidence Gate
- Team KR Eval Order, Team KR Legend, Team KR Math + Weights
- UI System Set

### 03 — Global Player & Team Evaluation Engine (4 documents)
- Global Player + Team Database
- National Player Pool Spec
- OSIE/DSIE Protocol
- System Inference Engine (SIE)

### 04 — Scouting Evaluation Engine (3 documents)
- Game Ops Full Flow (Pregame → In-Game → Halftime → Postgame)
- Postgame Confidence Gate
- Scout Confidence Gate

### 05 — Simulation Evaluation Engine (8 documents)
- Defensive Archetype × Offensive System
- Matchup Interaction Governance, Modifier Framework
- Offensive Archetype × Defensive Systems
- Possession Engine, Simulation Confidence Gate
- Simulation Engine Spec
- System × System Interaction

### 06 — Development Intelligence Engine (1 document)
- Development / Pathway Page

Each document has both `.docx` originals and `.txt` extracts in the `_text/` subdirectory for programmatic access.

---

## 23. Current Status & Roadmap

### What's Built (February 2026)

**Core Shell:**
- 5-tab navigation with all gestures (long-press, double-tap, KX transition)
- Avatar Drawer with full context switching
- Mode Switcher overlay
- Universal Finder
- Auth flow (Apple/Google/Email placeholder)
- Boot splash sequence
- Full dark theme design system

**Sports Mode (Primary — Most Complete):**
- 4-pill Home (Dashboard, Roster, Calendar, Recruiting)
- Full 17-player FMU roster with cluster ratings, subclusters, physicals
- System-aware depth chart with fit KR
- 20-recruit CRM board with 8-stage pipeline
- Real national player pool (9K+ players) wired to Recruiting + Nexus
- Calendar V2 (Agenda, Games, Standings, News)
- Game Plan OS (7 tabs)
- Simulation OS (6 tabs)
- Statistics Hub (6 tabs)
- Development OS (6 tabs)
- Film Room (3 views)
- Organization V2/V3 (6 V3 tabs with 7-10 V2 sub-tabs each)
- Entity sheets (Player, Team, Coach)
- KR computation engine (v1.0-boxscore)
- Nexus with player data injection and governed actions
- Voice mode, Search Overlay, Split Nexus

**Enterprise Mode:**
- 4-pill Home (Dashboard, Deals, Vault, Calendar)
- Organization V2/V3 (6 V3 tabs)
- Entity scope bar for business entity switching

**Church Mode:**
- 4-pill Home (Dashboard, Ministries, Connect, Calendar)
- Organization V2/V3 (6 V3 tabs)
- Person/Leader/Ministry entity sheets

**Education Mode:**
- 4-pill Home (Dashboard, Admissions, Faculty, Calendar)
- Organization V2/V3 (6 V3 tabs)

**Competition Mode:**
- 4-pill Home (Dashboard, Calendar, Grid, Entries)
- Driver/Crew entity sheets
- Organization V2/V3 (6 V3 tabs)

**Media Tab (All Modes):**
- Feed, Explore, Film Room, Library — all mode-aware

**Messages Tab (All Modes):**
- Inbox, Rooms, Nexus Queue — all mode-aware

**Backend:**
- PostgreSQL database (19 tables, 694 teams, 8,238 players, 37,118 game stats)
- KR engine (3,646 player KRs, 388 team KRs, 685 system identities)
- Scraper operational for NJCAA (D1/D2/D3), NAIA, CCCAA

### What's In Progress

- **NAIA scraping** — 223/225 teams complete (2 remaining)
- **NJCAA D3 scraping** — Complete (92 teams)
- **Pro KR** — Position weights and archetype thresholds defined in spec but not yet coded
- **Badge engine (backend)** — Spec complete (47 badges, college + pro thresholds), not yet in computation pipeline

### What's Not Yet Built

- **NCAA scraping** — NCAA uses different stats infrastructure (not PrestoSports), needs separate scraper
- **Real authentication** — Currently hardcoded demo user
- **Real backend API** — All data is local (PostgreSQL for player pool, AsyncStorage for everything else)
- **Push notifications** — Not implemented
- **Real-time data** — No live game feeds
- **Payment processing** — Payment Rails UI is built but no real payment integration
- **Multi-user** — Single user identity, no collaboration features
- **App Store deployment** — Development builds only

### Architecture Decisions

1. **Dark mode forced** — `useColorScheme()` hardcoded to `'dark'`. The luxury control room aesthetic is non-negotiable.
2. **No server** — Everything runs locally. The PostgreSQL database is localhost. This is intentional for the demo phase — the architecture is designed to be backed by a real API later.
3. **Context over Redux** — 7 React Context providers instead of a state management library. Sufficient for current complexity.
4. **PagerView everywhere** — Every multi-view surface uses `react-native-pager-view` with `PagedTabBar` + `EdgeHoldAdvance`. This creates a consistent, premium swipe-based interaction model.
5. **Global singleton controllers** — All overlays/drawers/sheets use module-level handler registration. This avoids prop drilling across the 200+ component tree while keeping the React component tree clean.
6. **Seeded mock data** — All non-player-pool data is seeded in TypeScript files. This is deliberate — it means the app runs anywhere with zero infrastructure, which is critical for demos and investor presentations.

---

*KaNeXT OS — One shell. Five modes. One identity. Built for the operator who runs everything.*
