# SOCCER FILE 02 -- COLLEGE ADDENDUM v1

## Purpose
This addendum provides college-specific trait bands, position OPF weights, and evaluation context for the Soccer Player Eval Reference (File 02). The base File 02 contains pro trait bands. This addendum adds college equivalents for all 14 US college competitive levels.

All college trait bands use KLVN normalization. Bands shown are for the reference level (NCAA D1 HM, lambda = 1.000). Other levels are normalized via KLVN before band comparison.

---

# COLLEGE TRAIT BANDS

## Note on College Soccer Statistics
College soccer stat infrastructure is less mature than professional. Key differences:
- Per-90 stats are available from some sources (NCAA stats, TDS) but not universal
- xG/xA are NOT available at most college levels -- evaluation relies on raw goals, assists, shots, shot accuracy
- Progressive passes, pressures, and possession data are NOT available below D1 level
- Tracking data (sprint speed, distance covered) is virtually nonexistent at college level
- Most college evaluations will be V1 (box score + composites) or V1+ (box score + video scouting)

This means many traits in the Trait Library will be UNSCORED at college level. The system handles this the same way basketball does: UNSCORED traits contribute zero weight, remaining scored traits renormalize.

## Shooting Cluster -- College Bands (D1 HM Reference)

### Clinical Finishing
College bands (v0):
- 90: .250+ shot conversion AND 12+ goals/season
- 80: .200-.249 AND 8-11 goals
- 70: .150-.199 AND 5-7 goals
- 60: .100-.149 AND 3-4 goals
- <60: below .100 or fewer than 3 goals
Box-score mode: PROXY -- Goals/season, shots/season, shot %. Score: round(0.60 x Band(conversion) + 0.40 x Band(goals))

### Long-Range Shooting
College bands (v0):
- 90: 4+ goals from outside the box/season (estimated from match reports)
- 80: 2-3
- 70: 1
- 60: 0 but takes quality long-range shots (video evidence)
- <60: no long-range threat
Box-score mode: UNSCORED (null) unless goals breakdown available

### Heading Accuracy (Attacking)
College bands (v0):
- 90: 4+ headed goals/season AND dominant in attacking aerial duels
- 80: 2-3 headed goals
- 70: 1 headed goal + aerial presence
- 60: 0 headed goals but wins aerial duels
- <60: no aerial attacking threat
Box-score mode: PROXY -- headed goals only (low confidence, requires match reports)

### Penalty Taking
Same as pro bands (penalty conversion is level-independent)

### Free Kick Shooting
Same as pro bands (small sample sizes at college make this low-confidence)

### First-Time Finishing, Shot Power & Placement
Box-score mode: UNSCORED (null) at all college levels

## Chance Creation Cluster -- College Bands (D1 HM Reference)

### Through Ball Delivery
Box-score mode: UNSCORED (null) -- no through ball data at college level

### Crossing Delivery
College bands (v0):
- 90: 6+ assists from crosses/season (estimated)
- 80: 4-5
- 70: 2-3
- 60: 1
- <60: no crossing assists
Box-score mode: PROXY -- assists + position context (if FB/W, higher assumed crossing contribution)

### Progressive Passing
Box-score mode: UNSCORED (null) at most college levels. Available at D1 if using NCAA advanced stats.

### Key Passes / Chance Creation
College bands (v0):
- 90: 12+ assists/season
- 80: 8-11 assists
- 70: 5-7 assists
- 60: 3-4 assists
- <60: fewer than 3 assists
Box-score mode: PROXY -- assists/season. Score: Band(assists)

### Set Piece Delivery, Final Third Entries, Build-Up Contribution
Box-score mode: UNSCORED (null) at college level

## Dribbling & Carrying Cluster -- College Bands

All traits in this cluster are UNSCORED (null) at college level via box-score mode. No take-on, progressive carry, or dispossession data available at college level.

Exception: If video scouting is available, coach/scout can provide qualitative ratings that translate to approximate bands. This would be V1+ mode (box score + scouting eye).

## Defending (Individual) Cluster -- College Bands (D1 HM Reference)

### Tackling, 1v1 Duels, Pressing Intensity, Blocks
Box-score mode: UNSCORED (null) -- no tackle/duel/pressure data at college level

### Interceptions
Box-score mode: UNSCORED (null) at most levels

