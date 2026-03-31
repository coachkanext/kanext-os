# WBB TEAM INTELLIGENCE
## v1.0 - Women's Basketball Intelligence

---

# TEAM KR - MATH, PIPELINE & DIAGNOSTICS

## 0. Scope
This is the single authoritative document for Women's Basketball Team KR computation. Team KR is the rotation-weighted aggregation of players' Final System KRs under the selected Program Context, with system-role weighting, usage-informed offensive weights, physical environment adjustment, and level-contextual offense/defense splits.

Team KR does not evaluate players. It consumes finalized player outputs from upstream.

## 1. Inputs (Non-Negotiable)

Per player in rotation:
- Final_System_Offense_KR_i (from Player System Fit layer)
- Final_System_Def_KR_i (from Player System Fit layer)
- Minutes played (official game logs or coach-entered)
- Usage% (actual from Synergy/PlayVision, estimated from box score, or unavailable)
- Offensive archetype demand tier (A/B/C/No-match) for selected offensive system
- Defensive archetype demand tier (A/B/C/No-match) for selected defensive system
- Matchup assignment data (if available)
- Height (inches), Weight (lbs), Wingspan (inches, if available)
- Position group (PG, SG, SF, PF, C)

Per program (from Coach Context Setup):
- Governing Body / Division (and Major Class if NCAA D1)
- Offensive System + Defensive System
- Competitive level (from locked level list - 14 college levels)

Explicit exclusions:
- No archetype recomputation
- No badge/label recomputation
- No trait recomputation
- No system-fit inference
- No injury/fatigue/foul trouble modeling

## 2. Participation Threshold
Rotation-only model. No starter/bench labels.
- MIN_PARTICIPATION = 0.05 (5% of total minutes)
- Include player i in Team KR math iff minutes_share_i >= MIN_PARTICIPATION
- Exclude all players below threshold

## 3. Offensive Weight Per Player
Three inputs blended based on data availability:
- Usage% (50% of weight when available)
- Minutes% (25% of weight, or 75% when usage unavailable)
- System Role (25% of weight)

### Data Tier Formulas
**Tier 1 - Full data:**
Off_Weight_Raw_i = (Usage%_i x 0.50) + (Minutes%_i x 0.25) + (Off_Role_Score_i x 0.25)

**Tier 2 - Mid data (box score, no film):**
Off_Weight_Raw_i = (Est_Usage%_i x 0.50) + (Minutes%_i x 0.25) + (Off_Role_Score_i x 0.25)
Where Est_Usage = (FGA + 0.44 x FTA + TOV) / (Team_FGA + 0.44 x Team_FTA + Team_TOV)

**Tier 3 - Low data (minutes only):**
Off_Weight_Raw_i = (Minutes%_i x 0.75) + (Off_Role_Score_i x 0.25)

### System Role Multipliers (Locked, Flat)
| Demand Tier | Multiplier |
|------------|-----------|
| A (Critical) | 1.20 |
| B (High) | 1.00 |
| C (Optional) | 0.85 |
| No match | 0.70 |

### Normalization
Off_Weight_i = Off_Weight_Raw_i / Sum(Off_Weight_Raw)
All offensive weights sum to 1.0.

## 4. Defensive Weight Per Player
Two or three inputs blended:
- Minutes% (50% of weight) - defensive presence is about being on the court
- Defensive Role (25% of weight)
- Matchup Assignment (25% of weight when available, otherwise redistributed to Minutes%)

### Defensive Role Multipliers (same as offensive)
| Demand Tier | Multiplier |
|------------|-----------|
| A (Critical) | 1.20 |
| B (High) | 1.00 |
| C (Optional) | 0.85 |
| No match | 0.70 |

### Normalization
Def_Weight_i = Def_Weight_Raw_i / Sum(Def_Weight_Raw)
All defensive weights sum to 1.0.

## 5. Team Offensive KR
Team_Off_KR = Sum(Off_Weight_i x Final_System_Off_KR_i) for all i in rotation

## 6. Team Defensive KR
Team_Def_KR = Sum(Def_Weight_i x Final_System_Def_KR_i) for all i in rotation

## 7. Physical Environment Adjustment
Compute team-level physical metrics:
- Avg_Height = weighted average height (by minutes)
- Avg_Wingspan = weighted average wingspan (by minutes, when available)
- Height_Variance = spread of heights across rotation

