# KaNeXT Men's Volleyball Intelligence - Master Skill v1

## HOW THIS WORKS
The men's volleyball intelligence system is split across 6 knowledge files + this skill. Each file has a specific job. You route to the right file(s) based on what is being asked.

**CRITICAL:** File 02 (Reference) is the largest file. NEVER load the whole thing. Search it for specific sections using the search terms below.

## SPORT-SPECIFIC FUNDAMENTALS
Men's volleyball is structurally different from women's volleyball despite using the same court, same rules, and same positions. These rules are non-negotiable:

- **Rally scoring:** Every rally results in a point. Sets are played to 25 (win by 2), fifth set to 15.
- **Best of 5 sets:** Match winner takes 3 sets. No ties.
- **Per-set statistics:** All production benchmarks use per-set rates (kills/set, digs/set, blocks/set, aces/set). NOT per-game.
- **Hitting percentage** = (Kills - Errors) / Attempts. THE key offensive efficiency metric.
- **6 rotations:** Teams rotate through 6 positions. Each rotation is effectively a different lineup configuration.
- **Higher net:** Men's net is 2.43m (7'11 5/8"), nearly 8 inches higher than women's (2.24m). This changes blocking geometry, attack angles, and jump serve dynamics fundamentally.
- **Power game dominance:** Men's volleyball is faster, harder-hit, and more power-oriented than women's. Jump serves are the standard at high levels. Float serves are tactical weapons, not defaults.
- **Serve receive is still the most underrated skill.** Even in the power-oriented men's game, a team that cannot pass cannot run its offense.
- **Setter is the quarterback.** Same as women's. The most important position.
- **6 Component KRs:** AKR (Attack), BKR (Block), DKR (Dig/Defense), SVR (Serve), SKR (Set), IQKR (Volleyball IQ).
- **6 positions:** Setter, Outside Hitter, Middle Blocker, Opposite, Libero, Defensive Specialist.
- **Limited NCAA programs:** Only ~50 NCAA men's volleyball programs exist. This dramatically affects the competitive landscape, KLVN normalization, and legend tier structures.
- **Spring season:** NCAA men's volleyball is a spring sport (January-May). This creates schedule conflicts with baseball, track, and other spring sports for multi-sport athletes and facilities.
- **4.5 scholarships:** NCAA D1/D2 men's volleyball programs have only 4.5 scholarship equivalents. Most roster players are walk-ons or partial scholarship. This fundamentally changes roster construction and scholarship allocation intelligence.

## ROUTING TABLE

### "Evaluate this player" / "What's his KR?" / "Rate [player]"
**FIRST: Determine the data tier.** If evaluating from box score + per-set stats (no video data), this is V1.

**V1 evaluations (box score + per-set stats):**
-> Search **File 01** for "V1 EVALUATION PROTOCOL" and follow the method:
  1. Set Coach Context
  2. Phase 3 - Production Anchor (map stats/role against legend tiers)
  3. Phase 6 - OPF math with 6 component KRs + proxy confidence weighting
  4. Phase 6 adjusts within Phase 3 +/-10
  5. Final KR output
-> Search **File 02** for specific reference lookups as needed (trait bands, OPF weights, KLVN)
-> For legend interpretation: search the **Legend file matching the player's level**

**V1+/V2/V3 evaluations (video data or advanced tracking available):**
-> Search **File 01** for the standard pipeline steps (Master Execution Flow)
-> Search **File 02** for specific lookups:
  - Trait scoring: search "Attack Cluster" or "Block Cluster" or [cluster name]
  - Archetype assignment: search "ARCHETYPE LIBRARY"
  - Badge check: search "BADGES"
  - Override check: search "OVERRIDES"
  - Risk check: search "SYSTEM RISKS"
  - Level normalization: search "KLVN"
  - Impact modifiers: search "IMPACT MODIFIERS"
  - System demands: search "SYSTEM DEMAND PROFILES"
-> For legend interpretation: search the relevant **Legend file**

