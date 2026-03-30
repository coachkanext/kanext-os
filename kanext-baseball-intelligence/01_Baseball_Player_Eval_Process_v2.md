# BASEBALL PLAYER EVALUATION PROCESS
## File 01 -- v2.0 (Full Operational Spec)

---

# COACH CONTEXT SETUP

## COACH CONTEXT SETUP -- v1 (LOCKED)

### Purpose
Coach Context defines the binding environment for all downstream evaluation. No player evaluation, team evaluation, simulation, or scouting output can execute until Coach Context is locked.

### Required Fields
All required fields must be populated before evaluation proceeds. If any required field is missing, evaluation is blocked.

1. Program Name
2. Governing Body -- NCAA, NAIA, NJCAA, CCCAA, NWAC, USCAA, NCCAA
3. Division (if applicable) -- NCAA: D1/D2/D3, NJCAA: D1/D2/D3, NCCAA: D1/D2
4. Conference Class (required only if NCAA D1) -- Power, Mid-Major, Low-Major
5. Offensive System -- must match one of the 5 defined offensive systems: Launch Angle/Power, Contact/Speed, Balanced, Small Ball, OBP-Focused
6. Pitching Philosophy -- must match one of the 5 defined pitching philosophies: Strikeout-Dominant, Groundball-Dominant, Pitch-to-Contact, Bullpen-Heavy, Starter-Driven

These fields bind: KLVN normalization bands, KR legend interpretation, position trait weighting, system fit computation, system demand profiles, and confidence gate ranges.

### Optional Metadata
1. Conference -- non-blocking. Used by KLVN for D1 class auto-assignment.
2. Park Factor -- if home park has known run environment bias (e.g., elevation, dimensions)

### Optional Constraints (Downstream Only)
Do not alter trait scoring or KR computation. Consumed by downstream planning only.
1. Scholarships Available -- NCAA D1: 11.7 equivalencies max (often split 25-40 ways across 35-man roster). NCAA D2: 9.0. NAIA: varies (up to 12). NJCAA D1: 24. NCAA D3: 0 (no athletic scholarships).
2. Institutional / Merit Aid Capacity
3. Operating Budget
4. Recruiting Budget
5. Roster Size Target -- 35-man standard for college, 40-man for pro
6. Staffing Capacity Band -- Lean, Standard, Elite

### Context Lock
When all required fields (1-6) are populated and validated, system state transitions to Coach Context Locked. Cannot be modified mid-evaluation without restarting the pipeline.

### Governance
System names in fields 5 and 6 must exactly match the UI System Set. Governing body, division, and conference class must exactly match KLVN level keys.

---

# PLAYER PROFILE

## Hitter Profile (Auto-Populated Record)

### A) Identity
- Full legal name, known aliases
- Date of birth, age (derived)
- Height (current) + height history
- Weight (current) + weight history
- **Bats: L / R / S (switch)** -- BASEBALL-SPECIFIC
- **Throws: L / R** -- BASEBALL-SPECIFIC
- Declared position(s) (source-listed: C, 1B, 2B, 3B, SS, LF, CF, RF, DH, UTIL)
- City/Town of origin, state/province, country
- High school, travel ball program (e.g., East Coast Sox, Five Star National)
- Current team affiliation

### B) Career Record (Season-by-Season)
For each competitive season: team name, league/competition level, season/year, dates active, wood bat experience (Cape Cod, summer league, showcase)

### C) Raw On-Field Production -- HITTING (Season-by-Season)
- Games played, games started, at-bats, plate appearances
- Hits, doubles, triples, home runs, RBI, runs scored
- Walks (BB), intentional walks (IBB), strikeouts (K), hit by pitch (HBP)
- Sacrifice hits (SH), sacrifice flies (SF)
- Stolen bases (SB), caught stealing (CS), SB%
- Ground into double play (GIDP)
- Batting average (BA), on-base percentage (OBP), slugging percentage (SLG), OPS
- Isolated power (ISO = SLG - BA)
- Advanced (where available): wRC+, wOBA, BABIP, BB%, K%, hard hit %, exit velocity (avg/max), launch angle, barrel %, sprint speed

