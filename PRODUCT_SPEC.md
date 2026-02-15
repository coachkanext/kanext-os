# KaNeXT App — Full Product Spec (Current Repo)

> Generated 2026-02-14, updated 2026-02-14. Where behavior could not be confirmed from source, the field is marked **UNSPECIFIED**.

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
- `components/` — 97 component files across root, `ui/`, `media/`, `messages/`, `nexus/`, `recruiting/`, `depth-chart/`, `game/`

### Data & State
- `data/` — 24+ data files (fmu.ts, roster-data.ts, mock-messages.ts, playerPool.ts, playerRatings.ts, playerSeasons.ts, player-stats.ts, team-needs.ts, system-demand-profiles.ts, stats/synergy-data.ts, stats/projections.ts, etc.)
- `utils/` — Global controllers, fit-kr engine, player-badges engine, recruiting-helpers, OpenAI client, board store
- `context/` — auth-context.tsx, app-context.tsx, nexus-context.tsx
- `hooks/` — use-color-scheme, use-theme-color, use-speech-recognition
- `constants/theme.ts` — Colors, fonts, spacing, layout constants

---

## 1. System Overview

### 1.1 What Is KaNeXT OS

KaNeXT OS is a cross-platform mobile application built with **Expo** and **React Native**. It is a multi-modal organizational operating system that adapts its UI, data, and intelligence layer based on the selected **Mode**:

| Mode | Organization Example | Primary Role | Cycle |
|------|---------------------|--------------|-------|
| Sports | Florida Memorial University | Head Coach / GM | 2025-26 Season |
| Enterprise | KaNeXT | Founder | FY 2025 |
| Church | International Christian Center | Member | 2024-25 |
| Education | San Diego City College | Faculty | Fall 2024 |

### 1.2 App Identity

- **App Name:** kanext-os
- **Version:** 1.0.0
- **Platforms:** iOS, Android, Web
- **Routing:** Expo Router (file-based, typed routes)
- **Theme:** Dark-first design (forced dark mode on web)

### 1.3 Experiments Enabled
- `typedRoutes: true` — Type-safe route navigation
- `reactCompiler: true` — React Compiler optimizations
- `newArchEnabled: true` — React Native New Architecture (in native config)

### 1.4 Key Dependencies
- `@gorhom/bottom-sheet` v5 — All bottom sheets
- `react-native-pager-view` — Swipeable tab pages
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
- `SplashScreen` — Cold-start boot splash (X/Twitter style, 2s minimum)

### 2.3 Main Tab Bar (`app/(tabs)/_layout.tsx`)

| Tab | Route | Icon (SF Symbol) | Visible | Custom Button |
|-----|-------|-------------------|---------|---------------|
| Home | `index` | `house.fill` | Yes | `HomeTabButton` |
| Media | `media` | `play.rectangle.fill` | Yes | `TransitionTab` |
| Search | `search` | — | **Hidden** (`href: null`) | — |
| Nexus | `nexus` | `figure.mind.and.body` | Yes | `NexusTabButton` |
| Activity | `activity` | `bubble.left.and.bubble.right.fill` | Yes | `TransitionTab` |
| Organization | `organization` | `building.2.fill` | Yes | `TransitionTab` |

**Initial route:** `nexus`

**Tab bar styling:** No labels, dark background, hairline top border, platform-specific height.

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
- **UI:** Ultra-minimal 2x2 grid of mode tiles
- **Tiles:** Sports, Enterprise, Church, Education
- **Colors:** Black/white only. Gold accent (`#C9A227`) for tap feedback only
- **Behavior:** Tap = immediate commit + navigate. No dismiss, no tagline, no footer
- **Haptics:** Medium impact on selection

### 3.2 Authentication

**File:** `components/auth-modal.tsx`, `context/auth-context.tsx`

- **Gate:** Full-screen modal overlays Nexus until authenticated
- **Providers:** Apple (black), Google (white), Email (bordered)
- **Animation:** Slide-up on appear
- **Session Storage:** AsyncStorage keys `kx:session`, `kx:onboardingComplete`
- **States:** `isChecking` → `isAuthenticated` / `isNewUser`

### 3.3 Nexus Tab Gestures

**File:** `app/(tabs)/_layout.tsx` — `NexusTabButton`

