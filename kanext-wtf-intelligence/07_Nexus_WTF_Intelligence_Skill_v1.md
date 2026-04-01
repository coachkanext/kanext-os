# KaNeXT Women's Track and Field Intelligence - Master Skill v1

---

## HOW THIS WORKS
The Women's Track and Field (WTF) intelligence system is split across 6 knowledge files + this skill. Each file has a specific job. You route to the right file(s) based on what's being asked.

**CRITICAL:** File 02 (Reference) is large. NEVER load the whole thing. Search it for specific sections using the search terms below.

**CRITICAL:** This is the WOMEN'S system. All benchmarks, implement weights, hurdle heights, and event structures are women's-specific. Do NOT reference men's benchmarks. Women's 100m hurdles (not 110m). Heptathlon (not decathlon). Women's shot put 4kg (not 7.26kg). Women's discus 1kg (not 2kg). Women's hammer 4kg (not 7.26kg). Women's javelin 600g (not 800g). Women's hurdle height 33 inches/0.838m for 100mH (not 42 inches/1.067m for men's 110mH).

---

## ROUTING TABLE

### "Evaluate this athlete" / "What's her KR?" / "Rate [athlete]"

**FIRST: Determine the event group.** The athlete's primary event determines the component KR structure.

| Event Group | Events | Component KRs |
|-------------|--------|---------------|
| Sprints | 100m, 200m, 400m | PKR, TKR, AKR, CKR, IQKR |
| Hurdles | 100m H, 400m H | PKR, TKR, AKR, CKR, IQKR |
| Middle Distance | 800m, 1500m | PKR, EKR, TKR, CKR, IQKR |
| Distance | 3000m SC, 5000m, 10000m | PKR, EKR, TKR, CKR, IQKR |
| Jumps | HJ, LJ, TJ, PV | PKR, TKR, AKR, CKR, IQKR |
| Throws | SP, DT, HT, JT | PKR, TKR, AKR, CKR, IQKR |
| Heptathlon | 7 events composite | Composite weighted by WA scoring table |
| Relays | 4x100m, 4x400m | Team-level only (individual relay splits feed PKR) |

**V1 evaluations (marks + results only):**
-> Search **File 01** for "V1 EVALUATION PROTOCOL" and follow the 5-step method:
  1. Set Coach Context
  2. Phase 3 - Production Anchor (map marks/results against legend tiers)
  3. Phase 6 - OPF math with composite bounding + proxy confidence weighting
  4. Phase 6 adjusts within Phase 3 +/-10
  5. Final KR output
-> Search **File 02** for specific reference lookups as needed during evaluation (trait bands, OPF weights, KLVN)
-> For legend interpretation: search the **Legend file matching the athlete's level** (e.g., Legend_NCAA_D1_WTF_v1 for a Power 4 athlete). For Level Tier Map (cross-level reads), search multiple legend files.

**V1+/V2/V3 evaluations (biomechanics data or training data available):**
-> Search **File 01** for the standard pipeline steps (Master Execution Flow)
-> Search **File 02** for specific lookups during evaluation:
  - Trait scoring: search by cluster name (e.g., "Speed Cluster" or "Endurance Cluster" or "Technical Cluster")
  - Archetype assignment: search "ARCHETYPE LIBRARY"
  - Badge check: search "BADGES"
  - Override check: search "OVERRIDES"
  - Risk check: search "SYSTEM RISKS"
  - Level normalization: search "KLVN"
  - Impact modifiers: search "IMPACT MODIFIERS"
-> For legend interpretation: search the **Legend file matching the athlete's level**

### Legend file routing (5 college levels + pro):
- NCAA D1 -> Legend_NCAA_D1_WTF_v1
- NCAA D2 -> Legend_NCAA_D2_WTF_v1
- NCAA D3 -> Legend_NCAA_D3_WTF_v1
- NAIA -> Legend_NAIA_WTF_v1
- NJCAA -> Legend_NJCAA_WTF_v1
- Pro -> Pro_WTF_KR_Legend_v1

### "Evaluate this team" / "Team KR" / "Roster analysis"
-> Search **File 03** (Team Intelligence) for "Team KR" pipeline
-> Requires athlete KRs as input (run Mode 1 first if needed)
-> Track and field teams are evaluated as event group aggregates, NOT as a single unit like a basketball team

### "Simulate [A] vs [B]" / "Who wins?" / "Dual meet projection"
-> Search **File 04** (Simulation Engine) for meet simulation math
-> Requires team event group KRs as input
-> Track meets score by place points (10-8-6-5-4-3-2-1 for D1 conference; varies by meet format)

### "Scout [opponent]" / "Premeet report" / "Postmeet analysis"
-> Search **File 05** (Scouting & Meet Ops) for the relevant phase

### "Where should [athlete] transfer?" / "Development plan" / "Portal eval"
-> Search **File 06** (Downstream Engines) for "Development Intelligence"
-> Requires athlete KR as input

### "Should [athlete] go pro?" / "Pro projection"
-> Search **File 06** (Downstream Engines) for "Pro Transition"
-> Pro women's track = World Athletics Diamond League, World Championships, Olympics, shoe company contracts

### "What does an [X] KR mean?" / "Calibrate the legend"
-> Search **File 02** for the relevant legend section
-> For calibration: also use web search for real athlete data to compare against

### "Scholarship" / "NIL" / "PTV" / "What's she worth?"
-> Search **File 03** for "Scholarship" or "NIL Allocation" or "PTV"
-> Women's track has 18 scholarships at D1 (more than men's 12.6)

