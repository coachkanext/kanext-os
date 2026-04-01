# CHEER/STUNT TEAM INTELLIGENCE
## v1.0

---

# TEAM KR - MATH, PIPELINE & DIAGNOSTICS

## 0. Scope
This is the single authoritative document for Team KR computation in cheer/STUNT. Team KR is the role-weighted aggregation of athletes' Final KRs under the selected Coach Context, with routine composition optimization, partner/group chemistry adjustment, and competition-format-specific scoring.

Team KR does not evaluate athletes. It consumes finalized athlete outputs from upstream.

## 1. Inputs (Non-Negotiable)
Team KR consumes only:

Per athlete in roster:
- Final KR (from Athlete Evaluation Pipeline)
- Component KRs (SKR, TKR, JKR, AKR, IQKR)
- Primary role (Flyer, Base, Back Spot, Tumbler, All-Around)
- Secondary role(s) (if applicable)
- Archetype assignment
- Skills inventory (documented skill levels)
- Competition participation (which competitions, which role)
- Routine assignment (which stunt group, which tumbling pass, which pyramid position)

Per program (from Coach Context Setup):
- Competition Format (STUNT, Traditional, All-Star, etc.)
- Routine Style
- Division/Level
- Primary Competition target

Explicit exclusions (locked):
- No archetype recomputation
- No badge/label recomputation
- No trait recomputation
- No system-fit inference (already baked into Final KR upstream)
- No injury/fatigue modeling (that lives in File 04 Simulation and File 06 Development)

## 2. Roster Participation Model
Unlike basketball (rotation-based), cheer uses a ROLE-ASSIGNMENT model:
- Every athlete on the competition roster has a specific assignment in the routine
- There is no "bench" in the traditional sense during competition - all performing athletes are on the mat
- Alternates/backups exist but do not perform unless substituting for an injury or absence
- Team KR reflects the COMPETING roster, not the full practice roster

### Competition Roster Size (by format)
- STUNT: 36 athletes (4 groups of 4 per quarter, with rotation)
- Traditional Competition: 20-24 athletes typically on mat
- All-Star: Varies by division (5-member small teams to 24-member large teams)
- Game Day: 15-20 athletes typically

## 3. Team KR Computation

### Step 1: Role Group Identification
Identify all role groups within the competition roster:
- Stunt Group 1: [Flyer, Base, Base, Back Spot]
- Stunt Group 2: [Flyer, Base, Base, Back Spot]
- Stunt Group 3: [Flyer, Base, Base, Back Spot]
- Stunt Group 4: [Flyer, Base, Base, Back Spot] (if applicable)
- Tumbling performers: [list]
- Jump performers: [list] (often overlaps with other roles)
- Pyramid roles: [list] (overlaps with stunt groups typically)

### Step 2: Stunt Group KR
For each stunt group, compute a Group KR:

Group_KR = (Flyer_KR x 0.30) + (Base1_KR x 0.25) + (Base2_KR x 0.25) + (BackSpot_KR x 0.20)

Then apply the Chemistry Modifier (see Section 5):
Adjusted_Group_KR = Group_KR x Chemistry_Modifier

### Step 3: Category KRs
Compute category-level KRs that correspond to competition scoring categories:

**Stunt Category KR:**
Average of all Adjusted_Group_KRs, weighted by the difficulty of each group's assigned skills.

**Tumbling Category KR:**
Average of all tumbling performers' TKR, weighted by the difficulty value of their assigned passes.

**Jump Category KR:**
Average of all jump performers' JKR.

**Pyramid Category KR:**
Specialized computation - average of all pyramid participants' SKR, modified by the complexity of the pyramid structure and the synchronization score across all participants.

**Dance/Performance Category KR:**
Average of all performing athletes' JKR(dance+performance) and IQKR(showmanship+sync).

### Step 4: Team Offensive KR / Team Defensive KR
In cheer, the traditional offensive/defensive split does not apply. Instead, compute:

**Team Difficulty KR (analogous to Offensive KR):**
Weighted average of all category KRs where the weight is the difficulty value of the routine's assigned skills.

Team_Difficulty_KR = Sum(Category_KR_i x Difficulty_Weight_i) / Sum(Difficulty_Weight_i)

