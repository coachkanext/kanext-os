# PRO WOMEN'S GOLF KLVN LAMBDAS
## v1.0

---

## Purpose
Normalizes professional women's golf production stats across tours so that performance on one tour can be fairly compared to performance on another. The LPGA Tour is the reference level (lambda 1.000). All other tours are scaled relative to LPGA field strength, course difficulty, and competitive depth.

---

## Canonical Tour Order (by lambda weight)

| Rank | Tour | Lambda | Rationale |
|------|------|--------|-----------|
| 1 | LPGA Tour | 1.000 | Reference level. Strongest fields, most demanding courses, highest stakes. |
| 2 | KLPGA (Korean Ladies PGA) | 0.920 | Extremely strong fields. South Korea produces the deepest women's golf talent pipeline globally. KLPGA field strength approaches LPGA on non-major weeks. Top KLPGA players regularly transition to LPGA and compete immediately. |
| 3 | JLPGA (Japan Ladies PGA) | 0.900 | Large, well-organized tour with strong domestic talent and international competitors. Purses are the highest outside the LPGA. Fields are deep but slightly below KLPGA in top-end concentration. |
| 4 | Ladies European Tour (LET) | 0.880 | Growing tour with increasing joint-sanctioned events with LPGA. European talent base is strong (Solheim Cup). Field depth varies more than KLPGA/JLPGA due to schedule structure and geography. |
| 5 | Epson Tour | 0.830 | LPGA's official qualifying/developmental tour. Fields include future LPGA stars mixed with developmental players. Top of the Epson Tour is stronger than mid-LET. Bottom of the Epson Tour is weaker. |
| 6 | China LPGA Tour (CLPGA) | 0.750 | Growing Asian tour. Competitive domestically. Strong government investment. Fields are mid-tier internationally. |
| 7 | Women's All Pro Tour | 0.700 | US-based developmental mini-tour. Fields are a tier below Epson Tour. Important stepping stone for players building toward Epson/LPGA qualification. |
| 8 | LET Access Series | 0.700 | LET's developmental tour. Similar competitive level to Women's All Pro Tour. European developmental pipeline. |
| 9 | Other Regional/Mini-Tours | 0.600 | Cactus Tour, East Coast Women's Professional Golf Tour, other regional circuits. Competitive experience but weak fields compared to established tours. |
| 10 | Australian WPGA Tour | 0.720 | Small but competitive domestic tour. Some players transition to LET or LPGA. |

---

## Lambda Application in Women's Golf

### Scoring Average Normalization
A player's scoring average on a non-LPGA tour is normalized to LPGA-equivalent using the tour lambda:

**Normalized scoring excess = (Tour scoring average - Par) x Lambda**
**LPGA-equivalent scoring average = Par + Normalized scoring excess**

Example: A KLPGA player averaging 70.5 on par-72 courses (lambda 0.920):
- Excess over par: 70.5 - 72.0 = -1.5 (1.5 under par)
- Normalized: -1.5 x 0.920 = -1.38
- LPGA-equivalent: 72.0 + (-1.38) = 70.62
- Interpretation: Her KLPGA 70.5 is roughly equivalent to a 70.6 on the LPGA Tour

Example: An Epson Tour player averaging 72.0 on par-72 courses (lambda 0.830):
- Excess over par: 72.0 - 72.0 = 0.0 (even par)
- Normalized: 0.0 x 0.830 = 0.0
- LPGA-equivalent: 72.0
- Note: Even par on the Epson Tour is roughly equivalent to even par on the LPGA, because while the Epson fields are weaker, the scoring context (course setup, field average) absorbs the difference. The lambda primarily affects how we interpret under-par or over-par scoring, not par itself.

### GIR% Normalization
GIR% is normalized by lambda because course length, setup difficulty, and pin accessibility vary by tour level.

**Normalized GIR% = Raw GIR% x Lambda**

Example: An LET player with 70% GIR (lambda 0.880):
- Normalized: 70% x 0.880 = 61.6%
- Interpretation: Her 70% GIR on the LET is roughly equivalent to 61.6% GIR on LPGA course setups (longer, tighter, harder pins)

### Driving Distance
**Driving distance is NOT normalized by lambda.** Distance is a physical attribute independent of competition level. A player who averages 260 yards on the KLPGA will average approximately 260 yards on the LPGA.

### Scrambling%
Scrambling% is normalized by lambda because course setup difficulty affects scrambling opportunities.

**Normalized Scrambling% = Raw Scrambling% x Lambda**

### Putting Average
Putting average is moderately normalized. Green speed and complexity vary by tour, but putting skill is more transferable than full-swing metrics.

**Normalized Putting Average = Raw Putting Average x (1 + (1 - Lambda) x 0.5)**
(Slight upward adjustment for lower-lambda tours, reflecting that LPGA greens are harder)

---

## Cross-Tour Comparison Framework

When comparing players across tours, always normalize stats to LPGA-equivalent before comparison. The KR output is universal, but the stat inputs must be level-adjusted.

**Example comparison:**
- Player A: LPGA Tour, 71.0 scoring average, 70% GIR, 64% scrambling
- Player B: KLPGA, 70.5 scoring average, 72% GIR, 66% scrambling

After normalization:
- Player A: 71.0 scoring average, 70% GIR, 64% scrambling (already at reference level)
- Player B (normalized): ~70.6 scoring average, 66.2% GIR, 60.7% scrambling

Player A has slightly better normalized GIR% and scrambling%. Player B has a slightly better normalized scoring average. This would produce similar KRs with different component distributions.

---

## Dual-Sanctioned Event Handling

Some events are co-sanctioned by multiple tours (e.g., LPGA/LET joint events). For these events:
- Use LPGA lambda (1.000) for all players in the field regardless of their primary tour
- The event counts at full weight for LPGA-primary players
- The event counts at full weight for LET-primary players but the stats are recorded at LPGA lambda
- This provides the most accurate cross-tour calibration data

---

## KLPGA-to-LPGA Transition Notes

South Korean players transitioning from KLPGA to LPGA are among the most common cross-tour transitions in women's golf. Historical data shows:
- Top 5 KLPGA players (KR 90+) typically maintain their KR level on the LPGA within the first season
- Mid-tier KLPGA players (KR 83-89) typically experience a 2-4 KR point adjustment period (6-12 months) as they adapt to LPGA course setups, travel schedule, and competition
- The KLPGA lambda (0.920) reflects the high quality of Korean women's golf; the transition gap is small

---

## GOVERNANCE
- Pro KLVN lambdas are estimates (v0) and will be empirically calibrated as the system processes cross-tour player performance data.
- Lambda values are updated annually to reflect changes in tour field strength, purse structures, and competitive depth.
- All lambda values are multiplicative normalization factors applied to INPUTS (production stats), never to OUTPUTS (KR).
- A player's KR is universal. Pro KLVN helps produce that KR from tour-specific stats. Once produced, the KR stands alone.
