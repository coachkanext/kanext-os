# KStat - Live Data Capture Engine

## What KStat Is

KStat is the real-time stat tracking system inside KaNeXT OS. It lives in Dashboard > Game Day in Athletics mode. Every tap a stat keeper makes during a live game feeds the intelligence system, the coaching staff, the broadcast, and the fan experience simultaneously. One tap creates seven downstream outputs.

KStat is not a scorekeeping app. GameChanger is a scorekeeping app. KStat is a data capture layer that turns live athletic events into structured intelligence. The difference is what happens after the stat is entered. In GameChanger, a stat becomes a box score. In KStat, a stat becomes a KR update, a halftime coaching packet, a postgame media report, a live broadcast overlay, a recruiting data point, a development tracking input, and a financial trigger for play-based pledges. One tap, seven systems.

## The Problem KStat Solves

The invisible athlete problem is the foundational gap in college athletics below the Power Five. There are over 500,000 college athletes in the United States. Fewer than 10% play at programs with dedicated analytics staff, professional stat tracking, or video analysis infrastructure. The remaining 90% play at programs where stats are kept on paper, entered into spreadsheets after games, and never connected to anything downstream. Their production data exists in fragments that no system can consume.

This means 450,000+ athletes are invisible to the intelligence system. Their stats do not exist in a form that can be evaluated, compared, or projected. Their coaches cannot generate scouting reports because opponent data is equally fragmented. Their fans cannot follow games in real time because there is no live data feed. Their SIDs (Sports Information Directors) - if the program even has one - spend hours manually producing box scores and recaps that a system could generate in seconds.

KStat solves this by making data capture so simple that any student manager, volunteer parent, or operations assistant can do it during a live game. Two taps: select player, select stat. No training required. No analytics background needed. The system handles everything downstream.

## How It Works

KStat operates in three phases during every game.

**Setup.** Select home and away teams (auto-populated from Roster if it is your game). Choose game type: Regular Season, Conference, Tournament, or Scrimmage. Set half length. Tap players to toggle starter/bench status. The game starts when both teams have exactly five starters marked.

**Live Tracking.** Portrait mode, designed for one-handed operation on the bench. Scoreboard at top shows home score, away score, period, and game clock with play/pause controls. Player selection row displays numbered circles for home and away players. The selected player is highlighted. Stat buttons below: 3pt make/miss, 2pt make/miss, FT make/miss, DefReb, OffReb, TO, STL, AST, BLK, Sub, Foul. Two-tap flow: tap player, tap stat. No confirmation dialogs during live play. Play-by-play feed shows the last three entries. Undo button for corrections. Substitution overlay shows On Court and Bench columns for tap-to-swap. Foul overlay offers Personal, Shooting, Offensive, Technical, and Flagrant options.

**Box Score.** Auto-generated from live data. Final score, full stat table per team with every standard stat column, team totals, horizontal scroll with player names fixed. Export to JSON, CSV, or PDF.

## The Seven Downstream Outputs

Every stat tap creates data that flows to seven systems simultaneously.

**1. Live Box Score.** Updates automatically during the game. Coaches on the bench see real-time stats on their phone or tablet. No waiting for halftime printouts.

**2. Halftime Staff Packet.** At the halftime buzzer, Dipson auto-generates a coaching packet using first-half KStat data and the intelligence files. Contents include a top-3 decision summary (problem-to-adjustment format), game state dashboard (score, pace, fouls, turnovers, points per possession), Five Factors analysis (eFG%, turnover rate, offensive rebounding rate, free throw rate, transition), plan adherence check against the pregame scouting report, opponent offensive and defensive analysis, lineup and matchup data with plus-minus, and an adjustments sandbox with 2-5 defensive and 2-5 offensive options ranked by projected impact. Delivered to coaching staff through Dipson or Messages. Confidence percentage based on data tier.

**3. Postgame Staff Packet.** At the final buzzer, Dipson auto-generates a full postgame analysis: complete box score with advanced stats, Five Factors final, plan adherence audit, opponent analysis, lineup analysis (every combination with plus-minus and minutes), player grades against expectations, teaching clips auto-tagged (top 5 positive moments, top 5 correctable moments linked to Film Room if the game was recorded), development notes, and a preview of the next opponent. Archived for season-long trend tracking.

**4. Media Game Report.** Dipson auto-generates an ESPN-style game recap in professional sports writing tone. Headline, game summary paragraph, player of the game with context, key stats comparison table, and simplified box score. Publishing options: auto-post to Social, share to KTV as graphic overlay, export PDF for media distribution, email to local media contacts. School SID can review before publishing, or programs without an SID can set it to auto-publish. This eliminates the SID bottleneck for small programs that cannot afford dedicated media staff.

**5. Live Broadcast Overlay.** During games broadcast on KTV, KStat feeds the live score overlay, player stat graphics, and play-by-play updates to the broadcast in real time. Fans watching on KTV see an ESPN-quality production powered by one person tapping a phone.

**6. Intelligence System Feed.** Every game's data flows into the KaNeXT Intelligence pipeline. Player KR updates after every game based on new production data. Team KR recalculates. System identity (OSIE/DSIE) refines at five-game checkpoints. BPR (Basketball Performance Rating) computes per-game impact. The more games tracked through KStat, the more accurate every evaluation becomes. This is the data flywheel: KStat captures data, the intelligence system consumes data, intelligence quality improves, the product becomes more valuable, more programs adopt KStat.

