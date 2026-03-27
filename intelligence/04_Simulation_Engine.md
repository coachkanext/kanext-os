Interaction Library

Interaction Library
0. Scope
This is the single authoritative lookup table for all identity-clash interactions consumed by the
Simulation Engine. It replaces:
● SYSTEM × SYSTEM INTERACTION
● Offensive Archetype × Defensive Systems
● Defensive Archetype × Offensive System
Three tables in one doc:
● Part 1: System × System (12 offense × 10 defense = 120 entries)
● Part 2: Offensive Archetype × Defensive System (21 archetypes × 10 systems = 210
entries)
● Part 3: Defensive Archetype × Offensive System (21 archetypes × 12 systems = 252
entries)
Governance
● All archetype names MUST match the locked Archetype Library (21 archetypes) exactly
● All system names MUST match the locked System Sets (12 offense, 10 defense) exactly
● Delta values are bounded by the Modifier Framework
● This library produces interaction data only — it does not simulate, evaluate, or resolve
outcomes
● All deltas are relative to a neutral baseline (no defensive modifier)
● Deterministic: same identity inputs → same deltas returned
Archetype Library Reference (21 Locked Archetypes)
1. Two-Way Wing
2. 3-and-D Wing
3. POA Defender Guard
4. Primary Ball-Handler (Offense-First)
5. Switchable Defender Wing
6. Anchor Big
7. Stretch Big
8. Connector Guard
9. Offensive Wing Scorer

10. Gap / Team Defender Wing
11. Mobile Defensive Big
12. Chaos Disruptor Wing
13. Point Forward
14. Utility Forward
15. Roll Man / Vertical Threat
16. Offensive Big (Defense Liability)
17. Situational Shooter (Specialist)
18. Defensive Specialist (Non-Scoring)
19. Energy Big
20. Situational Ball-Handler (Bench Guard)
21. Developmental Prospect
System Set Reference
Offensive Systems (12): Spread Pick-and-Roll, 5-Out Motion, Motion / Read & React, Pace &
Space, Dribble Drive, Princeton, Flex, Swing, Post-Centric / Inside-Out, Moreyball, Heliocentric,
Coach K
Defensive Systems (10): Containment Man, Pack Line, Pressure Man (Denial), Switch
Everything, ICE / No-Middle, Zone (Structured), Matchup Zone / Hybrid, Press / Pressure
Defense, Junk / Special, Coach K
PART 1: SYSTEM × SYSTEM
INTERACTION
Each entry defines the macro game environment when these two systems clash. Outputs: Pace
impact, Shot Profile shifts, Turnover Pressure, Foul Rate, Explanation.
This table does not touch individual players. It establishes the team-level environment that
downstream archetype interactions operate within.
Offensive System 1: Spread Pick-and-Roll
vs Containment Man
● Pace: Neutral

● Shot Profile: Rim attempts +2pp, Pull-up midrange +2pp, Spot-up 3s −1pp
● Turnover Pressure: Neutral
● Foul Rate: +1pp
● Explanation: Standard PnR reads remain intact; defense concedes controlled
advantages without overcommitting.
vs Pack Line
● Pace: −2%
● Shot Profile: Rim attempts −4pp, Kick-out 3s +4pp, Midrange pull-ups +1pp
● Turnover Pressure: Neutral
● Foul Rate: −1pp
● Explanation: Paint congestion suppresses rim pressure; offense shifts toward kick-out
shooting.
vs Pressure Man (Denial)
● Pace: +2%
● Shot Profile: Early rim attempts +2pp, Pull-up jumpers +1pp
● Turnover Pressure: +3pp
● Foul Rate: +2pp
● Explanation: Ball pressure disrupts entry timing but increases foul risk once the screen is
used.
vs Switch Everything
● Pace: −1%
● Shot Profile: Isolation pull-ups +3pp, Roll-man rim attempts −3pp
● Turnover Pressure: +1pp
● Foul Rate: +1pp
● Explanation: Switches flatten roll advantages and redirect offense toward matchup
hunting.
vs ICE / No-Middle
● Pace: −2%
● Shot Profile: Baseline drives +2pp, Short-roll floaters/midrange +3pp, Middle rim
attempts −4pp
● Turnover Pressure: +1pp
● Foul Rate: Neutral
● Explanation: Forcing the ball sideline suppresses middle penetration and increases
short-area scoring.
vs Zone (Structured)

● Pace: −3%
● Shot Profile: Pull-up 3s +3pp, Slot/wing spot-ups +3pp, Rim attempts −4pp
● Turnover Pressure: −1pp
● Foul Rate: −2pp
● Explanation: Zone absorbs drives, encourages perimeter creation, and lowers foul
generation.
vs Matchup Zone / Hybrid
● Pace: −2%
● Shot Profile: Late-clock pull-ups +2pp, Roll-man touches −2pp
● Turnover Pressure: +2pp
● Foul Rate: −1pp
● Explanation: Hybrid coverage disrupts timing and increases indecision without fully
conceding space.
vs Press / Pressure Defense
● Pace: +4%
● Shot Profile: Early offense rim attempts +3pp, Transition 3s +2pp
● Turnover Pressure: +4pp
● Foul Rate: +1pp
● Explanation: Pressure increases game speed, creating both early advantages and
mistakes.
vs Junk / Special
● Pace: −4%
● Shot Profile: Late-clock contested shots +4pp, Assisted shot rate −5pp
● Turnover Pressure: +5pp
● Foul Rate: Neutral
● Explanation: Non-standard alignments break continuity and force improvisation.
vs Coach K Defense
● Pace: +1%
● Shot Profile: 3PA share −3pp, Rim attempts +1pp, Midrange pull-ups +3pp
● Turnover Pressure: +3pp
● Foul Rate: +2pp
● Explanation: Coach K's "no-threes" math forces ball handlers off the line. PnR reads
exist but shooters are run off. Midrange leaks.
vs Coach K Defense

● Pace: +1%
● Shot Profile: 3PA share −3pp, Rim attempts +1pp, Midrange pull-ups +3pp
● Turnover Pressure: +3pp
● Foul Rate: +2pp
● Explanation: Coach K's "no-threes" math forces ball handlers off the line. PnR reads
exist but shooters are run off. Midrange leaks.
Offensive System 2: 5-Out Motion
vs Containment Man
● Pace: Neutral
● Shot Profile: Rim attempts +2pp, Catch-and-shoot 3s +2pp, Midrange −2pp
● Turnover Pressure: Neutral
● Foul Rate: +1pp
● Explanation: Spacing stretches containment without forcing rotations; offense flows into
balanced rim-and-kick reads.
vs Pack Line
● Pace: −3%
● Shot Profile: Rim attempts −5pp, Catch-and-shoot 3s +5pp
● Turnover Pressure: −1pp
● Foul Rate: −2pp
● Explanation: Heavy paint help neutralizes cuts and drives, pushing offense heavily
toward perimeter shooting.
vs Pressure Man (Denial)
● Pace: +2%
● Shot Profile: Backdoor cuts/rim attempts +3pp, Spot-up 3s +1pp
● Turnover Pressure: +3pp
● Foul Rate: +2pp
● Explanation: Denial creates backdoor opportunities but raises ball security risk during
reversals.
vs Switch Everything
● Pace: −2%
● Shot Profile: Isolation drives +3pp, Assisted shots −3pp
● Turnover Pressure: +1pp
● Foul Rate: +1pp

● Explanation: Switching disrupts motion continuity and shifts offense toward individual
creation.
vs ICE / No-Middle
● Pace: −2%
● Shot Profile: Baseline drives +2pp, Corner 3s +2pp, Middle drives −4pp
● Turnover Pressure: +1pp
● Foul Rate: Neutral
● Explanation: No-middle principles redirect penetration toward baseline spacing actions.
vs Zone (Structured)
● Pace: −4%
● Shot Profile: Above-the-break 3s +4pp, Rim attempts −4pp
● Turnover Pressure: −2pp
● Foul Rate: −3pp
● Explanation: Zone absorbs motion actions, forcing perimeter ball movement and
lowering foul pressure.
vs Matchup Zone / Hybrid
● Pace: −3%
● Shot Profile: Late-clock pull-ups +2pp, Assisted shots −2pp
● Turnover Pressure: +2pp
● Foul Rate: −1pp
● Explanation: Hybrid coverages break rhythm and timing without fully conceding space.
vs Press / Pressure Defense
● Pace: +4%
● Shot Profile: Transition rim attempts +3pp, Transition 3s +2pp
● Turnover Pressure: +4pp
● Foul Rate: +1pp
● Explanation: Pressure accelerates tempo and creates early-advantage opportunities
alongside mistakes.
vs Junk / Special
● Pace: −5%
● Shot Profile: Contested perimeter shots +4pp, Assisted shot rate −6pp
● Turnover Pressure: +5pp
● Foul Rate: Neutral
● Explanation: Irregular alignments disrupt spacing reads and continuity actions.

vs Coach K Defense
● Pace: Neutral
● Shot Profile: 3PA share −4pp, Rim attempts +1pp, Midrange +3pp
● Turnover Pressure: +2pp
● Foul Rate: +1pp
● Explanation: Denial disrupts spacing entries. 5-Out's perimeter-heavy diet is directly
attacked by no-threes philosophy.
vs Coach K Defense
● Pace: Neutral
● Shot Profile: 3PA share −4pp, Rim attempts +1pp, Midrange +3pp
● Turnover Pressure: +2pp
● Foul Rate: +1pp
● Explanation: Denial disrupts spacing entries. 5-Out's perimeter-heavy diet is directly
attacked by no-threes philosophy.
Offensive System 3: Motion / Read & React
vs Containment Man
● Pace: Neutral
● Shot Profile: Rim attempts +1pp, Assisted catch-and-shoot 3s +2pp, Midrange −2pp
● Turnover Pressure: Neutral
● Foul Rate: +1pp
● Explanation: Containment allows reads to unfold; offense produces steady assisted
looks without forcing.
vs Pack Line
● Pace: −4%
● Shot Profile: Rim attempts −5pp, Assisted 3s +5pp
● Turnover Pressure: −1pp
● Foul Rate: −2pp
● Explanation: Paint congestion neutralizes cutting lanes and drives, pushing the offense
toward perimeter ball movement.
vs Pressure Man (Denial)
● Pace: +2%
● Shot Profile: Backdoor rim attempts +3pp, Late-clock jumpers +1pp

● Turnover Pressure: +3pp
● Foul Rate: +2pp
● Explanation: Denial creates read-based counters but increases risk during reversals and
handoffs.
vs Switch Everything
● Pace: −3%
● Shot Profile: Isolation drives +3pp, Assisted shots −4pp
● Turnover Pressure: +1pp
● Foul Rate: +1pp
● Explanation: Switching breaks continuity and converts the offense into matchup-based
creation.
vs ICE / No-Middle
● Pace: −3%
● Shot Profile: Baseline drives +2pp, Short midrange attempts +2pp, Middle penetration
−4pp
● Turnover Pressure: +1pp
● Foul Rate: Neutral
● Explanation: Forced sideline flow reduces central reads and shifts offense toward
baseline counters.
vs Zone (Structured)
● Pace: −5%
● Shot Profile: Ball-reversal 3s +4pp, Rim attempts −4pp
● Turnover Pressure: −2pp
● Foul Rate: −3pp
● Explanation: Zone absorbs read-based actions and slows the offense into perimeter
probing.
vs Matchup Zone / Hybrid
● Pace: −4%
● Shot Profile: Late-clock pull-ups +3pp, Assisted shots −3pp
● Turnover Pressure: +2pp
● Foul Rate: −1pp
● Explanation: Hybrid defenses disrupt timing and continuity reads, increasing indecision
late in possessions.
vs Press / Pressure Defense

● Pace: +3%
● Shot Profile: Early offense rim attempts +2pp, Transition 3s +2pp
● Turnover Pressure: +4pp
● Foul Rate: +1pp
● Explanation: Pressure speeds the game up, compressing read time and increasing
volatility.
vs Junk / Special
● Pace: −5%
● Shot Profile: Contested jumpers +4pp, Assisted rate −6pp
● Turnover Pressure: +5pp
● Foul Rate: Neutral
● Explanation: Irregular alignments destroy read structure and force improvisation.
vs Coach K Defense
● Pace: Neutral
● Shot Profile: 3PA share −3pp, Backdoor cuts +2pp, Midrange +2pp
● Turnover Pressure: +2pp
● Foul Rate: +1pp
● Explanation: Motion reads punish overplay with backdoor cuts. But denial still
suppresses clean perimeter looks.
vs Coach K Defense
● Pace: Neutral
● Shot Profile: 3PA share −3pp, Backdoor cuts +2pp, Midrange +2pp
● Turnover Pressure: +2pp
● Foul Rate: +1pp
● Explanation: Motion reads punish overplay with backdoor cuts. But denial still
suppresses clean perimeter looks.
Offensive System 4: Dribble Drive
vs Containment Man
● Pace: Neutral
● Shot Profile: Rim attempts +3pp, Kick-out 3s +2pp, Pull-up midrange −2pp
● Turnover Pressure: Neutral
● Foul Rate: +2pp

● Explanation: Containment allows penetration angles without hard help, enabling
consistent rim pressure and drive-and-kick flow.
vs Pack Line
● Pace: −4%
● Shot Profile: Rim attempts −6pp, Kick-out 3s +6pp
● Turnover Pressure: +1pp
● Foul Rate: −2pp
● Explanation: Heavy paint congestion suppresses rim finishes and forces extreme
reliance on kick-out shooting.
vs Pressure Man (Denial)
● Pace: +2%
● Shot Profile: Early rim attempts +2pp, Pull-up jumpers +1pp
● Turnover Pressure: +4pp
● Foul Rate: +3pp
● Explanation: Ball pressure disrupts initiation but increases foul exposure once
penetration is achieved.
vs Switch Everything
● Pace: −2%
● Shot Profile: Isolation drives +4pp, Assisted shots −4pp
● Turnover Pressure: +2pp
● Foul Rate: +1pp
● Explanation: Switching eliminates help advantages and turns the offense into individual
downhill attacks.
vs ICE / No-Middle
● Pace: −3%
● Shot Profile: Baseline drives +3pp, Short midrange attempts +2pp, Middle penetration
−5pp
● Turnover Pressure: +1pp
● Foul Rate: Neutral
● Explanation: No-middle rules redirect penetration toward baseline, reducing primary
advantage zones.
vs Zone (Structured)
● Pace: −5%
● Shot Profile: Kick-out 3s +5pp, Rim attempts −5pp

● Turnover Pressure: −1pp
● Foul Rate: −3pp
● Explanation: Zone walls off drives, forcing perimeter probing and lowering foul pressure.
vs Matchup Zone / Hybrid
● Pace: −4%
● Shot Profile: Late-clock pull-ups +3pp, Assisted shots −3pp
● Turnover Pressure: +2pp
● Foul Rate: −1pp
● Explanation: Hybrid coverages disrupt driving lanes and timing without fully conceding
space.
vs Press / Pressure Defense
● Pace: +4%
● Shot Profile: Transition rim attempts +4pp, Transition 3s +2pp
● Turnover Pressure: +5pp
● Foul Rate: +1pp
● Explanation: Pressure accelerates tempo, increasing both downhill opportunities and
ball-security risk.
vs Junk / Special
● Pace: −5%
● Shot Profile: Contested drives/jumpers +4pp, Assisted shot rate −6pp
● Turnover Pressure: +5pp
● Foul Rate: Neutral
● Explanation: Non-standard alignments collapse driving reads and force improvisational
scoring.
vs Coach K Defense
● Pace: +1%
● Shot Profile: Rim attempts −1pp, Midrange pull-ups +3pp, 3PA share −1pp
● Turnover Pressure: +3pp
● Foul Rate: +1pp
● Explanation: Denial disrupts initiation. Rim protector funneling works against Dribble
Drive's downhill intent. Midrange leaks.
vs Coach K Defense
● Pace: +1%
● Shot Profile: Rim attempts −1pp, Midrange pull-ups +3pp, 3PA share −1pp

● Turnover Pressure: +3pp
● Foul Rate: +1pp
● Explanation: Denial disrupts initiation. Rim protector funneling works against Dribble
Drive's downhill intent. Midrange leaks.
Offensive System 5: Pace & Space
vs Containment Man
● Pace: +3%
● Shot Profile: Transition rim attempts +3pp, Above-the-break 3s +3pp, Midrange −3pp
● Turnover Pressure: Neutral
● Foul Rate: +1pp
● Explanation: Containment concedes early advantages; spacing maximizes rim-and-3
efficiency without heavy resistance.
vs Pack Line
● Pace: +1%
● Shot Profile: Rim attempts −4pp, Above-the-break 3s +6pp
● Turnover Pressure: +1pp
● Foul Rate: −2pp
● Explanation: Paint crowding suppresses rim pressure, pushing offense further toward
volume perimeter shooting.
vs Pressure Man (Denial)
● Pace: +4%
● Shot Profile: Early rim attempts +2pp, Pull-up 3s +2pp
● Turnover Pressure: +4pp
● Foul Rate: +2pp
● Explanation: Denial increases volatility — forcing faster decisions, more pull-ups, and
higher turnover risk.
vs Switch Everything
● Pace: −1%
● Shot Profile: Isolation pull-up 3s +3pp, Assisted shots −3pp
● Turnover Pressure: +2pp
● Foul Rate: +1pp
● Explanation: Switching neutralizes spacing advantages and shifts offense toward
individual shot-making.

vs ICE / No-Middle
● Pace: −2%
● Shot Profile: Baseline drives +2pp, Corner 3s +2pp, Middle penetration −4pp
● Turnover Pressure: +1pp
● Foul Rate: Neutral
● Explanation: Sideline forcing limits central drive-kick flow, redirecting offense to baseline
spacing reads.
vs Zone (Structured)
● Pace: −3%
● Shot Profile: Above-the-break 3s +5pp, Rim attempts −5pp
● Turnover Pressure: −1pp
● Foul Rate: −3pp
● Explanation: Zone compresses the paint and slows tempo, increasing reliance on
perimeter shot volume.
vs Matchup Zone / Hybrid
● Pace: −2%
● Shot Profile: Late-clock pull-up 3s +3pp, Assisted shots −2pp
● Turnover Pressure: +2pp
● Foul Rate: −1pp
● Explanation: Hybrid coverages disrupt early flow and force more late-clock perimeter
creation.
vs Press / Pressure Defense
● Pace: +6%
● Shot Profile: Transition rim attempts +4pp, Transition 3s +3pp
● Turnover Pressure: +5pp
● Foul Rate: +1pp
● Explanation: Pressure accelerates Pace & Space to its extreme — high tempo, high
volatility, high reward.
vs Junk / Special
● Pace: −4%
● Shot Profile: Contested perimeter shots +4pp, Assisted rate −5pp
● Turnover Pressure: +5pp
● Foul Rate: Neutral
● Explanation: Irregular defenses disrupt early flow and spacing discipline, forcing
improvisation.

vs Coach K Defense
● Pace: +2%
● Shot Profile: 3PA share −3pp, Transition rim +2pp, Midrange +2pp
● Turnover Pressure: +4pp
● Foul Rate: +2pp
● Explanation: Pace & Space wants early offense but Coach K's selective 3/4-court
pressure increases turnovers. No-threes math suppresses perimeter diet.
vs Coach K Defense
● Pace: +2%
● Shot Profile: 3PA share −3pp, Transition rim +2pp, Midrange +2pp
● Turnover Pressure: +4pp
● Foul Rate: +2pp
● Explanation: Pace & Space wants early offense but Coach K's selective 3/4-court
pressure increases turnovers. No-threes suppresses perimeter diet.
Offensive System 6: Princeton
vs Containment Man
● Pace: −4%
● Shot Profile: Backdoor rim attempts +3pp, Assisted midrange +2pp, Above-the-break 3s
−3pp
● Turnover Pressure: Neutral
● Foul Rate: +1pp
● Explanation: Containment allows the offense to operate patiently, enabling reads and
backdoor timing without heavy disruption.
vs Pack Line
● Pace: −6%
● Shot Profile: Backdoor rim attempts −4pp, Midrange jumpers +3pp, Kick-out 3s +1pp
● Turnover Pressure: +1pp
● Foul Rate: −2pp
● Explanation: Paint congestion removes cutting lanes and forces Princeton into
secondary scoring options.
vs Pressure Man (Denial)
● Pace: −2%

● Shot Profile: Backdoor cuts +4pp, Late-clock jumpers +1pp
● Turnover Pressure: +3pp
● Foul Rate: +2pp
● Explanation: Denial increases risk but also enhances Princeton's signature counters if
reads are executed cleanly.
vs Switch Everything
● Pace: −3%
● Shot Profile: Isolation post-ups +3pp, Assisted shots −3pp
● Turnover Pressure: +1pp
● Foul Rate: +1pp
● Explanation: Switching disrupts continuity actions and converts offense into
matchup-based execution.
vs ICE / No-Middle
● Pace: −4%
● Shot Profile: Baseline cuts +3pp, Middle actions −4pp
● Turnover Pressure: +1pp
● Foul Rate: Neutral
● Explanation: No-middle principles redirect actions toward baseline counters, partially
aligning with Princeton structure.
vs Zone (Structured)
● Pace: −7%
● Shot Profile: High-post touches +3pp, Short midrange attempts +3pp, Rim attempts
−4pp
● Turnover Pressure: −1pp
● Foul Rate: −3pp
● Explanation: Zone absorbs backdoor actions and slows tempo, forcing Princeton to
operate from the high post.
vs Matchup Zone / Hybrid
● Pace: −6%
● Shot Profile: Late-clock jumpers +3pp, Assisted shots −3pp
● Turnover Pressure: +2pp
● Foul Rate: −1pp
● Explanation: Hybrid defenses disrupt read timing and continuity patterns.
vs Press / Pressure Defense

● Pace: +2%
● Shot Profile: Early rim attempts +2pp, Transition miscues +2pp
● Turnover Pressure: +4pp
● Foul Rate: +1pp
● Explanation: Pressure speeds the game slightly but increases turnover risk for a
precision-based offense.
vs Junk / Special
● Pace: −6%
● Shot Profile: Contested late-clock shots +4pp, Assisted rate −6pp
● Turnover Pressure: +5pp
● Foul Rate: Neutral
● Explanation: Irregular defenses break the offense's read hierarchy and force
improvisation.
vs Coach K Defense
● Pace: −2%
● Shot Profile: Backdoor cuts +3pp, 3PA share −2pp, Midrange +1pp
● Turnover Pressure: +2pp
● Foul Rate: +1pp
● Explanation: Princeton punishes denial with backdoor cuts. But no-threes math
suppresses perimeter looks. Post hub contested by rim protector.
vs Coach K Defense
● Pace: −2%
● Shot Profile: Backdoor cuts +3pp, 3PA share −2pp, Midrange +1pp
● Turnover Pressure: +2pp
● Foul Rate: +1pp
● Explanation: Princeton punishes denial with backdoor cuts. But no-threes math
suppresses perimeter looks. Post hub contested by rim protector.
Offensive System 7: Flex
vs Containment Man
● Pace: −3%
● Shot Profile: Baseline cut rim attempts +3pp, Assisted midrange jumpers +2pp,
Above-the-break 3s −3pp
● Turnover Pressure: Neutral

● Foul Rate: +1pp
● Explanation: Containment allows Flex continuity to operate cleanly, generating baseline
cuts and structured looks.
vs Pack Line
● Pace: −5%
● Shot Profile: Rim attempts −4pp, Midrange attempts +3pp, Kick-out 3s +1pp
● Turnover Pressure: +1pp
● Foul Rate: −2pp
● Explanation: Packed paint removes baseline cut leverage, forcing Flex into secondary
midrange actions.
vs Pressure Man (Denial)
● Pace: −1%
● Shot Profile: Backdoor cuts +3pp, Late-clock jumpers +1pp
● Turnover Pressure: +3pp
● Foul Rate: +2pp
● Explanation: Denial stresses timing but opens counter cuts if spacing discipline holds.
vs Switch Everything
● Pace: −3%
● Shot Profile: Post-ups after switches +3pp, Assisted shots −3pp
● Turnover Pressure: +1pp
● Foul Rate: +1pp
● Explanation: Switching breaks the screening advantage and redirects offense toward
matchup exploitation.
vs ICE / No-Middle
● Pace: −4%
● Shot Profile: Baseline actions +3pp, Middle penetration −4pp
● Turnover Pressure: +1pp
● Foul Rate: Neutral
● Explanation: No-middle principles funnel the ball into Flex's baseline-oriented counters.
vs Zone (Structured)
● Pace: −6%
● Shot Profile: High-post touches +3pp, Short midrange attempts +3pp, Rim attempts
−4pp
● Turnover Pressure: −1pp

● Foul Rate: −3pp
● Explanation: Zone absorbs baseline screening actions and slows continuity into probing
offense.
vs Matchup Zone / Hybrid
● Pace: −5%
● Shot Profile: Late-clock jumpers +3pp, Assisted shots −3pp
● Turnover Pressure: +2pp
● Foul Rate: −1pp
● Explanation: Hybrid defenses disrupt pattern timing and recognition.
vs Press / Pressure Defense
● Pace: +2%
● Shot Profile: Early rim attempts +2pp, Transition miscues +2pp
● Turnover Pressure: +4pp
● Foul Rate: +1pp
● Explanation: Pressure speeds entry into sets and increases ball-security stress.
vs Junk / Special
● Pace: −6%
● Shot Profile: Contested structured shots +4pp, Assisted rate −6pp
● Turnover Pressure: +5pp
● Foul Rate: Neutral
● Explanation: Non-standard alignments break pattern recognition and force improvisation.
vs Coach K Defense
● Pace: −1%
● Shot Profile: 3PA share −2pp, Off-screen midrange +2pp, Baseline cuts +1pp
● Turnover Pressure: +2pp
● Foul Rate: +1pp
● Explanation: Flex screening actions disrupted by denial. No-threes forces midrange that
Flex can execute but at lower efficiency.
vs Coach K Defense
● Pace: −1%
● Shot Profile: 3PA share −2pp, Off-screen midrange +2pp, Baseline cuts +1pp
● Turnover Pressure: +2pp
● Foul Rate: +1pp

● Explanation: Flex screening actions disrupted by denial. No-threes forces midrange that
Flex can execute but at lower efficiency.
Offensive System 8: Swing
vs Containment Man
● Pace: −1%
● Shot Profile: Assisted catch-and-shoot 3s +3pp, Rim attempts +1pp, Midrange −2pp
● Turnover Pressure: Neutral
● Foul Rate: +1pp
● Explanation: Containment allows the ball to swing side-to-side, creating rhythm
perimeter looks and controlled drives.
vs Pack Line
● Pace: −4%
● Shot Profile: Rim attempts −4pp, Kick-out 3s +5pp
● Turnover Pressure: +1pp
● Foul Rate: −2pp
● Explanation: Paint help suppresses drive lanes, increasing reliance on perimeter ball
reversal.
vs Pressure Man (Denial)
● Pace: +1%
● Shot Profile: Backdoor drives +2pp, Late-clock jumpers +1pp
● Turnover Pressure: +3pp
● Foul Rate: +2pp
● Explanation: Denial stresses reversals but creates backdoor counters when overplayed.
vs Switch Everything
● Pace: −3%
● Shot Profile: Isolation pull-ups +3pp, Assisted shots −4pp
● Turnover Pressure: +2pp
● Foul Rate: +1pp
● Explanation: Switching negates screening advantages and shifts offense toward
individual creation.
vs ICE / No-Middle

