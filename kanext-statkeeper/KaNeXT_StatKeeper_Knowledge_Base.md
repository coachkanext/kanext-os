# KaNeXT StatKeeper - Complete Knowledge Base

## Version 1.0 - March 2026

This document is the comprehensive reference for StatKeeper, the live game stat tracking system inside the KaNeXT OS. Nexus references this document to answer any question about how StatKeeper works from coaches, staff, fans, investors, or anyone interacting with the system.

---

# PART 1: WHAT IS STATKEEPER

---

## 1. Overview

StatKeeper is a real-time game stat tracking tool that lives inside the KaNeXT OS Sports Mode. It allows coaches, team managers, or designated stat keepers to track every play during a live game from a phone or tablet. The data entered during the game flows through the KaNeXT OS to produce live fan feeds, coaching reports, box scores, media recaps, and social media graphics automatically.

StatKeeper is not a standalone app. It is a native component of the KaNeXT OS, accessible through Hub > Game Day in Sports Mode. Every stat logged in StatKeeper immediately becomes available to Nexus, the intelligence system, the Social tile, KayTV, and every other part of the platform.

StatKeeper supports 10 sports: Basketball, Football, Soccer (men's and women's), Volleyball (indoor and beach), Baseball, Softball, Track and Field / Cross Country, Flag Football, and Cheer. The core interface is identical across all team sports. Only the stat buttons change per sport.

---

## 2. Core Design

### Three-Panel Landscape Layout

All team sports (basketball, football, soccer, volleyball, baseball) use a three-panel landscape layout designed for speed during a live game.

Left panel: Primary play entry. The main scoring or play type buttons. In basketball this is Make/Miss shot buttons. In football this is play type (pass/rush/TD). In soccer this is shot type (goal/on target/off target). The left panel answers "what happened."

Center panel: Live scoreboard and play-by-play feed. Shows the current score, period/quarter/half/inning, and a scrolling feed of every logged event. The center panel is the game's running record.

Right panel: Secondary stats. Non-scoring events like rebounds, assists, steals, fouls, substitutions, timeouts. The right panel answers "what else happened on that play."

The flow is: tap stat type > tap player > logged. Two taps. No screen transitions. No loading. Speed is everything because the game does not stop.

### Exceptions

Track and Field uses a single-panel portrait layout because it is results entry (times, distances, heights) not play-by-play tracking.

Cheer uses a single-panel portrait layout because it is score/deduction tracking for performances, not live game plays.

Beach Volleyball uses the same three-panel layout as indoor volleyball but with 2-player lineups instead of 6.

---

## 3. Game Lifecycle

Every StatKeeper game follows the same lifecycle regardless of sport.

### Setup Phase

Before the game starts, the coach configures:

- Opponent: selected from the schedule or created manually with team name
- Home/Away designation
- Period structure: halves, quarters, innings, or sets depending on sport
- Starting lineup: selected from the Roster tile
- Opponent roster: optionally enter opponent player names and numbers for full tracking, or leave as "Team" for quick team-level tracking

### Live Phase

The game is in progress. The coach tracks plays in real time using the three-panel interface. Events are logged instantly and appear in the play-by-play feed. The scoreboard updates with every scoring play. Substitutions update the lineup indicator automatically.

During the live phase, connected outputs are active:
- The live fan feed updates in real time for anyone following the team
- Score Blast push notifications can be sent to followers at any time
- Running stats are available to Nexus for real-time queries

### Period Transitions

When the coach advances to the next period (halftime, end of quarter, between innings, between sets), the system:
- Logs the period transition in the play-by-play
- Updates the period scoreboard
- At halftime (or designated mid-game point), triggers the auto-generated halftime staff packet

### End of Game

