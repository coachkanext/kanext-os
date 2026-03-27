Development

Development Intelligence Engine (Locked)
0. Purpose
The Development Intelligence Engine is the final downstream consumer of the KaNeXT
Basketball Intelligence System. It takes everything the system knows about a player — their
evaluation, their archetype, their system fit, their confidence — and translates it into actionable
intelligence for placement, development, and decision-making.
It answers five questions for any evaluated player in the system:
1. Where are you now? — Truth summary across every level and system
2. Where should you be? — Best-fit targets ranked by actual team impact
3. What are you worth there? — Value at each target (PTV, scholarship/NIL implication)
4. What's the gap? — Specific traits holding you back, with exact deltas needed
5. What's the path? — Prioritized development roadmap with projected impact
This engine does NOT evaluate players. It does NOT modify Player KR, Team KR, archetypes,
system identity, or any upstream output. It reads governed truth and produces downstream
recommendations only.
All outputs are deterministic: same inputs → same outputs.
1. Consumers
The Development Intelligence Engine serves multiple users viewing the same player from
different angles:
● The player — "Where should I transfer? What should I work on? What am I worth?"
● The player's current coach — "How do I develop this player? What's his ceiling?
Where does he project if he improves?"
● Recruiting coordinators — "Does this player fit our system? Does he fill our gaps?
What's he worth to us vs other targets?"
● Transfer portal decision-makers — "Which portal players improve our Team KR the
most? Who's undervalued?"
● High school / prep / JUCO advisors — "What level should this kid play at? Which
programs are the best fit?"
● Pro scouts — "Where does this player project at the professional level? What needs to
develop?"

Same engine, same outputs, different decisions made from them.
2. MUST PULL (Inputs)
A) Player Identity + Record
MUST PULL FROM: Player Profile (Auto-Populated Record)
● Player name, identity, demographics
● Career history (schools, levels, seasons played)
● Current roster affiliation (if any)
● Eligibility status and remaining eligibility
● Class year / age
● Transfer portal status (if applicable: in-portal, withdrawn, committed)
● Recruiting classification (if applicable: HS class year, star rating from external sources)
B) Player KR Outputs (Truth)
MUST PULL FROM: Player Evaluation Pipeline (finalized outputs)
● Final_System_Off_KR (for current system context)
● Final_System_Def_KR (for current system context)
● Overall Player KR
● Base KR (pre-system-fit, locked truth)
● Player confidence_pct (from Player Confidence Gate)
● Evaluation mode (Full eval vs Production-based)
● Data tier (V1 / V1+ / V2 / V3)
C) Archetype + Badges + Impact Modifiers
MUST PULL FROM: Archetype Library, Badge Spec, Impact Modifier outputs
● Primary archetype assignment (from 21 locked archetypes)
● Secondary archetype(s) (if qualified for multiple)
● Badge list (bronze / silver / gold)
● Impact modifiers (if any)
● System risks (if any)
D) Full System Fit Profile
MUST PULL FROM: System Fit computation layer

● Offensive system fit score for ALL 12 offensive systems (not just the current coach's
selection)
● Defensive system fit score for ALL 10 defensive systems
● For each system: fit %, demand tier (A/B/C/No-match), and which demands the player
covers
This is critical. The current coach's system gives ONE system fit score. The Development
Intelligence Engine needs ALL 22 system fit scores to find where this player fits BEST across
the entire universe of programs.
E) Trait Scores (Raw)
MUST PULL FROM: Trait Library (54 traits, 7 clusters)
● All scored traits with current values
● Unscored traits flagged
● Cluster-level summaries (Shooting, Creation, Finishing, Playmaking, Defense,
Physicality, IQ)
Required for: Gap Analysis and Development Roadmap (computing which trait improvements
produce the largest KR lift).
F) Level Interpretation
MUST PULL FROM: Player KR Legend (all competitive levels) + KLVN normalization
● Player's KR tier label at EVERY competitive level (D1 HM, D1 MM, D1 LM, D2, D3,
NAIA, NJCAA D1/D2/D3, CCCAA, USCAA, NCCAA D1/D2, Professional)
● This shows the same player might be "Tournament Team starter" at D1 HM but "National
Title Favorite anchor" at D2
G) Team / League Universe
MUST PULL FROM: Global Database (Global Master List + Team Master Records)
● All leagues, conferences, teams, and their level tags
● Staff/coach records (coaching continuity, system history)
● Every team's current roster stack (who's there now)
H) Team System Identity
MUST PULL FROM: System Identity Record (OSIE/DSIE) for every team in the database
● Offensive system label + confidence
● Defensive system label + confidence

● System status (Provisional / Observed / Locked / Frozen)
I) Team KR Diagnostics (for every potential target)
MUST PULL FROM: Team KR Pipeline outputs (per team)
● Team_Off_KR, Team_Def_KR, Team_KR
● Coverage Map (which demands are covered, by whom)
● Missing Demands (uncovered A/B/C demands)
● Fragility Flags (single-point failures, concentration)
● Fit %
J) Scholarship / NIL Context (if available)
MUST PULL FROM: Scholarship & NIL Allocation Engine
● PTV (Player Team Value) at target teams — what this player is worth to THAT specific
team
● PMV (Player Market Value) — what the market values this player at
● Gap (PTV vs PMV) — undervalued or overpriced at each target
● Scholarship availability at target programs (if known)
● NIL pool estimates at target programs (if known)
K) Transfer Portal + Recruiting Pool (Competitive Context)
MUST PULL FROM: Global Database (Transfer Portal Registry + Recruiting databases)
● Other players in the portal or recruiting pool with similar archetypes
● Their KR, archetype, system fit profiles
● Where they've committed or are considering
● How they compare to the subject player
3. Outputs
OUTPUT A: Player Truth Summary — "Where Are You Now?"
A complete snapshot of the player's current evaluated state, translated into plain language.
A1) KR Identity Card
● Overall Player KR (with confidence %)
● Offensive KR / Defensive KR breakdown
● Base KR (system-neutral truth) vs System KR (current context)

