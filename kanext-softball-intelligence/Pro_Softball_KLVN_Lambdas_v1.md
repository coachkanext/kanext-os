# PRO SOFTBALL KLVN LAMBDAS -- v1

## Purpose
Pro softball lambdas normalize inputs during trait scoring so that a player's KR reflects actual softball ability regardless of league. Same function as college lambdas but for the professional ecosystem.

## How Pro Lambdas Work
Lambda normalizes INPUTS (production stats) during trait scoring. It does NOT convert KR OUTPUTS. There is no "Athletes Unlimited-equivalent KR."

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
| Athletes Unlimited (US) | 1.000 | 1 | Reference | Primary US domestic league. Highest domestic talent concentration. Weekly redraft creates balanced competition. Performance-based compensation model attracts top players. |
| Japan Softball League (JSL) | 0.920 | 1 | Estimate | 12 corporate-sponsored teams. Historically strongest international league. Elite domestic talent + top imports. Longer season than AU. Highest international pay. |
| USA Softball National Team | 1.050 | 1 | Estimate | International competition. Highest-level softball on earth during Olympic/World Championship play. Talent concentration exceeds any single league. Lambda > 1.000 because only the best compete. |
| Women's Professional Fastpitch (WPF) | 0.900 | 2 | Estimate | Team-based traditional format. Talent level slightly below AU due to lower compensation attracting fewer top players. Growing league. |
| Canadian Wild Pitch League | 0.750 | 3 | Estimate | Emerging professional league. Mix of Canadian national team players and imports. |
| Australian Softball League | 0.720 | 3 | Estimate | Off-season league (November-February). Growing competition. Some AU/WPF players participate. Short season limits sample size. |
| Italian Softball League | 0.680 | 3 | Estimate | Top European league. Strong tradition. Limited depth but produces international-caliber players. |
| Mexican Softball League | 0.650 | 4 | Estimate | Emerging league. Mix of Mexican national team players and imports. Growing infrastructure. |
| Dutch Softball League | 0.620 | 4 | Estimate | Competitive European league. Netherlands is a traditional softball power. |
| Chinese Softball League | 0.600 | 4 | Estimate | State-sponsored. Emerging talent base. Growing ahead of potential future Olympic inclusion. |
| Other European Leagues | 0.550 | 5 | Estimate | Czech Republic, Great Britain, etc. Development-level professional play. |

## Softball-Specific Lambda Notes

### No Minor League System
Unlike baseball, there are no minor league tiers in softball. Players go directly from college to professional competition. The lambda table above covers ALL professional softball leagues globally. There is no AAA/AA/A equivalent.

### Offense vs Pitching Lambda
In v1, a single lambda is applied to both hitter and pitcher stats. Softball has fewer known asymmetries between offense and pitching translation than baseball because:
- Same ball and field dimensions across all levels
- Same pitching mechanics (underhand) across all levels
- No equipment transition (composite bats everywhere)
- Primary variable is competition quality, which affects both sides roughly equally

Future v2 may introduce separate lambdas if data shows meaningful asymmetries.

### National Team / Olympic Lambda
National team competition (Olympics, World Championship, Pan American Games) carries a lambda > 1.000 because talent concentration exceeds any single league. A player's production in national team play is MORE impressive than the same production in any domestic league.

However, sample sizes in international competition are extremely small (10-20 games per tournament). Lambda applies normally but confidence_pct should be reduced for international-competition-only evaluations.

### Off-Season League Lambda Usage
Some leagues operate as off-season options (Australian Softball League runs November-February):
- Short seasons (20-40 games)
- Players may use the season as training/maintenance rather than peak performance
- Mix of national team players and development-level professionals
- Lambda applies normally but confidence_pct should be reduced

### Athletes Unlimited Format Considerations
Athletes Unlimited uses a weekly redraft format where team captains select players. This creates unique statistical considerations:
- No consistent teammates - lineup protection varies week to week
- Weekly team changes mean pitchers face different defensive alignments
- Performance-based individual scoring adds a dimension beyond traditional stats
- Despite format differences, the talent pool is the best in US domestic softball, justifying lambda = 1.000

## Cross-League Comparison Example

Player A: .320 BA / 12 HR in Athletes Unlimited (lambda = 1.000)
Player B: .350 BA / 15 HR in Japan Softball League (lambda = 0.920)

After lambda normalization, Player B's .350/15 normalizes to approximately .322/13.8 at AU-equivalent competition. The KRs may end up similar despite the raw stat differences.

Pitcher C: 1.20 ERA / 9.5 K/7 in JSL (lambda = 0.920)
Pitcher D: 1.80 ERA / 8.5 K/7 in Athletes Unlimited (lambda = 1.000)

After normalization, Pitcher C's 1.20 ERA adjusts to approximately 1.30 at AU-equivalent competition. Pitcher D's numbers stay as-is. The KR gap narrows after normalization.

## College-to-Pro Translation Note

There is NO direct lambda translation from college to pro. These are separate evaluation pipelines. The college-to-pro translation happens through:
1. Competition quality adjustment (-3 to -8 KR points from D1 Power)
2. Component KR adjustments for pro competition increase
3. Pro OPF reweighting (different positional value at pro)
4. Anchoring against the Pro Player KR Legend

The adjustment is smaller in softball than baseball because fewer physical variables change (same field, same ball, same pitching style, same bats). The primary adjustment is competition quality - every opponent at the professional level is elite.

Pro lambdas are for comparing BETWEEN pro leagues only. College lambdas are for comparing BETWEEN college levels only.

## Calibration Plan

v1 lambdas estimated from:
- Cross-league player movement patterns (college stars who played in AU, JSL, WPF)
- National team performance relative to domestic league production
- Historical international competition results (Olympics, World Championship)
- Import player performance in JSL relative to domestic players
- Athletes Unlimited individual scoring patterns across seasons

Empirical calibration requires:
- Real professional player data across multiple leagues
- Tracking players who move between leagues
- 30+ cross-league data points per lambda pair
- Minimum 100 PA (hitters) or 40 IP (pitchers) per player per league

## Governance

- All lambdas v1 provisional
- Updates require versioning
- Lambda changes propagate to all pro evaluations at that level
- Athletes Unlimited lambda always 1.000 (domestic reference)
- National team lambda always >= 1.000
- Off-season league lambdas carry reduced confidence weighting
