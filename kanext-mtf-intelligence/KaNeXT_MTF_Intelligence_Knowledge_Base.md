# KaNeXT Men's Track and Field Intelligence - Complete Knowledge Base

## Version 1.0 - March 2026

This is the comprehensive reference document for the KaNeXT Men's Track and Field Intelligence system. It covers every concept, metric, process, and decision framework in the intelligence layer. Nexus references this document to answer any question about how the MTF intelligence works - from investors, coaches, scouts, analysts, and anyone interacting with the system.

---

# PART 1: THE INTELLIGENCE SYSTEM

---

## 1. What is KaNeXT Men's Track and Field Intelligence

KaNeXT Men's Track and Field Intelligence is a universal athlete evaluation system that produces deterministic, auditable ratings for men's track and field athletes at every competitive level. It was built to solve a fundamental problem in track and field: while individual performances (times and distances) are objective, there is no standardized system for evaluating the COMPLETE athlete - combining performance marks with technical ability, competition performance, physical tools, and tactical intelligence into a single comparable number.

A coach sees that a sprinter ran 10.45 in the 100m. That time tells you something, but not everything. Did he run it into a headwind? At altitude? In a prelim round at a major championship or at a low-level invitational? Does he have elite technique that suggests further improvement, or is he at his physical ceiling? Does he perform better or worse at championship meets? Can he run a relay? The raw time is the starting point, not the complete picture.

KaNeXT MTF Intelligence takes all available data - personal records, meet results, competition history, technical observations, physical profile - and produces a single universal number that captures the complete athlete. That number is the KR (KaNeXT Rating).

The system was designed specifically for track and field as an INDIVIDUAL sport, which is fundamentally different from team sports like basketball or football. The primary anchor is always the performance mark itself - because in track and field, the mark is objective truth. A 10.45 is a 10.45. The system builds outward from that truth, adding context through component KRs that capture dimensions beyond the raw mark.

---

## 2. The KR System - Universal 0-100 Rating

KR stands for KaNeXT Rating. It is a single number on a 0-100 scale that represents a men's track and field athlete's total evaluated ability at the time of evaluation.

### What KR Measures

KR captures the complete track and field athlete: performance marks, technical ability, physical/athletic tools (or endurance for distance events), competition performance, and tactical intelligence. These dimensions are weighted differently by event group because different events demand different profiles.

A sprinter's KR is weighted 45% toward Performance (PKR) because the time is the primary truth. A distance runner's KR weights Performance at 35% and Competition at 20% because championship racing ability is a larger differentiator in distance events where tactical racing compresses finishing times.

KR is not just a PR conversion. It is a composite of 5 component KRs, weighted by event group, that captures everything the athlete does in their event.

### KR is Universal

A KR of 90 means the same thing regardless of what level the athlete competes at. A KR of 90 at NCAA D1 is the same number as a KR of 90 at NAIA. The number does not change based on level context.

What changes is the interpretation. Each competitive level has its own legend - a lookup table that translates KR values into tier labels. A 90 KR reads differently depending on where you look it up:

- At NCAA D1: 89-91 = NCAA Qualifier / Conference Champion
- At NCAA D2: 89-91 = National Qualifier / Conference Top Performer
- At NCAA D3: 89-91 = National Qualifier / Conference Top Performer
- At NAIA: 89-91 = National Qualifier / Conference Top Performer
- At Pro: 89-91 = Continental Tour Winner / National Champion

One athlete. One KR. Multiple legend reads depending on level context. This is the Level Tier Map.

### How KR Stays Universal: KLVN Lambda Normalization

In track and field, lambda works differently than in team sports. A 10.45 100m IS the same performance regardless of where it was run. Lambda does not adjust the mark. Lambda adjusts the CONTEXT in which non-performance component KRs were earned.

Running a 10.45 to win a D1 conference championship (lambda 0.960) demonstrates different competition-quality CKR than running a 10.45 to win an NJCAA dual meet (lambda 0.800). The mark is the same. The context information is different.

Lambda adjusts CKR, TKR, and IQKR inputs based on competition quality. It does NOT adjust PKR (the mark itself), AKR (physical tools), or EKR (endurance). This keeps the system honest: the performance is objective truth, and the context adds nuance.

---