| Gesture | Behavior |
|---------|----------|
| Single tap | KX transition animation + navigate to Nexus |
| Long-press (400ms) | Start global voice input (VoiceOverlay appears) |
| Double-tap (<350ms) | Open Universal Finder (Spotlight search) |

### 3.4 Home Tab Gestures

**File:** `app/(tabs)/_layout.tsx` — `HomeTabButton`

| Gesture | Behavior |
|---------|----------|
| Single tap | KX transition + navigate home + request home reset (scroll to top) |
| Long-press (400ms) | Open Avatar Drawer |

### 3.5 Bottom Sheet System

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

### 3.6 Avatar Drawer

**File:** `components/avatar-drawer.tsx`

- **Trigger:** Long-press Home tab, or avatar press in GlobalHeader
- **Style:** Twitter/X-style left slide drawer (82% width, max 300px)
- **Animation:** Spring open/close + fade backdrop
- **Content:**
  - Identity header: avatar + name, mode/org, program/cycle
  - Primary nav: Profile, Video, Open Nexus
  - Divider
  - Utility nav: Settings, Help, Terms, Sign Out (if logged in)

### 3.7 Universal Finder

**File:** `components/universal-finder.tsx`, `utils/global-finder.ts`

- **Trigger:** Nexus double-tap
- **UI:** Modal overlay with auto-focused search bar ("Find anything...")
- **Results:** Filtered from `MOCK_FINDER_INDEX` by query match
- **Result types:** player, recruit, team, game, clip, post (color-coded badges)
- **Actions:** Tap result → `router.push(result.route)` + close. Tap backdrop/Cancel → close

### 3.8 Voice Input

**File:** `components/nexus/voice-overlay.tsx`, `hooks/use-speech-recognition.ts`

- **Trigger:** Long-press Nexus tab (global) or mic button in Nexus input bar (local)
- **Mounted at:** Root layout (global) AND Nexus screen (local)
- **UI:** Full-screen overlay with waveform visualization
- **States:** idle → listening → processing
- **Features:** Permission handling, volume normalization, interim + final results, punctuation

### 3.9 Global Header

**File:** `components/global-header.tsx`

- **Left slot:** Avatar button (or hamburger when on Nexus route)
- **Center:** Mode selector pill with dropdown (4 modes with color-coded icons)
- **Right slot:** Custom content or spacer
- **Mode switch:** Tap center pill → dropdown → select mode → context switch

### 3.10 KX Transition

**File:** `components/kx-transition.tsx`, `utils/global-transition.ts`

Branded micro-transition animation that fires on every tab press. Visual feedback confirming navigation intent.

### 3.11 Ask Nexus Sheet

**File:** `components/ask-nexus-sheet.tsx`

- **Tabs:** Ask | History
- **Ask tab:** Context chips + large text input (500 char max) + send button + disclaimer
- **History tab:** FlatList of entries with status badges (Pending/Answered)
- **Trigger:** Various CTA buttons throughout app, global handler registration

---

## 4. Screens

### 4.1 Home — Sports Mode (`app/(tabs)/index.tsx`)

**Purpose:** Video-game-style coach HQ. Shows team state, identity, and motion.

**Entry points:** Home tab tap, app launch (if Sports mode)

**Layout — Top-level:**

1. **Global Header** (avatar, mode pill, search)
2. **Team Identity Bar** — FMU seal, team name, level/conference
3. **Team Hub Tabs** — Scrollable horizontal header row synced with PagerView:
   - Home | Schedule | Roster | Recruiting | Statistics | Game Ops | Program | Development

**Sub-tabs (via PagerView swipe):**

#### Home Sub-Tab
- **Today Block:** Activity status, Last Game result, Next Game preview
- **Quick Stats Row:** Record, Conference position, Next opponent KR
- **Conference Pulse:** Top 3 teams by KR + next conference games
- **Team KR Card:** Large KR number + Off/Def split + tap → KR Details Sheet
- **Live Game Panel:** (When game is live) Inline 4-tab sub-panel: Plays | Box | Team | Leaders

#### Schedule Sub-Tab
- **Toggle:** Games | Standings | News
- **Games:** Upcoming + completed FlatList with opponent, date, location, score, KR
- **Standings:** Conference standings table (team, W-L, conf, streak, GB)
- **News:** News feed items
- **Tap game → Game Detail sheet or `coach/game-detail`**

