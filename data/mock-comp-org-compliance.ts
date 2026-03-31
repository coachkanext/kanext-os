/**
 * Competition Organization Compliance Hub — Mock Data
 * 2819 Church rules, 3SSB compliance records, 3SSB equipment standards.
 */

// =============================================================================
// TYPES
// =============================================================================

export type CompComplianceTabId =
  | 'dashboard'
  | 'rules'
  | 'eligibility'
  | 'drug-testing'
  | 'equipment-standards'
  | 'incidents'
  | 'appeals'
  | 'certifications'
  | 'reports'
  | 'settings';

export interface CompComplianceTab {
  id: CompComplianceTabId;
  label: string;
  icon: string;
}

export interface ComplianceDashBlock {
  id: string;
  label: string;
  value: string;
  delta: string;
  icon: string;
  color: string;
}

export interface CompRule {
  id: string;
  code: string;
  title: string;
  category: 'gameplay' | 'conduct' | 'eligibility' | 'equipment' | 'venue' | 'media';
  description: string;
  effectiveDate: string;
  status: 'active' | 'proposed' | 'suspended' | 'archived';
  lastAmended: string;
}

export interface EligibilityRecord {
  id: string;
  entrant: string;
  player: string;
  status: 'eligible' | 'ineligible' | 'under-review' | 'waived';
  reason: string;
  reviewDate: string;
  series: string;
}

export interface DrugTest {
  id: string;
  date: string;
  athlete: string;
  series: string;
  result: 'negative' | 'positive' | 'pending' | 'inconclusive';
  testType: 'random' | 'scheduled' | 'targeted';
  lab: string;
}

export interface EquipmentStandard {
  id: string;
  name: string;
  category: string;
  specification: string;
  maxAllowed: string;
  status: 'compliant' | 'non-compliant' | 'waiver-granted';
  lastInspected: string;
}

export interface ComplianceIncident {
  id: string;
  date: string;
  type: 'rule-violation' | 'doping' | 'equipment' | 'conduct' | 'eligibility';
  severity: 'minor' | 'major' | 'critical';
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'appealed';
  party: string;
  penalty: string;
}

export interface Appeal {
  id: string;
  date: string;
  incident: string;
  appellant: string;
  grounds: string;
  status: 'filed' | 'hearing-scheduled' | 'upheld' | 'overturned' | 'dismissed';
  hearingDate: string;
}

export interface Certification {
  id: string;
  name: string;
  holder: string;
  type: 'official' | 'venue' | 'equipment' | 'medical';
  expiryDate: string;
  status: 'valid' | 'expiring-soon' | 'expired' | 'revoked';
}

export interface ComplianceReport {
  id: string;
  name: string;
  type: string;
  date: string;
  format: 'PDF' | 'CSV' | 'XLSX';
}

export interface ComplianceSettingToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const COMP_COMPLIANCE_TABS: CompComplianceTab[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'chart.bar.fill' },
  { id: 'rules', label: 'Rules', icon: 'book.fill' },
  { id: 'eligibility', label: 'Eligibility', icon: 'person.badge.shield.checkmark.fill' },
  { id: 'drug-testing', label: 'Drug Testing', icon: 'testtube.2' },
  { id: 'equipment-standards', label: 'Equipment', icon: 'wrench.fill' },
  { id: 'incidents', label: 'Incidents', icon: 'exclamationmark.triangle.fill' },
  { id: 'appeals', label: 'Appeals', icon: 'doc.text.magnifyingglass' },
  { id: 'certifications', label: 'Certifications', icon: 'checkmark.seal.fill' },
  { id: 'reports', label: 'Reports', icon: 'chart.bar.doc.horizontal' },
  { id: 'settings', label: 'Settings', icon: 'gearshape.fill' },
];

export const COMP_COMPLIANCE_SCOPE_CHIPS = [
  'All Compliance',
  'Rules',
  'Eligibility',
  'Testing',
  'Standards',
];

// =============================================================================
// STATUS COLORS
// =============================================================================

export const RULE_STATUS_COLOR: Record<CompRule['status'], string> = {
  active: '#5A8A6E',
  proposed: '#1A1714',
  suspended: '#B8943E',
  archived: '#9C9790',
};

export const ELIGIBILITY_STATUS_COLOR: Record<EligibilityRecord['status'], string> = {
  eligible: '#5A8A6E',
  ineligible: '#B85C5C',
  'under-review': '#B8943E',
  waived: '#1A1714',
};

