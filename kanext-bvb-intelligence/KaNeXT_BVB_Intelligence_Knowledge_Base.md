# KaNeXT Beach Volleyball Intelligence Knowledge Base v1

---

## 1. SYSTEM OVERVIEW

The KaNeXT Beach Volleyball Intelligence system is a comprehensive evaluation, analysis, and decision-making platform for beach volleyball. It uses the KaNeXT KR (KaNeXT Rating) framework to produce universal, deterministic ratings for individual players, partnerships (pairs), and college squads. The system covers both men's and women's beach volleyball.

### Core Architecture
- **KR (KaNeXT Rating):** Universal 0-100 rating for every player and partnership. One number, multiple interpretations across levels.
- **KLVN Lambda Normalization:** Adjusts raw production stats across competitive levels. FIVB Elite 16 = 1.000 reference for pro; AVP Pro = 1.000 reference for college-to-pro normalization. Normalizes inputs, never outputs.
- **4 Component KRs:** AKR (Attack), DKR (Defense/Dig), SVR (Serve), IQKR (Beach IQ). Weighted differently by role through OPF (Overall Performance Formula).
- **Legend System:** Tier labels at each competitive level that interpret what a KR means in context. Display-only; does not produce KR.
- **Phase 3 Anchor:** Production-based reality check against the level legend. The foundation of every evaluation.
- **Phase 6 OPF:** Mathematical composite of component KRs, bounded to within +/-10 of the Phase 3 anchor.
- **Partnership KR:** Chemistry-weighted aggregation of two players' KRs that captures pair synergy.
- **Squad KR:** College-level aggregation of 5-6 pair Partnership KRs for dual match evaluation.

### 8 Intelligence Modes
1. **Player Evaluation** - Individual KR rating (0-100)
2. **Partnership Evaluation** - Pair-level KR with chemistry scoring
3. **Match Simulation** - Set-by-set match projection with weather modifiers
4. **Scouting & Match Ops** - 4-phase match intelligence (prematch, in-match, between-sets, postmatch)
5. **Development Intelligence** - Gap analysis, development roadmaps, partner matching
6. **Pro Transition** - Tour readiness, AVP/FIVB placement, financial projection, Olympic pathway
7. **Legend Calibration** - Testing and refining tier labels against real players
8. **Recruiting Intelligence** - Indoor-to-beach transition evaluation, junior beach prospects

---

## 2. BEACH VOLLEYBALL FUNDAMENTALS

