# Women's Track and Field Simulation Engine v1

---

## 0. SCOPE

This is the single authoritative document for meet simulation in women's track and field. It covers dual meet simulation, conference championship projection, regional/national championship projection, and relay simulation.

This engine consumes Team KR and Athlete KR outputs. It NEVER modifies upstream values. It produces probabilistic meet outcomes and scoring projections.

---

# MEET SIMULATION FRAMEWORK

## 1. Meet Types and Scoring Systems

### 1.1 Dual Meet
Two teams compete head-to-head.
- Scoring: 5-3-1 (1st-2nd-3rd place per event)
- Relay scoring: 5-0 (winner gets 5; loser gets 0)
- Total events: typically 18-21 events (varies by indoor/outdoor and level)
- Winner: higher total score

### 1.2 Triangular/Multi-Team Invitational
Three or more teams compete.
- Scoring: varies (common: 10-8-6-5-4-3-2-1 or 5-3-2-1)
- May score fewer places in smaller meets
- Relay scoring: same as individual events

### 1.3 Conference Championship
Full conference competes.
- Scoring: typically 10-8-6-5-4-3-2-1 (8 places score) per event
- May have prelim/final structure in running events
- Relay scoring: 10-8-6-5-4-3-2-1
- Total events: full outdoor slate (18-21 events typically)

### 1.4 NCAA Regional
Top athletes from each region compete.
- Scoring: individual qualification to nationals (no team scoring at regionals in current format)
- However, many conferences use performance at regional-level meets for team benchmarking

### 1.5 NCAA Championship
National championship.
- Scoring: 10-8-6-5-4-3-2-1 (8 places per event)
- Prelim/semifinal/final structure in running events
- All events scored
- National champion = highest team point total

## 2. Simulation Methodology

### 2.1 Event-Level Simulation

For each event in the meet:

**Step 1: Identify Entries**
List all athletes entered in the event from each competing team, with their Athlete KRs.

**Step 2: Project Place Finish**
Rank athletes by Athlete KR (primary event KR, not composite if athlete competes in multiple events).

Apply the **KR-to-Place Probability Model:**
- KR gap of 0-2 between adjacent athletes: ~55/45 probability split (nearly a toss-up)
- KR gap of 3-5: ~65/35 probability split
- KR gap of 6-10: ~80/20 probability split
- KR gap of 11+: ~92/8 probability split

**Why track and field simulation is more deterministic than team sports:**
In track and field, the athlete with the better mark usually wins. There is no defensive scheme, no teammate dependency (except relays), no game plan adjustment. The primary source of variance is:
- Day-to-day performance variance (typically +/-1-3% of PB)
- Championship meet pressure (captured in CKR)
- Environmental conditions (wind, temperature, altitude)

**Step 3: Apply Variance**
For each simulated place finish, apply a variance factor:
- Sprints: +/- 0.5-1.5 KR points variance (low variance; the fastest usually wins)
- Distance: +/- 1.0-3.0 KR points variance (tactical racing introduces more variance)
- Hurdles: +/- 1.0-2.5 KR points variance (hurdle clearance adds technical variance)
- Jumps: +/- 1.5-3.0 KR points variance (attempt-based competition has more variance)
- Throws: +/- 2.0-4.0 KR points variance (throws have the highest competition-day variance)
- Heptathlon: +/- 2.0-4.0 KR points variance (7-event fatigue introduces significant variance)

**Step 4: Assign Points**
Based on projected place finish, assign scoring system points.

### 2.2 Relay Simulation

**4x100m Relay:**
- Relay KR = average of 4 individual KRs + Baton Exchange Modifier
- Baton Exchange Modifier: +0 to +3 for experienced relay teams with established exchanges; -1 to -3 for new combinations
- Relay-specific variance: +/- 2.0 KR points (baton exchange is a significant variable)

**4x400m Relay:**
- Relay KR = average of 4 individual 400m KRs + Tactical Modifier
- Tactical Modifier: +0 to +2 for teams with smart leg ordering; -1 to -2 for suboptimal ordering
- Relay-specific variance: +/- 2.0 KR points

### 2.3 Multi-Event (Heptathlon) Simulation

