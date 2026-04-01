# Women's Track and Field Downstream Engines v1

---

## 0. SCOPE

This is the single authoritative document for all downstream intelligence engines in women's track and field: Development Intelligence, Pro Transition, Return-from-Pregnancy Development Pathway, Coaching Impact Modifier, and Recruiting Intelligence.

These engines consume upstream outputs (Athlete KR, Team KR, archetypes). They NEVER modify upstream values. They produce recommendations, projections, and planning intelligence only.

---

# PART 1: DEVELOPMENT INTELLIGENCE ENGINE

## 1.0 Purpose

The Development Intelligence Engine answers five questions for any evaluated athlete:

1. **Where are you now?** - Truth summary across every level
2. **Where should you be?** - Best-fit targets ranked by actual team impact
3. **What are you worth there?** - Value at each target (PTV, scholarship implication)
4. **What is the gap?** - Specific components holding you back, with exact deltas needed
5. **What is the path?** - Prioritized development roadmap with projected impact

This engine does NOT evaluate athletes. It reads governed truth and produces downstream recommendations only. All outputs are deterministic.

## 1.1 Consumers

- **The athlete** - "Where should I transfer? What should I work on?"
- **The athlete's current coach** - "How do I develop this athlete? What is her ceiling?"
- **Recruiting coordinators** - "Does this athlete fit our event needs? What is she worth to us?"
- **Transfer portal decision-makers** - "Which portal athletes improve our Team KR the most?"
- **Club/high school advisors** - "What level should this athlete target?"
- **Pro scouts/agents** - "Where does this athlete project professionally?"

## 1.2 Inputs (Must Pull)

### A) Athlete Identity + Record
- Name, event group, primary event(s)
- Career history (schools, levels, seasons)
- Current roster affiliation
- Eligibility status and remaining eligibility
- Transfer portal status (if applicable)

### B) Athlete KR Outputs
- Final Athlete KR
- All component KRs (PKR, TKR, AKR/EKR, CKR, IQKR)
- Base KR (pre-system context)
- Confidence %
- Data tier (V1/V1+/V2/V3)

### C) Archetype + Badges
- Primary archetype
- Badge list
- System risks

### D) Level Interpretation
- Level Tier Map (KR read against every level legend)

## 1.3 Development Roadmap

### Gap Analysis
For each component KR, compute the delta between current score and the score needed to move up one legend tier at the athlete's current level.

```
Gap_Component_X = Target_Component_Score - Current_Component_Score
```

### Priority Ranking
Rank development priorities by impact:
1. **PKR improvement** - The primary mark is always the highest-impact development area. In track, faster times and longer distances are the direct path to higher KR.
2. **TKR improvement** - Technical development that translates to mark improvement. Event-specific coaching is the primary lever.
3. **CKR improvement** - Championship meet preparation. Competition exposure and mental skills training.
4. **EKR improvement (distance/MD)** - Aerobic and anaerobic development through training volume and quality.
5. **AKR improvement** - Physical development (strength, power, speed) through training.
6. **IQKR improvement** - Race tactics and competition management through experience and coaching.

### Development Timeline
Track and field development follows event-group-specific timelines:

**Sprints:** Fastest development window is 18-23 (women). Peak competitive age is typically 24-29. Annual improvement of 0.1-0.3s in 100m is significant at D1 level.

**Hurdles:** Technique development can produce rapid improvement. First-year hurdlers often improve 0.5-1.0s in 100mH through technical coaching alone. Peak age is typically 24-30.

**Middle Distance:** Development window extends through mid-20s. 800m runners often develop from 400m backgrounds. Annual improvement of 1-3 seconds in 800m is significant.

**Distance:** Longest development window. Many elite women's distance runners peak at 27-35. Aerobic development is cumulative and improves for years. Annual improvement of 10-30 seconds in 5000m is significant.

**Jumps:** Technical development can produce rapid improvement. Physical maturity matters. Peak age is typically 24-30. Annual improvement of 0.05-0.15m in HJ or 0.10-0.30m in LJ/TJ is significant.

**Throws:** Longest development timeline in track. Strength development takes years. Technique refinement is ongoing. Peak age is often 27-35 for women's throws. Annual improvement of 0.50-1.50m in throws is significant.

**Heptathlon:** Multi-year development sport. Most elite heptathletes peak at 26-32. Requires patient, holistic development across 7 events.

## 1.4 Transfer Portal Intelligence

