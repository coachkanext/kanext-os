---
name: KaNeXT Basketball Intelligence
description: >
  Use this skill for ANY basketball intelligence request including: player evaluation, team evaluation, KR rating, simulation, matchup analysis, scouting, game ops, development planning, transfer portal evaluation, pro projection, draft analysis, legend calibration, roster construction, scholarship/NIL allocation, or any reference to the KaNeXT intelligence system, Nexus, KR, KLVN, archetypes, system fit, or the evaluation pipeline.
---

# KaNeXT Basketball Intelligence — Master Skill

## HOW THIS WORKS
The basketball intelligence system is split across 6 knowledge files + this skill. Each file has a specific job. You route to the right file(s) based on what's being asked.

**CRITICAL:** File 02 (Reference) is 272K characters. NEVER load the whole thing. Search it for specific sections using the search terms below.

## ROUTING TABLE

### "Evaluate this player" / "What's his KR?" / "Rate [player]"

**FIRST: Determine the data tier.** If evaluating from box score + advanced composites (no play-type data, no PlayVision), this is V1. Most evaluations of real players using public data are V1.

**V1 evaluations (box score + composites):**
→ Search **File 01** for "V1 EVALUATION PROTOCOL" and follow the 5-step method:
  1. Set Coach Context
  2. Phase 3 — Production Anchor (map stats/role against legend tiers)
  3. Phase 6 — OPF math with composite bounding + proxy confidence weighting
  4. Phase 6 adjusts within Phase 3 ±10
  5. Final KR output
→ Search **File 02** for specific reference lookups as needed during evaluation (legends, trait bands, OPF weights)

**V1+/V2/V3 evaluations (play-type data or PlayVision available):**
→ Search **File 01** for the standard pipeline steps (Master Execution Flow)
→ Search **File 02** for specific lookups during evaluation:
  - Trait scoring: search "Shooting Cluster" or "Finishing Cluster" or [cluster name]
  - Archetype assignment: search "ARCHETYPE LIBRARY"
  - Badge check: search "BADGES"
  - Override check: search "OVERRIDES"
  - Risk check: search "SYSTEM RISKS"
  - Level normalization: search "KLVN"
  - Final interpretation: search "COLLEGE PLAYER KR LEGENDS" or "PRO PLAYER KR"
  - Impact modifiers: search "IMPACT MODIFIERS"
  - System demands: search "SYSTEM DEMAND PROFILES"

### "Evaluate this team" / "Team KR" / "Roster analysis"
→ Search **File 03** (Team Intelligence) for "Team KR" pipeline
→ Requires player KRs as input (run Mode 1 first if needed)

### "Simulate [A] vs [B]" / "Who wins?" / "Matchup analysis"
→ Search **File 04** (Simulation Engine) for interaction tables + simulation math
→ Requires team identities as input

### "Scout [opponent]" / "Pregame report" / "Halftime" / "Postgame"
→ Search **File 05** (Scouting & Game Ops) for the relevant phase

### "Where should [player] transfer?" / "Development plan" / "Portal eval"
→ Search **File 06** (Downstream Engines) for "Development Intelligence"
→ Requires player KR as input

### "Should [player] go pro?" / "Draft projection" / "Pro KR"
→ Search **File 06** (Downstream Engines) for "Pro Transition"
→ Search **File 02** for pro-specific tables (Pro Player KR Legend, pro badge gates, pro risks)

### "What does an [X] KR mean?" / "Calibrate the legend" / "Test labels"
→ Search **File 02** for the relevant legend section
→ For calibration: also use web search for real player data to compare against

### "What system does [team] run?" / "OSIE" / "DSIE"
→ Search **File 03** for "Offensive System Inference" or "Defensive System Inference"

### "Scholarship" / "NIL" / "PTV" / "PMV" / "What's he worth?"
→ Search **File 03** for "Scholarship" or "NIL Allocation" or "PTV"

### "Roster construction" / "Who should we recruit?" / "Roster decision"
→ Search **File 03** for "Roster Decision Intelligence"

### "Coaching impact" / "Does this coach develop players?"
→ Search **File 06** for "Coaching Impact Modifier"

## UNIVERSAL RULES (Apply to EVERY response)
1. **Deterministic:** Same inputs → same outputs. No randomness.
2. **No fabrication:** Missing data = UNSCORED. Never guess.
3. **Confidence always shown:** Every output includes confidence %.
4. **Downstream never modifies upstream:** Dev engine, pro transition, scouting — they consume Player KR and Team KR but NEVER change them.
5. **KLVN always applies:** Cross-level comparisons use lambda normalization.
6. **Legends are display-only:** They interpret KR. They don't produce KR.
7. **Web search for current data:** Always search for current stats/awards when evaluating real players. The knowledge files contain the SYSTEM — web search provides the DATA about specific players.

## FILE INVENTORY
| # | File | Size | Contents |
|---|------|------|----------|
| 01 | Player Eval Process | 37K | Pipeline steps, Contextual Mode, Suppression, Confidence Gate |
| 02 | Player Eval Reference | 272K | Traits, Archetypes, Demands, Badges, Overrides, Risks, KLVN, Legends, OPF |
| 03 | Team Intelligence | 127K | Team KR pipeline, OSIE/DSIE, Team Legends, Scholarship/NIL, Roster Intelligence |
| 04 | Simulation Engine | 211K | Interaction Library (582 entries), Simulation math, Physical Mismatch |
| 05 | Scouting & Game Ops | 20K | Confidence Gates, 4-phase Game Ops flow |
| 06 | Downstream Engines | 46K | Development Engine, Pro Transition Engine, Coaching Impact Modifier |
