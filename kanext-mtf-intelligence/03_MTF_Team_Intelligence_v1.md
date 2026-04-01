# MEN'S TRACK AND FIELD - TEAM INTELLIGENCE v1

---

## 0. Purpose

The Team Intelligence Engine evaluates the collective scoring potential, event coverage, and resource allocation for a men's track and field program. Unlike team sports where 5 players share a court, track and field teams score points through INDIVIDUAL performances across 19+ events. Team intelligence is about coverage, depth, and resource optimization.

This engine answers:
1. How many points can we score at conference/regional/national meets?
2. Where are our scoring gaps by event group?
3. How should we allocate 12.6 scholarships across event groups?
4. Who should we recruit to maximize team scoring?
5. How does our team compare to conference/regional/national competition?

This engine does NOT evaluate individual athletes. It consumes individual KRs from the Player Evaluation Pipeline (File 01) and aggregates them into team-level intelligence.

---

## 1. TEAM SCORING PROJECTION

### 1.1 Scoring Systems

**NCAA Outdoor Championships:** 10-8-6-5-4-3-2-1 for individual events. 10-8-6-5-4-3-2-1 for relays.
**NCAA Indoor Championships:** 10-8-6-5-4-3-2-1 for individual events. 10-8-6-5-4-3-2-1 for relays.
**Conference Championships:** Varies by conference. Most use 10-8-6-5-4-3-2-1. Some use 10-8-6-4-2 or other systems. Verify per conference.
**Dual Meets:** Typically 5-3-1 for individual events and 5-0 for relays.
**NCAA Regional:** Qualifying format (top finishers advance to nationals), not scored.

### 1.2 Team Scoring Projection Pipeline

**Step 1: Assemble Athlete KR Roster**
List all rostered athletes with their primary and secondary events, KRs, and current-season PRs.

**Step 2: Map Athletes to Events**
For each event, identify the athlete(s) who will represent the team. An athlete can enter a maximum of 3 individual events plus relays at most championship meets.

**Step 3: Project Event Placements**
For each athlete-event pairing:
- Compare the athlete's PR/SB against the expected competition field
- Project placement (1st through last)
- Calculate expected points using the scoring system

**Step 4: Sum Projected Points**
Aggregate projected points across all events for total team score projection.

**Step 5: Confidence Band**
Report projected points with a confidence range:
- High estimate: all athletes perform at or near PR
- Base estimate: athletes perform at season average
- Low estimate: athletes perform at 97% of season average (typical bad-day floor)

### 1.3 Event Entry Optimization

At championship meets, coaches must decide which events each athlete enters. This optimization considers:
- **Primary event vs secondary event value:** Does the athlete score more points in their primary event or by doubling?
- **Doubling fatigue:** Athletes entered in multiple events (especially same-day events) may underperform in the later event
- **Relay implications:** Pulling a sprinter from the 200m to focus on the 4x100m relay
- **Threshold scoring:** If the athlete projects to just miss scoring (e.g., 9th place), entering them elsewhere may yield more total team points

### 1.4 Relay Team Construction

**4x100m Relay:**
- Legs: 1st leg (starts in blocks), 2nd leg (receives and passes), 3rd leg (receives and passes on curve), 4th leg (anchor, receives and finishes)
- Optimal construction: best starter on leg 1, best curve runner on leg 3, fastest top-end on leg 4, strongest hand-off athletes on legs 2-3
- Exchange zone execution adds 0.1-0.3s per exchange vs perfect handoff
- Total time is NOT simply sum of individual 100m times (running start legs are faster)

**4x400m Relay:**
- Legs: 1st leg (starts in lanes), 2nd leg (break-in after first turn), 3rd and 4th legs (running start from exchange zone)
- Optimal construction: best lane runner on leg 1, strongest competitor on leg 2 (most congested), best closer on leg 4, remaining on leg 3
- Athletes can be pulled from individual 400m or open 200m/800m athletes

**Relay Scoring Value:**
Relays score the same points as individual events (10-8-6-5-4-3-2-1 at nationals) but require 4 athletes. The team-scoring-per-athlete ratio of relays must be weighed against individual event opportunities.

---

## 2. EVENT COVERAGE ANALYSIS

### 2.1 Event Group Coverage Matrix

For each event group, the team's coverage is assessed:

| Coverage Level | Definition |
|---------------|------------|
| Elite | 1+ athletes with KR 92+ (national scoring potential) |
| Strong | 1+ athletes with KR 86+ (conference scoring potential) |
| Adequate | 1+ athletes with KR 80+ (can compete at level) |
| Thin | Only 1 athlete with KR 74+ (minimal depth) |
| Empty | No athletes capable of scoring at conference level |

### 2.2 Event Coverage Template

