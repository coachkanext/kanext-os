/**
 * Messages V3 — Seed data for all 5 modes.
 * 40 inbox threads (8/mode), 30 rooms (6/mode), 15 nexus escalations (3/mode).
 */

import type { Mode, InboxThreadV3, RoomV3, NexusEscalationV3 } from '@/types';

// =============================================================================
// HELPERS
// =============================================================================

/** Convenience: date relative to now (negative = hours ago) */
function hoursAgo(h: number): Date {
  return new Date(Date.now() - h * 60 * 60 * 1000);
}

function daysAgo(d: number): Date {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000);
}

// =============================================================================
// SPORTS — KaNeXT Head Coach / GM
// =============================================================================

const SPORTS_INBOX: InboxThreadV3[] = [
  { id: 'si1', mode: 'sports', name: 'Marcus Webb', initials: 'MW', role: 'Assistant Coach', preview: 'Film breakdown for Saturday is ready. Check the shared folder.', timestamp: hoursAgo(1), unread: true, pinned: true, isRequest: false },
  { id: 'si2', mode: 'sports', name: 'Compliance Office', initials: 'CO', role: 'Compliance', preview: 'Reminder: NAIA eligibility forms due Friday.', timestamp: hoursAgo(3), unread: false, pinned: true, isRequest: false },
  { id: 'si3', mode: 'sports', name: 'Jaylen Thomas', initials: 'JT', role: 'Student Athlete', preview: 'Coach, can we talk about my minutes situation?', timestamp: hoursAgo(2), unread: true, pinned: false, isRequest: false },
  { id: 'si4', mode: 'sports', name: 'Alex Chen', initials: 'AC', role: 'Recruit', preview: 'Thank you for the offer! I have some questions about the program.', timestamp: hoursAgo(5), unread: true, pinned: false, isRequest: false },
  { id: 'si5', mode: 'sports', name: 'Patricia Moore', initials: 'PM', role: 'Parent', preview: 'Hi Coach, wanted to discuss Jaylen\'s academic support options.', timestamp: hoursAgo(8), unread: true, pinned: false, isRequest: false },
  { id: 'si6', mode: 'sports', name: 'DeShawn Mitchell', initials: 'DM', role: 'Transfer Portal', preview: 'Interested in KaNeXT. Can we set up a visit?', timestamp: hoursAgo(12), unread: false, pinned: false, isRequest: true },
  { id: 'si7', mode: 'sports', name: 'Athletic Director', initials: 'AD', role: 'Administration', preview: 'Budget meeting moved to Thursday 2pm.', timestamp: daysAgo(1), unread: false, pinned: false, isRequest: false },
  { id: 'si8', mode: 'sports', name: 'Sports Medicine', initials: 'SM', role: 'Medical Staff', preview: 'Injury report updated for this week.', timestamp: daysAgo(1), unread: false, pinned: false, isRequest: false },
];

const SPORTS_ROOMS: RoomV3[] = [
  { id: 'sr1', mode: 'sports', name: 'Leadership Council', initials: 'LC', color: '#1E40AF', memberCount: 8, lastMessage: 'Meeting agenda posted for Friday.', timestamp: hoursAgo(2), unread: true, pinned: false, locked: true, isAnnouncement: false },
  { id: 'sr2', mode: 'sports', name: 'Medical & Training', initials: 'MT', color: '#DC2626', memberCount: 6, lastMessage: 'Updated return-to-play protocol attached.', timestamp: hoursAgo(4), unread: false, pinned: false, locked: true, isAnnouncement: false },
  { id: 'sr3', mode: 'sports', name: 'Practice 4pm Today', initials: 'PR', color: '#059669', memberCount: 25, lastMessage: 'Bring your playbooks. Full walkthrough.', timestamp: hoursAgo(1), unread: true, pinned: true, locked: false, isAnnouncement: true, readCount: 2, totalCount: 3 },
  { id: 'sr4', mode: 'sports', name: 'Compliance Friday', initials: 'CF', color: '#7C3AED', memberCount: 15, lastMessage: 'All forms must be submitted before the deadline.', timestamp: hoursAgo(6), unread: false, pinned: true, locked: false, isAnnouncement: true, readCount: 11, totalCount: 15 },
  { id: 'sr5', mode: 'sports', name: 'Recruiting War Room', initials: 'RW', color: '#D97706', memberCount: 5, lastMessage: 'New eval on Mitchell posted.', timestamp: hoursAgo(3), unread: true, pinned: false, locked: false, isAnnouncement: false },
  { id: 'sr6', mode: 'sports', name: 'Game Day Ops', initials: 'GD', color: '#0891B2', memberCount: 12, lastMessage: 'Bus departs at 1pm sharp Saturday.', timestamp: daysAgo(1), unread: false, pinned: false, locked: false, isAnnouncement: false },
];

