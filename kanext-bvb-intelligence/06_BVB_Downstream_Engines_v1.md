# Beach Volleyball Downstream Engines v1

---

## 0. SCOPE

This is the single authoritative document for all downstream intelligence engines in beach volleyball: Indoor-to-Beach Transition Engine, Development Intelligence, Pro Transition, and Recruiting Intelligence.

These engines consume upstream outputs (Player KR, Partnership KR, archetypes, badges). They NEVER modify upstream values. They produce recommendations, projections, and planning intelligence only.

---

# PART 1: INDOOR-TO-BEACH TRANSITION ENGINE

## 1.0 Purpose

The Indoor-to-Beach Transition Engine answers the critical question: **How well will this indoor volleyball player translate to beach?** Most college beach volleyball players also play indoor. Many professional beach volleyball players began as indoor players. This engine provides a structured translation framework.

## 1.1 Why This Matters

Indoor and beach volleyball share fundamentals (ball skills, attacking, serving) but differ dramatically in:
- Surface: sand vs hardcourt changes everything about movement, jumping, and fatigue
- Format: 2v2 vs 6v6 means every player must do everything
- Skill set: indoor specialists (MBs, setters, liberos) must develop entirely new skills for beach
- Physicality: beach demands elite full-body conditioning due to sand movement and no substitutions
- Tactical: indoor relies on complex 6-player systems; beach relies on 2-player communication and reading

## 1.2 Indoor-to-Beach Translation Matrix

### Position Translation

| Indoor Position | Beach Role Translation | Translation Quality |
|----------------|----------------------|-------------------|
| Outside Hitter | Defender or Switch | High - OHs have the most transferable skill set. They attack, pass, serve, and defend in indoor. The complete skill set translates well. |
| Opposite/Right Side | Blocker or Switch | Medium-High - OPPs have strong attacking and blocking. They need to develop passing/defense for beach. |
| Setter | Defender or Switch | Medium - Setters have elite ball handling and IQ, which translates. They need to develop attacking ability. Their touch is an asset for setting in beach. |
| Middle Blocker | Blocker | Medium-Low - MBs have blocking skills and quick-attack timing, but they lack passing/defense experience. Their height is an asset at the net. Beach requires them to develop an entirely new defensive skill set. |
| Libero | Defender | Medium - Liberos have elite passing and defense, which translates directly to the defender role. However, they lack attacking and blocking skills entirely. In beach, even the defender must attack. |
| Defensive Specialist | Defender | Medium-Low - Similar to libero but with even less attack experience. Limited ceiling unless they develop an offensive game. |

### Component KR Translation

| Indoor Component | Beach Translation | Translation Factor |
|-----------------|-------------------|-------------------|
| AKR (Indoor Attack) | AKR (Beach Attack) | 0.75 - Indoor attacking translates well but beach requires shot variety, tool usage, and attacking in wind. Power alone is not enough. |
| BKR (Indoor Block) | IQKR (Beach blocking strategy component) | 0.60 - Indoor blocking technique translates, but beach blocking is a completely different tactical decision (when to block, what to give up, hand signals). Read speed matters more than raw blocking in 2v2. |
| DKR (Indoor Defense) | DKR (Beach Defense) | 0.70 - Passing and digging translate, but sand movement is fundamentally different. Indoor defenders who cannot move on sand struggle. |
| SVR (Indoor Serve) | SVR (Beach Serve) | 0.85 - Serving translates well. The ball is the same, the skill is the same. Wind adds a new variable but the base skill transfers. |
| SKR (Indoor Set) | AKR (Beach setting sub-trait) | 0.65 - Setting ability transfers but beach setting is different (stricter hand-set rules, bump-setting is more common, setting in wind). |
| IQKR (Indoor VB IQ) | IQKR (Beach IQ) | 0.50 - Indoor IQ is system-based (6-player rotations, complex schemes). Beach IQ is partnership-based (2-player communication, reading opponents, weather adaptation). Very different cognitive demands. |

### Projected Beach KR from Indoor KR

```
Projected_Beach_KR = Indoor_KR * Overall_Translation_Factor + Transition_Year_Penalty

Overall_Translation_Factor by Indoor Position:
  OH:   0.78
  OPP:  0.73
  S:    0.68
  MB:   0.62
  L:    0.65
  DS:   0.58

Transition_Year_Penalty:
  Year 1: -8 (significant adjustment period)
  Year 2: -4 (improving but still developing)
  Year 3: -1 (near full translation)
  Year 4+: 0 (fully translated)
```