### D) Raw On-Field Production -- FIELDING (Season-by-Season)
- Position(s) played, games at each position, innings at each position
- Putouts (PO), assists (A), errors (E), fielding percentage (FPCT)
- Double plays turned (DP)
- Outfield assists (OF only)
- Catcher-specific: innings caught, passed balls, wild pitches allowed, caught stealing %, pop time (if available), framing data (if available)
- Advanced (where available): DRS, UZR, OAA, range factor

### E) Academic Record (Public/Declared Only)
GPA, academic honors, eligibility status, declared major

### F) Declared Medical Information (Public Only)
Declared injuries, DL stints, medical redshirt designations

### G) Source Attribution + Trust Metadata
Source for each element, verification status (verified / unverified), known coverage gaps

### Locked Exclusions
Never in Player Profile: evaluations/ratings/KRs, attributes, badges, archetypes, private medical/disciplinary, subjective recruiting opinions

---

## Pitcher Profile (Auto-Populated Record)

### A) Identity
Same as Hitter Profile identity fields, plus:
- **Throws: L / R** -- primary arm
- **Primary Role: SP (Starting Pitcher) / RP (Relief Pitcher) / CL (Closer)**

### B) Career Record
Same as Hitter Profile

### C) Raw On-Field Production -- PITCHING (Season-by-Season)
- Games (G), games started (GS), complete games (CG), shutouts (SHO)
- Wins (W), losses (L), saves (SV), holds (HLD), blown saves (BS)
- Innings pitched (IP), batters faced (BF)
- Hits allowed (H), runs (R), earned runs (ER), home runs allowed (HR)
- Walks (BB), intentional walks (IBB), strikeouts (K), hit batters (HBP)
- Wild pitches (WP), balks (BK)
- ERA, WHIP, K/9, BB/9, K/BB ratio, HR/9, opponent BA, opponent OBP
- Quality starts (QS), QS%
- Advanced (where available): FIP, xFIP, SIERA, stuff+, GB%, FB%, LD%, SwStr%, zone%, FPS%, pitch mix (FB%/SL%/CH%/CB%/CT%), average fastball velocity, max fastball velocity, spin rates by pitch type
- **Arsenal Description:** list of pitches thrown with grade (20-80 scale if available), usage %, and primary/secondary/show designation

### D) Fielding as Pitcher
Pitcher fielding: PO, A, E, FPCT. Pickoff attempts, pickoff success rate. Bunt defense grade.

### E-G) Same as Hitter Profile (Academic, Medical, Source Attribution, Locked Exclusions)

---

## Two-Way Player Protocol

### When It Activates
A player qualifies as a Two-Way candidate when BOTH of the following are true in the same season:
- Hitter: >= 50 AB (reduced threshold since playing time is split)
- Pitcher: >= 20 IP (SP) or >= 15 IP (RP)

### Execution
1. Run the FULL Hitter Pipeline (Phase 3 anchor -> Phase 6 components -> Final Hitter KR)
2. Run the FULL Pitcher Pipeline (Phase 3 anchor -> Phase 6 components -> Final Pitcher KR)
3. Compute Combined KR using contribution-weighted blend:

**Combined_KR = (Hitter_KR x Hitter_Weight) + (Pitcher_KR x Pitcher_Weight)**

Default weights:
- If primary role = position player who also pitches: 65% Hitter / 35% Pitcher
- If primary role = pitcher who also hits: 35% Hitter / 65% Pitcher
- If true 50/50 two-way (Ohtani model): 50% Hitter / 50% Pitcher

Adjust weights based on actual contribution split:
- Hitter_Weight = (PA / (PA + (BF x 0.75))) -- BF weighted at 0.75 to reflect that each batter faced has higher individual game impact than a single PA
- Pitcher_Weight = 1.0 - Hitter_Weight

4. Apply Two-Way Premium badge if BOTH Hitter KR >= 80 AND Pitcher KR >= 80 (per Badge Spec)
5. Output BOTH individual evaluations + Combined KR + individual component breakdowns

### Output Format
- Hitter identity card (full eval with all 5 hitter component KRs)
- Pitcher identity card (full eval with all 5 pitcher component KRs)
- Combined KR with weight disclosure
- Two-Way Premium badge status
- Level Tier Map using Combined KR

---

# PLAYER CONFIDENCE GATE

## PLAYER CONFIDENCE GATE -- v1 (LOCKED STRUCTURE, PROVISIONAL RANGES)

