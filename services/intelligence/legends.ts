/**
 * KaNeXT Basketball Intelligence — Legend Tier Context
 *
 * Provides targeted tier descriptions for any KR + level combination.
 * Returns the matching tier ±1 band (above and below) + a KLVN-based
 * level tier map showing equivalent KR at adjacent competition levels.
 *
 * Data is embedded inline — no filesystem I/O needed in React Native.
 * Display-only: no evaluation logic here, by spec governance.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

interface LegendTier {
  low:   number;
  high:  number;
  label: string;
  text:  string;  // description + calibration examples
}

interface LevelLegend {
  displayName: string;
  lambda:      number;
  anchor:      string;
  tiers:       LegendTier[];  // ordered highest → lowest
}

// ── Legend Data ───────────────────────────────────────────────────────────────

const LEGENDS: Record<string, LevelLegend> = {

  ncaa_d1_high_major: {
    displayName: 'NCAA D1 High-Major',
    lambda: 1.000,
    anchor: 'Power 5 + Big East. Deep rosters, national recruiting, sustained play vs Top-100 opponents.',
    tiers: [
      { low: 98, high: 100, label: 'National Player of the Year Lock / Transcendent Superstar',
        text: 'Program-orbiting force. Elite usage AND elite efficiency simultaneously. Game-plan warps around stopping them — and it still doesn\'t work. Drives wins against other elites. National awards finalist or winner. Reserved for generational single-season performers.' },
      { low: 95, high: 97, label: 'Franchise Anchor / Elite All-American',
        text: 'Clear identity-setter. Team\'s unquestioned alpha or co-alpha. Primary closer. All-American or Conference POY contender. 30+ MPG. What defines this tier: you cannot replace what this player does. Calibration: Lendeborg (96, Michigan — 14.7/6.9/3.2, Big Ten POY, Consensus AA). Acuff (96, Arkansas — 23.5/6.4, SEC POY, .440 3P%, first since Maravich to lead SEC in points + assists).' },
      { low: 92, high: 94, label: 'High-Impact Starter / Core Winner',
        text: 'Wins games at the highest level. Can be the offensive alpha (spike profile — elite scoring, weaker elsewhere) OR two-way anchor (complete profile — contributes across categories). All-Conference caliber. Trusted in late-game situations. Calibration: Peterson (93, Kansas — 20.2 PPG, projected #1 pick, spike scorer). Bradley (94, Arizona — Big 12 POY, clutch, 4.6 APG). Bidunga (92, Kansas — DPOY candidate, 13/9/2.6 BPG). Haugh (93, Florida — Consensus AA, 17.1/6.1). Brazile (92, Arkansas — 13.2/7.4, 3.1 stocks/game).' },
      { low: 89, high: 91, label: 'Solid Starter / Top-Five Rotation Lock',
        text: 'Firmly positive starter value at HM level. 25+ MPG. Consistent two-way impact. All-Conference honorable mention range. Starters on ranked teams who aren\'t stars but who you can\'t win without. Calibration: Oweh (91, Kentucky — 18.1 PPG, 1.8 SPG). Chinyelu (91, Florida — SEC DPOY, 11.2 RPG). Thomas (91, Arkansas — 15.4 PPG, 1.5 SPG). Cadeau (90, Michigan — 5.6 APG). Mara (90, Michigan — 7\'3", 2.6 BPG, .350 3P%).' },
      { low: 86, high: 88, label: 'Trusted Rotation / High-Minute Role Player',
        text: 'Winning-role player who thrives in a defined role. 20+ MPG. Clearly trusted by coaching staff. Value from specialties: shooting, rim protection, distribution, perimeter defense, rebounding. Lineups win with them on the floor. Calibration: Council (87, Kansas — 5.1 APG, elite distributor). Fland (88, Florida — 11.6 PPG, 1.8 SPG, elite on-ball defender). Awaka (88, Arizona — Big 12 6th Man, 9.4/9.5, #1 ORB% nationally).' },
      { low: 83, high: 85, label: 'Reliable Bench / Rotation Contributor',
        text: 'True rotation depth on good teams. 15–20 MPG. Consistent energy or specialty. No major drop-off when on the floor. Common profile on Sweet 16 and Final Four rosters. The 6th-7th man on a ranked team. Calibration: Tiller (84, Kansas — elite physical tools, inconsistent production). Wagner (85, Arkansas — former #1 recruit, 7 PPG on poor shooting, pedigree > production). Dell\'Orso (83, Arizona — .833 FT%, .350 3P%, veteran bench guard).' },
      { low: 80, high: 82, label: 'Situational Specialist / Depth Piece',
        text: 'Matchup- and context-dependent contributor. 10–15 MPG. Role-specific value. Easily replaced individually but useful when aligned correctly with the system. The 7th-8th man on a ranked team. Calibration: Handlogten (82, Florida — 7\'1", elite ORB%, backup C). Aristode (81, Arizona — .459 3P% specialist, 12 MPG). Pringle (81, Arkansas — .714 FG%, 12 MPG backup C).' },
      { low: 77, high: 79, label: 'Limited Bench / Emergency Depth',
        text: 'Playable only under constraint. 5–10 MPG sporadically. Injury or foul trouble dependent. Neutral to mildly negative impact. Not trusted in high-leverage moments. Note: some players at 77-80 play more minutes than label suggests because roster construction forces coaches to play them, not because production warrants it.' },
      { low: 74, high: 76, label: 'Fringe Roster / Non-Rotation',
        text: 'On the roster, not in the competitive plan. Practice and scout value. Garbage-time minutes only. Net neutral to negative on the floor. Calibration: Rosario (75, Kansas — started 6 games early then lost his role completely, .286 3P%, minutes collapsed throughout season).' },
      { low: 71, high: 73, label: 'Developmental Redshirt / Project',
        text: 'Future-oriented roster slot. Physically or skill-wise incomplete. Practice-focused. Not currently viable in HM games. May project upward with development or a transfer to a lower level.' },
      { low: 68, high: 70, label: 'Practice Squad / Walk-On',
        text: 'Roster filler for structure, not competition. Scout team body. No rotation pathway. Contribution is off-court (leadership, culture, practice intensity).' },
      { low: 0,  high: 67, label: 'Below HM Viability',
        text: 'Below HM competitive threshold. Negative on-court impact at HM pace and athleticism. Better fit at Mid-Major, D2, NAIA, or JUCO.' },
    ],
  },

  ncaa_d1_mid_major: {
    displayName: 'NCAA D1 Mid-Major',
    lambda: 0.958,
    anchor: 'AAC, A-10, Mountain West, WCC, MVC. Regional/national recruiting mix. Less depth and athletic redundancy than HM.',
    tiers: [
      { low: 95, high: 100, label: 'Mid-Major Player of the Year Lock / Transcendent Star',
        text: 'Program-defining player who dominates the mid-major landscape nationally. Conference POY lock. Scales up against high-majors without collapsing.' },
      { low: 92, high: 94, label: 'Franchise Anchor / Elite Mid-Major All-American',
        text: 'Clear #1 option and identity driver. Closes games. Consistent efficiency at high usage. All-Conference POY contender. Can carry a team to conference titles or at-large consideration. Calibration: Murauskas (93, Saint Mary\'s — 18.8/7.7/2.2, Princeton hub, team identity runs through him).' },
      { low: 88, high: 91, label: 'High-Impact Starter / Core Winner',
        text: 'Primary reason teams win at the mid-major level. Heavy minutes leader. All-Conference lock. May be an elite facilitator, defensive anchor, or scoring engine. Calibration: Lewis (89, Saint Mary\'s — 14.2 PPG, .372 3P%, .882 FT%). Byrd (88, SDSU — 13.1 PPG, 1.9 SPG). Dixon-Waters (88, SDSU — 13 PPG, .370 3P%).' },
      { low: 85, high: 87, label: 'Solid Starter / Top-Five Rotation Lock',
        text: 'Firmly positive starter value. 25+ MPG. Two-way reliability. All-Conference consideration. Calibration: McDaniel (85, Memphis — 13.9/4.6 APG/1.9 SPG). Davis (86, SDSU — 11/4/2.5, game-winner in MWC tournament). Gwath (85, SDSU — MW DPOY/FOY, rim protector + .350 3P% unicorn).' },
      { low: 82, high: 84, label: 'Trusted Rotation / Big-Minute Contributor',
        text: 'Winning-role player trusted in pressure moments. Top 6-8 rotation. 20+ MPG. Clear specialist value. Calibration: Parker (82, Memphis — 11.4 PPG). Shaw (84, Saint Mary\'s — .417 3P%, 5.3 RPG as a freshman). Harrington (83, SDSU — freshman, .360 3P%, #80 recruit).' },
      { low: 79, high: 81, label: 'Reliable Bench / Rotation Piece',
        text: 'Depth that keeps quality intact. 15–20 MPG. Neutral to slightly positive impact. Calibration: Cooley (81, Pepperdine — .920 FT%, 11.7 PPG). Campbell (81, Saint Mary\'s — .489 3P%). Compton (81, SDSU — .550 FG% efficient finisher).' },
      { low: 76, high: 78, label: 'Situational Specialist / Depth',
        text: 'Context-dependent contributor. 10–15 MPG. Cannot be relied on nightly. Calibration: Davis (77, Memphis — .278 3P% liability). Cicic (78, Pepperdine — 1.0 BPG, 23/10/4 ceiling game).' },
      { low: 73, high: 75, label: 'Limited Bench / Emergency Depth',
        text: 'Playable only under constraint. 5–10 MPG. Neutral to mildly negative. Calibration: Hawke (74, Saint Mary\'s — .222 3P%, 10.7 MPG).' },
      { low: 70, high: 72, label: 'Fringe Roster / Non-Rotation',
        text: 'On the roster, not in the plan. Practice and scout value. Calibration: Vudragovic (71, Pepperdine — 3 PPG, 12 MPG, bottom of WCC).' },
      { low: 67, high: 69, label: 'Developmental Redshirt / Project',
        text: 'Future-oriented slot. Not viable in strong MM play yet.' },
      { low: 64, high: 66, label: 'Practice Squad / Walk-On',
        text: 'Roster filler for structure. No competitive pathway.' },
      { low: 0,  high: 63, label: 'Below Mid-Major Viability',
        text: 'Below MM competitive threshold. Better suited for Low-Major, D2, NAIA, or JUCO.' },
    ],
  },

  ncaa_d1_low_major: {
    displayName: 'NCAA D1 Low-Major',
    lambda: 0.917,
    anchor: 'Big South, Big Sky, Big West, SWAC, MEAC, NEC, Southland, Patriot. Regional/local recruiting. Thin depth.',
    tiers: [
      { low: 92, high: 100, label: 'Low-Major Player of the Year Lock / Dominant Star',
        text: 'Conference-level force who overwhelms the ecosystem. Extreme usage with sustainable efficiency. Carries team to auto-bid contention.' },
      { low: 88, high: 91, label: 'Franchise Anchor / Elite Low-Major Standout',
        text: 'Clear #1 option. Leads conference in key categories. Conference POY contender. Calibration: Martin (89, High Point — 15 PPG, 2.3 AST/TO, 1.6 SPG, 30 pts vs Arkansas in NCAA R2). Fletcher (88, High Point — 14/7 on .540 FG%). Dixon (88, UCI — 15.4 PPG, .385 3P%). Evans (88, UCI — anchors 4th-ranked national defense, 8.4 RPG, ~2.5 BPG). Sykes (88, LBSU — 19.4 PPG as a freshman, 39-pt game).' },
      { low: 84, high: 87, label: 'High-Impact Starter / Core Winner',
        text: 'Primary reason teams consistently win in-conference. All-Conference lock. Calibration: Martinez (86, High Point — .480/.350/.860, 2.92 AST/TO). Aquino (86, High Point — 1.7 BPG + .410 3P% unicorn). Majstorovic (86, LBSU — 15.2/6.4/1.7 SPG). Saine (86, Weber State — 14/4/1.5, 29-pt game).' },
      { low: 80, high: 83, label: 'Solid Starter / Top-Five Rotation Lock',
        text: 'Reliable starter value. 25+ MPG. Consistent two-way contribution. Calibration: Washington (83, High Point — jumped from 76-79 at CSUN to 83 at HP, system-unlock). Tillis (83, UCI — 8/5.5, NIT semifinal double-double). Vartiainen (83, Weber State — .391 career 3P%).' },
      { low: 77, high: 79, label: 'Trusted Rotation / Big-Minute Contributor',
        text: 'Winning-role player in a thin ecosystem. Top 6-8 rotation. 18-25 MPG. Calibration: Brady (77, High Point — 2.6 AST/TO but .250 3P%). Levillain (78, LBSU — French freshman, 5.0 RPG). Gomma (79, Weber State — rim-running C, 19/13 ceiling game).' },
      { low: 74, high: 76, label: 'Reliable Bench / Rotation Piece',
        text: 'Depth that keeps teams functional. 12–18 MPG. Calibration: Miller (74, High Point — freshman big, .760 FG%, 15 blocks). Grayson (76, Weber State — 3.0 APG in 14 MPG).' },
      { low: 71, high: 73, label: 'Situational Specialist / Depth',
        text: 'Context-dependent bench contributor. 8–12 MPG.' },
      { low: 68, high: 70, label: 'Limited Bench / Emergency Depth',
        text: 'Playable only under constraint. 5–10 MPG.' },
      { low: 65, high: 67, label: 'Fringe Roster / Non-Rotation',
        text: 'On the roster, not in the plan. Practice and scout value.' },
      { low: 62, high: 64, label: 'Developmental Redshirt / Project',
        text: 'Future-oriented slot. Not viable currently.' },
      { low: 59, high: 61, label: 'Practice Squad / Walk-On',
        text: 'Roster filler. No competitive pathway.' },
      { low: 0,  high: 58, label: 'Below Low-Major Viability',
        text: 'Below D1 competitive threshold. Better suited for D2, NAIA, JUCO.' },
    ],
  },

  ncaa_d2: {
    displayName: 'NCAA Division II',
    lambda: 0.875,
    anchor: 'Top D2 programs in CCAA, MIAA, G-MAC, Sunshine State, PSAC, RMAC, PacWest. Regional recruiting with some national reach.',
    tiers: [
      { low: 90, high: 100, label: 'D2 Player of the Year Lock / Dominant National Star',
        text: 'National-level force who overwhelms the D2 ecosystem. Elite raw production with sustainable efficiency. Carries team to national title contention.' },
      { low: 86, high: 89, label: 'Franchise Anchor / Elite D2 Standout',
        text: 'Clear #1 option and identity driver. Conference POY contender. All-American candidate. Calibration: T. Campbell (89, Cal State East Bay — D2 POY, All-American, .522/.457 shooting, 33-1 team).' },
      { low: 82, high: 85, label: 'High-Impact Starter / Core Winner',
        text: 'Primary reason strong D2 teams consistently win. All-Conference / All-Region lock. Calibration: K. King (85, Chaminade — 15.7/7.3/2.9/2.1, most complete D2 line in study). Bush (85, CSEB — CCAA Tournament MVP, 23-pt championship game). Medina (82, Chaminade — 16.1 PPG, .847 FT%).' },
      { low: 78, high: 81, label: 'Solid Starter / Top-Five Rotation Lock',
        text: 'Reliable starter value at D2 level. 25+ MPG. Calibration: Kr. King (81, Chaminade — 12.4/4.2/2.5/1.7). Banks (81, Chaminade — 107 assists, .467 FG%). Ijeh (81, CSEB — CCAA DPOY, ~2.0 BPG).' },
      { low: 75, high: 77, label: 'Trusted Rotation / Big-Minute Contributor',
        text: 'Winning-role player in competitive D2. Top 6-8 rotation. 18-25 MPG. Calibration: Sasser (75, Chaminade — .432 FG%, bench energy). Haywood (78, CSEB — .560 FG% efficient finisher).' },
      { low: 72, high: 74, label: 'Reliable Bench / Rotation Piece',
        text: 'Depth that maintains quality. 12–18 MPG.' },
      { low: 69, high: 71, label: 'Situational Specialist / Depth',
        text: 'Context-dependent bench contributor. 8–12 MPG. Calibration: Shackelford (70, Chaminade — 2.9 PPG, 9.7 MPG).' },
      { low: 66, high: 68, label: 'Limited Bench / Emergency Depth',
        text: 'Playable only under constraint. 5–10 MPG.' },
      { low: 63, high: 65, label: 'Fringe Roster / Non-Rotation',
        text: 'On the roster, not in the plan. Practice and scout focus.' },
      { low: 60, high: 62, label: 'Developmental Redshirt / Project',
        text: 'Future-oriented slot. Not viable at competitive D2 level.' },
      { low: 57, high: 59, label: 'Practice Squad / Walk-On',
        text: 'Roster filler. No competitive pathway.' },
      { low: 0,  high: 56, label: 'Below D2 Viability',
        text: 'Below D2 competitive threshold. Better suited for D3, NAIA, JUCO.' },
    ],
  },

  njcaa_d1: {
    displayName: 'NJCAA Division I',
    lambda: 0.833,
    anchor: 'Top JUCO D1 programs (Snow, Midland, Vincennes, Region 5/8 powers). Full scholarship. High athleticism and pace.',
    tiers: [
      { low: 88, high: 100, label: 'NJCAA D1 Player of the Year Lock / Elite National JUCO Star',
        text: 'National-level JUCO force who overwhelms the ecosystem. Explosive raw production with sustainable efficiency. Carries team to nationals and title contention.' },
      { low: 84, high: 87, label: 'Franchise Anchor / Top NJCAA Standout',
        text: 'Clear #1 option and identity driver. Defines team success. Closes games consistently. Conference POY contender.' },
      { low: 80, high: 83, label: 'High-Impact Starter / Core Winner',
        text: 'Primary reason elite JUCO teams win. Heavy minutes leader. All-Conference / All-Region lock. Game-changer vs top JUCO competition.' },
      { low: 76, high: 79, label: 'Solid Starter / Top-Five Rotation Lock',
        text: 'Reliable starter value at high JUCO level. 25+ MPG. Consistent two-way contribution.' },
      { low: 73, high: 75, label: 'Trusted Rotation / Big-Minute Contributor',
        text: 'Winning-role player on strong JUCO rosters. Top 6-8 rotation. 18–25 MPG.' },
      { low: 70, high: 72, label: 'Reliable Bench / Rotation Piece',
        text: 'Depth that maintains quality. 12–18 MPG.' },
      { low: 67, high: 69, label: 'Situational Specialist / Depth',
        text: 'Context-dependent bench contributor. 8–12 MPG.' },
      { low: 64, high: 66, label: 'Limited Bench / Emergency Depth',
        text: 'Playable only under constraint. 5–10 MPG.' },
      { low: 61, high: 63, label: 'Fringe Roster / Non-Rotation',
        text: 'On the roster, not in the plan.' },
      { low: 58, high: 60, label: 'Developmental Redshirt / Project',
        text: 'Future-oriented. Not viable currently.' },
      { low: 55, high: 57, label: 'Practice Squad / Walk-On',
        text: 'Roster filler. No competitive pathway.' },
      { low: 0,  high: 54, label: 'Below NJCAA D1 Viability',
        text: 'Below JUCO D1 competitive threshold.' },
    ],
  },

  naia: {
    displayName: 'NAIA',
    lambda: 0.810,
    anchor: 'Cascade, Heart, SSAC, Sun Conference, GPAC, Crossroads, Cal Pac, etc. Scholarship availability with academic-athletic balance.',
    tiers: [
      { low: 86, high: 100, label: 'NAIA Player of the Year Lock / Elite National Standout',
        text: 'National-level NAIA force who overwhelms the ecosystem. Explosive raw production with sustainable efficiency. Carries team to national tournament contention.' },
      { low: 82, high: 85, label: 'Franchise Anchor / Top NAIA All-American',
        text: 'Clear #1 option and identity driver. Conference POY contender. Calibration: Parker (82, Simpson — 19.7 PPG, .528 FG%, alpha scorer). Selden (82, FMU — 12.1/5.8/3.0/1.3/0.9, most complete NAIA line in study).' },
      { low: 78, high: 81, label: 'High-Impact Starter / Core Winner',
        text: 'Primary reason strong NAIA teams win. Heavy minutes leader. All-Conference / All-American consideration. Calibration: Carter (81, FMU — 15.9 PPG, .841 FT%, .355 3P%). Allen (78, Simpson — 17.1/5.6/2.6, but .248 3P% and .518 FT% drag). Rolfs (78, Simpson — 8.3 RPG, 3.05 AST/TO).' },
      { low: 74, high: 77, label: 'Solid Starter / Top-Five Rotation Lock',
        text: 'Reliable starter value at NAIA level. 25+ MPG. Consistent two-way contribution. Calibration: Harms (76, Simpson — .357 3P% team-best). Mentor (77, FMU — 2.0 SPG, 51 steals, defensive identity).' },
      { low: 71, high: 73, label: 'Trusted Rotation / Big-Minute Contributor',
        text: 'Top 6-8 rotation. 18–25 MPG. Calibration: Kilbert (72, Simpson — 2.5 APG distributor). Asceric (71, FMU — 6.8 PPG bench forward).' },
      { low: 68, high: 70, label: 'Reliable Bench / Rotation Piece',
        text: '12–18 MPG. Calibration: Torrey (68, Simpson — .306 3P%, bench guard). Lewis (69, FMU — .455 FG%, split starter).' },
      { low: 65, high: 67, label: 'Situational Specialist / Depth',
        text: 'Context-dependent. 8–12 MPG. Calibration: Attebery (67, Simpson — deep bench forward, 3.5 PPG).' },
      { low: 62, high: 64, label: 'Limited Bench / Emergency Depth',
        text: 'Playable only under constraint. 5–10 MPG.' },
      { low: 59, high: 61, label: 'Fringe Roster / Non-Rotation',
        text: 'On the roster, not in the plan.' },
      { low: 56, high: 58, label: 'Developmental Redshirt / Project',
        text: 'Not viable at competitive NAIA level.' },
      { low: 53, high: 55, label: 'Practice Squad / Walk-On',
        text: 'Roster filler. No competitive pathway.' },
      { low: 0,  high: 52, label: 'Below NAIA Viability',
        text: 'Below NAIA competitive threshold.' },
    ],
  },

  cccaa: {
    displayName: 'CCCAA',
    lambda: 0.765,
    anchor: 'South Coast, Orange Empire, Western State. No athletic scholarships. Strong California HS talent. Primary focus on transfer prep.',
    tiers: [
      { low: 84, high: 100, label: 'CCCAA Player of the Year Lock / Elite State-National JUCO Standout',
        text: 'State- or national-level force who overwhelms the CCCAA ecosystem. Monster raw production. Carries team to state or national contention.' },
      { low: 80, high: 83, label: 'Franchise Anchor / Top CCCAA All-State',
        text: 'Clear #1 option. Defines team success. Conference/state POY contender.' },
      { low: 76, high: 79, label: 'High-Impact Starter / Core Winner',
        text: 'Primary reason strong CCCAA teams win. All-Conference / All-State lock.' },
      { low: 72, high: 75, label: 'Solid Starter / Top-Five Rotation Lock',
        text: 'Reliable starter value. 25+ MPG. Consistent two-way contribution.' },
      { low: 69, high: 71, label: 'Trusted Rotation / Big-Minute Contributor',
        text: 'Top 6-8 rotation. 18–25 MPG.' },
      { low: 66, high: 68, label: 'Reliable Bench / Rotation Piece',
        text: '12–18 MPG.' },
      { low: 63, high: 65, label: 'Situational Specialist / Depth',
        text: '8–12 MPG.' },
      { low: 60, high: 62, label: 'Limited Bench / Emergency Depth',
        text: '5–10 MPG.' },
      { low: 57, high: 59, label: 'Fringe Roster / Non-Rotation',
        text: 'On the roster, not in the plan.' },
      { low: 54, high: 56, label: 'Developmental Redshirt / Project',
        text: 'Not viable currently.' },
      { low: 51, high: 53, label: 'Practice Squad / Walk-On',
        text: 'Roster filler.' },
      { low: 0,  high: 50, label: 'Below CCCAA Viability',
        text: 'Below CCCAA competitive threshold.' },
    ],
  },

  njcaa_d2: {
    displayName: 'NJCAA Division II',
    lambda: 0.750,
    anchor: 'Strong programs across Midwest/South. Partial scholarships. Regional recruiting. Transfer-focused toward NCAA D2 or NAIA.',
    tiers: [
      { low: 82, high: 100, label: 'NJCAA D2 Player of the Year Lock / Elite National Standout',
        text: 'National-level JUCO D2 force. High raw production with sustainable efficiency. Carries team to national tournament contention.' },
      { low: 78, high: 81, label: 'Franchise Anchor / Top NJCAA D2 All-American',
        text: 'Clear #1 option. Defines team success. Conference POY contender.' },
      { low: 74, high: 77, label: 'High-Impact Starter / Core Winner',
        text: 'Primary reason elite JUCO D2 teams win. All-Conference / All-Region lock.' },
      { low: 70, high: 73, label: 'Solid Starter / Top-Five Rotation Lock',
        text: 'Reliable starter value. 25+ MPG. Consistent two-way contribution.' },
      { low: 67, high: 69, label: 'Trusted Rotation / Big-Minute Contributor',
        text: 'Top 6-8 rotation. 18–25 MPG.' },
      { low: 64, high: 66, label: 'Reliable Bench / Rotation Piece',
        text: '12–18 MPG.' },
      { low: 61, high: 63, label: 'Situational Specialist / Depth',
        text: '8–12 MPG.' },
      { low: 58, high: 60, label: 'Limited Bench / Emergency Depth',
        text: '5–10 MPG.' },
      { low: 55, high: 57, label: 'Fringe Roster / Non-Rotation',
        text: 'On the roster, not in the plan.' },
      { low: 52, high: 54, label: 'Developmental Redshirt / Project',
        text: 'Not viable currently.' },
      { low: 49, high: 51, label: 'Practice Squad / Walk-On',
        text: 'Roster filler.' },
      { low: 0,  high: 48, label: 'Below NJCAA D2 Viability',
        text: 'Below JUCO D2 competitive threshold.' },
    ],
  },

  ncaa_d3: {
    displayName: 'NCAA Division III',
    lambda: 0.667,
    anchor: 'NESCAC, ODAC, MIAC, CCC, etc. No athletic scholarships. Academics-first. Strong local/regional recruiting.',
    tiers: [
      { low: 80, high: 100, label: 'D3 Player of the Year Lock / Elite National Standout',
        text: 'National-level D3 force. High raw production with sustainable efficiency. Carries team to national title contention.' },
      { low: 76, high: 79, label: 'Franchise Anchor / Top D3 All-American',
        text: 'Clear #1 option. Defines team success. Conference POY contender.' },
      { low: 72, high: 75, label: 'High-Impact Starter / Core Winner',
        text: 'Primary reason elite D3 teams win. All-Conference / All-Region lock.' },
      { low: 68, high: 71, label: 'Solid Starter / Top-Five Rotation Lock',
        text: 'Reliable starter value. 25+ MPG. Consistent two-way contribution.' },
      { low: 65, high: 67, label: 'Trusted Rotation / Big-Minute Contributor',
        text: 'Top 6-8 rotation. 18–25 MPG.' },
      { low: 62, high: 64, label: 'Reliable Bench / Rotation Piece',
        text: '12–18 MPG.' },
      { low: 59, high: 61, label: 'Situational Specialist / Depth',
        text: '8–12 MPG.' },
      { low: 56, high: 58, label: 'Limited Bench / Emergency Depth',
        text: '5–10 MPG.' },
      { low: 53, high: 55, label: 'Fringe Roster / Non-Rotation',
        text: 'On the roster, not in the plan.' },
      { low: 50, high: 52, label: 'Developmental Redshirt / Project',
        text: 'Not viable at competitive D3 level.' },
      { low: 47, high: 49, label: 'Practice Squad / Walk-On',
        text: 'Roster filler.' },
      { low: 0,  high: 46, label: 'Below D3 Viability',
        text: 'Below D3 competitive threshold.' },
    ],
  },

  njcaa_d3: {
    displayName: 'NJCAA Division III',
    lambda: 0.625,
    anchor: 'No athletic scholarships. Regional recruiting. Weaker schedules than scholarship JUCO. Transfer-development focus.',
    tiers: [
      { low: 78, high: 100, label: 'NJCAA D3 Player of the Year Lock / Elite National JUCO Standout',
        text: 'National-level JUCO D3 force. Dominant raw production. Carries team to national contention.' },
      { low: 74, high: 77, label: 'Franchise Anchor / Top NJCAA D3 All-American',
        text: 'Clear #1 option. Defines team success.' },
      { low: 70, high: 73, label: 'High-Impact Starter / Core Winner',
        text: 'Primary reason elite JUCO D3 teams win. All-Conference lock.' },
      { low: 66, high: 69, label: 'Solid Starter / Top-Five Rotation Lock',
        text: 'Reliable starter value. 25+ MPG.' },
      { low: 63, high: 65, label: 'Trusted Rotation / Big-Minute Contributor',
        text: 'Top 6-8 rotation. 18–25 MPG.' },
      { low: 60, high: 62, label: 'Reliable Bench / Rotation Piece',
        text: '12–18 MPG.' },
      { low: 57, high: 59, label: 'Situational Specialist / Depth',
        text: '8–12 MPG.' },
      { low: 54, high: 56, label: 'Limited Bench / Emergency Depth',
        text: '5–10 MPG.' },
      { low: 51, high: 53, label: 'Fringe Roster / Non-Rotation',
        text: 'On the roster, not in the plan.' },
      { low: 48, high: 50, label: 'Developmental Redshirt / Project',
        text: 'Not viable currently.' },
      { low: 45, high: 47, label: 'Practice Squad / Walk-On',
        text: 'Roster filler.' },
      { low: 0,  high: 44, label: 'Below NJCAA D3 Viability',
        text: 'Below JUCO D3 competitive threshold.' },
    ],
  },

  uscaa: {
    displayName: 'USCAA',
    lambda: 0.583,
    anchor: 'Small-school and independent programs. No/limited athletic scholarships. Heavy emphasis on development and upward transfer.',
    tiers: [
      { low: 76, high: 100, label: 'USCAA Player of the Year Lock / Elite National Standout',
        text: 'National-level USCAA force who overwhelms the ecosystem. Calibration: Kalejaiye (86, Lincoln — 29.8 PPG at home, 22.4 PPG vs D1, .372 3P% on 78 D1 attempts, POY Lock who transcends the level). Williams (79, Lincoln — 22.0/9.1/3.4/2.2 at home, 14.6 PPG vs D1).' },
      { low: 72, high: 75, label: 'Franchise Anchor / Top USCAA All-American',
        text: 'Clear #1 option. Defines team success. Calibration: McKesey (73, Lincoln — 15/7.2/6.0 at home, triple-double threat, but zero jump shot limits ceiling). Chatelain (73, Lincoln — 10.6/7.3/1.5 BPG, rim protection translates to D1).' },
      { low: 68, high: 71, label: 'High-Impact Starter / Core Winner',
        text: 'Primary reason elite USCAA teams win. All-Conference lock.' },
      { low: 64, high: 67, label: 'Solid Starter / Top-Five Rotation Lock',
        text: 'Reliable starter value. 25+ MPG. Calibration: Hernandez (66, Lincoln — 10.9 PPG, .390 3P% at home, but collapses vs D1).' },
      { low: 61, high: 63, label: 'Trusted Rotation / Big-Minute Contributor',
        text: 'Top 6-8 rotation. Calibration: Plantey (63, Lincoln — 5\'8", starts every game, 3 steals vs D1 Pepperdine). Wall (61, Lincoln — .400 3P% at home, bench shooter).' },
      { low: 58, high: 60, label: 'Reliable Bench / Rotation Piece',
        text: '12–18 MPG. Calibration: Diomande (59, Lincoln — 6\'6" backup big, consistent across levels).' },
      { low: 55, high: 57, label: 'Situational Specialist / Depth',
        text: '8–12 MPG.' },
      { low: 52, high: 54, label: 'Limited Bench / Emergency Depth',
        text: '5–10 MPG.' },
      { low: 49, high: 51, label: 'Fringe Roster / Non-Rotation',
        text: 'On the roster, not in the plan.' },
      { low: 46, high: 48, label: 'Developmental Redshirt / Project',
        text: 'Not viable currently.' },
      { low: 43, high: 45, label: 'Practice Squad / Walk-On',
        text: 'Roster filler.' },
      { low: 0,  high: 42, label: 'Below USCAA Viability',
        text: 'Below USCAA competitive threshold.' },
    ],
  },

  nccaa_d1: {
    displayName: 'NCCAA Division I',
    lambda: 0.542,
    anchor: 'Faith-based institutional focus. Scholarship variability. Heavy emphasis on development, culture, and upward transfer.',
    tiers: [
      { low: 74, high: 100, label: 'NCCAA D1 Player of the Year Lock / Elite National Standout',
        text: 'National-level NCCAA force who overwhelms the ecosystem. Dominant raw production relative to schedule.' },
      { low: 70, high: 73, label: 'Franchise Anchor / Top NCCAA All-American',
        text: 'Clear #1 option. Defines team success. Closes games consistently.' },
      { low: 66, high: 69, label: 'High-Impact Starter / Core Winner',
        text: 'Primary reason elite NCCAA teams win. All-Conference lock.' },
      { low: 62, high: 65, label: 'Solid Starter / Top-Five Rotation Lock',
        text: 'Reliable starter value. 25+ MPG.' },
      { low: 59, high: 61, label: 'Trusted Rotation / Big-Minute Contributor',
        text: 'Top 6-8 rotation. 18–25 MPG.' },
      { low: 56, high: 58, label: 'Reliable Bench / Rotation Piece',
        text: '12–18 MPG.' },
      { low: 53, high: 55, label: 'Situational Specialist / Depth',
        text: '8–12 MPG.' },
      { low: 50, high: 52, label: 'Limited Bench / Emergency Depth',
        text: '5–10 MPG.' },
      { low: 47, high: 49, label: 'Fringe Roster / Non-Rotation',
        text: 'On the roster, not in the plan.' },
      { low: 44, high: 46, label: 'Developmental Redshirt / Project',
        text: 'Not viable currently.' },
      { low: 41, high: 43, label: 'Practice Squad / Walk-On',
        text: 'Roster filler.' },
      { low: 0,  high: 40, label: 'Below NCCAA D1 Viability',
        text: 'Below NCCAA competitive threshold.' },
    ],
  },

  nccaa_d2: {
    displayName: 'NCCAA Division II',
    lambda: 0.500,
    anchor: 'No athletic scholarships or extremely limited aid. Faith-based, academic, mission-first institutions. Thin rosters.',
    tiers: [
      { low: 72, high: 100, label: 'NCCAA D2 Player of the Year Lock / Elite Division Standout',
        text: 'Dominant force within the NCCAA D2 ecosystem. Overwhelms D2 competition consistently. Primary offensive and/or defensive engine.' },
      { low: 68, high: 71, label: 'Franchise Anchor / NCCAA D2 All-Region Leader',
        text: 'Defining identity player. Clear #1 option. Offensive or defensive focal point. Reliable closer.' },
      { low: 64, high: 67, label: 'High-Impact Starter / Core Winner',
        text: 'Primary reason strong NCCAA D2 teams win. All-Conference lock.' },
      { low: 60, high: 63, label: 'Solid Starter / Top-Five Rotation Lock',
        text: 'Reliable starter value. 25+ MPG.' },
      { low: 56, high: 59, label: 'Trusted Rotation / Big-Minute Contributor',
        text: 'Top 6-7 rotation. 18–25 MPG.' },
      { low: 53, high: 55, label: 'Reliable Bench / Rotation Piece',
        text: '12–18 MPG.' },
      { low: 50, high: 52, label: 'Situational Specialist / Depth',
        text: '8–12 MPG.' },
      { low: 47, high: 49, label: 'Limited Bench / Emergency Depth',
        text: '5–10 MPG.' },
      { low: 44, high: 46, label: 'Fringe Roster / Non-Rotation',
        text: 'Rostered but not in the competitive plan.' },
      { low: 41, high: 43, label: 'Developmental Redshirt / Project',
        text: 'Not viable currently.' },
      { low: 38, high: 40, label: 'Practice Squad / Walk-On',
        text: 'Structural roster filler.' },
      { low: 0,  high: 37, label: 'Below NCCAA D2 Viability',
        text: 'Below NCCAA D2 competitive threshold.' },
    ],
  },

};

// ── Level Ordering (by lambda, descending) ───────────────────────────────────

const LEVEL_ORDER: string[] = [
  'ncaa_d1_high_major',
  'ncaa_d1_mid_major',
  'ncaa_d1_low_major',
  'ncaa_d2',
  'njcaa_d1',
  'naia',
  'cccaa',
  'njcaa_d2',
  'ncaa_d3',
  'njcaa_d3',
  'uscaa',
  'nccaa_d1',
  'nccaa_d2',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function findTierIndex(legend: LevelLegend, kr: number): number {
  return legend.tiers.findIndex(t => kr >= t.low && kr <= t.high);
}

function formatTierBlock(tier: LegendTier, prefix: string): string {
  return `${prefix} ${tier.low === 0 ? `<${tier.high + 1}` : `${tier.low}–${tier.high}`} — ${tier.label}\n${tier.text}`;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns the matching legend tier (±1 band) for a given KR + level key,
 * plus a level tier map showing what the SAME KR reads at adjacent levels.
 *
 * KR is universal — one number, never modified. The same KR value is looked
 * up directly in each adjacent level's legend (per File 01 §Multi-Level:
 * "One player, one KR range, multiple legend tier labels depending on the
 * level environment.")
 *
 * Returns an empty string if the level is unknown or KR is not provided.
 */
