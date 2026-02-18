/**
 * Church Organization Resources v2 — Mock Data & Types
 * Resource library, packs, policies, training, forms, media assets,
 * publishing queue, version history, and resource requests.
 */

// =============================================================================
// TYPES
// =============================================================================

export type ResourceType =
  | 'doc'
  | 'pdf'
  | 'link'
  | 'slide_deck'
  | 'checklist'
  | 'form'
  | 'video'
  | 'audio'
  | 'image';

export type ResourceStatus = 'draft' | 'in_review' | 'published' | 'archived';

export type ResourceVisibility =
  | 'public'
  | 'org'
  | 'ministry'
  | 'role_specific'
  | 'restricted';

export type ResourceAudience =
  | 'volunteer'
  | 'leader'
  | 'staff'
  | 'exec'
  | 'all';

export type MinistryTag =
  | 'worship'
  | 'kids'
  | 'youth'
  | 'outreach'
  | 'admin'
  | 'facilities'
  | 'prayer'
  | 'discipleship'
  | 'general';

export type TrainingStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'expired';

export type PackStatus = 'published' | 'needs_review' | 'draft';

export type RequestStatus =
  | 'new'
  | 'under_review'
  | 'in_progress'
  | 'delivered'
  | 'closed';

export type RequestPriority = 'low' | 'normal' | 'high' | 'urgent';

// =============================================================================
// INTERFACES
// =============================================================================

export interface ChurchResource {
  id: string;
  title: string;
  type: ResourceType;
  owner: string;
  tags: MinistryTag[];
  visibility: ResourceVisibility;
  audience: ResourceAudience;
  status: ResourceStatus;
  version: number;
  lastUpdated: string;
  description: string;
  fileSize?: string;
  duration?: string;
}

export interface ResourcePack {
  id: string;
  name: string;
  owner: string;
  ministry: MinistryTag;
  intendedRoles: string[];
  status: PackStatus;
  resourceCount: number;
  lastUsedDate?: string;
  description: string;
  includedResourceIds: string[];
}

export interface PolicyPlaybook {
  id: string;
  title: string;
  section:
    | 'governance'
    | 'safeguarding'
    | 'facilities'
    | 'finance'
    | 'communications'
    | 'volunteer'
    | 'data_privacy'
    | 'incident_response';
  owner: string;
  version: number;
  status: ResourceStatus;
  effectiveDate: string;
  acknowledgmentRequired: boolean;
  acknowledgedCount: number;
  totalRequired: number;
}

export interface TrainingModule {
  id: string;
  title: string;
  requiredRoles: string[];
  estimatedTime: string;
  completionCount: number;
  totalAssigned: number;
  renewalCadence?: string;
  status: ResourceStatus;
  description: string;
}

export interface FormTemplate {
  id: string;
  title: string;
  purpose: string;
  owner: string;
  routingRule: string;
  visibility: ResourceVisibility;
  requiredAttachments: boolean;
  status: 'draft' | 'published';
}

export interface MediaAsset {
  id: string;
  title: string;
  type:
    | 'logo'
    | 'slide_template'
    | 'lyric_template'
    | 'photo_guideline'
    | 'announcement_graphic'
    | 'audio_reference';
  owner: string;
  status: ResourceStatus;
  lastUpdated: string;
  description: string;
}