#### Roster Sub-Tab
- **Views:** Cards | Depth | List (toggle icons)
- Full `RosterContent` component (see Section 4.1.1)

#### Recruiting Sub-Tab
- Full `PlayerPoolContent` component (recruiting board)

#### Statistics Sub-Tab
- Full `StatsContent` component

#### Game Ops Sub-Tab
- Placeholder ("Coming soon")

#### Program Sub-Tab
- Full `ProgramContextSection` component (systems, cluster weights, biases)

#### Development Sub-Tab
- Placeholder ("Coming soon")

**Sheets triggered:**
- `KRDetailsSheet` — Team KR breakdown (tap KR card)
- `TeamQuickSheet` — Opponent team profile (tap opponent)
- `PlayerSheet` — Player profile (tap roster player)

**States:**
- **Loading:** Spinner during initial data load
- **Empty:** N/A (always has mock data)
- **Error:** N/A (all data is local/mock)

**Permissions:** All roles see Home. Coach/GM see full controls. Viewer role has limited interaction.

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
- Cluster Picker (horizontal scroll): O KR, D KR, SHT, FIN, PLY, OBD, TMD, REB, PHY, PGIS

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

### 4.2 Home — Enterprise Mode

**Purpose:** Startup operational dashboard

**Layout:**
1. Company header (KaNeXT badge, company type, legal structure)
2. Metrics grid: MRR, Customers, Runway, Team Size
3. Quick actions: Scenarios, Data Room, Domains
4. Recent activity feed

---

### 4.3 Home — Church Mode

**Purpose:** Church hub with quick access to messages, giving, and connect

**Layout:**
1. Church header (heart icon, denomination, campuses count)
2. Quick actions: Messages, Give, Connect
3. Campuses list with service times
4. Recent activity

---

### 4.4 Home — Education Mode

**Purpose:** Academic institution overview

**Layout:**
1. Institution header (graduation cap icon)
2. Key metrics: Enrollment, Programs, Faculty, Graduation Rate
3. Quick actions: Schedule, Results, Metrics, Archive
4. Current term card
5. Upcoming events calendar
6. Academic departments grid

---

### 4.5 Nexus (`app/(tabs)/nexus.tsx`)

**Purpose:** Universal reasoning surface — the primary intelligence interface. Answers "What does this mean?" Reasoning only, no state mutation.

**Entry points:** Nexus tab tap, "Open Nexus" from Avatar Drawer

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

### 4.6 Search (`app/(tabs)/search.tsx`)

**Purpose:** Universal retrieval surface (read-only).

**Entry points:** Search icon in GlobalHeader, hidden tab (accessible via global header)

**Layout:**
1. Search input with magnifying glass icon
2. SectionList with results grouped by category
3. Empty state when no query / no results

**Result categories:** organization, member, event, record, media, document, ministry, message

**Behavior:** Tap result → `router.push(result.route)`

---

### 4.7 Media — Video Home (`app/(tabs)/media/index.tsx`)

**Purpose:** Instagram-style social feed for team media

**Entry points:** Media tab → Home sub-tab

**Layout:**
1. **Stories Row** — Horizontal scroll of avatar circles
   - "Your Story" with blue + badge (isYou)
   - Other circles with pink gradient ring if `hasNew`
   - Tap → haptic (story view UNSPECIFIED)
2. **Feed Posts** — FlatList of post cards
   - Post header: avatar, author name, role, more button
   - Media card: 16:9 placeholder with play button + type badge (CLIP/REEL/PHOTO)
   - Action row: heart, comment, share, bookmark
   - Likes count, caption, comments link, timestamp

**Controls:** Like toggle, save toggle

**Data objects:** `StoryCircle`, `VideoFeedPost`, `FeedPostMedia`

---

### 4.8 Media — Reels (`app/(tabs)/media/reels.tsx`)

**Purpose:** TikTok-style vertical reel feed

**Layout:**
1. Header overlay: search + bell icons
2. Full-screen FlatList with `pagingEnabled=true`, `snapToInterval`
3. Each reel: title, caption, action buttons (heart, comment, share, bookmark)

**Behavior:** Vertical swipe to paginate. Share button → ShareSheet

---

### 4.9 Media — Create (`app/(tabs)/media/create.tsx`)

**Purpose:** Upload/post form for video content

