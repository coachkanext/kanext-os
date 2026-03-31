# KaNeXT Women's Soccer Intelligence Knowledge Base

## Document Purpose
This knowledge base provides foundational context for the Nexus Women's Soccer Intelligence System. It covers the women's soccer ecosystem, key entities, structural differences from men's soccer, and reference data that informs evaluation, simulation, and downstream engines.

---

## 1. WOMEN'S SOCCER ECOSYSTEM OVERVIEW

### 1.1 Global Landscape (2025-26)
Women's soccer is in a period of unprecedented growth. Investment, visibility, media rights, and competitive quality are all increasing rapidly. Key inflection points:
- 2019 FIFA Women's World Cup (France): record viewership, catalyzed investment
- 2022-23: NWSL CBA established first full collective bargaining agreement. WSL went fully professional.
- 2023 FIFA Women's World Cup (Australia/New Zealand): expanded to 32 teams. Global growth confirmed.
- 2024-25: Record transfer fees, NWSL expansion to 16 teams, WSL minimum salary introduced
- 2025-26: NWSL 16 teams, WSL expanding to 14 (2026-27), Liga F growing, transfer market exploding

### 1.2 Key Structural Differences From Men's Soccer
1. **Salary structures are dramatically lower** but growing rapidly. Top women's salaries are ~$835K (Bonmati) vs $50M+ for top men's players.
2. **Transfer fees are nascent.** Record is ~$1.5M vs $200M+ in men's. But growth rate is exponential.
3. **No draft in NWSL** (eliminated 2025). Free agency is the primary player movement mechanism.
4. **College soccer is a primary development pathway** in the US. Most NWSL players come through the college system. This is not the case in men's soccer (academy system dominates).
5. **National team commitment is higher.** Women's players are expected to participate in more international windows, camps, and friendlies. This affects club availability.
6. **Pregnancy/motherhood is a career factor** that does not exist in men's soccer. Players take maternity leave and return, requiring suppression detection in evaluation.
7. **ACL injury rates are 2-6x higher** in women's soccer than men's. This is the single most impactful injury difference and must be accounted for in evaluation and development.
8. **Physical benchmarks differ.** Speed, strength, height, and stamina norms are calibrated to women's-specific ranges. A 170cm, 63kg forward is at a very different physical profile point than a 183cm, 78kg male forward.
9. **More college programs.** 320+ D1 women's soccer programs vs ~200 D1 men's. Nearly every D1 school sponsors women's soccer.
10. **Scholarship rules changed dramatically** in 2025-26 (House v. NCAA settlement).

---

## 2. COLLEGE WOMEN'S SOCCER

### 2.1 Program Landscape

| Level | Approximate # of Programs | Scholarship Limit (Traditional) | New Rules (2025-26) |
|---|---|---|---|
| NCAA D1 | 320+ | 14 equivalency | Roster cap 28, no scholarship cap (opt-in) |
| NCAA D2 | 270+ | 9.9 equivalency | Unchanged |
| NCAA D3 | 440+ | 0 (no athletic aid) | Unchanged |
| NAIA | 220+ | 12 | N/A |
| NJCAA D1 | 80+ | 18 | N/A |
| NJCAA D2 | 40+ | Varies | N/A |
| NJCAA D3 | 30+ | Varies | N/A |
| CCCAA | 50+ | N/A (CA community colleges) | N/A |
| USCAA | 30+ | Varies | N/A |
| NCCAA | 40+ | Varies | N/A |

Total: 1,500+ women's college soccer programs across all levels.

### 2.2 College Season Structure
- Fall season: ~20 matches (August-November)
- Conference play: typically 8-12 matches
- NCAA Tournament: 48-team field (D1), November-December
- College Cup (Final Four): December
- Spring: non-traditional season (limited matches, training emphasis)