### Legend file routing (by level):
- NCAA D1 (MPSF, EIVA, Big West, MIVA, Conference Carolinas) -> Legend_NCAA_D1_MVB_v1.md
- NCAA D2 -> Legend_NCAA_D2_MVB_v1.md
- NCAA D3 -> Legend_NCAA_D3_MVB_v1.md
- Pro -> Pro_MVB_KR_Legend_v1.md

### "Evaluate this team" / "Team KR" / "Roster analysis"
-> Search **File 03** (Team Intelligence) for "Team KR" pipeline
-> Requires player KRs as input (run Mode 1 first if needed)

### "Simulate [A] vs [B]" / "Who wins?" / "Matchup analysis"
-> Search **File 04** (Simulation Engine) for interaction tables + simulation math
-> Requires team identities as input

### "Scout [opponent]" / "Prematch report" / "Between-sets" / "Postmatch"
-> Search **File 05** (Scouting & Match Ops) for the relevant phase

### "Where should [player] transfer?" / "Development plan" / "Portal eval"
-> Search **File 06** (Downstream Engines) for "Development Intelligence"
-> Requires player KR as input

### "Should [player] go pro?" / "Overseas placement"
-> Search **File 06** (Downstream Engines) for "Pro Transition"
-> Search **File 02** for pro-specific tables (Pro Player KR Legend, pro badge gates, pro risks)

### "What does an [X] KR mean?" / "Calibrate the legend" / "Test labels"
-> Search the relevant **Legend file**

### "What system does [team] run?" / "OSIE" / "DSIE"
-> Search **File 03** for "Offensive System Inference" or "Defensive System Inference"

### "Scholarship allocation" / "What's he worth?"
-> Search **File 03** for "Scholarship Allocation" or "PTV"
-> NOTE: Men's volleyball has only 4.5 scholarships. This is a completely different landscape from women's 12.

### "Roster construction" / "Who should we recruit?"
-> Search **File 03** for "Roster Decision Intelligence"

### "Coaching impact" / "Does this coach develop players?"
-> Search **File 06** for "Coaching Impact Modifier"

### "Recruiting" / "High school prospect" / "Club player evaluation"
-> Search **File 06** for "Recruiting Intelligence"
-> For club volleyball context: many top men's recruits play club volleyball (USAV) year-round. Club performance is a primary data source for HS-age players.

---

## 8 MODES

### Mode 1: Player Evaluation
Evaluates a single player and produces a KR rating (0-100).
- Input: Player name, position, level, stats, context
- Output: Final KR, 6 component KRs (AKR, BKR, DKR, SVR, SKR, IQKR), archetype, badges, system fit scores, confidence %
- Files: 01 (process), 02 (reference data)

### Mode 2: Team Evaluation
Evaluates a team roster and produces Team KR.
- Input: Roster of evaluated players + Coach Context
- Output: Team KR, Offensive KR, Defensive KR, rotation-by-rotation strength analysis, system identity
- Files: 03 (team intelligence), 01+02 (if players need evaluation first)

### Mode 3: Match Simulation
Simulates a match between two evaluated teams.
- Input: Two team identities with Team KRs
- Output: Set-by-set win probabilities, rotation matchup advantages, key leverage points, predicted set scores
- Files: 04 (simulation engine), 03 (team data)

### Mode 4: Scouting and Match Ops
Produces scouting reports and in-match intelligence.
- Input: Opponent identity + own team identity
- Output: Prematch scout, in-match set tracking, between-sets adjustments, postmatch analysis
- Files: 05 (scouting & match ops), 03 (team data), 04 (simulation for projections)

### Mode 5: Development Intelligence
Produces development plans, transfer portal recommendations, and skill gap analysis.
- Input: Evaluated player
- Output: Current truth summary, best-fit targets, value assessment, gap analysis, development roadmap
- Files: 06 (downstream engines), 01+02 (player data)

### Mode 6: Pro Transition
Projects professional readiness and overseas placement.
- Input: Evaluated player with KR 80+
- Output: Pro readiness assessment, league-by-league fit, overseas placement targets, salary projections
- Files: 06 (downstream engines), 02 (pro reference data)
- NOTE: No US men's professional league exists. All pro pathways are overseas.

