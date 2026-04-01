# SOFTBALL SCOUTING & GAME OPS
## File 05 - v1.0

---

# SCOUTING CONFIDENCE GATES

## Data Tier Reference

| Tier | Definition |
|------|-----------|
| V1 | Public box scores, season stats, roster. No pitch-tracking data. |
| V1+ | V1 + third-party play-type data (pitch mix, batted ball data). |
| V2 | KaNeXT-owned pitch-tracking data. Pitch-level tracking, spin rates, speed. |
| V3 | Multiple seasons of tracking + film archive. Highest fidelity. |

## Scout Confidence Gate (Pregame)

| Data Available (Opponent) | Scout Confidence % |
|---|---|
| V1 stats-only: season stats + roster | 50-65% |
| V1 stats-only + multi-year (returning core) | 55-72% |
| V1+ pitch data (1 year) | 68-82% |
| V1+ multi-year | 74-88% |
| V2 tracking (1 season, >= 5 games) | 78-90% |
| V2 high coverage (>= 15 games) | 83-93% |
| V3 multi-season + film | 86-96% |

### Adjusters
- Sample < 10 games: bottom of range
- Recency shift (injury, lineup change): -5 to -10 pts
- Roster volatility: -5 to -10 pts
- Prior meeting this season: +3 to +5 pts
- Conference familiarity: +3 to +5 pts

## Postgame Confidence Gate

| Data Available | Postgame Confidence % |
|---|---|
| V1: final box score | 50-65% |
| V1 + staff pitch charting | 58-72% |
| V1+ pitch-level data | 68-82% |
| V2 full game tracking | 80-92% |
| V3 + film | 88-96% |

---

# GAME OPS - FULL SCOUTING INTELLIGENCE FLOW

## Global Rules
**Determinism:** Same inputs = same outputs. **No Truth Mutation.** **Time Anchors:** Pregame T-24h to T-0h, In-Game per half-inning, Mid-Game 4th inning, Postgame after final out. **Universal fields:** game_id, teams, date_time, venue, home_away, data_tier, confidence_pct.

---

## 1. PREGAME SCOUT PACKET

### 1.1 Inputs (read-only)

**Opposing Starting Pitcher:**
KR, VKR/CKR/DKR/RKR/IQKR, archetype, pitch arsenal (rise, drop, change, curve, screw with speed ranges and usage), count tendencies, L/R splits, recent performance (last 3 starts), weakness zones, tournament workload status (how many IP in last 5 days?)

**Opposing Lineup (Each Hitter):**
KR, HKR/PKR/FKR/SKR/IQKR, archetype, bats L/R/S, **slap hitter status (yes/no/dual-threat)**, hot/cold streak, platoon splits, swing tendencies, steal threat

**Opposing Pitching Depth:**
#2 pitcher KR/archetype/availability, #3 if exists, total available pitching innings estimate

**System Identity:** OSIE + PSIE with confidence %

### 1.2 Outputs (Ordered)

**A) Opposing Pitcher Breakdown**
Name, KR, archetype. Arsenal map: each pitch with speed range, movement, usage. Count strategy. Weakness pitch. L/R vulnerability. Fatigue projection (workload in last 5 days). Tournament status. "Attack plan": 2-3 approach bullets.

**B) Opposing Lineup Scouting Cards (Per Hitter)**
Name, position, bats, KR, archetype. **Slap hitter status.** Threat level. Key pitch to throw. Key pitch to avoid. Platoon note. Steal threat. Hot/cold.

**SLAP HITTER SCOUTING (SOFTBALL-SPECIFIC):**
For each identified slapper in opposing lineup, MUST include:
- Slap type preference (soft slap, hard slap, drag bunt, swing-away)
- Defensive alignment recommendation (corners in, middle in, or standard)
- Bunt defense assignment
- When she's likely to slap vs swing (count, score, inning)
- Speed rating and steal threat level

**C) Opposing Pitching Depth Scouting**
#2 pitcher availability, KR, handedness. Total available innings estimate. Weakness: who is the weak link? "If we extend their ace past 5 innings, we face [#2] who is [weakness]."

**D) Offensive Strategy Recommendations**
- **Steal opportunities:** pitcher delivery speed, catcher arm, when to run
- **Bunt situations:** when is bunt viable, who should bunt
- **Slap defense:** how to defend opposing slappers
- **Pinch-hit plan:** bench bats and matchup targets
- **Lineup construction:** order recommendations based on pitcher matchup

