# TEAM KR -- MATH, PIPELINE & DIAGNOSTICS

## 0. Scope
This is the single authoritative document for Team KR computation in women's soccer. Team KR is the rotation-weighted aggregation of players' Final System KRs under the selected Program Context. Architecture identical to men's soccer Team KR.

Team KR does not evaluate players. It consumes finalized player outputs from upstream.

## 1. Inputs (Non-Negotiable)

Per player in rotation:
- Final_System_Offense_KR_i (from Player System Fit layer)
- Final_System_Def_KR_i (from Player System Fit layer)
- Minutes played (official match logs or coach-entered)
- Offensive contribution rate: (xG + xA)/90 if available, or (Goals + Assists)/match if not
- Offensive archetype demand tier (A/B/C/No-match) for selected offensive system
- Defensive archetype demand tier (A/B/C/No-match) for selected defensive system
- Height (cm), Weight (kg)
- Position (GK, CB, FB, WB, CDM, CM, CAM, W, SS, ST)

Per program (from Coach Context Setup):
- Governing Body / Division / Major Class (college) or League (pro)
- Formation
- Offensive System + Defensive System
- Competitive level

Explicit exclusions (locked):
- No archetype recomputation
- No badge/label recomputation
- No trait recomputation
- No injury/fatigue modeling

## 2. Participation Threshold

Rotation-only model. No starter/bench labels.
- MIN_PARTICIPATION = 0.05 (5% of total minutes)
- Include player i in Team KR math iff minutes_share_i >= MIN_PARTICIPATION
- Exclude all players below threshold
- Evaluation window: season-to-date (default)

## 3. Offensive Weight Per Player