## 3. Event Groups and Component KRs

Track and field is not one sport. It is seven distinct event groups, each requiring different physical profiles, technical skills, and competitive approaches. The KR system evaluates each event group with its own component KR structure and weighting.

### Event Groups

**Sprints (100m, 200m, 400m):** Pure speed events. Performance is measured in seconds. Component KRs: PKR (Performance), TKR (Technical), AKR (Athletic), CKR (Competition), IQKR (Race IQ). PKR weighted highest at 45% because the time is nearly the entire story.

**Hurdles (110m Hurdles, 400m Hurdles):** Speed plus technique events. Require sprint ability AND hurdle clearance skill. TKR is weighted higher (20%) than in pure sprints because technique has outsized impact on hurdle times.

**Middle Distance (800m, 1500m):** The bridge between speed and endurance. Tactical racing is a major factor. CKR weighted at 20% because championship performance differentiates athletes with similar fitness. EKR replaces AKR to capture endurance rather than raw speed.

**Distance (3000m Steeplechase, 5000m, 10000m):** Endurance events where tactical racing, kick quality, and championship performance matter as much as raw fitness. EKR weighted at 20%. CKR at 20%. Cross country performance feeds into these evaluations.

**Jumps (High Jump, Long Jump, Triple Jump, Pole Vault):** Technical events where approach speed, takeoff mechanics, and flight/clearance technique combine with raw athletic ability. TKR at 20% because technique is a massive differentiator.

**Throws (Shot Put, Discus, Hammer, Javelin):** Power and technique events. Raw strength matters, but delivery mechanics determine how effectively that power translates to distance. TKR at 20%.

**Decathlon:** The ultimate multi-event test. Ten events across two days. Scored using World Athletics scoring tables that convert individual event performances into points. Evaluated as a composite, not as individual events.

### Component KR Definitions

**PKR (Performance KR):** The athlete's best verified performances mapped against event-specific legends. This is always the PRIMARY anchor. In track and field, the mark is truth. PKR is the largest component in every event group (35-45% weight).

**TKR (Technical KR):** Execution quality of event-specific technique. Sprint mechanics, hurdle clearance, jump approach, throw delivery. Technical athletes extract more performance from their physical tools.

**AKR (Athletic KR):** Raw physical tools - speed, power, explosiveness, strength, body control. Used in sprints, hurdles, jumps, and throws.

**EKR (Endurance KR):** Aerobic capacity and endurance. Used in middle distance and distance events in place of AKR. Informed by multi-distance performance and cross country results.

**CKR (Competition KR):** Championship meet performance, round improvement, consistency, head-to-head record. How the athlete performs when it matters most.

**IQKR (Intelligence KR):** Tactical and strategic decision-making. Race management in distance events. Attempt management in field events. Pace judgment in 400m and 800m. The mental side of competition.

---

## 4. How Athlete Evaluation Works

### The Evaluation Pipeline

Every athlete evaluation follows the same deterministic pipeline:

**Step 1: Coach Context.** Set the program, level, conference, and event group focus. This binds the evaluation to the correct legend files and KLVN lambdas.

**Step 2: Data Collection.** Gather the athlete's performance data - PRs (indoor and outdoor), season bests, meet results, competition history. Verify timing method (FAT), wind readings, and altitude.

**Step 3: Performance Anchor (Phase 3).** Map the athlete's best verified mark against the event-specific legend for their level. This sets the KR anchor range. In track and field, this step is more definitive than in team sports because the mark is objective.

**Step 4: Component KR Scoring (Phase 6).** Score each component KR using the event group's OPF (Overall Performance Factor) weights. PKR from the mark. TKR from technical observations. AKR/EKR from physical/endurance indicators. CKR from competition history. IQKR from tactical evidence.

**Step 5: Bounding.** Phase 6 composite is bounded by Phase 3 anchor +/-10. If the math disagrees with the mark by more than 10 points, the math needs to explain why.

**Step 6: Final Output.** Single KR number (one decimal), component KR breakdown, confidence percentage, Level Tier Map, archetype, badges, development notes.

### Wind, Altitude, and Timing Protocols

Track and field has unique data quality requirements that team sports do not:

**Wind:** Sprint and horizontal jump marks must include wind readings. Wind-legal means +2.0 m/s or less. Wind-aided marks (>+2.0) are flagged and cannot anchor PKR at face value. Conversion formulas adjust wind-aided marks for evaluation purposes.

**Altitude:** Distance event marks set above 1000m elevation receive altitude adjustment. Higher altitude reduces oxygen availability, slowing distance times. Sprint marks benefit slightly from altitude (reduced air resistance) - these are flagged but valid.

**Timing:** Only FAT (Fully Automatic Timing) is valid. Hand-timed marks are adjusted by +0.24s for events through 400m and +0.14s for longer events.

**Indoor vs Outdoor:** Indoor PRs and outdoor PRs are tracked separately. Indoor tracks are shorter (200m vs 400m), with tighter turns and different surfaces. Indoor marks are generally slower for running events. Conversion factors exist but direct comparison requires caution.

---

## 5. KLVN Lambda Normalization

### The Core Principle

Lambda in track and field normalizes COMPETITION CONTEXT, not performance marks. This is fundamentally different from team sports where lambda normalizes production stats.

A 10.45 100m is always a 10.45. Lambda does not change this. What lambda changes is how much CKR, TKR, and IQKR credit the athlete receives for demonstrating those traits in a particular competitive environment.

### Competition Quality Hierarchy

The lambda system assigns values from 0.650 (high school dual meet) to 1.000 (NCAA D1 Championships / Olympic Games) based on the quality and depth of competition. Championship meets carry higher lambdas than regular season meets. Higher-level championships carry higher lambdas than lower-level championships.

### What Lambda Does NOT Do

Lambda does NOT adjust PKR. A PR is a PR.
Lambda does NOT adjust AKR or EKR. Physical tools and endurance are intrinsic.
Lambda does NOT convert KR from one level to another. There is no "D1-equivalent KR."
Lambda does NOT make a JUCO athlete's 10.45 "worth less" than a D1 athlete's 10.45. The mark is the same. The context information around the mark differs.

---

## 6. The Legend System

### How Legends Work

Legends are lookup tables that interpret what a KR number means at a specific competitive level. They do not produce KR. They read KR.

Each competitive level has its own legend file with performance-based tier definitions. The tiers are anchored to actual times and distances, making them objectively verifiable. For example, at NCAA D1:
- KR 92-94 corresponds to marks like 10.10-10.22 in the 100m (NCAA All-American / Auto Qualifier)
- KR 89-91 corresponds to 10.22-10.37 (NCAA Qualifier / Conference Champion)
- KR 86-88 corresponds to 10.37-10.55 (Conference Scorer)

### Level Tier Map

The Level Tier Map reads one athlete's KR against multiple level legends to show where they fit across the competitive landscape. An athlete with a KR of 90 reads as:
- NCAA D1: Conference Champion / NCAA Qualifier
- NCAA D2: National Qualifier / Conference Top Performer
- NCAA D3: National Qualifier / Conference Top Performer
- NAIA: National Qualifier / Conference Top Performer
- Pro: Continental Tour Competitor (entry level)

This is the most valuable recruiting tool in the system - it instantly tells a coach what this athlete means to their program.

### Legend Files

The system includes legends for:
- NCAA D1
- NCAA D2
- NCAA D3
- NAIA
- NJCAA (D1, with D2 and D3 adjustments)
- Professional

Each legend contains performance benchmarks for all events at every tier.

---

## 7. Archetypes

Track and field athletes are categorized by archetype within their event group. Archetypes describe HOW the athlete achieves their performance, not just WHAT the performance is.

### Sprint Archetypes
- **Pure Speed Sprinter:** 100m-focused, elite acceleration and max velocity
- **Speed-Power Sprinter:** 100m/200m double specialist
- **Long Sprinter:** 200m/400m double, superior speed endurance
- **Quarter-Miler:** 400m specialist, elite pace management

### Hurdle Archetypes
- **Speed Hurdler:** Fast flat sprinter with efficient clearance
- **Technical Hurdler:** Technique compensates for moderate sprint speed
- **Intermediate Hurdler:** 400mH specialist, fatigue-management expert

### Middle Distance Archetypes
- **Tactical Miler:** Thrives in slow, tactical races with a kick
- **Front Runner:** Controls from the front, sets honest pace
- **Kicker:** Devastating finishing speed
- **800m/1500m Double Threat:** Competitive across both events

