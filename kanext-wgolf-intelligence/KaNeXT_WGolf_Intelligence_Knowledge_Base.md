# KaNeXT Women's Golf Intelligence Knowledge Base v1

---

## 1. SYSTEM OVERVIEW

The KaNeXT Women's Golf Intelligence system is a comprehensive evaluation, analysis, and decision-making platform for women's golf. It uses the KR (KaNeXT Rating) framework to produce universal, deterministic ratings for players, teams, and tournament projections.

### Core Architecture
- **KR (KaNeXT Rating):** Universal 0-100 rating for every player and team. One number, multiple interpretations across levels.
- **KLVN Lambda Normalization:** Adjusts raw production stats across competitive levels. NCAA D1 Power 4 = 1.000 reference for college. LPGA Tour = 1.000 reference for professional. Normalizes inputs, never outputs.
- **5 Component KRs:** BKR (Ball-Striking), SKR (Short Game), CKR (Course Management), MKR (Mental), AKR (Athletic/Physical). Weighted through OPF (Overall Performance Formula).
- **Legend System:** Tier labels at each competitive level that interpret what a KR means in context. Display-only; does not produce KR.
- **Phase 3 Anchor:** Production-based reality check against the level legend. The foundation of every evaluation.
- **Phase 6 OPF:** Mathematical composite of component KRs, bounded to within +/-10 of the Phase 3 anchor.

### 8 Intelligence Modes
1. **Player Evaluation** - Individual KR rating (0-100)
2. **Team Evaluation** - Roster-level KR with lineup construction
3. **Tournament Simulation** - Stroke play and match play projection
4. **Scouting & Tournament Ops** - 4-phase tournament intelligence
5. **Development Intelligence** - Gap analysis, development roadmaps
6. **Pro Transition** - LPGA/Epson/international tour readiness and projection
7. **Legend Calibration** - Testing and refining tier labels
8. **Recruiting Intelligence** - High school, junior, and transfer prospect evaluation

---

## 2. WOMEN'S GOLF FUNDAMENTALS

### The Sport
Women's golf follows the same rules as men's golf under the USGA and R&A. The primary differences are in equipment (shorter clubs, lighter balls in some developmental contexts but standard USGA balls in competition), course setup (shorter tee boxes, typically 5,800-6,400 yards for women vs 6,800-7,500 for men), and physical benchmarks. The core scoring, rules, and competition formats are identical.

### Why Women's Golf Matters
- Growing media visibility and investment (LPGA Tour purse growth, TV deals)
- NCAA women's golf has approximately 280 D1 programs (large footprint)
- Title IX compliance sport for many institutions
- Strong international pipeline (South Korea, Japan, Australia, Sweden, Thailand)
- Rapidly professionalizing with growing prize money and endorsement opportunities
- The LPGA Tour is the oldest women's professional sports organization in the US (founded 1950)

### Key Statistical Concepts
- **Scoring Average:** Average strokes per round. THE primary evaluation metric for golfers. Lower is better.
- **GIR% (Greens in Regulation):** Percentage of holes where the ball reaches the putting surface in par minus 2 strokes. The best single-stat proxy for ball-striking quality.
- **Putting Average:** Average putts per round. Lower is better. Influenced by GIR% (more greens hit = more birdie putts = potentially higher putting average despite better scoring). Must be interpreted in context.
- **Scrambling%:** Percentage of missed-green holes where the player saves par or better. Primary short game indicator.
- **Driving Distance:** Average drive length in yards. A physical tool indicator.
- **Driving Accuracy:** Percentage of fairways hit. Precision indicator.
- **Sand Save%:** Par-or-better percentage from greenside bunkers.
- **Birdies per Round:** Scoring frequency indicator.
- **Strokes Gained:** Advanced metric decomposing scoring advantage into categories (tee-to-green, approach, around-green, putting). Available for LPGA Tour players. Rarely available at the college level.

---

## 3. HOW WOMEN'S GOLF KR DIFFERS FROM MEN'S

The architecture is identical. The content differs in these critical ways:

### Scoring Benchmarks
Women's scoring averages are higher (larger numbers, meaning more strokes) than men's at every level. This is not a quality judgment - it reflects course setup differences (shorter but not proportionally shorter to physical capability differences), equipment differences, and the physical reality that women generate less clubhead speed on average.

