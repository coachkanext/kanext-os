# SOFTBALL PLAYER EVALUATION REFERENCE
## File 02 - v1.0

---

# HITTER POSITION TRAIT WEIGHTING

## Overall Position Framework (OPF) - Hitters

### CATCHER (C) - COLLEGE
HKR: 28% | PKR: 20% | FKR: 30% | SKR: 4% | IQKR: 18%
### CATCHER (C) - PRO
HKR: 26% | PKR: 22% | FKR: 28% | SKR: 4% | IQKR: 20%

### FIRST BASE (1B) - COLLEGE
HKR: 34% | PKR: 32% | FKR: 14% | SKR: 6% | IQKR: 14%
### FIRST BASE (1B) - PRO
HKR: 32% | PKR: 36% | FKR: 12% | SKR: 4% | IQKR: 16%

### SECOND BASE (2B) - COLLEGE
HKR: 30% | PKR: 20% | FKR: 26% | SKR: 14% | IQKR: 10%
### SECOND BASE (2B) - PRO
HKR: 28% | PKR: 24% | FKR: 24% | SKR: 12% | IQKR: 12%

### THIRD BASE (3B) - COLLEGE
HKR: 32% | PKR: 26% | FKR: 22% | SKR: 8% | IQKR: 12%
### THIRD BASE (3B) - PRO
HKR: 30% | PKR: 30% | FKR: 20% | SKR: 6% | IQKR: 14%

### SHORTSTOP (SS) - COLLEGE
HKR: 26% | PKR: 18% | FKR: 30% | SKR: 14% | IQKR: 12%
### SHORTSTOP (SS) - PRO
HKR: 24% | PKR: 22% | FKR: 28% | SKR: 12% | IQKR: 14%

### LEFT FIELD (LF) - COLLEGE
HKR: 34% | PKR: 28% | FKR: 16% | SKR: 12% | IQKR: 10%
### LEFT FIELD (LF) - PRO
HKR: 32% | PKR: 32% | FKR: 14% | SKR: 10% | IQKR: 12%

### CENTER FIELD (CF) - COLLEGE
HKR: 26% | PKR: 20% | FKR: 28% | SKR: 16% | IQKR: 10%
### CENTER FIELD (CF) - PRO
HKR: 24% | PKR: 24% | FKR: 26% | SKR: 14% | IQKR: 12%

### RIGHT FIELD (RF) - COLLEGE
HKR: 32% | PKR: 26% | FKR: 22% | SKR: 10% | IQKR: 10%
### RIGHT FIELD (RF) - PRO
HKR: 30% | PKR: 30% | FKR: 20% | SKR: 8% | IQKR: 12%

### DESIGNATED PLAYER (DP) - COLLEGE
HKR: 38% | PKR: 36% | FKR: 0% | SKR: 10% | IQKR: 16%
Note: DP in softball CAN play defense (unlike baseball DH). When evaluating a pure DP who does not take the field, FKR = 0%.
### DESIGNATED PLAYER (DP) - PRO
HKR: 36% | PKR: 40% | FKR: 0% | SKR: 8% | IQKR: 16%

### FLEX - COLLEGE
HKR: 30% | PKR: 22% | FKR: 24% | SKR: 10% | IQKR: 14%
Note: FLEX is the defensive-only player paired with DP. Typically pitcher or defensive specialist. When FLEX bats (optional), these weights apply.
### FLEX - PRO
HKR: 28% | PKR: 24% | FKR: 22% | SKR: 10% | IQKR: 16%

### UTILITY (UTIL) - COLLEGE
HKR: 30% | PKR: 24% | FKR: 22% | SKR: 14% | IQKR: 10%
### UTILITY (UTIL) - PRO
HKR: 28% | PKR: 28% | FKR: 20% | SKR: 12% | IQKR: 12%

---

# PITCHER POSITION TRAIT WEIGHTING

## Overall Position Framework (OPF) - Pitchers

### STARTING PITCHER / ACE (SP) - COLLEGE
VKR: 26% | CKR: 26% | DKR: 24% | RKR: 14% | IQKR: 10%
Note: DKR is weighted significantly higher than baseball (24% vs 20%) because softball aces pitch 250-350+ IP per season. Durability is essential.

### STARTING PITCHER / ACE (SP) - PRO
VKR: 24% | CKR: 24% | DKR: 26% | RKR: 16% | IQKR: 10%

### RELIEF PITCHER (RP) - COLLEGE
VKR: 34% | CKR: 26% | DKR: 12% | RKR: 16% | IQKR: 12%

