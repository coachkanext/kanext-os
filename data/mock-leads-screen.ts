/**
 * Mock data for Leads screen — 3 pages: Pipeline, Contacts, Activity.
 * Business mode CRM/sales pipeline (replaces Pipedrive/HubSpot mobile).
 */

// ─── Shared Types ──────────────────────────────────────────────────────────

export type DealPriority = 'hot' | 'warm' | 'cold';
export type ContactType = 'lead' | 'client' | 'partner' | 'vendor' | 'investor';
export type ContactSource = 'referral' | 'inbound' | 'event' | 'cold-outreach' | 'website';
export type LeadPipelineStage = 'Lead' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed Won';

// ─── Pipeline (Page 0) ────────────────────────────────────────────────────

export interface PipelineSummary {
  totalValue: number;
  dealCount: number;
  dealsWonThisMonth: number;
  conversionRate: number;
}

export interface LeadDeal {
  id: string;
  title: string;
  contactName: string;
  companyName: string;
  value: number;
  stage: LeadPipelineStage;
  daysInStage: number;
  lastActivity: string;
  ownerName: string;
  ownerInitials: string;
  priority: DealPriority;
  nextActionDue: string;
  probability: number;
}

export const PIPELINE_STAGES: { stage: LeadPipelineStage; color: string }[] = [
  { stage: 'Lead',         color: '#6B7280' },
  { stage: 'Contacted',    color: '#1A1714' },
  { stage: 'Qualified',    color: '#1A1714' },
  { stage: 'Proposal',     color: '#B8943E' },
  { stage: 'Negotiation',  color: '#B8943E' },
  { stage: 'Closed Won',   color: '#5A8A6E' },
];

export const PIPELINE_SUMMARY: PipelineSummary = {
  totalValue: 842000,
  dealCount: 18,
  dealsWonThisMonth: 3,
  conversionRate: 24,
};

