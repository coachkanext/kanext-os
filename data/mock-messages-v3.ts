/**
 * Messages V3 — Seed data for all 5 modes.
 * 40 inbox threads (8/mode), 30 rooms (6/mode), 15 nexus escalations (3/mode).
 */

import type { Mode, InboxThreadV3, RoomV3, NexusEscalationV3, MentionV3, InboxEscalationV3, RoomMessageV3 } from '@/types';

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
// SPORTS — Carroll College Head Coach
// =============================================================================

const SPORTS_INBOX: InboxThreadV3[] = [
  { id: 'si1', mode: 'sports', name: 'HC Miles', initials: 'HM', role: 'Head Coach', preview: 'Need your scouting report on Mitchell before Thursday.', timestamp: hoursAgo(1), unread: true, pinned: false, isRequest: false },
  { id: 'si2', mode: 'sports', name: 'Jaylen Thomas', initials: 'JT', role: 'Student Athlete', preview: 'Coach Pearson, can we go over film from Tuesday?', timestamp: hoursAgo(2), unread: true, pinned: false, isRequest: false },
  { id: 'si3', mode: 'sports', name: 'Marcus Davis', initials: 'MD', role: 'Video Coordinator', preview: 'Defensive clips for Saturday uploaded to shared folder.', timestamp: hoursAgo(3), unread: true, pinned: false, isRequest: false },
  { id: 'si4', mode: 'sports', name: 'DeShawn Mitchell', initials: 'DM', role: 'Recruit', preview: 'Thanks for reaching out, Coach. I\'d love to set up a visit.', timestamp: hoursAgo(5), unread: true, pinned: false, isRequest: false },
  { id: 'si5', mode: 'sports', name: 'AD Johnson', initials: 'AJ', role: 'Athletic Director', preview: 'Spring recruiting trip budget approved. Details attached.', timestamp: hoursAgo(8), unread: false, pinned: true, isRequest: false },
  { id: 'si6', mode: 'sports', name: 'Medical Staff', initials: 'MS', role: 'Medical', preview: 'Thomas cleared for full contact practice tomorrow.', timestamp: hoursAgo(12), unread: false, pinned: false, isRequest: false },
  { id: 'si7', mode: 'sports', name: 'Tyree Williams', initials: 'TW', role: 'Student Athlete', preview: 'Can I get extra film time this week?', timestamp: daysAgo(1), unread: false, pinned: false, isRequest: false },
  { id: 'si8', mode: 'sports', name: 'Patricia Moore', initials: 'PM', role: 'Parent', preview: 'Coach Pearson, wanted to discuss Jaylen\'s academic plan.', timestamp: daysAgo(1), unread: false, pinned: false, isRequest: false },
];

const SPORTS_ROOMS: RoomV3[] = [
  // ── Program Rooms (seeded, program-scoped) ──
  { id: 'sr-ann', mode: 'sports', name: '#team-announcements', initials: 'TA', color: '#EF4444', memberCount: 28, lastMessage: 'Practice moved to 3pm today. Check your email for updated schedule.', timestamp: hoursAgo(1), unread: true, pinned: true, locked: false, isAnnouncement: true, readCount: 18, totalCount: 28, category: 'program', pinnedMessage: 'Season schedule PDF — updated Feb 24' },
  { id: 'sr-staff', mode: 'sports', name: '#staff-room', initials: 'SR', color: '#1D9BF0', memberCount: 8, lastMessage: 'Film review at 2pm. Bring your scouting notes from last game.', timestamp: hoursAgo(2), unread: true, pinned: true, locked: true, isAnnouncement: false, category: 'program', pinnedMessage: 'Staff meeting every Tuesday & Thursday 2pm' },
  { id: 'sr-practice', mode: 'sports', name: '#practice-plan', initials: 'PP', color: '#22C55E', memberCount: 25, lastMessage: 'Wednesday: full-court press drill + PNR reads. Bring playbooks.', timestamp: hoursAgo(3), unread: true, pinned: false, locked: false, isAnnouncement: false, category: 'program', pinnedMessage: 'Practice plan template — use this for all submissions' },
  { id: 'sr-scout', mode: 'sports', name: '#scout-room', initials: 'SC', color: '#F59E0B', memberCount: 6, lastMessage: 'Mitchell eval posted. Strong PNR reads, needs work on transition D.', timestamp: hoursAgo(4), unread: true, pinned: false, locked: true, isAnnouncement: false, category: 'program' },
  { id: 'sr-travel', mode: 'sports', name: '#travel', initials: 'TR', color: '#8B5CF6', memberCount: 25, lastMessage: 'Bus departs 1pm sharp Saturday for Bethel. Pack dress code.', timestamp: hoursAgo(6), unread: false, pinned: false, locked: false, isAnnouncement: false, category: 'program' },
  { id: 'sr-recruit', mode: 'sports', name: '#recruiting', initials: 'RC', color: '#F59E0B', memberCount: 5, lastMessage: 'New prospect list updated. 3 guards, 2 wings match our needs profile.', timestamp: hoursAgo(5), unread: false, pinned: false, locked: true, isAnnouncement: false, category: 'program' },
  // ── Direct Rooms (small-group, RBAC-gated) ──
  { id: 'sr-coaches', mode: 'sports', name: 'Coaches Only', initials: 'CO', color: '#1D9BF0', memberCount: 4, lastMessage: 'Rotation adjustments for Saturday — Thomas back in starting 5.', timestamp: hoursAgo(1), unread: true, pinned: false, locked: true, isAnnouncement: false, category: 'direct' },
  { id: 'sr-guards', mode: 'sports', name: 'Guards', initials: 'GD', color: '#22C55E', memberCount: 6, lastMessage: 'PNR film cuts ready in shared folder. Watch before Thursday practice.', timestamp: hoursAgo(3), unread: false, pinned: false, locked: false, isAnnouncement: false, category: 'direct' },
  { id: 'sr-bigs', mode: 'sports', name: 'Bigs', initials: 'BG', color: '#EF4444', memberCount: 5, lastMessage: 'Post footwork session added for Wednesday morning. 7am.', timestamp: hoursAgo(8), unread: false, pinned: false, locked: false, isAnnouncement: false, category: 'direct' },
  { id: 'sr-reccore', mode: 'sports', name: 'Recruiting Core', initials: 'RK', color: '#F59E0B', memberCount: 3, lastMessage: 'Mitchell visit confirmed for next Tuesday. Campus tour + film session.', timestamp: hoursAgo(2), unread: true, pinned: false, locked: true, isAnnouncement: false, category: 'direct' },
];