export interface PublishingQueueItem {
  id: string;
  resourceId: string;
  resourceTitle: string;
  type: string;
  submittedBy: string;
  submittedDate: string;
  requiredApprover: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface VersionHistoryEntry {
  id: string;
  resourceId: string;
  resourceTitle: string;
  action:
    | 'published'
    | 'version_bump'
    | 'visibility_changed'
    | 'acknowledged';
  performedBy: string;
  timestamp: string;
  details: string;
}

export interface ResourceRequest {
  id: string;
  title: string;
  type: 'new_template' | 'update_policy' | 'new_kit' | 'add_training';
  requestedBy: string;
  ministry: MinistryTag;
  priority: RequestPriority;
  ownerAssigned?: string;
  status: RequestStatus;
  description: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  doc: 'Document',
  pdf: 'PDF',
  link: 'Link',
  slide_deck: 'Slide Deck',
  checklist: 'Checklist',
  form: 'Form',
  video: 'Video',
  audio: 'Audio',
  image: 'Image',
};

export const RESOURCE_TYPE_ICONS: Record<ResourceType, string> = {
  doc: 'doc.text.fill',
  pdf: 'doc.richtext.fill',
  link: 'link',
  slide_deck: 'rectangle.on.rectangle.angled',
  checklist: 'checklist',
  form: 'doc.plaintext.fill',
  video: 'play.rectangle.fill',
  audio: 'waveform',
  image: 'photo.fill',
};

export const RESOURCE_STATUS_LABELS: Record<ResourceStatus, string> = {
  draft: 'Draft',
  in_review: 'In Review',
  published: 'Published',
  archived: 'Archived',
};

export const RESOURCE_STATUS_COLORS: Record<ResourceStatus, string> = {
  draft: '#8F8F8F',
  in_review: '#F59E0B',
  published: '#22C55E',
  archived: '#6B7280',
};

export const VISIBILITY_LABELS: Record<ResourceVisibility, string> = {
  public: 'Public',
  org: 'Organization',
  ministry: 'Ministry Only',
  role_specific: 'Role-Specific',
  restricted: 'Restricted',
};

export const AUDIENCE_LABELS: Record<ResourceAudience, string> = {
  volunteer: 'Volunteer',
  leader: 'Leader',
  staff: 'Staff',
  exec: 'Executive',
  all: 'All',
};

export const MINISTRY_TAG_LABELS: Record<MinistryTag, string> = {
  worship: 'Worship',
  kids: 'Kids',
  youth: 'Youth',
  outreach: 'Outreach',
  admin: 'Admin',
  facilities: 'Facilities',
  prayer: 'Prayer',
  discipleship: 'Discipleship',
  general: 'General',
};

export const MINISTRY_TAG_COLORS: Record<MinistryTag, string> = {
  worship: '#8B5CF6',
  kids: '#F59E0B',
  youth: '#EF4444',
  outreach: '#22C55E',
  admin: '#6AA9FF',
  facilities: '#8F8F8F',
  prayer: '#EC4899',
  discipleship: '#10B981',
  general: '#6B7280',
};

export const TRAINING_STATUS_LABELS: Record<TrainingStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  expired: 'Expired',
};

export const TRAINING_STATUS_COLORS: Record<TrainingStatus, string> = {
  not_started: '#8F8F8F',
  in_progress: '#6AA9FF',
  completed: '#22C55E',
  expired: '#EF4444',
};

export const PACK_STATUS_LABELS: Record<PackStatus, string> = {
  published: 'Published',
  needs_review: 'Needs Review',
  draft: 'Draft',
};

export const PACK_STATUS_COLORS: Record<PackStatus, string> = {
  published: '#22C55E',
  needs_review: '#F59E0B',
  draft: '#8F8F8F',
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  new: 'New',
  under_review: 'Under Review',
  in_progress: 'In Progress',
  delivered: 'Delivered',
  closed: 'Closed',
};

export const REQUEST_STATUS_COLORS: Record<RequestStatus, string> = {
  new: '#6AA9FF',
  under_review: '#F59E0B',
  in_progress: '#8B5CF6',
  delivered: '#22C55E',
  closed: '#6B7280',
};

export const REQUEST_PRIORITY_COLORS: Record<RequestPriority, string> = {
  low: '#22C55E',
  normal: '#6AA9FF',
  high: '#F59E0B',
  urgent: '#EF4444',
};

// =============================================================================
// SEEDED RESOURCES
// =============================================================================

