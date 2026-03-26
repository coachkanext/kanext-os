/**
 * Contact detail mock data — communication logs, notes, files per CRM contact.
 * Supplements mock-personal-deals.ts for the contact detail relationship workspace.
 */

export type CommType = 'message' | 'call' | 'email' | 'video';

export interface CommunicationEntry {
  id: string;
  type: CommType;
  preview: string;
  timestamp: Date;
  direction: 'inbound' | 'outbound';
}

export interface ContactNote {
  id: string;
  text: string;
  createdAt: Date;
}

export interface ContactFile {
  id: string;
  name: string;
  fileType: 'contract' | 'proposal' | 'invoice' | 'brief' | 'other';
  source: 'email' | 'message' | 'manual';
  size: string;
  date: Date;
}

export interface ContactDetail {
  contactId: string;
  title: string; // job title / role
  comms: CommunicationEntry[];
  notes: ContactNote[];
  files: ContactFile[];
}

export const CONTACT_DETAILS: ContactDetail[] = [
  {
    contactId: 'cc1',
    title: 'Senior Partnerships Manager',
    comms: [
      { id: 'c1a', type: 'message', preview: "Hey! Love what you're doing with KaNeXT. We'd love to explore a content partnership.", timestamp: new Date('2026-03-01T10:30:00'), direction: 'inbound' },
      { id: 'c1b', type: 'message', preview: "Thanks Jordan! I'd be open to hearing more. What kind of content are you thinking?", timestamp: new Date('2026-03-01T11:15:00'), direction: 'outbound' },
      { id: 'c1c', type: 'call',    preview: '30 min · Discovery call — budget confirmed, 4 posts/month at $15K', timestamp: new Date('2026-03-08T14:00:00'), direction: 'inbound' },
      { id: 'c1d', type: 'email',   preview: 'Proposal deck + rate card sent for review', timestamp: new Date('2026-03-22T09:00:00'), direction: 'outbound' },
    ],
    notes: [
      { id: 'n1a', text: 'Met via Instagram DM. Very professional, quick responder.', createdAt: new Date('2026-03-01T12:00:00') },
      { id: 'n1b', text: 'Decision maker confirmed — Jordan has full sign-off authority up to $20K.', createdAt: new Date('2026-03-08T15:00:00') },
    ],
    files: [
      { id: 'f1a', name: 'Nike_Partnership_Proposal.pdf', fileType: 'proposal',  source: 'email',  size: '2.4 MB', date: new Date('2026-03-22T09:00:00') },
      { id: 'f1b', name: 'Rate_Card_2026.pdf',            fileType: 'other',     source: 'email',  size: '0.8 MB', date: new Date('2026-03-22T09:00:00') },
    ],
  },
  {
    contactId: 'cc2',
    title: 'Speaker Relations Lead',
    comms: [
      { id: 'c2a', type: 'email', preview: "Hi Sammy — we'd love to have you as a keynote speaker at TechConf 2026.", timestamp: new Date('2026-02-15T11:00:00'), direction: 'inbound' },
      { id: 'c2b', type: 'call',  preview: '20 min · Topic discussion — March 29 keynote slot confirmed, $5K + travel', timestamp: new Date('2026-02-20T15:30:00'), direction: 'inbound' },
      { id: 'c2c', type: 'email', preview: 'Contract signed and returned. Looking forward to March 29!', timestamp: new Date('2026-03-10T16:30:00'), direction: 'outbound' },
    ],
    notes: [
      { id: 'n2a', text: 'Referred by a previous event contact. Very organized.', createdAt: new Date('2026-02-15T12:00:00') },
      { id: 'n2b', text: 'Prefers email over DM. Responds within 24 hours.', createdAt: new Date('2026-02-20T16:00:00') },
    ],
    files: [
      { id: 'f2a', name: 'TechConf2026_Speaker_Contract.pdf', fileType: 'contract', source: 'email', size: '1.1 MB', date: new Date('2026-03-05T10:00:00') },
      { id: 'f2b', name: 'Speaker_Brief_TechConf2026.pdf',    fileType: 'brief',    source: 'email', size: '0.5 MB', date: new Date('2026-02-15T11:00:00') },
    ],
  },
  {
    contactId: 'cc3',
    title: 'Head of Creator Partnerships',
    comms: [
      { id: 'c3a', type: 'email', preview: "Hi Sammy, I'm Alex from TechBrand. Big fan — wanted to explore a sponsorship.", timestamp: new Date('2026-03-05T09:00:00'), direction: 'inbound' },
      { id: 'c3b', type: 'video', preview: '45 min · Video call — deliverables, exclusivity, budget range discussed', timestamp: new Date('2026-03-15T11:00:00'), direction: 'inbound' },
      { id: 'c3c', type: 'email', preview: 'Revised proposal: $8K for logo placement + 2 newsletter mentions', timestamp: new Date('2026-03-23T08:30:00'), direction: 'outbound' },
      { id: 'c3d', type: 'email', preview: 'Counter from Alex — redlined contract attached', timestamp: new Date('2026-03-24T09:00:00'), direction: 'inbound' },
    ],
    notes: [
      { id: 'n3a', text: "Alex needs CMO approval for anything over $10K. We're under that.", createdAt: new Date('2026-03-15T12:00:00') },
      { id: 'n3b', text: 'They want exclusivity from direct competitor brands only. Fine with that.', createdAt: new Date('2026-03-23T09:00:00') },
    ],
    files: [
      { id: 'f3a', name: 'TechBrand_Sponsorship_v2.pdf',          fileType: 'contract', source: 'email',  size: '1.8 MB', date: new Date('2026-03-24T09:00:00') },
      { id: 'f3b', name: 'Counter_Proposal_TechBrand.pdf',         fileType: 'proposal', source: 'manual', size: '0.9 MB', date: new Date('2026-03-23T08:30:00') },
    ],
  },
  {
    contactId: 'cc4',
    title: 'Host & Founder',
    comms: [
      { id: 'c4a', type: 'message', preview: 'Loved your post on building in public! Would you come on the pod?', timestamp: new Date('2026-03-16T14:00:00'), direction: 'inbound' },
      { id: 'c4b', type: 'message', preview: 'Thanks Marcus! Let me check my schedule and get back to you.', timestamp: new Date('2026-03-16T18:00:00'), direction: 'outbound' },
      { id: 'c4c', type: 'email',   preview: 'Paid article published — 3,000 readers, 12% click rate', timestamp: new Date('2026-02-28T14:30:00'), direction: 'inbound' },
    ],
    notes: [
      { id: 'n4a', text: 'The Founders Pod: 80K YouTube subscribers, 30K Spotify listeners.', createdAt: new Date('2026-03-16T19:00:00') },
    ],
    files: [
      { id: 'f4a', name: 'FoundersPod_Article_Invoice.pdf', fileType: 'invoice', source: 'email', size: '0.3 MB', date: new Date('2026-02-20T10:00:00') },
    ],
  },
  {
    contactId: 'cc5',
    title: 'Brand Partnerships Director',
    comms: [
      { id: 'c5a', type: 'message', preview: "Hi Sammy! We've been following your fitness content — would love to partner.", timestamp: new Date('2026-03-12T10:00:00'), direction: 'inbound' },
      { id: 'c5b', type: 'call',    preview: '40 min · Ambassador program: $1K/mo × 12, 1 post/week with FitLife gear', timestamp: new Date('2026-03-21T14:00:00'), direction: 'inbound' },
      { id: 'c5c', type: 'message', preview: 'Really excited about this! Sending over my media kit now.', timestamp: new Date('2026-03-21T15:00:00'), direction: 'outbound' },
    ],
    notes: [
      { id: 'n5a', text: 'Sarah is the decision maker. Very warm, moves fast.', createdAt: new Date('2026-03-12T11:00:00') },
      { id: 'n5b', text: 'FitLife has 2M IG followers. Good brand alignment for my audience.', createdAt: new Date('2026-03-21T15:30:00') },
    ],
    files: [
      { id: 'f5a', name: 'FitLife_Ambassador_Brief.pdf', fileType: 'brief', source: 'message', size: '1.3 MB', date: new Date('2026-03-12T10:30:00') },
    ],
  },
  {
    contactId: 'cc6',
    title: 'Event Director',
    comms: [
      { id: 'c6a', type: 'email', preview: "Hi Sammy — Maya Patel suggested you'd be perfect for Summit 2026 keynote.", timestamp: new Date('2026-03-19T09:30:00'), direction: 'inbound' },
    ],
    notes: [
      { id: 'n6a', text: 'Summit 2026 is in Chicago in June. ~2,000 attendees. Great exposure.', createdAt: new Date('2026-03-19T10:00:00') },
    ],
    files: [],
  },
  {
    contactId: 'cc7',
    title: 'Creator Partnerships Manager',
    comms: [
      { id: 'c7a', type: 'email', preview: "Hi Sammy — we connect creators with brand integrations on YouTube. Interested?", timestamp: new Date('2026-03-10T11:00:00'), direction: 'inbound' },
      { id: 'c7b', type: 'video', preview: '30 min · Zoom — content alignment, format, 3-video integration structure', timestamp: new Date('2026-03-18T15:00:00'), direction: 'inbound' },
      { id: 'c7c', type: 'email', preview: 'Proposal sent: 3 integrations at $2K each = $6K total', timestamp: new Date('2026-03-20T10:30:00'), direction: 'outbound' },
    ],
    notes: [
      { id: 'n7a', text: 'Creator Fund works with 50+ brands. Could become a recurring deal source.', createdAt: new Date('2026-03-10T12:00:00') },
    ],
    files: [
      { id: 'f7a', name: 'CreatorFund_Integration_Proposal.pdf', fileType: 'proposal', source: 'email', size: '1.0 MB', date: new Date('2026-03-20T10:30:00') },
    ],
  },
  {
    contactId: 'cc8',
    title: 'Director of Creator Collaborations',
    comms: [
      { id: 'c8a', type: 'message', preview: "Great meeting you at the Creator Summit! Let's talk about a collab.", timestamp: new Date('2026-03-05T20:00:00'), direction: 'inbound' },
      { id: 'c8b', type: 'email',   preview: 'James sent formal intro — co-branded product + 6 months of content brief', timestamp: new Date('2026-03-10T09:00:00'), direction: 'inbound' },
      { id: 'c8c', type: 'call',    preview: '60 min · Deep dive on co-branded product line and content deliverables', timestamp: new Date('2026-03-20T16:00:00'), direction: 'inbound' },
      { id: 'c8d', type: 'email',   preview: 'Counter-proposal sent: $20K + $3K product credit, lawyer review needed', timestamp: new Date('2026-03-23T11:00:00'), direction: 'outbound' },
    ],
    notes: [
      { id: 'n8a', text: 'Met James at Creator Summit NYC. Director-level, full authority.', createdAt: new Date('2026-03-05T21:00:00') },
      { id: 'n8b', text: 'Adidas deal needs legal review before signing — need IP ownership clause.', createdAt: new Date('2026-03-20T17:00:00') },
      { id: 'n8c', text: 'James responds faster via email than DM or phone.', createdAt: new Date('2026-03-23T12:00:00') },
    ],
    files: [
      { id: 'f8a', name: 'Adidas_Collab_Brief.pdf',       fileType: 'brief',    source: 'email',  size: '3.1 MB', date: new Date('2026-03-10T09:00:00') },
      { id: 'f8b', name: 'Counter_Proposal_Adidas.pdf',   fileType: 'proposal', source: 'manual', size: '1.4 MB', date: new Date('2026-03-23T11:00:00') },
    ],
  },
];

export function getContactDetail(contactId: string): ContactDetail | undefined {
  return CONTACT_DETAILS.find(d => d.contactId === contactId);
}

export function formatCommType(type: CommType): string {
  const icons: Record<CommType, string> = { message: '💬', call: '📞', email: '✉️', video: '🎥' };
  return icons[type];
}

export function formatCommLabel(type: CommType): string {
  const labels: Record<CommType, string> = { message: 'Message', call: 'Call', email: 'Email', video: 'Video Call' };
  return labels[type];
}

export function formatFileType(fileType: ContactFile['fileType']): string {
  const map: Record<ContactFile['fileType'], string> = {
    contract: '📄', proposal: '📋', invoice: '💰', brief: '📑', other: '📎',
  };
  return map[fileType];
}
