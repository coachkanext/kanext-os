Scouting Confidence Gates

Scouting Confidence Gates — Scout + Postgame (Locked
Tables)
Purpose
Confidence% communicates evidence completeness + reliability for scouting (pregame) and
postgame analysis. Computed at the end of the respective packet. Does not change any
scouting content or KR values — it qualifies reliability only.
Data Tier Reference
Tier Definition
V1 — Stats-Only Public box scores, roster minutes, season stats. No play-type
data.
V1+ — Stats + Licensed V1 + third-party play-type data. Actual usage, shot profiles,
Granular possession-level efficiency. Not owned.
V2 — PlayVision (1 KaNeXT-owned camera data. Full play-type, usage, matchup
Season) tracking, spatial data.
V3 — PlayVision Deep Multiple seasons of PlayVision data + film archive. Highest
(Multi-Season) fidelity.
Scout Confidence Gate (Pregame)
Data available (opponent) Scout Confidence % (default
range)
V1 stats-only: official/team season stats + roster 55–70%
V1 stats-only + multi-year (returning core / stable identity) 60–75%
V1+ licensed granular: play-type data + shot profile (1 year) 70–85%
+ stats
V1+ licensed granular + multi-year 78–90%
V2 PlayVision (1 season): processed games ≥5 + stats 80–92%
V2 PlayVision high coverage: ≥10 games processed + 85–94%
stable rotation

V3 PlayVision Deep: multi-season processed + film archive 88–96%
+ stable identity
Scout Confidence Adjusters (apply within the chosen range)
● Sample size: fewer than 5 current-season games → use bottom of range
● Recency: last 3 games show clear shift (injuries / lineup change / scheme shift) →
downshift 5–10 pts
● Roster volatility: rotation not stable / unknown minutes → downshift 5–10 pts
● System ambiguity: OSIE/DSIE still provisional or unlocked → downshift 5–10 pts
● Multi-game continuity: prior game against same opponent exists in system → upshift 3–5
pts
● High stability: locked systems + stable top-7 rotation → upshift toward top of range
Output
● scout_confidence_pct ∈ [0,100]
● Computed at end of pregame scout packet
● Does not change scouting content — qualifies reliability only
Postgame Confidence Gate
Data available (postgame) Postgame Confidence %
(default range)
V1 stats-only: final box + team totals + basic splits (no film, no 55–70%
play tags)
V1 stats-only + manual staff tags (timeouts / key actions 60–75%
logged)
V1+ licensed granular: play types + shot profile + efficiencies 70–85%
(no owned film)
V1+ licensed granular + multi-game trend context (same 75–88%
opponent/system)
V2 PlayVision: owned film processed + full tag log + clip list 82–92%
V2 PlayVision + high completeness: accurate stints/lineups + 88–96%
≥10 teaching clips tied to tags

V3 PlayVision Deep: multi-season context + full film archive + 90–97%
trend analysis
Postgame Confidence Adjusters (apply within the chosen range)
● Tag completeness low (missing large chunks of actions/coverages) → downshift 5–10
pts
● Lineup/stint accuracy weak → downshift 5–10 pts
● Opponent identity ambiguity (OSIE/DSIE not locked) → downshift 5–10 pts
● Stable rotation + clear identity + high film coverage → upshift toward top of range
● Multi-game trend context available (prior games vs same opponent) → upshift 3–5 pts
Output
● postgame_confidence_pct ∈ [0,100]
● Computed at end of postgame staff packet
● Does not change postgame content — qualifies reliability only
UI / GOVERNANCE NOTE
Reference tables only. Confidence values are produced by Nexus. No evaluation, weighting, or
normalization logic lives here.
Now the big one. Game Ops:

Game Ops