const RESOURCES: ChurchResource[] = [
  {
    id: 'res-001',
    title: 'Volunteer Handbook',
    type: 'pdf',
    owner: 'Pastor Michael',
    tags: ['general'],
    visibility: 'org',
    audience: 'volunteer',
    status: 'published',
    version: 3,
    lastUpdated: '2026-01-20',
    description: 'Comprehensive guide for all church volunteers covering expectations, dress code, scheduling, and conflict resolution.',
    fileSize: '2.4 MB',
  },
  {
    id: 'res-002',
    title: 'Kids Check-In SOP',
    type: 'doc',
    owner: "Children's Pastor",
    tags: ['kids'],
    visibility: 'ministry',
    audience: 'volunteer',
    status: 'published',
    version: 2,
    lastUpdated: '2026-02-05',
    description: 'Step-by-step standard operating procedure for the kids check-in and check-out process on Sunday mornings.',
  },
  {
    id: 'res-003',
    title: 'Worship Planning Guide',
    type: 'doc',
    owner: 'Worship Director',
    tags: ['worship'],
    visibility: 'ministry',
    audience: 'leader',
    status: 'published',
    version: 4,
    lastUpdated: '2026-01-28',
    description: 'Guide for planning weekly worship sets including song selection, rehearsal timelines, and tech requirements.',
  },
  {
    id: 'res-004',
    title: 'Outreach Event Playbook',
    type: 'doc',
    owner: 'Outreach Director',
    tags: ['outreach'],
    visibility: 'org',
    audience: 'leader',
    status: 'published',
    version: 2,
    lastUpdated: '2026-01-15',
    description: 'End-to-end playbook for planning and executing community outreach events, including logistics, volunteer coordination, and follow-up.',
  },
  {
    id: 'res-005',
    title: 'Sunday Service Run Sheet',
    type: 'checklist',
    owner: 'Worship Director',
    tags: ['worship', 'admin'],
    visibility: 'role_specific',
    audience: 'staff',
    status: 'published',
    version: 6,
    lastUpdated: '2026-02-16',
    description: 'Weekly checklist for Sunday service execution covering pre-service setup, transitions, and post-service teardown.',
  },
  {
    id: 'res-006',
    title: 'Facilities Request Guide',
    type: 'doc',
    owner: 'Facilities Manager',
    tags: ['facilities'],
    visibility: 'org',
    audience: 'all',
    status: 'published',
    version: 1,
    lastUpdated: '2026-01-10',
    description: 'How to submit facility booking requests, maintenance tickets, and equipment checkout forms.',
  },
  {
    id: 'res-007',
    title: 'Prayer Ministry Guidelines',
    type: 'doc',
    owner: 'Prayer Team Lead',
    tags: ['prayer'],
    visibility: 'ministry',
    audience: 'volunteer',
    status: 'published',
    version: 2,
    lastUpdated: '2026-02-01',
    description: 'Guidelines for prayer team members including confidentiality protocols, prayer request handling, and follow-up procedures.',
  },
  {
    id: 'res-008',
    title: 'Safety & Incident Response Guide',
    type: 'pdf',
    owner: 'Executive Pastor',
    tags: ['admin', 'facilities'],
    visibility: 'role_specific',
    audience: 'staff',
    status: 'published',
    version: 3,
    lastUpdated: '2026-02-10',
    description: 'Emergency procedures, evacuation routes, medical response protocols, and incident documentation requirements.',
    fileSize: '3.1 MB',
  },
  {
    id: 'res-009',
    title: 'New Visitor Welcome Guide',
    type: 'doc',
    owner: 'Hospitality Lead',
    tags: ['outreach', 'general'],
    visibility: 'public',
    audience: 'all',
    status: 'published',
    version: 2,
    lastUpdated: '2026-01-22',
    description: 'Visitor-facing guide covering service times, campus map, ministries overview, and how to get connected.',
  },
  {
    id: 'res-010',
    title: 'Financial Stewardship FAQ',
    type: 'doc',
    owner: 'Finance Director',
    tags: ['admin'],
    visibility: 'org',
    audience: 'all',
    status: 'published',
    version: 1,
    lastUpdated: '2026-01-08',
    description: 'Answers to common questions about tithes, offerings, online giving, tax receipts, and designated funds.',
  },
  {
    id: 'res-011',
    title: 'Media Consent Form',
    type: 'form',
    owner: 'Communications Director',
    tags: ['admin'],
    visibility: 'org',
    audience: 'all',
    status: 'published',
    version: 1,
    lastUpdated: '2026-01-12',
    description: 'Photo and video consent form for use in church publications, social media, and promotional materials.',
  },
  {
    id: 'res-012',
    title: 'Youth Trip Permission Slip',
    type: 'form',
    owner: 'Youth Pastor Davis',
    tags: ['youth'],
    visibility: 'ministry',
    audience: 'volunteer',
    status: 'in_review',
    version: 2,
    lastUpdated: '2026-02-14',
    description: 'Parent/guardian permission slip for youth off-site trips including medical information and emergency contacts.',
  },
  {
    id: 'res-013',
    title: 'Sermon Slide Template',
    type: 'slide_deck',
    owner: 'Communications Director',
    tags: ['worship', 'admin'],
    visibility: 'role_specific',
    audience: 'staff',
    status: 'published',
    version: 5,
    lastUpdated: '2026-02-08',
    description: 'Branded slide template for weekly sermon presentations with title, scripture, bullet, and media layouts.',
  },
  {
    id: 'res-014',
    title: 'Worship Team Rehearsal Audio',
    type: 'audio',
    owner: 'Worship Director',
    tags: ['worship'],
    visibility: 'ministry',
    audience: 'volunteer',
    status: 'published',
    version: 1,
    lastUpdated: '2026-02-15',
    description: 'Reference audio tracks for the worship team to practice with ahead of Sunday rehearsal.',
    duration: '42 min',
  },
  {
    id: 'res-015',
    title: 'Church Brand Guidelines',
    type: 'pdf',
    owner: 'Communications Director',
    tags: ['admin'],
    visibility: 'org',
    audience: 'staff',
    status: 'published',
    version: 2,
    lastUpdated: '2026-01-30',
    description: 'Official brand guidelines covering logo usage, color palette, typography, tone of voice, and social media standards.',
    fileSize: '5.8 MB',
  },
];