### Best-Fit Program Matching
For athletes considering transfer, identify programs that:
1. **Need her event group** - programs with low Event Group KR in her event
2. **Have event-specific coaching** - programs with dedicated coaches for her event
3. **Offer adequate scholarship** - programs with scholarship room for her PTV
4. **Match her competitive level** - programs where her KR places her in the scoring range
5. **Have relay utility** - programs where she could contribute to relay scoring

### Transfer Impact Projection
```
Transfer Impact = Target_Team_KR_with_athlete - Target_Team_KR_without_athlete
```

This shows the marginal Team KR impact of adding this specific athlete.

## 1.5 High School to College Level Matching

For high school athletes selecting a college program:

| Athlete KR | Best-Fit Level |
|-----------|----------------|
| 90+ | NCAA D1 Power 4 |
| 85-89 | NCAA D1 Mid-Major or strong D2 |
| 80-84 | NCAA D2 or strong D3/NAIA |
| 75-79 | NCAA D3, NAIA, or strong NJCAA |
| 70-74 | NAIA, NJCAA, or developmental D3 |
| <70 | NJCAA or club |

These are starting guidelines. Event-specific depth at each level varies significantly.

---

# PART 2: PRO TRANSITION ENGINE

## 2.0 Purpose

Evaluates professional readiness, projects professional trajectory, and identifies optimal post-collegiate pathways for elite women's track athletes.

## 2.1 Professional Landscape (Women's Track and Field)

### Competition Circuit
- **World Athletics Diamond League:** Premier professional competition series. 14 meets globally. Prize money per event. Points-based qualification for Diamond League Final.
- **World Athletics Championships:** Biennial world championship. National team selection required.
- **Olympic Games:** Quadrennial. National team selection required. The highest-profile competition.
- **World Athletics Continental Tour:** Gold, Silver, Bronze tiers below Diamond League. Accessible entry-level professional competition.
- **National Championships:** US Track and Field Championships (USATF). Primary selection meet for World Championships and Olympics.
- **Indoor World Championships:** Biennial indoor championship.
- **World Athletics Relays:** Annual relay-focused international competition.

### Revenue Streams (Women's)
- **Shoe company contracts:** Nike, adidas, New Balance, PUMA, Asics, On, HOKA sign professional women's track athletes. Contract values range from $10K-$1M+ annually depending on event, profile, and results.
- **Diamond League prize money:** $10,000 per event win at standard meets; $30,000 for Diamond League Final win. World Athletics has implemented equal prize money for men and women.
- **World Championships/Olympics:** Prize money ($70,000 for WC gold; Olympic medal bonus varies by national federation). Equal for men and women at World Athletics events.
- **Appearance fees:** Top athletes receive guaranteed fees for competing at invitationals.
- **NIL/endorsements:** Social media presence, brand partnerships. Women's track athletes with strong personal brands (Sha'Carri Richardson, Sydney McLaughlin-Levrone) command significant deals.
- **National federation support:** USATF and other federations provide stipends and support to elite athletes.

### Equal Prize Money Policy
World Athletics has implemented equal prize money for men's and women's events at all World Athletics Series events. This is a significant development for women's professional track.

## 2.2 Pro Readiness Assessment

### Minimum Pro-Viability Thresholds (by event)

| Event | Minimum KR for Pro Viability | Minimum Mark |
|-------|------------------------------|-------------|
| 100m | 93 | ~11.10 or faster |
| 200m | 93 | ~22.70 or faster |
| 400m | 93 | ~51.50 or faster |
| 100mH | 93 | ~12.90 or faster |
| 400mH | 93 | ~55.50 or faster |
| 800m | 93 | ~2:01 or faster |
| 1500m | 93 | ~4:08 or faster |
| 3000mSC | 93 | ~9:30 or faster |
| 5000m | 93 | ~15:20 or faster |
| 10000m | 93 | ~31:45 or faster |
| HJ | 93 | ~1.90m or higher |
| LJ | 93 | ~6.60m or further |
| TJ | 93 | ~14.00m or further |
| PV | 93 | ~4.50m or higher |
| SP | 93 | ~17.80m or further |
| DT | 93 | ~57.00m or further |
| HT | 93 | ~68.00m or further |
| JT | 93 | ~57.00m or further |
| Heptathlon | 93 | ~6,000+ points |

**Below these thresholds:** athlete is unlikely to sustain a professional career. May compete unattached or at Continental Tour Bronze/Silver level but will struggle financially.

**At or above these thresholds:** athlete has a viable professional pathway. Contract value and competition access depend on how far above the threshold.

