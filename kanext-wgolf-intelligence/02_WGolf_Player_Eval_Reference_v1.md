# WOMEN'S GOLF PLAYER EVALUATION REFERENCE
## v1.0 - Women's Golf Intelligence

---

# SECTION 1: TRAIT LIBRARY

Traits are organized by the 5 component KR clusters. Each trait has a definition, V1 measurement method, scoring bands (0-100 scale calibrated to WOMEN'S golf), and KLVN normalization notes.

## 1.1 BALL-STRIKING CLUSTER (BKR)

### Trait: Driving Distance
**Definition:** Average distance off the tee on measured driving holes.
**V1 measurement:** Available from Golfstat, school stats, NCAA stats portal.
**KLVN normalization:** Multiply raw by level lambda before scoring.

| Band | Score Range | D1 Power 4 Benchmark |
|------|-----------|---------------------|
| Elite | 90-100 | 265+ yards |
| Above Average | 75-89 | 250-264 yards |
| Average | 55-74 | 235-249 yards |
| Below Average | 35-54 | 220-234 yards |
| Poor | 0-34 | Under 220 yards |

**Women's context:** Average LPGA Tour driving distance is approximately 255 yards. Average D1 women's driving distance is approximately 240-245 yards. These numbers are substantially lower than men's (average PGA Tour ~295 yards, D1 men's ~280 yards). ALL benchmarks here are women's-specific.

### Trait: Driving Accuracy
**Definition:** Percentage of tee shots landing in the fairway on par-4 and par-5 holes.
**V1 measurement:** Available from Golfstat and school stats at most levels.
**KLVN normalization:** Not normalized (percentage is level-independent for accuracy).

| Band | Score Range | Benchmark |
|------|-----------|-----------|
| Elite | 90-100 | 78%+ |
| Above Average | 75-89 | 72-77% |
| Average | 55-74 | 65-71% |
| Below Average | 35-54 | 58-64% |
| Poor | 0-34 | Under 58% |

**Women's context:** Women's driving accuracy percentages are generally higher than men's because shorter driving distances produce straighter ball flights. A 75% fairway hit rate is above average for women but closer to average for men.

### Trait: Greens in Regulation (GIR%)
**Definition:** Percentage of holes where the ball is on the putting surface in regulation (par minus 2 strokes).
**V1 measurement:** Widely available. THE primary ball-striking indicator.
**KLVN normalization:** Multiply raw by level lambda before scoring.

| Band | Score Range | D1 Power 4 Benchmark |
|------|-----------|---------------------|
| Elite | 90-100 | 75%+ |
| Above Average | 75-89 | 68-74% |
| Average | 55-74 | 60-67% |
| Below Average | 35-54 | 52-59% |
| Poor | 0-34 | Under 52% |

**Women's context:** LPGA Tour average GIR is approximately 68-70%. D1 women's average is approximately 62-65%. Elite college women reach 72-78%. Men's PGA Tour average is approximately 65-67% but on much longer and harder course setups.

### Trait: Approach Shot Quality (Proximity to Hole)
**Definition:** Average distance from the hole after approach shots (par-4 and par-5 second shots, par-3 tee shots).
**V1 measurement:** Rarely available at V1 for college players. Available for LPGA/Epson players. Proxy: GIR% combined with birdie rate.
**KLVN normalization:** Not applicable at V1 (proxy-based).

| Band | Score Range | LPGA Benchmark |
|------|-----------|----------------|
| Elite | 90-100 | Under 25 feet avg |
| Above Average | 75-89 | 25-30 feet avg |
| Average | 55-74 | 30-36 feet avg |
| Below Average | 35-54 | 36-42 feet avg |
| Poor | 0-34 | Over 42 feet avg |

### Trait: Iron Consistency
**Definition:** Variance in approach shot quality across a round/tournament. Measures reliability vs flash.
**V1 measurement:** Not directly available. Proxy: Compare GIR% to scoring average. High GIR% with only moderate scoring average suggests inconsistent iron quality (hitting greens but not close). V2+ required for true measurement.

### Trait: Tee-to-Green Strokes Gained
**Definition:** Strokes gained from tee to green relative to the field.
**V1 measurement:** Not available at V1 for most college players. Available for LPGA/Epson players. The gold standard ball-striking metric when available.

| Band | Score Range | LPGA Benchmark |
|------|-----------|----------------|
| Elite | 90-100 | +1.5 or better |
| Above Average | 75-89 | +0.5 to +1.49 |
| Average | 55-74 | -0.5 to +0.49 |
| Below Average | 35-54 | -1.5 to -0.51 |
| Poor | 0-34 | Worse than -1.5 |

