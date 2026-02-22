/**
 * Competition Organization Sponsors v2 — Mock Data
 * Full dataset for the 10-tab Comp Org Sponsors Hub.
 */

// =============================================================================
// TYPES
// =============================================================================

export type CompSponsorsTabId =
  | 'dashboard'
  | 'sponsors'
  | 'packages'
  | 'activations'
  | 'contracts'
  | 'fulfillment'
  | 'assets'
  | 'revenue'
  | 'prospecting'
  | 'settings';

export interface CompSponsorsTab {
  id: CompSponsorsTabId;
  label: string;
  icon: string;
}

export interface SponsorsDashboardBlock {
  id: string;
  label: string;
  value: string;
  delta: string;
  icon: string;
  color: string;
}

export interface CompSponsor {
  id: string;
  name: string;
  tier: 'title' | 'gold' | 'silver' | 'bronze' | 'in-kind';
  status: 'active' | 'pending' | 'expired' | 'paused';
  annualValue: number;
  annualValueFormatted: string;
  contactName: string;
  contactEmail: string;
  startDate: string;
  endDate: string;
  logoPlaceholder: string;
  activationsCount: number;
  fulfillmentPct: number;
}

export interface SponsorPackage {
  id: string;
  name: string;
  tier: 'title' | 'gold' | 'silver' | 'bronze' | 'in-kind';
  price: string;
  priceValue: number;
  benefits: string[];
  maxSponsors: number;
  currentSponsors: number;
  status: 'available' | 'sold-out' | 'custom';
}

export interface Activation {
  id: string;
  name: string;
  sponsor: string;
  type: 'signage' | 'digital' | 'event' | 'product' | 'media' | 'naming-rights';
  status: 'active' | 'scheduled' | 'completed' | 'draft';
  startDate: string;
  endDate: string;
  impressions: string;
  series: string;
}

export interface SponsorContract {
  id: string;
  sponsor: string;
  tier: 'title' | 'gold' | 'silver' | 'bronze' | 'in-kind';
  status: 'active' | 'negotiation' | 'expired' | 'pending-renewal';
  totalValue: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  terms: string;
}

export interface FulfillmentItem {
  id: string;
  obligation: string;
  sponsor: string;
  status: 'completed' | 'in-progress' | 'overdue' | 'upcoming';
  dueDate: string;
  category: string;
  notes: string;
}

export interface SponsorAsset {
  id: string;
  name: string;
  type: 'logo' | 'banner' | 'video' | 'audio' | 'document' | 'social-media';
  sponsor: string;
  uploadDate: string;
  fileSize: string;
  status: 'approved' | 'pending' | 'rejected';
  usageCount: number;
}

export interface SponsorRevenue {
  id: string;
  period: string;
  sponsor: string;
  amount: string;
  amountValue: number;
  type: 'cash' | 'in-kind' | 'bonus' | 'renewal';
  status: 'received' | 'invoiced' | 'overdue' | 'projected';
  date: string;
}

export interface Prospect {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  stage: 'lead' | 'outreach' | 'meeting' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  estimatedValue: string;
  estimatedValueNum: number;
  industry: string;
  lastActivity: string;
  notes: string;
}

export interface SponsorSettingToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const COMP_SPONSORS_TABS: CompSponsorsTab[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'chart.bar.fill' },
  { id: 'sponsors', label: 'Sponsors', icon: 'building.2.fill' },
  { id: 'packages', label: 'Packages', icon: 'shippingbox.fill' },
  { id: 'activations', label: 'Activations', icon: 'bolt.fill' },
  { id: 'contracts', label: 'Contracts', icon: 'doc.text.fill' },
  { id: 'fulfillment', label: 'Fulfillment', icon: 'checkmark.seal.fill' },
  { id: 'assets', label: 'Assets', icon: 'photo.stack.fill' },
  { id: 'revenue', label: 'Revenue', icon: 'dollarsign.circle.fill' },
  { id: 'prospecting', label: 'Prospecting', icon: 'binoculars.fill' },
  { id: 'settings', label: 'Settings', icon: 'gear' },
];

export const COMP_SPONSORS_SCOPE_CHIPS = [
  'All Sponsors',
  'Title',
  'Gold',
  'Silver',
  'Bronze',
  'In-Kind',
];

// =============================================================================
// STATUS COLOR MAPS
// =============================================================================

export const TIER_COLOR: Record<CompSponsor['tier'], string> = {
  title: '#F59E0B',
  gold: '#F59E0B',
  silver: '#A1A1AA',
  bronze: '#1D9BF0',
  'in-kind': '#1D9BF0',
};

export const SPONSOR_STATUS_COLOR: Record<CompSponsor['status'], string> = {
  active: '#22C55E',
  pending: '#F59E0B',
  expired: '#EF4444',
  paused: '#A1A1AA',
};

export const ACTIVATION_STATUS_COLOR: Record<Activation['status'], string> = {
  active: '#22C55E',
  scheduled: '#1D9BF0',
  completed: '#A1A1AA',
  draft: '#A1A1AA',
};

export const CONTRACT_STATUS_COLOR: Record<SponsorContract['status'], string> = {
  active: '#22C55E',
  negotiation: '#F59E0B',
  expired: '#EF4444',
  'pending-renewal': '#1D9BF0',
};

export const FULFILLMENT_STATUS_COLOR: Record<FulfillmentItem['status'], string> = {
  completed: '#22C55E',
  'in-progress': '#1D9BF0',
  overdue: '#EF4444',
  upcoming: '#F59E0B',
};

export const PROSPECT_STAGE_COLOR: Record<Prospect['stage'], string> = {
  lead: '#A1A1AA',
  outreach: '#1D9BF0',
  meeting: '#F59E0B',
  proposal: '#1D9BF0',
  negotiation: '#F59E0B',
  'closed-won': '#22C55E',
  'closed-lost': '#EF4444',
};

