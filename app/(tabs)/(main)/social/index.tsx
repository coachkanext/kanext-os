/**
 * Personal Social — Feed (High Fidelity)
 *
 * Universal social feed with card-based posts.
 * Role-aware: Owner (full management) vs Subscriber (consumer view)
 * Feed: post composer (Owner), filter pills, post cards
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet,
  Animated, Alert, Image,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { useMode } from '@/context/app-context';

// ── Semantic data colors ──────────────────────────────────────────────────────

const CAUTION = '#B8943E';
const EMBER   = '#8B2500';

// ── Mode config ───────────────────────────────────────────────────────────────

type ModeConfig = {
  roleKey: string;
  filterOptions: string[];
  visOptions: string[];
  composerName: string;
  composerInitial: string;
  composerBg: string;
  memberComposerName: string;
  memberComposerInitial: string;
  memberComposerBg: string;
  memberCanPost: boolean;
  posts: Post[];
  lockedVisibility?: string; // visibility value that lower-role users cannot read
};

// MODE_CONFIG is defined after the post arrays below

// ── Author avatar palette ─────────────────────────────────────────────────────

const AUTHOR_META: Record<string, { bg: string }> = {
  // Personal
  'Sammy Kalejaiye': { bg: '#1A1714' },
  'Nike':            { bg: '#111111' },
  'Alex Rivera':     { bg: '#2E5B3E' },
  'KaNeXT':          { bg: '#1E3A28' },
  'Marcus Johnson':  { bg: '#4A3525' },
  'Gary Vaynerchuk': { bg: '#7A3B10' },
  'Emma Chen':       { bg: '#5A3A4A' },
  'Jordan Wells':    { bg: '#1A3A5A' },
  'Reebok':          { bg: '#8B1A1A' },
  'Lena Park':       { bg: '#3A4A2E' },
  'The Verge':       { bg: '#2A1A3A' },
  'Chris Doe':       { bg: '#2A3A4A' },
  // Community
  'ICCLA':           { bg: '#2E3A28' },
  'Pastor Davis':    { bg: '#1A2A1A' },
  'Grace Miller':    { bg: '#3A2E4A' },
  'Elder James':     { bg: '#2A2A3A' },
  'Sister Joy':      { bg: '#4A2E2E' },
  'David Thompson':  { bg: '#2E3A4A' },
  'Rachel Green':    { bg: '#3A4A2E' },
  // Sports
  "Lincoln Basketball": { bg: '#1A2E4A' },
  'Coach Marcus':       { bg: '#1A1A2E' },
  'Laolu Omolade':      { bg: '#2E1A1A' },
  'Lincoln Men\'s Basketball': { bg: '#1A2E4A' },
  'Isaiah Grant':       { bg: '#1A3A2E' },
  'Darius Cole':        { bg: '#3A2E1A' },
  'Team Account':       { bg: '#2A1A3A' },
  // Business
  'KaNeXT CEO':         { bg: '#1E3A28' },
  'Product Team':       { bg: '#2A3A2A' },
  'Marketing':          { bg: '#3A2A1A' },
  // Education
  'Lincoln University': { bg: '#3A2E1A' },
  'President Evans':    { bg: '#2A1A3A' },
  'Dean of Students':   { bg: '#1A2A3A' },
  'Prof. Williams':     { bg: '#3A3A1A' },
  'Student Life':       { bg: '#2E3A3A' },
};

const getAuthorMeta = (name: string) => AUTHOR_META[name] ?? { bg: '#333333' };

// ── Types ─────────────────────────────────────────────────────────────────────

type AuthorKind = 'owner' | 'creator' | 'brand' | 'company';

type Post = {
  id: string;
  author: string;
  handle: string;
  kind: AuthorKind;
  content: string;
  timestamp: string;
  visibility: string; // 'Public' | 'Subscribers Only' | 'Community' | 'Leadership' | 'Team' | 'Company' | 'Institutional'
  pinned?: boolean;
  scheduled?: boolean;
  scheduledTime?: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  imageUri?: string;
  mediaTag?: 'PHOTO' | 'VIDEO';
  repost?: boolean;
};

// ── Static data ───────────────────────────────────────────────────────────────

const POSTS: Post[] = [
  {
    id: '1',
    author: 'Sammy Kalejaiye', handle: '@sammyk', kind: 'owner',
    content: 'Just hit a major milestone — sharing the exact framework I used to grow from 0 to 10K in 90 days. Full breakdown dropping in the resources channel.',
    timestamp: '2h ago',
    visibility: 'Public',
    pinned: true,
    likes: 247, comments: 38, shares: 91, views: 3820,
  },
  {
    id: '2',
    author: 'Nike', handle: '@nike', kind: 'brand',
    content: "Summer campaign applications are open. We're looking for creators who move culture — not just followers. DM us your media kit.",
    timestamp: '4h ago',
    visibility: 'Public',
    imageUri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=450&fit=crop&q=80',
    mediaTag: 'PHOTO',
    likes: 8420, comments: 312, shares: 1840, views: 94300,
  },
  {
    id: '3',
    author: 'Sammy Kalejaiye', handle: '@sammyk', kind: 'owner',
    content: "The one thing nobody tells you about brand deals: the rate card matters less than the relationship. I turned down a $15K deal last week because of a bad-fit brand. Here's why that was the right call...",
    timestamp: '1d ago',
    visibility: 'Subscribers Only',
    likes: 89, comments: 24, shares: 12, views: 1240,
  },
  {
    id: '4',
    author: 'Alex Rivera', handle: '@alexcreates', kind: 'creator',
    content: 'Just crossed 50K subscribers. Here\'s what I actually learned:\n\n1. Your first 1K is the hardest\n2. Consistency > quality early on\n3. The algorithm rewards completion rate\n4. Comments are your best research tool\n5. Burnout is real — build rest into your schedule',
    timestamp: '1d ago',
    visibility: 'Public',
    imageUri: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&h=450&fit=crop&q=80',
    mediaTag: 'VIDEO',
    likes: 2140, comments: 418, shares: 673, views: 31200,
  },
  {
    id: '5',
    author: 'KaNeXT', handle: '@kanext', kind: 'company',
    content: 'v2.0 is live. The operating system for creators, teams, and institutions. One platform. Every mode.',
    timestamp: '2d ago',
    visibility: 'Public',
    imageUri: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=450&fit=crop&q=80',
    mediaTag: 'PHOTO',
    likes: 1870, comments: 203, shares: 891, views: 28400,
  },
  {
    id: '6',
    author: 'Marcus Johnson', handle: '@marcusj', kind: 'creator',
    content: 'My content strategy for Q2. Thread below.\n\nFocus: 3 long-form YouTube videos per month. Everything else (Shorts, IG, TikTok) is repurposed from those 3 pieces. Stop creating for every platform independently.',
    timestamp: '3d ago',
    visibility: 'Public',
    likes: 934, comments: 187, shares: 342, views: 14600,
  },
  {
    id: '7',
    author: 'Sammy Kalejaiye', handle: '@sammyk', kind: 'owner',
    content: 'Content audit template I use every quarter. Drop a 🔥 in comments if you want a full breakdown of how to run your own audit.',
    timestamp: '5d ago',
    visibility: 'Subscribers Only',
    likes: 143, comments: 57, shares: 28, views: 1890,
  },
  {
    id: '8',
    author: 'Gary Vaynerchuk', handle: '@garyvee', kind: 'creator',
    content: "The creator economy is not a bubble. It's a restructuring of attention. The brands that figure out how to work WITH creators instead of THROUGH agencies are going to win the next decade.",
    timestamp: '6d ago',
    visibility: 'Public',
    repost: true,
    likes: 18400, comments: 2310, shares: 5670, views: 284000,
  },
  {
    id: '9',
    author: 'Sammy Kalejaiye', handle: '@sammyk', kind: 'owner',
    content: "March P&L breakdown — just for subscribers.\n\nRevenue: $18,400\n• Subscriptions: $9,200\n• Brand deals: $7,500\n• Digital products: $1,700\n\nExpenses: $4,100\n• Tools & software: $890\n• Studio time: $1,200\n• Editor: $2,010\n\nNet: $14,300. Here's what I'm reinvesting and what I'm keeping liquid...",
    timestamp: '7h ago',
    visibility: 'Subscribers Only',
    likes: 312, comments: 84, shares: 0, views: 2140,
  },
  {
    id: '10',
    author: 'Alex Rivera', handle: '@alexcreates', kind: 'creator',
    content: "How I research a YouTube video before I write a single word:\n\n1. Search the topic + sort by Views\n2. Note the 3 highest-performing thumbnails\n3. Read the top 20 comments on each\n4. Find the question nobody answered\n5. That's your angle\n\nThe best videos answer questions people didn't know they had.",
    timestamp: '7h ago',
    visibility: 'Public',
    imageUri: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=450&fit=crop&q=80',
    mediaTag: 'VIDEO',
    likes: 3240, comments: 521, shares: 1140, views: 42800,
  },
  {
    id: '11',
    author: 'Sammy Kalejaiye', handle: '@sammyk', kind: 'owner',
    content: "The email I sent that landed a $30K brand deal. Full script below.\n\nSubject line: \"[First name] — 3 reasons [Brand] should be in front of my audience\"\n\nBody:\nHi [Name],\n\nI'll keep this short...\n\n(Members only — full script in the resources channel)",
    timestamp: '1d ago',
    visibility: 'Subscribers Only',
    likes: 203, comments: 61, shares: 0, views: 1870,
  },
  {
    id: '12',
    author: 'Reebok', handle: '@reebok', kind: 'brand',
    content: "We're partnering with 10 independent creators for the Classic Leather relaunch. No agency middlemen. Direct contracts. Full creative control.\n\nApplications open to this community first. Link in bio.",
    timestamp: '10h ago',
    visibility: 'Public',
    imageUri: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&h=450&fit=crop&q=80',
    mediaTag: 'PHOTO',
    likes: 4120, comments: 608, shares: 2310, views: 61400,
  },
  {
    id: '13',
    author: 'Sammy Kalejaiye', handle: '@sammyk', kind: 'owner',
    content: "I negotiate every brand deal with one rule: never accept the first offer.\n\nHere's my 3-step counter-offer framework:\n\n1. Always ask for 15% more than they offer\n2. Add a usage rights clause (2x your day rate per year)\n3. Request kill fee language upfront\n\nThis alone added $40K to my brand deal income last year.",
    timestamp: '2d ago',
    visibility: 'Subscribers Only',
    likes: 418, comments: 93, shares: 0, views: 3290,
  },
  {
    id: '14',
    author: 'Marcus Johnson', handle: '@marcusj', kind: 'creator',
    content: "YouTube changed the algorithm again. Here's what actually changed (and what didn't):\n\nChanged: Click-through rate matters less than watch time in the first 30 seconds\nChanged: Shorts now feed long-form if you cross-post intelligently\nDidn't change: Consistency still beats everything\n\nFull breakdown in the video ↓",
    timestamp: '14h ago',
    visibility: 'Public',
    imageUri: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800&h=450&fit=crop&q=80',
    mediaTag: 'VIDEO',
    likes: 1870, comments: 342, shares: 891, views: 28100,
  },
  {
    id: '15',
    author: 'Sammy Kalejaiye', handle: '@sammyk', kind: 'owner',
    content: "Recorded a 90-minute deep-dive on the exact content system I use — from ideation to upload to monetization. Dropping it in the resources channel this Friday.\n\nSubscribers get early access + the full workflow template as a bonus.",
    timestamp: '3d ago',
    visibility: 'Subscribers Only',
    likes: 176, comments: 44, shares: 0, views: 2010,
  },
  {
    id: '16',
    author: 'Emma Chen', handle: '@emmacreates', kind: 'creator',
    content: "Took 6 months off social media to focus on product.\n\nRevenue went UP 34%.\n\nThe lesson: audience attention isn't the same as customer attention. Build for buyers, not viewers.",
    timestamp: '18h ago',
    visibility: 'Public',
    likes: 6820, comments: 934, shares: 2840, views: 89200,
  },
  {
    id: '17',
    author: 'Jordan Wells', handle: '@jordanwells', kind: 'creator',
    content: "12-week transformation challenge starts Monday. Open to everyone in this community.\n\n• Daily check-in thread in #general\n• Weekly live session every Sunday 7pm ET\n• Accountability partners matched in week 1\n\nComment 'IN' to be added to the list.",
    timestamp: '22h ago',
    visibility: 'Public',
    imageUri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=450&fit=crop&q=80',
    mediaTag: 'VIDEO',
    likes: 2910, comments: 1240, shares: 673, views: 34800,
  },
  {
    id: '18',
    author: 'Sammy Kalejaiye', handle: '@sammyk', kind: 'owner',
    content: "Q&A responses — part 1.\n\n@jess_m: How do you handle creative burnout?\nMy honest answer: I don't try to push through it. I have a 'slow week' protocol — light content, heavy thinking. Always leads to better output.\n\n@coachtyler: When should I charge for my content?\nEarlier than you think. The pricing conversation is the most valuable one you'll ever have with yourself.",
    timestamp: '4d ago',
    visibility: 'Subscribers Only',
    likes: 287, comments: 112, shares: 0, views: 2740,
  },
  {
    id: '19',
    author: 'Sammy Kalejaiye', handle: '@sammyk', kind: 'owner',
    content: "Behind the scenes: what it actually cost to build this community from zero.\n\nYear 1 losses: $12K\nYear 2 break-even: month 9\nYear 3 first $10K month: June\n\nThe thing nobody tells you — the first 18 months feel like you're building in the dark. Then the flywheel kicks in and everything compounds. Stick with it.",
    timestamp: '6d ago',
    visibility: 'Subscribers Only',
    likes: 534, comments: 148, shares: 0, views: 4820,
  },
  {
    id: '20',
    author: 'Emma Chen', handle: '@emmacreates', kind: 'creator',
    content: "The creator I study most isn't in tech or business. It's Virgil Abloh.\n\nHe treated everything as a draft — '3% rule': change any existing thing by just 3% and it becomes yours.\n\nEvery piece of content I make, I ask: what's my 3%?",
    timestamp: '2d ago',
    visibility: 'Public',
    imageUri: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=450&fit=crop&q=80',
    mediaTag: 'PHOTO',
    likes: 4380, comments: 612, shares: 1820, views: 57300,
  },
  {
    id: '21',
    author: 'KaNeXT', handle: '@kanext', kind: 'company',
    content: "Product roadmap — Q2 2026 (subscribers only preview).\n\n• KaNeXT Spaces — live rooms for brand-gated audio sessions\n• Subscriber tiers 2.0 — custom perks per tier\n• KPay direct payouts — same-day creator transfers\n• Analytics v3 — cohort retention, churn signals, LTV\n\nPublic announcement drops May 1.",
    timestamp: '1w ago',
    visibility: 'Subscribers Only',
    likes: 891, comments: 217, shares: 0, views: 7840,
  },
  {
    id: '22',
    author: 'Lena Park', handle: '@lenapark', kind: 'creator',
    content: "I turned my newsletter into a $140K/year business. Here's the full breakdown:\n\n• 14,200 subscribers (free: 12,800 / paid: 1,400)\n• $9.99/month paid tier\n• 3 sponsored issues/month @ $3,500 each\n• 1 annual cohort course @ $2,400\n\nRevenue = subscriptions ($16.8K) + sponsors ($126K) + course (~$14.4K) = $157K gross",
    timestamp: '2d ago',
    visibility: 'Public',
    imageUri: 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=800&h=450&fit=crop&q=80',
    mediaTag: 'PHOTO',
    likes: 9140, comments: 1830, shares: 4210, views: 128000,
  },
  {
    id: '23',
    author: 'Gary Vaynerchuk', handle: '@garyvee', kind: 'creator',
    content: "Stop waiting for permission to be a creator. Nobody is going to tap you on the shoulder and say 'now it's your time.' You have to decide that it's your time and then go.",
    timestamp: '3d ago',
    visibility: 'Public',
    likes: 24800, comments: 3140, shares: 8920, views: 412000,
  },
  {
    id: '24',
    author: 'The Verge', handle: '@theverge', kind: 'company',
    content: "The creator middle class is real and growing. New data: 47% of full-time creators now earn between $50K–$200K annually. Three years ago that number was 18%.\n\nThe platform wars are over. Creators won.",
    timestamp: '4d ago',
    visibility: 'Public',
    likes: 7340, comments: 892, shares: 3410, views: 94700,
  },
  {
    id: '25',
    author: 'Chris Doe', handle: '@chrisdoe', kind: 'creator',
    content: "Nobody talks about the loneliness of building in public.\n\nYou're celebrating milestones that most people in your life don't understand. Your wins feel small to others. Your struggles feel invisible.\n\nFind your people. This community is mine.",
    timestamp: '5d ago',
    visibility: 'Public',
    likes: 5610, comments: 2140, shares: 1830, views: 71200,
  },
];

// ── Community posts ───────────────────────────────────────────────────────────

const COMMUNITY_POSTS: Post[] = [
  {
    id: 'cp1',
    author: 'ICCLA', handle: '@iccla', kind: 'company',
    content: 'Easter Week services are confirmed: April 19–21. Good Friday at 7PM, Easter Sunday at 8AM and 11AM. Invite someone this week. Registration link in bio.',
    timestamp: '1h ago',
    visibility: 'Public',
    pinned: true,
    imageUri: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800&h=450&fit=crop&q=80',
    mediaTag: 'PHOTO',
    likes: 412, comments: 67, shares: 183, views: 5840,
  },
  {
    id: 'cp2',
    author: 'Pastor Davis', handle: '@pastordavis', kind: 'owner',
    content: "This week's message: 'Walking in Purpose' — Romans 8:28.\n\nWhat an incredible morning. Thank you to everyone who came out. If you missed it, the full message is on our channel. Share it with someone who needs it.",
    timestamp: '3h ago',
    visibility: 'Public',
    likes: 287, comments: 54, shares: 91, views: 3210,
  },
  {
    id: 'cp3',
    author: 'Pastor Davis', handle: '@pastordavis', kind: 'owner',
    content: "Leadership debrief from Sunday.\n\nAttendance: 847 (up 12% from last month)\nFirst-time visitors: 34\nSalvations: 6\n\nPrayer focus this week: retention of new visitors. Every elder please follow up with your assigned newcomers by Thursday.",
    timestamp: '5h ago',
    visibility: 'Leadership',
    likes: 48, comments: 19, shares: 0, views: 312,
  },
  {
    id: 'cp4',
    author: 'Grace Miller', handle: '@gracemiller', kind: 'creator',
    content: 'Worship practice tonight at 6PM. All vocalists and musicians — full run-through for Easter Sunday. Please be on time, we have a lot to cover.',
    timestamp: '8h ago',
    visibility: 'Community',
    likes: 134, comments: 28, shares: 12, views: 1840,
  },
  {
    id: 'cp5',
    author: 'Sister Joy', handle: '@sisterjoy', kind: 'creator',
    content: 'Community outreach report — this Saturday we served 217 meals at the Inglewood shelter. Thank you to every volunteer who showed up at 7AM. This is what the church looks like in action.',
    timestamp: '1d ago',
    visibility: 'Public',
    imageUri: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&h=450&fit=crop&q=80',
    mediaTag: 'PHOTO',
    likes: 523, comments: 81, views: 6420, shares: 214,
  },
  {
    id: 'cp6',
    author: 'Elder James', handle: '@elderjames', kind: 'creator',
    content: 'Youth retreat sign-ups close Friday. We have 12 spots remaining. Ages 13–18. Cost covered by the church for any family in need — no one sits out because of finances. Email the office.',
    timestamp: '1d ago',
    visibility: 'Community',
    likes: 198, comments: 43, shares: 67, views: 2310,
  },
  {
    id: 'cp7',
    author: 'ICCLA', handle: '@iccla', kind: 'company',
    content: "Monthly giving report — March 2026.\n\nTotal giving: $31,400\nBuilding fund: $8,200\nMissions: $4,100\nOperations: $19,100\n\nThank you for your faithfulness. Every dollar is stewarded with care.",
    timestamp: '2d ago',
    visibility: 'Leadership',
    likes: 62, comments: 11, shares: 0, views: 408,
  },
  {
    id: 'cp8',
    author: 'David Thompson', handle: '@dthompson', kind: 'creator',
    content: "Bible study recap — we're finishing Philippians this week. The room was packed. Iron sharpens iron. Join us every Wednesday at 7PM, Room 204.",
    timestamp: '2d ago',
    visibility: 'Community',
    likes: 167, comments: 32, shares: 28, views: 1920,
  },
  {
    id: 'cp9',
    author: 'Grace Miller', handle: '@gracemiller', kind: 'creator',
    content: "New worship album 'Grateful' is live on all platforms. This project took 14 months and a lot of prayer. Every song has a story. Starting from the top this Sunday.",
    timestamp: '3d ago',
    visibility: 'Public',
    imageUri: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=450&fit=crop&q=80',
    mediaTag: 'VIDEO',
    likes: 634, comments: 112, shares: 203, views: 8740,
  },
  {
    id: 'cp10',
    author: 'Rachel Green', handle: '@rgreen', kind: 'creator',
    content: 'Prayer request thread for this week. Drop yours below — we pray over every single one as a team. Nothing is too small. Nothing is too big.',
    timestamp: '4d ago',
    visibility: 'Community',
    likes: 312, comments: 148, shares: 44, views: 3810,
  },
];

// ── Sports posts ──────────────────────────────────────────────────────────────

const SPORTS_POSTS: Post[] = [
  {
    id: 'sp1',
    author: "Lincoln Men's Basketball", handle: '@lincolnmbb', kind: 'company',
    content: "Season opener Friday night. 7PM vs. San Francisco State. Home court. Student section fills first — get there early. Let's make it loud.",
    timestamp: '2h ago',
    visibility: 'Public',
    pinned: true,
    imageUri: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800&h=450&fit=crop&q=80',
    mediaTag: 'PHOTO',
    likes: 891, comments: 134, shares: 312, views: 14200,
  },
  {
    id: 'sp2',
    author: 'Coach Marcus', handle: '@coachmb', kind: 'owner',
    content: "Film session recap — Tuesday.\n\nWe gave up 14 second-chance points against Chico State. That ends this week. Help-side rotation and box-out assignments are mandatory review before Thursday practice. Everyone watches the clip package.",
    timestamp: '6h ago',
    visibility: 'Team',
    likes: 67, comments: 23, shares: 0, views: 412,
  },
  {
    id: 'sp3',
    author: 'Laolu Omolade', handle: '@laoloo', kind: 'creator',
    content: "28 points. 11 rebounds. Another night at the office.\n\nGrateful for the team — nobody gets those numbers alone. Big game Friday, let's be ready.",
    timestamp: '1d ago',
    visibility: 'Public',
    imageUri: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800&h=450&fit=crop&q=80',
    mediaTag: 'PHOTO',
    likes: 1240, comments: 218, shares: 441, views: 19800,
  },
  {
    id: 'sp4',
    author: 'Coach Marcus', handle: '@coachmb', kind: 'owner',
    content: "Official recruiting visit recap — three prospects on campus this weekend.\n\nQuality over quantity. We're building the right culture. More updates to come once decisions are made.",
    timestamp: '1d ago',
    visibility: 'Team',
    likes: 84, comments: 17, shares: 0, views: 531,
  },
  {
    id: 'sp5',
    author: 'Isaiah Grant', handle: '@isaiahg', kind: 'creator',
    content: '5:30AM weights. Before the sun comes up. No shortcuts, no excuses. This is the standard.',
    timestamp: '2d ago',
    visibility: 'Team',
    likes: 112, comments: 34, shares: 0, views: 720,
  },
  {
    id: 'sp6',
    author: "Lincoln Men's Basketball", handle: '@lincolnmbb', kind: 'company',
    content: 'Season record: 8–2. Leading the conference in rebounding (42.1/game) and assist-to-turnover ratio (2.3). The process is working.',
    timestamp: '2d ago',
    visibility: 'Public',
    likes: 673, comments: 89, shares: 201, views: 11400,
  },
  {
    id: 'sp7',
    author: 'Darius Cole', handle: '@dcole', kind: 'creator',
    content: "Shoutout to @laoloo for being the first to the gym every single morning this season. That's leadership. That's why this team is different.",
    timestamp: '3d ago',
    visibility: 'Public',
    likes: 934, comments: 147, shares: 312, views: 15600,
  },
  {
    id: 'sp8',
    author: 'Coach Marcus', handle: '@coachmb', kind: 'owner',
    content: "Academic check-in — midterm grades are in.\n\nTeam GPA: 3.12. Three players on the Dean's List. One player on academic watch — we handle it internally and we handle it together. Education first, always.",
    timestamp: '4d ago',
    visibility: 'Team',
    likes: 58, comments: 9, shares: 0, views: 371,
  },
];

// ── Business posts ────────────────────────────────────────────────────────────

const BUSINESS_POSTS: Post[] = [
  {
    id: 'bp1',
    author: 'KaNeXT', handle: '@kanext', kind: 'company',
    content: 'Q1 2026 recap: 12,400 new users. 94% 30-day retention. $2.1M ARR. We are building something real. Thank you to every user, every team member, every believer.',
    timestamp: '1h ago',
    visibility: 'Public',
    pinned: true,
    imageUri: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop&q=80',
    mediaTag: 'PHOTO',
    likes: 1840, comments: 241, shares: 712, views: 28400,
  },
  {
    id: 'bp2',
    author: 'KaNeXT CEO', handle: '@kanextceo', kind: 'owner',
    content: "All-hands recap — April.\n\nQ2 priorities:\n1. KaNeXT Spaces (GA by May 15)\n2. KPay direct payouts (beta with 100 creators)\n3. Analytics v3 (cohort + LTV dashboard)\n\nEveryone has a clear owner. No ambiguity. Let's execute.",
    timestamp: '4h ago',
    visibility: 'Company',
    likes: 94, comments: 31, shares: 0, views: 612,
  },
  {
    id: 'bp3',
    author: 'Product Team', handle: '@kanextproduct', kind: 'creator',
    content: 'KaNeXT Spaces is live in beta. Real-time audio rooms for every brand. Drop-in. Gated by subscription tier. Available in Personal and Community modes first. Full rollout next month.',
    timestamp: '1d ago',
    visibility: 'Public',
    imageUri: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=450&fit=crop&q=80',
    mediaTag: 'PHOTO',
    likes: 2310, comments: 418, shares: 934, views: 41200,
  },
  {
    id: 'bp4',
    author: 'Marketing', handle: '@kanextmktg', kind: 'creator',
    content: "March campaign performance.\n\nSignups: 3,412 (+28% vs target)\nCAC: $14.20\nTop channel: creator referrals (41%)\n\nCreator word-of-mouth is our best acquisition channel. Double down on the referral program in Q2.",
    timestamp: '2d ago',
    visibility: 'Company',
    likes: 78, comments: 22, shares: 0, views: 501,
  },
  {
    id: 'bp5',
    author: 'KaNeXT', handle: '@kanext', kind: 'company',
    content: "We're hiring.\n\n• Senior iOS Engineer\n• Senior Backend Engineer (Node/Postgres)\n• Product Designer\n\nRemote-first. Equity. Mission-driven. Apply at kanext.com/careers or DM directly.",
    timestamp: '2d ago',
    visibility: 'Public',
    likes: 1120, comments: 187, shares: 634, views: 18400,
  },
  {
    id: 'bp6',
    author: 'KaNeXT CEO', handle: '@kanextceo', kind: 'owner',
    content: "OKR scorecard — Q1 closed.\n\nUser Growth: 112% of target ✓\nRevenue: 98% of target ✓\nNPS: 71 (up from 64 in Q4) ✓\nEng velocity: 89% sprint completion ✓\n\nStrong quarter. Raising the bar for Q2.",
    timestamp: '3d ago',
    visibility: 'Company',
    likes: 103, comments: 28, shares: 0, views: 688,
  },
  {
    id: 'bp7',
    author: 'KaNeXT', handle: '@kanext', kind: 'company',
    content: 'The operating system for every ambition.\n\nPersonal. Business. Education. Sports. Community.\n\nOne platform. Every mode. Every role.',
    timestamp: '4d ago',
    visibility: 'Public',
    likes: 3840, comments: 512, shares: 1830, views: 64200,
  },
];

// ── Education posts ───────────────────────────────────────────────────────────

const EDUCATION_POSTS: Post[] = [
  {
    id: 'ep1',
    author: 'Lincoln University', handle: '@lincolnuca', kind: 'company',
    content: 'Spring registration is open. Priority enrollment for returning students ends April 22. Schedule your advising appointment through the portal before registering.',
    timestamp: '2h ago',
    visibility: 'Public',
    pinned: true,
    imageUri: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=450&fit=crop&q=80',
    mediaTag: 'PHOTO',
    likes: 341, comments: 67, shares: 112, views: 5810,
  },
  {
    id: 'ep2',
    author: 'President Evans', handle: '@presevans', kind: 'owner',
    content: "I'm proud to announce our new research partnership with UC Berkeley — expanding lab access and funding opportunities for our STEM students starting Fall 2026.\n\nThis is what we've been working toward. More details at Wednesday's town hall.",
    timestamp: '5h ago',
    visibility: 'Public',
    likes: 612, comments: 94, shares: 218, views: 9840,
  },
  {
    id: 'ep3',
    author: 'Dean of Students', handle: '@ludeanos', kind: 'owner',
    content: "Faculty update — midterm grading window closes Friday April 18 at 11:59PM.\n\nPlease submit all grades through the portal. Any extensions require dean approval. Do not wait until the last day.",
    timestamp: '8h ago',
    visibility: 'Institutional',
    likes: 48, comments: 12, shares: 0, views: 892,
  },
  {
    id: 'ep4',
    author: 'Student Life', handle: '@lustudentlife', kind: 'creator',
    content: 'Spring Showcase is April 28. All majors welcome to exhibit work — art, research, business plans, tech projects. Judges include 3 industry professionals. Register by April 21.',
    timestamp: '1d ago',
    visibility: 'Public',
    imageUri: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=450&fit=crop&q=80',
    mediaTag: 'PHOTO',
    likes: 487, comments: 103, shares: 178, views: 7320,
  },
  {
    id: 'ep5',
    author: 'Lincoln University', handle: '@lincolnuca', kind: 'company',
    content: "Lincoln University ranked #3 HBCU in California by US News 2026. #12 nationally among HBCUs overall.\n\nThis reflects the work of every student, faculty member, and staff. We are just getting started.",
    timestamp: '2d ago',
    likes: 1840, comments: 287, shares: 634, views: 31400,
    visibility: 'Public',
  },
  {
    id: 'ep6',
    author: 'Dean of Students', handle: '@ludeanos', kind: 'owner',
    content: "Housing applications for Fall 2026 close May 1. Current residents must reapply — previous assignment does not guarantee renewal.\n\nNew students: priority given to first-gen and Pell-eligible applicants.",
    timestamp: '2d ago',
    visibility: 'Institutional',
    likes: 234, comments: 58, shares: 89, views: 4120,
  },
  {
    id: 'ep7',
    author: 'Prof. Williams', handle: '@profwilliams', kind: 'creator',
    content: "Office hours this week: Monday and Wednesday 2–4PM, Davey Hall 212.\n\nAlso available by appointment for thesis students. Email to schedule — don't wait until finals week.",
    timestamp: '3d ago',
    visibility: 'Institutional',
    likes: 89, comments: 14, shares: 0, views: 1230,
  },
  {
    id: 'ep8',
    author: 'Lincoln University', handle: '@lincolnuca', kind: 'company',
    content: "Alumni Weekend returns May 16–18. Classes of 2016, 2021, and 2026 are featured. Register at the link in bio. Bring the class back together.",
    timestamp: '4d ago',
    visibility: 'Public',
    imageUri: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=450&fit=crop&q=80',
    mediaTag: 'PHOTO',
    likes: 923, comments: 167, shares: 341, views: 14800,
  },
];

// ── Mode config (defined after post arrays so we can reference them) ──────────

const MODE_CONFIG: Record<string, ModeConfig> = {
  personal: {
    roleKey:               'personal:social',
    filterOptions:         ['All', 'Public', 'Subscribers Only'],
    visOptions:            ['Public', 'Subscribers Only'],
    composerName:          'Sammy Kalejaiye',
    composerInitial:       'S',
    composerBg:            '#1A1714',
    memberComposerName:    'Marcus Reid',
    memberComposerInitial: 'MR',
    memberComposerBg:      '#2E2318',
    memberCanPost:         false,
    posts:                 POSTS,
    lockedVisibility:      'Subscribers Only',
  },
  community: {
    roleKey:               'community:social',
    filterOptions:         ['All', 'Community', 'Leadership', 'Public'],
    visOptions:            ['Community', 'Public'],
    composerName:          'ICCLA',
    composerInitial:       'I',
    composerBg:            '#2E3A28',
    memberComposerName:    'David Okafor',
    memberComposerInitial: 'DO',
    memberComposerBg:      '#2E3A28',
    memberCanPost:         false,
    posts:                 COMMUNITY_POSTS,
    lockedVisibility:      'Leadership',
  },
  sports: {
    roleKey:               'sports:social',
    filterOptions:         ['All', 'Team', 'Public'],
    visOptions:            ['Team', 'Public'],
    composerName:          "Lincoln Men's Basketball",
    composerInitial:       'L',
    composerBg:            '#1A2E4A',
    memberComposerName:    'Laolu Durosinmi',
    memberComposerInitial: 'LD',
    memberComposerBg:      '#1A2E4A',
    memberCanPost:         true,
    posts:                 SPORTS_POSTS,
  },
  business: {
    roleKey:               'business:social',
    filterOptions:         ['All', 'Company', 'Public'],
    visOptions:            ['Company', 'Public'],
    composerName:          'KaNeXT',
    composerInitial:       'K',
    composerBg:            '#1E3A28',
    memberComposerName:    'Jordan Lee',
    memberComposerInitial: 'JL',
    memberComposerBg:      '#1E3A28',
    memberCanPost:         false,
    posts:                 BUSINESS_POSTS,
  },
  education: {
    roleKey:               'education:social',
    filterOptions:         ['All', 'Institutional', 'Public'],
    visOptions:            ['Institutional', 'Public'],
    composerName:          'Lincoln University (CA)',
    composerInitial:       'LU',
    composerBg:            '#3A2E1A',
    memberComposerName:    'Alex Chen',
    memberComposerInitial: 'AC',
    memberComposerBg:      '#3A2E1A',
    memberCanPost:         false,
    posts:                 EDUCATION_POSTS,
  },
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function SocialScreen() {
  const C       = useColors();
  const insets  = useSafeAreaInsets();
  const s       = useMemo(() => makeStyles(C), [C]);
  const mode    = useMode();

  const cfg = MODE_CONFIG[mode] ?? MODE_CONFIG.personal;

  const [role, cycleRole, roleCycles] = useDemoRole(cfg.roleKey);
  const isOwner = role === roleCycles[0];

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [composerVisibility, setComposerVisibility] = useState(() => cfg.visOptions[0]);
  const [expandedPosts, setExpandedPosts]       = useState<Set<string>>(new Set());

  // Reset vis when mode changes
  const prevModeRef = React.useRef(mode);
  if (prevModeRef.current !== mode) {
    prevModeRef.current = mode;
    setComposerVisibility(cfg.visOptions[0]);
  }

  useFocusEffect(useCallback(() => {
    resetFooter();
  }, []));

  const toggleExpand = useCallback((id: string) => {
    setExpandedPosts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const filteredPosts = useMemo(() => cfg.posts, [cfg.posts]);

  const fmtCount = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1000)      return `${(n / 1000).toFixed(1)}K`;
    return String(n);
  };

  // ── Composer card ─────────────────────────────────────────────────────────

  const renderComposer = () => (
    <View style={[s.card, { marginBottom: 12 }]}>
      {/* Top row: avatar + placeholder */}
      <Pressable
        style={s.composerTop}
        onPress={() => Alert.alert('Composer', 'Full composer coming soon')}
      >
        <View style={[s.avatar, { backgroundColor: isOwner ? cfg.composerBg : cfg.memberComposerBg }]}>
          <Text style={s.avatarText}>{isOwner ? cfg.composerInitial : cfg.memberComposerInitial}</Text>
        </View>
        <Text style={[s.composerPlaceholder, { color: C.secondary }]}>
          What's on your mind?
        </Text>
      </Pressable>

      {/* Visibility pills */}
      <View style={s.composerVisRow}>
        {cfg.visOptions.map(v => {
          const isActive = composerVisibility === v;
          const label = v === 'Subscribers Only' ? 'Subs Only' : v;
          return (
            <Pressable
              key={v}
              style={[
                s.composerVisPill,
                isActive
                  ? { backgroundColor: C.activePill, borderColor: C.activePill }
                  : { backgroundColor: 'transparent', borderColor: C.separator },
              ]}
              onPress={() => { Haptics.selectionAsync(); setComposerVisibility(v); }}
            >
              <Text style={[s.composerVisPillText, { color: isActive ? C.activePillText : C.secondary }]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Toolbar: attachment icons + post button */}
      <View style={[s.composerToolbar, { borderTopColor: C.separator }]}>
        <View style={s.composerIcons}>
          <IconSymbol name="photo"     size={20} color={C.secondary} />
          <IconSymbol name="video"     size={20} color={C.secondary} />
          <IconSymbol name="link"      size={20} color={C.secondary} />
          <IconSymbol name="checklist" size={20} color={C.secondary} />
        </View>
        <Pressable
          style={[s.postBtn, { backgroundColor: C.label }]}
          onPress={() => Alert.alert('Composer', 'Full composer coming soon')}
        >
          <Text style={[s.postBtnText, { color: C.bg }]}>Post</Text>
        </Pressable>
      </View>
    </View>
  );

  // ── Post card ─────────────────────────────────────────────────────────────

  const renderPostCard = (post: Post) => {
    const isLocked    = !isOwner && cfg.lockedVisibility != null && post.visibility === cfg.lockedVisibility;
    const isPinned    = !!post.pinned;
    const meta        = getAuthorMeta(post.author);
    const isOwnerPost = post.kind === 'owner';
    const isExpanded  = expandedPosts.has(post.id);
    // Truncate if content has >3 newlines or is long enough that 3 lines won't show it all
    const shouldTruncate = post.content.length > 200 || post.content.split('\n').length > 3;

    return (
      <View key={post.id} style={post.scheduled ? { opacity: 0.65 } : undefined}>

        {/* Above-card label: Pinned or Repost */}
        {(isPinned || post.repost) && (
          <View style={s.aboveCardLabel}>
            <IconSymbol
              name={isPinned ? 'pin.fill' : 'arrow.2.squarepath'}
              size={12}
              color={isPinned ? EMBER : C.secondary}
            />
            <Text style={[s.aboveCardText, { color: isPinned ? EMBER : C.secondary }]}>
              {isPinned ? 'Pinned post' : 'Reposted'}
            </Text>
          </View>
        )}

        {/* Card */}
        <View style={[s.card, { backgroundColor: C.surface, borderColor: C.separator }]}>

          {/* Header */}
          <View style={s.cardHeader}>
            <View style={[s.avatar, { backgroundColor: meta.bg }]}>
              <Text style={s.avatarText}>{post.author.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={s.headerText}>
              <View style={s.nameRow}>
                <Text style={[s.authorName, { color: C.label }]} numberOfLines={1}>
                  {post.author}
                </Text>
                {isOwnerPost && (
                  <View style={[s.youBadge, { borderColor: C.separator }]}>
                    <Text style={[s.youBadgeText, { color: C.secondary }]}>you</Text>
                  </View>
                )}
              </View>
              <Text style={[s.authorMeta, { color: C.secondary }]} numberOfLines={1}>
                {post.handle} · {post.timestamp}
              </Text>
            </View>
            {post.visibility === 'Subscribers Only' && (
              <IconSymbol name="lock.fill" size={11} color={CAUTION} style={{ marginRight: 6 }} />
            )}
            {isOwner && (
              <Pressable
                hitSlop={10}
                onPress={() => Alert.alert('Post Options', '', [
                  { text: 'Edit',   onPress: () => {} },
                  { text: 'Pin',    onPress: () => {} },
                  { text: 'Delete', style: 'destructive', onPress: () => {} },
                  { text: 'Cancel', style: 'cancel' },
                ])}
              >
                <IconSymbol name="ellipsis" size={16} color={C.secondary} />
              </Pressable>
            )}
          </View>

          {/* Body text */}
          {isLocked ? (
            <View style={s.lockedBlock}>
              <Text style={[s.postBody, { color: C.label, opacity: 0.18 }]} numberOfLines={3}>
                {post.content}
              </Text>
              <View style={[s.lockedCard, { borderColor: C.separator, backgroundColor: C.bg }]}>
                <View style={[s.lockedIconCircle, { backgroundColor: C.surface }]}>
                  <IconSymbol name="lock.fill" size={20} color={CAUTION} />
                </View>
                <Text style={[s.lockedTitle, { color: C.label }]}>
                  {cfg.lockedVisibility === 'Leadership' ? 'Leadership Only' : 'Subscribers Only'}
                </Text>
                <Text style={[s.lockedSub, { color: C.secondary }]}>
                  {cfg.lockedVisibility === 'Leadership'
                    ? 'This post is only visible to church leadership'
                    : 'Subscribe to unlock this post and all subscriber content'}
                </Text>
                {cfg.lockedVisibility !== 'Leadership' && (
                  <Pressable
                    style={[s.subscribeBtn, { backgroundColor: C.label }]}
                    onPress={() => Alert.alert('Subscribe')}
                  >
                    <Text style={[s.subscribeBtnText, { color: C.bg }]}>Subscribe · $9/mo</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ) : (
            <View style={s.bodyWrap}>
              <Text
                style={[s.postBody, { color: C.label }]}
                numberOfLines={isExpanded ? undefined : 3}
              >
                {post.content}
              </Text>
              {shouldTruncate && (
                <Pressable onPress={() => toggleExpand(post.id)}>
                  <Text style={[s.moreLess, { color: C.secondary }]}>
                    {isExpanded ? 'less' : '...more'}
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Media — full-width, edge to edge within card */}
          {post.imageUri && !isLocked && (
            <Pressable
              onPress={() => Alert.alert(post.mediaTag === 'VIDEO' ? 'Play video' : 'View photo')}
            >
              <Image
                source={{ uri: post.imageUri }}
                style={s.mediaImg}
                resizeMode="cover"
              />
              {post.mediaTag === 'VIDEO' && (
                <View style={s.playOverlay}>
                  <View style={s.playBtn}>
                    <IconSymbol name="play.fill" size={22} color="#FFFFFF" />
                  </View>
                </View>
              )}
            </Pressable>
          )}

          {/* Engagement row */}
          {!isLocked && (
            <View style={s.engBar}>
              <Pressable style={s.engItem} onPress={() => Haptics.selectionAsync()}>
                <IconSymbol name="bubble.left" size={17} color={C.secondary} />
                <Text style={[s.engCount, { color: C.secondary }]}>{fmtCount(post.comments)}</Text>
              </Pressable>
              <Pressable style={s.engItem} onPress={() => Haptics.selectionAsync()}>
                <IconSymbol name="arrow.2.squarepath" size={17} color={C.secondary} />
                <Text style={[s.engCount, { color: C.secondary }]}>{fmtCount(post.shares)}</Text>
              </Pressable>
              <Pressable style={s.engItem} onPress={() => Haptics.selectionAsync()}>
                <IconSymbol name="heart" size={17} color={C.secondary} />
                <Text style={[s.engCount, { color: C.secondary }]}>{fmtCount(post.likes)}</Text>
              </Pressable>
              <Pressable style={s.engItem} onPress={() => Haptics.selectionAsync()}>
                <IconSymbol name="eye" size={15} color={C.secondary} />
                <Text style={[s.engCount, { color: C.secondary }]}>{fmtCount(post.views)}</Text>
              </Pressable>
              <View style={{ flex: 1 }} />
              <Pressable style={s.engItem} onPress={() => Haptics.selectionAsync()}>
                <IconSymbol name="bookmark" size={17} color={C.secondary} />
              </Pressable>
            </View>
          )}

        </View>
      </View>
    );
  };

  // ── Feed ──────────────────────────────────────────────────────────────────

  const renderFeed = () => (
    <View style={s.feedWrap}>
      {/* Composer */}
      {(isOwner || cfg.memberCanPost) && renderComposer()}

      {/* Post cards */}
      {filteredPosts.map(renderPostCard)}
    </View>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* Fixed top bar — fades on scroll */}
      <Animated.View
        style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}
      >
        <View style={s.topBar}>
          <Pressable
            hitSlop={8}
            style={s.kBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              openSidePanel();
            }}
          >
            <KMenuButton />
          </Pressable>

          <View style={s.centerPill}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Feed</Text>
            </View>
          </View>

          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      {/* Scrollable feed */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          s.scrollContent,
          { paddingTop: insets.top + 52, paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {renderFeed()}
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1 },

  // ── Top bar ────────────────────────────────────────────────────────────────
  topBarOuter: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topBar: {
    height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12,
  },
  kBtn:          { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  centerPill:    { flex: 1, alignItems: 'center' },
  titlePill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  rolePillWrap:  { alignItems: 'flex-end', flexShrink: 0 },

  // ── Scroll ─────────────────────────────────────────────────────────────────
  scrollContent: {},
  feedWrap:      {},

  // ── Filter pills ───────────────────────────────────────────────────────────
  filterRow: {
    height: 48, borderBottomWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
  },
  filterScroll:   { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  filterPill:     { paddingHorizontal: 13, paddingVertical: 6, borderRadius: 14, borderWidth: 1 },
  filterPillText: { fontSize: 13, fontWeight: '600', letterSpacing: 0.2 },

  // ── Card (shared by post cards and composer) ──────────────────────────────
  card: {
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.separator,
    marginHorizontal: 12,
    marginTop: 12,
    overflow: 'hidden',
  },

  // ── Above-card label (pinned / repost) ────────────────────────────────────
  aboveCardLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: -4,
  },
  aboveCardText: { fontSize: 12, fontWeight: '500' },

  // ── Composer ───────────────────────────────────────────────────────────────
  composerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  composerPlaceholder: { fontSize: 16, flex: 1 },
  composerVisRow:      { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 10 },
  composerVisPill: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1,
  },
  composerVisPillText: { fontSize: 11, fontWeight: '600' },
  composerToolbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  composerIcons: { flexDirection: 'row', gap: 18 },
  postBtn:       { paddingHorizontal: 18, paddingVertical: 7, borderRadius: 20 },
  postBtnText:   { fontSize: 14, fontWeight: '700' },

  // ── Avatar ─────────────────────────────────────────────────────────────────
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },

  // ── Card header ────────────────────────────────────────────────────────────
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 10,
  },
  headerText: { flex: 1, minWidth: 0 },
  nameRow: {
    flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'nowrap',
  },
  authorName: { fontSize: 14, fontWeight: '700', flexShrink: 1 },
  youBadge: {
    paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4, borderWidth: 1, flexShrink: 0,
  },
  youBadgeText: { fontSize: 10, fontWeight: '500' },
  authorMeta:   { fontSize: 12, marginTop: 2 },

  // ── Body ───────────────────────────────────────────────────────────────────
  bodyWrap: { paddingHorizontal: 16, paddingBottom: 10 },
  postBody: { fontSize: 15, lineHeight: 22 },
  moreLess: { fontSize: 14, fontWeight: '600', marginTop: 2 },

  // ── Locked ─────────────────────────────────────────────────────────────────
  lockedBlock: { paddingHorizontal: 16, paddingBottom: 14 },
  lockedCard: {
    marginTop: 14, borderRadius: 12, borderWidth: 1,
    padding: 20, alignItems: 'center', gap: 8,
  },
  lockedIconCircle: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  lockedTitle:      { fontSize: 16, fontWeight: '700', marginTop: 2 },
  lockedSub:        { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  subscribeBtn:     { marginTop: 6, paddingHorizontal: 22, paddingVertical: 11, borderRadius: 12 },
  subscribeBtnText: { fontSize: 14, fontWeight: '700' },

  // ── Media — full-width, edge to edge within card ───────────────────────────
  mediaImg: {
    width: '100%',
    height: 240,
  },
  playOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  playBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
    paddingLeft: 3,
  },

  // ── Engagement ─────────────────────────────────────────────────────────────
  engBar:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  engItem:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginRight: 14 },
  engCount: { fontSize: 13 },
});