**Layout:**
1. `VideoHeader` with title "Create"
2. `UploadForm` component

---

### 4.10 Media — Inbox (`app/(tabs)/media/inbox.tsx`)

**Purpose:** Media-specific messaging (quick share + threads)

**Layout:**
1. `VideoHeader` with title "Inbox"
2. **Quick Share Targets** — Horizontal scroll of avatar circles (5 targets)
3. **Inbox Threads** — FlatList of message threads
   - Thread row: avatar, title, last message preview, timestamp, unread dot
   - Media attachment badge when applicable

**Data objects:** `QuickShareTarget`, `VideoInboxThread`, `VideoMediaAttachment`

---

### 4.11 Media — Library (`app/(tabs)/media/library.tsx`) — HIDDEN

**Purpose:** Video library with content buckets

**Note:** Hidden from sub-footer nav (`href: null`) but still accessible via deep link.

**Layout:**
1. Content tabs: My Team | League | Explore | Coach Library
2. Expandable `LibraryBucket` components per tab
3. FAB to save links → `SaveLinkSheet`
4. Card types: `ClipCard`, `ReelCard`, `LinkCard`

---

### 4.12 Media — You (`app/(tabs)/media/you.tsx`)

**Purpose:** Personal hub with You/Film Room toggle

**Layout:**
1. `VideoHeader` with dynamic title ("You" or "Film Room")
2. **Capsule Toggle:** You | Film Room

**You Section:**
- Action buttons: Create, Library
- My Uploads (horizontal scroll of clips)
- My Reels (horizontal scroll)
- Saved (clips)
- Watch History (with progress bars)

**Film Room Section:**
- Film / Recruiting toggle
- **Film mode tabs:** My Team | League | Explore
  - My Team: TeamHeader + recent games + reels + continue watching
  - League: Conference games + scout packs
  - Explore: Discovery content
- **Recruiting mode tabs:** My Targets | Opponents | Recruit Discovery
  - My Targets: Filtered recruiting clips
  - Opponents: Scout video packs
  - Recruit Discovery: New recruit film

**Data objects:** `VideoGame`, `VideoClip`, `Reel`, `ScoutPack`, `WatchHistoryItem`, `RecruitClip`

---

### 4.13 Activity — Feed (`app/(tabs)/activity/index.tsx`)

**Purpose:** Broadcast timeline with scope/sort filtering

**Layout:**
1. **Scope Row** — Horizontal chips: My Team, Staff, Players, Parents, Recruiting, League, Game Ops, All
2. **Sort Button** — Cycles: Recent, Trending, Mentions, Urgent
3. **Feed** — FlatList of `FeedCard` components
4. **FAB** → `ComposeSheetV2` (useModal) for new posts

**Feed Post Types:** update, clip, game, practice, recruiting, player_dev, culture, compliance, system, poll

**Data objects:** `FeedPost`, `FeedAuthor`, `FeedScope`, `FeedSort`

---

### 4.14 Activity — Search/Explore (`app/(tabs)/activity/explore.tsx`)

**Purpose:** Trending content discovery within Comms

**Layout:**
1. Search bar ("Search Comms")
2. Scope chips (horizontal scroll)
3. Trending blocks:
   - Trending Now
   - Upcoming Deadlines
   - Scout Watch
   - Player Development
   - Culture

---

### 4.15 Activity — Chat/Inbox (`app/(tabs)/activity/chat.tsx`)

**Purpose:** Direct and group messaging

**Layout:**
1. Search bar + New Message button
2. `ChatToggle`: Primary | Requests | Groups
3. **Primary/Groups tab:** FlatList of `SwipeableThreadRow`
4. **Requests tab:** SectionList (Pending | Approved) with `RequestRow`

**Sheets:**
- Thread detail: messages grouped by date + `ChatComposer`
- Request detail: `RequestDetail` with approve/ignore/block/report
- New thread: `NewThreadSheet`
- FAB → New thread

**Data objects:** `InboxThread`, `ChatThread`, `ThreadMessage`

---

### 4.16 Activity — Alerts (`app/(tabs)/activity/alerts.tsx`)

**Purpose:** Notification center with category filtering

**Layout:**
1. `NotificationCategoryTabs`: All, Mentions, Tasks, Recruiting, Game Ops, System
2. FlatList of `AlertRow`
3. Bottom sheet: `AlertDetail` with resolve/assign/snooze/escalate actions