Physical Environment Modifier:
- If Avg_Height is in the top 20% for the level: +0.5 to Team_Def_KR
- If Avg_Height is in the bottom 20%: -0.5 to Team_Def_KR
- If Height_Variance is extremely low (all similar sizes): -0.5 to Team_Def_KR (lack of positional versatility)

Women's note: Physical size advantages are more impactful in women's basketball due to the greater variance in physical profiles. A team with two 6'4"+ players has a significant rebounding and rim protection advantage.

## 8. Offense/Defense Split by Level
Team_KR = (Team_Off_KR x Off_Split) + (Team_Def_KR x Def_Split)

| Level | Off_Split | Def_Split | Rationale |
|-------|----------|----------|-----------|
| D1 HM | 0.52 | 0.48 | Balanced, slight offensive premium at highest level |
| D1 MM | 0.50 | 0.50 | Even split |
| D1 LM | 0.48 | 0.52 | Defense travels; physicality matters more at this level |
| D2 | 0.48 | 0.52 | Defense-first advantage |
| D3 | 0.46 | 0.54 | Talent gaps amplified on defense |
| NAIA | 0.48 | 0.52 | |
| NJCAA D1 | 0.50 | 0.50 | |
| NJCAA D2 | 0.48 | 0.52 | |
| NJCAA D3 | 0.46 | 0.54 | |
| CCCAA | 0.48 | 0.52 | |
| USCAA | 0.46 | 0.54 | |
| NCCAA D1 | 0.46 | 0.54 | |
| NCCAA D2 | 0.44 | 0.56 | |
| Pro (WNBA) | 0.52 | 0.48 | |

Women's note: Defense-weighted splits are slightly more pronounced at lower levels in women's basketball than in men's, reflecting the greater impact of physical mismatches and post play dominance at lower levels.

## 9. Team KR Diagnostics

### Coverage Map
For each system demand (offensive + defensive), show which players cover it and at what quality level.
- Full Coverage: Demand A archetype present with KR 85+
- Partial Coverage: Demand A archetype present with KR <85, or Demand B archetype at KR 85+
- Gap: No player covers this demand above minimum threshold

### Missing Demands
List all system demands that are not covered at Full Coverage level. Priority-rank by demand tier.

### Fragility Flags
- **Single Point of Failure:** One player covers a Critical (A) demand and no other player in the rotation can cover it. If that player is unavailable, the system breaks.
- **Depth Void:** Fewer than 7 players above MIN_PARTICIPATION threshold. Team is one injury away from crisis.
- **Positional Imbalance:** More than 40% of rotation minutes concentrated in one position group.
- **Offensive Concentration Risk:** One player accounts for 35%+ of team usage AND no other player has USG% above 20%.

Women's-specific fragility flag:
- **Post Dependency:** In a Post-Centric system, only one player qualifies as Post Scorer archetype. Post-dependent systems are fragile without post depth, which is scarce in women's basketball.

## 10. System Fit Percentage (Team Level)
Team_System_Fit% = (Sum of all covered demands at Full/Partial level) / (Total system demands) x 100
Adjust: Full Coverage demands count as 1.0. Partial Coverage counts as 0.5. Gaps count as 0.0.

System Fit% is the single most predictive variable for team overperformance beyond raw Team KR. Teams above 95% fit consistently overperform by 3-4 wins. Teams below 75% fit consistently underperform.

## 11. Team KR Tiers (Level-Specific)

### D1 HM Team KR Tiers
- 92+: Championship contender. Deep, elite roster. Final Four caliber.
- 89-91: Tournament threat. Top-20 team. Sweet 16 or better.
- 86-88: Solid tournament team. Top-40. First/second round.
- 83-85: Bubble team or lower seed. Competing for at-large bid.
- 80-82: Conference competitive. NIT caliber.
- 77-79: Below .500 at HM level. Rebuilding.
- Below 77: Significant talent deficit.

### D1 MM Team KR Tiers
- 90+: Conference dominant. NCAA tournament lock. Could compete with HM teams.
- 87-89: Conference contender. NCAA tournament caliber.
- 84-86: Upper half of conference.
- 81-83: Middle of conference.
- Below 81: Lower conference tier.

### D1 LM Team KR Tiers
- 88+: Conference dominant. NCAA tournament automatic bid favorite.
- 85-87: Conference contender.
- 82-84: Upper half.
- Below 82: Lower half to rebuilding.

(Lower-level team KR tiers follow the same descending structure, with thresholds adjusted by KLVN lambda gaps.)

## 12. 13-Step Team KR Execution Pipeline

