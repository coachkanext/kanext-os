Team KR Eval Order

Team KR — MATH, PIPELINE &
DIAGNOSTICS
0. Scope
This is the single authoritative document for Team KR computation. It replaces:
● Team KR Math & Weights
● Team KR — Eval Order
Team KR is the rotation-weighted aggregation of players' Final System KRs under the selected
Program Context, with system-role weighting, usage-informed offensive weights, physical
environment adjustment, and level-contextual offense/defense splits.
Team KR does not evaluate players. It consumes finalized player outputs from upstream.
1. Inputs (Non-Negotiable)
Team KR consumes only:
Per player in rotation:
● Final_System_Offense_KR_i (from Player System Fit layer)
● Final_System_Def_KR_i (from Player System Fit layer)
● Minutes played (official game logs or coach-entered)
● Usage% (actual from Synergy/PlayVision, estimated from box score, or unavailable)
● Offensive archetype demand tier (A/B/C/No-match) for selected offensive system
● Defensive archetype demand tier (A/B/C/No-match) for selected defensive system
● Matchup assignment data (if available from Synergy/PlayVision)
● Height (inches), Weight (lbs), Wingspan (inches, if available)
● Position group (PG, SG, SF, PF, C)
Per program (from Coach Context Setup):
● Governing Body / Division (and Major Class if NCAA D1)
● Offensive System + Defensive System (validated against UI System Set — 12 offense,
10 defense)
● Competitive level (from locked level list — 13 college levels)

Explicit exclusions (locked):
● No archetype recomputation
● No badge/label recomputation
● No trait recomputation
● No system-fit inference (already baked into Final System KR upstream)
● No injury/fatigue/foul trouble modeling
2. Participation Threshold
Rotation-only model. No starter/bench labels.
● MIN_PARTICIPATION = 0.05 (5% of total minutes)
● Include player i in Team KR math iff minutes_share_i ≥ MIN_PARTICIPATION
● Exclude all players below threshold from all Team KR calculations
● Evaluation window is the selected window (default: season-to-date)
3. Offensive Weight Per Player
Offensive weight determines how much each player's Final_System_Offense_KR pulls on Team
Offense KR. Three independent signals are blended based on data availability.
Three inputs:
● Usage% — who the offense runs through (50% of weight when available)
● Minutes% — who is on the court (25% of weight, or 75% when usage unavailable)
● System Role — how critical is this player's archetype to the selected offensive system
(25% of weight)
3.1 Data Tier Formulas
Tier 1 — Full data (Synergy/PlayVision tracked usage):
Off_Weight_Raw_i = (Usage%_i × 0.50) + (Minutes%_i × 0.25) + (Off_Role_Score_i × 0.25)
Tier 2 — Mid data (box score available, no film):
Off_Weight_Raw_i = (Est_Usage%_i × 0.50) + (Minutes%_i × 0.25) + (Off_Role_Score_i ×
0.25)

Where Est_Usage = (FGA + 0.44 × FTA + TOV) / (Team_FGA + 0.44 × Team_FTA +
Team_TOV)
Tier 3 — Low data (minutes only):
Off_Weight_Raw_i = (Minutes%_i × 0.75) + (Off_Role_Score_i × 0.25)
3.2 System Role Multipliers (Locked, Flat)
The Off_Role_Score_i is derived from the player's offensive archetype mapped against the
selected offensive system's demand profile:
Demand Tier Multiplier
A (Critical) 1.20
B (High) 1.00
C (Optional) 0.85
No match 0.70
Multipliers are flat. They do not scale with usage — usage already captures volume
independently. Scaling with usage would double-count.
3.3 Normalization
After computing Off_Weight_Raw for all included players:
Off_Weight_i = Off_Weight_Raw_i / Σ Off_Weight_Raw
All offensive weights sum to 1.0.
4. Defensive Weight Per Player
Defensive weight determines how much each player's Final_System_Def_KR pulls on Team
Defense KR. Two or three inputs are blended based on data availability.
Three inputs (when matchup data exists):
● Minutes% — defensive presence is about being on the court (50% of weight)
● System Role — how critical is this player's archetype to the selected defensive system
(40% of weight)
● Matchup Assignment — who are they guarding? (10% of weight)

Two inputs (no matchup data):
● Minutes% — 60% of weight
● System Role — 40% of weight
4.1 Data Tier Formulas
Tier 1 — Full data (Synergy/PlayVision matchup tracking available):
Def_Weight_Raw_i = (Minutes%_i × 0.50) + (Def_Role_Score_i × 0.40) +
(Matchup_Importance_i × 0.10)
Tier 2 — No matchup data:
Def_Weight_Raw_i = (Minutes%_i × 0.60) + (Def_Role_Score_i × 0.40)
Note: System Role stays at 40% in both tiers. The scheme's structural importance does not
change based on data availability. Only minutes and matchup trade off against each other.
4.2 System Role Multipliers
Same as offense: A = 1.20, B = 1.00, C = 0.85, No match = 0.70. Applied to the defensive
archetype mapped against the selected defensive system's demand profile.
4.3 Matchup Importance Score
Activates only when Synergy/PlayVision matchup tracking data is available.
Computation:
Step 1 — For each game in the evaluation window, rank opponent players by offensive
usage/production (offensive threat level). Opponent's #1 offensive option = hardest matchup.
Step 2 — For each of our rotation players, compute Assignment_Difficulty_i = weighted average
of (opponent player threat rank × possessions defended against them) across the evaluation
window.
Step 3 — Normalize across rotation so Assignment_Difficulty scores sum to 1.0. This becomes
Matchup_Importance_i.
What it captures: A player taking harder assignments than their archetype suggests gets a
defensive weight bump. A player hiding on the weakest perimeter player gets a reduction.
What it ignores: Defensive performance (PPP allowed, contest rates). Player quality is already
in the Final System Def KR. Matchup Importance captures deployment, not results.

4.4 Normalization
After computing Def_Weight_Raw for all included players:
Def_Weight_i = Def_Weight_Raw_i / Σ Def_Weight_Raw
All defensive weights sum to 1.0.
5. Coverage Modifier (Bench Adjustment)
The coverage modifier adjusts player weights based on whether bench players fill system
demands that the top rotation leaves uncovered.
5.1 Identify Top-5 and Bench
● Top 5 = five players with highest minutes share
● Bench = all other included players (above 5% threshold)
5.2 Map Gaps
Using the System Demand Profiles for the selected offensive and defensive systems:
● Map each A/B/C demand to the top-5 players' archetypes
● Identify uncovered demands (no top-5 player fills them)
5.3 Apply Coverage Modifiers to Bench Players
Bench Player Fills... Weight Bonus (applied to raw weight before
normalization)
An uncovered A (Critical) +0.10
demand
An uncovered B (High) demand +0.05
An uncovered C (Optional) +0.00
demand
No uncovered demand −0.03
(redundant)
Rules:
● Only one coverage bonus per player (highest applicable)