● Pace: −3%
● Shot Profile: Baseline drives +2pp, Corner 3s +2pp, Middle penetration −4pp
● Turnover Pressure: +1pp
● Foul Rate: Neutral
● Explanation: Sideline forcing aligns with Swing's spacing but limits middle penetration.
vs Zone (Structured)
● Pace: −5%
● Shot Profile: Ball-reversal 3s +4pp, Rim attempts −4pp
● Turnover Pressure: −1pp
● Foul Rate: −3pp
● Explanation: Zone slows reversals and compresses the paint, pushing volume perimeter
shooting.
vs Matchup Zone / Hybrid
● Pace: −4%
● Shot Profile: Late-clock pull-ups +3pp, Assisted shots −3pp
● Turnover Pressure: +2pp
● Foul Rate: −1pp
● Explanation: Hybrid coverages disrupt reversal timing and continuity.
vs Press / Pressure Defense
● Pace: +3%
● Shot Profile: Transition rim attempts +3pp, Transition 3s +2pp
● Turnover Pressure: +4pp
● Foul Rate: +1pp
● Explanation: Pressure accelerates tempo and increases volatility in ball movement.
vs Junk / Special
● Pace: −5%
● Shot Profile: Contested perimeter shots +4pp, Assisted rate −6pp
● Turnover Pressure: +5pp
● Foul Rate: Neutral
● Explanation: Irregular alignments disrupt reversal patterns and spacing discipline.
vs Coach K Defense
● Pace: Neutral
● Shot Profile: 3PA share −3pp, Wing drives +1pp, Midrange +2pp
● Turnover Pressure: +3pp

● Foul Rate: +1pp
● Explanation: Swing's ball reversal directly attacked by denial. Passing lane pressure
increases turnovers. No-threes suppresses perimeter diet.
vs Coach K Defense
● Pace: Neutral
● Shot Profile: 3PA share −3pp, Wing drives +1pp, Midrange +2pp
● Turnover Pressure: +3pp
● Foul Rate: +1pp
● Explanation: Swing's ball reversal directly attacked by denial. Passing lane pressure
increases turnovers. No-threes suppresses perimeter diet.
Offensive System 9: Post-Centric / Inside-Out
vs Containment Man
● Pace: −2%
● Shot Profile: Post rim attempts +3pp, Kick-out 3s +2pp, Pull-up jumpers −2pp
● Turnover Pressure: Neutral
● Foul Rate: +3pp
● Explanation: Containment allows clean post feeds and controlled double timing,
increasing foul pressure.
vs Pack Line
● Pace: −5%
● Shot Profile: Post rim attempts −4pp, Kick-out 3s +4pp, Midrange +1pp
● Turnover Pressure: +2pp
● Foul Rate: −1pp
● Explanation: Paint crowding suppresses post finishes and forces perimeter conversion.
vs Pressure Man (Denial)
● Pace: −1%
● Shot Profile: Quick post seals +2pp, Late-clock jumpers +1pp
● Turnover Pressure: +4pp
● Foul Rate: +2pp
● Explanation: Denial stresses entry passes but increases foul risk once the ball enters the
post.
vs Switch Everything

● Pace: −3%
● Shot Profile: Mismatch post-ups +4pp, Assisted shots −3pp
● Turnover Pressure: +2pp
● Foul Rate: +1pp
● Explanation: Switching creates post mismatches while reducing off-ball advantage.
vs ICE / No-Middle
● Pace: −3%
● Shot Profile: Baseline post drives +2pp, Middle finishes −4pp
● Turnover Pressure: +1pp
● Foul Rate: Neutral
● Explanation: No-middle principles redirect post attacks to baseline counters.
vs Zone (Structured)
● Pace: −6%
● Shot Profile: High-post touches +3pp, Short midrange attempts +3pp, Rim attempts
−4pp
● Turnover Pressure: −1pp
● Foul Rate: −3pp
● Explanation: Zone absorbs post gravity and forces inside-out play from the high post.
vs Matchup Zone / Hybrid
● Pace: −5%
● Shot Profile: Late-clock jumpers +3pp, Assisted shots −3pp
● Turnover Pressure: +2pp
● Foul Rate: −1pp
● Explanation: Hybrid coverages delay post reads and increase indecision.
vs Press / Pressure Defense
● Pace: +2%
● Shot Profile: Early post seals +2pp, Transition miscues +2pp
● Turnover Pressure: +4pp
● Foul Rate: +1pp
● Explanation: Pressure speeds entry and increases ball-security stress before post
establishment.
vs Junk / Special
● Pace: −6%
● Shot Profile: Contested post touches +4pp, Assisted rate −5pp

● Turnover Pressure: +5pp
● Foul Rate: Neutral
● Explanation: Non-standard alignments distort post spacing and passing lanes.
vs Coach K Defense
● Pace: −1%
● Shot Profile: Post touches −1pp, Rim attempts −2pp, Midrange +2pp, 3PA share +1pp
● Turnover Pressure: +2pp
● Foul Rate: +1pp
● Explanation: Rim protector limits post finishes. Inside-Out can work the high post if
anchor is disciplined. Less disruptive to post-heavy offense than perimeter offense.
vs Coach K Defense
● Pace: −1%
● Shot Profile: Post touches −1pp, Rim attempts −2pp, Midrange +2pp, 3PA share +1pp
● Turnover Pressure: +2pp
● Foul Rate: +1pp
● Explanation: Rim protector limits post finishes. Inside-Out can work the high post. Less
disruptive to post-heavy offense than perimeter offense.
Offensive System 10: Moreyball
vs Containment Man
● Pace: +1%
● Shot Profile: Rim attempts +3pp, Pull-up 3s +2pp, Midrange −3pp
● Turnover Pressure: Neutral
● Foul Rate: +3pp
● Explanation: Conservative containment concedes drives and pull-up 3s, aligning with
Moreyball priorities.
vs Pack Line
● Pace: −3%
● Shot Profile: Rim attempts −5pp, Kick-out 3s +5pp
● Turnover Pressure: +1pp
● Foul Rate: −2pp
● Explanation: Paint loading suppresses rim pressure and forces volume perimeter
shooting.

vs Pressure Man (Denial)
● Pace: +2%
● Shot Profile: Drive frequency +2pp, Assisted 3s +1pp
● Turnover Pressure: +4pp
● Foul Rate: +2pp
● Explanation: Denial increases volatility — higher foul draw but elevated turnover risk.
vs Switch Everything
● Pace: Neutral
● Shot Profile: Isolation 3s +3pp, Rim attempts (mismatch drives) +2pp
● Turnover Pressure: +2pp
● Foul Rate: +1pp
● Explanation: Switching invites iso hunting and mismatch exploitation without midrange
reliance.
vs ICE / No-Middle
● Pace: −2%
● Shot Profile: Corner 3s +3pp, Middle drives −4pp
● Turnover Pressure: +1pp
● Foul Rate: Neutral
● Explanation: No-middle forces sideline drives and corner kick-outs — acceptable
outcomes for Moreyball.
vs Zone (Structured)
● Pace: −5%
● Shot Profile: Above-the-break 3s +4pp, Rim attempts −6pp
● Turnover Pressure: −1pp
● Foul Rate: −3pp
● Explanation: Zone reduces foul pressure and rim access, pushing heavy 3-point
dependency.
vs Matchup Zone / Hybrid
● Pace: −4%
● Shot Profile: Late-clock 3s +4pp, Assisted rate −3pp
● Turnover Pressure: +2pp
● Foul Rate: −1pp
● Explanation: Hybrid rotations delay reads and reduce clean rim attacks.
vs Press / Pressure Defense

● Pace: +4%
● Shot Profile: Early rim attacks +2pp, Transition 3s +2pp
● Turnover Pressure: +5pp
● Foul Rate: +1pp
● Explanation: Pressure accelerates possessions, increasing both rim chances and
turnover variance.
vs Junk / Special
● Pace: −6%
● Shot Profile: Forced off-script 3s +3pp, Rim attempts −4pp
● Turnover Pressure: +5pp
● Foul Rate: −1pp
● Explanation: Non-standard coverages disrupt drive lanes and spacing geometry.
vs Coach K Defense
● Pace: +1%
● Shot Profile: 3PA share −4pp, Rim attempts −1pp, Midrange +4pp, FT rate +1pp
● Turnover Pressure: +3pp
● Foul Rate: +2pp
● Explanation: Coach K defense specifically designed to break Moreyball. No-threes
directly attacks 3-point volume. Rim protector limits finishing. Moreyball degrades into
midrange.
vs Coach K Defense
● Pace: +1%
● Shot Profile: 3PA share −4pp, Rim attempts −1pp, Midrange +4pp, FT rate +1pp
● Turnover Pressure: +3pp
● Foul Rate: +2pp
● Explanation: Coach K defense specifically designed to break Moreyball. No-threes
directly attacks 3-point volume. Rim protector limits finishing.
Offensive System 11: Heliocentric
vs Containment Man
● Pace: Neutral
● Shot Profile: Anchor isolation +3pp, Pull-up midrange +2pp, Spot-up 3s +1pp,
Non-anchor rim −1pp
● Turnover Pressure: Neutral

● Foul Rate: +2pp
● Explanation: Containment respects the anchor without selling out. Anchor gets his looks
but at regulated advantage levels.
vs Pack Line
● Pace: −3%
● Shot Profile: Anchor rim attempts −4pp, Anchor midrange +3pp, Kick-out 3s +3pp
● Turnover Pressure: +1pp
● Foul Rate: −1pp
● Explanation: Paint congestion limits the anchor's downhill game. Offense must rely on
anchor's mid-range and passing to shooters.
vs Pressure Man (Denial)
● Pace: +2%
● Shot Profile: Anchor early drives +2pp, Pull-up jumpers +2pp, Transition +1pp
● Turnover Pressure: +4pp
● Foul Rate: +2pp
● Explanation: Pressure on the anchor creates the highest turnover environment. If anchor
handles pressure, efficiency holds. If not, offense collapses.
vs Switch Everything
● Pace: Neutral
● Shot Profile: Anchor isolation +4pp, Anchor post-up mismatches +2pp, Roll-man touches
−3pp
● Turnover Pressure: +1pp
● Foul Rate: +1pp
● Explanation: Switching gives the anchor exactly what he wants — isolation against the
weakest available defender.
vs ICE / No-Middle
● Pace: −2%
● Shot Profile: Anchor baseline drives +2pp, Anchor floaters/midrange +3pp, Middle
penetration −4pp
● Turnover Pressure: +1pp
● Foul Rate: Neutral
● Explanation: ICE redirects the anchor sideline. Effective if anchor is middle-dependent;
less effective if anchor has baseline game.
vs Zone (Structured)

● Pace: −4%
● Shot Profile: Anchor high-post facilitating +3pp, Spot-up 3s +3pp, Anchor rim attempts
−4pp
● Turnover Pressure: −1pp
● Foul Rate: −2pp
● Explanation: Zone turns the anchor into a facilitator rather than a scorer. If the anchor
can pass, offense adjusts. If not, it stalls.
vs Matchup Zone / Hybrid
● Pace: −3%
● Shot Profile: Anchor isolation +2pp, Pull-up midrange +2pp
● Turnover Pressure: +2pp
● Foul Rate: Neutral
● Explanation: Hybrid face-guards the anchor while zoning others. Anchor must score
through attention.
vs Press / Pressure Defense
● Pace: +4%
● Shot Profile: Anchor transition +3pp, Early drives +2pp
● Turnover Pressure: +5pp
● Foul Rate: +2pp
● Explanation: Maximum pressure on the single point of failure. If anchor breaks the press,
easy scores. If not, catastrophic turnovers.
vs Junk / Special
● Pace: −5%
● Shot Profile: Anchor isolation −2pp, Secondary players +2pp, Midrange +1pp
● Turnover Pressure: +4pp
● Foul Rate: Neutral
● Explanation: Junk (box-and-one, triangle-and-two) is specifically designed to neutralize
the anchor. Secondary players must produce — which they typically can't in a
Heliocentric system.
vs Coach K Defense
● Pace: Neutral
● Shot Profile: Anchor 3PA −2pp, Anchor rim −1pp, Anchor midrange +3pp, Spot-up 3s
−1pp
● Turnover Pressure: +3pp
● Foul Rate: +1pp

● Explanation: Multiple POA defenders and switchable wings take turns on the anchor.
Denial suppresses clean looks. Rim protector erases drives. Anchor forced into
midrange.
vs Coach K Defense
● Pace: Neutral
● Shot Profile: Anchor 3PA −2pp, Anchor rim −1pp, Anchor midrange +3pp, Spot-up 3s
−1pp
● Turnover Pressure: +3pp
● Foul Rate: +1pp
● Explanation: Multiple POA defenders and switchable wings take turns on the anchor.
Denial suppresses clean looks. Rim protector erases drives.
Offensive System 12: Coach K
Identity: Ultra-fast tempo + constant motion/read-react + Moreyball shot diet (rim + 3s,
especially transition + corners) + Spread PnR embedded (multiple handlers/bigs) + selective iso
inside flow (Heat-style), not heliocentric.
vs Containment Man
● Pace: +3%
● Shot Profile: Transition rim +3pp, Corner 3s +3pp, Pull-up midrange −3pp
● Turnover Pressure: +1pp
● Foul Rate: +2pp
● Explanation: Containment can't handle Coach K's pace. Transition scoring + rim/3 diet
exploits conservative help.
vs Pack Line
● Pace: −1%
● Shot Profile: Rim attempts −4pp, Kick-out 3s +5pp, Corner 3s +2pp, Midrange −1pp
● Turnover Pressure: +1pp
● Foul Rate: −2pp
● Explanation: Pack Line suppresses rim pressure but Coach K's spacing and movement
create volume perimeter looks.
vs Pressure Man (Denial)
● Pace: +4%

● Shot Profile: Transition rim +3pp, Pull-up 3s +2pp, Backdoor cuts +2pp
● Turnover Pressure: +4pp
● Foul Rate: +3pp
● Explanation: Two aggressive systems collide. Coach K's pace + denial = highest
volatility. Turnovers spike but so do transition scores and fouls.
vs Switch Everything
● Pace: +1%
● Shot Profile: Isolation drives +3pp, Mismatch post-ups +2pp, Spot-up 3s −1pp
● Turnover Pressure: +2pp
● Foul Rate: +2pp
● Explanation: Switching neutralizes some motion but Coach K's multiple handlers and
bigs exploit mismatches. Iso within flow activates.
vs ICE / No-Middle
● Pace: +1%
● Shot Profile: Baseline drives +2pp, Corner 3s +3pp, Middle penetration −4pp
● Turnover Pressure: +1pp
● Foul Rate: Neutral
● Explanation: ICE redirects sideline but Coach K's corner 3 emphasis and baseline
spacing absorb it.
vs Zone (Structured)
● Pace: −2%
● Shot Profile: Above-the-break 3s +4pp, Corner 3s +3pp, Rim attempts −5pp
● Turnover Pressure: Neutral
● Foul Rate: −3pp
● Explanation: Zone slows Coach K's preferred tempo and suppresses rim pressure. But
motion/read-react foundation means volume 3s stay high.
vs Matchup Zone / Hybrid
● Pace: −1%
● Shot Profile: Pull-up 3s +3pp, Late-clock drives +2pp, Assisted shots −2pp
● Turnover Pressure: +2pp
● Foul Rate: −1pp
● Explanation: Hybrid disrupts motion timing. Coach K's pace absorbs some disruption but
read-react complexity increases turnover risk.
vs Press / Pressure Defense

● Pace: +6%
● Shot Profile: Transition rim +5pp, Transition 3s +3pp, Halfcourt rim −3pp
● Turnover Pressure: +5pp
● Foul Rate: +2pp
● Explanation: Two up-tempo systems at maximum. Coach K WANTS this pace.
Highest-scoring environment but also highest-turnover.
vs Junk / Special
● Pace: −3%
● Shot Profile: Contested pull-up 3s +3pp, Isolation drives +2pp, Assisted rate −5pp
● Turnover Pressure: +4pp
● Foul Rate: Neutral
● Explanation: Junk specifically disrupts flow offenses. Coach K's motion/read-react is
vulnerable to junk because it relies on reads that junk breaks.
vs Coach K Defense
● Pace: +4%
● Shot Profile: Transition rim +3pp, Corner 3s +2pp, Pull-up 3s +2pp, Midrange −2pp
● Turnover Pressure: +4pp
● Foul Rate: +2pp
● Explanation: Mirror match. Two high-pressure, high-pace systems. Extreme volatility.
Decided by depth, conditioning, and ball security.
END OF PART 1: SYSTEM × SYSTEM INTERACTION (120 entries complete)
PART 2: OFFENSIVE ARCHETYPE ×
DEFENSIVE SYSTEM
Each archetype's baseline is neutral — no defensive modifier applied. All deltas are relative to
that baseline. Usage is governed upstream. These deltas modify shot mix, efficiency, ball
security, and foul rates only.
Format per entry: Shot Mix (PP shifts), Efficiency (PP or % shifts), Ball Security / Fouls (PP
shifts), Rationale.
Offensive Archetype 1: Two-Way Wing

Identity: Scales on both ends. Spot-up shooting + on-ball containment. Not a primary creator —
contributes through spacing, cutting, and defensive versatility.
Offensive baseline: Moderate spot-up volume, some cutting, limited self-creation. Efficient but
low-usage.
vs Containment Man
● Shot Mix: Spot-up 3s +1pp, Cut layups +1pp
● Efficiency: 3PT FG% +1pp, Rim FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Containment doesn't pressure off-ball players aggressively. Clean
catch-and-shoot looks and cutting lanes stay open.
vs Pack Line
● Shot Mix: Rim attempts −2pp, Spot-up 3s +2pp, Midrange +1pp
● Efficiency: Rim FG% −2pp, 3PT FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: −1pp
● Rationale: Pack Line congests cutting lanes. Pushed to perimeter where shooting holds
but rim finishing drops.
vs Pressure Man (Denial)
● Shot Mix: Spot-up 3s −2pp, Backdoor cuts +2pp, Rim attempts +1pp
● Efficiency: 3PT FG% −1pp, Rim FG% +1pp
● Turnover Rate: +1pp
● Foul-Draw Rate: +1pp
● Rationale: Denial disrupts catch-and-shoot game but opens backdoor cuts. TO risk rises
on contested catches.
vs Switch Everything
● Shot Mix: Spot-up 3s Neutral, Isolation drives +1pp
● Efficiency: 3PT FG% Neutral, Midrange FG% +1pp
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Switching doesn't heavily affect Two-Way Wing — not a primary screener or
initiator. Minor mismatch gains.
vs ICE / No-Middle
● Shot Mix: Wing 3s +1pp, Baseline drives +1pp, Middle drives −2pp

● Efficiency: 3PT FG% Neutral, Rim FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: ICE redirects ball handlers sideline, opening kickout lanes to the wing.
Minimal direct impact on off-ball players.
vs Zone (Structured)
● Shot Mix: Spot-up 3s +2pp, Short corner +1pp, Cut layups −2pp
● Efficiency: 3PT FG% +1pp, Rim FG% −1pp
● Turnover Rate: −1pp
● Foul-Draw Rate: −1pp
● Rationale: Zone gives spot-up shooters clean looks. Cutting lanes disappear against
zone structure.
vs Matchup Zone / Hybrid
● Shot Mix: Spot-up 3s +1pp, Midrange +1pp
● Efficiency: 3PT FG% Neutral
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Hybrid partially tracks but coverage confusion creates occasional open looks.
vs Press / Pressure Defense
● Shot Mix: Transition 3s +1pp, Early rim attempts +1pp
● Efficiency: 3PT FG% Neutral, Rim FG% +1pp
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Reliable outlet in press-break situations. Gets early transition looks.
vs Junk / Special
● Shot Mix: Spot-up 3s Neutral, Midrange +1pp
● Efficiency: 3PT FG% −1pp
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Junk rarely targets Two-Way Wings specifically. Minor disruption to rhythm but
low-usage role is resilient.
vs Coach K Defense
● Shot Mix: Spot-up 3s −2pp, Backdoor cuts +1pp, Midrange +1pp
● Efficiency: 3PT FG% −1.5pp

● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Denial suppresses catch-and-shoot. Backdoor instinct provides some counter.
No-threes math directly targets perimeter value.
Offensive Archetype 2: 3-and-D Wing
Identity: Spacing + reliable defense. Low creation, high trust. Primary offensive role is
catch-and-shoot three-point shooting.
Offensive baseline: High spot-up volume, minimal self-creation, efficient from three, limited rim
finishing.
vs Containment Man
● Shot Mix: 3PT attempts +2pp, Rim attempts +1pp
● Efficiency: 3PT FG% +1pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +0.5pp
● Rationale: Help stays in drop; kick-outs and drift cuts available. Clean catch-and-shoot
rhythm.
vs Pack Line
● Shot Mix: 3PT attempts +3pp, Rim attempts −1pp
● Efficiency: 3PT FG% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Paint loading prioritizes perimeter closeouts. More open threes.
vs Pressure Man (Denial)
● Shot Mix: 3PT attempts −3pp, Backdoor cuts +1pp
● Efficiency: 3PT FG% −2pp
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Denial is the hardest counter to 3-and-D Wing. Prevents clean catches. Lacks
handle to create off denial.
vs Switch Everything
● Shot Mix: 3PT attempts Neutral

● Efficiency: 3PT FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Switching barely affects 3-and-D Wings — not involved in screen actions
offensively. Stand and shoot regardless.
vs ICE / No-Middle
● Shot Mix: Wing 3s +1pp, Corner 3s +1pp
● Efficiency: 3PT FG% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: ICE redirects ball handlers sideline, generating more kickout passes to
spotting wings.
vs Zone (Structured)
● Shot Mix: 3PT attempts +4pp, Short corner +1pp
● Efficiency: 3PT FG% −1pp
● Turnover Rate: Neutral
● Foul-Draw Rate: −1pp
● Rationale: Zone concedes volume threes but contests more aggressively. Best volume
environment for shooters.
vs Matchup Zone / Hybrid
● Shot Mix: 3PT attempts +2pp
● Efficiency: 3PT FG% −0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Hybrid partially tracks shooters but can lose them during rotations.
vs Press / Pressure Defense
● Shot Mix: Transition 3s +2pp, Early spot-ups +1pp
● Efficiency: 3PT FG% +1pp
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Transition spot-ups offset pressure risk.
vs Junk / Special
● Shot Mix: 3PT attempts −3pp, Midrange +1pp
● Efficiency: 3PT FG% −3pp

● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Chasers and top-locks directly target 3-and-D Wings. Their primary weapon is
suppressed.
vs Coach K Defense
● Shot Mix: 3PT attempts −3pp, Backdoor cuts +1pp, Midrange +1pp
● Efficiency: 3PT FG% −2.5pp
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Coach K defense is the hardest counter to 3-and-D Wings. Run off the line,
denied catches, chased off screens. Primary weapon suppressed.
Offensive Archetype 3: POA Defender Guard
Identity: Defense-first guard who can take the toughest assignment. Limited offensive creation.
Contributes through defense, not scoring.
Offensive baseline: Very low usage. Spot-up 3s when open, occasional cuts. Limited
self-creation. Low efficiency variance because low volume.
vs Containment Man
● Shot Mix: Spot-up 3s +1pp, Cut layups +1pp
● Efficiency: 3PT FG% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Containment ignores non-threats. POA Defender gets open looks by being
the 4th or 5th option.
vs Pack Line
● Shot Mix: Spot-up 3s +1pp, Rim attempts −1pp
● Efficiency: 3PT FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Pack Line doesn't allocate help toward non-creators. Marginally open
perimeter.
vs Pressure Man (Denial)

● Shot Mix: Spot-up 3s −1pp
● Efficiency: 3PT FG% −1pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Even minimal denial disrupts a non-creator's catch rhythm. Low-volume
player is fragile offensively.
vs Switch Everything
● Shot Mix: Neutral
● Efficiency: Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Switching has near-zero effect on a non-scoring guard. The defense gains
nothing by switching onto them.
vs ICE / No-Middle
● Shot Mix: Wing 3s +1pp
● Efficiency: 3PT FG% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: ICE redirects ball handlers, occasionally freeing weak-side outlets. Marginal
benefit.
vs Zone (Structured)
● Shot Mix: Spot-up 3s +2pp, Cut layups −1pp
● Efficiency: 3PT FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: −1pp
● Rationale: Zone ignores non-threats. POA Defender stands in gaps and gets open, but
rarely capitalizes at high rates.
vs Matchup Zone / Hybrid
● Shot Mix: Spot-up 3s +1pp
● Efficiency: 3PT FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Hybrid coverage confusion occasionally leaves the non-scorer open.
vs Press / Pressure Defense

● Shot Mix: Transition layups +1pp
● Efficiency: Rim FG% +0.5pp
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Press creates chaos. POA Defender can handle the ball in press-break but
isn't an offensive threat in transition.
vs Junk / Special
● Shot Mix: Neutral
● Efficiency: Neutral
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Junk doesn't target non-scorers. Near-zero offensive interaction.
vs Coach K Defense
● Shot Mix: Spot-up 3s −1pp, Midrange +0.5pp
● Efficiency: 3PT FG% −1pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Non-scorer barely affected. Denial disrupts minimal catch-and-shoot.
Offensive Archetype 4: Primary Ball-Handler
(Offense-First)
Identity: Usage engine. Creates advantages; defense is secondary. PnR operator, pull-up
shooter, downhill creator.
Offensive baseline: Very high usage. Shot mix: rim + pull-up 3, secondary midrange. Efficiency:
skill-dependent, advantage-driven. Turnovers: moderate-high (creation load). Fouls drawn: high.
vs Containment Man
● Shot Mix: Rim attempts +2pp, Pull-up 3 attempts +1pp, Midrange Neutral
● Efficiency: Rim FG% +1pp, Pull-up 3P% +0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +2pp
● Rationale: Drop coverage invites downhill pressure and pull-ups.
vs Pack Line

