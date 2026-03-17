/**
 * Phone — Calls · Meetings · Contacts
 * Matches KaNeXT_Phone_Spec_Final + kanext-phone-v2.html prototype.
 *
 * Layout:
 *   Segmented control (Calls / Meetings / Contacts)
 *   Canvas (scrollable, view-dependent)
 *
 * Side panel: Context Scope → Voicemail → Settings
 * Swipe right → open panel. No swipe between views.
 * Floating dialer FAB (Calls only) → opens dialer bottom sheet.
 */

import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { LongPressContextMenu, type ContextMenuData } from '@/components/ui/long-press-context-menu';
import { initiateCall } from '@/utils/global-call';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';
import { useOrganization } from '@/context/app-context';

// ─── Color palette ────────────────────────────────────────────────────────────

const RED    = '#D93636';
const GREEN  = '#2D9E42';
const ORANGE = '#C97B08';

// ─── Org-scoped phone data ────────────────────────────────────────────────────

type CallType = 'missed' | 'incoming' | 'outgoing';

type ContactEntry = { key: string; initials: string; uri?: string; name: string; role: string; orgTag?: string };
type ContactDept  = { key: string; label: string; count: number; members: ContactEntry[] };

type OrgPhoneData = {
  orgLabel: string;
  voicemails: { key: string; name: string; time: string; transcript: string }[];
  favorites: { key: string; initials: string; uri?: string; name: string; role: string; online: boolean }[];
  missedPriority: { key: string; urgency: 'crit' | 'warn'; typeLabel: string; title: string; meta: string; action: string }[];
  recentCalls: { key: string; initials: string; uri?: string; name: string; callType: CallType; badge: string; meta: string; time: string }[];
  startingSoon: { key: string; countdown: string; title: string; time: string; badge: string; participants: number; avatars: string[] }[];
  scheduledToday: { key: string; title: string; time: string; badge: string; participants: number }[];
  recurringRooms: { key: string; name: string; meta: string }[];
  recordings: { key: string; name: string; meta: string }[];
  frequentContacts: ContactEntry[];
  departments: ContactDept[];
};