**Example:** An indoor OH with KR 88 in her first year of beach:
- Projected Beach KR = 88 * 0.78 + (-8) = 68.6 - 8 = 60.6 (Year 1 projection)
- Year 2 projection: 88 * 0.78 - 4 = 64.6
- Year 3 projection: 88 * 0.78 - 1 = 67.6
- Fully translated: 88 * 0.78 = 68.6

**IMPORTANT:** This is a projection, not a KR. The actual beach KR is produced by the beach evaluation pipeline using beach-specific production data. This projection is a reference point for context.

## 1.3 Translation Accelerators and Decelerators

**Accelerators (player reaches full translation faster):**
- Prior beach volleyball experience (youth beach, summer beach leagues)
- Grew up in a beach volleyball culture (Southern California, Brazil, Hawaii)
- Natural athleticism on sand (some players move well on sand naturally)
- High IQKR (smart players adapt faster to new tactical environments)
- Full-time beach training (not splitting time with indoor)

**Decelerators (player takes longer to translate):**
- Zero prior beach experience
- Indoor-only training environment (no sand courts available)
- Physical profile poorly suited for sand (very tall/heavy players struggle with sand movement)
- Splitting time between indoor and beach seasons (common in college - beach season overlaps with indoor spring training)
- Stubborn reliance on indoor habits (e.g., hand-setting everything instead of learning to bump-set)

## 1.4 Translation Report Output

```
INDOOR-TO-BEACH TRANSITION REPORT
===================================
Player: [Name]
Indoor Position: [Position]
Indoor KR: [XX.X]
Indoor Level: [Level]
Beach Experience: [None / Limited / Moderate / Extensive]
Transition Year: [1 / 2 / 3 / 4+]

PROJECTED BEACH KR: [XX.X] (Year [X] projection)
  Fully Translated Ceiling: [XX.X]

COMPONENT TRANSLATION:
  AKR: Indoor [XX.X] -> Beach projected [XX.X] (factor: [X.XX])
  DKR: Indoor [XX.X] -> Beach projected [XX.X] (factor: [X.XX])
  SVR: Indoor [XX.X] -> Beach projected [XX.X] (factor: [X.XX])
  IQKR: Indoor [XX.X] -> Beach projected [XX.X] (factor: [X.XX])

RECOMMENDED BEACH ROLE: [Blocker / Defender / Switch]
Rationale: [Why this role fits their indoor skill set]

TRANSLATION TIMELINE:
  Year 1: [Expected production level and key development areas]
  Year 2: [Expected improvement areas]
  Year 3: [Near full translation expectations]

KEY SKILLS TO DEVELOP:
  1. [Skill 1 - e.g., "Sand movement and lateral speed"]
  2. [Skill 2 - e.g., "Shot variety (cut shot, cobra, tool)"]
  3. [Skill 3 - e.g., "Wind adaptation and float serve"]

ACCELERATORS PRESENT: [List any that apply]
DECELERATORS PRESENT: [List any that apply]

PARTNER FIT PROFILE:
  Best partner archetype: [e.g., "Needs an experienced beach player as a partner to guide transition"]
  Avoid pairing with: [e.g., "Another first-year beach player - both need an experienced partner"]
```

---

# PART 2: DEVELOPMENT INTELLIGENCE ENGINE

## 2.0 Purpose

The Development Intelligence Engine answers five questions for any evaluated beach volleyball player:

1. **Where are you now?** - Truth summary across every level
2. **Who should you play with?** - Best-fit partners ranked by chemistry and complementarity
3. **What are you worth?** - Value at each target level (scholarship, partnership desirability)
4. **What is the gap?** - Specific traits holding you back, with exact deltas needed
5. **What is the path?** - Prioritized development roadmap with projected impact

## 2.1 Gap Analysis

For each component KR, compute the delta between current score and the score needed to move up one legend tier at the player's current level.

```
Gap_Component_X = Target_Component_Score - Current_Component_Score
```

Rank components by:
1. **KR lift per point of improvement** - which component, given its OPF weight, produces the most KR improvement per point gained?
2. **Trainability** - some skills are more trainable than others in beach volleyball

### Trainability Ratings by Component (Beach Volleyball)

| Component | Trainability | Notes |
|-----------|-------------|-------|
| SVR (Serve) | High | Serving is one of the most trainable skills. Repetition-based. Players can develop new serve types (float, jump, short) with focused training. |
| DKR (Defense/Dig) | Medium-High | Digging technique, positioning, and sand movement are trainable. Read speed improves with experience. Pursuit range is partially athletic (less trainable). |
| AKR (Attack) | Medium | Shot variety and tool usage are trainable with reps. Raw power is less trainable. Setting ability (within AKR for beach) improves with practice. |
| IQKR (Beach IQ) | Medium-Low | Blocking strategy, opponent reading, wind adaptation, and tournament management improve with experience. But elite-level processing speed and decision-making are partially innate. Partnership communication improves with time together. |

