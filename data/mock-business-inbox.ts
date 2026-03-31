/**
 * Mock Business Inbox — Executive communication hub data.
 * 4 sections: Unread, Mentions, Escalations, Approvals
 * Entity-scoped, visibility-gated, decision-oriented.
 * Rendering context: Founder / CEO (A5, V4, D3)
 */

// =============================================================================
// TYPES
// =============================================================================

export type EscalationType = 'Budget' | 'Contract' | 'Compliance' | 'Personnel' | 'Strategic';
export type EscalationStatus = 'Needs Review' | 'Pending Info' | 'Resolved';

export type ApprovalObjectType = 'Deal' | 'Payment' | 'Policy' | 'Hire' | 'Obligation';
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

export interface BizInboxThread {
  id: string;
  name: string;
  initials: string;
  role: string;
  preview: string;
  timestamp: Date;
  unread: boolean;
}

export interface BizMention {
  id: string;
  roomName: string;
  senderName: string;
  senderInitials: string;
  preview: string;
  timestamp: Date;
}

export interface BizEscalation {
  id: string;
  requesterName: string;
  requesterInitials: string;
  requesterRole: string;
  escalationType: EscalationType;
  preview: string;
  linkedContextId?: string;
  linkedContextLabel?: string;
  status: EscalationStatus;
  timestamp: Date;
  authorityRequired: string;
  linkedObjectSummary?: string;
  threadMessages: BizThreadMessage[];
}

export interface BizApproval {
  id: string;
  objectType: ApprovalObjectType;
  title: string;
  department: string;
  amount?: string;
  requestedBy: string;
  requestedByInitials: string;
  dueDate: Date;
  status: ApprovalStatus;
  authorityRequired: string;
  validationStatus: string;
  objectSummary: string;
  threadMessages: BizThreadMessage[];
}

export interface BizThreadMessage {
  id: string;
  sender: string;
  initials: string;
  role: string;
  content: string;
  timestamp: Date;
  isMe: boolean;
}

// =============================================================================
// COLORS
// =============================================================================

export const ESCALATION_TYPE_COLORS: Record<EscalationType, string> = {
  Budget: '#B8943E',
  Contract: '#1A1714',
  Compliance: '#B85C5C',
  Personnel: '#1A1714',
  Strategic: '#5A8A6E',
};

export const ESCALATION_STATUS_COLORS: Record<EscalationStatus, string> = {
  'Needs Review': '#B85C5C',
  'Pending Info': '#B8943E',
  Resolved: '#5A8A6E',
};

export const APPROVAL_TYPE_COLORS: Record<ApprovalObjectType, string> = {
  Deal: '#1A1714',
  Payment: '#B8943E',
  Policy: '#B85C5C',
  Hire: '#1A1714',
  Obligation: '#5A8A6E',
};

export const APPROVAL_STATUS_COLORS: Record<ApprovalStatus, string> = {
  Pending: '#B8943E',
  Approved: '#5A8A6E',
  Rejected: '#B85C5C',
};

// =============================================================================
// HELPERS
// =============================================================================

function hoursAgo(h: number): Date {
  return new Date(Date.now() - h * 60 * 60 * 1000);
}

function daysAgo(d: number): Date {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000);
}

function daysFromNow(d: number): Date {
  return new Date(Date.now() + d * 24 * 60 * 60 * 1000);
}

// =============================================================================
// SECTION 1 — UNREAD (DMs + escalation + approval threads)
// =============================================================================