### Pro Readiness Score
```
Pro_Readiness = f(Athlete_KR, CKR, Age, Trajectory, Event_Marketability)

Where:
- Athlete_KR: primary factor (weight 0.45)
- CKR: championship performance matters for pro (weight 0.20)
- Age: relative to peak age for event group (weight 0.10)
- Trajectory: improving, stable, or declining marks (weight 0.15)
- Event_Marketability: some events have larger professional markets (weight 0.10)
```

### Event Marketability Index
Track events differ in professional market size:
- **Highest:** 100m, 200m, 100mH, 400mH (glamour events with largest TV audiences and sponsor interest)
- **High:** 400m, 800m, 1500m, HJ, LJ, PV (strong professional circuits)
- **Medium:** 5000m, 10000m, TJ, Heptathlon (solid professional market but smaller)
- **Lower:** 3000mSC, SP, DT, HT, JT (professional market exists but is more limited; fewer shoe company contracts)

## 2.3 Pro Transition Timeline

### College Senior Decision
For an athlete entering her final year of NCAA eligibility:

| Pro Readiness Score | Recommendation |
|--------------------|----------------|
| 95+ | Strong pro candidate. Pursue contracts. May consider leaving early if remaining eligibility has limited development value. |
| 90-94 | Pro-ready but may benefit from completing eligibility. Evaluate contract offers vs remaining development. |
| 85-89 | Marginal pro candidate. Complete eligibility. May compete professionally while pursuing other career. |
| <85 | Below pro threshold. Prioritize non-athletic career planning. May compete unattached recreationally. |

### Post-Collegiate Development
Professional athletes continue developing post-college:
- Most women's sprinters peak at 25-29
- Most women's distance runners peak at 27-35
- Most women's throwers peak at 27-35
- Most women's jumpers peak at 24-30
- Most women's heptathletes peak at 26-32

A KR of 93 at college graduation (age 22) may reach 96+ by peak competitive age with proper professional training.

## 2.4 Pro Career Projection

### Contract Value Estimation (Annual)

| Athlete KR | Estimated Contract Range |
|-----------|------------------------|
| 98-100 | $200K-$1M+ (world-class, Olympic/WC medal contender) |
| 95-97 | $75K-$250K (Diamond League regular, national championship contender) |
| 93-94 | $25K-$100K (Continental Tour competitor, development contract) |
| 90-92 | $0-$30K (unattached or minimal contract, supplemental income needed) |
| <90 | No professional contract likely |

These are estimates. Actual values depend on event, profile, social media presence, and market conditions. Women's track contracts have been increasing steadily, particularly for marketable sprint/hurdle athletes.

---

# PART 3: RETURN-FROM-PREGNANCY DEVELOPMENT PATHWAY

## 3.0 Purpose

Provides structured return-to-competition planning for women's track athletes who are pregnant, postpartum, or in the return-to-competition window. This is a mandatory engine for women's track intelligence.

## 3.1 Why This Exists

Pregnancy and motherhood have historically been career-ending for many women track athletes - not because of physical inability to return, but because of inadequate support structures, lack of return-to-competition planning, and punitive policies. The evidence from athletes like Allyson Felix, Shelly-Ann Fraser-Pryce, and Alysia Montano demonstrates that world-class performance post-pregnancy is achievable.

This engine provides data-driven return planning so that pregnancy is treated as a developmental phase, not a career end.

## 3.2 Return Timeline Framework

### Phase 1: Pregnancy Period (0-9 months)
- Training should follow medical guidance
- Many athletes train through pregnancy with modifications (reduced intensity, no impact)
- Aerobic fitness can be maintained through low-impact cross-training
- Strength training can continue with modifications
- NO competitive evaluation during this period
- KR is suspended (not zeroed); pre-pregnancy KR remains on file

### Phase 2: Postpartum Recovery (0-6 months post-delivery)
- Medical clearance required before any return to training
- Gradual return to running (typically 6-12 weeks post-delivery for uncomplicated delivery)
- C-section recovery requires longer timeline (8-16 weeks before impact activity)
- Pelvic floor recovery is critical and often under-addressed
- Sleep deprivation affects recovery capacity
- Breastfeeding affects energy availability and body composition
- NO competitive evaluation during this period

### Phase 3: Return-to-Training (3-9 months post-delivery)
- Progressive loading based on medical clearance
- Event-specific training resumes (technical work, speed work, strength training)
- First training marks establish the return baseline
- Expect marks to be 10-25% below pre-pregnancy baseline initially
- Recovery rate varies significantly by event group (see below)
- Provisional KR can be computed based on training marks with very wide confidence range (+/-10)