---

## 1.2 SHORT GAME CLUSTER (SKR)

### Trait: Scrambling Percentage
**Definition:** Percentage of times a player makes par or better after missing the green in regulation.
**V1 measurement:** Available from Golfstat and most stat services. THE primary short game indicator.
**KLVN normalization:** Multiply raw by level lambda before scoring.

| Band | Score Range | D1 Power 4 Benchmark |
|------|-----------|---------------------|
| Elite | 90-100 | 70%+ |
| Above Average | 75-89 | 62-69% |
| Average | 55-74 | 52-61% |
| Below Average | 35-54 | 42-51% |
| Poor | 0-34 | Under 42% |

**Women's context:** LPGA Tour average scrambling is approximately 63-65%. D1 women's average is approximately 55-58%. Scrambling percentages are slightly lower than men's at comparable levels, partly because approach shots leave harder up-and-down positions.

### Trait: Sand Save Percentage
**Definition:** Percentage of times a player makes par or better from a greenside bunker.
**V1 measurement:** Available at some levels. Not universally tracked at college level.
**KLVN normalization:** Multiply raw by level lambda before scoring.

| Band | Score Range | Benchmark |
|------|-----------|-----------|
| Elite | 90-100 | 60%+ |
| Above Average | 75-89 | 48-59% |
| Average | 55-74 | 36-47% |
| Below Average | 35-54 | 24-35% |
| Poor | 0-34 | Under 24% |

### Trait: Up-and-Down Conversion
**Definition:** Broader than scrambling - includes all short game saves from various lies and distances.
**V1 measurement:** Proxy: Scrambling% is the primary proxy. Golfstat may have more detailed data.

### Trait: Chipping/Pitching Quality
**Definition:** Quality of shots from off the green within 50 yards.
**V1 measurement:** Not available at V1. Proxy: Scrambling% and scoring average vs GIR% gap.

### Trait: Bunker Play
**Definition:** Competence from greenside and fairway bunkers.
**V1 measurement:** Sand save% is the primary proxy. Fairway bunker play is not tracked at V1.

### Trait: Short Game Strokes Gained
**Definition:** Strokes gained from inside 100 yards (excluding putting).
**V1 measurement:** Not available at V1 for college players. Available for LPGA/Epson players.

| Band | Score Range | LPGA Benchmark |
|------|-----------|----------------|
| Elite | 90-100 | +0.8 or better |
| Above Average | 75-89 | +0.3 to +0.79 |
| Average | 55-74 | -0.3 to +0.29 |
| Below Average | 35-54 | -0.8 to -0.31 |
| Poor | 0-34 | Worse than -0.8 |

---

## 1.3 COURSE MANAGEMENT CLUSTER (CKR)

### Trait: Par-3 Scoring Average
**Definition:** Average score on par-3 holes.
**V1 measurement:** Available from Golfstat at most levels.
**KLVN normalization:** Multiply (score minus par) by level lambda before scoring.

| Band | Score Range | D1 Power 4 Benchmark |
|------|-----------|---------------------|
| Elite | 90-100 | Under 3.05 (under +0.05/hole) |
| Above Average | 75-89 | 3.05-3.15 |
| Average | 55-74 | 3.16-3.30 |
| Below Average | 35-54 | 3.31-3.50 |
| Poor | 0-34 | Over 3.50 |

### Trait: Par-4 Scoring Average
**Definition:** Average score on par-4 holes. The backbone of scoring.
**V1 measurement:** Available from Golfstat.

| Band | Score Range | D1 Power 4 Benchmark |
|------|-----------|---------------------|
| Elite | 90-100 | Under 4.05 |
| Above Average | 75-89 | 4.05-4.20 |
| Average | 55-74 | 4.21-4.40 |
| Below Average | 35-54 | 4.41-4.65 |
| Poor | 0-34 | Over 4.65 |

### Trait: Par-5 Scoring Average
**Definition:** Average score on par-5 holes. Measures ability to capitalize on birdie/eagle opportunities.
**V1 measurement:** Available from Golfstat.

| Band | Score Range | D1 Power 4 Benchmark |
|------|-----------|---------------------|
| Elite | 90-100 | Under 4.65 |
| Above Average | 75-89 | 4.65-4.85 |
| Average | 55-74 | 4.86-5.10 |
| Below Average | 35-54 | 5.11-5.35 |
| Poor | 0-34 | Over 5.35 |

**Women's context:** Par-5 scoring is where the distance gap between elite and average women's golfers is most visible. Players with 265+ yards of driving distance can reach par 5s in two; shorter hitters cannot. Par-5 scoring average is a strong proxy for both power and course management.

