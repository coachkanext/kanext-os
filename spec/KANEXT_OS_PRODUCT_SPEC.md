hin# KaNeXT OS — Deep Dive Product Specification

> **Generated:** 2026-03-28
> **Scope:** All modes, screens, tiles, footer, Nexus, design system, architecture

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Design System](#2-design-system)
3. [Mode System](#3-mode-system)
4. [Universal Footer](#4-universal-footer)
5. [Home Screen & Icon Grid](#5-home-screen--icon-grid)
6. [Nexus — AI Intelligence Layer](#6-nexus--ai-intelligence-layer)
7. [Messages](#7-messages)
8. [Phone](#8-phone)
9. [Social](#9-social)
10. [Hub Screens](#10-hub-screens)
11. [Sports Screens](#11-sports-screens)
12. [Education Screens](#12-education-screens)
13. [Business Screens](#13-business-screens)
14. [Community / Church Screens](#14-community--church-screens)
15. [Personal Screens](#15-personal-screens)
16. [KayPay](#16-kaypay)
17. [Shared Utility Screens](#17-shared-utility-screens)
18. [Navigation Architecture](#18-navigation-architecture)
19. [Component Library](#19-component-library)
20. [Services & Intelligence](#20-services--intelligence)
21. [Data Layer](#21-data-layer)
22. [RBAC — Role-Based Access Control](#22-rbac--role-based-access-control)
23. [Full Screen Inventory](#23-full-screen-inventory)
24. [Glossary](#24-glossary)

---

## 1. Product Overview

KaNeXT OS is a cross-platform mobile operating system built with **Expo + React Native**, targeting iOS, Android, and web. It unifies five operating domains under a single interface: **Sports**, **Education**, **Business**, **Community/Church**, and **Personal**.

The system uses:
- **File-based routing** via Expo Router (`app/` directory)
- **Mode-first architecture** — every screen, color, and data context adapts to the active mode
- **Claude-powered Nexus** — AI assistant with domain-aware basketball intelligence
- **Glass morphism UI** — 3-tier GlassView system for visual hierarchy
- **RBAC** — role-based visibility and capabilities throughout

**Build stack:** Expo SDK, React Native New Architecture, React Compiler, TypeScript, `@gorhom/bottom-sheet` v5, `expo-router` with typed routes.

---

## 2. Design System

### 2.1 Color Palette (Locked — `hooks/use-colors.ts`)

All components source colors exclusively from `useColors()`. No per-component overrides.

#### Light Palette

| Token | Value | Usage |
|-------|-------|-------|
| `bg` | `#F5EFE4` | Main background (warm cream) |
| `surface` | `#EDE5D8` | Cards, tiles, surfaces |
| `surfacePressed` | `rgba(139,99,67,0.08)` | Pressed state overlay |
| `label` | `#1A1714` | Primary text (dark brown) |
| `secondary` | `rgba(45,30,18,0.50)` | Secondary / subtitle text |
| `muted` | `rgba(45,30,18,0.30)` | Tertiary / disabled text |
| `separator` | `rgba(139,99,67,0.10)` | Divider lines |
| `inputBorder` | `rgba(139,99,67,0.18)` | Input field borders |
| `accent` | `#D97757` | **THE** interactive accent (coral-orange) |
| `green` | `#5A8A6E` | Success / positive / make |
| `red` | `#B85C5C` | Error / destructive / miss |
| `bubbleSent` | `#EDE5D8` | User chat bubble |
| `bubbleReceived` | `rgba(139,99,67,0.08)` | Other chat bubble |
| `footer` | `#EDE5D8` | Footer bar background |

#### Dark Palette

| Token | Value |
|-------|-------|
| `bg` | `#1C1410` |
| `surface` | `#261D17` |
| `accent` | `#E08B6A` |
| `green` | `#6FA882` |
| `red` | `#C97070` |

### 2.2 Mode Accent Colors (`useAccentColor()`)

Used for **badges and mode indicators only** — never for UI chrome/buttons.

| Mode | Color | Hex |
|------|-------|-----|
| Sports | Maroon | `#990000` |
| Business | Twitter blue | `#1D9BF0` |
| Education | Navy | `#003A63` |
| Community | Teal/purple | varies |
| Personal | Coral (= C.accent) | `#D97757` |

### 2.3 Typography

- System font (SF Pro on iOS, Roboto on Android)
- Clock digits: `fontVariant: ['tabular-nums']`
- No custom font loading for core UI

### 2.4 Glass System (`components/ui/glass-view.tsx`)

| Tier | Use cases |
|------|-----------|
| **Tier 1** | Cards, tiles, grid squircles |
| **Tier 2** | Inputs, pills, switchers |
| **Tier 3** | Overlays, sheets, modals |

### 2.5 Bottom Sheet Rules

All sheets use `@gorhom/bottom-sheet` v5 via `components/ui/bottom-sheet.tsx`.

- **Two snap points only:** `['50%', '100%']`
- **Always opens at 50%** — user drags up to 100%
- **Drag-to-dismiss** from anywhere (`enablePanDownToClose = true`)
- **Backdrop tap** dismisses (40% dim, underlying interaction disabled)
- **Spring animation** — no linear easing
- Use `BottomSheetScrollView` for scrollable content inside sheets
- Use `useModal` prop for portal-based sheets in deeply nested components

---

## 3. Mode System

### 3.1 The Five Modes

| Mode | Example Org | Example Program |
|------|-------------|-----------------|
| `sports` | Lincoln University | Men's Basketball |
| `education` | San Diego Christian College | Athletics Dept |
| `business` | KaNeXT Operations | Product Team |
| `community` | ICCLA Church | Youth Ministry |
| `personal` | Sammy Kalejaiye | — |

### 3.2 Mode Switching

- **Persisted** in AsyncStorage (`kx:lastMode`)
- Mode change resets org/program/season to defaults
- UI reflows: icon grid, hub screens, member types, role labels all adapt
- Initial mode selection on first launch (if no saved mode)

### 3.3 Active Context

```typescript
interface ActiveContext {
  mode:      Mode;         // 'sports' | 'education' | 'business' | 'community' | 'personal'
  orgId:     string;
  programId: string | null;
  seasonId:  string | null;
  role:      Role;         // 'owner' | 'coach' | 'player' | 'fan' | 'admin' | 'viewer' | ...
}
```

Stored in `app-context.tsx`; dispatched via `setActiveContext()`.

### 3.4 Role Capabilities by Mode

| Mode | Roles Available |
|------|-----------------|
| Sports | Coach, Player, Fan |
| Education | Admin, Faculty, Student, Guest |
| Business | Owner, Member, Viewer |
| Community | Leader, Member, Visitor |
| Personal | Owner |

---

## 4. Universal Footer

**File:** `components/footers/universal-footer.tsx`
**Mounted in:** root `app/_layout.tsx`

### 4.1 Layout

```
┌──────────────────────────────────────────────┐
│  [icon]   [icon]   [icon]   [icon]   [icon]  │
│                                    ◐ Nexus   │
└──────────────────────────────────────────────┘
  height: 49px + safe area bottom
  background: C.footer (#EDE5D8 light / #261D17 dark)
```

- **Stroke icons only** (no `.fill` variants)
- **5 positions** — leftmost contextual to mode, Nexus always rightmost
- **Swipe right on Nexus icon** → pop inner stack / return to home
- **Scroll-driven hide/show** — hides on downward scroll, shows on upward scroll
- **Haptic feedback** on tap

### 4.2 Footer Icon Behavior

- Active screen icon: slightly brighter / accent tint
- Nexus icon: semi-circle indicator showing whether Nexus is open
- No label text below icons (icon-only)

---

## 5. Home Screen & Icon Grid

**File:** `app/(tabs)/(main)/index.tsx`

### 5.1 Video Hero

- Full-width background (bleeds under status bar)
- Animated video or gradient fallback
- Mode-specific visual treatment

### 5.2 Org Context Pill

- Shown at top, tappable
- Displays: `{orgName}` or `{orgName} · {programName}`
- Tap → Org Context Drawer (mode switcher + org/program/season selector)

### 5.3 Icon Grid (9 icons)

3×3 grid of squircle tiles (Glass Tier 1). Layout adapts per mode:

**Sports mode grid (example):**

| Messages | Phone | Social |
|----------|-------|--------|
| Roster | Hub | Agenda |
| Recruits | KayTV | → Nexus |

**Business mode grid (example):**

| Messages | Phone | Social |
|----------|-------|--------|
| Team | Hub | KayPay |
| Deals | Pulse | → Nexus |

**Personal mode grid (example):**

| Messages | Phone | Social |
|----------|-------|--------|
| Hub | Earn | Deals |
| Store | KayTV | → Nexus |

Swipe left on grid → navigate to Nexus (slide animation).

---

## 6. Nexus — AI Intelligence Layer

**File:** `app/nexus.tsx`
**Top bar:** `components/nexus/nexus-page-top-bar.tsx`

Nexus is NOT nested inside `(tabs)/(main)`. It owns its own top bar with no GlobalHeader.

### 6.1 Architecture

```
User query
    │
    ▼
classifyQuery()  ──► isBasketball?
    │                      │
    │       YES             NO
    ▼                      ▼
buildIntelligenceSystemPrompt()   GENERIC_PROMPT
    │
    ▼
Anthropic API (claude-opus-4-6 for basketball,
               claude-sonnet-4-6 for general)
    │
    ▼ SSE stream (XHR onreadystatechange readyState 3)
    │
    ▼
Parse text_delta events → stream into message bubble
Detect code blocks → render as artifact cards
```

### 6.2 Intelligence System Prompt Builder (`nexus-intelligence.ts`)

```typescript
buildIntelligenceSystemPrompt(msg: string): string
  → detectLevel(msg)        // ncaa_d1_high_major | ncaa_d1_mid_major | ...
  → isEvalQuery(msg)        // include File 01 (V1 Protocol, ~9K tokens)?
  → getValidatedProfiles(msg) // inject Laolu / Lincoln test case?

Parts assembled:
  1. SKILL_MD           (always, ~1.3K tokens)
  2. FILE_01            (eval queries only, ~9K tokens)
  3. KR LEGENDS section (level-specific or 7-legend COMMON_LEGENDS, ~7K tokens)
  4. Validated profiles (if matched, +3.7K–4.3K tokens)
```

**Token budget (worst case):**
- Eval + unknown level: ~17.7K tokens
- Eval + specific level: ~11.5K tokens
- General basketball: ~8.5K tokens
- Target: well under 30K TPM org limit

### 6.3 Level Detection

Regex + school-name shortcuts:

| Pattern | Level |
|---------|-------|
| `high major`, `HM`, `Power 5`, `Big Ten/East/12/SEC` | `ncaa_d1_high_major` |
| `mid major`, `MM`, `AAC`, `A-10`, `Mountain West`, `WCC` | `ncaa_d1_mid_major` |
| `low major`, `LM`, `Big South/Sky/West`, `SWAC`, `MEAC` | `ncaa_d1_low_major` |
| `NCAA D2`, `Division II` | `ncaa_d2` |
| `NCAA D3`, `Division III` | `ncaa_d3` |
| `NJCAA D1`, `JUCO D1` | `njcaa_d1` |
| `NCCAA D1` / `NCCAA` | `nccaa_d1` |
| `USCAA` | `uscaa` |
| `NAIA` | `naia` |
| Kansas, Duke, Kentucky, UNC… | `ncaa_d1_high_major` |
| Pepperdine, Saint Mary's, SDSU, Memphis… | `ncaa_d1_mid_major` |
| High Point, Weber State, LBSU, UC Irvine… | `ncaa_d1_low_major` |

### 6.4 Validated Profile Injection

When query mentions known players/teams:

| Keyword | Profile injected |
|---------|-----------------|
| `laolu`, `kalejaiye` | `TEST_CASE_LAOLU` (~3.7K tokens) |
| `lincoln university`, `lincoln oakland`, `lu oakland` | `TEST_CASE_LINCOLN` (~4.3K tokens) |

### 6.5 UI Layout

```
┌─ NexusPageTopBar ──────────────────────────────┐
│  [mode pill]  Nexus  [settings]                │
├────────────────────────────────────────────────┤
│  Message feed                                  │
│  ┌──────────────────────┐                      │
│  │ Assistant message     │                     │
│  │ (streaming, markdown) │                     │
│  └──────────────────────┘                      │
│                 ┌────────────────────────────┐ │
│                 │ User message               │ │
│                 └────────────────────────────┘ │
│  ┌──────────────────────────────────────────┐  │
│  │ Artifact card (code block)               │  │
│  │ [lang badge] [copy]                      │  │
│  └──────────────────────────────────────────┘  │
├────────────────────────────────────────────────┤
│  [+ Add]  [input field...]          [Send ▶]   │
└────────────────────────────────────────────────┘
```

**Features:**
- Multi-turn conversation (6 turns history for basketball, 20 for general)
- Stop button during stream
- Suggestion chips on empty state
- Artifact cards for code/SQL/JSON blocks with syntax highlight
- "Add to Chat" attachment sheet
- Empty state: suggestion chips for basketball queries

---

## 7. Messages

**File:** `app/(tabs)/(main)/messages/index.tsx`

### 7.1 Header

- Left: **Edit** dropdown → "Edit Pins" / "Select Chats"
- Center: **State pill** — "Chats" / "Rooms" / "Emails" (with unread count)
- Right: **Filter** icon

### 7.2 Filter Pills (animated reveal)

| Tab | Filters |
|-----|---------|
| Chats | All · Unread · Recently Deleted |
| Rooms | All · Unread · Muted · Archived · Recently Deleted |
| Emails | Inbox · Starred · Sent · Drafts · Archived · Recently Deleted |

### 7.3 Pinned Avatars Row

- Circular 62px avatars with unread dots
- Chats: initials in colored square; Rooms: `#` symbol
- Long-press → enter edit mode (minus button to unpin)
- Visible only on "All" filter

### 7.4 Thread List

Each row: avatar + name + timestamp + preview text

**Interactions:**
- Unread = bold name + preview + red dot
- Long-press → context menu (Pin/Unpin, Mark Read/Unread, Hide Alerts, Delete)
- Right swipe (email): Star
- Left swipe (email): Archive

### 7.5 FAB Stack (bottom-right, above footer)

- **Compose** (top): → compose sheet (Chat / Room / Email options)
- **Search** (bottom): → full-screen search overlay

### 7.6 Select Mode

- "Select Chats" → checkmark circles appear on all rows
- Action bar at bottom with Delete; Cancel in header

### 7.7 Search Overlay

Full-screen replacement with:
- Search bar (magnifying glass + input + Cancel)
- Results grouped: Contacts, Pins, Chats, Links, Photos, Locations, Documents
- 3 items collapsed, "See All" to expand

### 7.8 Sub-screens

| Route | Purpose |
|-------|---------|
| `messages/[threadId]` | Thread detail (full chat) |
| `messages/email-thread` | Email detail |
| `messages/new-message` | Compose DM |
| `messages/new-channel` | Create room |
| `messages/new-email` | Compose email |
| `messages/room-info` | Room settings |
| `messages/search` | Advanced search |
| `messages/archived` | Archived threads |
| `messages/blocked` | Blocked list |
| `messages/notifications` | Notification preferences |

---

## 8. Phone

**File:** `app/(tabs)/(main)/phone/index.tsx`

### 8.1 Tabs

| Screen | Route |
|--------|-------|
| Recent | `phone/index` |
| Dialpad | `phone/dialpad` |
| Favorites | `phone/favorites` |
| Voicemail | `phone/voicemail` |
| Call History | `phone/recent` |
| VM Detail | `phone/vm/[id]` |
| Blocked | `phone/blocked` |
| Settings | `phone/settings` |

---

## 9. Social

**File:** `app/(tabs)/(main)/social/index.tsx`

### 9.1 Top Bar

- Left: **Edit** dropdown (Drafts, Analytics, Settings)
- Center: **View pill** — Feed / Reels / Profile
- Right: **Filter** icon

### 9.2 Scope Bar (toggleable)

**Brand** · **Mode** · **All** — filters whose content is shown.

### 9.3 Feed View

- **StoriesRow** — horizontal scroll of 62px story avatars
- **PostCard list**:
  - Author avatar + name + role badge + brand badge + timestamp
  - Media carousel (swipe for multiple images)
  - Like count + comment count + bookmark
  - Caption + hashtags
  - Comments preview (first 2)
  - Reactions picker: ❤️ 😂 😮 😢 👏

**Interactions:**
- Double-tap → like
- Tap comment → comments bottom sheet
- Long-press → context menu (edit/delete for own posts, report for others)

### 9.4 Reels View

- Full-screen vertical video (TikTok-style)
- Autoplay on focus, pause on blur
- Right-side actions: Like · Comment · Share · Bookmark
- Mini top bar overlay

### 9.5 Profile View

- Profile header: avatar, name, handle, role, bio, follower/following counts
- Tabs: Posts / Reels / Tagged
- Grid layout of content
- Edit Profile button (own profile only)

### 9.6 Sub-screens

`social/create` · `social/edit` · `social/publish` · `social/person` · `social/brand` · `social/grid-feed` · `social/profile-reels` · `social/edit-profile` · `social/your-posts` · `social/saved` · `social/drafts` · `social/analytics` · `social/following` · `social/settings`

---

## 10. Hub Screens

### 10.1 Personal / Brand Hub (`hub/index.tsx`)

**Purpose:** Creator backend + public-facing profile.

**Tabs:** Overview · Page · Members

**Overview Tab:**
- Stat cards (horizontal scroll): Followers · Earnings · Content · Subscribers · Members
- Bar chart: Views / Earnings / Engagement (metric picker)
- Goal progress rows (subscriber targets, earnings milestones)
- Activity feed (recent payouts, subscriptions, content actions)

**Page Tab:**
- Featured content carousel
- Links section (external quick links)
- Portfolio / showcase
- Featured works

**Members Tab:**
- Tier selector pills: All · Free · Paid · Newsletter
- Member grid (initials + name + tier badge)
- Subscriber analytics

**Roles:** Owner sees full analytics + admin tools; Visitor sees public profile.

### 10.2 Sports Hub (`hub/sports.tsx`)

**Purpose:** Basketball operations center (LU Men's Basketball default).

**Tabs:** Overview · Schedule · Scouting · Analytics

**Overview Tab:**
- Season record banner ("18-9 MEAC Regular Season Champions")
- Next game countdown card (opponent, location, TV info)
- Recent results (last 3 games, W/L badge, scores)
- News/headlines feed

**Schedule Tab:**
- Filter pills: All · Home · Away · Conference · Upcoming
- Full season game list:
  - H/A/N badge · opponent · date · time · TV
  - W/L badge + score (if played)
  - Tap → game detail (box score preview, attendance, venue)

**Scouting Tab** *(Coach role only)*:
- Opponent intel (logo, record, key players)
- Strengths/weaknesses breakdown
- Defensive counters / adjustments
- Gated — Fan role sees lock state

**Analytics Tab:**
- Filter: Team / Players / Advanced
- Team stats: FG%, 3P%, FT%, PPG, APG, RPG
- Per-player rows with KR rating badges
- Advanced: efficiency, shot chart

**"Operations" tile** in domain grid → `statkeeper/index` via `router.push()`

### 10.3 Business Hub (`hub/business.tsx`)

- Team performance metrics
- Revenue tracking
- Client/project dashboard
- Team member status

### 10.4 Education Hub (`hub/education.tsx`)

- Enrollment dashboard
- Course/program management
- Student engagement metrics
- Event calendar
- Financial aid tracking

### 10.5 Sub-screens

`hub/newsletter-compose` · `hub/community` · `hub/dept-detail` · `hub/group-detail` · `hub/announcement-compose` · `hub/care-request` · `hub/edu-announcement` · `hub/campus`

---

## 11. Sports Screens

### 11.1 Roster (`roster/index.tsx`)

**Tabs:** Roster · Staff · Eligibility

**Roster Tab:**
- Position filter pills: All · PG · SG · SF · PF · C
- Depth chart view (stacked by position)
- Player rows: initials avatar + name + number + position + PPG/RPG/APG + KR badge + medical dot
- Tap → player detail sheet (bio, stats, eligibility, scholarship %)

**Staff Tab:**
- Coaching staff rows with role badges
- Contact info (Coach role only)

**Eligibility Tab:**
- GPA per player
- Eligibility status (eligible / warning / ineligible)
- Progress toward degree
- Coach can edit; Player/Fan read-only

**Role selector:** Fan / Coach / Player (toggle pill, top-right)

### 11.2 Statkeeper (`statkeeper/index.tsx`)

**Purpose:** Live game stat-tracking tool. Three phases: Setup → Live → Box Score.

#### Phase 1 — Setup

- Home/away team name inputs
- Game type segmented: Regular / Conference / Tournament / Scrimmage
- Half length toggle: 20 min / 16 min / Custom
- Expandable roster sections (per team):
  - Tap player row to toggle starter/bench; badge shows count/5
- "Start Game" enabled only when both teams have exactly 5 starters

#### Phase 2 — Live (portrait, no outer ScrollView)

```
┌─ TOP BAR (navy #003A63): ← back | StatKeeper | undo ──┐
├─ SCOREBOARD ───────────────────────────────────────────┤
│   LU [42]    1st Half    Howard [38]                   │
│        14:23  ▶/⏸  End Period                         │
├─ PLAYER SELECTION ─────────────────────────────────────┤
│   HOME: ●11  ●23  ●4  ●30  ●1   (teal circles)        │
│   AWAY: ●3   ●12  ●24  ●0  ●5   (steel circles)       │
├─ MAKE/MISS ────────────┬─ STAT BUTTONS ───────────────┤
│  ✓3pt  ✗3pt            │  DefReb    OffReb             │
│  ✓2pt  ✗2pt            │  TO        STL                │
│  ✓FT   ✗FT             │  AST       BLK                │
│                        │  Sub       Foul               │
├─ PLAY-BY-PLAY (last 3, tap to expand) ────────────────┤
└────────────────────────────────────────────────────────┘
```

**Button colors:**
- Make: `#5A8A6E` (green) outline circle
- Miss: `#B85C5C` (red) outline circle
- Stats: `#003A63` (navy) outline circle
- Selected player ring: `#D97757` (coral) 3px border
- No player selected + action tapped → "Select a player first" toast

**Sub overlay** (full-screen absolute backdrop):
- Two columns: On Court | Bench for relevant team
- Tap bench player → highlight → tap court player → swap + log + dismiss

**Foul overlay:**
- 5 options: Personal · Shooting · Offensive · Technical · Flagrant

**Full play-by-play** (BottomSheet `useModal=true`, `snapPoints=['50%','100%']`):
- Scrollable log, newest-first
- Long-press entry → delete option

#### Phase 3 — Box Score

```
┌─ DARK NAVY HERO ───────────────────────────────────────┐
│   LU 89    Final    Howard 84                          │
│   Regular Season · 1st Half 20min                      │
├─ HOME │ AWAY (tab toggle) ─────────────────────────────┤
│  # │ Name │ PTS │ FGM-FGA │ 3PM-3PA │ FTM-FTA │ ...   │
│  ──────────────────────────────────────────────────── │
│  Team Totals (bold, separator above)                   │
├────────────────────────────────────────────────────────┤
│  Export: JSON · CSV · PDF (stubbed, haptic + toast)    │
│  [New Game]                                            │
└────────────────────────────────────────────────────────┘
```

Stat columns: # · Name · PTS · FGM-FGA · 3PM-3PA · FTM-FTA · REB · AST · STL · BLK · TO · PF
Stat table: horizontal ScrollView; player name column fixed/left-anchored.

**Computed stats:**
- Score: sum make-shot events (3pt=3, 2pt=2, FT=1)
- Box score: per-player PTS/FGM-FGA/3PM-3PA/FTM-FTA/REB/AST/STL/BLK/TO/PF via `useMemo`

**Event colors in play-by-play:**

| Event | Color |
|-------|-------|
| MAKE | `#5A8A6E` |
| MISS | `#B85C5C` |
| REB | `#1D9BF0` |
| TO | `#F5A623` |
| STL | `#5A8A6E` |
| AST | `#8B63C8` |
| BLK | `#003A63` |
| FOUL | `#E07B9A` |
| SUB | `#8B9AA8` |

### 11.3 Recruits (`recruits/index.tsx`)

- Prospect list with filter pills (position, state, status)
- Card: photo + name + position + height/weight + HS + commitment status
- Tap → prospect detail (film, stats, contact, notes)
- Add prospect (Coach role)

### 11.4 Booster (`booster/index.tsx`)

- Booster member list
- Campaign tracker with fundraising goals
- Event calendar
- Donation leaderboard
- Admin member management

### 11.5 Sports Agenda (`agenda/index.tsx`)

- Month/week/day toggle
- Event list: game / practice / meeting / event type badges
- Tap → detail (location, attendees, notes)
- Add event FAB

---

## 12. Education Screens

### 12.1 Admissions (`admissions/index.tsx`)

- Prospect list with application status tracker
- Communication timeline per prospect
- Admission documents
- Offer letter generation (admin)

### 12.2 KayStudios (`kaystudios/index.tsx`)

- Featured video carousel
- Category grid (position training, conditioning, team culture)
- Search available
- Video detail with playback + comments
- Experience/course listing with progress bars

**Sub-screens:** `kaystudios/detail` · `kaystudios/search` · `kaystudios/experience`

---

## 13. Business Screens

### 13.1 Team (`team/index.tsx`)

- Team member list + role assignments
- Team schedule/availability
- Communication channels
- Team settings (admin)

### 13.2 Deals (`deals/index.tsx`)

- Deal list with status badges (pipeline view)
- Deal detail sheet (terms, contact, timeline)
- Opportunity pipeline
- Contact action

**Sub-screen:** `deals/contact`

### 13.3 Business Store (`business-store/index.tsx`)

- Category browse
- Vendor profiles
- Product detail with pricing
- RFQ (request for quote) flow

### 13.4 Inquiries (`inquiries/index.tsx`)

- Inbound inquiry list with status filter
- Conversation history per inquiry
- Assign to team member (admin)

### 13.5 Earn (`earn/index.tsx`)

- Earnings summary (total · pending · paid)
- Revenue streams breakdown
- Payout history
- Bank info / tax form settings

### 13.6 Pulse (`pulse/index.tsx`)

- Key metrics cards (reach, engagement, growth)
- Trend charts (line/bar)
- Date range filter
- Export / report actions

### 13.7 Outreach (`outreach/index.tsx`)

- Prospects/leads list with status filter
- Conversation history per prospect
- Message composer
- Task/follow-up scheduler

### 13.8 Network (`network/index.tsx`)

- Connection graph or list
- Search/filter
- Add connection

---

## 14. Community / Church Screens

Community mode mirrors the hub structure but with ministry-specific sections:

- **Ministry dashboard** — member engagement, program counts
- **Donation tracking** — campaigns, progress bars
- **Event calendar** — services, ministry events, retreats
- **Care requests** (`hub/care-request`) — member pastoral needs
- **Announcement composer** (`hub/announcement-compose`)
- **Group detail** (`hub/group-detail`) — small groups, committees

---

## 15. Personal Screens

### 15.1 Hub (Personal) — `hub/index.tsx`

Same as §10.1 but scoped to personal brand.

### 15.2 Store (`store/index.tsx`)

- Product grid (apparel, merch)
- Category filter
- Product detail: image carousel + description + price + variants + reviews
- Cart / checkout flow
- Search

### 15.3 Media (`media/index.tsx`)

- Photo/video grid
- Album/collection view
- Swipe carousel for detail
- Upload button
- Share/download actions

### 15.4 Profile (`profile/index.tsx`)

- Avatar + name + handle + bio
- Follower/following counts
- Edit Profile button (owner only)
- Tabs: Posts · Followers · Following
- Settings link

### 15.5 Members / Directory (`members/index.tsx`)

- Search bar
- Filter pills (All · Staff · Players — varies by mode)
- Member grid or list
- Tap → detail card (contact, role, department)
- Add member (admin)

### 15.6 Give / Donations (`give/index.tsx`)

- Campaign list (org) or personal donation history
- Donation progress bars
- Donate CTA button
- Tax receipt access

### 15.7 Fund (`fund/index.tsx`)

- Fund overview (balance, goal, progress)
- Fund list (multiple fund types)
- Donation/pledge form
- Transaction history
- Admin controls

---

## 16. KayPay

**File:** `app/(tabs)/(main)/kaypay/index.tsx`

- Invoice list (sent/received, status badges)
- Create invoice form
- Payment tracking
- Recurring payment setup
- Payout schedule
- Earnings cards (today, this week, this month)

---

## 17. Shared Utility Screens

### 17.1 KayTV (`kaytv/index.tsx`)

- Featured video hero
- Live games section (with countdown if upcoming)
- Category grid / "See All"
- Video player with overlay controls
- Upload flow (admin)
- Search and filtering

**Sub-screens:** `kaytv/player` · `kaytv/search` · `kaytv/upload` · `kaytv/see-all`

---

## 18. Navigation Architecture

### 18.1 Tab Navigator (hidden)

`app/(tabs)/_layout.tsx` — single visible tab `(main)`. Other tabs exist but tab bar is hidden (`display: none`). State preservation enabled.

### 18.2 Main Stack

`app/(tabs)/(main)/_layout.tsx` — single flat Stack, all screens registered. Key settings:

```typescript
headerShown: false
animation: 'none'           // handled by universal footer
gestureEnabled: false
fullScreenGestureEnabled: false
```

Background: `#F5EFE4` on all screens.

### 18.3 Navigation Patterns

| Pattern | Mechanism |
|---------|-----------|
| Forward (screen push) | `router.push(pathname)` |
| Back | Universal footer swipe-right on Nexus icon |
| Bottom sheet | `<BottomSheet visible onClose>` |
| Full-screen modal | `presentation: 'fullScreenModal'` |
| Home ↔ Nexus | Swipe left on icon grid |

### 18.4 Auth Flow

`app/login.tsx` (pre-auth, no main layout). After login → mode selection → home.

---

## 19. Component Library

### 19.1 Core UI (`components/ui/`)

| Component | Purpose |
|-----------|---------|
| `bottom-sheet.tsx` | Gorhom wrapper — `visible`/`onClose` API, two snap points |
| `glass-view.tsx` | Glass morphism tier 1/2/3 squircles |
| `icon-symbol.tsx` | SF Symbols (iOS) / fallback icons |
| `collapsible.tsx` | Expandable/collapsible sections |

### 19.2 Nexus Components

| Component | Purpose |
|-----------|---------|
| `nexus-page-top-bar.tsx` | Top bar — mode pill, title, settings |
| `artifact-card.tsx` | Syntax-highlighted code block |
| `artifact-sheet.tsx` | Tappable artifact wrapper |

### 19.3 Home Components

| Component | Purpose |
|-----------|---------|
| `video-hero.tsx` | Animated background video/gradient |
| `icon-grid.tsx` | 9-icon mode-adaptive navigation grid |

### 19.4 Messages Components

| Component | Purpose |
|-----------|---------|
| `message-row.tsx` | Swipeable chat/room/email thread row |
| `pinned-avatars-row.tsx` | Horizontal pinned avatar strip |
| `context-menu.tsx` | iOS-style long-press context menu |

### 19.5 Social Components

| Component | Purpose |
|-----------|---------|
| `stories-row.tsx` | Horizontal story avatars |
| `post-card.tsx` | Full social post (media, reactions, comments) |
| `reels-page.tsx` | Full-screen vertical video |
| `like-animation.tsx` | Double-tap heart animation |

---

## 20. Services & Intelligence

### 20.1 Intelligence Service (`services/intelligence/`)

| File | Export | Purpose |
|------|--------|---------|
| `router.ts` | `classifyQuery()` | Detect basketball vs. general intent |
| `nexus-intelligence.ts` | `buildIntelligenceSystemPrompt()` | Assemble Claude system prompt |
| `corpus.ts` | `SKILL_MD`, `FILE_01`, `LEGEND_*`, `TEST_CASE_*` | All domain knowledge as TS string constants |
| `confidence-gates.ts` | `passesConfidenceGate()` | Intent confidence threshold validation |
| `legends.ts` | Legend data | KR scale legends per level |
| `klvn.ts` | KLVN evaluation | KaNeXT Level/Value/Need scoring |
| `team-kr.ts` | Team KR | Team-level KR computation |
| `v1-eval-engine.ts` | (legacy) | TypeScript-based eval engine (retired from Nexus flow) |

### 20.2 Simulation Sub-service (`services/intelligence/sim/`)

| File | Purpose |
|------|---------|
| `orchestrator.ts` | Game simulation orchestration |
| `interaction-library.ts` | Scripted interaction patterns |

### 20.3 Player Pool Service (`services/player-pool/`)

- `bridge.ts` — Interface to player pool data
- Separate Next.js web frontend in `.next/`

---

## 21. Data Layer

All data is currently mock (no real backend). Mock files in `data/`:

| File | Contents |
|------|---------|
| `mock-memberships.ts` | Orgs, programs, seasons, default contexts |
| `mock-messages-v3.ts` | Chats, rooms, emails, `formatMessageTime()` |
| `mock-social.ts` | Posts, reels, stories, feed algorithm |
| `mock-sports-hub.ts` | Players, staff, schedule, KR ratings |
| `mock-hub.ts` | Hub analytics, subscribers, tiers, activity |
| `mock-calendar-events.ts` | Events, practices, games |
| `mock-media.ts` | Photo/video gallery |
| `mock-wallet.ts` | KayPay financial data |
| `mock-personal-deals.ts` | Personal sponsorship/deal data |
| `playerSeasons.ts` | Historical player stats |
| `workspace-templates.ts` | Org setup templates |
| `sun-conference/` | Detailed SUN conference data (schema + team data) |

---

## 22. RBAC — Role-Based Access Control

### 22.1 Role Hierarchy

```
Owner
  └── Admin
        └── Coach / Faculty / Leader / Manager
              └── Player / Student / Member
                    └── Fan / Viewer / Guest
```

### 22.2 Gated Capabilities by Role

| Feature | Owner | Coach/Admin | Player | Fan/Viewer |
|---------|-------|------------|--------|------------|
| Edit roster | ✅ | ✅ | ❌ | ❌ |
| View medical status | ✅ | ✅ | Self only | ❌ |
| View GPA/eligibility | ✅ | ✅ | Self only | ❌ |
| Scouting intel | ✅ | ✅ | ❌ | ❌ |
| Analytics (full) | ✅ | ✅ | Limited | Public only |
| Statkeeper | ✅ | ✅ | ❌ | ❌ |
| Add prospects | ✅ | ✅ | ❌ | ❌ |
| Manage members | ✅ | ✅ | ❌ | ❌ |

Role is part of `ActiveContext` — switching org/program can change role.

---

## 23. Full Screen Inventory

### Stack Screens in `(tabs)/(main)/_layout.tsx`

| Route | Screen | Status |
|-------|--------|--------|
| `index` | Home | ✅ |
| `messages/index` | Messages inbox | ✅ |
| `messages/[threadId]` | Thread detail | ✅ |
| `messages/email-thread` | Email detail | ✅ |
| `messages/new-message` | Compose DM | ✅ |
| `messages/new-channel` | Create room | ✅ |
| `messages/new-email` | Compose email | ✅ |
| `messages/room-info` | Room settings | ✅ |
| `messages/search` | Advanced search | ✅ |
| `messages/archived` | Archived | ✅ |
| `messages/blocked` | Blocked list | ✅ |
| `messages/notifications` | Notifications prefs | ✅ |
| `phone/index` | Recent calls | ✅ |
| `phone/dialpad` | Keypad | ✅ |
| `phone/favorites` | Starred contacts | ✅ |
| `phone/voicemail` | VM list | ✅ |
| `phone/vm/[id]` | VM player | ✅ |
| `phone/recent` | Call history | ✅ |
| `phone/blocked` | Blocked numbers | ✅ |
| `phone/settings` | Phone settings | ✅ |
| `social/index` | Feed / Reels / Profile | ✅ |
| `social/create` | Post composer | ✅ |
| `social/edit` | Edit post | ✅ |
| `social/publish` | Publish settings | ✅ |
| `social/person` | User profile | ✅ |
| `social/brand` | Brand profile | ✅ |
| `social/grid-feed` | Grid feed | ✅ |
| `social/profile-reels` | User reels | ✅ |
| `social/edit-profile` | Profile editor | ✅ |
| `social/your-posts` | Your posts | ✅ |
| `social/saved` | Bookmarked | ✅ |
| `social/drafts` | Draft posts | ✅ |
| `social/analytics` | Post analytics | ✅ |
| `social/following` | Following list | ✅ |
| `social/settings` | Social settings | ✅ |
| `hub/index` | Personal hub | ✅ |
| `hub/sports` | Sports hub | ✅ |
| `hub/business` | Business hub | ✅ |
| `hub/education` | Education hub | ✅ |
| `hub/newsletter-compose` | Newsletter editor | ✅ |
| `hub/community` | Community hub | ✅ |
| `hub/dept-detail` | Dept detail | ✅ |
| `hub/group-detail` | Group detail | ✅ |
| `hub/announcement-compose` | Announcement editor | ✅ |
| `hub/care-request` | Care request | ✅ |
| `hub/edu-announcement` | Edu announcement | ✅ |
| `hub/campus` | Campus hub | ✅ |
| `roster/index` | Sports roster | ✅ |
| `statkeeper/index` | Live stat entry | ✅ |
| `agenda/index` | Calendar | ✅ |
| `recruits/index` | Prospects | ✅ |
| `booster/index` | Booster club | ✅ |
| `admissions/index` | Student admissions | ✅ |
| `kaystudios/index` | Learning platform | ✅ |
| `kaystudios/detail` | Course detail | ✅ |
| `kaystudios/search` | Course search | ✅ |
| `kaystudios/experience` | Experience detail | ✅ |
| `kaytv/index` | Video streaming | ✅ |
| `kaytv/player` | Video player | ✅ |
| `kaytv/search` | Video search | ✅ |
| `kaytv/upload` | Uploader | ✅ |
| `kaytv/see-all` | Browse all | ✅ |
| `media/index` | Photo gallery | ✅ |
| `profile/index` | User profile | ✅ |
| `members/index` | Member directory | ✅ |
| `outreach/index` | Prospect outreach | ✅ |
| `network/index` | Connection network | ✅ |
| `earn/index` | Revenue dashboard | ✅ |
| `deals/index` | Partnerships | ✅ |
| `deals/contact` | Contact partner | ✅ |
| `pulse/index` | Analytics | ✅ |
| `store/index` | Merchandise | ✅ |
| `give/index` | Donations | ✅ |
| `fund/index` | Fund management | ✅ |
| `kaypay/index` | Payment processing | ✅ |
| `team/index` | Team management | ✅ |
| `inquiries/index` | Inquiry mgmt | ✅ |
| `business-store/index` | B2B marketplace | ✅ |
| `mode/index` | Mode selector | 🚧 Coming soon |
| `season/index` | Season view | 🚧 Coming soon |

**Nexus** (separate, not in main stack):

| Route | File | Note |
|-------|------|------|
| `/nexus` | `app/nexus.tsx` | Owns its own top bar; no GlobalHeader |

---

## 24. Glossary

| Term | Definition |
|------|-----------|
| **Mode** | Primary operating context (sports, education, business, community, personal) |
| **Org** | Organization entity (team, school, company, church) |
| **Program** | Sub-unit within org (e.g., Men's Basketball within Lincoln University) |
| **Cycle / Season** | Time context (season, semester, fiscal year) |
| **Role** | User capability level within active context |
| **KR** | KaNeXT Rating — basketball skill rating metric (scale varies by level legend) |
| **MEAC** | Mid-Eastern Athletic Conference |
| **Nexus** | Claude-powered AI assistant screen |
| **Glass** | `GlassView` UI component, tier 1/2/3 |
| **RBAC** | Role-based access control |
| **SSE** | Server-sent events — Nexus streaming via XHR |
| **Artifact** | Code/JSON/SQL block extracted from Claude response, rendered as card |
| **KLVN** | KaNeXT Level/Value/Need — evaluation framework |
| **V1 Protocol** | Basketball evaluation protocol in `01_Player_Eval_Process.md` (File 01) |
| **Corpus** | All intelligence `.md` files embedded as TS string constants in `corpus.ts` |
| **EAS** | Expo Application Services (build, deploy) |
| **Tier 1/2/3** | Glass morphism tiers: 1=cards, 2=inputs/pills, 3=overlays |