export const BIZ_INBOX_THREADS: BizInboxThread[] = [
  { id: 'bt-1', name: 'Kofi Achebe', initials: 'KA', role: 'CTO', preview: 'API latency down 40% after the CDN migration. Metrics attached.', timestamp: hoursAgo(1), unread: true },
  { id: 'bt-2', name: 'Elena Park', initials: 'EP', role: 'VP Product', preview: 'v3.0 feature spec finalized. Ready for your sign-off.', timestamp: hoursAgo(2), unread: true },
  { id: 'bt-3', name: 'Marcus Webb', initials: 'MW', role: 'BD Lead', preview: 'NovaTech partnership terms — they accepted our proposal.', timestamp: hoursAgo(3), unread: true },
  { id: 'bt-4', name: 'Sarah Kim', initials: 'SK', role: 'General Counsel', preview: 'IP filing update — provisional patent accepted.', timestamp: hoursAgo(5), unread: true },
  { id: 'bt-5', name: 'James Park', initials: 'JP', role: 'CFO', preview: 'Monthly burn rate report ready. Runway at 18 months.', timestamp: hoursAgo(8), unread: true },
  { id: 'bt-6', name: 'Rachel Torres', initials: 'RT', role: 'COO', preview: 'Office expansion — Floor 3 lease draft is in. Review needed.', timestamp: hoursAgo(12), unread: false },
  { id: 'bt-7', name: 'Legal Team', initials: 'LT', role: 'Legal', preview: 'NDA template updated for Series B conversations.', timestamp: daysAgo(1), unread: false },
  { id: 'bt-8', name: 'Board Secretary', initials: 'BS', role: 'Governance', preview: 'March board meeting agenda circulated for review.', timestamp: daysAgo(1), unread: false },
];

// DM thread messages (for thread detail)
export const BIZ_DM_MESSAGES: Record<string, BizThreadMessage[]> = {
  'bt-1': [
    { id: 'dm1-1', sender: 'Kofi Achebe', initials: 'KA', role: 'CTO', content: 'CDN migration complete. API latency is down 40% across all endpoints.', timestamp: hoursAgo(2), isMe: false },
    { id: 'dm1-2', sender: 'You', initials: 'ME', role: 'CEO', content: 'That\'s great. What\'s the impact on server costs?', timestamp: hoursAgo(1.5), isMe: true },
    { id: 'dm1-3', sender: 'Kofi Achebe', initials: 'KA', role: 'CTO', content: 'Down to $0.012/active user from $0.018. Metrics report attached.', timestamp: hoursAgo(1), isMe: false },
  ],
  'bt-2': [
    { id: 'dm2-1', sender: 'Elena Park', initials: 'EP', role: 'VP Product', content: 'v3.0 feature spec is finalized. 12 new features across 4 modules.', timestamp: hoursAgo(3), isMe: false },
    { id: 'dm2-2', sender: 'You', initials: 'ME', role: 'CEO', content: 'Send me the priorities breakdown. Want to review before the board packet.', timestamp: hoursAgo(2.5), isMe: true },
    { id: 'dm2-3', sender: 'Elena Park', initials: 'EP', role: 'VP Product', content: 'Done. P0 items are payments and enterprise SSO. Rest are P1.', timestamp: hoursAgo(2), isMe: false },
  ],
  'bt-3': [
    { id: 'dm3-1', sender: 'Marcus Webb', initials: 'MW', role: 'BD Lead', content: 'NovaTech accepted our partnership terms. Revenue share at 18%.', timestamp: hoursAgo(4), isMe: false },
    { id: 'dm3-2', sender: 'You', initials: 'ME', role: 'CEO', content: 'Excellent. Have Legal review the final agreement before signing.', timestamp: hoursAgo(3.5), isMe: true },
    { id: 'dm3-3', sender: 'Marcus Webb', initials: 'MW', role: 'BD Lead', content: 'Already sent to Sarah. She\'ll have it back by Thursday.', timestamp: hoursAgo(3), isMe: false },
  ],
};

// =============================================================================
// SECTION 2 — MENTIONS
// =============================================================================

export const BIZ_MENTIONS: BizMention[] = [
  { id: 'bm-1', roomName: '#executive-team', senderName: 'Rachel Torres', senderInitials: 'RT', preview: '@CEO the Q1 OKR review is scheduled for Friday 2pm — confirm?', timestamp: hoursAgo(1) },
  { id: 'bm-2', roomName: '#product', senderName: 'Elena Park', senderInitials: 'EP', preview: '@CEO v3.0 demo for enterprise clients — need your intro remarks', timestamp: hoursAgo(3) },
  { id: 'bm-3', roomName: '#fundraise', senderName: 'James Park', senderInitials: 'JP', preview: '@CEO Valley Capital wants to schedule the partner meeting this week', timestamp: hoursAgo(5) },
  { id: 'bm-4', roomName: '#all-hands', senderName: 'Rachel Torres', senderInitials: 'RT', preview: '@CEO town hall recording posted — 92% attendance', timestamp: hoursAgo(8) },
];