### 2.3 Development Pathway
The typical American women's soccer development pathway:
1. Club soccer (ECNL, Girls Academy, MLS NEXT) ages 8-18
2. Youth National Team identification (U-14 through U-20) ages 13-19
3. College soccer (D1 primarily) ages 18-22
4. Professional (NWSL, European leagues) ages 20-35
5. Senior National Team ages 18-38

Alternative pathways:
- Skip college, sign pro directly (rare but increasing -- e.g., Olivia Moultrie)
- College + summer semi-pro (USL W League)
- College + early professional signing (mid-year from college to NWSL)
- International academy pathway (European clubs signing American youth)

### 2.4 Transfer Portal
The NCAA transfer portal is active in women's soccer. Key dynamics:
- Portal activity has increased dramatically since 2021
- One-time free transfer rule allows movement without sitting out
- Portal windows (May 1-15, Dec 1-15 for fall sports) concentrate movement
- Top portal targets can significantly shift Team KR
- Post-House settlement roster caps (28) may reduce portal volume as roster spots tighten

---

## 3. PROFESSIONAL WOMEN'S SOCCER

### 3.1 NWSL (National Women's Soccer League)

**Overview:**
- Founded: 2013
- Teams (2026): 16
- Season: March-November (30 regular season matches)
- Playoffs: Top 8, three-round knockout, Championship in November
- Governing body: NWSL (independent, US Soccer sanctioned)
- CBA: 2022-2030 (with 2024 amendments)

**2026 Teams:**
1. Angel City FC (Los Angeles)
2. Bay FC (San Jose)
3. Boston Legacy FC (Boston) - expansion 2026
4. Chicago Red Stars
5. Denver Summit FC (Denver) - expansion 2026
6. Houston Dash
7. Kansas City Current
8. NJ/NY Gotham FC
9. North Carolina Courage
10. Orlando Pride
11. Portland Thorns
12. Racing Louisville FC
13. San Diego Wave FC
14. Seattle Reign FC
15. Utah Royals FC
16. Washington Spirit

**Future expansion:** Atlanta (17th franchise, 2028). 18th franchise to be awarded in 2026 for 2028 entry.

**Key Financial Rules (2026):**
- Salary cap: $3.5M (base)
- High-Impact Player rule: additional $1M per team for qualifying star players
- Minimum salary: $48,500
- Maximum salary (base): $230,000
- Transfer fee threshold: $605,000 net (25% salary cap charge if exceeded)
- Salary cap trajectory: $3.5M (2026) -> $4.4M (2027) -> $5.1M (2030)

### 3.2 WSL (Women's Super League, England)

**Overview:**
- Founded: 2010 (rebranded from FA WSL)
- Teams (2025-26): 12 (expanding to 14 in 2026-27)
- Season: September-May
- Operated by: WSL Football (independent from FA since 2024)

**2025-26 Teams:**
Arsenal, Aston Villa, Brighton, Chelsea, Crystal Palace, Leicester City, Liverpool, London City Lionesses, Manchester City, Manchester United, Tottenham, West Ham

**Key Financial Context:**
- Soft salary cap: 40% of club revenue
- Minimum salary introduced 2025-26 (full-time wage)
- Average salary ~GBP 47,000
- Top earners: GBP 300K-500K+ (Sam Kerr, top Chelsea/Arsenal players)
- Nike partnership providing equipment to all players
- UWCL qualification for top 3

### 3.3 Liga F (Spain)

**Overview:**
- Spain's top women's league
- Barcelona Femeni dominant (UWCL winners 2023, 2024)
- Minimum salary: EUR 23,500 (2025-26)
- Top earners: EUR 400K-835K (Bonmati, Putellas at Barca)
- Growing investment from men's clubs

### 3.4 Division 1 Feminine (France)

**Overview:**
- Olympique Lyonnais historically dominant (8x UWCL winners)
- PSG Feminines rising challenger
- Average salary lower than WSL
- Strong academy systems

### 3.5 Frauen-Bundesliga (Germany)

**Overview:**
- Bayern Munich and VfL Wolfsburg dominant
- Average salary ~EUR 42,000/year
- Strong development infrastructure
- 12 teams

