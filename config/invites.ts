/**
 * KaNeXT OS — Invite Code Registry
 *
 * Each code is tied to an inviter/relationship path.
 * Codes are shareable (one code per inviter, not per invitee).
 *
 * Code determines:
 *   - Who invited this person (attribution)
 *   - Which onboarding video plays (personalization)
 *   - Which Dipson context loads initially
 */

export const INVITE_CODES: string[] = [
  // Legacy codes
  'KX-INVESTOR-2026',
  'KX-SEED-ROUND',
  'KX-PBD-001',
  // Spec codes
  'KX2026',
  'TOM2026',
  'PBD2026',
  'LINDY2026',
  'VINCE2026',
  'RAY2026',
  // Org codes
  'LU2026',
  'LU2026MBB',
  'ICCLA2026',
];

/** Attribution and personalization data per code */
export interface InviteCodeMeta {
  /** Human-readable inviter name */
  inviter: string;
  /** Which video plays during onboarding (null = general video) */
  videoKey: string | null;
  /** Initial Dipson section after entering the app */
  defaultSection: 'data-room' | 'basketball' | 'general';
}

export const INVITE_CODE_META: Record<string, InviteCodeMeta> = {
  KX2026:      { inviter: 'KaNeXT',          videoKey: 'general',    defaultSection: 'data-room' },
  TOM2026:     { inviter: 'Tom Ellsworth',   videoKey: 'tom',        defaultSection: 'data-room' },
  PBD2026:     { inviter: 'Patrick Bet-David', videoKey: 'pbd',      defaultSection: 'data-room' },
  LINDY2026:   { inviter: 'Lindy Li',        videoKey: 'general',    defaultSection: 'data-room' },
  VINCE2026:   { inviter: 'Vince Ellison',   videoKey: 'general',    defaultSection: 'data-room' },
  RAY2026:     { inviter: 'Ray Lewis',       videoKey: 'general',    defaultSection: 'data-room' },
  'KX-INVESTOR-2026': { inviter: 'KaNeXT',  videoKey: 'general',    defaultSection: 'data-room' },
  'KX-SEED-ROUND':    { inviter: 'KaNeXT',  videoKey: 'general',    defaultSection: 'data-room' },
  'KX-PBD-001':       { inviter: 'Patrick Bet-David', videoKey: 'pbd', defaultSection: 'data-room' },
  LU2026:      { inviter: 'Lincoln University', videoKey: null,      defaultSection: 'general' },
  'LU2026MBB': { inviter: 'LU Basketball',  videoKey: null,         defaultSection: 'basketball' },
  ICCLA2026:   { inviter: 'ICCLA',          videoKey: null,         defaultSection: 'general' },
};