● Shot Mix: Rim attempts −3pp, Pull-up 3 attempts +2pp, Midrange +1pp
● Efficiency: Rim FG% −2pp, Pull-up 3P% −0.5pp
● Turnover Rate: +1pp
● Foul-Draw Rate: −1.5pp
● Rationale: Paint crowding forces perimeter creation and tougher finishes.
vs Pressure Man (Denial)
● Shot Mix: Rim attempts +1pp, Pull-up 3 attempts +1pp
● Efficiency: Rim FG% Neutral, Pull-up 3P% −0.5pp
● Turnover Rate: +2pp
● Foul-Draw Rate: +1pp
● Rationale: Ball pressure increases volatility and mistakes.
vs Switch Everything
● Shot Mix: Rim attempts +2pp, Pull-up 3 attempts +1pp, Midrange −1pp
● Efficiency: Rim FG% +1.5pp, Pull-up 3P% +0.5pp
● Turnover Rate: +1pp
● Foul-Draw Rate: +1.5pp
● Rationale: Isolation hunting and mismatch exploitation.
vs ICE / No-Middle
● Shot Mix: Rim attempts −2pp, Pull-up 3 attempts +1pp, Midrange +1pp
● Efficiency: Rim FG% −1.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: −1pp
● Rationale: Forces baseline drives and tougher angles.
vs Zone (Structured)
● Shot Mix: Rim attempts −4pp, Pull-up 3 attempts +2pp, Midrange +2pp
● Efficiency: Rim FG% −3pp, Pull-up 3P% −1pp
● Turnover Rate: +1.5pp
● Foul-Draw Rate: −2pp
● Rationale: Paint protection limits rim pressure; jumpers rise.
vs Matchup Zone / Hybrid
● Shot Mix: Rim attempts −2pp, Pull-up 3 attempts +1pp, Midrange +1pp
● Efficiency: Rim FG% −1.5pp
● Turnover Rate: +1pp
● Foul-Draw Rate: −1.5pp

● Rationale: Delayed switches disrupt rhythm without full paint collapse.
vs Press / Pressure Defense
● Shot Mix: Rim attempts +2pp, Pull-up 3 attempts +1pp
● Efficiency: Rim FG% +0.5pp
● Turnover Rate: +2pp
● Foul-Draw Rate: +1pp
● Rationale: Early offense chances offset turnover risk.
vs Junk / Special
● Shot Mix: Rim attempts −3pp, Pull-up 3 attempts +2pp, Midrange +1pp
● Efficiency: Rim FG% −2.5pp
● Turnover Rate: +2pp
● Foul-Draw Rate: −2pp
● Rationale: Traps and shadows force contested pull-ups.
vs Coach K Defense
● Shot Mix: Rim attempts −1pp, Pull-up 3s −2pp, Midrange pull-ups +3pp
● Efficiency: Rim FG% −1pp, Pull-up 3P% −1.5pp
● Turnover Rate: +2pp
● Foul-Draw Rate: +1pp
● Rationale: POA defenders contain. Rim protector erases drives. No-threes forces pull-up
midrange. Higher turnover rate.
Offensive Archetype 5: Switchable Defender Wing
Identity: Defense-first wing who can credibly switch across positions. Offensively limited —
contributes through spacing and occasional cuts, not creation.
Offensive baseline: Low usage. Spot-up 3s when open, opportunistic cuts. No self-creation.
Similar offensive profile to POA Defender Guard but at wing size.
vs Containment Man
● Shot Mix: Spot-up 3s +1pp, Cut layups +1pp
● Efficiency: 3PT FG% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral

● Rationale: Containment ignores non-creators. Switchable Defender gets open as the
low-usage option.
vs Pack Line
● Shot Mix: Spot-up 3s +1pp, Rim attempts −1pp
● Efficiency: 3PT FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Pack Line allocates help elsewhere. Marginal perimeter opening.
vs Pressure Man (Denial)
● Shot Mix: Spot-up 3s −1pp, Backdoor cuts +1pp
● Efficiency: 3PT FG% −1pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Denial disrupts catch timing for non-creators. Backdoor instinct provides some
counter.
vs Switch Everything
● Shot Mix: Neutral
● Efficiency: Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Near-zero offensive interaction. Defense gains nothing by switching onto a
non-scorer.
vs ICE / No-Middle
● Shot Mix: Wing 3s +1pp
● Efficiency: 3PT FG% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Weak-side spacing occasionally opens. Marginal benefit.
vs Zone (Structured)
● Shot Mix: Spot-up 3s +2pp, Cut layups −1pp
● Efficiency: 3PT FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: −1pp

● Rationale: Zone ignores non-threats. Gets open in gaps but rarely maximizes
opportunity.
vs Matchup Zone / Hybrid
● Shot Mix: Spot-up 3s +1pp
● Efficiency: 3PT FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Coverage confusion occasionally leaves defender-wing open.
vs Press / Pressure Defense
● Shot Mix: Transition layups +1pp
● Efficiency: Rim FG% +0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Length helps in press-break outlet but not an offensive weapon in transition.
vs Junk / Special
● Shot Mix: Neutral
● Efficiency: Neutral
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Junk doesn't target non-scorers. Near-zero offensive interaction.
vs Coach K Defense
● Shot Mix: Spot-up 3s −1pp, Midrange +0.5pp
● Efficiency: 3PT FG% −1pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Non-scorer. Minimal interaction. Denial disrupts marginal catch-and-shoot.
Offensive Archetype 6: Anchor Big
Identity: Paint controller; drop coverage backbone. Offensively limited — scores on putbacks,
dump-offs, and occasional post touches. Not a self-creator.
Offensive baseline: Very low usage. Rim-only shot diet (putbacks, lobs, dump-offs). No
perimeter game. Fouls drawn through physical play.

vs Containment Man
● Shot Mix: Rim attempts +2pp
● Efficiency: Rim FG% +1pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +1pp
● Rationale: Drop coverage yields soft box-outs and dump-off opportunities. Physical post
play draws fouls.
vs Pack Line
● Shot Mix: Rim attempts −1pp, Midrange face-ups +1pp
● Efficiency: Rim FG% −1pp
● Turnover Rate: Neutral
● Foul-Draw Rate: −0.5pp
● Rationale: Multiple bodies in the paint suppress putback opportunities.
vs Pressure Man (Denial)
● Shot Mix: Rim attempts +1pp
● Efficiency: Rim FG% +0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Chaotic possessions create dump-off and putback chances.
vs Switch Everything
● Shot Mix: Post-up mismatches +2pp, Rim attempts +1pp
● Efficiency: Rim FG% +2pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +1.5pp
● Rationale: Switches put smaller defenders on the Anchor Big, creating easy post-up and
seal opportunities.
vs ICE / No-Middle
● Shot Mix: Rim attempts Neutral
● Efficiency: Rim FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: ICE affects ball handlers more than post players. Minimal impact on Anchor
Big's rim-only game.
vs Zone (Structured)

● Shot Mix: Rim attempts +2pp, Short midrange +1pp
● Efficiency: Rim FG% +1pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +1pp
● Rationale: Zone rebounding assignments create crash seams. Anchor Big thrives on
putbacks against zone.
vs Matchup Zone / Hybrid
● Shot Mix: Rim attempts +1pp
● Efficiency: Rim FG% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +0.5pp
● Rationale: Delayed box-outs favor physical rebounders.
vs Press / Pressure Defense
● Shot Mix: Rim attempts +1pp
● Efficiency: Rim FG% +0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Broken possessions increase putback and dump-off chaos.
vs Junk / Special
● Shot Mix: Rim attempts −1pp
● Efficiency: Rim FG% −1pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: −1pp
● Rationale: Pre-rotations and hit-first rules suppress crashers.
vs Coach K Defense
● Shot Mix: Rim attempts Neutral, Post touches Neutral
● Efficiency: Rim FG% Neutral
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Coach K defense targets perimeter shooters and drivers, not post players.
Anchor Big's rim game relatively unaffected.
Offensive Archetype 7: Stretch Big

Identity: Spacing big; offense via gravity, defense via positioning. Pick-and-pop threat. Drags rim
protectors to perimeter.
Offensive baseline: Low-moderate usage. High 3PT (catch-and-shoot, pick-and-pop), moderate
midrange, low rim. Turnovers: low. Fouls drawn: low-moderate (closeouts).
vs Containment Man
● Shot Mix: 3PT attempts +3pp, Rim attempts −1pp
● Efficiency: 3P% +1.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +1pp
● Rationale: Drop coverage concedes pick-and-pop spacing.
vs Pack Line
● Shot Mix: 3PT attempts +4pp, Rim attempts −2pp
● Efficiency: 3P% +1pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +0.5pp
● Rationale: Paint loading forces kick-outs to spacing bigs.
vs Pressure Man (Denial)
● Shot Mix: 3PT attempts +1pp
● Efficiency: 3P% −0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Ball pressure affects timing more than spacing.
vs Switch Everything
● Shot Mix: 3PT attempts +2pp, Rim attempts +1pp, Midrange −1pp
● Efficiency: 3P% +0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +1pp
● Rationale: Short rolls and size mismatches create pop space.
vs ICE / No-Middle
● Shot Mix: 3PT attempts +2pp, Rim attempts −1pp
● Efficiency: 3P% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Baseline forcing opens weak-side pop windows.

vs Zone (Structured)
● Shot Mix: 3PT attempts +5pp, Midrange −1pp, Rim attempts −2pp
● Efficiency: 3P% −1pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Zones concede high-volume above-the-break threes.
vs Matchup Zone / Hybrid
● Shot Mix: 3PT attempts +3pp, Rim attempts −1pp
● Efficiency: 3P% −0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Hybrid closeouts reduce shot quality but not volume.
vs Press / Pressure Defense
● Shot Mix: 3PT attempts +2pp
● Efficiency: 3P% Neutral
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Early offense yields trailing-big pop threes.
vs Junk / Special
● Shot Mix: 3PT attempts −2pp, Midrange +1pp, Rim attempts −1pp
● Efficiency: 3P% −2pp
● Turnover Rate: +1pp
● Foul-Draw Rate: −1pp
● Rationale: Face-ups and stunts disrupt shooting rhythm.
vs Coach K Defense
● Shot Mix: 3PT attempts −3pp, Midrange face-ups +2pp, Rim attempts Neutral
● Efficiency: 3PT FG% −2pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: No-threes math runs Stretch Bigs off the line. Pop opportunities suppressed.
Forced into face-up midrange.
Offensive Archetype 8: Connector Guard

Identity: Low-usage organizer; keeps offense and defense coherent. Ball-mover, decision
accelerator, advantage extender.
Offensive baseline: Low-moderate usage. Balanced shot mix (spot-up 3s, cuts, opportunistic
rim). High efficiency via decision quality. Turnovers: low. Fouls drawn: low-moderate.
vs Containment Man
● Shot Mix: 3PT attempts +1pp, Rim attempts +1pp
● Efficiency: Overall FG% +1pp
● Turnover Rate: −0.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Reads are clean; connectors thrive when help is predictable.
vs Pack Line
● Shot Mix: 3PT attempts +2pp, Rim attempts −1pp
● Efficiency: 3P% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Kick-out decisions increase connector value.
vs Pressure Man (Denial)
● Shot Mix: 3PT attempts −1pp, Rim attempts +1pp
● Efficiency: Overall FG% −0.5pp
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Passing lanes tighten; processing speed is tested.
vs Switch Everything
● Shot Mix: Rim attempts +1pp
● Efficiency: Overall FG% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +0.5pp
● Rationale: Exploits mismatches through cuts and quick decisions.
vs ICE / No-Middle
● Shot Mix: 3PT attempts +1pp
● Efficiency: 3P% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Weak-side spacing opens simple reads.

vs Zone (Structured)
● Shot Mix: 3PT attempts +2pp, Rim attempts −1pp
● Efficiency: Overall FG% −0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Zone slows ball movement but still rewards quick decisions.
vs Matchup Zone / Hybrid
● Shot Mix: 3PT attempts +1pp, Rim attempts −1pp
● Efficiency: Overall FG% −0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Delayed rotations reduce clean advantage chains.
vs Press / Pressure Defense
● Shot Mix: Rim attempts +1pp
● Efficiency: Overall FG% Neutral
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Transition decisions matter more than half-court reads.
vs Junk / Special
● Shot Mix: 3PT attempts −1pp, Rim attempts −1pp, Midrange +1pp
● Efficiency: Overall FG% −1pp
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Irregular coverage disrupts flow players.
vs Coach K Defense
● Shot Mix: 3PT attempts −1pp, Rim attempts Neutral, Midrange +0.5pp
● Efficiency: Overall FG% −0.5pp
● Turnover Rate: +1.5pp
● Foul-Draw Rate: Neutral
● Rationale: Denial stresses passing lanes. Connector's decision-making tested under
pressure. Turnover risk rises significantly.
Offensive Archetype 9: Offensive Wing Scorer

Identity: Shot-creation wing; offense drives value, defense is managed. Downhill attacker,
closeout killer, foul-draw engine.
Offensive baseline: Moderate-high usage. High rim, moderate pull-up 3, limited midrange.
Contact-dependent efficiency. Turnovers: moderate. Fouls drawn: high.
vs Containment Man
● Shot Mix: Rim attempts +3pp, Midrange Neutral, 3PT attempts −1pp
● Efficiency: Rim FG% +2pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +2pp
● Rationale: Drop-style containment allows straight-line drives.
vs Pack Line
● Shot Mix: Rim attempts −4pp, Midrange +2pp, 3PT Neutral
● Efficiency: Rim FG% −3pp
● Turnover Rate: +1.5pp
● Foul-Draw Rate: −3pp
● Rationale: Loaded paint removes driving lanes.
vs Pressure Man (Denial)
● Shot Mix: Rim attempts +1pp
● Efficiency: Rim FG% Neutral
● Turnover Rate: +2pp
● Foul-Draw Rate: +1pp
● Rationale: Aggression creates both blow-bys and mistakes.
vs Switch Everything
● Shot Mix: Rim attempts +2pp, Midrange −1pp
● Efficiency: Rim FG% +1.5pp
● Turnover Rate: +1pp
● Foul-Draw Rate: +1.5pp
● Rationale: Mismatches favor athletic downhill wings.
vs ICE / No-Middle
● Shot Mix: Rim attempts −2pp, Midrange +2pp
● Efficiency: Rim FG% −1.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: −1.5pp
● Rationale: Baseline forcing limits power drives.

vs Zone (Structured)
● Shot Mix: Rim attempts −5pp, Midrange +3pp
● Efficiency: Rim FG% −4pp
● Turnover Rate: +2pp
● Foul-Draw Rate: −4pp
● Rationale: Zones erase straight-line penetration.
vs Matchup Zone / Hybrid
● Shot Mix: Rim attempts −3pp, Midrange +2pp
● Efficiency: Rim FG% −2.5pp
● Turnover Rate: +1.5pp
● Foul-Draw Rate: −3pp
● Rationale: Delayed help still loads the paint.
vs Press / Pressure Defense
● Shot Mix: Rim attempts +2pp, 3PT −1pp
● Efficiency: Rim FG% +1pp
● Turnover Rate: +2pp
● Foul-Draw Rate: +1pp
● Rationale: Open-floor attacks offset ball pressure.
vs Junk / Special
● Shot Mix: Rim attempts −4pp, Midrange +2pp
● Efficiency: Rim FG% −3.5pp
● Turnover Rate: +2pp
● Foul-Draw Rate: −3.5pp
● Rationale: Gap rules, walls, and stunts neutralize slashers.
vs Coach K Defense
● Shot Mix: Rim attempts −1pp, 3PT −1pp, Midrange +2pp
● Efficiency: Rim FG% −1.5pp, 3PT FG% −1pp
● Turnover Rate: +1.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Rim protector contests drives. No-threes suppresses kick-out 3s. Funneled
into contested midrange. Still draws some fouls.
Offensive Archetype 10: Gap / Team Defender Wing

Identity: IQ-driven defender; wins with positioning and communication. Offensively minimal —
even less creation than 3-and-D since defense is the primary identity.
Offensive baseline: Very low usage. Occasional spot-up 3s, corner standing, rare cuts. Offense
is incidental.
vs Containment Man
● Shot Mix: Spot-up 3s +1pp
● Efficiency: 3PT FG% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Defensive help ignores this player completely. Gets open by being irrelevant
offensively.
vs Pack Line
● Shot Mix: Spot-up 3s +1pp
● Efficiency: 3PT FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Pack Line allocates all help elsewhere. Marginal perimeter opening.
vs Pressure Man (Denial)
● Shot Mix: Spot-up 3s −1pp
● Efficiency: 3PT FG% −1pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Even minimal denial disrupts a non-creator. Fragile offensive role.
vs Switch Everything
● Shot Mix: Neutral
● Efficiency: Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Zero offensive interaction. Defense gains nothing switching onto this
archetype.
vs ICE / No-Middle
● Shot Mix: Corner 3s +1pp
● Efficiency: 3PT FG% +0.5pp
● Turnover Rate: Neutral

● Foul-Draw Rate: Neutral
● Rationale: Weak-side corner opens marginally.
vs Zone (Structured)
● Shot Mix: Spot-up 3s +2pp
● Efficiency: 3PT FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Zone ignores non-threats. Gets open in gaps.
vs Matchup Zone / Hybrid
● Shot Mix: Spot-up 3s +1pp
● Efficiency: 3PT FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Coverage confusion occasionally leaves gap-defender open.
vs Press / Pressure Defense
● Shot Mix: Transition layups +0.5pp
● Efficiency: Neutral
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Minimal offensive role in press-break or transition.
vs Junk / Special
● Shot Mix: Neutral
● Efficiency: Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Junk ignores non-scorers entirely.
vs Coach K Defense
● Shot Mix: Spot-up 3s −1pp, Midrange +0.5pp
● Efficiency: Neutral
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Non-scorer. Minimal offensive interaction.

Offensive Archetype 11: Mobile Defensive Big
Identity: Big who survives space; P&R defender more than paint anchor. Offensively limited —
similar to Anchor Big but even less post game. Contributes rim rolls, putbacks, short-roll
passing.
Offensive baseline: Very low usage. Rim-only (rolls, putbacks, dump-offs). Occasionally shows
short-roll passing. No perimeter game.
vs Containment Man
● Shot Mix: Rim attempts +1pp, Short-roll passing +0.5pp
● Efficiency: Rim FG% +1pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +0.5pp
● Rationale: Drop coverage yields soft help. Dump-offs available.
vs Pack Line
● Shot Mix: Rim attempts −1pp
● Efficiency: Rim FG% −1pp
● Turnover Rate: Neutral
● Foul-Draw Rate: −0.5pp
● Rationale: Multiple paint bodies suppress easy finishes.
vs Pressure Man (Denial)
● Shot Mix: Rim attempts +0.5pp
● Efficiency: Rim FG% Neutral
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Chaos creates dump-off and roll opportunities.
vs Switch Everything
● Shot Mix: Rim attempts +1pp, Post-up mismatches +1pp
● Efficiency: Rim FG% +1pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +1pp
● Rationale: Switches put smaller defenders on Mobile Big. Size advantage at rim.
vs ICE / No-Middle
● Shot Mix: Rim attempts Neutral

● Efficiency: Rim FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: ICE affects ball handlers, not roll men directly. Short-roll passing slightly
disrupted.
vs Zone (Structured)
● Shot Mix: Rim attempts +1pp, Short midrange +1pp
● Efficiency: Rim FG% +0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Zone rebounding assignments create crash seams.
vs Matchup Zone / Hybrid
● Shot Mix: Rim attempts +0.5pp
● Efficiency: Rim FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Delayed box-outs favor mobile rebounders.
vs Press / Pressure Defense
● Shot Mix: Rim attempts +0.5pp
● Efficiency: Rim FG% +0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Broken possessions create roll and putback chaos.
vs Junk / Special
● Shot Mix: Rim attempts −1pp
● Efficiency: Rim FG% −0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: −0.5pp
● Rationale: Pre-rotations suppress easy rim attempts.
vs Coach K Defense
● Shot Mix: Rim attempts Neutral
● Efficiency: Rim FG% Neutral
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral

● Rationale: Minimal offensive role. Coach K defense doesn't target non-scoring bigs.
Offensive Archetype 12: Chaos Disruptor Wing
Identity: High-activity, high-variance defender; creates disorder. Offensively limited but provides
transition scoring, putbacks from deflections, and occasional open 3s from defensive activity
creating fast-break looks.
Offensive baseline: Low-moderate usage. Transition scoring, opportunistic rim attempts, some
spot-up 3s. High variance.
vs Containment Man
● Shot Mix: Transition rim +1pp, Spot-up 3s +1pp
● Efficiency: Rim FG% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +0.5pp
● Rationale: Containment allows offensive flow; Chaos Wing gets transition looks from
defensive activity.
vs Pack Line
● Shot Mix: Spot-up 3s +1pp, Rim attempts −1pp
● Efficiency: 3PT FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Pack Line suppresses transition rim opportunities. Perimeter remains open.
vs Pressure Man (Denial)
● Shot Mix: Rim attempts +1pp
● Efficiency: Rim FG% Neutral
● Turnover Rate: +1pp
● Foul-Draw Rate: +0.5pp
● Rationale: Pressure creates chaotic possessions that Chaos Wing thrives in offensively.
vs Switch Everything
● Shot Mix: Rim attempts +1pp
● Efficiency: Rim FG% +0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +0.5pp

● Rationale: Switches occasionally create driving lanes for athletic wings.
vs ICE / No-Middle
● Shot Mix: Wing 3s +1pp
● Efficiency: 3PT FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Weak-side spacing marginally opens.
vs Zone (Structured)
● Shot Mix: Spot-up 3s +2pp, Rim attempts −1pp
● Efficiency: 3PT FG% −1pp
● Turnover Rate: Neutral
● Foul-Draw Rate: −1pp
● Rationale: Zone suppresses transition scoring but opens perimeter.
vs Matchup Zone / Hybrid
● Shot Mix: Spot-up 3s +1pp
● Efficiency: 3PT FG% Neutral
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Hybrid confusion occasionally benefits high-energy players.
vs Press / Pressure Defense
● Shot Mix: Transition rim +2pp, Transition 3s +1pp
● Efficiency: Rim FG% +1pp
● Turnover Rate: +1.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Press creates the chaos this archetype thrives in. Highest offensive upside
environment.
vs Junk / Special
● Shot Mix: Neutral
● Efficiency: Neutral
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Junk doesn't target Chaos Wings. Disruption is mutual.
vs Coach K Defense

● Shot Mix: Transition rim +1pp, Spot-up 3s −1pp
● Efficiency: 3PT FG% −1pp
● Turnover Rate: +1pp
● Foul-Draw Rate: +0.5pp
● Rationale: Gets some transition looks from pressure environment but no-threes
suppresses spot-up 3s.
Offensive Archetype 13: Point Forward
Identity: Size-based secondary creator; offense flows through them without full guard burden.
Playmaking vision + ball security at forward size.
Offensive baseline: Moderate usage. Balanced: post-up face-ups, drive-and-kick, pull-up
midrange, some spot-up 3s. High assist rate. Turnovers: moderate. Fouls drawn: moderate.
vs Containment Man
● Shot Mix: Post face-ups +1pp, Drive-and-kick 3s +1pp, Midrange +1pp
● Efficiency: Overall FG% +1pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +1pp
● Rationale: Containment gives Point Forwards clean reads and face-up opportunities at
their size.
vs Pack Line
● Shot Mix: Rim attempts −2pp, Midrange face-ups +2pp, Kick-out 3s +2pp
● Efficiency: Rim FG% −1pp, Midrange FG% +0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: −1pp
● Rationale: Paint congestion limits drives but face-up game and passing vision create
kick-out looks.
vs Pressure Man (Denial)
● Shot Mix: Post face-ups −1pp, Drive attempts +1pp
● Efficiency: Overall FG% −0.5pp
● Turnover Rate: +1.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Pressure on the Point Forward's handle is the primary vulnerability. Turnovers
spike.

vs Switch Everything
● Shot Mix: Post-up mismatches +2pp, Rim attempts +1pp
● Efficiency: Rim FG% +1.5pp, Overall FG% +1pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +1.5pp
● Rationale: Size-based creation exploits switches onto smaller defenders. Best offensive
environment.
vs ICE / No-Middle
● Shot Mix: Baseline drives +1pp, Midrange face-ups +1pp, Middle drives −2pp
● Efficiency: Overall FG% −0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: ICE redirects but Point Forward's face-up and passing game adapts to
baseline flow.
vs Zone (Structured)
● Shot Mix: High-post facilitating +3pp, Spot-up 3s +1pp, Rim attempts −2pp
● Efficiency: Overall FG% +0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: −1pp
● Rationale: Point Forwards are zone-killers at the high post. Passing vision exploits zone
gaps.
vs Matchup Zone / Hybrid
● Shot Mix: High-post face-ups +2pp, Midrange +1pp
● Efficiency: Overall FG% Neutral
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Hybrid coverage partially tracks but Point Forward reads the confusion.
vs Press / Pressure Defense
● Shot Mix: Transition rim +1pp, Early drives +1pp
● Efficiency: Overall FG% +0.5pp
● Turnover Rate: +1.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Point Forward can advance the ball in press-break. Handle vulnerability
creates turnover risk.

vs Junk / Special
● Shot Mix: Midrange +1pp, Post face-ups +1pp
● Efficiency: Overall FG% −0.5pp
● Turnover Rate: +1.5pp
● Foul-Draw Rate: −1pp
● Rationale: Junk specifically targets creators. Point Forward's handle is tested.
vs Coach K Defense
● Shot Mix: Post face-ups Neutral, 3PT −1pp, Midrange +1pp, Drives −0.5pp
● Efficiency: Overall FG% −0.5pp
● Turnover Rate: +1.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Denial stresses Point Forward's handle. Rim protector contests drives. Size
helps survive but efficiency drops.
Offensive Archetype 14: Utility Forward
Identity: Lineup glue; fills gaps without being a focal point. Motor + positioning + ball security.
Not a scorer.
Offensive baseline: Very low usage. Spot-up 3s when open, screens, cuts, putbacks. No
self-creation. Efficiency via role acceptance.
vs Containment Man
● Shot Mix: Spot-up 3s +1pp, Cut layups +0.5pp
● Efficiency: 3PT FG% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Help ignores Utility Forward. Open looks in gaps.
vs Pack Line
● Shot Mix: Spot-up 3s +1pp, Rim attempts −1pp
● Efficiency: 3PT FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Pack Line allocates help elsewhere. Marginal opening.
vs Pressure Man (Denial)

● Shot Mix: Spot-up 3s −1pp
● Efficiency: 3PT FG% −0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Even light denial disrupts non-creators.
vs Switch Everything
● Shot Mix: Rim attempts +0.5pp
● Efficiency: Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Switching may create occasional size mismatch for Utility Forward to exploit
via cuts.
vs ICE / No-Middle
● Shot Mix: Corner 3s +0.5pp
● Efficiency: 3PT FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Weak-side corner marginally opens.
vs Zone (Structured)
● Shot Mix: Spot-up 3s +1pp, Short corner +1pp
● Efficiency: 3PT FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Zone ignores non-threats. Utility Forward plants in gaps.
vs Matchup Zone / Hybrid
● Shot Mix: Spot-up 3s +0.5pp
● Efficiency: Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Marginal benefit from coverage confusion.
vs Press / Pressure Defense
● Shot Mix: Transition layups +0.5pp
● Efficiency: Neutral
● Turnover Rate: +0.5pp