// =============================================================================
// RESOURCE PACKS
// =============================================================================

const PACKS: ResourcePack[] = [
  {
    id: 'pack-001',
    name: 'New Volunteer Onboarding',
    owner: 'Pastor Michael',
    ministry: 'general',
    intendedRoles: ['Volunteer'],
    status: 'published',
    resourceCount: 3,
    lastUsedDate: '2026-02-12',
    description: 'Everything a new volunteer needs on day one: handbook, orientation info, and consent forms.',
    includedResourceIds: ['res-001', 'res-011', 'res-006'],
  },
  {
    id: 'pack-002',
    name: 'Kids Ministry Sunday Kit',
    owner: "Children's Pastor",
    ministry: 'kids',
    intendedRoles: ['Kids Volunteer', 'Kids Lead'],
    status: 'published',
    resourceCount: 2,
    lastUsedDate: '2026-02-16',
    description: 'Sunday morning essentials for kids ministry volunteers including check-in SOP and safety procedures.',
    includedResourceIds: ['res-002', 'res-008'],
  },
  {
    id: 'pack-003',
    name: 'Youth Night Pack',
    owner: 'Youth Pastor Davis',
    ministry: 'youth',
    intendedRoles: ['Youth Volunteer', 'Youth Lead'],
    status: 'published',
    resourceCount: 2,
    lastUsedDate: '2026-02-14',
    description: 'Resources for youth night volunteers including permission slips and safety protocols.',
    includedResourceIds: ['res-012', 'res-008'],
  },
  {
    id: 'pack-004',
    name: 'Worship Team Pack',
    owner: 'Worship Director',
    ministry: 'worship',
    intendedRoles: ['Worship Volunteer', 'Worship Lead'],
    status: 'published',
    resourceCount: 4,
    lastUsedDate: '2026-02-16',
    description: 'Full set of resources for worship team members: planning guide, run sheet, slide template, and rehearsal audio.',
    includedResourceIds: ['res-003', 'res-005', 'res-013', 'res-014'],
  },
  {
    id: 'pack-005',
    name: 'Outreach/Event Setup',
    owner: 'Outreach Director',
    ministry: 'outreach',
    intendedRoles: ['Outreach Volunteer', 'Outreach Lead'],
    status: 'needs_review',
    resourceCount: 3,
    lastUsedDate: '2026-01-28',
    description: 'Kit for outreach event volunteers: event playbook, facilities guide, and visitor welcome materials.',
    includedResourceIds: ['res-004', 'res-006', 'res-009'],
  },
  {
    id: 'pack-006',
    name: 'Sunday Service Ops Kit',
    owner: 'Executive Pastor',
    ministry: 'admin',
    intendedRoles: ['Staff', 'Service Coordinator'],
    status: 'published',
    resourceCount: 3,
    lastUsedDate: '2026-02-16',
    description: 'Operational kit for Sunday service staff: run sheet, safety guide, and facilities request procedures.',
    includedResourceIds: ['res-005', 'res-008', 'res-006'],
  },
  {
    id: 'pack-007',
    name: 'Safety & Incident Response Pack',
    owner: 'Executive Pastor',
    ministry: 'admin',
    intendedRoles: ['Staff', 'Safety Team'],
    status: 'published',
    resourceCount: 2,
    lastUsedDate: '2026-02-10',
    description: 'Critical safety resources for all staff and safety team members including incident response and facilities guide.',
    includedResourceIds: ['res-008', 'res-006'],
  },
];

