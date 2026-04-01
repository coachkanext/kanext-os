# WOMEN'S GOLF PLAYER EVALUATION PROCESS
## v1.0 - Women's Golf Intelligence

---

# COACH CONTEXT SETUP

## Purpose
Coach Context locks all evaluation parameters before any player evaluation begins. In golf, "Coach Context" means locking the program identity, competitive level, and coaching philosophy. Golf does not have offensive/defensive systems like team ball sports, but it does have program identity, course home advantage, and coaching philosophy that shape evaluation.

## Required Fields

| Field | Description | Example |
|-------|-------------|---------|
| Program | School or organization name | Stanford Cardinal |
| Level | Competitive level | NCAA D1 |
| Governing Body | NCAA, NAIA, NJCAA | NCAA |
| Division | D1, D2, D3 | D1 |
| Conference | Conference affiliation | Pac-12 |
| Major Class (D1 only) | Power 4 / Mid-Major / Low-Major | Power 4 |
| Home Course | Primary home course | Stanford Golf Course |
| Course Setup | Typical home course yardage/par | 6,200 yards, par 72 |
| Program Philosophy | Aggressive/Conservative/Balanced | Balanced |
| Scholarship Budget | Current scholarship allocation (of 6) | 5.5 of 6 used |

## Context Binding
Once Coach Context is set:
- **KLVN level key** is locked (determines which lambda applies)
- **KR Legend selection** is locked (determines which legend interprets the KR)
- **OPF weights** are locked (component KR weighting by position -- though golf has no positional variance, OPF is universal)

## Default Context
If no Coach Context is provided, Nexus defaults to:
- Level: NCAA D1 Power 4 (lambda 1.000)
- Program Philosophy: Balanced
- This provides the baseline evaluation without program-specific fit analysis

---

# PLAYER PROFILE

## Template

```
PLAYER PROFILE
---
Name:
School/Organization:
Level:
Conference:
Class Year:
Height:
Hometown:
Nationality:
Handedness:

SEASON STATS (Current)
Scoring Average:
Rounds Played:
Top 10 Finishes:
Tournament Wins:
Best 54-hole Score:
Low Round:
GIR%:
Putting Average:
Driving Distance:
Driving Accuracy%:
Sand Save%:
Scrambling%:
Par 3 Average:
Par 4 Average:
Par 5 Average:
Birdies/Round:
Eagles:

CAREER CONTEXT
Years of College Eligibility Used:
Prior Schools (if transfer):
Notable Amateur Results:
National Team Experience:
Professional Events Played:
Awards/Honors:

EVALUATION
Data Tier:
KR:
Confidence:
Archetype:
Impact Modifier:
```

---

# PLAYER CONFIDENCE GATE

## Purpose
The confidence gate determines how much trust to place in the evaluation based on data availability. Golf evaluations are heavily dependent on rounds played (sample size) and quality of competition faced.

## Confidence Tiers

| Tier | Rounds Played | Competition Quality | Confidence Range |
|------|--------------|-------------------|-----------------|
| Full | 20+ rounds | Regular conference + invitational schedule | 75-95% |
| Moderate | 12-19 rounds | Mix of quality events | 55-74% |
| Limited | 6-11 rounds | Few events or weak fields | 35-54% |
| Provisional | Under 6 rounds | Insufficient sample | 15-34% |

## Confidence Adjustments

**Upward adjustments (+5-15%):**
- Player competed in NCAA Regional or Championship (+10%)
- Player has multiple seasons of data at current level (+5%)
- Player has verifiable amateur ranking (WAGR) data (+5%)
- Golfstat or similar detailed stats available (+5%)

**Downward adjustments (-5-15%):**
- Stats from team website only, no third-party verification (-5%)
- No GIR% or putting average available (-10%)
- Only scoring average and rounds played available (-15%)
- Player is a freshman with no college rounds yet (-20%, use amateur data only)

## Minimum Confidence for Output
- Full evaluation with KR: 35%+
- Provisional evaluation (KR range only, no component KRs): 15-34%
- Below 15%: Profile only, no KR output