Key reference points:
- **D1 Power 4 elite (KR 95+):** Women's ~70.5-71.5 scoring avg vs men's ~69.0-70.0
- **D1 Power 4 average starter (KR 83-85):** Women's ~74.5-75.5 vs men's ~72.5-73.5
- **LPGA Tour elite (KR 95+):** ~69.0-70.0 scoring avg vs PGA Tour elite ~68.0-69.0
- **LPGA Tour average (KR 83-85):** ~71.8-72.5 vs PGA Tour average ~70.5-71.2

### Driving Distance
Average women's driving distance is 50-60 yards shorter than men's at comparable levels:
- LPGA Tour average: ~255 yards (PGA Tour: ~295 yards)
- D1 Power 4 average: ~240-245 yards (D1 men's: ~280 yards)
- This gap makes par-5 reachability a more significant differentiator in women's golf
- Course management (CKR) has relatively more weight in women's golf because raw distance is less decisive

### GIR%
Women's GIR percentages are slightly higher than men's at comparable KR levels because women's course setups (shorter approaches) create more opportunities to hit greens. A 70% GIR at women's D1 Power 4 is comparable in relative terms to a 68% GIR at men's D1 Power 4.

### Scrambling
Women's scrambling percentages are slightly lower than men's at comparable levels, partly because women's approach shots from farther out (when they miss greens) leave more difficult recovery positions.

### Scholarship Allocation
Women's golf gets 6 equivalency scholarships at NCAA D1 (men get 4.5). This gives women's programs more flexibility in roster building and makes the recruiting landscape slightly more competitive. Most D1 women's golf programs can offer meaningful scholarship support to all 5 lineup players plus depth.

### Pro Landscape
The LPGA Tour is the pinnacle of women's professional golf. There is no equivalent to the PGA Tour's massive purse structure ($500M+) or to LIV Golf's guaranteed contracts. The LPGA Tour total purse is approximately $100M+ and growing, but the earnings gap between men's and women's golf remains the largest of any major sport. The Epson Tour (developmental) pays significantly less than the Korn Ferry Tour (men's developmental). International tours (KLPGA, JLPGA, LET) provide viable career alternatives that have no direct equivalent in men's golf (the men's PGA Tour is so dominant that international tours are secondary pathways; in women's golf, the KLPGA and JLPGA are primary career destinations for many players).

### Pregnancy/Motherhood
Unique to women's golf. Professional golfers who become pregnant face career interruption of 12-36 months. The system explicitly models this with dual-KR reporting (current + pre-pregnancy baseline), suppression detection, and recovery projection. No equivalent exists in men's golf.

---

## 4. THE FIVE COMPONENT KRs

### BKR - Ball-Striking KR (35% OPF Weight)
Measures the tee-to-green game: driving distance, driving accuracy, GIR%, approach shot quality, iron consistency. The most important component in golf because hitting greens creates scoring opportunities.

At V1 (box-score stats), BKR is the HIGHEST-CONFIDENCE component KR because GIR%, driving distance, and driving accuracy are widely available.

### SKR - Short Game KR (25% OPF Weight)
Measures everything within 100 yards of the green except putting: scrambling%, sand save%, up-and-down conversion, chipping, pitching, bunker play. The short game separates good players from elite players. A player with moderate BKR but elite SKR can score well by saving par when she misses greens.

At V1, SKR is moderate confidence. Scrambling% is widely available and is a strong proxy. Sand save% and detailed short game data may not be available at all levels.

### CKR - Course Management KR (20% OPF Weight)
Measures decision-making, risk/reward assessment, course strategy, par-3/4/5 scoring breakdown, birdie rate, bogey avoidance. CKR has relatively MORE weight in women's golf than it would in men's because the distance gap between elite and average women's players is smaller, making strategy more important relative to power.

At V1, CKR is low-to-moderate confidence. Par scoring breakdowns and birdie/bogey rates provide useful proxies. Full course management assessment requires shot-level data (V2+).

### MKR - Mental KR (12% OPF Weight)
Measures pressure performance, bounce-back rate, scoring consistency (variance), closing ability, competitive poise. Golf is uniquely mental: individual sport, 4-5 hours of sustained concentration, no substitutions, no teammates to lean on during a round.

At V1, MKR is low-to-moderate confidence. Final round scoring, championship event performance, and scoring variance provide weak proxies. True mental assessment requires observation and tracking data.