### Phase 4: Return-to-Competition (6-18 months post-delivery)
- First competitions establish competitive return baseline
- Early competitions are data-gathering, not KR-defining
- After 3+ competitions, compute return KR with pregnancy suppression adjustment
- Compare return marks to pre-pregnancy marks for recovery trajectory

### Phase 5: Full Competitive Return (12-24 months post-delivery)
- Athlete is competing at or near pre-pregnancy level
- Pregnancy suppression flag is maintained but narrowed
- If marks reach within 2% of pre-pregnancy marks, suppression flag can be removed

## 3.3 Recovery Timeline by Event Group

### Sprints (100m, 200m, 400m)
- **Typical return to near-baseline:** 8-14 months post-delivery
- **Full competitive return:** 12-18 months
- **Key factors:** Sprint-specific neural recruitment patterns need re-establishment. Power and explosiveness return after strength training resumes. Reaction time typically not affected long-term.
- **Historical evidence:** Shelly-Ann Fraser-Pryce ran 10.63 100m post-pregnancy (2021). Allyson Felix won Olympic medal post-pregnancy.

### Hurdles (100mH, 400mH)
- **Typical return to near-baseline:** 10-16 months post-delivery
- **Full competitive return:** 14-20 months
- **Key factors:** Hurdle technique requires timing and confidence that takes time to rebuild. Sprint speed returns first; hurdle rhythm follows.
- **Additional risk:** Core stability changes from pregnancy affect hurdle clearance mechanics.

### Middle Distance (800m, 1500m)
- **Typical return to near-baseline:** 8-12 months post-delivery
- **Full competitive return:** 10-16 months
- **Key factors:** Aerobic base recovers relatively quickly. Some evidence suggests pregnancy-related cardiovascular changes (increased blood volume, cardiac output) may benefit aerobic athletes post-recovery.
- **Historical evidence:** Alysia Montano returned to competitive 800m post-pregnancy.

### Distance (3000mSC, 5000m, 10000m)
- **Typical return to near-baseline:** 8-14 months post-delivery
- **Full competitive return:** 10-18 months
- **Key factors:** Aerobic engine recovers well. Running volume takes time to rebuild safely. Steeplechase adds barrier technique rebuilding.
- **Historical evidence:** Many professional marathon/distance runners have returned to elite performance post-pregnancy.

### Jumps (HJ, LJ, TJ, PV)
- **Typical return to near-baseline:** 10-18 months post-delivery
- **Full competitive return:** 14-24 months
- **Key factors:** Impact loading is the last physical quality to normalize. Approach speed recovers before takeoff confidence. Pelvic floor integrity is critical for impact absorption. Pole vault requires upper body strength return.
- **Steepest recovery curve:** Jump events have the longest return timeline because of impact loading demands.

### Throws (SP, DT, HT, JT)
- **Typical return to near-baseline:** 8-14 months post-delivery
- **Full competitive return:** 12-18 months
- **Key factors:** Upper body and rotational power may return relatively quickly. Core stability and technique timing take longer. Hammer and discus require rotational speed which is affected by core changes.

### Heptathlon
- **Typical return to near-baseline:** 14-22 months post-delivery
- **Full competitive return:** 18-30 months
- **Key factors:** Each of 7 events recovers on its own timeline. The weakest-recovering event is the bottleneck. Total points recovery is the longest timeline in women's track.

## 3.4 Return-from-Pregnancy KR Computation

During the return window:
1. Pre-pregnancy KR is the **ceiling anchor** (what she was before pregnancy)
2. Current marks establish the **floor** (where she is now)
3. Recovery trajectory projects the **timeline to ceiling**
4. Pregnancy suppression flag is applied to widen the confidence range

```
Return_KR = Current_Competition_KR (based on actual return marks)
Suppression_Adjustment = pre_pregnancy_KR - current_KR (the delta)
Projected_Recovery_KR = Current_KR + (Suppression_Adjustment * Recovery_Factor)

Where Recovery_Factor:
  - 0-6 months post-return: 0.30-0.50
  - 6-12 months post-return: 0.50-0.75
  - 12-18 months post-return: 0.75-0.90
  - 18+ months post-return: 0.85-0.95
```

**The system NEVER assumes pregnancy ends a career.** It projects recovery based on evidence and adjusts as data comes in.

## 3.5 Support Structure Assessment

The return pathway is affected by support quality:
- **Elite support:** Professional training group, sports medicine, childcare, sponsor support. Fastest return timeline.
- **Collegiate support:** University resources, Title IX protections, scholarship maintenance. Moderate return timeline.
- **Limited support:** Self-funded training, no childcare support, no medical team. Slowest return timeline, highest attrition risk.