### Aerial Duels (Defensive)
College bands (v0) -- estimated from goals conceded, clean sheets, and position:
- 90: CB on team with .60 or fewer GA/match AND dominant aerial presence (video/scouting)
- 80: CB on team with .70-.80 GA/match AND solid aerial presence
- 70: average
- 60: below average
- <60: poor
Box-score mode: PROXY -- team GA/match + position + height (very low confidence)

### Ball Recovery
Box-score mode: UNSCORED (null)

## Defending (Collective) Cluster
ALL TRAITS UNSCORED (null) at college level. Requires tactical video analysis.

## Distribution Cluster -- College Bands

### Short Passing Accuracy, Long Passing Accuracy, Switching Play, Build-Up Progression, Passing Under Pressure, Pass Range
ALL UNSCORED (null) at college level via box-score mode. No passing data available.
Exception: D1 programs using NCAA advanced stats may provide pass completion %. If available, use as proxy for Short Passing Accuracy only (low confidence).

## Tools Cluster -- College Bands

### Sprint Speed, Acceleration, Agility
UNSCORED (null) -- no tracking data at college level

### Stamina / Endurance
College bands (v0):
- 90: plays full 90 in every match, no visible fitness drop-off
- 80: plays 80+ minutes consistently
- 70: plays 70+ minutes
- 60: 60+ minutes
- <60: frequently subbed before 60 due to fitness
Box-score mode: PROXY -- minutes/match average

### Strength
Box-score mode: UNSCORED (null) -- qualitative only

### Height / Aerial Presence
Always scored from biographical data + aerial production evidence

### Preferred Foot Versatility
Box-score mode: UNSCORED (null) unless scouting data available

### Injury Resilience
College bands (v0):
- 90: missed 0-1 matches over last 2 seasons
- 80: missed 2-4 matches
- 70: missed 5-8 matches
- 60: missed 9-14 matches
- <60: missed 15+ matches or chronic condition
Box-score mode: PROXY -- matches played vs matches available

## Tactical IQ Cluster -- College Bands

ALL TRAITS UNSCORED (null) at college level via box-score mode. Requires video scouting.

---

## COLLEGE TRAIT SCORING SUMMARY

At college level using box-score mode (V1), the following traits are SCORABLE:

| Cluster | Scorable Traits | Method |
|---------|----------------|--------|
| Shooting | Clinical Finishing, Heading Accuracy, Penalty Taking | Proxy |
| Chance Creation | Key Passes/Chance Creation (assists) | Proxy |
| Dribbling & Carrying | NONE | -- |
| Defending (Individual) | Aerial Duels (Defensive, very low confidence) | Proxy |
| Defending (Collective) | NONE | -- |
| Distribution | NONE (Pass % if D1 advanced available) | -- |
| Tools | Stamina, Height/Aerial Presence, Injury Resilience | Proxy |
| Tactical IQ | NONE | -- |

**Total scorable at V1 (box score): ~7-8 traits out of 54**

This is why the V1 Evaluation Protocol for college soccer relies HEAVILY on the Phase 3 Production Anchor (legend matching) with Phase 6 component KRs estimated from the limited data + scouting judgment. Same architecture as basketball V1.

---

# COLLEGE POSITION OPF WEIGHTS

Position Trait Weighting -- College Soccer v1 (LOCKED)

## OPF Definition
Base Player KR = (AKR x OPF_att) + (DKR x OPF_def) + (TKR x OPF_tools) + (IQKR x OPF_iq)

College OPF differs from pro OPF because:
1. Tools (physical attributes) matter MORE at college -- physical development gaps are wider
2. Tactical IQ matters LESS -- systems are simpler, players are developing game understanding
3. Attack/Defense balance shifts slightly toward physical and away from tactical sophistication

## College Outfield Positions (10)

| Position | AKR (Attack) | DKR (Defense) | TKR (Tools) | IQKR (Tactical IQ) |
|----------|-------------|--------------|-------------|-------------------|
| ST (Striker) | 56% | 8% | 24% | 12% |
| SS (Second Striker) | 50% | 10% | 22% | 18% |
| W (Winger) | 46% | 14% | 28% | 12% |
| CAM (Attacking Mid) | 44% | 12% | 18% | 26% |
| CM (Central Mid) | 28% | 26% | 22% | 24% |
| CDM (Defensive Mid) | 14% | 38% | 22% | 26% |
| WB (Wing-Back) | 28% | 28% | 30% | 14% |
| FB (Fullback) | 18% | 36% | 30% | 16% |
| CB (Centre-Back) | 6% | 46% | 30% | 18% |
| GK (Goalkeeper) | 0% | 48% | 28% | 24% |