### RELIEF PITCHER (RP) - PRO
VKR: 32% | CKR: 24% | DKR: 14% | RKR: 18% | IQKR: 12%

---

# HITTER TRAIT LIBRARY

## KaNeXT Hitter Trait Clusters - Canonical 5

### 1. Hitting (HKR)

**1a) Contact Rate**
Inputs: K% (inverse), contact rate. College bands: 90 = K% <= 8%; 80 = K% 9-13%; 70 = K% 14-18%; 60 = K% 19-23%; <60 = K% > 23%. Box-score: PROXY from K% and BA. Softball K rates are generally lower than baseball due to shorter pitch distance.

**1b) Batting Average / Hit Tool**
Inputs: BA, BABIP. College bands: 90 = BA >= .370; 80 = BA .330-.369; 70 = BA .290-.329; 60 = BA .250-.289; <60 = BA < .250. Box-score: PROXY from BA. A .340 BA in D1 softball is elite.

**1c) Bat-to-Ball Quality**
Inputs: hard hit %, line drive %. Box-score: PROXY from SLG and BA.

**1d) Situational Hitting**
Inputs: BA w/RISP, 2-out RBI rate. Box-score: PROXY from RBI context-adjusted (low confidence).

**1e) Two-Strike Hitting**
Inputs: BA with 2 strikes. Box-score: UNSCORED (null).

**1f) Slap Hitting Proficiency (SOFTBALL-SPECIFIC)**
Inputs: slap BA, bunt-for-hit success rate, drag bunt success rate. College bands: 90 = slap BA >= .400 + bunt success >= 85%; 80 = slap BA .350-.399; 70 = .300-.349; 60 = .250-.299; <60 = slap BA < .250. Box-score: INFERRED from LHB + BA + SB + triples. Applies ONLY to left-handed batters who slap. The rise ball is the signature pitch of softball. No equivalent in baseball.

### 2. Power / Plate Discipline (PKR)

**2a) Walk Rate / Plate Discipline**
Inputs: BB%, P/PA. College bands: 90 = BB% >= 16%; 80 = 12-15%; 70 = 9-11%; 60 = 6-8%; <60 = BB% < 6%. Box-score: PROXY from BB%.

**2b) Chase Rate / Swing Decisions**
Box-score: UNSCORED (requires pitch-level data).

**2c) Raw Power**
Inputs: HR, ISO. College bands: 90 = ISO >= .250, HR >= 20; 80 = ISO .190-.249, HR 14-19; 70 = ISO .130-.189, HR 8-13; 60 = ISO .080-.129, HR 4-7; <60 = ISO < .080. Box-score: PROXY from ISO and HR. 20+ HR in D1 softball is elite.

**2d) Hard Hit Rate / Exit Velocity**
Box-score: UNSCORED (requires tracking).

**2e) Slugging Efficiency**
Inputs: SLG, OPS, wRC+. College bands: 90 = wRC+ >= 170, OPS >= 1.100; 80 = wRC+ 145-169; 70 = 118-144; 60 = 95-117; <60 = wRC+ < 95. Box-score: PROXY from OPS and SLG.

### 3. Fielding (FKR)

**3a) Range / Defensive Value**
Box-score: PROXY from assists/G (IF) or putouts/G (OF).

**3b) Fielding Percentage / Reliability**
College bands: 90 = FPCT >= .985 (IF) / >= .995 (OF). Box-score: PROXY from FPCT.

**3c) Arm Strength / Accuracy**
Softball distances are shorter (60-foot bases). Arm strength calibrated to softball distances. Catcher pop time bands: 90 = <= 1.65; 80 = 1.66-1.75; 70 = 1.76-1.85.

**3d) Double Play Ability (IF)**
Box-score: PROXY from DP/G.

**3e) Catcher: Receiving / Blocking**
Blocking is MORE critical in softball because rise ball misses go high and 60-foot bases allow quick advancement. Box-score: PROXY from inverse PB rate.

**3f) Catcher: Throwing / CS%**
College bands: 90 = CS% >= 45%; 80 = 35-44%; 70 = 25-34%. 60-foot basepaths mean less time for catchers.

### 4. Speed / Baserunning / Slap (SKR)

**4a) Stolen Bases / Success Rate**
College bands: 90 = SB >= 35 & SB% >= 88%; 80 = SB 25-34 & SB% >= 85%; 70 = SB 15-24 & SB% >= 80%; 60 = SB 7-14 & SB% >= 75%. 60-foot basepaths make SBs more achievable. 35+ SB is elite.

