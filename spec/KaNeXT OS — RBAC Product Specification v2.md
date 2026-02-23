# KaNeXT OS — RBAC Product Specification v2

> **Version**: 2.0
> **Date**: February 23, 2026
> **Status**: Implemented — 101 files, verified build
> **Files**: `utils/{sports,business,church,education,competition,system,nexus}-rbac.ts`

---

## 1. Architecture Overview

KaNeXT OS uses a **declarative, matrix-driven RBAC system** across 5 organizational modes. Every mode defines:

1. **Role Lens** — a union type of role IDs (e.g. `SportsRoleLens = 'R0' | 'R1' | ... | 'R13'`)
2. **Visibility Matrices** — `Record<Tab, Record<RoleLens, Visibility>>` tables that map every (tab, role) pair to a visibility level
3. **Helper Functions** — semantic boolean checks (`canSeeSensitive()`, `isFounder()`, etc.) used by consuming components
4. **Quick Actions** — role-specific action menus for home screens

### Resolution Pipeline

```
membership_id
  → isSystemOwner()? → X0 lens (short-circuit)
  → mode-specific role map → RoleLens
  → visibility matrix lookup → 'full' | 'limited' | 'hidden' | ...
```

### Cross-Cutting Systems

| System | File | Purpose |
|--------|------|---------|
| System RBAC | `system-rbac.ts` | SYSTEM_OWNER identity, X0 routing |
| Unified RBAC | `unified-rbac.ts` | Cross-mode dispatcher, `AnyRoleLens` type |
| Nexus RBAC | `nexus-rbac.ts` | AI assistant capability gating (9 levels × 9 capabilities) |

---

## 2. System Owner (X0)

The **SYSTEM_OWNER** is a KaNeXT-internal-only role — mode-agnostic, org-agnostic, single instance (founder account only). Never visible to or assignable by any org.

**Membership IDs**: `mem_sports_kx`, `mem_biz_kx`, `mem_church_kx`, `mem_edu_kx`, `mem_comp_kx`

**Capabilities**:
- Access all 5 modes
- Switch between any org or program
- View-as any role in any mode
- Debug override for demos
- Global audit log access

**Mode Routing**: System Owner resolves to X0 in every mode:

| Mode | Lens |
|------|------|
| Sports | R0 |
| Business | B0 |
| Church | C0 |
| Education | E0 |
| Competition | CO0 |

---

## 3. Sports Mode — 14 Roles (R0–R13)

### 3.1 Role Hierarchy

| ID | Label | Authority Tier |
|----|-------|----------------|
| R0 | System Owner | Full access |
| R1 | Institution Leadership | Full access |
| R2 | Athletic Director | Full access |
| R3 | Head Coach / GM | Full competitive access |
| R4 | Assistant Coach / RC | Limited (governed pathways) |
| R5 | Medical / Performance | Domain-scoped (health lane) |
| R6 | Academic / Compliance | Domain-scoped (academic lane) |
| R7 | Housing / Meals Operations | Domain-scoped (operations lane) |
| R8 | Player | Self-only |
| R9 | Family / Advisors | Limited (schedules, approved comms) |
| R10 | Student (Non-Athlete) | Public only |
| R11 | Fan | Public only |
| R12 | Booster / Donor / NIL | Limited public + program health |
| R13 | Agent / Scout (External) | Abstracted outputs only |

### 3.2 Helper Functions

| Function | Roles | Use |
|----------|-------|-----|
| `canSeeSensitive(role)` | R0–R3 | NIL amounts, aid details, health, compliance, finance |
| `canSeeCoachActions(role)` | R0–R4 | Compare / coaching actions, org tab access |
| `canSeeAdminActions(role)` | R0–R2 | Offer, aid, NIL buttons |

### 3.3 Visibility Types

```typescript
type Visibility = 'full' | 'limited' | 'self' | 'shared' | 'hidden';
type KRVisibility = 'full' | 'bands' | 'partial_self' | 'hidden';
```

### 3.4 Visibility Matrices (12 total)

#### Player Sheet (9 tabs)

