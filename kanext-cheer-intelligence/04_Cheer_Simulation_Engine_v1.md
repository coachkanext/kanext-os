# CHEER/STUNT SIMULATION ENGINE
## v1.0

---

# 0. Purpose

The Simulation Engine predicts competition outcomes by modeling routine scoring, deduction probability, and head-to-head STUNT match results. It consumes finalized Team KR and athlete KR outputs. It does NOT modify any upstream evaluation.

All simulations include a range reflecting judging subjectivity. Single-point predictions are never given without an accompanying range.

---

# 1. Inputs

## Required
- Team KR (from File 03)
- Category KRs (Stunt, Tumbling, Jump, Pyramid, Performance)
- STUNT Quarter KRs (if STUNT format)
- Routine composition (which skills are assigned to which athletes/groups)
- Skills inventory for all competing athletes
- Competition format and rules
- Opponent Team KR (for head-to-head predictions)

## Optional (improves accuracy)
- Historical competition scores for both teams
- Judge panel identity (for Judge Tendency Analysis)
- Venue/environment factors (home/away, altitude, mat surface)
- Practice hit rates for specific skills

---

# 2. Routine Scoring Simulation

## 2.1 Score Components
Most competition scoring rubrics break down into weighted categories. The simulation models each category independently.

### Standard Category Breakdown (Traditional Competition)
| Category | Typical Weight | KR Source |
|----------|---------------|-----------|
| Stunts | 20-25% | Stunt Category KR |
| Tumbling | 15-20% | Tumbling Category KR |
| Jumps | 10-15% | Jump Category KR |
| Pyramids | 15-20% | Pyramid Category KR |
| Dance/Performance | 10-15% | Performance Category KR |
| Overall Impression | 10-15% | Team KR composite |

### STUNT Category Breakdown
| Quarter | Weight | KR Source |
|---------|--------|-----------|
| Q1: Partner Stunts | 25% | Q1_KR |
| Q2: Jumps/Tumbling | 25% | Q2_KR |
| Q3: Pyramids/Tosses | 25% | Q3_KR |
| Q4: Team Performance | 25% | Q4_KR |

## 2.2 Difficulty Value (DV) Calculation
Sum all difficulty values from the routine composition:

Total_DV = Sum(skill_DV for each skill in the routine) + Sum(bonus_DV for connections and transitions)

Reference the Difficulty Scoring Tables in File 02 for individual skill values.

## 2.3 Execution Score Prediction
The Execution Score reflects how cleanly the routine is performed. It starts at a maximum and is reduced by predicted deductions.

### Base Execution Score
Start at the maximum execution score for the format (typically 10.0 or 100 depending on rubric).

### Deduction Prediction
For each skill in the routine, compute the expected deduction:

Expected_Deduction_i = (1 - Completion_Probability_i) x Deduction_Value_i

Where:
- Completion_Probability_i is derived from the performing athlete's component KR for that skill type, mapped to a probability curve:
  - KR 90+: 97% completion probability
  - KR 85-89: 93% completion probability
  - KR 80-84: 88% completion probability
  - KR 75-79: 82% completion probability
  - KR 70-74: 75% completion probability
  - KR 65-69: 65% completion probability
  - KR below 65: 55% completion probability (high deduction risk)
- Deduction_Value_i is the typical deduction for an error on that skill (from Deduction Values table in File 02)

### Total Expected Deductions
Total_Expected_Deductions = Sum(Expected_Deduction_i for all skills in routine)

### Predicted Execution Score
Predicted_Execution = Max_Execution - Total_Expected_Deductions

## 2.4 Predicted Total Score
Predicted_Score = Difficulty_Value_Component + Execution_Score_Component

The exact formula depends on the competition rubric. In general:

For rubrics where DV and Execution are separate:
Predicted_Score = (DV_Score x DV_Weight) + (Execution_Score x Execution_Weight)

For rubrics where DV is embedded in category scoring:
Predicted_Score = Sum(Category_Score_i x Category_Weight_i)

Where Category_Score_i = (Category_DV_i x Completion_Probability_i) - Expected_Deductions_i

## 2.5 Score Range
Every predicted score includes a range:

Score_Range = Predicted_Score +/- Variance

Variance components:
- **Judging Variance:** +/- 1.5% to 3.0% of max score (depending on rubric clarity and panel size)
- **Execution Variance:** +/- 0.5 x Total_Expected_Deductions (deductions are probabilistic, not certain)
- **Competition Day Factor:** +/- 1.0% (athletes perform differently on competition day)