**Data objects:** `AlertItem` (severity: info/warning/action/critical)

---

### 4.17 Activity — Lists (`app/(tabs)/activity/lists.tsx`)

**Purpose:** Curated communication channels

**Layout:**
1. FlatList of `ListChannelRow` (channel name, member count, last activity)
2. Tap → bottom sheet with filtered `FeedCard` list for that channel

---

### 4.18 Organization — Sports Mode (`app/(tabs)/organization/index.tsx`)

**Purpose:** Institution overview for sports organizations

**Layout:**
1. Institution header (badge + name + nickname/division/location)
2. Snapshot card (Conference, Programs count, Founded year)
3. Programs grid (`ProgramCard` — varsity has accent border)
4. Recruiting card (Recruiting Board button)
5. Support grid (Donate, Tickets)
6. Leadership card (Athletic Leadership rows)
7. About card (institution description)

**Navigation:** Tap program → `/organization/programs/[programId]`

---

### 4.19 Organization — Enterprise Mode

**Layout:**
1. Company header (KaNeXT badge + type + legal structure)
2. Metrics grid (MRR, Customers, Runway, Team)
3. Data Room quick links (Documents, Governance, Domains)
4. Product Domains preview (`DomainCard`)
5. Leadership card
6. About card (status + raised amount)

---

### 4.20 Organization — Church Mode

**Layout:**
1. Church header (heart icon + denomination + campuses count)
2. Quick actions (Messages, Give, Connect)
3. Campuses list (`CampusCard` with service times)
4. Ministries card (`MinistryRow` with "View All")
5. Leadership card
6. About card

---

### 4.21 Organization — Education Mode

**Layout:**
1. Institution header (graduation cap icon)
2. Key metrics (Enrollment, Programs, Faculty, Grad Rate)
3. Quick actions (Schedule, Results, Metrics, Archive)
4. Current term card (with "Current" badge)
5. Upcoming events calendar (date separators + "View All")
6. Academic departments grid
7. Leadership card (Faculty rows)
8. About card (accreditation + program formats)

---

### 4.22 Settings (`app/settings.tsx`)

**Layout:**
1. Header with back button
2. **Account:** Name/email + Logout (if logged in) or Login (if not)
3. **Preferences:** Notifications, Appearance, Privacy
4. **Data:** Download Data, Clear Cache

---

### 4.23 Profile (`app/profile.tsx`)

**Purpose:** User identity + active context selector

**Layout:**
1. Identity header: avatar (80px circle), name, role, context summary
2. Active Context rows (tappable):
   - Mode (Sports/Enterprise/Church/Education)
   - Organization
   - Program/Ministry/Workspace
   - Season/Year/Role/Term
3. iOS: ActionSheetIOS for selectors. Android/Web: Modal fallback

---

### 4.24 Game Detail (`app/coach/game-detail.tsx`)

**Purpose:** Individual game view with Live/Report separation

**Locked design rule:** Live tab = real-time awareness only (score, clock, play-by-play). Report tab = rolling analytical content.

**Report tab ONE UI rule:** Same sections in same order regardless of game state. Only data values change when game goes final.

**Report section order:** Score Header → Team Stats → Game Flow → Leaders → Box Score → Play-by-Play → Nexus Analysis → Ask Nexus CTA

---

### 4.25 Recruiting Board (`app/coach/recruiting.tsx`)

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

### 4.26 Team Statistics (`app/coach/stats.tsx`)

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

**Similar Players:** Filters PLAYER_POOL by same position or archetype, sorted by KR proximity, capped at 5. Cards show name, KR, position/height/class, school, awards, similarity tag.

**Team Targets:** Filters PLAYER_POOL by same currentSchool, computes Fit KR via `computeFitKR`, sorted by fitKR descending, capped at 5. Cards show name, KR, fit delta, position/height/class, school, awards.

**System Picker (modal):** Two grids — Offensive (11 systems) + Defensive (9 systems). Pill-based selection, immediate close on select.

---

### 5.2 Depth Chart Units (`components/depth-chart/depth-chart-units.tsx`)

**Purpose:** System-aware depth chart with lineup optimization (largest component — 1,779 lines)

**Lineup Lens System:**
- 11 lenses: Overall KR, Offense KR, Defense KR, 7 clusters, PGIS
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
| KR/PGIS badge | Swap confirmation | — |