### College vs Pro OPF Comparison

| Position | College TKR | Pro TKR | Delta | Rationale |
|----------|-----------|---------|-------|-----------|
| ST | 24% | 18% | +6% | Physical advantages (speed, strength) dominate more at college. |
| W | 28% | 22% | +6% | Pace is a bigger differentiator at college. Less tactical sophistication to compensate. |
| CB | 30% | 24% | +6% | Height/strength/aerial dominance matter more when passing/tactical demands are lower. |
| GK | 28% | 22% | +6% | Athleticism (height, reflexes, reach) covers for less distribution demand. |
| CM | 22% | 16% | +6% | Physical ability to cover ground matters more when tactical shape is less refined. |

The pattern: +6% to Tools across the board at college, redistributed from a combination of Attack (-2%), Defense (-2%), and IQ (-2%).

---

# COLLEGE SYSTEM DEMAND PROFILES

College systems differ from pro. Coaches at college level generally run simpler versions of the 12 offensive / 10 defensive systems. The System Demand Profiles in File 02 apply, but with the following college-specific notes:

## College-Specific System Context

1. **Formation complexity is lower.** Most college teams run a base 4-4-2, 4-3-3, or 3-5-2 without the positional fluidity of pro systems. Inverted fullbacks, false 9s, and half-space exploitation are rare below D1 HM.

2. **Set pieces carry outsized weight.** At lower college levels, a significant percentage of goals come from set pieces (corners, free kicks, throw-ins). Set Piece Delivery and Heading Accuracy become more valuable at NAIA, D2, NJCAA than at D1 HM.

3. **Physicality trumps tactics at lower levels.** As you move down the KLVN ladder, raw physical tools (speed, strength, stamina, height) become increasingly decisive relative to tactical sophistication.

4. **Pressing intensity varies wildly.** Some college coaches press aggressively; many don't have the fitness or personnel for it. Pressing-based systems are less common below D1 level.

5. **Goalkeeper distribution is less important.** Build-from-the-back is rare at NAIA/D2/NJCAA. GK evaluation at those levels weights shot-stopping and aerial command much higher than distribution.

## System Availability by Level

| Level | Systems Commonly Used | Systems Rarely Seen |
|-------|----------------------|-------------------|
| D1 HM | All 12 offensive, all 10 defensive | -- |
| D1 MM | Most systems, less False 9 / Half-Space / 3-2-5 | Half-Space, 3-2-5 Build-Up |
| D1 LM | Simpler systems dominate | False 9, Heliocentric, Half-Space, 3-2-5 |
| D2 | Possession, Direct, Wing Play, Counter-Attack, High Press, Mid-Block | Most complex systems |
| NAIA | Direct, Counter-Attack, Wing Play, Possession (simple), Mid-Block, Low Block | Complex positional systems |
| NJCAA | Direct, Counter-Attack, Wing Play, High Press, Mid-Block | Complex systems |
| D3 | Similar to NAIA | Complex systems |
| CCCAA | Similar to NJCAA | Complex systems |
| USCAA/NCCAA | Direct, Counter-Attack, basic shape | Everything complex |

## Archetype Value Shift at College

At lower college levels, certain archetypes become MORE valuable than their pro equivalents:
- **Target Man** -- aerial dominance + set piece threat is disproportionately valuable at NAIA/D2/NJCAA
- **Traditional Winger** -- pure pace on the wing exploits less organized defenses
- **Stopper CB** -- physical, aggressive defending matters more than ball-playing ability
- **Destroyer** -- ball-winning in midfield compensates for less tactical organization

Certain archetypes become LESS valuable:
- **Regista** -- no one to pass to in complex patterns at lower levels
- **Inverted Fullback** -- tactical role that requires system understanding that doesn't exist at most levels
- **False 9** -- dropping movement only works if teammates recognize and exploit the space
- **Half-Space Operator** -- positional concept that requires team-wide tactical education

---

# COLLEGE BADGES -- ADJUSTED GATES

Badge gates are the same structure as pro (Bronze/Silver/Gold) but with adjusted Skill KR thresholds for college:

College Badge Tiers:
- Bronze: Skill KR >= 88 AND relevant trait(s) >= 88. KR lift: +0.5
- Silver: Skill KR >= 92 AND relevant trait(s) >= 92. KR lift: +1.0
- Gold: Skill KR >= 96 AND relevant trait(s) >= 96. KR lift: +1.5
- Total badge lift cap: +3.5 KR

(Pro badges are Bronze >= 90, Silver >= 94, Gold >= 97. College gates are slightly lower to reflect tighter scoring ranges at college.)

Note: Because most college traits are UNSCORED at V1, badge assignment at college is RARE and typically requires video scouting data (V1+ or higher).

---

# COLLEGE OVERRIDES -- ADJUSTED VALUES

Same override structure as pro, but adjusted for college context:

## College-Specific Positive Overrides

### 1) Generational Athlete (+5.0 KR)
Same trigger as pro. Physical tools so rare that level norms don't apply.

### 2) International Pedigree (+2.0 KR)
Trigger: Player has senior international caps for a FIFA-ranked nation (any ranking). Confirms evaluation against competition outside the US college system.
Gate: >= 3 senior international caps OR >= 10 youth international caps at U20+

### 3) Transfer Pedigree (+1.5 KR)
Trigger: Player transferred DOWN from a higher level (e.g., D1 HM to NAIA) and is producing at expected levels. Prior level confirms a floor that current production at the lower level would not reveal.
Gate: >= 1 full season at the higher level with meaningful minutes (>= 500 minutes)

### 4) Multi-Sport Athlete (+1.0 KR)
Trigger: Player is a competitive multi-sport athlete whose secondary sport develops transferable physical tools (e.g., track speed, basketball vertical/agility, rugby physicality).
Gate: Varsity-level competition in secondary sport + measurable physical tools above position norms

### 5) Academic Excellence (+0.75 KR)
Trigger: Player maintains >= 3.7 GPA while producing at high athletic level. Signals discipline, time management, and coachability.
Gate: GPA >= 3.7 AND KR >= 78

## College Negative Overrides (always apply)

Same as pro: Chronic Injury (-3.0), Disciplinary (-2.0), Regression (-2.0), Attitude (-1.5)

---

# SCHOLARSHIP / AID ALLOCATION

At college level, the downstream financial engine is Scholarship / Aid Allocation, NOT transfer fees. This mirrors basketball's scholarship/NIL allocation engine.

## Scholarship Rules by Governing Body (Men's Soccer)

| Level | Scholarships | Type | Notes |
|-------|-------------|------|-------|
| NCAA D1 | 9.9 | Equivalency (can split) | 9.9 full scholarships split across roster of 25-30 |
| NCAA D2 | 9.0 | Equivalency | Similar split model |
| NCAA D3 | 0 | None (academic/need aid only) | No athletic scholarships |
| NAIA | 12.0 | Equivalency | More scholarship flexibility than NCAA |
| NJCAA D1 | 18.0 | Equivalency | Generous allocation for two-year |
| NJCAA D2 | 18.0 | Equivalency | Same |
| NJCAA D3 | 0 | None | No athletic scholarships |
| CCCAA | 0 | None (tuition is free in CA) | No athletic aid but tuition is minimal |
| USCAA | Varies | Institutional | Limited athletic aid |
| NCCAA | Varies | Institutional | Varies by institution |

## KR-to-Scholarship Allocation Framework

The principle: higher KR players deserve a larger share of the available scholarship pool.

| KR Tier (at level) | Scholarship Allocation | Logic |
|--------------------|----------------------|-------|
| 90+ at level | Full scholarship or maximum available | Franchise player. Invest maximally. |
| 85-89 | 75-100% of full | Core starter. High investment. |
| 80-84 | 50-75% | Solid contributor. Moderate investment. |
| 75-79 | 25-50% | Rotation. Partial aid. |
| 70-74 | 10-25% | Bench depth. Minimal aid. |
| Below 70 | 0-10% or walk-on | Developmental or walk-on. |

This framework is a guideline. Actual allocation depends on roster construction needs, positional scarcity, and institutional aid capacity.

---

## GOVERNANCE NOTE

This addendum is governed by the same rules as the base File 02:
- All weights, bands, and gates are locked. Changes require documentation, versioning, and approval.
- College OPF and trait bands are v1 estimates requiring calibration as evaluation data accumulates.
- The college layer does NOT modify or replace the pro layer. Both coexist in File 02. College is the primary evaluation context; pro is the downstream translation (Mode 6).
