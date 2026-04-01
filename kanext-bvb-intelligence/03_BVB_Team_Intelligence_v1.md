# Beach Volleyball Team Intelligence v1

---

## 0. SCOPE

This is the single authoritative document for Partnership KR computation, Squad KR (college 6-pair roster), pair chemistry scoring, pair optimization, and scholarship allocation intelligence for beach volleyball.

Beach volleyball "team intelligence" operates at two levels:
1. **Partnership Level:** Two players forming a pair. Partnership KR is the fundamental team unit.
2. **Squad Level (College Only):** A college team fields 6 pairs in a dual match. Squad KR evaluates the full roster.

Partnership KR is the chemistry-weighted aggregation of two players' system-adjusted KRs. It does not evaluate individual players. It consumes finalized player outputs from upstream.

---

## 1. INPUTS (Non-Negotiable)

Partnership KR consumes only:

**Per player in the pair:**
- Final KR (from Player Evaluation)
- 4 Component KRs (AKR, DKR, SVR, IQKR)
- Primary archetype
- Role (Blocker, Defender, Switch)
- Height, reach, block touch (if available)
- Badges earned

**Per partnership:**
- Matches played together
- Win-loss record together
- Tournament results together
- Pair role assignment (who blocks, who defends, or do they switch)

**Per program (from Coach Context Setup - college only):**
- Program tier (Top, Mid-Tier, Developing)
- Competitive level
- Squad roster (all pairs)

**Explicit exclusions (locked):**
- No archetype recomputation
- No badge/label recomputation
- No trait recomputation

---

## 2. PARTNERSHIP KR COMPUTATION

### 2.1 Base Partnership KR

The base Partnership KR is the weighted average of both players' KRs, adjusted by role complementarity.

```
Base_Partnership_KR = (Player_A_KR * Role_Weight_A + Player_B_KR * Role_Weight_B) / (Role_Weight_A + Role_Weight_B)
```

**Role Weights:**
- In a traditional blocker/defender pair: Blocker weight = 0.48, Defender weight = 0.52 (defender contributes slightly more to pair success because defense sustains rallies)
- In a switch pair: Both players weight = 0.50
- If one player is designated the primary attacker: that player gets 0.52 weight

### 2.2 Chemistry Score

Chemistry Score adjusts the Base Partnership KR based on how well the two players complement each other. Chemistry ranges from -5 to +5.

**Chemistry Factors:**

| Factor | Contribution | Measurement |
|--------|-------------|-------------|
| Role Complementarity | +/- 2 | Do the players fill different roles? A power blocker + speed defender is complementary (+2). Two players who both want to block is poor (-2). |
| Serve Diversity | +/- 1 | Do the players serve different types? One float server + one jump server = +1. Both identical = -1. |
| Height Differential | +/- 1 | Optimal: 2-5 inches (blocker taller). Too close (under 1 inch) = 0. Too far apart (8+ inches) = -1 (the shorter player may get targeted). |
| Handedness Diversity | 0 or +1 | One left-handed + one right-handed = +1. Creates different angles and is harder to defend against. |
| Communication Quality | +/- 2 | V2+ only. At V1, proxy from partnership stability and results trend. Stable partnerships (20+ matches, improving results) = +1. New partnerships (under 10 matches) = 0. Declining results = -1. |

**Chemistry Score Computation:**
```
Chemistry_Score = Role_Comp + Serve_Diversity + Height_Diff + Handedness + Communication
Capped at: -5 to +5
```

### 2.3 Final Partnership KR

```
Partnership_KR = Base_Partnership_KR + Chemistry_Score
```

### 2.4 Partnership Offensive and Defensive KR

**Offensive Partnership KR:**
```
Off_Partnership_KR = (Player_A_AKR * w_A_off + Player_B_AKR * w_B_off) + (Player_A_SVR + Player_B_SVR) / 2 * 0.30 + Chemistry_Off_Bonus
```
Where w_A_off and w_B_off are the offensive role weights (blocker = 0.55 offensive weight, defender = 0.45).
Chemistry_Off_Bonus = Chemistry_Score * 0.3 (offensive chemistry contributes 30% of total chemistry)