const SPORTS_NEXUS: NexusEscalationV3[] = [
  { id: 'sn1', mode: 'sports', askerName: 'Marcus Webb', askerInitials: 'MW', askerRole: 'Assistant Coach', question: 'What\'s the optimal rotation if we rest Thomas in the first half?', viewingContext: 'Game Plan vs Bethel', timestamp: hoursAgo(1), status: 'unanswered' },
  { id: 'sn2', mode: 'sports', askerName: 'Jaylen Thomas', askerInitials: 'JT', askerRole: 'Student Athlete', question: 'How do I improve my defensive KR rating?', viewingContext: 'Player Card', timestamp: hoursAgo(4), status: 'unanswered' },
  { id: 'sn3', mode: 'sports', askerName: 'Patricia Moore', askerInitials: 'PM', askerRole: 'Parent', question: 'What academic support resources are available for student athletes?', viewingContext: 'Program Overview', timestamp: daysAgo(1), status: 'answered', answer: 'KaNeXT provides tutoring, study hall, and academic counseling for all student athletes.' },
];

// =============================================================================
// CHURCH — KaNeXT Church Senior Pastor
// =============================================================================

const CHURCH_INBOX: InboxThreadV3[] = [
  { id: 'ci1', mode: 'church', name: 'Chioma Okonkwo', initials: 'CO', role: 'Associate Pastor', preview: 'The prayer schedule for Holy Week is finalized. Please review.', timestamp: hoursAgo(1), unread: true, pinned: true, isRequest: false },
  { id: 'ci2', mode: 'church', name: 'Deacon Williams', initials: 'DW', role: 'Deacon Board', preview: 'Building fund update — we\'re at 78% of our goal.', timestamp: hoursAgo(3), unread: false, pinned: true, isRequest: false },
  { id: 'ci3', mode: 'church', name: 'Funmi Adeyemi', initials: 'FA', role: 'Worship Leader', preview: 'Song list for Easter Sunday ready for your approval.', timestamp: hoursAgo(2), unread: true, pinned: false, isRequest: false },
  { id: 'ci4', mode: 'church', name: 'Brother Thompson', initials: 'BT', role: 'Youth Ministry', preview: 'Youth retreat registration is filling up. 47 of 60 spots taken.', timestamp: hoursAgo(5), unread: true, pinned: false, isRequest: false },
  { id: 'ci5', mode: 'church', name: 'Sister Davis', initials: 'SD', role: 'Outreach', preview: 'Community meal prep volunteers needed for Saturday.', timestamp: hoursAgo(8), unread: true, pinned: false, isRequest: false },
  { id: 'ci6', mode: 'church', name: 'Michael Chen', initials: 'MC', role: 'New Member', preview: 'I\'d like to join the men\'s fellowship group.', timestamp: hoursAgo(12), unread: false, pinned: false, isRequest: true },
  { id: 'ci7', mode: 'church', name: 'Media Team', initials: 'MT', role: 'Media', preview: 'Livestream equipment tested and ready for Sunday.', timestamp: daysAgo(1), unread: false, pinned: false, isRequest: false },
  { id: 'ci8', mode: 'church', name: 'Finance Committee', initials: 'FC', role: 'Finance', preview: 'Monthly financial report attached for review.', timestamp: daysAgo(1), unread: false, pinned: false, isRequest: false },
];