### 3.6 Other Key Leagues
- **Serie A Femminile (Italy):** Juventus Women leading professionalization. Growing.
- **Damallsvenskan (Sweden):** Strong domestic league. Key development league for Scandinavian talent.
- **A-League Women (Australia):** Growing post-2023 World Cup.
- **Liga MX Femenil (Mexico):** Large league, improving quality. Tigres Femenil internationally competitive.
- **Toppserien (Norway):** Small but high quality per capita.

---

## 4. INTERNATIONAL WOMEN'S SOCCER

### 4.1 FIFA Women's World Rankings Context
The top-ranked nations (approximate 2025-26):
1. Spain (World Cup champions 2023)
2. England
3. USA
4. Germany
5. France
6. Sweden
7. Canada
8. Netherlands
9. Japan
10. Brazil

### 4.2 Key International Tournaments
- **FIFA Women's World Cup:** Every 4 years (next: 2027 in Brazil, 32 teams)
- **Olympic Games:** Every 4 years (next: 2028 LA, 12 teams)
- **UEFA Women's Euro:** Every 4 years (2025 in Switzerland)
- **Copa America Femenina:** Regional qualification
- **CONCACAF W Championship:** Olympic/World Cup qualifying for North/Central America
- **SheBelieves Cup / other invitationals:** Annual friendlies

### 4.3 Youth International Structure
- **U-17 Women's World Cup:** Every 2 years
- **U-20 Women's World Cup:** Every 2 years
- **CONCACAF U-17 / U-20 Championships:** Qualification pathway
- Youth national team camps occur year-round, particularly during college spring season

---

## 5. KEY ENTITIES AND STAKEHOLDERS

### 5.1 Governing Bodies
- **FIFA:** Global governance, World Cup, UWCL, transfer regulations
- **UEFA:** European competitions, WSL/Liga F/D1F/Frauen-BL governance
- **CONCACAF:** North/Central American governance, NWSL sanctioning
- **US Soccer:** USWNT, NWSL sanctioning, youth development
- **NCAA:** College athletics governance, scholarship rules, eligibility
- **NAIA:** Small-college athletics
- **NJCAA:** Junior college athletics

### 5.2 Key Data Sources
- **FBref:** Most comprehensive free source for women's soccer stats (NWSL, WSL, Liga F, D1F, Frauen-BL, Serie A Femminile)
- **American Soccer Analysis:** NWSL advanced analytics
- **StatsBomb:** Event-level data for select women's leagues
- **Opta:** Match event data (limited women's coverage vs men's)
- **NCAA.com:** Official college stats
- **TopDrawerSoccer:** College recruiting and rankings
- **College Soccer News:** Rankings, awards, analysis
- **The Equalizer:** Women's soccer journalism
- **All For XI:** NWSL analysis
- **Just Women's Sports:** Women's sports coverage
- **SheKicks:** WSL coverage

---

## 6. EVALUATION CONTEXT NOTES

### 6.1 Scoring Rate Norms
Women's soccer scoring rates differ from men's:
- NWSL average: ~2.4 goals per match (combined)
- WSL average: ~2.6 goals per match
- NCAA D1 women's: ~2.8 goals per match (combined)
- These are slightly lower than equivalent men's levels

