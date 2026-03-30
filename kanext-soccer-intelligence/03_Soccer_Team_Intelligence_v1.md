# TEAM KR -- MATH, PIPELINE & DIAGNOSTICS

## 0. Scope
This is the single authoritative document for Team KR computation in soccer. Team KR is the rotation-weighted aggregation of players' Final System KRs under the selected Program Context, with system-role weighting, usage-informed offensive weights, physical environment adjustment, and level-contextual offense/defense splits.

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

Three inputs blended based on data availability:
- Offensive contribution rate (xG+xA or G+A) -- who produces (50% when available)
- Minutes% -- who is on the pitch (25%, or 75% when contribution data unavailable)
- System Role -- how critical to the offensive system (25%)

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

Two or three inputs blended:
- Minutes% -- defensive presence (50-60%)
- System Role -- archetype importance to defensive system (40%)
- Matchup Assignment (10%, if event-level data available)

### 4.1 Data Tier Formulas

Tier 1 -- Event data available:
Def_Weight_Raw_i = (Minutes%_i x 0.50) + (Def_Role_Score_i x 0.40) + (Matchup_Importance_i x 0.10)

Tier 2 -- No event data:
Def_Weight_Raw_i = (Minutes%_i x 0.60) + (Def_Role_Score_i x 0.40)

### 4.2 Normalization
Def_Weight_i = Def_Weight_Raw_i / Sum(Def_Weight_Raw). All defensive weights sum to 1.0.

## 5. Coverage Modifier (Bench Adjustment)

### 5.1 Identify First XI and Bench
Top 11 by minutes = "First XI equivalent." Remaining rotation = "Bench."

### 5.2 Map Gaps
Compare First XI archetypes against system demand profile. Identify uncovered A/B demands.

### 5.3 Apply Coverage Modifiers
If a bench player covers an A-demand that the First XI leaves empty:
- Bench player's Off/Def weight gets +0.15 multiplier
If a bench player covers a B-demand: +0.08 multiplier
If no gap covered: no modifier.

## 6. Physical Environment Modifier (Soccer-Specific)

### 6.1 Purpose
Adjusts Team KR for physical mismatches that affect soccer outcomes disproportionately: aerial dominance (set pieces and crosses), pace in transition, stamina for pressing intensity.

### 6.2 Computation
For each position group (CB pair, CM pairing, FB pair, front 3):
- Aerial Score: average height of CBs/STs, weighted by aerial duel win % if available
- Pace Score: estimated speed of wide players and FBs (from tracking data or UNSCORED)
- Stamina Score: average minutes/match of midfield (pressing sustainability proxy)

Physical Environment Modifier = 0.0 (baseline) with adjustments:
- If Aerial Score is bottom-quartile at level: -1.0 to Team KR
- If Pace Score is bottom-quartile: -0.5 to Team KR
- If Stamina Score is bottom-quartile and system is High Press/Gegenpressing: -1.0 to Team KR

## 7. Final Normalization
After all weights computed, ensure all player-level contributions are normalized to sum correctly.

## 8. Team Offense KR
Team_Off_KR = Sum(Final_System_Off_KR_i x Off_Weight_i) for all included players

## 9. Team Defense KR
Team_Def_KR = Sum(Final_System_Def_KR_i x Def_Weight_i) for all included players

## 10. Overall Team KR (Level-Contextual Split)

The offense/defense split varies by level:

| Level | Offense Weight | Defense Weight |
|---|---|---|
| D1 HM / Top-5 Pro | 52% | 48% |
| D1 MM / Mid-Pro | 50% | 50% |
| D1 LM / Lower Pro | 48% | 52% |
| D2 / Championship | 47% | 53% |
| NAIA / D3 / Lower College | 45% | 55% |
| NJCAA / CCCAA | 44% | 56% |

Rationale: At lower levels, defensive organization and physicality have outsized impact. At higher levels, offensive quality differentiates more.