### AKR - Athletic/Physical KR (8% OPF Weight)
Measures physical fitness, power generation, stamina, flexibility, height/build, injury resilience. AKR has the LOWEST weight because golf is less physically determinative than most sports. Many LPGA champions are not the most physically gifted athletes - they win through skill, strategy, and mental strength.

At V1, AKR is low confidence. Driving distance is the primary proxy for power/speed. Height from rosters provides some context. Full physical assessment requires V2+ data.

---

## 5. WOMEN'S GOLF COMPETITIVE LEVELS

The system evaluates 8 college levels plus professional:

### College Levels
1. NCAA D1 Power 4 (lambda 1.000) - ACC, Big Ten, Big 12, SEC
2. NCAA D1 Mid-Major (lambda 0.945) - AAC, A-10, MWC, WCC, etc.
3. NCAA D1 Low-Major (lambda 0.895) - all other D1
4. NCAA D2 (lambda 0.840)
5. NAIA (lambda 0.780)
6. NJCAA D1 (lambda 0.720)
7. NCAA D3 (lambda 0.680)
8. NJCAA D2/D3 (lambda 0.640)

### Professional Levels
1. LPGA Tour (lambda 1.000) - reference
2. KLPGA (lambda 0.920) - Korean tour, extremely strong
3. JLPGA (lambda 0.900) - Japanese tour, large and well-organized
4. LET (lambda 0.880) - European tour, growing
5. Epson Tour (lambda 0.830) - LPGA developmental
6. Women's All Pro Tour (lambda 0.700) - US mini-tour
7. Regional/Other tours (lambda 0.600)

---

## 6. COLLEGE WOMEN'S GOLF LANDSCAPE

### NCAA D1 Power 4 Programs (Elite Tier)
The strongest D1 women's golf programs are historically concentrated in the Sun Belt, Southeast, and West Coast where year-round practice conditions exist:
- **Perennial powers:** Stanford, Arizona State, USC, Duke, South Carolina, LSU, Arkansas, Wake Forest, Ole Miss, Arizona, Vanderbilt, Texas, Oklahoma State, Auburn, Florida, Georgia, Alabama
- **Rising programs:** Oregon, Florida State, Virginia, Michigan
- These programs attract the best recruits (both domestic and international), have the best facilities, and produce the most LPGA professionals

### Conference Strength (Women's Golf, 2025-26)
- **SEC:** Arguably the strongest conference top-to-bottom. South Carolina, LSU, Arkansas, Ole Miss, Auburn, Alabama, Florida, Georgia, Vanderbilt all competitive.
- **Big Ten:** Stanford, Arizona State, USC, Oregon, Michigan, Ohio State. Massive conference with new additions.
- **ACC:** Duke, Wake Forest, Virginia, Clemson, Florida State. Strong top tier.
- **Big 12:** Texas, Oklahoma State, Baylor, TCU, Arizona. Competitive.

