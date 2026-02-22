/**
 * Mock data for Church Explore page (Ministry YouTube).
 * Discovery homepage for church/ministry content.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface FeaturedMinistry {
  title: string;
  subtitle: string;
  hookText: string;
  badgeText: string;
  ctaLabel: string;
  thumbnailColor: string;
}

export interface Sermon {
  id: string;
  title: string;
  speaker: string;
  date: string;
  duration: string;
  thumbnailColor: string;
  series: string;
}

export interface WorshipHighlight {
  id: string;
  title: string;
  date: string;
  duration: string;
  thumbnailColor: string;
  type: string;
}

export interface MinistrySpotlight {
  id: string;
  name: string;
  description: string;
  thumbnailColor: string;
  memberCount: number;
}

export interface YouthContent {
  id: string;
  title: string;
  type: string;
  date: string;
  duration: string;
  thumbnailColor: string;
}

export interface BibleStudy {
  id: string;
  title: string;
  facilitator: string;
  book: string;
  thumbnailColor: string;
}

export interface CommunityOutreach {
  id: string;
  title: string;
  date: string;
  type: string;
  thumbnailColor: string;
}

export type ChurchScope = 'All' | 'Sermons' | 'Worship' | 'Bible Study' | 'Youth';

// =============================================================================
// FEATURED MINISTRY
// =============================================================================

export const FEATURED_MINISTRY: FeaturedMinistry = {
  title: 'Faith Forward Series',
  subtitle: 'KaNeXT Church Sunday Service',
  hookText: 'Pastor James Carter shares a powerful message on walking in faith',
  badgeText: 'FEATURED',
  ctaLabel: 'Watch Now',
  thumbnailColor: '#1D9BF0',
};

// =============================================================================
// RECENT SERMONS
// =============================================================================

export const RECENT_SERMONS: Sermon[] = [
  { id: 'ser-1', title: 'Walking in Faith', speaker: 'Pastor James Carter', date: 'Feb 16', duration: '42:15', thumbnailColor: '#1D9BF0', series: 'Faith Forward' },
  { id: 'ser-2', title: 'The Power of Prayer', speaker: 'Pastor James Carter', date: 'Feb 9', duration: '38:20', thumbnailColor: '#1D9BF0', series: 'Faith Forward' },
  { id: 'ser-3', title: 'Grace Under Pressure', speaker: 'Minister Johnson', date: 'Feb 2', duration: '35:45', thumbnailColor: '#22C55E', series: 'Resilience' },
  { id: 'ser-4', title: 'Love Your Neighbor', speaker: 'Pastor James Carter', date: 'Jan 26', duration: '40:10', thumbnailColor: '#F59E0B', series: 'Community' },
  { id: 'ser-5', title: 'Strength in Surrender', speaker: 'Minister Adebayo', date: 'Jan 19', duration: '36:30', thumbnailColor: '#EF4444', series: 'Resilience' },
  { id: 'ser-6', title: 'Building on the Rock', speaker: 'Pastor James Carter', date: 'Jan 12', duration: '44:00', thumbnailColor: '#1D9BF0', series: 'Foundations' },
  { id: 'ser-7', title: 'The Shepherd\'s Voice', speaker: 'Elder Williams', date: 'Jan 5', duration: '33:50', thumbnailColor: '#1D9BF0', series: 'Listening' },
  { id: 'ser-8', title: 'New Year, New Purpose', speaker: 'Pastor James Carter', date: 'Dec 29', duration: '41:25', thumbnailColor: '#FFFFFF', series: 'Purpose' },
];

// =============================================================================
// WORSHIP HIGHLIGHTS
// =============================================================================

export const WORSHIP_HIGHLIGHTS: WorshipHighlight[] = [
  { id: 'wh-1', title: 'Sunday Morning Worship Set', date: 'Feb 16', duration: '18:30', thumbnailColor: '#1D9BF0', type: 'Live Worship' },
  { id: 'wh-2', title: 'Praise Night Highlights', date: 'Feb 14', duration: '12:45', thumbnailColor: '#F59E0B', type: 'Special Event' },
  { id: 'wh-3', title: '"Great Is Thy Faithfulness"', date: 'Feb 9', duration: '6:20', thumbnailColor: '#22C55E', type: 'Single' },
  { id: 'wh-4', title: 'Choir Anniversary Concert', date: 'Feb 2', duration: '45:00', thumbnailColor: '#1D9BF0', type: 'Concert' },
  { id: 'wh-5', title: '"How Great Is Our God"', date: 'Jan 26', duration: '5:50', thumbnailColor: '#EF4444', type: 'Single' },
  { id: 'wh-6', title: 'Acoustic Worship Session', date: 'Jan 19', duration: '22:10', thumbnailColor: '#1D9BF0', type: 'Live Worship' },
];

// =============================================================================
// MINISTRY SPOTLIGHTS
// =============================================================================

export const MINISTRY_SPOTLIGHTS: MinistrySpotlight[] = [
  { id: 'ms-1', name: 'Men\'s Fellowship', description: 'Weekly gatherings for brotherhood and growth', thumbnailColor: '#1D9BF0', memberCount: 45 },
  { id: 'ms-2', name: 'Women\'s Ministry', description: 'Empowering women through faith and community', thumbnailColor: '#1D9BF0', memberCount: 62 },
  { id: 'ms-3', name: 'Worship Team', description: 'Leading the congregation in praise', thumbnailColor: '#1D9BF0', memberCount: 18 },
  { id: 'ms-4', name: 'Outreach Ministry', description: 'Serving the local community with love', thumbnailColor: '#22C55E', memberCount: 30 },
  { id: 'ms-5', name: 'Prayer Warriors', description: 'Intercession and spiritual covering', thumbnailColor: '#F59E0B', memberCount: 25 },
  { id: 'ms-6', name: 'Media Ministry', description: 'Sharing the gospel through technology', thumbnailColor: '#1D9BF0', memberCount: 12 },
];

// =============================================================================
// YOUTH CONTENT
// =============================================================================

export const YOUTH_CONTENT: YouthContent[] = [
  { id: 'yc-1', title: 'Youth Sunday Recap', type: 'Service', date: 'Feb 16', duration: '28:00', thumbnailColor: '#EF4444' },
  { id: 'yc-2', title: 'Identity in Christ', type: 'Devotional', date: 'Feb 12', duration: '15:30', thumbnailColor: '#1D9BF0' },
  { id: 'yc-3', title: 'Game Night Fellowship', type: 'Event', date: 'Feb 8', duration: '4:20', thumbnailColor: '#22C55E' },
  { id: 'yc-4', title: 'Bible Trivia Challenge', type: 'Interactive', date: 'Feb 1', duration: '22:00', thumbnailColor: '#F59E0B' },
  { id: 'yc-5', title: 'Young Leaders Panel', type: 'Discussion', date: 'Jan 25', duration: '35:10', thumbnailColor: '#1D9BF0' },
];

// =============================================================================
// BIBLE STUDIES
// =============================================================================

export const BIBLE_STUDIES: BibleStudy[] = [
  { id: 'bs-1', title: 'Book of James', facilitator: 'Elder Williams', book: 'James', thumbnailColor: '#1D9BF0' },
  { id: 'bs-2', title: 'Psalms of David', facilitator: 'Minister Adebayo', book: 'Psalms', thumbnailColor: '#22C55E' },
  { id: 'bs-3', title: 'Romans Deep Dive', facilitator: 'Pastor James Carter', book: 'Romans', thumbnailColor: '#1D9BF0' },
  { id: 'bs-4', title: 'Proverbs for Living', facilitator: 'Deacon Harris', book: 'Proverbs', thumbnailColor: '#F59E0B' },
  { id: 'bs-5', title: 'Gospel of John', facilitator: 'Minister Johnson', book: 'John', thumbnailColor: '#1D9BF0' },
];

// =============================================================================
// COMMUNITY OUTREACH
// =============================================================================

export const COMMUNITY_OUTREACH: CommunityOutreach[] = [
  { id: 'co-1', title: 'Food Drive Highlight Reel', date: 'Feb 10', type: 'Service', thumbnailColor: '#22C55E' },
  { id: 'co-2', title: 'Neighborhood Cleanup Day', date: 'Jan 27', type: 'Event', thumbnailColor: '#1D9BF0' },
  { id: 'co-3', title: 'Back to School Giveaway', date: 'Jan 13', type: 'Service', thumbnailColor: '#F59E0B' },
  { id: 'co-4', title: 'Community Health Fair', date: 'Dec 14', type: 'Event', thumbnailColor: '#EF4444' },
];

// =============================================================================
// FILTER OPTIONS
// =============================================================================

export const EXPLORE_FILTERS: ChurchScope[] = ['All', 'Sermons', 'Worship', 'Bible Study', 'Youth'];