const ORG_PHONE_DATA: Record<string, OrgPhoneData> = {
  'KaNeXT': {
    orgLabel: 'KaNeXT',
    voicemails: [
      { key: 'vm1', name: 'Series A Lead',    time: '1h ago',   transcript: '"Hey, wanted to discuss the term sheet before Friday. Call me back when..."' },
      { key: 'vm2', name: 'T. Moore (Advisor)', time: 'Yesterday', transcript: '"Quick thought on go-to-market. Worth a 15-min call this week..."' },
    ],
    favorites: [
      { key: 'sk', initials: 'SK', uri: 'https://i.pravatar.cc/100?img=1',  name: 'Sammy K.',   role: 'Founder',     online: true  },
      { key: 'jd', initials: 'JD', uri: 'https://i.pravatar.cc/100?img=3',  name: 'J. Dean',    role: 'CPO',         online: true  },
      { key: 'ar', initials: 'AR', uri: 'https://i.pravatar.cc/100?img=7',  name: 'A. Ramos',   role: 'CTO',         online: false },
      { key: 'vp', initials: 'VP', uri: 'https://i.pravatar.cc/100?img=11', name: 'V. Patel',   role: 'Investor',    online: false },
      { key: 'tm', initials: 'TM', uri: 'https://i.pravatar.cc/100?img=33', name: 'T. Moore',   role: 'Advisor',     online: false },
      { key: 'rc', initials: 'RC', uri: 'https://i.pravatar.cc/100?img=26', name: 'R. Chen',    role: 'Design Lead', online: true  },
    ],
    missedPriority: [
      { key: 'mp1', urgency: 'crit', typeLabel: 'Missed · 2x', title: 'Series A Lead',         meta: 'Called twice this morning',  action: 'Call Back' },
      { key: 'mp2', urgency: 'warn', typeLabel: 'Missed',      title: 'Partnership — Stripe',  meta: '9:30 AM · No voicemail',     action: 'Call Back' },
      { key: 'mp3', urgency: 'crit', typeLabel: 'Urgent',      title: 'Advisory Board Member', meta: 'Voicemail · 8:45 AM',        action: 'Listen'    },
    ],
    recentCalls: [
      { key: 'r1', initials: 'SA', uri: 'https://i.pravatar.cc/100?img=2',  name: 'Series A Lead',       callType: 'missed',   badge: 'Investors',    meta: '2 calls', time: '9:20 AM'   },
      { key: 'r2', initials: 'PS', uri: 'https://i.pravatar.cc/100?img=4',  name: 'Partnership — Stripe',callType: 'missed',   badge: 'Partnerships', meta: '',        time: '9:30 AM'   },
      { key: 'r3', initials: 'AB', uri: 'https://i.pravatar.cc/100?img=6',  name: 'Advisory Board',      callType: 'missed',   badge: 'Board',        meta: 'VM',      time: '8:45 AM'   },
      { key: 'r4', initials: 'JD', uri: 'https://i.pravatar.cc/100?img=3',  name: 'J. Dean',             callType: 'incoming', badge: 'KaNeXT · CPO', meta: '',        time: '8:00 AM'   },
      { key: 'r5', initials: 'AR', uri: 'https://i.pravatar.cc/100?img=7',  name: 'A. Ramos',            callType: 'outgoing', badge: 'KaNeXT · CTO', meta: '',        time: 'Yesterday' },
      { key: 'r6', initials: 'VP', uri: 'https://i.pravatar.cc/100?img=11', name: 'V. Patel',            callType: 'incoming', badge: 'Investors',    meta: 'VM',      time: 'Yesterday' },
    ],
    startingSoon: [
      { key: 'ms1', countdown: 'Starts in 12 min', title: 'Product Roadmap Review', time: '11:00 AM', badge: 'KaNeXT', participants: 5, avatars: ['JD', 'AR', 'RC', '+2'] },
    ],
    scheduledToday: [
      { key: 'mt1', title: 'Investor Sync — Series A', time: '2:00 PM', badge: 'Investors', participants: 4 },
      { key: 'mt2', title: 'Design Sprint Kickoff',    time: '4:00 PM', badge: 'KaNeXT',    participants: 6 },
    ],
    recurringRooms: [
      { key: 'rr1', name: 'Leadership Room',  meta: 'Daily · Founders & Leads'    },
      { key: 'rr2', name: 'Investor Room',    meta: 'Weekly · Investor Relations' },
      { key: 'rr3', name: 'Product Standup',  meta: 'Daily · Product Team'        },
    ],
    recordings: [
      { key: 'rec1', name: 'Product Sync — Mar 13',   meta: '38 min · Transcript ready' },
      { key: 'rec2', name: 'Investor Call — Mar 11',  meta: '55 min · Summary ready'    },
    ],
    frequentContacts: [
      { key: 'fc1', initials: 'JD', uri: 'https://i.pravatar.cc/100?img=3',  name: 'J. Dean',  role: 'Chief Product Officer',    orgTag: 'KaNeXT' },
      { key: 'fc2', initials: 'AR', uri: 'https://i.pravatar.cc/100?img=7',  name: 'A. Ramos', role: 'Chief Technology Officer', orgTag: 'KaNeXT' },
      { key: 'fc3', initials: 'VP', uri: 'https://i.pravatar.cc/100?img=11', name: 'V. Patel', role: 'Lead Investor',             orgTag: 'Series A' },
    ],
    departments: [
      { key: 'leadership',  label: 'Leadership',   count: 4,  members: [
        { key: 'm1', initials: 'SK', uri: 'https://i.pravatar.cc/100?img=1',  name: 'Sammy K.',  role: 'Founder & CEO',            orgTag: 'KaNeXT' },
        { key: 'm2', initials: 'JD', uri: 'https://i.pravatar.cc/100?img=3',  name: 'J. Dean',   role: 'Chief Product Officer',    orgTag: 'KaNeXT' },
        { key: 'm3', initials: 'AR', uri: 'https://i.pravatar.cc/100?img=7',  name: 'A. Ramos',  role: 'Chief Technology Officer', orgTag: 'KaNeXT' },
        { key: 'm4', initials: 'TM', uri: 'https://i.pravatar.cc/100?img=33', name: 'T. Moore',  role: 'Advisor',                  orgTag: 'KaNeXT' },
      ]},
      { key: 'product',     label: 'Product',      count: 6,  members: [
        { key: 'm5', initials: 'RC', uri: 'https://i.pravatar.cc/100?img=26', name: 'R. Chen',   role: 'Design Lead',   orgTag: 'KaNeXT' },
        { key: 'm6', initials: 'KL', uri: 'https://i.pravatar.cc/100?img=30', name: 'K. Liu',    role: 'PM',            orgTag: 'KaNeXT' },
      ]},
      { key: 'engineering', label: 'Engineering',  count: 8,  members: [
        { key: 'm7', initials: 'MS', uri: 'https://i.pravatar.cc/100?img=9',  name: 'M. Shah',   role: 'Growth Eng',    orgTag: 'KaNeXT' },
        { key: 'm8', initials: 'BK', uri: 'https://i.pravatar.cc/100?img=14', name: 'B. Kim',    role: 'Backend Eng',   orgTag: 'KaNeXT' },
      ]},
      { key: 'operations',  label: 'Operations',   count: 5,  members: [
        { key: 'm9', initials: 'LT', uri: 'https://i.pravatar.cc/100?img=46', name: 'L. Torres', role: 'Ops Lead',      orgTag: 'KaNeXT' },
      ]},
    ],
  },

  'Lincoln University': {
    orgLabel: 'Lincoln U',
    voicemails: [
      { key: 'vm1', name: 'Coach Davis',          time: '2h ago',   transcript: '"Hey, wanted to check on the film notes for the WR group. Call me back when..."' },
      { key: 'vm2', name: 'J. Williams (Recruit)', time: 'Yesterday', transcript: '"Hi Coach, this is Jamal. I had a question about my official visit next..."' },
    ],
    favorites: [
      { key: 'mt', initials: 'MT', uri: 'https://i.pravatar.cc/100?img=35', name: 'Mike T.',     role: 'AD',      online: true  },
      { key: 'cd', initials: 'CD', uri: 'https://i.pravatar.cc/100?img=15', name: 'Coach D.',    role: 'DC',      online: false },
      { key: 'jw', initials: 'JW', uri: 'https://i.pravatar.cc/100?img=20', name: 'J. Williams', role: 'Recruit', online: false },
      { key: 'sr', initials: 'SR', uri: 'https://i.pravatar.cc/100?img=37', name: 'S. Roberts',  role: 'OC',      online: true  },
      { key: 'pj', initials: 'PJ', uri: 'https://i.pravatar.cc/100?img=38', name: 'P. Johnson',  role: 'Trainer', online: false },
      { key: 'lm', initials: 'LM', uri: 'https://i.pravatar.cc/100?img=39', name: 'L. Martin',   role: 'Booster', online: false },
      { key: 'kd', initials: 'KD', uri: 'https://i.pravatar.cc/100?img=41', name: 'K. Davis',    role: 'HC',      online: false },
    ],
    missedPriority: [
      { key: 'mp1', urgency: 'crit', typeLabel: 'Missed · 3x', title: "President's Office",  meta: 'Called 3 times today',    action: 'Call Back' },
      { key: 'mp2', urgency: 'warn', typeLabel: 'Missed',      title: 'Recruit — D. Carter', meta: '11:20 AM · No voicemail', action: 'Call Back' },
      { key: 'mp3', urgency: 'crit', typeLabel: 'Urgent',      title: 'Compliance Office',   meta: 'Voicemail · 9:15 AM',     action: 'Listen'    },
    ],
    recentCalls: [
      { key: 'r1', initials: 'PO', uri: 'https://i.pravatar.cc/100?img=17', name: "President's Office",  callType: 'missed',   badge: 'Lincoln U',      meta: '3 calls', time: '10:45 AM'  },
      { key: 'r2', initials: 'DC', uri: 'https://i.pravatar.cc/100?img=22', name: 'D. Carter (Recruit)', callType: 'missed',   badge: 'Pipeline',       meta: '',        time: '11:20 AM'  },
      { key: 'r3', initials: 'CO', uri: 'https://i.pravatar.cc/100?img=36', name: 'Compliance Office',   callType: 'missed',   badge: 'Lincoln U',      meta: 'VM',      time: '9:15 AM'   },
      { key: 'r4', initials: 'SR', uri: 'https://i.pravatar.cc/100?img=37', name: 'S. Roberts',          callType: 'incoming', badge: 'Lincoln U · OC', meta: '',        time: '9:02 AM'   },
      { key: 'r5', initials: 'MT', uri: 'https://i.pravatar.cc/100?img=35', name: 'Mike Thompson',       callType: 'outgoing', badge: 'Lincoln U · AD', meta: '',        time: '8:30 AM'   },
      { key: 'r6', initials: 'CD', uri: 'https://i.pravatar.cc/100?img=15', name: 'Coach Davis',         callType: 'incoming', badge: 'Lincoln U · DC', meta: 'VM',      time: 'Yesterday' },
    ],
    startingSoon: [
      { key: 'ms1', countdown: 'Starts in 18 min', title: 'Film Review — WR Group', time: '10:00 AM', badge: 'Lincoln U', participants: 6, avatars: ['SR', 'CD', 'PJ', '+3'] },
    ],
    scheduledToday: [
      { key: 'mt1', title: 'Recruit Call — J. Williams', time: '12:00 PM', badge: 'Pipeline',  participants: 2 },
      { key: 'mt2', title: 'Academic Review',             time: '3:00 PM',  badge: 'Lincoln U', participants: 8 },
    ],
    recurringRooms: [
      { key: 'rr1', name: 'Staff Meeting Room', meta: 'Weekly · Coaching Staff'       },
      { key: 'rr2', name: 'Recruiting Room',    meta: 'Persistent · Recruiting Staff' },
      { key: 'rr3', name: 'Leadership Huddle',  meta: 'Daily · Senior Staff'          },
    ],
    recordings: [
      { key: 'rec1', name: 'Staff Sync — Mar 13',              meta: '45 min · Transcript ready' },
      { key: 'rec2', name: 'Recruit Call — K. Brown — Mar 12', meta: '22 min · Summary ready'    },
    ],
    frequentContacts: [
      { key: 'fc1', initials: 'MT', uri: 'https://i.pravatar.cc/100?img=35', name: 'Mike Thompson', role: 'Athletic Director',     orgTag: 'Lincoln U' },
      { key: 'fc2', initials: 'CD', uri: 'https://i.pravatar.cc/100?img=15', name: 'Coach Davis',   role: 'Defensive Coordinator', orgTag: 'Lincoln U' },
      { key: 'fc3', initials: 'SR', uri: 'https://i.pravatar.cc/100?img=37', name: 'S. Roberts',    role: 'Offensive Coordinator', orgTag: 'Lincoln U' },
    ],
    departments: [
      { key: 'faculty', label: 'Faculty', count: 42, members: [
        { key: 'm1', initials: 'DR', uri: 'https://i.pravatar.cc/100?img=34', name: 'Dr. Richards',    role: 'Dean of Students', orgTag: 'Lincoln U' },
        { key: 'm2', initials: 'PW', uri: 'https://i.pravatar.cc/100?img=29', name: 'Prof. White',     role: 'Kinesiology',      orgTag: 'Lincoln U' },
      ]},
      { key: 'staff',   label: 'Staff',   count: 28, members: [
        { key: 'm3', initials: 'MT', uri: 'https://i.pravatar.cc/100?img=35', name: 'Mike Thompson',   role: 'Athletic Director', orgTag: 'Lincoln U' },
        { key: 'm4', initials: 'CO', uri: 'https://i.pravatar.cc/100?img=36', name: 'Compliance Office',role: 'Compliance',       orgTag: 'Lincoln U' },
      ]},
      { key: 'students', label: 'Students', count: 1200, members: [
        { key: 'm5', initials: 'DC', uri: 'https://i.pravatar.cc/100?img=22', name: 'D. Carter',       role: 'Student-Athlete',  orgTag: 'Lincoln U' },
      ]},
    ],
  },

  'ICCLA': {
    orgLabel: 'ICCLA',
    voicemails: [
      { key: 'vm1', name: 'J. Taylor (Board Chair)', time: '2h ago',      transcript: '"Wanted to discuss the building renovation budget before the meeting..."' },
      { key: 'vm2', name: 'K. Brown (Youth)',        time: 'This morning', transcript: '"Hey Pastor, question about the retreat dates. Call when you get a chance..."' },
    ],
    favorites: [
      { key: 'pj', initials: 'PJ', uri: 'https://i.pravatar.cc/100?img=40', name: 'Pastor J.',  role: 'Lead Pastor',    online: true  },
      { key: 'em', initials: 'EM', uri: 'https://i.pravatar.cc/100?img=44', name: 'Elder M.',   role: 'Worship',        online: false },
      { key: 'dt', initials: 'DT', uri: 'https://i.pravatar.cc/100?img=52', name: 'Deacon T.', role: 'Operations',     online: false },
      { key: 'kb', initials: 'KB', uri: 'https://i.pravatar.cc/100?img=48', name: 'K. Brown',  role: 'Youth Ministry', online: true  },
      { key: 'md', initials: 'MD', uri: 'https://i.pravatar.cc/100?img=43', name: 'M. Davis',  role: 'Music Director', online: false },
      { key: 'sa', initials: 'SA', uri: 'https://i.pravatar.cc/100?img=45', name: 'S. Adams',  role: 'Office Admin',   online: true  },
    ],
    missedPriority: [
      { key: 'mp1', urgency: 'warn', typeLabel: 'Missed',      title: 'Board Chair — J. Taylor',  meta: '10:15 AM · No voicemail',    action: 'Call Back' },
      { key: 'mp2', urgency: 'warn', typeLabel: 'Missed',      title: 'Youth Ministry — K. Brown',meta: '9:00 AM · Left voicemail',    action: 'Listen'    },
    ],
    recentCalls: [
      { key: 'r1', initials: 'JT', uri: 'https://i.pravatar.cc/100?img=50', name: 'J. Taylor',   callType: 'missed',   badge: 'Board',          meta: '',   time: '10:15 AM'  },
      { key: 'r2', initials: 'KB', uri: 'https://i.pravatar.cc/100?img=48', name: 'K. Brown',    callType: 'missed',   badge: 'Youth Ministry', meta: 'VM', time: '9:00 AM'   },
      { key: 'r3', initials: 'MD', uri: 'https://i.pravatar.cc/100?img=43', name: 'M. Davis',    callType: 'incoming', badge: 'Music',          meta: '',   time: '8:30 AM'   },
      { key: 'r4', initials: 'SA', uri: 'https://i.pravatar.cc/100?img=45', name: 'S. Adams',    callType: 'outgoing', badge: 'ICCLA · Admin',  meta: '',   time: 'Yesterday' },
      { key: 'r5', initials: 'EM', uri: 'https://i.pravatar.cc/100?img=44', name: 'Elder M.',    callType: 'incoming', badge: 'Leadership',     meta: 'VM', time: 'Yesterday' },
    ],
    startingSoon: [
      { key: 'ms1', countdown: 'Starts in 25 min', title: 'Sunday Service Prep', time: '9:00 AM', badge: 'ICCLA', participants: 12, avatars: ['PJ', 'EM', 'MD', '+9'] },
    ],
    scheduledToday: [
      { key: 'mt1', title: 'Elder Board Meeting',   time: '2:00 PM',  badge: 'ICCLA',          participants: 7 },
      { key: 'mt2', title: 'Youth Ministry Call',   time: '4:30 PM',  badge: 'Youth Ministry', participants: 5 },
    ],
    recurringRooms: [
      { key: 'rr1', name: 'Leadership Room',    meta: 'Weekly · Elder Board'        },
      { key: 'rr2', name: 'Ministry Leads Room',meta: 'Weekly · All Ministry Heads' },
      { key: 'rr3', name: 'Prayer Room',        meta: 'Daily · Open Access'         },
    ],
    recordings: [
      { key: 'rec1', name: 'Elder Board — Mar 9',    meta: '52 min · Notes available' },
      { key: 'rec2', name: 'Youth Ministry — Mar 12',meta: '30 min · Summary ready'   },
    ],
    frequentContacts: [
      { key: 'fc1', initials: 'PJ', uri: 'https://i.pravatar.cc/100?img=40', name: 'Pastor J.',  role: 'Lead Pastor',        orgTag: 'ICCLA' },
      { key: 'fc2', initials: 'EM', uri: 'https://i.pravatar.cc/100?img=44', name: 'Elder M.',   role: 'Board Elder',         orgTag: 'ICCLA' },
      { key: 'fc3', initials: 'DT', uri: 'https://i.pravatar.cc/100?img=52', name: 'Deacon T.', role: 'Operations Director', orgTag: 'ICCLA' },
    ],
    departments: [
      { key: 'pastoral',  label: 'Pastoral Team',     count: 5,   members: [
        { key: 'm1', initials: 'PJ', uri: 'https://i.pravatar.cc/100?img=40', name: 'Pastor J.',  role: 'Lead Pastor',          orgTag: 'ICCLA' },
        { key: 'm2', initials: 'EM', uri: 'https://i.pravatar.cc/100?img=44', name: 'Elder M.',   role: 'Board Elder',           orgTag: 'ICCLA' },
        { key: 'm3', initials: 'DT', uri: 'https://i.pravatar.cc/100?img=52', name: 'Deacon T.', role: 'Operations Director',   orgTag: 'ICCLA' },
      ]},
      { key: 'ministry',  label: 'Ministry Leaders',  count: 12,  members: [
        { key: 'm4', initials: 'KB', uri: 'https://i.pravatar.cc/100?img=48', name: 'K. Brown',  role: 'Youth Ministry Director', orgTag: 'ICCLA' },
        { key: 'm5', initials: 'MD', uri: 'https://i.pravatar.cc/100?img=43', name: 'M. Davis',  role: 'Music Director',           orgTag: 'ICCLA' },
      ]},
      { key: 'members',   label: 'Members',            count: 247, members: [
        { key: 'm6', initials: 'SA', uri: 'https://i.pravatar.cc/100?img=45', name: 'S. Adams',  role: 'Office Administrator',    orgTag: 'ICCLA' },
      ]},
    ],
  },

  'Personal': {
    orgLabel: 'Personal',
    voicemails: [],
    favorites: [],
    missedPriority: [],
    recentCalls: [],
    startingSoon: [],
    scheduledToday: [],
    recurringRooms: [],
    recordings: [],
    frequentContacts: [],
    departments: [],
  },
};

