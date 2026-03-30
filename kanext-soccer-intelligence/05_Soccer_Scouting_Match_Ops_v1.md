# SCOUTING CONFIDENCE GATES

Scouting Confidence Gates -- Scout + Postmatch (Locked Tables)

Purpose
Confidence% communicates evidence completeness + reliability for scouting (prematch) and postmatch analysis. Does not change any scouting content or KR values -- it qualifies reliability only.

## Data Tier Reference

| Tier | Definition |
|---|---|
| V1 -- Stats-Only | Basic match stats, roster, season totals. No event data. |
| V1+ -- Stats + Advanced | V1 + xG, xA, progressive stats, pressures. |
| V2 -- Event Data (1 Season) | Opta/StatsBomb/Wyscout tagged events. Full play-type data. |
| V3 -- Event Deep (Multi-Season) | Multi-season event data + tracking data + film archive. |

## Scout Confidence Gate (Prematch)

| Data Available (Opponent) | Scout Confidence % |
|---|---|
| V1 stats-only: season totals + roster | 45-60% |
| V1 stats-only + multi-year (stable identity) | 50-65% |
| V1+ advanced metrics: xG/xA + progressive stats (1 year) | 60-75% |
| V1+ advanced + multi-year | 68-80% |
| V2 event data (1 season): 5+ matches processed | 72-85% |
| V2 event data high coverage: 10+ matches + stable XI | 78-90% |
| V3 multi-season event + tracking + film archive | 85-95% |

## Scout Confidence Adjusters
- Sample size: fewer than 5 current-season matches -> bottom of range
- Recency: last 3 matches show clear shift (injuries/lineup/system change) -> downshift 5-10 pts
- Managerial change: new manager within last 5 matches -> downshift 10-15 pts
- Roster volatility: transfer window activity, rotation instability -> downshift 5-10 pts
- System ambiguity: OSIE/DSIE provisional -> downshift 5-10 pts
- Multi-match continuity: prior match against same opponent in system -> upshift 3-5 pts
- High stability: locked systems + stable XI -> upshift toward top of range

## Postmatch Confidence Gate

| Data Available (Postmatch) | Postmatch Confidence % |
|---|---|
| V1 stats-only: final stats + basic splits | 45-60% |
| V1 + manual staff tags (key actions logged) | 55-70% |
| V1+ advanced metrics: xG, shot maps, passing networks | 65-80% |
| V1+ + multi-match trend context | 70-85% |
| V2 event data: full tagged match + clip list | 78-90% |
| V2 + high completeness: accurate lineups + 10+ teaching clips | 85-93% |
| V3 multi-season context + film archive + trend analysis | 88-96% |

---

# MATCH OPS -- FULL SCOUTING INTELLIGENCE FLOW

## Global Rules (Apply to All 4 Phases)

Determinism: Same inputs -> same packet sections + ordering + outputs.
No Truth Mutation: Match Ops references Player/Team Truth but never recomputes.

Time Anchors:
- Prematch: generated T-24h to T-0h (refreshable)
- In-Match: live updates each stoppage/dead ball
- Halftime: generated once at halftime whistle
- Postmatch: generated once after final whistle

Universal Output Fields (every packet):
- match_id, teams, date_time, venue, home_away_neutral
- data_tier (V1 / V1+ / V2 / V3)
- confidence_pct for that phase
- trace_notes (missing/assumed inputs)

Multi-Match Opponent Continuity: If prior match against same opponent exists, MUST reference it in prematch, halftime, and postmatch packets.

---

## 1. Prematch Scout Packet

### 1.1 Inputs -- MUST PULL (read-only)

Opponent Player Truth (per rotation player >= 5% minutes):
- Final System Off KR / Def KR
- Archetype, Badges, Overrides, System Risks
- Player confidence_pct

Opponent Team Truth:
- Rotation table + participation%
- Team Off KR / Def KR / Overall Team KR
- Offensive_Fit% / Defensive_Fit% / Overall_Fit%
- Coverage Map, Missing Demands, Fragility Flags

System Identity:
- OSIE + DSIE outputs (system + confidence)
- Defensive Line Height, PPDA, Pressing Triggers
- Formation

Granular (V1+/V2/V3 if available):
- xG by match, shot maps, progressive pass maps
- Pressing intensity data, defensive action zones
- Set piece routines (corner/FK delivery patterns)

### 1.2 Outputs -- MUST OUTPUT (Ordered)

**A) Opponent Offensive Identity**
- off_system_name (from OSIE) + system confidence%
- tempo_band (high/medium/low) + evidence
- primary_creators[] (players + roles: playmaker, dribbler, target man, set piece specialist)
- chance_creation_profile: how they create (positional play / transition / set pieces / individual brilliance / crosses)
- shot_diet_intent vs reality: inside box%, outside box%, headed%, set piece%
- pressure_points: where offense breaks (turnovers under press, weak foot dependency, lack of plan B, late-match patterns)
- system_vulnerabilities: from Missing Demands + Fragility Flags

**B) Shot Profile (Team + Player)**
- Team shot map summary (zones + priorities)
- Player shot cards (top 8-10 rotation players): preferred zones, volume, efficiency, shooting foot
- "allow / contest / deny" shot permissions by zone

**C) Build-Up Patterns + Pressing Triggers**
- Build-up structure: from GK, from defensive third, through midfield
- Pressing trigger identification: when do they press? (backward pass, GK distribution, wing switch, specific player receiving)
- Transition speed: how quickly do they move from defense to attack?
- Width vs centrality: where does their final-third attack concentrate?