### Trait: Birdie Rate (Birdies per Round)
**Definition:** Average number of birdies per round played.
**V1 measurement:** Available from Golfstat and most stat services.

| Band | Score Range | D1 Power 4 Benchmark |
|------|-----------|---------------------|
| Elite | 90-100 | 3.5+ birdies/round |
| Above Average | 75-89 | 2.5-3.49 |
| Average | 55-74 | 1.5-2.49 |
| Below Average | 35-54 | 0.8-1.49 |
| Poor | 0-34 | Under 0.8 |

### Trait: Bogey Avoidance
**Definition:** Percentage of holes played without a bogey or worse. Measures trouble avoidance.
**V1 measurement:** Proxy: (Total holes - total bogeys or worse) / Total holes. Available from detailed scorecards.

| Band | Score Range | Benchmark |
|------|-----------|-----------|
| Elite | 90-100 | 82%+ bogey-free holes |
| Above Average | 75-89 | 76-81% |
| Average | 55-74 | 68-75% |
| Below Average | 35-54 | 60-67% |
| Poor | 0-34 | Under 60% |

### Trait: Risk/Reward Decision-Making
**Definition:** Quality of strategic decisions on risk/reward holes (drivable par 4s, reachable par 5s, tucked pins).
**V1 measurement:** Not directly available. Proxy: Par-5 scoring combined with bogey avoidance. A player who scores well on par 5s without excessive bogeys demonstrates good risk/reward decisions. V2+ required for full assessment.

### Trait: Trouble Recovery
**Definition:** Ability to minimize damage when out of position. Turning potential double bogeys into bogeys.
**V1 measurement:** Proxy: Double bogey rate and worse. Low double-bogey rate suggests good recovery.

---

## 1.4 MENTAL CLUSTER (MKR)

### Trait: Pressure Performance
**Definition:** Scoring in high-stakes situations (final round, conference championship, NCAA postseason, sudden death playoffs).
**V1 measurement:** Compare final round scoring average to overall scoring average. Conference championship and NCAA event scoring vs regular season.

| Band | Score Range | Benchmark |
|------|-----------|-----------|
| Elite | 90-100 | Final round avg 1.5+ strokes better than season avg; or wins/top-3 in 50%+ of postseason events |
| Above Average | 75-89 | Final round avg within 0.5 of season avg; consistent postseason performance |
| Average | 55-74 | Final round avg within 1.5 of season avg |
| Below Average | 35-54 | Final round avg 1.5-3.0 strokes worse than season avg |
| Poor | 0-34 | Final round avg 3.0+ strokes worse; clear pattern of postseason underperformance |

### Trait: Bounce-Back Rate
**Definition:** Percentage of times a player follows a bogey (or worse) with a birdie (or better) on the next hole.
**V1 measurement:** Available from Golfstat at some levels. Proxy: Look at scoring patterns in detailed hole-by-hole data when available.

| Band | Score Range | Benchmark |
|------|-----------|-----------|
| Elite | 90-100 | 30%+ bounce-back rate |
| Above Average | 75-89 | 22-29% |
| Average | 55-74 | 15-21% |
| Below Average | 35-54 | 10-14% |
| Poor | 0-34 | Under 10% |

### Trait: Scoring Consistency (Variance)
**Definition:** Standard deviation of round scores. Low variance = consistent performer. High variance = volatile.
**V1 measurement:** Calculate from round-by-round scores when available.

| Band | Score Range | D1 Power 4 Benchmark |
|------|-----------|---------------------|
| Elite | 90-100 | StdDev under 2.5 strokes |
| Above Average | 75-89 | StdDev 2.5-3.2 |
| Average | 55-74 | StdDev 3.3-4.2 |
| Below Average | 35-54 | StdDev 4.3-5.5 |
| Poor | 0-34 | StdDev over 5.5 |

### Trait: Closing Ability
**Definition:** Ability to maintain or improve scoring in the final round of a tournament. The "Sunday" mentality.
**V1 measurement:** Final round scoring average vs rounds 1-2 (or rounds 1-3 in 72-hole events).

### Trait: Competitive Poise
**Definition:** Handling adversity during a round - bad breaks, weather changes, pressure. Not measurable at V1 without film/tracking.
**V1 measurement:** Proxy: Scoring variance and bounce-back rate combined. V2+ required for direct measurement.

---

## 1.5 ATHLETIC/PHYSICAL CLUSTER (AKR)

### Trait: Physical Fitness
**Definition:** Overall physical conditioning. Affects stamina, power, injury resistance, and multi-day tournament performance.
**V1 measurement:** Not directly measurable. Proxy: Driving distance (power), scoring consistency across multi-day events (stamina), injury history.

