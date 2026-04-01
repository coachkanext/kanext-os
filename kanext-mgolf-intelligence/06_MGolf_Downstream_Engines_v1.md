# MEN'S GOLF DOWNSTREAM ENGINES
## File 06 - v1.0

---

# DEVELOPMENT INTELLIGENCE ENGINE

## 0. Purpose
The Development Intelligence Engine is the final downstream consumer of the KaNeXT Men's Golf Intelligence System. It takes everything the system knows about a golfer - their evaluation, their archetype, their component KRs, their confidence - and translates it into actionable intelligence for development, placement, and decision-making.

It answers five questions for any evaluated golfer:
1. **Where are you now?** - Truth summary across every level
2. **Where should you be?** - Best-fit targets ranked by actual impact
3. **What are you worth there?** - Value at each target (scholarship implication)
4. **What's the gap?** - Specific components holding you back, with exact deltas needed
5. **What's the path?** - Prioritized development roadmap with projected impact

This engine does NOT evaluate players. It does NOT modify Player KR, archetypes, or any upstream output. It reads governed truth and produces downstream recommendations only.

All outputs are deterministic: same inputs produce the same outputs.

---

## 1. Consumers

The Development Intelligence Engine serves multiple users viewing the same player from different angles:

- **The golfer** - "Where should I transfer? What should I work on? What am I worth?"
- **The head coach** - "How do I develop this player? What's his ceiling? Where does he project if he improves?"
- **Recruiting coordinators** - "Does this golfer fit our team needs? What's he worth to us vs other targets?"
- **Transfer portal decision-makers** - "Which portal players improve our Team KR the most?"
- **Junior golf advisors** - "What level should this kid play at? Which programs are the best fit?"
- **Pro scouts / agents** - "Does this player have professional viability? What's the pathway?"

Same engine, same outputs, different decisions made from them.

---

## 2. MUST PULL (Inputs)

### A) Player Identity + Record
From: Player Profile
- Player name, identity, demographics
- Career history (schools, levels, seasons)
- Current roster affiliation
- Eligibility status and remaining eligibility
- Class year / age
- Transfer portal status (if applicable)
- Recruiting classification (if applicable: junior rankings, AJGA results)

### B) Player KR Outputs (Truth)
From: Player Evaluation Pipeline (finalized)
- Overall Player KR
- Component KRs: BKR, SKR, CKR, MKR, AKR
- Player confidence_pct
- Evaluation mode (V1 / V1+ / V2)
- Data tier

### C) Archetype + Badges
From: Archetype Library, Badge Spec
- Primary archetype
- Secondary archetype (if qualified)
- Badge list (bronze / silver / gold)
- System risks (if any)

### D) Trait Scores (Raw)
From: Trait Library (5 clusters, 25 traits)
- All scored traits with current values
- Unscored traits flagged
- Cluster-level summaries

Required for: Gap Analysis and Development Roadmap (computing which trait improvements produce the largest KR lift).

### E) Level Interpretation
From: Player KR Legend (all competitive levels) + KLVN normalization
- Player's KR tier label at EVERY competitive level (D1 Power, D1 Mid-Major, D1 Low-Major, D2, D3, NAIA, NJCAA)
- This shows the same golfer might be "Counting player" at D1 Power but "Team anchor" at D2

---

## 3. GAP ANALYSIS ENGINE

### Component KR Gap Identification

For each component KR, compute the gap between current value and the target KR at the desired level:

**Gap_i = Target_Component_KR_i - Current_Component_KR_i**

Where Target is derived from the level legend:
- If the golfer wants to be a "counting player" at D1 Power, the target overall KR is approximately 82-85
- Break that target KR into component targets using the OPF weights
- Identify which components have the largest gaps

### Trait-Level Gap Drill-Down

Within each component KR, identify the specific traits with the largest gaps:
- Sort traits by (trait weight in OPF * gap magnitude)
- The trait with the highest weighted gap is the #1 development priority
- The top 3 traits by weighted gap become the development roadmap

### Gap Priority Framework

