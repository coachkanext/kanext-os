# Women's Volleyball Team Intelligence v1

---

## 0. SCOPE

This is the single authoritative document for Team KR computation, system inference (OSIE/DSIE), rotation analysis, scholarship allocation, and roster construction intelligence for women's volleyball.

Team KR is the rotation-weighted aggregation of players' system-adjusted KRs. It does not evaluate players. It consumes finalized player outputs from upstream.

---

## 1. INPUTS (Non-Negotiable)

Team KR consumes only:

**Per player in rotation:**
- Final_System_Off_KR_i (from Player System Fit layer)
- Final_System_Def_KR_i (from Player System Fit layer)
- Sets played (official match logs or coach-entered)
- Attack attempts / Set (proxy for offensive involvement)
- Offensive archetype demand tier (A/B/C/No-match) for selected offensive system
- Defensive archetype demand tier (A/B/C/No-match) for selected defensive system
- Height (inches), Standing Reach (inches, if available), Block Touch (inches, if available)
- Position (S, OH, MB, OPP, L, DS)

**Per program (from Coach Context Setup):**
- Governing Body / Division (and Major Class if NCAA D1)
- Offensive System (from 6 offensive systems)
- Defensive System (from 5 defensive systems)
- Competitive level

**Explicit exclusions (locked):**
- No archetype recomputation
- No badge/label recomputation
- No trait recomputation
- No system-fit inference (already baked into Final System KR upstream)

---

## 2. PARTICIPATION THRESHOLD

Rotation-only model. No starter/bench labels.

- MIN_PARTICIPATION = 0.05 (5% of total sets played by the team)
- Include player i in Team KR math iff sets_share_i >= MIN_PARTICIPATION
- Exclude all players below threshold
- Default evaluation window: season-to-date

---

## 3. OFFENSIVE WEIGHT PER PLAYER

Offensive weight determines how much each player's Final_System_Off_KR pulls on Team Offense KR.

### Three inputs:
1. **Attack Volume%** - who the offense runs through. Measured as player attack attempts / team total attack attempts. (50% of weight when available)
2. **Sets%** - who is on the court. Measured as sets played / team sets. (25% of weight)
3. **System Role Score** - how critical is this player's position/archetype to the selected offensive system. (25% of weight)

### Data Tier Formulas

**Tier 1 - Full data (attack attempts tracked per player):**
```
Off_Weight_Raw_i = (AttackVol%_i * 0.50) + (Sets%_i * 0.25) + (Off_Role_Score_i * 0.25)
```

**Tier 2 - Limited data (sets only, no individual attack tracking):**
```
Off_Weight_Raw_i = (Sets%_i * 0.65) + (Off_Role_Score_i * 0.35)
```

### System Role Multipliers (Locked)

| Demand Tier | Multiplier |
|------------|-----------|
| A (Critical) | 1.20 |
| B (High) | 1.00 |
| C (Optional) | 0.85 |
| No match | 0.70 |

### Setter Offensive Weight Override
In a 5-1 system, the setter's offensive weight is calculated differently. The setter does not attack at high volume but controls 100% of the offense. Setter Off_Weight_Raw is set to the MEDIAN of all other included players' Off_Weight_Raw values, ensuring the setter is neither over- nor under-weighted.

In a 6-2 system, each setter's Off_Weight_Raw is calculated normally (they attack when front row).

### Normalization
```
Off_Weight_i = Off_Weight_Raw_i / SUM(Off_Weight_Raw)
```
All offensive weights sum to 1.0.

---

## 4. DEFENSIVE WEIGHT PER PLAYER

Defensive weight determines how much each player's Final_System_Def_KR pulls on Team Defense KR.

### Two inputs:
1. **Sets%** - defensive presence is about being on the court. (60% of weight)
2. **Defensive Role Score** - how critical is this player's position to the selected defensive system. (40% of weight)

### Formula:
```
Def_Weight_Raw_i = (Sets%_i * 0.60) + (Def_Role_Score_i * 0.40)
```

### Libero Defensive Weight Override
The libero plays back row in all 6 rotations (replacing a front-row player). The libero's Sets% is calculated based on the rotations she plays, which may equal or exceed the total sets played. The libero's Def_Role_Score is always treated as Demand Tier A (1.20) in any defensive system.

