# COLLEGE FOOTBALL KLVN LAMBDAS -- v1

## Purpose
College football lambdas normalize inputs during trait scoring so that a player's KR reflects actual football ability regardless of competitive level. Same function as basketball lambdas.

## How College Lambdas Work
Lambda normalizes INPUTS (production stats) during trait scoring. It does NOT convert KR OUTPUTS. There is no "P4-equivalent KR."

When evaluating a college player:
1. Identify their level (FBS P4, FBS G5, FCS, D2, D3, NAIA, NJCAA)
2. Look up the level lambda
3. Apply lambda to normalize production stats during trait scoring
4. Score traits, compute component KRs, produce final KR
5. Read the KR against EACH level's legend for the Level Tier Map

The KR is universal. The lambda adjusts how raw stats translate to trait scores.

## College Football Lambda Table (v1)

| Rank | Level | Key | λ_level | Calibration |
|------|-------|-----|---------|-------------|
| 1 | FBS Power 4 (SEC/Big Ten/Big 12/ACC) | fbs_p4 | 1.000 | Reference |
| 2 | FBS Group of 5 (AAC/MWC/SBC/MAC/CUSA) | fbs_g5 | 0.920 | Validated |
| 3 | FBS Independent (Notre Dame) | fbs_ind_strong | 0.980 | Estimate |
| 4 | FBS Independent (UConn, UMass, etc.) | fbs_ind_weak | 0.910 | Estimate |
| 5 | FCS Top Tier (MVFC/Big Sky/CAA/SoCon) | fcs_top | 0.830 | Validated |
| 6 | FCS Mid Tier (OVC/Patriot/Pioneer/Southland) | fcs_mid | 0.780 | Estimate |
| 7 | FCS Lower Tier (all other FCS) | fcs_low | 0.740 | Estimate |
| 8 | NCAA Division II (top conferences: PSAC/GLIAC/LSC/GSC/NSIC) | ncaa_d2_top | 0.750 | Estimate |
| 9 | NCAA Division II (other) | ncaa_d2 | 0.710 | Estimate |
| 10 | NAIA | naia | 0.720 | Estimate |
| 11 | NCAA Division III (top: WIAC/CCIW/NESCAC/Centennial) | ncaa_d3_top | 0.680 | Estimate |
| 12 | NCAA Division III (other) | ncaa_d3 | 0.650 | Estimate |
| 13 | NJCAA Division I | njcaa_d1 | 0.700 | Estimate |
| 14 | NJCAA Division II | njcaa_d2 | 0.600 | Estimate |
| 15 | NJCAA Division III | njcaa_d3 | 0.540 | Estimate |
| 16 | NCCAA | nccaa | 0.500 | Estimate |
| 17 | High School / Prep / Postgrad | hs_prep | 0.400 | Estimate |

## Conference Class Mappings (2025-26 Season)

### FBS Power 4 (P4) — λ = 1.000
- SEC
- Big Ten
- Big 12
- ACC

### FBS Group of 5 (G5) — λ = 0.920
- American Athletic Conference (AAC)
- Mountain West Conference (MWC)
- Sun Belt Conference
- Mid-American Conference (MAC)
- Conference USA (CUSA)

### FBS Independent
- Notre Dame → λ = 0.980 (P4-equivalent schedule strength)
- UConn, UMass, Army, Navy → λ = 0.910 (G5-equivalent)

### FCS Conference Tier Mapping
**Top Tier (λ = 0.830):** Missouri Valley Football Conference (MVFC), Big Sky, Colonial Athletic Association (CAA), Southern Conference (SoCon)
**Mid Tier (λ = 0.780):** Ohio Valley, Patriot League, Southland, Big South-OVC
**Lower Tier (λ = 0.740):** All other FCS conferences (Pioneer, Northeast, SWAC, MEAC)

Note: SWAC and MEAC are placed in lower tier by competition density, NOT by talent ceiling. Individual players from these conferences may have talent that exceeds the level lambda — this is captured by the evaluation protocol's suppression detection, not by lambda adjustment.

## Football-Specific Lambda Calibration Notes

Football lambdas are wider-spread than basketball lambdas (0.400-1.000 vs basketball's 0.450-1.000) for three reasons:

1. **Roster size amplifies talent concentration.** 85 scholarships at FBS vs 63 at FCS vs 36 at D2 vs 24 at NAIA vs 0 at D3 creates enormous depth gaps. The 4th-string DT at Alabama would start at most D3 programs.

2. **Scheme complexity scales with talent.** P4 programs run NFL-style offensive and defensive schemes. Lower levels simplify schemes because the talent can't execute complexity. This means raw production numbers at lower levels are inflated by simpler opposing schemes.

3. **OL/DL gap is the most dramatic position group.** The difference between a P4 offensive line and a D3 offensive line is larger than any position-group gap in basketball. A QB's production behind a P4 OL vs a D3 OL is not comparable without significant normalization.

## Cross-Level Comparison Example

Player A: 3,500 pass yds, 68% comp, 30 TD at FBS P4 (λ = 1.000)
Player B: 3,800 pass yds, 70% comp, 35 TD at FCS Top Tier (λ = 0.830)

After lambda normalization, Player B's production is adjusted down to account for the competition gap. The trait scores and final KRs reflect this — Player B's raw numbers are higher but normalized numbers may be comparable to or slightly below Player A's.

## CRITICAL CLARIFICATION — KR IS UNIVERSAL

KLVN lambda normalizes INPUTS (production stats) during evaluation so that trait scoring is comparable across levels. It does NOT convert KR OUTPUTS.

A player's KR is a single universal number. It does not change based on what level you're viewing from. There is no "P4-equivalent KR" or "G5-equivalent KR."

What changes across levels is the LEGEND INTERPRETATION of that KR. Each level has its own legend with different tier labels at different KR ranges. One player. One KR. Multiple legend reads depending on level context.

## Governance

- All lambdas v1 — validated where noted, estimated where noted
- Updates require versioning
- Lambda changes propagate to all college evaluations
- FBS P4 lambda always 1.000
- Conference realignment requires immediate lambda table update
- Season-scoped: mapping is valid for 2025-26 season only