### The Sport
Beach volleyball is played between two pairs of 2 players on a sand court divided by a net (7'11 5/8" / 2.43m for men, 7'4 1/8" / 2.24m for women). Matches are best of 3 sets. Sets 1-2 are played to 21 points (win by 2), set 3 to 15 (win by 2). Rally scoring means every rally awards a point. Teams switch sides every 7 points (5 in set 3).

### What Makes Beach Volleyball Unique
Beach volleyball is fundamentally different from indoor volleyball in every dimension:

**Format:** 2v2 instead of 6v6. Every player touches the ball on every rally. There are no specialists - both players must attack, defend, pass, serve, set, block, and communicate. There is no hiding.

**No Substitutions:** Two players play the entire match. Fatigue management across a tournament day (multiple matches) is a strategic skill. There is no fresh body coming off the bench.

**Sand Surface:** Sand changes everything about how volleyball is played. Movement is slower and more fatiguing. Jumping is lower. Lateral quickness is limited. Players who are elite on hardcourt may struggle on sand. Conversely, players who are exceptional sand movers have a significant advantage that does not show up in traditional metrics.

**No Rotations:** There are no front-row/back-row rules like indoor. Players have functional roles (blocker and defender) but are free to play anywhere on their side of the court. Many elite pairs switch sides rather than locking into fixed roles.

**Weather:** Wind, sun, and temperature are major competition variables. They affect serving, ball flight, shot selection, stamina, and strategy. Indoor volleyball has none of these variables. A match in 20 mph crosswind is a completely different sport than a match in a calm indoor arena.

**Ball Handling:** Rules for hand setting (overhead setting) are enforced much more strictly in beach than indoor. Double contacts and lifts that would be allowed indoors are called as faults on the beach. This means many beach players primarily bump-set (using their platform) rather than hand-set.

**Communication:** With only 2 players, communication is constant and critical. The blocker gives hand signals behind their back before each rally to tell the defender what blocking strategy they will use. Verbal calls during rallies direct positioning. The quality of this communication directly determines defensive effectiveness.

**Partnership Chemistry:** Beach volleyball is the most partnership-dependent sport in existence. You play with ONE other person for the entire match. Trust, complementary skills, communication style, and mutual understanding matter as much as individual talent. A KR 85 player paired with a KR 90 player who has poor chemistry with them may perform worse than a KR 82/KR 82 pair with elite chemistry.

**Tournament Format:** Most beach volleyball competitions use double-elimination or pool-play-into-bracket formats. Pairs typically play 3-5 matches in a single day. Energy conservation, pacing, and recovery between matches are strategic considerations that do not exist in indoor volleyball's single-match format.

### Key Statistical Concepts
- **Hitting Percentage:** (Kills - Errors) / Attempts. The efficiency metric. .250+ is solid in beach. .300+ is strong. .370+ is elite. Beach hitting% tends to be lower than indoor because every attack is contested (no quick-attack middle hitting to inflate the number).
- **Kills per Match:** Primary attack volume metric. Per-match rates are standard in beach (not per-set, because sets are shorter).
- **Aces per Match:** Serving metric. Aces are high-value because they require zero rally effort.
- **Digs per Match:** Primary defensive metric. Measures defensive ball-handling and court coverage.
- **Blocks per Match:** Net defense metric. In beach, solo blocks are the norm (unlike indoor where block assists are common).
- **Side-Out Percentage:** Points won when receiving serve. Fundamental to pair success. Elite pairs side out at 60%+.

---

## 3. COMPETITIVE LANDSCAPE

### College Beach Volleyball
- **NCAA Women's Beach:** Added as an NCAA championship sport in 2016. Rapidly growing. Uses a National Collegiate Championship format where all divisions compete together (no separate D1/D2/D3 championships).
- **Dual Match Format:** Teams field 5 pairs. Each pair plays one match (best of 3). Team that wins 3+ pair matches wins the dual.
- **Scholarship Limits:** 6 full equivalents for women's beach. Many programs share roster spots and scholarships with the indoor volleyball program.
- **Top Programs:** USC, UCLA, LSU, Loyola Marymount, Florida State, TCU, Cal Poly, Stanford, Pepperdine, Hawai'i.
- **Indoor Overlap:** Most college beach players also play indoor volleyball. This creates dual-evaluation opportunities and indoor-to-beach transition analysis.

- **Men's Beach:** NOT an NCAA-sanctioned sport. Men compete at the club level. Some universities have competitive club programs (UCLA, USC, Pepperdine) but there is no NCAA championship structure.

### Professional Beach Volleyball
- **FIVB Beach Pro Tour:** The international circuit, restructured in 2022-23 into three tiers:
  - **Elite 16:** Top tier. 16-pair main draw of the world's best. Multiple events per season globally.
  - **Challenge:** Second tier. Larger fields. Strong international competition.
  - **Futures:** Development tier. Emerging and veteran pairs.
- **AVP (Association of Volleyball Professionals):** The top US domestic tour. Multiple events across the US, primarily on the beach (Hermosa Beach, Manhattan Beach, Huntington Beach, Atlanta, Austin, etc.).
- **AVP Next:** Development/qualifying tier of the AVP.
- **Olympics:** Beach volleyball has been an Olympic sport since 1996 (Atlanta). Each country can enter up to 2 pairs per gender. Olympic qualification is based on FIVB world ranking points.
- **Athletes Unlimited Beach:** Innovative format with individual scoring and rotating partnerships. US-based.
- **NVA (National Volleyball Association):** Alternative US tour.

### Notable Beach Volleyball Nations
- **United States:** Historically strong in both men's and women's. Kerri Walsh Jennings/Misty May-Treanor (3 Olympic golds) are the sport's most famous pair. Currently strong with Hughes/Cheng (2024 Olympic gold), Partain/Benesh, and others.
- **Brazil:** Perennial powerhouse. Deep beach volleyball culture. Multiple Olympic medalists.
- **Norway:** Mol/Sorum won 2020 Olympic gold (men's). Small country with elite development.
- **Sweden:** Ahman/Hellvig among the best young men's pairs in the world.
- **Australia:** Strong beach volleyball tradition tied to beach culture.
- **Germany:** Consistent international contender in both genders.
- **Netherlands:** Strong women's program.
- **Canada:** Growing beach volleyball program with strong pairs.

---

## 4. EVALUATION FRAMEWORK SUMMARY

### Individual Player KR
Every beach volleyball player receives a KR (0-100) based on 4 component KRs weighted by role:

| Component | Abbreviation | What It Measures |
|-----------|-------------|-----------------|
| Attack | AKR | Kill efficiency, hitting%, shot variety, tool usage, setting ability, attack in wind |
| Defense/Dig | DKR | Dig rate, serve receive, pursuit range, read speed, positioning discipline |
| Serve | SVR | Ace rate, ace-to-error ratio, serve type versatility, tactical serving, serving in wind |
| Beach IQ | IQKR | Blocking strategy, defensive positioning calls, shot selection, wind/sun adaptation, tournament management, partnership communication, opponent reading |

### OPF Weights by Role
- **Blocker (College):** AKR 30%, DKR 20%, SVR 20%, IQKR 30%
- **Defender (College):** AKR 22%, DKR 35%, SVR 18%, IQKR 25%
- **Switch (College):** AKR 27%, DKR 27%, SVR 18%, IQKR 28%
- **Blocker (Pro):** AKR 28%, DKR 18%, SVR 18%, IQKR 36%
- **Defender (Pro):** AKR 20%, DKR 35%, SVR 17%, IQKR 28%
- **Switch (Pro):** AKR 25%, DKR 25%, SVR 18%, IQKR 32%

### Partnership KR
Two individual KRs + Chemistry Score (-5 to +5) = Partnership KR. Chemistry factors: role complementarity, serve diversity, height differential, handedness diversity, communication quality.

### Squad KR (College)
Weighted aggregation of top 5 pair Partnership KRs: Pair 1 (24%), Pair 2 (22%), Pair 3 (20%), Pair 4 (18%), Pair 5 (16%).

---

## 5. INDOOR-TO-BEACH TRANSITION

The Indoor-to-Beach Transition Engine is a critical component of the beach volleyball intelligence system. Most college beach players and many professional beach players transitioned from indoor volleyball.

### Translation Quality by Indoor Position
- Outside Hitter -> Defender/Switch: HIGH translation
- Opposite -> Blocker/Switch: MEDIUM-HIGH translation
- Setter -> Defender/Switch: MEDIUM translation
- Middle Blocker -> Blocker: MEDIUM-LOW translation
- Libero -> Defender: MEDIUM translation
- Defensive Specialist -> Defender: MEDIUM-LOW translation

### Translation Timeline
Year 1 of beach: significant adjustment (-8 KR from fully translated projection)
Year 2: improving (-4 KR)
Year 3: near full translation (-1 KR)
Year 4+: fully translated (0 penalty)

---

## 6. WEATHER AND ENVIRONMENT

Beach volleyball is unique among KaNeXT-covered sports because environmental conditions directly affect gameplay and must be factored into simulation, scouting, and evaluation.

### Wind Impact
Wind affects every phase of the game: serving (float serves move unpredictably; jump serves lose accuracy), attacking (ball flight changes; shot selection shifts), defense (positioning must account for wind-altered trajectories), and communication (verbal calls can be lost in wind).

### Sun Impact
Sun position affects serving (toss angle), defending (reading high balls), and transitioning (tracking the ball from block to defense). Side switching mitigates but does not eliminate sun advantage.

### Temperature Impact
High heat increases fatigue, which compounds across a tournament day. Conditioning and hydration strategy become competitive advantages.

### Sand Conditions
Sand depth, moisture level, and consistency affect movement, jumping, and fatigue. Deep/soft sand favors lighter, more agile players. Compact sand favors power players with higher verticals.

---

## 7. FILE SYSTEM

The Beach Volleyball Intelligence system comprises 6 core intelligence files, 2 college legend files, 3 pro/KLVN files, and this knowledge base:

| File | Name | Purpose |
|------|------|---------|
| 07 | Nexus BVB Intelligence Skill v1 | Master routing and mode definitions |
| 01 | BVB Player Eval Process v1 | Evaluation pipeline, V1 Protocol, suppression detection |
| 02 | BVB Player Eval Reference v1 | Traits, archetypes, OPF, badges, overrides, risks, KLVN, legends |
| 03 | BVB Team Intelligence v1 | Partnership KR, Squad KR, pair chemistry, scholarship allocation |
| 04 | BVB Simulation Engine v1 | Match simulation, weather modifiers, fatigue, tournament projection |
| 05 | BVB Scouting Match Ops v1 | 4-phase match ops, wind/sun game plans, scouting reports |
| 06 | BVB Downstream Engines v1 | Indoor-to-beach transition, development, pro transition, recruiting |
| Legend | Legend NCAA BVB v1 | NCAA women's beach legends (Top, Mid-Tier, Developing) |
| Legend | Legend Club BVB v1 | Club men's beach legend |
| KLVN | College BVB KLVN Lambdas v1 | College-level normalization lambdas |
| Pro | Pro BVB KR Legend v1 | Professional KR legend (AVP, FIVB, Olympics) |
| Pro | Pro BVB KLVN Lambdas v1 | Professional tour normalization lambdas |
| KB | KaNeXT BVB Intelligence KB v1 | This file. Overview and reference. |

---

## 8. KEY PRINCIPLES

1. **The legend anchor is truth. The math is confirmation.** Phase 3 production anchor sets the floor/ceiling. Phase 6 OPF math adjusts within +/-10 but never overrides.
2. **Partnership chemistry is as important as individual skill.** A KR 90 player with a mismatched partner performs worse than a KR 82 player with a perfectly complementary partner.
3. **Indoor-to-beach translation is not 1:1.** Indoor skill translates partially. Beach-specific skills (sand movement, shot variety, bump-setting, wind adaptation, partnership communication) must be developed independently.
4. **Weather is not noise - it is signal.** Players who perform in wind, sun, and heat are demonstrating a real skill. The system captures this through IQKR and the Wind Warrior badge.
5. **KR is universal.** One player, one number. The Level Tier Map shows how that number is interpreted at different levels.
6. **KLVN normalizes inputs, not outputs.** Lambda adjusts raw stats during scoring. It never converts KR between levels.
7. **Downstream never modifies upstream.** Development, pro transition, scouting, and simulation consume KR but never change it.
8. **No fabrication.** Missing data = UNSCORED. The system declares what it knows and what it does not know through confidence percentages.
9. **Suppression detection is mandatory.** Role suppression, partnership suppression, injury suppression, pregnancy/motherhood suppression, and indoor-to-beach transition suppression must all be checked.
10. **Both genders, separate benchmarks.** Men's and women's beach volleyball use the same evaluation framework but different production benchmarks, legends, and trait bands.