const CHURCH_ROOMS: RoomV3[] = [
  { id: 'cr1', mode: 'church', name: 'Elder Board', initials: 'EB', color: '#FBBF24', memberCount: 7, lastMessage: 'Strategic planning session confirmed for next Tuesday.', timestamp: hoursAgo(2), unread: true, pinned: false, locked: true, isAnnouncement: false },
  { id: 'cr2', mode: 'church', name: 'Pastoral Team', initials: 'PT', color: '#7C3AED', memberCount: 5, lastMessage: 'Visitation schedule updated.', timestamp: hoursAgo(4), unread: false, pinned: false, locked: false, isAnnouncement: false },
  { id: 'cr3', mode: 'church', name: 'Good Friday Service', initials: 'GF', color: '#DC2626', memberCount: 120, lastMessage: 'Service times: 12pm and 7pm. All volunteers report at 11am.', timestamp: hoursAgo(1), unread: true, pinned: true, locked: false, isAnnouncement: true, readCount: 3, totalCount: 4 },
  { id: 'cr4', mode: 'church', name: 'Volunteer Dinner', initials: 'VD', color: '#059669', memberCount: 45, lastMessage: 'RSVP deadline extended to Sunday.', timestamp: hoursAgo(6), unread: false, pinned: true, locked: false, isAnnouncement: true, readCount: 14, totalCount: 20 },
  { id: 'cr5', mode: 'church', name: 'Worship Team', initials: 'WT', color: '#0891B2', memberCount: 15, lastMessage: 'Rehearsal moved to Thursday 6pm.', timestamp: hoursAgo(3), unread: true, pinned: false, locked: false, isAnnouncement: false },
  { id: 'cr6', mode: 'church', name: 'Youth Ministry', initials: 'YM', color: '#D97706', memberCount: 20, lastMessage: 'Retreat itinerary finalized.', timestamp: daysAgo(1), unread: false, pinned: false, locked: false, isAnnouncement: false },
];

const CHURCH_NEXUS: NexusEscalationV3[] = [
  { id: 'cn1', mode: 'church', askerName: 'Funmi Adeyemi', askerInitials: 'FA', askerRole: 'Worship Leader', question: 'What songs have we done most in the last 3 months?', viewingContext: 'Worship Planning', timestamp: hoursAgo(2), status: 'unanswered' },
  { id: 'cn2', mode: 'church', askerName: 'Brother Thompson', askerInitials: 'BT', askerRole: 'Youth Ministry', question: 'What\'s our average youth attendance this quarter?', viewingContext: 'Ministry Dashboard', timestamp: hoursAgo(6), status: 'unanswered' },
  { id: 'cn3', mode: 'church', askerName: 'Sister Davis', askerInitials: 'SD', askerRole: 'Outreach', question: 'How many community meals have we served this year?', viewingContext: 'Outreach Report', timestamp: daysAgo(2), status: 'answered', answer: 'We\'ve served 1,247 meals across 18 community events this year.' },
];

// =============================================================================
// BUSINESS — KaNeXT Founder
// =============================================================================

const BUSINESS_INBOX: InboxThreadV3[] = [
  { id: 'bi1', mode: 'business', name: 'Kofi Achebe', initials: 'KA', role: 'CTO', preview: 'API latency down 40% after the CDN migration. Metrics attached.', timestamp: hoursAgo(1), unread: true, pinned: true, isRequest: false },
  { id: 'bi2', mode: 'business', name: 'Patrick Bet-David', initials: 'PB', role: 'Advisor', preview: 'Let\'s sync on the Series A timeline this week.', timestamp: hoursAgo(3), unread: false, pinned: true, isRequest: false },
  { id: 'bi3', mode: 'business', name: 'Sarah Kim', initials: 'AM', role: 'Product Lead', preview: 'V3 Messages spec is ready for review.', timestamp: hoursAgo(2), unread: true, pinned: false, isRequest: false },
  { id: 'bi4', mode: 'business', name: 'James Park', initials: 'JP', role: 'Design Lead', preview: 'Updated the design system tokens — check Figma.', timestamp: hoursAgo(5), unread: true, pinned: false, isRequest: false },
  { id: 'bi5', mode: 'business', name: 'Marcus Webb', initials: 'MW', role: 'BD Lead', preview: 'Partnership meeting with NAIA confirmed for next week.', timestamp: hoursAgo(8), unread: true, pinned: false, isRequest: false },
  { id: 'bi6', mode: 'business', name: 'Jordan Ellis', initials: 'JE', role: 'Intern Applicant', preview: 'Applied for the engineering intern position. Portfolio attached.', timestamp: hoursAgo(12), unread: false, pinned: false, isRequest: true },
  { id: 'bi7', mode: 'business', name: 'Legal Team', initials: 'LT', role: 'Legal', preview: 'IP filing update — provisional patent accepted.', timestamp: daysAgo(1), unread: false, pinned: false, isRequest: false },
  { id: 'bi8', mode: 'business', name: 'Finance', initials: 'FN', role: 'Finance', preview: 'Monthly burn rate report ready.', timestamp: daysAgo(1), unread: false, pinned: false, isRequest: false },
];

