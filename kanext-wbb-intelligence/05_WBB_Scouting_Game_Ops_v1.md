# WBB SCOUTING & GAME OPS
## v1.0 - Women's Basketball Intelligence

---

# SCOUTING CONFIDENCE GATES

## Purpose
Confidence% communicates evidence completeness + reliability for scouting (pregame) and postgame analysis. Computed at the end of the respective packet. Does not change any scouting content or KR values - it qualifies reliability only.

## Data Tier Reference
| Tier | Definition |
|------|-----------|
| V1 - Stats-Only | Public box scores, roster minutes, season stats. No play-type data. |
| V1+ - Stats + Licensed Granular | V1 + third-party play-type data (Synergy for women's basketball). Actual usage, shot profiles, possession-level efficiency. |
| V2 - PlayVision (1 Season) | KaNeXT-owned camera data. Full play-type, usage, matchup tracking, spatial data. |
| V3 - PlayVision Deep (Multi-Season) | Multiple seasons of PlayVision data + film archive. Highest fidelity. |

### Women's Basketball Data Availability Note
Women's basketball has less granular data coverage than men's at most levels:
- Her Hoop Stats provides the best publicly available advanced metrics for women's basketball
- Synergy coverage is expanding but less comprehensive than men's, particularly below D1 HM
- PlayVision/KaNeXT-owned data is the long-term goal for full coverage
- Conference-level streaming (ESPN+, FloSports, etc.) provides film access but not tagged play-type data
- Confidence ranges should account for the data gap at lower levels

## Scout Confidence Gate (Pregame)

| Data Available (Opponent) | Scout Confidence % |
|--------------------------|-------------------|
| V1 stats-only: official/team season stats + roster | 50-65% |
| V1 stats-only + multi-year (returning core / stable identity) | 55-70% |
| V1+ licensed granular: play-type data + shot profile (1 year) + stats | 65-80% |
| V1+ licensed granular + multi-year | 73-85% |
| V2 PlayVision (1 season): processed games >= 5 + stats | 75-88% |
| V2 PlayVision high coverage: >= 10 games processed + stable rotation | 80-92% |
| V3 PlayVision Deep: multi-season + film archive + stable identity | 85-95% |

Note: Women's basketball pregame confidence ranges are 5 points lower than men's at V1 and V1+ tiers due to less comprehensive public data availability.

## Scout Confidence Adjusters (apply within the chosen range)
- Sample size: fewer than 5 current-season games -> use bottom of range
- Recency: last 3 games show clear shift -> downshift 5-10 pts
- Roster volatility: rotation not stable / unknown minutes -> downshift 5-10 pts
- System ambiguity: OSIE/DSIE still provisional or unlocked -> downshift 5-10 pts
- Multi-game continuity: prior game against same opponent exists -> upshift 3-5 pts
- High stability: locked systems + stable top-7 rotation -> upshift toward top of range
- Coaching change mid-season -> downshift 10-15 pts (system identity uncertain)

## Postgame Confidence Gate

| Data Available (Postgame) | Postgame Confidence % |
|--------------------------|---------------------|
| V1 stats-only: final box + team totals + basic splits | 50-65% |
| V1 stats-only + manual staff tags (timeouts / key actions) | 55-70% |
| V1+ licensed granular: play types + shot profile + efficiencies | 65-80% |
| V1+ licensed granular + multi-game trend context | 70-85% |
| V2 PlayVision: owned film processed + full tag log + clip list | 78-90% |
| V2 PlayVision + high completeness: accurate stints/lineups + >= 10 teaching clips | 85-94% |
| V3 PlayVision Deep: multi-season context + full film archive + trend analysis | 88-96% |

## Postgame Confidence Adjusters
- Tag completeness low -> downshift 5-10 pts
- Lineup/stint accuracy weak -> downshift 5-10 pts
- Opponent identity ambiguity -> downshift 5-10 pts
- Stable rotation + clear identity + high film coverage -> upshift toward top
- Multi-game trend context available -> upshift 3-5 pts

---

# GAME OPS - 4-PHASE FLOW

## Purpose
Game Ops is the real-time intelligence engine for game preparation, in-game decisions, halftime adjustments, and postgame analysis. It consumes upstream truth (Player KR, Team KR, system identity, scouting data) and produces actionable game-day intelligence.

## Phase 1: PREGAME SCOUT PACKET

### Trigger
Request to prepare for an upcoming game against a specific opponent.

### MUST OUTPUT:
1. **Opponent Identity Summary**
   - Team KR with tier label
   - Team_Off_KR and Team_Def_KR
   - Offensive system (from OSIE or known)
   - Defensive system (from DSIE or known)
   - System Fit%
   - Head coach and system tendencies

2. **Opponent Rotation Profiles**
   - Top 7-8 rotation players with:
     - Player KR (if evaluated) or estimated range
     - Position, archetype
     - Key offensive tendencies (PPG, shooting splits, creation style)
     - Key defensive assignments and tendencies
     - Strengths to avoid / Weaknesses to attack
   - Minutes distribution

3. **Matchup Analysis**
   - Position-by-position matchup KR differentials
   - Key individual matchups to win
   - Physical mismatch advantages/disadvantages
   - Run the simulation (File 04) for the matchup

4. **Game Plan Recommendations**
   - Offensive keys (what to run, who to get shots for, where the defensive gaps are)
   - Defensive keys (who to take away, what system adjustments to make)
   - Rebounding plan
   - Transition attack/defense plan
   - Press/press break plan (critical in women's basketball at many levels)
   - Zone attack plan (if opponent runs zone - common in women's basketball)

5. **Scout Confidence**
   - scout_confidence_pct with justification

### Women's-Specific Pregame Items:
- **Zone Defense Preparation:** If the opponent runs zone defense (common), include zone attack principles and identify which players should be in which zone offense positions
- **Post Play Emphasis:** If either team has a dominant post player, include the post-play plan (feeds, double-team triggers, help rotations)
- **Press/Press Break:** Include full-court press break plan if the opponent uses full-court pressure. This is more common in women's basketball, especially at lower levels
- **Free Throw Shooting Context:** If the opponent has poor FT shooters, identify who to foul in late-game situations (more impactful in lower-scoring women's games)

## Phase 2: IN-GAME LIVE OPS

### Trigger
Game is in progress. Coach or staff requests in-game intelligence.

### MUST OUTPUT (on request):
1. **Live Matchup Assessment**
   - Which matchups are working/not working
   - Which opponent players are exceeding/underperforming their KR
   - Suggested rotation adjustments

2. **System Adjustment Recommendations**
   - If the current offensive system is being neutralized, suggest secondary system or adjustment
   - If the current defensive system has a vulnerability being exploited, suggest counter

3. **Foul Situation Analysis**
   - Which players are in foul trouble
   - Impact on rotation if key player fouls out
   - Replacement matchup analysis

4. **Timeout Intelligence**
   - Suggested play/set for after timeout
   - Defensive adjustment for after timeout
   - Momentum analysis

## Phase 3: HALFTIME STAFF PACKET

### Trigger
Halftime of any game.

### MUST OUTPUT:
1. **First Half Summary**
   - Actual first-half stats vs pregame projection
   - Which pregame matchup predictions were correct/incorrect
   - Opponent adjustments observed

2. **Halftime Adjustments**
   - Top 3 offensive adjustments (ranked by projected impact)
   - Top 3 defensive adjustments (ranked by projected impact)
   - Rotation changes recommended
   - Matchup changes recommended

3. **Second Half Keys**
   - What to sustain (what's working)
   - What to change (what's not working)
   - Projected second-half outcome if adjustments are made vs if they're not

4. **Player-Specific Notes**
   - Which players need more/fewer minutes
   - Which players need different defensive assignments
   - Foul management plan for second half

## Phase 4: POSTGAME STAFF PACKET

### Trigger
Game has concluded. Coach or staff requests postgame analysis.

### MUST OUTPUT:
1. **Game Result Summary**
   - Final score, margin, key scoring runs
   - Team KR performance vs expected (did the team play to its KR?)
   - System performance (did the offensive/defensive systems work as projected?)

2. **Player Performance Analysis**
   - Each rotation player: actual stats vs KR-projected performance
   - BPR estimates for each player (if sufficient data)
   - Who overperformed and why
   - Who underperformed and why

3. **Matchup Analysis (Actual)**
   - Which matchup predictions from pregame were correct
   - Which individual matchups drove the outcome
   - Physical mismatch impact assessment

4. **System Intelligence Update**
   - Does this game suggest any revision to our system identity?
   - Does this game reveal anything about the opponent's system that updates the OSIE/DSIE?
   - Trend identification across multiple games

5. **Development Notes**
   - Which players showed growth or regression
   - Trait-level observations that should inform practice planning
   - Player-specific development priorities coming out of this game

6. **Postgame Confidence**
   - postgame_confidence_pct with justification

### Women's-Specific Postgame Items:
- **Zone Offense Assessment:** How effective was the team's zone offense? Did shooters relocate? Did the high-post player create?
- **Post Play Assessment:** Detailed analysis of post play (post entry success rate, post-to-perimeter passing, rebounding from post position)
- **Press Break Assessment:** How many turnovers were caused by full-court pressure? Did the press break personnel work?
- **Free Throw Impact:** In a low-scoring women's game, free throw shooting can be the margin. Detailed FT analysis.

---

# GOVERNANCE

All scouting and game ops outputs reference upstream truth only. Game Ops never modifies Player KR, Team KR, archetypes, system identity, or any upstream output. It reads governed truth and produces game-day recommendations.

Confidence gates are applied to every output. Lower confidence = more caveats and wider ranges in recommendations.

Women's basketball data availability limitations must be disclosed honestly. If scouting data is V1-only (stats-only), the pregame packet should be explicit about what it does not know and where uncertainty is highest.