| Priority | Criteria | Recommended Focus |
|----------|----------|-------------------|
| Critical | Gap > 15 in a component that carries 25%+ of OPF | Primary development focus. This component is holding the player back. |
| High | Gap > 10 in any component | Significant improvement opportunity. Dedicated practice time. |
| Moderate | Gap 5-10 | Incremental improvement. Maintenance-plus work. |
| Low | Gap < 5 | Near-target. Maintenance work, do not neglect. |

---

## 4. DEVELOPMENT ROADMAP

### Roadmap Structure

For each player, generate a prioritized development plan:

**Phase 1: Immediate (0-3 months)**
- Focus on the #1 gap trait
- Specific drills and practice routines
- Measurable targets (e.g., "Improve scrambling from 52% to 58%")
- Expected KR impact if achieved

**Phase 2: Near-Term (3-6 months)**
- Second and third gap traits
- Integration of Phase 1 improvements into competitive play
- Expected KR trajectory

**Phase 3: Long-Term (6-12 months)**
- Broader game refinement
- Archetype optimization (if the player is near a second archetype threshold)
- Expected end-of-year KR range

### Development Yield Estimates

Not all traits are equally improvable. Some traits respond quickly to training, others are more innate.

| Trait Category | Expected Improvement Range (per year) | Development Difficulty |
|---------------|--------------------------------------|----------------------|
| Putting (mechanical) | 3-8 points | Moderate - responds to practice and coaching |
| Short game touch | 3-7 points | Moderate - technique-dependent |
| Driving accuracy | 2-5 points | Moderate - swing change required |
| Driving distance | 1-4 points | Hard - physical + swing speed, slower gains |
| Course management | 4-10 points | Moderate - experience and coaching dependent |
| Mental game | 3-8 points | Variable - some players improve dramatically, others plateau |
| Iron play consistency | 2-6 points | Hard - precision skill, requires repetition |
| Endurance/fitness | 3-8 points | Moderate - responds to training programs |
| Swing speed | 1-3 points | Hard - physical development, age-dependent |

### KR Ceiling Projection

Based on development yield estimates and current KR:
- **1-Year Ceiling** = Current KR + (Sum of weighted realistic trait improvements through OPF)
- **2-Year Ceiling** = 1-Year Ceiling + (additional gains at 60% of year-1 rate due to diminishing returns)
- **Max Ceiling** = Theoretical maximum if all development priorities are met (rare)

Cap rule: No player's ceiling can exceed their current KR by more than 12 points over 2 years. This prevents unrealistic projections.

---

## 5. PLACEMENT INTELLIGENCE

### Level Fit Assessment

For any golfer, compute their fit at each competitive level:

**Level Fit Score = (Player KR - Level Midpoint KR) / Level KR Spread * 100**

Where:
- Level Midpoint KR = the KR value at the middle of the "solid contributor" tier for that level
- Level KR Spread = the range from bottom to top of competitive viability at that level

Interpretation:
- Level Fit > 120: Overqualified (star at this level, should consider moving up)
- Level Fit 80-120: Good fit (competitive contributor at this level)
- Level Fit 40-80: Stretch fit (will compete but may struggle)
- Level Fit < 40: Under-qualified (below competitive threshold)

### Best Fit Targeting

Rank all levels by Level Fit Score. The levels closest to 100 are the best fit. Present the top 3 level fits with:
- Expected role at each level (star, contributor, depth)
- Scholarship expectation at each level
- Development opportunity (which level offers the best growth environment)

### Transfer Portal Intelligence