| Event Group | Event | #1 Athlete (KR) | #2 Athlete (KR) | #3 Athlete (KR) | Coverage Level |
|-------------|-------|-----------------|-----------------|-----------------|---------------|
| Sprints | 100m | | | | |
| Sprints | 200m | | | | |
| Sprints | 400m | | | | |
| Hurdles | 110mH | | | | |
| Hurdles | 400mH | | | | |
| Mid-Distance | 800m | | | | |
| Mid-Distance | 1500m | | | | |
| Distance | 3000mSC | | | | |
| Distance | 5000m | | | | |
| Distance | 10000m | | | | |
| Jumps | HJ | | | | |
| Jumps | LJ | | | | |
| Jumps | TJ | | | | |
| Jumps | PV | | | | |
| Throws | SP | | | | |
| Throws | DT | | | | |
| Throws | HT | | | | |
| Throws | JT | | | | |
| Combined | Decathlon | | | | |
| Relay | 4x100m | | | | |
| Relay | 4x400m | | | | |

### 2.3 Event Group Scoring Distribution

Track and field team scoring is distributed across event groups. A balanced team needs points from all groups. Common scoring distributions at NCAA D1 national championships:

| Event Group | Typical % of Total Team Points | Events |
|-------------|-------------------------------|--------|
| Sprints | 15-20% | 100m, 200m, 400m |
| Hurdles | 8-12% | 110mH, 400mH |
| Middle Distance | 8-12% | 800m, 1500m |
| Distance | 12-18% | 3000mSC, 5000m, 10000m |
| Jumps | 15-20% | HJ, LJ, TJ, PV |
| Throws | 12-18% | SP, DT, HT, JT |
| Decathlon | 4-6% | Decathlon |
| Relays | 8-12% | 4x100m, 4x400m |

A team that dominates one group but is empty in others will struggle against balanced teams.

---

## 3. SCHOLARSHIP ALLOCATION (12.6 Equivalencies)

### 3.1 NCAA D1 Men's Track Scholarship Limits

NCAA D1 men's track and field/cross country programs have a maximum of 12.6 scholarship equivalencies. This is a combined limit covering indoor track, outdoor track, and cross country.

12.6 equivalencies means the total scholarship dollars awarded cannot exceed the value of 12.6 full scholarships. A coach can split these however they want - e.g., 25 athletes at 0.5 scholarships each, or 12 full and 1 partial.

### 3.2 Scholarship-Per-Point Model

The core question: where does each scholarship dollar generate the most team points?

**Points-Per-Scholarship (PPS) by event group:**
Track the ratio of team points scored by each event group relative to the scholarship investment in athletes in that group.

| Event Group | Scholarship Investment | Points Scored | PPS |
|-------------|----------------------|---------------|-----|
| Sprints | X.X | XX | XX/X.X |
| Hurdles | X.X | XX | XX/X.X |
| Mid-Distance | X.X | XX | XX/X.X |
| Distance | X.X | XX | XX/X.X |
| Jumps | X.X | XX | XX/X.X |
| Throws | X.X | XX | XX/X.X |
| Decathlon | X.X | XX | XX/X.X |

### 3.3 Scholarship Allocation Strategy Models

**Balanced Model:**
Distribute scholarships roughly proportional to scoring opportunity.
- Sprints/Relays: 2.5-3.0
- Hurdles: 1.0-1.5
- Middle Distance: 1.5-2.0
- Distance/XC: 2.0-2.5
- Jumps: 2.0-2.5
- Throws: 1.5-2.0
- Decathlon: 0.5-1.0
Total: 12.6

**Concentration Model:**
Invest heavily in event groups where the program has coaching expertise and facility advantage.
Example: A program with an elite sprint coach and world-class track surface might allocate 4.0 to sprints/relays, 2.5 to jumps (speed-based jumps overlap), and reduce throws to 1.0.

**Gap-Fill Model:**
Identify the event groups where current scoring is weakest relative to conference competition and invest scholarships there.

**Dual-Sport Leverage Model:**
Distance athletes who also compete in cross country provide two-season value (XC and track). Mid-distance/distance athletes often represent the highest scholarship efficiency because they compete across fall XC and both indoor/outdoor track seasons.

### 3.4 Walk-On Value Assessment

Walk-on athletes (no scholarship) who contribute team points are extremely high value. Track walk-on potential:
- Distance/XC: Highest walk-on success rate (many capable distance runners do not receive scholarships due to 12.6 limit)
- Jumps: Moderate walk-on success (technique athletes can develop)
- Throws: Moderate (athletes from football or other sports can develop)
- Sprints: Lower walk-on success rate (speed is harder to develop)

---

## 4. RECRUITING GAP ANALYSIS

### 4.1 Gap Identification Pipeline

**Step 1: Current Team Event Coverage Assessment (Section 2)**
Identify coverage level for every event.

**Step 2: Graduating/Departing Impact**
List all seniors, transfers out, or otherwise departing athletes and their scoring contributions. Project next-season coverage without them.

**Step 3: Gap Scoring**
For each event with coverage below "Adequate":
- Calculate the points lost from departing athletes
- Calculate the points needed to maintain or improve team standing
- Prioritize gaps by point impact (larger gaps = higher priority recruits)