const DEALS: LeadDeal[] = [
  // Lead
  { id: 'ld1', title: 'Website Redesign', contactName: 'Sarah Chen', companyName: 'Vortex Labs', value: 25000, stage: 'Lead', daysInStage: 2, lastActivity: '2h ago', ownerName: 'Mike R.', ownerInitials: 'MR', priority: 'warm', nextActionDue: 'Tomorrow', probability: 10 },
  { id: 'ld2', title: 'Brand Strategy', contactName: 'James Wilson', companyName: 'Peak Dynamics', value: 18000, stage: 'Lead', daysInStage: 5, lastActivity: '1d ago', ownerName: 'Anna K.', ownerInitials: 'AK', priority: 'cold', nextActionDue: 'Mar 14', probability: 5 },
  { id: 'ld3', title: 'SEO Audit', contactName: 'Lisa Park', companyName: 'Greenfield Co', value: 8000, stage: 'Lead', daysInStage: 1, lastActivity: '4h ago', ownerName: 'Mike R.', ownerInitials: 'MR', priority: 'hot', nextActionDue: 'Today', probability: 15 },
  // Contacted
  { id: 'ld4', title: 'CRM Integration', contactName: 'David Lee', companyName: 'NovaTech', value: 45000, stage: 'Contacted', daysInStage: 3, lastActivity: '5h ago', ownerName: 'Anna K.', ownerInitials: 'AK', priority: 'hot', nextActionDue: 'Today', probability: 20 },
  { id: 'ld5', title: 'Mobile App MVP', contactName: 'Rachel Kim', companyName: 'UrbanFlow', value: 120000, stage: 'Contacted', daysInStage: 7, lastActivity: '2d ago', ownerName: 'Mike R.', ownerInitials: 'MR', priority: 'warm', nextActionDue: 'Mar 12', probability: 15 },
  { id: 'ld6', title: 'Content Marketing', contactName: 'Tom Harris', companyName: 'Skyline Media', value: 15000, stage: 'Contacted', daysInStage: 4, lastActivity: '1d ago', ownerName: 'Jess T.', ownerInitials: 'JT', priority: 'cold', nextActionDue: 'Mar 15', probability: 10 },
  // Qualified
  { id: 'ld7', title: 'E-commerce Platform', contactName: 'Nina Patel', companyName: 'Bloom & Co', value: 95000, stage: 'Qualified', daysInStage: 6, lastActivity: '3h ago', ownerName: 'Mike R.', ownerInitials: 'MR', priority: 'hot', nextActionDue: 'Today', probability: 40 },
  { id: 'ld8', title: 'Data Dashboard', contactName: 'Marcus Brown', companyName: 'Apex Analytics', value: 55000, stage: 'Qualified', daysInStage: 10, lastActivity: '1d ago', ownerName: 'Anna K.', ownerInitials: 'AK', priority: 'warm', nextActionDue: 'Mar 13', probability: 35 },
  { id: 'ld9', title: 'API Development', contactName: 'Alex Turner', companyName: 'CoreStack', value: 38000, stage: 'Qualified', daysInStage: 4, lastActivity: '6h ago', ownerName: 'Jess T.', ownerInitials: 'JT', priority: 'warm', nextActionDue: 'Mar 14', probability: 30 },
  // Proposal
  { id: 'ld10', title: 'Cloud Migration', contactName: 'Karen Cho', companyName: 'FlexiCorp', value: 150000, stage: 'Proposal', daysInStage: 3, lastActivity: '1h ago', ownerName: 'Mike R.', ownerInitials: 'MR', priority: 'hot', nextActionDue: 'Today', probability: 55 },
  { id: 'ld11', title: 'Security Audit', contactName: 'Ben Foster', companyName: 'TrustVault', value: 32000, stage: 'Proposal', daysInStage: 8, lastActivity: '2d ago', ownerName: 'Anna K.', ownerInitials: 'AK', priority: 'warm', nextActionDue: 'Mar 11', probability: 50 },
  // Negotiation
  { id: 'ld12', title: 'SaaS Platform', contactName: 'Olivia Grant', companyName: 'Meridian Tech', value: 85000, stage: 'Negotiation', daysInStage: 5, lastActivity: '30m ago', ownerName: 'Mike R.', ownerInitials: 'MR', priority: 'hot', nextActionDue: 'Today', probability: 75 },
  { id: 'ld13', title: 'DevOps Consulting', contactName: 'Chris Nakamura', companyName: 'PipelineIO', value: 42000, stage: 'Negotiation', daysInStage: 12, lastActivity: '3h ago', ownerName: 'Jess T.', ownerInitials: 'JT', priority: 'warm', nextActionDue: 'Mar 12', probability: 65 },
  { id: 'ld14', title: 'Training Program', contactName: 'Diana Reyes', companyName: 'SkillBridge', value: 28000, stage: 'Negotiation', daysInStage: 3, lastActivity: '1d ago', ownerName: 'Anna K.', ownerInitials: 'AK', priority: 'warm', nextActionDue: 'Mar 14', probability: 70 },
  // Closed Won
  { id: 'ld15', title: 'Rebrand Package', contactName: 'Mia Zhang', companyName: 'Lumina Design', value: 35000, stage: 'Closed Won', daysInStage: 0, lastActivity: 'Today', ownerName: 'Mike R.', ownerInitials: 'MR', priority: 'hot', nextActionDue: '-', probability: 100 },
  { id: 'ld16', title: 'IT Infrastructure', contactName: 'Ryan Scott', companyName: 'BaseCamp IT', value: 62000, stage: 'Closed Won', daysInStage: 0, lastActivity: 'Mar 5', ownerName: 'Jess T.', ownerInitials: 'JT', priority: 'warm', nextActionDue: '-', probability: 100 },
  { id: 'ld17', title: 'UX Research', contactName: 'Priya Sharma', companyName: 'Insight Labs', value: 22000, stage: 'Closed Won', daysInStage: 0, lastActivity: 'Mar 3', ownerName: 'Anna K.', ownerInitials: 'AK', priority: 'warm', nextActionDue: '-', probability: 100 },
  { id: 'ld18', title: 'Social Media Mgmt', contactName: 'Jake Morrison', companyName: 'Vireo Agency', value: 12000, stage: 'Lead', daysInStage: 0, lastActivity: '8h ago', ownerName: 'Jess T.', ownerInitials: 'JT', priority: 'warm', nextActionDue: 'Mar 13', probability: 5 },
];

export function getDealsByStage(stage: LeadPipelineStage): LeadDeal[] {
  return DEALS.filter((d) => d.stage === stage).sort((a, b) => b.value - a.value);
}