### Development Timeline Projections

| Current KR | Projected KR Gain in 1 Year | Projected KR Gain in 2 Years |
|-----------|---------------------------|----------------------------|
| 90+ | +1 to +3 | +2 to +4 |
| 80-89 | +2 to +5 | +4 to +8 |
| 70-79 | +3 to +7 | +5 to +10 |
| Under 70 | +4 to +10 | +6 to +14 |

**Notes:**
- Beach volleyball development is heavily experience-dependent. Playing more matches and tournaments accelerates development more than isolated training.
- Partnership stability accelerates development for both players (they learn to read each other).
- Players who train full-time on sand develop faster than those who split time with indoor.

## 2.2 Partner Matching Engine

Given an evaluated player, recommend ideal partner profiles.

**Input:** Player KR, component KRs, archetype, role, physical profile
**Output:** Ranked list of partner archetypes and profiles that would maximize Partnership KR

**Matching Criteria:**
1. **Role complementarity:** If the player is a blocker, match with a defender (and vice versa). Switch players can match with anyone.
2. **Component complementarity:** If the player has a weak SVR, match with a partner who has a strong SVR. The partnership should cover weaknesses.
3. **Serve diversity:** Match a float server with a jump server.
4. **Height compatibility:** Optimal pairing has a 2-5 inch height differential for blocker/defender pairs.
5. **Communication style compatibility:** V2+ only. Do the players communicate in compatible ways?
6. **Experience match:** Pair experienced players with developing players for mentorship, or pair two experienced players for immediate competitiveness.

## 2.3 Development Roadmap Output

```
DEVELOPMENT ROADMAP
=====================
Player: [Name]
Current KR: [XX.X]
Target KR (1 Year): [XX.X]
Target KR (2 Year): [XX.X]

GAP ANALYSIS:
  AKR: Current [XX.X] | Target [XX.X] | Gap: [X.X] | KR Lift per point: [X.XX]
  DKR: Current [XX.X] | Target [XX.X] | Gap: [X.X] | KR Lift per point: [X.XX]
  SVR: Current [XX.X] | Target [XX.X] | Gap: [X.X] | KR Lift per point: [X.XX]
  IQKR: Current [XX.X] | Target [XX.X] | Gap: [X.X] | KR Lift per point: [X.XX]

PRIORITY DEVELOPMENT ORDER:
  1. [Component] - [Specific skill to develop] - Trainability: [Rating] - Expected impact: [KR points]
  2. [Component] - [Specific skill to develop] - Trainability: [Rating] - Expected impact: [KR points]
  3. [Component] - [Specific skill to develop] - Trainability: [Rating] - Expected impact: [KR points]

PARTNER RECOMMENDATION:
  Ideal partner profile: [Description]
  Best archetype match: [Archetype name]
  Physical profile: [Height range, role]
```

---

# PART 3: PRO TRANSITION ENGINE

## 3.0 Purpose

The Pro Transition Engine projects professional readiness for beach volleyball players transitioning from college to the professional circuit.

## 3.1 Professional Pathway

Beach volleyball has a different professional structure than indoor volleyball. There is no draft. Players form partnerships and compete for spots on professional tours.

**Tour Hierarchy (US-Focused):**
1. FIVB Beach Pro Tour - Elite 16 (highest international level)
2. FIVB Beach Pro Tour - Challenge
3. FIVB Beach Pro Tour - Futures
4. AVP Pro Tour (top US domestic)
5. AVP Next (qualifying/development)
6. Regional/local professional events

**Olympic Pathway:**
- Countries earn quota spots through world rankings
- Each country can enter up to 2 pairs per gender
- USA Volleyball selects pairs based on world rankings and national team criteria
- Olympic qualification typically requires consistent Elite 16/Challenge performance over a 2-year cycle

## 3.2 Pro Readiness Assessment

**KR Thresholds for Pro Readiness:**

| KR Range | Pro Projection |
|----------|---------------|
| 92+ | Ready for AVP main draw and FIVB Challenge immediately. FIVB Elite 16 within 1-2 years. |
| 86-91 | AVP main draw competitive. FIVB Futures/Challenge qualifier. 2-3 years to consistent international level. |
| 80-85 | AVP Next competitive. Can qualify for AVP main draw. Development-level professional. |
| 75-79 | Fringe professional. AVP Next or regional pro events. Needs significant development or an elite partner to compete at higher levels. |
| Below 75 | Not projected as a sustainable professional at this time. |

