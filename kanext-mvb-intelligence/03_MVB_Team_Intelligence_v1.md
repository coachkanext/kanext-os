# Men's Volleyball Team Intelligence v1

---

## 0. SCOPE

This is the single authoritative document for Team KR computation, system inference (OSIE/DSIE), rotation analysis, scholarship allocation (4.5 equivalents), and roster construction intelligence for men's volleyball.

Team KR is the rotation-weighted aggregation of players' system-adjusted KRs. It does not evaluate players. It consumes finalized player outputs from upstream.

**CRITICAL MEN'S VOLLEYBALL CONTEXT:** Only ~50 NCAA men's volleyball programs exist. The scholarship limit is 4.5 (not women's 12). Most roster players are walk-ons or on partial scholarships. This fundamentally changes every aspect of team intelligence.

---

## 1. INPUTS (Non-Negotiable)

**Per player in rotation:**
- Final_System_Off_KR_i (from Player System Fit layer)
- Final_System_Def_KR_i (from Player System Fit layer)
- Sets played
- Attack attempts / Set
- Offensive archetype demand tier (A/B/C/No-match)
- Defensive archetype demand tier (A/B/C/No-match)
- Height (inches), Standing Reach (inches, if available), Block Touch (inches, if available)
- Position (S, OH, MB, OPP, L, DS)
- Scholarship status (full, partial with %, walk-on) - critical for men's VB

**Per program (from Coach Context Setup):**
- Governing Body / Division
- Conference
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

Same formula structure as women's volleyball.

### Three inputs:
1. **Attack Volume%** - (50% of weight when available)
2. **Sets%** - (25% of weight)
3. **System Role Score** - (25% of weight)

### Data Tier Formulas

**Tier 1 - Full data:**
```
Off_Weight_Raw_i = (AttackVol%_i * 0.50) + (Sets%_i * 0.25) + (Off_Role_Score_i * 0.25)
```

**Tier 2 - Limited data:**
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
Same as women's: in 5-1, setter's Off_Weight_Raw = MEDIAN of all other included players.

### Normalization
```
Off_Weight_i = Off_Weight_Raw_i / SUM(Off_Weight_Raw)
```

---

## 4. DEFENSIVE WEIGHT PER PLAYER

Same structure as women's.

```
Def_Weight_Raw_i = (Sets%_i * 0.60) + (Def_Role_Score_i * 0.40)
```

Libero Defensive Weight Override: same treatment (always Demand Tier A).

```
Def_Weight_i = Def_Weight_Raw_i / SUM(Def_Weight_Raw)
```

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

Men's volleyball is slightly more offense-dominant than women's because the serve and attack are more lethal weapons. The offense/defense split reflects this.

| Level | Off Split | Def Split |
|-------|----------|----------|
| NCAA D1 | 50% | 50% |
| NCAA D2 | 48% | 52% |
| NCAA D3 | 47% | 53% |
| Pro (all leagues) | 51% | 49% |

```
Team_KR = (Team_Off_KR * Off_Split) + (Team_Def_KR * Def_Split)
```

### 5.4 System Fit Percentage
```
System_Fit% = (Count of players with Demand Tier A or B) / (Total rotation players) * 100
```

Adjustment: If all critical positions (Demand Tier A) are filled, add 5% bonus. If any critical position is unfilled or No-match, subtract 5% penalty.

**System Fit% is the most predictive variable beyond raw Team KR.** Teams above 97% fit consistently overperform raw Team KR by 3-4 points.

---

## 6. ROTATION ANALYSIS

### 6.1 The 6 Rotations
Standard 5-1 rotation structure (same as women's).

| Rotation | Setter Position | Front Row | Back Row |
|----------|----------------|-----------|----------|
| 1 | Right Back (1) | OH1, MB1, OPP | S, OH2, MB2 |
| 2 | Right Front (2) | S, OH1, MB1 | OPP, OH2, MB2 |
| 3 | Middle Front (3) | MB2, S, OH1 | MB1, OPP, OH2 |
| 4 | Left Front (4) | OH2, MB2, S | OH1, MB1, OPP |
| 5 | Left Back (5) | OPP, OH2, MB2 | S, OH1, MB1 |
| 6 | Middle Back (6) | MB1, OPP, OH2 | MB2, S, OH1 |

### 6.2 Rotation Strength Analysis
Same computation structure as women's but with men's-specific weighting.

**Rotation KR:**
```
Rotation_Off_KR_r = weighted average of front-row attackers' AKR + setter's SKR contribution
Rotation_Def_KR_r = weighted average of front-row blockers' BKR + back-row defenders' DKR
Rotation_KR_r = (Rotation_Off_KR_r * 0.50) + (Rotation_Def_KR_r * 0.50)
```

### 6.3 Rotation Vulnerability Detection
Flag any rotation where:
- Rotation_KR is 8+ points below the team average
- No front-row attacker has AKR above 75
- The blocking front has no player with BKR above 70
- The back row has no player with DKR above 70

### 6.4 Rotation Balance Score
```
Rotation_Balance = 100 - (Max Rotation_KR - Min Rotation_KR)
```

---

## 7. OFFENSIVE SYSTEM INFERENCE ENGINE (OSIE)

Same inference signals as women's volleyball. Key men's note: 5-1 is more dominant in men's college volleyball than 6-2.

### 7.1 OSIE Confidence
Same tiers as women's.

---

## 8. DEFENSIVE SYSTEM INFERENCE ENGINE (DSIE)

Same inference signals as women's volleyball. Key men's note: Read Block is the most common at D1. Commit Block is riskier in men's volleyball because the faster tempo gives the committed blocker less recovery time.

---

## 9. SCHOLARSHIP ALLOCATION

### 9.1 THE 4.5 SCHOLARSHIP REALITY

**This is the single most important differentiator in men's volleyball roster management.**

| Level | Max Scholarships | Type |
|-------|-----------------|------|
| NCAA D1 | 4.5 full equivalents | Can be divided (partial scholarships) |
| NCAA D2 | 4.5 full equivalents | Can be divided |
| NCAA D3 | 0 | No athletic scholarships |

**4.5 scholarships for a roster of 18-22 players means:**
- Most players are walk-ons or receive minimal scholarship aid
- Scholarship allocation decisions are dramatically more impactful than in any other sport
- A full scholarship to one player consumes 22% of the total scholarship budget
- Programs that split scholarships wisely have a competitive advantage
- International recruiting (where players may need more aid) creates unique scholarship pressure
- Walk-on talent identification is a critical coaching skill

### 9.2 Scholarship Distribution Strategies

**Strategy A: Anchor Model (2 full + 5 partials)**
Give full rides to 2 elite players (usually setter + one attacker) and split remaining 2.5 across 5 players at 50%.
- Advantage: Locks in elite talent at critical positions
- Risk: If either full-ride player transfers or is injured, massive value loss

**Strategy B: Spread Model (9 players at 50%)**
Spread 4.5 across 9 players at 50% each.
- Advantage: More players with aid = more committed roster
- Risk: May not be enough to attract elite talent away from full-ride offers

**Strategy C: Premium Model (1 full + 3 at 75% + 3 at 25%)**
One full ride to the best player, strong partials for 3 key starters, small grants for 3 others.
- Advantage: Tiered investment matches contribution
- Risk: Walk-on depth remains a concern

**Strategy D: International-Heavy (2 international at 100% + domestic splits)**
Many programs use scholarship to attract international talent that cannot come without aid. Domestic walk-ons fill the rest.
- Advantage: International talent can be transformative
- Risk: Cultural adjustment, visa issues, and limited domestic depth

### 9.3 Player Trade Value (PTV)
PTV estimates a player's scholarship-equivalent value based on KR, system fit, position scarcity, and remaining eligibility.

```
PTV = Base_PTV(KR) * System_Fit_Modifier * Position_Scarcity_Modifier * Eligibility_Modifier * Walk_On_Adjustment
```

**Base_PTV by KR (as percentage of full scholarship):**

| KR Range | Base_PTV |
|----------|---------|
| 95-100 | 100% (full scholarship - only for truly elite players) |
| 90-94 | 75-100% |
| 85-89 | 50-75% |
| 80-84 | 30-50% |
| 75-79 | 15-30% |
| 70-74 | 5-15% |
| Below 70 | Walk-on / minimal aid |

**System Fit Modifier:**
| System Fit | Modifier |
|-----------|---------|
| 95-100% | 1.10 |
| 85-94% | 1.00 |
| 75-84% | 0.90 |
| Below 75% | 0.80 |

**Position Scarcity Modifier:**
If the program has a critical need (e.g., no setter), scarcity modifier = 1.20. Well-stocked = 0.95.

**Men's volleyball scarcity context:** Setters are the scarcest commodity. There are fewer available setters in the men's pipeline than any other position. The scarcity modifier for setter should almost always be 1.15+.

**Eligibility Modifier:**
| Remaining Eligibility | Modifier |
|----------------------|---------|
| 4 years | 1.15 |
| 3 years | 1.05 |
| 2 years | 1.00 |
| 1 year | 0.85 |

**Walk-On Adjustment:**
For players who are walk-ons but producing at scholarship-caliber levels, PTV calculation identifies the gap between their contribution and their compensation. This is the "walk-on surplus" - value the program is getting for free.

### 9.4 Portfolio Market Value (PMV)
```
PMV = SUM(PTV_i) for all scholarship players
```

A healthy PMV in men's volleyball is constrained by the 4.5 limit. The goal is to maximize return per scholarship dollar. A PMV analysis should always include the walk-on surplus to show total roster value vs scholarship investment.

### 9.5 Walk-On Intelligence
Because walk-ons constitute 75%+ of men's volleyball rosters, the system must track:
- Walk-on retention rates (do they stay for 4 years?)
- Walk-on development curves (how much do they improve?)
- Walk-on contribution rates (what % of walk-ons become rotation players?)
- Walk-on-to-scholarship conversion (programs that earn trust by eventually adding scholarships for contributing walk-ons retain talent)

---

## 10. ROSTER DECISION INTELLIGENCE

### 10.1 Roster Composition Targets (Standard 18-22 player roster)

| Position | Target Count | Minimum |
|----------|-------------|---------|
| Setter | 2-3 | 2 |
| Outside Hitter | 4-6 | 4 |
| Middle Blocker | 4-5 | 3 |
| Opposite | 2-3 | 2 |
| Libero | 1-2 | 1 |
| DS | 2-4 | 1 |

**Men's rosters are larger** than women's (18-22 vs 16-18) because walk-ons increase roster size and programs need practice bodies given the lack of scholarship depth.

### 10.2 Roster Gap Analysis
Compare current roster composition against targets. Identify:
- **Critical gaps:** positions below minimum count or positions where highest KR is below 75
- **Surplus:** positions above target count
- **Depth concerns:** positions with one strong player and no capable backup
- **Walk-on pipeline:** are there walk-ons developing toward rotation readiness?

### 10.3 Transfer Portal Intelligence
Same structure as women's but with men's-specific context:
- Men's portal is smaller (fewer programs = fewer available players)
- International transfers are a significant portion of the portal
- Scholarship constraints mean portal pickups must be efficient (high KR relative to scholarship required)

### 10.4 Recruiting Intelligence Integration
Same structure as women's. Additional men's notes:
- Recruiting pipeline is smaller (fewer club programs, fewer high school programs)
- Multi-sport athletes are common (baseball/volleyball overlap in spring)
- International recruiting is a major differentiator for top programs
- Late development is common (many men start volleyball later than women)

### 10.5 Spring Season Scheduling Considerations
**NCAA men's volleyball is a spring sport (January-May).** This creates unique challenges:
- Gym sharing with basketball (some programs share arenas)
- Competition for multi-sport athletes with baseball and track
- Final exam conflicts with NCAA tournament timing
- Limited fall competitive schedule (only fall tournaments/scrimmages, not conference play)
- Recruiting periods overlap with other spring sport coaching obligations

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

ROSTER COMPOSITION:
  Total Roster: [XX] players
  Scholarship Players: [XX] (of 4.5 equivalents)
  Walk-Ons: [XX]
  International Players: [XX]

ROTATION ANALYSIS:
  R1: [XX.X] | R2: [XX.X] | R3: [XX.X]
  R4: [XX.X] | R5: [XX.X] | R6: [XX.X]
  Best Rotation: R[X] ([XX.X])
  Weakest Rotation: R[X] ([XX.X])
  Rotation Balance: [XX.X]

TOP PLAYERS:
  1. [Player] - [Position] - KR [XX.X] - [Scholarship/Walk-on]
  2. [Player] - [Position] - KR [XX.X] - [Scholarship/Walk-on]
  3. [Player] - [Position] - KR [XX.X] - [Scholarship/Walk-on]

SYSTEM IDENTITY:
  [2-3 sentences describing how this team plays]

VULNERABILITIES:
  [List rotation weaknesses, system risks, depth concerns]

STRENGTHS:
  [List competitive advantages]

SCHOLARSHIP EFFICIENCY:
  PMV: [XX.X] | Walk-On Surplus: [XX.X]
  Scholarship ROI: [Analysis of value per scholarship dollar]
```

---

## 12. TEAM LEGEND (by level)

### NCAA D1 Men's Team Legend

| Team KR Range | Label |
|--------------|-------|
| 93-100 | National Championship Contender |
| 90-92 | Final Four Caliber |
| 87-89 | NCAA Tournament (Sweet 16 / Elite 8) |
| 84-86 | NCAA Tournament (First/Second Round) |
| 81-83 | NCAA Tournament Bubble |
| 78-80 | Conference Contender |
| 75-77 | Conference Middle |
| 72-74 | Conference Bottom |
| Below 72 | Rebuilding |

Note: Men's volleyball uses a smaller NCAA tournament bracket (typically 7-8 teams at the D1 level) with fewer automatic qualifiers. Tournament bids are scarce, making the bubble much tighter than women's.

---

## GOVERNANCE

- Team KR does not evaluate players. It consumes finalized player outputs.
- Rotation analysis is mandatory for every team evaluation.
- System Fit% is the most predictive variable beyond raw Team KR.
- All weights, splits, and modifiers are locked.
- Scholarship intelligence (4.5 limit, PTV, PMV, walk-on analysis) is critical for men's volleyball and must be included in every team evaluation.
- Spring season scheduling context should be noted when relevant.