// =============================================================================
// SECTION 3 — ESCALATIONS
// =============================================================================

export const BIZ_ESCALATIONS: BizEscalation[] = [
  {
    id: 'be-1',
    requesterName: 'James Park',
    requesterInitials: 'JP',
    requesterRole: 'CFO',
    escalationType: 'Budget',
    preview: 'Engineering headcount increase — $420K annual impact',
    linkedContextId: 'budget-eng-2026',
    linkedContextLabel: 'Engineering Budget',
    status: 'Needs Review',
    timestamp: hoursAgo(2),
    authorityRequired: 'A5 (Founder)',
    linkedObjectSummary: 'Request to add 3 senior engineers to the v3.0 team. Annual cost: $420K. Current engineering budget utilization: 87%.',
    threadMessages: [
      { id: 'be1-1', sender: 'James Park', initials: 'JP', role: 'CFO', content: 'Engineering is requesting 3 additional headcount for v3.0. Annual cost impact is $420K. Current runway supports it but tightens Q3 buffer.', timestamp: hoursAgo(4), isMe: false },
      { id: 'be1-2', sender: 'Kofi Achebe', initials: 'KA', role: 'CTO', content: 'We need these hires to hit the enterprise launch timeline. Without them, we slip 6 weeks.', timestamp: hoursAgo(3), isMe: false },
      { id: 'be1-3', sender: 'James Park', initials: 'JP', role: 'CFO', content: 'Escalating to CEO for approval. This exceeds VP-level budget authority ($250K threshold).', timestamp: hoursAgo(2), isMe: false },
    ],
  },
  {
    id: 'be-2',
    requesterName: 'Sarah Kim',
    requesterInitials: 'SK',
    requesterRole: 'General Counsel',
    escalationType: 'Contract',
    preview: 'NovaTech partnership agreement — liability cap review',
    linkedContextId: 'deal-novatech',
    linkedContextLabel: 'NovaTech Partnership',
    status: 'Needs Review',
    timestamp: hoursAgo(4),
    authorityRequired: 'A5 (Founder)',
    linkedObjectSummary: 'Partnership agreement with NovaTech Solutions. Revenue share: 18%. Liability cap: $2M. Term: 3 years with auto-renewal.',
    threadMessages: [
      { id: 'be2-1', sender: 'Sarah Kim', initials: 'SK', role: 'General Counsel', content: 'NovaTech agreement reviewed. Two concerns: liability cap at $2M may be too low for our exposure, and the non-compete clause is broader than standard.', timestamp: hoursAgo(6), isMe: false },
      { id: 'be2-2', sender: 'Marcus Webb', initials: 'MW', role: 'BD Lead', content: 'They won\'t budge on the non-compete but may increase liability cap to $5M.', timestamp: hoursAgo(5), isMe: false },
      { id: 'be2-3', sender: 'Sarah Kim', initials: 'SK', role: 'General Counsel', content: 'Recommending CEO review before we counter-propose. Contract value exceeds VP approval threshold.', timestamp: hoursAgo(4), isMe: false },
    ],
  },
  {
    id: 'be-3',
    requesterName: 'Rachel Torres',
    requesterInitials: 'RT',
    requesterRole: 'COO',
    escalationType: 'Compliance',
    preview: 'SOC 2 Type II audit — remediation items require sign-off',
    linkedContextId: 'compliance-soc2',
    linkedContextLabel: 'SOC 2 Audit',
    status: 'Pending Info',
    timestamp: hoursAgo(6),
    authorityRequired: 'A5 (Founder)',
    linkedObjectSummary: 'SOC 2 Type II audit flagged 3 remediation items. Two are technical (resolved by Engineering), one requires executive attestation on data governance policy.',
    threadMessages: [
      { id: 'be3-1', sender: 'Rachel Torres', initials: 'RT', role: 'COO', content: 'Auditor flagged 3 items. Engineering resolved 2. The third requires CEO attestation on our data governance policy.', timestamp: hoursAgo(8), isMe: false },
      { id: 'be3-2', sender: 'You', initials: 'ME', role: 'CEO', content: 'Send me the attestation document. I\'ll review and sign by EOD.', timestamp: hoursAgo(7), isMe: true },
      { id: 'be3-3', sender: 'Rachel Torres', initials: 'RT', role: 'COO', content: 'Attached. Auditor also wants confirmation that the policy was board-approved. Checking governance records.', timestamp: hoursAgo(6), isMe: false },
    ],
  },
  {
    id: 'be-4',
    requesterName: 'Elena Park',
    requesterInitials: 'EP',
    requesterRole: 'VP Product',
    escalationType: 'Personnel',
    preview: 'VP Engineering candidate — final interview approval',
    linkedContextId: 'hire-vpe',
    linkedContextLabel: 'VP Eng Hire',
    status: 'Needs Review',
    timestamp: hoursAgo(10),
    authorityRequired: 'A5 (Founder)',
    linkedObjectSummary: 'VP Engineering finalist: Priya Sharma. 12 years experience (ex-Stripe, ex-Square). Proposed comp: $380K total (base + equity). All panel interviews passed.',
    threadMessages: [
      { id: 'be4-1', sender: 'Elena Park', initials: 'EP', role: 'VP Product', content: 'Priya Sharma passed all panel interviews. Strong technical depth and leadership experience. Unanimous recommendation.', timestamp: hoursAgo(12), isMe: false },
      { id: 'be4-2', sender: 'Kofi Achebe', initials: 'KA', role: 'CTO', content: 'I\'m fully on board. She\'d be a transformative hire for the engineering org.', timestamp: hoursAgo(11), isMe: false },
      { id: 'be4-3', sender: 'Elena Park', initials: 'EP', role: 'VP Product', content: 'VP-level hires require CEO approval. Escalating for final sign-off on offer letter.', timestamp: hoursAgo(10), isMe: false },
    ],
  },
  {
    id: 'be-5',
    requesterName: 'James Park',
    requesterInitials: 'JP',
    requesterRole: 'CFO',
    escalationType: 'Strategic',
    preview: 'Market expansion — EMEA entry strategy decision',
    linkedContextId: 'strategy-emea',
    linkedContextLabel: 'EMEA Strategy',
    status: 'Resolved',
    timestamp: daysAgo(2),
    authorityRequired: 'A5 (Founder)',
    linkedObjectSummary: 'EMEA market entry proposal. Two options: (A) Direct entity in UK, (B) Partnership model with local distributor. Investment: $1.2M (A) vs $400K (B).',
    threadMessages: [
      { id: 'be5-1', sender: 'James Park', initials: 'JP', role: 'CFO', content: 'EMEA expansion analysis complete. Option A (direct entity) costs $1.2M but gives full control. Option B (partnership) is $400K but limits margin.', timestamp: daysAgo(4), isMe: false },
      { id: 'be5-2', sender: 'Rachel Torres', initials: 'RT', role: 'COO', content: 'Operational complexity of Option A is significant. We\'d need 3 FTEs on the ground minimum.', timestamp: daysAgo(3), isMe: false },
      { id: 'be5-3', sender: 'You', initials: 'ME', role: 'CEO', content: 'Going with Option B. Start with partnership, prove the market, then evaluate direct entity in 12 months. Keep capital efficient pre-Series B close.', timestamp: daysAgo(2), isMe: true },
    ],
  },
];