---

# DATA TIERS

| Tier | Definition |
|------|-----------|
| V1 - Stats Only | Public scoring averages, round counts, tournament results, basic stats (GIR%, putting avg, driving distance if available). No shot-level data. |
| V1+ - Stats + Licensed | V1 + Golfstat detailed stats, ShotLink-equivalent data, hole-by-hole scoring breakdowns |
| V2 - Tracking (1 Season) | KaNeXT-owned or partner tracking data. Full shot-level data for one season. Launch monitor data, proximity to hole, strokes gained by category. |
| V3 - Tracking Deep (Multi-Season) | Multiple seasons of tracking data + historical film. Highest fidelity. Swing analysis, pressure performance, course-by-course breakdowns. |

---

# V1 EVALUATION PROTOCOL

This is the standard protocol for evaluating a women's golfer using publicly available statistics. Most evaluations of real players using web-sourced data are V1.

## THE FIVE STEPS

### STEP 1: COACH CONTEXT
Set program, level, governing body, division, conference, major class (if D1). If evaluating a player at a different program than the locked context, note the discrepancy and evaluate against BOTH the player's actual context and the locked program context (for fit assessment).

### STEP 2: PHASE 3 - PRODUCTION ANCHOR

Map the player's full production profile against the KR legend tiers at her level to establish an anchor range.

**Key inputs:**
- Scoring average (THE primary anchor metric for golf)
- GIR% (ball-striking proxy)
- Putting average
- Driving distance
- Driving accuracy%
- Tournament wins and top-10 finishes
- Best finishes (low round, best 54-hole score)
- Awards (All-American, All-Conference, Conference POY)
- Team success context (ranked team, NCAA qualifier, championship contender)
- Strength of schedule (conferences and invitationals played)

**Process:**
1. Pull the legend for the player's level (from File 02 or the separate Legend file)
2. Map scoring average against legend tier benchmarks FIRST (this is the primary anchor)
3. Consider supporting metrics: GIR%, putting, driving distance/accuracy, wins, awards
4. Consider team context: ranked team? NCAA qualifier? Conference champion?
5. Consider strength of schedule: Power 4 conference invitational schedule vs weak field schedule
6. Set the Phase 3 anchor range (e.g., "88-92" based on production profile)

**The Phase 3 anchor is truth.** It is the production-based reality of what this player does at her level. Phase 6 math can adjust within +/-10 of this anchor but cannot override it.

**Anchor against production profile numbers, not award labels.** "All-American = 95+" is a label trap. The production profile numbers (scoring average, GIR%, putting stats) are the anchor. An All-American from a weak conference with an inflated scoring average anchors lower than the label suggests. A non-All-American on a loaded roster at a Power 4 program may anchor higher than the label suggests.

**Women's scoring context:** A 72.0 scoring average at D1 Power 4 women's golf is ELITE. Do NOT apply men's scoring norms. The women's legends have women's-specific benchmarks.

### STEP 3: PHASE 6 - COMPONENT KR SCORING

Score all 5 component KRs using the trait bands and OPF weights from File 02.

**Component KRs for Women's Golf:**
- **BKR (Ball-Striking KR):** Driving distance, driving accuracy, GIR%, approach shot quality, iron play consistency. The tee-to-green game.
- **SKR (Short Game KR):** Scrambling%, sand save%, up-and-down conversion, chipping/pitching quality, bunker play. Everything within 100 yards except putting.
- **CKR (Course Management KR):** Decision-making, risk/reward assessment, course strategy, par-5 scoring, trouble avoidance, scoring average relative to par-3/4/5 breakdown. The thinking game.
- **MKR (Mental KR):** Pressure performance, bounce-back rate, closing ability, consistency (scoring variance), final round scoring vs field, performance in postseason/championship events.
- **AKR (Athletic/Physical KR):** Physical fitness, stamina/endurance (4-5 hour rounds over multiple days), flexibility, injury resilience, speed/power generation for distance, age-adjusted physical profile.