● Foul-Draw Rate: Neutral
● Rationale: Motor helps in press-break outlet. Not an offensive weapon.
vs Junk / Special
● Shot Mix: Neutral
● Efficiency: Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Junk ignores non-scorers.
vs Coach K Defense
● Shot Mix: Spot-up 3s −1pp, Midrange +0.5pp
● Efficiency: Neutral
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Non-scorer. Minimal interaction.
Offensive Archetype 15: Roll Man / Vertical Threat
Identity: Creates offensive gravity via rim pressure; finishes plays. Screen + roll + finish.
Putbacks and lobs.
Offensive baseline: Low-moderate usage. Very high rim (rolls, lobs, putbacks, dump-offs).
Minimal midrange. No 3PT. Fouls drawn: high (contact at rim).
vs Containment Man
● Shot Mix: Rim attempts +2pp
● Efficiency: Rim FG% +1.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +1.5pp
● Rationale: Drop coverage yields soft box-outs and lob/dump-off opportunities.
vs Pack Line
● Shot Mix: Rim attempts −1pp
● Efficiency: Rim FG% −1pp
● Turnover Rate: Neutral
● Foul-Draw Rate: −1pp
● Rationale: Multiple bodies in the paint suppress easy rolls and lobs.

vs Pressure Man (Denial)
● Shot Mix: Rim attempts +1pp
● Efficiency: Rim FG% +0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Pressure on ball handler increases roll opportunities when screen is used.
vs Switch Everything
● Shot Mix: Rim attempts +3pp
● Efficiency: Rim FG% +2pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +2pp
● Rationale: Small defenders struggle with box-outs and vertical contests after switches.
vs ICE / No-Middle
● Shot Mix: Rim attempts −1pp, Short-roll +1pp
● Efficiency: Rim FG% −0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: −0.5pp
● Rationale: ICE limits downhill roll angles but short-roll game activates.
vs Zone (Structured)
● Shot Mix: Rim attempts +3pp
● Efficiency: Rim FG% +1.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +1.5pp
● Rationale: Zone rebounding assignments create crash seams. Roll Man dominates
offensive glass.
vs Matchup Zone / Hybrid
● Shot Mix: Rim attempts +2pp
● Efficiency: Rim FG% +1pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +1pp
● Rationale: Delayed box-outs favor high-motor roll men.
vs Press / Pressure Defense
● Shot Mix: Rim attempts +1pp

● Efficiency: Rim FG% +0.5pp
● Turnover Rate: +1pp
● Foul-Draw Rate: +0.5pp
● Rationale: Broken possessions increase lob and dump-off chaos.
vs Junk / Special
● Shot Mix: Rim attempts −2pp
● Efficiency: Rim FG% −1.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: −1.5pp
● Rationale: Pre-rotations and hit-first rules neutralize roll men.
vs Coach K Defense
● Shot Mix: Rim attempts −1pp, Short-roll +1pp
● Efficiency: Rim FG% −1pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: −0.5pp
● Rationale: Rim protector contests roll finishes. Short-roll passing increases.
Offensive Archetype 16: Offensive Big (Defense Liability)
Identity: Offense-first interior scorer; requires protection. Post scoring, touch finishing, foul
drawing. Defense is a minus.
Offensive baseline: Moderate usage. Very high rim (post-ups, hooks, turnarounds), moderate
midrange, minimal 3PT. Efficiency: high on seals, variable vs doubles. Turnovers: moderate.
Fouls drawn: very high.
vs Containment Man
● Shot Mix: Rim attempts +3pp, Midrange +1pp
● Efficiency: Rim FG% +2pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +3pp
● Rationale: Single-coverage post defense rewards strength and seals.
vs Pack Line
● Shot Mix: Rim attempts −3pp, Midrange +2pp
● Efficiency: Rim FG% −2pp

● Turnover Rate: +1.5pp
● Foul-Draw Rate: −1.5pp
● Rationale: Crowded paint invites digs and early doubles.
vs Pressure Man (Denial)
● Shot Mix: Rim attempts +1pp, Midrange +1pp
● Efficiency: Rim FG% Neutral
● Turnover Rate: +2pp
● Foul-Draw Rate: +1pp
● Rationale: Aggressive entry denial increases volatility once ball is caught.
vs Switch Everything
● Shot Mix: Rim attempts +4pp, Midrange −1pp
● Efficiency: Rim FG% +3pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +3pp
● Rationale: Small-on-big mismatches strongly favor post scorers.
vs ICE / No-Middle
● Shot Mix: Rim attempts −1pp, Midrange +2pp
● Efficiency: Rim FG% −1pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: −0.5pp
● Rationale: Baseline forcing alters post entry angles.
vs Zone (Structured)
● Shot Mix: Rim attempts −5pp, Midrange +3pp
● Efficiency: Rim FG% −4pp
● Turnover Rate: +2pp
● Foul-Draw Rate: −4pp
● Rationale: Zone collapses neutralize post seals and reduce fouls.
vs Matchup Zone / Hybrid
● Shot Mix: Rim attempts −3pp, Midrange +2pp
● Efficiency: Rim FG% −2.5pp
● Turnover Rate: +1.5pp
● Foul-Draw Rate: −3pp
● Rationale: Late doubles and stunts disrupt rhythm.

vs Press / Pressure Defense
● Shot Mix: Rim attempts +2pp, Midrange +1pp
● Efficiency: Rim FG% +1pp
● Turnover Rate: +1pp
● Foul-Draw Rate: +1.5pp
● Rationale: Early seals before defense sets increase scoring chances.
vs Junk / Special
● Shot Mix: Rim attempts −4pp, Midrange +2pp
● Efficiency: Rim FG% −3.5pp
● Turnover Rate: +2pp
● Foul-Draw Rate: −3pp
● Rationale: Fronts, traps, and scrams explicitly target post hubs.
vs Coach K Defense
● Shot Mix: Rim attempts −1pp, Midrange +1pp
● Efficiency: Rim FG% −1.5pp
● Turnover Rate: +1pp
● Foul-Draw Rate: −0.5pp
● Rationale: Rim protector directly contests post finishes. Denial stresses entry passes.
Offensive Archetype 17: Situational Shooter (Specialist)
Identity: One-job player: spacing. Limited elsewhere. Catch-and-shoot specialist with movement
shooting.
Offensive baseline: Low usage. Very high 3PT (catch-and-shoot + movement), minimal rim, low
midrange. High efficiency when clean, fragile under disruption. Turnovers: very low. Fouls
drawn: low.
vs Containment Man
● Shot Mix: 3PT attempts +2pp
● Efficiency: 3P% +1.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +0.5pp
● Rationale: Drop coverage prioritizes paint; shooters gain clean perimeter looks.
vs Pack Line

● Shot Mix: 3PT attempts +3pp, Rim attempts −1pp
● Efficiency: 3P% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Help-heavy paint defense concedes kick-outs and relocations.
vs Pressure Man (Denial)
● Shot Mix: 3PT attempts −2pp, Midrange +1pp
● Efficiency: 3P% −2pp
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Face-guarding and denial suppress rhythm threes. Hardest counter to
shooters.
vs Switch Everything
● Shot Mix: 3PT attempts −1pp, Midrange +1pp
● Efficiency: 3P% −1pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Switches remove screen advantage and limit separation.
vs ICE / No-Middle
● Shot Mix: 3PT attempts +1pp
● Efficiency: 3P% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Ball containment shifts help toward handlers, freeing weak-side shooters.
vs Zone (Structured)
● Shot Mix: 3PT attempts +4pp, Midrange −1pp, Rim attempts −1pp
● Efficiency: 3P% −1pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Zones concede volume threes but contest more aggressively.
vs Matchup Zone / Hybrid
● Shot Mix: 3PT attempts +2pp, Rim attempts −1pp
● Efficiency: 3P% −0.5pp
● Turnover Rate: +0.5pp

● Foul-Draw Rate: Neutral
● Rationale: Hybrid coverage limits clean movement windows.
vs Press / Pressure Defense
● Shot Mix: 3PT attempts +1pp
● Efficiency: 3P% Neutral
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Early offense produces transition spot-ups.
vs Junk / Special
● Shot Mix: 3PT attempts −3pp, Midrange +1pp
● Efficiency: 3P% −3pp
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Chasers and top-locks directly neutralize movement shooters.
vs Coach K Defense
● Shot Mix: 3PT attempts −4pp, Midrange +2pp
● Efficiency: 3PT FG% −3pp
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: No-threes math specifically designed to neutralize shooters. Chasers, denial,
top-locks all applied. Hardest defensive environment for Situational Shooters.
Offensive Archetype 18: Defensive Specialist
(Non-Scoring)
Identity: Defense-only contributor; offense minimized. On-ball containment + screen navigation
+ team defense. No creation.
Offensive baseline: Minimal usage. Rare spot-up 3s, occasional cuts. Offense is liability-level.
Near-zero scoring impact.
vs Containment Man
● Shot Mix: Spot-up 3s +0.5pp
● Efficiency: Neutral

● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Defense completely ignores this player offensively. Occasionally open by
default.
vs Pack Line
● Shot Mix: Spot-up 3s +0.5pp
● Efficiency: Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Pack Line allocates all help elsewhere.
vs Pressure Man (Denial)
● Shot Mix: Neutral
● Efficiency: Neutral
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Even minimal pressure disrupts a non-scorer's catch. Fragile.
vs Switch Everything
● Shot Mix: Neutral
● Efficiency: Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Zero offensive interaction.
vs ICE / No-Middle
● Shot Mix: Neutral
● Efficiency: Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: ICE affects ball handlers. This player isn't one.
vs Zone (Structured)
● Shot Mix: Spot-up 3s +1pp
● Efficiency: Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Zone ignores non-threats. Open by default but rarely converts.

vs Matchup Zone / Hybrid
● Shot Mix: Spot-up 3s +0.5pp
● Efficiency: Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Coverage confusion occasionally leaves open.
vs Press / Pressure Defense
● Shot Mix: Neutral
● Efficiency: Neutral
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Not an offensive threat in any context.
vs Junk / Special
● Shot Mix: Neutral
● Efficiency: Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Junk completely ignores non-scorers.
vs Coach K Defense
● Shot Mix: Neutral
● Efficiency: Neutral
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Non-scorer. Zero offensive interaction.
Offensive Archetype 19: Energy Big
Identity: Bench impact via effort, rebounding, rim pressure. Putback scorer, extra-possession
generator, screen + crash specialist.
Offensive baseline: Very low usage. Rim only (putbacks, dumps). Virtually no jumpers. Very high
efficiency on limited attempts. Turnovers: very low. Fouls drawn: moderate-high (scramble
finishes).
vs Containment Man

● Shot Mix: Rim attempts +2pp
● Efficiency: Rim FG% +1.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +1.5pp
● Rationale: Drop coverage yields soft box-outs and rebound lanes.
vs Pack Line
● Shot Mix: Rim attempts −1pp
● Efficiency: Rim FG% −1pp
● Turnover Rate: Neutral
● Foul-Draw Rate: −1pp
● Rationale: Multiple bodies in the paint suppress second chances.
vs Pressure Man (Denial)
● Shot Mix: Rim attempts +1pp
● Efficiency: Rim FG% +0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Chaotic possessions create crash opportunities.
vs Switch Everything
● Shot Mix: Rim attempts +3pp
● Efficiency: Rim FG% +2pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +2pp
● Rationale: Small defenders struggle with box-outs.
vs ICE / No-Middle
● Shot Mix: Rim attempts Neutral
● Efficiency: Rim FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Scheme affects ball containment more than rebounding lanes.
vs Zone (Structured)
● Shot Mix: Rim attempts +3pp
● Efficiency: Rim FG% +1.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +1.5pp

● Rationale: Zone rebounding assignments create crash seams.
vs Matchup Zone / Hybrid
● Shot Mix: Rim attempts +2pp
● Efficiency: Rim FG% +1pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +1pp
● Rationale: Delayed box-outs favor high-motor rebounders.
vs Press / Pressure Defense
● Shot Mix: Rim attempts +1pp
● Efficiency: Rim FG% +0.5pp
● Turnover Rate: +1pp
● Foul-Draw Rate: +0.5pp
● Rationale: Broken possessions increase rebound chaos.
vs Junk / Special
● Shot Mix: Rim attempts −2pp
● Efficiency: Rim FG% −1.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: −1.5pp
● Rationale: Pre-rotations and hit-first rules neutralize crashers.
vs Coach K Defense
● Shot Mix: Rim attempts −1pp
● Efficiency: Rim FG% −0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: −0.5pp
● Rationale: Rim protector limits putback quality. Energy Big's opportunities suppressed.
Offensive Archetype 20: Situational Ball-Handler (Bench
Guard)
Identity: Secondary handler; stabilizes units without full creation load. Off-ball creator, secondary
PnR operator, scoring + playmaking blend.

Offensive baseline: Moderate usage. Pull-up 3s, rim attacks, selective midrange. Efficiency
depends on matchup leverage. Turnovers: moderate. Fouls drawn: moderate.
vs Containment Man
● Shot Mix: Rim attempts +2pp, Pull-up 3 attempts +1pp
● Efficiency: Rim FG% +1pp, Pull-up 3P% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +1.5pp
● Rationale: Secondary attackers punish drop coverage when the primary draws help.
vs Pack Line
● Shot Mix: Rim attempts −2pp, Pull-up 3 attempts +2pp, Midrange +1pp
● Efficiency: Rim FG% −1.5pp
● Turnover Rate: +1pp
● Foul-Draw Rate: −1pp
● Rationale: Paint help forces perimeter creation.
vs Pressure Man (Denial)
● Shot Mix: Rim attempts +1pp, Pull-up 3 attempts +1pp
● Efficiency: Pull-up 3P% −0.5pp
● Turnover Rate: +1.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Ball pressure increases volatility for secondary handlers.
vs Switch Everything
● Shot Mix: Rim attempts +2pp, Pull-up 3 attempts +1pp, Midrange −1pp
● Efficiency: Rim FG% +1pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +1pp
● Rationale: Mismatch hunting favors skilled combo guards.
vs ICE / No-Middle
● Shot Mix: Rim attempts −1pp, Pull-up 3 attempts +1pp, Midrange +1pp
● Efficiency: Rim FG% −1pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: −0.5pp
● Rationale: Baseline forcing limits downhill angles.
vs Zone (Structured)

● Shot Mix: Rim attempts −3pp, Pull-up 3 attempts +2pp, Midrange +2pp
● Efficiency: Pull-up 3P% −1pp
● Turnover Rate: +1pp
● Foul-Draw Rate: −1.5pp
● Rationale: Zone slows penetration and invites jumpers.
vs Matchup Zone / Hybrid
● Shot Mix: Rim attempts −2pp, Pull-up 3 attempts +1pp, Midrange +1pp
● Efficiency: Overall FG% −0.5pp
● Turnover Rate: +1pp
● Foul-Draw Rate: −1pp
● Rationale: Late switches disrupt secondary creation.
vs Press / Pressure Defense
● Shot Mix: Rim attempts +2pp, Pull-up 3 attempts +1pp
● Efficiency: Rim FG% +0.5pp
● Turnover Rate: +1.5pp
● Foul-Draw Rate: +1pp
● Rationale: Early offense favors attacking combo guards.
vs Junk / Special
● Shot Mix: Rim attempts −3pp, Pull-up 3 attempts +2pp, Midrange +1pp
● Efficiency: Rim FG% −2pp
● Turnover Rate: +1.5pp
● Foul-Draw Rate: −1.5pp
● Rationale: Shadowing and traps target secondary initiators.
vs Coach K Defense
● Shot Mix: Rim attempts −1pp, Pull-up 3s −1pp, Midrange +2pp
● Efficiency: Rim FG% −1pp, Pull-up 3P% −1pp
● Turnover Rate: +2pp
● Foul-Draw Rate: +0.5pp
● Rationale: Secondary handlers tested by denial and POA pressure. Rim protector
contests drives. No-threes forces midrange.
Offensive Archetype 21: Developmental Prospect

Identity: Tools > production; projection archetype. Physical tools composite ≥ 70. One offensive
trait ≥ 70, one defensive trait ≥ 70. Production is inconsistent.
Offensive baseline: Variable usage. Inconsistent shot mix — depends on which tool is most
developed. High variance game-to-game. Turnovers: moderate-high (decision-making still
developing). Fouls drawn: moderate.
vs Containment Man
● Shot Mix: Rim attempts +1pp, Spot-up 3s +0.5pp
● Efficiency: Overall FG% +0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Containment gives space for tools to show. Developmental Prospect benefits
from soft coverage.
vs Pack Line
● Shot Mix: Rim attempts −2pp, Midrange +1pp, 3PT +1pp
● Efficiency: Rim FG% −1.5pp
● Turnover Rate: +1pp
● Foul-Draw Rate: −1pp
● Rationale: Pack Line exposes developing decision-making. Physical tools less useful in
congested paint.
vs Pressure Man (Denial)
● Shot Mix: Rim attempts +0.5pp
● Efficiency: Overall FG% −1pp
● Turnover Rate: +2pp
● Foul-Draw Rate: +0.5pp
● Rationale: Pressure exploits underdeveloped handles and decision-making. Highest
turnover environment.
vs Switch Everything
● Shot Mix: Rim attempts +1pp, Midrange +0.5pp
● Efficiency: Overall FG% +0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Physical tools create mismatch advantages on switches. Size and athleticism
matter.
vs ICE / No-Middle

● Shot Mix: Baseline drives +1pp, Midrange +0.5pp, Middle drives −1.5pp
● Efficiency: Overall FG% −0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: ICE redirects developing ball handlers. Decision-making tested on baseline
reads.
vs Zone (Structured)
● Shot Mix: Spot-up 3s +1pp, Midrange +1pp, Rim attempts −2pp
● Efficiency: Overall FG% −1pp
● Turnover Rate: +1pp
● Foul-Draw Rate: −1pp
● Rationale: Zone exposes shooting and decision-making gaps. Tools less relevant
against structure.
vs Matchup Zone / Hybrid
● Shot Mix: Midrange +1pp, Spot-up 3s +0.5pp
● Efficiency: Overall FG% −0.5pp
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Hybrid confusion amplifies decision-making inconsistency.
vs Press / Pressure Defense
● Shot Mix: Transition rim +1pp, Early 3s +0.5pp
● Efficiency: Rim FG% +0.5pp
● Turnover Rate: +2pp
● Foul-Draw Rate: +0.5pp
● Rationale: Physical tools shine in transition but ball security suffers under pressure.
vs Junk / Special
● Shot Mix: Midrange +1pp
● Efficiency: Overall FG% −1pp
● Turnover Rate: +1.5pp
● Foul-Draw Rate: −0.5pp
● Rationale: Junk exposes every developmental gap. Inconsistency peaks against
unconventional looks.
vs Coach K Defense
● Shot Mix: 3PT −1pp, Rim attempts −1pp, Midrange +1pp

● Efficiency: Overall FG% −1.5pp
● Turnover Rate: +2.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Coach K defense exposes every developmental gap. Pressure creates
turnovers. Rim protection contests finishing. Worst defensive environment for raw
players.
END OF PART 2: OFFENSIVE ARCHETYPE × DEFENSIVE SYSTEM (210 entries complete)
PART 3: DEFENSIVE ARCHETYPE ×
OFFENSIVE SYSTEM
Each archetype's baseline is neutral — no offensive system modifier applied. All deltas
represent how this defensive archetype expresses pressure, disruption, or vulnerability inside
each offensive system structure.
Format per entry: Shot Profile Shift (PP), Efficiency Shift (%), Turnover Shift (PP), Foul/FT Shift
(PP).
All deltas are bounded by the Modifier Framework. Shot profile shifts must sum to ~0 across
rim/mid/3PA.
Defensive Archetype 1: Two-Way Wing
Identity: Scales on both ends. Reliable defender who also contributes offensively. Defensive
impact: solid on-ball, good team defense, doesn't dominate any single area but doesn't have
holes.
vs Spread Pick-and-Roll
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +0.5pp
● FTAR: −0.4pp
● Rationale: Versatile enough to navigate screens and contest. Moderate across-the-board
suppression.

vs 5-Out Motion
● Shot Profile: Δ3PA −1pp | ΔRim −0.5pp | ΔMid +1.5pp
● Efficiency: −1.2%
● Turnovers: +0.4pp
● FTAR: −0.3pp
● Rationale: Tracks off-ball movement competently. Reduces clean looks without
dominating.
vs Motion / Read & React
● Shot Profile: Δ3PA −1pp | ΔRim −0.5pp | ΔMid +1.5pp
● Efficiency: −1.2%
● Turnovers: +0.4pp
● FTAR: −0.3pp
● Rationale: Good reads on continuity actions. Doesn't get lost in motion.
vs Pace & Space
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −1.0%
● Turnovers: +0.3pp
● FTAR: −0.2pp
● Rationale: Transitions well between halfcourt and transition defense.
vs Dribble Drive
● Shot Profile: Δ3PA −1pp | ΔRim −1.5pp | ΔMid +2.5pp
● Efficiency: −1.8%
● Turnovers: +0.6pp
● FTAR: −0.5pp
● Rationale: Lateral quickness helps contain drives. Pushes offense toward tougher
midrange.
vs Princeton
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.5%
● Turnovers: +0.4pp
● FTAR: −0.4pp
● Rationale: Reads backdoor cuts, positions well on off-ball screens. Solid but not
dominant.
vs Flex

● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +0.4pp
● FTAR: −0.4pp
● Rationale: Navigates screening actions and maintains positioning.
vs Swing
● Shot Profile: Δ3PA −1pp | ΔRim −0.5pp | ΔMid +1.5pp
● Efficiency: −1.5%
● Turnovers: +0.4pp
● FTAR: −0.4pp
● Rationale: Closes out on reversals without overcommitting.
vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.2%
● Turnovers: +0.3pp
● FTAR: −0.4pp
● Rationale: Helps in post doubles and recovers. Not a post defender but team defense
holds.
vs Moreyball
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +0.5pp
● FTAR: −0.5pp
● Rationale: Versatility matters against Moreyball's rim-and-3 focus. Contests both.
vs Heliocentric
● Shot Profile: Δ3PA −0.5pp | ΔRim −1.5pp | ΔMid +2pp
● Efficiency: −1.8%
● Turnovers: +0.6pp
● FTAR: −0.5pp
● Rationale: Can be assigned to the anchor or help off weak-side. Versatility is the asset.
vs Coach K Offense
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −1.5%

● Turnovers: +0.5pp
● FTAR: −0.4pp
● Rationale: Versatile enough to track motion and contest. Moderate suppression across
the board.
Defensive Archetype 2: 3-and-D Wing
Identity: Spacing + reliable defense. Perimeter shot contest + team positioning. Not a primary
stopper but reduces clean looks from wings.
vs Spread Pick-and-Roll
● Shot Profile: Δ3PA −1.5pp | ΔRim −0.5pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +0.3pp
● FTAR: −0.3pp
● Rationale: Contests perimeter shots well. Limited help defense on roll man.
vs 5-Out Motion
● Shot Profile: Δ3PA −1.5pp | ΔRim −0.5pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +0.3pp
● FTAR: −0.3pp
● Rationale: Tracks shooters through off-ball movement. Shot contest quality is high.
vs Motion / Read & React
● Shot Profile: Δ3PA −1.5pp | ΔRim −0.5pp | ΔMid +2pp
● Efficiency: −1.2%
● Turnovers: +0.3pp
● FTAR: −0.3pp
● Rationale: Positioning and closeout discipline limit clean movement threes.
vs Pace & Space
● Shot Profile: Δ3PA −1pp | ΔRim −0.5pp | ΔMid +1.5pp
● Efficiency: −1.0%
● Turnovers: +0.2pp
● FTAR: −0.2pp
● Rationale: Transition closeouts are tested. Solid but not elite in space.
vs Dribble Drive

● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +0.4pp
● FTAR: −0.4pp
● Rationale: Perimeter contest helps on kick-out 3s. Can contain drives but not a stopper.
vs Princeton
● Shot Profile: Δ3PA −1pp | ΔRim −0.5pp | ΔMid +1.5pp
● Efficiency: −1.0%
● Turnovers: +0.2pp
● FTAR: −0.3pp
● Rationale: Adequate positioning on cuts. Perimeter contest matters less in Princeton's
post-heavy offense.
vs Flex
● Shot Profile: Δ3PA −1.5pp | ΔRim −0.5pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +0.3pp
● FTAR: −0.3pp
● Rationale: Navigates screens and contests off-screen shots well.
vs Swing
● Shot Profile: Δ3PA −1.5pp | ΔRim −0.5pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +0.3pp
● FTAR: −0.3pp
● Rationale: Closeout discipline on ball reversals is the primary defensive expression.
vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.8%
● Turnovers: +0.1pp
● FTAR: −0.2pp
● Rationale: Limited impact against interior-focused offense. Helps on kick-outs only.
vs Moreyball
● Shot Profile: Δ3PA −1.5pp | ΔRim −0.5pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +0.3pp

● FTAR: −0.4pp
● Rationale: Perimeter contest directly attacks Moreyball's 3-point volume.
vs Heliocentric
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +0.4pp
● FTAR: −0.4pp
● Rationale: Can guard the anchor's spot-up targets. Limited impact on the anchor directly.
vs Coach K Offense
● Shot Profile: Δ3PA −1.5pp | ΔRim −0.5pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +0.3pp
● FTAR: −0.3pp
● Rationale: Perimeter contest helps against Coach K's 3-point volume. Limited help on
rim pressure.
Defensive Archetype 3: POA Defender Guard
Identity: Defense-first guard who takes the toughest perimeter assignment. Elite containment,
screen navigation, reduces paint touches and clean pull-ups.
vs Spread Pick-and-Roll
● Shot Profile: Δ3PA −2pp | ΔRim −1pp | ΔMid +3pp
● Efficiency: −2.5%
● Turnovers: +1.5pp
● FTAR: −0.6pp
● Rationale: POA kills initial PnR advantage → fewer downhill rim attempts, more stalled
midrange.
vs 5-Out Motion
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +0.8pp
● FTAR: −0.4pp
● Rationale: 5-out can re-flow, but POA reduces clean blow-bys that power drive-kick.