**4b) Sprint Speed / Raw Speed**
College bands: 90 = home-to-first <= 2.70 (LHB) / <= 2.80 (RHB). Box-score: UNSCORED. LHB slappers start running during swing, producing faster times.

**4c) Slap Game Execution (SOFTBALL-SPECIFIC)**
College bands: 90 = elite slap variety (soft, hard, drag) with >= 80% success; 80 = 70-79% with 2+ types; 70 = 60-69% with 1-2 types. Applies ONLY to left-handed batters.

**4d) Extra Bases Taken / Baserunning Aggression**
Box-score: UNSCORED.

**4e) Baserunning Value**
Box-score: PROXY from inverse CS rate + SB volume.

### 5. Softball IQ (IQKR)

**5a) Plate Approach Adjustments** - UNSCORED at V1.
**5b) Situational Awareness** - PROXY from productive out rate.
**5c) Bunt/Slap Decision-Making (SOFTBALL-SPECIFIC)** - UNSCORED at V1.
**5d) Baserunning Decisions** - PROXY from inverse CS rate.
**5e) Defensive Positioning** - UNSCORED at V1.
**5f) Clutch Performance** - PROXY from RISP BA.

---

# PITCHER TRAIT LIBRARY

## KaNeXT Pitcher Trait Clusters - Canonical 5

### 1. Velocity / Stuff (VKR)

**1a) Pitch Speed**
College bands: 90 = avg >= 66 mph, max >= 70+; 80 = avg 63-65; 70 = avg 60-62; 60 = avg 57-59; <60 = avg < 57. UNSCORED at V1. Softball pitching is UNDERHAND from 43 feet. 70+ mph from 43 feet gives hitters roughly same reaction time as 95+ mph from 60'6" in baseball.

**1b) Rise Ball Action (SOFTBALL-SPECIFIC)**
The rise ball is THE signature pitch of softball. True rise requires backspin exceeding gravity-induced drop. UNSCORED at V1.

**1c) Drop Ball Depth (SOFTBALL-SPECIFIC)**
Softball's equivalent of a sinker. Thrown with topspin for sharp downward break. UNSCORED at V1.

**1d) Movement Quality (Overall)**
Box-score: PROXY from K/7 (weak stuff indicator, 25-35% confidence).

### 2. Command / Spin Control (CKR)

**2a) Walk Rate / Zone Control**
College bands: 90 = BB/7 <= 1.2; 80 = 1.3-2.0; 70 = 2.1-3.0; 60 = 3.1-4.0; <60 = BB/7 > 4.0. Box-score: PROXY from BB/7.

**2b) Location Precision** - UNSCORED at V1.

**2c) Spin Axis Consistency (SOFTBALL-SPECIFIC)**
Critical because rise and drop thrown from same arm slot/release. Elite pitchers tunnel identically for 35 of 43 feet. UNSCORED at V1.

**2d) WHIP Control**
College bands: 90 = WHIP <= 0.70; 80 = 0.71-0.90; 70 = 0.91-1.10; 60 = 1.11-1.30; <60 = WHIP > 1.30.

### 3. Durability / Workload (DKR) - HIGH CONFIDENCE IN SOFTBALL

**3a) Innings Volume**
College bands: 90 = IP >= 300 with consistency; 80 = IP 250-299; 70 = IP 200-249; 60 = IP 150-199; <60 = IP < 150. HIGH CONFIDENCE. Softball aces routinely pitch 250-350+ IP per season. 300+ IP is the norm for elite aces.

**3b) Complete Game Rate**
College bands: 90 = CG% >= 70%; 80 = 55-69%; 70 = 40-54%; 60 = 25-39%.

**3c) Tournament Endurance (SOFTBALL-SPECIFIC)**
College bands: 90 = sub-2.00 ERA across 3+ tournament games, no velocity drop; 80 = slight dip but effective; 70 = noticeable decline after 2nd start. PROXY from tournament IP and ERA splits.

**3d) Fatigue Resistance**
College bands: 90 = no statistical decline throughout season; 80 = ERA + 0.30 or less second half.

**3e) Health History**
PROXY from career IP progression (declining IP = concern).

### 4. Repertoire (RKR)

**4a) Arsenal Size**
College bands: 90 = 4+ quality pitches; 80 = 3 quality; 70 = 2 quality; 60 = 1 dominant + 1 show; <60 = 1-pitch pitcher. UNSCORED at V1.