Total_Variance = sqrt(Judging_Variance^2 + Execution_Variance^2 + CompDay_Variance^2)

---

# 3. Head-to-Head STUNT Simulation

## 3.1 Quarter-by-Quarter Resolution
Each STUNT quarter is resolved independently:

### Quarter Win Probability
Quarter_Win_Prob = f(Our_Quarter_KR - Their_Quarter_KR)

Where f is a logistic function:
- 10+ advantage: 90% win
- 7-9 advantage: 80% win
- 4-6 advantage: 68% win
- 1-3 advantage: 55% win
- Even (within 1): 50%
- Disadvantage: mirror the above

### Quarter Score Prediction
Each quarter produces a score for each team. The higher score wins the quarter.

Quarter_Score = Difficulty_Points_Earned - Deductions

Where:
- Difficulty_Points_Earned = Sum(skill_DV x completion for each skill attempted)
- Deductions = Sum(deduction per error)

### STUNT Match Result
The team that wins 3 or more quarters wins the match.

Match_Win_Probability = P(winning 3+ quarters out of 4)

Computed using the individual quarter win probabilities:
- P(4-0) = P(Q1) x P(Q2) x P(Q3) x P(Q4)
- P(3-1) = Sum of all 4 combinations of winning exactly 3 quarters
- P(win) = P(4-0) + P(3-1)

## 3.2 Strategic Quarter Analysis
For each quarter, identify:
- **Advantage quarters:** Where our KR exceeds opponent by 5+
- **Competitive quarters:** KR differential within 5
- **Disadvantage quarters:** Opponent KR exceeds ours by 5+

