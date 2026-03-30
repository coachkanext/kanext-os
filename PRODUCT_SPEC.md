# KaNeXT App — Full Product Spec (Current Repo)

> Generated 2026-02-14, updated 2026-02-15. Where behavior could not be confirmed from source, the field is marked **UNSPECIFIED**.

---

## Source Map

### Root Config & Docs
- `CLAUDE.md` — Dev guidance, bottom sheet rules, architecture overview
- `app.json` — Expo app configuration, experiments, plugins
- `types/index.ts` — Core type definitions (all modes, entities, Nexus, simulations)
- `spec/UI_CHANGE_SPEC__MODE_PICKER.md` — Mode gate redesign spec

### Spec Documents (`spec/canonical/_text/`)
| Engine | Files |
|--------|-------|
| 00 Coach Master Input | `Coach Input Master List.txt` |
| 01 Player Evaluation | `Archetype Library.txt`, `BADGE CAP & EFFECT SPEC_.txt`, `College Player KR Legend.txt`, `Pro Player KR Legend.txt`, `How Nexus Runs Player Eval (Locked UX + Logic).txt`, `Trait Library.txt`, `KLVN (Level Normalization).txt`, `KaNeXT — BPR.txt`, `System Fit.txt`, `System Risks.txt`, `Impact Modifiers.txt`, `Overrides.txt`, `Player Confidence Gate.txt`, `Position Trait Weighting.txt`, `Player Profile.txt` |
| 02 Team Evaluation | `Team KR Math + Weights.txt`, `Team KR Legend.txt`, `Team KR — Eval Order.txt`, `System Demand Profiles.txt`, `Team Confidence Gate.txt`, `UI System Set.txt`, `Player System Fit.txt`, `Scholarship & NIL Allocation Engine.txt` |
| 03 Global Eval | `National Player Pool.txt`, `Global Player + Team Database.txt`, `System Inference Engine (SIE).txt`, `OSIE/DSIE Protocol.txt` |
| 04 Scouting | `Game Ops — Full Scouting Intelligence Flow.txt`, `Scout Confidence Gate.txt`, `Postgame Confidence Gate.txt` |
| 05 Simulation | `Simulation Engine.txt`, `SYSTEM × SYSTEM INTERACTION.txt`, `Offensive Archetype × Defensive Systems.txt`, `Defensive Archetype × Offensive System.txt`, `Simulation Confidence Gate.txt`, `Possession Engine.txt`, `Modifier Framework.txt`, `Matchup Interaction Governance.txt` |
| 06 Development | `Development & Pathway Page.txt` |

### Spec Documents (`spec/` root)
- `01 - README — KaNeXT v1.docx`
- `02 - KaNeXT — Universal Layout Specification.docx`
- `03 - KaNeXT OS Entry & Surface Hierarchy.docx`
- `04-07` — Mode Instantiation specs (Sports/Enterprise/Church/Education)
- `UI Badge Index v1.docx`, `UI System Presets.docx`, `UI Trait Index v1.docx`

### Navigation & Screens
- `app/_layout.tsx` — Root layout (providers, global overlays)
- `app/(tabs)/_layout.tsx` — Main tab bar
- `app/(tabs)/media/_layout.tsx` — Media sub-tabs
- `app/(tabs)/activity/_layout.tsx` — Activity/Comms sub-tabs
- `app/(tabs)/organization/_layout.tsx` — Organization stack
- `app/coach/_layout.tsx` — Coach destination stack
- All screen files under `app/`

### Components
- `components/` — 120+ component files across root, `ui/`, `media/`, `messages/`, `nexus/`, `recruiting/`, `depth-chart/`, `game/`, `business/`, `church/`, `education/`, `community/`, `enterprise/`, `game-ops/`, `game-plan/`, `simulation/`, `development/`, `rails/`

### Data & State
- `data/` — 30+ data files (fmu.ts, roster-data.ts, mock-messages.ts, playerPool.ts, playerRatings.ts, playerSeasons.ts, player-stats.ts, team-needs.ts, system-demand-profiles.ts, stats/synergy-data.ts, stats/projections.ts, mock-business.ts, mock-church.ts, mock-education.ts, mock-community.ts, mock-enterprise-v2.ts, etc.)
- `utils/` — Global controllers, fit-kr engine, player-badges engine, recruiting-helpers, OpenAI client, board store
- `context/` — auth-context.tsx, app-context.tsx, nexus-context.tsx, enterprise-context.tsx
- `hooks/` — use-color-scheme, use-theme-color, use-speech-recognition
- `constants/theme.ts` — Colors, fonts, spacing, layout constants

---

## 1. System Overview

### 1.1 What Is KaNeXT OS

KaNeXT OS is a cross-platform mobile application built with **Expo** and **React Native**. It is a multi-modal organizational operating system that adapts its UI, data, and intelligence layer based on the selected **Mode**:

| Mode | Organization Example | Primary Role | Cycle |
|------|---------------------|--------------|-------|
| Sports | Florida Memorial University | Head Coach / GM | 2025-26 Season |
| Enterprise (Business) | KaNeXT | Founder | FY 2025 |
| Church | International Christian Center | Member | 2025 |
| Education | San Diego Christian College | Faculty | 2025-26 |
| Community (Competition) | K-1 Competition | League Admin | Season 1 · 2026 |

### 1.2 App Identity

- **App Name:** kanext-os
- **Version:** 1.0.0
- **Platforms:** iOS, Android, Web
- **Routing:** Expo Router (file-based, typed routes)
- **Theme:** Dark-first design (forced dark mode on web)
- **Logo:** KX monogram mark (gold variant on dark backgrounds)

### 1.3 Experiments Enabled
- `typedRoutes: true` — Type-safe route navigation
- `reactCompiler: true` — React Compiler optimizations
- `newArchEnabled: true` — React Native New Architecture (in native config)

### 1.4 Key Dependencies
- `@gorhom/bottom-sheet` v5 — All bottom sheets
- `react-native-pager-view` — Swipeable tab pages (all mode homes)
- `expo-haptics` — Haptic feedback
- `expo-speech-recognition` — Voice input
- `react-native-gesture-handler` — Gesture support
- OpenAI GPT-4o — Nexus AI backend

---

## 2. Navigation Architecture

### 2.1 Provider Hierarchy (outermost → innermost)

```
AuthProvider
  └─ AppProvider
       └─ EnterpriseProvider
            └─ ThemeProvider
                 └─ GestureHandlerRootView
                      └─ BottomSheetModalProvider
                           └─ Root Stack Navigator
```

### 2.2 Root Stack (`app/_layout.tsx`)

| Screen | Type | Notes |
|--------|------|-------|
| `(tabs)` | Tabs | Main app (6 bottom tabs) |
| `coach` | Stack | Coach destination screens |
| `login` | Screen | Demo auth screen |
| `video` | Screen | Placeholder |
| `settings` | Screen | Settings page |
| `profile` | Screen | Context selector |
| `modal` | Screen | Generic modal |

**Global Overlays** (always mounted at root):
- `GlobalHeader` — Top bar (avatar, mode pill, search)
- `AvatarDrawer` — Twitter/X-style left slide drawer
- `AuthModal` — Full-screen auth gate (blocks until sign-in)
- `AskNexusSheet` — Q&A bottom sheet
- `UniversalFinder` — Spotlight search overlay
- `VoiceOverlay` — Global voice input (Nexus long-press)
- `KXTransition` — Tab switch micro-animation
- `SplashScreen` — Cold-start boot splash (KX logo + "powered by Nexus", 2s minimum)
- `ModeSwitcherOverlay` — Quick mode switch popup (long-press Organization tab)

### 2.3 Universal Bottom Navigation (Global Footer) — LOCKED

**File:** `app/(tabs)/_layout.tsx`

**Scope:** UNIVERSAL across ALL MODES (Sports, Education, Church, Enterprise, Community). Global footer used everywhere — no exceptions in v1.

**Tabs (left → right) — GLYPHS ONLY:**

| # | Tab | Route | Icon (SF Symbol) | Custom Button |
|---|-----|-------|-------------------|---------------|
| 1 | Home | `index` | `house.fill` | `HomeTabButton` |
| 2 | Media | `media` | `play.rectangle.fill` | `TransitionTab` |
| 3 | **Nexus** | `nexus` | Custom image (`nexus-logo.png`) | `NexusTabButton` |
| 4 | Messages | `activity` | `bubble.left.and.bubble.right.fill` | `TransitionTab` |
| 5 | Organization | `organization` | `building.2.fill` | `OpsTabButton` |

**Rules:**
- Glyph icons only (no text labels)
- Order is fixed and must never change per mode
- **Nexus is the center anchor** (primary) and always present
- Each tab routes to its mode-aware root surface:
  - Home → current mode's Home hub
  - Media → current mode's Media hub
  - Nexus → Nexus root (cross-mode)
  - Messages → current mode's messaging root
  - Organization → current mode's organization/program truth root

**Initial route:** `index` (Home — Business Mode Home after auth)

**Tab bar styling:** No labels, dark background, hairline top border, platform-specific height.

**Long-Press Trigger:**
- **Long-press Organization tab** → opens **Mode Switcher Overlay**
  - UI: Floating popup (bottom-right)
  - Contents: 4 mode circles (excludes current mode)
  - Tap a circle → switch mode + route to that mode's Home hub

**Hidden routes** (not in tab bar, accessible via deep link):
- `search` (`href: null`) — accessible via GlobalHeader search icon
- `home`, `explore` (`href: null`) — legacy, unused

### 2.4 Media Sub-Tabs (`app/(tabs)/media/_layout.tsx`)

Custom tab bar: **VideoSubFooter** (icon-only, positioned above main tab bar).

| Tab | Route | Icon | Visible |
|-----|-------|------|---------|
| Home | `index` | `music.note.house` | Yes |
| Reels | `reels` | `film.stack` | Yes |
| Create | `create` | `plus` | Yes |
| Inbox | `inbox` | `paperplane.fill` | Yes |
| Library | `library` | — | **Hidden** (`href: null`) |
| You | `you` | `person.circle.fill` | Yes |

### 2.5 Activity/Comms Sub-Tabs (`app/(tabs)/activity/_layout.tsx`)

Custom tab bar: **CommsTabBar** (text-segmented, positioned at **top**).

| Tab | Route | Label | Visible |
|-----|-------|-------|---------|
| Feed | `index` | Feed | Yes |
| Search | `explore` | Search | Yes |
| Inbox | `chat` | Inbox | Yes |
| Activity | `alerts` | Activity | Yes |
| Lists | `lists` | Lists | Yes |
| Requests | `requests` | — | **Hidden** (`href: null`) |

### 2.6 Organization Stack (`app/(tabs)/organization/_layout.tsx`)

Nested stack navigator with mode-specific content:

| Route | Purpose |
|-------|---------|
| `index` | Main org overview (mode-aware) |
| `programs/[programId]` | Program detail (Sports) |
| `programs/[programId]/roster` | Program roster |
| `programs/[programId]/staff` | Staff directory |
| `programs/[programId]/schedule` | Program schedule |
| `programs/[programId]/events/[eventId]` | Event detail |
| `programs/[programId]/players/[playerId]` | Player detail |
| `programs/[programId]/media` | Program media |
| `recruiting` | Recruiting board |
| `recruiting/pool/[playerId]` | Pool player detail |
| `donations` | Donations (Sports) |
| `tickets` | Tickets (Sports) |
| `documents` | Document room (Enterprise) |
| `governance` | Board & governance (Enterprise) |
| `domains` | Product domains (Enterprise) |
| `campuses/[campusId]` | Campus detail (Church) |
| `ministries/[ministryId]` | Ministry detail (Church) |
| `messages` | Church messages |
| `giving` | Giving portal (Church) |
| `connect` | Connect (Church) |
| `schedule` | Academic schedule (Education) |
| `results` | Academic results (Education) |
| `metrics` | Institutional metrics (Education) |
| `leadership` | Leadership directory (Education) |
| `archive` | Archive (Education) |
| `members/[memberId]` | Faculty/member detail |
| `events/[eventId]` | Event detail |