Heptathlon is simulated as a single event with:
- Entry by Heptathlon KR
- Variance is high (+/- 3.0-4.0 KR points) because 7-event competition over 2 days has many variance sources
- Day 1 vs Day 2 balance matters: athletes with strong Day 2 (LJ, JT, 800m) have a higher variance ceiling

## 3. Meet-Level Simulation Output

### 3.1 Dual Meet Output
```
DUAL MEET SIMULATION
=====================
[Team A] vs [Team B]

PROJECTED SCORE: [Team A] [XXX] - [Team B] [XXX]
Win Probability: [Team A] [XX]% - [Team B] [XX]%
Margin of Victory (Expected): [X] points

EVENT-BY-EVENT PROJECTION:
  100m:    [1st: Athlete, Team] [2nd: Athlete, Team] [3rd: Athlete, Team]
  200m:    ...
  [All events]

KEY SWING EVENTS (closest projected margins):
  1. [Event]: KR gap of [X] between teams
  2. [Event]: KR gap of [X]
  3. [Event]: KR gap of [X]

RELAY IMPACT:
  4x100m: [Team projected to win]
  4x400m: [Team projected to win]
  Relay point swing: [X points]
```

### 3.2 Conference Championship Output
```
CONFERENCE CHAMPIONSHIP PROJECTION
=====================================
Conference: [Name] | Teams: [N]

PROJECTED TEAM STANDINGS:
  1. [School] - [XXX] projected points | Confidence: [XX]%
  2. [School] - [XXX] points
  3. [School] - [XXX] points
  ...

EVENT GROUP BREAKDOWN (per team):
  Sprints: [Team] [XX pts] | Hurdles: [Team] [XX pts] | ...

KEY MATCHUPS:
  [Event 1]: [Athlete A] vs [Athlete B] (KR gap: [X])
  [Event 2]: ...

SWING EVENTS (events where 2+ teams are within 3 KR of each other):
  [List]

UPSET PROBABILITY:
  [Lower-ranked team] has [X]% chance of finishing ahead of [higher-ranked team] due to [reason]
```

---

# ENVIRONMENTAL ADJUSTMENTS

## Wind Adjustment (Sprint and Horizontal Jump Events)
- Legal wind: -2.0 to +2.0 m/s
- Expected wind: if meet venue has known wind patterns, adjust projected marks
- Headwind/tailwind impact on 100m: approximately 0.05-0.10s per 1 m/s of wind

## Altitude Adjustment
- Sprint/jump events: ~0.5-1.0% improvement at altitude (1500m+) due to reduced air resistance
- Distance events: ~1-3% worse at altitude due to reduced oxygen availability
- Throw events: minimal altitude effect
- For meets at altitude venues, adjust projected marks accordingly

## Indoor vs Outdoor
- Indoor meets have different event slates (no discus, hammer, javelin; different hurdle distances)
- Indoor 200m is run on a flat or banked track (times not directly comparable to outdoor)
- Indoor 400m is 2 laps of a 200m track (slower than outdoor)
- Simulation must use indoor-specific benchmarks for indoor meets

## Temperature
- Extreme cold: sprint and jump performance typically decreases
- Extreme heat: distance performance typically decreases; sprint/jump less affected
- Standard conditions assumed unless meet conditions are known

---

# SIMULATION CONFIDENCE

| Meet Type | Confidence Range |
|-----------|-----------------|
| Dual meet (2 teams, full rosters known) | 70-85% |
| Triangular (3 teams) | 60-78% |
| Conference championship (all teams known) | 55-72% |
| Regional projection (partial entries known) | 45-65% |
| National championship projection (early season) | 35-55% |
| National championship projection (post-regional) | 55-72% |

**Confidence factors:**
- More athletes known = higher confidence
- More recent marks = higher confidence
- Meet conditions known = higher confidence (+3-5%)
- Championship meet (athletes peak) = slightly lower confidence (peaking behavior is hard to predict)

---

# GOVERNANCE

- Simulation consumes Athlete KR and Team KR; never modifies them
- Scoring systems must match the actual meet format (do not use 10-8-6 scoring for a dual meet)
- Environmental adjustments are applied to projected marks, not to KR
- Variance factors are fixed per event type (Section 2.1 Step 3)
- All simulations produce confidence ranges, not single-point predictions
- Relay simulation always includes Baton Exchange Modifier acknowledgment
- Heptathlon simulation uses higher variance than individual events