// =============================================================================
// POLICIES / PLAYBOOKS
// =============================================================================

const POLICIES: PolicyPlaybook[] = [
  {
    id: 'pol-001',
    title: 'Governance & Conduct',
    section: 'governance',
    owner: 'Senior Pastor',
    version: 3,
    status: 'published',
    effectiveDate: '2025-09-01',
    acknowledgmentRequired: true,
    acknowledgedCount: 48,
    totalRequired: 52,
  },
  {
    id: 'pol-002',
    title: 'Kids Safeguarding v2',
    section: 'safeguarding',
    owner: "Children's Pastor",
    version: 2,
    status: 'in_review',
    effectiveDate: '2026-03-01',
    acknowledgmentRequired: true,
    acknowledgedCount: 0,
    totalRequired: 35,
  },
  {
    id: 'pol-003',
    title: 'Facility Use Rules',
    section: 'facilities',
    owner: 'Facilities Manager',
    version: 2,
    status: 'published',
    effectiveDate: '2025-11-15',
    acknowledgmentRequired: false,
    acknowledgedCount: 0,
    totalRequired: 0,
  },
  {
    id: 'pol-004',
    title: 'Finance/Giving Handling',
    section: 'finance',
    owner: 'Finance Director',
    version: 1,
    status: 'published',
    effectiveDate: '2025-08-01',
    acknowledgmentRequired: true,
    acknowledgedCount: 12,
    totalRequired: 12,
  },
  {
    id: 'pol-005',
    title: 'Communications Guidelines',
    section: 'communications',
    owner: 'Communications Director',
    version: 2,
    status: 'published',
    effectiveDate: '2025-10-01',
    acknowledgmentRequired: false,
    acknowledgedCount: 0,
    totalRequired: 0,
  },
  {
    id: 'pol-006',
    title: 'Volunteer Discipline',
    section: 'volunteer',
    owner: 'Pastor Michael',
    version: 1,
    status: 'published',
    effectiveDate: '2025-07-01',
    acknowledgmentRequired: true,
    acknowledgedCount: 44,
    totalRequired: 52,
  },
  {
    id: 'pol-007',
    title: 'Data/Privacy Handling',
    section: 'data_privacy',
    owner: 'Executive Pastor',
    version: 1,
    status: 'published',
    effectiveDate: '2025-06-15',
    acknowledgmentRequired: true,
    acknowledgedCount: 50,
    totalRequired: 52,
  },
  {
    id: 'pol-008',
    title: 'Incident Response Playbook',
    section: 'incident_response',
    owner: 'Executive Pastor',
    version: 2,
    status: 'published',
    effectiveDate: '2025-12-01',
    acknowledgmentRequired: true,
    acknowledgedCount: 18,
    totalRequired: 20,
  },
];

// =============================================================================
// TRAINING MODULES
// =============================================================================