● Modifier applies to the side where the gap exists (offense, defense, or both)
● Redundant = player's archetype duplicates a top-5 player without filling any new demand
● Re-normalize all weights after coverage modifiers so sums remain 1.0
● Coverage modifiers apply after Steps 3 and 4, before Step 6
6. Physical Environment Modifier
The Physical Environment Modifier captures how much a player's size-dependent traits are
amplified or suppressed relative to the physical profile of the competitive level they're playing at.
This modifier does NOT change Player KR. Player KR is locked truth. This modifier adjusts the
player's WEIGHT in the Team KR computation to reflect how much impact their physical traits
produce at this specific level.
6.1 Why This Exists
A 7'1" 275 center has the same Player KR whether he plays at NAIA or D1 High-Major. But his
impact on Team KR is different:
● At NAIA (avg C: 6'7" 225), his rim protection, rebounding, and finishing are amplified by
the physical mismatch.
● At D1 HM (avg C: 6'10" 245), his traits produce expected impact — no amplification.
Without this modifier, Team KR underestimates teams with significant physical advantages and
overestimates teams with physical disadvantages relative to their level.
6.2 Level Physical Profile Reference
Preloaded reference data. Calibrated from actual roster data as the Global Database grows.
Level Avg PG Avg SG Avg SF Avg PF Avg C
D1 HM 6'2" 190 6'5" 205 6'7" 215 6'8" 230 6'10" 245
D1 MM 6'1" 185 6'4" 200 6'6" 210 6'7" 225 6'9" 235
D1 LM 6'0" 180 6'3" 195 6'5" 205 6'7" 220 6'8" 230
D2 6'0" 178 6'3" 192 6'5" 202 6'6" 218 6'8" 228
D3 6'0" 178 6'2" 190 6'4" 200 6'6" 215 6'8" 225
NAIA 5'11" 175 6'2" 188 6'4" 198 6'6" 212 6'7" 225

NJCAA D1 6'1" 182 6'3" 195 6'5" 205 6'7" 220 6'8" 230
NJCAA D2 5'11" 175 6'2" 188 6'4" 198 6'5" 210 6'7" 222
NJCAA D3 5'10" 172 6'1" 185 6'3" 195 6'5" 208 6'6" 218
CCCAA 6'0" 178 6'2" 190 6'4" 200 6'6" 215 6'7" 222
USCAA 5'10" 170 6'1" 183 6'3" 193 6'5" 205 6'6" 215
NCCAA D1 5'11" 175 6'2" 188 6'4" 198 6'5" 210 6'7" 222
NCCAA D2 5'10" 172 6'1" 185 6'3" 195 6'4" 205 6'6" 215
6.3 Size-Dependent Trait Ratio by Position
Not all traits benefit from size. The percentage of a position's impact that comes from
size-dependent traits:
Positio Size-Dep Offense % Size-Dep Defense
n %
PG 10% 15%
SG 15% 20%
SF 20% 25%
PF 30% 35%
C 40% 45%
Size-dependent traits: Finishing at rim, screen setting, post scoring, rebounding, roll finishing,
rim protection, shot blocking, post defense, contest rate, deterrence.
Non-size-dependent traits (NOT modified): Shooting, ball handling, passing, decision-making,
basketball IQ, lateral quickness, help positioning, communication.
6.4 Computation
Step 1: Physical Delta per player
Height_Delta_i = Player_Height_inches − Level_Avg_Height_at_Position (in inches)
Weight_Delta_i = Player_Weight_lbs − Level_Avg_Weight_at_Position (in lbs)
Step 2: Physical Environment Modifier per player

Physical_Env_Mod_i = 1.0 + (Height_Delta_inches × 0.008) + (Weight_Delta_lbs × 0.001)
Bounded: minimum 0.92, maximum 1.12.
Step 3: Apply to weights
For offense: Off_Weight_Adjusted_i = Off_Weight_i × (1.0 + (Physical_Env_Mod_i − 1.0) ×
Size_Dep_Off_Pct)
For defense: Def_Weight_Adjusted_i = Def_Weight_i × (1.0 + (Physical_Env_Mod_i − 1.0) ×
Size_Dep_Def_Pct)
Step 4: Re-normalize all offensive and defensive weights to sum to 1.0.
6.5 Cross-Level Matchup Rule
When Team A plays an opponent at a DIFFERENT competitive level:
● Physical Environment Modifier is recomputed against the OPPONENT'S level averages
● This means a team's Team KR is different in their NAIA games vs their D1 games
● The physical advantage is larger against NAIA and smaller against D1
● Team KR reflects the reality of each specific matchup
In simulation, when computing a cross-level game, both teams' Physical Environment Modifiers
are computed independently against the opposing team's level averages.
6.6 Rules (Locked)
● Does NOT change Player KR. Player KR is locked truth.
● Adjusts WEIGHTS only, not KR values.
● Bounded: 0.92 to 1.12 per player.
● Level averages are preloaded, calibrated from roster data, updated annually.
● Applies AFTER Coverage Modifier (Step 5), BEFORE final normalization (Step 7).
● Position-level Size-Dependent Trait % is fixed. Does not vary by system or archetype.
7. Final Normalization
After Steps 3–6 (offensive weights, defensive weights, coverage modifier, physical environment
modifier):
Re-normalize all offensive weights so Σ Off_Weight_i = 1.0.
Re-normalize all defensive weights so Σ Def_Weight_i = 1.0.

8. Team Offense KR
Team_Off_KR = Σ (Final_System_Off_KR_i × Off_Weight_i)
Where Off_Weight_i includes usage, minutes, system role, coverage modifier, and physical
environment modifier contributions, fully normalized.
Interpretation: reflects the offense you can run in your selected offensive system, weighted by
who the offense actually runs through, how critical each player is to the scheme, and how much
their physical profile amplifies their offensive impact at this level.
9. Team Defense KR
Team_Def_KR = Σ (Final_System_Def_KR_i × Def_Weight_i)
Where Def_Weight_i includes minutes, system role, matchup importance (if available), coverage
modifier, and physical environment modifier contributions, fully normalized.
Interpretation: reflects the defense you can sustain in your selected defensive system, weighted
by who the scheme depends on, who takes the hardest assignments, and how much their
physical profile amplifies their defensive impact at this level.
10. Overall Team KR (Level-Contextual Split)
Team_KR = (Team_Off_KR × Off_Pct) + (Team_Def_KR × Def_Pct)
The offense/defense split varies by level. At higher levels, offensive talent separates teams. At
lower levels, defense, structure, and rebounding become the primary differentiators.
Level Off% Def%
D1 High-Major 55 45
D1 Mid-Major 52 48
D1 Low-Major 48 52
NCAA D2 47 53

NCAA D3 46 54
NAIA 49 51
NJCAA D1 52 48
NJCAA D2 47 53
NJCAA D3 45 55
CCCAA 51 49
USCAA 45 55
NCCAA D1 48 52
NCCAA D2 45 55
Empirical basis (D1 HM): KenPom research shows offense has 64% control over points per
possession outcomes. NCAA.com nine-year analysis found offensive rating approximately 50%
more important than defensive rating for NCAA tournament success. Average national
champion ranks ~21st in offense, ~42nd in defense. 23 of 24 recent champions were top 21 in
adjusted offensive efficiency.
Lower levels: No equivalent empirical research exists. Splits are derived from basketball logic:
as you descend in level, elite offensive creators become scarcer, rosters are thinner, and games
are won by defensive structure, rebounding, and not beating yourself. The pattern follows the
established direction at the top.
11. Depth Handling
Depth is not a separate variable. It emerges deterministically:
● Deeper teams distribute weight across more playable contributors
● Shallow teams concentrate weight into fewer players
● The coverage modifier rewards bench players who fill structural gaps
● The physical environment modifier amplifies depth advantages at levels where physical
mismatches are larger
No artificial depth bonus or penalty exists. Injuries, fatigue, and foul trouble are not modeled in
Team KR math.

12. Diagnostics Layer
Diagnostics execute after Team KR is computed. They do not change any Team KR value. They
provide coach-facing explanation and actionable intelligence.
12.1 System Fit % (Three Outputs)
Answers: "How well does your roster fit the system you selected?"
Computation:
For the selected system (offense and defense separately), load the demand profile. For each
demand:
● Covered = a rotation player's archetype matches this demand
● Coverage_Score = 1.0 if covered by a top-5 player, 0.7 if covered by bench only, 0.0 if
uncovered
Demand priority weights:
● A (Critical) = 3x
● B (High) = 2x
● C (Optional) = 1x
Offensive_Fit% = Σ (Demand_Priority_Weight × Coverage_Score) / Max_Possible_Score × 100
Defensive_Fit% = same logic for defensive system.
Overall_Fit% = (Offensive_Fit% × Level_Off_Pct) + (Defensive_Fit% × Level_Def_Pct)
Using the same level-contextual split from Section 10.
Interpretation:
● 90–100% = roster is built for this system
● 75–89% = good fit, minor gaps
● 60–74% = functional but has real holes
● Below 60% = system mismatch
Rule: Fit% does not modify Team KR. A coach can use Fit% to decide whether to change
systems — which would trigger a re-evaluation of all Final System KRs upstream, producing a
different Team KR on the next computation.
12.2 Coverage Map
Answers: "Which system demands are covered, by whom, and how heavily?"

A table mapping each demand from both the offensive and defensive system profiles to the
rotation player(s) covering it, their participation weight, and coverage status (Covered /
Bench-Only / Uncovered).
Display object. Does not modify Team KR.
12.3 Missing Demands
Answers: "What does your roster NOT have that your system needs?"
Pulled from the Coverage Map. Two categories:
● Uncovered: no rotation player fills this demand
● Under-covered: demand filled only by a bench player with less than 8% participation
weight (fragile — one injury and it's gone)
Each missing demand includes priority level (A/B/C) and a plain-language basketball
consequence pulled from the "Critical-missing risk" notes in System Demand Profiles.
Display object. Does not modify Team KR.
12.4 Fragility Flags
Answers: "Where is your team one injury away from breaking?"
Condition Flag
An A-tier demand covered by only ONE Single-Point Failure — system identity breaks if
rotation player this player is out
A player carries >25% of total offensive Offensive Concentration — offense is heavily
weight dependent on one player
A player carries >25% of total defensive Defensive Concentration — defense disappears
weight when this player sits
Top 5 players carry >85% of combined Depth Fragility — bench provides minimal
weight (offense or defense) marginal value
Two or more A-tier demands covered by Role Overload — no single player can sustain
the same player both at full capacity over a season
Fragility flags are informational. They do not change Team KR. They compound — a team with
3+ flags is structurally fragile regardless of the Team KR number.
12.5 Physical Environment Summary

Answers: "How much does your team's physical profile amplify or suppress impact at this
level?"
Display object showing:
● Per-player physical delta vs level average at their position
● Per-player Physical Environment Modifier value
● Team-level net physical advantage (average modifier across rotation, weighted by
minutes)
● Positions with the largest advantage (e.g., "Center position: +6 inches, +50 lbs over level
average — largest physical mismatch on roster")
Does not modify Team KR (already applied in Step 6). Provides coach-facing transparency on
WHERE the physical advantage exists.
13. Level Interpretation
MUST PULL FROM: Team KR Legend
Using the locked level environment from Coach Context Setup:
● Translate Overall_Team_KR → tier label from Team KR Legend
● Output: "At [Level], this Team KR of [value] = [Tier Label]."
14. Team Confidence Gate (Final Stamp)
MUST PULL FROM: Team Confidence Gate table (locked ranges)
Outputs:
● team_kr_confidence_pct
● coverage_confidence_pct
Additional confidence adjustments based on data tier:
Data Tier Confidence Impact
Tier 1 — Full (Synergy/PlayVision tracked usage + No penalty (baseline from Confidence
matchup + minutes) Gate table)

Tier 2 — Mid (box score estimated usage, no Moderate penalty (usage is estimated,
matchup) matchup absent)
Tier 3 — Low (minutes only, no usage, no matchup) Larger penalty (offensive weighting
less precise)
Rule: Confidence does not change Team KR math. It communicates evidence completeness
and stability.
15. Output Summary
Team KR computation returns:
● Team_Off_KR
● Team_Def_KR
● Team_KR (overall)
● Offensive_Fit%
● Defensive_Fit%
● Overall_Fit%
● Coverage Map (diagnostic object)
● Missing Demands (diagnostic list)
● Fragility Flags (diagnostic list)
● Physical Environment Summary (diagnostic object)
● Tier Label (from Level Interpretation)
● team_kr_confidence_pct
● coverage_confidence_pct
All computational outputs are deterministic: same inputs → same outputs.
16. Execution Order (Pipeline)
Ste Operation Source
p
0 Coach Context Setup — lock program, level, systems Coach Inputs
1 System Load + Validation — validate system names UI System Set + System
(12 offense, 10 defense), load demand profiles Demand Profiles

2 Roster Player Outputs Loaded — Final System Off/Def Player System Fit (upstream)
KR per player
3 Participation Threshold — include players ≥ 5%, Minutes data
exclude below
4 Offensive Weights Built — usage + minutes + system Usage data + Minutes +
role, per data tier Demand Profiles
5 Defensive Weights Built — minutes + system role + Minutes + Demand Profiles +
matchup, per data tier Matchup data
6 Coverage Modifier Applied — bench adjustment for Demand Profiles + Archetype
gap-filling vs redundancy mapping
6.5 Physical Environment Modifier Applied — Player height/weight + Level
size-dependent trait amplification by level physical averages
7 Re-normalize all weights — offensive and defensive —
weights each sum to 1.0
8 Team Offense KR — weighted aggregation Final System Off KRs × Off
Weights
9 Team Defense KR — weighted aggregation Final System Def KRs × Def
Weights
10 Overall Team KR — level-contextual off/def split Off/Def split table
11 Diagnostics — Fit%, Coverage Map, Missing Demand Profiles + Coverage
Demands, Fragility Flags, Physical Environment data + Physical data
Summary
12 Level Interpretation — translate to tier label Team KR Legend
13 Team Confidence Gate — final stamp Confidence Gate table +
Data tier
Governance Notes
● Team KR is produced by Nexus. No manual override exists.
● Team KR Legend is display-only. No evaluation logic lives there.
● System Demand Profiles and UI System Set (12 offense, 10 defense) are consumed but
not modified by Team KR.

● All upstream player evaluations (traits, archetypes, badges, system fit, overrides) are
immutable by the time Team KR executes.
● Team KR is contextual: change the system selection, and all Final System KRs change
upstream, producing a different Team KR on re-computation. This is by design — it
allows coaches to test "what if we switched to Motion offense?" scenarios.
● The Physical Environment Modifier is contextual: the same team has different physical
environment adjustments when playing against different levels. This is by design — it
accurately reflects how physical mismatches vary by competition.
● Level physical averages are preloaded reference data that improves as more programs
join the platform and contribute roster data to the Global Database.
UI / GOVERNANCE NOTE
Computation document only. All values are produced by Nexus. No manual override of
computed values. Team KR Legend, Team Confidence Gate, System Demand Profiles, and UI
System Set are consumed but not modified here. The Physical Environment Modifier adjusts
weights only — it never modifies Player KR.

Team KR Legend

NCAA Division I — High-Major (HM)
Season-Level Output Interpretation
Context assumptions: Power-conference ecosystem (Big Ten, SEC, ACC, Big 12, Big East,
plus elite independents). National recruiting depth. Heavy Top-100 opponent load. Postseason
survival requirements across multi-game tournaments.
TEAM KR TIERS (DISPLAY / READ-ONLY)
96–100 — National Title Favorite
● Controls games on both ends
● Redundant creators and stoppers
● Survives variance across a 6-game tournament
● Title is a probable outcome, not an upset
93–95 — Final Four–Capable
● Top-2 seed profile
● Multiple high-level creators
● Some matchup risk, but deep run is realistic
90–92 — Tournament Lock (Top-4 Seed Range)
● Strong regular-season resume
● Multiple reliable options
● Ceiling depends on draw and health
88–89 — Tournament Team (5–8 Seed)
● One clear anchor
● Functional but matchup-sensitive
● Second-weekend upside, no margin for error
85–87 — Bubble Team / ~.500
● High volatility
● One or two real strengths, one fatal flaw
● Record often masks talent swings
82–84 — Likely Losing Record
● Upset wins possible
● Inconsistent execution

● Late-game fragility
78–81 — Clear Losing Record
● Structural limitations
● No tournament path
● Developmental or transitional season
Below 78 — Non-Competitive
● Talent ceiling caps outcomes
● Wins are situational, not sustainable
UI / GOVERNANCE NOTE Display legend only. Team KR values are produced by Nexus. No
evaluation, weighting, or normalization logic lives here.
NCAA Division I — Mid-Major (MM)
Season-Level Output Interpretation
Context assumptions: High-end mid-major ecosystem (A-10, MVC, Mountain West, AAC,
WCC non-elite years, top C-USA, Big West, etc.). Regional + selective national recruiting, fewer
elite athletes than HM, thinner redundancy, heavier reliance on top 1–2 players. At-large access
exists but is fragile; auto-bids dominate postseason paths.
TEAM KR TIERS (DISPLAY / READ-ONLY)
96–100 — National Title Outlier (Rare)
● Extremely rare at MM level
● One of the best non-HM teams of the decade
● Can beat HM teams on neutral floors consistently
● Sweet 16+ is realistic; title path exists with bracket + variance
93–95 — Deep Tournament Threat
● Top-10 to top-15 caliber nationally
● Elite efficiency relative to schedule
● High-major upset expected, not shocking
● Sweet 16 ceiling; Elite Eight requires luck
90–92 — Tournament Lock (At-Large Profile)
● Clear at-large team

● Conference title contender
● Round-of-32 baseline; Sweet 16 possible
● Metrics carry more weight than resume volume
88–89 — Tournament Team (Auto-Bid / Bubble At-Large)
● One clear high-end anchor
● Solid rotation, limited redundancy
● One-game upset potential
● Ceiling highly matchup-dependent
85–87 — Bubble Team / High Variance
● Can win league, can miss tournament
● Flawed roster construction
● At-large hopes fragile
● Often finishes near .500 vs quality opponents
82–84 — Winning Record, No NCAA Tournament
● Strong regular season in-league
● Lacks top-end shot-making or depth
● Upsets occur, consistency does not
● NIT / secondary postseason profile
78–81 — Losing Record vs Quality Competition
● Wins mostly vs bottom-half teams
● Competitive in spurts
● No postseason path
● Developmental or rebuilding season
74–77 — Clear Losing Record
● Bottom-third of conference
● Structural roster limitations
● Upsets rare and situational
● Predictable season outcomes
Below 74 — Non-Competitive
● Conference cellar
● Negative efficiency margins
● Talent ceiling caps outcomes
● Development-only or reset year

UI / GOVERNANCE NOTE Display legend only. Team KR values are produced by Nexus. No
evaluation, weighting, or normalization logic lives here.
NCAA Division I — Low-Major (LM)
Season-Level Output Interpretation
Context assumptions: Low-resource D1 ecosystem (SWAC, MEAC, NEC, Southland, OVC
low tier, Big South low tier). Local/regional recruiting, thin margins, limited redundancy, and
heavy dependence on 1–2 players. Most teams cannot absorb injuries, foul trouble, or scouting
exposure.
TEAM KR TIERS (DISPLAY / READ-ONLY)
96–100 — National Title Outlier / Extreme Upset Path
● Extremely rare at LM level
● Can win multiple NCAA tournament games with perfect bracket + shooting variance
● Dominates league; metrics far exceed peers
● One of the best low-major teams of the decade
93–95 — Tournament Giant-Killer (Round-of-32 Ceiling)
● Clear best team in conference
● Elite efficiency relative to league
● First-round upset expected, not shocking
● Second-weekend run requires matchup luck
90–92 — Tournament Lock (Auto-Bid Favorite)
● Conference title favorite
● One true high-end anchor
● Wins league games consistently
● NCAA win possible; consistency fragile
88–89 — Tournament Team (Auto-Bid Contender)
● Top-2 or top-3 in conference
● Heavy reliance on star player
● Can win conference tournament
● NCAA ceiling depends on draw
85–87 — Winning Record / Conference Contender

● Above-average roster
● Flawed but competitive
● Finishes top-half of league
● No at-large path; auto-bid only
82–84 — Middle-of-Pack
● Inconsistent outcomes
● Can beat anyone in league, lose to anyone
● Record near .500
● Talent gaps exposed late in games
78–81 — Losing Record (Lower-Half Conference Team)
● Structural limitations
● Limited shot creation
● Wins mostly vs bottom teams
● Developmental or transition season
74–77 — Clear Losing Record
● Bottom-third of conference
● One-dimensional roster
● Rare upset potential
● Predictable season outcomes
Below 74 — Non-Competitive
● Conference cellar
● Negative margins most nights
● Roster talent caps outcomes
● No realistic postseason path
UI / GOVERNANCE NOTE Display legend only. Team KR values are produced by Nexus. No
evaluation, weighting, or normalization logic lives here.
NCAA Division II
Season-Level Output Interpretation
Context assumptions: True D2 ecosystem (MIAA, G-MAC, Sunshine State, PSAC, GLIAC,
RMAC). Regional recruiting, strong coaching parity, solid depth at the top. Best teams can upset
bad D1 teams but are not season-competitive with average D1 rosters.

TEAM KR TIERS (DISPLAY / READ-ONLY)
84–100 — National Title Favorite
● Best teams in the country
● Multiple All-American–level D2 players
● Control games within D2; survive tournament variance
● Project as very bottom-tier D1 teams in one-off contexts
● Championship is the expected outcome within D2
80–83 — National Championship Contender
● Legit title path
● Deep, disciplined rosters
● Dominant vs most D2 peers
● Can upset bad D1 teams on neutral floors
76–79 — Elite Regional Power
● Regional title contender
● National semifinal upside
● Strong execution; ceiling capped by athleticism gaps
● Comparable to weak D1 rosters
72–75 — National Tournament Lock
● Safely in the field
● Can win regional games
● One or two exploitable weaknesses
● Ceiling depends on matchup draw
68–71 — Regional Tournament Team
● Above-average D2 program
● Competitive within conference
● Limited national impact
● Depth begins to thin
64–67 — Middle-of-Pack
● Near .500
● Can beat strong teams on good nights
● Inconsistent execution
● Development-focused season
60–63 — Losing Record

● Bottom half of conference
● Structural roster limitations
● No realistic tournament path
● Transition or rebuilding year
Below 60 — Non-Competitive
● Conference cellar
● Negative margins most nights
● Talent ceiling caps outcomes
● High roster-turnover risk
UI / GOVERNANCE NOTE Display legend only. Team KR values are produced by Nexus. No
evaluation, weighting, or normalization logic lives here.
NCAA Division III
Season-Level Output Interpretation
Context assumptions: No athletic scholarships. Roster construction limited by academic fit and
willingness to play without athletic aid. Strong coaching and scheme execution separate top
programs (NESCAC, ODAC, MIAC, CCC, etc.). Depth varies widely; top programs are
disciplined and veteran-heavy, lower tiers are thin and volatile.
TEAM KR TIERS (DISPLAY / READ-ONLY)
72–100 — National Title Favorite
● Best D3 teams in the country
● Multiple standout players with strong two-way production
● Veteran cores, deep rotations relative to D3
● Championship is the expected outcome within D3
● Can compete with bottom-tier D2 teams in one-off contexts
68–71 — National Championship Contender
● Legit title path
● One or two high-end anchors + functional rotation
● Disciplined execution
● Ceiling capped vs elite D3 athleticism
64–67 — Elite Regional Power
● Conference / region title contender

● National semifinal upside
● Competitive nationally
● One or two exploitable weaknesses
60–63 — National Tournament Lock
● Safely qualifies
● Can win regional games
● Ceiling capped by depth or athleticism
● Matchup-dependent in tournament
56–59 — Regional Tournament Team
● Above-average D3 program
● Competitive within conference
● Limited national impact
● Depth thins quickly past top 6
52–55 — Middle-of-Pack
● Near .500
● Competitive in spurts
● Development-focused season
● Talent gaps exposed against quality opponents
48–51 — Losing Record
● Bottom half of conference
● Structural roster limitations
● No realistic tournament path
● Rebuilding or transition year
Below 48 — Non-Competitive
● Conference cellar
● Negative margins most nights
● Roster talent caps outcomes
● Development or reset year
UI / GOVERNANCE NOTE Display legend only. Team KR values are produced by Nexus. No
evaluation, weighting, or normalization logic lives here.
NAIA

Season-Level Output Interpretation
Context assumptions: Merged single-division NAIA ecosystem (Heart, GPAC, SSAC,
Cascade, Crossroads, Sooner, Mid-South, KCAC, Frontier, Red River, etc.). Approximately 250
member institutions. Scholarship flexibility with up to 8 athletic scholarships per team. Older
rosters than JUCO, less depth than D2. Best teams are highly organized, physical, and
veteran-heavy. 64-team single-elimination national tournament. NAIA sits between D2 stability
and JUCO volatility.
TEAM KR TIERS (DISPLAY / READ-ONLY)
80–100 — National Title Favorite
● Best NAIA teams in the country
● Multiple All-American–level NAIA players
● Veteran-heavy, disciplined, physical
● Can beat bad D2 teams and compete with bottom-tier competent D2
● Championship is the expected outcome within NAIA
76–79 — National Championship Contender
● Legit title path
● Strong top-end + solid rotation
● Can make deep national runs
● Ceiling capped vs elite D2 athleticism
72–75 — Elite National Tournament Team
● National tournament lock
● Can win multiple games
● One or two real weaknesses
● Matchup-dependent ceiling
68–71 — National Tournament Team
● Consistent qualifier
● Competitive but flawed
● Upset potential present, consistency limited
64–67 — Regional Power
● Strong conference team
● Can qualify, struggles nationally
● Depth begins to thin
60–63 — Middle-of-Pack

● Near .500
● Can beat strong teams on good nights
● Inconsistent execution
56–59 — Losing Record
● Bottom half of conference
● Structural roster limitations
● No realistic title path
Below 56 — Non-Competitive
● Development or rebuild year
● Negative margins most nights
● Roster turnover common
UI / GOVERNANCE NOTE Display legend only. Team KR values are produced by Nexus. No
evaluation, weighting, or normalization logic lives here.
NJCAA Division I
Season-Level Output Interpretation
Context assumptions: Athletic, fast JUCO D1 ecosystem. Real NBA/D1 transfer pipeline talent
passes through. 2-year eligibility max creates high roster volatility. Best teams are explosive but
inconsistent season-to-season. Strong coaching can stabilize, but depth is fragile.
TEAM KR TIERS (DISPLAY / READ-ONLY)
78–100 — National Title Favorite
● Best NJCAA D1 teams nationally
● Multiple players with D1 upside or transfer pedigree
● Athletic, deep, well-coached
● Championship is the expected outcome within NJCAA D1
74–77 — National Championship Contender
● Legit title path
● One or two elite individual talents
● Deep enough to survive tournament variance
● Can beat bad D2 / low-major D1 teams in one-off contexts
70–73 — Elite Regional Power

● Conference / region title contender
● National semifinal upside
● Strong execution; ceiling capped by depth volatility
66–69 — National Tournament Lock
● Safely qualifies
● Can win tournament games
● One or two exploitable weaknesses
● Matchup-dependent ceiling
62–65 — Regional Tournament Team
● Above-average NJCAA D1 program
● Competitive within conference
● Limited national impact
● Depth thins quickly
58–61 — Middle-of-Pack
● Near .500
● Competitive in spurts
● High roster turnover impacts consistency
54–57 — Losing Record
● Bottom half of conference
● Structural roster limitations
● No realistic title path
Below 54 — Non-Competitive
● Development or reset year
● Negative margins most nights
● High roster churn
UI / GOVERNANCE NOTE Display legend only. Team KR values are produced by Nexus. No
evaluation, weighting, or normalization logic lives here.
NJCAA Division II
Season-Level Output Interpretation

Context assumptions: Step down in athleticism from NJCAA D1. More structure-dependent.
Regional recruiting with some transfer talent. Best teams are disciplined and veteran-heavy
relative to the division. Depth is thinner than NJCAA D1.
TEAM KR TIERS (DISPLAY / READ-ONLY)
76–100 — National Title Favorite
● Best NJCAA D2 teams nationally
● Strong guards + functional frontcourt
● Well-coached relative to division
● Championship is the expected outcome within NJCAA D2
72–75 — National Championship Contender
● Legit title path
● One or two standout players
● Limited depth but good execution
● Matchup-dependent ceiling
68–71 — Elite Regional Power
● Conference / region title contender
● Competitive nationally
● Can win tournament games, struggle vs disciplined opponents
64–67 — National Tournament Lock
● Safely qualifies
● Can win games
● Ceiling capped by athleticism and depth
60–63 — Regional Tournament Team
● Above-average NJCAA D2 program
● Can win locally
● Limited national impact
56–59 — Middle-of-Pack
● Near .500
● Competitive in spurts
● Development-focused season
52–55 — Losing Record
● Bottom half of conference/region

● Structural roster limitations
● No realistic title path
Below 52 — Non-Competitive
● Development or reset year
● Negative margins most nights
● High roster churn
UI / GOVERNANCE NOTE Display legend only. Team KR values are produced by Nexus. No
evaluation, weighting, or normalization logic lives here.
CCCAA (California Community Colleges)
Season-Level Output Interpretation
Context assumptions: California community college ecosystem (~110 member schools).
Strong California talent pipeline produces real athletes. No athletic scholarships but tuition is
minimal. 2-year eligibility. Regional conference structure. Best programs benefit from proximity
to D1/D2 transfer destinations. More athletic than NJCAA D2/D3 due to California talent base.
TEAM KR TIERS (DISPLAY / READ-ONLY)
74–100 — State / National Title Favorite
● Best CCCAA teams in the state
● Multiple players with D1/D2 transfer upside
● Athletic, well-coached, deep relative to CCCAA
● State championship is the expected outcome
70–73 — State Championship Contender
● Legit title path
● One or two standout players
● Can compete with bottom-tier NJCAA D1 teams
● Ceiling capped by depth
66–69 — Elite Regional Power
● Conference title contender
● State semifinal upside
● Strong execution; one or two exploitable weaknesses
62–65 — State Tournament Team

● Consistent qualifier
● Competitive within conference
● Limited impact at state level
● Matchup-dependent ceiling
58–61 — Regional Tournament Team
● Above-average CCCAA program
● Can win locally
● Struggles vs top-tier programs
54–57 — Middle-of-Pack
● Near .500
● Competitive in spurts
● Development-focused season
50–53 — Losing Record
● Bottom half of conference
● Structural roster limitations
● No realistic title path
Below 50 — Non-Competitive
● Development or reset year
● Negative margins most nights
● High roster turnover
UI / GOVERNANCE NOTE Display legend only. Team KR values are produced by Nexus. No
evaluation, weighting, or normalization logic lives here.
NJCAA Division III
Season-Level Output Interpretation
Context assumptions: NJCAA D3 ecosystem (no athletic scholarships). Regional recruiting,
high roster churn, younger lineups, limited depth. Teams emphasize access, development, and
upward movement (to NAIA / D3 / CCCAA / NJCAA D2). Athletic ceiling is lower than CCCAA;
structure is weaker than NCAA D3.
TEAM KR TIERS (DISPLAY / READ-ONLY)
68–100 — National Title Favorite

● Best NJCAA D3 teams nationally
● Strong guards + functional frontcourt
● Well-coached relative to division
● Championship is the expected outcome within NJCAA D3
64–67 — National Championship Contender
● Legit title path
● One or two standout players
● Limited depth but good execution
● Matchup-dependent ceiling
60–63 — Elite Regional Power
● Conference / region title contender
● Competitive nationally
● Can win tournament games, struggle vs disciplined opponents
56–59 — National Tournament Lock
● Safely qualifies
● Can win games
● Ceiling capped by athleticism and depth
52–55 — Regional Tournament Team
● Above-average NJCAA D3 team
● Can win locally
● Limited national impact
48–51 — Middle-of-Pack
● Near .500
● Competitive in spurts
● Development-focused season
44–47 — Losing Record
● Bottom half of conference/region
● Structural roster limitations
● No realistic title path
Below 44 — Non-Competitive
● Development or reset year
● Negative margins most nights
● High roster turnover

UI / GOVERNANCE NOTE Display legend only. Team KR values are produced by Nexus. No
evaluation, weighting, or normalization logic lives here.
USCAA
Season-Level Output Interpretation
Context assumptions: Small-school, independent ecosystem with limited or no athletic
scholarships. Wide variance in program seriousness and resources. Older rosters than JUCO
D3 at some schools, but thinner depth and lower athletic ceilings overall. Postseason exists, but
national outcomes are heavily talent-capped.
TEAM KR TIERS (DISPLAY / READ-ONLY)
64–100 — National Title Favorite
● Best USCAA teams nationally
● One or two clear high-end players
● Well-organized relative to division
● Championship is the expected outcome within USCAA
60–63 — National Championship Contender
● Legit title path
● Can win multiple postseason games
● Limited depth but functional execution
● Ceiling capped vs NJCAA D3 / NCAA D3 opponents
56–59 — Elite Tournament Team
● Regular postseason qualifier
● Competitive nationally
● One exploitable weakness (size, guard play, depth)
52–55 — Tournament Team
● Above-average USCAA program
● Can win games locally
● Struggles vs top-tier programs
48–51 — Middle-of-Pack
● Near .500
● Competitive in spurts

● Development-focused season
44–47 — Losing Record
● Bottom half of standings
● Structural roster limitations
● No realistic title path
Below 44 — Non-Competitive
● Minimal competitive intent
● Development, access, or club-adjacent season
● Negative margins most nights
UI / GOVERNANCE NOTE Display legend only. Team KR values are produced by Nexus. No
evaluation, weighting, or normalization logic lives here.
NCCAA Division I
Season-Level Output Interpretation
Context assumptions: Faith-based athletic ecosystem with mixed scholarship rules (D1 allows
athletic aid). Programs range from serious national contenders (Grace, Bethel,
Campbellsville-type) to access-oriented institutions. Competition mostly vs NCCAA peers, with
some NAIA / USCAA / NCAA D3 crossover games. Depth varies widely; top programs are
disciplined and veteran-heavy, lower tiers are thin and volatile.
TEAM KR TIERS (DISPLAY / READ-ONLY)
66–100 — National Title Favorite
● Best NCCAA programs nationally
● Clear roster superiority within the association
● Veteran cores, strong guard play, disciplined execution
● Championship is the expected outcome within NCCAA
62–65 — National Championship Contender
● Legit title path
● One high-end anchor + functional rotation
● Can win nationals with execution and matchup luck
● Ceiling capped vs NAIA / NCAA D3 elites
58–61 — Elite Tournament Team

● Regular postseason qualifier
● Competitive nationally within NCCAA
● One or two exploitable weaknesses (size, depth, shot creation)
54–57 — Tournament Team
● Above-average NCCAA program
● Can win games locally
● Struggles vs top-tier NCCAA or crossover opponents
50–53 — Middle-of-Pack
● Near .500
● Competitive in spurts
● Development-focused season
46–49 — Losing Record
● Bottom half of standings
● Structural roster limitations
● No realistic title path
Below 46 — Non-Competitive
● Minimal competitive intent
● Development, access, or mission-first season
● Negative margins most nights
UI / GOVERNANCE NOTE Display legend only. Team KR values are produced by Nexus. No
evaluation, weighting, or normalization logic lives here.
NCCAA Division II
Season-Level Output Interpretation
Context assumptions: Faith-based, mission-first athletic ecosystem. No athletic scholarships
or extremely limited aid. Competition primarily vs NCCAA D2 peers, small Christian colleges,
and independents. Occasional crossover vs low-tier NCCAA D1, USCAA, or NAIA. Depth is
very thin; most teams rely on 5–7 playable pieces. Talent gaps within the division are wide.
Execution, experience, and cohesion matter more than raw athleticism.
TEAM KR TIERS (DISPLAY / READ-ONLY)
62–100 — National Title Favorite

● The elite tier of NCCAA D2 programs
● Clear roster superiority within D2
● Veteran-heavy cores with defined roles
● Disciplined guard play and low-variance execution
● Championship is a realistic expectation within NCCAA D2
● Can beat lower-tier NCCAA D1 teams in neutral settings
● Ceiling still capped vs strong NAIA / NCAA D3 programs
58–61 — National Championship Contender
● Legitimate path to winning NCCAA D2 nationals
● One high-end anchor plus functional rotation
● Clear identity on one end of the floor
● Can win nationals with execution + matchup luck
● Limited margin for error vs top-tier D2 opponents
54–57 — Elite Tournament Team
● Consistent postseason presence
● Regular national tournament qualifier
● Competitive with top D2 programs
● One or two exploitable weaknesses (depth, size, shot creation)
● Upset-capable, but not dominant
50–53 — Tournament Team
● Above-average NCCAA D2 program
● Competitive within conference play
● Can win early-round postseason games
● Lacks consistency or high-end talent to sustain deep runs
● Development-oriented roster with flashes
46–49 — Middle-of-Pack
● Functional but limited program
● Near .500 outcomes
● Competitive in spurts
● Depth issues exposed over season length
● Focused on development, culture, and retention
42–45 — Losing Record
● Bottom-half D2 program
● Structural roster limitations
● Thin rotations
● Struggles to close games

● No realistic national title path
Below 42 — Non-Competitive
● Below NCCAA D2 competitive threshold
● Minimal competitive intent
● Access- or mission-first seasons
● Large negative margins most nights
● Very high roster churn risk
UI / GOVERNANCE NOTE Display legend only. Team KR values are produced by Nexus. No
evaluation, weighting, or normalization logic lives here.

Team Confidence Gate

Team Confidence Gate — Full Confidence Table (Locked
Ranges)
Purpose
Confidence% is a single number that communicates evidence completeness + stability for the
team evaluation.
Outputs
● team_kr_confidence_pct ∈ [0,100]
● coverage_confidence_pct ∈ [0,100]
Computed at the end of team evaluation.
What it affects
Confidence% does not change any Team KR math. Confidence% is used for transparency and
(optionally) gating what the system is allowed to claim or trigger.
Data Tiers
V1 — Stats-Only Public box scores (league/team), roster minutes, publicly available stats.
Usage estimated from box score (FGA/FTA/TOV formula). No play-type data. No matchup
tracking. No film. Available for every organized basketball program.
V1+ — Stats + Licensed Granular V1 baseline plus third-party play-type data from a licensed
external provider. Adds actual usage tracking, play-type classification, shot profiles, and
possession-level efficiency. No matchup assignment tracking. Data quality not owned or verified
by KaNeXT. Bridge tier for opponents and portal players' former teams outside the PlayVision
camera network.
V2 — PlayVision (1 Season) KaNeXT-owned camera + processing pipeline. Single season of
processed data. Full play-type tagging, shot-type classification, possession-level data, actual
usage tracking, matchup assignment tracking, defensive assignment difficulty, spatial data. The
authoritative data source when available. Teams on the platform in year 1.
V3 — PlayVision Deep (Multi-Season) Multiple seasons of KaNeXT-owned PlayVision data
processed and archived. Full trend analysis, pattern recognition, system identity confidence
maximized. Film archive enables visual confirmation. The highest-fidelity evidence layer. Teams
on the platform in year 2+. The longer a program stays on KaNeXT, the smarter the system
gets.

Team KR Confidence %
Data available Team KR
confidence %
V1 stats-only + official rotation minutes, single season 75–84%
V1 stats-only + official rotation minutes, multi-year 78–86%
V1 stats-only + HS stats (MaxPreps etc.) + official rotation minutes 80–88%
V1 multi-year across levels (NJCAA→NAIA/NCAA, etc.) + official rotation 83–90%
minutes
V1+ licensed granular (1 year) + official stats + official rotation minutes. 86–93%
Starters mostly Full eval.
V1+ licensed granular (multi-year) + official stats + official rotation 90–96%
minutes. Rotation mostly Full eval.
V2 PlayVision (1 year) + official stats + official rotation minutes. Actual 88–95%
usage + matchup tracking. Starters mostly Full eval.
V3 PlayVision Deep (multi-year) + official stats + official rotation minutes. 92–97%
Actual usage + matchup tracking. Rotation mostly Full eval.
System Coverage Confidence %
Data available Coverage confidence
%
V1 stats-only + official rotation minutes, single season 45–60%
V1 stats-only + official rotation minutes, multi-year 50–65%
V1 stats-only + HS stats + official rotation minutes 55–70%
V1 multi-year across levels + official rotation minutes 60–75%
V1+ licensed granular (1 year) + official stats + official rotation 72–85%
minutes
V1+ licensed granular (multi-year) + official stats + official rotation 82–93%
minutes

V2 PlayVision (1 year) + official stats + official rotation minutes 75–88%
V3 PlayVision Deep (multi-year) + official stats + official rotation 85–95%
minutes
Data Tier → Weight Method Mapping (Reference)
Data Tier Offensive Weight Method Defensive Weight Method
V3 PlayVision Deep Actual usage (50%) + minutes Minutes (50%) + role (40%)
(25%) + role (25%) + matchup (10%)
V2 PlayVision Actual usage (50%) + minutes Minutes (50%) + role (40%)
(25%) + role (25%) + matchup (10%)
V1+ Licensed Granular Actual usage (50%) + minutes Minutes (60%) + role (40%)
(25%) + role (25%)
V1 Stats-Only (box score Estimated usage (50%) + Minutes (60%) + role (40%)
available) minutes (25%) + role (25%)
V1 Stats-Only (minutes Minutes (75%) + role (25%) Minutes (60%) + role (40%)
only, no box score)
Confidence Rules
● Confidence is computed once at the end of team evaluation
● Confidence does not change Team KR math
● V3 and V2 PlayVision are the only data tiers that enable matchup assignment tracking in
defensive weights
● V1+ licensed granular provides actual usage tracking but no matchup data — defensive
weights fall back to minutes + role only
● V1 stats-only uses estimated usage from box score — lower precision on offensive
weighting
● When multiple data sources are available for the same team, use the highest-fidelity
source
● Confidence ranges are defaults — the system may adjust within the range based on
sample size, roster stability, and evaluation completeness
● The product flywheel: V1 is what everyone has. V2 is what you get when you join
KaNeXT. V3 is what you get when you stay. Data depth compounds over time.

UI / GOVERNANCE NOTE
Display legend only. Confidence values are produced by Nexus. No evaluation, weighting, or
normalization logic lives here.
Lock it?

System Inference Engine

System Inference Engine — OSIE + DSIE + Protocol
0. Scope
This is the single authoritative document for system inference. It replaces:
● Offensive System Inference Engine (OSIE)
● Defensive System Inference Engine (DSIE)
● OSIE/DSIE Team System Inference Protocol
The System Inference Engine identifies what offensive and defensive systems a team actually
runs, how confidently those systems can be inferred, and how system identity evolves across a
season.
The engine is descriptive only. It labels structure. It does not evaluate quality.
1. Own Team vs Opponent Distinction
Own team: The coach selects the offensive and defensive system in Coach Context Setup.
That selection feeds Team KR — it determines system role weights, coverage map, fit%, and all
downstream outputs. OSIE/DSIE runs in the background on actual game data as an
observational diagnostic. If the observed system diverges from the coach's selection, the
system flags the gap. It does not override the coach's selection.
Opponents: OSIE/DSIE is the primary source. No coach input exists for opponent teams. The
engine infers system identity from data and that label feeds scouting, simulation, game ops, and
matchup preparation.
2. Data Tier Mapping
System inference operates at every data tier. Precision varies.
V1 — Stats-Only: Box scores, roster minutes, publicly available stats. System inference uses
proxy signals (3PA/FGA, FTA/FGA, assist rate, usage concentration, pace, rim attempt rate).
Can distinguish broad categories. Cannot distinguish fine-grained systems within a category.
System Mix is mandatory. Confidence capped at 55%.
V1+ — Stats + Licensed Granular: V1 plus third-party play-type data. Actual play-type
frequencies available. Can run full classification triggers. No PlayVision structural signals.
Confidence ceiling lower than V2/V3.

V2 — PlayVision (1 Season): Full play-type tagging, structural signals (FIVEOUT%, Ball
Screen Rate, Reversal Rate, etc.), spatial data. Full classification triggers plus PlayVision
support triggers. Highest single-season fidelity.
V3 — PlayVision Deep (Multi-Season): Multiple seasons of PlayVision data. Trend analysis,
system evolution tracking, coach identity profiling. Highest overall confidence.
PART 1: OFFENSIVE SYSTEM INFERENCE ENGINE (OSIE)
3. Purpose
OSIE identifies what offensive system a team actually runs, how fast they play, and how
confidently that system can be inferred.
OSIE is descriptive only.
OSIE does not:
● Modify player ratings or KRs
● Alter archetypes
● Affect system fit or valuation
● Influence usage or rotation
● Change any simulation logic
OSIE outputs labels + confidence, consumed downstream by:
● Team KR pipeline (system role weighting, coverage map, fit%)
● Simulation Engine
● Matchup interaction layers
● Calibration and variance logic
4. Outputs
4.1 Primary Offensive System One of the 11 locked offensive systems (Section 5).
4.2 System Confidence % Numeric confidence score (0–100%) representing certainty that the
Primary System is correct. Feeds variance inflation in simulation. Governs mixture simulation.
Does not change means.
4.3 System Mix (Conditional) Returned only if dominance criteria are not met. Top 2 (or top 3,
max) systems with mix shares (%) summing to 100%.
4.4 Offensive Pace Profile

● PACE100 (numeric)
● Pace Band: Fast ≥ 74.0 / Neutral 68.0–73.9 / Slow ≤ 67.9 PACE100 is always returned
even if band confidence is low.
4.5 Heliocentric Anchor Position (Conditional) Returned only if Primary System =
Heliocentric. Anchor position ∈ PG / CG / Wing / Forward / Big.
5. Offensive System Set (Locked)
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
System IDs must exactly match System × System interaction docs, Archetype × System
interaction docs, and Team KR pipeline references. No aliases permitted.
6. Classification Order (Locked)
To prevent false positives, systems are evaluated in this order. First system to meet dominance
criteria wins.
1. Heliocentric
2. Moreyball
3. Post-Centric / Inside-Out
4. Dribble Drive
5. Spread Pick-and-Roll
6. 5-Out Motion
7. Motion / Read & React
8. Princeton
9. Flex
10. Swing
11. Pace & Space
7. Offensive Classification Triggers
All percentages are half-court possession frequency (HC%) unless noted.

7.1 Spread Pick-and-Roll
Primary Triggers (all must be met):
● PnR Ball Handler % ≥ 18% HC
● PnR Roll Man % ≥ 7% HC
● 3PA/FGA ≥ 33%
● Spot-Up % ≥ 15% HC
Support Triggers:
● Isolation % ≤ 12%
● Assist Rate ≥ 48%
● 3+ players attempting 1.5+ threes per game
● Post-Up % ≤ 6%
PlayVision (V2/V3) Support:
● Ball Screen Rate ≥ 22%
● Re-screen Rate present
7.2 5-Out Motion
Primary Triggers:
● Post-Up % ≤ 4% HC
● 3PA/FGA ≥ 35%
● Cut % ≥ 8% HC
● Spot-Up % ≥ 18% HC
Support Triggers:
● Assist Rate ≥ 52%
● No single player usage ≥ 28%
● Off-Screen % ≥ 5%
● PnR Ball Handler % ≤ 16%
PlayVision (V2/V3) Support:
● FIVEOUT % ≥ 40%
● Reversal Rate ≥ 15%
● Continuity Rate ≥ 12%
7.3 Motion / Read & React
Primary Triggers:

● Assist Rate ≥ 55%
● Cut % ≥ 9% HC
● DHO % ≥ 5% HC
● No single player usage ≥ 26%
Support Triggers:
● Off-Screen % ≥ 5%
● Spot-Up % ≥ 15%
● PnR Ball Handler % ≤ 18%
● 3+ players with 12%+ usage
PlayVision (V2/V3) Support:
● Reversal Rate ≥ 18%
● Continuity Rate ≥ 15%
● Backdoor Rate ≥ 3%
● No single Primary Initiator dominance
7.4 Pace & Space
Primary Triggers:
● Transition % ≥ 18%
● 3PA/FGA ≥ 35%
● Spot-Up % ≥ 18% HC
● PACE100 ≥ 71.0
Support Triggers:
● Rim Attempts/FGA ≥ 30%
● PnR Ball Handler % ≥ 12%
● Post-Up % ≤ 5%
● Cut % ≥ 6%
PlayVision (V2/V3) Support:
● Early Offense Action Time ≤ 6 seconds
● FIVEOUT % ≥ 25%
7.5 Dribble Drive
Primary Triggers:
● Rim Attempts/FGA ≥ 35%
● Isolation % ≥ 8% HC
● Spot-Up % ≥ 16% HC

● Midrange Attempts/FGA ≤ 18%
Support Triggers:
● PnR Ball Handler % ≤ 15%
● Cut % ≥ 6%
● FTA/FGA ≥ 30%
● 3PA/FGA ≥ 28%
PlayVision (V2/V3) Support:
● Split Rate ≥ 5%
● Ball Screen Rate ≤ 18%
7.6 Princeton
Primary Triggers:
● Post-Up % ≥ 8% HC
● Cut % ≥ 10% HC
● Assist Rate ≥ 52%
● Spot-Up % ≥ 12% HC
Support Triggers:
● DHO % ≥ 5%
● Off-Screen % ≥ 5%
● PACE100 ≤ 70.0
● No single player usage ≥ 28%
PlayVision (V2/V3) Support:
● Post Hub Rate ≥ 10%
● Backdoor Rate ≥ 5%
● UCLA Cut Rate ≥ 4%
● Continuity Rate ≥ 10%
7.7 Flex
Primary Triggers:
● Off-Screen % ≥ 7% HC
● Post-Up % ≥ 7% HC
● Cut % ≥ 8% HC
● Spot-Up % ≥ 14% HC
Support Triggers:

● Assist Rate ≥ 48%
● PACE100 ≤ 71.0
● Midrange Attempts/FGA ≥ 12%
● PnR Ball Handler % ≤ 15%
PlayVision (V2/V3) Support:
● Flex Action Rate ≥ 8%
● Reversal Rate ≥ 10%
7.8 Swing
Primary Triggers:
● Spot-Up % ≥ 22% HC
● Assist Rate ≥ 50%
● 3PA/FGA ≥ 33%
● No single player usage ≥ 26%
Support Triggers:
● Cut % ≥ 6%
● Off-Screen % ≥ 4%
● Post-Up % ≤ 6%
● PnR Ball Handler % ≤ 16%
PlayVision (V2/V3) Support:
● Reversal Rate ≥ 20%
● Continuity Rate ≥ 10%
7.9 Post-Centric / Inside-Out
Primary Triggers:
● Post-Up % ≥ 12% HC
● Rim Attempts/FGA ≥ 33%
● Midrange Attempts/FGA ≥ 14%
Support Triggers:
● 3PA/FGA ≤ 36%
● Spot-Up % ≥ 10%
● Assist Rate ≥ 42%
● Isolation % ≤ 10%
PlayVision (V2/V3) Support:

● Post Hub Rate ≥ 12%
● FIVEOUT % ≤ 20%
7.10 Moreyball
Primary Triggers:
● 3PA/FGA ≥ 40%
● Rim Attempts/FGA ≥ 32%
● Midrange Attempts/FGA ≤ 12%
● PnR Ball Handler % ≥ 15% HC
Support Triggers:
● Spot-Up % ≥ 18%
● FTA/FGA ≥ 28%
● Transition % ≥ 14%
● Post-Up % ≤ 5%
PlayVision (V2/V3) Support:
● Ball Screen Rate ≥ 20%
● FIVEOUT % ≥ 30%
7.11 Heliocentric
Primary Triggers:
● Single player usage ≥ 28%
● That player's ISO + PnR BH % combined ≥ 22% of team HC possessions
● 3PA/FGA ≥ 28%
● Spot-Up % ≥ 14% HC
Support Triggers:
● That player responsible for ≥ 28% of team assists
● Post-Up % ≤ 6%
● 2+ other players with usage ≤ 15%
● Assist Rate ≥ 42%
PlayVision (V2/V3) Support:
● Primary Initiator Identification confirms single dominant initiator
● FIVEOUT % ≥ 35%
8. System Scoring (Locked)

For each system:
System Score = (Primary Triggers Met × 1.0) + (Support Triggers Met × 0.5)
PlayVision support triggers count as support triggers (× 0.5).
9. Dominance Rule (Locked)
A system is classified as Primary if:
● Primary Triggers are met AND
● One of: Score lead ≥ 0.10 over next system, OR key proxy margin ≥ 8.0 HC%
If not met → System Mix required.
10. System Mix Computation (Locked)
When System Mix is returned:
1. Take top N system scores (N = 2 or 3, max 3)
2. Normalize scores into percentage shares: Mix Share = System Score / Σ(System
Scores)
3. Shares must sum to 100%
4. Primary system = highest share
11. System Confidence % Computation (Locked)
Confidence derives from dominance margin, sample size, and data completeness.
Condition Confidence
Range
Clear dominance + V2/V3 data 85–95%
Clear dominance + V1+/V1 data 70–88%
Moderate dominance 60–84%
Mix required 45–69%
Sparse / missing data ≤ 45%
V1 only, no play-type data ≤ 55%
Confidence never alters system selection. It only affects downstream variance.

PART 2: DEFENSIVE SYSTEM INFERENCE ENGINE (DSIE)
12. Purpose
DSIE identifies what defensive system a team actually runs, how aggressively and where it is
applied, and how confidently that structure can be inferred.
DSIE is descriptive only. It labels defensive structure. It does not evaluate defensive quality.
DSIE does not:
● Modify player ratings or KRs
● Alter archetypes
● Affect system fit or valuation
● Influence usage or rotation
● Change any simulation logic
DSIE outputs labels + confidence, consumed downstream by:
● Team KR pipeline
● Simulation Engine
● System × System interaction matrices
● Archetype × System interaction matrices
● Calibration and variance logic
13. Outputs
13.1 Primary Defensive System One of the 9 locked defensive systems (Section 14).
13.2 System Confidence % Numeric confidence score (0–100%). Same governance as OSIE
confidence.
13.3 System Mix (Conditional) Returned only if dominance criteria are not met. Top 2 systems
(max). Mix shares sum to 100%.
13.4 Defensive Court Depth One of: Full-Court / Three-Quarter / Half-Court.
Derived from FULLCOURT_START % and PICKUP_DEPTH:
● Full-Court: FULLCOURT_START ≥ 20%
● Three-Quarter: 10–19%
● Half-Court: < 10%
Court depth is an orthogonal descriptor. It does not override system identity. Consumed by
possession pressure modeling, turnover pressure calibration, and pace interaction logic.

14. Defensive System Set (Locked)
1. Containment Man
2. Pack Line
3. Pressure Man (Denial)
4. Switch Everything
5. ICE / No-Middle
6. Zone (Structured)
7. Matchup Zone / Hybrid
8. Press / Pressure Defense
9. Junk / Special
System IDs must exactly match all interaction docs. No aliases permitted.
15. Classification Order (Locked)
1. Junk / Special
2. Press / Pressure Defense
3. Zone (Structured)
4. Matchup Zone / Hybrid
5. Switch Everything
6. ICE / No-Middle
7. Pack Line
8. Pressure Man (Denial)
9. Containment Man (Default)
16. Defensive Classification Triggers
16.1 Containment Man
Primary Triggers:
● Opponent ISO_FACED % baseline (no extreme denial or switching signals)
● ZONE_SHELL % ≤ 5%
● SWITCH_ON_BSCRN % ≤ 20%
● Team FOULR at or below league average
Support Triggers:
● Opponent RIMR_AG ≤ league average
● Opponent 3PAR_AG near league average
● Team TOV_FORCED % near league average
PlayVision (V2/V3) Support:

● PICKUP_DEPTH = Half-Court
● ICE_FORCE % ≤ 10%
● DENY_1PASS % ≤ 15%
16.2 Pack Line
Primary Triggers:
● Opponent RIMR_AG ≤ bottom 25th percentile
● Opponent MIDR_AG elevated
● ZONE_SHELL % ≤ 5%
● SWITCH_ON_BSCRN % ≤ 15%
Support Triggers:
● Team FOULR below league average
● Opponent 3PAR_AG may be elevated
● Team TOV_FORCED % below league average
PlayVision (V2/V3) Support:
● PAINT_OCC ≥ 2.5 avg defenders inside arc
● PICKUP_DEPTH = Half-Court
● DENY_1PASS % ≤ 12%
16.3 Pressure Man (Denial)
Primary Triggers:
● Team TOV_FORCED % ≥ top 25th percentile
● DENY_1PASS % ≥ 20%
● Team FOULR above league average
Support Triggers:
● Opponent ISO_FACED % may be elevated
● ZONE_SHELL % ≤ 5%
● SWITCH_ON_BSCRN % ≤ 20%
PlayVision (V2/V3) Support:
● PICKUP_DEPTH = Half-Court or Three-Quarter
● FULLCOURT_START % ≤ 15%
16.4 Switch Everything
Primary Triggers:

● SWITCH_ON_BSCRN % ≥ 35%
● SWITCH_OFFSCRN % ≥ 25%
● ZONE_SHELL % ≤ 5%
Support Triggers:
● Team FOULR near league average
● Opponent ISO_FACED % may be elevated
● Team TOV_FORCED % near league average
PlayVision (V2/V3) Support:
● PICKUP_DEPTH = Half-Court
● PAINT_OCC near league average
● ICE_FORCE % ≤ 8%
16.5 ICE / No-Middle
Primary Triggers:
● ICE_FORCE % ≥ 20%
● Opponent MIDR_AG elevated
● ZONE_SHELL % ≤ 5%
● SWITCH_ON_BSCRN % ≤ 20%
Support Triggers:
● Opponent RIMR_AG ≤ league average
● Team TOV_FORCED % near league average
● Team FOULR near league average
PlayVision (V2/V3) Support:
● PICKUP_DEPTH = Half-Court
● PAINT_OCC ≥ 2.0
16.6 Zone (Structured)
Primary Triggers:
● ZONE_SHELL % ≥ 25%
● Opponent 3PAR_AG elevated
● Opponent RIMR_AG ≤ bottom 30th percentile
Support Triggers:
● SWITCH_ON_BSCRN % ≤ 10%

● Team TOV_FORCED % may be elevated
● ICE_FORCE % ≤ 5%
PlayVision (V2/V3) Support:
● PAINT_OCC ≥ 2.5
● DENY_1PASS % low
● ZONE_HANDOFF % elevated
16.7 Matchup Zone / Hybrid
Primary Triggers:
● ZONE_SHELL % between 10–24%
● SWITCH_ON_BSCRN % between 15–30%
● Opponent 3PAR_AG slightly elevated
Support Triggers:
● Opponent RIMR_AG ≤ league average
● Team TOV_FORCED % near or slightly above league average
● Team FOULR near league average
PlayVision (V2/V3) Support:
● PAINT_OCC ≥ 2.0
● Mix of ZONE_SHELL and man indicators
16.8 Press / Pressure Defense
Primary Triggers:
● FULLCOURT_START % ≥ 20%
● Team TOV_FORCED % ≥ top 20th percentile
● Team FOULR above league average
Support Triggers:
● Transition % elevated
● PACE100 elevated
● Opponent ISO_FACED % may be elevated
PlayVision (V2/V3) Support:
● PICKUP_DEPTH = Full-Court or Three-Quarter
● DENY_1PASS % ≥ 15%

16.9 Junk / Special
Primary Triggers:
● No other system achieves dominance after full classification sweep
● OR: multiple defensive looks within the same game (box-and-one, triangle-and-two,
face-guarding)
● ZONE_SHELL % between 5–15% with high variance game-to-game
Support Triggers:
● Opponent shot profile shows extreme variance game-to-game
● Team defensive metrics don't cluster around any single system signature
PlayVision (V2/V3) Support:
● High variance across all defensive structure indicators
● Possible identification of box-and-one or triangle-and-two via spatial data
17. Defensive Scoring, Dominance, Mix, and Confidence
Same rules as OSIE (Sections 8–11). Defensive system scoring uses identical formula: System
Score = (Primary Triggers Met × 1.0) + (Support Triggers Met × 0.5). Same dominance rule,
same mix computation, same confidence bands.
PART 3: V1 FALLBACK RULES
18. Offensive Inference from V1 (Stats-Only)
When only box score data is available, OSIE uses proxy signals:
● 3PA/FGA ratio → separates perimeter-heavy (Moreyball, Pace & Space, 5-Out) from
interior-heavy (Post-Centric, Flex, Princeton)
● FTA/FGA → identifies drive-heavy offenses (Dribble Drive, Heliocentric)
● Assist Rate → separates motion/passing offenses from ISO-heavy
● Single player usage concentration → identifies Heliocentric
● PACE100 (estimable from game score/possessions) → separates Pace & Space from
deliberate offenses
● Rim Attempts/FGA (if available) → separates drive/rim offenses from jump-shooting
offenses
V1 offensive inference rules:

● Can distinguish broad categories: perimeter-oriented vs interior-oriented vs
drive-oriented vs balanced
● Cannot distinguish fine-grained systems within a category
● System Mix is mandatory
● Confidence capped at 55%
19. Defensive Inference from V1 (Stats-Only)
● Opponent 3PAR_AG → zone concedes threes, pack line forces midrange
● Opponent RIMR_AG → pack line/zone protect paint, pressure man leaves rim exposed
● Team TOV_FORCED % → press/pressure forces turnovers
● Team FOULR → pressure/press fouls more
V1 defensive inference rules:
● Can distinguish: zone-based vs man-based vs press/pressure
● Cannot distinguish: Containment Man vs ICE vs Pack Line from box score alone
● System Mix is mandatory
● Confidence capped at 55%
PART 4: PROTOCOL (PRESEASON → IN-SEASON → POSTSEASON)
20. System Identity Lifecycle
20.1 Preseason
No games played. System identity loaded from prior season or coach history.
Condition System Assignment Status
Same head coach + roster Use last season's locked PROVISIONAL
turnover < 70% systems (Coach-Continuity)
Same head coach + roster Use last season's locked PROVISIONAL
turnover ≥ 70% systems (High-Turnover)
New head coach Use coach's most recent 1–3 PROVISIONAL (New-Coach
seasons identity Prior)
No usable history Offense: Pace & Space. PROVISIONAL
Defense: Containment Man (Unknown/Balanced)
20.2 First 5 Games (Initial Observation)

After 5 games are complete:
● Run OSIE + DSIE on full 5-game sample
● If dominance criteria met → OBSERVED (LOCKED)
● If dominance criteria not met → OBSERVED (UNLOCKED), System Mix returned
20.3 Every 5 Games (Re-Evaluation Cadence)
After every subsequent 5-game window (games 6–10, 11–15, etc.):
● Run OSIE + DSIE on the most recent 5-game window
● Compare to current locked system identity
Result Action
New window confirms locked No change. Confidence may increase.
system
New window shows different Flag: DRIFT DETECTED. Do not change system yet.
system scoring higher Monitor next window.
2 consecutive 5-game windows REOPEN. Re-classify system. New system becomes
show same drift OBSERVED (UNLOCKED). Fresh lock cycle begins.
1 window drifted, next window Clear drift flag. Keep lock.
reverts to locked system
What updates every 5 games:
● System identity status
● System confidence %
● Team KR (if minutes/usage/roster shifted)
● Coverage map and fit %
● Fragility flags
20.4 Postseason (Freeze)
At conference tournament start (or end of regular season):
● Status: FROZEN
● No reclassification from small-sample variance
● Save season record as official identity:
○ Offense: Observed (Locked)
○ Defense: Observed (Locked)
○ Final Off Fit % / Def Fit % / Overall Fit %
○ Final system confidence %

● This saved identity feeds next season's preseason assignment
21. Status Labels (Locked)
Status Meaning
PROVISIONAL Preseason, using last year's systems, same coach, low
(Coach-Continuity) turnover
PROVISIONAL (High-Turnover) Preseason, using last year's systems, same coach, high
turnover
PROVISIONAL (New-Coach Preseason, using new coach's historical identity
Prior)
PROVISIONAL Preseason, no usable history, defaults loaded
(Unknown/Balanced)
OBSERVED (UNLOCKED) In-season, engine has run but dominance not achieved
OBSERVED (LOCKED) In-season, engine has run and dominance confirmed
DRIFT DETECTED In-season, one 5-game window diverged from locked
system
REOPENED In-season, two consecutive windows confirmed drift, fresh
classification cycle
FROZEN Postseason, no further reclassification, saved as official
record
22. Minimum Sample and Missing Data
● OSIE/DSIE may classify from a single game
● If < 40 half-court possessions: Primary System still returned, System Mix is mandatory,
Confidence capped at 65%
● If PlayVision missing → structure confidence reduced, PlayVision support triggers
unavailable
● If V1+ play-type data missing → force V1 fallback rules
● If all data partial → Primary + Mix, Confidence ≤ 50%
23. Governance Rules (Non-Negotiable)
The System Inference Engine may NOT:

● Modify player KRs or ratings
● Modify team KRs
● Affect usage or minutes
● Override archetypes
● Introduce simulation logic
● Change interaction math
The System Inference Engine outputs labels + confidence only.
All outputs are deterministic. Given the same inputs, the same system label, mix shares,
confidence values, and court depth classification are returned. There is no learning, tuning, or
adaptation.
UI / GOVERNANCE NOTE
Display and inference only. System identity values are produced by Nexus. No evaluation,
weighting, or normalization logic lives here.

Global Player + Team Database

Global Player + Team Database (Worldwide) — Locked
0. Global Master List (Database Table)
The Global Master List is the source-of-truth registry of all known basketball organizations
worldwide. It is maintained as a database table by Nexus, not as a governance document. The
former National Player Pool doc is retired — its content lives here as data.
Contains:
● Leagues / conferences / regions
● Teams inside each league
● Country / tier metadata
● "Independent / Unknown" buckets for teams outside formal league structures
Everything below references the Global Master List as the source-of-truth for what exists.
1. Team Master Record (Program-Season)
MUST PULL FROM: Global Master List
One row per team-season:
● Team / program identity (name, institution)
● League / conference / country
● Competitive level (from locked level list, Section 8)
● Conference (optional if league already implies it)
● Season year
2. Staff / Coach Record (Program-Season)
One row per team-season:
● Head coach identity
● Staff identity markers (assistants, when known)
● Continuity flags: same coach as prior season (yes/no)
● Coach-change flag: new hire, interim, mid-season change
● Roster turnover % (used by SIE Protocol for preseason system assignment)
3. System Identity Record (OSIE/DSIE)
MUST PULL FROM: System Inference Engine (merged doc)
Team-season system identity. No roster required.

● Offensive system label (from locked 11-system set)
● Defensive system label (from locked 9-system set)
● System confidence % (offense)
● System confidence % (defense)
● System Mix (if returned): systems + shares
● Offensive Pace Profile: PACE100 + Pace Band
● Defensive Court Depth: Full-Court / Three-Quarter / Half-Court
● Heliocentric Anchor Position (if applicable)
Status (from locked SIE status labels):
Status Meaning
PROVISIONAL (Coach-Continuity) Preseason, same coach, low turnover
PROVISIONAL (High-Turnover) Preseason, same coach, high turnover
PROVISIONAL (New-Coach Prior) Preseason, new coach's historical identity
PROVISIONAL (Unknown/Balanced) Preseason, no usable history
OBSERVED (UNLOCKED) In-season, dominance not achieved
OBSERVED (LOCKED) In-season, dominance confirmed
DRIFT DETECTED One 5-game window diverged
REOPENED Two consecutive windows confirmed drift
FROZEN Postseason, official record saved
Update cadence: Every 5 games. System identity does not change between checkpoints.
4. Current Roster Stack + Transfer Portal Feed
MUST PULL FROM: Global Master List
Continuously updated team-season state:
4.1 Roster (Game-by-Game Build)
● Current roster (all rostered players for this program-season)
● Participation / minutes per player (updated after every game)
● Usage % per player (actual from V2/V3, estimated from box score at V1/V1+, updated
after every game)
● Current season stats aggregates (updated after every game)
● Auto-run player evals → Player KR outputs (updated after every game):

○ Final_System_Off_KR
○ Final_System_Def_KR
○ Player eval mode (production-based vs full)
○ Player confidence_pct
○ Archetype assignment
○ Impact modifiers
○ Offensive archetype demand tier (A/B/C/No-match) for selected system
○ Defensive archetype demand tier (A/B/C/No-match) for selected system
● Auto-run Team KR outputs (updated after every game):
○ Team_Off_KR
○ Team_Def_KR
○ Team_KR (overall)
○ Offensive_Fit%
○ Defensive_Fit%
○ Overall_Fit%
○ Coverage Map (diagnostic object)
○ Missing Demands (diagnostic list)
○ Fragility Flags (diagnostic list)
○ Tier Label (from Level Interpretation)
○ team_kr_confidence_pct
○ coverage_confidence_pct
4.2 Transfer Portal Registry (Live View)
A live, continuously updated list of portal players:
● Portal entry event (timestamp)
● Current / previous team + level
● Class year / eligibility metadata (when available)
● Status: in-portal / withdrawn / committed
● Destination team (when committed)
● Source + verification
● Player KR at time of portal entry (snapshot)
● Archetype at time of portal entry
● System fit projections for inquiring programs (computed on demand when a coach
searches)
Views powered by Section 4:
● Roster view (current team roster with KRs, roles, minutes)
● Stats view (season stats, per-game, per-100 possessions)
● KR view (Player KRs, archetypes, system fit, confidence)
● Transfer Portal view (all portal players, filterable by position, archetype, KR range, level,
system fit)

5. Data Tier Record (Per Team-Season)
Tracks what data is available for each team, which determines evaluation precision and
confidence.
Tier What It Is Impact
V1 — Public box scores, roster Baseline. Production-based KR only.
Stats-Only minutes, estimated usage. Offensive weights use estimated usage.
Available for every organized Defensive weights use minutes + role
program. only. System inference uses proxy
signals. Confidence lowest.
V1+ — Stats + V1 + third-party play-type data. Bridge tier. Full classification triggers
Licensed Actual usage, shot profiles, available. No matchup tracking.
Granular possession-level efficiency. Not Defensive weights still minutes + role
owned by KaNeXT. only. Confidence between V1 and V2.
V2 — KaNeXT-owned camera data. High fidelity. Full evaluation. Matchup
PlayVision (1 Single season processed. Full importance activates in defensive
Season) play-type tagging, actual usage, weights. Year 1 on platform.
matchup assignment tracking,
spatial data.
V3 — Multiple seasons of PlayVision Highest fidelity. Trend analysis, system
PlayVision data + film archive. Full trend evolution, pattern recognition. Year 2+ on
Deep depth. platform. Confidence highest.
(Multi-Season)
Data tier is assigned per team-season and updates when new data sources become available
(e.g., PlayVision cameras installed mid-season upgrades V1 → V2 for remaining games).
6. Season Snapshot Timeline (History Ledger)
Saved checkpoints of Section 4 over time:
Post-game snapshots (after every game):
● Full roster state
● All player stats (season-to-date)
● All Player KRs
● Team KR (Off/Def/Overall)
● Team KR diagnostics (Fit%, Coverage Map, Missing Demands, Fragility Flags)
● Confidence values (player and team)
● Minutes / usage / participation weights

● "As-of date" timestamp
5-game checkpoint snapshots:
● Everything in post-game snapshot PLUS:
● System identity (OSIE/DSIE) status and labels
● System confidence %
● System Mix (if active)
● Drift flags
● Pace Profile / Court Depth
Transfer Portal snapshots:
● Portal state at each snapshot (who entered, withdrew, committed since last snapshot)
● Portal player KRs at time of status change
Purpose:
● Trend analysis (how has this team/player evolved over the season?)
● Audit trail (what did the system know at any given point?)
● Historical comparisons (this team vs last year's team at the same point in the season)
● "What we knew then" vs "what we know now" (post-hoc evaluation accuracy)
7. Game / Film Archive + Processor Layer
Game records + film links + processing status:
● Schedule + game IDs (linked to team master records for both teams)
● Film URLs (PlayVision replay layer when available)
● Processor outputs per game:
○ Play-type tags (offensive and defensive)
○ Shot-type classification
○ Possession-level efficiency data
○ Usage tracking (per player)
○ Matchup assignment tracking (per player, V2/V3 only)
○ Spatial data (V2/V3 only)
● Data tier assignment per game: V1 / V1+ / V2 / V3
● Processing status: unprocessed / processing / complete / error
Upgrade path: When PlayVision cameras are installed at a program, historical games can
begin processing. As games are processed, the data tier for those game records upgrades from
V1 → V2. When a full season of PlayVision data is processed, the team-season data tier
upgrades to V2. After 2+ seasons, V3. Confidence adjusts automatically as data tier improves.
8. Locked Competitive Levels (Global)

Pre-College (3)
● HS / Prep
● Postgrad
● AAU / Summer Circuits
College (US — 13 levels)
● NCAA D1 High-Major
● NCAA D1 Mid-Major
● NCAA D1 Low-Major
● NCAA D2
● NCAA D3
● NAIA
● NJCAA D1
● NJCAA D2
● NJCAA D3
● CCCAA
● USCAA
● NCCAA D1
● NCCAA D2
Pro / Overseas
● Professional (Domestic / Overseas)
These levels must match exactly across: Team KR Legend, Team KR Math (off/def split table),
Player KR Legend, System Inference Engine, and all downstream references.
9. Player Pool Scope
The Global Database contains every known basketball player worldwide. This is not aspirational
— it is the architectural requirement. Nexus is built to evaluate, store, and surface any player at
any level in any country.
What "every player" means:
● Every rostered player at every college program in the US (NCAA D1/D2/D3, NAIA,
NJCAA D1/D2/D3, CCCAA, USCAA, NCCAA D1/D2)
● Every rostered player at every professional and semi-professional league globally
● Every tracked high school, prep, and postgrad prospect
● Every AAU / summer circuit participant with available data
● Every transfer portal entrant
● Every international prospect with available data
How players enter the pool:

● Automatic ingestion from public roster feeds (college, pro)
● Transfer portal event triggers (portal entry creates or updates a record)
● Recruiting databases (HS/prep/postgrad/AAU)
● Manual entry (scouting staff, coach submission)
● International feeds (pro leagues, federation registries)
Every player record follows the Player Profile (Auto-Populated Record) schema.
Evaluation depth varies by data availability:
● V1 players: box score stats, basic profile. Production-based KR only.
● V1+ players: play-type data available from third party. Fuller KR possible.
● V2 players: PlayVision camera data (1 season). Full evaluation.
● V3 players: multi-season PlayVision. Highest confidence evaluation.
Players without enough data for any evaluation are stored as profile-only records (identity, roster
affiliation, career history) until data becomes available.
10. Update Cadence Summary
What Cadence Trigger
Player KR Every game Post-game stats ingestion
Team KR (Off/Def/Overall + Every game Updated Player KRs + minutes/usage
Diagnostics)
System Identity (OSIE/DSIE) Every 5 5-game checkpoint
games
System Confidence % Every 5 5-game checkpoint
games
System Role Multipliers + Coverage Every 5 Tied to system identity
Map demands games
Coverage Map coverage Every game Rotation/minutes may shift game to
assignments game
Fit% Every game Coverage recalculated with current
rotation
Fragility Flags Every game Weight distribution recalculated
Roster Stack Continuous Roster moves, portal events, game
logs

Transfer Portal Registry Continuous Portal entry/withdrawal/commitment
events
Season Snapshots (post-game) Every game Post-game save
Season Snapshots (checkpoint) Every 5 5-game checkpoint save
games
Data Tier Assignment On change PlayVision installation, new data
source added
Film Archive Processing Continuous New film uploaded, processing
complete
Between 5-game checkpoints:
● Player KRs and Team KR update every game using the latest data
● System role multipliers (A/B/C) stay constant because they're tied to the system label
which only updates at checkpoints
● Coverage map recalculates every game using current rotation against the same system
demands
● Fit% recalculates every game because rotation weights shift
● Larger recalculation occurs at each 5-game checkpoint if system identity shifts — new
system label means new demand profile, new A/B/C assignments, new coverage map,
potentially significant Team KR movement
11. Governance
● The Global Database is maintained by Nexus. No manual override of computed values
(KRs, system identity, confidence).
● Coach inputs (system selection for own team, minutes projections, scholarship/NIL
constraints) are the only human-entered data that affects downstream computation.
● All computed outputs are deterministic: same inputs → same outputs.
● The Global Master List (league/conference/team registry) is a living database table
updated as leagues form, dissolve, or restructure.
● Player records are never deleted — they are archived when a player retires, becomes
inactive, or has no current affiliation. Historical data persists for trend analysis and audit.
● The product flywheel: V1 is what everyone has. V2 is what you get when you join
KaNeXT. V3 is what you get when you stay. Data depth compounds over time.
UI / GOVERNANCE NOTE
Database schema only. All values are produced by Nexus. No evaluation, weighting, or
normalization logic lives here. This doc defines what is stored and how it updates — not how
values are computed.

Scholarship & NIL Allocation Engine

Scholarship & NIL Allocation Engine
0. Scope
This engine computes two values for every player: Player Team Value (PTV) — how much this
player improves THIS specific team — and Player Market Value (PMV) — how much the market
values this player's brand and visibility. The gap between PTV and PMV is the competitive edge:
it tells a coach where they're overpaying and where bargains exist.
This engine is downstream of Player KR + Team KR. It recommends only. Coach confirms all
allocations.
This engine does not modify any Player KR or Team KR.
PART 1: PLAYER TEAM VALUE (PTV)
1. Purpose
PTV answers: "What is this specific player worth to THIS specific team, given the coach's
system, the current roster's gaps, and the player's evaluation confidence?"
PTV is the basketball intelligence layer. Nobody else can compute this because nobody else
has system-specific player evaluation, team need coverage, and confidence-gated allocation
logic.
2. PTV Inputs
A) Player Truth MUST PULL FROM: Player Eval outputs
● Final_System_Off_KR
● Final_System_Def_KR
● Overall Player KR
● confidence_pct
● Archetype assignment
● Impact modifiers (if applicable)
B) Team Context MUST PULL FROM: Team KR Diagnostics (Section 10 of Team KR doc)
● Missing Demands (uncovered A/B/C demands)
● Fragility Flags (single-point failures, concentration)
● Coverage Map (what's covered, by whom)
● Fit% (offensive, defensive, overall)

● Current rotation participation weights
C) System Context MUST PULL FROM: Coach Context Setup
● Offensive system + defensive system
● Player's offensive archetype demand tier (A/B/C/No-match)
● Player's defensive archetype demand tier (A/B/C/No-match)
3. PTV Formula
PTV_Raw = Player_KR_Contribution × System_Importance × Need_Multiplier
× Confidence_Factor
3.1 Player_KR_Contribution
The player's weighted pull on Team KR. For current roster players, this is their actual offensive +
defensive weight × their Final System KRs. For prospects (portal, recruits), this is projected
using their KR against projected minutes share.
Player_KR_Contribution = (Final_System_Off_KR × Projected_Off_Weight)
+ (Final_System_Def_KR × Projected_Def_Weight)
Where projected weights use the Team KR weighting formula (usage/minutes/system role) with
estimated minutes.
3.2 System_Importance
Same A/B/C multipliers from Team KR:
Demand Tier Multiplier
A (Critical) 1.20
B (High) 1.00
C (Optional) 0.85
No match 0.70
Applied as the higher of the player's offensive or defensive demand tier (their most important
role to the team).
3.3 Need_Multiplier
How much does this player fill a gap the team currently has?

Condition Multiplier
Fills an uncovered A (Critical) demand 1.50
Fills an uncovered B (High) demand 1.25
Fills a covered demand (redundant but competent) 1.00
Fills an uncovered C (Optional) demand 1.10
Redundant to a higher-KR player at same 0.85
archetype
If a player fills multiple gaps, use the highest applicable multiplier.
3.4 Confidence_Factor
Lower confidence = higher allocation risk.
Confidence Factor
Range
90%+ 1.00 (no discount)
75–89% 0.95
60–74% 0.90
45–59% 0.85
Below 45% 0.75
3.5 PTV Normalization
After computing PTV_Raw for every player on the roster (or every prospect being evaluated):
PTV_Share_i = PTV_Raw_i / Σ PTV_Raw
PTV_Share represents what percentage of the team's total value this player represents. This
share drives allocation recommendations.
PART 2: PLAYER MARKET VALUE (PMV)
4. Purpose

PMV answers: "What does the market think this player is worth based on their social presence,
visibility, athletic performance, and existing deal flow?"
PMV is the brand/marketability intelligence layer. It estimates what a player could command in
the open NIL market regardless of team-specific fit. The inputs and structure are
research-backed. The category weights are tunable defaults that calibrate over time as real deal
data flows through the platform.
5. PMV Input Categories
5.1 Social Score (Default Weight: 40%)
The most predictive factor for NIL market value. Engagement rate matters more than raw
follower count — brands pay for conversions, not eyeballs.
KaNeXT Native Inputs:
● In-app follower count
● In-app engagement rate (likes, comments, shares per post)
● KayTV content views + completion rate
● Content creation frequency (posts per week/month)
● Community participation score (activity within institution's brand)
Cross-Platform Inputs (API-pullable from public profiles):
● Instagram followers + engagement rate
● TikTok followers + engagement rate
● Twitter/X followers + engagement rate
● YouTube subscribers + average views (if applicable)
● Cross-platform consistency bonus (strong on 2+ platforms vs strong on 1)
Within Social Score, engagement is weighted 2x vs raw follower count. A player with 5K
followers and 8% engagement rate scores higher than a player with 50K followers and 0.5%
engagement rate.
KaNeXT native vs external weighting: Starts at 50/50. As platform adoption grows and
KaNeXT becomes the primary social layer for college athletes, the native weight naturally
increases. This is not forced — it's a function of where the engagement actually lives.
5.2 Exposure Score (Default Weight: 25%)
How visible is this player to the broader market?
Inputs:

● School exposure tier: Power conference (SEC/Big Ten/ACC/Big 12/Big East) = highest,
mid-major = moderate, low-major/D2/NAIA = lower
● Conference TV deal visibility: nationally televised games per season
● Position marketability: guards and wings score higher than bigs (historically more
marketable)
● Postseason appearances: NCAA Tournament, conference tournament runs, national
championship game
● Market size: school location (major metro vs small town)
5.3 Performance Score (Default Weight: 20%)
Athletic accomplishment and recognition. This is where our system adds value On3 doesn't
have — we can use Player KR percentile as a performance input, not just awards.
Inputs:
● Player KR percentile within their level (top 5% at HM = highest score)
● Awards: All-American, Conference POY, All-Conference, national award watch lists
● Statistical milestones: scoring leader, double-double machine, etc.
● Draft stock (for players with pro potential): projected draft position from public mock
drafts
● Improvement trajectory: year-over-year KR improvement signals a rising stock
5.4 Deal Flow Score (Default Weight: 15%)
Proven market validation — what has the market already paid for this player?
Inputs:
● Number of existing verified NIL deals
● Total verified deal value (annualized)
● Deal value trend (increasing, stable, decreasing)
● Brand tier of partners (national brand vs local business)
● Collective support level at their school (schools with bigger collectives inflate baseline)
If no deal data exists (new player, lower level), Deal Flow Score defaults to 0 and the remaining
categories absorb its weight proportionally.
6. PMV Formula
PMV = (Social_Score × W_social) + (Exposure_Score × W_exposure) +
(Performance_Score × W_performance) + (Deal_Flow_Score × W_deal)
Default weights: W_social = 0.40, W_exposure = 0.25, W_performance = 0.20, W_deal = 0.15

Each sub-score is normalized to a 0–100 scale before weighting. The combined PMV score is
then converted to a dollar value using a market calibration factor derived from known deal data
across the platform.
Dollar conversion:
PMV_Dollar = PMV_Score × Market_Rate_Per_Point
Market_Rate_Per_Point is calibrated from actual deal data. Initial default is set from research
benchmarks (e.g., $0.80/follower/year as a baseline anchor), then adjusts as real transactions
flow through KayPay and the commerce layer.
7. PMV Calibration Mechanism
The PMV weights (40/25/20/15) are defaults. They adjust over time:
● Every quarter, the system analyzes completed NIL deals on the platform
● It measures which input categories best predicted actual deal value
● Weights shift toward the categories with the strongest predictive correlation
● Weight adjustments are bounded: no single category can exceed 50% or drop below
10%
● Calibration is automatic, deterministic, and auditable
● The system logs every weight change with the data that drove it
This is a competitive advantage: On3 built their algorithm once and tweaks manually. KaNeXT's
PMV learns from real deal outcomes on the platform continuously.
PART 3: GAP ANALYSIS
8. The Gap
For every player, the engine displays:
● PTV: what this player is worth to YOUR team (basketball intelligence)
● PMV: what the market thinks this player is worth (brand/social intelligence)
● Gap: PTV minus PMV
Gap Interpretation Coach Action
PTV >> PMV Undervalued by the market. This Acquire. You're getting basketball
(large positive player improves your team more value at a brand discount.
gap) than the market prices him.

PTV ≈ PMV Fairly priced. Market value aligns Standard decision — evaluate on other
(near zero) with team value. factors (culture, character, fit).
PMV >> PTV Overpriced by the market. You're Caution. The market is paying for
(large negative paying for brand, not basketball fit. social presence or school exposure,
gap) not for what this player does for your
specific team.
9. Gap Display (Coach-Facing)
For current roster players:
● PTV allocation recommendation (scholarship % + NIL $) based on PTV share
● PMV market estimate (what the open market would pay)
● Gap flag: UNDERVALUED / FAIR / OVERPRICED
● If overpriced: "Market is paying for [social/exposure/deal history]. Basketball value to
your team is lower."
● If undervalued: "This player fills [Critical/High demand] that your roster is missing. Market
hasn't caught up."
For portal/recruit prospects:
● Same PTV/PMV/Gap analysis
● Plus: "Projected Team KR impact: +X.X if added to rotation at Y minutes"
● Plus: "Fills [demand] that is currently [uncovered/under-covered]"
PART 4: ALLOCATION ENGINE
10. Scholarship Allocation
Inputs:
● Governing body / division (determines scholarship cap)
● Available scholarship equivalents (default cap or coach-adjusted)
● PTV_Share for each rostered player
Formula:
Recommended_Scholarship_Pct_i = PTV_Share_i ×
Total_Available_Equivalencies
Rules:

● Cap each player at 1.00 (full scholarship)
● If formula recommends > 1.00 for top player, cap and redistribute excess down the PTV
stack
● Coach can set minimums (e.g., "every scholarship player gets at least 25%")
● Total_Equivalencies_Used must be ≤ Available_Equivalencies
● Output: per-player recommended_scholarship_pct + total equivalents used
Priority tiers (display labels):
PTV Rank Label
Top 3 by PTV Core
4–7 by PTV Rotation
8–10 by PTV Depth
11+ by PTV Development
11. NIL Allocation
Inputs:
● NIL pool amount (annual/cycle, coach-entered)
● PTV_Share for each rostered player
● PMV for each player (market context)
● Coach priority mode (optional): Win-Now vs Development vs Balanced
Formula:
Base_NIL_i = PTV_Share_i × NIL_Pool
Market adjustment (optional):
If a player's PMV significantly exceeds their PTV-based allocation, the coach may need to pay
market rate to retain them (competitive pressure). The engine flags this:
● If PMV_Dollar > Base_NIL × 1.5: "Market pressure: [player] may require above-PTV
allocation to retain. PMV suggests $X."
● The engine recommends PTV-based allocation by default but surfaces the PMV as
context
Rules:
● Total_NIL_Used must be ≤ NIL_Pool
● If Win-Now mode: weight shifts toward high-PTV players (top-heavy allocation)

● If Development mode: weight shifts toward high-confidence-improvement players
● If Balanced (default): pure PTV share distribution
12. Constraints and Warnings
After computing allocations:
Condition Warning
A Critical (A) demand player is "Unfunded critical demand: [archetype]. This gap
unfunded or underfunded suppresses Team KR."
A low-confidence player receives "Allocation risk: [player] at [confidence]%. Evaluation
significant resources uncertainty is high."
Top 3 players receive > 60% of "Concentration warning: resource allocation is top-heavy."
total resources
A redundant player receives "Efficiency flag: [player] is redundant to [starter] but
more than a gap-filler receiving higher allocation."
PMV >> PTV for a player "Market premium warning: paying above basketball value
receiving large allocation for [player]. Consider reallocation."
Total allocation exceeds caps "Cap exceeded. Reduce allocations or increase budget."
Critical demand unfunded AND "Structural deficit: roster construction requires more
cap is exhausted resources than available. Portal or recruiting needed."
PART 5: HARD RULES
● All recommendations are deterministic given the same inputs
● This engine does not modify any Player KR or Team KR
● Scholarship and NIL recommendations must respect governing body caps
● Low-confidence allocations can be produced but must be flagged
● Coach confirms all allocations — the engine recommends, it does not execute
● PTV structure and inputs are locked
● PMV category structure is locked (Social / Exposure / Performance / Deal Flow)
● PMV category weights are tunable defaults (40/25/20/15) that calibrate from real deal
data
● PMV calibration is automatic, bounded (10–50% per category), and auditable
● Gap analysis is always displayed — PTV, PMV, and the gap are never hidden from the
coach

PART 6: GOVERNING BODY SCHOLARSHIP CAPS (REFERENCE)
Governing Body / Max Athletic Scholarship Equivalents (Men's
Division Basketball)
NCAA D1 13.0
NCAA D2 10.0
NCAA D3 0 (no athletic scholarships)
NAIA 8.0
NJCAA D1 15.0
NJCAA D2 15.0
NJCAA D3 0 (no athletic scholarships)
CCCAA 0 (no athletic scholarships, tuition is minimal)
USCAA Varies by institution
NCCAA D1 Varies (follows dual-affiliation rules)
NCCAA D2 0 or limited
These caps are the hard ceiling. The engine cannot recommend allocations exceeding the cap.
Coach can reduce available equivalents below the cap but cannot exceed it.
UI / GOVERNANCE NOTE
Recommendation engine only. All values are produced by Nexus. Coach confirms all
allocations. This engine does not execute transactions, modify KRs, or change roster status.
PTV is locked logic. PMV weights are tunable defaults that calibrate from platform deal data
over time.

Roster Decision Intelligence

ROSTER DECISION INTELLIGENCE
v2 — Tab within Basketball Team Intelligence
0. Purpose
This framework answers the team-builder's question: "If I add this player to my roster, what
happens to my Team KR — and is that change worth the resources?"
It consumes the existing Team KR Pipeline and runs it with different roster configurations to
show how each personnel decision changes the team's overall quality. The Team KR Delta IS
the answer. This framework does not invent parallel scoring systems.
The framework has five components:
1. Team Profile — snapshot of current roster state, system, gaps, fragility
2. Impact Projection — add candidate, re-run Team KR, show delta and explain why
3. Resource Analysis — is the delta worth the roster spot, scholarship allocation, and NIL
cost
4. Roster Continuity Planning — portal risk, insurance targets, redshirt management,
multi-year outlook
5. Decision Matrix — ranked output for all candidates by Team KR Delta
This framework operates at two levels:
● College Mode (v2): Portal search, recruiting, NIL valuation, scholarship allocation,
redshirt planning. All inputs from locked college intelligence docs.
● Pro Mode (v0 — Directional): Draft intelligence, free agency. Extrapolated until Pro
Team KR Pipeline is built.
1. Team Profile
Before evaluating any candidate, snapshot the team's current state. This is the baseline that all
impact projections reference.
1.1 Current Roster Snapshot

Run the full Team KR Pipeline (Steps 1–12 from Team Intelligence) on the current roster.
Capture:
● Current Team KR (overall, offense, defense)
● Starting 5 with individual KRs, archetypes, eligibility remaining
● Rotation (all players ≥5% minutes) with KRs and eligibility remaining
● Non-rotation roster (redshirts, developmental players, walk-ons) with KRs
● Offensive System (from OSIE or Coach Context)
● Defensive System (from DSIE or Coach Context)
● System Fit % (from Team KR Pipeline diagnostics)
● Coverage Map (which system demands are filled, by whom)
● Missing Demands (uncovered Tier A = Critical Gap, uncovered Tier B = Priority Gap)
● Fragility Flags (single-point failures, starter-backup gaps ≥10 KR)
1.2 Roster Composition
None
ROSTER COMPOSITION: [Team Name]
Level: [D1 / D2 / NAIA / D3 / JUCO]
Roster Spots: [Used] / [Max] (e.g., 14/15 at D1)
Scholarship Status: [see level-specific rules in Section 3.2]
ROTATION (contributing this season):
| # | Player | Pos | KR | Archetype | MPG | Elig Remaining |
Scholarship % | NIL |
|---|---|---|---|---|---|---|---|---|
| 1 | [name] | [pos] | [KR] | [arch] | [mpg] | [years] | [%] |
[$] |
| ... |
REDSHIRTS (on roster, not contributing this season):
| # | Player | Pos | KR | Projected Year-2 KR | Elig After
Redshirt | Scholarship % |
|---|---|---|---|---|---|---|
| 1 | [name] | [pos] | [KR] | [projected] | [years] | [%] |
OPEN SPOTS: [X roster spots available]
1.3 Gap Summary

None
TOP NEEDS (ranked by Team KR impact):
1. [Position / Role / Specific Demand] — WHY: [what's missing and
what it costs]
2. [Position / Role / Specific Demand] — WHY: [explanation]
3. [Position / Role / Specific Demand] — WHY: [explanation]
DEPARTURES EXPECTED (eligibility exhausting, likely draft
declares, portal risks):
- [Player] — [reason] — KR lost: [X] — Position gap created: [Y]
- [Player] — [reason] — KR lost: [X] — Position gap created: [Y]
2. Impact Projection
For each candidate player:
2.1 Add Player to Roster
Insert the candidate into the roster at their projected position and minutes allocation. Determine:
● Who they displace (the player who loses the most minutes)
● What the new rotation looks like
● Whether they start, come off the bench, or redshirt
2.2 Re-Run Team KR
Run the full Team KR Pipeline (Steps 1–12) on the new roster with the candidate included and
minutes adjusted. Capture:
● New Team KR (overall, offense, defense)
● New System Fit %
● New Coverage Map
● New Fragility Flags
2.3 Compute Delta
Metric Before After Delta
Team KR (Overall) [X] [Y] [+/- Z]

Team Off KR [X] [Y] [+/- Z]
Team Def KR [X] [Y] [+/- Z]
System Fit % [X] [Y] [+/- Z]
Critical Gaps Filled [count] [count] [+/- Z]
Fragility Flags [count] [count] [+/- Z]
The Team KR Delta is the single most important number.
2.4 Explain the Delta
If positive delta — explain what improved:
● Which coverage gaps did this player fill?
● Which system demands moved from uncovered to covered?
● Which lineup combinations became viable that weren't before?
● Did the player raise the offensive ceiling, defensive ceiling, or both?
● How does this player interact with existing players? (Complement, coexist, or conflict?)
If negative or neutral delta — explain what went wrong:
● What redundancy was created?
● What weakness was compounded?
● What system demand is over-covered while another remains uncovered?
● Is the displaced player actually better for THIS system?
● Does the candidate's presence make an existing player worse?
Key interactions to always check:
● Does the candidate's shooting (or lack) change team spacing geometry?
● Does the candidate's defense (or lack) change what defensive scheme the team can
run?
● Does the candidate require the ball, and if so, who gives up touches?
● Does the candidate unlock new positional flexibility (e.g., small-ball lineups)?
2.5 Displacement Report
None
DISPLACED PLAYER: [Name]
Previous Role: [Starter / Key Rotation / Bench]
New Role: [Backup / Reduced Minutes / Off Rotation]

Minutes Change: [X] MPG → [Y] MPG
DISPLACEMENT QUALITY:
- Candidate KR vs Displaced KR: [+/- X]
- Clear upgrade? [Yes / Marginal / Lateral / Downgrade]
CASCADE EFFECTS:
- New gap created? [Yes / No — explain]
- Displaced player value in different role? [Yes / No — explain]
- Bench depth change? [Improved / Neutral / Weaker]
2.6 Multi-Candidate Comparison
When evaluating multiple candidates for the same need:
None
CANDIDATE COMPARISON: [Team Name] — [Position/Need]
| Metric | Candidate A | Candidate B | Candidate C |
|---|---|---|---|
| Individual KR | [X] | [X] | [X] |
| Team KR Delta | [+/- X] | [+/- X] | [+/- X] |
| New Team KR | [X] | [X] | [X] |
| Gaps Filled | [list] | [list] | [list] |
| Gaps Created | [list] | [list] | [list] |
| Displaces | [who] | [who] | [who] |
| Key Interaction | [1 line] | [1 line] | [1 line] |
| NIL Cost | [$] | [$] | [$] |
| Eligibility | [years] | [years] | [years] |
The candidate with the highest Team KR Delta is the best player FOR THIS TEAM —
regardless of raw individual KR.
2.7 Pro Mode Adaptation
At the pro level, the full Pro Team KR Pipeline doesn't exist yet. In Pro Mode (v0):

● Use Pro Projection KR from the Pro Transition Engine
● Estimate Team KR impact directionally using Pro System Mapping (Section 6) and roster
gap analysis
● Flag output as DIRECTIONAL — estimated, not computed from a governed pipeline
● Upgrades to full computation when Pro Team KR Pipeline is built
3. Resource Analysis
3.1 Three Independent Resource Layers
Adding a player at the college level involves three independent resource decisions:
Layer 1: Roster Spot (Coach's decision, NCAA-governed) Does this player get one of our
limited roster spots? This is the hard constraint — the NCAA caps roster size. Everything else
flows from having a spot.
Layer 2: Scholarship Allocation (Coach/AD decision, budget-governed) How much
scholarship aid does this player receive? The rules vary by level, but the allocation is a financial
decision within institutional budget constraints.
Layer 3: NIL Compensation (Collective/Admin decision, pool-governed) How much NIL
money does it take to land this player? This is a separate financial pool from scholarships —
funded by collectives, boosters, and/or the institution's revenue-sharing allocation (post-House
settlement). Revenue sharing is simply one funding source that feeds the NIL pool; it is not a
separate decision layer.
All three must align to land a player. The Team KR Delta informs all three decisions but each
has its own decision-maker and constraints.
3.2 Roster & Scholarship Rules by Level (Post-House Settlement, 2025-26)
CRITICAL CHANGE: The House v. NCAA settlement (effective July 1, 2025) eliminated
scholarship caps for D1 and replaced them with hard roster limits. All D1 sports are now
technically equivalency sports — coaches CAN offer partial scholarships. However, the practical
reality varies dramatically by sport.
D1 Men's Basketball:
Resource Rule Practical Reality

Roster spots 15 maximum This is the binding constraint. You cannot have more than
(hard cap, 15 players.
NCAA-enforced
)
Scholarship 15 (can be split In practice, every scholarship D1 basketball player
equivalencies into partial receives a full ride. No D1-caliber basketball talent
awards) would accept a partial scholarship — the market doesn't
work that way. The equivalency flexibility exists on paper
but is functionally irrelevant for basketball at the D1 level.
Walk-ons Can exist within With only 15 spots, walk-ons are rare. Most D1 programs
the 15 roster scholarship all 15. Some programs carry 13-14
spots scholarship players + 1-2 preferred walk-ons.
NIL Separate pool, Varies wildly: $500K pools at low-major to $20M+ at
no NCAA cap Kentucky. The NIL decision is the true variable cost at
D1.
The D1 basketball coach's real decision: "Is this player worth 1 of my 15 roster spots? If yes,
they get a full scholarship automatically — that's table stakes. The question is how much NIL it
takes to land them."
D2 Men's Basketball:
Resource Rule Practical Reality
Roster spots ~19-20 typical Larger rosters than D1. More players, fewer full
(varies by scholarships.
institution)
Scholarship 10.0 (must be This is where equivalency ACTUALLY matters. Coaches
equivalencies split) distribute 10 full equivalencies across 19-20 players. A
starter might get 85-100%, a bench player 40-60%, a
walk-on contributor 10-25%. The allocation decision is
genuinely strategic.
NIL Exists but NIL is a factor at D2 but the dollars are dramatically
much smaller smaller. Most D2 players are making decisions based on
pools scholarship percentage + academic aid, not NIL.
The D2 coach's real decision: "How much of my 10.0 equivalencies do I allocate to this
player? Is one player at 100% better than two players at 50% each? The system should show
the Team KR impact of both allocation scenarios."

NAIA Men's Basketball:
Resource Rule Practical Reality
Roster spots Varies by institution Similar to D2 in structure.
Scholarship 8.0 Same equivalency model as D2 but with fewer
equivalencies total equivalencies, making each allocation
decision more constrained.
NIL Minimal to Scholarship allocation is the primary financial
non-existent at most lever.
programs
D3 Men's Basketball:
Resource Rule Practical Reality
Roster spots Varies by No athletic scholarship constraint governs roster
institution size.
Scholarship 0 (no athletic Players attend for academic aid, need-based aid,
equivalencies scholarships) and/or love of the game. The coach's only lever is
the roster spot itself.
NIL Minimal Essentially non-existent at D3.
The D3 coach's decision is purely basketball: "Does this player make the team better? If yes,
roster spot. If no, cut."
JUCO:
Resource Rule Practical Reality
D1 JUCO Up to 15 Most JUCO players receive close to full rides because the
equivalencies cost of attendance is low.
D2/D3 Varies, partial or Similar to D2/NAIA equivalency model.
JUCO none
3.3 Equivalency Tradeoff Analysis (D2/NAIA Only)
At D2 and NAIA, the equivalency allocation is a real strategic decision. The framework should
always show the tradeoff:

None
EQUIVALENCY TRADEOFF: [Team Name]
Total Equivalencies: [X.X of 10.0 remaining]
Option A: [Player] at [X]% → Team KR Delta: +[Y]
Option B: [Player 1] at [X₁]% + [Player 2] at [X₂]% → Combined
Delta: +[Y']
Same equivalency consumed. Which produces higher Team KR?
RECOMMENDATION: [A or B] — [1-line explanation]
3.4 NIL Analysis
NIL is a separate resource pool from scholarship. It applies at all levels but matters most at D1
where scholarship is table stakes and NIL is the competitive differentiator.
NIL Pool Inputs:
● Total NIL budget available (from all sources: collective, revenue-sharing, institutional,
third-party deals)
● NIL already committed to current roster
● NIL remaining for new acquisitions
● Player's asking price or market rate
NIL Efficiency:
NIL_Cost_Per_TKR_Point = NIL_Amount / Team_KR_Delta
NIL Scenario Analysis (always show alternatives):
None
NIL SCENARIO ANALYSIS: [Team Name]
Scenario A: Sign [Player] at $[X]M
→ Team KR Delta: +[Y]
→ Budget remaining: $[Z]M ([%])
→ Can still afford: [other realistic targets]
Scenario B: Pass, allocate $[X]M across [2-3 targets]

→ Combined Team KR Delta: +[Y']
→ Budget remaining: $[Z']M
→ Higher or lower total delta than Scenario A?
Scenario C: [if applicable — different allocation mix]
3.5 Duration Value
A multi-year player is worth more than a 1-year rental because you don't have to replace them
and re-invest next year.
Years of Eligibility Remaining Value Multiplier
1 year (senior / final year) 1.0x
2 years 1.5x
3 years 2.0x
4 years (incoming freshman) 2.5x
Duration-Adjusted Value = Team_KR_Delta × Duration_Multiplier
This applies to all resource decisions:
● D1 scholarship: A freshman uses a spot for 4 years; you don't recruit that position
again.
● D2/NAIA equivalency: A multi-year player at 60% scholarship is more efficient than
replacing a one-year player at 80% annually.
● NIL: A sophomore at $500K/year for 3 years may be better total value than a senior at
$2M for 1 year.
3.6 Combined Resource Output
None
RESOURCE ANALYSIS: [Team Name] — Adding [Player Name]
Level: [D1 / D2 / NAIA / D3 / JUCO]
ROSTER SPOT:
Spots Used: [X of 15] (D1) OR [X of ~20] (D2/NAIA)

Open Spots: [X]
This Player Consumes: 1 spot
Spots Remaining After: [X]
SCHOLARSHIP: (D1: full ride — standard / D2-NAIA: [X]% of
equivalency)
Equivalency Remaining: [X.X of 10.0] (D2/NAIA only)
NIL:
Player Asking Price: $[X]
NIL Pool Remaining: $[X]
NIL Cost Per TKR Point: $[X] / +[delta] = $[Z] per point
Budget % Consumed: [X%]
TEAM KR IMPACT:
Current Team KR: [X]
Projected Team KR: [Y]
Delta: +[Z]
Duration: [X years eligibility]
Duration-Adjusted Value: [delta × multiplier]
VERDICT: [TARGET / STRONG ADD / SOLID ADD / DEPTH ADD / PASS /
AVOID]
3.7 Pro Mode Cost (v0)
At the pro level, costs are governed by salary cap, draft pick value, and contract structure per
the NBA CBA. The framework needs the Pro Team KR Pipeline to produce accurate deltas
before cost efficiency is meaningful. Until then, Pro Mode cost analysis is directional.
Pro Cost Input Source
Draft pick opportunity cost Value of the pick slot (higher picks = more value)
Rookie scale salary Fixed by CBA based on draft position
Cap space consumed Salary against the cap

Contract duration Rookie deals: 4 years (2 guaranteed + 2 team
options)
4. Roster Continuity Planning
In the portal era, roster construction is continuous — not a one-time offseason event. Players
can leave every spring. Coaches need to manage current-season performance AND
future-season risk simultaneously.
4.1 Fragility Exposure
For each rotation player, compute the departure damage — how much the Team KR drops if
they leave:
None
FRAGILITY EXPOSURE: [Team Name]
| Player | Pos | KR | Elig Left | Portal Risk | Departure TKR
Impact | Backup KR | Gap Severity |
|---|---|---|---|---|---|---|---|
| [name] | [pos] | [KR] | [years] | [Low/Med/High] | -[X] Team KR
| [backup KR] | [Critical/Moderate/Minor] |
| ... |
MOST FRAGILE POSITION: [position] — if [player] leaves, Team KR
drops [X] points
MOST REPLACEABLE POSITION: [position] — backup is within [X] KR
of starter
Portal Risk Indicators:
● High: 1 year of eligibility remaining (graduating/draft-eligible), NIL below market rate,
limited playing time, known to have explored options previously
● Medium: 2 years remaining, adequate NIL, starting role but coach relationship uncertain
● Low: 3-4 years remaining, strong NIL, defined role, publicly committed to program
4.2 Insurance Planning

For each High or Medium portal-risk player, identify insurance targets — players in the portal,
recruiting class, or existing roster who could absorb the minutes and role if the at-risk player
departs:
None
INSURANCE PLAN: [At-Risk Player]
Position: [pos] | KR: [X] | Portal Risk: [High/Medium]
If they leave, Team KR drops: -[X]
INSURANCE OPTIONS:
1. [Portal player] — KR [X], would recover [Y%] of lost Team KR,
NIL cost: $[Z]
2. [Current backup] — KR [X], would recover [Y%] if promoted to
starter
3. [Incoming recruit] — Projected KR [X], available if redshirt
is burned
4. [No viable insurance] — this departure would be catastrophic,
must retain
RECOMMENDATION: [Proactive action — retain via NIL increase /
recruit insurance / accept risk]
4.3 Redshirt Management
A redshirted player consumes 1 roster spot and (at D1) a full scholarship, but contributes zero
to current-season Team KR. The coach is investing a spot in future value.
When to redshirt (system recommendation):
The framework should recommend a redshirt when ALL of the following are true:
● The player's current KR is below the rotation threshold (they wouldn't play meaningful
minutes this season)
● The player's projected KR after 1 year of development is ≥10 points higher than current
(significant improvement expected)
● The roster spot is not urgently needed for a contributor this season (team has depth at
this position)
● The player has 4 years of eligibility (maximizes the duration value of the redshirt
investment)
When NOT to redshirt:

● The roster spot is needed for an immediate contributor (team is thin at this position)
● The player is close to rotation-level now and game experience would accelerate
development more than practice
● The player has only 2-3 years of eligibility (redshirting a junior transfer wastes a year of a
short window)
Redshirt Value Computation:
None
REDSHIRT ANALYSIS: [Player Name]
Current KR: [X]
Current rotation contribution: [None / Minimal — Y MPG]
Projected KR after redshirt year: [X + development] (from
Development Intelligence Engine)
Years of eligibility after redshirt: [X]
VALUE OF REDSHIRTING:
- Roster spot cost this season: 1 of 15 (produces 0 Team KR
delta)
- Projected Team KR delta NEXT season: +[Y] (when player enters
rotation)
- Duration remaining after redshirt: [X years]
- Total projected value: [delta × duration multiplier]
VALUE OF PLAYING NOW:
- Projected Team KR delta THIS season: +[Y] (small, bench
minutes)
- Development rate: [slower/faster] with game reps vs
practice-only
- Risk: [uses a year of eligibility for minimal contribution]
RECOMMENDATION: [Redshirt / Play] — [reasoning]
4.4 Multi-Year Roster Outlook
The framework should show not just this season's roster but a 2-3 year projection:

None
MULTI-YEAR ROSTER OUTLOOK: [Team Name]
THIS SEASON (2025-26):
Team KR: [X] | Roster spots used: [X/15]
Starters: [list with eligibility]
Key contributors: [list with eligibility]
NEXT SEASON (2026-27) — PROJECTED:
Departures (eligibility exhausted): [list with KR lost]
Departures (likely draft/portal): [list with KR lost,
probability]
Returning core: [list with projected KR after development]
Incoming commitments: [list with projected KR]
Redshirts entering rotation: [list with projected KR]
Projected Team KR: [range]
Projected gaps: [positions/roles that need filling]
SEASON AFTER (2027-28) — DIRECTIONAL:
[Higher-level view of who's left, what the program arc looks
like]
ROSTER CONSTRUCTION PRIORITY:
- This season: [win now / develop / both]
- Next season: [what you need to recruit for NOW to be ready]
- Long-term: [program trajectory — ascending / sustaining /
rebuilding]
This multi-year view prevents the Kentucky problem — spending $22M on a single season
without thinking about what the roster looks like next year when half of them leave.
5. Decision Matrix Output
5.1 The Board
For each team, the Decision Matrix re-ranks available players by Team KR Delta.

None
DECISION MATRIX: [Team Name]
Level: [D1 HM / D2 / NAIA / etc.]
Current Team KR: [Overall] (Off: [X] / Def: [X])
System: [Offense] / [Defense]
Top 3 Needs: [list]
Open Roster Spots: [X]
NIL Budget Remaining: [$X]
RANK | PLAYER | IND KR | TKR DELTA | NEW TKR | FILLS | DISPLACES
| NIL COST | COST/PT | ELIG | VERDICT
1 | [name] | [KR] | +[X] | [TKR] | [gap] | [who]
| [$] | [$/pt] | [yr] | [verdict]
2 | ...
3 | ...
TOP RECOMMENDATION:
Player: [name]
Why for THIS team: [2-3 sentences on specific roster interaction]
Team KR Impact: [current] → [projected] (+[delta])
Displaces: [who] — Net effect: [explanation]
Resource cost: [1 roster spot + full scholarship (D1) / X%
equivalency (D2)] + $[NIL] for [Y years]
Key Risk: [the one thing that could go wrong]
ALTERNATIVE:
Player: [name]
Why instead: [1-2 sentences on different strategic bet]
Team KR Impact: [current] → [projected] (+[delta])
5.2 Verdict Categories
Verdict Meaning
TARGET Highest Team KR Delta at efficient cost. Fills a critical gap. Pursue
aggressively.

STRONG ADD Meaningful Team KR Delta at reasonable cost. Pursue if TARGET
unavailable.
SOLID ADD Moderate Team KR Delta. Fills a need without transforming the
team.
DEPTH ADD Small Team KR Delta. Fills backup/depth need. Low-cost only.
REDSHIRT Low current-season impact but high projected future value. Invest
CANDIDATE the roster spot for year 2+.
PASS Minimal Team KR Delta. Poor fit or overpriced relative to
alternatives.
AVOID Negative Team KR Delta. Makes the team worse through
redundancy or compounding weakness.
6. Pro System Mapping (v0 — Directional)
Until the full Pro OSIE/DSIE is built, the following mapping provides directional guidance for Pro
Mode Impact Projections.
6.1 NBA Offensive Scheme Archetypes
NBA Description Primary Demands Example Teams
Scheme
Spread PnR dominant. 3+ PnR Engine, Spot-Up OKC, Cleveland,
PnR shooters. Ball-handler Shooters, Roll/Stretch 5 Boston
creates.
Motion / Ball movement. Off-ball Connectors, Denver, Golden
Flow cutting. Player-initiated Point-Forward/Center hub, State, Indiana
reads. Movement Shooters
Pace and Extreme transition. Score Speed, Conditioning, Sacramento,
Space in 8 seconds or early Transition Finishing, Quick Atlanta
offense. Decisions
ISO / 1-2 stars create. Everyone Primary Engine, 3-and-D Dallas, Phoenix
Star-Drive else spaces and defends. Wings, Stretch Big
n

DHO / Dribble handoff actions. Stretch 5, Off-Ball Shooters, Miami, some
Handoff Stretch bigs who handle + Cutters Boston
shoot.
6.2 NBA Defensive Scheme Archetypes
NBA Description Primary Demands Example Teams
Scheme
Switch Every screen switched. All Switchable Defenders, Lat Boston, OKC,
Everything 5 guard multiple positions. Quickness, Versatility Golden State
Drop Center drops on PnR. Elite Rim Protector, Cleveland, Utah
Coverage Guards fight through. Disciplined POA Guards (Gobert era)
Blitz / Trap Double ball-handler on Elite Rotators, Active Miami, some
PnR. Rotate behind. Hands, Communication Memphis
Contain and Stay home. Contest every Discipline, Length, Denver, Dallas
Contest shot. Win by discipline. Rebounding, Team Defense
IQ
6.3 Pro Archetype Demand Shifts
Archetype College Pro Tier Directio Why
Tier n
3-and-D Wing B A ↑ Every NBA team needs 2-3.
Stretch Big B-C A-B ↑ Spacing at 4/5 is premium.
Switch Big B A (switch ↑ Switch defense demands
schemes) versatile bigs.
POA Defender B A-B ↑ On-ball defense premium at
Guard pro.
Anchor Big A B-C ↓ Must be elite or irrelevant.
(rim-only)
Roll Man A-B B-C ↓ Pure rollers are replaceable at
pro.
Offensive Big (no B-C Avoid ↓↓ Unplayable in playoff
D) basketball.

7. Governance
7.1 What This Framework Does
● Profiles team roster state with gaps, fragility, and multi-year outlook
● Runs Team KR with candidate added and shows delta with explanation
● Separates resource analysis into roster spot, scholarship, and NIL layers
● Models redshirt decisions with current vs future value computation
● Plans for portal-era roster continuity with insurance targets
● Produces ranked Decision Matrix per team
7.2 What This Framework Does NOT Do
● Invent KR modifiers or parallel scoring. ALL KR computation flows through locked
pipelines.
● Override Player KR or Team KR. Both are locked truth.
● Predict which players will transfer or declare for the draft. It models the exposure if they
do.
● Make the decision. It recommends. The human decides.
7.3 Authority Chain
None
Player KR (from Player Intelligence)
↓ consumed by
Team KR Pipeline (from Team Intelligence)
↓ consumed by
Roster Decision Intelligence (this framework)
↓ produces
Decision Matrix + Recommendation + Continuity Plan
↓ consumed by
GM / Coach / AD (human decision)
No layer overrides the layer above it.
7.4 Dependencies
Document What This Framework Consumes
Player Intelligence (all tabs) Individual KR, archetype, trait vector, system
risks, badges

Pro Transition Engine (Development Pro Projection KR for draft candidates
Intelligence)
Development Intelligence Engine Development projections for redshirt value
computation
Team KR Pipeline (Team Intelligence) Team KR computation, coverage map,
diagnostics
System Profiles (Player Intelligence) Offensive/defensive system demand profiles
OSIE / DSIE (Team Intelligence) System identification
Scholarship & NIL Allocation (Team Budget constraints, allocation rules
Intelligence)
Pro System Mapping (Section 6, this doc) Directional pro scheme mapping (v0)
7.5 Future Build Requirements (Pro Mode v0 → v1)
Component What It Adds
Pro OSIE NBA offensive system taxonomy with governed demand profiles
Pro DSIE NBA defensive system taxonomy
Pro Interaction Library NBA system-vs-system interaction data
Pro Team KR Pipeline Team KR computation calibrated for NBA rosters
Pro Matchup NBA matchup modifiers, playoff weighting
Governance
Empirical cost calibration Real NIL + salary data to validate benchmarks
7.6 Versioning
v1: Initial framework with parallel modifier system. v1.1: Removed parallel modifiers — all fit
derived from Team KR re-computation. v2: Complete rewrite. Fixed scholarship rules to reflect
post-House settlement reality (D1 = 15 roster spots, full scholarship is market standard,
equivalency splitting relevant at D2/NAIA only). Added redshirt management with current vs
future value computation. Added roster continuity planning (fragility exposure, insurance targets,
multi-year outlook). Added REDSHIRT CANDIDATE verdict category. Separated resource
analysis into three layers (roster spot / scholarship / NIL). Consolidated revenue sharing as NIL
pool input.