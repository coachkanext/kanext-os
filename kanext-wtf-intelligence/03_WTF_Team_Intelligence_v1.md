# Women's Track and Field Team Intelligence v1

---

## 0. SCOPE

This is the single authoritative document for team-level intelligence in women's track and field. It covers Team KR computation, event group analysis, scholarship allocation (18 D1 equivalency scholarships), roster decision intelligence, and team scoring projection.

This engine consumes Athlete KR outputs from Mode 1. It NEVER modifies individual Athlete KRs.

---

# TEAM KR PIPELINE

## 1. What Team KR Measures

In track and field, "team" means something different than in basketball or volleyball. There is no lineup. Athletes compete individually (or in relay teams of 4) and accumulate points. Team KR measures the collective scoring potential across all event groups.

**Team KR is NOT a simple average of Athlete KRs.** It is a weighted composite of event group coverage, depth, and scoring potential at the target competition level.

## 2. Team KR Computation

### Step 1: Event Group Inventorying
Inventory every rostered athlete by event group:
- Sprints (100m, 200m, 400m)
- Hurdles (100mH, 400mH)
- Middle Distance (800m, 1500m)
- Distance (3000mSC, 5000m, 10000m)
- Jumps (HJ, LJ, TJ, PV)
- Throws (SP, DT, HT, JT)
- Heptathlon
- Relays (4x100m, 4x400m)

Athletes who compete in multiple event groups are counted in each.

### Step 2: Event Group KR
For each event group, compute the Event Group KR:

**Scoring athletes:** Most meets score top-3 finishers per event (for team scoring). The top 3 athletes in each event by Athlete KR form the "scoring core."

```
Event_Group_KR = (Top_Athlete_KR * 0.40) + (Second_Athlete_KR * 0.30) + (Third_Athlete_KR * 0.20) + (Depth_Score * 0.10)
```

**Depth_Score** = average KR of 4th through 6th athletes in the event group (or available depth). If fewer than 4 athletes in the group, Depth_Score = 0.

### Step 3: Relay KR
Relay KR is computed separately:
- 4x100m Relay KR: based on the top 4 available 100m/200m athletes (individual KRs + relay split history)
- 4x400m Relay KR: based on the top 4 available 400m/800m athletes

Relay scoring is high-value (same points as individual events but contested by 4 athletes) and heavily influences Team KR.

### Step 4: Team KR Composite

```
Team_KR = Weighted sum of Event Group KRs + Relay KR

Weights:
  Sprints:          0.12
  Hurdles:          0.10
  Middle Distance:  0.10
  Distance:         0.14
  Jumps:            0.14
  Throws:           0.14
  Heptathlon:       0.08
  Relay (4x100m):   0.09
  Relay (4x400m):   0.09
```

**Why distance and field events weight slightly higher:** These events have more individual events (3 distance events, 4 jump events, 4 throw events), meaning more individual scoring opportunities. More events = more points available = higher weight in Team KR.

### Step 5: Coverage Map
Produce a visual coverage map showing event group strength:

```
TEAM KR COVERAGE MAP
======================
Team: [School] | Level: [Level]
Team KR: [XX.X]

Event Group KRs:
  Sprints:         [XX.X] | Depth: [N athletes]
  Hurdles:         [XX.X] | Depth: [N athletes]
  Middle Distance: [XX.X] | Depth: [N athletes]
  Distance:        [XX.X] | Depth: [N athletes]
  Jumps:           [XX.X] | Depth: [N athletes]
  Throws:          [XX.X] | Depth: [N athletes]
  Heptathlon:      [XX.X] | Depth: [N athletes]
  4x100m Relay:    [XX.X]
  4x400m Relay:    [XX.X]

GAPS: [Event groups with Event Group KR below 75 or zero depth]
STRENGTHS: [Event groups with Event Group KR above 88]
```

---

# TEAM SCORING PROJECTION

## 1. Conference Meet Projection

For a given conference meet, project team scoring by:

1. **Rank all athletes in each event** across the conference (using Athlete KRs)
2. **Project place finishes** based on KR ranking
3. **Apply scoring system:** Standard NCAA scoring is 10-8-6-5-4-3-2-1 for places 1-8 in each event
4. **Sum projected points across all events + relays**
5. **Project team finish** in conference standings

