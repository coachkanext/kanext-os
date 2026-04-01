# MEN'S GOLF TEAM INTELLIGENCE
## File 03 - v1.0

---

# TEAM KR - MATH, PIPELINE, AND DIAGNOSTICS

## 0. Scope
This is the single authoritative document for Men's Golf Team KR computation. Team KR is the aggregation of individual player KRs using the "best 4 of 5" scoring model that mirrors actual college golf team scoring.

Team KR does not evaluate players. It consumes finalized player outputs from upstream.

---

## 1. Inputs (Non-Negotiable)

Team KR consumes only:

**Per player on roster:**
- Final Player KR (from Player Evaluation Pipeline)
- Component KRs (BKR, SKR, CKR, MKR, AKR)
- Archetype
- Player confidence_pct
- Season scoring average (raw and adjusted)
- Tournament results history
- Course-type performance splits (if available)

**Per program (from Coach Context Setup):**
- Governing Body / Division (and Major Class if NCAA D1)
- Team Philosophy
- Competitive level
- Roster size
- Scholarship allocation (out of 4.5 max)

**Explicit exclusions (locked):**
- No archetype recomputation
- No badge recomputation
- No trait recomputation
- No injury/fatigue modeling
- No weather modeling (that is simulation, not team identity)

---

## 2. How College Golf Team Scoring Works

College golf tournaments use a standardized scoring format:
- Each team enters **5 players** per tournament
- Each player plays all rounds (typically 54 holes / 3 rounds, some events are 36 holes)
- After each round, the team's score is the **sum of the best 4 of 5 individual scores**
- The 5th (worst) score is dropped each round
- The dropped score can come from a different player each round
- Final team standing is based on total team score across all rounds

