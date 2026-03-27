/**
 * Interaction Library
 * Single authoritative lookup table for all identity-clash interactions.
 * Source: intelligence/04_Simulation_Engine.md
 *
 * Three tables:
 *   Part 1: System × System (12 off × 10 def = 120 entries)
 *   Part 2: Offensive Archetype × Defensive System (21 × 10 = 210 entries)
 *   Part 3: Defensive Archetype × Offensive System (21 × 12 = 252 entries)
 *
 * Governance:
 *   - Archetype names MUST match locked Archetype Library (21 archetypes)
 *   - System names MUST match locked System Sets (12 off, 10 def)
 *   - All deltas are relative to neutral baseline (no defensive modifier)
 *   - Deterministic: same identity inputs → same deltas returned
 */

// ── Types ──

export interface SystemSystemEntry {
  offenseSystem: string;
  defenseSystem: string;
  /** Pace delta in % (e.g. -2 = -2%) */
  paceImpact: number;
  /** Turnover pressure delta in pp */
  towardsPressure: number;
  /** Foul rate delta in pp */
  foulRateDelta: number;
  explanation: string;
}

export interface ArchetypeDefSystemEntry {
  archetype: string;
  defSystem: string;
  /** 3-point attempt share delta pp */
  d3pa: number;
  /** Rim attempt share delta pp */
  drim: number;
  /** Midrange attempt share delta pp */
  dmid: number;
  /** Shot efficiency delta % (positive = better for offense) */
  effDelta: number;
  /** Turnover rate delta pp */
  toRateDelta: number;
  /** Foul-draw rate delta pp */
  foulDrawDelta: number;
  rationale: string;
}

export interface ArchetypeOffSystemEntry {
  archetype: string;
  offSystem: string;
  /** 3-point attempt share delta pp (from offense perspective — how much offense uses 3s vs this defender) */
  d3pa: number;
  /** Rim attempt share delta pp */
  drim: number;
  /** Midrange attempt share delta pp */
  dmid: number;
  /** Efficiency delta % (negative = defender suppresses offense) */
  effDelta: number;
  /** Turnover rate delta pp */
  toRateDelta: number;
  /** Foul rate delta pp (fouls by defender) */
  foulRateDelta: number;
  rationale: string;
}

// ── LOCKED REFERENCE SETS ──

export const OFFENSIVE_SYSTEMS = [
  'Spread Pick-and-Roll',
  '5-Out Motion',
  'Motion / Read & React',
  'Pace & Space',
  'Dribble Drive',
  'Princeton',
  'Flex',
  'Swing',
  'Post-Centric / Inside-Out',
  'Moreyball',
  'Heliocentric',
  'Coach K',
] as const;

export const DEFENSIVE_SYSTEMS = [
  'Containment Man',
  'Pack Line',
  'Pressure Man (Denial)',
  'Switch Everything',
  'ICE / No-Middle',
  'Zone (Structured)',
  'Matchup Zone / Hybrid',
  'Press / Pressure Defense',
  'Junk / Special',
  'Coach K',
] as const;

export const ARCHETYPES = [
  'Two-Way Wing',
  '3-and-D Wing',
  'POA Defender Guard',
  'Primary Ball-Handler (Offense-First)',
  'Switchable Defender Wing',
  'Anchor Big',
  'Stretch Big',
  'Connector Guard',
  'Offensive Wing Scorer',
  'Gap / Team Defender Wing',
  'Mobile Defensive Big',
  'Chaos Disruptor Wing',
  'Point Forward',
  'Utility Forward',
  'Roll Man / Vertical Threat',
  'Offensive Big (Defense Liability)',
  'Situational Shooter (Specialist)',
  'Defensive Specialist (Non-Scoring)',
  'Energy Big',
  'Situational Ball-Handler (Bench Guard)',
  'Developmental Prospect',
] as const;

// ── PART 1: SYSTEM × SYSTEM TABLE ──
// Format: [paceImpact%, toPressurePP, foulRatePP, explanation]