| Tab | R0–R3 | R4 | R5 | R6 | R7 | R8 | R9 | R10–R11 | R12 | R13 |
|-----|-------|----|----|----|----|----|----|---------|-----|-----|
| Overview | full | limited | limited | limited | hidden | self | limited | hidden/limited | limited | shared |
| Performance | full | limited | limited | hidden | hidden | self | limited | hidden/limited | limited | shared |
| Film | full | limited | hidden | hidden | hidden | self | hidden | hidden | hidden | shared |
| KR Eval | full | limited | hidden | hidden | hidden | self | hidden | hidden | hidden | hidden |
| Fit + Role | full | limited | hidden | hidden | hidden | self | hidden | hidden | hidden | hidden |
| Development | full | limited | limited | hidden | hidden | self | hidden | hidden | hidden | hidden |
| Health | full | hidden | **full** | hidden | hidden | hidden | hidden | hidden | hidden | hidden |
| Admin | full (R0–R2), hidden (R3) | hidden | hidden | limited | hidden | hidden | hidden | hidden | hidden | hidden |
| Recruiting | full | limited | hidden | hidden | hidden | hidden | hidden | hidden | hidden | shared |

#### Team Sheet (10 tabs)

| Tab | R0–R3 | R4 | R5 | R6 | R7 | R8 | R9 | R10 | R11 | R12 | R13 |
|-----|-------|----|----|----|----|----|----|-----|-----|-----|-----|
| Overview | full | limited | limited | limited | limited | limited | limited | limited | limited | limited | shared |
| Roster | full | limited | limited | limited | hidden | limited | limited | hidden | limited | limited | shared |
| Systems | full | limited | hidden | hidden | hidden | hidden | hidden | hidden | hidden | hidden | hidden |
| Performance | full | limited | limited | hidden | hidden | limited | limited | hidden | limited | limited | shared |
| Lineups | full | limited | hidden | hidden | hidden | hidden | hidden | hidden | hidden | hidden | hidden |
| Schedule | full | **full** | limited | limited | limited | limited | limited | limited | limited | limited | limited |
| Staff | full | limited | limited | limited | limited | limited | limited | hidden | limited | limited | limited |
| Operations | full | hidden | hidden | hidden | limited | hidden | hidden | hidden | hidden | hidden | hidden |
| Finance | full (R0–R2), hidden (R3) | hidden | hidden | hidden | hidden | hidden | hidden | hidden | hidden | hidden | hidden |
| Compliance | full (R0–R2), hidden (R3) | hidden | hidden | limited | hidden | hidden | hidden | hidden | hidden | hidden | hidden |

#### Game Sheet (5 tabs)

| Tab | R0–R3 | R4 | R5 | R6 | R7–R8 | R9 | R10 | R11–R12 | R13 |
|-----|-------|----|----|----|----|----|----|---------|-----|
| Pregame | full | limited | limited | hidden | hidden/limited | limited | hidden | limited | shared |
| Live | full | limited | limited | hidden | hidden/limited | limited | limited | limited | shared |
| Postgame | full | limited | limited | hidden | hidden/limited | limited | hidden | limited | shared |
| AD Overlay | full (R0–R2), hidden (R3+) | — | — | — | — | — | — | — | — |
| Incidents | full | hidden | limited | limited | hidden | hidden | hidden | hidden | hidden |

#### KR Visibility

| Role | KR Display |
|------|-----------|
| R0–R3 | Full (exact number) |
| R4, R13 | Banded (3-point range) |
| R8 | Partial self (own KR only) |
| All others | Hidden |

#### Additional Matrices (8 more)

- **Stats Hub** (7 tabs): Dashboard, Traditional, KR Intelligence, Clusters, Lineups, Play Types, Players
- **Game Plan Hub** (7 tabs): Overview, Offense, Defense, Matchups, Rotation, Scout, Staff — R0–R4 only (coaching staff exclusive)
- **Simulation Hub** (6 tabs): R0–R4 full, R8 limited overview only, all others hidden
- **Development Hub** (7 tabs): R0–R4 full, R5 partial (health overlap), R8 self-only
- **Video Section** (16 sections): Explore (8) + Film Room (4) + Library (4) — granular per-section gating
- **Messages Section** (20 sections): Inbox (5) + Rooms (7) + Requests (7) + Pinned (1)
- **Roster View**: List/System/Cards modes — R0–R6 get list, R7+ get cards only

### 3.5 Quick Actions

