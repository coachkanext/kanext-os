# Pro Beach Volleyball KLVN Lambdas v1

---

## SCOPE

Pro KLVN normalizes production stats across professional beach volleyball tours. The reference tour (lambda = 1.000) is the FIVB Beach Pro Tour Elite 16 level, widely regarded as the highest standard of beach volleyball competition globally.

KLVN adjusts INPUTS (raw stats during trait scoring). It NEVER adjusts OUTPUTS (final KR). KR is universal and is never multiplied by lambda.

---

## HOW IT WORKS

A player competing on a tour with lambda 0.900 who records 12.0 kills/match has a KLVN-normalized value of:
```
12.0 * 0.900 = 10.80 kills/match (for scoring purposes)
```

A player at the FIVB Elite 16 reference level who records 12.0 kills/match stays at 12.0 for scoring.

---

## PRO LAMBDA TABLE

| Tour/Level | Lambda | Rationale |
|-----------|--------|-----------|
| FIVB Beach Pro Tour - Elite 16 | 1.000 | Reference. The top tier of FIVB beach volleyball competition. 16-pair main draw of the world's best. Fields include Olympic medalists and world champions. This is the global standard. |
| Olympics | 1.000 | Same reference as Elite 16. The 24-pair Olympic field represents the absolute best in the world. Three-week qualification format with pool play and elimination rounds. |
| FIVB Beach Pro Tour - Challenge | 0.920 | Strong international competition. Fields include top-30 world-ranked pairs plus qualifiers. Slightly below Elite 16 in average field strength but many Elite 16-level pairs compete here as well. |
| AVP Pro Tour | 0.900 | Top US domestic tour. Strong fields anchored by US national team pairs and international guests. The best AVP pairs are world-class (comparable to Elite 16). But average field depth is slightly below FIVB international events due to smaller international representation. |
| Continental Championships (NORCECA, CSV, AVC, CEV) | 0.860 | Regional championship events. CEV (European) events tend toward the higher end. NORCECA and AVC events are strong but less deep than FIVB main events. |
| FIVB Beach Pro Tour - Futures | 0.840 | Development-tier international events. Mix of young emerging pairs and veteran pairs outside the top tier. Good competition but a clear step below Challenge fields. |
| Athletes Unlimited Beach | 0.780 | Innovative draft-based format in the US. Attracts strong players but the format (individual scoring, rotating partnerships, short season) limits traditional pair-level evaluation. Production data is useful but must be contextualized. |
| AVP Next | 0.750 | Qualifying/development tier of the AVP. Emerging US players working toward AVP main draw qualification. Good domestic competition but not full professional level. |
| NVA (National Volleyball Association) | 0.700 | Alternative US tour. Variable competition levels depending on the event. Some events draw strong fields; others are more recreational-competitive. |
| International Federation Development Events | 0.680 | Smaller federation-run events, national tour events outside the FIVB structure. Useful for scouting but competition level is inconsistent. |

---

## GENDER-SPECIFIC NOTES

These lambdas apply to BOTH men's and women's competition at each tour level. The rationale is that the competitive quality differential between tour tiers is similar for both genders:
- FIVB Elite 16 is the top for both men and women
- AVP is the top domestic tour for both
- Futures/Next are development tiers for both

However, the RAW PRODUCTION BENCHMARKS differ by gender (men produce higher kill rates, ace rates, and block rates). Lambda normalizes the competitive context, not the gender-based production differences. Gender differences are captured in the trait bands and legends, not in lambda.

---

## LAMBDA APPLICATION RULES

1. **Apply lambda to volume stats:** kills/match, digs/match, aces/match, blocks/match
2. **Do NOT apply lambda to efficiency stats:** hitting percentage, ace-to-error ratio
3. **Apply lambda before scoring against trait bands:** normalize first, then score
4. **Never apply lambda to KR output:** KR is universal
5. **Tournament-specific lambda:** If a player competes across multiple tours in a season, apply each tour's lambda to the stats from that tour, then weight by match count
6. **Qualifier vs main draw:** Stats from qualifier rounds at an event should use a lambda 0.05 lower than the main draw lambda (qualifier fields are weaker than main draw fields)

---

## CROSS-TOUR EVALUATION

When evaluating a player who competes across multiple tours in a season:

```
Normalized_Stat = SUM(Tour_i_Stat * Tour_i_Lambda * Tour_i_Matches) / SUM(Tour_i_Matches)
```

**Example:** A player competes in 8 FIVB Challenge matches (lambda 0.920) and 6 AVP matches (lambda 0.900):
- FIVB Challenge kills/match: 10.0 -> normalized: 10.0 * 0.920 = 9.20
- AVP kills/match: 11.5 -> normalized: 11.5 * 0.900 = 10.35
- Weighted normalized: (9.20 * 8 + 10.35 * 6) / (8 + 6) = (73.6 + 62.1) / 14 = 9.69 kills/match

---

## GOVERNANCE

- Lambdas are reviewed annually as tour economics and field strengths evolve
- The FIVB tour restructuring (from World Tour to Beach Pro Tour format in 2022-23) reset some competitive dynamics. Current lambdas reflect the Beach Pro Tour structure.
- If FIVB changes its event tier structure, lambdas must be recalibrated
- AVP lambda may increase if international participation on the AVP grows
- Lambda only normalizes inputs. It never changes KR.
