# WBB SIMULATION ENGINE
## v1.0 - Women's Basketball Intelligence

---

# INTERACTION LIBRARY

## 0. Scope
This is the single authoritative lookup table for all identity-clash interactions consumed by the Women's Basketball Simulation Engine. Three tables:

- Part 1: System x System (12 offense x 10 defense = 120 entries)
- Part 2: Offensive Archetype x Defensive System (21 archetypes x 10 systems = 210 entries)
- Part 3: Defensive Archetype x Offensive System (21 archetypes x 12 systems = 252 entries)

## Governance
- All archetype names MUST match the locked Archetype Library (21 archetypes)
- All system names MUST match the locked System Sets (12 offense, 10 defense)
- Delta values are bounded by the Modifier Framework
- This library produces interaction data only - it does not simulate, evaluate, or resolve outcomes
- All deltas are relative to a neutral baseline
- Deterministic: same identity inputs produce same deltas

## Women's Basketball Interaction Adjustments
The interaction library structure is identical to men's basketball. The delta VALUES are adjusted for women's basketball in the following ways:

### Scoring Pace Adjustment
Women's college basketball games average approximately 65-72 possessions per team per game at D1 HM level (vs 67-75 for men's). Women's scoring averages are lower. All possession-level projections in the simulation engine use women's-specific pace and scoring norms.

### Post Play Impact Amplification
In interactions involving Post-Centric / Inside-Out offense or post-heavy archetypes (Post Scorer, Anchor Big), the delta magnitudes are amplified by approximately +15-20% compared to men's values. Post play has a larger relative impact in women's basketball because:
- Post scoring is more efficient relative to perimeter scoring in women's game
- Rim protection is scarcer, so post mismatches are more exploitable
- Post passing and playmaking from the post is a more common offensive feature

### Zone Defense Interaction Enhancement
Zone (Structured) and Matchup Zone / Hybrid defense interactions carry higher delta magnitudes in women's basketball because:
- Zone defense is used more frequently, so offensive teams have more zone offense experience (reducing zone effectiveness slightly against experienced teams)
- But zone defense is also more effective in women's basketball when the opposing team lacks elite perimeter shooting

### Physical Mismatch Amplification
Physical mismatch modifiers (height, wingspan, athleticism advantages) carry approximately 10-15% larger effect sizes in women's basketball because:
- Physical profile variance is greater (the gap between the tallest and shortest competitive players is larger relative to overall height distribution)
- Athleticism advantages above the rim are rarer and more impactful when present
- Strength advantages in post play translate more directly to scoring efficiency

---

## PART 1: SYSTEM x SYSTEM INTERACTION

Same 120 entries as men's basketball (12 offense x 10 defense). Each entry defines: Pace impact, Shot Profile shifts, Turnover Pressure, Foul Rate, Explanation.