● Archetype: primary + secondary (if applicable)
● Badges: list with tier (bronze/silver/gold)
● Impact Modifiers: list (if any)
● System Risks: list (if any)
● Data tier: V1 / V1+ / V2 / V3
● Evaluation mode: Full eval vs Production-based
A2) Level Tier Map
For every competitive level, show what this player's KR means:
Level KR Tier Label Interpretation
D1 High-Major e.g., "Rotation Player" Functional contributor, not a starter
D1 Mid-Major e.g., "Tournament Team Starter" Clear starter on a tournament-quality
team
D1 Low-Major e.g., "Conference POY Best player on most teams at this level
Candidate"
D2 e.g., "National Title Anchor" Dominant player at this level
NAIA e.g., "Best in Division" —
NJCAA D1 e.g., "D1 Transfer Pipeline" Ready to step up
... ... ...
This gives the player and their advisor an instant picture: "I'm a role player at HM but a star at
MM and dominant at D2."
A3) System Fit Heat Map

Show the player's fit score across ALL 22 systems (12 offense × 10 defense, displayed as a
matrix or ranked list):
● Top 3 best-fit offensive systems (with fit % and demand tier)
● Top 3 best-fit defensive systems (with fit % and demand tier)
● Bottom 3 worst-fit systems on each side
● "Sweet spot" systems where the player fills A-tier demands
This answers: "What kind of team should I play for?" before even looking at specific programs.
OUTPUT B: Placement Targeting — "Where Should You Be?"
Ranked list of best-fit programs/teams across the entire Global Database, sorted by how much
this player would improve that team.
B1) Best-Fit Colleges / Programs
For each target (top 20–50 results, filterable by level/conference/region):
● Target team / program name
● Competitive level (D1 HM/MM/LM, D2, D3, NAIA, NJCAA, etc.)
● Conference
● Current Team KR + tier label
● Offensive system + Defensive system (from OSIE/DSIE)
● Player's system fit % at that program (offense + defense)
● Player's archetype demand tier at that program (A/B/C/No-match)
● Demand Match — does this player fill an UNCOVERED demand? Which one?
● Projected Team KR Impact — if this player joins the rotation at projected minutes, how
does Team KR change? (computed using Team KR math with the player inserted)
● "Why" tags — top 2–3 reasons this is a good fit (e.g., "Fills uncovered Anchor Big
demand," "Top-3 system fit in Spread PnR," "Upgrades weakest rotation position")
● "Risk" tags — mismatches or concerns (e.g., "No match for defensive system," "Would
be redundant to current starter at same archetype," "Low confidence evaluation")
B2) Best-Fit Pro Leagues / Teams (if applicable)
Same structure as B1 but for professional teams:
● Target team / league
● Pro tier (NBA, G-League, EuroLeague, domestic leagues, etc.)
● Player's pro-level KR tier label
● System fit % (if pro team system identity is available)
● Projected role (starter / rotation / end of bench / developmental)
● Draft stock context (if applicable): projected draft range from public sources

B3) Sorting and Filtering
The placement list can be sorted by:
● Projected Team KR Impact (default — shows where the player helps the MOST)
● System Fit % (best schematic match)
● Demand Match Priority (A-tier uncovered demands first)
● Level (filter to specific division/level)
● Conference (filter to specific conference)
● Region (filter by geography)
OUTPUT C: Player Value at Target — "What Are You Worth There?"
For each target in the placement list, show the economic context:
C1) PTV (Player Team Value)
● PTV_Raw at this target (from Scholarship/NIL Engine formula)
● PTV_Share (what % of the team's total value this player would represent)
● Recommended scholarship % (based on PTV share × available equivalents)
● Recommended NIL allocation (based on PTV share × estimated NIL pool)
● Priority tier label: Core / Rotation / Depth / Development
C2) PMV (Player Market Value)
● PMV_Score (Social + Exposure + Performance + Deal Flow)
● PMV_Dollar estimate (market rate)
C3) Gap (PTV vs PMV)
● Gap flag: UNDERVALUED / FAIR / OVERPRICED at this specific target
● "This player is worth $X to [Target School] based on basketball value. The market prices
him at $Y. The gap is $Z."
C4) Comparative Value
● Rank this player's PTV against other available players (portal/recruits) who could fill the
same demand at this target
● "Among available Anchor Bigs who fit [Target School]'s Pack Line defense, this player
ranks #3 by PTV out of 47 options."
OUTPUT D: Gap Analysis — "What's Holding You Back?"

