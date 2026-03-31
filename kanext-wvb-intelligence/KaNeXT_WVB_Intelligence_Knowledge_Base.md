# KaNeXT Women's Volleyball Intelligence Knowledge Base v1

---

## 1. SYSTEM OVERVIEW

The KaNeXT Women's Volleyball Intelligence system is a comprehensive evaluation, analysis, and decision-making platform for women's volleyball. It uses the KaNeXT KR (KaNeXT Rating) framework to produce universal, deterministic ratings for players, teams, and match projections.

### Core Architecture
- **KR (KaNeXT Rating):** Universal 0-100 rating for every player and team. One number, multiple interpretations across levels.
- **KLVN Lambda Normalization:** Adjusts raw production stats across competitive levels. D1 Power 4 = 1.000 reference. Normalizes inputs, never outputs.
- **6 Component KRs:** AKR (Attack), BKR (Block), DKR (Dig/Defense), SVR (Serve), SKR (Set), IQKR (Volleyball IQ). Weighted differently by position through OPF (Overall Performance Formula).
- **Legend System:** Tier labels at each competitive level that interpret what a KR means in context. Display-only; does not produce KR.
- **Phase 3 Anchor:** Production-based reality check against the level legend. The foundation of every evaluation.
- **Phase 6 OPF:** Mathematical composite of component KRs, bounded to within +/-10 of the Phase 3 anchor.
- **System Fit:** How well a player's archetype matches a team's offensive and defensive systems. The most predictive variable beyond raw KR.

### 8 Intelligence Modes
1. **Player Evaluation** - Individual KR rating (0-100)
2. **Team Evaluation** - Roster-level KR with rotation analysis
3. **Match Simulation** - Set-by-set match projection with rotation matchups
4. **Scouting & Match Ops** - 4-phase match intelligence (prematch, in-match, between-sets, postmatch)
5. **Development Intelligence** - Gap analysis, development roadmaps, transfer portal fit
6. **Pro Transition** - Professional readiness, league placement, salary projection
7. **Legend Calibration** - Testing and refining tier labels against real players
8. **Recruiting Intelligence** - High school and club volleyball prospect evaluation

---

## 2. WOMEN'S VOLLEYBALL FUNDAMENTALS

### The Sport
Women's volleyball is played between two teams of 6 players on a court divided by a net (7'4 1/8" / 2.24m for women). Matches are best of 5 sets. Sets are played to 25 points (win by 2), except the fifth set which is played to 15. Rally scoring means every rally awards a point.

### Why Women's Volleyball Matters
- **Largest women's college sport by participation** in the United States
- Nearly every NCAA institution sponsors women's volleyball
- Growing professional landscape in the US (Pro Volleyball Federation launched 2024)
- Strong international professional leagues (Turkey, Italy, Brazil, Japan, Korea, China, Poland)
- Title IX compliance sport for many institutions
- Growing media visibility and fan engagement

### Key Statistical Concepts
- **Hitting Percentage:** (Kills - Errors) / Attempts. THE efficiency metric. .250+ is strong at D1. .300+ is excellent. .350+ is elite.
- **Kills per Set:** Primary volume metric for attackers. 3.5+ is strong. 4.5+ is elite at D1 Power 4.
- **Assists per Set:** Primary setter metric. 10.0+ is strong. 11.5+ is elite.
- **Digs per Set:** Primary defensive metric. 3.5+ is strong. 5.0+ is elite (usually liberos).
- **Blocks per Set:** Primary blocking metric (solo + assists). 1.0+ is strong. 1.4+ is elite.
- **Aces per Set:** Serving metric. 0.35+ is strong. 0.50+ is elite.
- **Serve Receive Pass Rating:** 0-3 scale. 2.20+ is strong. 2.40+ is elite.
- **Side-Out Percentage:** The receiving team's win rate on the opponent's serve. 62-65% is average at D1. 68%+ is elite. The single most important team metric.

### The 6 Rotations
Volleyball teams rotate clockwise after winning a rally on the opponent's serve (side-out). There are 6 rotational positions on the court. Each rotation determines which 3 players are in the front row (can attack above the net and block) and which 3 are in the back row (cannot attack above the net at the front of the court, cannot block).

This creates 6 distinct lineup configurations per match. Some rotations are strong (best attackers at the net, strong server up) and some are weak (weaker blockers at the net, primary attacker in back row). Rotation analysis is unique to volleyball and is central to strategy.

---

## 3. POSITIONS