### Purpose
Confidence % communicates evidence completeness and stability. Answers: "how much should you trust this KR?"

### Output
confidence_pct in [0, 100]. Computed at end of evaluation. Does NOT change any KR math.

### Mode Auto-Detection
Nexus auto-detects:
- Box-score sources only -> Production-Based Mode
- TrackMan/Rapsodo present -> Enhanced Mode
- Statcast (pro level) -> Full Player KR Mode

### Minimum Sample Gates

**HITTERS:**
- Full evaluation: >= 100 AB (approximately 30+ games of regular play)
- Provisional evaluation (reduced confidence): 50-99 AB
- Below 50 AB: UNSCORED -- insufficient sample. No KR produced.
- Platoon splits: >= 50 PA vs each hand for valid split-based scoring. Below 50 PA: split data flagged as low-confidence.

**PITCHERS (Starters):**
- Full evaluation: >= 30 IP (approximately 5+ quality starts)
- Provisional evaluation: 15-29 IP
- Below 15 IP: UNSCORED -- insufficient sample.

**PITCHERS (Relievers/Closers):**
- Full evaluation: >= 20 IP (approximately 15+ appearances)
- Provisional evaluation: 10-19 IP
- Below 10 IP: UNSCORED -- insufficient sample.

**TWO-WAY PLAYERS:**
- Apply hitter minimum to hitting stats, pitcher minimum to pitching stats
- If one pipeline clears minimum but other doesn't: evaluate the qualifying pipeline only, flag the other as insufficient
- Combined KR requires both pipelines to clear at least provisional threshold

### Confidence Ranges (Provisional -- v1)

| Data Available | Hitter Confidence % | Pitcher Confidence % |
|---|---|---|
| Box-score single season (100+ AB / 30+ IP) | 50-62% | 42-55% |
| Box-score multi-year | 62-75% | 55-68% |
| Multi-level (JUCO->D1 transfer) | 65-78% | 58-72% |
| Box-score + wood bat showcase data | 68-80% | N/A |
| 1 year TrackMan + box-score | 75-85% | 70-82% |
| Multi-year TrackMan + box-score | 80-90% | 78-88% |
| Statcast (pro) full season | 85-94% | 82-92% |

### Baseball-Specific Confidence Notes
- Pitchers systematically have lower V1 confidence because VKR (velocity/stuff) and RKR (repertoire) are largely UNSCORED without TrackMan data. At V1, only CKR (from BB/9, WHIP) and DKR (from IP, QS%) are reliably scorable.
- Hitter HKR and PKR are well-served by box-score data (BA, HR, OPS directly measure hitting and power). FKR is moderate (fielding % is available but range metrics are not). SKR is moderate (SB data available but sprint speed is not). IQKR is weak at V1.
- 56-game college season produces smaller samples than basketball's 30+ games with high possession counts. Baseball's game-to-game variance is higher (a hitter can go 0-4 one game and 4-4 the next).
- Wood bat showcase data (Cape Cod League, summer leagues) carries special value for hitters because it removes the aluminum-bat inflation. If available, confidence_pct gets +5-8% bump.

---

# PLAYER EVALUATION ENGINE -- MASTER EXECUTION FLOW

## PLAYER EVALUATION ENGINE -- MASTER EXECUTION FLOW (LOCKED)

### Purpose
Defines the complete execution order for producing a player's Final System KR. Single source of truth.

### Architecture
Two blocks.
**Block 1** builds Base Truth -- system-agnostic identity.
**Block 2** applies System Context -- how player fits coach's selected systems.

---

## BLOCK 1 -- BASE TRUTH (System-Agnostic)

### Step 0: Coach Context Setup
Must pull from: Coach Context Setup. All 6 required fields locked. Binds: KLVN level key, KR legend selection, position weighting level.

### Step 0.5: Pipeline Routing
**CRITICAL BASEBALL STEP.** Route player to correct evaluation pipeline:
- Primary role = position player -> **HITTER PIPELINE**
- Primary role = pitcher -> **PITCHER PIPELINE**
- Significant production in both -> **TWO-WAY PROTOCOL** (run both, compute combined)

Routing is based on primary role designation + actual playing time data. If ambiguous, default to the role where more production exists (higher AB or higher IP).

### Step 1: Mode Auto-Detect
Must pull from: Player Confidence Gate. Box-score only -> Production-Based. TrackMan present -> Enhanced. Statcast -> Full.

