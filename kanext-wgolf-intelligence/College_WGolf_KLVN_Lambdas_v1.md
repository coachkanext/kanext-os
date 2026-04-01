# COLLEGE WOMEN'S GOLF KLVN LAMBDAS
## v1.0

---

## Purpose
KLVN (KaNeXT Level Normalization) ensures player performance is comparable across competitive environments. Lambda weights adjust raw production stats during trait scoring so that a scoring average at one level can be fairly compared to a scoring average at another level. KLVN performs normalization only and does not rank, value, or project players. Fully deterministic.

---

## Canonical Level Order (by lambda weight)

| Rank | Level Key | Lambda | Notes |
|------|-----------|--------|-------|
| 1 | ncaa_d1_power4 | 1.000 | Reference level. ACC, Big Ten, Big 12, SEC (Power 4 conferences). |
| 2 | ncaa_d1_mid_major | 0.945 | AAC, A-10, MWC, WCC, Colonial, Southland, Sun Belt, and comparable conferences. |
| 3 | ncaa_d1_low_major | 0.895 | All other D1 conferences not in Power 4 or Mid-Major. |
| 4 | ncaa_d2 | 0.840 | Strong D2 programs approach D1 low-major quality. |
| 5 | naia | 0.780 | Top NAIA programs (Dalton State, SCAD, OKC) approach D2 level. |
| 6 | njcaa_d1 | 0.720 | 2-year pipeline. Top NJCAA players transfer to strong D1/D2. |
| 7 | ncaa_d3 | 0.680 | No scholarships. Wide talent range. Top D3 approaches D2. |
| 8 | njcaa_d2_d3 | 0.640 | Smaller programs, limited competition. |

---

## D1 Major Class Mapping - Women's Golf (2025-26)

### Power 4 (Lambda 1.000)
- ACC (Duke, Wake Forest, Virginia, Clemson, Florida State, NC State, Louisville, Notre Dame, etc.)
- Big Ten (Stanford, Arizona State, Michigan, Ohio State, Northwestern, Indiana, Oregon, USC, Washington, etc.)
- Big 12 (Texas, Oklahoma State, Baylor, TCU, Texas Tech, Arizona, Colorado, UCF, BYU, etc.)
- SEC (South Carolina, LSU, Alabama, Arkansas, Auburn, Florida, Georgia, Ole Miss, Vanderbilt, etc.)

### Mid-Major (Lambda 0.945)
- American Athletic Conference (AAC)
- Atlantic 10 (A-10)
- Mountain West (MWC)
- West Coast Conference (WCC)
- Colonial Athletic Association (CAA)
- Conference USA (C-USA)
- Sun Belt
- Southland
- Missouri Valley Conference (MVC)

### Low-Major (Lambda 0.895)
- All other D1 conferences not listed above
- Big Sky, Big West, Horizon League, MAAC, Summit League, WAC, Patriot League, etc.

**Conference class mapping is season-scoped.** Women's golf conference strength can shift as programs hire new coaches, gain/lose funding, or attract/lose key recruits. The mapping above reflects the 2025-26 landscape and will be updated annually.

---

## How KLVN Works in Women's Golf

**Scoring Average Normalization Example:**
A player at NAIA (lambda 0.780) with a 74.0 scoring average has a KLVN-normalized scoring average of:
- Normalized excess over par = (74.0 - 72.0) x 0.780 = 1.56
- This suggests her scoring is equivalent to approximately 73.6 at the D1 Power 4 reference level, accounting for level difference
- Note: This is a simplified model. True normalization considers course difficulty, field strength, and scoring conditions, not just raw lambda multiplication.

**GIR% Normalization:**
A player at NJCAA (lambda 0.720) with 68% GIR has a KLVN-normalized GIR of:
- 68% x 0.720 = 48.96% (this is not the direct interpretation)
- Rather: 68% GIR at NJCAA is mapped to what that ball-striking quality would produce at D1 Power 4, considering that D1 courses are longer, tighter, with harder pin positions.
- KLVN normalization of GIR% scales the raw percentage by lambda, recognizing that a 68% GIR at NJCAA is not the same as 68% GIR at D1 Power 4.

**Driving Distance:**
Driving distance is less affected by competitive level (it is a physical attribute, not a competition-dependent stat). KLVN does NOT normalize driving distance. A player who hits it 260 yards at NJCAA will hit it approximately 260 yards at D1 Power 4. Course conditions may vary but the physical capability is the same.

**Scrambling%:**
Scrambling% is competition-level dependent (harder courses and setups reduce scrambling). KLVN normalizes scrambling% by level lambda.

---

## CRITICAL CLARIFICATION - KR IS UNIVERSAL

KLVN lambda normalizes INPUTS (production stats) during evaluation. It does NOT convert KR OUTPUTS. A player's KR is a single universal number. There is no "Power 4-equivalent KR." The Level Tier Map reads the same KR against different legends.

Example: A player at NAIA evaluated to KR 85 is KR 85 everywhere. When you read KR 85 against the D1 Power 4 legend, it maps to "Reliable Lineup Player" (83-85 tier). When you read KR 85 against the NAIA legend, it maps to "All-Conference / Strong Starter" (83-86 tier). Same KR, different context.

---

## Lambda Calibration Notes

All lambdas are estimates (v0) and will be empirically calibrated as the system processes real player data. Key calibration signals:
- Transfer success: When a player transfers from Level A to Level B, does her KR accurately predict her performance at Level B?
- Cross-level tournaments: When teams from different levels compete in the same invitational, do KLVN-normalized stats produce accurate relative rankings?
- Historical promotion: Do players who earned pro status from various college levels perform at LPGA/Epson levels consistent with their KLVN-normalized KRs?