**Team Execution KR (analogous to Defensive KR):**
Weighted average that emphasizes execution quality, synchronization, and deduction avoidance.

Team_Execution_KR = Sum(Category_KR_i x Execution_Weight_i) / Sum(Execution_Weight_i)

Where Execution_Weight emphasizes IQKR, sync traits, and execution-specific trait scores.

### Step 5: Team KR
Team_KR = (Team_Difficulty_KR x Format_Diff_Weight) + (Team_Execution_KR x Format_Exec_Weight)

Format weights:
| Format | Difficulty Weight | Execution Weight |
|--------|------------------|-----------------|
| STUNT | 0.50 | 0.50 |
| Traditional Competition | 0.40 | 0.60 |
| All-Star | 0.45 | 0.55 |
| Game Day | 0.30 | 0.70 |
| Showmanship-First | 0.25 | 0.75 |

### Step 6: Confidence
Team KR confidence is the minimum of:
- Average athlete confidence across competition roster
- Routine composition confidence (has the team practiced this routine at competition speed?)
- Chemistry data confidence (have these specific partner groups been together long enough?)

---

## 4. STUNT-Specific Team KR

STUNT has a quarter-by-quarter format. Each quarter tests different skill categories:
- Q1: Partner Stunts
- Q2: Jumps and Tumbling
- Q3: Pyramids and Tosses
- Q4: Team Performance (full routine section)

### Quarter KRs
Compute a KR for each quarter based on the athletes and skills assigned to that quarter:

Q1_KR = Average(Stunt_Group_KRs for Q1 partner stunt assignments)
Q2_KR = Weighted average of Jump and Tumbling performer KRs for Q2
Q3_KR = Pyramid Category KR + Toss execution KR for Q3 assignments
Q4_KR = Full Team Performance KR (uses the full computation from Steps 1-5 above)

### STUNT Match KR
STUNT_Team_KR = (Q1_KR x 0.25) + (Q2_KR x 0.25) + (Q3_KR x 0.25) + (Q4_KR x 0.25)

Equal quarter weighting by default. Can be adjusted based on team strengths for strategic modeling (see Simulation Engine, File 04).

### STUNT Win Probability
Based on Team KR differential between opponents:
- 10+ KR advantage: 85-95% win probability
- 5-9 KR advantage: 65-80% win probability
- 1-4 KR advantage: 52-64% win probability
- Even (within 1): 50/50 (execution day determines outcome)
- Judging variance adds +/- 5% to all probabilities

---

## 5. Partner/Group Chemistry Index

### Purpose
In cheer, partner chemistry is not a metaphor - it's a measurable factor. A flyer who has worked with the same bases for two years will perform better than one paired with new partners, even if the new partners have higher individual KRs.

### Chemistry Score Computation
Chemistry_Score ranges from 0.90 to 1.10 (a multiplier on Group KR).

Factors:
- **Time together:** Months practicing as a group
  - 0-3 months: 0.92
  - 3-6 months: 0.96
  - 6-12 months: 1.00 (baseline)
  - 12-24 months: 1.04
  - 24+ months: 1.07
- **Competition reps together:** Number of competitions performed as a unit
  - 0 competitions: -0.02
  - 1-3 competitions: 0.00
  - 4-8 competitions: +0.02
  - 9+ competitions: +0.03
- **Success rate together:** Hit rate of skills performed together in competition
  - Below 80%: -0.03
  - 80-90%: 0.00
  - 90-95%: +0.02
  - 95%+: +0.03
- **Size compatibility:** Mechanical advantage of the flyer/base pairing
  - Ideal ratio (bases can comfortably handle flyer weight at all skill levels): +0.02
  - Workable ratio: 0.00
  - Challenging ratio (bases near capacity): -0.03
  - SAFETY FLAG: If size compatibility creates safety concern, flag RED regardless of other scores

Chemistry_Modifier = base(1.00) + time_adj + comp_adj + success_adj + size_adj

Capped at [0.90, 1.10].

### New Partner Penalty
When a stunt group has a new member (mid-season replacement, new recruit, etc.):
- First 4 weeks: Chemistry floor is 0.92
- Weeks 4-8: Chemistry floor rises to 0.95
- After 8 weeks: Chemistry is computed normally

