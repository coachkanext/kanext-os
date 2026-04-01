# KaNeXT Men's Track and Field Intelligence - Master Skill v1

---
name: KaNeXT Men's Track and Field Intelligence
description: >
  Use this skill for ANY men's track and field intelligence request including: athlete evaluation, KR rating, event-group analysis, meet simulation, scouting, development planning, PR projection, recruiting gap analysis, scholarship allocation, pro transition, Olympic projection, KLVN normalization, legend calibration, or any reference to the KaNeXT MTF intelligence system, Nexus MTF, event KR, or the evaluation pipeline.
---

## HOW THIS WORKS

The Men's Track and Field (MTF) intelligence system is split across 6 knowledge files + this skill. Each file has a specific job. You route to the right file(s) based on what is being asked.

**CRITICAL DIFFERENCE FROM TEAM SPORTS:** Track and field is an individual sport with objective performance data. Times and distances are facts, not judgments. The anchor is always the performance mark itself. There is no subjectivity in a 10.50 100m or a 7.85m long jump.

**CRITICAL:** File 02 (Reference) is large. NEVER load the whole thing. Search it for specific sections using the search terms below.

## EVENT GROUPS

The system evaluates athletes by event group. Each group has its own component KR structure, OPF weights, trait library, and archetypes.

| Group | Events | Component KRs |
|-------|--------|---------------|
| Sprints | 100m, 200m, 400m | PKR, TKR, AKR, CKR, IQKR |
| Hurdles | 110m H, 400m H | PKR, TKR, AKR, CKR, IQKR |
| Middle Distance | 800m, 1500m | PKR, EKR, TKR, CKR, IQKR |
| Distance | 3000m SC, 5000m, 10000m | PKR, EKR, TKR, CKR, IQKR |
| Jumps | HJ, LJ, TJ, PV | PKR, TKR, AKR, CKR, IQKR |
| Throws | SP, DT, HT, JT | PKR, TKR, AKR, CKR, IQKR |
| Decathlon | 10 events (combined) | Composite of relevant event-group KRs weighted by World Athletics scoring table |
| Relays | 4x100m, 4x400m | Not individually rated - used in Team Intelligence only |

## ROUTING TABLE

### "Evaluate this athlete" / "What's his KR?" / "Rate [athlete]"

**FIRST: Identify the event group.** The evaluation protocol, component KRs, and OPF weights differ by event group.

**SECOND: Determine the data tier.**
- V1: Season/career PRs + meet results + competition history (most evaluations of real athletes)
- V2: V1 + biomechanical data, split times, sector distances, approach velocities
- V3: V2 + training data, physiological testing, GPS/force plate data