## 3.3 Partner Selection for Pro Transition

Unlike team sports with drafts and roster assignments, beach volleyball players must find their own partners. The Pro Transition Engine recommends:

1. **Partner KR target:** The minimum partner KR needed to compete at each tour level
2. **Partner archetype fit:** What archetype complements the player's strengths
3. **Partnership timeline:** How long will it take for a new partnership to gel

**Partner KR Target by Tour Level:**

| Tour Level | Minimum Average Partnership KR |
|-----------|-------------------------------|
| FIVB Elite 16 | 90+ |
| FIVB Challenge | 85+ |
| AVP Pro Tour | 82+ |
| AVP Next | 76+ |

## 3.4 Financial Projection

Beach volleyball's financial landscape is different from indoor:
- No guaranteed salaries (prize money only)
- Significant travel expenses (self-funded for most pairs)
- Sponsorship income varies widely
- Coaching income supplements many pro players' earnings

**First-Year Pro Financial Model (US-Based):**

| KR Range | Estimated Prize Money | Estimated Sponsorship | Estimated Expenses | Net |
|----------|----------------------|----------------------|-------------------|-----|
| 92+ | $30K-$80K | $10K-$50K | $25K-$40K | +$15K to +$90K |
| 86-91 | $10K-$35K | $5K-$20K | $20K-$35K | -$10K to +$20K |
| 80-85 | $3K-$12K | $2K-$8K | $15K-$25K | -$12K to -$5K |
| Below 80 | Under $3K | $0-$3K | $10K-$20K | Negative |

**Note:** Most early-career professional beach volleyball players lose money in their first 1-3 years. The investment pays off if they reach the AVP/FIVB level where prize money and sponsorships are meaningful. Many supplement with coaching, clinics, and content creation.

## 3.5 Pro Transition Output

```
PRO TRANSITION ASSESSMENT
===========================
Player: [Name]
Current KR: [XX.X]
Current Level: [College / Club / Junior]
Gender: [M/F]

PRO READINESS SCORE: [XX / 100]

TOUR-BY-TOUR PROJECTION:
  AVP Next: [Ready / Competitive / Developing]
  AVP Pro Tour: [Ready / Competitive / Developing / Not Yet]
  FIVB Futures: [Ready / Competitive / Developing / Not Yet]
  FIVB Challenge: [Ready / Competitive / Developing / Not Yet]
  FIVB Elite 16: [Ready / Competitive / Developing / Not Yet]
  Olympic Pathway: [On track / Possible in X years / Not projected]

OPTIMAL PARTNER PROFILE:
  Target KR: [XX+]
  Target archetype: [Archetype]
  Target role: [Blocker / Defender / Switch]

FINANCIAL PROJECTION (Year 1):
  Estimated prize money: [$XX-$XX]
  Estimated sponsorship: [$XX-$XX]
  Estimated expenses: [$XX-$XX]
  Net: [$XX to $XX]

DEVELOPMENT PRIORITIES FOR PRO:
  1. [Priority 1]
  2. [Priority 2]
  3. [Priority 3]

TIMELINE:
  Year 1: [Expectation]
  Year 2: [Expectation]
  Year 3: [Expectation]
```

---

# PART 4: RECRUITING INTELLIGENCE

## 4.0 Purpose

The Recruiting Intelligence Engine evaluates prospects for college beach volleyball programs, drawing from indoor volleyball, junior beach volleyball, and club programs.

## 4.1 Prospect Sources

**Primary sources for beach volleyball recruits:**
1. **Indoor volleyball players** - The largest source. Most college beach players were indoor players first.
2. **Junior beach volleyball players** - Growing pipeline. USAV Junior Beach, AAU, p1440.
3. **Crossover athletes** - Swimmers, track athletes, basketball players who transition to beach.
4. **International recruits** - Players from countries with strong beach volleyball cultures (Brazil, Australia, Netherlands, Germany).

## 4.2 Indoor-to-Beach Prospect Evaluation

When evaluating an indoor player as a beach prospect:

1. Run the Indoor-to-Beach Translation (Part 1 of this file)
2. Assess beach-specific physical traits:
   - How do they move on sand? (If observable - V2+ only)
   - What is their height and reach relative to beach norms (not indoor norms)?
   - Do they have the endurance for full matches without substitution?