**4b) Pitch Mix Diversity** - UNSCORED at V1.

**4c) Rise/Drop Tunnel (SOFTBALL-SPECIFIC)**
The most devastating pitch combination in softball. Rise and drop from same release, breaking opposite directions. UNSCORED at V1.

**4d) Change-Up Quality**
College bands: 90 = 10+ mph differential with late movement; 80 = 8-10 mph. UNSCORED at V1.

**4e) Platoon Resistance**
College bands: 90 = OPS split <= .050; 80 = .051-.100; 70 = .101-.150. PROXY from splits if >= 40 PA per hand.

### 5. Pitching IQ (IQKR)

**5a) Pitch Sequencing** - UNSCORED at V1.
**5b) Speed Changes / Tempo** - UNSCORED at V1.
**5c) Hitter Memory** - PROXY from times-through-order splits.
**5d) Tournament Management (SOFTBALL-SPECIFIC)** - UNSCORED at V1.
**5e) Hold Runners** - PROXY from opponent SB data.
**5f) Fielding Position** - PROXY from pitcher FPCT. Pitcher is critical fielder in softball (43-foot distance).

---

# HITTER ARCHETYPE LIBRARY (14 Archetypes)

1. **Power Hitter** - HR >= 15, ISO >= .200, SLG >= .550. Primary run producer through HR/XBH.
2. **Contact Hitter** - BA >= .320, K% <= 15%. High-average, gap-to-gap, consistent.
3. **Table Setter** - OBP >= .400, BB% >= 12%, R >= 45. Gets on base, works counts.
4. **Slapper** (SOFTBALL-SPECIFIC) - LHB, SB >= 20, BA >= .310 with slap approach, home-to-first <= 2.85. Uses speed and slap technique. May have zero HR and still be elite.
5. **Dual-Threat Slapper** (SOFTBALL-SPECIFIC) - LHB, SB >= 15, BA >= .300, HR >= 5 OR ISO >= .120. Can slap AND swing for power. Most dangerous offensive archetype in softball.
6. **Five-Tool Player** - HKR >= 75, PKR >= 75, FKR >= 75, SKR >= 75, IQKR >= 70. Elite across all dimensions.
7. **OBP Machine** - OBP >= .430, BB% >= 15%. Extreme on-base rates.
8. **Run Producer** - RBI >= 60, RISP BA >= .320. Middle-of-order, trusted with runners on.
9. **Premium Defender** - FKR >= 85 at C/SS/CF. Value from glove, bat secondary.
10. **Speed Merchant** - SB >= 30, SB% >= 85%. Creates constant pressure.
11. **Utility Weapon** - 10+ starts at 3+ positions, FKR >= 70 primary. Swiss army knife.
12. **Gap-to-Gap Hitter** - 2B + 3B >= 15, BA >= .290, SLG >= .450, HR < 10. Line drive approach.
13. **Balanced Contributor** - No component KR below 65, none above 85. Contributes everywhere.
14. **Defensive Specialist** - FKR >= 80, BA < .250 OR OPS < .650. Defense-only value.

---

# PITCHER ARCHETYPE LIBRARY (10 Archetypes)

1. **Ace / Workhorse** - IP >= 250, ERA <= 2.00, CG% >= 50%, K/7 >= 8.0. Staff anchor, pitches every important game.
2. **Power Pitcher** - Pitch speed >= 64 avg (if available), K/7 >= 10.0. Overpowers with velocity.
3. **Spin Pitcher** (SOFTBALL-SPECIFIC) - RKR >= 80, K/7 >= 8.0 without top velocity. Rise/drop tunnel is primary weapon.
4. **Movement Pitcher** (SOFTBALL-SPECIFIC) - GB% >= 50%, HR/7 <= 0.3. Generates ground balls through downward movement.
5. **Strikeout Artist** - K/7 >= 12.0, K/BB >= 4.0. Misses bats at elite rate.
6. **Command Pitcher** - BB/7 <= 1.5, WHIP <= 0.90. Elite precision, never beats herself.
7. **Pitchability** - 3+ quality pitches, ERA <= 2.50, BB/7 <= 2.0. Outsmarts hitters with sequencing.
8. **Two-Way Star** (SOFTBALL-SPECIFIC) - Pitcher KR >= 80 AND Hitter KR >= 80. Contributes both ways.
9. **Reliever / Change-of-Pace** - RP role, ERA <= 3.00, different style from ace. Contrasting look.
10. **Tournament Closer** (SOFTBALL-SPECIFIC) - 20+ postseason IP, ERA <= 1.50 in postseason. Elevates under pressure.

