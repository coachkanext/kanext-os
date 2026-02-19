/**
 * Global Entity Sheet Controller
 * Module-level register/open/close for Team Card, Player Card, Coach Card sheets.
 * Follows the same pattern as global-team-sheet.ts.
 */

export interface TeamCardData {
  name: string;
  record: string;
  confRecord?: string;
  conference?: string;
  teamKR?: number;
  logoUri?: string;
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

type OpenTeamCard = (data: TeamCardData) => void;
type OpenPlayerCard = (data: PlayerCardData) => void;
type OpenCoachCard = (data: CoachCardData) => void;
type CloseHandler = () => void;

let _openTeamCard: OpenTeamCard | null = null;
let _closeTeamCard: CloseHandler | null = null;
let _openPlayerCard: OpenPlayerCard | null = null;
let _closePlayerCard: CloseHandler | null = null;
let _openCoachCard: OpenCoachCard | null = null;
let _closeCoachCard: CloseHandler | null = null;

export function registerEntitySheetHandlers(handlers: {
  openTeamCard: OpenTeamCard;
  closeTeamCard: CloseHandler;
  openPlayerCard: OpenPlayerCard;
  closePlayerCard: CloseHandler;
  openCoachCard: OpenCoachCard;
  closeCoachCard: CloseHandler;
}) {
  _openTeamCard = handlers.openTeamCard;
  _closeTeamCard = handlers.closeTeamCard;
  _openPlayerCard = handlers.openPlayerCard;
  _closePlayerCard = handlers.closePlayerCard;
  _openCoachCard = handlers.openCoachCard;
  _closeCoachCard = handlers.closeCoachCard;
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
