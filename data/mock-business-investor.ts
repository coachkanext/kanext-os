/**
 * Mock Business Investor Data
 * Valuetainment company information for Business mode.
 */

import type {
  BusinessOrganization,
  Document,
  BoardMember,
  Domain,
  BusinessScenario,
  ActivityItem,
} from '@/types';

// =============================================================================
// ORGANIZATION
// =============================================================================

export const KANEXT_ORGANIZATION: BusinessOrganization = {
  id: 'kanext-001',
  name: 'Valuetainment',
  mode: 'business',
  type: 'Technology Company',
  location: 'Fort Lauderdale, FL',
  description:
    'Valuetainment builds intelligent operating systems for organizations. Our platform provides unified interfaces for sports programs, churches, educational institutions, and enterprises to manage operations, engage stakeholders, and make data-driven decisions.',
  legalStructure: 'Delaware C-Corporation',
  stateOfFormation: 'Delaware',
  status: 'Active - Seed Stage',
  operationalScope: ['Sports', 'Enterprise', 'Faith', 'Education'],
};

// =============================================================================
// BOARD & LEADERSHIP
// =============================================================================

export const BOARD_MEMBERS: BoardMember[] = [
  {
    id: 'board-1',
    name: 'Alex Morgan',
    role: 'Founder & CEO',
    title: 'Chief Executive Officer',
    company: 'Valuetainment',
    bio: 'Former Division I athletic director with 15 years of experience in sports technology.',
  },
  {
    id: 'board-2',
    name: 'Dr. Lisa Grant',
    role: 'Board Member',
    title: 'Partner',
    company: 'KX Ventures',
    bio: 'Led investments in enterprise SaaS and sports technology companies.',
  },
  {
    id: 'board-3',
    name: 'James Wright',
    role: 'Board Observer',
    title: 'Managing Director',
    company: 'Wright Capital',
    bio: 'Angel investor focused on B2B software and institutional technology.',
  },
  {
    id: 'board-4',
    name: 'Rev. David Reeves',
    role: 'Advisor',
    title: 'Senior Pastor',
    company: '2819 Church',
    bio: 'Leads a multi-campus ministry and advises on church technology solutions.',
  },
];

export const LEADERSHIP_TEAM: BoardMember[] = [
  {
    id: 'exec-1',
    name: 'Alex Morgan',
    role: 'Founder & CEO',
    bio: 'Vision and strategy',
  },
  {
    id: 'exec-2',
    name: 'Alex Rivera',
    role: 'CTO',
    bio: 'Technology and product development',
  },
  {
    id: 'exec-3',
    name: 'Jordan Lee',
    role: 'Head of Sports',
    bio: 'Sports vertical and partnerships',
  },
];

// =============================================================================
// DOCUMENTS
// =============================================================================