Overall_Team_KR = (Team_Off_KR x Off_Split) + (Team_Def_KR x Def_Split) + Physical_Modifier + Coverage_Modifier

## 11. Depth Handling
- First XI: primary rotation, heaviest weight
- Bench (positions 12-18): secondary rotation, lighter weight
- Extended Squad (19-25): emergency depth, minimal weight unless coverage modifier activates
- Youth (U21): not included unless minutes exceed threshold

## 12. Diagnostics Layer
After Team KR computation, produce:
- Offensive_Fit%: how well does the roster's archetype mix match the offensive system demands?
- Defensive_Fit%: same for defensive system
- Overall_Fit%: weighted blend
- Coverage Map: which demands are covered, by whom, at what weight
- Missing Demands: uncovered A/B/C demands with priority and consequence
- Fragility Flags: single-point failures, concentration, depth fragility
- System_Fit%: overall system compatibility score

---

# SYSTEM INFERENCE ENGINE -- OSIE + DSIE

## Purpose
Identifies what offensive and defensive systems a team actually runs, how confidently those systems can be inferred, and how system identity evolves across a season. Descriptive only.

## Own Team vs Opponent
Own team: Coach selects the system in Coach Context. OSIE/DSIE runs as diagnostic.
Opponents: OSIE/DSIE is the primary source. No coach input for opponents.

## OFFENSIVE SYSTEM INFERENCE ENGINE (OSIE)

### Classification Triggers (14 Offensive Systems)

#### 1) Possession / Build-Up
Primary: Possession% >= 55%, PPDA >= 12, progressive passes/90 >= 40 (team), build-up from GK >= 60%
Support: Short pass% >= 75%, field tilt >= 55%

#### 2) Direct / Long Ball
Primary: Long ball% >= 18%, average sequence length <= 3.5 passes, direct speed of attack >= 1.5 m/s
Support: Aerial duel frequency >= 25/match, target man usage evident

#### 3) Wing Play (Traditional Width)
Primary: Cross frequency >= 18/match, wide entries >= 40% of attacks, touchline-hugging heatmaps for wingers
Support: Overlap frequency >= 8/match, headed shot attempts >= 4/match

#### 4) Counter-Attack (Transition)
Primary: Fast attack% >= 25%, counter-attack xG >= 0.15/match, possession% <= 48%
Support: Direct speed of attack >= 2.0 m/s in transition, low build-up from back

#### 5) High Press / Gegenpressing
Primary: PPDA <= 8.0, high turnovers (opp half recoveries) >= 35/match, pressing intensity top quartile
Support: Counter-press success rate >= 35%, time to regain possession <= 5 sec (median)

#### 6) Tiki-Taka (Positional Play)
Primary: Possession% >= 60%, short pass% >= 82%, PPDA >= 10, positional rotations evident
Support: Build-up from GK >= 75%, pass completion >= 88%, field tilt >= 60%

#### 7) Inside Forward / Inverted Wing
Primary: Winger heatmap skews central, cut-inside frequency >= 5/match per winger, shots by wingers >= 3.0/match
Support: Fullback overlap frequency >= 6/match (providing width), inverted foot selection evident

#### 8) False 9 / Fluid Front
Primary: Striker drops deep >= 20% of possessions, through balls to runners >= 4/match, no fixed #9 in advanced position
Support: Midfielder late runs into box >= 3/match, striker assists >= 0.15/90

#### 9) Target Man / Route One
Primary: Long ball% >= 20%, aerial duel frequency >= 30/match, % of attacks through central striker >= 35%
Support: Second ball win rate high, direct play evident

#### 10) Overlap / Underlap Width
Primary: Fullback/WB advanced position frequency >= 40% of possession phases, overlap/underlap runs >= 10/match
Support: Wide overload creation, crossing from advanced FB positions >= 5/match

#### 11) Heliocentric (Single Creator)
Primary: Single player usage >= 35% of team xG+xA, team offensive structure collapses without that player
Support: Creator's progressive actions >= 2x next highest teammate

