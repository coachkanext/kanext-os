# COLLEGE MEN'S TRACK AND FIELD KLVN LAMBDAS - v1

## Purpose

College track and field lambdas normalize COMPETITION CONTEXT during component KR scoring so that an athlete's KR reflects actual ability regardless of the competitive environment in which they demonstrated that ability.

**CRITICAL DIFFERENCE FROM TEAM SPORTS:** In basketball or football, lambda adjusts raw production stats because a 20-point game at NAIA is not the same as a 20-point game at D1 High-Major. In track and field, a 10.50 100m IS the same performance regardless of where it was run. Lambda in track and field adjusts CONTEXT factors (CKR, TKR, IQKR) - it does NOT adjust the mark or the PKR.

## How College Track Lambdas Work

Lambda normalizes competition context during non-PKR component scoring. It does NOT convert KR OUTPUTS. There is no "D1-equivalent KR."

When evaluating a college track athlete:
1. The mark (time/distance) directly maps to PKR - no lambda applied to marks
2. Identify the competition context (what level meet produced the non-PKR observations)
3. Look up the context lambda
4. Apply lambda to weight CKR, TKR, and IQKR inputs from that competition context
5. AKR and EKR are NOT adjusted by lambda (physical traits are physical traits)
6. Score all component KRs, compute final KR
7. Read the KR against EACH level's legend for the Level Tier Map

The KR is universal. Lambda adjusts how competition context informs non-performance component KRs.

## Competition Context Lambda Table (v1)

### Championship Meet Lambdas

| Rank | Meet Type | Key | Lambda | Calibration |
|------|-----------|-----|--------|-------------|
| 1 | NCAA D1 Outdoor Championships | ncaa_d1_champs | 1.000 | Reference |
| 2 | NCAA D1 Indoor Championships | ncaa_d1_indoor_champs | 0.990 | Validated |
| 3 | NCAA D1 East/West Regional | ncaa_d1_regional | 0.975 | Validated |
| 4 | NCAA D1 Conference Championship (P4/Big East) | ncaa_d1_conf_p4 | 0.960 | Validated |
| 5 | NCAA D1 Conference Championship (G5/mid) | ncaa_d1_conf_mid | 0.940 | Estimate |
| 6 | NCAA D1 Conference Championship (small) | ncaa_d1_conf_small | 0.920 | Estimate |
| 7 | NCAA D2 Outdoor Championships | ncaa_d2_champs | 0.910 | Validated |
| 8 | NCAA D2 Indoor Championships | ncaa_d2_indoor_champs | 0.900 | Estimate |
| 9 | NCAA D3 Outdoor Championships | ncaa_d3_champs | 0.880 | Validated |
| 10 | NCAA D3 Indoor Championships | ncaa_d3_indoor_champs | 0.870 | Estimate |
| 11 | NAIA Outdoor Championships | naia_champs | 0.880 | Estimate |
| 12 | NAIA Indoor Championships | naia_indoor_champs | 0.870 | Estimate |
| 13 | NJCAA D1 Outdoor Championships | njcaa_d1_champs | 0.860 | Estimate |
| 14 | NJCAA D1 Indoor Championships | njcaa_d1_indoor_champs | 0.850 | Estimate |
| 15 | NCAA D2 Conference Championship | ncaa_d2_conf | 0.870 | Estimate |
| 16 | NCAA D3 Conference Championship | ncaa_d3_conf | 0.850 | Estimate |
| 17 | NAIA Conference Championship | naia_conf | 0.840 | Estimate |
| 18 | NJCAA D1 Conference Championship | njcaa_d1_conf | 0.820 | Estimate |
| 19 | NJCAA D2 Championships | njcaa_d2_champs | 0.790 | Estimate |
| 20 | NJCAA D3 Championships | njcaa_d3_champs | 0.730 | Estimate |

### Regular Season Meet Lambdas

