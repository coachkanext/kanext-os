# PRO MEN'S TRACK AND FIELD KLVN LAMBDAS - v1

## Purpose

Professional track and field lambdas normalize competition context for non-PKR component KR scoring at the professional level. Same principle as college lambdas: marks are objective truth and PKR is never adjusted. Lambda weights the informational value of competition context for CKR, TKR, and IQKR.

## How Pro Lambdas Work

Lambda normalizes CONTEXT, not MARKS. A 9.95 100m is a 9.95 whether it was run at the Diamond League Final or a Continental Tour Bronze meet. But the competition context in which non-performance traits were demonstrated differs meaningfully.

When evaluating a professional track athlete:
1. The mark maps directly to PKR - no lambda applied
2. Identify the competition context for each meet result
3. Apply lambda to weight CKR, TKR, and IQKR inputs from that context
4. AKR and EKR are NOT adjusted by lambda
5. Score all component KRs, compute final KR
6. Read against Pro Legend

## Professional Competition Lambda Table (v1)

### Championship Lambdas

| Rank | Competition | Key | Lambda | Calibration |
|------|------------|-----|--------|-------------|
| 1 | Olympic Games Final | olympics_final | 1.000 | Reference |
| 2 | World Championships Final | worlds_final | 1.000 | Reference |
| 3 | Olympic Games Semifinal | olympics_semi | 0.990 | Validated |
| 4 | World Championships Semifinal | worlds_semi | 0.990 | Validated |
| 5 | Olympic Games Round 1 | olympics_r1 | 0.980 | Validated |
| 6 | World Championships Round 1 | worlds_r1 | 0.980 | Validated |
| 7 | World Athletics Indoor Championships | worlds_indoor | 0.980 | Estimate |
| 8 | Diamond League Final | dl_final | 0.985 | Validated |
| 9 | European Championships Final | euro_champs | 0.970 | Estimate |
| 10 | Commonwealth Games Final | cwg_final | 0.960 | Estimate |
| 11 | African Championships Final | africa_champs | 0.950 | Estimate |
| 12 | Asian Championships Final | asia_champs | 0.940 | Estimate |
| 13 | Pan American Games Final | panam_final | 0.945 | Estimate |

### Circuit Meet Lambdas

| Rank | Competition | Key | Lambda | Calibration |
|------|------------|-----|--------|-------------|
| 1 | Diamond League Meeting | dl_meeting | 0.975 | Validated |
| 2 | Continental Tour Gold | ct_gold | 0.950 | Estimate |
| 3 | Continental Tour Silver | ct_silver | 0.930 | Estimate |
| 4 | Continental Tour Bronze | ct_bronze | 0.910 | Estimate |
| 5 | World Athletics Relays | wa_relays | 0.940 | Estimate |

### National Championship Lambdas

| Rank | Competition | Key | Lambda | Notes |
|------|------------|-----|--------|-------|
| 1 | US Championships / Olympic Trials | us_champs | 0.980 | Deepest national championship field in sprints, hurdles |
| 2 | Jamaican Championships | jam_champs | 0.975 | Elite sprint depth |
| 3 | UK Athletics Championships | uk_champs | 0.960 | Strong middle distance, distance |
| 4 | Kenyan Championships | ken_champs | 0.970 | Deepest distance field globally |
| 5 | Ethiopian Championships | eth_champs | 0.965 | Elite distance depth |
| 6 | German Championships | ger_champs | 0.945 | Strong throws, combined events |
| 7 | French Championships | fra_champs | 0.940 | Broad strength |
| 8 | South African Championships | rsa_champs | 0.935 | Strong sprints, 400mH |
| 9 | Other Top-20 Nation Championships | other_top20 | 0.920 | Estimate |
| 10 | Other National Championships | other_natl | 0.900 | Estimate |

### Other Competition Lambdas