### Setter (S)
The quarterback of volleyball. Touches the ball on second contact of virtually every rally. Decides who attacks, at what tempo, and from where. In a 5-1 system, plays all 6 rotations. In a 6-2 system, sets from back row and attacks from front row.

**What makes a great setter:**
- Decision-making under pressure
- Ability to set out of system (bad pass, still delivers a hittable ball)
- Distribution balance (spreads the offense to keep blockers guessing)
- Tempo control (runs fast offense to catch blockers out of position)
- Dump/tip threat (scores when the block does not account for her)
- Back-row defense (must dig and pass when in back row)
- Leadership and communication

**SKR (Set KR) is 40% of setter evaluation.** No other position has a single component weighted this heavily.

### Outside Hitter (OH)
The most versatile position. Attacks from the left side, passes serve receive, defends in back row, blocks on the left, and serves. Most teams have two OHs.

**What makes a great OH:**
- Six-rotation capability (plays all 6 rotations without substitution)
- Serve receive (primary passer)
- Left-side attack against a set block
- Transition attack (kills after digging)
- Defensive play in back row
- Back-row attack capability (pipe)

### Middle Blocker (MB)
The rim protector. Blocks in the middle of the net and attacks quick sets. Usually the tallest player on the team. Most MBs sub out in back row for a libero.

**What makes a great MB:**
- Blocking dominance (stuff blocks and touches)
- Quick attack efficiency (.300+ hitting%)
- Slide attack capability
- Transition off the block (land and immediately attack)
- Read speed (identify the set location and move to it)

### Opposite/Right Side (OPP)
Primary scoring option from the right side of the net. Typically the team's most dynamic attacker. Some OPPs pass serve receive; others do not.

**What makes a great OPP:**
- Right-side attack power
- Ability to score against a double block
- Right-side blocking
- Serving
- Back-row attack from the right side

### Libero (L)
Defensive specialist who wears a different colored jersey. Cannot attack above net height, cannot block, cannot serve in some rule sets (can serve in NCAA). Replaces a back-row player (usually MB) and plays only in the back row.