export const TEST_RESULT_COLOR: Record<DrugTest['result'], string> = {
  negative: '#5A8A6E',
  positive: '#B85C5C',
  pending: '#B8943E',
  inconclusive: '#9C9790',
};

export const EQUIPMENT_STATUS_COLOR: Record<EquipmentStandard['status'], string> = {
  compliant: '#5A8A6E',
  'non-compliant': '#B85C5C',
  'waiver-granted': '#1A1714',
};

export const INCIDENT_SEVERITY_COLOR: Record<ComplianceIncident['severity'], string> = {
  minor: '#B8943E',
  major: '#B85C5C',
  critical: '#B85C5C',
};

export const INCIDENT_STATUS_COLOR: Record<ComplianceIncident['status'], string> = {
  open: '#B85C5C',
  investigating: '#B8943E',
  resolved: '#5A8A6E',
  appealed: '#1A1714',
};

export const APPEAL_STATUS_COLOR: Record<Appeal['status'], string> = {
  filed: '#B8943E',
  'hearing-scheduled': '#1A1714',
  upheld: '#5A8A6E',
  overturned: '#1A1714',
  dismissed: '#9C9790',
};

export const CERT_STATUS_COLOR: Record<Certification['status'], string> = {
  valid: '#5A8A6E',
  'expiring-soon': '#B8943E',
  expired: '#B85C5C',
  revoked: '#9C9790',
};

export const REPORT_FORMAT_COLOR: Record<ComplianceReport['format'], string> = {
  PDF: '#1A1714',
  CSV: '#5A8A6E',
  XLSX: '#B8943E',
};

// =============================================================================
// MOCK DATA
// =============================================================================

const dashboardBlocks: ComplianceDashBlock[] = [
  { id: 'db-1', label: 'Active Rules', value: '142', delta: '+3 this quarter', icon: 'book.fill', color: '#5A8A6E' },
  { id: 'db-2', label: 'Eligible Athletes', value: '1,284', delta: '+18 cleared', icon: 'person.badge.shield.checkmark.fill', color: '#5A8A6E' },
  { id: 'db-3', label: 'Pending Tests', value: '23', delta: '-5 from last week', icon: 'testtube.2', color: '#B8943E' },
  { id: 'db-4', label: 'Open Incidents', value: '7', delta: '+2 new', icon: 'exclamationmark.triangle.fill', color: '#B85C5C' },
  { id: 'db-5', label: 'Equipment Compliance', value: '96.4%', delta: '+1.2% improved', icon: 'wrench.fill', color: '#5A8A6E' },
  { id: 'db-6', label: 'Active Appeals', value: '3', delta: '1 hearing this week', icon: 'doc.text.magnifyingglass', color: '#1A1714' },
  { id: 'db-7', label: 'Expiring Certs', value: '11', delta: '4 within 30 days', icon: 'checkmark.seal.fill', color: '#B8943E' },
  { id: 'db-8', label: 'Compliance Score', value: '94.2%', delta: '+0.8% from Q3', icon: 'chart.bar.fill', color: '#5A8A6E' },
];