export const DOCUMENTS: Document[] = [
  // Investor Materials
  {
    id: 'doc-1',
    title: 'Series Seed Pitch Deck',
    description: 'Q1 2026 investor presentation',
    category: 'investor_materials',
    visibility: 'investor',
    fileType: 'pdf',
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-28'),
  },
  {
    id: 'doc-2',
    title: 'Financial Model',
    description: '5-year projections and unit economics',
    category: 'investor_materials',
    visibility: 'founder',
    fileType: 'xls',
    createdAt: new Date('2025-11-01'),
    updatedAt: new Date('2026-01-20'),
  },
  {
    id: 'doc-3',
    title: 'Cap Table',
    description: 'Current ownership and option pool',
    category: 'investor_materials',
    visibility: 'founder',
    fileType: 'xls',
    createdAt: new Date('2025-06-01'),
    updatedAt: new Date('2026-01-05'),
  },
  {
    id: 'doc-4',
    title: 'Product Demo Video',
    description: 'Valuetainment OS walkthrough for investors',
    category: 'investor_materials',
    visibility: 'investor',
    fileType: 'link',
    url: 'https://valuetainment.com/demo',
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-01-10'),
  },

  // Governance
  {
    id: 'doc-5',
    title: 'Certificate of Incorporation',
    description: 'Delaware C-Corp formation documents',
    category: 'governance',
    visibility: 'founder',
    fileType: 'pdf',
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15'),
  },
  {
    id: 'doc-6',
    title: 'Bylaws',
    description: 'Corporate bylaws and amendments',
    category: 'governance',
    visibility: 'founder',
    fileType: 'pdf',
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2025-08-01'),
  },
  {
    id: 'doc-7',
    title: 'Board Meeting Minutes',
    description: 'Q4 2025 board meeting summary',
    category: 'governance',
    visibility: 'founder',
    fileType: 'pdf',
    createdAt: new Date('2025-12-15'),
    updatedAt: new Date('2025-12-15'),
  },
  {
    id: 'doc-8',
    title: 'Investor Rights Agreement',
    description: 'Series Seed investor rights',
    category: 'governance',
    visibility: 'investor',
    fileType: 'pdf',
    createdAt: new Date('2025-06-01'),
    updatedAt: new Date('2025-06-01'),
  },

  // Institutional Brief
  {
    id: 'doc-9',
    title: 'Company Overview',
    description: 'Valuetainment at a glance',
    category: 'institutional_brief',
    visibility: 'public',
    fileType: 'pdf',
    createdAt: new Date('2025-09-01'),
    updatedAt: new Date('2026-01-01'),
  },
  {
    id: 'doc-10',
    title: 'Market Analysis',
    description: 'TAM/SAM/SOM breakdown by vertical',
    category: 'institutional_brief',
    visibility: 'investor',
    fileType: 'pdf',
    createdAt: new Date('2025-10-15'),
    updatedAt: new Date('2025-12-01'),
  },

  // Roadmap
  {
    id: 'doc-11',
    title: '2026 Product Roadmap',
    description: 'Feature timeline and milestones',
    category: 'roadmap',
    visibility: 'investor',
    fileType: 'pdf',
    createdAt: new Date('2025-12-01'),
    updatedAt: new Date('2026-01-15'),
  },
  {
    id: 'doc-12',
    title: 'Technical Architecture',
    description: 'System design and infrastructure',
    category: 'roadmap',
    visibility: 'founder',
    fileType: 'pdf',
    createdAt: new Date('2025-08-01'),
    updatedAt: new Date('2025-11-15'),
  },
];

// =============================================================================
// DOMAINS
// =============================================================================

export const DOMAINS: Domain[] = [
  {
    id: 'domain-sports',
    name: 'Sports',
    mode: 'sports',
    description: 'Athletic program management for universities, clubs, and leagues',
    status: 'active',
    icon: 'sportscourt.fill',
  },
  {
    id: 'domain-enterprise',
    name: 'Enterprise',
    mode: 'business',
    description: 'Investor data room and corporate intelligence platform',
    status: 'active',
    icon: 'building.2.fill',
  },
  {
    id: 'domain-church',
    name: 'Faith',
    mode: 'church',
    description: 'Ministry management and congregation engagement',
    status: 'development',
    icon: 'heart.fill',
  },
  {
    id: 'domain-education',
    name: 'Education',
    mode: 'education',
    description: 'Academic administration and student services',
    status: 'planned',
    icon: 'graduationcap.fill',
  },
];

// =============================================================================
// SCENARIOS (Saved Nexus outputs)
// =============================================================================

export const SAVED_SCENARIOS: BusinessScenario[] = [
  {
    id: 'scenario-1',
    title: 'Series A Timeline Analysis',
    prompt: 'When should we target Series A based on current metrics?',
    output:
      'Based on your current MRR growth rate of 15% month-over-month and runway of 18 months, targeting Series A in Q3 2026 would allow you to demonstrate 3 quarters of sustained growth while maintaining 12+ months runway for negotiation leverage.',
    timestamp: new Date('2026-01-20'),
    isPinned: true,
  },
  {
    id: 'scenario-2',
    title: 'Sports Vertical TAM',
    prompt: 'What is the total addressable market for the sports vertical?',
    output:
      'The collegiate athletics technology market represents a $4.2B TAM, with $1.8B in SAM focused on Division I and II programs. Your initial SOM targeting 50 programs represents approximately $15M in potential ARR.',
    timestamp: new Date('2026-01-15'),
    isPinned: false,
  },
  {
    id: 'scenario-3',
    title: 'Hiring Plan Q2',
    prompt: 'What roles should we prioritize for Q2 hiring?',
    output:
      'Priority 1: Senior Full-Stack Engineer to accelerate feature velocity. Priority 2: Customer Success Manager to support growing pilot programs. Priority 3: Sales Development Rep to build pipeline for sports vertical.',
    timestamp: new Date('2026-01-10'),
    isPinned: true,
  },
];