const SPORTS_NEXUS: NexusEscalationV3[] = [
  // ── Unanswered (in queue) ──
  {
    id: 'sn1', mode: 'sports', askerName: 'Marcus Davis', askerInitials: 'MD', askerRole: 'Video Coordinator',
    question: 'What\'s the optimal rotation if we rest Thomas in the first half?',
    viewingContext: 'Game Plan vs Bethel', timestamp: hoursAgo(1), status: 'unanswered',
    contextChips: [{ type: 'event', label: 'vs Bethel (Sat)' }, { type: 'person', label: 'Jaylen Thomas' }],
  },
  {
    id: 'sn2', mode: 'sports', askerName: 'Tyree Williams', askerInitials: 'TW', askerRole: 'Student Athlete',
    question: 'When is the next individual film session available?',
    viewingContext: 'Calendar', timestamp: hoursAgo(3), status: 'unanswered',
    contextChips: [{ type: 'event', label: 'Film Session' }],
  },
  // ── Answered by Nexus (instant) ──
  {
    id: 'sn3', mode: 'sports', askerName: 'Jaylen Thomas', askerInitials: 'JT', askerRole: 'Student Athlete',
    question: 'How do I improve my defensive KR rating?',
    viewingContext: 'Player Card', timestamp: hoursAgo(4), status: 'answered_by_nexus',
    nexusAttempt: 'Your defensive KR is driven by three clusters: On-Ball Defense, Team Defense, and Rebounding. Focus on closeout drills, help-side positioning, and contesting shots at the rim. Your perimeter defense cluster is at 58 — improving that to 65+ would raise your overall KR by ~4 points.',
    resolvedAnswer: 'Your defensive KR is driven by three clusters: On-Ball Defense, Team Defense, and Rebounding. Focus on closeout drills, help-side positioning, and contesting shots at the rim. Your perimeter defense cluster is at 58 — improving that to 65+ would raise your overall KR by ~4 points.',
    answeredBy: 'Nexus',
    contextChips: [{ type: 'person', label: 'Jaylen Thomas' }, { type: 'media', label: 'Player Card' }],
  },
  {
    id: 'sn4', mode: 'sports', askerName: 'DeShawn Mitchell', askerInitials: 'DM', askerRole: 'Recruit',
    question: 'What are the academic eligibility requirements to play?',
    viewingContext: 'Recruiting Portal', timestamp: hoursAgo(6), status: 'answered_by_nexus',
    nexusAttempt: 'To maintain NAIA eligibility you need a minimum 2.0 GPA and must be enrolled as a full-time student (12+ credits). Transfer students must have a minimum 2.0 cumulative GPA from all prior institutions.',
    resolvedAnswer: 'To maintain NAIA eligibility you need a minimum 2.0 GPA and must be enrolled as a full-time student (12+ credits). Transfer students must have a minimum 2.0 cumulative GPA from all prior institutions.',
    answeredBy: 'Nexus',
    contextChips: [{ type: 'person', label: 'DeShawn Mitchell' }],
  },
  {
    id: 'sn5', mode: 'sports', askerName: 'Patricia Moore', askerInitials: 'PM', askerRole: 'Parent',
    question: 'What time does the bus leave for Saturday\'s game?',
    viewingContext: 'Travel Schedule', timestamp: hoursAgo(8), status: 'answered_by_nexus',
    nexusAttempt: 'The team bus departs at 1:00 PM sharp from the main gym parking lot. Players should arrive by 12:30 PM in dress code.',
    resolvedAnswer: 'The team bus departs at 1:00 PM sharp from the main gym parking lot. Players should arrive by 12:30 PM in dress code.',
    answeredBy: 'Nexus',
    contextChips: [{ type: 'event', label: 'vs Bethel (Sat)' }],
  },
  // ── Escalated (waiting on human) ──
  {
    id: 'sn6', mode: 'sports', askerName: 'AD Johnson', askerInitials: 'AJ', askerRole: 'Athletic Director',
    question: 'Can we get a projected budget impact if we add a third assistant coach next season?',
    viewingContext: 'Program Finance', timestamp: hoursAgo(2), status: 'escalated',
    nexusAttempt: 'Based on current staff budget allocation, adding a third assistant coach would increase the coaching line item by approximately $35-45K. However, specific budget approval and funding sources need to be confirmed by the Head Coach and Finance.',
    escalationTarget: 'HC Miles',
    contextChips: [{ type: 'person', label: 'HC Miles' }],
  },
  {
    id: 'sn7', mode: 'sports', askerName: 'Medical Staff', askerInitials: 'MS', askerRole: 'Medical',
    question: 'What\'s the return-to-play protocol for Thomas after his ankle sprain?',
    viewingContext: 'Player Health', timestamp: hoursAgo(5), status: 'escalated',
    nexusAttempt: 'Standard ankle sprain protocol: 1) Pain-free ROM, 2) Full weight-bearing without limp, 3) Sport-specific agility test, 4) Coach clearance. However, final medical clearance must come from the team physician.',
    escalationTarget: 'Coach Reed',
    contextChips: [{ type: 'person', label: 'Jaylen Thomas' }, { type: 'event', label: 'Medical Clearance' }],
  },
  // ── Answered by Coach (resolved by human) ──
  {
    id: 'sn8', mode: 'sports', askerName: 'Patricia Moore', askerInitials: 'PM', askerRole: 'Parent',
    question: 'What academic support resources are available for student athletes?',
    viewingContext: 'Program Overview', timestamp: daysAgo(1), status: 'answered_by_coach',
    nexusAttempt: 'Carroll College provides tutoring services, mandatory study hall for freshmen, and academic counseling through the athletics department.',
    humanReplies: [
      { name: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Great question. In addition to what\'s listed, we also have a peer mentoring program where upperclassmen help freshmen with time management. I\'ll have our academic coordinator reach out to you directly.', timestamp: daysAgo(0.5) },
    ],
    resolvedAnswer: 'Carroll College provides tutoring services, mandatory study hall for freshmen, academic counseling, and a peer mentoring program. Our academic coordinator will reach out with specific details.',
    answeredBy: 'HC Miles',
    contextChips: [{ type: 'person', label: 'Jaylen Thomas' }],
  },
  {
    id: 'sn9', mode: 'sports', askerName: 'Jaylen Thomas', askerInitials: 'JT', askerRole: 'Student Athlete',
    question: 'What\'s my projected role for the conference tournament?',
    viewingContext: 'Player Card', timestamp: daysAgo(2), status: 'answered_by_coach',
    nexusAttempt: 'Based on current rotation data, you\'re averaging 28.4 minutes per game as a starter. Your usage rate and efficiency metrics suggest a primary scoring role.',
    humanReplies: [
      { name: 'You', initials: 'CP', role: 'Assistant Coach', content: 'JT — you\'re locked in as a starter. We need you to be our primary ball handler in the half-court and run the PNR action. Keep working on your shot selection in transition.', timestamp: daysAgo(1.5) },
    ],
    resolvedAnswer: 'Starter role with primary ball-handling duties in half-court sets and PNR action. Focus area: shot selection in transition.',
    answeredBy: 'Coach Pearson',
    contextChips: [{ type: 'person', label: 'Jaylen Thomas' }, { type: 'event', label: 'Conference Tournament' }],
  },
  {
    id: 'sn10', mode: 'sports', askerName: 'Marcus Davis', askerInitials: 'MD', askerRole: 'Video Coordinator',
    question: 'Which defensive sets should I tag for the Bethel scout report?',
    viewingContext: 'Film Room', timestamp: daysAgo(1), status: 'answered_by_coach',
    nexusAttempt: 'Bethel primarily runs man-to-man defense with occasional 1-3-1 zone in the second half. Key sets to tag: half-court man, 1-3-1 zone, press break, and late-game switching.',
    humanReplies: [
      { name: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Tag all their zone possessions (1-3-1 and 2-3), plus any switching man sequences. Also flag their inbound plays — they ran 3 different sets last game.', timestamp: daysAgo(0.8) },
    ],
    resolvedAnswer: 'Tag: 1-3-1 zone, 2-3 zone, switching man sequences, and all inbound plays (3 different sets). Focus on second-half defensive adjustments.',
    answeredBy: 'Coach Pearson',
    contextChips: [{ type: 'event', label: 'vs Bethel (Sat)' }, { type: 'media', label: 'Game Film' }],
  },
];

const SPORTS_MENTIONS: MentionV3[] = [
  { id: 'sm1', mode: 'sports', roomName: 'Staff Room', senderName: 'HC Miles', senderInitials: 'HM', preview: '@Pearson defensive film clips needed by Friday EOD', timestamp: hoursAgo(1) },
  { id: 'sm2', mode: 'sports', roomName: 'Recruiting Room', senderName: 'HC Miles', senderInitials: 'HM', preview: '@Pearson get me Mitchell\'s updated eval before the meeting', timestamp: hoursAgo(3) },
  { id: 'sm3', mode: 'sports', roomName: 'Practice Room', senderName: 'Marcus Davis', senderInitials: 'MD', preview: '@Pearson clips are in the folder, let me know if you need edits', timestamp: hoursAgo(4) },
];

const SPORTS_INBOX_ESCALATIONS: InboxEscalationV3[] = [
  { id: 'se1', mode: 'sports', requesterName: 'Jaylen Thomas', requesterInitials: 'JT', questionPreview: 'What\'s my projected role for the conference tournament?', linkedContext: 'Player Card', status: 'needs_reply', timestamp: hoursAgo(2) },
  { id: 'se2', mode: 'sports', requesterName: 'Patricia Moore', requesterInitials: 'PM', questionPreview: 'What academic support options are available for Jaylen?', linkedContext: 'Program Overview', status: 'needs_reply', timestamp: hoursAgo(6) },
  { id: 'se3', mode: 'sports', requesterName: 'HC Miles', requesterInitials: 'HM', questionPreview: 'Approve travel reimbursement REQ-1043', linkedContext: 'Finance', status: 'replied', timestamp: daysAgo(1) },
];

// =============================================================================
// CHURCH — 2819 Church Senior Pastor
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
  { id: 'cr1', mode: 'church', name: 'Elder Board', initials: 'EB', color: '#1D9BF0', memberCount: 7, lastMessage: 'Strategic planning session confirmed for next Tuesday.', timestamp: hoursAgo(2), unread: true, pinned: false, locked: true, isAnnouncement: false },
  { id: 'cr2', mode: 'church', name: 'Pastoral Team', initials: 'PT', color: '#1D9BF0', memberCount: 5, lastMessage: 'Visitation schedule updated.', timestamp: hoursAgo(4), unread: false, pinned: false, locked: false, isAnnouncement: false },
  { id: 'cr3', mode: 'church', name: 'Good Friday Service', initials: 'GF', color: '#EF4444', memberCount: 120, lastMessage: 'Service times: 12pm and 7pm. All volunteers report at 11am.', timestamp: hoursAgo(1), unread: true, pinned: true, locked: false, isAnnouncement: true, readCount: 3, totalCount: 4 },
  { id: 'cr4', mode: 'church', name: 'Volunteer Dinner', initials: 'VD', color: '#22C55E', memberCount: 45, lastMessage: 'RSVP deadline extended to Sunday.', timestamp: hoursAgo(6), unread: false, pinned: true, locked: false, isAnnouncement: true, readCount: 14, totalCount: 20 },
  { id: 'cr5', mode: 'church', name: 'Worship Team', initials: 'WT', color: '#1D9BF0', memberCount: 15, lastMessage: 'Rehearsal moved to Thursday 6pm.', timestamp: hoursAgo(3), unread: true, pinned: false, locked: false, isAnnouncement: false },
  { id: 'cr6', mode: 'church', name: 'Youth Ministry', initials: 'YM', color: '#F59E0B', memberCount: 20, lastMessage: 'Retreat itinerary finalized.', timestamp: daysAgo(1), unread: false, pinned: false, locked: false, isAnnouncement: false },
];