For a selected target tier or target program, show exactly what separates the player from the
next level.
D1) Tier Gap
● Current KR at target level: [value] = [tier label]
● Next tier threshold: [value] = [tier label]
● Gap: [delta] KR points needed
D2) Highest-Leverage Trait Improvements
Using the Player Evaluation Pipeline's trait-to-KR weighting structure, compute which trait
improvements produce the LARGEST KR lift per point of improvement:
● Trait 1: [trait name] — current score [X], target score [X + Δ] — projected KR lift: +[value]
● Trait 2: [trait name] — current score [X], target score [X + Δ] — projected KR lift: +[value]
● Trait 3: [trait name] — current score [X], target score [X + Δ] — projected KR lift: +[value]
Maximum 5 traits shown. Ranked by KR lift per point of improvement (highest leverage first).
Rules:
● Only traits from the canonical Trait Library (54 traits, 7 clusters)
● Does NOT invent traits
● Does NOT modify actual KR — shows projected KR IF the improvement happens
● Trait improvement deltas are realistic (bounded by position/age/level norms — no "+30
points on a trait")
D3) Archetype Unlock Analysis
If the player is close to qualifying for an additional archetype (meets some but not all must-have
thresholds):
● "You are [X] points away from qualifying for [archetype name]"
● "If you reach [trait] ≥ [threshold], you unlock [archetype], which opens [N] new A-tier
demand matches across [N] programs"
This shows the player that developing one specific skill could fundamentally change their
placement options.
D4) System Fit Unlock Analysis
If improving specific traits would shift the player's demand tier from C or No-match to B or A at
high-value systems:
● "Improving [trait] by +[Δ] would move your demand tier from C to B in [system name],
opening [N] additional programs as strong fits"

OUTPUT E: Development Roadmap — "What's the Path?"
A prioritized development plan that tells the player and their coach what to work on, in what
order, and what the expected impact is.
E1) Priority Stack
Ranked list of development priorities, ordered by:
1. Highest KR leverage (which improvements move the needle most)
2. Archetype unlock potential (which improvements open new archetypes)
3. System fit expansion (which improvements make you fit more systems)
4. Weakness mitigation (which improvements remove system risks or disqualifiers)
Each priority includes:
● Trait name
● Current score
● Target score
● Cluster (Shooting / Creation / Finishing / Playmaking / Defense / Physicality / IQ)
● Expected KR impact if achieved
● Expected archetype/system fit changes if achieved
● Priority label: Critical / High / Moderate / Low
E2) Cluster-Level Development Summary
Grouped by the 7 trait clusters:
● Cluster current average vs cluster target
● "Your shooting cluster averages 72. To unlock 3-and-D Wing archetype, you need
shooting cluster average ≥ 75. Focus: Spot-Up 3PT (+3 points) and Catch-and-Shoot
Volume (+2 points)."
E3) Risk Mitigation
If the player has system risks or auto-disqualifiers that suppress their KR:
● "System Risk: Turnover Risk (Major) — currently costing you approximately [X] KR
points. Improving Ball Security from [current] to [threshold] would remove this risk and
project a KR increase of +[value]."
E4) Ceiling Projection (Directional Only)

Given the player's age, position, current trait profile, and historical trait improvement rates at
their level:
● "Projected ceiling KR range: [low] – [high] at [level] over [timeframe]"
● "This projects as a [tier label] at D1 MM if development targets are met"
Rules:
● Ceiling projection is directional, not precise
● Based on trait improvement rate norms, not individual prediction
● Confidence on ceiling projection is always lower than current KR confidence
● Displayed with explicit uncertainty: "This is a projection based on typical development
rates, not a guarantee"
OUTPUT F: Competitive Landscape — "Who's Competing With You?"
For the player's target level and archetype, show the competitive context.
F1) Portal / Recruiting Pool Comparison
● Number of available players with the same primary archetype at the target level
● Their KR range (min / median / max)
● Where the subject player ranks within that pool
● "You are the #[X] ranked [archetype] available in the [level] transfer portal. There are [N]
players with higher KR at your archetype and [N] with lower."
F2) Target Program Competition
For each target program in the placement list:
● Other portal/recruit players targeting the same program
● Their archetype, KR, and system fit
● Whether they fill the same demand or a different one
● "Three other Anchor Bigs are in the portal and fit [Target School]'s system. You rank #2
among them by projected Team KR impact."
F3) Market Saturation
● Is this archetype oversupplied or undersupplied in the current portal/recruiting market?
● "Stretch Bigs are oversupplied in the D1 portal (87 available, 34 programs with open
demand). Your PTV may be compressed by market saturation."
● "POA Defender Guards are undersupplied (12 available, 58 programs with open
demand). Your PTV may be inflated by scarcity."

4. Hard Rules (Locked)
● This engine is downstream of Player KR and NEVER modifies Player KR, Team KR,
archetypes, system identity, or any upstream output
● All targeting must be derived ONLY from:
○ KR outputs + KR Legends
○ Archetype Library (21 locked archetypes)
○ Global Database (Global Master List + Team Master Records)
○ OSIE/DSIE system identity (12 offense, 10 defense)
○ System Fit definitions + System Demand Profiles
○ Scholarship/NIL Allocation Engine (PTV/PMV)
● All outputs must be explainable — show fit %, confidence %, demand match, and "why" /
"risk" tags
● Trait improvement projections use ONLY traits from the canonical Trait Library (54 traits,
7 clusters)
● Ceiling projections are always labeled as directional, not precise
● Competitive landscape data is factual (rankings, counts, comparisons) — never editorial
● All outputs are deterministic: same inputs → same outputs
5. Update Cadence
What Cadence Trigger
Player Truth Every game Player KR updates after every game
Summary (Output A)
Placement Targeting Every game + Team KR and roster changes affect demand
(Output B) on demand matching
Player Value at Every game + PTV changes as Team KR and demand shift
Target (Output C) on demand

