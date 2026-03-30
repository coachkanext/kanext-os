# BASEBALL SCOUTING & GAME OPS
## File 05 -- v1.0

---

# SCOUTING CONFIDENCE GATES

## Purpose
Confidence % communicates evidence completeness + reliability for scouting (pregame) and postgame analysis. Does not change any scouting content or KR values.

## Data Tier Reference

| Tier | Definition |
|------|-----------|
| V1 -- Stats-Only | Public box scores, season stats, roster. No pitch-level data. |
| V1+ -- Stats + Licensed | V1 + third-party play-type data (pitch mix, batted ball data). Not owned. |
| V2 -- TrackMan (1 Season) | KaNeXT-owned TrackMan/Rapsodo data. Pitch-level tracking, spin rates, exit velocity. |
| V3 -- TrackMan Deep | Multiple seasons of TrackMan + film archive. Highest fidelity. |

## Scout Confidence Gate (Pregame)

| Data Available (Opponent) | Scout Confidence % |
|---|---|
| V1 stats-only: season stats + roster | 50-65% |
| V1 stats-only + multi-year (returning core) | 55-72% |
| V1+ licensed: pitch mix + batted ball (1 year) | 68-82% |
| V1+ licensed + multi-year | 74-88% |
| V2 TrackMan (1 season): >= 5 games processed | 78-90% |
| V2 TrackMan high coverage: >= 15 games | 83-93% |
| V3 TrackMan Deep: multi-season + film archive | 86-96% |

### Scout Confidence Adjusters
- Sample size: < 10 games in current season -> use bottom of range
- Recency: last 5 games show clear shift (injury, lineup change, rotation adjustment) -> -5 to -10 pts
- Roster volatility: rotation not stable, lineup changes frequently -> -5 to -10 pts
- System ambiguity: OSIE/PSIE still provisional -> -5 to -10 pts
- Prior meeting: played this opponent earlier this season -> +3 to +5 pts
- Conference familiarity: same conference opponent (play 3-game series) -> +3 to +5 pts

## Postgame Confidence Gate

| Data Available (Postgame) | Postgame Confidence % |
|---|---|
| V1: final box score + team totals | 50-65% |
| V1 + manual staff pitch charting | 58-72% |
| V1+ licensed: pitch-level data available | 68-82% |
| V2 TrackMan: full game processed | 80-92% |
| V3 TrackMan Deep + film archive | 88-96% |

---

# GAME OPS -- FULL SCOUTING INTELLIGENCE FLOW

## Global Rules (All 4 Phases)

**Determinism:** Same inputs produce same packet outputs.
**No Truth Mutation:** Game Ops references Player/Team Truth but NEVER recomputes or changes them.
**Time Anchors:**
- Pregame: generated T-24h to T-0h (refreshable)
- In-Game: live updates each half-inning or pitching change
- Mid-Game (5th Inning): generated once between 4th and 5th inning
- Postgame: generated after final out (refreshable if new data)

**Universal Output Fields:** Every packet MUST include: game_id, teams, date_time, venue, home_away, data_tier, confidence_pct, trace_notes.

---

## 1. PREGAME SCOUT PACKET

### 1.1 Inputs -- MUST PULL (read-only)

**Opposing Starting Pitcher:**
- KR, VKR/CKR/DKR/RKR/IQKR component breakdown
- Archetype (Ace, Strikeout Artist, Command Pitcher, Groundball Pitcher, Power Arm, Innings Eater)
- Pitch arsenal: pitch types, velocity ranges, movement profiles, usage rates
- Count tendencies: what pitch in 0-0? What pitch with 2 strikes? Fastball % first pitch?
- L/R splits: OPS allowed vs LHB vs RHB, platoon vulnerability
- Times-through-order data: ERA 1st time vs 2nd time vs 3rd time
- Recent performance: last 3 starts (IP, ERA, K, BB)
- Weakness zones: where does this pitcher give up damage? (arm-side, glove-side, up, down)

**Opposing Lineup (Each Hitter):**
- KR, HKR/PKR/FKR/SKR/IQKR
- Archetype (Power Hitter, Contact Hitter, Table Setter, Five-Tool, OBP Machine, etc.)
- Bats L/R/S
- Hot/cold streak (last 10 games BA/OPS vs season)
- Platoon splits: performance vs LHP and RHP
- Swing tendencies: pull %, oppo %, GB/FB/LD rates
- Stolen base threat: SB, SB%, sprint speed indicator

**Opposing Bullpen:**
- Closer: KR, archetype, recent usage (pitched yesterday? 2 of last 3 days?), availability status
- Setup: KR, archetype, handedness, availability
- Middle relief: KR, handedness, availability
- Unavailable arms (pitched 3 of last 4 days, injury)
- Bullpen aggregate remaining KR (available arms only)

**System Identity:**
- OSIE: offensive system + confidence %
- PSIE: pitching philosophy + confidence %

### 1.2 Outputs -- MUST OUTPUT (Ordered)

