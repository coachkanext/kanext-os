# KaNeXT StatKeeper — Product Spec v1
### Developer Handoff Document
### March 26, 2026

---

## WHAT THIS IS

A live basketball stat-tracking app that runs on iPad/iPhone during games. A manager, parent, coach, or player taps events as they happen. The app produces a complete box score with per-player attribution, play-by-play log, and structured data output that feeds directly into the KaNeXT Basketball Intelligence pipeline.

This replaces the need for a dedicated stat crew, paid services like Hudl or Synergy, or manual scorebooks. It gives every school — including NAIA, NJCAA, USCAA, NCCAA programs that currently have NOTHING — professional-grade statistics from day one with zero cost and zero infrastructure beyond a phone or tablet.

An existing prototype was built by Ryan Diew for Lincoln University games. This spec defines the production version for KaNeXT OS.

---

## WHO USES IT

**Primary:** Team manager sitting courtside with an iPad. Taps events in real time during the game.

**Secondary:** Assistant coach on the bench. Parent in the stands. Player tracking their own pickup game.

**Tertiary:** The app can run alongside a camera recording the game. The human-tagged data becomes training/validation data for the CV layer that will eventually automate this entirely.

---

## PRIOR ART (Ryan's Prototype)

What exists today (from screenshots):

- Three-panel iPad landscape layout
- Left panel: Make/Miss buttons for 3pt, 2pt, 1pt (free throw)
- Center panel: Scoreboard (digital clock font), game state (Pre-Game / 1st Half / 2nd Half), play-by-play feed scrolling with event cards
- Right panel: def reb, off reb, to, stl, ast, blk, Sub, Foul buttons
- Player selection: 3x3 grid of player circles per team showing jersey number + first name. Teal/green = home team, blue/steel = away team. "--" + "Team" for unattributed events.
- Substitution flow: Court/Bench split view, tap bench player → tap "Sub" → swap
- Play-by-play cards show: event type (2PT Make, Turnover, Substitution), player name + number, running player stats (PTS, FLS), running team stats (FG count + %)
- Undo button for corrections
- Exit button

What works: The core input loop is fast and clean. Tap player → tap event → logged. That's the right pattern.

---

## V1 SPEC — WHAT TO BUILD

### Game Setup

**Create Game:**
- Home team name (text input, or select from saved teams)
- Away team name (text input, or select from saved teams)
- Game type: Regular Season / Conference / Tournament / Scrimmage / Pickup
- Half length: 20 min (college) / 16 min (HS) / custom
- Date/time (auto-populated, editable)