**Defensive Partnership KR:**
```
Def_Partnership_KR = (Player_A_DKR * w_A_def + Player_B_DKR * w_B_def) + (Player_A_IQKR + Player_B_IQKR) / 2 * 0.30 + Chemistry_Def_Bonus
```
Where w_A_def and w_B_def are the defensive role weights (blocker = 0.40 for blocking contribution, defender = 0.60 for digging contribution).
Chemistry_Def_Bonus = Chemistry_Score * 0.7 (defensive chemistry contributes 70% of total chemistry because blocking/defending coordination is communication-dependent)

---

## 3. SQUAD KR (COLLEGE ONLY)

### 3.1 Dual Match Format
NCAA beach volleyball dual matches are best of 5 individual pair matches. Each team fields 5 pairs (from their roster of up to 6 pairs). Each pair plays one match (best of 3 sets, sets to 21/15). The team that wins 3 or more pair matches wins the dual.

### 3.2 Squad KR Computation

Squad KR aggregates the Partnership KRs of all active pairs.

**Step 1: Rank Pairs**
Rank the program's 6 pairs by Partnership KR from highest to lowest. These become Pair 1 through Pair 6 (or fewer if the program has under 6 pairs).

**Step 2: Apply Pair Weights**
In a dual match, each pair plays one match. The pair at the top faces the opponent's top pair (typically, though coaches can strategize the lineup order). Pair weighting reflects the importance of winning at each position:

| Pair Position | Weight |
|--------------|--------|
| Pair 1 (top) | 0.24 |
| Pair 2 | 0.22 |
| Pair 3 | 0.20 |
| Pair 4 | 0.18 |
| Pair 5 | 0.16 |
| Pair 6 (alternate/depth) | 0.00 (not in dual match lineup, depth only) |

**Step 3: Compute Weighted Squad KR**
```
Squad_KR = SUM(Partnership_KR_i * Pair_Weight_i) for i = 1 to 5
```

### 3.3 Squad Offensive and Defensive KR
```
Squad_Off_KR = SUM(Off_Partnership_KR_i * Pair_Weight_i) for i = 1 to 5
Squad_Def_KR = SUM(Def_Partnership_KR_i * Pair_Weight_i) for i = 1 to 5
```

### 3.4 Squad Depth Score
Depth is the gap between the top pair and the bottom competing pair.

```
Depth_Score = 100 - (Partnership_KR_1 - Partnership_KR_5) * 3
Capped at: 0-100
```

A deep squad (small gap between pair 1 and pair 5) scores 80+. A top-heavy squad (large gap) scores below 60.

**Why depth matters in beach volleyball:** In dual matches, winning 3 of 5 means the bottom pairs matter. A team with an elite pair 1 and weak pairs 4-5 will lose duals against balanced teams.

---

## 4. PAIR OPTIMIZATION ENGINE

### 4.1 Purpose
Given a roster of N individual players, find the optimal pairing configuration that maximizes Squad KR.

### 4.2 Constraints
- Each player can be in at most one pair
- Partnership chemistry is pair-specific (not additive across roster)
- Role assignments must be feasible (you cannot pair two players who both need to block)
- Indoor overlap: some players may have limited beach availability due to indoor season commitments

### 4.3 Optimization Algorithm

**Step 1: Generate all feasible pairings**
For each possible pair of players on the roster, compute Partnership KR (including chemistry).

**Step 2: Evaluate configurations**
For a roster of N players, evaluate all possible configurations of 5 pairs (or 6 pairs including depth).

**Step 3: Rank by Squad KR**
The configuration with the highest Squad KR is the optimal lineup.

**Step 4: Constraint check**
- Does any player appear in more than one pair?
- Is the role assignment feasible for each pair?
- Are there indoor overlap conflicts?

### 4.4 What-If Analysis
The optimization engine supports what-if scenarios:
- "What if we move Player X from Pair 3 to Pair 1?"
- "What if we add this transfer to the roster?"
- "What if Player Y is injured and unavailable?"

For each scenario, recompute Squad KR and show the delta.

---

## 5. SCHOLARSHIP ALLOCATION (COLLEGE ONLY)

### 5.1 Context
NCAA Women's Beach Volleyball programs have a maximum of 6 full scholarship equivalents. These can be divided (e.g., 12 half-scholarships). Most beach programs share roster spots and scholarships with the indoor volleyball program.

### 5.2 Player Training Value (PTV)
PTV measures how much a player contributes to Squad KR relative to the scholarship cost.

```
PTV = (Player_Contribution_to_Squad_KR / Scholarship_Share) * 100
```

