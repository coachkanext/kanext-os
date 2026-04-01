# KaNeXT Beach Volleyball Intelligence - Master Skill v1

## HOW THIS WORKS
The beach volleyball intelligence system is split across 6 knowledge files + this skill. Each file has a specific job. You route to the right file(s) based on what is being asked.

**CRITICAL:** File 02 (Reference) is the largest file. NEVER load the whole thing. Search it for specific sections using the search terms below.

## SPORT-SPECIFIC FUNDAMENTALS
Beach volleyball is structurally different from indoor volleyball. These rules are non-negotiable:
- **2v2 format:** Every player touches the ball on every rally. There is no hiding. Both players must attack, defend, pass, and communicate.
- **No substitutions:** Two players play the entire match. Fatigue management across a tournament day (multiple matches) is critical.
- **Sand surface:** Movement is fundamentally different from hardcourt. Jumping is lower, lateral movement is slower, and fatigue accumulates faster. Sand depth and consistency vary by venue.
- **No rotations:** Players have functional roles (blocker/defender) but switch sides. There are no front-row/back-row rules like indoor.
- **Best of 3 sets:** Sets 1-2 to 21 (win by 2), set 3 to 15 (win by 2). NOT best of 5.
- **Side switching:** Teams switch sides every 7 points (sets 1-2) and every 5 points (set 3).
- **Wind, sun, and temperature** are major competition variables. They affect serving, ball flight, shot selection, and stamina.
- **Ball handling rules are stricter:** Hand setting (overhead) is called much tighter than indoor. Double contacts and lifts are called more frequently. Many beach players primarily bump-set.
- **Hand signals:** The blocker gives hand signals behind their back to communicate blocking strategy to the defender before each serve.
- **Partnership chemistry** matters more than in any other team sport. You play with ONE other person for the entire match. Communication, trust, and complementary skill sets are paramount.
- **Tournament format:** Most competitions are double-elimination or pool play into bracket. Teams play multiple matches per day. Energy conservation and pacing are strategic.
- **4 Component KRs:** AKR (Attack), DKR (Defense/Dig), SVR (Serve), IQKR (Beach IQ). NOT 6 like indoor. No BKR or SKR as standalone components - blocking is folded into IQKR (it is a tactical decision), and setting is folded into AKR/DKR (both players set in beach).
- **2 functional roles:** Blocker and Defender. Many elite pairs switch sides rather than locking roles.
- **Per-match statistics** are the primary unit. Beach uses per-match rates (kills/match, digs/match, aces/match) rather than per-set because sets are shorter and sample sizes within a single set are small. Season-level per-match averages are the V1 anchor.
- **Partnership evaluation is mandatory.** Individual KR AND Partnership KR must both be produced. A player's individual KR does not change based on partner, but Partnership KR captures the synergy (or lack thereof).

## ROUTING TABLE

### "Evaluate this player" / "What's her/his KR?" / "Rate [player]"
**FIRST: Determine the data tier.** If evaluating from box score + per-match stats (no video data), this is V1.

**V1 evaluations (box score + per-match stats):**
-> Search **File 01** for "V1 EVALUATION PROTOCOL" and follow the method:
  1. Set Coach Context
  2. Phase 3 - Production Anchor (map stats/role against legend tiers)
  3. Phase 6 - OPF math with 4 component KRs + proxy confidence weighting
  4. Phase 6 adjusts within Phase 3 +/-10
  5. Final KR output
-> Search **File 02** for specific reference lookups as needed (trait bands, OPF weights, KLVN)
-> For legend interpretation: search the **Legend section in File 02 matching the player's level**

**V1+/V2/V3 evaluations (video data or advanced tracking available):**
-> Search **File 01** for the standard pipeline steps (Master Execution Flow)
-> Search **File 02** for specific lookups:
  - Trait scoring: search "Attack Cluster" or "Defense Cluster" or [cluster name]
  - Archetype assignment: search "ARCHETYPE LIBRARY"
  - Badge check: search "BADGES"
  - Override check: search "OVERRIDES"
  - Risk check: search "SYSTEM RISKS"
  - Level normalization: search "KLVN"
  - Impact modifiers: search "IMPACT MODIFIERS"
-> For legend interpretation: search **File 02** for the relevant legend section