### Trait: Power/Speed Generation
**Definition:** Ability to generate clubhead speed and distance. The physical engine behind driving distance and approach shot distance.
**V1 measurement:** Primary proxy is driving distance. A player averaging 265+ yards has elite power generation for women's golf.

| Band | Score Range | Benchmark |
|------|-----------|-----------|
| Elite | 90-100 | 265+ yards driving (elite clubhead speed) |
| Above Average | 75-89 | 250-264 yards |
| Average | 55-74 | 235-249 yards |
| Below Average | 35-54 | 220-234 yards |
| Poor | 0-34 | Under 220 yards |

### Trait: Stamina/Endurance
**Definition:** Ability to maintain physical and mental performance over 4-5 hour rounds across multi-day tournaments, often in heat and humidity.
**V1 measurement:** Proxy: Compare scoring in rounds 1 and 3 (or 1 and 4 in 72-hole events). Late-round deterioration suggests stamina issues. Also: scoring average at tournaments played in hot/humid conditions.

### Trait: Flexibility
**Definition:** Range of motion that affects swing mechanics. Important for swing speed, consistency, and injury prevention.
**V1 measurement:** Not measurable at V1. V2+ physical assessment required.

### Trait: Height/Build
**Definition:** Physical frame context. Height correlates with potential swing speed but is not deterministic in golf.
**V1 measurement:** Height available from rosters. Build assessment is visual/V2+.

| Band | Score Range | Women's Benchmark |
|------|-----------|-------------------|
| Elite | 90-100 | 5'10"+ (leverage advantage for distance) |
| Above Average | 75-89 | 5'7"-5'9" |
| Average | 55-74 | 5'4"-5'6" |
| Below Average | 35-54 | 5'1"-5'3" |
| Compact | 0-34 | Under 5'1" (not "poor" - many elite women golfers are 5'2"-5'5") |

**CRITICAL NOTE:** Height is less determinative in golf than in most sports. Many LPGA champions are 5'2"-5'6". The AKR height trait is a minor input, never a ceiling. Se Ri Pak was 5'6". Annika Sorenstam was 5'6". Lydia Ko is 5'5". Height enables but does not define golf excellence.

### Trait: Injury Resilience
**Definition:** History of injuries and ability to return to pre-injury performance.
**V1 measurement:** Known injury history from public sources. Number of missed tournaments due to injury.

---

# SECTION 2: ARCHETYPE LIBRARY

## Purpose
Archetypes describe a player's identity - what she does best and how she wins. Archetypes do NOT change KR. They are descriptive labels that inform development, team fit, recruiting, and pro projection.

## Women's Golf Archetypes (16)

### 1. Complete Player
**Definition:** Elite or above-average in all five component KRs. No significant weaknesses. The total package.
**Gates:** All 5 component KRs >= 78. At least 3 component KRs >= 85.
**Examples profile:** 71.0 scoring avg, 73% GIR, 65% scrambling, 260+ yards driving, strong final round scorer.

### 2. Power Bomber
**Definition:** Distance is the primary weapon. Generates scoring opportunities through raw length, reaching par 5s in two, overpowering short par 4s.
**Gates:** AKR >= 85 (specifically driving distance >= 260 yards). BKR >= 80.
**Examples profile:** 265+ yard driving distance, strong par-5 scoring, may sacrifice accuracy for power.

### 3. Precision Scorer
**Definition:** Wins through accuracy and consistency rather than power. Hits fairways and greens at elite rates. Rarely in trouble.
**Gates:** BKR >= 88 (specifically GIR% >= 73% and driving accuracy >= 75%). Bogey avoidance >= 78%.
**Examples profile:** Moderate driving distance (235-250 yards) but 75%+ fairway accuracy, 73%+ GIR, low bogey rate.

### 4. Short Game Artist
**Definition:** Elite touch around the greens compensates for moderate ball-striking. Saves par from everywhere. Gets up and down from impossible positions.
**Gates:** SKR >= 90. Scrambling >= 68%.
**Examples profile:** Moderate GIR% (62-67%) but elite scrambling. Scoring average better than GIR% alone would predict.

### 5. Ball-Striker
**Definition:** Pure iron player. Hits greens at an elite rate. Tee-to-green game is the foundation. May or may not putt well enough to fully capitalize.
**Gates:** BKR >= 90. GIR% >= 74%.
**Examples profile:** Elite GIR%, strong driving, but scoring average may not fully reflect the ball-striking quality if putting lags.

