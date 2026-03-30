# BASEBALL SIMULATION ENGINE
## File 04 -- v1.0

---

# INTERACTION LIBRARY

## 0. Scope
Single authoritative lookup table for all identity-clash interactions consumed by the Simulation Engine. Three tables:
- Part 1: Offensive System x Pitching Philosophy (5 x 5 = 25 entries)
- Part 2: Hitter Archetype x Pitcher Archetype (13 x 12 = 156 entries)
- Part 3: Platoon Split Matrix (L/R combinations)

All archetype names MUST match the locked Archetype Libraries exactly. All system/philosophy names MUST match the locked System Sets. Deterministic: same inputs produce same interaction deltas.

---

## PART 1: OFFENSIVE SYSTEM x PITCHING PHILOSOPHY (25 Entries)

Each entry defines the macro game environment. Outputs: Run Scoring Environment shift, Contact Profile shift, Baserunning Activity, Strikeout Pressure, Walk Rate, Explanation.

### Launch Angle/Power vs Strikeout-Dominant
- Run Environment: Slightly below average (both sides accept high-K outcomes)
- HR Rate: +8% (power approach vs power pitching = elevated fly balls)
- K Rate: +15% (highest K game in the matrix)
- BB Rate: +5% (patient power hitters draw walks from K pitchers who miss)
- SB Activity: -30% (slow lineup, pitcher controls running game)
- Explanation: Clash of true outcomes. High-K, high-HR, high-BB, low-contact game. Decided by which team's power is more efficient.