### Normalization
```
Def_Weight_i = Def_Weight_Raw_i / SUM(Def_Weight_Raw)
```
All defensive weights sum to 1.0.

---

## 5. TEAM KR COMPUTATION

### 5.1 Team Offense KR
```
Team_Off_KR = SUM(Off_Weight_i * Final_System_Off_KR_i)
```

### 5.2 Team Defense KR
```
Team_Def_KR = SUM(Def_Weight_i * Final_System_Def_KR_i)
```

### 5.3 Overall Team KR

Volleyball is a balanced sport where offense and defense are roughly equally important, but serve receive (a defensive function) drives the entire offense. At most college levels, defense has a slight edge because good defense creates transition opportunities.

| Level | Off Split | Def Split |
|-------|----------|----------|
| NCAA D1 Power 4 | 48% | 52% |
| NCAA D1 Mid-Major | 47% | 53% |
| NCAA D1 Low-Major | 46% | 54% |
| NCAA D2 | 46% | 54% |
| NCAA D3 | 45% | 55% |
| NAIA | 46% | 54% |
| NJCAA D1 | 47% | 53% |
| NJCAA D2/D3 | 45% | 55% |
| CCCAA | 46% | 54% |
| Pro (all leagues) | 49% | 51% |

```
Team_KR = (Team_Off_KR * Off_Split) + (Team_Def_KR * Def_Split)
```

### 5.4 System Fit Percentage
System Fit% measures how well the current roster's archetypes match the selected offensive and defensive systems.

```
System_Fit% = (Count of players with Demand Tier A or B) / (Total rotation players) * 100
```

Adjustment: If all critical positions (Demand Tier A) are filled, add 5% bonus. If any critical position is unfilled or No-match, subtract 5% penalty.

**System Fit% is the most predictive variable beyond raw Team KR.** Teams above 97% fit consistently overperform raw Team KR by 3-4 points. Teams below 85% fit consistently underperform.

---

## 6. ROTATION ANALYSIS

Rotation analysis is unique to volleyball and is one of the most important features of the team intelligence engine. Volleyball teams rotate through 6 positions, and each rotation creates a different configuration of players at the net and in the back row.

### 6.1 The 6 Rotations

In a standard 5-1 system, the 6 rotations are defined by the setter's position:

| Rotation | Setter Position | Front Row | Back Row |
|----------|----------------|-----------|----------|
| 1 | Right Back (1) | OH1, MB1, OPP | S, OH2, MB2 |
| 2 | Right Front (2) | S, OH1, MB1 | OPP, OH2, MB2 |
| 3 | Middle Front (3) | MB2, S, OH1 | MB1, OPP, OH2 |
| 4 | Left Front (4) | OH2, MB2, S | OH1, MB1, OPP |
| 5 | Left Back (5) | OPP, OH2, MB2 | S, OH1, MB1 |
| 6 | Middle Back (6) | MB1, OPP, OH2 | MB2, S, OH1 |

Note: Actual positions depend on the specific lineup. The above is a standard 5-1 reference. 6-2 rotations differ (setter hits when front row, sets when back row).

### 6.2 Rotation Strength Analysis

For each rotation, compute:

**Offensive Rotation Strength:**
- Which attackers are front row? (3 front-row attackers determine the offensive threat)
- Is the setter front row (can dump) or back row?
- Which attackers can attack from back row (pipe)?
- What quick sets are available in this rotation?

**Defensive Rotation Strength:**
- Which blockers are at the net?
- Is the strongest blocker (usually MB) front row in this rotation?
- Who is playing back-row defense?
- Is the libero in for a weak back-row player in this rotation?

**Rotation KR:**
```
Rotation_Off_KR_r = weighted average of front-row attackers' AKR + setter's SKR contribution
Rotation_Def_KR_r = weighted average of front-row blockers' BKR + back-row defenders' DKR
Rotation_KR_r = (Rotation_Off_KR_r * 0.48) + (Rotation_Def_KR_r * 0.52)
```

### 6.3 Rotation Vulnerability Detection
Flag any rotation where:
- Rotation_KR is 8+ points below the team average Rotation_KR
- No front-row attacker has AKR above 75
- The blocking front has no player with BKR above 70
- The back row has no player with DKR above 70