| Rank | Competition | Key | Lambda | Notes |
|------|------------|-----|--------|-------|
| 1 | USATF Grand Prix Events | usatf_gp | 0.940 | US domestic pro meets |
| 2 | European Indoor Tour | euro_indoor | 0.930 | Winter professional circuit |
| 3 | World Athletics Indoor Tour Gold | wa_indoor_gold | 0.950 | Top indoor meets |
| 4 | Major Named Invitationals (Prefontaine, Bislett, etc.) | major_invitational | 0.965 | Often Diamond League quality fields |
| 5 | Regional Professional Meets | regional_pro | 0.900 | Smaller pro fields |
| 6 | Club/Open Meets | open_meet | 0.860 | Unattached or club competition |
| 7 | Altitude Training Camp Meets (e.g., Flagstaff, Iten) | altitude_meet | 0.870 | Small fields, training context |

## Lambda Application Rules (Pro)

1. **PKR is NEVER adjusted by lambda.** The mark is the mark. Period.

2. **CKR uses lambda to weight the value of competition results.** Placing 4th at the World Championships Final (lambda 1.000) is a far more significant CKR input than placing 4th at a Continental Tour Bronze meet (lambda 0.910).

3. **TKR uses lambda for technical observation context.** Maintaining technical excellence through the rounds of a World Championship (R1, semi, final) is more informative than a single-round observation at a small meet.

4. **IQKR uses lambda for tactical context.** Tactical racing decisions in a World Championship final with multiple medal contenders carry more IQKR weight than tactics in a thin field.

5. **AKR and EKR are NOT adjusted.** Physical attributes and endurance capacity do not change based on meet context.

6. **Round-by-round lambda stacking.** At major championships with multiple rounds, each round is a separate lambda-weighted observation. An athlete who performs well across R1 (0.980), semi (0.990), and final (1.000) accumulates more CKR evidence than an athlete who only competed in a single-round meet.

## Event-Specific Lambda Notes

### Sprints and Hurdles
- US and Jamaican Championships carry the highest national championship lambdas for sprints because those countries produce the deepest sprint fields globally
- Diamond League sprint events are the most competitive regular-circuit events
- Wind-legal status must be confirmed independently of lambda (lambda does not validate wind conditions)

### Middle Distance and Distance
- Kenyan and Ethiopian championships carry the highest national lambdas for distance because those countries produce unmatched depth at 800m-10000m
- Diamond League distance events (particularly the 1500m and 5000m) feature the deepest professional fields
- World Marathon Majors results inform distance KR but use separate marathon-specific evaluation criteria

### Jumps and Throws
- Diamond League is the primary elite competition for jumps and throws
- German and Scandinavian championships carry slightly higher lambdas for throws due to traditional depth
- Major Games (Olympics, Worlds, Europeans) produce the most meaningful CKR data for field events due to competition format (qualification round + final with 3+3 attempt structure)

### Decathlon
- World Athletics Combined Events Challenge is the primary circuit
- Gotzis Hypo-Meeting carries near-Diamond-League lambda (0.970) as the premier annual decathlon meet
- National championship decathlons vary widely in field quality

## Cross-Context Example

Athlete A: 10.05 100m at Diamond League Meeting (lambda 0.975)
Athlete B: 10.05 100m at Continental Tour Bronze (lambda 0.910)

Both have identical PKR (10.05 maps to the same Pro Legend tier). But:
- Athlete A's CKR is boosted by competing in a DL field (deeper, more dangerous)
- Athlete A's IQKR observation is more informative (tactical execution against elite competition)
- Athlete B's CKR contribution from this meet is real but weighted lower

Final KR difference: 1-3 points, driven entirely by non-PKR component KR weighting.

## Season Planning and Lambda Strategy

Professional athletes and coaches strategically plan their competition calendar to:
1. Accumulate high-lambda competition results for ranking points and CKR
2. Balance Diamond League appearances (high lambda, high pressure) with lower-key meets (lower lambda, less travel fatigue)
3. Peak for major championships (Olympics, Worlds) which carry the highest lambda
4. Use Continental Tour meets for fitness building and tactical practice before major championships

An athlete who competes exclusively at low-lambda meets will have a lower CKR than an equally talented athlete who regularly tests themselves in high-lambda competition.