const TRAINING: TrainingModule[] = [
  {
    id: 'trn-001',
    title: 'New Volunteer Orientation',
    requiredRoles: ['Volunteer'],
    estimatedTime: '45 min',
    completionCount: 38,
    totalAssigned: 52,
    renewalCadence: 'Annual',
    status: 'published',
    description: 'Introduction to church culture, volunteer expectations, communication norms, and basic safety procedures.',
  },
  {
    id: 'trn-002',
    title: 'Kids Safeguarding Basics',
    requiredRoles: ['Kids Volunteer', 'Kids Lead'],
    estimatedTime: '30 min',
    completionCount: 28,
    totalAssigned: 35,
    renewalCadence: 'Annual',
    status: 'published',
    description: 'Mandatory training on child protection policies, reporting procedures, and safe environment practices.',
  },
  {
    id: 'trn-003',
    title: 'Check-In Workflow',
    requiredRoles: ['Kids Volunteer', 'Hospitality Volunteer'],
    estimatedTime: '15 min',
    completionCount: 30,
    totalAssigned: 35,
    status: 'published',
    description: 'Walk-through of the digital check-in system for kids ministry and first-time visitors.',
  },
  {
    id: 'trn-004',
    title: 'Worship Platform Etiquette',
    requiredRoles: ['Worship Volunteer', 'Worship Lead'],
    estimatedTime: '20 min',
    completionCount: 14,
    totalAssigned: 18,
    status: 'published',
    description: 'Stage conduct, in-ear monitor handling, transitions between songs, and communication with the tech team.',
  },
  {
    id: 'trn-005',
    title: 'Facilities Close-Out',
    requiredRoles: ['Staff', 'Facilities Volunteer'],
    estimatedTime: '10 min',
    completionCount: 8,
    totalAssigned: 12,
    status: 'published',
    description: 'End-of-event checklist: locking procedures, HVAC shutdown, light checks, and security arm sequence.',
  },
  {
    id: 'trn-006',
    title: 'Event Safety Basics',
    requiredRoles: ['Volunteer', 'Staff'],
    estimatedTime: '25 min',
    completionCount: 40,
    totalAssigned: 52,
    renewalCadence: 'Bi-Annual',
    status: 'in_review',
    description: 'Overview of emergency exits, first aid stations, AED locations, and the chain of command during incidents.',
  },
];

// =============================================================================
// FORM TEMPLATES
// =============================================================================

const FORMS: FormTemplate[] = [
  {
    id: 'frm-001',
    title: 'Facility Booking Request',
    purpose: 'Request to reserve a church facility for an event or meeting.',
    owner: 'Facilities Manager',
    routingRule: 'Auto-route to Facilities Manager for approval',
    visibility: 'org',
    requiredAttachments: false,
    status: 'published',
  },
  {
    id: 'frm-002',
    title: 'Event Request',
    purpose: 'Propose a new church or ministry event for calendar and resource approval.',
    owner: 'Executive Pastor',
    routingRule: 'Route to Ministry Lead, then Executive Pastor',
    visibility: 'org',
    requiredAttachments: false,
    status: 'published',
  },
  {
    id: 'frm-003',
    title: 'Serve Volunteer Signup',
    purpose: 'Sign up to serve in a ministry or volunteer role.',
    owner: 'Volunteer Coordinator',
    routingRule: 'Auto-route to relevant Ministry Lead',
    visibility: 'public',
    requiredAttachments: false,
    status: 'published',
  },
  {
    id: 'frm-004',
    title: 'Incident Report',
    purpose: 'Document any safety incident, injury, or policy violation on church property.',
    owner: 'Executive Pastor',
    routingRule: 'Route to Safety Team Lead and Executive Pastor immediately',
    visibility: 'role_specific',
    requiredAttachments: true,
    status: 'published',
  },
  {
    id: 'frm-005',
    title: 'Prayer Request Intake',
    purpose: 'Submit a prayer request for the prayer team to follow up on.',
    owner: 'Prayer Team Lead',
    routingRule: 'Auto-route to Prayer Team queue',
    visibility: 'public',
    requiredAttachments: false,
    status: 'published',
  },
  {
    id: 'frm-006',
    title: 'Benevolence Request',
    purpose: 'Request financial assistance or material support from the church benevolence fund.',
    owner: 'Finance Director',
    routingRule: 'Route to Benevolence Committee for review',
    visibility: 'restricted',
    requiredAttachments: true,
    status: 'published',
  },
];