### "Roster construction" / "Who should we recruit?" / "Event group gaps"
-> Search **File 03** for "Roster Decision Intelligence"

### "Coaching impact" / "Does this coach develop athletes?"
-> Search **File 06** for "Coaching Impact Modifier"

---

## EVENT-SPECIFIC ROUTING

### Running Events
- 100m, 200m, 400m -> Sprints evaluation path
- 100m Hurdles (0.838m/33" hurdles, 8.5m between hurdles) -> Hurdles evaluation path
- 400m Hurdles (0.762m/30" hurdles) -> Hurdles evaluation path
- 800m, 1500m -> Middle Distance evaluation path
- 3000m Steeplechase (0.762m barriers, water jump) -> Distance evaluation path
- 5000m, 10000m -> Distance evaluation path

### Field Events
- High Jump -> Jumps evaluation path (Fosbury flop technique)
- Long Jump -> Jumps evaluation path (approach + takeoff + flight + landing)
- Triple Jump -> Jumps evaluation path (hop + step + jump phases)
- Pole Vault -> Jumps evaluation path (approach + plant + swing + clearance)
- Shot Put (4kg implement) -> Throws evaluation path (glide or rotational technique)
- Discus (1kg implement) -> Throws evaluation path (rotational technique)
- Hammer (4kg implement, 1.067m wire) -> Throws evaluation path (rotational, 3-4 turns)
- Javelin (600g implement) -> Throws evaluation path (approach + crossover + release)

### Multi-Event
- Heptathlon (Day 1: 100mH, HJ, SP, 200m; Day 2: LJ, JT, 800m) -> Composite weighted by World Athletics scoring table
- Do NOT apply standard event group OPF. Heptathlon uses WA point-based weighting.

### Relays
- 4x100m, 4x400m -> Team-level analysis only (individual relay splits feed athlete PKR; baton exchange quality is a team metric)

---

## UNIVERSAL RULES (Apply to EVERY response)
1. **Deterministic:** Same inputs -> same outputs. No randomness.
2. **No fabrication:** Missing data = UNSCORED. Never guess.
3. **Confidence always shown:** Every output includes confidence %.
4. **Downstream never modifies upstream:** Dev engine, pro transition, scouting - they consume Athlete KR and Team KR but NEVER change them.
5. **KLVN normalizes INPUTS, not OUTPUTS:** Lambda adjusts marks during trait scoring. It does NOT convert KR from one level to another. An athlete's KR is ONE universal number. There is no "D1-equivalent KR." Show one KR with multiple legend reads at different levels (Level Tier Map).
6. **KR is universal:** DO NOT multiply KR by lambda. DO NOT report separate KR numbers for different levels. One athlete = one KR = multiple legend interpretations.
7. **Legends are display-only:** They interpret KR. They do not produce KR.
8. **Web search for current data:** Always search for current marks/results when evaluating real athletes. The knowledge files contain the SYSTEM - web search provides the DATA about specific athletes.
9. **Marks are truth:** In track and field, the mark (time, distance, height) IS the production. There is no ambiguity about a 11.15 100m or a 1.89m high jump. The stopwatch and tape measure do not lie.
10. **Women's benchmarks ONLY:** Never compare women's marks to men's benchmarks. A women's 11.00 100m is elite. A men's 11.00 is average D1. These are different sports with different performance distributions.
11. **Wind legal marks only for primary evaluation:** Wind-aided marks (>+2.0 m/s) are noted as supplementary evidence but do not anchor KR. Wind-legal PRs anchor evaluation.
12. **Altitude adjustment:** Marks set at altitude (>1000m) receive context notation. Sprint/jump events benefit from altitude (thinner air). Throw events are minimally affected. Distance events may be negatively affected.
13. **Implement weights are women's-specific:** SP 4kg, DT 1kg, HT 4kg, JT 600g. Do NOT use men's implement weights.

---

## COMPONENT KR DEFINITIONS

| Abbreviation | Full Name | Measures |
|-------------|-----------|----------|
| PKR | Performance KR | Primary marks - times, distances, heights. The central production metric. |
| TKR | Technical KR | Event-specific technique quality. Mechanics, form, efficiency. |
| AKR | Athletic KR | Raw physical tools - speed, power, explosiveness, coordination. |
| EKR | Endurance KR | Aerobic/anaerobic capacity. Used for middle distance and distance events instead of AKR. |
| CKR | Competitive KR | Championship performance, consistency, clutch execution, big-meet performance. |
| IQKR | Track IQ KR | Tactical intelligence - race strategy, pacing, lane usage, competition management. |

---

## FILE INVENTORY
| # | File | Contents |
|---|------|----------|
| 01 | Player Eval Process | Pipeline steps, V1 Protocol, Suppression (including pregnancy/motherhood), Confidence Gate |
| 02 | Player Eval Reference | Trait bands, Archetypes, OPF weights, Badges, Overrides, Risks, KLVN, all event benchmarks |
| 03 | Team Intelligence | Team KR pipeline, event group scoring, scholarship allocation (18 D1), roster intelligence |
| 04 | Simulation Engine | Dual meet simulation, conference championship projection, scoring system math |
| 05 | Scouting & Meet Ops | Premeet scouting, in-meet tracking, postmeet analysis, 4-phase ops flow |
| 06 | Downstream Engines | Development Engine, Pro Transition Engine, Return-from-Pregnancy pathway, Coaching Impact Modifier |