// LU Men's Basketball — sports-specific departments
ORG_PHONE_DATA["LU Men's Basketball"] = {
  ...ORG_PHONE_DATA['Lincoln University'],
  orgLabel: "LU Basketball",
  frequentContacts: [
    { key: 'fc1', initials: 'CD', uri: 'https://i.pravatar.cc/100?img=15', name: 'Coach Davis',   role: 'Defensive Coordinator', orgTag: "LU Basketball" },
    { key: 'fc2', initials: 'SR', uri: 'https://i.pravatar.cc/100?img=37', name: 'S. Roberts',    role: 'Offensive Coordinator', orgTag: "LU Basketball" },
    { key: 'fc3', initials: 'PJ', uri: 'https://i.pravatar.cc/100?img=38', name: 'P. Johnson',    role: 'Head Trainer',          orgTag: "LU Basketball" },
  ],
  departments: [
    { key: 'coaching', label: 'Coaching Staff',  count: 8,  members: [
      { key: 'm1', initials: 'CD', uri: 'https://i.pravatar.cc/100?img=15', name: 'Coach Davis',   role: 'Defensive Coordinator', orgTag: "LU Basketball" },
      { key: 'm2', initials: 'SR', uri: 'https://i.pravatar.cc/100?img=37', name: 'S. Roberts',    role: 'Offensive Coordinator', orgTag: "LU Basketball" },
      { key: 'm3', initials: 'PJ', uri: 'https://i.pravatar.cc/100?img=38', name: 'P. Johnson',    role: 'Head Trainer',          orgTag: "LU Basketball" },
      { key: 'm4', initials: 'TW', uri: 'https://i.pravatar.cc/100?img=20', name: 'T. Williams',   role: 'WR Coach',              orgTag: "LU Basketball" },
    ]},
    { key: 'admin',    label: 'Administration',  count: 12, members: [
      { key: 'm5', initials: 'MT', uri: 'https://i.pravatar.cc/100?img=35', name: 'Mike Thompson', role: 'Athletic Director',     orgTag: "LU Basketball" },
    ]},
    { key: 'roster',   label: 'Roster',          count: 85, members: [
      { key: 'm6', initials: 'JW', uri: 'https://i.pravatar.cc/100?img=20', name: 'J. Williams',   role: 'Wide Receiver',         orgTag: "LU Basketball" },
      { key: 'm7', initials: 'RB', uri: 'https://i.pravatar.cc/100?img=18', name: 'R. Brown',      role: 'Quarterback',           orgTag: "LU Basketball" },
    ]},
  ],
};