---

## 6. Routine Composition Optimization

### Purpose
Given a roster of evaluated athletes, determine the optimal routine composition - who does what, in which stunt group, performing which skills, in which formation positions.

### Optimization Objectives
1. **Maximize total routine difficulty value** (sum of all skill difficulty values in the routine)
2. **Minimize expected deductions** (assign skills only where completion probability exceeds threshold)
3. **Maximize synchronization score** (group athletes with similar timing profiles)
4. **Satisfy safety constraints** (no skill assignments beyond demonstrated ability)

### Optimization Constraints (Hard - Cannot Violate)
- No athlete assigned a skill they have not demonstrated at the difficulty level or one level below
- No stunt group where base capability is below flyer weight at extension
- No pyramid position where the athlete has not trained that specific position
- Total routine time within competition limit (typically 2:30)
- Formation transitions must be physically possible within music timing
- Minimum rest between back-to-back high-intensity skills (typically 16 counts)

### Optimization Constraints (Soft - Can Violate with Penalty)
- Prefer stunt groups with established chemistry (penalty for new pairings: -2 to expected score)
- Prefer tumbling passes that match the athlete's strongest skill (penalty for second-best: -0.5)
- Prefer formations that showcase strongest performers center-front
- Prefer transitions that are familiar (practiced 50+ times)

### Difficulty vs Execution Trade-off Model

This is the FUNDAMENTAL strategic decision in cheer. The system must model the expected score for different difficulty choices.

**Expected Score Formula:**
Expected_Score = Difficulty_Value x Completion_Probability - Expected_Deduction_Value

Where:
- Difficulty_Value = sum of all difficulty values for the skill
- Completion_Probability = historical hit rate for this athlete/group on this skill (from practice and competition data)
- Expected_Deduction_Value = (1 - Completion_Probability) x Average_Deduction_For_Error

**Decision Rule:**
If upgrading a skill from Difficulty_A to Difficulty_B:
- Compute Expected_Score_A and Expected_Score_B
- If Expected_Score_B > Expected_Score_A: upgrade is justified
- If Expected_Score_B <= Expected_Score_A: keep current difficulty
- If the difference is within 0.5: coach discretion (flag as strategic choice, not clear mathematical winner)

**Example:**
Current skill: Extension liberty (DV 3.0, completion rate 95%)
Expected_Score_A = 3.0 x 0.95 - (0.05 x 1.0) = 2.85 - 0.05 = 2.80

Upgrade option: Full-up to liberty (DV 4.5, completion rate 80%)
Expected_Score_B = 4.5 x 0.80 - (0.20 x 1.5) = 3.60 - 0.30 = 3.30

Upgrade is justified (3.30 > 2.80). But the 20% failure rate means 1 in 5 attempts will produce a deduction.

**Risk Tolerance by Context:**
| Situation | Recommended Threshold |
|-----------|----------------------|
| Regular season competition | Upgrade if Expected_Score difference > 0.5 |
| Conference championship | Upgrade if Expected_Score difference > 0.75 |
| National championship | Upgrade only if Completion_Probability > 85% |
| Must-win situation (behind in STUNT match) | Lower threshold to > 0.25 |

---

## 7. Role Assignment Engine

### Purpose
Determine the optimal role for each athlete, and the optimal grouping of athletes into stunt groups, tumbling lines, and formation positions.

### Role Assignment Algorithm

**Step 1: Primary Role Identification**
For each athlete, their primary role is determined by their highest-weighted component KR:
- Highest SKR with flyer traits dominant: Flyer
- Highest SKR with base traits dominant: Base
- Highest SKR with catch/leadership dominant: Back Spot
- Highest TKR: Tumbler
- No single dominant component (all within 5 points): All-Around

**Step 2: Role Demand Calculation**
Based on competition format, calculate how many of each role the team needs:
- STUNT: 4 flyers, 8 bases, 4 back spots, 4+ tumblers (with overlap)
- Traditional (20-person): 4-5 flyers, 8-10 bases, 4-5 back spots, 6-8 tumblers (heavy overlap)
- All-Star varies by division size