#### 12) Coach K
Hybrid: Multiple system indicators present without clear dominance. Coach-specific identity that blends elements.
Classification: requires manual tag or system mix output.

### System Confidence Bands
- >= 75%: Dominant system. Clear identity.
- 55-74%: Likely system. Some mixed signals.
- 35-54%: Ambiguous. System Mix mandatory.
- < 35%: Unclassified. Too little data or genuinely hybrid.

## DEFENSIVE SYSTEM INFERENCE ENGINE (DSIE)

### Classification Triggers (10 Defensive Systems)

#### 1) High Press (Aggressive)
Primary: PPDA <= 7.5, defensive actions in opp third >= 15/match, defensive line height >= 45m from own goal
Support: Pressing success rate >= 30%, high turnovers forced

#### 2) Mid-Block (Compact)
Primary: Defensive line height 30-42m, compactness (vertical distance between lines) <= 30m, PPDA 8-14
Support: Tackles in middle third highest zone, low defensive actions in opp third

#### 3) Low Block (Deep Defensive)
Primary: Defensive line height <= 30m, possession% <= 42%, PPDA >= 15, deep block evident
Support: Blocks/match >= 5, clearances/match >= 20, crosses conceded high but goals conceded from open play low

#### 4) Counter-Press (Gegenpressing)
Primary: Counter-press within 5 sec of loss >= 50% of turnovers, immediate recovery rate >= 35%
Support: PPDA low in 5 sec after loss even if overall PPDA is moderate

#### 5) Man-Marking (Individual)
Primary: Defensive assignments are player-to-player (visible from positioning data), individual duel frequency highest
Support: Defensive structure collapses when one player is beaten (no zonal cover)

#### 6) Zonal Marking (Positional)
Primary: Defenders maintain zones regardless of opponent movement, passing lane density high
Support: Set piece defending is zonal, positional discipline in heat maps

#### 7) Hybrid Press (Pressing Triggers)
Primary: Pressing is selective (triggered by specific passes, e.g., backward pass, GK distribution, switching play), not constant
Support: Variable PPDA within matches (low in trigger moments, moderate otherwise)

#### 8) Park the Bus (Ultra-Defensive)
Primary: 9+ players behind ball in defensive phase, possession% <= 35%, shots conceded high but xG conceded low (blocks/deflections)
Support: Counter-attack only offensive strategy

#### 9) Offside Trap (High Line)
Primary: Defensive line height >= 48m, offsides won >= 3/match, GK sweeping actions >= 1.0/match
Support: Requires sweeper keeper archetype, high recovery pace in CB pairing

#### 10) Coach K
Hybrid defensive identity. Requires manual classification or system mix.

---

# TEAM KR TIERS

Team KR Tiers are level-specific. Same Team KR means different things at different levels.

## Premier League Team KR Legend (lambda 1.000)

| Team KR | Tier Label | Reality |
|---|---|---|
| 94+ | Title Contender | Top 2-3. CL last-16 minimum. |
| 90-93 | CL Qualifier / Top 6 | Consistent CL/EL qualification. |
| 86-89 | Upper Mid-Table | 7th-10th. Europa/Conference range. |
| 82-85 | Mid-Table | 11th-14th. Stable PL existence. |
| 78-81 | Lower Mid-Table | 15th-17th. Flirting with relegation. |
| 74-77 | Relegation Battle | 18th-20th. Survival mode. |
| Below 74 | Relegated / Championship Level | Below PL standard. |

## NAIA Team KR Legend (lambda 0.810)

| Team KR | Tier Label | Reality |
|---|---|---|
| 84+ | National Tournament Contender | Top programs nationally. |
| 80-83 | Conference Champion Contender | Elite at conference level. |
| 76-79 | Upper Conference | Strong record. Postseason likely. |
| 72-75 | Mid-Conference | Competitive but not dominant. |
| 68-71 | Lower Conference | Developing program. |
| Below 68 | Rebuilding | Below competitive NAIA threshold. |

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