### 6. Putter/Scorer
**Definition:** Below-the-hole magic. Converts birdies at a high rate. Putting carries the scoring.
**Gates:** Putting average in elite band. Birdie rate >= 3.0/round despite moderate GIR%.
**Examples profile:** Moderate GIR% but elite putting stats. High birdie conversion despite not hitting as many greens.

### 7. Course Grinder
**Definition:** Wins through course management and bogey avoidance rather than birdies. Minimizes mistakes. Grinds out pars. Rarely beats herself.
**Gates:** CKR >= 88. Bogey avoidance >= 80%. MKR >= 80.
**Examples profile:** Low birdie rate but very low bogey rate. Scoring average is good because of consistency, not explosiveness.

### 8. Closer
**Definition:** Best golf comes in final rounds and high-pressure situations. Rises when it matters most.
**Gates:** MKR >= 88. Final round scoring avg at least 1.0 stroke better than overall avg.
**Examples profile:** Multiple tournament wins. Strong record in playoffs. Final round scoring significantly better than early rounds.

### 9. Streaky Talent
**Definition:** Capable of extraordinary stretches but inconsistent. High ceiling, variable floor.
**Gates:** Scoring variance StdDev >= 4.0. At least 2 rounds at -4 or better in the season. At least 2 rounds at +6 or worse.
**Examples profile:** Can shoot 66 on Friday and 78 on Saturday. Tournament wins mixed with missed cuts.

### 10. Rising Talent
**Definition:** Young player (freshman/sophomore) showing rapid improvement trajectory. Current KR may not reflect ceiling.
**Gates:** Class year is freshman or sophomore. Season-over-season scoring improvement >= 2.0 strokes. Current KR >= 75.
**Examples profile:** Freshman averaging 74.5 who averaged 77+ as a high school senior. Clear upward trajectory.

### 11. Steady Contributor
**Definition:** Reliable team scorer who occupies the #3-#5 lineup spot. Consistent but not spectacular.
**Gates:** Scoring average within 2.0 strokes of team's #1 player. No component KR below 60. No component KR above 85.
**Examples profile:** 74.0-76.0 scoring average on a ranked team. Dependable round-to-round.

### 12. Distance Disadvantaged Specialist
**Definition:** Short hitter who compensates with elite short game, course management, and mental toughness.
**Gates:** Driving distance below 235 yards. SKR >= 85. CKR >= 85.
**Examples profile:** 225-yard driving distance but 66%+ scrambling, elite putting, strong course management.

### 13. Birdie Machine
**Definition:** Aggressive scorer who makes lots of birdies but also makes bogeys. High risk, high reward.
**Gates:** Birdie rate >= 3.5/round. Bogey rate also elevated (70% or fewer bogey-free holes).
**Examples profile:** Lots of red numbers on the card but also some big numbers. Exciting to watch but inconsistent.

### 14. Wind Player
**Definition:** Performs significantly better in windy/adverse conditions than in benign conditions. Thrives when the course plays hard.
**Gates:** Scoring average in windy events at least 1.5 strokes better vs field than in calm events vs field.
**Examples profile:** Grew up playing links-style or coastal golf. Low ball flight. Excellent course management in wind.

### 15. Match Play Specialist
**Definition:** Significantly better in match play format than stroke play. Head-to-head competitor.
**Gates:** Match play record of .667+ in competitive matches. NCAA match play performer.
**Examples profile:** Aggressive pin-seeker in match play. Goes for birdies when opponents are in trouble. Strong closing mentality.

### 16. International Pedigree
**Definition:** Player with significant international amateur or junior experience. Often South Korean, Japanese, Australian, or European player with strong global amateur resume.
**Gates:** WAGR ranking in top 200 or national team experience. International amateur wins.
**Examples profile:** South Korean junior champion entering US college golf. Strong WAGR ranking. Adjusting to US conditions.

---

# SECTION 3: BADGES

## Purpose
Badges recognize extreme trait excellence. A badge means a player is elite at a specific thing, independent of overall KR. Badges provide small KR lifts.

## Badge Tiers
- **Bronze:** Component KR >= 88 AND specific trait gate met. KR lift: +0.5
- **Silver:** Component KR >= 92 AND specific trait gate met. KR lift: +1.0
- **Gold:** Component KR >= 96 AND specific trait gate met. KR lift: +1.5
- **Total badge lift cap:** +3.5 KR

## Badge List (Women's Golf)