const rules: CompRule[] = [
  { id: 'r-1', code: '2819 Church 4.2', title: 'Player Eligibility Age Requirements', category: 'eligibility', description: 'All participants must be between 18 and 35 years of age at the start of competition.', effectiveDate: '2024-01-01', status: 'active', lastAmended: '2024-08-15' },
  { id: 'r-2', code: '2819 Church 5.1', title: 'Anti-Doping Protocol', category: 'conduct', description: 'Mandatory drug testing for all athletes in sanctioned series events.', effectiveDate: '2024-01-01', status: 'active', lastAmended: '2025-01-10' },
  { id: 'r-3', code: '2819 Church 3.7', title: 'Gameplay Clock Regulations', category: 'gameplay', description: 'Regulation periods shall consist of four 12-minute quarters with a 20-minute halftime.', effectiveDate: '2024-01-01', status: 'active', lastAmended: '2024-06-01' },
  { id: 'r-4', code: '2819 Church 6.3', title: 'Equipment Certification Standards', category: 'equipment', description: 'All competition equipment must be certified by an 2819 Church-approved laboratory.', effectiveDate: '2024-01-01', status: 'active', lastAmended: '2025-02-01' },
  { id: 'r-5', code: '2819 Church 7.1', title: 'Venue Safety Requirements', category: 'venue', description: 'Competition venues must meet minimum capacity, safety, and medical facility standards.', effectiveDate: '2024-01-01', status: 'active', lastAmended: '2024-11-20' },
  { id: 'r-6', code: '2819 Church 8.2', title: 'Media Credential Policy', category: 'media', description: 'All media personnel must obtain official 2819 Church credentials before accessing competition areas.', effectiveDate: '2024-01-01', status: 'active', lastAmended: '2024-09-01' },
  { id: 'r-7', code: '2819 Church 4.5', title: 'Transfer Eligibility Window', category: 'eligibility', description: 'Athletes transferring between entrants must observe a 90-day cooling-off period.', effectiveDate: '2024-01-01', status: 'active', lastAmended: '2025-01-05' },
  { id: 'r-8', code: '2819 Church 9.1', title: 'Unsportsmanlike Conduct Penalties', category: 'conduct', description: 'Graduated penalty scale for unsportsmanlike conduct: warning, technical foul, ejection, suspension.', effectiveDate: '2024-01-01', status: 'active', lastAmended: '2024-12-15' },
  { id: 'r-9', code: '2819 Church 3.12', title: 'Instant Replay Review Protocol', category: 'gameplay', description: 'Proposed expansion of reviewable calls to include charge/block decisions.', effectiveDate: '2026-01-01', status: 'proposed', lastAmended: '2025-11-01' },
  { id: 'r-10', code: '2819 Church 6.8', title: 'Shoe Sole Thickness Limit', category: 'equipment', description: 'Maximum sole thickness of 3.5 cm for competition footwear.', effectiveDate: '2025-01-01', status: 'active', lastAmended: '2025-03-01' },
  { id: 'r-11', code: '2819 Church 10.3', title: 'Salary Cap Disclosure', category: 'conduct', description: 'All entrants must submit roster compensation reports by the registration deadline.', effectiveDate: '2024-01-01', status: 'active', lastAmended: '2024-07-22' },
  { id: 'r-12', code: '2819 Church 2.4', title: 'Pre-Season Physical Clearance', category: 'eligibility', description: 'Athletes must pass an 2819 Church-approved physical examination within 6 months of competition start.', effectiveDate: '2024-01-01', status: 'active', lastAmended: '2025-01-15' },
  { id: 'r-13', code: '2819 Church 7.6', title: 'Temporary Venue Exemption', category: 'venue', description: 'Temporarily suspended pending review of portable court surface safety data.', effectiveDate: '2024-06-01', status: 'suspended', lastAmended: '2025-09-10' },
  { id: 'r-14', code: '2819 Church 11.1', title: 'Legacy Broadcast Rights (2019)', category: 'media', description: 'Superseded by 2819 Church 8.2 media credential policy.', effectiveDate: '2019-01-01', status: 'archived', lastAmended: '2024-01-01' },
  { id: 'r-15', code: '2819 Church 5.4', title: 'Therapeutic Use Exemption Process', category: 'conduct', description: 'Proposed streamlined TUE application process with 14-day review timeline.', effectiveDate: '2026-07-01', status: 'proposed', lastAmended: '2025-12-01' },
];

