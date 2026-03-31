/**
 * Business Entities v2 — Mock Data
 * Entity directory with projects, tasks, opportunities, and contacts.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface Entity {
  id: string;
  name: string;
  type: 'company' | 'department' | 'team' | 'project';
  description: string;
  headCount: number;
  lead: string;
  leadInitials: string;
  status: 'active' | 'planning' | 'archived';
  color: string;
  revenue?: number;
  founded?: string;
}

export interface EntityProject {
  id: string;
  entityId: string;
  name: string;
  status: 'active' | 'on-hold' | 'completed' | 'planning';
  progress: number;
  deadline: string;
  lead: string;
}

export interface EntityTask {
  id: string;
  entityId: string;
  title: string;
  assignee: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
}

export interface EntityOpportunity {
  id: string;
  entityId: string;
  title: string;
  value: number;
  stage: 'prospect' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  contact: string;
  closeDate: string;
}

export interface EntityContact {
  id: string;
  entityId: string;
  name: string;
  initials: string;
  role: string;
  email: string;
  phone?: string;
}

// =============================================================================
// ENTITIES
// =============================================================================

export const ENTITIES: Entity[] = [
  {
    id: 'ent-kanext',
    name: 'Valuetainment',
    type: 'company',
    description: 'Operating system for organizations — sports, church, enterprise, education, and community. Building the connective tissue between institutions and their people.',
    headCount: 12,
    lead: 'Alex Morgan',
    leadInitials: 'SK',
    status: 'active',
    color: '#FFFFFF',
    revenue: 420000,
    founded: '2024',
  },
  {
    id: 'ent-product',
    name: 'Product',
    type: 'department',
    description: 'Product strategy, design, and roadmap execution. Responsible for platform vision and user experience across all modes.',
    headCount: 5,
    lead: 'Jessica Chen',
    leadInitials: 'JC',
    status: 'active',
    color: '#1A1714',
  },
  {
    id: 'ent-engineering',
    name: 'Engineering',
    type: 'department',
    description: 'Full-stack engineering, infrastructure, and DevOps. Building the Valuetainment platform across mobile, web, and API layers.',
    headCount: 4,
    lead: 'Adewale Ogundimu',
    leadInitials: 'AO',
    status: 'active',
    color: '#5A8A6E',
  },
  {
    id: 'ent-sales',
    name: 'Sales',
    type: 'department',
    description: 'Revenue generation, enterprise partnerships, and institutional onboarding. Driving adoption across verticals.',
    headCount: 3,
    lead: 'Dan Pearson',
    leadInitials: 'MW',
    status: 'active',
    color: '#B8943E',
  },
  {
    id: 'ent-marketing',
    name: 'Marketing',
    type: 'team',
    description: 'Brand strategy, content production, social media, and growth marketing for Valuetainment and proof wedge organizations.',
    headCount: 2,
    lead: 'Sarah Okafor',
    leadInitials: 'SO',
    status: 'active',
    color: '#1A1714',
  },
  {
    id: 'ent-mlk-classic',
    name: 'MLK Classic',
    type: 'project',
    description: 'Flagship annual basketball event celebrating Dr. Martin Luther King Jr. A proof wedge event showcasing the Valuetainment platform in live action.',
    headCount: 6,
    lead: 'Alex Morgan',
    leadInitials: 'SK',
    status: 'planning',
    color: '#B85C5C',
  },
  {
    id: 'ent-platform-v2',
    name: 'Platform V2',
    type: 'project',
    description: 'Next-generation Valuetainment OS with multi-mode switching, Nexus AI assistant, and settlement rails integration.',
    headCount: 8,
    lead: 'Adewale Ogundimu',
    leadInitials: 'AO',
    status: 'active',
    color: '#1A1714',
  },
  {
    id: 'ent-investor-relations',
    name: 'Investor Relations',
    type: 'team',
    description: 'Managing investor communications, data room, cap table, and fundraising pipeline.',
    headCount: 2,
    lead: 'Nicole Torres',
    leadInitials: 'NT',
    status: 'active',
    color: '#1A1714',
  },
];

// =============================================================================
// ENTITY PROJECTS
// =============================================================================

export const ENTITY_PROJECTS: EntityProject[] = [
  {
    id: 'ep-1',
    entityId: 'ent-platform-v2',
    name: 'Platform V2 Launch',
    status: 'active',
    progress: 65,
    deadline: '2026-06-30',
    lead: 'Adewale Ogundimu',
  },
  {
    id: 'ep-2',
    entityId: 'ent-mlk-classic',
    name: 'MLK Classic Event',
    status: 'planning',
    progress: 20,
    deadline: '2027-01-18',
    lead: 'Alex Morgan',
  },
  {
    id: 'ep-3',
    entityId: 'ent-sales',
    name: 'Sales Pipeline Revamp',
    status: 'active',
    progress: 40,
    deadline: '2026-04-15',
    lead: 'Dan Pearson',
  },
  {
    id: 'ep-4',
    entityId: 'ent-marketing',
    name: 'Marketing Rebrand',
    status: 'active',
    progress: 55,
    deadline: '2026-05-01',
    lead: 'Sarah Okafor',
  },
  {
    id: 'ep-5',
    entityId: 'ent-engineering',
    name: 'Mobile App',
    status: 'active',
    progress: 78,
    deadline: '2026-04-30',
    lead: 'Adewale Ogundimu',
  },
  {
    id: 'ep-6',
    entityId: 'ent-engineering',
    name: 'Data Infrastructure',
    status: 'on-hold',
    progress: 30,
    deadline: '2026-08-31',
    lead: 'Adewale Ogundimu',
  },
];

// =============================================================================
// ENTITY TASKS
// =============================================================================

export const ENTITY_TASKS: EntityTask[] = [
  {
    id: 'et-1',
    entityId: 'ent-kanext',
    title: 'Finalize Series A pitch deck',
    assignee: 'Alex Morgan',
    dueDate: '2026-03-01',
    priority: 'high',
    status: 'in-progress',
  },
  {
    id: 'et-2',
    entityId: 'ent-product',
    title: 'Complete V2 wireframes for Church mode',
    assignee: 'Jessica Chen',
    dueDate: '2026-02-28',
    priority: 'high',
    status: 'in-progress',
  },
  {
    id: 'et-3',
    entityId: 'ent-engineering',
    title: 'Implement settlement rails API',
    assignee: 'Adewale Ogundimu',
    dueDate: '2026-04-15',
    priority: 'high',
    status: 'pending',
  },
  {
    id: 'et-4',
    entityId: 'ent-sales',
    title: 'Follow up with NAIA conference leads',
    assignee: 'Dan Pearson',
    dueDate: '2026-02-20',
    priority: 'high',
    status: 'pending',
  },
  {
    id: 'et-5',
    entityId: 'ent-marketing',
    title: 'Draft social media calendar for March',
    assignee: 'Sarah Okafor',
    dueDate: '2026-02-25',
    priority: 'medium',
    status: 'pending',
  },
  {
    id: 'et-6',
    entityId: 'ent-mlk-classic',
    title: 'Secure venue contract for 2027 event',
    assignee: 'Alex Morgan',
    dueDate: '2026-06-01',
    priority: 'medium',
    status: 'pending',
  },
  {
    id: 'et-7',
    entityId: 'ent-platform-v2',
    title: 'QA pass on Nexus voice assistant',
    assignee: 'Jessica Chen',
    dueDate: '2026-03-15',
    priority: 'medium',
    status: 'in-progress',
  },
  {
    id: 'et-8',
    entityId: 'ent-investor-relations',
    title: 'Update data room with Q4 financials',
    assignee: 'Nicole Torres',
    dueDate: '2026-02-18',
    priority: 'high',
    status: 'completed',
  },
  {
    id: 'et-9',
    entityId: 'ent-engineering',
    title: 'Migrate database to new cluster',
    assignee: 'Adewale Ogundimu',
    dueDate: '2026-03-30',
    priority: 'low',
    status: 'pending',
  },
  {
    id: 'et-10',
    entityId: 'ent-product',
    title: 'User testing sessions for onboarding flow',
    assignee: 'Jessica Chen',
    dueDate: '2026-03-10',
    priority: 'medium',
    status: 'pending',
  },
];

// =============================================================================
// ENTITY OPPORTUNITIES
// =============================================================================

export const ENTITY_OPPORTUNITIES: EntityOpportunity[] = [
  {
    id: 'eo-1',
    entityId: 'ent-sales',
    title: 'Frontier Conference Package',
    value: 85000,
    stage: 'negotiation',
    contact: 'Dr. James Carter',
    closeDate: '2026-03-15',
  },
  {
    id: 'eo-2',
    entityId: 'ent-sales',
    title: 'NAIA Institutional License (Pilot)',
    value: 150000,
    stage: 'proposal',
    contact: 'Linda Park',
    closeDate: '2026-04-30',
  },
  {
    id: 'eo-3',
    entityId: 'ent-sales',
    title: 'Mega Church Platform Deal',
    value: 60000,
    stage: 'qualified',
    contact: 'Pastor Michael Eze',
    closeDate: '2026-05-15',
  },
  {
    id: 'eo-4',
    entityId: 'ent-sales',
    title: 'Valuetainment School District License',
    value: 200000,
    stage: 'prospect',
    contact: 'Dr. Angela Thomas',
    closeDate: '2026-07-01',
  },
  {
    id: 'eo-5',
    entityId: 'ent-investor-relations',
    title: 'Seed Extension — Angel Group',
    value: 500000,
    stage: 'closed-won',
    contact: 'Robert Kim',
    closeDate: '2026-01-31',
  },
  {
    id: 'eo-6',
    entityId: 'ent-sales',
    title: 'Community Rec League Package',
    value: 25000,
    stage: 'closed-lost',
    contact: 'David Martinez',
    closeDate: '2026-01-15',
  },
];

// =============================================================================
// ENTITY CONTACTS
// =============================================================================

export const ENTITY_CONTACTS: EntityContact[] = [
  {
    id: 'ec-1',
    entityId: 'ent-kanext',
    name: 'Alex Morgan',
    initials: 'AM',
    role: 'Founder & CEO',
    email: 'sammy@valuetainment.com',
    phone: '(310) 555-0100',
  },
  {
    id: 'ec-2',
    entityId: 'ent-product',
    name: 'Jessica Chen',
    initials: 'JC',
    role: 'VP Product',
    email: 'jessica@valuetainment.com',
  },
  {
    id: 'ec-3',
    entityId: 'ent-engineering',
    name: 'Adewale Ogundimu',
    initials: 'AO',
    role: 'CTO',
    email: 'adewale@valuetainment.com',
    phone: '(310) 555-0103',
  },
  {
    id: 'ec-4',
    entityId: 'ent-sales',
    name: 'Dan Pearson',
    initials: 'MW',
    role: 'VP Sales',
    email: 'marcus@valuetainment.com',
  },
  {
    id: 'ec-5',
    entityId: 'ent-marketing',
    name: 'Sarah Okafor',
    initials: 'SO',
    role: 'Marketing Lead',
    email: 'sarah@valuetainment.com',
  },
  {
    id: 'ec-6',
    entityId: 'ent-investor-relations',
    name: 'Nicole Torres',
    initials: 'NT',
    role: 'IR Manager',
    email: 'nicole@valuetainment.com',
    phone: '(310) 555-0106',
  },
  {
    id: 'ec-7',
    entityId: 'ent-kanext',
    name: 'Robert Kim',
    initials: 'RK',
    role: 'Angel Investor / Advisor',
    email: 'robert@kimeq.com',
  },
  {
    id: 'ec-8',
    entityId: 'ent-kanext',
    name: 'Dr. James Carter',
    initials: 'JC',
    role: 'Carroll Athletic Director',
    email: 'jcarter@carroll.edu',
    phone: '(803) 555-0200',
  },
];

// =============================================================================
// HELPERS
// =============================================================================

export function getEntityById(id: string): Entity | undefined {
  return ENTITIES.find((e) => e.id === id);
}

export function getProjectsForEntity(entityId: string): EntityProject[] {
  return ENTITY_PROJECTS.filter((p) => p.entityId === entityId);
}

export function getTasksForEntity(entityId: string): EntityTask[] {
  return ENTITY_TASKS.filter((t) => t.entityId === entityId);
}

export function getOpportunitiesForEntity(entityId: string): EntityOpportunity[] {
  return ENTITY_OPPORTUNITIES.filter((o) => o.entityId === entityId);
}

export function getContactsForEntity(entityId: string): EntityContact[] {
  return ENTITY_CONTACTS.filter((c) => c.entityId === entityId);
}

export function getEntitiesByType(type: Entity['type']): Entity[] {
  return ENTITIES.filter((e) => e.type === type);
}