| Role | Actions |
|------|---------|
| R0 | System Overview, All Programs, Finance Snapshot, Audit Log |
| R1 | Athletic Overview, Budget Review, Compliance, Approve Requests |
| R2 | Athletic Overview, Roster, Budget Review, Recruiting, Compliance |
| R3 | Roster, Game Plan, Recruiting, Schedule, Statistics, Development |
| R4 | Roster, Game Plan, Schedule, Film Room, Development |
| R5 | Player Health, Schedule, Development Plans |
| R6 | Eligibility, Compliance, Schedule |
| R7 | Housing, Meal Plans, Schedule |
| R8 | My Schedule, My Stats, Film Room, My Development |
| R9 | Schedule, Highlights |
| R11 | Schedule, Standings, Highlights |
| R12 | Schedule, Program Health, Highlights |
| R13 | Roster, Statistics, Schedule |

---

## 4. Business Mode — 14 Roles (B0–B13)

### 4.1 Role Hierarchy

| ID | Label | Category |
|----|-------|----------|
| B0 | System Owner | Platform |
| B1 | Founder / CEO | Executive |
| B2 | Co-Founder / C-Suite | Executive |
| B3 | Department Head / VP | Management |
| B4 | Team Lead / Manager | Management |
| B5 | Employee / Contributor | Internal |
| B6 | Strategic Investor | External / Board |
| B7 | Retail / Minority Investor | External |
| B8 | Advisor | External / Board |
| B9 | Board Member | External / Board |
| B10 | Acquirer / Strategic Partner | External |
| B11 | Subscriber / Customer | External |
| B12 | Public | External |
| B13 | Holding Company | Platform |

### 4.2 Visibility Types

```typescript
type BusinessVisibility = 'full' | 'exact' | 'banded' | 'limited' | 'hidden';
type MetricVisibility = 'exact' | 'banded' | 'hidden';
type DocAccessTag = 'public' | 'retail' | 'board' | 'founder_only' | 'workspace_only';
```

### 4.3 Helper Functions

| Function | Roles | Use |
|----------|-------|-----|
| `isFounder(role)` | B0, B1 | Highest-privilege checks |
| `isBoardLevel(role)` | B0, B1, B2, B6, B8, B9, B13 | Board/governance access |
| `isInvestor(role)` | B6, B7 | Investor-specific views |

### 4.4 Visibility Matrices (9 total)

#### Company Sheet (8 tabs)

| Tab | B0–B2 | B3 | B4 | B5 | B6 | B7 | B8–B9 | B10 | B11–B12 | B13 |
|-----|-------|----|----|----|----|----|----|------|---------|-----|
| Overview | full | full | full | limited | limited | limited | full | limited | limited | full |
| Product | full | full | full | limited | limited | limited | full | limited | limited | full |
| Traction | full | full | limited | hidden | exact | banded | exact | limited | hidden | full |
| Roadmap | full | full | limited | hidden | exact | limited | exact | limited | hidden | full |
| Finance | full | full | limited | hidden | exact | banded | exact | hidden | hidden | full |
| Governance | full | limited | hidden | hidden | exact | hidden | exact | hidden | hidden | full |
| People | full | full | full | limited | exact | limited | exact | limited | limited | full |
| Comms | full | full | full | limited | exact | limited | exact | limited | limited | full |

#### Data Room (7 tabs)

Start Here, Pitch Pack, Product Demo — accessible to B0–B3, B6–B9, B13. Financials/Legal — B0–B4, B6, B8–B9, B13. Board Pack/Decision Log — B0–B2, B6, B8–B9, B13 only.

#### Deal Sheet (8 tabs)

Overview through Risks — accessible to executives, investors, advisor, board, acquirer. Offer Terms — excludes B4. Approvals/Audit Log — limited for non-executive roles.

#### Document Access Policy

| Tag | Who can access |
|-----|---------------|
| `public` | Everyone |
| `retail` | B2, B6, B7, B8, B9, B10 |
| `board` | B2, B6, B8, B9 |
| `founder_only` | B0, B1, B13 only |
| `workspace_only` | B10 (acquirers) only |

#### Additional Matrices