**V1 Scoring (box-score proxies):**
- BKR: Moderate-to-high confidence. GIR% is a strong proxy for ball-striking. Driving distance and accuracy are available at most levels.
- SKR: Moderate confidence. Scrambling% is a strong proxy. Sand save% available at some levels. Up-and-down data sometimes available through Golfstat.
- CKR: Low-to-moderate confidence. Par-3/4/5 scoring breakdown is a good proxy. Birdie rate and eagle count provide supporting evidence. Full shot-level data needed for high confidence.
- MKR: Low-to-moderate confidence. Final round scoring, performance in championship events, scoring variance provide weak proxies. True mental assessment requires V2+ tracking data and pressure performance analysis.
- AKR: Low confidence at V1. Driving distance is the primary proxy for power/speed. Height and build context help. Full physical assessment requires V2+.

**Process:**
1. Score each component KR using the trait bands from File 02
2. Apply KLVN lambda to raw production stats before scoring (normalize inputs)
3. UNSCORED traits contribute zero weight; scored traits renormalize to carry the full weight within their cluster
4. Compute weighted KR using OPF

**OPF Weights (Women's Golf - Universal, no positional variance):**
- BKR: 35% (ball-striking is the foundation)
- SKR: 25% (short game separates good from elite)
- CKR: 20% (course management is more valuable in women's golf where power advantages are less decisive)
- MKR: 12% (mental game is critical in golf's individual competition format)
- AKR: 8% (physical tools enable but do not define golf performance)

### STEP 4: PHASE 6 ADJUSTS WITHIN PHASE 3 +/-10

Phase 3 anchor range expanded by 10 in either direction = allowable window. Phase 6 tells direction:
- If Phase 6 components confirm the production anchor: Final KR at or above midpoint
- If Phase 6 reveals hidden weaknesses (e.g., GIR% is inflated by easy courses, putting is poor): Final KR pushed toward bottom of window
- If Phase 6 reveals hidden strengths (e.g., elite scrambling behind a moderate scoring average, strong pressure performance): Final KR pushed toward top

### STEP 5: FINAL KR

Adjusted number = V1 KR. State confidence percentage. Output Level Tier Map, archetype, badges, impact modifier.

**Final KR output must include:**
1. Final KR (one decimal: e.g., 88.4)
2. Confidence percentage
3. Component KRs (BKR, SKR, CKR, MKR, AKR)
4. Phase 3 anchor range and rationale
5. Archetype assignment
6. Badge list (if any)
7. Impact modifier
8. Level Tier Map (what this KR means at 3-5 relevant levels)
9. Suppression flags (if any)
10. Data gaps and what would change confidence

---

# CONTEXTUAL MODE

## Purpose
Contextual Mode governs how Nexus interprets stats in context. Golf statistics are highly dependent on course difficulty, field strength, weather conditions, and format. Contextual Mode flags situations where raw numbers may be misleading.

## Contextual Flags

### Course Difficulty Adjustment
Golf scoring averages are meaningless without course context. A 73.0 scoring average on a 6,400-yard, par-72 course with no wind is NOT the same as a 73.0 on a 6,100-yard, par-72 links course with 20mph wind.

**Detection:** Compare player's scoring average to field average at the same events. The Golfstat "vs par" and "vs field" metrics are more meaningful than raw scoring average.

**Treatment:** When scoring vs field data is available, use it as the primary anchor metric instead of raw scoring average. When not available, note the caveat.

### Field Strength Adjustment
Tournament fields vary enormously. A win at the NCAA Championship (50+ ranked teams) is not the same as a win at a fall invitational with a weak field.

**Detection:** Presence of ranked teams in the field. Conference strength. Event prestige.

**Treatment:** Weight results from strong-field events more heavily. Note field strength in evaluation.

### Format Adjustment
Match play performance is different from stroke play performance. Some players excel in match play (head-to-head pressure, aggressive strategy) but underperform in stroke play (patience, consistency), and vice versa.

**Detection:** If player has both match play and stroke play results, compare performance profiles.

**Treatment:** Note format strengths/weaknesses. NCAA Championship format (stroke play qualifying + match play finals) requires both.

### Weather/Altitude Adjustment
Golf performance is affected by weather (wind, rain, temperature) and altitude. Driving distance at altitude (Denver, Colorado Springs) is inflated. Scoring in wind is harder.

**Detection:** Home course location and typical conditions. Tournament location variety.

**Treatment:** Note environmental factors when they are significant.

---

# SUPPRESSION DETECTION RULES

Contextual Mode must actively detect and flag statistical suppression. Suppression occurs when a player's production is artificially depressed by factors external to her ability.

## Standard Suppression Indicators

**Loaded Roster Suppression**
Elite programs (Stanford, USC, Arizona, Duke, Wake Forest) stockpile talent. A player who would be the #1 player on 90% of D1 rosters might be the #3 or #4 player on a loaded roster. Her tournament wins and individual accolades are suppressed because she is competing against equally talented teammates for limited individual honors.

**Detection:** Player is on a team ranked in the top 10 nationally. Player's scoring average is within 1 stroke of teammates. Player has limited individual wins despite strong average.

**Treatment:** Evaluate the player's scoring average and stats in isolation, not relative to team rank. Note roster depth context.

**Injury Suppression**
Golfers returning from injury (particularly wrist, back, hip, and shoulder injuries) may show suppressed performance for 3-12 months.

**Detection:** Season-over-season scoring average increase with no level change. Known injury history. Reduced rounds played.

**Treatment:** Produce BOTH current production estimate AND pre-injury baseline. Flag gap as injury suppression.

**Coaching/Development Mismatch Suppression**
A talented player on a poorly coached team may show suppressed development. Golf is an individual sport but coaching affects practice structure, course management training, mental game development, and equipment optimization.

**Detection:** Player's scoring average plateaus or worsens despite age-appropriate physical maturity. Player transfers to a stronger program and immediately improves.

**Treatment:** Note coaching context. If transfer data shows improvement, weight the post-transfer data more heavily.

**Schedule Strength Suppression**
A player in a weak conference with an easy fall schedule may have an artificially low (better) scoring average. Conversely, a player in a strong conference playing demanding courses may have an inflated (worse) scoring average.

**Detection:** Compare scoring average vs field at each event. Conference strength assessment.

**Treatment:** Use vs-field metrics when available. Weight strong-field results more heavily.

## Women's Golf Specific Suppression Indicators

**Pregnancy/Motherhood Suppression (UNIQUE TO WOMEN'S GOLF)**
This suppression type has no equivalent in men's golf. It applies when:
- A player has publicly disclosed a pregnancy or birth within the past 24 months
- The player has returned to competition after pregnancy/childbirth
- The player's current production is below her pre-pregnancy baseline

This is primarily relevant at the professional level but can occur at the college level. NCAA rules protect scholarship status during pregnancy. The system must handle it at all levels.

**Detection signals:**
- Season-over-season scoring average increase with no injury explanation
- Public disclosure of pregnancy/maternity leave
- Extended absence (6+ months) followed by return with higher scoring average
- Reduced tournament schedule in the return season
- Physical tool metrics (AKR) showing decline from prior baseline (distance loss, stamina concerns)

**Treatment:**
- Produce BOTH the current visible production estimate AND the pre-pregnancy baseline
- Flag the gap as "Pregnancy/Motherhood Suppression" with estimated recovery timeline
- Do NOT treat pregnancy suppression as permanent decline
- Typical recovery to pre-pregnancy baseline: 6-18 months for professional players
- The pre-pregnancy KR represents the player's true ceiling; current KR represents current reality
- Both numbers are reported. Neither is dismissed.

**LPGA Maternity Leave Policy Context:**
- LPGA provides medical extensions for pregnancy
- Players on maternity leave retain exempt status for one year
- The Epson Tour has similar protections
- College players retain scholarship during pregnancy per NCAA rules
- These policies reduce but do not eliminate the competitive impact of maternity

**Equipment/Technology Suppression**
Women's golf equipment technology has improved significantly but the women's equipment market lags behind men's in R&D investment. Some players, particularly at lower levels, may be playing with suboptimal equipment.

**Detection:** This is primarily a V2/V3 detection (requires launch monitor data). At V1, flag if driving distance is anomalously low relative to other metrics.

**Treatment:** Note as a possible factor. Do not adjust KR without evidence.

**International Player Adjustment Period**
International players (particularly from Asia) who enter US college golf may show suppressed early-season performance as they adjust to different course conditions, grass types (Bermuda vs bentgrass vs Poa annua), weather patterns, and culture.

**Detection:** International freshman with strong amateur record showing unexpectedly high scoring average in first college season.

**Treatment:** Weight second semester/spring results more heavily than fall results for international freshmen.

---

# MULTI-LEVEL PLAYER PROTOCOL

When a player competes across multiple competitive levels in a single season (common in golf - college players entering professional events, or NJCAA players competing in D1 invitationals):

1. Each level's data is evaluated separately through Phases 1-3, producing level-specific stat lines and raw KR ranges.
2. The highest-level data carries the most interpretive weight for KR estimation.
3. Lower-level data is used to CONFIRM capabilities that higher-level data cannot show due to small sample.
4. Cross-level stat divergence is a signal, not noise.
5. The final KR range is anchored to the highest level the player has meaningful data at.
6. KLVN lambdas are applied when translating the final KR to a specific level's legend.

**Golf-Specific Multi-Level Notes:**
- College players who Monday-qualify for LPGA/Epson events provide the strongest cross-level signal
- Players who compete in USGA amateur championships (US Women's Amateur, US Women's Open qualifying) provide high-quality amateur-vs-pro data points
- International amateur rankings (WAGR) provide cross-border normalization when available

---

# FOUNDING TEST CASES

These are the reference evaluations used to validate the evaluation protocol. Each test case was run through the pipeline and the output was verified against expert assessment.

## Test Case 1: Elite D1 Power 4 Player
**Profile:** Senior at a top-10 program. 71.5 scoring average. 75% GIR. Multiple tournament wins. All-American candidate. 260-yard driving distance. Strong putter.
**Expected KR:** 94-97 range
**Expected Archetype:** Complete Player or Precision Scorer
**Purpose:** Validates that the top of the D1 legend maps correctly.

## Test Case 2: Average D1 Mid-Major Player
**Profile:** Junior at a mid-major program. 75.0 scoring average. 65% GIR. 1-2 top-10 finishes. 240-yard driving distance. Average putting.
**Expected KR:** 78-82 range
**Expected Archetype:** Steady Contributor or Course Grinder
**Purpose:** Validates the middle of the D1 distribution.

## Test Case 3: Elite NAIA Player
**Profile:** Sophomore at a strong NAIA program. 74.0 scoring average (NAIA). 70% GIR. Conference champion. 245-yard driving distance.
**Expected KR:** 82-86 range (competitive at low D1)
**Expected Archetype:** Ball-Striker or Rising Talent
**Purpose:** Validates cross-level KLVN normalization.

## Test Case 4: Professional Player (LPGA)
**Profile:** 3rd-year LPGA player. 70.5 scoring average. 72% GIR. 1 LPGA win. 265-yard driving distance. Strong scrambling.
**Expected KR:** 90-93 range
**Expected Archetype:** Tour Winner or Complete Professional
**Purpose:** Validates pro legend mapping.

## Test Case 5: Pregnancy Return Player
**Profile:** LPGA veteran returning from maternity leave. Pre-pregnancy: 70.0 scoring average, 74% GIR. Post-return (current): 72.5 scoring average, 68% GIR. 8 months post-childbirth.
**Expected KR:** Current 84-87, Pre-pregnancy baseline 91-94
**Expected Suppression Flag:** Pregnancy/Motherhood Suppression
**Purpose:** Validates pregnancy suppression detection and dual-KR output.
