/**
 * Mock data — Personal Mode Store.
 * 7 products across Digital, Course, Merch, Service, Free, Membership, Ticket.
 */

export type ProductType = 'Digital' | 'Course' | 'Merch' | 'Service' | 'Free' | 'Membership' | 'Ticket';

export interface StoreProduct {
  id: string;
  type: ProductType;
  title: string;
  description: string;
  price: number;
  unit: string | null;         // null = one-time | '/mo' | '/hr'
  sales: number;
  salesLabel: string;          // 'sold' | 'enrolled' | 'downloaded' | 'booked' | 'active'
  revenue: number;
  rating: number;
  ratingCount: number;
  coverHue: number;            // HSL hue for placeholder cover art
  coverUri?: string;           // real cover image (overrides hsl gradient)
  status: 'Published' | 'Draft';
  accessLevel: 'Public' | 'Subscribers Only';
  tags: string[];
  upsellId?: string;
}

export interface StoreReview {
  productId: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

export const PERSONAL_STORE_PRODUCTS: StoreProduct[] = [
  {
    id: '1', type: 'Digital', title: 'Content Strategy Playbook',
    description: 'The exact framework I use to plan, create, and distribute content across every platform. 47 pages, 12 templates, and a 90-day content calendar.',
    price: 29, unit: null, sales: 847, salesLabel: 'sold', revenue: 24563, rating: 4.9, ratingCount: 312,
    coverHue: 220, coverUri: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&h=400&fit=crop&q=80',
    status: 'Published', accessLevel: 'Public',
    tags: ['47 Pages', '12 Templates', '90-Day Calendar'], upsellId: '2',
  },
  {
    id: '2', type: 'Course', title: 'Creator Masterclass',
    description: '8-week live course covering audience building, monetization, brand deals, and scaling your creator business from 0 to 100K.',
    price: 149, unit: null, sales: 312, salesLabel: 'enrolled', revenue: 46488, rating: 4.8, ratingCount: 189,
    coverHue: 270, coverUri: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop&q=80',
    status: 'Published', accessLevel: 'Public',
    tags: ['8 Weeks', 'Live Sessions', 'Community'], upsellId: '6',
  },
  {
    id: '3', type: 'Merch', title: '"Build in Public" Hoodie',
    description: 'Premium heavyweight hoodie. 400gsm fleece. Embroidered logo on chest. Available in Bone, Slate, and Obsidian.',
    price: 45, unit: null, sales: 203, salesLabel: 'sold', revenue: 9135, rating: 4.7, ratingCount: 97,
    coverHue: 30, coverUri: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&h=400&fit=crop&q=80',
    status: 'Published', accessLevel: 'Public',
    tags: ['Unisex', '400gsm', 'Embroidered'],
  },
  {
    id: '4', type: 'Service', title: '1-on-1 Coaching Call',
    description: '60-minute strategy session. Bring your biggest challenge — content, brand deals, or growth. Come prepared, leave with a clear action plan.',
    price: 150, unit: '/hr', sales: 89, salesLabel: 'booked', revenue: 13350, rating: 5.0, ratingCount: 89,
    coverHue: 160, coverUri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop&q=80',
    status: 'Published', accessLevel: 'Public',
    tags: ['60 Min', 'Strategy', 'Action Plan'],
  },
  {
    id: '5', type: 'Free', title: 'Social Media Template Pack',
    description: '40 ready-to-use Canva templates for Instagram, TikTok, and LinkedIn. Drop in your content and post.',
    price: 0, unit: null, sales: 2400, salesLabel: 'downloaded', revenue: 0, rating: 4.6, ratingCount: 541,
    coverHue: 45, coverUri: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&h=400&fit=crop&q=80',
    status: 'Published', accessLevel: 'Public',
    tags: ['40 Templates', 'Canva', 'Multi-platform'], upsellId: '1',
  },
  {
    id: '6', type: 'Membership', title: 'Monthly Newsletter',
    description: "Weekly deep-dives on creator economy, brand strategy, and behind-the-scenes of what I'm building. First 3 issues free.",
    price: 5, unit: '/mo', sales: 186, salesLabel: 'active', revenue: 930, rating: 4.8, ratingCount: 134,
    coverHue: 195, coverUri: 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=600&h=400&fit=crop&q=80',
    status: 'Published', accessLevel: 'Public',
    tags: ['Weekly', 'Exclusive', 'First 3 Free'],
  },
  {
    id: '7', type: 'Ticket', title: 'Creator Summit 2026',
    description: 'Two-day in-person creator conference. 20+ speakers. Networking, workshops, and brand deal negotiations. NYC, Oct 2026.',
    price: 99, unit: null, sales: 450, salesLabel: 'sold', revenue: 44550, rating: 4.9, ratingCount: 203,
    coverHue: 350, coverUri: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop&q=80',
    status: 'Published', accessLevel: 'Public',
    tags: ['2 Days', 'NYC', 'Oct 2026'], upsellId: '2',
  },
];

export const STORE_REVIEWS: StoreReview[] = [
  { productId: '1', author: 'Marcus Johnson', rating: 5, date: 'Apr 8',  text: 'Worth every penny. The 90-day calendar alone saved me 6+ hours of planning a month.' },
  { productId: '1', author: 'Priya K.',       rating: 5, date: 'Apr 5',  text: 'Finally a content system that works for short-form creators. Engagement up 40%.' },
  { productId: '1', author: 'Tyler B.',        rating: 4, date: 'Mar 28', text: 'Solid frameworks. A bit dense in places but full of actionable insights.' },
  { productId: '2', author: 'Aisha M.',        rating: 5, date: 'Mar 30', text: 'Week 3 alone paid for the whole course. The brand deal module is fire.' },
  { productId: '2', author: 'Jordan W.',       rating: 5, date: 'Mar 25', text: 'The community makes this — Sammy is super active answering questions daily.' },
  { productId: '4', author: 'Sofia R.',        rating: 5, date: 'Apr 11', text: 'Left our call with a complete 90-day plan. No fluff, all execution.' },
  { productId: '7', author: 'Marcus Johnson',  rating: 5, date: 'Apr 7',  text: 'The brand deal simulation was insane. Walked away with two warm intros.' },
];

// IDs the demo "follower" has already purchased (shown in My Purchases shelf)
export const MY_PURCHASES_IDS = ['5', '1'];
