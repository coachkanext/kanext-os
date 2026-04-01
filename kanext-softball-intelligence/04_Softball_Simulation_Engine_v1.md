# SOFTBALL SIMULATION ENGINE
## File 04 - v1.0

---

# INTERACTION LIBRARY

## PART 1: OFFENSIVE SYSTEM x PITCHING PHILOSOPHY (Key Entries)

### Power/Launch vs Ace-Dominant
Run Environment: Below average. HR Rate: -15%. K Rate: +10%. **Pitcher advantage.** Dominant ace suppresses power.

### Power/Launch vs Movement/Deception
Run Environment: Below average. HR Rate: -20%. **Strongest pitcher advantage.** Drop/screwball induces ground balls, suppressing launch angle.

### Power/Launch vs Strikeout-Dominant
HR Rate: +5%. K Rate: +15%. Clash of true outcomes. High variance.

### Slap-and-Run vs Movement/Deception
Run Environment: Above average. SB Activity: +20%. **Offense advantage.** Both generate ground balls but slappers have speed to beat throws.

### Slap-and-Run vs Ace-Dominant
Slightly below average. Ace limits damage but slappers put ball in play. Speed creates pressure. Ace must field from 43 feet.

### Slap-and-Run vs Strikeout-Dominant
Below average. K Rate: +8%. **Slight pitcher advantage.** K pitchers overpower slap contact.

### Contact/Speed vs Movement/Deception
Above average. SB: +15%. **Offense advantage.** Contact team weaponizes the contact movement pitchers allow.

### Small Ball vs Movement/Deception
Above average. **Offense advantage.** Movement pitchers give up contact; small ball manufactures from contact.

### Small Ball vs Ace-Dominant
Below average. **Pitcher advantage.** Small ball needs ball in play; elite ace prevents it.

### Balanced vs [All]
Neutral. Individual KR matchups determine outcomes.

---

## PART 2: KEY HITTER x PITCHER ARCHETYPE MATCHUPS

| Matchup | Advantage | Delta | Notes |
|---------|-----------|-------|-------|
| Power Hitter vs Ace/Workhorse | Pitcher | +0.10 | Ace's full arsenal overwhelms power approach |
| Power Hitter vs Movement Pitcher | Pitcher | +0.12 | Strongest pitcher advantage. Ground balls suppress fly ball approach. |
| Power Hitter vs Strikeout Artist | Slight Pitcher | +0.06 | High variance. Max damage when power connects. |
| Slapper vs Ace/Workhorse | Neutral | +0.02 P | Slapper puts ball in play, forces ace to field from 43 feet |
| Slapper vs Movement Pitcher | Hitter | +0.08 | Slappers turn ground balls into hits through speed |
| Slapper vs Power Pitcher | Slight Pitcher | +0.04 | Velocity can overpower slap but bat-to-ball partially neutralizes |
| Dual-Threat Slapper vs Any | Hitter | +0.06-0.10 | Most dangerous archetype. Defense cannot commit to slap OR power alignment. |
| Five-Tool vs Any | Hitter | +0.04-0.08 | No exploitable weakness |
| Contact Hitter vs Strikeout Artist | Slight Pitcher | +0.04 | Elite stuff overwhelms but less than vs power |

## PART 3: PLATOON SPLITS

| Hitter | Pitcher | Advantage | Modifier |
|--------|---------|-----------|----------|
| R vs R | Neutral | 0.00 |
| R vs L | Hitter | +0.04 |
| L vs R | Hitter | +0.04 |
| L vs L | Pitcher | +0.06 |
| S vs R/L | Hitter | +0.02 |

LHB slappers vs LHP is the most exploitable platoon matchup in softball - ball moves away from slap zone.

---

# SIMULATION ENGINE

## A) Plate Appearance Resolution

**Base Outcome Probabilities (D1 softball, 2025-26):**

| Outcome | Base % | Modifier Range |
|---------|--------|----------------|
| Strikeout | 18.0% | +/- 7% |
| Walk | 9.0% | +/- 4% |
| Single | 16.0% | +/- 5% |
| Double | 5.5% | +/- 2% |
| Triple | 0.8% | +/- 0.4% |
| Home Run | 2.5% | +/- 1.5% |
| Ground Out | 24.0% | +/- 6% |
| Fly Out | 19.0% | +/- 5% |
| HBP/Error/Other | 5.2% | +/- 2% |

Lower K and HR than baseball. Higher ground out rate (60-foot basepaths = more outs on ground balls). Higher HBP/error (faster game on smaller field).

**Slap Hitter Modification:** HR -> 0-0.5%, Ground out +8%, Single +5%, Triple +1%, K -5%, infield hit probability from SKR.

**KR Differential:** Per 5 points hitter over pitcher: K -1.5%, BB +0.5%, Hit +1.0%, Out -1.0%.

## B) Game Simulation - 7 INNINGS

1. Simulate 7 innings (extras use international tiebreaker: runner on 2B to start each extra inning)
2. **Run Rule: 8-run lead after 5 innings = game over** (college softball)
3. Baserunner advancement on 60-foot basepaths (faster advancement than baseball):
   - Single: runner advances 1 base (2 if SKR >= 80)
   - Double: runners advance 2 (1B runner scores if SKR >= 70)
   - SB attempts: SKR vs catcher FKR

### Pitcher Usage - SOFTBALL-SPECIFIC
- Aces typically pitch ENTIRE GAME. Complete games are the norm.
- Change triggers: 3+ runs in inning, degradation, matchup, tournament workload
- Tournament: Ace Game 1, #2 Game 2, Ace returns Game 3 on 1 day rest
- No traditional bullpen structure. 2-3 total pitchers.

### Pitcher Fatigue
- Innings 1-5: Full effectiveness
- Innings 6-7: VKR -1-2, CKR -1
- Extra innings: VKR -3-4, CKR -2-3
- 2nd game same day: VKR -3-5, effectiveness -8%
- 3rd game in 3 days: VKR -5-7, effectiveness -12%
- Back-to-back days: DKR >= 85 = minimal impact; DKR < 70 = significant decline

## C) Win Probability

Pre-game: +5 KR ~ 60%, +10 KR ~ 68%, +15 KR ~ 75%. Pitcher matchup +/- 5-8% (most important individual variable). Home field +3%. Run-rule probability included.

In-game: Updated per half-inning. Score, inning, base/out, pitching quality, lineup position, run-rule proximity.

## D) Park Factors

High altitude: 1.05-1.12. Sea level marine: 0.92-0.96. Standard: 0.98-1.02. Small dimensions: HR factor 1.05-1.15. Large: 0.88-0.95. Turf: slight speed advantage for slap game.

---

## GOVERNANCE
- 7-inning simulation, NOT 9
- Run rule (8 after 5) mandatory
- International tiebreaker in extras
- Pitcher fatigue calibrated to softball norms
- Slap hitter outcome distribution mandatory
- All deltas v1 provisional