vs Motion / Read & React
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.5%
● Turnovers: +0.6pp
● FTAR: −0.3pp
● Rationale: More distributed creation softens POA impact, but advantage creation still
drops.
vs Pace & Space
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.0%
● Turnovers: +1.0pp
● FTAR: −0.4pp
● Rationale: POA slows early advantage in semi-transition → fewer rim collisions, fewer
FTs.
vs Dribble Drive
● Shot Profile: Δ3PA −1pp | ΔRim −2.5pp | ΔMid +3.5pp
● Efficiency: −2.5%
● Turnovers: +1.2pp
● FTAR: −0.8pp
● Rationale: Dribble Drive depends on penetration; POA directly attacks the engine.
vs Princeton
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −1.0%
● Turnovers: +0.5pp
● FTAR: −0.2pp
● Rationale: Princeton's value is reads/cuts/post-hub — POA matters less than
off-ball/team defense.
vs Flex
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −1.0%
● Turnovers: +0.4pp
● FTAR: −0.2pp
● Rationale: Structured actions reduce on-ball burden; POA still disrupts entries/initiation
timing.

vs Swing
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.5%
● Turnovers: +0.7pp
● FTAR: −0.3pp
● Rationale: Swing creates advantages via reversal + re-screen; POA removes first-step
separation.
vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA +0.5pp | ΔRim −0.5pp | ΔMid Neutral
● Efficiency: −0.5%
● Turnovers: +0.3pp
● FTAR: −0.1pp
● Rationale: Offense runs through post touches; POA mainly affects entry pressure and
closeout quality.
vs Moreyball
● Shot Profile: Δ3PA −0.5pp | ΔRim −1.5pp | ΔMid +2pp
● Efficiency: −2.0%
● Turnovers: +0.9pp
● FTAR: −0.6pp
● Rationale: POA reduces rim pressure + foul pressure; Moreyball degrades into more mid
attempts.
vs Heliocentric
● Shot Profile: Δ3PA −1pp | ΔRim −2pp | ΔMid +3pp
● Efficiency: −2.5%
● Turnovers: +1.8pp
● FTAR: −0.7pp
● Rationale: Heliocentric systems are most vulnerable when the engine gets bottled. POA
directly shuts down the anchor.
vs Coach K Offense
● Shot Profile: Δ3PA −1.5pp | ΔRim −1.5pp | ΔMid +3pp
● Efficiency: −2.5%
● Turnovers: +1.5pp
● FTAR: −0.6pp

● Rationale: POA containment critical against Coach K's multiple handlers. Reduces clean
initiations and suppresses transition. High-impact.
Defensive Archetype 4: Primary Ball-Handler
(Offense-First)
Identity: Usage engine on offense, but defense is secondary. On defense: gambles for steals,
inconsistent effort, loses focus off-ball. Liability against quality creators.
vs Spread Pick-and-Roll
● Shot Profile: Δ3PA +1pp | ΔRim +1pp | ΔMid −2pp
● Efficiency: +1.5%
● Turnovers: −0.5pp
● FTAR: +0.5pp
● Rationale: Gets screened off easily. PnR handlers exploit poor navigation for clean
looks.
vs 5-Out Motion
● Shot Profile: Δ3PA +1pp | ΔRim +0.5pp | ΔMid −1.5pp
● Efficiency: +1.0%
● Turnovers: −0.3pp
● FTAR: +0.3pp
● Rationale: Loses off-ball players in motion. Closeouts are late.
vs Motion / Read & React
● Shot Profile: Δ3PA +1pp | ΔRim +0.5pp | ΔMid −1.5pp
● Efficiency: +1.0%
● Turnovers: −0.3pp
● FTAR: +0.3pp
● Rationale: Read-based offenses exploit ball-watching tendencies.
vs Pace & Space
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.8%
● Turnovers: −0.2pp
● FTAR: +0.2pp
● Rationale: Transition defense effort is inconsistent.
vs Dribble Drive

● Shot Profile: Δ3PA +0.5pp | ΔRim +1.5pp | ΔMid −2pp
● Efficiency: +1.5%
● Turnovers: −0.5pp
● FTAR: +0.5pp
● Rationale: Gets beaten off the dribble by quality drivers. Rim attempts increase against
this defender.
vs Princeton
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.8%
● Turnovers: −0.2pp
● FTAR: +0.2pp
● Rationale: Backdoor cuts exploit inattention. Princeton punishes ball-watchers.
vs Flex
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.8%
● Turnovers: −0.2pp
● FTAR: +0.2pp
● Rationale: Screening actions exploit poor screen navigation.
vs Swing
● Shot Profile: Δ3PA +1pp | ΔRim +0.5pp | ΔMid −1.5pp
● Efficiency: +1.0%
● Turnovers: −0.3pp
● FTAR: +0.3pp
● Rationale: Ball reversal exploits slow closeouts.
vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA +0.5pp | ΔRim +1pp | ΔMid −1.5pp
● Efficiency: +1.2%
● Turnovers: −0.3pp
● FTAR: +0.4pp
● Rationale: Post doubles leave this defender's man open. Recovery is slow.
vs Moreyball
● Shot Profile: Δ3PA +1pp | ΔRim +1pp | ΔMid −2pp
● Efficiency: +1.5%
● Turnovers: −0.5pp

● FTAR: +0.5pp
● Rationale: Moreyball hunts the weakest perimeter defender. Primary Ball-Handler is the
target.
vs Heliocentric
● Shot Profile: Δ3PA +0.5pp | ΔRim +1pp | ΔMid −1.5pp
● Efficiency: +1.5%
● Turnovers: −0.5pp
● FTAR: +0.5pp
● Rationale: If matched against the anchor, gets dominated. If off-ball, loses assignment in
help.
vs Coach K Offense
● Shot Profile: Δ3PA +1pp | ΔRim +1pp | ΔMid −2pp
● Efficiency: +1.5%
● Turnovers: −0.5pp
● FTAR: +0.5pp
● Rationale: Gets lost in Coach K's motion. Can't track off-ball movement. Closeouts late.
Defensive liability.
Defensive Archetype 5: Switchable Defender Wing
(Carry-forward from old Archetype 2, relabeled)
vs Spread Pick-and-Roll
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −2.0%
● Turnovers: +1pp
● FTAR: −0.5pp
vs 5-Out Motion
● Shot Profile: Δ3PA −2pp | ΔRim −1pp | ΔMid +3pp
● Efficiency: −2.5%
● Turnovers: +1pp
● FTAR: −0.5pp
vs Motion / Read & React

● Shot Profile: Δ3PA −2pp | ΔRim −1pp | ΔMid +3pp
● Efficiency: −2.0%
● Turnovers: +1pp
● FTAR: −0.5pp
vs Pace & Space
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +1pp
● FTAR: −0.5pp
vs Dribble Drive
● Shot Profile: Δ3PA −1pp | ΔRim −2pp | ΔMid +3pp
● Efficiency: −2.0%
● Turnovers: +2pp
● FTAR: −1.0pp
vs Princeton
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +1pp
● FTAR: −0.5pp
vs Flex
● Shot Profile: Δ3PA −2pp | ΔRim −1pp | ΔMid +3pp
● Efficiency: −2.0%
● Turnovers: +1pp
● FTAR: −0.5pp
vs Swing
● Shot Profile: Δ3PA −2pp | ΔRim −1pp | ΔMid +3pp
● Efficiency: −2.0%
● Turnovers: +1pp
● FTAR: −0.5pp
vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −1.0%

● Turnovers: +0.5pp
● FTAR: −0.5pp
vs Moreyball
● Shot Profile: Δ3PA −2pp | ΔRim −2pp | ΔMid +4pp
● Efficiency: −2.5%
● Turnovers: +1pp
● FTAR: −1.0pp
vs Heliocentric
● Shot Profile: Δ3PA −1pp | ΔRim −2pp | ΔMid +3pp
● Efficiency: −2.0%
● Turnovers: +2pp
● FTAR: −1.0pp
vs Coach K Offense
● Shot Profile: Δ3PA −1.5pp | ΔRim −1pp | ΔMid +2.5pp
● Efficiency: −2.0%
● Turnovers: +1pp
● FTAR: −0.5pp
● Rationale: Switching capability helps against Coach K's PnR and motion. Can guard
multiple positions in flow.
Defensive Archetype 6: Anchor Big
Identity: Paint controller; drop coverage backbone. Rim protection + paint deterrence +
defensive rebounding. The defensive anchor.
(Carry-forward from old Archetype 4 — Help-Rim Protector, relabeled)
vs Spread Pick-and-Roll
● Shot Profile: Δ3PA +3pp | ΔRim −4pp | ΔMid +1pp
● Efficiency: −3.0%
● Turnovers: +0.5pp
● FTAR: −1.0pp
vs 5-Out Motion

● Shot Profile: Δ3PA +2pp | ΔRim −3pp | ΔMid +1pp
● Efficiency: −2.0%
● Turnovers: Neutral
● FTAR: −0.5pp
vs Motion / Read & React
● Shot Profile: Δ3PA +2pp | ΔRim −3pp | ΔMid +1pp
● Efficiency: −2.0%
● Turnovers: Neutral
● FTAR: −0.5pp
vs Pace & Space
● Shot Profile: Δ3PA +2pp | ΔRim −3pp | ΔMid +1pp
● Efficiency: −1.5%
● Turnovers: Neutral
● FTAR: −0.5pp
vs Dribble Drive
● Shot Profile: Δ3PA +2pp | ΔRim −4pp | ΔMid +2pp
● Efficiency: −3.0%
● Turnovers: +0.5pp
● FTAR: −1.0pp
vs Princeton
● Shot Profile: Δ3PA +1pp | ΔRim −3pp | ΔMid +2pp
● Efficiency: −2.0%
● Turnovers: Neutral
● FTAR: −0.5pp
vs Flex
● Shot Profile: Δ3PA +1pp | ΔRim −3pp | ΔMid +2pp
● Efficiency: −2.0%
● Turnovers: Neutral
● FTAR: −0.5pp
vs Swing
● Shot Profile: Δ3PA +1pp | ΔRim −3pp | ΔMid +2pp
● Efficiency: −2.0%

● Turnovers: Neutral
● FTAR: −0.5pp
vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA +1pp | ΔRim −4pp | ΔMid +3pp
● Efficiency: −3.5%
● Turnovers: +0.5pp
● FTAR: −1.0pp
vs Moreyball
● Shot Profile: Δ3PA +3pp | ΔRim −4pp | ΔMid +1pp
● Efficiency: −2.5%
● Turnovers: +0.5pp
● FTAR: −1.0pp
vs Heliocentric
● Shot Profile: Δ3PA +2pp | ΔRim −4pp | ΔMid +2pp
● Efficiency: −3.0%
● Turnovers: +1.0pp
● FTAR: −1.0pp
vs Coach K Offense
● Shot Profile: Δ3PA +2pp | ΔRim −4pp | ΔMid +2pp
● Efficiency: −2.5%
● Turnovers: +0.5pp
● FTAR: −1.0pp
● Rationale: Rim protection critical against Coach K's rim pressure. But can't chase
shooters to perimeter — 3s leak.
Defensive Archetype 7: Stretch Big
Identity: Spacing big; defense via positioning, not rim protection. Not a paint controller.
Adequate team defense but vulnerable at the rim.
vs Spread Pick-and-Roll
● Shot Profile: Δ3PA +0.5pp | ΔRim +1pp | ΔMid −1.5pp
● Efficiency: +0.8%

● Turnovers: −0.2pp
● FTAR: +0.3pp
● Rationale: Not a rim protector. PnR roll man gets cleaner looks. Defensive liability in
drop.
vs 5-Out Motion
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.5%
● Turnovers: −0.1pp
● FTAR: +0.2pp
● Rationale: Spacing offenses don't attack Stretch Big's weakness as aggressively.
vs Motion / Read & React
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.5%
● Turnovers: −0.1pp
● FTAR: +0.2pp
● Rationale: Cutting actions find the Stretch Big's help defense lacking.
vs Pace & Space
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.5%
● Turnovers: −0.1pp
● FTAR: +0.2pp
● Rationale: Transition defense requires mobility Stretch Big doesn't fully have.
vs Dribble Drive
● Shot Profile: Δ3PA +0.5pp | ΔRim +1.5pp | ΔMid −2pp
● Efficiency: +1.2%
● Turnovers: −0.3pp
● FTAR: +0.5pp
● Rationale: Dribble Drive specifically targets paint defenders. Stretch Big is the weak link.
vs Princeton
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.5%
● Turnovers: −0.1pp
● FTAR: +0.2pp
● Rationale: Princeton's post hub tests positioning. Adequate but not dominant.

vs Flex
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.5%
● Turnovers: −0.1pp
● FTAR: +0.2pp
● Rationale: Baseline screening actions test Stretch Big's interior presence.
vs Swing
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.5%
● Turnovers: −0.1pp
● FTAR: +0.2pp
● Rationale: Ball reversal creates closeout tests. Adequate positioning.
vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA +0.5pp | ΔRim +2pp | ΔMid −2.5pp
● Efficiency: +1.5%
● Turnovers: −0.3pp
● FTAR: +0.6pp
● Rationale: Post-up mismatch directly targets Stretch Big's rim defense. Worst defensive
matchup.
vs Moreyball
● Shot Profile: Δ3PA +0.5pp | ΔRim +1pp | ΔMid −1.5pp
● Efficiency: +0.8%
● Turnovers: −0.2pp
● FTAR: +0.3pp
● Rationale: Moreyball attacks the rim where Stretch Big is weakest.
vs Heliocentric
● Shot Profile: Δ3PA +0.5pp | ΔRim +1.5pp | ΔMid −2pp
● Efficiency: +1.0%
● Turnovers: −0.3pp
● FTAR: +0.4pp
● Rationale: Anchor exploits Stretch Big's rim defense in isolation and post-up.
vs Coach K Offense

● Shot Profile: Δ3PA +0.5pp | ΔRim +1.5pp | ΔMid −2pp
● Efficiency: +1.0%
● Turnovers: −0.3pp
● FTAR: +0.5pp
● Rationale: Can't protect the rim against Coach K's downhill attack. Rim pressure exploits
interior defense. Liability.
Defensive Archetype 8: Connector Guard
Identity: Low-usage organizer on offense. On defense: team defense IQ, gap awareness,
passing lane disruption. Not a stopper but rarely a liability.
vs Spread Pick-and-Roll
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.8%
● Turnovers: +0.3pp
● FTAR: −0.2pp
● Rationale: Smart positioning but limited on-ball containment. Contributes through gap
awareness.
vs 5-Out Motion
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.8%
● Turnovers: +0.3pp
● FTAR: −0.2pp
● Rationale: Reads off-ball movement adequately. Team defense intelligence shows.
vs Motion / Read & React
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.8%
● Turnovers: +0.3pp
● FTAR: −0.2pp
● Rationale: Processes reads well on defense. Doesn't get lost in continuity.
vs Pace & Space
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.5%
● Turnovers: +0.2pp
● FTAR: −0.1pp
● Rationale: Adequate transition defense. Not elite in space.

vs Dribble Drive
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.0%
● Turnovers: +0.4pp
● FTAR: −0.3pp
● Rationale: Help positioning is good. Can get beaten on-ball but team defense holds.
vs Princeton
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.8%
● Turnovers: +0.2pp
● FTAR: −0.2pp
● Rationale: IQ-driven defense reads Princeton's passing game. Positions well off-ball.
vs Flex
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.8%
● Turnovers: +0.2pp
● FTAR: −0.2pp
● Rationale: Navigates screens with positioning rather than athleticism.
vs Swing
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.8%
● Turnovers: +0.2pp
● FTAR: −0.2pp
● Rationale: Closeout discipline on reversals is solid.
vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA Neutral | ΔRim −0.5pp | ΔMid +0.5pp
● Efficiency: −0.5%
● Turnovers: +0.1pp
● FTAR: −0.1pp
● Rationale: Limited impact against interior offense. Helps on kick-outs only.
vs Moreyball
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.8%

● Turnovers: +0.3pp
● FTAR: −0.2pp
● Rationale: Gap awareness helps against Moreyball's drive-kick action.
vs Heliocentric
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.0%
● Turnovers: +0.4pp
● FTAR: −0.3pp
● Rationale: Help defense IQ matters against anchor-driven offenses. Can't stop the
anchor but positions well.
vs Coach K Offense
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.8%
● Turnovers: +0.3pp
● FTAR: −0.2pp
● Rationale: IQ helps read motion but limited athleticism tested by Coach K's pace.
Defensive Archetype 9: Offensive Wing Scorer
Identity: Shot-creation wing on offense. Defense is managed, not elite. Effort inconsistent. Gets
beaten on-ball by quality creators. Help defense is average.
vs Spread Pick-and-Roll
● Shot Profile: Δ3PA +0.5pp | ΔRim +1pp | ΔMid −1.5pp
● Efficiency: +1.0%
● Turnovers: −0.3pp
● FTAR: +0.3pp
● Rationale: Gets screened off. Below-average screen navigation creates clean looks for
handlers.
vs 5-Out Motion
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.8%
● Turnovers: −0.2pp
● FTAR: +0.2pp
● Rationale: Loses off-ball assignments in motion. Closeouts are late.

vs Motion / Read & React
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.8%
● Turnovers: −0.2pp
● FTAR: +0.2pp
● Rationale: Read-based offenses exploit effort inconsistency.
vs Pace & Space
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.5%
● Turnovers: −0.1pp
● FTAR: +0.2pp
● Rationale: Transition defense effort is variable.
vs Dribble Drive
● Shot Profile: Δ3PA +0.5pp | ΔRim +1pp | ΔMid −1.5pp
● Efficiency: +1.2%
● Turnovers: −0.4pp
● FTAR: +0.4pp
● Rationale: Gets beaten off the dribble. Rim attempts increase.
vs Princeton
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.5%
● Turnovers: −0.2pp
● FTAR: +0.2pp
● Rationale: Backdoor cuts exploit ball-watching.
vs Flex
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.5%
● Turnovers: −0.2pp
● FTAR: +0.2pp
● Rationale: Screening actions exploit poor navigation.
vs Swing
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.8%

● Turnovers: −0.2pp
● FTAR: +0.2pp
● Rationale: Slow closeouts on reversals.
vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.5%
● Turnovers: −0.1pp
● FTAR: +0.2pp
● Rationale: Help defense is average. Kick-out recovery is slow.
vs Moreyball
● Shot Profile: Δ3PA +0.5pp | ΔRim +1pp | ΔMid −1.5pp
● Efficiency: +1.0%
● Turnovers: −0.3pp
● FTAR: +0.3pp
● Rationale: Moreyball targets the weakest perimeter defender for drives.
vs Heliocentric
● Shot Profile: Δ3PA +0.5pp | ΔRim +1pp | ΔMid −1.5pp
● Efficiency: +1.0%
● Turnovers: −0.3pp
● FTAR: +0.3pp
● Rationale: If assigned to anchor, gets dominated. If off-ball, help defense is insufficient.
vs Coach K Offense
● Shot Profile: Δ3PA +0.5pp | ΔRim +1pp | ΔMid −1.5pp
● Efficiency: +1.0%
● Turnovers: −0.3pp
● FTAR: +0.3pp
● Rationale: Effort inconsistency exploited by Coach K's relentless motion. Gets screened
off and loses assignments.
Defensive Archetype 10: Gap / Team Defender Wing
(Carry-forward from old Archetype 7 — Gap Defender, relabeled)
vs Spread Pick-and-Roll

● Shot Profile: Δ3PA +1pp | ΔRim −2pp | ΔMid +1pp
● Efficiency: −1.5%
● Turnovers: +0.2pp
● FTAR: −0.6pp
vs 5-Out Motion
● Shot Profile: Δ3PA Neutral | ΔRim −1pp | ΔMid +1pp
● Efficiency: −1.0%
● Turnovers: +0.1pp
● FTAR: −0.4pp
vs Motion / Read & React
● Shot Profile: Δ3PA Neutral | ΔRim −1pp | ΔMid +1pp
● Efficiency: −1.0%
● Turnovers: +0.1pp
● FTAR: −0.4pp
vs Pace & Space
● Shot Profile: Δ3PA +1pp | ΔRim −1pp | ΔMid Neutral
● Efficiency: −0.8%
● Turnovers: +0.1pp
● FTAR: −0.3pp
vs Dribble Drive
● Shot Profile: Δ3PA +1pp | ΔRim −3pp | ΔMid +2pp
● Efficiency: −2.0%
● Turnovers: +0.4pp
● FTAR: −0.8pp
vs Princeton
● Shot Profile: Δ3PA Neutral | ΔRim −2pp | ΔMid +2pp
● Efficiency: −1.8%
● Turnovers: +0.3pp
● FTAR: −0.7pp
vs Flex
● Shot Profile: Δ3PA Neutral | ΔRim −2pp | ΔMid +2pp
● Efficiency: −1.8%

● Turnovers: +0.3pp
● FTAR: −0.7pp
vs Swing
● Shot Profile: Δ3PA Neutral | ΔRim −2pp | ΔMid +2pp
● Efficiency: −1.8%
● Turnovers: +0.3pp
● FTAR: −0.7pp
vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA Neutral | ΔRim −3pp | ΔMid +3pp
● Efficiency: −2.5%
● Turnovers: +0.2pp
● FTAR: −1.0pp
vs Moreyball
● Shot Profile: Δ3PA +1pp | ΔRim −2pp | ΔMid +1pp
● Efficiency: −1.6%
● Turnovers: +0.2pp
● FTAR: −0.6pp
vs Heliocentric
● Shot Profile: Δ3PA Neutral | ΔRim −3pp | ΔMid +3pp
● Efficiency: −2.2%
● Turnovers: +0.5pp
● FTAR: −0.9pp
vs Coach K Offense
● Shot Profile: Δ3PA +0.5pp | ΔRim −2pp | ΔMid +1.5pp
● Efficiency: −1.5%
● Turnovers: +0.3pp
● FTAR: −0.6pp
● Rationale: Gap awareness helps against drive-kick action. Positioning limits rim
attempts. Perimeter volume still leaks.
Defensive Archetype 11: Mobile Defensive Big

(Carry-forward from old Archetype 5 — Versatile Switch Defender, relabeled)
vs Spread Pick-and-Roll
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −2.0%
● Turnovers: +1.0pp
● FTAR: −0.5pp
vs 5-Out Motion
● Shot Profile: Δ3PA −1pp | ΔRim Neutral | ΔMid +1pp
● Efficiency: −1.5%
● Turnovers: +0.5pp
● FTAR: −0.5pp
vs Motion / Read & React
● Shot Profile: Δ3PA −1pp | ΔRim Neutral | ΔMid +1pp
● Efficiency: −1.5%
● Turnovers: +0.5pp
● FTAR: −0.5pp
vs Pace & Space
● Shot Profile: Δ3PA −1pp | ΔRim Neutral | ΔMid +1pp
● Efficiency: −1.0%
● Turnovers: +0.5pp
● FTAR: −0.5pp
vs Dribble Drive
● Shot Profile: Δ3PA −2pp | ΔRim −1pp | ΔMid +3pp
● Efficiency: −2.5%
● Turnovers: +1.0pp
● FTAR: −0.5pp
vs Princeton
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −2.0%
● Turnovers: +0.5pp
● FTAR: −0.5pp

vs Flex
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −2.0%
● Turnovers: +0.5pp
● FTAR: −0.5pp
vs Swing
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −2.0%
● Turnovers: +0.5pp
● FTAR: −0.5pp
vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA −1pp | ΔRim −2pp | ΔMid +3pp
● Efficiency: −3.0%
● Turnovers: +0.5pp
● FTAR: −0.5pp
vs Moreyball
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −2.0%
● Turnovers: +0.5pp
● FTAR: −0.5pp
vs Heliocentric
● Shot Profile: Δ3PA −1pp | ΔRim −2pp | ΔMid +3pp
● Efficiency: −2.5%
● Turnovers: +1.0pp
● FTAR: −0.5pp
vs Coach K Offense
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −2.0%
● Turnovers: +0.8pp
● FTAR: −0.5pp
● Rationale: Mobility allows switching in Coach K's PnR actions. Can contain without
giving up rim. High-value archetype.

Defensive Archetype 12: Chaos Disruptor Wing
(Carry-forward from old Archetype 11 — Chaos / Disruptor Defender, relabeled)
Note: Chaos defenders trade structure for disruption. Expect volatility ↑, turnovers ↑, foul risk ↑,
efficiency ↓.
vs Spread Pick-and-Roll
● Shot Profile: Δ3PA +1pp | ΔRim −1pp | ΔMid Neutral
● Efficiency: −1.8%
● Turnovers: +0.8pp
● FTAR: +0.3pp
vs 5-Out Motion
● Shot Profile: Δ3PA Neutral | ΔRim −1pp | ΔMid +1pp
● Efficiency: −1.4%
● Turnovers: +0.7pp
● FTAR: +0.2pp
vs Motion / Read & React
● Shot Profile: Δ3PA Neutral | ΔRim −1pp | ΔMid +1pp
● Efficiency: −1.4%
● Turnovers: +0.7pp
● FTAR: +0.2pp
vs Pace & Space
● Shot Profile: Δ3PA +1pp | ΔRim Neutral | ΔMid −1pp
● Efficiency: −1.2%
● Turnovers: +0.6pp
● FTAR: +0.1pp
vs Dribble Drive
● Shot Profile: Δ3PA +1pp | ΔRim −2pp | ΔMid +1pp
● Efficiency: −2.4%
● Turnovers: +1.1pp
● FTAR: +0.5pp
vs Princeton

● Shot Profile: Δ3PA Neutral | ΔRim −2pp | ΔMid +2pp
● Efficiency: −2.2%
● Turnovers: +0.9pp
● FTAR: +0.4pp
vs Flex
● Shot Profile: Δ3PA Neutral | ΔRim −2pp | ΔMid +2pp
● Efficiency: −2.2%
● Turnovers: +0.9pp
● FTAR: +0.4pp
vs Swing
● Shot Profile: Δ3PA Neutral | ΔRim −2pp | ΔMid +2pp
● Efficiency: −2.2%
● Turnovers: +0.9pp
● FTAR: +0.4pp
vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA Neutral | ΔRim −3pp | ΔMid +3pp
● Efficiency: −3.0%
● Turnovers: +0.8pp
● FTAR: +0.6pp
vs Moreyball
● Shot Profile: Δ3PA +1pp | ΔRim −1pp | ΔMid Neutral
● Efficiency: −1.9%
● Turnovers: +0.8pp
● FTAR: +0.3pp
vs Heliocentric
● Shot Profile: Δ3PA Neutral | ΔRim −2pp | ΔMid +2pp
● Efficiency: −2.8%
● Turnovers: +1.3pp
● FTAR: +0.6pp
vs Coach K Offense
● Shot Profile: Δ3PA Neutral | ΔRim −1pp | ΔMid +1pp

● Efficiency: −2.0%
● Turnovers: +1.0pp
● FTAR: +0.4pp
● Rationale: Chaos meets chaos. Disruptor creates turnovers against motion but also fouls
more. High-variance.
Defensive Archetype 13: Point Forward
Identity: Size-based secondary creator on offense. On defense: adequate positioning, uses
length to disrupt passing lanes, average lateral quickness. Not a stopper but not a liability.
vs Spread Pick-and-Roll
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.2%
● Turnovers: +0.5pp
● FTAR: −0.3pp
● Rationale: Length disrupts passing lanes. Adequate but not elite screen navigation at
forward size.
vs 5-Out Motion
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −1.0%
● Turnovers: +0.4pp
● FTAR: −0.2pp
● Rationale: Length helps in passing lanes. Adequate off-ball positioning.
vs Motion / Read & React
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −1.0%
● Turnovers: +0.4pp
● FTAR: −0.2pp
● Rationale: Reads continuity actions adequately.
vs Pace & Space
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.8%
● Turnovers: +0.3pp
● FTAR: −0.2pp
● Rationale: Transition defense adequate but not elite laterally.