// =============================================================================
// SECTION 4 — APPROVALS
// =============================================================================

export const BIZ_APPROVALS: BizApproval[] = [
  {
    id: 'ba-1',
    objectType: 'Deal',
    title: 'NovaTech Partnership Agreement',
    department: 'Business Development',
    amount: '$2.4M TCV',
    requestedBy: 'Marcus Webb',
    requestedByInitials: 'MW',
    dueDate: daysFromNow(3),
    status: 'Pending',
    authorityRequired: 'A5 (Founder)',
    validationStatus: 'Legal Review Complete',
    objectSummary: 'Strategic partnership with NovaTech Solutions. 3-year term, 18% revenue share, $2.4M total contract value. Legal has reviewed and approved with minor modifications.',
    threadMessages: [
      { id: 'ba1-1', sender: 'Marcus Webb', initials: 'MW', role: 'BD Lead', content: 'Partnership agreement finalized. Legal has signed off. Requesting CEO approval to execute.', timestamp: hoursAgo(6), isMe: false },
      { id: 'ba1-2', sender: 'Sarah Kim', initials: 'SK', role: 'General Counsel', content: 'Legal review complete. All material terms acceptable. Liability cap increased to $5M per our request.', timestamp: hoursAgo(5), isMe: false },
    ],
  },
  {
    id: 'ba-2',
    objectType: 'Payment',
    title: 'Q1 Infrastructure Upgrade',
    department: 'Engineering',
    amount: '$185,000',
    requestedBy: 'Kofi Achebe',
    requestedByInitials: 'KA',
    dueDate: daysFromNow(5),
    status: 'Pending',
    authorityRequired: 'A5 (Founder)',
    validationStatus: 'Budget Verified',
    objectSummary: 'Infrastructure upgrade: CDN expansion + database scaling. Vendor: AWS. Budget allocation verified by Finance. Required for v3.0 enterprise launch.',
    threadMessages: [
      { id: 'ba2-1', sender: 'Kofi Achebe', initials: 'KA', role: 'CTO', content: 'Need approval for $185K infrastructure spend. CDN expansion + database scaling for enterprise launch.', timestamp: hoursAgo(8), isMe: false },
      { id: 'ba2-2', sender: 'James Park', initials: 'JP', role: 'CFO', content: 'Budget verified. This falls within the approved Q1 infrastructure allocation.', timestamp: hoursAgo(7), isMe: false },
    ],
  },
  {
    id: 'ba-3',
    objectType: 'Policy',
    title: 'Remote Work Policy Update',
    department: 'Operations',
    requestedBy: 'Rachel Torres',
    requestedByInitials: 'RT',
    dueDate: daysFromNow(7),
    status: 'Pending',
    authorityRequired: 'A5 (Founder)',
    validationStatus: 'Legal Review Complete',
    objectSummary: 'Updated remote work policy: hybrid model (3 days in-office, 2 remote). Applies to all non-executive employees. Legal has reviewed for compliance.',
    threadMessages: [
      { id: 'ba3-1', sender: 'Rachel Torres', initials: 'RT', role: 'COO', content: 'Proposing hybrid model: 3 days in-office, 2 remote. Based on team feedback surveys and productivity data.', timestamp: daysAgo(1), isMe: false },
      { id: 'ba3-2', sender: 'Sarah Kim', initials: 'SK', role: 'General Counsel', content: 'Policy is compliant. No issues from a legal standpoint.', timestamp: hoursAgo(12), isMe: false },
    ],
  },
  {
    id: 'ba-4',
    objectType: 'Hire',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    amount: '$165,000 base',
    requestedBy: 'Kofi Achebe',
    requestedByInitials: 'KA',
    dueDate: daysFromNow(2),
    status: 'Pending',
    authorityRequired: 'A4 (VP+)',
    validationStatus: 'HR Approved',
    objectSummary: 'Senior Frontend Engineer hire: Alex Chen. 6 years experience (ex-Vercel). Proposed compensation: $165K base + 0.08% equity. Backfill for open role.',
    threadMessages: [
      { id: 'ba4-1', sender: 'Kofi Achebe', initials: 'KA', role: 'CTO', content: 'Alex Chen — strong candidate. Passed all technical rounds. Requesting approval for offer.', timestamp: hoursAgo(10), isMe: false },
    ],
  },
  {
    id: 'ba-5',
    objectType: 'Obligation',
    title: 'Annual SEC Filing — 10-K',
    department: 'Compliance',
    requestedBy: 'Sarah Kim',
    requestedByInitials: 'SK',
    dueDate: daysFromNow(14),
    status: 'Pending',
    authorityRequired: 'A5 (Founder)',
    validationStatus: 'Draft Complete',
    objectSummary: 'Annual 10-K filing for SEC. Draft prepared by external auditors. Requires CEO certification and signature before submission.',
    threadMessages: [
      { id: 'ba5-1', sender: 'Sarah Kim', initials: 'SK', role: 'General Counsel', content: '10-K draft complete. External auditors signed off. Need CEO certification and signature.', timestamp: daysAgo(1), isMe: false },
      { id: 'ba5-2', sender: 'James Park', initials: 'JP', role: 'CFO', content: 'All financials verified. Consistent with board-approved numbers.', timestamp: hoursAgo(14), isMe: false },
    ],
  },
  {
    id: 'ba-6',
    objectType: 'Payment',
    title: 'Legal Retainer — Q2',
    department: 'Legal',
    amount: '$45,000',
    requestedBy: 'Sarah Kim',
    requestedByInitials: 'SK',
    dueDate: daysFromNow(10),
    status: 'Approved',
    authorityRequired: 'A4 (VP+)',
    validationStatus: 'Budget Verified',
    objectSummary: 'Quarterly legal retainer renewal with Morrison & Associates. Standard terms, no changes from Q1.',
    threadMessages: [
      { id: 'ba6-1', sender: 'Sarah Kim', initials: 'SK', role: 'General Counsel', content: 'Requesting Q2 retainer renewal. Same terms as Q1.', timestamp: daysAgo(3), isMe: false },
      { id: 'ba6-2', sender: 'You', initials: 'ME', role: 'CEO', content: 'Approved. Standard renewal.', timestamp: daysAgo(2), isMe: true },
    ],
  },
];

