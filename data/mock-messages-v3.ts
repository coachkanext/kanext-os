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
  { id: 'si1', mode: 'sports', name: 'HC Miles', initials: 'HM', role: 'Head Coach', username: '@hcmiles', preview: 'Need your scouting report on Mitchell before Thursday.', timestamp: hoursAgo(1), unread: true, pinned: false, favorite: true, isRequest: false, readAt: hoursAgo(0.5) },
  { id: 'si2', mode: 'sports', name: 'Jaylen Thomas', initials: 'JT', role: 'Student Athlete', username: '@jthomas', preview: 'Coach Pearson, can we go over film from Tuesday?', timestamp: hoursAgo(2), unread: true, pinned: false, favorite: true, isRequest: false, readAt: hoursAgo(1) },
  { id: 'si3', mode: 'sports', name: 'Marcus Davis', initials: 'MD', role: 'Video Coordinator', username: '@mdavis', preview: 'Defensive clips for Saturday uploaded to shared folder.', timestamp: hoursAgo(3), unread: true, pinned: false, isRequest: false, isTyping: true },
  { id: 'si4', mode: 'sports', name: 'DeShawn Mitchell', initials: 'DM', role: 'Recruit', username: '@deshawnm', preview: 'Thanks for reaching out, Coach. I\'d love to set up a visit.', timestamp: hoursAgo(5), unread: true, pinned: false, isRequest: false },
  { id: 'si5', mode: 'sports', name: 'AD Johnson', initials: 'AJ', role: 'Athletic Director', username: '@adjohnson', preview: 'Spring recruiting trip budget approved. Details attached.', timestamp: hoursAgo(8), unread: false, pinned: true, favorite: true, isRequest: false },
  { id: 'si6', mode: 'sports', name: 'Medical Staff', initials: 'MS', role: 'Medical', username: '@medstaff', preview: 'Thomas cleared for full contact practice tomorrow.', timestamp: hoursAgo(12), unread: false, pinned: false, isRequest: false },
  { id: 'si7', mode: 'sports', name: 'Tyree Williams', initials: 'TW', role: 'Student Athlete', username: '@twilliams', preview: 'Can I get extra film time this week?', timestamp: daysAgo(1), unread: false, pinned: false, isRequest: false },
  { id: 'si8', mode: 'sports', name: 'Patricia Moore', initials: 'PM', role: 'Parent', username: '@pmoore', preview: 'Coach Pearson, wanted to discuss Jaylen\'s academic plan.', timestamp: daysAgo(1), unread: false, pinned: false, isRequest: false },
];

const SPORTS_ROOMS: RoomV3[] = [
  // ── Program Rooms (seeded, program-scoped) ──
  { id: 'sr-ann', mode: 'sports', name: '#team-announcements', initials: 'TA', color: '#B85C5C', memberCount: 28, lastMessage: 'Practice moved to 3pm today. Check your email for updated schedule.', timestamp: hoursAgo(1), unread: true, pinned: true, locked: false, isAnnouncement: true, readCount: 18, totalCount: 28, category: 'program', pinnedMessage: 'Season schedule PDF — updated Feb 24' },
  { id: 'sr-staff', mode: 'sports', name: '#staff-room', initials: 'SR', color: '#1A1714', memberCount: 8, lastMessage: 'Film review at 2pm. Bring your scouting notes from last game.', timestamp: hoursAgo(2), unread: true, pinned: true, locked: true, isAnnouncement: false, category: 'program', pinnedMessage: 'Staff meeting every Tuesday & Thursday 2pm' },
  { id: 'sr-practice', mode: 'sports', name: '#practice-plan', initials: 'PP', color: '#5A8A6E', memberCount: 25, lastMessage: 'Wednesday: full-court press drill + PNR reads. Bring playbooks.', timestamp: hoursAgo(3), unread: true, pinned: false, locked: false, isAnnouncement: false, category: 'program', pinnedMessage: 'Practice plan template — use this for all submissions' },
  { id: 'sr-scout', mode: 'sports', name: '#scout-room', initials: 'SC', color: '#B8943E', memberCount: 6, lastMessage: 'Mitchell eval posted. Strong PNR reads, needs work on transition D.', timestamp: hoursAgo(4), unread: true, pinned: false, locked: true, isAnnouncement: false, category: 'program' },
  { id: 'sr-travel', mode: 'sports', name: '#travel', initials: 'TR', color: '#1A1714', memberCount: 25, lastMessage: 'Bus departs 1pm sharp Saturday for Bethel. Pack dress code.', timestamp: hoursAgo(6), unread: false, pinned: false, locked: false, isAnnouncement: false, category: 'program' },
  { id: 'sr-recruit', mode: 'sports', name: '#recruiting', initials: 'RC', color: '#B8943E', memberCount: 5, lastMessage: 'New prospect list updated. 3 guards, 2 wings match our needs profile.', timestamp: hoursAgo(5), unread: false, pinned: false, locked: true, isAnnouncement: false, category: 'program' },
  // ── Direct Rooms (small-group, RBAC-gated) ──
  { id: 'sr-coaches', mode: 'sports', name: 'Coaches Only', initials: 'CO', color: '#1A1714', memberCount: 4, lastMessage: 'Rotation adjustments for Saturday — Thomas back in starting 5.', timestamp: hoursAgo(1), unread: true, pinned: false, locked: true, isAnnouncement: false, category: 'direct' },
  { id: 'sr-guards', mode: 'sports', name: 'Guards', initials: 'GD', color: '#5A8A6E', memberCount: 6, lastMessage: 'PNR film cuts ready in shared folder. Watch before Thursday practice.', timestamp: hoursAgo(3), unread: false, pinned: false, locked: false, isAnnouncement: false, category: 'direct' },
  { id: 'sr-bigs', mode: 'sports', name: 'Bigs', initials: 'BG', color: '#B85C5C', memberCount: 5, lastMessage: 'Post footwork session added for Wednesday morning. 7am.', timestamp: hoursAgo(8), unread: false, pinned: false, locked: false, isAnnouncement: false, category: 'direct' },
  { id: 'sr-reccore', mode: 'sports', name: 'Recruiting Core', initials: 'RK', color: '#B8943E', memberCount: 3, lastMessage: 'Mitchell visit confirmed for next Tuesday. Campus tour + film session.', timestamp: hoursAgo(2), unread: true, pinned: false, locked: true, isAnnouncement: false, category: 'direct' },
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
  { id: 'ci1', mode: 'church', name: 'Chioma Okonkwo', initials: 'CO', role: 'Associate Pastor', username: '@cokonkwo', preview: 'The prayer schedule for Holy Week is finalized. Please review.', timestamp: hoursAgo(1), unread: true, pinned: true, favorite: true, isRequest: false, readAt: hoursAgo(0.5) },
  { id: 'ci2', mode: 'church', name: 'Deacon Williams', initials: 'DW', role: 'Deacon Board', username: '@dwilliams', preview: 'Building fund update — we\'re at 78% of our goal.', timestamp: hoursAgo(3), unread: false, pinned: true, favorite: true, isRequest: false, readAt: hoursAgo(2) },
  { id: 'ci3', mode: 'church', name: 'Funmi Adeyemi', initials: 'FA', role: 'Worship Leader', username: '@fadeyemi', preview: 'Song list for Easter Sunday ready for your approval.', timestamp: hoursAgo(2), unread: true, pinned: false, favorite: true, isRequest: false, isTyping: true },
  { id: 'ci4', mode: 'church', name: 'Brother Thompson', initials: 'BT', role: 'Youth Ministry', username: '@bthompson', preview: 'Youth retreat registration is filling up. 47 of 60 spots taken.', timestamp: hoursAgo(5), unread: true, pinned: false, isRequest: false },
  { id: 'ci5', mode: 'church', name: 'Sister Davis', initials: 'SD', role: 'Outreach', username: '@sdavis', preview: 'Community meal prep volunteers needed for Saturday.', timestamp: hoursAgo(8), unread: true, pinned: false, isRequest: false },
  { id: 'ci6', mode: 'church', name: 'Michael Chen', initials: 'MC', role: 'New Member', username: '@mchen', preview: 'I\'d like to join the men\'s fellowship group.', timestamp: hoursAgo(12), unread: false, pinned: false, isRequest: true },
  { id: 'ci7', mode: 'church', name: 'Media Team', initials: 'MT', role: 'Media', username: '@mediateam', preview: 'Livestream equipment tested and ready for Sunday.', timestamp: daysAgo(1), unread: false, pinned: false, isRequest: false },
  { id: 'ci8', mode: 'church', name: 'Finance Committee', initials: 'FC', role: 'Finance', username: '@financecomm', preview: 'Monthly financial report attached for review.', timestamp: daysAgo(1), unread: false, pinned: false, isRequest: false },
];

const CHURCH_ROOMS: RoomV3[] = [
  // ── Campus Rooms (seeded, campus-scoped, V1–V2) ──
  { id: 'cr-ann', mode: 'church', name: '#campus-announcements', initials: 'CA', color: '#B85C5C', memberCount: 340, lastMessage: 'Good Friday services at 12pm and 7pm. All volunteers report at 11am.', timestamp: hoursAgo(1), unread: true, pinned: true, locked: false, isAnnouncement: true, readCount: 210, totalCount: 340, category: 'campus', pinnedMessage: 'Easter Week Schedule — updated Feb 25' },
  { id: 'cr-prayer', mode: 'church', name: '#prayer-requests', initials: 'PR', color: '#1A1714', memberCount: 285, lastMessage: 'Please keep Sister Johnson in prayer as she recovers from surgery.', timestamp: hoursAgo(2), unread: true, pinned: true, locked: false, isAnnouncement: false, category: 'campus' },
  { id: 'cr-events', mode: 'church', name: '#events', initials: 'EV', color: '#5A8A6E', memberCount: 310, lastMessage: 'Community meal this Saturday 10am — volunteers needed for setup.', timestamp: hoursAgo(3), unread: true, pinned: false, locked: false, isAnnouncement: false, category: 'campus' },
  { id: 'cr-vol', mode: 'church', name: '#volunteer-updates', initials: 'VU', color: '#B8943E', memberCount: 120, lastMessage: 'Volunteer appreciation dinner RSVP deadline extended to Sunday.', timestamp: hoursAgo(5), unread: false, pinned: false, locked: false, isAnnouncement: false, category: 'campus' },
  { id: 'cr-svc', mode: 'church', name: '#service-coordination', initials: 'SC', color: '#1A1714', memberCount: 45, lastMessage: 'A/V team please test livestream equipment by Thursday EOD.', timestamp: hoursAgo(4), unread: false, pinned: false, locked: true, isAnnouncement: false, category: 'campus' },
  // ── Ministry Rooms (V3, ministry-scoped) ──
  { id: 'cr-child', mode: 'church', name: '#childrens-team', initials: 'CT', color: '#B8943E', memberCount: 18, lastMessage: 'Lesson plan for Palm Sunday uploaded. Review before Saturday.', timestamp: hoursAgo(2), unread: true, pinned: false, locked: false, isAnnouncement: false, category: 'ministry' },
  { id: 'cr-lesson', mode: 'church', name: '#childrens-lesson-plan', initials: 'LP', color: '#B8943E', memberCount: 12, lastMessage: 'New curriculum materials for Easter week added to shared folder.', timestamp: hoursAgo(6), unread: false, pinned: false, locked: false, isAnnouncement: false, category: 'ministry', pinnedMessage: 'Curriculum template — use for all lesson submissions' },
  { id: 'cr-singles', mode: 'church', name: '#singles-ministry', initials: 'SM', color: '#1A1714', memberCount: 32, lastMessage: 'Game night this Friday 7pm at the fellowship hall. Bring snacks!', timestamp: hoursAgo(3), unread: true, pinned: false, locked: false, isAnnouncement: false, category: 'ministry' },
  // ── Direct Rooms (small-group, RBAC-gated) ──
  { id: 'cr-cteach', mode: 'church', name: 'Children Teachers Only', initials: 'TO', color: '#B8943E', memberCount: 6, lastMessage: 'Background check renewals due by March 15 — see pinned link.', timestamp: hoursAgo(4), unread: true, pinned: false, locked: true, isAnnouncement: false, category: 'direct', pinnedMessage: 'Background check form — submit to office' },
  { id: 'cr-score', mode: 'church', name: 'Singles Core Team', initials: 'SK', color: '#1A1714', memberCount: 4, lastMessage: 'Planning meeting for spring retreat moved to Wednesday 8pm.', timestamp: hoursAgo(8), unread: false, pinned: false, locked: true, isAnnouncement: false, category: 'direct' },
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
  { id: 'bi1', mode: 'business', name: 'Kofi Achebe', initials: 'KA', role: 'CTO', username: '@kachebe', preview: 'API latency down 40% after the CDN migration. Metrics attached.', timestamp: hoursAgo(1), unread: true, pinned: true, favorite: true, isRequest: false, readAt: hoursAgo(0.3) },
  { id: 'bi2', mode: 'business', name: 'Patrick Bet-David', initials: 'PB', role: 'Advisor', username: '@pbetdavid', preview: 'Let\'s sync on the Series A timeline this week.', timestamp: hoursAgo(3), unread: false, pinned: true, favorite: true, isRequest: false, readAt: hoursAgo(2) },
  { id: 'bi3', mode: 'business', name: 'Sarah Kim', initials: 'AM', role: 'Product Lead', username: '@skim', preview: 'V3 Messages spec is ready for review.', timestamp: hoursAgo(2), unread: true, pinned: false, favorite: true, isRequest: false, isTyping: true },
  { id: 'bi4', mode: 'business', name: 'James Park', initials: 'JP', role: 'Design Lead', username: '@jpark', preview: 'Updated the design system tokens — check Figma.', timestamp: hoursAgo(5), unread: true, pinned: false, isRequest: false },
  { id: 'bi5', mode: 'business', name: 'Marcus Webb', initials: 'MW', role: 'BD Lead', username: '@mwebb', preview: 'Partnership meeting with NAIA confirmed for next week.', timestamp: hoursAgo(8), unread: true, pinned: false, isRequest: false },
  { id: 'bi6', mode: 'business', name: 'Jordan Ellis', initials: 'JE', role: 'Intern Applicant', username: '@jellis', preview: 'Applied for the engineering intern position. Portfolio attached.', timestamp: hoursAgo(12), unread: false, pinned: false, isRequest: true },
  { id: 'bi7', mode: 'business', name: 'Legal Team', initials: 'LT', role: 'Legal', username: '@legalteam', preview: 'IP filing update — provisional patent accepted.', timestamp: daysAgo(1), unread: false, pinned: false, isRequest: false },
  { id: 'bi8', mode: 'business', name: 'Finance', initials: 'FN', role: 'Finance', username: '@finance', preview: 'Monthly burn rate report ready.', timestamp: daysAgo(1), unread: false, pinned: false, isRequest: false },
];

