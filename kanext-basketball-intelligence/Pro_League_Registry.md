# PRO LEAGUE REGISTRY -- v2

## Purpose
Source-of-truth for all professional basketball leagues worldwide. Provides context for pro evaluation, placement, salary projection, and draft pipeline analysis. Every pro-level output references this registry.

## Lambda Calibration Status
v0 -- directional estimates based on talent flow, NBA pipeline data, and league strength. Empirical calibration pending.

---

## TIER 1 -- ELITE GLOBAL LEAGUES

### NBA (National Basketball Association)
- Lambda: 1.000 (reference level)
- Country: USA / Canada
- Teams: 30
- Salary cap: ~$141M (2025-26)
- Rookie scale: Yes (slotted by draft position)
- Import rules: None (global draft)
- Season: October -- June (82 games + playoffs)
- Draft pipeline: College (primary), G-League Ignite, international
- Notes: The reference league. All other lambdas are relative to NBA.

### EuroLeague
- Lambda: 0.920
- Region: Europe (multi-country)
- Teams: 18
- Salary cap: No hard cap (budget-driven)
- Import rules: Varies by domestic league affiliation
- Season: October -- May (~34 games + playoffs)
- Draft pipeline: Regular NBA draft source. Luka, Sabonis, Manu all came through EuroLeague.
- Notes: Best non-NBA competition. Multiple NBA-caliber players.

---

## TIER 2 -- STRONG PROFESSIONAL LEAGUES

### ACB (Liga Endesa) -- Spain
- Lambda: 0.860
- Teams: 18
- Salary range: $100K -- $3M
- Draft pipeline: Real Madrid, Barcelona feeder system to NBA
- Notes: Historically the deepest European domestic league.

### BSL (Basketbol Super Ligi) -- Turkey
- Lambda: 0.840
- Teams: 16
- Salary range: $100K -- $2.5M
- Notes: Strong import market. Fenerbahce, Anadolu Efes compete in EuroLeague.

### Adriatic League (ABA)
- Lambda: 0.830
- Teams: 16
- Salary range: $50K -- $1.5M
- Draft pipeline: Consistent NBA talent developer (Jokic, Bogdanovic)
- Notes: Regional competition across former Yugoslav nations.

### Lega Basket (Serie A) -- Italy
- Lambda: 0.830
- Teams: 16
- Salary range: $80K -- $2M
- Notes: Historic league. Olimpia Milano, Virtus Bologna in EuroLeague.

### LNB (Pro A) -- France
- Lambda: 0.820
- Teams: 18
- Salary range: $80K -- $1.5M
- Draft pipeline: Tony Parker, Gobert, Wembanyama. Growing NBA pipeline.
- Notes: Best development league in Europe for NBA-bound players.

### ISL (Israeli Basketball Super League)
- Lambda: 0.810
- Teams: 12
- Salary range: $80K -- $2M
- Notes: Strong import spending. Maccabi Tel Aviv competes in EuroLeague.

---

## TIER 3 -- MID-LEVEL PROFESSIONAL LEAGUES

### NBL (National Basketball League) -- Australia
- Lambda: 0.850
- Teams: 10
- Salary range: $50K -- $800K
- Next Stars program: Yes (NBA draft pipeline)
- Draft pipeline: LaMelo Ball, Josh Giddey, Dyson Daniels all came through Next Stars.
- Notes: Primary NBA development pathway outside NCAA for international players.

### CBA (Chinese Basketball Association)
- Lambda: 0.800
- Teams: 20
- Salary range: $200K -- $4M (imports)
- Import rules: 2 foreign players per team
- Notes: High-paying for imports. Weaker domestic talent. Aging veteran destination.

### BBL (Basketball Bundesliga) -- Germany
- Lambda: 0.790
- Teams: 18
- Salary range: $50K -- $1M
- Notes: Growing league. Schroder, Theis developed here.

### B.League -- Japan
- Lambda: 0.780
- Teams: 24 (Division 1)
- Salary range: $100K -- $1.5M
- Notes: Expanding. Strong import market. Increasing budgets.

### KBL -- South Korea
- Lambda: 0.750
- Teams: 10
- Salary range: $50K -- $500K
- Notes: Smaller market. 1 import per team.

### G-League (NBA G League)
- Lambda: 0.780
- Teams: 31 (NBA-affiliated)
- Salary range: $45K -- $500K (two-way up to ~$560K)
- Draft pipeline: Direct to NBA via two-way contracts and call-ups
- Notes: NBA development league. High variance. Two-way contracts bridge G-League and NBA. For college players not drafted, G-League is the primary NBA pathway.

---

## TIER 4 -- LOWER PROFESSIONAL LEAGUES

### EuroCup (Basketball Champions League)
- Lambda: 0.800
- Notes: Second-tier European club competition.

### France Pro B
- Lambda: 0.720
- Salary range: $30K -- $200K

### Germany Pro A
- Lambda: 0.710
- Salary range: $20K -- $150K

### UK BBL (British Basketball League)
- Lambda: 0.700
- Salary range: $20K -- $100K

### NBB (Novo Basquete Brasil) -- Brazil
- Lambda: 0.730
- Salary range: $30K -- $300K

### PBA (Philippine Basketball Association)
- Lambda: 0.720
- Salary range: $20K -- $200K

### Liga Nacional -- Argentina
- Lambda: 0.720
- Salary range: $20K -- $200K

---

## TIER 5 -- ENTRY-LEVEL / SEMI-PROFESSIONAL

### Southeast Asian leagues (ABL, various domestic)
- Lambda: 0.620
- Salary range: $10K -- $80K

### African leagues (BAL, domestic)
- Lambda: 0.600 -- 0.650
- Salary range: $5K -- $50K

### Lower European domestic (Poland, Greece D2, Czech, etc.)
- Lambda: 0.650 -- 0.700
- Salary range: $15K -- $100K

---

## PLACEMENT GUIDANCE

When recommending a league for a player (Mode 5 Development / Mode 6 Pro Transition):

| Pro KR | Best League Fit | Why |
|--------|----------------|-----|
| 90+ | NBA | Only league that matches their talent level |
| 86-89 | NBA rotation or EuroLeague | Can start overseas or rotate in NBA |
| 82-85 | G-League or strong domestic (ACB, BSL, NBL) | Develop toward NBA or start overseas |
| 78-81 | Mid-tier domestic (LNB, BBL, Serie A, B.League) | Solid pro career, unlikely NBA |
| 73-77 | Lower domestic or G-League camp | Edge of pro viability |
| 68-72 | Entry-level / semi-pro | High churn, short contracts |

---

## GOVERNANCE

- Lambdas are v0 estimates
- Lambda updates require versioning
- League data updates annually
- Import rules and salary ranges approximate, vary by team