const CHURCH_NEXUS: NexusEscalationV3[] = [
  { id: 'cn1', mode: 'church', askerName: 'Funmi Adeyemi', askerInitials: 'FA', askerRole: 'Worship Leader', question: 'What songs have we done most in the last 3 months?', viewingContext: 'Worship Planning', timestamp: hoursAgo(2), status: 'unanswered' },
  { id: 'cn2', mode: 'church', askerName: 'Brother Thompson', askerInitials: 'BT', askerRole: 'Youth Ministry', question: 'What\'s our average youth attendance this quarter?', viewingContext: 'Ministry Dashboard', timestamp: hoursAgo(6), status: 'unanswered' },
  { id: 'cn3', mode: 'church', askerName: 'Sister Davis', askerInitials: 'SD', askerRole: 'Outreach', question: 'How many community meals have we served this year?', viewingContext: 'Outreach Report', timestamp: daysAgo(2), status: 'answered_by_nexus', answer: 'We\'ve served 1,247 meals across 18 community events this year.', resolvedAnswer: 'We\'ve served 1,247 meals across 18 community events this year.', answeredBy: 'Nexus' },
];

// =============================================================================
// BUSINESS — Valuetainment Founder
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
  { id: 'br1', mode: 'business', name: 'Fundraise Room', initials: 'FR', color: '#1D9BF0', memberCount: 4, lastMessage: 'Term sheet from Valley Capital under review.', timestamp: hoursAgo(2), unread: true, pinned: false, locked: true, isAnnouncement: false },
  { id: 'br2', mode: 'business', name: 'Engineering', initials: 'EN', color: '#1D9BF0', memberCount: 8, lastMessage: 'Sprint retro notes posted.', timestamp: hoursAgo(4), unread: false, pinned: false, locked: false, isAnnouncement: false },
  { id: 'br3', mode: 'business', name: 'Demo Day Prep', initials: 'DD', color: '#22C55E', memberCount: 12, lastMessage: 'Dry run scheduled for Thursday. Everyone present.', timestamp: hoursAgo(1), unread: true, pinned: true, locked: false, isAnnouncement: true, readCount: 2, totalCount: 3 },
  { id: 'br4', mode: 'business', name: 'Design System', initials: 'DS', color: '#F59E0B', memberCount: 6, lastMessage: 'New tokens pushed to the repo. Review needed.', timestamp: hoursAgo(3), unread: false, pinned: true, locked: false, isAnnouncement: true, readCount: 3, totalCount: 4 },
  { id: 'br5', mode: 'business', name: 'Product', initials: 'PD', color: '#1D9BF0', memberCount: 5, lastMessage: 'Roadmap update for Q2 attached.', timestamp: hoursAgo(6), unread: true, pinned: false, locked: false, isAnnouncement: false },
  { id: 'br6', mode: 'business', name: 'All Hands', initials: 'AH', color: '#EF4444', memberCount: 20, lastMessage: 'Town hall recording available.', timestamp: daysAgo(1), unread: false, pinned: false, locked: false, isAnnouncement: false },
];

