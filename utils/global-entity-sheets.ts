/**
 * Global Entity Sheet Controller
 * Module-level register/open/close for entity card sheets.
 *
 * v3 — Single sheet per entity type (no quick/full split):
 *   PlayerSheet (4 tabs) / TeamSheet (4 tabs) / CoachSheet (3 tabs)
 */

export interface TeamCardData {
  name: string;
  record?: string;
  confRecord?: string;
  conference?: string;
  teamKR?: number;
  logoUri?: string;
  category?: string;
  offKR?: number;
  defKR?: number;
  level?: string;
  osie?: string;
  osieScore?: number;
  dsie?: string;
  dsieScore?: number;
  coaches?: { name: string; title: string; tendencies?: string }[];
  topContributors?: { name: string; position: string; kr?: number }[];
  strengths?: string[];
  risks?: string[];
  coverageTag?: string;
}

export interface PlayerCardData {
  name: string;
  number: string;
  position: string;
  height: string;
  weight: number;
  classYear: string;
  hometown?: string;
  previousSchool?: string;
  kr?: number;
  teamColor?: string;
  ppg?: number;
  rpg?: number;
  apg?: number;
  // Extended fields for full intelligence display
  playerId?: string;
  school?: string;
  conference?: string;
  levelKey?: string;
  levelDisplay?: string;
  offKR?: number;
  defKR?: number;
  archetype?: string;
  confidence?: number;
  clusters?: Record<string, number>;
  spg?: number;
  bpg?: number;
  topg?: number;
  fgPct?: number;
  threePct?: number;
  ftPct?: number;
  mpg?: number;
  gp?: number;
  bprAvg?: number;
  portalEntryDate?: string | null;
  scholarshipPct?: number;
  nilAmount?: number;
  overallFitPct?: number;
  status?: string;
}

export interface CoachCardData {
  name: string;
  title: string;
  bio?: string;
  recordAtInstitution?: string;
  tenure?: string;
  offSystem?: string;
  defSystem?: string;
  knownLevers?: string[];
  tendencies?: string;
}

export interface DriverCardData {
  name: string;
  number: string;
  team: string;
  points?: number;
  wins?: number;
  podiums?: number;
  category?: string;
}

export interface CrewCardData {
  name: string;
  role: string;
  team: string;
  pitScore?: number;
}

export interface PersonCardData {
  name: string;
  role: string;
  ministries?: string[];
  status?: string;
}

export interface MinistryCardData {
  name: string;
  icon?: string;
  mission?: string;
  volunteers?: number;
  leader?: string;
}

export interface LeaderCardData {
  name: string;
  title: string;
  ministries?: string[];
  bio?: string;
}

export interface EventCardData {
  title: string;
  date?: string;
  time?: string;
  location?: string;
  notes?: string;
  type?: string; // 'game' | 'practice' | 'meeting' | 'other'
  linkedGamePlan?: string;
  linkedSimulation?: string;
  linkedVideo?: string;
}

// ── Handler types ──

type OpenTeamCard = (data: TeamCardData) => void;
type OpenPlayerCard = (data: PlayerCardData) => void;
type OpenCoachCard = (data: CoachCardData) => void;
type OpenDriverCard = (data: DriverCardData) => void;
type OpenCrewCard = (data: CrewCardData) => void;
type OpenPersonCard = (data: PersonCardData) => void;
type OpenMinistryCard = (data: MinistryCardData) => void;
type OpenLeaderCard = (data: LeaderCardData) => void;
type OpenEventCard = (data: EventCardData) => void;
type CloseHandler = () => void;

// ── Module-level handler slots ──

// Sports sheets (single sheet per entity)
let _openTeamSheet: OpenTeamCard | null = null;
let _closeTeamSheet: CloseHandler | null = null;
let _openCoachSheet: OpenCoachCard | null = null;
let _closeCoachSheet: CloseHandler | null = null;
let _openPlayerSheet: OpenPlayerCard | null = null;
let _closePlayerSheet: CloseHandler | null = null;

// Non-sports entity sheets (unchanged)
let _openDriverCard: OpenDriverCard | null = null;
let _closeDriverCard: CloseHandler | null = null;
let _openCrewCard: OpenCrewCard | null = null;
let _closeCrewCard: CloseHandler | null = null;
let _openPersonCard: OpenPersonCard | null = null;
let _closePersonCard: CloseHandler | null = null;
let _openMinistryCard: OpenMinistryCard | null = null;
let _closeMinistryCard: CloseHandler | null = null;
let _openLeaderCard: OpenLeaderCard | null = null;
let _closeLeaderCard: CloseHandler | null = null;
let _openEventSheet: OpenEventCard | null = null;
let _closeEventSheet: CloseHandler | null = null;