| Rank | Meet Type | Key | Lambda | Calibration |
|------|-----------|-----|--------|-------------|
| 1 | Major D1 Invitational (elite field) | d1_major_invitational | 0.950 | Estimate |
| 2 | Standard D1 Invitational | d1_invitational | 0.930 | Estimate |
| 3 | D1 Dual Meet | d1_dual | 0.920 | Estimate |
| 4 | Low-Level D1 Invitational | d1_low_invitational | 0.900 | Estimate |
| 5 | D2 Invitational | d2_invitational | 0.880 | Estimate |
| 6 | D2 Dual Meet | d2_dual | 0.860 | Estimate |
| 7 | D3 Invitational | d3_invitational | 0.850 | Estimate |
| 8 | D3 Dual Meet | d3_dual | 0.830 | Estimate |
| 9 | NAIA Invitational | naia_invitational | 0.840 | Estimate |
| 10 | NAIA Dual Meet | naia_dual | 0.820 | Estimate |
| 11 | NJCAA D1 Invitational | njcaa_d1_invitational | 0.820 | Estimate |
| 12 | NJCAA D1 Dual Meet | njcaa_d1_dual | 0.800 | Estimate |
| 13 | NJCAA D2 Regular Season | njcaa_d2_regular | 0.760 | Estimate |
| 14 | NJCAA D3 Regular Season | njcaa_d3_regular | 0.700 | Estimate |
| 15 | Unattached/Open Meet | unattached | 0.880 | Estimate |
| 16 | High School State Championship | hs_state | 0.750 | Estimate |
| 17 | High School Invitational | hs_invitational | 0.700 | Estimate |
| 18 | High School Dual Meet | hs_dual | 0.650 | Estimate |

### Major Named Invitational Lambdas

Certain named meets carry specific lambda values due to consistently elite fields:

| Meet | Lambda | Notes |
|------|--------|-------|
| Penn Relays | 0.960 | Championship of America heats are elite |
| Drake Relays | 0.950 | Top invitational field |
| Texas Relays | 0.960 | Consistently elite sprints and relays |
| Mt. SAC Relays | 0.950 | Deep West Coast field |
| Stanford Invitational | 0.950 | Elite distance field |
| Prefontaine Classic (if college division) | 0.970 | Diamond League adjacent |
| NCAA Indoor/Outdoor Last Chance Meets | 0.940 | Athletes chasing qualifying marks; competitive |

## Lambda Application Rules

1. **PKR is NEVER adjusted by lambda.** A 10.50 100m is a 10.50 regardless of meet context. The mark maps directly to the event legend.

2. **CKR uses lambda to weight competition performances.** Winning a race at NCAA D1 Championships (lambda 1.000) contributes more CKR value than winning the same event at a D1 dual meet (lambda 0.920). Example: an athlete who consistently wins at low-lambda meets may have a CKR of 85, while an athlete who consistently places top-3 at high-lambda meets earns CKR of 90+.

3. **TKR uses lambda when technical observations come from specific competition contexts.** Running with elite technical form in a deep championship heat is more informative than the same observation in a thin invitational field.

4. **IQKR uses lambda when assessing tactical racing decisions.** Tactical intelligence demonstrated in championship-quality fields (multiple rounds, deep fast fields, tactical racing) is weighted higher than in small or thin fields.

5. **AKR and EKR are NOT adjusted by lambda.** Physical tools and endurance capacity are intrinsic to the athlete.

## Cross-Level Comparison Example

Athlete A: 10.50 100m, conference champion at a Power 4 conference (lambda 0.960 for conference championship)
Athlete B: 10.50 100m, conference champion at an NAIA conference (lambda 0.840 for NAIA conference championship)

Both athletes have the same PKR (10.50 maps to the same legend tier). But:
- Athlete A's CKR is higher because winning at lambda 0.960 competition is more informative
- Athlete A's conference championship field was deeper (more quality opponents to beat)
- Athlete B's CKR is still positive (winning is winning) but weighted less

The final KR difference between these athletes will be small (PKR dominates at 40-45% weight) but Athlete A will rate 1-3 KR points higher due to competition context advantages in CKR, TKR, and IQKR.

## Track-Specific Lambda Calibration Notes

Track and field lambdas have a narrower range than team sport lambdas (0.650-1.000 vs basketball's wider spread) because:

1. **Performance is objective.** A 10.50 is a 10.50. Lambda only adjusts context, not the primary performance input. In basketball, lambda adjusts production stats which are the primary input - creating wider spreads.

2. **Mixed-level meets are common.** D1, D2, D3, and NAIA athletes frequently compete at the same invitationals. Lambda applies to the meet context, not the athlete's school classification.

3. **National qualifying standards create a universal benchmark.** Any athlete who meets the NCAA D1 auto qualifying standard has demonstrated D1-level performance regardless of their school's level.

## Indoor-Specific Lambda Notes

Indoor meets generally receive a 0.010-0.020 lambda reduction from their outdoor equivalents because:
- Indoor fields tend to be smaller (fewer athletes, fewer heats)
- Indoor facilities vary more (banked vs flat, 200m vs 300m track)
- Some events are not contested indoors (discus, hammer, javelin, steeplechase)
- Indoor championships have slightly smaller fields than outdoor championships