Gap Analysis Every game KR changes affect gap calculations
(Output D)
Development Every 5 games Aligned with system identity checkpoint — trait
Roadmap (Output E) priorities may shift if system changes
Competitive Continuous Portal entries/withdrawals/commitments change the
Landscape (Output competitive pool constantly
F)
6. Governance
● The Development Intelligence Engine is produced by Nexus. No manual override of
computed outputs.
● All outputs are deterministic: same inputs → same outputs.
● Coaches, players, and advisors consume these outputs — they do not modify them.
● The engine references the Scholarship/NIL Allocation Engine for value outputs but does
not duplicate its logic. PTV/PMV are pulled, not recomputed.
● Placement targeting ranks by projected Team KR impact by default — this is the
objective measure of "where does this player help the most." Users can re-sort by other
criteria.
● The competitive landscape outputs are factual comparisons, not subjective rankings.
"You rank #3 by KR among available Anchor Bigs" is a fact. "You're better than Player X"
is editorial and is NOT produced.
UI / GOVERNANCE NOTE
Downstream intelligence engine only. All values are consumed from upstream engines (Player
KR, Team KR, System Identity, Scholarship/NIL, Global Database). No evaluation, weighting, or
normalization logic lives here. This engine translates existing truth into placement, development,
and competitive intelligence. It modifies nothing.

PRO TRANSITION

PRO TRANSITION INTELLIGENCE ENGINE
v1 — LOCKED
0. Purpose
The Pro Transition Intelligence Engine is the professional-level companion to the Development
Intelligence Engine. Where the Development Engine handles college-to-college movement
(portal, recruiting, transfers), this engine handles college-to-pro projection — translating a
college player's evaluated identity into professional context with development trajectory, draft
intelligence, and role projection.
It answers five questions for any college-evaluated player considering the professional level:
1. What are you as a pro right now? — Pro Projection KR (Entry) with full component
breakdown
2. What do you become? — Year 1 / Year 3 / Peak trajectory with scenario branching
3. What's the one thing? — The single highest-leverage development variable that
determines outcome range
4. How does your archetype evolve? — Archetype pathway from college identity to pro
ceiling
5. Where do you go? — Draft range, role projection, team fit context
This engine does NOT evaluate players. It does NOT modify Player KR, Team KR, archetypes,
system identity, or any upstream output. It reads governed truth from the Player Evaluation
Pipeline and produces downstream projections only.
All outputs are deterministic: same inputs → same outputs.
1. Consumers
● Pro scouts and front offices — "What does this player project as? What's the
development bet? What's the risk?"
● Agents and advisors — "Should this player declare? What's his draft range? What's his
earning trajectory?"
● The player — "Am I ready? What do I need to work on before going pro? What's my
ceiling?"

● The player's current college coach — "How do I develop this player for the next level?
What pro skills should we prioritize?"
● Media and analysts — Draft boards, prospect rankings, comparison context
Same engine, same outputs, different decisions made from them.
2. Inputs (MUST PULL)
A) Player Identity + Record
MUST PULL FROM: Player Profile (Auto-Populated Record)
● Player name, identity, demographics
● Age at time of draft / declaration
● Career history (schools, levels, seasons played)
● Current roster affiliation
● Eligibility remaining (relevant for "should I declare" decisions)
● Injury history (if available)
● International competition history (FIBA, Nike Hoop Summit, etc.)
B) College Player KR Outputs (Truth)
MUST PULL FROM: Player Evaluation Pipeline (finalized outputs)
● Overall Player KR (College)
● Base KR (pre-system-fit)
● Final System Off KR / Def KR
● Player confidence_pct
● Evaluation mode (Full eval vs Production-based)
● Data tier (V1 / V1+ / V2 / V3)
C) Full Trait Scores (Raw)
MUST PULL FROM: Trait Library (47 traits, 8 clusters)
● All 47 trait scores with current values
● UNSCORED traits flagged
● Cluster-level Skill KRs (Shooting, Finishing, Playmaking, POA Defense, Team Defense,
Rebounding, Tools, IQ)
● Data source per trait (TRUE / PROXY / UNSCORED)
This is critical. The Pro Transition Engine needs the raw trait vector to reweight through pro
positional demands and to identify which traits have the highest pro-level leverage.