(Additional Team KR legends for La Liga, Bundesliga, Serie A, Ligue 1, D1 MM, D1 LM, D2, NCAA D3, NJCAA, MLS, Championship follow the same structure with level-appropriate adjustments.)

---

# SQUAD BUDGET ALLOCATION ENGINE

## Purpose
Distributes wage/scholarship budget optimally across position groups based on system demands and KR distribution.

## Position Group Value by System

Different systems place different value on position groups. The budget allocation should reflect where value concentrates.

| System | Most Valuable Position(s) | Budget Concentration |
|---|---|---|
| Tiki-Taka | CM, CDM, CB | Midfield + defense heavy |
| Gegenpressing | CM, ST, W | Midfield + attacking press |
| Counter-Attack | ST, W, CB | Forward pace + defensive solidity |
| Possession | CM, CDM, GK | Midfield control |
| Direct / Long Ball | ST, CB | Target + aerial defense |
| Inside Forward | W, FB, CM | Wide players + overlapping FBs |
| False 9 | ST/CAM, CM | Creative forwards + midfield |

## Allocation Framework (Pro)

| Position Group | Default % of Wage Bill | Notes |
|---|---|---|
| Goalkeeper | 6-8% | One starter, one backup. Low variance. |
| Centre-Backs (2-3) | 14-18% | Foundation. Invest in at least one elite CB. |
| Fullbacks/Wing-Backs (2-4) | 10-14% | System-dependent. Higher in overlap/WB systems. |
| Central Midfield (2-3) | 18-24% | Engine room. Highest variance by system. |
| Wide Players (2-3) | 14-20% | System-dependent. Higher in wing play/inside forward. |
| Strikers (1-2) | 16-22% | Highest individual salary concentration. |

## College Scholarship Equivalent
Same principle applied to scholarship allocation: higher-KR positions in the coach's system get larger scholarship shares. See Scholarship Allocation Framework in File 02 College Addendum.

---

# ROSTER DECISION INTELLIGENCE

## Squad Registration Rules (Pro - Key Leagues)

| League | Squad Size | Homegrown Requirement | U21 Exempt | Loan Limit |
|---|---|---|---|---|
| Premier League | 25 | 8 homegrown (trained in England 3 years before 21) | Yes - U21 not counted | 6 domestic loans out |
| La Liga | 25 | None formal, but non-EU limit of 3 | Yes | Varies |
| Bundesliga | 25 (18 matchday) | None formal | Yes - U23 for matchday | Varies |
| Serie A | 25 | 4 club-trained + 4 nation-trained | Yes - U22 | 6 loans out/in |
| Ligue 1 | 25 | None formal, but DNCG financial rules | Yes | Varies |
| MLS | 30 (senior roster) | None, but domestic player rules | Homegrown exempt | 6 loans out |

## Transfer Window Strategy

### Summer vs January Priorities
- Summer: structural changes, system-defining signings, youth integration
- January: emergency fixes, loan recalls, relegation/promotion push signings

### Sell-to-Buy Logic
When wage/fee budget is constrained:
1. Identify highest-value sellable asset (KR x age x contract x market demand)
2. Compute Team KR impact of selling (how much does Team KR drop)
3. Identify replacement targets at lower cost that maintain or improve Team KR
4. Net budget gain must exceed Team KR drop threshold

### Free Agent Market Timing
- Pre-season (July-Aug): highest quality, highest competition
- January window: emergency fills, loan market
- Post-deadline (Feb-May): free agents only, players out of contract June 30
- Pre-season (next cycle, Jan-March): early movers on expiring contracts

---

## GOVERNANCE NOTE
Team KR is produced by Nexus. No manual override of computed values. All weights, splits, and modifiers are versioned and locked. Changes require documentation and approval.
