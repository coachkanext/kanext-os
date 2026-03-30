# PRO FOOTBALL KLVN LAMBDAS -- v1

## Purpose
Pro football lambdas normalize inputs during trait scoring so that a player's KR reflects actual football ability regardless of league. Same function as college lambdas.

## How Pro Lambdas Work
Lambda normalizes INPUTS (production stats) during trait scoring. It does NOT convert KR OUTPUTS. There is no "NFL-equivalent KR."

When evaluating a pro player:
1. Identify their league
2. Look up the league lambda
3. Apply lambda to normalize production stats during trait scoring
4. Score traits, compute component KRs, produce final KR
5. Read the KR against the Pro Player KR Legend

The KR is universal. The lambda adjusts how raw stats translate to trait scores.

## Pro Football Lambda Table (v1)

| League | Lambda | Tier | Calibration | Notes |
|--------|--------|------|-------------|-------|
| NFL | 1.000 | 1 | Reference | 32 teams, 53-man rosters, best talent in the world |
| CFL | 0.820 | 2 | Estimate | 9 teams, 46-man rosters, 3-down, wider field, 12 players. Rules differences inflate production (more passing yards, longer field). Lambda accounts for both talent gap and rule inflation. |
| UFL | 0.750 | 3 | Estimate | Spring league. NFL developmental/audition. Talent is primarily NFL roster cuts, practice squad players, and free agents. |
| European League of Football (ELF) | 0.600 | 4 | Estimate | Top European league. Growing but significant talent gap vs NFL. Import rules limit American player count. |
| German Football League (GFL) | 0.580 | 4 | Estimate | Top domestic European league. Strong tradition but limited depth. |
| Austrian Football League (AFL) | 0.560 | 4 | Estimate | Competitive European domestic league. |
| Italian Football League (IFL) | 0.550 | 5 | Estimate | European domestic league. |
| French Football League (LNF) | 0.540 | 5 | Estimate | |
| UK British American Football (BAFA) | 0.520 | 5 | Estimate | |
| Japanese X-League | 0.620 | 4 | Estimate | Strong corporate-backed league. Good skill talent. Limited OL/DL depth. |
| Indoor Football (IFL/NAL) | 0.500 | 5 | Estimate | Arena/indoor format. Different game entirely. Stats not directly comparable. Lambda approximates skill-level translation only. |
| Mexican League (LFA) | 0.530 | 5 | Estimate | Growing league with American talent infusion. |
| Canadian U Sports (College) | 0.550 | 5 | Estimate | Canadian university football. CFL developmental pipeline. |
| Lower European domestic | 0.480-0.520 | 5 | Estimate | |
| Semi-pro / amateur | 0.400-0.450 | 6 | Estimate | |

## CFL-Specific Lambda Notes

The CFL requires special handling because of significant rule differences from the NFL:
- **3 downs** instead of 4 (inflates passing volume)
- **Wider field** (65 yards vs 53.3 yards) — inflates passing yards, WR production
- **12 players** per side — extra receiver inflates passing stats
- **Motion rules** — all eligible receivers can be in motion pre-snap
- **Rouge** (single point) — changes field position strategy
- **Larger end zones** (20 yards vs 10 yards)

The CFL lambda (0.820) is calibrated to account for BOTH the talent gap AND the rule-induced production inflation. A CFL QB throwing for 5,500 yards is not equivalent to an NFL QB throwing for 5,500 yards — the CFL lambda normalizes this.

## UFL-Specific Notes

The UFL (United Football League, merger of USFL + XFL) uses largely NFL rules with minor modifications. The talent gap is the primary lambda driver, not rule differences. UFL rosters are primarily composed of:
- NFL practice squad players
- Recently released NFL players
- College players who went undrafted
- International pipeline players

The UFL-to-NFL pipeline is real but narrow. Approximately 5-10% of UFL players earn NFL roster spots annually.

## Cross-League Comparison Example

Player A: 4,000 pass yds, 95 passer rating in NFL (λ = 1.000)
Player B: 5,200 pass yds, 100 passer rating in CFL (λ = 0.820)

After lambda normalization, Player B's 5,200 CFL yards normalize to approximately 4,264 NFL-equivalent input for trait scoring purposes. Player A's 4,000 stays at 4,000. The trait scores and final KRs reflect this.

Player C: 3,200 pass yds, 92 passer rating in UFL (λ = 0.750)
After normalization, Player C's production normalizes to approximately 2,400 NFL-equivalent input — reflecting that the competition is significantly weaker.

## College-to-Pro Note

There is NO lambda translation from college to pro. These are separate evaluation pipelines. The college-to-pro translation happens through:
1. Component KR adjustments (docking traits for pro competition increase)
2. Pro OPF reweighting (different positional demands at pro)
3. Anchoring against the Pro Player KR Legend
4. Development trajectory projections (Year 1, Year 3, Peak)

Pro lambdas are for comparing BETWEEN pro leagues only. They are not used during college-to-pro projection.

## Governance

- All lambdas v1 provisional except NFL (reference)
- Updates require versioning
- Lambda changes propagate to all pro evaluations
- NFL lambda always 1.000
- CFL lambda requires annual review due to rule changes
- UFL lambda requires review if league expands/contracts or rule changes occur