const BUSINESS_ROOMS: RoomV3[] = [
  { id: 'br1', mode: 'business', name: 'Fundraise Room', initials: 'FR', color: '#1A1714', memberCount: 4, lastMessage: 'Term sheet from Valley Capital under review.', timestamp: hoursAgo(2), unread: true, pinned: false, locked: true, isAnnouncement: false },
  { id: 'br2', mode: 'business', name: 'Engineering', initials: 'EN', color: '#1A1714', memberCount: 8, lastMessage: 'Sprint retro notes posted.', timestamp: hoursAgo(4), unread: false, pinned: false, locked: false, isAnnouncement: false },
  { id: 'br3', mode: 'business', name: 'Demo Day Prep', initials: 'DD', color: '#5A8A6E', memberCount: 12, lastMessage: 'Dry run scheduled for Thursday. Everyone present.', timestamp: hoursAgo(1), unread: true, pinned: true, locked: false, isAnnouncement: true, readCount: 2, totalCount: 3 },
  { id: 'br4', mode: 'business', name: 'Design System', initials: 'DS', color: '#B8943E', memberCount: 6, lastMessage: 'New tokens pushed to the repo. Review needed.', timestamp: hoursAgo(3), unread: false, pinned: true, locked: false, isAnnouncement: true, readCount: 3, totalCount: 4 },
  { id: 'br5', mode: 'business', name: 'Product', initials: 'PD', color: '#1A1714', memberCount: 5, lastMessage: 'Roadmap update for Q2 attached.', timestamp: hoursAgo(6), unread: true, pinned: false, locked: false, isAnnouncement: false },
  { id: 'br6', mode: 'business', name: 'All Hands', initials: 'AH', color: '#B85C5C', memberCount: 20, lastMessage: 'Town hall recording available.', timestamp: daysAgo(1), unread: false, pinned: false, locked: false, isAnnouncement: false },
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
  { id: 'ei1', mode: 'education', name: 'Dean Clark', initials: 'DC', role: 'Dean of Students', username: '@dclark', preview: 'Retention numbers are up 3.2% this semester. Full report attached.', timestamp: hoursAgo(1), unread: true, pinned: true, favorite: true, isRequest: false },
  { id: 'ei2', mode: 'education', name: 'SACSCOC Liaison', initials: 'SL', role: 'Accreditation', username: '@sacscoc', preview: 'Reaffirmation timeline confirmed. Site visit March 15-17.', timestamp: hoursAgo(3), unread: false, pinned: true, favorite: true, isRequest: false },
  { id: 'ei3', mode: 'education', name: 'Dr. Harris', initials: 'DH', role: 'Provost', username: '@dharris', preview: 'New program proposal for Data Science is ready for your review.', timestamp: hoursAgo(2), unread: true, pinned: false, favorite: true, isRequest: false },
  { id: 'ei4', mode: 'education', name: 'Prof. Washington', initials: 'PW', role: 'Faculty Senate', username: '@pwashington', preview: 'Faculty senate resolution on course load passed unanimously.', timestamp: hoursAgo(5), unread: true, pinned: false, isRequest: false },
  { id: 'ei5', mode: 'education', name: 'Student Davis', initials: 'SD', role: 'SGA President', username: '@stdavis', preview: 'Student government requesting meeting about campus dining.', timestamp: hoursAgo(8), unread: true, pinned: false, isRequest: false },
  { id: 'ei6', mode: 'education', name: 'Angela Morrison', initials: 'AM', role: 'Transfer Student', username: '@amorrison', preview: 'Requesting transfer credit evaluation for 12 courses.', timestamp: hoursAgo(12), unread: false, pinned: false, isRequest: true },
  { id: 'ei7', mode: 'education', name: 'Facilities', initials: 'FC', role: 'Operations', username: '@facilities', preview: 'Library renovation Phase 2 on track for completion.', timestamp: daysAgo(1), unread: false, pinned: false, isRequest: false },
  { id: 'ei8', mode: 'education', name: 'IT Services', initials: 'IT', role: 'Technology', username: '@itservices', preview: 'LMS migration plan finalized. Training sessions next week.', timestamp: daysAgo(1), unread: false, pinned: false, isRequest: false },
];

const EDUCATION_ROOMS: RoomV3[] = [
  { id: 'er1', mode: 'education', name: 'Finance Committee', initials: 'FC', color: '#1A1714', memberCount: 6, lastMessage: 'Budget hearing scheduled for March 1st.', timestamp: hoursAgo(2), unread: true, pinned: false, locked: true, isAnnouncement: false },
  { id: 'er2', mode: 'education', name: 'Academic Council', initials: 'AC', color: '#1A1714', memberCount: 12, lastMessage: 'Curriculum review complete for 8 programs.', timestamp: hoursAgo(4), unread: false, pinned: false, locked: false, isAnnouncement: false },
  { id: 'er3', mode: 'education', name: 'Leadership Retreat', initials: 'LR', color: '#1A1714', memberCount: 15, lastMessage: 'Retreat agenda and logistics confirmed. Pack layers.', timestamp: hoursAgo(1), unread: true, pinned: true, locked: false, isAnnouncement: true, readCount: 4, totalCount: 5 },
  { id: 'er4', mode: 'education', name: 'Evidence Portfolio', initials: 'EP', color: '#B8943E', memberCount: 10, lastMessage: 'All departments submit evidence by March 10.', timestamp: hoursAgo(6), unread: false, pinned: true, locked: false, isAnnouncement: true, readCount: 4, totalCount: 6 },
  { id: 'er5', mode: 'education', name: 'Faculty Development', initials: 'FD', color: '#5A8A6E', memberCount: 20, lastMessage: 'Teaching excellence workshop recordings available.', timestamp: hoursAgo(3), unread: true, pinned: false, locked: false, isAnnouncement: false },
  { id: 'er6', mode: 'education', name: 'Student Affairs', initials: 'SA', color: '#B85C5C', memberCount: 8, lastMessage: 'Spring orientation planning underway.', timestamp: daysAgo(1), unread: false, pinned: false, locked: false, isAnnouncement: false },
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
  { id: 'ki1', mode: 'competition', name: 'Carlos Hernandez', initials: 'CH', role: 'Race Director', username: '@chernandez', preview: 'Track inspection complete. All barriers meet FIA spec.', timestamp: hoursAgo(1), unread: true, pinned: true, favorite: true, isRequest: false },
  { id: 'ki2', mode: 'competition', name: 'FIA Liaison', initials: 'FL', role: 'Governing Body', username: '@fialiaison', preview: 'Updated safety protocols for wet conditions approved.', timestamp: hoursAgo(3), unread: false, pinned: true, favorite: true, isRequest: false },
  { id: 'ki3', mode: 'competition', name: 'Takeshi Yamamoto', initials: 'TY', role: 'Team Principal', username: '@tyamamoto', preview: 'Requesting clarification on the new aero regulations.', timestamp: hoursAgo(2), unread: true, pinned: false, favorite: true, isRequest: false },
  { id: 'ki4', mode: 'competition', name: 'Marco Rossi', initials: 'MR', role: 'Chief Steward', username: '@mrossi', preview: 'Steward panel recommendations for Round 4 incidents.', timestamp: hoursAgo(5), unread: true, pinned: false, isRequest: false },
  { id: 'ki5', mode: 'competition', name: 'Sophie Laurent', initials: 'SL', role: 'Media Director', username: '@slaurent', preview: 'Broadcast partner wants to discuss camera placement for Monaco.', timestamp: hoursAgo(8), unread: true, pinned: false, isRequest: false },
  { id: 'ki6', mode: 'competition', name: 'Carlos Vega', initials: 'CV', role: 'New Team Entry', username: '@cvega', preview: 'Applying for 3SSB grid expansion. Documentation attached.', timestamp: hoursAgo(12), unread: false, pinned: false, isRequest: true },
  { id: 'ki7', mode: 'competition', name: 'Medical Team', initials: 'MT', role: 'Medical', username: '@medteam', preview: 'All medical stations confirmed operational for Round 5.', timestamp: daysAgo(1), unread: false, pinned: false, isRequest: false },
  { id: 'ki8', mode: 'competition', name: 'Logistics', initials: 'LG', role: 'Operations', username: '@logistics', preview: 'Freight schedule confirmed for the European leg.', timestamp: daysAgo(1), unread: false, pinned: false, isRequest: false },
];