export function getTierContext(kr: number | null, levelKey: string): string {
  if (kr === null || !levelKey) return '';

  const legend = LEGENDS[levelKey];
  if (!legend) return '';

  const idx = findTierIndex(legend, kr);
  if (idx === -1) return '';

  const lines: string[] = [
    `LEGEND CONTEXT — ${legend.displayName} KR ${kr}:`,
    `(${legend.anchor})`,
    '',
  ];

  // Tier above (if exists)
  if (idx > 0) {
    lines.push(formatTierBlock(legend.tiers[idx - 1], '▲ One tier above:'));
    lines.push('');
  }

  // Matching tier (full)
  lines.push(formatTierBlock(legend.tiers[idx], '★ Matching tier:'));
  lines.push('');

  // Tier below (if exists)
  if (idx < legend.tiers.length - 1) {
    lines.push(formatTierBlock(legend.tiers[idx + 1], '▼ One tier below:'));
    lines.push('');
  }

  // Level Tier Map: same KR read against ±2 adjacent levels
  // KR is universal — the same number, looked up in each level's own legend.
  const levelIdx = LEVEL_ORDER.indexOf(levelKey);
  if (levelIdx !== -1) {
    const adjacentKeys: string[] = [];
    if (levelIdx > 1) adjacentKeys.push(LEVEL_ORDER[levelIdx - 2]);
    if (levelIdx > 0) adjacentKeys.push(LEVEL_ORDER[levelIdx - 1]);
    if (levelIdx < LEVEL_ORDER.length - 1) adjacentKeys.push(LEVEL_ORDER[levelIdx + 1]);
    if (levelIdx < LEVEL_ORDER.length - 2) adjacentKeys.push(LEVEL_ORDER[levelIdx + 2]);

    if (adjacentKeys.length > 0) {
      lines.push(`LEVEL TIER MAP (KR ${kr} read against adjacent level legends):`);
      for (const key of adjacentKeys) {
        const adj = LEGENDS[key];
        if (!adj) continue;
        const adjIdx     = findTierIndex(adj, kr);
        const adjLabel   = adjIdx !== -1 ? adj.tiers[adjIdx].label : 'out of range';
        lines.push(`  ${adj.displayName}: ${adjLabel}`);
      }
    }
  }

  return lines.join('\n');
}

/**
 * Returns a compact display name for a level key (e.g. "NCAA D1 High-Major").
 * Falls back to the raw key if not found.
 */
export function getLevelDisplayName(levelKey: string): string {
  return LEGENDS[levelKey]?.displayName ?? levelKey;
}