### Step 2: Player Profile Build
Must pull from: Player Profile (Hitter or Pitcher template). Build factual record. No traits, no KRs, no evaluation.

### Step 3: Trait Scoring

**HITTER PIPELINE:**
Must pull from: Hitter Trait Library (5 clusters: Hitting, Plate Discipline/Power, Fielding, Speed/Baserunning, Baseball IQ).
Must pull from: KLVN (Level Normalization).
Score all hitter traits against active data layer. KLVN normalization applied to production inputs.
Output: Hitter trait scores (each 0-100 or null)

**PITCHER PIPELINE:**
Must pull from: Pitcher Trait Library (5 clusters: Velocity/Stuff, Command/Control, Durability, Repertoire, Pitching IQ).
Must pull from: KLVN (Level Normalization).
Score all pitcher traits. Note: at V1, VKR and RKR sub-traits are largely UNSCORED without TrackMan. CKR and DKR are scorable from box-score.
Output: Pitcher trait scores (each 0-100 or null)

### Step 4: Position Weighting + Base KR

**HITTER:**
Must pull from: Hitter Position Trait Weighting (10 positions x College/Pro: C, 1B, 2B, 3B, SS, LF, CF, RF, DH, UTIL).
Apply position-specific weights:
- HKR (Hitting KR) -- from Hitting cluster
- PKR (Plate Discipline/Power KR) -- from Power/Discipline cluster
- FKR (Fielding KR) -- from Fielding cluster
- SKR (Speed/Baserunning KR) -- from Speed cluster
- IQKR (Baseball IQ KR) -- from IQ cluster

UNSCORED traits contribute zero weight. Scored traits renormalize.
Base Player KR = (HKR x OPF_hit) + (PKR x OPF_power) + (FKR x OPF_field) + (SKR x OPF_speed) + (IQKR x OPF_iq)

**PITCHER:**
Must pull from: Pitcher Position Trait Weighting (3 roles x College/Pro: SP, RP, CP).
- VKR (Velocity/Stuff KR)
- CKR (Command/Control KR)
- DKR (Durability KR)
- RKR (Repertoire KR)
- IQKR (Pitching IQ KR)

Base Player KR = (VKR x OPF_velo) + (CKR x OPF_cmd) + (DKR x OPF_dur) + (RKR x OPF_rep) + (IQKR x OPF_iq)

Output: Base component KRs + Base Player KR

### Step 5: Badges
Must pull from: Hitter Badge Spec (17 badges) or Pitcher Badge Spec (13 badges).
Evaluate badge gates. Apply KR lift: Bronze +0.5, Silver +1.0, Gold +1.5. Cap: +3.5 KR.
Output: Badge list + post-badge Base Player KR

### Step 6: Archetype Assignment
Must pull from: Hitter Archetype Library (13 archetypes) or Pitcher Archetype Library (12 archetypes).
Evaluate gates. Primary: full gates. Secondary: floor relaxed by -5.
Archetypes are descriptive labels -- do not change KR.
Output: Primary archetype(s), secondary archetype(s)

### Step 7: Overrides
Must pull from: Overrides spec.
College: max 1 positive override. Pro: positives max 1, negatives always apply.
Output: Override applied (if any) + post-override Base Player KR

### Step 8: Impact Modifier Assignment
Must pull from: Impact Modifiers spec.
One modifier max per player (Hitter: Primary Offensive Engine / Secondary Engine / Force Multiplier / Specialist Anchor. Pitcher: Primary Staff Anchor / Bullpen Anchor / Innings Stabilizer / Matchup Weapon). Does not alter KR.
Output: Impact Modifier label

### Step 9: Base Truth Lock
Locked outputs (cannot change without pipeline restart):
- All trait scores (including UNSCORED flags)
- Position-weighted component KRs
- Base Player KR (post-badges, post-overrides)
- Badge list, archetype assignment(s), impact modifier label

This is the player's system-agnostic identity. Same regardless of offensive system or pitching philosophy.

---

## BLOCK 2 -- SYSTEM CONTEXT

### Step 10: System Fit