---

### 5.3 Team Quick Sheet (`components/team-quick-sheet.tsx`)

**Purpose:** Team snapshot in bottom sheet

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

### 6.4 Video/Media Data

| Object | Key Fields | Source |
|--------|-----------|--------|
| `VideoGame` | id, opponent, date, result, score, clipCount, duration | `data/mock-video.ts` |
| `VideoClip` | id, title, gameId, type (highlight/breakdown/drill/scout), duration | `data/mock-video.ts` |
| `Reel` | id, title, caption, duration, playerTag, teamTag, likes, saves | `data/mock-video.ts` |
| `StoryCircle` | id, name, initials, hasNew, isYou | `data/mock-video-feed.ts` |
| `VideoFeedPost` | id, authorName, caption, media, likes, comments, liked, saved | `data/mock-video-feed.ts` |
| `VideoInboxThread` | id, title, participants, lastMessage, unread, mediaAttachment | `data/mock-video-inbox.ts` |

### 6.5 Comms/Messaging Data

| Object | Key Fields | Source |
|--------|-----------|--------|
| `FeedPost` | id, type, author, timestamp, filter, body, clipTitle | `data/mock-messages.ts` |
| `InboxThread` | id, title, participants, lastMessage, unread | `data/mock-messages.ts` |
| `AlertItem` | id, severity, title, sourceTag, cta, resolved | `data/mock-messages.ts` |
| `CommsEntry` | id, type, timestamp, author, body, touchMethod, sourceChip | `data/mock-comms.ts` |

### 6.6 Nexus/Conversation Data

| Object | Key Fields | Source |
|--------|-----------|--------|
| `Conversation` | id, title, type, participants, isPinned, evalConfig, simConfig, gameOpsConfig | `types/index.ts` |
| `Message` | id, conversationId, role, content, metadata | `types/index.ts` |
| `SimulationResult` | id, type, homeTeam, awayTeam, winProbability, projectedScore, confidence, drivers | `types/index.ts` |
| `EvalSnapshot` | id, playerName, summary, strengths, areasForGrowth, projectedImpact | `types/index.ts` |
| `FinderResult` | id, label, subtitle, type, icon, route | `data/mock-finder.ts` |

### 6.7 Program Context

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
- PGIS (Player Game Impact Score) — per-player game impact
- TGIS (Team Game Impact Score) — team-level impact, display scale 0-10

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
- **UNSPECIFIED** in current implementation (placeholder "Coming soon" on Development tab)

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
| Shooting (3) | Catch-and-Shoot, Movement Shooter, Deep Range, Pull-Up Shot Maker |
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

### 9.2 Auth States

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
- Primary: `#000` (black)
- Nexus Accent: `#fff` (white)
- Success: `#22C55E`, Warning: `#F59E0B`, Error: `#EF4444`

**Mode Colors:**
- Sports: `#2563EB`
- Enterprise: `#8B5CF6`
- Church: `#D946EF`
- Education: `#0D9488`

**Dark Theme (enforced):**
- Background: `#000` / `#0d0d0d` / `#1a1a1a`
- Text: `#f5f5f5` / `#a0a0a0` / `#6e6e6e`
- Cards: `#111`
- Dividers: `rgba(255,255,255,0.06)`

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

| Mode | Organization | Role |
|------|-------------|------|
| Sports | Florida Memorial University | Head Coach |
| Sports | Middlebrooks Academy | Head Coach |
| Sports | Cathedral HS | Head Coach |
| Enterprise | KaNeXT | Founder |
| Church | International Christian Center | Member |
| Education | San Diego City College | Faculty |

---

## 13. UNSPECIFIED Items

The following features are referenced in the codebase or spec but lack complete implementation:

| Item | Status |
|------|--------|
| Game Ops tab (Home) | Placeholder — "Coming soon" |
| Development tab (Home) | Placeholder — "Coming soon" |
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
| Synergy/KaNeXT source badges (Stats) | Currently labels only — could become tappable filters to show/hide sections by data source |
| Social media glyph navigation (Player Sheet) | X, Instagram, KaNeXT Video glyphs present — tap targets placeholder (no deep link URLs) |
| Quick Actions contact/recruiting actions | Haptic + log entry only — full modals/forms are future (v3) |

---

*End of spec.*