const BUSINESS_NEXUS: NexusEscalationV3[] = [
  { id: 'bn1', mode: 'business', askerName: 'Sarah Kim', askerInitials: 'SK', askerRole: 'Product Lead', question: 'What\'s the current DAU trend for the last 30 days?', viewingContext: 'Analytics Dashboard', timestamp: hoursAgo(2), status: 'unanswered' },
  { id: 'bn2', mode: 'business', askerName: 'James Park', askerInitials: 'JP', askerRole: 'Design Lead', question: 'Which component has the most usage across all modes?', viewingContext: 'Design System', timestamp: hoursAgo(8), status: 'unanswered' },
  { id: 'bn3', mode: 'business', askerName: 'Kofi Achebe', askerInitials: 'KA', askerRole: 'CTO', question: 'What\'s our current server cost per active user?', viewingContext: 'Infrastructure', timestamp: daysAgo(1), status: 'answered_by_nexus', answer: 'Current cost is $0.012 per active user per month, down from $0.018 after CDN migration.', resolvedAnswer: 'Current cost is $0.012 per active user per month, down from $0.018 after CDN migration.', answeredBy: 'Nexus' },
];

// =============================================================================
// EDUCATION — Howard University President
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
  { id: 'er1', mode: 'education', name: 'Finance Committee', initials: 'FC', color: '#1D9BF0', memberCount: 6, lastMessage: 'Budget hearing scheduled for March 1st.', timestamp: hoursAgo(2), unread: true, pinned: false, locked: true, isAnnouncement: false },
  { id: 'er2', mode: 'education', name: 'Academic Council', initials: 'AC', color: '#1D9BF0', memberCount: 12, lastMessage: 'Curriculum review complete for 8 programs.', timestamp: hoursAgo(4), unread: false, pinned: false, locked: false, isAnnouncement: false },
  { id: 'er3', mode: 'education', name: 'Leadership Retreat', initials: 'LR', color: '#1D9BF0', memberCount: 15, lastMessage: 'Retreat agenda and logistics confirmed. Pack layers.', timestamp: hoursAgo(1), unread: true, pinned: true, locked: false, isAnnouncement: true, readCount: 4, totalCount: 5 },
  { id: 'er4', mode: 'education', name: 'Evidence Portfolio', initials: 'EP', color: '#F59E0B', memberCount: 10, lastMessage: 'All departments submit evidence by March 10.', timestamp: hoursAgo(6), unread: false, pinned: true, locked: false, isAnnouncement: true, readCount: 4, totalCount: 6 },
  { id: 'er5', mode: 'education', name: 'Faculty Development', initials: 'FD', color: '#22C55E', memberCount: 20, lastMessage: 'Teaching excellence workshop recordings available.', timestamp: hoursAgo(3), unread: true, pinned: false, locked: false, isAnnouncement: false },
  { id: 'er6', mode: 'education', name: 'Student Affairs', initials: 'SA', color: '#EF4444', memberCount: 8, lastMessage: 'Spring orientation planning underway.', timestamp: daysAgo(1), unread: false, pinned: false, locked: false, isAnnouncement: false },
];

