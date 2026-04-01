# WOMEN'S GOLF TEAM INTELLIGENCE
## v1.0 - Women's Golf Intelligence

---

# TEAM KR PIPELINE

## Purpose
Team KR measures a women's golf program's overall competitive strength. Unlike team ball sports where 5-15 players interact on the field, golf team scoring is the aggregate of individual performances. The team's best 4 of 5 individual scores per round count toward the team total.

## Team KR Formula

**Team KR = Lineup KR (65%) + Depth KR (15%) + Program Strength (10%) + Coaching Impact (10%)**

### Lineup KR (65% of Team KR)
The weighted average of the top 5 lineup players' individual KRs.

| Lineup Spot | Weight | Rationale |
|-------------|--------|-----------|
| #1 (lowest scoring avg) | 28% | The anchor. Her score almost always counts. Most important individual. |
| #2 | 24% | Second anchor. Score counts 95%+ of the time. |
| #3 | 20% | Reliable contributor. Score counts 85%+ of the time. |
| #4 | 16% | Fourth scorer. Score counts 70-80% of the time. |
| #5 | 12% | Fifth player. Score is dropped most often but must not be a liability. |

**Lineup KR = (P1_KR x 0.28) + (P2_KR x 0.24) + (P3_KR x 0.20) + (P4_KR x 0.16) + (P5_KR x 0.12)**

### Depth KR (15% of Team KR)
Measures the quality of players 6-10 (or however many are on the roster beyond the top 5).

**Depth KR = Average KR of players 6-8 (or all non-lineup players if fewer than 8 total)**

A team with a strong 6th player who can substitute without significant scoring loss has higher depth KR than a team with a steep drop-off after 5.

| Depth Quality | Depth KR Score |
|--------------|---------------|
| Elite depth | 6th player within 2 strokes of 5th | 85-95 |
| Good depth | 6th player within 4 strokes | 70-84 |
| Average depth | 6th player within 6 strokes | 55-69 |
| Weak depth | 6th player 6+ strokes worse | 35-54 |
| No depth | Only 5 players on roster | 20-34 |

### Program Strength (10% of Team KR)
Measures program-level factors beyond current roster quality.

**Inputs:**
- National ranking (Golfstat or coaches poll)
- Conference strength
- NCAA Championship history (appearances, finishes)
- Recruiting ranking/pipeline
- Facility quality (practice facility, home course)
- Budget and resources

| Program Tier | Score |
|-------------|-------|
| Perennial top 10 national program | 90-100 |
| Regular NCAA qualifier, top 25 | 75-89 |
| Conference contender, occasional NCAA | 60-74 |
| Mid-conference, regional competitor | 45-59 |
| Below average for level | 25-44 |

### Coaching Impact (10% of Team KR)
Measures the coaching staff's contribution to player development, recruiting, and program trajectory.

**Inputs:**
- Average player KR improvement per year under this coaching staff
- Recruiting trajectory (improving, stable, declining)
- Player retention rate (transfers out vs in)
- Championship contention track record
- Development of players from recruitment KR to graduation KR

| Coaching Tier | Score |
|--------------|-------|
| Elite developer + recruiter + championship history | 90-100 |
| Strong in 2 of 3 areas | 75-89 |
| Competent across the board | 60-74 |
| Developing or inconsistent | 45-59 |
| Below expectations for program resources | 25-44 |

---

# TEAM KR EXECUTION STEPS

1. Evaluate all rostered players individually (Mode 1 pipeline) or pull cached KRs
2. Rank by scoring average to determine lineup order (1-5) and depth (6+)
3. Calculate Lineup KR using weighted formula
4. Calculate Depth KR
5. Assess Program Strength
6. Assess Coaching Impact
7. Combine: Team KR = (Lineup KR x 0.65) + (Depth KR x 0.15) + (Program Strength x 0.10) + (Coaching Impact x 0.10)
8. Apply Team-Level Risk adjustments (from Section 5 of File 02)
9. Output Team KR with component breakdown

---

# LINEUP CONSTRUCTION ENGINE

## Purpose
Determines the optimal 5-player lineup for a given tournament based on player KRs, course fit, current form, and strategic considerations.

## Lineup Construction Steps

1. **Rank eligible players by KR** (baseline lineup)
2. **Apply course fit adjustments:**
   - Long course (6,300+ yards): Prioritize players with high BKR (driving distance)
   - Short/tight course (under 6,000 yards): Prioritize accuracy and short game (SKR, CKR)
   - Links-style/windy: Prioritize MKR and wind play capability
   - Firm and fast: Prioritize course management (CKR)
3. **Apply form adjustments:**
   - Last 3 tournaments scoring trend (hot hand / cold streak)
   - Injury or illness status
   - Academic/personal distractions (coach input)
4. **Apply strategic considerations:**
   - Match play format: Prioritize MKR, match play record
   - Team needs: If team needs aggressive scoring, weight birdie rate; if team needs consistency, weight bogey avoidance
   - Opponent context: In match play, consider matchup dynamics