const COMPETITION_ROOMS: RoomV3[] = [
  { id: 'kr1', mode: 'competition', name: 'Technical Committee', initials: 'TC', color: '#1A1714', memberCount: 8, lastMessage: 'Engine formula review meeting next Wednesday.', timestamp: hoursAgo(2), unread: true, pinned: false, locked: true, isAnnouncement: false },
  { id: 'kr2', mode: 'competition', name: 'Stewards Panel', initials: 'SP', color: '#1A1714', memberCount: 5, lastMessage: 'Incident review procedures updated.', timestamp: hoursAgo(4), unread: false, pinned: false, locked: true, isAnnouncement: false },
  { id: 'kr3', mode: 'competition', name: 'Pre-Race Briefing', initials: 'RB', color: '#5A8A6E', memberCount: 30, lastMessage: 'All teams mandatory attendance. 9am Saturday.', timestamp: hoursAgo(1), unread: true, pinned: true, locked: false, isAnnouncement: true, readCount: 3, totalCount: 4 },
  { id: 'kr4', mode: 'competition', name: 'Entry Fee Notice', initials: 'EF', color: '#B8943E', memberCount: 20, lastMessage: 'Round 6-8 entry fees due by March 15.', timestamp: hoursAgo(6), unread: false, pinned: true, locked: false, isAnnouncement: true, readCount: 5, totalCount: 6 },
  { id: 'kr5', mode: 'competition', name: 'Safety Commission', initials: 'SC', color: '#B85C5C', memberCount: 10, lastMessage: 'New barrier specifications distributed.', timestamp: hoursAgo(3), unread: true, pinned: false, locked: false, isAnnouncement: false },
  { id: 'kr6', mode: 'competition', name: 'Broadcast Ops', initials: 'BO', color: '#1A1714', memberCount: 15, lastMessage: 'Camera rig positions confirmed for Round 5.', timestamp: daysAgo(1), unread: false, pinned: false, locked: false, isAnnouncement: false },
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
// ROOM THREAD MESSAGES — Sports (remaining rooms)
// =============================================================================

// sr-practice, sr-travel, sr-recruit, sr-guards, sr-bigs already defined above are missing — added here:
Object.assign(SPORTS_ROOM_MESSAGES, {
  'sr-practice': [
    { id: 'sp1', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Wednesday plan: 20 min PNR reads, 30 min full-court press break, 10 min free throws. Bring playbooks.', timestamp: hoursAgo(3), isMe: true, reactions: [{ emoji: '👍', count: 6, byMe: false }] },
    { id: 'sp2', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Add 15 min zone offense at the end. We need more reps before Saturday.', timestamp: hoursAgo(2.5), isMe: false, replyCount: 2, threadReplies: [
      { id: 'sp2-r1', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Done. I\'ll push the free throw segment to the warmup.', timestamp: hoursAgo(2.3), isMe: true },
      { id: 'sp2-r2', sender: 'Coach Reed', initials: 'CR', role: 'Strength Coach', content: 'I can run a 10-min activation before they hit the floor.', timestamp: hoursAgo(2.1), isMe: false },
    ] },
    { id: 'sp3', sender: 'Marcus Davis', initials: 'MD', role: 'Video Coordinator', content: 'Film clips for the PNR sets are cued up in the film room. Walk-through first?', timestamp: hoursAgo(2), isMe: false },
    { id: 'sp4', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Yes — 15 min film, then live reps. Good call Marcus.', timestamp: hoursAgo(1.5), isMe: true, reactions: [{ emoji: '✅', count: 3, byMe: false }] },
  ],
  'sr-travel': [
    { id: 'st1', sender: 'AD Johnson', initials: 'AJ', role: 'Athletic Director', content: 'Bus departs 1pm Saturday from main gym lot. Players in dress code by 12:30. No exceptions.', timestamp: hoursAgo(6), isMe: false, reactions: [{ emoji: '✅', count: 14, byMe: true }] },
    { id: 'st2', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Rooming list posted in the shared folder. Room assignments are final — no swaps.', timestamp: hoursAgo(5), isMe: true, replyCount: 1, threadReplies: [
      { id: 'st2-r1', sender: 'Jaylen Thomas', initials: 'JT', role: 'Student Athlete', content: 'Coach, I\'m rooming with Williams right?', timestamp: hoursAgo(4.8), isMe: false },
    ] },
    { id: 'st3', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Team meal Friday night at 7pm — Mama Leone\'s. No fast food the night before a game.', timestamp: hoursAgo(4), isMe: false, reactions: [{ emoji: '🔥', count: 8, byMe: true }] },
    { id: 'st4', sender: 'Marcus Davis', initials: 'MD', role: 'Video Coordinator', content: 'Bringing the portable film setup. We can review at the hotel Saturday morning.', timestamp: hoursAgo(2), isMe: false },
    { id: 'st5', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Perfect. I\'ll have the Bethel defensive tendencies cut down to 12 clips. 30 min max.', timestamp: hoursAgo(1), isMe: true },
  ],
  'sr-recruit': [
    { id: 'srr1', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'New prospect list updated. 3 guards and 2 wings in the top 14 that fit our needs profile for next cycle.', timestamp: hoursAgo(5), isMe: true },
    { id: 'srr2', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Send me the top 3 names and their KR projections. I want to prioritize the guards.', timestamp: hoursAgo(4.5), isMe: false, replyCount: 2, threadReplies: [
      { id: 'srr2-r1', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'DeShawn Mitchell (KR 72), Jalen Park (KR 68), Tony Reeves (KR 66). All three are guard-eligible.', timestamp: hoursAgo(4.2), isMe: true },
      { id: 'srr2-r2', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Focus on Mitchell first. He\'s our priority — get the visit locked in.', timestamp: hoursAgo(4), isMe: false },
    ] },
    { id: 'srr3', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Mitchell visit is confirmed for next Tuesday. His parents are flying in.', timestamp: hoursAgo(2), isMe: true, reactions: [{ emoji: '🔥', count: 2, byMe: false }] },
  ],
  'sr-guards': [
    { id: 'sg1', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'PNR film cuts are ready. Folder: "Guards PNR — Bethel Prep". Watch before Thursday practice.', timestamp: hoursAgo(3), isMe: true, reactions: [{ emoji: '👍', count: 4, byMe: false }] },
    { id: 'sg2', sender: 'Jaylen Thomas', initials: 'JT', role: 'Student Athlete', content: 'Watched it twice. Their big drops really hard — we should be popping more often.', timestamp: hoursAgo(2.5), isMe: false, replyCount: 2, threadReplies: [
      { id: 'sg2-r1', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Exactly. That\'s the read we\'ll drill Thursday. Tell Williams too.', timestamp: hoursAgo(2.3), isMe: true },
      { id: 'sg2-r2', sender: 'Tyree Williams', initials: 'TW', role: 'Student Athlete', content: 'Already on it. Can we also work on the DHO sets?', timestamp: hoursAgo(2.1), isMe: false },
    ] },
    { id: 'sg3', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Yes — DHO is on the agenda Thursday. Come ready to rep it 20 times.', timestamp: hoursAgo(2), isMe: true },
    { id: 'sg4', sender: 'Jaylen Thomas', initials: 'JT', role: 'Student Athlete', content: '', timestamp: hoursAgo(1), isMe: false, voiceNote: { uri: 'voice://sg4', duration: 9, transcript: 'Coach I been working on my pull-up off the PNR at home. I think it\'s looking way better. Can you watch me before practice Thursday?' } },
  ],
  'sr-bigs': [
    { id: 'sb1', sender: 'Coach Reed', initials: 'CR', role: 'Strength Coach', content: 'Post footwork session added for Wednesday morning. 7am sharp. Cones are already set up.', timestamp: hoursAgo(8), isMe: false, reactions: [{ emoji: '💪', count: 5, byMe: true }] },
    { id: 'sb2', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Thomas back in starting 5 Saturday. Adjust your screen timing — he likes the action a step earlier.', timestamp: hoursAgo(6), isMe: true, replyCount: 1, threadReplies: [
      { id: 'sb2-r1', sender: 'Marcus Davis', initials: 'MD', role: 'Video Coordinator', content: 'I can pull clips of JT\'s preferred spacing from last season for reference.', timestamp: hoursAgo(5.8), isMe: false },
    ] },
    { id: 'sb3', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Bigs — Bethel\'s center plays soft in drop coverage. Attack the short roll and look for the dump-off.', timestamp: hoursAgo(4), isMe: false, reactions: [{ emoji: '👀', count: 3, byMe: true }, { emoji: '🔥', count: 2, byMe: false }] },
    { id: 'sb4', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'We\'ll drill the short roll read at Wednesday morning session. Be ready to catch and finish in traffic.', timestamp: hoursAgo(2), isMe: true },
  ],
});

// =============================================================================
// ROOM THREAD MESSAGES — Church (remaining rooms)
// =============================================================================


// =============================================================================
// ROOM THREAD MESSAGES — Business
// =============================================================================

const BUSINESS_ROOM_MESSAGES: Record<string, RoomMessageV3[]> = {
  'br1': [
    { id: 'br1-1', sender: 'You', initials: 'ME', role: 'Founder / CEO', content: 'Term sheet from Valley Capital is in. $4.2M at a $28M cap. Reviewing with counsel today.', timestamp: hoursAgo(2), isMe: true, reactions: [{ emoji: '🔥', count: 3, byMe: false }] },
    { id: 'br1-2', sender: 'Rachel Torres', initials: 'RT', role: 'COO', content: 'That\'s above our floor. What are the liquidation preference terms?', timestamp: hoursAgo(1.8), isMe: false, replyCount: 2, threadReplies: [
      { id: 'br1-2r1', sender: 'You', initials: 'ME', role: 'Founder / CEO', content: '1x non-participating preferred. Clean structure — way better than the Sequoia draft last month.', timestamp: hoursAgo(1.6), isMe: true },
      { id: 'br1-2r2', sender: 'Kofi Achebe', initials: 'KA', role: 'CTO', content: 'No anti-dilution ratchet? That\'s rare at seed extension.', timestamp: hoursAgo(1.4), isMe: false },
    ] },
    { id: 'br1-3', sender: 'Rachel Torres', initials: 'RT', role: 'COO', content: 'Board seat or observer rights for Valley?', timestamp: hoursAgo(1.2), isMe: false },
    { id: 'br1-4', sender: 'You', initials: 'ME', role: 'Founder / CEO', content: 'Observer only. That was a hard line for us and they accepted. Let\'s talk at 3pm today.', timestamp: hoursAgo(1), isMe: true, reactions: [{ emoji: '💪', count: 2, byMe: false }] },
  ],
  'br2': [
    { id: 'br2-1', sender: 'Kofi Achebe', initials: 'KA', role: 'CTO', content: 'Sprint 14 retro notes are posted in Notion. TL;DR: velocity up 18%, two carry-overs from infra work.', timestamp: hoursAgo(4), isMe: false, reactions: [{ emoji: '👍', count: 5, byMe: true }] },
    { id: 'br2-2', sender: 'You', initials: 'ME', role: 'Founder / CEO', content: 'Good progress. What\'s causing the infra carry-overs?', timestamp: hoursAgo(3.5), isMe: true },
    { id: 'br2-3', sender: 'Kofi Achebe', initials: 'KA', role: 'CTO', content: 'DB migration is taking longer than estimated — Postgres partitioning at 10M row scale is messier than we planned. ETA Friday.', timestamp: hoursAgo(3), isMe: false, replyCount: 2, threadReplies: [
      { id: 'br2-3r1', sender: 'You', initials: 'ME', role: 'Founder / CEO', content: 'Does this block the Q2 API release?', timestamp: hoursAgo(2.8), isMe: true },
      { id: 'br2-3r2', sender: 'Kofi Achebe', initials: 'KA', role: 'CTO', content: 'No — the API runs on its own service. Migration is backend-only, no customer impact.', timestamp: hoursAgo(2.6), isMe: false },
    ] },
    { id: 'br2-4', sender: 'Sarah Kim', initials: 'SK', role: 'Product Lead', content: 'API latency improvements from Sprint 13 are live. P95 down from 380ms to 210ms.', timestamp: hoursAgo(1), isMe: false, reactions: [{ emoji: '🔥', count: 4, byMe: true }, { emoji: '✅', count: 3, byMe: false }] },
  ],
  'br3': [
    { id: 'br3-1', sender: 'Rachel Torres', initials: 'RT', role: 'COO', content: 'Demo Day dry run scheduled for Thursday 2pm. Everyone on the deck is expected. No exceptions.', timestamp: hoursAgo(1), isMe: false, reactions: [{ emoji: '✅', count: 8, byMe: true }] },
    { id: 'br3-2', sender: 'You', initials: 'ME', role: 'Founder / CEO', content: 'I want to cut the market size slide — the story flows better going straight from problem to traction.', timestamp: hoursAgo(0.8), isMe: true, replyCount: 2, threadReplies: [
      { id: 'br3-2r1', sender: 'Sarah Kim', initials: 'SK', role: 'Product Lead', content: 'Agree. The $14B TAM slide stalls the momentum right before the demo.', timestamp: hoursAgo(0.7), isMe: false },
      { id: 'br3-2r2', sender: 'Rachel Torres', initials: 'RT', role: 'COO', content: 'Move it to the appendix — investors who want it can find it.', timestamp: hoursAgo(0.6), isMe: false },
    ] },
    { id: 'br3-3', sender: 'Kofi Achebe', initials: 'KA', role: 'CTO', content: 'Live demo environment is stable. I ran 50 test sessions this morning — zero errors.', timestamp: hoursAgo(0.5), isMe: false, reactions: [{ emoji: '💪', count: 3, byMe: true }] },
    { id: 'br3-4', sender: 'You', initials: 'ME', role: 'Founder / CEO', content: 'Perfect. Thursday we go full speed. No slides held back.', timestamp: hoursAgo(0.3), isMe: true },
  ],
  'br4': [
    { id: 'br4-1', sender: 'Sarah Kim', initials: 'SK', role: 'Product Lead', content: 'New design tokens pushed to the repo. Color, spacing, and type scale all updated. Review needed before merge.', timestamp: hoursAgo(3), isMe: false, reactions: [{ emoji: '👀', count: 4, byMe: true }] },
    { id: 'br4-2', sender: 'You', initials: 'ME', role: 'Founder / CEO', content: 'The warm neutrals are a big improvement over the gray-heavy system. Much more on brand.', timestamp: hoursAgo(2.5), isMe: true },
    { id: 'br4-3', sender: 'Kofi Achebe', initials: 'KA', role: 'CTO', content: 'Two component conflicts in the token migration — the button secondary state and the input focus ring. Flagging before we merge.', timestamp: hoursAgo(2), isMe: false, replyCount: 1, threadReplies: [
      { id: 'br4-3r1', sender: 'Sarah Kim', initials: 'SK', role: 'Product Lead', content: 'On it. Will push a fix by EOD today.', timestamp: hoursAgo(1.8), isMe: false },
    ] },
    { id: 'br4-4', sender: 'You', initials: 'ME', role: 'Founder / CEO', content: 'Once fixed — merge it. I want the new system live before Demo Day.', timestamp: hoursAgo(1), isMe: true },
  ],
  'br5': [
    { id: 'br5-1', sender: 'Sarah Kim', initials: 'SK', role: 'Product Lead', content: 'Q2 roadmap update attached. Three themes: API expansion, analytics v2, and mobile launch. Sequencing is TBD pending funding.', timestamp: hoursAgo(6), isMe: false, reactions: [{ emoji: '👍', count: 3, byMe: true }] },
    { id: 'br5-2', sender: 'You', initials: 'ME', role: 'Founder / CEO', content: 'Mobile launch needs to move up if the Valley raise closes. That\'s the growth lever we promised investors.', timestamp: hoursAgo(5), isMe: true, replyCount: 2, threadReplies: [
      { id: 'br5-2r1', sender: 'Sarah Kim', initials: 'SK', role: 'Product Lead', content: 'If funding closes in 4 weeks, I can pull mobile to May. It\'s tight but doable.', timestamp: hoursAgo(4.8), isMe: false },
      { id: 'br5-2r2', sender: 'Kofi Achebe', initials: 'KA', role: 'CTO', content: 'I\'ll need 2 more engineers for that timeline. Can we fast-track the two pending offers?', timestamp: hoursAgo(4.6), isMe: false },
    ] },
    { id: 'br5-3', sender: 'You', initials: 'ME', role: 'Founder / CEO', content: 'Offers go out Friday. Both candidates accepted verbally. This is happening.', timestamp: hoursAgo(4), isMe: true, reactions: [{ emoji: '🔥', count: 4, byMe: false }] },
  ],
  'br6': [
    { id: 'br6-1', sender: 'Rachel Torres', initials: 'RT', role: 'COO', content: 'Town hall recording is live in the company Notion. If you missed it — please watch before end of week.', timestamp: hoursAgo(24), isMe: false, reactions: [{ emoji: '✅', count: 12, byMe: true }] },
    { id: 'br6-2', sender: 'You', initials: 'ME', role: 'Founder / CEO', content: 'Thanks everyone for showing up. The Q&A section had really sharp questions — this team is locked in.', timestamp: hoursAgo(23), isMe: true, reactions: [{ emoji: '❤️', count: 10, byMe: false }, { emoji: '🙌', count: 7, byMe: false }] },
    { id: 'br6-3', sender: 'Kofi Achebe', initials: 'KA', role: 'CTO', content: 'The headcount plan section was the most asked-about. Should we do a deeper engineering AMA next month?', timestamp: hoursAgo(22), isMe: false, replyCount: 1, threadReplies: [
      { id: 'br6-3r1', sender: 'You', initials: 'ME', role: 'Founder / CEO', content: 'Yes — let\'s schedule an eng-specific all-hands for April. Put it on the calendar.', timestamp: hoursAgo(21), isMe: true },
    ] },
    { id: 'br6-4', sender: 'Sarah Kim', initials: 'SK', role: 'Product Lead', content: 'Highlight clips from the product roadmap section will be posted separately this week.', timestamp: hoursAgo(20), isMe: false },
  ],
};

// =============================================================================
// ROOM THREAD MESSAGES — Education
// =============================================================================

const EDUCATION_ROOM_MESSAGES: Record<string, RoomMessageV3[]> = {
  'er1': [
    { id: 'er1-1', sender: 'Dr. Harris', initials: 'DH', role: 'Provost', content: 'Budget hearing is confirmed for March 1st at 10am in the Board Room. All committee members required.', timestamp: hoursAgo(2), isMe: false, reactions: [{ emoji: '✅', count: 5, byMe: true }] },
    { id: 'er1-2', sender: 'You', initials: 'ME', role: 'VP Finance', content: 'I\'ll have the revised departmental projections ready by Friday. The enrollment-driven shortfall is $2.1M against our original budget.', timestamp: hoursAgo(1.8), isMe: true, replyCount: 2, threadReplies: [
      { id: 'er1-2r1', sender: 'Dr. Harris', initials: 'DH', role: 'Provost', content: 'That\'s significant. What are the main drivers?', timestamp: hoursAgo(1.6), isMe: false },
      { id: 'er1-2r2', sender: 'You', initials: 'ME', role: 'VP Finance', content: 'Enrollment in three programs came in 14% below forecast. We\'re offsetting with grants but the gap remains.', timestamp: hoursAgo(1.4), isMe: true },
    ] },
    { id: 'er1-3', sender: 'Dean Clark', initials: 'DC', role: 'Dean of Students', content: 'Retention initiatives should help Q3 onward. The new advising program is showing early results.', timestamp: hoursAgo(1), isMe: false },
    { id: 'er1-4', sender: 'You', initials: 'ME', role: 'VP Finance', content: 'Agreed. I\'ll model out the retention impact scenario for the hearing presentation.', timestamp: hoursAgo(0.5), isMe: true },
  ],
  'er2': [
    { id: 'er2-1', sender: 'Dr. Harris', initials: 'DH', role: 'Provost', content: 'Curriculum review is complete for 8 programs. All cleared for the next accreditation cycle except one — see the report.', timestamp: hoursAgo(4), isMe: false, reactions: [{ emoji: '👍', count: 6, byMe: true }] },
    { id: 'er2-2', sender: 'Prof. Washington', initials: 'PW', role: 'Faculty Senate', content: 'Which program is flagged? Is it the Education Technology track?', timestamp: hoursAgo(3.5), isMe: false },
    { id: 'er2-3', sender: 'Dr. Harris', initials: 'DH', role: 'Provost', content: 'Correct. The competency mapping needs to be updated before the NECHE visit in November. We have time.', timestamp: hoursAgo(3), isMe: false, replyCount: 2, threadReplies: [
      { id: 'er2-3r1', sender: 'You', initials: 'ME', role: 'VP Finance', content: 'Is there a budget ask for the competency mapping update?', timestamp: hoursAgo(2.8), isMe: true },
      { id: 'er2-3r2', sender: 'Dr. Harris', initials: 'DH', role: 'Provost', content: 'Minimal — mostly faculty time. Maybe $8K for external consultant review.', timestamp: hoursAgo(2.6), isMe: false },
    ] },
    { id: 'er2-4', sender: 'You', initials: 'ME', role: 'VP Finance', content: 'I\'ll include that line item in the Q3 budget revision.', timestamp: hoursAgo(2), isMe: true },
  ],
  'er3': [
    { id: 'er3-1', sender: 'Dean Clark', initials: 'DC', role: 'Dean of Students', content: 'Leadership retreat logistics confirmed — Blue Ridge Conference Center, March 28-30. Pack layers, it\'ll be cold.', timestamp: hoursAgo(1), isMe: false, reactions: [{ emoji: '🏔️', count: 7, byMe: true }, { emoji: '✅', count: 5, byMe: false }] },
    { id: 'er3-2', sender: 'You', initials: 'ME', role: 'VP Finance', content: 'Can someone send the draft agenda? I want to prep for the budget strategy session on day 2.', timestamp: hoursAgo(0.8), isMe: true },
    { id: 'er3-3', sender: 'Dean Clark', initials: 'DC', role: 'Dean of Students', content: 'Agenda is in your email. Day 1: visioning. Day 2: strategy sessions. Day 3: action planning. Bring your top 3 priorities.', timestamp: hoursAgo(0.6), isMe: false, replyCount: 1, threadReplies: [
      { id: 'er3-3r1', sender: 'Prof. Washington', initials: 'PW', role: 'Faculty Senate', content: 'Will there be time to discuss the faculty governance restructuring proposal?', timestamp: hoursAgo(0.4), isMe: false },
    ] },
    { id: 'er3-4', sender: 'Dean Clark', initials: 'DC', role: 'Dean of Students', content: 'Yes — block 3 on Day 2 is specifically for shared governance. Please submit your proposal by Tuesday.', timestamp: hoursAgo(0.2), isMe: false },
  ],
  'er4': [
    { id: 'er4-1', sender: 'Dr. Harris', initials: 'DH', role: 'Provost', content: 'All departments: submit your accreditation evidence portfolio by March 10. No extensions. NECHE visit is November.', timestamp: hoursAgo(6), isMe: false, reactions: [{ emoji: '✅', count: 8, byMe: true }] },
    { id: 'er4-2', sender: 'You', initials: 'ME', role: 'VP Finance', content: 'Finance portfolio is 80% done. Student learning outcomes data from Business programs still pending from department heads.', timestamp: hoursAgo(5), isMe: true, replyCount: 1, threadReplies: [
      { id: 'er4-2r1', sender: 'Dr. Harris', initials: 'DH', role: 'Provost', content: 'I\'ll send a direct reminder to the Business chairs. This is a compliance issue, not optional.', timestamp: hoursAgo(4.8), isMe: false },
    ] },
    { id: 'er4-3', sender: 'Prof. Washington', initials: 'PW', role: 'Faculty Senate', content: 'Faculty Senate portfolio submitted. 47 pages — we over-delivered on Standard 5.', timestamp: hoursAgo(4), isMe: false, reactions: [{ emoji: '🔥', count: 3, byMe: true }] },
    { id: 'er4-4', sender: 'You', initials: 'ME', role: 'VP Finance', content: 'Great. Finance will be fully submitted by March 8 — two days early.', timestamp: hoursAgo(2), isMe: true },
  ],
  'er5': [
    { id: 'er5-1', sender: 'Prof. Washington', initials: 'PW', role: 'Faculty Senate', content: 'Teaching excellence workshop recordings are now available in the Faculty Portal. 4 sessions, 6 hours total.', timestamp: hoursAgo(3), isMe: false, reactions: [{ emoji: '👍', count: 11, byMe: true }] },
    { id: 'er5-2', sender: 'You', initials: 'ME', role: 'VP Finance', content: 'Watched the active learning session — the think-pair-share timing strategies were genuinely useful.', timestamp: hoursAgo(2.5), isMe: true },
    { id: 'er5-3', sender: 'Dean Clark', initials: 'DC', role: 'Dean of Students', content: 'We\'re tracking completions — 62 of 78 faculty have finished at least 2 sessions. Strong uptake.', timestamp: hoursAgo(2), isMe: false, replyCount: 1, threadReplies: [
      { id: 'er5-3r1', sender: 'Prof. Washington', initials: 'PW', role: 'Faculty Senate', content: 'The remaining 16 will be individually prompted this week. We want 100% before the retreat.', timestamp: hoursAgo(1.8), isMe: false },
    ] },
    { id: 'er5-4', sender: 'You', initials: 'ME', role: 'VP Finance', content: 'Can we add a peer observation track next semester? The feedback loop component is missing from this cohort.', timestamp: hoursAgo(1), isMe: true },
    { id: 'er5-5', sender: 'Prof. Washington', initials: 'PW', role: 'Faculty Senate', content: 'Already drafted in the Fall 2026 professional development plan. Great minds.', timestamp: hoursAgo(0.5), isMe: false, reactions: [{ emoji: '✅', count: 2, byMe: true }] },
  ],
  'er6': [
    { id: 'er6-1', sender: 'Dean Clark', initials: 'DC', role: 'Dean of Students', content: 'Spring orientation planning underway. Target: 420 incoming students. Theme this year is "Find Your People." Input welcome.', timestamp: hoursAgo(24), isMe: false, reactions: [{ emoji: '🙌', count: 6, byMe: true }] },
    { id: 'er6-2', sender: 'You', initials: 'ME', role: 'VP Finance', content: 'Budget approved — $48K total for orientation. Same as last year. Vendor contracts are locked.', timestamp: hoursAgo(22), isMe: true },
    { id: 'er6-3', sender: 'Dean Clark', initials: 'DC', role: 'Dean of Students', content: 'Peer mentor applications closed at 94 applicants for 40 spots. Selection committee meets next week.', timestamp: hoursAgo(20), isMe: false, replyCount: 1, threadReplies: [
      { id: 'er6-3r1', sender: 'Prof. Washington', initials: 'PW', role: 'Faculty Senate', content: 'Can Faculty Senate nominate students for the peer mentor pool? We have several strong candidates.', timestamp: hoursAgo(19.5), isMe: false },
    ] },
    { id: 'er6-4', sender: 'Dean Clark', initials: 'DC', role: 'Dean of Students', content: 'Absolutely — send names to my office by Friday. Committee chair will review.', timestamp: hoursAgo(18), isMe: false },
  ],
};

// =============================================================================
// ROOM THREAD MESSAGES — Competition
// =============================================================================

const COMPETITION_ROOM_MESSAGES: Record<string, RoomMessageV3[]> = {
  'kr1': [
    { id: 'kr1-1', sender: 'Carlos Hernandez', initials: 'CH', role: 'Race Director', content: 'Engine formula review meeting confirmed for next Wednesday 10am. All technical committee members mandatory.', timestamp: hoursAgo(2), isMe: false, reactions: [{ emoji: '✅', count: 6, byMe: true }] },
    { id: 'kr1-2', sender: 'You', initials: 'ME', role: 'Commissioner', content: 'I\'ll have the revised fuel flow rate proposal ready for review. The Yamamoto team submitted a formal query last week.', timestamp: hoursAgo(1.8), isMe: true, replyCount: 2, threadReplies: [
      { id: 'kr1-2r1', sender: 'Carlos Hernandez', initials: 'CH', role: 'Race Director', content: 'Their objection is valid — the current 2.1 kg/hr ceiling disadvantages the turbocharged configs.', timestamp: hoursAgo(1.6), isMe: false },
      { id: 'kr1-2r2', sender: 'You', initials: 'ME', role: 'Commissioner', content: 'Agreed. My proposal raises it to 2.4 — still within FIA precedent but gives them room to compete.', timestamp: hoursAgo(1.4), isMe: true },
    ] },
    { id: 'kr1-3', sender: 'Marco Rossi', initials: 'MR', role: 'Chief Steward', content: 'The Stewards Panel will send a formal technical opinion before Wednesday. We support the revision.', timestamp: hoursAgo(1), isMe: false, reactions: [{ emoji: '👍', count: 4, byMe: true }] },
  ],
  'kr2': [
    { id: 'kr2-1', sender: 'Marco Rossi', initials: 'MR', role: 'Chief Steward', content: 'Incident review procedures updated. Key change: video review now mandatory for any contact incident, no exceptions.', timestamp: hoursAgo(4), isMe: false, reactions: [{ emoji: '✅', count: 4, byMe: true }] },
    { id: 'kr2-2', sender: 'You', initials: 'ME', role: 'Commissioner', content: 'Good. The Round 3 incident took 4 hours because we didn\'t have a clear video protocol. This fixes it.', timestamp: hoursAgo(3.5), isMe: true },
    { id: 'kr2-3', sender: 'Carlos Hernandez', initials: 'CH', role: 'Race Director', content: 'I\'ve briefed the broadcast team — they\'ll flag any contact for immediate steward review rather than waiting for team protests.', timestamp: hoursAgo(3), isMe: false, replyCount: 1, threadReplies: [
      { id: 'kr2-3r1', sender: 'Marco Rossi', initials: 'MR', role: 'Chief Steward', content: 'That\'s the right approach. Proactive review is faster and more consistent than protest-driven.', timestamp: hoursAgo(2.8), isMe: false },
    ] },
    { id: 'kr2-4', sender: 'You', initials: 'ME', role: 'Commissioner', content: 'New procedures go live Round 5. All stewards must acknowledge receipt by Friday.', timestamp: hoursAgo(2), isMe: true },
  ],
  'kr3': [
    { id: 'kr3-1', sender: 'Carlos Hernandez', initials: 'CH', role: 'Race Director', content: 'Round 5 pre-race briefing is mandatory for all teams. Saturday 9am, main circuit briefing room. No proxy attendance allowed.', timestamp: hoursAgo(1), isMe: false, reactions: [{ emoji: '✅', count: 18, byMe: true }] },
    { id: 'kr3-2', sender: 'You', initials: 'ME', role: 'Commissioner', content: 'Agenda: updated safety car procedures, new pit exit protocol, and the fuel flow revision briefing. 60 minutes max.', timestamp: hoursAgo(0.8), isMe: true },
    { id: 'kr3-3', sender: 'Marco Rossi', initials: 'MR', role: 'Chief Steward', content: 'Stewards will be present for the pit exit protocol section. We have a clarification on the unsafe release definition.', timestamp: hoursAgo(0.6), isMe: false, replyCount: 1, threadReplies: [
      { id: 'kr3-3r1', sender: 'Carlos Hernandez', initials: 'CH', role: 'Race Director', content: 'Good. That\'s been disputed twice this season. Let\'s get it settled Saturday.', timestamp: hoursAgo(0.5), isMe: false },
    ] },
    { id: 'kr3-4', sender: 'You', initials: 'ME', role: 'Commissioner', content: 'All teams have been notified. Attendance is logged. See you Saturday.', timestamp: hoursAgo(0.3), isMe: true },
  ],
  'kr4': [
    { id: 'kr4-1', sender: 'You', initials: 'ME', role: 'Commissioner', content: 'Round 6-8 entry fees are due by March 15. Payment portal link in the pinned message. Late entries incur a 12% surcharge.', timestamp: hoursAgo(6), isMe: true, reactions: [{ emoji: '✅', count: 14, byMe: false }] },
    { id: 'kr4-2', sender: 'Carlos Hernandez', initials: 'CH', role: 'Race Director', content: '17 of 22 teams have paid. Yamamoto, Vega entry, and 3 others still pending.', timestamp: hoursAgo(5), isMe: false, replyCount: 1, threadReplies: [
      { id: 'kr4-2r1', sender: 'You', initials: 'ME', role: 'Commissioner', content: 'I\'ll contact the outstanding teams directly today. No grid spots held for unpaid entries.', timestamp: hoursAgo(4.8), isMe: true },
    ] },
    { id: 'kr4-3', sender: 'Marco Rossi', initials: 'MR', role: 'Chief Steward', content: 'Carlos Vega\'s new team entry — their expansion application is still under review. Does the entry fee apply?', timestamp: hoursAgo(4), isMe: false },
    { id: 'kr4-4', sender: 'You', initials: 'ME', role: 'Commissioner', content: 'Yes — provisional entry fee required before grid allocation. If application is denied, full refund issued.', timestamp: hoursAgo(3), isMe: true },
  ],
  'kr5': [
    { id: 'kr5-1', sender: 'Carlos Hernandez', initials: 'CH', role: 'Race Director', content: 'New barrier specifications distributed to all circuit marshals. The upgrade covers turns 4, 7, and 14 — historically highest-risk corners.', timestamp: hoursAgo(3), isMe: false, reactions: [{ emoji: '👍', count: 5, byMe: true }] },
    { id: 'kr5-2', sender: 'You', initials: 'ME', role: 'Commissioner', content: 'FIA sign-off received on the Turn 14 configuration. Took 3 weeks longer than expected — thanks for being patient.', timestamp: hoursAgo(2.5), isMe: true },
    { id: 'kr5-3', sender: 'Marco Rossi', initials: 'MR', role: 'Chief Steward', content: 'Medical evacuation route for Turn 7 has been updated to avoid the new barrier footprint. Route map sent to all medics.', timestamp: hoursAgo(2), isMe: false, replyCount: 1, threadReplies: [
      { id: 'kr5-3r1', sender: 'Carlos Hernandez', initials: 'CH', role: 'Race Director', content: 'Good catch. The old route would have been blocked by the new SAFER barrier installation.', timestamp: hoursAgo(1.8), isMe: false },
    ] },
    { id: 'kr5-4', sender: 'You', initials: 'ME', role: 'Commissioner', content: 'Full safety inspection Saturday morning before practice. All barrier sections must be signed off before we open the circuit.', timestamp: hoursAgo(1), isMe: true, reactions: [{ emoji: '✅', count: 3, byMe: false }] },
  ],
  'kr6': [
    { id: 'kr6-1', sender: 'Sophie Laurent', initials: 'SL', role: 'Media Director', content: 'Camera rig positions confirmed for Round 5. New helicopter cam coverage for the main straight — should be stunning footage.', timestamp: hoursAgo(24), isMe: false, reactions: [{ emoji: '🔥', count: 7, byMe: true }] },
    { id: 'kr6-2', sender: 'You', initials: 'ME', role: 'Commissioner', content: 'Good. What about the onboard camera mandate? Three teams are still using single-onboard configs.', timestamp: hoursAgo(22), isMe: true },
    { id: 'kr6-3', sender: 'Sophie Laurent', initials: 'SL', role: 'Media Director', content: 'All teams must have dual onboard by Round 6 per the broadcast agreement. I\'ve issued formal notices to the three teams.', timestamp: hoursAgo(21), isMe: false, replyCount: 2, threadReplies: [
      { id: 'kr6-3r1', sender: 'Carlos Hernandez', initials: 'CH', role: 'Race Director', content: 'Is there a penalty for non-compliance? The broadcast contract has specific clauses.', timestamp: hoursAgo(20.5), isMe: false },
      { id: 'kr6-3r2', sender: 'Sophie Laurent', initials: 'SL', role: 'Media Director', content: 'First offense: formal warning and $5K fine. Second offense: grid penalty. Escalating fast.', timestamp: hoursAgo(20), isMe: false },
    ] },
    { id: 'kr6-4', sender: 'You', initials: 'ME', role: 'Commissioner', content: 'Enforce it. Broadcast quality is non-negotiable — it\'s the core of our media rights deal.', timestamp: hoursAgo(18), isMe: true },
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
  'cr-events': [
    { id: 'cre1', sender: 'Sister Davis', initials: 'SD', role: 'Outreach', content: 'Community meal this Saturday 10am. Still need 6 volunteers for kitchen and 4 for serving. Sign up in the foyer or reply here.', timestamp: hoursAgo(3), isMe: false, reactions: [{ emoji: '\uD83D\uDE4F', count: 14, byMe: true }] },
    { id: 'cre2', sender: 'You', initials: 'ME', role: 'Member', content: 'I can do kitchen duty Saturday. What time should I arrive for setup?', timestamp: hoursAgo(2.5), isMe: true },
    { id: 'cre3', sender: 'Sister Davis', initials: 'SD', role: 'Outreach', content: '8:30am for setup please. Aprons provided. Thank you so much!', timestamp: hoursAgo(2.3), isMe: false, reactions: [{ emoji: '\u2764\uFE0F', count: 5, byMe: false }] },
    { id: 'ce4', sender: 'Deacon Williams', initials: 'DW', role: 'Deacon Board', content: 'Youth group is handling parking and the welcome table. Brother Thompson confirmed 8 students.', timestamp: hoursAgo(2), isMe: false },
    { id: 'ce5', sender: 'Chioma Okonkwo', initials: 'CO', role: 'Associate Pastor', content: "Wonderful. We're expecting 80-100 guests this month. Let's make sure the overflow tables are set.", timestamp: hoursAgo(1), isMe: false, reactions: [{ emoji: '\uD83D\uDE4C', count: 9, byMe: true }] },
  ],
  'cr-vol': [
    { id: 'cv1', sender: 'Chioma Okonkwo', initials: 'CO', role: 'Associate Pastor', content: "Volunteer appreciation dinner RSVP deadline extended to this Sunday. Don't miss it — you all deserve this!", timestamp: hoursAgo(5), isMe: false, reactions: [{ emoji: '\uD83C\uDF89', count: 22, byMe: true }, { emoji: '\u2764\uFE0F', count: 11, byMe: false }] },
    { id: 'cv2', sender: 'You', initials: 'ME', role: 'Member', content: "RSVP'd for 2. Looking forward to it!", timestamp: hoursAgo(4), isMe: true },
    { id: 'cv3', sender: 'Brother Thompson', initials: 'BT', role: 'Youth Ministry', content: 'My whole team is coming. We have 9 youth volunteers RSVPing.', timestamp: hoursAgo(3), isMe: false },
    { id: 'cv4', sender: 'Sister Davis', initials: 'SD', role: 'Outreach', content: 'Quick reminder — the appreciation video submissions are due Thursday. Send your 15-sec clip to the media team.', timestamp: hoursAgo(1), isMe: false, replyCount: 1, threadReplies: [
      { id: 'cv4-r1', sender: 'You', initials: 'ME', role: 'Member', content: 'Just sent mine in. Great idea doing a compilation video.', timestamp: hoursAgo(0.8), isMe: true },
    ] },
  ],
  'cr-svc': [
    { id: 'cs1', sender: 'Chioma Okonkwo', initials: 'CO', role: 'Associate Pastor', content: 'A/V team — please test the livestream equipment by Thursday EOD. Good Friday attendance is expected to double.', timestamp: hoursAgo(4), isMe: false, reactions: [{ emoji: '\u2705', count: 5, byMe: true }] },
    { id: 'cs2', sender: 'You', initials: 'ME', role: 'Member', content: 'Tested the main camera rig and stream encoder. All green. Backup camera also functional.', timestamp: hoursAgo(3), isMe: true, reactions: [{ emoji: '\uD83D\uDC4D', count: 4, byMe: false }] },
    { id: 'cs3', sender: 'Funmi Adeyemi', initials: 'FA', role: 'Worship Leader', content: 'Can we do a full rehearsal with the livestream running Friday morning? I want to check audio mix on the stream.', timestamp: hoursAgo(2), isMe: false, replyCount: 2, threadReplies: [
      { id: 'cs3-r1', sender: 'You', initials: 'ME', role: 'Member', content: "Friday 9am works. I'll have everything live by 8:45.", timestamp: hoursAgo(1.8), isMe: true },
      { id: 'cs3-r2', sender: 'Funmi Adeyemi', initials: 'FA', role: 'Worship Leader', content: "Perfect. I'll bring the full worship team.", timestamp: hoursAgo(1.6), isMe: false },
    ] },
    { id: 'cs4', sender: 'Deacon Williams', initials: 'DW', role: 'Deacon Board', content: 'Great work team. This is going to be a powerful service. Thank you all.', timestamp: hoursAgo(0.5), isMe: false, reactions: [{ emoji: '\uD83D\uDE4F', count: 8, byMe: true }] },
  ],
  'cr-lesson': [
    { id: 'cl1', sender: 'Brother Thompson', initials: 'BT', role: "Children's Ministry Lead", content: 'New Easter curriculum materials added to shared folder. Use these for the final two weeks of the season.', timestamp: hoursAgo(6), isMe: false, reactions: [{ emoji: '\uD83D\uDC4D', count: 7, byMe: true }] },
    { id: 'cl2', sender: 'Sister Nkechi', initials: 'SN', role: 'Teacher', content: 'Love the resurrection garden craft idea on page 4. The kids will love that.', timestamp: hoursAgo(5), isMe: false, replyCount: 1, threadReplies: [
      { id: 'cl2-r1', sender: 'Brother Thompson', initials: 'BT', role: "Children's Ministry Lead", content: "I used it last year at my previous church — huge hit. Kids remember it for months.", timestamp: hoursAgo(4.8), isMe: false },
    ] },
    { id: 'cl3', sender: 'You', initials: 'ME', role: 'Teacher', content: "I'll prep the soil, seeds, and small pots for all 3 classes. About how many kids per session?", timestamp: hoursAgo(4), isMe: true },
    { id: 'cl4', sender: 'Brother Thompson', initials: 'BT', role: "Children's Ministry Lead", content: 'Average 14 per class, so plan for 50 total. Thank you!', timestamp: hoursAgo(3), isMe: false },
  ],
  'cr-score': [
    { id: 'csc1', sender: 'Michael Chen', initials: 'MC', role: 'Singles Ministry', content: 'Planning meeting for spring retreat moved to Wednesday 8pm. Zoom link in the calendar invite.', timestamp: hoursAgo(8), isMe: false, reactions: [{ emoji: '\u2705', count: 3, byMe: true }] },
    { id: 'csc2', sender: 'You', initials: 'ME', role: 'Member', content: "Confirmed. I'll have the venue options ready to present — narrowed it down to 3 sites within budget.", timestamp: hoursAgo(6), isMe: true },
    { id: 'csc3', sender: 'Michael Chen', initials: 'MC', role: 'Singles Ministry', content: 'Also — should we do a theme this year? Last retreat had good feedback on the "identity" theme.', timestamp: hoursAgo(4), isMe: false, replyCount: 2, threadReplies: [
      { id: 'csc3-r1', sender: 'You', initials: 'ME', role: 'Member', content: '"Purpose and Community" could work well for this season.', timestamp: hoursAgo(3.8), isMe: true },
      { id: 'csc3-r2', sender: 'Michael Chen', initials: 'MC', role: 'Singles Ministry', content: "I like it. Let's bring 3 theme options Wednesday and vote.", timestamp: hoursAgo(3.6), isMe: false },
    ] },
    { id: 'csc4', sender: 'You', initials: 'ME', role: 'Member', content: 'Will do. See you all Wednesday!', timestamp: hoursAgo(1), isMe: true },
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
  { id: 'gdm1', mode: 'sports', name: 'HC Miles', initials: 'HM', username: '@hcmiles', role: 'Head Coach', preview: 'Let me know when you finish the Bethel scouting notes.', timestamp: hoursAgo(0.5), unread: true, pinned: true, isRequest: false },
  { id: 'gdm2', mode: 'sports', name: 'Jaylen Thomas', initials: 'JT', username: '@jthomas', role: 'Student Athlete', preview: 'Coach, can we go over my film session notes?', timestamp: hoursAgo(2), unread: true, pinned: false, isRequest: false },
  { id: 'gdm3', mode: 'sports', name: 'Marcus Davis', initials: 'MD', username: '@mdavis', role: 'Video Coordinator', preview: 'Clips uploaded to the shared folder.', timestamp: hoursAgo(3), unread: false, pinned: false, isRequest: false },
  { id: 'gdm4', mode: 'church', name: 'Chioma Okonkwo', initials: 'CO', username: '@cokonkwo', role: 'Associate Pastor', preview: 'Holy Week schedule looks good. Thanks for reviewing.', timestamp: hoursAgo(4), unread: false, pinned: true, isRequest: false },
  { id: 'gdm5', mode: 'business', name: 'Kofi Achebe', initials: 'KA', username: '@kachebe', role: 'CTO', preview: 'API latency improvement metrics look solid.', timestamp: hoursAgo(6), unread: false, pinned: false, isRequest: false },
  { id: 'gdm6', mode: 'sports', name: 'DeShawn Mitchell', initials: 'DM', username: '@dmitchell', role: 'Recruit', preview: 'Looking forward to the campus visit next Tuesday!', timestamp: hoursAgo(5), unread: true, pinned: false, isRequest: false },
  { id: 'gdm7', mode: 'education', name: 'Dean Clark', initials: 'DC', username: '@dclark', role: 'Dean of Students', preview: 'Retention numbers report is ready for review.', timestamp: hoursAgo(8), unread: false, pinned: false, isRequest: false },
  { id: 'gdm8', mode: 'church', name: 'Funmi Adeyemi', initials: 'FA', username: '@fadeyemi', role: 'Worship Leader', preview: 'Easter song list finalized. Let me know if you want changes.', timestamp: hoursAgo(10), unread: false, pinned: false, isRequest: false },
  { id: 'gdm9', mode: 'business', name: 'Sarah Kim', initials: 'SK', username: '@skim', role: 'Product Lead', preview: 'V3 Messages spec approved. Moving to dev.', timestamp: hoursAgo(12), unread: false, pinned: false, isRequest: false },
  { id: 'gdm10', mode: 'sports', name: 'AD Johnson', initials: 'AJ', username: '@adjohnson', role: 'Athletic Director', preview: 'Spring recruiting budget is approved. Go get \'em.', timestamp: daysAgo(1), unread: false, pinned: false, isRequest: false },
];

/** DM conversation messages (org-scoped + cross-org) */
const GLOBAL_DM_MESSAGES: Record<string, RoomMessageV3[]> = {
  // ── Sports org ──────────────────────────────────────────────────────────
  'si1': [
    { id: 'si1-1', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Coach Pearson, you catch the film from last night?', timestamp: daysAgo(2), isMe: false },
    { id: 'si1-2', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Yeah. Their transition D is soft on the right side every time. We can attack that.', timestamp: daysAgo(2), isMe: true },
    { id: 'si1-3', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Exactly what I saw. Build a set play around it for Saturday.', timestamp: daysAgo(2), isMe: false },
    { id: 'si1-4', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'On it. I\'ll run it by you at Thursday walkthrough.', timestamp: daysAgo(1), isMe: true },
    { id: 'si1-5', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Also — Mitchell is trending up. I want him to see more minutes if he keeps it clean in practice.', timestamp: daysAgo(1), isMe: false },
    { id: 'si1-6', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Agreed. He\'s been locked in this week. I\'ll slot him in the second unit rotation.', timestamp: daysAgo(1), isMe: true },
    { id: 'si1-7', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Good. Don\'t tell him yet — keep him hungry.', timestamp: hoursAgo(20), isMe: false },
    { id: 'si1-8', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Ha. Understood.', timestamp: hoursAgo(20), isMe: true },
    { id: 'si1-9', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Scouting report on Bethel — what\'s the status?', timestamp: hoursAgo(3), isMe: false },
    { id: 'si1-10', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Almost done. Their #23 is a problem — 18 and 7 last 3 games. I\'m building a box-and-one package around him.', timestamp: hoursAgo(2), isMe: true },
    { id: 'si1-11', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Smart. What about their PG?', timestamp: hoursAgo(1.5), isMe: false },
    { id: 'si1-12', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Pushes pace hard in transition. I\'m adding a sprint-back emphasis for our bigs.', timestamp: hoursAgo(1), isMe: true },
    { id: 'si1-13', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Need your scouting report on Mitchell before Thursday.', timestamp: hoursAgo(0.5), isMe: false },
  ],
  'si2': [
    { id: 'si2-1', sender: 'Jaylen Thomas', initials: 'JT', role: 'Student Athlete', content: 'Coach Pearson, I watched the film from Tuesday like you said.', timestamp: daysAgo(1), isMe: false },
    { id: 'si2-2', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'And? What did you see?', timestamp: daysAgo(1), isMe: true },
    { id: 'si2-3', sender: 'Jaylen Thomas', initials: 'JT', role: 'Student Athlete', content: 'My closeout is too flat. I know. I\'m going baseline every time.', timestamp: daysAgo(1), isMe: false },
    { id: 'si2-4', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Exactly. Angle your approach, cut off the drive lane. Force him left — his left hand is a weakness.', timestamp: daysAgo(1), isMe: true },
    { id: 'si2-5', sender: 'Jaylen Thomas', initials: 'JT', role: 'Student Athlete', content: 'Got it. Can we do extra reps on that in Thursday practice?', timestamp: hoursAgo(5), isMe: false },
    { id: 'si2-6', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Already planned it. Be early.', timestamp: hoursAgo(4), isMe: true },
    { id: 'si2-7', sender: 'Jaylen Thomas', initials: 'JT', role: 'Student Athlete', content: 'Coach, can we go over my film session notes?', timestamp: hoursAgo(2), isMe: false },
  ],
  'si3': [
    { id: 'si3-1', sender: 'Marcus Davis', initials: 'MD', role: 'Video Coordinator', content: 'Bethel clips are cut and tagged. 4 plays on their inbound sets, 3 on their PG in transition.', timestamp: hoursAgo(5), isMe: false },
    { id: 'si3-2', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Perfect. Can you timestamp the #23 iso plays separately?', timestamp: hoursAgo(4), isMe: true },
    { id: 'si3-3', sender: 'Marcus Davis', initials: 'MD', role: 'Video Coordinator', content: 'Done. He goes right 80% of the time off the dribble. I flagged all 9 possessions.', timestamp: hoursAgo(3.5), isMe: false },
    { id: 'si3-4', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Send the final folder to Coach Miles too.', timestamp: hoursAgo(3), isMe: true },
    { id: 'si3-5', sender: 'Marcus Davis', initials: 'MD', role: 'Video Coordinator', content: 'Defensive clips for Saturday uploaded to shared folder.', timestamp: hoursAgo(3), isMe: false },
  ],
  // ── Church org ──────────────────────────────────────────────────────────
  'ci1': [
    { id: 'ci1-1', sender: 'Chioma Okonkwo', initials: 'CO', role: 'Associate Pastor', content: 'Pastor, I\'ve been working on the Holy Week volunteer assignments. Do you want to review before I send them out?', timestamp: daysAgo(2), isMe: false },
    { id: 'ci1-2', sender: 'You', initials: 'ME', role: 'Lead Pastor', content: 'Please. Especially Good Friday — that service runs long and we\'ll need extra greeters.', timestamp: daysAgo(2), isMe: true },
    { id: 'ci1-3', sender: 'Chioma Okonkwo', initials: 'CO', role: 'Associate Pastor', content: 'Already added 4 extra for Good Friday. I also moved the communion prep team to arrive 90 min early.', timestamp: daysAgo(1), isMe: false },
    { id: 'ci1-4', sender: 'You', initials: 'ME', role: 'Lead Pastor', content: 'That\'s exactly right. Good thinking.', timestamp: daysAgo(1), isMe: true },
    { id: 'ci1-5', sender: 'Chioma Okonkwo', initials: 'CO', role: 'Associate Pastor', content: 'One thing — Deacon Williams flagged that parking overflow will need volunteers too. Should we pull from the general pool?', timestamp: hoursAgo(6), isMe: false },
    { id: 'ci1-6', sender: 'You', initials: 'ME', role: 'Lead Pastor', content: 'Yes, use the general pool. Make sure they\'re briefed on the new flow through the north lot.', timestamp: hoursAgo(5), isMe: true },
    { id: 'ci1-7', sender: 'Chioma Okonkwo', initials: 'CO', role: 'Associate Pastor', content: 'Will do. I\'ll send the final schedule by end of day tomorrow.', timestamp: hoursAgo(2), isMe: false },
    { id: 'ci1-8', sender: 'You', initials: 'ME', role: 'Lead Pastor', content: 'Thank you Chioma. This is going to be a great week.', timestamp: hoursAgo(1.5), isMe: true },
    { id: 'ci1-9', sender: 'Chioma Okonkwo', initials: 'CO', role: 'Associate Pastor', content: 'The prayer schedule for Holy Week is finalized. Please review.', timestamp: hoursAgo(1), isMe: false },
  ],
  'ci2': [
    { id: 'ci2-1', sender: 'Deacon Williams', initials: 'DW', role: 'Deacon Board', content: 'Building fund update — we hit $142K of the $182K goal. Strong push this quarter.', timestamp: hoursAgo(4), isMe: false },
    { id: 'ci2-2', sender: 'You', initials: 'ME', role: 'Lead Pastor', content: 'Praise God. What\'s the timeline on the remaining $40K?', timestamp: hoursAgo(3.5), isMe: true },
    { id: 'ci2-3', sender: 'Deacon Williams', initials: 'DW', role: 'Deacon Board', content: 'At current pace, 6–8 weeks. Easter giving campaign could close the gap faster.', timestamp: hoursAgo(3), isMe: false },
    { id: 'ci2-4', sender: 'You', initials: 'ME', role: 'Lead Pastor', content: 'Let\'s plan a focused push during Holy Week messaging. I\'ll mention it Sunday.', timestamp: hoursAgo(3), isMe: true },
    { id: 'ci2-5', sender: 'Deacon Williams', initials: 'DW', role: 'Deacon Board', content: 'Building fund update — we\'re at 78% of our goal.', timestamp: hoursAgo(3), isMe: false },
  ],
  // ── Business org ────────────────────────────────────────────────────────
  'bi1': [
    { id: 'bi1-1', sender: 'Kofi Achebe', initials: 'KA', role: 'CTO', content: 'CDN migration is done. We\'re seeing 40% latency improvement across all major endpoints.', timestamp: daysAgo(1), isMe: false },
    { id: 'bi1-2', sender: 'You', initials: 'ME', role: 'CEO', content: 'That\'s massive. What\'s the cost delta vs the old setup?', timestamp: daysAgo(1), isMe: true },
    { id: 'bi1-3', sender: 'Kofi Achebe', initials: 'KA', role: 'CTO', content: 'Actually saving about 18% monthly. Better throughput at lower cost.', timestamp: daysAgo(1), isMe: false },
    { id: 'bi1-4', sender: 'You', initials: 'ME', role: 'CEO', content: 'Let\'s include that in the Series A deck. Operational efficiency story is strong here.', timestamp: daysAgo(1), isMe: true },
    { id: 'bi1-5', sender: 'Kofi Achebe', initials: 'KA', role: 'CTO', content: 'Agreed. I\'ll prep a one-pager with before/after metrics.', timestamp: hoursAgo(10), isMe: false },
    { id: 'bi1-6', sender: 'You', initials: 'ME', role: 'CEO', content: 'Perfect. Get it to Sarah for the deck by Thursday.', timestamp: hoursAgo(9), isMe: true },
    { id: 'bi1-7', sender: 'Kofi Achebe', initials: 'KA', role: 'CTO', content: 'Will do. Also flagging — we need a decision on the auth provider migration before next sprint.', timestamp: hoursAgo(3), isMe: false },
    { id: 'bi1-8', sender: 'You', initials: 'ME', role: 'CEO', content: 'Put it on the eng sync agenda for Monday. I want the team\'s input.', timestamp: hoursAgo(2), isMe: true },
    { id: 'bi1-9', sender: 'Kofi Achebe', initials: 'KA', role: 'CTO', content: 'API latency down 40% after the CDN migration. Metrics attached.', timestamp: hoursAgo(1), isMe: false },
  ],
  'bi2': [
    { id: 'bi2-1', sender: 'Patrick Bet-David', initials: 'PB', role: 'Advisor', content: 'Your Q1 numbers are solid. Are you thinking Series A this summer or waiting for more traction?', timestamp: daysAgo(3), isMe: false },
    { id: 'bi2-2', sender: 'You', initials: 'ME', role: 'CEO', content: 'Summer is the target. We want to hit 10K MAU first — we\'re at 6.8K now.', timestamp: daysAgo(3), isMe: true },
    { id: 'bi2-3', sender: 'Patrick Bet-David', initials: 'PB', role: 'Advisor', content: 'Smart. 10K gives you a clean story. Who are you pitching first?', timestamp: daysAgo(2), isMe: false },
    { id: 'bi2-4', sender: 'You', initials: 'ME', role: 'CEO', content: 'Starting with the three funds that showed interest at the last demo day. Then branching out.', timestamp: daysAgo(2), isMe: true },
    { id: 'bi2-5', sender: 'Patrick Bet-David', initials: 'PB', role: 'Advisor', content: 'Good. Let\'s sync on the Series A timeline this week.', timestamp: hoursAgo(3), isMe: false },
  ],
  'gdm1': [
    { id: 'gm1-0a', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Hey, do you have the Bethel roster yet? Coach Avery said he sent it over yesterday.', timestamp: daysAgo(2), isMe: false },
    { id: 'gm1-0b', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Just got it this morning. 12-man rotation, they\'re going deeper into their bench this season.', timestamp: daysAgo(2), isMe: true },
    { id: 'gm1-0c', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Good. Their #23 is the one to watch. Pull his last 3 games if you can.', timestamp: daysAgo(2), isMe: false },
    { id: 'gm1-0d', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'On it. He averages 18 and 7 but struggles against physical defenders. I\'ll build a package around that.', timestamp: daysAgo(1), isMe: true },
    { id: 'gm1-0e', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Perfect. Send me a summary before the team walkthrough tomorrow.', timestamp: daysAgo(1), isMe: false },
    { id: 'gm1-0f', sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Will do. Also flagging their PG — he likes to push pace in transition, we need to get back on every miss.', timestamp: daysAgo(1), isMe: true },
    { id: 'gm1-0g', sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Noted. Make sure the bigs hear that clearly. Last game they were slow to rotate.', timestamp: daysAgo(1), isMe: false },
    { id: 'gm1-1',  sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Great work on the defensive game plan for Bethel.', timestamp: hoursAgo(3), isMe: false },
    { id: 'gm1-2',  sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Thanks Coach. The 1-3-1 zone gave them trouble. I think we can exploit it again if they run it Saturday.', timestamp: hoursAgo(2.5), isMe: true },
    { id: 'gm1-3',  sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Agreed. Can you have the scout notes finalized by Thursday morning?', timestamp: hoursAgo(1), isMe: false },
    { id: 'gm1-4',  sender: 'You', initials: 'CP', role: 'Assistant Coach', content: 'Will do. I\'ll also include their inbound plays — they ran 3 different sets last game.', timestamp: hoursAgo(0.8), isMe: true },
    { id: 'gm1-5',  sender: 'HC Miles', initials: 'HM', role: 'Head Coach', content: 'Let me know when you finish the Bethel scouting notes.', timestamp: hoursAgo(0.5), isMe: false },
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
// GLOBAL REQUESTS — DMs from people outside the user's org awaiting acceptance
// =============================================================================

const GLOBAL_REQUESTS: InboxThreadV3[] = [
  { id: 'req1', mode: 'sports', name: 'DeShawn Mitchell', initials: 'DM', role: 'Recruit',
    orgName: 'Helena High School', username: 'deshawnm_22',
    preview: 'Coach, I saw your program highlights. Would love to learn more about Carroll.',
    timestamp: hoursAgo(2), unread: true, pinned: false, isRequest: true },
  { id: 'req2', mode: 'sports', name: 'Jordan Ellis', initials: 'JE', role: 'Transfer',
    orgName: 'Montana State', username: 'jellis_hoops',
    preview: 'Coach Pearson, I\'m exploring transfer options and Carroll is on my list.',
    timestamp: hoursAgo(5), unread: true, pinned: false, isRequest: true },
  { id: 'req3', mode: 'church', name: 'Amara Osei', initials: 'AO', role: 'Visitor',
    orgName: 'Grace Fellowship', username: 'amara.osei',
    preview: 'Hi, I visited last Sunday and would love to connect about small groups.',
    timestamp: hoursAgo(8), unread: true, pinned: false, isRequest: true },
  { id: 'req4', mode: 'business', name: 'Raj Patel', initials: 'RP', role: 'Investor',
    orgName: 'Cascade Ventures', username: 'rajpatel_vc',
    preview: 'Saw your pitch at TechStars. Would love to discuss a potential investment.',
    timestamp: hoursAgo(12), unread: true, pinned: false, isRequest: true },
  { id: 'req5', mode: 'education', name: 'Lisa Nguyen', initials: 'LN', role: 'Prospective Student',
    orgName: 'Billings Senior High', username: 'lisa.nguyen24',
    preview: 'Hi, I\'m interested in your nursing program. Can I ask a few questions?',
    timestamp: hoursAgo(18), unread: true, pinned: false, isRequest: true },
  { id: 'req6', mode: 'sports', name: 'Coach Rivera', initials: 'CR', role: 'Scout',
    orgName: 'Great Falls CMR', username: 'coachrivera_gf',
    preview: 'I have a 6\'4 wing who would be a great fit for your system.',
    timestamp: daysAgo(1), unread: true, pinned: false, isRequest: true },
  { id: 'req7', mode: 'church', name: 'David Mensah', initials: 'DM', role: 'Pastor',
    orgName: 'New Life Church', username: 'pastordmensah',
    preview: 'Would love to partner on a community outreach event this spring.',
    timestamp: daysAgo(1), unread: true, pinned: false, isRequest: true },
];

// =============================================================================
// EMAILS — per-mode mock data (reuses InboxThreadV3; role = subject line)
// =============================================================================

const SPORTS_EMAILS: InboxThreadV3[] = [
  { id: 'eml-s1', mode: 'sports', name: 'NAIA Eligibility Office', initials: 'NA', role: 'Spring Roster Deadline Reminder', preview: 'Please submit your final spring roster by March 31st. Late submissions will result in ineligibility for post-season play.', timestamp: hoursAgo(1), unread: true, pinned: false, isRequest: false, openedAt: hoursAgo(0.5) },
  { id: 'eml-s2', mode: 'sports', name: 'Carroll Athletics', initials: 'CA', role: 'Budget Approval — Spring Travel', preview: 'Your travel reimbursement request REQ-1043 has been approved for $2,400. See attached for disbursement details.', timestamp: hoursAgo(4), unread: true, pinned: false, isRequest: false, openedAt: hoursAgo(2) },
  { id: 'eml-s3', mode: 'sports', name: 'Bethel University', initials: 'BU', role: 'Game Day Logistics — Saturday', preview: 'Venue opens at 12:30 PM. Visitor locker room is in the East Wing. Parking passes attached.', timestamp: hoursAgo(8), unread: false, pinned: false, isRequest: false },
  { id: 'eml-s4', mode: 'sports', name: 'HC Miles', initials: 'HM', role: 'Weekly Coaching Staff Notes', preview: 'Team meeting agenda for Monday: defensive scheme review, scouting updates, player availability reports.', timestamp: daysAgo(1), unread: false, pinned: true, isRequest: false },
  { id: 'eml-s5', mode: 'sports', name: 'Patricia Moore', initials: 'PM', role: 'RE: Jaylen Academic Plan', preview: 'Thank you for your response, Coach. We would love to schedule a call this week if your schedule allows.', timestamp: daysAgo(2), unread: false, pinned: true, isRequest: false },
];

const CHURCH_EMAILS: InboxThreadV3[] = [
  { id: 'eml-c1', mode: 'church', name: 'Diocese of Helena', initials: 'DH', role: 'Easter Week Liturgy Guidelines', preview: 'Please ensure all Easter Week services follow the updated diocesan guidelines enclosed in this message.', timestamp: hoursAgo(2), unread: true, pinned: false, isRequest: false, openedAt: hoursAgo(1) },
  { id: 'eml-c2', mode: 'church', name: 'Finance Committee', initials: 'FC', role: 'Q1 Budget Review — Action Required', preview: 'The Q1 financial summary is attached. Please review and sign off before the board meeting on Friday.', timestamp: hoursAgo(5), unread: true, pinned: false, isRequest: false, openedAt: hoursAgo(3) },
  { id: 'eml-c3', mode: 'church', name: 'Community Food Bank', initials: 'CF', role: 'Partnership Confirmation — April Drive', preview: 'We are thrilled to confirm the April food drive partnership with 2819 Church. Details attached.', timestamp: hoursAgo(10), unread: false, pinned: false, isRequest: false },
  { id: 'eml-c4', mode: 'church', name: 'Chioma Okonkwo', initials: 'CO', role: 'Holy Week Staff Schedule', preview: 'Attached is the finalized Holy Week staff schedule. Please confirm your availability for each service.', timestamp: daysAgo(1), unread: false, pinned: true, isRequest: false },
  { id: 'eml-c5', mode: 'church', name: 'Media Ministry', initials: 'MM', role: 'Livestream Setup Notes for Easter', preview: 'Equipment checklist and streaming credentials for Easter Sunday broadcast are ready for review.', timestamp: daysAgo(2), unread: false, pinned: true, isRequest: false },
];

const BUSINESS_EMAILS: InboxThreadV3[] = [
  { id: 'eml-b1', mode: 'business', name: 'Legal Team', initials: 'LT', role: 'Series A Term Sheet — Review Required', preview: 'Attached is the revised term sheet from Sequoia. Key changes are highlighted in section 4 regarding board composition.', timestamp: hoursAgo(1), unread: true, pinned: false, isRequest: false, openedAt: hoursAgo(0.5) },
  { id: 'eml-b2', mode: 'business', name: 'Sarah Kim', initials: 'SK', role: 'V3 Messages Spec — Final Review', preview: 'The messages spec is attached for final sign-off. Engineering has estimated 3 sprints to ship the full feature set.', timestamp: hoursAgo(3), unread: true, pinned: false, isRequest: false, openedAt: hoursAgo(1.5) },
  { id: 'eml-b3', mode: 'business', name: 'Investor Relations', initials: 'IR', role: 'Monthly KPI Report — February', preview: 'MRR is at $142K, up 18% MoM. Churn held steady at 2.1%. Full breakdown in the attached report.', timestamp: hoursAgo(7), unread: false, pinned: false, isRequest: false },
  { id: 'eml-b4', mode: 'business', name: 'Marcus Webb', initials: 'MW', role: 'Partnership Proposal — PortfolioCo', preview: 'Following our meeting last week, I have attached the formal partnership proposal for your review and signature.', timestamp: daysAgo(1), unread: false, pinned: true, isRequest: false },
  { id: 'eml-b5', mode: 'business', name: 'Finance Dept', initials: 'FD', role: 'Q1 Expense Approval Needed', preview: 'Three purchase orders require your approval before end of quarter. Combined total: $34,200.', timestamp: daysAgo(2), unread: false, pinned: true, isRequest: false },
];

const EDUCATION_EMAILS: InboxThreadV3[] = [
  { id: 'eml-e1', mode: 'education', name: 'Department Chair', initials: 'DC', role: 'Curriculum Committee — Meeting Notes', preview: 'Minutes from Tuesday\'s curriculum review are attached. Action items due by Friday EOD.', timestamp: hoursAgo(2), unread: true, pinned: false, isRequest: false, openedAt: hoursAgo(1) },
  { id: 'eml-e2', mode: 'education', name: 'Jordan Ellis', initials: 'JE', role: 'RE: Portfolio Submission Extension', preview: 'Thank you for considering my request. My laptop issue has been resolved and I can submit by Thursday.', timestamp: hoursAgo(4), unread: true, pinned: false, isRequest: false, openedAt: hoursAgo(2) },
  { id: 'eml-e3', mode: 'education', name: 'Dean\'s Office', initials: 'DO', role: 'Spring Term Enrollment Confirmation', preview: 'Your course roster for Spring term has been finalized. 28 students enrolled in EDUC 301.', timestamp: hoursAgo(9), unread: false, pinned: true, isRequest: false },
  { id: 'eml-e4', mode: 'education', name: 'Parent Liaison', initials: 'PL', role: 'Parent-Teacher Conference Schedule', preview: 'Attached is the updated schedule for spring conferences. 14 slots remain available for booking.', timestamp: daysAgo(1), unread: false, pinned: false, isRequest: false },
  { id: 'eml-e5', mode: 'education', name: 'IT Department', initials: 'IT', role: 'LMS Maintenance Window — Friday Night', preview: 'The learning management system will be offline from 11pm–2am Friday for scheduled updates.', timestamp: daysAgo(2), unread: false, pinned: false, isRequest: false },
];

const COMPETITION_EMAILS: InboxThreadV3[] = [
  { id: 'eml-k1', mode: 'competition', name: 'Event Organizer', initials: 'EO', role: 'Bracket Seeding Confirmation', preview: 'Your seed position for the regional championship has been confirmed: #3 seed in the East bracket.', timestamp: hoursAgo(1), unread: true, pinned: false, isRequest: false },
  { id: 'eml-k2', mode: 'competition', name: 'Sponsorship Team', initials: 'ST', role: 'Sponsor Package — Spring Circuit', preview: 'Please review and sign the attached sponsorship agreement before the season opener on April 5th.', timestamp: hoursAgo(5), unread: true, pinned: false, isRequest: false },
  { id: 'eml-k3', mode: 'competition', name: 'League Commissioner', initials: 'LC', role: 'Rule Change Notice — Effective April 1', preview: 'Three rule modifications will take effect next month. Please review the attached amendment document carefully.', timestamp: hoursAgo(10), unread: false, pinned: false, isRequest: false },
  { id: 'eml-k4', mode: 'competition', name: 'Media Coordinator', initials: 'MC', role: 'Press Credentials — Regional Finals', preview: 'Your media badge for the regional finals is ready. Pick up at credentialing desk by 8am on race day.', timestamp: daysAgo(1), unread: false, pinned: false, isRequest: false },
  { id: 'eml-k5', mode: 'competition', name: 'Finance Office', initials: 'FO', role: 'Prize Distribution — February Events', preview: 'Prize winnings from February events have been processed. Transfer expected within 3–5 business days.', timestamp: daysAgo(2), unread: false, pinned: false, isRequest: false },
];

const EMAILS_MAP: Record<Mode, InboxThreadV3[]> = {
  sports:      SPORTS_EMAILS,
  church:      CHURCH_EMAILS,
  business:    BUSINESS_EMAILS,
  education:   EDUCATION_EMAILS,
  competition: COMPETITION_EMAILS,
};

// =============================================================================
// PUBLIC API
// =============================================================================

export function getInboxThreads(mode: Mode): InboxThreadV3[] {
  return INBOX_MAP[mode] ?? [];
}

export function getEmails(mode: Mode): InboxThreadV3[] {
  return EMAILS_MAP[mode] ?? [];
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
  return SPORTS_ROOM_MESSAGES[roomId]
    ?? CHURCH_ROOM_MESSAGES[roomId]
    ?? BUSINESS_ROOM_MESSAGES[roomId]
    ?? EDUCATION_ROOM_MESSAGES[roomId]
    ?? COMPETITION_ROOM_MESSAGES[roomId]
    ?? [];
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

/** Cross-org requests — DMs awaiting acceptance */
export function getRequests(): InboxThreadV3[] {
  return GLOBAL_REQUESTS;
}

export function getRequestCount(): number {
  return GLOBAL_REQUESTS.length;
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
