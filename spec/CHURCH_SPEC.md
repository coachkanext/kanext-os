# KaNeXT OS — Church Mode Specification

**Version:** 1.0.0
**Last Updated:** March 2026

---

## 1. Mode Overview

Church mode transforms KaNeXT OS into a faith community operating system for pastors, ministry leaders, volunteers, and congregation members. The demo organization is **ICC (International Christian Center)** with accent colors Blue (#0081CA) and Navy (#004C7A).

**Mental Model:** Campus-scoped ministry hub — services, teaching, community, care, and volunteer coordination.

**Demo Context:**
- Organization: ICC (International Christian Center)
- Campus: ICC Los Angeles (ICCLA) — primary demo campus
- Role: Children's Teacher (C4 — Ministry Leader level)
- Ministry: Formation Kids
- Visibility: V3 (Ministry-private access)

---

## 2. Church Home — 4-Pill Tab Layout

**Component:** `ChurchHome` in `components/church/church-home.tsx`

Four horizontally-swipeable pills via PagerView:

| Position | Pill       | Purpose                                  |
|----------|-----------|------------------------------------------|
| 1        | Dashboard | Hero + quick actions + ministry snapshot  |
| 2        | Schedule  | Services, events, ministry calendar      |
| 3        | Ministries| Ministry directory and membership        |
| 4        | Connect   | People, groups, care shortcuts           |

**Navigation:** `PagedTabBar` + `EdgeHoldAdvance` + standard swipe.

**Pill Visibility (RBAC-gated):**
- Dashboard: All roles (C0–C11)
- Schedule: All roles
- Ministries: Hidden for C9 (Attendee), C11 (Visitor)
- Connect: Hidden for C7–C11

---

### 2.1 Dashboard Tab

**Component:** `ChurchDashboardV2`

Single vertical scroll with 5 blocks:

#### Block 1 — Hero Video Card

Context-driven media presentation with 4 badge states:

| Priority | Badge  | Color              | Condition                |
|----------|--------|--------------------|--------------------------|
| 1        | LIVE   | #EF4444 (Red)      | Active service now       |
| 2        | NEXT   | Accent (#0081CA)   | Upcoming service         |
| 3        | RECAP  | #A1A1AA (Gray)     | Most recent past service |
| 4        | SERMON | Accent             | Fallback — no services   |

- Shows: Badge, title, speaker name, subtitle, series name
- Tap → Video player (planned)
- RBAC: Public sermon visible to V0+; internal media respects campus scope

#### Block 2 — Next Event Card (Campus-Scoped)

- Only shows events for active campus
- Content: Date, time, title, location
- Tap → `ChurchEventDetailSheet` (50% → 100% bottom sheet)

#### Block 3 — Engagement Row (3 Horizontal Cards)

| Card   | Icon              | Action                    |
|--------|-------------------|---------------------------|
| Give   | `heart.fill`      | Opens `ChurchGiveSheet`   |
| Events | `calendar`        | Jumps to Schedule tab     |
| Serve  | `hand.raised.fill`| Navigation TBD           |

#### Block 4 — Ministry Snapshot (Role-Centered)

- Shows user's active ministry context
- Demo: "Formation Kids" ministry for a Children's Teacher
- Content: Ministry name, user's role, next class date/time, volunteer count, children count, campus name
- Tap → Drill into Ministries tab or ministry detail sheet

#### Block 5 — Domain Grid (2×3 Card Grid, 6 Cards)

| Card       | Color  | Route                          |
|-----------|--------|--------------------------------|
| Services  | Blue   | Schedule → Services view       |
| Ministries| Purple | Ministries tab                 |
| Community | Green  | Connect tab                    |
| Teaching  | Amber  | Media → Library                |
| Prayer    | Teal   | Prayer request sheet           |
| Care      | Rose   | Care request sheet             |

---

### 2.2 Schedule Tab

**Component:** `ChurchSchedule` (3-pill sub-view wrapper)

Three internal pills (state-based):

| Pill     | Purpose                                      |
|---------|----------------------------------------------|
| Agenda  | All events grouped by day                    |
| Services| Worship services only (with type filtering)  |
| Ministry| Events for user's ministry memberships       |

#### Agenda View

**Component:** `ChurchScheduleAgenda`

- SectionList with sticky day headers (DAY · MMM D format)
- Event rows: Time chip, type badge, title, location, ministry name
- **Event Types:** SERVICE | MINISTRY | OUTREACH | MEETING | OTHER
- Type classified by event title keywords
- "Jump to Today" button
- Campus-scoped filtering
- Tap → `ChurchEventDetailSheet`

#### Services View

**Component:** `ChurchScheduleServices`

- SectionList grouped by date
- **Service Types:** Sunday Service | Midweek Service | Special Service
- Service rows: Time, type chip (color-coded), title, speaker, topic, series, location
- SERVING badge: Shown if user is scheduled to serve
- LOCKED indicator: For institutional services (sunday_morning, midweek)
- "Jump to This Week" button
- Shows 4 upcoming + 4 past services

#### Ministry View

**Component:** `ChurchScheduleMinistry`

- SectionList grouped by ministry → then by date within each
- Only shows user's ministry memberships
- Demo: Formation Kids + Single & Purposeful (ICCLA user)
- **Event Types:** CLASS | SMALL_GROUP | PLANNING | OUTREACH | TRAINING
- Event rows: Time, type chip, title, room, SERVING badge, RSVP indicator
- Ministry-scoped drill-in with role-based filtering

---

### 2.3 Ministries Tab

**Component:** `ChurchMinistries`

**Purpose:** "Where do I belong?" — structural ministry directory

**Layout:** Single vertical scroll

**Sections:**
1. **Header:** Title + search input + All/My filter toggle
2. **My Ministries:** User's current memberships with role badge (e.g., "Teacher")
3. **All Ministries:** Campus-wide directory (includes supplemental ministries)

**Ministry Card:**
- Icon + color strip
- Name, mission statement, leader, volunteer count, meeting day/time, status badge
- Tap → `ChurchMinistryDetailSheet` (50% → 100%)

**Filter Logic:**
- "My" mode: Filters to user's memberships only
- "All" mode: Shows full campus directory
- Demo: ICCLA user has Formation Kids (Teacher) + Single & Purposeful (Member)

---

### 2.4 Connect Tab

**Component:** `ChurchConnect`

**Purpose:** "How do I connect?" — people, groups, care shortcuts

**Layout:** Single vertical scroll with 5 blocks

#### Block 1 — Quick Actions (4 Buttons)
- Message | Prayer | Serve | Groups
- Large icon buttons with labels
- Message → Messages tab; Prayer → Prayer request sheet

#### Block 2 — Leaders & Staff (Campus-Scoped)
- Leader cards: Name, title, contact badge
- Tap → `ChurchLeaderProfileSheet`
- Campus-scoped: Only shows leaders for active campus

#### Block 3 — My Connections
- Relational shortcuts (4–6 connection cards)
- Name, role in context, ministry context
- Tap → Direct message or profile sheet

#### Block 4 — Join / Get Involved (3 Cards)
- "Join a Ministry" | "Join a Small Group" | "Serve"
- CTA cards routing to Ministries tab or action sheet

#### Block 5 — Care & Support (2 Cards)
- "Prayer Request" → `ChurchPrayerRequestSheet`
- "Care Request" → TBD

---

## 3. Media Tab — 4 Universal Panels

| Position | Tab     | Church Implementation            |
|----------|---------|----------------------------------|
| 1        | Feed    | Church video feed                |
| 2        | Explore | `ChurchExplorePageV2`            |
| 3        | Rooms   | `ChurchRoomsV2` (5 curated rooms)|
| 4        | Library | `ChurchLibraryV2` (folder-first) |

---

### 3.1 Feed Tab

- Story circles + video feed posts
- Church content: Sermons, worship clips, event recaps
- V0 (public) content only in feed
- Same interaction pattern: Like, Comment, Share, Save

---

### 3.2 Explore Tab — ChurchExplorePageV2

**Component:** `ChurchExplorePageV2`

2-column grid discovery with visibility-based content gating.

**Filter Controls:**

| Filter  | Options                                          |
|---------|--------------------------------------------------|
| Scope   | My Campus (default) · All Public                 |
| Type    | All · Sermon · Worship · Event · Training · Clip |

**Search:** "Search sermon / speaker / campus / event" — searches title, speaker, campusName

**Visibility Pipeline:**
1. Base: Filter tiles by `visibilityClass ≤ user_visibility`
2. "My Campus" scope: Show tiles where `campusId === user_campus` (V0 + V2 + V3)
3. "All Public" scope: Show **only V0** tiles from all campuses; optional campus sub-filter
4. Then type filter, then search

**Type Badge Colors:**

| Type     | Color              |
|---------|-------------------|
| Sermon  | #1D9BF0 (Blue)    |
| Worship | #8B5CF6 (Purple)  |
| Event   | #22C55E (Green)   |
| Training| #F59E0B (Amber)   |
| Clip    | #1D9BF0 (Blue)    |

**Tile Card:**
- Square thumbnail with play icon
- Type badge (top-left), duration badge (bottom-right)
- Below: Title, campus name, date (relative), ministry badge (if applicable)
- Tap → Haptic feedback (video player planned)
- Long-press → Quick Actions: Save | Share | Add to Playlist

---

### 3.3 Rooms Tab — ChurchRoomsV2

**Component:** `ChurchRoomsV2`

5 curated collection rooms with drill-in feed:

| Room          | Purpose                                   | Access        |
|--------------|-------------------------------------------|---------------|
| Service Room | Full-length services, recaps, replays     | V0 (all)      |
| Sermon Room  | Sermons by speaker/series/topic           | V0 (all)      |
| Worship Room | Worship clips, music, singing             | V0 (all)      |
| Ministry Room| Ministry training & events (role-gated)   | V2+ (members) |
| Training Room| Volunteer training, onboarding            | V2+ (members) |

**Room List View:**
- Room cards: Strip color, icon circle, name, description, last updated, item count
- Tap → Drill into room feed (state-based)

**Room Feed View:**
- Filter pills: Type (All/Service/Sermon/Worship/etc.) + Date (Latest/This Week/This Month)
- 2-column grid of feed items
- Item card: Thumbnail, type badge, duration, title, date, speaker/ministry
- Tap → Video player
- Long-press → Share, Save

**Room Access Gating:**
- `minAuthority`: Role threshold (0 = all, 1 = A1+, 2 = A2+)
- `visibilityClass`: V0/V2/V3 gating
- `requiresMinistry`: true = only show to ministry members

---

### 3.4 Library Tab — ChurchLibraryV2

**Component:** `ChurchLibraryV2`

Folder-first structured archive with 3-level drill-in.

**Navigation States:** Sections → Folders → Videos

**6 Library Sections:**

| Section    | Visibility | Items | Subfolders                                |
|-----------|------------|-------|-------------------------------------------|
| Services  | V0         | 14    | 2026, 2025                                |
| Sermons   | V0         | 12    | By Speaker, By Series, By Topic           |
| Ministries| V3 (gated) | 8     | Children's Ministry, Singles Ministry     |
| Training  | V2         | 7     | Volunteer Safety, Leadership Dev, Orientation |
| Playlists | V0         | 3     | User-created playlists                    |
| Saved     | V0         | 5     | Flat list (no subfolders)                 |

**Section Card:** Color strip (left), icon circle, name, item count, chevron

**Folder Card:** Icon circle, name, item count, chevron

**Video Card:** Thumbnail (colored bg), type badge, duration badge, title, speaker, date, series, tags

**Interactions:**
- Tap video → Video player
- Long-press → Share, Save, Add to Playlist
- Back navigation at each drill-in level

**Visibility Gating:**
- User visibility level (0/2/3) filters sections
- Ministry membership gates ministry content
- Mock user: A2, V3, Children's + Singles ministry member

---

## 4. Messages Tab — 3-Tab Church Communications

**Component:** `ChurchMessagesScreen`

| Position | Tab   | Purpose                                |
|----------|------|-----------------------------------------|
| 1        | Inbox| Unread threads + mentions              |
| 2        | Rooms| Campus-scoped ministry channels        |
| 3        | Nexus| Coming Soon placeholder                |

### 4.1 Inbox
- Unread threads + Mentions sections
- Thread rows: Avatar, name, preview, time
- Tap → Thread detail with message list + composer
- Search by name/preview

### 4.2 Rooms
- Campus-scoped, ministry-structured channels
- Room cards: Icon, name, description, last updated, item count
- Tap → Room feed with message list + composer
- Compose: New message input with Send + Emoji

### 4.3 Nexus
- Coming Soon placeholder (future organizational inbox integration)

---

## 5. Organization Tab — 6 Universal Tabs

| Position | Tab        | Church Implementation           |
|----------|-----------|----------------------------------|
| 1        | Program   | `ChurchProgramV3`                |
| 2        | People    | `ChurchPeopleV3`                 |
| 3        | Finance   | `ChurchFinanceV3`                |
| 4        | Compliance| `ChurchComplianceV3`             |
| 5        | Facilities| `ChurchFacilitiesV3`             |
| 6        | Ledger    | `ChurchLedgerV3`                 |

Wrapped in `ChurchProvider` for church-specific state context.

---

### 5.1 Program Tab — Campus Control Plane

**Component:** `ChurchProgramV3`

Single vertical scroll with 7 blocks:

#### Block 1 — Header
- Campus name, city/state, status, founding year, lead pastor

#### Block 2 — Campus Snapshot
- Weekly services count, active ministries, active volunteers, next upcoming event

#### Block 3 — Service Rhythm
- Recurring services with times (e.g., Sun 10 AM, Sun 6 PM, Wed 7 PM)
- Service type indicators

#### Block 4 — Ministry Structure
- 9 ministries with category, member count, leader
- "Yours" badge for user's memberships
- Ministry categories: Children, Youth, Young Adult, Women, Men, Worship, etc.

#### Block 5 — Volunteer Snapshot
- Total volunteers, team breakdowns, open positions
- Recruitment status

#### Block 6 — Operational Health
- Finance | Compliance | Facilities status
- Health colors: Green (healthy), Yellow (attention needed), Red (critical)

#### Block 7 — Quick Links
- Shortcuts to People, Finance, Compliance tabs

**Interaction Model:** Read-only. All edits via Nexus (propose → confirm → commit).

---

### 5.2 People Tab

**Component:** `ChurchPeopleV3`

- Staff directory, leaders, volunteer roster
- Campus-scoped filtering
- Role-based access levels

---

### 5.3 Finance Tab

**Component:** `ChurchFinanceV3`

- Tithes, offerings, giving campaigns
- Budget tracking and allocation
- Read-only for most roles (A3+ for detailed access)

---

### 5.4 Compliance Tab

**Component:** `ChurchComplianceV3`

- Legal status, safety certifications
- Background check tracking
- Policy documentation

---

### 5.5 Facilities Tab

**Component:** `ChurchFacilitiesV3`

- Campus buildings and rooms
- Room booking/availability
- Maintenance schedules

---

### 5.6 Ledger Tab

**Component:** `ChurchLedgerV3`

- Transaction history (tithes, offerings, expenses)
- Audit trail
- Read-only, append-only

---

## 6. Visibility Classes (V0/V2/V3 Gating)

Content-gating framework across all church mode screens:

| Class | Scope             | Content Examples                                    |
|-------|-------------------|-----------------------------------------------------|
| V0    | Public            | Sermons, worship clips, public event recaps, services|
| V2    | Campus-Internal   | Internal training, leadership messages, staff meetings|
| V3    | Ministry-Private  | Ministry training, internal resources, planning docs |

**Enforcement Points:**
- Explore: Filter tiles by user visibility level
- Rooms: Hide entire rooms if user lacks access
- Library: Section/folder visibility checks
- Dashboard/Schedule: Role-based section gating via RBAC matrices

---

## 7. Church RBAC (12 Roles × 4 Dimensions)

### Role Hierarchy (C0–C11)

| Level | Role                  | Authority Level    |
|-------|----------------------|-------------------|
| C0    | System Owner         | Institutional     |
| C1    | Senior Pastor        | Institutional     |
| C2    | Executive Pastor     | Domain governance  |
| C3    | Ministry Director    | Program governance |
| C4    | Ministry Leader      | Execution          |
| C5    | Worship Leader       | Execution (worship)|
| C6    | Volunteer Coordinator| Execution (volunteers)|
| C7    | Volunteer            | Personal           |
| C8    | Member               | Observer           |
| C9    | Attendee             | Observer (public)  |
| C10   | New Believer         | Observer (public)  |
| C11   | Visitor              | Observer (public)  |

### 4 Dimensions

| Dimension        | Purpose                                       |
|-----------------|-----------------------------------------------|
| Authority (A)   | What the role can do (view/edit/manage)        |
| Domain Scope (D)| Which domains the role can access              |
| Visibility (V)  | Which content classifications are visible      |
| Decision Access | Which governance decisions the role participates in |

### Visibility Matrices

- **Home pill visibility:** Dashboard (all), Schedule (all), Ministries (hide C9/C11), Connect (hide C7–C11)
- **Org tab visibility:** Program (A3+ full), Finance (A3+), Compliance (A3+)
- **Dashboard section visibility:** Ministry health (C3–C4+ only), Growth metrics (C0–C2+ full)

### Helper Functions

- `getChurchRole(membershipId)` — Resolve user role
- `getChurchHomeTabVisibility(tab, role)` → 'full' | 'exact' | 'limited' | 'hidden'
- `getChurchOrgTabVisibility(tab, role)` → visibility level
- `getVisibleChurchPills(role)` → array of visible pills
- `canSeeChurchDashboardSection(section, role)` → visibility level

---

## 8. Campus Scoping

Multi-campus architecture runs throughout church mode:

| Surface     | Campus Behavior                                          |
|------------|----------------------------------------------------------|
| Dashboard  | Next Event filtered to active campus                     |
| Schedule   | All events filtered to active campus                     |
| Ministries | Campus-specific ministry roster                          |
| Leaders    | Campus-specific leader cards                             |
| Explore    | "My Campus" filter vs. "All Public"                      |
| Rooms      | Campus-scoped room visibility                            |
| Library    | Campus-scoped content within sections                    |
| Organization| Campus-scoped data (finance, facilities, people)        |

**Demo Campuses:**
- ICCLA (ICC Los Angeles) — primary demo
- ICCIE (ICC Inland Empire) — secondary demo

---

## 9. Bottom Sheet Components

All sheets use `@gorhom/bottom-sheet` with 50% → 100% snapping and drag-to-dismiss.

| Sheet                        | Trigger                   | Content                          |
|-----------------------------|---------------------------|----------------------------------|
| `ChurchEventDetailSheet`    | Tap event card            | Event info, RSVP, directions     |
| `ChurchMinistryDetailSheet` | Tap ministry card         | Ministry overview, join/leave, events |
| `ChurchLeaderProfileSheet`  | Tap leader card           | Leader bio, contact, socials     |
| `ChurchPrayerRequestSheet`  | Prayer action button      | Prayer request submission form   |
| `ChurchGiveSheet`           | Give action button        | Giving/tithe submission UI       |

---

## 10. Key Data Sources

| Data Source        | File                              | Content                           |
|-------------------|------------------------------------|-----------------------------------|
| Home/Dashboard    | `data/mock-church-home.ts`         | Services, events, leaders, ministries |
| Event Details     | `data/mock-church-events.ts`       | Event enrichment data              |
| Explore Grid      | `data/mock-church-explore-grid.ts` | ~20 tiles (V0/V2/V3)              |
| Rooms             | `data/mock-church-rooms.ts`        | 5 rooms + feed items               |
| Library           | `data/mock-church-library.ts`      | 6 sections, 10+ folders, 50+ videos |
| Org People        | `data/mock-church-org-people.ts`   | Staff, leaders, volunteers         |
| Org Finance       | `data/mock-church-org-finance.ts`  | Giving, tithes, campaigns          |
| Org Compliance    | `data/mock-church-org-compliance-legal.ts` | Legal, certifications    |
| Org Facilities    | `data/mock-church-org-facilities.ts` | Buildings, rooms, amenities      |
| Org Operations    | `data/mock-church-org-operations.ts` | Operational metrics              |
| Org Resources     | `data/mock-church-org-resources.ts`  | Training, educational content    |
| Org Donations     | `data/mock-church-org-donations.ts`  | Giving campaigns                 |
| Giving            | `data/mock-church-giving.ts`       | Tithe/offering UI data            |
| RBAC Registry     | `utils/rbac/church-registry.ts`    | 12-role matrix, visibility tables |

---

## 11. File Structure

```
components/
├── church/
│   ├── church-home.tsx                 — Home wrapper (4-pill PagerView)
│   ├── church-schedule.tsx             — Schedule wrapper (3 pills)
│   ├── church-schedule-agenda.tsx       — Agenda view
│   ├── church-schedule-services.tsx     — Services view
│   ├── church-schedule-ministry.tsx     — Ministry events view
│   ├── church-ministries.tsx           — Ministry directory
│   └── church-connect.tsx              — Connect tab (people + care)
├── church-home/
│   └── church-dashboard-v2.tsx         — Dashboard (5 blocks)
├── church-explore/
│   └── church-explore-page-v2.tsx      — 2-column explore grid
├── church-rooms/
│   └── church-rooms-v2.tsx             — 5 curated rooms
├── church-library/
│   └── church-library-v2.tsx           — 6-section folder-first archive
├── church-messages/
│   └── church-messages-screen.tsx      — 3-tab communications
├── organization/
│   ├── church-program-v3.tsx           — Program tab (7 blocks)
│   ├── church-people-v3.tsx            — People tab
│   ├── church-finance-v3.tsx           — Finance tab
│   ├── church-compliance-v3.tsx        — Compliance tab
│   ├── church-facilities-v3.tsx        — Facilities tab
│   └── church-ledger-v3.tsx            — Ledger tab
data/
├── mock-church-home.ts                 — Home data (services, events, leaders)
├── mock-church-events.ts               — Event enrichment
├── mock-church-explore-grid.ts         — Explore tiles
├── mock-church-rooms.ts                — Room definitions + feed items
├── mock-church-library.ts              — Library sections/folders/videos
├── mock-church-org-people.ts           — Staff and volunteers
├── mock-church-org-finance.ts          — Financial data
├── mock-church-org-compliance-legal.ts — Compliance data
├── mock-church-org-facilities.ts       — Facilities data
├── mock-church-org-operations.ts       — Operations data
├── mock-church-org-resources.ts        — Resource data
├── mock-church-org-donations.ts        — Giving campaigns
├── mock-church-giving.ts               — Giving UI data
└── mock-church.ts                      — Legacy church data
utils/
└── rbac/
    └── church-registry.ts              — 12-role RBAC matrix
```