const BUSINESS_ROOMS: RoomV3[] = [
  { id: 'br1', mode: 'business', name: 'Fundraise Room', initials: 'FR', color: '#7C3AED', memberCount: 4, lastMessage: 'Term sheet from Valley Capital under review.', timestamp: hoursAgo(2), unread: true, pinned: false, locked: true, isAnnouncement: false },
  { id: 'br2', mode: 'business', name: 'Engineering', initials: 'EN', color: '#1E40AF', memberCount: 8, lastMessage: 'Sprint retro notes posted.', timestamp: hoursAgo(4), unread: false, pinned: false, locked: false, isAnnouncement: false },
  { id: 'br3', mode: 'business', name: 'Demo Day Prep', initials: 'DD', color: '#059669', memberCount: 12, lastMessage: 'Dry run scheduled for Thursday. Everyone present.', timestamp: hoursAgo(1), unread: true, pinned: true, locked: false, isAnnouncement: true, readCount: 2, totalCount: 3 },
  { id: 'br4', mode: 'business', name: 'Design System', initials: 'DS', color: '#D97706', memberCount: 6, lastMessage: 'New tokens pushed to the repo. Review needed.', timestamp: hoursAgo(3), unread: false, pinned: true, locked: false, isAnnouncement: true, readCount: 3, totalCount: 4 },
  { id: 'br5', mode: 'business', name: 'Product', initials: 'PD', color: '#0891B2', memberCount: 5, lastMessage: 'Roadmap update for Q2 attached.', timestamp: hoursAgo(6), unread: true, pinned: false, locked: false, isAnnouncement: false },
  { id: 'br6', mode: 'business', name: 'All Hands', initials: 'AH', color: '#DC2626', memberCount: 20, lastMessage: 'Town hall recording available.', timestamp: daysAgo(1), unread: false, pinned: false, locked: false, isAnnouncement: false },
];

const BUSINESS_NEXUS: NexusEscalationV3[] = [
  { id: 'bn1', mode: 'business', askerName: 'Sarah Kim', askerInitials: 'SK', askerRole: 'Product Lead', question: 'What\'s the current DAU trend for the last 30 days?', viewingContext: 'Analytics Dashboard', timestamp: hoursAgo(2), status: 'unanswered' },
  { id: 'bn2', mode: 'business', askerName: 'James Park', askerInitials: 'JP', askerRole: 'Design Lead', question: 'Which component has the most usage across all modes?', viewingContext: 'Design System', timestamp: hoursAgo(8), status: 'unanswered' },
  { id: 'bn3', mode: 'business', askerName: 'Kofi Achebe', askerInitials: 'KA', askerRole: 'CTO', question: 'What\'s our current server cost per active user?', viewingContext: 'Infrastructure', timestamp: daysAgo(1), status: 'answered', answer: 'Current cost is $0.012 per active user per month, down from $0.018 after CDN migration.' },
];

// =============================================================================
// EDUCATION — KaNeXT President
// =============================================================================

