# KaNeXT Men's Volleyball Intelligence Knowledge Base v1

---

## 1. SYSTEM OVERVIEW

The KaNeXT Men's Volleyball Intelligence system is a comprehensive evaluation, analysis, and decision-making platform for men's volleyball. It uses the KaNeXT KR (KaNeXT Rating) framework to produce universal, deterministic ratings for players, teams, and match projections.

### Core Architecture
- **KR (KaNeXT Rating):** Universal 0-100 rating for every player and team. One number, multiple interpretations across levels.
- **KLVN Lambda Normalization:** Adjusts raw production stats across competitive levels. D1 top conferences = 1.000 reference. Normalizes inputs, never outputs.
- **6 Component KRs:** AKR (Attack), BKR (Block), DKR (Dig/Defense), SVR (Serve), SKR (Set), IQKR (Volleyball IQ). Weighted differently by position through OPF (Overall Performance Formula).
- **Legend System:** Tier labels at each competitive level that interpret what a KR means in context. Display-only; does not produce KR.
- **Phase 3 Anchor:** Production-based reality check against the level legend. The foundation of every evaluation.
- **Phase 6 OPF:** Mathematical composite of component KRs, bounded to within +/-10 of the Phase 3 anchor.
- **System Fit:** How well a player's archetype matches a team's offensive and defensive systems.

### 8 Intelligence Modes
1. **Player Evaluation** - Individual KR rating (0-100)
2. **Team Evaluation** - Roster-level KR with rotation analysis
3. **Match Simulation** - Set-by-set match projection with rotation matchups
4. **Scouting & Match Ops** - 4-phase match intelligence (prematch, in-match, between-sets, postmatch)
5. **Development Intelligence** - Gap analysis, development roadmaps, transfer portal fit
6. **Pro Transition** - Overseas professional readiness, league placement, salary projection
7. **Legend Calibration** - Testing and refining tier labels against real players
8. **Recruiting Intelligence** - High school and club volleyball prospect evaluation

---

## 2. MEN'S VOLLEYBALL FUNDAMENTALS

### The Sport
Men's volleyball is played between two teams of 6 players on a court divided by a net set at 2.43m (7'11 5/8") for men - nearly 8 inches higher than the women's net (2.24m). Matches are best of 5 sets. Sets are played to 25 points (win by 2), except the fifth set which is played to 15. Rally scoring means every rally awards a point.

### How Men's Volleyball Differs from Women's
- **Higher net (2.43m vs 2.24m).** This changes blocking geometry, attack angles, serve trajectories, and physical requirements fundamentally. Height and reach matter even more.
- **Power-oriented game.** Men's attacks are faster (60-80 mph), jump serves are harder (70-85 mph), and rallies are shorter on average.
- **Jump serve dominance.** At the D1 and pro levels, the jump serve is the standard. Float serves are tactical tools for variation, not the default. Women's volleyball uses a more balanced mix of float and jump serves.
- **Shorter rallies.** The combination of harder serves, faster attacks, and more decisive blocks means rallies end sooner. This makes each serve receive and each first-ball attack more critical.
- **Fewer programs.** Only ~50 NCAA D1 men's volleyball programs exist compared to ~340+ women's D1 programs. This concentrates talent and creates a smaller competitive landscape.
- **Spring season.** NCAA men's volleyball is played January-May (spring). Women's volleyball is played August-December (fall). This creates scheduling conflicts with baseball, track, and shared facility use.
- **4.5 scholarships.** The most restrictive scholarship limit in college athletics. Women's volleyball has 12. This means most men's volleyball players are walk-ons and scholarship allocation is a completely different discipline.
- **No US pro league.** There is no American men's professional volleyball league. All professional pathways lead overseas. Women's volleyball has PVF and Athletes Unlimited domestically.
- **Higher international player concentration.** Many NCAA D1 men's volleyball programs roster international players who bring club/national team experience from volleyball-strong countries (Brazil, Italy, France, Germany, Japan, etc.).