Game Ops — Full Scouting Intelligence Flow
Global Rules (apply to all 4 phases)
Determinism Same inputs → same packet sections + ordering + outputs.
No Truth Mutation Game Ops may reference Player/Team Truth outputs but may not
recompute or change them.
Time Anchors
● Pregame: generated T-24h to T-0h (refreshable).
● In-Game: live updates each possession/dead ball, with anti-spam rules.
● Halftime: generated once at halftime whistle (refreshable once if tag corrections).
● Postgame: generated once after final (refreshable if new film tags land).
Universal Output Fields Every packet/stream MUST include:
● game_id, teams, date_time, venue, home_away_neutral
● data_tier (V1 / V1+ / V2 / V3)
● confidence_pct for that phase (scout_confidence_pct / postgame_confidence_pct)
● trace_notes (what inputs were missing / assumed)
Data Tier Behavior Game Ops operates at whatever data tier is available. Higher tiers unlock
richer outputs:
● V1: box score + roster. Manual tagging required in-game. Proxy-based analysis.
● V1+: play-type data adds shot profiles, action frequencies, efficiency breakdowns.
● V2: PlayVision camera data adds real-time tagging automation, matchup tracking, spatial
data. In-game experience is dramatically enhanced.
● V3: Multi-season PlayVision adds trend context, opponent pattern recognition, historical
comparison.
Multi-Game Opponent Continuity If a prior game against the same opponent exists in the
system (same season or prior season), Game Ops MUST reference it:
● Pregame: pull prior postgame audit, note what worked/failed, flag if opponent has
changed since last meeting (roster moves, system drift, coaching change)
● Halftime: compare current game patterns to prior game patterns
● Postgame: compare outcomes across both games, identify what adjusted and what
didn't

1. Pregame Scout Packet
1.1 Inputs — MUST PULL (read-only)
Opponent Player Truth (per rotation player ≥5%)
● Final System Off KR / Final System Def KR
● Archetype (from Archetype Library)
● Badges (from Badge Spec output)
● Overrides applied (from Overrides output)
● System risks (from System Risks)
● Player confidence_pct
Opponent Team Truth
● Rotation table + participation% (≥5%)
● Team Off KR / Team Def KR / Overall Team KR
● Offensive_Fit% / Defensive_Fit% / Overall_Fit%
● Coverage Map (demands → covered by whom → weight)
● Missing Demands (uncovered / under-covered demands with priority + basketball
consequence)
● Fragility Flags (single-point failures, concentration, depth fragility, role overload)
System Identity
● OSIE + DSIE outputs (status + primary system + mix if applicable + confidence)
● Pace Profile (PACE100 + band)
● Defensive Court Depth
Granular (V1+/V2/V3 — if available)
● Play-type outputs (PPP by play type, shot type, frequency)
● Film-derived tags: actions, coverages, triggers, ATO/EOH, press/zone usage
● Shot maps by player + by team
● Matchup assignment data (V2/V3 only)
Multi-Game Continuity (if applicable)
● Prior postgame packet against same opponent
● What worked / what failed from prior meeting
● Opponent changes since last meeting (roster, system, coaching)
1.2 Outputs — MUST OUTPUT (ordered, fixed)
A) Opponent Offensive Identity

MUST OUTPUT:
● off_system_name (from OSIE) + system confidence %
● pace_band (slow/avg/fast) + evidence notes
● primary_initiators[] (players + roles: PnR handler, iso creator, post hub, DHO hub)
● shot_diet_intent vs shot_diet_reality: rim share / mid share / 3 share / FT rate (or best
available proxy)
● pressure_points (where offense breaks): TO stress points, weak-hand, non-shooters,
late-clock tendencies
● system_vulnerabilities (pulled from opponent's Missing Demands + Fragility Flags):
"Their offense has no stretch big — pack the paint. Their PnR operator is a single-point
failure — if contained, no secondary creator exists."
B) Shot Profile (Team + Player)
MUST OUTPUT:
● Team shot map summary (zones + priorities)
● Player shot cards (top 6–8 rotation players):
○ preferred zones
○ volume indicators (attempt rate bands)
○ efficiency indicators (if granular; otherwise "unknown/box-score proxy")
○ "green / yellow / red" shot permissions by your defense (rule-based)
C) Actions + Triggers (If–Then Counter Library)
MUST OUTPUT:
● core_actions[] (ranked top 8–12): PnR types, DHO, stagger, floppy, horns, chin, zoom,
Spain, Iverson, etc. (whatever is tagged)
● For each action:
○ trigger (what starts it)
○ primary option
○ counter
○ late-clock bailout
○ our_counter (1–2 concise rules)
○ risk (what we give up)
D) Opponent Defensive Identity
MUST OUTPUT:
● def_system_name (from DSIE) + system confidence %
● pressure_level (none/light/medium/heavy)
● coverages used (PnR coverage, post coverage, closeout rules)
● help rules (nail/low man tags, stunt vs commit)