const SYS_DATA: Record<string, Record<string, [number, number, number, string]>> = {
  'Spread Pick-and-Roll': {
    'Containment Man':        [ 0, 0, 1, 'Standard PnR reads intact; defense concedes controlled advantages.'],
    'Pack Line':              [-2, 0,-1, 'Paint congestion suppresses rim; offense shifts to kick-out shooting.'],
    'Pressure Man (Denial)':  [ 2, 3, 2, 'Ball pressure disrupts entry but increases foul risk once screen is used.'],
    'Switch Everything':      [-1, 1, 1, 'Switches flatten roll advantages; redirects toward matchup hunting.'],
    'ICE / No-Middle':        [-2, 1, 0, 'Sideline forcing suppresses middle penetration; short-roll increases.'],
    'Zone (Structured)':      [-3,-1,-2, 'Zone absorbs drives; encourages perimeter creation; lowers fouls.'],
    'Matchup Zone / Hybrid':  [-2, 2,-1, 'Hybrid disrupts timing; increases indecision without fully conceding.'],
    'Press / Pressure Defense':[ 4, 4, 1, 'Pressure increases game speed; creates early advantages and mistakes.'],
    'Junk / Special':         [-4, 5, 0, 'Non-standard alignments break continuity; force improvisation.'],
    'Coach K':                [ 1, 3, 2, 'No-threes math forces handlers off line; PnR reads exist but shooters run off.'],
  },
  '5-Out Motion': {
    'Containment Man':        [ 0, 0, 1, 'Spacing stretches containment; offense flows into balanced rim-and-kick.'],
    'Pack Line':              [-3,-1,-2, 'Heavy paint help neutralizes cuts and drives; pushes heavy 3s.'],
    'Pressure Man (Denial)':  [ 2, 3, 2, 'Denial creates backdoor opportunities but raises ball security risk.'],
    'Switch Everything':      [-2, 1, 1, 'Switching disrupts motion continuity; shifts toward individual creation.'],
    'ICE / No-Middle':        [-2, 1, 0, 'No-middle redirects penetration toward baseline spacing actions.'],
    'Zone (Structured)':      [-4,-2,-3, 'Zone absorbs motion actions; forces perimeter movement; lowers fouls.'],
    'Matchup Zone / Hybrid':  [-3, 2,-1, 'Hybrid coverages break rhythm and timing without fully conceding.'],
    'Press / Pressure Defense':[ 4, 4, 1, 'Pressure accelerates tempo; creates early advantages alongside mistakes.'],
    'Junk / Special':         [-5, 5, 0, 'Irregular alignments disrupt spacing reads and continuity.'],
    'Coach K':                [ 0, 2, 1, 'Denial disrupts spacing entries; 5-Out perimeter diet attacked by no-threes.'],
  },
  'Motion / Read & React': {
    'Containment Man':        [ 0, 0, 1, 'Containment allows reads to unfold; produces steady assisted looks.'],
    'Pack Line':              [-4,-1,-2, 'Paint congestion neutralizes cutting lanes; pushes offense to perimeter.'],
    'Pressure Man (Denial)':  [ 2, 3, 2, 'Denial creates read-based counters but increases reversal risk.'],
    'Switch Everything':      [-3, 1, 1, 'Switching breaks continuity; converts offense to matchup-based creation.'],
    'ICE / No-Middle':        [-3, 1, 0, 'Forced sideline flow reduces central reads; shifts toward baseline counters.'],
    'Zone (Structured)':      [-5,-2,-3, 'Zone absorbs read-based actions; slows offense into perimeter probing.'],
    'Matchup Zone / Hybrid':  [-4, 2,-1, 'Hybrid defenses disrupt timing and continuity reads.'],
    'Press / Pressure Defense':[ 3, 4, 1, 'Pressure speeds game; compresses read time; increases volatility.'],
    'Junk / Special':         [-5, 5, 0, 'Irregular alignments destroy read structure; force improvisation.'],
    'Coach K':                [ 0, 2, 1, 'Motion reads punish overplay with backdoors; denial still suppresses 3s.'],
  },
  'Pace & Space': {
    'Containment Man':        [ 3, 0, 1, 'Containment concedes early advantages; spacing maximizes rim-and-3.'],
    'Pack Line':              [ 1, 1,-2, 'Paint crowding suppresses rim; pushes further toward volume 3s.'],
    'Pressure Man (Denial)':  [ 4, 4, 2, 'Denial increases volatility; forcing faster decisions and higher TO risk.'],
    'Switch Everything':      [-1, 2, 1, 'Switching neutralizes spacing advantages; shifts toward individual shot-making.'],
    'ICE / No-Middle':        [-2, 1, 0, 'Sideline forcing limits central drive-kick; redirects to baseline spacing.'],
    'Zone (Structured)':      [-3,-1,-3, 'Zone compresses paint and slows tempo; increases 3-point volume reliance.'],
    'Matchup Zone / Hybrid':  [-2, 2,-1, 'Hybrid disrupts early flow; forces more late-clock perimeter creation.'],
    'Press / Pressure Defense':[ 6, 5, 1, 'Pressure accelerates Pace & Space to extreme; high tempo and volatility.'],
    'Junk / Special':         [-4, 5, 0, 'Irregular defenses disrupt early flow and spacing discipline.'],
    'Coach K':                [ 2, 4, 2, 'Coach K pressure increases TOs; no-threes suppresses perimeter diet.'],
  },
  'Dribble Drive': {
    'Containment Man':        [ 0, 0, 2, 'Containment allows penetration angles; consistent rim pressure and kick-outs.'],
    'Pack Line':              [-4, 1,-2, 'Heavy paint suppresses rim finishes; forces extreme kick-out reliance.'],
    'Pressure Man (Denial)':  [ 2, 4, 3, 'Pressure disrupts initiation; increases foul exposure once penetration achieved.'],
    'Switch Everything':      [-2, 2, 1, 'Switching eliminates help advantages; turns offense into individual attacks.'],
    'ICE / No-Middle':        [-3, 1, 0, 'No-middle redirects penetration toward baseline; reduces primary advantage.'],
    'Zone (Structured)':      [-5,-1,-3, 'Zone walls off drives; forces perimeter probing; lowers foul pressure.'],
    'Matchup Zone / Hybrid':  [-4, 2,-1, 'Hybrid coverages disrupt driving lanes and timing.'],
    'Press / Pressure Defense':[ 4, 5, 1, 'Pressure accelerates tempo; increasing both rim chances and ball-security risk.'],
    'Junk / Special':         [-5, 5, 0, 'Non-standard alignments collapse driving reads; force improvisational scoring.'],
    'Coach K':                [ 1, 3, 1, 'Denial disrupts initiation; rim protector funneling works against downhill intent.'],
  },
  'Princeton': {
    'Containment Man':        [-4, 0, 1, 'Containment allows patience; reads and backdoor timing operate cleanly.'],
    'Pack Line':              [-6, 1,-2, 'Paint congestion removes cutting lanes; forces Princeton into secondary options.'],
    'Pressure Man (Denial)':  [-2, 3, 2, 'Denial increases risk but enhances backdoor counters if reads are clean.'],
    'Switch Everything':      [-3, 1, 1, 'Switching disrupts continuity; converts offense to matchup-based execution.'],
    'ICE / No-Middle':        [-4, 1, 0, 'No-middle redirects actions toward baseline counters; partially aligns with structure.'],
    'Zone (Structured)':      [-7,-1,-3, 'Zone absorbs backdoor actions; forces Princeton to operate from high post.'],
    'Matchup Zone / Hybrid':  [-6, 2,-1, 'Hybrid defenses disrupt read timing and continuity patterns.'],
    'Press / Pressure Defense':[ 2, 4, 1, 'Pressure speeds game slightly; increases TO risk for precision-based offense.'],
    'Junk / Special':         [-6, 5, 0, 'Irregular defenses break the read hierarchy; force improvisation.'],
    'Coach K':                [-2, 2, 1, 'Princeton punishes denial with backdoor cuts; no-threes suppresses perimeter.'],
  },
  'Flex': {
    'Containment Man':        [-3, 0, 1, 'Containment allows Flex continuity to operate; generates baseline cuts.'],
    'Pack Line':              [-5, 1,-2, 'Packed paint removes baseline cut leverage; forces secondary midrange.'],
    'Pressure Man (Denial)':  [-1, 3, 2, 'Denial stresses timing but opens counter cuts if spacing discipline holds.'],
    'Switch Everything':      [-3, 1, 1, 'Switching breaks screening advantage; redirects toward matchup exploitation.'],
    'ICE / No-Middle':        [-4, 1, 0, 'No-middle funnels ball into baseline-oriented counters.'],
    'Zone (Structured)':      [-6,-1,-3, 'Zone absorbs baseline screening actions; slows continuity.'],
    'Matchup Zone / Hybrid':  [-5, 2,-1, 'Hybrid defenses disrupt pattern timing and recognition.'],
    'Press / Pressure Defense':[ 2, 4, 1, 'Pressure speeds entry into sets; increases ball-security stress.'],
    'Junk / Special':         [-6, 5, 0, 'Non-standard alignments break pattern recognition; force improvisation.'],
    'Coach K':                [-1, 2, 1, 'Flex screening disrupted by denial; no-threes forces midrange.'],
  },
  'Swing': {
    'Containment Man':        [-1, 0, 1, 'Containment allows ball reversal; rhythm perimeter looks and controlled drives.'],
    'Pack Line':              [-4, 1,-2, 'Paint help suppresses drive lanes; increases reliance on perimeter reversal.'],
    'Pressure Man (Denial)':  [ 1, 3, 2, 'Denial stresses reversals but creates backdoor counters when overplayed.'],
    'Switch Everything':      [-3, 2, 1, 'Switching negates screening advantages; shifts toward individual creation.'],
    'ICE / No-Middle':        [-3, 1, 0, 'Sideline forcing aligns with Swing spacing but limits middle penetration.'],
    'Zone (Structured)':      [-5,-1,-3, 'Zone slows reversals and compresses paint; pushing volume perimeter shooting.'],
    'Matchup Zone / Hybrid':  [-4, 2,-1, 'Hybrid coverages disrupt reversal timing and continuity.'],
    'Press / Pressure Defense':[ 3, 4, 1, 'Pressure accelerates tempo; increases volatility in ball movement.'],
    'Junk / Special':         [-5, 5, 0, 'Irregular alignments disrupt reversal patterns and spacing discipline.'],
    'Coach K':                [ 0, 3, 1, 'Swing reversal directly attacked by denial; passing lane pressure increases TOs.'],
  },
  'Post-Centric / Inside-Out': {
    'Containment Man':        [-2, 0, 3, 'Containment allows clean post feeds; controlled double timing increases fouls.'],
    'Pack Line':              [-5, 2,-1, 'Paint crowding suppresses post finishes; forces perimeter conversion.'],
    'Pressure Man (Denial)':  [-1, 4, 2, 'Denial stresses entry passes; increases foul risk once ball enters post.'],
    'Switch Everything':      [-3, 2, 1, 'Switching creates post mismatches while reducing off-ball advantage.'],
    'ICE / No-Middle':        [-3, 1, 0, 'No-middle redirects post attacks to baseline counters.'],
    'Zone (Structured)':      [-6,-1,-3, 'Zone absorbs post gravity; forces inside-out from high post.'],
    'Matchup Zone / Hybrid':  [-5, 2,-1, 'Hybrid coverages delay post reads and increase indecision.'],
    'Press / Pressure Defense':[ 2, 4, 1, 'Pressure speeds entry; increases ball-security stress before post establishment.'],
    'Junk / Special':         [-6, 5, 0, 'Non-standard alignments distort post spacing and passing lanes.'],
    'Coach K':                [-1, 2, 1, 'Rim protector limits post finishes; inside-out can work high post.'],
  },
  'Moreyball': {
    'Containment Man':        [ 1, 0, 3, 'Conservative containment concedes drives and pull-up 3s; aligns with priorities.'],
    'Pack Line':              [-3, 1,-2, 'Paint loading suppresses rim; forces volume perimeter shooting.'],
    'Pressure Man (Denial)':  [ 2, 4, 2, 'Denial increases volatility; higher foul draw but elevated TO risk.'],
    'Switch Everything':      [ 0, 2, 1, 'Switching invites iso hunting and mismatch exploitation without midrange.'],
    'ICE / No-Middle':        [-2, 1, 0, 'No-middle forces sideline drives and corner kick-outs; acceptable for Moreyball.'],
    'Zone (Structured)':      [-5,-1,-3, 'Zone reduces foul pressure and rim access; pushing heavy 3-point dependency.'],
    'Matchup Zone / Hybrid':  [-4, 2,-1, 'Hybrid rotations delay reads and reduce clean rim attacks.'],
    'Press / Pressure Defense':[ 4, 5, 1, 'Pressure accelerates possessions; increasing both rim chances and TO variance.'],
    'Junk / Special':         [-6, 5,-1, 'Non-standard coverages disrupt drive lanes and spacing geometry.'],
    'Coach K':                [ 1, 3, 2, 'Coach K defense specifically designed to break Moreyball; no-threes attacks 3-point volume.'],
  },
  'Heliocentric': {
    'Containment Man':        [ 0, 0, 2, 'Containment respects the anchor; gets his looks at regulated advantage levels.'],
    'Pack Line':              [-3, 1,-1, 'Paint congestion limits anchor downhill; must rely on midrange and passing.'],
    'Pressure Man (Denial)':  [ 2, 4, 2, 'Pressure on anchor creates highest TO environment; if anchor holds, efficiency holds.'],
    'Switch Everything':      [ 0, 1, 1, 'Switching gives anchor isolation against weakest defender — exactly what he wants.'],
    'ICE / No-Middle':        [-2, 1, 0, 'ICE redirects anchor sideline; effective if anchor is middle-dependent.'],
    'Zone (Structured)':      [-4,-1,-2, 'Zone turns anchor into facilitator; if anchor can pass, adjusts; if not, stalls.'],
    'Matchup Zone / Hybrid':  [-3, 2, 0, 'Hybrid face-guards anchor while zoning others; anchor must score through attention.'],
    'Press / Pressure Defense':[ 4, 5, 2, 'Maximum pressure on single point of failure; easy scores or catastrophic TOs.'],
    'Junk / Special':         [-5, 4, 0, 'Junk (box-and-one) specifically designed to neutralize anchor; secondary players must produce.'],
    'Coach K':                [ 0, 3, 1, 'Multiple POA defenders take turns on anchor; denial suppresses clean looks.'],
  },
  'Coach K': {
    'Containment Man':        [ 3, 1, 2, 'Containment cannot handle Coach K pace; transition scoring exploits conservative help.'],
    'Pack Line':              [-1, 1,-2, 'Pack Line suppresses rim but Coach K spacing creates volume perimeter looks.'],
    'Pressure Man (Denial)':  [ 4, 4, 3, 'Two aggressive systems collide; highest volatility — TOs spike but transition scores and fouls too.'],
    'Switch Everything':      [ 1, 2, 2, 'Switching neutralizes some motion but multiple handlers exploit mismatches.'],
    'ICE / No-Middle':        [ 1, 1, 0, 'ICE redirects sideline but Coach K corner 3 emphasis absorbs it.'],
    'Zone (Structured)':      [-2, 0,-3, 'Zone slows preferred tempo and suppresses rim; but motion foundation keeps volume 3s high.'],
    'Matchup Zone / Hybrid':  [-1, 2,-1, 'Hybrid disrupts motion timing; pace absorbs some disruption but increases TO risk.'],
    'Press / Pressure Defense':[ 6, 5, 2, 'Two up-tempo systems at maximum; Coach K WANTS this pace; highest-scoring and TO environment.'],
    'Junk / Special':         [-3, 4, 0, 'Junk disrupts flow offenses; Coach K motion/read-react vulnerable to junk alignment breaks.'],
    'Coach K':                [ 4, 4, 2, 'Mirror match; two high-pressure high-pace systems; decided by depth and ball security.'],
  },
};

// ── PART 2: OFFENSIVE ARCHETYPE × DEFENSIVE SYSTEM TABLE ──
// Format: [d3pa, drim, dmid, effDelta%, toRateDelta, foulDrawDelta, rationale]