**A) Opposing Starting Pitcher Breakdown**
MUST OUTPUT:
- Name, role, KR, archetype
- Arsenal map: each pitch with velocity range, movement description, usage %, primary/secondary/show designation
- Count strategy: first pitch tendency, ahead-in-count approach, 2-strike putaway pitch
- Weakness pitch: which pitch has the worst whiff rate or highest damage allowed?
- L/R vulnerability: which side of the plate has the platoon advantage?
- Fatigue projection: when does this pitcher typically lose effectiveness? (pitch count, inning, times through order)
- "Attack plan": 2-3 approach bullets. Example: "Sit fastball early in counts. Lay off slider away below zone. Attack changeup when ahead."

**B) Opposing Lineup Scouting Cards (One Per Hitter)**
MUST OUTPUT per hitter:
- Name, position, bats, KR, archetype
- Threat level: primary offensive threat / secondary / lineup filler
- Key pitch to throw: what gets this hitter out? Example: "Breaking ball away. Cannot hit offspeed down."
- Key pitch to avoid: what does this hitter punish? Example: "Do NOT throw inside fastball. .400+ BA on pitches middle-in."
- Platoon note: advantage L or R?
- Steal threat: yes/no, success rate, requires slide step?
- Hot/cold: trending up or down?

**C) Opposing Bullpen Scouting**
MUST OUTPUT:
- Closer availability + KR + handedness
- Setup availability + KR + handedness
- Total available bullpen innings estimate
- Bullpen weakness: who is the weak link? When do they come in?
- Strategic recommendation: "If we get to their bullpen early, target [middle reliever] in 6th-7th."

**D) Offensive Strategy Recommendations**
MUST OUTPUT:
- **Steal opportunities:** which pitchers are slow to the plate? Which catchers have low CS%? When to run.
- **Bunt situations:** when is sacrifice bunt viable? Who should bunt?
- **Hit-and-run situations:** against which pitchers/counts?
- **Pinch-hit plan:** when to use bench bats (matchup, platoon, late-game)
- **Lineup construction notes:** batting order recommendations based on SP matchup

**E) Defensive Strategy Recommendations**
MUST OUTPUT:
- **Shift recommendations:** for each opposing hitter, optimal defensive alignment (shift L/R, no shift, infield in)
- **Pitching plan vs each hitter:** primary pitch sequence, pitch to avoid, location target
- **Pick-off / hold recommendations:** which runners to watch, slide step required for whom
- **Defensive substitution plan:** when to bring in defensive replacements late in game

**F) Leverage Plan**
MUST OUTPUT:
- Top 5 "Attack" points (where opponent is vulnerable)
- Top 5 "Deny" points (opponent's strengths to neutralize)
- Top 3 "Stress" points (areas to pressure: baserunning, bullpen workload, platoon exploitation)
- Prior meeting reference (if applicable)

**G) scout_confidence_pct**
MUST OUTPUT: confidence %, data tier, "why not higher" explanation.

---

## 2. IN-GAME LIVE OPS

### 2.1 Roles
- HC (Manager): consumes decisions, does not tag
- Pitching Coach: pitcher effectiveness tracking, bullpen warmup decisions
- Hitting Coach: approach adjustments, pinch-hit recommendations
- Bench Coach: matchup tracking, defensive alignment, substitution logistics

### 2.2 Live Panels (Locked Order)

**Panel 1 -- Situation Strip (Manager Primary)**
- Score, inning, outs, count, base state
- Pitch count (current pitcher)
- Bullpen status: who is warming, who is available, who is unavailable
- Run expectancy for current base/out state

**Panel 2 -- Pitcher Effectiveness Monitor**
- Current pitcher: pitch count, K's, BB's, hits allowed this outing
- Velocity trend: is velocity holding or dropping? (if TrackMan available)
- Times through order: 1st, 2nd, 3rd (flag 3rd TTO penalty)
- Next 3 hitters due: KR, handedness, matchup advantage indicator
- Recommendation: "Stay with starter" / "Begin warming [setup man]" / "Pull after this batter"

**Panel 3 -- Matchup Advantage Tracker**
- Current batter vs current pitcher: KR differential, archetype interaction, platoon advantage
- Pinch-hit recommendation: is there a bench bat with better matchup? By how much?
- Upcoming: next 3 matchup previews

**Panel 4 -- Baserunning / Defensive Situation**
- Runner speed ratings on base (SKR)
- Steal recommendation: yes/no, pitcher delivery time, catcher arm
- Defensive alignment current vs recommended shift
- Bunt defense: is bunt likely? Alignment needed?

**Panel 5 -- Opponent Tendency Feed**
- Last 10 pitches thrown: type, location, result
- Pitch selection pattern: is pitcher falling into predictable sequence?
- Hitter approach pattern: is hitter adjusting? Expanding zone? Sitting on pitch?

**Panel 6 -- Manager Overlay (Locked Caps)**
- Max 3 active alerts
- Max 3 next-dead-ball bullets
- Format: "They're doing X. Do Y."
- Anti-spam: <= 1 new alert per half-inning, max 3 per 3 innings

---

## 3. MID-GAME STAFF PACKET (5th Inning)