● rebounding behavior (gang vs leak, crash rules if known)
● foul profile tendencies (aggressive hands vs contain)
● defensive_vulnerabilities (pulled from opponent's defensive Missing Demands + Fragility
Flags): "Their defense has no switchable wing — attack screens involving their 4/5. Their
rim protector is their only interior presence — foul trouble collapses their scheme."
E) Required Situations Package
MUST OUTPUT (only if opponent uses these):
● ATO offense menu (what they like)
● ATO defense tells (switch calls, denial, top-lock, etc.)
● EOH (end of half) tendencies
● Late-game tendencies (foul discipline, tempo, matchup hunting)
● Press O/D (if used): triggers, alignments, pressure points
● Zone O/D (if used): alignments, shot gives, rebounding gaps
F) Leverage Plan (Attack / Deny / Stress / Fragility)
MUST OUTPUT:
● Top 5 "Attack" points (fed by opponent defensive vulnerabilities + Missing Demands)
● Top 5 "Deny" points (fed by opponent offensive strengths + primary initiators)
● Top 5 "Stress" points (turnovers, foul pressure, shot diet disruption)
● Fragility list: "If X sits / foul trouble → their Y collapses" (pulled directly from opponent
Fragility Flags)
● Hard rules ("no-middle," "no-corners," etc.) if coach sets them
● Prior game reference (if applicable): "Last meeting we attacked X — they adjusted by Y.
This time consider Z."
G) Rotation Board (≥5% participation)
MUST OUTPUT:
● rotation table sorted by participation%:
○ player, position group, off KR, def KR, archetype, key threat, key rule
● minutes bands if available; else participation% only
● substitution patterns if tagged
● coverage modifier status (gap-filler vs redundant, from Team KR diagnostics)
H) Player Cards (one per rotation player)
Each card MUST OUTPUT:
● threat type (shooter/slasher/post/connector/stopper/etc.)
● directionality ("left-heavy," "reject," "spin back," "no right")

● shot map + "take away" priority
● coverage response ("vs drop: pull," "vs switch: iso," etc.)
● TO stress points (handle risk, passing windows)
● foul profile (draws fouls / commits fouls)
● guard rules (screen navigation notes, closeout rules, gap vs touch)
I) scout_confidence_pct
MUST OUTPUT:
● scout_confidence_pct (from Scout Confidence Gate)
● data_tier for this opponent
● "why not higher" (missing granular, missing tags, small sample, unstable rotation, etc.)
2. In-Game Live Ops
2.1 Roles (Owners)
● HC: glance + decide (consumes, does not tag)
● AC1: opponent actions/coverages tagging + alerts owner
● AC2: our offense pulse tagging + alerts owner
● AC3 (optional): fouls/bonus/subs/matchups + alerts owner
2.2 Data Tier In-Game Behavior
V1 (Stats-Only): All tagging is manual. AC1/AC2/AC3 tag everything by hand. Panels show
only what staff enters + box score feed.
V1+ (Licensed Granular): Manual tagging supplemented by external play-type feed if available
in near-real-time. Most tagging still manual.
V2 (PlayVision — 1 Season): PlayVision cameras are in the gym. Automatic play-type
recognition, shot tracking, and action detection run in real-time. AC1/AC2 shift from primary
taggers to reviewers/correctors of automated tags. Panels auto-populate with live play-type
data. Matchup tracking is live. Shot maps update in real-time.
V3 (PlayVision Deep): Same as V2 plus historical pattern matching. System can surface "they
ran this same action 8 times in the last meeting and scored 1.2 PPP — watch for it." Trend
overlays on live data.
2.3 Tagging Language (minimal, structured)
MUST maintain a shared tag dictionary:

● OPP_ACTION: (Horns, Spain, Zoom, DHO, Stagger, etc.)
● OPP_COVERAGE: (drop/ice/switch/hedge/trap/zone/etc.)
● OUR_ACTION: (our set name)
● RESULT: (rim/mid/3/ft/to/foul/oreb)
● DAMAGE: (0/1/2/3) quick severity band
● REPEAT: (count in last X possessions)
At V2/V3, most OPP_ACTION and RESULT tags are auto-generated by PlayVision. Staff
corrects misclassifications rather than creating tags from scratch.
2.4 Panels (locked, always same order)
Panel 1 — Situation Strip (HC primary)
MUST show:
● score, time, possession, period
● team fouls + bonus status
● run tracker (last 5 possessions)
● timeout count
● "next critical situation" flags (2-for-1, final 1:00, etc.)
Panel 2 — Live Lineups + Matchups
MUST show:
● current 5 + positions + matchup assignments
● on-court Off/Def KR aggregate
● mismatch flags (size, foul risk, "target" defender)
● V2/V3 enhancement: live matchup efficiency (PPP allowed by each defender on current
assignment)
Panel 3 — Foul / Risk Monitor (AC3 owner)
MUST show:
● foul counts + who is at risk
● bonus pressure + "attack/avoid" recommendations
● tech/injury notes if applicable
● Fragility Flag alerts: "Their [player] at 3 fouls — if he sits, their [demand] is uncovered"
Panel 4 — Shot + Turnover Pulse (AC2 owner)
MUST show:
● our last 8 shots (type + quality band if available)
● our TOs and causes

● opponent shot diet trend vs our pregame plan
● V2/V3 enhancement: real-time shot map overlaid on pregame shot permissions
(green/yellow/red)
Panel 5 — Opponent Action/Coverage Tag Feed (AC1 owner)
MUST show:
● last 10 tagged opponent possessions
● repetition detection ("Horns x3 in last 7")
● coverage effectiveness notes (if tagged)
● V2/V3 enhancement: auto-tagged with confidence indicator (high/medium/low
classification confidence)
● V3 enhancement: "this action was their #2 play last game — they're leaning on it again"
Panel 6 — HC Overlay (locked caps)
MUST show:
● max 3 active alerts
● max 3 next-dead-ball bullets
● bullets are: one sentence + one action
2.5 Anti-Spam Rules (locked)
● ≤1 new alert / 90 seconds
● ≤3 alerts / 5 minutes
● max 3 active
● each alert expires after 3 possessions unless re-triggered
Alert Triggers (locked categories):
● repetition (same action/coverage repeatedly)
● damage (they are scoring from same thing)
● constraint (foul trouble, mismatch, injury)
● mismatch (targeting a weak link)
● fragility (opponent player in foul trouble whose absence triggers a Fragility Flag)
Manual Promote Rule (locked):
● 1 promoted item per 3 minutes
● format: "They're doing X. Do Y."
3. Halftime Staff Packet