const ARCH_DEF_DATA: Record<string, Record<string, [number, number, number, number, number, number, string]>> = {
  'Two-Way Wing': {
    'Containment Man':        [ 1, 1, 0, 0, 0, 0, 'Clean catch-and-shoot and cutting lanes stay open; containment doesn\'t pressure off-ball.'],
    'Pack Line':              [ 2,-2, 1, 0, 0,-1, 'Pack Line congests cutting lanes; pushed to perimeter where shooting holds.'],
    'Pressure Man (Denial)':  [-2, 1, 0,-1, 1, 1, 'Denial disrupts catch-and-shoot; opens backdoor cuts; TO risk rises.'],
    'Switch Everything':      [ 0, 1, 1, 1, 0, 0, 'Not a primary screener; minor mismatch gains from switching.'],
    'ICE / No-Middle':        [ 1, 1,-2, 0, 0, 0, 'ICE redirects ball handlers; opens kickout lanes to the wing.'],
    'Zone (Structured)':      [ 2,-2, 1, 1,-1,-1, 'Zone gives spot-up shooters clean looks; cutting lanes disappear.'],
    'Matchup Zone / Hybrid':  [ 1, 0, 1, 0, 1, 0, 'Hybrid partially tracks; coverage confusion creates occasional open looks.'],
    'Press / Pressure Defense':[ 1, 1, 0, 1, 1, 0, 'Reliable outlet in press-break; gets early transition looks.'],
    'Junk / Special':         [ 0, 0, 1,-1, 1, 0, 'Junk rarely targets Two-Way Wings; minor disruption to rhythm.'],
    'Coach K':                [-2, 1, 1,-1.5, 1, 0, 'Denial suppresses catch-and-shoot; backdoor instinct provides counter.'],
  },
  '3-and-D Wing': {
    'Containment Man':        [ 2, 1, 0, 1, 0, 0.5, 'Help stays in drop; kick-outs and drift cuts available; clean C&S rhythm.'],
    'Pack Line':              [ 3,-1, 0, 0.5, 0, 0, 'Paint loading prioritizes perimeter closeouts; more open threes.'],
    'Pressure Man (Denial)':  [-3, 1,-1,-2, 1, 0, 'Denial is the hardest counter; prevents clean catches; lacks self-creation.'],
    'Switch Everything':      [ 1, 0, 0, 0.5, 0, 0, 'Switching doesn\'t heavily pressure 3-and-D; minor open looks.'],
    'ICE / No-Middle':        [ 2, 0,-1, 0.5, 0, 0, 'ICE redirects ball handlers; opens skip passes to wing spot-up.'],
    'Zone (Structured)':      [ 3,-1, 0, 1,-1,-1, 'Zone gives spot-up shooters clean looks from 3; cutting decreases.'],
    'Matchup Zone / Hybrid':  [ 1, 0, 1, 0, 1, 0, 'Hybrid occasionally loses track; open looks in confusion.'],
    'Press / Pressure Defense':[ 2, 1, 0, 0.5, 0.5, 0, 'Reliable outlet in transition; gets early open 3s.'],
    'Junk / Special':         [ 0, 0, 0,-1, 1,-0.5, 'Junk rarely targets role players; minor disruption.'],
    'Coach K':                [-3, 0, 1,-2, 1, 0, 'Denial specifically targets shooters; limited self-creation options.'],
  },
  'POA Defender Guard': {
    'Containment Man':        [ 0, 1, 1, 0.5, 0, 0.5, 'Open driving lanes for guard; spot-up and drive-and-kick options.'],
    'Pack Line':              [ 2,-3, 1, 0, 0,-1, 'Pack Line removes driving lanes; forced to kick to shooters.'],
    'Pressure Man (Denial)':  [-1, 1, 1,-1, 2, 1, 'Denial disrupts initiation; guard must beat pressure to create.'],
    'Switch Everything':      [ 0, 1, 1, 0.5, 1, 0, 'Switching redirects; guard hunts favorable matchup.'],
    'ICE / No-Middle':        [-1, 1, 2,-0.5, 1, 0, 'ICE forces sideline; less penetration but floater/midrange leaks.'],
    'Zone (Structured)':      [ 2,-3, 1,-0.5,-1,-2, 'Zone removes dribble-penetration; guard becomes distributor.'],
    'Matchup Zone / Hybrid':  [ 1,-1, 2, 0, 1,-0.5, 'Hybrid disrupts timing; guard must probe to find gaps.'],
    'Press / Pressure Defense':[ 0, 2, 0, 1, 2, 1, 'Pressure gives guard attacking angles in transition.'],
    'Junk / Special':         [ 0, 0, 1,-1, 2, 0, 'Junk disrupts guard reads; creates confusion.'],
    'Coach K':                [-2, 0, 2,-1.5, 2, 1, 'Denial specifically targets guards; limited off creation.'],
  },
  'Primary Ball-Handler (Offense-First)': {
    'Containment Man':        [ 1, 2, 1, 1, 0, 1, 'Containment concedes pull-up and rim access; primary creators thrive.'],
    'Pack Line':              [ 3,-4, 2,-0.5, 0,-1, 'Pack Line suppresses rim; ball-handler must shoot over or dish.'],
    'Pressure Man (Denial)':  [-1, 2, 2,-1, 3, 2, 'Pressure is the hardest counter; elite handlers absorb it, others collapse.'],
    'Switch Everything':      [ 0, 2, 2, 1, 1, 1, 'Switching gives ball-handler matchup to exploit; downhill attacks.'],
    'ICE / No-Middle':        [-1, 1, 3,-0.5, 1, 0, 'ICE forces sideline; ball-handler must attack from angles.'],
    'Zone (Structured)':      [ 3,-4, 2,-1,-1,-2, 'Zone converts ball-handler into distributor rather than scorer.'],
    'Matchup Zone / Hybrid':  [ 1,-1, 2, 0, 2,-0.5, 'Hybrid disrupts primary reads; ball-handler must improvise.'],
    'Press / Pressure Defense':[ 1, 3, 0, 1, 3, 1, 'Pressure creates chaos that elite handlers exploit for transition.'],
    'Junk / Special':         [-1, 0, 2,-1.5, 3, 0, 'Junk specifically targets ball-handlers; creates confusion.'],
    'Coach K':                [-2, 1, 3,-1.5, 3, 2, 'Multiple defenders take turns on primary handler; denial disrupts.'],
  },
  'Switchable Defender Wing': {
    'Containment Man':        [ 1, 1, 1, 0.5, 0, 0.5, 'Containment allows reads; wing exploits spacing.'],
    'Pack Line':              [ 2,-2, 1, 0, 0,-1, 'Pack Line congests driving lanes; shifts to perimeter.'],
    'Pressure Man (Denial)':  [-1, 1, 1,-1, 1, 1, 'Denial disrupts catch game; wing must work to get open.'],
    'Switch Everything':      [ 0, 1, 1, 0.5, 1, 0, 'Switching not particularly threatening; reads stay.'],
    'ICE / No-Middle':        [ 1, 1,-1, 0, 0, 0, 'ICE redirects ball; wing benefits from spacing.'],
    'Zone (Structured)':      [ 2,-2, 1, 0.5,-1,-1, 'Zone opens spot-up looks; cutting reduced.'],
    'Matchup Zone / Hybrid':  [ 1, 0, 1, 0, 1, 0, 'Hybrid partially tracks wing; reads disrupted.'],
    'Press / Pressure Defense':[ 1, 1, 0, 0.5, 1, 0, 'Transition looks for versatile wing.'],
    'Junk / Special':         [ 0, 0, 1,-1, 1, 0, 'Junk creates minor disruption to wing rhythm.'],
    'Coach K':                [-2, 0, 2,-1, 1, 0, 'Denial takes away clean catches; wing must cut.'],
  },
  'Anchor Big': {
    'Containment Man':        [-1, 3, 0, 1, 0, 2, 'Containment allows controlled post game; big gets foul-drawing position.'],
    'Pack Line':              [-2,-4, 1,-1, 1,-1, 'Pack Line double-teams post entry; big can\'t finish over help.'],
    'Pressure Man (Denial)':  [-1, 1, 1,-0.5, 2, 2, 'Denial stresses entry but once ball enters post, foul risk rises.'],
    'Switch Everything':      [-1, 2, 2, 1, 1, 1, 'Switching creates mismatch opportunities for dominant big.'],
    'ICE / No-Middle':        [-1,-2, 2,-0.5, 0, 0, 'ICE funnels ball sideline; big\'s rim access limited.'],
    'Zone (Structured)':      [-1,-3, 2,-1,-1,-2, 'Zone turns anchor into high-post facilitator.'],
    'Matchup Zone / Hybrid':  [-1,-1, 2, 0, 1,-0.5, 'Hybrid delays post reads; big must be patient.'],
    'Press / Pressure Defense':[-1, 2, 0, 0.5, 1, 1, 'Big benefits from early offense in transition.'],
    'Junk / Special':         [-2,-2, 1,-1.5, 2, 0, 'Junk specifically double-teams dominant bigs.'],
    'Coach K':                [-1,-2, 2,-1, 1, 1, 'Rim protector contests big\'s finishing; forced to midrange.'],
  },
  'Stretch Big': {
    'Containment Man':        [ 2, 1, 0, 1, 0, 0, 'Containment allows shooting big to find rhythm from 3.'],
    'Pack Line':              [ 3,-2, 0, 0.5, 0,-0.5, 'Pack Line invites stretch big to shoot from outside.'],
    'Pressure Man (Denial)':  [-2, 1, 1,-1.5, 1, 0, 'Denial disrupts catch-and-shoot game for stretch big.'],
    'Switch Everything':      [ 1, 1, 0, 0.5, 0, 0, 'Switching creates mismatch opportunities; big can post small.'],
    'ICE / No-Middle':        [ 2,-1, 0, 0.5, 0, 0, 'ICE opens corner 3s for stretch big.'],
    'Zone (Structured)':      [ 2,-2, 1, 1,-1,-1, 'Zone opens gap shooting for stretch big.'],
    'Matchup Zone / Hybrid':  [ 1,-1, 1, 0, 1, 0, 'Hybrid partially covers stretch big; gaps exist.'],
    'Press / Pressure Defense':[ 1, 1, 0, 0.5, 0.5, 0, 'Stretch big as reliable target in press-break.'],
    'Junk / Special':         [ 0, 0, 1,-1, 1, 0, 'Junk creates mild disruption for shooting big.'],
    'Coach K':                [-2, 0, 2,-2, 1, 0, 'Denial specifically attacks stretch big\'s 3-point game.'],
  },
  'Connector Guard': {
    'Containment Man':        [ 0, 1, 1, 0.5, 0, 0.5, 'Containment gives connector clean passing lanes and driving angles.'],
    'Pack Line':              [ 2,-3, 1, 0, 0,-0.5, 'Pack Line clogs driving lanes; connector must distribute.'],
    'Pressure Man (Denial)':  [-1, 1, 1,-1, 2, 1, 'Denial stresses connector\'s passing timing.'],
    'Switch Everything':      [ 0, 1, 1, 0.5, 1, 0, 'Connector hunts favorable matchups in switching defense.'],
    'ICE / No-Middle':        [-1, 1, 2, 0, 1, 0, 'ICE forces sideline; connector probes midrange.'],
    'Zone (Structured)':      [ 2,-3, 1,-0.5,-1,-1.5, 'Zone converts connector to skip-pass facilitator.'],
    'Matchup Zone / Hybrid':  [ 1,-1, 2, 0, 1,-0.5, 'Hybrid disrupts connector timing; must probe.'],
    'Press / Pressure Defense':[ 0, 2, 0, 0.5, 2, 0.5, 'Connector as primary press-break handler.'],
    'Junk / Special':         [ 0, 0, 1,-1, 2, 0, 'Junk disrupts connector reads.'],
    'Coach K':                [-2, 0, 2,-1, 2, 1, 'Denial attacks connector passing lanes.'],
  },
  'Offensive Wing Scorer': {
    'Containment Man':        [ 1, 2, 1, 1, 0, 1, 'Containment concedes wing scorer\'s natural game.'],
    'Pack Line':              [ 2,-3, 1,-0.5, 0,-0.5, 'Pack Line suppresses wing drives; scorer must reposition.'],
    'Pressure Man (Denial)':  [-2, 1, 1,-1.5, 1, 1, 'Denial disrupts wing scorer\'s catch-and-create rhythm.'],
    'Switch Everything':      [ 0, 2, 1, 1, 1, 1, 'Switching creates favorable matchups for elite scorers.'],
    'ICE / No-Middle':        [ 1, 1,-1, 0, 0, 0.5, 'ICE opens corner attacks for wing scorer.'],
    'Zone (Structured)':      [ 2,-3, 1,-1,-1,-1.5, 'Zone disperses wing scorer away from strong zones.'],
    'Matchup Zone / Hybrid':  [ 1,-1, 2, 0, 1,-0.5, 'Hybrid forces wing to create from unfamiliar spots.'],
    'Press / Pressure Defense':[ 1, 2, 0, 1, 1, 1, 'Wing scorer thrives in transition chaos.'],
    'Junk / Special':         [-1, 0, 2,-1.5, 2, 0, 'Junk specifically clamps wing scorer.'],
    'Coach K':                [-2, 1, 2,-1.5, 2, 1, 'Denial specifically targets wing scorers.'],
  },
  'Gap / Team Defender Wing': {
    'Containment Man':        [ 0, 0, 1, 0, 0, 0, 'Low-usage role player; containment has minimal impact.'],
    'Pack Line':              [ 1,-1, 1, 0, 0, 0, 'Pack Line slightly shifts shot mix; minimal impact.'],
    'Pressure Man (Denial)':  [-1, 0, 1,-0.5, 1, 0, 'Denial reduces clean catch opportunities.'],
    'Switch Everything':      [ 0, 0, 1, 0, 0, 0, 'Switching minimal impact on team defender.'],
    'ICE / No-Middle':        [ 1, 0,-1, 0, 0, 0, 'ICE creates corner opportunities for role player.'],
    'Zone (Structured)':      [ 1,-1, 1, 0,-1,-1, 'Zone opens spot-up opportunities.'],
    'Matchup Zone / Hybrid':  [ 0, 0, 1, 0, 1, 0, 'Hybrid minimal disruption to low-usage role.'],
    'Press / Pressure Defense':[ 0, 0, 0, 0, 0, 0, 'Low-usage player; neutral transition impact.'],
    'Junk / Special':         [ 0, 0, 1,-0.5, 1, 0, 'Junk targets primary options; role player less affected.'],
    'Coach K':                [-1, 0, 1,-0.5, 0, 0, 'Denial reduces clean catch game.'],
  },
  'Mobile Defensive Big': {
    'Containment Man':        [ 0, 2, 0, 0.5, 0, 1, 'Mobile big exploits containment near rim.'],
    'Pack Line':              [ 0,-3, 1,-1, 1,-0.5, 'Pack Line significantly limits mobile big rim access.'],
    'Pressure Man (Denial)':  [ 0, 1, 1,-0.5, 1, 1, 'Denial stresses catch but big can seal for position.'],
    'Switch Everything':      [ 0, 1, 1, 0.5, 1, 1, 'Switching creates mismatch; mobile big attacks smaller defenders.'],
    'ICE / No-Middle':        [ 0,-2, 2,-0.5, 0, 0, 'ICE limits rim access; big shifts to face-up.'],
    'Zone (Structured)':      [ 1,-3, 2,-1,-1,-2, 'Zone eliminates post game; big must operate from high post.'],
    'Matchup Zone / Hybrid':  [ 0,-1, 2, 0, 1,-0.5, 'Hybrid delays big\'s preferred reads.'],
    'Press / Pressure Defense':[ 0, 2, 0, 0.5, 0.5, 0.5, 'Mobile big rolls hard in transition.'],
    'Junk / Special':         [ 0,-1, 1,-1, 1.5, 0, 'Junk targets primary reads; big is collateral disruption.'],
    'Coach K':                [ 0,-2, 2,-1, 1, 0.5, 'Rim protector contests mobile big; forced to perimeter.'],
  },
  'Chaos Disruptor Wing': {
    'Containment Man':        [ 0, 2, 1, 1, 0, 1, 'Chaos wing exploits containment with relentless activity.'],
    'Pack Line':              [ 1,-3, 1,-0.5, 1,-1, 'Pack Line limits chaos drives; wing must reposition.'],
    'Pressure Man (Denial)':  [-1, 1, 1,-1, 2, 1, 'Denial stresses chaos wing\'s catch opportunities.'],
    'Switch Everything':      [ 0, 1, 1, 0.5, 1, 0.5, 'Chaos wing creates confusion in switching defense.'],
    'ICE / No-Middle':        [ 1, 0,-1, 0, 0, 0, 'ICE redirects; chaos wing adapts.'],
    'Zone (Structured)':      [ 1,-3, 1,-1,-1,-1.5, 'Zone disperses chaos wing away from preferred zones.'],
    'Matchup Zone / Hybrid':  [ 0,-1, 2, 0, 2,-0.5, 'Hybrid disrupts chaos wing timing.'],
    'Press / Pressure Defense':[ 0, 2, 0, 1, 1, 1, 'Chaos wing thrives in press-break chaos.'],
    'Junk / Special':         [-1, 0, 2,-1.5, 2, 0, 'Junk clamps chaos wing.'],
    'Coach K':                [-2, 0, 2,-1.5, 2, 1, 'Denial specifically clamps chaos wing.'],
  },
  'Point Forward': {
    'Containment Man':        [ 0, 2, 1, 1, 0, 1, 'Containment gives point forward clean read opportunities.'],
    'Pack Line':              [ 2,-3, 1,-0.5, 0,-0.5, 'Pack Line congests driving lanes; PF must kick to shooters.'],
    'Pressure Man (Denial)':  [-1, 1, 2,-1, 2, 1, 'Denial stresses PF\'s primary handling role.'],
    'Switch Everything':      [ 0, 2, 1, 1, 1, 1, 'Switching gives PF matchup to exploit downhill.'],
    'ICE / No-Middle':        [-1, 1, 2,-0.5, 1, 0, 'ICE forces sideline; PF uses midrange pull-up.'],
    'Zone (Structured)':      [ 2,-3, 2,-1,-1,-2, 'Zone converts PF to high-post facilitator.'],
    'Matchup Zone / Hybrid':  [ 1,-1, 2, 0, 2,-0.5, 'Hybrid disrupts PF timing reads.'],
    'Press / Pressure Defense':[ 0, 2, 0, 1, 2, 1, 'PF as reliable press-break creator.'],
    'Junk / Special':         [-1, 0, 2,-1.5, 3, 0, 'Junk specifically targets primary creators.'],
    'Coach K':                [-2, 1, 3,-1.5, 3, 2, 'Denial attacks PF who handles primary duties.'],
  },
  'Utility Forward': {
    'Containment Man':        [ 0, 1, 1, 0.5, 0, 0.5, 'Containment gives utility forward clean opportunities.'],
    'Pack Line':              [ 1,-2, 1, 0, 0,-0.5, 'Pack Line limits utility forward drives; shifts profile.'],
    'Pressure Man (Denial)':  [-1, 1, 1,-1, 1, 1, 'Denial disrupts utility forward catch rhythm.'],
    'Switch Everything':      [ 0, 1, 1, 0.5, 1, 0.5, 'Switching creates occasional favorable matchup.'],
    'ICE / No-Middle':        [ 1, 0,-1, 0, 0, 0, 'ICE creates corner opportunities for versatile forward.'],
    'Zone (Structured)':      [ 1,-2, 1, 0,-1,-1, 'Zone opens midrange and 3-point opportunities.'],
    'Matchup Zone / Hybrid':  [ 1,-1, 1, 0, 1,-0.5, 'Hybrid creates occasional confusion.'],
    'Press / Pressure Defense':[ 0, 1, 0, 0.5, 0.5, 0.5, 'Utility forward handles transition well.'],
    'Junk / Special':         [ 0, 0, 1,-0.5, 1, 0, 'Junk creates mild disruption.'],
    'Coach K':                [-1, 0, 2,-1, 1, 0, 'Denial takes away clean catch-and-shoot.'],
  },
  'Roll Man / Vertical Threat': {
    'Containment Man':        [-1, 3, 0, 1, 0, 1.5, 'Containment gives roll man clear roll lanes and lob opportunities.'],
    'Pack Line':              [-2,-5, 1,-2, 0,-1, 'Pack Line specifically eliminates roll-man rim access.'],
    'Pressure Man (Denial)':  [-1, 2, 0,-0.5, 1, 1, 'Pressure on ball creates confusion; roll man exploits when ball handler beats pressure.'],
    'Switch Everything':      [-2, 0, 1,-1.5, 1, 0, 'Switching eliminates roll advantage; roll man becomes floor spacer.'],
    'ICE / No-Middle':        [-1,-2, 2,-1, 0, 0, 'ICE specifically designed to stop roll-man rim access.'],
    'Zone (Structured)':      [-1,-4, 2,-1.5,-1,-2, 'Zone completely eliminates roll-man value; must operate from perimeter.'],
    'Matchup Zone / Hybrid':  [-1,-2, 1,-1, 1,-1, 'Hybrid neutralizes rolling; roll man must adapt.'],
    'Press / Pressure Defense':[-1, 3, 0, 1, 1, 1, 'Transition gives roll man early rim access.'],
    'Junk / Special':         [-1,-1, 1,-1, 1, 0, 'Junk creates disruption but roll man less targeted.'],
    'Coach K':                [-2,-2, 2,-1.5, 0, 0, 'Rim protector specifically positioned to contest roll-man lobs.'],
  },
  'Offensive Big (Defense Liability)': {
    'Containment Man':        [-1, 3, 0, 1, 0, 2, 'Containment gives offensive big clean post position and foul-drawing.'],
    'Pack Line':              [-2,-5, 1,-1, 1,-1, 'Pack Line eliminates post game; big forced to perimeter.'],
    'Pressure Man (Denial)':  [-1, 1, 1,-0.5, 2, 2, 'Denial stresses entry but foul risk high once ball enters post.'],
    'Switch Everything':      [-1, 3, 1, 1.5, 1, 1, 'Switching creates prime mismatch for offensive big.'],
    'ICE / No-Middle':        [-1,-2, 2,-1, 0, 0, 'ICE limits rim access; forced to face-up game.'],
    'Zone (Structured)':      [-1,-4, 2,-1.5,-1,-2, 'Zone eliminates post game; big must be high-post facilitator.'],
    'Matchup Zone / Hybrid':  [-1,-2, 2, 0, 1,-1, 'Hybrid delays post reads.'],
    'Press / Pressure Defense':[-1, 2, 0, 0.5, 1, 1, 'Offensive big benefits from early offense.'],
    'Junk / Special':         [-2,-2, 1,-2, 2, 0, 'Junk specifically double-teams offensive big.'],
    'Coach K':                [-1,-3, 2,-1.5, 1, 1, 'Rim protector contests all big finishes.'],
  },
  'Situational Shooter (Specialist)': {
    'Containment Man':        [ 2, 0, 0, 1, 0, 0, 'Containment gives specialist clean catch-and-shoot rhythm.'],
    'Pack Line':              [ 3,-1, 0, 0.5, 0, 0, 'Pack Line invites specialist to shoot from outside.'],
    'Pressure Man (Denial)':  [-3, 0, 0,-2, 1,-0.5, 'Denial is hardest counter for pure shooter; prevents clean catches.'],
    'Switch Everything':      [ 1, 0, 0, 0.5, 0, 0, 'Switching creates occasional open look in off-ball confusion.'],
    'ICE / No-Middle':        [ 2, 0,-1, 0.5, 0, 0, 'ICE opens corner looks for specialist.'],
    'Zone (Structured)':      [ 3,-1, 0, 1,-1,-1, 'Zone gives clean looks from gap areas.'],
    'Matchup Zone / Hybrid':  [ 1, 0, 1, 0, 1, 0, 'Hybrid creates occasional confusion for specialist.'],
    'Press / Pressure Defense':[ 2, 0, 0, 0.5, 0, 0, 'Transition kick-outs create open 3 looks.'],
    'Junk / Special':         [ 0, 0, 1,-1, 1, 0, 'Junk rarely targets pure shooter specifically.'],
    'Coach K':                [-3, 0, 1,-2, 1, 0, 'Denial specifically targets shooters; no escape route.'],
  },
  'Defensive Specialist (Non-Scoring)': {
    'Containment Man':        [ 0, 0, 1, 0, 0, 0, 'Low offensive role; containment has minimal impact.'],
    'Pack Line':              [ 1,-1, 1, 0, 0, 0, 'Pack Line minimal impact on non-scoring specialist.'],
    'Pressure Man (Denial)':  [-1, 0, 1,-0.5, 1, 0, 'Denial takes away limited catch opportunities.'],
    'Switch Everything':      [ 0, 0, 1, 0, 0, 0, 'Switching minimal impact on non-scoring role.'],
    'ICE / No-Middle':        [ 0, 0, 1, 0, 0, 0, 'Low-usage role; ICE has minimal impact.'],
    'Zone (Structured)':      [ 1,-1, 1, 0,-1,-1, 'Zone may create occasional gap shot.'],
    'Matchup Zone / Hybrid':  [ 0, 0, 1, 0, 1, 0, 'Low-usage; minimal impact.'],
    'Press / Pressure Defense':[ 0, 0, 0, 0, 0, 0, 'Non-scoring specialist; neutral in transition.'],
    'Junk / Special':         [ 0, 0, 1,-0.5, 1, 0, 'Junk targets primary options; specialist less affected.'],
    'Coach K':                [-1, 0, 1,-0.5, 0, 0, 'Denial reduces limited catch-and-shoot opportunities.'],
  },
  'Energy Big': {
    'Containment Man':        [ 0, 2, 0, 0.5, 0, 1, 'Containment gives energy big clean roll/cut access near rim.'],
    'Pack Line':              [ 0,-4, 1,-1, 1,-1, 'Pack Line specifically eliminates energy big rim access.'],
    'Pressure Man (Denial)':  [ 0, 1, 0,-0.5, 1, 0.5, 'Pressure stresses entry but energy big exploits transition.'],
    'Switch Everything':      [ 0, 1, 1, 0.5, 0.5, 0.5, 'Switching creates mismatch for physical big.'],
    'ICE / No-Middle':        [ 0,-2, 1,-0.5, 0, 0, 'ICE limits rim access for energy big.'],
    'Zone (Structured)':      [ 0,-3, 2,-1,-1,-1.5, 'Zone eliminates energy big\'s rim-crashing value.'],
    'Matchup Zone / Hybrid':  [ 0,-1, 1, 0, 1,-0.5, 'Hybrid neutralizes crashing; big must adjust.'],
    'Press / Pressure Defense':[ 0, 2, 0, 0.5, 0.5, 0.5, 'Energy big thrives in transition chaos.'],
    'Junk / Special':         [ 0,-1, 1,-1, 1.5, 0, 'Junk creates disruption; big less directly targeted.'],
    'Coach K':                [ 0,-2, 1,-1, 0.5, 0.5, 'Rim protector challenges energy big\'s finishing.'],
  },
  'Situational Ball-Handler (Bench Guard)': {
    'Containment Man':        [ 0, 1, 1, 0.5, 0, 0.5, 'Containment gives bench guard clean driving angles.'],
    'Pack Line':              [ 1,-2, 1, 0, 0,-0.5, 'Pack Line limits bench guard drives.'],
    'Pressure Man (Denial)':  [-1, 0, 1,-1, 2, 0.5, 'Denial stresses bench guard\'s secondary handling.'],
    'Switch Everything':      [ 0, 1, 1, 0.5, 1, 0, 'Switching creates favorable matchup hunting.'],
    'ICE / No-Middle':        [-1, 0, 2,-0.5, 1, 0, 'ICE forces bench guard sideline; probe midrange.'],
    'Zone (Structured)':      [ 1,-2, 2,-0.5,-1,-1.5, 'Zone converts bench guard to perimeter distributor.'],
    'Matchup Zone / Hybrid':  [ 0,-1, 2, 0, 1,-0.5, 'Hybrid disrupts bench guard timing.'],
    'Press / Pressure Defense':[ 0, 1, 0, 0.5, 1, 0, 'Bench guard handles press-break situation.'],
    'Junk / Special':         [ 0, 0, 1,-1, 2, 0, 'Junk creates confusion for bench guard.'],
    'Coach K':                [-1, 0, 2,-1, 2, 1, 'Denial attacks bench guard handling.'],
  },
  'Developmental Prospect': {
    'Containment Man':        [ 0, 0, 0, 0, 0, 0, 'Neutral; developmental prospect is not a primary target.'],
    'Pack Line':              [ 0,-1, 0,-0.5, 0, 0, 'Pack Line limits development plays; minimal concern.'],
    'Pressure Man (Denial)':  [-1, 0, 0,-1, 1, 0, 'Denial limits catch game for inexperienced prospect.'],
    'Switch Everything':      [ 0, 0, 0, 0, 0, 0, 'Switching neutral for low-usage prospect.'],
    'ICE / No-Middle':        [ 0, 0, 0, 0, 0, 0, 'ICE minimal impact on developmental player.'],
    'Zone (Structured)':      [ 0,-1, 0, 0,-0.5,-0.5, 'Zone neutral for developmental prospect.'],
    'Matchup Zone / Hybrid':  [ 0, 0, 0, 0, 0, 0, 'Low-usage; minimal impact.'],
    'Press / Pressure Defense':[ 0, 0, 0,-0.5, 1, 0, 'Pressure stresses inexperienced prospect.'],
    'Junk / Special':         [ 0, 0, 0,-1, 1, 0, 'Junk disrupts developmental prospect.'],
    'Coach K':                [ 0, 0, 0,-1, 1, 0, 'High-difficulty defense stresses undeveloped player.'],
  },
};