5. **Output final 5-player lineup** with rationale for each selection and any deviations from pure KR ranking

## Lineup Alternates
Always identify the top 2 alternates (6th and 7th players) with:
- Their individual KR
- The scoring impact of substituting them into each lineup spot
- Course-specific fit notes

---

# TEAM KR LEGENDS (ALL LEVELS)

## NCAA D1 Power 4 Team KR Legend

| Team KR | Tier | Description |
|---------|------|-------------|
| 95-100 | National Championship Contender | Top 5 nationally. Multiple All-Americans. NCAA Championship favorite. Program like Stanford, USC, Arizona. |
| 91-94 | NCAA Championship Qualifier (Top Seed) | Top 15 nationally. Strong lineup 1-5. Consistent NCAA qualifier. |
| 87-90 | NCAA Regional Qualifier | Top 30 nationally. Conference championship contender. Competitive at regional level. |
| 83-86 | Conference Contender | Competitive within conference. Occasional NCAA Regional appearance. |
| 79-82 | Mid-Conference | Solid program but not consistently challenging for conference title or NCAA berth. |
| 75-78 | Below Conference Average | Developing program or rebuilding year. Individual standouts possible. |
| Below 75 | Bottom of Conference | Significant talent and depth gaps. |

## NCAA D1 Mid-Major Team KR Legend

| Team KR | Tier | Description |
|---------|------|-------------|
| 91-100 | Conference Dominant / NCAA Contender | Best in conference by wide margin. NCAA Regional qualifier. Capable of advancing. |
| 86-90 | Conference Championship Contender | Top 3 in conference. NCAA Regional possible. |
| 81-85 | Upper Conference | Top half of conference. Competitive in most invitationals. |
| 76-80 | Mid-Conference | Average for level. Competitive within conference. |
| Below 76 | Below Conference Average | Developing or rebuilding. |

## NCAA D1 Low-Major Team KR Legend

| Team KR | Tier | Description |
|---------|------|-------------|
| 88-100 | Conference Dominant | Clear best team in conference. NCAA auto-bid likely. |
| 83-87 | Conference Championship Contender | Top 3 in conference. Competing for the auto-bid. |
| 78-82 | Solid Conference Competitor | Competitive but not favored for conference title. |
| 73-77 | Mid-to-Lower Conference | Development-focused. Individual bright spots. |
| Below 73 | Rebuilding | Significant gaps across the lineup. |

## NCAA D2 Team KR Legend

| Team KR | Tier | Description |
|---------|------|-------------|
| 87-100 | National Championship Contender | Top 10 D2 nationally. Multiple All-Region players. |
| 82-86 | Regional Contender | Top 25 D2. Conference champion caliber. |
| 77-81 | Conference Competitor | Competitive within conference. |
| Below 77 | Developing | Building roster depth. |

## NCAA D3 Team KR Legend

| Team KR | Tier | Description |
|---------|------|-------------|
| 85-100 | National Championship Contender | Top programs in D3. |
| 80-84 | Regional Contender | Strong within region. |
| 75-79 | Conference Competitor | Competitive at conference level. |
| Below 75 | Developing | Building program. |

## NAIA Team KR Legend

| Team KR | Tier | Description |
|---------|------|-------------|
| 86-100 | National Championship Contender | Top NAIA programs. |
| 81-85 | National Qualifier | Competitive at national tournament. |
| 76-80 | Conference Contender | Strong within conference. |
| Below 76 | Developing | Building toward conference competitiveness. |

## NJCAA Team KR Legend

| Team KR | Tier | Description |
|---------|------|-------------|
| 84-100 | National Championship Contender | Top NJCAA programs. |
| 79-83 | National Qualifier | Competitive at NJCAA national tournament. |
| 74-78 | Regional Competitor | Strong within region/conference. |
| Below 74 | Developing | Building roster. |

---

# SCHOLARSHIP ALLOCATION ENGINE