### Legend file routing (by level):
- NCAA Women's Beach (National Collegiate) -> search File 02 "LEGEND: NCAA WOMEN'S BEACH"
- Club/Recreational Men's -> search File 02 "LEGEND: CLUB MEN'S BEACH"
- AVP Pro (domestic US) -> search File 02 "PRO PLAYER KR LEGEND"
- FIVB/Beach Pro Tour -> search File 02 "PRO PLAYER KR LEGEND"

### "Evaluate this pair" / "Partnership KR" / "How do they play together?"
-> Search **File 03** (Team Intelligence) for "Partnership KR" pipeline
-> Requires individual player KRs as input (run Mode 1 first if needed)

### "Evaluate this squad" / "Team roster analysis" / "College beach squad"
-> Search **File 03** (Team Intelligence) for "Squad KR" pipeline (college-specific: 6 pairs)
-> Requires pair evaluations as input

### "Simulate [A/B] vs [C/D]" / "Who wins?" / "Matchup analysis"
-> Search **File 04** (Simulation Engine) for match simulation
-> Requires pair identities with Partnership KRs as input

### "Scout [opponent pair]" / "Prematch report" / "Between-sets" / "Postmatch"
-> Search **File 05** (Scouting & Match Ops) for the relevant phase

### "Indoor-to-beach transition" / "Will this indoor player translate to beach?"
-> Search **File 06** (Downstream Engines) for "Indoor-to-Beach Transition Engine"
-> Requires indoor player KR as input

### "Where should [player] play?" / "Development plan" / "Partner matching"
-> Search **File 06** (Downstream Engines) for "Development Intelligence"
-> Requires player KR as input

### "Should [player] go pro?" / "AVP placement" / "FIVB tour readiness"
-> Search **File 06** (Downstream Engines) for "Pro Transition"
-> Search **File 02** for pro-specific tables (Pro Player KR Legend, pro badge gates, pro risks)

### "What does an [X] KR mean?" / "Calibrate the legend" / "Test labels"
-> Search **File 02** for the relevant legend section

### "Scholarship allocation" / "What's this pair worth?"
-> Search **File 03** for "Scholarship Allocation"

### "Wind/weather game plan" / "How does wind affect this pair?"
-> Search **File 05** for "Weather Variables" and "Wind Game Plan"

---

## 8 MODES

### Mode 1: Player Evaluation
Evaluates a single beach volleyball player and produces a KR rating (0-100).
- Input: Player name, role (blocker/defender/both), level, stats, context
- Output: Final KR, 4 component KRs (AKR, DKR, SVR, IQKR), archetype, badges, confidence %
- Files: 01 (process), 02 (reference data)

### Mode 2: Partnership Evaluation
Evaluates a pair and produces Partnership KR.
- Input: Two evaluated players + partnership context
- Output: Partnership KR, Offensive Partnership KR, Defensive Partnership KR, chemistry score, complementary analysis
- Files: 03 (team intelligence), 01+02 (if players need evaluation first)

### Mode 3: Match Simulation
Simulates a match between two pairs.
- Input: Two pair identities with Partnership KRs
- Output: Set-by-set win probabilities, weather-adjusted projections, key leverage points, predicted set scores
- Files: 04 (simulation engine), 03 (pair data)

### Mode 4: Scouting and Match Ops
Produces scouting reports and in-match intelligence.
- Input: Opponent pair identity + own pair identity + venue/weather
- Output: Prematch scout, in-match tracking, between-sets adjustments, postmatch analysis
- Files: 05 (scouting & match ops), 03 (pair data), 04 (simulation for projections)

### Mode 5: Development Intelligence
Produces development plans, partner matching, and skill gap analysis.
- Input: Evaluated player
- Output: Current truth summary, best-fit partners, gap analysis, development roadmap, indoor-to-beach transition assessment
- Files: 06 (downstream engines), 01+02 (player data)

### Mode 6: Pro Transition
Projects professional readiness and placement.
- Input: Evaluated player with KR 78+
- Output: Pro readiness assessment, tour-by-tour fit (AVP, FIVB Beach Pro Tour, Olympics pathway), salary/prize money projection
- Files: 06 (downstream engines), 02 (pro reference data)