**HITTER:**
Load offensive system profile from Coach Context. Reweight internal trait distributions:
- Launch Angle/Power: PKR sub-traits weighted up (power, hard hit), HKR contact traits weighted down
- Contact/Speed: HKR contact traits and SKR weighted up, PKR power weighted down
- Balanced: neutral reweight
- Small Ball: HKR situational + SKR speed weighted up, PKR power weighted down
- OBP-Focused: PKR discipline traits weighted up, SKR de-emphasized

Compute: Final System Hitter KR

**PITCHER:**
Load pitching philosophy profile from Coach Context. Reweight:
- Strikeout-Dominant: VKR weighted up, CKR moderate
- Groundball-Dominant: CKR and movement traits weighted up, VKR velocity de-emphasized
- Pitch-to-Contact: CKR command weighted up, DKR efficiency weighted up, VKR de-emphasized
- Bullpen-Heavy: RP/CP weights applied (VKR up, DKR down)
- Starter-Driven: DKR durability and RKR times-through-order weighted up

Compute: Final System Pitcher KR

### Step 11: System Risks
Must pull from: System Risks spec.
Evaluate triggers against player data + system context.

**Hitter System Risks (12 total):**
- Tier 1 Major (4): Strikeout Liability, Defensive Black Hole, Baserunning Catastrophe, Complete Non-Factor
- Tier 2 Major (4): Power Void, Platoon Exposed, Speed Void (system-specific), Situational Failure
- Minor (4): Elevated K Rate, Limited Range, Slow Starter, One-Dimensional

**Pitcher System Risks (10 total):**
- Tier 1 Major (4): Walk Machine, Home Run Prone, Velocity Cliff, Injury Bomb
- Tier 2 Major (3): Third-Time-Through Collapse, Platoon Exploitable, Fastball Avoidance
- Minor (3): Elevated Walk Rate, Fly Ball Tendency, Inconsistency

Penalties: College Tier 1 = -2.0 KR, College Tier 2 = -1.5 KR, College Minor = -1.0 KR.
Pro Tier 1 = -4.0 KR, Pro Tier 2 = -2.5 KR, Pro Minor = -1.0 KR.

Output: System risk list + post-risk Final System Player KR

### Step 12: Finalization
Interpret Final System Player KR against level-appropriate legend (hitter track or pitcher track).
Compute confidence_pct from Confidence Gate.
Output: Final KR (locked), legend tier label, confidence_pct, full audit trail.

---

# CONTEXTUAL MODE

## CONTEXTUAL MODE -- BASEBALL v1 (LOCKED)

### Purpose
Produces an honest KR range for players without granular data. Pattern matching against legends, not formula. Same six-phase structure as basketball.

### When It Activates
1. Box-score data exists (meets minimum AB/IP thresholds)
2. No TrackMan/Rapsodo/Statcast data
3. Box-score trait pipeline has insufficient coverage for reliable KR

### Inputs -- Three Tiers

**Tier 1 -- Public Box-Score Data (Verified)**
Hitter: BA, OBP, SLG, HR, RBI, SB, BB, K, games, AB, fielding stats. Per-game lines with opponent identification.
Pitcher: W-L, ERA, IP, K, BB, H, HR, WHIP, saves/holds. Per-start/appearance lines with opponent identification.

**Tier 2 -- Public Advanced Metrics (Derived)**
Hitter: wRC+, wOBA, ISO, BABIP, BB%, K%, OPS+, OAA (if available).
Pitcher: FIP, xFIP, K/9, BB/9, K/BB, SIERA, GB%, HR/9, LOB%.

**Tier 3 -- Contextual Intelligence**
- Roster context (lineup quality, pitching staff quality)
- Defensive attention (is hitter pitched around? IBB count?)
- Role suppression (closer used in low leverage, hitter batting 8th despite quality)
- Park factor (Coors, Oracle, aluminum bat environment)
- Coach direct knowledge, prospect pedigree (Perfect Game, PBR, Baseball America, MLB Pipeline ranking)
- Wood bat showcase data (Cape Cod, Northwoods, summer league stats)

Trust hierarchy: Tier 1 > Tier 2 > Tier 3.

### Process -- Six Phases

**Phase 1 -- Data Inventory.** Catalog all data by source, level, game count, completeness. Flag incomplete box-score data.

**Phase 2 -- Level-Segmented Stat Compilation.** Per-game averages segmented by competition level. NEVER blend across levels. Include wood bat vs aluminum split if available.