export function formatDealValue(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

// ─── Contacts (Page 1) ────────────────────────────────────────────────────

export type ContactFilter = 'all' | ContactType;
export type ContactSort = 'name' | 'lastContact' | 'company' | 'type' | 'dealValue';

export interface ContactItem {
  id: string;
  name: string;
  initials: string;
  username: string;
  title: string;
  company: string;
  type: ContactType;
  lastInteraction: string;
  activeDealTitle?: string;
  activeDealValue?: number;
  source: ContactSource;
  imageUri?: string;
}

const CONTACTS: ContactItem[] = [
  { id: 'c1',  name: 'Sarah Chen',        initials: 'SC', username: 'sarachen',     title: 'CTO',                 company: 'Vortex Labs',     type: 'lead',     lastInteraction: '2h ago',   activeDealTitle: 'Website Redesign',    activeDealValue: 25000,  source: 'inbound' },
  { id: 'c2',  name: 'David Lee',         initials: 'DL', username: 'davidlee',     title: 'VP Engineering',      company: 'NovaTech',        type: 'lead',     lastInteraction: '5h ago',   activeDealTitle: 'CRM Integration',     activeDealValue: 45000,  source: 'referral' },
  { id: 'c3',  name: 'Nina Patel',        initials: 'NP', username: 'ninapatel',    title: 'CEO',                 company: 'Bloom & Co',      type: 'lead',     lastInteraction: '3h ago',   activeDealTitle: 'E-commerce Platform', activeDealValue: 95000,  source: 'event' },
  { id: 'c4',  name: 'Karen Cho',         initials: 'KC', username: 'karencho',     title: 'Head of IT',          company: 'FlexiCorp',       type: 'lead',     lastInteraction: '1h ago',   activeDealTitle: 'Cloud Migration',     activeDealValue: 150000, source: 'cold-outreach' },
  { id: 'c5',  name: 'Olivia Grant',      initials: 'OG', username: 'ogrant',       title: 'COO',                 company: 'Meridian Tech',   type: 'lead',     lastInteraction: '30m ago',  activeDealTitle: 'SaaS Platform',       activeDealValue: 85000,  source: 'referral' },
  { id: 'c6',  name: 'Mia Zhang',         initials: 'MZ', username: 'miazhang',     title: 'Creative Director',   company: 'Lumina Design',   type: 'client',   lastInteraction: 'Today',    activeDealTitle: 'Rebrand Package',     activeDealValue: 35000,  source: 'inbound' },
  { id: 'c7',  name: 'Ryan Scott',        initials: 'RS', username: 'rscott',       title: 'IT Director',         company: 'BaseCamp IT',     type: 'client',   lastInteraction: 'Mar 5',                                                            source: 'event' },
  { id: 'c8',  name: 'Priya Sharma',      initials: 'PS', username: 'priyasharma',  title: 'Research Lead',       company: 'Insight Labs',    type: 'client',   lastInteraction: 'Mar 3',                                                            source: 'referral' },
  { id: 'c9',  name: 'Jake Morrison',     initials: 'JM', username: 'jmorrison',    title: 'Marketing Director',  company: 'Vireo Agency',    type: 'partner',  lastInteraction: '8h ago',   activeDealTitle: 'Social Media Mgmt',   activeDealValue: 12000,  source: 'referral' },
  { id: 'c10', name: 'Marcus Brown',      initials: 'MB', username: 'mbrown',       title: 'Data Lead',           company: 'Apex Analytics',  type: 'partner',  lastInteraction: '1d ago',   activeDealTitle: 'Data Dashboard',      activeDealValue: 55000,  source: 'event' },
  { id: 'c11', name: 'Rachel Kim',        initials: 'RK', username: 'rachelkim',    title: 'Product Manager',     company: 'UrbanFlow',       type: 'lead',     lastInteraction: '2d ago',   activeDealTitle: 'Mobile App MVP',      activeDealValue: 120000, source: 'website' },
  { id: 'c12', name: 'Tom Harris',        initials: 'TH', username: 'tharris',      title: 'Marketing VP',        company: 'Skyline Media',   type: 'vendor',   lastInteraction: '1d ago',                                                           source: 'cold-outreach' },
  { id: 'c13', name: 'Ben Foster',        initials: 'BF', username: 'bfoster',      title: 'CISO',                company: 'TrustVault',      type: 'lead',     lastInteraction: '2d ago',   activeDealTitle: 'Security Audit',      activeDealValue: 32000,  source: 'inbound' },
  { id: 'c14', name: 'Chris Nakamura',    initials: 'CN', username: 'cnakamura',    title: 'VP Operations',       company: 'PipelineIO',      type: 'client',   lastInteraction: '3h ago',   activeDealTitle: 'DevOps Consulting',   activeDealValue: 42000,  source: 'referral' },
  { id: 'c15', name: 'Diana Reyes',       initials: 'DR', username: 'dreyes',       title: 'HR Director',         company: 'SkillBridge',     type: 'lead',     lastInteraction: '1d ago',   activeDealTitle: 'Training Program',    activeDealValue: 28000,  source: 'event' },
  { id: 'c16', name: 'Alex Turner',       initials: 'AT', username: 'aturner',      title: 'CTO',                 company: 'CoreStack',       type: 'lead',     lastInteraction: '6h ago',   activeDealTitle: 'API Development',     activeDealValue: 38000,  source: 'website' },
  { id: 'c17', name: 'Lisa Park',         initials: 'LP', username: 'lisapark',     title: 'CMO',                 company: 'Greenfield Co',   type: 'lead',     lastInteraction: '4h ago',   activeDealTitle: 'SEO Audit',           activeDealValue: 8000,   source: 'inbound' },
  { id: 'c18', name: 'James Wilson',      initials: 'JW', username: 'jwilson',      title: 'Brand Manager',       company: 'Peak Dynamics',   type: 'investor', lastInteraction: '1d ago',                                                           source: 'event' },
  { id: 'c19', name: 'Samantha Cole',     initials: 'SC', username: 'scole',        title: 'Managing Partner',    company: 'Horizon Capital', type: 'investor', lastInteraction: '3d ago',                                                           source: 'referral' },
  { id: 'c20', name: 'Ethan Brooks',      initials: 'EB', username: 'ebrooks',      title: 'Account Executive',   company: 'Axiom Supply',    type: 'vendor',   lastInteraction: '5d ago',                                                           source: 'cold-outreach' },
];

export function getContacts(filter: ContactFilter, sort: ContactSort): ContactItem[] {
  let list = filter === 'all' ? [...CONTACTS] : CONTACTS.filter((c) => c.type === filter);

  list.sort((a, b) => {
    switch (sort) {
      case 'name':        return a.name.localeCompare(b.name);
      case 'company':     return a.company.localeCompare(b.company);
      case 'type':        return a.type.localeCompare(b.type);
      case 'dealValue':   return (b.activeDealValue ?? 0) - (a.activeDealValue ?? 0);
      case 'lastContact': return 0; // already ordered by recency in mock
      default:            return 0;
    }
  });

  return list;
}

// ─── Activity (Page 2) ────────────────────────────────────────────────────

export type ActivityFilter = 'all' | 'dueToday' | 'overdue' | 'responses' | 'newLeads';
export type ActivityType = 'followUp' | 'response' | 'newLead' | 'dealMoved' | 'meetingScheduled' | 'dealWon' | 'dealLost';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  contactName: string;
  contactInitials: string;
  company: string;
  description: string;
  timestamp: string;
  isOverdue?: boolean;
  isDone?: boolean;
  dealName?: string;
  dealValue?: number;
  priority?: DealPriority;
}

