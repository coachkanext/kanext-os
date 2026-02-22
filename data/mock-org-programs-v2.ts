/**
 * Organization Programs v2 \u2014 14 KaNeXT athletic programs
 * Grid/list data for Programs Index tab (Organization \u2192 Programs).
 */

// =============================================================================
// TYPES
// =============================================================================

export type ProgramStatus = 'active-season' | 'offseason' | 'preseason';
export type ComplianceFlag = 'clear' | 'warning' | 'violation';

export interface OrgProgram {
  id: string;
  sport: string;
  name: string;
  shortName: string;
  headCoach: string;
  headCoachInitials: string;
  record: string | null;
  rosterCount: number;
  staffCount: number;
  status: ProgramStatus;
  availabilityAlerts: number;
  recruitingHotCount: number;
  opsBlockers: number;
  complianceFlags: ComplianceFlag;
  complianceFlagCount: number;
  nextEvent: string;
  nextEventDate: string;
  budgetUtilization: number;
  avatarColor: string;
  gender: 'M' | 'W' | 'Co-Ed';
}

export interface CrossProgramAlert {
  id: string;
  programId: string;
  programName: string;
  type: 'attention' | 'staffing' | 'facility' | 'compliance';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  icon: string;
  color: string;
}

// =============================================================================
// 14 KaNeXT PROGRAMS
// =============================================================================

