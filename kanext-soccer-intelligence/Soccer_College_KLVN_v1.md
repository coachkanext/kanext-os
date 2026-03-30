# SOCCER KLVN -- COLLEGE LEVEL NORMALIZATION

KLVN -- College Soccer Level Normalization Ladder + D1 Conference Class Mapping
Status: Canonical (Active)
Scope: Production normalization + cross-level KR translation using a single per-level lambda (lambda_level[L]).

## 1) Purpose (Locked)
KLVN exists to ensure player performance is comparable across competitive environments and to prevent level/pace/sample-size effects from distorting evaluation. KLVN performs normalization only and does not rank, value, or project players.

## 2) Determinism (Locked)
KLVN is fully deterministic: identical inputs must produce identical outputs.

## 3) Canonical Level Order (by lambda weight)
Rule: Higher lambda = higher competition density (harder environment).
Note: "professional" is intentionally excluded in v1 college lambdas. Pro lambdas live in the Pro KLVN file.

| Rank | Level Key | Lambda |
|------|----------|--------|
| 1 | ncaa_d1_high_major | 1.000 |
| 2 | ncaa_d1_mid_major | 0.958 |
| 3 | ncaa_d1_low_major | 0.917 |
| 4 | ncaa_d2 | 0.875 |
| 5 | njcaa_d1 | 0.833 |
| 6 | naia | 0.810 |
| 7 | cccaa | 0.765 |
| 8 | njcaa_d2 | 0.750 |
| 9 | ncaa_d3 | 0.667 |
| 10 | njcaa_d3 | 0.625 |
| 11 | uscaa | 0.583 |
| 12 | nccaa_d1 | 0.542 |
| 13 | nccaa_d2 | 0.500 |
| 14 | hs_prep_postgrad | 0.450 |

## 4) D1 Conference Class Mapping (Required for KLVN)

Goal: deterministically assign NCAA D1 soccer programs to High / Mid / Low so they map into the correct KLVN level keys.

### 4.1 Season-scoped rule (Locked)
Conference realignment changes over time, so the D1 Conference Class mapping is season-scoped:
d1_conference_class_map[season_id][conference_key] = {high|mid|low}

For KLVN v1 (starting 2025-26), use the following baseline lists for men's soccer:

**High-Major (HM) conferences:**
- ACC
- Big Ten
- Big 12 (where soccer is sponsored)
- SEC (where soccer is sponsored)
- Big East
- Pac-12 (where applicable post-realignment)

Note: College soccer conference membership does not always mirror basketball. Some conferences sponsor men's soccer and others do not. The mapping must use the actual conference the soccer program competes in, not the school's primary athletic conference.

**Mid-Major (MM) conferences:**
- American Athletic (AAC)
- Atlantic 10 (A-10)
- West Coast (WCC)
- Mountain West (MWC)
- Missouri Valley (MVC)
- Colonial Athletic (CAA)
- Sun Belt (where soccer is sponsored)
- Conference USA (where soccer is sponsored)
- Horizon League
- Southern Conference (SoCon)

**Low-Major (LM) conferences:**
- All other D1 conferences not in HM or MM

### 4.2 Level key assignment rule (Locked)
If governing_body = NCAA and division = D1:
- If conference is in HM list -> level_key = ncaa_d1_high_major
- Else if conference is in MM list -> level_key = ncaa_d1_mid_major
- Else -> level_key = ncaa_d1_low_major

If conference is missing/unknown:
- Require manual d1_major_class input for that team-season or block KLVN assignment until resolved.

### 4.3 Soccer-Specific Conference Notes
- Many D1 schools do not sponsor men's soccer (especially in the SEC and Big 12). The HM/MM/LM classification applies only to schools that actually compete in D1 men's soccer.
- Some schools compete in different conferences for soccer than for their primary sport (e.g., a Big 12 school might play soccer in a different conference if the Big 12 does not sponsor men's soccer).
- Always verify the actual soccer conference, not the school's primary athletic conference.

## 5) Application Rule (v1 Simplification)
KLVN v1 simplification (Locked):
- Use lambda_level[L] as a single multiplier applied uniformly across production-derived translation needs.
- Future KLVN v2 may expand to lambda[S,L] by metric (goals vs assists vs defensive actions, etc.).

## 6) Governance / Change Control (Locked)
Any change to:
- level definitions
- lambda constants
- D1 conference class lists / mapping table
- normalization logic
requires documentation, versioning, and explicit approval.

## 7) CRITICAL CLARIFICATION -- KR IS UNIVERSAL, NOT LEVEL-CONVERTED

KLVN lambda normalizes INPUTS (production stats) during evaluation so that trait scoring is comparable across levels. It does NOT convert KR OUTPUTS from one level to another.

A player's KR is a single universal number. It does not change based on what level you're viewing from. There is no "HM-equivalent KR" or "MM-equivalent KR." The KR is the KR.

What changes across levels is the LEGEND INTERPRETATION of that KR. Each level has its own legend with different tier labels at different KR ranges. A KR of 85 maps to different tier labels at different levels:
- At D1 HM: 83-85 = Reliable Bench / Rotation Contributor
- At D1 MM: 86-89 = High-Impact Starter
- At D1 LM: 84-86 = High-Impact Starter
- At D2: 85-89 = Franchise Anchor / Top D2 All-American
- At NAIA: 82-85 = Franchise Anchor / Top NAIA All-American

One player. One KR. Multiple legend reads depending on level context.

HOW KLVN LAMBDA IS CORRECTLY USED:
- During evaluation: lambda adjusts raw production stats before trait scoring so that 15 goals at NAIA is not treated the same as 15 goals at D1 HM
- During legend interpretation: the player's KR is read against EACH level's legend to show what that number means at every level (the Level Tier Map in the Development Engine)

HOW KLVN LAMBDA IS INCORRECTLY USED:
- DO NOT multiply a player's KR by lambda to create a "translated" KR at another level
- DO NOT report separate KR numbers for different levels (e.g., "85 MM / 81 HM")
- The KR is computed once, at the player's home level, using lambda-normalized inputs. That number is final and universal.

## 8) Cross-Level Example

Player A: 12 goals at D1 HM (lambda 1.000)
Player B: 18 goals at NAIA (lambda 0.810)

After lambda normalization, Player B's 18 goals normalize closer to ~14.6 goals at HM-equivalent competition. Player A's 12 goals stay at 12. The trait scores and final KRs reflect this -- but the KR itself is universal. Both players get one KR each, read against every legend.