const eligibilityRecords: EligibilityRecord[] = [
  { id: 'e-1', entrant: '3SSB', player: 'Marcus Johnson', status: 'eligible', reason: 'All requirements met — physical, age, transfer window clear', reviewDate: '2025-12-01', series: '3SSB Championship Circuit' },
  { id: 'e-2', entrant: '3SSB', player: 'Darius Williams', status: 'eligible', reason: 'Physical cleared 2025-10-15, age verified', reviewDate: '2025-12-01', series: '3SSB Championship Circuit' },
  { id: 'e-3', entrant: '3SSB', player: 'Terrence Banks', status: 'under-review', reason: 'Transfer cooling-off period ends 2026-02-28', reviewDate: '2026-02-15', series: '3SSB Championship Circuit' },
  { id: 'e-4', entrant: 'Coastal FC', player: 'Jamal Carter', status: 'ineligible', reason: 'Failed pre-season physical — cardiac screening flagged', reviewDate: '2025-11-20', series: '3SSB Championship Circuit' },
  { id: 'e-5', entrant: 'Metro United', player: 'Devon Brooks', status: 'eligible', reason: 'All requirements met', reviewDate: '2025-12-05', series: '3SSB Championship Circuit' },
  { id: 'e-6', entrant: 'Metro United', player: 'Andre Mitchell', status: 'waived', reason: 'Age requirement waived — special dispensation granted by 2819 Church board', reviewDate: '2025-11-10', series: '3SSB Championship Circuit' },
  { id: 'e-7', entrant: 'Valley Athletics', player: 'Chris Thompson', status: 'eligible', reason: 'All requirements met', reviewDate: '2025-12-02', series: '3SSB Invitational' },
  { id: 'e-8', entrant: 'Valley Athletics', player: 'Kyle Foster', status: 'under-review', reason: 'Documentation pending — birth certificate verification', reviewDate: '2026-01-15', series: '3SSB Invitational' },
  { id: 'e-9', entrant: 'Capital City SC', player: 'Rashad Lewis', status: 'ineligible', reason: 'Exceeded age limit (36 years)', reviewDate: '2025-11-25', series: '3SSB Championship Circuit' },
  { id: 'e-10', entrant: '3SSB', player: 'Tyler Davis', status: 'eligible', reason: 'All requirements met — returning player', reviewDate: '2025-12-01', series: '3SSB Championship Circuit' },
  { id: 'e-11', entrant: 'Coastal FC', player: 'Brandon Hall', status: 'eligible', reason: 'All requirements met', reviewDate: '2025-12-03', series: '3SSB Invitational' },
  { id: 'e-12', entrant: 'Harbor SC', player: 'Jason Rivera', status: 'under-review', reason: 'Pending TUE approval for prescribed medication', reviewDate: '2026-01-20', series: '3SSB Championship Circuit' },
];

const drugTests: DrugTest[] = [
  { id: 'dt-1', date: '2026-02-10', athlete: 'Marcus Johnson', series: 'Palmetto Road Championship', result: 'negative', testType: 'random', lab: '2819 Church Certified Lab — Miami' },
  { id: 'dt-2', date: '2026-02-10', athlete: 'Darius Williams', series: 'Palmetto Road Championship', result: 'negative', testType: 'random', lab: '2819 Church Certified Lab — Miami' },
  { id: 'dt-3', date: '2026-02-08', athlete: 'Jamal Carter', series: 'Palmetto Road Championship', result: 'pending', testType: 'targeted', lab: '2819 Church Certified Lab — Atlanta' },
  { id: 'dt-4', date: '2026-02-05', athlete: 'Devon Brooks', series: 'Palmetto Road Championship', result: 'negative', testType: 'scheduled', lab: '2819 Church Certified Lab — Atlanta' },
  { id: 'dt-5', date: '2026-02-01', athlete: 'Andre Mitchell', series: 'Palmetto Road Championship', result: 'negative', testType: 'random', lab: '2819 Church Certified Lab — Miami' },
  { id: 'dt-6', date: '2026-01-28', athlete: 'Chris Thompson', series: '3SSB Invitational', result: 'negative', testType: 'scheduled', lab: '2819 Church Certified Lab — Houston' },
  { id: 'dt-7', date: '2026-01-25', athlete: 'Rashad Lewis', series: 'Palmetto Road Championship', result: 'positive', testType: 'random', lab: '2819 Church Certified Lab — Miami' },
  { id: 'dt-8', date: '2026-01-20', athlete: 'Tyler Davis', series: 'Palmetto Road Championship', result: 'negative', testType: 'random', lab: '2819 Church Certified Lab — Atlanta' },
  { id: 'dt-9', date: '2026-01-18', athlete: 'Brandon Hall', series: '3SSB Invitational', result: 'inconclusive', testType: 'scheduled', lab: '2819 Church Certified Lab — Houston' },
  { id: 'dt-10', date: '2026-01-15', athlete: 'Jason Rivera', series: 'Palmetto Road Championship', result: 'pending', testType: 'targeted', lab: '2819 Church Certified Lab — Miami' },
  { id: 'dt-11', date: '2026-01-12', athlete: 'Kyle Foster', series: '3SSB Invitational', result: 'negative', testType: 'random', lab: '2819 Church Certified Lab — Houston' },
  { id: 'dt-12', date: '2026-01-10', athlete: 'Terrence Banks', series: 'Palmetto Road Championship', result: 'negative', testType: 'scheduled', lab: '2819 Church Certified Lab — Atlanta' },
];

