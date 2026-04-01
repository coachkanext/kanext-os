# COLLEGE WOMEN'S FLAG FOOTBALL KLVN LAMBDAS - v1

## Purpose
College flag football lambdas normalize inputs during trait scoring so that a player's KR reflects actual flag football ability regardless of competitive level. Same function as all other KaNeXT sport lambdas.

## How College Lambdas Work
Lambda normalizes INPUTS (production stats) during trait scoring. It does NOT convert KR OUTPUTS. There is no "NCAA-equivalent KR."

When evaluating a college flag football player:
1. Identify their level (NCAA D1, NCAA D2, NCAA D3, NAIA Top, NAIA Standard, NJCAA, Club)
2. Look up the level lambda
3. Apply lambda to normalize production stats during trait scoring
4. Score traits, compute component KRs, produce final KR
5. Read the KR against EACH level's legend for the Level Tier Map

The KR is universal. The lambda adjusts how raw stats translate to trait scores.

## College Flag Football Lambda Table (v1)

| Rank | Level | Key | lambda_level | Calibration |
|------|-------|-----|---------|-------------|
| 1 | NCAA D1 (projected) | ncaa_d1_flag | 1.000 | Reference (projected) |
| 2 | NAIA Top Programs | naia_top_flag | 0.920 | Estimate |
| 3 | NCAA D2 (projected) | ncaa_d2_flag | 0.900 | Estimate (projected) |
| 4 | NAIA Standard | naia_standard_flag | 0.870 | Estimate |
| 5 | NCAA D3 | ncaa_d3_flag | 0.820 | Estimate (projected) |
| 6 | NJCAA | njcaa_flag | 0.780 | Estimate |
| 7 | Club / Varsity (non-NCAA/NAIA sanctioned) | club_varsity_flag | 0.600 | Estimate |
| 8 | High School (sanctioned state) | hs_sanctioned_flag | 0.500 | Estimate |
| 9 | High School (non-sanctioned) / Club | hs_club_flag | 0.400 | Estimate |

## NAIA Program Tier Mapping (2025-26)

### NAIA Top Programs (lambda = 0.920)
Programs with 3+ years of competitive flag football history, established recruiting pipelines, and consistent national tournament contention:
- Ottawa University (KS) - multi-year powerhouse
- Keiser University (FL) - established program with strong Florida pipeline
- St. Thomas University (FL) - South Florida talent pipeline
- University of Saint Mary (KS) - consistent competitor
- Webber International University (FL) - established program

### NAIA Standard (lambda = 0.870)
All other NAIA flag football programs, including:
- Newer programs (launched 2023-2025)
- Programs still building recruiting infrastructure
- Programs in regions without sanctioned high school flag football
- Programs with limited coaching staff or budget

### NAIA Emerging (lambda = 0.840)
First-year NAIA programs that have not yet completed a competitive season. Applied for their inaugural season only, then reassessed.

## NCAA Program Tier Mapping (Projected)

### NCAA D1 (lambda = 1.000 - projected)
Reference lambda. Will be assigned when NCAA D1 programs begin competition. Expected participants by 2027-2028 include schools from Power conferences (Nebraska announced first P4 program for 2028) and established mid-major programs (UT Arlington, Mount St. Mary's, Mercyhurst, Long Island, Alabama State, Cal Poly).

### NCAA D2 (lambda = 0.900 - projected)
Conference Carolinas launched women's flag football for 2025-26 with 10+ institutions. Other D2 conferences expected to follow. Lambda is projected above NAIA standard because D2 programs will have more institutional support and recruiting resources than typical NAIA programs.

### NCAA D3 (lambda = 0.820 - projected)
Empire 8 and other D3 conferences adding programs. No athletic scholarships at D3 (per NCAA D3 rules), so talent concentration will depend on academic/geographic appeal. Lambda is lower than D2 due to no athletic aid.

## NJCAA (lambda = 0.780)
7+ NJCAA institutions participating in 2025-26. Limited data. Programs funded via NJCAA/NFL-RCX grants. Two-year programs serving as development pipelines to 4-year schools.

## High School Mapping

### Sanctioned States (lambda = 0.500)
As of 2025-26, 39 states sanction girls' flag football at the high school level. Top states by participation and talent:
- Florida (largest, most established, strongest talent base)
- Georgia
- Alabama
- Tennessee
- Nevada
- California (CIF-sanctioned starting 2023)
- New York

Florida has the deepest high school flag football ecosystem and produces the most college-ready players. A Florida lambda could arguably be 0.520-0.540 (slightly above average sanctioned state).

### Non-Sanctioned States / Club (lambda = 0.400)
Players from states without sanctioned high school flag football who play through:
- NFL FLAG recreational leagues
- Club teams
- Intramural / informal competition
- Tournament circuits

Limited structured competition. Stats are unreliable. Evaluation relies heavily on athletic testing from other sports (track, soccer, basketball) and highlight video.

## Flag Football-Specific Lambda Calibration Notes

1. **Lambdas are compressed compared to tackle football.** The range is 0.400-1.000 (same as tackle), but the gaps between levels are smaller at the top. Reason: Flag football rosters are 20-30 players vs tackle's 85+. Talent concentration per player is higher, meaning the gap between a top NAIA program and a projected NCAA D1 program is smaller per-player than the equivalent gap in tackle football.

2. **Multi-sport athletes compress the talent gap further.** A track star with 4.70 40-yard speed is equally fast at NAIA and NCAA D1. The athletic trait doesn't change by level. What changes is the SKILL level (route running, flag pulling, football IQ) which takes time to develop.

3. **Data limitation warning.** These lambdas are PROVISIONAL. NCAA D1 has not played a season. NCAA D2 data is from one conference (Conference Carolinas). NAIA data is the only dataset with 3+ years of depth. All lambdas will be recalibrated as data matures.

4. **Pipeline acceleration.** The NFL's investment, Olympic inclusion, and high school expansion (60% participation increase 2024-2025) are accelerating talent development at all levels. Lambdas may need upward adjustment at lower levels as coaching quality improves nationwide.

## Cross-Level Comparison Example

Player A: 2,200 pass yds, 72% comp, 25 TD at NAIA Top (lambda = 0.920)
Player B: 1,800 pass yds, 68% comp, 18 TD at NJCAA (lambda = 0.780)

After lambda normalization, Player B's production is adjusted down to account for the competition gap. Player A's stats are also adjusted (slightly down from the NCAA D1 reference). The trait scores and final KRs reflect these adjustments. Player A's raw numbers AND level make her production more impressive after normalization.

## CRITICAL CLARIFICATION - KR IS UNIVERSAL

KLVN lambda normalizes INPUTS (production stats) during evaluation so that trait scoring is comparable across levels. It does NOT convert KR OUTPUTS.

A player's KR is a single universal number. It does not change based on what level you're viewing from. There is no "NCAA-equivalent KR" or "NAIA-equivalent KR."

What changes across levels is the LEGEND INTERPRETATION of that KR. Each level has its own legend with different tier labels at different KR ranges. One player. One KR. Multiple legend reads depending on level context.

## Governance

- All lambdas v1 - estimated where noted, projected where noted
- Updates require versioning
- Lambda changes propagate to all flag football evaluations
- NCAA D1 lambda always 1.000 (reference)
- As NCAA programs launch and compete, lambdas will be recalibrated based on actual cross-level performance data
- Season-scoped: mapping is valid for 2025-26 season. Will be updated annually.