// =============================================================================
// PUBLIC API
// =============================================================================

export function getBizInboxThreads(search: string): BizInboxThread[] {
  let items = [...BIZ_INBOX_THREADS];
  if (search.trim()) {
    const q = search.toLowerCase();
    items = items.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.preview.toLowerCase().includes(q) ||
        t.role.toLowerCase().includes(q),
    );
  }
  return items.sort((a, b) => {
    if (a.unread !== b.unread) return a.unread ? -1 : 1;
    return b.timestamp.getTime() - a.timestamp.getTime();
  });
}

export function getBizMentions(search: string): BizMention[] {
  let items = [...BIZ_MENTIONS];
  if (search.trim()) {
    const q = search.toLowerCase();
    items = items.filter(
      (m) =>
        m.roomName.toLowerCase().includes(q) ||
        m.senderName.toLowerCase().includes(q) ||
        m.preview.toLowerCase().includes(q),
    );
  }
  return items;
}

export function getBizEscalations(search: string): BizEscalation[] {
  let items = [...BIZ_ESCALATIONS];
  if (search.trim()) {
    const q = search.toLowerCase();
    items = items.filter(
      (e) =>
        e.requesterName.toLowerCase().includes(q) ||
        e.preview.toLowerCase().includes(q) ||
        e.escalationType.toLowerCase().includes(q) ||
        (e.linkedContextLabel && e.linkedContextLabel.toLowerCase().includes(q)),
    );
  }
  return items;
}

export function getBizApprovals(search: string): BizApproval[] {
  let items = [...BIZ_APPROVALS];
  if (search.trim()) {
    const q = search.toLowerCase();
    items = items.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.requestedBy.toLowerCase().includes(q) ||
        a.objectType.toLowerCase().includes(q) ||
        a.department.toLowerCase().includes(q),
    );
  }
  return items;
}

export function getDmMessages(threadId: string): BizThreadMessage[] {
  return BIZ_DM_MESSAGES[threadId] ?? [];
}

export function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffH = diffMs / (1000 * 60 * 60);
  if (diffH < 0) {
    // Future date (due dates)
    const diffD = Math.round(Math.abs(diffH) / 24);
    if (diffD === 0) return 'Today';
    if (diffD === 1) return 'Tomorrow';
    return `In ${diffD}d`;
  }
  if (diffH < 1) return `${Math.max(1, Math.round(diffH * 60))}m`;
  if (diffH < 24) return `${Math.round(diffH)}h`;
  const diffD = Math.round(diffH / 24);
  if (diffD === 1) return 'Yesterday';
  if (diffD < 7) return `${diffD}d`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatDueDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
