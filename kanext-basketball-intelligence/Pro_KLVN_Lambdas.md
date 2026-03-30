# PRO KLVN LAMBDAS -- v2

## Purpose
Pro lambdas normalize inputs during trait scoring so that a player's KR reflects actual basketball ability regardless of league. Same function as college lambdas.

## How Pro Lambdas Work
Lambda normalizes INPUTS (production stats) during trait scoring. It does NOT convert KR OUTPUTS. There is no "NBA-equivalent KR."

When evaluating a pro player:
1. Identify their league
2. Look up the league lambda
3. Apply lambda to normalize production stats during trait scoring
4. Score traits, compute component KRs, produce final KR
5. Read the KR against the Pro Player KR Legend

The KR is universal. The lambda adjusts how raw stats translate to trait scores.

## Pro Lambda Table (v0)

| League | Lambda | Tier | Calibration |
|--------|--------|------|-------------|
| NBA | 1.000 | 1 | Reference |
| EuroLeague | 0.920 | 1 | Estimate |
| ACB Spain | 0.860 | 2 | Estimate |
| NBL Australia | 0.850 | 2 | Estimate |
| BSL Turkey | 0.840 | 2 | Estimate |
| Adriatic ABA | 0.830 | 2 | Estimate |
| Serie A Italy | 0.830 | 2 | Estimate |
| LNB France | 0.820 | 2 | Estimate |
| Israel BSL | 0.810 | 2 | Estimate |
| EuroCup / BCL | 0.800 | 3 | Estimate |
| CBA China | 0.800 | 3 | Estimate |
| BBL Germany | 0.790 | 3 | Estimate |
| B.League Japan | 0.780 | 3 | Estimate |
| G-League | 0.780 | 3 | Estimate |
| KBL South Korea | 0.750 | 3 | Estimate |
| NBB Brazil | 0.730 | 4 | Estimate |
| PBA Philippines | 0.720 | 4 | Estimate |
| LNB France Pro B | 0.720 | 4 | Estimate |
| Liga Nacional Argentina | 0.720 | 4 | Estimate |
| Pro A Germany | 0.710 | 4 | Estimate |
| UK BBL | 0.700 | 4 | Estimate |
| Lower European domestic | 0.650-0.700 | 4/5 | Estimate |
| African leagues (BAL, domestic) | 0.600-0.650 | 5 | Estimate |
| Southeast Asian leagues | 0.620 | 5 | Estimate |
| Semi-pro / minor leagues | 0.550-0.600 | 5 | Estimate |

## Cross-League Comparison Example

Player A: 18 PPG in NBA (lambda 1.000)
Player B: 24 PPG in ACB Spain (lambda 0.860)

After lambda normalization, Player B's 24 PPG normalizes closer to ~20 PPG at NBA-equivalent competition. Player A's 18 PPG stays at 18. The trait scores and final KRs reflect this.

## College-to-Pro Note

There is NO lambda translation from college to pro. These are separate evaluation pipelines. The college-to-pro translation happens through:
1. Component KR adjustments (docking traits for pro competition increase)
2. Pro OPF reweighting (different positional demands at pro)
3. Anchoring against the Pro Player KR Legend
4. Development trajectory projections (Year 1, Year 3, Peak)

Pro lambdas are for comparing BETWEEN pro leagues only. They are not used during college-to-pro projection.

## Calibration Plan

v0 lambdas estimated from:
- NBA-to-international talent flow patterns
- Draft pick performance by league of origin
- Cross-league transfer production shifts
- Public analytics (adjusted PER, BPM across leagues)

Empirical calibration requires:
- Real pro player data across multiple leagues
- Tracking players who move between leagues
- 50+ cross-league data points per lambda pair

## Governance

- All lambdas v0 provisional
- Updates require versioning
- Lambda changes propagate to all pro evaluations
- NBA lambda always 1.000