const EDUCATION_INBOX: InboxThreadV3[] = [
  { id: 'ei1', mode: 'education', name: 'Dean Clark', initials: 'DC', role: 'Dean of Students', preview: 'Retention numbers are up 3.2% this semester. Full report attached.', timestamp: hoursAgo(1), unread: true, pinned: true, isRequest: false },
  { id: 'ei2', mode: 'education', name: 'SACSCOC Liaison', initials: 'SL', role: 'Accreditation', preview: 'Reaffirmation timeline confirmed. Site visit March 15-17.', timestamp: hoursAgo(3), unread: false, pinned: true, isRequest: false },
  { id: 'ei3', mode: 'education', name: 'Dr. Harris', initials: 'DH', role: 'Provost', preview: 'New program proposal for Data Science is ready for your review.', timestamp: hoursAgo(2), unread: true, pinned: false, isRequest: false },
  { id: 'ei4', mode: 'education', name: 'Prof. Washington', initials: 'PW', role: 'Faculty Senate', preview: 'Faculty senate resolution on course load passed unanimously.', timestamp: hoursAgo(5), unread: true, pinned: false, isRequest: false },
  { id: 'ei5', mode: 'education', name: 'Student Davis', initials: 'SD', role: 'SGA President', preview: 'Student government requesting meeting about campus dining.', timestamp: hoursAgo(8), unread: true, pinned: false, isRequest: false },
  { id: 'ei6', mode: 'education', name: 'Angela Morrison', initials: 'AM', role: 'Transfer Student', preview: 'Requesting transfer credit evaluation for 12 courses.', timestamp: hoursAgo(12), unread: false, pinned: false, isRequest: true },
  { id: 'ei7', mode: 'education', name: 'Facilities', initials: 'FC', role: 'Operations', preview: 'Library renovation Phase 2 on track for completion.', timestamp: daysAgo(1), unread: false, pinned: false, isRequest: false },
  { id: 'ei8', mode: 'education', name: 'IT Services', initials: 'IT', role: 'Technology', preview: 'LMS migration plan finalized. Training sessions next week.', timestamp: daysAgo(1), unread: false, pinned: false, isRequest: false },
];

const EDUCATION_ROOMS: RoomV3[] = [
  { id: 'er1', mode: 'education', name: 'Finance Committee', initials: 'FC', color: '#14B8A6', memberCount: 6, lastMessage: 'Budget hearing scheduled for March 1st.', timestamp: hoursAgo(2), unread: true, pinned: false, locked: true, isAnnouncement: false },
  { id: 'er2', mode: 'education', name: 'Academic Council', initials: 'AC', color: '#1E40AF', memberCount: 12, lastMessage: 'Curriculum review complete for 8 programs.', timestamp: hoursAgo(4), unread: false, pinned: false, locked: false, isAnnouncement: false },
  { id: 'er3', mode: 'education', name: 'Leadership Retreat', initials: 'LR', color: '#7C3AED', memberCount: 15, lastMessage: 'Retreat agenda and logistics confirmed. Pack layers.', timestamp: hoursAgo(1), unread: true, pinned: true, locked: false, isAnnouncement: true, readCount: 4, totalCount: 5 },
  { id: 'er4', mode: 'education', name: 'Evidence Portfolio', initials: 'EP', color: '#D97706', memberCount: 10, lastMessage: 'All departments submit evidence by March 10.', timestamp: hoursAgo(6), unread: false, pinned: true, locked: false, isAnnouncement: true, readCount: 4, totalCount: 6 },
  { id: 'er5', mode: 'education', name: 'Faculty Development', initials: 'FD', color: '#059669', memberCount: 20, lastMessage: 'Teaching excellence workshop recordings available.', timestamp: hoursAgo(3), unread: true, pinned: false, locked: false, isAnnouncement: false },
  { id: 'er6', mode: 'education', name: 'Student Affairs', initials: 'SA', color: '#DC2626', memberCount: 8, lastMessage: 'Spring orientation planning underway.', timestamp: daysAgo(1), unread: false, pinned: false, locked: false, isAnnouncement: false },
];