// ── PART 3: DEFENSIVE ARCHETYPE × OFFENSIVE SYSTEM TABLE ──
// Format: [d3pa, drim, dmid, effDelta%, toRateDelta, foulRateDelta, rationale]
// Negative effDelta = defender suppresses offense (good for defense)

const ARCH_OFF_DATA: Record<string, Record<string, [number, number, number, number, number, number, string]>> = {
  'Two-Way Wing': {
    'Spread Pick-and-Roll':    [-1, 0, 1,-1.5, 0.5,-0.5, 'Versatile defender contains primary handler; PnR reads disrupted.'],
    '5-Out Motion':            [ 0,-1, 1,-1.5, 0.5, 0, 'Closes out hard on shooters; cutting lanes contested.'],
    'Motion / Read & React':   [-1,-1, 1,-1.5, 0.5, 0, 'Disrupts reads; forces difficult catches.'],
    'Pace & Space':            [-1, 0, 1,-1.5, 0.5, 0, 'Contests pull-up 3s; contains transition.'],
    'Dribble Drive':           [ 0,-1, 1,-2, 0.5,-0.5, 'Lateral quickness contains drives; forces long-2s.'],
    'Princeton':               [-1,-1, 1,-1.5, 0.5, 0, 'Disrupts backdoor timing; contests cuts.'],
    'Flex':                    [-1,-1, 2,-1.5, 0.5, 0, 'Fights through screens; contests off-screen looks.'],
    'Swing':                   [-1, 0, 1,-1.5, 0.5, 0, 'Denies reversal catches; contests 3s.'],
    'Post-Centric / Inside-Out':[ 0,-2, 2,-2, 0.5, 0, 'Helps on post; contests kick-out opportunities.'],
    'Moreyball':               [-1, 0, 1,-1.5, 0.5, 0, 'Contests rim and 3; Moreyball disrupted.'],
    'Heliocentric':            [ 0,-1, 1,-2, 0.5,-0.5, 'Capable of taking anchor assignment; high-value matchup.'],
    'Coach K':                 [-1, 0, 1,-2, 0.5, 0, 'Premium two-way wing for Coach K\'s complex system.'],
  },
  '3-and-D Wing': {
    'Spread Pick-and-Roll':    [-1, 0, 1,-1, 0.5,-0.5, 'Closes out hard; limits kick-out 3s; minor PnR liability.'],
    '5-Out Motion':            [ 0,-1, 1,-1, 0.5, 0, 'Good spot-up closer; contests 5-out 3s.'],
    'Motion / Read & React':   [-1,-1, 1,-1, 0.5, 0, 'Closes to shooters; minor read disruption.'],
    'Pace & Space':            [-1, 0, 1,-1, 0.5, 0, 'Closes transition 3s; contains pace.'],
    'Dribble Drive':           [ 0, 0, 1,-0.5, 0.5, 0, 'Limited containment; better off-ball defender.'],
    'Princeton':               [-1,-1, 2,-1, 0.5, 0, 'Closes shooters; less effective on backdoor timing.'],
    'Flex':                    [-1,-1, 2,-1, 0.5, 0, 'Fights through screens; closes off-screen shooters.'],
    'Swing':                   [-1, 0, 1,-1, 0.5, 0, 'Good reversal denial; contests 3s.'],
    'Post-Centric / Inside-Out':[ 0,-1, 2,-1, 0.5, 0, 'Closes kick-outs well; limited post help.'],
    'Moreyball':               [-1, 0, 1,-1, 0.5, 0, 'Contests 3s; Moreyball disrupted on wing.'],
    'Heliocentric':            [ 0, 0, 1,-0.5, 0, 0, 'Secondary defender on anchor; limited primary impact.'],
    'Coach K':                 [-1, 0, 1,-1, 0.5, 0, '3-and-D wing valuable in Coach K system.'],
  },
  'POA Defender Guard': {
    'Spread Pick-and-Roll':    [-1, 0, 1,-2, 1,-0.5, 'Elite on-ball; disrupts PnR initiation; causes TOs.'],
    '5-Out Motion':            [-1,-1, 1,-2, 1, 0, 'Denies off-ball catches; disrupts 5-out motion.'],
    'Motion / Read & React':   [-1,-1, 1,-2, 1, 0, 'Disrupts reads with active hands; forces TOs.'],
    'Pace & Space':            [-1, 0, 1,-2, 1, 0, 'Contests transition 3s; active pressure.'],
    'Dribble Drive':           [ 0,-1, 1,-2.5, 1,-0.5, 'Lateral quickness; stops drive angles; forces pull-ups.'],
    'Princeton':               [-1,-1, 1,-2, 1, 0, 'Denies backdoor setups; active hands in cuts.'],
    'Flex':                    [-1,-1, 2,-2, 1, 0, 'Fights through screens; POA pressure on ball.'],
    'Swing':                   [-2, 0, 2,-2, 1.5,-0.5, 'Denies reversal; forces TOs in ball movement.'],
    'Post-Centric / Inside-Out':[-1,-1, 2,-1.5, 1, 0, 'Guards perimeter players; limits kick-out 3s.'],
    'Moreyball':               [-1, 0, 1,-2, 1, 0, 'POA pressure on Moreyball guards; disrupts spacing reads.'],
    'Heliocentric':            [ 0,-1, 1,-1.5, 0.5, 0, 'Best secondary defender; takes anchor helper role.'],
    'Coach K':                 [-1, 0, 1,-2, 1,-0.5, 'Elite containment and screen navigation; high-value archetype.'],
  },
  'Primary Ball-Handler (Offense-First)': {
    'Spread Pick-and-Roll':    [ 0, 0, 0, 0, 0, 0, 'Offense-first guard; defensive liability on ball.'],
    '5-Out Motion':            [ 0, 0, 1, 0.5, 0, 0, 'Beaten on cuts; allows catch-and-shoot.'],
    'Motion / Read & React':   [ 0, 0, 1, 0.5, 0, 0, 'Defensive reads lag behind reads-based offense.'],
    'Pace & Space':            [ 0, 0, 1, 0.5, 0, 0, 'Transition offense exploits defensive weaknesses.'],
    'Dribble Drive':           [ 0, 1, 1, 1, 0, 0, 'Drive lanes available against poor on-ball D.'],
    'Princeton':               [ 0, 0, 1, 0.5, 0, 0, 'Backdoor cuts succeed against offense-first guard.'],
    'Flex':                    [ 0, 0, 1, 0.5, 0, 0, 'Off-screen cuts available; limited screen navigation.'],
    'Swing':                   [ 0, 0, 1, 0.5, 0, 0, 'Ball-handler defensive liability on reversal.'],
    'Post-Centric / Inside-Out':[ 0, 0, 1, 0.5, 0, 0, 'Post actions succeed against offense-first guard.'],
    'Moreyball':               [ 0, 0, 0, 0.5, 0, 0, 'Moreyball guards attack offensive-first defender.'],
    'Heliocentric':            [ 0, 1, 1, 1.5, 0, 0, 'Anchor exploits primary ball-handler defensive weakness.'],
    'Coach K':                 [ 0, 0, 1, 0.5, 0, 0, 'Coach K\'s motion attacks primary handler liability.'],
  },
  'Switchable Defender Wing': {
    'Spread Pick-and-Roll':    [-1,-1, 1,-1.5, 0.5, 0, 'Switches cleanly in PnR; contests at point of attack.'],
    '5-Out Motion':            [-1,-1, 1,-1.5, 0.5, 0, 'Versatile; covers multiple 5-out player types.'],
    'Motion / Read & React':   [-1,-1, 1,-1.5, 0.5, 0, 'Switchable wing disrupts motion reads.'],
    'Pace & Space':            [-1, 0, 1,-1.5, 0.5, 0, 'Versatility allows transition coverage.'],
    'Dribble Drive':           [ 0,-1, 1,-1.5, 0.5, 0, 'Contests drives; switches pick coverage.'],
    'Princeton':               [-1,-1, 1,-1.5, 0.5, 0, 'Covers backdoor cuts; switches screens.'],
    'Flex':                    [-1,-1, 2,-1.5, 0.5, 0, 'Switches Flex screening actions; high value.'],
    'Swing':                   [-1, 0, 1,-1.5, 0.5, 0, 'Denies reversal; switchable on perimeter.'],
    'Post-Centric / Inside-Out':[ 0,-2, 2,-1.5, 0.5, 0, 'Switches to cover kick-out shooters from post.'],
    'Moreyball':               [-1, 0, 1,-1.5, 0.5, 0, 'Contests rim and 3; Moreyball disrupted.'],
    'Heliocentric':            [ 0,-1, 1,-1.5, 0.5, 0, 'Can take anchor assignment; switchable coverage.'],
    'Coach K':                 [-1,-1, 1,-2, 0.5, 0, 'Switchable wing ideal for Coach K\'s complex reads.'],
  },
  'Anchor Big': {
    'Spread Pick-and-Roll':    [ 0,-3, 2,-2, 0, 0.5, 'Anchor protects rim; rim attempts suppressed significantly.'],
    '5-Out Motion':            [ 0,-2, 2,-1.5, 0,-0.5, 'Anchor limits cutting lanes; protects paint.'],
    'Motion / Read & React':   [ 0,-2, 2,-1.5, 0, 0, 'Rim protector stops reads-based cutting.'],
    'Pace & Space':            [ 0,-2, 2,-1.5, 0, 0, 'Anchor big limits transition rim access.'],
    'Dribble Drive':           [ 0,-3, 2,-2.5, 0, 0.5, 'Anchor significantly limits drive finishing.'],
    'Princeton':               [ 0,-2, 2,-2, 0, 0, 'Protects rim on backdoor cuts; high-post contested.'],
    'Flex':                    [ 0,-2, 2,-2, 0, 0, 'Anchor protects baseline cuts; Flex rim access limited.'],
    'Swing':                   [ 0,-2, 2,-1.5, 0, 0, 'Limits drive-and-kick rim finishes.'],
    'Post-Centric / Inside-Out':[ 0,-3, 2,-2.5, 0.5, 0.5, 'Post actions directly contested by anchor.'],
    'Moreyball':               [ 0,-3, 2,-2, 0, 0, 'Anchor cancels Moreyball rim access.'],
    'Heliocentric':            [ 0,-3, 2,-2, 0, 0.5, 'Rim protector is primary stopper vs heliocentric anchor.'],
    'Coach K':                 [ 0,-2, 2,-2, 0, 0, 'Anchor big vital for Coach K\'s rim protection needs.'],
  },
  'Stretch Big': {
    'Spread Pick-and-Roll':    [ 1,-1, 0,-0.5, 0, 0, 'Stretch big leaves rim; PnR roll men attack open lane.'],
    '5-Out Motion':            [ 1,-1, 0,-0.5, 0,-0.5, 'High closeout frequency; limited rim protection.'],
    'Motion / Read & React':   [ 1,-1, 0,-0.5, 0,-0.5, 'Stretch big contests 3s but allows rim runs.'],
    'Pace & Space':            [ 1,-1, 0,-0.5, 0, 0, 'Contests transition 3s; limited rim help.'],
    'Dribble Drive':           [ 0, 1, 0, 0.5, 0, 0, 'Drive lanes open vs stretch big defending low.'],
    'Princeton':               [ 1,-1, 1,-0.5, 0,-0.5, 'Stretch big chases shooters; backdoor lanes open.'],
    'Flex':                    [ 1,-1, 1,-0.5, 0,-0.5, 'Contests 3s but cut lanes open behind stretch big.'],
    'Swing':                   [ 1,-1, 0,-0.5, 0, 0, 'Stretch big on perimeter; some rim liability.'],
    'Post-Centric / Inside-Out':[-1,-1, 1,-1, 0, 0, 'Stretch big can contest post and perimeter.'],
    'Moreyball':               [ 1,-1, 0,-0.5, 0, 0, 'Contests 3s; some rim access given up.'],
    'Heliocentric':            [ 1, 0, 0,-0.5, 0, 0, 'Stretch big leaves rim; anchor drives open.'],
    'Coach K':                 [ 1,-1, 0,-0.5, 0, 0, 'Stretch big provides spacing on D; limited rim.'],
  },
  'Connector Guard': {
    'Spread Pick-and-Roll':    [-1, 0, 1,-1.5, 0.5,-0.5, 'Connector disrupts PnR reads; good switch coverage.'],
    '5-Out Motion':            [-1,-1, 1,-1.5, 0.5, 0, 'Denies 5-out motion catches; active hands.'],
    'Motion / Read & React':   [-1,-1, 1,-1.5, 0.5, 0, 'Reads contested; connector provides help.'],
    'Pace & Space':            [-1, 0, 1,-1.5, 0.5, 0, 'Contests transition spacing.'],
    'Dribble Drive':           [ 0,-1, 1,-1.5, 0.5, 0, 'Adequate drive containment; not elite.'],
    'Princeton':               [-1,-1, 1,-1.5, 0.5, 0, 'Active denial on backdoor passes.'],
    'Flex':                    [-1,-1, 2,-1.5, 0.5, 0, 'Contests off-screen actions.'],
    'Swing':                   [-1, 0, 1,-1.5, 0.5,-0.5, 'Denies reversal; disruptive passing lane presence.'],
    'Post-Centric / Inside-Out':[ 0,-1, 2,-1, 0.5, 0, 'Helps on post; contests kick-outs.'],
    'Moreyball':               [-1, 0, 1,-1.5, 0.5, 0, 'Active disruption of Moreyball guards.'],
    'Heliocentric':            [ 0,-1, 1,-1, 0, 0, 'Secondary defense on anchor; connection role.'],
    'Coach K':                 [-1, 0, 1,-1.5, 0.5, 0, 'Connector guard valuable in Coach K defensive scheme.'],
  },
  'Offensive Wing Scorer': {
    'Spread Pick-and-Roll':    [ 0, 0, 1, 0, 0, 0, 'Offense-first wing; defensive positioning limited.'],
    '5-Out Motion':            [ 0, 0, 1, 0.5, 0, 0, 'Closeout effort sporadic; motion gets catches.'],
    'Motion / Read & React':   [ 0, 0, 1, 0.5, 0, 0, 'Reads succeed against offense-focused wing.'],
    'Pace & Space':            [ 0, 0, 1, 0.5, 0, 0, 'Transition offense beats offensive wing.'],
    'Dribble Drive':           [ 0, 1, 1, 1, 0, 0, 'Drive lanes exploited against poor defender.'],
    'Princeton':               [ 0, 0, 1, 0.5, 0, 0, 'Backdoor cuts available against offense wing.'],
    'Flex':                    [ 0, 0, 1, 0.5, 0, 0, 'Off-screen cuts available; limited fight.'],
    'Swing':                   [ 0, 0, 1, 0.5, 0, 0, 'Reversal catches available against offense wing.'],
    'Post-Centric / Inside-Out':[ 0, 0, 1, 0.5, 0, 0, 'Limited post help from offense-first wing.'],
    'Moreyball':               [ 0, 0, 1, 0.5, 0, 0, 'Moreyball reads succeed vs defensive liability.'],
    'Heliocentric':            [ 0, 1, 1, 1, 0, 0, 'Anchor exploits offensive wing defensive gap.'],
    'Coach K':                 [ 0, 0, 1, 0.5, 0, 0, 'Coach K reads expose offensive wing liability.'],
  },
  'Gap / Team Defender Wing': {
    'Spread Pick-and-Roll':    [ 0,-2, 1,-1, 0, 0, 'Team-oriented help; suppresses rim; gives up perimeter.'],
    '5-Out Motion':            [ 0,-1, 1,-1, 0, 0, 'Team help system; contests cuts; gives up catch-and-shoot.'],
    'Motion / Read & React':   [ 0,-1, 1,-1, 0, 0, 'Gap defender disrupts drives; reads continue.'],
    'Pace & Space':            [ 0,-1, 1,-1, 0, 0, 'Team help controls rim; transition 3s still open.'],
    'Dribble Drive':           [ 0,-2, 1,-1.5, 0, 0, 'Gap defender helps on drives; moderately effective.'],
    'Princeton':               [ 0,-1, 1,-1, 0, 0, 'Help on backdoor cuts; perimeter exposed.'],
    'Flex':                    [ 0,-1, 2,-1, 0, 0, 'Team help on baseline cuts.'],
    'Swing':                   [ 0,-1, 1,-1, 0, 0, 'Gap defender helps on ball; reversal still available.'],
    'Post-Centric / Inside-Out':[ 0,-2, 2,-1.5, 0, 0, 'Gap defender helps on post; kick-outs available.'],
    'Moreyball':               [ 0,-1, 1,-1, 0, 0, 'Rim protection but Moreyball 3s available.'],
    'Heliocentric':            [ 0,-2, 1,-1.5, 0, 0, 'Gap defender on anchor; team help system.'],
    'Coach K':                 [ 0,-1, 1,-1, 0, 0, 'Gap defender in team system; Coach K reads exploit.'],
  },
  'Mobile Defensive Big': {
    'Spread Pick-and-Roll':    [ 1,-2, 0,-2, 0.5, 0, 'Mobile big helps on PnR; limits roll-man rim; switches PnR.'],
    '5-Out Motion':            [ 1,-1, 0,-1.5, 0.5, 0, 'Mobile big contests cuts and drives.'],
    'Motion / Read & React':   [ 1,-1, 0,-1.5, 0.5, 0, 'Mobile coverage disrupts motion reads.'],
    'Pace & Space':            [ 1,-1, 0,-1.5, 0.5, 0, 'Switches transition coverages.'],
    'Dribble Drive':           [ 0,-2, 1,-2, 0.5, 0, 'Mobile big steps up on drives; limits finishes.'],
    'Princeton':               [ 1,-1, 1,-1.5, 0.5, 0, 'Mobile coverage on backdoor reads.'],
    'Flex':                    [ 1,-1, 1,-1.5, 0.5, 0, 'Mobile big fights through Flex screens.'],
    'Swing':                   [ 1,-1, 0,-1.5, 0.5, 0, 'Mobile coverage on reversal wing.'],
    'Post-Centric / Inside-Out':[-1,-2, 2,-2, 0.5, 0, 'Mobile big contests post and perimeter.'],
    'Moreyball':               [ 1,-2, 0,-2, 0.5, 0, 'Mobile big limits Moreyball rim and 3.'],
    'Heliocentric':            [ 1,-2, 0,-2, 0.5, 0, 'Mobile big steps up on anchor drives.'],
    'Coach K':                 [ 1,-1, 0,-2, 0.5, 0, 'Mobile big vital for Coach K\'s switch defense.'],
  },
  'Chaos Disruptor Wing': {
    'Spread Pick-and-Roll':    [-1,-1, 2,-1, 1.5,-0.5, 'Chaos disrupts PnR timing; forces TOs; gives up some mid.'],
    '5-Out Motion':            [-1,-1, 2,-1, 1.5,-0.5, 'Active disruption; causes chaos in motion reads.'],
    'Motion / Read & React':   [-2,-1, 2,-1, 2,-0.5, 'Chaos disrupts read timing; highest TO generation.'],
    'Pace & Space':            [-1, 0, 2,-1, 1.5,-0.5, 'Chaos creates transition miscues.'],
    'Dribble Drive':           [-1,-1, 2,-1, 2,-0.5, 'Chaos wing disrupts drive reads; active hands.'],
    'Princeton':               [-2,-1, 2,-1, 2,-0.5, 'Chaos specifically disrupts Princeton read timing.'],
    'Flex':                    [-1,-1, 2,-1, 2,-0.5, 'Chaos disrupts Flex pattern timing.'],
    'Swing':                   [-1,-1, 2,-1, 2,-0.5, 'Active disruption of ball reversal.'],
    'Post-Centric / Inside-Out':[-1,-2, 2,-1, 1.5,-0.5, 'Disrupts post entry passes; active hands.'],
    'Moreyball':               [-1,-1, 2,-1, 1.5,-0.5, 'Disrupts Moreyball guard reads.'],
    'Heliocentric':            [ 0,-1, 2,-0.5, 1, 0, 'Chaos wing attacks anchor\'s comfort zone.'],
    'Coach K':                 [-1,-1, 2,-1, 1.5,-0.5, 'Chaos wing creates TOs vs complex Coach K offense.'],
  },
  'Point Forward': {
    'Spread Pick-and-Roll':    [-1,-1, 1,-1.5, 0.5, 0, 'Point forward guards PnR ball handler; versatile coverage.'],
    '5-Out Motion':            [-1,-1, 1,-1.5, 0.5, 0, 'Covers multiple positions in 5-out.'],
    'Motion / Read & React':   [-1,-1, 1,-1.5, 0.5, 0, 'Versatile coverage on motion reads.'],
    'Pace & Space':            [-1, 0, 1,-1.5, 0.5, 0, 'Guards perimeter in transition.'],
    'Dribble Drive':           [ 0,-1, 1,-1.5, 0.5, 0, 'Contests drive lanes; versatile coverage.'],
    'Princeton':               [-1,-1, 1,-1.5, 0.5, 0, 'Guards backdoor setups and passes.'],
    'Flex':                    [-1,-1, 2,-1.5, 0.5, 0, 'Fights through Flex screens; covers assignments.'],
    'Swing':                   [-1, 0, 1,-1.5, 0.5, 0, 'Denies reversal actions; versatile.'],
    'Post-Centric / Inside-Out':[ 0,-2, 2,-1.5, 0.5, 0, 'Guards perimeter; helps on post.'],
    'Moreyball':               [-1, 0, 1,-1.5, 0.5, 0, 'Versatile coverage on Moreyball players.'],
    'Heliocentric':            [ 0,-1, 1,-1.5, 0.5, 0, 'Point forward takes anchor defensive assignment.'],
    'Coach K':                 [-1,-1, 1,-2, 0.5, 0, 'Point forward valuable in Coach K defensive needs.'],
  },
  'Utility Forward': {
    'Spread Pick-and-Roll':    [ 0,-1, 1,-1, 0.5, 0, 'Utility forward covers various PnR assignments.'],
    '5-Out Motion':            [ 0,-1, 1,-1, 0.5, 0, 'Closes on multiple 5-out player types.'],
    'Motion / Read & React':   [ 0,-1, 1,-1, 0.5, 0, 'Covers motion reads adequately.'],
    'Pace & Space':            [ 0, 0, 1,-1, 0.5, 0, 'Adequate transition coverage.'],
    'Dribble Drive':           [ 0,-1, 1,-1, 0.5, 0, 'Adequate drive containment.'],
    'Princeton':               [ 0,-1, 1,-1, 0.5, 0, 'Covers backdoor cuts.'],
    'Flex':                    [ 0,-1, 2,-1, 0.5, 0, 'Fights through Flex screens.'],
    'Swing':                   [ 0, 0, 1,-1, 0.5, 0, 'Utility coverage on reversal.'],
    'Post-Centric / Inside-Out':[ 0,-2, 2,-1.5, 0.5, 0, 'Helps on post; guards perimeter.'],
    'Moreyball':               [ 0,-1, 1,-1, 0.5, 0, 'Utility coverage on Moreyball reads.'],
    'Heliocentric':            [ 0,-1, 1,-1, 0.5, 0, 'Utility forward on anchor — adequate.'],
    'Coach K':                 [ 0,-1, 1,-1, 0.5, 0, 'Utility coverage in Coach K scheme.'],
  },
  'Roll Man / Vertical Threat': {
    'Spread Pick-and-Roll':    [ 0, 1, 0, 0, 0, 0.5, 'Roll man playing D; gives up some rim access.'],
    '5-Out Motion':            [ 0, 0, 1, 0, 0, 0, 'Moderate defensive coverage; limited perimeter range.'],
    'Motion / Read & React':   [ 0, 0, 1, 0, 0, 0, 'Roll man on defense; limited on reads.'],
    'Pace & Space':            [ 0, 0, 1, 0, 0, 0, 'Limited perimeter coverage; rim protection adequate.'],
    'Dribble Drive':           [ 0,-1, 1,-1, 0, 0, 'Protects rim on drives; limited perimeter.'],
    'Princeton':               [ 0, 0, 1, 0, 0, 0, 'Limited on backdoor reads; rim presence.'],
    'Flex':                    [ 0,-1, 1,-0.5, 0, 0, 'Rim protection helps on Flex cuts.'],
    'Swing':                   [ 0, 0, 1, 0, 0, 0, 'Moderate coverage on reversal.'],
    'Post-Centric / Inside-Out':[ 0,-2, 1,-1, 0, 0, 'Rim protection on post actions.'],
    'Moreyball':               [ 0,-1, 1,-1, 0, 0, 'Rim protection limits Moreyball finishes.'],
    'Heliocentric':            [ 0,-1, 1,-1, 0, 0, 'Rim presence on anchor drives.'],
    'Coach K':                 [ 0,-1, 1,-1, 0, 0, 'Roll man big provides rim help in Coach K scheme.'],
  },
  'Offensive Big (Defense Liability)': {
    'Spread Pick-and-Roll':    [ 0, 1, 0, 1, 0, 0, 'Offensive big defensive liability; PnR roll lanes open.'],
    '5-Out Motion':            [ 0, 1, 0, 1, 0, 0, 'Offensive big can\'t cover 5-out movement.'],
    'Motion / Read & React':   [ 0, 1, 1, 1, 0, 0, 'Motion reads succeed vs defensive liability.'],
    'Pace & Space':            [ 0, 1, 0, 1, 0, 0, 'Transition offense attacks liability big.'],
    'Dribble Drive':           [ 0, 2, 0, 1.5, 0, 0, 'Drive lanes fully open vs defensive big liability.'],
    'Princeton':               [ 0, 1, 1, 1, 0, 0, 'Backdoor cuts available vs defensive liability.'],
    'Flex':                    [ 0, 1, 1, 1, 0, 0, 'Off-screen cuts available; limited defense.'],
    'Swing':                   [ 0, 0, 1, 0.5, 0, 0, 'Reversal catches available; moderate liability.'],
    'Post-Centric / Inside-Out':[-1,-1, 1, 0, 0, 0, 'Some post competition but mostly liability.'],
    'Moreyball':               [ 0, 1, 0, 1, 0, 0, 'Moreyball rim access given up freely.'],
    'Heliocentric':            [ 0, 2, 0, 1.5, 0, 0, 'Anchor exploits defensive big fully.'],
    'Coach K':                 [ 0, 1, 0, 1, 0, 0, 'Coach K exploits defensive big liability.'],
  },
  'Situational Shooter (Specialist)': {
    'Spread Pick-and-Roll':    [ 0,-1, 1,-0.5, 0, 0, 'Limited on-ball defense; helps off-ball.'],
    '5-Out Motion':            [ 0,-1, 1,-0.5, 0,-0.5, 'Specialist contests shooters; limited rim help.'],
    'Motion / Read & React':   [ 0,-1, 1,-0.5, 0,-0.5, 'Contests motion shooters; limited reads.'],
    'Pace & Space':            [ 0, 0, 1,-0.5, 0, 0, 'Closes on transition shooters.'],
    'Dribble Drive':           [ 0, 1, 0, 0.5, 0, 0, 'Drive lanes open vs non-driver specialist.'],
    'Princeton':               [ 0,-1, 1,-0.5, 0,-0.5, 'Contests shooters; less effective on cuts.'],
    'Flex':                    [ 0,-1, 1,-0.5, 0,-0.5, 'Contests off-screen looks; limited fights.'],
    'Swing':                   [ 0,-1, 1,-0.5, 0,-0.5, 'Contests reversal shooters.'],
    'Post-Centric / Inside-Out':[ 0, 0, 2, 0, 0, 0, 'Situational coverage; limited interior.'],
    'Moreyball':               [ 0,-1, 1,-0.5, 0, 0, 'Contests Moreyball shooters.'],
    'Heliocentric':            [ 0, 0, 0, 0, 0, 0, 'Specialist can\'t guard anchor; neutral.'],
    'Coach K':                 [ 0,-1, 1,-0.5, 0,-0.5, 'Situational shooter provides spot defensive value.'],
  },
  'Defensive Specialist (Non-Scoring)': {
    'Spread Pick-and-Roll':    [-1,-1, 1,-2, 1,-0.5, 'Elite on-ball; disrupts PnR initiation; forces TOs.'],
    '5-Out Motion':            [-1,-1, 1,-2, 1, 0, 'Denies off-ball catches; active hands.'],
    'Motion / Read & React':   [-1,-1, 1,-2, 1, 0, 'Elite disruption of motion reads.'],
    'Pace & Space':            [-1, 0, 1,-2, 1, 0, 'Contests transition 3s; high-effort coverage.'],
    'Dribble Drive':           [ 0,-1, 1,-2.5, 1,-0.5, 'Elite lateral quickness; stops drive angles.'],
    'Princeton':               [-1,-1, 1,-2, 1, 0, 'Denies backdoor setups; active hands.'],
    'Flex':                    [-1,-1, 2,-2, 1, 0, 'Fights through screens; elite on-ball pressure.'],
    'Swing':                   [-2, 0, 2,-2, 1.5,-0.5, 'Denies reversal; forces TOs in ball movement.'],
    'Post-Centric / Inside-Out':[-1,-1, 2,-1.5, 1, 0, 'Guards perimeter players; limits kick-outs.'],
    'Moreyball':               [-1, 0, 1,-2, 1, 0, 'Disrupts Moreyball guard reads; elite active.'],
    'Heliocentric':            [ 0,-1, 1,-1.5, 0.5, 0, 'Best secondary defender; takes helper role.'],
    'Coach K':                 [-1, 0, 1,-2, 1,-0.5, 'Defensive specialist ideal for Coach K scheme.'],
  },
  'Energy Big': {
    'Spread Pick-and-Roll':    [ 1,-2, 1,-1.5, 0.3, 0.3, 'Motor helps rim protection; can\'t switch onto perimeter.'],
    '5-Out Motion':            [ 0.5,-1, 0.5,-1, 0.2, 0.2, 'Energy crashes boards; effort-based coverage.'],
    'Motion / Read & React':   [ 0.5,-1, 0.5,-1, 0.2, 0.2, 'Effort-based coverage on motion.'],
    'Pace & Space':            [ 0.5,-1, 0.5,-0.8, 0.2, 0.1, 'Energy big in transition; effort coverage.'],
    'Dribble Drive':           [ 1,-2, 1,-1.8, 0.4, 0.4, 'Rim protection via activity; fouls more.'],
    'Princeton':               [ 0.5,-1.5, 1,-1.5, 0.3, 0.3, 'Motor helps on backdoor protection.'],
    'Flex':                    [ 0.5,-1.5, 1,-1.5, 0.3, 0.3, 'Effort-based coverage on Flex cuts.'],
    'Swing':                   [ 0.5,-1.5, 1,-1.5, 0.3, 0.3, 'Energy effort on reversal actions.'],
    'Post-Centric / Inside-Out':[ 0.5,-2, 1.5,-2, 0.3, 0.5, 'Effort rim protection on post; fouls.'],
    'Moreyball':               [ 1,-1.5, 0.5,-1.2, 0.2, 0.2, 'Motor helps Moreyball rim contests.'],
    'Heliocentric':            [ 0.5,-2, 1.5,-1.8, 0.5, 0.4, 'Energy big on anchor; activity-based.'],
    'Coach K':                 [ 1,-1.5, 0.5,-1.2, 0.3, 0.3, 'Motor helps Coach K pace; rim protection via activity.'],
  },
  'Situational Ball-Handler (Bench Guard)': {
    'Spread Pick-and-Roll':    [-0.5,-0.5, 1,-0.8, 0.3,-0.2, 'Adequate on-ball; contains some motion.'],
    '5-Out Motion':            [-0.5,-0.5, 1,-0.5, 0.2,-0.1, 'Adequate off-ball coverage; not elite.'],
    'Motion / Read & React':   [-0.5,-0.5, 1,-0.5, 0.2,-0.1, 'Adequate coverage on motion.'],
    'Pace & Space':            [-0.5, 0, 0.5,-0.3, 0.1,-0.1, 'Adequate transition coverage.'],
    'Dribble Drive':           [-0.5,-1, 1.5,-1, 0.4,-0.3, 'Lateral quickness adequate; forces pull-ups.'],
    'Princeton':               [-0.5,-0.5, 1,-0.5, 0.2,-0.1, 'Adequate coverage on Princeton.'],
    'Flex':                    [-0.5,-0.5, 1,-0.5, 0.2,-0.1, 'Adequate through screens.'],
    'Swing':                   [-0.5,-0.5, 1,-0.5, 0.2,-0.1, 'Adequate reversal coverage.'],
    'Post-Centric / Inside-Out':[ 0,-0.5, 0.5,-0.3, 0.1, 0, 'Limited interior help.'],
    'Moreyball':               [-0.5,-0.5, 1,-0.8, 0.3,-0.2, 'Adequate Moreyball guard coverage.'],
    'Heliocentric':            [-0.5,-1, 1.5,-1, 0.4,-0.3, 'Adequate on anchor in limited minutes.'],
    'Coach K':                 [-0.5,-0.5, 1,-0.8, 0.3,-0.2, 'Adequate coverage in Coach K scheme.'],
  },
  'Developmental Prospect': {
    'Spread Pick-and-Roll':    [ 1, 1,-2, 0.5, 0, 0.3, 'High-variance; physical tools create disruption but technique gaps.'],
    '5-Out Motion':            [ 0.5, 0.5,-1, 0.5, 0, 0.3, 'High-variance; motion succeeds on technique gaps.'],
    'Motion / Read & React':   [ 0.5, 0.5,-1, 0.5, 0, 0.3, 'Reads succeed on technique gaps.'],
    'Pace & Space':            [ 0.5, 0.5,-1, 0.5, 0, 0.3, 'Transition offense exploits technique gaps.'],
    'Dribble Drive':           [ 1, 1,-2, 1, 0, 0.3, 'Drive lanes available vs underdeveloped technique.'],
    'Princeton':               [ 0.5, 0.5,-1, 0.2, 0, 0.3, 'Less direct targeting in structured reads.'],
    'Flex':                    [ 0.5, 0.5,-1, 0.5, 0, 0.3, 'Pattern-based offense exposes technique gaps.'],
    'Swing':                   [ 0.5, 0.5,-1, 0.5, 0, 0.3, 'Reversal actions succeed vs prospect.'],
    'Post-Centric / Inside-Out':[ 0.5, 0.5,-1, 0.5, 0, 0.3, 'Post actions exploit technique gaps.'],
    'Moreyball':               [ 0.5, 0.5,-1, 0.5, 0, 0.3, 'Moreyball attacks technique gaps.'],
    'Heliocentric':            [ 1, 1,-2, 1, 0, 0.3, 'Anchor exploits developmental prospect fully.'],
    'Coach K':                 [ 1, 1,-2, 1, 0, 0.5, 'Complex offense fully exposes underdeveloped technique.'],
  },
};