**Phase 3 -- Legend Anchor Mapping.** Map production profile against the APPROPRIATE TRACK (hitter or pitcher) of the KR Legend at player's level. Pattern match against tier descriptions. Produce raw KR range.

**Phase 4 -- Trait Confirmation Layer.** Four statuses per trait:
- CONFIRMED: directly scorable from data
- INFERRED: data + context strongly suggests a level
- SUPPRESSED: evidence trait exists higher than data shows (see Suppression Detection)
- UNSCORED: no data supports estimate

**Phase 5 -- Archetype + Badge + Override + System Risk Feasibility.** Assess which would likely apply if full pipeline ran.

**Phase 6 -- KR Range Synthesis.** Estimate component KRs, apply OPF, produce final range with "What We Know / What We Don't Know / What Changes If" sections.

---

# SUPPRESSION DETECTION RULES -- BASEBALL

## Hitter Suppression Indicators

**1. Lineup Spot Suppression**
Trigger: Hitter with KR suggesting middle-of-order production is batting 7th, 8th, or 9th due to seniority-based lineup construction, position (catcher often bats low), or coach preference.
Impact: RBI opportunity is artificially reduced. Runs scored may be suppressed. BA and OPS are not directly affected but situational stats (RISP, clutch) are depressed by fewer high-leverage PAs.
Detection: Compare player's offensive component KRs to their lineup position. If HKR + PKR combined suggests top-4 lineup spot but player bats bottom-3, flag suppression.

**2. Platoon Suppression**
Trigger: Player only faces one handedness (e.g., lefty specialist pinch-hitter only used vs RHP). Sample size is artificially small and skewed.
Impact: Overall stats mask true ability vs favorable hand. Stats vs unfavorable hand are nonexistent or tiny sample.
Detection: PA vs LHP < 25% of total PA (for RHB) or PA vs RHP < 25% (for LHB). Flag low-sample platoon.

**3. Park Factor Suppression**
Trigger: Player plays 50%+ of games in extreme pitcher-friendly environment (Oracle Park, Safeco/T-Mobile, marine-layer coastal parks, or D1 park with deep dimensions and minimal wind).
Impact: Raw HR, SLG, and ISO understate true power. BA may be slightly suppressed.
Detection: Home park run factor < 0.92. Apply park-adjusted stats for trait scoring.

**4. Park Factor Inflation (Inverse Suppression)**
Trigger: Player plays 50%+ of games in extreme hitter-friendly environment (Coors Field, high-altitude parks, bandbox college parks).
Impact: Raw BA, HR, SLG overstate true ability.
Detection: Home park run factor > 1.08. Apply park-adjusted stats. Coors correction is the most significant (run factor ~1.15).

**5. Aluminum Bat Inflation**
Trigger: All college players use BBCOR aluminum bats. This is universal, not player-specific.
Impact: BA inflated ~.020-.030, SLG inflated ~.050-.080, HR inflated ~20-30% vs wood bats.
Detection: If player has wood bat data (Cape Cod, summer league), compare aluminum vs wood stats. The wood bat stats are closer to pro-translation truth. If no wood bat data exists, note aluminum inflation in evaluation with standard adjustment range.

**6. Lineup Protection Void**
Trigger: Hitter has no quality bats protecting them in lineup. Opponents pitch around the hitter intentionally. IBB count elevated. Walk rate inflated but not from plate discipline -- from pitcher avoidance.
Impact: OBP inflated by non-competitive walks. BA may be suppressed (hitters see fewer hittable pitches). HR may be suppressed (fewer fastballs in zone).
Detection: IBB >= 8 in a season, OR BB% > 18% with sub-.300 BA (suggests pitching around, not discipline), OR next-lineup-spot hitter has OPS < .600.

## Pitcher Suppression Indicators

**7. Run Support Suppression**
Trigger: Quality pitcher on team that scores few runs. W-L record is poor despite strong underlying metrics.
Impact: W-L dramatically understates pitcher quality. ERA may be slightly inflated from pressing in close games with no margin for error.
Detection: Team runs scored per game < 3.5 AND pitcher FIP < ERA by >= 0.50. The FIP-ERA gap reveals that the pitcher is better than their ERA shows due to defense/luck/support.

