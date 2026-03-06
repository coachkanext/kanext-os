# KaNeXT OS — Global Product Specification

**Version:** 1.0.0
**Last Updated:** March 2026

---

## 1. Product Overview

KaNeXT OS is a cross-platform mobile application built with Expo and React Native. It is a multi-mode operating system that serves five distinct verticals — Sports, Business, Church, Education, and Competition — through a single unified interface. Each mode adapts the UI, data context, and intelligence layer to its domain while sharing a common infrastructure.

**Platforms:** iOS, Android, Web
**Framework:** Expo (SDK 54) + React Native + Expo Router (file-based routing)
**AI Engine:** GPT-4o via OpenAI API
**Theme:** Dark mode only (unified palette)

---

## 2. Boot Sequence

1. **Cold Start** — Splash screen displays (Nexus logo, pulsating heartbeat animation, "powered by Nexus" tag). Minimum 2-second hold.
2. **Silent Session Check** — App checks AsyncStorage for existing auth session. No visible auth UI during check.
3. **Session Valid** — Resolve access tier (Founder → Cofounder → Investor → Public). Route to Home.
4. **No Session** — Auth modal blocks interaction until sign-in completes. Then resolve tier and route to Home.
5. **Post-Auth Default** — Always routes to Home tab. Mode defaults to last-used (persisted) or Sports on first run.

The splash only shows on cold launch. App resume from background skips it.

---

## 3. Provider Stack

The root layout wraps the entire app in the following provider hierarchy:

```
RootLayout
├── AuthProvider          — Session, tier, sign-in/out methods
├── AppProvider           — Mode, organization, role, cycle, activeView
├── QueryProvider         — React Query for data fetching
├── ThemeProvider         — Dark theme (single palette)
├── GestureHandlerRootView
└── BottomSheetModalProvider
```

---

## 4. Navigation — Tab Bar

Five glyph-only tabs, fixed order, universal across all modes.

| Position | Tab          | Icon                                | Gestures                                      |
|----------|-------------|-------------------------------------|-----------------------------------------------|
| 1        | Home        | `house.fill`                        | Tap → navigate. Long-press → Avatar Drawer    |
| 2        | Video       | `play.rectangle.fill`               | Tap → navigate                                |
| 3        | Nexus       | Custom logo image (44×44)           | Tap → navigate. Double-tap → Split Nexus. Long-press → Search + Voice |
| 4        | Messages    | `bubble.left.and.bubble.right.fill` | Tap → navigate                                |
| 5        | Organization| `building.2.fill`                   | Tap → navigate. Long-press → Mode Switcher    |

**Visual Properties:**
- Bar height: 96px (iOS), 60px (Android)
- Background: #000000
- Border top: #2F3336, hairline
- Active tint: Per-mode accent color
- Inactive tint: #A1A1AA
- Labels: Hidden (icons only)

**KX Transition:** Every tab switch triggers a 200ms branded white flash with centered "KX" text. Full-screen overlay, pointer-events disabled.

---

## 5. Global Header

Fixed at the top of every screen, above all content.

**Height:** 56px + safe area insets

**Layout:** Three-slot horizontal — Left | Center | Right

### Center: Mode Selector Pill (All Screens)
- Mode icon (14px) + mode label (14px) inside a rounded pill
- Background: `backgroundTertiary` at rest, `backgroundSecondary` on press
- Tap → opens Mode Dropdown (centered modal below pill)

### Mode Dropdown
- Displays all 5 modes with icon + label
- Current mode: highlighted background + bold text
- Tap mode → switch mode + haptic feedback + close dropdown

### Left Slot
- **Nexus screen:** Hamburger icon (opens Conversations Panel)
- **All other screens:** Empty spacer (44px) or custom icon

### Right Slot
- Empty spacer (44px) or custom icon

---

## 6. Mode System

Mode is the ambient operating context. It determines which organization, role, cycle, and UI surfaces are active.

### Available Modes