// =============================================================================
// MEDIA ASSETS
// =============================================================================

const MEDIA_ASSETS: MediaAsset[] = [
  {
    id: 'med-001',
    title: 'Church Logo Pack',
    type: 'logo',
    owner: 'Communications Director',
    status: 'published',
    lastUpdated: '2026-01-05',
    description: 'Full logo suite in PNG, SVG, and EPS formats. Includes light/dark variants and icon-only options.',
  },
  {
    id: 'med-002',
    title: 'Sermon Slide Template',
    type: 'slide_template',
    owner: 'Communications Director',
    status: 'published',
    lastUpdated: '2026-02-08',
    description: 'Branded PowerPoint/Keynote templates for weekly sermon presentations with multiple layout options.',
  },
  {
    id: 'med-003',
    title: 'Worship Lyric Template',
    type: 'lyric_template',
    owner: 'Worship Director',
    status: 'published',
    lastUpdated: '2026-01-18',
    description: 'ProPresenter and PowerPoint lyric slide templates matching the church brand for worship sets.',
  },
  {
    id: 'med-004',
    title: 'Brand Photo Guidelines',
    type: 'photo_guideline',
    owner: 'Communications Director',
    status: 'published',
    lastUpdated: '2026-01-30',
    description: 'Photography style guide covering composition, lighting, editing presets, and acceptable use for church media.',
  },
  {
    id: 'med-005',
    title: 'Announcement Graphics Pack',
    type: 'announcement_graphic',
    owner: 'Communications Director',
    status: 'published',
    lastUpdated: '2026-02-12',
    description: 'Canva and Photoshop templates for weekly announcements, social media posts, and bulletin inserts.',
  },
];

// =============================================================================
// PUBLISHING QUEUE
// =============================================================================

const PUBLISHING_QUEUE: PublishingQueueItem[] = [
  {
    id: 'pub-001',
    resourceId: 'pol-002',
    resourceTitle: 'Kids Safeguarding v2',
    type: 'Policy',
    submittedBy: "Children's Pastor",
    submittedDate: '2026-02-10',
    requiredApprover: 'Executive Pastor',
    status: 'pending',
  },
  {
    id: 'pub-002',
    resourceId: 'trn-006',
    resourceTitle: 'Event Safety Basics',
    type: 'Training Module',
    submittedBy: 'Safety Team Lead',
    submittedDate: '2026-02-13',
    requiredApprover: 'Admin Director',
    status: 'pending',
  },
  {
    id: 'pub-003',
    resourceId: 'res-012',
    resourceTitle: 'Youth Trip Permission Slip v2',
    type: 'Form',
    submittedBy: 'Youth Pastor Davis',
    submittedDate: '2026-02-14',
    requiredApprover: 'Youth Ministry Lead',
    status: 'pending',
  },
];

// =============================================================================
// VERSION HISTORY
// =============================================================================