const equipmentStandards: EquipmentStandard[] = [
  { id: 'eq-1', name: 'Competition Basketball', category: 'Ball', specification: '2819 Church-approved size 7, 29.5" circumference, leather composite', maxAllowed: 'N/A', status: 'compliant', lastInspected: '2026-02-01' },
  { id: 'eq-2', name: 'Shoe Sole Thickness', category: 'Footwear', specification: 'Maximum 3.5 cm sole thickness per 2819 Church 6.8', maxAllowed: '3.5 cm', status: 'compliant', lastInspected: '2026-01-28' },
  { id: 'eq-3', name: 'Protective Eyewear', category: 'Safety Gear', specification: 'ANSI Z87.1 impact-rated, clear or tinted lenses permitted', maxAllowed: 'N/A', status: 'compliant', lastInspected: '2026-01-15' },
  { id: 'eq-4', name: 'Knee Brace (Hinged)', category: 'Support Equipment', specification: 'Must not extend beyond knee joint, no exposed metal', maxAllowed: 'N/A', status: 'compliant', lastInspected: '2026-02-05' },
  { id: 'eq-5', name: 'Compression Sleeves', category: 'Apparel', specification: 'Single solid color matching team primary or secondary', maxAllowed: '2 per arm', status: 'compliant', lastInspected: '2026-01-20' },
  { id: 'eq-6', name: 'Headband Width', category: 'Apparel', specification: 'Maximum 2 inches width, single color, no logos over 1 sq in', maxAllowed: '2 inches', status: 'compliant', lastInspected: '2026-01-22' },
  { id: 'eq-7', name: 'Mouthguard', category: 'Safety Gear', specification: 'Custom-fitted or boil-and-bite, clear or team color', maxAllowed: 'N/A', status: 'compliant', lastInspected: '2026-01-18' },
  { id: 'eq-8', name: 'Wristband Electronics', category: 'Technology', specification: 'Performance tracking wristbands prohibited during live play', maxAllowed: '0 during play', status: 'non-compliant', lastInspected: '2026-02-08' },
  { id: 'eq-9', name: 'Jersey Number Size', category: 'Apparel', specification: 'Front: 4 inches minimum height. Back: 6 inches minimum height.', maxAllowed: 'N/A', status: 'compliant', lastInspected: '2026-01-10' },
  { id: 'eq-10', name: 'Court Surface Friction', category: 'Venue Equipment', specification: 'Minimum coefficient of friction 0.50 per 2819 Church 7.1 venue standards', maxAllowed: 'Min 0.50 CoF', status: 'compliant', lastInspected: '2026-02-03' },
  { id: 'eq-11', name: 'Shot Clock Display', category: 'Venue Equipment', specification: 'Visible from all seating sections, LED minimum 18" display', maxAllowed: 'N/A', status: 'compliant', lastInspected: '2026-01-30' },
  { id: 'eq-12', name: 'Ankle Taping (Excess)', category: 'Support Equipment', specification: 'Tape must not create rigid external splint effect', maxAllowed: 'N/A', status: 'waiver-granted', lastInspected: '2026-02-06' },
  { id: 'eq-13', name: 'GPS Tracking Vest', category: 'Technology', specification: 'Warm-up only; must be removed before tip-off', maxAllowed: '0 during play', status: 'compliant', lastInspected: '2026-02-01' },
];