Where Player_Contribution_to_Squad_KR is the delta in Squad KR with vs without this player in the optimal lineup.

### 5.3 Scholarship Allocation Logic
1. Rank all rostered players by PTV
2. Allocate largest scholarship shares to highest-PTV players
3. Reserve at least 0.5 equivalents for roster flexibility (injury replacement, incoming recruits)
4. Account for indoor scholarship overlap: if a player receives an indoor volleyball scholarship, her beach scholarship allocation may be $0 (she is already funded)

### 5.4 Indoor Overlap Complication
Many NCAA beach volleyball players are also on the indoor volleyball roster. Their scholarship comes from indoor's 12 equivalents, not beach's 6. This means:
- A beach program that shares heavily with indoor effectively has more scholarship dollars available per beach-only player
- A beach program that recruits separately (beach-only athletes) must allocate from a smaller pool
- Optimal scholarship allocation considers both pools

---

## 6. PARTNERSHIP EVALUATION OUTPUT FORMAT

```
PARTNERSHIP EVALUATION
=======================
Pair: [Player A Name] / [Player B Name]
Roles: [Player A Role] / [Player B Role]
Level: [Level]
Matches Together: [XX]
Record Together: [W-L]
Data Tier: [V1/V1+/V2/V3]
Confidence: [XX]%

PARTNERSHIP KR: [XX.X]
  Base Partnership KR: [XX.X]
  Chemistry Score: [+/-X.X]
    Role Complementarity: [+/-X]
    Serve Diversity: [+/-X]
    Height Differential: [+/-X]
    Handedness: [0 or +1]
    Communication: [+/-X]

Offensive Partnership KR: [XX.X]
Defensive Partnership KR: [XX.X]

Player A: [Name] - KR [XX.X] (AKR [XX], DKR [XX], SVR [XX], IQKR [XX])
Player B: [Name] - KR [XX.X] (AKR [XX], DKR [XX], SVR [XX], IQKR [XX])

Key Strengths as a Pair:
- [Strength 1]
- [Strength 2]

Key Vulnerabilities as a Pair:
- [Vulnerability 1]
- [Vulnerability 2]

Optimal Strategy: [How this pair wins matches]
Worst Matchup: [What type of opponent pair exploits their weaknesses]
```

---

## 7. SQUAD EVALUATION OUTPUT FORMAT (COLLEGE)

```
SQUAD EVALUATION
=================
Program: [School Name]
Level: NCAA Women's Beach - [Tier]
Season: [Year]
Dual Record: [W-L]
Data Tier: [V1/V1+/V2/V3]
Confidence: [XX]%

SQUAD KR: [XX.X]
  Squad Offensive KR: [XX.X]
  Squad Defensive KR: [XX.X]
  Depth Score: [XX.X]

PAIR LINEUP:
  Pair 1: [Player A / Player B] - Partnership KR: [XX.X] (Chemistry: [+/-X.X])
  Pair 2: [Player A / Player B] - Partnership KR: [XX.X] (Chemistry: [+/-X.X])
  Pair 3: [Player A / Player B] - Partnership KR: [XX.X] (Chemistry: [+/-X.X])
  Pair 4: [Player A / Player B] - Partnership KR: [XX.X] (Chemistry: [+/-X.X])
  Pair 5: [Player A / Player B] - Partnership KR: [XX.X] (Chemistry: [+/-X.X])
  Pair 6 (Depth): [Player A / Player B] - Partnership KR: [XX.X] (Chemistry: [+/-X.X])

Top-to-Bottom Spread: [Pair 1 KR - Pair 5 KR] points

Key Squad Strengths:
- [Strength 1]
- [Strength 2]

Key Squad Vulnerabilities:
- [Vulnerability 1]
- [Vulnerability 2]

Optimization Notes: [Are the pairs optimally assigned? Alternative configurations?]
```

---

## 8. GOVERNANCE

- Partnership KR consumes only finalized individual KRs. It never modifies upstream.
- Chemistry Score is bounded at -5 to +5. No partnership can gain or lose more than 5 KR points from chemistry.
- Squad KR uses the top 5 pairs for dual match evaluation. Pair 6 is depth only.
- Scholarship allocation accounts for indoor program overlap.
- All outputs must include confidence %.
- Pair optimization must be re-run when the roster changes (transfer, injury, graduation).