D) Archetype + Badges + Impact Modifiers + System Risks
MUST PULL FROM: Archetype Library, Badge Spec, Impact Modifier outputs, System Risk
outputs
● Primary and secondary archetype assignments (college)
● Badge list (college tier gates)
● Impact modifier label
● Active system risks (college)
E) Full System Fit Profile
MUST PULL FROM: System Fit computation layer
● Offensive system fit scores for ALL 12 offensive systems
● Defensive system fit scores for ALL 10 defensive systems
● For each system: fit %, demand tier (A/B/C/No-match)
F) Physical Profile
MUST PULL FROM: Player Profile + Trait Scores
● Height, weight, wingspan (measured if available, listed if not)
● Age
● Physical trait scores: Height, Length, Strength, Speed, Lateral Quickness, Vertical Pop,
Motor, Endurance
G) Pro Positional Weights
MUST PULL FROM: Position Trait Weighting (Pro level, 5 positions)
● Pro OPF for the player's position
● Pro trait weight distributions within each cluster
● Pro badge gates (Bronze ≥ 93, Silver ≥ 96, Gold ≥ 98)
H) Pro System Risks + Overrides
MUST PULL FROM: System Risks v3, Overrides v3
● Pro Tier 1 Major triggers (−4.0)
● Pro Tier 2 Major triggers (−2.5)
● Pro Minor triggers (−2.0)
● Pro positive override triggers
● Pro negative override triggers
● Anti-Stacking rules

3. Outputs
OUTPUT G: Pro Projection KR (Entry) — "What Are You as a Pro Right
Now?"
The core translation. Take the college player's trait scores and run them through pro positional
weights, pro system risks, and pro overrides to produce a Pro Projection KR.
G1) Pro KR Identity Card
● Pro Projection KR (Entry): [value] ([range])
● Confidence: [%] — inherently lower than college confidence because translation adds
uncertainty
● Pro OKR / DKR / TKR / IQKR breakdown with pro positional weights applied
● College KR → Pro KR delta and explanation of what caused the shift (weight changes,
system risk triggers, badge loss/gain, override changes)
● Pro archetype: may differ from college archetype if pro weights change which gates are
met
● Pro badges: evaluated against pro tier gates (≥ 93 / ≥ 96 / ≥ 98)
● Pro system risks triggered: list with severity and KR impact
● Pro overrides applied: positive and negative, with governance notes
G2) Translation Breakdown
Show explicitly what changed from College to Pro and why:
● OPF shift (e.g., "PF College: OKR 44% / DKR 36% / TKR 18% / IQ 2% → PF Pro: OKR
46% / DKR 40% / TKR 10% / IQ 4%")
● Trait weight shifts within clusters (e.g., "Shooting weight inside OKR rose from 26% to
28% — this hurts/helps because...")
● Badge gate changes (e.g., "College Bronze at Skill KR ≥ 90 → Pro Bronze at ≥ 93.
Player's Finishing KR 91 qualified at College, does not qualify at Pro. Badge lift lost: −1.5
KR")
● System risk changes (e.g., "Range Gap was College Tier 2 Major (−1.5). Now Pro Tier 2
Major (−2.5). Additional penalty: −1.0 KR")
● Override changes (e.g., "College: Jumbo Initiator +1.0. Pro: Jumbo Initiator +1.0 —
unchanged" or "College: Vertical Rim Threat +1.0. Pro: not available as college-only.
Override lost.")
This transparency lets scouts see exactly where the translation helps or hurts.
G3) Pro KR Legend Interpretation

Map the Pro Projection KR (Entry) to the Pro Player KR Legend tiers. Display the tier label and
competitive/economic reality.
Note: This is the player's day-one pro identity — what they would be if dropped into the NBA
tomorrow. It is NOT their projected peak. The trajectory outputs (H, I) provide the development
path.
OUTPUT H: Development Trajectory — "What Do You Become?"
Year-by-year projection based on the player's current trait profile, archetype, age, and
archetype-typical development curves.
H1) Year 1 Projection
● Projected KR range after 1 NBA season
● Expected trait changes: Which traits typically improve in year 1 for this archetype? By
how much? (Bounded by historical norms, not individual prediction)
● Role expectation: Starter / Rotation / Bench / G-League based on entry KR and
archetype
● System risk status: Do any current system risks project to resolve in year 1? (Usually
no — shooting development takes 2+ years)
● Physical maturation: For players age ≤ 21, project strength and endurance
improvement from NBA training programs
H2) Year 3 Projection (Scenario Branch)
This is where the trajectory branches based on the Key Development Variable (Output I).
Scenario A — Key Variable Develops:
● Projected KR range
● Which system risks resolve
● Which badges unlock
● Archetype evolution
● Pro KR Legend tier
● Role projection (starter / closer / All-Star candidate)
Scenario B — Key Variable Does Not Develop:
● Projected KR range
● Which system risks persist
● Archetype stabilization
● Pro KR Legend tier
● Role projection (role player / specialist / scheme-dependent starter)

Both scenarios are always shown. The system does not pick a winner. It presents both paths
and lets the consumer decide which bet to make.
H3) Peak Projection (Directional)
● Ceiling KR range — the best realistic outcome given tools, age, and archetype-typical
peak curves
● Ceiling tier label from Pro KR Legend
● Timeline to peak — typically age 25–28 for most archetypes
● Ceiling confidence — always lower than current KR confidence. Labeled explicitly as
directional.
H4) Floor Projection
● Floor KR range — the worst realistic outcome assuming no major injury but limited
development
● Floor tier label from Pro KR Legend
● Floor scenario description — what the player looks like if development stalls
Rules for all trajectory projections:
● Projections are directional, not precise
● Based on archetype-typical development rates, not individual prediction
● No trait improvement may exceed +15 points over 3 years (historical ceiling for
high-development players)
● No trait improvement may exceed +8 points in a single year
● Confidence on trajectory projections is always lower than entry KR confidence
● Both upside and downside are always shown
● All projections are labeled with explicit uncertainty language
OUTPUT I: Key Development Variable — "What's the One Thing?"
The single highest-leverage skill improvement that most determines the player's outcome range.
Every pro projection has one.
I1) Variable Identification
● Trait name (from canonical Trait Library)
● Current score
● Target score (the threshold that unlocks the next tier of value)
● Cluster (Shooting / Finishing / Playmaking / Defense / Tools / IQ)
I2) KR Impact Analysis