vs Dribble Drive
● Shot Profile: Δ3PA −0.5pp | ΔRim −1.5pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +0.6pp
● FTAR: −0.4pp
● Rationale: Length deters drives at the rim. Gap coverage is solid.
vs Princeton
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.2%
● Turnovers: +0.4pp
● FTAR: −0.3pp
● Rationale: Size helps against Princeton's post hub. Passing lane disruption matters.
vs Flex
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.2%
● Turnovers: +0.4pp
● FTAR: −0.3pp
● Rationale: Length disrupts screening actions and contesting around the basket.
vs Swing
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −1.0%
● Turnovers: +0.3pp
● FTAR: −0.2pp
● Rationale: Adequate closeout on reversals. Length helps contest.
vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA Neutral | ΔRim −1.5pp | ΔMid +1.5pp
● Efficiency: −1.5%
● Turnovers: +0.3pp
● FTAR: −0.4pp
● Rationale: Size helps against post players. Not a true post defender but length disrupts.
vs Moreyball
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.2%

● Turnovers: +0.4pp
● FTAR: −0.3pp
● Rationale: Length contests both rim and perimeter. Versatile defensive expression.
vs Heliocentric
● Shot Profile: Δ3PA −0.5pp | ΔRim −1.5pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +0.6pp
● FTAR: −0.4pp
● Rationale: Can match up against the anchor at forward size. Length creates contested
looks.
vs Coach K Offense
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.2%
● Turnovers: +0.5pp
● FTAR: −0.3pp
● Rationale: Length disrupts passing lanes in motion. Adequate versatility against multiple
actions.
Defensive Archetype 14: Utility Forward
Identity: Lineup glue. Motor + positioning. Not a stopper but fills defensive gaps. Rarely
targeted, rarely dominant.
vs All 11 Offensive Systems
● Shot Profile: Δ3PA Neutral | ΔRim −0.5pp | ΔMid +0.5pp
● Efficiency: −0.5%
● Turnovers: +0.1pp
● FTAR: −0.1pp
● Rationale: Near-neutral defensive interaction across all systems. Utility Forward is the
baseline — neither a plus nor a minus. Motor and positioning provide marginal benefit.
Applied uniformly.
vs Coach K Offense
● Shot Profile: Δ3PA Neutral | ΔRim −0.5pp | ΔMid +0.5pp

● Efficiency: −0.5%
● Turnovers: +0.1pp
● FTAR: −0.1pp
● Rationale: Near-neutral. Motor helps but doesn't dominate against pace.
Defensive Archetype 15: Roll Man / Vertical Threat
Identity: Rim pressure on offense. On defense: rim protection via verticality, blocks, and paint
presence. Not a perimeter defender. Drop coverage backbone.
vs Spread Pick-and-Roll
● Shot Profile: Δ3PA +2pp | ΔRim −3pp | ΔMid +1pp
● Efficiency: −2.8%
● Turnovers: +0.1pp
● FTAR: −1.2pp
vs 5-Out Motion
● Shot Profile: Δ3PA +1pp | ΔRim −2pp | ΔMid +1pp
● Efficiency: −2.0%
● Turnovers: +0.1pp
● FTAR: −0.8pp
vs Motion / Read & React
● Shot Profile: Δ3PA +1pp | ΔRim −2pp | ΔMid +1pp
● Efficiency: −2.0%
● Turnovers: +0.1pp
● FTAR: −0.8pp
vs Pace & Space
● Shot Profile: Δ3PA +2pp | ΔRim −2pp | ΔMid Neutral
● Efficiency: −1.8%
● Turnovers: Neutral
● FTAR: −0.6pp
vs Dribble Drive
● Shot Profile: Δ3PA +1pp | ΔRim −5pp | ΔMid +4pp
● Efficiency: −3.5%
● Turnovers: +0.2pp
● FTAR: −1.5pp

vs Princeton
● Shot Profile: Δ3PA +1pp | ΔRim −3pp | ΔMid +2pp
● Efficiency: −3.0%
● Turnovers: +0.2pp
● FTAR: −1.3pp
vs Flex
● Shot Profile: Δ3PA +1pp | ΔRim −3pp | ΔMid +2pp
● Efficiency: −3.0%
● Turnovers: +0.2pp
● FTAR: −1.3pp
vs Swing
● Shot Profile: Δ3PA +1pp | ΔRim −3pp | ΔMid +2pp
● Efficiency: −3.0%
● Turnovers: +0.2pp
● FTAR: −1.3pp
vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA +1pp | ΔRim −6pp | ΔMid +5pp
● Efficiency: −4.0%
● Turnovers: +0.1pp
● FTAR: −2.0pp
vs Moreyball
● Shot Profile: Δ3PA +2pp | ΔRim −4pp | ΔMid +2pp
● Efficiency: −2.6%
● Turnovers: +0.1pp
● FTAR: −1.0pp
vs Heliocentric
● Shot Profile: Δ3PA +1pp | ΔRim −5pp | ΔMid +4pp
● Efficiency: −3.6%
● Turnovers: +0.3pp
● FTAR: −1.6pp

vs Coach K Offense
● Shot Profile: Δ3PA +2pp | ΔRim −4pp | ΔMid +2pp
● Efficiency: −2.5%
● Turnovers: +0.2pp
● FTAR: −1.2pp
● Rationale: Rim protection via verticality limits Coach K's finishing. But can't switch or
chase — 3s leak.
Defensive Archetype 16: Offensive Big (Defense Liability)
Identity: Offense-first interior scorer. On defense: slow feet, poor lateral movement, can't switch,
fouls too much. Clear defensive minus.
vs All 11 Offensive Systems (Uniform Liability)
● Shot Profile: Δ3PA +0.5pp | ΔRim +2pp | ΔMid −2.5pp
● Efficiency: +2.0%
● Turnovers: −0.5pp
● FTAR: +0.8pp
● Rationale: Offensive Big is a defensive liability across all systems. Gets attacked at the
rim regardless of offensive structure. Fouls frequently. Applied uniformly with minor
variations:
○ vs Dribble Drive / Heliocentric: Efficiency penalty increases to +2.5% (rim-attack
offenses target this player)
○ vs Post-Centric: Efficiency penalty increases to +2.5% (direct post mismatch)
○ vs Zone / Princeton: Efficiency penalty decreases to +1.5% (less direct targeting)
vs Coach K Offense
● Shot Profile: Δ3PA +1pp | ΔRim +2pp | ΔMid −3pp
● Efficiency: +2.5%
● Turnovers: −0.5pp
● FTAR: +1.0pp
● Rationale: Coach K's pace and motion destroy slow-footed bigs. Gets targeted
relentlessly. Worst defensive matchup.
Defensive Archetype 17: Situational Shooter (Specialist)
Identity: One-job player on offense (shooting). On defense: below-average. Gets targeted by
quality creators. Poor lateral movement. Adequate effort but limited tools.

vs All 11 Offensive Systems (Uniform Minus)
● Shot Profile: Δ3PA +0.5pp | ΔRim +1pp | ΔMid −1.5pp
● Efficiency: +1.0%
● Turnovers: −0.3pp
● FTAR: +0.3pp
● Rationale: Situational Shooter is a defensive minus across all systems. Gets hunted on
drives. Applied uniformly with minor variations:
○ vs Dribble Drive / Heliocentric: Efficiency penalty increases to +1.5% (direct
targeting of weak perimeter defenders)
○ vs Spread PnR: FTAR increases to +0.5pp (gets screened off and fouls on
recovery)
vs Coach K Offense
● Shot Profile: Δ3PA +0.5pp | ΔRim +1pp | ΔMid −1.5pp
● Efficiency: +1.2%
● Turnovers: −0.3pp
● FTAR: +0.4pp
● Rationale: Gets targeted on drives and screened off in motion. Coach K hunts weakest
perimeter defender.
Defensive Archetype 18: Defensive Specialist
(Non-Scoring)
Identity: Defense-only contributor. Elite on-ball containment + screen navigation + team
positioning. The purest defensive archetype.
(Similar profile to POA Defender Guard but can be applied at any position)
vs Spread Pick-and-Roll
● Shot Profile: Δ3PA −1.5pp | ΔRim −1.5pp | ΔMid +3pp
● Efficiency: −2.5%
● Turnovers: +1.2pp
● FTAR: −0.6pp
vs 5-Out Motion
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −1.5%

● Turnovers: +0.7pp
● FTAR: −0.4pp
vs Motion / Read & React
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +0.6pp
● FTAR: −0.3pp
vs Pace & Space
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.0%
● Turnovers: +0.8pp
● FTAR: −0.4pp
vs Dribble Drive
● Shot Profile: Δ3PA −1pp | ΔRim −2pp | ΔMid +3pp
● Efficiency: −2.5%
● Turnovers: +1.0pp
● FTAR: −0.7pp
vs Princeton
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.2%
● Turnovers: +0.5pp
● FTAR: −0.3pp
vs Flex
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.2%
● Turnovers: +0.5pp
● FTAR: −0.3pp
vs Swing
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.5%
● Turnovers: +0.5pp
● FTAR: −0.3pp

vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA Neutral | ΔRim −1pp | ΔMid +1pp
● Efficiency: −0.8%
● Turnovers: +0.3pp
● FTAR: −0.2pp
vs Moreyball
● Shot Profile: Δ3PA −1pp | ΔRim −1.5pp | ΔMid +2.5pp
● Efficiency: −2.0%
● Turnovers: +0.8pp
● FTAR: −0.5pp
vs Heliocentric
● Shot Profile: Δ3PA −1pp | ΔRim −2pp | ΔMid +3pp
● Efficiency: −2.5%
● Turnovers: +1.5pp
● FTAR: −0.7pp
vs Coach K Offense
● Shot Profile: Δ3PA −1.5pp | ΔRim −1.5pp | ΔMid +3pp
● Efficiency: −2.2%
● Turnovers: +1.2pp
● FTAR: −0.5pp
● Rationale: Elite containment and screen navigation. Can slow Coach K's initiators.
High-value archetype.
Defensive Archetype 19: Energy Big
Identity: Bench impact via effort. On defense: motor-driven, crash the glass, block shots
occasionally, disrupt through activity not technique. Fouls more than disciplined bigs.
vs Spread Pick-and-Roll
● Shot Profile: Δ3PA +1pp | ΔRim −2pp | ΔMid +1pp
● Efficiency: −1.5%
● Turnovers: +0.3pp
● FTAR: +0.3pp

vs 5-Out Motion
● Shot Profile: Δ3PA +0.5pp | ΔRim −1pp | ΔMid +0.5pp
● Efficiency: −1.0%
● Turnovers: +0.2pp
● FTAR: +0.2pp
vs Motion / Read & React
● Shot Profile: Δ3PA +0.5pp | ΔRim −1pp | ΔMid +0.5pp
● Efficiency: −1.0%
● Turnovers: +0.2pp
● FTAR: +0.2pp
vs Pace & Space
● Shot Profile: Δ3PA +0.5pp | ΔRim −1pp | ΔMid +0.5pp
● Efficiency: −0.8%
● Turnovers: +0.2pp
● FTAR: +0.1pp
vs Dribble Drive
● Shot Profile: Δ3PA +1pp | ΔRim −2pp | ΔMid +1pp
● Efficiency: −1.8%
● Turnovers: +0.4pp
● FTAR: +0.4pp
vs Princeton
● Shot Profile: Δ3PA +0.5pp | ΔRim −1.5pp | ΔMid +1pp
● Efficiency: −1.5%
● Turnovers: +0.3pp
● FTAR: +0.3pp
vs Flex
● Shot Profile: Δ3PA +0.5pp | ΔRim −1.5pp | ΔMid +1pp
● Efficiency: −1.5%
● Turnovers: +0.3pp
● FTAR: +0.3pp
vs Swing

● Shot Profile: Δ3PA +0.5pp | ΔRim −1.5pp | ΔMid +1pp
● Efficiency: −1.5%
● Turnovers: +0.3pp
● FTAR: +0.3pp
vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA +0.5pp | ΔRim −2pp | ΔMid +1.5pp
● Efficiency: −2.0%
● Turnovers: +0.3pp
● FTAR: +0.5pp
vs Moreyball
● Shot Profile: Δ3PA +1pp | ΔRim −1.5pp | ΔMid +0.5pp
● Efficiency: −1.2%
● Turnovers: +0.2pp
● FTAR: +0.2pp
vs Heliocentric
● Shot Profile: Δ3PA +0.5pp | ΔRim −2pp | ΔMid +1.5pp
● Efficiency: −1.8%
● Turnovers: +0.5pp
● FTAR: +0.4pp
vs Coach K Offense
● Shot Profile: Δ3PA +1pp | ΔRim −1.5pp | ΔMid +0.5pp
● Efficiency: −1.2%
● Turnovers: +0.3pp
● FTAR: +0.3pp
● Rationale: Motor helps with pace. Rim protection via activity. But can't switch onto
perimeter.
Defensive Archetype 20: Situational Ball-Handler (Bench
Guard)
Identity: Secondary handler on offense. On defense: adequate but not elite. Effort is solid. Can
contain some guards but gets beaten by quality creators. Average team defense.

vs Spread Pick-and-Roll
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.8%
● Turnovers: +0.3pp
● FTAR: −0.2pp
vs 5-Out Motion
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.5%
● Turnovers: +0.2pp
● FTAR: −0.1pp
vs Motion / Read & React
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.5%
● Turnovers: +0.2pp
● FTAR: −0.1pp
vs Pace & Space
● Shot Profile: Δ3PA −0.5pp | ΔRim Neutral | ΔMid +0.5pp
● Efficiency: −0.3%
● Turnovers: +0.1pp
● FTAR: −0.1pp
vs Dribble Drive
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.0%
● Turnovers: +0.4pp
● FTAR: −0.3pp
vs Princeton
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.5%
● Turnovers: +0.2pp
● FTAR: −0.1pp
vs Flex

● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.5%
● Turnovers: +0.2pp
● FTAR: −0.1pp
vs Swing
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.5%
● Turnovers: +0.2pp
● FTAR: −0.1pp
vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA Neutral | ΔRim −0.5pp | ΔMid +0.5pp
● Efficiency: −0.3%
● Turnovers: +0.1pp
● FTAR: Neutral
vs Moreyball
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.8%
● Turnovers: +0.3pp
● FTAR: −0.2pp
vs Heliocentric
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.0%
● Turnovers: +0.4pp
● FTAR: −0.3pp
vs Coach K Offense
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.8%
● Turnovers: +0.3pp
● FTAR: −0.2pp
● Rationale: Adequate on-ball defense. Can contain some of the motion but not elite.
Defensive Archetype 21: Developmental Prospect

Identity: Tools > production. On defense: physical tools present (length, speed, vertical) but
technique, positioning, and IQ are underdeveloped. High variance — makes spectacular plays
and catastrophic mistakes in the same game.
vs All 11 Offensive Systems (Uniform High-Variance)
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.5%
● Turnovers: Neutral (steals offset by blown assignments)
● FTAR: +0.3pp
● Rationale: Developmental Prospect is net-neutral to slightly negative across all systems.
Physical tools create occasional disruption (blocks, steals, length-based contests) but
technique gaps create equal-and-opposite breakdowns. Applied uniformly with minor
variations:
○ vs Dribble Drive / Heliocentric: Efficiency penalty increases to +1.0% (quality
creators exploit technique gaps)
○ vs Zone / Princeton: Efficiency penalty decreases to +0.2% (less direct targeting,
tools matter less in structured defenses)
vs Coach K Offense
● Shot Profile: Δ3PA +1pp | ΔRim +1pp | ΔMid −2pp
● Efficiency: +1.0%
● Turnovers: Neutral
● FTAR: +0.5pp
● Rationale: Physical tools help with pace but technique gaps exposed by motion and
read-react. High variance.
END OF PART 3: DEFENSIVE ARCHETYPE × OFFENSIVE SYSTEM (252 entries complete)

Matchup & Modifier Governance

Matchup & Modifier Governance
(Simulation Engine)
0. Scope
This is the single authoritative document for how identity clashes create probability pressure and
how that pressure is composed, bounded, and delivered to the Possession Engine. It replaces:
● Matchup Interaction Governance
● Modifier Framework
This layer sits between identity inference and possession resolution. It does not simulate
possessions, evaluate talent, or resolve outcomes. It produces a governed modifier bundle
consumed downstream.
Canonical Flow (Locked)
1. System Inference (OSIE/DSIE)
2. Interaction Library Lookup (System × System, Archetype × System)
3. Matchup & Modifier Governance (THIS DOCUMENT)
4. Possession Engine
5. Calibration, Aggregation, and Output Layers
System and Archetype Reference
Offensive Systems (12): Spread Pick-and-Roll, 5-Out Motion, Motion / Read & React, Pace &
Space, Dribble Drive, Princeton, Flex, Swing, Post-Centric / Inside-Out, Moreyball, Heliocentric,
Coach K
Defensive Systems (10): Containment Man, Pack Line, Pressure Man (Denial), Switch
Everything, ICE / No-Middle, Zone (Structured), Matchup Zone / Hybrid, Press / Pressure
Defense, Junk / Special, Coach K
Archetypes (21): Two-Way Wing, 3-and-D Wing, POA Defender Guard, Primary Ball-Handler
(Offense-First), Switchable Defender Wing, Anchor Big, Stretch Big, Connector Guard,
Offensive Wing Scorer, Gap / Team Defender Wing, Mobile Defensive Big, Chaos Disruptor
Wing, Point Forward, Utility Forward, Roll Man / Vertical Threat, Offensive Big (Defense
Liability), Situational Shooter (Specialist), Defensive Specialist (Non-Scoring), Energy Big,
Situational Ball-Handler (Bench Guard), Developmental Prospect

PART 1: MATCHUP INTERACTION
GOVERNANCE
1. Purpose
Matchup Interaction Governance defines how identity clashes create directional probability
pressure. It exists to explain WHY likelihoods shift, not to decide outcomes.
This layer:
● Does not simulate possessions
● Does not evaluate talent
● Does not resolve outcomes
● Produces governed modifier intents consumed downstream
2. Interaction Classes (Locked Order)
Three interaction classes applied in non-negotiable order:
Class 1 — System vs System (Global Environment)
● Offensive system × Defensive system
● Applies to every possession
● Establishes the macro environment: pace tendencies (system layer only), shot-diet
baselines, pressure level, foul environment
● Source: Interaction Library Part 1 (12 × 10 = 120 entries)
● Answers: "What kind of game does this matchup tend to produce?"
Class 2 — Offensive Archetype vs Defensive System (Tactical Interaction)
● Offensive archetype × Defensive system
● Applies per player on offense based on their archetype and the opponent's defensive
system
● Source: Interaction Library Part 2 (21 × 10 = 210 entries)
● Answers: "How does this defensive scheme affect what this offensive player can do?"
Class 3 — Defensive Archetype vs Offensive System (Defensive
Expression)

● Defensive archetype × Offensive system
● Applies per player on defense based on their archetype and the opponent's offensive
system
● Source: Interaction Library Part 3 (21 × 12 = 252 entries)
● Answers: "How does this defender express pressure or vulnerability inside this offensive
structure?"
Application Rule
● Class 1 applies first and establishes the environment
● Class 2 applies second and modifies offensive player outputs
● Class 3 applies third and modifies defensive player outputs
● Later classes may refine earlier pressure but may NOT override or negate them
Redundancy Rule
● If a variable is already explained by a higher-authority class, lower-authority classes do
NOT modify that same variable
● Class 1 > Class 2 > Class 3 in authority
● Example: if System × System already shifts 3PA share by +4pp, an Archetype × System
interaction cannot independently shift 3PA share by another +4pp for the same effect —
only residual (unexplained) pressure applies
3. Allowed Modifier Targets (Locked)
This layer may target ONLY the following variables:
● Shot-type distribution (rim / midrange / three-point attempt probability)
● Shot efficiency (by shot type: rim FG%, midrange FG%, three-point FG%)
● Turnover probability (live-ball, dead-ball)
● Foul-draw probability (shooting foul, non-shooting foul)
● Offensive rebound probability
● Pace (system layer only — Class 1 interactions only)
No other targets are permitted.
4. Governance Rules (Locked)
All modifier intents must be:
● Bounded downstream (bounds enforced in Part 2 of this document)
● Composed (never arbitrarily stacked)
● Directionally consistent (no sign-flips downstream)
● Consistent across systems/archetypes

Conflict Resolution (Locked)
● System × System intents take precedence over Archetype × System intents
● Archetype × Defensive System intents take precedence over Archetype × Offensive
System intents where they overlap
● Redundant intents are ignored (no double-counting)
● When Class 2 and Class 3 both modify the same variable for the same possession, the
higher-magnitude delta applies and the other is suppressed
5. Authority and Non-Authority (Locked)
Authorized to:
● Produce directional modifier intents (pressure direction + target variable)
● Condition modifier intents on identity clashes (system/archetype/coverage)
● Govern precedence and redundancy rules (prevent double-counting)
● Look up delta values from the Interaction Library
Not authorized to:
● Simulate possessions
● Force outcomes
● Change player/team ratings (KR), archetypes, badges, overrides
● Change usage or minutes
● Override possession resolution logic
● Create events
PART 2: MODIFIER FRAMEWORK
6. Purpose
The Modifier Framework governs how contextual pressure and interaction effects are
composed, bounded, and applied inside the Simulation Engine. It is the last place contextual
pressure may be introduced after governance and before possession resolution.
Modifiers exist to:
● Bend likelihoods
● Shape distributions
● Express structural lean

Modifiers do not create events. They do not force outcomes.
7. Canonical Definition (Locked)
A modifier is a bounded adjustment applied to a probability distribution or rate inside the
Possession Engine, prior to possession resolution.
Modifiers:
● Do not create actions
● Do not assign decisions
● Do not change ratings
● Do not override resolution logic
● Only adjust how likely outcomes are
8. Modifier Types (Locked)
Type 1 — Additive (Δ)
Adds/subtracts a fixed delta to a probability.
Use when: shifting distribution mix or nudging rates.
Examples:
● +3pp to three-point attempt probability
● −2pp to turnover probability
Type 2 — Multiplicative (×)
Scales a base probability or efficiency.
Use when: modifying conversion quality or reflecting efficiency punishments/boosts.
Examples:
● Three-point efficiency × 1.08
● Turnover probability × 1.12
9. Valid Modifier Targets (Locked)
A) Shot-Type Distribution (must renormalize to 100%)

● Rim attempt probability
● Midrange attempt probability
● Three-point attempt probability
B) Shot Efficiency (conditional by shot type)
● Rim FG%
● Midrange FG%
● Three-point FG%
C) Turnover Probability
● Live-ball turnover likelihood
● Dead-ball turnover likelihood
D) Foul-Draw Probability
● Shooting foul probability
● Non-shooting foul probability
E) Offensive Rebound Probability
● Probability a missed shot results in an offensive rebound
Clarification (locked): An offensive rebound ends the possession and initiates a new possession
(scramble carryover rules defined in Possession Engine).
F) Pace Modifier (System-Level Only)
● Possessions-per-game multiplier
● Applied only in Class 1 (System × System) interactions
● NOT applied at the archetype level (Classes 2 and 3)
No other targets are permitted.
10. Global Bounds (Hard Guardrails — Locked)
A) Shot-Type Distribution Bounds
● Max shift per layer: ±6 percentage points
● Max total shift across all layers: ±10 percentage points
B) Efficiency Bounds

● Max multiplicative shift per layer: ±12%
● Max total efficiency shift (all layers combined): ±18%
C) Turnover & Foul Bounds
● Max per-layer shift: ±15%
● Max combined shift: ±22%
D) Pace Bounds (System Layer Only)
● Max pace multiplier: ×1.08
● Min pace multiplier: ×0.92
These bounds are non-negotiable and enforced before possession resolution.
11. Composition Rules (How Modifiers Stack — Locked)
Modifiers are applied in fixed order and composed, not overwritten.
Order of Application (Locked)
1. System × System modifiers (Class 1 — from Interaction Library Part 1)
2. Offensive Archetype × Defensive System modifiers (Class 2 — from Interaction
Library Part 2)
3. Defensive Archetype × Offensive System modifiers (Class 3 — from Interaction
Library Part 3)
4. Matchup-approved residuals (only if governance permits; no double-count)
Composition Logic (Locked)
● Additive modifiers are summed → then bounded
● Multiplicative modifiers are multiplied → then bounded
● Additive adjustments occur before multiplicative scaling
12. Conflict & Precedence Rules (Locked)
To prevent double-counting:
● Higher-authority layer overrides lower: if a variable is explained at a higher-authority
layer (Class 1), lower-authority modifier for that variable is suppressed
● Residual application only: the last layer applies only what hasn't already been
accounted for

● No direction flips: later layers may attenuate earlier effects but may NOT reverse sign
(if Class 1 says 3PA goes up, Class 3 cannot make 3PA go down for the same
interaction)
● Maximum one coverage bonus per variable per possession: prevents stacking
multiple archetype interactions on the same shot-type shift
13. State Awareness (Hard Constraint — Locked)
Modifiers may be state-conditional but never state-creating.
Allowed:
● "In Scramble state, rim efficiency × 1.05"
● "In Advantage state, turnover probability −8%"
Forbidden:
● Forcing a state change
● Skipping state transitions
State creation belongs exclusively to the Possession Engine.
PART 3: DETERMINISM & DATA SOURCE
DISCIPLINE
14. Determinism (Locked)
The entire Matchup & Modifier Governance layer is fully deterministic.
Given the same:
● System identities (from OSIE/DSIE)
● Archetype labels (from Archetype Library)
● Interaction Library delta values
The same governed modifier-intent bundle is produced every time.
No learning, tuning, or adaptation occurs here. The Interaction Library provides the data. This
document provides the rules for how that data is consumed, composed, and bounded.

15. Data Source Discipline (Locked)
Modifiers:
● MUST reference delta values from the Interaction Library (12 offense × 10 defense × 21
archetypes)
● May reference inferred labels (system, archetype, matchup tags) from upstream
● May reference film-derived attributes (contest level, help presence) if provided upstream
● May NOT compute those attributes
● May NOT invent delta values not in the Interaction Library
All inputs are assumed to be supplied upstream.
16. Outputs (Locked)
The Modifier Framework outputs a single modifier_bundle consumed only by:
● Possession Engine
● Calibration & Guardrails
The modifier_bundle contains:
● All composed, bounded delta values organized by target variable
● The composition trace (which Interaction Library entries were used, in what order, with
what bounded values)
● The final bounded values ready for possession resolution
Modifiers may NOT be surfaced as standalone insights or interpreted as coaching advice.
UI / GOVERNANCE NOTE
Governance and composition logic only. All values are produced by Nexus. No possession
resolution, player evaluation, or coaching advice lives here. This doc defines how pressure is
structured and bounded — not how outcomes are decided. All delta values come from the
Interaction Library. This doc defines the RULES for consuming those deltas.

