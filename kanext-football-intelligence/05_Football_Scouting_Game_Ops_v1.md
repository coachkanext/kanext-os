# NEXUS FOOTBALL INTELLIGENCE -- FILE 05: SCOUTING & GAME OPS
## v1.0

---

# SCOUTING CONFIDENCE GATES

## Data Tier Reference

| Tier | Definition |
|---|---|
| V1 -- Stats-Only | Public box scores, roster, season stats. No play-type data. |
| V1+ -- Stats + PFF | V1 + PFF grades, play-type data, pressure rates. Not owned. |
| V2 -- Film (1 Season) | Owned film data + full play-type tagging + clip library. |
| V3 -- Film Deep | Multi-season film + full archive + trend analysis. |

## Scout Confidence Gate (Pregame)

| Data Available (Opponent) | Scout Confidence % |
|---|---|
| V1 stats-only: season stats + roster | 50-65% |
| V1 stats-only + multi-year (returning core) | 55-70% |
| V1+ PFF grades + play-type (1 year) | 65-80% |
| V1+ PFF + multi-year | 72-85% |
| V2 film (1 season): 3+ games processed | 78-90% |
| V2 film high coverage: 6+ games processed + stable personnel | 82-92% |
| V3 film deep: multi-season + full archive | 86-96% |

## Scout Confidence Adjusters

- Sample size: fewer than 4 current-season games → bottom of range
- Recency: last 2 games show clear shift (injury, lineup, scheme change) → downshift 5-10 pts
- Roster volatility: significant portal additions mid-season → downshift 5-10 pts
- System ambiguity: OSIE/DSIE still provisional → downshift 5-10 pts
- Prior matchup: played this opponent earlier this season → upshift 5-8 pts
- High stability: locked systems + stable 2-deep → upshift to top of range

## Postgame Confidence Gate

| Data Available | Postgame Confidence % |
|---|---|
| V1 stats-only: final box + team totals | 50-65% |
| V1 + manual staff tags (key plays logged) | 58-72% |
| V1+ PFF: play types + grades + pressures | 68-82% |
| V1+ PFF + multi-game trend context | 72-86% |
| V2 film: owned film + full tag log + clip list | 80-92% |
| V2 film + high completeness: accurate personnel + 15+ teaching clips | 85-94% |
| V3 film deep: multi-season + full archive | 88-97% |

---

# GAME OPS -- 4-PHASE FLOW

## PHASE 1: PREGAME SCOUT PACKET

### Purpose
Deliver a complete opponent scouting report to coaching staff before game week begins. This is the foundation for game planning.

### MUST OUTPUT (every Pregame Scout Packet):

**1.1 Opponent Offensive Tendencies**
- Offensive system identification (from OSIE) with confidence %
- Run/Pass ratio (season, last 3 games, by down and distance)
- Formation frequency breakdown (11 personnel, 12, 10, 21, etc.)
- Play-action rate and efficiency
- RPO frequency and tendencies
- Tempo (plays per minute, hurry-up frequency)
- Red Zone tendencies (run/pass, formation, go-to plays)
- Third-down tendencies by distance (3rd & short: run/pass/play-action split)
- Two-minute offense approach (hurry-up, tempo change, play selection)
- Favorite plays / concepts identified (top-5 called plays by frequency)
- First-play-of-drive tendencies
- Coming-out-of-timeout tendencies

**1.2 Opponent Defensive Tendencies**
- Defensive system identification (from DSIE) with confidence %
- Base vs sub-package usage rates (% of snaps in base, nickel, dime)
- Blitz rate (overall, by down, by situation)
- Coverage shell tendencies (Cover 1, Cover 2, Cover 3, Cover 4, Cover 0)
- Pressure packages (who blitzes, from where, frequency)
- Run-fit tendencies (gap responsibility, overhang player behavior)
- Red Zone defense (coverage tendencies, blitz rate, goal-line alignment)
- Third-down defense tendencies (pressure rate increases, coverage changes)
- Two-minute defense approach

**1.3 Key Matchup Identification**
- Top-3 offensive matchups to exploit (our strength vs their weakness)
- Top-3 defensive matchups to worry about (their strength vs our weakness)
- For each matchup: KR differential, archetype interaction, scheme interaction, recommended approach
- Physical mismatch flags (OL/DL, DB/WR speed, LB/TE coverage)

**1.4 Special Teams Report**
- Kicker range and tendencies (FG% by distance, directional bias)
- Punter tendencies (average, directional, hangtime, inside-20 rate)
- Return threats (return average, TD threat, fair catch rate)
- Kick coverage tendencies (lanes, gunner quality)
- Fake punt/FG tendencies (frequency, situations)

**1.5 Game Plan Recommendations**
- Offensive game plan priorities (top-3 ways to attack their defense)
- Defensive game plan priorities (top-3 ways to stop their offense)
- Special teams plan (return strategy, coverage adjustments)
- Situational priorities: red zone, third down, two-minute, goal-line