const EDUCATION_NEXUS: NexusEscalationV3[] = [
  { id: 'en1', mode: 'education', askerName: 'Dean Clark', askerInitials: 'DC', askerRole: 'Dean of Students', question: 'What\'s the current first-year retention rate compared to last year?', viewingContext: 'Institutional Dashboard', timestamp: hoursAgo(3), status: 'unanswered' },
  { id: 'en2', mode: 'education', askerName: 'Dr. Harris', askerInitials: 'DH', askerRole: 'Provost', question: 'How many programs are due for review this cycle?', viewingContext: 'Academic Programs', timestamp: hoursAgo(6), status: 'unanswered' },
  { id: 'en3', mode: 'education', askerName: 'Prof. Washington', askerInitials: 'PW', askerRole: 'Faculty Senate', question: 'What\'s the average class size across all departments?', viewingContext: 'Faculty Dashboard', timestamp: daysAgo(2), status: 'answered', answer: 'Average class size is 18.4 students, down from 21.2 last year. STEM courses average 16.1.' },
];

// =============================================================================
// COMPETITION — K-1 Commissioner
// =============================================================================

const COMPETITION_INBOX: InboxThreadV3[] = [
  { id: 'ki1', mode: 'competition', name: 'Carlos Hernandez', initials: 'CH', role: 'Race Director', preview: 'Track inspection complete. All barriers meet FIA spec.', timestamp: hoursAgo(1), unread: true, pinned: true, isRequest: false },
  { id: 'ki2', mode: 'competition', name: 'FIA Liaison', initials: 'FL', role: 'Governing Body', preview: 'Updated safety protocols for wet conditions approved.', timestamp: hoursAgo(3), unread: false, pinned: true, isRequest: false },
  { id: 'ki3', mode: 'competition', name: 'Takeshi Yamamoto', initials: 'TY', role: 'Team Principal', preview: 'Requesting clarification on the new aero regulations.', timestamp: hoursAgo(2), unread: true, pinned: false, isRequest: false },
  { id: 'ki4', mode: 'competition', name: 'Marco Rossi', initials: 'MR', role: 'Chief Steward', preview: 'Steward panel recommendations for Round 4 incidents.', timestamp: hoursAgo(5), unread: true, pinned: false, isRequest: false },
  { id: 'ki5', mode: 'competition', name: 'Sophie Laurent', initials: 'SL', role: 'Media Director', preview: 'Broadcast partner wants to discuss camera placement for Monaco.', timestamp: hoursAgo(8), unread: true, pinned: false, isRequest: false },
  { id: 'ki6', mode: 'competition', name: 'Carlos Vega', initials: 'CV', role: 'New Team Entry', preview: 'Applying for K-1 grid expansion. Documentation attached.', timestamp: hoursAgo(12), unread: false, pinned: false, isRequest: true },
  { id: 'ki7', mode: 'competition', name: 'Medical Team', initials: 'MT', role: 'Medical', preview: 'All medical stations confirmed operational for Round 5.', timestamp: daysAgo(1), unread: false, pinned: false, isRequest: false },
  { id: 'ki8', mode: 'competition', name: 'Logistics', initials: 'LG', role: 'Operations', preview: 'Freight schedule confirmed for the European leg.', timestamp: daysAgo(1), unread: false, pinned: false, isRequest: false },
];