### Distance Archetypes
- **Grinder:** Even pace, wears opponents down
- **Front-Running Pacer:** Controls race from the front
- **Kicker (Distance):** Strong final lap after sitting in pack
- **Steeplechase Specialist:** Barrier technique differentiator
- **Volume Racer:** Competes across multiple distance events

### Jump Archetypes
- **Explosive Jumper:** Raw athletic ability drives marks
- **Technical Jumper:** Refined technique maximizes moderate athleticism
- **Speed Jumper:** Sprint speed translates to approach velocity
- **Athletic Vaulter:** Speed and gymnastics ability
- **Technical Vaulter:** Plant, inversion, and clearance mechanics

### Throw Archetypes
- **Power Thrower:** Raw strength dominates
- **Technical Thrower:** Mechanics compensate for moderate power
- **Speed Thrower:** Rotational or approach velocity drives distance
- **Multi-Throw Athlete:** Competitive across multiple implements

### Decathlon Archetypes
- **Speed-Power Decathlete:** Scoring from sprints, hurdles, jumps
- **Throw-Heavy Decathlete:** Larger athlete, scoring from throws
- **Balanced Decathlete:** Even scoring distribution
- **Endurance-Strong Decathlete:** Points from 400m and 1500m

---

## 8. Team Intelligence

Track and field is scored as a team sport at meets, but the scoring comes from individual performances. Team Intelligence answers: how many team points can we score, where are our gaps, and how should we allocate resources?

### Team Scoring

Points are awarded by placement in each event. At NCAA Championships, scoring is 10-8-6-5-4-3-2-1 for top 8 in individual events and relays. A team needs scorers across multiple event groups to compete for team titles.

### Event Coverage

The system maps every event with the team's top athlete(s) and their KR. Coverage levels range from "Elite" (KR 92+, national scoring potential) to "Empty" (no athletes capable of scoring at conference level). The coverage matrix immediately shows where the team is strong and where they have gaps.

### Scholarship Allocation

NCAA D1 men's track and field programs have 12.6 scholarship equivalencies. These must cover all event groups across three seasons (cross country, indoor track, outdoor track). The system computes Points-Per-Scholarship (PPS) by event group to optimize allocation.

Distance/cross country athletes often represent the highest scholarship efficiency because they compete across all three seasons. Multi-event athletes (sprinters who also jump, throwers who compete in multiple implements) provide additional efficiency.

### Recruiting Gap Analysis

The system identifies scoring gaps from departing athletes, projects coverage for the next season, and specifies the minimum PR needed for a recruit to fill each gap. Each recruit receives a Recruiting Value Score (RVS) based on projected points, eligibility, and scholarship cost.

---

## 9. Meet Simulation

The Simulation Engine projects meet outcomes by event and aggregates team scoring. For each event, it projects athlete performances based on season bests, applies championship peaking factors, accounts for conditions, and ranks athletes to assign points.

### Simulation Types
- **Dual meet:** Two teams, 5-3-1 scoring, 3 entries per team per event
- **Conference championship:** All conference teams, 10-8-6-5-4-3-2-1 scoring
- **Regional qualifying:** Advancement format, no team scoring
- **National championship:** Qualified athletes only, 10-8-6-5-4-3-2-1

### Relay Optimization
The engine optimizes relay team composition and leg assignments to minimize projected relay time, accounting for individual event entries, fatigue, exchange compatibility, and running-start adjustments.

### Scenario Analysis
Coaches can model scenarios: entry changes, PR performances, weather conditions, athlete absences. Each scenario re-simulates affected events and reports the team scoring impact.

---

## 10. Scouting and Meet Operations

### Pre-Meet
Opponent scouting reports compile top athletes by event, projected placements, and head-to-head matchups. Heat sheet analysis identifies tactical considerations for seeded championship meets.

### Meet-Day
Schedule management handles the complex overlapping event timing of track meets. Pre-race tactical briefs provide pace plans, positioning strategies, and key competitor awareness. Field event briefs cover opening heights/distances, progression strategy, and attempt management.

### Post-Meet
Performance review compares actual results to projections, identifies variance sources, and produces actionable takeaways for training and future competition planning.