Women's-specific delta adjustments applied globally:
- Pace impacts reduced by ~5% (women's game inherently slower pace)
- Turnover pressure effects increased by ~10% (turnovers are slightly more frequent in women's game on average)
- Post-related shot profile shifts amplified by ~15%

The full 120-entry table follows the identical structure as men's File 04. All system names, interaction logic, and directional effects are the same. Magnitude calibration uses women's-specific baselines.

### Example Entries (Women's Calibrated)

**Spread Pick-and-Roll vs Containment Man**
- Pace: Neutral
- Shot Profile: Rim attempts +2pp, Pull-up midrange +2pp, Spot-up 3s -1pp
- Turnover Pressure: Neutral
- Foul Rate: +1pp
- Explanation: Standard PnR reads remain intact. Women's PnR is increasingly effective at D1 HM with elite PG play.

**Post-Centric / Inside-Out vs Pack Line**
- Pace: -3%
- Shot Profile: Post touches +4pp, Rim attempts -2pp (Pack Line congests paint), Kick-out 3s +3pp
- Turnover Pressure: +2pp (post entry passes against Pack Line congestion)
- Foul Rate: +2pp (post physicality draws fouls)
- Explanation: Classic strength-on-strength matchup in women's basketball. Pack Line's gap control vs elite post play. Outcome depends heavily on whether the post scorer can pass out of doubles.

**5-Out Motion vs Zone (Structured)**
- Pace: -2%
- Shot Profile: 3PA +5pp, Rim attempts -4pp, Midrange from high post +2pp
- Turnover Pressure: +1pp (skip passes against zone)
- Foul Rate: -1pp (less contact in perimeter-oriented attack)
- Explanation: Zone forces the 5-Out to shoot over the zone or find gaps. Elite shooting teams thrive; poor shooting teams struggle badly.

**Pace & Space vs Switch Everything**
- Pace: +3%
- Shot Profile: Pull-up 3s +2pp, Rim attempts +2pp (attacking switches)
- Turnover Pressure: +1pp
- Foul Rate: Neutral
- Explanation: Switching creates mismatches. In women's basketball, guard-to-post switches create more extreme mismatches than in men's due to physical profile differences. Amplified effect.

---

## PART 2: OFFENSIVE ARCHETYPE x DEFENSIVE SYSTEM (210 entries)

Same 21 archetypes x 10 defensive systems structure as men's basketball. Each entry defines: Efficiency Delta, Volume Delta, Creation Impact, Key Note.

Women's-specific archetype interaction notes:

**Post Scorer vs any defense:** Efficiency deltas are amplified in women's basketball. Elite post scorers face less rim protection on average, meaning their baseline efficiency is higher. However, double-team frequency against elite post players is also higher.

**Off-Ball Shooter (Movement) vs Zone:** Significantly more impactful in women's basketball. Zone is common, and elite movement shooters who can relocate against zone rotations are premium.

**Anchor Big vs any offense:** Rim protection impact is amplified. An elite rim protector changes the defensive identity of a women's team more dramatically than in men's because the baseline rim protection talent pool is smaller.

**Primary Ball-Handler vs Press / Pressure Defense:** Press breaking is a critical skill in women's basketball, especially at lower levels where full-court pressure is very common. Ball handlers who can break the press efficiently are disproportionately valuable.

---

## PART 3: DEFENSIVE ARCHETYPE x OFFENSIVE SYSTEM (252 entries)

Same 21 archetypes x 12 offensive systems. Each entry defines the defensive archetype's impact on the offensive system: Disruption Level, Key Matchup, Vulnerability, Key Note.

Women's-specific notes:

**Switchable Defender Wing vs any perimeter offense:** More valuable in women's basketball because fewer players can genuinely switch. When present, eliminates the mismatch-hunting that many women's offenses rely on.

**POA Defender Guard vs Heliocentric:** Critical matchup. If the POA defender can contain the heliocentric ball handler, the entire offense stalls. In women's basketball where Heliocentric offenses are built around a single star creator, this matchup is often the game.

---

# SIMULATION ENGINE

## Purpose
Resolves head-to-head matchups between two teams using system interactions, archetype matchups, and Team KR inputs. Outputs win probability and key drivers.

## Process (Identical Structure to Men's)

1. **Load Team KR outputs** for both teams (Team_Off_KR, Team_Def_KR, Team_KR, System identity, rotation archetypes)
2. **Load System x System interaction** for the matchup
3. **Apply pace and shot profile adjustments** from the system interaction
4. **Load individual archetype matchups** for the top-7 rotation players on each side
5. **Compute possession-level expected efficiency** for each team:
   - Adjusted_Off_Efficiency_A = Team_Off_KR_A + System_Interaction_Delta + Sum(Archetype_Matchup_Deltas)
   - Adjusted_Def_Efficiency_A = Team_Def_KR_A + Defensive_System_Impact
6. **Project scoring pace** using women's-specific possession estimates:
   - D1 HM base: ~68 possessions per team per game
   - Adjusted by system interaction pace modifier
7. **Compute expected point differential:**
   Expected_Margin = (Adj_Off_Eff_A - Adj_Def_Eff_B) x Possessions - (Adj_Off_Eff_B - Adj_Def_Eff_A) x Possessions
8. **Convert to win probability** using logistic model calibrated to women's basketball scoring distributions
9. **Apply Physical Mismatch Modifiers** as final adjustment

## Physical Mismatch Modifiers - Women's Basketball

Physical mismatches are scored position-by-position across the starting five. Effect sizes are amplified relative to men's (see justification above).

### Height Mismatch
| Mismatch (inches) | Effect on Matched Position |
|-------------------|--------------------------|
| +3 or more | +2.5 efficiency points (amplified from men's +2.0) |
| +2 | +1.5 |
| +1 | +0.5 |
| 0 | Neutral |
| -1 | -0.5 |
| -2 | -1.5 |
| -3 or more | -2.5 |

### Athleticism Mismatch
When one team has a significant speed/quickness advantage at the guard positions:
- +2.0 to transition scoring efficiency
- +1.0 to press-break efficiency (critical in women's game)

When one team has a significant strength advantage in the post:
- +2.0 to post scoring efficiency
- +1.5 to offensive rebounding rate

### Rim Protection Presence
If one team has an Anchor Big (Rim Protector) and the other does not:
- +3.0 to the team with the rim protector's defensive efficiency in the paint
- This is a larger effect than men's (+2.0) because rim protection is scarcer in women's basketball

## Simulation Output
- Win probability for each team (expressed as percentage)
- Projected score (using women's scoring norms)
- Key matchup drivers (which archetype matchups matter most)
- Variance estimate (how much randomness affects the outcome)
- "If X wins, it's because..." and "If Y wins, it's because..." narratives

## Women's Scoring Norms for Simulation
| Level | Avg Team PPG | Avg Possessions/Game | Notes |
|-------|-------------|---------------------|-------|
| D1 HM | 72-78 | 66-70 | Top programs can exceed 80 PPG |
| D1 MM | 65-72 | 64-68 | |
| D1 LM | 60-68 | 62-66 | |
| D2 | 62-70 | 63-67 | |
| NAIA | 60-68 | 62-66 | |
| NJCAA D1 | 62-70 | 64-68 | Often higher-paced |
| WNBA | 80-86 | 72-76 | 40-minute games |

These are baseline ranges. Actual projections use team-specific pace data when available.