When the coach ends the game (marks it as final), the system:
- Finalizes all stats
- Auto-generates the postgame box score
- Auto-posts the box score to the team's Social feed (if enabled in settings)
- Auto-generates the postgame media recap via Nexus (coach can review before posting)
- Auto-generates social media graphics (final score, player of the game, stat summary)
- Archives the complete game record in Hub > Game Day

---

# PART 2: SPORT-SPECIFIC CONFIGURATIONS

---

## 4. Basketball

Period structure: Halves or Quarters (configurable)
Lineup size: 5 players on court
Stat categories tracked:

Scoring: 3pt made, 3pt missed, 2pt made, 2pt missed, 1pt made (free throw), 1pt missed (free throw)
Rebounds: Defensive rebound, Offensive rebound
Assists
Steals
Blocks
Turnovers
Fouls: Personal foul (auto-tracks team foul count per half)
Substitutions
Timeouts: Per team, tracked by half

Derived stats auto-calculated:
- FG% (field goal percentage)
- 3P% (three-point percentage)
- FT% (free throw percentage)
- Total rebounds
- Points per player
- Team totals for all categories
- Plus/minus per player (points scored vs allowed while on court)

---

## 5. Football

Period structure: 4 Quarters
Lineup size: 11 players (with offense/defense toggle)
Stat categories tracked:

Offense: Pass complete (with yards), Pass incomplete, Rush (with yards), Touchdown (pass/rush/return), Field goal made/missed, PAT made/missed, 2PT conversion made/missed
Defense: Tackle, Sack (with yards lost), Interception, Pass breakup, Forced fumble, Fumble recovery
Special: Punt (with yards), Kick return (with yards), Punt return (with yards)
Penalties: Type (from preset list: holding, offsides, pass interference, false start, delay of game, illegal formation, roughing the passer, facemask, unsportsmanlike conduct, other), team, yards
General: Substitution, Timeout, Safety

Additional tracking:
- Down and distance (auto-updates with each play)
- Field position
- Drive tracking (auto-generates drive summaries: plays, yards, time of possession, result)
- Turnover margin
- Penalty yardage per team
- Yards input required on pass completions, rushes, sacks, kicks, returns

---

## 6. Soccer (Men's and Women's)

Period structure: 2 Halves (45 minutes each, plus stoppage time). Extra time periods available.
Lineup size: 11 players
Stat categories tracked:

Shots: Goal, Shot on target (saved), Shot off target (wide/over), Shot blocked, Penalty goal, Penalty miss
Defensive: Foul committed, Yellow card, Red card, Offside
Goalkeeper: Save
Passing: Assist (can be linked to goal event), Cross (successful/unsuccessful)
General: Corner kick (per team), Substitution, Timeout (where applicable)

Additional tracking:
- Card accumulation per player (second yellow auto-converts to red)
- Substitution counter (tracks used vs allowed per competition rules, configurable 3-5)
- Stoppage time notation
- Match clock (running timer, manual or auto)

Derived stats:
- Shots on target percentage
- Save percentage (goalkeeper)
- Possession estimate (based on event frequency)

---

## 7. Volleyball (Indoor Women's)

Period structure: Best of 3 or Best of 5 sets. Sets to 25 (15 for deciding set), win by 2.
Lineup size: 6 players in rotation order
Stat categories tracked:

Scoring: Kill (select attacker), Ace (select server), Block (select blocker(s)), Opponent error
Errors: Attack error (select attacker), Serve error (select server), General error
Defense: Dig (select player), Block assist
Setting: Set assist (select setter)
Reception: Pass with rating (1/2/3 scale, select passer)
Serving: Serve type (float/jump/jump float) if detailed tracking enabled
General: Substitution, Timeout (per team)

Additional tracking:
- Rotation tracking: auto-rotates lineup when team wins a sideout (opponent was serving, your team scores)
- Substitution counter per set (NCAA limits apply)
- Set scores history (completed sets displayed as line: 25-21, 18-25, 25-23)
- Serving indicator: shows which team is serving
- Scoring run tracker: flags runs of 3+ consecutive points