### 2.7 Coach Destination Stack (`app/coach/_layout.tsx`)

Stack navigator with 21 destination screens (no headers, no animation):

| Route | Purpose |
|-------|---------|
| `roster` | Team roster |
| `games` | Season games list |
| `game-detail` | Game detail (Live vs Report tabs) |
| `injuries` | Injury report |
| `more-resources` | Additional resources |
| `recruiting` | Full recruiting board |
| `film` | Film room / scouting |
| `player-bio` | Player biography |
| `player-profile` | Player profile summary |
| `player-detail` | Detailed player evaluation |
| `game-ops` | Game operations workspace |
| `box-score` | Box score stats |
| `play-by-play` | Play-by-play log |
| `key-plays` | Key plays highlights |
| `team-stats` | Team statistics |
| `program-context` | Program context view |
| `program-resources` | Program resources |
| `team-detail` | Team detail view |
| `stats` | General stats |
| `video-game` | Video game viewer |
| `team-channel` | Team communication channel |
| `reel-viewer` | Video reel viewer |

---

## 3. Global System Rules

### 3.1 Mode Gate (First Run)

**File:** `components/mode-gate.tsx`

- **Trigger:** First app open (no mode selected)
- **UI:** Ultra-minimal 2×2 grid of mode tiles (5th mode in bottom row)
- **Tiles:** Sports, Business, Church, Education, Competition
- **Icons:** `sportscourt.fill`, `building.2.fill`, ☦ (glyph), `graduationcap.fill`, `flag.checkered`
- **Default roles:** head_coach, founder, member, faculty, league_admin
- **Colors:** Black/white only. Gold accent (`#C9A227`) for tap feedback only
- **Behavior:** Tap = immediate commit + set default role + navigate to Home. No dismiss, no tagline, no footer
- **Haptics:** Medium impact on selection

### 3.2 Mode Switcher Overlay

**File:** `components/mode-switcher-overlay.tsx`, `utils/global-mode-switcher.ts`

- **Trigger:** Long-press Organization tab
- **UI:** Floating popup (bottom-right) with 4 mode circles (excludes current mode)
- **Modes:** Sports (basketball.fill), Business (briefcase.fill), Church (building.columns.fill), Education (graduationcap.fill), Competition (flag.checkered)
- **Colors:** Each circle uses `ModeColors[mode].primary`
- **Behavior:** Tap = immediate mode switch via `switchMode(mode)` + haptic feedback

### 3.3 Authentication

**File:** `components/auth-modal.tsx`, `context/auth-context.tsx`

- **Gate:** Full-screen modal overlays Nexus until authenticated
- **Providers:** Apple (black), Google (white), Email (bordered)
- **Animation:** Slide-up on appear
- **Session Storage:** AsyncStorage keys `kx:session`, `kx:onboardingComplete`
- **States:** `isChecking` → `isAuthenticated` / `isNewUser`

### 3.4 Nexus Tab Gestures

**File:** `app/(tabs)/_layout.tsx` — `NexusTabButton`

| Gesture | Behavior |
|---------|----------|
| Single tap | KX transition animation + navigate to Nexus |
| Long-press (400ms) | Start global voice input (VoiceOverlay appears) |
| Double-tap (<350ms) | Open Universal Finder (Spotlight search) |

### 3.5 Home Tab Gestures

**File:** `app/(tabs)/_layout.tsx` — `HomeTabButton`

| Gesture | Behavior |
|---------|----------|
| Single tap | KX transition + navigate home + request home reset (scroll to top) |
| Long-press (400ms) | Open Avatar Drawer |

### 3.6 Bottom Sheet System

**File:** `components/ui/bottom-sheet.tsx` — `CLAUDE.md` rules

| Rule | Detail |
|------|--------|
| Snap points | **50%** (medium) and **100%** (full). No third detent without spec approval |
| Initial snap | Always 50% first |
| Dismiss | Drag-to-dismiss from anywhere (`enablePanDownToClose = true`) |
| Backdrop | 40% opacity, tap dismisses, underlying interaction disabled |
| Scroll coordination | Content scrolls freely; downward drag from scroll-top controls sheet |
| Animation | Spring animation only (no linear easing) |
| Prohibited | Fixed-height modals, close-button-only dismiss, center modals, >2 snap points, custom `Animated.View` / `PanResponder` sheets |

### 3.7 Left Drawer (Home Long-Press) — LOCKED

**File:** `components/avatar-drawer.tsx`

- **Trigger:** Long-press Home tab
- **Style:** Twitter/X-style left slide drawer (82% width, max 300px)
- **Animation:** Spring open/close + fade backdrop
- **Mode-aware:** Shows current Mode + Organization summary at top

**Drawer Top Header:**
- Avatar circle (tap → Profile)
- Display name
- Context line: `Mode · Organization` (e.g., `Enterprise · KaNeXT`)
- Optional small line: season/fiscal label if applicable (e.g., `FY 2025`)

**Drawer Items (v1):**
1. **Profile**
2. **Nexus** (shortcut to Nexus root)
   — divider —
3. **Settings & Privacy**
4. **Help / Support**
5. **Terms & Policies**
6. **Sign Out** (if logged in)

**Removals:** Video removed from drawer (Media is in bottom nav).

### 3.8 Universal Finder

**File:** `components/universal-finder.tsx`, `utils/global-finder.ts`

- **Trigger:** Nexus double-tap
- **UI:** Modal overlay with auto-focused search bar ("Find anything...")
- **Results:** Filtered from `MOCK_FINDER_INDEX` by query match
- **Result types:** player, recruit, team, game, clip, post (color-coded badges)
- **Actions:** Tap result → `router.push(result.route)` + close. Tap backdrop/Cancel → close

### 3.9 Voice Input

**File:** `components/nexus/voice-overlay.tsx`, `hooks/use-speech-recognition.ts`

- **Trigger:** Long-press Nexus tab (global) or mic button in Nexus input bar (local)
- **Mounted at:** Root layout (global) AND Nexus screen (local)
- **UI:** Full-screen overlay with waveform visualization
- **States:** idle → listening → processing
- **Features:** Permission handling, volume normalization, interim + final results, punctuation

### 3.10 Global Header

**File:** `components/global-header.tsx`

- **Left slot:** Avatar button (or hamburger when on Nexus route)
- **Center:** Mode selector pill with dropdown (5 modes with color-coded icons)
- **Right slot:** Custom content or spacer
- **Mode switch:** Tap center pill → dropdown → select mode → context switch
- **Height:** `paddingTop: insets.top` + `Layout.topBarHeight` (56px)

### 3.11 KX Transition

**File:** `components/kx-transition.tsx`, `utils/global-transition.ts`

Branded micro-transition animation that fires on every tab press. Visual feedback confirming navigation intent.

### 3.12 Ask Nexus Sheet

**File:** `components/ask-nexus-sheet.tsx`

- **Tabs:** Ask | History
- **Ask tab:** Context chips + large text input (500 char max) + send button + disclaimer
- **History tab:** FlatList of entries with status badges (Pending/Answered)
- **Trigger:** Various CTA buttons throughout app, global handler registration

### 3.13 Splash Screen

**File:** `components/splash-screen.tsx`