**E) Defensive Strategy Recommendations**
- **Slap defense alignment:** for each opposing slapper, optimal alignment
- **Pitching plan vs each hitter:** primary sequence, pitch to avoid, location
- **Bunt defense assignment:** who covers what on bunt plays
- **Steal defense:** who to watch, slide step required

**F) Leverage Plan**
Top 5 Attack points, Top 5 Deny points, Top 3 Stress points. Prior meeting reference.

**G) scout_confidence_pct**

---

## 2. IN-GAME LIVE OPS

### 2.1 Roles
- HC: consumes decisions
- Pitching Coach: pitcher effectiveness, change decisions
- Hitting Coach: approach adjustments, pinch-hit recommendations
- Third Base Coach: baserunning decisions, steal/bunt signals

### 2.2 Live Panels

**Panel 1 - Situation Strip**
Score, inning, outs, count, base state, run-rule status (how many runs needed for run rule, innings remaining for run rule)

**Panel 2 - Pitcher Effectiveness Monitor**
Current pitcher: IP this game, K, BB, hits. Speed trend (if tracking). Times through order. Next 3 hitters. **Tournament workload tracker: IP in last 3 days / 5 days.** Recommendation: stay / begin warming #2 / pull.

**Panel 3 - Matchup Advantage Tracker**
Current batter vs pitcher: KR differential, archetype interaction, platoon advantage, **slap hitter indicator**. Pinch-hit recommendation.

**Panel 4 - Baserunning / Defensive Situation**
Runner speeds (SKR). Steal recommendation. Defensive alignment. **Slap defense alignment** (if slapper at bat). Bunt defense ready.

**Panel 5 - Opponent Tendency Feed**
Last 10 pitches. Pitch pattern. Hitter approach pattern.

**Panel 6 - Manager Overlay**
Max 3 alerts. Max 3 next-dead-ball bullets. Anti-spam: <= 1 new alert per half-inning.

---

## 3. MID-GAME STAFF PACKET (4th Inning)

Note: Moved from 5th inning (baseball) to 4th inning because softball games are 7 innings.

### Outputs (A-H)

**Top: Top-3 Decision Summary**

**A) Game State Dashboard** - Score, hit/error/LOB, pitch count equivalent (pitcher IP this game + recent days)

**B) Pitcher Assessment** - Effectiveness trend. Times through order. Tournament workload status. Recommendation for remaining innings.

**C) Plan Adherence** - Check pregame plan against actual execution.

**D) Offensive Performance** - Who is hot/cold. Approach quality. Baserunning opportunities.

**E) Pitching Performance** - What's working, what's not. Damage allowed.

**F) Pitching Plan for Remaining Innings** - Stay with pitcher or change? If change, when and to whom?

**G) Lineup Adjustments** - Pinch-hit targets, defensive replacements, **slap/swing decision guidance for dual-threat slappers based on game state.**

**H) Simulation Projection** - Win probability, run-rule probability, key variable.

---

## 4. POSTGAME STAFF PACKET

### Outputs (Ordered)

**1. Final Dashboard** - Score, team stat line, pitching line, key plays.

**2. Plan Audit** - Pregame plan vs actual execution.

**3. Pitcher Grade** - IP, K, BB, H, R, ER. Complete game status. Effectiveness by times through order. Tournament workload context. Grade: A/B/C/D/F.

**4. Offensive Performance vs Expected** - Each hitter: actual vs KR-expected. Approach quality audit.

**5. Defensive Impact** - Errors, key plays, **slap defense effectiveness.**

**6. Development Flags** - Per player: approach changes, observations, development prescriptions.

**7. Pitching Staff Availability** - Who is available tomorrow? Tournament workload projection for next 3 games.

**8. Next Actions** - Next game priorities, practice seeds, development prescriptions, lineup/pitching decisions.

**9. Multi-Game Continuity** - Reference prior games in series. Tournament progression context.

### KR Update Trigger
After postgame: player KRs recalculate with new data. Team KR updates. If 5-game checkpoint: OSIE/PSIE re-evaluates.

---

## GOVERNANCE
- Game Ops consumes truth, never modifies it
- All outputs deterministic
- Mid-game packet at 4th inning (not 5th - 7-inning game)
- Slap defense scouting is mandatory for any opponent with identified slappers
- Tournament workload tracking is mandatory for pitcher effectiveness monitoring
- Run-rule status tracked throughout game