These rotations are exploitation targets for opponents (serve to get into this rotation, serve aggressively to score).

### 6.4 Rotation Balance Score
```
Rotation_Balance = 100 - (Max Rotation_KR - Min Rotation_KR)
```
Higher is better. A score of 95+ means the team has no significant rotation weakness. Below 85 means there is a targetable rotation.

---

## 7. OFFENSIVE SYSTEM INFERENCE ENGINE (OSIE)

If the coach has not declared an offensive system, OSIE infers it from production patterns.

### 7.1 Inference Signals

| Signal | Suggests |
|--------|---------|
| One setter plays 100% of sets | 5-1 |
| Two setters each play ~50% | 6-2 |
| High middle attack volume (35%+ of team attacks from middles) | Fast Tempo |
| High back-row attack volume (15%+ of kills from back-row attacks) | Pipe-Heavy |
| High slide attack frequency (if detectable from stats) | Slide-Heavy |
| Multiple hitters attack from multiple positions | Swing Offense |
| Middle hitting% .320+ AND high first-ball kill rate | Fast Tempo |

### 7.2 OSIE Confidence

| Data Available | OSIE Confidence |
|---------------|----------------|
| V1 stats only (kills, assists by player) | 50-65% |
| V1 + set distribution data | 65-80% |
| V2 video (rotation-level data) | 80-92% |
| V3 video deep (multi-match analysis) | 90-97% |
| Coach-declared system | 100% (locked) |

---

## 8. DEFENSIVE SYSTEM INFERENCE ENGINE (DSIE)

### 8.1 Inference Signals

| Signal | Suggests |
|--------|---------|
| High team dig rate + moderate block rate | Rotation Defense |
| High block rate + low dig rate on off-speed | Perimeter Defense |
| Balanced dig rate + one player consistently in short position | Man-Up |
| High block percentage on non-quick attacks | Read Block |
| High stuff block rate on quick attacks + lower on outside | Commit Block |

### 8.2 DSIE Confidence
Same tiers as OSIE. Defensive system is harder to infer from box score alone. V2+ video data is strongly preferred.

---

## 9. SCHOLARSHIP ALLOCATION

### 9.1 Scholarship Limits by Governing Body

| Level | Max Scholarships | Type |
|-------|-----------------|------|
| NCAA D1 | 12 full equivalents | Can be divided (partial scholarships) |
| NCAA D2 | 12 full equivalents | Can be divided |
| NCAA D3 | 0 | No athletic scholarships |
| NAIA | 8 full equivalents | Can be divided |
| NJCAA D1 | 14 tuition-only | No room/board coverage |
| NJCAA D2 | 0-limited | Varies by state |
| NJCAA D3 | 0 | No athletic aid |
| CCCAA | 0 | No athletic aid (CA community college system) |

### 9.2 Player Trade Value (PTV)
PTV estimates a player's scholarship-equivalent value based on her KR, system fit, position scarcity, and remaining eligibility.

```
PTV = Base_PTV(KR) * System_Fit_Modifier * Position_Scarcity_Modifier * Eligibility_Modifier
```

**Base_PTV by KR (as percentage of full scholarship):**

| KR Range | Base_PTV |
|----------|---------|
| 95-100 | 100% (full scholarship) |
| 90-94 | 85-100% |
| 85-89 | 65-85% |
| 80-84 | 45-65% |
| 75-79 | 25-45% |
| 70-74 | 10-25% |
| Below 70 | Walk-on / minimal aid |

**System Fit Modifier:**

| System Fit | Modifier |
|-----------|---------|
| 95-100% | 1.10 |
| 85-94% | 1.00 |
| 75-84% | 0.90 |
| Below 75% | 0.80 |

**Position Scarcity Modifier:**
If the program has a critical need at a position (e.g., no setter on the roster), the scarcity modifier for that position is 1.15. If the position is well-stocked, it is 0.95.

**Eligibility Modifier:**

| Remaining Eligibility | Modifier |
|----------------------|---------|
| 4 years | 1.15 |
| 3 years | 1.05 |
| 2 years | 1.00 |
| 1 year | 0.85 |