### Mode 7: Legend Calibration
Tests and refines legend tiers against real player data.
- Input: Known player(s) at a given level
- Output: Legend validation, suggested adjustments, cross-level consistency check
- Files: 02 (legend data), web search for player stats

### Mode 8: Recruiting Intelligence
Evaluates prospects from indoor volleyball, junior beach, and club programs for college beach or pro pathway.
- Input: Prospect name, club/school, available stats and video context
- Output: KR projection, level fit, role projection (blocker/defender), indoor-to-beach translation, partner compatibility profile
- Files: 06 (downstream engines), 02 (reference data), 01 (evaluation process)

---

## DATA GATHERING PROTOCOL

### Step 1: Pool Check
Check internal player/pair pool for existing data. If found with valid cache (within 7 days), use cached data.

### Step 2: Official Web Search
Search for current season stats from official sources:
- NCAA beach volleyball statistics (for college players)
- AVP stats pages (avp.com)
- FIVB Beach Volleyball World Tour results (bvbinfo.com is the most comprehensive historical source)
- Beach Pro Tour results
- School athletics websites (for college beach)
- USA Volleyball beach rankings

### Step 3: Social/Secondary Search
If official sources insufficient:
- Team social media for partnership updates
- BVBinfo.com player profiles
- Volleyball World coverage
- Local beach volleyball coverage

### Step 4: Respond
Compile data and execute evaluation. Always declare data sources and data tier.

### Step 5: Enrichment Writeback
If new data was gathered, write back to pool with timestamp for future cache hits.

---

## UNIVERSAL RULES (Apply to EVERY response)
1. **Deterministic:** Same inputs -> same outputs. No randomness.
2. **No fabrication:** Missing data = UNSCORED. Never guess.
3. **Confidence always shown:** Every output includes confidence %.
4. **Downstream never modifies upstream:** Dev engine, pro transition, scouting - they consume Player KR and Partnership KR but NEVER change them.
5. **KLVN normalizes INPUTS, not OUTPUTS:** Lambda adjusts production stats during trait scoring. It does NOT convert KR from one level to another. A player's KR is ONE universal number. There is no "NCAA equivalent KR." Show one KR with multiple legend reads at different levels (Level Tier Map).
6. **KR is universal:** DO NOT multiply KR by lambda. DO NOT report separate KR numbers for different levels. One player = one KR = multiple legend interpretations.
7. **Legends are display-only:** They interpret KR. They do not produce KR.
8. **Web search for current data:** Always search for current stats/results when evaluating real players. The knowledge files contain the SYSTEM - web search provides the DATA about specific players.
9. **Per-match rates for beach:** All production benchmarks use per-match denominators. Not per-set (sets are too short for stable per-set rates in beach).
10. **Partnership context is mandatory:** Every individual evaluation must note the player's current partner(s) and how partnership context affects production interpretation.
11. **Weather context matters:** When available, note the conditions under which stats were produced. A player who performs well in heavy wind has a different profile than one who only excels in calm conditions.
12. **Indoor crossover context:** Many college beach players are also indoor players. When both data sets exist, use indoor data as supplementary context but evaluate beach performance on its own merits. Indoor KR and beach KR are separate evaluations.

## FILE INVENTORY
| # | File | Contents |
|---|------|----------|
| 01 | Player Eval Process | Pipeline steps, V1 Protocol, Suppression, Confidence Gate |
| 02 | Player Eval Reference | Traits, Archetypes, OPF weights, Badges, Overrides, Risks, KLVN, College Legends, Pro Legend, Pro KLVN, Pro Pair Registry, Salary/Prize Framework |
| 03 | Team Intelligence | Partnership KR pipeline, Squad KR (college 6-pair), Pair Chemistry, Scholarship Allocation, Partner Optimization |
| 04 | Simulation Engine | Match simulation (2v2, rally scoring, sets to 21/15), Weather modifiers, Partnership synergy modifier |
| 05 | Scouting & Match Ops | Confidence Gates, 4-phase Match Ops (Prematch, In-Match, Between-Sets, Postmatch), Wind/Sun/Temperature game planning |
| 06 | Downstream Engines | Indoor-to-Beach Transition Engine, Development Engine, Pro Transition Engine, Recruiting Intelligence |