---

# OFFENSIVE SYSTEM DEMAND PROFILES (5 Systems)

1. **Power/Launch** - Score through HR/XBH. Trait emphasis: PKR. De-emphasis: SKR/slap. Ideal: 4-5 hitters with HR >= 8, team ISO >= .170.
2. **Slap-and-Run** (SOFTBALL-SPECIFIC) - Manufacture runs through slap/speed/pressure. Trait emphasis: SKR slap + speed, HKR contact. Ideal: 3-4 LHB slappers, team SB >= 100, team BA >= .300.
3. **Contact/Speed** - Put ball in play, run aggressively. Trait emphasis: HKR contact, SKR speed. Ideal: team K% <= 16%, BA >= .300, SB >= 80.
4. **Balanced** - No extreme lean. All components weighted equally. Ideal: OPS .750-.900.
5. **Small Ball** - Bunts, sacrifices, hit-and-run, stolen bases. Trait emphasis: HKR situational, SKR speed, IQKR execution. Ideal: sac bunt >= 1.5/game, SB >= 100.

---

# PITCHING PHILOSOPHY DEMAND PROFILES (5 Philosophies)

1. **Ace-Dominant** - One pitcher carries 60-70% of innings. Trait emphasis: DKR (250-350 IP), VKR, CKR. Risk: single point of failure.
2. **Dual-Ace** - Two co-aces split workload. Trait emphasis: VKR/CKR both pitchers, DKR moderate. Ideal: two KR >= 85, different styles.
3. **Committee** - Three or more share innings. Trait emphasis: depth, RKR variety, CKR consistency. Ideal: 3+ KR >= 78.
4. **Strikeout-Dominant** - Miss bats, don't rely on defense. Trait emphasis: VKR, RKR putaway quality. Ideal: staff K/7 >= 10.0.
5. **Movement/Deception** - Weak contact through movement/speed changes. Trait emphasis: RKR movement, CKR location, IQKR sequencing. Ideal: GB% >= 48%, HR/7 <= 0.3.

---

# HITTER BADGES (17)

| Badge | Gate | Tier | Lift |
|-------|------|------|------|
| Golden Bat | BA >= .380, All-American | Gold | +1.5 |
| Power Surge | HR >= 20, ISO >= .250 | Gold | +1.5 |
| Speed Demon | SB >= 35, SB% >= 88% | Gold | +1.5 |
| Elite Slapper | Slap BA >= .400, bunt success >= 85%, SB >= 25 | Gold | +1.5 |
| Iron Glove | FPCT >= .990 at C/SS/CF, 40+ starts | Gold | +1.5 |
| Triple Crown | Leads conf in BA + HR + RBI | Gold | +1.5 |
| On-Base Elite | OBP >= .470 | Silver | +1.0 |
| Extra-Base Machine | 2B + 3B + HR >= 30 | Silver | +1.0 |
| Stolen Base King | SB >= 25, SB% >= 85% | Silver | +1.0 |
| Dual-Threat Slap | Slap BA >= .350 AND HR >= 5 | Silver | +1.0 |
| Clutch Performer | RISP BA >= .380, 10+ 2-out RBI | Silver | +1.0 |
| Defensive Anchor | FKR >= 85 | Bronze | +0.5 |
| Contact Machine | K% <= 10%, BA >= .320 | Bronze | +0.5 |
| RBI Producer | RBI >= 55 | Bronze | +0.5 |
| Baserunning Value | SB >= 15, 0-1 CS | Bronze | +0.5 |
| Versatility | 3+ positions started, FKR >= 70 each | Bronze | +0.5 |
| Two-Way Premium | Hitter KR >= 80 AND Pitcher KR >= 80 | Gold | +1.5 |

Cap: +3.5 KR max.

---

# PITCHER BADGES (13)

| Badge | Gate | Tier | Lift |
|-------|------|------|------|
| Workhorse | IP >= 300, ERA <= 2.00 | Gold | +1.5 |
| Strikeout Queen | K/7 >= 12.0, 200+ K | Gold | +1.5 |
| Perfect Game | Perfect game this season | Gold | +1.5 |
| Shutout Artist | 5+ shutouts | Gold | +1.5 |
| Tournament Ace | ERA <= 1.00 in 30+ tournament IP | Gold | +1.5 |
| No-Hitter | No-hitter this season | Silver | +1.0 |
| Command Elite | BB/7 <= 1.2, WHIP <= 0.80 | Silver | +1.0 |
| Win Machine | 30+ wins | Silver | +1.0 |
| Spin Master | 3+ quality spin pitches | Silver | +1.0 |
| Complete Game Machine | CG% >= 65% | Bronze | +0.5 |
| Ground Ball Artist | GB% >= 55% | Bronze | +0.5 |
| Fielding Pitcher | FPCT >= .980, 20+ assists | Bronze | +0.5 |
| Two-Way Premium | Pitcher KR >= 80 AND Hitter KR >= 80 | Gold | +1.5 |