- **Org Tab** (10 tabs): Entities, People, Rooms, Operations, Finance, Payment Rails, Legal, Compliance, Assets, Reports
- **Home Pills** (4): Dashboard, Calendar, Vault, Deals — all visible to all roles
- **Dashboard Blocks** (7): Video Hero, Next Event, Action Row, Pipeline, Proof, Top Deals, Domain Cards
- **Action Cards** (3): Deck, Data Room, Invest
- **Pipeline Metrics** (4): Total Value, Active Deals, Win Rate, Raised — exact/banded/hidden per role
- **Domain Cards** (3): Cap Table, Metrics, Updates

### 4.5 Metric Visibility

| Roles | Display |
|-------|---------|
| B0–B3, B6, B8–B9, B13 | Exact |
| B4, B7, B10 | Banded |
| B5, B11, B12 | Hidden |

---

## 5. Church Mode — 12 Roles (C0–C11)

### 5.1 Role Hierarchy

| ID | Label | Tier |
|----|-------|------|
| C0 | System Owner | Platform |
| C1 | Senior Pastor | Pastoral |
| C2 | Executive Pastor | Pastoral |
| C3 | Ministry Director | Staff |
| C4 | Ministry Leader | Staff |
| C5 | Worship Leader | Staff |
| C6 | Volunteer Coordinator | Staff |
| C7 | Volunteer | Congregant |
| C8 | Member | Congregant |
| C9 | Attendee | Congregant |
| C10 | New Believer | Congregant |
| C11 | Visitor | Guest |

### 5.2 Helper Functions

| Function | Roles | Use |
|----------|-------|-----|
| `isSeniorPastor(role)` | C0, C1 | Top-level pastoral checks |
| `isPastoralLevel(role)` / `isElderLevel(role)` | C0–C2 | Pastoral-level access |
| `isStaffLevel(role)` | C0–C6 | Staff-level access |
| `isMember(role)` | C0–C10 (not C11) | Excludes visitors only |

### 5.3 Visibility Matrices (4 total)

#### Home Tab (10 tabs)

| Tab | C0–C2 | C3–C4 | C5 | C6 | C7–C8 | C9 | C10 | C11 |
|-----|-------|-------|----|----|-------|----|----|-----|
| Dashboard | full | full | full | full | limited | limited | limited | limited |
| Calendar | full | full | full | full | limited | limited | limited | limited |
| Worship | full | full | full | full | full | limited | full | limited |
| Community | full | full | full | full | full | limited | full | limited |
| Serve | full | full | limited | full | limited | hidden | hidden | hidden |
| Give | full | full | full | full | full | limited | full | limited |
| Events | full | full | full | full | full | full | full | full |
| Prayer | full | full | limited | limited | limited/full | hidden | full | hidden |
| Messages | full | full | full | full | full | limited | full | limited |
| Discipleship | full | limited | limited | limited | limited | hidden | limited | hidden |

#### Home Pills (4)

| Pill | C0–C8 | C9 | C10 | C11 |
|------|-------|-----|-----|-----|
| Dashboard | full | full | full | full |
| Calendar | full | full | full | full |
| Ministries | full | hidden | full | hidden |
| Connect | full (C0–C6), hidden (C7+) | hidden | hidden | hidden |

#### Dashboard Sections (5)

| Section | C0–C2 | C3–C4 | C5–C11 |
|---------|-------|-------|--------|
| Video Hero | full | full | full |
| Next Service | full | full | full |
| Commerce Row | full | full | full |
| Ministry Health | full | limited | hidden |
| Growth Metrics | full | limited | limited |

#### Org Tabs (10)

| Tab | C0–C2 | C3 | C4 | C5 | C6–C7 | C8 | C9–C11 |
|-----|-------|----|----|----|----|----|----|
| Ministries | full | full | full | full | limited | limited | limited |
| People | full | full | limited | limited | limited | limited | hidden |
| Rooms | full | full | full | limited | limited | hidden | hidden |
| Operations | full | full | full | hidden | hidden | hidden | hidden |
| Finance | full | limited | limited | hidden | hidden | hidden | hidden |
| Payment Rails | full | hidden | hidden | hidden | hidden | hidden | hidden |
| Compliance | full | limited | limited | hidden | hidden | hidden | hidden |
| Facilities | full | full | full | limited | limited | limited | hidden |
| Resources | full | full | full | limited | limited | limited | hidden |
| Donations | full | full | full | limited | limited | limited | hidden |

---

## 6. Education Mode — 14 Roles (E0–E13)

### 6.1 Role Hierarchy