The system notes support level in projections but does not penalize the athlete for lack of support.

---

# PART 4: COACHING IMPACT MODIFIER

## 4.0 Purpose

Quantifies how coaching quality affects athlete development and team performance.

### Track-Specific Coaching Factors

#### Event-Specific Coaching
The single biggest development lever in track and field is event-specific coaching:
- Programs with dedicated sprint coaches, hurdle coaches, throws coaches, jump coaches, and distance coaches develop athletes faster
- Programs where one coach covers all events develop athletes more slowly
- CIM accounts for coaching specialization

#### Development Track Record
- Historical KR improvement of athletes under the coach
- Number of athletes developed from D2/NAIA/NJCAA level to D1 level
- Number of athletes developed from college to professional
- Conference championship winning record
- National championship qualification rate

### CIM Score
- CIM > 0: Coaching adds value beyond athlete quality
- CIM = 0: Coaching performs at expected level
- CIM < 0: Coaching underperforms

CIM does NOT modify Athlete KR. It modifies Team KR interpretation and development projections only.

### Women's Track Coaching Context
- Women's track coaching quality varies enormously by program
- Many programs share coaches between men's and women's teams
- Programs with separate women's coaching staff tend to develop women's athletes faster
- Throws coaching is the most specialized; programs without a dedicated throws coach consistently underdevelop throwers
- Distance coaching often comes from former male distance runners; programs with coaches who understand women's physiology specifically (recovery, nutrition, menstrual cycle periodization, bone health) produce better outcomes

---

# PART 5: RECRUITING INTELLIGENCE

## 5.0 Purpose

Provides intelligence for recruiting high school and transfer portal athletes.

## 5.1 High School Recruit Evaluation

### Data Sources
- Athletic.net (primary US high school results database)
- MileSplit (results and rankings)
- State championship results
- AAU/USATF junior national results
- PrepCalTrack, DirectAthletics (additional sources)

### High School to College Projection
High school marks must be adjusted for:
- Different implement weights at high school vs college (high school girls use the SAME implements as college women for most events - SP 4kg, DT 1kg - but verify)
- Hurdle height differences: HS girls 100mH uses 33" hurdles (same as college); HS girls 300mH uses 30" hurdles
- Development trajectory: high school athletes are still developing physically and technically
- Uncoached athletes: some HS athletes have never had event-specific coaching; ceiling is much higher than current marks suggest

### Projection Model
```
Projected_College_KR = High_School_KR + Development_Adjustment

Development_Adjustment:
  - Sprints: +3 to +8 KR (physical maturation + coaching)
  - Hurdles: +5 to +12 KR (technique coaching is the biggest lever in hurdles)
  - Middle Distance: +3 to +8 KR
  - Distance: +5 to +12 KR (aerobic development continues through mid-20s)
  - Jumps: +3 to +10 KR (technique and physical maturation)
  - Throws: +5 to +15 KR (throws have the longest development runway; many elite throwers were mediocre in HS)
  - Heptathlon: +5 to +15 KR (multi-event requires years of development)
```

These adjustments are wide ranges. The specific projection depends on:
- Physical maturity assessment (early maturer vs late maturer)
- Technical coaching access in high school
- Training volume history
- Injury history
- Multi-sport athlete status (positive indicator for athletic ceiling)

## 5.2 Transfer Portal Recruiting

### Portal Intelligence
- Which athletes are in the portal?
- What are their current KRs?
- What is their event group need at the target program?
- What is the projected Team KR impact?
- What is the scholarship cost?

### Portal Risk Assessment
- Why did she enter the portal? (coaching change, playing time, personal, academic)
- Is there an injury/pregnancy/personal issue not reflected in marks?
- How does she perform at a new program vs existing program?
- Transition suppression: expect 1-season adjustment period at new program

---

# GOVERNANCE

- All downstream engines consume upstream KR; never modify it
- Development projections include confidence ranges
- Pro transition assessments are based on current marks and trajectory, not potential
- Return-from-pregnancy pathway is MANDATORY; pregnancy is a developmental phase, not a career end
- CIM modifies team interpretation, never individual KR
- Recruiting projections include development adjustment ranges with confidence
- All recommendations are data-driven; no subjective preference factors
- Women's-specific physiology (menstrual cycle, bone health, pregnancy, ACL risk) must be acknowledged in development planning
- Support structure assessment is informational; it does not penalize athletes