function getPhoneData(orgName: string | undefined): OrgPhoneData {
  if (!orgName) return ORG_PHONE_DATA['KaNeXT'];
  return ORG_PHONE_DATA[orgName] ?? ORG_PHONE_DATA['KaNeXT'];
}

// ─── Panel scope data ─────────────────────────────────────────────────────────

const PANEL_SCOPES = [
  { key: 'this-org',  label: 'This Org',        count: 'Active Org' },
  { key: 'all-mode',  label: 'All Orgs in Mode', count: '3 orgs'    },
  { key: 'all-modes', label: 'All Modes',         count: '5 orgs'    },
];

// ─── Dialer keys ──────────────────────────────────────────────────────────────

const DIALER_KEYS = [
  { digit: '1', sub: '' },   { digit: '2', sub: 'ABC' }, { digit: '3', sub: 'DEF'  },
  { digit: '4', sub: 'GHI' },{ digit: '5', sub: 'JKL' }, { digit: '6', sub: 'MNO'  },
  { digit: '7', sub: 'PQRS'},{ digit: '8', sub: 'TUV' }, { digit: '9', sub: 'WXYZ' },
  { digit: '✱', sub: '' },   { digit: '0', sub: '+'   }, { digit: '#', sub: ''     },
];

// ─── Phone Side Panel ─────────────────────────────────────────────────────────

