# Men's Volleyball Simulation Engine v1

---

## 0. SCOPE

This is the single authoritative document for match simulation in men's volleyball. It covers set-by-set simulation, rally scoring mechanics, rotation-based modeling, the interaction library (offense x defense system interactions), physical mismatch modifiers, and outcome projection.

The simulation engine does not evaluate players or teams. It consumes Team KR outputs (from File 03) and produces match projections.

**Men's-specific differences from women's simulation:**
- Higher net (2.43m vs 2.24m) changes physical mismatch calculations
- Faster attacks and harder serves increase point-scoring volatility
- Rally lengths are shorter on average (more aces, more stuff blocks, more kills)
- Side-out rates are slightly lower (serving is more dominant)
- Jump serve runs are more devastating

---

## 1. MATCH STRUCTURE

Men's volleyball matches are best of 5 sets (same as women's):
- Sets 1-4: played to 25 points, win by 2 (no cap)
- Set 5: played to 15 points, win by 2 (no cap)
- Teams switch sides after each set and at 8 points in set 5

**Men's-specific implications:**
- Sets tend to be slightly faster due to shorter average rally length
- Serving runs are more common and more devastating
- Fifth sets are extremely volatile because serving dominance is amplified in shorter sets
- Leading 2-0 is a strong position (comebacks at ~13% rate in D1 men's)

---

## 2. RALLY SCORING MODEL

### 2.1 Point Distribution Model (Men's D1)

| Point Type | Approximate Share |
|-----------|------------------|
| Kills (attack terminates) | 40-44% |
| Opponent attack errors | 13-16% |
| Aces | 8-12% |
| Blocks (stuff blocks) | 9-13% |
| Opponent service errors | 9-12% |
| Other errors | 8-12% |

**Key differences from women's:** Aces are a larger share (8-12% vs 6-9%). Blocks are slightly higher. Attack errors are slightly lower because men hit at higher percentages.

### 2.2 Rally Length Model
Average rally length at the D1 men's level is approximately 4-6 contacts. Shorter than women's because:
- Jump serves ace or disrupt passing more frequently
- First-ball kills are more common (faster approach, harder hit)
- Stuff blocks are more decisive at the higher net

Long rallies (8+ contacts) favor teams with better defensive and transition game. These are rarer in men's volleyball.

---

## 3. SET SIMULATION

### 3.1 Win Probability Formula

```
Set_Win_Prob_A = sigmoid(k * (Effective_KR_A - Effective_KR_B))
```

Where:
- `k` = 0.060 for men's volleyball (slightly lower than women's 0.065, reflecting higher variance in men's sets due to serve dominance)
- `sigmoid(x) = 1 / (1 + exp(-x))`

### 3.2 Effective KR Computation

```
Effective_KR_A = Team_KR_A + System_Interaction_Modifier + Rotation_Matchup_Factor + Physical_Mismatch_Modifier + Home_Court_Modifier
```

**Home_Court_Modifier:** +1.8 KR for home team (men's volleyball has a slightly stronger home-court advantage than women's due to smaller, more intense gym atmospheres)

### 3.3 Set Score Projection

| KR Gap | Projected Winner Score |
|--------|----------------------|
| 0-3 | 25-23 (close set) |
| 4-7 | 25-20 |
| 8-12 | 25-16 |
| 13+ | 25-12 |

### 3.4 Fifth Set Adjustment
- Multiply KR gap effect by 0.80 (higher variance in men's fifth sets due to serve dominance)
- Increase home-court modifier by +0.7 (fifth sets in men's volleyball are heavily influenced by crowd)
- Switch sides at 8 creates a micro-momentum shift

---

## 4. MATCH SIMULATION

### 4.1 Match Win Probability
Same structure as women's: compute P(3-0), P(3-1), P(3-2) and sum.

### 4.2 Set Dependency
- Team that wins set 1 gets +0.5 momentum modifier for set 2
- Comeback momentum: +0.3
- Consecutive loss deflation: -0.3

### 4.3 Serving Rotation Impact
- First server: +0.4 KR for that set (stronger than women's because men's serving is more dominant)
- Men's serving runs are more common and more impactful

---

## 5. INTERACTION LIBRARY

### 5.1 Offensive System vs Defensive System (6 x 5 = 30 entries)

Each entry defines the macro environment when these two systems clash. Same structure as women's with men's-specific modifiers.

---

#### 5-1 Offense vs Rotation Defense
- **Rally Length:** Slightly shorter (men's attacks terminate faster)
- **Kill Efficiency:** +0.018 hitting%
- **Block Effectiveness:** Neutral
- **Error Rate:** Neutral
- **Net Modifier:** +0.5 to offense

#### 5-1 Offense vs Perimeter Defense
- **Rally Length:** Shorter
- **Kill Efficiency:** +0.012
- **Block Effectiveness:** +0.02 blocks/set for defense
- **Error Rate:** Slightly higher for defense
- **Net Modifier:** +0.3 to offense

#### 5-1 Offense vs Man-Up
- **Rally Length:** Longer
- **Kill Efficiency:** -0.012
- **Block Effectiveness:** Neutral
- **Net Modifier:** -0.5 to offense

#### 5-1 Offense vs Read Block
- **Rally Length:** Neutral
- **Kill Efficiency:** -0.005
- **Block Effectiveness:** +0.03 blocks/set for defense
- **Net Modifier:** -0.3 to offense

#### 5-1 Offense vs Commit Block
- **Rally Length:** Shorter
- **Kill Efficiency:** +0.022
- **Block Effectiveness:** +0.05 on committed hitter, -0.04 on others
- **Error Rate:** Higher variance
- **Net Modifier:** +0.8 to offense

---

#### 6-2 Offense vs Rotation Defense
- **Rally Length:** Neutral
- **Kill Efficiency:** +0.022
- **Block Effectiveness:** Neutral
- **Net Modifier:** +0.3 to offense

#### 6-2 Offense vs Perimeter Defense
- **Rally Length:** Shorter
- **Kill Efficiency:** +0.018
- **Net Modifier:** +0.5 to offense

#### 6-2 Offense vs Man-Up
- **Rally Length:** Longer
- **Kill Efficiency:** -0.005
- **Net Modifier:** 0.0

#### 6-2 Offense vs Read Block
- **Rally Length:** Neutral
- **Kill Efficiency:** -0.012
- **Block Effectiveness:** +0.02
- **Net Modifier:** -0.5 to offense

#### 6-2 Offense vs Commit Block
- **Rally Length:** Shorter
- **Kill Efficiency:** +0.028
- **Net Modifier:** +1.0 to offense

---

#### Swing Offense vs Rotation Defense
- **Rally Length:** Neutral
- **Kill Efficiency:** +0.020
- **Net Modifier:** +0.7 to offense

#### Swing Offense vs Perimeter Defense
- **Rally Length:** Shorter
- **Kill Efficiency:** +0.015
- **Net Modifier:** +0.5 to offense

#### Swing Offense vs Man-Up
- **Rally Length:** Longer
- **Kill Efficiency:** +0.005
- **Net Modifier:** +0.2 to offense

#### Swing Offense vs Read Block
- **Rally Length:** Neutral
- **Kill Efficiency:** +0.010
- **Block Effectiveness:** -0.02
- **Net Modifier:** +0.5 to offense

#### Swing Offense vs Commit Block
- **Rally Length:** Shorter
- **Kill Efficiency:** +0.030
- **Net Modifier:** +1.2 to offense

---

#### Fast Tempo vs Rotation Defense
- **Rally Length:** Shorter
- **Kill Efficiency:** +0.022
- **Block Effectiveness:** -0.03
- **Net Modifier:** +0.8 to offense

#### Fast Tempo vs Perimeter Defense
- **Rally Length:** Shorter
- **Kill Efficiency:** +0.018
- **Net Modifier:** +0.5 to offense

#### Fast Tempo vs Man-Up
- **Rally Length:** Neutral
- **Kill Efficiency:** +0.008
- **Net Modifier:** +0.3 to offense

#### Fast Tempo vs Read Block
- **Rally Length:** Neutral
- **Kill Efficiency:** +0.005
- **Block Effectiveness:** -0.01
- **Net Modifier:** +0.2 to offense

#### Fast Tempo vs Commit Block
- **Rally Length:** Shorter
- **Kill Efficiency:** -0.005 (commit can match quick tempo)
- **Block Effectiveness:** +0.05 on quick, -0.04 on others
- **Net Modifier:** 0.0 (commit vs fast tempo is the designed counter)

---

#### Slide-Heavy vs Rotation Defense
- **Rally Length:** Neutral
- **Kill Efficiency:** +0.020
- **Net Modifier:** +0.7 to offense

#### Slide-Heavy vs Perimeter Defense
- **Rally Length:** Shorter
- **Kill Efficiency:** +0.015
- **Net Modifier:** +0.5 to offense

#### Slide-Heavy vs Man-Up
- **Rally Length:** Longer
- **Kill Efficiency:** +0.005
- **Net Modifier:** +0.2 to offense

#### Slide-Heavy vs Read Block
- **Rally Length:** Neutral
- **Kill Efficiency:** +0.012
- **Block Effectiveness:** -0.01
- **Net Modifier:** +0.5 to offense

#### Slide-Heavy vs Commit Block
- **Rally Length:** Shorter
- **Kill Efficiency:** +0.028
- **Block Effectiveness:** -0.03
- **Net Modifier:** +1.0 to offense

---

#### Pipe-Heavy vs Rotation Defense
- **Rally Length:** Neutral
- **Kill Efficiency:** +0.018
- **Block Effectiveness:** -0.02
- **Net Modifier:** +0.5 to offense

#### Pipe-Heavy vs Perimeter Defense
- **Rally Length:** Neutral
- **Kill Efficiency:** +0.022
- **Block Effectiveness:** -0.03
- **Net Modifier:** +0.8 to offense

#### Pipe-Heavy vs Man-Up
- **Rally Length:** Longer
- **Kill Efficiency:** +0.012
- **Net Modifier:** +0.5 to offense

#### Pipe-Heavy vs Read Block
- **Rally Length:** Neutral
- **Kill Efficiency:** +0.018
- **Block Effectiveness:** +0.01 on front-row
- **Net Modifier:** +0.3 to offense

#### Pipe-Heavy vs Commit Block
- **Rally Length:** Shorter
- **Kill Efficiency:** +0.022
- **Net Modifier:** +0.8 to offense

---

## 6. ROTATION-LEVEL SIMULATION

Same structure as women's volleyball. See File 03 rotation analysis for men's-specific details.

### 6.1 Rotation Matchup Matrix (6x6)
```
Rotation_Matchup_KR_delta = Rotation_KR_A_r - Rotation_KR_B_s
```

### 6.2 Simplified Model
Compute average Rotation_Matchup_KR across all pairings, weighted by expected rally distribution.

---

## 7. PHYSICAL MISMATCH MODIFIERS

### 7.1 Net Height Advantage
Men's net: 7'11 5/8" (2.43m). Higher net means blocking geometry is different. Block touch height is even more critical.

| Height Advantage | Modifier |
|-----------------|---------|
| +6" or more | +3.5 KR to attacker's AKR |
| +4" to +5" | +2.5 KR |
| +2" to +3" | +1.0 KR |
| +/-1" | Neutral |
| -2" to -3" | -1.0 KR |
| -4" to -5" | -2.5 KR |
| -6" or more | -3.5 KR |

Note: Physical mismatch modifiers are slightly larger in men's because the higher net amplifies height/reach advantages.

### 7.2 Standing Reach Advantage
Same proxy structure as women's.

### 7.3 Aggregate Physical Mismatch Modifier
```
Physical_Mismatch_Modifier = AVG(front-row matchup modifiers)
```

---

## 8. SPECIAL SIMULATION SCENARIOS

### 8.1 Serving Run Simulation
Men's serving runs are more dangerous than women's due to jump serve dominance.

- If server's SVR is 85+, increase probability of consecutive points by 7% per rally
- If server's SVR is 75-84, +3% per rally
- Below 75, no modifier

### 8.2 Side-Out Simulation
Men's D1 average side-out rate is approximately 60% (lower than women's ~62% because serving is more dominant).

```
Side_Out_Rate_A = Base_Rate + (Team_Off_KR_A - Team_Def_KR_B) * 0.004 + Pass_Quality_Modifier
```
Where Base_Rate = 0.60

### 8.3 Timeout Impact
Same structure as women's.

### 8.4 Substitution Modeling
Same patterns: MB/libero substitution in back row, DS substitution for back-row rotations.

---

## 9. SIMULATION OUTPUT FORMAT

Same structure as women's simulation output. See women's File 04 Section 9 for the full template.

---

## GOVERNANCE

- Simulation engine consumes Team KR only. It does not evaluate players or teams.
- All interaction library entries are locked.
- Physical mismatch modifiers use objective measurements only.
- Home-court modifier is fixed at +1.8 KR for men's.
- Fifth set adjustment factor is 0.80x talent gap multiplier.
- Side-out base rate calibrated to D1 men's average (0.60).
- Serving run modifiers are higher than women's to reflect the jump serve's dominance.