**7. Financial Triggers.** Play-based pledges in the Booster tile auto-resolve from KStat data. A fan who pledged "$2 per three-pointer" sees their pledge auto-charged through KPay when the final buzzer sounds. Fan Challenges (prediction games between fans) auto-resolve using the same data. No human intervention needed because the stat data is live and structured.

## Multi-Sport Expansion

KStat follows the same two-tap architecture across every sport with sport-specific stat button configurations. The build order reflects market priority and technical complexity.

Phase 1: Basketball (complete). Phase 2: Soccer and Flag Football. Phase 3: Volleyball, Hockey, and Lacrosse. Phase 4: Golf, Tennis, Track and Field, Cheerleading/STUNT, and Swimming and Diving. Phase 5: Football and Baseball. Phase 6: Wrestling and Boxing.

14 build specifications covering 26 sport configurations are complete. Each sport loads its own stat button layout, scoring rules, and period structure while sharing the same underlying data pipeline and downstream output architecture. Adding a new sport is a configuration problem, not an architecture problem.

## The Data Tier Ladder

KStat creates a natural upgrade path that compounds data value over time.

V1 (Stats-Only) is where every program starts. Public box scores, roster data, season stats. Production-based KR evaluations. Available for every organized program, even those not on the KaNeXT platform, through public data scraping.

V1+ (Licensed Granular) adds third-party play-type data when available. Fuller evaluations possible but KaNeXT does not own the data.

V2 (KVision - 1 Season) is what programs get when they join KaNeXT and deploy cameras. KaNeXT-owned data: full play-type tagging, actual usage tracking, matchup data, spatial analysis. Full KR evaluations with high confidence. First year on the platform.

V3 (KVision Deep - Multi-Season) is what programs get when they stay. Multiple seasons of owned data create trend analysis, pattern recognition, historical comparison, and the highest confidence evaluations. The intelligence compounds.

V1 is free. V2 requires KaNeXT. V3 requires loyalty. Each tier produces meaningfully better intelligence, creating natural lock-in through data depth rather than contracts.

## Competitive Landscape

**GameChanger** (DICK'S Sporting Goods). Free for coaches, $9.99/month for fans. 550K+ reviews, the dominant youth sports app. Covers 20+ sports. Strengths: massive user base, simple interface, live streaming, free for coaches. Weakness: stats are terminal - they produce box scores and highlight reels but do not feed an intelligence system, do not generate coaching packets, do not trigger financial events, do not evaluate players. GameChanger is a consumer product for parents. KStat is an institutional intelligence layer for coaches.

**Hudl** ($900-3,300/year). The standard for game film. Acquired FastModel Sports (FastDraw, FastScout, FastRecruit) in November 2025. Strengths: ubiquitous in college and high school, strong film tools, now has play diagramming through FastDraw acquisition. Weakness: film-first, not stat-first. Hudl does not do live stat tracking. It does not generate coaching packets. It does not evaluate players. It does not connect to financial systems. Hudl is a video platform. KStat feeds video intelligence (through KTV and Film Room) but also feeds the entire KaNeXT intelligence pipeline.

**Synergy Sports** (owned by Sportradar). The gold standard for play-type analytics at the professional and Power Five level. Strengths: deep play-type data, proprietary tagging. Weakness: expensive, only available at the highest levels, no integration with broader institutional systems. Synergy serves the top 5% of programs. KStat serves the other 95%.

**SportsCloud / iStat / manual scorebooks.** Various small stat tracking tools used at lower levels. None connect to an intelligence system. None generate downstream outputs. None feed financial triggers. They are digital versions of paper scorebooks.

KStat's competitive position: it is the only stat tracking tool that turns every tap into seven simultaneous downstream outputs across coaching intelligence, media production, broadcast, financial operations, and player evaluation. The competition tracks stats. KStat captures institutional intelligence.

## The Network Effect

Every program that uses KStat adds data to the player pool. When Lincoln University tracks stats through KStat, every Lincoln player's data enters the pool. When Lincoln's conference opponent tracks through KStat, the entire conference's data deepens. When Dipson evaluates a Lincoln player, it uses both Lincoln's data and every opponent's data. The more programs on KStat, the more accurate every evaluation becomes for every program.

This creates a data network effect where the product becomes more valuable for existing users as new users join - the defining characteristic of platform businesses that achieve winner-take-all market dynamics.

## Revenue Impact

KStat is not a standalone revenue product. It is the data capture layer that makes the entire intelligence system valuable. Without live data flowing in, the intelligence files are static reference documents. With KStat feeding data from thousands of games per season, the intelligence system becomes a living, self-improving evaluation engine.

KStat drives revenue through four channels. First, it is a key feature of the KaNeXT OS platform subscription (institutions pay for the OS, KStat is included). Second, it powers KTV game broadcasts (every broadcast requires a stat feed, every broadcast pulls parents into the app, every parent is one tap from a wallet). Third, it triggers financial activity in Booster (play-based pledges and Fan Challenges generate giving that would not exist without live stat data). Fourth, it produces the data that makes KaNeXT Intelligence licensing valuable to third parties (intelligence without fresh data is static; intelligence with KStat data is alive).