3.1 Inputs — MUST PULL
● Game state + tag log
● First-half lineup table + stints
● Team totals (shot/TO/foul/rebound)
● Pregame leverage plan
● Player truths for context only (no KR recompute)
● Opponent Fragility Flags (for foul trouble / injury exploitation)
● Multi-game continuity data (if prior meeting exists)
3.2 Outputs (A–K, fixed order)
Top: Top-3 Decision Summary 3 bullets, ranked, each bullet = "problem → adjustment"
A) Game State Dashboard Score, pace estimate, foul/bonus, turnovers, OREB, points per
possession proxy
B) Five Factors eFG proxy / TO% proxy / OREB% proxy / FT rate proxy / transition (best
available)
C) Plan Adherence vs Pregame "We said deny X → did we?" Leverage plan checklist: hit/miss
+ consequence
D) Opponent Offense (OSIE lens) What they're running most. Where they're hurting us. What
they avoided. Late-clock tendencies.
E) Opponent Defense (DSIE lens) Their coverage plan vs us. What they're taking away. Where
they're vulnerable. Foul tendencies.
F) Our Offense Shot diet reality vs intent. Who is creating / who is being neutralized. What
action is working and why.
G) Our Defense Where we're breaking (POA, help, closeouts, glass). Mismatches they're
hunting. What coverage is failing.
H) Lineups / Matchups / Plus-Minus Top 3 lineups by performance. Worst 2 lineups (and
why). Matchup pain points (who can't guard who).
I) Constraints & Risk Foul trouble, fatigue, matchup constraints. "Cannot do" list (because of
personnel constraints). Fragility exploitation: "Their [player] has 3 fouls — attack him to force 4th
or force bench."
J) Simulation Projections
MUST PULL FROM: Simulation Engine
Given current game state (score, time, foul trouble, lineup availability):

● Win probability from current position (no adjustments)
● Win probability if Adjustment A is made (top option from sandbox)
● Win probability if Adjustment B is made (second option)
● Win probability if Adjustment C is made (third option)
● Key variable: "The single factor most likely to swing the outcome is [X]"
Simulation projections are directional, not precise. They surface which adjustments have the
highest expected impact, not guaranteed outcomes. Confidence on simulation projections is
governed by the Simulation Confidence Gate.
K) Adjustments Sandbox
2–5 defensive options (benefit + risk + projected win probability delta) 2–5 offensive options
(benefit + risk + projected win probability delta) Each option is one-liner: "Do X to get Y; risk Z;
projected impact: +/- W%"
3.3 Single-Page Layout (locked)
● Header: Top-3 Decision Summary
● Row1: A + B
● Row2: C + (D + E)
● Row3: F + G
● Row4: H + I
● Row5: J + K
● Footer: Simulation projection summary
4. Postgame Staff Packet
4.1 Confidence
MUST OUTPUT:
● postgame_confidence_pct (from Postgame Confidence Gate)
● data_tier for this game
4.2 Outputs — MUST OUTPUT (ordered)
1. Final dashboard + five factors (final)
2. Plan audit (what worked, what failed, why — mapped to pregame leverage plan)
3. Opponent O/D audits (OSIE/DSIE framing)
4. Our O/D audits
5. Lineup/matchup stint review (what combinations won/lost)
6. Player postgame cards (what happened vs pregame expectation)
7. Clip & teach list (priority clips, tags, teaching points)

8. Fragility audit: did the fragility flags we identified play out? Which ones mattered?
9. Multi-game continuity update: save this game's learnings for next meeting with this
opponent
10. Next actions:
○ Next game priorities
○ Practice seeds (3–8 drills/points)
○ Development prescriptions (player-specific)
○ Rotation considerations (if any)
4.3 KR Update Trigger
After the postgame packet is generated:
● Player KRs recalculate with new game data (per game cadence)
● Team KR recalculates with updated Player KRs + minutes/usage
● Coverage map, fit%, and fragility flags update
● If this game completes a 5-game window: system identity (OSIE/DSIE) re-evaluates at
checkpoint
● All updates feed into the next pregame packet for any future opponent
Governance
● Game Ops is produced by Nexus. No manual override of computed values.
● Staff tagging is human input that enhances the system but does not override automated
outputs.
● All packet outputs are deterministic: same inputs → same outputs.
● PlayVision enhanced modes (V2/V3) augment staff workflow — they do not replace
coaching judgment.
● Simulation projections at halftime are directional aids, not prescriptions.
● Multi-game continuity is automatic when prior game data exists in the system.
UI / GOVERNANCE NOTE
Scouting and game intelligence only. All values are produced by Nexus. No evaluation,
weighting, or normalization logic lives here. Game Ops consumes truth from Player Intelligence
and Team Intelligence — it does not produce or modify truth.
That's both docs — Scouting Confidence Gates and Game Ops. Lock them?