| ID | Label | Category |
|----|-------|----------|
| E0 | System Owner | Platform |
| E1 | President | Executive |
| E2 | Provost / VP Academic | Executive |
| E3 | VP Student Affairs | Executive |
| E4 | VP Finance / CFO | Executive |
| E5 | Dean | Academic Leadership |
| E6 | Department Chair | Academic Leadership |
| E7 | Faculty | Academic |
| E8 | Academic Advisor | Academic Support |
| E9 | Admissions Officer | Administrative |
| E10 | Financial Aid Officer | Administrative |
| E11 | Student | Enrolled |
| E12 | Alumni | External |
| E13 | Board of Trustees | Governance |

### 6.2 Helper Functions

| Function | Roles | Use |
|----------|-------|-----|
| `isPresident(role)` | E0, E1 | Top-level checks |
| `isDeanLevel(role)` | E0, E1, E2, E5 | Academic leadership |
| `isFacultyLevel(role)` | E0–E7 | Academic staff |
| `isStudent(role)` | E11 | Student-only checks |
| `isEnrolled(role)` | E0–E11 | Excludes alumni (E12) and trustees (E13) |

### 6.3 Visibility Matrices (3 + pills + dashboard)

#### Home Tabs (10)

| Tab | E0–E2 | E3 | E4 | E5 | E6–E7 | E8 | E9 | E10 | E11 | E12 | E13 |
|-----|-------|----|----|----|----|----|----|-----|-----|-----|-----|
| Dashboard | full | full | full | full | full | full | limited | limited | limited | limited | full |
| Calendar | full | full | full | full | full | full | limited | limited | full | limited | full |
| Academics | full | full | limited | full | full | full | hidden | hidden | limited | limited | full |
| Campus | full | full | full | full | full | full | full | full | full | full | full |
| People | full | full | limited | full | full | full | limited | hidden | limited | hidden | full |
| Admissions | full | limited | hidden | limited | limited | limited | **full** | hidden | limited | hidden | full |
| Athletics | full | full | full | full | full | full | full | full | full | full | full |
| Financial | full | limited | **full** | limited | limited | limited | hidden | **full** | limited | hidden | full |
| Housing | full | full | limited | full | full | full | limited | hidden | full | hidden | full |
| Policies | full | full | full | full | full | full | limited | limited | limited | limited | full |

Key: Admissions Officer (E9) gets **full** access to Admissions tab. VP Finance (E4) gets **full** access to Financial tab. Financial Aid Officer (E10) gets **full** access to Financial tab.

#### Org Tabs (10)

| Tab | E0–E2 | E3 | E4 | E5 | E6–E7 | E8–E10 | E11 | E12 | E13 |
|-----|-------|----|----|----|----|--------|-----|-----|-----|
| Institutions | full | full | full | full | limited | limited | limited | limited | full |
| People | full | full | limited | full | full | varies | limited | hidden | full |
| Rooms | full | full | limited | full | full | limited/hidden | limited | hidden | full |
| Operations | full | full | full | limited | limited/hidden | hidden | hidden | hidden | full |
| Finance | full | limited | **full** | limited | limited/hidden | hidden/limited | hidden | hidden | full |
| Payment Rails | full | hidden | **full** | hidden | hidden | hidden | hidden | hidden | full |
| Compliance | full | limited | limited | limited | limited/hidden | hidden | hidden | hidden | full |
| Facilities | full | full | full | full | limited | hidden | limited | hidden | full |
| Resources | full | full | full | full | full | limited | full | limited | full |
| Sponsors | full | hidden | limited | limited | limited/hidden | hidden | hidden | limited | full |

#### Dashboard Sections (9)

Video Hero, Next Event, Action Row — visible to all. Institutional Metrics, Academic Health, Student Success, Campus Life — tiered by role. Advancement — E0–E2, E4, E13 only. Accreditation — E0–E2, E5–E6, E13 only.

---

## 7. Competition Mode — 12 Roles (CO0–CO11)

### 7.1 Role Hierarchy

