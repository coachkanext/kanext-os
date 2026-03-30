# COLLEGE BASEBALL KLVN LAMBDAS -- v1

## Purpose
College baseball lambdas normalize inputs during trait scoring so that a player's KR reflects actual baseball ability regardless of competitive level. Same function as pro lambdas but for the college ecosystem.

## How College Lambdas Work
Lambda normalizes INPUTS (production stats) during trait scoring. It does NOT convert KR OUTPUTS. There is no "D1-equivalent KR."

When evaluating a college player:
1. Identify their level and conference
2. Look up the level lambda
3. Apply lambda to normalize production stats during trait scoring
4. Score traits, compute component KRs, produce final KR
5. Read the KR against the appropriate level's legend

The KR is universal. The lambda adjusts how raw stats translate to trait scores.

## College Lambda Table (v1)

| Rank | Level | Key | λ_level | Calibration | Legend File |
|------|-------|-----|---------|-------------|-------------|
| 1 | NCAA D1 Power | ncaa_d1_power | 1.000 | Reference | Legend_NCAA_D1_Baseball_v1.md |
| 2 | NCAA D1 Mid-Major | ncaa_d1_mid | 0.920 | Estimate | Legend_NCAA_D1_Baseball_v1.md (adjusted tier reads) |
| 3 | NCAA D1 Low-Major | ncaa_d1_low | 0.850 | Estimate | Legend_NCAA_D1_Baseball_v1.md (adjusted tier reads) |
| 4 | NCAA D2 | ncaa_d2 | 0.830 | Estimate | Legend_NCAA_D2_Baseball_v1.md |
| 5 | NJCAA D1 (JUCO) | njcaa_d1 | 0.780 | Estimate | Legend_NJCAA_D1_Baseball_v1.md |
| 6 | CCCAA (California CC) | cccaa | 0.760 | Estimate | (future file) |
| 7 | NAIA | naia | 0.750 | Estimate | Legend_NAIA_Baseball_v1.md |
| 8 | NWAC (NW Athletic Conf) | nwac | 0.720 | Estimate | (future file) |
| 9 | NCAA D3 | ncaa_d3 | 0.700 | Estimate | Legend_NCAA_D3_Baseball_v1.md |
| 10 | NJCAA D2 | njcaa_d2 | 0.680 | Estimate | Legend_NJCAA_D2_Baseball_v1.md |
| 11 | NJCAA D3 | njcaa_d3 | 0.580 | Estimate | Legend_NJCAA_D3_Baseball_v1.md |
| 12 | USCAA | uscaa | 0.520 | Estimate | (future file) |
| 13 | NCCAA D1 | nccaa_d1 | 0.550 | Estimate | (future file) |
| 14 | NCCAA D2 | nccaa_d2 | 0.480 | Estimate | (future file) |

## D1 Conference Class Mapping (2025-26 Season)

### Power Conferences (λ = 1.000)
- SEC (historically dominant in college baseball)
- ACC
- Big 12
- Big Ten
- Pac-12 (or successor conference)

### Mid-Major Conferences (λ = 0.920)
- American (AAC)
- Sun Belt
- Conference USA
- Colonial Athletic Association (CAA)
- Missouri Valley Conference (MVC)
- West Coast Conference (WCC)
- Atlantic 10 (A-10)
- Mountain West (MWC)

### Low-Major Conferences (λ = 0.850)
- All other D1 conferences not listed above
- Northeast Conference (NEC)
- Patriot League
- Ivy League
- MEAC
- SWAC
- Southland
- Ohio Valley (OVC)
- Horizon League
- Summit League

### Level Key Assignment Rule
If governing_body = NCAA and division = D1:
- If conference is in Power list → level_key = ncaa_d1_power
- Else if conference is in Mid-Major list → level_key = ncaa_d1_mid
- Else → level_key = ncaa_d1_low

## Baseball-Specific Lambda Notes

### Schedule Length Adjustment
College baseball seasons vary significantly:
- D1: 56-game regular season (standard)
- D2: ~50 games
- D3: ~36-40 games (shorter, especially northern programs)
- NAIA: ~50 games
- JUCO: ~50-56 games

Lambda accounts for this implicitly -- shorter seasons produce smaller sample sizes which affect confidence_pct, not lambda itself.

### Aluminum vs Wood Bat
All college levels use aluminum (BBCOR-certified) bats. The lambda does NOT adjust for bat type. The college-to-pro translation in the Pro Transition Engine handles the aluminum-to-wood adjustment separately, as that is a pipeline transition issue, not a cross-level comparison issue.

### Pitching Lambda Considerations
Pitching stats normalize more cleanly across levels than hitting stats because:
- Strike zone is standard across all levels
- Mound distance is standard (60'6")
- Pitching development tracks more linearly with stuff quality

The same lambda is applied to both hitter and pitcher stats in v1. Future v2 may introduce split lambdas (λ_hitting vs λ_pitching) if calibration data shows different normalization needs.

### Regional Strength Variance
Some D2/NAIA/JUCO conferences are dramatically stronger than others within the same governing body. Examples:
- NJCAA D1 Region 14 (Texas JUCOs) plays at near-D1 level
- NAIA programs in the Sooner Athletic Conference or American Midwest are elite
- D3 programs in NESCAC regularly outperform bottom-tier D2

Lambda is applied at the level, not the conference. Conference-specific strength is captured through the SOS (Strength of Schedule) adjustment in the evaluation pipeline, not through lambda modification.

## Cross-Level Comparison Example

Player A: .340 BA at NCAA D1 Power (λ = 1.000)
Player B: .380 BA at NAIA (λ = 0.750)

After lambda normalization, Player B's .380 BA normalizes closer to a ~.285 BA at D1 Power-equivalent competition. Player A's .340 stays at .340. The trait scores and final KRs reflect this competitive difference.

Player C: 2.50 ERA at NJCAA D1 (λ = 0.780)
Player D: 3.20 ERA at NCAA D1 Power (λ = 1.000)

After normalization, Player C's 2.50 ERA adjusts upward to account for weaker competition. Player D's 3.20 stays. The final KRs may end up similar despite the raw ERA gap.

## CRITICAL CLARIFICATION -- KR IS UNIVERSAL

Same rule as all KaNeXT sports: KLVN lambda normalizes INPUTS during evaluation. It does NOT convert KR OUTPUTS.

A player's KR is a single universal number. The Level Tier Map reads the same KR against different level legends to show what that number means at every level. One player. One KR. Multiple legend reads.

## Governance

- All lambdas v1 provisional (estimated from competitive flow analysis, not empirical calibration)
- Updates require versioning
- Lambda changes propagate to all evaluations at that level
- D1 Power lambda always 1.000 (college reference)
- Conference class mapping is season-scoped (reviewed annually)