1. Lock Coach Context
2. Verify all players in rotation have finalized Player System KRs
3. Apply participation threshold (5% minutes)
4. Compute offensive weights (Usage x Minutes x System Role)
5. Compute defensive weights (Minutes x Defensive Role x Matchup)
6. Normalize all weights to sum to 1.0
7. Compute Team_Off_KR
8. Compute Team_Def_KR
9. Apply Physical Environment Adjustment
10. Apply Offense/Defense Split by Level
11. Compute Team_KR
12. Run Diagnostics (Coverage Map, Missing Demands, Fragility Flags)
13. Interpret against Team KR Legend at appropriate level

---

# OFFENSIVE SYSTEM INFERENCE ENGINE (OSIE)

## Purpose
OSIE infers a team's offensive system identity from observed play patterns. It answers: "What offensive system is this team actually running?"

## Process
Same structure as men's basketball OSIE:
1. Collect play-type distribution data (if available from Synergy/PlayVision)
2. If play-type data unavailable, use box-score proxies: 3PA rate, FTA rate, pace, paint touch rate, post-up frequency
3. Match observed patterns against the 12 offensive system profiles
4. Assign primary system (highest match %) and secondary system (if match > 60%)
5. Confidence level: Provisional (< 5 games), Observed (5-15 games), Locked (15+ games)

Women's note: Post-Centric / Inside-Out detection thresholds should be lower than men's (meaning it triggers more easily) because post play is more common. Zone offense patterns (motion against zone) are more common and should be tracked separately.

---

# DEFENSIVE SYSTEM INFERENCE ENGINE (DSIE)

## Purpose
DSIE infers a team's defensive system identity.

## Process
Same structure as men's DSIE:
1. Collect defensive play-type data
2. If unavailable, use box-score proxies: opponent 3P%, opponent paint points, steal rate, block rate, foul rate, pace
3. Match against 10 defensive system profiles
4. Assign primary and secondary system with confidence

Women's note: Zone (Structured) detection should have a lower threshold because zone defense is more prevalent in women's basketball. Press / Pressure Defense is common at lower levels in women's basketball, particularly JUCO and lower D1.

---

# SCHOLARSHIP / NIL ALLOCATION ENGINE

## Purpose
Optimizes allocation of 15 scholarships (same as men's basketball) and NIL resources to maximize Team KR.

## Inputs
- Current roster with Player KRs
- Scholarship status of each player
- NIL pool
- Institutional/merit aid capacity
- Recruiting targets with projected KRs

## Scholarship Structure (Women's Basketball)
- 15 full scholarships at D1 (same as men's)
- D2: 10 equivalency scholarships (can be split)
- D3: No athletic scholarships (academic/need-based aid only)
- NAIA: 11 equivalency scholarships
- NJCAA D1: 15 full scholarships
- NJCAA D2: 15 full scholarships
- NJCAA D3: No athletic scholarships
- CCCAA: No athletic scholarships (tuition is minimal)

## NIL in Women's Basketball
NIL has become a significant factor in women's basketball recruiting since the Caitlin Clark effect and the broader growth of women's basketball visibility. Top women's basketball players at elite programs can command six-figure NIL deals. The NIL landscape is less developed than men's basketball but growing rapidly.

## PTV (Player Transfer Value)
Same framework as men's: PTV estimates the scholarship/financial value a player deserves based on their KR, system fit, and replacement cost.

PTV = f(Player_KR, System_Fit%, Replacement_KR_at_position, Scholarship_value, NIL_market)

---

# ROSTER DECISION INTELLIGENCE v1

## Purpose
Provides data-driven recommendations for roster construction decisions: recruiting targets, portal entries, portal pickups, roster cuts.

## Framework
Same as men's Roster Decision Intelligence:
1. **Identify Team KR gaps** from diagnostics (Coverage Map, Missing Demands)
2. **Rank needs** by impact on Team KR
3. **Match available players** (recruits, portal players) to needs
4. **Project Team KR impact** of each potential addition
5. **Recommend** top targets with projected Team KR change, System Fit change, and cost (scholarship/NIL)

Women's-specific considerations:
- Transfer portal activity is extremely high in women's basketball. More roster turnover than men's.
- International recruiting is significant at D1 level. Many top international players bypass traditional recruiting pipelines.
- Fifth-year transfers and graduate transfers are common, creating opportunities for immediate-impact additions.
- Pregnancy/maternity considerations may affect roster planning timelines. The system projects roster availability honestly without discriminating.
- Coaching changes create mass portal entries. Women's basketball coaching turnover is high, and roster stability correlates strongly with coaching continuity.