| ID | Label | Tier |
|----|-------|------|
| CO0 | System Owner | Platform |
| CO1 | Commissioner / League Owner | League Admin |
| CO2 | Deputy Commissioner / Ops | League Admin |
| CO3 | Event Director | League Staff |
| CO4 | Head Official / Ref Director | Officials |
| CO5 | Official / Referee | Officials |
| CO6 | Team Manager / Head Coach | Team |
| CO7 | Player / Athlete / Driver | Team |
| CO8 | Team Staff / Crew | Team |
| CO9 | Media / Broadcaster | External |
| CO10 | Sponsor / Partner | External |
| CO11 | Fan / Public | External |

### 7.2 Helper Functions

| Function | Roles | Use |
|----------|-------|-----|
| `isFullAccess(role)` | CO0–CO2 | League admin full access |
| `isStaffOrAbove(role)` | CO0–CO3, CO6 | Staff + team manager |

### 7.3 Visibility Matrices (7 total)

#### Series Sheet (12 tabs)

| Tab | CO0–CO2 | CO3 | CO4 | CO5 | CO6 | CO7–CO8 | CO9 | CO10–CO11 |
|-----|---------|-----|-----|-----|-----|---------|-----|-----------|
| Dashboard–Events | full | full | full | limited | full | limited | limited | limited |
| Ops | full | full | limited | hidden | limited | hidden | hidden | hidden |
| Rules | full | full | full | full | limited | limited | limited | limited |
| Tech + Compliance | full | full | full | limited | limited | hidden/limited | hidden | hidden |
| Finance | full | hidden | hidden | hidden | hidden | hidden | hidden | hidden |
| Payment Rails | full | hidden | hidden | hidden | hidden | hidden | hidden | hidden |
| Venues | full | full | limited | limited | limited | limited | limited | limited |
| Sponsors | full | full | hidden | hidden | limited | hidden | limited | limited |
| Media | full | full | limited | limited | limited | limited | **full** | limited |

#### Entrant Sheet (6 tabs)

Overview, Roster, Performance — widely visible. Compliance — officials + league. Payouts — CO0–CO2 only. Media Obligations — league + team managers + media (CO9 full).

#### Event Sheet (8 tabs)

Agenda, Sessions — widely visible. Ops — CO0–CO3 + CO6 limited. Live Control — CO0–CO4 only. Results — widely visible. Incidents — officials + league. Payouts — CO0–CO2 only. Media Deliverables — CO9 gets **full**.

#### Dashboard Modules (14)

Header, Today/Next, Live Status, Format, Standings, Schedule, Announcements — widely visible. Media Storylines — CO9 gets full. Ops Taskboard — CO0–CO3 only. Staff Contacts — league + team managers. Officials/Compliance — CO0–CO5. Sponsors/Revenue — league + team + media + sponsors. Governance, Audit Trail — CO0–CO2 only.

#### Additional Matrices

- **Dashboard Sections** (8): Video Hero through Entries — public sections visible to all, ops/tech/entries restricted
- **Org Tabs** (10): Series, People, Rooms, Operations, Finance, Payment Rails, Compliance, Assets, Reports, Sponsors
- **Home Pills** (4): Dashboard, Calendar, Grid, Entries — all visible to all roles

---

## 8. Nexus RBAC — AI Assistant Capability Gating

Nexus uses an **abstracted 9-level capability matrix** (R1–R9) that is mode-agnostic. Each mode's roles are mapped to a Nexus level via `mapRoleToRBAC()`.

### 8.1 Capability Matrix

| Level | C1 Ask | C2 Nav | C3 Task | C4 Request | C5 Post | C6 Summarize | C7 Approve | C8 High-Impact | C9 Cross-Context |
|-------|--------|--------|---------|------------|---------|-------------|------------|---------------|-----------------|
| R1 | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| R2 | Y | Y | Y | Y | Y | Y | Y | | |
| R3 | Y | Y | Y | Y | Y | Y | | | |
| R4 | Y | Y | Y | Y | Y | | | | |
| R5 | Y | Y | | Y | | | | | |
| R6 | Y | Y | Y | Y | | | | | |
| R7 | Y | Y | | Y | | | | | |
| R8 | Y | Y | | Y | | | | | |
| R9 | Y | Y | | | | | | | |

### 8.2 Cross-Mode Nexus Mapping

