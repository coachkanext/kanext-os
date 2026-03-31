/**
 * Mock data for Business Mode Row 2 — KaNeXT Operations LLC.
 * Hub (Overview/Projects/Reports), Team, Inquiries, Store/Revenue.
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type EmployeeStatus = 'active' | 'remote' | 'pto' | 'contractor';
export type DepartmentId   = 'leadership' | 'product' | 'engineering' | 'operations' | 'growth';
export type ProjectStatus  = 'active' | 'planning' | 'on-hold' | 'completed';
export type TaskStatus     = 'todo' | 'in-progress' | 'review' | 'done';
export type DealStage      = 'New' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
export type InvoiceStatus  = 'draft' | 'sent' | 'paid' | 'overdue';
export type ProductType    = 'physical' | 'digital' | 'service' | 'subscription';
export type CampaignType   = 'email' | 'event' | 'social' | 'paid' | 'phone' | 'text' | 'digital';

export interface Employee {
  id: string; name: string; initials: string; hue: number;
  title: string; department: DepartmentId; status: EmployeeStatus;
  email: string; phone: string; location: string; startDate: string;
  manager?: string; ptoBalance: number; projectIds: string[];
  salary?: number; isNew?: boolean;
}

export interface Department {
  id: DepartmentId; name: string; headId: string; memberCount: number;
  color: string; icon: string; budget: number; spent: number;
}

export interface ProjectTask {
  id: string; title: string; assigneeId: string; status: TaskStatus;
  priority: 'high' | 'medium' | 'low'; dueDate: string;
}

export interface Project {
  id: string; name: string; description: string; status: ProjectStatus;
  progress: number; ownerId: string; teamIds: string[];
  startDate: string; endDate: string; tasks: ProjectTask[]; department: DepartmentId;
}

export interface Deal {
  id: string; title: string; contactId: string; company: string;
  value: number; stage: DealStage; probability: number;
  expectedClose: string; lastActivity: string; assigneeId: string; notes: string;
}

export interface BizContact {
  id: string; name: string; initials: string; hue: number;
  company: string; title: string; email: string; phone: string;
  dealIds: string[]; isClient: boolean; addedDate: string;
}

export interface Campaign {
  id: string; name: string; type: CampaignType; status: 'active' | 'draft' | 'completed';
  startDate: string; endDate?: string;
  sent?: number; opened?: number; replied?: number;
  calls?: number; meetings?: number;
  impressions?: number; connections?: number;
  registered?: number; converted?: number; conferences?: number; upcoming?: number;
  target: number; description: string;
  lastActivity?: string; assigneeId?: string; nextAction?: string;
}

export interface Product {
  id: string; name: string; type: ProductType; price: number;
  unitsSold: number; inventory?: number; revenue: number;
  icon: string; description: string; isActive: boolean;
}

export interface InvoiceLine {
  id: string; description: string; qty: number; unitPrice: number; total: number;
}

export interface Invoice {
  id: string; number: string; contactId: string; company: string;
  status: InvoiceStatus; issueDate: string; dueDate: string;
  lines: InvoiceLine[]; total: number; notes?: string;
}

export interface BizTransaction {
  id: string; date: string; description: string; amount: number;
  type: 'income' | 'expense'; category: string;
}

export interface RevenueTrend {
  month: string; revenue: number; expenses: number;
}

export interface ActivityEntry {
  id: string; type: 'deal' | 'invoice' | 'project' | 'team' | 'campaign';
  title: string; subtitle: string; time: string; icon: string;
}

// ── Employees (13) ─────────────────────────────────────────────────────────────

export const EMPLOYEES: Employee[] = [
  { id:'e01', name:'Sammy Karriem',   initials:'SK', hue:200, title:'CEO & Founder',              department:'leadership',  status:'active',     email:'sammy@kanext.com',          phone:'+1 (850) 555-0101', location:'Tallahassee, FL', startDate:'2022-01-01', ptoBalance:18, projectIds:['proj1','proj2','proj5'], salary:120000 },
  { id:'e02', name:'Marcus Webb',     initials:'MW', hue:140, title:'Head of Product',            department:'product',     status:'active',     email:'marcus@kanext.com',         phone:'+1 (850) 555-0102', location:'Tallahassee, FL', startDate:'2022-06-15', manager:'e01', ptoBalance:12, projectIds:['proj1','proj3'], salary:95000 },
  { id:'e03', name:'Deja Collins',    initials:'DC', hue:300, title:'Head of Engineering',        department:'engineering', status:'active',     email:'deja@kanext.com',           phone:'+1 (850) 555-0103', location:'Atlanta, GA',      startDate:'2022-08-01', manager:'e01', ptoBalance:15, projectIds:['proj1','proj4'], salary:105000 },
  { id:'e04', name:'Tyler Okafor',    initials:'TO', hue:30,  title:'Head of Growth',             department:'growth',      status:'active',     email:'tyler@kanext.com',          phone:'+1 (850) 555-0104', location:'Miami, FL',        startDate:'2023-01-10', manager:'e01', ptoBalance:10, projectIds:['proj3','proj5'], salary:88000 },
  { id:'e05', name:'Aisha Brooks',    initials:'AB', hue:60,  title:'Senior Product Designer',    department:'product',     status:'active',     email:'aisha@kanext.com',          phone:'+1 (850) 555-0105', location:'Tallahassee, FL', startDate:'2023-03-20', manager:'e02', ptoBalance:8,  projectIds:['proj1','proj2'], salary:80000 },
  { id:'e06', name:'Jordan Lee',      initials:'JL', hue:180, title:'Full Stack Engineer',        department:'engineering', status:'remote',     email:'jordan@kanext.com',         phone:'+1 (850) 555-0106', location:'Austin, TX',       startDate:'2023-05-01', manager:'e03', ptoBalance:9,  projectIds:['proj1','proj4'], salary:92000 },
  { id:'e07', name:'Priya Nair',      initials:'PN', hue:240, title:'iOS Engineer',               department:'engineering', status:'active',     email:'priya@kanext.com',          phone:'+1 (850) 555-0107', location:'Tallahassee, FL', startDate:'2023-07-15', manager:'e03', ptoBalance:11, projectIds:['proj1'],         salary:90000 },
  { id:'e08', name:'Kofi Mensah',     initials:'KM', hue:100, title:'Operations Manager',         department:'operations',  status:'active',     email:'kofi@kanext.com',           phone:'+1 (850) 555-0108', location:'Tallahassee, FL', startDate:'2023-02-01', manager:'e01', ptoBalance:14, projectIds:['proj2','proj5'], salary:75000 },
  { id:'e09', name:'Brianna Fox',     initials:'BF', hue:340, title:'Growth Marketer',            department:'growth',      status:'pto',        email:'brianna@kanext.com',        phone:'+1 (850) 555-0109', location:'Orlando, FL',      startDate:'2023-09-01', manager:'e04', ptoBalance:3,  projectIds:['proj3'],         salary:68000 },
  { id:'e10', name:'Miles Grant',     initials:'MG', hue:270, title:'Content Creator',            department:'growth',      status:'active',     email:'miles@kanext.com',          phone:'+1 (850) 555-0110', location:'Jacksonville, FL', startDate:'2023-11-15', manager:'e04', ptoBalance:12, projectIds:['proj3','proj5'], salary:62000, isNew:true },
  { id:'e11', name:'Zara Patel',      initials:'ZP', hue:20,  title:'Backend Engineer',           department:'engineering', status:'remote',     email:'zara@kanext.com',           phone:'+1 (850) 555-0111', location:'Tampa, FL',        startDate:'2024-01-08', manager:'e03', ptoBalance:14, projectIds:['proj1','proj4'], salary:88000, isNew:true },
  { id:'e12', name:'Chris Duval',     initials:'CD', hue:160, title:'UX Researcher (Contract)',   department:'product',     status:'contractor', email:'chris@freelance.com',       phone:'+1 (850) 555-0112', location:'Remote',           startDate:'2024-02-01', manager:'e02', ptoBalance:0,  projectIds:['proj2'] },
  { id:'e13', name:'Nadia Russo',     initials:'NR', hue:50,  title:'Biz Dev Consultant (Contract)', department:'growth',  status:'contractor', email:'nadia@consulting.co',       phone:'+1 (850) 555-0113', location:'Remote',           startDate:'2024-02-15', manager:'e04', ptoBalance:0,  projectIds:['proj5'] },
];

// ── Departments (5) ────────────────────────────────────────────────────────────

export const DEPARTMENTS: Department[] = [
  { id:'leadership',  name:'Leadership',  headId:'e01', memberCount:1, color:'#1A1714', icon:'star.fill',                      budget:150000, spent:120000 },
  { id:'product',     name:'Product',     headId:'e02', memberCount:3, color:'#D97757', icon:'square.grid.2x2.fill',           budget:280000, spent:195000 },
  { id:'engineering', name:'Engineering', headId:'e03', memberCount:4, color:'#5A8A6E', icon:'hammer.fill',                    budget:450000, spent:310000 },
  { id:'operations',  name:'Operations',  headId:'e08', memberCount:1, color:'#1A1714', icon:'gearshape.fill',                 budget:120000, spent:88000 },
  { id:'growth',      name:'Growth',      headId:'e04', memberCount:4, color:'#B85C5C', icon:'chart.line.uptrend.xyaxis',      budget:200000, spent:142000 },
];

// ── Projects (5) ───────────────────────────────────────────────────────────────

export const PROJECTS: Project[] = [
  {
    id:'proj1', name:'KaNeXT OS V2 Launch', progress:72,
    description:'Full platform release with Business, Education, Community modes.',
    status:'active', ownerId:'e01', teamIds:['e01','e02','e03','e05','e06','e07','e11'],
    department:'engineering', startDate:'2025-10-01', endDate:'2026-06-30',
    tasks:[
      { id:'t1a', title:'Finalize Business Mode screens', assigneeId:'e05', status:'in-progress', priority:'high', dueDate:'2026-03-31' },
      { id:'t1b', title:'API integration for Hub',        assigneeId:'e06', status:'review',       priority:'high', dueDate:'2026-04-05' },
      { id:'t1c', title:'iOS performance pass',           assigneeId:'e07', status:'todo',         priority:'medium', dueDate:'2026-04-15' },
      { id:'t1d', title:'Backend auth migration',         assigneeId:'e11', status:'done',         priority:'high', dueDate:'2026-03-20' },
    ],
  },
  {
    id:'proj2', name:'Investor Deck Q2', progress:45,
    description:'Q2 2026 fundraising materials and financial model update.',
    status:'active', ownerId:'e01', teamIds:['e01','e08','e12'],
    department:'leadership', startDate:'2026-02-01', endDate:'2026-04-30',
    tasks:[
      { id:'t2a', title:'Update financial projections', assigneeId:'e08', status:'in-progress', priority:'high', dueDate:'2026-04-01' },
      { id:'t2b', title:'UX research summary',           assigneeId:'e12', status:'review',       priority:'medium', dueDate:'2026-03-28' },
      { id:'t2c', title:'Slide deck design',             assigneeId:'e05', status:'todo',         priority:'high', dueDate:'2026-04-10' },
    ],
  },
  {
    id:'proj3', name:'Mandate Outreach \u2014 NAIA', progress:60,
    description:'Campaign to acquire NAIA school mandates for KaNeXT Sports.',
    status:'active', ownerId:'e04', teamIds:['e04','e09','e10','e13'],
    department:'growth', startDate:'2026-01-15', endDate:'2026-05-31',
    tasks:[
      { id:'t3a', title:'Contact outreach list',   assigneeId:'e09', status:'done',         priority:'high', dueDate:'2026-02-28' },
      { id:'t3b', title:'Demo video series',        assigneeId:'e10', status:'in-progress', priority:'medium', dueDate:'2026-04-01' },
      { id:'t3c', title:'Conference follow-ups',    assigneeId:'e13', status:'todo',         priority:'high', dueDate:'2026-04-20' },
    ],
  },
  {
    id:'proj4', name:'Camera Hardware Production', progress:15,
    description:'Manufacturing partnership for KaNeXT Sport Camera line.',
    status:'planning', ownerId:'e03', teamIds:['e03','e06','e11'],
    department:'engineering', startDate:'2026-03-01', endDate:'2026-12-31',
    tasks:[
      { id:'t4a', title:'Vendor RFQ',         assigneeId:'e03', status:'in-progress', priority:'high', dueDate:'2026-04-15' },
      { id:'t4b', title:'Firmware spec v1',   assigneeId:'e11', status:'todo',         priority:'medium', dueDate:'2026-05-01' },
    ],
  },
  {
    id:'proj5', name:'FMU IOA Execution', progress:85,
    description:'Florida Memorial University implementation and onboarding.',
    status:'active', ownerId:'e04', teamIds:['e04','e08','e10','e13'],
    department:'operations', startDate:'2025-11-01', endDate:'2026-04-15',
    tasks:[
      { id:'t5a', title:'Admin portal setup',     assigneeId:'e08', status:'done',         priority:'high', dueDate:'2026-02-28' },
      { id:'t5b', title:'Staff training sessions', assigneeId:'e10', status:'done',        priority:'medium', dueDate:'2026-03-15' },
      { id:'t5c', title:'Go-live review',          assigneeId:'e13', status:'in-progress', priority:'high', dueDate:'2026-04-10' },
    ],
  },
];

// ── Deals (15) ─────────────────────────────────────────────────────────────────

export const DEALS: Deal[] = [
  { id:'d01', title:'FAMU Athletics Platform',    contactId:'c01', company:'Florida A&M University',        value:48000, stage:'Negotiation', probability:75, expectedClose:'2026-04-15', lastActivity:'2026-03-24', assigneeId:'e04', notes:'AD meeting confirmed for next week.' },
  { id:'d02', title:'Bethune-Cookman License',    contactId:'c02', company:'Bethune-Cookman University',   value:36000, stage:'Proposal',     probability:50, expectedClose:'2026-05-01', lastActivity:'2026-03-20', assigneeId:'e13', notes:'Proposal sent, awaiting review.' },
  { id:'d03', title:'Edward Waters Camera Deal',  contactId:'c03', company:'Edward Waters University',     value:12500, stage:'Qualified',    probability:25, expectedClose:'2026-05-30', lastActivity:'2026-03-18', assigneeId:'e04', notes:'Follow up after spring break.' },
  { id:'d04', title:'Savannah State Sports Suite',contactId:'c04', company:'Savannah State University',    value:55000, stage:'Negotiation', probability:70, expectedClose:'2026-04-30', lastActivity:'2026-03-25', assigneeId:'e04', notes:'Legal reviewing contract terms.' },
  { id:'d05', title:'Lane College Mandate',       contactId:'c05', company:'Lane College',                 value:28000, stage:'New',          probability:10, expectedClose:'2026-06-30', lastActivity:'2026-03-15', assigneeId:'e13', notes:'Initial contact via referral.' },
  { id:'d06', title:'Tuskegee University Bundle', contactId:'c06', company:'Tuskegee University',          value:62000, stage:'Proposal',     probability:50, expectedClose:'2026-05-15', lastActivity:'2026-03-22', assigneeId:'e04', notes:'Multi-sport bundle proposed.' },
  { id:'d07', title:'Alcorn State Cameras',       contactId:'c07', company:'Alcorn State University',      value:18000, stage:'Qualified',    probability:30, expectedClose:'2026-06-15', lastActivity:'2026-03-10', assigneeId:'e13', notes:'Demo scheduled for April.' },
  { id:'d08', title:'FMU Full Platform',          contactId:'c08', company:'Florida Memorial University',  value:42000, stage:'Won',          probability:100,expectedClose:'2026-03-01', lastActivity:'2026-03-01', assigneeId:'e04', notes:'Contract signed. Onboarding active.' },
  { id:'d09', title:'LeMoyne-Owen Pilot',         contactId:'c09', company:'LeMoyne-Owen College',         value:8500,  stage:'New',          probability:10, expectedClose:'2026-07-01', lastActivity:'2026-03-12', assigneeId:'e13', notes:'Intro call done.' },
  { id:'d10', title:'Prairie View A&M',           contactId:'c10', company:'Prairie View A&M',             value:72000, stage:'Negotiation', probability:65, expectedClose:'2026-04-20', lastActivity:'2026-03-23', assigneeId:'e04', notes:'Revised pricing under review.' },
  { id:'d11', title:'SUNO Athletics',             contactId:'c01', company:'Southern Univ New Orleans',    value:22000, stage:'Proposal',     probability:45, expectedClose:'2026-05-20', lastActivity:'2026-03-19', assigneeId:'e13', notes:'Sent pitch deck v2.' },
  { id:'d12', title:'Grambling State Cameras',    contactId:'c02', company:'Grambling State University',   value:31500, stage:'Won',          probability:100,expectedClose:'2026-02-28', lastActivity:'2026-02-28', assigneeId:'e04', notes:'Paid in full.' },
  { id:'d13', title:'Morehouse College Pilot',    contactId:'c03', company:'Morehouse College',            value:14000, stage:'Lost',         probability:0,  expectedClose:'2026-03-01', lastActivity:'2026-03-01', assigneeId:'e13', notes:'Went with competitor.' },
  { id:'d14', title:'Spelman College Media',      contactId:'c04', company:'Spelman College',              value:19000, stage:'Qualified',    probability:25, expectedClose:'2026-06-01', lastActivity:'2026-03-16', assigneeId:'e04', notes:'Interest in media module only.' },
  { id:'d15', title:'Clark Atlanta Bundle',       contactId:'c05', company:'Clark Atlanta University',     value:44000, stage:'Lost',         probability:0,  expectedClose:'2026-02-15', lastActivity:'2026-02-15', assigneeId:'e13', notes:'Budget cut for FY26.' },
];

// ── Contacts (10) ──────────────────────────────────────────────────────────────

export const BIZ_CONTACTS: BizContact[] = [
  { id:'c01', name:'Marcus Thompson', initials:'MT', hue:200, company:'Florida A&M University',       title:'Athletic Director',    email:'m.thompson@famu.edu',           phone:'+1 (850) 555-2001', dealIds:['d01','d11'], isClient:false, addedDate:'2025-12-01' },
  { id:'c02', name:'Sandra Ellis',    initials:'SE', hue:140, company:'Bethune-Cookman University',   title:'VP Athletics',         email:'s.ellis@bcu.edu',               phone:'+1 (386) 555-2002', dealIds:['d02','d12'], isClient:true,  addedDate:'2025-11-15' },
  { id:'c03', name:'James Porter',    initials:'JP', hue:30,  company:'Edward Waters University',     title:'Sports Director',      email:'j.porter@ewu.edu',              phone:'+1 (904) 555-2003', dealIds:['d03','d13'], isClient:false, addedDate:'2026-01-10' },
  { id:'c04', name:'Denise Hamilton', initials:'DH', hue:300, company:'Savannah State University',    title:'Athletic Director',    email:'d.hamilton@savannahstate.edu',  phone:'+1 (912) 555-2004', dealIds:['d04','d14'], isClient:false, addedDate:'2025-10-20' },
  { id:'c05', name:'Robert King',     initials:'RK', hue:60,  company:'Lane College',                 title:'AD & Coach',           email:'r.king@lane.edu',               phone:'+1 (731) 555-2005', dealIds:['d05','d15'], isClient:false, addedDate:'2026-02-01' },
  { id:'c06', name:'Victoria James',  initials:'VJ', hue:180, company:'Tuskegee University',          title:'Director of Athletics', email:'v.james@tuskegee.edu',         phone:'+1 (334) 555-2006', dealIds:['d06'],       isClient:false, addedDate:'2026-01-25' },
  { id:'c07', name:'Anthony Bell',    initials:'AB', hue:240, company:'Alcorn State University',      title:'Athletics Coordinator',email:'a.bell@alcorn.edu',             phone:'+1 (601) 555-2007', dealIds:['d07'],       isClient:false, addedDate:'2026-02-10' },
  { id:'c08', name:'Patricia Monroe', initials:'PM', hue:100, company:'Florida Memorial University',  title:'President',            email:'p.monroe@fmuniv.edu',           phone:'+1 (305) 555-2008', dealIds:['d08'],       isClient:true,  addedDate:'2025-09-15' },
  { id:'c09', name:'Kevin Shaw',      initials:'KS', hue:340, company:'LeMoyne-Owen College',         title:'Athletic Director',    email:'k.shaw@loc.edu',                phone:'+1 (901) 555-2009', dealIds:['d09'],       isClient:false, addedDate:'2026-03-01' },
  { id:'c10', name:'Linda Washington',initials:'LW', hue:270, company:'Prairie View A&M',             title:'VP External Affairs',  email:'l.washington@pvamu.edu',        phone:'+1 (936) 555-2010', dealIds:['d10'],       isClient:false, addedDate:'2025-12-20' },
];

// ── Campaigns (7) ──────────────────────────────────────────────────────────────

export const CAMPAIGNS: Campaign[] = [
  { id:'camp1', name:'NAIA Mandate Outreach',        type:'email',   status:'active',    startDate:'2026-02-01', endDate:'2026-05-01', sent:200, opened:45,  replied:12, target:20, description:'Email sequence targeting NAIA AD contacts to secure KaNeXT OS mandates.',          lastActivity:'2026-03-24', assigneeId:'e09', nextAction:'Send batch #4 — Mar 30' },
  { id:'camp2', name:'Investor Webinar Series',      type:'event',   status:'active',    startDate:'2026-03-01',                       registered:85, converted:3, target:10,         description:'Monthly investor-facing webinars demonstrating platform growth metrics.',           lastActivity:'2026-03-20', assigneeId:'e13', nextAction:'Q2 Webinar — Apr 5' },
  { id:'camp3', name:'School Network Cold Outreach', type:'email',   status:'active',    startDate:'2026-03-01', endDate:'2026-04-15', sent:150, opened:18,  replied:4,  target:15, description:'Cold email sequence targeting AD networks at non-NAIA partner schools.',            lastActivity:'2026-03-24', assigneeId:'e09', nextAction:'Follow-up batch — Mar 28' },
  { id:'camp4', name:'Governing Body Direct',        type:'phone',   status:'active',    startDate:'2026-03-10',                       calls:6,  meetings:3,             target:8,  description:'Direct phone outreach to NAIA governing body officials to discuss mandates.',       lastActivity:'2026-03-25', assigneeId:'e04', nextAction:'Call NAIA VP — Mar 27' },
  { id:'camp5', name:'Minnect Outreach',             type:'text',    status:'active',    startDate:'2026-03-15', endDate:'2026-04-30', sent:18,  replied:8,              target:25, description:'Text-based outreach via Minnect contact list to warm leads and existing network.', lastActivity:'2026-03-23', assigneeId:'e10', nextAction:'Follow-up batch — Mar 27 (9 AM)' },
  { id:'camp6', name:'LinkedIn Investor Campaign',   type:'digital', status:'active',    startDate:'2026-03-01', endDate:'2026-05-01', impressions:500, connections:12,   target:30, description:'LinkedIn sponsored content and direct DMs targeting accredited investors.',        lastActivity:'2026-03-26', assigneeId:'e13', nextAction:'Post product update — Mar 28' },
  { id:'camp7', name:'Conference Demo Tour',         type:'event',   status:'completed', startDate:'2026-02-15', endDate:'2026-06-30', conferences:3, upcoming:2, converted:1, target:5, description:'Live platform demos at athletics and investor conferences nationwide.',           lastActivity:'2026-03-20', assigneeId:'e04', nextAction:'NAIA Convention — Apr 10' },
];

// ── Products (6) ───────────────────────────────────────────────────────────────

export const PRODUCTS: Product[] = [
  { id:'p01', name:'KaNeXT Camera Sport',        type:'physical',     price:200,  unitsSold:45, inventory:120, revenue:9000,  icon:'camera.fill',              description:'Entry-level sport camera for HBCU athletics.', isActive:true },
  { id:'p02', name:'Camera Sport+',              type:'physical',     price:500,  unitsSold:12, inventory:34,  revenue:6000,  icon:'camera.aperture',          description:'Pro-grade sport camera with 4K livestream.', isActive:true },
  { id:'p03', name:'Pro Camera',                 type:'physical',     price:999,  unitsSold:3,  inventory:8,   revenue:2997,  icon:'camera.on.rectangle.fill', description:'Broadcast-quality HD camera system.', isActive:true },
  { id:'p04', name:'Platform License (Annual)',  type:'subscription', price:1200, unitsSold:8,               revenue:9600,  icon:'server.rack',              description:'Full KaNeXT OS institution license, annual.', isActive:true },
  { id:'p05', name:'Consulting Package',         type:'service',      price:5000, unitsSold:4,               revenue:20000, icon:'person.2.fill',            description:'On-site implementation and strategy consulting.', isActive:true },
  { id:'p06', name:'Developer API',              type:'subscription', price:99,   unitsSold:15,              revenue:1485,  icon:'curlybraces',              description:'API access for third-party integrations.', isActive:true },
];

// ── Invoices (8) ───────────────────────────────────────────────────────────────

export const INVOICES: Invoice[] = [
  { id:'inv01', number:'INV-2026-001', contactId:'c08', company:'Florida Memorial University',  status:'paid',    issueDate:'2026-02-15', dueDate:'2026-03-15', total:42000, lines:[{ id:'l1', description:'Platform License \u2014 Annual', qty:1, unitPrice:36000, total:36000 },{ id:'l2', description:'Onboarding & Setup', qty:1, unitPrice:6000, total:6000 }], notes:'Paid via wire transfer.' },
  { id:'inv02', number:'INV-2026-002', contactId:'c02', company:'Grambling State University',   status:'paid',    issueDate:'2026-02-20', dueDate:'2026-03-20', total:31500, lines:[{ id:'l1', description:'KaNeXT Camera Sport x3', qty:3, unitPrice:200, total:600 },{ id:'l2', description:'Platform License \u2014 Annual', qty:1, unitPrice:30900, total:30900 }] },
  { id:'inv03', number:'INV-2026-003', contactId:'c01', company:'Florida A&M University',       status:'sent',    issueDate:'2026-03-01', dueDate:'2026-04-01', total:5000,  lines:[{ id:'l1', description:'Consulting Package', qty:1, unitPrice:5000, total:5000 }], notes:'Awaiting PO approval.' },
  { id:'inv04', number:'INV-2026-004', contactId:'c04', company:'Savannah State University',    status:'overdue', issueDate:'2026-02-01', dueDate:'2026-03-01', total:2400,  lines:[{ id:'l1', description:'Developer API \u2014 2 months', qty:2, unitPrice:99, total:198 },{ id:'l2', description:'Camera Sport+ x4', qty:4, unitPrice:500, total:2000 },{ id:'l3', description:'Shipping', qty:1, unitPrice:202, total:202 }], notes:'28 days overdue. Send reminder.' },
  { id:'inv05', number:'INV-2026-005', contactId:'c06', company:'Tuskegee University',          status:'sent',    issueDate:'2026-03-10', dueDate:'2026-04-10', total:999,   lines:[{ id:'l1', description:'Pro Camera', qty:1, unitPrice:999, total:999 }] },
  { id:'inv06', number:'INV-2026-006', contactId:'c10', company:'Prairie View A&M',             status:'overdue', issueDate:'2026-01-20', dueDate:'2026-02-20', total:14400, lines:[{ id:'l1', description:'Platform License \u2014 Annual', qty:1, unitPrice:14400, total:14400 }], notes:'35 days overdue. Escalate.' },
  { id:'inv07', number:'INV-2026-007', contactId:'c03', company:'Edward Waters University',     status:'draft',   issueDate:'2026-03-25', dueDate:'2026-04-25', total:1200,  lines:[{ id:'l1', description:'Developer API \u2014 Annual Prepay', qty:1, unitPrice:1200, total:1200 }] },
  { id:'inv08', number:'INV-2026-008', contactId:'c07', company:'Alcorn State University',      status:'draft',   issueDate:'2026-03-26', dueDate:'2026-04-26', total:6000,  lines:[{ id:'l1', description:'KaNeXT Camera Sport x10', qty:10, unitPrice:200, total:2000 },{ id:'l2', description:'Installation & Config', qty:1, unitPrice:4000, total:4000 }] },
];

// ── Revenue Trend (12 months) ──────────────────────────────────────────────────

export const REVENUE_TREND: RevenueTrend[] = [
  { month:'Apr', revenue:8200,  expenses:6100  },
  { month:'May', revenue:11500, expenses:7800  },
  { month:'Jun', revenue:9400,  expenses:6900  },
  { month:'Jul', revenue:12800, expenses:8200  },
  { month:'Aug', revenue:14200, expenses:9100  },
  { month:'Sep', revenue:18600, expenses:10400 },
  { month:'Oct', revenue:22100, expenses:11800 },
  { month:'Nov', revenue:19800, expenses:12200 },
  { month:'Dec', revenue:31200, expenses:14600 },
  { month:'Jan', revenue:24500, expenses:13100 },
  { month:'Feb', revenue:73500, expenses:16800 },
  { month:'Mar', revenue:49200, expenses:18400 },
];

// ── Activity Feed (12) ─────────────────────────────────────────────────────────

export const ACTIVITY_FEED: ActivityEntry[] = [
  { id:'a01', type:'deal',     title:'Deal Closed \u2014 FMU',    subtitle:'Platform deal signed, $42K',   time:'2h ago',  icon:'checkmark.seal.fill' },
  { id:'a02', type:'invoice',  title:'Invoice Paid',              subtitle:'INV-2026-001 \u00B7 $42,000', time:'3h ago',  icon:'dollarsign.circle.fill' },
  { id:'a03', type:'project',  title:'Task Completed',            subtitle:'Backend auth migration done',  time:'5h ago',  icon:'checkmark.circle.fill' },
  { id:'a04', type:'team',     title:'New Hire Started',          subtitle:'Zara Patel \u2014 Backend Engineer', time:'1d ago', icon:'person.fill.badge.plus' },
  { id:'a05', type:'deal',     title:'Proposal Sent',             subtitle:'Bethune-Cookman \u00B7 $36K', time:'1d ago',  icon:'doc.text.fill' },
  { id:'a06', type:'campaign', title:'Campaign Update',           subtitle:'12 replies on NAIA Outreach', time:'2d ago',  icon:'envelope.fill' },
  { id:'a07', type:'invoice',  title:'Invoice Overdue',           subtitle:'INV-2026-006 \u00B7 $14,400 \u00B7 35d', time:'2d ago', icon:'exclamationmark.circle.fill' },
  { id:'a08', type:'deal',     title:'New Deal Added',            subtitle:'Lane College \u00B7 $28K',    time:'3d ago',  icon:'plus.circle.fill' },
  { id:'a09', type:'project',  title:'Project Milestone',         subtitle:'FMU IOA Execution \u2014 85%', time:'3d ago', icon:'flag.fill' },
  { id:'a10', type:'deal',     title:'Deal Moved to Negotiation', subtitle:'Prairie View A&M \u00B7 $72K', time:'4d ago', icon:'arrow.right.circle.fill' },
  { id:'a11', type:'team',     title:'New Hire Started',          subtitle:'Miles Grant \u2014 Content Creator', time:'5d ago', icon:'person.fill.badge.plus' },
  { id:'a12', type:'invoice',  title:'Invoice Sent',              subtitle:'INV-2026-003 \u00B7 $5,000', time:'6d ago',  icon:'paperplane.fill' },
];

// ── Business Dashboard ─────────────────────────────────────────────────────────

export const BIZ_DASHBOARD = {
  thisMonth:  { revenue:49200, expenses:18400, profit:30800, newDeals:3, closedDeals:1, invoicesSent:4 },
  thisYear:   { revenue:294000, expenses:134600, profit:159400, newDeals:15, closedDeals:2 },
  pipeline:   { totalValue:413000, dealCount:13, closingSoon:3 },
  teamPulse:  { activeToday:10, onPTO:1, contractors:2, openings:1 },
};

// ── Recent Transactions ────────────────────────────────────────────────────────

export const RECENT_TRANSACTIONS: BizTransaction[] = [
  { id:'tx01', date:'2026-03-24', description:'FMU Platform License Payment',  amount:42000,  type:'income',  category:'Platform License' },
  { id:'tx02', date:'2026-03-22', description:'AWS Infrastructure',            amount:-2840,  type:'expense', category:'Infrastructure' },
  { id:'tx03', date:'2026-03-20', description:'Grambling State Camera Deal',   amount:31500,  type:'income',  category:'Hardware' },
  { id:'tx04', date:'2026-03-18', description:'Payroll \u2014 March Cycle',    amount:-88400, type:'expense', category:'Payroll' },
  { id:'tx05', date:'2026-03-15', description:'Consulting Package \u2014 FAMU',amount:5000,   type:'income',  category:'Services' },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

export function formatCurrency(n: number, compact = false): string {
  if (compact) {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  }
  return `$${Math.abs(n).toLocaleString()}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month:'short', day:'numeric' });
}

export function stageColor(stage: DealStage): string {
  switch (stage) {
    case 'New':         return 'rgba(45,30,18,0.30)';
    case 'Qualified':   return '#1A1714';
    case 'Proposal':    return '#D97757';
    case 'Negotiation': return '#1A1714';
    case 'Won':         return '#5A8A6E';
    case 'Lost':        return '#B85C5C';
    default:            return 'rgba(45,30,18,0.30)';
  }
}

export function invoiceStatusColor(status: InvoiceStatus): string {
  switch (status) {
    case 'paid':    return '#5A8A6E';
    case 'sent':    return '#1A1714';
    case 'overdue': return '#B85C5C';
    default:        return 'rgba(45,30,18,0.30)';
  }
}

export function productTypeLabel(type: ProductType): string {
  switch (type) {
    case 'physical':     return 'Physical';
    case 'digital':      return 'Digital';
    case 'service':      return 'Service';
    case 'subscription': return 'Subscription';
    default:             return type;
  }
}

export function daysOverdue(dueDate: string): number {
  const today = new Date('2026-03-26');
  const due   = new Date(dueDate);
  return Math.max(0, Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));
}

export function dealPipelineValue(stage?: DealStage): number {
  const filtered = stage
    ? DEALS.filter(d => d.stage === stage)
    : DEALS.filter(d => d.stage !== 'Won' && d.stage !== 'Lost');
  return filtered.reduce((sum, d) => sum + d.value, 0);
}

export function getEmployeeById(id: string): Employee | undefined {
  return EMPLOYEES.find(e => e.id === id);
}

export function getContactById(id: string): BizContact | undefined {
  return BIZ_CONTACTS.find(c => c.id === id);
}

export function getDeptEmployees(deptId: DepartmentId): Employee[] {
  return EMPLOYEES.filter(e => e.department === deptId);
}

export function getProjectById(id: string): Project | undefined {
  return PROJECTS.find(p => p.id === id);
}