**D) Set Piece Threat Assessment**
- Corner routine analysis: inswing/outswing, near post/far post/penalty spot, short corner frequency
- Free kick threat: who takes, from where, direct shot vs delivery, wall positioning
- Throw-in patterns: long throw threat?, quick throw frequency
- Penalty taker identification and record
- Set piece xG contribution (% of total xG from set pieces)

**E) Defensive Identity**
- def_system_name (from DSIE) + system confidence%
- defensive_line_height + compactness
- pressing_intensity_band (aggressive/moderate/passive)
- transition_defense_speed (fast/medium/slow recovery)
- weakness_exploitation_map: where are they vulnerable? (wide areas? between lines? behind the line? set pieces? second balls?)

**F) Key Player Threat Matrix**
- Top 5 threats ranked by KR + system importance
- Each: archetype, primary threat, how to neutralize, who should mark/track
- Fragility check: if neutralized, what happens to their team identity?

**G) Matchup Recommendations**
- Recommended formation + system
- Specific matchup assignments (who marks who)
- Tactical plan: how to create, how to defend, how to transition
- Set piece plan: attacking (exploit their weakness) and defending (counter their strength)

**H) Simulation Projection**
- Pre-match win/draw/loss probability
- Expected goals for/against
- Key variable: "The single factor most likely to determine the outcome"

---

## 2. In-Match Live Ops

### 2.1 Staff Roles
- HC (Head Coach): Receives filtered alerts only. Max 3 active.
- AC1 (Tactical Assistant): Monitors opponent patterns, formation changes
- AC2 (Performance Analyst): Shot/chance tracking, pressing effectiveness
- AC3 (Set Piece / Substitution): Foul tracking, fatigue monitoring, sub timing

### 2.2 Panels (Fixed Order)

**Panel 1 -- Situation Strip (HC primary)**
Score, time, possession phase, substitutions remaining, cards, run tracker (last 5 min xG flow)

**Panel 2 -- Live Lineups + Matchups**
Current XI + positions + matchup assignments, on-pitch aggregate KR, mismatch flags

**Panel 3 -- Pressing + Territorial Monitor**
PPDA live estimate, field tilt, pressing success rate, territory comparison to prematch plan

**Panel 4 -- Chance + Shot Pulse**
Last 8 chances (type + xG value), shot map building live, xG running total for both teams

**Panel 5 -- Opponent Pattern Feed**
Last 10 opponent build-up sequences, repetition detection, formation change detection

**Panel 6 -- HC Alert Overlay**
Max 3 active alerts. Each alert = one sentence + one action.

### 2.3 Anti-Spam Rules
- <= 1 new alert per 90 seconds
- <= 3 alerts per 5 minutes
- Max 3 active
- Each alert expires after 3 minutes unless re-triggered

---

## 3. Halftime Staff Packet

### 3.1 Outputs (A-K, Fixed Order)

**Top: Top-3 Decision Summary**
3 bullets, ranked. Each = "problem -> adjustment"

**A) Match State Dashboard**
Score, xG (us vs them), possession%, shots, corners, cards, xG timeline

**B) Performance vs xG**
Are we over/underperforming xG? By how much? Clinical or wasteful?

**C) Plan Adherence vs Prematch**
"We said press high -> did we?" Tactical plan checklist: hit/miss + consequence

**D) Opponent Offense Analysis**
What they're running most. Where they're hurting us. What they avoided.

**E) Opponent Defense Analysis**
Their shape against us. What they're denying. Where we found space.

**F) Our Offense Assessment**
Chance creation quality. Who is creating. What's working and what isn't.

**G) Our Defense Assessment**
Where we're breaking. Pressing effectiveness. Transition defense quality.

**H) Lineups + Substitution Analysis**
Which partnerships are working/failing. Fatigue indicators. Sub timing recommendations.

**I) Constraints + Risk**
Cards, injuries, fatigue. "Cannot do" list.

**J) Simulation Projection**
Win/draw/loss probability from current position. Projected xG for full match. Key adjustment impact modeling.

**K) Adjustments Sandbox**
2-5 tactical options with benefit + risk + projected impact.

---

## 4. Postmatch Staff Packet

### 4.1 Outputs (Ordered)

1. **Final Dashboard** -- Score, xG, possession, shots, corners, cards, set piece analysis
2. **xG vs Actual** -- Over/underperformance analysis. Clinical or wasteful?
3. **Plan Audit** -- What worked, what failed, mapped to prematch plan
4. **Opponent O/D Audit** -- Did OSIE/DSIE predictions hold? Surprises?
5. **Our O/D Audit** -- How did we perform vs plan?
6. **Player Postmatch Cards** -- Each rotation player: performance vs expectation, key actions, rating
7. **Pressing Effectiveness** -- PPDA, press success rate, where we won/lost the press battle
8. **Set Piece Audit** -- How did our set piece plan perform? Attacking and defending.
9. **Clip + Teach List** -- Priority clips, tags, teaching points for training
10. **Multi-Match Continuity** -- Save learnings for next meeting
11. **Next Actions:**
    - Next match priorities
    - Training seeds (3-8 drills/points)
    - Development prescriptions (player-specific)
    - Rotation considerations
    - Injury/fatigue monitoring flags

### 4.2 KR Update Trigger
After postmatch packet:
- Player KRs recalculate with new match data
- Team KR recalculates with updated Player KRs + minutes
- Coverage map, fit%, fragility flags update
- If match completes a 5-match window: system identity re-evaluates

---

## GOVERNANCE NOTE
Match Ops is produced by Nexus. No manual override of computed values. All outputs deterministic. Staff tagging enhances but does not override automated outputs. Match Ops consumes truth from Player Intelligence and Team Intelligence -- it does not produce or modify truth.