const EDUCATION_NEXUS: NexusEscalationV3[] = [
  { id: 'en1', mode: 'education', askerName: 'Dean Clark', askerInitials: 'DC', askerRole: 'Dean of Students', question: 'What\'s the current first-year retention rate compared to last year?', viewingContext: 'Institutional Dashboard', timestamp: hoursAgo(3), status: 'unanswered' },
  { id: 'en2', mode: 'education', askerName: 'Dr. Harris', askerInitials: 'DH', askerRole: 'Provost', question: 'How many programs are due for review this cycle?', viewingContext: 'Academic Programs', timestamp: hoursAgo(6), status: 'unanswered' },
  { id: 'en3', mode: 'education', askerName: 'Prof. Washington', askerInitials: 'PW', askerRole: 'Faculty Senate', question: 'What\'s the average class size across all departments?', viewingContext: 'Faculty Dashboard', timestamp: daysAgo(2), status: 'answered_by_nexus', answer: 'Average class size is 18.4 students, down from 21.2 last year. STEM courses average 16.1.', resolvedAnswer: 'Average class size is 18.4 students, down from 21.2 last year. STEM courses average 16.1.', answeredBy: 'Nexus' },
];

// =============================================================================
// COMPETITION — 3SSB Commissioner
// =============================================================================