| Badge Name | Cluster | Gate (Bronze) | Description |
|-----------|---------|---------------|-------------|
| Fairway Finder | BKR | Driving accuracy >= 78% | Elite accuracy off the tee |
| Bomber | BKR | Driving distance >= 265 yards | Elite power |
| Iron Maiden | BKR | GIR% >= 75% | Elite approach play |
| Tee-to-Green Machine | BKR | GIR% >= 75% AND Driving Accuracy >= 75% | Complete ball-striker |
| Scramble Queen | SKR | Scrambling >= 70% | Elite short game saves |
| Sand Saver | SKR | Sand save >= 60% | Elite bunker player |
| Touch Artist | SKR | Scrambling >= 65% AND sand save >= 55% | Complete short game |
| Birdie Sniper | CKR | Birdies/round >= 3.5 | Elite scoring rate |
| Bogey Dodger | CKR | Bogey-free holes >= 82% | Elite trouble avoidance |
| Par-5 Eagle | CKR | Par-5 avg under 4.65 | Elite par-5 scoring |
| Risk Calculator | CKR | Par-5 avg under 4.70 AND bogey avoidance >= 80% | Smart aggressive play |
| Ice Veins | MKR | Final round avg 1.5+ strokes better than season | Elite closer |
| Comeback Kid | MKR | Bounce-back rate >= 30% | Elite recovery mentality |
| Metronome | MKR | Scoring variance StdDev under 2.5 | Elite consistency |
| Champion Pedigree | MKR | 3+ tournament wins in current season | Proven winner |
| Power Athlete | AKR | Driving distance >= 270 yards | Elite physical power |
| Endurance | AKR | No late-round scoring deterioration across 10+ events | Elite stamina |
| All-Weather | MKR | Strong performance in adverse conditions (wind, rain, cold) | Conditions-proof |
| Clutch Putter | SKR | Putting avg in elite band AND 50%+ make rate from 6-10 feet | Clutch on the greens |
| Conference Killer | MKR | Conference championship top-3 finish | Performs at conference peak |
| NCAA Performer | MKR | NCAA Regional/Championship top-20 finish | Performs on biggest stage |
| Low Round Specialist | CKR | Season low round of 65 or better | Capable of explosive scoring |
| Dawn Patrol | MKR | Consistently strong first-round scoring (top 25% of field in round 1) | Fast starter |
| Sunday Closer | MKR | Final round scoring avg at least 2.0 better than field avg | Elite final round |
| Travel Warrior | AKR | Consistent scoring across 5+ different course setups | Adapts to any venue |

---

# SECTION 4: OVERRIDES

## College Positive Overrides (max 1 applies)

| Override | Condition | KR Lift |
|---------|-----------|---------|
| Generational Talent | WAGR top 10 + NCAA individual title contender + multiple major amateur titles | +5.0 |
| All-American Confirmation | First Team All-American + scoring avg in top 10 nationally + team in top 25 | +3.0 |
| Conference Dominant | Conference POY + lowest scoring avg in conference by 1.5+ strokes | +2.0 |
| NCAA Championship Performer | Top 10 at NCAA Championship (individual) | +2.0 |
| Breakout Season | Scoring average improvement of 3.0+ strokes from prior season | +1.5 |
| Transfer Surge | Post-transfer scoring improvement of 2.0+ strokes in first season at new school | +1.0 |
| International Amateur Elite | WAGR top 50 entering college | +1.5 |
| Clutch Tournament Winner | 3+ tournament wins including at least 1 against a ranked field | +0.75 |

## College Negative Overrides (always apply)

| Override | Condition | KR Reduction |
|---------|-----------|-------------|
| Weak Schedule Inflation | 60%+ of tournaments against unranked fields with no ranked opponents | -2.0 |
| Scoring Average Mirage | Scoring avg elite but GIR% and scrambling both below average (inflated by easy courses) | -1.5 |
| Single-Event Dependency | Remove best tournament and scoring avg increases by 1.5+ strokes | -1.0 |

## Pro Positive Overrides (max 1, each +1.0)

| Override | Condition |
|---------|-----------|
| Major Championship Contender | Top 10 in an LPGA major championship |
| Motherhood Return | Returned to pre-pregnancy production level within 18 months of childbirth |
| Tour Winner | Won an LPGA Tour event in current or prior season |
| International Dominance | Won a major event on LET, KLPGA, or JLPGA |

## Pro Negative Overrides (always apply)

| Override | Condition | KR Reduction |
|---------|-----------|-------------|
| Conditional Status | Playing on conditional LPGA status (limited starts) | -1.5 |
| Monday Qualifying Dependency | 50%+ of starts are Monday qualifiers | -2.0 |
| Career Earnings Floor | Less than $100K in career LPGA earnings after 2+ seasons | -1.0 |
| Missed Cut Pattern | Missed cut rate above 40% in current season | -1.5 |

---

# SECTION 5: SYSTEM RISKS

Golf does not have offensive/defensive "systems" like team ball sports, but it does have program-level and player-level risk factors that affect evaluation.