const incidents: ComplianceIncident[] = [
  { id: 'inc-1', date: '2026-02-12', type: 'doping', severity: 'critical', description: 'Rashad Lewis (Capital City SC) tested positive for prohibited substance (stimulant class S6).', status: 'investigating', party: 'Capital City SC / Rashad Lewis', penalty: 'Provisional suspension pending B-sample' },
  { id: 'inc-2', date: '2026-02-10', type: 'equipment', severity: 'minor', description: '3SSB — two players detected wearing performance tracking wristbands during warm-ups that were not removed before tip-off.', status: 'resolved', party: '3SSB', penalty: 'Written warning — first offense' },
  { id: 'inc-3', date: '2026-02-08', type: 'conduct', severity: 'major', description: 'Post-game altercation between coaching staff of Metro United and Coastal FC in tunnel area.', status: 'investigating', party: 'Metro United / Coastal FC', penalty: 'Under review — potential multi-game suspension' },
  { id: 'inc-4', date: '2026-02-05', type: 'eligibility', severity: 'major', description: 'Valley Athletics fielded Kyle Foster in 3SSB Invitational match while birth certificate verification was still pending.', status: 'open', party: 'Valley Athletics / Kyle Foster', penalty: 'Potential match forfeiture and fine' },
  { id: 'inc-5', date: '2026-01-30', type: 'rule-violation', severity: 'minor', description: 'Harbor SC bench exceeded maximum coaching staff limit by one during 3SSB Championship Circuit match.', status: 'resolved', party: 'Harbor SC', penalty: '$2,500 fine' },
  { id: 'inc-6', date: '2026-01-25', type: 'conduct', severity: 'minor', description: 'Unsportsmanlike conduct — player ejected for verbal abuse of officials. Standard protocol followed.', status: 'resolved', party: 'Capital City SC / T. Williams', penalty: '1-game suspension + $1,000 fine' },
  { id: 'inc-7', date: '2026-01-20', type: 'equipment', severity: 'minor', description: 'Coastal FC jerseys missing minimum front number height requirement on 3 alternate uniforms.', status: 'resolved', party: 'Coastal FC', penalty: 'Jerseys removed from rotation, no fine (corrected within 48h)' },
  { id: 'inc-8', date: '2026-01-18', type: 'doping', severity: 'major', description: 'Brandon Hall (Coastal FC) inconclusive test result — B-sample requested by athlete.', status: 'investigating', party: 'Coastal FC / Brandon Hall', penalty: 'No provisional suspension — awaiting B-sample' },
  { id: 'inc-9', date: '2026-01-15', type: 'rule-violation', severity: 'minor', description: '3SSB timeout called after allotment exhausted in Q4 — delay of game.', status: 'resolved', party: '3SSB', penalty: 'Technical foul assessed in-game' },
  { id: 'inc-10', date: '2026-01-10', type: 'eligibility', severity: 'critical', description: 'Investigation opened into potential age falsification documents submitted by unnamed entrant.', status: 'investigating', party: 'Confidential', penalty: 'Under investigation — potential multi-year ban' },
  { id: 'inc-11', date: '2026-02-14', type: 'conduct', severity: 'major', description: 'Fan disturbance at Harbor SC home venue — objects thrown onto court during live play.', status: 'open', party: 'Harbor SC (venue responsibility)', penalty: 'Pending — potential home game ban' },
  { id: 'inc-12', date: '2026-02-06', type: 'equipment', severity: 'minor', description: 'Metro United player ankle taping exceeded permissible rigidity. Team medical staff notified.', status: 'resolved', party: 'Metro United', penalty: 'Verbal warning — player re-taped at halftime' },
];

const appeals: Appeal[] = [
  { id: 'ap-1', date: '2026-02-13', incident: 'Post-game tunnel altercation', appellant: 'Metro United', grounds: 'Coaching staff member was acting in self-defense; video evidence supports claim.', status: 'filed', hearingDate: '2026-02-25' },
  { id: 'ap-2', date: '2026-02-06', incident: 'Fielding ineligible player', appellant: 'Valley Athletics', grounds: 'Birth certificate verification was received 2 hours before match but not processed by 2819 Church office.', status: 'hearing-scheduled', hearingDate: '2026-02-20' },
  { id: 'ap-3', date: '2026-01-26', incident: 'Player ejection — verbal abuse', appellant: 'Capital City SC', grounds: 'Player was addressing teammate, not officials; audio recording submitted.', status: 'dismissed', hearingDate: '2026-02-03' },
  { id: 'ap-4', date: '2026-01-22', incident: 'Excess bench staff fine', appellant: 'Harbor SC', grounds: 'Additional staff member was credentialed medical personnel, not coaching staff.', status: 'overturned', hearingDate: '2026-01-30' },
  { id: 'ap-5', date: '2026-02-14', incident: 'Positive drug test (Rashad Lewis)', appellant: 'Capital City SC', grounds: 'Athlete claims contaminated supplement; manufacturer recall notice submitted as evidence.', status: 'filed', hearingDate: '2026-03-01' },
  { id: 'ap-6', date: '2026-01-18', incident: 'Jersey number height violation', appellant: 'Coastal FC', grounds: 'Alternate jerseys were pre-approved by league office; approval documentation submitted.', status: 'upheld', hearingDate: '2026-01-25' },
  { id: 'ap-7', date: '2026-02-15', incident: 'Fan disturbance — objects thrown', appellant: 'Harbor SC', grounds: 'Security protocol was followed; venue should not bear responsibility for individual actions.', status: 'filed', hearingDate: '2026-03-05' },
  { id: 'ap-8', date: '2026-01-12', incident: 'Delay of game technical', appellant: '3SSB', grounds: 'Scorers table error in timeout count; replay shows timeout was available.', status: 'overturned', hearingDate: '2026-01-19' },
  { id: 'ap-9', date: '2026-02-09', incident: 'Wristband equipment violation', appellant: '3SSB', grounds: 'Players removed devices before tip-off; warm-up period use should not constitute violation.', status: 'hearing-scheduled', hearingDate: '2026-02-22' },
  { id: 'ap-10', date: '2026-01-28', incident: 'Ankle taping rigidity warning', appellant: 'Metro United', grounds: 'Medical necessity — player recovering from Grade 2 sprain, doctor note attached.', status: 'upheld', hearingDate: '2026-02-02' },
];