// =============================================================================
// ACTIVITY
// =============================================================================

export const BUSINESS_ACTIVITY: ActivityItem[] = [
  {
    id: 'ent-act-1',
    type: 'document_added',
    title: 'New Document Added',
    description: 'Series Seed Pitch Deck uploaded',
    timestamp: new Date('2026-01-28'),
    sourceType: 'record',
    sourceId: 'doc-1',
    route: '/organization/documents',
    organizationId: 'kanext-001',
    mode: 'business',
    visibility: ['founder', 'investor'],
  },
  {
    id: 'ent-act-2',
    type: 'scenario_saved',
    title: 'Scenario Saved',
    description: 'Series A Timeline Analysis pinned',
    timestamp: new Date('2026-01-20'),
    sourceType: 'record',
    sourceId: 'scenario-1',
    route: '/nexus',
    organizationId: 'kanext-001',
    mode: 'business',
    visibility: ['founder'],
  },
  {
    id: 'ent-act-3',
    type: 'document_updated',
    title: 'Document Updated',
    description: '2026 Product Roadmap revised',
    timestamp: new Date('2026-01-15'),
    sourceType: 'record',
    sourceId: 'doc-11',
    route: '/organization/documents',
    organizationId: 'kanext-001',
    mode: 'business',
    visibility: ['founder', 'investor'],
  },
  {
    id: 'ent-act-4',
    type: 'config_changed',
    title: 'Settings Updated',
    description: 'Investor access permissions modified',
    timestamp: new Date('2026-01-10'),
    sourceType: 'system',
    sourceId: 'config-1',
    route: '/organization',
    organizationId: 'kanext-001',
    mode: 'business',
    visibility: ['founder'],
  },
];

// =============================================================================
// METRICS
// =============================================================================

export const COMPANY_METRICS = {
  mrr: 45000,
  mrrGrowth: 15,
  customers: 12,
  pilots: 8,
  runway: 18,
  teamSize: 6,
  raised: 1500000,
};

// =============================================================================
// HELPERS
// =============================================================================

export function getDocumentsByCategory(category: Document['category']): Document[] {
  return DOCUMENTS.filter((doc) => doc.category === category);
}

export function getDocumentsByVisibility(
  visibility: Document['visibility'],
  userRole: 'founder' | 'investor' | 'viewer'
): Document[] {
  return DOCUMENTS.filter((doc) => {
    if (userRole === 'founder') return true;
    if (userRole === 'investor') return doc.visibility !== 'founder';
    return doc.visibility === 'public';
  });
}

export function getCategoryLabel(category: Document['category']): string {
  switch (category) {
    case 'investor_materials':
      return 'Investor Materials';
    case 'governance':
      return 'Governance';
    case 'institutional_brief':
      return 'Institutional Brief';
    case 'roadmap':
      return 'Roadmap';
    default:
      return category;
  }
}

export function getFileTypeIcon(fileType: Document['fileType']): string {
  switch (fileType) {
    case 'pdf':
      return 'doc.fill';
    case 'doc':
      return 'doc.text.fill';
    case 'xls':
      return 'tablecells.fill';
    case 'ppt':
      return 'rectangle.stack.fill';
    case 'link':
      return 'link';
    default:
      return 'doc.fill';
  }
}

export function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount}`;
}

export function getDomainStatusColor(status: Domain['status']): string {
  switch (status) {
    case 'active':
      return '#FFFFFF';
    case 'development':
      return '#9C9790';
    case 'planned':
      return '#9C9790';
    default:
      return '#9C9790';
  }
}

// =============================================================================
// V2 RE-EXPORTS
// =============================================================================

export {
  COMPANIES,
  PROOF_EVENTS,
  ENGINES,
  DOCUMENTS_V2,
  REVENUE_STREAMS,
  COMPETITIVE_ADVANTAGES,
  FUNDRAISING,
  ARCHITECTURE_LAYERS,
  RECENT_UPDATES,
  getCompanyById,
  getProofEventsByCompany,
  getDocsByCompany,
  getDocsByCategory,
  getCategoryLabelV2,
  getStageColor,
  getMilestoneStatusColor,
  getRiskSeverityColor,
} from './mock-business-investor-v2';