function PhoneSidePanel({
  translateX,
  panelWidth,
  onOpen,
  onClose,
  voicemails,
}: {
  translateX: Animated.Value;
  panelWidth: number;
  onOpen: () => void;
  onClose: () => void;
  voicemails: OrgPhoneData['voicemails'];
}) {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const [activeScope, setActiveScope] = useState('this-org');

  const panelTranslate = translateX.interpolate({
    inputRange: [0, panelWidth],
    outputRange: [-panelWidth, 0],
    extrapolate: 'clamp',
  });

  return (
    <>
      {/* Left-edge visible tab */}
      <Pressable
        style={[panelS.tab, { top: insets.top + 80, backgroundColor: C.surface, borderColor: C.separator }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onOpen(); }}
      >
        <IconSymbol name="chevron.right" size={10} color={C.muted} />
      </Pressable>

      {/* Slide-in panel */}
      <Animated.View
        style={[
          panelS.panel,
          {
            width: panelWidth,
            backgroundColor: C.bg,
            borderRightColor: C.separator,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            transform: [{ translateX: panelTranslate }],
          },
        ]}
      >
        {/* Header */}
        <View style={[panelS.header, { borderBottomColor: C.separator }]}>
          <Text style={[panelS.title, { color: C.label }]}>Phone</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <IconSymbol name="xmark" size={16} color={C.secondary} />
          </Pressable>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 36 }}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Context Scope */}
          <Text style={[panelS.sectionTitle, { color: C.muted }]}>CONTEXT SCOPE</Text>
          {PANEL_SCOPES.map(scope => {
            const isActive = activeScope === scope.key;
            return (
              <Pressable
                key={scope.key}
                style={[
                  panelS.scopeBtn,
                  { borderColor: isActive ? C.label : C.separator },
                  isActive && { backgroundColor: 'rgba(0,0,0,0.03)' },
                ]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveScope(scope.key); }}
              >
                <Text style={[panelS.scopeLabel, { color: isActive ? C.label : C.secondary, fontWeight: isActive ? '600' : '500' }]}>
                  {scope.label}
                </Text>
                <View style={[panelS.scopeCount, { backgroundColor: C.surfacePressed }]}>
                  <Text style={[panelS.scopeCountText, { color: C.muted }]}>{scope.count}</Text>
                </View>
              </Pressable>
            );
          })}

          <View style={[panelS.divider, { backgroundColor: C.separator }]} />

          {/* 2. Voicemail */}
          <View style={panelS.vmHeader}>
            <Text style={[panelS.sectionTitle, { color: C.muted, marginBottom: 0 }]}>VOICEMAIL</Text>
            <View style={panelS.vmBadge}>
              <Text style={panelS.vmBadgeText}>2</Text>
            </View>
          </View>
          <View style={{ height: 10 }} />
          {voicemails.map(vm => (
            <View key={vm.key} style={[panelS.vmItem, { backgroundColor: C.surfacePressed, borderColor: C.separator }]}>
              <View style={panelS.vmTop}>
                <Text style={[panelS.vmName, { color: C.label }]}>{vm.name}</Text>
                <Text style={[panelS.vmTime, { color: C.muted }]}>{vm.time}</Text>
              </View>
              <Text style={[panelS.vmTranscript, { color: C.secondary }]} numberOfLines={2}>
                {vm.transcript}
              </Text>
              <View style={panelS.vmActions}>
                {['Play', 'Call Back', 'Message'].map(action => (
                  <Pressable
                    key={action}
                    style={[panelS.vmBtn, { borderColor: C.separator }]}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  >
                    <Text style={[panelS.vmBtnText, { color: C.secondary }]}>{action}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}

          <View style={[panelS.divider, { backgroundColor: C.separator }]} />

          {/* 3. Settings */}
          <Text style={[panelS.sectionTitle, { color: C.muted }]}>SETTINGS</Text>
          {['Call Routing', 'Voicemail Rules', 'Blocked / Spam'].map(item => (
            <Pressable
              key={item}
              style={[panelS.settingsBtn, { backgroundColor: C.surfacePressed }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text style={[panelS.settingsBtnText, { color: C.label }]}>{item}</Text>
              <IconSymbol name="chevron.right" size={14} color={C.muted} />
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>
    </>
  );
}

const panelS = StyleSheet.create({
  tab: {
    position: 'absolute', left: 0, width: 18, height: 48,
    borderTopRightRadius: 10, borderBottomRightRadius: 10,
    borderWidth: 1, borderLeftWidth: 0,
    alignItems: 'center', justifyContent: 'center', zIndex: 100,
  },
  panel: {
    position: 'absolute', top: 0, left: 0, bottom: 0,
    borderRightWidth: StyleSheet.hairlineWidth, zIndex: 200,
    shadowColor: '#000', shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 20,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  sectionTitle: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginBottom: 10 },
  divider: { height: 1, marginVertical: 20 },
  scopeBtn: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 14, marginBottom: 6,
  },
  scopeLabel: { flex: 1, fontSize: 12.5 },
  scopeCount: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  scopeCountText: { fontSize: 11, fontWeight: '600' },
  vmHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  vmBadge: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: RED, alignItems: 'center', justifyContent: 'center',
  },
  vmBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  vmItem: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 8 },
  vmTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  vmName: { fontSize: 13, fontWeight: '600' },
  vmTime: { fontSize: 11 },
  vmTranscript: { fontSize: 12, lineHeight: 17, marginBottom: 8 },
  vmActions: { flexDirection: 'row', gap: 6 },
  vmBtn: { paddingHorizontal: 9, paddingVertical: 4, borderWidth: 1, borderRadius: 7 },
  vmBtnText: { fontSize: 10.5, fontWeight: '500' },
  settingsBtn: { flexDirection: 'row', alignItems: 'center', padding: 11, borderRadius: 10, marginBottom: 6 },
  settingsBtnText: { flex: 1, fontSize: 13, fontWeight: '500' },
});

// ─── Segmented Control ────────────────────────────────────────────────────────

type PhoneView = 'Calls' | 'Meetings' | 'Contacts';
const PHONE_VIEWS: PhoneView[] = ['Calls', 'Meetings', 'Contacts'];

function ViewSwitcher({ active, onChange, C }: { active: PhoneView; onChange: (v: PhoneView) => void; C: ComponentColors }) {
  return (
    <View style={[switcherS.track, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
      {PHONE_VIEWS.map(v => {
        const isActive = v === active;
        return (
          <Pressable
            key={v}
            style={[switcherS.segment, isActive && [switcherS.segmentActive, { backgroundColor: C.bg }]]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onChange(v); }}
          >
            <Text style={[switcherS.label, { color: isActive ? C.label : C.secondary }, isActive && switcherS.labelActive]}>
              {v}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const switcherS = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: 12, padding: 3, marginHorizontal: 20 },
  segment: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  segmentActive: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 4, elevation: 2,
  },
  label: { fontSize: 13.5, fontWeight: '500' },
  labelActive: { fontWeight: '600' },
});

// ─── Section Label ────────────────────────────────────────────────────────────

function SLabel({ title, C, first }: { title: string; C: ComponentColors; first?: boolean }) {
  return (
    <Text style={[slabelS.text, { color: C.muted, marginTop: first ? 6 : 14 }]}>
      {title.toUpperCase()}
    </Text>
  );
}

const slabelS = StyleSheet.create({
  text: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginBottom: 10 },
});

// ─── Calls View ───────────────────────────────────────────────────────────────

function CallsView({
  C,
  data,
  onCallInitiate,
  onLongPressRecent,
}: {
  C: ComponentColors;
  data: OrgPhoneData;
  onCallInitiate: (name: string, initials: string) => void;
  onLongPressRecent: (item: OrgPhoneData['recentCalls'][0], pageY: number) => void;
}) {
  return (
    <>
      {/* Favorites */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 14, paddingBottom: 16 }}
        style={{ marginBottom: 2 }}
      >
        {data.favorites.map(fav => (
          <Pressable
            key={fav.key}
            style={callS.favItem}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onCallInitiate(fav.name, fav.initials); }}
          >
            <View style={[callS.favAvatar, { backgroundColor: C.surfacePressed, borderColor: C.separator }]}>
              {fav.uri
                ? <Image source={{ uri: fav.uri }} style={callS.favAvatarImg} />
                : <Text style={[callS.favInitials, { color: C.secondary }]}>{fav.initials}</Text>
              }
              {fav.online && <View style={[callS.favOnline, { borderColor: C.bg }]} />}
            </View>
            <Text style={[callS.favName, { color: C.secondary }]} numberOfLines={1}>{fav.name}</Text>
            <Text style={[callS.favRole, { color: C.muted }]}>{fav.role}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Missed / Priority */}
      <SLabel title="Missed / Priority" C={C} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingBottom: 4 }}
      >
        {data.missedPriority.map(mp => (
          <View key={mp.key} style={[callS.missedCard, { backgroundColor: C.surfacePressed, borderColor: C.separator }]}>
            <Text style={[callS.missedType, { color: mp.urgency === 'crit' ? RED : ORANGE }]}>{mp.typeLabel}</Text>
            <Text style={[callS.missedTitle, { color: C.label }]}>{mp.title}</Text>
            <Text style={[callS.missedMeta, { color: C.secondary }]}>{mp.meta}</Text>
            <Pressable
              style={[callS.missedAction, { borderColor: C.separator }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text style={[callS.missedActionText, { color: C.label }]}>{mp.action}</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>

      {/* Recent Calls */}
      <SLabel title="Recent" C={C} />
      {data.recentCalls.map((call, idx) => {
        const isMissed   = call.callType === 'missed';
        const isIncoming = call.callType === 'incoming';
        const arrowIcon  = isMissed || isIncoming ? 'arrow.down.left' : 'arrow.up.right';
        const arrowColor = isMissed ? RED : isIncoming ? GREEN : C.muted;
        return (
          <View key={call.key}>
            {idx > 0 && <View style={[callS.separator, { backgroundColor: C.separator }]} />}
            <Pressable
              style={callS.recentRow}
              onLongPress={(e) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onLongPressRecent(call, e.nativeEvent.pageY); }}
              delayLongPress={400}
            >
              <View style={[callS.recentAvatar, { backgroundColor: C.surfacePressed, borderColor: C.separator }]}>
                {call.uri
                  ? <Image source={{ uri: call.uri }} style={callS.recentAvatarImg} />
                  : <Text style={[callS.recentInitials, { color: C.secondary }]}>{call.initials}</Text>
                }
              </View>
              <View style={callS.recentInfo}>
                <Text style={[callS.recentName, { color: isMissed ? RED : C.label }]} numberOfLines={1}>
                  {call.name}
                </Text>
                <View style={callS.recentMeta}>
                  <IconSymbol name={arrowIcon as any} size={11} color={arrowColor} />
                  <View style={[callS.badge, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
                    <Text style={[callS.badgeText, { color: C.secondary }]}>{call.badge}</Text>
                  </View>
                  {call.meta ? <Text style={[callS.metaText, { color: C.secondary }]}>{call.meta}</Text> : null}
                </View>
              </View>
              <View style={callS.recentRight}>
                <Text style={[callS.recentTime, { color: C.muted }]}>{call.time}</Text>
              </View>
            </Pressable>
          </View>
        );
      })}
      <View style={{ height: 100 }} />
    </>
  );
}

const callS = StyleSheet.create({
  favItem: { alignItems: 'center', gap: 5, width: 62 },
  favAvatar: {
    width: 52, height: 52, borderRadius: 26,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', position: 'relative',
    overflow: 'hidden',
  },
  favAvatarImg: { width: 52, height: 52 },
  favInitials: { fontSize: 17, fontWeight: '600' },
  favOnline: {
    position: 'absolute', bottom: 1, right: 1, width: 11, height: 11,
    borderRadius: 5.5, backgroundColor: GREEN, borderWidth: 2,
  },
  favName: { fontSize: 10.5, fontWeight: '500', textAlign: 'center', maxWidth: 62 },
  favRole: { fontSize: 9, textAlign: 'center' },
  missedCard: {
    minWidth: 170, maxWidth: 200, borderWidth: 1, borderRadius: 14,
    padding: 13, gap: 4,
  },
  missedType: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  missedTitle: { fontSize: 13.5, fontWeight: '500', lineHeight: 18 },
  missedMeta: { fontSize: 11.5, marginBottom: 6 },
  missedAction: { paddingHorizontal: 11, paddingVertical: 5, borderWidth: 1, borderRadius: 8, alignSelf: 'flex-start' },
  missedActionText: { fontSize: 11, fontWeight: '600' },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 64 },
  recentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  recentAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  recentAvatarImg: { width: 40, height: 40 },
  recentInitials: { fontSize: 13, fontWeight: '600' },
  recentInfo: { flex: 1, minWidth: 0 },
  recentName: { fontSize: 14, fontWeight: '500', marginBottom: 2 },
  recentMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  badge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 5 },
  badgeText: { fontSize: 10.5, fontWeight: '500' },
  metaText: { fontSize: 11.5 },
  recentRight: { alignItems: 'flex-end', gap: 6 },
  recentTime: { fontSize: 11.5 },
  callBtn: { width: 34, height: 34, borderWidth: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});

// ─── Meetings View ────────────────────────────────────────────────────────────

function MeetingsView({ C, data }: { C: ComponentColors; data: OrgPhoneData }) {
  return (
    <>
      {/* Starting Soon */}
      <SLabel title="Starting Soon" C={C} first />
      {data.startingSoon.map(m => (
        <View key={m.key} style={[mtgS.card, { backgroundColor: C.surfacePressed, borderColor: C.separator }]}>
          <Text style={[mtgS.countdown, { color: ORANGE }]}>{m.countdown}</Text>
          <View style={mtgS.cardTop}>
            <Text style={[mtgS.cardTitle, { color: C.label }]}>{m.title}</Text>
            <Text style={[mtgS.cardTime, { color: C.muted }]}>{m.time}</Text>
          </View>
          <View style={mtgS.cardMeta}>
            <View style={[mtgS.badge, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
              <Text style={[mtgS.badgeText, { color: C.secondary }]}>{m.badge}</Text>
            </View>
            <Text style={[mtgS.cardParticipants, { color: C.secondary }]}>{m.participants} participants</Text>
          </View>
          <View style={mtgS.avatarRow}>
            {m.avatars.map((a, i) => (
              <View key={i} style={[mtgS.participantAvatar, { backgroundColor: C.surfacePressed, borderColor: C.bg }]}>
                <Text style={[mtgS.participantText, { color: C.secondary }]}>{a}</Text>
              </View>
            ))}
          </View>
          <Pressable
            style={[mtgS.joinBtn, { backgroundColor: GREEN }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          >
            <Text style={mtgS.joinBtnText}>Join Now</Text>
          </Pressable>
        </View>
      ))}

      {/* Scheduled Today */}
      <SLabel title="Scheduled Today" C={C} />
      {data.scheduledToday.map(m => (
        <View key={m.key} style={[mtgS.card, { backgroundColor: C.surfacePressed, borderColor: C.separator }]}>
          <View style={mtgS.cardTop}>
            <Text style={[mtgS.cardTitle, { color: C.label }]}>{m.title}</Text>
            <Text style={[mtgS.cardTime, { color: C.muted }]}>{m.time}</Text>
          </View>
          <View style={[mtgS.cardMeta, { marginBottom: 10 }]}>
            <View style={[mtgS.badge, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
              <Text style={[mtgS.badgeText, { color: C.secondary }]}>{m.badge}</Text>
            </View>
            <Text style={[mtgS.cardParticipants, { color: C.secondary }]}>{m.participants} participants</Text>
          </View>
          <Pressable
            style={[mtgS.joinBtn, { backgroundColor: C.surfacePressed, borderWidth: 1, borderColor: C.separator }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Text style={[mtgS.joinBtnText, { color: C.label }]}>View Details</Text>
          </Pressable>
        </View>
      ))}

      {/* Start Meeting */}
      <SLabel title="Start Meeting" C={C} />
      <View style={mtgS.startRow}>
        {[
          { label: 'Video Room', sub: 'Start instantly', icon: 'video.fill' },
          { label: 'Audio Room', sub: 'Voice only',      icon: 'phone.fill' },
        ].map(btn => (
          <Pressable
            key={btn.label}
            style={[mtgS.startBtn, { backgroundColor: C.surfacePressed, borderColor: C.separator }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name={btn.icon as any} size={24} color={C.label} />
            <Text style={[mtgS.startLabel, { color: C.label }]}>{btn.label}</Text>
            <Text style={[mtgS.startSub, { color: C.muted }]}>{btn.sub}</Text>
          </Pressable>
        ))}
      </View>

      {/* Recurring Rooms */}
      <SLabel title="Recurring Rooms" C={C} />
      {data.recurringRooms.map((room, idx) => (
        <View key={room.key}>
          {idx > 0 && <View style={[mtgS.separator, { backgroundColor: C.separator }]} />}
          <View style={mtgS.roomRow}>
            <View style={[mtgS.roomIcon, { backgroundColor: C.surfacePressed, borderColor: C.separator }]}>
              <IconSymbol name="person.2.fill" size={16} color={C.secondary} />
            </View>
            <View style={mtgS.roomInfo}>
              <Text style={[mtgS.roomName, { color: C.label }]}>{room.name}</Text>
              <Text style={[mtgS.roomMeta, { color: C.secondary }]}>{room.meta}</Text>
            </View>
            <Pressable
              style={[mtgS.roomJoin, { borderColor: C.separator }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text style={[mtgS.roomJoinText, { color: C.label }]}>Join</Text>
            </Pressable>
          </View>
        </View>
      ))}

      {/* Recordings */}
      <SLabel title="Recordings" C={C} />
      {data.recordings.map((rec, idx) => (
        <View key={rec.key}>
          {idx > 0 && <View style={[mtgS.separator, { backgroundColor: C.separator }]} />}
          <Pressable style={mtgS.roomRow} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <View style={[mtgS.recIcon, { backgroundColor: 'rgba(217,54,54,0.06)' }]}>
              <IconSymbol name="play.circle.fill" size={16} color={RED} />
            </View>
            <View style={mtgS.roomInfo}>
              <Text style={[mtgS.roomName, { color: C.label }]}>{rec.name}</Text>
              <Text style={[mtgS.roomMeta, { color: C.secondary }]}>{rec.meta}</Text>
            </View>
          </Pressable>
        </View>
      ))}

      <View style={{ height: 80 }} />
    </>
  );
}

const mtgS = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 8 },
  countdown: { fontSize: 11, fontWeight: '600', marginBottom: 5 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 },
  cardTitle: { fontSize: 14, fontWeight: '600', lineHeight: 19, flex: 1, marginRight: 8 },
  cardTime: { fontSize: 12, flexShrink: 0 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  badgeText: { fontSize: 11, fontWeight: '500' },
  cardParticipants: { fontSize: 12 },
  avatarRow: { flexDirection: 'row', marginBottom: 10 },
  participantAvatar: {
    width: 26, height: 26, borderRadius: 13, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', marginLeft: -8,
  },
  participantText: { fontSize: 9, fontWeight: '600' },
  joinBtn: { paddingVertical: 7, borderRadius: 9, alignItems: 'center' },
  joinBtnText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  startRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  startBtn: { flex: 1, padding: 14, borderWidth: 1, borderRadius: 12, alignItems: 'center', gap: 5 },
  startLabel: { fontSize: 12, fontWeight: '600' },
  startSub: { fontSize: 10 },
  separator: { height: StyleSheet.hairlineWidth },
  roomRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  roomIcon: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  recIcon:  { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  roomInfo: { flex: 1, minWidth: 0 },
  roomName: { fontSize: 13.5, fontWeight: '500' },
  roomMeta: { fontSize: 11.5, marginTop: 1 },
  roomJoin: { paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderRadius: 8 },
  roomJoinText: { fontSize: 11, fontWeight: '600' },
});

// ─── Contacts View ────────────────────────────────────────────────────────────

function ContactRow({ contact, C, onPress }: { contact: ContactEntry; C: ComponentColors; onPress: () => void }) {
  return (
    <Pressable style={contS.contactRow} onPress={onPress}>
      <View style={[contS.contactAvatar, { backgroundColor: C.surfacePressed, borderColor: C.separator }]}>
        {contact.uri
          ? <Image source={{ uri: contact.uri }} style={contS.contactAvatarImg} />
          : <Text style={[contS.contactInitials, { color: C.secondary }]}>{contact.initials}</Text>
        }
      </View>
      <View style={contS.contactInfo}>
        <Text style={[contS.contactName, { color: C.label }]}>{contact.name}</Text>
        <View style={contS.contactMeta}>
          <Text style={[contS.contactRole, { color: C.secondary }]} numberOfLines={1}>{contact.role}</Text>
          {contact.orgTag ? (
            <View style={[contS.orgTag, { backgroundColor: C.surfacePressed }]}>
              <Text style={[contS.orgTagText, { color: C.muted }]}>{contact.orgTag}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function ContactsView({ C, data, onCallInitiate }: { C: ComponentColors; data: OrgPhoneData; onCallInitiate: (name: string, initials: string) => void }) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const openContact = (contact: ContactEntry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedContact(contact);
  };

  const hasFrequent = data.frequentContacts.length > 0;
  const hasDepts = data.departments.length > 0;

  // Search: flatten all contacts across frequent + all dept members
  const allContacts = useMemo<ContactEntry[]>(() => {
    const seen = new Set<string>();
    const result: ContactEntry[] = [];
    for (const c of data.frequentContacts) { if (!seen.has(c.key)) { seen.add(c.key); result.push(c); } }
    for (const dept of data.departments) {
      for (const c of dept.members) { if (!seen.has(c.key)) { seen.add(c.key); result.push(c); } }
    }
    return result;
  }, [data]);

  const q = searchQuery.trim().toLowerCase();
  const searchResults = useMemo(() =>
    q.length === 0 ? [] : allContacts.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q) ||
      (c.orgTag ?? '').toLowerCase().includes(q)
    ), [q, allContacts]);

  return (
    <>
      {/* Search bar */}
      <View style={[contS.searchBar, { backgroundColor: C.surfacePressed, borderColor: C.separator }]}>
        <IconSymbol name="magnifyingglass" size={16} color={C.muted} />
        <TextInput
          style={[contS.searchInput, { color: C.label }]}
          placeholder="Search people, orgs, teams..."
          placeholderTextColor={C.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
            <IconSymbol name="xmark.circle.fill" size={16} color={C.muted} />
          </Pressable>
        )}
      </View>

      {/* Search results mode */}
      {q.length > 0 ? (
        searchResults.length === 0 ? (
          <Text style={[contS.emptySearch, { color: C.muted }]}>No results for "{searchQuery}"</Text>
        ) : (
          searchResults.map((contact, idx) => (
            <View key={contact.key}>
              {idx > 0 && <View style={[contS.separator, { backgroundColor: C.separator }]} />}
              <ContactRow contact={contact} C={C} onPress={() => openContact(contact)} />
            </View>
          ))
        )
      ) : (
        <>
          {/* Section 1 — Frequent (only if there's call history) */}
          {hasFrequent && (
            <>
              <SLabel title="Frequent" C={C} first />
              {data.frequentContacts.map((contact, idx) => (
                <View key={contact.key}>
                  {idx > 0 && <View style={[contS.separator, { backgroundColor: C.separator }]} />}
                  <ContactRow contact={contact} C={C} onPress={() => openContact(contact)} />
                </View>
              ))}
            </>
          )}

          {/* Section 2 — [Org Name] with departments */}
          <SLabel title={data.orgLabel} C={C} first={!hasFrequent} />
          {hasDepts ? (
            data.departments.map(dept => {
              const isExpanded = expandedGroups.includes(dept.key);
              return (
                <View key={dept.key} style={contS.orgGroup}>
                  <Pressable
                    style={contS.orgHeader}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleGroup(dept.key); }}
                  >
                    <Text style={[contS.orgHeaderText, { color: C.label }]}>{dept.label}</Text>
                    <Text style={[contS.orgCount, { color: C.muted }]}>{dept.count}</Text>
                  </Pressable>
                  {isExpanded && dept.members.map((contact, idx) => (
                    <View key={contact.key}>
                      {idx > 0 && <View style={[contS.separator, { backgroundColor: C.separator }]} />}
                      <ContactRow contact={contact} C={C} onPress={() => openContact(contact)} />
                    </View>
                  ))}
                </View>
              );
            })
          ) : (
            /* No departments — flat list (Personal mode) */
            allContacts.map((contact, idx) => (
              <View key={contact.key}>
                {idx > 0 && <View style={[contS.separator, { backgroundColor: C.separator }]} />}
                <ContactRow contact={contact} C={C} onPress={() => openContact(contact)} />
              </View>
            ))
          )}
        </>
      )}

      <View style={{ height: 80 }} />

      {/* Contact profile sheet */}
      <ContactProfileSheet
        contact={selectedContact}
        onClose={() => setSelectedContact(null)}
        C={C}
        onCallInitiate={onCallInitiate}
      />
    </>
  );
}

// ─── Contact Profile Sheet ─────────────────────────────────────────────────────

function ContactProfileSheet({
  contact,
  onClose,
  C,
  onCallInitiate,
}: {
  contact: ContactEntry | null;
  onClose: () => void;
  C: ComponentColors;
  onCallInitiate: (name: string, initials: string) => void;
}) {
  const actions = [
    { key: 'call',    icon: 'phone.fill' as const,    label: 'call'    },
    { key: 'video',   icon: 'video.fill' as const,    label: 'video'   },
    { key: 'message', icon: 'message.fill' as const,  label: 'message' },
    { key: 'mail',    icon: 'envelope.fill' as const, label: 'mail'    },
  ];

  return (
    <BottomSheet visible={!!contact} onClose={onClose} useModal>
      {contact && (
        <>
          {/* Avatar + name */}
          <View style={cdS.header}>
            <View style={[cdS.avatar, { backgroundColor: C.surfacePressed }]}>
              {contact.uri
                ? <Image source={{ uri: contact.uri }} style={cdS.avatarImg} />
                : <Text style={[cdS.avatarInitials, { color: C.secondary }]}>{contact.initials}</Text>
              }
            </View>
            <Text style={[cdS.name, { color: C.label }]}>{contact.name}</Text>
            <Text style={[cdS.role, { color: C.secondary }]}>{contact.role}</Text>
            {contact.orgTag && (
              <View style={[cdS.orgTagPill, { backgroundColor: C.surfacePressed }]}>
                <Text style={[cdS.orgTagText, { color: C.muted }]}>{contact.orgTag}</Text>
              </View>
            )}
          </View>

          {/* Action buttons */}
          <View style={cdS.actions}>
            {actions.map(a => (
              <Pressable
                key={a.key}
                style={[cdS.actionBtn, { backgroundColor: C.surfacePressed }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (a.key === 'call') { onClose(); onCallInitiate(contact.name, contact.initials); }
                }}
              >
                <IconSymbol name={a.icon} size={20} color={C.label} />
                <Text style={[cdS.actionLabel, { color: C.secondary }]}>{a.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Contact info */}
          <View style={[cdS.infoCard, { backgroundColor: C.surfacePressed }]}>
            {[
              { label: 'Number', value: '+1 (555) 000-0000' },
              { label: 'Email',  value: contact.name.toLowerCase().replace(/[^a-z]/g, '') + '@kanext.io' },
              { label: 'Handle', value: '@' + contact.name.toLowerCase().replace(/[^a-z0-9]/g, '') },
            ].map((row, idx, arr) => (
              <View key={row.label}>
                <View style={cdS.infoRow}>
                  <Text style={[cdS.infoLabel, { color: C.secondary }]}>{row.label}</Text>
                  <Text style={[cdS.infoValue, { color: C.label }]}>{row.value}</Text>
                </View>
                {idx < arr.length - 1 && <View style={[cdS.infoSep, { backgroundColor: C.separator }]} />}
              </View>
            ))}
          </View>
        </>
      )}
    </BottomSheet>
  );
}

const cdS = StyleSheet.create({
  header: { alignItems: 'center', paddingTop: 12, paddingBottom: 20, paddingHorizontal: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12, overflow: 'hidden' },
  avatarImg: { width: 80, height: 80 },
  avatarInitials: { fontSize: 28, fontWeight: '600' },
  name: { fontSize: 22, fontWeight: '600', marginBottom: 3 },
  role: { fontSize: 14, textAlign: 'center', marginBottom: 6 },
  orgTagPill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  orgTagText: { fontSize: 11, fontWeight: '500' },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 12, paddingHorizontal: 24, marginBottom: 24 },
  actionBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, gap: 4 },
  actionLabel: { fontSize: 11, fontWeight: '500' },
  infoCard: { marginHorizontal: 16, borderRadius: 12, overflow: 'hidden', marginBottom: 24 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 13 },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: '500' },
  infoSep: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
});

const contS = StyleSheet.create({
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 4,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 2 },
  emptySearch: { fontSize: 13, textAlign: 'center', paddingTop: 32 },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 64 },
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, gap: 12 },
  contactAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  contactAvatarImg: { width: 40, height: 40 },
  contactInitials: { fontSize: 13, fontWeight: '600' },
  contactInfo: { flex: 1, minWidth: 0 },
  contactName: { fontSize: 14, fontWeight: '500', marginBottom: 1 },
  contactMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  contactRole: { fontSize: 12 },
  orgTag: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 10 },
  orgTagText: { fontSize: 10, fontWeight: '500' },
  orgGroup: { marginBottom: 2 },
  orgHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10 },
  orgHeaderText: { flex: 1, fontSize: 13, fontWeight: '600' },
  orgCount: { fontSize: 11, fontWeight: '500' },
});

// ─── Dialer Sheet ─────────────────────────────────────────────────────────────

function DialerSheet({ visible, onClose, C }: { visible: boolean; onClose: () => void; C: ComponentColors }) {
  const [dialNum, setDialNum] = useState('');
  const { height: windowHeight } = useWindowDimensions();
  const centerPad = Math.max(0, (windowHeight * 0.9 - 60 - 380) / 2);

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal snapPoints={['90%']}>
      <View style={{ height: centerPad }} />
      <View style={dialerS.display}>
        <Text style={[dialerS.displayText, { color: dialNum ? C.label : C.muted }]}>
          {dialNum || 'Enter number'}
        </Text>
      </View>
      <View style={dialerS.grid}>
        {DIALER_KEYS.map(k => (
          <Pressable
            key={k.digit}
            style={[dialerS.key, { backgroundColor: C.surfacePressed }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setDialNum(prev => prev + k.digit); }}
          >
            <Text style={[dialerS.keyNum, { color: C.label }]}>{k.digit}</Text>
            {k.sub ? <Text style={[dialerS.keySub, { color: C.muted }]}>{k.sub}</Text> : null}
          </Pressable>
        ))}
      </View>
      <View style={dialerS.bottom}>
        <Pressable
          style={[dialerS.callBtn, { backgroundColor: C.label }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onClose(); }}
        >
          <IconSymbol name="video.fill" size={26} color={C.bg} />
        </Pressable>
        <Pressable
          style={[dialerS.callBtn, { backgroundColor: GREEN }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onClose(); }}
        >
          <IconSymbol name="phone.fill" size={26} color="#fff" />
        </Pressable>
        <Pressable style={dialerS.deleteBtn} onPress={() => setDialNum(prev => prev.slice(0, -1))}>
          <IconSymbol name="delete.left" size={22} color={C.secondary} />
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const dialerS = StyleSheet.create({
  display: { alignItems: 'center', justifyContent: 'center', minHeight: 44, marginBottom: 16 },
  displayText: { fontSize: 28, fontWeight: '300', letterSpacing: 0.04 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', maxWidth: 280, alignSelf: 'center', gap: 8, marginBottom: 16 },
  key: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', flexBasis: '30%' },
  keyNum: { fontSize: 24, fontWeight: '500', lineHeight: 28 },
  keySub: { fontSize: 8, fontWeight: '600', letterSpacing: 0.12, marginTop: 1 },
  bottom: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20, maxWidth: 280, alignSelf: 'center' },
  deleteBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  callBtn: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function PhoneScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const org = useOrganization();
  const phoneData = getPhoneData(org?.name);



  const [activeView, setActiveView]     = useState<PhoneView>('Calls');
  const [dialerVisible, setDialerVisible] = useState(false);
  const [menuData, setMenuData]         = useState<ContextMenuData | null>(null);

  const lastScrollY = useRef(0);
  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  const handleCallInitiate = useCallback((name: string, initials: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    initiateCall({ contactName: name, contactInitials: initials, mode: 'sports', type: 'audio' });
  }, []);

  const handleLongPressRecent = useCallback((item: OrgPhoneData['recentCalls'][0], pageY: number) => {
    setMenuData({
      title: item.name,
      subtitle: item.badge,
      initials: item.initials,
      pageY,
      actions: [
        { key: 'audio',   label: 'Audio Call',           icon: 'phone.fill'            },
        { key: 'video',   label: 'Video Call',            icon: 'video.fill'            },
        { key: 'message', label: 'Message',               icon: 'bubble.left.fill'      },
        { key: 'delete',  label: 'Delete from Recents',   icon: 'trash.fill', destructive: true },
      ],
      onAction: (key) => {
        if (key === 'audio') handleCallInitiate(item.name, item.initials);
      },
    });
  }, [handleCallInitiate]);

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      <View style={styles.content}>
        {/* Segmented control */}
        <View style={{ paddingTop: insets.top + 12, paddingBottom: 14 }}>
          <ViewSwitcher active={activeView} onChange={setActiveView} C={C} />
        </View>

        {/* Canvas */}
        <ScrollView
          style={styles.canvas}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10 }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {activeView === 'Calls'    && <CallsView    C={C} data={phoneData} onCallInitiate={handleCallInitiate} onLongPressRecent={handleLongPressRecent} />}
          {activeView === 'Meetings' && <MeetingsView C={C} data={phoneData} />}
          {activeView === 'Contacts' && <ContactsView C={C} data={phoneData} onCallInitiate={handleCallInitiate} />}
        </ScrollView>
      </View>

      {/* Floating dialer FAB — Calls view only */}
      {activeView === 'Calls' && !dialerVisible && (
        <Pressable
          style={[styles.fab, { bottom: insets.bottom + 90, backgroundColor: GREEN }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setDialerVisible(true); }}
        >
          <IconSymbol name="circle.grid.3x3.fill" size={26} color="#fff" />
        </Pressable>
      )}

      {/* Dialer bottom sheet */}
      <DialerSheet visible={dialerVisible} onClose={() => setDialerVisible(false)} C={C} />

      {/* Long press context menu */}
      <LongPressContextMenu data={menuData} onClose={() => setMenuData(null)} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
  canvas: { flex: 1 },
  fab: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 50,
  },
});