## Player-Level Risks

| Risk | Description | Detection | Impact |
|------|------------|-----------|--------|
| Distance Ceiling | Player at maximum physical distance with no room for improvement | Driving distance plateau over 2+ seasons below 235 yards | KR ceiling capped; development projection limited |
| Putting Yips | Sudden severe putting deterioration, often stress-related | Season-over-season putting avg increase of 0.5+ strokes with no technical explanation | Flag for mental game assessment; SKR reduction |
| Injury Prone | Pattern of recurring injuries (back, wrist, shoulder) | 2+ seasons with missed tournaments due to same injury type | AKR reduction; reliability flag |
| Swing Overhaul | Major swing change in progress. Short-term performance may decline before improving | Known coaching change or swing mechanic overhaul | Confidence reduction; note in-progress change |
| Format Liability | Strong in stroke play but poor in match play (or vice versa) | Match play record below .400 in competitive matches | Flag for NCAA Championship format (requires both) |

## Team-Level Risks

| Risk | Description | Detection | Impact |
|------|------------|-----------|--------|
| Lineup Fragility | Team depends on 1-2 elite players; drop-off to #3-#5 is steep | Scoring gap of 4+ strokes between #2 and #3 in lineup | Team KR downshift 2-3 points |
| Depth Void | No viable 6th player to substitute without major scoring loss | 6th player scoring avg 5+ strokes worse than 5th | Fragility flag; injury to any starter is catastrophic |
| Home Course Dependency | Team performs significantly better at home than on the road | Home tournament scoring avg 3+ strokes better than away | Team KR adjusted for neutral-site performance |
| Senior Dependency | 60%+ of team scoring comes from seniors | Class year analysis of top 5 lineup | Sustainability flag; next-year projection reduced |
| Scholarship Inefficiency | Scholarship dollars spent on players outside the top 5 lineup | Scholarship allocation analysis | Resource flag; recruiting recommendation |

---

# SECTION 6: IMPACT MODIFIERS

Impact modifiers describe how a player's value manifests at the team level. One modifier per player.

**Primary Lineup Driver:** The #1 player. Team scoring and identity flows through her. Counted-score rate near 100%. Team KR is most sensitive to her performance.
- Gate: Lowest scoring avg on team by >= 1.5 strokes OR highest individual KR on team by >= 5 points

**Secondary Lineup Driver:** The #2 player. Consistently in the counted four scores. Critical for team depth.
- Gate: Second-lowest scoring avg on team. Counted-score rate >= 85%.

**Force Multiplier:** A player whose presence makes the team better than the sum of individual KRs. Usually the vocal leader, practice intensity setter, or team culture driver.
- Gate: Team performance measurably better when she is in the lineup vs when she is not. Requires coach input or V2+ data.

**Specialist Anchor:** One component KR >= 90 AND at least one other component KR <= 70. Extreme specialist whose value is concentrated in one area.

**Unclassified:** Does not meet any of the above thresholds OR rounds played < 12 (Low Sample).

---

# SECTION 7: COMPONENT KR WEIGHTING (OPF)

## Women's Golf OPF

Golf is an individual sport with no positional variance. All players use the same OPF weights.

| Component | Weight | Rationale |
|-----------|--------|-----------|
| BKR (Ball-Striking) | 35% | Tee-to-green play is the foundation. GIR% is the single most predictive stat for scoring. |
| SKR (Short Game) | 25% | Separates good players from elite. The difference between 65% and 55% scrambling is 2-3 strokes per round. |
| CKR (Course Management) | 20% | More important in women's golf than men's because the power gap is smaller. Strategy and decision-making gain relative weight when raw distance is less decisive. |
| MKR (Mental) | 12% | Golf is uniquely mental. Individual sport, no substitutions, 4-5 hours of sustained focus. Pressure performance separates tournament contenders from field fillers. |
| AKR (Athletic/Physical) | 8% | Physical tools enable performance but do not define it. Many LPGA champions are not the most athletic. Distance is captured in BKR; AKR measures the physical attributes that generate distance. |

## Governance
OPF weights are locked. Any change requires documentation, versioning, and approval.

---

# SECTION 8: COLLEGE KLVN LAMBDAS

Reference is in the separate College_WGolf_KLVN_Lambdas_v1.md file. Summary here for quick lookup:

| Rank | Level Key | Lambda |
|------|-----------|--------|
| 1 | ncaa_d1_power4 | 1.000 |
| 2 | ncaa_d1_mid_major | 0.945 |
| 3 | ncaa_d1_low_major | 0.895 |
| 4 | ncaa_d2 | 0.840 |
| 5 | naia | 0.780 |
| 6 | njcaa_d1 | 0.720 |
| 7 | ncaa_d3 | 0.680 |
| 8 | njcaa_d2_d3 | 0.640 |