export function registerEntitySheetHandlers(handlers: {
  // Sports sheets (single sheet per entity)
  openTeamSheet: OpenTeamCard;
  closeTeamSheet: CloseHandler;
  openCoachSheet: OpenCoachCard;
  closeCoachSheet: CloseHandler;
  openPlayerSheet: OpenPlayerCard;
  closePlayerSheet: CloseHandler;
  // Non-sports (optional)
  openDriverCard?: OpenDriverCard;
  closeDriverCard?: CloseHandler;
  openCrewCard?: OpenCrewCard;
  closeCrewCard?: CloseHandler;
  openPersonCard?: OpenPersonCard;
  closePersonCard?: CloseHandler;
  openMinistryCard?: OpenMinistryCard;
  closeMinistryCard?: CloseHandler;
  openLeaderCard?: OpenLeaderCard;
  closeLeaderCard?: CloseHandler;
  openEventSheet?: OpenEventCard;
  closeEventSheet?: CloseHandler;
}) {
  _openTeamSheet = handlers.openTeamSheet;
  _closeTeamSheet = handlers.closeTeamSheet;
  _openCoachSheet = handlers.openCoachSheet;
  _closeCoachSheet = handlers.closeCoachSheet;
  _openPlayerSheet = handlers.openPlayerSheet;
  _closePlayerSheet = handlers.closePlayerSheet;

  _openDriverCard = handlers.openDriverCard ?? null;
  _closeDriverCard = handlers.closeDriverCard ?? null;
  _openCrewCard = handlers.openCrewCard ?? null;
  _closeCrewCard = handlers.closeCrewCard ?? null;
  _openPersonCard = handlers.openPersonCard ?? null;
  _closePersonCard = handlers.closePersonCard ?? null;
  _openMinistryCard = handlers.openMinistryCard ?? null;
  _closeMinistryCard = handlers.closeMinistryCard ?? null;
  _openLeaderCard = handlers.openLeaderCard ?? null;
  _closeLeaderCard = handlers.closeLeaderCard ?? null;
  _openEventSheet = handlers.openEventSheet ?? null;
  _closeEventSheet = handlers.closeEventSheet ?? null;
}

// ── Sports Sheet API ──

export function openTeamSheet(data: TeamCardData) {
  _openTeamSheet?.(data);
}

export function closeTeamSheet() {
  _closeTeamSheet?.();
}

export function openCoachSheet(data: CoachCardData) {
  _openCoachSheet?.(data);
}

export function closeCoachSheet() {
  _closeCoachSheet?.();
}

export function openPlayerSheet(data: PlayerCardData) {
  _openPlayerSheet?.(data);
}

export function closePlayerSheet() {
  _closePlayerSheet?.();
}

// ── Backward-compatible aliases ──

export function openTeamCard(data: TeamCardData) {
  _openTeamSheet?.(data);
}

export function closeTeamCard() {
  _closeTeamSheet?.();
}

export function openPlayerCard(data: PlayerCardData) {
  _openPlayerSheet?.(data);
}

export function closePlayerCard() {
  _closePlayerSheet?.();
}

export function openCoachCard(data: CoachCardData) {
  _openCoachSheet?.(data);
}

export function closeCoachCard() {
  _closeCoachSheet?.();
}

// ── Non-sports entity sheets (unchanged) ──

export function openDriverCard(data: DriverCardData) {
  _openDriverCard?.(data);
}

export function closeDriverCard() {
  _closeDriverCard?.();
}

export function openCrewCard(data: CrewCardData) {
  _openCrewCard?.(data);
}

export function closeCrewCard() {
  _closeCrewCard?.();
}

export function openPersonCard(data: PersonCardData) {
  _openPersonCard?.(data);
}

export function closePersonCard() {
  _closePersonCard?.();
}

export function openMinistryCard(data: MinistryCardData) {
  _openMinistryCard?.(data);
}

export function closeMinistryCard() {
  _closeMinistryCard?.();
}

export function openLeaderCard(data: LeaderCardData) {
  _openLeaderCard?.(data);
}

export function closeLeaderCard() {
  _closeLeaderCard?.();
}

// ── Event Sheet ──

export function openEventSheet(data: EventCardData) {
  _openEventSheet?.(data);
}

export function closeEventSheet() {
  _closeEventSheet?.();
}