### 6.2 Physical Profile Norms
Average physical profiles in women's pro soccer:
- Height: 167-170cm (GKs: 172-178cm)
- Weight: 60-66kg
- Sprint speed: elite = ~28-30 km/h (vs 33-36 km/h men's)
- Average distance covered/90: ~9.5-10.5 km (vs 10.5-12.0 km men's)
- High-intensity running: ~1.5-2.5 km/90 (vs 2.5-3.5 km men's)

### 6.3 ACL Injury Epidemic
ACL injuries are the defining injury concern in women's soccer:
- Women's ACL injury rate: 2-6x higher than men's
- Average return-to-play: 9-14 months
- Re-injury rate: ~20-30% (significantly higher than men's)
- Impact on evaluation: prior ACL = mandatory suppression detection for 18 months post-return
- Impact on development: ACL prevention protocols are mandatory in all development plans
- Career impact: some players never fully recover to pre-injury level; others return stronger (medical and rehab quality matters enormously)

### 6.4 Pregnancy and Career Continuity
Women's soccer increasingly accommodates pregnancy and motherhood:
- NWSL: parental leave allows salary cap-exempt replacement
- WSL: maternity leave policies vary by club
- Players who return post-pregnancy often need 6-18 months to reach pre-pregnancy production
- System must detect and account for this (see Suppression Detection in File 01)
- Notable examples of successful returns: Alex Morgan, Sydney Leroux, Crystal Dunn, Becky Sauerbrunn, Sophia Wilson (Portland Thorns, returning 2026)

### 6.5 Dual Career / Outside Employment
Despite professionalization, some women's soccer players still hold outside employment:
- Primarily at lower WSL clubs, lower European leagues, and NWSL minimum-salary players
- This is rapidly changing as minimum salaries increase
- Does not directly affect KR evaluation but affects training time and development speed
- CIM (Coaching Impact Modifier) can capture this: programs with full-time professional environments enable faster development

---

## 7. SYSTEM ARCHITECTURE SUMMARY

The Women's Soccer Intelligence System uses identical architecture to men's soccer:

| Component | File | Status |
|---|---|---|
| Master Protocol (SKILL.md) | 07_Nexus_WSoc_Intelligence_Skill_v1 | Active |
| Player Evaluation Process | 01_WSoc_Player_Eval_Process_v1 | Active |
| Player Evaluation Reference | 02_WSoc_Player_Eval_Reference_v1 | Active |
| Team Intelligence | 03_WSoc_Team_Intelligence_v1 | Active |
| Simulation Engine | 04_WSoc_Simulation_Engine_v1 | Active |
| Scouting & Match Ops | 05_WSoc_Scouting_Match_Ops_v1 | Active |
| Downstream Engines | 06_WSoc_Downstream_Engines_v1 | Active |

### What's Identical to Men's Soccer:
- 8 trait clusters (54 traits)
- 28 archetypes
- 14 offensive systems + 10 defensive systems
- Phase 3 anchor-first evaluation protocol
- Phase 6 component KR adjustment (+/-10 rule)
- OPF position weighting structure
- Team KR pipeline (13-step)
- OSIE/DSIE system inference
- Match simulation model
- 4-phase match ops flow
- Development engine structure
- Governance rules

### What's Different (Women's Soccer-Specific Content):
- Trait scoring bands (women's production norms)
- Physical tool benchmarks (women's-specific height/speed/strength/stamina)
- College KLVN lambdas (adjusted for women's landscape depth)
- College KR Legends (women's production benchmarks at all 14 levels)
- Pro KLVN (WSL = 1.000 anchor, NWSL = 0.950, plus all women's leagues)
- Pro League KR Legends (NWSL, WSL, Liga F, D1F, Frauen-BL, Serie A Femminile, etc.)
- Pro Team Registry (NWSL 16 teams + European top clubs)
- Pro Salary Framework (NWSL salary cap structure, WSL/European wages)
- Scholarship allocation (post-House settlement rules)
- Suppression detection (pregnancy/motherhood + ACL-specific)
- Pro Transition Engine (no NWSL draft, free agency pathway, NWSL vs Europe decision)
- Youth National Team Pipeline (prominent in women's soccer)
- OPF weights (slightly adjusted for women's positional demands)
- Physical Mismatch Modifiers (women's-specific norms)
- Set piece modeling (GK height factor, higher set piece goal %)

---

## VERSION HISTORY
- v1.0: Initial women's soccer intelligence knowledge base. Comprehensive coverage of ecosystem, college landscape (320+ D1 programs), professional leagues (NWSL 16 teams + European), international structure, evaluation context, physical norms, ACL injury context, pregnancy/career continuity, and system architecture mapping.