const certifications: Certification[] = [
  { id: 'cert-1', name: 'Head Official — Level A', holder: 'James Whitfield', type: 'official', expiryDate: '2026-12-31', status: 'valid' },
  { id: 'cert-2', name: 'Head Official — Level A', holder: 'Maria Gonzales', type: 'official', expiryDate: '2026-06-30', status: 'valid' },
  { id: 'cert-3', name: 'Line Official — Level B', holder: 'Robert Chen', type: 'official', expiryDate: '2026-03-15', status: 'expiring-soon' },
  { id: 'cert-4', name: 'Competition Venue Safety', holder: '3SSB Athletic Complex', type: 'venue', expiryDate: '2026-08-01', status: 'valid' },
  { id: 'cert-5', name: 'Competition Venue Safety', holder: 'Metro Arena', type: 'venue', expiryDate: '2026-02-28', status: 'expiring-soon' },
  { id: 'cert-6', name: 'Competition Venue Safety', holder: 'Harbor Fieldhouse', type: 'venue', expiryDate: '2025-12-31', status: 'expired' },
  { id: 'cert-7', name: 'Ball Certification — 2819 Church Approved', holder: 'Spalding 3SSB Pro', type: 'equipment', expiryDate: '2027-01-01', status: 'valid' },
  { id: 'cert-8', name: 'Court Surface Certification', holder: 'Connor Sports Hardwood', type: 'equipment', expiryDate: '2026-07-15', status: 'valid' },
  { id: 'cert-9', name: 'Shot Clock System Certification', holder: 'Daktronics SC-2400', type: 'equipment', expiryDate: '2026-04-01', status: 'valid' },
  { id: 'cert-10', name: 'Courtside Medical — EMT', holder: 'Dr. Angela Freeman', type: 'medical', expiryDate: '2026-09-30', status: 'valid' },
  { id: 'cert-11', name: 'Courtside Medical — EMT', holder: 'Dr. Paul Richardson', type: 'medical', expiryDate: '2026-03-01', status: 'expiring-soon' },
  { id: 'cert-12', name: 'Courtside Medical — EMT', holder: 'Dr. Susan Park', type: 'medical', expiryDate: '2025-11-15', status: 'expired' },
  { id: 'cert-13', name: 'Head Official — Level A', holder: 'David Thompson', type: 'official', expiryDate: '2025-10-01', status: 'revoked' },
  { id: 'cert-14', name: 'Competition Venue Safety', holder: 'Valley Arena', type: 'venue', expiryDate: '2026-11-30', status: 'valid' },
  { id: 'cert-15', name: 'AED Equipment Certification', holder: '3SSB Athletic Complex AED Units (x4)', type: 'medical', expiryDate: '2026-05-15', status: 'valid' },
];