Derived stats:
- Hitting percentage: (kills - errors) / total attacks
- Assist percentage
- Aces per set
- Digs per set
- Blocks per set

---

## 8. Beach Volleyball

Same as indoor volleyball with modifications:
- Lineup size: 2 players
- No rotation tracking
- No substitutions
- Best of 3 sets (21-21-15 scoring, win by 2)
- Side switch tracking: every 7 points in sets 1-2, every 5 in set 3
- Simplified stat categories (no rotation, no sub tracking)

---

## 9. Baseball and Softball

Period structure: 9 innings (baseball) or 7 innings (softball/doubleheaders). Top and bottom halves.
Lineup size: 9 players in batting order (10 with DH if applicable)
Stat categories tracked:

Pitching: Ball, Strike, Foul, In play (pitch-by-pitch tracking builds the count)
At-bat results (positive): Single, Double, Triple, Home run, Walk, HBP, Sac fly, Sac bunt
At-bat results (negative): Strikeout, Groundout, Flyout, Lineout, Pop out, Double play, Fielder's choice
Baserunning: Stolen base, Caught stealing
Defense: Error (select fielder), Putout
Pitching events: Wild pitch, Passed ball, Balk
Roster: Pitching change, Pinch hitter, Pinch runner, Defensive substitution

Additional tracking:
- Pitch count per pitcher (running total and per-inning)
- Batting order enforcement: auto-advances through lineup
- Baserunner state: visual diamond showing occupied bases, updates with every play
- Inning-by-inning line score (1-2-3-4-5-6-7-8-9 R-H-E) always visible
- Pitcher stat line displayed on pitching change (IP, H, R, ER, BB, K, pitch count)
- RBI auto-calculated from play context (runners scoring on hits, sac flies, etc.)

Derived stats:
- Batting average
- On-base percentage
- Slugging percentage
- ERA (earned run average) for pitchers
- WHIP (walks + hits per inning pitched)
- Strikeout rate
- Team batting average, OBP, SLG

Softball differences:
- 7 innings default
- Underhand pitching (cosmetic label difference)
- Smaller field dimensions noted in settings

---

## 10. Track and Field / Cross Country

Period structure: Meet format (no periods, just events)
Layout: Single-panel portrait (NOT three-panel landscape)

This is fundamentally different from team sports. There is no play-by-play. The coach enters results per athlete per event.