### Launch Angle/Power vs Groundball-Dominant
- Run Environment: Below average (groundball approach suppresses launch angle)
- HR Rate: -20% (sinkers induce grounders, suppressing fly balls)
- K Rate: -5% (contact-inducing pitcher reduces K's slightly)
- BB Rate: Neutral
- SB Activity: -25%
- Explanation: **Pitcher advantage.** Groundball pitching is the natural counter to a launch-angle offense. The offense wants to elevate; the pitcher forces the ball down. This is one of the strongest system-level advantages in the matrix.

### Launch Angle/Power vs Pitch-to-Contact
- Run Environment: Slightly above average
- HR Rate: +5% (contact pitchers give up more hittable pitches)
- K Rate: -8% (fewer strikeouts from contact approach)
- BB Rate: -5% (contact pitchers don't walk people)
- SB Activity: -20%
- Explanation: Power hitters feast on pitchers who put the ball in the zone. Pitch-to-contact philosophy trusts defense, but launch-angle offenses hit the ball over the defense.

### Launch Angle/Power vs Bullpen-Heavy
- Run Environment: Neutral early, below average late
- HR Rate: +5% early, -5% late (fresh arms suppress power late)
- K Rate: +5% late (high-velo relievers increase K's)
- Explanation: Power offense may do damage early against weaker starters, but fresh bullpen arms with max-effort stuff suppress power in late innings.

### Launch Angle/Power vs Starter-Driven
- Run Environment: Neutral to slightly above average
- HR Rate: Neutral (depends on SP quality)
- K Rate: Neutral
- Explanation: Standard matchup. Quality starters limit damage through deep games; power offense needs to capitalize on mistakes.

### Contact/Speed vs Strikeout-Dominant
- Run Environment: Below average
- K Rate: +10% (even contact hitters K more vs elite stuff)
- BB Rate: Neutral
- SB Activity: +15% (speed in motion forces pitcher attention, increases walks)
- Explanation: **Slight pitcher advantage.** Strikeout arms overwhelm contact approach when stuff is dominant. Speed creates pressure but doesn't overcome whiff rates.

### Contact/Speed vs Groundball-Dominant
- Run Environment: Above average
- K Rate: -10%
- BB Rate: -5% (both sides avoid walks)
- SB Activity: +20% (more balls in play = more baserunner opportunities)
- Explanation: **Offense advantage.** Both sides want contact -- but the hitting team controls what happens after contact. Speed turns singles into doubles, steals bases, and manufactures runs.

### Contact/Speed vs Pitch-to-Contact
- Run Environment: Slightly above average
- K Rate: -15% (lowest K game in the matrix)
- BB Rate: -8%
- SB Activity: +15%
- Explanation: Neutral to slight offense advantage. Extremely high-contact game with lots of balls in play. Defense becomes critical differentiator.

### Contact/Speed vs Bullpen-Heavy
- Run Environment: Below average late
- SB Activity: +10% early, -5% late (relievers hold runners better)
- Explanation: Contact approach struggles against fresh max-effort arms in late innings. Speed advantage diminishes when pitchers can throw 100% effort for 1 inning.

### Contact/Speed vs Starter-Driven
- Run Environment: Above average
- K Rate: -5%
- SB Activity: +15% (starters vulnerable to running game as pitch count rises)
- Explanation: **Offense advantage.** Starters who go deep face the lineup 3rd time through, and contact hitters get better with more looks. Speed pressures fatiguing starters.

### Balanced vs [All Philosophies]
- Run Environment: Neutral to slight variation
- Explanation: Balanced offenses produce few extreme interactions. Results determined more by individual KR matchups than system-level effects. No strong system-level advantage or disadvantage.

### Small Ball vs Strikeout-Dominant
- Run Environment: Below average
- K Rate: +5%
- SB Activity: +20%
- Explanation: **Pitcher advantage.** Small ball relies on putting ball in play, and K pitchers prevent that. Stolen bases and bunts can't overcome high K rates.

### Small Ball vs Groundball-Dominant
- Run Environment: Above average
- SB Activity: +25%
- Explanation: **Offense advantage.** Both sides generate ground balls -- but small ball team has the speed to beat throws and manufacture runs from ground ball contact.

### OBP-Focused vs Strikeout-Dominant
- Run Environment: Neutral
- K Rate: +8% (even patient hitters K vs elite stuff)
- BB Rate: +12% (patient hitters draw walks, K pitchers miss zone)
- Explanation: Extended at-bats. Highest-walk game in the matrix. Offense survives through walks but still vulnerable to K's. Pitch count battle favors offense.

### OBP-Focused vs Pitch-to-Contact
- Run Environment: Slightly below average
- BB Rate: -10% (contact pitchers throw strikes, limiting walk opportunities)
- Explanation: **Slight pitcher advantage.** OBP offense needs pitchers to miss the zone. Pitch-to-contact pitchers attack the strike zone aggressively, neutralizing the patience advantage.

### OBP-Focused vs Starter-Driven
- Run Environment: Above average for offense
- Explanation: **Offense advantage.** Patient lineups wear down starters through deep counts, driving up pitch counts. Starters forced out earlier than philosophy intends. 3rd-time-through advantage amplified by patience.

---

## PART 2: HITTER ARCHETYPE x PITCHER ARCHETYPE (Key Matchups)

Full 13x12 matrix is 156 entries. Below are the highest-impact interactions (delta >= +/- 0.10 in KR-equivalent impact).

### Power Hitter vs Strikeout Artist
- **Advantage: Slight Pitcher (+0.08)**
- Explanation: Elite stuff overwhelms power approach. Power hitters chase breaking balls. But when power hitter connects, damage is maximum. High-variance matchup.

### Power Hitter vs Command Pitcher / Pitchability
- **Advantage: Slight Pitcher (+0.06)**
- Explanation: Precision location keeps power hitters off-balance. Command pitchers live on edges and change speeds. Power hitters struggle with movement and location when they can't sit fastball.

### Power Hitter vs Groundball Pitcher
- **Advantage: Pitcher (+0.12)**
- Explanation: **Strongest pitcher advantage in the matrix.** Sinkers and 2-seamers induce ground balls, directly suppressing the fly ball approach power hitters need. Power is neutralized.

### Contact Hitter vs Strikeout Artist
- **Advantage: Slight Pitcher (+0.06)**
- Explanation: Even elite contact rates get overwhelmed by 97 mph + elite slider. Contact hitters survive better than power hitters but still K more than their baseline.

### Contact Hitter vs Groundball Pitcher
- **Advantage: Hitter (+0.08)**
- Explanation: Contact hitters adjust to sinkers better than power hitters. They put the ball in play and use speed/gap-to-gap ability. Ground balls from contact hitters often find holes.

### Five-Tool Player vs Any Archetype
- **Advantage: Hitter (+0.04 to +0.08)**
- Explanation: Five-tool players have no exploitable weakness. They adjust to any pitching archetype. The most dangerous hitter archetype in the matrix.

### Table Setter vs Closer
- **Advantage: Pitcher (+0.10)**
- Explanation: Closers with max-effort stuff overpower leadoff types. Table setters can't manufacture at-bats against 1-inning max velocity.

### OBP Machine vs Power Arm (Raw)
- **Advantage: Hitter (+0.06)**
- Explanation: Patient hitters exploit raw pitchers who can't command their stuff. Walks pile up. Raw power arm self-destructs through walks.

### Premium Defender vs [All Pitcher Archetypes]
- **Advantage: N/A (defense doesn't interact directly with pitcher)**
- Note: Premium defender's value is captured in FKR component, not in PA-level simulation. Defensive value manifests as opposing team's BABIP reduction, applied at team level.

---

## PART 3: PLATOON SPLIT MATRIX

| Matchup | Advantage | Magnitude | Notes |
|---------|-----------|-----------|-------|
| RHB vs LHP | Hitter | +0.06 OPS equivalent | Standard platoon advantage. Right-handed hitters see the ball better from left-handed pitchers. |
| LHB vs RHP | Hitter | +0.04 OPS equivalent | Smaller platoon advantage for lefties. Still significant. |
| RHB vs RHP | Neutral | 0.00 | Standard matchup. No platoon effect. |
| LHB vs LHP | Pitcher | +0.08 OPS equivalent | Strongest platoon effect. Left-on-left is the most difficult batting matchup. Breaking balls move away. |
| Switch Hitter vs Any | Hitter | +0.02 OPS equivalent | Switch hitter always has platoon advantage. Premium value. |

Platoon effects are applied as modifiers to PA resolution probabilities. They do not override individual KR matchups -- a KR 90 LHB vs KR 85 LHP still favors the hitter. Platoon adjusts the margin.

---

# SIMULATION ENGINE

## A) Plate Appearance Resolution Model

### PA Outcome Distribution
Each PA produces one of 10 outcomes, with probabilities driven by:
- Hitter KR vs Pitcher KR differential
- Archetype x archetype interaction modifier
- Platoon split modifier
- Count leverage (0-0 through 3-2 states)
- Park factor modifier

**Base Outcome Probabilities (league average, 2025-26):**

| Outcome | Base Probability | Modifier Range |
|---------|-----------------|----------------|
| Strikeout | 22.0% | +/- 8% based on matchup |
| Walk | 8.5% | +/- 4% |
| Single | 15.0% | +/- 4% |
| Double | 5.0% | +/- 2% |
| Triple | 0.5% | +/- 0.3% |
| Home Run | 3.0% | +/- 2% |
| Ground Out | 22.0% | +/- 5% |
| Fly Out | 18.0% | +/- 5% |
| Line Out | 5.0% | +/- 2% |
| HBP/Error/Other | 1.0% | +/- 0.5% |

### KR Differential Effect
For every 5 points of KR differential (hitter over pitcher), shift outcome probabilities:
- K%: -1.5%
- BB%: +0.5%
- Hit probability: +1.0% (distributed across single/double/HR by hitter archetype)
- Out probability: -1.0%

For every 5 points of KR differential (pitcher over hitter), reverse the shifts.

### Count Leverage
Hitter-friendly counts (2-0, 3-1) shift probabilities toward hitter by +3-5%.
Pitcher-friendly counts (0-2, 1-2) shift toward pitcher by +3-5%.
Full counts (3-2) are neutral with slightly elevated walk and K probability.

## B) Game Simulation

### Inning Structure
1. Simulate 9 innings (or more if tied)
2. Each half-inning: simulate PAs sequentially through the lineup
3. Track: baserunner state (0-7 encoding for all base combinations), outs (0-2), runs scored
4. Advance baserunners based on outcome type + runner speed (SKR):
   - Single: runner on 1B advances 1 base (2 bases if SKR >= 80 and outfield arm FKR <= 75)
   - Double: runners advance 2 bases (runner from 1B scores if SKR >= 70)
   - Triple: all runners score
   - HR: all runners + batter score
   - Ground out: advance runner on 3B (sac fly equivalent on fly out with < 2 outs)
   - Stolen base attempts based on SKR vs catcher FKR (CS% sub-trait)

### Pitcher Usage Model
- **Starting pitcher** throws until one of: pitch count >= 90 (effectiveness drops), 3rd time through order (RKR modifier), performance degradation trigger (3 runs in an inning), coach philosophy dictates earlier exit
- **Relief pitchers** enter based on pitching philosophy: Bullpen-Heavy pulls starter in 5th; Starter-Driven rides starter through 7th+
- **Closer** enters in 9th inning with lead of 1-3 runs (save situation)
- **Setup** enters in 7th-8th with lead

### Pitcher Fatigue Model
- **Innings 1-5:** Full effectiveness. No modifier.
- **Innings 6-7 (pitch count 75-95):** Effectiveness drops 3-5%. VKR reduced by 2-3 points. CKR reduced by 1-2 points.
- **Innings 8+ (pitch count 96-115):** Effectiveness drops 8-12%. VKR reduced by 4-6 points. CKR reduced by 3-4 points. K rate drops, BB rate rises.
- **3rd time through order:** Additional -5% effectiveness modifier applied to all PA outcomes (hitters adjust). RKR directly governs this: RKR >= 80 = -3%, RKR 70-79 = -5%, RKR < 70 = -8%.
- **Relief pitchers on back-to-back days:** VKR reduced by 2 points. IQKR reduced by 1 point. Effectiveness -3%.
- **Relief pitchers on 3 consecutive days:** VKR reduced by 4 points. Effectiveness -8%. Should be avoided (flagged in Game Ops).

### Pinch Hit / Substitution Logic
- Pinch hit when: trailing in 7th+ inning AND pitcher due up AND bench hitter KR >= 75
- Defensive replacement when: leading by 1-2 in 8th+ AND starting position player FKR < 70 AND bench player FKR >= 80
- Pinch runner when: runner on base in 8th+ AND runner SKR < 65 AND bench player SKR >= 80 AND run is tying or go-ahead

## C) Win Probability Model

### Pre-Game Win Probability
WinProb_PreGame = f(Team_A_KR, Team_B_KR, SP_matchup, Home_field, Park_factor)

Base formula:
- KR differential drives base probability: +5 KR = ~60% win probability, +10 KR = ~68%, +15 KR = ~75%
- Starting pitcher matchup modifier: SP KR differential contributes +/- 5-8% to win probability (single most important individual matchup in baseball)
- Home field advantage: +3% to home team
- Park factor: adjusts run environment, which shifts probabilities toward offense-heavy or pitching-heavy team

### In-Game Win Probability
Updated after every half-inning based on:
- Current score
- Inning
- Base/out state
- Remaining bullpen quality (aggregate bullpen KR of available arms)
- Lineup position (who is due up)
- Historical win expectancy tables calibrated to run environment

## D) Park Factor Modifiers

### MLB Park Factors (2025-26 Reference)

| Park | Run Factor | HR Factor | Notes |
|------|-----------|-----------|-------|
| Coors Field (COL) | 1.15 | 1.25 | Most extreme hitter's park. Altitude inflates all stats. |
| Yankee Stadium (NYY) | 1.04 | 1.12 | Short right field porch. HR inflated for LHB. |
| Great American (CIN) | 1.05 | 1.10 | Small park, hot summers. |
| Citizens Bank (PHI) | 1.03 | 1.08 | Slight hitter's park. |
| Fenway Park (BOS) | 1.02 | 0.95 (RHB) / 1.10 (LHB) | Asymmetric. Green Monster helps LHB doubles, hurts RHB HR. |
| Oracle Park (SF) | 0.88 | 0.82 | Extreme pitcher's park. Marine layer suppresses fly balls. |
| T-Mobile Park (SEA) | 0.92 | 0.88 | Pitcher's park. Deep dimensions. |
| Tropicana (TB) | 0.95 | 0.92 | Dome. Slightly pitcher-friendly. |
| Petco Park (SD) | 0.93 | 0.90 | Marine layer. Deep center. |
| Dodger Stadium (LAD) | 0.97 | 0.95 | Slight pitcher lean. Night air. |
| All other parks | 0.97-1.03 | 0.95-1.05 | Within neutral range. |

### College Park Factors
Most college parks are not well-documented for park factors. Use these guidelines:
- High altitude (> 4000 ft): run factor 1.05-1.15
- Sea level with marine influence: run factor 0.90-0.95
- Standard inland: run factor 0.98-1.02
- Small dimensions (< 320 ft poles, < 380 ft center): HR factor 1.05-1.15
- Large dimensions (> 340 ft poles, > 400 ft center): HR factor 0.85-0.95

### Application
Park factors are applied as multipliers to outcome probabilities in the PA Resolution Model:
- HR probability x HR_Park_Factor
- Run scoring x Run_Park_Factor
- These compound with all other modifiers (KR differential, archetype, platoon, fatigue)

---

# SIMULATION CONFIDENCE GATE

## Confidence Tiers

| Team A Data | Team B Data | Base Confidence | Mismatch Penalty |
|---|---|---|---|
| V3 (Statcast multi-year) | V3 | 88-96% | None |
| V3 | V2 (TrackMan single) | 82-92% | -2 to -3 pts |
| V3 | V1 (box score) | 60-78% | -5 to -8 pts |
| V2 | V2 | 80-93% | None |
| V2 | V1 | 58-76% | -3 to -5 pts |
| V1 | V1 | 52-72% | None |

### Season Arc
- Preseason (0 games): 35-65%
- Early season (1-10 games): 48-72%
- Mid-season (11-30 games): 62-82%
- Late season (31-50 games): 72-90%
- Postseason: 78-95%

---

## GOVERNANCE
- Interaction Library is deterministic: same inputs produce same deltas
- All archetype and system names must match locked libraries exactly
- PA resolution probabilities are v1 estimates -- require calibration from observed data
- Park factors updated annually
- Pitcher fatigue model is v1 provisional -- requires pitch-tracking data validation
- Simulation confidence is display-only, does not modify simulation math