**Step 3: Optimal Assignment**
Match athletes to roles to maximize total Team KR:
- Assign roles where each athlete's KR contribution is highest
- Respect safety constraints (e.g., don't assign a 160 lb athlete as flyer with 130 lb bases)
- Preserve established chemistry where possible (if existing groups have Chemistry_Modifier > 1.02, keep them together unless a reassignment produces 3+ KR improvement)

**Step 4: Stunt Group Assembly**
Assemble stunt groups by pairing:
1. Best flyer with best base pair and best back spot (Group 1 - will perform highest difficulty)
2. Second-best flyer with second-best base pair and back spot (Group 2)
3. Continue until all groups are filled
4. Apply Chemistry_Modifier to each group
5. Re-optimize if chemistry adjustments change the optimal grouping

---

## 8. Team KR Legends

### Purpose
Interpret Team KR at each competitive level. Same structure as Player KR legends but for team-level performance.

### NCAA STUNT Team KR Legend (v0)

**90-100: National Championship Contender.**
Elite team. Deepest roster, highest difficulty, cleanest execution. Competes for STUNT national championship. Multiple All-Americans on roster.

**85-89: National Tournament Elite.**
Top-15 national program. Consistently advances in the national tournament. Strong across all four quarters. Conference champion caliber.

**80-84: Regional Power / National Tournament Team.**
Makes the national tournament consistently. Competitive in all quarters. May have a weakness in one area that limits championship contention.

**75-79: Conference Contender.**
Strong conference team. Competes for conference title. May qualify for national tournament. Solid roster depth.

**70-74: Conference Competitive.**
Middle-of-conference team. Wins more than loses. Competitive in most matches. Depth may be thin.

**65-69: Conference Rotation.**
Below-average conference team. Competitive in some matches. Clear gaps in one or more quarters.

**60-64: Building Program.**
Developing program. Limited roster depth. Focused on athlete development and competitive experience.

**Below 60: Start-Up / Emerging.**
New or rebuilding program. Below competitive threshold at this level.

---

## 9. Roster Decision Intelligence

### Purpose
Help coaches make roster decisions: who to recruit, who to develop, who to cut, and how to allocate limited resources.

### Gap Analysis
Given the current Team KR and the team's competition goals:
1. Identify which category KR is the weakest (stunts, tumbling, jumps, pyramid, performance)
2. Identify which role is the thinnest (fewest capable athletes)
3. Compute the KR improvement needed to reach the goal
4. Identify whether the improvement is achievable through development (existing athletes improving) or requires recruiting

### Recruiting Priority Model
Rank recruiting priorities by Expected Team KR Impact:

Expected_Impact = (Replacement_KR - Current_Weakest_KR) x Position_Weight_in_Team_KR

If an incoming flyer with KR 85 replaces a current flyer with KR 72, and flyer weight in Team KR is approximately 0.30:
Expected_Impact = (85 - 72) x 0.30 = 3.9 Team KR points

Prioritize recruits who produce the largest Expected_Impact.

### Scholarship/Aid Allocation
For programs with scholarship budgets:
- Rank athletes by their contribution to Team KR (Player Team Value, or PTV)
- PTV = (Athlete's KR contribution to Team KR) / (Total Team KR budget)
- Allocate scholarship proportional to PTV
- Flag athletes whose PTV does not justify their scholarship level
- Flag recruits whose projected PTV exceeds available scholarship value (high-value target)

---

## 10. Formation Intelligence

### Purpose
Optimize athlete placement within formations for visual impact and scoring.

### Principles
1. **Center-front placement:** Athletes with highest JKR(performance quality) and IQKR(showmanship) should be center-front in formations
2. **Height lines:** Formation rows should have consistent height for visual cleanliness
3. **Tumbling lanes:** Tumbling performers need clear lanes that don't create collision risk
4. **Transition efficiency:** Formation changes should minimize travel distance to reduce transition time
5. **Stunt group spacing:** Stunt groups need adequate lateral spacing for safety

### Synchronization Grouping
When multiple athletes perform the same skill simultaneously (e.g., 4 stunt groups lifting at the same time):
- Group athletes with similar timing profiles (from IQKR sync assessment)
- Place the most synchronized athletes in the most visible positions (front/center)
- Use a "metronome" athlete (highest sync score) as the visual reference point for the group