### 9.3 Portfolio Market Value (PMV)
PMV aggregates PTV across the full roster to estimate the total scholarship investment quality.

```
PMV = SUM(PTV_i) for all scholarship players
```

A healthy PMV allocates scholarship value across positions without over-investing at one spot or leaving a critical position unfunded.

---

## 10. ROSTER DECISION INTELLIGENCE

### 10.1 Roster Composition Targets (Standard 16-18 player roster)

| Position | Target Count | Minimum |
|----------|-------------|---------|
| Setter | 2-3 | 2 |
| Outside Hitter | 4-5 | 3 |
| Middle Blocker | 3-4 | 3 |
| Opposite | 2-3 | 2 |
| Libero | 1-2 | 1 |
| DS | 1-3 | 1 |

### 10.2 Roster Gap Analysis
Compare current roster composition against targets. Identify:
- **Critical gaps:** positions below minimum count or positions where highest KR is below 75
- **Surplus:** positions above target count where additional players add minimal team KR lift
- **Depth concerns:** positions with one strong player and no capable backup

### 10.3 Transfer Portal Intelligence
For each portal entrant:
1. Run Player Evaluation (Mode 1)
2. Compute system fit against the coach's locked system
3. Compute roster impact: what would Team KR become if this player replaced the weakest player at her position?
4. Compute PTV
5. Rank portal targets by roster impact per scholarship dollar

### 10.4 Recruiting Intelligence Integration
For high school and club recruits:
1. Project KR based on available data (club stats, MaxPreps, PrepDig ratings)
2. Project positional fit based on physical measurements and position played
3. Compute system fit probability (less certain than portal because recruiting data is lower fidelity)
4. Flag development needs (what traits need to improve for her to contribute at this level)

---

## 11. TEAM EVALUATION OUTPUT FORMAT

```
TEAM EVALUATION CARD
=====================
Team: [School]
Level: [Level] | Conference: [Conference]
Record: [W-L] | Conference Record: [W-L]
Offensive System: [System] (OSIE Confidence: [XX]%)
Defensive System: [System] (DSIE Confidence: [XX]%)

TEAM KR: [XX.X]
  Offense KR: [XX.X]
  Defense KR: [XX.X]
  System Fit%: [XX.X]%

ROTATION ANALYSIS:
  R1: [XX.X] | R2: [XX.X] | R3: [XX.X]
  R4: [XX.X] | R5: [XX.X] | R6: [XX.X]
  Best Rotation: R[X] ([XX.X])
  Weakest Rotation: R[X] ([XX.X])
  Rotation Balance: [XX.X]

TOP PLAYERS:
  1. [Player] - [Position] - KR [XX.X]
  2. [Player] - [Position] - KR [XX.X]
  3. [Player] - [Position] - KR [XX.X]

SYSTEM IDENTITY:
  [2-3 sentences describing how this team plays]

VULNERABILITIES:
  [List rotation weaknesses, system risks, depth concerns]

STRENGTHS:
  [List competitive advantages]
```

---

## 12. TEAM LEGEND (by level)

Team KR legend for contextualizing overall team quality.

### NCAA D1 Power 4 Team Legend

| Team KR Range | Label |
|--------------|-------|
| 93-100 | National Championship Contender |
| 90-92 | Final Four Caliber |
| 87-89 | Sweet 16 / Elite 8 Caliber |
| 84-86 | NCAA Tournament (Top Seed) |
| 81-83 | NCAA Tournament (At-Large / Lower Seed) |
| 78-80 | Bubble / NIT Equivalent |
| 75-77 | Conference Middle |
| 72-74 | Conference Bottom |
| Below 72 | Rebuilding |

Note: Women's volleyball uses a 64-team NCAA tournament bracket. Power 4 programs have the most at-large bids. Team KR in the 84+ range typically corresponds to tournament-caliber programs.

---

## GOVERNANCE

- Team KR does not evaluate players. It consumes finalized player outputs.
- Rotation analysis is unique to volleyball and must be computed for every team evaluation.
- System Fit% is the most predictive variable beyond raw Team KR.
- All weights, splits, and modifiers are locked. Changes require documentation, versioning, and approval.
- Roster intelligence (PTV, PMV, gap analysis) is downstream only and does not modify Team KR.