**8. Role Suppression (Pitcher)**
Trigger: Pitcher with starter-quality stuff used exclusively in relief or mop-up due to roster depth, arm slot concerns, or coaching preference. VKR and RKR traits exist at higher level than role allows demonstration.
Impact: IP artificially limited. K/9 and ERA may look good but sample is small and against lesser lineup spots.
Detection: VKR traits (velocity, stuff quality) suggest SP capability but player has 0 starts. Or: player has < 40 IP despite being healthy all season and having SP-quality arsenal.

**9. Innings Limit Suppression**
Trigger: Pitcher's IP capped by coaching decision (protecting arm for draft, limiting workload for freshman, postseason management). Low IP ≠ low durability.
Impact: DKR (durability) artificially penalized by low IP count that doesn't reflect ability to pitch deep.
Detection: Pitcher is healthy, available, and effective (ERA < team average) but IP/start averages decline as season progresses, or pitcher is shut down pre-postseason. Coach confirmation of innings limit is Tier 3 evidence.

**10. Defense Suppression (Pitcher)**
Trigger: Quality pitcher behind a poor defensive team. Errors and misplays inflate ERA.
Impact: ERA overstates pitcher's actual quality. BABIP may be inflated. FIP and xFIP are more accurate.
Detection: Team defensive efficiency below .680 AND pitcher's FIP < ERA by >= 0.70.

---

# MULTI-LEVEL PLAYER PROTOCOL

## When It Applies
Player competes across multiple governing body levels in a single career or season (e.g., JUCO to D1 transfer, D3 to D2, NAIA to D1 Mid-Major).

## Execution
1. Each level's data evaluated separately through Phases 1-3, producing level-specific stat lines and raw KR ranges
2. The HIGHEST-LEVEL data carries the most interpretive weight for KR estimation
3. Lower-level data CONFIRMS capabilities that higher-level data cannot show due to suppression or small sample
4. Cross-level stat divergence is a signal -- when stats diverge 40%+ between levels, it indicates context suppression at the higher level
5. Final KR anchored to the highest level with meaningful data, lower-level data fills gaps
6. KLVN lambdas applied when translating final KR to legends for Level Tier Map

