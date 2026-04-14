/**
 * Mock data for the Portfolio screen — Personal Mode.
 * Projects, Press, Testimonials, Archive, Credentials.
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type ProjectType = 'Sponsored' | 'Self-produced' | 'Collaboration' | 'Article' | 'Speaking';

export interface PortfolioProject {
  id: string;
  title: string;
  client: string;
  description: string;
  coverHue: number;
  coverUri?: string;
  type: ProjectType;
  results: { label: string; value: string }[];
  samples: { id: string; type: 'reel' | 'post' | 'video'; thumbHue: number }[];
}

export interface PortfolioPress {
  id: string;
  title: string;
  publication: string;
  date: string;
  initials: string;
  hue: number;
  blurb: string;
  bannerUri?: string;  // background image for the featured hero card
  thumbUri?: string;   // thumbnail image for regular press cards
  url?: string;
}

export interface PortfolioTestimonial {
  id: string;
  quote: string;
  name: string;
  title: string;
  company: string;
  stars: number;
}

export type ArchiveType = 'Article' | 'Newsletter' | 'Essay';

export interface PortfolioArchiveItem {
  id: string;
  title: string;
  date: string;
  readTime: string;
  views: string;
  type: ArchiveType;
}

export interface PortfolioCredential {
  id: string;
  title: string;
  issuer: string;
  year: string;
  icon: string;
  coverUri?: string;
}

// ── Data ──────────────────────────────────────────────────────────────────────

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: 'proj1',
    title: 'Nike Summer Campaign 2025',
    client: 'Nike',
    description: '3-part content series featuring summer training gear. Sponsored reel, static post, and KTV long-form behind-the-scenes.',
    coverHue: 210,
    coverUri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=450&fit=crop&q=80',
    type: 'Sponsored',
    results: [
      { label: 'Views',      value: '2.1M'  },
      { label: 'Engagement', value: '340K'  },
      { label: 'Deal Value', value: '$28K'  },
    ],
    samples: [
      { id: 's1', type: 'reel',  thumbHue: 210 },
      { id: 's2', type: 'post',  thumbHue: 215 },
      { id: 's3', type: 'video', thumbHue: 220 },
    ],
  },
  {
    id: 'proj2',
    title: 'Gatorade Brand Ambassador Q1 2025',
    client: 'Gatorade',
    description: 'Quarterly ambassador deal covering hydration content across Instagram, TikTok, and KTV. 12 posts over 3 months.',
    coverHue: 30,
    coverUri: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=450&fit=crop&q=80',
    type: 'Sponsored',
    results: [
      { label: 'Reach', value: '4.8M'   },
      { label: 'Posts', value: '12'     },
      { label: 'Value', value: '$84K/yr' },
    ],
    samples: [
      { id: 's4', type: 'reel', thumbHue: 30  },
      { id: 's5', type: 'post', thumbHue: 35  },
    ],
  },
  {
    id: 'proj3',
    title: 'KaNeXT OS Launch Video',
    client: 'Self-produced',
    description: 'Long-form launch video for the KaNeXT OS platform announcing creator-focused features to my audience.',
    coverHue: 270,
    coverUri: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=450&fit=crop&q=80',
    type: 'Self-produced',
    results: [
      { label: 'Views',      value: '12.4K' },
      { label: 'Engagement', value: '6.2%'  },
      { label: 'Type',       value: 'KTV'   },
    ],
    samples: [
      { id: 's6', type: 'video', thumbHue: 270 },
    ],
  },
  {
    id: 'proj4',
    title: 'Coaching Masterclass Series',
    client: 'Self-produced',
    description: '4-part video course on athlete branding and performance mindset. Sold as a standalone digital product.',
    coverHue: 150,
    coverUri: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=450&fit=crop&q=80',
    type: 'Self-produced',
    results: [
      { label: 'Sold',    value: '847'     },
      { label: 'Price',   value: '$29 ea'  },
      { label: 'Revenue', value: '$24.5K'  },
    ],
    samples: [
      { id: 's7', type: 'video', thumbHue: 150 },
      { id: 's8', type: 'video', thumbHue: 155 },
    ],
  },
  {
    id: 'proj5',
    title: 'The Athlete Brand Playbook — Deep Dive',
    client: 'Self-produced',
    description: 'Long-form article breaking down the exact playbook I used to go from unknown athlete to six-figure creator. Published across Medium and my newsletter with a combined reach of 22K readers.',
    coverHue: 40,
    coverUri: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=450&fit=crop&q=80',
    type: 'Article',
    results: [
      { label: 'Reads',    value: '22K'    },
      { label: 'Shares',   value: '1.4K'   },
      { label: 'Saves',    value: '3.8K'   },
    ],
    samples: [
      { id: 's9',  type: 'post', thumbHue: 40 },
    ],
  },
  {
    id: 'proj6',
    title: 'TEDxMiami — "Building in Public"',
    client: 'TEDxMiami',
    description: 'Keynote talk on the psychology of building in public as an athlete-entrepreneur. Delivered to 600+ live attendees and 40K+ online views. Covered vulnerability, accountability, and the creative process.',
    coverHue: 355,
    coverUri: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=450&fit=crop&q=80',
    type: 'Speaking',
    results: [
      { label: 'Attendees', value: '600+'  },
      { label: 'Views',     value: '40K'   },
      { label: 'Rating',    value: '4.9★'  },
    ],
    samples: [
      { id: 's10', type: 'video', thumbHue: 355 },
    ],
  },
];

export const PORTFOLIO_PRESS: PortfolioPress[] = [
  {
    id: 'press1',
    title: 'Featured in Forbes 30 Under 30',
    publication: 'Forbes',
    date: 'Mar 2025',
    initials: 'F',
    hue: 0,
    blurb: 'Named to Forbes\u2019 annual 30 Under 30 list recognizing young entrepreneurs reshaping the future of sports and creator technology.',
    bannerUri: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=400&fit=crop&q=80',
  },
  {
    id: 'press2',
    title: 'Guest on The Breakfast Club',
    publication: 'iHeart Radio',
    date: 'Jan 2025',
    initials: 'BC',
    hue: 45,
    blurb: 'Joined Charlamagne Tha God to talk athlete branding, the creator economy, and what it took to build KaNeXT OS from scratch.',
    thumbUri: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=200&h=200&fit=crop&q=80',
  },
  {
    id: 'press3',
    title: 'Inc. Magazine Creator Spotlight',
    publication: 'Inc.',
    date: 'Nov 2024',
    initials: 'Inc',
    hue: 200,
    blurb: 'Inc. spotlighted how Sammy merged professional athletics with creator entrepreneurship — and the platform he built to make it replicable.',
    thumbUri: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&h=200&fit=crop&q=80',
  },
  {
    id: 'press4',
    title: '\u201cBuilding in Public\u201d Podcast Feature',
    publication: 'Indie Hackers',
    date: 'Sep 2024',
    initials: 'IH',
    hue: 150,
    blurb: 'Pulled back the curtain on building KaNeXT OS in public \u2014 from first concept to first paying customer, with nothing held back.',
    thumbUri: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=200&h=200&fit=crop&q=80',
  },
];

export const PORTFOLIO_TESTIMONIALS: PortfolioTestimonial[] = [
  {
    id: 'test1',
    quote: "Sammy's content drove 3x our usual engagement on the summer campaign. Would work with him again in a heartbeat.",
    name: 'Sarah Chen',
    title: 'Marketing Director',
    company: 'Nike',
    stars: 5,
  },
  {
    id: 'test2',
    quote: 'The most professional creator we\'ve partnered with. He delivered everything on time, on brand, and over-performed on every metric.',
    name: 'Marcus Johnson',
    title: 'Brand Partnerships Lead',
    company: 'Gatorade',
    stars: 5,
  },
  {
    id: 'test3',
    quote: 'His coaching session changed how I think about content. Practical, direct, and actually useful — rare to find all three.',
    name: 'Alex Rivera',
    title: 'Subscriber',
    company: 'Inner Circle',
    stars: 5,
  },
];

export const PORTFOLIO_ARCHIVE: PortfolioArchiveItem[] = [
  {
    id: 'arch1',
    title: 'The Athlete Brand Playbook: From Zero to Six Figures',
    date: 'Apr 2025',
    readTime: '8 min',
    views: '4.2K',
    type: 'Article',
  },
  {
    id: 'arch2',
    title: 'This Week in Creator Business — Issue #42',
    date: 'Mar 2025',
    readTime: '5 min',
    views: '1.8K',
    type: 'Newsletter',
  },
  {
    id: 'arch3',
    title: 'Why I Turned Down a $200K Brand Deal',
    date: 'Feb 2025',
    readTime: '6 min',
    views: '9.1K',
    type: 'Essay',
  },
  {
    id: 'arch4',
    title: 'Building a Content System That Scales Without Burning Out',
    date: 'Jan 2025',
    readTime: '10 min',
    views: '3.4K',
    type: 'Article',
  },
  {
    id: 'arch5',
    title: 'This Week in Creator Business — Issue #38',
    date: 'Dec 2024',
    readTime: '4 min',
    views: '1.5K',
    type: 'Newsletter',
  },
  {
    id: 'arch6',
    title: 'On Visibility, Vulnerability, and Building in Public',
    date: 'Nov 2024',
    readTime: '7 min',
    views: '6.7K',
    type: 'Essay',
  },
];

export const PORTFOLIO_CREDENTIALS: PortfolioCredential[] = [
  {
    id: 'cred1',
    title: 'Certified Performance Coach',
    issuer: 'NSCA',
    year: '2023',
    icon: 'rosette',
    coverUri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop&q=80',
  },
  {
    id: 'cred2',
    title: 'Certified Personal Trainer',
    issuer: 'NASM',
    year: '2021',
    icon: 'checkmark.seal.fill',
    coverUri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=400&fit=crop&q=80',
  },
  {
    id: 'cred3',
    title: 'Keynote Speaker — NFLPA Summit',
    issuer: 'NFL Players Association',
    year: '2024',
    icon: 'mic.fill',
    coverUri: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=400&fit=crop&q=80',
  },
];