// ── Build Typed Tables ──

export const SYSTEM_SYSTEM_TABLE: SystemSystemEntry[] = [];
export const ARCHETYPE_DEF_SYSTEM_TABLE: ArchetypeDefSystemEntry[] = [];
export const ARCHETYPE_OFF_SYSTEM_TABLE: ArchetypeOffSystemEntry[] = [];

for (const [off, defMap] of Object.entries(SYS_DATA)) {
  for (const [def, [pace, to, foul, explanation]] of Object.entries(defMap)) {
    SYSTEM_SYSTEM_TABLE.push({ offenseSystem: off, defenseSystem: def, paceImpact: pace, towardsPressure: to, foulRateDelta: foul, explanation });
  }
}
for (const [arch, defMap] of Object.entries(ARCH_DEF_DATA)) {
  for (const [def, [d3pa, drim, dmid, effDelta, toRateDelta, foulDrawDelta, rationale]] of Object.entries(defMap)) {
    ARCHETYPE_DEF_SYSTEM_TABLE.push({ archetype: arch, defSystem: def, d3pa, drim, dmid, effDelta, toRateDelta, foulDrawDelta, rationale });
  }
}
for (const [arch, offMap] of Object.entries(ARCH_OFF_DATA)) {
  for (const [off, [d3pa, drim, dmid, effDelta, toRateDelta, foulRateDelta, rationale]] of Object.entries(offMap)) {
    ARCHETYPE_OFF_SYSTEM_TABLE.push({ archetype: arch, offSystem: off, d3pa, drim, dmid, effDelta, toRateDelta, foulRateDelta, rationale });
  }
}

// ── Lookup Functions ──

export function getSystemSystemEntry(offSystem: string, defSystem: string): SystemSystemEntry | null {
  return SYSTEM_SYSTEM_TABLE.find(e => e.offenseSystem === offSystem && e.defenseSystem === defSystem) ?? null;
}

export function getArchetypeDefSystemEntry(archetype: string, defSystem: string): ArchetypeDefSystemEntry | null {
  return ARCHETYPE_DEF_SYSTEM_TABLE.find(e => e.archetype === archetype && e.defSystem === defSystem) ?? null;
}

export function getArchetypeOffSystemEntry(archetype: string, offSystem: string): ArchetypeOffSystemEntry | null {
  return ARCHETYPE_OFF_SYSTEM_TABLE.find(e => e.archetype === archetype && e.offSystem === offSystem) ?? null;
}
