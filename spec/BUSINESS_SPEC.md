# KaNeXT OS — Business Mode Specification

**Version:** 1.0.0
**Last Updated:** March 2026

---

## 1. Mode Overview

Business mode transforms KaNeXT OS into an executive operations platform for founders, C-suite, board members, and investors. The demo organization is **KaNeXT (Platform)** with accent color Blue (#1D9BF0).

**Mental Model:** Founder's command center — capital, deals, governance, compliance, and financial visibility in one interface.

**Demo Context:**
- Organization: Valuetainment / KaNeXT
- Role: Founder / CEO (B1)
- Visibility: V4 (Founder-level — highest access)
- Authority: A5 (Full execution)

---

## 2. Business Home — 4-Pill Tab Layout

**Component:** `BusinessHome` in `components/business/business-home.tsx`

Four horizontally-swipeable pills via PagerView:

| Position | Pill      | Purpose                                |
|----------|----------|----------------------------------------|
| 1        | Dashboard| Executive snapshot and domain grid      |
| 2        | Schedule | Calendar, agenda, and obligations      |
| 3        | Vault    | Document library and version control   |
| 4        | Deals    | Pipeline, active, closed, archived     |

**Navigation:** `PagedTabBar` + `EdgeHoldAdvance` + standard swipe.

---

### 2.1 Dashboard Tab

**Component:** `BizDashboardV2`

Single vertical scroll with 5 blocks:

#### Block 1 — Hero Card
- Executive-level spotlight (featured deal, milestone, or announcement)
- Title, subtitle, CTA button
- Tap → Drill-down to relevant detail

#### Block 2 — Focus Block
- Current priority items (time-sensitive decisions, pending approvals)
- Quick action chips
- Status indicators

#### Block 3 — Capital Snapshot
- Runway indicator (months remaining)
- MRR / ARR display
- Recent raise status
- Key financial metrics

#### Block 4 — People Snapshot
- Team size, recent hires
- Key personnel status
- Organizational health indicators

#### Block 5 — Domain Grid (2×3 Card Grid)
- 6 domain cards routing to Organization tabs and other surfaces
- Similar to Sports dashboard grid pattern
- RBAC-gated visibility per role

---

### 2.2 Schedule Tab

**Component:** `BizCalendarV2` (3-pill sub-view wrapper)

Three internal pills (state-based, not PagerView):

| Pill         | Purpose                                          |
|-------------|--------------------------------------------------|
| Agenda      | Chronological event list grouped by day          |
| Calendar    | Month grid view with date indicators             |
| Obligations | Board approvals, investor updates, compliance deadlines |

#### Agenda View
- SectionList with sticky day headers
- Event rows: Time, title, location, type badge
- Date-grouped (DAY · MMM D format)

#### Calendar View
- Month grid with date cells
- Dot indicators on dates with events
- Tap date → Shows that day's events

#### Obligations View
- Risk register for governance deadlines
- Board approvals, investor update cadence
- Compliance deadline tracking
- Status badges: On Track | At Risk | Overdue

---

### 2.3 Vault Tab

**Component:** `BizVaultV2` (3-pill sub-view wrapper)

Three internal pills:

| Pill      | Purpose                                     |
|----------|---------------------------------------------|
| Library  | Document categories and folders             |
| Versions | All documents sorted by update date         |
| Activity | Document feed (created/edited/approved/archived) |

#### Library View
- Folder-based organization by document category
- Categories: Legal, Financial, Pitch, Operations, Board, HR
- Folder rows: Icon, name, item count, last updated
- Tap folder → Document list within category

#### Versions View
- All documents sorted by most recent update
- Version metadata: Author, date, size, version number
- Tap → Document reader sheet

#### Activity View
- Date-grouped document activity feed
- Entry types: Created | Edited | Approved | Archived
- Author attribution and timestamps

---

### 2.4 Deals Tab

**Component:** `BizDealsV2` (4-pill sub-view wrapper)

Four internal pills:

| Pill     | Purpose                              |
|---------|--------------------------------------|
| Pipeline| Kanban board with 5 stage columns    |
| Active  | Signed deals in progress             |
| Closed  | Completed deals                      |
| Archive | Abandoned deals (read-only)          |

#### Pipeline View (Kanban)
- 5 stage columns: Prospect → Qualified → Proposal → Negotiation → Closing
- Deal cards: Title, company, value, probability, owner
- Drag-to-move between stages (or tap to advance)
- Status indicators per deal

#### Active View
- List of in-progress signed deals
- Status + timeline display
- Key milestones and next actions

#### Closed View
- Completed deals with close date and parties
- Final terms summary

#### Archive View
- Read-only list of abandoned deals
- Reason for archival documented

---

## 3. Media Tab — 4 Universal Panels

| Position | Tab     | Business Implementation              |
|----------|---------|--------------------------------------|
| 1        | Feed    | Executive video feed                 |
| 2        | Explore | `BusinessExplorePageV2`              |
| 3        | Rooms   | Business film rooms                  |
| 4        | Library | `BusinessLibraryV2` (8-section archive) |

---

### 3.1 Feed Tab

- Story circles + video feed posts
- Business-specific content: Pitch recordings, investor updates, team communications
- Same interaction pattern as global feed (Like, Comment, Share, Save)

---

### 3.2 Explore Tab — BusinessExplorePageV2

**Component:** `BusinessExplorePageV2`

2-column grid discovery for cross-entity media.

**Rendering Context:** Founder / CEO (A5, V4, D5 — highest access)

**Filter Controls:**
- **Scope:** My Entity | All Accessible
- **Type:** All | Deck | Demo | Update | Brief | Recording
- **Visibility:** All | Public | Internal | Board | Executive (founder-only filter)

**Tile Card (16:9 aspect):**
- Thumbnail with play icon (centered, 20pt, white 70% opacity)
- Type badge (top-left): "DECK" — color per type
- Visibility badge (top-right): "INTERNAL" — colored border + bg tint
- Duration badge (bottom-right)
- Pin badge (if pinned)
- Below: Title, entity name, relative date

**Long-Press Actions (Founder):**
- Pin / Unpin
- Add to Playlist
- Share (native share sheet + copy link)
- Archive
- Link to Deal

---

### 3.3 Rooms Tab

Business-specific curated rooms (similar pattern to Sports Film Room).

---

### 3.4 Library Tab — BusinessLibraryV2

**Component:** `BusinessLibraryV2`

3-level drill-in archive: Sections → Folders → Videos

**8 Library Sections:**

| Section      | Visibility | Content                                 |
|-------------|------------|------------------------------------------|
| Executive   | Board+     | Board decks, founder briefs, investor updates |
| Capital     | Board+     | Pitch decks, cap tables, financial models|
| Governance  | Board+     | Board minutes, resolutions, policies     |
| Operations  | Internal   | Process videos, training, handbooks      |
| Product     | Internal   | Demos, walkthroughs, specs               |
| Promotional | Public     | Marketing videos, case studies           |
| Playlists   | Personal   | User-created cross-section collections   |
| Saved       | Personal   | Personal saves                           |

**Section Card:** Colored strip (top), icon circle, name, item count, chevron

**Folder Card:** Folder icon, name, item count, chevron

**Video Card:** Thumbnail, play icon, title, duration, visibility badge

**Long-Press Actions (Founder):**
- Add to Playlist, Pin within Folder, Link to Deal, Link to Vault, Archive, Duplicate, Share

---

## 4. Organization Tab — 6 Universal Tabs

| Position | Tab        | Business Implementation        |
|----------|-----------|--------------------------------|
| 1        | Program   | `BizProgramV3`                 |
| 2        | People    | `BizPeopleV3`                  |
| 3        | Finance   | `BizFinanceV3`                 |
| 4        | Compliance| `BizComplianceV3`              |
| 5        | Facilities| `BizFacilitiesV3`              |
| 6        | Ledger    | `BizLedgerV3`                  |

---

### 4.1 Program Tab

**Component:** `BizProgramV3`

Single vertical scroll with 7 blocks:

#### Block 1 — Company Identity
- Company name, tagline, status (Private/Public/In Discussion)
- Founded date, headquarters location
- Industry, stage (Seed/Series A/B/C/Growth/Public)

#### Block 2 — Company Overview
- Mission statement, vision
- Key markets, competitive positioning
- Team size, organizational structure summary

#### Block 3 — Capital Structure
- Total raised, current round, valuation
- Cap table summary (top shareholders)
- Runway indicator

#### Block 4 — Organizational Structure
- C-suite listing (CEO, CTO, CFO, COO)
- Department count, headcount
- Recent organizational changes

#### Block 5 — Deal Activity
- Active deals count, pipeline value
- Recent deal closings
- Key partnerships

#### Block 6 — Compliance Summary
- Registration status, filing deadlines
- License status, insurance coverage
- Quick health indicators (green/yellow/red)

#### Block 7 — Facilities Summary
- Location count, primary HQ
- Remote/hybrid status
- Quick links to Facilities tab

---

### 4.2 People Tab

**Component:** `BizPeopleV3`

Single vertical scroll with 4 sections:

| Section      | Content                                          |
|-------------|--------------------------------------------------|
| Executives  | C-suite with title, tenure, contact               |
| Departments | Expandable sections (Engineering, Product, Finance, Operations, etc.) |
| Board       | Board members with role, tenure, affiliation       |
| Contractors | External contractors and consultants               |

**Person Row:**
- Avatar (40×40) + Name + Title + Department
- Contact badge (email/phone/LinkedIn)
- Tap → Person detail sheet

**Features:**
- Search bar (name, title, department)
- Department sections: expandable/collapsible
- Headcount badges per department

---

### 4.3 Finance Tab

**Component:** `BizFinanceV3`

Single vertical scroll with 6 blocks:

| Block | Title              | Content                                    |
|-------|--------------------|--------------------------------------------|
| 1     | Capital Overview   | Total raised, current valuation, runway    |
| 2     | Active Raise       | Current round details, target, progress    |
| 3     | Budget Allocations | Department budget breakdown (chart/list)   |
| 4     | Equity Structure   | Cap table, share classes, dilution         |
| 5     | Debt Obligations   | Loans, credit facilities, payment schedule |
| 6     | Quick Links        | Navigate to Ledger, Deals, Compliance      |

**Styling:**
- Large KPI numbers (22pt bold, color-coded)
- Progress bars for raise targets
- Budget allocation cards with department colors

---

### 4.4 Compliance Tab

**Component:** `BizComplianceV3`

Single vertical scroll with 5 blocks:

#### Block 0 — Header
- Title: "Compliance" (22pt bold)
- Fiscal year toggle: FY 2025 | FY 2024

#### Block 1 — Entity Registration Snapshot
- Registered jurisdictions with status chips
- States: Delaware (Active), Tennessee (In Good Standing), Florida (Active)
- Registered Agent, Next Annual Filing date
- "View Filing Queue" link

#### Block 2 — Filing & Deadline Queue
- 5 filing entries sorted by due date (soonest first)
- Each: Title, meta (state + type), status chip, due date
- **Status Colors:** Pending (Orange), Submitted (Blue), Accepted (Green), Overdue (Red)

#### Block 3 — Licenses & Permits
- 4 license entries with status chips
- **Status Colors:** Active (Green), Expiring (Orange), Expired (Red), Renewal Required (Orange)

#### Block 4 — Insurance Coverage
- 4 policy entries with status chips
- **Status Colors:** Active (Green), Expiring (Orange)

#### Block 5 — Legal Matters
- 3 legal matter entries with status chips
- **Status Colors:** Open (Orange), Under Review (Blue), Resolved (Green)

---

### 4.5 Facilities Tab

**Component:** `BizFacilitiesV3`

Single vertical scroll with search + location cards.

#### Header
- Title: "Facilities" (22pt bold)
- Search bar: "Search locations"

#### Locations Grid
- Section: "LOCATIONS (5)" — count updates dynamically
- Sorted: Active first, then alphabetical
- **Location Card:**
  - Icon circle (40×40): Ownership icon (Owned=house, Leased=key, Shared=person.2)
  - Name + City/State
  - Ownership chip + Status chip (Active/Inactive/Planned)
  - Chevron for drill-in

#### Notes Block
- Static organizational notes about facilities

#### Location Detail Sheet (50% → 100%)
- Chips: Ownership + Status
- Fields: Full Address, Category, Primary Use, Square Footage, Headcount, Hours
- **Action Buttons:**
  - "Open in Maps" (accent bg, map.fill icon) → Platform-specific maps URL
  - "Open in Vault" (tertiary bg, doc.text.fill icon) → Navigates to Ledger tab

---

### 4.6 Ledger Tab

**Component:** `BizLedgerV3`

Immutable financial record — append-only audit trail. Read-only, no edits/deletes/approvals.

#### Data Model

```
LedgerEntry:
  id, createdAt, effectiveAt, direction (inflow/outflow/internal_transfer),
  amountCents, category, counterpartyType, counterpartyName, title, memo,
  status, settlementMethod, referenceId, eventId?, paymentId?, budgetBucketId?
```

#### Layout (6 Blocks)

**Block 0 — Header:**
- Title + Fiscal Year toggle + Search bar

**Block 1 — Balances Snapshot (2×2 Grid):**
- Total Inflows (green), Total Outflows (red), Net (green/red), Internal Wallet

**Block 2 — Filters:**
- Date Range pills: Today | This Week | This Month | Fiscal Year
- Category pills: All | CAPITAL | PAYROLL | NIL | TICKETING | DONATIONS | VENDOR | FACILITIES | OPERATIONS | TAX | DEBT | OTHER

**Block 3 — Ledger Feed:**
- Grouped by date (soonest first)
- **Entry Row:**
  - Left: Category icon (34×34, color-coded) + time
  - Center: Title (14pt bold), memo (12pt), category tag
  - Right: Amount (green=inflow, red=outflow, purple=transfer) + status chip

**Entry Detail Sheet (50% → 100%):**
- Large amount (28pt bold) + Direction chip
- Status badge (colored)
- All detail fields (title, category, counterparty, memo, dates, settlement, references)
- Navigation: "Open Event" / "Open Finance Summary"
- Immutability notice with lock icon

#### Status Colors

| Status     | Color              |
|-----------|-------------------|
| DRAFT     | #9CA3AF (Gray)    |
| AUTHORIZED| #3B82F6 (Blue)    |
| SCHEDULED | #8B5CF6 (Purple)  |
| SETTLED   | #22C55E (Green)   |
| REVERSED  | #F59E0B (Orange)  |
| FAILED    | #EF4444 (Red)     |

#### Direction Colors

| Direction | Color   |
|----------|---------|
| Inflow   | Green   |
| Outflow  | Red     |
| Transfer | Purple  |

---

## 5. Messages Tab — Executive Communications Hub

**Component:** `BusinessInboxV2`

### 5.1 Inbox (4 Sections)

| Section     | Content                                          |
|------------|--------------------------------------------------|
| Unread     | DM threads with avatar, name, preview, timestamp |
| Mentions   | @-mentions from rooms with source context        |
| Escalations| Typed escalations (Contract, Legal, HR, Ops, Finance) with status |
| Approvals  | Pending decisions (Budget, Hire, Spend, Contract, Promotion) |

**Escalation Thread Sheet:**
- Type + title + status badge
- Timeline: Created, last updated, target resolution
- Message thread + decision buttons (Approve, Reject, Request Info, Reassign, Resolve)

**Approval Thread Sheet:**
- Type + title + status + requester + due date
- Payload (what's being approved)
- Decision buttons: Approve (green), Request Changes (yellow), Reject (red)
- Comments section

### 5.2 Rooms (4 Sections)

| Section     | Content                             |
|------------|-------------------------------------|
| Pinned     | User-pinned rooms                   |
| Executive  | Board, C-suite, investor channels   |
| Department | Engineering, Product, Finance, etc. |
| Project    | Fundraise, Product Launch, M&A      |

Room rows: Name, preview, timestamp, unread badge
Tap → Room thread (messages, pinned banner, composer)

---

## 6. Universal Sheets

### 6.1 Company Sheet

**Component:** `UniversalCompanySheet`

Company "truth page" with 8 RBAC-gated tabs.

**Header:**
- Logo (48×48) + Company name (22pt bold) + Tagline
- Status pill: Private (gray) | Public (green) | In Discussion (orange)
- Quick chips: Runway, MRR, Key Deal (RBAC-gated)
- Action icons: Share + Data Room link

**8 Tabs:**

| Tab        | Visibility      | Content                                    |
|-----------|----------------|--------------------------------------------|
| Overview  | All            | Mission, markets, team size, org structure  |
| Product   | All            | Features, positioning, competitive landscape|
| Traction  | Board/Investor | Metrics (founder exact, investor banded)    |
| Roadmap   | Board          | Quarterly milestones, next 12 months        |
| Finance   | Board/Investor | KPIs (founder exact, investor banded)       |
| Governance| Board          | Board composition, meeting cadence, voting  |
| People    | Board          | Leadership team, org chart, key hires       |
| Comms     | Board/Investor | Recent updates, board pack links            |

---

### 6.2 Data Room Sheet

**Component:** `UniversalDataRoomSheet`

Investor data room with 7 RBAC-gated tabs.

**7 Tabs:**

| Tab         | Visibility         | Content                                   |
|------------|-------------------|-------------------------------------------|
| Start Here | All               | Onboarding, company snapshot, FAQ          |
| Documents  | Role-based        | Decks, memos, demos, legal, financial      |
| Board Pack | Board/Founder     | Current deck, KPIs, risk register, minutes |
| Decisions  | Board/Founder     | Decision log with outcomes                 |
| KPIs       | Board (exact), Retail (banded) | Metrics dashboard, status indicators |
| Risks      | Board/Founder     | Risk register: severity, status, mitigation|
| Budget     | Board (exact), Retail (banded) | Department budgets, forecasts     |

---

## 7. Business RBAC

### Role Hierarchy (B0–B13)

| Level  | Role                | Access Scope                    |
|--------|--------------------|---------------------------------|
| B0     | Minimal            | Public info only                |
| B1     | Founder / CEO      | Full access                     |
| B2–B5  | Executive          | Department heads, C-suite       |
| B6–B8  | Manager            | Team-level, budgets, approvals  |
| B9–B11 | Operator           | Functional, limited approvals   |
| B12–B13| Investor / Board   | Banded metrics, doc access      |

### Visibility Model

| Class | Scope      | Content                              |
|-------|-----------|--------------------------------------|
| V0    | Public    | Published content, marketing         |
| V1    | Internal  | Employee-only communications         |
| V2    | Board     | Board materials, governance          |
| V3    | Executive | C-suite strategy, sensitive data     |
| V4    | Founder   | Founder-only access                  |

### RBAC Gates

- Company sheet tabs: Overview/Product visible all; Finance/Governance/People visible board+; Traction/Comms visible board+investor
- Data room tabs: Start Here visible all; Documents/KPIs visible founder+board; Budget visible founder+board+investor (banded)
- Org tabs: Program visible all; People/Finance/Ledger visible founder+board; Facilities visible ops+founder; Compliance visible founder+legal
- Media filters: Visibility filter pills only for founder; type/scope for all

---

## 8. Business Context

**Component:** `BusinessContext` in `context/business-context.tsx`

```
BusinessContextValue:
  companies, activeCompanyId, activeCompany,
  setActiveCompany, viewAsRole (B0–B13), setViewAsRole,
  selectedEntityId, selectedEntity, setSelectedEntity,
  pinnedEntityIds, setPinnedEntityIds, recentEntityIds
```

Entity switching: Long-press Org tab or tap entity scope bar → EntitySwitcherSheet modal.

---

## 9. Key Data Sources

| Data Source        | File                              | Content                           |
|-------------------|------------------------------------|-----------------------------------|
| Dashboard         | `biz-dashboard-v2.tsx`             | Hero, focus, capital, people data |
| Calendar/Agenda   | `biz-calendar-v2.tsx`              | Events, obligations               |
| Vault             | `biz-vault-v2.tsx`                 | Documents, versions, activity     |
| Deals             | `biz-deals-v2.tsx`                 | Pipeline, active, closed, archived|
| Explore           | `business-explore-page-v2.tsx`     | Media discovery tiles             |
| Inbox             | `business-inbox-v2.tsx`            | Threads, escalations, approvals   |
| Rooms             | `business-rooms-v2.tsx`            | Group channels                    |
| Library           | `business-library-v2.tsx`          | 8-section media archive           |
| Company Sheet     | `universal-company-sheet.tsx`      | 8-tab company truth page          |
| Data Room         | `universal-data-room-sheet.tsx`    | 7-tab investor data room          |
| RBAC              | `utils/business-rbac.ts`          | 14-level role matrix              |
| Context           | `context/business-context.tsx`     | Business state management         |

---

## 10. File Structure

```
components/
├── business/
│   ├── business-home.tsx               — Home wrapper (4-pill PagerView)
│   ├── universal-company-sheet.tsx      — Company truth page (8 tabs)
│   └── universal-data-room-sheet.tsx    — Data room (7 tabs)
├── biz-home/
│   ├── biz-dashboard-v2.tsx            — Dashboard tab
│   ├── biz-calendar-v2.tsx             — Schedule wrapper (3 pills)
│   ├── biz-agenda-view.tsx             — Agenda view
│   ├── biz-month-calendar.tsx          — Calendar grid
│   ├── biz-obligations-view.tsx        — Obligations view
│   ├── biz-vault-v2.tsx                — Vault wrapper (3 pills)
│   ├── biz-vault-library-view.tsx      — Library view
│   ├── biz-vault-versions-view.tsx     — Versions view
│   ├── biz-vault-activity-view.tsx     — Activity view
│   ├── biz-deals-v2.tsx                — Deals wrapper (4 pills)
│   ├── biz-deals-pipeline-v2.tsx       — Pipeline kanban
│   └── biz-deals-list-views.tsx        — Active/Closed/Archive lists
├── business-explore/
│   └── business-explore-page-v2.tsx    — 2-column explore grid
├── business-inbox/
│   └── business-inbox-v2.tsx           — Executive inbox (4 sections)
├── business-rooms-msg/
│   └── business-rooms-v2.tsx           — Group rooms (4 sections)
├── business-library/
│   └── business-library-v2.tsx         — 8-section media archive
├── organization/
│   ├── biz-program-v3.tsx              — Program tab (7 blocks)
│   ├── biz-people-v3.tsx               — People tab (4 sections)
│   ├── biz-finance-v3.tsx              — Finance tab (6 blocks)
│   ├── biz-compliance-v3.tsx           — Compliance tab (5 blocks)
│   ├── biz-facilities-v3.tsx           — Facilities tab (search + cards)
│   └── biz-ledger-v3.tsx              — Ledger tab (6 blocks)
context/
│   └── business-context.tsx            — Business state provider
utils/
│   └── business-rbac.ts               — 14-level RBAC system
```
