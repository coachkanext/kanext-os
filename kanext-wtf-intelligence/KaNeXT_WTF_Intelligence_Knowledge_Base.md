# KaNeXT Women's Track and Field Intelligence Knowledge Base v1

---

## 1. SYSTEM OVERVIEW

The KaNeXT Women's Track and Field Intelligence system is a comprehensive evaluation, analysis, and decision-making platform for women's track and field. It uses the KaNeXT KR (KaNeXT Rating) framework to produce universal, deterministic ratings for athletes, teams, and meet projections.

### Core Architecture
- **KR (KaNeXT Rating):** Universal 0-100 rating for every athlete and team. One number, multiple interpretations across levels.
- **KLVN Lambda Normalization:** Adjusts contextual inputs across competitive levels. NCAA D1 Power 4 = 1.000 reference. In track and field, raw marks (times/distances/heights) are NOT lambda-adjusted - only contextual factors (competition quality, meet prestige, tactical context).
- **Component KRs:** Event-group-specific components weighted through OPF (Overall Performance Formula). Sprints/Hurdles/Jumps/Throws: PKR, TKR, AKR, CKR, IQKR. Distance/Middle Distance: PKR, EKR, TKR, CKR, IQKR. Heptathlon: WA scoring table composite.
- **Legend System:** Tier labels at each competitive level interpreting what a KR means. Display-only; does not produce KR.
- **Phase 3 Anchor:** Production-based anchor against the level legend. Foundation of every evaluation.
- **Phase 6 OPF:** Mathematical composite of component KRs, bounded within +/-10 of Phase 3 anchor.
- **Pregnancy/Motherhood Suppression:** MANDATORY detection and adjustment framework unique to women's track.

### 8 Intelligence Modes
1. **Athlete Evaluation** - Individual KR rating (0-100)
2. **Team Evaluation** - Roster-level KR with event group analysis and scoring projection
3. **Meet Simulation** - Event-by-event meet projection with scoring model
4. **Scouting and Meet Ops** - 4-phase meet intelligence (premeet, in-meet, intermission, postmeet)
5. **Development Intelligence** - Gap analysis, development roadmaps, transfer portal intelligence
6. **Pro Transition** - Professional readiness, competition circuit placement, contract estimation
7. **Legend Calibration** - Testing and refining tier labels against real athletes
8. **Recruiting Intelligence** - High school and club prospect evaluation

---

## 2. WOMEN'S TRACK AND FIELD FUNDAMENTALS

### The Sport
Women's track and field consists of running events (sprints, hurdles, middle distance, distance), jumping events (high jump, long jump, triple jump, pole vault), throwing events (shot put, discus, hammer, javelin), multi-events (heptathlon), and relay events (4x100m, 4x400m). Competition occurs at individual meets where athletes score points for their team by placing in events.

