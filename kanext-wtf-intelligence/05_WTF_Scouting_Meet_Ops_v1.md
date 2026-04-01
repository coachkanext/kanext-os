# Women's Track and Field Scouting and Meet Ops v1

---

## 0. SCOPE

This is the single authoritative document for scouting and meet operations intelligence in women's track and field. It covers the 4-phase meet operations flow: premeet scouting, in-meet tracking, intermission analysis, and postmeet analysis.

This engine consumes Athlete KR and Team KR outputs. It NEVER modifies upstream values.

---

# CONFIDENCE GATES FOR SCOUTING

Before any scouting output is produced, the system checks data completeness.

| Data Available | Scouting Confidence |
|---------------|-------------------|
| Full season marks for all athletes in target event | 70-85% |
| Partial season marks (fewer than 3 meets for some athletes) | 50-70% |
| Prior season marks only (no current season data) | 40-60% |
| Minimal data (1-2 marks total for some athletes) | 30-50% |

If scouting confidence falls below 50%, the output must include a prominent "LOW CONFIDENCE" flag and specify which athletes have insufficient data.

---

# 4-PHASE MEET OPERATIONS FLOW

## PHASE 1: PREMEET SCOUTING

### 1.1 Purpose
Prepare a comprehensive intelligence report for an upcoming meet. The report answers:
- Who are we competing against in each event?
- Where do we have scoring advantages?
- Where are we vulnerable?
- What are the key matchups?
- What is the optimal relay composition?
- What strategic decisions should be made (entries, scratches, event selection)?

### 1.2 Premeet Report Structure

```
PREMEET INTELLIGENCE REPORT
=============================
Meet: [Meet Name]
Date: [Date] | Venue: [Venue]
Meet Type: [Dual/Triangular/Invitational/Championship]
Scoring System: [5-3-1 / 10-8-6-5-4-3-2-1 / etc.]
Conditions: [Expected weather, wind, altitude if known]

TEAM OVERVIEW:
  Our Team KR: [XX.X]
  Opponent(s) Team KR(s): [XX.X each]
  Projected Score: [XXX-XXX]

EVENT-BY-EVENT SCOUTING:

[For each event:]
  [EVENT NAME]
  Our entries: [Athlete(s), KR(s), PB(s), SB(s)]
  Opponent entries: [Athlete(s), KR(s), PB(s), SB(s)]
  Matchup edge: [Our favor / Opponent favor / Toss-up]
  Expected points: [X-X range]
  Key notes: [Tactical considerations]

RELAY SCOUTING:
  4x100m: Our projected split total [XX.XX] vs Opponent [XX.XX]
  Recommended lineup: [Leg 1, Leg 2, Leg 3, Anchor]
  Exchange concerns: [If any]

  4x400m: Our projected split total [X:XX.XX] vs Opponent [X:XX.XX]
  Recommended lineup: [Leg 1, Leg 2, Leg 3, Anchor]

STRATEGIC RECOMMENDATIONS:
  1. [Entry decisions: which athletes in which events]
  2. [Scratch recommendations: where to save energy]
  3. [Doubling decisions: which athletes can double effectively]
  4. [Relay strategy: lineup and order]
  5. [Key event to target for swing points]

RISK FACTORS:
  [Wind forecast, altitude, injury concerns, opponent unknowns]
```

### 1.3 Entry Strategy Intelligence

Track and field meets allow coaches to enter athletes in multiple events (within limits). Entry strategy matters:

**NCAA event limits:** Athletes can enter a maximum of 3 individual events plus relays at most meets. Conference and national championships may have different limits.

**Doubling considerations:**
- 100m + 200m double: common, minimal conflict. Schedule usually accommodates.
- 200m + 400m double: manageable if scheduling allows.
- 800m + 1500m double: classic middle distance double. Requires careful scheduling. 800m first, then 1500m is preferred order.
- 100mH + LJ or HJ: common sprint/jump double. Approach run warmup overlaps.
- Triple entry (e.g., 100m + 200m + LJ): legal but physically demanding. Only for top multi-event athletes.
- Heptathlon athletes do NOT also enter individual events at the same meet (heptathlon is a 2-day commitment).

**Energy management:**
- Athletes competing in prelim/final format events expend energy in prelims
- Relay legs add fatigue load
- Back-to-back events with minimal rest reduce second-event performance
- Distance athletes who double (5k/10k or 1500/5k) need careful scheduling

### 1.4 Opponent Analysis
For each opponent team:
- Event group strengths and weaknesses (from Team KR Coverage Map)
- Key individual threats (athletes with KR >= 88 in any event)
- Relay strength
- Known peaking patterns (do they peak for this meet or save for later?)
- Coaching tendencies (conservative entries or aggressive doubling?)

---

## PHASE 2: IN-MEET TRACKING

### 2.1 Purpose
Real-time tracking of meet progress, scoring updates, and tactical adjustments.

### 2.2 In-Meet Dashboard

```
IN-MEET TRACKING
=================
Meet: [Name] | Status: [In Progress]
Events Completed: [X of Y]

CURRENT SCORE:
  [Team A]: [XXX] points
  [Team B]: [XXX] points

EVENTS COMPLETED:
  [Event]: [1st: Athlete, Team, Mark] [2nd] [3rd] | Points: [Team A: X, Team B: X]
  ...

EVENTS REMAINING:
  [Event]: Projected edge: [Team]
  ...

PROJECTED FINAL SCORE:
  [Team A]: [XXX] (range: [XXX-XXX])
  [Team B]: [XXX] (range: [XXX-XXX])

REAL-TIME ADJUSTMENTS:
  [If an athlete scratched, entered differently, or conditions changed]
```