3. Assess beach-specific mental traits:
   - Can they communicate effectively with one partner? (Indoor communication is different)
   - Can they handle the isolated pressure of 2v2? (No bench, no teammates to pick you up)
   - Are they willing to develop new skills (shot variety, bump-setting, blocking signals)?
4. Consider prior beach experience:
   - Any junior beach results?
   - Beach volleyball culture background?
   - Summer beach leagues?

## 4.3 Junior Beach Prospect Evaluation

For players with primarily beach volleyball backgrounds:
1. Evaluate using the standard beach evaluation pipeline (File 01)
2. Apply junior-level KLVN lambda
3. Assess physical development trajectory (still growing? Peak athletic years ahead?)
4. Project college-level KR using development curves

## 4.4 Recruiting Priority Score

For college programs evaluating prospects:

```
Recruiting_Priority = (Projected_Beach_KR * 0.40) + (System_Need_Score * 0.25) + (Availability_Score * 0.20) + (Indoor_Dual_Value * 0.15)
```

Where:
- Projected_Beach_KR: projected KR at the college beach level (using translation engine or direct beach evaluation)
- System_Need_Score: how much does the roster need this player's profile (role, archetype, physical tools)
- Availability_Score: likelihood of signing (commitment status, other offers, academic fit)
- Indoor_Dual_Value: bonus if the recruit can also contribute to the indoor program (shared scholarship value)

## 4.5 Recruiting Report Output

```
RECRUITING REPORT - BEACH VOLLEYBALL
======================================
Prospect: [Name]
Source: [Indoor / Junior Beach / Crossover / International]
Current Level: [HS / Club / Junior Beach / International Youth]
Age: [XX]
Height: [X'X"]
Indoor Position (if applicable): [Position]
Indoor KR (if applicable): [XX.X]

PROJECTED BEACH KR (Year 1 College): [XX.X]
PROJECTED BEACH KR (Full Translation): [XX.X]

RECOMMENDED BEACH ROLE: [Blocker / Defender / Switch]

TRANSLATION ASSESSMENT:
  Skills that transfer: [List]
  Skills to develop: [List]
  Timeline to contribution: [Year 1 / Year 2 / Year 3]

PHYSICAL PROFILE:
  Height relative to beach norms: [Above / At / Below]
  Sand movement potential: [High / Medium / Low / Unknown]
  Endurance projection: [Strong / Average / Concern]

PAIR FIT:
  Best partner profile on current roster: [Player name or profile description]
  Projected pair position: [Pair 1-6]

RECRUITING PRIORITY SCORE: [XX / 100]
  Projected Beach KR component: [XX]
  System Need component: [XX]
  Availability component: [XX]
  Indoor Dual Value component: [XX]

SCHOLARSHIP RECOMMENDATION: [Full / Partial / Walk-on / Indoor scholarship covers]
```

---

# PART 5: COACHING IMPACT MODIFIER

## 5.0 Purpose

The Coaching Impact Modifier assesses how a coaching staff's track record and methodology affect player development projections.

## 5.1 Coaching Evaluation Factors

| Factor | Measurement | Weight |
|--------|-------------|--------|
| Player development track record | KR improvement of players under this coach (2+ seasons) | 35% |
| Pro placement rate | % of graduated players who compete professionally (AVP/FIVB) | 25% |
| Partnership management | How well the coach pairs players (average chemistry score across pairs) | 20% |
| Indoor-to-beach transition success | KR improvement rate of indoor-to-beach transition players | 15% |
| Recruiting quality | Average incoming recruit projected KR vs actual KR after 2 years | 5% |

## 5.2 Coaching Impact Score

```
Coaching_Impact_Score = weighted average of all factors above
```

**Coaching Impact Modifier on Development Projections:**

| Coaching Impact Score | Development Modifier |
|----------------------|---------------------|
| 90+ (Elite) | +15% to projected KR gains |
| 75-89 (Strong) | +8% to projected KR gains |
| 60-74 (Average) | No modifier |
| 45-59 (Below Average) | -8% to projected KR gains |
| Below 45 (Weak) | -15% to projected KR gains |

---

## 6. GOVERNANCE

- All downstream engines consume only upstream finalized outputs. They NEVER modify KR, component KRs, archetypes, or badges.
- Indoor-to-Beach translation is a projection tool, not a KR producer. Actual beach KR comes from beach-specific evaluation.
- Pro transition financial projections are estimates based on current tour economics and will need regular updating.
- Development timelines are projections, not guarantees. All projections carry confidence ranges.
- Recruiting priority scores are program-specific (they depend on roster needs).
- Coaching impact modifier adjusts development projections only, never current evaluations.