### Key Statistical Concepts (Men's Benchmarks)
- **Hitting Percentage:** (Kills - Errors) / Attempts. .280+ is strong at D1. .340+ is excellent. .400+ is elite.
- **Kills per Set:** Primary volume metric. 4.0+ is strong. 5.0+ is elite at D1.
- **Assists per Set:** Primary setter metric. 10.5+ is strong. 12.0+ is elite.
- **Digs per Set:** Primary defensive metric. 3.2+ is strong. 4.5+ is elite (usually liberos).
- **Blocks per Set:** Primary blocking metric. 1.1+ is strong. 1.5+ is elite.
- **Aces per Set:** Serving metric. 0.40+ is strong. 0.55+ is elite.
- **Serve Receive Pass Rating:** 0-3 scale. 2.15+ is strong. 2.35+ is elite (slightly lower than women's because men's jump serves are harder to receive).
- **Side-Out Percentage:** 60-63% is average at D1 men's (lower than women's ~62-65% because serving is more dominant).

### The 6 Rotations
Same structure as women's volleyball. Teams rotate clockwise. 6 distinct configurations per match. Rotation analysis is central to strategy.

---

## 3. POSITIONS

### Setter (S)
The quarterback of volleyball. Same importance as in women's game. In men's volleyball, setters tend to be taller (6'2"-6'6" at D1) and can be more physically imposing at the net, making the dump/tip game more threatening.

**SKR (Set KR) is 40% of setter evaluation.**

### Outside Hitter (OH)
The most versatile position. In men's volleyball, OHs face harder jump serves in serve receive and must generate more power in their attack to score against larger blocks.

### Middle Blocker (MB)
The rim protector. Men's middles are typically 6'6"-6'10" at D1. Quick attack hitting percentages are higher in men's volleyball (.350+ expected). Blocking at the 2.43m net requires exceptional timing and reach.

### Opposite/Right Side (OPP)
In men's volleyball, the opposite is often the primary scorer on the team (more so than in women's, where the OH is frequently the primary scorer). The men's opposite is expected to score at high volume AND serve at an elite level.

### Libero (L)
The defensive specialist. Men's liberos face the unique challenge of receiving 70+ mph jump serves. The ability to handle this velocity cleanly and pass to target is what separates good men's liberos from elite ones.

### Defensive Specialist (DS)
Same role as women's. Enters for back-row rotations to improve passing or defense.

---

## 4. OFFENSIVE SYSTEMS

Same 6 systems as women's volleyball:
1. **5-1** - One setter, 6 rotations. Most common at elite men's levels.
2. **6-2** - Two setters who hit when front row. Less common at top men's programs.
3. **Swing Offense** - Hitters attack from multiple positions. Requires high IQ.
4. **Fast Tempo** - Speed-based offense. Middles are central. Fragile against bad passing.
5. **Slide-Heavy** - Emphasizes the slide attack. Middles and opposites run slides.
6. **Pipe-Heavy** - Back-row attacks are central. Requires athletic OHs and OPPs.

---

## 5. DEFENSIVE SYSTEMS

Same 5 systems as women's volleyball:
1. **Rotation Defense** - Defenders rotate to cover tips/off-speed.
2. **Perimeter Defense** - Defenders stay on the perimeter (power defense).
3. **Man-Up** - Dedicated tip coverage player.
4. **Read Block** - Blockers read the setter before committing. Most common at D1.
5. **Commit Block** - Blocker commits to one hitter before the set. High risk/reward.

Men's-specific note: Read Block is challenging in the men's game because the faster tempo gives blockers less reaction time. Commit Block is riskier because the men's setter can exploit the committed blocker more aggressively.

---

## 6. COMPETITIVE LANDSCAPE