### 2.3 Real-Time Relay Adjustment
If individual event results reveal updated fitness levels (better or worse than expected), adjust relay lineup recommendations:
- Athlete who ran slower than expected: consider replacement on relay
- Athlete who ran a PB: confirmed fitness, strong relay candidate
- Athlete who DNF'd: scratched from relay consideration

### 2.4 Event Stacking Alerts
Alert when multiple events requiring the same athlete overlap in the schedule:
- "Athlete X has LJ finals at 2:00 PM and 200m prelims at 2:15 PM - schedule conflict"
- Recommend which event to prioritize based on scoring impact

---

## PHASE 3: INTERMISSION ANALYSIS (Between Sessions)

### 3.1 Purpose
For multi-session meets (Day 1 / Day 2, or morning session / afternoon session), analyze Day 1 results and adjust Day 2 strategy.

### 3.2 Intermission Report

```
INTERMISSION ANALYSIS
======================
After: [Session/Day 1]
Remaining: [Session/Day 2]

SCORE AFTER DAY 1:
  [Team A]: [XXX] points
  [Team B]: [XXX] points
  Gap: [X points]

DAY 2 EVENTS REMAINING:
  [List with projected scoring]

REQUIRED PERFORMANCE FOR [TRAILING TEAM] TO WIN:
  Must outscore by [X points] on Day 2
  Key events: [Events where swing is possible]

STRATEGIC ADJUSTMENTS:
  [Based on Day 1 results, injuries, weather changes]
  1. [Specific adjustment]
  2. [Specific adjustment]

HEPTATHLON UPDATE (if applicable):
  After Day 1 (100mH, HJ, SP, 200m):
  [Athlete standings with projected Day 2 scenarios]
```

---

## PHASE 4: POSTMEET ANALYSIS

### 4.1 Purpose
Comprehensive analysis of meet results, performance evaluation, and forward-looking intelligence.

### 4.2 Postmeet Report

```
POSTMEET ANALYSIS
==================
Meet: [Name] | Date: [Date]
Final Score: [Team A] [XXX] - [Team B] [XXX]

SCORING BREAKDOWN BY EVENT GROUP:
  Sprints: [Team A: XX] [Team B: XX]
  Hurdles: [Team A: XX] [Team B: XX]
  Middle Distance: [Team A: XX] [Team B: XX]
  Distance: [Team A: XX] [Team B: XX]
  Jumps: [Team A: XX] [Team B: XX]
  Throws: [Team A: XX] [Team B: XX]
  Heptathlon: [Team A: XX] [Team B: XX]
  Relays: [Team A: XX] [Team B: XX]

INDIVIDUAL HIGHLIGHTS:
  [Athletes who PB'd or significantly exceeded expectations]

INDIVIDUAL CONCERNS:
  [Athletes who underperformed expectations]

PRE-MEET PROJECTION vs ACTUAL:
  Projected: [XXX-XXX]
  Actual: [XXX-XXX]
  Variance: [Within range / Outside range]
  Explanation: [What drove the variance]

KR RECALIBRATION FLAGS:
  [Athletes whose meet performance suggests KR may need updating]
  - [Athlete]: Expected ~[XX KR], performed at ~[XX KR] level
  - [Athlete]: ...

FORWARD-LOOKING:
  1. Event groups that improved
  2. Event groups that need attention
  3. Relay adjustments for next meet
  4. Athletes who should adjust event selection
  5. Training priorities before next competition
```

### 4.3 Mark Updates
After each meet, update the athlete database with:
- New season bests
- New personal bests (verify wind-legal status for sprint/jump events)
- New relay splits
- Competition count increment
- Championship meet results (flag for CKR update)

---

# CHAMPIONSHIP MEET SCOUTING (SPECIAL PROTOCOL)

Conference and national championship meets require enhanced scouting:

## 1. Qualification Analysis
- Which athletes qualified and through what pathway (automatic vs at-large)?
- What marks did they produce at qualifying meet?
- Are they peaking or flat?

## 2. Heat/Flight Assignments
- Running events have heats with assigned lanes
- Field events have flights (groups that compete at different times)
- Heat/flight composition affects strategy (pacemakers, competitors)

## 3. Peaking Intelligence
- Championship meet performance typically produces 0.5-2.0% improvement over season best
- Athletes with high CKR are more likely to peak at championships
- Athletes with low CKR may underperform relative to season marks

## 4. Multi-Round Strategy (Running Events)
- NCAA running events have prelim -> semifinal -> final structure
- Athletes must advance through rounds to score
- Conservative prelim strategy (qualify without maximum effort) preserves energy
- "Time qualifier" vs "place qualifier" math affects round strategy

---

# GOVERNANCE

- Scouting consumes KR; never modifies it
- All premeet reports include confidence levels
- In-meet tracking updates in real time as results are entered
- Postmeet analysis must flag KR recalibration needs
- Entry strategy respects NCAA event limits
- Relay recommendations include fatigue considerations from individual events
- Environmental conditions must be noted in all meet intelligence
- Heptathlon scouting follows the 2-day structure and cannot be simplified to a single-day format