const COMPETITION_INBOX: InboxThreadV3[] = [
  { id: 'ki1', mode: 'competition', name: 'Carlos Hernandez', initials: 'CH', role: 'Race Director', preview: 'Track inspection complete. All barriers meet FIA spec.', timestamp: hoursAgo(1), unread: true, pinned: true, isRequest: false },
  { id: 'ki2', mode: 'competition', name: 'FIA Liaison', initials: 'FL', role: 'Governing Body', preview: 'Updated safety protocols for wet conditions approved.', timestamp: hoursAgo(3), unread: false, pinned: true, isRequest: false },
  { id: 'ki3', mode: 'competition', name: 'Takeshi Yamamoto', initials: 'TY', role: 'Team Principal', preview: 'Requesting clarification on the new aero regulations.', timestamp: hoursAgo(2), unread: true, pinned: false, isRequest: false },
  { id: 'ki4', mode: 'competition', name: 'Marco Rossi', initials: 'MR', role: 'Chief Steward', preview: 'Steward panel recommendations for Round 4 incidents.', timestamp: hoursAgo(5), unread: true, pinned: false, isRequest: false },
  { id: 'ki5', mode: 'competition', name: 'Sophie Laurent', initials: 'SL', role: 'Media Director', preview: 'Broadcast partner wants to discuss camera placement for Monaco.', timestamp: hoursAgo(8), unread: true, pinned: false, isRequest: false },
  { id: 'ki6', mode: 'competition', name: 'Carlos Vega', initials: 'CV', role: 'New Team Entry', preview: 'Applying for 3SSB grid expansion. Documentation attached.', timestamp: hoursAgo(12), unread: false, pinned: false, isRequest: true },
  { id: 'ki7', mode: 'competition', name: 'Medical Team', initials: 'MT', role: 'Medical', preview: 'All medical stations confirmed operational for Round 5.', timestamp: daysAgo(1), unread: false, pinned: false, isRequest: false },
  { id: 'ki8', mode: 'competition', name: 'Logistics', initials: 'LG', role: 'Operations', preview: 'Freight schedule confirmed for the European leg.', timestamp: daysAgo(1), unread: false, pinned: false, isRequest: false },
];

const COMPETITION_ROOMS: RoomV3[] = [
  { id: 'kr1', mode: 'competition', name: 'Technical Committee', initials: 'TC', color: '#1D9BF0', memberCount: 8, lastMessage: 'Engine formula review meeting next Wednesday.', timestamp: hoursAgo(2), unread: true, pinned: false, locked: true, isAnnouncement: false },
  { id: 'kr2', mode: 'competition', name: 'Stewards Panel', initials: 'SP', color: '#1D9BF0', memberCount: 5, lastMessage: 'Incident review procedures updated.', timestamp: hoursAgo(4), unread: false, pinned: false, locked: true, isAnnouncement: false },
  { id: 'kr3', mode: 'competition', name: 'Pre-Race Briefing', initials: 'RB', color: '#22C55E', memberCount: 30, lastMessage: 'All teams mandatory attendance. 9am Saturday.', timestamp: hoursAgo(1), unread: true, pinned: true, locked: false, isAnnouncement: true, readCount: 3, totalCount: 4 },
  { id: 'kr4', mode: 'competition', name: 'Entry Fee Notice', initials: 'EF', color: '#F59E0B', memberCount: 20, lastMessage: 'Round 6-8 entry fees due by March 15.', timestamp: hoursAgo(6), unread: false, pinned: true, locked: false, isAnnouncement: true, readCount: 5, totalCount: 6 },
  { id: 'kr5', mode: 'competition', name: 'Safety Commission', initials: 'SC', color: '#EF4444', memberCount: 10, lastMessage: 'New barrier specifications distributed.', timestamp: hoursAgo(3), unread: true, pinned: false, locked: false, isAnnouncement: false },
  { id: 'kr6', mode: 'competition', name: 'Broadcast Ops', initials: 'BO', color: '#1D9BF0', memberCount: 15, lastMessage: 'Camera rig positions confirmed for Round 5.', timestamp: daysAgo(1), unread: false, pinned: false, locked: false, isAnnouncement: false },
];

