# Beach Volleyball College KLVN Lambdas v1

---

## SCOPE

KLVN normalizes production stats across competitive levels for beach volleyball. The reference level (lambda = 1.000) is the AVP Pro Tour, as the highest domestic beach volleyball standard.

KLVN adjusts INPUTS (raw stats during trait scoring). It NEVER adjusts OUTPUTS (final KR). KR is universal and is never multiplied by lambda.

---

## HOW IT WORKS

A player at a level with lambda 0.820 who records 8.0 kills/match has a KLVN-normalized value of:
```
8.0 * 0.820 = 6.56 kills/match (for scoring purposes)
```

A player at the AVP Pro reference level who records 8.0 kills/match stays at 8.0 for scoring.

The lambda captures the average competitive quality difference between levels. Higher lambda = stats at that level are more credible relative to the pro reference.

---

## WOMEN'S COLLEGE LAMBDA TABLE

| Level | Lambda | Rationale |
|-------|--------|-----------|
| NCAA Women's Beach - Top Programs | 0.820 | Top programs (USC, UCLA, LSU, Loyola Marymount, TCU, FSU, Cal Poly, Stanford, Pepperdine, Hawai'i, Arizona, Long Beach State, Grand Canyon, FAU) produce AVP and FIVB-level players. Competition against other top programs is strong. Many pairs feature former indoor All-Americans. |
| NCAA Women's Beach - Mid-Tier Programs | 0.720 | Growing programs with competitive rosters. Conference competition is solid. Some pairs transfer up to top programs or compete on AVP Next after graduation. |
| NCAA Women's Beach - Developing Programs | 0.620 | Newer programs building their beach volleyball identity. Limited dedicated beach recruiting. Many players are indoor-primary with beach as secondary. Competitive depth is thin. |
| Junior/Club Beach (Women's) | 0.550 | USAV Junior Beach, AAU, p1440 juniors. Wide range of quality. Top junior players can be quite good but the average is well below college level. Age and physical development are major factors. |

---

## MEN'S COLLEGE/CLUB LAMBDA TABLE

| Level | Lambda | Rationale |
|-------|--------|-----------|
| Club Men's Beach - Top Programs | 0.680 | No NCAA sponsorship. Top club programs (UCLA, USC, Pepperdine club teams) play competitive schedules against each other and in regional tournaments. Some players also compete on AVP Next. The best club pairs approach low-AVP quality. |
| Club Men's Beach - Standard Programs | 0.580 | Average club programs. Limited organized competition schedule. Variable commitment levels. |
| Junior/Club Beach (Men's) | 0.520 | Youth competitions. Variable quality. Some junior boys are already physically developed enough to compete, but most are developing. |

---

## PROGRAM TIER CLASSIFICATION

### NCAA Women's Beach - Top Programs
USC, UCLA, LSU, Loyola Marymount, Florida State, TCU, Cal Poly, Stanford, Pepperdine, Hawai'i, Arizona, Long Beach State, Grand Canyon, Florida Atlantic

### NCAA Women's Beach - Mid-Tier Programs
FIU, Stetson, South Carolina, Georgia State, Cal State Bakersfield, Tulane, Arizona State, Mercer, Louisiana-Monroe, New Orleans, Spring Hill, Coastal Carolina, College of Charleston, UNF, UAB, Webber International, Warner

### NCAA Women's Beach - Developing Programs
Programs in their first 3-5 years of sponsoring beach volleyball, or programs with minimal dedicated recruiting and coaching investment in beach. Classification should be verified annually.

### Club Men's Beach - Top Programs
UCLA Club, USC Club, Pepperdine Club, UC Santa Barbara Club, Hawai'i Club, Long Beach State Club, Stanford Club, BYU Club

### Club Men's Beach - Standard Programs
Most other university club beach volleyball programs.

---

## CROSS-LEVEL NOTES

- The gap between NCAA Women's Beach Top Programs (0.820) and AVP Pro (1.000) is 0.180 - reflecting that top college beach players are competitive but not yet at full professional level.
- The gap between Club Men's Beach Top Programs (0.680) and AVP Pro (1.000) is larger (0.320) because the lack of NCAA infrastructure means less organized, less coached, and less consistent competition.
- Junior lambdas (0.550 women's, 0.520 men's) reflect the wide variability in youth competition and the fact that physical development is ongoing.
- These lambdas are sport-specific to beach volleyball. They are NOT the same as indoor volleyball lambdas. A player's indoor KLVN-normalized stats and beach KLVN-normalized stats are independent evaluations.

---

## LAMBDA APPLICATION RULES

1. **Apply lambda to volume stats:** kills/match, digs/match, aces/match, blocks/match
2. **Do NOT apply lambda to efficiency stats:** hitting percentage, ace-to-error ratio (these are inherently normalized by attempts)
3. **Apply lambda before scoring against trait bands:** normalize first, then score
4. **Never apply lambda to KR output:** KR is universal
5. **Conference strength within a tier does not modify lambda:** all top programs use the same lambda (0.820) regardless of conference affiliation

---

## GOVERNANCE

- Lambdas are reviewed annually as the beach volleyball landscape evolves
- Program tier classifications should be updated each season based on competitive results, recruiting classes, and National Championship performance
- If NCAA adds men's beach volleyball as a sponsored sport, the men's lambda table must be restructured to reflect NCAA-level competition
- Lambda only normalizes inputs. It never changes KR.