- **Trigger:** Cold app launch (module-level guard ensures once per session)
- **UI:** Full-screen dark (#0f0f0f) with centered KX gold logo (120×120), pulsating heartbeat animation
- **Bottom tag:** "powered by Nexus" (40% + 70% opacity white)
- **Duration:** 2-second minimum display, then fades out (500ms)

### 3.14 Payment Rails

**File:** `components/rails/rails-section.tsx`

Shared financial component used across all modes:
- **Tickets card** — event ticket sales
- **Donations card** — contributions/giving
- **Ledger** — 5-row transaction feed (ticket, donation, payout, fine, subscription types)
- Amounts color-coded: green = revenue, red = expense

---

## 4. Screens

### Universal Hub Tab Pattern (v1 LOCKED)

> **ALL mode Home screens follow the same pattern: 4 swipeable PagerView pages + "More" overflow trigger.**
>
> - **4 tabs** are swipeable pages in a `PagerView` component
> - **"More"** is a tap-only trigger (NOT a swipeable page) that opens a `BottomSheet` with overflow navigation items
> - Tab bar syncs with swipe via `onPageSelected` callback
> - Tab bar auto-scrolls to keep active tab visible
> - More menu items are placeholder routes for future full-screen pages
>
> | Mode | Page 0 | Page 1 | Page 2 | Page 3 | More Items |
> |------|--------|--------|--------|--------|------------|
> | Sports | Dashboard | Schedule | Roster | Recruiting | Statistics, Game Plan, Simulation, Development, Program |
> | Business | Dashboard | Operations | Projects | Finance | People, Sales, Legal, Assets, Reports |
> | Church | Dashboard | Worship | Community | Serve | Give, Events, Prayer, Messages, Discipleship |
> | Education | Dashboard | Academics | People | Campus | Admissions, Athletics, Financial, Housing, Policies |
> | Competition | Dashboard | Race Calendar | Standings | Teams | Raceweek Ops, Rules, Tech & Compliance, Safety, Sponsors |

---

### 4.1 Home — Sports Mode (`app/(tabs)/index.tsx`)

**File:** `app/(tabs)/index.tsx`
**Purpose:** Video-game-style coach HQ. Shows team state, identity, and motion.
**Pattern:** PagerView with scrollable hub tabs

**Hub Tabs (v1 LOCKED — 4 swipe + More):**
Swipeable: Dashboard | Schedule | Roster | Recruiting
More (overflow BottomSheet): Statistics | Game Plan | Simulation | Development | Program

#### Dashboard Sub-Tab (Page 0)
- **Team Identity** — FMU name, level (NAIA), conference (Sun), record, streak, tier
- **Live Game Media Card** — (When game is live) Video placeholder + score overlay
- **Recent 3** — Last 3 completed games (opponent, result, score)
- **Next 3** — Next 3 upcoming games (opponent, date, location)
- **Standings Snapshot** — Conference top 3 with KR
- **Upcoming Conference Games** — Next 3
- **Ask Nexus CTA**

#### Schedule Sub-Tab (Page 1)
- **Toggle:** Games | Standings | News
- **Games:** Live game pinned, upcoming 2, search bar, completed with streak badges (3W/3L)
- **Standings:** Scope toggle (College/Global), mode toggle (Traditional/KR), view toggle (Conference/Division/National), division chips
- **News:** News feed items
- **Bottom sheets:** Opponent KR sheet (KR, record, game impact, pregame intel), BPR sheet

#### Roster Sub-Tab (Page 2)
- **Sub-tabs:** Depth Chart | Full Roster | Units
- Season selector dropdown (2025-26, 2024-25, 2023-24)
- 5-position cards with player detail
- Tap player → PlayerSheet

#### Recruiting Sub-Tab (Page 3)
- Full `PlayerPoolContent` component (recruiting board)

#### Statistics (More → route)
- Full `StatsContent` component (see Section 4.27)

#### Game Plan (More → route) (`components/game-plan/game-plan-content.tsx`)
- Game header card (opponent, date, location)
- Game expectation badge
- Cluster matchup grid (expandable subclusters)
- Their DNA / Our Edge (bulleted lists)
- Swing Players + Opponent Threats cards
- Matchup Assignments table
- Keys to Game (numbered)
- Scouting Notes (collapsible) + Nexus Model Notes

#### Game Ops (via Game Plan route) (`components/game-ops/game-ops-hub-content.tsx`)
- Next game bar with live/pre/post status
- Depth chart view
- Launch CTA (context-aware based on game proximity)
- Ask Nexus CTA

#### Simulation (More → route) (`components/simulation/simulation-content.tsx`)
- Season projection card (projected record, seed, playoff %)
- Next game simulation (win probability bar, projected score, margin, confidence)
- Key drivers (bulleted)
- Player impact table
- Saved simulations (expandable cards)

#### Development (More → route) (`components/development/development-content.tsx`)
- Development intelligence overview
- 9 active player development plan cards
- Focus areas (tags) + progress badge (needs-work/progressing/achieved)
- Coach notes per plan

#### Program (More → route)
- Full `ProgramContextSection` component (systems, cluster weights, biases)

**Sheets triggered:**
- `KRDetailsSheet` — Team KR breakdown (tap KR card)
- `TeamQuickSheet` — Opponent team profile (tap opponent)
- `PlayerSheet` — Player profile (tap roster player)

---

#### 4.1.1 Roster Content (`components/roster-content.tsx`)

**Three view modes:**

**Cards View:**
- Full-bleed NBA.com-style player sections
- Player number + name + KR on hero image section
- Headshots with gradient overlays (fallback: FMU seal)
- Tap player → open PlayerSheet

**Depth Chart View:**
- 5-position groups: Point Guard, Combo Guard, Wing, Forward, Big
- Expandable position groups
- Player rows: name, MPG, archetype, KR badge
- Starters highlighted; bench grayed
- Cluster Picker (horizontal scroll): O KR, D KR, SHT, FIN, PLY, OBD, TMD, REB, PHY, BPR

**List View:**
- Horizontal scroll table with 10 columns: #, NAME, POS, HT, WT, CLASS, STATUS, AID, NIL, NOTES
- Filter chips: All, Available, Injured, Out, Redshirt
- Sort dropdown: by #, A-Z, Position, Class, Height, Weight, Status, Aid %
- Status color-coded: green = available, red = injured/out, orange = redshirt

**Controls:**
- Season pill (2024-25, 2025-26, 2026-27) with dropdown
- Search toggle icon
- View toggle (grid/list/depth icons)

---

### 4.2 Home — Business Mode (`components/business/business-home.tsx`)

**File:** `components/business/business-home.tsx`
**Purpose:** Founder OS Control Room — startup operational dashboard with RBAC views
**Pattern:** PagerView with scrollable hub tabs
**Palette:** BusinessPalette (BP) — champagneGold (#D4AF37), obsidian (#0A0A0A), graphite, carbon, smoke, ash, platinum, glass, emerald, amber, red
**Logo:** `assets/images/kanext-logo-gold.png` (KX gold monogram)
**Context:** `EnterpriseProvider` with `useEnterprise()` hook for RBAC state

**Hub Tabs (v1 LOCKED — 4 swipe + More):**
Swipeable: Dashboard | Operations | Projects | Finance
More (overflow BottomSheet): People | Sales | Legal | Assets | Reports

*Content mapping: Operations → OpsTab, Projects → RoadmapTab, Finance → CapitalTab*

#### Dashboard Tab (Page 0)
- **VisionHero** — Large KX gold logo (120×84) + tagline "One platform. Every institution. Every sport. Every dollar." + live pulse row (green dot + "Live" + proof/event stats)
- **VideoHeroCard** — "KaNeXT Investor Preview" with "Investor Preview — FY 2026" subtitle
- **ViewAs Bar** — RBAC role toggle pills: Founder | Investor | Public + PBD Co-Founder variant
- **MomentumCard** — Vertical timeline with milestones (Proof Wedges active, Video Mandate next, Settlement Rails next). Green checkmarks for completed, gold for active, gray for future
- **Power Metrics Grid** — 6 metrics filtered by role (Institutional Pipeline, Proof Events Scheduled, Mandates in Negotiation, Settlement Volume, Media Reach, Runway)
- **WedgeSnapshot** — 3 side-by-side mini cards (FMU, ICCLA, K-1) with icon, name, key stat, label
- **Today/Next** — Event stream with status dots (green=done, amber=upcoming, gray=scheduled)
- **Top 3 Moves** — Founder-only strategic priorities
- **Ask Nexus CTA**

#### Projects Tab (Page 2) — renders RoadmapTab
- **Phase Ladder** intro card
- **5 collapsible phase cards** (P1-P5) with status pill (completed/active/future)
- Expanded: Objective, Deliverables list, Proof Artifacts, Risks, Success Looks Like

#### Wedges (retained content, accessible via future route)
- **One card per proof wedge** (FMU, ICCLA, K-1)
- Each: icon + name + org, summary, Proof Events (bulleted), Key Advantages (bulleted), Modes (pill row), Proof Artifact link

#### Proof (retained content, accessible via future route)
- **Artifact cards** filtered by role (founder/investor/public)
- Each: category badge (media/postseason/capital/other), last updated, title + subtitle, first 3 highlights

#### Finance Tab (Page 3) — renders CapitalTab
- **Capital Stack** — All funding rounds with equity progress bar (0% → 10%)
- **PBD Tranche Schedule** (PBD co-founder view) — tranches with FUNDED/PENDING status
- **Board Seat Activation** (PBD view)
- **Distribution Flywheel** (PBD view)
- **Use of Funds** (Founder only) — allocation buckets with percentage bars

#### Governance (retained content, accessible via future route)
- **Board Composition** — Seats with status
- **Decision Classes** — Requires board flag
- **Audit Principle** — Gold left border accent card
- Empty state for Public role

#### Data Room (retained content, accessible via future route)
- **Horizontal category filter pills** (All, Business Plan, Financial, Legal, Product, IP, Engines, Governance)
- **Document list** filtered by category + role
- Each: file type icon (pdf/docx/xlsx/deck), title, category pill, last updated, chevron

#### Rails (retained content, accessible via future route)
- **Settlement Architecture** — Flow diagram with 3 numbered steps
- **Transaction Feed** — Income/expense rows with settled/pending/failed status pills
- **Processor Strategy** — v1 vs v2+ comparison cards

#### Operations Tab (Page 1) — renders OpsTab
- **Ops sub-tabs:** Directory | Workstreams | Meetings
- **Directory:** Avatar initials + name + role + status dot
- **Workstreams:** Name + items count + progress bar + lead
- **Meetings:** Dot + title + date + attendees + decision count
- Empty state for Public role

**Data source:** `data/mock-business.ts` — `BUSINESS_HUB_TABS`, `POWER_METRICS`, `TODAY_NEXT`, `TOP_3_MOVES`, `ROADMAP_PHASES`, `WEDGES`, `PROOF_ARTIFACTS`, `CAPITAL_ROUNDS`, `PBD_TRANCHES`, `USE_OF_FUNDS`, `BOARD_SEATS`, `DECISION_CLASSES`, `GOVERNANCE_AUDIT_PRINCIPLE`, `DATA_ROOM_CATEGORIES`, `RAILS_FLOW_STEPS`, `MOCK_TRANSACTIONS`, `DIRECTORY`, `WORKSTREAMS`, `MEETINGS`

---

### 4.3 Home — Church Mode (`components/church/church-home.tsx`)

**File:** `components/church/church-home.tsx`
**Purpose:** Multi-campus church dashboard (ICCLA)
**Pattern:** PagerView with scrollable hub tabs
**Logo:** `assets/images/iccla-logo.png` (fallback to text)

**Hub Tabs (v1 LOCKED — 4 swipe + More):**
Swipeable: Dashboard | Worship | Community | Serve
More (overflow BottomSheet): Give | Events | Prayer | Messages | Discipleship

*Content mapping: Dashboard → HomeTab, Worship → MessagesTab, Community → CampusesTab, Serve → MinistriesTab*

#### Dashboard Tab (Page 0)
- **Identity Block** — Logo, org name (International Christian Center), denomination, location, campus count pill
- **VideoHeroCard** — "Sunday Worship Service" highlight
- **Next Service** — Service time, type, campus name
- **Latest Message** — Title, speaker name, date, series badge (if applicable)
- **Quick Stats** — 3-column row: Campuses count, Ministries count, Messages count
- **Recent Messages** — 3 sermon rows with play icon, title, speaker, date, duration
- **RailsSection** — Payment Rails (Tickets, Donations, Ledger)

#### Worship Tab (Page 1) — renders MessagesTab
- **All Messages list** — Full sermon/message catalog
- Each row: title, speaker, date, duration, series name (if exists), play icon

#### Giving (retained content, accessible via Give in More menu)
- **One card per giving option** (General, Building, Missions)
- Each: heart icon, name, description, "Give Now" button

#### Community Tab (Page 2) — renders CampusesTab
- **One card per campus**
- Each: campus name, location, address, service times section with day/time rows

#### Serve Tab (Page 3) — renders MinistriesTab
- **Ministry list** — one card
- Each row: icon, ministry name, description

#### Leadership (retained content, accessible via future route)
- **Church Leadership card**
- Each row: leader name, title, bio (2 lines max)

**Data source:** `data/mock-church.ts` — `ICC_ORGANIZATION`, `CAMPUSES`, `MINISTRIES`, `MESSAGES`, `GIVING_OPTIONS`, `CHURCH_LEADERSHIP`

---

### 4.4 Home — Education Mode (`components/education/education-home.tsx`)

**File:** `components/education/education-home.tsx`
**Purpose:** Academic institution dashboard (SDCC / FMU)
**Pattern:** PagerView with scrollable hub tabs
**Logo:** `assets/images/fmu-seal.png`

**Hub Tabs (v1 LOCKED — 4 swipe + More):**
Swipeable: Dashboard | Academics | People | Campus
More (overflow BottomSheet): Admissions | Athletics | Financial | Housing | Policies

*Content mapping: Dashboard → HomeTab, Academics → CalendarTab, People → FacultyTab, Campus → MetricsTab*

#### Dashboard Tab (Page 0)
- **Identity Block** — FMU seal, institution name, type, location, enrollment badge
- **VideoHeroCard** — "Campus Life 2025-26" highlight
- **Current Term** — Term name, dates, "Current" status badge
- **Quick Stats** — 3-column: Enrolled, Programs, Faculty
- **Upcoming Events** — Date badges (month/day) + event rows (title, type)
- **Outcomes** — 3-column: Graduation %, Retention %, Employment %
- **RailsSection** — Payment Rails

#### Academics Tab (Page 1) — renders CalendarTab
- **Academic Calendar** — All events chronologically
- Each row: date badge (month/day), event title, type label, description

#### Departments (retained content, accessible via future route)
- **One card per department**
- Each: department name, description, program count badge

#### People Tab (Page 2) — renders FacultyTab
- **Faculty & Leadership card**
- Each row: name, title, bio (2 lines), role badge (President/Dean/Chair/Professor)

#### Campus Tab (Page 3) — renders MetricsTab
- **Enrollment card** — Total, Undergrad, Graduate, YoY Growth %
- **Academics card** — Programs count, Faculty count, Student-Faculty Ratio
- **Student Outcomes card** — Graduation %, Retention %, Employment %

#### Archive (retained content, accessible via future route)
- **One card per archived year**
- Each: year, stats row (Enrolled, Graduates, Grad Rate), highlights (bulleted)

**Data source:** `data/mock-education.ts` — `FMU_ORGANIZATION`, `ACADEMIC_TERMS`, `ACADEMIC_CALENDAR`, `DEPARTMENTS`, `FACULTY_LEADERSHIP`, `INSTITUTIONAL_METRICS`, `ACADEMIC_YEAR_ARCHIVE`

---

### 4.5 Home — Community Mode (`components/community/community-home.tsx`)

**File:** `components/community/community-home.tsx`
**Purpose:** K-1 Racing Competition league dashboard
**Pattern:** PagerView with scrollable hub tabs
**Logo:** `assets/images/k1-logo.png`

**Hub Tabs (v1 LOCKED — 4 swipe + More):**
Swipeable: Dashboard | Race Calendar | Standings | Teams
More (overflow BottomSheet): Raceweek Ops | Rules | Tech & Compliance | Safety | Sponsors

*Content mapping: Dashboard → HomeTab, Race Calendar → WeekendTab, Standings → StandingsTab, Teams → TeamsTab*

#### Dashboard Tab (Page 0)
- **Identity Block** — K-1 logo, league name, season, team count pill, race stats
- **VideoHeroCard** — "Season 1 Race Highlights"
- **Season Banner** — Teams, drivers, races count
- **Next Race** — Race name, track, location, date, laps, weather
- **Last Result** — Winner name + team
- **Championship Top 5** — Drivers with position (gold for P1-3), team color dot, points
- **RailsSection** — Payment Rails

#### Race Calendar Tab (Page 1) — renders WeekendTab
- **Upcoming events** — Event rows with date, track, location, laps
- **Completed events** — Event rows with winner

#### Standings Tab (Page 2)
- **Driver Championship** — Full standings table
- Each row: position (gold P1-3), team color dot, driver # + name, team, wins, podiums, points + gap to leader

#### Grid (retained content, accessible via future route)
- **3-column driver grid**
- Each cell: team color strip (top border), driver number, last name, points

#### Teams Tab (Page 3)
- **One card per team**
- Each: team badge (abbreviation + color), team name, home track, wins, points
- Driver rows: number, name, nationality, points, avg finish

#### Rules (retained content, accessible via Rules in More menu)
- **One card per category** (Race, Sporting, Technical, Safety)
- Each: rule title + summary

#### More Menu Items (Raceweek Ops, Tech & Compliance, Safety, Sponsors)
- Section title + "Coming soon — this section is under development."

**Data source:** `data/mock-community.ts` — `K1_TEAMS`, `K1_DRIVERS`, `K1_EVENTS`, `K1_STANDINGS`, `K1_RULES`

---

### 4.6 Nexus (`app/(tabs)/nexus.tsx`)

**Purpose:** Universal reasoning surface — the primary intelligence interface. Answers "What does this mean?" Reasoning only, no state mutation.

**Entry points:** Nexus tab tap, "Open Nexus" from Avatar Drawer

**Mode awareness:** Locked state glyph color uses `ModeColors[mode].nexusGlyphDim` per mode.

**States:**
1. **Locked:** Not authenticated → dimmed background with "KX" logo + "Sign in to unlock Nexus"
2. **Onboarding:** Authenticated + new user → guided onboarding conversation
3. **Unlocked:** Authenticated → full Nexus interface

**Layout (Unlocked):**

1. **Conversations Panel** (left side, slides in/out, 70% screen width)
   - Trigger: Hamburger icon in GlobalHeader (when on Nexus route)
   - Conversation list with pin/rename/archive/delete actions
   - New Chat button, New Sim button
   - Max 3 pinned conversations
   - Avatar press → closes panel, opens AvatarDrawer

2. **Main Content:**
   - Game Ops sub-header (when game-ops conversation active)
   - `ChatThread` — Messages display with loading indicator
   - `InputBar` — Text input + context pill + mic button + plus button
     - Mic button → Voice listening (VoiceOverlay)
     - Plus button long-press → NewConversationSheet (engine menu)
     - Focus on input → Creates new conversation if none active

3. **Right Drawers/Overlays** (mutually exclusive toggles):
   - `ProgramContextDrawer` — Program context configuration
   - `RosterOverlay` — Roster sandbox
   - `RecruitingOverlay` — Recruiting board
   - `SimulationOverlay` — Simulation builder

**Conversation Types:**

| Type | Config | Description |
|------|--------|-------------|
| `chat` | — | General Nexus conversation |
| `eval` | `PlayerEvalConfig` | Player evaluation thread |
| `sim` | `SimulationThreadConfig` | Game simulation thread |
| `game-ops` | `GameOpsConfig` | Game operations (pregame → postgame) |

**New Conversation Sheet — Engine Menu:**
- Game Ops, Simulation, Player Eval, Team Eval, Recruiting, Scouting

**AI Backend:** OpenAI GPT-4o with mode-aware system prompt (sports/enterprise/church/education instructions)

**Data objects:** `Conversation`, `Message`, `EvalSnapshot`, `SimulationResult`, `SavedSimulation`

---

### 4.7 Search (`app/(tabs)/search.tsx`)

**Purpose:** Universal retrieval surface (read-only).

**Entry points:** Search icon in GlobalHeader, hidden tab (accessible via global header)

**Layout:**
1. Search input with magnifying glass icon
2. SectionList with results grouped by category
3. Empty state when no query / no results

**Result categories:** organization, member, event, record, media, document, ministry, message

**Behavior:** Tap result → `router.push(result.route)`

---

### 4.8 Media — Video Home (`app/(tabs)/media/index.tsx`)

**Purpose:** Instagram-style social feed for team media. **Mode-aware** — content swaps per mode.

**Mode-specific stories:**
- **Sports:** Your Story (SK), Coach Miller, Coach Brooks, E. Carter, E. Selden, K. Mentor, A. Noel, Staff Room, Game Ops
- **Enterprise:** KaNeXT (KX), Demo Day, Product, Investors, Press
- **Church:** ICCLA (IC), Worship, Sermons, Youth, Outreach
- **Education:** FMU, Campus, Lectures, Athletics, Alumni
- **Community:** K-1, Race Day, Onboards, Highlights, Teams

**Mode-specific feed posts:** 3 unique posts per mode with contextual authors, captions, and media cards.

**Layout:**
1. **Stories Row** — Horizontal scroll of avatar circles with gradient rings
2. **Feed Posts** — FlatList of post cards (header, 16:9 media card, caption, action row)

**Controls:** Like toggle, save toggle

---

### 4.9 Media — Reels (`app/(tabs)/media/reels.tsx`)

**Purpose:** TikTok-style vertical reel feed (mode-agnostic)

**Layout:**
1. Header overlay: search + bell icons, Following/For You toggle
2. Full-screen FlatList with `pagingEnabled=true`, `snapToInterval`
3. Each reel: title, caption, action buttons (heart, comment, share, bookmark)

**Behavior:** Vertical swipe to paginate. Share button → ShareSheet

---

### 4.10 Media — Create (`app/(tabs)/media/create.tsx`)

**Purpose:** Upload/post form for video content (mode-agnostic)

**Layout:**
1. `VideoHeader` with title "Create"
2. `UploadForm` component

---

### 4.11 Media — Inbox (`app/(tabs)/media/inbox.tsx`)

**Purpose:** Media-specific messaging (mode-agnostic)

**Layout:**
1. `VideoHeader` with title "Inbox"
2. **Quick Share Targets** — Horizontal scroll of avatar circles (5 targets)
3. **Inbox Threads** — FlatList of message threads with unread dots + media attachment badges

---

### 4.12 Media — Library (`app/(tabs)/media/library.tsx`) — HIDDEN

**Purpose:** Video library with content buckets

**Note:** Hidden from sub-footer nav (`href: null`) but still accessible via deep link.

**Layout:**
1. Content tabs: My Team | League | Explore | Coach Library
2. Expandable `LibraryBucket` components per tab
3. FAB to save links → `SaveLinkSheet`
4. Card types: `ClipCard`, `ReelCard`, `LinkCard`

---

### 4.13 Media — You (`app/(tabs)/media/you.tsx`)

**Purpose:** Personal hub with You/Film Room toggle (sports-centric)

**Layout:**
1. `VideoHeader` with dynamic title ("You" or "Film Room")
2. **Capsule Toggle:** You | Film Room

**You Section:**
- Action buttons: Create, Library
- My Uploads, My Reels, Saved, Watch History (with progress bars)

**Film Room Section:**
- Film / Recruiting toggle
- **Film mode tabs:** My Team | League | Explore
- **Recruiting mode tabs:** My Targets | Opponents | Recruit Discovery

---

### 4.14 Activity — Feed (`app/(tabs)/activity/index.tsx`)

**Purpose:** Broadcast timeline with scope/sort filtering. **Mode-aware** — scopes and posts swap per mode.

**Mode-specific scope chips:**
- **Sports:** All, My Team, Staff, Players, Parents, Recruiting, League, Game Ops
- **Enterprise:** All, Team, Investors, Partners
- **Church:** All, Church, Leadership, Ministry, Members
- **Education:** All, Campus, Faculty, Students, Alumni
- **Community:** All, League, Teams, Drivers, Race Ops

**Mode-specific feed posts:** 3 unique posts per mode with contextual content.

**Layout:**
1. **Scope Row** — Horizontal chips (mode-dependent)
2. **Sort Button** — Cycles: Recent, Trending, Mentions, Urgent
3. **Feed** — FlatList of `FeedCard` components
4. **FAB** → `ComposeSheetV2` (useModal) for new posts

---

### 4.15 Activity — Search/Explore (`app/(tabs)/activity/explore.tsx`)

**Purpose:** Trending content discovery within Comms

**Layout:**
1. Search bar ("Search Comms")
2. Scope chips (horizontal scroll)
3. Trending blocks: Trending Now, Upcoming Deadlines, Scout Watch, Player Development, Culture

---

### 4.16 Activity — Chat/Inbox (`app/(tabs)/activity/chat.tsx`)

**Purpose:** Direct and group messaging

**Layout:**
1. Search bar + New Message button
2. `ChatToggle`: Primary | Requests | Groups
3. **Primary/Groups tab:** FlatList of `SwipeableThreadRow`
4. **Requests tab:** SectionList (Pending | Approved) with `RequestRow`

**Sheets:** Thread detail, Request detail, New thread, FAB → New thread

---

### 4.17 Activity — Alerts (`app/(tabs)/activity/alerts.tsx`)

**Purpose:** Notification center with category filtering

**Layout:**
1. `NotificationCategoryTabs`: All, Mentions, Tasks, Recruiting, Game Ops, System
2. FlatList of `AlertRow`
3. Bottom sheet: `AlertDetail` with resolve/assign/snooze/escalate actions

---

### 4.18 Activity — Lists (`app/(tabs)/activity/lists.tsx`)

**Purpose:** Curated communication channels

**Layout:**
1. FlatList of `ListChannelRow` (channel name, member count, last activity)
2. Tap → bottom sheet with filtered `FeedCard` list for that channel

---

### 4.19 Organization — Sports Mode (`app/(tabs)/organization/index.tsx`)

**Purpose:** Institution overview for sports organizations

**Layout:**
1. **Institution header** — Badge + name + nickname + division + location
2. **Institutional Snapshot** — 3 metrics: Conference, Programs count, Founded year
3. **Programs grid** — `ProgramCard` per program (varsity has accent border)
4. **Recruiting card** — Recruiting Board button → `/organization/recruiting`
5. **Support grid** — 2-column: Donate → `/organization/donations`, Tickets → `/organization/tickets`
6. **RailsSection** — Payment Rails (Tickets, Donations, Ledger)
7. **Athletic Leadership** — `LeadershipRow` per staff member
8. **About** — Institution description

---

### 4.20 Organization — Enterprise Mode (`app/(tabs)/organization/index.tsx`)

**Purpose:** Investor data room and company intelligence hub
**Architecture:** PagerView with 4 tabs, `EnterpriseProvider` context
**Data source:** `data/mock-enterprise-v2.ts`

**Tabs (4):** Home | Proof | Data Room | Governance

#### Home Tab (`components/enterprise/enterprise-home.tsx`)
1. **Company Header Card** — Badge (initials), display name, legal name, jurisdiction + entity type pill, status. Tap → `CompanyProfileSheet`
2. **Proof Snapshot** — Current proof event name, stage badge, 3 KPI tiles, "Open Proof Event" CTA
3. **Key Metrics Dashboard** — 4 tiles: MRR, Customers, Runway, Team Size
4. **Architecture** (collapsible) — 3 layers: Reality, Intelligence, Nexus
5. **Canonical Engines** — Horizontal scroll of engine chips (Engine 00-06). Tap → `EngineDetailSheet`
6. **Business Model** (collapsible) — 4 revenue streams with status badges + pricing
7. **Moat & Differentiation** (collapsible) — GII headline + 4 competitive advantages
8. **Fundraising Card** — Round name, status, target/raised/close, summary, "Investor Docs" CTA
9. **Product Domains** — Active: 5 tiles (Sports, Enterprise, Church, Education, Competition) with LIVE/READ-ONLY status. V2: 3 tiles (Video, Identity, Payments) dimmed
10. **Recent Updates** — 5 items with dot, title, description, timestamp
11. **Ask Nexus CTA**

#### Proof Tab (`components/enterprise/proof-events-content.tsx`)
- FlatList of expandable `ProofEventCard` components
- Collapsed: event name, stage badge, KPI summary, milestone count, last updated
- Expanded 6 sub-tabs: Overview, KPIs, Milestones, Ops Plan, Risk, Constraints

#### Data Room Tab (`components/enterprise/data-room-content.tsx`)
- **RBAC Toggle** (`ViewAsToggle`) — founder/investor/public views
- **Search bar** — full-text search across title, description, tags
- **Category filter pills** — All, Investor, Proof, IP, Financial, Legal, Product, Engines, Governance
- **Document list** — 18 docs with title, category pill, tags, summary, updated date
- Visibility: Founder sees all, Investor sees investor+public, Public sees public only
- Tap → `DocumentReaderSheet`

#### Governance Tab (`components/enterprise/governance-content.tsx`)
1. **Company Information** — Legal Name, DBA, Entity Type, Jurisdiction, Status, Primary Contact
2. **Registered Agent / Mailbox** — Address block with gold left border
3. **Corporate Structure** — Parent (OSK Group LLC) → Child (KaNeXT Operations LLC)
4. **Board & Advisory** — Member list with avatar, name, role, company
5. **Policy & Compliance** — IP Assignment, Open Source Posture, Data Rights with "Set" badges

**Additional components:**
- `CompanySwitcher` (`components/enterprise/company-switcher.tsx`) — Switch between OSK Group and KaNeXT
- `EnterpriseHubTabs` (`components/enterprise/enterprise-hub-tabs.tsx`) — 4 horizontal tabs

---

### 4.21 Organization — Church Mode (`app/(tabs)/organization/index.tsx`)

**Purpose:** Church ministry and campus management

**Layout:**
1. **Church header** — Heart icon badge + organization name + denomination + campus count + location
2. **Quick Actions** — 3-card grid: Messages (watch sermons), Give (tithes & offerings), Connect (get involved)
3. **Our Campuses** — `CampusCard` per campus with short name badge, location, service time rows
4. **Ministries** — First 5 `MinistryRow` (icon, name, description) + "View All Ministries" button
5. **RailsSection** — Payment Rails
6. **Leadership** — First 3 leaders
7. **About** — Organization description

---

### 4.22 Organization — Education Mode (`app/(tabs)/organization/index.tsx`)

**Purpose:** Academic administration overview

**Layout:**
1. **Institution header** — Graduation cap icon + name + type + location + founded year
2. **Key Metrics** — 4-card grid: Enrollment (+YoY%), Programs, Faculty (+ student-faculty ratio), Grad Rate
3. **Quick Actions** — 4-card grid: Schedule, Results, Metrics, Archive
4. **Current Term** — `TermCard` with "Current" badge, term name, dates
5. **Upcoming Events** — 4 `CalendarEventRow` (date badge, title, type) + "View Full Calendar" button
6. **Academic Departments** — First 4 `DepartmentCard` (name, program count)
7. **RailsSection** — Payment Rails
8. **Leadership** — First 4 faculty leaders + "View All Leadership" button
9. **About** — Description, accreditation, program formats

---

### 4.23 Organization — Community Mode (`app/(tabs)/organization/index.tsx`)

**Purpose:** K-1 Competition league overview

**Layout:**
1. **Organization header** — Flag icon + K-1 Competition + Racing League type + season info
2. **RailsSection** — Payment Rails

---

### 4.24 Settings (`app/settings.tsx`)

**Layout:**
1. Header with back button
2. **Account:** Name/email + Logout (if logged in) or Login (if not)
3. **Preferences:** Notifications, Appearance, Privacy
4. **Data:** Download Data, Clear Cache

---

### 4.25 Profile — Read-Only Context Mirror (v1 Locked)

**File:** `app/profile.tsx`
**Route:** Drawer → Profile

**Purpose:** Identity + context + access tier. Read-only mirror — no edit buttons in v1.

**Layout:**
1. **Header:** Title "Profile", back button
2. **Identity Block (read-only):**
   - Avatar (80px circle)
   - Display name
   - Role label
3. **Active Context Card (read-only table):**
   - **Mode** — e.g., `Enterprise`
   - **Organization** — e.g., `KaNeXT`
   - **Workspace** — e.g., `Default` (or program name for Sports)
   - **Role** — e.g., `Founder`
   - **Access** — `Public` | `Investor` | `CoFounder` | `Founder`

---

### 4.26 Game Detail (`app/coach/game-detail.tsx`)

**Purpose:** Individual game view with Live/Report separation

**Locked design rule:** Live tab = real-time awareness only (score, clock, play-by-play). Report tab = rolling analytical content.

**Report tab ONE UI rule:** Same sections in same order regardless of game state. Only data values change when game goes final.

**Report section order:** Score Header → Team Stats → Game Flow → Leaders → Box Score → Play-by-Play → Nexus Analysis → Ask Nexus CTA

---

### 4.27 Recruiting Board (`app/coach/recruiting.tsx`)

**Purpose:** CRM-style recruiting dashboard with pipeline management, filtering, and player evaluation.

**Two views:** Board (pipeline Kanban) | Players (national pool list)

**Board Filter Chips (`components/recruiting/board-filters.tsx`):**

| Chip | Type | Options |
|------|------|---------|
| Tiers | Multi-select | Elite (86-100), Franchise (82-85), Impact (78-81), Starter (74-77), Rotation (71-73), Bench (68-70), Depth (65-67), Project (0-64) — with division-contextual labels |
| Class | Multi-select | 2026, 2027, 2028 |
| Available | Multi-select, hierarchical | College (Portal/D1/D2/D3/NAIA/USCAA/NCCAA/3C2A), JUCO (D1/D2/D3), HS, International |
| Position | Multi-select, hierarchical | PG, CG, W, F, B → expandable to archetype sub-pills |
| Physical | Multi-select, hierarchical | Height ranges, Weight ranges, Wingspan ranges, Vertical ranges |
| KaNeXT | Single-select, hierarchical | Off KR / Def KR → 7 clusters → subclusters |
| Production | Single-select, hierarchical | Scoring/Efficiency/Playmaking/Rebounding/Defense stat groups |
| **Badges** | **Multi-select, two-level** | **Level pills (Gold/Silver/Bronze with canonical colors) + Offense/Defense groups → individual badge name pills (22 total). Filters players who have matching badges at matching levels.** |
| Stage | Multi-select | Watchlist, Targets, Priority, Commit, Signed, Closed |
| Pipeline | Multi-select | Southeast, Northeast, Midwest, Southwest, West Coast, International — shows roster connections per region |

**Card Layout (Board entries):**
1. Avatar + Name + tag badges (Level, Pos, Class)
2. School · Ht/Wt · Region (meta line)
3. 3-metric bar: KR | Fit | Risk
4. Pipeline pill (colored) + Momentum indicator (↑Trending/—Steady/↓Cooling)
5. Last Touch + Next Step (CRM fields)

**Quick Actions Sheet (4 sections):**
- Pipeline: 1-tap move pills (6 statuses)
- Contact: Text, Call, Email, Log Note
- Recruiting: Offer Aid %, Offer NIL, Schedule Visit, Set Task
- Share: Share to Staff Room, Pin to Staff

**Team Needs Strip:** Positional roster projection (PG/CG/W/F/B) showing retained/leaving/committed/signed/targeted/covered counts.

---

### 4.28 Team Statistics (`app/coach/stats.tsx`)

**Purpose:** Comprehensive team and player statistics workspace with dual data sources.

**Data source badges:** Synergy (truth layer — what happened) | KaNeXT (interpretation layer — what it means). Labels only, not tappable.

**Global split chips:** All | Conf | Non-Conf | Last 5 | Home | Away — filters all stats by game context.

**Two main tabs:** Team | Players

#### Team Sub-Tabs

**Overview:**
1. Team Identity Strip — logo, name, KR badge with Off/Def split
2. Synergy Efficiency — OFF PPP, DEF PPP, TEMPO (poss/game)
3. KaNeXT Projections — Proj W, Win%, Record, Confidence, projected seed, NAIA Tournament %
4. Four Factors — Offense vs Defense comparison: eFG%, TO%, ORB%, FT Rate
5. Synergy Offense — play type table (6 types: Play Type, Poss%, PPP, %, TO%) + Shot Profile bars (Rim/Mid/3PT) + Tempo Breakdown (Transition/Early/Halfcourt PPP)
6. Synergy Defense — play type table (6 types, PPP Allowed) + Shot Profile Allowed bars + Tempo Breakdown (PPP allowed) + Rim FG%/3PT Allowed/Contested stats
7. KaNeXT Cluster Ratings — 7 clusters with expandable subclusters
8. System Emphasis vs Reality — dual bar chart (system weights vs actual cluster averages)

**Offense:** Synergy play types (full) + KaNeXT Offense (OFF KR + 3 offense clusters)

**Defense:** Synergy defense play types + opponent shot profile + coverage breakdown (ball screen + post) + KaNeXT Defense (DEF KR + 4 defense clusters)

**Lineups:** Top 10 lineups with NET/OFF/DEF/REB%/TO%, detail sheet with shot profile and top play types

**Shot:** Offense/Defense toggle, shot profile bars, 3PT breakdown (C&S vs Off Dribble), assisted %

#### Players Sub-Tabs

**Overview:** Players sorted by usage with KR/Off KR/Def KR, USG%, PPP, percentile

**Offense:** Player Synergy PPP, top play type

**Defense:** Players sorted by DEF KR with On-Ball/Team/Reb clusters

**Player Types:** Players grouped by archetype (Offense-First, Defense-First, Two-Way, Shooter, Finisher, Playmaker)

**Shot:** Per-player shot profiles with mini bar charts (Rim/Mid/3PT)

**Player Detail Sheet:** Bottom sheet with Summary/Synergy/KaNeXT/Shot tabs

---

## 5. Key Components

### 5.1 Player Sheet (`components/player-sheet.tsx`)

**Type:** Bottom sheet (5 tabs for roster players, 5 tabs for recruits)

**Header:**
- Left: Avatar circle + name + jersey number
- Right: Level/position badges + social media glyphs (X, Instagram, KaNeXT Video — FontAwesome6 brand icons). Tap glyph → navigate to platform.

**Tabs (Roster):**

| Tab | Content |
|-----|---------|
| **BIO** | Current season stats (PPG/RPG/APG/FG%/3P%/TS%), archetype/role line, **player badges** (Bronze/Silver/Gold pills with canonical badge colors), highlights, awards, **Similar Players** (horizontal scroll — 5 players by position/archetype proximity, shows KR/awards), **Team Targets** (horizontal scroll — teammates from same school sorted by Fit KR with delta display, shows awards), identity, bio |
| **FIT** | Base → Fit delta card, system context, Off/Def split, role card (archetype/usage/touches/lineup slot/pairings), coach note input, **full breakdown waterfall** (always visible: Base KR → cluster deltas → = System Fit KR) |
| **KaNeXT** | 7 cluster bars (Shooting/Finishing/Playmaking/OBD/TMD/Rebounding/Physical), expandable subcluster rows, coach note input |
| **TIMELINE** | Career history by year with expandable stats grid (PPG/RPG/APG/FG%/3P%/FT%), **KR badges per season** (when available), cluster snapshots |
| **COMMS** | "Open Messages" button, comms timeline (touch/status_change/key_date/film_share), meta icons, relative timestamps, source chips |

**Tabs (Recruits):** Same 5 tabs (BIO, FIT, KaNeXT, TIMELINE, COMMS)

**Player Badges (`utils/player-badges.ts`):**
- Eligibility: Component KR ≥ threshold AND relevant trait(s) ≥ threshold
- Bronze ≥ 90, Silver ≥ 94, Gold ≥ 97
- Colors: Bronze=#CD7F32, Silver=#A8A9AD, Gold=#D4A843
- Max 1 Gold, 3 Silver, unlimited Bronze per player
- 13 offensive badges: Catch-and-Shoot, Movement Shooter, Deep Range, Pull-Up Shot Maker, Rim Finisher, Contact Finisher, Rim Pressure, FT Generator, Cutter, Primary Playmaker, Drive-and-Kick, Ball Security, Transition Playmaker
- 9 defensive badges: Point-of-Attack, Ball Pressure, Lockdown Perimeter, Rim Protector, Paint Anchor, Help Defender, Passing Lane Disruptor, Defensive Rebounder, Physical Rebounder
- Displayed as colored pills below archetype on Bio tab (both roster and recruit paths)

**Similar Players:** Filters PLAYER_POOL by same position or archetype, sorted by KR proximity, capped at 5.

**Team Targets:** Filters PLAYER_POOL by same currentSchool, computes Fit KR via `computeFitKR`, sorted by fitKR descending, capped at 5.

**System Picker (modal):** Two grids — Offensive (11 systems) + Defensive (9 systems). Pill-based selection, immediate close on select.

---

### 5.2 Depth Chart Units (`components/depth-chart/depth-chart-units.tsx`)

**Purpose:** System-aware depth chart with lineup optimization (largest component — 1,779 lines)

**Lineup Lens System:**
- 11 lenses: Overall KR, Offense KR, Defense KR, 7 clusters, BPR
- Auto-optimization: computes best 5-starter lineup (position-constrained) for active lens
- Spotlight: tap player avatar → shows individual cluster drivers
- Manual override: tap-select to swap players; "Manual" badge appears
- Reset button: reverts to lens-driven lineup

**Systems Accordion:**
- Offense: 11 systems (single-tap = temp, double-tap = save)
- Defense: 9 systems (same dual-mode)
- Saved systems persist to program context (AsyncStorage)
- Icons indicate saved state (white dot in corner)

**Lineup Rating:**
- KR block: Large center number (53% off + 47% def), OFF/DEF splits
- Why tags: top 2 positive, 1 negative

**Depth Layout:**
- 5 starters (position-specific slots: PG/CG/W/F/B)
- 4-player rotation bench (9-player set)
- Remaining bench players

**Player Row Interactions:**

| Element | Tap | Long-Press |
|---------|-----|------------|
| Jersey circle | Select/swap | Open PlayerSheet |
| Name + physicals | Open bio | Open PlayerSheet |
| KR/BPR badge | Swap confirmation | — |

---

### 5.3 Team Quick Sheet (`components/team-quick-sheet.tsx`)

**Sections:**
1. Identity header (logo, name, subline, KR badge with O/D split)
2. Staff snapshot (Head Coach, Assistants)
3. Season snapshot (Overall, Conference, Streak, Conf Rank)
4. Traditional/KaNeXT toggle for stats view
5. Stats (5 offense + 5 defense + 3 rebounding stats OR 7 cluster bars)
6. Keys summary (strongest/weakest clusters, identity)
7. Upcoming games (with sim win %)
8. Recent games (with results and sim win %)

---

### 5.4 KR Details Sheet (`components/kr-details-sheet.tsx`)

**Sections:**
1. Off/Def KR pills (large numbers)
2. Program Context card (systems, tempo)
3. System Fit card (off%, def%)
4. Top Drivers (1-3 players by KR)
5. Biggest Fit Gap (tag: under-covered)

---

### 5.5 Live Game Panel (`components/live-game-panel.tsx`)

**Purpose:** Inline game-day widget (embedded in Home when game is live)

**4 tabs:** Plays | Box | Team | Leaders

- **Plays:** Play-by-play with filters (scoring, fouls, subs, timeouts)
- **Box:** Box score (FMU vs opponent)
- **Team:** Team stats (FG%, 3P%, TO%, etc.)
- **Leaders:** Top scorers, rebounders, etc.

---

### 5.6 Program Context Section (`components/program-context-section.tsx`)

**Purpose:** Inline program configuration (systems, cluster weights, biases, position importance)

**Sections (all collapsible, closed by default):**
- Offensive System (11 options)
- Defensive System (9 options)
- Cluster Weights (7 sliders)
- Position Importance (5 sliders)
- Biases (8 toggle + strength controls)
- Current Focus items

---

## 6. Data Objects

### 6.1 Core Entities

| Entity | Key Fields | Source |
|--------|-----------|--------|
| `User` | id, name, displayName, avatar, primaryRole, organizations | `types/index.ts` |
| `Organization` | id, name, mode, type, location | `types/index.ts` |
| `Program` | id, name, level (varsity/dev_1/dev_2/postgrad) | `types/index.ts` |
| `Cycle` | id, name, startDate, endDate, isCurrent | `types/index.ts` |

### 6.2 Sports Data

| Object | Key Fields | Source |
|--------|-----------|--------|
| `FMUGame` | opponent, date, location, status, score, clock, gameType, opponentKR | `data/fmu.ts` |
| `SeasonLeader` | name, number, ppg, rpg, apg, fgPct, threePct | `data/fmu.ts` |
| `BoxScoreLine` | name, min, pts, reb, ast, fg, threePt, ft | `data/fmu.ts` |
| `PlayerBPR` | name, archetype, bpr, bprLabel, kr | `data/fmu.ts` |
| `ClusterRatings` | shooting, finishing, playmaking, perimeter_defense, interior_defense, rebounding, frame | `data/roster-data.ts` |
| `RosterMeta` | status, statusNote, aidPct, nilActive, rosterNotes | `data/roster-data.ts` |
| `PlayerPhysicals` | height, weight | `data/roster-data.ts` |

### 6.3 Recruiting Data

| Object | Key Fields | Source |
|--------|-----------|--------|
| `PoolPlayer` | id, firstName, lastName, position, height, weight, classYear, currentSchool, level, conference, archetype | `data/playerPool.ts` |
| `POOL_PLAYER_AWARDS` | Record<string, string[]> — awards keyed by player ID | `data/playerPool.ts` |
| `PlayerRatings` | playerId, overall, clusters (7-cluster map) | `data/playerRatings.ts` |
| `PlayerSeason` | playerId, season, school, level, gp, mpg, ppg, rpg, apg, spg, bpg, fgPct, threePct, ftPct, kr? | `data/playerSeasons.ts` |
| `PlayerBadge` | name, level (Bronze/Silver/Gold), component (cluster key) | `utils/player-badges.ts` |
| `BoardEntry` | id, playerId, status, priority, rank, position, tags, notes, scholarshipPct, nilAmount | `data/recruitingBoard.ts` |
| `BoardStatus` | Watchlist → Targets → Priority → Commit → Signed → Closed | `data/recruitingBoard.ts` |

### 6.4 Business/Enterprise Data

| Object | Key Fields | Source |
|--------|-----------|--------|
| `PowerMetric` | id, label, value, delta, deltaType, visibility (RoleView[]) | `data/mock-business.ts` |
| `TodayNextItem` | id, label, status, detail | `data/mock-business.ts` |
| `RoadmapPhase` | id, phase, label, status, objective, deliverables, proofArtifacts, risks, successLooksLike | `data/mock-business.ts` |
| `Wedge` | id, name, org, icon, color, summary, proofEvents, advantages, modes | `data/mock-business.ts` |
| `CapitalRound` | id, round, status, target, raised, equity | `data/mock-business.ts` |
| `MockTransaction` | id, description, amount, date, status, org, type | `data/mock-business.ts` |
| `ProofEvent` | id, name, stage, kpis, milestones, opsActions, risks, constraints | `data/mock-enterprise-v2.ts` |
| `Document` | id, title, category, tags, summary, visibility, updatedAt | `data/mock-enterprise-v2.ts` |
| `BoardMember` | name, role, company | `data/mock-enterprise-v2.ts` |

### 6.5 Church Data

| Object | Key Fields | Source |
|--------|-----------|--------|
| `ICC_ORGANIZATION` | name, denomination, location, campusCount | `data/mock-church.ts` |
| `Campus` | id, name, shortName, location, address, serviceTimes[] | `data/mock-church.ts` |
| `Ministry` | id, name, icon, description | `data/mock-church.ts` |
| `Message` | id, title, speaker, date, duration, series? | `data/mock-church.ts` |
| `GivingOption` | id, name, description | `data/mock-church.ts` |

### 6.6 Education Data

| Object | Key Fields | Source |
|--------|-----------|--------|
| `FMU_ORGANIZATION` | name, type, location, enrollment | `data/mock-education.ts` |
| `AcademicTerm` | id, name, startDate, endDate, isCurrent | `data/mock-education.ts` |
| `CalendarEvent` | id, title, type, date, description? | `data/mock-education.ts` |
| `Department` | id, name, description, programCount | `data/mock-education.ts` |
| `FacultyMember` | id, name, title, bio, role | `data/mock-education.ts` |
| `InstitutionalMetrics` | enrollment, academics, outcomes | `data/mock-education.ts` |
| `AcademicYearArchive` | year, enrolled, graduates, gradRate, highlights[] | `data/mock-education.ts` |

### 6.7 Community Data

| Object | Key Fields | Source |
|--------|-----------|--------|
| `K1Team` | id, name, abbreviation, color, homeTrack, wins, points, drivers[] | `data/mock-community.ts` |
| `K1Driver` | id, number, name, nationality, team, points, avgFinish | `data/mock-community.ts` |
| `K1Event` | id, name, track, location, date, laps, status, winner?, weather | `data/mock-community.ts` |
| `K1Standing` | position, driverId, wins, podiums, points, gap | `data/mock-community.ts` |
| `K1Rule` | id, category, title, summary | `data/mock-community.ts` |

### 6.8 Video/Media Data

| Object | Key Fields | Source |
|--------|-----------|--------|
| `VideoGame` | id, opponent, date, result, score, clipCount, duration | `data/mock-video.ts` |
| `VideoClip` | id, title, gameId, type (highlight/breakdown/drill/scout), duration | `data/mock-video.ts` |
| `Reel` | id, title, caption, duration, playerTag, teamTag, likes, saves | `data/mock-video.ts` |
| `StoryCircle` | id, name, initials, hasNew, isYou | `data/mock-video-feed.ts` |
| `VideoFeedPost` | id, authorName, caption, media, likes, comments, liked, saved | `data/mock-video-feed.ts` |
| `VideoInboxThread` | id, title, participants, lastMessage, unread, mediaAttachment | `data/mock-video-inbox.ts` |

### 6.9 Comms/Messaging Data

| Object | Key Fields | Source |
|--------|-----------|--------|
| `FeedPost` | id, type, author, timestamp, filter, body, clipTitle | `data/mock-messages.ts` |
| `InboxThread` | id, title, participants, lastMessage, unread | `data/mock-messages.ts` |
| `AlertItem` | id, severity, title, sourceTag, cta, resolved | `data/mock-messages.ts` |
| `CommsEntry` | id, type, timestamp, author, body, touchMethod, sourceChip | `data/mock-comms.ts` |

### 6.10 Nexus/Conversation Data

| Object | Key Fields | Source |
|--------|-----------|--------|
| `Conversation` | id, title, type, participants, isPinned, evalConfig, simConfig, gameOpsConfig | `types/index.ts` |
| `Message` | id, conversationId, role, content, metadata | `types/index.ts` |
| `SimulationResult` | id, type, homeTeam, awayTeam, winProbability, projectedScore, confidence, drivers | `types/index.ts` |
| `EvalSnapshot` | id, playerName, summary, strengths, areasForGrowth, projectedImpact | `types/index.ts` |
| `FinderResult` | id, label, subtitle, type, icon, route | `data/mock-finder.ts` |

### 6.11 Program Context

| Object | Key Fields | Source |
|--------|-----------|--------|
| `ProgramContext` | programId, scholarships, nilBudget, systemPreset, offensiveStyle, defensiveStyle, tempo, clusterWeights, positionImportance, biases | `types/index.ts` |

---

## 7. Evaluation Engines (Canonical Spec)

All evaluation engine specs are **LOCKED** — canonical and require explicit approval for changes.

### 7.1 Player Evaluation Engine (Engine 01)

**Pipeline (Steps 0-9):**

| Step | Name | Description |
|------|------|-------------|
| 0 | Coach Context Setup | Program, governing body, division, systems (LOCKED) |
| 1 | Mode Auto-Detection | Detect evaluation mode from input |
| 2 | Player Profile Build | Assemble player identity data |
| 3 | RUN EVAL Trigger | Begin evaluation |
| 4 | Trait Scoring | Deterministic scoring using volume + efficiency with shrinkage |
| 5 | Overrides (pre-base) | 8 college positive overrides (+0.75 to +5.0 KR), 4 pro overrides |
| 6 | Position Weighting + Base KR | Cluster-weighted KR compute with badge application |
| 7 | Base Truth Lock | Player Truth becomes immutable |
| 8 | System Fit Application | Contextual weighting per offensive/defensive system |
| 9 | Finalization + Level Interpretation | Level normalization + legend tier assignment |

**Trait Library:** 54 atomic basketball skills across 7 clusters:
- Shooting (7 sub-traits), Finishing (5), Playmaking (7)
- Perimeter Defense, Interior Defense, Rebounding, Physical

**21 Archetypes:** Two-Way Wing, 3-and-D Wing, POA Defender Guard, Primary Ball-Handler, Stretch Big, etc. Each has must-have traits, supports, and auto-disqualifiers.

**Badge System (KaNeXT Badges):**

| Level | College Threshold | College Bonus | Pro Threshold | Pro Bonus |
|-------|------------------|---------------|---------------|-----------|
| Bronze | 90 | +3 | 93 | +2 |
| Silver | 94 | +6 | 96 | +4 |
| Gold | 97 | +10 | 98-99 | +7 |

- Max 1 Gold, 3 Silver, unlimited Bronze per player
- Per-component cap: +12 (college) / +8 (pro)
- Overall cap: +3.5 (college) / +2.5 (pro)
- 31 offensive badges, 16 defensive badges

**KR Legend Tiers (College — NCAA D1 High-Major example):**
- 98-100: National Player of the Year candidate
- 95-97: All-American
- 90-94: All-Conference
- 85-89: High-level starter
- ... down to below 68

**KLVN (Level Normalization):** Makes performance comparable across competitive environments. Canonical levels: Pre-College through NCAA D1.

**BPR (Basketball Performance Rating):** Zero-centered impact metric (0 = average, +10 = game-warping, -4 = consistent negative). Internal reference only, not user-facing. Validates KR honesty.

**4 Impact Modifiers:** Primary Engine, Secondary Engine, Force Multiplier, Specialist Anchor (KLVN-normalized signals only)

---

### 7.2 Team Evaluation Engine (Engine 02)

**Team KR Formula (LOCKED):**
```
Team_Offense_KR = Σ(Final_System_Offense_KR_i × w_i)
Team_Defense_KR = Σ(Final_System_Defense_KR_i × w_i)
Team_KR = (Offense × 0.53) + (Defense × 0.47)
```

- Rotation-only model, 5% participation threshold
- 7 Canonical Clusters (immutable): Shooting, Finishing, Playmaking, On-Ball Defense, Team Defense, Rebounding, Physical
- Offense clusters (Shooting/Finishing/Playmaking) → minutes x usage weighted
- Defense/Physical clusters → minutes-weighted only

**System Demand Profiles (11 Offensive + 9 Defensive):**

**Offensive Systems:**
1. Spread Pick-and-Roll
2. 5-Out Motion
3. Motion / Read & React
4. Pace & Space
5. Dribble Drive
6. Princeton
7. Flex
8. Swing
9. Post-Centric / Inside-Out
10. Moreyball
11. Heliocentric

**Defensive Systems:**
1. Containment Man
2. Pack Line
3. Pressure Man
4. Switch Everything
5. ICE / No Middle
6. Zone Structured
7. Matchup Zone
8. Press
9. Junk / Special

Each system defines Critical (A), High (B), Optional (C) archetype requirements and impact modifier needs.

**Scholarship & NIL Allocation Engine:** Resource constraint system for roster management.

---

### 7.3 Global Player & Team Evaluation Engine (Engine 03)

- National Player Pool management
- Global Player + Team Database (worldwide)
- System Inference Engine (SIE) — infers opponent offensive/defensive systems
- OSIE/DSIE Protocol — team system inference from Preseason → In-Season → Postseason

---

### 7.4 Scouting Evaluation Engine (Engine 04)

**Game Ops Intelligence Flow:** Pregame → In-Game → Halftime → Postgame

- Scout Confidence Gate (percentage-based locked table)
- Postgame Confidence Gate

**Game Impact Scores:**
- BPR (Basketball Performance Rating) — per-player game impact
- TPQ (Team Performance Quality) — team-level impact, display scale 0-10

---

### 7.5 Simulation Evaluation Engine (Engine 05)

- Possession Engine — play-by-play simulation
- System × System Interaction matrices
- Offensive Archetype × Defensive Systems matchups
- Defensive Archetype × Offensive System matchups
- Simulation Confidence Gate
- Modifier Framework
- Matchup Interaction Governance

**Simulation Types:** `single_game`, `tournament`, `season`

---

### 7.6 Development Intelligence Engine (Engine 06)

- Development & Pathway Page specification
- Player development plans with focus areas and progress tracking

---

## 8. Fit KR Engine (`utils/fit-kr.ts`)

**Purpose:** Computes system-adjusted player ratings using cluster weights x player cluster scores.

**Key Functions:**

| Function | Description |
|----------|-------------|
| `computeFitKR(clusters, offStyle, defStyle)` | 0-100 fit rating |
| `computePositionKR(clusters, position)` | Position-lens KR |
| `canPlayPosition(clusters, targetPosition)` | Archetype qualification check |
| `deriveArchetype(clusters, position)` | Derive archetype from clusters + position |
| `computeLineupRating(starterClusters, offStyle, defStyle, minutes)` | Lineup OFF/DEF/Net KR |
| `getClusterDrivers(starterClusters)` | Top 3 cluster strengths |
| `computeOffDefKR(clusters, offStyle, defStyle)` | Base + fit OFF/DEF KR |
| `getFitReasons(clusters, archetypes, offStyle, defStyle)` | 3-4 structured fit reasons |

**Position-Specific Cluster Weights:** PG, CG, W, F, B each have unique weighting profiles across 7 clusters.

---

## 8.1 Player Badge Engine (`utils/player-badges.ts`)

**Purpose:** Computes earned badges for a player based on component KR and subcluster trait scores.

**Badge Eligibility:** Component KR ≥ threshold AND all relevant trait(s) ≥ threshold.

**Thresholds:**

| Level | Min Score | Color |
|-------|-----------|-------|
| Gold | 97 | #D4A843 |
| Silver | 94 | #A8A9AD |
| Bronze | 90 | #CD7F32 |

**Caps:** Max 1 Gold, 3 Silver, unlimited Bronze per player.

**Canonical Badge List:**

| Category | Badges (22 total) |
|----------|-------------------|
| Shooting (4) | Catch-and-Shoot, Movement Shooter, Deep Range, Pull-Up Shot Maker |
| Finishing (5) | Rim Finisher, Contact Finisher, Rim Pressure, FT Generator, Cutter |
| Playmaking (4) | Primary Playmaker, Drive-and-Kick, Ball Security, Transition Playmaker |
| Perimeter Defense (4) | Point-of-Attack, Ball Pressure, Lockdown Perimeter, Passing Lane Disruptor |
| Interior Defense (3) | Rim Protector, Paint Anchor, Help Defender |
| Rebounding (2) | Defensive Rebounder, Physical Rebounder |

**Exports for filtering:** `OFFENSIVE_BADGE_NAMES`, `DEFENSIVE_BADGE_NAMES`, `ALL_BADGE_NAMES`, `BADGE_LEVELS`

---

## 8.2 Recruiting Helpers (`utils/recruiting-helpers.ts`)

**Purpose:** Utility functions for recruiting board computations.

| Function | Description |
|----------|-------------|
| `getPlayerRegion(state)` | State abbreviation → region (Southeast, Northeast, Midwest, etc.) |
| `getPlayerAvailability(player)` | Derive availability from level |
| `computeConfidence(player, ratings)` | 0-100 confidence score |
| `computeMomentum(boardEntry, comms)` | 'up' / 'neutral' / 'down' from recent touches |
| `getLastTouch(comms)` | Most recent communication entry |
| `parseHeightToInches(heightStr)` | "6-4" → 76 |
| `computeWingspan(playerId, heightInches, position)` | Estimated wingspan in inches |
| `computeVertical(playerId, position)` | Estimated vertical in inches |

**Region Options:** Southeast, Northeast, Midwest, Southwest, West Coast, International

**Physical Ranges:** Height (4 buckets), Weight (4 buckets), Wingspan (4 buckets), Vertical (4 buckets)

---

## 9. Roles & Permissions

### 9.1 Defined Roles (`types/index.ts`)

| Mode | Roles |
|------|-------|
| Sports | admin, head_coach, assistant_coach, gm, student_athlete, fan, agent, scout, donor, media |
| Enterprise | founder, investor, viewer |
| Church | member, staff, leadership |
| Education | faculty, student |
| Community | league_admin, team_owner, driver |

### 9.2 Auth + Access Tier + Default Routing (v1 Locked)

**Goal:** Apple/X-style login → assign Access Tier → route into app.

#### 9.2.0 Canonical Default Entry

After tier is resolved, the app MUST route to **Business / Enterprise Mode Home** (KaNeXT business mode), not Sports. This is the universal default landing screen for v1 across all tiers (unless a deep link specifies a specific mode/screen).

#### 9.2.1 Launch + Session Check

1. Launch → Splash
2. Silent session check
3. If session valid → Resolve tier → Route to **Business Mode Home**
4. If no session → Show auth modal (full-screen)

#### 9.2.2 Auth Modal (Sign-in First)

Full-screen modal with: Continue with Apple, Continue with Google, Continue with Email. Successful auth creates/returns user account → immediately run Tier Resolver → route to **Business Mode Home**.

#### 9.2.3 Deep Link Invite Handling (Investor)

Accepted formats:
- `kanext://invite?code=<INVITE_CODE>`
- `https://kanext.app/invite/<INVITE_CODE>`

Behavior: On receiving invite code → save `pendingInviteCode` → if not signed in, force Auth modal → after sign-in, validate invite code → assign INVESTOR if valid → clear `pendingInviteCode` → route to **Business Mode Home**.

#### 9.2.4 Tier Resolver (Locked) — PBD Patch Applied

**Inputs:** user.email, pendingInviteCode (optional), founderAllowlist[] (static), cofounderAllowlist[] (static), inviteCodes[] (static)

**Logic (strict priority):**
1. If email in founderAllowlist → `FOUNDER`
2. Else if email in cofounderAllowlist → `COFOUNDER` *(Patrick Bet-David)*
3. Else if pendingInviteCode is valid → `INVESTOR`
4. Else → `PUBLIC`

**Files:** `config/access.ts` (allowlists + resolver), `config/invites.ts` (invite codes)

**Storage:** Persisted on AuthSession (`session.tier`) and AsyncStorage (`kx:accessTier`).

#### 9.2.5 Post-Auth Routing Rules (Locked)

- Default route (no deep link): **Business / Enterprise Mode Home**
- Universal bottom nav remains present (Home / Media / Nexus / Messages / Organization)
- "Home" tab always opens the **current mode's home**
- Default current mode after login = **Business / Enterprise**

#### 9.2.6 Access Tiers (4 Tiers — Locked)

| Tier | Source | Access |
|------|--------|--------|
| `founder` | Email in `FOUNDER_ALLOWLIST` | Full access. All modes, all data, all overlays. |
| `cofounder` | Email in `COFOUNDER_ALLOWLIST` | Founder-level access + PBD-specific views (Capital tranches, Board seat activation, Distribution flywheel). |
| `investor` | Valid invite code | Read access to Business mode. RBAC-filtered views (investor + public data). |
| `public` | Default fallback | Limited read access. Public-visible data only. |

#### 9.2.7 Legacy Auth States (retained for compatibility)

| State | Access |
|-------|--------|
| Unauthenticated | Home (limited), Organization (read-only). Nexus locked. |
| Viewer | All read surfaces. No state mutation. |
| Owner | Full access. Can edit program context, manage roster, configure systems. |

### 9.3 Visibility Controls

- `ActivityItem.visibility`: Array of `Role[]` controlling who sees each activity
- `DocumentVisibility`: founder, investor, public (Enterprise mode)
- `ShareVisibility`: public, org, team, staff, assigned (Media)
- `LinkVisibility`: Staff, Team, Player, 1:1 (Coach Library)
- `PowerMetric.visibility`: founder, investor, public (Business Dashboard)

### 9.4 Permission Behavior by Screen

| Screen | Unauthenticated | Viewer | Owner |
|--------|----------------|--------|-------|
| Home | Read-only, no actions | Full read | Full read + actions |
| Nexus | **Locked** (dimmed) | Full Nexus | Full Nexus + overlays |
| Media | Read-only feed | Full feed + interact | Full + upload/create |
| Activity | **UNSPECIFIED** | Read + reply | Full compose + manage |
| Organization | Read-only overview | Full read | Full + manage programs |
| Settings | Login only | All settings | All settings + sign out |

---

## 10. Theming & Design System

### 10.1 Color System (`constants/theme.ts`)

**Brand Colors:**
- Primary: `#FFFFFF` (white — monochrome authority)
- Precision / Nexus Accent: `#6AA9FF` (Ice Blue)
- Success: `#22C55E`, Warning: `#F59E0B`, Error: `#EF4444`

**Mode Colors:**
- Sports: `#2563EB`
- Enterprise: `#8B5CF6`
- Church: `#D946EF`
- Education: `#0D9488`
- Community: `#F97316`

**Dark Theme (enforced):**
- Background: `#000` / `#0d0d0d` / `#1a1a1a`
- Text: `#f5f5f5` / `#a0a0a0` / `#6e6e6e`
- Cards: `#111`
- Dividers: `rgba(255,255,255,0.06)`

**Business Palette (BP):**
- champagneGold: `#D4AF37`, obsidian: `#0A0A0A`, carbon: `#111`, graphite: `#1a1a1a`
- smoke: `#ccc`, ash: `#888`, platinum: `#aaa`, glass: `rgba(255,255,255,0.06)`
- emerald: `#22C55E`, amber: `#F59E0B`, red: `#EF4444`

### 10.2 Typography
- Platform-specific font families (iOS: System, Android: Roboto, Web: system-ui)
- Sans, serif, rounded, mono families defined

### 10.3 Spacing
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, xxl: 48px

### 10.4 Border Radius
- sm: 4px, md: 8px, lg: 12px, full: 9999px

### 10.5 Layout Constants
- `topBarHeight`: 56
- `tabBarHeight`: 96
- `avatarSize`: 32
- `maxContentWidth`: 600

---

## 11. Persistence & State Management

### 11.1 AsyncStorage Keys

| Key | Purpose |
|-----|---------|
| `kx:session` | AuthSession JSON |
| `kx:onboardingComplete` | Onboarding flag |
| `kx:lastMode` | Last selected mode |
| `kx:hasCompletedModePick` | Mode gate completion flag |
| `kx:auth` | Auth state (viewer/owner) |
| `kx:sportsOrganization` | Selected sports org |
| `kx:sportsProgram` | Selected program |
| `kx:sportsSeason` | Selected season |
| `kx:programContext:{id}` | Program context JSON (systems, weights, biases) |
| `kx:recruitingBoard` | Recruiting board entries |

### 11.2 Auto-Save Pattern
- 500ms debounce for writes
- Versioning (max 20 versions) for program context
- Same pattern used by recruiting board store

### 11.3 Global Controllers (Module-Level State)

| Controller | File | API |
|------------|------|-----|
| Avatar Drawer | `utils/global-drawer.ts` | `openAvatarDrawer()`, `closeAvatarDrawer()` |
| Voice | `utils/global-voice.ts` | `startGlobalVoice()`, `stopGlobalVoice()` |
| Finder | `utils/global-finder.ts` | `openFinder()`, `closeFinder()` |
| Game Ops | `utils/global-game-ops.ts` | `triggerGameOps(gameId, opponent)` |
| Home Reset | `utils/global-home.ts` | `requestHomeReset()` |
| Team Sheet | `utils/global-team-sheet.ts` | `registerTeamSheetHandlers()` |
| Ask Nexus | `utils/global-ask-nexus.ts` | `registerAskNexusHandlers()` |
| Transition | `utils/global-transition.ts` | `triggerKXTransition()` |
| Mode Switcher | `utils/global-mode-switcher.ts` | `registerModeSwitcherHandlers()` |

All use the same pattern: `register*Handlers(open, close)` + `open*()` / `close*()`.

---

## 12. Current Demo Context

### 12.1 Demo User
- **Name:** Sammy Kalejaiye
- **Role:** Head Coach / GM
- **Avatar:** `assets/images/sammy-kalejaiye.jpg`
- **Organization:** Florida Memorial University
- **Program:** Varsity
- **Season:** 2025-26

### 12.2 Demo Team — Florida Memorial University
- **Level:** NAIA
- **Conference:** Sun Conference
- **Colors:** Royal Blue + Gold
- **Seal:** `assets/images/fmu-seal.png`
- **Roster:** 17 players (#0-#55) with full cluster ratings, physicals, status metadata

### 12.3 Demo Organizations (All Modes)

| Mode | Organization | Role | Cycle |
|------|-------------|------|-------|
| Sports | Florida Memorial University | Head Coach | 2025-26 Season |
| Sports | Middlebrooks Academy | Head Coach | — |
| Sports | Cathedral HS | Head Coach | — |
| Enterprise | KaNeXT | Founder | FY 2025 |
| Church | International Christian Center | Member | 2025 |
| Education | San Diego Christian College | Faculty | 2025-26 |
| Community | K-1 Competition | League Admin | Season 1 · 2026 |

---

## 13. Cross-Mode Patterns

### 13.1 Shared Patterns Across All Modes
1. **PagerView** for swipeable hub tabs on every Home screen
2. **ScrollView** for tab content with `paddingBottom: 120` (tab bar clearance)
3. **Identity Block** in Home tab (except Sports which uses team identity bar)
4. **VideoHeroCard** in Home tab — mode-specific highlight media
5. **RailsSection** (Payment Rails) in Home tab — Tickets, Donations, Ledger
6. **Card wrapper** with border + padding (consistent across modes)
7. **Section labels** — uppercase, small, tertiary color
8. **Stat rows** — 3-column centered grids
9. **Ask Nexus CTA** at bottom of dashboard tabs

### 13.2 Mode-Aware Shared Screens

| Screen | Mode Detection | Mode-Specific Data | Mode-Specific UI |
|--------|----------------|-------------------|------------------|
| Video Home | `useMode()` | Stories + Posts per mode | Same layout, content swap |
| Activity Feed | `useMode()` | Scope chips + Posts per mode | Same layout, label swap |
| Nexus | `useMode()` | Glyph color per mode | Locked state color varies |
| Organization | `useMode()` | Entire screen swaps per mode | Full mode-specific layouts |
| Reels | None | Generic | Mode-agnostic |
| Create | None | Generic | Mode-agnostic |
| Inbox | None | Generic | Mode-agnostic |
| You/Film Room | None | Sports-only (FMU data) | Sports-centric |

---

## 14. UNSPECIFIED Items

The following features are referenced in the codebase or spec but lack complete implementation:

| Item | Status |
|------|--------|
| Community — Race Ops tab | Placeholder — "Coming soon" |
| Community — Wildcard tab | Placeholder — "Coming soon" |
| Community — Commercial tab | Placeholder — "Coming soon" |
| Community — Sim tab | Placeholder — "Coming soon" |
| Community — Development tab | Placeholder — "Coming soon" |
| Community Organization screen | Minimal — header + Rails only |
| Story circle tap behavior (Media) | Haptic only — no story viewer |
| Video playback | Placeholder cards with play button — no actual video player |
| Push notifications | Not implemented (only mock notification data) |
| Real authentication | Mock auth (demo sessions). No real OAuth/Apple/Google |
| Real AI responses | OpenAI GPT-4o connected, but requires API key. Falls back gracefully |
| Multiplayer/real-time sync | Not implemented (all local state + mock data) |
| Coach Library save/link management | Sheet exists, persistence UNSPECIFIED |
| Nexus Simulation UI | Overlay + context exists, detailed sim builder UI UNSPECIFIED |
| Recruiting board drag-and-drop | Board entry CRUD exists in store, drag gesture UNSPECIFIED |
| Film room video playback | Card UI exists, actual playback UNSPECIFIED |
| Deep linking from external sources | Routes are typed but no universal link config |
| Offline support | AsyncStorage persistence exists, but no explicit offline-first strategy |
| Analytics/telemetry | Not implemented |
| Accessibility | Semantic labels on tab buttons. Broader a11y audit UNSPECIFIED |
| Synergy/KaNeXT source badges (Stats) | Currently labels only — could become tappable filters |
| Social media glyph navigation (Player Sheet) | Tap targets placeholder (no deep link URLs) |
| You/Film Room mode variants | Currently sports-only. No enterprise/church/education/community variants |

---

*End of spec.*
