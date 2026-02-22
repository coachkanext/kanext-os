/**
 * Business Organization Rooms — V2 Mock Data
 * Template-based room system with immutable receipts, decisions, artifacts,
 * members, and timeline events. 9 canonical room templates.
 */

import type { BizOrgTab } from '@/utils/business-rbac';
import type { BizReceipt, CrossTabLink } from '@/data/biz-org-shared-types';
import {
  KANEXT_HOLDCO,
  KANEXT_OPSCO,
  SEEDED_ENTITY_NAMES,
} from '@/data/biz-org-shared-types';

// =============================================================================
// TYPES
// =============================================================================

export type RoomTemplate =
  | 'executive_ops'
  | 'fundraising'
  | 'board_governance'
  | 'partner'
  | 'acquisition_diligence'
  | 'finance_close'
  | 'payment_rails_launch'
  | 'compliance_legal'
  | 'proof_demo';

export interface BizRoom {
  id: string;
  name: string;
  template: RoomTemplate;
  status: 'active' | 'paused' | 'archived';
  memberCount: number;
  openItems: number;
  lastActivity: string;
  entityId: string;
  entityName: string;
  description: string;
  members: RoomMember[];
  artifacts: RoomArtifact[];
  decisions: RoomDecision[];
  receipts: BizReceipt[];
  timeline: RoomTimelineEvent[];
  visibility: 'internal' | 'board' | 'investor' | 'public';
  nextAction: string;
  checklist: { label: string; done: boolean }[];
  artifactCategories: string[];
}

export interface RoomMember {
  id: string;
  name: string;
  role: string;
  avatarInitials: string;
}

export interface RoomArtifact {
  id: string;
  name: string;
  type: string;
  uploadedBy: string;
  uploadDate: string;
}

export interface RoomDecision {
  id: string;
  title: string;
  status: 'draft' | 'open' | 'approved' | 'rejected';
  proposedBy: string;
  date: string;
  receiptId?: string;
}

export interface RoomTimelineEvent {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
}

export interface RoomTemplateInfo {
  id: RoomTemplate;
  name: string;
  description: string;
  icon: string;
  defaultMembers: number;
}

// =============================================================================
// ROOM TEMPLATES — 9 Canonical
// =============================================================================

export const ROOM_TEMPLATES: RoomTemplateInfo[] = [
  {
    id: 'executive_ops',
    name: 'Executive Ops',
    description: 'Strategic operations hub for leadership alignment, OKR tracking, and executive decision-making across the organization.',
    icon: 'crown.fill',
    defaultMembers: 5,
  },
  {
    id: 'fundraising',
    name: 'Fundraising',
    description: 'Centralized war room for capital raises — pitch materials, investor pipeline, term sheets, and closing coordination.',
    icon: 'chart.line.uptrend.xyaxis',
    defaultMembers: 4,
  },
  {
    id: 'board_governance',
    name: 'Board Governance',
    description: 'Formal governance workspace for board meetings, resolutions, minutes, committee coordination, and fiduciary oversight.',
    icon: 'building.columns.fill',
    defaultMembers: 6,
  },
  {
    id: 'partner',
    name: 'Partner',
    description: 'Collaboration space for strategic partners with shared documents, joint milestones, and communication threads.',
    icon: 'person.2.fill',
    defaultMembers: 4,
  },
  {
    id: 'acquisition_diligence',
    name: 'Acquisition / Diligence',
    description: 'Secure data room for M&A due diligence — financial models, legal review, integration planning, and deal execution.',
    icon: 'magnifyingglass.circle.fill',
    defaultMembers: 5,
  },
  {
    id: 'finance_close',
    name: 'Finance Close',
    description: 'Period-end financial close workspace — reconciliations, journal entries, controller sign-off, and audit prep.',
    icon: 'dollarsign.circle.fill',
    defaultMembers: 3,
  },
  {
    id: 'payment_rails_launch',
    name: 'Payment Rails Launch',
    description: 'Launch coordination for payment infrastructure — processor integration, compliance checks, go-live readiness.',
    icon: 'creditcard.fill',
    defaultMembers: 4,
  },
  {
    id: 'compliance_legal',
    name: 'Compliance / Legal',
    description: 'Regulatory and legal operations workspace — audit trails, policy drafts, incident response, and compliance tracking.',
    icon: 'shield.lefthalf.filled',
    defaultMembers: 3,
  },
  {
    id: 'proof_demo',
    name: 'Proof / Demo',
    description: 'Demo and proof-of-concept coordination — build schedules, rehearsal notes, presentation materials, and feedback loops.',
    icon: 'play.rectangle.fill',
    defaultMembers: 4,
  },
];

// =============================================================================
// TEMPLATE COLOR MAP
// =============================================================================

export const TEMPLATE_COLORS: Record<RoomTemplate, string> = {
  executive_ops: '#1D9BF0',
  fundraising: '#22C55E',
  board_governance: '#1D9BF0',
  partner: '#F59E0B',
  acquisition_diligence: '#EF4444',
  finance_close: '#1D9BF0',
  payment_rails_launch: '#1D9BF0',
  compliance_legal: '#1D9BF0',
  proof_demo: '#F59E0B',
};

export const TEMPLATE_LABELS: Record<RoomTemplate, string> = {
  executive_ops: 'Executive Ops',
  fundraising: 'Fundraising',
  board_governance: 'Board Governance',
  partner: 'Partner',
  acquisition_diligence: 'Acquisition / Diligence',
  finance_close: 'Finance Close',
  payment_rails_launch: 'Payment Rails Launch',
  compliance_legal: 'Compliance / Legal',
  proof_demo: 'Proof / Demo',
};

// =============================================================================
// ROOM STATUS COLORS
// =============================================================================

export const ROOM_STATUS_COLORS: Record<BizRoom['status'], string> = {
  active: '#22C55E',
  paused: '#F59E0B',
  archived: '#A1A1AA',
};

// =============================================================================
// SEEDED ROOMS
// =============================================================================

