/**
 * Mock data for Business Explore page (Company YouTube).
 * Discovery homepage for business content.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface FeaturedContent {
  title: string;
  subtitle: string;
  hookText: string;
  badgeText: string;
  ctaLabel: string;
  thumbnailColor: string;
}

export interface TrendingCompany {
  id: string;
  name: string;
  industry: string;
  thumbnailColor: string;
  employeeCount: number;
}

export interface Presentation {
  id: string;
  title: string;
  presenter: string;
  company: string;
  date: string;
  duration: string;
  thumbnailColor: string;
}

export interface TrainingModule {
  id: string;
  title: string;
  category: string;
  duration: string;
  thumbnailColor: string;
  completionRate: number;
}

export interface InvestorUpdate {
  id: string;
  title: string;
  company: string;
  quarter: string;
  date: string;
  thumbnailColor: string;
}

export interface IndustryNewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  thumbnailColor: string;
}

export interface WebinarEvent {
  id: string;
  title: string;
  date: string;
  speaker: string;
  thumbnailColor: string;
  status: string;
}

export type BusinessScope = 'All' | 'Companies' | 'Training' | 'News' | 'Events';

// =============================================================================
// FEATURED CONTENT
// =============================================================================

export const FEATURED_CONTENT: FeaturedContent = {
  title: 'Valuetainment V2 Demo Day',
  subtitle: 'Product Launch',
  hookText: 'Full walkthrough of the next-gen platform powering sports operations',
  badgeText: 'PREMIERE',
  ctaLabel: 'Watch',
  thumbnailColor: '#FFFFFF',
};

// =============================================================================
// TRENDING COMPANIES
// =============================================================================

export const TRENDING_COMPANIES: TrendingCompany[] = [
  { id: 'tc-1', name: 'Valuetainment Media LLC', industry: 'Sports Tech', thumbnailColor: '#FFFFFF', employeeCount: 24 },
  { id: 'tc-2', name: 'Apex Analytics', industry: 'Data Science', thumbnailColor: '#1D9BF0', employeeCount: 85 },
  { id: 'tc-3', name: 'CourtVision AI', industry: 'Computer Vision', thumbnailColor: '#22C55E', employeeCount: 42 },
  { id: 'tc-4', name: 'ScoutPro', industry: 'Recruiting Tech', thumbnailColor: '#EF4444', employeeCount: 30 },
  { id: 'tc-5', name: 'GameFilm Labs', industry: 'Video Analytics', thumbnailColor: '#F59E0B', employeeCount: 55 },
  { id: 'tc-6', name: 'Playmaker Studio', industry: 'Content Creation', thumbnailColor: '#1D9BF0', employeeCount: 18 },
  { id: 'tc-7', name: 'AthletIQ', industry: 'Performance Tech', thumbnailColor: '#1D9BF0', employeeCount: 67 },
  { id: 'tc-8', name: 'TransferHub', industry: 'NIL / Portal', thumbnailColor: '#1D9BF0', employeeCount: 38 },
];

// =============================================================================
// LATEST PRESENTATIONS
// =============================================================================

export const LATEST_PRESENTATIONS: Presentation[] = [
  { id: 'lp-1', title: 'Valuetainment V2 Platform Demo', presenter: 'Patrick Bet-David', company: 'Valuetainment Media LLC', date: 'Feb 15', duration: '32:00', thumbnailColor: '#EA2127' },
  { id: 'lp-2', title: 'AI Scouting Pipeline', presenter: 'Aisha Chen', company: 'Apex Analytics', date: 'Feb 12', duration: '24:30', thumbnailColor: '#1D9BF0' },
  { id: 'lp-3', title: 'Real-Time Shot Tracking', presenter: 'Marcus Webb', company: 'CourtVision AI', date: 'Feb 8', duration: '18:45', thumbnailColor: '#22C55E' },
  { id: 'lp-4', title: 'NIL Marketplace Overview', presenter: 'Jordan Fields', company: 'TransferHub', date: 'Feb 5', duration: '28:10', thumbnailColor: '#1D9BF0' },
  { id: 'lp-5', title: 'Content Automation at Scale', presenter: 'Lena Rodriguez', company: 'Playmaker Studio', date: 'Jan 30', duration: '20:00', thumbnailColor: '#1D9BF0' },
  { id: 'lp-6', title: 'Wearable Performance Data', presenter: 'Derek Palmer', company: 'AthletIQ', date: 'Jan 25', duration: '22:15', thumbnailColor: '#1D9BF0' },
];

// =============================================================================
// TRAINING MODULES
// =============================================================================

export const TRAINING_MODULES: TrainingModule[] = [
  { id: 'tm-1', title: 'Onboarding: Valuetainment Platform', category: 'Getting Started', duration: '45:00', thumbnailColor: '#EA2127', completionRate: 0.82 },
  { id: 'tm-2', title: 'Advanced Film Tagging', category: 'Video Tools', duration: '30:00', thumbnailColor: '#1D9BF0', completionRate: 0.54 },
  { id: 'tm-3', title: 'Recruiting Database Mastery', category: 'Recruiting', duration: '35:00', thumbnailColor: '#22C55E', completionRate: 0.68 },
  { id: 'tm-4', title: 'Analytics Dashboard Deep Dive', category: 'Analytics', duration: '25:00', thumbnailColor: '#F59E0B', completionRate: 0.41 },
  { id: 'tm-5', title: 'Team Communication Tools', category: 'Collaboration', duration: '20:00', thumbnailColor: '#1D9BF0', completionRate: 0.90 },
  { id: 'tm-6', title: 'Compliance & Eligibility', category: 'Operations', duration: '28:00', thumbnailColor: '#EF4444', completionRate: 0.35 },
];

// =============================================================================
// INVESTOR UPDATES
// =============================================================================

export const INVESTOR_UPDATES: InvestorUpdate[] = [
  { id: 'iu-1', title: 'Valuetainment Q4 2025 Update', company: 'Valuetainment Media LLC', quarter: 'Q4 2025', date: 'Jan 15', thumbnailColor: '#EA2127' },
  { id: 'iu-2', title: 'Apex Analytics Series A', company: 'Apex Analytics', quarter: 'Q1 2026', date: 'Feb 1', thumbnailColor: '#1D9BF0' },
  { id: 'iu-3', title: 'CourtVision Seed Round', company: 'CourtVision AI', quarter: 'Q4 2025', date: 'Dec 20', thumbnailColor: '#22C55E' },
  { id: 'iu-4', title: 'AthletIQ Growth Metrics', company: 'AthletIQ', quarter: 'Q1 2026', date: 'Feb 10', thumbnailColor: '#1D9BF0' },
  { id: 'iu-5', title: 'TransferHub Market Report', company: 'TransferHub', quarter: 'Q4 2025', date: 'Jan 8', thumbnailColor: '#1D9BF0' },
];

// =============================================================================
// INDUSTRY NEWS
// =============================================================================

export const INDUSTRY_NEWS: IndustryNewsItem[] = [
  { id: 'in-1', title: 'NAIA Adopts AI-Assisted Officiating Pilot', source: 'Sports Business Journal', date: 'Feb 14', thumbnailColor: '#F59E0B' },
  { id: 'in-2', title: 'NIL Marketplace Projected to Hit $2B by 2027', source: 'Forbes', date: 'Feb 11', thumbnailColor: '#22C55E' },
  { id: 'in-3', title: 'Transfer Portal Traffic Doubles Year-Over-Year', source: 'ESPN', date: 'Feb 8', thumbnailColor: '#EF4444' },
  { id: 'in-4', title: 'Wearable Tech Mandates Expand in College Sports', source: 'TechCrunch', date: 'Feb 5', thumbnailColor: '#1D9BF0' },
  { id: 'in-5', title: 'Video Analytics Market Surges in D2/D3 Tiers', source: 'Athletic Director U', date: 'Jan 30', thumbnailColor: '#1D9BF0' },
];

// =============================================================================
// WEBINARS & EVENTS
// =============================================================================

export const WEBINARS_EVENTS: WebinarEvent[] = [
  { id: 'we-1', title: 'Sports Tech Summit 2026', date: 'Mar 12', speaker: 'Multiple Speakers', thumbnailColor: '#FFFFFF', status: 'Upcoming' },
  { id: 'we-2', title: 'Building with Valuetainment API', date: 'Feb 28', speaker: 'Patrick Bet-David', thumbnailColor: '#EA2127', status: 'Registration Open' },
  { id: 'we-3', title: 'AI in Collegiate Athletics', date: 'Feb 20', speaker: 'Aisha Chen', thumbnailColor: '#22C55E', status: 'Live' },
  { id: 'we-4', title: 'Fundraising for Sports Startups', date: 'Jan 18', speaker: 'Jordan Fields', thumbnailColor: '#F59E0B', status: 'Recorded' },
];

// =============================================================================
// FILTER OPTIONS
// =============================================================================

export const EXPLORE_FILTERS: BusinessScope[] = ['All', 'Companies', 'Training', 'News', 'Events'];