### NCAA Division I (~50 programs)
The primary competitive level for men's college volleyball. Concentrated in 5 conferences:
- **MPSF:** UCLA, USC, Stanford, BYU, Pepperdine, UCSB, UC Irvine, Grand Canyon, Concordia, CSUN
- **EIVA:** Penn State, Ohio State, Loyola Chicago, Lewis, Ball State, Purdue Fort Wayne, McKendree, Lindenwood
- **Big West:** Long Beach State, UC San Diego, Hawaii, Cal Poly
- **MIVA:** Various Midwest programs (conference memberships shift)
- **Conference Carolinas:** Smaller programs, developing conference

**Note:** Conference memberships change frequently in men's volleyball. Always verify current alignment.

### NCAA Division II (~25 programs)
Limited programs. 4.5 scholarships. Similar to D1 in scholarship constraints.

### NCAA Division III (~90 programs)
Largest division by program count. No athletic scholarships. Strong programs include Springfield, Stevens, Carthage, Nazareth.

### No NJCAA/CCCAA/NAIA Men's Volleyball
Unlike women's volleyball, which has robust junior college and NAIA systems, men's volleyball has no significant NJCAA, CCCAA, or NAIA competitive level. This means:
- The college pipeline is narrower
- There is no JUCO-to-D1 transfer path like women's volleyball has
- D3 serves as the development level that JUCO serves in women's

### Professional Leagues (Overseas Only)
- **Italian SuperLega:** Strongest men's club league in the world. Perugia, Lube Civitanova, Trentino are global powers.
- **Polish PlusLiga:** Nearly as strong as Italy. ZAKSA, Jastrzebski, Resovia. Poland is a volleyball nation.
- **Turkish Efeler Ligi:** Strong and growing. Halkbank, Ziraat Bankasi invest heavily.
- **Brazilian Superliga Masculina:** Powered by Brazil's volleyball culture. Sada Cruzeiro is the standard-bearer.
- **Russian Superliga:** Historically top 3, currently limited access due to geopolitical factors.
- **French Ligue A:** Growing mid-tier European league. Good entry point for Americans.
- **German Bundesliga:** Solid mid-tier. Berlin Recycling Volleys lead. English widely spoken.
- **Japanese V.League:** Professional, corporate-sponsored. Good compensation.
- **Korean V-League:** Corporate-sponsored. Competitive Asian league.

---

## 7. KR SYSTEM PRINCIPLES

### The Phase 3 Anchor is Truth
The production profile anchored against the level legend is the foundation of every evaluation. Phase 6 math confirms and refines. It does not override.

"The legend anchor is truth. The math is confirmation. Not the other way around."

### KR is Universal
A player has ONE KR. That KR is read against multiple level legends to show where he fits across the competitive landscape (Level Tier Map). KR is never multiplied by lambda. KR is never "converted" between levels.

### KLVN Normalizes Inputs, Not Outputs
Lambda adjusts raw production stats during trait scoring. The resulting KR is universal and applies everywhere.

### Confidence is Always Stated
Every evaluation includes a confidence percentage.

### Downstream Never Modifies Upstream
Development, pro transition, scouting, and simulation consume KRs. They never change them.

### System Fit is the Most Predictive Variable Beyond Raw KR
Teams above 97% system fit consistently overperform by 3-4 KR points.

---

## 8. MEN'S VOLLEYBALL-SPECIFIC INTELLIGENCE NOTES

### The Jump Serve Changes Everything
The jump serve is the single biggest differentiator in men's volleyball. It affects:
- **Serve receive evaluation:** Receiving a 75 mph jump serve cleanly requires elite skill. Pass ratings are lower in men's volleyball because of serve velocity.
- **Serving evaluation:** SVR is weighted more heavily in men's OPF because the serve is a more lethal weapon.
- **Team strategy:** Serving strategy (who serves, where, what type) is more impactful in men's volleyball.
- **Simulation:** Serving runs are more common and more devastating. Side-out rates are lower.

### The 4.5 Scholarship Constraint
With only 4.5 scholarships for a roster of 18-22 players:
- Most players are walk-ons (75%+ of the roster)
- Scholarship allocation is a zero-sum strategic decision
- Walk-on development is a critical coaching competency
- International players who need scholarship aid create unique budget pressure
- Programs that develop walk-ons into contributors have a sustainable competitive advantage
- The transfer portal in men's volleyball is smaller and more constrained by scholarship availability