const VERSION_HISTORY: VersionHistoryEntry[] = [
  {
    id: 'vh-001',
    resourceId: 'res-005',
    resourceTitle: 'Sunday Service Run Sheet',
    action: 'version_bump',
    performedBy: 'Worship Director',
    timestamp: '2026-02-16T09:15:00Z',
    details: 'Updated run sheet to v6 with new transition timing for extended worship set.',
  },
  {
    id: 'vh-002',
    resourceId: 'res-014',
    resourceTitle: 'Worship Team Rehearsal Audio',
    action: 'published',
    performedBy: 'Worship Director',
    timestamp: '2026-02-15T14:30:00Z',
    details: 'Published new rehearsal tracks for the February 16 worship set.',
  },
  {
    id: 'vh-003',
    resourceId: 'res-012',
    resourceTitle: 'Youth Trip Permission Slip',
    action: 'version_bump',
    performedBy: 'Youth Pastor Davis',
    timestamp: '2026-02-14T11:00:00Z',
    details: 'Bumped to v2 with updated emergency contact fields and allergy information section.',
  },
  {
    id: 'vh-004',
    resourceId: 'pol-002',
    resourceTitle: 'Kids Safeguarding v2',
    action: 'visibility_changed',
    performedBy: "Children's Pastor",
    timestamp: '2026-02-10T16:45:00Z',
    details: 'Changed visibility from draft to in_review pending executive approval.',
  },
  {
    id: 'vh-005',
    resourceId: 'res-008',
    resourceTitle: 'Safety & Incident Response Guide',
    action: 'version_bump',
    performedBy: 'Executive Pastor',
    timestamp: '2026-02-10T10:00:00Z',
    details: 'Updated to v3 with revised evacuation routes for new building wing.',
  },
  {
    id: 'vh-006',
    resourceId: 'pol-008',
    resourceTitle: 'Incident Response Playbook',
    action: 'acknowledged',
    performedBy: 'Deacon James',
    timestamp: '2026-02-09T08:20:00Z',
    details: 'Deacon James acknowledged the Incident Response Playbook (18 of 20 required).',
  },
  {
    id: 'vh-007',
    resourceId: 'res-013',
    resourceTitle: 'Sermon Slide Template',
    action: 'version_bump',
    performedBy: 'Communications Director',
    timestamp: '2026-02-08T13:00:00Z',
    details: 'Updated to v5 with new scripture reference layout and dark-mode variant.',
  },
  {
    id: 'vh-008',
    resourceId: 'res-002',
    resourceTitle: 'Kids Check-In SOP',
    action: 'published',
    performedBy: "Children's Pastor",
    timestamp: '2026-02-05T09:30:00Z',
    details: 'Published v2 with QR-code check-in flow and updated badge printing instructions.',
  },
];

// =============================================================================
// RESOURCE REQUESTS
// =============================================================================

const REQUESTS: ResourceRequest[] = [
  {
    id: 'req-001',
    title: 'Need parking team checklist',
    type: 'new_template',
    requestedBy: 'Parking Team Lead',
    ministry: 'facilities',
    priority: 'normal',
    status: 'new',
    description: 'Requesting a checklist template for the parking team covering traffic flow, handicap assistance, and bad-weather protocols.',
  },
  {
    id: 'req-002',
    title: 'Update kids check-in SOP',
    type: 'update_policy',
    requestedBy: "Children's Pastor",
    ministry: 'kids',
    priority: 'high',
    ownerAssigned: "Children's Pastor",
    status: 'in_progress',
    description: 'The check-in SOP needs updates for the new tablet-based system rolling out in March.',
  },
  {
    id: 'req-003',
    title: "Create men's ministry kit",
    type: 'new_kit',
    requestedBy: 'Deacon James',
    ministry: 'discipleship',
    priority: 'normal',
    status: 'under_review',
    description: "Requesting a new resource pack for the men's ministry small group leaders with study guides and event planning templates.",
  },
  {
    id: 'req-004',
    title: 'Add conflict resolution training',
    type: 'add_training',
    requestedBy: 'Pastor Michael',
    ministry: 'general',
    priority: 'high',
    status: 'new',
    description: 'Need a new training module on conflict resolution and de-escalation for all volunteer leaders.',
  },
];

// =============================================================================
// DATA ACCESSOR
// =============================================================================

export function getChurchResourcesV2Data() {
  return {
    resources: RESOURCES,
    packs: PACKS,
    policies: POLICIES,
    training: TRAINING,
    forms: FORMS,
    mediaAssets: MEDIA_ASSETS,
    publishingQueue: PUBLISHING_QUEUE,
    versionHistory: VERSION_HISTORY,
    requests: REQUESTS,
    overviewTiles: {
      newResources7d: 3,
      policiesAwaitingApproval: 2,
      trainingCompletion30d: '78%',
      topPack: 'Sunday Service Ops Kit',
      expiringItems: 1,
    },
  };
}