**Team Roster:**
- Load saved roster OR create new
- Per player: Jersey number (required), First name (required), Last name (required), Position (PG/SG/SF/PF/C, optional)
- Set starting 5 by tapping players
- Bench players listed below
- "Team" option for unattributed events (opponent team stats when you don't know who scored)

**Pre-game state:** Both rosters set, starting lineups confirmed, tap "Start Game" to begin.

### Live Game Interface

**Layout: Three-panel (iPad landscape) / Stacked (iPhone portrait)**

**Panel 1 — Shot Input (Left):**

| Make (green outline) | Miss (red outline) |
|---|---|
| 3pt | 3pt |
| 2pt | 2pt |
| 1pt (FT) | 1pt (FT) |

- Tap Make or Miss AFTER selecting the player
- Green = made shot, Red = missed shot
- Each tap logs: player_id, shot_type (3/2/1), result (make/miss), timestamp, game_clock, period

**Panel 2 — Game State + Play-by-Play (Center):**

Top:
- Scoreboard: Home Team [score] — Away Team [score]
- Period indicator: 1st Half / 2nd Half / OT1 / OT2
- Game clock: MM:SS (running clock, tap to pause/resume, manual adjustment)
- Icons: Timer settings, Roster/Sub button, Info

Feed (scrolling, newest on top):
- Each event is a card showing:
  - Event type (colored label): 3PT MAKE (green), 2PT MISS (red), REBOUND (blue), TURNOVER (orange), STEAL (teal), ASSIST (purple), BLOCK (navy), FOUL (pink), SUBSTITUTION (gray)
  - Player: "#[number] [First] [Last]"
  - Running stats: "[X] PTS · [Y] FLS" for the player
  - Team context: "Team: [FGM]/[FGA] FG ([FG%])" or "Team: [X] TO"

**Panel 3 — Event Input (Right):**

| def reb | off reb |
|---|---|
| to | stl |
| ast | blk |
| Sub | Foul |

- Each button requires a player to be selected first (except "Team" attribution)
- Sub opens the substitution overlay
- Foul opens foul type selector: Personal / Shooting / Offensive / Technical / Flagrant

**Player Selection (Bottom or overlay):**

- Active roster (on-court players) shown as tappable circles
- Jersey number large, first name below
- Home team = one color, Away team = different color
- Currently selected player has a highlight ring
- Tap player → then tap event → logged
- OR tap event first → then app prompts for player

**Key interactions:**
- **Undo:** Single tap undoes last event. Hold opens undo history (last 5 events).
- **Edit:** Long-press any play-by-play card to edit or delete it.
- **Timeout:** Button in game state area. Logs timeout with team + timestamp.
- **End Period:** Button appears at period end. Confirms, advances to next period.
- **End Game:** Final buzzer. Confirms, locks game, generates box score.

### Substitution Flow

- Tap "Sub" button
- Overlay shows Court (left) and Bench (right) for the relevant team
- Tap a bench player, tap a court player → they swap
- Multiple subs can be made before dismissing
- Each sub logged with timestamp + game clock
- Minutes tracking: system computes minutes per player from sub timestamps

### Data Captured Per Event

Every event is a structured record:

```json
{
  "event_id": "uuid",
  "game_id": "uuid",
  "timestamp": "ISO-8601",
  "game_clock": "MM:SS",
  "period": 1,
  "team_id": "home|away",
  "player_id": "uuid|null",
  "player_number": 11,
  "event_type": "shot|rebound|turnover|steal|assist|block|foul|substitution|timeout",
  "event_subtype": "3pt|2pt|ft|offensive|defensive|personal|shooting|technical|flagrant|null",
  "result": "make|miss|null",
  "linked_event_id": "uuid|null"
}
```

**Linked events:** An assist links to the made shot it assisted. A steal links to the turnover it caused. A block links to the missed shot. This enables advanced stat computation downstream.

### Box Score Output

At game end (or queryable during game), the app computes per player:

**Basic:**
- MIN (from substitution timestamps)
- PTS
- FGM / FGA / FG%
- 3PM / 3PA / 3P%
- FTM / FTA / FT%
- OREB / DREB / REB
- AST
- STL
- BLK
- TO
- PF (personal fouls)
- +/- (if lineup tracking is accurate enough)

**Team totals:** Sum of all player stats + team-attributed events.

**Derived (computed from basic):**
- TS% = PTS / (2 × (FGA + 0.44 × FTA))
- eFG% = (FGM + 0.5 × 3PM) / FGA
- AST/TO ratio
- 2PM / 2PA / 2P% (derived from FG - 3P)

### Data Export

**Formats:**
- JSON (structured, feeds pipeline directly)
- CSV (for spreadsheet users)
- PDF box score (printable, shareable)
- KaNeXT Intelligence format (structured for trait pipeline ingestion)

**Sync:**
- Local storage first (works offline — gyms often have bad WiFi)
- Syncs to KaNeXT cloud when connection available
- Game data feeds into KaNeXT OS Hub tile for the brand/school
- Box score auto-publishes to the school's KaNeXT page

---

## PIPELINE CONNECTION

The box score data this app produces maps directly to the Trait Library's PROXY scoring rules:

| App Output | Pipeline Input | Traits Scored |
|---|---|---|
| 3PM, 3PA, 3P% | 3PT Spot-Up (PROXY) | Shooting cluster |
| FTM, FTA, FT% | Free Throw (TRUE) | Shooting cluster |
| FGA, 2PA | Rim Pressure (PROXY) | Finishing cluster |
| FTA, FTA/FGA | Foul Draw (PROXY) | Finishing cluster |
| AST, AST% | Advantage Creation (PROXY), Passing Vision (PROXY), Passing Execution (PROXY) | Playmaking cluster |
| TOV, TO% | Ball Security (PROXY) | Playmaking cluster |
| STL, STL% | Multiple POA Defense traits (PROXY) | Defense cluster |
| BLK, BLK% | Rim Protection (PROXY) | Defense cluster |
| OREB, DREB, REB% | All Rebounding traits (PROXY) | Rebounding cluster |
| Height, Weight (from roster) | Height (TRUE), Strength (PROXY) | Tools cluster |
| MIN (from subs) | Endurance (PROXY), Motor (PROXY) | Tools cluster |

With linked events (assist → shot, steal → turnover), we can also compute:
- AST/TO ratio (Playmaking)
- Stocks (STL + BLK combined defensive value)
- Usage% (estimated from FGA + FTA + TO share of team possessions)

**This gets ~25-30 of 47 traits scored from a single game's manual stat tracking.** The remaining ~17-20 traits require play-type video tagging (spot-up vs pull-up, contact finishing, transition plays, defensive scheme execution, IQ decisions) — that's what the CV layer eventually provides.

---

## DESIGN SYSTEM

Follow KaNeXT OS design tokens:

- Background: #F5EFE4
- Surface: #EDE5D8
- Label: #1A1714
- Accent: #D97757 (Claude coral)
- Green (makes/positive): #5A8A6E
- Red (misses/negative): #B85C5C

Dark mode:
- Background: #1C1410
- Surface: #261D17
- Label: #F0E8DC
- Accent: #E08B6A

**Typography:** System font, monospace for scoreboard/numbers (like Ryan's prototype — the digital clock look is good).

**Player circles:** Team-colored background, white jersey number (large), player first name below (small). Selected state = accent color ring.

**Event buttons:** Circle shape, outlined (not filled), text label inside. Make = green outline. Miss = red outline. Stats = accent outline.

---

## PLATFORM

**Primary:** iPad (landscape) — the courtside stat-keeping use case
**Secondary:** iPhone (portrait) — stacked layout, same functionality
**Framework:** React Native or Swift (whichever KaNeXT OS is building in)
**Offline-first:** All data stored locally. Sync when connection available.
**No account required to start:** Open app → create game → go. Account connects later for sync/pipeline.

---

## V2 ADDITIONS (NOT IN THIS BUILD)

These are noted for context but NOT part of the V1 spec:

- **Shot chart:** Tap location on court diagram for shot zone tracking (rim/paint/midrange/3PT corner/wing/top). This would upgrade several PROXY traits to near-TRUE.
- **Lineup tracking:** Track which 5 players are on court at all times for +/- and lineup analysis.
- **Live streaming integration:** Stat overlay on KayTV stream.
- **Multi-sport:** Same input pattern adapted for volleyball, soccer, football, baseball via Sport Truth Adapters.
- **CV companion mode:** Camera records game while human tags stats. CV processes film post-game. Human tags validate/train CV model. Discrepancies flagged for review.
- **Nexus integration:** "Ask Nexus about this game" — conversational postgame analysis powered by the box score data.
- **Play-type tagging:** Optional manual tags (transition/halfcourt, PnR/iso/spot-up, etc.) for coaches who want deeper data. Each tag moves a trait from PROXY to TRUE.

---

## WHAT SUCCESS LOOKS LIKE

A team manager at an NAIA school opens the app on an iPad before tipoff. Sets the rosters (saved from last game). Taps "Start Game." For the next 40 minutes, they tap player → event for every possession. When the buzzer sounds, they tap "End Game."

Within 30 seconds, every player on both teams has a complete box score. The school's KaNeXT page shows the game result with full stats. The intelligence pipeline ingests the data and updates every player's KR. The coach can open Nexus and ask "How did our defense perform tonight?" and get a real answer based on real data.

That school had NOTHING before. No stats. No scouting. No film analysis. Now they have a professional-grade statistical record of every game, feeding an intelligence system that evaluates their players on the same scale as Duke and Kentucky.

That's the product.