| Nexus Level | Sports | Business | Church | Education | Competition |
|-------------|--------|----------|--------|-----------|-------------|
| R1 | AD, HC, GM | Founder, CEO | Senior Pastor | President | Commissioner |
| R2 | — | Co-Founder, C-Suite | Exec Pastor | Provost, Dean | Deputy Comm, Event Dir |
| R3 | Asst Coach | Dept Head, VP | Ministry Director | Dept Chair | Head Official |
| R4 | Medical, Academic | Team Lead, Manager | Ministry/Worship Leader | Faculty | Team Manager |
| R5 | Scout, Agent, Donor | Investor, Board Member | — | Advisor, Trustee | Media, Sponsor |
| R6 | Player | Employee | Volunteer | — | Player |
| R7 | Family | — | Member | Student | — |
| R8 | — | — | Attendee | Alumni | — |
| R9 | Fan | Public | Visitor | — | Fan |

### 8.3 Action → Capability Mapping

| Action | Required Capability |
|--------|-------------------|
| `create_task`, `create_workspace`, `add_to_board`, `remove_from_board`, `change_pipeline_stage`, `flag_player`, `create_calendar_event` | C3 (Create Task) |
| `create_request`, `escalate` | C4 (Create Request) |
| `post_room`, `send_dm` | C5 (Post Room) |
| `summarize_room` | C6 (Summarize Room) |
| `approve`, `deny` | C7 (Approve/Deny) |
| `generate_packet`, `update_scholarship`, `adjust_budget` | C8 (High-Impact) |
| `navigate`, `switch_context` | C2 (Navigate) |
| `show_contexts`, `show_workspaces`, `pin_conversation`, `unpin_conversation` | C1 (Ask) |

### 8.4 High-Impact Actions (require confirmation)

`approve`, `deny`, `generate_packet`, `post_room`, `add_to_board`, `remove_from_board`, `change_pipeline_stage`, `update_scholarship`, `adjust_budget`, `send_dm`

### 8.5 Refusal Pattern

When a user attempts an action above their capability level:

> I can't [action label] at your current access level.
> I can:
> 1. Create a request to the right owner
> 2. Save as open question
> Reply 1 or 2.

---

## 9. Implementation Notes

### 9.1 File Structure

```
utils/
  sports-rbac.ts       — 806 lines, 14 roles, 12 matrices
  business-rbac.ts     — 547 lines, 14 roles, 9 matrices
  church-rbac.ts       — 374 lines, 12 roles, 4 matrices
  education-rbac.ts    — 441 lines, 14 roles, 3+ matrices
  competition-rbac.ts  — 435 lines, 12 roles, 7 matrices
  system-rbac.ts       — 80 lines, system owner identity + routing
  unified-rbac.ts      — cross-mode dispatcher (AnyRoleLens)
  nexus-rbac.ts        — 203 lines, 9×9 capability matrix
```

### 9.2 Row Builder Pattern

Every mode uses a `r()` helper function that takes N positional arguments (one per role) and returns a `Record<RoleLens, Visibility>`. This makes matrices compact and scannable:

```typescript
function r(r0: V, r1: V, r2: V, ..., r13: V): Record<SportsRoleLens, V> {
  return { R0: r0, R1: r1, R2: r2, ..., R13: r13 };
}
```

### 9.3 Consuming Components Pattern

Components use helper functions rather than hardcoded role IDs:

```typescript
// Good — semantic, future-proof
if (!canSeeCoachActions(role)) return <LockedState />;
if (canSeeSensitive(role)) return ALL_TABS;

// Avoid — brittle
if (role === 'R4' || role === 'R5') return <LockedState />;
```

### 9.4 Default Roles

| Mode | Default Role | Meaning |
|------|-------------|---------|
| Sports | R3 | Head Coach / GM |
| Business | B1 | Founder / CEO |
| Church | C1 | Senior Pastor |
| Education | E11 | Student |
| Competition | CO6 | Team Manager |

### 9.5 Visibility Level Definitions

| Level | Sports | Business | Church/Education |
|-------|--------|----------|-----------------|
| `full` | All data, all actions | All data, all actions | All data, all actions |
| `exact` | — | Precise numbers shown | Precise numbers shown |
| `limited` | Subset of data, no sensitive fields | Subset, some fields hidden | Subset of data |
| `banded` | — | Range shown (e.g. "$1M–$2M") | — |
| `self` | Own data only | — | — |
| `shared` | Abstracted/aggregated output | — | — |
| `hidden` | Tab/section not shown | Tab/section not shown | Tab/section not shown |
