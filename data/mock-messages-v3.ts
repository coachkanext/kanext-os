/**
 * Messages V3 — Seed data for all 5 modes.
 * 40 inbox threads (8/mode), 30 rooms (6/mode), 15 nexus escalations (3/mode).
 */

import type { Mode, InboxThreadV3, RoomV3, NexusEscalationV3, MentionV3, InboxEscalationV3, RoomMessageV3, MessageReaction } from '@/types';

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
  // ── Campus Rooms (seeded, campus-scoped, V1–V2) ──
  { id: 'cr-ann', mode: 'church', name: '#campus-announcements', initials: 'CA', color: '#EF4444', memberCount: 340, lastMessage: 'Good Friday services at 12pm and 7pm. All volunteers report at 11am.', timestamp: hoursAgo(1), unread: true, pinned: true, locked: false, isAnnouncement: true, readCount: 210, totalCount: 340, category: 'campus', pinnedMessage: 'Easter Week Schedule — updated Feb 25' },
  { id: 'cr-prayer', mode: 'church', name: '#prayer-requests', initials: 'PR', color: '#8B5CF6', memberCount: 285, lastMessage: 'Please keep Sister Johnson in prayer as she recovers from surgery.', timestamp: hoursAgo(2), unread: true, pinned: true, locked: false, isAnnouncement: false, category: 'campus' },
  { id: 'cr-events', mode: 'church', name: '#events', initials: 'EV', color: '#22C55E', memberCount: 310, lastMessage: 'Community meal this Saturday 10am — volunteers needed for setup.', timestamp: hoursAgo(3), unread: true, pinned: false, locked: false, isAnnouncement: false, category: 'campus' },
  { id: 'cr-vol', mode: 'church', name: '#volunteer-updates', initials: 'VU', color: '#F59E0B', memberCount: 120, lastMessage: 'Volunteer appreciation dinner RSVP deadline extended to Sunday.', timestamp: hoursAgo(5), unread: false, pinned: false, locked: false, isAnnouncement: false, category: 'campus' },
  { id: 'cr-svc', mode: 'church', name: '#service-coordination', initials: 'SC', color: '#1D9BF0', memberCount: 45, lastMessage: 'A/V team please test livestream equipment by Thursday EOD.', timestamp: hoursAgo(4), unread: false, pinned: false, locked: true, isAnnouncement: false, category: 'campus' },
  // ── Ministry Rooms (V3, ministry-scoped) ──
  { id: 'cr-child', mode: 'church', name: '#childrens-team', initials: 'CT', color: '#F59E0B', memberCount: 18, lastMessage: 'Lesson plan for Palm Sunday uploaded. Review before Saturday.', timestamp: hoursAgo(2), unread: true, pinned: false, locked: false, isAnnouncement: false, category: 'ministry' },
  { id: 'cr-lesson', mode: 'church', name: '#childrens-lesson-plan', initials: 'LP', color: '#F59E0B', memberCount: 12, lastMessage: 'New curriculum materials for Easter week added to shared folder.', timestamp: hoursAgo(6), unread: false, pinned: false, locked: false, isAnnouncement: false, category: 'ministry', pinnedMessage: 'Curriculum template — use for all lesson submissions' },
  { id: 'cr-singles', mode: 'church', name: '#singles-ministry', initials: 'SM', color: '#EC4899', memberCount: 32, lastMessage: 'Game night this Friday 7pm at the fellowship hall. Bring snacks!', timestamp: hoursAgo(3), unread: true, pinned: false, locked: false, isAnnouncement: false, category: 'ministry' },
  // ── Direct Rooms (small-group, RBAC-gated) ──
  { id: 'cr-cteach', mode: 'church', name: 'Children Teachers Only', initials: 'TO', color: '#F59E0B', memberCount: 6, lastMessage: 'Background check renewals due by March 15 — see pinned link.', timestamp: hoursAgo(4), unread: true, pinned: false, locked: true, isAnnouncement: false, category: 'direct', pinnedMessage: 'Background check form — submit to office' },
  { id: 'cr-score', mode: 'church', name: 'Singles Core Team', initials: 'SK', color: '#EC4899', memberCount: 4, lastMessage: 'Planning meeting for spring retreat moved to Wednesday 8pm.', timestamp: hoursAgo(8), unread: false, pinned: false, locked: true, isAnnouncement: false, category: 'direct' },
];