### Baseball-Specific Multi-Level Notes
- JUCO-to-D1 transfer is the most common multi-level path in college baseball
- Aluminum bat is universal across college levels, so bat transition is not a factor in college-to-college moves
- Competition quality jump from JUCO to D1 Power is significant (lambda 0.780 -> 1.000) -- production drops of 30-40% are normal and do NOT indicate the player got worse
- Pitching velocity and stuff quality should be consistent across levels (velocity doesn't change because the league changed). Command and results may shift but stuff is stuff.

---

# V1 EVALUATION PROTOCOL -- BASEBALL v1.0

## Purpose
Defines how the pipeline operates at V1 data tier (box score + advanced composites). Combines production-based anchoring (Phase 3) with component KR math (Phase 6).

## Data Available at V1

**HITTERS:** G, AB, PA, H, 2B, 3B, HR, RBI, R, BB, K, HBP, SB, CS, BA, OBP, SLG, OPS, ISO. Advanced (derived): wRC+, wOBA, BABIP, BB%, K%. Fielding: PO, A, E, FPCT, DP. Catcher: CS%, PB.

**PITCHERS:** G, GS, W, L, SV, HLD, IP, H, R, ER, HR, BB, K, ERA, WHIP, K/9, BB/9, K/BB, opponent BA. Advanced (derived): FIP, xFIP, GB% (if available), QS, QS%.

**NOT available at V1 (requires TrackMan/Statcast):** Exit velocity, barrel rate, launch angle, sprint speed, spin rates, pitch movement, pitch-level data, zone%, chase rate, whiff rates by pitch, framing data.

## THE FIVE STEPS

### STEP 1: COACH CONTEXT
Set program, level, governing body, division, conference class, offensive system, pitching philosophy. Same as standard pipeline Step 0.

### STEP 2: PHASE 3 -- PRODUCTION ANCHOR

**HITTER ANCHOR:** Map full production profile against HITTER TRACK of KR Legend at player's level. Key inputs: BA, OBP, SLG, OPS, HR, RBI, SB, wRC+ (if available), fielding position and quality, awards, team success. Pattern match to legend tier.

Example: A D1 Power hitter with .325/.410/.560, 15 HR, 55 RBI, 10 SB, All-Conference First Team on a Regional team maps to 92-94 tier ("All-American Caliber / Conference Best"). Anchor: 92-94.

**PITCHER ANCHOR:** Map full production profile against PITCHER TRACK of KR Legend. Key inputs: ERA, WHIP, K/9, BB/9, K/BB, IP, W-L, FIP, QS%, awards, team success.

Example: A D1 Power SP with 2.60 ERA, 11.0 K/9, 1.02 WHIP, 95 IP, 10-2, All-American candidate maps to 92-94 tier. Anchor: 92-94.

### STEP 3: PHASE 6 -- COMPONENT KR MATH

**HITTER COMPONENT KRs at V1:**
- HKR: Score from BA, K%, BABIP (if available), contact rate proxies. Moderate confidence.
- PKR: Score from HR, ISO, SLG, BB%, OPS, wRC+ (if available). Moderate-to-high confidence.
- FKR: Score from FPCT, assists, errors, range factor proxy, DP (IF), CS% (C). Moderate confidence for infielders/catchers, low for outfielders (range data missing).
- SKR: Score from SB, SB%, CS. Low-to-moderate confidence (sprint speed missing).
- IQKR: Score from RISP performance, productive outs, baserunning decisions (CS rate), GIDP rate. Low confidence -- most IQ traits require film.

**PITCHER COMPONENT KRs at V1:**
- VKR: LARGELY UNSCORED. Proxy: K/9 as weak stuff indicator (high K rates suggest good stuff but don't confirm velocity or movement). Confidence: 25-35%.
- CKR: Score from BB/9, WHIP, K/BB, FPS% (if available). Moderate-to-high confidence.
- DKR: Score from IP, GS, QS%, CG, health history. High confidence.
- RKR: LARGELY UNSCORED. Proxy: platoon splits (if sample sufficient) suggest arsenal diversity. Confidence: 20-30%.
- IQKR: Score from LOB%, situational ERA, GIDP induced, HBP rate (inverse). Low confidence.

Apply position-specific OPF. Produce Phase 6 Raw output.

### STEP 4: PHASE 6 ADJUSTS WITHIN PHASE 3 +/- 10

Phase 3 anchor range expanded by 10 in either direction = allowable window. Phase 6 tells direction:
- If Phase 6 components confirm the production anchor: Final KR at or above midpoint
- If Phase 6 reveals hidden weaknesses (e.g., fielding is poor, speed is nonexistent): Final KR pushed toward bottom of window
- If Phase 6 reveals hidden strengths (e.g., elite discipline behind moderate BA): Final KR pushed toward top

### STEP 5: FINAL KR

Adjusted number = V1 KR. Confidence capped by trait coverage:

| Data Tier | Hitter Confidence Cap | Pitcher Confidence Cap |
|---|---|---|
| V3 (Statcast multi-year) | 85-95% | 82-92% |
| V2 (TrackMan single season) | 75-85% | 70-82% |
| V1+ (box score + partial TrackMan) | 62-75% | 55-70% |
| V1 (box score multi-year) | 55-68% | 48-62% |
| V1 (box score single season) | 45-58% | 38-52% |

Output: Final KR, KR Range, Confidence %, Phase 3 anchor (transparency), Phase 6 raw (transparency), component KRs with per-component confidence, key strengths/weaknesses, legend tier label (hitter or pitcher track), Level Tier Map.

## KR IS UNIVERSAL
KLVN normalizes INPUTS, not OUTPUTS. One player, one KR, multiple legend reads.

## DATA TIER PROGRESSION

| Data Tier | Phase 3 Authority | Phase 6 Authority |
|---|---|---|
| V1 (box score) | Primary -- anchors range | Secondary -- adjusts within range |
| V1+ (partial TrackMan) | Shared | Shared |
| V2 (full TrackMan 1 season) | Secondary -- validation | Primary -- drives KR |
| V3 (multi-year TrackMan/Statcast) | Minimal -- sanity check | Full authority |

At V1, Phase 3 (legend anchor) is truth. Phase 6 (component math) is confirmation. The legend anchor is truth. The math is confirmation. Not the other way around.

## Governance
- V1 Protocol supplements standard pipeline
- When data tier upgrades, V1 output is superseded
- All V1 outputs flagged as V1_EVALUATION with confidence cap
- Phase 3 anchor logged alongside Phase 6 raw for audit