● KR impact if achieved: How much does overall Pro KR move if this trait reaches the
target?
● System risk impact: Does achieving the target remove a system risk? Which one?
What's the KR penalty removed?
● Badge impact: Does achieving the target unlock a pro badge? Which tier?
● Archetype impact: Does achieving the target unlock a new archetype or shift the
primary?
● System fit impact: Does achieving the target shift demand tier from C to B or B to A in
any systems?
I3) Development Evidence
● FT% signal (for shooting variables): Does the player's FT% support or undermine the
projection that they can develop this skill? (FT% is the truth serum — per system rules)
● Age factor: How old is the player? Younger players have more development runway.
● Historical comp rate: What percentage of players with this archetype and this trait gap
have historically closed it within 3 years? (Directional estimate, not precise)
● Risk label: High confidence / Moderate confidence / Low confidence that the variable
develops
I4) Secondary Development Variable (if applicable)
If there's a second trait that meaningfully moves the KR needle (though less than the primary),
show it with the same structure. Maximum 2 variables shown. Most players have one clear
primary.
OUTPUT J: Archetype Evolution Path — "How Does Your Identity Change?"
J1) Current → Year 3 → Peak Archetype Map
Show the player's archetype trajectory:
● Current (College): [Primary archetype] | [Secondary archetype]
● Entry (Pro Day 1): [Primary archetype] | [Secondary archetype] — may shift from
college due to pro weight changes
● Year 3 (Scenario A — variable develops): [Projected primary] | [Projected secondary]
● Year 3 (Scenario B — variable doesn't develop): [Projected primary] | [Projected
secondary]
● Peak (if all development targets met): [Ceiling archetype]
J2) Archetype Unlock Proximity
For each archetype the player does NOT currently qualify for but is close to:

● Archetype name
● Which gates are met vs unmet
● How many trait points away from qualification
● Whether the Key Development Variable would unlock it
OUTPUT K: Draft and Team Fit Intelligence — "Where Do You Go?"
K1) Draft Range Projection
Based on Pro Projection KR (Entry) mapped to historical draft position data:
● Projected draft range (e.g., "Picks 3–6")
● Entry KR tier label with historical draft-position correlation
● Archetype demand in current draft class — is this archetype scarce or saturated
among the available prospects?
K2) Pro Team Fit (if pro team system data available)
For NBA teams with known system identities:
● Top 5 best-fit teams by system fit % (offense + defense)
● For each: system name, fit %, demand tier, projected role, "why" tags
● Bottom 3 worst-fit teams with "risk" tags
K3) Competitive Context
● Other prospects in the draft class with the same archetype
● Their Pro Projection KR (Entry) range
● How the subject player ranks among them
● Scarcity / saturation of this archetype in the current class
4. Hard Rules (Locked)
● This engine is downstream of Player KR and NEVER modifies Player KR, Team KR,
archetypes, system identity, or any upstream output
● Pro Projection KR (Entry) is a translation, not a new evaluation. It applies pro weights,
pro system risks, and pro overrides to existing college trait scores. It does not re-score
traits.
● All trait scores consumed are the SAME trait scores from the college evaluation. No trait
is re-scored for "pro potential" — traits reflect current demonstrated ability only
● Development trajectory projections are ALWAYS labeled as directional, not precise