---

## 11. Development and Pro Transition

### Development Engine
PR projection curves model expected improvement by event group and age. Sprinters peak around 24-28, distance runners around 27-33. The engine produces development roadmaps with specific performance targets, training periodization frameworks, and component KR gap analysis.

### Pro Transition
The professional track and field landscape spans from Diamond League/Olympics (Tier 1) through Continental Tour (Tier 2) to semi-professional competition (Tier 3). The system maps an athlete's KR to professional viability, projects shoe company contract potential, and assesses Olympic/World Championship qualification probability.

### Transfer Portal
For college athletes in the transfer portal, the system evaluates program fit (coaching expertise, training group quality, facilities, scholarship), projects KR improvement at prospective programs, and identifies which programs have event-group scoring gaps that the transferring athlete fills.

---

## 12. Badges

Badges recognize specific achievement patterns beyond the raw KR number:

**Performance Badges:** NCAA Qualifier, NCAA Auto Qualifier, All-American, Conference Champion, Multi-Event Scorer, Sub-Barrier (breaking significant time/distance marks), National Record Holder.

**Competition Badges:** Championship Performer (PR at championship meets), Big-Meet Riser (pattern of improvement at big meets), Iron Man (scored in 3+ events at one meet), Relay Anchor.

**Development Badges:** Rapid Improver (3%+ PR improvement in one season), Four-Year Developer (10%+ improvement over college career), Late Bloomer (5%+ improvement after junior year).

---

## 13. System Risks

The system flags risks that may affect evaluation accuracy:

**Performance Risks:** Wind-aided marks only, altitude-assisted marks only, indoor-only marks, single-meet PR peaks, championship underperformance patterns, injury history.

**Data Risks:** Unverified marks, hand timing, missing wind data, limited competition history.

Every risk flag reduces confidence percentage and is transparently reported in the evaluation output.

---

# PART 2: GOVERNANCE

---

## 14. Governance Rules

1. **Performance is objective truth.** Times and distances are facts. PKR is always the primary anchor.
2. **Deterministic.** Same inputs produce same outputs. No randomness.
3. **No fabrication.** Missing data = UNSCORED. Never invent a PR or meet result.
4. **Confidence always shown.** Every output includes confidence percentage.
5. **Wind-legal distinction is mandatory.** Sprint and jump marks must note wind status.
6. **Indoor vs outdoor tracked separately.**
7. **Altitude adjustment required for distance events above 1000m.**
8. **FAT timing only.** Hand-timed marks must be converted.
9. **KLVN normalizes context, not marks.** Lambda adjusts CKR/TKR/IQKR, never PKR/AKR/EKR.
10. **KR is universal.** One number, multiple legend reads.
11. **Legends are display-only.** They interpret KR, they do not produce it.
12. **Downstream never modifies upstream.** Development and pro transition engines consume KR but never change it.
13. **MEN'S ONLY.** This system evaluates men's track and field exclusively.

---

## 15. Data Sources

**Primary:**
- TFRRS (Track and Field Results Reporting System) - NCAA results
- World Athletics database - international and professional results
- Athletic.net - high school results
- MileSplit - high school and club results

**Secondary:**
- Program and conference websites
- Direct Athletics
- Meet result publications

**Always verify:** timing method, wind readings, altitude, and mark accuracy before using any data point in evaluation.

---

## 16. How Nexus Uses This System

Nexus AI references the MTF intelligence files to answer any track and field question. When a coach asks "evaluate this sprinter," Nexus follows the V1 Evaluation Protocol: collects data via web search, anchors against the event legend, scores component KRs, bounds the result, and outputs a complete evaluation with KR, component breakdown, confidence, Level Tier Map, archetype, badges, and development notes.

When a coach asks "how should we allocate our 12.6 scholarships," Nexus pulls from the Team Intelligence engine: assesses event coverage, identifies gaps, computes points-per-scholarship by event group, and recommends an allocation strategy.

When a coach asks "simulate our conference meet," Nexus runs the Simulation Engine: projects every event, assigns points, sums team scores, identifies swing events, and recommends entry optimizations.

The intelligence is deterministic, transparent, and auditable. Every output traces back to governed source data and documented rules.