## Purpose
Optimizes the allocation of 6 equivalency scholarships (NCAA D1 women's golf) across the roster to maximize Team KR and long-term program competitiveness.

## Scholarship Budget: 6 Equivalency (NCAA D1 Women's Golf)

**Key context:** Women's golf gets 6 scholarships compared to men's 4.5. This is a significant advantage. With a typical roster of 8-10 players, most roster members can receive meaningful scholarship support. This makes women's golf recruiting more competitive and gives programs more flexibility.

## Allocation Framework

### Priority Tiers for Scholarship Distribution

**Tier 1 - Lineup Core (Players 1-3):** Allocate 55-65% of total scholarship budget
- These players carry the team. Their counted-score rate is highest. Losing any of them is catastrophic.
- Full or near-full scholarship for the top 1-2 players
- Minimum 0.75 scholarship for player 3

**Tier 2 - Lineup Support (Players 4-5):** Allocate 20-30% of total scholarship budget
- Critical for team scoring but lower counted-score rate
- Partial scholarships (0.5-0.75 each)

**Tier 3 - Depth/Development (Players 6+):** Allocate 10-20% of total scholarship budget
- Future lineup players. Walk-ons with promise. Transfer candidates.
- Small partial scholarships (0.25-0.5) or no athletic aid

### Allocation Decision Factors

1. **Player KR:** Higher KR = more scholarship priority
2. **Class year:** Invest in underclassmen over seniors (longer return on investment)
3. **Trajectory:** Players on upward KR trajectory get priority over plateaued players
4. **Replacement cost:** How hard is this player's production to replace through recruiting?
5. **Academic aid offset:** Players with academic scholarships need less athletic aid
6. **International player needs:** International students typically have fewer academic aid options, requiring more athletic scholarship
7. **NIL offset:** Players with NIL income may accept reduced scholarship (rare in women's golf but growing)

### Post-House v. NCAA Settlement Notes
The House settlement may adjust roster caps and scholarship structures. As of 2025-26:
- D1 women's golf: 6 equivalency scholarships, no formal roster cap
- Roster sizes typically 8-12 players
- Walk-on spots remain available at most programs
- Revenue sharing may eventually affect scholarship structure

---

# ROSTER DECISION INTELLIGENCE

## Transfer Portal Analysis

### When to Enter the Portal (Player Perspective)
Nexus evaluates whether a player should consider transferring based on:
- **Development gap:** Is the coaching staff developing her toward her KR ceiling?
- **Playing time:** Is she in the top 5 lineup? If not, why?
- **Program fit:** Does the program's level match her competitive ceiling?
- **Academic fit:** Does the school offer her desired academic program?
- **Scholarship situation:** Is she receiving appropriate scholarship support for her KR level?

### When to Recruit from the Portal (Program Perspective)
Nexus identifies portal targets based on:
- **Team KR gaps:** Where is the lineup weakest?
- **Component KR needs:** Does the team need a bomber, a short game specialist, a closer?
- **Scholarship availability:** How much scholarship can be offered?
- **Timeline:** Does the team need immediate impact or can it develop?
- **Fit:** Does the player's archetype complement existing lineup members?

### Portal Evaluation Protocol
1. Identify the team's KR gap (what component KR improvement would most raise Team KR?)
2. Search the portal for players matching the gap profile
3. Evaluate each candidate's KR, trajectory, and fit
4. Project the Team KR impact of adding each candidate
5. Rank candidates by projected Team KR lift per scholarship dollar

---

# RECRUITING INTELLIGENCE

## High School/Junior Golf Evaluation

### Data Sources for Junior Golfers
- Junior Golf Scoreboard
- AJGA (American Junior Golf Association) results
- USGA amateur championship results
- State high school championship results
- Golfweek/Sagarin junior rankings
- WAGR (World Amateur Golf Ranking) for international prospects
- Recruiting services (JGS, NCSA, etc.)

### Junior-to-College Translation
Junior golf results are not directly comparable to college golf. Key adjustments:
- **Course setup differences:** Junior events often play shorter courses with easier setups
- **Field strength:** Junior event fields vary enormously in quality
- **AJGA Invitational results** are the strongest predictor of college success
- **USGA championship results** (US Girls' Junior, US Women's Amateur) provide elite-level data
- **International amateur results** are strong predictors but require cultural/transition adjustment

### Recruiting Priority Matrix

| Prospect KR | Projected D1 Tier | Scholarship Priority |
|------------|-------------------|---------------------|
| 85+ | Power 4 starter | Immediate full offer |
| 80-84 | D1 starter (any) | Strong partial to full offer |
| 75-79 | D1 contributor | Partial offer, development plan |
| 70-74 | D2/NAIA starter or D1 depth | Depends on program level and need |
| Below 70 | D3/NAIA/NJCAA | Level-appropriate offer |

---

# UPDATE CADENCE

| What | Cadence | Trigger |
|------|---------|---------|
| Player KR | Every tournament | Post-tournament stats ingestion |
| Team KR | Every tournament | Updated player KRs + lineup |
| Lineup Construction | Pre-tournament | Tournament announcement + current form |
| Depth KR | Monthly | Qualifying rounds, practice rounds |
| Scholarship Allocation | Annually | Recruiting cycle, roster changes |
| Program Strength | Annually | Season results, facilities, budget |
| Coaching Impact | Annually | Season-long development metrics |
| Recruiting Intelligence | Continuous | Portal activity, junior results, commitments |

---

# GOVERNANCE

- Team KR is computed by Nexus. No manual override.
- Coach inputs (lineup selection, practice round results, injury status) are the only human-entered data that affects downstream computation.
- All computed outputs are deterministic: same inputs produce same outputs.
- Player records are never deleted. Historical data persists.
- The product flywheel: V1 (public stats) is the baseline. V2 (KaNeXT tracking) adds shot-level data. V3 (multi-season tracking) provides the highest confidence evaluations.