const COMPETITION_NEXUS: NexusEscalationV3[] = [
  { id: 'kn1', mode: 'competition', askerName: 'Takeshi Yamamoto', askerInitials: 'TY', askerRole: 'Team Principal', question: 'How does the new aero package compare to last season\'s downforce numbers?', viewingContext: 'Technical Regulations', timestamp: hoursAgo(2), status: 'unanswered' },
  { id: 'kn2', mode: 'competition', askerName: 'Marco Rossi', askerInitials: 'MR', askerRole: 'Chief Steward', question: 'What\'s the average penalty points per driver this season?', viewingContext: 'Steward Dashboard', timestamp: hoursAgo(8), status: 'unanswered' },
  { id: 'kn3', mode: 'competition', askerName: 'Sophie Laurent', askerInitials: 'SL', askerRole: 'Media Director', question: 'Which races had the highest viewership last season?', viewingContext: 'Broadcast Analytics', timestamp: daysAgo(1), status: 'answered_by_nexus', answer: 'Monaco led with 12.4M viewers, followed by the season finale at 11.8M and the night race at 10.2M.', resolvedAnswer: 'Monaco led with 12.4M viewers, followed by the season finale at 11.8M and the night race at 10.2M.', answeredBy: 'Nexus' },
];

// =============================================================================
// ROOM THREAD MESSAGES (Sports)
// =============================================================================