export const ORG_PROGRAMS: OrgProgram[] = [
  { id: 'prog-mbb', sport: 'Basketball', name: "Men's Basketball", shortName: 'MBB', headCoach: 'Alex Morgan', headCoachInitials: 'SK', record: '14-8', rosterCount: 15, staffCount: 7, status: 'active-season', availabilityAlerts: 2, recruitingHotCount: 6, opsBlockers: 1, complianceFlags: 'clear', complianceFlagCount: 0, nextEvent: 'vs Dakota State University', nextEventDate: 'Feb 19', budgetUtilization: 68, avatarColor: '#1D9BF0', gender: 'M' },
  { id: 'prog-wbb', sport: 'Basketball', name: "Women's Basketball", shortName: 'WBB', headCoach: 'Tanya Richards', headCoachInitials: 'TR', record: '11-11', rosterCount: 14, staffCount: 6, status: 'active-season', availabilityAlerts: 1, recruitingHotCount: 4, opsBlockers: 0, complianceFlags: 'clear', complianceFlagCount: 0, nextEvent: 'vs Bellevue University', nextEventDate: 'Feb 20', budgetUtilization: 62, avatarColor: '#EF4444', gender: 'W' },
  { id: 'prog-base', sport: 'Baseball', name: 'Baseball', shortName: 'BASE', headCoach: 'Darnell Washington', headCoachInitials: 'DW', record: '8-4', rosterCount: 30, staffCount: 5, status: 'active-season', availabilityAlerts: 3, recruitingHotCount: 8, opsBlockers: 2, complianceFlags: 'warning', complianceFlagCount: 1, nextEvent: 'vs Montana Tech', nextEventDate: 'Feb 21', budgetUtilization: 74, avatarColor: '#0B0F14', gender: 'M' },
  { id: 'prog-soft', sport: 'Softball', name: 'Softball', shortName: 'SB', headCoach: 'Crystal Monroe', headCoachInitials: 'CM', record: '10-6', rosterCount: 22, staffCount: 4, status: 'active-season', availabilityAlerts: 1, recruitingHotCount: 5, opsBlockers: 0, complianceFlags: 'clear', complianceFlagCount: 0, nextEvent: 'vs Multnomah', nextEventDate: 'Feb 22', budgetUtilization: 58, avatarColor: '#1D9BF0', gender: 'W' },
  { id: 'prog-mtf', sport: 'Track & Field', name: "Men's Track & Field", shortName: 'MTF', headCoach: 'Victor Okafor', headCoachInitials: 'VO', record: null, rosterCount: 28, staffCount: 4, status: 'active-season', availabilityAlerts: 4, recruitingHotCount: 3, opsBlockers: 1, complianceFlags: 'clear', complianceFlagCount: 0, nextEvent: 'SIAC Indoor Championship', nextEventDate: 'Feb 28', budgetUtilization: 55, avatarColor: '#1D9BF0', gender: 'M' },
  { id: 'prog-wtf', sport: 'Track & Field', name: "Women's Track & Field", shortName: 'WTF', headCoach: 'Victor Okafor', headCoachInitials: 'VO', record: null, rosterCount: 26, staffCount: 4, status: 'active-season', availabilityAlerts: 2, recruitingHotCount: 2, opsBlockers: 0, complianceFlags: 'clear', complianceFlagCount: 0, nextEvent: 'SIAC Indoor Championship', nextEventDate: 'Feb 28', budgetUtilization: 52, avatarColor: '#1D9BF0', gender: 'W' },
  { id: 'prog-mxc', sport: 'Cross Country', name: "Men's Cross Country", shortName: 'MXC', headCoach: 'Victor Okafor', headCoachInitials: 'VO', record: null, rosterCount: 12, staffCount: 2, status: 'offseason', availabilityAlerts: 0, recruitingHotCount: 1, opsBlockers: 0, complianceFlags: 'clear', complianceFlagCount: 0, nextEvent: 'Summer Camp', nextEventDate: 'Jun 10', budgetUtilization: 22, avatarColor: '#22C55E', gender: 'M' },
  { id: 'prog-wxc', sport: 'Cross Country', name: "Women's Cross Country", shortName: 'WXC', headCoach: 'Victor Okafor', headCoachInitials: 'VO', record: null, rosterCount: 10, staffCount: 2, status: 'offseason', availabilityAlerts: 0, recruitingHotCount: 1, opsBlockers: 0, complianceFlags: 'clear', complianceFlagCount: 0, nextEvent: 'Summer Camp', nextEventDate: 'Jun 10', budgetUtilization: 20, avatarColor: '#1D9BF0', gender: 'W' },
  { id: 'prog-msoc', sport: 'Soccer', name: "Men's Soccer", shortName: 'MSOC', headCoach: 'Carlos Hernandez', headCoachInitials: 'CH', record: null, rosterCount: 24, staffCount: 4, status: 'offseason', availabilityAlerts: 0, recruitingHotCount: 7, opsBlockers: 0, complianceFlags: 'clear', complianceFlagCount: 0, nextEvent: 'Spring Training', nextEventDate: 'Mar 10', budgetUtilization: 30, avatarColor: '#F59E0B', gender: 'M' },
  { id: 'prog-wsoc', sport: 'Soccer', name: "Women's Soccer", shortName: 'WSOC', headCoach: 'Jasmine Okoro', headCoachInitials: 'JO', record: null, rosterCount: 22, staffCount: 3, status: 'offseason', availabilityAlerts: 0, recruitingHotCount: 4, opsBlockers: 0, complianceFlags: 'warning', complianceFlagCount: 1, nextEvent: 'Spring Training', nextEventDate: 'Mar 10', budgetUtilization: 28, avatarColor: '#1D9BF0', gender: 'W' },
  { id: 'prog-mten', sport: 'Tennis', name: "Men's Tennis", shortName: 'MTEN', headCoach: 'Andre Mitchell', headCoachInitials: 'AM', record: '4-2', rosterCount: 10, staffCount: 2, status: 'active-season', availabilityAlerts: 0, recruitingHotCount: 2, opsBlockers: 0, complianceFlags: 'clear', complianceFlagCount: 0, nextEvent: 'vs Summit', nextEventDate: 'Feb 24', budgetUtilization: 45, avatarColor: '#0B0F14', gender: 'M' },
  { id: 'prog-wten', sport: 'Tennis', name: "Women's Tennis", shortName: 'WTEN', headCoach: 'Andre Mitchell', headCoachInitials: 'AM', record: '5-3', rosterCount: 9, staffCount: 2, status: 'active-season', availabilityAlerts: 1, recruitingHotCount: 1, opsBlockers: 0, complianceFlags: 'clear', complianceFlagCount: 0, nextEvent: 'vs Evergreen', nextEventDate: 'Feb 25', budgetUtilization: 42, avatarColor: '#EF4444', gender: 'W' },
  { id: 'prog-mgolf', sport: 'Golf', name: "Men's Golf", shortName: 'MGOLF', headCoach: 'Robert Tate', headCoachInitials: 'RT', record: null, rosterCount: 8, staffCount: 2, status: 'active-season', availabilityAlerts: 0, recruitingHotCount: 2, opsBlockers: 0, complianceFlags: 'clear', complianceFlagCount: 0, nextEvent: 'SIAC Championship Qualifier', nextEventDate: 'Mar 3', budgetUtilization: 38, avatarColor: '#22C55E', gender: 'M' },
  { id: 'prog-wgolf', sport: 'Golf', name: "Women's Golf", shortName: 'WGOLF', headCoach: 'Robert Tate', headCoachInitials: 'RT', record: null, rosterCount: 7, staffCount: 2, status: 'active-season', availabilityAlerts: 0, recruitingHotCount: 1, opsBlockers: 0, complianceFlags: 'clear', complianceFlagCount: 0, nextEvent: 'SIAC Championship Qualifier', nextEventDate: 'Mar 3', budgetUtilization: 35, avatarColor: '#1D9BF0', gender: 'W' },
];