### 3.1 Inputs
- Game state through 4.5 innings
- Pitch count + effectiveness data
- Batting line card (who has faced SP how many times)
- Bullpen availability
- Pregame leverage plan

### 3.2 Outputs (A-H, Fixed Order)

**Top: Top-3 Decision Summary**
3 bullets, ranked, each = "problem -> adjustment"

**A) Game State Dashboard**
Score, hit/error/LOB totals, pitch count, bullpen availability remaining innings

**B) Starter Assessment**
- Current pitch count, projected pitch count through 6th/7th/8th
- Effectiveness trend: K rate, walk rate, hard contact rate this game vs season average
- Times through order: 2nd TTO efficiency. Projected 3rd TTO penalty.
- Recommendation: "Starter effective through 7th" OR "Begin bullpen transition in 6th" OR "Pull after next baserunner"

**C) Plan Adherence vs Pregame**
"We said attack early in counts -> have we?" Check pregame leverage plan against actual execution.

**D) Offensive Performance Assessment**
- Team BA/OBP/SLG this game vs opponent SP
- Who is hot: which hitters are seeing the ball well?
- Who is cold: approach adjustments needed?
- Baserunning opportunities: did we run when we should have?

**E) Pitching Performance Assessment**
- Starter effectiveness by pitch type: what's working, what's not?
- Count management: getting ahead? Falling behind?
- Damage allowed: which hitters have hurt us? What pitch did they hit?

**F) Bullpen Plan for Remaining Innings**
- Projected starter departure inning
- Bridge plan: who pitches 6th? 7th? 8th? 9th?
- Matchup considerations: L/R splits for upcoming hitters
- Unavailable arms reminder

**G) Lineup Adjustments for Second Time Through**
- Pinch-hit targets for 7th+ inning
- Defensive replacement plan for late innings
- Double-switch considerations (if applicable)

**H) Simulation Projection**
- Win probability from current position
- Win probability if adjustment A is made (e.g., "pull starter now")
- Win probability if adjustment B is made (e.g., "ride starter through 7th")
- Key variable: "The single factor most likely to swing the outcome is [X]"

---

## 4. POSTGAME STAFF PACKET

### 4.1 Confidence
postgame_confidence_pct from Postgame Confidence Gate + data_tier.

### 4.2 Outputs (Ordered)

**1. Final Dashboard**
Final score, team stat line (H/R/E/LOB), pitching line (IP/H/R/ER/BB/K for each pitcher used), key play summary.

**2. Plan Audit**
Map pregame leverage plan against actual results. What worked, what failed, why. "We said attack their slider -> we swung at 8 sliders out of the zone in the first 3 innings." OR "We said steal on their RHP -> went 3-for-3 on steal attempts."

**3. Starting Pitcher Grade**
- IP, pitch count, K, BB, H, R, ER
- Quality start: yes/no
- Effectiveness by times through order (1st / 2nd / 3rd)
- Best pitch, worst pitch
- Grade: A (dominant) / B (solid) / C (adequate) / D (struggled) / F (shelled)

**4. Bullpen Grade**
- Each reliever: IP, inherited runners scored, K, BB, H, R
- Leverage grade: did high-leverage arms pitch in high-leverage situations?
- Blown leads / held leads

**5. Offensive Performance vs Expected**
- Each hitter: actual AB results vs pregame KR-expected production
- Overperformers and underperformers flagged
- Approach quality: did hitters execute the pregame plan? (e.g., "Patient approach in early counts as planned" or "Chased breaking balls despite plan to lay off")

**6. Defensive Impact**
- Errors and their run impact
- Key defensive plays (positive and negative) with estimated run value
- Catcher performance: framing, blocking, throwing, game-calling

**7. Development Flags**
Per player, flag:
- Hitters: approach changes needed, mechanical observations, platoon data point added
- Pitchers: velocity trends, pitch effectiveness changes, command observations
- "This game confirms [player] struggles with [pitch type] -> add to development plan"

**8. Pitching Staff Availability for Next 3 Games**
- Which pitchers are unavailable tomorrow?
- Which are available but on limited usage?
- Projected availability for next series

**9. Next Actions**
- Next game priorities
- Practice seeds (3-6 drills/focus points)
- Development prescriptions (player-specific)
- Lineup/rotation considerations for upcoming games

**10. Multi-Game Continuity**
If this is game 2 or 3 of a series: reference prior games. Save learnings for next meeting with this opponent.

### 4.3 KR Update Trigger
After postgame packet: individual player KRs recalculate with new game data. Team KR updates. Coverage map, fit%, and fragility flags update. If 5-game checkpoint reached: OSIE/PSIE re-evaluates.

---

## GOVERNANCE
- Game Ops is produced by Nexus. No manual override of computed values.
- All packet outputs are deterministic: same inputs produce same outputs.
- Game Ops consumes truth from Player Intelligence and Team Intelligence -- it does not produce or modify truth.
- In-game panels at V2/V3 auto-populate from TrackMan. V1 requires manual tracking.
- Simulation projections at mid-game are directional aids, not prescriptions.
