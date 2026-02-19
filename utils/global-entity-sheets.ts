/**
 * Global Entity Sheet Controller
 * Module-level register/open/close for entity card sheets.
 * Follows the same pattern as global-team-sheet.ts.
 */

export interface TeamCardData {
  name: string;
  record?: string;
  confRecord?: string;
  conference?: string;
  teamKR?: number;
  logoUri?: string;
  category?: string;
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
}

export interface CoachCardData {
  name: string;
  title: string;
  bio?: string;
  recordAtInstitution?: string;
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

type OpenTeamCard = (data: TeamCardData) => void;
type OpenPlayerCard = (data: PlayerCardData) => void;
type OpenCoachCard = (data: CoachCardData) => void;
type OpenDriverCard = (data: DriverCardData) => void;
type OpenCrewCard = (data: CrewCardData) => void;
type OpenPersonCard = (data: PersonCardData) => void;
type OpenMinistryCard = (data: MinistryCardData) => void;
type OpenLeaderCard = (data: LeaderCardData) => void;
type CloseHandler = () => void;

let _openTeamCard: OpenTeamCard | null = null;
let _closeTeamCard: CloseHandler | null = null;
let _openPlayerCard: OpenPlayerCard | null = null;
let _closePlayerCard: CloseHandler | null = null;
let _openCoachCard: OpenCoachCard | null = null;
let _closeCoachCard: CloseHandler | null = null;
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

export function registerEntitySheetHandlers(handlers: {
  openTeamCard: OpenTeamCard;
  closeTeamCard: CloseHandler;
  openPlayerCard: OpenPlayerCard;
  closePlayerCard: CloseHandler;
  openCoachCard: OpenCoachCard;
  closeCoachCard: CloseHandler;
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
}) {
  _openTeamCard = handlers.openTeamCard;
  _closeTeamCard = handlers.closeTeamCard;
  _openPlayerCard = handlers.openPlayerCard;
  _closePlayerCard = handlers.closePlayerCard;
  _openCoachCard = handlers.openCoachCard;
  _closeCoachCard = handlers.closeCoachCard;
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
}

export function openTeamCard(data: TeamCardData) {
  _openTeamCard?.(data);
}

export function closeTeamCard() {
  _closeTeamCard?.();
}

export function openPlayerCard(data: PlayerCardData) {
  _openPlayerCard?.(data);
}

export function closePlayerCard() {
  _closePlayerCard?.();
}

export function openCoachCard(data: CoachCardData) {
  _openCoachCard?.(data);
}

export function closeCoachCard() {
  _closeCoachCard?.();
}

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