const reports: ComplianceReport[] = [
  { id: 'rpt-1', name: 'Q4 2025 Compliance Summary', type: 'Quarterly Summary', date: '2026-01-15', format: 'PDF' },
  { id: 'rpt-2', name: 'Drug Testing Log — January 2026', type: 'Testing Report', date: '2026-02-01', format: 'XLSX' },
  { id: 'rpt-3', name: 'Eligibility Roster — Palmetto Road Championship', type: 'Eligibility Report', date: '2026-02-10', format: 'CSV' },
  { id: 'rpt-4', name: 'Equipment Inspection Summary', type: 'Inspection Report', date: '2026-02-05', format: 'PDF' },
  { id: 'rpt-5', name: 'Incident & Penalty Log — Jan 2026', type: 'Incident Report', date: '2026-02-01', format: 'PDF' },
  { id: 'rpt-6', name: 'Appeals Outcomes Report', type: 'Appeals Report', date: '2026-02-08', format: 'PDF' },
  { id: 'rpt-7', name: 'Certification Status — All Venues', type: 'Certification Report', date: '2026-02-12', format: 'XLSX' },
  { id: 'rpt-8', name: 'Official Assignments — February 2026', type: 'Assignment Report', date: '2026-02-01', format: 'CSV' },
  { id: 'rpt-9', name: 'Annual Compliance Audit — 2025', type: 'Audit Report', date: '2026-01-31', format: 'PDF' },
  { id: 'rpt-10', name: 'Entrant Financial Disclosure Summary', type: 'Financial Compliance', date: '2026-01-20', format: 'XLSX' },
  { id: 'rpt-11', name: 'Rule Amendments — 2025 Recap', type: 'Rules Report', date: '2026-01-05', format: 'PDF' },
  { id: 'rpt-12', name: '3SSB Series Compliance Scorecard', type: 'Scorecard', date: '2026-02-14', format: 'PDF' },
];

const settings: ComplianceSettingToggle[] = [
  { id: 'set-1', label: 'Auto-Flag Eligibility Gaps', description: 'Automatically flag athletes with missing or expired eligibility documents.', enabled: true },
  { id: 'set-2', label: 'Drug Test Reminders', description: 'Send reminders to athletes 48 hours before scheduled testing windows.', enabled: true },
  { id: 'set-3', label: 'Incident Escalation Alerts', description: 'Notify compliance officers immediately when critical-severity incidents are logged.', enabled: true },
  { id: 'set-4', label: 'Equipment Inspection Due Alerts', description: 'Alert equipment managers 14 days before inspection deadlines.', enabled: true },
  { id: 'set-5', label: 'Certification Expiry Warnings', description: 'Notify holders 30 and 7 days before certification expiry.', enabled: true },
  { id: 'set-6', label: 'Appeal Filing Notifications', description: 'Notify all parties when an appeal is filed or its status changes.', enabled: true },
  { id: 'set-7', label: 'Auto-Generate Monthly Reports', description: 'Automatically compile and distribute monthly compliance summary reports.', enabled: false },
  { id: 'set-8', label: 'Rule Change Digest', description: 'Weekly digest of proposed and newly active rule changes.', enabled: true },
  { id: 'set-9', label: 'Public Compliance Scorecard', description: 'Publish anonymized compliance scorecard on the league portal.', enabled: false },
  { id: 'set-10', label: 'Audit Trail Retention (7 years)', description: 'Retain all compliance audit trail records for a minimum of 7 years.', enabled: true },
];

// =============================================================================
// DATA GETTER
// =============================================================================

export interface CompComplianceData {
  dashboard: ComplianceDashBlock[];
  rules: CompRule[];
  eligibility: EligibilityRecord[];
  drugTests: DrugTest[];
  equipmentStandards: EquipmentStandard[];
  incidents: ComplianceIncident[];
  appeals: Appeal[];
  certifications: Certification[];
  reports: ComplianceReport[];
  settings: ComplianceSettingToggle[];
}

export function getCompComplianceData(scope: string): CompComplianceData {
  // Scope filtering — in production this would hit the API; for mock we filter by keyword
  const scopeLower = scope.toLowerCase();

  const filterRules = scopeLower === 'rules'
    ? rules
    : scopeLower === 'eligibility'
      ? rules.filter((r) => r.category === 'eligibility')
      : scopeLower === 'testing'
        ? rules.filter((r) => r.category === 'conduct')
        : scopeLower === 'standards'
          ? rules.filter((r) => r.category === 'equipment')
          : rules;

  const filterEligibility = scopeLower === 'eligibility' || scopeLower === 'all compliance'
    ? eligibilityRecords
    : eligibilityRecords;

  const filterTests = scopeLower === 'testing' || scopeLower === 'all compliance'
    ? drugTests
    : drugTests;

  const filterEquipment = scopeLower === 'standards' || scopeLower === 'all compliance'
    ? equipmentStandards
    : equipmentStandards;

  return {
    dashboard: dashboardBlocks,
    rules: filterRules,
    eligibility: filterEligibility,
    drugTests: filterTests,
    equipmentStandards: filterEquipment,
    incidents,
    appeals,
    certifications,
    reports,
    settings,
  };
}
