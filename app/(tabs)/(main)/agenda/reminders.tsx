import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { openDipsonSheet } from '@/utils/global-dipson-sheet';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useAppContext } from '@/context/app-context';
import { useScrollHeader } from '@/hooks/use-scroll-header';

// ── Semantic color constants ──────────────────────────────────────────────────
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';
const GAIN    = '#5A8A6E';

// Card background tints — semi-transparent, works on any scheme
const DANGER_BG  = HEAT    + '20';   // ~12% heat red tint
const WARNING_BG = CAUTION + '20';   // ~12% caution amber tint

// ── Types ─────────────────────────────────────────────────────────────────────
type Priority       = 'none' | 'medium' | 'high';
type ReminderStatus = 'pending' | 'completed';
type FilterTab      = 'Today' | 'Scheduled' | 'Flagged' | 'All';
type DateChoice     = 'today' | 'tomorrow' | 'weekend' | 'none';

type Reminder = {
  id: number;
  text: string;
  subtitle?: string;
  dueDate?: string;
  dueTime?: string;
  priority: Priority;
  flagged: boolean;
  status: ReminderStatus;
  isOverdue: boolean;
  overdueLabel?: string;
  completedAt?: number;
};

// ── Mock data (per mode + role) ───────────────────────────────────────────────
// Keys: `${mode}:admin` for primary role, `${mode}:member` for secondary role
const REMINDERS_BY_MODE: Record<string, Reminder[]> = {

  // ── PERSONAL ──────────────────────────────────────────────────────────────
  'personal:admin': [
    { id: 1,  text: 'Follow up with Puma on contract terms',  subtitle: 'Deals \u00b7 Contract negotiation',       dueDate: '2026-04-10', dueTime: '10:00 AM', priority: 'high',   flagged: true,  status: 'pending',   isOverdue: true,  overdueLabel: '3 days overdue' },
    { id: 2,  text: "Post Tuesday's reel to IG and TikTok",   subtitle: 'Content \u00b7 Spring collection series',  dueDate: '2026-04-11', dueTime: '9:00 AM',  priority: 'medium', flagged: false, status: 'pending',   isOverdue: true,  overdueLabel: 'Yesterday' },
    { id: 3,  text: 'Nike brand call \u2014 prep talking points',   subtitle: 'Meetings \u00b7 Partnership discussion',   dueDate: '2026-04-13', dueTime: '1:00 PM',  priority: 'high',   flagged: true,  status: 'pending',   isOverdue: false },
    { id: 4,  text: 'Review April content calendar',           subtitle: 'Content \u00b7 Monthly planning',          dueDate: '2026-04-13', dueTime: '3:00 PM',  priority: 'medium', flagged: false, status: 'pending',   isOverdue: false },
    { id: 5,  text: 'Send invoice to Alex',                    subtitle: 'Earnings \u00b7 Coaching session payment', dueDate: '2026-04-13', dueTime: '6:00 PM',  priority: 'none',   flagged: false, status: 'pending',   isOverdue: false },
    { id: 6,  text: 'Adidas proposal deadline',                subtitle: 'Deals \u00b7 Spring campaign pitch',       dueDate: '2026-04-14', dueTime: '5:00 PM',  priority: 'high',   flagged: true,  status: 'pending',   isOverdue: false },
    { id: 7,  text: 'Record podcast intro segments',           subtitle: 'Content \u00b7 Episode 43',                dueDate: '2026-04-15', dueTime: '10:00 AM', priority: 'none',   flagged: false, status: 'pending',   isOverdue: false },
    { id: 8,  text: 'Inner Circle Q&A prep',                   subtitle: 'Bookings \u00b7 12 members attending',     dueDate: '2026-04-16', dueTime: '11:00 AM', priority: 'medium', flagged: false, status: 'pending',   isOverdue: false },
    { id: 9,  text: 'Monthly analytics review',                subtitle: 'Analytics \u00b7 Growth trends check',     dueDate: '2026-04-17', dueTime: '2:00 PM',  priority: 'none',   flagged: false, status: 'pending',   isOverdue: false },
    { id: 10, text: 'Lululemon pitch deck draft',              subtitle: 'Deals \u00b7 Initial brand meeting prep',  dueDate: '2026-04-20', dueTime: '9:00 AM',  priority: 'medium', flagged: true,  status: 'pending',   isOverdue: false },
    { id: 11, text: 'Subscriber newsletter \u2014 May edition',    subtitle: 'Content \u00b7 Monthly newsletter',        dueDate: '2026-04-22', dueTime: '12:00 PM', priority: 'none',   flagged: false, status: 'pending',   isOverdue: false },
    { id: 12, text: 'Upload BTS photoshoot clips',             subtitle: 'Content',  dueDate: '2026-04-11', dueTime: '4:00 PM',  priority: 'none', flagged: false, status: 'completed', isOverdue: false, completedAt: Date.now() - 86400000 },
    { id: 13, text: 'Schedule week 3 content batch',           subtitle: 'Content',  dueDate: '2026-04-10', dueTime: '2:00 PM',  priority: 'none', flagged: false, status: 'completed', isOverdue: false, completedAt: Date.now() - 172800000 },
    { id: 14, text: 'Reply to brand DMs',                      subtitle: 'Meetings', dueDate: '2026-04-12', dueTime: '11:00 AM', priority: 'none', flagged: false, status: 'completed', isOverdue: false, completedAt: Date.now() - 7200000 },
  ],
  'personal:member': [
    { id: 1,  text: 'Watch episode 4 of the course',           subtitle: 'Content \u00b7 Added to your playlist',   dueDate: '2026-04-11', dueTime: '9:00 AM',  priority: 'medium', flagged: false, status: 'pending',   isOverdue: true,  overdueLabel: 'Yesterday' },
    { id: 2,  text: 'Inner Circle Q&A \u2014 today at 1 PM',       subtitle: 'Meetings \u00b7 Live subscriber session',  dueDate: '2026-04-13', dueTime: '1:00 PM',  priority: 'high',   flagged: true,  status: 'pending',   isOverdue: false },
    { id: 3,  text: 'Download new workout guide from store',    subtitle: 'Content \u00b7 April drop',               dueDate: '2026-04-13', dueTime: '3:00 PM',  priority: 'medium', flagged: false, status: 'pending',   isOverdue: false },
    { id: 4,  text: 'RSVP for April meetup event',             subtitle: 'Meetings \u00b7 Subscriber only',         dueDate: '2026-04-13', dueTime: '6:00 PM',  priority: 'none',   flagged: false, status: 'pending',   isOverdue: false },
    { id: 5,  text: 'Monthly subscriber drop \u2014 exclusive access', subtitle: 'Content \u00b7 Inner Circle drop',     dueDate: '2026-04-16', dueTime: '12:00 PM', priority: 'medium', flagged: false, status: 'pending',   isOverdue: false },
    { id: 6,  text: 'New course module drops \u2014 check your feed',  subtitle: 'Content \u00b7 Speed & Agility series', dueDate: '2026-04-20', dueTime: '10:00 AM', priority: 'none',   flagged: false, status: 'pending',   isOverdue: false },
    { id: 7,  text: 'Renew subscription before it expires',    subtitle: 'Earnings \u00b7 Inner Circle plan',       dueDate: '2026-04-22', dueTime: '9:00 AM',  priority: 'high',   flagged: true,  status: 'pending',   isOverdue: false },
    { id: 8,  text: 'Completed Q&A session \u2014 March',           subtitle: 'Meetings', dueDate: '2026-04-10', dueTime: '1:00 PM',  priority: 'none', flagged: false, status: 'completed', isOverdue: false, completedAt: Date.now() - 172800000 },
  ],

  // ── BUSINESS ──────────────────────────────────────────────────────────────
  'business:admin': [
    { id: 1,  text: 'Q1 board deck \u2014 final review',               subtitle: 'Operations \u00b7 Leadership prep',     dueDate: '2026-04-10', dueTime: '10:00 AM', priority: 'high',   flagged: true,  status: 'pending',   isOverdue: true,  overdueLabel: '3 days overdue' },
    { id: 2,  text: 'Reply to investor due diligence requests',  subtitle: 'Finance \u00b7 Series A close',        dueDate: '2026-04-11', dueTime: '9:00 AM',  priority: 'medium', flagged: false, status: 'pending',   isOverdue: true,  overdueLabel: 'Yesterday' },
    { id: 3,  text: 'Weekly leadership sync \u2014 agenda prep',       subtitle: 'Meetings \u00b7 Executive team',       dueDate: '2026-04-13', dueTime: '1:00 PM',  priority: 'high',   flagged: true,  status: 'pending',   isOverdue: false },
    { id: 4,  text: 'Close Series A term sheet',                 subtitle: 'Finance \u00b7 Investor close',        dueDate: '2026-04-13', dueTime: '3:00 PM',  priority: 'medium', flagged: false, status: 'pending',   isOverdue: false },
    { id: 5,  text: 'Submit quarterly tax filing',               subtitle: 'Finance \u00b7 Q1 taxes',              dueDate: '2026-04-13', dueTime: '6:00 PM',  priority: 'none',   flagged: false, status: 'pending',   isOverdue: false },
    { id: 6,  text: 'Client proposal \u2014 Meridian Group',           subtitle: 'Operations \u00b7 Enterprise pitch',   dueDate: '2026-04-14', dueTime: '5:00 PM',  priority: 'high',   flagged: true,  status: 'pending',   isOverdue: false },
    { id: 7,  text: 'Hiring sync \u2014 product lead candidates',       subtitle: 'People \u00b7 VP of Product role',     dueDate: '2026-04-15', dueTime: '10:00 AM', priority: 'none',   flagged: false, status: 'pending',   isOverdue: false },
    { id: 8,  text: 'Platform roadmap v2 review',                subtitle: 'Operations \u00b7 Engineering',        dueDate: '2026-04-16', dueTime: '11:00 AM', priority: 'medium', flagged: false, status: 'pending',   isOverdue: false },
    { id: 9,  text: 'Monthly P&L review',                        subtitle: 'Finance \u00b7 April performance',     dueDate: '2026-04-17', dueTime: '2:00 PM',  priority: 'none',   flagged: false, status: 'pending',   isOverdue: false },
    { id: 10, text: 'Partner agreement \u2014 LegalZoom draft',         subtitle: 'Legal \u00b7 Contract review',         dueDate: '2026-04-20', dueTime: '9:00 AM',  priority: 'medium', flagged: true,  status: 'pending',   isOverdue: false },
    { id: 11, text: 'All-hands prep \u2014 May company update',         subtitle: 'Meetings \u00b7 Company-wide',         dueDate: '2026-04-22', dueTime: '12:00 PM', priority: 'none',   flagged: false, status: 'pending',   isOverdue: false },
    { id: 12, text: 'Send NDA to Atlas Capital',                 subtitle: 'Legal',    dueDate: '2026-04-11', dueTime: '4:00 PM',  priority: 'none', flagged: false, status: 'completed', isOverdue: false, completedAt: Date.now() - 86400000 },
    { id: 13, text: 'Onboard new VP of Sales',                   subtitle: 'People',   dueDate: '2026-04-10', dueTime: '2:00 PM',  priority: 'none', flagged: false, status: 'completed', isOverdue: false, completedAt: Date.now() - 172800000 },
    { id: 14, text: 'Team offsite venue confirmation',           subtitle: 'Meetings', dueDate: '2026-04-12', dueTime: '11:00 AM', priority: 'none', flagged: false, status: 'completed', isOverdue: false, completedAt: Date.now() - 7200000 },
  ],
  'business:member': [
    { id: 1,  text: 'Review KaNeXT proposal \u2014 sent 3 days ago',    subtitle: 'Meetings \u00b7 Pending response',      dueDate: '2026-04-10', dueTime: '10:00 AM', priority: 'high',   flagged: true,  status: 'pending',   isOverdue: true,  overdueLabel: '3 days overdue' },
    { id: 2,  text: 'Onboarding call \u2014 KaNeXT platform team',       subtitle: 'Meetings \u00b7 Platform setup',        dueDate: '2026-04-13', dueTime: '10:00 AM', priority: 'high',   flagged: true,  status: 'pending',   isOverdue: false },
    { id: 3,  text: 'Review service contract terms',             subtitle: 'Legal \u00b7 Annual subscription',       dueDate: '2026-04-13', dueTime: '2:00 PM',  priority: 'medium', flagged: false, status: 'pending',   isOverdue: false },
    { id: 4,  text: 'Send feedback on platform demo',            subtitle: 'Meetings \u00b7 Product team request',    dueDate: '2026-04-13', dueTime: '5:00 PM',  priority: 'none',   flagged: false, status: 'pending',   isOverdue: false },
    { id: 5,  text: 'Follow up on support ticket #1492',         subtitle: 'Meetings \u00b7 Open issue',             dueDate: '2026-04-15', dueTime: '10:00 AM', priority: 'medium', flagged: false, status: 'pending',   isOverdue: false },
    { id: 6,  text: 'Monthly billing review',                    subtitle: 'Finance \u00b7 April statement',         dueDate: '2026-04-17', dueTime: '12:00 PM', priority: 'none',   flagged: false, status: 'pending',   isOverdue: false },
    { id: 7,  text: 'Platform trial expiration \u2014 upgrade prompt',   subtitle: 'Finance \u00b7 Plan renewal',          dueDate: '2026-04-20', dueTime: '9:00 AM',  priority: 'high',   flagged: true,  status: 'pending',   isOverdue: false },
    { id: 8,  text: 'Signed initial service agreement',          subtitle: 'Legal',    dueDate: '2026-04-11', dueTime: '4:00 PM',  priority: 'none', flagged: false, status: 'completed', isOverdue: false, completedAt: Date.now() - 86400000 },
  ],

  // ── EDUCATION ─────────────────────────────────────────────────────────────
  'education:admin': [
    { id: 1,  text: 'WASC accreditation response due',               subtitle: 'Compliance \u00b7 Regional accreditation', dueDate: '2026-04-10', dueTime: '10:00 AM', priority: 'high',   flagged: true,  status: 'pending',   isOverdue: true,  overdueLabel: '3 days overdue' },
    { id: 2,  text: 'Faculty contract renewals \u2014 3 pending',         subtitle: 'Academic \u00b7 HR approvals',             dueDate: '2026-04-11', dueTime: '9:00 AM',  priority: 'medium', flagged: false, status: 'pending',   isOverdue: true,  overdueLabel: 'Yesterday' },
    { id: 3,  text: 'Academic council meeting \u2014 budget agenda',      subtitle: 'Meetings \u00b7 Department heads',        dueDate: '2026-04-13', dueTime: '1:00 PM',  priority: 'high',   flagged: true,  status: 'pending',   isOverdue: false },
    { id: 4,  text: 'Enrollment yield report \u2014 spring class',        subtitle: 'Academic \u00b7 Admissions data',         dueDate: '2026-04-13', dueTime: '3:00 PM',  priority: 'medium', flagged: false, status: 'pending',   isOverdue: false },
    { id: 5,  text: 'Sign facilities capital request',               subtitle: 'Finance \u00b7 Campus infrastructure',    dueDate: '2026-04-13', dueTime: '6:00 PM',  priority: 'none',   flagged: false, status: 'pending',   isOverdue: false },
    { id: 6,  text: 'Board of trustees meeting prep',                subtitle: 'Meetings \u00b7 Quarterly board session',  dueDate: '2026-04-14', dueTime: '5:00 PM',  priority: 'high',   flagged: true,  status: 'pending',   isOverdue: false },
    { id: 7,  text: 'Financial aid disbursement review',             subtitle: 'Finance \u00b7 Spring semester',          dueDate: '2026-04-15', dueTime: '10:00 AM', priority: 'none',   flagged: false, status: 'pending',   isOverdue: false },
    { id: 8,  text: 'New faculty orientation planning',              subtitle: 'Academic \u00b7 Fall onboarding',         dueDate: '2026-04-16', dueTime: '11:00 AM', priority: 'medium', flagged: false, status: 'pending',   isOverdue: false },
    { id: 9,  text: 'Commencement speaker outreach',                 subtitle: 'Meetings \u00b7 Spring graduation',       dueDate: '2026-04-17', dueTime: '2:00 PM',  priority: 'none',   flagged: false, status: 'pending',   isOverdue: false },
    { id: 10, text: 'Spring enrollment deadline outreach',           subtitle: 'Academic \u00b7 Retention campaign',     dueDate: '2026-04-20', dueTime: '9:00 AM',  priority: 'medium', flagged: true,  status: 'pending',   isOverdue: false },
    { id: 11, text: 'Athletics compliance certification',            subtitle: 'Compliance \u00b7 NAIA annual filing',    dueDate: '2026-04-22', dueTime: '12:00 PM', priority: 'none',   flagged: false, status: 'pending',   isOverdue: false },
    { id: 12, text: 'Approve spring course catalog',                 subtitle: 'Academic',    dueDate: '2026-04-11', dueTime: '4:00 PM',  priority: 'none', flagged: false, status: 'completed', isOverdue: false, completedAt: Date.now() - 86400000 },
    { id: 13, text: 'Sign Title IX compliance update',               subtitle: 'Compliance',  dueDate: '2026-04-10', dueTime: '2:00 PM',  priority: 'none', flagged: false, status: 'completed', isOverdue: false, completedAt: Date.now() - 172800000 },
    { id: 14, text: 'Staff recognition award nominations',           subtitle: 'Meetings',    dueDate: '2026-04-12', dueTime: '11:00 AM', priority: 'none', flagged: false, status: 'completed', isOverdue: false, completedAt: Date.now() - 7200000 },
  ],
  'education:member': [
    { id: 1,  text: 'Term paper first draft \u2014 Prof. Williams',       subtitle: 'Academic \u00b7 History of Western Thought', dueDate: '2026-04-10', dueTime: '11:59 PM', priority: 'high',   flagged: true,  status: 'pending',   isOverdue: true,  overdueLabel: '3 days overdue' },
    { id: 2,  text: 'Study group meeting \u2014 exam prep',               subtitle: 'Academic \u00b7 Library room 204',    dueDate: '2026-04-13', dueTime: '10:00 AM', priority: 'high',   flagged: true,  status: 'pending',   isOverdue: false },
    { id: 3,  text: 'Financial aid appeal deadline',                 subtitle: 'Finance \u00b7 Office of Student Services', dueDate: '2026-04-13', dueTime: '3:00 PM',  priority: 'high',   flagged: false, status: 'pending',   isOverdue: false },
    { id: 4,  text: 'Campus tour guide shift',                       subtitle: 'Academic \u00b7 Admissions office',      dueDate: '2026-04-13', dueTime: '5:00 PM',  priority: 'none',   flagged: false, status: 'pending',   isOverdue: false },
    { id: 5,  text: 'Register for fall semester courses',            subtitle: 'Academic \u00b7 Priority registration',   dueDate: '2026-04-15', dueTime: '12:00 PM', priority: 'high',   flagged: true,  status: 'pending',   isOverdue: false },
    { id: 6,  text: 'Midterm \u2014 History of Western Thought',          subtitle: 'Academic \u00b7 Room 110',             dueDate: '2026-04-17', dueTime: '9:00 AM',  priority: 'high',   flagged: false, status: 'pending',   isOverdue: false },
    { id: 7,  text: 'Meet with academic advisor',                    subtitle: 'Academic \u00b7 Degree audit review',    dueDate: '2026-04-20', dueTime: '11:00 AM', priority: 'medium', flagged: false, status: 'pending',   isOverdue: false },
    { id: 8,  text: 'Scholarship application due',                   subtitle: 'Finance \u00b7 Lincoln Excellence Award', dueDate: '2026-04-22', dueTime: '5:00 PM',  priority: 'medium', flagged: true,  status: 'pending',   isOverdue: false },
    { id: 9,  text: 'Submitted quiz \u2014 Chapter 7',                    subtitle: 'Academic', dueDate: '2026-04-11', dueTime: '11:59 PM', priority: 'none', flagged: false, status: 'completed', isOverdue: false, completedAt: Date.now() - 86400000 },
    { id: 10, text: 'Paid spring semester balance',                  subtitle: 'Finance',  dueDate: '2026-04-10', dueTime: '5:00 PM',  priority: 'none', flagged: false, status: 'completed', isOverdue: false, completedAt: Date.now() - 172800000 },
  ],

  // ── COMMUNITY ─────────────────────────────────────────────────────────────
  'community:admin': [
    { id: 1,  text: 'Sermon series \u2014 Easter follow-up outline',      subtitle: 'Ministry \u00b7 Sunday teaching',          dueDate: '2026-04-10', dueTime: '10:00 AM', priority: 'high',   flagged: true,  status: 'pending',   isOverdue: true,  overdueLabel: '3 days overdue' },
    { id: 2,  text: 'Volunteer onboarding follow-up',                subtitle: 'Outreach \u00b7 Spring intake class',      dueDate: '2026-04-11', dueTime: '9:00 AM',  priority: 'medium', flagged: false, status: 'pending',   isOverdue: true,  overdueLabel: 'Yesterday' },
    { id: 3,  text: 'Staff devotional \u2014 leadership meeting',          subtitle: 'Meetings \u00b7 Pastoral team',            dueDate: '2026-04-13', dueTime: '10:00 AM', priority: 'high',   flagged: true,  status: 'pending',   isOverdue: false },
    { id: 4,  text: 'Review benevolence fund requests',              subtitle: 'Finance \u00b7 Assistance applications',   dueDate: '2026-04-13', dueTime: '2:00 PM',  priority: 'medium', flagged: false, status: 'pending',   isOverdue: false },
    { id: 5,  text: 'Sunday service run-of-show review',             subtitle: 'Ministry \u00b7 Week 16 service prep',     dueDate: '2026-04-13', dueTime: '5:00 PM',  priority: 'none',   flagged: false, status: 'pending',   isOverdue: false },
    { id: 6,  text: 'Deacon board quarterly meeting',                subtitle: 'Meetings \u00b7 Governance review',        dueDate: '2026-04-14', dueTime: '6:00 PM',  priority: 'high',   flagged: true,  status: 'pending',   isOverdue: false },
    { id: 7,  text: 'Youth ministry budget review',                  subtitle: 'Finance \u00b7 Q2 allocations',            dueDate: '2026-04-15', dueTime: '10:00 AM', priority: 'none',   flagged: false, status: 'pending',   isOverdue: false },
    { id: 8,  text: 'Community outreach dinner planning',            subtitle: 'Outreach \u00b7 May neighborhood event',   dueDate: '2026-04-16', dueTime: '11:00 AM', priority: 'medium', flagged: false, status: 'pending',   isOverdue: false },
    { id: 9,  text: 'Small group leader training',                   subtitle: 'Ministry \u00b7 Spring cohort',            dueDate: '2026-04-17', dueTime: '2:00 PM',  priority: 'none',   flagged: false, status: 'pending',   isOverdue: false },
    { id: 10, text: 'Annual mission trip deposits due',              subtitle: 'Outreach \u00b7 Summer 2026 trip',         dueDate: '2026-04-20', dueTime: '9:00 AM',  priority: 'medium', flagged: true,  status: 'pending',   isOverdue: false },
    { id: 11, text: 'Building & grounds committee update',           subtitle: 'Meetings \u00b7 Facilities planning',      dueDate: '2026-04-22', dueTime: '12:00 PM', priority: 'none',   flagged: false, status: 'pending',   isOverdue: false },
    { id: 12, text: 'Send thank-you notes \u2014 Easter service',         subtitle: 'Ministry',  dueDate: '2026-04-11', dueTime: '4:00 PM',  priority: 'none', flagged: false, status: 'completed', isOverdue: false, completedAt: Date.now() - 86400000 },
    { id: 13, text: 'Approve April worship set list',                subtitle: 'Ministry',  dueDate: '2026-04-10', dueTime: '2:00 PM',  priority: 'none', flagged: false, status: 'completed', isOverdue: false, completedAt: Date.now() - 172800000 },
    { id: 14, text: 'Follow up \u2014 counseling referral',               subtitle: 'Pastoral',  dueDate: '2026-04-12', dueTime: '11:00 AM', priority: 'none', flagged: false, status: 'completed', isOverdue: false, completedAt: Date.now() - 7200000 },
  ],
  'community:member': [
    { id: 1,  text: 'Confirm volunteer shift \u2014 kitchen team',         subtitle: 'Outreach \u00b7 Sunday setup crew',       dueDate: '2026-04-11', dueTime: '9:00 AM',  priority: 'medium', flagged: false, status: 'pending',   isOverdue: true,  overdueLabel: 'Yesterday' },
    { id: 2,  text: 'Small group meeting \u2014 bring discussion notes',   subtitle: 'Ministry \u00b7 Wednesday 7 PM',          dueDate: '2026-04-13', dueTime: '7:00 PM',  priority: 'high',   flagged: true,  status: 'pending',   isOverdue: false },
    { id: 3,  text: 'Sunday service \u2014 arrive early for worship setup', subtitle: 'Ministry \u00b7 Volunteer role',          dueDate: '2026-04-13', dueTime: '8:30 AM',  priority: 'medium', flagged: false, status: 'pending',   isOverdue: false },
    { id: 4,  text: 'Connect call with new member Marcus',           subtitle: 'Outreach \u00b7 Welcome team task',       dueDate: '2026-04-13', dueTime: '5:00 PM',  priority: 'none',   flagged: false, status: 'pending',   isOverdue: false },
    { id: 5,  text: 'Mission trip deposit \u2014 summer 2026',             subtitle: 'Outreach \u00b7 Payment deadline',        dueDate: '2026-04-16', dueTime: '5:00 PM',  priority: 'high',   flagged: true,  status: 'pending',   isOverdue: false },
    { id: 6,  text: 'New member orientation session',               subtitle: 'Ministry \u00b7 Class registration',      dueDate: '2026-04-19', dueTime: '10:00 AM', priority: 'medium', flagged: false, status: 'pending',   isOverdue: false },
    { id: 7,  text: 'Deacon meeting \u2014 guest attendance',              subtitle: 'Meetings \u00b7 Observer invite',         dueDate: '2026-04-20', dueTime: '6:00 PM',  priority: 'none',   flagged: false, status: 'pending',   isOverdue: false },
    { id: 8,  text: 'Attended Easter Sunday service',               subtitle: 'Ministry', dueDate: '2026-04-10', dueTime: '10:00 AM', priority: 'none', flagged: false, status: 'completed', isOverdue: false, completedAt: Date.now() - 172800000 },
    { id: 9,  text: 'Completed new member form',                    subtitle: 'Ministry', dueDate: '2026-04-12', dueTime: '12:00 PM', priority: 'none', flagged: false, status: 'completed', isOverdue: false, completedAt: Date.now() - 7200000 },
  ],

  // ── ATHLETICS ─────────────────────────────────────────────────────────────
  'sports:admin': [
    { id: 1,  text: 'Recruiting letter \u2014 Marcus Webb (PG)',           subtitle: 'Recruiting \u00b7 Class of 2027 target',  dueDate: '2026-04-10', dueTime: '10:00 AM', priority: 'high',   flagged: true,  status: 'pending',   isOverdue: true,  overdueLabel: '3 days overdue' },
    { id: 2,  text: 'NAIA eligibility waiver submission',            subtitle: 'Compliance \u00b7 Clearinghouse filing',  dueDate: '2026-04-11', dueTime: '9:00 AM',  priority: 'medium', flagged: false, status: 'pending',   isOverdue: true,  overdueLabel: 'Yesterday' },
    { id: 3,  text: 'Game film review \u2014 Westmont matchup',            subtitle: 'Film \u00b7 Conference semifinal prep',   dueDate: '2026-04-13', dueTime: '10:00 AM', priority: 'high',   flagged: true,  status: 'pending',   isOverdue: false },
    { id: 4,  text: 'Practice plan \u2014 defensive sets',                 subtitle: 'Operations \u00b7 Game-week prep',        dueDate: '2026-04-13', dueTime: '2:00 PM',  priority: 'medium', flagged: false, status: 'pending',   isOverdue: false },
    { id: 5,  text: 'Recruiting call \u2014 Darius Thompson',              subtitle: 'Recruiting \u00b7 Class of 2026',        dueDate: '2026-04-13', dueTime: '5:00 PM',  priority: 'none',   flagged: false, status: 'pending',   isOverdue: false },
    { id: 6,  text: 'Opponent scouting report \u2014 Golden State',        subtitle: 'Film \u00b7 Tournament quarterfinal',    dueDate: '2026-04-14', dueTime: '5:00 PM',  priority: 'high',   flagged: true,  status: 'pending',   isOverdue: false },
    { id: 7,  text: 'Academic check-ins \u2014 4 at-risk players',         subtitle: 'Compliance \u00b7 GPA monitoring',       dueDate: '2026-04-15', dueTime: '10:00 AM', priority: 'none',   flagged: false, status: 'pending',   isOverdue: false },
    { id: 8,  text: 'Conference tournament bracket strategy',         subtitle: 'Operations \u00b7 Coaching staff',       dueDate: '2026-04-16', dueTime: '11:00 AM', priority: 'medium', flagged: false, status: 'pending',   isOverdue: false },
    { id: 9,  text: 'Full squad film session',                        subtitle: 'Film \u00b7 Full roster review',          dueDate: '2026-04-17', dueTime: '2:00 PM',  priority: 'none',   flagged: false, status: 'pending',   isOverdue: false },
    { id: 10, text: 'NAIA national tournament travel logistics',      subtitle: 'Operations \u00b7 Travel coordinator',   dueDate: '2026-04-20', dueTime: '9:00 AM',  priority: 'medium', flagged: true,  status: 'pending',   isOverdue: false },
    { id: 11, text: 'Year-end roster decisions',                      subtitle: 'Recruiting \u00b7 Scholarships & offers', dueDate: '2026-04-22', dueTime: '12:00 PM', priority: 'none',   flagged: false, status: 'pending',   isOverdue: false },
    { id: 12, text: 'Submit game stats \u2014 Saturday match',             subtitle: 'Compliance', dueDate: '2026-04-11', dueTime: '4:00 PM',  priority: 'none', flagged: false, status: 'completed', isOverdue: false, completedAt: Date.now() - 86400000 },
    { id: 13, text: 'Travel arrangements confirmed \u2014 away game',      subtitle: 'Operations', dueDate: '2026-04-10', dueTime: '2:00 PM',  priority: 'none', flagged: false, status: 'completed', isOverdue: false, completedAt: Date.now() - 172800000 },
    { id: 14, text: 'Coaching staff eval forms submitted',            subtitle: 'Compliance', dueDate: '2026-04-12', dueTime: '11:00 AM', priority: 'none', flagged: false, status: 'completed', isOverdue: false, completedAt: Date.now() - 7200000 },
  ],
  'sports:member': [
    { id: 1,  text: 'Film study notes \u2014 upload to team portal',       subtitle: 'Film \u00b7 Coach requested by yesterday', dueDate: '2026-04-11', dueTime: '11:59 PM', priority: 'high',   flagged: true,  status: 'pending',   isOverdue: true,  overdueLabel: 'Yesterday' },
    { id: 2,  text: 'Morning weight room session',                   subtitle: 'Operations \u00b7 Mandatory attendance',  dueDate: '2026-04-13', dueTime: '7:00 AM',  priority: 'high',   flagged: false, status: 'pending',   isOverdue: false },
    { id: 3,  text: 'Team walk-through \u2014 defensive scheme review',    subtitle: 'Film \u00b7 Game-week prep',              dueDate: '2026-04-13', dueTime: '11:00 AM', priority: 'medium', flagged: false, status: 'pending',   isOverdue: false },
    { id: 4,  text: 'Academic advisor check-in',                     subtitle: 'Compliance \u00b7 GPA eligibility review',  dueDate: '2026-04-13', dueTime: '3:00 PM',  priority: 'high',   flagged: true,  status: 'pending',   isOverdue: false },
    { id: 5,  text: 'Individual skills session with Coach',          subtitle: 'Operations \u00b7 Ball-handling focus',    dueDate: '2026-04-15', dueTime: '2:00 PM',  priority: 'medium', flagged: false, status: 'pending',   isOverdue: false },
    { id: 6,  text: 'Exam prep \u2014 two finals next week',               subtitle: 'Academic \u00b7 Eligibility priority',   dueDate: '2026-04-16', dueTime: '10:00 AM', priority: 'high',   flagged: true,  status: 'pending',   isOverdue: false },
    { id: 7,  text: 'NAIA eligibility paperwork \u2014 sign & return',     subtitle: 'Compliance \u00b7 Tournament clearance', dueDate: '2026-04-17', dueTime: '5:00 PM',  priority: 'high',   flagged: false, status: 'pending',   isOverdue: false },
    { id: 8,  text: 'Conference tournament tip-off \u2014 travel pack',    subtitle: 'Operations \u00b7 Bus departs 6 AM',     dueDate: '2026-04-20', dueTime: '6:00 AM',  priority: 'medium', flagged: false, status: 'pending',   isOverdue: false },
    { id: 9,  text: 'Attended film session \u2014 Thursday',               subtitle: 'Film',       dueDate: '2026-04-10', dueTime: '5:00 PM',  priority: 'none', flagged: false, status: 'completed', isOverdue: false, completedAt: Date.now() - 172800000 },
    { id: 10, text: 'Signed team code of conduct',                   subtitle: 'Compliance', dueDate: '2026-04-12', dueTime: '12:00 PM', priority: 'none', flagged: false, status: 'completed', isOverdue: false, completedAt: Date.now() - 7200000 },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS   = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

function formatDueLabel(r: Reminder): string {
  if (!r.dueDate) return '';
  if (r.isOverdue) return r.overdueLabel ?? 'Overdue';
  if (r.dueDate === '2026-04-13') return r.dueTime ?? 'Today';
  const parts = r.dueDate.split('-');
  const mIdx  = parseInt(parts[1]) - 1;
  const day   = parseInt(parts[2]);
  return `${MONTHS[mIdx]} ${day}`;
}

function formatDateHeader(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date      = new Date(y, m - 1, d);
  const dayAbbr   = DAYS[date.getDay()];
  const monAbbr   = MONTHS[m - 1].toUpperCase();
  return `${dayAbbr} ${monAbbr} ${d}`;
}

// Category color system — maps category name → border/dot color
function getCategoryColor(subtitle: string | undefined, C: ComponentColors): string {
  if (!subtitle) return C.secondary;
  const cat = subtitle.split(/[\u00b7·]/)[0].trim().toLowerCase();
  if (cat === 'content' || cat === 'academic' || cat === 'ministry')  return C.label;
  if (cat === 'deals' || cat === 'recruiting' || cat === 'legal')     return CAUTION;
  if (cat === 'earnings' || cat === 'finance')                         return GAIN;
  if (cat === 'compliance')                                            return HEAT;
  return C.secondary;
}

function getLeftBorderColor(r: Reminder, C: ComponentColors): string {
  if (r.status === 'completed')     return GAIN;
  if (r.isOverdue)                  return HEAT;
  // Today cards: category-based color
  if (r.dueDate === '2026-04-13')   return getCategoryColor(r.subtitle, C);
  // Scheduled / future: priority-based
  if (r.priority === 'high')        return HEAT;
  if (r.priority === 'medium')      return CAUTION;
  if (r.flagged)                    return CAUTION;
  return 'transparent';
}

// ── Reminder Row ──────────────────────────────────────────────────────────────

interface ReminderRowProps {
  reminder:   Reminder;
  onToggle:   (id: number) => void;
  onFlag:     (id: number) => void;
  onDelete:   (id: number) => void;
  C:          ComponentColors;
  dangerBg:   string;
  warningBg:  string;
  fadeValue:  Animated.Value;
}

function ReminderRow({ reminder, onToggle, onFlag, onDelete, C, dangerBg, warningBg, fadeValue }: ReminderRowProps) {
  const isCompleted  = reminder.status === 'completed';
  const isToday      = reminder.dueDate === '2026-04-13' && !reminder.isOverdue;
  const borderColor  = getLeftBorderColor(reminder, C);
  const hasBorder    = borderColor !== 'transparent';
  const dueLabel     = formatDueLabel(reminder);
  const catColor     = getCategoryColor(reminder.subtitle, C);

  // Card background
  let cardBg = C.surface;
  if (reminder.isOverdue)              cardBg = dangerBg;
  else if (isToday && reminder.flagged) cardBg = warningBg;

  // Due label color
  const dueLabelColor = reminder.isOverdue ? HEAT : C.label;

  return (
    <Animated.View style={{ opacity: fadeValue }}>
      <Pressable
        onLongPress={() =>
          Alert.alert('Options', undefined, [
            { text: reminder.flagged ? 'Remove Flag' : 'Flag', onPress: () => onFlag(reminder.id) },
            { text: 'Delete', style: 'destructive', onPress: () => onDelete(reminder.id) },
            { text: 'Cancel', style: 'cancel' },
          ])
        }
        style={[
          styles.reminderRow,
          {
            backgroundColor: cardBg,
            borderLeftColor: hasBorder ? borderColor : undefined,
            borderLeftWidth: hasBorder ? 3 : 0,
            paddingLeft:     hasBorder ? 11 : 14,
          },
        ]}
      >
        {/* Checkbox */}
        <Pressable onPress={() => onToggle(reminder.id)} hitSlop={8} style={styles.checkboxWrapper}>
          {isCompleted ? (
            <IconSymbol name="checkmark.circle.fill" size={22} color={GAIN} />
          ) : (
            <View style={[styles.emptyCircle, { borderColor: C.separator }]} />
          )}
        </Pressable>

        {/* Content */}
        <View style={styles.reminderContent}>
          <View style={styles.priorityTextRow}>
            {reminder.priority !== 'none' && (
              <View style={[styles.priorityDot, { backgroundColor: reminder.priority === 'high' ? HEAT : CAUTION }]} />
            )}
            <Text
              style={[
                styles.reminderText,
                { color: C.label },
                isCompleted && { textDecorationLine: 'line-through', color: C.secondary },
              ]}
              numberOfLines={2}
            >
              {reminder.text}
            </Text>
          </View>

          {/* Subtitle with category dot */}
          {reminder.subtitle ? (
            <View style={styles.subtitleRow}>
              {!isCompleted && (
                <View style={[styles.catDot, { backgroundColor: catColor }]} />
              )}
              <Text style={[styles.reminderSubtitle, { color: C.secondary }]} numberOfLines={1}>
                {reminder.subtitle}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Right: flag + timestamp */}
        <View style={styles.reminderRight}>
          <Pressable onPress={() => onFlag(reminder.id)} hitSlop={8}>
            <IconSymbol
              name={reminder.flagged ? 'flag.fill' : 'flag'}
              size={13}
              color={reminder.flagged ? CAUTION : C.separator}
            />
          </Pressable>
          {reminder.dueDate ? (
            <Text
              style={[
                styles.dueLabel,
                {
                  color:      dueLabelColor,
                  fontWeight: reminder.isOverdue ? '600' : '500',
                },
              ]}
            >
              {dueLabel}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function RemindersScreen() {
  const C         = useColors();
  const insets    = useSafeAreaInsets();
  const dangerBg  = DANGER_BG;
  const warningBg = WARNING_BG;

  const { state } = useAppContext();
  const mode = state.activeContext?.mode ?? 'personal';
  const roleKeyMap: Record<string, string> = {
    personal: 'personal:agenda', business: 'business',
    education: 'education', community: 'community:agenda', sports: 'sports:agenda',
  };
  const roleKey = roleKeyMap[mode] ?? 'personal:agenda';
  const [role, cycleRole, roleCycles] = useDemoRole(roleKey);
  const isOwner = role === roleCycles[0];

  const dataKey = `${mode}:${isOwner ? 'admin' : 'member'}`;
  const [reminders,     setReminders]     = useState<Reminder[]>(() => REMINDERS_BY_MODE[dataKey] ?? REMINDERS_BY_MODE['personal:admin']);
  const [activeFilter,  setActiveFilter]  = useState<FilterTab>('Today');
  const [showCompleted, setShowCompleted] = useState(false);

  // Create sheet state
  const sheetRef      = useRef<BottomSheetModal>(null);
  const inputRef      = useRef<TextInput>(null);
  const [newText,     setNewText]     = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newDate,     setNewDate]     = useState<DateChoice>('today');
  const [newTime,     setNewTime]     = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('none');
  const [newFlagged,  setNewFlagged]  = useState(false);

  // Animated fade values per reminder id
  const fadeValues = useRef<Map<number, Animated.Value>>(new Map());
  const getFadeValue = useCallback((id: number): Animated.Value => {
    if (!fadeValues.current.has(id)) {
      fadeValues.current.set(id, new Animated.Value(1));
    }
    return fadeValues.current.get(id)!;
  }, []);

  // Reset data when mode or role changes
  useEffect(() => {
    const key = `${mode}:${isOwner ? 'admin' : 'member'}`;
    setReminders(REMINDERS_BY_MODE[key] ?? REMINDERS_BY_MODE['personal:admin']);
    setActiveFilter('Today');
  }, [mode, isOwner]);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  // ── Derived lists ───────────────────────────────────────────────────────────
  const pending   = reminders.filter(r => r.status === 'pending');
  const completed = reminders.filter(r => r.status === 'completed');

  const overdue    = pending.filter(r => r.isOverdue);
  const todayItems = pending.filter(r => !r.isOverdue && r.dueDate === '2026-04-13');
  const scheduled  = pending.filter(r => !r.isOverdue && r.dueDate && r.dueDate > '2026-04-13');
  const flagged    = pending.filter(r => r.flagged);

  const filteredPending = useMemo(() => {
    if (activeFilter === 'Today')     return { overdue,    today: todayItems };
    if (activeFilter === 'Scheduled') return { overdue: [], today: scheduled };
    if (activeFilter === 'Flagged')   return { overdue: [], today: flagged };
    return { overdue, today: pending.filter(r => !r.isOverdue) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, reminders]);

  const scheduledGroups = useMemo(() => {
    if (activeFilter !== 'Scheduled') return [];
    const byDate: Record<string, Reminder[]> = {};
    scheduled.forEach(r => {
      const k = r.dueDate!;
      if (!byDate[k]) byDate[k] = [];
      byDate[k].push(r);
    });
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, items]) => ({ date, items }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, reminders]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const toggleComplete = useCallback((id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;

    if (reminder.status === 'pending') {
      // Fade out, then move to completed
      const fadeVal = getFadeValue(id);
      Animated.timing(fadeVal, { toValue: 0, duration: 350, useNativeDriver: true }).start(() => {
        setReminders(prev =>
          prev.map(r => r.id === id ? { ...r, status: 'completed', completedAt: Date.now() } : r)
        );
        // Reset for possible un-complete
        fadeVal.setValue(1);
      });
    } else {
      setReminders(prev =>
        prev.map(r => r.id === id ? { ...r, status: 'pending' } : r)
      );
    }
  }, [reminders, getFadeValue]);

  const toggleFlag = useCallback((id: number) => {
    Haptics.selectionAsync();
    setReminders(prev => prev.map(r => r.id === id ? { ...r, flagged: !r.flagged } : r));
  }, []);

  const deleteReminder = useCallback((id: number) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setReminders(prev => prev.filter(r => r.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    Alert.alert('Clear Completed', 'Remove all completed reminders?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear All', style: 'destructive', onPress: () => setReminders(prev => prev.filter(r => r.status !== 'completed')) },
    ]);
  }, []);

  const createReminder = useCallback(() => {
    if (!newText.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const dueDateMap: Record<DateChoice, string | undefined> = {
      today: '2026-04-13', tomorrow: '2026-04-14', weekend: '2026-04-18', none: undefined,
    };
    const dueDate = dueDateMap[newDate];
    const newR: Reminder = {
      id:        Date.now(),
      text:      newText.trim(),
      subtitle:  newSubtitle.trim() || undefined,
      dueDate,
      dueTime:   newTime || (newDate === 'today' ? '9:00 AM' : undefined),
      priority:  newPriority,
      flagged:   newFlagged,
      status:    'pending',
      isOverdue: false,
    };
    setReminders(prev => [newR, ...prev]);
    setNewText(''); setNewSubtitle(''); setNewDate('today');
    setNewTime(''); setNewPriority('none'); setNewFlagged(false);
    sheetRef.current?.dismiss();
  }, [newText, newSubtitle, newDate, newTime, newPriority, newFlagged]);

  // ── Backdrop ────────────────────────────────────────────────────────────────
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} pressBehavior="close" />
    ),
    []
  );

  const handleFilter = useCallback((f: FilterTab) => {
    Haptics.selectionAsync();
    setActiveFilter(f);
  }, []);

  const hasOverdue = filteredPending.overdue.length > 0;
  const hasToday   = filteredPending.today.length > 0;
  const isEmpty    = !hasOverdue && !hasToday;
  const fabBottom  = insets.bottom + 80;

  // Shared row renderer
  const renderRow = (r: Reminder) => (
    <ReminderRow
      key={r.id}
      reminder={r}
      onToggle={toggleComplete}
      onFlag={toggleFlag}
      onDelete={deleteReminder}
      C={C}
      dangerBg={dangerBg}
      warningBg={warningBg}
      fadeValue={getFadeValue(r.id)}
    />
  );

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <Animated.View style={[styles.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={styles.topBar}>
          <Pressable onPress={() => openSidePanel()} hitSlop={8} style={styles.topBarSide}>
            <KMenuButton />
          </Pressable>
          <View style={styles.topBarCenter}>
            <View style={[styles.screenPill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[styles.screenPillText, { color: C.label }]}>Reminders</Text>
            </View>
          </View>
          <View style={{ minWidth: 44, alignItems: 'flex-end', justifyContent: 'center' }}>
            <RolePill role={role} onPress={cycleRole} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 52 + 8, paddingBottom: insets.bottom + 80 }}
        keyboardShouldPersistTaps="handled"
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* ── Filter pills ─────────────────────────────────────────────────── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {(['Today', 'Scheduled', 'Flagged', 'All'] as FilterTab[]).map(f => {
            const active = activeFilter === f;
            return (
              <Pressable
                key={f}
                onPress={() => handleFilter(f)}
                style={[styles.filterPill, { backgroundColor: active ? C.label : 'transparent', borderColor: active ? C.label : C.separator }]}
              >
                <Text style={[styles.filterPillText, { color: active ? C.bg : C.label }]}>{f}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── OVERDUE section ──────────────────────────────────────────────── */}
        {activeFilter === 'Today' && hasOverdue && (
          <View style={styles.overdueSection}>
            <Text style={[styles.sectionHeader, { color: HEAT }]}>OVERDUE</Text>
            {filteredPending.overdue.map(renderRow)}
          </View>
        )}

        {/* ── Divider between OVERDUE and TODAY ────────────────────────────── */}
        {activeFilter === 'Today' && hasOverdue && hasToday && (
          <View style={[styles.sectionDivider, { backgroundColor: C.separator }]} />
        )}

        {/* ── TODAY / main list ────────────────────────────────────────────── */}
        {activeFilter !== 'Scheduled' ? (
          <>
            {hasToday && activeFilter === 'Today' && (
              <Text style={[styles.sectionHeader, { color: C.secondary }]}>TODAY</Text>
            )}
            {filteredPending.today.map(renderRow)}

            {/* Today empty (when overdue exists but today is clear) */}
            {activeFilter === 'Today' && hasOverdue && !hasToday && (
              <View style={styles.todayEmptyState}>
                <Text style={[styles.todayEmptyTitle, { color: C.secondary }]}>All clear for today</Text>
                <Pressable
                  onPress={() => openDipsonSheet('Reminders')}
                  style={[styles.dipsonBtn, { backgroundColor: C.surface, borderColor: C.separator }]}
                >
                  <IconSymbol name="sparkles" size={14} color={C.secondary} />
                  <Text style={[styles.dipsonBtnText, { color: C.label }]}>Ask Dipson to plan your day</Text>
                </Pressable>
              </View>
            )}
          </>
        ) : (
          scheduledGroups.map(group => (
            <View key={group.date}>
              <Text style={[styles.dateHeader, { color: C.secondary, borderBottomColor: C.separator }]}>
                {formatDateHeader(group.date)}
              </Text>
              {group.items.map(renderRow)}
            </View>
          ))
        )}

        {/* ── Full empty state ─────────────────────────────────────────────── */}
        {isEmpty && (
          <View style={styles.emptyState}>
            <IconSymbol name="checkmark.circle" size={52} color={C.separator} />
            <Text style={[styles.emptyTitle, { color: C.label }]}>No reminders</Text>
            <Text style={[styles.emptySubtitle, { color: C.secondary }]}>
              Tap + to create one, or ask Dipson
            </Text>
            <Pressable
              onPress={() => openDipsonSheet('Reminders')}
              style={[styles.dipsonBtn, { backgroundColor: C.surface, borderColor: C.separator }]}
            >
              <IconSymbol name="sparkles" size={14} color={C.secondary} />
              <Text style={[styles.dipsonBtnText, { color: C.label }]}>Ask Dipson</Text>
            </Pressable>
          </View>
        )}

        {/* ── Completed section ────────────────────────────────────────────── */}
        {completed.length > 0 && (
          <View style={styles.completedSection}>
            <View style={[styles.completedHeader, { borderTopColor: C.separator }]}>
              <Pressable onPress={() => setShowCompleted(v => !v)} style={styles.completedHeaderLeft}>
                <IconSymbol name={showCompleted ? 'chevron.down' : 'chevron.right'} size={12} color={C.secondary} />
                <Text style={[styles.completedHeaderText, { color: C.secondary }]}>
                  Completed ({completed.length})
                </Text>
              </Pressable>
              <Pressable onPress={clearCompleted} hitSlop={8}>
                <Text style={[styles.clearText, { color: HEAT }]}>Clear</Text>
              </Pressable>
            </View>
            {showCompleted && completed.map(renderRow)}
          </View>
        )}
      </ScrollView>

      {/* ── FAB ─────────────────────────────────────────────────────────────── */}
      {isOwner && (
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); sheetRef.current?.present(); }}
          style={[styles.fab, { backgroundColor: C.label, bottom: fabBottom }]}
        >
          <IconSymbol name="plus" size={24} color={C.bg} />
        </Pressable>
      )}

      {/* ── Create sheet ─────────────────────────────────────────────────────── */}
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={['60%', '90%']}
        enableDynamicSizing={false}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: C.bg }}
        handleIndicatorStyle={{ backgroundColor: C.separator }}
        onDismiss={() => {
          setNewText(''); setNewSubtitle(''); setNewDate('today');
          setNewTime(''); setNewPriority('none'); setNewFlagged(false);
        }}
      >
        <BottomSheetView style={[styles.sheetContent, { backgroundColor: C.bg }]}>
          <Text style={[styles.sheetTitle, { color: C.label }]}>New Reminder</Text>

          <TextInput
            ref={inputRef}
            placeholder="What do you need to remember?"
            placeholderTextColor={C.secondary}
            value={newText}
            onChangeText={setNewText}
            autoFocus
            multiline
            style={[styles.mainInput, { color: C.label, backgroundColor: C.surface, borderColor: C.separator }]}
          />

          <TextInput
            placeholder="Add notes (optional)"
            placeholderTextColor={C.secondary}
            value={newSubtitle}
            onChangeText={setNewSubtitle}
            style={[styles.notesInput, { color: C.label, backgroundColor: C.surface, borderColor: C.separator }]}
          />

          <Text style={[styles.sheetSectionLabel, { color: C.secondary }]}>When</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {(['today', 'tomorrow', 'weekend', 'none'] as DateChoice[]).map(d => {
              const active = newDate === d;
              const label: Record<DateChoice, string> = { today: 'Today', tomorrow: 'Tomorrow', weekend: 'Weekend', none: 'No Date' };
              return (
                <Pressable
                  key={d}
                  onPress={() => setNewDate(d)}
                  style={[styles.chip, { backgroundColor: active ? C.label : C.surface, borderColor: active ? C.label : C.separator }]}
                >
                  <Text style={[styles.chipText, { color: active ? C.bg : C.label }]}>{label[d]}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={[styles.sheetSectionLabel, { color: C.secondary }]}>Priority</Text>
          <View style={styles.priorityRow}>
            {(['none', 'medium', 'high'] as Priority[]).map(p => {
              const active = newPriority === p;
              const label  = p.charAt(0).toUpperCase() + p.slice(1);
              return (
                <Pressable
                  key={p}
                  onPress={() => setNewPriority(p)}
                  style={[styles.priorityChip, { backgroundColor: active ? C.label : C.surface, borderColor: active ? C.label : C.separator }]}
                >
                  {p !== 'none' && (
                    <View style={[styles.priorityDot, { backgroundColor: p === 'high' ? HEAT : CAUTION }]} />
                  )}
                  <Text style={[styles.chipText, { color: active ? C.bg : C.label }]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable onPress={() => setNewFlagged(v => !v)} style={[styles.flagRow, { borderColor: C.separator }]}>
            <IconSymbol name={newFlagged ? 'flag.fill' : 'flag'} size={16} color={newFlagged ? CAUTION : C.secondary} />
            <Text style={[styles.flagRowText, { color: C.label }]}>Flag this reminder</Text>
            {newFlagged && (
              <View style={[styles.flaggedBadge, { backgroundColor: CAUTION + '22' }]}>
                <Text style={[styles.flaggedBadgeText, { color: CAUTION }]}>Flagged</Text>
              </View>
            )}
          </Pressable>

          <Pressable
            onPress={createReminder}
            disabled={!newText.trim()}
            style={[styles.addButton, { backgroundColor: newText.trim() ? C.label : C.separator }]}
          >
            <Text style={[styles.addButtonText, { color: newText.trim() ? C.bg : C.secondary }]}>Add Reminder</Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  // Top bar
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topBar: {
    height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12,
  },
  topBarSide: { width: 44, alignItems: 'flex-start', justifyContent: 'center' },
  topBarCenter: { flex: 1, alignItems: 'center' },
  screenPill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  screenPillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },

  // Filter row
  filterRow: { paddingHorizontal: 12, paddingVertical: 10, gap: 8, flexDirection: 'row', alignItems: 'center' },
  filterPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, borderWidth: 1 },
  filterPillText: { fontSize: 13, fontWeight: '500' },

  // Section headers
  overdueSection: { marginBottom: 4 },
  sectionHeader: {
    paddingHorizontal: 16, paddingVertical: 8,
    fontSize: 11, fontWeight: '700', letterSpacing: 0.7,
  },
  sectionDivider: { height: StyleSheet.hairlineWidth, marginHorizontal: 16, marginTop: 8, marginBottom: 16 },
  dateHeader: {
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
    fontSize: 11, fontWeight: '700', letterSpacing: 0.7,
    borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: 4,
  },

  // Reminder row
  reminderRow: {
    marginHorizontal: 16,
    marginBottom:     12,
    borderRadius:     12,
    paddingRight:     14,
    paddingTop:       14,
    paddingBottom:    14,
    flexDirection:    'row',
    alignItems:       'flex-start',
    gap:              12,
  },
  checkboxWrapper: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  emptyCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5 },
  reminderContent: { flex: 1 },
  priorityTextRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  priorityDot: { width: 7, height: 7, borderRadius: 3.5, flexShrink: 0 },
  reminderText: { fontSize: 15, fontWeight: '500', flex: 1 },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  catDot: { width: 6, height: 6, borderRadius: 3, flexShrink: 0 },
  reminderSubtitle: { fontSize: 12, flex: 1 },
  reminderRight: { alignItems: 'flex-end', gap: 4, paddingTop: 1, minWidth: 56 },
  dueLabel: { fontSize: 11 },

  // Today empty (all-clear sub-state)
  todayEmptyState: { alignItems: 'center', paddingVertical: 24, gap: 12 },
  todayEmptyTitle: { fontSize: 14 },

  // Full empty state
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64, gap: 10 },
  emptyTitle: { fontSize: 20, fontWeight: '600', marginTop: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
  dipsonBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 8, paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 20, borderWidth: 1,
  },
  dipsonBtnText: { fontSize: 14, fontWeight: '500' },

  // Completed section
  completedSection: { marginTop: 8 },
  completedHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth,
  },
  completedHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  completedHeaderText: { fontSize: 14, fontWeight: '500' },
  clearText: { fontSize: 13, fontWeight: '500' },

  // FAB
  fab: {
    position: 'absolute', right: 16,
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },

  // Create sheet
  sheetContent: { flex: 1, padding: 16 },
  sheetTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  mainInput: {
    borderRadius: 12, borderWidth: 1, padding: 12, fontSize: 15,
    minHeight: 80, textAlignVertical: 'top', marginBottom: 10,
  },
  notesInput: { borderRadius: 12, borderWidth: 1, padding: 12, fontSize: 14, marginBottom: 16 },
  sheetSectionLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 16, paddingRight: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '500' },
  priorityRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  priorityChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 9, borderRadius: 12, borderWidth: 1,
  },
  flagRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: 16,
  },
  flagRowText: { fontSize: 15, fontWeight: '500', flex: 1 },
  flaggedBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  flaggedBadgeText: { fontSize: 12, fontWeight: '600' },
  addButton: { paddingVertical: 14, borderRadius: 16, alignItems: 'center', marginTop: 16 },
  addButtonText: { fontSize: 16, fontWeight: '600' },
});
