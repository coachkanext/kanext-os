# PRO WOMEN'S TRACK AND FIELD KLVN LAMBDAS -- v1

## Purpose
Pro lambdas normalize contextual inputs during trait scoring so that an athlete's KR reflects actual ability regardless of professional competition circuit. Same function as college lambdas.

## How Pro Lambdas Work
Lambda normalizes CONTEXTUAL INPUTS during trait scoring. It does NOT convert KR OUTPUTS.

When evaluating a professional women's track and field athlete:
1. Identify their primary competition circuit
2. Look up the circuit lambda
3. Apply lambda to normalize contextual inputs during trait scoring
4. Score traits, compute component KRs, produce final KR
5. Read the KR against the Pro WTF KR Legend

The KR is universal. The lambda adjusts how competition context translates to trait scores.

## IMPORTANT: Track and Field Lambda in Professional Context

Same principle as college: raw marks (times, distances, heights, points) are NOT lambda-adjusted. A 11.00 100m is 11.00 regardless of where it was run.

Lambda applies to contextual factors:
- Quality of competition in the race/flight (Diamond League field vs regional open meet)
- Tactical context (racing against world-class field vs time trialing alone)
- Championship performance weighting (Olympic final vs Continental Tour Bronze meet)
- Consistency of high-level performance (performing under championship pressure vs low-stakes meets)
- Meet prestige (Diamond League vs domestic open)

## Pro Women's Track and Field Lambda Table (v1)

| Rank | Circuit/Context | Key | Lambda | Calibration |
|------|----------------|-----|--------|-------------|
| 1 | Diamond League / World Championships / Olympics | diamond_wc_oly | 1.000 | Reference |
| 2 | Continental Tour Gold | ct_gold | 0.940 | Estimate |
| 3 | Continental Tour Silver | ct_silver | 0.890 | Estimate |
| 4 | Continental Tour Bronze / World Athletics Indoor Tour | ct_bronze_indoor | 0.850 | Estimate |
| 5 | Continental Tour Challenger | ct_challenger | 0.810 | Estimate |
| 6 | Major National Championships (USA, GBR, FRA, GER, JAM, KEN, ETH, JPN) | natl_champ_major | 0.950 | Estimate |
| 7 | Minor National Championships (smaller federations) | natl_champ_minor | 0.850 | Estimate |
| 8 | NCAA Championships (D1 Nationals) | ncaa_d1_champs | 0.900 | Estimate |
| 9 | European Championships / Commonwealth Games | continental_champ | 0.960 | Estimate |
| 10 | African Championships / Asian Games / Pan American Games | regional_champ | 0.920 | Estimate |
| 11 | Domestic Professional Series (UK Athletics, French Indoor) | domestic_pro | 0.800 | Estimate |
| 12 | University/Collegiate Open Meets | collegiate_open | 0.750 | Estimate |
| 13 | Regional/Local Open Meets | regional_open | 0.700 | Estimate |

## Context-Specific Lambda Notes

### Diamond League as Reference
The Diamond League represents the highest regular-season competition context in women's track and field. Fields are curated, invitational, and consistently feature top-10 globally ranked athletes per event. World Championships and Olympics equal or exceed this context. Lambda 1.000 for all three.

### National Championships Variance
National championship lambda varies dramatically by country. The US Olympic Trials/Nationals has a lambda approaching 1.000 (deeper than many Diamond League fields in sprint events). Jamaican Nationals in sprints similarly approaches 1.000. Kenya/Ethiopia Nationals in distance events approaches 1.000. Smaller federation nationals may be 0.800-0.850.

### NCAA Championships Context
NCAA D1 Nationals carries lambda 0.900 because the field quality, while high, includes athletes at earlier developmental stages competing against mature professionals at other events. However, NCAA Championships performance is a strong predictor of professional success and should be weighted heavily in college-to-pro projection.

### Indoor vs Outdoor
Indoor competition generally carries slightly lower lambda than equivalent outdoor because:
- Shorter races (60m, 60mH, no steeplechase/10000m)
- Banked vs flat track variance
- Smaller fields at many indoor meets
- No wind factor in sprints/jumps

Exception: World Athletics Indoor Championships and major indoor invitationals carry lambda 0.940-0.960.

### Altitude Meets
Meets at altitude (Mexico City, Nairobi, Addis Ababa, Boulder, Flagstaff) require altitude adjustment BEFORE lambda application. Altitude benefits sprints/jumps (thinner air, less drag) and hurts distance events (less oxygen). This is a separate adjustment from lambda.

## Women's-Specific Professional Lambda Considerations

### Equal Prize Money Effect
World Athletics equal prize money has increased women's field depth at top events. More women can sustain professional careers, which means Diamond League women's fields are deeper than they were pre-2020. This is reflected in the lambda structure but should be monitored as depth continues to increase.

### Post-Pregnancy Circuit Return
Athletes returning from pregnancy often re-enter competition at Continental Tour Silver/Bronze level before returning to Diamond League. Lambda should reflect the circuit they are competing on, not their pre-pregnancy circuit. Pregnancy suppression addresses the performance gap; lambda addresses the competition context.

### Marathon/Road Racing Circuit
While not tracked in this file (track events only), many women's distance athletes split between track and road racing. Performance in road races (major marathons, half marathons) is NOT directly comparable via lambda to track performance. Road racing is a separate evaluation context with different competitive dynamics.

## Cross-Circuit Example

Athlete A: 11.15 100m at Diamond League meeting (lambda 1.000)
Athlete B: 11.15 100m at Continental Tour Bronze meeting (lambda 0.850)

Raw marks identical. PKR from raw mark is the same. But:
- Athlete A ran 11.15 against a curated field of sub-11.10 athletes, with tactical pressure, in a high-prestige meet. Full contextual weight.
- Athlete B ran 11.15 against a weaker field, possibly as an easy win with no tactical challenge. Contextual inputs adjusted by 0.850.

The KR difference is small (marks drive track KR) but the contextual components of TKR and CKR will score lower for Athlete B.

## College-to-Pro Note

There is NO direct lambda translation from college to professional. These are separate evaluation pipelines. The college-to-pro transition uses:
1. Component KR adjustments (recalibrating traits for professional competition demands)
2. Pro OPF reweighting (different trait importance at professional level)
3. Anchoring against the Pro WTF KR Legend
4. Development trajectory projections (Year 1 pro, Year 3 pro, Peak)
5. Event-specific pro readiness thresholds (see File 06)

Pro lambdas are for comparing BETWEEN professional circuits only. They are not used during college-to-pro projection.

## Governance

- All lambdas v1 provisional
- Track and field pro lambdas apply to contextual inputs, NOT raw marks
- Lambda does NOT convert KR outputs between circuits
- National championship lambdas are country-specific and should be assessed individually
- Altitude adjustment is separate from lambda
- Indoor/outdoor distinction noted but not a hard lambda split (context-dependent)
- Women's-specific depth considerations factored into all estimates
- Lambda table reviewed annually as professional landscape evolves