| Mode        | Demo Organization              | Accent Color | Secondary Accent |
|-------------|-------------------------------|-------------|-----------------|
| Sports      | Lincoln University (Men's BBall)| #990000 (Maroon) | #DFA414 (Gold) |
| Business    | KaNeXT (Platform)              | #1D9BF0 (Blue) | #1D9BF0 (Blue) |
| Church      | ICC (International Christian Center) | #0081CA (Blue) | #004C7A (Navy) |
| Education   | Howard University              | #003A63 (Navy) | #E51937 (Crimson) |
| Competition | Adidas 3SSB                    | #BFFF00 (Lime) | #000000 (Black) |

### Mode Switching
- Available from: Global Header pill dropdown, Mode Switcher popup (Org long-press), Avatar Drawer
- `switchMode(mode)` atomically updates: mode, organization, operating role, cycle, program
- Persisted to AsyncStorage (`kx:lastMode`)
- Triggers Home + Org reset callbacks

### Mode Does NOT:
- Limit what users can ask Nexus
- Hide threads or conversations
- Block cross-domain reasoning
- Create siloed memory

Mode is the entry environment. Threads are universal reasoning containers.

---

## 7. Auth System

### Session State
```
session: { userId, displayName, email, provider, token, createdAt, tier }
isAuthenticated: boolean
isChecking: boolean
isNewUser: boolean
```

### Access Tiers (Strict Priority)
1. Email in founder allowlist → `FOUNDER`
2. Email in cofounder allowlist → `COFOUNDER`
3. Valid invite code → `INVESTOR`
4. Else → `PUBLIC`

### Sign-In Methods
- Mock/Demo sign-in (hardcoded credentials)
- Investor demo sign-in (demo tier)
- Supabase auth (real email/password, JWT token)

### Sign-Out
- Clears session from AsyncStorage
- Does not clear app state (mode, org persist)

---

## 8. Theming

Single dark palette. No light mode variation.

### Color Palette

| Token              | Value    | Usage                    |
|-------------------|----------|--------------------------|
| text              | #FFFFFF  | Primary text             |
| textSecondary     | #A1A1AA  | Muted text               |
| textTertiary      | #52525B  | Very muted text          |
| background        | #000000  | Root background          |
| backgroundSecondary| #0B0F14 | Cards, surfaces          |
| backgroundTertiary| #0B0F14  | Tertiary surfaces        |
| border            | #2F3336  | Dividers, borders        |
| tint              | #1D9BF0  | Default accent (KaNeXT Blue) |
| tabBar            | #000000  | Tab bar background       |
| success           | #22C55E  | Green                    |
| warning           | #F59E0B  | Amber                    |
| error             | #EF4444  | Red                      |

### Spacing Scale
| Token | Value |
|-------|-------|
| xs    | 4px   |
| sm    | 8px   |
| md    | 16px  |
| lg    | 24px  |
| xl    | 32px  |
| xxl   | 48px  |

### Border Radius
| Token | Value  |
|-------|--------|
| sm    | 4px    |
| md    | 8px    |
| lg    | 12px   |
| xl    | 16px   |
| full  | 9999px |

### Layout Constants
| Token           | Value |
|----------------|-------|
| topBarHeight   | 56px  |
| tabBarHeight   | 96px  |
| avatarSize     | 32px  |
| maxContentWidth| 600px |

---

## 9. Bottom Sheet System

All bottom sheets use `@gorhom/bottom-sheet` via the wrapper at `components/ui/bottom-sheet.tsx`.

### Rules (Locked)
1. **Two snap points only:** 50% and 100%. No exceptions without spec approval.
2. **All sheets open at 50% first.** User drags up to 100% or down to dismiss.
3. **Drag-to-dismiss from anywhere** inside the sheet. `enablePanDownToClose = true`.
4. **Backdrop tap dismisses.** Scrim at 40% opacity. Underlying interaction disabled.
5. **Scroll coordination.** Content scrolls mid-scroll; downward drag from scroll-top controls sheet.
6. **Spring animation.** Must feel native (iOS Maps / Apple Music).

### Props
- `visible` / `onClose` — Boolean API for open/close
- `title` — Optional header with close button
- `footer` — Optional sticky footer
- `useModal` — Portal-based `BottomSheetModal` for deeply nested components
- Content wrapped in `BottomSheetScrollView`

### Prohibited Patterns
- Fixed-height modals without drag
- Close-button-only dismissal (close button is supplementary)
- Center modals for primary flows
- More than two snap points
- Custom `Animated.View` / `PanResponder` implementations

---

## 10. Avatar Drawer

**Trigger:** Long-press Home tab

**Width:** 82% of screen (max 300px), slide-in from left

### Sections (Top to Bottom)

**A. Identity Header**
- Avatar image (56px, rounded)
- Name (22px bold)
- Primary badge chip + "Demo" label

**B. Current Context Block**
- Mode label (uppercase, 11px)
- Org name (15px bold)
- Role title + Scope (12px)
- Season chip (11px)

**C. Mode Switch Row** (horizontal scroll)
- 5 mode chips with icons
- Active: filled white background
- Inactive: bordered, transparent
- Disabled (no views): 30% opacity

**D. My Views** (filtered by selected mode)
- Each view: org name, role, tier badge, scope
- Current view: highlighted + checkmark
- Tap → switch context + close drawer
- Long-press → ViewDetailsSheet

**E. Permissions Panel** (collapsible)
- "Your access in this view" header
- Bullet list of permissions

**F. Fast Actions** (4 buttons in a row)
- Icon in circle + label below
- Per-view specific actions

**G. Global Items**
- Settings & Privacy
- Help / Support
- Terms & Policies
- Sign Out

---

## 11. Mode Switcher Overlay

**Trigger:** Long-press Organization tab

**Style:** Floating popup above tab bar, right-aligned

**Contents:** 4 mode buttons (excludes current mode)
- Each: mode icon in semi-transparent colored circle
- Tap → switch mode + haptic + close
- Tap outside → close

---

## 12. Nexus (Conversational Intelligence Layer)

Nexus is the unified AI assistant, accessible from the center tab. It is program-scoped, conversational only — it recommends, analyzes, compares, evaluates, and presents. It does NOT execute actions directly. All writes follow: Propose → Validate → Confirm → Commit.

### States
1. **Locked** — Not authenticated. Dimmed "KX" logo + "Sign in to unlock Nexus"
2. **Coming Soon** — Church, Education, Competition modes show placeholder
3. **Landing** — No active conversation. Nexus logo + mode-specific quote + input bar
4. **Chat** — Active conversation. Thread + input bar

### Layout Zones
- **Zone 1 — Top Bar (sticky):** Hamburger → Conversations Panel. Mode pill (standard header).
- **Zone 2 — Thread Area (scrollable):** Messages with inline embeds (player cards, stat tables, KR cards, receipts, confirmations, escalations)
- **Zone 3 — Input Bar (sticky bottom):** Text input + Attach (+) + Mic + Send

### Conversations Panel (Hamburger → Side Panel)
- **Width:** 70% of screen, slides in from left
- **Header:** Avatar + Name + Role
- **New Thread CTA:** Accent-colored button
- **Search:** Filter threads by title/content
- **Thread List:** Universal (all modes, not partitioned). Each thread shows title, preview, timestamp, mode dot (informational only)
- **Bottom Section:** Settings, Clear Conversations (danger), About Nexus
- **Key Principle:** There is one Nexus, not five. Threads are universal memory containers. Mode does not partition conversation history.

### Input Bar
- Pill-shaped, rounded 24px
- Plus button (attach) | TextInput (multiline, max 4000 chars) | Mic | Send
- Mic only shows when input is empty
- Send only enabled when input has text
- Context pill shown for Game Ops (basketball icon + "Game Ops")

### Voice Overlay
- Full-screen overlay with animated circle
- Circle scales with audio level (0.6x to 1.5x)
- States: Listening (pulsing) → Processing (shrinking)
- Stop button at bottom

### Message Types
1. **text** — Regular chat bubble with markdown
2. **receipt** — Action completed (icon + summary + linked objects)
3. **confirmation** — Action pending approval (summary + YES/Cancel buttons)
4. **escalation** — Question routed to owner (reason + options)
5. **player_card** — Inline player display (name, position, team, KR, archetype)
6. **stat_table** — Inline table with headers and rows
7. **kr_card** — KR display with clusters and archetype

### GPT Integration
- Model: GPT-4o
- Temperature: 0.7
- Max tokens: 1024
- Context window: Last 20 messages
- System prompt includes: mode, organization, role, program, cycle
- Player data auto-injected when player query detected (sports mode)

### Conversation Types
- **chat** — Default Q&A
- **eval** — Player evaluation with thread header (player selector + role selector)
- **sim** — Simulation with scenario selector
- **game-ops** — Pre-game setup (gathering format, period length, timeouts, starters)

### Overlays (Right-Side Drawers)
- **Program Context Drawer** — System preset, play style, cluster weighting, position importance, biases
- **Roster Overlay** — Official/Sandbox roster with list/depth chart views
- **Recruiting Overlay** — Recruiting board with status tabs and filters
- **Simulation Overlay** — Detailed sim results with drivers, player impact, box score

### RBAC Levels (R1-R9)
- R1: Full access (owner/commissioner)
- R2: Program-level (coach)
- R3–R9: Decreasing access through ministry, professional, advisory, player, student, parent, public

### Governed Actions
- Intent classified locally from message content
- Mapped to RBAC level
- If authorized: execute + receipt message
- If needs confirmation: confirmation message + pending action
- If unauthorized: escalation message with routing options

---

## 13. Global Utilities

Cross-component communication via module-level handler registration pattern:

| Utility | Trigger | Purpose |
|---------|---------|---------|
| `global-drawer` | Home long-press | Avatar Drawer open/close |
| `global-search-overlay` | Nexus long-press | Search overlay open/close |
| `global-split-nexus` | Nexus double-tap | Split Nexus view open/close |
| `global-finder` | Programmatic | Universal search/discovery |
| `global-transition` | Tab switch | KX branded flash |
| `global-voice` | Nexus long-press | Voice overlay start/stop |
| `global-mode-switcher` | Org long-press | Mode switcher popup |
| `global-home` | Home tab tap | Reset home to top |
| `global-org` | Org tab tap | Reset org to top |
| `global-game-ops` | Game detail | Navigate to Nexus Game Ops |
| `global-entity-sheets` | Any screen | Open entity cards (player, team, coach, event, ministry, etc.) |

---

## 14. Entity Sheets

Universal entity card system. Single sheet per entity type, rendered at root level.

### Sports Entities
- **TeamSheet** — Team overview card
- **PlayerSheet** — Player card with KR, stats, archetype
- **CoachSheet** — Coach information card

### Cross-Mode Entities
- **EventSheet** — Event details
- **PersonCard** — Generic person
- **MinistryCard** — Church ministry
- **LeaderCard** — Church leader
- **DriverCard** — Competition driver
- **CrewCard** — Competition crew

All opened via `openPlayerSheet(data)`, `openTeamSheet(data)`, etc. from any screen.

---

## 15. Splash Screen

- Full-screen white background
- Centered KaNeXT logo (160×120px) with pulsating heartbeat (1100ms cycle, scale 0.95–1.05, opacity 0.7–1.0)
- Bottom tag: "powered by Nexus" (13px, light gray)
- Fades out in 500ms when app is ready
- Only runs once per cold launch

---

## 16. File Structure

```
/app                    — Screens and navigation (file-based routing)
  /_layout.tsx          — Root layout with providers and global overlays
  /(tabs)/              — Tab-based navigation
    _layout.tsx         — Tab bar configuration
    index.tsx           — Home (mode-aware)
    media/              — Video tab (Feed, Explore, Rooms, Library)
    nexus.tsx           — Nexus conversational AI
    activity.tsx        — Messages
    organization/       — Organization (mode-aware)
/components             — Reusable React components
  /ui                   — UI primitives (bottom-sheet, icons, collapsibles)
  /nexus                — Nexus-specific components
  /entity-sheets        — Universal entity cards
  /business             — Business mode components
  /church-explore       — Church explore grid
  /sports-explore       — Sports explore grid
  /video-feed           — Video feed components
  /organization         — Organization tab components
/constants              — Theme colors, spacing, layout
/context                — React contexts (app, auth, nexus)
/hooks                  — Custom React hooks
/utils                  — Global utilities, RBAC, helpers
/data                   — Mock data and adapters
/types                  — TypeScript type definitions
/assets                 — Images, icons, splash
/services               — Backend services (player pool, scraper, engine)
/spec                   — Product specification documents
```
