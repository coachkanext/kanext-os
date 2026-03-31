# SCOUTING CONFIDENCE GATES

Scouting Confidence Gates -- Women's Soccer v1 (Locked Tables)

Purpose
Confidence% communicates evidence completeness + reliability for scouting (prematch) and postmatch analysis. Does not change any scouting content or KR values -- it qualifies reliability only.

## Data Tier Reference

| Tier | Definition |
|---|---|
| V1 -- Stats-Only | Basic match stats, roster, season totals. No event data. |
| V1+ -- Stats + Advanced | V1 + xG, xA, progressive stats, pressures. |
| V2 -- Event Data (1 Season) | Opta/StatsBomb/Wyscout tagged events. Full play-type data. |
| V3 -- Event Deep (Multi-Season) | Multi-season event data + tracking data + film archive. |

Women's Soccer Data Availability Note:
- NWSL and WSL have V1+ coverage via FBref and American Soccer Analysis
- Liga F, D1F, Frauen-BL have growing V1+ coverage
- College women's soccer is overwhelmingly V1 (box-score only)
- Event-level (V2) and tracking (V3) data is less widely available in women's soccer than men's

## Scout Confidence Gate (Prematch)

| Data Available (Opponent) | Scout Confidence % |
|---|---|
| V1 stats-only: season totals + roster | 42-58% |
| V1 stats-only + multi-year (stable identity) | 48-62% |
| V1+ advanced metrics: xG/xA + progressive stats (1 year) | 58-72% |
| V1+ advanced + multi-year | 65-78% |
| V2 event data (1 season): 5+ matches processed | 70-83% |
| V2 event data high coverage: 10+ matches + stable XI | 76-88% |
| V3 multi-season event + tracking + film archive | 83-93% |

Note: Confidence ranges are slightly lower than men's soccer due to generally lower data availability in women's game.

## Scout Confidence Adjusters
- Sample size: fewer than 5 current-season matches -> bottom of range
- Recency: last 3 matches show clear shift -> downshift 5-10 pts
- Managerial change: new manager within last 5 matches -> downshift 10-15 pts
- Roster volatility: transfer window activity, NWSL free agency churn -> downshift 5-10 pts
- System ambiguity: OSIE/DSIE provisional -> downshift 5-10 pts
- National team window: key players absent for international duty -> downshift 5-8 pts
- Multi-match continuity: prior match against same opponent -> upshift 3-5 pts

## Postmatch Confidence Gate

| Data Available (Postmatch) | Postmatch Confidence % |
|---|---|
| V1 stats-only: final stats + basic splits | 42-58% |
| V1 + manual staff tags (key actions logged) | 52-68% |
| V1+ advanced metrics: xG, shot maps, passing networks | 62-78% |
| V1+ + multi-match trend context | 68-83% |
| V2 event data: full tagged match + clip list | 76-88% |
| V2 + high completeness | 83-91% |
| V3 multi-season context + film archive | 86-95% |

---

# MATCH OPS -- FULL SCOUTING INTELLIGENCE FLOW

## Global Rules (Apply to All 4 Phases)

Determinism: Same inputs -> same packet sections + ordering + outputs.
No Truth Mutation: Match Ops references Player/Team Truth but never recomputes.

Time Anchors:
- Prematch: generated T-24h to T-0h (refreshable)
- In-Match: live updates each stoppage/dead ball
- Halftime: generated once at halftime whistle
- Postmatch: generated once after final whistle

Universal Output Fields (every packet):
- match_id, teams, date_time, venue, home_away_neutral
- data_tier (V1 / V1+ / V2 / V3)
- confidence_pct for that phase
- trace_notes (missing/assumed inputs)

Multi-Match Opponent Continuity: If prior match against same opponent exists, MUST reference it.

---

## 1. Prematch Scout Packet

### 1.1 Inputs -- MUST PULL (read-only)

(Identical to men's soccer. See men's File 05 for complete input list.)

Women's-specific additions:
- National team absentees: which key players are away on international duty?
- Pregnancy/maternity return context: any players recently returned (suppression detection)?
- ACL recovery context: any players in return-to-play phase?

### 1.2 Outputs -- MUST OUTPUT (Ordered)

(Identical output structure to men's soccer: A) Opponent Offensive Identity, B) Shot Profile, C) Build-Up Patterns, D) Set Piece Threat Assessment, E) Defensive Identity, F) Key Player Threat Matrix, G) Matchup Recommendations, H) Simulation Projection.)

Women's-specific additions to Section D (Set Piece Threat Assessment):
- GK height/reach assessment (average women's GK is shorter, set pieces are proportionally more dangerous)
- Corner delivery quality relative to defending team's aerial ability
- Near-post / far-post vulnerability analysis given height profiles

---

## 2. In-Match Live Ops

(Identical to men's soccer. Same staff roles, same 6 panels, same anti-spam rules. See men's File 05.)

Women's-specific addition:
- Panel 7 (optional): ACL Risk Monitor -- tracks high-fatigue minutes for players with prior ACL history. Flags when minutes exceed coach-set threshold.

---

## 3. Halftime Staff Packet

(Identical to men's soccer. Same A-K output structure. See men's File 05.)

---

## 4. Postmatch Staff Packet

(Identical to men's soccer. Same 11-item output structure. See men's File 05.)

Women's-specific addition to Item 11 (Next Actions):
- YNT window check: any players likely to be called up for upcoming international window?
- Pregnancy/return tracking: update return-to-play progression for any affected players

### 4.2 KR Update Trigger
(Identical to men's soccer. After postmatch packet, player and team KRs recalculate with new match data.)

---

## GOVERNANCE NOTE
Match Ops is produced by Nexus. No manual override. Staff tagging enhances but does not override. Match Ops consumes truth from upstream -- it does not produce or modify truth.
