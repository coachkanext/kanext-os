# CHEER/STUNT SCOUTING & COMPETITION OPS
## v1.0

---

# 0. Purpose

This document governs how Nexus supports coaching staff before, during, and after competitions. It defines the scouting framework for opponents, the competition operations workflow, and the judge tendency analysis system.

All outputs consume upstream Team KR and Athlete KR. Nothing in this document modifies those values.

---

# 1. Scouting Confidence Gates

## Pre-Competition Scouting Confidence

### Gate 1: Opponent Data Availability
| Data Level | Confidence Ceiling | Description |
|-----------|-------------------|-------------|
| Full video + scores from 3+ competitions | 85% | Strong scouting basis. Can model opponent routine in detail. |
| Partial video or scores from 1-2 competitions | 65% | Moderate basis. Key skills identifiable but full routine model incomplete. |
| Roster + level/division only | 45% | Minimal basis. Can estimate general capability from program reputation and level. |
| Name only | 25% | Awareness only. No predictive value beyond level baseline. |

### Gate 2: Judge Panel Known
| Panel Knowledge | Confidence Modifier |
|----------------|-------------------|
| Named judges with scoring history available | +5% |
| Judge names known but no history | +0% |
| Panel unknown | -5% |

### Gate 3: Venue/Format Familiarity
| Familiarity | Confidence Modifier |
|------------|-------------------|
| Competed at this venue/event before | +3% |
| Same format, different venue | +0% |
| New format or venue | -3% |

Pre-Competition Confidence = min(Gate 1 ceiling + Gate 2 modifier + Gate 3 modifier, 90%)

## Post-Competition Scouting Confidence
After competing, confidence increases based on new data collected:
- Video of our own routine in competition: +10% for future simulation accuracy
- Scores with category breakdowns: +15% for score prediction calibration
- Opponent video/scores: +10% for opponent modeling

---

# 2. Competition Ops - 4-Phase Flow

## Phase 1: Pre-Competition Scout Packet

### Delivered: 3-7 days before competition
### Contents:

**A) Our Team Assessment**
- Current Team KR with component breakdown
- Routine composition summary (skills, assignments, difficulty values)
- Predicted score range (from Simulation Engine)
- Key risk areas (skills with highest deduction probability)
- Fitness/readiness check (any injuries, fatigue concerns, attendance issues)

**B) Opponent Scouting Report (per opponent, if data available)**
- Estimated opponent Team KR (if evaluatable)
- Routine style classification (Difficulty-First, Execution-First, Balanced, Showmanship-First)
- Key opponent strengths (e.g., "elite tumbling line," "strongest pyramid in the conference")
- Key opponent weaknesses (e.g., "flyer instability in extension," "synchronization breaks in dance")
- Head-to-head prediction (for STUNT format: quarter-by-quarter analysis)
- Historical matchup record (if teams have competed before)

**C) Strategic Recommendations**
- Difficulty adjustment recommendations (based on opponent analysis and predicted judging)
- Skill substitution suggestions (if any skill's expected score is negative)
- Warm-up priority list (skills that need the most warm-up reps based on deduction probability)
- Formation adjustments (if opponent scouting reveals specific visual advantages to exploit)
- STUNT-specific: quarter strategy (which quarters to maximize difficulty, which to play conservative)

**D) Competition Day Logistics**
- Schedule (warm-up time, performance time, award ceremony)
- Mat rotation/warm-up mat availability
- Travel and arrival plan

### Format
Clean, printable one-page summary per section. Coaches don't have time to read essays.

---

## Phase 2: Warm-Up Operations

### Delivered: During warm-up session (typically 5-15 minutes before competition)
### Purpose: Maximize hit probability by focusing limited warm-up time on highest-risk skills.

**Warm-Up Priority Model:**
Rank all skills in the routine by "warm-up value":
Warm_Up_Value = Deduction_Probability x Deduction_Severity x (1 / Athlete_Consistency)