const SEEDED_ROOMS: BizRoom[] = [
  // ---- 1. Q1 2026 Executive Ops ----
  {
    id: 'room-exec-ops-q1',
    name: 'Q1 2026 Executive Ops',
    template: 'executive_ops',
    status: 'active',
    memberCount: 5,
    openItems: 8,
    lastActivity: '12m ago',
    entityId: KANEXT_HOLDCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    description: 'Quarterly executive operations cadence — OKR tracking, leadership sync, cross-functional escalations, and strategic initiative oversight for Q1 2026.',
    members: [
      { id: 'mem-eo-1', name: 'Alex Morgan', role: 'Founder / CEO', avatarInitials: 'SK' },
      { id: 'mem-eo-2', name: 'Jordan Ellis', role: 'COO', avatarInitials: 'JE' },
      { id: 'mem-eo-3', name: 'Priya Patel', role: 'CFO', avatarInitials: 'PP' },
      { id: 'mem-eo-4', name: 'Angela Morris', role: 'VP Engineering', avatarInitials: 'AM' },
      { id: 'mem-eo-5', name: 'David Okafor', role: 'VP Product', avatarInitials: 'DO' },
    ],
    artifacts: [
      { id: 'art-eo-1', name: 'Q1 2026 OKR Scorecard.xlsx', type: 'spreadsheet', uploadedBy: 'Jordan Ellis', uploadDate: 'Jan 8, 2026' },
      { id: 'art-eo-2', name: 'Leadership Sync Deck — Jan.pdf', type: 'presentation', uploadedBy: 'Alex Morgan', uploadDate: 'Jan 12, 2026' },
      { id: 'art-eo-3', name: 'Cross-Functional Escalation Log.docx', type: 'document', uploadedBy: 'Jordan Ellis', uploadDate: 'Jan 20, 2026' },
      { id: 'art-eo-4', name: 'Strategic Initiatives Tracker.xlsx', type: 'spreadsheet', uploadedBy: 'David Okafor', uploadDate: 'Feb 3, 2026' },
    ],
    decisions: [
      { id: 'dec-eo-1', title: 'Approve Q1 hiring plan (15 engineers)', status: 'approved', proposedBy: 'Angela Morris', date: 'Jan 10, 2026', receiptId: 'rcpt-eo-1' },
      { id: 'dec-eo-2', title: 'Reallocate $500K from Marketing to Product R&D', status: 'approved', proposedBy: 'Priya Patel', date: 'Jan 18, 2026', receiptId: 'rcpt-eo-2' },
      { id: 'dec-eo-3', title: 'Launch EMEA expansion initiative Q2', status: 'open', proposedBy: 'David Okafor', date: 'Feb 5, 2026' },
    ],
    receipts: [
      { id: 'rcpt-eo-1', type: 'approval', action: 'Q1 hiring plan approved — 15 engineering headcount authorized', actor: 'Alex Morgan', timestamp: 'Jan 10, 2026 10:32 AM', linkedEntity: KANEXT_HOLDCO, linkedTab: 'rooms' as BizOrgTab, linkedId: 'room-exec-ops-q1', immutable: true },
      { id: 'rcpt-eo-2', type: 'approval', action: 'Budget reallocation approved — $500K Marketing → Product R&D', actor: 'Alex Morgan', timestamp: 'Jan 18, 2026 3:15 PM', linkedEntity: KANEXT_HOLDCO, linkedTab: 'rooms' as BizOrgTab, linkedId: 'room-exec-ops-q1', immutable: true },
      { id: 'rcpt-eo-3', type: 'creation', action: 'Room created — Q1 2026 Executive Ops', actor: 'Alex Morgan', timestamp: 'Jan 2, 2026 9:00 AM', linkedEntity: KANEXT_HOLDCO, linkedTab: 'rooms' as BizOrgTab, linkedId: 'room-exec-ops-q1', immutable: true },
      { id: 'rcpt-eo-4', type: 'decision', action: 'EMEA expansion proposal submitted for review', actor: 'David Okafor', timestamp: 'Feb 5, 2026 11:00 AM', linkedEntity: KANEXT_HOLDCO, linkedTab: 'rooms' as BizOrgTab, linkedId: 'room-exec-ops-q1', immutable: true },
      { id: 'rcpt-eo-5', type: 'amendment', action: 'OKR Scorecard updated — mid-quarter revision', actor: 'Jordan Ellis', timestamp: 'Feb 10, 2026 2:00 PM', linkedEntity: KANEXT_HOLDCO, linkedTab: 'rooms' as BizOrgTab, linkedId: 'room-exec-ops-q1', immutable: true },
    ],
    timeline: [
      { id: 'tl-eo-1', action: 'Room created', actor: 'Alex Morgan', timestamp: 'Jan 2, 2026 9:00 AM' },
      { id: 'tl-eo-2', action: 'Uploaded Q1 2026 OKR Scorecard', actor: 'Jordan Ellis', timestamp: 'Jan 8, 2026 10:15 AM' },
      { id: 'tl-eo-3', action: 'Q1 hiring plan decision approved', actor: 'Alex Morgan', timestamp: 'Jan 10, 2026 10:32 AM' },
      { id: 'tl-eo-4', action: 'Uploaded Leadership Sync Deck — Jan', actor: 'Alex Morgan', timestamp: 'Jan 12, 2026 4:00 PM' },
      { id: 'tl-eo-5', action: 'Budget reallocation decision approved', actor: 'Alex Morgan', timestamp: 'Jan 18, 2026 3:15 PM' },
      { id: 'tl-eo-6', action: 'Uploaded Cross-Functional Escalation Log', actor: 'Jordan Ellis', timestamp: 'Jan 20, 2026 11:30 AM' },
      { id: 'tl-eo-7', action: 'EMEA expansion decision proposed', actor: 'David Okafor', timestamp: 'Feb 5, 2026 11:00 AM' },
      { id: 'tl-eo-8', action: 'OKR Scorecard mid-quarter revision', actor: 'Jordan Ellis', timestamp: 'Feb 10, 2026 2:00 PM' },
    ],
    visibility: 'internal',
    nextAction: 'Review EMEA expansion proposal and vote by Feb 20',
    checklist: [
      { label: 'Q1 OKR Scorecard finalized', done: true },
      { label: 'Hiring plan signed off', done: true },
      { label: 'Budget reallocation executed', done: true },
      { label: 'EMEA expansion decision', done: false },
      { label: 'Mid-quarter board update sent', done: false },
    ],
    artifactCategories: ['decks', 'models'],
  },

  // ---- 2. Series B Fundraising ----
  {
    id: 'room-fundraising-b',
    name: 'Series B Fundraising',
    template: 'fundraising',
    status: 'active',
    memberCount: 4,
    openItems: 12,
    lastActivity: '5m ago',
    entityId: KANEXT_HOLDCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    description: 'Series B capital raise coordination — investor outreach pipeline, pitch materials, data room preparation, term sheet negotiation, and closing logistics.',
    members: [
      { id: 'mem-fb-1', name: 'Alex Morgan', role: 'Founder / CEO', avatarInitials: 'SK' },
      { id: 'mem-fb-2', name: 'Priya Patel', role: 'CFO', avatarInitials: 'PP' },
      { id: 'mem-fb-3', name: 'Marcus Johnson', role: 'General Counsel', avatarInitials: 'MJ' },
      { id: 'mem-fb-4', name: 'Tanya Reeves', role: 'Head of IR', avatarInitials: 'TR' },
    ],
    artifacts: [
      { id: 'art-fb-1', name: 'Series B Pitch Deck v4.pdf', type: 'presentation', uploadedBy: 'Alex Morgan', uploadDate: 'Jan 15, 2026' },
      { id: 'art-fb-2', name: 'Financial Model — 5yr Forecast.xlsx', type: 'spreadsheet', uploadedBy: 'Priya Patel', uploadDate: 'Jan 22, 2026' },
      { id: 'art-fb-3', name: 'Cap Table — Current.xlsx', type: 'spreadsheet', uploadedBy: 'Priya Patel', uploadDate: 'Jan 28, 2026' },
    ],
    decisions: [
      { id: 'dec-fb-1', title: 'Set Series B target valuation at $250M pre-money', status: 'approved', proposedBy: 'Alex Morgan', date: 'Jan 20, 2026', receiptId: 'rcpt-fb-1' },
      { id: 'dec-fb-2', title: 'Engage Goodwin Procter as outside counsel', status: 'approved', proposedBy: 'Marcus Johnson', date: 'Jan 25, 2026', receiptId: 'rcpt-fb-2' },
      { id: 'dec-fb-3', title: 'Accept Sequoia lead term sheet', status: 'open', proposedBy: 'Alex Morgan', date: 'Feb 10, 2026' },
    ],
    receipts: [
      { id: 'rcpt-fb-1', type: 'approval', action: 'Series B target valuation set — $250M pre-money', actor: 'Alex Morgan', timestamp: 'Jan 20, 2026 2:00 PM', linkedEntity: KANEXT_HOLDCO, linkedTab: 'rooms' as BizOrgTab, linkedId: 'room-fundraising-b', immutable: true },
      { id: 'rcpt-fb-2', type: 'approval', action: 'Outside counsel engaged — Goodwin Procter', actor: 'Marcus Johnson', timestamp: 'Jan 25, 2026 4:30 PM', linkedEntity: KANEXT_HOLDCO, linkedTab: 'rooms' as BizOrgTab, linkedId: 'room-fundraising-b', immutable: true },
      { id: 'rcpt-fb-3', type: 'creation', action: 'Room created — Series B Fundraising', actor: 'Alex Morgan', timestamp: 'Jan 5, 2026 9:00 AM', linkedEntity: KANEXT_HOLDCO, linkedTab: 'rooms' as BizOrgTab, linkedId: 'room-fundraising-b', immutable: true },
    ],
    timeline: [
      { id: 'tl-fb-1', action: 'Room created', actor: 'Alex Morgan', timestamp: 'Jan 5, 2026 9:00 AM' },
      { id: 'tl-fb-2', action: 'Uploaded Series B Pitch Deck v4', actor: 'Alex Morgan', timestamp: 'Jan 15, 2026 11:00 AM' },
      { id: 'tl-fb-3', action: 'Valuation target decision approved', actor: 'Alex Morgan', timestamp: 'Jan 20, 2026 2:00 PM' },
      { id: 'tl-fb-4', action: 'Uploaded Financial Model — 5yr Forecast', actor: 'Priya Patel', timestamp: 'Jan 22, 2026 3:00 PM' },
      { id: 'tl-fb-5', action: 'Outside counsel decision approved', actor: 'Marcus Johnson', timestamp: 'Jan 25, 2026 4:30 PM' },
      { id: 'tl-fb-6', action: 'Uploaded Cap Table — Current', actor: 'Priya Patel', timestamp: 'Jan 28, 2026 10:00 AM' },
      { id: 'tl-fb-7', action: 'Sequoia term sheet received and submitted for decision', actor: 'Tanya Reeves', timestamp: 'Feb 10, 2026 9:30 AM' },
    ],
    visibility: 'investor',
    nextAction: 'Evaluate Sequoia lead term sheet and schedule partner meeting',
    checklist: [
      { label: 'Pitch deck finalized', done: true },
      { label: 'Financial model reviewed by CFO', done: true },
      { label: 'Cap table updated', done: true },
      { label: 'Term sheet comparison matrix', done: false },
      { label: 'Board approval for final terms', done: false },
      { label: 'Wire instructions & closing docs', done: false },
    ],
    artifactCategories: ['decks', 'models', 'contracts'],
  },

  // ---- 3. Board Governance ----
  {
    id: 'room-board-gov',
    name: 'Board Governance',
    template: 'board_governance',
    status: 'active',
    memberCount: 5,
    openItems: 4,
    lastActivity: '2h ago',
    entityId: KANEXT_HOLDCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    description: 'Formal board governance workspace — meeting agendas, resolutions, minutes, committee oversight, and fiduciary compliance.',
    members: [
      { id: 'mem-bg-1', name: 'Alex Morgan', role: 'Chairman / CEO', avatarInitials: 'SK' },
      { id: 'mem-bg-2', name: 'Dr. Lisa Chen', role: 'Independent Director', avatarInitials: 'LC' },
      { id: 'mem-bg-3', name: 'Robert Kim', role: 'Independent Director', avatarInitials: 'RK' },
      { id: 'mem-bg-4', name: 'Marcus Johnson', role: 'General Counsel / Secretary', avatarInitials: 'MJ' },
      { id: 'mem-bg-5', name: 'Priya Patel', role: 'CFO (Observer)', avatarInitials: 'PP' },
    ],
    artifacts: [
      { id: 'art-bg-1', name: 'Board Resolution — Q4 Financials.pdf', type: 'document', uploadedBy: 'Marcus Johnson', uploadDate: 'Jan 10, 2026' },
      { id: 'art-bg-2', name: 'Audit Committee Charter v3.pdf', type: 'document', uploadedBy: 'Robert Kim', uploadDate: 'Dec 20, 2025' },
      { id: 'art-bg-3', name: 'Q1 Board Meeting Agenda.pdf', type: 'document', uploadedBy: 'Alex Morgan', uploadDate: 'Feb 1, 2026' },
    ],
    decisions: [
      { id: 'dec-bg-1', title: 'Ratify Q4 2025 audited financial statements', status: 'approved', proposedBy: 'Priya Patel', date: 'Jan 10, 2026', receiptId: 'rcpt-bg-1' },
      { id: 'dec-bg-2', title: 'Approve revised Audit Committee charter', status: 'approved', proposedBy: 'Robert Kim', date: 'Dec 22, 2025', receiptId: 'rcpt-bg-2' },
      { id: 'dec-bg-3', title: 'Authorize Series B fundraising process', status: 'approved', proposedBy: 'Alex Morgan', date: 'Jan 5, 2026', receiptId: 'rcpt-bg-3' },
    ],
    receipts: [
      { id: 'rcpt-bg-1', type: 'approval', action: 'Q4 2025 financials ratified by board', actor: 'Board of Directors', timestamp: 'Jan 10, 2026 11:00 AM', linkedEntity: KANEXT_HOLDCO, linkedTab: 'rooms' as BizOrgTab, linkedId: 'room-board-gov', immutable: true },
      { id: 'rcpt-bg-2', type: 'approval', action: 'Revised Audit Committee charter approved', actor: 'Board of Directors', timestamp: 'Dec 22, 2025 3:00 PM', linkedEntity: KANEXT_HOLDCO, linkedTab: 'rooms' as BizOrgTab, linkedId: 'room-board-gov', immutable: true },
      { id: 'rcpt-bg-3', type: 'approval', action: 'Series B fundraising process authorized', actor: 'Board of Directors', timestamp: 'Jan 5, 2026 10:30 AM', linkedEntity: KANEXT_HOLDCO, linkedTab: 'rooms' as BizOrgTab, linkedId: 'room-board-gov', immutable: true },
      { id: 'rcpt-bg-4', type: 'creation', action: 'Room created — Board Governance', actor: 'Alex Morgan', timestamp: 'Sep 1, 2025 9:00 AM', linkedEntity: KANEXT_HOLDCO, linkedTab: 'rooms' as BizOrgTab, linkedId: 'room-board-gov', immutable: true },
    ],
    timeline: [
      { id: 'tl-bg-1', action: 'Room created', actor: 'Alex Morgan', timestamp: 'Sep 1, 2025 9:00 AM' },
      { id: 'tl-bg-2', action: 'Uploaded Audit Committee Charter v3', actor: 'Robert Kim', timestamp: 'Dec 20, 2025 2:00 PM' },
      { id: 'tl-bg-3', action: 'Audit Committee charter approved', actor: 'Board of Directors', timestamp: 'Dec 22, 2025 3:00 PM' },
      { id: 'tl-bg-4', action: 'Series B fundraising authorized', actor: 'Board of Directors', timestamp: 'Jan 5, 2026 10:30 AM' },
      { id: 'tl-bg-5', action: 'Q4 2025 financials ratified', actor: 'Board of Directors', timestamp: 'Jan 10, 2026 11:00 AM' },
      { id: 'tl-bg-6', action: 'Uploaded Q1 Board Meeting Agenda', actor: 'Alex Morgan', timestamp: 'Feb 1, 2026 4:00 PM' },
    ],
    visibility: 'board',
    nextAction: 'Distribute Q1 board pack and confirm attendance by Feb 25',
    checklist: [
      { label: 'Q4 financials ratified', done: true },
      { label: 'Audit Committee charter approved', done: true },
      { label: 'Series B authorization granted', done: true },
      { label: 'Q1 board meeting agenda sent', done: true },
      { label: 'Committee nominations finalized', done: false },
    ],
    artifactCategories: ['policies', 'contracts'],
  },

  // ---- 4. Target Bank Acquisition ----
  {
    id: 'room-target-bank',
    name: 'Target Bank Acquisition',
    template: 'acquisition_diligence',
    status: 'active',
    memberCount: 5,
    openItems: 14,
    lastActivity: '18m ago',
    entityId: 'ent-target-bank',
    entityName: 'Target Bank (Acquisition)',
    description: 'Acquisition due diligence for Target Bank — financial audit, regulatory review, tech stack assessment, integration planning, and deal execution.',
    members: [
      { id: 'mem-tb-1', name: 'Alex Morgan', role: 'CEO / Deal Lead', avatarInitials: 'SK' },
      { id: 'mem-tb-2', name: 'Priya Patel', role: 'CFO', avatarInitials: 'PP' },
      { id: 'mem-tb-3', name: 'Marcus Johnson', role: 'General Counsel', avatarInitials: 'MJ' },
      { id: 'mem-tb-4', name: 'Sarah Park', role: 'Outside Counsel', avatarInitials: 'SP' },
      { id: 'mem-tb-5', name: 'Angela Morris', role: 'VP Engineering (Tech DD)', avatarInitials: 'AM' },
    ],
    artifacts: [
      { id: 'art-tb-1', name: 'Target Bank — Financial Statements FY2025.pdf', type: 'document', uploadedBy: 'Priya Patel', uploadDate: 'Jan 20, 2026' },
      { id: 'art-tb-2', name: 'Due Diligence Checklist.xlsx', type: 'spreadsheet', uploadedBy: 'Marcus Johnson', uploadDate: 'Jan 22, 2026' },
      { id: 'art-tb-3', name: 'Tech Stack Assessment.pdf', type: 'document', uploadedBy: 'Angela Morris', uploadDate: 'Feb 1, 2026' },
      { id: 'art-tb-4', name: 'Integration Plan — Draft.docx', type: 'document', uploadedBy: 'Jordan Ellis', uploadDate: 'Feb 8, 2026' },
    ],
    decisions: [
      { id: 'dec-tb-1', title: 'Proceed to Phase 2 due diligence — full financial audit', status: 'approved', proposedBy: 'Alex Morgan', date: 'Jan 25, 2026', receiptId: 'rcpt-tb-1' },
      { id: 'dec-tb-2', title: 'Engage external auditor for bank charter review', status: 'approved', proposedBy: 'Marcus Johnson', date: 'Jan 30, 2026', receiptId: 'rcpt-tb-2' },
      { id: 'dec-tb-3', title: 'Final acquisition offer — $42M all-stock', status: 'draft', proposedBy: 'Alex Morgan', date: 'Feb 12, 2026' },
    ],
    receipts: [
      { id: 'rcpt-tb-1', type: 'approval', action: 'Phase 2 due diligence approved — full financial audit authorized', actor: 'Alex Morgan', timestamp: 'Jan 25, 2026 4:00 PM', linkedEntity: 'ent-target-bank', linkedTab: 'rooms' as BizOrgTab, linkedId: 'room-target-bank', immutable: true },
      { id: 'rcpt-tb-2', type: 'approval', action: 'External auditor engagement approved — bank charter review', actor: 'Alex Morgan', timestamp: 'Jan 30, 2026 2:30 PM', linkedEntity: 'ent-target-bank', linkedTab: 'rooms' as BizOrgTab, linkedId: 'room-target-bank', immutable: true },
      { id: 'rcpt-tb-3', type: 'creation', action: 'Room created — Target Bank Acquisition', actor: 'Alex Morgan', timestamp: 'Jan 15, 2026 9:00 AM', linkedEntity: 'ent-target-bank', linkedTab: 'rooms' as BizOrgTab, linkedId: 'room-target-bank', immutable: true },
      { id: 'rcpt-tb-4', type: 'compliance', action: 'NDA executed with Target Bank management', actor: 'Marcus Johnson', timestamp: 'Jan 18, 2026 3:00 PM', linkedEntity: 'ent-target-bank', linkedTab: 'rooms' as BizOrgTab, linkedId: 'room-target-bank', immutable: true },
    ],
    timeline: [
      { id: 'tl-tb-1', action: 'Room created', actor: 'Alex Morgan', timestamp: 'Jan 15, 2026 9:00 AM' },
      { id: 'tl-tb-2', action: 'NDA executed with Target Bank', actor: 'Marcus Johnson', timestamp: 'Jan 18, 2026 3:00 PM' },
      { id: 'tl-tb-3', action: 'Uploaded Target Bank Financial Statements', actor: 'Priya Patel', timestamp: 'Jan 20, 2026 10:00 AM' },
      { id: 'tl-tb-4', action: 'Uploaded Due Diligence Checklist', actor: 'Marcus Johnson', timestamp: 'Jan 22, 2026 2:00 PM' },
      { id: 'tl-tb-5', action: 'Phase 2 DD approved', actor: 'Alex Morgan', timestamp: 'Jan 25, 2026 4:00 PM' },
      { id: 'tl-tb-6', action: 'External auditor engagement approved', actor: 'Alex Morgan', timestamp: 'Jan 30, 2026 2:30 PM' },
      { id: 'tl-tb-7', action: 'Uploaded Tech Stack Assessment', actor: 'Angela Morris', timestamp: 'Feb 1, 2026 11:00 AM' },
      { id: 'tl-tb-8', action: 'Uploaded Integration Plan — Draft', actor: 'Jordan Ellis', timestamp: 'Feb 8, 2026 4:00 PM' },
    ],
    visibility: 'board',
    nextAction: 'Draft final acquisition offer and circulate to board for approval',
    checklist: [
      { label: 'NDA executed', done: true },
      { label: 'Phase 1 financial review', done: true },
      { label: 'Phase 2 full audit authorized', done: true },
      { label: 'Tech stack assessment complete', done: true },
      { label: 'Integration plan finalized', done: false },
      { label: 'Final offer submitted', done: false },
      { label: 'Regulatory approval obtained', done: false },
    ],
    artifactCategories: ['models', 'contracts', 'technical'],
  },

  // ---- 6. FY2025 Finance Close (archived) ----
  {
    id: 'room-fy25-close',
    name: 'FY2025 Finance Close',
    template: 'finance_close',
    status: 'archived',
    memberCount: 3,
    openItems: 0,
    lastActivity: '30d ago',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    description: 'Fiscal year 2025 close process — reconciliations, journal entries, controller sign-off, and external audit preparation. Completed and archived.',
    members: [
      { id: 'mem-fc-1', name: 'Priya Patel', role: 'CFO', avatarInitials: 'PP' },
      { id: 'mem-fc-2', name: 'Elena Vasquez', role: 'Controller', avatarInitials: 'EV' },
      { id: 'mem-fc-3', name: 'James Liu', role: 'Senior Accountant', avatarInitials: 'JL' },
    ],
    artifacts: [
      { id: 'art-fc-1', name: 'FY2025 Trial Balance.xlsx', type: 'spreadsheet', uploadedBy: 'James Liu', uploadDate: 'Jan 8, 2026' },
      { id: 'art-fc-2', name: 'Year-End Journal Entries.xlsx', type: 'spreadsheet', uploadedBy: 'Elena Vasquez', uploadDate: 'Jan 10, 2026' },
      { id: 'art-fc-3', name: 'Controller Sign-Off Memo.pdf', type: 'document', uploadedBy: 'Elena Vasquez', uploadDate: 'Jan 14, 2026' },
    ],
    decisions: [
      { id: 'dec-fc-1', title: 'Approve FY2025 final trial balance', status: 'approved', proposedBy: 'Elena Vasquez', date: 'Jan 12, 2026', receiptId: 'rcpt-fc-1' },
      { id: 'dec-fc-2', title: 'Release audited financials to board', status: 'approved', proposedBy: 'Priya Patel', date: 'Jan 15, 2026', receiptId: 'rcpt-fc-2' },
    ],
    receipts: [
      { id: 'rcpt-fc-1', type: 'approval', action: 'FY2025 trial balance approved', actor: 'Priya Patel', timestamp: 'Jan 12, 2026 5:00 PM', linkedEntity: KANEXT_OPSCO, linkedTab: 'rooms' as BizOrgTab, linkedId: 'room-fy25-close', immutable: true },
      { id: 'rcpt-fc-2', type: 'release', action: 'Audited financials released to board', actor: 'Priya Patel', timestamp: 'Jan 15, 2026 10:00 AM', linkedEntity: KANEXT_OPSCO, linkedTab: 'rooms' as BizOrgTab, linkedId: 'room-fy25-close', immutable: true },
      { id: 'rcpt-fc-3', type: 'creation', action: 'Room created — FY2025 Finance Close', actor: 'Priya Patel', timestamp: 'Dec 15, 2025 9:00 AM', linkedEntity: KANEXT_OPSCO, linkedTab: 'rooms' as BizOrgTab, linkedId: 'room-fy25-close', immutable: true },
    ],
    timeline: [
      { id: 'tl-fc-1', action: 'Room created', actor: 'Priya Patel', timestamp: 'Dec 15, 2025 9:00 AM' },
      { id: 'tl-fc-2', action: 'Uploaded FY2025 Trial Balance', actor: 'James Liu', timestamp: 'Jan 8, 2026 4:00 PM' },
      { id: 'tl-fc-3', action: 'Uploaded Year-End Journal Entries', actor: 'Elena Vasquez', timestamp: 'Jan 10, 2026 2:00 PM' },
      { id: 'tl-fc-4', action: 'Trial balance approved', actor: 'Priya Patel', timestamp: 'Jan 12, 2026 5:00 PM' },
      { id: 'tl-fc-5', action: 'Uploaded Controller Sign-Off Memo', actor: 'Elena Vasquez', timestamp: 'Jan 14, 2026 3:00 PM' },
      { id: 'tl-fc-6', action: 'Audited financials released to board', actor: 'Priya Patel', timestamp: 'Jan 15, 2026 10:00 AM' },
      { id: 'tl-fc-7', action: 'Room archived — FY2025 close complete', actor: 'Priya Patel', timestamp: 'Jan 18, 2026 9:00 AM' },
    ],
    visibility: 'internal',
    nextAction: 'Archived — no further actions required',
    checklist: [
      { label: 'Trial balance reconciled', done: true },
      { label: 'Year-end journal entries posted', done: true },
      { label: 'Controller sign-off obtained', done: true },
      { label: 'Audited financials released to board', done: true },
    ],
    artifactCategories: ['models'],
  },

  // ---- 7. Payment Rails v2 Launch ----
  {
    id: 'room-payment-rails-v2',
    name: 'Payment Rails v2 Launch',
    template: 'payment_rails_launch',
    status: 'active',
    memberCount: 4,
    openItems: 9,
    lastActivity: '30m ago',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    description: 'Payment infrastructure v2 launch coordination — processor integration, ledger migration, compliance certification, and go-live readiness checklist.',
    members: [
      { id: 'mem-pr-1', name: 'Angela Morris', role: 'VP Engineering', avatarInitials: 'AM' },
      { id: 'mem-pr-2', name: 'Jordan Ellis', role: 'COO', avatarInitials: 'JE' },
      { id: 'mem-pr-3', name: 'Derek Chen', role: 'Payments Lead', avatarInitials: 'DC' },
      { id: 'mem-pr-4', name: 'Nina Brooks', role: 'QA Lead', avatarInitials: 'NB' },
    ],
    artifacts: [
      { id: 'art-pr-1', name: 'Payment Rails v2 Architecture.pdf', type: 'document', uploadedBy: 'Derek Chen', uploadDate: 'Jan 15, 2026' },
      { id: 'art-pr-2', name: 'Processor Integration Test Results.xlsx', type: 'spreadsheet', uploadedBy: 'Nina Brooks', uploadDate: 'Feb 1, 2026' },
      { id: 'art-pr-3', name: 'Go-Live Readiness Checklist.docx', type: 'document', uploadedBy: 'Jordan Ellis', uploadDate: 'Feb 5, 2026' },
    ],
    decisions: [
      { id: 'dec-pr-1', title: 'Select Stripe as primary processor for v2', status: 'approved', proposedBy: 'Derek Chen', date: 'Jan 20, 2026', receiptId: 'rcpt-pr-1' },
      { id: 'dec-pr-2', title: 'Approve ledger migration from v1 to v2 schema', status: 'approved', proposedBy: 'Angela Morris', date: 'Jan 28, 2026', receiptId: 'rcpt-pr-2' },
      { id: 'dec-pr-3', title: 'Schedule go-live date — March 1, 2026', status: 'open', proposedBy: 'Jordan Ellis', date: 'Feb 5, 2026' },
    ],
    receipts: [
      { id: 'rcpt-pr-1', type: 'approval', action: 'Stripe selected as primary processor for Payment Rails v2', actor: 'Angela Morris', timestamp: 'Jan 20, 2026 3:00 PM', linkedEntity: KANEXT_OPSCO, linkedTab: 'rooms' as BizOrgTab, linkedId: 'room-payment-rails-v2', immutable: true },
      { id: 'rcpt-pr-2', type: 'approval', action: 'Ledger migration from v1 to v2 schema approved', actor: 'Angela Morris', timestamp: 'Jan 28, 2026 4:00 PM', linkedEntity: KANEXT_OPSCO, linkedTab: 'rooms' as BizOrgTab, linkedId: 'room-payment-rails-v2', immutable: true },
      { id: 'rcpt-pr-3', type: 'creation', action: 'Room created — Payment Rails v2 Launch', actor: 'Angela Morris', timestamp: 'Jan 5, 2026 9:00 AM', linkedEntity: KANEXT_OPSCO, linkedTab: 'rooms' as BizOrgTab, linkedId: 'room-payment-rails-v2', immutable: true },
      { id: 'rcpt-pr-4', type: 'compliance', action: 'PCI DSS compliance audit passed for v2 stack', actor: 'Derek Chen', timestamp: 'Feb 3, 2026 11:00 AM', linkedEntity: KANEXT_OPSCO, linkedTab: 'rooms' as BizOrgTab, linkedId: 'room-payment-rails-v2', immutable: true },
    ],
    timeline: [
      { id: 'tl-pr-1', action: 'Room created', actor: 'Angela Morris', timestamp: 'Jan 5, 2026 9:00 AM' },
      { id: 'tl-pr-2', action: 'Uploaded Payment Rails v2 Architecture', actor: 'Derek Chen', timestamp: 'Jan 15, 2026 2:00 PM' },
      { id: 'tl-pr-3', action: 'Stripe selected as primary processor', actor: 'Angela Morris', timestamp: 'Jan 20, 2026 3:00 PM' },
      { id: 'tl-pr-4', action: 'Ledger migration approved', actor: 'Angela Morris', timestamp: 'Jan 28, 2026 4:00 PM' },
      { id: 'tl-pr-5', action: 'Uploaded Processor Integration Test Results', actor: 'Nina Brooks', timestamp: 'Feb 1, 2026 5:00 PM' },
      { id: 'tl-pr-6', action: 'PCI DSS compliance audit passed', actor: 'Derek Chen', timestamp: 'Feb 3, 2026 11:00 AM' },
      { id: 'tl-pr-7', action: 'Uploaded Go-Live Readiness Checklist', actor: 'Jordan Ellis', timestamp: 'Feb 5, 2026 10:00 AM' },
    ],
    visibility: 'internal',
    nextAction: 'Confirm March 1 go-live date with engineering and compliance sign-off',
    checklist: [
      { label: 'Stripe processor integration complete', done: true },
      { label: 'Ledger migration schema approved', done: true },
      { label: 'PCI DSS compliance audit passed', done: true },
      { label: 'Processor test results validated', done: true },
      { label: 'Go-live readiness checklist complete', done: false },
      { label: 'Production cutover executed', done: false },
    ],
    artifactCategories: ['technical', 'policies'],
  },

  // ---- 8. SOC 2 Compliance ----
  {
    id: 'room-soc2-compliance',
    name: 'SOC 2 Compliance',
    template: 'compliance_legal',
    status: 'active',
    memberCount: 3,
    openItems: 7,
    lastActivity: '1h ago',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    description: 'SOC 2 Type II certification workspace — controls mapping, evidence collection, auditor coordination, and remediation tracking.',
    members: [
      { id: 'mem-sc-1', name: 'Marcus Johnson', role: 'General Counsel', avatarInitials: 'MJ' },
      { id: 'mem-sc-2', name: 'Angela Morris', role: 'VP Engineering', avatarInitials: 'AM' },
      { id: 'mem-sc-3', name: 'Raj Gupta', role: 'Compliance Manager', avatarInitials: 'RG' },
    ],
    artifacts: [
      { id: 'art-sc-1', name: 'SOC 2 Controls Matrix.xlsx', type: 'spreadsheet', uploadedBy: 'Raj Gupta', uploadDate: 'Dec 10, 2025' },
      { id: 'art-sc-2', name: 'Evidence Collection Tracker.xlsx', type: 'spreadsheet', uploadedBy: 'Raj Gupta', uploadDate: 'Jan 15, 2026' },
      { id: 'art-sc-3', name: 'Auditor Engagement Letter — Deloitte.pdf', type: 'document', uploadedBy: 'Marcus Johnson', uploadDate: 'Jan 5, 2026' },
    ],
    decisions: [
      { id: 'dec-sc-1', title: 'Engage Deloitte for SOC 2 Type II audit', status: 'approved', proposedBy: 'Marcus Johnson', date: 'Jan 5, 2026', receiptId: 'rcpt-sc-1' },
      { id: 'dec-sc-2', title: 'Accept remediation timeline — 45 days for 3 findings', status: 'open', proposedBy: 'Raj Gupta', date: 'Feb 1, 2026' },
    ],
    receipts: [
      { id: 'rcpt-sc-1', type: 'approval', action: 'Deloitte engaged for SOC 2 Type II audit', actor: 'Alex Morgan', timestamp: 'Jan 5, 2026 4:00 PM', linkedEntity: KANEXT_OPSCO, linkedTab: 'rooms' as BizOrgTab, linkedId: 'room-soc2-compliance', immutable: true },
      { id: 'rcpt-sc-2', type: 'creation', action: 'Room created — SOC 2 Compliance', actor: 'Marcus Johnson', timestamp: 'Dec 1, 2025 9:00 AM', linkedEntity: KANEXT_OPSCO, linkedTab: 'rooms' as BizOrgTab, linkedId: 'room-soc2-compliance', immutable: true },
      { id: 'rcpt-sc-3', type: 'compliance', action: '22 of 25 controls validated — 3 findings require remediation', actor: 'Raj Gupta', timestamp: 'Feb 1, 2026 2:00 PM', linkedEntity: KANEXT_OPSCO, linkedTab: 'rooms' as BizOrgTab, linkedId: 'room-soc2-compliance', immutable: true },
    ],
    timeline: [
      { id: 'tl-sc-1', action: 'Room created', actor: 'Marcus Johnson', timestamp: 'Dec 1, 2025 9:00 AM' },
      { id: 'tl-sc-2', action: 'Uploaded SOC 2 Controls Matrix', actor: 'Raj Gupta', timestamp: 'Dec 10, 2025 3:00 PM' },
      { id: 'tl-sc-3', action: 'Deloitte engagement approved', actor: 'Alex Morgan', timestamp: 'Jan 5, 2026 4:00 PM' },
      { id: 'tl-sc-4', action: 'Uploaded Auditor Engagement Letter', actor: 'Marcus Johnson', timestamp: 'Jan 5, 2026 5:00 PM' },
      { id: 'tl-sc-5', action: 'Uploaded Evidence Collection Tracker', actor: 'Raj Gupta', timestamp: 'Jan 15, 2026 11:00 AM' },
      { id: 'tl-sc-6', action: '22/25 controls validated — 3 findings identified', actor: 'Raj Gupta', timestamp: 'Feb 1, 2026 2:00 PM' },
    ],
    visibility: 'internal',
    nextAction: 'Complete remediation of 3 audit findings within 45-day window',
    checklist: [
      { label: 'Deloitte engagement signed', done: true },
      { label: 'Controls matrix mapped (25 controls)', done: true },
      { label: 'Evidence collection tracker built', done: true },
      { label: '22/25 controls validated', done: true },
      { label: 'Finding #1 remediated', done: false },
      { label: 'Finding #2 remediated', done: false },
      { label: 'Finding #3 remediated', done: false },
      { label: 'Final audit report received', done: false },
    ],
    artifactCategories: ['policies', 'proof'],
  },

  // ---- 9. Product Demo — Investor Day (archived) ----
  {
    id: 'room-investor-day-demo',
    name: 'Product Demo — Investor Day',
    template: 'proof_demo',
    status: 'archived',
    memberCount: 4,
    openItems: 0,
    lastActivity: '45d ago',
    entityId: KANEXT_HOLDCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    description: 'Investor Day product demo preparation — build schedule, rehearsal coordination, live demo environment, presentation materials, and post-event debrief.',
    members: [
      { id: 'mem-pd-1', name: 'Alex Morgan', role: 'CEO / Presenter', avatarInitials: 'SK' },
      { id: 'mem-pd-2', name: 'David Okafor', role: 'VP Product', avatarInitials: 'DO' },
      { id: 'mem-pd-3', name: 'Angela Morris', role: 'VP Engineering', avatarInitials: 'AM' },
      { id: 'mem-pd-4', name: 'Tanya Reeves', role: 'Head of IR', avatarInitials: 'TR' },
    ],
    artifacts: [
      { id: 'art-pd-1', name: 'Investor Day Presentation.pdf', type: 'presentation', uploadedBy: 'Alex Morgan', uploadDate: 'Dec 5, 2025' },
      { id: 'art-pd-2', name: 'Demo Script — Final.docx', type: 'document', uploadedBy: 'David Okafor', uploadDate: 'Dec 8, 2025' },
      { id: 'art-pd-3', name: 'Rehearsal Video — Run 3.mp4', type: 'video', uploadedBy: 'Tanya Reeves', uploadDate: 'Dec 10, 2025' },
      { id: 'art-pd-4', name: 'Post-Event Feedback Summary.pdf', type: 'document', uploadedBy: 'Tanya Reeves', uploadDate: 'Dec 18, 2025' },
    ],
    decisions: [
      { id: 'dec-pd-1', title: 'Approve final demo script and flow', status: 'approved', proposedBy: 'David Okafor', date: 'Dec 9, 2025', receiptId: 'rcpt-pd-1' },
      { id: 'dec-pd-2', title: 'Use live production data (sanitized) for demo', status: 'approved', proposedBy: 'Angela Morris', date: 'Dec 10, 2025', receiptId: 'rcpt-pd-2' },
    ],
    receipts: [
      { id: 'rcpt-pd-1', type: 'approval', action: 'Final demo script approved', actor: 'Alex Morgan', timestamp: 'Dec 9, 2025 6:00 PM', linkedEntity: KANEXT_HOLDCO, linkedTab: 'rooms' as BizOrgTab, linkedId: 'room-investor-day-demo', immutable: true },
      { id: 'rcpt-pd-2', type: 'approval', action: 'Live production data (sanitized) approved for demo', actor: 'Alex Morgan', timestamp: 'Dec 10, 2025 9:00 AM', linkedEntity: KANEXT_HOLDCO, linkedTab: 'rooms' as BizOrgTab, linkedId: 'room-investor-day-demo', immutable: true },
      { id: 'rcpt-pd-3', type: 'creation', action: 'Room created — Product Demo — Investor Day', actor: 'Alex Morgan', timestamp: 'Nov 20, 2025 9:00 AM', linkedEntity: KANEXT_HOLDCO, linkedTab: 'rooms' as BizOrgTab, linkedId: 'room-investor-day-demo', immutable: true },
    ],
    timeline: [
      { id: 'tl-pd-1', action: 'Room created', actor: 'Alex Morgan', timestamp: 'Nov 20, 2025 9:00 AM' },
      { id: 'tl-pd-2', action: 'Uploaded Investor Day Presentation', actor: 'Alex Morgan', timestamp: 'Dec 5, 2025 4:00 PM' },
      { id: 'tl-pd-3', action: 'Uploaded Demo Script — Final', actor: 'David Okafor', timestamp: 'Dec 8, 2025 2:00 PM' },
      { id: 'tl-pd-4', action: 'Demo script approved', actor: 'Alex Morgan', timestamp: 'Dec 9, 2025 6:00 PM' },
      { id: 'tl-pd-5', action: 'Live data for demo approved', actor: 'Alex Morgan', timestamp: 'Dec 10, 2025 9:00 AM' },
      { id: 'tl-pd-6', action: 'Uploaded Rehearsal Video — Run 3', actor: 'Tanya Reeves', timestamp: 'Dec 10, 2025 5:00 PM' },
      { id: 'tl-pd-7', action: 'Investor Day event completed successfully', actor: 'Alex Morgan', timestamp: 'Dec 15, 2025 6:00 PM' },
      { id: 'tl-pd-8', action: 'Uploaded Post-Event Feedback Summary', actor: 'Tanya Reeves', timestamp: 'Dec 18, 2025 11:00 AM' },
    ],
    visibility: 'investor',
    nextAction: 'Archived — no further actions required',
    checklist: [
      { label: 'Presentation deck finalized', done: true },
      { label: 'Demo script approved', done: true },
      { label: 'Live data environment sanitized', done: true },
      { label: 'Rehearsal runs completed', done: true },
      { label: 'Investor Day event executed', done: true },
      { label: 'Post-event feedback collected', done: true },
    ],
    artifactCategories: ['decks', 'proof'],
  },
];

// =============================================================================
// DATA ACCESS
// =============================================================================

export function getBizRoomsData(): BizRoom[] {
  return SEEDED_ROOMS;
}

export function getRoomById(id: string): BizRoom | undefined {
  return SEEDED_ROOMS.find((r) => r.id === id);
}

export function getActiveRooms(): BizRoom[] {
  return SEEDED_ROOMS.filter((r) => r.status === 'active');
}

export function getArchivedRooms(): BizRoom[] {
  return SEEDED_ROOMS.filter((r) => r.status === 'archived');
}

export function getRoomTemplateById(templateId: RoomTemplate): RoomTemplateInfo | undefined {
  return ROOM_TEMPLATES.find((t) => t.id === templateId);
}