### International Player Impact
Men's D1 volleyball rosters commonly include international players from:
- Brazil, Argentina (South American volleyball powers)
- France, Germany, Italy (European club systems)
- Japan, Korea (Asian volleyball traditions)
- Cuba (historical pipeline, political considerations)
- Various other countries

International players often arrive with club/national team experience that exceeds the typical American recruit's development. This creates a unique evaluation challenge: international transition suppression (early-season stats may be depressed as players adjust to NCAA ball, rules, and culture).

### Spring Season Dynamics
The spring season (January-May) creates:
- Short preseason (return from winter break, limited fall practice)
- Compressed conference schedule
- Gym sharing conflicts with basketball programs
- Multi-sport athlete conflicts with baseball and track
- NCAA tournament alignment with final exams
- Recruiting challenges (coaches are coaching during traditional recruiting evaluation periods)

---

## 9. DATA SOURCES AND RELIABILITY

| Source | Best For | Reliability |
|--------|---------|-------------|
| NCAA stats (stats.ncaa.org) | Season totals, per-set rates, national rankings | High |
| School athletics websites | Roster, schedule, game-by-game stats | High |
| Conference stat leaders pages | Conference-level rankings | High |
| Off the Block (offtheblockvolleyball.com) | Men's volleyball-specific news, rankings | High (editorial) |
| VolleyballMag.com | News, rankings, analysis | High (editorial) |
| AVCA rankings and awards | National rankings, All-American selections | High |
| DataVolley exports | Play-by-play analysis (if available) | Very High |
| FIVB tournament results | International player background | High |
| PrepDig.com | Recruiting rankings (less developed for men's) | Medium |
| Social media / team accounts | Roster updates, lineup changes | Low (verify) |

---

## 10. GLOSSARY

**Ace:** A serve that results directly in a point.
**Approach:** The footwork pattern a hitter uses before jumping to attack.
**Assist:** A set that directly leads to a kill.
**Block Assist:** A block involving two or more players.
**Block Touch:** The height a player can reach with both hands while jumping at the net.
**Commit Block:** A blocker jumps before the set is made, committing to one hitter.
**Dig:** Passing an attacked ball and keeping it in play.
**Dump:** A setter attacking the ball on second contact instead of setting it.
**First Tempo:** The quickest set, where the hitter is already in the air when the setter contacts the ball.
**Float Serve:** A serve with no spin that moves unpredictably.
**Hitting Percentage:** (Kills - Errors) / Attempts. Primary efficiency metric.
**Jump Serve:** An aggressive topspin serve hit while jumping. The dominant serve type in men's volleyball.
**Kill:** An attack that directly results in a point.
**Libero:** A back-row defensive specialist who cannot attack above net height or block.
**Out of System:** When the pass is off-target and the setter cannot run the planned offense.
**Pancake:** A one-handed defensive technique where the hand is laid flat on the floor.
**Pass Rating:** 0-3 scale rating the quality of a serve receive.
**Pipe:** A back-row attack from position 6 (center back).
**Rally:** The sequence of play from serve to the point being awarded.
**Read Block:** Blockers watch the setter and react to the set before jumping.
**Rotation:** One of 6 positions on the court that a team cycles through.
**Seal:** When adjacent blockers close the gap between them.
**Side-Out:** The receiving team winning the rally and earning the serve.
**Slide:** A quick attack where the middle runs laterally along the net before hitting.
**Solo Block:** A block by one player that results directly in a point.
**Stuff Block:** A block that sends the ball directly back onto the attacker's side.
**Tool:** An attack that intentionally hits off the blocker's hands and goes out of bounds.
**Transition:** The phase of play after the initial serve receive attack, when the rally continues.
**Walk-On:** A player on the roster who does not receive athletic scholarship aid. The majority of men's volleyball players.

---

## END OF KNOWLEDGE BASE