This "best 4 of 5" format creates a unique strategic dynamic:
- The 5th player provides insurance (if one of the top 4 has a bad round, the 5th player's score can count instead)
- Consistency is more valuable than upside at the team level (a player who always shoots 73 is more valuable than one who alternates between 69 and 79)
- One blow-up round (80+) by a player does not kill the team IF the other 4 are solid
- But if TWO players blow up in the same round, the team has no safety net

---

## 3. Team KR Computation

### Step 1: Identify Tournament Lineup (Top 5)
Rank all rostered players by KR. The top 5 by KR form the presumptive tournament lineup. If coach overrides this (e.g., for course-specific fit), note the override.

### Step 2: Simulate Best 4 of 5
For team scoring purposes, drop the lowest KR from the top 5. Compute Team Counting KR as the average of the remaining 4 players' KRs.

**Team Counting KR = Average of Top 4 KRs from the 5-player lineup**

### Step 3: Depth Factor
The 5th player matters. Their role is insurance. If the 5th player is close to the top 4, the team is deep (any player can be the dropped score without hurting the team). If the 5th player is far below, the team is fragile (if any top-4 player struggles, the team's dropped score is still high).

**Depth Factor = 1 - ((Top4 Average KR - 5th Player KR) / 20)**
- Clamped between 0.85 and 1.00
- If the 5th player is within 3 KR points of the top-4 average: Depth Factor = 1.00 (maximum depth)
- If the 5th player is 10+ KR points below: Depth Factor = 0.85 (fragile)

### Step 4: Consistency Modifier
Teams with consistent players (low variance) outperform teams with volatile players in the best-4-of-5 format. This is because consistent players rarely need to be the dropped score.

**Consistency Score = 100 - Average(Standard Deviation of each player's round scores)**
- Normalized to 0-100 scale
- Converted to modifier: (Consistency Score / 100) * 0.05 - 0.025
- Range: -0.025 to +0.025 (slight boost for consistent teams, slight penalty for volatile)

### Step 5: Final Team KR

**Team KR = Team Counting KR * Depth Factor * (1 + Consistency Modifier)**

### Output
- Team KR (single number, 0-100 scale)
- Team Counting KR (top 4 average)
- Depth Factor
- Consistency Modifier
- Individual player KRs in lineup order
- 5th player KR and depth gap

---

## 4. Team Offense / Defense Equivalent

Golf does not have offense and defense, but teams can be characterized by their scoring profile:

### Team Scoring Profile

**Team Birdie Rate** = Average birdies per round across counting players
- Measures scoring firepower. Analogous to "offense."

**Team Bogey Avoidance Rate** = Average (18 - bogeys per round) across counting players
- Measures defensive consistency. Analogous to "defense."

**Team Par-5 Conversion** = Average par-5 scoring across counting players
- The primary scoring opportunity in college golf. Teams that convert par-5s win.

**Team Scrambling Rate** = Average scrambling % across counting players
- Recovery ability. When ball-striking falters, can the team save par?

### Team Style Classification

Based on scoring profile, teams are classified into one of four styles:

| Style | Birdie Rate | Bogey Avoidance | Description |
|-------|------------|----------------|-------------|
| Scoring Machine | Top 25% at level | Any | Wins by making birdies. Outscores the field. |
| Fortress | Any | Top 25% at level | Wins by not making bogeys. Outlasts the field. |
| Balanced Attack | Top 50% in both | Top 50% in both | No dominant strength but no weakness. Adapts. |
| Volatile | Top 25% in one | Bottom 25% in other | High ceiling, low floor. Streaky. |

---

## 5. Course-Type Strength Analysis

Different golf courses demand different skills. Team intelligence must project how a team will perform on different course types.

### Course Type Categories

| Course Type | Primary Skills Tested | Archetype Advantage |
|-------------|---------------------|-------------------|
| Long and Open (7,200+ yards, wide fairways) | Driving distance, par-5 scoring, power | Bomber |
| Tight and Tree-Lined (narrow fairways, heavy rough) | Driving accuracy, GIR, course management | Precision Player |
| Links-Style (firm, fast, windy, minimal trees) | Shot shaping, wind management, creativity, scrambling | Complete Player, Grinder |
| Short and Demanding (under 7,000 yards, tricky greens) | Iron play, short game, putting | Short Game Wizard, Precision Player |
| Resort/Tropical (elevation changes, humidity, rain) | Endurance, adaptability, scrambling | Complete Player |
| Mountain/Altitude (high elevation, thin air) | Distance control adjustment, club selection | Course Management focused |

### Team Course Fit Score

For each course type, compute a Team Course Fit Score:
1. Identify the course type for an upcoming tournament
2. For each player in the lineup, compute their archetype's advantage/disadvantage for that course type
3. Average across the counting 4 players
4. Adjust for specific trait strengths that match course demands

Output: Team Course Fit % (0-100) for each course type, with recommendations for lineup adjustments if the standard top-5 is suboptimal for the specific course.

---

## 6. Lineup Selection Intelligence

### Standard Lineup
Top 5 by KR. This is the default.

### Course-Adjusted Lineup
When a tournament is at a course type that favors specific archetypes, the coach may want to adjust:
1. Compute KR of each player
2. Compute Course Fit Score for each player at the specific course type
3. Compute Adjusted Tournament KR = Player KR * (0.85 + 0.15 * Course Fit Score / 100)
4. Re-rank by Adjusted Tournament KR
5. If the re-ranking changes the top 5, present both options to the coach with projected Team KR under each lineup

### Lineup Decision Rules
- Never override KR by more than 2 positions (a player ranked 7th by KR cannot jump to the top 5 purely on course fit)
- Course fit adjustment is bounded: max +/-3 KR points
- If KR gap between players is more than 5 points, KR wins regardless of course fit
- Always present both options (KR-ranked and course-adjusted) and let the coach decide

---

## 7. Scholarship Allocation Engine

### Men's Golf Scholarship Limits
- NCAA D1: 4.5 equivalencies (can be split across roster)
- NCAA D2: 3.6 equivalencies
- NCAA D3: 0 (no athletic scholarships)
- NAIA: 5 equivalencies (at NAIA-member institutions that offer golf)
- NJCAA D1: 8 full scholarships
- NJCAA D2: 8 full scholarships
- NJCAA D3: 0 (no athletic scholarships)

### 4.5 Equivalency Strategy (NCAA D1)

With only 4.5 scholarships across a roster of 8-12 players, allocation is critical. Every tenth of a scholarship matters.

**Allocation Framework:**

Tier 1 - Team Anchors (2-3 players): 0.8-1.0 equivalency each
- Top KR players who are counted scores nearly every round
- These are the players you cannot afford to lose

Tier 2 - Reliable Counters (1-2 players): 0.4-0.7 equivalency each
- Consistent contributors who count more often than not
- Important for depth and best-4-of-5 insurance

Tier 3 - Development/Depth (2-3 players): 0.1-0.3 equivalency each
- Future contributors who show trajectory
- May receive more institutional/merit aid to supplement

Tier 4 - Walk-Ons (remaining roster): 0.0 equivalency
- Institutional aid, merit scholarships, or self-funded
- Practice depth and future development

### Player Tournament Value (PTV)

PTV measures how much a player's presence changes Team KR:

**PTV = Team KR (with player in lineup) - Team KR (with player removed, next man up inserted)**

High PTV = critical to team success = higher scholarship allocation
Low PTV = replaceable within roster = lower scholarship allocation

### Scholarship Efficiency Ratio

**SER = PTV / Scholarship Equivalency Allocated**

Higher SER = more value per scholarship dollar. Teams should optimize SER across the roster while maintaining competitive viability.

---

## 8. Roster Decision Intelligence

### Recruiting Priorities

Given current roster composition and Team KR, identify:
1. **Biggest KR gap** - which position in the lineup (1st through 5th) is weakest?
2. **Archetype gap** - what archetype would most improve course-type versatility?
3. **Graduation losses** - who is leaving and what KR/archetype they take with them
4. **Depth gap** - is the 5th-to-6th player gap too large? (fragile depth)

### Transfer Portal Strategy

For college golf, the transfer portal is a critical roster management tool:
1. Identify players in the portal with KR above current roster threshold
2. Filter by archetype need and course-type fit
3. Assess scholarship availability (can you afford this player within 4.5?)
4. Project Team KR impact (run the team evaluation with the portal player inserted)

### Roster Size Optimization

Optimal roster size for men's golf programs:

| Level | Optimal Roster | Min Competitive | Notes |
|-------|---------------|----------------|-------|
| D1 Power | 10-12 | 8 | Need depth for fall + spring, injuries, academic conflicts |
| D1 Mid-Major | 8-10 | 7 | Tighter budgets but still need 5+ competitive players |
| D1 Low-Major | 7-9 | 6 | Budget constraints limit roster size |
| D2 | 8-10 | 6 | Similar to mid-major D1 |
| NAIA | 6-8 | 5 | Smaller programs, limited budgets |
| NJCAA | 6-8 | 5 | 2-year window creates constant turnover |
| D3 | 8-12 | 6 | No scholarship cost, larger rosters feasible |

---

## 9. Team KR Legends

### Team KR interpretation varies by level. See the corresponding Player KR Legend files for individual reads. Team KR uses the following interpretation framework:

**NCAA D1 Power Conference Team KR:**

| Team KR | Tier Label |
|---------|-----------|
| 94+ | National Championship Contender |
| 91-93 | Elite Top-15 National Program |
| 88-90 | Regional Contender / Top-30 National |
| 85-87 | Competitive Conference Team / NCAA Tournament Qualifier |
| 82-84 | Mid-Pack Conference / NCAA Tournament Bubble |
| 79-81 | Bottom-Half Conference |
| 76-78 | Conference Bottom / Non-Competitive Nationally |
| Below 76 | Rebuilding / Below Conference Competitive Threshold |

**NCAA D2 Team KR:**

| Team KR | Tier Label |
|---------|-----------|
| 90+ | National Championship Contender |
| 86-89 | Elite Regional Contender |
| 82-85 | Competitive Conference Team / Regional Qualifier |
| 78-81 | Mid-Pack Conference |
| Below 78 | Below Competitive Threshold |

**NCAA D3 Team KR:**

| Team KR | Tier Label |
|---------|-----------|
| 88+ | National Championship Contender |
| 84-87 | Elite Regional Program |
| 80-83 | Competitive Conference Team |
| 76-79 | Mid-Pack Conference |
| Below 76 | Below Competitive Threshold |

**NAIA Team KR:**

| Team KR | Tier Label |
|---------|-----------|
| 88+ | National Championship Contender |
| 84-87 | National Tournament Qualifier |
| 80-83 | Competitive Conference Team |
| 76-79 | Mid-Pack Conference |
| Below 76 | Below Competitive Threshold |

**NJCAA Team KR:**

| Team KR | Tier Label |
|---------|-----------|
| 86+ | National Championship Contender |
| 82-85 | National Tournament Qualifier |
| 78-81 | Competitive Conference/Region |
| 74-77 | Mid-Pack |
| Below 74 | Below Competitive Threshold |