const COMPETITION_ROOMS: RoomV3[] = [
  { id: 'kr1', mode: 'competition', name: 'Technical Committee', initials: 'TC', color: '#FF5555', memberCount: 8, lastMessage: 'Engine formula review meeting next Wednesday.', timestamp: hoursAgo(2), unread: true, pinned: false, locked: true, isAnnouncement: false },
  { id: 'kr2', mode: 'competition', name: 'Stewards Panel', initials: 'SP', color: '#1E40AF', memberCount: 5, lastMessage: 'Incident review procedures updated.', timestamp: hoursAgo(4), unread: false, pinned: false, locked: true, isAnnouncement: false },
  { id: 'kr3', mode: 'competition', name: 'Pre-Race Briefing', initials: 'RB', color: '#059669', memberCount: 30, lastMessage: 'All teams mandatory attendance. 9am Saturday.', timestamp: hoursAgo(1), unread: true, pinned: true, locked: false, isAnnouncement: true, readCount: 3, totalCount: 4 },
  { id: 'kr4', mode: 'competition', name: 'Entry Fee Notice', initials: 'EF', color: '#D97706', memberCount: 20, lastMessage: 'Round 6-8 entry fees due by March 15.', timestamp: hoursAgo(6), unread: false, pinned: true, locked: false, isAnnouncement: true, readCount: 5, totalCount: 6 },
  { id: 'kr5', mode: 'competition', name: 'Safety Commission', initials: 'SC', color: '#DC2626', memberCount: 10, lastMessage: 'New barrier specifications distributed.', timestamp: hoursAgo(3), unread: true, pinned: false, locked: false, isAnnouncement: false },
  { id: 'kr6', mode: 'competition', name: 'Broadcast Ops', initials: 'BO', color: '#0891B2', memberCount: 15, lastMessage: 'Camera rig positions confirmed for Round 5.', timestamp: daysAgo(1), unread: false, pinned: false, locked: false, isAnnouncement: false },
];

const COMPETITION_NEXUS: NexusEscalationV3[] = [
  { id: 'kn1', mode: 'competition', askerName: 'Takeshi Yamamoto', askerInitials: 'TY', askerRole: 'Team Principal', question: 'How does the new aero package compare to last season\'s downforce numbers?', viewingContext: 'Technical Regulations', timestamp: hoursAgo(2), status: 'unanswered' },
  { id: 'kn2', mode: 'competition', askerName: 'Marco Rossi', askerInitials: 'MR', askerRole: 'Chief Steward', question: 'What\'s the average penalty points per driver this season?', viewingContext: 'Steward Dashboard', timestamp: hoursAgo(8), status: 'unanswered' },
  { id: 'kn3', mode: 'competition', askerName: 'Sophie Laurent', askerInitials: 'SL', askerRole: 'Media Director', question: 'Which races had the highest viewership last season?', viewingContext: 'Broadcast Analytics', timestamp: daysAgo(1), status: 'answered', answer: 'Monaco led with 12.4M viewers, followed by the season finale at 11.8M and the night race at 10.2M.' },
];

// =============================================================================
// LOOKUP MAPS
// =============================================================================

const INBOX_MAP: Record<Mode, InboxThreadV3[]> = {
  sports: SPORTS_INBOX,
  church: CHURCH_INBOX,
  business: BUSINESS_INBOX,
  education: EDUCATION_INBOX,
  competition: COMPETITION_INBOX,
};

const ROOMS_MAP: Record<Mode, RoomV3[]> = {
  sports: SPORTS_ROOMS,
  church: CHURCH_ROOMS,
  business: BUSINESS_ROOMS,
  education: EDUCATION_ROOMS,
  competition: COMPETITION_ROOMS,
};

const NEXUS_MAP: Record<Mode, NexusEscalationV3[]> = {
  sports: SPORTS_NEXUS,
  church: CHURCH_NEXUS,
  business: BUSINESS_NEXUS,
  education: EDUCATION_NEXUS,
  competition: COMPETITION_NEXUS,
};

// =============================================================================
// PUBLIC API
// =============================================================================

export function getInboxThreads(mode: Mode): InboxThreadV3[] {
  return INBOX_MAP[mode] ?? [];
}

export function getRooms(mode: Mode): RoomV3[] {
  return ROOMS_MAP[mode] ?? [];
}

export function getNexusEscalations(mode: Mode): NexusEscalationV3[] {
  return NEXUS_MAP[mode] ?? [];
}

export function getUnansweredCount(mode: Mode): number {
  return getNexusEscalations(mode).filter((e) => e.status === 'unanswered').length;
}

export function formatMessageTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffH = diffMs / (1000 * 60 * 60);
  if (diffH < 1) return `${Math.max(1, Math.round(diffH * 60))}m`;
  if (diffH < 24) return `${Math.round(diffH)}h`;
  const diffD = Math.round(diffH / 24);
  if (diffD === 1) return 'Yesterday';
  if (diffD < 7) return `${diffD}d`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