**1.6 Confidence & Gaps**
- Scout confidence_pct
- Known gaps in scouting data
- What we don't know and what to watch for early in the game

---

## PHASE 2: IN-GAME LIVE OPS

### Purpose
Real-time tendency tracking and adjustment recommendations during the game.

### MUST TRACK:

**2.1 Offensive Tracking (Our Offense)**
- Run/pass ratio vs game plan (are we executing the plan?)
- Success rate by play type (EPA per play for runs, passes, RPO, play-action)
- First-down production rate
- Explosive play rate (20+ yard plays)
- Turnover-worthy plays (even if not turnovers)
- Red zone efficiency (scoring rate, TD rate)
- OL performance (pressures allowed, run game YPC)
- Personnel grouping success rates

**2.2 Defensive Tracking (Our Defense)**
- Opponent run/pass ratio vs scouting report (are they doing what we expected?)
- Coverage success rate by type (man vs zone performance)
- Pressure rate and sack rate
- Missed tackles (total, by player)
- Explosive plays allowed (20+ yards)
- Third-down defense conversion rate
- Red zone stops

**2.3 Adjustment Triggers**
Flag when:
- Opponent deviates from scouted tendencies by 15%+ (they've adjusted)
- Any position matchup producing 3+ explosive plays
- Run/pass ratio shifts significantly from scouting report
- Opponent blitz rate spikes above 40% (or drops below 15%)
- Our coverage is getting targeted in specific matchup
- Turnover differential reaches +/- 2 (game-changing)

**2.4 Timeout & Challenge Recommendations**
- Timeout optimization: when to save, when to use based on game situation
- Challenge recommendations: flag close calls with success probability estimate

---

## PHASE 3: HALFTIME STAFF PACKET

### Purpose
Structured first-half analysis with specific second-half adjustment recommendations.

### MUST OUTPUT:

**3.1 First-Half Analysis by Unit**

**Offense:**
- Play count and success rate by play type
- Formation grouping efficiency
- QB performance: comp%, YPA, pressured plays, big-time throws vs turnover-worthy plays
- Run game: YPC, explosive runs, contact efficiency
- Passing game: completion rate by route depth, target distribution
- OL performance: pressure rate, run block success
- Red zone: opportunities and conversion rate

**Defense:**
- Opponent play count and success rate by play type
- Coverage performance by type (which coverages are working?)
- Pressure performance (which packages are getting home?)
- Run defense: YPC allowed, gap discipline, missed tackles
- Third-down defense: conversion rate, what concepts are beating us
- Big plays allowed: what caused them?

**Special Teams:**
- Field goal results
- Punt results (net average, coverage)
- Return results (field position impact)

**3.2 What Worked (keep doing)**
- Top-3 successful offensive concepts with evidence
- Top-3 successful defensive approaches with evidence

**3.3 What Did NOT Work (stop or adjust)**
- Bottom-3 offensive concepts with evidence
- Bottom-3 defensive approaches with evidence

**3.4 Second-Half Adjustment Recommendations**
- Offensive adjustments: specific play/formation/personnel changes based on first-half data
- Defensive adjustments: coverage changes, pressure adjustments, alignment shifts
- Specific matchup adjustments (exploit what's working, avoid what isn't)
- Situational adjustments: third-down, red zone, two-minute changes

---

## PHASE 4: POSTGAME STAFF PACKET

### Purpose
Comprehensive performance review for coaching staff. Film and development priorities for the coming week.

### MUST OUTPUT:

**4.1 Performance vs Expectation**
For each player with significant snaps:
- Expected KR contribution vs actual performance (did they play to their KR?)
- Key plays (positive and negative) with timestamp and situation
- Grade relative to game plan assignment (did they execute what was asked?)

**4.2 Opponent Tendencies -- Confirmed or Denied**
- Which scouted tendencies held true
- Which tendencies the opponent changed mid-game
- What we missed in the scouting report
- Updated opponent profile for future reference

**4.3 Unit Performance Summary**
For each unit (offense, defense, special teams):
- Overall grade (1-10)
- Key stats vs expectations
- Strongest performer
- Weakest performer
- Schematic success/failure notes

**4.4 Development Flags**
Players who showed:
- Unexpected positive development (trait improvement visible)
- Regression or concern (trait deterioration)
- Readiness for expanded role
- Need for reduced role

**4.5 Film Priorities**
- Top-10 clips for team film session (teaching moments, positive and negative)
- Position-group-specific film priorities
- Individual player film assignments
- Opponent clips to archive for future matchup

**4.6 Postgame Confidence**
- postgame_confidence_pct
- Data completeness assessment
- Known gaps for future improvement

---

# GOVERNANCE

Game Ops outputs are produced by Nexus from upstream truth (Player KR, Team KR, Scheme interactions). No manual override of computed values. Scouting confidence is computed, not assigned. All outputs include timestamp, data tier, and confidence.
