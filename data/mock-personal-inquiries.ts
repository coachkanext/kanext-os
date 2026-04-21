/**
 * Mock data for the Personal Mode Inquiries screen.
 * Inbound brand deals, collaborations, speaking requests, custom service inquiries.
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type InquiryType   = 'Brand Deal' | 'Collaboration' | 'Speaking' | 'Custom Request';
export type InquiryStatus = 'New' | 'In Discussion' | 'Accepted' | 'Declined';

export interface InquiryMessage {
  id: string;
  from: 'sender' | 'owner';
  text: string;
  time: string;
}

export interface PersonalInquiry {
  id: string;
  title: string;
  senderName: string;
  senderCompany: string;
  senderEmail: string;
  senderWebsite?: string;
  type: InquiryType;
  status: InquiryStatus;
  dateReceived: string;
  initials: string;
  hue: number;
  avatarUri?: string;
  description: string;
  proposedTimeline?: string;
  proposedBudget?: string;
  messages: InquiryMessage[];
}

// ── Rate Card Services (for Follower "Work with me" view) ──────────────────────

export interface RateService {
  id: string;
  title: string;
  starting: string;
  icon: string;
}

export const RATE_SERVICES: RateService[] = [
  { id: 'r1', title: 'Sponsored Reel',       starting: '$8,000',  icon: 'play.circle.fill'        },
  { id: 'r2', title: 'Sponsored Post',        starting: '$3,500',  icon: 'photo.fill'              },
  { id: 'r3', title: 'Brand Ambassador',      starting: '$72,000', icon: 'person.fill.checkmark'   },
  { id: 'r4', title: 'KTV Long-Form Video',   starting: '$12,000', icon: 'video.fill'              },
  { id: 'r5', title: 'Speaking / Keynote',    starting: '$5,000',  icon: 'mic.fill'                },
  { id: 'r6', title: '1-on-1 Coaching',       starting: '$500',    icon: 'person.2.fill'           },
];

export const TRUSTED_BY: { id: string; name: string; initials: string; hue: number; logoUri?: string }[] = [
  { id: 'tb1', name: 'Nike',         initials: 'N',  hue: 0,   logoUri: undefined          },
  { id: 'tb2', name: 'Gatorade',     initials: 'G',  hue: 30,  logoUri: undefined      },
  { id: 'tb3', name: 'Under Armour', initials: 'UA', hue: 200, logoUri: undefined   },
];

// ── Inquiries ──────────────────────────────────────────────────────────────────

export const PERSONAL_INQUIRIES: PersonalInquiry[] = [
  {
    id: 'inq1',
    title: 'Nike Summer Campaign 2026',
    senderName: 'Sarah Chen',
    senderCompany: 'Nike',
    senderEmail: 'sarah.chen@nike.com',
    senderWebsite: 'nike.com',
    type: 'Brand Deal',
    status: 'New',
    dateReceived: 'Apr 10, 2026',
    initials: 'SC',
    hue: 10,
    avatarUri: undefined,
    description: "Looking to partner for a 3-part summer training campaign across Instagram and KTV. Similar to last year's program — would love to discuss scope and a longer-term ambassador extension if performance benchmarks are hit.",
    proposedTimeline: 'June – August 2026',
    proposedBudget: '$30,000–$45,000',
    messages: [
      { id: 'm1', from: 'sender', text: "Hi Sammy! We loved the Q1 campaign last year and would love to bring you back for Summer 2026. Are you available to discuss?", time: 'Apr 10, 2:14 PM' },
    ],
  },
  {
    id: 'inq2',
    title: 'Joint Content Series',
    senderName: 'Alex Rivera',
    senderCompany: '@alexcreates',
    senderEmail: 'alex@alexrivera.co',
    senderWebsite: 'alexrivera.co',
    type: 'Collaboration',
    status: 'In Discussion',
    dateReceived: 'Apr 7, 2026',
    initials: 'AR',
    hue: 160,
    avatarUri: undefined,
    description: 'Proposing a 4-part YouTube + KTV series on creator finance and personal branding. Each creator brings their own audience. Revenue split on sponsorships. Looking at a May launch.',
    proposedTimeline: 'May – June 2026',
    proposedBudget: 'Revenue share',
    messages: [
      { id: 'm2', from: 'sender', text: "Hey! Big fan of your work. I've been thinking about a collab series — would you be open to a call this week?", time: 'Apr 7, 10:32 AM' },
      { id: 'm3', from: 'owner',  text: "Hey Alex! Yes, big fan of yours too. Let's do it — send over a brief and we can set up a call.", time: 'Apr 7, 3:01 PM' },
      { id: 'm4', from: 'sender', text: 'Just sent a deck to your email. Looking at 4 episodes, revenue share on sponsorships. Let me know your thoughts!', time: 'Apr 8, 9:15 AM' },
    ],
  },
  {
    id: 'inq3',
    title: 'Creator Economy Summit Keynote',
    senderName: 'Jordan Ellis',
    senderCompany: 'Events Co.',
    senderEmail: 'jordan@eventsco.io',
    senderWebsite: 'eventsco.io',
    type: 'Speaking',
    status: 'New',
    dateReceived: 'Apr 9, 2026',
    initials: 'JE',
    hue: 260,
    avatarUri: undefined,
    description: '45-minute keynote at the Creator Economy Summit in Atlanta, GA. Audience of ~800 creators, brand marketers, and investors. Topic: building sustainable creator businesses beyond social media.',
    proposedTimeline: 'July 18, 2026',
    proposedBudget: '$8,000 + travel',
    messages: [
      { id: 'm5', from: 'sender', text: "Hi Sammy — we'd love to have you as our opening keynote speaker at the Creator Economy Summit in July. Would you be interested?", time: 'Apr 9, 11:04 AM' },
    ],
  },
  {
    id: 'inq4',
    title: 'Custom Coaching Package',
    senderName: 'Marcus Johnson',
    senderCompany: 'Independent',
    senderEmail: 'marcus.j@gmail.com',
    type: 'Custom Request',
    status: 'In Discussion',
    dateReceived: 'Apr 5, 2026',
    initials: 'MJ',
    hue: 45,
    avatarUri: undefined,
    description: 'Looking for a 3-month intensive coaching program covering content strategy, brand partnerships, and audience monetization. Flexible on format — weekly calls, async feedback, or a mix.',
    proposedTimeline: 'May – July 2026',
    proposedBudget: '$2,500',
    messages: [
      { id: 'm6', from: 'sender', text: "Hey Sammy, I've been following your work for a while and I'm ready to invest in myself. Do you offer extended coaching programs?", time: 'Apr 5, 8:47 AM' },
      { id: 'm7', from: 'owner',  text: "Hey Marcus! Yes, I do 3-month intensives. Let me send you the details. What are your main goals?", time: 'Apr 5, 2:20 PM' },
      { id: 'm8', from: 'sender', text: 'Primarily want to land my first brand deal and hit 10K subscribers on YouTube by Q3. Is that realistic?', time: 'Apr 5, 4:33 PM' },
    ],
  },
  {
    id: 'inq5',
    title: 'Gatorade Q3 Ambassador Extension',
    senderName: 'Marcus Lee',
    senderCompany: 'Gatorade',
    senderEmail: 'marcus.lee@gatorade.com',
    senderWebsite: 'gatorade.com',
    type: 'Brand Deal',
    status: 'Accepted',
    dateReceived: 'Mar 28, 2026',
    initials: 'ML',
    hue: 30,
    avatarUri: undefined,
    description: 'Extension of the Q1 ambassador agreement into Q3. Same deliverables cadence: 4 posts/month, 2 reels, 1 KTV long-form. Annual rate adjusted for performance metrics from Q1.',
    proposedTimeline: 'July – September 2026',
    proposedBudget: '$94,000/yr (pro-rated Q3)',
    messages: [
      { id: 'm9',  from: 'sender', text: "Sammy — Q1 numbers were outstanding. We'd love to extend the partnership through Q3. Can we talk terms?", time: 'Mar 28, 9:12 AM' },
      { id: 'm10', from: 'owner',  text: "Absolutely. I'm in. Let's lock in the deliverables and I'll have my team review the contract.", time: 'Mar 28, 1:44 PM' },
      { id: 'm11', from: 'sender', text: 'Sending the contract to your email now. Rate adjusted to $94K annualized. Welcome back!', time: 'Mar 29, 10:00 AM' },
    ],
  },
];