### Strategic Recommendations
- In advantage quarters: maintain current difficulty, prioritize clean execution
- In competitive quarters: optimize difficulty vs execution trade-off (use model from File 03)
- In disadvantage quarters: maximize difficulty (higher risk is justified when you're expected to lose the quarter anyway)
- Identify the "swing quarter" - the competitive quarter most likely to determine the match outcome - and allocate best athletes accordingly

---

# 4. Deduction Probability Modeling

## 4.1 Individual Skill Deduction Model
For each skill in the routine, model the probability of each deduction type:

### Stunt Deductions
| Deduction Type | Base Probability | KR Modifier |
|---------------|-----------------|-------------|
| Bobble (caught instability) | 15% | -2% per SKR point above 75 |
| Significant technique break | 8% | -1.5% per SKR point above 75 |
| Stunt falls (caught, no ground) | 5% | -1% per SKR point above 75 |
| Falls to ground | 2% | -0.5% per SKR point above 75 |

### Tumbling Deductions
| Deduction Type | Base Probability | KR Modifier |
|---------------|-----------------|-------------|
| Landing hop/step | 25% | -3% per TKR point above 70 |
| Bent legs/form break | 20% | -2.5% per TKR(execution) point above 70 |
| Under-rotation | 8% | -1.5% per TKR(power) point above 70 |
| Fall | 3% | -0.5% per TKR point above 70 |

### Jump Deductions
| Deduction Type | Base Probability | KR Modifier |
|---------------|-----------------|-------------|
| Low height | 20% | -3% per JKR(height) point above 70 |
| Technique break | 15% | -2% per JKR(technique) point above 70 |
| Poor landing | 10% | -1.5% per AKR(body control) point above 70 |

### Synchronization Deductions
| Deduction Type | Base Probability | KR Modifier |
|---------------|-----------------|-------------|
| Visible timing difference | 20% | -3% per Group avg IQKR(sync) above 75 |
| Major desynchronization | 5% | -1% per Group avg IQKR(sync) above 75 |

## 4.2 Fatigue-Adjusted Deduction Probability
Skills performed later in the routine have higher deduction probability due to fatigue.

Fatigue_Multiplier = 1.0 + (0.02 x section_number)

Where section_number is the chronological position in the routine (1 = first section, 8 = last section of a typical 2:30 routine).

Adjusted_Deduction_Prob = Base_Deduction_Prob x Fatigue_Multiplier

Modified by athlete's AKR(endurance):
- Endurance 90+: Fatigue_Multiplier reduced by 50%
- Endurance 80-89: Fatigue_Multiplier reduced by 25%
- Endurance 70-79: No modification
- Endurance below 70: Fatigue_Multiplier increased by 25%

## 4.3 Pressure-Adjusted Deduction Probability
Competition setting increases deduction probability for athletes with low IQKR(pressure).

Pressure_Multiplier depends on competition stakes:
- Practice: 1.0 (baseline)
- Regular season competition: 1.05
- Conference championship: 1.10
- Regional/qualifier: 1.15
- National championship: 1.20

Modified by athlete's IQKR(routine execution under pressure):
- IQKR(pressure) 90+: Pressure_Multiplier negated (stays at 1.0)
- IQKR(pressure) 80-89: Pressure_Multiplier reduced by 50%
- IQKR(pressure) 70-79: No modification
- IQKR(pressure) below 70: Pressure_Multiplier increased by 25%

---

# 5. Competition Placement Prediction

## 5.1 Multi-Team Competition
When multiple teams compete at the same event (traditional format):

1. Compute Predicted_Score for each team
2. Rank teams by Predicted_Score
3. Apply Score_Range to each team
4. Identify clusters where team score ranges overlap (predicted placement is uncertain between these teams)
5. Report placement as a range: "Predicted: 3rd-5th" (if score range overlaps with teams predicted 3rd, 4th, and 5th)

## 5.2 Season Record Prediction (STUNT)
For a full STUNT season:
1. Compute Match_Win_Probability for each scheduled match
2. Sum expected wins: Expected_Wins = Sum(Match_Win_Prob_i)
3. Report as range: "Predicted record: 8-2 to 10-0, most likely 9-1"
4. Identify key matches (win probability between 40-60%) that will determine the season

---

# 6. Scenario Modeling

## Purpose
Allow coaches to model "what-if" scenarios for routine and strategic decisions.

### Scenario Types

**Skill Upgrade Scenario:**
"What happens to our score if Stunt Group 1 upgrades from liberty to full-up liberty?"
- Recompute DV for the upgraded skill
- Adjust completion probability based on the group's current capability with the new skill
- Compare Expected_Score before and after
- Report: score change, risk change, recommendation

**Lineup Change Scenario:**
"What happens if Athlete X replaces Athlete Y as the flyer in Group 2?"
- Recompute Group KR with the substitution
- Apply new Chemistry_Modifier (new partner = chemistry reset)
- Recompute all downstream: Category KRs, Team KR, Predicted Score
- Report: score change, chemistry impact, recommendation

**Strategy Shift Scenario:**
"What happens if we shift from Balanced to Difficulty-First for nationals?"
- Reassign skills to maximize difficulty across all categories
- Recompute completion probabilities (harder skills = lower probability)
- Model the full score impact
- Report: score ceiling change, score floor change, risk profile change

**Injury Scenario:**
"What happens if our primary flyer is injured before nationals?"
- Identify the replacement (next-best flyer on roster)
- Compute KR and Chemistry impact of the substitution
- Assess which skills must be downgraded based on replacement's inventory
- Report: score impact, skills that must change, practice time needed for chemistry

---

# 7. Monte Carlo Simulation (Advanced)

For high-stakes predictions (nationals, STUNT playoffs), run a Monte Carlo simulation:

1. For each skill in the routine, generate a random outcome based on completion probability
2. Sum difficulty earned and deductions
3. Apply judging variance (random within judging range)
4. Record the score
5. Repeat 10,000 times
6. Report:
   - Median predicted score
   - 25th percentile score (conservative estimate)
   - 75th percentile score (optimistic estimate)
   - Probability of scoring above X (where X is the target score to win/place)
   - Most impactful skills (skills that create the most variance in outcomes)

### Value of Monte Carlo
The Monte Carlo approach captures the compound effect of multiple probabilistic events. A routine with 15 skills at 90% completion each has a (0.90^15 = 21%) chance of being completely clean. This is counterintuitive but critical for realistic competition prediction.

---

# 8. Simulation Confidence

All simulation outputs include confidence:

| Data Available | Confidence Ceiling |
|---------------|-------------------|
| Full competition history + practice data + known judge panel | 80% |
| Competition history + practice data | 70% |
| Competition history only | 60% |
| Team KR only (no detailed routine composition) | 45% |
| Estimated Team KR (limited athlete data) | 30% |

Judging variance reduces all confidence by an additional 5-10% depending on format:
- STUNT (most standardized rubric): -5%
- NCA/UCA (established rubric): -7%
- Regional/local competitions (variable rubrics): -10%