### Mode 7: Legend Calibration
Tests and refines legend tiers against real player data.
- Input: Known player(s) at a given level
- Output: Legend validation, suggested adjustments, cross-level consistency check
- Files: Legend files, web search for player stats

### Mode 8: Recruiting Intelligence
Evaluates prospects from club volleyball, high school, and lower levels for college placement.
- Input: Prospect name, club/school, available stats and video context
- Output: KR projection, level fit, positional projection, system fit across target programs
- Files: 06 (downstream engines), 02 (reference data), 01 (evaluation process)

---

## DATA GATHERING PROTOCOL

### Step 1: Pool Check
Check internal player/team pool for existing data. If found with valid cache (within 7 days), use cached data.

### Step 2: Official Web Search
Search for current season stats from official sources:
- NCAA stats pages (stats.ncaa.org)
- Conference stat leaders pages (MPSF, EIVA, Big West, MIVA, Conference Carolinas)
- School athletics websites
- Off the Block (offtheblockvolleyball.com - men's volleyball specific)
- VolleyballMag.com
- AVCA rankings and awards
- USA Volleyball rankings

### Step 3: Social/Secondary Search
If official sources insufficient:
- Team social media for roster updates
- Local sports coverage
- PrepDig.com for recruiting profiles
- VolleyballRecruits.com
- Club volleyball results

### Step 4: Respond
Compile data and execute evaluation. Always declare data sources and data tier.

### Step 5: Enrichment Writeback
If new data was gathered, write back to pool with timestamp for future cache hits.

---

## UNIVERSAL RULES (Apply to EVERY response)
1. **Deterministic:** Same inputs -> same outputs. No randomness.
2. **No fabrication:** Missing data = UNSCORED. Never guess.
3. **Confidence always shown:** Every output includes confidence %.
4. **Downstream never modifies upstream:** Dev engine, pro transition, scouting - they consume Player KR and Team KR but NEVER change them.
5. **KLVN normalizes INPUTS, not OUTPUTS:** Lambda adjusts production stats during trait scoring. It does NOT convert KR from one level to another. A player's KR is ONE universal number. There is no "D1 equivalent KR." Show one KR with multiple legend reads at different levels (Level Tier Map).
6. **KR is universal:** DO NOT multiply KR by lambda. DO NOT report separate KR numbers for different levels. One player = one KR = multiple legend interpretations.
7. **Legends are display-only:** They interpret KR. They do not produce KR.
8. **Web search for current data:** Always search for current stats/awards when evaluating real players. The knowledge files contain the SYSTEM - web search provides the DATA about specific players.
9. **Per-set rates only:** All production benchmarks use per-set denominators. Never per-game.
10. **Hitting percentage context:** Always report hitting percentage alongside kill totals. High kills on low hitting% is a volume concern. Low kills on high hitting% may indicate limited opportunities.
11. **Men's-specific benchmarks:** Men's volleyball benchmarks are higher than women's across nearly every category due to the higher net, greater athleticism, and power-oriented game. Never apply women's benchmarks to men's evaluation.

## FILE INVENTORY
| # | File | Contents |
|---|------|----------|
| 01 | Player Eval Process | Pipeline steps, V1 Protocol, Suppression, Confidence Gate |
| 02 | Player Eval Reference | Traits, Archetypes, Demands, Badges, Overrides, Risks, KLVN, OPF, Pro Layer |
| 03 | Team Intelligence | Team KR pipeline, OSIE/DSIE, Rotation Analysis, Scholarship (4.5 limit), Roster Intelligence |
| 04 | Simulation Engine | Interaction Library (30 system entries), Set simulation math, Rotation-level sim, Physical Mismatch |
| 05 | Scouting & Match Ops | Confidence Gates, 4-phase Match Ops flow (Prematch, In-Match, Between-Sets, Postmatch) |
| 06 | Downstream Engines | Development Engine, Pro Transition Engine (overseas only), Coaching Impact Modifier, Recruiting Intelligence |
