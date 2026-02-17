/**
 * Game Plan V2 — Type definitions for the 11-section pregame command center.
 */

// ── Staff Assignment ──

export type StaffRole = 'HC' | 'AC1' | 'AC2' | 'AC3' | 'Video';

export type AssignmentStatus = 'not_started' | 'in_progress' | 'ready' | 'approved';

export interface StaffAssignment {
  role: StaffRole;
  name: string;
  sections: number[];
  status: AssignmentStatus;
}

// ── Scout Confidence ──

export type DataTier = 'Tier 1' | 'Tier 2' | 'Tier 3';

export interface ScoutConfidenceGate {
  pct: number;
  dataTier: DataTier;
  whyNotHigher: string[];
  traceNotes: string[];
}

// ── S01 Decision Summary ──

export type DomainIcon = 'defensive' | 'offensive' | 'volatility';

export interface DecisionBullet {
  domain: DomainIcon;
  text: string;
}

export interface DoNotBreakRule {
  rule: string;
  consequence: string;
}

// ── S02 Opp Offense → Our D ──

export interface OSIE {
  system: string;
  pace: string;
  initiators: string[];
}

export interface ShotDietEntry {
  zone: string;
  freqPct: number;
  fgPct: number;
}

export interface IfThenCard {
  ifCondition: string;
  thenResponse: string;
}

export interface MatchupOverlay {
  ourPlayer: string;
  theirPlayer: string;
  note: string;
}

export interface OppOffenseData {
  osie: OSIE;
  shotDiet: ShotDietEntry[];
  pressurePoints: string[];
  defensiveCounters: string[];
  ifThen: IfThenCard[];
  matchupOverlays: MatchupOverlay[];
}

// ── S03 Opp Defense → Our O ──

export interface DSIE {
  system: string;
  pressure: string;
  pnrCoverage: string;
  closeout: string;
}

export interface OppDefenseData {
  dsie: DSIE;
  offensiveCounters: string[];
  triggers: string[];
}

// ── S04 Shot Profile ──

export type ShotPermission = 'green' | 'yellow' | 'red';

export interface TeamZone {
  zone: string;
  attemptsPct: number;
  efgPct: number;
}

export interface PlayerPermission {
  name: string;
  jersey: string;
  zones: { zone: string; permission: ShotPermission }[];
}

export interface ShotProfileData {
  teamZones: TeamZone[];
  playerPermissions: PlayerPermission[];
}

// ── S05 Actions Library ──

export type RiskLevel = 'low' | 'medium' | 'high';

export interface ActionCard {
  name: string;
  trigger: string;
  primaryOption: string;
  counter: string;
  bailout: string;
  ourCounter: string;
  risk: RiskLevel;
}

// ── S06 Situations Package ──

export type SituationType = 'ATO' | 'EOH' | 'late' | 'press' | 'zone';

export interface SituationPlay {
  type: SituationType;
  name: string;
  description: string;
  selected: boolean;
}

// ── S07 Rotation Board ──

export type PositionGroup = 'G' | 'W' | 'F' | 'C';

export interface RotationPlayer {
  name: string;
  jersey: string;
  posGroup: PositionGroup;
  offKR: number;
  defKR: number;
  archetype: string;
  threat: string;
  rule: string;
  minutes: number;
  starter: boolean;
  foulFragile: boolean;
}

// ── S08 Player Guard Cards ──

export interface PlayerGuardCard {
  name: string;
  jersey: string;
  threatType: string;
  directionality: string;
  shotMapZones: { zone: string; tendency: 'hot' | 'warm' | 'cold' }[];
  coverage: string;
  toStress: string;
  foulProfile: string;
  guardRules: string[];
  plan: string;
}

// ── S09 Constraints & Risk ──

export type ConstraintSource = 'medical' | 'foul' | 'matchup' | 'scheme';

export interface HardConstraint {
  text: string;
  source: ConstraintSource;
}

export type Severity = 1 | 2 | 3 | 4 | 5;

export interface Risk {
  text: string;
  severity: Severity;
}

export interface ConstraintsRiskData {
  hardConstraints: HardConstraint[];
  risks: Risk[];
  volatilityDrivers: string[];
  whatNotToDo: string[];
}

// ── S11 Practice Translation ──

export interface DrillSegment {
  name: string;
  durationMin: number;
  tiedToSection: number;
  leadCoach: StaffRole;
  successCue: string;
}

// ── Full Packet ──

export interface GamePlanV2Packet {
  gameId: string;
  opponent: string;
  date: string;
  location: string;
  homeAway: 'Home' | 'Away';
  scoutConfidence: ScoutConfidenceGate;
  staffAssignments: StaffAssignment[];
  decisionSummary: {
    bullets: DecisionBullet[];
    doNotBreak: DoNotBreakRule[];
  };
  oppOffense: OppOffenseData;
  oppDefense: OppDefenseData;
  shotProfile: ShotProfileData;
  actionsLibrary: ActionCard[];
  situationsPackage: SituationPlay[];
  rotationBoard: RotationPlayer[];
  playerCards: PlayerGuardCard[];
  constraintsRisk: ConstraintsRiskData;
  practiceTranslation: DrillSegment[];
}

// ── Section metadata ──

export const SECTION_NAMES: Record<number, string> = {
  1: 'Decision Summary',
  2: 'Opp Offense → Our D',
  3: 'Opp Defense → Our O',
  4: 'Shot Profile',
  5: 'Actions Library',
  6: 'Situations Package',
  7: 'Rotation Board',
  8: 'Player Cards',
  9: 'Constraints & Risk',
  10: 'Scout Confidence',
  11: 'Practice Translation',
};

export const STAFF_SECTION_MAP: Record<StaffRole, number[]> = {
  HC: [1, 6, 9],
  AC1: [2, 5],
  AC2: [3],
  AC3: [4, 7, 8],
  Video: [10, 11],
};