const CHURCH_NEXUS: NexusEscalationV3[] = [
  // ── Unanswered (in queue) ──
  {
    id: 'cn1', mode: 'church', askerName: 'Funmi Adeyemi', askerInitials: 'FA', askerRole: 'Worship Leader',
    question: 'What songs have we done most in the last 3 months?',
    viewingContext: 'Worship Planning', timestamp: hoursAgo(2), status: 'unanswered',
    contextChips: [{ type: 'media', label: 'Worship Setlists' }],
  },
  {
    id: 'cn2', mode: 'church', askerName: 'Brother Thompson', askerInitials: 'BT', askerRole: 'Youth Ministry Lead',
    question: 'What\'s our average youth attendance this quarter?',
    viewingContext: 'Ministry Dashboard', timestamp: hoursAgo(6), status: 'unanswered',
    contextChips: [{ type: 'event', label: 'Youth Services' }],
  },
  // ── Answered by Nexus (instant) ──
  {
    id: 'cn3', mode: 'church', askerName: 'Sister Davis', askerInitials: 'SD', askerRole: 'Outreach',
    question: 'How many community meals have we served this year?',
    viewingContext: 'Outreach Report', timestamp: daysAgo(2), status: 'answered_by_nexus',
    nexusAttempt: 'We\'ve served 1,247 meals across 18 community events this year, up 15% from last year.',
    resolvedAnswer: 'We\'ve served 1,247 meals across 18 community events this year, up 15% from last year.',
    answeredBy: 'Nexus',
    contextChips: [{ type: 'event', label: 'Community Meals' }],
  },
  {
    id: 'cn4', mode: 'church', askerName: 'Michael Chen', askerInitials: 'MC', askerRole: 'New Member',
    question: 'What time is the Easter sunrise service?',
    viewingContext: 'Events Calendar', timestamp: hoursAgo(4), status: 'answered_by_nexus',
    nexusAttempt: 'The Easter sunrise service is at 6:30 AM on Sunday, April 20th at the main campus courtyard. Doors open at 6:00 AM.',
    resolvedAnswer: 'The Easter sunrise service is at 6:30 AM on Sunday, April 20th at the main campus courtyard. Doors open at 6:00 AM.',
    answeredBy: 'Nexus',
    contextChips: [{ type: 'event', label: 'Easter Sunrise Service' }],
  },
  {
    id: 'cn5', mode: 'church', askerName: 'Sister Nkechi', askerInitials: 'SN', askerRole: 'Children\'s Teacher',
    question: 'Where can I find the children\'s curriculum materials?',
    viewingContext: 'Ministry Resources', timestamp: daysAgo(1), status: 'answered_by_nexus',
    nexusAttempt: 'Curriculum materials are in the #childrens-lesson-plan room. The current quarter\'s resources are pinned at the top. Physical copies are available in the resource closet (Room 204).',
    resolvedAnswer: 'Curriculum materials are in the #childrens-lesson-plan room. The current quarter\'s resources are pinned at the top. Physical copies are available in the resource closet (Room 204).',
    answeredBy: 'Nexus',
    contextChips: [{ type: 'media', label: 'Curriculum' }],
  },
  // ── Escalated (waiting on human) ──
  {
    id: 'cn6', mode: 'church', askerName: 'Deacon Williams', askerInitials: 'DW', askerRole: 'Deacon Board',
    question: 'Can we allocate building fund reserves for the parking lot expansion?',
    viewingContext: 'Facilities', timestamp: hoursAgo(3), status: 'escalated',
    nexusAttempt: 'Building fund reserves currently stand at $142,000. However, allocation decisions for capital expenditures require Finance Committee and Elder Board approval.',
    escalationTarget: 'Pastor Philip',
    contextChips: [{ type: 'event', label: 'Building Fund' }],
  },
  {
    id: 'cn7', mode: 'church', askerName: 'Sister Davis', askerInitials: 'SD', askerRole: 'Outreach',
    question: 'Can we change the community meal from Saturday to Sunday after service?',
    viewingContext: 'Outreach Events', timestamp: hoursAgo(5), status: 'escalated',
    nexusAttempt: 'Schedule changes for campus events require approval from the Campus Admin or Pastor. The current Saturday time has been in place for 6 months.',
    escalationTarget: 'Chioma Okonkwo',
    contextChips: [{ type: 'event', label: 'Community Meal' }, { type: 'person', label: 'Sister Davis' }],
  },
  // ── Answered by Leader (resolved by human) ──
  {
    id: 'cn8', mode: 'church', askerName: 'Michael Chen', askerInitials: 'MC', askerRole: 'New Member',
    question: 'How do I join the men\'s fellowship group?',
    viewingContext: 'Ministry Directory', timestamp: daysAgo(1), status: 'answered_by_coach',
    nexusAttempt: 'The Men\'s Fellowship meets every other Saturday at 8 AM. To join, you can sign up through the Ministry Directory or contact the group leader directly.',
    humanReplies: [
      { name: 'Pastor Philip', initials: 'PP', role: 'Senior Pastor', content: 'Welcome, Michael! The men\'s group meets every other Saturday at 8 AM in the fellowship hall. I\'ll have Brother James reach out to you personally. We\'d love to have you.', timestamp: daysAgo(0.5) },
    ],
    resolvedAnswer: 'Men\'s Fellowship meets every other Saturday at 8 AM in the fellowship hall. Contact Brother James or sign up through the Ministry Directory.',
    answeredBy: 'Pastor Philip',
    contextChips: [{ type: 'person', label: 'Michael Chen' }],
  },
  {
    id: 'cn9', mode: 'church', askerName: 'Brother Thompson', askerInitials: 'BT', askerRole: 'Youth Ministry Lead',
    question: 'Do we have budget approval for the youth retreat bus rental?',
    viewingContext: 'Youth Ministry Budget', timestamp: daysAgo(2), status: 'answered_by_coach',
    nexusAttempt: 'The youth ministry budget for Q1 includes $2,400 for transportation. Current spend is $800, leaving $1,600 available. However, bus rental approval requires Finance Committee sign-off.',
    humanReplies: [
      { name: 'Chioma Okonkwo', initials: 'CO', role: 'Associate Pastor', content: 'Approved. The bus rental is within budget. Please submit the vendor invoice to the church office by next Friday for processing.', timestamp: daysAgo(1.5) },
    ],
    resolvedAnswer: 'Approved — within Q1 youth ministry transportation budget ($1,600 remaining). Submit vendor invoice to church office by Friday.',
    answeredBy: 'Chioma Okonkwo',
    contextChips: [{ type: 'event', label: 'Youth Retreat' }],
  },
  {
    id: 'cn10', mode: 'church', askerName: 'Funmi Adeyemi', askerInitials: 'FA', askerRole: 'Worship Leader',
    question: 'Can we add a second rehearsal slot for the Easter choir?',
    viewingContext: 'Worship Calendar', timestamp: daysAgo(3), status: 'answered_by_coach',
    nexusAttempt: 'Current worship rehearsal is Thursday 6 PM. Adding a second slot would need facility availability confirmation and Pastor approval for scheduling.',
    humanReplies: [
      { name: 'Pastor Philip', initials: 'PP', role: 'Senior Pastor', content: 'Yes — let\'s add Saturday 10 AM for the Easter choir. The sanctuary is available. Please coordinate with the A/V team for sound check.', timestamp: daysAgo(2.5) },
    ],
    resolvedAnswer: 'Approved — second Easter choir rehearsal added: Saturday 10 AM in the sanctuary. Coordinate A/V sound check.',
    answeredBy: 'Pastor Philip',
    contextChips: [{ type: 'event', label: 'Easter Choir' }, { type: 'media', label: 'Worship Calendar' }],
  },
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
  // ── Unanswered ──
  {
    id: 'bn1', mode: 'business',
    askerName: 'You', askerInitials: 'ME', askerRole: 'Founder / CEO',
    question: 'What\'s the current runway if we approve the $420K engineering headcount increase?',
    viewingContext: 'Finance',
    timestamp: hoursAgo(1),
    status: 'unanswered',
    contextChips: [
      { type: 'finance', label: 'Engineering Budget' },
      { type: 'capital', label: 'Series B' },
    ],
  },
  {
    id: 'bn2', mode: 'business',
    askerName: 'Rachel Torres', askerInitials: 'RT', askerRole: 'COO',
    question: 'What are the terms on the Floor 3 lease draft? Is it below market rate?',
    viewingContext: 'Facilities',
    timestamp: hoursAgo(3),
    status: 'unanswered',
    contextChips: [
      { type: 'facility', label: 'Office Expansion' },
    ],
  },
  // ── Escalated ──
  {
    id: 'bn3', mode: 'business',
    askerName: 'You', askerInitials: 'ME', askerRole: 'Founder / CEO',
    question: 'Is the NovaTech liability cap at $2M sufficient for our exposure level? What should our counter-proposal be?',
    viewingContext: 'Deals',
    timestamp: hoursAgo(4),
    status: 'escalated',
    contextChips: [
      { type: 'deal', label: 'NovaTech Partnership' },
      { type: 'compliance', label: 'Liability Assessment' },
    ],
    nexusAttempt: 'Based on projected revenue flow through the partnership, estimated max liability exposure is $3.8M over 3 years. A $2M cap is below our standard minimum of $5M. However, contract-specific risk depends on indemnification clauses and insurance coverage — escalating to General Counsel for definitive assessment.',
    escalationTarget: 'General Counsel',
  },
  {
    id: 'bn4', mode: 'business',
    askerName: 'James Park', askerInitials: 'JP', askerRole: 'CFO',
    question: 'Do we need board approval for the option pool expansion from 12% to 15% before Series B close?',
    viewingContext: 'Capital',
    timestamp: hoursAgo(6),
    status: 'escalated',
    contextChips: [
      { type: 'capital', label: 'Series B' },
      { type: 'policy', label: 'Option Pool' },
    ],
    nexusAttempt: 'Option pool expansion typically requires board consent per company bylaws and existing investor agreements. The specific threshold and approval mechanism depend on your Certificate of Incorporation and existing shareholder agreements — escalating to General Counsel for confirmation.',
    escalationTarget: 'General Counsel',
  },
  {
    id: 'bn5', mode: 'business',
    askerName: 'Elena Park', askerInitials: 'EP', askerRole: 'VP Product',
    question: 'Can we offer a 60-day enterprise pilot to Meridian Partners without a signed MSA?',
    viewingContext: 'Deals',
    timestamp: hoursAgo(10),
    status: 'escalated',
    contextChips: [
      { type: 'deal', label: 'Meridian Partners Pilot' },
      { type: 'compliance', label: 'Contract Requirements' },
    ],
    nexusAttempt: 'Standard policy requires a signed MSA before providing production access. A pilot agreement (lighter than full MSA) may be acceptable with appropriate liability protections. Escalating to Legal for guidance on minimum contractual requirements for pilot engagements.',
    escalationTarget: 'General Counsel',
  },
  // ── Answered by Nexus ──
  {
    id: 'bn6', mode: 'business',
    askerName: 'Kofi Achebe', askerInitials: 'KA', askerRole: 'CTO',
    question: 'What\'s our current server cost per active user after the CDN migration?',
    viewingContext: 'Infrastructure',
    timestamp: daysAgo(1),
    status: 'answered_by_nexus',
    contextChips: [
      { type: 'finance', label: 'Infrastructure Costs' },
    ],
    nexusAttempt: 'Current cost is $0.012 per active user per month, down from $0.018 pre-migration. That\'s a 33% reduction. Monthly infrastructure spend: $24K (was $36K). Savings annualized: $144K.',
    resolvedAnswer: 'Current cost is $0.012 per active user per month, down from $0.018 pre-migration. That\'s a 33% reduction. Monthly infrastructure spend: $24K (was $36K). Savings annualized: $144K.',
    answeredBy: 'Nexus',
  },
  {
    id: 'bn7', mode: 'business',
    askerName: 'You', askerInitials: 'ME', askerRole: 'Founder / CEO',
    question: 'What\'s the current monthly burn rate and cash position?',
    viewingContext: 'Finance',
    timestamp: daysAgo(2),
    status: 'answered_by_nexus',
    contextChips: [
      { type: 'finance', label: 'Burn Rate' },
      { type: 'capital', label: 'Cash Position' },
    ],
    nexusAttempt: 'Monthly burn: $455K (down from $512K). Cash on hand: $8.2M. Current runway: 18.0 months. Burn reduction driven by CDN migration savings ($57K/month).',
    resolvedAnswer: 'Monthly burn: $455K (down from $512K). Cash on hand: $8.2M. Current runway: 18.0 months. Burn reduction driven by CDN migration savings ($57K/month).',
    answeredBy: 'Nexus',
  },
  // ── Answered by Human ──
  {
    id: 'bn8', mode: 'business',
    askerName: 'You', askerInitials: 'ME', askerRole: 'Founder / CEO',
    question: 'Has the SOC 2 data governance attestation been board-approved, or do we need a separate board vote?',
    viewingContext: 'Compliance',
    timestamp: daysAgo(3),
    status: 'answered_by_coach',
    contextChips: [
      { type: 'compliance', label: 'SOC 2 Audit' },
      { type: 'policy', label: 'Data Governance' },
    ],
    nexusAttempt: 'The data governance policy was adopted by executive leadership. Board-level ratification status is unclear from available records — escalating to General Counsel for confirmation.',
    escalationTarget: 'General Counsel',
    humanReplies: [
      {
        name: 'Sarah Kim',
        initials: 'SK',
        role: 'General Counsel',
        content: 'The data governance policy was ratified by the board in the January 2026 meeting (Resolution 2026-003). No separate vote is needed. You can sign the attestation referencing that resolution number.',
        timestamp: daysAgo(2.5),
      },
    ],
    resolvedAnswer: 'Board-approved. Ratified January 2026 (Resolution 2026-003). CEO can sign attestation referencing that resolution. Validated by General Counsel.',
    answeredBy: 'Sarah Kim (General Counsel)',
  },
  {
    id: 'bn9', mode: 'business',
    askerName: 'James Park', askerInitials: 'JP', askerRole: 'CFO',
    question: 'What is the maximum single-payment approval authority for VP-level executives?',
    viewingContext: 'Finance',
    timestamp: daysAgo(4),
    status: 'answered_by_coach',
    contextChips: [
      { type: 'finance', label: 'Approval Thresholds' },
      { type: 'policy', label: 'Authority Matrix' },
    ],
    nexusAttempt: 'Standard corporate governance frameworks typically set VP approval at $50K-$250K. Your specific threshold depends on the board-approved authority matrix — escalating to Founder for confirmation.',
    escalationTarget: 'Founder / CEO',
    humanReplies: [
      {
        name: 'You',
        initials: 'ME',
        role: 'Founder / CEO',
        content: 'VP approval threshold is $250K for single payments. Anything above requires CEO sign-off. Anything above $1M requires board approval. This is in the authority matrix approved Q4 2025.',
        timestamp: daysAgo(3.5),
      },
    ],
    resolvedAnswer: 'VP: up to $250K single payment. CEO: $250K–$1M. Board: above $1M. Per authority matrix approved Q4 2025. Validated by Founder / CEO.',
    answeredBy: 'Founder / CEO',
  },
  {
    id: 'bn10', mode: 'business',
    askerName: 'Rachel Torres', askerInitials: 'RT', askerRole: 'COO',
    question: 'Does the EMEA partnership model require a separate legal entity, or can we operate through the US parent?',
    viewingContext: 'Strategy',
    timestamp: daysAgo(5),
    status: 'answered_by_coach',
    contextChips: [
      { type: 'deal', label: 'EMEA Expansion' },
      { type: 'compliance', label: 'Entity Structure' },
    ],
    nexusAttempt: 'Partnership model (Option B) typically does not require a separate legal entity for the first 12 months if the local partner handles in-country operations. Tax implications and regulatory requirements vary by target country — escalating to General Counsel.',
    escalationTarget: 'General Counsel',
    humanReplies: [
      {
        name: 'Sarah Kim',
        initials: 'SK',
        role: 'General Counsel',
        content: 'For the UK partnership model, we can operate through the US parent for the first 12 months under the partnership agreement. If we establish a permanent establishment (office, employees, or billing), we\'ll need a UK subsidiary. I recommend revisiting at the 9-month mark.',
        timestamp: daysAgo(4.5),
      },
    ],
    resolvedAnswer: 'No separate entity needed for first 12 months under partnership model. Reassess at 9-month mark. UK subsidiary required only if permanent establishment is created. Validated by General Counsel.',
    answeredBy: 'Sarah Kim (General Counsel)',
  },
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
    { id: 'rm1', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Film review at 2pm today. Everyone bring scouting notes from the Bethel game.', timestamp: hoursAgo(2), isMe: false, replyCount: 3, threadReplies: [
      { id: 'rm1-r1', sender: 'Coach Reed', initials: 'CR', role: 'Strength Coach', content: 'I\'ll have the conditioning report ready too.', timestamp: hoursAgo(1.8), isMe: false },
      { id: 'rm1-r2', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Can we also cover the press break? They struggled with it.', timestamp: hoursAgo(1.6), isMe: true },
      { id: 'rm1-r3', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Yes — add it to the agenda. Good call.', timestamp: hoursAgo(1.5), isMe: false },
    ], reactions: [{ emoji: '\uD83D\uDC4D', count: 4, byMe: true }] },
    { id: 'rm2', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Got it. I have the defensive breakdowns ready — they ran a 1-3-1 zone in the second half that gave us trouble.', timestamp: hoursAgo(2), isMe: true, reactions: [{ emoji: '\uD83D\uDD25', count: 2, byMe: false }] },
    { id: 'rm3', sender: 'Marcus Davis', initials: 'MD', role: 'Video Coordinator', content: 'Clips are uploaded. Folder: "Bethel Game Film" — 14 possessions tagged for zone offense.', timestamp: hoursAgo(1.5), isMe: false, replyCount: 1, threadReplies: [
      { id: 'rm3-r1', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Thanks Marcus. Can you also tag their transition sets?', timestamp: hoursAgo(1.3), isMe: true },
    ] },
    { id: 'rm4', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: '@Pearson can you prep 3 zone attack sets before the meeting?', timestamp: hoursAgo(1), isMe: false, mentions: ['Pearson'] },
    { id: 'rm5', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'On it. Will have the motion reads diagrammed by 1:30.', timestamp: hoursAgo(0.5), isMe: true },
    { id: 'rm6', sender: 'Coach Reed', initials: 'CR', role: 'Strength Coach', content: '', timestamp: hoursAgo(0.3), isMe: false, voiceNote: { uri: 'voice://rm6', duration: 12, transcript: 'Quick update — Thomas hit all his agility marks in the morning session. Zero discomfort. He\'s good to go full contact.' } },
  ],
  'sr-ann': [
    { id: 'rm-a1', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Practice moved to 3pm today due to facility maintenance. Check your email for the updated schedule.', timestamp: hoursAgo(1), isMe: false, replyCount: 5, threadReplies: [
      { id: 'rm-a1-r1', sender: 'Jaylen Thomas', initials: 'JT', role: 'Student Athlete', content: 'Does that affect the weight room time too?', timestamp: hoursAgo(0.9), isMe: false },
      { id: 'rm-a1-r2', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Weight room is open as usual. Just the main gym is affected.', timestamp: hoursAgo(0.85), isMe: false },
      { id: 'rm-a1-r3', sender: 'Tyree Williams', initials: 'TW', role: 'Student Athlete', content: 'Got it. I\'ll be there early for shooting.', timestamp: hoursAgo(0.8), isMe: false },
      { id: 'rm-a1-r4', sender: 'DeShawn Mitchell', initials: 'DM', role: 'Student Athlete', content: 'Copy.', timestamp: hoursAgo(0.75), isMe: false },
      { id: 'rm-a1-r5', sender: 'Marcus Davis', initials: 'MD', role: 'Video Coordinator', content: 'Film room available from 1pm if anyone wants early film work.', timestamp: hoursAgo(0.7), isMe: false },
    ], reactions: [{ emoji: '\uD83D\uDC4D', count: 12, byMe: true }, { emoji: '\u2705', count: 8, byMe: false }] },
    { id: 'rm-a2', sender: 'Jaylen Thomas', initials: 'JT', role: 'Student Athlete', content: 'Copy that, Coach.', timestamp: hoursAgo(0.8), isMe: false },
    { id: 'rm-a3', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Guards — still bring your film notebooks. We\'re doing PNR reads first.', timestamp: hoursAgo(0.5), isMe: true, reactions: [{ emoji: '\uD83D\uDC4D', count: 3, byMe: false }] },
  ],
  'sr-scout': [
    { id: 'rm-s1', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Just posted the Mitchell eval. Strong PNR reads, solid mid-range. Needs work on transition D and closeouts.', timestamp: hoursAgo(4), isMe: true, replyCount: 2, threadReplies: [
      { id: 'rm-s1-r1', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'How does his wingspan compare to our current guards?', timestamp: hoursAgo(3.8), isMe: false },
      { id: 'rm-s1-r2', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: '6\'7" wingspan on a 6\'2" frame. Elite for his height. Should help with the defensive concerns.', timestamp: hoursAgo(3.6), isMe: true },
    ] },
    { id: 'rm-s2', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Good work. What\'s his KR projection looking like?', timestamp: hoursAgo(3.5), isMe: false },
    { id: 'rm-s3', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'KR 72 overall. Shooting cluster 81, Playmaking 74, Perimeter D 58. The defensive upside is there but raw.', timestamp: hoursAgo(3), isMe: true, reactions: [{ emoji: '\uD83D\uDD25', count: 2, byMe: false }, { emoji: '\uD83D\uDC40', count: 1, byMe: false }] },
    { id: 'rm-s4', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Let\'s schedule the campus visit. @Recruiting get the paperwork started.', timestamp: hoursAgo(2.5), isMe: false, mentions: ['Recruiting'] },
  ],
  'sr-coaches': [
    { id: 'rm-c1', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Thomas is cleared for full contact. Moving him back to starting 5 for Saturday.', timestamp: hoursAgo(1.5), isMe: false, reactions: [{ emoji: '\uD83D\uDE4C', count: 3, byMe: true }] },
    { id: 'rm-c2', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Good to hear. That changes our rotation — Williams back to 6th man role. I\'ll adjust the sub patterns.', timestamp: hoursAgo(1), isMe: true, replyCount: 2, threadReplies: [
      { id: 'rm-c2-r1', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Keep Williams\' minutes around 18-20. Don\'t want to overload him off the bench.', timestamp: hoursAgo(0.8), isMe: false },
      { id: 'rm-c2-r2', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Will do. I\'ll slot him in at the 4-min and 8-min marks.', timestamp: hoursAgo(0.6), isMe: true },
    ] },
    { id: 'rm-c3', sender: 'Coach Reed', initials: 'CR', role: 'Strength Coach', content: 'Thomas looked strong in the agility test today. No issues.', timestamp: hoursAgo(0.5), isMe: false },
    { id: 'rm-c4', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: '', timestamp: hoursAgo(0.2), isMe: false, voiceNote: { uri: 'voice://rm-c4', duration: 8, transcript: 'Also — tell the guys dress code for Saturday is suits. Conference game, let\'s look sharp.' } },
  ],
  'sr-reccore': [
    { id: 'rm-r1', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Mitchell visit confirmed for next Tuesday. Campus tour in the morning, film session after lunch.', timestamp: hoursAgo(2), isMe: true },
    { id: 'rm-r2', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Perfect. I\'ll clear my schedule for the 1pm sit-down. Make sure we have the scholarship packet ready.', timestamp: hoursAgo(1.5), isMe: false, replyCount: 1, threadReplies: [
      { id: 'rm-r2-r1', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Packet is printed and in your office. I also included the campus life brochure his mom asked about.', timestamp: hoursAgo(1.2), isMe: true },
    ] },
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
  { id: 'cm1', mode: 'church', roomName: '#childrens-team', senderName: 'Brother Thompson', senderInitials: 'BT', preview: '@You lesson plan for Palm Sunday is uploaded — can you review?', timestamp: hoursAgo(2) },
  { id: 'cm2', mode: 'church', roomName: '#singles-ministry', senderName: 'Michael Chen', senderInitials: 'MC', preview: '@You can you bring the board games for Friday game night?', timestamp: hoursAgo(5) },
  { id: 'cm3', mode: 'church', roomName: '#campus-announcements', senderName: 'Chioma Okonkwo', senderInitials: 'CO', preview: '@You please confirm your arrival time for Good Friday volunteer setup', timestamp: hoursAgo(8) },
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
  'cr-ann': [
    { id: 'crm1', sender: 'Chioma Okonkwo', initials: 'CO', role: 'Associate Pastor', content: 'Good Friday services at 12pm and 7pm. All volunteers report at 11am.', timestamp: hoursAgo(1), isMe: false, replyCount: 4, threadReplies: [
      { id: 'crm1-r1', sender: 'Sister Davis', initials: 'SD', role: 'Outreach', content: 'I can coordinate the volunteer stations. Same setup as last year?', timestamp: hoursAgo(0.9), isMe: false },
      { id: 'crm1-r2', sender: 'Chioma Okonkwo', initials: 'CO', role: 'Associate Pastor', content: 'Yes, but add a welcome table for visitors. Expecting higher turnout.', timestamp: hoursAgo(0.85), isMe: false },
      { id: 'crm1-r3', sender: 'Brother Thompson', initials: 'BT', role: 'Youth Ministry', content: 'Youth group can help with parking. We have 8 volunteers.', timestamp: hoursAgo(0.8), isMe: false },
      { id: 'crm1-r4', sender: 'You', initials: 'ME', role: 'Member', content: 'I\'ll handle the overflow seating setup.', timestamp: hoursAgo(0.7), isMe: true },
    ], reactions: [{ emoji: '\uD83D\uDE4F', count: 18, byMe: true }, { emoji: '\u2764\uFE0F', count: 7, byMe: false }] },
    { id: 'crm2', sender: 'You', initials: 'ME', role: 'Member', content: 'I\'ll be there at 11. Do we need extra chairs for overflow?', timestamp: hoursAgo(0.8), isMe: true },
    { id: 'crm3', sender: 'Chioma Okonkwo', initials: 'CO', role: 'Associate Pastor', content: 'Yes please — set up 50 extra chairs in the overflow area. Thank you!', timestamp: hoursAgo(0.5), isMe: false },
  ],
  'cr-prayer': [
    { id: 'crm4', sender: 'Sister Davis', initials: 'SD', role: 'Outreach', content: 'Please keep Sister Johnson in prayer as she recovers from surgery.', timestamp: hoursAgo(2), isMe: false, reactions: [{ emoji: '\uD83D\uDE4F', count: 24, byMe: true }, { emoji: '\u2764\uFE0F', count: 12, byMe: true }] },
    { id: 'crm5', sender: 'Deacon Williams', initials: 'DW', role: 'Deacon Board', content: 'Praying for a full recovery. The care team will visit her tomorrow.', timestamp: hoursAgo(1.5), isMe: false, replyCount: 2, threadReplies: [
      { id: 'crm5-r1', sender: 'Sister Davis', initials: 'SD', role: 'Outreach', content: 'Can I join the visit? I\'d like to bring flowers.', timestamp: hoursAgo(1.3), isMe: false },
      { id: 'crm5-r2', sender: 'Deacon Williams', initials: 'DW', role: 'Deacon Board', content: 'Absolutely. Let\'s meet at the church at 10am and go together.', timestamp: hoursAgo(1.1), isMe: false },
    ] },
    { id: 'crm6', sender: 'You', initials: 'ME', role: 'Member', content: 'Lifting her up in prayer. Let us know if the family needs meals.', timestamp: hoursAgo(1), isMe: true },
  ],
  'cr-child': [
    { id: 'crm7', sender: 'Brother Thompson', initials: 'BT', role: 'Children\'s Ministry Lead', content: 'Lesson plan for Palm Sunday uploaded. Please review before Saturday.', timestamp: hoursAgo(2), isMe: false, replyCount: 1, threadReplies: [
      { id: 'crm7-r1', sender: 'Sister Nkechi', initials: 'SN', role: 'Teacher', content: 'Reviewed and love it! The palm branch craft is a great addition.', timestamp: hoursAgo(1.8), isMe: false },
    ] },
    { id: 'crm8', sender: 'You', initials: 'ME', role: 'Teacher', content: 'Reviewed — looks great. I\'ll prep the craft supplies for the activity.', timestamp: hoursAgo(1.5), isMe: true },
    { id: 'crm9', sender: 'Sister Nkechi', initials: 'SN', role: 'Teacher', content: 'I can bring extra construction paper and glue sticks.', timestamp: hoursAgo(1), isMe: false },
  ],
  'cr-singles': [
    { id: 'crm10', sender: 'Michael Chen', initials: 'MC', role: 'Singles Ministry', content: 'Game night this Friday 7pm at the fellowship hall. Bring snacks!', timestamp: hoursAgo(3), isMe: false, reactions: [{ emoji: '\uD83C\uDF89', count: 6, byMe: true }] },
    { id: 'crm11', sender: 'You', initials: 'ME', role: 'Member', content: 'Count me in! I\'ll bring the board games.', timestamp: hoursAgo(2.5), isMe: true },
  ],
  'cr-cteach': [
    { id: 'crm12', sender: 'Brother Thompson', initials: 'BT', role: 'Children\'s Ministry Lead', content: 'Background check renewals due by March 15. Link in the pinned message.', timestamp: hoursAgo(4), isMe: false, reactions: [{ emoji: '\uD83D\uDC4D', count: 5, byMe: true }] },
    { id: 'crm13', sender: 'You', initials: 'ME', role: 'Teacher', content: 'Just submitted mine. Takes about 3 business days to process.', timestamp: hoursAgo(3), isMe: true },
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
// GLOBAL DMs — Cross-org persistent (DMs are between people, not orgs)
// =============================================================================

const GLOBAL_DMS: InboxThreadV3[] = [
  // People you DM across all modes — they persist when you switch orgs
  { id: 'gdm1', mode: 'sports', name: 'HC Miles', initials: 'HM', role: 'Head Coach', preview: 'Let me know when you finish the Bethel scouting notes.', timestamp: hoursAgo(0.5), unread: true, pinned: true, isRequest: false },
  { id: 'gdm2', mode: 'sports', name: 'Jaylen Thomas', initials: 'JT', role: 'Student Athlete', preview: 'Coach, can we go over my film session notes?', timestamp: hoursAgo(2), unread: true, pinned: false, isRequest: false },
  { id: 'gdm3', mode: 'sports', name: 'Marcus Davis', initials: 'MD', role: 'Video Coordinator', preview: 'Clips uploaded to the shared folder.', timestamp: hoursAgo(3), unread: false, pinned: false, isRequest: false },
  { id: 'gdm4', mode: 'church', name: 'Chioma Okonkwo', initials: 'CO', role: 'Associate Pastor', preview: 'Holy Week schedule looks good. Thanks for reviewing.', timestamp: hoursAgo(4), unread: false, pinned: true, isRequest: false },
  { id: 'gdm5', mode: 'business', name: 'Kofi Achebe', initials: 'KA', role: 'CTO', preview: 'API latency improvement metrics look solid.', timestamp: hoursAgo(6), unread: false, pinned: false, isRequest: false },
  { id: 'gdm6', mode: 'sports', name: 'DeShawn Mitchell', initials: 'DM', role: 'Recruit', preview: 'Looking forward to the campus visit next Tuesday!', timestamp: hoursAgo(5), unread: true, pinned: false, isRequest: false },
  { id: 'gdm7', mode: 'education', name: 'Dean Clark', initials: 'DC', role: 'Dean of Students', preview: 'Retention numbers report is ready for review.', timestamp: hoursAgo(8), unread: false, pinned: false, isRequest: false },
  { id: 'gdm8', mode: 'church', name: 'Funmi Adeyemi', initials: 'FA', role: 'Worship Leader', preview: 'Easter song list finalized. Let me know if you want changes.', timestamp: hoursAgo(10), unread: false, pinned: false, isRequest: false },
  { id: 'gdm9', mode: 'business', name: 'Sarah Kim', initials: 'SK', role: 'Product Lead', preview: 'V3 Messages spec approved. Moving to dev.', timestamp: hoursAgo(12), unread: false, pinned: false, isRequest: false },
  { id: 'gdm10', mode: 'sports', name: 'AD Johnson', initials: 'AJ', role: 'Athletic Director', preview: 'Spring recruiting budget is approved. Go get \'em.', timestamp: daysAgo(1), unread: false, pinned: false, isRequest: false },
];

/** DM conversation messages (cross-org) */
const GLOBAL_DM_MESSAGES: Record<string, RoomMessageV3[]> = {
  'gdm1': [
    { id: 'gm1-1', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Great work on the defensive game plan for Bethel.', timestamp: hoursAgo(3), isMe: false },
    { id: 'gm1-2', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Thanks Coach. The 1-3-1 zone gave them trouble. I think we can exploit it again if they run it Saturday.', timestamp: hoursAgo(2.5), isMe: true },
    { id: 'gm1-3', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Agreed. Can you have the scout notes finalized by Thursday morning?', timestamp: hoursAgo(1), isMe: false },
    { id: 'gm1-4', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Will do. I\'ll also include their inbound plays — they ran 3 different sets last game.', timestamp: hoursAgo(0.8), isMe: true },
    { id: 'gm1-5', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Let me know when you finish the Bethel scouting notes.', timestamp: hoursAgo(0.5), isMe: false },
  ],
  'gdm2': [
    { id: 'gm2-1', sender: 'Jaylen Thomas', initials: 'JT', role: 'Student Athlete', content: 'Coach Pearson, I watched the film from Tuesday. I see what you mean about my closeout technique.', timestamp: hoursAgo(4), isMe: false },
    { id: 'gm2-2', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Good that you see it. Your first step is too flat — you need to angle your approach to cut off the drive lane.', timestamp: hoursAgo(3.5), isMe: true },
    { id: 'gm2-3', sender: 'Jaylen Thomas', initials: 'JT', role: 'Student Athlete', content: 'Coach, can we go over my film session notes?', timestamp: hoursAgo(2), isMe: false },
  ],
  'gdm4': [
    { id: 'gm4-1', sender: 'You', initials: 'ME', role: 'Member', content: 'Pastor Chioma, I reviewed the Holy Week schedule. Everything looks great.', timestamp: hoursAgo(6), isMe: true },
    { id: 'gm4-2', sender: 'Chioma Okonkwo', initials: 'CO', role: 'Associate Pastor', content: 'Thank you for reviewing! Can you confirm the volunteer count for Good Friday?', timestamp: hoursAgo(5), isMe: false },
    { id: 'gm4-3', sender: 'You', initials: 'ME', role: 'Member', content: 'We have 12 confirmed. I\'ll follow up with the remaining 5 this week.', timestamp: hoursAgo(4.5), isMe: true },
    { id: 'gm4-4', sender: 'Chioma Okonkwo', initials: 'CO', role: 'Associate Pastor', content: 'Holy Week schedule looks good. Thanks for reviewing.', timestamp: hoursAgo(4), isMe: false },
  ],
  'gdm5': [
    { id: 'gm5-1', sender: 'Kofi Achebe', initials: 'KA', role: 'CTO', content: 'CDN migration is complete. Seeing 40% latency improvement across all endpoints.', timestamp: hoursAgo(8), isMe: false },
    { id: 'gm5-2', sender: 'You', initials: 'ME', role: 'Founder', content: 'That\'s incredible. What\'s the cost savings looking like?', timestamp: hoursAgo(7.5), isMe: true },
    { id: 'gm5-3', sender: 'Kofi Achebe', initials: 'KA', role: 'CTO', content: 'API latency improvement metrics look solid.', timestamp: hoursAgo(6), isMe: false },
  ],
};

// =============================================================================
// CHANNEL MEMBER REGISTRY (for @mentions picker)
// =============================================================================

export interface ChannelMember {
  name: string;
  initials: string;
  role: string;
}

const CHANNEL_MEMBERS: Record<string, ChannelMember[]> = {
  'sr-staff': [
    { name: 'HC Miles', initials: 'HM', role: 'Head Coach' },
    { name: 'Coach Pearson', initials: 'CP', role: 'Assistant Coach' },
    { name: 'Marcus Davis', initials: 'MD', role: 'Video Coordinator' },
    { name: 'Coach Reed', initials: 'CR', role: 'Strength Coach' },
    { name: 'Coach Avery', initials: 'CA', role: 'Scout' },
  ],
  'sr-ann': [
    { name: 'HC Miles', initials: 'HM', role: 'Head Coach' },
    { name: 'Coach Pearson', initials: 'CP', role: 'Assistant Coach' },
    { name: 'Jaylen Thomas', initials: 'JT', role: 'Student Athlete' },
    { name: 'Tyree Williams', initials: 'TW', role: 'Student Athlete' },
    { name: 'DeShawn Mitchell', initials: 'DM', role: 'Student Athlete' },
    { name: 'Marcus Davis', initials: 'MD', role: 'Video Coordinator' },
  ],
  'sr-scout': [
    { name: 'HC Miles', initials: 'HM', role: 'Head Coach' },
    { name: 'Coach Pearson', initials: 'CP', role: 'Assistant Coach' },
    { name: 'Recruiting', initials: 'RC', role: 'Recruiting Coordinator' },
  ],
  'sr-coaches': [
    { name: 'HC Miles', initials: 'HM', role: 'Head Coach' },
    { name: 'Coach Pearson', initials: 'CP', role: 'Assistant Coach' },
    { name: 'Coach Reed', initials: 'CR', role: 'Strength Coach' },
    { name: 'Coach Davis', initials: 'CD', role: 'Assistant Coach' },
  ],
  'sr-reccore': [
    { name: 'HC Miles', initials: 'HM', role: 'Head Coach' },
    { name: 'Coach Pearson', initials: 'CP', role: 'Assistant Coach' },
    { name: 'Recruiting', initials: 'RC', role: 'Recruiting Coordinator' },
  ],
  'cr-ann': [
    { name: 'Chioma Okonkwo', initials: 'CO', role: 'Associate Pastor' },
    { name: 'Sister Davis', initials: 'SD', role: 'Outreach' },
    { name: 'Deacon Williams', initials: 'DW', role: 'Deacon Board' },
    { name: 'Brother Thompson', initials: 'BT', role: 'Youth Ministry' },
  ],
  'cr-prayer': [
    { name: 'Sister Davis', initials: 'SD', role: 'Outreach' },
    { name: 'Deacon Williams', initials: 'DW', role: 'Deacon Board' },
    { name: 'Chioma Okonkwo', initials: 'CO', role: 'Associate Pastor' },
  ],
  'cr-child': [
    { name: 'Brother Thompson', initials: 'BT', role: 'Children\'s Ministry Lead' },
    { name: 'Sister Nkechi', initials: 'SN', role: 'Teacher' },
  ],
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

/** Cross-org DMs — persist across mode switches */
export function getGlobalDMs(): InboxThreadV3[] {
  return GLOBAL_DMS;
}

/** Get DM conversation messages */
export function getDMMessages(threadId: string): RoomMessageV3[] {
  return GLOBAL_DM_MESSAGES[threadId] ?? [];
}

/** Get channel members for @mentions picker */
export function getChannelMembers(roomId: string): ChannelMember[] {
  return CHANNEL_MEMBERS[roomId] ?? [];
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
