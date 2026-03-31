# Women's Volleyball Simulation Engine v1

---

## 0. SCOPE

This is the single authoritative document for match simulation in women's volleyball. It covers set-by-set simulation, rally scoring mechanics, rotation-based modeling, the interaction library (offense x defense system interactions), physical mismatch modifiers, and outcome projection.

The simulation engine does not evaluate players or teams. It consumes Team KR outputs (from File 03) and produces match projections.

---

## 1. MATCH STRUCTURE

Women's volleyball matches are best of 5 sets:
- Sets 1-4: played to 25 points, win by 2 (no cap)
- Set 5: played to 15 points, win by 2 (no cap)
- Teams switch sides after each set and at 8 points in set 5
- A team must win 3 sets to win the match

**Implications for simulation:**
- Each set is a semi-independent contest (momentum carries somewhat, but set resets matter)
- A team can win a match 3-0, 3-1, or 3-2
- Fifth sets are shorter and more volatile (15 vs 25 points means fewer rallies for regression to the mean)
- Leading 2-0 is a strong position but not insurmountable (comebacks happen at ~15% rate in D1)

---

## 2. RALLY SCORING MODEL

Every rally results in a point. Points are scored on:
- Kill (attack terminates the rally)
- Block (stuff block returns ball and it drops on attacker's side)
- Ace (serve is not returned)
- Opponent error (attack error, service error, ball-handling error, net violation, rotation fault)

### 2.1 Point Distribution Model

At the D1 Power 4 level, the approximate distribution of points scored is:

| Point Type | Approximate Share |
|-----------|------------------|
| Kills (attack terminates) | 38-42% |
| Opponent attack errors | 15-18% |
| Aces | 6-9% |
| Blocks (stuff blocks) | 8-12% |
| Opponent service errors | 8-10% |
| Other errors (ball handling, net, etc.) | 10-14% |

### 2.2 Rally Length Model
Average rally length at the D1 level is approximately 5-7 contacts. Rallies end quickly when:
- Serve is an ace or error (1 contact)
- First-ball kill (3 contacts: pass, set, attack)
- Stuff block (4 contacts)

Long rallies (10+ contacts) favor teams with better defensive and transition game.

---

## 3. SET SIMULATION

### 3.1 Win Probability Formula

The probability that Team A wins a single set against Team B:

```
Set_Win_Prob_A = sigmoid(k * (Effective_KR_A - Effective_KR_B))
```

Where:
- `Effective_KR` incorporates Team KR, system interaction modifier, and rotation matchup factor
- `k` is the scaling constant (calibrated to 0.065 for volleyball, reflecting the higher variance in set outcomes compared to full games in other sports)
- `sigmoid(x) = 1 / (1 + exp(-x))`

### 3.2 Effective KR Computation

```
Effective_KR_A = Team_KR_A + System_Interaction_Modifier + Rotation_Matchup_Factor + Physical_Mismatch_Modifier + Home_Court_Modifier
```

**System_Interaction_Modifier:** Looked up from the Interaction Library (Section 5)
**Rotation_Matchup_Factor:** Based on rotation-level analysis (Section 6)
**Physical_Mismatch_Modifier:** Based on net-height advantages (Section 7)
**Home_Court_Modifier:** +1.5 KR for home team (volleyball has a measurable home-court advantage)

### 3.3 Set Score Projection

Given a set win probability, project the expected score:

**If Team A wins the set:**
- Expected score: 25 to (25 - margin), where margin is proportional to KR gap
- KR gap 0-3: projected 25-23 (close set)
- KR gap 4-7: projected 25-20
- KR gap 8-12: projected 25-16
- KR gap 13+: projected 25-12

**If Team B wins the set:** Mirror of above.

### 3.4 Fifth Set Adjustment
Fifth sets are played to 15 and exhibit higher variance:
- Multiply the KR gap effect by 0.85 (reduced impact of talent gap in short set)
- Increase home-court modifier by +0.5 (fifth sets are more influenced by crowd)
- Switch sides at 8 creates a micro-momentum shift

---

## 4. MATCH SIMULATION

### 4.1 Match Win Probability

Run set-by-set simulation to project match outcome:

```
P(3-0) = P(A wins S1) * P(A wins S2) * P(A wins S3)
P(3-1) = combinations of A winning 3 of 4 sets with B winning 1
P(3-2) = combinations of A winning 3 of 5 sets with B winning 2
P(A wins match) = P(3-0) + P(3-1) + P(3-2)
```

### 4.2 Set Dependency
Sets are not fully independent. Momentum carries between sets:
- Team that wins set 1 gets +0.5 momentum modifier for set 2
- Team that wins a set after losing the previous set gets +0.3 (comeback momentum)
- Team that loses 2 consecutive sets gets -0.3 (deflation modifier)
- These modifiers are additive to Effective_KR for subsequent sets

### 4.3 Serving Rotation Impact
The team serving first in each set has a slight advantage (serves are pressure, first serve sets the tone):
- First server in a set: +0.3 KR for that set
- Home team typically serves first in set 1 (by choice)
- Alternates thereafter

---

## 5. INTERACTION LIBRARY

### 5.1 Offensive System vs Defensive System (6 x 5 = 30 entries)

Each entry defines the macro environment when these two systems clash.

**Outputs per entry:**
- Rally Length Impact (shorter/neutral/longer than average)
- Kill Efficiency Shift (+ or - hitting% modifier for the offensive team)
- Block Effectiveness Shift (+ or - block rate modifier for the defensive team)
- Error Rate Impact (higher/lower error rates for each side)
- Net KR Modifier (added to Effective_KR of the offensive team)

---

#### 5-1 Offense vs Rotation Defense
- **Rally Length:** Neutral
- **Kill Efficiency:** +0.015 hitting% (5-1 can attack from all positions, rotation defense covers tips but gives up power angles)
- **Block Effectiveness:** Neutral
- **Error Rate:** Neutral
- **Net Modifier:** +0.5 to offense

#### 5-1 Offense vs Perimeter Defense
- **Rally Length:** Shorter (more first-ball kills for offense, more stuff blocks for defense)
- **Kill Efficiency:** +0.010 (perimeter defense leaves the middle open for tips)
- **Block Effectiveness:** +0.02 blocks/set for defense (perimeter relies on blocks channeling)
- **Error Rate:** Slightly higher for defense (tips fall)
- **Net Modifier:** +0.3 to offense

#### 5-1 Offense vs Man-Up
- **Rally Length:** Longer (man-up covers tips, extends rallies)
- **Kill Efficiency:** -0.010 (tip/tool options are taken away)
- **Block Effectiveness:** Neutral
- **Error Rate:** Neutral
- **Net Modifier:** -0.5 to offense (man-up neutralizes the versatile 5-1 attack)

#### 5-1 Offense vs Read Block
- **Rally Length:** Neutral
- **Kill Efficiency:** -0.005 (read block adjusts to set location)
- **Block Effectiveness:** +0.03 blocks/set for defense
- **Error Rate:** Slightly higher for offense (blocks force errors)
- **Net Modifier:** -0.3 to offense

#### 5-1 Offense vs Commit Block
- **Rally Length:** Neutral to shorter
- **Kill Efficiency:** +0.020 (if commit goes to wrong hitter, offense gets free swings)
- **Block Effectiveness:** +0.04 blocks/set on committed hitter, -0.03 on others
- **Error Rate:** Higher variance for both sides
- **Net Modifier:** +0.8 to offense (commit block is high risk against a versatile 5-1)

---

#### 6-2 Offense vs Rotation Defense
- **Rally Length:** Neutral
- **Kill Efficiency:** +0.020 (6 front-row attackers puts constant pressure)
- **Block Effectiveness:** Neutral
- **Error Rate:** Slightly higher for offense (two setters = less consistency)
- **Net Modifier:** +0.3 to offense

#### 6-2 Offense vs Perimeter Defense
- **Rally Length:** Shorter
- **Kill Efficiency:** +0.015
- **Block Effectiveness:** Neutral
- **Error Rate:** Neutral
- **Net Modifier:** +0.5 to offense

#### 6-2 Offense vs Man-Up
- **Rally Length:** Longer
- **Kill Efficiency:** -0.005
- **Block Effectiveness:** Neutral
- **Error Rate:** Neutral
- **Net Modifier:** 0.0 (neutral matchup)

#### 6-2 Offense vs Read Block
- **Rally Length:** Neutral
- **Kill Efficiency:** -0.010
- **Block Effectiveness:** +0.02 for defense
- **Error Rate:** Neutral
- **Net Modifier:** -0.5 to offense

#### 6-2 Offense vs Commit Block
- **Rally Length:** Shorter
- **Kill Efficiency:** +0.025 (more front-row options = commit block is risky)
- **Block Effectiveness:** Mixed
- **Error Rate:** Higher variance
- **Net Modifier:** +1.0 to offense

---

#### Swing Offense vs Rotation Defense
- **Rally Length:** Neutral
- **Kill Efficiency:** +0.025 (misdirection creates open swings)
- **Block Effectiveness:** -0.02 for defense (blockers confused by movement)
- **Error Rate:** Slightly higher for offense (complex system = more errors in execution)
- **Net Modifier:** +1.0 to offense (swing offense is designed to beat standard defenses)

#### Swing Offense vs Perimeter Defense
- **Rally Length:** Shorter
- **Kill Efficiency:** +0.020
- **Block Effectiveness:** -0.03 for defense (misdirection defeats static perimeter)
- **Error Rate:** Neutral
- **Net Modifier:** +1.2 to offense

#### Swing Offense vs Man-Up
- **Rally Length:** Longer
- **Kill Efficiency:** +0.010 (man-up covers tips but swing offense creates power angles)
- **Block Effectiveness:** -0.01 for defense
- **Error Rate:** Neutral
- **Net Modifier:** +0.5 to offense

#### Swing Offense vs Read Block
- **Rally Length:** Neutral
- **Kill Efficiency:** +0.005 (read block handles swing better than commit)
- **Block Effectiveness:** +0.01 for defense
- **Error Rate:** Neutral
- **Net Modifier:** +0.3 to offense (read block is the best counter to swing)

#### Swing Offense vs Commit Block
- **Rally Length:** Shorter
- **Kill Efficiency:** +0.035 (commit block is devastated by misdirection)
- **Block Effectiveness:** -0.04 for defense
- **Error Rate:** Higher for defense
- **Net Modifier:** +1.8 to offense (worst possible defensive scheme against swing)

---

#### Fast Tempo vs Rotation Defense
- **Rally Length:** Shorter (first-ball kills end rallies quickly)
- **Kill Efficiency:** +0.030 (tempo beats rotation to the punch)
- **Block Effectiveness:** -0.03 for defense (cannot set block in time)
- **Error Rate:** Higher for offense if passing breaks down
- **Net Modifier:** +1.2 to offense (when passing is good)

#### Fast Tempo vs Perimeter Defense
- **Rally Length:** Shorter
- **Kill Efficiency:** +0.025
- **Block Effectiveness:** -0.03 for defense
- **Error Rate:** Neutral
- **Net Modifier:** +1.0 to offense

#### Fast Tempo vs Man-Up
- **Rally Length:** Neutral
- **Kill Efficiency:** +0.015 (fast tempo creates some but not all the openings man-up covers)
- **Block Effectiveness:** -0.02 for defense
- **Error Rate:** Neutral
- **Net Modifier:** +0.5 to offense

#### Fast Tempo vs Read Block
- **Rally Length:** Neutral to shorter
- **Kill Efficiency:** +0.020 (speed beats read reaction time)
- **Block Effectiveness:** -0.02 for defense
- **Error Rate:** Neutral
- **Net Modifier:** +0.8 to offense

#### Fast Tempo vs Commit Block
- **Rally Length:** Shorter
- **Kill Efficiency:** -0.005 (commit block is DESIGNED to stop quick tempo)
- **Block Effectiveness:** +0.05 for defense on quick attacks
- **Error Rate:** Higher for both
- **Net Modifier:** -0.5 to offense (commit block is the counter to fast tempo, but risky if tempo team spreads attack)

---

#### Slide-Heavy vs Rotation Defense
- **Rally Length:** Neutral
- **Kill Efficiency:** +0.015
- **Block Effectiveness:** -0.02 for defense
- **Error Rate:** Neutral
- **Net Modifier:** +0.5 to offense

#### Slide-Heavy vs Perimeter Defense
- **Rally Length:** Neutral
- **Kill Efficiency:** +0.020
- **Block Effectiveness:** -0.02 for defense
- **Error Rate:** Neutral
- **Net Modifier:** +0.7 to offense

#### Slide-Heavy vs Man-Up
- **Rally Length:** Longer
- **Kill Efficiency:** +0.005
- **Block Effectiveness:** Neutral
- **Error Rate:** Neutral
- **Net Modifier:** +0.2 to offense

#### Slide-Heavy vs Read Block
- **Rally Length:** Neutral
- **Kill Efficiency:** +0.010 (slides challenge read timing)
- **Block Effectiveness:** -0.01 for defense
- **Error Rate:** Neutral
- **Net Modifier:** +0.5 to offense

#### Slide-Heavy vs Commit Block
- **Rally Length:** Shorter
- **Kill Efficiency:** +0.025 (commit to quick leaves slide wide open)
- **Block Effectiveness:** -0.03 for defense
- **Error Rate:** Neutral
- **Net Modifier:** +1.0 to offense

---

#### Pipe-Heavy vs Rotation Defense
- **Rally Length:** Neutral
- **Kill Efficiency:** +0.015 (back-row attack adds dimension rotation defense does not cover well)
- **Block Effectiveness:** -0.02 for defense (cannot block back-row attacks)
- **Error Rate:** Slightly higher for offense (pipe attacks are lower percentage)
- **Net Modifier:** +0.5 to offense

#### Pipe-Heavy vs Perimeter Defense
- **Rally Length:** Neutral
- **Kill Efficiency:** +0.020 (pipe attacks exploit gaps between perimeter defenders)
- **Block Effectiveness:** -0.03 for defense
- **Error Rate:** Neutral
- **Net Modifier:** +0.8 to offense

#### Pipe-Heavy vs Man-Up
- **Rally Length:** Longer (man-up player covers short, pipe goes over)
- **Kill Efficiency:** +0.010
- **Block Effectiveness:** -0.01 for defense
- **Error Rate:** Neutral
- **Net Modifier:** +0.5 to offense

#### Pipe-Heavy vs Read Block
- **Rally Length:** Neutral
- **Kill Efficiency:** +0.015 (pipe is unblockable by design, but read block adjusts to front-row options)
- **Block Effectiveness:** +0.01 for defense on front-row attacks
- **Error Rate:** Neutral
- **Net Modifier:** +0.3 to offense

#### Pipe-Heavy vs Commit Block
- **Rally Length:** Shorter
- **Kill Efficiency:** +0.020 (pipe is completely unaffected by commit block)
- **Block Effectiveness:** Mixed
- **Error Rate:** Neutral
- **Net Modifier:** +0.8 to offense

---

## 6. ROTATION-LEVEL SIMULATION

### 6.1 Rotation Matchup Matrix
For each pair of opposing rotations (Team A rotation r vs Team B rotation s), compute:

```
Rotation_Matchup_KR_delta = Rotation_KR_A_r - Rotation_KR_B_s
```

This produces a 6x6 matrix of rotation advantages.

### 6.2 Serving Rotation Sequence
Each team serves in a fixed order (based on their rotation). The serving team's rotation determines:
- Who is serving (SVR matters)
- What rotation the serving team is in for defense
- What rotation the receiving team is in for serve receive and offense

### 6.3 Rotation-Weighted Set Simulation
Rather than using one aggregate Team KR for the entire set, the rotation-weighted simulation:
1. Cycles through rotations as points are scored
2. Applies the rotation-specific matchup for each rally
3. Produces a point-by-point simulation that captures the rotation cycling

**Simplified model (for computational efficiency):**
- Compute average Rotation_Matchup_KR across all rotation pairings
- Weight by the expected number of rallies each rotation pairing will face (roughly equal in a 25-point set, ~4 rallies per rotation)

---

## 7. PHYSICAL MISMATCH MODIFIERS

### 7.1 Net Height Advantage
Height at the net is the primary physical mismatch in women's volleyball (net height: 7'4 1/8" / 2.24m).

**Block Touch Height** is the key measurement: how high a player can reach with both arms while jumping at the net.

**Mismatch Computation:**
```
For each front-row matchup (attacker vs blocker):
Height_Advantage = Attacker_Block_Touch - Blocker_Block_Touch
```

| Height Advantage | Modifier |
|-----------------|---------|
| +6" or more | +3.0 KR to attacker's AKR for this matchup |
| +4" to +5" | +2.0 KR |
| +2" to +3" | +1.0 KR |
| +/-1" | Neutral |
| -2" to -3" | -1.0 KR to attacker (blocker advantage) |
| -4" to -5" | -2.0 KR |
| -6" or more | -3.0 KR |

### 7.2 Standing Reach Advantage
For blocking matchups where block touch is unavailable, use standing reach as a proxy:

```
Reach_Advantage = Blocker_Standing_Reach - Attacker_Standing_Reach
```

Positive values favor the blocker (taller block).

### 7.3 Lateral Quickness
Not directly measurable at V1. At V2+ with video data, lateral quickness affects blocking range (can the MB slide to help on an outside set?).

### 7.4 Aggregate Physical Mismatch Modifier
Sum all front-row physical mismatch modifiers across the 3 net positions, divide by 3 to average:

```
Physical_Mismatch_Modifier = AVG(front-row matchup modifiers)
```

This is added to Effective_KR for the team with the net advantage.

---

## 8. SPECIAL SIMULATION SCENARIOS

### 8.1 Serving Run Simulation
In volleyball, a team scores consecutive points while one player serves (a "run"). Long serving runs are game-changing.

**Modeling serving runs:**
- If server's SVR is 85+, increase probability of consecutive points by 5% per rally during the run
- If server's SVR is 75-84, +2% per rally
- Below 75, no modifier
- Runs end on a side-out (other team wins the rally)

### 8.2 Side-Out Simulation
Side-out is the receiving team's ability to win the rally on the opponent's serve. Elite teams side-out at 65-70%. Side-out percentage is the single most important team metric in volleyball.

```
Side_Out_Rate_A = Base_Rate + (Team_Off_KR_A - Team_Def_KR_B) * 0.004 + Pass_Quality_Modifier
```

Where Base_Rate = 0.62 (D1 Power 4 average) and Pass_Quality_Modifier is based on the receiving team's serve receive quality.

### 8.3 Timeout Impact
Timeouts in volleyball are used to break serving runs. The model:
- After a 3-point serving run, a timeout is assumed
- Post-timeout, the serving run momentum modifier resets to 0
- The team calling timeout gets a +0.3 "reset" modifier for the next 2 rallies

### 8.4 Substitution Modeling
Volleyball allows 15 substitutions per set (NCAA rules). Common substitution patterns:
- MB subs out for libero in back row (in 4 of 6 rotations for each MB)
- DS subs in for OH or OPP in back row
- Setter may sub with a DS in some rotations (rare at high levels)

The simulation should model these substitutions by using the appropriate player's KR for back-row rotations.

---

## 9. SIMULATION OUTPUT FORMAT

```
MATCH SIMULATION
================
[Team A] vs [Team B]
Location: [Venue] | [Team A Home / Team B Home / Neutral]

Team A KR: [XX.X] | Effective KR: [XX.X]
Team B KR: [XX.X] | Effective KR: [XX.X]
System Interaction: [Offense vs Defense description]

MATCH PREDICTION:
  Team A Win%: [XX.X]%
  Team B Win%: [XX.X]%

SET-BY-SET PROJECTION:
  Set 1: Team A [XX]% | Projected: [Score]
  Set 2: Team A [XX]% | Projected: [Score]
  Set 3: Team A [XX]% | Projected: [Score]
  Set 4 (if needed): Team A [XX]%
  Set 5 (if needed): Team A [XX]%

MOST LIKELY OUTCOMES:
  Team A 3-0: [XX]%
  Team A 3-1: [XX]%
  Team A 3-2: [XX]%
  Team B 3-2: [XX]%
  Team B 3-1: [XX]%
  Team B 3-0: [XX]%

ROTATION MATCHUP HIGHLIGHTS:
  [Team A's strongest rotation vs Team B's weakest]
  [Key physical mismatches at the net]
  [Serving matchup advantages]

KEY LEVERAGE POINTS:
  [What must happen for underdog to win]
  [Which rotations to exploit]
  [Serving strategies]
```

---

## GOVERNANCE

- Simulation engine consumes Team KR and rotation-level data. It does not evaluate players or teams.
- All interaction library entries are locked. Changes require documentation and versioning.
- Physical mismatch modifiers use objective measurements (height, reach, touch) only.
- Home-court modifier is fixed at +1.5 KR.
- Fifth set adjustment factor is fixed at 0.85x talent gap multiplier.
- Serving run and side-out models are calibrated to D1 Power 4 averages and may need level-specific adjustment for lower levels.
