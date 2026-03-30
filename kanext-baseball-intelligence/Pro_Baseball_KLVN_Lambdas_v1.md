# PRO BASEBALL KLVN LAMBDAS -- v1

## Purpose
Pro baseball lambdas normalize inputs during trait scoring so that a player's KR reflects actual baseball ability regardless of league. Same function as college lambdas but for the professional ecosystem.

## How Pro Lambdas Work
Lambda normalizes INPUTS (production stats) during trait scoring. It does NOT convert KR OUTPUTS. There is no "MLB-equivalent KR."

When evaluating a pro player:
1. Identify their league
2. Look up the league lambda
3. Apply lambda to normalize production stats during trait scoring
4. Score traits, compute component KRs, produce final KR
5. Read the KR against the Pro Player KR Legend

The KR is universal. The lambda adjusts how raw stats translate to trait scores.

## Pro Lambda Table (v1)

| League | Lambda | Tier | Calibration | Notes |
|--------|--------|------|-------------|-------|
| MLB | 1.000 | 1 | Reference | 30 teams, highest global competition |
| NPB (Japan) | 0.850 | 2 | Estimate | 12 teams. Strong domestic talent + aging MLB players. Historically ~85% MLB equivalency for hitters, slightly higher for pitchers. |
| KBO (South Korea) | 0.800 | 2 | Estimate | 10 teams. Offensive-leaning environment. Inflated hitting stats (smaller parks, livelier ball historically). Pitching translates better than hitting. |
| AAA (MiLB) | 0.780 | 3 | Estimate | One step below MLB. Many players with MLB experience. Offense-inflated (smaller parks, Pacific Coast League legacy). |
| Cuban National Series | 0.750 | 3 | Estimate | Strong tradition but declining due to talent exodus. Peak Cuban players translate well (Cespedes, Chapman, Puig entries); league average has dropped. |
| AA (MiLB) | 0.720 | 3 | Estimate | "Make or break" level. Most prospect evaluators consider AA the best indicator of MLB readiness. |
| Mexican League (LMB) | 0.700 | 3 | Estimate | Highest independent pro league in Latin America. Mix of ex-MLB, aging veterans, and domestic talent. |
| CPBL (Taiwan) | 0.680 | 4 | Estimate | 6 teams. Smaller league but produces MLB talent occasionally. |
| High-A (MiLB) | 0.660 | 4 | Estimate | Advanced-A level. Aggressive prospects reach here by age 20-21. |
| Italian Baseball League | 0.620 | 4 | Estimate | Top European league. Limited depth but growing. |
| Dutch Hoofdklasse | 0.600 | 4 | Estimate | Strong European league (Curacao pipeline). |
| Single-A (MiLB) | 0.600 | 4 | Estimate | Full-season A-ball. First real test for most draftees. |
| Australian Baseball League | 0.580 | 5 | Estimate | Winter league. MLB orgs send prospects. Short season. |
| Dominican Winter League | 0.750 | 3 | Estimate | Premium winter ball. MLB regulars and top prospects. Higher lambda due to talent concentration. |
| Venezuelan Winter League (LVBP) | 0.720 | 3 | Estimate | Strong winter ball tradition. Declining due to political situation but talent level remains. |
| Puerto Rico Winter League (LBPRC) | 0.700 | 3 | Estimate | Competitive winter ball. |
| Mexican Pacific League (LMP) | 0.700 | 3 | Estimate | Winter ball. Competitive. Feeds into Caribbean Series. |
| Rookie Ball / Complex League | 0.450 | 5 | Estimate | Entry-level pro. Short seasons, instructional focus. |
| Dominican Summer League | 0.400 | 5 | Estimate | International signing starting point. 16-18 year olds. Development, not production. |

## Baseball-Specific Lambda Notes

### Offense vs Pitching Lambda Split
In v1, a single lambda is applied to both hitter and pitcher stats. However, baseball has known asymmetries:
- Hitter stats translate worse from NPB/KBO to MLB than pitcher stats (hitters face ~0.85x adjustment, pitchers ~0.90x)
- Minor league offense is inflated relative to pitching (smaller parks, less-developed pitching)
- Winter leagues produce small samples that skew pitching stats

Future v2 may introduce λ_hitting and λ_pitching per league.

### Park Factor Interaction
Lambda captures LEAGUE-level competition difference. Park factors capture VENUE-level run environment difference. They are independent adjustments:
- Lambda normalizes: "How good is this league?"
- Park factor normalizes: "How much does this stadium inflate/deflate stats?"

Both apply during trait scoring but at different stages.

### Winter League Lambda Usage
Winter leagues are special:
- Short seasons (50-70 games)
- Mix of MLB regulars, prospects, and local professionals
- Sample sizes are small

Lambda applies normally, but confidence_pct should be reduced for winter-league-only evaluations. Winter league data is supplementary evidence, not primary evaluation data.

### Minor League Lambda Interpretation
Minor league lambdas reflect the COMPETITION LEVEL, not the player quality. A KR 85 prospect playing at AA (λ = 0.720) is NOT a KR 85 × 0.720 player. The lambda adjusts how their AA stats translate to trait scores. Their KR is computed from normalized traits and anchored against the Pro KR Legend.

A player dominating AA (e.g., .310/.400/.530 with 25 HR) will have their stats normalized through the 0.720 lambda, producing trait scores that reflect what those numbers mean against AA-level competition. The resulting KR is a universal number read against the Pro Legend.

## Cross-League Comparison Example

Player A: .280 BA / 30 HR in MLB (λ = 1.000)
Player B: .320 BA / 35 HR in KBO (λ = 0.800)

After lambda normalization, Player B's .320/35 normalizes to approximately .256/28 at MLB-equivalent competition. Player A's .280/30 stays as-is. The final KR reflects this competitive difference.

Pitcher C: 3.20 ERA / 10.5 K/9 in NPB (λ = 0.850)
Pitcher D: 3.80 ERA / 9.0 K/9 in MLB (λ = 1.000)

After normalization, Pitcher C's 3.20 ERA adjusts to approximately 3.76 at MLB-equivalent competition. The KRs may end up similar despite the raw ERA gap.

## College-to-Pro Translation Note

There is NO direct lambda translation from college to pro. These are separate evaluation pipelines. The college-to-pro translation happens through:
1. Aluminum-to-wood bat adjustment (significant -- college BBCOR bats inflate offensive stats by ~15-20% over wood)
2. Component KR adjustments for pro competition increase
3. Pro OPF reweighting (different positional value at pro)
4. Anchoring against the Pro Player KR Legend
5. Development trajectory projections (minor league timeline)

Pro lambdas are for comparing BETWEEN pro leagues only. College lambdas are for comparing BETWEEN college levels only.

## Calibration Plan

v1 lambdas estimated from:
- MLB-to-international talent flow patterns (NPB/KBO posting system outcomes)
- Minor league prospect performance tracking (Baseball America, MLB Pipeline)
- Cross-league free agent production shifts
- Historical data on Cuban defectors' MLB performance
- Winter league to regular season correlation studies
- Public analytics (wRC+ adjustments, FIP translations)

Empirical calibration requires:
- Real pro player data across multiple leagues
- Tracking players who move between leagues (posted players, free agents, minor league promotions)
- 50+ cross-league data points per lambda pair
- Minimum 200 PA (hitters) or 50 IP (pitchers) per player per league

## Governance

- All lambdas v1 provisional
- Updates require versioning
- Lambda changes propagate to all pro evaluations at that level
- MLB lambda always 1.000
- Winter league lambdas carry reduced confidence weighting