const SPORTS_ROOM_MESSAGES: Record<string, RoomMessageV3[]> = {
  'sr-staff': [
    { id: 'rm1', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Film review at 2pm today. Everyone bring scouting notes from the Bethel game.', timestamp: hoursAgo(2), isMe: false },
    { id: 'rm2', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Got it. I have the defensive breakdowns ready — they ran a 1-3-1 zone in the second half that gave us trouble.', timestamp: hoursAgo(2), isMe: true },
    { id: 'rm3', sender: 'Marcus Davis', initials: 'MD', role: 'Video Coordinator', content: 'Clips are uploaded. Folder: "Bethel Game Film" — 14 possessions tagged for zone offense.', timestamp: hoursAgo(1.5), isMe: false },
    { id: 'rm4', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: '@Pearson can you prep 3 zone attack sets before the meeting?', timestamp: hoursAgo(1), isMe: false, mentions: ['Pearson'] },
    { id: 'rm5', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'On it. Will have the motion reads diagrammed by 1:30.', timestamp: hoursAgo(0.5), isMe: true },
  ],
  'sr-ann': [
    { id: 'rm-a1', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Practice moved to 3pm today due to facility maintenance. Check your email for the updated schedule.', timestamp: hoursAgo(1), isMe: false },
    { id: 'rm-a2', sender: 'Jaylen Thomas', initials: 'JT', role: 'Student Athlete', content: 'Copy that, Coach.', timestamp: hoursAgo(0.8), isMe: false },
    { id: 'rm-a3', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Guards — still bring your film notebooks. We\'re doing PNR reads first.', timestamp: hoursAgo(0.5), isMe: true },
  ],
  'sr-scout': [
    { id: 'rm-s1', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Just posted the Mitchell eval. Strong PNR reads, solid mid-range. Needs work on transition D and closeouts.', timestamp: hoursAgo(4), isMe: true },
    { id: 'rm-s2', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Good work. What\'s his KR projection looking like?', timestamp: hoursAgo(3.5), isMe: false },
    { id: 'rm-s3', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'KR 72 overall. Shooting cluster 81, Playmaking 74, Perimeter D 58. The defensive upside is there but raw.', timestamp: hoursAgo(3), isMe: true },
    { id: 'rm-s4', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Let\'s schedule the campus visit. @Recruiting get the paperwork started.', timestamp: hoursAgo(2.5), isMe: false, mentions: ['Recruiting'] },
  ],
  'sr-coaches': [
    { id: 'rm-c1', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Thomas is cleared for full contact. Moving him back to starting 5 for Saturday.', timestamp: hoursAgo(1.5), isMe: false },
    { id: 'rm-c2', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Good to hear. That changes our rotation — Williams back to 6th man role. I\'ll adjust the sub patterns.', timestamp: hoursAgo(1), isMe: true },
    { id: 'rm-c3', sender: 'Coach Reed', initials: 'CR', role: 'Strength Coach', content: 'Thomas looked strong in the agility test today. No issues.', timestamp: hoursAgo(0.5), isMe: false },
  ],
  'sr-reccore': [
    { id: 'rm-r1', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Mitchell visit confirmed for next Tuesday. Campus tour in the morning, film session after lunch.', timestamp: hoursAgo(2), isMe: true },
    { id: 'rm-r2', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Perfect. I\'ll clear my schedule for the 1pm sit-down. Make sure we have the scholarship packet ready.', timestamp: hoursAgo(1.5), isMe: false },
    { id: 'rm-r3', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Already prepped. Also have 2 backup targets if Mitchell doesn\'t commit — both guards with similar profiles.', timestamp: hoursAgo(1), isMe: true },
  ],
};

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
// CHURCH — Mentions + Inbox Escalations
// =============================================================================

const CHURCH_MENTIONS: MentionV3[] = [
  { id: 'cm1', mode: 'church', roomName: 'Worship Team', senderName: 'Funmi Adeyemi', senderInitials: 'FA', preview: '@You song list for Sunday is updated — can you review the order?', timestamp: hoursAgo(2) },
  { id: 'cm2', mode: 'church', roomName: 'Youth Ministry', senderName: 'Brother Thompson', senderInitials: 'BT', preview: '@You we need a volunteer for the Friday night session, can you cover?', timestamp: hoursAgo(5) },
  { id: 'cm3', mode: 'church', roomName: 'Good Friday Service', senderName: 'Chioma Okonkwo', senderInitials: 'CO', preview: '@You please confirm your arrival time for volunteer setup', timestamp: hoursAgo(8) },
];

const CHURCH_INBOX_ESCALATIONS: InboxEscalationV3[] = [
  { id: 'ce1', mode: 'church', requesterName: 'Michael Chen', requesterInitials: 'MC', questionPreview: 'How do I sign up for the men\'s fellowship group?', linkedContext: 'Ministry Directory', status: 'needs_reply', timestamp: hoursAgo(3) },
  { id: 'ce2', mode: 'church', requesterName: 'Sister Davis', requesterInitials: 'SD', questionPreview: 'Can volunteers bring children to the community meal prep?', linkedContext: 'Outreach Event', status: 'needs_reply', timestamp: hoursAgo(6) },
  { id: 'ce3', mode: 'church', requesterName: 'Deacon Williams', requesterInitials: 'DW', questionPreview: 'Approve facility booking for deacon board retreat', linkedContext: 'Facilities', status: 'replied', timestamp: daysAgo(1) },
];

// =============================================================================
// CHURCH — Room Messages
// =============================================================================

const CHURCH_ROOM_MESSAGES: Record<string, RoomMessageV3[]> = {
  'cr1': [
    { id: 'crm1', sender: 'Chioma Okonkwo', initials: 'CO', role: 'Associate Pastor', content: 'Strategic planning session confirmed for next Tuesday at 7pm.', timestamp: hoursAgo(2), isMe: false },
    { id: 'crm2', sender: 'You', initials: 'ME', role: 'Member', content: 'I\'ll prepare the ministry growth report for the meeting.', timestamp: hoursAgo(1.5), isMe: true },
    { id: 'crm3', sender: 'Deacon Williams', initials: 'DW', role: 'Deacon Board', content: 'I\'ll bring the building fund update as well.', timestamp: hoursAgo(1), isMe: false },
  ],
  'cr3': [
    { id: 'crm4', sender: 'Chioma Okonkwo', initials: 'CO', role: 'Associate Pastor', content: 'Service times: 12pm and 7pm. All volunteers report at 11am.', timestamp: hoursAgo(1), isMe: false },
    { id: 'crm5', sender: 'You', initials: 'ME', role: 'Member', content: 'I\'ll be there at 11. Do we need extra chairs set up?', timestamp: hoursAgo(0.8), isMe: true },
    { id: 'crm6', sender: 'Chioma Okonkwo', initials: 'CO', role: 'Associate Pastor', content: 'Yes, please set up 50 extra chairs in the overflow area. Thank you!', timestamp: hoursAgo(0.5), isMe: false },
  ],
  'cr5': [
    { id: 'crm7', sender: 'Funmi Adeyemi', initials: 'FA', role: 'Worship Leader', content: 'Rehearsal moved to Thursday 6pm. Updated song list in the shared folder.', timestamp: hoursAgo(3), isMe: false },
    { id: 'crm8', sender: 'You', initials: 'ME', role: 'Member', content: 'Got it. I\'ll review the new songs before rehearsal.', timestamp: hoursAgo(2.5), isMe: true },
  ],
};

const MENTIONS_MAP: Record<Mode, MentionV3[]> = {
  sports: SPORTS_MENTIONS,
  church: CHURCH_MENTIONS,
  business: [],
  education: [],
  competition: [],
};

const INBOX_ESCALATIONS_MAP: Record<Mode, InboxEscalationV3[]> = {
  sports: SPORTS_INBOX_ESCALATIONS,
  church: CHURCH_INBOX_ESCALATIONS,
  business: [],
  education: [],
  competition: [],
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

export function getInboxMentions(mode: Mode): MentionV3[] {
  return MENTIONS_MAP[mode] ?? [];
}

export function getInboxEscalations(mode: Mode): InboxEscalationV3[] {
  return INBOX_ESCALATIONS_MAP[mode] ?? [];
}

export function getRoomMessages(roomId: string): RoomMessageV3[] {
  return SPORTS_ROOM_MESSAGES[roomId] ?? CHURCH_ROOM_MESSAGES[roomId] ?? [];
}

export function getUnansweredCount(mode: Mode): number {
  return getNexusEscalations(mode).filter((e) => e.status === 'unanswered' || e.status === 'escalated').length;
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