**V1 evaluations (PRs + meet results):**
1. Set Coach Context (program, level, event group focus)
2. Phase 3 - Performance Anchor (map PR against legend tiers for the event at the athlete's level)
3. Phase 6 - Component KR scoring using OPF weights for the event group
4. Phase 6 adjusts within Phase 3 +/-10
5. Final KR output with wind/altitude/timing notes

Search **File 01** for "V1 EVALUATION PROTOCOL"
Search **File 02** for event-specific reference lookups (trait bands, OPF weights, archetypes, qualifying standards)
Search the **Legend file matching the athlete's level** for KR interpretation

### Legend file routing (5 college levels + pro):
- NCAA D1 -> Legend_NCAA_D1_MTF_v1
- NCAA D2 -> Legend_NCAA_D2_MTF_v1
- NCAA D3 -> Legend_NCAA_D3_MTF_v1
- NAIA -> Legend_NAIA_MTF_v1
- NJCAA -> Legend_NJCAA_MTF_v1
- Pro -> Pro_MTF_KR_Legend_v1

### "Team scoring projection" / "Event coverage" / "Roster analysis"
Search **File 03** (Team Intelligence) for "Team Scoring Projection" or "Event Coverage"
Requires individual athlete KRs as input

### "Simulate this meet" / "Dual meet projection" / "Conference meet prediction"
Search **File 04** (Simulation Engine) for meet format and scoring system
Requires athlete KRs + PRs as input

### "Scout [opponent]" / "Pre-meet report" / "Heat sheet analysis"
Search **File 05** (Scouting and Meet Ops) for the relevant phase

### "Development plan" / "PR projection" / "Training periodization"
Search **File 06** (Downstream Engines) for "Development Intelligence"
Requires athlete KR + PR history as input

### "Pro transition" / "Olympic trials projection" / "Professional contract"
Search **File 06** (Downstream Engines) for "Pro Transition"
Search **File 02** for pro-specific tables

### "Scholarship allocation" / "Recruiting gap" / "Where do we need points?"
Search **File 03** (Team Intelligence) for "Scholarship Allocation" or "Recruiting Gap Analysis"

### "What does a [X] KR mean?" / "Calibrate the legend"
Search **File 02** for the relevant legend section
For calibration: use web search for real athlete data to compare against

## UNIVERSAL RULES (Apply to EVERY response)

1. **Performance is objective truth.** A 10.50 100m is a 10.50 100m. Times and distances are facts. The Performance KR (PKR) is always the primary anchor.
2. **Deterministic:** Same inputs produce same outputs. No randomness.
3. **No fabrication:** Missing data = UNSCORED. Never guess a PR or meet result.
4. **Confidence always shown:** Every output includes confidence %.
5. **Wind-legal distinction is mandatory.** Any sprint or jump mark must note wind reading. Wind-aided marks (>+2.0 m/s) are flagged and cannot anchor PKR at face value. Use wind-adjusted conversion formulas.
6. **Indoor vs outdoor tracked separately.** Indoor PRs and outdoor PRs are distinct. Indoor marks are generally slower/shorter due to track geometry, no wind assistance, and banked turns. Do not directly compare indoor and outdoor marks without conversion.
7. **Altitude adjustment required for distance events.** Marks set at altitude (>1000m / 3280ft) receive altitude adjustment per World Athletics guidelines. Flag altitude-assisted marks.
8. **FAT vs hand timing.** Only Fully Automatic Timing (FAT) marks are valid for evaluation. Hand-timed marks receive +0.24s adjustment for distances up to 400m.
9. **KLVN normalizes CONTEXT, not PERFORMANCE.** Lambda adjusts for meet quality and competition context. A 10.50 is a 10.50 regardless of where it was run - but the conditions under which it was achieved (competition depth, round of competition, weather) inform component KRs beyond PKR.
10. **KR is universal:** One athlete = one KR = multiple legend reads at different levels. Do NOT report separate KR numbers for different levels.
11. **Legends are display-only:** They interpret KR. They do not produce KR.
12. **Downstream never modifies upstream:** Development engine, pro transition, scouting - they consume KR but NEVER change it.
13. **Web search for current data:** Always search for current PRs, meet results, and rankings when evaluating real athletes. The knowledge files contain the SYSTEM - web search provides the DATA about specific athletes.
14. **Decathlon uses World Athletics scoring tables.** Combined event scoring follows the IAAF/World Athletics points tables. Do not invent point conversions.
15. **MEN'S ONLY.** This system evaluates men's track and field. Do not apply to women's events, women's benchmarks, or heptathlon.

## COMPONENT KR DEFINITIONS

### PKR - Performance KR (all event groups)
The athlete's best verified performances mapped against event-specific legends. This is the PRIMARY anchor. In track and field, the mark is truth.
- Inputs: Season best, career PR, indoor PR, outdoor PR
- Wind-legal status, altitude status, timing method
- Improvement trajectory (PR progression year over year)

### TKR - Technical KR
- Sprints/Hurdles: Start mechanics, drive phase, top-end mechanics, hurdle clearance technique, transition smoothness
- Jumps: Approach consistency, takeoff mechanics, flight/bar clearance technique, landing
- Throws: Implement delivery mechanics, ring/runway discipline, release angle, rotational or linear technique execution
- Middle Distance/Distance: Running economy, form efficiency under fatigue

### AKR - Athletic/Physical KR (Sprints, Hurdles, Jumps, Throws)
- Sprints/Hurdles: Reaction time, acceleration, top-end speed, speed endurance, flexibility
- Jumps: Explosive power, approach speed, takeoff velocity, body control
- Throws: Raw strength, rotational power, implement-specific power, size/frame

### EKR - Endurance KR (Middle Distance, Distance only)
- Aerobic capacity, lactate threshold, VO2max indicators
- Ability to maintain pace, negative split capability
- Performance stability across race distances
- Cross country performance as endurance proxy

### CKR - Competition KR (all event groups)
- Championship meet performance vs regular season
- Round-by-round improvement (prelims to finals)
- Head-to-head record against ranked opponents
- Consistency (standard deviation of marks across season)
- Performance in adverse conditions (wind, rain, heat)

### IQKR - Intelligence/Tactical KR (all event groups)
- Sprints/Hurdles: Race execution, lane assignment adaptation, pace judgment (400m)
- Middle Distance/Distance: Pace judgment, tactical positioning, kick timing, surging ability, race-reading
- Jumps: Approach adjustment, height/distance progression strategy, pass strategy
- Throws: Attempt management, competition strategy, adjustment between throws

## FILE INVENTORY

| # | File | Contents |
|---|------|----------|
| 01 | Athlete Eval Process | Pipeline steps, PR-based anchoring, confidence gates, wind/altitude/timing protocols |
| 02 | Athlete Eval Reference | Trait library per event group, archetypes, OPF weights, qualifying standards, badges, KLVN |
| 03 | Team Intelligence | Team scoring projection, event coverage, scholarship allocation (12.6), recruiting gap analysis |
| 04 | Simulation Engine | Meet simulation (dual, conference, regionals, nationals), scoring systems, relay optimization |
| 05 | Scouting and Meet Ops | Pre-meet scouting, heat sheet analysis, event-by-event matchups, in-meet adjustments |
| 06 | Downstream Engines | Development engine (periodization, PR projection), pro transition (Olympic trials, contracts) |
