# COLLEGE WOMEN'S TRACK AND FIELD KLVN LAMBDAS -- v1

## Purpose
College women's track and field lambdas normalize inputs during trait scoring so that an athlete's KR reflects actual ability regardless of competitive level. Same function as lambdas in all KaNeXT intelligence verticals.

## How College Lambdas Work
Lambda normalizes INPUTS (performance marks, competition results, head-to-head context) during trait scoring. It does NOT convert KR OUTPUTS. There is no "D1 Power 4-equivalent KR."

When evaluating a college women's track and field athlete:
1. Identify their level (NCAA D1 Power 4, NCAA D1 Mid-Major, etc.)
2. Look up the level lambda
3. Apply lambda to normalize performance context during trait scoring
4. Score traits, compute component KRs, produce final KR
5. Read the KR against EACH level's legend for the Level Tier Map

The KR is universal. The lambda adjusts how raw performance context translates to trait scores.

## IMPORTANT: Track and Field Lambda Application

Track and field is unique among KaNeXT sports because primary production (times, distances, heights) is objective and absolute. A 11.20 100m is 11.20 regardless of level.

Lambda in track and field applies to CONTEXTUAL inputs, not raw marks:
- Competition quality (who was in the race/flight)
- Tactical awareness scoring (racing strategy against different competition quality)
- Consistency scoring (conditions and meet prestige)
- Championship performance bonus (conference/regional/national meet results)
- Training environment assessment (facilities, coaching, depth of training group)
- Head-to-head results (beating a D1 athlete at an open meet vs beating a D3 athlete)

Raw marks (times, distances, heights, points) are NOT lambda-adjusted. A 11.50 100m produces the same PKR contribution regardless of level. Lambda adjusts the contextual components that surround those marks.

## College Women's Track and Field Lambda Table (v1)

| Rank | Level | Key | Lambda | Calibration |
|------|-------|-----|--------|-------------|
| 1 | NCAA D1 Power 4 (SEC/Big Ten/Big 12/ACC) | ncaa_d1_p4 | 1.000 | Reference |
| 2 | NCAA D1 Mid-Major (A10/MVC/WCC/Colonial/Patriot/etc.) | ncaa_d1_mm | 0.940 | Estimate |
| 3 | NCAA D1 Low-Major (MEAC/SWAC/Southland/NEC/etc.) | ncaa_d1_lm | 0.880 | Estimate |
| 4 | NCAA Division II (top: PSAC/GLIAC/NSIC/LSC/GSC) | ncaa_d2_top | 0.830 | Estimate |
| 5 | NCAA Division II (other) | ncaa_d2 | 0.800 | Estimate |
| 6 | NAIA | naia | 0.790 | Estimate |
| 7 | NCAA Division III (top: NESCAC/WIAC/CCIW/Centennial) | ncaa_d3_top | 0.770 | Estimate |
| 8 | NCAA Division III (other) | ncaa_d3 | 0.740 | Estimate |
| 9 | NJCAA Division I | njcaa_d1 | 0.810 | Estimate |
| 10 | NJCAA Division II | njcaa_d2 | 0.720 | Estimate |
| 11 | NJCAA Division III | njcaa_d3 | 0.640 | Estimate |
| 12 | NCCAA Division I | nccaa_d1 | 0.680 | Estimate |
| 13 | NCCAA Division II | nccaa_d2 | 0.600 | Estimate |
| 14 | USCAA | uscaa | 0.580 | Estimate |
| 15 | High School / Prep / Postgrad | hs_prep | 0.500 | Estimate |

## Conference Class Mappings (2025-26 Season)

### NCAA D1 Power 4 - Lambda = 1.000
- SEC
- Big Ten
- Big 12
- ACC

### NCAA D1 Mid-Major - Lambda = 0.940
- Atlantic 10 (A10)
- Missouri Valley Conference (MVC)
- West Coast Conference (WCC)
- Colonial Athletic Association (CAA)
- Patriot League
- Mountain West Conference (MWC)
- American Athletic Conference (AAC)
- Conference USA (CUSA)
- Sun Belt Conference
- Mid-American Conference (MAC)
- Horizon League
- Big East (some programs P4-equivalent; default MM)
- Ivy League

### NCAA D1 Low-Major - Lambda = 0.880
- Mid-Eastern Athletic Conference (MEAC)
- Southwestern Athletic Conference (SWAC)
- Southland Conference
- Northeast Conference (NEC)
- Big South Conference
- ASUN Conference
- Ohio Valley Conference (OVC)
- Summit League
- WAC (Western Athletic Conference)
- America East