// =============================================================================
// CROSS-PROGRAM HEALTH ALERTS
// =============================================================================

export const CROSS_PROGRAM_ALERTS: CrossProgramAlert[] = [
  { id: 'cpa-1', programId: 'prog-base', programName: 'Baseball', type: 'attention', title: 'Baseball: 2 Ops Blockers + Compliance Warning', description: 'Travel bus confirmation overdue for Montana Tech series. Roster eligibility form for 2 transfers pending NAIA clearinghouse.', severity: 'high', icon: 'exclamationmark.triangle.fill', color: '#EF4444' },
  { id: 'cpa-2', programId: 'prog-mtf', programName: "Men's Track & Field", type: 'attention', title: "Men's T&F: 4 Availability Alerts", description: '2 sprinters with hamstring issues, 1 jumper out with knee sprain, 1 thrower pending medical clearance ahead of SIAC Indoors.', severity: 'high', icon: 'bandage.fill', color: '#F59E0B' },
  { id: 'cpa-3', programId: 'prog-wsoc', programName: "Women's Soccer", type: 'compliance', title: "Women's Soccer: Missing Training Certifications", description: 'Assistant coach CPR/AED certification expired Jan 31. Must renew before spring training begins Mar 10.', severity: 'medium', icon: 'checkmark.shield.fill', color: '#F59E0B' },
  { id: 'cpa-4', programId: 'prog-mbb', programName: "Men's Basketball", type: 'facility', title: 'Gym Scheduling Conflict: MBB vs WBB', description: 'Both programs requesting Lou Walker Activity Center for Feb 22 practice (2-4 PM). Only 1 court available.', severity: 'medium', icon: 'building.2.fill', color: '#1D9BF0' },
  { id: 'cpa-5', programId: 'prog-soft', programName: 'Softball', type: 'staffing', title: 'Softball: No Dedicated AT Coverage', description: 'Athletic Trainer coverage shared with Baseball. Softball has 3 weekend doubleheaders in next 2 weeks with no AT assigned.', severity: 'medium', icon: 'person.badge.minus', color: '#F59E0B' },
];

// =============================================================================
// HELPERS
// =============================================================================

export const STATUS_COLORS: Record<ProgramStatus, string> = {
  'active-season': '#22C55E',
  offseason: '#A1A1AA',
  preseason: '#F59E0B',
};

export const COMPLIANCE_COLORS: Record<ComplianceFlag, string> = {
  clear: '#22C55E',
  warning: '#F59E0B',
  violation: '#EF4444',
};

export function getProgramSummary() {
  const totalPrograms = ORG_PROGRAMS.length;
  const activeSeasonCount = ORG_PROGRAMS.filter((p) => p.status === 'active-season').length;
  const totalAthletes = ORG_PROGRAMS.reduce((sum, p) => sum + p.rosterCount, 0);
  const totalStaff = ORG_PROGRAMS.reduce((sum, p) => sum + p.staffCount, 0);
  const totalBlockers = ORG_PROGRAMS.reduce((sum, p) => sum + p.opsBlockers, 0);
  const totalComplianceFlags = ORG_PROGRAMS.reduce((sum, p) => sum + p.complianceFlagCount, 0);
  return { totalPrograms, activeSeasonCount, totalAthletes, totalStaff, totalBlockers, totalComplianceFlags };
}

export function getAttentionPrograms(): OrgProgram[] {
  return ORG_PROGRAMS.filter(
    (p) => p.opsBlockers > 0 || p.complianceFlags !== 'clear' || p.availabilityAlerts >= 3,
  ).sort((a, b) => {
    const scoreA = a.opsBlockers * 3 + (a.complianceFlags !== 'clear' ? 2 : 0) + (a.availabilityAlerts >= 3 ? 1 : 0);
    const scoreB = b.opsBlockers * 3 + (b.complianceFlags !== 'clear' ? 2 : 0) + (b.availabilityAlerts >= 3 ? 1 : 0);
    return scoreB - scoreA;
  });
}