**What makes a great libero:**
- Serve receive passing (often the team's best passer)
- Dig rate and range
- Communication and defensive leadership
- Consistency under pressure

### Defensive Specialist (DS)
Enters the game as a substitution (not libero replacement) for back-row rotations. Typically replaces an attacker who is a weak back-row defender.

**What makes a great DS:**
- Serve receive quality
- Defensive positioning
- Serving
- Reliability in limited rotations

---

## 4. OFFENSIVE SYSTEMS

### 5-1
One setter plays all 6 rotations. Five attackers. Most common system at high levels. Advantages: consistency (one setter), the setter becomes a scoring threat when front row. Disadvantages: only 2 front-row attackers when the setter is front row.

### 6-2
Two setters who only set from back row and attack from front row. Always 3 front-row attackers. Advantages: more offensive firepower. Disadvantages: two different setters means two different tempos, less setting consistency. More common at lower levels or teams without an elite single setter.

### Swing Offense
Hitters move positions and approaches to confuse blockers. Misdirection-based. Requires high volleyball IQ across all attackers. Very effective against static blocking schemes.

### Fast Tempo
Quick sets dominate. Middles run first-tempo attacks. Relies heavily on first-ball passing (serve receive). When passing is good, the offense is nearly unblockable. When passing is bad, the system collapses.

### Slide-Heavy
Emphasizes slide attacks (middles running along the net). Creates problems for blocking schemes because the slide attack happens in a different location than the standard quick attack.

### Pipe-Heavy
Emphasizes back-row attacks through position 6 (the pipe). Adds a dimension that is unblockable (back-row attacks cannot be blocked). Requires OHs and OPPs capable of hitting from the back row.

---

## 5. DEFENSIVE SYSTEMS

### Rotation Defense (Perimeter)
Players rotate to cover tips and off-speed shots. Standard base defense. Balanced against various attack types.

### Perimeter Defense
Players stay on the perimeter. Strong against hard-driven attacks (power hitting). Weak against tips and off-speed.

### Man-Up (Dedicated Tip Coverage)
One player assigned to cover short/tip shots. Good against teams with diverse attacks (power and finesse). Leaves one fewer player on the perimeter.

### Read Block
Blockers read the setter and react to the set before committing. Requires disciplined, smart blockers. Most common blocking scheme at high levels. Better against diverse offenses.

### Commit Block
One blocker commits to a specific hitter before the set is made. High risk (wrong guess = no block at all) but high reward (right guess = stuff block). Used selectively against dominant quick attackers.

---

## 6. COMPETITIVE LANDSCAPE

### College Levels (US)
- **NCAA D1 Power 4:** Big Ten, SEC, ACC, Big 12. The Big Ten is the strongest volleyball conference in the country. Wisconsin, Nebraska, Texas, Penn State, Stanford (now ACC) are historical powers.
- **NCAA D1 Mid-Major:** WCC, MVC, A-10, AAC, Mountain West, etc. Strong programs exist (BYU was historically WCC before moving to Big 12).
- **NCAA D1 Low-Major:** America East, Big South, Ivy League, MEAC, NEC, SWAC, etc.
- **NCAA D2:** 12 scholarships available. Strong programs like Concordia-St. Paul, Western Washington.
- **NCAA D3:** No athletic scholarships. Programs like Calvin, Claremont-Mudd-Scripps.
- **NAIA:** 8 scholarships. Strong programs like Park University, Columbia (MO).
- **NJCAA D1:** 14 tuition-only scholarships. Strong pipeline to D1.
- **NJCAA D2/D3:** Limited scholarships/no scholarships.
- **CCCAA:** California community colleges. Strong volleyball tradition in California.

### Professional Leagues (Worldwide)
- **Turkish Sultanlar Ligi:** Strongest women's club league in the world. VakifBank Istanbul is the most decorated women's club in history. Highest salaries. Attracts the best international talent.
- **Italian Serie A1:** Historically dominant. Prosecco DOC Imoco Conegliano has been dominant in recent years. Strong competition with Turkey for top players.
- **Brazilian Superliga:** Powered by Brazil's deep volleyball culture. Strong domestic talent pipeline.
- **CEV Champions League:** European club competition. Turkish and Italian clubs have dominated.
- **Japanese V.League:** Professional, well-organized. Strong Asian volleyball tradition.
- **Korean V-League:** Competitive Asian league.
- **Chinese Volleyball Super League:** Growing with government investment.
- **Polish Liga Siatkowki:** Growing European league.
- **Pro Volleyball Federation (PVF):** US league launched 2024. 10 teams (expanding). Growing media deals. PVF draft for college players. Salaries are growing but still below European top leagues.
- **Athletes Unlimited Volleyball:** Innovative US-based format with individual scoring and rotating captains. More of a showcase than a traditional league.

---

## 7. KR SYSTEM PRINCIPLES

### The Phase 3 Anchor is Truth
The production profile (what the player actually does on the court, measured in per-set stats) anchored against the level legend is the foundation of every evaluation. Phase 6 math confirms and refines. It does not override.

"The legend anchor is truth. The math is confirmation. Not the other way around."

### KR is Universal
A player has ONE KR. That KR is read against multiple level legends to show where she fits across the competitive landscape (Level Tier Map). KR is never multiplied by lambda. KR is never "converted" between levels.

### KLVN Normalizes Inputs, Not Outputs
Lambda adjusts raw production stats during trait scoring. A player at NAIA level with 4.0 kills/set has those stats normalized by the NAIA lambda (0.720) before scoring. The resulting KR is universal and applies everywhere.

### Confidence is Always Stated
Every evaluation includes a confidence percentage. This communicates how much data supports the rating. A KR of 85 at 90% confidence is very different from a KR of 85 at 55% confidence.

### Downstream Never Modifies Upstream
The development engine, pro transition engine, scouting, and simulation all consume player and team KRs. They never change them. Upstream truth is locked.

### System Fit is the Most Predictive Variable Beyond Raw KR
Two teams with identical Team KRs can have very different outcomes based on how well their personnel fit their systems. Teams above 97% system fit consistently overperform by 3-4 KR points.

---

## 8. VOLLEYBALL-SPECIFIC INTELLIGENCE NOTES

### Serve Receive is the Foundation
A team that cannot pass serve receive cannot run its offense. Period. The quality of first-ball passing determines whether the setter can run a full offense (quick sets, misdirection, tempo) or is forced into a simplified, high-ball offense that is easy to block.

The best passing teams in the country play at a 2.30+ pass rating on the 0-3 scale. The worst Power 4 teams average below 2.00. That 0.30 difference is the gap between running a complete offense and being predictable.

### Height at the Net is the Primary Physical Mismatch
Unlike basketball (where height, wingspan, speed, and strength all compete), volleyball's physical hierarchy is dominated by net height. A 6'4" middle blocker with a 10'6" block touch creates a wall that no amount of skill from a 5'10" attacker can overcome consistently. When evaluating physical mismatches, block touch height and approach jump touch are the primary variables.

### The Setter is Everything
A team with a great setter and average hitters will outperform a team with average setting and great hitters. The setter's decision-making, tempo, and distribution are the offense. Setter evaluation (SKR) is the deepest section of the evaluation system because getting the setter evaluation right is the single most important evaluation in the sport.

### Rotation Analysis Drives Strategy
Because volleyball cycles through 6 rotations, every team has stronger and weaker rotations. Smart coaches serve strategically to put the opponent in their weakest rotation. Smart game planning identifies which rotations to attack and which to survive. The simulation engine models these rotation-level matchups, which is unique to volleyball and not present in most other sports.

### Rally Scoring Creates Volatility
Unlike sports with time clocks, volleyball sets end at a point threshold. Every rally is a point. This means that momentum runs (3-0, 5-0 scoring runs) are devastating and that serving is critically important. A 5-point serving run can swing a set from 18-15 to 18-20 in minutes.

---

## 9. DATA SOURCES AND RELIABILITY

| Source | Best For | Reliability |
|--------|---------|-------------|
| NCAA stats (stats.ncaa.org) | Season totals, per-set rates, national rankings | High |
| School athletics websites | Roster, schedule, game-by-game stats | High |
| Conference stat leaders pages | Conference-level rankings | High |
| MaxPreps | High school stats | Medium (varies by school reporting) |
| PrepDig.com | Club recruiting rankings | Medium |
| PrepVolleyball.com | Recruiting rankings | Medium |
| VolleyballMag.com | News, rankings, analysis | High (editorial) |
| DataVolley exports | Play-by-play analysis (if available) | Very High |
| USAV tournament results | Club volleyball results | Medium |
| Social media / team accounts | Roster updates, lineup changes, injury news | Low (verify) |

---

## 10. GLOSSARY

**Ace:** A serve that results directly in a point (not returned by the opponent).
**Approach:** The footwork pattern a hitter uses before jumping to attack.
**Assist:** A set that directly leads to a kill.
**Block Assist:** A block involving two or more players.
**Block Touch:** The height a player can reach with both hands while jumping at the net.
**Commit Block:** A blocker jumps to block before the set is made, committing to one hitter.
**Dig:** Passing an attacked ball and keeping it in play.
**Dump:** A setter attacking the ball on second contact instead of setting it.
**First Tempo:** The quickest set, where the hitter is already in the air when the setter contacts the ball.
**Float Serve:** A serve with no spin that moves unpredictably (like a knuckleball).
**Hitting Percentage:** (Kills - Errors) / Attempts. Primary efficiency metric.
**Jump Serve:** An aggressive topspin serve hit while jumping.
**Kill:** An attack that directly results in a point.
**Libero:** A back-row defensive specialist in a different colored jersey who cannot attack above net height or block.
**Out of System:** When the pass is off-target and the setter cannot run the planned offense.
**Pancake:** A one-handed defensive technique where the hand is laid flat on the floor so the ball bounces off the back of the hand.
**Pass Rating:** 0-3 scale rating the quality of a serve receive (3 = perfect, 0 = ace).
**Pipe:** A back-row attack from position 6 (center back).
**Rally:** The sequence of play from serve to the point being awarded.
**Read Block:** Blockers watch the setter and react to the set before jumping.
**Rotation:** One of 6 positions on the court that a team cycles through.
**Seal:** When adjacent blockers close the gap between them so hitters cannot hit through the seam.
**Second Tempo:** A medium-speed set where the hitter begins their approach as the setter contacts the ball.
**Set:** The second contact in a rally that directs the ball to a hitter. Also refers to each scoring period (first set, second set, etc.).
**Side-Out:** The receiving team winning the rally and earning the serve.
**Slide:** A quick attack where the middle runs laterally along the net before hitting.
**Solo Block:** A block by one player that results directly in a point.
**Sprawl:** A defensive technique where the player extends fully forward to dig a ball.
**Stuff Block:** A block that sends the ball directly back onto the attacker's side for a point.
**Third Tempo:** The slowest (highest) set. Easiest to block but gives the hitter the most time.
**Tool:** An attack that intentionally hits off the blocker's hands and goes out of bounds (point for the attacker).
**Transition:** The phase of play after the initial serve receive attack, when the rally continues.

---

## END OF KNOWLEDGE BASE
