# COLLEGE MEN'S GOLF KLVN LAMBDAS -- v1

## Purpose
College men's golf lambdas normalize inputs during trait scoring so that a golfer's KR reflects actual ability regardless of competitive level. Same function as pro lambdas but for the college ecosystem.

## How College Lambdas Work
Lambda normalizes INPUTS (production stats) during trait scoring. It does NOT convert KR OUTPUTS. There is no "D1-equivalent KR."

When evaluating a college golfer:
1. Identify their level and conference
2. Look up the level lambda
3. Apply lambda to normalize production stats during trait scoring
4. Score traits, compute component KRs, produce final KR
5. Read the KR against the appropriate level's legend

The KR is universal. The lambda adjusts how raw stats translate to trait scores.

## College Lambda Table (v1)

| Rank | Level | Key | Lambda | Calibration | Legend File |
|------|-------|-----|--------|-------------|-------------|
| 1 | NCAA D1 Power | ncaa_d1_power | 1.000 | Reference | Legend_NCAA_D1_MGolf_v1.md |
| 2 | NCAA D1 Mid-Major | ncaa_d1_mid | 0.925 | Estimate | Legend_NCAA_D1_MGolf_v1.md (adjusted reads) |
| 3 | NCAA D1 Low-Major | ncaa_d1_low | 0.860 | Estimate | Legend_NCAA_D1_MGolf_v1.md (adjusted reads) |
| 4 | NCAA D2 | ncaa_d2 | 0.820 | Estimate | Legend_NCAA_D2_MGolf_v1.md |
| 5 | NAIA | naia | 0.740 | Estimate | Legend_NAIA_MGolf_v1.md |
| 6 | NCAA D3 | ncaa_d3 | 0.710 | Estimate | Legend_NCAA_D3_MGolf_v1.md |
| 7 | NJCAA D1 | njcaa_d1 | 0.700 | Estimate | Legend_NJCAA_MGolf_v1.md |
| 8 | NJCAA D2 | njcaa_d2 | 0.620 | Estimate | Legend_NJCAA_MGolf_v1.md (adjusted reads) |
| 9 | NJCAA D3 | njcaa_d3 | 0.540 | Estimate | Legend_NJCAA_MGolf_v1.md (adjusted reads) |

## What Lambda Captures in Golf

Golf lambdas account for:
- **Field strength** - the quality of competition in tournaments at each level
- **Tournament difficulty** - higher levels play more events at championship-caliber courses
- **Course setup** - D1 Power events are typically set up harder (longer, faster greens, thicker rough)
- **Depth of field** - more low-scoring players at higher levels compress scoring averages
- **Pressure environment** - higher-level events have more at stake (NCAA qualification, national rankings)

Golf lambdas do NOT capture:
- **Course rating/slope** - that is a separate course difficulty adjustment within trait scoring
- **Weather conditions** - handled by the simulation engine, not normalization

## Course Difficulty Adjustment (Separate from KLVN)

KLVN captures level difficulty. Course difficulty is a SEPARATE adjustment:

**Adjusted Scoring = Raw Scoring Average - (Course Rating - Par)**

Example: A golfer averages 74.0 on courses with average rating of 73.5 (par 72).
- Adjusted scoring relative to par = 74.0 - 72 = +2.0 raw
- Course difficulty factor = 73.5 - 72 = +1.5 (courses are 1.5 strokes above par for scratch)
- Difficulty-adjusted scoring = +2.0 - 1.5 = +0.5 relative to course difficulty

This means the golfer is performing at +0.5 strokes above what a scratch golfer would shoot on these courses, which is much better than the raw +2.0 suggests.

If using Golfstat adjusted scoring average, this course difficulty adjustment is already baked in. Do not double-adjust.

## D1 Conference Class Mapping (2025-26 Season)

### Power Conferences (lambda = 1.000)
- SEC
- ACC
- Big 12
- Big Ten
- Pac-12 (or successor conference alignment)

### Mid-Major Conferences (lambda = 0.925)
- American (AAC)
- Sun Belt
- Conference USA
- Colonial Athletic Association (CAA)
- Missouri Valley Conference (MVC)
- West Coast Conference (WCC)
- Atlantic 10 (A-10)
- Mountain West (MWC)
- Southern Conference (SoCon)
- Ohio Valley Conference (OVC)

### Low-Major Conferences (lambda = 0.860)
- All other D1 conferences not listed above
- Northeast Conference (NEC)
- Patriot League
- Ivy League
- Horizon League
- MAAC
- America East
- Big South
- Southland
- Summit League
- MEAC
- SWAC
- Big West
- WAC
- ASUN

## Lambda Application Example

**Player A:** NCAA D1 Power conference, season scoring average 72.5 on courses averaging 73.0 rating (par 72).
- Level lambda: 1.000 (reference, no adjustment)
- Course-adjusted scoring: +0.5 relative to par, adjusted for course difficulty = -0.5 (better than scratch on these courses)
- Trait scoring uses these adjusted inputs directly

**Player B:** NAIA, season scoring average 73.0 on courses averaging 71.0 rating (par 72).
- Level lambda: 0.740
- Course-adjusted scoring: +1.0 relative to par, adjusted for course difficulty = +2.0 (courses are easier than par)
- Lambda adjusts: the +2.0 at NAIA is normalized to reflect that NAIA competition is softer than D1 Power
- After lambda normalization, Player B's production inputs are calibrated to the D1 Power reference scale

## Cross-Level Comparison

Lambda enables the Level Tier Map - the same KR read against different legends:

Example: A golfer evaluated at KR 85.
- At D1 Power: 83-85 = "Fringe Lineup / 5th Man"
- At D1 Mid-Major: 85-87 = "Solid Starter / Reliable Counter"
- At D2: 85-87 = "Solid Starter / Reliable Counter"
- At NAIA: 83-85 = "Solid Starter / Reliable Counter"
- At NJCAA D1: 83-85 = "Solid Starter / Reliable Counter"
- At D3: 83-85 = "Solid Starter / Reliable Counter"

One golfer. One KR. Multiple legend reads. This is the power of KLVN normalization.