Skills with highest Warm_Up_Value get warm-up reps first.

**Standard Warm-Up Sequence:**
1. Full team stretch and activation (non-negotiable, not Nexus-governed)
2. Highest-risk stunt (group with lowest chemistry or newest partner)
3. Highest-risk tumbling pass (athlete with lowest TKR or highest difficulty attempt)
4. Pyramid sequence (if pyramid is in the routine)
5. Full-routine walk-through (if time permits)
6. Quick jump rep and formation mark

**Warm-Up Flags:**
- **RED:** If a key skill fails 2+ times in warm-up, recommend downgrade to safer skill
- **YELLOW:** If a key skill fails once, recommend extra rep. If time is limited, flag for coach decision.
- **GREEN:** All skills hitting clean. Proceed as planned.

**Warm-Up Time Optimization:**
Given X minutes of warm-up time and Y skills to warm up:
- If time is sufficient (all skills can get 2+ reps): standard sequence
- If time is limited (not all skills can be warmed up): prioritize by Warm_Up_Value
- If time is critical (fewer than 5 minutes): warm up only RED-flagged skills

---

## Phase 3: In-Competition Live Ops

### Delivered: Real-time during competition (STUNT format primarily)
### Purpose: Support in-game decision-making during STUNT matches.

**STUNT Quarter-by-Quarter Decision Support:**

Between quarters (typically 1-2 minute break):
1. Report: Which skills hit and which didn't in the just-completed quarter
2. Scoreboard update: Current quarter score differential
3. Quarter analysis: Did our prediction hold? If not, what changed?
4. Next quarter preview: Opponent's expected approach in next quarter
5. Strategic adjustment: Should we change any skill assignments for the next quarter?

**Adjustment Decision Framework:**
- If we WON the quarter and are ahead in the match: maintain plan. No changes unless a safety concern arose.
- If we LOST the quarter but are ahead in the match: analyze why. If execution was the issue (athletes capable of the skill but made errors), maintain plan. If difficulty was the issue (opponent simply has harder skills), consider upgrading in remaining quarters.
- If we are BEHIND in the match: identify the most winnable remaining quarter and concentrate difficulty upgrades there. Accept higher risk.
- If a SAFETY concern arose (near-fall, injury scare): downgrade the relevant skill immediately regardless of score implications.

**Traditional Competition In-Performance Notes:**
- Track deductions as they happen (if visible from sideline)
- Note energy levels and execution quality for post-competition analysis
- Flag any mid-routine adjustments athletes made (recovering from bobbles, skipped skills)

---

## Phase 4: Post-Competition Staff Packet

### Delivered: Within 24 hours of competition
### Contents:

**A) Score Analysis**
- Actual score vs predicted score (with explanation of variance)
- Category-by-category breakdown (if available from scoring system)
- Deductions identified (from video review)
- Which predictions were accurate and which were off

**B) Performance Assessment**
- Skill-by-skill hit/miss record
- Individual athlete performance notes (who hit everything, who had issues)
- Stunt group performance by group
- Synchronization assessment
- Energy/showmanship assessment

**C) Opponent Analysis Update**
- Update opponent Team KR estimates based on observed performance
- Note any opponent skills or strategies not captured in pre-competition scouting
- Update head-to-head models for future matchups

**D) Actionable Recommendations**
- Skills to focus on in next practice cycle (highest-deduction skills)
- Partner group adjustments (if chemistry issues were observed)
- Difficulty recommendations for next competition (upgrade/downgrade based on hit rate)
- Individual development priorities (athletes whose performance was notably above or below KR)

**E) KR Calibration Notes**
- Flag any athlete whose competition performance suggests their KR needs review
- Note: This does NOT change KR in this document. It flags for re-evaluation in the Player Eval Pipeline (File 01).

---

# 3. Judge Tendency Analysis