For golfers in or considering the transfer portal:
1. Compute KR and Level Fit at current level
2. Compute Level Fit at all other levels
3. Identify programs at each level that have:
   - KR gap in their lineup (the golfer would improve Team KR)
   - Scholarship available
   - Course type alignment (home course suits the golfer's archetype)
4. Rank programs by projected PTV (Player Tournament Value) at each program
5. Present top recommendations with expected impact

---

# PRO TRANSITION INTELLIGENCE ENGINE

## 0. Purpose
Evaluate whether a college golfer has professional viability and project their likely pathway into professional golf.

## 1. The Professional Golf Pathway

### PGA Tour University
Starting in 2023, the PGA Tour created PGA Tour University, which awards professional playing status to top college golfers:
- **PGA Tour University Ranking** - based on Golfstat ranking, college results, and amateur events
- **Top finisher** receives Korn Ferry Tour exempt status
- **2nd-5th** receive PGA Tour Americas membership
- **6th-10th** receive PGA Tour Canada membership
- **11th-15th** receive conditional PGA Tour Americas/Canada status

### Q-School (Qualifying School)
The traditional pathway to tour status:
- **First Stage** - regional qualifiers (approximately 400 players across 12 sites)
- **Second Stage** - 6 sites, top finishers advance
- **Final Stage** - 1 site, approximately 150 players compete for Korn Ferry Tour cards
- Top finishers at Final Stage earn full Korn Ferry Tour status
- Next tier earn conditional Korn Ferry status

### Korn Ferry Tour to PGA Tour
The primary developmental tour:
- Full-season regular season + playoffs
- Top 30 in regular season points earn PGA Tour cards
- Additional cards through Korn Ferry Tour Finals

### International Pathways
- **DP World Tour (European Tour)** - Q-School or Challenge Tour promotion
- **Asian Tour** - Q-School or ranking advancement
- **Japan Golf Tour** - Q-School
- **Sunshine Tour** - Q-School
- **LIV Golf** - invitation-only, typically poaches established tour players
- **Mini-tours** (PGA Tour Americas, Canada, Challenge Tour, etc.) - gateway development tours

---

## 2. Pro Transition KR Thresholds

### Minimum Professional Viability

| Pro Level | Min KR | Sustainable KR | Competitive KR |
|-----------|--------|---------------|----------------|
| PGA Tour | 87 | 90 | 93+ |
| LIV Golf | 88 | 91 | 94+ |
| DP World Tour | 84 | 87 | 90+ |
| Korn Ferry Tour | 82 | 85 | 88+ |
| PGA Tour Americas | 78 | 81 | 84+ |
| Asian Tour | 79 | 82 | 85+ |
| Japan Golf Tour | 80 | 83 | 86+ |
| Challenge Tour | 77 | 80 | 83+ |
| Sunshine Tour | 76 | 79 | 82+ |
| PGA Tour Canada | 76 | 79 | 82+ |
| Mini-tours (US) | 72 | 75 | 78+ |

**Min KR** = lowest KR where a player can theoretically compete (will struggle to keep status)
**Sustainable KR** = can maintain tour status year-over-year
**Competitive KR** = consistently contends for wins and earns comfortable living

### Q-School Projection

Based on current KR, project Q-School outcomes:

| KR Range | First Stage | Second Stage | Final Stage | Korn Ferry Card |
|----------|------------|-------------|-------------|----------------|
| 88+ | Pass (90%+) | Pass (80%+) | Pass (60%+) | Likely |
| 85-87 | Pass (85%+) | Pass (65%+) | Marginal (30-50%) | Possible |
| 82-84 | Pass (75%+) | Marginal (45-55%) | Unlikely (15-25%) | Unlikely |
| 79-81 | Marginal (55-65%) | Unlikely (25-35%) | Very Unlikely (<10%) | Very Unlikely |
| Below 79 | Unlikely (<50%) | Very Unlikely | Not Viable | Not Viable |

---

## 3. Sponsorship and Financial Viability

### The Economic Reality of Professional Golf

Professional golf is one of the most expensive sports to pursue. Unlike team sports, golfers pay their own way:
- Travel (flights, hotels, rental cars): $1,500-$3,000 per event
- Entry fees: $300-$1,500 per event
- Caddie: $1,500-$2,500 per week (base) + 5-10% of earnings
- Equipment: $5,000-$15,000 per year
- Coaching: $5,000-$20,000 per year
- Fitness: $3,000-$10,000 per year
- Agent/management: 10-20% of endorsement income

### Annual Cost Estimates by Tour

| Tour | Annual Cost (USD) | Minimum Earnings to Break Even |
|------|------------------|-------------------------------|
| PGA Tour | $150,000-$250,000 | $300,000-$500,000 |
| Korn Ferry Tour | $100,000-$175,000 | $175,000-$300,000 |
| DP World Tour | $120,000-$200,000 | $200,000-$350,000 |
| PGA Tour Americas | $60,000-$100,000 | $80,000-$150,000 |
| Asian Tour | $80,000-$140,000 | $120,000-$200,000 |
| Mini-tours | $40,000-$80,000 | $50,000-$100,000 |

### Sponsorship Tiers

| Player Profile | Sponsorship Range (Annual) | What Sponsors Want |
|---------------|--------------------------|-------------------|
| Elite College (WAGR top-50, All-American) | $25,000-$100,000 | Brand ambassadorship, social media, represent brand at amateur events |
| Strong College (WAGR 50-200) | $10,000-$40,000 | Equipment use, social media posts, brand visibility |
| Average College | $0-$10,000 | Equipment discounts, minimal cash |
| Korn Ferry Regular | $50,000-$200,000 | Logo placement, event appearances |
| PGA Tour Player | $200,000-$5,000,000+ | Full brand partnerships, varies enormously by profile and social following |

---

## 4. Pro Transition Decision Framework

### Should This Player Turn Pro?

The decision framework weighs multiple factors:

**Factor 1: KR Threshold**
- Player KR >= 85: Professional golf is viable at some level
- Player KR 82-84: Marginal. Mini-tour or developmental tour possible, but financial risk is high
- Player KR < 82: Not recommended. Continue developing at the college level or pursue non-professional career

**Factor 2: Remaining Eligibility**
- If the player has 2+ years of eligibility remaining and KR < 88: stay in college
- If the player is a senior or out of eligibility: pro transition is the path if KR >= 82
- If the player has eligibility but KR >= 90: early pro transition is defensible

**Factor 3: Development Trajectory**
- KR improving year-over-year by 3+ points: trajectory supports waiting (higher KR = better pro outcome)
- KR plateaued: pro transition now or never
- KR declining: address root causes before turning pro

**Factor 4: Financial Readiness**
- Does the player have sponsorship lined up?
- Does the player have 2 years of living expenses available?
- Does the player have family support for the financial commitment?
- Professional golf without financial backing is extremely difficult

**Factor 5: PGA Tour University Ranking**
- If the player is projected top-5 in PGA Tour University: stay through senior year to earn free tour status
- This is the most efficient path to professional golf - no Q-School, no mini-tour grinding
- Turning pro early forfeits this advantage

### Decision Output Format

```
Player: [Name]
Current KR: [X] | Component KRs: BKR [X] / SKR [X] / CKR [X] / MKR [X] / AKR [X]
Remaining Eligibility: [X years]
KR Trajectory: [improving/plateaued/declining] at [X points/year]
PGA Tour University Ranking: [if applicable]

RECOMMENDATION: [Stay in College / Turn Pro / Defer Decision]

Reasoning: [specific factors]

If turning pro:
- Recommended pathway: [PGA Tour University / Q-School / Mini-tour development]
- Pro KR projection: [Entry KR] / [1-Year KR] / [3-Year Ceiling KR]
- Target tour: [Korn Ferry / PGA Tour Americas / DP World / etc.]
- Financial requirement: [$X for first 2 years]
- Sponsorship viability: [Strong / Moderate / Weak]
- Earnings projection (Year 1): [$X range]
```

---

# COACHING IMPACT MODIFIER

## v1.0

### Purpose
Measure whether a golf program's coaching staff is producing player development above or below expected rates.

### Computation

**Coaching Impact Score = Average(KR change per player per year) - Expected Development Rate**

Where Expected Development Rate is based on the player's archetype and starting KR:
- Starting KR 70-79: expected +3 to +5 per year
- Starting KR 80-85: expected +2 to +4 per year
- Starting KR 86-90: expected +1 to +3 per year
- Starting KR 91+: expected +0 to +1 per year (diminishing returns at high levels)

### Interpretation

| Coaching Impact Score | Label |
|----------------------|-------|
| > +2.0 | Elite Development Program |
| +1.0 to +2.0 | Above-Average Development |
| -1.0 to +1.0 | Average Development |
| -2.0 to -1.0 | Below-Average Development |
| < -2.0 | Player Development Concern |

### Application
- Coaching Impact does not change any Player KR or Team KR
- It informs recruiting decisions: "this program develops players above/below expected rates"
- It informs transfer decisions: "transferring to this program may accelerate/slow development"
- It is computed annually, requires minimum 3 years of data, and requires at least 5 players with multi-year KR histories
