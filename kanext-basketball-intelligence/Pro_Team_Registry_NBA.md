# PRO TEAM REGISTRY -- NBA (2025-26) v2

## Purpose
Maps every NBA team's offensive/defensive system, roster context, and team window. Enables system fit % and draft-range-appropriate evaluation for any prospect against any NBA team.

## v2 Changes:
- Added team window context (how window affects what they draft for)
- Updated Hawks post-Trae Young trade (Kuminga, Hield acquired)
- Added draft priority column (peak vs median vs fit)
- Connected to Draft-Range Output Priority from SKILL.md Mode 6

## System Taxonomy (from File 02)
**Offense (12):** Spread Pick-and-Roll, 5-Out Motion, Read & React, Pace & Space, Dribble Drive, Princeton, Flex, Swing, Inside-Out, Moreyball, Heliocentric, Coach K
**Defense (10):** Containment Man, Pack Line, Pressure Man, Switch, No-Middle, Zone, Matchup Zone, Full-Court Press, Junk, Coach K

## HOW TEAM WINDOW AFFECTS DRAFT PRIORITY

| Window | Draft Position | What They Draft For |
|--------|---------------|-------------------|
| Rebuilding | Lottery (#1-5) | PEAK CEILING. Best player available. Fit/overlap secondary -- roster will change around this pick. |
| Rising | Mid-lottery (#6-14) | 3-YEAR PROJECTION + FIT. Have a young star, need complementary pieces. |
| Contending | Late first (#15-30) | MEDIAN OUTCOME + FIT. Need contributors now. High floor, system-ready. |
| Retooling | Varies | Depends on pick position. If lottery, lean peak. If late, lean fit. |

---

## EASTERN CONFERENCE

### Atlantic Division

| Team | HC | Offense | Defense | Window | Draft Priority |
|------|-----|---------|---------|--------|---------------|
| Boston Celtics | Joe Mazzulla | 5-Out Motion | Switch | Contending | Median + fit |
| New York Knicks | Tom Thibodeau | Spread PnR | Containment Man | Contending | Median + fit |
| Philadelphia 76ers | Nick Nurse | Spread PnR / Motion | Switch | Retooling | Depends on slot |
| Brooklyn Nets | Jordi Fernandez | Pace & Space | Containment Man | Rebuilding | Peak ceiling |
| Toronto Raptors | Darko Rajakovic | Pace & Space / Read & React | Switch | Rebuilding | Peak ceiling |

### Southeast Division

| Team | HC | Offense | Defense | Window | Draft Priority |
|------|-----|---------|---------|--------|---------------|
| Miami Heat | Erik Spoelstra | 5-Out Motion / Spread PnR | Switch / Zone | Contending | Median + fit |
| Orlando Magic | Jamahl Mosley | Pace & Space | Containment Man / Pack Line | Rising | 3-Year + fit |
| Atlanta Hawks | Quin Snyder | Spread PnR | Containment Man | Rising | 3-Year + fit. Building around Jalen Johnson (All-Star). Need franchise PG after Trae Young trade. Core: Johnson/Daniels/Risacher/Kuminga/Okongwu. |
| Charlotte Hornets | Charles Lee | Pace & Space | Switch | Rebuilding | Peak ceiling |
| Washington Wizards | Brian Keefe | Pace & Space | Containment Man | Rebuilding | Peak ceiling |

### Central Division

| Team | HC | Offense | Defense | Window | Draft Priority |
|------|-----|---------|---------|--------|---------------|
| Cleveland Cavaliers | Kenny Atkinson | 5-Out Motion | Pack Line / Switch | Contending | Median + fit |
| Milwaukee Bucks | Doc Rivers | Heliocentric | Containment Man | Contending | Median + fit |
| Indiana Pacers | Rick Carlisle | Pace & Space | Containment Man | Rebuilding (Haliburton Achilles) | Peak ceiling. 15-55 record. Haliburton returning. Need two-way wing to pair with Haliburton/Siakam. Core: Haliburton/Nembhard/Nesmith/Siakam/Zubac. |
| Chicago Bulls | Billy Donovan | Spread PnR | Switch | Rebuilding | Peak ceiling |
| Detroit Pistons | JB Bickerstaff | Pace & Space | Containment Man | Rebuilding | Peak ceiling |

---

## WESTERN CONFERENCE

### Northwest Division

| Team | HC | Offense | Defense | Window | Draft Priority |
|------|-----|---------|---------|--------|---------------|
| Oklahoma City Thunder | Mark Daigneault | Pace & Space / Motion | Switch | Contending | Median + fit |
| Denver Nuggets | Michael Malone | Heliocentric | Containment Man | Contending | Median + fit |
| Minnesota Timberwolves | Chris Finch | Spread PnR | Containment Man | Contending | Median + fit |
| Utah Jazz | Will Hardy | Pace & Space | Switch | Rebuilding | Peak ceiling |
| Portland Trail Blazers | Chauncey Billups | Pace & Space | Containment Man | Rebuilding | Peak ceiling |

### Pacific Division

| Team | HC | Offense | Defense | Window | Draft Priority |
|------|-----|---------|---------|--------|---------------|
| Golden State Warriors | Steve Kerr | 5-Out Motion | Switch | Retooling | Depends on slot |
| LA Lakers | JJ Redick | Spread PnR / Motion | Containment Man | Contending | Median + fit |
| LA Clippers | Ty Lue | Spread PnR | Switch | Retooling | Depends on slot |
| Phoenix Suns | Mike Budenholzer | Spread PnR | Pack Line | Contending | Median + fit |
| Sacramento Kings | Doug Christie | Pace & Space / Dribble Drive | Containment Man | Rising | 3-Year + fit |

### Southwest Division

| Team | HC | Offense | Defense | Window | Draft Priority |
|------|-----|---------|---------|--------|---------------|
| San Antonio Spurs | Gregg Popovich | Inside-Out / Motion | Containment Man | Rising | 3-Year + fit |
| Dallas Mavericks | Jason Kidd | Heliocentric / Spread PnR | Switch | Contending | Median + fit |
| Houston Rockets | Ime Udoka | Pace & Space | Switch / Pressure Man | Rising | 3-Year + fit |
| Memphis Grizzlies | Taylor Jenkins | Pace & Space | Containment Man | Rebuilding | Peak ceiling |
| New Orleans Pelicans | Willie Green | Spread PnR | Switch | Retooling | Depends on slot |

---

## HOW TO USE FOR DRAFT / SYSTEM FIT

1. Identify the prospect's archetype from Mode 1 eval
2. Look up the drafting team's offensive and defensive system + window + draft priority
3. If team drafts for PEAK -- rank prospects by Peak Ceiling KR, de-emphasize fit
4. If team drafts for 3-YEAR -- rank by 3-Year Projection, weight system fit 30-40%
5. If team drafts for MEDIAN -- rank by Median Outcome, weight system fit 50%+
6. Run archetype-vs-system interaction from File 04 for fit %
7. Factor roster overlap (does this player's position conflict with existing core?)

---

## GOVERNANCE

- System identification is v0 -- based on public coaching analysis
- Updates needed annually (coaching changes, scheme evolution, trades)
- HC names and cap situations verified against 2025-26 season
- Team window assessments are directional and change with trades/injuries
- Expand to EuroLeague, NBL, and other leagues as pro intelligence grows