● No trait improvement projection may exceed +15 points over 3 years or +8 points in 1
year
● Both upside and downside scenarios are ALWAYS shown for Year 3 and Peak
projections
● Confidence on all trajectory outputs is ALWAYS lower than entry KR confidence
● The Key Development Variable is identified through KR leverage math (which trait
improvement produces the largest KR swing), not editorial judgment
● All outputs must be explainable — show the math, show the reasoning, show the
uncertainty
● All outputs are deterministic: same inputs → same outputs
● Pro team fit outputs require pro team system identity data. If unavailable, Output K2 is
marked "Pro team system data not available — generic archetype demand shown
instead"
5. Relationship to Other Engines
Upstream (consumed, never modified)
● Player Evaluation Pipeline → trait scores, KR, archetypes, badges, system fit,
confidence
● System Risks v3 → pro tier assignments, anti-stacking rules
● Overrides v3 → pro positive/negative overrides
● Position Trait Weighting → pro OPF and trait weight distributions
● Pro Player KR Legend → tier interpretation for Pro Projection KR
Parallel (companion, not overlapping)
● Development Intelligence Engine → handles college-to-college movement (portal,
recruiting, transfers). This engine handles college-to-pro projection. They share the
same upstream inputs but serve different consumers and answer different questions. A
player in the portal would use BOTH: the Development Engine for "where should I
transfer" and this engine for "should I go pro instead."
Downstream (consumes this engine's outputs)
● Scouting and Game Operations Engine → may reference Pro Projection KR for
draft-eligible players in scouting reports
● Simulation Engine → may use pro-translated trait profiles for pro-level simulations
● Nexus UI → renders the outputs for end users (scouts, players, advisors)

6. Trigger Conditions
This engine fires when:
1. A college player's evaluation is complete (Player KR locked), AND
2. The player is draft-eligible (based on age/class year/eligibility rules), AND
3. A consumer requests pro projection (scout, player, advisor, or system auto-trigger for
draft-eligible players)
The engine does NOT fire for:
● Players with remaining college eligibility who have not declared or been requested for
pro projection
● Players who already have professional production data (use the standard Pro evaluation
pipeline instead)
● Players without a completed college evaluation (no KR = no projection)
7. Update Cadence
Output Cadence Trigger
Pro Projection KR (G) Every game + on College KR updates propagate
demand
Development Trajectory (H) Every 5 games Aligned with system identity
checkpoint
Key Development Variable Every 5 games Trait shifts may change leverage
(I) ranking
Archetype Evolution (J) On demand Typically stable within a season
Draft / Team Fit (K) Continuous Draft class pool changes, team needs
shift
8. Governance
● The Pro Transition Intelligence Engine is produced by Nexus. No manual override of
computed outputs.
● All outputs are deterministic: same inputs → same outputs.
● Scouts, players, agents, and advisors consume these outputs — they do not modify
them.

● Pro Projection KR (Entry) uses the same trait scores as the college evaluation. The only
differences are positional weights (pro vs college), system risk thresholds (pro vs
college), override triggers (pro vs college), and badge gates (pro vs college).
● Development trajectory projections are bounded by archetype-typical development
norms. The system cannot project a player improving faster than historical precedent
allows.
● The Key Development Variable is computed, not chosen. It is the trait with the highest
KR leverage per point of improvement at the pro level. If two traits are within 0.5 KR
leverage of each other, both are shown (primary + secondary).
v1: Initial locked structure. Companion to Development Intelligence Engine. Covers
college-to-pro translation, development trajectory, archetype evolution, and draft intelligence.

Coaching Impact Modifier

Coaching Impact Modifier v1.0 (Locked)
1. Purpose
Computes coaching-attributable player development residuals across all 8 trait clusters.
Standalone doc consumed by Development Intelligence Engine (Engine 06). Modifies
development PROJECTIONS only — never modifies Player KR, Team KR, traits, archetypes, or
any upstream output.
2. Inputs (Must Pull)
Per Player Per Season: All 47 trait scores (8 cluster KRs), overall Player KR, position, age,
level, minutes/usage, system identity (OSIE/DSIE), Team KR, data tier (V1/V1+/V2/V3).
Per Coach: Coach ID, head coach vs position coach, program affiliation per season, tenure
dates, continuity flag.
Departure Data: Players who left Coach X, pre-departure trait scores (last season under X),
post-departure trait scores (first full season under new coach), destination coach ID and system
identity.
3. Baseline Expected Development Curves
The baseline is the league-wide average year-over-year trait movement for a player of a given
age, position, and level. It represents what SHOULD happen through natural maturation and
standard reps alone. Movement above or below baseline = coaching residual.
Computation:
Baseline_Δ(cluster, age, position, level) = weighted mean of actual deltas across all players in
the Global Database matching that age bracket × position group × level tier, weighted by
minutes played.
Age brackets: 17–18, 19–20, 21–22, 23+ Position groups: Guards, Wings, Forwards, Centers
Levels: Grouped by KLVN lambda tiers
Properties:

● Recomputed annually as the Global Database grows
● Level-specific (D1 HM freshman guard ≠ JUCO freshman guard)
● Survivorship-controlled (only players with consecutive-season data)
● Tools cluster baselines expected smaller than skill clusters (genetic ceilings) but still
measured — S&C coaching is real
4. Coaching Residual Computation
4.1 Per-Player Residual
For Player P under Coach C for consecutive seasons (Year N → N+1):
Residual(P, C, cluster) = Actual_Δ(P, cluster) − Baseline_Δ(cluster, age, position, level)
Positive = improved more than expected. Negative = improved less or regressed. Zero =
developed at expected rate.
4.2 Coach Impact Profile (CIP)
Aggregated across all eligible player-seasons under Coach C:
CIP(C, cluster) = weighted_mean(all Residuals under C), weighted by minutes played
Output: 8-value vector — one per cluster.
Cluster CIP Interpretation
Shooting +4.2 Strong positive developer
Finishing +1.8 Moderate positive
Playmaking +2.4 Moderate positive
POA Defense +0.3 Near baseline
Team +1.1 Slight positive
Defense
Rebounding −0.4 Near baseline
Tools +2.9 Strong physical
developer
IQ +1.6 Moderate positive

Example values. Actual CIP computed from observed data.
4.3 Position-Specific CIP
CIP can be sliced by position group. A coach may develop guard shooting at +5.1 but center
shooting at +1.2. Position-specific CIP used when sample ≥ 6 player-seasons at that position.
Otherwise falls back to overall CIP.
4.4 System-Adjusted CIP
System identity changes explain some trait movement independently of coaching (e.g.,
Post-Centric → Spread PnR naturally increases 3PA). The system-adjusted CIP compares:
● PURE signal: Players who stayed in the same system under the same coach
● MIXED signal: Players whose system identity changed (coaching + system confound)
MIXED residuals flagged → Development Intelligence Engine applies lower confidence weight.
5. Evidence Thresholds
Threshold Minimum Below Minimum
Player-seasons under coach 8 Modifier inactive — baseline only
Unique players 4 Modifier inactive
Consecutive seasons per 2 Player excluded from
player computation
Minutes per player-season 10 MPG, 15+ games Player excluded
Position-specific CIP 6 player-seasons at Fall back to overall CIP
position
CIP Confidence Tiers
Tier Player-Season Unique Confidenc CIP/Baseline Blend
s Players e
Low 8–15 4–6 55–70% 30% CIP / 70%
baseline
Medium 16–30 7–15 70–85% 50% / 50%

High 31–60 16–30 85–93% 70% / 30%
Very High 61+ 31+ 93–97% 80% / 20%
Baseline is never fully replaced. Even at Very High, 20% baseline anchor remains.
6. Regression Detection (Departure Analysis)
6.1 Departure Residual
For Player P who leaves Coach C and plays under Coach D:
Departure_Residual(P) = Actual_Δ(P, first season under D) − Baseline_Δ(age, position,
level under D)
Negative departure residual = player regressed after leaving → strengthens Coach C's CIP.
Positive departure residual = player improved after leaving → weakens Coach C's CIP (or
strengthens D's).
6.2 Regression Ratio
Regression_Ratio(C) = count(negative departure residuals) / count(all departures from C)
Above 0.60 = strong coaching attribution signal. Below 0.40 = development was likely natural,
not coach-driven.
6.3 Level Change Control
When a player changes level upon departure (e.g., JUCO → D1), the departure residual is
computed against the NEW level's baseline. The system does not penalize a coach because
stats dropped at a harder level.
7. Application to Development Projections
7.1 Projection Formula
Projected_Δ(P, cluster) = Baseline_Δ(age, position, level) + (CIP(C, cluster) ×
Blend_Weight)
Blend_Weight from Section 5 confidence tiers.

7.2 Diminishing Returns
Players with high current trait scores get less CIP boost:
Improvement_Multiplier = (100 − Current_Trait_KR) / 50, capped at 1.0
● Player at 50 KR → full CIP applied (multiplier 1.0)
● Player at 75 KR → 50% of CIP applied
● Player at 90 KR → 20% of CIP applied
7.3 Bounds
All projections bounded by Development Intelligence Engine hard rules:
● Max +8 KR per cluster in 1 year
● Max +15 KR per cluster over 3 years
● Both upside and downside scenarios always shown
CIP can push toward bounds but never beyond.
8. Team KR Development Attribution
8.1 Separation
For each season-over-season Team KR change:
● Returning_Player_Contribution = sum(KR delta for each returning player × their
minutes share)
● New_Player_Contribution = sum(new player KR − departed player KR they replaced ×
minutes share)
8.2 Development Ratio
Development_Ratio(C, season) = Returning_Player_Contribution / Team_KR_Delta
Above 0.50 = coach builds through development. Below 0.30 = coach builds through
portal/recruiting.
Multi-season Development Ratio tracked under the same coach. Consistent high ratios =
strongest CIP environments.

9. Hard Rules
1. Computed by Nexus. No manual override.
2. Deterministic: same inputs → same outputs.
3. NEVER modifies Player KR, Team KR, traits, archetypes, system risks, badges, or any
upstream output.
4. CIP recomputed annually after season ends. No mid-season updates.
5. CIP always blended with baseline — never fully replaces it.
6. No single player-season residual may contribute more than 15% of total CIP weight.
7. Departure residuals require 1 full season at new program before activation.
8. Level changes controlled for in departure analysis.
9. Position coach CIP is secondary to head coach CIP unless position coach data is
independently available.
10. All CIP values accompanied by confidence level and sample size.
10. Relationship to Other Documents
Upstream (Consumed, Never Modified)
Document What This Pulls
Player Evaluation Pipeline 47 trait scores, 8 cluster KRs, Player KR, position, archetype
Global Database Career records, season stats, minutes, usage, rosters, level
metadata
Staff/Coach Record Coach ID, tenure, program affiliation, continuity
Transfer Portal Registry Departure events, destinations, destination coaches
System Identity System labels per team-season
(OSIE/DSIE)
KLVN Lambda values for level-specific baselines
Consumed By
Engine/Doc How It Uses CIP
Development Intelligence Engine Applies CIP to player development trajectory projections
(06)
Pro Transition Intelligence Engine References CIP for college-to-pro development trajectory

Nexus UI Surfaces Coach Impact Profile and Development Ratio to
end users
Parallel
Document Relationship
System Risks v3.2 Risks = NOW. CIP = FUTURE. Different time horizons.
Physical Mismatch Physical modifiers adjust Team KR for level-specific size. CIP adjusts
Modifiers v1 development projections for coaching. Different mechanisms.
Overrides v3 Overrides adjust Player KR instantly. CIP adjusts trajectory
longitudinally.
11. Update Cadence
Output Cadence Trigger
Baseline curves Annually End of season, full database rebuild
Coach Impact Annually End of season, after final trait scores locked
Profile
Departure residuals Annually After departing player completes 1 full season at new
program
Development Ratio Annually End of season, after Team KR and roster attribution
computed
Projection On Whenever Development Intelligence Engine runs a
application demand projection
v1.0: Initial locked structure. Standalone governance document. Consumed by Development
Intelligence Engine (Engine 06) and Pro Transition Intelligence Engine.