// =============================================================================
// MOCK DATA GENERATOR
// =============================================================================

export function getCompSponsorsData(_scope: string) {
  // ── Dashboard ──
  const dashboard: SponsorsDashboardBlock[] = [
    { id: 'ds-1', label: 'Total Sponsors', value: '5', delta: '+1 this quarter', icon: 'building.2.fill', color: '#1D9BF0' },
    { id: 'ds-2', label: 'Annual Revenue', value: '$720K', delta: '+$95K vs last year', icon: 'dollarsign.circle.fill', color: '#22C55E' },
    { id: 'ds-3', label: 'Active Activations', value: '18', delta: '6 launching this month', icon: 'bolt.fill', color: '#F59E0B' },
    { id: 'ds-4', label: 'Fulfillment Rate', value: '87%', delta: '+4% from last quarter', icon: 'checkmark.seal.fill', color: '#1D9BF0' },
    { id: 'ds-5', label: 'Pipeline Value', value: '$340K', delta: '3 proposals pending', icon: 'binoculars.fill', color: '#EF4444' },
    { id: 'ds-6', label: 'Assets Delivered', value: '42', delta: '8 pending approval', icon: 'photo.stack.fill', color: '#1D9BF0' },
  ];

  const quickActions = [
    { id: 'qa-1', label: 'Add Sponsor', icon: 'plus.circle.fill', color: '#1D9BF0' },
    { id: 'qa-2', label: 'New Package', icon: 'shippingbox.fill', color: '#22C55E' },
    { id: 'qa-3', label: 'Create Activation', icon: 'bolt.fill', color: '#F59E0B' },
    { id: 'qa-4', label: 'Revenue Report', icon: 'chart.bar.fill', color: '#1D9BF0' },
    { id: 'qa-5', label: 'Send Invoice', icon: 'paperplane.fill', color: '#EF4444' },
    { id: 'qa-6', label: 'Upload Asset', icon: 'arrow.up.doc.fill', color: '#1D9BF0' },
  ];

  const recentActivity = [
    { id: 'ra-1', text: 'Nike activation "Court Branding" went live for K-1 Invitational Round of 16', time: '1h ago' },
    { id: 'ra-2', text: 'KaNeXT title sponsorship fulfillment report submitted — 92% complete', time: '3h ago' },
    { id: 'ra-3', text: 'Gatorade delivered 500 hydration kits for PBD Cup quarterfinals', time: '5h ago' },
    { id: 'ra-4', text: 'State Farm contract renewal proposal sent — $160K annual value', time: '8h ago' },
    { id: 'ra-5', text: 'Daktronics scoreboard integration confirmed for KaNeXT Arena', time: '10h ago' },
    { id: 'ra-6', text: 'New prospect added: Under Armour — estimated $120K annual value', time: '12h ago' },
    { id: 'ra-7', text: 'Nike Q1 payment received — $45,000', time: '1d ago' },
    { id: 'ra-8', text: 'KaNeXT naming rights banner assets approved for Spring Showcase', time: '1d ago' },
    { id: 'ra-9', text: 'Gatorade halftime activation plan finalized for KaNeXT Church League matches', time: '2d ago' },
    { id: 'ra-10', text: 'Sponsor satisfaction survey sent to all active partners', time: '2d ago' },
    { id: 'ra-11', text: 'State Farm community event sponsorship confirmed for March', time: '3d ago' },
    { id: 'ra-12', text: 'Daktronics LED board content updated for February schedule', time: '3d ago' },
    { id: 'ra-13', text: 'Pipeline review meeting completed — 2 prospects advanced to proposal', time: '4d ago' },
    { id: 'ra-14', text: 'KaNeXT mid-season fulfillment audit scheduled for March 1', time: '5d ago' },
    { id: 'ra-15', text: 'Nike social media campaign reached 250K impressions this month', time: '5d ago' },
  ];

  // ── Sponsors ──
  const sponsors: CompSponsor[] = [
    {
      id: 'sp-1', name: 'KaNeXT', tier: 'title', status: 'active',
      annualValue: 250000, annualValueFormatted: '$250,000',
      contactName: 'David Chen', contactEmail: 'david.chen@kanext.com',
      startDate: 'Jul 2025', endDate: 'Jun 2028',
      logoPlaceholder: 'KX', activationsCount: 8, fulfillmentPct: 92,
    },
    {
      id: 'sp-2', name: 'Nike', tier: 'gold', status: 'active',
      annualValue: 180000, annualValueFormatted: '$180,000',
      contactName: 'Mia Torres', contactEmail: 's.mitchell@nike.com',
      startDate: 'Jan 2026', endDate: 'Dec 2027',
      logoPlaceholder: 'NK', activationsCount: 6, fulfillmentPct: 88,
    },
    {
      id: 'sp-3', name: 'Gatorade', tier: 'silver', status: 'active',
      annualValue: 95000, annualValueFormatted: '$95,000',
      contactName: 'Marcus Rivera', contactEmail: 'm.rivera@gatorade.com',
      startDate: 'Sep 2025', endDate: 'Aug 2026',
      logoPlaceholder: 'GA', activationsCount: 4, fulfillmentPct: 85,
    },
    {
      id: 'sp-4', name: 'Daktronics', tier: 'bronze', status: 'active',
      annualValue: 45000, annualValueFormatted: '$45,000',
      contactName: 'Laura Hansen', contactEmail: 'l.hansen@daktronics.com',
      startDate: 'Nov 2025', endDate: 'Oct 2026',
      logoPlaceholder: 'DK', activationsCount: 3, fulfillmentPct: 78,
    },
    {
      id: 'sp-5', name: 'State Farm', tier: 'gold', status: 'active',
      annualValue: 150000, annualValueFormatted: '$150,000',
      contactName: 'James Patterson', contactEmail: 'j.patterson@statefarm.com',
      startDate: 'Jan 2025', endDate: 'Dec 2025',
      logoPlaceholder: 'SF', activationsCount: 5, fulfillmentPct: 91,
    },
    {
      id: 'sp-6', name: 'Adidas', tier: 'gold', status: 'pending',
      annualValue: 160000, annualValueFormatted: '$160,000',
      contactName: 'Elena Vogt', contactEmail: 'e.vogt@adidas.com',
      startDate: 'Apr 2026', endDate: 'Mar 2028',
      logoPlaceholder: 'AD', activationsCount: 0, fulfillmentPct: 0,
    },
    {
      id: 'sp-7', name: 'Coca-Cola', tier: 'silver', status: 'expired',
      annualValue: 85000, annualValueFormatted: '$85,000',
      contactName: 'Michael Torres', contactEmail: 'm.torres@coca-cola.com',
      startDate: 'Jan 2024', endDate: 'Dec 2025',
      logoPlaceholder: 'CC', activationsCount: 0, fulfillmentPct: 100,
    },
    {
      id: 'sp-8', name: 'Local Print Co', tier: 'in-kind', status: 'active',
      annualValue: 15000, annualValueFormatted: '$15,000',
      contactName: 'Amy Zhang', contactEmail: 'amy@localprintco.com',
      startDate: 'Sep 2025', endDate: 'Aug 2026',
      logoPlaceholder: 'LP', activationsCount: 2, fulfillmentPct: 70,
    },
    {
      id: 'sp-9', name: 'Red Bull', tier: 'bronze', status: 'paused',
      annualValue: 40000, annualValueFormatted: '$40,000',
      contactName: 'Carlos Mendez', contactEmail: 'c.mendez@redbull.com',
      startDate: 'Mar 2025', endDate: 'Feb 2026',
      logoPlaceholder: 'RB', activationsCount: 1, fulfillmentPct: 45,
    },
    {
      id: 'sp-10', name: 'TechVault', tier: 'in-kind', status: 'active',
      annualValue: 20000, annualValueFormatted: '$20,000',
      contactName: 'Priya Nair', contactEmail: 'priya@techvault.io',
      startDate: 'Jan 2026', endDate: 'Dec 2026',
      logoPlaceholder: 'TV', activationsCount: 2, fulfillmentPct: 60,
    },
  ];

  // ── Packages ──
  const packages: SponsorPackage[] = [
    {
      id: 'pkg-1', name: 'Title Sponsor', tier: 'title', price: '$250,000', priceValue: 250000,
      benefits: ['Naming rights to all premier events', 'Logo on all jerseys (front)', 'Exclusive VIP suite access', 'Center-court signage at all venues', '30-second broadcast ad per match', 'Social media co-branded content (weekly)', 'First right of refusal on renewal'],
      maxSponsors: 1, currentSponsors: 1, status: 'sold-out',
    },
    {
      id: 'pkg-2', name: 'Gold Partner', tier: 'gold', price: '$150,000+', priceValue: 150000,
      benefits: ['Logo on jerseys (sleeve)', 'Courtside LED signage', 'VIP hospitality (10 seats per event)', 'Digital media package (250K impressions)', 'Halftime activation rights', 'Quarterly impact reports'],
      maxSponsors: 3, currentSponsors: 2, status: 'available',
    },
    {
      id: 'pkg-3', name: 'Silver Partner', tier: 'silver', price: '$75,000+', priceValue: 75000,
      benefits: ['Concourse signage', 'PA announcements (3 per match)', 'Digital scoreboard features', 'Social media mentions (bi-weekly)', 'Product sampling rights', 'Season ticket allocation (4 seats)'],
      maxSponsors: 4, currentSponsors: 1, status: 'available',
    },
    {
      id: 'pkg-4', name: 'Bronze Supporter', tier: 'bronze', price: '$35,000+', priceValue: 35000,
      benefits: ['Program ad (full page)', 'Website logo placement', 'Event day booth space', 'Social media mention (monthly)', 'Community event co-branding'],
      maxSponsors: 6, currentSponsors: 1, status: 'available',
    },
    {
      id: 'pkg-5', name: 'In-Kind Partner', tier: 'in-kind', price: 'Variable', priceValue: 0,
      benefits: ['Product/service provision', 'Logo on event materials', 'Social media acknowledgment', 'Website recognition', 'Thank-you signage at events'],
      maxSponsors: 10, currentSponsors: 2, status: 'available',
    },
    {
      id: 'pkg-6', name: 'Custom Enterprise', tier: 'gold', price: 'Custom', priceValue: 0,
      benefits: ['Fully customized activation plan', 'Dedicated partnership manager', 'Multi-year pricing incentives', 'Exclusivity clauses available', 'Co-branded community initiatives'],
      maxSponsors: 2, currentSponsors: 1, status: 'custom',
    },
  ];

  // ── Activations ──
  const activations: Activation[] = [
    { id: 'act-1', name: 'KaNeXT Title Branding', sponsor: 'KaNeXT', type: 'naming-rights', status: 'active', startDate: 'Jul 2025', endDate: 'Jun 2026', impressions: '2.4M', series: 'All Series' },
    { id: 'act-2', name: 'Nike Court Branding', sponsor: 'Nike', type: 'signage', status: 'active', startDate: 'Jan 2026', endDate: 'Jun 2026', impressions: '850K', series: 'KaNeXT Church Premier League' },
    { id: 'act-3', name: 'Gatorade Hydration Zone', sponsor: 'Gatorade', type: 'product', status: 'active', startDate: 'Sep 2025', endDate: 'May 2026', impressions: '420K', series: 'All Series' },
    { id: 'act-4', name: 'State Farm Community Day', sponsor: 'State Farm', type: 'event', status: 'scheduled', startDate: 'Mar 2026', endDate: 'Mar 2026', impressions: '75K', series: 'Spring Showcase' },
    { id: 'act-5', name: 'Daktronics Scoreboard Integration', sponsor: 'Daktronics', type: 'digital', status: 'active', startDate: 'Nov 2025', endDate: 'Oct 2026', impressions: '1.2M', series: 'KaNeXT Church Premier League' },
    { id: 'act-6', name: 'Nike Social Media Campaign', sponsor: 'Nike', type: 'media', status: 'active', startDate: 'Jan 2026', endDate: 'May 2026', impressions: '580K', series: 'K-1 Invitational' },
    { id: 'act-7', name: 'KaNeXT Halftime Show', sponsor: 'KaNeXT', type: 'event', status: 'active', startDate: 'Sep 2025', endDate: 'May 2026', impressions: '340K', series: 'KaNeXT Church Premier League' },
    { id: 'act-8', name: 'Gatorade Player of the Match', sponsor: 'Gatorade', type: 'media', status: 'active', startDate: 'Sep 2025', endDate: 'May 2026', impressions: '290K', series: 'KaNeXT Church Premier League' },
    { id: 'act-9', name: 'State Farm MVP Vote', sponsor: 'State Farm', type: 'digital', status: 'active', startDate: 'Jan 2026', endDate: 'Jun 2026', impressions: '180K', series: 'All Series' },
    { id: 'act-10', name: 'KaNeXT Jersey Patch', sponsor: 'KaNeXT', type: 'signage', status: 'active', startDate: 'Jul 2025', endDate: 'Jun 2026', impressions: '3.1M', series: 'All Series' },
    { id: 'act-11', name: 'Nike Training Camp Kit', sponsor: 'Nike', type: 'product', status: 'completed', startDate: 'Jul 2025', endDate: 'Aug 2025', impressions: '60K', series: 'Preseason Challenge' },
    { id: 'act-12', name: 'Local Print Co Programs', sponsor: 'Local Print Co', type: 'product', status: 'active', startDate: 'Sep 2025', endDate: 'May 2026', impressions: '45K', series: 'KaNeXT Church Premier League' },
    { id: 'act-13', name: 'State Farm Youth Clinic', sponsor: 'State Farm', type: 'event', status: 'completed', startDate: 'Dec 2025', endDate: 'Dec 2025', impressions: '35K', series: 'Holiday Invitational' },
    { id: 'act-14', name: 'TechVault Live Stats Display', sponsor: 'TechVault', type: 'digital', status: 'active', startDate: 'Jan 2026', endDate: 'Jun 2026', impressions: '120K', series: 'K-1 Invitational' },
    { id: 'act-15', name: 'Daktronics Replay Board', sponsor: 'Daktronics', type: 'digital', status: 'scheduled', startDate: 'Mar 2026', endDate: 'Jun 2026', impressions: '200K', series: 'PBD Cup' },
    { id: 'act-16', name: 'KaNeXT Broadcast Overlay', sponsor: 'KaNeXT', type: 'media', status: 'active', startDate: 'Sep 2025', endDate: 'Jun 2026', impressions: '1.8M', series: 'All Series' },
    { id: 'act-17', name: 'Nike Shoe Wall Display', sponsor: 'Nike', type: 'event', status: 'draft', startDate: 'Apr 2026', endDate: 'Apr 2026', impressions: '15K', series: 'Spring Showcase' },
    { id: 'act-18', name: 'TechVault App Integration', sponsor: 'TechVault', type: 'digital', status: 'scheduled', startDate: 'Mar 2026', endDate: 'Dec 2026', impressions: '300K', series: 'All Series' },
  ];

  // ── Contracts ──
  const contracts: SponsorContract[] = [
    { id: 'con-1', sponsor: 'KaNeXT', tier: 'title', status: 'active', totalValue: '$750,000', startDate: 'Jul 2025', endDate: 'Jun 2028', autoRenew: true, terms: '3-year title sponsorship with annual $250K payments. Includes naming rights, jersey front placement, and broadcast integration.' },
    { id: 'con-2', sponsor: 'Nike', tier: 'gold', status: 'active', totalValue: '$360,000', startDate: 'Jan 2026', endDate: 'Dec 2027', autoRenew: false, terms: '2-year gold partnership. Equipment provision plus $180K annual cash. Courtside branding and social media package.' },
    { id: 'con-3', sponsor: 'Gatorade', tier: 'silver', status: 'active', totalValue: '$95,000', startDate: 'Sep 2025', endDate: 'Aug 2026', autoRenew: true, terms: '1-year silver partnership. Product supply (hydration) plus $95K cash. Sideline branding and Player of the Match integration.' },
    { id: 'con-4', sponsor: 'Daktronics', tier: 'bronze', status: 'active', totalValue: '$45,000', startDate: 'Nov 2025', endDate: 'Oct 2026', autoRenew: false, terms: '1-year bronze sponsorship. Scoreboard equipment provision ($30K value) plus $45K cash. Digital board content and replays.' },
    { id: 'con-5', sponsor: 'State Farm', tier: 'gold', status: 'pending-renewal', totalValue: '$150,000', startDate: 'Jan 2025', endDate: 'Dec 2025', autoRenew: false, terms: '1-year gold partnership. $150K annual. Community events, MVP voting integration, and halftime features. Renewal proposal sent.' },
    { id: 'con-6', sponsor: 'Adidas', tier: 'gold', status: 'negotiation', totalValue: '$320,000', startDate: 'Apr 2026', endDate: 'Mar 2028', autoRenew: false, terms: '2-year gold partnership proposal. Equipment provision plus $160K annual. Exclusivity clause for footwear category under discussion.' },
    { id: 'con-7', sponsor: 'Coca-Cola', tier: 'silver', status: 'expired', totalValue: '$170,000', startDate: 'Jan 2024', endDate: 'Dec 2025', autoRenew: false, terms: '2-year silver partnership. Beverage exclusivity at all venues. $85K annual. Contract not renewed due to category conflict with Gatorade.' },
    { id: 'con-8', sponsor: 'Local Print Co', tier: 'in-kind', status: 'active', totalValue: '$15,000', startDate: 'Sep 2025', endDate: 'Aug 2026', autoRenew: true, terms: '1-year in-kind. Print services valued at $15K. Match programs, event signage, and promotional materials.' },
    { id: 'con-9', sponsor: 'Red Bull', tier: 'bronze', status: 'active', totalValue: '$40,000', startDate: 'Mar 2025', endDate: 'Feb 2026', autoRenew: false, terms: '1-year bronze sponsorship. $40K cash plus energy drink provision. Activation paused due to venue policy review.' },
    { id: 'con-10', sponsor: 'TechVault', tier: 'in-kind', status: 'active', totalValue: '$20,000', startDate: 'Jan 2026', endDate: 'Dec 2026', autoRenew: false, terms: '1-year in-kind. Technology equipment and app development valued at $20K. Live stats display and fan app integration.' },
  ];

  // ── Fulfillment ──
  const fulfillment: FulfillmentItem[] = [
    { id: 'ff-1', obligation: 'KaNeXT logo on all match jerseys', sponsor: 'KaNeXT', status: 'completed', dueDate: 'Aug 2025', category: 'Signage', notes: 'All team jerseys printed and distributed.' },
    { id: 'ff-2', obligation: 'KaNeXT center-court decal at KaNeXT Arena', sponsor: 'KaNeXT', status: 'completed', dueDate: 'Sep 2025', category: 'Signage', notes: 'Installed before season opener.' },
    { id: 'ff-3', obligation: 'Nike courtside LED panels — KaNeXT Church League', sponsor: 'Nike', status: 'completed', dueDate: 'Jan 2026', category: 'Signage', notes: 'Panels active for all home matches.' },
    { id: 'ff-4', obligation: 'Gatorade product delivery — Q1 2026', sponsor: 'Gatorade', status: 'completed', dueDate: 'Jan 2026', category: 'Product', notes: '500 units delivered to KaNeXT Arena.' },
    { id: 'ff-5', obligation: 'State Farm community event — Spring', sponsor: 'State Farm', status: 'upcoming', dueDate: 'Mar 2026', category: 'Event', notes: 'Venue confirmed. Marketing materials in progress.' },
    { id: 'ff-6', obligation: 'Nike social media posts — February', sponsor: 'Nike', status: 'in-progress', dueDate: 'Feb 2026', category: 'Digital', notes: '3 of 4 posts published this month.' },
    { id: 'ff-7', obligation: 'KaNeXT broadcast overlay — K-1 Invitational', sponsor: 'KaNeXT', status: 'completed', dueDate: 'Jan 2026', category: 'Media', notes: 'Overlay active for all broadcast matches.' },
    { id: 'ff-8', obligation: 'Daktronics scoreboard content update', sponsor: 'Daktronics', status: 'completed', dueDate: 'Feb 2026', category: 'Digital', notes: 'February content package loaded.' },
    { id: 'ff-9', obligation: 'Gatorade halftime activation — PBD Cup QF', sponsor: 'Gatorade', status: 'upcoming', dueDate: 'Feb 2026', category: 'Event', notes: 'Setup confirmed for Feb 21 matches.' },
    { id: 'ff-10', obligation: 'State Farm MVP voting — monthly results', sponsor: 'State Farm', status: 'in-progress', dueDate: 'Feb 2026', category: 'Digital', notes: 'January results published. February voting live.' },
    { id: 'ff-11', obligation: 'Local Print Co match programs — February', sponsor: 'Local Print Co', status: 'in-progress', dueDate: 'Feb 2026', category: 'Product', notes: '4 of 6 programs printed and delivered.' },
    { id: 'ff-12', obligation: 'KaNeXT quarterly impact report — Q3', sponsor: 'KaNeXT', status: 'overdue', dueDate: 'Jan 2026', category: 'Reporting', notes: 'Report delayed due to data compilation. ETA: Feb 20.' },
    { id: 'ff-13', obligation: 'Nike VIP hospitality — K-1 Round of 16', sponsor: 'Nike', status: 'upcoming', dueDate: 'Feb 2026', category: 'Hospitality', notes: '10 VIP seats reserved. Catering confirmed.' },
    { id: 'ff-14', obligation: 'TechVault live stats integration testing', sponsor: 'TechVault', status: 'in-progress', dueDate: 'Feb 2026', category: 'Digital', notes: 'Beta testing at 2 venues. Full rollout planned for March.' },
    { id: 'ff-15', obligation: 'Daktronics replay board installation — PBD Cup', sponsor: 'Daktronics', status: 'upcoming', dueDate: 'Mar 2026', category: 'Equipment', notes: 'Equipment ordered. Installation scheduled for Feb 28.' },
    { id: 'ff-16', obligation: 'KaNeXT naming rights signage — Spring Showcase', sponsor: 'KaNeXT', status: 'upcoming', dueDate: 'Mar 2026', category: 'Signage', notes: 'Design approved. Production in progress.' },
    { id: 'ff-17', obligation: 'Nike player appearance — community event', sponsor: 'Nike', status: 'overdue', dueDate: 'Feb 2026', category: 'Event', notes: 'Player scheduling conflict. Rescheduling in progress.' },
    { id: 'ff-18', obligation: 'Gatorade product delivery — Q2 2026', sponsor: 'Gatorade', status: 'upcoming', dueDate: 'Apr 2026', category: 'Product', notes: 'Order placed. Delivery expected by Mar 28.' },
    { id: 'ff-19', obligation: 'State Farm halftime feature — 3 remaining', sponsor: 'State Farm', status: 'in-progress', dueDate: 'May 2026', category: 'Media', notes: '2 of 5 halftime features completed.' },
    { id: 'ff-20', obligation: 'TechVault fan app update — v2.0', sponsor: 'TechVault', status: 'upcoming', dueDate: 'Mar 2026', category: 'Digital', notes: 'Development in progress. QA testing starts Feb 25.' },
  ];

  // ── Assets ──
  const assets: SponsorAsset[] = [
    { id: 'ast-1', name: 'KaNeXT Logo — Primary (SVG)', type: 'logo', sponsor: 'KaNeXT', uploadDate: 'Jul 2025', fileSize: '245 KB', status: 'approved', usageCount: 34 },
    { id: 'ast-2', name: 'KaNeXT Logo — White on Dark', type: 'logo', sponsor: 'KaNeXT', uploadDate: 'Jul 2025', fileSize: '198 KB', status: 'approved', usageCount: 28 },
    { id: 'ast-3', name: 'Nike Swoosh — Event Use', type: 'logo', sponsor: 'Nike', uploadDate: 'Jan 2026', fileSize: '312 KB', status: 'approved', usageCount: 18 },
    { id: 'ast-4', name: 'Nike Courtside Banner (5x3)', type: 'banner', sponsor: 'Nike', uploadDate: 'Jan 2026', fileSize: '4.2 MB', status: 'approved', usageCount: 12 },
    { id: 'ast-5', name: 'Gatorade Logo — Horizontal', type: 'logo', sponsor: 'Gatorade', uploadDate: 'Sep 2025', fileSize: '276 KB', status: 'approved', usageCount: 15 },
    { id: 'ast-6', name: 'Gatorade Hydration Zone Banner', type: 'banner', sponsor: 'Gatorade', uploadDate: 'Sep 2025', fileSize: '3.8 MB', status: 'approved', usageCount: 8 },
    { id: 'ast-7', name: 'Daktronics Scoreboard Template', type: 'video', sponsor: 'Daktronics', uploadDate: 'Nov 2025', fileSize: '18.5 MB', status: 'approved', usageCount: 22 },
    { id: 'ast-8', name: 'State Farm Logo — Full Color', type: 'logo', sponsor: 'State Farm', uploadDate: 'Jan 2025', fileSize: '289 KB', status: 'approved', usageCount: 20 },
    { id: 'ast-9', name: 'State Farm Community Day Flyer', type: 'document', sponsor: 'State Farm', uploadDate: 'Feb 2026', fileSize: '1.1 MB', status: 'pending', usageCount: 0 },
    { id: 'ast-10', name: 'KaNeXT 30s Broadcast Spot', type: 'video', sponsor: 'KaNeXT', uploadDate: 'Aug 2025', fileSize: '42 MB', status: 'approved', usageCount: 44 },
    { id: 'ast-11', name: 'Nike Social Media Kit — Feb', type: 'social-media', sponsor: 'Nike', uploadDate: 'Feb 2026', fileSize: '8.6 MB', status: 'approved', usageCount: 6 },
    { id: 'ast-12', name: 'Gatorade Audio Jingle (15s)', type: 'audio', sponsor: 'Gatorade', uploadDate: 'Sep 2025', fileSize: '1.8 MB', status: 'approved', usageCount: 30 },
    { id: 'ast-13', name: 'Local Print Co Logo', type: 'logo', sponsor: 'Local Print Co', uploadDate: 'Sep 2025', fileSize: '156 KB', status: 'approved', usageCount: 10 },
    { id: 'ast-14', name: 'TechVault App Screenshots', type: 'social-media', sponsor: 'TechVault', uploadDate: 'Feb 2026', fileSize: '5.2 MB', status: 'pending', usageCount: 0 },
    { id: 'ast-15', name: 'KaNeXT Spring Showcase Banner', type: 'banner', sponsor: 'KaNeXT', uploadDate: 'Feb 2026', fileSize: '6.1 MB', status: 'pending', usageCount: 0 },
    { id: 'ast-16', name: 'Nike Shoe Wall Design Spec', type: 'document', sponsor: 'Nike', uploadDate: 'Feb 2026', fileSize: '2.3 MB', status: 'rejected', usageCount: 0 },
    { id: 'ast-17', name: 'Daktronics LED Content Pack — Mar', type: 'video', sponsor: 'Daktronics', uploadDate: 'Feb 2026', fileSize: '24 MB', status: 'pending', usageCount: 0 },
    { id: 'ast-18', name: 'State Farm MVP Badge Graphic', type: 'social-media', sponsor: 'State Farm', uploadDate: 'Jan 2026', fileSize: '890 KB', status: 'approved', usageCount: 8 },
  ];

  // ── Revenue ──
  const revenue: SponsorRevenue[] = [
    { id: 'rev-1', period: 'Q3 2025', sponsor: 'KaNeXT', amount: '$62,500', amountValue: 62500, type: 'cash', status: 'received', date: 'Jul 2025' },
    { id: 'rev-2', period: 'Q4 2025', sponsor: 'KaNeXT', amount: '$62,500', amountValue: 62500, type: 'cash', status: 'received', date: 'Oct 2025' },
    { id: 'rev-3', period: 'Q1 2026', sponsor: 'KaNeXT', amount: '$62,500', amountValue: 62500, type: 'cash', status: 'received', date: 'Jan 2026' },
    { id: 'rev-4', period: 'Q2 2026', sponsor: 'KaNeXT', amount: '$62,500', amountValue: 62500, type: 'cash', status: 'projected', date: 'Apr 2026' },
    { id: 'rev-5', period: 'Q1 2026', sponsor: 'Nike', amount: '$45,000', amountValue: 45000, type: 'cash', status: 'received', date: 'Jan 2026' },
    { id: 'rev-6', period: 'Q2 2026', sponsor: 'Nike', amount: '$45,000', amountValue: 45000, type: 'cash', status: 'invoiced', date: 'Apr 2026' },
    { id: 'rev-7', period: 'Q1 2026', sponsor: 'Nike', amount: '$22,000', amountValue: 22000, type: 'in-kind', status: 'received', date: 'Jan 2026' },
    { id: 'rev-8', period: 'Q3 2025', sponsor: 'Gatorade', amount: '$23,750', amountValue: 23750, type: 'cash', status: 'received', date: 'Sep 2025' },
    { id: 'rev-9', period: 'Q4 2025', sponsor: 'Gatorade', amount: '$23,750', amountValue: 23750, type: 'cash', status: 'received', date: 'Dec 2025' },
    { id: 'rev-10', period: 'Q1 2026', sponsor: 'Gatorade', amount: '$23,750', amountValue: 23750, type: 'cash', status: 'received', date: 'Jan 2026' },
    { id: 'rev-11', period: 'Q2 2026', sponsor: 'Gatorade', amount: '$23,750', amountValue: 23750, type: 'cash', status: 'projected', date: 'Apr 2026' },
    { id: 'rev-12', period: 'Q4 2025', sponsor: 'Daktronics', amount: '$11,250', amountValue: 11250, type: 'cash', status: 'received', date: 'Nov 2025' },
    { id: 'rev-13', period: 'Q1 2026', sponsor: 'Daktronics', amount: '$11,250', amountValue: 11250, type: 'cash', status: 'received', date: 'Jan 2026' },
    { id: 'rev-14', period: 'Q2 2026', sponsor: 'Daktronics', amount: '$11,250', amountValue: 11250, type: 'cash', status: 'invoiced', date: 'Apr 2026' },
    { id: 'rev-15', period: 'Q1 2025', sponsor: 'State Farm', amount: '$37,500', amountValue: 37500, type: 'cash', status: 'received', date: 'Jan 2025' },
    { id: 'rev-16', period: 'Q2 2025', sponsor: 'State Farm', amount: '$37,500', amountValue: 37500, type: 'cash', status: 'received', date: 'Apr 2025' },
    { id: 'rev-17', period: 'Q3 2025', sponsor: 'State Farm', amount: '$37,500', amountValue: 37500, type: 'cash', status: 'received', date: 'Jul 2025' },
    { id: 'rev-18', period: 'Q4 2025', sponsor: 'State Farm', amount: '$37,500', amountValue: 37500, type: 'cash', status: 'received', date: 'Oct 2025' },
    { id: 'rev-19', period: 'FY 2025-26', sponsor: 'Local Print Co', amount: '$15,000', amountValue: 15000, type: 'in-kind', status: 'received', date: 'Sep 2025' },
    { id: 'rev-20', period: 'FY 2025-26', sponsor: 'TechVault', amount: '$20,000', amountValue: 20000, type: 'in-kind', status: 'received', date: 'Jan 2026' },
    { id: 'rev-21', period: 'Renewal Bonus', sponsor: 'KaNeXT', amount: '$25,000', amountValue: 25000, type: 'bonus', status: 'received', date: 'Jul 2025' },
    { id: 'rev-22', period: 'Q1 2026', sponsor: 'Red Bull', amount: '$10,000', amountValue: 10000, type: 'cash', status: 'overdue', date: 'Jan 2026' },
    { id: 'rev-23', period: 'Renewal', sponsor: 'State Farm', amount: '$160,000', amountValue: 160000, type: 'renewal', status: 'projected', date: 'Jan 2026' },
    { id: 'rev-24', period: 'Q3 2026', sponsor: 'Nike', amount: '$45,000', amountValue: 45000, type: 'cash', status: 'projected', date: 'Jul 2026' },
    { id: 'rev-25', period: 'Q4 2026', sponsor: 'Nike', amount: '$45,000', amountValue: 45000, type: 'cash', status: 'projected', date: 'Oct 2026' },
  ];

  // ── Prospecting ──
  const prospects: Prospect[] = [
    { id: 'pros-1', companyName: 'Under Armour', contactName: 'Jessica Blake', contactEmail: 'j.blake@underarmour.com', stage: 'proposal', estimatedValue: '$120,000', estimatedValueNum: 120000, industry: 'Sportswear', lastActivity: '2d ago', notes: 'Gold-tier proposal sent. Waiting on budget approval from their marketing VP.' },
    { id: 'pros-2', companyName: 'Toyota', contactName: 'Kevin Yamamoto', contactEmail: 'k.yamamoto@toyota.com', stage: 'meeting', estimatedValue: '$200,000', estimatedValueNum: 200000, industry: 'Automotive', lastActivity: '4d ago', notes: 'Initial meeting went well. They want naming rights to a secondary event. Follow-up scheduled for Feb 25.' },
    { id: 'pros-3', companyName: 'Chick-fil-A', contactName: 'Amanda Foster', contactEmail: 'a.foster@chick-fil-a.com', stage: 'outreach', estimatedValue: '$75,000', estimatedValueNum: 75000, industry: 'Food & Beverage', lastActivity: '1w ago', notes: 'Intro email sent. Interest in concession partnership and fan experience activations.' },
    { id: 'pros-4', companyName: 'Blue Cross Blue Shield', contactName: 'Dr. Robert Kim', contactEmail: 'r.kim@bcbs.com', stage: 'negotiation', estimatedValue: '$130,000', estimatedValueNum: 130000, industry: 'Healthcare', lastActivity: '1d ago', notes: 'Gold-tier terms agreed. Negotiating multi-year discount and health screening activation rights.' },
    { id: 'pros-5', companyName: 'Beats by Dre', contactName: 'Taylor Washington', contactEmail: 't.washington@beatsbydre.com', stage: 'lead', estimatedValue: '$80,000', estimatedValueNum: 80000, industry: 'Electronics', lastActivity: '3d ago', notes: 'Referral from Nike contact. Interest in audio branding and tunnel walk partnerships.' },
    { id: 'pros-6', companyName: 'First National Bank', contactName: 'Patricia Hall', contactEmail: 'p.hall@fnb.com', stage: 'proposal', estimatedValue: '$90,000', estimatedValueNum: 90000, industry: 'Financial Services', lastActivity: '5d ago', notes: 'Silver-tier proposal submitted. They want fan finance education booth and scoreboard features.' },
    { id: 'pros-7', companyName: 'Hilton Hotels', contactName: 'Mark Chen', contactEmail: 'm.chen@hilton.com', stage: 'outreach', estimatedValue: '$110,000', estimatedValueNum: 110000, industry: 'Hospitality', lastActivity: '6d ago', notes: 'Exploring travel partnership for away series and VIP hospitality suites.' },
    { id: 'pros-8', companyName: 'Papa Johns', contactName: 'Lisa Martinez', contactEmail: 'l.martinez@papajohns.com', stage: 'closed-lost', estimatedValue: '$55,000', estimatedValueNum: 55000, industry: 'Food & Beverage', lastActivity: '2w ago', notes: 'Declined due to existing national sports partnership commitments. Revisit next fiscal year.' },
    { id: 'pros-9', companyName: 'Verizon', contactName: 'Andre Thompson', contactEmail: 'a.thompson@verizon.com', stage: 'lead', estimatedValue: '$175,000', estimatedValueNum: 175000, industry: 'Telecommunications', lastActivity: '1w ago', notes: 'Initial interest in connectivity sponsorship — Wi-Fi at venues and 5G fan experience.' },
    { id: 'pros-10', companyName: 'Home Depot', contactName: 'Karen O\'Brien', contactEmail: 'k.obrien@homedepot.com', stage: 'meeting', estimatedValue: '$65,000', estimatedValueNum: 65000, industry: 'Retail', lastActivity: '3d ago', notes: 'Community build day concept presented. They want facility improvement tie-in.' },
    { id: 'pros-11', companyName: 'Dick\'s Sporting Goods', contactName: 'Brian Wallace', contactEmail: 'b.wallace@dicks.com', stage: 'closed-won', estimatedValue: '$70,000', estimatedValueNum: 70000, industry: 'Retail', lastActivity: '1w ago', notes: 'Bronze partnership closed. Equipment provision plus fan shop activation. Contract being drafted.' },
    { id: 'pros-12', companyName: 'Microsoft', contactName: 'Yuki Tanaka', contactEmail: 'y.tanaka@microsoft.com', stage: 'lead', estimatedValue: '$250,000', estimatedValueNum: 250000, industry: 'Technology', lastActivity: '2d ago', notes: 'Potential technology partnership — Surface tablets for coaching staff, Azure for analytics platform.' },
  ];

  // ── Settings ──
  const settings: SponsorSettingToggle[] = [
    { id: 'set-1', label: 'Auto-generate fulfillment reports', description: 'Automatically compile and send monthly fulfillment status reports to all active sponsors.', enabled: true },
    { id: 'set-2', label: 'Sponsor portal access', description: 'Allow sponsors to log in and view their activation metrics, assets, and contract details.', enabled: true },
    { id: 'set-3', label: 'Asset approval workflow', description: 'Require internal approval before sponsor-provided assets are used in productions.', enabled: true },
    { id: 'set-4', label: 'Revenue notifications', description: 'Send alerts when payments are received, invoiced, or overdue.', enabled: true },
    { id: 'set-5', label: 'Prospect auto-follow-up', description: 'Automatically send follow-up emails to prospects after 7 days of inactivity.', enabled: false },
    { id: 'set-6', label: 'Activation impression tracking', description: 'Enable automated impression counting for digital and signage activations.', enabled: true },
    { id: 'set-7', label: 'Contract expiry alerts', description: 'Send reminders 90, 60, and 30 days before a sponsor contract expires.', enabled: true },
    { id: 'set-8', label: 'Category exclusivity enforcement', description: 'Prevent sponsors in the same product category from signing conflicting packages.', enabled: true },
    { id: 'set-9', label: 'Public sponsor recognition', description: 'Display sponsor logos and names on the public-facing event pages and broadcasts.', enabled: true },
    { id: 'set-10', label: 'In-kind valuation tracking', description: 'Track and report the fair market value of all in-kind sponsorship contributions.', enabled: false },
    { id: 'set-11', label: 'Sponsor satisfaction surveys', description: 'Automatically send quarterly satisfaction surveys to all active sponsor contacts.', enabled: false },
    { id: 'set-12', label: 'Pipeline stage notifications', description: 'Notify the sponsorship team when a prospect advances to a new pipeline stage.', enabled: true },
    { id: 'set-13', label: 'Multi-year discount automation', description: 'Automatically apply agreed-upon discounts for multi-year sponsorship commitments.', enabled: false },
    { id: 'set-14', label: 'Activation conflict detection', description: 'Flag scheduling conflicts when multiple sponsor activations overlap at the same venue.', enabled: true },
    { id: 'set-15', label: 'Financial audit trail', description: 'Maintain a detailed audit log of all sponsorship financial transactions and changes.', enabled: true },
  ];

  return {
    dashboard,
    quickActions,
    recentActivity,
    sponsors,
    packages,
    activations,
    contracts,
    fulfillment,
    assets,
    revenue,
    prospects,
    settings,
  };
}
