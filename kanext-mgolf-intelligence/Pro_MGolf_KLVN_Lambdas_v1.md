# PRO MEN'S GOLF KLVN LAMBDAS -- v1

## Purpose
Pro men's golf lambdas normalize inputs during trait scoring so that a golfer's KR reflects actual ability regardless of which professional tour they compete on. PGA Tour is the reference point at lambda = 1.000.

## How Pro Lambdas Work
Lambda normalizes INPUTS (production stats) during trait scoring. It does NOT convert KR OUTPUTS. There is no "PGA Tour-equivalent KR."

When evaluating a professional golfer:
1. Identify their primary tour
2. Look up the tour lambda
3. Apply lambda to normalize production stats during trait scoring
4. Score traits, compute component KRs, produce final KR
5. Read the KR against the Pro KR Legend

The KR is universal. The lambda adjusts how raw stats translate to trait scores.

## Pro Lambda Table (v1)

| Rank | Tour | Key | Lambda | Calibration | Notes |
|------|------|-----|--------|-------------|-------|
| 1 | PGA Tour | pga_tour | 1.000 | Reference | Strongest fields, hardest setups, 72-hole events with cuts |
| 2 | LIV Golf | liv_golf | 0.960 | Estimate | Top talent but 48-player fields, no cut, 54 holes |
| 3 | DP World Tour | dp_world | 0.920 | Estimate | Strong fields, co-sanctioned majors count at 1.000 |
| 4 | Korn Ferry Tour | korn_ferry | 0.880 | Estimate | Primary developmental tour, strongest dev fields |
| 5 | Japan Golf Tour (JGTO) | japan_tour | 0.820 | Estimate | Deep domestic talent, limited international crossover |
| 6 | PGA Tour Americas | pga_americas | 0.780 | Estimate | Secondary developmental tour |
| 7 | Asian Tour | asian_tour | 0.760 | Estimate | Growing tour, variable field strength |
| 8 | Challenge Tour | challenge | 0.740 | Estimate | DP World developmental tour |
| 9 | Sunshine Tour | sunshine | 0.720 | Estimate | South African-based, produces PGA-level talent occasionally |
| 10 | PGA Tour Canada | pga_canada | 0.700 | Estimate | Short-season developmental tour |
| 11 | Latin America Tour | lat_am | 0.640 | Estimate | Gateway tour, lower field strength |
| 12 | Korean Tour (KPGA) | korean_tour | 0.760 | Estimate | Strong domestic scene, similar to Asian Tour |
| 13 | Australasian Tour (PGA Tour Aus) | aus_tour | 0.720 | Estimate | Limited schedule, produces PGA talent |
| 14 | Mini-tours (US) | mini_tour_us | 0.580 | Estimate | Monday qualifiers, local events, no official ranking points |

## What Pro Lambdas Capture

### Field Strength
The primary factor. PGA Tour fields are the deepest and strongest in the world. Every player in a PGA Tour field is an elite golfer. On developmental tours, the field is more spread out - there are future PGA Tour players mixed with players who will never reach that level.

### Tournament Structure
- **72 vs 54 holes:** PGA Tour events are 72 holes (4 rounds). LIV and some international events are 54 holes. More rounds = more variance = truer test.
- **Cut vs no-cut:** Events with cuts force players to perform from Round 1 or go home. No-cut events (LIV, some international) allow recovery from bad starts. Cuts increase pressure and penalize inconsistency.
- **Field size:** PGA Tour fields are 144-156 players. LIV fields are 48. Smaller fields mean less competition for top finishes.

### Course Setup Difficulty
PGA Tour venues are set up to test the best in the world. Developmental tour venues may be set up slightly easier. International tours vary widely.

### Scoring Environment
A 68 on the PGA Tour is not the same as a 68 on a mini-tour. Lambda ensures that scoring averages are calibrated to the competitive environment.

## Lambda Adjustment for Co-Sanctioned Events

When a golfer competes in a co-sanctioned event (e.g., a major championship counts on both PGA Tour and DP World Tour), the lambda for that specific event is 1.000 regardless of the golfer's primary tour. Majors are always lambda 1.000.

**Co-sanctioned event lambda overrides:**
- Major championships (Masters, PGA Championship, US Open, The Open): lambda = 1.000
- WGC events (if applicable): lambda = 1.000
- Players Championship: lambda = 1.000
- Elevated/Signature PGA Tour events: lambda = 1.000

For golfers who play a mix of tours (e.g., split schedule between DP World and PGA Tour), compute a weighted lambda based on the proportion of events at each tour:

**Weighted Lambda = Sum(events_at_tour_i * lambda_i) / Total Events**

## Multi-Tour Golfer Example

Player competes in:
- 10 PGA Tour events (lambda 1.000)
- 8 DP World Tour events (lambda 0.920)
- 4 co-sanctioned majors (lambda 1.000)

Weighted Lambda = (10 * 1.000 + 8 * 0.920 + 4 * 1.000) / 22 = (10 + 7.36 + 4) / 22 = 21.36 / 22 = 0.971

## LIV Golf Lambda Rationale

LIV Golf is set at 0.960 - the second-highest lambda - because:

**Arguments for high lambda (close to 1.000):**
- Many players are former PGA Tour stars with established KRs
- Individual talent at the top of LIV rivals PGA Tour
- Course setups are demanding
- Prize money attracts elite talent

**Arguments for discount (below 1.000):**
- 48-player field vs 144-156 (far less competition for top finishes)
- No cut line (no pressure to perform from Round 1, no survival element)
- 54 holes vs 72 holes (less variance, less endurance demand)
- Limited course rotation (fewer unique challenges per season)
- Team format adds earnings not tied to individual scoring
- No world ranking points (as of current policy, may change)

The 0.040 discount reflects the structural competitive advantages of the LIV format, not a talent gap. A player who moves from PGA Tour to LIV does not lose ability - but the competitive environment makes it slightly easier to post strong numbers.

## Cross-Tour KR Comparison

Lambda enables comparing golfers across tours:

Example: Player A averages 69.5 on PGA Tour. Player B averages 69.0 on the Asian Tour.
- Player A's scoring inputs enter trait scoring at full value (lambda 1.000)
- Player B's scoring inputs are normalized by lambda 0.760 before trait scoring
- After normalization, Player A's 69.5 on PGA Tour produces higher trait scores than Player B's 69.0 on the Asian Tour
- This is correct: a 69.5 against PGA Tour fields on PGA Tour setups is a more impressive achievement