### Scoring Systems by Level
- NCAA D1 Championship: 10-8-6-5-4-3-2-1 (8 scoring places per event)
- NCAA D1 Conference: varies by conference (some use 10-8-6-5-4-3-2-1, some go deeper)
- NCAA D2/D3: typically 10-8-6-5-4-3-2-1
- NAIA: 10-8-6-5-4-3-2-1
- NJCAA: varies

### Relay Scoring
Relays score the same points as individual events. A 4x400m relay victory = 10 points, same as an individual 400m victory. This makes relays extremely high-value per team scoring impact.

## 2. Dual Meet Projection

Dual meets (head-to-head) use 5-3-1 scoring (places 1-2-3 per event):
1. Rank athletes in each event
2. Assign 5-3-1 points
3. Relay: 5-0 (first and second, no third)
4. Sum points

---

# SCHOLARSHIP / NIL ALLOCATION ENGINE

## Purpose
Optimizes allocation of 18 equivalency scholarships (NCAA D1 women's track and field) and NIL resources to maximize Team KR.

## Scholarship Structure (Women's Track and Field)

| Level | Scholarship Limit | Type |
|-------|-------------------|------|
| NCAA D1 | 18 equivalency | Can be split across athletes |
| NCAA D2 | 12.6 equivalency | Can be split |
| NCAA D3 | 0 athletic | Academic/need-based only |
| NAIA | 12 equivalency | Can be split |
| NJCAA D1 | 20 (varies) | Varies by sport designation |
| NJCAA D2 | 20 (varies) | Varies |
| NJCAA D3 | 0 | No athletic scholarships |

**Key difference from men's track:** Women's D1 track has 18 scholarships vs men's 12.6. This means more scholarship dollars available per athlete and more flexibility in roster construction.

**Equivalency scholarships** can be divided among multiple athletes. A program with 18 scholarships might distribute them across 30-40 athletes in partial amounts.

## Scholarship Allocation Strategy

### Priority Framework
1. **Event group scoring impact:** Scholarships flow to athletes who contribute the most to Team KR
2. **Relay utility multiplier:** Athletes who contribute to both individual events and relays get a premium
3. **Multi-event athletes:** Heptathletes who score across multiple sessions get a premium
4. **Event coverage gaps:** Higher scholarship priority for event groups where depth is thin
5. **Retention risk:** Athletes who might transfer without adequate scholarship get a retention premium

### Allocation Formula
```
Scholarship_Value = f(Athlete_KR, Event_Group_Need, Relay_Utility, Multi_Event_Score, Retention_Risk)
```

### Event Group Allocation Guidelines (18 scholarships across event groups)
Typical D1 distribution:
- Sprints/Hurdles: 4.0-5.0 scholarships (covers ~8-12 athletes)
- Middle Distance: 2.5-3.5 scholarships (covers ~5-8 athletes)
- Distance/XC: 3.5-4.5 scholarships (covers ~8-12 athletes)
- Jumps: 2.5-3.5 scholarships (covers ~5-8 athletes)
- Throws: 2.5-3.5 scholarships (covers ~5-8 athletes)
- Heptathlon: 1.0-2.0 scholarships (covers ~2-4 athletes)

These are guidelines, not mandates. Programs adjust based on event group strength and competitive philosophy.

## PTV (Player Transfer Value)
PTV estimates the scholarship/financial value an athlete deserves based on her KR, event group need, and replacement cost.

```
PTV = f(Athlete_KR, Event_Group_Need, Replacement_KR_at_event, Scholarship_value, NIL_market)
```

Track and field NIL is growing but remains modest compared to revenue sports. Elite athletes (Olympic-caliber, social media presence, charismatic personalities) can command meaningful NIL. Most track athletes rely primarily on scholarship and academic aid.

---

# ROSTER DECISION INTELLIGENCE v1

## Purpose
Provides data-driven recommendations for roster construction decisions: recruiting targets, portal entries, portal pickups, roster cuts.

## Framework
1. **Identify Team KR gaps** from Coverage Map
2. **Rank event group needs** by impact on Team KR
3. **Match available athletes** (recruits, portal entries) to needs
4. **Project Team KR impact** of each potential addition
5. **Recommend** top targets with projected Team KR change, event coverage change, and scholarship cost

## Women's Track-Specific Considerations

### Transfer Portal Activity
The transfer portal is extremely active in women's track and field. Athletes transfer for:
- Event-specific coaching (a thrower seeking a throws-focused program)
- Better facilities (indoor track, throwing cage, pole vault facility)
- Higher competitive level
- Scholarship improvements
- Coaching changes creating instability

### International Recruiting
International athletes are a significant factor in women's distance events particularly. Many top D1 distance programs recruit heavily from East Africa (Kenya, Ethiopia), Europe, and Australia. International recruits often arrive with strong marks but require adaptation to the US collegiate system (indoor season, altitude differences, academic load).

### Walk-On Contributions
Women's track has more roster spots than scholarships (18 scholarships, 30-80 athletes). Walk-ons are critical contributors, especially in throws and jumps where late development is common.

### Pregnancy/Motherhood Roster Planning
The system projects roster availability honestly without discriminating. An athlete returning from pregnancy is evaluated on her current marks with suppression adjustment. The system does NOT factor pregnancy status into recruiting recommendations except as it affects current competitive readiness.

### Cross Country Integration
Women's cross country shares the same coaching staff and roster as outdoor track. Distance recruiting must account for both XC and track priorities. XC team scoring requires 5 runners (top 5 out of 7 entries score). A strong XC team requires 7+ competitive distance runners.

---

# TEAM DIAGNOSTICS

## 1. Event Group Balance Analysis
Compute the standard deviation of Event Group KRs. Lower SD = more balanced team.

```
Balance_Score = 100 - (SD_of_Event_Group_KRs * 2)
```

Teams with Balance_Score > 85 are well-balanced. Teams below 70 have significant event group gaps.

## 2. Scoring Concentration Risk
What percentage of projected team points come from the top 3 athletes?
- Healthy: top 3 athletes contribute < 30% of total team points
- Concentrated: top 3 contribute 30-45%
- At-risk: top 3 contribute > 45% (injury/transfer to any one creates major scoring loss)

## 3. Class Distribution
Track team health requires balanced class distribution for sustainability:
- Healthy: no more than 35% of scoring athletes in any one class year
- At-risk: > 40% of scoring athletes are seniors (graduation cliff)
- Developing: > 40% are freshmen/sophomores (upside but current scoring limited)

## 4. Event Depth Index
For each event group: (number of athletes with KR >= 80) / (number of scoring places available)
- Index > 1.5 = strong depth (more competitive athletes than scoring slots)
- Index 1.0-1.5 = adequate depth
- Index < 1.0 = scoring gap (not enough competitive athletes to fill scoring places)

---

# TEAM LEGENDS

## NCAA D1 Women's Track and Field Team KR Legend

| Team KR | Label |
|---------|-------|
| 95-100 | National championship contender |
| 90-94 | Top-10 national program |
| 85-89 | Top-25 national program, conference championship contender |
| 80-84 | Strong regional program, conference top-half |
| 75-79 | Competitive conference program |
| 70-74 | Developing program, conference bottom-half |
| 65-69 | Rebuilding or limited-resource program |
| <65 | Start-up or severely underfunded program |

---

# SEASON PLANNING ENGINE

## 1. Indoor/Outdoor Periodization
Track and field has two distinct seasons:
- **Indoor season** (December/January - March): limited events, no discus/javelin/hammer, 200m on flat track or banked, shorter distances
- **Outdoor season** (March - June): full event slate, championship season

Team KR can be computed separately for indoor and outdoor if needed. Outdoor Team KR is the primary competitive metric.

## 2. Redshirt Planning
Track coaches can redshirt athletes strategically:
- Use indoor season for development, redshirt outdoor (or vice versa)
- Preserve eligibility for athletes returning from injury
- Develop technique for athletes transitioning events

## 3. Multi-Event Management
Heptathletes require careful scheduling:
- Heptathlon is contested at select meets (not every week)
- Athletes may compete in individual events between multi-event competitions
- Balancing individual event development with heptathlon preparation
- Conference and national championship heptathlon scheduling

---

# GOVERNANCE

- Team KR consumes Athlete KR; never modifies it
- Scholarship allocation is a recommendation tool, not a mandate
- Coverage Map must be produced for every team evaluation
- Relay KR is always computed (even if relay times are unknown, project from individual marks)
- Pregnancy/motherhood does not factor into roster construction recommendations except as it affects current competitive readiness
- Event group weights in Team KR are fixed (Section 1, Step 4) and cannot be modified per-evaluation
- All team projections include confidence ranges