(Identical formula structure to men's soccer. Three inputs blended based on data availability.)

### 3.1 Data Tier Formulas

Tier 1 -- Full data (xG/xA available):
Off_Weight_Raw_i = (ContribRate_i x 0.50) + (Minutes%_i x 0.25) + (Off_Role_Score_i x 0.25)

Tier 2 -- Mid data (goals/assists only):
Off_Weight_Raw_i = (GA_Rate_i x 0.50) + (Minutes%_i x 0.25) + (Off_Role_Score_i x 0.25)

Tier 3 -- Low data (minutes only):
Off_Weight_Raw_i = (Minutes%_i x 0.75) + (Off_Role_Score_i x 0.25)

### 3.2 System Role Multipliers (Locked)
| Demand Tier | Multiplier |
|---|---|
| A (Critical) | 1.20 |
| B (High) | 1.00 |
| C (Optional) | 0.85 |
| No match | 0.70 |

### 3.3 Normalization
Off_Weight_i = Off_Weight_Raw_i / Sum(Off_Weight_Raw). All offensive weights sum to 1.0.

## 4. Defensive Weight Per Player

(Identical to men's. Two or three inputs blended.)

## 5. Coverage Modifier (Bench Adjustment)

(Identical to men's. See men's File 03.)

## 6. Physical Environment Modifier (Women's Soccer-Specific)

### 6.1 Purpose
Adjusts Team KR for physical mismatches that affect women's soccer outcomes: aerial dominance (set pieces and crosses), pace in transition, stamina for pressing intensity.

### 6.2 Computation
For each position group (CB pair, CM pairing, FB pair, front 3):
- Aerial Score: average height of CBs/STs, weighted by aerial duel win % if available
- Pace Score: estimated speed of wide players and FBs (from tracking data or UNSCORED)
- Stamina Score: average minutes/match of midfield (pressing sustainability proxy)

Physical Environment Modifier = 0.0 (baseline) with adjustments:
- If Aerial Score is bottom-quartile at level: -1.0 to Team KR
- If Pace Score is bottom-quartile: -0.5 to Team KR
- If Stamina Score is bottom-quartile and system is High Press/Gegenpressing: -1.0 to Team KR

Women's-specific note: Aerial dominance has a different distribution in women's soccer (average CB height ~170cm vs ~185cm in men's). The bottom-quartile thresholds are calibrated to women's norms. Height advantage is still meaningful but the absolute numbers are different.

## 7-12. (Identical to men's soccer: Final Normalization, Team Off KR, Team Def KR, Overall Team KR with level-contextual split, Depth Handling, Diagnostics Layer)

Overall Team KR level splits:

| Level | Offense Weight | Defense Weight |
|---|---|---|
| D1 HM / WSL / NWSL | 52% | 48% |
| D1 MM / Liga F / D1F | 50% | 50% |
| D1 LM / Frauen-BL | 48% | 52% |
| D2 / Serie A Femminile | 47% | 53% |
| NAIA / D3 / Lower College | 45% | 55% |
| NJCAA / CCCAA | 44% | 56% |

---

# SYSTEM INFERENCE ENGINE -- OSIE + DSIE

(Identical structure and classification triggers to men's soccer. See men's File 03. All 14 offensive and 10 defensive classification triggers apply. System confidence bands are the same.)

---

# TEAM KR TIERS

Team KR Tiers are level-specific.

## NWSL Team KR Legend (lambda 0.950)

| Team KR | Tier Label | Reality |
|---|---|---|
| 92+ | Championship Contender | Top 3-4. Deep playoff run expected. |
| 88-91 | Playoff Lock / Top 8 | Consistent playoff qualifier. |
| 84-87 | Playoff Bubble | 7th-10th. Could make expanded playoffs. |
| 80-83 | Mid-Table | Competitive but not playoff caliber. |
| 76-79 | Lower Table | Below playoff standard. |
| 72-75 | Bottom of Table | Rebuilding. Expansion-level. |
| Below 72 | Below NWSL Competitive Standard | |

## WSL Team KR Legend (lambda 1.000)

| Team KR | Tier Label | Reality |
|---|---|---|
| 94+ | Title Contender | Chelsea/Arsenal/Man City level. UWCL knockout. |
| 90-93 | Top 4 / UWCL Qualifier | Consistent top-4 finish. |
| 86-89 | Upper Mid-Table | 5th-7th. Competitive. |
| 82-85 | Mid-Table | Stable WSL existence. |
| 78-81 | Lower Table | Flirting with relegation. |
| 74-77 | Relegation Battle | Bottom 2-3. |
| Below 74 | WSL 2 Level | |

## NCAA D1 HM Team KR Legend (lambda 1.000)

| Team KR | Tier Label | Reality |
|---|---|---|
| 94+ | College Cup Contender | National title caliber. |
| 90-93 | Sweet 16 / Elite 8 | Deep tournament run expected. |
| 86-89 | NCAA Tournament Team | Consistent tournament qualifier. |
| 82-85 | Bubble / First Round Exit | On the edge. |
| 78-81 | Mid-Conference | .500 or slightly above. |
| 74-77 | Lower Conference | Below .500. |
| Below 74 | Rebuilding | Below competitive D1 HM threshold. |

(Additional Team KR legends for Liga F, D1F, Frauen-BL, D1 MM, D1 LM, D2, NAIA, D3, NJCAA follow the same structure with level-appropriate adjustments.)

---

# SCHOLARSHIP ALLOCATION ENGINE

## Purpose
Distributes scholarship budget optimally across position groups based on system demands and KR distribution. Women's soccer-specific.

## NCAA Scholarship Context (2025-26)

| Level | Traditional Limit | New Rules (Opt-In) | Roster Cap |
|---|---|---|---|
| D1 | 14 equivalency | Up to 28 | 28 |
| D2 | 9.9 equivalency | Unchanged | Varies |
| NAIA | 12 | N/A | Varies |
| D3 | 0 (no athletic aid) | N/A | Varies |
| NJCAA D1 | 18 | N/A | Varies |

## Position Group Value by System

| System | Most Valuable Position(s) | Scholarship Concentration |
|---|---|---|
| Tiki-Taka | CM, CDM, CB | Midfield + defense heavy |
| Gegenpressing | CM, ST, W | Midfield + attacking press |
| Counter-Attack | ST, W, CB | Forward pace + defensive solidity |
| Possession | CM, CDM, GK | Midfield control |
| Direct / Long Ball | ST, CB | Target + aerial defense |
| Inside Forward | W, FB, CM | Wide players + overlapping FBs |
| False 9 | ST/CAM, CM | Creative forwards + midfield |

## Allocation Framework (College)

For a program with 14 traditional scholarships (or 28 if opt-in):

| Position Group | % of Total Scholarship Equivalents | Notes |
|---|---|---|
| Goalkeeper (1-2) | 7-10% | One full scholarship starter, one partial backup. |
| Centre-Backs (2-3) | 15-20% | Foundation. Invest in at least one elite CB. |
| Fullbacks/Wing-Backs (2-4) | 10-15% | System-dependent. Higher in overlap/WB systems. |
| Central Midfield (2-3) | 18-25% | Engine room. Highest variance by system. |
| Wide Players (2-3) | 14-20% | System-dependent. |
| Strikers (1-2) | 15-22% | Highest individual scholarship concentration. |

## NWSL Salary Cap Allocation Framework

For a team with $3.5M salary cap (2026):

| Position Group | % of Cap | Notes |
|---|---|---|
| Goalkeeper | 5-8% | |
| Centre-Backs | 14-18% | |
| Fullbacks/Wing-Backs | 10-14% | |
| Central Midfield | 18-24% | |
| Wide Players | 14-20% | |
| Strikers | 16-24% | HIP rule player likely a forward. |

---

# ROSTER DECISION INTELLIGENCE

## NWSL Roster Rules (2026)

| Parameter | Value |
|---|---|
| Roster Size | 22-26 active players |
| Salary Cap | $3.5M (base) + $1M HIP rule |
| Minimum Salary | $48,500 |
| Maximum Salary | $230,000 (base, before HIP) |
| Transfer Fee Threshold | $605,000 net (25% cap penalty if exceeded) |
| Free Agency | Full free agency when out of contract |
| Draft | Eliminated (2025 CBA) |
| Loans | Intra-league loans introduced 2026 |
| U18 Players | Max 4 on roster |

## WSL Roster Rules (2025-26)

| Parameter | Value |
|---|---|
| Squad Size | ~23-25 |
| Salary Cap | 40% of club revenue (soft cap) |
| Minimum Salary | Introduced 2025-26 (full-time wage, exact figure TBD) |
| Transfer Window | Summer (Jun-Sep) + Winter (Jan) |

## Transfer Strategy (Women's Soccer-Specific)
- Free agency is the primary player movement mechanism in NWSL (no draft, full free agency)
- International transfers between NWSL and European leagues are increasingly common and growing
- Mid-season moves from NWSL to WSL/European leagues happen during the European winter window
- College-to-pro pathway no longer goes through draft -- direct signing

---

## GOVERNANCE NOTE
Team KR is produced by Nexus. No manual override of computed values. All weights, splits, and modifiers are versioned and locked.