export interface ActivitySummary {
  followUpsDue: number;
  responsesReceived: number;
  newLeadsCount: number;
}

export const ACTIVITY_SUMMARY: ActivitySummary = {
  followUpsDue: 5,
  responsesReceived: 3,
  newLeadsCount: 2,
};

const ACTIVITIES: ActivityItem[] = [
  { id: 'a1',  type: 'followUp',         contactName: 'Karen Cho',       contactInitials: 'KC', company: 'FlexiCorp',       description: 'Follow up on cloud migration proposal',     timestamp: 'Due today',  isOverdue: false, dealName: 'Cloud Migration',     dealValue: 150000, priority: 'hot' },
  { id: 'a2',  type: 'followUp',         contactName: 'Olivia Grant',    contactInitials: 'OG', company: 'Meridian Tech',   description: 'Send revised pricing for SaaS platform',    timestamp: 'Due today',  isOverdue: false, dealName: 'SaaS Platform',       dealValue: 85000,  priority: 'hot' },
  { id: 'a3',  type: 'followUp',         contactName: 'Ben Foster',      contactInitials: 'BF', company: 'TrustVault',      description: 'Schedule security audit kickoff call',      timestamp: '2d overdue', isOverdue: true,  dealName: 'Security Audit',      dealValue: 32000,  priority: 'warm' },
  { id: 'a4',  type: 'response',         contactName: 'Nina Patel',      contactInitials: 'NP', company: 'Bloom & Co',      description: 'Replied to e-commerce proposal — wants demo', timestamp: '3h ago',   dealName: 'E-commerce Platform', dealValue: 95000 },
  { id: 'a5',  type: 'response',         contactName: 'David Lee',       contactInitials: 'DL', company: 'NovaTech',        description: 'Requested technical spec document',          timestamp: '5h ago',   dealName: 'CRM Integration',     dealValue: 45000 },
  { id: 'a6',  type: 'newLead',          contactName: 'Monica Vega',     contactInitials: 'MV', company: 'Prisma Studios',  description: 'Submitted inquiry via website contact form', timestamp: '1h ago' },
  { id: 'a7',  type: 'newLead',          contactName: 'Derek Chang',     contactInitials: 'DC', company: 'Atlas Group',     description: 'Referred by Mia Zhang (Lumina Design)',      timestamp: '4h ago' },
  { id: 'a8',  type: 'dealMoved',        contactName: 'Chris Nakamura',  contactInitials: 'CN', company: 'PipelineIO',      description: 'Moved from Proposal → Negotiation',         timestamp: '6h ago',   dealName: 'DevOps Consulting',   dealValue: 42000 },
  { id: 'a9',  type: 'meetingScheduled', contactName: 'Marcus Brown',    contactInitials: 'MB', company: 'Apex Analytics',  description: 'Demo call scheduled for Mar 13, 2:00 PM',    timestamp: 'Mar 13',   dealName: 'Data Dashboard',      dealValue: 55000 },
  { id: 'a10', type: 'dealWon',          contactName: 'Mia Zhang',       contactInitials: 'MZ', company: 'Lumina Design',   description: 'Contract signed — rebrand package',          timestamp: 'Today',    dealName: 'Rebrand Package',     dealValue: 35000 },
  { id: 'a11', type: 'followUp',         contactName: 'Rachel Kim',      contactInitials: 'RK', company: 'UrbanFlow',       description: 'Send mobile app wireframes for review',      timestamp: '1d overdue', isOverdue: true, dealName: 'Mobile App MVP',      dealValue: 120000, priority: 'warm' },
  { id: 'a12', type: 'followUp',         contactName: 'Alex Turner',     contactInitials: 'AT', company: 'CoreStack',       description: 'Share API documentation and timeline',       timestamp: 'Due today',  isOverdue: false, dealName: 'API Development',   dealValue: 38000,  priority: 'warm' },
  { id: 'a13', type: 'response',         contactName: 'Diana Reyes',     contactInitials: 'DR', company: 'SkillBridge',     description: 'Approved training program scope of work',     timestamp: '8h ago',   dealName: 'Training Program',    dealValue: 28000 },
  { id: 'a14', type: 'dealLost',         contactName: 'Greg Lawson',     contactInitials: 'GL', company: 'TerraFirm',       description: 'Went with competitor — price too high',       timestamp: 'Yesterday', dealName: 'Infrastructure Audit', dealValue: 48000 },
  { id: 'a15', type: 'followUp',         contactName: 'Sarah Chen',      contactInitials: 'SC', company: 'Vortex Labs',     description: 'Confirm requirements for website redesign',   timestamp: 'Due tomorrow', isOverdue: false, dealName: 'Website Redesign', dealValue: 25000, priority: 'warm' },
];

export function getActivities(filter: ActivityFilter): ActivityItem[] {
  let list: ActivityItem[];

  switch (filter) {
    case 'dueToday':
      list = ACTIVITIES.filter((a) => a.type === 'followUp' && !a.isOverdue && !a.isDone);
      break;
    case 'overdue':
      list = ACTIVITIES.filter((a) => a.isOverdue);
      break;
    case 'responses':
      list = ACTIVITIES.filter((a) => a.type === 'response');
      break;
    case 'newLeads':
      list = ACTIVITIES.filter((a) => a.type === 'newLead');
      break;
    default:
      list = [...ACTIVITIES];
  }

  // Sort: overdue first, then due today, then by recency
  list.sort((a, b) => {
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    if (a.isDone && !b.isDone) return 1;
    if (!a.isDone && b.isDone) return -1;
    return 0;
  });

  return list;
}