### Scholarship Context (D1 Women's Golf: 6 Scholarships)
With 6 equivalency scholarships and a typical roster of 8-10 players:
- Top 2-3 players often on full or near-full scholarship
- Players 4-5 on partial scholarship (0.5-0.75)
- Players 6+ on small partials or walk-on status
- International players often require more athletic scholarship because they have fewer academic aid options
- The 6-scholarship budget (vs men's 4.5) gives women's programs a recruiting advantage in terms of financial packages

### Season and Format
- **Fall season (Sep-Nov):** Invitationals and team events. Data collection for lineup decisions.
- **Spring season (Feb-May):** Conference championships and NCAA postseason.
- **Standard tournament format:** 54 holes, 3 rounds, count best 4 of 5 scores per round.
- **NCAA Championship:** 72 holes stroke play qualifying (4 rounds), then match play for team championship (since 2015). Hosted at Grayhawk Golf Club (Scottsdale, AZ) through 2026.
- **Match play format:** Used in NCAA Championship team finals and some dual match events. Each team fields 5 players in individual match play. First to 3 match wins takes the team match.

### Key Data Sources for College Women's Golf
- **Golfstat:** The primary statistical resource for college golf. Detailed scoring data, GIR%, scrambling, driving stats for most D1 programs. Available at golfstat.com.
- **School athletics websites:** Roster data, tournament results, individual stats.
- **NCAA stats portal:** Official statistics for NCAA competition.
- **Conference websites:** Conference standings, championship results.
- **WAGR (World Amateur Golf Ranking):** Rankings for amateur golfers worldwide. Important for international recruits.
- **Junior Golf Scoreboard, AJGA:** Junior golf results for recruiting evaluation.

---

## 7. PROFESSIONAL WOMEN'S GOLF LANDSCAPE

### LPGA Tour (2025-26)
- Founded 1950 (oldest women's pro sports organization in the US)
- 30+ events per season (January-November)
- Total purse: $100M+ and growing rapidly
- Major championships: Chevron Championship, US Women's Open, KPMG Women's PGA Championship, The Evian Championship, AIG Women's Open
- Rolex Rankings determine world standing
- Solheim Cup (biennial, Team USA vs Team Europe) is the premier team event
- Commissioner: Mollie Marcoux Samaan (as of 2022)

### LPGA Tour Access
1. **Q-Series:** Primary qualifying. 8 rounds at Magnolia Grove (Mobile, AL). Top finishers earn LPGA status.
2. **Epson Tour promotion:** Top 10 on Epson Tour season-ending money list earn LPGA cards.
3. **Non-member petition:** Players who perform well in limited LPGA starts can petition for membership.
4. **Sponsor exemptions and Monday qualifiers:** Limited starts available.

### Epson Tour (LPGA Developmental)
- 20+ events per season
- Purses: $200K-$300K per event
- Top 10 money list earners graduate to LPGA Tour
- The primary "earn your way up" pathway
- Named sponsor: Epson (previously known as Symetra Tour, Futures Tour)

### Ladies European Tour (LET)
- 25+ events across Europe, Middle East, Africa, and Asia
- Growing partnership with LPGA (joint-sanctioned events)
- LET Q-School held annually (typically in Morocco or Spain)
- Solheim Cup provides high-profile European team event
- LET Access Series serves as developmental pathway
- Key nations: England, Sweden, Spain, France, Germany

### KLPGA (Korean Ladies Professional Golf Association)
- 25+ events per season
- One of the strongest women's tours globally
- South Korea has invested heavily in women's golf development since Se Ri Pak's 1998 US Women's Open victory
- KLPGA Q-School is the primary access point
- Many KLPGA players eventually transition to the LPGA
- Strong domestic sponsorship and broadcasting
- Korean women's golf development system (academies, junior programs) is the most intensive in the world

### JLPGA (Japan Ladies Professional Golf Association)
- 35+ events per season
- Largest tour purse outside the LPGA ($30M+ USD equivalent)
- Golf is very popular in Japan with strong TV ratings and corporate sponsorship
- JLPGA Q-School and pro test provide access
- International players (Korean, Chinese, Taiwanese) compete on JLPGA
- Fewer players transition from JLPGA to LPGA compared to KLPGA

### No LIV Golf Equivalent for Women
As of 2026, there is no rival league with guaranteed contracts or inflated purses in women's golf. All women's professional golf operates on a traditional purse/prize money model. This means:
- Career earnings are directly tied to performance (no guaranteed money)
- Financial stability requires consistent tournament performance
- The earnings gap between top players and tour-average players is significant
- Financial planning and career management are more critical in women's golf

---

## 8. EVALUATION CONTEXT AND COMMON MISTAKES

### Common Evaluation Errors in Women's Golf

**Applying men's benchmarks:** The most common error. A 73.0 scoring average in women's D1 golf is NOT the same as a 73.0 in men's D1 golf. All benchmarks in this system are women's-specific.

**Overweighting driving distance:** Distance is important but less decisive in women's golf than men's. Many elite women's golfers win without elite distance. Short game (SKR) and course management (CKR) can compensate for moderate distance.

**Ignoring course difficulty context:** A 72.0 scoring average on easy courses is NOT the same as 72.0 on championship-difficulty courses. Always check scoring vs field, not just raw scoring average.

**Ignoring strength of schedule:** A player who wins every tournament in a weak conference is not necessarily better than a player who finishes top-20 in every Power 4 invitational. Field strength matters enormously.

**Undervaluing international amateur credentials:** South Korean, Japanese, and Australian junior golfers with strong amateur rankings (WAGR) are often undervalued by US college recruiting services. Their production data is harder to access but their talent is real.

**Treating pregnancy/motherhood as career-ending:** Professional women golfers can and do return to high-level competition after pregnancy. The system must model the temporary suppression accurately without treating it as permanent decline.

**Overlooking the mental game:** Golf is arguably the most mental sport. A player with KR 85 and MKR 92 (elite mental, moderate overall) may outperform a player with KR 88 and MKR 72 (strong overall, weak mental) in high-pressure situations. The MKR is critical for tournament winners and pro transition projections.

---

## 9. SYSTEM ARCHITECTURE SUMMARY

The Women's Golf Intelligence System uses identical architecture to all KaNeXT sports intelligence systems:

| Component | File | Status |
|---|---|---|
| Master Protocol (SKILL.md) | 07_Nexus_WGolf_Intelligence_Skill_v1 | Active |
| Player Evaluation Process | 01_WGolf_Player_Eval_Process_v1 | Active |
| Player Evaluation Reference | 02_WGolf_Player_Eval_Reference_v1 | Active |
| Team Intelligence | 03_WGolf_Team_Intelligence_v1 | Active |
| Simulation Engine | 04_WGolf_Simulation_Engine_v1 | Active |
| Scouting & Tournament Ops | 05_WGolf_Scouting_Tournament_Ops_v1 | Active |
| Downstream Engines | 06_WGolf_Downstream_Engines_v1 | Active |

### Legend Files
| Level | File | Lambda |
|-------|------|--------|
| NCAA D1 (P4/MM/LM) | Legend_NCAA_D1_WGolf_v1 | 1.000/0.945/0.895 |
| NCAA D2 | Legend_NCAA_D2_WGolf_v1 | 0.840 |
| NCAA D3 | Legend_NCAA_D3_WGolf_v1 | 0.680 |
| NAIA | Legend_NAIA_WGolf_v1 | 0.780 |
| NJCAA | Legend_NJCAA_WGolf_v1 | 0.720 |

### KLVN Files
| Scope | File |
|-------|------|
| College | College_WGolf_KLVN_Lambdas_v1 |
| Professional | Pro_WGolf_KLVN_Lambdas_v1 |

### Pro Files
| File | Content |
|------|---------|
| Pro_WGolf_KR_Legend_v1 | LPGA/Epson/LET/KLPGA/JLPGA tier labels, earnings projections, salary framework |

### What's Identical to Other KaNeXT Sports Intelligence Systems:
- Phase 3 anchor-first evaluation protocol
- Phase 6 component KR adjustment (+/-10 rule)
- OPF weighting structure
- Team KR pipeline
- 4-phase scouting/ops flow
- Development engine structure
- Governance rules

### What's Unique to Women's Golf:
- 5 component KRs specific to golf (BKR, SKR, CKR, MKR, AKR) vs basketball's 4 (OKR, DKR, TKR, IQKR)
- No offensive/defensive systems (golf is an individual sport with no tactical system selection)
- Course Profile Library and Player-Course Fit Engine (unique to golf)
- 6 scholarship allocation (D1, more than men's 4.5)
- LPGA/Epson/LET/KLPGA/JLPGA pro landscape (different from men's PGA/Korn Ferry/LIV)
- Pregnancy/motherhood suppression detection
- No LIV Golf equivalent
- Scoring benchmarks calibrated for women's golf at all levels
- International tour pathways (KLPGA and JLPGA as primary career destinations, not secondary)
- Women's golf earnings significantly lower than men's at all levels
- Match play simulation specifically tuned for NCAA Championship format

---

## 10. KEY PRINCIPLES

1. **The legend anchor is truth. The math is confirmation. Not the other way around.**
2. **Anchor against production profile numbers, not award labels.**
3. **KR is universal.** One KR, read against different legends for different contexts.
4. **KLVN normalizes inputs, not outputs.**
5. **Downstream never modifies upstream.**
6. **Confidence is always stated.**
7. **Women's benchmarks only.** Do not apply men's standards to women's golf.
8. **Pregnancy is not decline.** It is temporary suppression requiring dual-KR reporting.
9. **The mental game matters more in golf than in most sports.** MKR is not a throwaway component.
10. **Course management gains relative weight in women's golf** because distance advantages are smaller than in men's golf.

---

## VERSION HISTORY
- v1.0: Initial women's golf intelligence knowledge base. Comprehensive coverage of women's golf ecosystem, college landscape (D1 through NJCAA), professional tours (LPGA, Epson, LET, KLPGA, JLPGA), evaluation context, scoring norms, physical benchmarks, pregnancy/career continuity, scholarship rules (6 for women's D1), and system architecture mapping.
