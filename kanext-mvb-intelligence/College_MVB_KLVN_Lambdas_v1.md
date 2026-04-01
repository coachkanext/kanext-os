# Men's Volleyball College KLVN Lambdas v1

---

## SCOPE

KLVN normalizes production stats across competitive levels for men's volleyball. The reference level (lambda = 1.000) is NCAA D1 top-tier conferences (MPSF, EIVA, Big West).

**How it works:**
- A player at a level with lambda 0.850 who records 4.5 kills/set has a KLVN-normalized value of 4.5 * 0.850 = 3.825 kills/set for scoring purposes
- A player at the reference level (lambda 1.000) who records 4.5 kills/set stays at 4.5
- KLVN adjusts INPUTS (raw stats during trait scoring). It NEVER adjusts OUTPUTS (final KR).

---

## LAMBDA TABLE

| Level | Lambda | Rationale |
|-------|--------|-----------|
| NCAA D1 - Top Conferences (MPSF, EIVA, Big West) | 1.000 | Reference. Strongest men's volleyball conferences. UCLA, Long Beach State, Penn State, Hawaii, BYU are the standard-bearers. |
| NCAA D1 - MIVA | 0.950 | Strong conference with programs like Loyola Chicago, Ohio State, Ball State. Slightly below MPSF/EIVA depth. |
| NCAA D1 - Conference Carolinas | 0.870 | Developing conference. Fewer established programs. Lower competitive depth. |
| NCAA D1 - Independent Programs | 0.900 | Programs not in a major conference. Strength varies. Default to 0.900 and adjust based on schedule strength. |
| NCAA D2 | 0.820 | Limited programs. Strong D2 programs overlap with low-tier D1 but average competition is clearly below D1. |
| NCAA D3 - Top Programs | 0.760 | Springfield, Stevens, Carthage, Nazareth - programs that compete at a high level. No scholarships but strong coaching. |
| NCAA D3 - Average | 0.700 | Standard D3 programs. Competitive but clearly below D1/D2 in talent depth. |
| NCAA D3 - Developing | 0.640 | Newer programs or programs in weaker conferences. Limited competitive depth. |

---

## MEN'S VOLLEYBALL-SPECIFIC KLVN NOTES

### Why the Lambda Range is Narrower Than Women's
Women's volleyball has 10 competitive levels spanning from NCAA D1 Power 4 (1.000) to NJCAA D3 (0.550) - a range of 0.450. Men's volleyball has fewer levels and the range is compressed (1.000 to 0.640 = range of 0.360) because:

1. **Fewer programs total.** With ~50 D1, ~25 D2, and ~90 D3 programs, the talent is less diluted.
2. **No NJCAA/CCCAA/NAIA men's volleyball of significance.** Women's volleyball has robust NJCAA, CCCAA, and NAIA systems. Men's volleyball does not.
3. **International talent concentrates at D1.** International players almost exclusively go to D1, creating a larger gap between D1 and everything else.

### Conference Strength Verification
Because men's volleyball conferences are small and memberships change, always verify the current conference alignment of a program before applying KLVN. A program that moves from Conference Carolinas to the EIVA would change from lambda 0.870 to lambda 1.000.

### Non-Conference Schedule Strength
For programs that play significant non-conference schedules against higher-level teams, the evaluator should note the non-conference results as supplementary data. A Conference Carolinas team that goes 2-3 against MPSF opponents provides more information than a Conference Carolinas team that plays only within conference.

---

## END OF FILE