Possession Engine

Possession Engine (Simulation Engine)
Purpose
The Possession Engine defines how a single basketball possession is simulated and resolved.
It is the atomic execution engine of the Simulation Engine. All higher-order simulations (single
games, series, seasons, tournaments) are composed exclusively of repeated executions of this
engine plus aggregation logic handled elsewhere.
Canonical Role Within Simulation Engine (Locked)
The Possession Engine is the only component authorized to resolve possession outcomes.
Canonical Flow (Locked)
1. System Inference (OSIE/DSIE) — identifies the 12 offensive and 10 defensive systems
2. Interaction Library Lookup — retrieves delta values for system × system + archetype ×
system matchups
3. Matchup & Modifier Governance — composes, bounds, and delivers the modifier bundle
4. Possession Engine (THIS DOCUMENT) — consumes the modifier bundle and resolves
one possession
5. Calibration, Aggregation, and Output Layers — aggregates resolved possessions into
game/season/tournament outputs
Lock rule: No layer below this resolves basketball events. No layer above this produces
outcomes.
Core Execution Principles (Locked)
The Possession Engine enforces the following non-negotiable rules:
Possession is the atomic unit. All outcomes resolve possession-by-possession. No minutes,
plays, or lineups are simulated directly.
State-based, not play-based. The engine simulates advantage states, not named plays.
Basketball behavior emerges from probabilistic state transitions.
Probabilistic resolution. No outcome is deterministic. All results are drawn from governed
probability distributions.

Defense shifts probabilities only. Defensive systems and personnel do not force outcomes.
They alter likelihoods only (shot type, efficiency, turnovers, fouls, rebounds). All defensive
effects arrive via the modifier bundle from the Matchup & Modifier Governance layer.
No rating mutation. Player KRs, archetypes, badges, overrides, and valuation are read-only.
The engine never re-rates players.
These principles are binding.
Authority and Non-Authority (Locked)
Authorized to:
● Resolve a possession into exactly one terminal outcome
● Transition through governed possession states
● Apply the upstream modifier bundle (from Matchup & Modifier Governance)
● Attribute events to players probabilistically (shooter/assist/TO/foul/rebound)
Not authorized to:
● Evaluate player quality or change player outputs
● Modify Player Intelligence or Team Intelligence outputs
● Aggregate results or produce box scores/projections
● Optimize decisions or strategies
● Look up interaction deltas (that's done upstream in Matchup & Modifier Governance)
Resolution only — nothing else.
State Governance (Locked)
The Possession Engine operates through a fixed possession lifecycle:
● Initiation
● Advantage
● Resolution
State transitions are:
● Probabilistic
● Bounded
● Conditioned by the upstream modifier bundle

Lock rules:
● No state may be skipped
● No terminal outcome may be bypassed
Possession Lifecycle
1) Initiation State
Determines who initiates advantage on the possession.
Initiator selection is probabilistic. Probabilities are derived from:
● Rotation/usage translation layer (if available)
● Offensive system identity (from OSIE — one of 12 locked systems)
● Player archetype tendencies (from Archetype Library — 21 locked archetypes)
Definition lock: Initiation ≠ shot attempt. The initiator is the player who first creates advantage,
not necessarily the shooter.
2) Advantage State
Defines the tactical state of the possession after initiation.
Allowed states (Locked):
● Neutral
● Advantage
● Scramble
State transitions are influenced by:
● Offensive system
● Defensive system
● Initiator archetype
● Upstream modifier bundle (from Matchup & Modifier Governance)
The advantage state conditions all downstream probabilities.
3) Resolution State
The possession resolves into exactly one terminal outcome.

Terminal Outcome Set (Locked)
A possession must end as one of the following:
● Turnover
● Shot Attempt
○ Rim
○ Midrange
○ Three
● Foul
○ Shooting foul → free throws
○ Non-shooting foul → continuation handling
● Offensive Rebound → New Possession
Offensive Rebound Rule (Locked)
An offensive rebound ends the current possession. A new possession begins immediately.
Context Carryover Rules (Locked)
When a possession is spawned from an offensive rebound:
● Advantage state initializes as Scramble
● Shot clock baseline is reduced (implementation-defined constant)
● Defensive alignment modifiers persist
● Transition probability is suppressed
This preserves realism while maintaining clean possession accounting.
Shot Resolution Model (Governed)
Shot resolution is contextual, not binary.
Shot Context Inputs (consumed here; defined upstream)
● Shot type (rim / midrange / three)
● Shooter identity
● Defender identity
● Contest percentage
● Shot quality score
● Help defender presence
● Time-to-shot
● Advantage state

● Film/PlayVision-derived features (if available at V2/V3)
All probability modifiers for shot type distribution and efficiency arrive via the modifier bundle.
The Possession Engine does not compute these modifiers — it consumes them.
Resolution Outputs
● Make / miss
● Foul drawn (if applicable)
● Shot location classification
● Contest-adjusted efficiency outcome
Defensive Influence (Locked)
Defense influences possession outcomes by shifting probabilities in:
● Shot type distribution
● Shot efficiency
● Turnover likelihood
● Foul likelihood
● Offensive rebound probability
Defense never:
● Forces a specific outcome
● Changes player ratings
● Overrides offensive intent
All defensive effects are applied as probability modifiers only, delivered via the modifier bundle
from the Matchup & Modifier Governance layer. The modifier bundle is the ONLY input channel
for defensive effects.
Event Attribution (Locked)
For every resolved possession, the engine assigns:
● Shooter (if shot)
● Assister (probabilistic, if applicable)
● Turnover committer (if turnover)
● Fouled player (if foul)

● Rebounder (if rebound)
Attribution respects:
● Player archetypes (from the 21 locked archetypes)
● Role tendencies
● Advantage state context
● Usage/participation weights (from Team KR pipeline)
Engine Outputs (Raw Events Only)
The Possession Engine outputs raw possession events only:
● possession_id
● initiator_id
● advantage_state
● terminal_outcome_type
● shooter_id (if applicable)
● shot_type + location
● contest_level
● result (make/miss)
● foul_drawn (yes/no) + foul type (if applicable)
● turnover_type + turnover_committer_id (if applicable)
● rebounder_id (if applicable)
● points_scored
No aggregation, KRs, summaries, spreads, totals, or projections occur here.
Explicit Non-Responsibilities (Locked)
The Possession Engine does NOT:
● Aggregate statistics
● Produce box scores
● Calculate spreads/totals
● Evaluate player value
● Modify Player Intelligence outputs
● Modify Team Intelligence outputs
● Look up interaction deltas (done upstream)
● Compute modifier values (done upstream)

Those functions are handled by higher layers (Simulation Engine aggregation) or upstream
layers (Interaction Library + Matchup & Modifier Governance).
Data Tier Behavior
The Possession Engine operates at whatever data tier is available. Higher tiers provide richer
inputs to the shot resolution model:
● V1 (Stats-Only): Shot context inputs are estimated from box score proxies. Contest
percentage, help presence, and time-to-shot are modeled, not measured.
● V1+ (Licensed Granular): Play-type data improves shot context accuracy. Actual usage
and shot profiles available.
● V2 (PlayVision — 1 Season): Full shot context from camera data. Contest percentage,
help presence, spatial data measured directly.
● V3 (PlayVision Deep — Multi-Season): Multi-season context enables pattern
recognition and historical shot quality modeling.
The Possession Engine itself does not change based on data tier — it always runs the same
state machine. The QUALITY of inputs improves with higher tiers, which improves resolution
accuracy.
UI / GOVERNANCE NOTE
Atomic resolution engine only. All values consumed from upstream (modifier bundle from
Matchup & Modifier Governance). No evaluation, weighting, or normalization logic lives here.
This doc defines how a single possession is resolved — not how interactions are computed,
how modifiers are bounded, or how results are aggregated.

Simulation Engine

Simulation Engine — Master Contract
Purpose
The Simulation Engine is the master orchestrator of the KaNeXT Basketball Intelligence
System's prediction layer. It consumes player truth, team truth, system identity, and interaction
data to produce game projections, season forecasts, tournament simulations, and live halftime
decision support.
The Simulation Engine does not evaluate players or teams. It reads governed truth from
upstream and produces downstream projections only.
Canonical Flow (Locked)
1. System Inference (OSIE/DSIE) — identifies the 12 offensive and 10 defensive systems
2. Interaction Library — provides delta values for all 582 identity-clash matchups
3. Matchup & Modifier Governance — composes, bounds, and delivers the modifier
bundle
4. Possession Engine — resolves individual possessions using the modifier bundle
5. Simulation Engine (THIS DOCUMENT) — orchestrates the Possession Engine across
thousands of possessions, aggregates results, and produces structured outputs
6. Simulation Confidence Gate — stamps confidence on the output
A) Required Inputs (Simulation Cannot Run Without
These)
Simulation MUST PULL, per team:
From Team Intelligence (Team KR Pipeline)
● Team identity record (team + season)
● Team KR object: team_off_kr, team_def_kr, team_overall_kr
● Rotation participation % vector (players ≥5% only; stored as %)
● Per-rotation player outputs:
○ player_final_system_off_kr
○ player_final_system_def_kr
○ player_archetype (from 21 locked archetypes)

○ player_confidence_pct (if available)
● Team KR Diagnostics (Coverage Map, Missing Demands, Fragility Flags)
From System Identity (OSIE/DSIE)
● Offensive system identity (one of 12 locked systems)
● Defensive system identity (one of 10 locked systems)
● If provisional/uncertain, include:
○ System mixture weights
○ Inference confidence metadata
● Pace Profile (PACE100 + band)
● Defensive Court Depth
From Interaction Library (582 entries)
● System × System entries (Part 1: 120 entries)
● Offensive Archetype × Defensive System entries (Part 2: 210 entries)
● Defensive Archetype × Offensive System entries (Part 3: 252 entries)
From Matchup & Modifier Governance
● Allowed targets (pace, shot diet, efficiency, TO, foul, OREB)
● Bounds / caps / composition order
● Deterministic resolution rules
● Composed modifier bundle
From Simulation Confidence Gate
● sim_confidence_pct mapping table + adjusters
● Data tier determination (V1 / V1+ / V2 / V3)
From Calibration Layer (If Enabled)
● Calibration coefficients by competitive level
● Home/away/neutral adjustment
● Conference-strength adjustment
● Historical accuracy feedback (if available)
B) Simulation Run Types — LOCKED (7)
1) Single Game Simulation

Returns: expected result + drivers for Team A vs Team B.
Inputs: Both teams' full input packs. Environment (home/away/neutral, competitive level).
Process: Run the Possession Engine N thousand times for this matchup. Aggregate results into
expected score, margin band, five-factor projection, and driver summary.
2) Series / Multi-Game Set Simulation
Returns: aggregate expectation across N games + sensitivity/volatility.
Inputs: Same as Single Game, repeated for N matchups.
Process: Run Single Game simulation for each game in the set. Aggregate win probability
distribution, identify swing games, compute series outcome probabilities.
3) Season Simulation (Schedule)
Returns: expected record band + swing games + stretch risks.
Inputs: Full schedule of opponents. Each opponent requires their own input pack (or best
available estimate).
Process: Run Single Game simulation for each scheduled game. Aggregate into expected W-L
band, identify high-leverage games, flag fatigue/schedule stretches, compute conference
standings projections.
4) Tournament Simulation (Bracket)
Returns: advancement expectation by round + matchup vulnerabilities.
Inputs: Bracket structure + all teams' input packs.
Process: Simulate each round. Winners advance. Repeat through championship. Run N
thousand full brackets. Compute advancement probability by round, identify "avoid list" (worst
matchups), and flag upset vulnerability.
5) Box Score Projection Mode (Team + Player Statlines)
Returns: projected team totals + player statlines (minutes, shot diet, counting stats).
Inputs: Same as Single Game.
Process: Run the Possession Engine with full event attribution. Aggregate individual player
events into projected box scores: points, FGA by type, FGM by type, FTA/FTM, rebounds,
assists, turnovers, steals, blocks, fouls, minutes. Team totals computed from player aggregation.

This mode answers: "If these two teams play, what does each player's box score look like?" It
surfaces mismatches at the player level — e.g., "your stretch big projects 9 three-point attempts
against their drop coverage because the interaction library shifts his 3PA +4pp."
6) Line Translation Mode (Spread/Total Mirror)
Returns: implied win%, spread/total equivalents + sensitivity ("what moves the line").
Inputs: Same as Single Game.
Process: Convert expected margin and score into spread and total equivalents. Compute "what
moves the line" sensitivity: which single variable change (injury, system change, foul trouble)
produces the largest spread/total shift.
7) Halftime Live Simulation
Returns: win probability from current position + win probability under each proposed adjustment.
Inputs: Current game state (score, time remaining, period, foul trouble, lineup availability,
timeout count) + both teams' full input packs + first-half tag log (if available).
Process:
1. Snapshot current game state as the starting condition
2. Run the Possession Engine for remaining possessions only (not the full game)
3. Compute: Baseline win probability — if no adjustments are made, what's the projected
outcome?
4. For each proposed adjustment (from Game Ops Halftime Sandbox):
○ Apply the adjustment as a modifier override (e.g., "switch to Zone defense"
changes defensive system identity for remaining possessions)
○ Re-run remaining possessions with the new modifier bundle
○ Compute: Adjusted win probability — how does this change the projected
outcome?
5. Output: Baseline win% + up to 5 adjusted win% scenarios + key variable identification
("the single factor most likely to swing the outcome is [X]")
Constraints:
● Halftime Live Simulation is directional, not precise. It surfaces which adjustments have
the highest expected impact, not guaranteed outcomes.
● Confidence on halftime projections is governed by the Simulation Confidence Gate with
a halftime adjuster (reduced confidence due to smaller remaining sample and in-game
variance).
● This mode is consumed by Game Ops Section J (Simulation Projections) in the Halftime
Staff Packet.

C) Universal Output Rules (Applies to Every Run Type)
Every simulation output MUST include:
C1) Version + Confidence
● data_tier: V1 (stats-only) / V1+ (licensed granular) / V2 (PlayVision 1 season) / V3
(PlayVision Deep multi-season)
● sim_confidence_pct: [0–100] (from Simulation Confidence Gate)
● Confidence does not change math; it qualifies reliability.
C2) Determinism
Given the same inputs:
● The same output object is produced
● The same interaction trace is produced
C3) No Truth Mutation
Simulation:
● Does NOT modify Player KR, Team KR, archetypes, badges, overrides, or system
identities
● Reads governed truth and produces downstream projections only
C4) Interaction Trace Requirement (No Black Box)
Simulation MUST output an "applied interaction trace" that records:
● Which System × System interaction entries were used (from Interaction Library Part 1)
● Which Offensive Archetype × Defensive System entries were used (from Interaction
Library Part 2)
● Which Defensive Archetype × Offensive System entries were used (from Interaction
Library Part 3)
● Which modifier targets were affected (and by how much, within bounds)
● Composition order (from Matchup & Modifier Governance)
The trace is the audit trail. It explains WHY the simulation produced the result it did. No black
boxes.

D) Standard Simulation Output Object (Field Contract)
Every run type returns this top-level object:
D1) Header
● run_type (one of the 7)
● teams (Team A id, Team B id if applicable)
● environment (level/ruleset, season, neutral/home/away if known)
● data_tier (V1 / V1+ / V2 / V3)
● sim_confidence_pct
D2) Inputs Snapshot (Read-Only Echo)
● Team KRs (off/def/overall) for both teams
● Rotation participation % (players ≥5%)
● OSIE/DSIE identities (locked/provisional + confidence)
● System mix shares (if applicable)
● Any constraints applied (injury flags, foul trouble for Halftime Live)
D3) Matchup Interaction Trace (Required)
● system_system_applied[] — entries from Interaction Library Part 1
● off_archetype_vs_def_system_applied[] — entries from Interaction Library Part 2
● def_archetype_vs_off_system_applied[] — entries from Interaction Library Part 3
Each item must include:
● source (Interaction Library Part + entry key)
● targets_modified (pace / shot diet / efficiency / TO / foul / OREB)
● raw_delta (the value from the Interaction Library)
● bounded_delta (the value after Modifier Framework bounds)
● composition_step_order (1, 2, or 3)
D4) Outputs (Run-Type Specific)
● Single Game: result + margin band + projected pace + five-factor projection
● Series: aggregated result distribution + sensitivity summary
● Season: expected W-L band + swing games list + conference standings projection
● Tournament: advancement by round + "avoid list" + upset vulnerability flags
● Box Score Mode: team totals + player statlines (minutes + usage + shot diet + counting
stats)
● Line Mirror: implied win% + spread/total equivalents + "what moves line"
● Halftime Live: baseline win% + adjusted win% per scenario + key swing variable

D5) Driver Summary (Required)
● Top 3 outcome drivers (must reference trace objects)
● Top 3 vulnerabilities/risks (turnovers, foul/bonus, rebounding, shot diet collapse)
● "If we change X" sensitivity bullets (optional for standard runs, required for Halftime Live)
E) Calibration Layer
Calibration adjusts simulation outputs to align with observed real-world results. It does NOT
change the interaction deltas, modifier bounds, or possession resolution logic. It adjusts the
translation from simulated possessions to projected outcomes.
Calibration Inputs
● Competitive level: Different levels play different basketball. D1 High-Major games have
different scoring distributions than NAIA games. Calibration coefficients adjust for
level-specific baselines.
● Home/away/neutral: Home teams win approximately 60-65% of games in college
basketball. A home-court adjustment is applied as a modifier on top of the simulation
result.
● Conference strength: Schedule strength affects how simulation results translate to
expected records. A team simulated to win 75% of possessions against a weak schedule
is different from the same win rate against a strong schedule.
Calibration Rules (Locked)
● Calibration is applied AFTER the Possession Engine resolves and BEFORE the output
is finalized
● Calibration coefficients are set per competitive level and updated seasonally (not
mid-season)
● Calibration NEVER modifies Player KR, Team KR, system identity, interaction deltas, or
modifier bounds
● Calibration adjustments are logged in the output trace
● If no calibration data exists for a level (new program, new level), the simulation runs
uncalibrated and the confidence is reduced accordingly
Calibration Feedback Loop
● After each game, the simulation's pregame projection is compared to the actual result
● Over time, systematic biases are identified (e.g., "simulation consistently overestimates
rim efficiency at the D2 level")
● Calibration coefficients adjust to correct for identified biases

● Adjustments are bounded: no single calibration coefficient can shift a projection by more
than ±5 points
● Calibration is automatic, deterministic, and auditable
F) Data Tier Behavior
The Simulation Engine operates at whatever data tier is available for each team. When two
teams have different data tiers, the simulation uses the lower tier for the matchup interaction
(you can only be as precise as your least-informed team).
Tier What Simulation Gets Impact
V1 — Stats-Only Box score stats, estimated usage, Baseline simulation. Estimated
roster minutes. Production-based shot context. Confidence lowest
Player KRs. System identity from V1 (55-70%).
proxy signals.
V1+ — Licensed V1 + actual play-type data, actual Better shot diet modeling. More
Granular usage, shot profiles. System identity accurate interaction application.
from full classification triggers. Confidence improved (72-85%).
V2 — PlayVision Full camera data. Actual usage, High-fidelity simulation. Real
(1 Season) matchup tracking, spatial data. System shot context, real matchup data.
identity from full structural signals. Confidence high (83-95%).
V3 — PlayVision Multi-season camera data + film Highest-fidelity simulation.
Deep archive. Trend analysis, pattern Multi-year trend context.
(Multi-Season) recognition, historical comparison. Confidence highest (90-97%).
Mixed-Tier Matchups
When Team A is V3 and Team B is V1:
● System × System interaction uses both teams' identified systems (V3 confidence for A,
V1 confidence for B)
● Archetype interactions for Team A's offense use full V3 data
● Archetype interactions for Team B's offense use V1 proxy data
● sim_confidence_pct reflects the LOWER tier (V1 confidence range applies)
● Trace explicitly notes the tier mismatch

G) System Mix Handling
When OSIE or DSIE returns a System Mix (dominance criteria not met):
● Simulation runs multiple times — once per system in the mix
● Results are weighted by mix shares
● Example: Team A offense is 60% Spread PnR / 40% Motion. Simulation runs with
Spread PnR interactions (weighted 0.60) and Motion interactions (weighted 0.40). Final
output is the weighted blend.
● Interaction trace shows both runs and their weights
Example Output (Mock) — Single Game Simulation (V1)
Run Context
● Team A: Lincoln (Home)
● Team B: Opponent State (Away)
● Systems (from OSIE/DSIE):
○ Team A Off: Moreyball
○ Team A Def: Pressure Man
○ Team B Off: Pace & Space
○ Team B Def: Containment Man
● data_tier: V1 (stats-only)
● sim_confidence_pct: 68%
Interaction Trace (excerpt, simplified)
1. system_system_applied
○ source: Interaction Library Part 1, Moreyball vs Containment Man
○ targets_modified: { shot_diet_3pa: +, rim_attempts: +, ft_rate: + }
○ bounded_delta: { 3PA_share: +0.03, rim_share: +0.02, FT_rate: +0.02 }
2. system_system_applied
○ source: Interaction Library Part 1, Pace & Space vs Pressure Man
○ targets_modified: { turnovers: +, pace: + }
○ bounded_delta: { TO_rate: +0.02, pace: +1.5 possessions }
3. off_archetype_vs_def_system_applied
○ source: Interaction Library Part 2, Stretch Big vs Containment Man
○ targets_modified: { corner_3_volume: + }

