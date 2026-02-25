/**
 * Mock Alerts V2 — Program-level alerts for Sports → Alerts page.
 * Categories: Roster, Recruiting, Game Prep, Ops / Money.
 * Severity: High, Medium, Low.
 */

// =============================================================================
// TYPES
// =============================================================================

export type AlertSeverity = 'High' | 'Medium' | 'Low';
export type AlertCategory = 'Roster' | 'Recruiting' | 'Game Prep' | 'Ops';
export type AlertLinkedType = 'Player' | 'Recruit' | 'Game' | 'Event' | 'Budget';
export type AlertStatus = 'Open' | 'Resolved';

export interface Alert {
  alertId: string;
  orgId: string;
  programId: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  nextAction: string;
  dueAt?: string;
  linkedType: AlertLinkedType;
  linkedId: string;
  linkedLabel: string;
  status: AlertStatus;
  createdAt: string;
  /** Why this alert exists — 1–3 factual bullets */
  reasons: string[];
}

// =============================================================================
// MOCK DATA
// =============================================================================

export const ALERTS: Alert[] = [
  // ── HIGH ──
  {
    alertId: 'al-1',
    orgId: 'org-1',
    programId: 'prog-1',
    category: 'Roster',
    severity: 'High',
    title: 'David Blake — Injury Status Change',
    nextAction: 'Confirm availability with training staff before game day',
    dueAt: 'Feb 26',
    linkedType: 'Player',
    linkedId: '6',
    linkedLabel: 'David Blake (#6, PG)',
    status: 'Open',
    createdAt: 'Feb 23',
    reasons: [
      'Blake reported left ankle soreness after Tuesday practice.',
      'Limited participation in Wednesday and Thursday sessions.',
      'Game vs Dakota State is Friday — roster decision needed by Thursday 5 PM.',
    ],
  },
  {
    alertId: 'al-2',
    orgId: 'org-1',
    programId: 'prog-1',
    category: 'Game Prep',
    severity: 'High',
    title: 'Game Plan Not Generated — Dakota State',
    nextAction: 'Generate game plan in Nexus before Thursday shootaround',
    dueAt: 'Feb 27',
    linkedType: 'Game',
    linkedId: 'game-next',
    linkedLabel: 'vs Dakota State — Feb 28',
    status: 'Open',
    createdAt: 'Feb 24',
    reasons: [
      'Next game is in 4 days and no game plan has been generated.',
      'Scout confidence for Dakota State is currently at 72% — sufficient to run.',
      'Last game plan was generated 8 days ago (vs Bellevue).',
    ],
  },
  {
    alertId: 'al-3',
    orgId: 'org-1',
    programId: 'prog-1',
    category: 'Game Prep',
    severity: 'High',
    title: 'Simulation Not Run — Dakota State',
    nextAction: 'Run simulation in Nexus to generate pregame projections',
    dueAt: 'Feb 27',
    linkedType: 'Game',
    linkedId: 'game-next',
    linkedLabel: 'vs Dakota State — Feb 28',
    status: 'Open',
    createdAt: 'Feb 24',
    reasons: [
      'No simulation snapshot exists for the Dakota State game.',
      'Simulation provides win probability, scenario analysis, and matchup lenses.',
      'Recommended: run at least 48 hours before game day.',
    ],
  },
  {
    alertId: 'al-4',
    orgId: 'org-1',
    programId: 'prog-1',
    category: 'Recruiting',
    severity: 'High',
    title: 'Priority Recruit — No Contact in 14 Days',
    nextAction: 'Schedule follow-up call or text with recruit',
    dueAt: 'Feb 25',
    linkedType: 'Recruit',
    linkedId: 'rec-1',
    linkedLabel: 'Jaylen Thomas (2026 PG, Top 50)',
    status: 'Open',
    createdAt: 'Feb 22',
    reasons: [
      'Jaylen Thomas is tagged "Priority" on the recruiting board.',
      'Last contact was Feb 8 — 17 days ago.',
      'Rival programs (Providence, Rocky Mountain) have contacted him since.',
    ],
  },

  // ── MEDIUM ──
  {
    alertId: 'al-5',
    orgId: 'org-1',
    programId: 'prog-1',
    category: 'Roster',
    severity: 'Medium',
    title: 'Marcus Collins — 3PT Regression Alert',
    nextAction: 'Review film and adjust shooting plan with Coach Pearson',
    linkedType: 'Player',
    linkedId: '7',
    linkedLabel: 'Marcus Collins (#7, CG)',
    status: 'Open',
    createdAt: 'Feb 22',
    reasons: [
      'Collins 3PT% dropped from 38% to 29% over the last 3 games.',
      'Film shows elbow flying out on pull-up 3s — mechanics breakdown.',
      'Development page has flagged this in Evidence Log.',
    ],
  },
  {
    alertId: 'al-6',
    orgId: 'org-1',
    programId: 'prog-1',
    category: 'Recruiting',
    severity: 'Medium',
    title: 'Visit Scheduled — No Follow-Up Logged',
    nextAction: 'Log visit notes and next steps in recruiting board',
    linkedType: 'Recruit',
    linkedId: 'rec-2',
    linkedLabel: 'DeAndre Mitchell (2026 W, Top 100)',
    status: 'Open',
    createdAt: 'Feb 20',
    reasons: [
      'DeAndre Mitchell visited campus on Feb 15.',
      'No follow-up notes have been logged in the recruiting board.',
      'Best practice: log within 48 hours of visit.',
    ],
  },
  {
    alertId: 'al-7',
    orgId: 'org-1',
    programId: 'prog-1',
    category: 'Ops',
    severity: 'Medium',
    title: 'NIL Budget at 85% Utilization',
    nextAction: 'Review remaining NIL allocations with Program Leadership',
    linkedType: 'Budget',
    linkedId: 'nil-1',
    linkedLabel: 'NIL Budget — 2025-26',
    status: 'Open',
    createdAt: 'Feb 21',
    reasons: [
      'NIL budget is at 85% utilization with 6 weeks remaining in the season.',
      'Two pending NIL commitments would push utilization to 92%.',
      'Program Leadership approval required for allocations above 90%.',
    ],
  },
  {
    alertId: 'al-8',
    orgId: 'org-1',
    programId: 'prog-1',
    category: 'Game Prep',
    severity: 'Medium',
    title: 'Scout Confidence Below Threshold — Providence',
    nextAction: 'Request updated scouting data or run Nexus analysis',
    linkedType: 'Game',
    linkedId: 'game-prov',
    linkedLabel: 'vs Providence — Mar 4',
    status: 'Open',
    createdAt: 'Feb 23',
    reasons: [
      'Scout confidence for Providence is at 58% — below 65% threshold.',
      'Providence game is in 7 days.',
      'Missing: recent film (last 3 games) and updated roster data.',
    ],
  },

  // ── LOW ──
  {
    alertId: 'al-9',
    orgId: 'org-1',
    programId: 'prog-1',
    category: 'Roster',
    severity: 'Low',
    title: 'Jalen Washington — Conditioning Milestone',
    nextAction: 'Update rotation eligibility status',
    linkedType: 'Player',
    linkedId: '10',
    linkedLabel: 'Jalen Washington (#10, B)',
    status: 'Open',
    createdAt: 'Feb 22',
    reasons: [
      'Washington completed all 5 conditioning benchmarks.',
      'Now eligible for expanded rotation minutes.',
      'Development page has logged this as a milestone.',
    ],
  },
  {
    alertId: 'al-10',
    orgId: 'org-1',
    programId: 'prog-1',
    category: 'Ops',
    severity: 'Low',
    title: 'Travel Booking Deadline — Rocky Mountain',
    nextAction: 'Confirm travel arrangements with operations staff',
    dueAt: 'Mar 5',
    linkedType: 'Event',
    linkedId: 'event-travel',
    linkedLabel: 'Away @ Rocky Mountain — Mar 8',
    status: 'Open',
    createdAt: 'Feb 20',
    reasons: [
      'Away game at Rocky Mountain is in 11 days.',
      'Hotel and bus booking deadline is Mar 5.',
      'Operations staff needs final headcount by Mar 3.',
    ],
  },
  {
    alertId: 'al-11',
    orgId: 'org-1',
    programId: 'prog-1',
    category: 'Recruiting',
    severity: 'Low',
    title: 'Recruit Moved to Committed — Not Signed',
    nextAction: 'Confirm signing timeline with compliance',
    linkedType: 'Recruit',
    linkedId: 'rec-3',
    linkedLabel: 'Marcus Williams (2026 CG)',
    status: 'Open',
    createdAt: 'Feb 18',
    reasons: [
      'Marcus Williams status changed to "Committed" on Feb 15.',
      'NLI has not been signed yet.',
      'Compliance requires signed NLI within 30 days of commitment.',
    ],
  },
  {
    alertId: 'al-12',
    orgId: 'org-1',
    programId: 'prog-1',
    category: 'Ops',
    severity: 'Low',
    title: 'Scholarship Constraint — 1 Remaining',
    nextAction: 'Review scholarship allocation plan with Program Leadership',
    linkedType: 'Budget',
    linkedId: 'scholarship-1',
    linkedLabel: 'Scholarship Pool — 2026-27',
    status: 'Open',
    createdAt: 'Feb 19',
    reasons: [
      'Only 1 full scholarship remaining for 2026-27 cycle.',
      'Two committed recruits are pending scholarship offers.',
      'Program Leadership must decide allocation priority.',
    ],
  },
];