## Purpose
Judges have tendencies. Some prioritize difficulty, others prioritize execution. Some are generous with performance scores, others are strict. Understanding these tendencies improves prediction accuracy.

## Data Collection
For each judge (when panel is known):
- Historical competition scores they have given
- Average score relative to other judges on the same panel (higher or lower scorer?)
- Category emphasis (do they score stunts higher than tumbling? Vice versa?)
- Deduction tenderness (do they deduct harshly for small errors or let minor bobbles slide?)

## Judge Profile Model
Each judge receives a profile with the following attributes:

| Attribute | Range | Description |
|-----------|-------|-------------|
| Overall Generosity | 0.90 - 1.10 | Multiplier on predicted score. 1.0 = average. Above 1.0 = generous. Below 1.0 = strict. |
| Difficulty Bias | -0.05 to +0.05 | Adjustment to difficulty category. Positive = rewards difficulty more. Negative = doesn't credit difficulty as much. |
| Execution Bias | -0.05 to +0.05 | Adjustment to execution scoring. Positive = rewards clean routines more. Negative = more forgiving of errors. |
| Performance Bias | -0.05 to +0.05 | Adjustment to performance/showmanship scoring. |
| Deduction Severity | 0.8 to 1.2 | Multiplier on expected deductions. Above 1.0 = calls more deductions. Below 1.0 = lets things go. |

## Panel Composite
When the full panel is known (e.g., 3-5 judges), compute the panel composite:
- Average each attribute across the panel
- Drop highest and lowest scores (if the format does this)
- Apply the composite profile to the predicted score

## Strategic Implications
Based on judge panel analysis, recommend routine adjustments:
- **Difficulty-biased panel:** Push difficulty upgrades where completion probability is above 80%
- **Execution-biased panel:** Prioritize clean execution. Downgrade any skill below 90% completion probability.
- **Performance-biased panel:** Invest extra rehearsal time in dance, energy, and showmanship sections
- **Strict deduction panel:** Ultra-conservative approach. Every deduction hurts more.
- **Generous panel:** Opportunity to take risks. Higher difficulty is rewarded and small errors are forgiven.

## Confidence
Judge tendency analysis confidence depends entirely on data availability:
- 5+ competitions scored by this judge with category breakdowns: 70% confidence
- 2-4 competitions: 50% confidence
- 1 competition: 30% confidence
- No data: N/A (use neutral assumptions)

---

# 4. Opponent Video Scouting Framework

## Purpose
Structured approach to scouting opponent routines from video.

## Video Scouting Checklist (per opponent)

### Stunts
- How many stunt groups?
- What is the highest stunt difficulty performed?
- Are all groups at the same level or is there a weak group?
- Transition difficulty and speed?
- Dismount difficulty?
- Any visible instability or bobbles?

### Tumbling
- How many tumbling performers?
- What is the highest tumbling pass?
- Connected tumbling? Jump-to-tumbling?
- Execution quality? Landing consistency?
- Are all tumblers at the same level or is there a weak tumbler?

### Pyramids
- Pyramid configuration?
- Highest pyramid difficulty?
- Transition quality within pyramid?
- Braced flips? Release moves?
- Stability assessment?

### Tosses
- Toss height?
- Toss difficulty (toe touch, kick full, kick double)?
- Catch reliability?

### Dance/Performance
- Dance precision and sharpness?
- Energy level?
- Performance quality and crowd engagement?
- Synchronization quality?

### Overall
- Routine style classification?
- Estimated team difficulty value?
- Estimated execution quality?
- Key strengths (what will be hard to beat)?
- Key weaknesses (where they might deduct)?
- Estimated Team KR range?

## Scouting Output
Deliver as a single-page opponent card per team:
- Team name, level, competition format
- Routine style: [classification]
- Estimated Team KR: [range]
- Strengths: [2-3 points]
- Weaknesses: [2-3 points]
- Strategic note: [1-2 sentences on how to approach this matchup]