○ bounded_delta: { 3PA: +0.03, 3P%: +0.015 }
Output (Single Game)
● projected_possessions: 71
● projected_score:
○ Team A: 78
○ Team B: 74
● expected_margin_band: Team A +1 to +7
● five factors (projected):
○ eFG: A slight edge
○ TO rate: B worse (pressure)
○ OREB: neutral
○ FT rate: A edge (Moreyball pressure points)
○ transition: B attempts higher pace but punished by TOs
Driver Summary
Top drivers:
1. Pressure Man → +TO pressure on Pace & Space ballhandlers (trace #2)
2. Moreyball vs Containment → A increases rim/FT volume (trace #1)
3. A's Stretch Big archetype creates corner-3 quality (trace #3)
Risks:
● If A's primary creator enters foul trouble → FT edge collapses
● If B breaks pressure early → pace swings against A
Example Output (Mock) — Halftime Live Simulation
Run Context
● Game: Lincoln vs Opponent State (same as above)
● Halftime score: Lincoln 32, Opponent State 35
● Lincoln's primary creator has 3 fouls
● data_tier: V1
● sim_confidence_pct: 62% (halftime adjuster applied)
Outputs
● Baseline win probability (no adjustments): 41%

● Scenario A — Switch to Zone defense: 46% (+5%)
○ Why: Reduces foul exposure for primary creator, suppresses Opponent State's
rim attempts
○ Risk: Gives up volume 3s to their shooters
● Scenario B — Reduce primary creator minutes by 25%: 38% (−3%)
○ Why: Protects from 4th foul but removes best offensive player
○ Risk: Offense loses its engine
● Scenario C — Maintain current approach, attack bonus aggressively: 44% (+3%)
○ Why: Opponent State in bonus, free throw generation increases
○ Risk: Primary creator still at foul risk
● Key swing variable: "Primary creator's foul status. If he picks up foul #4, win probability
drops to 31%. If he plays foul-free the rest of the way, win probability rises to 52%."
H) Governance (Non-Negotiable)
● Simulation is produced by Nexus. No manual override of computed outputs.
● All outputs are deterministic: same inputs → same outputs.
● Simulation does NOT modify any upstream truth (Player KR, Team KR, archetypes,
system identity).
● The interaction trace is REQUIRED on every output. No black boxes.
● Calibration adjustments are bounded and auditable.
● Halftime Live projections are directional aids, not prescriptions. Coach decides.
● Data tier determines confidence, not math. The simulation always runs the same logic —
the QUALITY of inputs varies by tier.
UI / GOVERNANCE NOTE
Master orchestration contract only. All interaction deltas come from the Interaction Library (582
entries). All composition rules come from Matchup & Modifier Governance. All possession
resolution comes from the Possession Engine. All confidence comes from the Simulation
Confidence Gate. This doc defines WHAT the simulation produces, not HOW each component
works internally.

Simulation Confidence Gate

Simulation Confidence Gate
Purpose
The Simulation Confidence Gate stamps a reliability score on every simulation output. It
communicates how much the user should trust the projection based on the quality,
completeness, and stability of the data feeding the simulation.
Confidence does NOT change simulation math. It does not alter projected scores, win
probabilities, or box score projections. It qualifies reliability only — telling the coach "we're 90%
confident in this projection" vs "we're 58% confident, take this with a grain of salt."
Where It Lives in the Pipeline
Confidence is computed at the END of every simulation run, AFTER all outputs are produced. It
is the final stamp before the output is delivered.
Canonical flow:
1. System Inference (OSIE/DSIE)
2. Interaction Library
3. Matchup & Modifier Governance
4. Possession Engine
5. Simulation Engine (produces outputs)
6. Simulation Confidence Gate (THIS DOCUMENT) — stamps confidence on outputs
Data Tier Reference
Tier Definition What Simulation Gets
V1 — Stats-Only Public box scores, roster minutes, Production-based Player KRs,
estimated usage. No play-type estimated shot context, system
data. identity from proxy signals.
Baseline.
V1+ — Stats + V1 + third-party play-type data. Actual play-type frequencies, full
Licensed Actual usage, shot profiles, classification triggers for
Granular possession-level efficiency. Not OSIE/DSIE, better shot diet
owned. modeling. Bridge tier.

V2 — PlayVision KaNeXT-owned camera data. Real shot context, real matchup
(1 Season) Single season processed. Full data, full structural signals for
play-type, usage, matchup tracking, system inference. High fidelity.
spatial data.
V3 — PlayVision Multiple seasons of PlayVision data Multi-year trend context, system
Deep + film archive. Trend analysis, evolution tracking, highest
(Multi-Season) pattern recognition, historical confidence on all inputs.
comparison.
Simulation Confidence Table (Locked Ranges)
Step 1: Choose the row that best matches the data available for the
simulation
Data Available (Simulation Inputs) sim_confidence_pct
(Default Range)
V1 stats-only: box scores + roster minutes/participation + 55–70%
Player KR (production-based) + Team KR
V1 stats-only + stable system identity (coach-continuity or 60–75%
OSIE/DSIE locked with high stability)
V1 stats-only + in-season OSIE/DSIE confirmation (identity 65–80%
inferred from actual games, not assumed from prior year)
V1+ licensed granular: play-type data + shot profile + efficiency 72–85%
+ OSIE/DSIE from full classification triggers
V1+ licensed granular + multi-game trend context (same 78–90%
opponent/system observed across multiple games)
V2 PlayVision (1 season): owned camera data processed + full 83–93%
tag log + lineup stint accuracy + OSIE/DSIE locked
V2 PlayVision + high completeness: accurate stints + stable 88–95%
identity + deep matchup samples + stable rotation
V3 PlayVision Deep (multi-season): multi-year processed data 90–97%
+ film archive + trend analysis + stable identity
Step 2: Apply adjusters within the chosen range

Rule (locked): Adjusters may only move the value WITHIN the row's range. Adjusters may NOT
push the final value below the row minimum or above the row maximum.
Downshifts (bounded):
Condition Adjustment
OSIE/DSIE uncertainty (identity not locked / system mix required / mixed −5 to −12
systems) pts
Rotation instability / injuries / unknown minutes distribution −5 to −10
pts
Lineup/stint accuracy weak (who played with who unclear) −5 to −10
pts
Small sample opponent context (few quality games / limited matchup −3 to −8 pts
evidence)
Mixed data tiers between the two teams (e.g., Team A is V3, Team B is V1) −3 to −8 pts
Preseason simulation (no current-season games played yet, using prior-year −5 to −10
identity) pts
Mid-season coaching change (system identity in flux) −5 to −10
pts
High roster turnover (>70% new players, system fit uncertain) −3 to −8 pts
Upshifts (bounded):
Condition Adjustment
High completeness + stable identity + strong sample size Move toward top of range
Both teams at same data tier (no mismatch penalty) +2 to +3 pts
Conference opponents with multiple prior meetings this +2 to +5 pts
season
Locked systems + stable top-7 rotation for both teams +3 to +5 pts
No upshift may exceed the row maximum.

Run-Type Confidence Modifiers
Different simulation run types have different inherent confidence levels. A single game
projection is more reliable than a full tournament bracket simulation because each additional
layer of simulation compounds uncertainty.
Step 3: Apply run-type modifier after Steps 1 and 2
Run Type Confidence Rationale
Modifier
Single Game No modifier Direct matchup, most reliable projection type
Simulation (baseline)
Box Score −2 to −5 pts Player-level attribution adds variance on top of game-level
Projection projection
Mode
Line No modifier Same math as Single Game, just translated to spread/total
Translation
Mode
Series / −3 to −5 pts Multi-game compounding of single-game uncertainty
Multi-Game Set
Season −5 to −10 pts Many opponents, some with limited data. Schedule effects
Simulation compound.
Tournament −5 to −12 pts Bracket variance + elimination format + multiple unknown
Simulation future opponents
Halftime Live −5 to −10 pts Reduced remaining sample (only second half). In-game
Simulation variance high. First-half data may not predict second-half
adjustments. Foul trouble and fatigue introduce additional
uncertainty.
Step 4: Compute final sim_confidence_pct
sim_confidence_pct = Row baseline (Step 1) + Adjusters (Step 2) +
Run-type modifier (Step 3)
Final value is bounded: minimum 0, maximum 100. In practice, no simulation should output
above 97% (even V3 + perfect conditions has irreducible basketball variance) or below 40%
(below that, the simulation adds little value over a coin flip).
Practical confidence bands for coach-facing display:

Confidence Display Label Coach Guidance
Range
90–97% Very High Strong projection. Trust the directionality and the
Confidence magnitude.
80–89% High Confidence Reliable projection. Trust the directionality. Magnitude
has some variance.
70–79% Moderate Directionally useful. Specific numbers may shift.
Confidence Consider the driver summary more than the exact
score.
60–69% Low-Moderate Use for general direction only. High uncertainty on
Confidence specifics. Weight the "risks" section heavily.
50–59% Low Confidence Limited data. Projection is better than nothing but
should not drive major decisions alone.
Below 50% Very Low Insufficient data for reliable projection. Treat as
Confidence illustrative only.
Mixed-Tier Matchup Confidence
When two teams have different data tiers, the simulation confidence reflects the LOWER tier
with a mismatch penalty.
Team A Tier Team B Tier Base Confidence Mismatch Penalty
Range
V3 V3 90–97% None
V3 V2 85–93% −2 to −3 pts
V3 V1+ 75–88% −3 to −5 pts
V3 V1 60–78% −5 to −8 pts
V2 V2 83–95% None
V2 V1+ 75–88% −2 to −3 pts
V2 V1 60–78% −3 to −5 pts
V1+ V1+ 72–90% None

V1+ V1 60–78% −2 to −3 pts
V1 V1 55–75% None
The simulation is only as confident as its least-informed team.
Halftime Live Confidence — Special Rules
Halftime Live Simulation has additional confidence considerations beyond the standard table:
Halftime Condition Additional Adjustment
First-half tag log available (V2/V3 +3 to +5 pts (real-time data improves second-half
in-game data) modeling)
First-half tag log NOT available −3 to −5 pts
(V1 box score only at half)
Game is within 5 points at No adjustment (competitive game, simulation most useful)
halftime
Game is a blowout (>20 point −5 pts (blowout dynamics are poorly modeled — garbage
margin) time, bench lineups, effort changes)
Key player in foul trouble −2 to −3 pts (foul trouble is binary — the player either
fouls out or doesn't, hard to probabilistically model)
Opponent made halftime Cannot be modeled — note in trace as uncertainty source
adjustment not yet observed
Preseason Confidence — Special Rules
Preseason simulations (before any current-season games) have unique confidence constraints:
Preseason Condition Confidence
Range
Both teams: same coach + low turnover + prior year V2/V3 55–70%
data
Both teams: same coach + high turnover 45–60%

One or both teams: new coach 40–55%
One or both teams: no usable prior data 35–50%
Preseason simulations are inherently less reliable because system identity is PROVISIONAL
(not OBSERVED) and roster composition may not reflect actual performance.
Confidence Over Time (Season Arc)
Simulation confidence naturally increases as the season progresses:
Season Phase Typical Confidence Trajectory
Preseason (0 games) 35–70% depending on data availability and coaching continuity
Early season (games 1–5) 50–75% — OSIE/DSIE begins observing, still PROVISIONAL or
early OBSERVED
Mid-season (games 6–15) 65–85% — System identity locked or approaching lock.
Rotation stabilizing.
Late season (games 75–92% — Full sample. Stable identity. Strong interaction data.
16–25)
Conference tournament / 80–97% — Maximum data. FROZEN system identity. Full
Postseason confidence on locked teams.
This trajectory assumes the team's data tier remains constant. Upgrading from V1 to V2
(PlayVision installation mid-season) creates a confidence jump independent of game count.
Output
● sim_confidence_pct ∈ [0, 100]
● Computed at end of every simulation run
● Included in every simulation output object (Section D1 of Simulation Engine)
● Does NOT change simulation math — qualifies reliability only
● The confidence value is displayed alongside every projection the coach sees

Governance
● Confidence values are produced by Nexus. No manual override.
● Confidence ranges are locked. Adding or modifying ranges requires documentation,
versioning, and approval.
● Adjusters are bounded — they cannot push confidence below the row minimum or above
the row maximum (before run-type modifiers).
● Run-type modifiers are applied AFTER adjusters.
● The Simulation Confidence Gate does not interact with the Interaction Library, Modifier
Framework, or Possession Engine. It only reads the data tier, system identity status, and
run type to produce a confidence stamp.
● The product flywheel: V1 is what everyone starts with. V2 is what you get when you join
KaNeXT. V3 is what you get when you stay. Simulation confidence compounds over time
— the longer a program is on the platform, the more the coach can trust the projections.
UI / GOVERNANCE NOTE
Reference table and confidence logic only. All values are produced by Nexus. No simulation
math, interaction deltas, or possession resolution logic lives here. This doc defines HOW MUCH
to trust the simulation output — not how the output is produced.

Physical Mismatch Modifiers

Physical Mismatch Modifiers v1.0
Classification
Simulation Engine — Modifier Framework Extension Authority Level: Class 4 — Physical
Mismatch Residuals Position in Canonical Flow: Applied AFTER Classes 1-3, BEFORE
Possession Resolution Status: LOCKED
Purpose
The existing Modifier Framework (Classes 1-3) governs identity-clash pressure: system vs
system, archetype vs system. These classes explain HOW teams play and how schemes
interact.
Physical Mismatch Modifiers explain what happens when the BODIES don't match — when one
team's physical profile creates structural advantages that identity-clash modifiers alone cannot
capture.
The KR pipeline scores individual Height and Length as TKR traits. These traits feed into each
player's overall KR, which feeds into Team KR, which feeds into simulation inputs. This pathway
captures HEIGHT AS TALENT but does NOT capture HEIGHT AS INTERACTION. A 7'2"
center's KR reflects his tools. It does not reflect what happens when that 7'2" center faces a 6'6"
forward — the DIFFERENTIAL effect on shot contest, rebound probability, interior scoring
geometry, and shot alteration.
Physical Mismatch Modifiers close this gap.
Governing Principles (Locked)
1. Modifier-only. These modifiers bend likelihoods. They do not create events, assign
decisions, change KRs, or override possession resolution.
2. Differential-driven. Every modifier activates based on the GAP between two players or
two teams — never on absolute height alone. A 7'0" center facing a 7'0" center
generates ZERO modifier. A 7'0" center facing a 6'4" forward generates significant
modifier.

3. Bounded. All modifiers obey the global bounds from Matchup & Modifier Governance.
Physical Mismatch Modifiers cannot exceed the global caps even when combined with
Classes 1-3.
4. Non-redundant with Classes 1-3. If a Class 1-3 modifier already explains a variable
shift (e.g., system vs system already shifts rim FG%), Physical Mismatch Modifiers apply
only the RESIDUAL not already captured. No double-counting.
5. Deterministic. Same inputs produce same outputs. No learning, tuning, or adaptation.
6. State-conditional, never state-creating. May modify probabilities in specific game
states (e.g., fourth quarter fatigue) but never force state transitions.
Modifier A: Height Differential Modifier (Position-Level)
What It Measures
The height gap between the offensive player and his primary defender at the point of shot
attempt, rebound contest, or post-up initiation.
Activation Threshold
Activates when the height differential at any matchup position exceeds 3 inches (7.6 cm).
Below 3 inches, the KR pipeline's Height trait adequately captures the difference.
Input
● attacker_height_inches (from roster data)
● defender_height_inches (from roster data)
● height_gap = attacker_height - defender_height
For defensive possessions (opponent attacking):
● attacker_height_inches = opponent player height
● defender_height_inches = your player height
● height_gap = defender_height - attacker_height (positive = your defender
is taller)
Modifier Values (Per Inch Beyond 3-Inch Threshold)
When YOUR player is TALLER (defensive advantage):
Target Variable Modifier Type Value Per Inch Max Cumulative

Opponent Interior FG% Multiplicative × 0.97 (−3% per × 0.85 (−15%)
inch)
Opponent Shot Contest Level Additive +0.5 tiers per 2 +2 tiers
inches
Block Probability Additive +1.2pp per inch +6pp
Defensive Rebound Probability Additive +2.5pp per inch +10pp
Opponent Rim Attempt Additive −1.5pp per inch −8pp
Probability
When YOUR player is SHORTER (defensive disadvantage):
Target Variable Modifier Value Per Inch Max Cumulative
Type
Own Interior FG% vs that Multiplicative × 0.98 (−2% per × 0.90 (−10%)
defender inch)
Opponent Post-Up Efficiency Multiplicative × 1.03 (+3% per × 1.15 (+15%)
inch)
Offensive Rebound Probability Additive −2.0pp per inch −8pp
When YOUR player is TALLER (offensive advantage):
Target Variable Modifier Value Per Inch Max
Type Cumulative
Own Interior FG% Multiplicative × 1.025 (+2.5% per × 1.12 (+12%)
inch)
Own Post-Up Efficiency Multiplicative × 1.03 (+3% per inch) × 1.15 (+15%)
Own Offensive Rebound Additive +2.0pp per inch +8pp
Probability
Own Foul-Draw Rate (interior) Additive +0.8pp per inch +4pp
Computation Example
Rosa (7'2" / 86 inches) defending Moratinos (6'8" / 80 inches):
● Gap = 6 inches. Threshold = 3. Active inches = 3.

● Opponent Interior FG%: × 0.97^3 = × 0.912 (−8.8%)
● Block Probability: +1.2 × 3 = +3.6pp
● Defensive Rebound Probability: +2.5 × 3 = +7.5pp
● Opponent Rim Attempt Probability: −1.5 × 3 = −4.5pp
Rosa's 6-inch height advantage over their tallest starter translates to an 8.8% reduction in their
interior FG%, a 3.6pp increase in block probability, and a 7.5pp shift in defensive rebound
probability. Per possession. Compounding over 85 possessions.
Modifier B: Team Height Aggregate Modifier (Team-Level)
What It Measures
The aggregate frontcourt height advantage across all active rotation bigs, not just the starting
matchup. This captures the TEAM-LEVEL effect of having multiple tall players — the
psychological and geometric reality that there is nowhere safe to go inside.
Activation Threshold
Activates when the average height of the top 3 rotation bigs on Team A exceeds the average
height of the top 3 rotation bigs on Team B by 2.0 inches or more.
Input
● team_a_top3_big_avg_height = average height of Team A's three tallest rotation
players
● team_b_top3_big_avg_height = average height of Team B's three tallest rotation
players
● frontcourt_height_gap = team_a_top3 - team_b_top3
Modifier Values (Applied at Team Level)
When YOUR team has the frontcourt height advantage:
Target Variable Modifier Value Max Rationale
Type Per Inch Cumulative
Opponent Interior Additive −2.0pp −10pp Opponent self-selects OUT of
Shot Attempt Rate per inch the paint because every drive
meets a taller defender

Opponent Additive +1.0pp +5pp Forced into longer, less
Midrange Attempt per inch efficient shots
Rate
Opponent 3PT Additive +1.0pp +5pp Forced to the perimeter
Attempt Rate per inch
Own Offensive Additive +1.5pp +8pp More boards = more second
Rebound Rate per inch chances
(team)
Opponent Fast Multiplicative × 0.97 × 0.85 Taller team controls defensive
Break Points per inch glass, limiting opponent
Probability transition
Own Paint Points Additive +2.0pp +10pp Taller team scores inside more
Rate per inch easily
Computation Example
Your FMU top 3 bigs: Rosa (7'2"), Kacem (7'1"), Roberts (7'0") → avg = 85.3 inches Current
FMU top 3 bigs: Asceric (6'10"), Moratinos (6'8"), Dues (6'9") → avg = 81.0 inches Frontcourt
height gap = 4.3 inches. Threshold = 2.0. Active inches = 2.3.
● Opponent Interior Attempt Rate: −2.0 × 2.3 = −4.6pp
● Opponent Midrange Rate: +1.0 × 2.3 = +2.3pp
● Opponent 3PT Rate: +1.0 × 2.3 = +2.3pp
● Own OREB Rate: +1.5 × 2.3 = +3.5pp
● Own Paint Points Rate: +2.0 × 2.3 = +4.6pp
The opponent's entire shot diet shifts AWAY from the rim (where they're inefficient against your
length) toward mid-range and 3-point shots (where NAIA-level shooters are even MORE
inefficient). Their offense degrades from both ends — they're taking worse shots AND making
them at lower rates.
Interaction with Modifier A
Modifier B operates at the team level. Modifier A operates at the position level. They target
overlapping but not identical variables:
● Modifier A adjusts interior FG% for the SPECIFIC player matchup
● Modifier B adjusts shot ATTEMPT DISTRIBUTION for the entire offense
These are complementary, not redundant. Modifier A says "when you DO shoot inside, you miss
more." Modifier B says "you try to shoot inside LESS OFTEN because the paint is terrifying."

Both apply. The composition rule: Modifier A applies to efficiency. Modifier B applies to
distribution. No double-counting on the same target variable.
Modifier C: Wave Rotation Fatigue Modifier
(Time-Dependent)
What It Measures
The cumulative fatigue differential when one team rotates significantly more bigs than the other.
Over 40 minutes, a team playing 4 fresh bigs in 10-minute shifts faces an opponent whose 1-2
bigs play 25-35 minutes. The fatigue gap widens as the game progresses.
Activation Threshold
Activates when one team's big rotation depth exceeds the other's by 2 or more players (e.g.,
Team A rotates 4 bigs, Team B rotates 2).
Input
● team_a_big_rotation_count = number of bigs getting 8+ minutes
● team_b_big_rotation_count = number of bigs getting 8+ minutes
● rotation_depth_gap = team_a_count - team_b_count
● game_period = 1st half / 3rd quarter / 4th quarter
Modifier Values (Time-Dependent, Applied to the Team with FEWER Bigs)
First Half: No modifier. Fatigue hasn't accumulated.
Third Quarter (minutes 21-30):
Target Variable Modifier Value Per Rotation Gap Max
Type Player
Fatigued team Interior FG% Multiplicative × 0.98 (−2%) per gap player ×
0.94
Fatigued team Defensive Rebound Additive −1.5pp per gap player −5pp
Rate
Fatigued team Turnover Rate Additive +0.5pp per gap player +2pp

Fresh team Interior FG% Multiplicative × 1.01 (+1%) per gap player ×
1.03
Fourth Quarter (minutes 31-40):
Target Variable Modifier Value Per Rotation Gap Max
Type Player
Fatigued team Interior FG% Multiplicative × 0.96 (−4%) per gap player ×
0.88
Fatigued team Defensive Rebound Additive −3.0pp per gap player −10p
Rate p
Fatigued team Turnover Rate Additive +1.5pp per gap player +5pp
Fatigued team Overall FG% Multiplicative × 0.98 (−2%) per gap player ×
0.94
Fatigued team 3PT% Multiplicative × 0.97 (−3%) per gap player ×
0.91
Fresh team Interior FG% Multiplicative × 1.02 (+2%) per gap player ×
1.06
Fresh team 3PT% Multiplicative × 1.01 (+1%) per gap player ×
1.03
Computation Example
Your FMU rotates 5 bigs (Rosa, Kacem, Pouncil, MacDonald, Roberts/Ellis): avg 12-15 min
each. Current FMU rotates 2 bigs (Moratinos 6'8", Dues 6'9"): avg 25-30 min each. Rotation gap
= 3 players.
Fourth Quarter modifiers applied to current FMU:
● Interior FG%: × 0.96^3 = × 0.885 (−11.5%)
● Defensive Rebound Rate: −3.0 × 3 = −9.0pp
● Turnover Rate: +1.5 × 3 = +4.5pp
● Overall FG%: × 0.98^3 = × 0.941 (−5.9%)
● 3PT%: × 0.97^3 = × 0.912 (−8.8%)
In the fourth quarter, current FMU's already overmatched bigs are now ALSO exhausted. Their
interior FG% drops an additional 11.5%. Their overall shooting drops 5.9%. They turn the ball
over 4.5pp more. Meanwhile your fresh bigs are still operating at baseline or better.

This explains why the simulated margins are LARGER than raw KR gaps suggest — the
advantage compounds over time.
Interaction with Modifiers A and B
● Modifier A (position-level height gap) applies all game at constant rate
● Modifier B (team height aggregate) applies all game at constant rate
● Modifier C (fatigue) AMPLIFIES both in the second half
These are additive on different axes:
● A and B create the BASE disadvantage (height makes them worse)
● C creates the TIME-DEPENDENT amplification (fatigue makes the height disadvantage
worse)
Composition: A and B apply first (constant). C applies on top in Q3/Q4 as a multiplicative
amplifier to the already-modified values. The exhausted 6'6" forward who was already −8.8% on
interior FG% from Modifier A is now ALSO −11.5% from fatigue = total interior FG% degradation
of ~20%.
Modifier D: Altered Shot Rate Modifier (Derived)
What It Measures
For every blocked shot, multiple additional shots are ALTERED — not blocked, but affected by
the presence of a rim protector. The shooter adjusts trajectory, rushes the release, pulls up
short, or avoids the paint entirely. These altered shots don't appear in box scores but
significantly affect shooting efficiency.
Current system counts blocks as events. It does not model the shadow effect of rim protection
— the shots that WEREN'T taken or were degraded because the rim protector existed.
Input
● defender_block_rate = projected BPG from Player Intelligence
● defender_height = height in inches
● baseline_alter_multiplier = 2.5 (empirical: for every block, approximately 2.5
additional shots are altered)
● height_bonus_multiplier = +0.3 per inch above 6'10" (taller rim protectors alter
more shots because their presence is visible earlier in the drive)
Modifier Computation

None
alter_rate = block_rate × (baseline_alter_multiplier +
height_bonus_per_inch)
For Rosa (3.5 BPG, 7'2"):
● Height above 6'10" = 4 inches
● Height bonus = 4 × 0.3 = 1.2
● Total multiplier = 2.5 + 1.2 = 3.7
● Altered shots per game = 3.5 × 3.7 = 12.95 → ~13 altered shots per game
Modifier Values (Applied to Opponent)
Target Variable Modifier Value Max
Type
Opponent Interior FG% (beyond Multiplicative × (1 − (alter_rate × × 0.88
block effect) 0.008)) (−12%)
Opponent Rim Attempt Willingness Additive −(alter_rate × 0.25)pp −5pp
For Rosa's 13 altered shots:
● Interior FG% modifier: × (1 − (13 × 0.008)) = × 0.896 (−10.4%)
● Rim Attempt Willingness: −(13 × 0.25) = −3.25pp
This means Rosa's PRESENCE (not just his blocks) reduces opponent interior FG% by an
additional 10.4% beyond what the block events themselves capture. And opponents attempt
3.25 fewer rim attempts per game because they SEE Rosa in the paint and choose not to drive.
Interaction with Modifiers A, B, C
● Modifier A captures the height DIFFERENTIAL effect on the specific matchup
● Modifier B captures the team-level shot distribution shift
● Modifier C captures the fatigue amplification over time
● Modifier D captures the SHADOW effect of rim protection beyond blocks
These are four different mechanisms:
1. A = "You miss more because he's taller than you"
2. B = "Your whole team shoots worse inside because THEY'RE ALL taller"
3. C = "It gets worse as you get tired and they stay fresh"
4. D = "You don't even TRY to go inside because the rim protector's shadow scares you"

Composition: D applies to shot WILLINGNESS (reducing rim attempts) and to shot QUALITY
(reducing FG% on the shots they do take). A applies to the specific matchup FG%. B applies to
team-level distribution. C amplifies all three over time.
The full chain for a fourth-quarter possession where a 6'6" forward drives against Rosa:
1. Modifier B already shifted his team's shot diet AWAY from the rim (−4.6pp rim attempts)
2. Modifier D further reduces his WILLINGNESS to drive (−3.25pp additional)
3. If he DOES drive: Modifier A reduces his FG% by −8.8%
4. Modifier D further reduces his FG% by −10.4% (altered shot quality)
5. Modifier C amplifies the defensive rebound probability by −9.0pp (his team doesn't get
the board if he misses)
6. Total interior FG% degradation: base × 0.912 × 0.896 × 0.885 = × 0.723 (−27.7%)
If baseline interior FG% was 55%, the modified FG% is 39.8% — and that's BEFORE the block
itself.
Integration with Existing Modifier Framework
Position in Composition Order (Updated)
1. System × System modifiers (Class 1 — from Interaction Library Part 1)
2. Offensive Archetype × Defensive System modifiers (Class 2 — from Interaction Library
Part 2)
3. Defensive Archetype × Offensive System modifiers (Class 3 — from Interaction Library
Part 3)
4. Physical Mismatch Modifiers (Class 4 — from this document)
○ A: Height Differential (position-level)
○ B: Team Height Aggregate (team-level)
○ C: Wave Rotation Fatigue (time-dependent)
○ D: Altered Shot Rate (derived from rim protection)
5. Matchup-approved residuals (only if governance permits; no double-count)
Precedence Rules
● Classes 1-3 retain full authority. Physical Mismatch Modifiers may NOT override or
negate Class 1-3 effects.
● Physical Mismatch Modifiers apply RESIDUAL pressure only — the physical effects not
already captured by identity-clash modifiers.
● If a Class 1-3 modifier already explains a variable (e.g., Coach K Defense already shifts
rim FG% via Class 3), Modifier A applies only the portion of the height differential effect
NOT already captured.

● No direction flips: if Classes 1-3 say interior FG% goes down, Modifiers A-D cannot
make it go up.
Global Bounds Compliance
All Physical Mismatch Modifiers obey existing global bounds:
● Shot-Type Distribution: Max total shift ±10pp (across ALL classes including Class 4)
● Efficiency: Max total shift ±18% (across ALL classes including Class 4)
● Turnover & Foul: Max combined shift ±22%
If Classes 1-3 have already consumed 12% of the 18% efficiency cap, Class 4 modifiers may
only contribute up to the remaining 6%.
Output Format
Physical Mismatch Modifiers produce entries in the same modifier_bundle format as Classes
1-3:
None
{
"class": 4,
"subclass": "A|B|C|D",
"target_variable": "[valid target]",
"modifier_type": "additive|multiplicative",
"value": [bounded value],
"source": "Physical_Mismatch_Modifiers_v1",
"activation_inputs": {
"height_gap": [inches],
"rotation_gap": [players],
"game_period": "[half|Q3|Q4]",
"block_rate": [BPG]
}
}
Interaction Trace Requirement
Per the Simulation Engine Master Contract, every simulation must output an applied interaction
trace. Physical Mismatch Modifiers add to this trace:
● Which sub-modifiers (A, B, C, D) activated

● What height/rotation gaps triggered activation
● What bounded values were applied
● How much of the global cap was consumed by Class 4
Data Requirements
Modifier Required Data Source Availability
A Player heights (both teams) Roster data Always
available
B Top 3 big heights (both Roster data Always
teams) available
C Rotation depth (bigs getting Rotation participation % from Team Always
8+ min) KR available
D Block rate per player Player Intelligence (DKR rim Always
protection traits) available
All inputs are available at V1 (stats-only) data tier. Physical Mismatch Modifiers do not require
play-by-play, tracking data, or film.
Confidence Note
Physical Mismatch Modifiers operate at reduced confidence compared to Classes 1-3
because:
● The multiplier values (e.g., −3% interior FG% per inch) are derived from empirical
estimation, not from a verified Interaction Library
● The altered shot rate baseline multiplier (2.5) is an approximation pending PlayVision
validation
● The fatigue curve (no effect in 1H, escalating in Q3/Q4) is a model assumption
When PlayVision (V2/V3) data becomes available, these multipliers should be calibrated against
actual tracking data: measured contest rates at different height differentials, actual shot
alteration rates near rim protectors, and fourth-quarter efficiency degradation curves.
Until calibration: apply Physical Mismatch Modifiers at 70% of stated values as a conservative
estimate. The direction is correct. The magnitude requires validation.