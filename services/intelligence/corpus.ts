/**
 * KaNeXT Intelligence Knowledge Base v2
 * Covers Dipson intelligence capabilities, evaluation systems, and how KaNeXT intelligence works.
 */

export const DIPSON_KB = `# KaNeXT Intelligence System - Complete Knowledge Base

## Version 2.0 - April 2026

This is the comprehensive reference document for the entire KaNeXT intelligence ecosystem. It covers every intelligence domain, every module, every governance layer, and every decision framework across the platform. Dipson references this document to answer any question about the intelligence system - from basketball evaluation to NIL compliance to market calibration to league governance to pro transitions.

---

# PART 1: THE INTELLIGENCE ARCHITECTURE

---

## 1. What Is the KaNeXT Intelligence System

KaNeXT Intelligence is a universal, deterministic, auditable evaluation and decision system that produces structured outputs across four intelligence domains: Sport Intelligence (player evaluation, team evaluation, simulation, scouting, development, pro transition), NIL Intelligence (valuation, compliance, allocation, market tracking), Market Intelligence (betting market calibration, player prop benchmarking, line movement detection, simulation validation), and League Governance Intelligence (rules, roster limits, scholarships, transfers, eligibility, compliance across every governing body from NCAA D1 through pro leagues worldwide).

The system was designed on a single architectural principle: same inputs produce the same outputs, every time. No randomness. No editorial override. No truth mutation. Every output includes a confidence percentage. Every step is logged and auditable. Missing data is UNSCORED, never guessed.

The intelligence lives inside the KaNeXT app through Dipson (the AI system). Coaches, ADs, compliance officers, scouts, agents, athletes, collective leaders, CFOs, and investors do not navigate spreadsheets or reference manuals. They talk to Dipson. Dipson references the intelligence files and produces structured, honest, legally-informed, confidence-gated answers.

### 1.1 Who It Serves

- Head Coaches: Player evaluation, roster construction, scouting, game ops, development planning, NIL allocation, recruiting intelligence, simulation
- Athletic Directors: Cross-sport NIL budget optimization, revenue sharing, Title IX analysis, institutional risk, governance compliance
- Compliance Officers: NIL deal review, red flag detection, reporting workflow, audit trail, governing body rule reference
- Collective Leaders: Market intelligence, athlete valuation, allocation efficiency, compliance guardrails
- CFOs / Business Officers: NIL ROI analysis, revenue impact modeling, budget forecasting
- Athletes: Personal KR, NIL valuation, brand marketplace matching, deal structure guidance, "Where Do I Fit" school matching
- Scouts / Agents: Player evaluation, pro projection, draft analysis, salary framework, league placement
- Presidents / Board: Institutional risk assessment, regulatory compliance posture, competitive positioning
- Investors: System architecture understanding, competitive moat, market opportunity

### 1.2 Core Principles (Apply to Every Intelligence Output)

1. Deterministic: Same inputs produce the same outputs. No randomness, no editorial override.
2. Auditable: Every step logged with inputs, outputs, confidence, and timestamps.
3. No truth mutation: Downstream engines NEVER modify upstream outputs. Player KR, Team KR, archetypes, and system identity flow one direction.
4. Confidence transparency: Every output includes confidence_pct. The system is transparent about uncertainty.
5. No data fabrication: If data is missing, the trait/metric is UNSCORED. The system never guesses.
6. Legend is display-only: Legend labels interpret KR values. They do not produce or modify KR values.
7. KLVN normalization: All cross-level comparisons use KLVN lambdas. Lambda normalizes INPUTS (production stats during trait scoring), not OUTPUTS. There is no "D1-equivalent KR." One universal KR with multiple legend interpretations via the Level Tier Map.
8. Web search for current data: The knowledge files contain the SYSTEM. Web search provides the DATA about specific players, games, rules, and market conditions.
9. No em dashes in any output. Use regular dashes or rewrite sentences.
10. Coach confirms: All recommendations are recommendations. Humans make final decisions.

---

## 2. The Four Intelligence Domains

### Domain 1: Sport Intelligence

The core evaluation and decision engine. Currently fully built for basketball. Multi-sport stacks complete for football, soccer, baseball, softball, beach volleyball, men's and women's golf, men's and women's track and field, cheer/STUNT, and women's flag football. Women's basketball, women's soccer, and women's volleyball intelligence prompts pending.

Basketball is the crown jewel and the fully calibrated reference implementation. All other sports follow the same architecture: Player KR evaluation pipeline, Team KR pipeline, Simulation Engine, Scouting and Game Ops, Development Intelligence, and Pro Transition Intelligence.

Sport Intelligence files (basketball):
| File | Name | Size | Contents |
|---|---|---|---|
| 01 | Player Eval Process | ~37K | Pipeline steps, V1 Protocol, Contextual Mode, Suppression Detection, Multi-Level Protocol, Confidence Gate |
| 02 | Player Eval Reference | ~272K | Trait Library (47 traits, 8 clusters), Archetype Library (21 archetypes), System Demand Profiles (12 offense, 10 defense), Badges (34), Overrides, System Risks, Impact Modifiers, KLVN, College KR Legends (14 levels), Pro KR Legend, Position Trait Weighting (OPF) |
| 03 | Team Intelligence | ~127K | Team KR Pipeline (13-step execution), OSIE, DSIE, Team KR Legends, Scholarship/NIL Allocation Engine, Roster Decision Intelligence v2 |
| 04 | Simulation Engine | ~211K | Interaction Library (System x System 120 entries, Offense Archetype x Defense System 210 entries, Defense Archetype x Offense System 252 entries), Possession Engine, Physical Mismatch Modifiers |
| 05 | Scouting and Game Ops | ~20K | Scouting Confidence Gates, 4-phase Game Ops flow (Pregame, In-Game, Halftime, Postgame) |
| 06 | Downstream Engines | ~46K | Development Intelligence Engine, Pro Transition Intelligence Engine, Coaching Impact Modifier v1.0 |

Supporting files:
| File | Contents |
|---|---|
| BPR v2 Spec | Basketball Performance Rating - single-game player impact metric |
| TPQ v1 Spec | Team Performance Quality - team-level single-game performance |
| Pro KR Legend Updated | Pro Player KR tiers with draft-range context, cap %, Entry/Median/Peak distinction |
| Pro KR Calibration Reference | 12-player calibration set (Jokic through Flagg) with component KRs and insights |
| Pro Salary Framework | KR-to-salary mapping using cap % as primary unit (NBA) and raw dollars (international) |
| Pro League Registry | 30+ professional leagues worldwide with lambdas, salary ranges, draft pipelines |
| Pro Team Registry NBA | All 30 NBA teams with HC, offensive system, defensive system, competitive window, draft priority |
| Pro KLVN Lambdas | Cross-level normalization coefficients for pro leagues |
| Legend files (14) | KR legends for NCAA D1 HM/MM/LM, NCAA D2, NCAA D3, NAIA, NJCAA D1/D2/D3, CCCAA, USCAA, NCCAA D1/D2 |

### Domain 2: NIL Intelligence

A universal NIL valuation, compliance, allocation, and market intelligence system that produces deterministic, auditable outputs for any college athlete at any level, in any sport. Built as a cross-sport module because NIL rules and valuation apply identically whether the athlete plays basketball, football, soccer, or tennis at the same institution.

NIL Intelligence files:
| File | Name | Size | Contents |
|---|---|---|---|
| 01 | NIL Valuation Intelligence | ~28K | Player NIL Value (PNV) model with four input clusters: Social Media Value, Athletic Value, Market Value, Personal Brand Value. Seven valuation tiers from Elite ($500K-5M+) to None ($0). Comparables database. Confidence gate. |
| 02 | NIL Compliance Intelligence | ~31K | Federal law (no federal statute, tax, Title IX, employment). State NIL laws (four categories). NCAA post-House settlement rules. CSC enforcement. Institutional compliance framework. Collective compliance. Revenue sharing compliance. Compliance decision tree. Risk scoring. |
| 03 | NIL Allocation Intelligence | ~20K | NIL pool construction. Sport allocation. PTV-based player allocation. Market pressure adjustments. Constrained optimization. Scenario modeling. Five efficiency metrics. Portal NIL intelligence. Multi-year planning. Cross-sport allocation. |
| 04 | NIL Market Intelligence | ~22K | Market size and concentration. Deal analytics (averages by sport, structures, duration, exclusivity). Brand intelligence. Recruiting NIL market. Risk flags. Data sources. Market forecasting. Conference benchmarks. |
| 05 | Dipson NIL Intelligence Skill | ~15K | Routing wrapper. Seven modes. Data gathering protocol. Governance rules. |

### Domain 3: Market Intelligence (Calibration Layer)

A calibration layer that uses publicly available betting market data (spreads, moneylines, totals, player props) as supplementary signals for the KaNeXT intelligence system. This is NOT a gambling module. Market data is used identically to how a financial analyst uses stock prices - as a money-backed consensus signal. No output from this module should ever recommend, suggest, or imply a bet.

Market Intelligence files:
| File | Name | Size | Contents |
|---|---|---|---|
| 01 | Market Calibration Intelligence | ~21K | Spread-to-team-strength conversion (basketball, football, soccer, baseball, hockey), moneyline-to-win-probability, total-to-pace/quality signal, Team KR alignment analysis, cross-sport market efficiency |
| 02 | Player Prop Intelligence | ~17K | Prop benchmarks by sport (basketball points/rebounds/assists/3PM/PRA, football passing/rushing/receiving, baseball batter/pitcher, soccer goalscorer/SOT, hockey skater/goalie), prop-to-KR alignment, context adjustment rules |
| 03 | Line Movement Intelligence | ~16K | Movement classification (information/sharp/public), detection thresholds by sport, timing analysis, suppression signal extraction, reverse line movement, tracking protocol |
| 04 | Simulation Validation Intelligence | ~18K | MAE/RMSE/bias metrics, win probability calibration, bias detection and correction, sport-specific validation frameworks, calibration feedback loop, reporting templates |

### Domain 4: League Governance Intelligence

Comprehensive rules reference for every governing body and professional league the system operates within. Covers roster management, scholarships, transfer rules, academic eligibility, recruiting, NIL, revenue sharing, practice and competition limits, and compliance enforcement.

College Governance files:
| File | Governing Body | Size | Key Contents |
|---|---|---|---|
| NCAA D1 Governance | NCAA Division I | ~44K | Post-House settlement rules, roster limits (105 FBS football through all sports), equivalency scholarship model, revenue sharing ($20.5M cap), CSC enforcement, NIL Go, transfer portal rules, APR, academic eligibility, recruiting calendar, practice limits |
| NCAA D2 Governance | NCAA Division II | ~25K | Equivalency sports, roster and scholarship limits, partial House settlement opt-in provisions, academic requirements, transfer rules |
| NCAA D3 Governance | NCAA Division III | ~19K | No athletic scholarships, need-based aid only, no revenue sharing, recruiting limitations, academic integration |
| NAIA Governance | NAIA | ~17K | 24-sport governance, scholarship equivalencies, eligibility center, transfer rules, independent NIL framework (NAIA had NIL before NCAA) |
| NJCAA Governance | NJCAA | ~18K | Three-division structure, scholarship rules per division, eligibility, 2-year transfer pathway, academic requirements |

Professional Governance files:
| File | League | Size | Key Contents |
|---|---|---|---|
| NBA CBA Governance | NBA | ~21K | Salary cap structure, rookie scale, max contracts, luxury tax, trade rules, free agency, two-way contracts, G-League assignment, draft rules |
| NFL CBA Governance | NFL | ~17K | Salary cap, franchise tag, practice squad, roster limits, injured reserve, compensatory picks, restricted free agency |
| MLB CBA Governance | MLB | ~11K | Competitive balance tax, arbitration, minor league structure, Rule 5 draft, international signing bonus pool, service time |
| NHL CBA Governance | NHL | ~11K | Salary cap, entry-level contracts, restricted free agency, waiver rules, AHL assignment |
| MLS Rules Governance | MLS | ~6K | Designated Player rule, salary budget, allocation money, Homegrown Players, international slots, GAM/TAM |
| NWSL CBA Governance | NWSL | ~6K | Salary structure, allocation money, NWSL draft, free agency, expansion draft |
| European Football Governance | UEFA/FIFA | ~11K | Transfer windows, Financial Fair Play/UEFA Financial Sustainability Regulations, solidarity payments, training compensation, sell-on clauses |
| International Transfer Governance | FIFA | ~10K | International transfer regulations, TMS, minor protections, loan rules, agent regulations |
| Boxing Governance | Boxing | ~7K | Sanctioning body structure (WBC/WBA/IBF/WBO), purse splits, mandatory challengers, weight classes, drug testing |
| MMA Governance | UFC/MMA | ~8K | UFC contract structure, champion clauses, weight classes, USADA testing, performance bonuses, rankings |

### Domain 5: Institutional Intelligence

The operational intelligence layer for the institution itself. 17 modules covering every operational dimension of any organization type (university, K-12 school, church/ministry, nonprofit, business, hospital, sports organization). Each module follows the same 8-file architecture as sport intelligence: Eval Process (File 01), Eval Reference (File 02), Portfolio/Team Intelligence (File 03), Simulation Engine (File 04), Operations/Ops (File 05), Downstream Engines (File 06), Dipson Skill (File 07), Evidence and Calibration Appendix (File 08). All at v3+ template standard with critiques applied.

Universal institutional architecture: Phase 3 production anchor, Phase 6 component KRs, KLVN normalization (with anti-excuse clause locked across all modules), suppression detection (with Confidence Degradation locked), confidence gates, legends as default interpretive priors. Architecture is universal - FMU and Miami references in intelligence files are deployment examples, not constraints.

Institutional Intelligence modules (17 modules, 136 files, 35,343 lines):

| Module | Version | Lines | Component KRs | Key Features |
|---|---|---|---|---|
| Admissions | v3 | 4,190 | PKR (Profile), AKR (Academic), EKR (Engagement with T3+ signal layers), IQKR (Institutional Fit) | Shadow melt detection, yield prediction, enrollment funnel intelligence |
| Real Estate | v4 | 3,591 | LKR (Location with Transit-Time Lambda), FKR (Financial with 3 modes), DKR (Development), SKR (Strategic) | Levered/Unlevered discipline, ESG overlay, replacement reserve, PIS, expansion opportunity detection |
| Acquisition | v3 | 3,491 | FKR (Financial), OKR (Operational), SKR (Strategic with anti-rationalization), IKR (Integration) | Thesis drift monitoring, integration readiness score, post-acquisition decay tracking, +5 max suppression (lowest of any domain), Confidence Degradation locked |
| Hiring | v3 | 3,474 | SKR (Skill), EKR (Experience), CKR (Cultural Fit with anti-bias guard), AKR (Adaptability) | System fit for institutional culture, coaching staff evaluation, faculty hiring, executive team assessment |
| Student Success | v3 | 2,440 | AKR (Academic), EKR (Engagement), WKR (Wellbeing), CKR (Career Readiness) | Retention prediction, intervention triggers, graduation pathway intelligence |
| Sales/Revenue | v3 | 2,053 | PKR (Pipeline), CKR (Conversion), RKR (Retention with guardrails), EKR (Efficiency) | Non-commercial native pipeline stages (church 6-stage, nonprofit 6-stage, sports 3-stream), sector overlays |
| Financial | v3 | 2,017 | RKR (Revenue Health), EKR (Expense Discipline), LKR (Liquidity), SKR (Sustainability) | Endowment management, tuition dependency analysis, auxiliary revenue optimization |
| Operations | v3 | 1,754 | PKR (Process), CKR (Capacity), QKR (Quality), EKR (Efficiency with anti-lean-dysfunction) | Staffing engine embedded, space utilization, workflow intelligence |
| Marketing | v3 | 1,673 | BKR (Brand), DKR (Digital), CKR (Content), AKR (Audience) | Enrollment marketing integration, brand health monitoring |
| Compliance | v3 | 1,676 | RKR (Regulatory), PKR (Policy), TKR (Training), AKR (Audit Readiness) | Cross-module compliance feeds, accreditation monitoring |
| Fundraising | v3 | 1,634 | DKR (Donor), CKR (Campaign), SKR (Stewardship), PKR (Pipeline) | Major gift intelligence, planned giving, annual fund optimization |
| Staffing | v3 | 1,448 | CKR (Capacity), QKR (Quality), SKR (Stability), EKR (Efficiency) | Cross-module consumption (Hiring + Financial + Operations + Curriculum), workforce planning |
| Curriculum | v3 | 1,398 | QKR (Quality), RKR (Relevance), DKR (Delivery), IKR (Innovation) | Faculty workload analysis, program viability, accreditation alignment |
| Technology | v3 | 1,195 | IKR (Infrastructure), SKR (Security with critical override), RKR (Reliability), EKR (Efficiency) | SKR critical override caps composite at 65 for security failures (locked), vulnerability suppression exclusion (locked) |
| Risk/Legal | v3 | 1,199 | LKR (Litigation), CKR (Compliance Risk), RKR (Reputational), OKR (Operational Risk) | Crisis preparedness, insurance adequacy, contract management |
| Facilities | v3 | 1,151 | CKR (Condition using FCI), MKR (Maintenance with PM ratio), UKR (Utilization), EKR (Efficiency) | Safety override caps at 65 (locked), safety violations never eligible for suppression (locked), building age lambda, FCI benchmarks from APPA/NACUBO |
| Communications | v3 | 1,059 | MKR (Media Relations), CKR (Crisis Communications), GKR (Government/Community), TKR (Trust/Narrative) | Clear Marketing boundary, church TKR at 50%, narrative coherence assessment, crisis-unpreparedness exclusion from suppression (locked) |

Key institutional intelligence fixes (LOCKED):
1. Annual legend tier audits all modules
2. Admissions EKR only T3+ verified engagement moves KR
3. Real Estate: Transit-Time Lambda in LKR + Market Cycle Lambda in KLVN
4. Hiring: Adaptability sub-score in GKR
5. Acquisition: Confidence Degradation on suppression adjustments
6. Architecture IS universal - FMU/Miami references are deployment examples, not constraints

---

## 3. How the Domains Connect

The four domains are not silos. They connect at specific integration points:

### Sport Intelligence to NIL Intelligence
- Player KR (from Sport File 01) feeds the Athletic Value (AV) cluster in NIL Valuation (NIL File 01)
- PTV (Player Team Value from Sport File 03) is the team-specific value input to NIL Allocation (NIL File 03)
- System Fit % (from Sport File 03) informs PTV computation
- Team KR Delta (from Sport File 03) feeds NIL efficiency metrics
- Scholarship allocation (from Sport File 03) co-optimizes with NIL allocation

### Sport Intelligence to Market Intelligence
- Team KR differential (from Sport File 03) compares against market-implied team strength (Market File 01)
- Player KR-implied production (from Sport legend interpretation) compares against player props (Market File 02)
- Simulation Engine outputs (from Sport File 04) validate against closing lines (Market File 04)
- Suppression detection (from Sport File 01) cross-references with line movement signals (Market File 03)

### NIL Intelligence to League Governance
- NIL compliance assessment (NIL File 02) references the specific governing body's rules from Governance files
- Revenue sharing cap and allocation (NIL Files 02-03) reference NCAA D1 Governance for House settlement terms
- Roster limits and scholarship structures (NIL File 03) reference the appropriate governance file
- Transfer portal NIL (NIL File 03) references transfer rules from governance files

### Market Intelligence to Sport Intelligence
- Team KR alignment analysis (Market File 01) flags divergences between KR assessment and market consensus
- Player prop divergence (Market File 02) triggers Player KR investigation when gap exceeds 30%
- Line movement signals (Market File 03) feed suppression detection and intelligence system updates
- Simulation validation metrics (Market File 04) calibrate the Simulation Engine (Sport File 04)

### Institutional Intelligence Internal Cross-Module Connections
- Staffing Intelligence consumes from Hiring (pipeline), Financial (compensation), Operations (capacity), and Curriculum (faculty workload)
- Acquisition Intelligence consumes from Real Estate (property analysis) and Financial (deal structure) - Real Estate provides property truth, Acquisition provides portfolio context
- Compliance Intelligence feeds every module with regulatory requirements
- Financial Intelligence provides budget constraints to every module that allocates resources
- Risk/Legal Intelligence monitors exposure signals from every module
- Technology Intelligence provides infrastructure health context to Operations and Facilities
- Facilities Intelligence is distinct from Real Estate - RE owns acquisition, Facilities owns ongoing management of what you already have
- Communications Intelligence is distinct from Marketing - Marketing owns campaigns and conversion, Communications owns institutional narrative and crisis messaging

### Institutional Intelligence to Sport Intelligence
- Hiring Intelligence evaluates coaching candidates using system fit and institutional culture alignment
- Financial Intelligence constrains scholarship and NIL allocation budgets
- Compliance Intelligence ensures recruiting and NIL activities meet governing body rules
- Facilities Intelligence tracks athletic facility condition and capital needs
- Admissions Intelligence processes student-athlete applications through the same pipeline as general admissions, with athletic KR as an additional signal

### Institutional Intelligence to NIL Intelligence
- Financial Intelligence provides the institutional budget constraints for revenue sharing allocation
- Compliance Intelligence provides the regulatory framework for NIL deal review
- Admissions Intelligence provides enrollment context for student-athlete NIL decisions
- Fundraising Intelligence tracks collective and booster contributions that fund NIL pools

---

## 4. The KR System - Universal Rating

KR (KaNeXT Rating) is the universal measurement unit across the entire intelligence system. It operates on a 0-100 scale with the following properties:

- KR is universal and never converted. KLVN normalizes inputs during trait scoring, not outputs. There is no "D1-equivalent KR."
- One player = one KR = multiple legend interpretations. A player with KR 85 reads differently at D1 HM (Solid Starter) vs NAIA (Elite Anchor). Same number, different context via Level Tier Map.
- Phase 3 (Production Anchor) is the primary KR determinant. Map the player's full production profile against the legend tier descriptions at their level. Find the tier whose production description matches. That tier's KR range is the anchor.
- Phase 6 (Component KRs: OKR, DKR, TKR, IQKR) adjusts within the anchor range (+/- 10 points max). It does not replace the anchor.
- Entry KR does not correlate with draft order. First-round rookies fall in the 84-88 range regardless of draft position. The draft pays for the gap between entry and peak.
- System Fit % is the most predictive variable beyond raw talent. Teams above 97% fit consistently overperform their raw Team KR.
- Suppression detection is critical. Role suppression, injury context, and late-season performance must be weighted against season-long averages.
- Physical data must be T3-confirmed before finalizing evaluations. Listed weights and measurements are frequently wrong.

### KR Extends Beyond Basketball

KR applies to every domain:
- Player KR: Individual athlete evaluation (any sport with intelligence files built)
- Team KR: Team-level evaluation (offensive Team KR + defensive Team KR)
- Driver/Constructor/Crew KR: K-1 Racing League (under OSK Group)
- Institutional KR: (future) Institutional health metrics across the IOA platform

---

## 5. How PNV Connects to PTV

This is the core competitive intelligence of the NIL system. Two values, one gap:

PNV (Player NIL Value) from NIL File 01: What the open market values this athlete's NIL at. Based on social media, athletic performance, market context, and personal brand. This is what brands and collectives would pay.

PTV (Player Team Value) from each sport's Team Intelligence file: What this specific athlete is worth to this specific team. Based on Player KR, System Fit, demand coverage, and Team KR Delta. This is what the athlete contributes to winning.

The gap between PTV and PNV is the intelligence edge:
- When PTV >> PNV: The athlete is undervalued by the market. Buying opportunity.
- When PTV = PNV: Fairly priced. Standard decision.
- When PNV >> PTV: The athlete is overpriced. Market is paying for brand, not team value.

No other system in college athletics can compute this gap because no other system has both the market valuation model AND the team-specific intelligence to measure what a player actually contributes.

---

# PART 2: THE PRODUCT SURFACE

---

## 6. How Intelligence Surfaces in the App

The intelligence system is not a standalone analytics tool. It is embedded into every decision point in the KaNeXT Institutional Operating System through Dipson (the AI system) and through the app's native UI surfaces.

### Dipson (AI System)
- Live on physical device via TestFlight
- Backend deployed at kanext-backend-production.up.railway.app
- Uses Claude with intelligence files as system prompt
- Tiered API: Haiku for general queries, Sonnet for basketball intelligence with prompt caching on static intelligence files
- Conversational interface for all intelligence queries
- Multi-mode routing: basketball evaluation, NIL valuation, compliance check, market calibration, governance reference, scouting report, simulation, development plan, pro projection

### App Surfaces That Use Intelligence
- Roster tile: Player KR, archetype badges, BPR, System Fit %, component KR breakdowns, suppression detection
- Board tile (Recruiting): Player Pool search with KR filtering, portal tracking with KR ratings, "Quick Evaluate" on any player
- Booster tile: NIL allocation tables, PTV-based recommendations, revenue sharing dashboard, compliance status
- KStat: Live game data capture that feeds BPR and TPQ computation
- "Where Do I Fit" (Recruit view): Level Tier Map showing what their KR means at every level, best-fit programs by System Fit %

### KTV Integration
- Game broadcasts enhanced with KR overlays, real-time BPR, archetype displays
- Scouting film with intelligence annotations
- Pro projection content for draft-eligible players

### KPay Integration
- NIL payment settlement chain: initiated, authorized, executed, settled, audited in a single traceable flow
- "Stake an Athlete" fan-funded NIL
- Revenue sharing distribution
- Compliance audit trail on every transaction

---

## 7. Market Intelligence as Calibration (Not Gambling)

This distinction is critical and must be maintained in every output.

KaNeXT uses publicly available betting market data (spreads, moneylines, totals, player props) as a calibration layer for the intelligence system. This is identical to how a financial analyst uses stock prices, bond yields, or commodity futures as consensus signals.

What the market intelligence module DOES:
- Converts spreads to implied team strength differentials and compares against Team KR
- Converts moneylines to true win probabilities (vig removed) and compares against simulation output
- Uses totals as pace and quality signals for game context
- Benchmarks player props against KR-implied production (with context adjustment for game total, matchup, and spread)
- Detects line movement and classifies it as information-driven, sharp-driven, or public-driven
- Validates simulation accuracy against closing lines using MAE, RMSE, and bias metrics
- Flags divergences between market consensus and intelligence system assessments for investigation

What the market intelligence module NEVER does:
- Recommends, suggests, or implies a bet
- Uses language like "good value," "sharp play," "overlay," or any betting terminology that implies a wagering recommendation
- Presents odds as an invitation to wager
- Defaults to market over the intelligence system when they conflict (both perspectives are presented)
- Fabricates market signals where none exist (small-school games, lower divisions, non-revenue sports)

Data source: The Odds API (the-odds-api.com). Free Starter tier: 500 credits/month. Covers NBA, NCAAB, NCAAF, NFL, MLB, NHL, MLS, EPL, La Liga, Serie A, Bundesliga, Ligue 1, UFC/MMA.

---

## 8. The Compliance Challenge

NIL compliance is a moving target. As of April 2026, the landscape is governed by a patchwork of:

- No federal NIL statute (multiple bills introduced, none enacted)
- House v. NCAA settlement terms (approved June 6, 2025; effective July 1, 2025)
- College Sports Commission (CSC) enforcement framework
- NIL Go clearinghouse (Deloitte-built deal review platform)
- Individual state NIL laws (50 states, four categories of favorability)
- NCAA interim policy
- Institutional policies
- Professional league CBAs with their own salary cap, transfer, and compensation rules

The intelligence system provides compliance intelligence, not legal advice. When rules are ambiguous, uncertain, or in conflict, Dipson renders UNCERTAIN and recommends legal counsel. Dipson never guesses on compliance.

Every compliance assessment cites the specific rule applied. Every "non-compliant" verdict identifies the specific violation. The governing body must be established before any compliance output can be rendered.

---

## 9. Governance Across Levels

The governance intelligence covers every level an athlete or institution might operate within. The system routes to the correct governance file based on the institution's governing body.

College levels and their key distinguishing features:
- NCAA D1 (opted in to House settlement): Revenue sharing ($20.5M cap), roster limits (no scholarship limits), CSC enforcement, NIL Go, equivalency model
- NCAA D1 (not opted in): Legacy scholarship limits, no revenue sharing, traditional NCAA enforcement
- NCAA D2: Equivalency sports, partial settlement provisions, lower scholarship budgets
- NCAA D3: No athletic scholarships, need-based aid, no revenue sharing, pure academic integration
- NAIA: Independent NIL framework (had NIL before NCAA), 24-sport governance, eligibility center, scholarship equivalencies
- NJCAA: Three divisions, 2-year pathway, scholarship rules per division

Pro levels and their key distinguishing features:
- NBA: Hard salary cap with luxury tax, rookie scale, max contracts, two-way contracts, G-League
- NFL: Hard salary cap, franchise tag, practice squad, compensatory picks
- MLB: Competitive balance tax (soft cap), arbitration, minor league system, international bonus pools
- NHL: Hard salary cap, entry-level contracts, restricted free agency
- MLS: Designated Player rule (Beckham rule), salary budget with allocation money
- European football: Transfer windows, Financial Fair Play, solidarity payments, training compensation
- International transfers: FIFA regulations, TMS, minor protections, agent regulations
- Boxing: Multi-sanctioning body structure, purse splits, mandatory challengers
- MMA/UFC: Contract structure, champion clauses, USADA testing

---

# PART 3: SPECIAL TOPICS

---

## 10. NIL for Non-Revenue Sports

The vast majority of NIL conversation focuses on football and men's basketball. But every college athlete has NIL rights, and the intelligence system serves all sports. For athletes in non-revenue sports, the path to NIL value runs primarily through social media and personal brand rather than athletic performance and market size. The system's sport tier weights automatically adjust for this reality.

Cross-sport allocation intelligence identifies opportunities where small NIL investments in non-revenue sports yield disproportionate Team KR returns.

---

## 11. NIL for NAIA, NJCAA, and Small Schools

Most NIL infrastructure has been built for Power 4 schools. KaNeXT serves the other 1,000+ institutions that compete outside the Power 4.

At NAIA and NJCAA levels: revenue sharing does not apply (House settlement is D1 only), NIL pools are small ($0-200K at most programs), collective infrastructure is minimal or nonexistent, the primary NIL lever is fan contributions, local business deals, and camp fees, and scholarship allocation matters more than NIL for most players.

KPay's "Stake an Athlete" feature is designed specifically for this market.

---

## 12. International Athletes and NIL

International athletes have unique NIL considerations: F-1 visa work authorization restrictions, global social media followings that domestic models miss, brand deal opportunities in home countries, currency conversion and international tax treaties, and cross-border payment logistics. KPay's remittance capability facilitates international NIL payments.

---

## 13. NIL and the Transfer Portal

The transfer portal and NIL are deeply intertwined. Every portal entry is simultaneously an athletic decision, an academic decision, and a financial decision.

When a player enters the portal: the system immediately recomputes Team KR, identifies the demand gap, frees the NIL budget, and searches for replacements ranked by Team KR Delta per NIL dollar.

When scouting a portal target: the system computes PNV (market value), PTV (value to this specific team), acquisition cost, budget impact, and opportunity cost.

When retaining a player at risk: the system flags retention risk when PNV significantly exceeds current NIL allocation, computes the cost of losing them (Team KR Delta), and recommends whether to increase NIL or let them leave.

---

## 14. NIL Value Lifecycle

NIL value follows a lifecycle: Recruiting phase (mostly projected, high uncertainty), Early career (grows with playing time and social media), Peak (performance, social media, and market conditions align), Late career or post-peak (declines without draft projection or sustained performance), Spike events (March Madness, CFP, viral moments create 300-500% temporary spikes), and Controversy events (immediate and severe decay).

---

## 15. Market Intelligence Cross-Sport Coverage

The market calibration layer covers every sport with sufficient market depth:

Full coverage (spreads, moneylines, totals, player props): NBA, NCAAB, NFL, NCAAF, MLB, NHL

Partial coverage (spreads, moneylines, totals only): MLS, EPL, La Liga, Serie A, Bundesliga, Ligue 1, UFC/MMA

No coverage (intelligence system assessment only): NAIA, NJCAA, NCAA D2, NCAA D3, CCCAA, USCAA, NCCAA, non-revenue sports at any level, lower-tier professional leagues

When market data is unavailable, the system states this clearly and relies on internal assessment only. It never fabricates market signals.

---

## 16. Pro Transition and Draft Intelligence

The Pro Transition Engine takes completed college player evaluations and projects them into professional contexts. Key concepts:

- Entry KR: Day 1 as a rookie. Almost every rookie is 82-89 regardless of draft position. Entry KR is nearly useless for lottery evaluation.
- Median Outcome: Most likely version by Year 3. What late-first teams draft for.
- Peak Ceiling: Best realistic outcome by Year 3-5. What lottery teams draft for.
- Key Development Variable: The single skill that determines whether Scenario A (develops) or Scenario B (doesn't) plays out.

Draft-range output priority:
- #1-5: Lead with Peak Ceiling (bad teams buying best possible outcome)
- #6-15: Lead with 3-Year Projection (complementary star next to existing talent)
- #16-30: Lead with Median Outcome (contributors NOW, high floor)
- 2nd round+: Lead with Entry KR + Role (earn a roster spot)

Development bounds: Max +8 KR per cluster per year. Max +15 over 3 years. Always show both upside and downside scenarios.

---

## 17. Simulation Engine and Validation

The Simulation Engine resolves hypothetical game outcomes using the full intelligence architecture: system identity (OSIE/DSIE), archetype interactions (582 entries in the Interaction Library), physical mismatch modifiers, and possession-level resolution.

The Simulation Validation module measures accuracy against closing lines using: Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), directional accuracy (did we pick the right winner?), win probability calibration (are our 70% predictions winning 70% of the time?), and bias detection by sport, level, conference, time of season, and home/away.

A model that performs comparably to the closing line is market-competitive. A model that identifies edge cases where it outperforms the closing line has genuine analytical value. The system never claims to be better than the market without empirical validation data.

---

## 18. KStat and Data Capture

KStat is the real-time game data capture system that feeds the intelligence pipeline. Complete build specs cover 26 sport configurations across 15 spec documents. Basketball is the foundation. Build order: basketball first, then soccer + flag football, then volleyball + hockey + lacrosse, then golf + tennis + track + cheer + swim, then football + baseball, then wrestling + boxing.

KStat data flows into BPR (single-game player impact) and TPQ (team-level single-game performance), which in turn feed KR calibration, suppression detection, and development tracking.

---

# PART 4: FILE INVENTORY

---

## 19. Complete File Inventory

### Sport Intelligence (Basketball)
| # | File | Lines | Description |
|---|---|---|---|
| 01 | Player Eval Process | ~580 | Pipeline, V1 Protocol, Suppression, Confidence Gate |
| 02 | Player Eval Reference | ~4200 | Traits, Archetypes, Demands, Badges, Overrides, Risks, KLVN, Legends, OPF |
| 03 | Team Intelligence | ~2000 | Team KR Pipeline, OSIE/DSIE, Team Legends, Scholarship/NIL, Roster Intelligence |
| 04 | Simulation Engine | ~3400 | Interaction Library (582 entries), Possession Engine, Physical Mismatch |
| 05 | Scouting and Game Ops | ~320 | Confidence Gates, 4-phase Game Ops |
| 06 | Downstream Engines | ~740 | Development Engine, Pro Transition, Coaching Impact Modifier |
| 07 | Basketball Intelligence Skill | ~310 | Mode routing, governance rules, file map, cross-reference |

### Sport Intelligence (Supporting)
| File | Lines | Description |
|---|---|---|
| BPR v2 Spec | ~330 | Single-game player impact metric |
| TPQ v1 Spec | ~330 | Team-level single-game performance |
| Pro KR Legend Updated | ~100 | Pro tiers with draft context |
| Pro KR Calibration Reference | ~180 | 12-player calibration set |
| Pro Salary Framework | ~100 | KR-to-salary mapping |
| Pro League Registry | ~190 | 30+ professional leagues |
| Pro Team Registry NBA (2 files) | ~215 | All 30 NBA teams |
| Pro KLVN Lambdas | ~60 | Pro-level normalization |
| Legend files (14) | ~35 each | Level-specific KR legends |

### NIL Intelligence
| # | File | Lines | Description |
|---|---|---|---|
| 01 | NIL Valuation Intelligence | ~466 | PNV model, 4 clusters, 7 tiers |
| 02 | NIL Compliance Intelligence | ~477 | Federal, state, NCAA, institutional, collective, revenue sharing |
| 03 | NIL Allocation Intelligence | ~474 | Pool construction, PTV allocation, scenarios, efficiency |
| 04 | NIL Market Intelligence | ~366 | Market size, deal analytics, brand intelligence, forecasting |
| 05 | Dipson NIL Intelligence Skill | ~301 | 7-mode routing, governance, escalation |

### Market Intelligence (Calibration)
| # | File | Lines | Description |
|---|---|---|---|
| 01 | Market Calibration Intelligence | ~451 | Spreads, moneylines, totals, Team KR alignment |
| 02 | Player Prop Intelligence | ~344 | Prop benchmarks by sport, prop-to-KR alignment |
| 03 | Line Movement Intelligence | ~299 | Movement classification, detection thresholds, suppression signals |
| 04 | Simulation Validation Intelligence | ~391 | MAE/RMSE/bias, calibration feedback loop |
| -- | Market Intelligence Dipson Skill | ~129 | 8-mode routing, cross-reference, data source |

### League Governance
| File | Lines | Description |
|---|---|---|
| NCAA D1 Governance | ~824 | Post-House settlement, roster limits, revenue sharing, transfers |
| NCAA D2 Governance | ~479 | Equivalency, partial settlement, transfers |
| NCAA D3 Governance | ~371 | No scholarships, academic integration |
| NAIA Governance | ~367 | Independent NIL, eligibility center |
| NJCAA Governance | ~362 | Three divisions, 2-year pathway |
| NBA CBA Governance | ~432 | Salary cap, rookie scale, trade rules |
| NFL CBA Governance | ~362 | Salary cap, franchise tag, practice squad |
| MLB CBA Governance | ~227 | CBT, arbitration, minors |
| NHL CBA Governance | ~218 | Salary cap, entry-level contracts |
| MLS Rules Governance | ~125 | DP rule, salary budget, GAM/TAM |
| NWSL CBA Governance | ~116 | Salary structure, allocation |
| European Football Governance | ~215 | Transfers, FFP/FSR |
| International Transfer Governance | ~183 | FIFA regulations, TMS |
| Boxing Governance | ~155 | Sanctioning bodies, purse splits |
| MMA Governance | ~179 | UFC contracts, weight classes |

### Institutional Intelligence (17 modules, 136 files)
| Module | Version | Files | Lines |
|---|---|---|---|
| Admissions | v3 | 8 | 4,190 |
| Real Estate | v4 | 8 | 3,591 |
| Acquisition | v3 | 8 | 3,491 |
| Hiring | v3 | 8 | 3,474 |
| Student Success | v3 | 8 | 2,440 |
| Sales/Revenue | v3 | 8 | 2,053 |
| Financial | v3 | 8 | 2,017 |
| Operations | v3 | 8 | 1,754 |
| Marketing | v3 | 8 | 1,673 |
| Compliance | v3 | 8 | 1,676 |
| Fundraising | v3 | 8 | 1,634 |
| Staffing | v3 | 8 | 1,448 |
| Curriculum | v3 | 8 | 1,398 |
| Technology | v3 | 8 | 1,195 |
| Risk/Legal | v3 | 8 | 1,199 |
| Facilities | v3 | 8 | 1,151 |
| Communications | v3 | 8 | 1,059 |
| **Total** | | **136** | **35,343** |

### Knowledge Base and Skill
| File | Description |
|---|---|
| KaNeXT Intelligence Knowledge Base v2 | THIS DOCUMENT. Complete system reference. |
| Dipson Master Intelligence Skill v1 | Unified routing skill across all 4 intelligence domains |
| KaNeXT OS Mode Spec | Complete screen-by-screen RBAC specification |

---

## 20. Total System Scale

- Total intelligence domains: 5 (Sport, NIL, Market, Governance, Institutional)
- Total intelligence files: 400+
- Institutional intelligence: 17 modules, 136 files, 35,343 lines (all at v3+ template standard)
- Sport intelligence (basketball core): 6 files + 14 legends + supporting docs (~11,000+ lines)
- Multi-sport intelligence stacks: 29 athletics domains + K-1 Motorsports (~160 files)
- NIL intelligence: 5 files covering valuation, compliance, allocation, market, and routing
- Market intelligence: 4 knowledge files + 1 routing skill covering calibration, props, line movement, and validation
- Governance files: 15 files covering every major governing body and professional league
- KStat specs: 15 specs, 26 sport configurations
- Data room documents: 51 docs
- OS Mode Spec: 2,288 lines
- Player database: 100K+ players
- Live app on device via TestFlight
- Total: 45+ intelligence domains, 400+ files

---

# END OF DOCUMENT

---

## Document Statistics

- Total sections: 20 main sections
- Parts: 4
- Version: 2.0
- Date: April 2026
- Predecessor: KaNeXT NIL Intelligence Knowledge Base v1.0 (17 sections, NIL-only scope)
- Scope change: Expanded from NIL-only to complete intelligence system coverage across all four domains (Sport, NIL, Market, Governance)
- Architecture: Universal. Deterministic. Auditable. Confidence-gated. Cross-sport. Cross-level.
- For use by: Dipson AI (internal reference), investors, coaches, ADs, compliance officers, collective leaders, CFOs, athletes, scouts, agents, and anyone asking about KaNeXT Intelligence
`;