Full details, conference mappings, and governance notes are in the KLVN file.

---

# SECTION 9: COLLEGE KR LEGENDS

College KR Legends are in separate files per level. Summary structure here - each legend file contains tier labels and production benchmarks for that level.

**Legend files:**
- Legend_NCAA_D1_WGolf_v1.md (includes Power 4, Mid-Major, Low-Major tiers)
- Legend_NCAA_D2_WGolf_v1.md
- Legend_NCAA_D3_WGolf_v1.md
- Legend_NAIA_WGolf_v1.md
- Legend_NJCAA_WGolf_v1.md

---

# SECTION 10: PRO KLVN LAMBDAS

Reference is in the separate Pro_WGolf_KLVN_Lambdas_v1.md file. Summary:

| Rank | Tour | Lambda |
|------|------|--------|
| 1 | LPGA Tour | 1.000 |
| 2 | KLPGA | 0.920 |
| 3 | JLPGA | 0.900 |
| 4 | Ladies European Tour (LET) | 0.880 |
| 5 | Epson Tour | 0.830 |
| 6 | Women's All Pro Tour | 0.700 |
| 7 | Other Regional/Mini-Tours | 0.600 |

---

# SECTION 11: PRO PLAYER KR LEGEND

Reference is in the separate Pro_WGolf_KR_Legend_v1.md file. Summary tier labels:

| KR Range | LPGA Tier |
|---------|-----------|
| 98-100 | All-Time Great / Hall of Fame |
| 95-97 | Superstar / Multiple Major Winner |
| 92-94 | Tour Elite / Major Contender |
| 89-91 | Consistent Tour Winner |
| 86-88 | Tour Established / Regular Top-20 |
| 83-85 | Tour Player / Keeps Card Comfortably |
| 80-82 | Tour Fringe / Bubble Player |
| 77-79 | Epson Tour Star / LPGA Q-Series Contender |
| 74-76 | Epson Tour Solid |
| 71-73 | Developmental Tour / Mini-Tour |
| Below 71 | Below Professional Threshold |

---

# SECTION 12: PRO SALARY FRAMEWORK

Reference is in the Pro_WGolf_KR_Legend_v1.md file alongside the legend. Summary:

| KR Range | Expected Annual Earnings (LPGA) | Tour Context |
|---------|-------------------------------|--------------|
| 98-100 | $5M-$12M+ | Top 5 on money list. Major titles. Endorsement bonanza. |
| 95-97 | $2.5M-$5M | Top 20 on money list. Multiple wins. Strong endorsements. |
| 92-94 | $1.2M-$2.5M | Top 40. Consistent money earner. Solheim Cup contender. |
| 89-91 | $600K-$1.2M | Top 60. Multiple top-10s per season. |
| 86-88 | $300K-$600K | Top 80. Keeps full LPGA card comfortably. |
| 83-85 | $150K-$300K | Fringe top 100. Card retention range. |
| 80-82 | $75K-$150K | Bubble. May lose LPGA card. Epson Tour backup. |
| 77-79 | $40K-$80K | Epson Tour top earner or LPGA conditional. |
| 74-76 | $20K-$40K | Epson Tour mid-level. |
| Below 74 | Under $20K | Developmental/mini-tour. Supplemental income needed. |

**Women's earnings context:** LPGA Tour total purse is approximately $100M+ in 2026, growing rapidly but still a fraction of PGA Tour ($500M+). The earnings gap is narrowing but remains significant. KLPGA purses have grown substantially. JLPGA total purse is the highest of any women's tour outside the LPGA. LET purses are growing with joint-sanctioned events.

**No LIV Golf equivalent:** As of 2026, there is no rival league offering guaranteed contracts or inflated purses to women's golfers. All women's professional golf operates on a traditional purse/prize money model.

---

# SECTION 13: PRO TEAM REGISTRY

Women's golf is an individual sport at the professional level. There are no "teams" per se, but the following structures are relevant:

**Solheim Cup (biennial):** Team Europe vs Team USA. 12 players per side. Selection by rankings, points, and captain's picks. Solheim Cup selection is a significant career milestone and evaluation signal.

**International Crown:** Country-based team event (when held). 4 players per country.

**Equipment/Sponsor Affiliations:** Professional golfers have equipment deals, apparel deals, and management groups. These are not "teams" but they do affect career trajectory, practice resources, and schedule flexibility.

For team intelligence purposes (File 03), "team" refers to college programs.