### Why Women's Track and Field Matters
- One of the largest women's college sports by participation in the United States
- Title IX compliance sport for many institutions (18 D1 scholarships, among the highest in women's sports)
- Growing professional landscape with equal prize money at World Athletics events
- Strong Olympic sport with global participation
- Unique pregnancy/motherhood dynamic requires specialized intelligence
- Objective performance metrics (times, distances, heights) enable precise evaluation

### Women's-Specific Equipment and Rules
- **Hurdle heights:** 100m hurdles 0.838m/33" (men's 110mH is 1.067m/42"). 400m hurdles 0.762m/30" (men's is 0.914m/36").
- **Implement weights:** Shot Put 4kg/8.8lb (men's 7.26kg). Discus 1kg/2.2lb (men's 2kg). Hammer 4kg/8.8lb (men's 7.26kg). Javelin 600g/1.32lb (men's 800g).
- **Multi-event:** Heptathlon - 7 events over 2 days (men's is Decathlon - 10 events). Heptathlon events: 100mH, HJ, SP, 200m (Day 1); LJ, JT, 800m (Day 2).
- **Relay exchange zones, lane assignments, and competition rules** are identical to men's.

### Key Performance Benchmarks (Women's D1 Power 4 Reference)
- **100m:** sub-10.80 world class; 11.00-11.20 NCAA All-American; 11.40-11.60 conference qualifier
- **200m:** sub-22.00 world class; 22.20-22.60 All-American; 23.00-23.40 conference qualifier
- **400m:** sub-50.00 world class; 50.50-51.50 All-American; 52.50-53.50 conference qualifier
- **100mH:** sub-12.50 world class; 12.70-13.00 All-American; 13.30-13.60 conference qualifier
- **800m:** sub-2:00 world class; 2:02-2:05 All-American; 2:08-2:12 conference qualifier
- **5000m:** sub-15:00 world class; 15:20-15:50 All-American; 16:10-16:40 conference qualifier
- **High Jump:** 1.90m+ world class; 1.82-1.87m All-American; 1.72-1.77m conference qualifier
- **Shot Put (4kg):** 18.50m+ world class; 16.50-17.50m All-American; 14.50-15.50m conference qualifier
- **Heptathlon:** 6500+ world class; 5800-6200 All-American; 5000-5400 conference qualifier

---

## 3. EVENT GROUPS

### Sprints: 100m, 200m, 400m
The speed events. 100m tests pure acceleration and top-end speed. 200m adds the curve and speed endurance. 400m is a full-lap sprint requiring speed, speed endurance, and lactic acid tolerance. Many athletes double in 100/200 or 200/400. The 100/400 double is rare due to different energy system demands.

**Component KRs:** PKR (performance, raw times), TKR (technical, start mechanics, curve running, finish), AKR (athletic, explosiveness, speed reserve, body control), CKR (competitive, championship performance, consistency), IQKR (race IQ, tactical awareness, heat management).

### Hurdles: 100m Hurdles, 400m Hurdles
Technical speed events. 100mH (33" barriers, 8.5m between hurdles) requires sprint speed plus rhythmic hurdling technique. 400mH (30" barriers) requires 400m fitness plus hurdle technique and stride pattern management across 10 barriers. The ability to alternate lead legs in 400mH is an elite differentiator.

**100mH specifics:** Women's hurdles are 33" (0.838m), significantly lower than men's 110mH (42"/1.067m). The event covers 100m, not 110m. Spacing is 8.5m between hurdles with 13m to the first hurdle.

**400mH specifics:** Women's hurdles are 30" (0.762m). Same 35m between hurdles as men's. Stride pattern management (13, 14, 15, or 16 steps between hurdles) is the key tactical element.

**Component KRs:** PKR, TKR (hurdle technique is heavily weighted), AKR, CKR, IQKR.

### Middle Distance: 800m, 1500m
The tactical racing events. 800m combines sprint speed with aerobic capacity - arguably the most physically demanding event in track and field. 1500m adds tactical complexity with pace changes, positioning, and kick speed. Both events require athletes to compete in rounds (heats, semifinals, finals) at championship meets.

**Component KRs:** PKR, EKR (endurance, replaces AKR), TKR (tactical racing, pacing, positioning), CKR, IQKR.

### Distance: 3000m Steeplechase, 5000m, 10000m
The endurance events. 3000m steeplechase adds water jump and barriers to distance running. 5000m is 12.5 laps requiring sustained pace and finishing speed. 10000m is 25 laps requiring extreme aerobic fitness, pacing discipline, and mental toughness.

**3000m Steeplechase specifics:** Women run 3000m SC (same distance as men's). Barrier height is 0.762m/30" for women (men's is 0.914m/36"). Water jump dimensions are the same. The event has seen rapid performance improvement in women's track over the past decade.

**Component KRs:** PKR, EKR (endurance, heavily weighted), TKR (tactical, pacing, positioning), CKR, IQKR.

### Jumps: High Jump, Long Jump, Triple Jump, Pole Vault
The technical field events. Each combines athletic ability (speed, power, coordination) with event-specific technique. High jump and pole vault are vertical events with measurable bar heights. Long jump and triple jump are horizontal events with measurable distances.

**Pole Vault specifics:** Women's pole vault was only added to the Olympic program in 2000. The event has seen dramatic development in the past two decades. Equipment (poles) and technique coaching are significant factors in development.

**Component KRs:** PKR, TKR (technique is the primary differentiator in jumps), AKR (athleticism, approach speed, takeoff power), CKR, IQKR.

### Throws: Shot Put (4kg), Discus (1kg), Hammer (4kg), Javelin (600g)
The power field events. All women's implements are lighter than men's. Shot put uses rotational or glide technique. Discus requires rotational speed and timing. Hammer throw is the most technical throwing event, requiring multiple rotations and precise release. Javelin requires approach speed and a specific throwing motion distinct from other throws.

**Implement weights are critical:** All women's implements differ from men's. Shot put 4kg (men's 7.26kg). Discus 1kg (men's 2kg). Hammer 4kg (men's 7.26kg). Javelin 600g (men's 800g). Never apply men's implement weights to women's evaluation.

**Component KRs:** PKR, TKR (technique is paramount, especially in hammer and discus), AKR (power, rotational speed, explosiveness), CKR, IQKR.

### Heptathlon (7 Events)
The multi-event. Two days, seven events. Day 1: 100mH, High Jump, Shot Put, 200m. Day 2: Long Jump, Javelin, 800m. Scored using World Athletics scoring tables that convert marks to points. Total points determine placement.

**Not Decathlon:** Women compete in Heptathlon (7 events), not Decathlon (10 events, which is the men's multi-event). The scoring tables are specific to women's events and implements.

**Evaluation approach:** Heptathlon KR is derived from World Athletics point totals, with component analysis across the 7 individual events. Strengths and weaknesses are identified by comparing individual event scores to the athlete's overall point total.

### Relays: 4x100m, 4x400m
Team speed events. 4x100m requires four sprinters plus three exchange zone handoffs - the exchange is as important as individual speed. 4x400m requires four 400m runners with staggered starts and open-lane running after the first exchange.

**Relay KR** is derived from team time with adjustment for exchange quality (4x100m) or split analysis (4x400m). Relay KR is a team metric, not individual.

---

## 4. COMPONENT KR DEFINITIONS

### PKR - Performance KR (All Event Groups)
Raw production. Times, distances, heights, points. The objective measure of what the athlete has done. In track and field, PKR is the most heavily weighted component because marks are absolute and comparable.

### TKR - Technical KR (All Event Groups)
Event-specific technique quality. Start mechanics and drive phase for sprinters. Hurdle clearance and rhythm for hurdlers. Approach and takeoff for jumpers. Rotational mechanics and release for throwers. Pacing and positioning for distance runners. TKR captures what video analysis reveals that marks alone may not.

### AKR - Athletic KR (Sprints, Hurdles, Jumps, Throws)
Raw athletic ability. Explosiveness, speed, power, body control, coordination. The physical tools that underpin performance. AKR is what separates athletes with similar technique - the one with better AKR has more room to improve.

### EKR - Endurance KR (Middle Distance, Distance)
Replaces AKR for endurance events. Aerobic capacity, lactate threshold, running economy, ability to sustain pace over distance. EKR captures the physiological engine that drives distance performance.

### CKR - Competitive KR (All Event Groups)
Championship performance, big-meet execution, consistency under pressure. Track athletes compete in rounds at championship meets (heats, semis, finals). CKR measures who performs best when it matters most. Also captures season-to-season consistency and improvement trajectory.

### IQKR - Intelligence KR (All Event Groups)
Race/competition IQ. Tactical awareness, heat management (qualifying rounds), race positioning, response to competitors' moves, adaptability to conditions (wind, weather, altitude). For field events: approach adjustment, attempt strategy, competition-day decision making.

---

## 5. SCHOLARSHIP STRUCTURE

### NCAA Division I: 18 Scholarships (Equivalency)
Women's track and field receives 18 full-ride equivalencies at D1 - one of the highest allocations in women's college sports. These are equivalency scholarships, meaning they can be divided among more than 18 athletes (e.g., 36 athletes on half scholarships).

**Typical allocation across event groups:**
- Sprints/Hurdles: 5-6 scholarships (27-33% of total)
- Distance/Middle Distance: 4-5 scholarships (22-28%)
- Jumps: 2-3 scholarships (11-17%)
- Throws: 2-3 scholarships (11-17%)
- Heptathlon: 1-2 scholarships (5-11%)
- Relay specialists/depth: remaining allocation

Allocation varies by program philosophy. Sprint-focused programs (SEC, Big 12) allocate more to sprints. Distance-focused programs (Big East, Pac-12 historically) allocate more to distance.

### Other Levels
- NCAA D2: 12.6 equivalency scholarships
- NCAA D3: No athletic scholarships
- NAIA: 12 scholarships
- NJCAA D1: Up to 20 scholarships (tuition, fees, room, board, books, transportation)
- NJCAA D2: Tuition and fees only
- NJCAA D3: No athletic scholarships

---

## 6. PREGNANCY/MOTHERHOOD FRAMEWORK

### Why This Matters
Pregnancy and motherhood suppression is a significant factor in women's track and field careers. Unlike men's sports, women's careers may include periods of pregnancy, postpartum recovery, and return to competition. The KaNeXT system treats this as a MANDATORY detection and adjustment framework.

### Detection Triggers
- Gap in competition history of 6+ months during prime competitive years
- Sudden performance decline followed by absence
- Known pregnancy (reported, announced, or documented)
- Postpartum return with performance below pre-pregnancy baseline

### Suppression Application
When pregnancy/motherhood is detected:
1. Pre-pregnancy KR becomes the anchor
2. Post-return performance is evaluated with suppression applied
3. Return timeline is assessed against event-group-specific recovery benchmarks
4. KR is bounded to reflect recovery trajectory, not current suppressed production

### Return Timelines by Event Group (Approximate)
- **Sprints:** 9-18 months to pre-pregnancy KR. Explosive power takes longest to recover.
- **Hurdles:** 12-18 months. Technical rhythm plus explosiveness recovery.
- **Middle Distance:** 8-15 months. Aerobic base recovers relatively quickly.
- **Distance:** 6-15 months. Some athletes return faster than pre-pregnancy due to increased blood volume and physiological changes. Well-documented phenomenon.
- **Jumps:** 10-18 months. Technical events require full body control recovery.
- **Throws:** 6-12 months. Strength-based events with less impact of pregnancy on primary movement patterns.
- **Heptathlon:** 12-24 months. Must recover across multiple event groups simultaneously.

### 5-Phase Return Framework
1. **Medical Clearance** (0-3 months postpartum): No competition evaluation
2. **General Fitness** (3-6 months): Baseline aerobic and strength recovery
3. **Sport-Specific Return** (6-12 months): Event-specific training resumes
4. **Competition Reentry** (variable): First competitions, suppression applied
5. **Full Competition** (variable): Pre-pregnancy KR achievable, suppression may be reduced/removed

---

## 7. TEAM INTELLIGENCE

### Team KR Computation
Team KR in track and field is the weighted composite of event group KRs:
- **Event Group KR** = average of top N athletes per event group (N varies by team size and scoring depth)
- **Relay KR** = separate relay team evaluation
- **Team KR** = weighted average of event group KRs, with weights reflecting scoring potential

### Scoring Projection
Teams score points in meets. Scoring projection uses:
- Individual athlete KR translated to expected place in each event
- Place-to-points conversion based on meet type (dual, conference, regional, national)
- Relay scoring added
- Environmental and tactical adjustments applied

### Scholarship Allocation Intelligence
With 18 D1 scholarships across 20+ events, allocation strategy is critical. The system evaluates:
- Points-per-scholarship-dollar by event group
- Marginal point gain from adding scholarship allocation to each event group
- Conference and regional competitive landscape per event
- Recruiting pipeline availability per event group
- Multi-event value (heptathlete who scores in 3-4 individual events plus heptathlon)

---

## 8. MEET SIMULATION

### Meet Types
- **Dual Meet:** Team A vs Team B. Each team enters limited athletes per event. Points: 5-3-1 (individual) or 5-0 (relay).
- **Triangular/Multi-Team:** 3+ teams. Same format, more tactical complexity.
- **Conference Championship:** Full conference. Qualifying rounds for individual events. Points by place.
- **Regional:** Qualifying meet for national championship. Performance-based qualification.
- **National Championship (NCAA):** Semifinal and final rounds. Deepest fields. Points for top-8 places.

### Simulation Model
1. Convert athlete KRs to expected marks (using legend KR-to-mark tables)
2. Apply variance by event type (sprints low variance, distance moderate, throws high variance)
3. Simulate event placing
4. Convert places to points
5. Sum across all events for team score
6. Apply environmental adjustments (wind, altitude, indoor/outdoor, temperature)
7. Generate confidence interval for team score

---

## 9. PRO TRANSITION

### Professional Readiness Thresholds
Not all college athletes can sustain professional careers. Event-specific thresholds:
- **Sprints:** Need sub-11.30 100m or sub-23.00 200m or sub-51.50 400m to sustain income
- **Hurdles:** Need sub-13.00 100mH or sub-56.00 400mH
- **Middle Distance:** Need sub-2:01.50 800m or sub-4:08.00 1500m
- **Distance:** Need sub-15:30 5000m or sub-32:00 10000m
- **Jumps:** Need 1.90m+ HJ, 6.60m+ LJ, 14.20m+ TJ, 4.50m+ PV
- **Throws:** Need 18.20m+ SP, 62.00m+ DT, 72.00m+ HT, 60.00m+ JT
- **Heptathlon:** Need 6200+ points

### Professional Competition Circuits
- World Athletics Diamond League (top tier, equal prize money)
- Continental Tour Gold/Silver/Bronze/Challenger
- World Championships and Olympics
- National Championships
- Indoor Tour

### Contract Landscape
- Shoe company contracts are primary income for most professionals
- Equal prize money at World Athletics events (policy since 2023)
- Pregnancy protection clauses now standard in major contracts
- NIL and endorsement deals growing category
- Career earnings highly concentrated at top tier (KR 95+)

---

## 10. FILE INVENTORY

| File | Content |
|------|---------|
| 07_Nexus_WTF_Intelligence_Skill_v1.md | Master SKILL file. Routing, rules, component definitions, governance. |
| 01_WTF_Player_Eval_Process_v1.md | Full evaluation pipeline. Coach Context, Athlete Profile, V1 Protocol, suppression framework including mandatory pregnancy/motherhood detection. |
| 02_WTF_Player_Eval_Reference_v1.md | Complete reference. Event benchmarks (KR-to-mark tables for all events), trait clusters and scoring, OPF weights by event group, 32 archetypes, badges, overrides. |
| 03_WTF_Team_Intelligence_v1.md | Team KR pipeline, scoring projection, scholarship allocation (18 D1), roster diagnostics, season planning. |
| 04_WTF_Simulation_Engine_v1.md | Meet simulation. Event-level KR-to-place model, variance factors, relay simulation, heptathlon simulation, environmental adjustments. |
| 05_WTF_Scouting_Meet_Ops_v1.md | 4-phase meet ops. Premeet entry strategy, in-meet tracking, intermission adjustments, postmeet recalibration. |
| 06_WTF_Downstream_Engines_v1.md | Development intelligence, pro transition, return-from-pregnancy development pathway, coaching impact, recruiting intelligence. |
| Legend_NCAA_D1_WTF_v1.md | D1 legend (Power 4, Mid-Major, Low-Major tiers). All events with women's benchmarks. |
| Legend_NCAA_D2_WTF_v1.md | D2 legend. All events. 12.6 scholarships. |
| Legend_NCAA_D3_WTF_v1.md | D3 legend. All events. No athletic scholarships. |
| Legend_NAIA_WTF_v1.md | NAIA legend. All events. 12 scholarships. |
| Legend_NJCAA_WTF_v1.md | NJCAA legend (D1/D2/D3 tiers). All events. |
| College_WTF_KLVN_Lambdas_v1.md | College-level KLVN lambdas. 15 levels from D1 P4 to high school. Track-specific note: raw marks not lambda-adjusted. |
| Pro_WTF_KR_Legend_v1.md | Professional KR legend. Competition circuits, economic tiers, event-specific pro thresholds, pregnancy/motherhood career impact. |
| Pro_WTF_KLVN_Lambdas_v1.md | Professional circuit lambdas. Diamond League reference. 13 circuit contexts. |
| KaNeXT_WTF_Intelligence_Knowledge_Base.md | This file. System overview and reference for Nexus. |

---

## 11. CRITICAL RULES

1. **Women's benchmarks ONLY.** Never apply men's times, distances, implement weights, or hurdle heights.
2. **Heptathlon, not Decathlon.** The women's multi-event is the Heptathlon (7 events).
3. **Women's implements:** Shot Put 4kg, Discus 1kg, Hammer 4kg, Javelin 600g.
4. **Women's hurdle heights:** 100mH 0.838m/33", 400mH 0.762m/30".
5. **Pregnancy/motherhood suppression is MANDATORY.** Must be detected and applied when present.
6. **Legend anchor is truth; math is confirmation.** Phase 3 production anchor sets floor/ceiling; Phase 6 OPF adjusts within +/-10.
7. **Raw marks are not lambda-adjusted in track.** Lambda applies to contextual inputs only.
8. **18 D1 scholarships.** Equivalency model across 20+ events requires strategic allocation intelligence.
9. **KR is universal.** Same 0-100 scale across all levels. Level Tier Map shows how the same KR reads at different levels.
10. **No em dashes.** Use regular dashes or rewrite.