### NJCAA D1 - Lambda = 0.810
Note: NJCAA D1 lambda is higher than some 4-year levels because top NJCAA D1 programs recruit internationally and produce D1 transfers at high rates. The sprint/field event talent at top NJCAA programs (Barton, South Plains, Central Arizona) often exceeds NCAA D2 and NAIA levels.

### NCAA D2 Top Conferences - Lambda = 0.830
- Pennsylvania State Athletic Conference (PSAC)
- Great Lakes Intercollegiate Athletic Conference (GLIAC)
- Northern Sun Intercollegiate Conference (NSIC)
- Lone Star Conference (LSC)
- Gulf South Conference (GSC)
- Great American Conference (GAC)
- Great Northwest Athletic Conference (GNAC)

### NCAA D3 Top Conferences - Lambda = 0.770
- NESCAC
- Wisconsin Intercollegiate Athletic Conference (WIAC)
- College Conference of Illinois and Wisconsin (CCIW)
- Centennial Conference
- University Athletic Association (UAA)
- North Coast Athletic Conference (NCAC)

## Event-Group-Specific Lambda Notes

### Sprints and Hurdles
Standard lambda applies. NJCAA D1 programs are particularly strong in sprints due to international recruiting pipelines (Jamaica, Trinidad, Bahamas, Nigeria). NJCAA D1 sprint lambda may actually be closer to 0.850 for programs with established Caribbean pipelines.

### Distance Events
Distance lambda may slightly favor NCAA D3 and NAIA relative to other sports because distance events depend more on individual training volume than team resources. Top D3 distance programs (e.g., MIT, Johns Hopkins, Williams) produce athletes competitive with D1 mid-major. D3 top conference distance lambda could reasonably be 0.800.

### Throws
Throws lambda heavily influenced by coaching quality and facilities. Programs with elite throws coaches and proper training facilities (indoor weight rooms, proper rings, full cage) produce marks independent of level. Lambda applies more to depth of competition context than to individual mark production.

### Jumps
Standard lambda applies. Pole vault has additional facility dependency (indoor facility, quality poles, coaching expertise) that makes it more level-dependent than horizontal jumps.

### Heptathlon
Heptathlon lambda is the average of component event lambdas at that level. Multi-event athletes benefit significantly from depth of coaching staff (dedicated multi-event coach), which is more common at higher levels.

## Cross-Level Comparison Example

Athlete A: 12.00 100m at NCAA D1 Big Ten school (lambda 1.000)
Athlete B: 12.00 100m at NJCAA D1 program (lambda 0.810)

Raw marks are identical - both ran 12.00. PKR contribution from the raw mark is the same. But contextual inputs differ:
- Athlete A ran 12.00 against deeper fields, in higher-prestige meets, with more tactical pressure. Context inputs get full weight.
- Athlete B ran 12.00 against shallower fields. Context inputs are lambda-adjusted (multiplied by 0.810). TKR and CKR contextual components score slightly lower.

The final KR difference is small because track is mark-driven. But it exists, and it matters at the margins.

## Women's-Specific Lambda Considerations

### Title IX Program Depth
Women's track and field has more programs and more scholarships (18 D1) than men's (12.6 D1). This creates more competitive depth across levels. The gap between D1 and D2 women's track may be slightly smaller than the equivalent gap in men's track because more programs means more distributed talent.

### International Talent Distribution
International women's athletes distribute differently than men's. Caribbean sprint pipelines feed NJCAA and mid-major D1 more heavily. East African distance runners distribute more toward D1 programs but increasingly appear at D2 and NAIA. This affects level-specific lambda accuracy.

### Transfer Portal Impact
The transfer portal has compressed talent distribution across levels. NJCAA D1 programs serve as a 2-year pipeline to D1, meaning NJCAA D1 talent may be temporarily underrated by level lambda because many athletes are D1-caliber on a 2-year JUCO plan.

## Governance

- All lambdas v1 provisional
- Track and field lambdas apply to contextual inputs, NOT raw marks
- Lambda does NOT convert KR outputs between levels
- Empirical calibration requires cross-level transfer production tracking
- Conference realignment may require lambda updates
- Lambda table reviewed annually
- Women's-specific considerations (Title IX depth, international pipelines) factored into estimates