Event categories:
- Sprints: 100m, 200m, 400m
- Middle distance: 800m, 1500m
- Distance: 3000m, 5000m, 10000m
- Hurdles: 110mH (100mH women's), 400mH
- Relays: 4x100m, 4x400m
- Jumps: Long jump, Triple jump, High jump, Pole vault
- Throws: Shot put, Discus, Javelin, Hammer throw
- Cross country: variable distance (3K, 5K, 6K, 8K, 10K)
- Multi-events: Decathlon, Heptathlon (individual event results feed composite score)

For each event, the coach enters:
- Time (running events): manual entry or start/stop timer
- Distance (throws): in meters or feet (configurable)
- Height (jumps): in meters or feet
- Attempt number (field events allow multiple attempts)
- Place/finish order

Results auto-sort by performance (fastest time, longest distance, highest height).

Additional tracking:
- Personal record flags (system compares to athlete's previous best)
- Season best tracking
- Team point scoring (configurable point system: 10-8-6-5-4-3-2-1 or custom)

---

## 11. Flag Football

Simplified football:
- Lineup size: 5-7 players (configurable)
- No down/distance tracking (optional, rules vary by league)
- Flag pull replaces tackle
- No field goal, PAT, or kicking game (rules vary)
- Shorter field (configurable)
- Otherwise uses the same three-panel layout with reduced button set

Stat categories:
- Pass complete/incomplete (with yards)
- Rush (with yards)
- Touchdown (pass/rush/interception return)
- Interception
- Flag pull (replaces tackle)
- Sack
- Penalty (simplified list)
- Substitution

---

## 12. Cheer

Period structure: Performance-based (Round 1, Round 2, Finals)
Layout: Single-panel portrait (NOT three-panel landscape)

Cheer is scored performance, not play-by-play. StatKeeper for cheer is a score and deduction tracker.

For each routine:
- Score entry per judge (multiple judge scores)
- Deduction tracking: falls, boundary violations, time violations (each with point value)
- Running total with deductions applied
- Comparison view: other teams' scores if entered

---

# PART 3: CONNECTED OUTPUTS

---

## 13. Live Fan Feed

When a game is live in StatKeeper, any user following the team can see a real-time play-by-play feed inside the KaNeXT app. This is the ESPN Gamecast equivalent for every sport at every level.

Accessible from: Social tile (game card appears at top during live games), KayTV tile (if no video broadcast available, the live feed is the fallback), and via push notification when a game starts.

Content displayed to fans:
- Live score (updates with every scoring play)
- Period/quarter/half/inning/set indicator
- Play-by-play feed (read-only version of the coach's center panel)
- Team stats summary (sport-appropriate: FG% for basketball, TOP for football, shots for soccer)
- Individual stat leaders (top scorer, top rebounder, etc.)

The feed updates via websocket. No manual refresh needed. Score Blast push notifications arrive here when the coach sends them.

Portrait orientation. Fans are on their phones.

---

## 14. Auto-Generated Halftime Staff Packet

Triggered automatically when the coach advances to the next period at the mid-game point (halftime in basketball/soccer/football, between set 2 and 3 in volleyball, after 5th inning in baseball).

Nexus reads the game stats and generates a structured coaching report. Content varies by sport but always includes:

- Score and key team stat splits
- Individual player stat lines sorted by playing time
- Performance flags (hot/cold players relative to season averages)
- Foul/card trouble alerts
- Turnover/error analysis
- Sport-specific insights (rebound differential in basketball, possession stats in soccer, pitch count alerts in baseball, hitting percentage by rotation in volleyball)
- Suggested focus areas for the second half (generated by Nexus)

Delivered via push notification to all staff accounts. Opens as a formatted view inside Hub > Game Day. Also exportable as PDF.

Designed to be read in 90 seconds during a timeout or halftime break.

---

## 15. Auto-Generated Postgame Box Score

Triggered when the coach marks the game as final.

Content:
- Final score with period-by-period breakdown
- Full individual stat lines for both teams (if opponent players were tracked individually)
- Team totals
- Game leaders (sport-appropriate categories)
- Notable achievements flagged (double-doubles, career highs, program records)

Auto-posts to the team's Social feed as a formatted card. Available permanently in Hub > Game Day. Shareable as image or link. Designed to look clean when screenshotted for social media.

---

## 16. Auto-Generated Postgame Media Recap

After the box score, Nexus generates a written game recap in ESPN-style narrative format.

Content:
- 2-3 paragraph narrative recap
- Key players highlighted with stat lines woven into prose
- Turning points identified from play-by-play data
- Final score and record update
- Upcoming schedule note

The coach reviews and approves before posting (configurable to auto-post). Available as copyable text for external media distribution.

---

## 17. Auto-Generated Social Media Graphics

After the game, the system generates shareable graphics in three formats:
- Instagram square (1080x1080)
- Twitter/X landscape (1200x675)
- Instagram Story vertical (1080x1920)

Three graphic types:
- Final score graphic (both team identifiers, final score, date, venue)
- Player of the game graphic (photo if available, stat line, game result)
- Team stat summary graphic (key stats in visual layout)

Carbon background, Paper text, KaNeXT watermark. Premium aesthetic.

---

# PART 4: TECHNICAL DETAILS

---

## 18. Data Storage

Every event logged in StatKeeper is stored as a structured record:

- Game ID
- Event type (make, miss, rebound, foul, etc.)
- Player ID (or "team" for team events)
- Team (home/away)
- Period/quarter/half/inning/set
- Timestamp (game clock time and real time)
- Additional data (yards for football, pitch type for baseball, etc.)
- Sequence number (for ordering and undo)

Events are stored locally on device during the game and synced to the KaNeXT backend in real time (for the live fan feed). If connectivity is lost, events queue locally and sync when connection restores. No data is lost.

---

## 19. Undo System

The undo button removes the most recent event. Multiple undos walk backward through the event log. Undo is immediate and updates:
- The play-by-play feed (event removed)
- The scoreboard (if the event was a scoring play)
- Player stats (recalculated)
- The live fan feed (event removed for fans too)

---

## 20. Permissions

StatKeeper access is governed by RBAC inside the KaNeXT OS.

- Head Coach, Assistant Coach, Team Manager: can create games, track stats, send Score Blasts, approve/post recaps
- Player: can view live fan feed and postgame stats (cannot track stats)
- Parent/Guardian: can view live fan feed and postgame stats
- Fan/Follower: can view live fan feed and postgame stats
- Booster: can view live fan feed and postgame stats
- Recruit: can view postgame stats (useful for evaluating programs during recruitment)

---

## 21. Settings

Accessible from the info (i) icon during a game or from Hub > Game Day settings.

- Game clock: manual (coach advances periods) or auto (running clock)
- Period structure: sport-specific default, overridable
- Score Blast: on/off, recipient selection (all followers, staff only, custom list)
- Auto-post box score: on/off
- Auto-post recap: on/off (with coach approval toggle)
- Stat categories: default set per sport, expandable for custom categories
- Opponent roster: full entry (names/numbers) or quick mode (team-level tracking only)
- Units: metric or imperial (for track and field distances)
- Softball mode: toggle for baseball (switches to 7 innings, labels adjust)

---

## 22. StatKeeper as Revenue

StatKeeper is a standalone subscription product for programs not on the KaNeXT OS.

For KaNeXT mandate schools and network schools: StatKeeper is included free with the platform.

For non-KaNeXT programs: $500 to $2,000 per year depending on sport count and features.

For youth and recreational leagues: $99 to $299 per year per team.

Revenue projections are detailed in the Revenue Model: Intelligence document.

---

## 23. Integration with Intelligence System

Every stat logged in StatKeeper feeds the KaNeXT intelligence system.

For basketball: game stats flow into the Player Evaluation Engine. Season averages update KR calculations. Game performance feeds the Development Intelligence Engine for longitudinal tracking. Team stats feed the Team Intelligence Engine for system identification (OSIE/DSIE).

For all sports: game data feeds the simulation engine, improving outcome projections with every game played. The more games tracked across the platform, the more accurate the intelligence becomes for every program.

This is the data flywheel. StatKeeper generates data. Data feeds intelligence. Intelligence makes the platform more valuable. More programs adopt the platform. More games are tracked. More data feeds intelligence. The cycle compounds.

---

## Glossary

**Score Blast**: A push notification sent to followers with the current score and optional message.

**Halftime Staff Packet**: An auto-generated coaching report produced at the mid-game point.

**Box Score**: The complete statistical record of a game, showing every player's individual stats and team totals.

**Media Recap**: A narrative game summary written by Nexus in ESPN-style prose.

**Live Fan Feed**: A real-time play-by-play view accessible to anyone following the team.

**Three-Panel Layout**: The landscape stat entry interface with left (scoring), center (scoreboard/feed), and right (secondary stats) panels.

**Lineup Indicator**: The row of small jersey number pills showing who is currently on the court/field.

**Period Transition**: When the coach advances from one game period to the next, triggering mid-game reports.

**RBAC**: Role-Based Access Control. Determines who can see and do what inside StatKeeper based on their role in the institution.
