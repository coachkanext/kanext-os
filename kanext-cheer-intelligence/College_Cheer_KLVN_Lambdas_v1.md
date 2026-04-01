# COLLEGE CHEER KLVN LAMBDAS v1

## Purpose
KLVN (Competition Level Normalization) adjusts skill difficulty and competition intensity inputs so that KR remains a universal measure across competitive levels. Lambda values reflect the relative talent density, difficulty ceiling, and competition rigor at each level.

Lambda = 1.000 is the reference level (NCAA STUNT).
Lambda > 1.000 means the level is MORE competitive than the reference (skill inputs must be higher to score the same KR).
Lambda < 1.000 means the level is LESS competitive (skill inputs are adjusted to account for lower overall difficulty norms).

## CRITICAL RULE
Lambda adjusts INPUTS during trait scoring. It does NOT adjust KR outputs. KR is one universal number. Lambda is never multiplied by KR. The Level Tier Map shows what the same KR means at different levels by reading it against different legend files.

---

## Lambda Table

### College / Organized Competitive Levels

| Level | Lambda | Rationale |
|-------|--------|-----------|
| All-Star Level 6 (International Open) | 1.050 | Highest difficulty ceiling in cheerleading. Unrestricted skills. Deepest global talent pool. World championship level. |
| All-Star Level 6 (Domestic) | 1.030 | Elite domestic competition. Slightly below the international open field depth. |
| NCAA STUNT (D1/D2 Programs) | 1.000 | Reference level. Growing sport with standardized rubric. Best-resourced college programs. |
| All-Star Level 5 | 0.980 | High-level competition but with skill restrictions. Elite athletes often move to L6 quickly. |
| NCA/UCA College Nationals (Large Programs) | 0.970 | Traditional competition format. Strong programs but less standardized than STUNT. Subjectivity in scoring is higher. |
| NCA/UCA College Nationals (Small Programs) | 0.930 | Same format, smaller rosters, less depth. Top athletes can be very good but supporting cast is thinner. |
| NAIA Cheer/STUNT | 0.850 | Smaller programs, less scholarship depth, but competitive top-end talent. Similar to basketball NAIA lambda. |
| All-Star Level 4 | 0.830 | Meaningful skill restrictions (e.g., limited tumbling, restricted pyramid skills). Competitive but below L5 ceiling. |
| NCAA D3 Cheer (Competition) | 0.800 | No scholarships. Walk-on rosters. Passion-driven athletes. Top athletes can be strong but depth is limited. |
| Game Day Format (College) | 0.780 | Different skill emphasis (crowd leading, band dance, fight song). Less technical difficulty, more performance/crowd engagement. |
| All-Star Level 3 | 0.750 | Significant skill restrictions. Developing athletes. Back tuck is the tumbling ceiling for many L3 athletes. |
| All-Star Level 2 | 0.650 | Introductory competitive level. Back handspring is the tumbling ceiling. Stunts limited to prep level or below. |
| All-Star Level 1 | 0.550 | Entry-level competition. Cartwheels and forward rolls may be the tumbling. Thigh stands and basic stunts. Emphasis on fundamentals and teamwork. |
| Club / Recreational | 0.450 | Non-competitive or minimally competitive. Fundamentals focus. No expectation of advanced skills. |
| High School Sideline (Competitive) | 0.700 | Varies enormously by region. Some high school programs are very strong (Texas, California, Florida). Others are minimal. This lambda represents competitive high school programs. |
| High School Sideline (Standard) | 0.550 | Average high school cheer program. Sideline focus with occasional competition. Limited training. |

---

## Application Notes

### Tumbling Normalization Example
At the reference level (NCAA STUNT, lambda = 1.000):
- A standing full earns an 80 band score for Standing Tumbling Difficulty

At All-Star Level 4 (lambda = 0.830):
- The 80 band equivalent is approximately a standing back tuck (one difficulty tier lower)
- A standing full at L4 would score higher than 80 because it exceeds the level's norms

At All-Star Level 6 (lambda = 1.050):
- The 80 band equivalent is between a standing full and a standing double full (slightly higher than reference)
- A standing full at L6 would score slightly below 80 because it is merely average at this level

### Stunt Normalization Example
At the reference level (NCAA STUNT, lambda = 1.000):
- Extension liberty with heel stretch earns an 80 band score for relevant stunt traits

At NAIA (lambda = 0.850):
- The 80 band equivalent is approximately extension liberty without advanced position
- Heel stretch at extension at NAIA would score higher than 80

At All-Star L6 (lambda = 1.050):
- The 80 band equivalent requires extension liberty with advanced position AND transition
- Extension liberty with heel stretch alone would score slightly below 80 at L6

---

## Multi-Level Athletes
When an athlete competes at multiple levels (e.g., college STUNT + All-Star club):
1. Evaluate using data from the PRIMARY level (matching Coach Context)
2. Use secondary level data as supporting evidence
3. Apply the PRIMARY level's lambda for trait scoring
4. The Level Tier Map shows how the resulting KR reads across all levels
5. Do NOT compute separate KRs for each level

---

## Lambda Governance
Lambda values are calibrated against known athletes whose performance spans multiple levels. Adjustment requires:
- Evidence from 10+ athletes with cross-level competition data
- No more than 0.02 adjustment per calibration cycle
- Documentation of calibration evidence
- Version increment on update