**Step 4: Recruit Target Profile**
For each gap:
- Minimum PR needed to score at conference level (from legend)
- Minimum PR needed to score at regional/national level
- Ideal KR range for target recruit
- Scholarship budget available for this event group

### 4.2 Recruiting Value Score (RVS)

Each recruit is evaluated for team impact:

RVS = (Projected Points Scored) x (Years of Eligibility Remaining) / (Scholarship Cost)

**Inputs:**
- Projected points scored: from athlete KR mapped against expected conference/national competition
- Years of eligibility: freshmen = 4, JC transfers = 2, grad transfers = 1-2
- Scholarship cost: partial or full equivalency

**High RVS recruits:**
- Multi-event athletes who can score in 2-3 events
- Distance/XC athletes (3-season eligibility use: XC, indoor, outdoor)
- JC transfers who can score immediately with low scholarship cost
- Walk-ons who can develop into scorers

### 4.3 Transfer Portal Intelligence

For transfer targets:
- Verified PR from current institution (via TFRRS)
- KR evaluation using standard protocol
- Projected point contribution at new team
- Eligibility remaining
- Scholarship cost vs point value
- Event group gap alignment (does this transfer fill a gap?)
- Competitive level adjustment (moving up or down in competition level)

---

## 5. TEAM KR

### 5.1 Team KR Computation

Team KR is a composite rating reflecting overall team strength. Unlike basketball where 5 players play at once, track Team KR aggregates individual event capabilities.

**Team KR Formula:**
Team KR = Weighted average of top-scored athlete KRs across all events, where weights reflect scoring opportunity.

**Method:**
1. For each event, take the KR of the team's best athlete
2. Weight each event KR by the event's scoring opportunity proportion (Section 2.3 distribution)
3. Calculate weighted average
4. Adjust for relay competitiveness
5. Adjust for depth (teams with scorers in more events receive depth bonus)

### 5.2 Team KR Interpretation

| Team KR | Interpretation (NCAA D1) |
|---------|------------------------|
| 92+ | National championship contender |
| 88-91 | Top 10 nationally, regional champion |
| 84-87 | Top 25 nationally, conference championship contender |
| 80-83 | Conference top half, regional scoring team |
| 76-79 | Conference bottom half, limited national qualifiers |
| 72-75 | Few conference scorers, building program |
| Below 72 | Minimal competitive impact |

### 5.3 Team Offensive/Defensive Equivalent

Track does not have offense/defense. Instead, Team KR can be decomposed by event group:

| Component | Description |
|-----------|------------|
| Team Sprint KR | Average of top athletes across 100m, 200m, 400m |
| Team Hurdle KR | Average of top athletes across 110mH, 400mH |
| Team Mid-Distance KR | Average of top athletes across 800m, 1500m |
| Team Distance KR | Average of top athletes across 3KSC, 5K, 10K |
| Team Jump KR | Average of top athletes across HJ, LJ, TJ, PV |
| Team Throw KR | Average of top athletes across SP, DT, HT, JT |
| Team Relay KR | Projected relay competitiveness |

This decomposition shows where the team is strong and weak relative to competition.

---

## 6. CONFERENCE AND REGIONAL LANDSCAPE ANALYSIS

### 6.1 Conference Strength Assessment

For a given conference:
- Compile Team KRs for all member programs
- Rank programs by Team KR
- Identify event-group dominance (which programs own which events)
- Project conference championship scoring

### 6.2 Regional Qualifying Landscape

NCAA regionals (East/West) require understanding the qualification bubble:
- For each event, identify the qualifying mark needed to advance from regional to national
- Map team athletes against regional qualifying projections
- Identify athletes who are "on the bubble" and need specific marks

### 6.3 National Landscape

Project team's national championship scoring by:
- Identifying athletes who qualify for nationals (auto + provisional)
- Projecting their placement against the national field
- Summing projected points
- Comparing against projected scores of other top programs

---

## 7. MULTI-SEASON PLANNING

### 7.1 Season Structure

Men's track and field operates on a three-season competitive calendar:
- **Cross Country (Fall):** Distance athletes only. Dual meets, invitationals, conference championship, regional, national championship.
- **Indoor Track (Winter):** All event groups (modified - no DT, HT, JT, no 200m hurdles). Indoor conference championship, indoor national championship.
- **Outdoor Track (Spring):** All events. Conference championship, regional, national championship.

### 7.2 Year-Over-Year Tracking

Team Intelligence tracks year-over-year Team KR and event-group KR trends:
- Team KR trajectory (improving, stable, declining)
- Event group coverage changes (gains and losses by event)
- Scholarship efficiency trend (points per scholarship over time)
- Recruiting class impact (projected improvement from incoming athletes)
- Graduation impact (projected decline from departing athletes)

### 7.3 Recruiting Class Planning

Project 3-year roster with:
- Current roster + development projections
- Anticipated departures (graduation, eligibility exhaustion, transfers)
- Recruiting targets to fill projected gaps
- Scholarship budget by year
- Target Team KR trajectory