Cap: +3.5 KR max.

---

# OVERRIDES

## Positive (College: max 1)
1. **Conference Tournament MVP** - +1.0 KR
2. **WCWS Performance** - ERA <= 1.00 in 15+ IP or BA >= .400 in 15+ AB at WCWS. +1.5 KR
3. **USA Softball / National Team** - +1.0 KR
4. **Olympics / World Championship** - +1.5 KR
5. **Record-Setting Performance** - School/conference/NCAA record. +1.0 KR

## Negative (Always apply)
1. **Postseason Collapse** - ERA >= 6.00 in 10+ postseason IP, or BA <= .150 in 15+ postseason AB. -1.0 KR
2. **Late-Season Fade** - Final 15 games production drops 30%+. -0.5 KR
3. **Disciplinary** - Public suspension. -0.5 to -2.0 KR

---

# SYSTEM RISKS

## Hitter (12)
**Tier 1 Major (-2.0 college / -4.0 pro):** Strikeout Liability (K% >= 28%), Defensive Black Hole (FKR < 55 at premium pos), Baserunning Catastrophe (CS >= 10, SB% < 65%), Complete Non-Factor (OPS < .550, FKR < 65, SKR < 55)
**Tier 2 Major (-1.5 / -2.5):** Power Void (ISO < .060 in Power/Launch system), Platoon Exposed (OPS split >= .250), Speed Void (SB = 0 in speed system), Slap Dependency (swing BA < .200 as slapper)
**Minor (-1.0):** Elevated K Rate (23-27%), Limited Range, Slow Starter (first 15 games 25%+ below season), One-Dimensional (one KR >= 85, all others <= 65)

## Pitcher (10)
**Tier 1 Major (-2.0 / -4.0):** Walk Machine (BB/7 >= 5.0), Home Run Prone (HR/7 >= 1.0), Fatigue Collapse (final-third ERA >= 2x first-two-thirds), Injury Bomb (2+ significant arm injuries)
**Tier 2 Major (-1.5 / -2.5):** Second-Time-Through Collapse (2nd TTO ERA >= 2x first), Platoon Exploitable (OPS split >= .200), One-Pitch Dependent (70%+ K on one pitch)
**Minor (-1.0):** Elevated Walk Rate (BB/7 3.5-4.9), Fly Ball Tendency (FB% >= 45%), Inconsistency (ERA stdev >= 3.0 across starts)

---

# IMPACT MODIFIERS

## Hitter (max 1)
1. **Primary Offensive Engine** - Most important lineup hitter. OPS drops 80+ pts without her.
2. **Secondary Engine** - Second-most important. Protects Primary Engine.
3. **Force Multiplier** - Makes others better through lineup protection/baserunning pressure.
4. **Specialist Anchor** - Irreplaceable specialist (elite catcher, premium SS defense).
5. **Slap Catalyst** (SOFTBALL-SPECIFIC) - Changes entire defensive alignment when at plate. Presence improves teammates' production.

## Pitcher (max 1)
1. **Primary Staff Anchor** - Staff identity built around her arm.
2. **Workhorse** - 300+ IP, keeps rest of staff fresh.
3. **Tournament Ace** - Elevates in postseason/elimination games.
4. **Depth Arm** - Critical depth for ace rest games.
5. **Matchup Weapon** - Contrasting style from ace (lefty vs righty, spin vs power).

---

# KLVN / LEGENDS / PRO - CROSS-REFERENCES

KLVN: College_Softball_KLVN_Lambdas_v1.md, Pro_Softball_KLVN_Lambdas_v1.md
Legends: Legend_NCAA_D1_Softball_v1.md through Legend_NJCAA_D3_Softball_v1.md
Pro Legend: Pro_Softball_KR_Legend_v1.md

---

## GOVERNANCE
- All weights, bands, gates, triggers are v1 provisional
- Slap hitting traits are first-class and NOT optional
- Pitcher workload calibrated to softball norms (250-350 IP)
- Any change requires versioning
